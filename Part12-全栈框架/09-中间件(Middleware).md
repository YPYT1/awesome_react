# 中间件 (Middleware)

## 课程概述

本课程深入探讨 Next.js 15 中的中间件系统。中间件允许我们在请求完成之前运行代码,实现身份验证、重定向、重写、国际化等功能。掌握中间件是构建企业级 Next.js 应用的关键技能。

学习目标:
- 理解 Next.js 中间件架构
- 掌握中间件的创建和配置
- 学习路径匹配和条件执行
- 理解请求和响应处理
- 掌握身份验证和授权
- 学习重定向和重写
- 理解中间件性能优化
- 掌握中间件最佳实践

---

## 一、中间件基础

### 1.1 中间件概念

中间件在请求完成之前运行,可以:
- 修改请求和响应
- 重定向到不同URL
- 重写URL
- 设置请求头
- 实现身份验证
- 添加日志记录

**中间件文件位置:**

```typescript
// middleware.ts (项目根目录)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware executed for:', request.url)
  
  return NextResponse.next()
}

// 配置匹配路径
export const config = {
  matcher: '/about/:path*'
}
```

### 1.2 基础中间件示例

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. 获取请求信息
  const { pathname, searchParams } = request.nextUrl
  const method = request.method
  const userAgent = request.headers.get('user-agent')
  
  console.log(`[${method}] ${pathname}`, {
    userAgent,
    params: Object.fromEntries(searchParams)
  })
  
  // 2. 继续请求
  return NextResponse.next()
}
```

### 1.3 响应操作

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 添加响应头
  response.headers.set('X-Custom-Header', 'value')
  response.headers.set('X-Request-Time', new Date().toISOString())
  
  // 添加 Cookie
  response.cookies.set('visited', 'true', {
    maxAge: 60 * 60 * 24 * 7, // 7天
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  })
  
  return response
}
```

### 1.4 请求操作

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 读取 Cookie
  const token = request.cookies.get('token')?.value
  
  // 读取请求头
  const authorization = request.headers.get('authorization')
  
  // 读取查询参数
  const redirect = request.nextUrl.searchParams.get('redirect')
  
  // 克隆 URL 并修改
  const url = request.nextUrl.clone()
  url.searchParams.set('timestamp', Date.now().toString())
  
  // 修改请求头
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-middleware-processed', 'true')
  
  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}
```

---

## 二、路径匹配配置

### 2.1 Matcher 配置

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// 基础匹配
export const config = {
  matcher: '/about/:path*'
}

// 多路径匹配
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*']
}

// 复杂模式
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}

// 排除特定路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径,除了以下开头的:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
```

**Matcher 规则:**

| 模式 | 匹配 | 不匹配 |
|------|------|--------|
| `/about/:path*` | `/about/team`, `/about/team/members` | `/about`, `/contact` |
| `/dashboard/:path+` | `/dashboard/settings` | `/dashboard` |
| `/api/:path*` | `/api/users`, `/api/posts/1` | `/about` |
| `/:path*` | 所有路径 | 无 |
| `/blog/:slug` | `/blog/hello-world` | `/blog/hello-world/comments` |

### 2.2 条件匹配

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. 路径判断
  if (pathname.startsWith('/admin')) {
    // 管理员路径逻辑
    return handleAdminRoute(request)
  }
  
  if (pathname.startsWith('/api')) {
    // API 路径逻辑
    return handleAPIRoute(request)
  }
  
  // 2. 方法判断
  if (request.method === 'POST') {
    // POST 请求逻辑
  }
  
  // 3. 请求头判断
  const isBot = /bot|crawler|spider/i.test(
    request.headers.get('user-agent') || ''
  )
  
  if (isBot) {
    // 爬虫逻辑
  }
  
  return NextResponse.next()
}

