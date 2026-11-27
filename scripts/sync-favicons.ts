import fs from 'node:fs/promises'
import path from 'node:path'
import {
  CLIENTS,
  COMPANIES,
  DOMAIN_REGISTRY,
  extractDomain,
  getApexDomain,
  googleS2Url,
} from '../src/data/registry/index'
import type { FaviconManifest, FaviconManifestEntry } from '../src/data/registry/types'

const ROOT_DIR = path.resolve(import.meta.dirname, '..')
const FAVICONS_DIR = path.join(ROOT_DIR, 'public', 'favicons')
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'registry', 'favicons.json')
const MAX_ICON_BYTES = 512 * 1024
const SYNC_CONCURRENCY = 6

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

interface IconCandidate {
  url: string
  priority: number
}

function parseCliArgs() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const verify = args.includes('--verify')
  const includeCareer = args.includes('--all')
  const insecure = args.includes('--insecure') || process.env.ALLOW_INSECURE_TLS === '1'
  const domainArg = args.find(a => a.startsWith('--domain='))?.split('=')[1]?.toLowerCase()
  return { force, verify, includeCareer, insecure, domainArg }
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z0-9:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(tag)) !== null) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''
  }
  return attrs
}

function parseSizeScore(sizesAttr?: string): number {
  if (!sizesAttr)
    return 0
  if (sizesAttr.toLowerCase() === 'any')
    return 200
  const matches = sizesAttr.match(/(\d+)x(\d+)/gi) || []
  let max = 0
  for (const item of matches) {
    const [w] = item.toLowerCase().split('x').map(Number)
    if (w > max)
      max = w
  }
  return max
}

function extractIconCandidatesFromHtml(html: string, finalPageUrl: string): IconCandidate[] {
  const baseMatch = html.match(/<base\b[^>]*>/i)
  let baseUrl = finalPageUrl
  if (baseMatch) {
    const baseAttrs = parseAttributes(baseMatch[0])
    if (baseAttrs.href) {
      try {
        baseUrl = new URL(baseAttrs.href, finalPageUrl).toString()
      }
      catch {
        // ignore invalid base href
      }
    }
  }

  const candidates: IconCandidate[] = []
  const linkTags = html.match(/<link\b[^>]*>/gi) || []

  for (const tag of linkTags) {
    const attrs = parseAttributes(tag)
    const rel = (attrs.rel || '').toLowerCase()
    const href = (attrs.href || '').trim()
    if (!href || href.startsWith('data:'))
      continue

    const tokens = rel.split(/\s+/)
    const isIcon = tokens.includes('icon') || rel === 'shortcut icon'
    const isApple = tokens.includes('apple-touch-icon') || tokens.includes('apple-touch-icon-precomposed')
    if (!isIcon && !isApple)
      continue

    let resolvedUrl: string
    try {
      resolvedUrl = new URL(href, baseUrl).toString()
    }
    catch {
      continue
    }

    const type = (attrs.type || '').toLowerCase()
    const ext = resolvedUrl.split('?')[0].toLowerCase()
    const sizeScore = parseSizeScore(attrs.sizes)

    let priority = 50
    if (isIcon)
      priority += 70
    if (isApple)
      priority += 15
    if (type.includes('svg') || ext.endsWith('.svg'))
      priority += 60
    else if (type.includes('png') || ext.endsWith('.png'))
      priority += 40
    else if (ext.endsWith('.webp'))
      priority += 30
    else if (ext.endsWith('.ico'))
      priority += 10

    if (sizeScore > 0 && sizeScore <= 16)
      priority -= 30
    else
      priority += Math.min(sizeScore, 192) / 4

    candidates.push({ url: resolvedUrl, priority })
  }

  return candidates.sort((a, b) => b.priority - a.priority)
}

