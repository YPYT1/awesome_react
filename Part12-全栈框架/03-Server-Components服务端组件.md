# Server Components服务端组件

## 概述

React Server Components(RSC)是React 18引入的新特性,Next.js 13+ App Router完全支持。服务端组件在服务器上渲染,不会发送JavaScript到客户端,可以直接访问后端资源,大大提升了性能和安全性。本文将全面介绍服务端组件的概念、使用方法和最佳实践。

## 服务端组件 vs 客户端组件

### 核心区别

```typescript
// 服务端组件(默认)
// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function ServerComponent() {
  const data = await getData();
  return <div>{data.title}</div>;
}

// 客户端组件(需要声明)
// app/client-component.tsx
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### 特性对比表

| 特性 | 服务端组件 | 客户端组件 |
|------|-----------|-----------|
| 数据获取 | ✅ 服务器 | ✅ 客户端 |
| 后端资源访问 | ✅ 直接访问 | ❌ 通过API |
| Hooks | ❌ 不支持 | ✅ 支持 |
| 事件处理器 | ❌ 不支持 | ✅ 支持 |
| 浏览器API | ❌ 不支持 | ✅ 支持 |
| JavaScript大小 | 0 KB | 正常大小 |
| SEO | ✅ 优秀 | ⚠️ 需SSR |
| 初始加载速度 | ✅ 快 | ⚠️ 较慢 |

## 服务端组件的优势

### 1. 零客户端JavaScript

```typescript
// app/products/page.tsx
// 此组件的代码不会发送到客户端
async function getProducts() {
  const products = await db.product.findMany();
  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Bundle大小: 0 KB (仅HTML)
```

### 2. 直接访问后端资源

```typescript
// app/dashboard/page.tsx
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

export default async function DashboardPage() {
  // 直接访问数据库
  const users = await db.user.findMany();
  
  // 访问环境变量(不会暴露给客户端)
  const apiKey = process.env.API_KEY;
  
  // 获取session
  const session = await getServerSession();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>User count: {users.length}</p>
    </div>
  );
}
```

### 3. 自动代码分割

```typescript
// app/page.tsx
import HeavyComponent from '@/components/HeavyComponent';
import AnotherHeavyComponent from '@/components/AnotherHeavyComponent';

// 两个组件都不会包含在客户端bundle中
export default function HomePage() {
  return (
    <div>
      <HeavyComponent />
      <AnotherHeavyComponent />
    </div>
  );
}
```

### 4. 流式渲染

```typescript
// app/products/page.tsx
import { Suspense } from 'react';

async function ProductList() {
  // 慢速数据获取
  await new Promise(resolve => setTimeout(resolve, 3000));
  const products = await fetchProducts();
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      {/* ProductList渲染完成前,先显示fallback */}
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductList />
      </Suspense>
    </div>
  );
}
```

## 数据获取模式

### 顶层数据获取

```typescript
// app/blog/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    // 选项
    cache: 'force-cache', // 默认: 缓存
    next: { revalidate: 60 }, // 60秒后重新验证
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return res.json();
}

export default async function BlogPage() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### 并行数据获取

```typescript
// app/dashboard/page.tsx
async function getUser() {
  const res = await fetch('https://api.example.com/user');
  return res.json();
}

async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  return res.json();
}

export default async function DashboardPage() {
  // 并行获取数据
  const [user, posts] = await Promise.all([
    getUser(),
    getPosts(),
  ]);
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>Your Posts</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 顺序数据获取

```typescript
// app/user/[id]/page.tsx
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}

async function getUserPosts(userId: string) {
  const res = await fetch(`https://api.example.com/users/${userId}/posts`);
  return res.json();
}

