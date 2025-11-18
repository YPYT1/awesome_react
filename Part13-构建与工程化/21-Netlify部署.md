# Netlify 部署 - 现代 Web 开发平台

## 1. Netlify 简介

### 1.1 什么是 Netlify

Netlify 是一个为现代 Web 项目提供托管和无服务器后端服务的云平台，专注于 Jamstack 架构，提供持续部署、表单处理、无服务器函数等功能。

**核心特性：**

- **持续部署**：Git 集成，自动构建和部署
- **全球 CDN**：智能内容分发网络
- **表单处理**：无需后端的表单提交
- **无服务器函数**：Netlify Functions
- **边缘处理**：Edge Functions
- **分支部署**：每个分支独立部署
- **拆分测试**：A/B 测试内置支持

### 1.2 支持的框架

```
✓ React（Create React App、Vite、Next.js）
✓ Vue（Vue CLI、Nuxt.js、Vite）
✓ Angular
✓ Svelte（SvelteKit）
✓ Gatsby
✓ Hugo
✓ Jekyll
✓ 静态 HTML
```

### 1.3 定价模式

```
Starter（免费版）
├── 100GB 带宽/月
├── 300 构建分钟/月
├── 无限站点
└── 表单提交 100次/月

Pro（专业版）$19/月
├── 1TB 带宽/月
├── 25,000 构建分钟/月
├── 后台函数 125K 次/月
└── 表单提交 1000次/月

Business（商业版）$99/月
├── 自定义带宽
├── 优先构建
├── 角色权限
└── 审计日志
```

## 2. 快速开始

### 2.1 从 Git 仓库部署

#### 步骤 1：连接仓库

```bash
# 登录 Netlify
https://app.netlify.com

# 点击 "Add new site" -> "Import an existing project"

# 选择 Git 提供商
- GitHub
- GitLab
- Bitbucket
- Azure DevOps

# 选择仓库
搜索并选择要部署的仓库
```

#### 步骤 2：配置构建设置

```bash
# 基本设置
Branch to deploy: main

# 构建设置
Base directory: (留空或指定子目录)
Build command: npm run build
Publish directory: dist

# 环境变量（可选）
添加必要的环境变量
```

#### 步骤 3：部署

```bash
# 点击 "Deploy site" 按钮
Netlify 会：
1. 克隆代码
2. 安装依赖
3. 运行构建命令
4. 发布到 CDN
5. 生成唯一 URL
```

### 2.2 使用 Netlify CLI

#### 安装 CLI

```bash
# 使用 npm
npm install -g netlify-cli

# 使用 pnpm
pnpm add -g netlify-cli

# 使用 yarn
yarn global add netlify-cli

# 验证安装
netlify --version
```

#### 登录和初始化

```bash
# 登录 Netlify
netlify login

# 初始化项目
netlify init

# 选择部署方式
? What would you like to do?
  > Create & configure a new site
    Link this directory to an existing site
```

#### 部署项目

```bash
# 构建并部署
netlify deploy

# 部署到生产环境
netlify deploy --prod

# 打开站点
netlify open
```

### 2.3 拖放部署

```bash
# 最简单的方式：拖放
1. 访问 https://app.netlify.com/drop
2. 将构建后的文件夹拖到页面
3. 立即部署
```

## 3. 配置文件

### 3.1 netlify.toml

#### 基础配置

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

#### 完整配置

```toml
[build]
  base = ""
  publish = "dist"
  command = "npm run build"
  functions = "netlify/functions"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "18.17.0"
  NPM_VERSION = "9.6.7"
  RUBY_VERSION = "2.7.2"
  
[build.processing]
  skip_processing = false
  
[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  conditions = {Country = ["US", "GB"]}

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=604800"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE"

[context.production]
  command = "npm run build"
  
[context.production.environment]
  VITE_API_URL = "https://api.example.com"

[context.deploy-preview]
  command = "npm run build:preview"
  
[context.deploy-preview.environment]
  VITE_API_URL = "https://api-preview.example.com"

[context.branch-deploy]
  command = "npm run build:staging"
```

### 3.2 _redirects 文件

```bash
# public/_redirects

# SPA 回退
/*    /index.html   200

# API 代理
/api/*  https://api.example.com/:splat  200

# 重定向
/old-blog/*  /blog/:splat  301

# 国家重定向
/  /us  302  Country=us
/  /uk  302  Country=gb

# 语言重定向
/  /en  302  Language=en
/  /fr  302  Language=fr

# 角色访问控制
/admin/*  /admin/login  401!  Role=admin
```

### 3.3 _headers 文件

```bash
# public/_headers

# 全局 headers
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

# 静态资源缓存
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# API CORS
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization

# CSP
/
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

## 4. React 应用部署

### 4.1 Vite + React

#### 项目配置

```typescript
// vite.config.ts
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
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

#### netlify.toml 配置

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 4.2 Create React App

