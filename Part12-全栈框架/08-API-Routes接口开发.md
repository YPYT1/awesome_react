# API Routes 接口开发

## 课程概述

本课程深入探讨 Next.js 15 中的 API Routes 开发。API Routes 允许我们在 Next.js 应用中创建后端 API 端点,实现全栈应用开发。通过 Route Handlers,我们可以处理 HTTP 请求、数据库操作、身份验证等后端逻辑。

学习目标:
- 理解 Next.js API Routes 架构
- 掌握 Route Handlers 的使用
- 学习 HTTP 方法处理
- 理解请求和响应对象
- 掌握 API 中间件模式
- 学习错误处理和验证
- 理解 API 安全最佳实践
- 掌握数据库集成

---

## 一、API Routes 基础

### 1.1 Route Handlers 概述

Next.js 15 使用 Route Handlers 替代旧的 API Routes:

```typescript
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello from API' })
}

// 支持的 HTTP 方法
export async function POST() {
  return Response.json({ message: 'POST request' })
}

export async function PUT() {
  return Response.json({ message: 'PUT request' })
}

export async function DELETE() {
  return Response.json({ message: 'DELETE request' })
}

export async function PATCH() {
  return Response.json({ message: 'PATCH request' })
}
```

**路由映射:**

| 文件路径 | API 端点 |
|---------|---------|
| `app/api/hello/route.ts` | `/api/hello` |
| `app/api/users/route.ts` | `/api/users` |
| `app/api/users/[id]/route.ts` | `/api/users/:id` |
| `app/api/posts/[...slug]/route.ts` | `/api/posts/*` |

### 1.2 基础响应格式

```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ]
  
  // JSON 响应
  return Response.json(users)
}

// 带状态码的响应
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  return Response.json(
    { message: 'User created', data: body },
    { status: 201 }
  )
}

// 自定义响应头
export async function PUT(request: NextRequest) {
  return Response.json(
    { message: 'Updated' },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value'
      }
    }
  )
}

// 文本响应
export async function PATCH() {
  return new Response('Plain text response', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// 重定向
export async function DELETE() {
  return Response.redirect(new URL('/api/users', request.url))
}
```

### 1.3 请求处理

```typescript
// app/api/search/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // 获取查询参数
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'
  
  // 获取请求头
  const userAgent = request.headers.get('user-agent')
  const authorization = request.headers.get('authorization')
  
  // 获取 Cookies
  const token = request.cookies.get('token')
  
  return Response.json({
    query,
    page: parseInt(page),
    limit: parseInt(limit),
    userAgent,
    hasAuth: !!authorization,
    hasToken: !!token
  })
}

export async function POST(request: NextRequest) {
  // 获取 JSON 请求体
  const body = await request.json()
  
  // 获取 FormData
  // const formData = await request.formData()
  // const name = formData.get('name')
  
  // 获取原始文本
  // const text = await request.text()
  
  return Response.json({
    received: body,
    timestamp: new Date().toISOString()
  })
}
```

### 1.4 动态路由参数

```typescript
// app/api/users/[id]/route.ts
import { NextRequest } from 'next/server'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params
  
  // 模拟数据库查询
  const user = {
    id: parseInt(id),
    name: 'User ' + id,
    email: `user${id}@example.com`
  }
  
  return Response.json(user)
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params
  const body = await request.json()
  
  // 更新用户逻辑
  return Response.json({
    message: `User ${id} updated`,
    data: body
  })
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params
  
  // 删除用户逻辑
  return Response.json({
    message: `User ${id} deleted`
  })
}

// app/api/posts/[...slug]/route.ts
interface PostRouteContext {
  params: Promise<{
    slug: string[]
  }>
}

export async function GET(
  request: NextRequest,
  context: PostRouteContext
) {
  const { slug } = await context.params
  
  return Response.json({
    path: slug,
    fullPath: slug.join('/')
  })
}
```

---

## 二、数据库集成

### 2.1 Prisma 集成

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// prisma/schema.prisma
/*
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
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
*/

