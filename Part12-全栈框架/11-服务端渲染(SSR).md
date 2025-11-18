# 服务端渲染 (SSR - Server-Side Rendering)

## 课程概述

本课程深入探讨 Next.js 15 中的服务端渲染(SSR)。服务端渲染在每次请求时动态生成HTML,适合需要实时数据或个性化内容的页面。掌握SSR对于构建动态Web应用至关重要。

学习目标:
- 理解服务端渲染的原理和优势
- 掌握动态数据获取
- 学习请求时数据处理
- 理解SSR性能优化
- 掌握缓存策略
- 学习流式SSR
- 理解SSR与其他渲染模式的区别
- 掌握SSR最佳实践

---

## 一、服务端渲染基础

### 1.1 什么是服务端渲染

服务端渲染在每次请求时在服务器上生成HTML:

```typescript
// app/dashboard/page.tsx
// 使用 cache: 'no-store' 强制动态渲染
export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/dashboard', {
    cache: 'no-store' // 不缓存,每次请求都获取新数据
  }).then(r => r.json())
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">{data.totalUsers}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <p className="text-3xl font-bold text-green-600">{data.activeSessions}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-3xl font-bold text-purple-600">${data.revenue}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  )
}
```

**SSR的优势:**

| 优势 | 说明 |
|------|------|
| 实时数据 | 每次请求都获取最新数据 |
| 个性化内容 | 基于用户信息渲染不同内容 |
| SEO友好 | 搜索引擎能索引完整HTML |
| 首屏快速 | 用户立即看到内容 |
| 安全性 | 敏感数据不暴露给客户端 |

**适用场景:**

- 用户仪表板
- 个性化推荐页面
- 实时数据展示
- 需要认证的页面
- 频繁更新的内容

### 1.2 SSR vs 其他渲染模式

```typescript
// 1. 服务端渲染 (SSR) - 每次请求时渲染
// app/profile/page.tsx
export default async function ProfilePage() {
  const user = await fetch('https://api.example.com/user', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return <div>Welcome, {user.name}</div>
}

// 2. 静态生成 (SSG) - 构建时渲染
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>
}

// 3. 增量静态再生成 (ISR) - 定期更新
// app/blog/page.tsx
export const revalidate = 60 // 60秒后重新生成

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())
  
  return <div>{/* 渲染文章 */}</div>
}

// 4. 客户端渲染 (CSR) - 浏览器端渲染
// app/interactive/page.tsx
'use client'
import { useState, useEffect } from 'react'

export default function InteractivePage() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setData)
  }, [])
  
  return <div>{data ? '已加载' : '加载中...'}</div>
}
```

### 1.3 强制动态渲染

```typescript
// app/dashboard/page.tsx
// 方式1: 使用路由段配置
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/dashboard')
    .then(r => r.json())
  
  return <div>{/* 内容 */}</div>
}

// 方式2: 使用 cache: 'no-store'
export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/dashboard', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return <div>{/* 内容 */}</div>
}

// 方式3: 使用动态函数
import { cookies, headers } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const headersList = await headers()
  
  // 使用 cookies 或 headers 会自动触发动态渲染
  const token = cookieStore.get('token')
  
  return <div>{/* 内容 */}</div>
}
```

---

## 二、动态数据获取

### 2.1 实时API数据

```typescript
// app/stocks/page.tsx
interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

async function getStockData(): Promise<StockData[]> {
  const res = await fetch('https://api.example.com/stocks', {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`
    }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch stock data')
  }
  
  return res.json()
}

