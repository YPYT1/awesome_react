# Astro 静态网站生成

## 课程概述

本课程深入讲解Astro静态网站生成器。Astro是一个现代的静态网站构建工具,专注于内容驱动的网站,提供卓越的性能和开发体验。

学习目标:
- 理解Astro的核心理念
- 掌握Astro项目结构
- 学习组件开发
- 理解静态路由
- 掌握内容集合
- 学习Markdown集成
- 理解构建优化
- 构建完整的静态网站

---

## 一、Astro 简介

### 1.1 什么是Astro

```astro
---
// Astro 是一个静态网站生成器
// 核心特点:
// 1. 零JavaScript默认
// 2. 多框架支持(React, Vue, Svelte等)
// 3. 服务器优先
// 4. 快速构建
// 5. SEO友好
// 6. 内容集合
// 7. Islands架构
---

<html>
  <head>
    <title>My Astro Site</title>
  </head>
  <body>
    <h1>Welcome to Astro</h1>
    <p>Build fast, content-focused websites.</p>
  </body>
</html>
```

**Astro的优势:**

| 特性 | 说明 |
|------|------|
| 零JavaScript | 默认不发送JS到浏览器 |
| 多框架 | 使用任何UI框架 |
| 快速 | 优秀的构建性能 |
| SEO优化 | 完整的HTML输出 |
| 内容集合 | 类型安全的内容管理 |
| 灵活 | 支持多种内容源 |

### 1.2 Astro vs 其他框架

```
Next.js    - 全栈框架, SSR/SSG, React专用
Remix      - 全栈框架, SSR, React专用
Astro      - 静态优先, 多框架, 零JavaScript

适用场景:
- Astro: 博客, 文档, 营销网站, 内容网站
- Next.js: 全栈应用, 动态网站
- Remix: 表单密集型应用, 动态应用
```

### 1.3 安装与设置

```bash
# 创建新项目
npm create astro@latest

# 选择选项:
# - Project name
# - Template (Empty, Blog, Documentation, etc.)
# - Install dependencies
# - TypeScript
# - Git init

# 进入项目
cd my-astro-site

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建
npm run preview
```

---

## 二、项目结构

### 2.1 基础结构

```
my-astro-site/
├── src/
│   ├── pages/
│   │   ├── index.astro       # 首页
│   │   ├── about.astro        # /about
│   │   └── blog/
│   │       ├── index.astro    # /blog
│   │       └── [slug].astro   # /blog/:slug
│   ├── layouts/
│   │   └── Layout.astro       # 布局组件
│   ├── components/
│   │   └── Header.astro       # 组件
│   ├── content/
│   │   └── blog/              # 内容集合
│   │       ├── post-1.md
│   │       └── post-2.md
│   └── styles/
│       └── global.css
├── public/
│   ├── favicon.svg
│   └── images/
├── astro.config.mjs           # Astro配置
├── tsconfig.json
└── package.json
```

### 2.2 配置文件

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'

export default defineConfig({
  // 网站URL
  site: 'https://example.com',
  
  // 基础路径
  base: '/',
  
  // 输出目录
  outDir: './dist',
  
  // 公共目录
  publicDir: './public',
  
  // 服务器配置
  server: {
    port: 3000,
    host: true
  },
  
  // 构建配置
  build: {
    format: 'directory', // 'file' 或 'directory'
    assets: '_astro'
  },
  
  // Markdown配置
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark'
    }
  },
  
  // 集成
  integrations: []
})
```

---

## 三、页面与路由

### 3.1 基础页面

```astro
---
// src/pages/index.astro
const title = "Home Page"
const description = "Welcome to my website"
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>{description}</p>
  </body>
</html>
```

### 3.2 使用布局

```astro
---
// src/layouts/Layout.astro
interface Props {
  title: string
  description?: string
}

const { title, description } = Astro.props
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description || "My website"} />
    <title>{title}</title>
    <link rel="stylesheet" href="/styles/global.css" />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
      </nav>
    </header>
    
    <main>
      <slot />
    </main>
    
    <footer>
      <p>&copy; 2024 My Website</p>
    </footer>
  </body>
</html>
```

```astro
---
// src/pages/about.astro
import Layout from '../layouts/Layout.astro'
---

<Layout title="About" description="About our company">
  <h1>About Us</h1>
  <p>We are a great company!</p>
</Layout>
```

### 3.3 动态路由

```astro
---
// src/pages/blog/[slug].astro
import Layout from '../../layouts/Layout.astro'