function handleAdminRoute(request: NextRequest) {
  const token = request.cookies.get('admin-token')
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

function handleAPIRoute(request: NextRequest) {
  const response = NextResponse.next()
  
  // 添加 CORS 头
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

### 2.3 动态匹配

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 使用正则表达式匹配
  const isPublicFile = /\.(jpg|jpeg|png|gif|svg|css|js|ico)$/.test(pathname)
  
  if (isPublicFile) {
    // 公共文件不需要处理
    return NextResponse.next()
  }
  
  // 匹配动态路由
  const blogPostMatch = pathname.match(/^\/blog\/([^/]+)$/)
  if (blogPostMatch) {
    const slug = blogPostMatch[1]
    console.log('Blog post:', slug)
  }
  
  // 匹配多级路由
  const dashboardMatch = pathname.match(/^\/dashboard\/([^/]+)\/([^/]+)$/)
  if (dashboardMatch) {
    const [, section, subsection] = dashboardMatch
    console.log('Dashboard:', section, subsection)
  }
  
  return NextResponse.next()
}
```

---

## 三、身份验证与授权

### 3.1 JWT 身份验证

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function verifyAuth(request: NextRequest): Promise<boolean> {
  // 从 Cookie 获取 token
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return false
  }
  
  try {
    // 验证 JWT
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 公开路径
  const publicPaths = ['/login', '/register', '/forgot-password']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }
  
  // 受保护路径
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
    const isAuthenticated = await verifyAuth(request)
    
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### 3.2 基于角色的访问控制

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin' | 'moderator'
}

async function getUserFromToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 管理员路由
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const user = await getUserFromToken(token)
    
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
  }
  
  // 版主路由
  if (pathname.startsWith('/moderate')) {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const user = await getUserFromToken(token)
    
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
  }
  
  // 用户路由
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // 将用户信息添加到请求头
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-user-role', user.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/moderate/:path*', '/dashboard/:path*']
}
```

### 3.3 Session 验证

```typescript
// lib/session.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)

export interface SessionData {
  userId: string
  email: string
  role: string
  expiresAt: number
}

export async function encrypt(payload: SessionData): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function decrypt(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionData
  } catch (error) {
    return null
  }
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 受保护的路径
  const protectedPaths = ['/dashboard', '/profile', '/settings']
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  if (isProtectedPath) {
    const session = request.cookies.get('session')?.value
    
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    const sessionData = await decrypt(session)
    
    if (!sessionData || sessionData.expiresAt < Date.now()) {
      // Session 过期
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
  }
  
  return NextResponse.next()
}
```

### 3.4 OAuth 集成

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // 处理 OAuth 回调
  if (pathname === '/auth/callback') {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    if (!code || !state) {
      return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
    }
    
    // 验证 state (防止 CSRF)
    const savedState = request.cookies.get('oauth_state')?.value
    
    if (state !== savedState) {
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
    }
    
    // 继续处理 OAuth 流程
    return NextResponse.next()
  }
  
  // 处理 OAuth 登录
  if (pathname === '/auth/oauth') {
    const provider = searchParams.get('provider')
    
    if (!provider) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // 生成并保存 state
    const state = crypto.randomUUID()
    
    const response = NextResponse.next()
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 10 // 10分钟
    })
    
    return response
  }
  
  return NextResponse.next()
}
```

---

## 四、重定向与重写

### 4.1 条件重定向

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. 未登录用户重定向
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')
    
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // 2. 已登录用户重定向
  if (pathname === '/login' || pathname === '/register') {
    const token = request.cookies.get('token')
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // 3. 维护模式重定向
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  const isMaintenancePage = pathname === '/maintenance'
  
  if (isMaintenanceMode && !isMaintenancePage) {
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }
  
  if (!isMaintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // 4. 旧路径重定向
  const oldPathMap: Record<string, string> = {
    '/old-blog': '/blog',
    '/old-about': '/about',
    '/old-contact': '/contact'
  }
  
  if (pathname in oldPathMap) {
    return NextResponse.redirect(
      new URL(oldPathMap[pathname], request.url),
      { status: 301 } // 永久重定向
    )
  }
  
  return NextResponse.next()
}
```

