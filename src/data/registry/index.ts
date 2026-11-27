import type { DomainEntry, FaviconManifest } from './types.ts'
import { CLIENTS, COMPANIES } from './career.ts'
import { DOMAIN_REGISTRY } from './domains.ts'
import rawFaviconManifest from './favicons.json' with { type: 'json' }

const faviconManifest = rawFaviconManifest as FaviconManifest

export { CLIENTS, COMPANIES } from './career.ts'
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
 * Resolve the authentic logo for a URL or domain using the synced build-time
 * manifest first, falling back to Google S2 when not yet cached locally.
 */
export function resolveDomainFavicon(urlOrDomain: string, size = 128): string {
  const host = extractDomain(urlOrDomain)
  if (!host)
    return ''

  const direct = faviconManifest[host]
  if (direct?.path)
    return direct.path

  const apex = getApexDomain(host)
  if (apex !== host && faviconManifest[apex]?.path)
    return faviconManifest[apex].path

  return googleS2Url(host, size)
}

export function resolveEntryLogo(entry: Pick<DomainEntry, 'url' | 'faviconDomain' | 'logoOverride'>, size = 128): string {
  if (entry.logoOverride)
    return entry.logoOverride
  return resolveDomainFavicon(entry.faviconDomain || entry.url, size)
}

/**
 * Build canonical MagicLink map for `markdown-it-magic-link`.
 * Every entry automatically resolves its logo from its live domain via the synced manifest.
 */
export function buildMagicLinksMap(): Record<string, { link: string, imageUrl: string }> {
  const map: Record<string, { link: string, imageUrl: string }> = {}

  for (const entry of DOMAIN_REGISTRY) {
    if (!entry.groups.includes('magic-link'))
      continue
    const resolved = {
      link: entry.url,
      imageUrl: resolveEntryLogo(entry),
    }
    map[entry.name] = resolved
    for (const alias of entry.aliases || []) {
      map[alias] = resolved
    }
  }

  // Register companies and prominent clients so `{CMC Global}`, `{VinFast}`, etc. stay 100% synced
  for (const company of COMPANIES) {
    const shortName = company.name.replace(/\s+(Tech\.\s*JSC|JSC|Group)$/i, '')
    const resolved = {
      link: company.url,
      imageUrl: company.magicLinkLogo || company.logo,
    }
    map[company.name] = resolved
    if (shortName !== company.name)
      map[shortName] = resolved
  }

  for (const client of CLIENTS) {
    const resolved = {
      link: client.url,
      imageUrl: client.magicLinkLogo || client.logo,
    }
    map[client.name] = resolved
    for (const alias of client.aliases || []) {
      map[alias] = resolved
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
