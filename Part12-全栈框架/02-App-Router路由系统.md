# App Router路由系统

## 概述

Next.js 13引入了全新的App Router,基于React Server Components构建,提供了更强大的路由功能和更好的性能。App Router使用`app`目录替代传统的`pages`目录,支持布局、嵌套路由、加载状态、错误处理等高级特性。本文将全面介绍App Router的核心概念和使用方法。

## App Router vs Pages Router

### 核心区别

```typescript
// Pages Router (旧)
// pages/index.tsx
export default function Home() {
  return <h1>Home</h1>;
}

// pages/blog/[slug].tsx
export default function BlogPost({ params }) {
  return <h1>Post: {params.slug}</h1>;
}

// App Router (新)
// app/page.tsx
export default function Home() {
  return <h1>Home</h1>;
}

// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>;
}
```

### 特性对比

| 特性 | Pages Router | App Router |
|------|--------------|------------|
| 服务端组件 | ❌ | ✅ |
| 流式渲染 | ❌ | ✅ |
| 布局系统 | 有限 | 强大 |
| 加载状态 | 手动 | 内置 |
| 错误处理 | 手动 | 内置 |
| 数据获取 | getServerSideProps | async/await |
| 嵌套路由 | 复杂 | 简单 |

## 文件系统路由

### 路由文件命名约定

```
app/
├── page.tsx           # 路由页面
├── layout.tsx         # 布局
├── loading.tsx        # 加载状态
├── error.tsx          # 错误处理
├── not-found.tsx      # 404页面
├── route.ts           # API路由
└── template.tsx       # 模板
```

### 基本路由

```typescript
// app/page.tsx
// URL: /
export default function HomePage() {
  return <h1>Home Page</h1>;
}

// app/about/page.tsx
// URL: /about
export default function AboutPage() {
  return <h1>About Page</h1>;
}

// app/blog/page.tsx
// URL: /blog
export default function BlogPage() {
  return <h1>Blog Page</h1>;
}

// app/blog/first-post/page.tsx
// URL: /blog/first-post
export default function FirstPostPage() {
  return <h1>First Post</h1>;
}
```

### 嵌套路由

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>Dashboard Navigation</nav>
      {children}
    </div>
  );
}

// app/dashboard/page.tsx
// URL: /dashboard
export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}

// app/dashboard/settings/page.tsx
// URL: /dashboard/settings
export default function SettingsPage() {
  return <h1>Settings</h1>;
}

// app/dashboard/users/page.tsx
// URL: /dashboard/users
export default function UsersPage() {
  return <h1>Users</h1>;
}
```

## 动态路由

### 单个动态段

```typescript
// app/blog/[slug]/page.tsx
// URL: /blog/hello-world
// URL: /blog/nextjs-tutorial
export default function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  return <h1>Post: {params.slug}</h1>;
}

// app/products/[id]/page.tsx
// URL: /products/1
// URL: /products/2
export default function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  return <h1>Product: {params.id}</h1>;
}
```

### 多个动态段

```typescript
// app/shop/[category]/[product]/page.tsx
// URL: /shop/clothes/t-shirt
// URL: /shop/electronics/laptop
export default function ProductPage({
  params,
}: {
  params: { category: string; product: string };
}) {
  return (
    <div>
      <h1>Category: {params.category}</h1>
      <h2>Product: {params.product}</h2>
    </div>
  );
}

// app/blog/[year]/[month]/[day]/[slug]/page.tsx
// URL: /blog/2024/01/15/my-post
export default function BlogPost({
  params,
}: {
  params: {
    year: string;
    month: string;
    day: string;
    slug: string;
  };
}) {
  return (
    <div>
      <h1>Post: {params.slug}</h1>
      <p>Date: {params.year}/{params.month}/{params.day}</p>
    </div>
  );
}
```

### Catch-all路由

```typescript
// app/docs/[...slug]/page.tsx
// URL: /docs/a
// URL: /docs/a/b
// URL: /docs/a/b/c
export default function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  return (
    <div>
      <h1>Documentation</h1>
      <p>Path: /{params.slug.join('/')}</p>
    </div>
  );
}

// 使用示例
// /docs/getting-started → params.slug = ['getting-started']
// /docs/api/reference → params.slug = ['api', 'reference']
```

### 可选Catch-all路由

```typescript
// app/shop/[[...slug]]/page.tsx
// URL: /shop
// URL: /shop/clothes
// URL: /shop/clothes/t-shirt
export default function ShopPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  if (!params.slug) {
    return <h1>Shop Home</h1>;
  }

  return (
    <div>
      <h1>Category: {params.slug.join(' > ')}</h1>
    </div>
  );
}
```

## 路由组

### 组织路由结构

```typescript
// 使用括号创建路由组(不影响URL)
app/
├── (marketing)/
│   ├── page.tsx           # URL: /
│   ├── about/page.tsx     # URL: /about
│   └── contact/page.tsx   # URL: /contact
├── (shop)/
│   ├── products/page.tsx  # URL: /products
│   └── cart/page.tsx      # URL: /cart
└── (dashboard)/
    ├── layout.tsx
    ├── page.tsx           # URL: /dashboard
    └── settings/page.tsx  # URL: /dashboard/settings
