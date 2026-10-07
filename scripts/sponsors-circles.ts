import fs from 'node:fs/promises'
import { hierarchy, pack } from 'd3-hierarchy'
import { sponsors as _sponsors } from '../src/data/sponsors-data'

const amountMax = Math.max(..._sponsors.map((sponsor: any) => sponsor.weight || 20))
const RADIUS_MIN = 12
const RADIUS_MAX = 70

function lerp(a: number, b: number, t: number) {
  if (t < 0) return a
  return a + (b - a) * t
}

const sponsors = _sponsors.map((sponsor: any, idx: number) => ({
  id: sponsor.id || `sponsor-${idx}`,
  name: sponsor.name,
  tier: sponsor.tier,
  avatar: sponsor.logo,
  link: sponsor.link,
  domain: sponsor.domain,
  timeline: sponsor.timeline,
  desc: sponsor.desc,
  tags: sponsor.tags,
  weight: sponsor.weight || 20,
  org: sponsor.tier === 'special',
  radius: 0,
  position: { x: 0, y: 0 },
}))

const root = hierarchy({ id: 'root', children: sponsors } as any)
  .sum((d: any) => {
    if (!d.weight) return 0
    return 1 + lerp(RADIUS_MIN, RADIUS_MAX, (d.weight / amountMax) ** 1.1)
  })
  .sort((a, b) => (b.value || 0) - (a.value || 0))

const p = pack<any>().size([500, 500]).padding(4)
const circles = p(root).descendants().slice(1)

for (const circle of circles) {
  const sp = sponsors.find(s => s.id === circle.data.id)
  if (sp) {
    sp.position = { x: Math.round(circle.x * 10) / 10, y: Math.round(circle.y * 10) / 10 }
    sp.radius = Math.round(circle.r * 10) / 10
  }
}

await fs.mkdir('src/data', { recursive: true })
await fs.writeFile('src/data/sponsors-circles.json', JSON.stringify(sponsors, null, 2))
console.log('Generated src/data/sponsors-circles.json with', sponsors.length, 'circles')
