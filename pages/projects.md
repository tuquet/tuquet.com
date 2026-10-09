---
title: Projects - Tu Quet
display: Projects
description: Systems architecture, developer tooling, and open-source projects by Tu Quet
wrapperClass: 'text-center'
art: dots
projects:
  Core Platforms:
    - name: 'Automa'
      link: 'https://specter.specter.tuquet.com/automa/'
      desc: 'Next-generation workflow orchestration & headless automation platform'
      icon: 'i-carbon-flow-data'
    - name: 'Runner'
      link: 'https://github.com/tuquet/runner'
      desc: 'High-performance distributed process supervision engine in Rust with kernel process tree sandboxing'
      icon: 'i-simple-icons-rust'
    - name: 'Browser'
      link: 'https://github.com/tuquet/browser'
      desc: 'High-fidelity automation runtime with Chrome DevTools Protocol coordination'
      icon: 'i-carbon-application-web'
    - name: 'Cloud'
      link: 'https://github.com/tuquet/cloud'
      desc: 'Distributed cloud orchestration & secure Supabase telemetry synchronization'
      icon: 'i-carbon-cloud'

  Core Libraries & CLI:
    - name: 'Vue UI'
      link: 'https://github.com/tuquet/lib/tree/main/packages/vue-ui'
      desc: 'Enterprise UI design system & production component library based on Shadcn-Vue and Reka UI'
      icon: 'i-simple-icons-vuedotjs'
    - name: 'Vue Table'
      link: 'https://github.com/tuquet/lib/tree/main/packages/vue-table'
      desc: 'Remote-driven high-density Data Table system for Vue 3 powered by TanStack Table'
      icon: 'i-carbon-data-table'
    - name: 'MD Export'
      link: 'https://github.com/tuquet/lib/tree/main/packages/md-export'
      desc: 'Folder-aware Markdown to vector PDF, HTML, PNG, and JPEG multi-format exporter'
      icon: 'i-carbon-document-pdf'
    - name: 'CLI'
      link: 'https://github.com/tuquet/cli'
      desc: 'Interactive shell & developer CLI written in Rust for local automation environments'
      icon: 'i-carbon-terminal'

  Tooling & Extensions:
    - name: 'Extension Runner'
      link: 'https://github.com/tuquet/lib/tree/main/packages/extension-runner'
      desc: 'Isomorphic web extension runtime polyfill & headless runner bundler'
      icon: 'i-carbon-extensions'
    - name: 'Lunar'
      link: 'https://github.com/tuquet/lib/tree/main/packages/lunar'
      desc: 'Astronomical Vietnamese Lunar-Solar calendar converter, recurrence engine, and Can Chi calculation'
      icon: 'i-carbon-moon'
    - name: 'Scoop Bucket'
      link: 'https://github.com/tuquet/scoop-bucket'
      desc: 'Unified package manager distribution for Tuquet master CLI'
      icon: 'i-carbon-package'
    - name: 'Telegram Bot'
      link: 'https://github.com/tuquet/bot'
      desc: 'Telegram ChatOps assistant & cloud infrastructure server health monitor daemon'
      icon: 'i-simple-icons-telegram'
    - name: 'Random User Generator'
      link: 'https://github.com/tuquet/random-user-generator'
      desc: 'High-performance desktop mock user profile & data generation suite in Tauri v2 & Vue 3'
      icon: 'i-carbon-user-avatar'
    - name: 'Yak Map'
      link: 'https://yarkmap.tuquet.com/'
      desc: 'Interactive dependency, lineage, and derivation graph of open source tools built by Tu Quet'
      icon: 'i-carbon-network-4'

  Enterprise & Case Studies:
    - name: 'Smart EV Telemetry Platform'
      link: 'https://vinfastauto.com'
      desc: 'Real-time telemetry streaming platform for 100k+ smart electric vehicles (CMC Global)'
      icon: 'i-carbon-meter'
    - name: 'Lotte World & Theme Park Portals'
      link: 'https://www.lotte.co.kr'
      desc: 'High-traffic consumer booking webview and ticket management platform (Lotte Group / CMC Global)'
      icon: 'i-carbon-ticket'
    - name: 'Big Data Analytics Dashboard'
      link: 'https://icomm.vn'
      desc: 'Multi-platform enterprise Big Data extraction and intelligence dashboard (ICOMM Tech)'
      icon: 'i-carbon-analytics'
---

<!-- @layout-full-width -->
<ListProjects :projects="frontmatter.projects" />