```toml
# netlify.toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_API_URL = "https://api.example.com"
  CI = "true"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.3 环境变量

#### 在 Netlify 控制台配置

```bash
# Site settings -> Environment variables

# 添加变量
VITE_API_URL=https://api.example.com
VITE_GA_ID=UA-XXXXXXXXX-X

# 作用域
- Production
- Deploy previews
- Branch deploys
```

#### 在代码中使用

```typescript
// Vite 项目
const apiUrl = import.meta.env.VITE_API_URL;

// Create React App
const apiUrl = process.env.REACT_APP_API_URL;

// 在构建时注入
console.log('API URL:', apiUrl);
```

#### .env 文件

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_DEBUG=false

# .env.development
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

## 5. Netlify Functions

### 5.1 创建函数

#### 目录结构

```
project/
├── netlify/
│   └── functions/
│       ├── hello.js
│       ├── users.js
│       └── auth/
│           └── login.js
├── src/
└── netlify.toml
```

#### 基础函数

```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  const { name = 'World' } = event.queryStringParameters || {};
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString()
    })
  };
};
```

#### TypeScript 函数

```typescript
// netlify/functions/users.ts
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface User {
  id: string;
  name: string;
  email: string;
}

const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  try {
    const users: User[] = [
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' }
    ];
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ users })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

export { handler };
```

### 5.2 访问数据库

```javascript
// netlify/functions/db-query.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: rows })
    };
  } catch (error) {
    console.error('Database error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

### 5.3 后台函数（Background Functions）

```javascript
// netlify/functions/send-email.js
exports.handler = async (event) => {
  // 立即返回响应
  const response = {
    statusCode: 202,
    body: JSON.stringify({ message: 'Email queued' })
  };
  
  // 异步处理（最多运行 10 分钟）
  sendEmail(JSON.parse(event.body))
    .then(() => console.log('Email sent'))
    .catch(err => console.error('Email error:', err));
  
  return response;
};

async function sendEmail(data) {
  // 发送邮件逻辑
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

### 5.4 定时函数（Scheduled Functions）

```javascript
// netlify/functions/daily-report.js
// 每天凌晨 1 点执行
const schedule = '@daily';

exports.handler = async () => {
  console.log('Running daily report...');
  
  // 生成报告
  const report = await generateDailyReport();
  
  // 发送报告
  await sendReport(report);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Report sent' })
  };
};

exports.schedule = schedule;
```

## 6. Edge Functions

### 6.1 创建 Edge Function

```typescript
// netlify/edge-functions/geo-redirect.ts
import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const country = context.geo?.country?.code || 'US';
  
  const countryUrls = {
    'US': '/en-us',
    'GB': '/en-gb',
    'FR': '/fr',
    'DE': '/de'
  };
  
  const url = new URL(request.url);
  const redirectPath = countryUrls[country] || '/en';
  
  // 如果已经在正确的路径，继续
  if (url.pathname.startsWith(redirectPath)) {
    return;
  }
  
  // 重定向到对应国家的版本
  return Response.redirect(new URL(redirectPath, request.url));
};

export const config = {
  path: "/"
};
```

### 6.2 A/B 测试

```typescript
// netlify/edge-functions/ab-test.ts
import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  // 从 cookie 获取或生成变体
  const cookie = context.cookies.get('ab-test-variant');
  const variant = cookie || (Math.random() < 0.5 ? 'a' : 'b');
  
  // 设置 cookie
  if (!cookie) {
    context.cookies.set({
      name: 'ab-test-variant',
      value: variant,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 天
    });
  }
  
  // 添加 header
  const response = await context.next();
  response.headers.set('X-AB-Test-Variant', variant);
  
  return response;
};

export const config = {
  path: "/*"
};
```

### 6.3 认证保护

```typescript
// netlify/edge-functions/auth.ts
import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  
  // 检查是否有认证 token
  const token = context.cookies.get('auth-token');
  
  // 如果访问 /admin 且没有 token，重定向到登录
  if (url.pathname.startsWith('/admin') && !token) {
    return Response.redirect(new URL('/login', request.url));
  }
  
  // 验证 token（简化示例）
  if (token) {
    try {
      // 验证 JWT token
      const isValid = await validateToken(token);
      
      if (!isValid) {
        return Response.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return Response.redirect(new URL('/login', request.url));
    }
  }
  
  return context.next();
};

async function validateToken(token: string): Promise<boolean> {
  // Token 验证逻辑
  return true;
}

export const config = {
  path: "/admin/*"
};
```

## 7. 表单处理

### 7.1 基础表单

```html
<!-- public/index.html -->
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  
  <div>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required />
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required />
  </div>
  
  <div>
    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea>
  </div>
  
  <button type="submit">Submit</button>