export default async function UserPage({
  params,
}: {
  params: { id: string };
}) {
  // 先获取用户
  const user = await getUser(params.id);
  
  // 再获取该用户的帖子
  const posts = await getUserPosts(user.id);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 使用Suspense分离数据获取

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

async function UserInfo() {
  const user = await fetchUser();
  return <div>User: {user.name}</div>;
}

async function PostList() {
  const posts = await fetchPosts();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* 两个组件独立加载 */}
      <Suspense fallback={<div>Loading user...</div>}>
        <UserInfo />
      </Suspense>
      
      <Suspense fallback={<div>Loading posts...</div>}>
        <PostList />
      </Suspense>
    </div>
  );
}
```

## 缓存和重新验证

### 请求缓存

```typescript
// 默认: 缓存直到手动失效
fetch('https://api.example.com/data', {
  cache: 'force-cache', // 默认
});

// 不缓存
fetch('https://api.example.com/data', {
  cache: 'no-store',
});

// 时间重新验证
fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // 60秒后重新验证
});

// 标签重新验证
fetch('https://api.example.com/data', {
  next: { tags: ['posts'] },
});
```

### 按需重新验证

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 重新验证特定路径
  revalidatePath('/blog');
  
  // 重新验证特定标签
  revalidateTag('posts');
  
  return NextResponse.json({ revalidated: true });
}

// 使用
// POST /api/revalidate
```

### 路由段配置

```typescript
// app/blog/page.tsx
// 配置整个路由段的缓存行为
export const dynamic = 'force-dynamic'; // 强制动态渲染
// export const dynamic = 'force-static'; // 强制静态渲染
// export const dynamic = 'error'; // 如果有动态函数则报错
// export const dynamic = 'auto'; // 默认

export const revalidate = 60; // 60秒后重新验证

export default async function BlogPage() {
  const posts = await fetchPosts();
  return <div>{/* ... */}</div>;
}
```

## 服务端组件模式

### 将客户端组件作为叶子节点

```typescript
// ✅ 好 - 客户端组件是叶子节点
// app/page.tsx (服务端组件)
import ClientButton from '@/components/ClientButton';

async function getData() {
  return await fetchData();
}

export default async function Page() {
  const data = await getData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      {/* 客户端组件作为叶子 */}
      <ClientButton />
    </div>
  );
}

// components/ClientButton.tsx
'use client';

export default function ClientButton() {
  return <button onClick={() => alert('Clicked')}>Click me</button>;
}
```

### 从服务端到客户端传递Props

```typescript
// app/page.tsx (服务端组件)
import ClientComponent from '@/components/ClientComponent';

async function getData() {
  return await fetchData();
}

export default async function Page() {
  const data = await getData();
  
  // ✅ 可以传递序列化的数据
  return <ClientComponent data={data} />;
}

// components/ClientComponent.tsx
'use client';

export default function ClientComponent({ data }: { data: any }) {
  return <div>{data.title}</div>;
}
```

### 服务端和客户端组件交错

```typescript
// app/page.tsx (服务端)
import ClientWrapper from '@/components/ClientWrapper';
import ServerComponent from '@/components/ServerComponent';

export default function Page() {
  return (
    <ClientWrapper>
      {/* 可以在客户端组件内传递服务端组件作为children */}
      <ServerComponent />
    </ClientWrapper>
  );
}

// components/ClientWrapper.tsx
'use client';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="wrapper">{children}</div>;
}

// components/ServerComponent.tsx (服务端)
export default async function ServerComponent() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}
```

### 不支持的模式

```typescript
// ❌ 错误 - 不能在客户端组件中导入服务端组件
'use client';

import ServerComponent from './ServerComponent';

export default function ClientComponent() {
  return (
    <div>
      <ServerComponent /> {/* 错误! */}
    </div>
  );
}

// ✅ 正确 - 通过children传递
'use client';

export default function ClientComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
```

## 服务端组件中的Context

### 不能直接使用Context

