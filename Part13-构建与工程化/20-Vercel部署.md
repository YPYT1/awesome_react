# Vercel 部署 - 现代前端应用的最佳平台

## 1. Vercel 简介

### 1.1 什么是 Vercel

Vercel 是一个云平台，专为前端框架和静态站点设计，提供零配置部署、全球 CDN 加速、自动 HTTPS 等功能。它是 Next.js 的官方维护者。

**核心特性：**

- **零配置部署**：Git 集成，自动构建和部署
- **全球 CDN**：超过 70 个边缘节点
- **自动 HTTPS**：免费 SSL 证书
- **预览部署**：每个 PR 自动生成预览链接
- **边缘函数**：Serverless Functions 和 Edge Functions
- **分析工具**：内置性能和分析仪表板

### 1.2 支持的框架

Vercel 对以下框架提供一流支持：

```
✓ Next.js（官方框架）
✓ React（Create React App、Vite）
✓ Vue（Vue CLI、Nuxt.js）
✓ Angular
✓ Svelte（SvelteKit）
✓ Gatsby
✓ Astro
✓ 静态 HTML
```

### 1.3 定价模式

```
Hobby（个人免费版）
├── 无限部署
├── 100GB 带宽/月
├── Serverless Functions
└── 预览部署

Pro（专业版）$20/月
├── 1TB 带宽/月
├── 团队协作
├── 密码保护
└── 优先支持

Enterprise（企业版）
├── 自定义带宽
├── SLA 保证
├── 专属支持
└── 高级安全
```

## 2. 快速开始

### 2.1 从 Git 仓库部署

#### 步骤 1：连接 Git 仓库

```bash
# 访问 Vercel 控制台
https://vercel.com/new

# 选择 Git 提供商
- GitHub
- GitLab
- Bitbucket

# 导入项目
选择要部署的仓库
```

#### 步骤 2：配置项目

```bash
# Vercel 会自动检测框架
Framework Preset: Next.js / React / Vue / ...

# 构建配置
Build Command: npm run build
Output Directory: dist / build / out
Install Command: npm install

# 环境变量（可选）
添加必要的环境变量
```

#### 步骤 3：部署

```bash
# 点击 Deploy 按钮
Vercel 会：
1. 克隆代码
2. 安装依赖
3. 运行构建
4. 部署到 CDN
5. 生成预览链接
```

### 2.2 使用 Vercel CLI

#### 安装 CLI

```bash
# 使用 npm
npm install -g vercel

# 使用 pnpm
pnpm add -g vercel

# 使用 yarn
yarn global add vercel

# 验证安装
vercel --version
```

#### 登录 Vercel

```bash
# 登录账户
vercel login

# 选择登录方式
- GitHub
- GitLab
- Email
```

#### 部署项目

```bash
# 初次部署
vercel

# 部署到生产环境
vercel --prod

# 指定项目名称
vercel --name my-project

# 指定团队
vercel --scope my-team
```

### 2.3 配置文件

#### vercel.json

```json
{
  "version": 2,
  "name": "my-react-app",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "API_URL": "@api-url"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

#### 更复杂的配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/sitemap.xml",
      "dest": "/sitemap.xml"
    },
    {
      "src": "/robots.txt",
      "dest": "/robots.txt"
    },
    {
      "src": "/api/hello",
      "dest": "/api/hello.js"
    },
    {
      "src": "/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000, immutable"
      },
      "dest": "/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/blog/:slug",
      "destination": "/blog?slug=:slug"
    }
  ]
}
```

## 3. React 应用部署

### 3.1 Vite React 应用

#### 项目配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

#### package.json 配置

```json
{
  "name": "vite-react-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

#### vercel.json 配置

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3.2 Create React App

```json
// package.json
{
  "name": "create-react-app",
  "version": "0.1.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}
```

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app"
}
```

### 3.3 环境变量

#### 在 Vercel 控制台配置

```bash
# 项目设置 -> Environment Variables

# 添加环境变量
VITE_API_URL=https://api.example.com
VITE_GA_ID=UA-XXXXXXXXX-X
DATABASE_URL=postgresql://...

# 指定环境
- Production
- Preview
- Development
```

#### 在代码中使用

```typescript
// Vite 项目
const apiUrl = import.meta.env.VITE_API_URL;
const gaId = import.meta.env.VITE_GA_ID;

// Create React App
const apiUrl = process.env.REACT_APP_API_URL;
const gaId = process.env.REACT_APP_GA_ID;
```

#### .env 文件

```bash
# .env.local（本地开发）
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

# .env.production（生产环境）
VITE_API_URL=https://api.example.com
VITE_DEBUG=false
```

## 4. Next.js 应用部署

### 4.1 基础 Next.js 部署

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    appDir: true
  }
};

