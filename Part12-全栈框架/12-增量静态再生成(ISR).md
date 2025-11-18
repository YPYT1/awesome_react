# 增量静态再生成 (ISR - Incremental Static Regeneration)

## 课程概述

本课程深入探讨 Next.js 15 中的增量静态再生成(ISR)。ISR结合了SSG和SSR的优势,允许在不重新构建整个网站的情况下更新静态内容。这是处理频繁更新内容的理想方案。

学习目标:
- 理解ISR的工作原理
- 掌握时间基础的重新验证
- 学习按需重新验证
- 理解ISR缓存策略
- 掌握动态参数生成
- 学习ISR的最佳实践
- 理解ISR的限制和注意事项
- 构建实际的ISR应用

---

## 一、ISR基础概念

### 1.1 什么是增量静态再生成

ISR允许你在构建后更新静态页面:

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 60 // 60秒后重新验证

interface Post {
  id: string
  title: string
  content: string
  updatedAt: string
}

async function getPost(slug: string): Promise<Post> {
  const res = await fetch(`https://api.example.com/posts/${slug}`)
  
  if (!res.ok) {
    throw new Error('Failed to fetch post')
  }
  
  return res.json()
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  
  return (
    <article className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-8">
        Last updated: {new Date(post.updatedAt).toLocaleString()}
      </p>
      <div className="prose max-w-none">{post.content}</div>
    </article>
  )
}

// 生成静态参数
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json())
  
  return posts.map((post: Post) => ({
    slug: post.id
  }))
}
```

**ISR工作流程:**

```
1. 首次请求
   ↓
2. 返回预渲染的页面(静态)
   ↓
3. revalidate 时间过后的下一次请求
   ↓
4. 仍返回旧页面(快速)
   ↓
5. 后台重新生成新页面
   ↓
6. 新页面生成成功
   ↓
7. 新页面替换旧页面
   ↓
8. 后续请求获得新页面
```

### 1.2 ISR vs SSG vs SSR

```typescript
// 1. 静态生成 (SSG) - 构建时生成,不更新
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us - Static content</div>
}

// 2. 增量静态再生成 (ISR) - 构建时生成,定期更新
// app/products/[id]/page.tsx
export const revalidate = 3600 // 1小时

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await fetch(`https://api.example.com/products/${id}`)
    .then(r => r.json())
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
    </div>
  )
}

// 3. 服务端渲染 (SSR) - 每次请求时生成
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/dashboard', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return <div>Real-time data: {data.value}</div>
}
```

**对比表:**

| 特性 | SSG | ISR | SSR |
|------|-----|-----|-----|
| 首次生成 | 构建时 | 构建时 | 请求时 |
| 后续更新 | 不更新 | 定期/按需 | 每次请求 |
| 性能 | 最快 | 快 | 慢 |
| 数据新鲜度 | 最旧 | 较新 | 最新 |
| 服务器负载 | 最低 | 低 | 高 |
| 适用场景 | 静态内容 | 频繁更新 | 实时数据 |

### 1.3 revalidate 配置

```typescript
// 方式1: 路由段配置
// app/news/page.tsx
export const revalidate = 60 // 60秒

export default async function NewsPage() {
  const news = await fetch('https://api.example.com/news')
    .then(r => r.json())
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>
      <div className="space-y-4">
        {news.map((item: any) => (
          <article key={item.id} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-600">{item.summary}</p>
            <time className="text-sm text-gray-500">
              {new Date(item.publishedAt).toLocaleString()}
            </time>
          </article>
        ))}
      </div>
    </div>
  )
}

// 方式2: fetch 级别配置
export default async function ProductsPage() {
  // 不同的数据源使用不同的 revalidate 时间
  const [featured, regular] = await Promise.all([
    fetch('https://api.example.com/products/featured', {
      next: { revalidate: 300 } // 5分钟
    }).then(r => r.json()),
    
    fetch('https://api.example.com/products', {
      next: { revalidate: 3600 } // 1小时
    }).then(r => r.json())
  ])
  
  return (
    <div>
      <section>
        <h2>Featured Products (Updates every 5 minutes)</h2>
        {/* 渲染特色产品 */}
      </section>
      
      <section>
        <h2>All Products (Updates every hour)</h2>
        {/* 渲染所有产品 */}
      </section>
    </div>
  )
}

