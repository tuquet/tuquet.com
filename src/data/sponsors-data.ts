import { CLIENTS, COMPANIES, getCompanyNameMap, stripCompanySuffix } from './registry/index.ts'

export interface SponsorItem {
  id: string
  name: string
  tier: 'company' | 'client'
  role?: string
  via?: string
  viaVi?: string
  weight?: number
  link?: string
  logo: string
  domain?: string
  domainVi?: string
  timeline?: string
  timelineVi?: string
  desc?: string
  descVi?: string
  tags?: string[]
}

const companyNames = getCompanyNameMap()

export const sponsors: SponsorItem[] = [
  ...COMPANIES.map<SponsorItem>(company => ({
    id: company.id,
    name: company.name,
    tier: 'company',
    role: company.role,
    weight: company.weight,
    link: company.url,
    logo: company.logo,
    domain: company.domain,
    timeline: company.timeline,
    timelineVi: company.timelineVi,
    desc: company.desc,
    descVi: company.descVi,
    tags: company.tags,
  })),
  ...CLIENTS.map<SponsorItem>((client) => {
    const parentName = client.viaCompanyId && companyNames[client.viaCompanyId]
      ? stripCompanySuffix(companyNames[client.viaCompanyId])
      : undefined

    return {
      id: client.id,
      name: client.name,
      tier: 'client',
      via: client.viaLabel || (parentName ? `via ${parentName}` : undefined),
      viaVi: client.viaLabelVi || (parentName ? `qua ${parentName}` : undefined),
      weight: client.weight,
      link: client.url,
      logo: client.logo,
      domain: client.domain,
      timeline: client.timeline,
      timelineVi: client.timelineVi,
      desc: client.desc,
      descVi: client.descVi,
      tags: client.tags,
    }
  }),
].sort((a, b) => (b.weight || 0) - (a.weight || 0))
