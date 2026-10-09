import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

interface PageInfo {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  title?: string;
  description?: string;
  date?: string;
  type?: string;
  slug?: string;
}

const BASE_URL = 'https://tuquet.com';
const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, 'pages');
const POSTS_DIR = path.join(PAGES_DIR, 'posts');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function formatDate(dateVal: any): string {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // fallback
  }
  return new Date().toISOString().split('T')[0];
}

function formatRfc822Date(dateVal: any): string {
  if (!dateVal) return new Date().toUTCString();
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toUTCString();
    }
  } catch {
    // fallback
  }
  return new Date().toUTCString();
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function collectPages(): { pages: PageInfo[]; posts: PageInfo[] } {
  const pages: PageInfo[] = [];
  const posts: PageInfo[] = [];

  // Core pages mapping
  const corePages: Record<string, { route: string; priority: string; changefreq: string }> = {
    'index.md': { route: '/', priority: '1.0', changefreq: 'daily' },
    'projects.md': { route: '/projects', priority: '0.9', changefreq: 'weekly' },
    'cv.md': { route: '/cv', priority: '0.9', changefreq: 'weekly' },
    'talks.md': { route: '/talks', priority: '0.7', changefreq: 'monthly' },
    'podcasts.md': { route: '/podcasts', priority: '0.7', changefreq: 'monthly' },
    'streams.md': { route: '/streams', priority: '0.7', changefreq: 'monthly' },
    'notes.md': { route: '/notes', priority: '0.8', changefreq: 'weekly' },
    'demos.md': { route: '/demos', priority: '0.7', changefreq: 'monthly' },
    'photos.md': { route: '/photos', priority: '0.6', changefreq: 'monthly' },
    'sponsors-list.md': { route: '/sponsors-list', priority: '0.6', changefreq: 'monthly' },
  };

  // Add root core pages
  for (const [file, config] of Object.entries(corePages)) {
    const filePath = path.join(PAGES_DIR, file);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);
      pages.push({
        loc: `${BASE_URL}${config.route}`,
        lastmod: formatDate(data.updated || data.date),
        changefreq: config.changefreq,
        priority: config.priority,
      });
    }
  }

  // Add /posts index page
  const postsIndexPath = path.join(POSTS_DIR, 'index.md');
  if (fs.existsSync(postsIndexPath)) {
    const raw = fs.readFileSync(postsIndexPath, 'utf-8');
    const { data } = matter(raw);
    pages.push({
      loc: `${BASE_URL}/posts`,
      lastmod: formatDate(data.updated || data.date),
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  // Discover all blog posts in pages/posts/
  const postFiles = fs.readdirSync(POSTS_DIR);
  for (const file of postFiles) {
    if (!file.endsWith('.md') || file === 'index.md') continue;
    const slug = file.replace(/\.md$/, '');
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    const postInfo: PageInfo = {
      loc: `${BASE_URL}/posts/${slug}`,
      slug,
      lastmod: formatDate(data.updated || data.date),
      changefreq: 'monthly',
      priority: '0.8',
      title: data.title || slug,
      description: data.description || '',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      type: data.type || 'blog',
    };

    pages.push(postInfo);
    posts.push(postInfo);
  }

  return { pages, posts };
}

function generateSitemap(pages: PageInfo[]): string {
  const urlEntries = pages
    .map(p => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

function generateRssFeed(posts: PageInfo[]): string {
  // Sort posts by date descending
  const sorted = [...posts].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  const items = sorted
    .map(p => `    <item>
      <title>${escapeXml(p.title || '')}</title>
      <link>${p.loc}</link>
      <guid>${p.loc}</guid>
      <pubDate>${formatRfc822Date(p.date)}</pubDate>
      <description>${escapeXml(p.description || '')}</description>
    </item>`)
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Tu Quet</title>
    <link>${BASE_URL}</link>
    <description>Tu Quet's Blog &amp; Engineering Portfolio</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
}

export function buildSeoAssets() {
  console.log('[SEO] Scanning pages and generating sitemap.xml and feed.xml...');
  const { pages, posts } = collectPages();

  const sitemapXml = generateSitemap(pages);
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
  console.log(`[SEO] Generated sitemap.xml with ${pages.length} URLs (including ${posts.length} posts).`);

  const feedXml = generateRssFeed(posts);
  const feedPath = path.join(PUBLIC_DIR, 'feed.xml');
  fs.writeFileSync(feedPath, feedXml, 'utf-8');
  console.log(`[SEO] Generated feed.xml with ${posts.length} articles.`);
}

buildSeoAssets();