function detectImageExtension(buf: Uint8Array, contentType: string, url: string): string | null {
  const ct = contentType.toLowerCase()
  const cleanUrl = url.split('?')[0].toLowerCase()

  // Reject HTML / XML / JSON disguised responses
  const headText = Buffer.from(buf.slice(0, 4096)).toString('utf-8').trimStart()
  if (/^(<!doctype html|<html\b|\{)/i.test(headText))
    return null

  // SVG (verify actual <svg tag presence so misleading Content-Type errors aren't saved as SVG)
  if (/<svg[\s>]/i.test(headText) && (ct.includes('svg') || cleanUrl.endsWith('.svg') || /^<(svg|\?xml|!--)/i.test(headText)))
    return 'svg'

  // PNG magic bytes: 89 50 4E 47
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)
    return 'png'

  // ICO magic bytes: 00 00 01 00
  if (buf.length >= 4 && buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00)
    return 'ico'

  // WebP: RIFF....WEBP
  if (buf.length >= 12 && Buffer.from(buf.slice(0, 4)).toString('ascii') === 'RIFF' && Buffer.from(buf.slice(8, 12)).toString('ascii') === 'WEBP')
    return 'webp'

  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)
    return 'jpg'

  // GIF: GIF8
  if (buf.length >= 4 && Buffer.from(buf.slice(0, 4)).toString('ascii') === 'GIF8')
    return 'gif'

  if (ct.startsWith('image/')) {
    if (ct.includes('icon'))
      return 'ico'
    if (ct.includes('png'))
      return 'png'
    if (ct.includes('webp'))
      return 'webp'
    if (ct.includes('jpeg') || ct.includes('jpg'))
      return 'jpg'
  }

  return null
}

/**
 * Strip active script vectors from third-party SVGs before persisting to `public/favicons/`.
 */
function sanitizeSvg(buf: Uint8Array): Uint8Array | null {
  const raw = Buffer.from(buf).toString('utf-8')
  const cleaned = raw
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/\s*>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\b((?:xlink:)?href)\s*=\s*(?:"\s*(?:javascript|data:text\/html)[^"]*"|'\s*(?:javascript|data:text\/html)[^']*')/gi, '$1=""')

  if (!/<svg[\s>]/i.test(cleaned))
    return null
  return Uint8Array.from(Buffer.from(cleaned, 'utf-8'))
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,image/*,*/*;q=0.8',
      },
    })
  }
  finally {
    clearTimeout(timer)
  }
}

async function tryDownloadImage(url: string): Promise<{ buf: Uint8Array, ext: string, contentType: string, finalUrl: string } | null> {
  try {
    const res = await fetchWithTimeout(url, 8000)
    if (!res.ok)
      return null
    const contentLength = Number(res.headers.get('content-length') || '0')
    if (contentLength > MAX_ICON_BYTES)
      return null
    const arrayBuf = await res.arrayBuffer()
    let buf: Uint8Array = new Uint8Array(arrayBuf)
    if (buf.length < 32 || buf.length > MAX_ICON_BYTES)
      return null
    const contentType = res.headers.get('content-type') || ''
    const ext = detectImageExtension(buf, contentType, res.url || url)
    if (!ext)
      return null
    if (ext === 'svg') {
      const safeBuf = sanitizeSvg(buf)
      if (!safeBuf || safeBuf.length < 32)
        return null
      buf = safeBuf
    }
    return { buf, ext, contentType, finalUrl: res.url || url }
  }
  catch {
    return null
  }
}