### 4.2 URL 重写

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. 代理 API 请求
  if (pathname.startsWith('/api/proxy')) {
    const newUrl = new URL(request.url)
    newUrl.hostname = 'external-api.example.com'
    newUrl.pathname = pathname.replace('/api/proxy', '')
    
    return NextResponse.rewrite(newUrl)
  }
  
  // 2. A/B 测试
  const bucket = request.cookies.get('bucket')?.value || 
                 (Math.random() < 0.5 ? 'a' : 'b')
  
  if (pathname === '/') {
    const response = NextResponse.rewrite(
      new URL(`/variant-${bucket}`, request.url)
    )
    
    response.cookies.set('bucket', bucket, {
      maxAge: 60 * 60 * 24 * 30 // 30天
    })
    
    return response
  }
  
  // 3. 多租户路由
  const hostname = request.headers.get('host') || ''
  const subdomain = hostname.split('.')[0]
  
  if (subdomain !== 'www' && subdomain !== 'localhost') {
    // 将子域名重写为路径参数
    const url = new URL(request.url)
    url.pathname = `/tenants/${subdomain}${pathname}`
    
    return NextResponse.rewrite(url)
  }
  
  // 4. 语言路径重写
  const acceptLanguage = request.headers.get('accept-language') || 'en'
  const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0]
  
  if (!pathname.startsWith('/en') && !pathname.startsWith('/zh')) {
    const url = new URL(request.url)
    url.pathname = `/${preferredLanguage}${pathname}`
    
    return NextResponse.rewrite(url)
  }
  
  return NextResponse.next()
}
```

### 4.3 动态重写

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 模拟数据库查询
async function getShortUrl(code: string): Promise<string | null> {
  // 实际应用中应该查询数据库
  const urls: Record<string, string> = {
    'abc123': 'https://example.com/very/long/url',
    'def456': 'https://example.com/another/long/url'
  }
  
  return urls[code] || null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 短链接重定向
  const shortCodeMatch = pathname.match(/^\/s\/([a-zA-Z0-9]+)$/)
  
  if (shortCodeMatch) {
    const code = shortCodeMatch[1]
    const targetUrl = await getShortUrl(code)
    
    if (targetUrl) {
      return NextResponse.redirect(targetUrl, { status: 302 })
    } else {
      return NextResponse.redirect(new URL('/404', request.url))
    }
  }
  
  return NextResponse.next()
}
```

---

## 五、国际化 (i18n)

### 5.1 语言检测与重定向

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ja', 'ko'] as const
const defaultLocale = 'en' as const

type Locale = typeof locales[number]

