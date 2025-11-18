# Next.js简介与安装

## 概述

Next.js是一个基于React的全栈框架,由Vercel开发和维护。它提供了服务端渲染(SSR)、静态站点生成(SSG)、API路由等功能,使得构建现代Web应用变得简单高效。本文将全面介绍Next.js的核心特性、应用场景和安装配置。

## Next.js核心特性

### 1. 混合渲染模式

```typescript
// 静态生成(SSG) - 构建时生成HTML
export async function getStaticProps() {
  return { props: { data: 'static' } };
}

// 服务端渲染(SSR) - 每次请求时生成HTML
export async function getServerSideProps() {
  return { props: { data: 'server' } };
}

// 增量静态再生成(ISR) - 静态页面定时更新
export async function getStaticProps() {
  return {
    props: { data: 'revalidated' },
    revalidate: 60, // 60秒后重新生成
  };
}

// 客户端渲染(CSR) - 在浏览器中获取数据
export default function Page() {
  const { data } = useSWR('/api/data', fetcher);
  return <div>{data}</div>;
}
```

### 2. 零配置

```bash
# 创建项目即可开发,无需配置Webpack、Babel等
npx create-next-app@latest my-app
cd my-app
npm run dev
```

### 3. 文件系统路由

```
pages/
├── index.js          → /
├── about.js          → /about
├── blog/
│   ├── index.js      → /blog
│   └── [slug].js     → /blog/:slug
└── api/
    └── hello.js      → /api/hello
```

### 4. API路由

```typescript
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    res.status(200).json({ users: [] });
  }
}
```

### 5. 内置优化

```typescript
// 图片优化
import Image from 'next/image';

<Image
  src="/photo.jpg"
  width={500}
  height={300}
  alt="Photo"
  placeholder="blur"
/>

// 字体优化
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

<div className={inter.className}>Text</div>

// 代码分割(自动)
// 每个页面只加载所需的JavaScript
```

### 6. TypeScript支持

```typescript
// 零配置TypeScript支持
// 只需创建tsconfig.json文件即可
```

### 7. 快速刷新

```typescript
// 保存文件后,页面自动刷新,保持组件状态
// 开发体验极佳
```

## Next.js 13+ App Router新特性

### React Server Components

```typescript
// app/page.tsx - 默认是Server Component
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

### Server Actions

```typescript
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  // 数据库操作
  await db.user.create({ name });
}

// app/page.tsx
import { createUser } from './actions';

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### 流式渲染

```typescript
// app/page.tsx
import { Suspense } from 'react';

async function SlowComponent() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return <div>Slow content loaded</div>;
}

export default function Page() {
  return (
    <div>
      <h1>Page Title</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SlowComponent />
      </Suspense>
    </div>
  );
}
```

### 嵌套布局

```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav>Dashboard Nav</nav>
      {children}
    </div>
  );
}
```

## 安装Next.js

### 使用create-next-app(推荐)

```bash
# 创建新项目(交互式)
npx create-next-app@latest

# 创建TypeScript项目
npx create-next-app@latest my-app --typescript

# 使用App Router
npx create-next-app@latest my-app --app

# 使用Tailwind CSS
npx create-next-app@latest my-app --tailwind

# 一次性指定所有选项
npx create-next-app@latest my-app \
  --typescript \
  --app \
  --tailwind \
  --eslint \
  --import-alias "@/*"
```

### 交互式创建