export default async function StocksPage() {
  const stocks = await getStockData()
  const lastUpdate = new Date().toLocaleTimeString()
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Stock Prices</h1>
        <span className="text-sm text-gray-500">
          Last updated: {lastUpdate}
        </span>
      </div>
      
      <div className="grid gap-4">
        {stocks.map(stock => (
          <div key={stock.symbol} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-bold text-xl">{stock.symbol}</div>
              <div className="text-3xl font-semibold">${stock.price.toFixed(2)}</div>
            </div>
            <div className={`text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className="text-2xl font-bold">
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
              </div>
              <div className="text-lg">
                ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 2.2 用户特定数据

```typescript
// lib/auth.ts
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface User {
  id: string
  email: string
  name: string
  role: string
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    return null
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as User
  } catch (error) {
    return null
  }
}

// app/profile/page.tsx
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function getUserProfile(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}`, {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${process.env.API_SECRET}`
    }
  })
  
  return res.json()
}

async function getUserOrders(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/orders`, {
    cache: 'no-store'
  })
  
  return res.json()
}

export default async function ProfilePage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const [profile, orders] = await Promise.all([
    getUserProfile(user.id),
    getUserOrders(user.id)
  ])
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="border rounded-lg p-6">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt={profile.name}
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-semibold text-center">{profile.name}</h2>
            <p className="text-gray-600 text-center">{profile.email}</p>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Member since</span>
                <span className="font-semibold">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total orders</span>
                <span className="font-semibold">{orders.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">Order #{order.id}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  ${order.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 2.3 数据库查询

```typescript
// app/admin/users/page.tsx
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function getUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ])
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const user = await getUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/forbidden')
  }
  
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { users, pagination } = await getUsers(page)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">User Management</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 border-b text-left">ID</th>
              <th className="px-6 py-3 border-b text-left">Name</th>
              <th className="px-6 py-3 border-b text-left">Email</th>
              <th className="px-6 py-3 border-b text-left">Role</th>
              <th className="px-6 py-3 border-b text-left">Posts</th>
              <th className="px-6 py-3 border-b text-left">Comments</th>
              <th className="px-6 py-3 border-b text-left">Joined</th>
              <th className="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{u.id}</td>
                <td className="px-6 py-4 border-b">{u.name}</td>
                <td className="px-6 py-4 border-b">{u.email}</td>
                <td className="px-6 py-4 border-b">
                  <span className={`px-2 py-1 rounded text-sm ${
                    u.role === 'admin' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 border-b">{u._count.posts}</td>
                <td className="px-6 py-4 border-b">{u._count.comments}</td>
                <td className="px-6 py-4 border-b">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 border-b">
                  <a href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`?page=${p}`}
              className={`px-4 py-2 border rounded ${
                p === pagination.page
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2.4 搜索和筛选

```typescript
// app/products/page.tsx
import { prisma } from '@/lib/prisma'

interface SearchParams {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  sortBy?: string
  page?: string
}

async function searchProducts(params: SearchParams) {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    page = '1'
  } = params
  
  const limit = 20
  const skip = (parseInt(page) - 1) * limit
  
  // 构建查询条件
  const where: any = {}
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ]
  }
  
  if (category) {
    where.category = category
  }
  
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }
  
  // 构建排序
  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'price-asc') orderBy = { price: 'asc' }
  if (sortBy === 'price-desc') orderBy = { price: 'desc' }
  if (sortBy === 'name') orderBy = { name: 'asc' }
  
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: {
          select: { name: true }
        }
      }
    }),
    prisma.product.count({ where })
  ])
  
  return {
    products,
    pagination: {
      page: parseInt(page),
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { products, pagination } = await searchProducts(params)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Products</h1>
      
      <div className="flex gap-8">
        <aside className="w-64 flex-shrink-0">
          <form method="get" className="space-y-6">
            <div>
              <label className="block font-semibold mb-2">Search</label>
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Search products..."
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Category</label>
              <select
                name="category"
                defaultValue={params.category}
                className="w-full p-2 border rounded"
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
              </select>
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Price Range</label>
              <div className="space-y-2">
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={params.minPrice}
                  placeholder="Min"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={params.maxPrice}
                  placeholder="Max"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block font-semibold mb-2">Sort By</label>
              <select
                name="sortBy"
                defaultValue={params.sortBy}
                className="w-full p-2 border rounded"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </form>
        </aside>
        
        <main className="flex-1">
          <div className="mb-4 text-gray-600">
            Found {pagination.total} products
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(product => (
              <a
                key={product.id}
                href={`/products/${product.id}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.category.name}
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </a>
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({
                    ...params,
                    page: p.toString()
                  })}`}
                  className={`px-4 py-2 border rounded ${
                    p === pagination.page
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
```

---

## 三、请求对象访问

### 3.1 Headers 和 Cookies

```typescript
// app/api-test/page.tsx
import { cookies, headers } from 'next/headers'

export default async function ApiTestPage() {
  const headersList = await headers()
  const cookieStore = await cookies()
  
  // 获取请求头
  const userAgent = headersList.get('user-agent')
  const referer = headersList.get('referer')
  const host = headersList.get('host')
  
  // 获取 Cookies
  const token = cookieStore.get('token')
  const theme = cookieStore.get('theme')
  
  // 获取所有 cookies
  const allCookies = cookieStore.getAll()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Request Information</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Headers</h2>
        <div className="border rounded-lg p-4 space-y-2">
          <div><strong>User-Agent:</strong> {userAgent}</div>
          <div><strong>Referer:</strong> {referer || 'N/A'}</div>
          <div><strong>Host:</strong> {host}</div>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Cookies</h2>
        <div className="border rounded-lg p-4">
          {allCookies.length > 0 ? (
            <div className="space-y-2">
              {allCookies.map(cookie => (
                <div key={cookie.name}>
                  <strong>{cookie.name}:</strong> {cookie.value}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No cookies found</div>
          )}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Request Time</h2>
        <div className="border rounded-lg p-4">
          {new Date().toLocaleString()}
        </div>
      </section>
    </div>
  )
}
```

### 3.2 IP地址和地理位置

```typescript
// app/location/page.tsx
import { headers } from 'next/headers'

async function getLocationInfo(ip: string) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`)
    return res.json()
  } catch (error) {
    return null
  }
}

export default async function LocationPage() {
  const headersList = await headers()
  
  // 获取客户端IP地址
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
             headersList.get('x-real-ip') ||
             'unknown'
  
  const location = ip !== 'unknown' ? await getLocationInfo(ip) : null
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Your Location</h1>
      
      <div className="border rounded-lg p-6">
        <div className="mb-4">
          <strong>IP Address:</strong> {ip}
        </div>
        
        {location && (
          <>
            <div className="mb-4">
              <strong>City:</strong> {location.city}
            </div>
            <div className="mb-4">
              <strong>Region:</strong> {location.region}
            </div>
            <div className="mb-4">
              <strong>Country:</strong> {location.country_name}
            </div>
            <div className="mb-4">
              <strong>Timezone:</strong> {location.timezone}
            </div>
            <div className="mb-4">
              <strong>Coordinates:</strong> {location.latitude}, {location.longitude}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

### 3.3 用户代理检测

```typescript
// app/device-info/page.tsx
import { headers } from 'next/headers'

function parseUserAgent(userAgent: string) {
  const isMobile = /mobile/i.test(userAgent)
  const isTablet = /tablet|ipad/i.test(userAgent)
  const isDesktop = !isMobile && !isTablet
  
  let browser = 'Unknown'
  if (userAgent.includes('Chrome')) browser = 'Chrome'
  else if (userAgent.includes('Firefox')) browser = 'Firefox'
  else if (userAgent.includes('Safari')) browser = 'Safari'
  else if (userAgent.includes('Edge')) browser = 'Edge'
  
  let os = 'Unknown'
  if (userAgent.includes('Windows')) os = 'Windows'
  else if (userAgent.includes('Mac')) os = 'macOS'
  else if (userAgent.includes('Linux')) os = 'Linux'
  else if (userAgent.includes('Android')) os = 'Android'
  else if (userAgent.includes('iOS')) os = 'iOS'
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    browser,
    os,
    raw: userAgent
  }
}

export default async function DeviceInfoPage() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  const deviceInfo = parseUserAgent(userAgent)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Device Information</h1>
      
      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <strong>Device Type:</strong>{' '}
          {deviceInfo.isMobile ? 'Mobile' : 
           deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
        </div>
        <div>
          <strong>Browser:</strong> {deviceInfo.browser}
        </div>
        <div>
          <strong>Operating System:</strong> {deviceInfo.os}
        </div>
        <div className="pt-4 border-t">
          <strong>Raw User Agent:</strong>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-x-auto">
            {deviceInfo.raw}
          </pre>
        </div>
      </div>
      
      {/* 响应式内容示例 */}
      {deviceInfo.isMobile && (
        <div className="mt-8 p-4 bg-blue-100 rounded">
          This is mobile-specific content!
        </div>
      )}
      
      {deviceInfo.isDesktop && (
        <div className="mt-8 p-4 bg-green-100 rounded">
          This is desktop-specific content!
        </div>
      )}
    </div>
  )
}
```

---

## 四、SSR性能优化

### 4.1 并行数据获取

```typescript
// app/dashboard/page.tsx
async function getUserData() {
  const res = await fetch('https://api.example.com/user', {
    cache: 'no-store'
  })
  return res.json()
}

async function getStats() {
  const res = await fetch('https://api.example.com/stats', {
    cache: 'no-store'
  })
  return res.json()
}

async function getNotifications() {
  const res = await fetch('https://api.example.com/notifications', {
    cache: 'no-store'
  })
  return res.json()
}

async function getRecentActivity() {
  const res = await fetch('https://api.example.com/activity', {
    cache: 'no-store'
  })
  return res.json()
}

export default async function DashboardPage() {
  // 并行获取所有数据
  const [user, stats, notifications, activity] = await Promise.all([
    getUserData(),
    getStats(),
    getNotifications(),
    getRecentActivity()
  ])
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">
        Welcome back, {user.name}!
      </h1>
      
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Views</div>
          <div className="text-3xl font-bold">{stats.totalViews}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Active Users</div>
          <div className="text-3xl font-bold">{stats.activeUsers}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Revenue</div>
          <div className="text-3xl font-bold">${stats.revenue}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-600">Notifications</div>
          <div className="text-3xl font-bold">{notifications.length}</div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {activity.slice(0, 5).map((item: any) => (
              <div key={item.id} className="border rounded p-3">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-600">{item.time}</div>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif: any) => (
              <div key={notif.id} className="border rounded p-3">
                <div className="font-semibold">{notif.message}</div>
                <div className="text-sm text-gray-600">{notif.time}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
```

### 4.2 数据预加载

```typescript
// lib/data.ts
import { cache } from 'react'

// React cache 自动进行请求去重
export const getPost = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    cache: 'no-store'
  })
  return res.json()
})

export const getComments = cache(async (postId: string) => {
  const res = await fetch(`https://api.example.com/posts/${postId}/comments`, {
    cache: 'no-store'
  })
  return res.json()
})

// app/posts/[id]/page.tsx
import { getPost, getComments } from '@/lib/data'

// 预加载函数
export const preload = (id: string) => {
  void getPost(id)
  void getComments(id)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  
  // 并行获取数据
  const [post, comments] = await Promise.all([
    getPost(id),
    getComments(id)
  ])
  
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <article>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="prose max-w-none mb-8">{post.content}</div>
      </article>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Comments ({comments.length})
        </h2>
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
```

### 4.3 流式SSR

```typescript
// app/feed/page.tsx
import { Suspense } from 'react'

async function QuickContent() {
  // 快速加载的内容
  await new Promise(resolve => setTimeout(resolve, 100))
  return <div className="p-4 bg-green-100 rounded">Quick Content Loaded</div>
}

async function SlowContent() {
  // 慢速加载的内容
  const data = await fetch('https://api.example.com/slow-data', {
    cache: 'no-store'
  }).then(r => r.json())
  
  return (
    <div className="p-4 bg-yellow-100 rounded">
      Slow Content: {data.message}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-4 border rounded animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Feed</h1>
      
      <div className="space-y-6">
        {/* 立即显示 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <QuickContent />
        </Suspense>
        
        {/* 流式传输 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <SlowContent />
        </Suspense>
        
        {/* 更多内容 */}
        <Suspense fallback={<LoadingSkeleton />}>
          <SlowContent />
        </Suspense>
      </div>
    </div>
  )
}
```

### 4.4 部分缓存

```typescript
// app/mixed/page.tsx
// 部分内容使用缓存,部分动态生成

async function getStaticContent() {
  // 缓存的内容
  const res = await fetch('https://api.example.com/static', {
    next: { revalidate: 3600 } // 1小时缓存
  })
  return res.json()
}

async function getDynamicContent() {
  // 动态内容
  const res = await fetch('https://api.example.com/dynamic', {
    cache: 'no-store'
  })
  return res.json()
}

export default async function MixedPage() {
  const [staticData, dynamicData] = await Promise.all([
    getStaticContent(),
    getDynamicContent()
  ])
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Mixed Content</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Static Content</h2>
          <p className="text-gray-600 mb-2">Cached for 1 hour</p>
          <div>{staticData.content}</div>
        </section>
        
        <section className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Dynamic Content</h2>
          <p className="text-gray-600 mb-2">
            Generated at: {new Date().toLocaleString()}
          </p>
          <div>{dynamicData.content}</div>
        </section>
      </div>
    </div>
  )
}
```

---

## 五、缓存策略

### 5.1 Route Segment Config

```typescript
// app/dashboard/page.tsx
// 路由段配置选项
export const dynamic = 'force-dynamic' // 强制动态渲染
export const dynamicParams = true // 允许动态参数
export const revalidate = 0 // 不缓存
export const fetchCache = 'default-no-store' // fetch 默认不缓存
export const runtime = 'nodejs' // 运行时: nodejs 或 edge
export const preferredRegion = 'auto' // 首选区域

export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/dashboard')
    .then(r => r.json())
  
  return <div>{/* 内容 */}</div>
}
```

### 5.2 Request-Level 缓存

```typescript
// app/products/page.tsx
async function getProducts() {
  // 不缓存
  const res = await fetch('https://api.example.com/products', {
    cache: 'no-store'
  })
  return res.json()
}

