# Astro Islands 架构

## 课程概述

本课程深入讲解Astro的Islands架构。Islands架构是Astro的核心创新,允许在静态HTML中嵌入交互式组件,实现最优的性能和用户体验。

学习目标:
- 理解Islands架构
- 掌握客户端hydration
- 学习部分hydration
- 理解框架无关性
- 掌握性能优化
- 学习交互式组件
- 理解渐进增强
- 构建高性能网站

---

## 一、Islands 架构基础

### 1.1 什么是Islands

```
传统架构:
├── 整个页面都是JavaScript
├── 所有代码都需要hydrate
└── 性能开销大

Islands架构:
├── 大部分是静态HTML  🏝️ 静态海洋
├── 少量交互式组件  🏝️ 交互岛屿
└── 只hydrate需要的部分
```

**Islands架构优势:**

| 特性 | 说明 |
|------|------|
| 零JavaScript默认 | 大部分页面是静态HTML |
| 部分hydration | 只hydrate交互组件 |
| 并行加载 | Islands独立加载 |
| 框架无关 | 支持任何UI框架 |
| 优秀性能 | 最小的JavaScript |
| SEO友好 | 完整的HTML输出 |

### 1.2 基本示例

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro'
import StaticComponent from '../components/StaticComponent.astro'
import InteractiveCounter from '../components/InteractiveCounter.jsx'
---

<Layout title="Islands Demo">
  <!-- 静态内容 - 无JavaScript -->
  <h1>Welcome to My Site</h1>
  <p>This is static content</p>
  
  <!-- 静态组件 - 无JavaScript -->
  <StaticComponent />
  
  <!-- Interactive Island - 有JavaScript -->
  <InteractiveCounter client:load />
  
  <!-- 更多静态内容 -->
  <footer>
    <p>Static footer content</p>
  </footer>
</Layout>
```

### 1.3 工作原理

```
1. 构建时
   ├── 所有组件渲染为HTML
   ├── 识别交互式组件
   └── 生成hydration脚本

2. 浏览器加载
   ├── 立即显示完整HTML
   ├── 静态内容无JavaScript
   └── 按需加载交互组件

3. Hydration
   ├── 只hydrate标记的组件
   ├── 并行加载Islands
   └── 其他部分保持静态
```

---

## 二、客户端指令

### 2.1 client:load

```astro
---
// 页面加载时立即hydrate
import Counter from '../components/Counter.jsx'
---

<!-- 优先级最高,页面加载时立即加载 -->
<Counter client:load />

<!-- 适用场景: -->
<!-- - 首屏关键交互 -->
<!-- - 立即可见的组件 -->
<!-- - 用户可能立即交互的内容 -->
```

### 2.2 client:idle

```astro
---
// 浏览器空闲时hydrate
import Chatbot from '../components/Chatbot.jsx'
---

<!-- 浏览器完成初始加载后,在空闲时加载 -->
<Chatbot client:idle />

<!-- 适用场景: -->
<!-- - 非关键交互 -->
<!-- - 聊天组件 -->
<!-- - 辅助功能 -->
```

### 2.3 client:visible

```astro
---
// 组件可见时hydrate
import LazyImage from '../components/LazyImage.jsx'
import Comments from '../components/Comments.jsx'
---

<!-- 滚动到组件时才加载 -->
<LazyImage client:visible />

<!-- 折叠下方的评论 -->
<Comments client:visible />

<!-- 适用场景: -->
<!-- - 折叠下方内容 -->
<!-- - 图片画廊 -->
<!-- - 评论区 -->
<!-- - 延迟加载的内容 -->
```

### 2.4 client:media

```astro
---
// 媒体查询匹配时hydrate
import MobileMenu from '../components/MobileMenu.jsx'
import DesktopMenu from '../components/DesktopMenu.jsx'
---

<!-- 移动端显示 -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- 桌面端显示 -->
<DesktopMenu client:media="(min-width: 769px)" />

<!-- 适用场景: -->
<!-- - 响应式组件 -->
<!-- - 移动/桌面不同UI -->
<!-- - 条件加载 -->
```

### 2.5 client:only

```astro
---
// 只在客户端渲染
import BrowserOnlyComponent from '../components/BrowserOnly.jsx'
---

<!-- 跳过服务端渲染,只在客户端渲染 -->
<BrowserOnlyComponent client:only="react" />

<!-- 适用场景: -->
<!-- - 依赖浏览器API -->
<!-- - localStorage -->
<!-- - window对象 -->
<!-- - 无法SSR的组件 -->
```

---

## 三、多框架支持

### 3.1 React Islands

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
// src/components/ReactCounter.jsx
import { useState } from 'react'

export default function ReactCounter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>React Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### 3.2 Vue Islands

```bash
npm install @astrojs/vue vue
```

```javascript
// astro.config.mjs
import vue from '@astrojs/vue'

