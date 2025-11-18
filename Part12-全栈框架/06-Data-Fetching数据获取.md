# Data Fetching 数据获取

## 课程概述

本课程深入探讨 Next.js 15 中的数据获取策略和最佳实践。Next.js 提供了多种数据获取方式,包括服务端组件数据获取、客户端数据获取、并行数据获取、流式渲染等。掌握这些技术对于构建高性能的全栈应用至关重要。

学习目标:
- 理解 Next.js 中的数据获取模式
- 掌握服务端组件数据获取
- 学习客户端数据获取策略
- 理解数据缓存机制
- 掌握并行和顺序数据获取
- 学习流式渲染技术
- 理解数据重新验证
- 掌握错误处理和加载状态

---

## 一、数据获取基础

### 1.1 数据获取模式概述

Next.js 15 支持多种数据获取模式:

```typescript
// 1. 服务端组件数据获取 (推荐)
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const result = await data.json()
  
  return <div>{result.title}</div>
}

// 2. 客户端数据获取
'use client'
import { useState, useEffect } from 'react'

export default function ClientPage() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(setData)
  }, [])
  
  return <div>{data?.title}</div>
}

// 3. Server Actions
'use server'
export async function getData() {
  const data = await fetch('https://api.example.com/data')
  return data.json()
}
```

**数据获取位置对比:**

| 位置 | 优势 | 劣势 | 使用场景 |
|------|------|------|----------|
| 服务端组件 | SEO友好、减少客户端JS、安全 | 不能使用浏览器API | 初始数据加载 |
| 客户端组件 | 交互性强、实时更新 | SEO不友好、增加客户端负担 | 用户交互数据 |
| Server Actions | 类型安全、自动序列化 | 需要服务端支持 | 表单提交、数据变更 |

### 1.2 Fetch API 增强

Next.js 扩展了原生 `fetch` API:

```typescript
// 基础用法
async function getData() {
  const res = await fetch('https://api.example.com/posts')
  
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  
  return res.json()
}

// 带缓存控制
async function getCachedData() {
  // 强制缓存 (类似 getStaticProps)
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache'
  })
  
  return res.json()
}

// 不缓存 (类似 getServerSideProps)
async function getDynamicData() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store'
  })
  
  return res.json()
}

// 定时重新验证
async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // 每小时重新验证
  })
  
  return res.json()
}
```

**Fetch 选项详解:**

