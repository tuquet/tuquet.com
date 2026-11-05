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

// Canonical Projects list (exact titles & descriptions from original projects.md + active repos)
const CANONICAL_PROJECTS: ProjectItem[] = [
  // --- Ecosystem ---
  {
    name: 'Operon',
    repo: 'tuquet/operon',
    link: 'https://github.com/tuquet/operon',
    desc: 'Ultra-high performance distributed automation mesh and stealth browser sandbox runtime in Rust',
    icon: 'i-simple-icons-rust',
    category: 'Ecosystem',
    language: 'Rust',
    topics: ['automation', 'browser-sandbox', 'rust', 'tuquet-core'],
    weight: 120,
  },
  {
    name: 'CLI',
    repo: 'tuquet/cli',
    link: 'https://github.com/tuquet/cli',
    desc: 'Unified terminal workspace to orchestrate, monitor, and control all automation workflows, bots, and tunnels',
    icon: 'i-carbon-terminal',
    category: 'Ecosystem',
    language: 'Rust',
    topics: ['cli', 'terminal', 'automation', 'rust'],
    weight: 110,
  },
  {
    name: 'Browser',
    repo: 'tuquet/browser',
    link: 'https://github.com/tuquet/browser',
    desc: 'Custom anti-detect Chromium browser engineered to bypass bot detection, Cloudflare, and fingerprinting',
    icon: 'i-carbon-application-web',
    category: 'Ecosystem',
    language: 'Rust',
    topics: ['browser', 'antidetect', 'stealth', 'chromium'],
    weight: 105,
  },
  {
    name: 'Runner',
    repo: 'tuquet/runner',
    link: 'https://github.com/tuquet/runner',
    desc: 'Autonomous edge engine executing high-volume browser tasks and multi-account automation at massive scale',
    icon: 'i-simple-icons-rust',
    category: 'Ecosystem',
    language: 'Rust',
    topics: ['runner', 'edge', 'automation', 'rust'],
    weight: 100,
  },
  {
    name: 'Automa',
    link: 'https://github.com/tuquet/automation',
    desc: 'Visual drag-and-drop workflow builder to automate complex browser tasks in minutes without writing code',
    icon: 'i-carbon-flow-data',
    category: 'Ecosystem',
    topics: ['workflow', 'automation', 'drag-and-drop'],
    weight: 95,
  },
  {
    name: 'Console',
    repo: 'tuquet/console',
    link: 'https://github.com/tuquet/console',
    desc: 'Central workstation desktop GUI and preferences engine with Vue 3, Shadcn UI, and Tauri v2',
    icon: 'i-simple-icons-tauri',
    category: 'Ecosystem',
    language: 'TypeScript',
    topics: ['tauri', 'vue3', 'workstation', 'shadcn'],
    weight: 90,
  },
  {
    name: 'Store',
    repo: 'tuquet/store',
    link: 'https://github.com/tuquet/store',
    desc: 'Medusa v2 e-commerce platform with Next.js Storefront and Docker orchestration',
    icon: 'i-carbon-shopping-cart',
    category: 'Ecosystem',
    language: 'TypeScript',
    topics: ['ecommerce', 'medusajs', 'nextjs', 'storefront'],
    weight: 85,
  },
  {
    name: 'Id',
    repo: 'tuquet/id',
    link: 'https://github.com/tuquet/id',
    desc: 'Centralized Identity, Authentication, and Entitlements Platform powered by Supabase with Row Level Security',
    icon: 'i-simple-icons-supabase',
    category: 'Ecosystem',
    language: 'PLpgSQL',
    topics: ['iam', 'identity', 'supabase', 'entitlements'],
    weight: 80,
  },
  {
    name: 'Cloud',
    repo: 'tuquet/cloud',
    link: 'https://github.com/tuquet/cloud',
    desc: 'Multi-tenant control plane on Supabase to manage device enrollment, database schemas, and edge permissions',
    icon: 'i-carbon-cloud',
    category: 'Ecosystem',
    language: 'PLpgSQL',
    topics: ['supabase', 'cloud', 'control-plane'],
    weight: 75,
  },
  {
    name: 'Storage Hub',
    repo: 'tuquet/storage',
    link: 'https://github.com/tuquet/storage',
    desc: 'Multi-tenant cloud storage engine with atomic lease locking to sync antidetect browser profiles safely across machines with zero egress fees',
    icon: 'i-carbon-data-base',
    category: 'Ecosystem',
    language: 'JavaScript',
    topics: ['storage', 'cloudflare-r2', 'profiles'],
    weight: 70,
  },
  {
    name: 'Faker',
    repo: 'tuquet/faker',
    link: 'https://github.com/tuquet/faker',
    desc: 'Ultra-fast generator for legally compliant Vietnamese CCCD, phone numbers, and cohesive test identities',
    icon: 'i-carbon-id-management',
    category: 'Ecosystem',
    language: 'Rust',
    topics: ['faker', 'vietnamese-cccd', 'rust'],
    weight: 65,
  },
  {
    name: 'Skills',
    repo: 'tuquet/skills-pack',
    link: 'https://github.com/tuquet/skills-pack',
    desc: 'Production MCP toolkits that empower AI agents to directly control local developer tools and run automation',
    icon: 'i-carbon-tools',
    category: 'Ecosystem',
    language: 'TypeScript',
    topics: ['skills', 'mcp', 'agent-skills'],
    weight: 60,
  },
  {
    name: 'Docs',
    link: 'https://docs.tuquet.com',
    desc: 'Interactive documentation hub with instant search and copy-paste recipes for 68 CLI automation commands',
    icon: 'i-carbon-notebook',
    category: 'Ecosystem',
    topics: ['documentation', 'recipes', 'cli'],
    weight: 55,
  },

  // --- AI & Agent Systems ---
  {
    name: 'Claude-Agy',
    repo: 'tuquet/claude-agy',
    link: 'https://github.com/tuquet/claude-agy',
    desc: 'Run Anthropic Claude Code CLI powered by Google Antigravity quotas with zero API token costs',
    icon: 'i-simple-icons-anthropic',
    category: 'AI & Agent Systems',
    language: 'JavaScript',
    topics: ['claude', 'antigravity', 'cli', 'ai'],
    weight: 90,
  },
  {
    name: 'Telegram ChatOps',
    repo: 'tuquet/bot',
    link: 'https://github.com/tuquet/bot',
    desc: '24/7 server watchdog that sends instant downtime alerts to Telegram and lets you fix issues via chat',
    icon: 'i-simple-icons-telegram',
    category: 'AI & Agent Systems',
    language: 'JavaScript',
    topics: ['telegram', 'chatops', 'cloudflare-workers', 'alerting'],
    weight: 85,
  },

  // --- Developer Infrastructure ---
  {
    name: 'Yak Map',
    repo: 'tuquet/yak-map',
    link: 'https://yakmap.tuquet.com/',
    desc: 'Interactive visual architecture map that unravels monorepo dependencies and data flows at a glance',
    icon: 'i-carbon-network-4',
    category: 'Developer Infrastructure',
    language: 'TypeScript',
    topics: ['visualization', 'architecture', 'monorepo'],
    weight: 60,
  },
  {
    name: 'Schema Registry',
    link: 'https://github.com/tuquet/schema',
    desc: 'Single source of truth for JSON schemas to prevent breaking API contracts between CLI, backend, and UI',
    icon: 'i-carbon-code',
    category: 'Developer Infrastructure',
    topics: ['json-schema', 'contracts', 'api'],
    weight: 55,
  },
  {
    name: 'Agent Skills',
    repo: 'tuquet/skills-pack',
    link: 'https://github.com/tuquet/skills-pack',
    desc: 'Curated library of production AI agent skills and automated runbooks adhering to the Ponytail standard',
    icon: 'i-carbon-machine-learning-model',
    category: 'Developer Infrastructure',
    language: 'TypeScript',
    topics: ['ai', 'agent-skills', 'runbooks'],
    weight: 50,
  },
  {
    name: 'Release Radar',
    repo: 'tuquet/releases',
    link: 'https://release.tuquet.com/',
    desc: 'Automated release tracking and distribution dashboard for all Tuquet open-source software and tools',
    icon: 'i-carbon-rocket',
    category: 'Developer Infrastructure',
    language: 'TypeScript',
    topics: ['releases', 'updates', 'dashboard'],
    weight: 45,
  },

  // --- Web UI & Primitives ---
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
    const res = await fetch('https://api.github.com/users/tuquet/repos?per_page=100&type=all', { headers })
    if (res.ok) {
      const data = await res.json() as any[]
      return data.map(normalizeRepo)
    }
  }
  catch (e) {
    // console.warn('Direct GitHub API fetch failed, attempting gh CLI fallback...', (e as any)?.message || e)
  }

  // 2. Fallback to `gh` CLI if installed
  try {
    const output = execSync('gh repo list tuquet --limit 100 --json name,description,url,homepageUrl,repositoryTopics,stargazerCount,primaryLanguage,isArchived,isFork', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    const data = JSON.parse(output)
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeRepo)
    }
  }
  catch {
    // ignore
  }

  return []
}