export async function getStaticPaths() {
  const posts = [
    { slug: 'post-1', title: 'First Post', content: '...' },
    { slug: 'post-2', title: 'Second Post', content: '...' },
    { slug: 'post-3', title: 'Third Post', content: '...' }
  ]
  
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }))
}

const { post } = Astro.props
---

<Layout title={post.title}>
  <article>
    <h1>{post.title}</h1>
    <div>{post.content}</div>
  </article>
</Layout>
```

---

## 四、组件

### 4.1 Astro组件

```astro
---
// src/components/Card.astro
interface Props {
  title: string
  description: string
  href?: string
}

const { title, description, href } = Astro.props
---

<div class="card">
  <h3>{title}</h3>
  <p>{description}</p>
  {href && <a href={href}>Learn more →</a>}
</div>

<style>
  .card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .card h3 {
    margin-top: 0;
  }
  
  .card a {
    color: #0066cc;
    text-decoration: none;
  }
  
  .card a:hover {
    text-decoration: underline;
  }
</style>
```

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro'
import Card from '../components/Card.astro'
---

<Layout title="Home">
  <h1>Welcome</h1>
  
  <div class="cards">
    <Card 
      title="About Us"
      description="Learn more about our company"
      href="/about"
    />
    <Card 
      title="Services"
      description="Check out our services"
      href="/services"
    />
    <Card 
      title="Contact"
      description="Get in touch with us"
      href="/contact"
    />
  </div>
</Layout>

<style>
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
</style>
```

### 4.2 使用React组件

```bash
npm install @astrojs/react react react-dom
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()]
})
```

```jsx
// src/components/Counter.jsx
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

```astro
---
// src/pages/interactive.astro
import Layout from '../layouts/Layout.astro'
import Counter from '../components/Counter.jsx'
---

<Layout title="Interactive">
  <h1>Interactive Component</h1>
  
  {/* client:load - 页面加载时hydrate */}
  <Counter client:load />
  
  {/* client:idle - 浏览器空闲时hydrate */}
  <Counter client:idle />
  
  {/* client:visible - 组件可见时hydrate */}
  <Counter client:visible />
  
  {/* client:only - 只在客户端渲染 */}
  <Counter client:only="react" />
</Layout>
```

---

## 五、内容集合

### 5.1 定义集合

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content'

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    publishDate: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false)
  })
})

export const collections = {
  'blog': blogCollection
}
```

### 5.2 创建内容

```markdown
---
# src/content/blog/first-post.md
title: "First Blog Post"
description: "This is my first blog post"
author: "John Doe"
publishDate: 2024-01-01
tags: ["astro", "blogging"]
---

# First Blog Post

This is the content of my first blog post.

## Section 1

Some content here...

## Section 2

More content here...
```

### 5.3 查询内容

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content'
import Layout from '../../layouts/Layout.astro'

const posts = await getCollection('blog', ({ data }) => {
  return data.draft !== true
})

// 按日期排序
posts.sort((a, b) => 
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
)
---

<Layout title="Blog">
  <h1>Blog</h1>
  
  <div class="posts">
    {posts.map(post => (
      <article class="post-card">
        <h2>
          <a href={`/blog/${post.slug}`}>{post.data.title}</a>
        </h2>
        <p>{post.data.description}</p>
        <div class="meta">
          <span>By {post.data.author}</span>
          <time>{post.data.publishDate.toLocaleDateString()}</time>
        </div>
        {post.data.tags && (
          <div class="tags">
            {post.data.tags.map(tag => (
              <span class="tag">{tag}</span>
            ))}
          </div>
        )}
      </article>
    ))}
  </div>
</Layout>