// 方式3: 全局配置
// next.config.js
module.exports = {
  experimental: {
    // 为所有页面设置默认 revalidate
    staticPageGenerationTimeout: 60,
  }
}
```

---

## 二、时间基础重新验证

### 2.1 基本用法

```typescript
// app/blog/page.tsx
export const revalidate = 3600 // 1小时重新验证一次

interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  views: number
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch('https://api.example.com/posts')
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }
  
  return res.json()
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const generatedAt = new Date().toLocaleString()
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Blog</h1>
        <span className="text-sm text-gray-500">
          Generated at: {generatedAt}
        </span>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <a
            key={post.id}
            href={`/blog/${post.id}`}
            className="border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{post.author}</span>
              <span>{post.views} views</span>
            </div>
            <time className="block mt-2 text-sm text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          </a>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <p className="text-sm text-gray-600">
          This page is regenerated every hour. Next update after {generatedAt}.
        </p>
      </div>
    </div>
  )
}
```

### 2.2 不同时间间隔

```typescript
// lib/revalidate-times.ts
export const REVALIDATE_TIMES = {
  REALTIME: 0,        // SSR - 不缓存
  FAST: 10,           // 10秒 - 快速更新
  NORMAL: 60,         // 1分钟 - 常规更新
  MEDIUM: 300,        // 5分钟
  SLOW: 3600,         // 1小时
  DAILY: 86400,       // 1天
  WEEKLY: 604800,     // 1周
  STATIC: false       // SSG - 永不更新
}

// app/stocks/page.tsx
import { REVALIDATE_TIMES } from '@/lib/revalidate-times'

export const revalidate = REVALIDATE_TIMES.FAST // 10秒更新

async function getStockPrices() {
  const res = await fetch('https://api.example.com/stocks')
  return res.json()
}