// app/api/users/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          _count: {
            select: { posts: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ])
    
    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = body
    
    // 验证输入
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existing) {
      return Response.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    return Response.json(user, { status: 201 })
  } catch (error) {
    console.error('Failed to create user:', error)
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// app/api/users/[id]/route.ts
interface UserRouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: UserRouteContext
) {
  try {
    const { id } = await context.params
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            published: true,
            createdAt: true
          }
        }
      }
    })
    
    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 移除密码字段
    const { password, ...userWithoutPassword } = user
    
    return Response.json(userWithoutPassword)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return Response.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: UserRouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, email } = body
    
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!existing) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 如果更新邮箱,检查是否重复
    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return Response.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
    }
    
    // 更新用户
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    })
    
    return Response.json(user)
  } catch (error) {
    console.error('Failed to update user:', error)
    return Response.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: UserRouteContext
) {
  try {
    const { id } = await context.params
    
    // 检查用户是否存在
    const existing = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (!existing) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // 删除用户(级联删除相关帖子)
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })
    
    return Response.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return Response.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
```

### 2.2 MongoDB 集成

```typescript
// lib/mongodb.ts
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// app/api/products/route.ts
import { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('shop')
    
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const query = category ? { category } : {}
    
    const [products, total] = await Promise.all([
      db.collection('products')
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('products').countDocuments(query)
    ])
    
    return Response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return Response.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('shop')
    const body = await request.json()
    
    const product = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('products').insertOne(product)
    
    return Response.json({
      id: result.insertedId,
      ...product
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return Response.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// app/api/products/[id]/route.ts
interface ProductRouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: ProductRouteContext
) {
  try {
    const { id } = await context.params
    const client = await clientPromise
    const db = client.db('shop')
    
    const product = await db.collection('products').findOne({
      _id: new ObjectId(id)
    })
    
    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return Response.json(product)
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: ProductRouteContext
) {
  try {
    const { id } = await context.params
    const client = await clientPromise
    const db = client.db('shop')
    const body = await request.json()
    
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return Response.json(result)
  } catch (error) {
    console.error('Failed to update product:', error)
    return Response.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: ProductRouteContext
) {
  try {
    const { id } = await context.params
    const client = await clientPromise
    const db = client.db('shop')
    
    const result = await db.collection('products').deleteOne({
      _id: new ObjectId(id)
    })
    
    if (result.deletedCount === 0) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return Response.json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return Response.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
```

### 2.3 PostgreSQL 原生集成

```typescript
// lib/db.ts
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

// app/api/posts/route.ts
import { NextRequest } from 'next/server'
import { query } from '@/lib/db'

interface Post {
  id: number
  title: string
  content: string
  author_id: number
  created_at: Date
  updated_at: Date
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    const [posts, countResult] = await Promise.all([
      query<Post>(
        `SELECT p.*, u.name as author_name 
         FROM posts p 
         JOIN users u ON p.author_id = u.id 
         ORDER BY p.created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      query<{ count: string }>(
        'SELECT COUNT(*) FROM posts'
      )
    ])
    
    const total = parseInt(countResult[0].count)
    
    return Response.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return Response.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, authorId } = body
    
    if (!title || !content || !authorId) {
      return Response.json(
        { error: 'Title, content, and authorId are required' },
        { status: 400 }
      )
    }
    
    const posts = await query<Post>(
      `INSERT INTO posts (title, content, author_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [title, content, authorId]
    )
    
    return Response.json(posts[0], { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)
    return Response.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
```

---

## 三、身份验证与授权

### 3.1 JWT 身份验证

```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: number
  email: string
  role: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  const cookieToken = request.cookies.get('token')?.value
  if (cookieToken) {
    return cookieToken
  }
  
  return null
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  return verifyToken(token)
}

// app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // 生成 token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    })
    
    // 返回 token 和用户信息
    const response = Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
    
    // 设置 cookie
    response.headers.set(
      'Set-Cookie',
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    )
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// app/api/auth/register/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    
    // 验证输入
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }
    
    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existing) {
      return Response.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    })
    
    // 生成 token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'user'
    })
    
    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return Response.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

// app/api/auth/me/route.ts
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    if (!userDetails) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return Response.json(userDetails)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return Response.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// app/api/auth/logout/route.ts
export async function POST() {
  const response = Response.json({
    message: 'Logged out successfully'
  })
  
  // 清除 cookie
  response.headers.set(
    'Set-Cookie',
    'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  )
  
  return response
}
```

### 3.2 中间件模式

```typescript
// lib/middleware.ts
import { NextRequest } from 'next/server'
import { getUserFromRequest, JWTPayload } from './auth'

export type NextHandler = (
  request: NextRequest,
  context: any
) => Promise<Response>

export type Middleware = (
  request: NextRequest,
  context: any,
  next: NextHandler
) => Promise<Response>

export function withMiddleware(
  handler: NextHandler,
  ...middlewares: Middleware[]
): NextHandler {
  return async (request: NextRequest, context: any) => {
    let index = 0
    
    const next: NextHandler = async (req, ctx) => {
      if (index >= middlewares.length) {
        return handler(req, ctx)
      }
      
      const middleware = middlewares[index++]
      return middleware(req, ctx, next)
    }
    
    return next(request, context)
  }
}

// 认证中间件
export const requireAuth: Middleware = async (request, context, next) => {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // 将用户信息添加到 context
  context.user = user
  
  return next(request, context)
}

// 角色检查中间件
export function requireRole(...roles: string[]): Middleware {
  return async (request, context, next) => {
    const user = context.user as JWTPayload
    
    if (!user || !roles.includes(user.role)) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    return next(request, context)
  }
}

// 日志中间件
export const logger: Middleware = async (request, context, next) => {
  const start = Date.now()
  
  console.log(`[API] ${request.method} ${request.url}`)
  
  const response = await next(request, context)
  
  const duration = Date.now() - start
  console.log(`[API] ${request.method} ${request.url} - ${response.status} (${duration}ms)`)
  
  return response
}

// CORS 中间件
export const cors: Middleware = async (request, context, next) => {
  const response = await next(request, context)
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

// 使用示例
// app/api/protected/route.ts
import { withMiddleware, requireAuth, logger } from '@/lib/middleware'

async function handler(request: NextRequest, context: any) {
  const user = context.user
  
  return Response.json({
    message: 'Protected data',
    user
  })
}

export const GET = withMiddleware(handler, logger, requireAuth)

// app/api/admin/route.ts
import { withMiddleware, requireAuth, requireRole } from '@/lib/middleware'

async function adminHandler(request: NextRequest, context: any) {
  return Response.json({
    message: 'Admin only data'
  })
}

export const GET = withMiddleware(
  adminHandler,
  requireAuth,
  requireRole('admin')
)
```

### 3.3 Session 管理

```typescript
// lib/session.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface SessionData {
  userId: number
  email: string
  role: string
}

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return token
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as SessionData
  } catch (error) {
    return null
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// app/api/auth/session/route.ts
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  
  if (!session) {
    return Response.json(
      { error: 'No active session' },
      { status: 401 }
    )
  }
  
  return Response.json(session)
}
```

---

## 四、数据验证

### 4.1 Zod 验证

```typescript
// lib/validations.ts
import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  published: z.boolean().optional(),
  authorId: z.number().int().positive()
})

export const updateUserSchema = userSchema.partial().extend({
  id: z.number().int().positive()
})

export const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sort: z.enum(['asc', 'desc']).optional().default('desc')
})

// app/api/users/route.ts
import { NextRequest } from 'next/server'
import { userSchema, queryParamsSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 验证查询参数
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const params = queryParamsSchema.parse(searchParams)
    
    const { page, limit, sort } = params
    const skip = (page - 1) * limit
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: sort }
      }),
      prisma.user.count()
    ])
    
    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Failed to fetch users:', error)
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求体
    const validatedData = userSchema.parse(body)
    
    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existing) {
      return Response.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    // 创建用户
    const user = await prisma.user.create({
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    return Response.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    console.error('Failed to create user:', error)
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

### 4.2 自定义验证中间件

```typescript
// lib/validation-middleware.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Middleware } from './middleware'

export function validateBody<T extends z.ZodType>(schema: T): Middleware {
  return async (request, context, next) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      
      // 将验证后的数据添加到 context
      context.validatedBody = validatedData
      
      return next(request, context)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            error: 'Validation failed',
            details: error.errors
          },
          { status: 400 }
        )
      }
      
      return Response.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }
  }
}

export function validateQuery<T extends z.ZodType>(schema: T): Middleware {
  return async (request, context, next) => {
    try {
      const searchParams = Object.fromEntries(request.nextUrl.searchParams)
      const validatedParams = schema.parse(searchParams)
      
      context.validatedQuery = validatedParams
      
      return next(request, context)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            error: 'Invalid query parameters',
            details: error.errors
          },
          { status: 400 }
        )
      }
      
      return next(request, context)
    }
  }
}

// 使用示例
// app/api/posts/route.ts
import { withMiddleware } from '@/lib/middleware'
import { validateBody, validateQuery } from '@/lib/validation-middleware'
import { postSchema, queryParamsSchema } from '@/lib/validations'

async function getPosts(request: NextRequest, context: any) {
  const params = context.validatedQuery
  
  // 使用验证后的参数
  return Response.json({ params })
}

async function createPost(request: NextRequest, context: any) {
  const data = context.validatedBody
  
  // 使用验证后的数据
  return Response.json({ data }, { status: 201 })
}

export const GET = withMiddleware(
  getPosts,
  validateQuery(queryParamsSchema)
)

export const POST = withMiddleware(
  createPost,
  validateBody(postSchema)
)
```

---

## 五、错误处理

### 5.1 统一错误处理

```typescript
// lib/errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class BadRequestError extends APIError {
  constructor(message: string, code?: string) {
    super(400, message, code)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized', code?: string) {
    super(401, message, code)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden', code?: string) {
    super(403, message, code)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not found', code?: string) {
    super(404, message, code)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(message: string, code?: string) {
    super(409, message, code)
    this.name = 'ConflictError'
  }
}

export class InternalServerError extends APIError {
  constructor(message = 'Internal server error', code?: string) {
    super(500, message, code)
    this.name = 'InternalServerError'
  }
}

export function handleError(error: unknown): Response {
  console.error('API Error:', error)
  
  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        statusCode: error.statusCode
      },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof z.ZodError) {
    return Response.json(
      {
        error: 'Validation failed',
        details: error.errors
      },
      { status: 400 }
    )
  }
  
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// 错误处理中间件
export const errorHandler: Middleware = async (request, context, next) => {
  try {
    return await next(request, context)
  } catch (error) {
    return handleError(error)
  }
}

// 使用示例
// app/api/users/[id]/route.ts
import {
  NotFoundError,
  ConflictError,
  errorHandler
} from '@/lib/errors'
import { withMiddleware } from '@/lib/middleware'

async function getUser(request: NextRequest, context: any) {
  const { id } = await context.params
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return Response.json(user)
}

async function updateUser(request: NextRequest, context: any) {
  const { id } = await context.params
  const body = await request.json()
  
  // 检查邮箱是否已被使用
  if (body.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: body.email,
        id: { not: parseInt(id) }
      }
    })
    
    if (existing) {
      throw new ConflictError('Email already in use')
    }
  }
  
  const user = await prisma.user.update({
    where: { id: parseInt(id) },
    data: body
  })
  
  return Response.json(user)
}

export const GET = withMiddleware(getUser, errorHandler)
export const PUT = withMiddleware(updateUser, errorHandler)
```

### 5.2 错误日志

```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

export default logger

// 日志中间件
export const requestLogger: Middleware = async (request, context, next) => {
  const start = Date.now()
  const requestId = crypto.randomUUID()
  
  logger.info('Incoming request', {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent')
  })
  
  try {
    const response = await next(request, context)
    
    const duration = Date.now() - start
    
    logger.info('Request completed', {
      requestId,
      method: request.method,
      url: request.url,
      status: response.status,
      duration
    })
    
    return response
  } catch (error) {
    const duration = Date.now() - start
    
    logger.error('Request failed', {
      requestId,
      method: request.method,
      url: request.url,
      duration,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    })
    
    throw error
  }
}
```

---

## 六、文件上传

### 6.1 基础文件上传

```typescript
// app/api/upload/route.ts
import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }
    
    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json(
        { error: 'File too large' },
        { status: 400 }
      )
    }
    
    // 生成唯一文件名
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
    
    // 保存文件
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)
    
    await writeFile(filepath, buffer)
    
    // 返回文件 URL
    const fileUrl = `/uploads/${filename}`
    
    return Response.json({
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

### 6.2 多文件上传

```typescript
// app/api/upload/multiple/route.ts
import { NextRequest } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return Response.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }
    
    // 验证文件数量
    if (files.length > 10) {
      return Response.json(
        { error: 'Too many files (max 10)' },
        { status: 400 }
      )
    }
    
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    // 确保上传目录存在
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // 目录已存在
    }
    
    const uploadedFiles = []
    
    for (const file of files) {
      // 验证文件
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        continue
      }
      
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        continue
      }
      
      // 保存文件
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
      const filepath = join(uploadDir, filename)
      
      await writeFile(filepath, buffer)
      
      uploadedFiles.push({
        url: `/uploads/${filename}`,
        filename: file.name,
        size: file.size,
        type: file.type
      })
    }
    
    return Response.json({
      files: uploadedFiles,
      count: uploadedFiles.length
    }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
```

### 6.3 云存储集成 (AWS S3)

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function uploadToS3(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const timestamp = Date.now()
  const extension = file.name.split('.').pop()
  const key = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type
  })
  
  await s3Client.send(command)
  
  // 返回公共 URL
  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  return url
}

export async function getUploadUrl(
  filename: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const timestamp = Date.now()
  const extension = filename.split('.').pop()
  const key = `uploads/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType
  })
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  
  return { url, key }
}