<style>
  .posts {
    display: grid;
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .post-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .post-card h2 a {
    color: inherit;
    text-decoration: none;
  }
  
  .post-card h2 a:hover {
    color: #0066cc;
  }
  
  .meta {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #666;
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .tag {
    background: #f0f0f0;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
  }
</style>
```

### 5.4 渲染单篇文章

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content'
import Layout from '../../layouts/Layout.astro'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }))
}

const { post } = Astro.props
const { Content } = await post.render()
---

<Layout title={post.data.title} description={post.data.description}>
  <article class="blog-post">
    <header>
      <h1>{post.data.title}</h1>
      <div class="meta">
        <span>By {post.data.author}</span>
        <time>{post.data.publishDate.toLocaleDateString()}</time>
      </div>
      {post.data.tags && (
        <div class="tags">
          {post.data.tags.map(tag => (
            <span class="tag">{tag}</span>
          ))}
        </div>
      )}
    </header>
    
    <div class="content">
      <Content />
    </div>
  </article>
</Layout>

<style>
  .blog-post {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .blog-post h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #666;
  }
  
  .tags {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .tag {
    background: #f0f0f0;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  
  .content {
    line-height: 1.7;
  }
  
  .content h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .content pre {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
  }
</style>
```

---

## 六、数据获取

### 6.1 静态数据获取

```astro
---
// src/pages/products.astro
import Layout from '../layouts/Layout.astro'

const response = await fetch('https://api.example.com/products')
const products = await response.json()
---

<Layout title="Products">
  <h1>Our Products</h1>
  
  <div class="products">
    {products.map(product => (
      <div class="product-card">
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span class="price">${product.price}</span>
      </div>
    ))}
  </div>
</Layout>
```

### 6.2 本地JSON数据

```json
// src/data/team.json
[
  {
    "id": 1,
    "name": "John Doe",
    "role": "CEO",
    "bio": "Founder and CEO",
    "avatar": "/images/john.jpg"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "role": "CTO",
    "bio": "Chief Technology Officer",
    "avatar": "/images/jane.jpg"
  }
]
```

```astro
---
// src/pages/team.astro
import Layout from '../layouts/Layout.astro'
import teamData from '../data/team.json'
---

<Layout title="Our Team">
  <h1>Our Team</h1>
  
  <div class="team-grid">
    {teamData.map(member => (
      <div class="member-card">
        <img src={member.avatar} alt={member.name} />
        <h3>{member.name}</h3>
        <p class="role">{member.role}</p>
        <p>{member.bio}</p>
      </div>
    ))}
  </div>
</Layout>
```

---

## 七、构建与部署

### 7.1 构建命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

### 7.2 静态输出

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static', // 默认值
  
  build: {
    format: 'directory', // /about/ 而不是 /about.html
    // format: 'file',   // /about.html
  }
})
```

### 7.3 部署到Vercel

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

```bash
# 部署
vercel
```

### 7.4 部署到Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

### 7.5 部署到GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 八、实战案例

### 8.1 完整博客站点

```astro
---
// src/pages/index.astro
import { getCollection } from 'astro:content'
import Layout from '../layouts/Layout.astro'

const posts = await getCollection('blog')
const recentPosts = posts
  .filter(p => !p.data.draft)
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
  .slice(0, 3)
---

<Layout title="My Blog" description="Personal blog about web development">
  <section class="hero">
    <h1>Welcome to My Blog</h1>
    <p>Thoughts on web development, design, and more.</p>
  </section>
  
  <section class="recent-posts">
    <h2>Recent Posts</h2>
    <div class="posts-grid">
      {recentPosts.map(post => (
        <article class="post-card">
          <h3>
            <a href={`/blog/${post.slug}`}>{post.data.title}</a>
          </h3>
          <p>{post.data.description}</p>
          <time>{post.data.publishDate.toLocaleDateString()}</time>
        </article>
      ))}
    </div>
    <a href="/blog" class="view-all">View all posts →</a>
  </section>
</Layout>

<style>
  .hero {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    margin-bottom: 3rem;
  }
  
  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .hero p {
    font-size: 1.25rem;
    opacity: 0.9;
  }
  
  .recent-posts h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .post-card {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .post-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .post-card h3 a {
    color: inherit;
    text-decoration: none;
  }
  
  .post-card time {
    font-size: 0.9rem;
    color: #666;
  }
  
  .view-all {
    display: inline-block;
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }
  
  .view-all:hover {
    text-decoration: underline;
  }
</style>
```

---

## 九、最佳实践

### 9.1 性能优化

```astro
---
// 图片优化
import { Image } from 'astro:assets'
import myImage from '../images/hero.jpg'
---

<Image 
  src={myImage} 
  alt="Hero" 
  width={1200}
  height={600}
  format="webp"
  quality={80}
/>
```

### 9.2 SEO优化

```astro
---
// src/components/SEO.astro
interface Props {
  title: string
  description: string
  image?: string
}

const { title, description, image } = Astro.props
const canonicalURL = new URL(Astro.url.pathname, Astro.site)
---

<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
{image && <meta property="og:image" content={image} />}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{image && <meta name="twitter:image" content={image} />}
```

### 9.3 学习资源

1. 官方文档
   - Astro Docs: https://docs.astro.build
   - Astro Blog: https://astro.build/blog

2. 模板
   - Astro Themes
   - Astro Examples

---

## 课后练习

1. 创建一个Astro博客
2. 实现内容集合
3. 添加React组件
4. 优化图片和SEO
5. 部署到生产环境

通过本课程的学习,你应该能够使用Astro构建快速、现代的静态网站!

