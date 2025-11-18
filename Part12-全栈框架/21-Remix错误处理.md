# Remix 错误处理

## 课程概述

本课程深入讲解Remix的错误处理机制。Remix提供了强大的ErrorBoundary系统,能够优雅地处理各种错误情况,提供良好的用户体验。

学习目标:
- 掌握ErrorBoundary基础
- 理解错误类型
- 学习路由级错误处理
- 掌握全局错误处理
- 理解404处理
- 学习错误日志
- 掌握错误恢复
- 构建健壮的应用

---

## 一、ErrorBoundary基础

### 1.1 什么是ErrorBoundary

```typescript
// ErrorBoundary 捕获路由中的错误
// - 组件渲染错误
// - Loader 错误
// - Action 错误

// app/routes/posts.$id.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { id: params.id }
  })
  
  if (!post) {
    throw new Response("Post not found", { status: 404 })
  }
  
  return json({ post })
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}

// ErrorBoundary 处理错误
export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    )
  }
  
  if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    )
  }
  
  return <h1>Unknown Error</h1>
}
```

### 1.2 抛出Response错误

```typescript
// app/routes/users.$userId.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await db.user.findUnique({
    where: { id: params.userId }
  })
  
  if (!user) {
    // 抛出 404 错误
    throw new Response("User not found", { status: 404 })
  }
  
  // 检查权限
  const hasAccess = await checkAccess(user.id)
  if (!hasAccess) {
    // 抛出 403 错误
    throw new Response("Access denied", { status: 403 })
  }
  
  return json({ user })
}

export default function User() {
  const { user } = useLoaderData<typeof loader>()
  return <div>{user.name}</div>
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        return (
          <div>
            <h1>404 - User Not Found</h1>
            <p>The user you're looking for doesn't exist.</p>
            <a href="/users">View all users</a>
          </div>
        )
      
      case 403:
        return (
          <div>
            <h1>403 - Access Denied</h1>
            <p>You don't have permission to view this user.</p>
            <a href="/">Go home</a>
          </div>
        )
      
      default:
        return (
          <div>
            <h1>Error {error.status}</h1>
            <p>{error.statusText}</p>
          </div>
        )
    }
  }
  
  return <div>Unknown error</div>
}
```

### 1.3 抛出带数据的错误

```typescript
// app/routes/posts.$id.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"

interface NotFoundError {
  message: string
  postId: string
  suggestions: Array<{ id: string; title: string }>
}

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { id: params.id }
  })
  
  if (!post) {
    // 获取相关文章建议
    const suggestions = await db.post.findMany({
      take: 3,
      orderBy: { views: 'desc' }
    })
    
    throw json<NotFoundError>(
      {
        message: "Post not found",
        postId: params.id,
        suggestions
      },
      { status: 404 }
    )
  }
  
  return json({ post })
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      const data = error.data as NotFoundError
      
      return (
        <div>
          <h1>Post Not Found</h1>
          <p>{data.message}</p>
          <p>Post ID: {data.postId}</p>
          
          {data.suggestions.length > 0 && (
            <div>
              <h2>You might like these posts:</h2>
              <ul>
                {data.suggestions.map(post => (
                  <li key={post.id}>
                    <a href={`/posts/${post.id}`}>{post.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }
  }
  
  return <div>Error occurred</div>
}
```

---

## 二、不同类型的错误

### 2.1 Loader错误

```typescript
// app/routes/dashboard.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const session = await getSession(request.headers.get("Cookie"))
    const userId = session.get("userId")
    
    if (!userId) {
      throw new Response("Unauthorized", { status: 401 })
    }
    
    const [user, stats] = await Promise.all([
      getUser(userId),
      getStats(userId)
    ])
    
    return json({ user, stats })
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    
    console.error("Dashboard loader error:", error)
    throw new Response("Internal server error", { status: 500 })
  }
}

export default function Dashboard() {
  const { user, stats } = useLoaderData<typeof loader>()
  return <div>Dashboard content</div>
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return (
        <div>
          <h1>Please Log In</h1>
          <p>You need to be logged in to view this page.</p>
          <a href="/login">Log In</a>
        </div>
      )
    }
    
    if (error.status === 500) {
      return (
        <div>
          <h1>Server Error</h1>
          <p>Something went wrong. Please try again later.</p>
        </div>
      )
    }
  }
  
  return <div>An error occurred</div>
}
```

### 2.2 Action错误

