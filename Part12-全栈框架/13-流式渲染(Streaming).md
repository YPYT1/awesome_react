# 流式渲染 (Streaming)

## 课程概述

本课程深入探讨 Next.js 15 中的流式渲染(Streaming)。流式渲染允许服务器逐步发送HTML内容,用户可以更快地看到页面的初始内容。这是提升用户体验的强大技术。

学习目标:
- 理解流式渲染的原理和优势
- 掌握 Suspense 边界
- 学习 loading.tsx 文件
- 理解流式SSR
- 掌握增量加载
- 学习流式渲染的最佳实践
- 理解流式渲染的性能优化
- 构建实际的流式应用

---

## 一、流式渲染基础

### 1.1 什么是流式渲染

流式渲染允许服务器逐步发送HTML:

```typescript
// 传统SSR (一次性发送)
// 用户等待: ████████████ (12秒)
// 看到内容: 完整页面

// 流式渲染 (逐步发送)
// 用户等待: ██ (2秒)
// 看到内容: 页面框架 + 加载中...
// 然后逐步显示其余内容

// app/dashboard/page.tsx
import { Suspense } from 'react'

// 快速组件
function QuickHeader() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
    </header>
  )
}

// 慢速组件
async function SlowStats() {
  // 模拟慢速数据获取
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  const stats = await fetch('https://api.example.com/stats')
    .then(r => r.json())
  
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="border rounded p-4">
        <div className="text-2xl font-bold">{stats.users}</div>
        <div className="text-gray-600">Users</div>
      </div>
      <div className="border rounded p-4">
        <div className="text-2xl font-bold">{stats.revenue}</div>
        <div className="text-gray-600">Revenue</div>
      </div>
      <div className="border rounded p-4">
        <div className="text-2xl font-bold">{stats.orders}</div>
        <div className="text-gray-600">Orders</div>
      </div>
    </div>
  )
}

// 加载占位符
function StatsLoading() {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="border rounded p-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div>
      {/* 立即显示 */}
      <QuickHeader />
      
      {/* 流式加载 */}
      <Suspense fallback={<StatsLoading />}>
        <SlowStats />
      </Suspense>
    </div>
  )
}
```

**流式渲染的优势:**

| 优势 | 说明 |
|------|------|
| 更快的首次内容绘制 | 用户立即看到部分内容 |
| 更好的用户体验 | 逐步加载,不是空白等待 |
| 减少感知延迟 | 用户感觉页面更快 |
| 并行数据获取 | 多个数据源同时加载 |
| SEO友好 | 搜索引擎仍能索引完整HTML |

### 1.2 流式渲染 vs 传统SSR

```typescript
// 1. 传统SSR - 全部等待
export default async function TraditionalPage() {
  const [user, posts, comments] = await Promise.all([
    fetch('https://api.example.com/user').then(r => r.json()),
    fetch('https://api.example.com/posts').then(r => r.json()),
    fetch('https://api.example.com/comments').then(r => r.json())
  ])
  
  // 所有数据准备好后才发送HTML
  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  )
}

// 2. 流式渲染 - 逐步显示
export default function StreamingPage() {
  return (
    <div>
      {/* 立即显示 */}
      <Suspense fallback={<UserLoading />}>
        <UserProfile />
      </Suspense>
      
      {/* 并行加载 */}
      <Suspense fallback={<PostsLoading />}>
        <PostList />
      </Suspense>
      
      <Suspense fallback={<CommentsLoading />}>
        <CommentList />
      </Suspense>
    </div>
  )
}

async function UserProfile() {
  const user = await fetch('https://api.example.com/user').then(r => r.json())
  return <div>{user.name}</div>
}

async function PostList() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  return <div>{/* 渲染文章 */}</div>
}

async function CommentList() {
  const comments = await fetch('https://api.example.com/comments').then(r => r.json())
  return <div>{/* 渲染评论 */}</div>
}
```

### 1.3 基本 Suspense 用法

```typescript
// app/blog/page.tsx
import { Suspense } from 'react'

async function BlogPosts() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <article key={post.id} className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-600">{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}

function PostsLoading() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <Suspense fallback={<PostsLoading />}>
        <BlogPosts />
      </Suspense>
    </div>
  )
}
```

---

## 二、Suspense 边界

### 2.1 单个 Suspense 边界

