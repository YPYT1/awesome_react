# Sitemap生成 - 搜索引擎索引优化完整指南

## 1. Sitemap概述

### 1.1 什么是Sitemap

Sitemap(网站地图)是一个XML文件,列出网站的所有重要页面,帮助搜索引擎更有效地爬取和索引网站内容。

**核心作用:**
- **发现新页面**: 帮助搜索引擎发现网站的所有页面
- **优先级设置**: 指定页面的相对重要性
- **更新频率**: 告知搜索引擎页面更新频率
- **多语言支持**: 支持多语言版本的页面
- **媒体内容**: 支持图片、视频等媒体内容

### 1.2 Sitemap类型

```typescript
// Sitemap类型
const sitemapTypes = {
  xml: 'sitemap.xml',           // 标准XML sitemap
  news: 'sitemap-news.xml',     // Google News sitemap
  image: 'sitemap-image.xml',   // 图片sitemap
  video: 'sitemap-video.xml',   // 视频sitemap
  mobile: 'sitemap-mobile.xml', // 移动端sitemap
  index: 'sitemap-index.xml'    // sitemap索引(多个sitemap)
};
```

### 1.3 Sitemap限制

```typescript
const sitemapLimits = {
  maxUrls: 50000,              // 单个sitemap最多50,000个URL
  maxSize: 50 * 1024 * 1024,   // 最大50MB(未压缩)
  maxSitemaps: 50000           // sitemap索引最多包含50,000个sitemap
};
```

## 2. 基础XML Sitemap

### 2.1 XML结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page1</loc>
    <lastmod>2024-01-15T10:00:00+08:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/page2</loc>
    <lastmod>2024-01-16T15:30:00+08:00</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 2.2 Next.js静态生成

```typescript
// pages/sitemap.xml.ts
import { GetServerSideProps } from 'next';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateSiteMapXML(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://example.com';
  
  // 静态页面
  const staticPages = [
    { loc: `${baseUrl}/`, priority: 1.0, changefreq: 'daily' as const },
    { loc: `${baseUrl}/about`, priority: 0.8, changefreq: 'monthly' as const },
    { loc: `${baseUrl}/contact`, priority: 0.6, changefreq: 'yearly' as const }
  ];
  
  // 动态页面 - 从数据库获取
  const posts = await fetchAllPosts();
  const dynamicPages = posts.map((post) => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly' as const,
    priority: 0.7
  }));
  
  const allPages = [...staticPages, ...dynamicPages];
  const sitemap = generateSiteMapXML(allPages);
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  
  return {
    props: {}
  };
};

export default function Sitemap() {
  return null;
}
```

### 2.3 使用库生成

```bash
npm install next-sitemap
```

```javascript
// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://example.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api']
      }
    ],
    additionalSitemaps: [
      'https://example.com/sitemap-news.xml',
      'https://example.com/sitemap-image.xml'
    ]
  },
  transform: async (config, path) => {
    // 自定义转换
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString()
      };
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined
    };
  }
};
```

```json
// package.json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

## 3. 动态Sitemap生成

### 3.1 按类型分离Sitemap

```typescript
// lib/sitemap.ts
interface Page {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

export async function generateBlogSitemap(): Promise<Page[]> {
  const posts = await fetchAllPosts();
  
  return posts.map(post => ({
    url: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly',
    priority: 0.7
  }));
}

export async function generateProductSitemap(): Promise<Page[]> {
  const products = await fetchAllProducts();
  
  return products.map(product => ({
    url: `/products/${product.id}`,
    lastmod: product.updatedAt,
    changefreq: 'daily',
    priority: 0.8
  }));
}

export async function generateStaticSitemap(): Promise<Page[]> {
  return [
    {
      url: '/',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: '/about',
      lastmod: '2024-01-01',
      changefreq: 'monthly',
      priority: 0.5
    }
  ];
}
```

```typescript
// pages/sitemap-blog.xml.ts
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://example.com';
  const pages = await generateBlogSitemap();
  
  const urls = pages.map(page => ({
    loc: `${baseUrl}${page.url}`,
    lastmod: page.lastmod,
    changefreq: page.changefreq,
    priority: page.priority
  }));
  
  const sitemap = generateSiteMapXML(urls);
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  
  return { props: {} };
};
```

### 3.2 Sitemap索引

```typescript
// pages/sitemap-index.xml.ts
interface SitemapIndex {
  loc: string;
  lastmod?: string;
}