```typescript
// ❌ 错误 - 服务端组件不能使用Context
import { createContext } from 'react';

const ThemeContext = createContext('light');

export default async function ServerComponent() {
  // 错误! 服务端组件不能使用useContext
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}

// ✅ 正确 - 在客户端组件中使用Context
'use client';

import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export default function ClientComponent() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}
```

### Context Provider作为客户端组件

```typescript
// app/providers.tsx
'use client';

import { ThemeProvider } from './ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// app/layout.tsx (服务端)
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## 第三方库集成

### 标记客户端入口

```typescript
// lib/client-library.tsx
'use client';

export { SomeComponent } from 'some-library';
export { AnotherComponent } from 'another-library';

// app/page.tsx (服务端)
import { SomeComponent } from '@/lib/client-library';

export default function Page() {
  return <SomeComponent />;
}
```

### 使用only-client包

```typescript
// 安装
npm install client-only

// components/ClientOnlyComponent.tsx
import 'client-only';

export default function ClientOnlyComponent() {
  // 此组件只能在客户端使用
  return <div>Client Only</div>;
}
```

### 使用only-server包

```typescript
// 安装
npm install server-only

// lib/server-utils.ts
import 'server-only';

export async function getSecretData() {
  // 此函数只能在服务端使用
  const apiKey = process.env.SECRET_API_KEY;
  return fetchData(apiKey);
}
```

## 数据库访问

### 直接查询数据库

```typescript
// app/users/page.tsx
import { db } from '@/lib/db';

export default async function UsersPage() {
  // 直接查询数据库
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 使用ORM

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// app/posts/page.tsx
import { db } from '@/lib/db';

export default async function PostsPage() {
  const posts = await db.post.findMany({
    include: {
      author: true,
      comments: true,
    },
  });
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author.name}</p>
          <p>{post.comments.length} comments</p>
        </article>
      ))}
    </div>
  );
}
```

## 认证和授权

### 获取Session

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
    </div>
  );
}
```

### 权限检查

```typescript
// app/admin/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}
```

## 错误处理

### Try-Catch

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  try {
    const posts = await fetchPosts();
    return (
      <div>
        {posts.map(post => (
          <article key={post.id}>{post.title}</article>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Failed to load posts</div>;
  }
}
```

### 使用Error Boundary

```typescript
// app/posts/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
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

// app/posts/page.tsx
export default async function PostsPage() {
  // 如果这里抛出错误,会被error.tsx捕获
  const posts = await fetchPosts();
  return <div>{/* ... */}</div>;
}
```

## 性能优化

### 预加载数据

```typescript
// app/posts/[id]/page.tsx
import { preload } from 'react-dom';

async function getPost(id: string) {
  return await fetchPost(id);
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  // 预加载
  preload(getPost(params.id));
  
  const post = await getPost(params.id);
  
  return <div>{post.title}</div>;
}
```

### 数据预取

```typescript
// app/posts/page.tsx
import Link from 'next/link';

async function getPosts() {
  return await fetchPosts();
}

export default async function PostsPage() {
  const posts = await getPosts();
  
  return (
    <div>
      {posts.map(post => (
        // Link会自动预取目标页面
        <Link key={post.id} href={`/posts/${post.id}`} prefetch={true}>
          {post.title}
        </Link>
      ))}
    </div>
  );
}
```

## 最佳实践

### 1. 优先使用服务端组件

```typescript
// ✅ 好 - 默认使用服务端组件
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ⚠️ 仅在需要时使用客户端组件
'use client';

export default function Page() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

### 2. 将数据获取放在需要的地方

```typescript
// ✅ 好 - 组件自己获取数据
async function UserInfo({ userId }: { userId: string }) {
  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
}

// ❌ 不好 - 从顶层传递所有数据
function UserInfo({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

### 3. 使用Suspense优化加载体验

```typescript
// ✅ 好 - 使用Suspense
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Page Title</h1>
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

服务端组件是Next.js App Router的核心特性,合理使用可以显著提升应用性能和用户体验。