```typescript
interface FetchOptions {
  // 标准 fetch 选项
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: HeadersInit
  body?: BodyInit
  
  // Next.js 扩展选项
  cache?: 'force-cache' | 'no-store'
  next?: {
    revalidate?: number | false  // 重新验证时间(秒)
    tags?: string[]              // 缓存标签
  }
}

// 实际应用示例
async function fetchWithOptions() {
  const res = await fetch('https://api.example.com/posts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`
    },
    cache: 'no-store',
    next: {
      revalidate: 60,
      tags: ['posts']
    }
  })
  
  return res.json()
}
```

### 1.3 数据获取最佳实践

```typescript
// 1. 错误处理
async function getDataWithErrorHandling() {
  try {
    const res = await fetch('https://api.example.com/data')
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    const data = await res.json()
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
}

// 2. 类型安全
interface Post {
  id: number
  title: string
  content: string
  author: {
    name: string
    email: string
  }
}

async function getTypedData(): Promise<Post[]> {
  const res = await fetch('https://api.example.com/posts')
  const data: Post[] = await res.json()
  return data
}

// 3. 环境变量使用
async function getSecureData() {
  const res = await fetch(`${process.env.API_URL}/data`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_SECRET}`
    }
  })
  
  return res.json()
}

// 4. 超时处理
async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const res = await fetch(url, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return res.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}
```

---

## 二、服务端组件数据获取

### 2.1 基础服务端数据获取

```typescript
// app/posts/page.tsx
interface Post {
  id: number
  title: string
  body: string
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    cache: 'no-store' // 动态数据
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }
  
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div className="grid gap-4">
        {posts.map(post => (
          <article key={post.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### 2.2 数据库查询

```typescript
// lib/db.ts
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

// app/users/page.tsx
import { query } from '@/lib/db'

interface User {
  id: number
  name: string
  email: string
  created_at: Date
}

async function getUsers(): Promise<User[]> {
  return query<User>('SELECT * FROM users ORDER BY created_at DESC')
}

export default async function UsersPage() {
  const users = await getUsers()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-2 border">{user.id}</td>
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### 2.3 ORM 集成 (Prisma)

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
  posts Post[]
}

// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// app/posts/page.tsx
import { prisma } from '@/lib/prisma'

async function getPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Published Posts</h1>
      <div className="space-y-6">
        {posts.map(post => (
          <article key={post.id} className="border p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.content}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>By {post.author.name}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### 2.4 动态路由数据获取

```typescript
// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true
    }
  })
  
  return post
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(parseInt(id))
  
  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }
  
  return {
    title: post.title,
    description: post.content.substring(0, 160)
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(parseInt(id))
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center gap-4 mb-6 text-gray-600">
        <span>By {post.author.name}</span>
        <span>•</span>
        <time>{new Date(post.createdAt).toLocaleDateString()}</time>
      </div>
      <div className="prose max-w-none">
        {post.content}
      </div>
    </article>
  )
}

// 生成静态路径
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { id: true }
  })
  
  return posts.map(post => ({
    id: post.id.toString()
  }))
}
```

---

## 三、并行与顺序数据获取

### 3.1 并行数据获取

```typescript
// app/dashboard/page.tsx
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
}

async function getPosts(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/posts`)
  return res.json()
}

async function getComments(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/comments`)
  return res.json()
}

// 并行获取数据 - 推荐方式
export default async function DashboardPage() {
  // 同时发起所有请求
  const [user, posts, comments] = await Promise.all([
    getUser('1'),
    getPosts('1'),
    getComments('1')
  ])
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">User Info</h2>
        <p>{user.name} - {user.email}</p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Posts ({posts.length})</h2>
        <ul>
          {posts.map((post: any) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-2">Comments ({comments.length})</h2>
        <ul>
          {comments.map((comment: any) => (
            <li key={comment.id}>{comment.text}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
```

**性能对比:**

```typescript
// 顺序获取 - 慢 (总时间 = 时间1 + 时间2 + 时间3)
async function sequentialFetch() {
  const user = await getUser('1')      // 100ms
  const posts = await getPosts('1')    // 200ms
  const comments = await getComments('1') // 150ms
  // 总时间: 450ms
  return { user, posts, comments }
}

// 并行获取 - 快 (总时间 = max(时间1, 时间2, 时间3))
async function parallelFetch() {
  const [user, posts, comments] = await Promise.all([
    getUser('1'),      // 100ms
    getPosts('1'),     // 200ms
    getComments('1')   // 150ms
  ])
  // 总时间: 200ms (最长的那个)
  return { user, posts, comments }
}
```

### 3.2 顺序数据获取

有时需要顺序获取数据(后一个请求依赖前一个):

```typescript
// app/profile/[username]/page.tsx
interface PageProps {
  params: Promise<{ username: string }>
}

async function getUserByUsername(username: string) {
  const res = await fetch(`https://api.example.com/users?username=${username}`)
  return res.json()
}

async function getUserPosts(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/posts`)
  return res.json()
}

async function getPostComments(postId: string) {
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`)
  return res.json()
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  
  // 1. 先获取用户信息
  const user = await getUserByUsername(username)
  
  if (!user) {
    return <div>User not found</div>
  }
  
  // 2. 使用用户ID获取帖子
  const posts = await getUserPosts(user.id)
  
  // 3. 获取第一篇帖子的评论
  const firstPostComments = posts.length > 0 
    ? await getPostComments(posts[0].id)
    : []
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{user.name}</h1>
      <p className="text-gray-600 mb-6">{user.bio}</p>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Posts</h2>
        {posts.map((post: any) => (
          <article key={post.id} className="mb-4 p-4 border rounded">
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <p>{post.content}</p>
          </article>
        ))}
      </section>
      
      {firstPostComments.length > 0 && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Latest Comments</h2>
          {firstPostComments.map((comment: any) => (
            <div key={comment.id} className="mb-2 p-2 bg-gray-50 rounded">
              {comment.text}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
```

### 3.3 混合策略

```typescript
// app/analytics/page.tsx
async function getAnalytics() {
  // 第一步: 并行获取基础数据
  const [userStats, pageViews, revenue] = await Promise.all([
    fetch('https://api.example.com/stats/users').then(r => r.json()),
    fetch('https://api.example.com/stats/views').then(r => r.json()),
    fetch('https://api.example.com/stats/revenue').then(r => r.json())
  ])
  
  // 第二步: 基于基础数据获取详细信息
  const topUsers = await Promise.all(
    userStats.topUserIds.map((id: string) =>
      fetch(`https://api.example.com/users/${id}`).then(r => r.json())
    )
  )
  
  return {
    userStats,
    pageViews,
    revenue,
    topUsers
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-semibold">Total Users</h3>
          <p className="text-2xl">{data.userStats.total}</p>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <h3 className="font-semibold">Page Views</h3>
          <p className="text-2xl">{data.pageViews.total}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl">${data.revenue.total}</p>
        </div>
      </div>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Top Users</h2>
        <div className="grid gap-4">
          {data.topUsers.map((user: any) => (
            <div key={user.id} className="p-4 border rounded">
              <p className="font-semibold">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

---

## 四、数据缓存策略

### 4.1 缓存配置

```typescript
// 1. 强制缓存 (默认行为)
async function getStaticData() {
  const res = await fetch('https://api.example.com/config', {
    cache: 'force-cache'
  })
  return res.json()
}

// 2. 不缓存
async function getDynamicData() {
  const res = await fetch('https://api.example.com/realtime', {
    cache: 'no-store'
  })
  return res.json()
}

// 3. 定时重新验证
async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/news', {
    next: { revalidate: 60 } // 每60秒重新验证
  })
  return res.json()
}

// 4. 按需重新验证 (使用标签)
async function getTaggedData() {
  const res = await fetch('https://api.example.com/products', {
    next: { 
      revalidate: 3600,
      tags: ['products'] 
    }
  })
  return res.json()
}
```

### 4.2 路由段缓存配置

```typescript
// app/posts/page.tsx
export const dynamic = 'auto' // 'auto' | 'force-dynamic' | 'error' | 'force-static'
export const dynamicParams = true // true | false
export const revalidate = 60 // false | 0 | number
export const fetchCache = 'auto' // 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'
export const runtime = 'nodejs' // 'nodejs' | 'edge'
export const preferredRegion = 'auto' // 'auto' | string | string[]

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div>
      {posts.map((post: any) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

**配置选项详解:**

| 选项 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| dynamic | 动态渲染行为 | auto, force-dynamic, error, force-static | auto |
| dynamicParams | 是否允许动态参数 | true, false | true |
| revalidate | 重新验证时间(秒) | false, 0, number | false |
| fetchCache | Fetch缓存策略 | auto, default-cache, only-cache等 | auto |
| runtime | 运行时环境 | nodejs, edge | nodejs |
| preferredRegion | 首选部署区域 | auto, string, string[] | auto |

### 4.3 缓存重新验证

```typescript
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

// 按路径重新验证
export async function revalidatePostsPath() {
  revalidatePath('/posts')
  revalidatePath('/posts/[id]', 'page')
}

// 按标签重新验证
export async function revalidateProductsTag() {
  revalidateTag('products')
}

// 实际应用: 创建新帖子后重新验证
export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // 创建帖子
  await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })
  
  // 重新验证相关路径
  revalidatePath('/posts')
  revalidateTag('posts')
}

// app/posts/new/page.tsx
import { createPost } from '@/app/actions'

export default function NewPostPage() {
  return (
    <form action={createPost} className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      
      <div className="mb-4">
        <label htmlFor="title" className="block font-semibold mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="content" className="block font-semibold mb-2">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Post
      </button>
    </form>
  )
}
```

### 4.4 缓存调试

```typescript
// app/debug/cache/page.tsx
export const dynamic = 'force-dynamic'

async function getCacheInfo() {
  const timestamp = new Date().toISOString()
  
  // 测试不同缓存策略
  const [cached, noCached, revalidated] = await Promise.all([
    fetch('https://api.example.com/data', { cache: 'force-cache' })
      .then(r => r.json()),
    fetch('https://api.example.com/data', { cache: 'no-store' })
      .then(r => r.json()),
    fetch('https://api.example.com/data', { next: { revalidate: 10 } })
      .then(r => r.json())
  ])
  
  return {
    timestamp,
    cached,
    noCached,
    revalidated
  }
}

export default async function CacheDebugPage() {
  const info = await getCacheInfo()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cache Debug</h1>
      <p className="mb-4">Current Time: {info.timestamp}</p>
      
      <div className="grid gap-4">
        <section className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Force Cache</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(info.cached, null, 2)}
          </pre>
        </section>
        
        <section className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">No Store</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(info.noCached, null, 2)}
          </pre>
        </section>
        
        <section className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Revalidate (10s)</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(info.revalidated, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
}
```

---

## 五、客户端数据获取

### 5.1 使用 useEffect

```typescript
// app/client-fetch/page.tsx
'use client'

import { useState, useEffect } from 'react'

interface Post {
  id: number
  title: string
  body: string
}

export default function ClientFetchPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const res = await fetch('https://jsonplaceholder.typicode.com/posts')
        
        if (!res.ok) {
          throw new Error('Failed to fetch')
        }
        
        const data = await res.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [])
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Client-Side Posts</h1>
      <div className="grid gap-4">
        {posts.map(post => (
          <article key={post.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### 5.2 使用 SWR

```typescript
// 安装: npm install swr

// app/swr-fetch/page.tsx
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Post {
  id: number
  title: string
  body: string
}

export default function SWRFetchPage() {
  const { data, error, isLoading, mutate } = useSWR<Post[]>(
    'https://jsonplaceholder.typicode.com/posts',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0
    }
  )
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500">Failed to load posts</div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SWR Posts</h1>
        <button
          onClick={() => mutate()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {data?.map(post => (
          <article key={post.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### 5.3 使用 React Query (TanStack Query)

```typescript
// 安装: npm install @tanstack/react-query

// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1分钟
        refetchOnWindowFocus: false
      }
    }
  }))
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

// app/react-query/page.tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Post {
  id: number
  title: string
  body: string
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  })
  return res.json()
}

export default function ReactQueryPage() {
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  })
  
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
  
  const handleCreate = () => {
    mutation.mutate({
      title: 'New Post',
      body: 'This is a new post created with React Query'
    })
  }
  
  if (isLoading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error loading posts</div>
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">React Query Posts</h1>
        <button
          onClick={handleCreate}
          disabled={mutation.isPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {mutation.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </div>
      
      {mutation.isError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error creating post
        </div>
      )}
      
      {mutation.isSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Post created successfully!
        </div>
      )}
      
      <div className="grid gap-4">
        {data?.map(post => (
          <article key={post.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
```

### 5.4 自定义 Hook

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react'

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: HeadersInit
  body?: BodyInit
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useFetch<T>(
  url: string,
  options?: UseFetchOptions
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchIndex, setRefetchIndex] = useState(0)
  
  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const result = await res.json()
        setData(result)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    return () => controller.abort()
  }, [url, refetchIndex])
  
  const refetch = () => setRefetchIndex(prev => prev + 1)
  
  return { data, loading, error, refetch }
}

// app/custom-hook/page.tsx
'use client'

import { useFetch } from '@/hooks/useFetch'

interface Post {
  id: number
  title: string
  body: string
}

export default function CustomHookPage() {
  const { data, loading, error, refetch } = useFetch<Post[]>(
    'https://jsonplaceholder.typicode.com/posts'
  )
  
  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Custom Hook Posts</h1>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {data?.map(post => (
          <article key={post.id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
```

---

## 六、流式渲染与 Suspense

### 6.1 基础 Suspense 用法

```typescript
// app/streaming/page.tsx
import { Suspense } from 'react'

async function SlowComponent() {
  // 模拟慢速数据获取
  await new Promise(resolve => setTimeout(resolve, 3000))
  const res = await fetch('https://jsonplaceholder.typicode.com/posts')
  const posts = await res.json()
  
  return (
    <div className="grid gap-4">
      {posts.slice(0, 5).map((post: any) => (
        <div key={post.id} className="border p-4 rounded">
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-gray-600">{post.body}</p>
        </div>
      ))}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="border p-4 rounded animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  )
}

export default function StreamingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Streaming with Suspense</h1>
      
      <Suspense fallback={<LoadingFallback />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

### 6.2 多个 Suspense 边界

```typescript
// app/multi-suspense/page.tsx
import { Suspense } from 'react'

async function UserInfo() {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const res = await fetch('https://jsonplaceholder.typicode.com/users/1')
  const user = await res.json()
  
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  )
}

async function UserPosts() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?userId=1')
  const posts = await res.json()
  
  return (
    <div className="space-y-4">
      {posts.slice(0, 3).map((post: any) => (
        <div key={post.id} className="p-4 border rounded">
          <h3 className="font-semibold">{post.title}</h3>
          <p className="text-gray-600">{post.body}</p>
        </div>
      ))}
    </div>
  )
}

async function UserComments() {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const res = await fetch('https://jsonplaceholder.typicode.com/comments?postId=1')
  const comments = await res.json()
  
  return (
    <div className="space-y-2">
      {comments.slice(0, 3).map((comment: any) => (
        <div key={comment.id} className="p-2 bg-gray-50 rounded">
          <p className="text-sm">{comment.body}</p>
          <p className="text-xs text-gray-500 mt-1">{comment.email}</p>
        </div>
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="p-4 border rounded animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
    </div>
  )
}

export default function MultiSuspensePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Multiple Suspense Boundaries</h1>
      
      <div className="grid gap-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">User Info</h2>
          <Suspense fallback={<SkeletonCard />}>
            <UserInfo />
          </Suspense>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">User Posts</h2>
          <Suspense fallback={
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          }>
            <UserPosts />
          </Suspense>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          <Suspense fallback={
            <div className="space-y-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          }>
            <UserComments />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
```

### 6.3 嵌套 Suspense

```typescript
// app/nested-suspense/page.tsx
import { Suspense } from 'react'

async function ParentData() {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return <div className="p-4 bg-blue-100 rounded">Parent Data Loaded</div>
}

async function ChildData() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return <div className="p-4 bg-green-100 rounded mt-4">Child Data Loaded</div>
}

async function GrandchildData() {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return <div className="p-4 bg-purple-100 rounded mt-4">Grandchild Data Loaded</div>
}

export default function NestedSuspensePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Nested Suspense</h1>
      
      <Suspense fallback={<div className="p-4 border rounded animate-pulse">Loading parent...</div>}>
        <ParentData />
        
        <Suspense fallback={<div className="p-4 border rounded animate-pulse mt-4">Loading child...</div>}>
          <ChildData />
          
          <Suspense fallback={<div className="p-4 border rounded animate-pulse mt-4">Loading grandchild...</div>}>
            <GrandchildData />
          </Suspense>
        </Suspense>
      </Suspense>
    </div>
  )
}
```

### 6.4 Streaming SSR

```typescript
// app/streaming-ssr/page.tsx
import { Suspense } from 'react'

async function fetchData(delay: number, name: string) {
  await new Promise(resolve => setTimeout(resolve, delay))
  return { name, timestamp: new Date().toISOString() }
}

async function FastComponent() {
  const data = await fetchData(500, 'Fast')
  return (
    <div className="p-4 bg-green-100 rounded">
      <h3 className="font-semibold">{data.name} Component</h3>
      <p className="text-sm text-gray-600">Loaded at: {data.timestamp}</p>
    </div>
  )
}

async function MediumComponent() {
  const data = await fetchData(2000, 'Medium')
  return (
    <div className="p-4 bg-yellow-100 rounded">
      <h3 className="font-semibold">{data.name} Component</h3>
      <p className="text-sm text-gray-600">Loaded at: {data.timestamp}</p>
    </div>
  )
}

async function SlowComponent() {
  const data = await fetchData(4000, 'Slow')
  return (
    <div className="p-4 bg-red-100 rounded">
      <h3 className="font-semibold">{data.name} Component</h3>
      <p className="text-sm text-gray-600">Loaded at: {data.timestamp}</p>
    </div>
  )
}

function ComponentSkeleton({ color }: { color: string }) {
  return (
    <div className={`p-4 ${color} rounded animate-pulse`}>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </div>
  )
}

export default function StreamingSSRPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Streaming SSR Demo</h1>
      <p className="mb-6 text-gray-600">
        Components will stream in as they become ready, improving perceived performance.
      </p>
      
      <div className="space-y-4">
        <Suspense fallback={<ComponentSkeleton color="bg-green-50" />}>
          <FastComponent />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeleton color="bg-yellow-50" />}>
          <MediumComponent />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeleton color="bg-red-50" />}>
          <SlowComponent />
        </Suspense>
      </div>
    </div>
  )
}
```

---

## 七、错误处理与加载状态

### 7.1 错误边界

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])
  
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

// app/posts/[id]/error.tsx
'use client'

export default function PostError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="container mx-auto p-4">
      <div className="border border-red-300 bg-red-50 p-6 rounded">
        <h2 className="text-xl font-semibold text-red-700 mb-2">
          Failed to load post
        </h2>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
```

### 7.2 Loading 状态

```typescript
// app/posts/loading.tsx
export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border p-4 rounded">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// app/posts/[id]/loading.tsx
export default function PostLoading() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-4 mb-6">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    </div>
  )
}
```

### 7.3 Not Found 处理

```typescript
// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-600 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

// app/posts/[id]/not-found.tsx
import Link from 'next/link'

export default function PostNotFound() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Post Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The post you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/posts"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Posts
        </Link>
      </div>
    </div>
  )
}

// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation'

async function getPost(id: string) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
  
  if (!res.ok) {
    return null
  }
  
  return res.json()
}

export default async function PostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600">{post.body}</p>
    </article>
  )
}
```

### 7.4 全局错误处理

```typescript
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Application Error
            </h2>
            <p className="text-gray-600 mb-6">
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
```

---

## 八、高级数据获取模式

### 8.1 预加载数据

```typescript
// lib/data.ts
import { cache } from 'react'

export const getPost = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/posts/${id}`)
  return res.json()
})

