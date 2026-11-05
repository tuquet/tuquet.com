import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

// Allow local TLS bypass for corporate/firewall interception in dev
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

interface GitHubRepo {
  name: string
  full_name?: string
  description: string | null
  html_url?: string
  url?: string
  homepage?: string | null
  homepageUrl?: string | null
  topics?: string[]
  repositoryTopics?: { name: string }[]
  stargazers_count?: number
  stargazerCount?: number
  forks_count?: number
  forkCount?: number
  language?: string | null
  primaryLanguage?: { name: string } | null
  archived?: boolean
  isArchived?: boolean
  fork?: boolean
  isFork?: boolean
  updated_at?: string
}

export interface ProjectItem {
  name: string
  repo?: string
  link: string
  githubUrl?: string
  desc: string
  icon: string
  stars?: number
  forks?: number
  language?: string | null
  topics: string[]
  category: string
  weight?: number
}

// Map topic tag to Category
const TOPIC_CATEGORY_MAP: Record<string, string> = {
  'cat-ecosystem': 'Ecosystem',
  'tuquet-core': 'Ecosystem',
  'automation': 'Ecosystem',
  'browser-sandbox': 'Ecosystem',
  'cat-ai': 'AI & Agent Systems',
  'ai': 'AI & Agent Systems',
  'agent-skills': 'AI & Agent Systems',
  'claude': 'AI & Agent Systems',
  'antigravity': 'AI & Agent Systems',
  'cat-infra': 'Developer Infrastructure',
  'tuquet-ops': 'Developer Infrastructure',
  'chatops': 'Developer Infrastructure',
  'cloudflare-workers': 'Developer Infrastructure',
  'alerting': 'Developer Infrastructure',
  'cat-ui': 'Web UI & Primitives',
  'vue3': 'Web UI & Primitives',
  'tauri': 'Web UI & Primitives',
  'workstation': 'Web UI & Primitives',
  'customers': 'Client Solutions',
  'cat-client': 'Client Solutions',
}

// Curation dictionary to polish names, icons, and descriptions
const REPO_OVERRIDES: Record<string, Partial<ProjectItem>> = {
  'operon': {
    name: 'Operon',
    desc: 'Ultra-high performance distributed automation mesh and stealth browser sandbox runtime in Rust',
    icon: 'i-simple-icons-rust',
    category: 'Ecosystem',
    weight: 100,
  },
  'skills-pack': {
    name: 'Agent Skills Pack',
    desc: 'Curated production AI agent skills pack for Claude Code, Antigravity, and Cursor — one npm install away',
    icon: 'i-carbon-tools',
    category: 'AI & Agent Systems',
    weight: 90,
  },
  'claude-agy': {
    name: 'Claude-Agy',
    desc: 'Run Anthropic Claude Code CLI powered by Google Antigravity quotas with zero API token costs',
    icon: 'i-simple-icons-anthropic',
    category: 'AI & Agent Systems',
    weight: 85,
  },
  'bot': {
    name: 'Telegram ChatOps',
    desc: 'Tuquet ecosystem watchdog: 24/7 server monitoring, downtime alerts to Telegram, and incident management via chat',
    icon: 'i-simple-icons-telegram',
    category: 'Developer Infrastructure',
    weight: 80,
  },
  'id': {
    name: 'Identity Hub',
    desc: 'Centralized Identity, Authentication, and Entitlements Platform powered by Supabase with Row Level Security',
    icon: 'i-simple-icons-supabase',
    category: 'Ecosystem',
    weight: 75,
  },
  'console': {
    name: 'Workstation Console',
    desc: 'Central workstation desktop GUI and preferences engine built with Vue 3, Shadcn UI, and Tauri v2',
    icon: 'i-simple-icons-vuedotjs',
    category: 'Ecosystem',
    weight: 70,
  },
  'store': {
    name: 'Commerce Engine',
    desc: 'Medusa v2 e-commerce backend with Next.js Storefront, Docker orchestration, and multi-tenant catalog',
    icon: 'i-carbon-shopping-cart',
    category: 'Ecosystem',
    weight: 65,
  },
  'storage': {
    name: 'Storage Hub',
    desc: 'Multi-tenant cloud storage engine with atomic lease locking to sync antidetect browser profiles safely with zero egress fees',
    icon: 'i-carbon-data-base',
    category: 'Ecosystem',
    weight: 60,
  },
  'yak-map': {
    name: 'Yak Map',
    desc: 'Interactive visual architecture map that unravels monorepo dependencies and data flows at a glance',
    icon: 'i-carbon-network-4',
    category: 'Developer Infrastructure',
    weight: 55,
  },
  'lib': {
    name: 'Design System & UI',
    desc: 'Enterprise UI primitives, high-performance Data Tables, and Design System for Vue 3',
    icon: 'i-simple-icons-vuedotjs',
    category: 'Web UI & Primitives',
    weight: 50,
  },
  'releases': {
    name: 'Release Radar',
    desc: 'Automated release tracking and distribution dashboard for all Tuquet open-source software and tools',
    icon: 'i-carbon-rocket',
    category: 'Developer Infrastructure',
    weight: 45,
  },
}

