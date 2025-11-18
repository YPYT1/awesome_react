# Metadata 与 SEO 优化

## 课程概述

本课程深入探讨 Next.js 15 中的元数据管理和SEO优化。Next.js 提供了强大的元数据API,帮助开发者轻松优化网站的搜索引擎排名和社交媒体分享体验。

学习目标:
- 理解 SEO 的重要性
- 掌握元数据 API
- 学习静态和动态元数据
- 理解 Open Graph 和 Twitter Cards
- 掌握结构化数据
- 学习 Sitemap 和 Robots.txt
- 理解规范化 URL
- 构建 SEO 友好的应用

---

## 一、SEO 基础

### 1.1 什么是 SEO

```typescript
// SEO (Search Engine Optimization) - 搜索引擎优化
// 目标: 提高网站在搜索引擎中的排名

// 关键因素:
// 1. 内容质量
// 2. 页面标题和描述
// 3. 元数据标签
// 4. 结构化数据
// 5. 页面加载速度
// 6. 移动端友好性
// 7. URL 结构
// 8. 内部链接
// 9. 外部链接
// 10. 社交信号
```

**SEO 的重要性:**

| 方面 | 说明 |
|------|------|
| 流量来源 | 70% 的网站流量来自搜索引擎 |
| 品牌可见度 | 提高品牌知名度 |
| 用户信任 | 高排名增加用户信任 |
| 投资回报 | 长期稳定的流量来源 |
| 竞争优势 | 超越竞争对手 |

### 1.2 Next.js 的 SEO 优势

```typescript
// Next.js 对 SEO 友好:
// ✓ 服务端渲染 (SSR)
// ✓ 静态生成 (SSG)
// ✓ 完整的 HTML
// ✓ 快速加载
// ✓ 元数据 API
// ✓ 自动 sitemap
// ✓ 图片优化
// ✓ 字体优化

// ✗ 传统 SPA 问题:
// - 客户端渲染
// - 空白 HTML
// - 搜索引擎难以索引
// - SEO 效果差
```

### 1.3 元数据基础

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Welcome to my website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// 生成的 HTML:
// <head>
//   <title>My Website</title>
//   <meta name="description" content="Welcome to my website" />
// </head>
```

---

## 二、元数据 API

### 2.1 基础元数据

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // 标题
  title: 'My Website',
  
  // 描述
  description: 'This is my amazing website',
  
  // 关键词
  keywords: ['Next.js', 'React', 'TypeScript', 'SEO'],
  
  // 作者
  authors: [
    { name: 'John Doe' },
    { name: 'Jane Smith', url: 'https://janesmith.com' }
  ],
  
  // 创建者
  creator: 'John Doe',
  
  // 发布者
  publisher: 'My Company',
  
  // 格式检测
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### 2.2 标题模板

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'My Website',
    template: '%s | My Website', // %s 会被子页面标题替换
  },
  description: 'Welcome to my website',
}

// app/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog', // 最终显示: "Blog | My Website"
}

// app/blog/[slug]/page.tsx
export const metadata: Metadata = {
  title: 'Post Title', // 最终显示: "Post Title | My Website"
}

// 绝对标题 (忽略模板)
export const metadata: Metadata = {
  title: {
    absolute: 'Standalone Page', // 最终显示: "Standalone Page"
  },
}
```