async function getCategories() {
  // 缓存5分钟
  const res = await fetch('https://api.example.com/categories', {
    next: { revalidate: 300 }
  })
  return res.json()
}

async function getStaticData() {
  // 永久缓存
  const res = await fetch('https://api.example.com/static', {
    cache: 'force-cache'
  })
  return res.json()
}

export default async function ProductsPage() {
  const [products, categories, staticData] = await Promise.all([
    getProducts(),    // 不缓存
    getCategories(),  // 缓存5分钟
    getStaticData()   // 永久缓存
  ])
  
  return (
    <div className="container mx-auto p-4">
      {/* 渲染内容 */}
    </div>
  )
}
```

### 5.3 React Cache

```typescript
// lib/data.ts
import { cache } from 'react'

// 使用 React cache 进行请求去重
export const getUser = cache(async (id: string) => {
  console.log('Fetching user:', id)
  const res = await fetch(`https://api.example.com/users/${id}`, {
    cache: 'no-store'
  })
  return res.json()
})

// app/user/[id]/page.tsx
import { getUser } from '@/lib/data'

async function UserHeader({ id }: { id: string }) {
  const user = await getUser(id) // 第一次调用
  return <h1>{user.name}</h1>
}

async function UserBio({ id }: { id: string }) {
  const user = await getUser(id) // 复用缓存
  return <p>{user.bio}</p>
}