module.exports = nextConfig;
```

```json
// package.json
{
  "name": "nextjs-app",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 4.2 ISR（增量静态再生）

```typescript
// pages/blog/[slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  
  return {
    paths: posts.map((post: any) => ({
      params: { slug: post.slug }
    })),
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetch(`https://api.example.com/posts/${params?.slug}`)
    .then(r => r.json());
  
  return {
    props: { post },
    revalidate: 60 // 60秒后重新生成
  };
};

export default function BlogPost({ post }: { post: any }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### 4.3 Edge Functions

```typescript
// pages/api/edge-hello.ts
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge'
};

export default async function handler(req: NextRequest) {
  return new Response(
    JSON.stringify({
      message: 'Hello from Edge Function',
      timestamp: Date.now(),
      region: process.env.VERCEL_REGION
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    }
  );
}
```

### 4.4 Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 认证检查
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // A/B 测试
  const bucket = Math.random() < 0.5 ? 'a' : 'b';
  const response = NextResponse.next();
  response.cookies.set('bucket', bucket);
  
  // 添加自定义 header
  response.headers.set('x-custom-header', 'value');
  
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
};
```

## 5. Serverless Functions

### 5.1 创建 API 路由

#### Node.js Function

```typescript
// api/hello.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { name = 'World' } = req.query;
  
  res.status(200).json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString()
  });
}
```

#### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["api/**/*"],
  "exclude": ["node_modules"]
}
```

### 5.2 连接数据库

```typescript
// api/users.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM users');
      return res.status(200).json({ users: rows });
    }
    
    if (req.method === 'POST') {
      const { name, email } = req.body;
      const { rows } = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      return res.status(201).json({ user: rows[0] });
    }
    
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 5.3 函数配置

```json
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10,
      "runtime": "nodejs18.x"
    },
    "api/heavy-task.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  }
}
```

### 5.4 CORS 配置

```typescript
// api/_middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }
  
  return response;
}
```

## 6. 自定义域名

### 6.1 添加域名

```bash
# 方式 1：通过 Vercel 控制台
Project Settings -> Domains -> Add Domain

# 方式 2：通过 CLI
vercel domains add example.com
```

### 6.2 DNS 配置

#### 使用 Vercel DNS（推荐）

```bash
# 添加 Nameservers
ns1.vercel-dns.com
ns2.vercel-dns.com

# Vercel 会自动配置：
- A 记录
- CNAME 记录
- SSL 证书
```

#### 使用第三方 DNS

```bash
# A 记录（根域名）
Type: A
Name: @
Value: 76.76.21.21

# CNAME 记录（www）
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# CNAME 记录（子域名）
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### 6.3 域名重定向

```json
// vercel.json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.example.com"
        }
      ],
      "destination": "https://example.com/:path*",
      "permanent": true
    },
    {
      "source": "/old-blog/:slug",
      "destination": "/blog/:slug",
      "permanent": true
    }
  ]
}
```

### 6.4 SSL 证书

```bash
# Vercel 自动提供：
- 免费 SSL 证书（Let's Encrypt）
- 自动续期
- 通配符证书支持

# 自定义证书（Enterprise）
- 上传自己的证书
- 配置中间证书链
```

## 7. 预览部署

### 7.1 自动预览

```bash
# 每个 Pull Request 自动生成预览部署

预览 URL 格式：
<project>-<branch>-<team>.vercel.app
<project>-git-<branch>-<team>.vercel.app

示例：
myapp-feature-login-team.vercel.app
myapp-git-feature-login-team.vercel.app
```

### 7.2 GitHub 集成

```yaml
# .github/workflows/preview-deploy.yml
name: Preview Deploy

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  comment-preview:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Wait for Vercel deployment
        uses: UnlyEd/github-action-await-vercel@v1
        with:
          timeout: 300
          poll-interval: 5
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const deploymentUrl = process.env.VERCEL_DEPLOYMENT_URL;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed to: https://${deploymentUrl}`
            });