// app/api/upload/s3/route.ts
import { NextRequest } from 'next/server'
import { uploadToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // 验证文件
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }
    
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json(
        { error: 'File too large' },
        { status: 400 }
      )
    }
    
    // 上传到 S3
    const url = await uploadToS3(file)
    
    return Response.json({
      url,
      filename: file.name,
      size: file.size,
      type: file.type
    }, { status: 201 })
  } catch (error) {
    console.error('S3 upload error:', error)
    return Response.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// app/api/upload/presigned/route.ts
import { getUploadUrl } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, contentType } = body
    
    if (!filename || !contentType) {
      return Response.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      )
    }
    
    const { url, key } = await getUploadUrl(filename, contentType)
    
    return Response.json({ url, key })
  } catch (error) {
    console.error('Presigned URL error:', error)
    return Response.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
```

---

## 七、速率限制与安全

### 7.1 速率限制

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  interval: number // 时间窗口(毫秒)
  uniqueTokenPerInterval: number // 最大请求数
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest): Promise<Response | null> => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const now = Date.now()
    const key = `${ip}`
    
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + options.interval
      }
      return null
    }
    
    store[key].count++
    
    if (store[key].count > options.uniqueTokenPerInterval) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000)
      
      return Response.json(
        {
          error: 'Too many requests',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      )
    }
    
    return null
  }
}

// 使用 Redis 的速率限制
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export async function redisRateLimit(
  identifier: string,
  limit: number,
  window: number
): Promise<boolean> {
  const key = `rate_limit:${identifier}`
  
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }
  
  return current <= limit
}

// 速率限制中间件
export function withRateLimit(options: RateLimitOptions): Middleware {
  const limiter = rateLimit(options)
  
  return async (request, context, next) => {
    const result = await limiter(request)
    
    if (result) {
      return result
    }
    
    return next(request, context)
  }
}

// 使用示例
// app/api/public/route.ts
import { withMiddleware } from '@/lib/middleware'
import { withRateLimit } from '@/lib/rate-limit'

async function handler(request: NextRequest) {
  return Response.json({ message: 'Success' })
}

export const GET = withMiddleware(
  handler,
  withRateLimit({
    interval: 60 * 1000, // 1分钟
    uniqueTokenPerInterval: 10 // 最多10个请求
  })
)
```

### 7.2 CORS 配置

```typescript
// lib/cors.ts
import { NextRequest } from 'next/server'

export interface CORSOptions {
  origin?: string | string[] | ((origin: string) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

export function configureCORS(options: CORSOptions = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = [],
    credentials = false,
    maxAge = 86400
  } = options
  
  return (request: NextRequest, response: Response): Response => {
    const requestOrigin = request.headers.get('origin') || ''
    
    let allowOrigin = '*'
    
    if (typeof origin === 'string') {
      allowOrigin = origin
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        allowOrigin = requestOrigin
      }
    } else if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        allowOrigin = requestOrigin
      }
    }
    
    response.headers.set('Access-Control-Allow-Origin', allowOrigin)
    response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
    
    if (exposedHeaders.length > 0) {
      response.headers.set('Access-Control-Expose-Headers', exposedHeaders.join(', '))
    }
    
    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    response.headers.set('Access-Control-Max-Age', maxAge.toString())
    
    return response
  }
}

// CORS 中间件
export function withCORS(options?: CORSOptions): Middleware {
  const cors = configureCORS(options)
  
  return async (request, context, next) => {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 204 })
      return cors(request, response)
    }
    
    const response = await next(request, context)
    return cors(request, response)
  }
}

// 使用示例
// app/api/public/route.ts
import { withMiddleware } from '@/lib/middleware'
import { withCORS } from '@/lib/cors'

async function handler(request: NextRequest) {
  return Response.json({ message: 'CORS enabled' })
}

export const GET = withMiddleware(
  handler,
  withCORS({
    origin: ['https://example.com', 'https://app.example.com'],
    credentials: true
  })
)

export const OPTIONS = withMiddleware(
  () => new Response(null, { status: 204 }),
  withCORS({
    origin: ['https://example.com', 'https://app.example.com'],
    credentials: true
  })
)
```

### 7.3 输入清理

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'
import xss from 'xss'

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}

