export interface SponsorItem {
  id: string
  name: string
  tier: 'special' | 'platinum' | 'ecosystem' | 'tech'
  weight?: number
  link?: string
  logo: string
  domain?: string
  timeline?: string
  desc?: string
  tags?: string[]
}

export const sponsors: SponsorItem[] = [
  {
    "id": "ev-telemetry",
    "name": "Smart EV Fleet",
    "tier": "special",
    "weight": 95,
    "link": "https://vinfastauto.com",
    "logo": "/logos/vinfast.png",
    "domain": "vinfastauto.com",
    "timeline": "2024 – Present",
    "desc": "Real-time EV telemetry streaming platform for 100k+ smart connected electric vehicles, processing millions of daily vehicle events with sub-100ms latency.",
    "tags": [
      "TypeScript",
      "Next.js",
      "Rust BFF",
      "Redis Pub/Sub",
      "WebSockets",
      "Azure"
    ],
    "left": 141.2,
    "top": 219.8,
    "size": 148.8
  },
  {
    "id": "cmc",
    "name": "CMC Global",
    "tier": "special",
    "weight": 85,
    "link": "https://cmcglobal.com.vn",
    "logo": "/logos/cmc.png",
    "domain": "cmcglobal.com.vn",
    "timeline": "2024 – Present",
    "desc": "Global digital transformation partner delivering high-impact EV telemetry and visitor portal platforms under strict enterprise SLAs.",
    "tags": [
      "Micro-frontends",
      "Architecture",
      "Engineering Governance",
      "Core Web Vitals"
    ],
    "left": 292.9,
    "top": 226.9,
    "size": 134.6
  },
  {
    "id": "icomm",
    "name": "iCOMM Media & Tech",
    "tier": "special",
    "weight": 82,
    "link": "https://icomm.vn",
    "logo": "/logos/icomm-symbol.png",
    "domain": "icomm.vn",
    "timeline": "2020 – 2024",
    "desc": "Enterprise Big Data extraction, interactive intelligence dashboards, and high-density financial data visualization platforms.",
    "tags": [
      "React",
      "ECharts",
      "Apache Solr",
      "ClickHouse",
      "Docker",
      "Redis"
    ],
    "left": 229.5,
    "top": 347.5,
    "size": 130.4
  },
  {
    "id": "lotte",
    "name": "Lotte Group",
    "tier": "special",
    "weight": 68,
    "link": "https://www.lotte.co.kr",
    "logo": "/logos/lotte.png",
    "domain": "lotte.co.kr",
    "timeline": "2024",
    "desc": "High-traffic visitor web portals and partner booking WebViews for Lotte World amusement parks and hospitality destinations.",
    "tags": [
      "React",
      "Vite",
      "Tailwind CSS",
      "Mobile WebViews",
      "Spring Boot"
    ],
    "left": 239.1,
    "top": 132.6,
    "size": 110.1
  },
  {
    "id": "vietcombank",
    "name": "Vietcombank",
    "tier": "platinum",
    "weight": 62,
    "link": "https://www.vietcombank.com.vn",
    "logo": "/logos/vietcombank.svg",
    "domain": "vietcombank.com.vn",
    "timeline": "2020 – 2024",
    "desc": "Enterprise financial data extraction, banking intelligence dashboards, and interactive reporting for Vietnam's leading commercial bank.",
    "tags": [
      "React",
      "ECharts",
      "ClickHouse",
      "Apache Solr"
    ],
    "left": 136.4,
    "top": 118.8,
    "size": 101.4
  },
  {
    "id": "vietnam-airlines",
    "name": "Vietnam Airlines",
    "tier": "platinum",
    "weight": 62,
    "link": "https://www.vietnamairlines.com",
    "logo": "/logos/vietnam-airlines.png",
    "domain": "vietnamairlines.com",
    "timeline": "2020 – 2024",
    "desc": "Aviation operational intelligence, flight data visualization, and real-time passenger insight dashboard.",
    "tags": [
      "React",
      "ECharts",
      "Real-time Analytics"
    ],
    "left": 125.3,
    "top": 365.2,
    "size": 101.4
  },
  {
    "id": "vietinbank",
    "name": "VietinBank",
    "tier": "platinum",
    "weight": 60,
    "link": "https://www.vietinbank.vn",
    "logo": "/logos/vietinbank.svg",
    "domain": "vietinbank.vn",
    "timeline": "2020 – 2024",
    "desc": "Multi-dimensional financial intelligence and interactive data grid analytics dashboard under strict enterprise SLA.",
    "tags": [
      "React",
      "Highcharts",
      "Big Data",
      "Redis"
    ],
    "left": 352,
    "top": 132.8,
    "size": 98.4
  },
  {
    "id": "bidv",
    "name": "BIDV",
    "tier": "platinum",
    "weight": 60,
    "link": "https://www.bidv.com.vn",
    "logo": "/logos/bidv.svg",
    "domain": "bidv.com.vn",
    "timeline": "2020 – 2024",
    "desc": "High-density banking intelligence visualization and automated reporting system for BIDV.",
    "tags": [
      "React",
      "ECharts",
      "Data Grid",
      "Solr"
    ],
    "left": 362.3,
    "top": 352.8,
    "size": 98.4
  },
  {
    "id": "agribank",
    "name": "Agribank",
    "tier": "platinum",
    "weight": 58,
    "link": "https://www.agribank.com.vn",
    "logo": "/logos/agribank.svg",
    "domain": "agribank.com.vn",
    "timeline": "2020 – 2024",
    "desc": "Large-scale agricultural and rural banking data analytics dashboard and reporting infrastructure.",
    "tags": [
      "React",
      "Data Visualizations",
      "Big Data"
    ],
    "left": 59.5,
    "top": 184,
    "size": 95.4
  },
  {
    "id": "vietjet",
    "name": "Vietjet Air",
    "tier": "platinum",
    "weight": 56,
    "link": "https://www.vietjetair.com",
    "logo": "/logos/vietjet.png",
    "domain": "vietjetair.com",
    "timeline": "2020 – 2024",
    "desc": "High-concurrency flight intelligence monitoring, booking analytics, and operational metrics dashboard.",
    "tags": [
      "React",
      "Data Visualization",
      "ClickHouse"
    ],
    "left": 57.6,
    "top": 300.7,
    "size": 92.5
  },
  {
    "id": "ocg",
    "name": "OpenCommerce Group",
    "tier": "platinum",
    "weight": 54,
    "link": "https://opencommercegroup.com",
    "logo": "/logos/ocg.png",
    "domain": "opencommercegroup.com",
    "timeline": "2018 – 2020",
    "desc": "High-converting cross-border e-commerce storefront platform and automated merchant suite.",
    "tags": [
      "Vue.js",
      "React",
      "PLG",
      "Conversion Optimization",
      "AWS"
    ],
    "left": 422.7,
    "top": 208,
    "size": 89.5
  },
  {
    "id": "nha-atelier",
    "name": "Nhà Atelier",
    "tier": "platinum",
    "weight": 52,
    "link": "https://nhaateliertattoo.com",
    "logo": "/logos/nha-atelier.jpg",
    "domain": "nhaateliertattoo.com",
    "timeline": "2024 – Present",
    "desc": "High-craft bespoke tattoo studio and art atelier based in Vietnam. Web platform & digital identity partner.",
    "tags": [
      "Brand Identity",
      "Next.js",
      "Creative Studio"
    ],
    "left": 442.2,
    "top": 298.6,
    "size": 86.5
  },
  {
    "id": "bamboo",
    "name": "Bamboo Airways",
    "tier": "platinum",
    "weight": 50,
    "link": "https://www.bambooairways.com",
    "logo": "/logos/bamboo.svg",
    "domain": "bambooairways.com",
    "timeline": "2020 – 2024",
    "desc": "Interactive flight intelligence dashboard and performance analytics platform.",
    "tags": [
      "React",
      "ECharts",
      "Interactive UI"
    ],
    "left": 208.6,
    "top": 56.4,
    "size": 83.5
  },
  {
    "id": "tdt",
    "name": "TDT Asia",
    "tier": "platinum",
    "weight": 46,
    "link": "https://tdt.asia",
    "logo": "/logos/tdt.png",
    "domain": "tdt.asia",
    "timeline": "2018",
    "desc": "Enterprise Resource Planning (ERP) web applications customized to strict Japanese corporate quality standards.",
    "tags": [
      "Angular",
      "RxJS",
      "Spring Boot",
      "MySQL"
    ],
    "left": 186.6,
    "top": 455.2,
    "size": 77.5
  },
  {
    "id": "automa",
    "name": "Automa",
    "tier": "ecosystem",
    "weight": 48,
    "link": "https://docs.tuquet.com/en/specter/automa/",
    "logo": "/icons/automa.svg",
    "domain": "docs.tuquet.com/en/specter/automa",
    "timeline": "2024 – Present",
    "desc": "Closed-loop automation orchestration and headless browser coordination platform.",
    "tags": [
      "Vue 3",
      "TypeScript",
      "Axum",
      "Scalar"
    ],
    "left": 308.5,
    "top": 65.8,
    "size": 80.5
  },
  {
    "id": "runner",
    "name": "Runner",
    "tier": "ecosystem",
    "weight": 46,
    "link": "https://github.com/tuquet/runner",
    "logo": "/icons/runner.svg",
    "domain": "github.com/tuquet/runner",
    "timeline": "2024 – Present",
    "desc": "Zero-zombie Chromium process supervision engine in Rust using kernel process trees.",
    "tags": [
      "Rust",
      "Process Trees",
      "IO Completion Ports"
    ],
    "left": 334.9,
    "top": 445.9,
    "size": 77.5
  },
  {
    "id": "browser",
    "name": "Browser",
    "tier": "ecosystem",
    "weight": 44,
    "link": "https://github.com/tuquet/browser",
    "logo": "/icons/browser.svg",
    "domain": "github.com/tuquet/browser",
    "timeline": "2024 – Present",
    "desc": "High-fidelity automation runtime with Chrome DevTools Protocol coordination.",
    "tags": [
      "CDP",
      "TypeScript",
      "Automation"
    ],
    "left": 3,
    "top": 251.3,
    "size": 74.4
  },
  {
    "id": "cloud",
    "name": "Cloud",
    "tier": "ecosystem",
    "weight": 42,
    "link": "https://github.com/tuquet/cloud",
    "logo": "/icons/cloud.svg",
    "domain": "github.com/tuquet/cloud",
    "timeline": "2024 – Present",
    "desc": "Distributed cloud orchestration and secure Supabase synchronization.",
    "tags": [
      "Supabase",
      "Cloudflare",
      "Sync"
    ],
    "left": 270.1,
    "top": 4.3,
    "size": 71.4
  },
  {
    "id": "rust",
    "name": "Rust",
    "tier": "tech",
    "weight": 26,
    "link": "https://rust-lang.org",
    "logo": "https://www.google.com/s2/favicons?domain=rust-lang.org&sz=128",
    "left": 88,
    "top": 134.9,
    "size": 46.4
  },
  {
    "id": "vue",
    "name": "Vue.js",
    "tier": "tech",
    "weight": 26,
    "link": "https://vuejs.org",
    "logo": "https://www.google.com/s2/favicons?domain=vuejs.org&sz=128",
    "left": 453.3,
    "top": 159.3,
    "size": 46.4
  },
  {
    "id": "react",
    "name": "React",
    "tier": "tech",
    "weight": 26,
    "link": "https://react.dev",
    "logo": "https://www.google.com/s2/favicons?domain=react.dev&sz=128",
    "left": 76.1,
    "top": 395.9,
    "size": 46.4
  },
  {
    "id": "next",
    "name": "Next.js",
    "tier": "tech",
    "weight": 24,
    "link": "https://nextjs.org",
    "logo": "https://www.google.com/s2/favicons?domain=nextjs.org&sz=128",
    "left": 266.4,
    "top": 480.5,
    "size": 43.1
  },
  {
    "id": "spring",
    "name": "Spring Boot",
    "tier": "tech",
    "weight": 24,
    "link": "https://spring.io",
    "logo": "https://www.google.com/s2/favicons?domain=spring.io&sz=128",
    "left": 305.2,
    "top": 505.4,
    "size": 43.1
  },
  {
    "id": "redis",
    "name": "Redis",
    "tier": "tech",
    "weight": 24,
    "link": "https://redis.io",
    "logo": "https://www.google.com/s2/favicons?domain=redis.io&sz=128",
    "left": 162.7,
    "top": 72.8,
    "size": 43.1
  },
  {
    "id": "azure",
    "name": "Microsoft Azure",
    "tier": "tech",
    "weight": 22,
    "link": "https://azure.microsoft.com",
    "logo": "https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=128",
    "left": 391.7,
    "top": 90.8,
    "size": 39.9
  },
  {
    "id": "docker",
    "name": "Docker",
    "tier": "tech",
    "weight": 22,
    "link": "https://docker.com",
    "logo": "https://www.google.com/s2/favicons?domain=docker.com&sz=128",
    "left": 463.3,
    "top": 387.9,
    "size": 39.9
  },
  {
    "id": "k8s",
    "name": "Kubernetes",
    "tier": "tech",
    "weight": 22,
    "link": "https://kubernetes.io",
    "logo": "https://www.google.com/s2/favicons?domain=kubernetes.io&sz=128",
    "left": 144.1,
    "top": 468.5,
    "size": 39.9
  },
  {
    "id": "supabase",
    "name": "Supabase",
    "tier": "tech",
    "weight": 22,
    "link": "https://supabase.com",
    "logo": "https://www.google.com/s2/favicons?domain=supabase.com&sz=128",
    "left": 413.7,
    "top": 450.6,
    "size": 39.9
  },
  {
    "id": "clickhouse",
    "name": "ClickHouse",
    "tier": "tech",
    "weight": 22,
    "link": "https://clickhouse.com",
    "logo": "https://www.google.com/s2/favicons?domain=clickhouse.com&sz=128",
    "left": 504.7,
    "top": 268.7,
    "size": 39.9
  },
  {
    "id": "tailwind",
    "name": "Tailwind CSS",
    "tier": "tech",
    "weight": 20,
    "link": "https://tailwindcss.com",
    "logo": "https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=128",
    "left": 116.3,
    "top": 102.1,
    "size": 36.6
  },
  {
    "id": "vite",
    "name": "Vite",
    "tier": "tech",
    "weight": 20,
    "link": "https://vite.dev",
    "logo": "https://www.google.com/s2/favicons?domain=vite.dev&sz=128",
    "left": 440.6,
    "top": 123.4,
    "size": 36.6
  },
  {
    "id": "ts",
    "name": "TypeScript",
    "tier": "tech",
    "weight": 20,
    "link": "https://typescriptlang.org",
    "logo": "https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=128",
    "left": 100.2,
    "top": 440.8,
    "size": 36.6
  },
  {
    "id": "github",
    "name": "GitHub",
    "tier": "tech",
    "weight": 20,
    "link": "https://github.com",
    "logo": "https://www.google.com/s2/favicons?domain=github.com&sz=128",
    "left": 125.1,
    "top": 63.5,
    "size": 36.6
  },
  {
    "id": "solr",
    "name": "Apache Solr",
    "tier": "tech",
    "weight": 20,
    "link": "https://solr.apache.org",
    "logo": "https://www.google.com/s2/favicons?domain=solr.apache.org&sz=128",
    "left": 433.7,
    "top": 84.5,
    "size": 36.6
  },
  {
    "id": "postgres",
    "name": "PostgreSQL",
    "tier": "tech",
    "weight": 20,
    "link": "https://postgresql.org",
    "logo": "https://www.google.com/s2/favicons?domain=postgresql.org&sz=128",
    "left": 247.2,
    "top": 520.1,
    "size": 36.6
  }
]