async function fetchDomainFavicon(domain: string, pageUrl?: string): Promise<{
  buf: Uint8Array
  ext: string
  source: FaviconManifestEntry['source']
  sourceUrl: string
  contentType: string
} | null> {
  const targetPages = [
    pageUrl || `https://${domain}/`,
    `https://${domain}/`,
  ]
  const triedPages = new Set<string>()

  // 1. Inspect live HTML <link rel="icon"> from the page (respecting redirects & <base>)
  for (const page of targetPages) {
    if (triedPages.has(page))
      continue
    triedPages.add(page)

    try {
      const res = await fetchWithTimeout(page, 8000)
      if (res.ok) {
        const ct = (res.headers.get('content-type') || '').toLowerCase()
        if (ct.includes('text/html') || ct.includes('application/xhtml')) {
          const html = await res.text()
          const candidates = extractIconCandidatesFromHtml(html, res.url || page)
          for (const candidate of candidates) {
            const img = await tryDownloadImage(candidate.url)
            if (img) {
              return {
                buf: img.buf,
                ext: img.ext,
                source: 'html-icon',
                sourceUrl: img.finalUrl,
                contentType: img.contentType,
              }
            }
          }
        }
      }
    }
    catch {
      // continue to direct favicon.ico
    }
  }

  // 2. Direct /favicon.ico on domain
  const directIco = await tryDownloadImage(`https://${domain}/favicon.ico`)
  if (directIco) {
    return {
      buf: directIco.buf,
      ext: directIco.ext,
      source: 'favicon-ico',
      sourceUrl: directIco.finalUrl,
      contentType: directIco.contentType,
    }
  }

  // 3. Apex domain fallback (e.g. `console.tuquet.com` -> `tuquet.com`, `hermes-agent.nousresearch.com` -> `nousresearch.com`)
  const apex = getApexDomain(domain)
  if (apex !== domain) {
    try {
      const res = await fetchWithTimeout(`https://${apex}/`, 8000)
      if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
        const html = await res.text()
        const candidates = extractIconCandidatesFromHtml(html, res.url || `https://${apex}/`)
        for (const candidate of candidates) {
          const img = await tryDownloadImage(candidate.url)
          if (img) {
            return {
              buf: img.buf,
              ext: img.ext,
              source: 'apex-fallback',
              sourceUrl: img.finalUrl,
              contentType: img.contentType,
            }
          }
        }
      }
    }
    catch {
      // ignore
    }

    const apexIco = await tryDownloadImage(`https://${apex}/favicon.ico`)
    if (apexIco) {
      return {
        buf: apexIco.buf,
        ext: apexIco.ext,
        source: 'apex-fallback',
        sourceUrl: apexIco.finalUrl,
        contentType: apexIco.contentType,
      }
    }
  }

  // 4. Google S2 Favicon fallback (high-res 128px)
  const s2 = await tryDownloadImage(googleS2Url(domain, 128))
  if (s2) {
    return {
      buf: s2.buf,
      ext: s2.ext,
      source: 'google-s2',
      sourceUrl: googleS2Url(domain, 128),
      contentType: s2.contentType,
    }
  }

  return null
}

async function readExistingManifest(): Promise<FaviconManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf-8')
    return JSON.parse(raw) as FaviconManifest
  }
  catch {
    return {}
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = Array.from<R>({ length: items.length })
  let nextIndex = 0

  async function runWorker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++
      results[idx] = await worker(items[idx])
    }
  }

  const poolSize = Math.min(Math.max(1, limit), items.length)
  await Promise.all(Array.from({ length: poolSize }, runWorker))
  return results
}

function collectStaticAssetPaths(): string[] {
  const paths = new Set<string>()
  for (const entry of DOMAIN_REGISTRY) {
    if (entry.logoOverride)
      paths.add(entry.logoOverride)
  }
  for (const item of [...COMPANIES, ...CLIENTS]) {
    if (item.logo)
      paths.add(item.logo)
    if (item.magicLinkLogo)
      paths.add(item.magicLinkLogo)
  }
  return Array.from(paths)
}