```

### 多个根布局

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <header>Marketing Header</header>
        {children}
      </body>
    </html>
  );
}

// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <nav>Dashboard Nav</nav>
        {children}
      </body>
    </html>
  );
}
```

## 并行路由

### 使用@符号定义插槽

```typescript
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <>
      {children}
      {team}
      {analytics}
    </>
  );
}

// app/@team/page.tsx
export default function TeamSlot() {
  return <div>Team Section</div>;
}

// app/@analytics/page.tsx
export default function AnalyticsSlot() {
  return <div>Analytics Section</div>;
}

// app/page.tsx
export default function HomePage() {
  return <div>Main Content</div>;
}
```

### 条件渲染

```typescript
// app/layout.tsx
export default function Layout({
  children,
  team,
  analytics,
  isAuthenticated,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
  isAuthenticated: boolean;
}) {
  return (
    <>
      {children}
      {isAuthenticated ? team : null}
      {isAuthenticated ? analytics : null}
    </>
  );
}
```

## 拦截路由

### 模态框路由

```typescript
// app/photos/page.tsx
export default function PhotosPage() {
  return (
    <div>
      <h1>Photos</h1>
      {/* 照片列表 */}
    </div>
  );
}

// app/photos/[id]/page.tsx
export default function PhotoPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Photo Detail</h1>
      {/* 照片详情 */}
    </div>
  );
}

// app/photos/(.)([id])/page.tsx
// 在/photos页面上以模态框形式打开
export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <div className="modal">
      <h1>Photo Modal</h1>
      {/* 模态框中的照片详情 */}
    </div>
  );
}
```

### 拦截路径约定

```
(.) 匹配同级
(..) 匹配上一级
(..)(..) 匹配上两级
(...) 匹配根目录
```

```typescript
// 示例结构
app/
├── feed/
│   ├── page.tsx
│   └── (..)photo/
│       └── [id]/
│           └── page.tsx  # 拦截 /photo/[id]
└── photo/
    └── [id]/
        └── page.tsx      # 实际页面
```

## 布局系统

### 根布局

```typescript
// app/layout.tsx (必需)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header>Global Header</header>
        <main>{children}</main>
        <footer>Global Footer</footer>
      </body>
    </html>
  );
}
```

### 嵌套布局

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/settings/layout.tsx
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="settings">
      <nav>Settings Navigation</nav>
      <div>{children}</div>
    </div>
  );
}

// app/dashboard/settings/profile/page.tsx
// 继承了3层布局: root → dashboard → settings
export default function ProfilePage() {
  return <h1>Profile Settings</h1>;
}
```

### 布局持久化

```typescript
// 布局在导航时不会重新渲染
// app/dashboard/layout.tsx
'use client';

import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);
  
  // count状态在页面切换时保持
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      {children}
    </div>
  );
}
```

## 模板

### Template vs Layout

```typescript
// app/template.tsx
// 每次导航都会创建新实例
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="template">{children}</div>;
}

// app/layout.tsx
// 导航时保持状态
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="layout">{children}</div>;
}
```

### 使用场景

```typescript
// app/dashboard/template.tsx
'use client';

import { useEffect } from 'react';

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  // 每次导航时执行
  useEffect(() => {
    console.log('Dashboard page changed');
  }, []);

  return <div className="dashboard-template">{children}</div>;
}
```

## 加载状态

### loading.tsx

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>;
}

// app/dashboard/users/loading.tsx
export default function UsersLoading() {
  return (
    <div>
      <h1>Users</h1>
      <p>Loading users...</p>
    </div>
  );
}
```

### 使用Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

async function UserList() {
  const users = await fetchUsers();
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserList />
      </Suspense>
    </div>
  );
}
```

## 错误处理

### error.tsx

```typescript
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 全局错误处理

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Global Error</h2>
        <p>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

### 嵌套错误边界

```typescript
// app/dashboard/error.tsx
'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <div>Dashboard Error: {error.message}</div>;
}

// app/dashboard/settings/error.tsx
'use client';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <div>Settings Error: {error.message}</div>;
}
```

## 404处理

### not-found.tsx

```typescript
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}

// app/dashboard/not-found.tsx
export default function DashboardNotFound() {
  return (
    <div>
      <h2>Dashboard Page Not Found</h2>
      <Link href="/dashboard">Back to Dashboard</Link>
    </div>
  );
}
```

### 触发404

```typescript
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';

async function getPost(slug: string) {
  const post = await fetchPost(slug);
  if (!post) {
    notFound();
  }
  return post;
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  return <h1>{post.title}</h1>;
}
```