export default async function StocksPage() {
  const stocks = await getStockPrices()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-2">Stock Prices</h1>
      <p className="text-sm text-gray-500 mb-8">
        Updates every 10 seconds
      </p>
      
      <div className="grid gap-4">
        {stocks.map((stock: any) => (
          <div key={stock.symbol} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-xl">{stock.symbol}</div>
                <div className="text-3xl font-semibold">
                  ${stock.price.toFixed(2)}
                </div>
              </div>
              <div className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                <div className="text-2xl font-bold">
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// app/articles/[id]/page.tsx
import { REVALIDATE_TIMES } from '@/lib/revalidate-times'

export const revalidate = REVALIDATE_TIMES.SLOW // 1小时更新

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  const article = await fetch(`https://api.example.com/articles/${id}`)
    .then(r => r.json())
  
  return <article>{/* 内容 */}</article>
}
```

### 2.3 混合重新验证策略

```typescript
// app/products/page.tsx
export const revalidate = 300 // 页面整体5分钟更新

async function getFeaturedProducts() {
  // 特色产品 - 更频繁更新
  const res = await fetch('https://api.example.com/products/featured', {
    next: { revalidate: 60 } // 1分钟
  })
  return res.json()
}

async function getCategories() {
  // 分类 - 较少更新
  const res = await fetch('https://api.example.com/categories', {
    next: { revalidate: 3600 } // 1小时
  })
  return res.json()
}

async function getProducts() {
  // 常规产品 - 使用页面默认设置
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

export default async function ProductsPage() {
  const [featured, categories, products] = await Promise.all([
    getFeaturedProducts(),  // 1分钟更新
    getCategories(),        // 1小时更新
    getProducts()           // 5分钟更新(页面默认)
  ])
  
  return (
    <div className="container mx-auto p-4">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <p className="text-sm text-gray-500 mb-4">Updates every minute</p>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((product: any) => (
            <div key={product.id} className="border rounded-lg p-4">
              <img src={product.image} alt={product.name} />
              <h3 className="font-semibold mt-2">{product.name}</h3>
              <p className="text-blue-600 font-bold">${product.price}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Shop by Category</h2>
        <p className="text-sm text-gray-500 mb-4">Updates every hour</p>
        <div className="flex gap-4 flex-wrap">
          {categories.map((category: any) => (
            <a
              key={category.id}
              href={`/products?category=${category.id}`}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              {category.name}
            </a>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-3xl font-bold mb-6">All Products</h2>
        <p className="text-sm text-gray-500 mb-4">Updates every 5 minutes</p>
        <div className="grid md:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product.id} className="border rounded-lg p-4">
              <img src={product.image} alt={product.name} />
              <h3 className="font-semibold mt-2">{product.name}</h3>
              <p className="text-blue-600 font-bold">${product.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## 三、按需重新验证

### 3.1 使用 revalidatePath

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  
  // 验证密钥
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    const { path, type = 'page' } = body
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }
    
    // 重新验证指定路径
    revalidatePath(path, type)
    
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

// 使用示例: curl -X POST http://localhost:3000/api/revalidate \
//   -H "x-revalidate-secret: your-secret" \
//   -H "Content-Type: application/json" \
//   -d '{"path": "/blog/post-1"}'
```

### 3.2 使用 revalidateTag

```typescript
// app/blog/[slug]/page.tsx
async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: {
      tags: [`post-${slug}`, 'posts'] // 设置标签
    }
  })
  return res.json()
}

async function getComments(postId: string) {
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`, {
    next: {
      tags: [`comments-${postId}`, 'comments']
    }
  })
  return res.json()
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const [post, comments] = await Promise.all([
    getPost(slug),
    getComments(slug)
  ])
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <article>
        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
        <div className="prose max-w-none mb-8">{post.content}</div>
      </article>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
              <div className="font-semibold">{comment.author}</div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// app/api/revalidate-tag/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }
  
  try {
    const { tag, tags } = await request.json()
    
    if (tag) {
      revalidateTag(tag)
    }
    
    if (Array.isArray(tags)) {
      tags.forEach(t => revalidateTag(t))
    }
    
    return NextResponse.json({
      revalidated: true,
      tag: tag || tags,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

// Webhook 示例 (从 CMS 触发)
// app/api/webhooks/content-update/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-webhook-signature')
  
  // 验证 webhook 签名
  if (!verifyWebhookSignature(signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  try {
    const payload = await request.json()
    const { type, id } = payload
    
    // 根据内容类型重新验证
    switch (type) {
      case 'post':
        revalidateTag(`post-${id}`)
        revalidateTag('posts')
        break
      
      case 'comment':
        revalidateTag(`comments-${payload.postId}`)
        break
      
      case 'product':
        revalidateTag(`product-${id}`)
        revalidateTag('products')
        break
      
      default:
        return NextResponse.json(
          { error: 'Unknown type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(signature: string | null): boolean {
  // 实现签名验证逻辑
  return signature === process.env.WEBHOOK_SECRET
}
```

### 3.3 Server Action 重新验证

```typescript
// app/posts/[id]/page.tsx
import { revalidatePath, revalidateTag } from 'next/cache'

async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: { tags: [`post-${id}`] }
  })
  return res.json()
}

// Server Action
async function updatePost(formData: FormData) {
  'use server'
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // 更新文章
  await fetch(`https://api.example.com/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })
  
  // 重新验证这篇文章
  revalidateTag(`post-${id}`)
  
  // 也可以重新验证整个列表页
  revalidatePath('/posts')
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Edit Post</h1>
      
      <form action={updatePost} className="space-y-6">
        <input type="hidden" name="id" value={id} />
        
        <div>
          <label className="block font-semibold mb-2">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            className="w-full p-3 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block font-semibold mb-2">Content</label>
          <textarea
            name="content"
            defaultValue={post.content}
            rows={10}
            className="w-full p-3 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
```

---

## 四、动态路由与ISR

### 4.1 generateStaticParams 基础

```typescript
// app/products/[id]/page.tsx
export const revalidate = 3600 // 1小时

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
}

// 生成静态参数
export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json())
  
  // 只预生成前100个产品
  return products.slice(0, 100).map((product: Product) => ({
    id: product.id
  }))
}

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`https://api.example.com/products/${id}`)
  
  if (!res.ok) {
    throw new Error('Product not found')
  }
  
  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(id)
  
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-6">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-gray-600 mb-8">{product.description}</p>
            
            <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 4.2 动态参数处理

```typescript
// app/blog/[category]/[slug]/page.tsx
export const revalidate = 600 // 10分钟

// dynamicParams 控制未预生成的路径行为
export const dynamicParams = true // true: 按需生成, false: 返回404

interface Post {
  id: string
  title: string
  content: string
  category: string
  slug: string
}

// 生成静态参数
export async function generateStaticParams() {
  // 只预生成热门文章
  const popularPosts = await fetch('https://api.example.com/posts/popular')
    .then(res => res.json())
  
  return popularPosts.map((post: Post) => ({
    category: post.category,
    slug: post.slug
  }))
}

async function getPost(category: string, slug: string): Promise<Post> {
  const res = await fetch(
    `https://api.example.com/posts/${category}/${slug}`
  )
  
  if (!res.ok) {
    throw new Error('Post not found')
  }
  
  return res.json()
}

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { category, slug } = await params
  const post = await getPost(category, slug)
  
  return (
    <article className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <a
          href={`/blog/${category}`}
          className="text-blue-600 hover:underline"
        >
          {category}
        </a>
      </div>
      
      <h1 className="text-5xl font-bold mb-8">{post.title}</h1>
      
      <div className="prose max-w-none">{post.content}</div>
    </article>
  )
}
```

### 4.3 多级动态路由

```typescript
// app/docs/[...slug]/page.tsx
export const revalidate = 3600 // 1小时

interface DocPage {
  slug: string[]
  title: string
  content: string
}

// 生成所有文档路径
export async function generateStaticParams() {
  const docs = await fetch('https://api.example.com/docs')
    .then(res => res.json())
  
  return docs.map((doc: DocPage) => ({
    slug: doc.slug
  }))
}

async function getDoc(slug: string[]): Promise<DocPage> {
  const path = slug.join('/')
  const res = await fetch(`https://api.example.com/docs/${path}`)
  
  if (!res.ok) {
    throw new Error('Doc not found')
  }
  
  return res.json()
}

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const doc = await getDoc(slug)
  
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <nav className="mb-8 text-sm text-gray-600">
          <a href="/docs" className="hover:underline">Docs</a>
          {slug.map((segment, index) => (
            <span key={index}>
              {' / '}
              <a
                href={`/docs/${slug.slice(0, index + 1).join('/')}`}
                className="hover:underline"
              >
                {segment}
              </a>
            </span>
          ))}
        </nav>
        
        <h1 className="text-4xl font-bold mb-8">{doc.title}</h1>
        
        <div className="prose max-w-none">{doc.content}</div>
      </div>
    </div>
  )
}
```

---

## 五、ISR缓存与优化

### 5.1 缓存层级

```typescript
// Next.js ISR 缓存层级:
// 1. CDN 层 (Vercel/Cloudflare)
// 2. Next.js 数据缓存
// 3. 应用层缓存

