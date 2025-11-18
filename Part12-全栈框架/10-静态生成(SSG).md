# 静态生成 (SSG - Static Site Generation)

## 课程概述

本课程深入探讨 Next.js 15 中的静态站点生成(SSG)。静态生成是 Next.js 最重要的渲染策略之一,它在构建时生成HTML,提供最佳性能和SEO优势。掌握SSG对于构建高性能网站至关重要。

学习目标:
- 理解静态生成的原理和优势
- 掌握 generateStaticParams 的使用
- 学习静态和动态数据结合
- 理解构建时数据获取
- 掌握静态导出配置
- 学习增量静态生成(ISG)
- 理解静态生成的最佳实践
- 掌握性能优化技巧

---

## 一、静态生成基础

### 1.1 什么是静态生成

静态生成(SSG)在构建时生成HTML页面:

```typescript
// app/page.tsx
// 默认情况下,这是一个静态页面
export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Welcome to My Site</h1>
      <p className="text-gray-600 mt-4">
        This page is statically generated at build time.
      </p>
    </div>
  )
}
```

**静态生成的优势:**

| 优势 | 说明 |
|------|------|
| 极快的加载速度 | HTML已经生成,无需服务器渲染 |
| 优秀的SEO | 搜索引擎可以直接索引完整HTML |
| CDN友好 | 可以部署到全球CDN |
| 低服务器成本 | 减少服务器负载 |
| 可预览 | 可以在部署前预览所有页面 |

**适用场景:**

- 营销页面
- 博客文章
- 文档站点
- 产品展示页
- 内容不频繁变化的页面

### 1.2 静态生成 vs 其他渲染模式

```typescript
// 1. 静态生成 (SSG)
// app/blog/page.tsx
export default async function BlogPage() {
  // 构建时获取数据
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'force-cache' // 默认行为
  }).then(r => r.json())
  
  return <div>{/* 渲染内容 */}</div>
}

// 2. 服务端渲染 (SSR)
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // 每次请求时获取数据
  const data = await fetch('https://api.example.com/dashboard', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return <div>{/* 渲染内容 */}</div>
}

// 3. 客户端渲染 (CSR)
// app/profile/page.tsx
'use client'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(setData)
  }, [])
  
  return <div>{/* 渲染内容 */}</div>
}
```

### 1.3 静态生成配置

```typescript
// app/blog/page.tsx
// 路由段配置
export const dynamic = 'force-static' // 强制静态生成
export const revalidate = false // 不重新验证

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function BlogPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <article key={post.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
```

---

## 二、generateStaticParams

### 2.1 基础用法

```typescript
// app/posts/[id]/page.tsx
interface Post {
  id: string
  title: string
  content: string
}

// 生成静态参数
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return posts.map((post: Post) => ({
    id: post.id
  }))
}

// 获取单个文章数据
async function getPost(id: string): Promise<Post> {
  const res = await fetch(`https://api.example.com/posts/${id}`)
  return res.json()
}

// 页面组件
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="prose max-w-none">{post.content}</div>
    </article>
  )
}
```

### 2.2 多级动态路由

```typescript
// app/blog/[category]/[slug]/page.tsx
interface Post {
  category: string
  slug: string
  title: string
  content: string
}

export async function generateStaticParams() {
  const posts: Post[] = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return posts.map(post => ({
    category: post.category,
    slug: post.slug
  }))
}

async function getPost(category: string, slug: string): Promise<Post> {
  const res = await fetch(
    `https://api.example.com/posts/${category}/${slug}`
  )
  return res.json()
}

interface PageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export default async function PostPage({ params }: PageProps) {
  const { category, slug } = await params
  const post = await getPost(category, slug)
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <nav className="text-sm text-gray-600 mb-4">
        <a href="/blog">Blog</a> / 
        <a href={`/blog/${category}`}>{category}</a> / 
        {slug}
      </nav>
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="prose max-w-none">{post.content}</div>
    </article>
  )
}
```

### 2.3 父子路由参数

```typescript
// app/categories/[category]/page.tsx
export async function generateStaticParams() {
  const categories = ['electronics', 'clothing', 'books']
  
  return categories.map(category => ({
    category
  }))
}