```bash
npx create-next-app@latest

# 会提示以下问题:
✔ What is your project named? … my-app
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like to use `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to customize the default import alias (@/*)? … No / Yes
```

### 手动安装

```bash
# 创建项目目录
mkdir my-app
cd my-app

# 初始化package.json
npm init -y

# 安装依赖
npm install next@latest react@latest react-dom@latest

# 安装TypeScript(可选)
npm install --save-dev typescript @types/react @types/node

# 创建pages目录
mkdir pages

# 创建首页
touch pages/index.tsx
```

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 项目结构

### Pages Router项目结构

```
my-app/
├── pages/
│   ├── _app.tsx        # 自定义App组件
│   ├── _document.tsx   # 自定义Document
│   ├── index.tsx       # 首页
│   └── api/
│       └── hello.ts    # API路由
├── public/
│   ├── favicon.ico
│   └── images/
├── styles/
│   └── globals.css
├── components/
├── lib/
├── utils/
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### App Router项目结构

```
my-app/
├── app/
│   ├── layout.tsx      # 根布局
│   ├── page.tsx        # 首页
│   ├── loading.tsx     # 加载状态
│   ├── error.tsx       # 错误处理
│   ├── not-found.tsx   # 404页面
│   └── api/
│       └── route.ts    # API路由
├── public/
├── components/
├── lib/
├── next.config.js
├── tsconfig.json
└── package.json
```

## 配置文件

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // React严格模式
  reactStrictMode: true,
  
  // 图片域名白名单
  images: {
    domains: ['example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // 重定向
  async redirects() {
    return [
      {
        source: '/old',
        destination: '/new',
        permanent: true,
      },
    ];
  },
  
  // 重写
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
  
  // Headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  // Webpack配置
  webpack: (config, { isServer }) => {
    // 自定义webpack配置
    return config;
  },
};

module.exports = nextConfig;
```

### next.config.ts(TypeScript配置)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'],
  },
};

export default nextConfig;
```

## 开发命令

### 基本命令

```bash
# 开发模式
npm run dev
# 默认运行在 http://localhost:3000

# 指定端口
npm run dev -- -p 3001

# 生产构建
npm run build

# 启动生产服务器
npm run start

# Lint检查
npm run lint
```

### 环境变量

```bash
# .env.local
DATABASE_URL=postgresql://localhost/mydb
NEXT_PUBLIC_API_URL=https://api.example.com

# .env.development
# 开发环境变量

# .env.production
# 生产环境变量
```

```typescript
// 使用环境变量
// 服务端和客户端都可以访问
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 只在服务端可以访问
const dbUrl = process.env.DATABASE_URL;
```

## 第一个Next.js应用

### Pages Router版本

```typescript
// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>My Next.js App</title>
        <meta name="description" content="My first Next.js app" />
      </Head>
      
      <main>
        <h1>Welcome to Next.js!</h1>
        <p>This is my first Next.js application.</p>
        <Link href="/about">Go to About</Link>
      </main>
    </>
  );
}

// pages/about.tsx
export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page.</p>
    </div>
  );
}

// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ message: 'Hello from Next.js!' });
}
```

### App Router版本

```typescript
// app/layout.tsx
export const metadata = {
  title: 'My Next.js App',
  description: 'My first Next.js app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <p>This is my first Next.js application.</p>
      <Link href="/about">Go to About</Link>
    </main>
  );
}

// app/about/page.tsx
export default function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is the about page.</p>
    </div>
  );
}

// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Next.js!' });
}
```

## 部署

### Vercel部署(推荐)

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

### 其他平台部署

```bash
# 构建
npm run build

# 启动(需要Node.js环境)
npm start

# 导出静态站点(仅支持静态页面)
npm run build && npm run export
```

### Docker部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t my-nextjs-app .

# 运行容器
docker run -p 3000:3000 my-nextjs-app
```

## Next.js vs Create React App

### 功能对比

| 特性 | Next.js | CRA |
|------|---------|-----|
| 服务端渲染 | ✅ | ❌ |
| 静态生成 | ✅ | ✅ |
| API路由 | ✅ | ❌ |
| 文件路由 | ✅ | ❌ |
| 图片优化 | ✅ | ❌ |
| 自动代码分割 | ✅ | 部分 |
| SEO友好 | ✅ | 需配置 |
| 零配置 | ✅ | ✅ |
| TypeScript | ✅ | ✅ |

### 使用场景

```typescript
// Next.js适合:
// - 需要SEO的应用(博客、电商、官网)
// - 需要服务端渲染的应用
// - 需要API路由的应用
// - 全栈应用

// CRA适合:
// - 纯客户端应用(后台管理系统)
// - 不需要SEO的应用
// - 简单的SPA
```

## 学习资源

### 官方资源

```bash
# 官方文档
https://nextjs.org/docs

# 官方示例
https://github.com/vercel/next.js/tree/canary/examples

# 官方教程
https://nextjs.org/learn
```

### 社区资源

```bash
# Awesome Next.js
https://github.com/unicodeveloper/awesome-nextjs

# Next.js Discord
https://discord.gg/nextjs

# Next.js Reddit
https://www.reddit.com/r/nextjs/
```

Next.js是构建现代React应用的强大框架,它提供了丰富的特性和优秀的开发体验,非常适合从小型项目到大型企业应用的各种场景。