function generateSitemapIndex(sitemaps: SitemapIndex[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://example.com';
  
  const sitemaps = [
    {
      loc: `${baseUrl}/sitemap-static.xml`,
      lastmod: new Date().toISOString()
    },
    {
      loc: `${baseUrl}/sitemap-blog.xml`,
      lastmod: await getLatestBlogPostDate()
    },
    {
      loc: `${baseUrl}/sitemap-products.xml`,
      lastmod: await getLatestProductDate()
    },
    {
      loc: `${baseUrl}/sitemap-news.xml`,
      lastmod: new Date().toISOString()
    }
  ];
  
  const sitemapIndex = generateSitemapIndex(sitemaps);
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemapIndex);
  res.end();
  
  return { props: {} };
};
```

## 4. 特殊类型Sitemap

### 4.1 图片Sitemap

```typescript
// pages/sitemap-image.xml.ts
interface ImageUrl {
  loc: string;
  images: Array<{
    loc: string;
    caption?: string;
    title?: string;
    license?: string;
  }>;
}

function generateImageSitemap(urls: ImageUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
${url.images
  .map(
    (img) => `    <image:image>
      <image:loc>${img.loc}</image:loc>
      ${img.caption ? `<image:caption>${img.caption}</image:caption>` : ''}
      ${img.title ? `<image:title>${img.title}</image:title>` : ''}
      ${img.license ? `<image:license>${img.license}</image:license>` : ''}
    </image:image>`
  )
  .join('\n')}
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://example.com';
  const posts = await fetchPostsWithImages();
  
  const urls = posts.map(post => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    images: post.images.map(img => ({
      loc: `${baseUrl}${img.url}`,
      caption: img.caption,
      title: img.title
    }))
  }));
  
  const sitemap = generateImageSitemap(urls);
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  
  return { props: {} };
};
```

### 4.2 视频Sitemap

```typescript
// pages/sitemap-video.xml.ts
interface VideoUrl {
  loc: string;
  videos: Array<{
    thumbnailLoc: string;
    title: string;
    description: string;
    contentLoc?: string;
    playerLoc?: string;
    duration?: number;
    publicationDate?: string;
    familyFriendly?: boolean;
    rating?: number;
  }>;
}