export const preloadPost = (id: string) => {
  void getPost(id) // 触发数据获取但不等待
}

// app/posts/[id]/page.tsx
import { getPost, preloadPost } from '@/lib/data'
import Link from 'next/link'

export default async function PostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)
  
  // 预加载下一篇文章
  const nextId = (parseInt(id) + 1).toString()
  preloadPost(nextId)
  
  return (
    <article className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-6">{post.body}</p>
      
      <Link
        href={`/posts/${nextId}`}
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Next Post
      </Link>
    </article>
  )
}
```

### 8.2 请求去重

```typescript
// lib/data.ts
import { cache } from 'react'

// 使用 React cache 自动去重
export const getUser = cache(async (id: string) => {
  console.log(`Fetching user ${id}`)
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
})

// app/profile/[id]/page.tsx
import { getUser } from '@/lib/data'

async function UserHeader({ id }: { id: string }) {
  const user = await getUser(id) // 第一次调用
  return <h1>{user.name}</h1>
}

async function UserBio({ id }: { id: string }) {
  const user = await getUser(id) // 复用缓存,不会重复请求
  return <p>{user.bio}</p>
}

async function UserStats({ id }: { id: string }) {
  const user = await getUser(id) // 复用缓存
  return <div>Posts: {user.postsCount}</div>
}