function getLocale(request: NextRequest): Locale {
  // 1. 从 URL 路径获取
  const pathname = request.nextUrl.pathname
  const pathLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathLocale) {
    return pathLocale
  }
  
  // 2. 从 Cookie 获取
  const cookieLocale = request.cookies.get('locale')?.value as Locale
  
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }
  
  // 3. 从 Accept-Language 头获取
  const acceptLanguage = request.headers.get('accept-language')
  
  if (acceptLanguage) {
    const browserLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0] as Locale
    
    if (locales.includes(browserLocale)) {
      return browserLocale
    }
  }
  
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查路径是否已包含语言代码
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    
    // 重定向到带语言代码的路径
    const url = new URL(`/${locale}${pathname}`, request.url)
    
    const response = NextResponse.redirect(url)
    
    // 保存语言偏好
    response.cookies.set('locale', locale, {
      maxAge: 60 * 60 * 24 * 365 // 1年
    })
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### 5.2 语言切换

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ja', 'ko']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // 处理语言切换
  const changeLocale = searchParams.get('changeLocale')
  
  if (changeLocale && locales.includes(changeLocale)) {
    // 提取当前路径中的语言代码
    const currentLocale = locales.find(
      locale => pathname.startsWith(`/${locale}`)
    )
    
    // 替换语言代码
    const newPathname = currentLocale
      ? pathname.replace(`/${currentLocale}`, `/${changeLocale}`)
      : `/${changeLocale}${pathname}`
    
    // 移除 changeLocale 参数
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('changeLocale')
    
    const url = new URL(newPathname, request.url)
    url.search = newSearchParams.toString()
    
    const response = NextResponse.redirect(url)
    
    // 更新语言 Cookie
    response.cookies.set('locale', changeLocale, {
      maxAge: 60 * 60 * 24 * 365
    })
    
    return response
  }
  
  return NextResponse.next()
}
```

### 5.3 内容协商

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ja', 'ko']
const defaultLocale = 'en'

function negotiateLanguage(
  acceptLanguage: string | null
): string {
  if (!acceptLanguage) {
    return defaultLocale
  }
  
  // 解析 Accept-Language 头
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=')
      const quality = qValue ? parseFloat(qValue) : 1.0
      const locale = code.split('-')[0]
      return { locale, quality }
    })
    .sort((a, b) => b.quality - a.quality)
  
  // 找到匹配的语言
  for (const { locale } of languages) {
    if (locales.includes(locale)) {
      return locale
    }
  }
  
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // API 路径使用内容协商
  if (pathname.startsWith('/api')) {
    const acceptLanguage = request.headers.get('accept-language')
    const locale = negotiateLanguage(acceptLanguage)
    
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', locale)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
  
  return NextResponse.next()
}
```

---

## 六、安全与速率限制

### 6.1 CSRF 保护

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function validateCSRFToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get('csrf_token')?.value
  const headerToken = request.headers.get('x-csrf-token')
  
  return cookieToken === headerToken && !!cookieToken
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method
  
  // 对于 GET 请求,生成 CSRF token
  if (method === 'GET') {
    const response = NextResponse.next()
    
    // 如果没有 token,生成一个
    if (!request.cookies.get('csrf_token')) {
      const token = generateCSRFToken()
      response.cookies.set('csrf_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24小时
      })
    }
    
    return response
  }
  
  // 对于修改性请求,验证 CSRF token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    // API 路由可能使用其他认证方式
    if (pathname.startsWith('/api')) {
      return NextResponse.next()
    }
    
    // 验证 CSRF token
    if (!validateCSRFToken(request)) {
      return Response.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}
```

### 6.2 速率限制

```typescript
// lib/rate-limiter.ts
interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const entry = store.get(identifier)
  
  if (!entry || now > entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }
  
  if (entry.count >= maxRequests) {
    return false
  }
  
  entry.count++
  return true
}

export function getRateLimitInfo(
  identifier: string
): { remaining: number; resetTime: number } | null {
  const entry = store.get(identifier)
  
  if (!entry || Date.now() > entry.resetTime) {
    return null
  }
  
  return {
    remaining: Math.max(0, 100 - entry.count),
    resetTime: entry.resetTime
  }
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, getRateLimitInfo } from './lib/rate-limiter'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 对 API 路由应用速率限制
  if (pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const identifier = `${ip}:${pathname}`
    
    // 每分钟最多100个请求
    const allowed = rateLimit(identifier, 100, 60 * 1000)
    
    if (!allowed) {
      const info = getRateLimitInfo(identifier)
      
      return Response.json(
        {
          error: 'Too many requests',
          retryAfter: info ? Math.ceil((info.resetTime - Date.now()) / 1000) : 60
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }
    
    // 添加速率限制信息到响应头
    const response = NextResponse.next()
    const info = getRateLimitInfo(identifier)
    
    if (info) {
      response.headers.set('X-RateLimit-Limit', '100')
      response.headers.set('X-RateLimit-Remaining', info.remaining.toString())
      response.headers.set('X-RateLimit-Reset', info.resetTime.toString())
    }
    
    return response
  }
  
  return NextResponse.next()
}
```

### 6.3 IP 黑名单

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 黑名单 IP 列表
const blacklistedIPs = new Set([
  '192.168.1.100',
  '10.0.0.50'
])

// IP 范围黑名单
const blacklistedRanges = [
  { start: '192.168.2.0', end: '192.168.2.255' }
]

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
}

function isIPInRange(ip: string, range: { start: string; end: string }): boolean {
  const ipNum = ipToNumber(ip)
  const startNum = ipToNumber(range.start)
  const endNum = ipToNumber(range.end)
  
  return ipNum >= startNum && ipNum <= endNum
}

function isBlacklisted(ip: string): boolean {
  if (blacklistedIPs.has(ip)) {
    return true
  }
  
  return blacklistedRanges.some(range => isIPInRange(ip, range))
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (isBlacklisted(ip)) {
    return Response.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
  
  return NextResponse.next()
}
```

### 6.4 Bot 检测

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const botPatterns = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i
]