```

### 7.3 密码保护

```bash
# 在 Vercel 控制台配置
Project Settings -> Deployment Protection

# 选项：
1. Password Protection
   - 设置密码
   - 适用于预览部署

2. Vercel Authentication
   - 需要 Vercel 账户登录
   - 团队成员自动访问

3. Trusted IPs
   - IP 白名单
   - 企业功能
```

## 8. 性能优化

### 8.1 缓存策略

```json
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 8.2 图片优化

```typescript
// Next.js Image 组件
import Image from 'next/image';

export default function MyImage() {
  return (
    <Image
      src="/photo.jpg"
      width={800}
      height={600}
      alt="Photo"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      quality={75}
      priority
    />
  );
}
```

### 8.3 代码分割

```typescript
// React 动态导入
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

export default function Page() {
  return (
    <div>
      <HeavyComponent />
    </div>
  );
}
```

### 8.4 Web Analytics

```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 9. 监控和日志

### 9.1 实时日志

```bash
# 使用 Vercel CLI 查看日志
vercel logs <deployment-url>

# 实时日志
vercel logs --follow

# 过滤日志
vercel logs --output=json
```

### 9.2 性能监控

```typescript
// 自定义性能指标
import { sendToVercelAnalytics } from '@vercel/analytics';

export function reportWebVitals(metric) {
  const { id, name, label, value } = metric;
  
  sendToVercelAnalytics({
    name,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    label: label === 'web-vital' ? 'Web Vital' : 'Custom Metric',
    id
  });
  
  // 发送到其他分析服务
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true
    });
  }
}
```

### 9.3 错误追踪

```typescript
// 集成 Sentry
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.VERCEL_ENV || 'development'
});

// pages/_error.tsx
import NextErrorComponent from 'next/error';
import * as Sentry from '@sentry/nextjs';

const CustomErrorComponent = (props) => {
  return <NextErrorComponent statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  await Sentry.captureUnderscoreErrorException(contextData);
  return NextErrorComponent.getInitialProps(contextData);
};

export default CustomErrorComponent;
```

## 10. CI/CD 集成

### 10.1 GitHub Actions

```yaml
# .github/workflows/vercel-deploy.yml
name: Vercel Production Deployment

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 10.2 环境变量同步

```bash
# 下载环境变量
vercel env pull .env.local

# 添加环境变量
vercel env add API_KEY

# 删除环境变量
vercel env rm API_KEY

# 列出所有环境变量
vercel env ls
```

## 11. 最佳实践

### 11.1 项目结构

```
my-vercel-app/
├── api/                    # Serverless Functions
│   ├── hello.ts
│   └── users.ts
├── public/                 # 静态文件
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
├── .env.local             # 本地环境变量
├── .env.production        # 生产环境变量
├── vercel.json            # Vercel 配置
├── next.config.js         # Next.js 配置（如果使用）
└── package.json
```

### 11.2 安全配置

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### 11.3 性能检查清单

- [ ] 使用 Next.js Image 组件优化图片
- [ ] 启用 SWC 编译器
- [ ] 配置合理的缓存策略
- [ ] 使用 ISR 或 SSG 预渲染页面
- [ ] 实现代码分割和懒加载
- [ ] 配置 CDN 和边缘缓存
- [ ] 监控 Core Web Vitals
- [ ] 使用 Vercel Analytics

## 12. 故障排除

### 12.1 常见问题

**构建失败**

```bash
# 检查构建日志
vercel logs <deployment-url>

# 本地调试
vercel dev

# 检查依赖
npm ls
npm audit
```

**环境变量问题**

```bash
# 验证环境变量
vercel env ls

# 拉取最新环境变量
vercel env pull

# 检查代码中的引用
console.log(process.env.NEXT_PUBLIC_API_URL);
```

**路由问题**

```json
// 确保 vercel.json 配置正确
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 12.2 调试技巧

```bash
# 启用详细日志
vercel --debug

# 检查部署状态
vercel inspect <deployment-url>

# 回滚到之前的部署
vercel rollback <deployment-url>
```

## 13. 总结

Vercel 提供了：

1. **零配置部署**：Git 集成，自动化流程
2. **全球加速**：CDN 和边缘网络
3. **开发体验**：预览部署、实时协作
4. **性能优化**：自动优化、分析工具
5. **Serverless**：无服务器函数和边缘计算

通过合理使用 Vercel 的功能，可以快速部署高性能的现代 Web 应用。