### 2.3 基础标签

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // 字符集 (自动添加)
  // <meta charset="utf-8" />
  
  // 视口 (自动添加)
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  
  // 主题颜色
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  
  // 颜色方案
  colorScheme: 'light dark',
  
  // 机器人
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 验证
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
    other: {
      me: ['my-email', 'my-link'],
    },
  },
}
```

### 2.4 图标和清单

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // 图标
  icons: {
    icon: '/favicon.ico',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
  
  // 清单文件
  manifest: '/manifest.json',
  
  // 应用链接
  appleWebApp: {
    title: 'My App',
    statusBarStyle: 'black-translucent',
    startupImage: [
      '/apple-startup-1.png',
      '/apple-startup-2.png',
    ],
  },
}

// public/manifest.json
{
  "name": "My Website",
  "short_name": "MyWeb",
  "description": "My amazing website",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 三、Open Graph 和 Twitter Cards

### 3.1 Open Graph 基础

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Welcome to my website',
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://example.com',
    title: 'My Website',
    description: 'Welcome to my website',
    siteName: 'My Website',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My Website',
      },
    ],
  },
}

// 生成的 HTML:
// <meta property="og:type" content="website" />
// <meta property="og:locale" content="en_US" />
// <meta property="og:url" content="https://example.com" />
// <meta property="og:title" content="My Website" />
// <meta property="og:description" content="Welcome to my website" />
// <meta property="og:site_name" content="My Website" />
// <meta property="og:image" content="https://example.com/og-image.jpg" />
// <meta property="og:image:width" content="1200" />
// <meta property="og:image:height" content="630" />
// <meta property="og:image:alt" content="My Website" />
```

### 3.2 文章元数据

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    
    openGraph: {
      type: 'article',
      url: `https://example.com/blog/${slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      section: post.category,
      tags: post.tags,
    },
  }
}

async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`)
  return res.json()
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### 3.3 Twitter Cards

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Welcome to my website',
  
  twitter: {
    card: 'summary_large_image',
    site: '@mywebsite',
    creator: '@johndoe',
    title: 'My Website',
    description: 'Welcome to my website',
    images: ['https://example.com/twitter-image.jpg'],
  },
}

// 卡片类型:
// - 'summary': 小图片摘要
// - 'summary_large_image': 大图片摘要
// - 'app': 应用卡片
// - 'player': 播放器卡片
```

### 3.4 动态社交图片

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: `https://example.com/api/og?title=${encodeURIComponent(post.title)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`https://example.com/api/og?title=${encodeURIComponent(post.title)}`],
    },
  }
}

// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'My Website'
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #3b82f6, #1e40af)',
          color: 'white',
          fontSize: 60,
          fontWeight: 'bold',
          padding: '50px',
        }}
      >
        {title}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

## 四、动态元数据

### 4.1 generateMetadata 函数

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from 'next'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://api.example.com/products/${id}`)
  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  
  return {
    title: product.name,
    description: product.description,
    
    openGraph: {
      type: 'product',
      url: `https://example.com/products/${id}`,
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image],
    },
    
    // 额外的产品信息
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': 'USD',
      'product:category': product.category,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
    </div>
  )
}
```

### 4.2 父子元数据合并

```typescript
// app/layout.tsx (父级)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | My Website',
    default: 'My Website',
  },
  description: 'Welcome to my website',
  openGraph: {
    siteName: 'My Website',
    locale: 'en_US',
  },
}

// app/blog/layout.tsx (子级)
export const metadata: Metadata = {
  title: 'Blog', // 继承 template: "Blog | My Website"
  openGraph: {
    type: 'website', // 与父级合并
  },
}

// app/blog/[slug]/page.tsx (孙级)
export const metadata: Metadata = {
  title: 'Post Title', // "Post Title | My Website"
  openGraph: {
    type: 'article', // 覆盖父级的 type
  },
}

// 最终元数据 (合并结果):
// {
//   title: "Post Title | My Website",
//   description: "Welcome to my website",
//   openGraph: {
//     siteName: "My Website",
//     locale: "en_US",
//     type: "article"
//   }
// }
```

### 4.3 元数据依赖

```typescript
// app/users/[id]/page.tsx
import type { Metadata } from 'next'

interface User {
  id: string
  name: string
  bio: string
  avatar: string
  postsCount: number
}

async function getUser(id: string): Promise<User> {
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const user = await getUser(id)
  
  return {
    title: `${user.name} (@${id})`,
    description: user.bio,
    
    openGraph: {
      type: 'profile',
      url: `https://example.com/users/${id}`,
      title: user.name,
      description: user.bio,
      images: [
        {
          url: user.avatar,
          width: 400,
          height: 400,
          alt: user.name,
        },
      ],
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ')[1],
      username: id,
    },
  }
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser(id)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <p>{user.postsCount} posts</p>
    </div>
  )
}
```

---

## 五、结构化数据

### 5.1 JSON-LD 基础

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'My Website',
    url: 'https://example.com',
    description: 'Welcome to my website',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://example.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }
  
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
```