```typescript
// app/profile/page.tsx
import { Suspense } from 'react'

async function UserInfo() {
  const user = await fetch('https://api.example.com/user', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6">
      <img
        src={user.avatar}
        alt={user.name}
        className="w-24 h-24 rounded-full mb-4"
      />
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
    </div>
  )
}

function UserInfoLoading() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-8 bg-gray-200 rounded mb-2 w-48"></div>
      <div className="h-4 bg-gray-200 rounded w-64"></div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      
      <Suspense fallback={<UserInfoLoading />}>
        <UserInfo />
      </Suspense>
    </div>
  )
}
```

### 2.2 多个 Suspense 边界

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

async function RevenueChart() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  const data = await fetch('https://api.example.com/revenue').then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Revenue</h2>
      <div className="h-64 bg-blue-100 flex items-center justify-center">
        Chart: ${data.total}
      </div>
    </div>
  )
}

async function UserStats() {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const data = await fetch('https://api.example.com/users').then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <div className="text-4xl font-bold text-green-600">{data.count}</div>
    </div>
  )
}

async function RecentOrders() {
  await new Promise(resolve => setTimeout(resolve, 3000))
  const orders = await fetch('https://api.example.com/orders').then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
      <div className="space-y-2">
        {orders.map((order: any) => (
          <div key={order.id} className="flex justify-between">
            <span>#{order.id}</span>
            <span>${order.total}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartLoading() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-24"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-24"></div>
      <div className="h-12 bg-gray-200 rounded w-32"></div>
    </div>
  )
}

function OrdersLoading() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 每个组件独立流式加载 */}
        <Suspense fallback={<ChartLoading />}>
          <RevenueChart />
        </Suspense>
        
        <Suspense fallback={<StatsLoading />}>
          <UserStats />
        </Suspense>
        
        <div className="md:col-span-2">
          <Suspense fallback={<OrdersLoading />}>
            <RecentOrders />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```

### 2.3 嵌套 Suspense

```typescript
// app/article/[id]/page.tsx
import { Suspense } from 'react'

async function ArticleHeader({ id }: { id: string }) {
  await new Promise(resolve => setTimeout(resolve, 500))
  const article = await fetch(`https://api.example.com/articles/${id}`)
    .then(r => r.json())
  
  return (
    <header className="mb-8">
      <h1 className="text-5xl font-bold mb-4">{article.title}</h1>
      <div className="text-gray-600">{article.author} • {article.date}</div>
    </header>
  )
}

async function ArticleContent({ id }: { id: string }) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const article = await fetch(`https://api.example.com/articles/${id}`)
    .then(r => r.json())
  
  return (
    <div className="prose max-w-none mb-12">
      {article.content}
    </div>
  )
}

async function RelatedArticles({ id }: { id: string }) {
  await new Promise(resolve => setTimeout(resolve, 2000))
  const related = await fetch(`https://api.example.com/articles/${id}/related`)
    .then(r => r.json())
  
  return (
    <aside className="border-l-4 border-blue-500 pl-6">
      <h2 className="text-2xl font-bold mb-4">Related Articles</h2>
      <div className="space-y-3">
        {related.map((article: any) => (
          <a
            key={article.id}
            href={`/article/${article.id}`}
            className="block hover:text-blue-600"
          >
            {article.title}
          </a>
        ))}
      </div>
    </aside>
  )
}

async function Comments({ id }: { id: string }) {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const comments = await fetch(`https://api.example.com/articles/${id}/comments`)
    .then(r => r.json())
  
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      <div className="space-y-4">
        {comments.map((comment: any) => (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="font-semibold mb-2">{comment.author}</div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* 第一层: 文章头部最快显示 */}
      <Suspense fallback={
        <div className="animate-pulse mb-8">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      }>
        <ArticleHeader id={id} />
      </Suspense>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* 第二层: 文章内容 */}
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          }>
            <ArticleContent id={id} />
          </Suspense>
          
          {/* 第三层: 评论 */}
          <Suspense fallback={
            <div className="mt-12">
              <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          }>
            <Comments id={id} />
          </Suspense>
        </div>
        
        <div>
          {/* 侧边栏: 相关文章 */}
          <Suspense fallback={
            <div className="border-l-4 border-blue-500 pl-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          }>
            <RelatedArticles id={id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```

---

## 三、loading.tsx 文件

### 3.1 路由级别的 Loading

```typescript
// app/blog/loading.tsx
export default function BlogLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="h-12 bg-gray-200 rounded mb-8 animate-pulse"></div>
      
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// app/blog/page.tsx
// 当页面加载时,自动显示 loading.tsx
export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      {/* 内容 */}
    </div>
  )
}
```

### 3.2 嵌套路由的 Loading

```typescript
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="h-10 bg-gray-200 rounded mb-8 animate-pulse"></div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// app/dashboard/analytics/loading.tsx
export default function AnalyticsLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="h-12 bg-gray-200 rounded mb-8 animate-pulse"></div>
      
      <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}