// app/categories/[category]/products/[id]/page.tsx
interface PageProps {
  params: Promise<{
    category: string
    id: string
  }>
}

// 子路由可以访问父路由参数
export async function generateStaticParams({
  params
}: {
  params: { category: string }
}) {
  const products = await fetch(
    `https://api.example.com/categories/${params.category}/products`
  ).then(r => r.json())
  
  return products.map((product: any) => ({
    id: product.id
  }))
}

async function getProduct(category: string, id: string) {
  const res = await fetch(
    `https://api.example.com/categories/${category}/products/${id}`
  )
  return res.json()
}

export default async function ProductPage({ params }: PageProps) {
  const { category, id } = await params
  const product = await getProduct(category, id)
  
  return (
    <div className="container mx-auto p-4">
      <nav className="text-sm text-gray-600 mb-4">
        <a href="/">Home</a> /
        <a href="/categories">Categories</a> /
        <a href={`/categories/${category}`}>{category}</a> /
        {product.name}
      </nav>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-blue-600 mb-4">${product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 2.4 限制生成数量

```typescript
// app/posts/[id]/page.tsx
export const dynamicParams = true // 允许动态参数(默认)
// export const dynamicParams = false // 只允许预生成的参数

export async function generateStaticParams() {
  // 只预生成最热门的100篇文章
  const posts = await fetch(
    'https://api.example.com/posts?popular=true&limit=100'
  ).then(r => r.json())
  
  return posts.map((post: any) => ({
    id: post.id
  }))
}

// 当 dynamicParams = true 时,
// 访问未预生成的ID会在首次请求时生成
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  
  try {
    const post = await fetch(`https://api.example.com/posts/${id}`)
      .then(r => r.json())
    
    return (
      <article>
        <h1>{post.title}</h1>
        <div>{post.content}</div>
      </article>
    )
  } catch (error) {
    return <div>Post not found</div>
  }
}
```

---

## 三、静态数据获取

### 3.1 构建时数据获取

```typescript
// lib/posts.ts
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  id: string
  title: string
  date: string
  content: string
  excerpt: string
}

export async function getAllPosts(): Promise<Post[]> {
  const fileNames = await fs.readdir(postsDirectory)
  
  const posts = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async fileName => {
        const id = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        
        const { data, content } = matter(fileContents)
        
        return {
          id,
          title: data.title,
          date: data.date,
          content,
          excerpt: data.excerpt || content.substring(0, 200)
        }
      })
  )
  
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    
    const { data, content } = matter(fileContents)
    
    return {
      id,
      title: data.title,
      date: data.date,
      content,
      excerpt: data.excerpt || content.substring(0, 200)
    }
  } catch (error) {
    return null
  }
}

// app/blog/page.tsx
import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'

export default async function BlogPage() {
  const posts = await getAllPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.id} className="border-b pb-8">
            <Link
              href={`/blog/${post.id}`}
              className="text-2xl font-semibold hover:text-blue-600"
            >
              {post.title}
            </Link>
            <p className="text-gray-500 text-sm mt-2">{post.date}</p>
            <p className="text-gray-600 mt-4">{post.excerpt}</p>
            <Link
              href={`/blog/${post.id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

// app/blog/[id]/page.tsx
import { getAllPosts, getPostById } from '@/lib/posts'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  
  return posts.map(post => ({
    id: post.id
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPostById(id)
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-500 mb-8">{post.date}</p>
      <div className="prose max-w-none">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}
```

### 3.2 外部API数据获取

```typescript
// lib/api.ts
interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // 每小时重新验证
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }
  
  return res.json()
}

export async function getProductById(id: string): Promise<Product | null> {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 3600 }
  })
  
  if (!res.ok) {
    return null
  }
  
  return res.json()
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const res = await fetch(
    `https://api.example.com/products?category=${category}`,
    { next: { revalidate: 3600 } }
  )
  
  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }
  
  return res.json()
}