async function UserStats({ id }: { id: string }) {
  const user = await getUser(id) // 复用缓存
  return <div>Posts: {user.postsCount}</div>
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params
  
  // 即使调用3次 getUser,只会执行1次请求
  return (
    <div className="container mx-auto p-4">
      <UserHeader id={id} />
      <UserBio id={id} />
      <UserStats id={id} />
    </div>
  )
}
```

---

## 六、错误处理

### 6.1 Error Boundary

```typescript
// app/dashboard/error.tsx
'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])
  
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred while loading the dashboard.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 border rounded hover:bg-gray-100"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
```

### 6.2 数据获取错误处理

```typescript
// lib/api.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store'
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new APIError(
        error.message || `HTTP ${res.status}`,
        res.status,
        error.code
      )
    }
    
    return res.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError('Network error', 500)
  }
}

// app/dashboard/page.tsx
import { fetchAPI, APIError } from '@/lib/api'

interface DashboardData {
  stats: any
  activity: any[]
}

export default async function DashboardPage() {
  try {
    const data = await fetchAPI<DashboardData>('https://api.example.com/dashboard')
    
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        {/* 渲染数据 */}
      </div>
    )
  } catch (error) {
    if (error instanceof APIError) {
      if (error.statusCode === 401) {
        return (
          <div className="container mx-auto p-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
              <p className="mb-6">Please log in to view this page.</p>
              <a href="/login" className="px-6 py-3 bg-blue-500 text-white rounded">
                Log In
              </a>
            </div>
          </div>
        )
      }
      
      if (error.statusCode === 403) {
        return (
          <div className="container mx-auto p-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p>You don't have permission to view this page.</p>
            </div>
          </div>
        )
      }
    }
    
    throw error // 让 error boundary 处理其他错误
  }
}
```

### 6.3 Fallback UI

```typescript
// app/feed/page.tsx
import { Suspense } from 'react'