### 5.2 文章结构化数据

```typescript
// app/blog/[slug]/page.tsx
interface Post {
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    url: string
  }
  publishedAt: string
  updatedAt: string
  coverImage: string
}

export default function BlogPostPage({ post }: { post: Post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Website',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://example.com/blog/${post.slug}`,
    },
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  )
}
```

### 5.3 产品结构化数据

```typescript
// app/products/[id]/page.tsx
interface Product {
  name: string
  description: string
  image: string
  price: number
  currency: string
  availability: 'InStock' | 'OutOfStock'
  rating: number
  reviewCount: number
}

export default function ProductPage({ product }: { product: Product }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: `https://example.com/products/${product.id}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>${product.price}</p>
      </div>
    </>
  )
}
```

### 5.4 面包屑导航

```typescript
// components/breadcrumbs.tsx
export default function Breadcrumbs({ items }: {
  items: { name: string; url: string }[]
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-2">
          {items.map((item, index) => (
            <li key={index}>
              <a href={item.url}>{item.name}</a>
              {index < items.length - 1 && ' > '}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// 使用
export default function ProductPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: 'Product Name', url: '/products/123' },
        ]}
      />
    </div>
  )
}
```

---

## 六、Sitemap 和 Robots.txt

### 6.1 静态 Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://example.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}
```

### 6.2 动态 Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

async function getProducts() {
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, products] = await Promise.all([getPosts(), getProducts()])
  
  const postUrls = posts.map((post: any) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))
  
  const productUrls = products.map((product: any) => ({
    url: `https://example.com/products/${product.id}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    ...postUrls,
    ...productUrls,
  ]
}
```

### 6.3 robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  }
}

// 生成的 robots.txt:
// User-Agent: *
// Allow: /
// Disallow: /private/
// Disallow: /admin/
//
// User-Agent: Googlebot
// Allow: /
// Disallow: /api/
//
// Sitemap: https://example.com/sitemap.xml
```

### 6.4 多个 Sitemap

```typescript
// app/sitemap.ts (主 sitemap)
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com/sitemap/posts.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://example.com/sitemap/products.xml',
      lastModified: new Date(),
    },
  ]
}

// app/sitemap/posts/route.ts
export async function GET() {
  const posts = await getPosts()
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
    .map(
      (post: any) => `
    <url>
      <loc>https://example.com/blog/${post.slug}</loc>
      <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>
  `
    )
    .join('')}
</urlset>`
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
```

---

## 七、规范化 URL

### 7.1 Canonical URL

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  
  return {
    title: 'Blog Post',
    alternates: {
      canonical: `https://example.com/blog/${slug}`,
    },
  }
}

// 生成的 HTML:
// <link rel="canonical" href="https://example.com/blog/post-slug" />
```

### 7.2 多语言替代

```typescript
// app/[locale]/page.tsx
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: 'Home',
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: {
        'en-US': 'https://example.com/en',
        'zh-CN': 'https://example.com/zh',
        'ja-JP': 'https://example.com/ja',
        'x-default': 'https://example.com/en',
      },
    },
  }
}

// 生成的 HTML:
// <link rel="canonical" href="https://example.com/en" />
// <link rel="alternate" hreflang="en-US" href="https://example.com/en" />
// <link rel="alternate" hreflang="zh-CN" href="https://example.com/zh" />
// <link rel="alternate" hreflang="ja-JP" href="https://example.com/ja" />
// <link rel="alternate" hreflang="x-default" href="https://example.com/en" />
```

### 7.3 RSS Feed

```typescript
// app/feed.xml/route.ts
export async function GET() {
  const posts = await getPosts()
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>My Blog</title>
    <link>https://example.com</link>
    <description>My amazing blog</description>
    <language>en-US</language>
    <atom:link href="https://example.com/feed.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post: any) => `
      <item>
        <title>${post.title}</title>
        <link>https://example.com/blog/${post.slug}</link>
        <description>${post.excerpt}</description>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <guid>https://example.com/blog/${post.slug}</guid>
      </item>
    `
      )
      .join('')}
  </channel>
</rss>`
  
  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

// 在 layout 中添加链接
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 八、实战案例

### 8.1 博客 SEO 优化

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

interface Post {
  slug: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    url: string
    avatar: string
  }
  publishedAt: string
  updatedAt: string
  coverImage: string
  tags: string[]
  category: string
  readingTime: number
}