async function main() {
  console.log('Fetching repositories from GitHub API...')
  const repos = await fetchGithubRepos()
  console.log(`Resolved ${repos.length} repos from GitHub`)

  // Index repos by repo short name & full name
  const repoMap = new Map<string, GitHubRepo>()
  for (const repo of repos) {
    repoMap.set(repo.name.toLowerCase(), repo)
    if (repo.full_name) {
      repoMap.set(repo.full_name.toLowerCase(), repo)
    }
  }

  // Deep clone canonical list
  const projectList: ProjectItem[] = JSON.parse(JSON.stringify(CANONICAL_PROJECTS))

  // Enrich canonical projects with live GitHub stats
  for (const item of projectList) {
    let matchedRepo: GitHubRepo | undefined

    if (item.repo) {
      matchedRepo = repoMap.get(item.repo.toLowerCase()) || repoMap.get(item.repo.replace(/^tuquet\//i, '').toLowerCase())
    }
    else {
      // Try matching by name
      matchedRepo = repoMap.get(item.name.toLowerCase())
    }

    if (matchedRepo) {
      item.stars = matchedRepo.stargazers_count ?? 0
      item.forks = matchedRepo.forks_count ?? 0
      if (!item.language && matchedRepo.language) {
        item.language = matchedRepo.language
      }
      if (matchedRepo.topics && matchedRepo.topics.length > 0) {
        // Merge topics uniquely
        const merged = new Set([...item.topics, ...matchedRepo.topics])
        item.topics = Array.from(merged)
      }
      if (!item.githubUrl && matchedRepo.html_url) {
        item.githubUrl = matchedRepo.html_url
      }
    }
  }

  // Build categories map preserving original category order
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

  const output = {
    categories,
    allTopics: Array.from(allTopicsSet).sort((a, b) => a.localeCompare(b)),
    totalProjects: projectList.length,
    updatedAt: new Date().toISOString(),
  }

  const outputPath = path.resolve('src/data/projects-data.json')
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`Generated ${outputPath} with ${projectList.length} canonical projects across ${Object.keys(categories).length} categories.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