function isBot(userAgent: string): boolean {
  return botPatterns.some(pattern => pattern.test(userAgent))
}

const goodBots = [
  'Googlebot',
  'Bingbot',
  'Slackbot',
  'DuckDuckBot',
  'facebookexternalhit'
]

function isGoodBot(userAgent: string): boolean {
  return goodBots.some(bot => userAgent.includes(bot))
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  
  if (isBot(userAgent) && !isGoodBot(userAgent)) {
    // 对可疑爬虫应用更严格的速率限制
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // 这里可以实现更严格的限制
    console.log('Suspicious bot detected:', { ip, userAgent })
    
    // 可以选择阻止或返回简化版本
    // return new Response('Forbidden', { status: 403 })
  }
  
  // 为已知的好爬虫设置特殊响应头
  if (isGoodBot(userAgent)) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'index, follow')
    return response
  }
  
  return NextResponse.next()
}
```

---

## 七、性能优化

### 7.1 响应头优化

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 安全相关头
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // 权限策略
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  
  // 内容安全策略
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}
```

### 7.2 缓存控制

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // 静态资源缓存
  if (/\.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf|eot)$/.test(pathname)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
    return response
  }
  
  // API 响应不缓存
  if (pathname.startsWith('/api')) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate'
    )
    return response
  }
  
  // 页面缓存
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=120'
  )
  
  return response
}
```

### 7.3 压缩与优化

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  
  const response = NextResponse.next()
  
  // 设置压缩相关头
  if (acceptEncoding.includes('br')) {
    response.headers.set('Content-Encoding', 'br')
  } else if (acceptEncoding.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip')
  }
  
  // 提示浏览器可以接受的编码
  response.headers.set('Vary', 'Accept-Encoding')
  
  return response
}
```

### 7.4 Early Hints

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 对主页发送 Early Hints
  if (pathname === '/') {
    const response = NextResponse.next()
    
    // 预加载关键资源
    response.headers.set(
      'Link',
      '</styles/main.css>; rel=preload; as=style, ' +
      '</scripts/main.js>; rel=preload; as=script, ' +
      '</fonts/main.woff2>; rel=preload; as=font; crossorigin'
    )
    
    return response
  }
  
  return NextResponse.next()
}
```

---

## 八、日志与监控

### 8.1 请求日志

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RequestLog {
  timestamp: string
  method: string
  url: string
  userAgent: string
  ip: string
  duration: number
  status: number
}

async function logRequest(log: RequestLog) {
  // 实际应用中可以发送到日志服务
  console.log(JSON.stringify(log))
  
  // 可以发送到外部服务
  // await fetch('https://logging-service.com/logs', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(log)
  // })
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  const response = NextResponse.next()
  
  // 在响应头中添加请求ID
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)
  
  // 记录日志
  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || 'unknown',
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    duration: Date.now() - startTime,
    status: response.status
  }
  
  await logRequest(log)
  
  return response
}
```

### 8.2 性能监控

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface PerformanceMetric {
  route: string
  duration: number
  timestamp: string
}