// 路由层级:
// /dashboard → 使用 dashboard/loading.tsx
// /dashboard/analytics → 使用 dashboard/analytics/loading.tsx
```

### 3.3 可复用的 Loading 组件

```typescript
// components/loading-skeleton.tsx
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="border rounded-lg p-6">
      <div className="h-6 bg-gray-200 rounded mb-4 w-32 animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )
}

// app/products/loading.tsx
import { CardSkeleton } from '@/components/loading-skeleton'

export default function ProductsLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="h-12 bg-gray-200 rounded mb-8 animate-pulse"></div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
```

---

## 四、流式数据获取

### 4.1 并行数据流

```typescript
// app/feed/page.tsx
import { Suspense } from 'react'

async function TrendingPosts() {
  const posts = await fetch('https://api.example.com/posts/trending', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Trending</h2>
      <div className="grid gap-4">
        {posts.map((post: any) => (
          <article key={post.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-gray-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

async function LatestPosts() {
  const posts = await fetch('https://api.example.com/posts/latest', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Latest</h2>
      <div className="grid gap-4">
        {posts.map((post: any) => (
          <article key={post.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{post.title}</h3>
            <p className="text-gray-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

async function FeaturedAuthors() {
  const authors = await fetch('https://api.example.com/authors/featured', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <aside className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Featured Authors</h2>
      <div className="space-y-4">
        {authors.map((author: any) => (
          <div key={author.id} className="flex items-center gap-3">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="font-semibold">{author.name}</div>
              <div className="text-sm text-gray-600">{author.postsCount} posts</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function SectionLoading() {
  return (
    <section className="mb-12">
      <div className="h-8 bg-gray-200 rounded mb-4 w-32 animate-pulse"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SidebarLoading() {
  return (
    <aside className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4 w-40"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default function FeedPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Feed</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* 热门和最新文章并行加载 */}
          <Suspense fallback={<SectionLoading />}>
            <TrendingPosts />
          </Suspense>
          
          <Suspense fallback={<SectionLoading />}>
            <LatestPosts />
          </Suspense>
        </div>
        
        <div>
          {/* 侧边栏独立加载 */}
          <Suspense fallback={<SidebarLoading />}>
            <FeaturedAuthors />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```

### 4.2 顺序数据流

```typescript
// app/checkout/page.tsx
import { Suspense } from 'react'

async function CartSummary() {
  // 第一步: 获取购物车
  const cart = await fetch('https://api.example.com/cart', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Cart Summary</h2>
      <div className="space-y-2">
        {cart.items.map((item: any) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name}</span>
            <span>${item.price}</span>
          </div>
        ))}
      </div>
      <div className="border-t mt-4 pt-4">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${cart.total}</span>
        </div>
      </div>
    </div>
  )
}

async function ShippingOptions() {
  // 第二步: 获取配送选项(依赖购物车数据)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const options = await fetch('https://api.example.com/shipping-options', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Shipping Options</h2>
      <div className="space-y-3">
        {options.map((option: any) => (
          <label key={option.id} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input type="radio" name="shipping" value={option.id} />
            <div className="flex-1">
              <div className="font-semibold">{option.name}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </div>
            <div className="font-bold">${option.price}</div>
          </label>
        ))}
      </div>
    </div>
  )
}

async function PaymentMethods() {
  // 第三步: 获取支付方式
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const methods = await fetch('https://api.example.com/payment-methods', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
      <div className="space-y-3">
        {methods.map((method: any) => (
          <label key={method.id} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
            <input type="radio" name="payment" value={method.id} />
            <div>
              <div className="font-semibold">{method.name}</div>
              <div className="text-sm text-gray-600">{method.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      
      {/* 顺序显示各个部分 */}
      <Suspense fallback={
        <div className="border rounded-lg p-6 mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        <CartSummary />
      </Suspense>
      
      <Suspense fallback={
        <div className="border rounded-lg p-6 mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        <ShippingOptions />
      </Suspense>
      
      <Suspense fallback={
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        <PaymentMethods />
      </Suspense>
      
      <button className="w-full mt-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-lg">
        Place Order
      </button>
    </div>
  )
}
```

### 4.3 条件流式渲染

```typescript
// app/search/page.tsx
import { Suspense } from 'react'

async function SearchResults({ query }: { query: string }) {
  if (!query) {
    return (
      <div className="text-center py-12 text-gray-500">
        Enter a search query to see results
      </div>
    )
  }
  
  const results = await fetch(
    `https://api.example.com/search?q=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  ).then(r => r.json())
  
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No results found for "{query}"
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {results.map((result: any) => (
        <a
          key={result.id}
          href={result.url}
          className="block border rounded-lg p-6 hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">{result.title}</h2>
          <p className="text-gray-600">{result.description}</p>
        </a>
      ))}
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q || ''
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Search</h1>
      
      <form method="get" className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search..."
          className="w-full p-4 border rounded-lg text-lg"
        />
      </form>
      
      <Suspense
        key={query} // 重要: key 变化时重新渲染
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        }
      >
        <SearchResults query={query} />
      </Suspense>
    </div>
  )
}
```

---

## 五、性能优化

### 5.1 优先级加载

```typescript
// app/news/page.tsx
import { Suspense } from 'react'

// 高优先级: 主要新闻
async function HeadlineNews() {
  const news = await fetch('https://api.example.com/news/headlines', {
    cache: 'no-store',
    // 高优先级请求
    priority: 'high'
  } as RequestInit).then(r => r.json())
  
  return (
    <div className="border rounded-lg p-6 bg-red-50 mb-8">
      <h2 className="text-3xl font-bold mb-4">Breaking News</h2>
      <article>
        <h3 className="text-2xl font-semibold mb-2">{news[0].title}</h3>
        <p className="text-lg">{news[0].summary}</p>
      </article>
    </div>
  )
}

// 中优先级: 分类新闻
async function CategoryNews() {
  const news = await fetch('https://api.example.com/news/categories', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {news.map((item: any) => (
        <article key={item.id} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600">{item.summary}</p>
        </article>
      ))}
    </div>
  )
}

// 低优先级: 广告
async function Ads() {
  const ads = await fetch('https://api.example.com/ads', {
    cache: 'no-store',
    // 低优先级请求
    priority: 'low'
  } as RequestInit).then(r => r.json())
  
  return (
    <aside className="border rounded-lg p-4 bg-gray-50">
      <div className="text-sm text-gray-500 mb-2">Advertisement</div>
      <div>{ads[0].content}</div>
    </aside>
  )
}

export default function NewsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">News</h1>
      
      {/* 高优先级: 首先加载 */}
      <Suspense fallback={
        <div className="border rounded-lg p-6 bg-red-50 mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      }>
        <HeadlineNews />
      </Suspense>
      
      {/* 中优先级: 然后加载 */}
      <Suspense fallback={
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      }>
        <CategoryNews />
      </Suspense>
      
      {/* 低优先级: 最后加载 */}
      <Suspense fallback={
        <aside className="border rounded-lg p-4 bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </aside>
      }>
        <Ads />
      </Suspense>
    </div>
  )
}
```

### 5.2 错误边界

```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="border border-red-500 rounded-lg p-6 bg-red-50">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600">
            {this.state.error?.message || 'An error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// app/dashboard/page.tsx
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'

async function UnreliableData() {
  const data = await fetch('https://api.example.com/unreliable', {
    cache: 'no-store'
  }).then(r => {
    if (!r.ok) throw new Error('Failed to fetch data')
    return r.json()
  })
  
  return <div>{data.value}</div>
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <ErrorBoundary
        fallback={
          <div className="border border-yellow-500 rounded-lg p-6 bg-yellow-50">
            <p className="text-yellow-700">
              Unable to load this section. Please try again later.
            </p>
          </div>
        }
      >
        <Suspense fallback={<div>Loading...</div>}>
          <UnreliableData />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

---

## 六、实战案例

### 6.1 社交媒体 Feed

```typescript
// app/feed/page.tsx
import { Suspense } from 'react'

async function Stories() {
  const stories = await fetch('https://api.example.com/stories', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="flex gap-4 overflow-x-auto mb-8 pb-4">
      {stories.map((story: any) => (
        <div key={story.id} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500 overflow-hidden">
            <img src={story.avatar} alt={story.user} className="w-full h-full object-cover" />
          </div>
          <div className="text-center text-sm mt-1">{story.user}</div>
        </div>
      ))}
    </div>
  )
}

async function Posts() {
  const posts = await fetch('https://api.example.com/posts', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <article key={post.id} className="border rounded-lg overflow-hidden">
          <div className="p-4 flex items-center gap-3">
            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-semibold">{post.author.name}</div>
              <div className="text-sm text-gray-600">{post.timestamp}</div>
            </div>
          </div>
          
          {post.image && (
            <img src={post.image} alt="" className="w-full" />
          )}
          
          <div className="p-4">
            <p>{post.content}</p>
            <div className="flex gap-6 mt-4 text-gray-600">
              <button className="hover:text-blue-600">{post.likes} likes</button>
              <button className="hover:text-blue-600">{post.comments} comments</button>
              <button className="hover:text-blue-600">Share</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

async function Suggestions() {
  const users = await fetch('https://api.example.com/suggestions', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <aside className="border rounded-lg p-6">
      <h2 className="font-bold mb-4">Suggestions for you</h2>
      <div className="space-y-4">
        {users.map((user: any) => (
          <div key={user.id} className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-600">{user.mutualFriends} mutual friends</div>
            </div>
            <button className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Follow
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default function FeedPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Suspense fallback={
              <div className="flex gap-4 mb-8 overflow-hidden">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            }>
              <Stories />
            </Suspense>
            
            <Suspense fallback={
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-full h-96 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            }>
              <Posts />
            </Suspense>
          </div>
          
          <div>
            <Suspense fallback={
              <aside className="border rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            }>
              <Suggestions />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 七、最佳实践

### 7.1 合理使用 Suspense

```typescript
// ✓ 好的做法: 细粒度的 Suspense 边界
<div>
  <Suspense fallback={<HeaderLoading />}>
    <Header />
  </Suspense>
  
  <Suspense fallback={<ContentLoading />}>
    <Content />
  </Suspense>
  
  <Suspense fallback={<SidebarLoading />}>
    <Sidebar />
  </Suspense>
</div>

// ✗ 不好的做法: 单个大的 Suspense 边界
<Suspense fallback={<PageLoading />}>
  <div>
    <Header />
    <Content />
    <Sidebar />
  </div>
</Suspense>
```

### 7.2 优化加载状态

```typescript
// ✓ 好的做法: 精确的骨架屏
function ProductCardLoading() {
  return (
    <div className="border rounded-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}

// ✗ 不好的做法: 简单的 "Loading..."
function BadLoading() {
  return <div>Loading...</div>
}
```

### 7.3 性能监控

```typescript
// lib/performance.ts
export function measureStreamingPerformance() {
  if (typeof window === 'undefined') return
  
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    console.log('Performance Metrics:', {
      // 首次内容绘制
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      
      // 最大内容绘制
      LCP: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime,
      
      // Time to First Byte
      TTFB: navigation.responseStart - navigation.requestStart,
      
      // DOM 加载完成
      DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      
      // 页面完全加载
      LoadComplete: navigation.loadEventEnd - navigation.loadEventStart
    })
  })
}
```

---

## 八、总结

### 8.1 关键要点

1. **流式渲染优势**: 更快的首屏,更好的用户体验
2. **Suspense 边界**: 细粒度控制加载状态
3. **loading.tsx**: 路由级别的加载UI
4. **并行加载**: 多个组件独立流式加载
5. **性能优化**: 优先级加载,错误处理

### 8.2 适用场景

| 场景 | 是否适合流式渲染 |
|------|----------------|
| 社交媒体 Feed | ✓ 非常适合 |
| 新闻网站 | ✓ 非常适合 |
| 电商产品页 | ✓ 适合 |
| 用户仪表板 | ✓ 适合 |
| 简单静态页 | ✗ 不需要 |

### 8.3 学习资源

1. 官方文档
   - Loading UI: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
   - Suspense: https://react.dev/reference/react/Suspense

2. 性能工具
   - Chrome DevTools Performance
   - Lighthouse
   - Web Vitals

---

## 课后练习

1. 创建一个流式渲染的博客首页
2. 实现一个带优先级的新闻页面
3. 构建一个社交媒体 Feed
4. 优化现有页面使用流式渲染
5. 实现自定义 loading 骨架屏

通过本课程的学习,你应该能够熟练使用流式渲染技术,显著提升应用的用户体验和感知性能!