export default async function ProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <div className="container mx-auto p-4">
      <UserHeader id={id} />
      <UserBio id={id} />
      <UserStats id={id} />
    </div>
  )
}
```

### 8.3 数据预取

```typescript
// components/PostLink.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PostLinkProps {
  id: string
  title: string
}

export function PostLink({ id, title }: PostLinkProps) {
  const router = useRouter()
  
  const handleMouseEnter = () => {
    // 鼠标悬停时预取数据
    router.prefetch(`/posts/${id}`)
  }
  
  return (
    <Link
      href={`/posts/${id}`}
      onMouseEnter={handleMouseEnter}
      className="block p-4 border rounded hover:bg-gray-50 transition"
    >
      {title}
    </Link>
  )
}

// app/posts/page.tsx
import { PostLink } from '@/components/PostLink'

async function getPosts() {
  const res = await fetch('https://api.example.com/posts')
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Posts</h1>
      <div className="space-y-2">
        {posts.map((post: any) => (
          <PostLink key={post.id} id={post.id} title={post.title} />
        ))}
      </div>
    </div>
  )
}
```

### 8.4 乐观更新

```typescript
// app/posts/[id]/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function likePost(postId: string) {
  await fetch(`https://api.example.com/posts/${postId}/like`, {
    method: 'POST'
  })
  
  revalidatePath(`/posts/${postId}`)
}