```typescript
// app/routes/posts.new.tsx
import { json, redirect, ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    
    // 验证
    if (!title || !content) {
      return json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }
    
    // 创建文章
    const post = await db.post.create({
      data: { title, content }
    })
    
    return redirect(`/posts/${post.id}`)
  } catch (error) {
    console.error("Create post error:", error)
    
    if (error instanceof Error) {
      return json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}

export default function NewPost() {
  const actionData = useActionData<typeof action>()
  
  return (
    <Form method="post">
      <h1>Create Post</h1>
      
      {actionData?.error && (
        <div className="error">{actionData.error}</div>
      )}
      
      <div>
        <label>Title:</label>
        <input type="text" name="title" required />
      </div>
      
      <div>
        <label>Content:</label>
        <textarea name="content" required />
      </div>
      
      <button type="submit">Create</button>
    </Form>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  return (
    <div>
      <h1>Failed to Create Post</h1>
      <p>An unexpected error occurred. Please try again.</p>
      <a href="/posts">Back to posts</a>
    </div>
  )
}
```

### 2.3 组件错误

```typescript
// app/routes/complex-page.tsx
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const data = await getData()
  return json({ data })
}

export default function ComplexPage() {
  const { data } = useLoaderData<typeof loader>()
  
  // 组件渲染可能抛出错误
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error("Invalid data format")
  }
  
  return (
    <div>
      {data.items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (error instanceof Error) {
    return (
      <div>
        <h1>Component Error</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    )
  }
  
  return <div>Unknown component error</div>
}
```

---

## 三、全局错误处理

### 3.1 Root ErrorBoundary

```typescript
// app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react"

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

// 全局 ErrorBoundary
export function ErrorBoundary() {
  const error = useRouteError()
  
  let heading = "Unexpected Error"
  let message = "Something went wrong."
  
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        heading = "404 - Page Not Found"
        message = "The page you're looking for doesn't exist."
        break
      case 403:
        heading = "403 - Forbidden"
        message = "You don't have permission to access this resource."
        break
      case 500:
        heading = "500 - Server Error"
        message = "Internal server error. Please try again later."
        break
      default:
        heading = `${error.status} ${error.statusText}`
        message = error.data || "An error occurred."
    }
  } else if (error instanceof Error) {
    heading = "Application Error"
    message = error.message
  }
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - {heading}</title>
        <Meta />
        <Links />
        <style>{`
          body {
            font-family: system-ui, sans-serif;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { color: #dc2626; }
          .error-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
          }
          pre {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
          }
          a {
            color: #2563eb;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        `}</style>
      </head>
      <body>
        <div className="error-box">
          <h1>{heading}</h1>
          <p>{message}</p>
          
          {error instanceof Error && error.stack && (
            <details>
              <summary>Stack Trace</summary>
              <pre>{error.stack}</pre>
            </details>
          )}
          
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/">Go Home</a>
            {' | '}
            <a href="javascript:history.back()">Go Back</a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
```

### 3.2 布局级ErrorBoundary

```typescript
// app/routes/dashboard.tsx
import { Outlet, useRouteError, isRouteErrorResponse } from "@remix-run/react"

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <nav>{/* 导航 */}</nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

// 布局级 ErrorBoundary
export function ErrorBoundary() {
  const error = useRouteError()
  
  return (
    <div className="dashboard-layout">
      <nav>{/* 导航仍然显示 */}</nav>
      <main>
        <div className="error-container">
          <h1>Dashboard Error</h1>
          {isRouteErrorResponse(error) ? (
            <p>{error.status}: {error.statusText}</p>
          ) : (
            <p>An error occurred in the dashboard.</p>
          )}
          <a href="/dashboard">Try Again</a>
        </div>
      </main>
    </div>
  )
}
```

---

## 四、404处理

### 4.1 动态404

```typescript
// app/routes/blog.$slug.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { slug: params.slug }
  })
  
  if (!post) {
    // 获取推荐文章
    const relatedPosts = await db.post.findMany({
      take: 5,
      orderBy: { views: 'desc' }
    })
    
    throw json(
      { 
        message: "Post not found",
        relatedPosts
      },
      { status: 404 }
    )
  }
  
  return json({ post })
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>()
  return <article>{post.title}</article>
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error) && error.status === 404) {
    const { relatedPosts } = error.data
    
    return (
      <div>
        <h1>Post Not Found</h1>
        <p>The post you're looking for doesn't exist.</p>
        
        {relatedPosts && relatedPosts.length > 0 && (
          <div>
            <h2>You might like these posts:</h2>
            <ul>
              {relatedPosts.map(post => (
                <li key={post.id}>
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Link to="/blog">Back to Blog</Link>
      </div>
    )
  }
  
  return <div>Error occurred</div>
}
```

### 4.2 通用404页面

```typescript
// app/routes/$.tsx
// 捕获所有未匹配的路由
import { Link } from "@remix-run/react"

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      
      <div className="links">
        <Link to="/">Go Home</Link>
        <Link to="/blog">View Blog</Link>
        <Link to="/contact">Contact Us</Link>
      </div>
    </div>
  )
}
```

---

## 五、错误日志

### 5.1 基础日志

```typescript
// lib/logger.ts
export function logError(error: unknown, context?: Record<string, any>) {
  console.error('Error occurred:', {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error,
    context,
    timestamp: new Date().toISOString()
  })
}

// app/routes/posts.new.tsx
import { logError } from "~/lib/logger"

export async function action({ request }: ActionFunctionArgs) {
  try {
    // ... 创建文章
  } catch (error) {
    logError(error, {
      action: 'create-post',
      url: request.url
    })
    
    throw new Response("Failed to create post", { status: 500 })
  }
}
```

### 5.2 集成Sentry

```bash
npm install @sentry/remix
```

```typescript
// entry.server.tsx
import * as Sentry from "@sentry/remix"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// entry.client.tsx
import * as Sentry from "@sentry/remix"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
})

