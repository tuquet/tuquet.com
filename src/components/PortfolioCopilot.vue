<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { AWARDS_AND_EDUCATION, CLIENTS, COMPANIES, DOMAIN_REGISTRY } from '~/data/registry'
import { siteLang } from '~/logics'

const companyLinesEn = COMPANIES.map(c => `- **${c.name} (${c.timeline}):** ${c.role} — ${c.scope}`).join('\n')
const companyLinesVi = COMPANIES.map(c => `- **${c.name} (${c.timelineVi || c.timeline}):** ${c.role} — ${c.scopeVi || c.scope}`).join('\n')
const ecosystemLinks = DOMAIN_REGISTRY
  .filter(d => d.groups.includes('ecosystem') && d.id !== 'tuquet')
  .map(d => `- **${d.name}:** [${d.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}](${d.url})`)
  .join('\n')
const clientHighlights = CLIENTS.slice(0, 6).map(c => `**${c.name}**`).join(', ')
const awardLinesEn = AWARDS_AND_EDUCATION.filter(a => a.kind === 'award').map(a => `**${a.title}** (${a.organization}, ${a.time})`).join(', ')
const awardLinesVi = AWARDS_AND_EDUCATION.filter(a => a.kind === 'award').map(a => `**${a.titleVi || a.title}** (${a.organization}, ${a.time})`).join(', ')
const educationEn = AWARDS_AND_EDUCATION.find(a => a.kind === 'education')
const educationLineEn = educationEn ? `**${educationEn.organization}** (${educationEn.time}) – **${educationEn.title}** (${educationEn.detail})` : ''
const educationLineVi = educationEn ? `**${educationEn.organization}** (${educationEn.time}) – **${educationEn.titleVi || educationEn.title}** (${educationEn.detailVi || educationEn.detail})` : ''

interface Message {
  role: 'user' | 'bot'
  text: string
}

const isOpen = ref(false)
const isExpanded = ref(false)
const inputQuery = ref('')
const chatBodyRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()

function getTimeGreeting(lang = siteLang.value) {
  const hour = new Date().getHours()
  if (lang === 'vi') {
    if (hour >= 5 && hour < 12) return 'Chào buổi sáng!'
    if (hour >= 12 && hour < 18) return 'Chào buổi chiều!'
    return 'Chào buổi tối!'
  }
  if (hour >= 5 && hour < 12) return 'Good morning!'
  if (hour >= 12 && hour < 18) return 'Good afternoon!'
  return 'Good evening!'
}

const welcomeGreeting = computed(() => {
  const g = getTimeGreeting()
  if (siteLang.value === 'vi')
    return `**${g}** Tôi là trợ lý AI portfolio của Tú Quét. Bạn muốn tìm hiểu về kiến trúc hệ thống, năng lực dẫn dắt kỹ thuật hay kinh nghiệm làm việc của anh ấy?`
  return `**${g}** I am Tu Quet's portfolio AI assistant. How can I help you explore his systems architecture, engineering leadership, or background today?`
})

const messages = ref<Message[]>([
  {
    role: 'bot',
    text: welcomeGreeting.value,
  },
])

watch(siteLang, () => {
  if (messages.value.length === 1 && messages.value[0].role === 'bot')
    messages.value[0].text = welcomeGreeting.value
})