// Subprojects / Monorepo packages that are showcased alongside repos
const MANUAL_SHOWCASE_PROJECTS: ProjectItem[] = [
  {
    name: 'Vue UI',
    link: 'https://github.com/tuquet/lib/tree/main/packages/vue-ui',
    desc: 'Production-ready Vue 3 component library built on Shadcn-Vue with dark mode out of the box',
    icon: 'i-simple-icons-vuedotjs',
    category: 'Web UI & Primitives',
    language: 'TypeScript',
    topics: ['vue3', 'ui', 'components'],
    weight: 40,
  },
  {
    name: 'Vue Table',
    link: 'https://github.com/tuquet/lib/tree/main/packages/vue-table',
    desc: 'High-performance virtualized data table for Vue 3 that smoothly renders massive datasets with zero lag',
    icon: 'i-carbon-data-table',
    category: 'Web UI & Primitives',
    language: 'TypeScript',
    topics: ['vue3', 'data-table', 'virtualization'],
    weight: 35,
  },
  {
    name: 'MD Export',
    link: 'https://github.com/tuquet/lib/tree/main/packages/md-export',
    desc: 'Export entire Markdown folders into publication-grade vector PDFs and high-res images with zero styling bugs',
    icon: 'i-carbon-document-pdf',
    category: 'Web UI & Primitives',
    language: 'TypeScript',
    topics: ['markdown', 'pdf', 'export'],
    weight: 30,
  },
  {
    name: 'Extension Runner',
    link: 'https://github.com/tuquet/lib/tree/main/packages/extension-runner',
    desc: 'Headless test runner to debug and execute Chrome extensions in automated CI/CD pipelines',
    icon: 'i-carbon-extensions',
    category: 'Web UI & Primitives',
    language: 'TypeScript',
    topics: ['chrome-extension', 'automation'],
    weight: 25,
  },
  {
    name: 'Lunar Calendar',
    link: 'https://github.com/tuquet/lib/tree/main/packages/lunar',
    desc: 'Astronomical Vietnamese Lunar-Solar calendar engine with Can Chi calculation and zero timezone drift',
    icon: 'i-carbon-moon',
    category: 'Web UI & Primitives',
    language: 'TypeScript',
    topics: ['vietnamese', 'lunar-calendar', 'astronomy'],
    weight: 20,
  },
]

function normalizeRepo(raw: any): GitHubRepo {
  const topics: string[] = []
  if (Array.isArray(raw.topics)) {
    topics.push(...raw.topics)
  }
  else if (Array.isArray(raw.repositoryTopics)) {
    topics.push(...raw.repositoryTopics.map((t: any) => t.name))
  }

  const language = raw.language || raw.primaryLanguage?.name || null
  const stars = raw.stargazers_count ?? raw.stargazerCount ?? 0
  const forks = raw.forks_count ?? raw.forkCount ?? 0
  const isArchived = Boolean(raw.archived ?? raw.isArchived)
  const isFork = Boolean(raw.fork ?? raw.isFork)
  const html_url = raw.html_url || raw.url
  const homepage = raw.homepage || raw.homepageUrl || null

  return {
    name: raw.name,
    full_name: raw.full_name || `tuquet/${raw.name}`,
    description: raw.description,
    html_url,
    homepage,
    topics,
    stargazers_count: stars,
    forks_count: forks,
    language,
    archived: isArchived,
    fork: isFork,
    updated_at: raw.updated_at,
  }
}

function detectIcon(repo: GitHubRepo): string {
  const lang = (repo.language || '').toLowerCase()
  const topics = repo.topics || []

  // Check explicit icon topic: icon-xyz
  const iconTopic = topics.find(t => t.startsWith('icon-'))
  if (iconTopic) {
    const iconName = iconTopic.replace(/^icon-/, '')
    return `i-carbon-${iconName}`
  }

  if (topics.includes('telegram') || topics.includes('chatops')) return 'i-simple-icons-telegram'
  if (topics.includes('claude') || topics.includes('anthropic')) return 'i-simple-icons-anthropic'
  if (topics.includes('supabase')) return 'i-simple-icons-supabase'
  if (topics.includes('tauri')) return 'i-simple-icons-tauri'
  if (topics.includes('vue3') || lang === 'vue') return 'i-simple-icons-vuedotjs'
  if (topics.includes('medusajs') || topics.includes('ecommerce')) return 'i-carbon-shopping-cart'
  if (topics.includes('cloudflare-workers') || topics.includes('cloudflare')) return 'i-simple-icons-cloudflare'

  if (lang === 'rust') return 'i-simple-icons-rust'
  if (lang === 'typescript') return 'i-simple-icons-typescript'
  if (lang === 'javascript') return 'i-simple-icons-javascript'
  if (lang === 'python') return 'i-simple-icons-python'
  if (lang === 'go') return 'i-simple-icons-go'
  if (lang === 'powershell') return 'i-simple-icons-powershell'

  return 'i-carbon-code'
}

