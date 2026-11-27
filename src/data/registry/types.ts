export type RegistryGroup = 'magic-link' | 'footer-stack' | 'ecosystem'

export interface DomainEntry {
  id: string
  name: string
  url: string
  /** Optional explicit domain for favicon lookup when different from URL hostname */
  faviconDomain?: string
  /** Alternative magic-link tokens resolving to this entry (e.g. ['Skills', 'skills']) */
  aliases?: string[]
  groups: RegistryGroup[]
  /** Optional first-party static icon path (bypasses external domain favicon lookup) */
  logoOverride?: string
}

export interface FaviconManifestEntry {
  domain: string
  path: string
  source: 'html-icon' | 'favicon-ico' | 'apex-fallback' | 'google-s2'
  sourceUrl: string
  contentType: string
  bytes: number
  updatedAt: string
}

export type FaviconManifest = Record<string, FaviconManifestEntry>

export interface CompanyEntry {
  id: string
  name: string
  role: string
  url: string
  domain: string
  logo: string
  magicLinkLogo?: string
  timeline: string
  timelineVi?: string
  desc: string
  descVi?: string
  tags: string[]
  weight: number
}

export interface ClientEntry {
  id: string
  name: string
  url: string
  domain: string
  logo: string
  magicLinkLogo?: string
  viaCompanyId?: string
  viaLabel?: string
  viaLabelVi?: string
  timeline: string
  timelineVi?: string
  desc: string
  descVi?: string
  tags: string[]
  weight: number
  aliases?: string[]
}