async function Feed() {
  try {
    const posts = await fetch('https://api.example.com/posts', {
      cache: 'no-store'
    }).then(r => r.json())
    
    return (
      <div className="space-y-4">
        {posts.map((post: any) => (
          <div key={post.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600">{post.excerpt}</p>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load feed</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }
}

export default function FeedPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Feed</h1>
      
      <Suspense fallback={
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      }>
        <Feed />
      </Suspense>
    </div>
  )
}
```

---

## 七、实战案例

### 7.1 实时仪表板

```typescript
// app/analytics/page.tsx
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getAnalytics(userId: string) {
  const [stats, recentViews, topPages] = await Promise.all([
    // 总体统计
    prisma.analytics.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { views: true, clicks: true }
    }),
    
    // 最近浏览
    prisma.pageView.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        page: {
          select: { title: true, path: true }
        }
      }
    }),
    
    // 热门页面
    prisma.page.findMany({
      where: { userId },
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        title: true,
        path: true,
        views: true
      }
    })
  ])
  
  return { stats, recentViews, topPages }
}

export default async function AnalyticsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { stats, recentViews, topPages } = await getAnalytics(user.id)
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
        <span className="text-sm text-gray-500">
          Real-time • Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="border rounded-lg p-6 bg-blue-50">
          <div className="text-sm text-gray-600 mb-2">Total Pages</div>
          <div className="text-4xl font-bold text-blue-600">
            {stats._count.id}
          </div>
        </div>
        
        <div className="border rounded-lg p-6 bg-green-50">
          <div className="text-sm text-gray-600 mb-2">Total Views</div>
          <div className="text-4xl font-bold text-green-600">
            {stats._sum.views || 0}
          </div>
        </div>
        
        <div className="border rounded-lg p-6 bg-purple-50">
          <div className="text-sm text-gray-600 mb-2">Total Clicks</div>
          <div className="text-4xl font-bold text-purple-600">
            {stats._sum.clicks || 0}
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Top Pages</h2>
          <div className="border rounded-lg divide-y">
            {topPages.map((page, index) => (
              <div key={page.path} className="p-4 flex justify-between items-center">
                <div>
                  <span className="inline-block w-6 text-gray-500">#{index + 1}</span>
                  <span className="font-semibold">{page.title}</span>
                  <div className="text-sm text-gray-500">{page.path}</div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {page.views} views
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="border rounded-lg divide-y">
            {recentViews.map(view => (
              <div key={view.id} className="p-4">
                <div className="font-semibold">{view.page.title}</div>
                <div className="text-sm text-gray-500">
                  {new Date(view.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
```

### 7.2 个性化推荐系统

```typescript
// app/recommendations/page.tsx
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function getUserPreferences(userId: string) {
  const res = await fetch(
    `https://api.example.com/users/${userId}/preferences`,
    { cache: 'no-store' }
  )
  return res.json()
}

async function getRecommendations(userId: string, preferences: any) {
  const res = await fetch('https://api.example.com/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, preferences }),
    cache: 'no-store'
  })
  return res.json()
}

export default async function RecommendationsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const preferences = await getUserPreferences(user.id)
  const recommendations = await getRecommendations(user.id, preferences)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-2">Recommended for You</h1>
      <p className="text-gray-600 mb-8">
        Based on your interests and activity
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((item: any) => (
          <a
            key={item.id}
            href={`/items/${item.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="font-semibold mb-2">{item.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">
                  {item.matchScore}% match
                </span>
                <span className="text-sm text-gray-500">
                  • {item.category}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
```

---

## 八、总结与最佳实践

### 8.1 何时使用SSR

```typescript
// 适合SSR的场景:
// ✓ 用户仪表板
// ✓ 个性化推荐
// ✓ 实时数据展示
// ✓ 搜索结果页面
// ✓ 需要认证的页面

// 不适合SSR的场景:
// ✗ 静态内容(使用SSG)
// ✗ 高频更新的组件(使用CSR)
// ✗ 简单的营销页面(使用SSG)
```

### 8.2 性能优化建议

```typescript
// 1. 并行数据获取
const [data1, data2] = await Promise.all([
  fetch1(),
  fetch2()
])

// 2. 使用 React cache
import { cache } from 'react'
export const getData = cache(async () => {
  // ...
})

// 3. 部分缓存
const staticData = await fetch(url, { next: { revalidate: 3600 } })
const dynamicData = await fetch(url, { cache: 'no-store' })

// 4. 使用 Suspense 和流式渲染
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>

// 5. 优化数据库查询
const data = await prisma.user.findMany({
  select: { id: true, name: true }, // 只选择需要的字段
  take: 10 // 限制结果数量
})
```

### 8.3 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 响应慢 | 数据获取顺序 | 使用 Promise.all 并行获取 |
| 内容闪烁 | 缺少加载状态 | 使用 Suspense 和 loading.tsx |
| 数据过期 | 缓存配置错误 | 使用 cache: 'no-store' |
| 服务器负载高 | 过度使用SSR | 考虑使用ISR或缓存 |

### 8.4 学习资源

1. 官方文档
   - Server-Side Rendering: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
   - Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching

2. 性能工具
   - React DevTools Profiler
   - Chrome DevTools Performance
   - Lighthouse

3. 实践项目
   - 用户仪表板
   - 实时数据监控
   - 个性化推荐系统
   - 社交媒体Feed

---

## 课后练习

1. 创建一个实时仪表板
2. 实现一个个性化推荐页面
3. 构建一个用户资料页面
4. 开发一个实时搜索功能
5. 优化一个慢速SSR页面

通过本课程的学习,你应该能够熟练使用 Next.js 的服务端渲染功能,构建动态和个性化的Web应用。记住:SSR是处理实时和用户特定数据的最佳选择!