const metrics: PerformanceMetric[] = []

function recordMetric(route: string, duration: number) {
  metrics.push({
    route,
    duration,
    timestamp: new Date().toISOString()
  })
  
  // 保留最近1000条记录
  if (metrics.length > 1000) {
    metrics.shift()
  }
}

function getAverageResponseTime(route: string): number {
  const routeMetrics = metrics.filter(m => m.route === route)
  
  if (routeMetrics.length === 0) {
    return 0
  }
  
  const sum = routeMetrics.reduce((acc, m) => acc + m.duration, 0)
  return sum / routeMetrics.length
}

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl
  
  const response = NextResponse.next()
  
  const duration = Date.now() - startTime
  
  // 记录性能指标
  recordMetric(pathname, duration)
  
  // 添加性能头
  response.headers.set('Server-Timing', `total;dur=${duration}`)
  
  // 如果响应时间过长,记录警告
  const avgTime = getAverageResponseTime(pathname)
  if (duration > avgTime * 2 && avgTime > 0) {
    console.warn(`Slow response: ${pathname} took ${duration}ms (avg: ${avgTime}ms)`)
  }
  
  return response
}
```

### 8.3 错误跟踪

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface ErrorLog {
  timestamp: string
  url: string
  method: string
  error: string
  stack?: string
  userAgent: string
  ip: string
}

async function logError(errorLog: ErrorLog) {
  console.error('Middleware Error:', errorLog)
  
  // 发送到错误跟踪服务 (如 Sentry)
  // await fetch('https://error-tracking.com/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorLog)
  // })
}

export async function middleware(request: NextRequest) {
  try {
    // 中间件逻辑
    const response = NextResponse.next()
    
    return response
  } catch (error) {
    // 记录错误
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }
    
    await logError(errorLog)
    
    // 返回错误响应
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 九、高级模式

### 9.1 中间件链

```typescript
// lib/middleware-chain.ts
import { NextRequest, NextResponse } from 'next/server'

export type MiddlewareFunction = (
  request: NextRequest,
  response: NextResponse
) => NextResponse | Promise<NextResponse>

export function chain(
  middlewares: MiddlewareFunction[]
): MiddlewareFunction {
  return async (request: NextRequest, initialResponse: NextResponse) => {
    let response = initialResponse
    
    for (const middleware of middlewares) {
      response = await middleware(request, response)
    }
    
    return response
  }
}

// 示例中间件函数
export function addSecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export function addCORS(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  return response
}

export async function logRequest(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  console.log(`[${request.method}] ${request.url}`)
  return response
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { chain, addSecurityHeaders, addCORS, logRequest } from './lib/middleware-chain'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 使用中间件链
  return chain([
    logRequest,
    addSecurityHeaders,
    addCORS
  ])(request, response)
}
```

### 9.2 条件中间件

```typescript
// lib/conditional-middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export type Predicate = (request: NextRequest) => boolean

export function when(
  predicate: Predicate,
  middleware: (request: NextRequest, response: NextResponse) => NextResponse
) {
  return (request: NextRequest, response: NextResponse): NextResponse => {
    if (predicate(request)) {
      return middleware(request, response)
    }
    return response
  }
}

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { chain } from './lib/middleware-chain'
import { when } from './lib/conditional-middleware'

function isAPIRoute(request: NextRequest): boolean {
  return request.nextUrl.pathname.startsWith('/api')
}

function isStaticFile(request: NextRequest): boolean {
  return /\.(jpg|png|css|js)$/.test(request.nextUrl.pathname)
}

function addAPIHeaders(request: NextRequest, response: NextResponse): NextResponse {
  response.headers.set('X-API-Version', '1.0')
  return response
}