// app/api/cache-demo/route.ts
export async function GET() {
  // 设置缓存头
  return Response.json(
    { message: 'Hello' },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
    }
  )
}

// app/products/page.tsx
export const revalidate = 300 // Next.js 缓存: 5分钟

async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: {
      revalidate: 300, // 数据缓存: 5分钟
      tags: ['products']
    }
  })
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Products</h1>
      
      <div className="grid md:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img src={product.image} alt={product.name} />
            <h2 className="font-semibold mt-2">{product.name}</h2>
            <p className="text-blue-600 font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.2 缓存预热

```typescript
// scripts/warm-cache.ts
// 用于预热 ISR 缓存

async function warmCache() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  
  // 获取所有需要预热的路径
  const paths = [
    '/',
    '/about',
    '/products',
    '/blog'
  ]
  
  // 获取动态路径
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())
  
  products.forEach((p: any) => {
    paths.push(`/products/${p.id}`)
  })
  
  // 并发请求预热
  console.log(`Warming ${paths.length} pages...`)
  
  await Promise.all(
    paths.map(async (path) => {
      try {
        const res = await fetch(`${baseUrl}${path}`)
        console.log(`✓ ${path} - ${res.status}`)
      } catch (error) {
        console.error(`✗ ${path} - Error`)
      }
    })
  )
  
  console.log('Cache warming complete!')
}

warmCache()

// package.json
{
  "scripts": {
    "warm-cache": "tsx scripts/warm-cache.ts"
  }
}
```

### 5.3 缓存失效策略

