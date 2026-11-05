import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

// Allow local TLS bypass for corporate/firewall interception in dev
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export interface GitHubRepoRaw {
  name: string
  description: string | null
  url: string
  homepageUrl: string | null
  repositoryTopics?: { name: string }[] | null
  topics?: string[]
  stargazerCount?: number
  stargazers_count?: number
  forkCount?: number
  forks_count?: number
  primaryLanguage?: { name: string } | null
  language?: string | null
  isArchived?: boolean
  archived?: boolean
  isFork?: boolean
  fork?: boolean
  updatedAt?: string
}

export interface SchemaProject {
  name: string
  repo: string
  url: string
  link: string
  homepage: string | null
  description: string
  desc: string
  icon: string
  stars: number
  forks: number
  language: string | null
  topics: string[]
  category: string
  isArchived: boolean
  weight: number
}

// Canonical display titles mapping
const TITLE_MAP: Record<string, string> = {
  'operon': 'Operon',
  'store': 'Store',
  'id': 'Id',
  'console': 'Console',
  'skills-pack': 'Skills Pack',
  'storage': 'Storage Hub',
  'yak-map': 'Yak Map',
  'claude-agy': 'Claude-Agy',
  'releases': 'Releases',
  'cli': 'CLI',
  'browser': 'Browser',
  'cloud': 'Cloud',
  'faker': 'Faker',
  'docs': 'Docs',
}

// Repos to completely exclude from the public portfolio
const EXCLUDED_REPOS = new Set([
  'tuquet.com',
  'tuquet',
  'dotfiles',
  'install',
  'scoop-bucket',
  'relay',
  'lib', // per user decision: deleted from list
  'nhaateliertattoo.com', // per user decision: private customer repo
  'hugobbq.com', // per user decision: private customer repo
])

function detectIcon(name: string, lang: string | null, topics: string[]): string {
  const n = name.toLowerCase()
  const l = (lang || '').toLowerCase()

  if (n === 'operon') return 'i-simple-icons-rust'
  if (n === 'store') return 'i-carbon-shopping-cart'
  if (n === 'id') return 'i-simple-icons-supabase'
  if (n === 'console') return 'i-simple-icons-tauri'
  if (n === 'skills-pack') return 'i-carbon-tools'
  if (n === 'storage') return 'i-carbon-data-base'
  if (n === 'yak-map') return 'i-carbon-network-4'
  if (n === 'claude-agy') return 'i-simple-icons-anthropic'
  if (n === 'releases') return 'i-carbon-rocket'
  if (n === 'cli') return 'i-carbon-terminal'
  if (n === 'browser') return 'i-carbon-application-web'
  if (n === 'cloud') return 'i-carbon-cloud'
  if (n === 'faker') return 'i-carbon-id-management'
  if (n === 'docs') return 'i-carbon-notebook'

  if (topics.includes('claude') || topics.includes('ai')) return 'i-simple-icons-anthropic'
  if (topics.includes('tauri')) return 'i-simple-icons-tauri'
  if (topics.includes('vue3') || l === 'vue') return 'i-simple-icons-vuedotjs'
  if (topics.includes('supabase')) return 'i-simple-icons-supabase'

  if (l === 'rust') return 'i-simple-icons-rust'
  if (l === 'typescript') return 'i-simple-icons-typescript'
  if (l === 'javascript') return 'i-simple-icons-javascript'

  return 'i-carbon-code'
}

function resolveCategory(name: string, topics: string[]): string {
  const n = name.toLowerCase()

  // AI & Agent Systems
  if (n === 'skills-pack' || n === 'claude-agy' || topics.includes('agent-skills') || topics.includes('ai') || topics.includes('claude')) {
    return 'AI & Agent Systems'
  }

  // Developer Infrastructure
  if (n === 'yak-map' || n === 'releases' || n === 'docs' || topics.includes('tuquet-ops') || topics.includes('chatops') || topics.includes('alerting')) {
    return 'Developer Infrastructure'
  }

  // Core Ecosystem
  return 'Ecosystem'
}

// Fallback descriptions for repos that currently have empty descriptions on GitHub
const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  console: 'Central workstation desktop GUI and preferences engine built with Vue 3, Shadcn UI, and Tauri v2',
  releases: 'Automated release tracking and software distribution dashboard for Tuquet open-source software',
}