export function sanitizeInput(input: string): string {
  return xss(input)
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}

// 清理中间件
export const sanitizeMiddleware: Middleware = async (request, context, next) => {
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    try {
      const body = await request.json()
      context.sanitizedBody = sanitizeObject(body)
    } catch (error) {
      // 无法解析 JSON,继续
    }
  }
  
  return next(request, context)
}
```

---

## 八、WebSocket 与实时通信

### 8.1 Server-Sent Events (SSE)

```typescript
// app/api/events/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      // 发送初始连接消息
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
      )
      
      // 每秒发送一次数据
      const interval = setInterval(() => {
        const data = {
          type: 'update',
          timestamp: new Date().toISOString(),
          value: Math.random()
        }
        
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )
      }, 1000)
      
      // 清理
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

// 客户端使用
// components/EventStream.tsx
'use client'

import { useEffect, useState } from 'react'

export function EventStream() {
  const [events, setEvents] = useState<any[]>([])
  const [status, setStatus] = useState('disconnected')
  
  useEffect(() => {
    const eventSource = new EventSource('/api/events')
    
    eventSource.onopen = () => {
      setStatus('connected')
    }
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setEvents(prev => [...prev, data].slice(-10)) // 保留最后10条
    }
    
    eventSource.onerror = () => {
      setStatus('error')
      eventSource.close()
    }
    
    return () => {
      eventSource.close()
    }
  }, [])
  
  return (
    <div className="p-4">
      <div className="mb-4">
        Status: <span className={`font-bold ${
          status === 'connected' ? 'text-green-600' : 'text-red-600'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={i} className="p-2 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">{event.timestamp}</div>
            <div>{JSON.stringify(event)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 8.2 流式响应

```typescript
// app/api/stream/route.ts
export async function GET() {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const chunk = `Chunk ${i + 1}\n`
          controller.enqueue(encoder.encode(chunk))
        }
        
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    }
  })
}