function resolveCategory(repo: GitHubRepo): string | null {
  const topics = repo.topics || []
  for (const topic of topics) {
    if (TOPIC_CATEGORY_MAP[topic]) {
      return TOPIC_CATEGORY_MAP[topic]
    }
  }

  // Fallback check in overrides
  if (REPO_OVERRIDES[repo.name]?.category) {
    return REPO_OVERRIDES[repo.name]!.category!
  }

  return null
}

async function fetchGithubRepos(): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'tuquet-portfolio-generator',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // 1. Try public GitHub REST API
  try {
    const res = await fetch('https://api.github.com/users/tuquet/repos?per_page=100&type=owner', { headers })
    if (res.ok) {
      const data = await res.json() as any[]
      return data.map(normalizeRepo)
    }
    console.warn(`GitHub API warning: ${res.status} ${res.statusText}`)
  }
  catch (e) {
    console.warn('Direct GitHub API fetch failed, attempting gh CLI fallback...', (e as any)?.message || e)
  }

  // 2. Fallback to `gh` CLI if installed
  try {
    const output = execSync('gh repo list tuquet --limit 100 --json name,description,url,homepageUrl,repositoryTopics,stargazerCount,primaryLanguage,isArchived,isFork', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    const data = JSON.parse(output)
    if (Array.isArray(data) && data.length > 0) {
      console.log(`Fetched ${data.length} repos via gh CLI fallback.`)
      return data.map(normalizeRepo)
    }
  }
  catch (err) {
    console.warn('gh CLI fallback failed:', (err as any)?.message || err)
  }

  return []
}

async function main() {
  console.log('Fetching repositories from GitHub API...')
  const repos = await fetchGithubRepos()
  console.log(`Resolved ${repos.length} raw repos`)

  const projectList: ProjectItem[] = []

  // Repos to exclude from projects listing
  const EXCLUDED_REPOS = new Set(['tuquet.com', 'tuquet', 'dotfiles', 'install', 'scoop-bucket'])

  for (const repo of repos) {
    if (repo.archived || repo.fork || EXCLUDED_REPOS.has(repo.name)) continue

    const category = resolveCategory(repo)
    // If no category and not in overrides, skip internal or unclassified repos
    if (!category && !REPO_OVERRIDES[repo.name]) continue

    const override = REPO_OVERRIDES[repo.name] || {}
    const finalCategory = override.category || category || 'Developer Infrastructure'
    const name = override.name || repo.name
    const desc = override.desc || repo.description || 'Open source software and tools by Tu Quet'
    const link = override.link || repo.homepage || repo.html_url || `https://github.com/tuquet/${repo.name}`
    const icon = override.icon || detectIcon(repo)
    const weight = override.weight ?? ((repo.stargazers_count || 0) * 10)

    projectList.push({
      name,
      repo: repo.full_name,
      link,
      githubUrl: repo.html_url,
      desc,
      icon,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: repo.topics || [],
      category: finalCategory,
      weight,
    })
  }

  // Merge manual showcase packages
  for (const manual of MANUAL_SHOWCASE_PROJECTS) {
    projectList.push(manual)
  }

  // Sort by weight descending
  projectList.sort((a, b) => (b.weight || 0) - (a.weight || 0))

  // Group into categories
  const categories: Record<string, ProjectItem[]> = {
    'Ecosystem': [],
    'AI & Agent Systems': [],
    'Developer Infrastructure': [],
    'Web UI & Primitives': [],
  }

  const allTopicsSet = new Set<string>()

  for (const item of projectList) {
    if (!categories[item.category]) {
      categories[item.category] = []
    }
    categories[item.category].push(item)

    if (item.language) {
      allTopicsSet.add(item.language)
    }
    for (const t of item.topics) {
      if (!t.startsWith('cat-') && !t.startsWith('icon-')) {
        allTopicsSet.add(t)
      }
    }
  }

  // Remove empty categories
  for (const key of Object.keys(categories)) {
    if (categories[key].length === 0) {
      delete categories[key]
    }
  }

  const output = {
    categories,
    allTopics: Array.from(allTopicsSet).sort((a, b) => a.localeCompare(b)),
    totalProjects: projectList.length,
    updatedAt: new Date().toISOString(),
  }

  const outputPath = path.resolve('src/data/projects-data.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`Generated ${outputPath} with ${projectList.length} projects across ${Object.keys(categories).length} categories.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
