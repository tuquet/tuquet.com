import type { DomainEntry, FaviconManifest } from './types.ts'
import { AWARDS_AND_EDUCATION, CLIENTS, COMPANIES } from './career.ts'
import { DOMAIN_REGISTRY } from './domains.ts'
import rawFaviconManifest from './favicons.json' with { type: 'json' }

const faviconManifest = rawFaviconManifest as FaviconManifest

export { AWARDS_AND_EDUCATION, CLIENTS, COMPANIES } from './career.ts'
export { DOMAIN_REGISTRY } from './domains.ts'
export type * from './types.ts'

/**
 * Extract normalized hostname from a URL or bare domain string.
 * Preserves meaningful subdomains (e.g. `console.tuquet.com`) while stripping `www.`.
 */
export function extractDomain(urlOrDomain: string): string {
  const trimmed = (urlOrDomain || '').trim()
  if (!trimmed)
    return ''

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProtocol).hostname.replace(/^www\./i, '').toLowerCase()
  }
  catch {
    return trimmed.replace(/^https?:\/\//i, '').split('/')[0].replace(/^www\./i, '').toLowerCase()
  }
}

/**
 * Derive apex domain (best-effort) for subdomain fallback lookup.
 */
export function getApexDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.').filter(Boolean)
  if (parts.length <= 2)
    return hostname.toLowerCase()

  // Handle common ccTLD second-level domains like `.com.vn`, `.co.kr`, `.co.uk`
  const lastTwo = parts.slice(-2).join('.')
  if (/^(com|net|org|edu|gov|co)\.[a-z]{2}$/i.test(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.')
  }

  return parts.slice(-2).join('.')
}

export function googleS2Url(domain: string, size = 128): string {
  const clean = extractDomain(domain)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=${size}`
}

/**
 * Strip legal/corporate suffixes so display labels and magic-link short tokens stay consistent.
 */
export function stripCompanySuffix(name: string): string {
  return name.replace(/\s+(Tech\.\s*JSC|JSC|Group|Web Solutions)$/i, '')
}

/**
 * Resolve the authentic logo for a URL or domain using the synced build-time
 * manifest first, falling back to Google S2 when not yet cached locally.
 * Note: `size` only applies to the Google S2 fallback URL.
 */
export function resolveDomainFavicon(
  urlOrDomain: string,
  size = 128,
  manifest: FaviconManifest = faviconManifest,
): string {
  const host = extractDomain(urlOrDomain)
  if (!host)
    return ''

  const direct = manifest[host]
  if (direct?.path)
    return direct.path

  const apex = getApexDomain(host)
  if (apex !== host && manifest[apex]?.path)
    return manifest[apex].path

  return googleS2Url(host, size)
}

export function resolveEntryLogo(
  entry: Pick<DomainEntry, 'url' | 'faviconDomain' | 'logoOverride'>,
  size = 128,
  manifest: FaviconManifest = faviconManifest,
): string {
  if (entry.logoOverride)
    return entry.logoOverride
  return resolveDomainFavicon(entry.faviconDomain || entry.url, size, manifest)
}

export function getRegistryEntry(idOrUrl: string): DomainEntry | undefined {
  const byId = DOMAIN_REGISTRY.find(entry => entry.id === idOrUrl)
  if (byId)
    return byId
  const targetDomain = extractDomain(idOrUrl)
  if (!targetDomain)
    return undefined
  return DOMAIN_REGISTRY.find(entry => extractDomain(entry.url) === targetDomain)
}

export function resolveRegistryLogo(idOrUrl: string, size = 128): string {
  const entry = getRegistryEntry(idOrUrl)
  if (entry)
    return resolveEntryLogo(entry, size)
  return resolveDomainFavicon(idOrUrl, size)
}

function registerMagicToken(
  map: Record<string, { link: string, imageUrl: string }>,
  token: string,
  resolved: { link: string, imageUrl: string },
) {
  if (!token || map[token])
    return
  map[token] = resolved
}

/**
 * Build canonical MagicLink map for `markdown-it-magic-link`.
 * Every entry automatically resolves its logo from its live domain via the synced manifest.
 */
export function buildMagicLinksMap(manifest: FaviconManifest = faviconManifest): Record<string, { link: string, imageUrl: string }> {
  const map: Record<string, { link: string, imageUrl: string }> = {}

  for (const entry of DOMAIN_REGISTRY) {
    if (!entry.groups.includes('magic-link'))
      continue
    const resolved = {
      link: entry.url,
      imageUrl: resolveEntryLogo(entry, 128, manifest),
    }
    registerMagicToken(map, entry.name, resolved)
    for (const alias of entry.aliases || []) {
      registerMagicToken(map, alias, resolved)
    }
  }

  // Register companies and prominent clients so `{CMC Global}`, `{VinFast}`, etc. stay 100% synced
  for (const company of COMPANIES) {
    const shortName = stripCompanySuffix(company.name)
    const resolved = {
      link: company.url,
      imageUrl: company.magicLinkLogo || company.logo,
    }
    registerMagicToken(map, company.name, resolved)
    if (shortName !== company.name)
      registerMagicToken(map, shortName, resolved)
  }

  for (const client of CLIENTS) {
    const resolved = {
      link: client.url,
      imageUrl: client.magicLinkLogo || client.logo,
    }
    registerMagicToken(map, client.name, resolved)
    for (const alias of client.aliases || []) {
      registerMagicToken(map, alias, resolved)
    }
  }

  return map
}

export function getFooterStackItems() {
  return DOMAIN_REGISTRY
    .filter(entry => entry.groups.includes('footer-stack'))
    .map(entry => ({
      name: entry.name,
      link: entry.url,
      logo: resolveEntryLogo(entry, 64),
    }))
}

export function getCompanyNameMap(): Record<string, string> {
  return Object.fromEntries(COMPANIES.map(c => [c.id, c.name]))
}

export function getClientsByCompany(companyId: string, excludeIds: string[] = []) {
  const excluded = new Set(excludeIds)
  return CLIENTS.filter(client => client.viaCompanyId === companyId && !excluded.has(client.id))
}

export function getEcosystemModules() {
  return DOMAIN_REGISTRY.filter(
    entry => entry.groups.includes('ecosystem') && !['tuquet', 'operon'].includes(entry.id),
  )
}