const knowledge = [
  {
    keys: ['cv', 'resume', 'curriculum vitae', 'profile', 'pdf', 'download cv', 'cv link', 'resume link', 'get cv', 'view cv', 'link to cv', 'download', 'pdf cv', 'experience', 'qualifications', 'hồ sơ', 'kinh nghiệm', 'tải cv', 'xem cv'],
    answer: `**Tu Quet's Profile & Career Track (${COMPANIES.length} companies, 10+ years):**\n${companyLinesEn}\n- **Full CV & Instant PDF:** [tuquet.com/cv](https://tuquet.com/cv) · **Clients:** [tuquet.com/clients](https://tuquet.com/clients)`,
    answerVi: `**Hồ sơ năng lực & Lộ trình (${COMPANIES.length} doanh nghiệp, 10+ năm):**\n${companyLinesVi}\n- **CV đầy đủ & Xuất PDF:** [tuquet.com/cv](https://tuquet.com/cv) · **Khách hàng:** [tuquet.com/clients](https://tuquet.com/clients)`,
  },
  {
    keys: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'morning', 'afternoon', 'evening', 'xin chào', 'chào'],
    answer: () => {
      const g = getTimeGreeting('en')
      return `**${g}** Glad to connect with you. How can I help you explore Tu Quet's fullstack architecture, AI-native workflows, or technical leadership today? Feel free to ask or pick a suggestion below!`
    },
    answerVi: () => {
      const g = getTimeGreeting('vi')
      return `**${g}** Rất vui được kết nối cùng bạn. Bạn muốn tìm hiểu về kiến trúc fullstack, quy trình AI-native hay kinh nghiệm Technical Leader của Tú Quét? Hãy đặt câu hỏi hoặc chọn gợi ý bên dưới nhé!`
    },
  },
  {
    keys: ['nda', 'confidential', 'waku', 'source code', 'proprietary', 'internal', 'bảo mật'],
    answer: '**Confidentiality & Non-Disclosure (NDA) Notice:**\n- Proprietary source code, internal schemas, and confidential client engagements (such as `Project Waku`, an international fintech trading platform) are protected under **Non-Disclosure Agreements (NDAs)**.\n- For public engagements (**VinFast Digital Twin Portal**, **Lotte World Adventure App**, **SocialBeat**, **ShopBase**), Tu Quet welcomes technical deep-dives into **system architecture, Data Warehouse optimization, WebView bridges, and high-concurrency solutions** he directly engineered.',
    answerVi: '**Lưu ý về Bảo mật & Thỏa thuận NDA:**\n- Mã nguồn độc quyền, schema nội bộ và các dự án khách hàng bảo mật (như `Project Waku`, nền tảng giao dịch fintech quốc tế) được bảo vệ bởi **Thỏa thuận Bảo mật (NDA)**.\n- Với các dự án công khai (**VinFast Digital Twin Portal**, **Lotte World Adventure App**, **SocialBeat**, **ShopBase**), Tú Quét sẵn sàng trao đổi chuyên sâu về **kiến trúc hệ thống, tối ưu Data Warehouse, cầu nối WebView và xử lý tải cao** mà anh trực tiếp thiết kế.',
  },
  {
    keys: ['summary', 'recruiter', 'who', 'about', 'tu quet', 'achievements', 'overview', 'highlights', 'hire', 'background', 'tóm tắt', 'giới thiệu', 'tổng quan', 'tuyển dụng'],
    answer: `**Executive Summary for Recruiters:**\n- **Role:** Software Engineer & Architect (10+ years) across Web, Mobile, Desktop, Java Microservices & Data Warehouses.\n- **Key Clients:** ${clientHighlights} ([tuquet.com/clients](https://tuquet.com/clients)).\n- **Open-Source Flagship:** **Operon** (Rust daemon + Vue / Tauri console + Supabase).\n- **Full CV & PDF Export:** [tuquet.com/cv](https://tuquet.com/cv)`,
    answerVi: `**Tóm tắt dành cho Nhà tuyển dụng:**\n- **Vai trò:** Software Engineer & Architect (10+ năm) qua Web, Mobile, Desktop, Java Microservices & Data Warehouse.\n- **Khách hàng tiêu biểu:** ${clientHighlights} ([tuquet.com/clients](https://tuquet.com/clients)).\n- **Dự án mã nguồn mở chủ lực:** **Operon** (Rust daemon + Vue / Tauri console + Supabase).\n- **CV đầy đủ & Xuất PDF:** [tuquet.com/cv](https://tuquet.com/cv)`,
  },
  {
    keys: ['fit', 'role', 'position', 'match', 'suitable', 'openings', 'lead', 'architect', 'scope', 'senior', 'staff', 'principal', 'phù hợp', 'vị trí'],
    answer: '**Role Fit & Ideal Engagement:**\n- **Software Engineer & Architect / Technical Leader:** End-to-end ownership bridging modern React/Next.js/React Native frontends, Java / Spring Boot microservices, and AI-assisted delivery workflows.\n- **Staff / Principal Software Engineer:** Deep hands-on mastery of high-concurrency backend APIs, Rust async systems, Data Warehouse query optimization, and 60fps real-time UI.\n- **Solutions Architect:** Designing microservices, micro-frontends, hybrid mobile WebView bridges, and developer platforms.\n- **Working Culture:** Agile Scrum / Kanban, clean code advocate, mentor, and remote/onsite stakeholder collaboration.',
    answerVi: '**Mức độ phù hợp & Vai trò mục tiêu:**\n- **Software Engineer & Architect / Technical Leader:** Làm chủ đầu-cuối từ frontend React/Next.js/React Native hiện đại, microservice Java / Spring Boot đến quy trình phát triển ứng dụng AI.\n- **Staff / Principal Software Engineer:** Chuyên sâu backend API đồng thời cao, hệ thống bất đồng bộ Rust, tối ưu truy vấn Data Warehouse và giao diện thời gian thực 60fps.\n- **Solutions Architect:** Thiết kế microservice, micro-frontend, cầu nối hybrid mobile WebView và nền tảng công cụ lập trình.\n- **Văn hóa làm việc:** Agile Scrum / Kanban, đề cao clean code, mentoring và phối hợp hiệu quả với đối tác quốc tế (remote/onsite).',
  },
  {
    keys: ['telemetry', 'ev', 'vinfast', 'digital twin', 'websocket', 'sse', 'realtime', 'streaming', 'fleet', 'automotive', 'xe điện'],
    answer: '**VinFast Digital Twin Portal & EV Telemetry Architecture:**\n- Tu Quet serves as **Technical Leader** (6-member hybrid team at CMC Global) owning the fullstack architecture for **VinFast Digital Twin Portal**.\n- Paired a modular **React** & shared Design System frontend (Vite, TanStack Query, ECharts) with **Java & Spring Boot** APIs and WebSocket telemetry streams.\n- Cut Data Warehouse query latency to **`< 150ms`** while sustaining 60fps UI grids and `+25%` team delivery velocity with AI-assisted workflows.',
    answerVi: '**Kiến trúc Cổng VinFast Digital Twin & EV Telemetry:**\n- Tú Quét đảm nhiệm vai trò **Technical Leader** (đội ngũ 6 người hybrid tại CMC Global), sở hữu kiến trúc fullstack cho **VinFast Digital Twin Portal**.\n- Kết hợp frontend **React** dạng module & Design System dùng chung (Vite, TanStack Query, ECharts) với API **Java & Spring Boot** và luồng WebSocket telemetry.\n- Giảm độ trễ truy vấn Data Warehouse xuống **`< 150ms`**, giữ khung hình 60fps và tăng `+25%` tốc độ đội ngũ nhờ quy trình hỗ trợ AI.',
  },
  {
    keys: ['operon', 'daemon', 'chromium', 'browser', 'rust', 'sqlite', 'skills', 'mcp', 'agent', 'console', 'tauri', 'runtime'],
    answer: '**Operon — Local-First Automation Runtime & Console (`tuquet/operon`):**\n- **Device-Local Execution Plane (`tuquet/core`):** Rust (`Axum`, `Tokio`, `SQLite`) daemon (`opn`, `:8765`) with single-instance arbitration, asymmetric UI/worker lifecycle isolation, versioned antidetect Chromium driver management (`browser driver`), and an `opn mcp` stdio server for AI agents.\n- **Workstation Console (`tuquet/console`):** Micro-app `host shell` in **Vue, TypeScript, Shadcn UI, TanStack Query, and Tauri**, exposing shared reactive context via `@operon/kernel`.\n- **Cloud Control Plane & Specs:** Supabase PostgreSQL (`workspace` RLS, Vault KEK/DEK secrets, `SKIP LOCKED` job leases) governed by `CONSTRAINTS.md`, `GLOSSARY.json`, ADRs, and automated local CI gates.',
    answerVi: '**Operon — Nền tảng Tự động hóa Local-First & Console (`tuquet/operon`):**\n- **Tầng thực thi cục bộ (`tuquet/core`):** Daemon Rust (`Axum`, `Tokio`, `SQLite`, binary `opn`, `:8765`) với cơ chế single-instance arbitration, cô lập vòng đời UI/worker, quản lý driver Chromium antidetect theo phiên bản và máy chủ `opn mcp` stdio cho AI agent.\n- **Workstation Console (`tuquet/console`):** `Host shell` kiến trúc micro-app bằng **Vue, TypeScript, Shadcn UI, TanStack Query và Tauri**, cung cấp ngữ cảnh phản ứng dùng chung qua `@operon/kernel`.\n- **Cloud Control Plane & Đặc tả:** Supabase PostgreSQL (`workspace` RLS, Vault KEK/DEK, `SKIP LOCKED` job leases) vận hành chuẩn theo `CONSTRAINTS.md`, `GLOSSARY.json`, ADRs và kiểm thử CI tự động.',
  },
  {
    keys: ['diagram', 'architecture', 'diagrams', 'pipeline', 'visual', 'demo', 'showcase', 'live', 'projects', 'yakmap', 'graph', 'console', 'dự án', 'kiến trúc'],
    answer: `**Live Web Apps & Ecosystem Links:**\n${ecosystemLinks}\n- **Projects Matrix:** [tuquet.com/projects](https://tuquet.com/projects) · **Demos:** [tuquet.com/demos](https://tuquet.com/demos)`,
    answerVi: `**Ứng dụng trực tuyến & Hệ sinh thái:**\n${ecosystemLinks}\n- **Danh mục Dự án:** [tuquet.com/projects](https://tuquet.com/projects) · **Live Demos:** [tuquet.com/demos](https://tuquet.com/demos)`,
  },
  {
    keys: ['portal', 'theme park', 'lotte', 'lotte world', 'lotte group', 'booking', 'webview', 'hospitality', 'high-scale web', 'high-traffic'],
    answer: '**Lotte World Adventure App – Seoul & Busan Parks (Korea, Paused):**\n- Tu Quet served as **Technical Leader** (6-member hybrid remote/onsite team at CMC Global) for the official **Lotte World App** (iOS / Android) and multi-service backend (project currently paused).\n- Led end-to-end delivery across **React Native <-> React WebView** bridges and **Java / Spring Boot** park & partner microservices.\n- Built a native device-ID extraction bridge paired with fail-closed MyBatis/MS SQL queries and Redis caching for sub-second ticketless Staff Entry Bypass, and synced 5-minute wait-time aggregation with 3D Unity map markers & AR navigation.',
    answerVi: '**Ứng dụng Lotte World Adventure – Seoul & Busan (Hàn Quốc, đang tạm dừng):**\n- Tú Quét giữ vai trò **Technical Leader** (đội ngũ 6 thành viên tại CMC Global) cho ứng dụng chính thức **Lotte World App** (iOS / Android) và hệ thống dịch vụ backend (dự án hiện đang tạm dừng).\n- Dẫn dắt triển khai đầu-cuối qua cầu nối **React Native <-> React WebView** và các microservice **Java / Spring Boot**.\n- Xây dựng native device-ID bridge kết hợp truy vấn MyBatis/MS SQL fail-closed và Redis cache cho tính năng Staff Entry Bypass không cần vé dưới 1 giây, đồng thời đồng bộ thời gian chờ 5 phút/lần lên bản đồ 3D Unity & dẫn đường AR.',
  },
  {
    keys: ['team', 'squad', 'mentoring', 'management', 'culture', 'leadership', 'lead', 'members', 'lãnh đạo', 'đội ngũ', 'giải thưởng'],
    answer: `**Leadership Experience & Team Scaling:**\n- **CMC Global (09/2024 – Present):** Technical Leader guiding 6-member cross-functional squads on the active **VinFast Digital Twin Web Portal** and previously **Lotte World Adventure Mobile App** (iOS/Android, paused) with Korean & global stakeholders.\n- **Operon (2024 – Present · Open-Source R&D):** Creator & Principal Architect building a **Desktop App (Tauri)**, Web Console, and Rust CLI/Daemon automation runtime.\n- **iCOMM Tech (05/2020 – 08/2024):** PM, Chief Product Officer (CPO) & Principal Architect leading a 5+ engineer team on **SocialBeat** BI Web App & Data Warehouse (99.9% SLA).\n- **Early Foundation (2014 – 2020):** Senior Fullstack Engineer at **OpenCommerce Group** (\`ShopBase\` Web App), **TDT Asia** (\`Project Waku\` Web App), **Lush Era** (\`Dr.HereOnline\` Web & Mobile Apps), and **Bao Phat Web Solutions** (50+ corporate/SEO websites).\n- **Awards:** ${awardLinesEn}.`,
    answerVi: `**Kinh nghiệm Lãnh đạo & Phát triển Đội ngũ:**\n- **CMC Global (09/2024 – Hiện tại):** Technical Leader dẫn dắt squad 6 thành viên triển khai **VinFast Digital Twin Web Portal** (đang vận hành) và trước đó là **Lotte World Adventure Mobile App** (iOS/Android, đã tạm dừng) cùng đối tác Hàn Quốc & quốc tế.\n- **Operon (2024 – Hiện tại · R&D Mã nguồn mở):** Tác giả & Kiến trúc sư trưởng xây dựng **Desktop App (Tauri)**, Web Console và Rust CLI/Daemon.\n- **iCOMM Tech (05/2020 – 08/2024):** PM, CPO & Kiến trúc sư trưởng dẫn dắt đội ngũ 5+ kỹ sư phát triển **SocialBeat** BI Web App & Data Warehouse (99.9% SLA).\n- **Giai đoạn trước (2014 – 2020):** Senior Fullstack Engineer tại **OpenCommerce Group** (\`ShopBase\`), **TDT Asia** (\`Project Waku\`), **Lush Era** (\`Dr.HereOnline\`) và **Bao Phat Web Solutions** (50+ website doanh nghiệp/SEO).\n- **Giải thưởng:** ${awardLinesVi}.`,
  },
  {
    keys: ['education', 'fpt', 'degree', 'university', 'baophat', 'wordpress', 'php', 'seo', 'taseco', 'datxanh', 'học vấn', 'đại học'],
    answer: `**Education & Early Career Foundation (2012 – 2016):**\n- **Education:** ${educationLineEn}.\n- **Bao Phat Web Solutions (09/2014 – 11/2016):** Fullstack Web Developer delivering SEO-first corporate websites, custom WordPress themes/plugins, and PHP/MySQL platforms for **50+ enterprise clients** (notably \`taseco.vn\`, \`datxanhmienbac.com.vn\`).`,
    answerVi: `**Học vấn & Nền tảng sự nghiệp (2012 – 2016):**\n- **Học vấn:** ${educationLineVi}.\n- **Bao Phat Web Solutions (09/2014 – 11/2016):** Fullstack Web Developer triển khai website chuẩn SEO, theme/plugin WordPress tùy biến và nền tảng PHP/MySQL cho **hơn 50 khách hàng doanh nghiệp** (tiêu biểu \`taseco.vn\`, \`datxanhmienbac.com.vn\`).`,
  },
  {
    keys: ['stack', 'tech stack', 'technologies', 'skill', 'skills', 'programming', 'languages', 'frameworks', 'công nghệ', 'kỹ năng'],
    answer: '**Core & R&D Tech Stack:**\n- **Frontend & Mobile:** TypeScript, React, Next.js, Vue, Angular, React Native, Tauri, Tailwind CSS.\n- **Backend & Systems:** Java (Spring Boot), Rust (Tokio), C# (.NET Core), Python, PHP, REST, GraphQL, gRPC, Kafka, RabbitMQ.\n- **Data & Warehousing:** PostgreSQL, MS SQL Server, MySQL, ClickHouse, Apache Solr, Redis.\n- **AI & Cloud:** MCP, Agent Skills, Harness, Docker, Kubernetes (AKS/AWS), OpenTelemetry, Grafana, Playwright, JUnit.',
    answerVi: '**Công nghệ Cốt lõi & R&D:**\n- **Frontend & Mobile:** TypeScript, React, Next.js, Vue, Angular, React Native, Tauri, Tailwind CSS.\n- **Backend & Hệ thống:** Java (Spring Boot), Rust (Tokio), C# (.NET Core), Python, PHP, REST, GraphQL, gRPC, Kafka, RabbitMQ.\n- **Dữ liệu & Kho dữ liệu:** PostgreSQL, MS SQL Server, MySQL, ClickHouse, Apache Solr, Redis.\n- **AI & Cloud:** MCP, Agent Skills, Harness, Docker, Kubernetes (AKS/AWS), OpenTelemetry, Grafana, Playwright, JUnit.',
  },
  {
    keys: ['contact', 'email', 'phone', 'location', 'interview', 'salary', 'connect', 'reach', 'schedule', 'liên hệ', 'phỏng vấn', 'hợp tác', 'địa chỉ'],
    answer: '**Contact Information & Availability:**\n- Tu Quet is open to **Technical Leadership**, **Software Architecture**, and **Product Engineering** opportunities.\n- **Phone:** +84 936 683 088\n- **Email:** tunyk.93@gmail.com\n- **Location:** Ha Noi, Vietnam\n- **Online CV & PDF Export:** [tuquet.com/cv](https://tuquet.com/cv)\n- **GitHub:** [github.com/tuquet](https://github.com/tuquet)\n- **LinkedIn:** [linkedin.com/in/tuquet](https://www.linkedin.com/in/tuquet)',
    answerVi: '**Thông tin Liên hệ & Sẵn sàng Hợp tác:**\n- Tú Quét sẵn sàng trao đổi về các cơ hội **Technical Leader**, **Software Architect** và **Phát triển Sản phẩm**.\n- **Điện thoại:** +84 936 683 088\n- **Email:** tunyk.93@gmail.com\n- **Vị trí:** Hà Nội, Việt Nam\n- **CV trực tuyến & Xuất PDF:** [tuquet.com/cv](https://tuquet.com/cv)\n- **GitHub:** [github.com/tuquet](https://github.com/tuquet)\n- **LinkedIn:** [linkedin.com/in/tuquet](https://www.linkedin.com/in/tuquet)',
  },
]