// app/posts/[id]/LikeButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { likePost } from './actions'

interface LikeButtonProps {
  postId: string
  initialLikes: number
}

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()
  
  const handleLike = () => {
    // 乐观更新: 立即更新UI
    setLikes(prev => prev + 1)
    
    // 实际请求
    startTransition(async () => {
      try {
        await likePost(postId)
      } catch (error) {
        // 失败时回滚
        setLikes(prev => prev - 1)
        console.error('Failed to like post:', error)
      }
    })
  }
  
  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
    >
      <span>❤️</span>
      <span>{likes}</span>
      {isPending && <span className="text-xs">(Saving...)</span>}
    </button>
  )
}
```

---

## 九、实战案例

### 9.1 博客系统数据获取

```typescript
// lib/blog.ts
import { cache } from 'react'
import { prisma } from './prisma'

export const getAllPosts = cache(async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            name: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.post.count({ where: { published: true } })
  ])
  
  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
})

export const getPostBySlug = cache(async (slug: string) => {
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
      },
      tags: true
    }
  })
})

export const getRelatedPosts = cache(async (postId: number, limit: number = 3) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true }
  })
  
  if (!post) return []
  
  const tagIds = post.tags.map(tag => tag.id)
  
  return prisma.post.findMany({
    where: {
      AND: [
        { id: { not: postId } },
        { published: true },
        {
          tags: {
            some: {
              id: { in: tagIds }
            }
          }
        }
      ]
    },
    include: {
      author: {
        select: {
          name: true,
          avatar: true
        }
      }
    },
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
})