function generateVideoSitemap(urls: VideoUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
${url.videos
  .map(
    (video) => `    <video:video>
      <video:thumbnail_loc>${video.thumbnailLoc}</video:thumbnail_loc>
      <video:title>${escapeXml(video.title)}</video:title>
      <video:description>${escapeXml(video.description)}</video:description>
      ${video.contentLoc ? `<video:content_loc>${video.contentLoc}</video:content_loc>` : ''}
      ${video.playerLoc ? `<video:player_loc>${video.playerLoc}</video:player_loc>` : ''}
      ${video.duration ? `<video:duration>${video.duration}</video:duration>` : ''}
      ${video.publicationDate ? `<video:publication_date>${video.publicationDate}</video:publication_date>` : ''}
      ${video.familyFriendly !== undefined ? `<video:family_friendly>${video.familyFriendly ? 'yes' : 'no'}</video:family_friendly>` : ''}
      ${video.rating ? `<video:rating>${video.rating}</video:rating>` : ''}
    </video:video>`
  )
  .join('\n')}
  </url>`
  )
  .join('\n')}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### 4.3 新闻Sitemap

```typescript
// pages/sitemap-news.xml.ts
interface NewsUrl {
  loc: string;
  news: {
    publicationName: string;
    publicationLanguage: string;
    publicationDate: string;
    title: string;
    keywords?: string;
  };
}

function generateNewsSitemap(urls: NewsUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${url.news.publicationName}</news:name>
        <news:language>${url.news.publicationLanguage}</news:language>
      </news:publication>
      <news:publication_date>${url.news.publicationDate}</news:publication_date>
      <news:title>${escapeXml(url.news.title)}</news:title>
      ${url.news.keywords ? `<news:keywords>${url.news.keywords}</news:keywords>` : ''}
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://example.com';
  
  // 只包含最近48小时的新闻
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentNews = await fetchNewsAfter(twoDaysAgo);
  
  const urls = recentNews.map(news => ({
    loc: `${baseUrl}/news/${news.slug}`,
    news: {
      publicationName: 'Example News',
      publicationLanguage: 'zh',
      publicationDate: news.publishedAt,
      title: news.title,
      keywords: news.tags.join(', ')
    }
  }));
  
  const sitemap = generateNewsSitemap(urls);
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  
  return { props: {} };
};
```

## 5. 多语言Sitemap

### 5.1 hreflang实现

```typescript
// pages/sitemap.xml.ts
interface MultilingualUrl {
  loc: string;
  alternates: Array<{
    hreflang: string;
    href: string;
  }>;
  lastmod?: string;
}

function generateMultilingualSitemap(urls: MultilingualUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
${url.alternates
  .map(
    (alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`
  )
  .join('\n')}
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://example.com';
  const locales = ['zh', 'en', 'ja'];
  const posts = await fetchAllPosts();
  
  const urls = posts.map(post => ({
    loc: `${baseUrl}/zh/blog/${post.slug}`,
    alternates: locales.map(locale => ({
      hreflang: locale,
      href: `${baseUrl}/${locale}/blog/${post.slug}`
    })),
    lastmod: post.updatedAt
  }));
  
  const sitemap = generateMultilingualSitemap(urls);
  
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  
  return { props: {} };
};
```

## 6. 自动化与优化

### 6.1 增量更新

```typescript
// lib/sitemap-cache.ts
import Redis from 'ioredis';

const redis = new Redis();

interface CachedSitemap {
  xml: string;
  lastGenerated: string;
}

export async function getCachedSitemap(
  key: string,
  maxAge: number = 3600
): Promise<string | null> {
  const cached = await redis.get(key);
  
  if (!cached) return null;
  
  const data: CachedSitemap = JSON.parse(cached);
  const age = Date.now() - new Date(data.lastGenerated).getTime();
  
  if (age > maxAge * 1000) {
    return null;
  }
  
  return data.xml;
}

export async function cacheSitemap(key: string, xml: string): Promise<void> {
  const data: CachedSitemap = {
    xml,
    lastGenerated: new Date().toISOString()
  };
  
  await redis.set(key, JSON.stringify(data), 'EX', 3600);
}

// 使用缓存
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const cacheKey = 'sitemap:blog';
  
  // 尝试从缓存获取
  let sitemap = await getCachedSitemap(cacheKey);
  
  if (!sitemap) {
    // 生成新sitemap
    const urls = await generateBlogSitemap();
    sitemap = generateSiteMapXML(urls);
    
    // 缓存
    await cacheSitemap(cacheKey, sitemap);
  }
  
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.write(sitemap);
  res.end();
  
  return { props: {} };
};
```

### 6.2 压缩Sitemap

```typescript
// 生成gzip压缩的sitemap
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const sitemap = await generateSitemap();
  
  if (acceptEncoding.includes('gzip')) {
    const compressed = await gzipAsync(sitemap);
    
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Content-Encoding', 'gzip');
    res.write(compressed);
  } else {
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
  }
  
  res.end();
  return { props: {} };
};
```

### 6.3 定时生成

```bash
# Cron job配置
# 每天凌晨2点生成sitemap
0 2 * * * cd /path/to/project && npm run generate-sitemap
```

```typescript
// scripts/generate-sitemap.ts
import fs from 'fs';
import path from 'path';

async function generateAllSitemaps() {
  const baseUrl = 'https://example.com';
  const publicDir = path.join(process.cwd(), 'public');
  
  // 生成主sitemap
  const staticPages = await generateStaticSitemap();
  const blogPages = await generateBlogSitemap();
  const productPages = await generateProductSitemap();
  
  const allPages = [...staticPages, ...blogPages, ...productPages];
  const mainSitemap = generateSiteMapXML(
    allPages.map(page => ({
      loc: `${baseUrl}${page.url}`,
      lastmod: page.lastmod,
      changefreq: page.changefreq,
      priority: page.priority
    }))
  );
  
  fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    mainSitemap
  );
  
  console.log('✅ Sitemap generated successfully');
}

generateAllSitemaps().catch(console.error);
```

## 7. 提交与监控

### 7.1 Google Search Console提交

```typescript
// 自动提交sitemap到Google
import { google } from 'googleapis';

async function submitSitemapToGoogle(sitemapUrl: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/webmasters']
  });
  
  const webmasters = google.webmasters({
    version: 'v3',
    auth
  });
  
  await webmasters.sitemaps.submit({
    siteUrl: 'https://example.com',
    feedpath: sitemapUrl
  });
  
  console.log(`Sitemap submitted: ${sitemapUrl}`);
}

// 使用
await submitSitemapToGoogle('https://example.com/sitemap.xml');
```

### 7.2 Ping搜索引擎

```typescript
// 通知搜索引擎sitemap更新
async function pingSitemapUpdate(sitemapUrl: string) {
  const encodedUrl = encodeURIComponent(sitemapUrl);
  
  const pingUrls = [
    `https://www.google.com/ping?sitemap=${encodedUrl}`,
    `https://www.bing.com/ping?sitemap=${encodedUrl}`
  ];
  
  await Promise.all(
    pingUrls.map(url => 
      fetch(url).catch(err => console.error(`Ping failed for ${url}:`, err))
    )
  );
  
  console.log('Sitemap ping completed');
}

// 在sitemap更新后调用
await pingSitemapUpdate('https://example.com/sitemap.xml');
```

## 8. 测试与验证

### 8.1 验证工具

```typescript
// sitemap验证
async function validateSitemap(sitemapUrl: string) {
  const response = await fetch(sitemapUrl);
  const xml = await response.text();
  
  // 检查XML格式
  const urlCount = (xml.match(/<url>/g) || []).length;
  const size = new Blob([xml]).size;
  
  return {
    valid: urlCount <= 50000 && size <= 50 * 1024 * 1024,
    urlCount,
    size: (size / (1024 * 1024)).toFixed(2) + ' MB',
    warnings: [
      urlCount > 45000 && 'Approaching URL limit',
      size > 45 * 1024 * 1024 && 'Approaching size limit'
    ].filter(Boolean)
  };
}

// 使用
const result = await validateSitemap('https://example.com/sitemap.xml');
console.log(result);
```

### 8.2 自动化测试

```typescript
// sitemap.test.ts
describe('Sitemap', () => {
  it('should generate valid XML', async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });
  
  it('should include all required URLs', async () => {
    const sitemap = await generateSitemap();
    
    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/about</loc>');
  });
  
  it('should not exceed URL limit', async () => {
    const sitemap = await generateSitemap();
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    
    expect(urlCount).toBeLessThanOrEqual(50000);
  });
  
  it('should have valid lastmod dates', async () => {
    const sitemap = await generateSitemap();
    const dates = sitemap.match(/<lastmod>(.*?)<\/lastmod>/g) || [];
    
    dates.forEach(date => {
      const dateStr = date.replace(/<\/?lastmod>/g, '');
      expect(new Date(dateStr).toString()).not.toBe('Invalid Date');
    });
  });
});
```

## 9. 最佳实践

```typescript
const sitemapBestPractices = {
  structure: [
    '包含所有重要页面',
    '排除低质量/重复页面',
    '使用sitemap索引分离大型站点',
    '按内容类型分离sitemap',
    '保持URL一致性(https,尾斜杠等)'
  ],
  
  updates: [
    '内容更新时更新lastmod',
    '新页面发布时重新生成',
    '删除页面时从sitemap移除',
    '定期验证sitemap有效性',
    '监控索引状态'
  ],
  
  performance: [
    '使用缓存减少生成时间',
    '启用gzip压缩',
    '异步生成大型sitemap',
    '使用CDN分发',
    '设置合理的缓存策略'
  ],
  
  seo: [
    'priority设置合理(0.0-1.0)',
    'changefreq准确反映更新频率',
    '提供准确的lastmod日期',
    '多语言使用hreflang',
    '图片/视频使用专用sitemap'
  ]
};
```

## 10. 常见问题

```typescript
// 问题1: Sitemap过大
// 解决: 拆分为多个sitemap并使用sitemap索引

// 问题2: 动态页面更新
// 解决: 使用增量更新或缓存失效策略

// 问题3: 重复URL
// 解决: URL去重和规范化
function normalizeUrl(url: string): string {
  const normalized = new URL(url);
  // 移除查询参数
  normalized.search = '';
  // 移除fragment
  normalized.hash = '';
  // 统一尾斜杠
  if (!normalized.pathname.endsWith('/')) {
    normalized.pathname += '/';
  }
  return normalized.toString();
}

// 问题4: 性能问题
// 解决: 使用流式生成大型sitemap
import { Readable } from 'stream';

class SitemapStream extends Readable {
  private urls: any[];
  private index = 0;
  
  constructor(urls: any[]) {
    super();
    this.urls = urls;
  }
  
  _read() {
    if (this.index === 0) {
      this.push('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');
    }
    
    if (this.index < this.urls.length) {
      const url = this.urls[this.index];
      this.push(`<url><loc>${url.loc}</loc></url>\n`);
      this.index++;
    } else {
      this.push('</urlset>');
      this.push(null);
    }
  }
}
```

## 11. 总结

Sitemap生成的关键要点:

1. **完整性**: 包含所有重要页面
2. **准确性**: 提供正确的lastmod和priority
3. **性能**: 使用缓存和压缩优化性能
4. **维护**: 定期更新和验证sitemap
5. **分离**: 大型网站使用sitemap索引
6. **多样性**: 支持图片、视频、新闻等特殊sitemap
7. **提交**: 主动提交sitemap给搜索引擎

通过正确实施Sitemap策略,可以显著提升网站在搜索引擎中的索引效率和覆盖率。