function addCacheHeaders(request: NextRequest, response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'public, max-age=31536000')
  return response
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  return chain([
    when(isAPIRoute, addAPIHeaders),
    when(isStaticFile, addCacheHeaders)
  ])(request, response)
}
```

### 9.3 异步中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function checkFeatureFlag(
  userId: string,
  feature: string
): Promise<boolean> {
  // 模拟 API 调用
  const response = await fetch(
    `https://api.example.com/features?userId=${userId}&feature=${feature}`
  )
  const data = await response.json()
  return data.enabled
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 新功能路径
  if (pathname.startsWith('/beta')) {
    const userId = request.cookies.get('user_id')?.value
    
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // 检查用户是否有权访问 Beta 功能
    const hasAccess = await checkFeatureFlag(userId, 'beta_access')
    
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/no-access', request.url))
    }
  }
  
  return NextResponse.next()
}
```

---

## 十、实战案例

### 10.1 完整身份验证系统

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

interface User {
  id: string
  email: string
  role: 'user' | 'admin'
}

async function getUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('token')?.value
  
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

// 路由配置
const routeConfig = {
  public: ['/', '/login', '/register', '/about'],
  protected: ['/dashboard', '/profile', '/settings'],
  admin: ['/admin']
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 公开路径
  if (routeConfig.public.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next()
  }
  
  // 获取用户信息
  const user = await getUser(request)
  
  // 受保护路径
  if (routeConfig.protected.some(path => pathname.startsWith(path))) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // 添加用户信息到请求头
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }
  
  // 管理员路径
  if (routeConfig.admin.some(path => pathname.startsWith(path))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
    
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### 10.2 多租户应用

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface Tenant {
  id: string
  subdomain: string
  customDomain?: string
  active: boolean
}

// 模拟租户数据库
const tenants: Tenant[] = [
  { id: '1', subdomain: 'acme', customDomain: 'acme.com', active: true },
  { id: '2', subdomain: 'widgets', active: true },
  { id: '3', subdomain: 'demo', active: false }
]

function getTenant(hostname: string): Tenant | null {
  // 检查自定义域名
  const customDomain = tenants.find(t => t.customDomain === hostname)
  if (customDomain) {
    return customDomain
  }
  
  // 检查子域名
  const subdomain = hostname.split('.')[0]
  return tenants.find(t => t.subdomain === subdomain) || null
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  
  // 跳过静态文件和 API 路由
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }
  
  // 获取租户信息
  const tenant = getTenant(hostname)
  
  if (!tenant) {
    return NextResponse.redirect(new URL('https://main-site.com/not-found', request.url))
  }
  
  if (!tenant.active) {
    return NextResponse.redirect(new URL('https://main-site.com/inactive', request.url))
  }
  
  // 重写 URL 到租户特定路径
  const url = new URL(request.url)
  url.pathname = `/tenants/${tenant.id}${pathname}`
  
  // 添加租户信息到请求头
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenant.id)
  requestHeaders.set('x-tenant-subdomain', tenant.subdomain)
  
  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders
    }
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

### 10.3 A/B 测试系统

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface Experiment {
  id: string
  name: string
  variants: string[]
  weights: number[]
  enabled: boolean
}

const experiments: Experiment[] = [
  {
    id: 'homepage-redesign',
    name: 'Homepage Redesign',
    variants: ['control', 'variant-a', 'variant-b'],
    weights: [0.34, 0.33, 0.33],
    enabled: true
  }
]

function selectVariant(experiment: Experiment, userId?: string): string {
  if (!experiment.enabled) {
    return 'control'
  }
  
  // 如果有用户ID,使用确定性分配
  if (userId) {
    const hash = hashString(userId + experiment.id)
    const normalized = hash / 0xffffffff
    
    let cumulative = 0
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.weights[i]
      if (normalized < cumulative) {
        return experiment.variants[i]
      }
    }
  }
  
  // 随机分配
  const random = Math.random()
  let cumulative = 0
  
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i]
    if (random < cumulative) {
      return experiment.variants[i]
    }
  }
  
  return 'control'
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 只在首页应用 A/B 测试
  if (pathname === '/') {
    const experiment = experiments.find(e => e.id === 'homepage-redesign')
    
    if (experiment) {
      // 检查是否已有变体分配
      let variant = request.cookies.get(`exp_${experiment.id}`)?.value
      
      if (!variant) {
        const userId = request.cookies.get('user_id')?.value
        variant = selectVariant(experiment, userId)
      }
      
      // 重写到变体页面
      const url = new URL(request.url)
      url.pathname = `/experiments/${variant}`
      
      const response = NextResponse.rewrite(url)
      
      // 保存变体分配
      response.cookies.set(`exp_${experiment.id}`, variant, {
        maxAge: 60 * 60 * 24 * 30 // 30天
      })
      
      // 添加变体信息到响应头(用于分析)
      response.headers.set('X-Experiment-ID', experiment.id)
      response.headers.set('X-Experiment-Variant', variant)
      
      return response
    }
  }
  
  return NextResponse.next()
}
```