</form>
```

### 7.2 React 表单

```typescript
// src/components/ContactForm.tsx
import { useState, FormEvent } from 'react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formBody = new URLSearchParams({
      'form-name': 'contact',
      ...formData
    });
    
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });
      
      alert('Form submitted successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Error submitting form');
    }
  };
  
  return (
    <form 
      name="contact" 
      method="POST" 
      data-netlify="true"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      
      <textarea
        name="message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 7.3 文件上传

```html
<form name="upload" method="POST" data-netlify="true" enctype="multipart/form-data">
  <input type="hidden" name="form-name" value="upload" />
  
  <input type="file" name="file" required />
  
  <button type="submit">Upload</button>
</form>
```

### 7.4 表单通知

```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-emails"
  
  [plugins.inputs]
    from = "noreply@example.com"
    to = "admin@example.com"
    subject = "New form submission"
```

## 8. 分支部署

### 8.1 配置分支部署

```toml
# netlify.toml
[context.production]
  command = "npm run build"
  
[context.production.environment]
  VITE_API_URL = "https://api.example.com"

[context.deploy-preview]
  command = "npm run build:preview"
  
[context.deploy-preview.environment]
  VITE_API_URL = "https://api-preview.example.com"

[context.branch-deploy]
  command = "npm run build:dev"

[context.staging]
  command = "npm run build:staging"
  
[context.staging.environment]
  VITE_API_URL = "https://api-staging.example.com"
```

### 8.2 分支子域名

```bash
# 在 Netlify 控制台启用
Site settings -> Build & deploy -> Branch deploys

# 分支部署 URL 格式
<branch-name>--<site-name>.netlify.app

示例：
staging--myapp.netlify.app
feature-login--myapp.netlify.app
```

## 9. 自定义域名

### 9.1 添加域名

```bash
# 方式 1：通过 Netlify 控制台
Domain settings -> Add custom domain

# 方式 2：通过 CLI
netlify domains:add example.com
```

### 9.2 DNS 配置

#### Netlify DNS（推荐）

```bash
# 使用 Netlify 的 DNS 服务器
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net

# Netlify 会自动配置：
- A 记录
- CNAME 记录
- SSL 证书
```

#### 外部 DNS

```bash
# CNAME 记录（子域名）
Type: CNAME
Name: www
Value: <site-name>.netlify.app

# A 记录（根域名）
Type: A
Name: @
Value: 75.2.60.5

# AAAA 记录（IPv6）
Type: AAAA
Name: @
Value: 2600:1901:0:7e84::
```

### 9.3 域名重定向

```toml
# netlify.toml
[[redirects]]
  from = "https://www.example.com/*"
  to = "https://example.com/:splat"
  status = 301
  force = true
```

## 10. CI/CD 集成

### 10.1 GitHub Actions

```yaml
# .github/workflows/netlify-deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Deploy from GitHub Actions'
          enable-pull-request-comment: true
          enable-commit-comment: true
          overwrites-pull-request-comment: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 10.2 GitLab CI

```yaml
# .gitlab-ci.yml
image: node:18

stages:
  - build
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  only:
    - main
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist
  variables:
    NETLIFY_AUTH_TOKEN: $NETLIFY_AUTH_TOKEN
    NETLIFY_SITE_ID: $NETLIFY_SITE_ID
```

## 11. 性能优化

### 11.1 资源优化

```toml
# netlify.toml
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true
```

### 11.2 缓存策略

```bash
# _headers
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=604800

/*.css
  Cache-Control: public, max-age=604800

/index.html
  Cache-Control: public, max-age=0, must-revalidate
```

### 11.3 预渲染

```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-nextjs"

[[plugins]]
  package = "netlify-plugin-submit-sitemap"
  
  [plugins.inputs]
    baseUrl = "https://example.com"
    sitemapPath = "/sitemap.xml"
```

## 12. 监控和分析

### 12.1 Netlify Analytics

```bash
# 启用 Analytics
Site settings -> Analytics -> Enable

# 查看数据
- 页面浏览量
- 访问来源
- 热门页面
- 404 错误
```

### 12.2 日志查看

```bash
# 使用 CLI 查看日志
netlify logs

# 实时日志
netlify logs --live

# 函数日志
netlify functions:log <function-name>
```

## 13. 最佳实践

### 13.1 项目结构

```
my-netlify-app/
├── netlify/
│   ├── functions/
│   │   └── api.js
│   └── edge-functions/
│       └── geo.ts
├── public/
│   ├── _redirects
│   ├── _headers
│   └── assets/
├── src/
│   ├── components/
│   └── pages/
├── netlify.toml
└── package.json
```

### 13.2 安全配置

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

### 13.3 环境管理

```bash
# 使用不同环境
- Production: main 分支
- Staging: staging 分支
- Development: develop 分支

# 环境变量分离
- 生产环境变量
- 预览部署变量
- 分支部署变量
```

## 14. 总结

Netlify 提供了：

1. **简单部署**：Git 集成，自动化构建
2. **强大功能**：Functions、Edge Functions、Forms
3. **全球加速**：CDN 和边缘网络
4. **开发工具**：分支部署、预览部署
5. **灵活配置**：丰富的配置选项

通过合理使用 Netlify 的功能，可以快速部署和管理现代 Web 应用。