const chips = computed(() => {
  if (siteLang.value === 'vi') {
    return [
      { label: 'CV / Hồ sơ', q: 'Xem link CV hoặc tải PDF của Tú Quét ở đâu?' },
      { label: 'Tóm tắt năng lực', q: 'Cho tôi tóm tắt năng lực của Tú Quét' },
      { label: 'Operon Runtime', q: 'Giới thiệu về Operon runtime và console' },
      { label: 'EV Telemetry', q: 'Kiến trúc nền tảng VinFast EV Telemetry ra sao?' },
      { label: 'Liên hệ', q: 'Làm thế nào để liên hệ phỏng vấn hoặc hợp tác với Tú Quét?' },
    ]
  }
  return [
    { label: 'CV / Resume', q: 'Where can I find Tu Quet\'s CV or Resume link?' },
    { label: 'Executive Summary', q: 'Can you provide an executive summary of Tu Quet\'s background?' },
    { label: 'Operon Runtime', q: 'Tell me about the Operon automation runtime & console' },
    { label: 'EV Telemetry', q: 'Tell me about the Smart EV Telemetry platform' },
    { label: 'Contact', q: 'How can I contact Tu Quet for an interview?' },
  ]
})

function queryKnowledge(query: string): string {
  const lower = query.toLowerCase().trim()

  let bestMatch: string | null = null
  let maxScore = 0

  knowledge.forEach((item) => {
    let score = 0
    item.keys.forEach((key) => {
      const lowerKey = key.toLowerCase()
      const escaped = lowerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const usesBoundary = /^\w/.test(lowerKey) && /\w$/.test(lowerKey)
      const matched = usesBoundary
        ? new RegExp(`\\b${escaped}\\b`, 'i').test(lower)
        : lower.includes(lowerKey)

      if (matched) {
        score += lowerKey.length >= 3 ? lowerKey.length : 2
        if (['cv', 'resume', 'hồ sơ'].includes(lowerKey))
          score += 10
      }
    })
    if (score > maxScore) {
      maxScore = score
      const raw = siteLang.value === 'vi' && item.answerVi ? item.answerVi : item.answer
      bestMatch = typeof raw === 'function' ? raw() : raw
    }
  })

  if (!bestMatch) {
    if (siteLang.value === 'vi')
      return 'Tôi có thể giải đáp về **CV / Hồ sơ**, **Operon Runtime & Console**, **VinFast Digital Twin**, **Lotte World App**, **mức độ phù hợp vai trò** hoặc **thông tin liên hệ** của Tú Quét. Bạn có thể chọn nhanh một gợi ý bên dưới!'
    return 'I can answer questions regarding Tu Quet\'s **CV / Resume**, **Operon Runtime & Console**, **VinFast Digital Twin**, **Lotte World App**, **role fit**, or **contact info**. Feel free to pick a prompt below!'
  }

  return bestMatch
}

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value)
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  })
}