---

## 十一、总结与最佳实践

### 11.1 中间件设计原则

```typescript
// 1. 保持简单
// 好: 单一职责
export function middleware(request: NextRequest) {
  return addSecurityHeaders(request)
}

// 坏: 做太多事情
export function middleware(request: NextRequest) {
  // 认证 + 授权 + 日志 + 速率限制 + ...
}

// 2. 避免阻塞操作
// 好: 异步非阻塞
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // 不等待日志完成
  logRequest(request).catch(console.error)
  
  return response
}

// 坏: 阻塞操作
export async function middleware(request: NextRequest) {
  await heavyDatabaseQuery() // 阻塞!
  return NextResponse.next()
}

// 3. 使用适当的匹配器
// 好: 精确匹配
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}

// 坏: 过于宽泛
export const config = {
  matcher: '/:path*'
}

// 4. 处理错误
export async function middleware(request: NextRequest) {
  try {
    // 中间件逻辑
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next() // 继续请求
  }
}
```

### 11.2 性能考虑

```typescript
// 1. 缓存昂贵的操作
const cache = new Map<string, any>()

export async function middleware(request: NextRequest) {
  const key = `user:${request.cookies.get('token')?.value}`
  
  if (!cache.has(key)) {
    const user = await fetchUser(token)
    cache.set(key, user)
  }
  
  const user = cache.get(key)
  // ...
}

// 2. 使用早期返回
export function middleware(request: NextRequest) {
  // 快速路径
  if (request.nextUrl.pathname.startsWith('/static')) {
    return NextResponse.next()
  }
  
  // 更复杂的逻辑
  // ...
}

// 3. 避免不必要的计算
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 只在需要时才检查认证
  if (pathname.startsWith('/protected')) {
    return checkAuth(request)
  }
  
  return NextResponse.next()
}
```

### 11.3 常见错误

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 性能下降 | 中间件做太多事 | 只在必要时运行,使用精确匹配 |
| 无限重定向 | 重定向逻辑错误 | 检查重定向条件,避免循环 |
| Cookie 问题 | Cookie 设置不当 | 正确设置 httpOnly, secure, sameSite |
| 内存泄漏 | 缓存无限增长 | 实现 LRU 缓存或使用外部缓存 |

### 11.4 学习资源

1. 官方文档
   - Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
   - NextResponse: https://nextjs.org/docs/app/api-reference/functions/next-response

2. 相关库
   - jose (JWT): https://github.com/panva/jose
   - upstash/ratelimit: https://github.com/upstash/ratelimit

3. 实践项目
   - 身份验证系统
   - 多租户应用
   - A/B 测试平台
   - API 网关

---

## 课后练习

1. 实现一个完整的 JWT 身份验证中间件
2. 创建一个多语言路由系统
3. 构建一个 A/B 测试框架
4. 开发一个速率限制中间件
5. 实现一个多租户路由系统

通过本课程的学习,你应该能够熟练使用 Next.js 中间件,实现各种路由级别的功能,并掌握中间件的最佳实践。记住:中间件是构建强大全栈应用的关键工具!