## 导航

### Link组件

```typescript
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav>
      {/* 基本链接 */}
      <Link href="/">Home</Link>
      
      {/* 动态路由 */}
      <Link href={`/blog/${post.slug}`}>Read Post</Link>
      
      {/* 查询参数 */}
      <Link href={{ pathname: '/search', query: { q: 'nextjs' } }}>
        Search
      </Link>
      
      {/* 替换历史记录 */}
      <Link href="/dashboard" replace>
        Dashboard
      </Link>
      
      {/* 滚动到顶部 */}
      <Link href="/about" scroll={false}>
        About
      </Link>
      
      {/* 预取 */}
      <Link href="/products" prefetch={true}>
        Products
      </Link>
    </nav>
  );
}
```

### useRouter Hook

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function ClientComponent() {
  const router = useRouter();

  return (
    <div>
      {/* 编程式导航 */}
      <button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </button>
      
      {/* 替换历史记录 */}
      <button onClick={() => router.replace('/login')}>
        Login
      </button>
      
      {/* 返回 */}
      <button onClick={() => router.back()}>
        Back
      </button>
      
      {/* 前进 */}
      <button onClick={() => router.forward()}>
        Forward
      </button>
      
      {/* 刷新 */}
      <button onClick={() => router.refresh()}>
        Refresh
      </button>
      
      {/* 预取 */}
      <button onClick={() => router.prefetch('/products')}>
        Prefetch Products
      </button>
    </div>
  );
}
```

### usePathname和useSearchParams

```typescript
'use client';

import { usePathname, useSearchParams } from 'next/navigation';

export default function ClientComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get('q');
  const page = searchParams.get('page');

  return (
    <div>
      <p>Current path: {pathname}</p>
      <p>Query: {query}</p>
      <p>Page: {page}</p>
    </div>
  );
}
```

## 路由处理器

### Route Handlers

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  const users = await fetchUsers(query);
  
  return NextResponse.json({ users });
}

// POST
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const user = await createUser(body);
  
  return NextResponse.json({ user }, { status: 201 });
}

// PUT
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const user = await updateUser(body);
  return NextResponse.json({ user });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  await deleteUser(id);
  
  return new NextResponse(null, { status: 204 });
}

// PATCH
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const user = await patchUser(body);
  return NextResponse.json({ user });
}
```

### 动态路由处理器

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await fetchUser(params.id);
  
  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }
  
  return NextResponse.json({ user });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteUser(params.id);
  return new NextResponse(null, { status: 204 });
}
```

## 路由元数据

### 静态元数据

```typescript
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'Welcome to my website',
};

export default function HomePage() {
  return <h1>Home</h1>;
}

// app/blog/[slug]/page.tsx
export const metadata: Metadata = {
  title: 'Blog Post',
  description: 'Read our latest blog post',
};
```

### 动态元数据

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await fetchPost(params.slug);
  return <h1>{post.title}</h1>;
}
```

## 路由优先级

### 匹配顺序

```
1. 静态路由: /blog/hello
2. 动态路由: /blog/[slug]
3. Catch-all路由: /blog/[...slug]
4. 可选Catch-all路由: /blog/[[...slug]]
```

```typescript
// 优先级示例
app/
├── blog/
│   ├── hello/page.tsx        # 优先级1: /blog/hello
│   ├── [slug]/page.tsx       # 优先级2: /blog/:slug
│   └── [...slug]/page.tsx    # 优先级3: /blog/*

// 访问 /blog/hello → 匹配 hello/page.tsx
// 访问 /blog/world → 匹配 [slug]/page.tsx
// 访问 /blog/a/b/c → 匹配 [...slug]/page.tsx
```

## 最佳实践

### 路由组织

```typescript
// ✅ 好 - 清晰的结构
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   └── contact/
├── (app)/
│   ├── layout.tsx
│   ├── dashboard/
│   └── settings/
└── api/
    ├── users/
    └── posts/

// ❌ 不好 - 混乱的结构
app/
├── page1.tsx
├── page2.tsx
├── random/
└── stuff/
```

### 错误处理

```typescript
// ✅ 好 - 分层错误处理
app/
├── error.tsx              # 全局错误
├── dashboard/
│   ├── error.tsx         # Dashboard错误
│   └── settings/
│       └── error.tsx     # Settings错误

// ❌ 不好 - 只有全局错误
app/
└── error.tsx
```

### 加载状态

```typescript
// ✅ 好 - 细粒度加载状态
app/
├── loading.tsx
├── dashboard/
│   ├── loading.tsx
│   └── users/
│       └── loading.tsx

// ❌ 不好 - 只有全局加载
app/
└── loading.tsx
```

App Router提供了强大而灵活的路由系统,合理使用这些特性可以构建出性能优异、用户体验良好的应用。