export default defineConfig({
  integrations: [vue()]
})
```

```vue
<!-- src/components/VueCounter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <p>Vue Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>
```

### 3.3 Svelte Islands

```bash
npm install @astrojs/svelte svelte
```

```javascript
// astro.config.mjs
import svelte from '@astrojs/svelte'

export default defineConfig({
  integrations: [svelte()]
})
```

```svelte
<!-- src/components/SvelteCounter.svelte -->
<script>
  let count = 0
</script>

<div>
  <p>Svelte Count: {count}</p>
  <button on:click={() => count++}>
    Increment
  </button>
</div>
```

### 3.4 混合使用

```astro
---
// src/pages/mixed.astro
import Layout from '../layouts/Layout.astro'
import ReactCounter from '../components/ReactCounter.jsx'
import VueCounter from '../components/VueCounter.vue'
import SvelteCounter from '../components/SvelteCounter.svelte'
---

<Layout title="Mixed Frameworks">
  <h1>Multiple Frameworks on One Page</h1>
  
  <!-- 静态内容 -->
  <p>This page uses React, Vue, and Svelte together!</p>
  
  <!-- React Island -->
  <div class="island">
    <h2>React Component</h2>
    <ReactCounter client:load />
  </div>
  
  <!-- Vue Island -->
  <div class="island">
    <h2>Vue Component</h2>
    <VueCounter client:idle />
  </div>
  
  <!-- Svelte Island -->
  <div class="island">
    <h2>Svelte Component</h2>
    <SvelteCounter client:visible />
  </div>
</Layout>

<style>
  .island {
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
  }
</style>
```

---

## 四、实战案例

### 4.1 博客评论系统

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content'
import Layout from '../../layouts/Layout.astro'
import Comments from '../../components/Comments.jsx'

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

<Layout title={post.data.title}>
  <!-- 静态内容 -->
  <article class="blog-post">
    <h1>{post.data.title}</h1>
    <time>{post.data.publishDate.toLocaleDateString()}</time>
    
    <!-- 静态Markdown内容 -->
    <div class="content">
      <Content />
    </div>
  </article>
  
  <!-- 交互式评论组件 - 可见时加载 -->
  <Comments 
    client:visible 
    postId={post.slug}
  />
</Layout>
```