async function main() {
  const { force, verify, includeCareer, insecure, domainArg } = parseCliArgs()
  if (insecure) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }
  await fs.mkdir(FAVICONS_DIR, { recursive: true })
  const manifest = await readExistingManifest()

  // Collect unique domains from Registry
  const targetMap = new Map<string, { domain: string, pageUrl: string, label: string }>()

  for (const entry of DOMAIN_REGISTRY) {
    if (entry.logoOverride)
      continue
    const domain = extractDomain(entry.faviconDomain || entry.url)
    if (!domain)
      continue
    if (!targetMap.has(domain)) {
      targetMap.set(domain, { domain, pageUrl: entry.url, label: entry.name })
    }
  }

  if (includeCareer) {
    for (const item of [...COMPANIES, ...CLIENTS]) {
      const domain = extractDomain(item.domain || item.url)
      if (!domain || targetMap.has(domain))
        continue
      targetMap.set(domain, { domain, pageUrl: item.url, label: item.name })
    }
  }

  const targets = Array.from(targetMap.values()).filter(t => !domainArg || t.domain.includes(domainArg))

  if (verify) {
    let errors = 0
    for (const target of targets) {
      const existing = manifest[target.domain]
      if (!existing?.path || !existing.bytes) {
        console.error(`[favicons] MISSING manifest entry for ${target.domain} (${target.label})`)
        errors++
        continue
      }
      const diskPath = path.join(ROOT_DIR, 'public', existing.path.replace(/^\//, ''))
      try {
        await fs.access(diskPath)
      }
      catch {
        console.error(`[favicons] MISSING file on disk for ${target.domain}: ${diskPath}`)
        errors++
      }
    }

    if (!domainArg && !includeCareer) {
      for (const domain of Object.keys(manifest)) {
        if (!targetMap.has(domain)) {
          console.error(`[favicons] ORPHAN manifest entry not in DOMAIN_REGISTRY: ${domain}`)
          errors++
        }
      }
    }

    const staticAssets = collectStaticAssetPaths()
    for (const assetPath of staticAssets) {
      if (!assetPath.startsWith('/'))
        continue
      const diskPath = path.join(ROOT_DIR, 'public', assetPath.replace(/^\//, ''))
      try {
        await fs.access(diskPath)
      }
      catch {
        console.error(`[favicons] MISSING static registry asset on disk: ${diskPath}`)
        errors++
      }
    }

    if (errors > 0)
      process.exit(1)
    console.log(`[favicons] Verified ${targets.length} registry domains and ${staticAssets.length} static assets against local cache.`)
    return
  }

  console.log(`[favicons] Syncing ${targets.length} registry domains (force=${force}, concurrency=${SYNC_CONCURRENCY})...`)

  let synced = 0
  let skipped = 0
  let failed = 0

  await mapWithConcurrency(targets, SYNC_CONCURRENCY, async (target) => {
    const existing = manifest[target.domain]
    if (!force && existing?.path) {
      const diskPath = path.join(ROOT_DIR, 'public', existing.path.replace(/^\//, ''))
      try {
        await fs.access(diskPath)
        skipped++
        return
      }
      catch {
        // file missing on disk -> re-fetch
      }
    }

    const result = await fetchDomainFavicon(target.domain, target.pageUrl)
    if (!result) {
      console.warn(`[favicons] WARN: could not resolve favicon for ${target.domain} (${target.label})`)
      failed++
      return
    }

    // Remove stale extension files for the same domain before writing new one
    for (const oldExt of ['svg', 'png', 'ico', 'webp', 'jpg', 'gif']) {
      if (oldExt === result.ext)
        continue
      await fs.rm(path.join(FAVICONS_DIR, `${target.domain}.${oldExt}`), { force: true })
    }

    const filename = `${target.domain}.${result.ext}`
    const diskPath = path.join(FAVICONS_DIR, filename)
    await fs.writeFile(diskPath, result.buf)

    manifest[target.domain] = {
      domain: target.domain,
      path: `/favicons/${filename}`,
      source: result.source,
      sourceUrl: result.sourceUrl,
      contentType: result.contentType,
      bytes: result.buf.length,
      updatedAt: new Date().toISOString(),
    }

    synced++
    console.log(`[favicons] OK ${target.domain} -> /favicons/${filename} (${result.source}, ${result.buf.length}B)`)
  })

  let pruned = 0
  if (!domainArg) {
    for (const domain of Object.keys(manifest)) {
      if (targetMap.has(domain))
        continue
      const stale = manifest[domain]
      if (stale?.path) {
        const diskPath = path.join(ROOT_DIR, 'public', stale.path.replace(/^\//, ''))
        await fs.rm(diskPath, { force: true })
      }
      delete manifest[domain]
      pruned++
    }
  }

  // Sort manifest keys deterministically
  const sortedManifest: FaviconManifest = {}
  for (const key of Object.keys(manifest).sort((a, b) => a.localeCompare(b))) {
    sortedManifest[key] = manifest[key]
  }

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(sortedManifest, null, 2)}\n`, 'utf-8')
  console.log(`[favicons] Done. synced=${synced}, cached=${skipped}, pruned=${pruned}, failed=${failed}, total=${Object.keys(sortedManifest).length}`)
}

main().catch((err) => {
  console.error('[favicons] Fatal error:', err)
  process.exit(1)
})