// app/products/page.tsx
import { getAllProducts } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProductsPage() {
  const products = await getAllProducts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold mb-2">{product.name}</h2>
              <p className="text-blue-600 font-bold">${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// app/products/[id]/page.tsx
import { getAllProducts, getProductById } from '@/lib/api'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export async function generateStaticParams() {
  const products = await getAllProducts()
  
  return products.map(product => ({
    id: product.id
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProductById(id)
  
  if (!product) {
    notFound()
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-blue-600 mb-6">${product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <button className="w-full md:w-auto px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3.3 数据库查询

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// lib/posts-db.ts
import { prisma } from './db'

export async function getAllPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: {
        include: {
          author: {
            select: {
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}

// app/blog/page.tsx
import { getAllPosts } from '@/lib/posts-db'
import Link from 'next/link'

export default async function BlogPage() {
  const posts = await getAllPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="space-y-6">
        {posts.map(post => (
          <article key={post.id} className="border rounded-lg p-6">
            <Link
              href={`/blog/${post.slug}`}
              className="text-2xl font-semibold hover:text-blue-600"
            >
              {post.title}
            </Link>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span>{post.author.name}</span>
              <span>•</span>
              <time>{new Date(post.createdAt).toLocaleDateString()}</time>
            </div>
            <p className="text-gray-600 mt-4">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

// app/blog/[slug]/page.tsx
import { getAllPosts, getPostBySlug } from '@/lib/posts-db'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  
  return posts.map(post => ({
    slug: post.slug
  }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center gap-2 mb-8 text-gray-600">
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="font-semibold">{post.author.name}</div>
          <div className="text-sm">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div
        className="prose max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Comments ({post.comments.length})
        </h2>
        <div className="space-y-4">
          {post.comments.map(comment => (
            <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                {comment.author.avatar && (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold">{comment.author.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
```

---

## 四、元数据生成

### 4.1 静态元数据

```typescript
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'Welcome to our website',
  keywords: ['next.js', 'react', 'ssg'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Home Page',
    description: 'Welcome to our website',
    url: 'https://example.com',
    siteName: 'My Site',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home Page',
    description: 'Welcome to our website',
    images: ['https://example.com/twitter-image.jpg']
  }
}

export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
    </div>
  )
}
```

### 4.2 动态元数据

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'
import { getPostBySlug } from '@/lib/posts'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${slug}`,
      siteName: 'My Blog',
      images: [
        {
          url: post.coverImage || 'https://example.com/default-og.jpg',
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage || 'https://example.com/default-twitter.jpg'],
      creator: `@${post.author.twitter}`
    }
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return <div>Post not found</div>
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}
```

### 4.3 JSON-LD结构化数据

```typescript
// app/blog/[slug]/page.tsx
import { getPostBySlug } from '@/lib/posts'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return <div>Post not found</div>
  }
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `https://example.com/authors/${post.author.id}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Blog',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png'
      }
    },
    description: post.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://example.com/blog/${slug}`
    }
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  )
}
```

---

## 五、静态导出

### 5.1 配置静态导出

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 启用静态导出
  
  // 可选配置
  images: {
    unoptimized: true // 静态导出需要禁用图片优化
  },
  
  // 自定义输出目录
  distDir: 'out',
  
  // 添加尾部斜杠
  trailingSlash: true,
  
  // 基础路径(用于子目录部署)
  // basePath: '/my-app'
}

module.exports = nextConfig
```

### 5.2 构建静态站点

```bash
# package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build"
  }
}

# 构建静态站点
npm run build

# 输出目录结构
# out/
#   ├── index.html
#   ├── about.html
#   ├── blog/
#   │   ├── post-1.html
#   │   └── post-2.html
#   ├── _next/
#   │   ├── static/
#   │   └── ...
#   └── ...
```

### 5.3 部署静态站点

```typescript
// 部署到 Vercel
// vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": "out"
}

// 部署到 Netlify
// netlify.toml
[build]
  command = "next build"
  publish = "out"

// 部署到 GitHub Pages
// .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

---

## 六、增量静态生成(ISG)

### 6.1 基础ISG配置

```typescript
// app/posts/[id]/page.tsx
export const revalidate = 60 // 每60秒重新验证

async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: { revalidate: 60 }
  })
  return res.json()
}

export async function generateStaticParams() {
  // 只预生成最热门的文章
  const posts = await fetch(
    'https://api.example.com/posts?popular=true&limit=100'
  ).then(r => r.json())
  
  return posts.map((post: any) => ({
    id: post.id
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-6">
        Last updated: {new Date().toLocaleString()}
      </p>
      <div className="prose max-w-none">{post.content}</div>
    </article>
  )
}
```

### 6.2 按需重新验证

```typescript
// app/api/revalidate/route.ts
import { NextRequest } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { path, tag, secret } = body
  
  // 验证密钥
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json(
      { error: 'Invalid secret' },
      { status: 401 }
    )
  }
  
  try {
    if (path) {
      // 按路径重新验证
      revalidatePath(path)
      return Response.json({
        revalidated: true,
        path,
        now: Date.now()
      })
    }
    
    if (tag) {
      // 按标签重新验证
      revalidateTag(tag)
      return Response.json({
        revalidated: true,
        tag,
        now: Date.now()
      })
    }
    
    return Response.json(
      { error: 'Path or tag required' },
      { status: 400 }
    )
  } catch (error) {
    return Response.json(
      { error: 'Error revalidating' },
      { status: 500 }
    )
  }
}

// 使用示例
// 当文章更新时触发重新验证
async function updatePost(id: string, data: any) {
  // 更新文章
  await fetch(`https://api.example.com/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  
  // 触发重新验证
  await fetch('https://your-site.com/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: `/posts/${id}`,
      secret: process.env.REVALIDATE_SECRET
    })
  })
}
```

### 6.3 标签缓存

```typescript
// app/posts/[id]/page.tsx
async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: {
      tags: [`post-${id}`, 'posts']
    }
  })
  return res.json()
}

async function getRelatedPosts(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}/related`, {
    next: {
      tags: ['posts']
    }
  })
  return res.json()
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const [post, relatedPosts] = await Promise.all([
    getPost(id),
    getRelatedPosts(id)
  ])
  
  return (
    <div className="container mx-auto p-4">
      <article className="max-w-3xl mb-12">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="prose max-w-none">{post.content}</div>
      </article>
      
      <aside>
        <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
        <div className="grid gap-4">
          {relatedPosts.map((relatedPost: any) => (
            <a
              key={relatedPost.id}
              href={`/posts/${relatedPost.id}`}
              className="border p-4 rounded hover:shadow"
            >
              <h3 className="font-semibold">{relatedPost.title}</h3>
            </a>
          ))}
        </div>
      </aside>
    </div>
  )
}

// 按标签重新验证
// POST /api/revalidate
// { "tag": "posts", "secret": "..." }
// 这会重新验证所有带 'posts' 标签的数据
```

---

## 七、混合渲染策略

### 7.1 静态+动态结合

```typescript
// app/products/[id]/page.tsx
// 静态生成产品信息
async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    cache: 'force-cache' // 静态缓存
  })
  return res.json()
}

// 动态获取库存信息
async function getStock(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}/stock`, {
    cache: 'no-store' // 不缓存
  })
  return res.json()
}

export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())
  
  return products.map((product: any) => ({
    id: product.id
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params
  
  // 静态产品信息
  const product = await getProduct(id)
  
  // 动态库存信息
  const stock = await getStock(id)
  
  return (
    <div className="container mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-blue-600 mb-4">${product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          {/* 动态库存信息 */}
          <div className="mb-6">
            {stock.available > 0 ? (
              <p className="text-green-600">
                In Stock: {stock.available} units
              </p>
            ) : (
              <p className="text-red-600">Out of Stock</p>
            )}
          </div>
          
          <button
            disabled={stock.available === 0}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 7.2 客户端数据补充

```typescript
// app/posts/[id]/page.tsx
// 服务端生成基础内容
async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`)
  return res.json()
}

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return posts.map((post: any) => ({
    id: post.id
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <article>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="prose max-w-none mb-8">{post.content}</div>
      </article>
      
      {/* 客户端组件获取动态数据 */}
      <CommentsSection postId={id} />
      <ViewCounter postId={id} />
    </div>
  )
}

// components/CommentsSection.tsx
'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(r => r.json())
      .then(data => {
        setComments(data)
        setLoading(false)
      })
  }, [postId])
  
  if (loading) {
    return <div>Loading comments...</div>
  }
  
  return (
    <section className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">
        Comments ({comments.length})
      </h2>
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
            <div className="font-semibold">{comment.author}</div>
            <p className="text-gray-700">{comment.content}</p>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(comment.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// components/ViewCounter.tsx
'use client'

import { useState, useEffect } from 'react'

export function ViewCounter({ postId }: { postId: string }) {
  const [views, setViews] = useState<number | null>(null)
  
  useEffect(() => {
    // 记录浏览
    fetch(`/api/posts/${postId}/views`, {
      method: 'POST'
    })
      .then(r => r.json())
      .then(data => setViews(data.views))
  }, [postId])
  
  if (views === null) {
    return null
  }
  
  return (
    <div className="text-sm text-gray-500 mt-4">
      {views} views
    </div>
  )
}
```

---

## 八、性能优化

### 8.1 并行数据获取

```typescript
// app/dashboard/page.tsx
async function getUser() {
  const res = await fetch('https://api.example.com/user')
  return res.json()
}

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

async function getStats() {
  const res = await fetch('https://api.example.com/stats')
  return res.json()
}

export default async function DashboardPage() {
  // 并行获取数据
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats()
  ])
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">User</h2>
          <p>{user.name}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Posts</h2>
          <p>{posts.length} posts</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Stats</h2>
          <p>{stats.views} views</p>
        </div>
      </div>
    </div>
  )
}
```

### 8.2 数据预加载

```typescript
// lib/data.ts
import { cache } from 'react'

export const getPost = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/posts/${id}`)
  return res.json()
})

export const preloadPost = (id: string) => {
  void getPost(id) // 触发预加载
}

// app/posts/PostCard.tsx
import Link from 'next/link'
import { preloadPost } from '@/lib/data'

export function PostCard({ post }: { post: any }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      onMouseEnter={() => preloadPost(post.id)}
      className="border rounded-lg p-4 hover:shadow-lg transition"
    >
      <h2 className="text-xl font-semibold">{post.title}</h2>
      <p className="text-gray-600 mt-2">{post.excerpt}</p>
    </Link>
  )
}
```

### 8.3 构建优化

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 SWC 最小化
  swcMinify: true,
  
  // 压缩输出
  compress: true,
  
  // 优化图片
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // 实验性功能
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lodash', 'date-fns']
  }
}

module.exports = nextConfig
```

---

## 九、实战案例

### 9.1 博客系统

```typescript
// 完整的静态博客实现
// content/posts/hello-world.md
/*
---
title: "Hello World"
date: "2024-01-01"
excerpt: "My first blog post"
tags: ["nextjs", "react"]
coverImage: "/images/hello-world.jpg"
---

# Hello World

This is my first blog post!
*/

// lib/posts.ts
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { cache } from 'react'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  coverImage: string
  content: string
}

export const getAllPosts = cache(async (): Promise<Post[]> => {
  const fileNames = await fs.readdir(postsDirectory)
  
  const posts = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async fileName => {
        const slug = fileName.replace(/\.md$/, '')
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        
        const { data, content } = matter(fileContents)
        
        return {
          slug,
          title: data.title,
          date: data.date,
          excerpt: data.excerpt,
          tags: data.tags || [],
          coverImage: data.coverImage || '',
          content
        }
      })
  )
  
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1))
})

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    
    const { data, content } = matter(fileContents)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      tags: data.tags || [],
      coverImage: data.coverImage || '',
      content
    }
  } catch (error) {
    return null
  }
})

export const getPostsByTag = cache(async (tag: string): Promise<Post[]> => {
  const posts = await getAllPosts()
  return posts.filter(post => post.tags.includes(tag))
})

export const getAllTags = cache(async (): Promise<string[]> => {
  const posts = await getAllPosts()
  const tags = new Set<string>()
  
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag))
  })
  
  return Array.from(tags).sort()
})

// app/blog/page.tsx
import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Blog',
  description: 'Read our latest articles'
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {post.coverImage && (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-4">
                {new Date(post.date).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// app/blog/[slug]/page.tsx
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image'
import Link from 'next/link'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  
  return posts.map(post => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return { title: 'Post Not Found' }
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    }
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={600}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}
      
      <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex items-center gap-4 mb-8 text-gray-600">
        <time>{new Date(post.date).toLocaleDateString()}</time>
        <div className="flex gap-2">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="prose max-w-none">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}

// app/blog/tag/[tag]/page.tsx
import { getAllTags, getPostsByTag } from '@/lib/posts'
import Link from 'next/link'

export async function generateStaticParams() {
  const tags = await getAllTags()
  
  return tags.map(tag => ({
    tag
  }))
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const posts = await getPostsByTag(tag)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">
        Posts tagged with "{tag}"
      </h1>
      <div className="space-y-6">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
            <div className="text-sm text-gray-500 mt-4">
              {new Date(post.date).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

### 9.2 文档站点

```typescript
// 完整的文档系统实现
// lib/docs.ts
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { cache } from 'react'

const docsDirectory = path.join(process.cwd(), 'content/docs')

export interface DocPage {
  path: string
  title: string
  description: string
  content: string
  prev?: { title: string; path: string }
  next?: { title: string; path: string }
}

export interface NavItem {
  title: string
  path: string
  children?: NavItem[]
}

export const getDocByPath = cache(async (docPath: string): Promise<DocPage | null> => {
  try {
    const fullPath = path.join(docsDirectory, `${docPath}.mdx`)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    
    const { data, content } = matter(fileContents)
    
    return {
      path: docPath,
      title: data.title,
      description: data.description,
      content,
      prev: data.prev,
      next: data.next
    }
  } catch (error) {
    return null
  }
})

export const getNavigation = cache(async (): Promise<NavItem[]> => {
  // 实际应用中从配置文件或数据库读取
  return [
    {
      title: 'Getting Started',
      path: 'getting-started',
      children: [
        { title: 'Introduction', path: 'getting-started/introduction' },
        { title: 'Installation', path: 'getting-started/installation' }
      ]
    },
    {
      title: 'Guides',
      path: 'guides',
      children: [
        { title: 'Basic Usage', path: 'guides/basic-usage' },
        { title: 'Advanced', path: 'guides/advanced' }
      ]
    }
  ]
})

// app/docs/[[...slug]]/page.tsx
import { getDocByPath, getNavigation } from '@/lib/docs'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'

function collectPaths(items: any[], prefix = ''): string[][] {
  let paths: string[][] = []
  
  for (const item of items) {
    const currentPath = prefix ? `${prefix}/${item.path}` : item.path
    paths.push(currentPath.split('/'))
    
    if (item.children) {
      paths = paths.concat(collectPaths(item.children, prefix))
    }
  }
  
  return paths
}

export async function generateStaticParams() {
  const navigation = await getNavigation()
  const paths = collectPaths(navigation)
  
  return [
    { slug: [] }, // 首页
    ...paths.map(path => ({ slug: path }))
  ]
}

export default async function DocsPage({
  params
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug = [] } = await params
  const docPath = slug.join('/') || 'index'
  
  const [doc, navigation] = await Promise.all([
    getDocByPath(docPath),
    getNavigation()
  ])
  
  if (!doc) {
    notFound()
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <nav className="sticky top-4">
            <h2 className="font-bold mb-4">Documentation</h2>
            {navigation.map(section => (
              <div key={section.path} className="mb-4">
                <div className="font-semibold mb-2">{section.title}</div>
                {section.children && (
                  <ul className="space-y-1 ml-4">
                    {section.children.map(item => (
                      <li key={item.path}>
                        <Link
                          href={`/docs/${item.path}`}
                          className={`block px-2 py-1 rounded text-sm ${
                            docPath === item.path
                              ? 'bg-blue-100 text-blue-700'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 max-w-4xl">
          <article className="prose max-w-none">
            <h1>{doc.title}</h1>
            {doc.description && <p className="lead">{doc.description}</p>}
            <MDXRemote source={doc.content} />
          </article>
          
          <div className="mt-12 pt-6 border-t flex justify-between">
            {doc.prev && (
              <Link
                href={`/docs/${doc.prev.path}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <span>←</span>
                <div>
                  <div className="text-sm text-gray-600">Previous</div>
                  <div className="font-semibold">{doc.prev.title}</div>
                </div>
              </Link>
            )}
            {doc.next && (
              <Link
                href={`/docs/${doc.next.path}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 ml-auto"
              >
                <div className="text-right">
                  <div className="text-sm text-gray-600">Next</div>
                  <div className="font-semibold">{doc.next.title}</div>
                </div>
                <span>→</span>
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
```

---

## 十、总结与最佳实践

### 10.1 何时使用静态生成

```typescript
// 适合静态生成的场景:
// ✓ 营销页面
// ✓ 博客文章
// ✓ 文档
// ✓ 电商产品页面
// ✓ 帮助中心

// 不适合静态生成的场景:
// ✗ 实时数据仪表板
// ✗ 用户个性化页面
// ✗ 频繁更新的数据
// ✗ 需要用户认证的页面
```

### 10.2 性能优化建议

```typescript
// 1. 并行数据获取
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2()
])

// 2. 使用 cache 避免重复请求
import { cache } from 'react'
export const getData = cache(async () => {
  // ...
})

// 3. 限制预生成数量
export async function generateStaticParams() {
  // 只预生成热门内容
  const popular = await getPopularPosts(100)
  return popular.map(post => ({ id: post.id }))
}

// 4. 使用 ISR 更新内容
export const revalidate = 3600 // 1小时

// 5. 优化图片
import Image from 'next/image'
<Image src={...} alt={...} />
```

### 10.3 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 构建时间过长 | 预生成页面太多 | 限制预生成数量,使用ISR |
| 数据不新鲜 | 静态缓存 | 使用revalidate或按需重新验证 |
| 404错误 | 未预生成页面 | 设置dynamicParams=true |
| 构建失败 | 数据获取错误 | 添加错误处理 |

### 10.4 学习资源

1. 官方文档
   - Static Generation: https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation
   - generateStaticParams: https://nextjs.org/docs/app/api-reference/functions/generate-static-params

2. 相关工具
   - gray-matter: 解析Front Matter
   - next-mdx-remote: MDX支持
   - remark/rehype: Markdown处理

3. 实践项目
   - 个人博客
   - 技术文档站
   - 产品展示网站
   - 营销落地页

---

## 课后练习

1. 创建一个静态博客系统
2. 实现一个文档网站
3. 构建一个产品目录页面
4. 实现ISR的内容管理系统
5. 优化大型静态站点的构建时间

通过本课程的学习,你应该能够熟练使用 Next.js 的静态生成功能,构建高性能的静态网站。记住:静态生成是性能和SEO的最佳选择!