```typescript
// lib/cache.ts
export class CacheManager {
  private static instance: CacheManager
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new CacheManager()
    }
    return this.instance
  }
  
  async invalidatePost(postId: string) {
    // 清除单个文章缓存
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': process.env.REVALIDATE_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/blog/${postId}`
      })
    })
  }
  
  async invalidateCategory(category: string) {
    // 清除分类缓存
    await fetch('/api/revalidate-tag', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': process.env.REVALIDATE_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag: `category-${category}`
      })
    })
  }
  
  async invalidateAll() {
    // 清除所有缓存
    await fetch('/api/revalidate-tag', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': process.env.REVALIDATE_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tags: ['posts', 'products', 'pages']
      })
    })
  }
}

// 使用示例
// app/admin/posts/[id]/edit/page.tsx
import { CacheManager } from '@/lib/cache'

async function handleUpdate(formData: FormData) {
  'use server'
  
  const id = formData.get('id') as string
  
  // 更新数据库
  // ...
  
  // 清除缓存
  const cache = CacheManager.getInstance()
  await cache.invalidatePost(id)
}
```

---

## 六、实战案例

### 6.1 博客系统

```typescript
// app/blog/page.tsx
export const revalidate = 60 // 1分钟更新

async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
  })
  return res.json()
}

export default async function BlogPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="space-y-6">
        {posts.map((post: any) => (
          <article key={post.id} className="border rounded-lg p-6">
            <a href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">
                {post.title}
              </h2>
            </a>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                By {post.author} • {new Date(post.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{post.views} views</span>
                <span>{post.commentsCount} comments</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// app/blog/[slug]/page.tsx
export const revalidate = 300 // 5分钟更新

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return posts.map((post: any) => ({
    slug: post.slug
  }))
}

async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { tags: [`post-${slug}`] }
  })
  return res.json()
}

async function getRelatedPosts(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}/related`, {
    next: { revalidate: 3600 } // 相关文章1小时更新
  })
  return res.json()
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const [post, related] = await Promise.all([
    getPost(slug),
    getRelatedPosts(slug)
  ])
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <article>
        <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 mb-8 text-gray-600">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="font-semibold">{post.author.name}</div>
            <div className="text-sm">
              {new Date(post.publishedAt).toLocaleDateString()} •{' '}
              {post.readingTime} min read
            </div>
          </div>
        </div>
        
        <div className="prose max-w-none mb-12">{post.content}</div>
        
        <div className="flex gap-2 mb-12">
          {post.tags.map((tag: string) => (
            <a
              key={tag}
              href={`/blog/tags/${tag}`}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
            >
              {tag}
            </a>
          ))}
        </div>
      </article>
      
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {related.map((relPost: any) => (
              <a
                key={relPost.id}
                href={`/blog/${relPost.slug}`}
                className="border rounded-lg p-4 hover:shadow-lg transition"
              >
                <h3 className="font-semibold mb-2">{relPost.title}</h3>
                <p className="text-sm text-gray-600">{relPost.excerpt}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

### 6.2 电商产品页

```typescript
// app/shop/products/[id]/page.tsx
export const revalidate = 1800 // 30分钟更新

export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())
  
  // 预生成前500个产品
  return products.slice(0, 500).map((p: any) => ({
    id: p.id
  }))
}

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { tags: [`product-${id}`] }
  })
  return res.json()
}

async function getReviews(productId: string) {
  const res = await fetch(
    `https://api.example.com/products/${productId}/reviews`,
    { next: { revalidate: 300 } } // 评论5分钟更新
  )
  return res.json()
}

async function getInventory(productId: string) {
  const res = await fetch(
    `https://api.example.com/products/${productId}/inventory`,
    { next: { revalidate: 60 } } // 库存1分钟更新
  )
  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  
  const [product, reviews, inventory] = await Promise.all([
    getProduct(id),
    getReviews(id),
    getInventory(id)
  ])
  
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-lg mb-4"
            />
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i + 2}`}
                  className="w-full rounded cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-500">
                ({reviews.length} reviews)
              </span>
            </div>
            
            <div className="text-4xl font-bold text-blue-600 mb-6">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-600 mb-8">{product.description}</p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Availability:</span>
                <span className={inventory.inStock ? 'text-green-600' : 'text-red-600'}>
                  {inventory.inStock ? `In Stock (${inventory.quantity})` : 'Out of Stock'}
                </span>
              </div>
            </div>
            
            <button
              disabled={!inventory.inStock}
              className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {inventory.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            <div className="mt-8 border-t pt-8">
              <h3 className="font-semibold mb-4">Product Details</h3>
              <dl className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-gray-600">{key}:</dt>
                    <dd className="font-semibold">{value as string}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <div key={review.id} className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold">{review.author}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">⭐</span>
                    <span className="font-semibold">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700">{review.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
```