// app/root.tsx
import { captureRemixErrorBoundaryError } from "@sentry/remix"

export function ErrorBoundary() {
  const error = useRouteError()
  
  // 发送错误到 Sentry
  captureRemixErrorBoundaryError(error)
  
  return (
    <div>
      <h1>Error</h1>
      <p>An error occurred. We've been notified.</p>
    </div>
  )
}
```

---

## 六、错误恢复

### 6.1 重试机制

```typescript
// app/routes/data.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useRevalidator } from "@remix-run/react"

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const data = await fetchDataWithRetry()
    return json({ data })
  } catch (error) {
    throw new Response("Failed to fetch data", { status: 500 })
  }
}

async function fetchDataWithRetry(retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.example.com/data')
      if (!response.ok) throw new Error('Request failed')
      return response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

export default function Data() {
  const { data } = useLoaderData<typeof loader>()
  return <div>{JSON.stringify(data)}</div>
}

export function ErrorBoundary() {
  const revalidator = useRevalidator()
  
  return (
    <div>
      <h1>Failed to Load Data</h1>
      <p>There was an error loading the data.</p>
      
      <button
        onClick={() => revalidator.revalidate()}
        disabled={revalidator.state !== "idle"}
      >
        {revalidator.state === "idle" ? "Try Again" : "Loading..."}
      </button>
    </div>
  )
}
```

### 6.2 Fallback UI

```typescript
// app/routes/dashboard.tsx
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  try {
    const data = await fetchData()
    return json({ data, error: null })
  } catch (error) {
    // 返回 fallback 数据而不是抛出错误
    return json({
      data: null,
      error: 'Failed to load data'
    })
  }
}

export default function Dashboard() {
  const { data, error } = useLoaderData<typeof loader>()
  
  if (error) {
    return (
      <div className="fallback">
        <p>Unable to load dashboard data.</p>
        <p>Some features may not be available.</p>
      </div>
    )
  }
  
  return <div>{/* 正常渲染 */}</div>
}
```

---

## 七、实战案例

### 7.1 完整的错误处理系统

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}

// app/routes/posts.$id.tsx
import { NotFoundError, UnauthorizedError } from "~/lib/errors"

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await getUserId(request)
  
  const post = await db.post.findUnique({
    where: { id: params.id }
  })
  
  if (!post) {
    throw new NotFoundError('Post')
  }
  
  if (post.private && post.authorId !== userId) {
    throw new UnauthorizedError('You cannot view this post')
  }
  
  return json({ post })
}

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (error instanceof NotFoundError) {
    return (
      <div>
        <h1>Post Not Found</h1>
        <p>{error.message}</p>
        <Link to="/posts">View all posts</Link>
      </div>
    )
  }
  
  if (error instanceof UnauthorizedError) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>{error.message}</p>
        <Link to="/login">Log In</Link>
      </div>
    )
  }
  
  return <div>An error occurred</div>
}
```

---

## 八、最佳实践

### 8.1 错误处理清单

```typescript
// ✓ 使用 ErrorBoundary
// ✓ 抛出适当的 HTTP 状态码
// ✓ 提供有用的错误信息
// ✓ 记录错误日志
// ✓ 提供恢复选项
// ✓ 显示友好的错误页面
// ✓ 保护敏感信息
// ✓ 测试错误场景
```

### 8.2 学习资源

1. 官方文档
   - Error Handling: https://remix.run/docs/en/main/route/error-boundary
   - Throwing Responses: https://remix.run/docs/en/main/utils/responses

2. 工具
   - Sentry
   - LogRocket
   - Datadog

---

## 课后练习

1. 实现路由级错误处理
2. 创建全局ErrorBoundary
3. 集成错误监控服务
4. 实现错误恢复机制
5. 构建完整的错误处理系统

通过本课程的学习,你应该能够构建健壮的Remix应用,优雅地处理各种错误情况!