function handleSend(text?: string) {
  const query = (text || inputQuery.value).trim()
  if (!query) return

  inputQuery.value = ''
  messages.value.push({
    role: 'user',
    text: query,
  })
  scrollToBottom()

  setTimeout(() => {
    const response = queryKnowledge(query)
    messages.value.push({
      role: 'bot',
      text: response,
    })
    scrollToBottom()
  }, 180)
}

function formatMarkdown(text: string) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded text-[12px] font-mono bg-zinc-200/70 dark:bg-zinc-800">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="underline underline-offset-2 font-medium hover:text-black dark:hover:text-white">$1</a>')
    .replace(/\n- /g, '<br/>• ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
      inputRef.value?.focus()
    })
  }
}

function handleOpenCopilot(e: Event) {
  const customEvent = e as CustomEvent<{ query?: string }>
  isOpen.value = true
  if (customEvent.detail?.query) {
    handleSend(customEvent.detail.query)
  }
  nextTick(() => {
    scrollToBottom()
    inputRef.value?.focus()
  })
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('open-portfolio-copilot', handleOpenCopilot)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('open-portfolio-copilot', handleOpenCopilot)
  }
})
</script>

<template>
  <div class="portfolio-ai-container fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 print:hidden">
    <!-- Trigger Floating Action Button -->
    <button
      type="button"
      class="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-medium bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 border border-zinc-800 dark:border-zinc-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
      :aria-label="siteLang === 'vi' ? 'Hỏi Tú Quét AI' : 'Ask Tu Quet'"
      @click="toggleOpen"
    >
      <img
        src="https://avatars.githubusercontent.com/u/20990824?v=4"
        alt="Tu Quet"
        class="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full object-cover"
      >
      <span>{{ siteLang === 'vi' ? 'Hỏi Tú Quét' : 'Ask Tu Quet' }}</span>
      <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 dark:bg-zinc-200 dark:text-zinc-800">AI</span>
    </button>

    <!-- Chat Drawer Dialog -->
    <div
      v-if="isOpen"
      class="fixed bottom-[60px] md:bottom-20 left-3 right-3 md:left-auto md:right-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-out"
      :class="isExpanded
        ? 'w-auto md:w-[580px] h-[calc(100dvh-75px)] md:h-[680px]'
        : 'w-auto md:w-[390px] h-[calc(100dvh-75px)] md:h-[530px] max-h-[580px]'"
      role="dialog"
      :aria-label="siteLang === 'vi' ? 'Trợ lý AI Tú Quét' : 'Tu Quet AI Assistant'"
    >
      <!-- Dialog Header -->
      <div class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
        <div class="flex items-center gap-2.5">
          <img
            src="https://avatars.githubusercontent.com/u/20990824?v=4"
            alt="Tu Quet"
            class="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
          >
          <div>
            <div class="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
              <span>{{ siteLang === 'vi' ? 'Tú Quét AI' : 'Tu Quet AI' }}</span>
              <span class="text-[10px] px-1 rounded font-normal bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{{ siteLang === 'vi' ? 'Trực tuyến' : 'Online' }}</span>
            </div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400">
              {{ siteLang === 'vi' ? 'Hệ thống phân tán & Mức độ phù hợp' : 'Distributed systems & role fit' }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Expand / Collapse button -->
          <button
            type="button"
            class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            :title="isExpanded ? (siteLang === 'vi' ? 'Thu gọn' : 'Collapse') : (siteLang === 'vi' ? 'Mở rộng' : 'Expand')"
            @click="isExpanded = !isExpanded"
          >
            <div :class="isExpanded ? 'i-carbon-minimize' : 'i-carbon-maximize'" class="text-sm" />
          </button>

          <!-- Close button -->
          <button
            type="button"
            class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            :title="siteLang === 'vi' ? 'Đóng' : 'Close'"
            @click="isOpen = false"
          >
            <div class="i-carbon-close text-sm" />
          </button>
        </div>
      </div>

      <!-- Messages Body -->
      <div
        ref="chatBodyRef"
        class="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300"
      >
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="max-w-[92%] p-3 rounded-xl text-[13px] leading-relaxed break-words"
          :class="msg.role === 'user'
            ? 'self-end bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900'
            : 'self-start bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800/80'"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="formatMarkdown(msg.text)" />
        </div>
      </div>

      <!-- Quick Action Chips -->
      <div class="shrink-0 flex items-center gap-1.5 px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar">
        <button
          v-for="chip in chips"
          :key="chip.q"
          type="button"
          class="shrink-0 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-full transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          @click="handleSend(chip.q)"
        >
          {{ chip.label }}
        </button>
      </div>

      <!-- Input Footer -->
      <div class="shrink-0 flex items-center gap-2 p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <input
          ref="inputRef"
          v-model="inputQuery"
          type="text"
          class="flex-1 h-[38px] px-3 py-2 text-[13px] bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-300 transition-colors"
          :placeholder="siteLang === 'vi' ? 'Đặt câu hỏi về Tú Quét...' : 'Ask a question about Tu Quet...'"
          @keydown.enter="handleSend()"
        >
        <button
          type="button"
          class="shrink-0 h-[38px] px-3.5 text-[13px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          @click="handleSend()"
        >
          <span>{{ siteLang === 'vi' ? 'Gửi' : 'Send' }}</span>
          <div class="i-carbon-send-alt text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