---

## 七、最佳实践与注意事项

### 7.1 选择合适的 revalidate 时间

```typescript
// 根据内容更新频率选择:

// 实时数据 (0秒 - SSR)
export const revalidate = 0
// 适用于: 用户仪表板, 个人资料

// 快速更新 (10-60秒)
export const revalidate = 30
// 适用于: 股票价格, 体育比分

// 常规更新 (5-15分钟)
export const revalidate = 300
// 适用于: 新闻文章, 社交媒体feed

// 慢速更新 (1-6小时)
export const revalidate = 3600
// 适用于: 博客文章, 产品信息

// 每日更新 (24小时)
export const revalidate = 86400
// 适用于: 文档, 静态内容
```

### 7.2 错误处理

```typescript
// app/posts/[id]/page.tsx
export const revalidate = 300
export const dynamicParams = true

async function getPost(id: string) {
  try {
    const res = await fetch(`https://api.example.com/posts/${id}`)
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Post not found')
      }
      throw new Error('Failed to fetch post')
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching post:', error)
    throw error
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  
  try {
    const post = await getPost(id)
    return <article>{/* 渲染内容 */}</article>
  } catch (error) {
    // 返回错误页面但保持 ISR 行为
    return (
      <div className="container mx-auto p-4 text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <a href="/blog" className="text-blue-600 hover:underline">
          Back to Blog
        </a>
      </div>
    )
  }
}
```

### 7.3 监控与调试

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 添加缓存状态头
  if (request.headers.get('x-nextjs-cache')) {
    response.headers.set(
      'x-cache-status',
      request.headers.get('x-nextjs-cache')!
    )
  }
  
  // 添加生成时间
  response.headers.set('x-generated-at', new Date().toISOString())
  
  return response
}

// 在浏览器中检查:
// console.log(performance.getEntriesByType('navigation')[0])
```

### 7.4 性能优化清单

```typescript
// ✓ 使用合适的 revalidate 时间
export const revalidate = 300

// ✓ 并行数据获取
const [data1, data2] = await Promise.all([fetch1(), fetch2()])

// ✓ 使用数据标签
fetch(url, { next: { tags: ['products'] } })

// ✓ 实现按需重新验证
revalidateTag('products')

// ✓ 预生成热门页面
export async function generateStaticParams() {
  return popularItems.map(item => ({ id: item.id }))
}

// ✓ 监控缓存命中率
// 使用 Vercel Analytics 或自定义监控

// ✓ 设置适当的 CDN 缓存
headers: {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
}
```

---

## 八、总结

### 8.1 ISR适用场景

| 场景 | 适合 | 原因 |
|------|------|------|
| 博客/新闻 | ✓ | 内容定期更新,不需要实时 |
| 电商产品页 | ✓ | 价格和库存较稳定 |
| 文档站点 | ✓ | 内容更新不频繁 |
| 个人资料 | ✗ | 需要实时的用户数据 |
| 实时仪表板 | ✗ | 需要最新数据 |

### 8.2 关键要点

1. **时间基础重新验证**: 定期自动更新内容
2. **按需重新验证**: 内容变更时立即更新
3. **混合策略**: 不同内容使用不同的更新频率
4. **缓存标签**: 使用标签批量管理缓存
5. **动态参数**: 预生成热门页面,其他按需生成

### 8.3 学习资源

1. 官方文档
   - ISR: https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating
   - generateStaticParams: https://nextjs.org/docs/app/api-reference/functions/generate-static-params

2. 实践示例
   - Next.js Commerce
   - Next.js Blog Starter

---

## 课后练习

1. 创建一个使用ISR的博客系统
2. 实现按需重新验证API
3. 构建一个电商产品页面
4. 优化一个大型内容网站的ISR策略
5. 实现缓存预热脚本

通过本课程的学习,你应该能够熟练使用 Next.js 的增量静态再生成功能,在性能和数据新鲜度之间找到最佳平衡!