// AI 流式响应示例
// app/api/ai/chat/route.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true
    })
    
    const encoder = new TextEncoder()
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json(
      { error: 'Chat failed' },
      { status: 500 }
    )
  }
}
```

---

## 九、缓存策略

### 9.1 响应缓存

```typescript
// app/api/data/route.ts
export async function GET() {
  const data = {
    timestamp: new Date().toISOString(),
    value: Math.random()
  }
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}

// 不缓存
export async function POST() {
  return Response.json(
    { message: 'Created' },
    {
      status: 201,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}
```

### 9.2 Redis 缓存

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // 尝试从缓存获取
  const cached = await redis.get<T>(key)
  
  if (cached !== null) {
    return cached
  }
  
  // 获取新数据
  const data = await fetcher()
  
  // 存入缓存
  await redis.setex(key, ttl, JSON.stringify(data))
  
  return data
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// app/api/posts/route.ts
import { getCached, invalidateCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') || '1'
  
  const cacheKey = `posts:page:${page}`
  
  const data = await getCached(
    cacheKey,
    async () => {
      return await prisma.post.findMany({
        take: 10,
        skip: (parseInt(page) - 1) * 10
      })
    },
    300 // 5分钟
  )
  
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const post = await prisma.post.create({
    data: body
  })
  
  // 清除相关缓存
  await invalidateCache('posts:*')
  
  return Response.json(post, { status: 201 })
}
```

---

## 十、总结与最佳实践

### 10.1 API 设计原则

```typescript
// 1. RESTful 设计
// GET    /api/users      - 获取用户列表
// GET    /api/users/:id  - 获取单个用户
// POST   /api/users      - 创建用户
// PUT    /api/users/:id  - 更新用户
// DELETE /api/users/:id  - 删除用户

// 2. 一致的响应格式
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 3. 适当的状态码
// 200 - 成功
// 201 - 创建成功
// 400 - 请求错误
// 401 - 未认证
// 403 - 无权限
// 404 - 未找到
// 409 - 冲突
// 500 - 服务器错误

// 4. 版本控制
// /api/v1/users
// /api/v2/users
```

### 10.2 安全检查清单

```typescript
// 1. 输入验证
// - 使用 Zod 等库验证所有输入
// - 清理 HTML 输入
// - 限制文件上传大小和类型

// 2. 身份验证
// - 使用强密码哈希 (bcrypt)
// - 实现 JWT 或 Session
// - 设置 HttpOnly cookies

// 3. 授权
// - 检查用户权限
// - 实现基于角色的访问控制
// - 验证资源所有权

// 4. 速率限制
// - 实现请求速率限制
// - 防止暴力攻击
// - 保护敏感端点

// 5. CORS
// - 正确配置 CORS
// - 限制允许的源
// - 处理预检请求

// 6. 错误处理
// - 不暴露敏感信息
// - 记录错误日志
// - 返回友好的错误消息
```

### 10.3 性能优化

```typescript
// 1. 缓存策略
// - 使用 Redis 缓存热点数据
// - 设置适当的 Cache-Control 头
// - 实现缓存失效策略

// 2. 数据库优化
// - 使用索引
// - 实现分页
// - 避免 N+1 查询
// - 使用连接池

// 3. 并行处理
// - 使用 Promise.all 并行获取数据
// - 避免不必要的顺序执行

// 4. 响应压缩
// - 启用 gzip/brotli 压缩
// - 优化响应体大小
```

### 10.4 学习资源

1. 官方文档
   - Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
   - API Routes: https://nextjs.org/docs/api-routes/introduction

2. 相关库
   - Prisma: https://www.prisma.io
   - Zod: https://zod.dev
   - JWT: https://jwt.io

3. 实践项目
   - RESTful API
   - GraphQL API
   - 文件上传服务
   - 实时聊天 API

---

## 课后练习

1. 创建一个完整的用户认证系统
2. 实现一个支持文件上传的博客 API
3. 构建一个带速率限制的公开 API
4. 开发一个实时通知系统
5. 实现一个缓存层优化性能

通过本课程的学习,你应该能够熟练开发 Next.js API Routes,处理各种后端逻辑,并掌握安全和性能最佳实践。记住:优秀的 API 设计是构建可维护应用的关键!