// app/blog/page.tsx
import { getAllPosts } from '@/lib/blog'
import Link from 'next/link'
import Image from 'next/image'

export default async function BlogPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = parseInt(page || '1')
  const { posts, pagination } = await getAllPosts(currentPage)
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map(post => (
          <article key={post.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
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
              <h2 className="text-xl font-semibold mb-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {post.author.avatar && (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span>{post.author.name}</span>
                </div>
                <div className="flex gap-4">
                  <span>💬 {post._count.comments}</span>
                  <span>❤️ {post._count.likes}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <Link
              key={page}
              href={`/blog?page=${page}`}
              className={`px-4 py-2 border rounded ${
                page === pagination.page
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// app/blog/[slug]/page.tsx
import { getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

async function RelatedPosts({ postId }: { postId: number }) {
  const related = await getRelatedPosts(postId)
  
  if (related.length === 0) return null
  
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {related.map(post => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="border rounded p-4 hover:shadow-md transition"
          >
            <h3 className="font-semibold mb-2">{post.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function PostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-5xl font-bold mb-4">{post.title}</h1>
      
      <div className="flex items-center gap-4 mb-6 text-gray-600">
        <div className="flex items-center gap-2">
          {post.author.avatar && (
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <span>{post.author.name}</span>
        </div>
        <span>•</span>
        <time>{new Date(post.createdAt).toLocaleDateString()}</time>
      </div>
      
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={600}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}
      
      <div
        className="prose max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <div className="flex flex-wrap gap-2 mb-8">
        {post.tags.map(tag => (
          <Link
            key={tag.id}
            href={`/blog/tag/${tag.slug}`}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
      
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Comments ({post.comments.length})
        </h2>
        <div className="space-y-4">
          {post.comments.map(comment => (
            <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                {comment.author.avatar && (
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="font-semibold">{comment.author.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
      
      <Suspense fallback={<div className="mt-12">Loading related posts...</div>}>
        <RelatedPosts postId={post.id} />
      </Suspense>
    </article>
  )
}
```

### 9.2 电商产品列表

```typescript
// lib/products.ts
import { cache } from 'react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  stock: number
}

interface FilterOptions {
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}

export const getProducts = cache(async (filters: FilterOptions = {}) => {
  const {
    category,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    page = 1,
    limit = 12
  } = filters
  
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (minPrice) params.append('minPrice', minPrice.toString())
  if (maxPrice) params.append('maxPrice', maxPrice.toString())
  params.append('sortBy', sortBy)
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  const res = await fetch(`https://api.example.com/products?${params}`, {
    next: { revalidate: 300 } // 5分钟缓存
  })
  
  return res.json()
})