async function getPost(slug: string): Promise<Post> {
  const res = await fetch(`https://api.example.com/posts/${slug}`)
  return res.json()
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name, url: post.author.url }],
    
    openGraph: {
      type: 'article',
      url: `https://example.com/blog/${slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      section: post.category,
      tags: post.tags,
    },
    
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: '@' + post.author.name,
    },
    
    alternates: {
      canonical: `https://example.com/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: post.author.url,
      image: post.author.avatar,
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://example.com/blog/${slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readingTime}M`,
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="prose max-w-none">
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  )
}
```

### 8.2 电商产品 SEO

```typescript
// app/products/[id]/page.tsx
import type { Metadata } from 'next'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  brand: string
  category: string
  sku: string
  availability: 'InStock' | 'OutOfStock'
  rating: number
  reviewCount: number
}

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://api.example.com/products/${id}`)
  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  
  return {
    title: `${product.name} - ${product.brand}`,
    description: product.description,
    
    openGraph: {
      type: 'product',
      url: `https://example.com/products/${id}`,
      title: product.name,
      description: product.description,
      images: product.images.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
    
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
    
    other: {
      'product:price:amount': product.price.toString(),
      'product:price:currency': product.currency,
      'product:brand': product.brand,
      'product:availability': product.availability,
      'product:condition': 'new',
    },
    
    alternates: {
      canonical: `https://example.com/products/${id}`,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      url: `https://example.com/products/${id}`,
      seller: {
        '@type': 'Organization',
        name: 'My Store',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p>${product.price}</p>
      </div>
    </>
  )
}
```

---

## 九、最佳实践

### 9.1 SEO 检查清单

```typescript
// ✓ 唯一的 title 和 description
// ✓ 标题长度 50-60 字符
// ✓ 描述长度 150-160 字符
// ✓ 使用关键词但不过度
// ✓ Open Graph 和 Twitter Cards
// ✓ 结构化数据 (JSON-LD)
// ✓ Sitemap.xml
// ✓ robots.txt
// ✓ 规范化 URL
// ✓ 语义化 HTML
// ✓ 图片 alt 文字
// ✓ 移动端友好
// ✓ 快速加载速度
// ✓ HTTPS
// ✓ 内部链接
```

### 9.2 常见错误

```typescript
// ✗ 重复的 title
// ✗ 缺少 description
// ✗ 描述过短或过长
// ✗ 关键词堆砌
// ✗ 缺少 alt 文字
// ✗ 404 页面无元数据
// ✗ URL 包含特殊字符
// ✗ 缺少移动端适配
// ✗ 加载速度慢
// ✗ 缺少结构化数据
```

### 9.3 性能优化

```typescript
// 1. 使用静态生成
export const revalidate = 3600 // ISR

// 2. 缓存元数据
export async function generateMetadata() {
  const data = await getCachedData()
  // ...
}

// 3. 优化图片
import Image from 'next/image'

// 4. 最小化 JavaScript
// Next.js 自动优化

// 5. 使用 CDN
// Vercel 自动提供
```

### 9.4 学习资源

1. 官方文档
   - Metadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   - SEO: https://nextjs.org/learn/seo/introduction-to-seo

2. SEO 工具
   - Google Search Console
   - Google PageSpeed Insights
   - Lighthouse
   - Screaming Frog

3. 验证工具
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - Google Rich Results Test

---

## 课后练习

1. 为你的网站添加完整的元数据
2. 实现动态 Open Graph 图片
3. 添加结构化数据
4. 创建 Sitemap 和 Robots.txt
5. 使用 SEO 工具测试和优化

通过本课程的学习,你应该能够为 Next.js 应用实现全面的 SEO 优化,提升网站在搜索引擎中的可见度!