// Priority sort weight
const WEIGHT_ORDER: Record<string, number> = {
  'operon': 100,
  'store': 90,
  'id': 85,
  'console': 80,
  'storage': 75,
  'cli': 70,
  'browser': 65,
  'cloud': 55,
  'faker': 50,
  'skills-pack': 95,
  'claude-agy': 85,
  'yak-map': 80,
  'releases': 70,
  'docs': 60,
}

async function fetchGithubRepos(): Promise<GitHubRepoRaw[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'tuquet-portfolio-generator',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // 1. Try public GitHub REST API (returns only public repositories)
  try {
    const res = await fetch('https://api.github.com/users/tuquet/repos?per_page=100&type=all', { headers })
    if (res.ok) {
      const data = await res.json() as any[]
      return data.map(r => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepageUrl: r.homepage,
        topics: r.topics || [],
        stargazerCount: r.stargazers_count ?? 0,
        forkCount: r.forks_count ?? 0,
        primaryLanguage: r.language ? { name: r.language } : null,
        isArchived: r.archived ?? false,
        isFork: r.fork ?? false,
      }))
    }
  }
  catch {
    // fallback
  }

  // 2. Fallback to `gh` CLI
  try {
    const output = execSync('gh repo list tuquet --limit 100 --json name,description,url,homepageUrl,repositoryTopics,stargazerCount,forkCount,primaryLanguage,isArchived,isFork', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    const data = JSON.parse(output)
    if (Array.isArray(data) && data.length > 0) {
      return data.map(r => ({
        name: r.name,
        description: r.description,
        url: r.url,
        homepageUrl: r.homepageUrl,
        topics: (r.repositoryTopics || []).map((t: any) => t.name),
        stargazerCount: r.stargazerCount ?? 0,
        forkCount: r.forkCount ?? 0,
        primaryLanguage: r.primaryLanguage,
        isArchived: r.isArchived ?? false,
        isFork: r.isFork ?? false,
      }))
    }
  }
  catch {
    // fallback
  }

  return []
}

async function main() {
  console.log('Fetching repositories from GitHub API (SSOT)...')
  const repos = await fetchGithubRepos()
  console.log(`Fetched ${repos.length} raw repos from GitHub`)

  const projectList: SchemaProject[] = []

  for (const repo of repos) {
    if (repo.isFork) continue
    if (EXCLUDED_REPOS.has(repo.name.toLowerCase())) continue

    const topics = repo.topics || []

    // Exclude customer repos per user instruction
    if (topics.includes('customers')) continue

    const name = TITLE_MAP[repo.name.toLowerCase()] || repo.name
    const description = (repo.description && repo.description.trim()) || FALLBACK_DESCRIPTIONS[repo.name.toLowerCase()] || ''
    const language = repo.primaryLanguage?.name || null
    const stars = repo.stargazerCount ?? 0
    const forks = repo.forkCount ?? 0
    const isArchived = Boolean(repo.isArchived)
    const category = resolveCategory(repo.name, topics)
    const icon = detectIcon(repo.name, language, topics)
    const weight = WEIGHT_ORDER[repo.name.toLowerCase()] ?? 30
    const link = repo.homepageUrl || repo.url

    projectList.push({
      name,
      repo: `tuquet/${repo.name}`,
      url: repo.url,
      link,
      homepage: repo.homepageUrl || null,
      description,
      desc: description,
      icon,
      stars,
      forks,
      language,
      topics,
      category,
      isArchived,
      weight,
    })
  }

  // Sort by weight descending
  projectList.sort((a, b) => b.weight - a.weight)

  // Group into categories
  const categories: Record<string, SchemaProject[]> = {
    'Ecosystem': [],
    'AI & Agent Systems': [],
    'Developer Infrastructure': [],
  }

  const allTopicsSet = new Set<string>()

  for (const project of projectList) {
    if (!categories[project.category]) {
      categories[project.category] = []
    }
    categories[project.category].push(project)

    for (const t of project.topics) {
      allTopicsSet.add(t)
    }
  }

  // Prune empty categories
  for (const key of Object.keys(categories)) {
    if (categories[key].length === 0) {
      delete categories[key]
    }
  }

  const schemaOutput = {
    total: projectList.length,
    updatedAt: new Date().toISOString(),
    categories,
    allTopics: Array.from(allTopicsSet).sort((a, b) => a.localeCompare(b)),
  }

  const outputPath = path.resolve('src/data/projects-data.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(schemaOutput, null, 2), 'utf-8')

  console.log(`Generated 100% SSOT GitHub Projects to ${outputPath} (${projectList.length} repos across ${Object.keys(categories).length} categories).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