export const getCategories = cache(async () => {
  const res = await fetch('https://api.example.com/categories', {
    next: { revalidate: 3600 } // 1小时缓存
  })
  return res.json()
})

// app/products/page.tsx
import { getProducts, getCategories } from '@/lib/products'
import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { Suspense } from 'react'

async function ProductList({ filters }: { filters: any }) {
  const { products, pagination } = await getProducts(filters)
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <a
              key={page}
              href={`?page=${page}`}
              className={`px-4 py-2 border rounded ${
                page === pagination.page
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    sortBy?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const categories = await getCategories()
  
  const filters = {
    category: params.category,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    sortBy: params.sortBy,
    page: params.page ? parseInt(params.page) : 1
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Products</h1>
      
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <ProductFilters categories={categories} currentFilters={filters} />
        </aside>
        
        <main className="flex-1">
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border rounded p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          }>
            <ProductList filters={filters} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
```

---

## 十、总结与最佳实践

### 10.1 数据获取决策树

```
开始
  ↓
需要SEO吗?
  ├─ 是 → 使用服务端组件
  │       ↓
  │     数据变化频率?
  │       ├─ 静态 → cache: 'force-cache'
  │       ├─ 定期更新 → next: { revalidate: N }
  │       └─ 实时 → cache: 'no-store'
  │
  └─ 否 → 需要交互吗?
          ├─ 是 → 使用客户端组件 + SWR/React Query
          └─ 否 → 使用服务端组件
```

### 10.2 性能优化清单

```typescript
// 1. 使用并行数据获取
const [data1, data2, data3] = await Promise.all([
  fetch1(),
  fetch2(),
  fetch3()
])

// 2. 实现请求去重
import { cache } from 'react'
export const getData = cache(async () => {
  // ...
})

// 3. 使用适当的缓存策略
fetch(url, {
  next: { revalidate: 60, tags: ['data'] }
})

// 4. 实现流式渲染
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>

// 5. 预加载关键数据
export const preload = (id) => {
  void getData(id)
}

// 6. 使用 loading.tsx 和 error.tsx
// app/posts/loading.tsx
// app/posts/error.tsx
```

### 10.3 常见错误与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 数据获取慢 | 顺序获取 | 使用 Promise.all 并行获取 |
| 重复请求 | 未使用缓存 | 使用 React cache 或 fetch 缓存 |
| 客户端闪烁 | 未使用 Suspense | 添加 Suspense 边界 |
| SEO 不佳 | 客户端渲染 | 改用服务端组件 |
| 缓存过期 | 未设置重新验证 | 使用 revalidate 或 revalidatePath |

### 10.4 学习资源

1. 官方文档
   - Next.js Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
   - React Server Components: https://react.dev/reference/rsc/server-components

2. 推荐库
   - SWR: https://swr.vercel.app
   - React Query: https://tanstack.com/query
   - Prisma: https://www.prisma.io

3. 实践项目
   - 博客系统
   - 电商平台
   - 社交媒体应用
   - 数据仪表板

---

## 课后练习

1. 实现一个带分页和筛选的产品列表
2. 创建一个使用 Suspense 的仪表板
3. 实现乐观更新的评论系统
4. 构建一个带缓存的搜索功能
5. 优化一个慢速数据获取页面

通过本课程的学习,你应该能够熟练掌握 Next.js 中的各种数据获取策略,并能根据实际需求选择最合适的方案。记住:正确的数据获取策略是构建高性能 Web 应用的关键!

