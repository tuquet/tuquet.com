import type { PluginSimple as MarkdownItPlugin } from 'markdown-exit'
import { resolve } from 'node:path'
import MarkdownItShiki from '@shikijs/markdown-exit'
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import Vue from '@vitejs/plugin-vue'
import fs from 'fs-extra'
import matter from 'gray-matter'
import anchor from 'markdown-it-anchor'
import GitHubAlerts from 'markdown-it-github-alerts'
import LinkAttributes from 'markdown-it-link-attributes'
import MarkdownItMagicLink from 'markdown-it-magic-link'
import TOC from 'markdown-it-table-of-contents'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Exclude from 'vite-plugin-optimize-exclude'
import SVG from 'vite-svg-loader'
import { VueRouterAutoImports } from 'vue-router/unplugin'
import VueRouter from 'vue-router/vite'
import { slugify } from './scripts/slugify.ts'

const promises: Promise<any>[] = []

export default defineConfig({
  resolve: {
    alias: [
      { find: '~/', replacement: `${resolve(import.meta.dirname, 'src')}/` },
    ],
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      'dayjs',
      'dayjs/plugin/localizedFormat',
    ],
  },
  plugins: [
    UnoCSS(),

    VueRouter({
      extensions: ['.vue', '.md'],
      routesFolder: 'pages',
      // logs: true,
      extendRoute(route) {
        const path = route.components.get('default')
        if (!path)
          return

        if (!path.includes('projects.md') && path.endsWith('.md')) {
          const { data } = matter(fs.readFileSync(path, 'utf-8'))
          route.addToMeta({
            frontmatter: data,
          })
        }
      },
    }),

    Vue({
      include: [/\.vue$/, /\.md$/],
    }),

    Markdown({
      wrapperComponent: id => id.includes('/demo/')
        ? 'WrapperDemo'
        : 'WrapperPost',
      wrapperClasses: (id, code) => code.includes('@layout-full-width')
        ? ''
        : 'prose m-auto slide-enter-content',
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: '""\'\'',
      },
      async markdownSetup(md) {
        md.use((await MarkdownItShiki({
          themes: {
            dark: 'vitesse-dark',
            light: 'vitesse-light',
          },
          defaultColor: false,
          cssVariablePrefix: '--s-',
          transformers: [
            transformerTwoslash({
              explicitTrigger: true,
              renderer: rendererRich(),
            }),
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationWordHighlight(),
          ],
        })) as unknown as MarkdownItPlugin)

        md.use(anchor as unknown as MarkdownItPlugin, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })

        md.use(LinkAttributes as unknown as MarkdownItPlugin, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3, 4],
          slugify,
          containerHeaderHtml: '<div class="table-of-contents-anchor"><div class="i-ri-menu-2-fill" /></div>',
        })

        md.use(MarkdownItMagicLink as unknown as MarkdownItPlugin, {
          linksMap: {
            'CMC Global': { link: 'https://cmcglobal.com.vn', imageUrl: 'https://www.google.com/s2/favicons?domain=cmcglobal.com.vn&sz=128' },
            'Automa': { link: 'https://specter.tuquet.com/automa/', imageUrl: '/icons/automa.svg' },
            'Runner': { link: 'https://github.com/tuquet/runner', imageUrl: '/icons/runner.svg' },
            'Browser': { link: 'https://github.com/tuquet/browser', imageUrl: '/icons/browser.svg' },
            'Cloud': { link: 'https://github.com/tuquet/cloud', imageUrl: '/icons/cloud.svg' },
            'Vue UI': { link: 'https://github.com/tuquet/lib/tree/main/packages/vue-ui', imageUrl: '/icons/vue-ui.svg' },
            'Vue Table': { link: 'https://github.com/tuquet/lib/tree/main/packages/vue-table', imageUrl: '/icons/vue-table.svg' },
            'MD Export': { link: 'https://github.com/tuquet/lib/tree/main/packages/md-export', imageUrl: '/icons/pdf.svg' },
            'CLI': { link: 'https://github.com/tuquet/cli', imageUrl: '/icons/cli.svg' },
            'Specter CLI': { link: 'https://github.com/tuquet/cli', imageUrl: '/icons/cli.svg' },
            'Specter': { link: 'https://github.com/tuquet/cli', imageUrl: '/icons/cli.svg' },
            'Extension Runner': { link: 'https://github.com/tuquet/lib/tree/main/packages/extension-runner', imageUrl: '/icons/extension-runner.svg' },
            'Lunar': { link: 'https://github.com/tuquet/lib/tree/main/packages/lunar', imageUrl: '/icons/lunar.svg' },
            'Scoop Bucket': { link: 'https://github.com/tuquet/scoop-bucket', imageUrl: '/icons/scoop.svg' },
            'vue-ui': { link: 'https://github.com/tuquet/lib/tree/main/packages/vue-ui', imageUrl: '/icons/vue-ui.svg' },
            'vue-table': { link: 'https://github.com/tuquet/lib/tree/main/packages/vue-table', imageUrl: '/icons/vue-table.svg' },
            'md-export': { link: 'https://github.com/tuquet/lib/tree/main/packages/md-export', imageUrl: '/icons/pdf.svg' },
            'extension-runner': { link: 'https://github.com/tuquet/lib/tree/main/packages/extension-runner', imageUrl: '/icons/extension-runner.svg' },
            'lunar': { link: 'https://github.com/tuquet/lib/tree/main/packages/lunar', imageUrl: '/icons/lunar.svg' },
            'Bot': { link: 'https://github.com/tuquet/bot', imageUrl: '/icons/telegram-bot.svg' },
            'bot': { link: 'https://github.com/tuquet/bot', imageUrl: '/icons/telegram-bot.svg' },
            'Telegram Bot': { link: 'https://github.com/tuquet/bot', imageUrl: '/icons/telegram-bot.svg' },
            'telegram-bot': { link: 'https://github.com/tuquet/bot', imageUrl: '/icons/telegram-bot.svg' },
            'Random User Generator': { link: 'https://github.com/tuquet/random-user-generator', imageUrl: '/icons/random-user-generator.svg' },
            'random-user-generator': { link: 'https://github.com/tuquet/random-user-generator', imageUrl: '/icons/random-user-generator.svg' },
            'Tuquet': { link: 'https://github.com/tuquet', imageUrl: '/icons/tuquet.svg' },
            'Vite': 'https://github.com/vitejs/vite',
            'Vue': 'https://github.com/vuejs/core',
            'UnoCSS': 'https://github.com/unocss/unocss',
            'Shiki': 'https://github.com/shikijs/shiki',
          },
        })

        md.use(GitHubAlerts as unknown as MarkdownItPlugin)
      },
      frontmatterPreprocess(frontmatter, options, id, defaults) {
        if (!frontmatter.image) {
          frontmatter.image = 'https://avatars.githubusercontent.com/u/20990824?v=4'
        }
        const head = defaults(frontmatter, options)
        return { head, frontmatter }
      },
    }),

    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        '@vueuse/core',
      ],
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),

    Inspect(),

    Icons({
      defaultClass: 'inline',
      defaultStyle: 'vertical-align: sub;',
    }),

    SVG({
      svgo: false,
      defaultImport: 'url',
    }),

    Exclude(),

    {
      name: 'await',
      async closeBundle() {
        await Promise.all(promises)
      },
    },
  ],

  build: {
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code !== 'UNUSED_EXTERNAL_IMPORT')
          next(warning)
      },
    },
  },

  ssgOptions: {
    formatting: 'minify',
    async onPageRendered(route, html) {
      function escapeHtml(str: string): string {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      }

      function getFrontmatterForRoute(r: string): Record<string, any> | null {
        const cleanRoute = r.replace(/^\/|\/$/g, '')
        const candidates = [
          cleanRoute ? `pages/${cleanRoute}.md` : 'pages/index.md',
          `pages/${cleanRoute}/index.md`,
        ]
        for (const candidate of candidates) {
          const fullPath = resolve(import.meta.dirname, candidate)
          if (fs.existsSync(fullPath)) {
            try {
              const { data } = matter(fs.readFileSync(fullPath, 'utf-8'))
              return data
            }
            catch {
              // ignore
            }
          }
        }
        return null
      }

      const fm = getFrontmatterForRoute(route)
      const isRoot = route === '/' || route === ''
      const isPost = route.startsWith('/posts/') && route !== '/posts'

      let pageTitle = 'Nguyen Dinh Tu (Tu Quet) | Technical Lead & Systems Architect'
      if (!isRoot && fm?.title) {
        if (fm.title.includes('Tu Quet') || fm.title.includes('Nguyen Dinh Tu'))
          pageTitle = fm.title
        else
          pageTitle = `${fm.title} · Tu Quet`
      }

      const defaultDesc = 'Nguyen Dinh Tu (Tu Quet) | Technical Lead & Systems Architect specializing in distributed systems, real-time data streaming, and developer tooling.'
      const pageDescription = fm?.description || defaultDesc
      const canonicalUrl = `https://tuquet.com${isRoot ? '/' : route}`
      const ogType = isPost ? 'article' : 'website'
      const ogImage = fm?.image || 'https://tuquet.com/og.png'

      // Replace or insert <title>
      if (/<title>[\s\S]*?<\/title>/i.test(html)) {
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
      }
      else {
        html = html.replace('</head>', `<title>${escapeHtml(pageTitle)}</title></head>`)
      }

      // Replace or insert <meta name="description">
      if (/<meta\s+name=["']description["'][\s\S]*?\/?>/i.test(html)) {
        html = html.replace(/<meta\s+name=["']description["'][\s\S]*?\/?>/i, `<meta name="description" content="${escapeHtml(pageDescription)}">`)
      }
      else {
        html = html.replace('</head>', `<meta name="description" content="${escapeHtml(pageDescription)}"></head>`)
      }

      // Replace or insert <link rel="canonical">
      if (/<link\s+rel=["']canonical["'][\s\S]*?\/?>/i.test(html)) {
        html = html.replace(/<link\s+rel=["']canonical["'][\s\S]*?\/?>/i, `<link rel="canonical" href="${canonicalUrl}">`)
      }
      else {
        html = html.replace('</head>', `<link rel="canonical" href="${canonicalUrl}"></head>`)
      }

      // Replace or insert Open Graph tags
      html = html.replace(/<meta\s+property=["']og:title["'][\s\S]*?\/?>/i, `<meta property="og:title" content="${escapeHtml(pageTitle)}">`)
      html = html.replace(/<meta\s+property=["']og:description["'][\s\S]*?\/?>/i, `<meta property="og:description" content="${escapeHtml(pageDescription)}">`)
      html = html.replace(/<meta\s+property=["']og:url["'][\s\S]*?\/?>/i, `<meta property="og:url" content="${canonicalUrl}">`)
      html = html.replace(/<meta\s+property=["']og:type["'][\s\S]*?\/?>/i, `<meta property="og:type" content="${ogType}">`)
      html = html.replace(/<meta\s+property=["']og:image["'][\s\S]*?\/?>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}">`)

      // Replace or insert Twitter tags
      html = html.replace(/<meta\s+name=["']twitter:title["'][\s\S]*?\/?>/i, `<meta name="twitter:title" content="${escapeHtml(pageTitle)}">`)
      html = html.replace(/<meta\s+name=["']twitter:description["'][\s\S]*?\/?>/i, `<meta name="twitter:description" content="${escapeHtml(pageDescription)}">`)
      html = html.replace(/<meta\s+name=["']twitter:image["'][\s\S]*?\/?>/i, `<meta name="twitter:image" content="${escapeHtml(ogImage)}">`)

      // Extra article tags and JSON-LD
      if (isPost) {
        let articleTags = '<meta property="article:author" content="Nguyen Dinh Tu">'
        let pubDateIso = ''
        if (fm?.date) {
          try {
            pubDateIso = new Date(fm.date).toISOString()
            articleTags += `<meta property="article:published_time" content="${pubDateIso}">`
          }
          catch {
            // ignore
          }
        }

        const articleSchema = {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          'headline': fm?.title || pageTitle,
          'description': pageDescription,
          'url': canonicalUrl,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl,
          },
          'datePublished': pubDateIso || new Date().toISOString(),
          'dateModified': fm?.updated ? new Date(fm.updated).toISOString() : (pubDateIso || new Date().toISOString()),
          'author': {
            '@type': 'Person',
            'name': 'Nguyen Dinh Tu',
            'url': 'https://tuquet.com',
          },
          'publisher': {
            '@type': 'Person',
            'name': 'Nguyen Dinh Tu',
            'url': 'https://tuquet.com',
          },
          'image': ogImage,
        }

        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://tuquet.com/',
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Blog',
              'item': 'https://tuquet.com/posts',
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': fm?.title || pageTitle,
              'item': canonicalUrl,
            },
          ],
        }

        const jsonLdScripts = `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script><script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`

        html = html.replace('</head>', `${articleTags}${jsonLdScripts}</head>`)
      }

      return html
    },
  },
})