```jsx
// src/components/Comments.jsx
import { useState, useEffect } from 'react'

export default function Comments({ postId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(`/api/comments/${postId}`)
      .then(r => r.json())
      .then(data => {
        setComments(data)
        setLoading(false)
      })
  }, [postId])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const response = await fetch(`/api/comments/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment })
    })
    
    const comment = await response.json()
    setComments([...comments, comment])
    setNewComment('')
  }
  
  if (loading) return <div>Loading comments...</div>
  
  return (
    <div className="comments">
      <h2>Comments ({comments.length})</h2>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Post Comment</button>
      </form>
      
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <strong>{comment.author}</strong>
            <p>{comment.content}</p>
            <time>{new Date(comment.createdAt).toLocaleString()}</time>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4.2 交互式图片画廊

```astro
---
// src/pages/gallery.astro
import Layout from '../layouts/Layout.astro'
import Lightbox from '../components/Lightbox.jsx'

const images = [
  { id: 1, src: '/gallery/1.jpg', alt: 'Image 1' },
  { id: 2, src: '/gallery/2.jpg', alt: 'Image 2' },
  { id: 3, src: '/gallery/3.jpg', alt: 'Image 3' },
  // ... more images
]
---

<Layout title="Gallery">
  <h1>Photo Gallery</h1>
  
  <!-- 静态图片网格 -->
  <div class="gallery-grid">
    {images.map(image => (
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        class="gallery-thumbnail"
      />
    ))}
  </div>
  
  <!-- 交互式Lightbox - 可见时加载 -->
  <Lightbox client:visible images={images} />
</Layout>

<style>
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .gallery-thumbnail {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .gallery-thumbnail:hover {
    transform: scale(1.05);
  }
</style>
```

```jsx
// src/components/Lightbox.jsx
import { useState } from 'react'

export default function Lightbox({ images }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const openLightbox = (index) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }
  
  const closeLightbox = () => {
    setIsOpen(false)
  }
  
  const nextImage = () => {
    setCurrentIndex((currentIndex + 1) % images.length)
  }
  
  const prevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length)
  }
  
  if (!isOpen) return null
  
  return (
    <div className="lightbox-overlay" onClick={closeLightbox}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
        />
        
        <button className="close" onClick={closeLightbox}>×</button>
        <button className="prev" onClick={prevImage}>‹</button>
        <button className="next" onClick={nextImage}>›</button>
        
        <div className="counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}
```

### 4.3 电商产品页面

```astro
---
// src/pages/products/[id].astro
import Layout from '../../layouts/Layout.astro'
import AddToCart from '../../components/AddToCart.jsx'
import ProductReviews from '../../components/ProductReviews.jsx'

export async function getStaticPaths() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())
  
  return products.map(product => ({
    params: { id: product.id },
    props: { product }
  }))
}

const { product } = Astro.props
---

<Layout title={product.name}>
  <!-- 静态内容 - 快速加载 -->
  <div class="product-page">
    <div class="product-images">
      <img src={product.mainImage} alt={product.name} />
    </div>
    
    <div class="product-info">
      <h1>{product.name}</h1>
      <p class="price">${product.price}</p>
      <p class="description">{product.description}</p>
      
      <!-- 交互式添加购物车 - 立即加载 -->
      <AddToCart 
        client:load 
        product={product} 
      />
    </div>
  </div>
  
  <!-- 产品详情 - 静态 -->
  <div class="product-details">
    <h2>Product Details</h2>
    <ul>
      {product.features.map(feature => (
        <li>{feature}</li>
      ))}
    </ul>
  </div>
  
  <!-- 评论 - 可见时加载 -->
  <ProductReviews 
    client:visible 
    productId={product.id} 
  />
</Layout>
```

---

## 五、性能优化

### 5.1 代码分割

```astro
---
// Islands自动代码分割
import HeavyComponent from '../components/HeavyComponent.jsx'
import LightComponent from '../components/LightComponent.jsx'
---

<!-- 每个Island独立打包 -->
<HeavyComponent client:visible />
<LightComponent client:idle />

<!-- 构建输出: -->
<!-- - HeavyComponent.hash.js -->
<!-- - LightComponent.hash.js -->
<!-- 各自独立,按需加载 -->
```

### 5.2 优先级优化

```astro
---
import CriticalInteraction from '../components/CriticalInteraction.jsx'
import SecondaryFeature from '../components/SecondaryFeature.jsx'
import ThirdPartyWidget from '../components/ThirdPartyWidget.jsx'
---

<!-- 关键交互 - 立即加载 -->
<CriticalInteraction client:load />

<!-- 次要功能 - 空闲时加载 -->
<SecondaryFeature client:idle />

<!-- 第三方组件 - 可见时加载 -->
<ThirdPartyWidget client:visible />
```

### 5.3 性能测量

```astro
---
// 测量Islands加载性能
---

<script>
  // 监听组件hydration
  window.addEventListener('astro:page-load', () => {
    console.log('Page loaded')
  })
  
  // 使用Performance API
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Component loaded:', entry)
    }
  })
  
  observer.observe({ entryTypes: ['resource'] })
</script>
```

---

## 六、最佳实践

### 6.1 Islands使用指南

```astro
---
// ✓ 好的做法
// 1. 大部分内容静态
<StaticContent />

// 2. 少量交互Island
<InteractiveWidget client:visible />

// 3. 按需加载
<HeavyComponent client:idle />

// ✗ 不好的做法
// 1. 整页都是Island
<App client:load />

// 2. 过度使用client:load
<Component1 client:load />
<Component2 client:load />
<Component3 client:load />
```

### 6.2 选择合适的指令

| 场景 | 推荐指令 |
|------|---------|
| 关键交互(导航等) | client:load |
| 非关键功能 | client:idle |
| 折叠下方内容 | client:visible |
| 移动/桌面差异 | client:media |
| 浏览器专用 | client:only |

### 6.3 学习资源

1. 官方文档
   - Islands: https://docs.astro.build/en/concepts/islands/
   - Client Directives: https://docs.astro.build/en/reference/directives-reference/#client-directives

2. 文章
   - Islands Architecture (Jason Miller)
   - Partial Hydration

---

## 七、总结

### 7.1 核心概念

1. **Islands架构**: 静态HTML + 交互岛屿
2. **部分hydration**: 只hydrate需要的组件
3. **框架无关**: 支持任何UI框架
4. **性能优先**: 最小的JavaScript
5. **渐进增强**: 无JavaScript也能工作

### 7.2 何时使用Islands

| 适合 | 不适合 |
|------|--------|
| 内容网站 | 高度交互应用 |
| 博客 | 单页应用 |
| 文档站点 | 实时应用 |
| 营销网站 | 复杂表单 |
| 电商产品页 | 仪表板 |

---

## 课后练习

1. 创建混合框架页面
2. 实现交互式评论系统
3. 优化Islands加载策略
4. 测量性能提升
5. 构建高性能网站

通过本课程的学习,你应该能够充分利用Astro Islands架构,构建极快的Web应用!

