# 图片优化 (next/image)

## 课程概述

本课程深入探讨 Next.js 15 中的图片优化。`next/image` 组件提供了自动图片优化、懒加载、响应式图片等功能,大幅提升网页性能和用户体验。

学习目标:
- 理解 next/image 的工作原理
- 掌握 Image 组件的使用
- 学习图片优化配置
- 理解响应式图片
- 掌握图片占位符
- 学习图片加载策略
- 理解远程图片处理
- 构建图片优化的最佳实践

---

## 一、next/image 基础

### 1.1 为什么需要图片优化

```typescript
// 传统 HTML img 标签的问题:
// 1. 不自动优化图片格式
// 2. 不自动调整大小
// 3. 不懒加载
// 4. 累积布局偏移(CLS)
// 5. 加载所有图片,即使不在视口内

// ✗ 传统方式
export default function BadExample() {
  return (
    <div>
      <img
        src="/hero.jpg"
        alt="Hero"
        style={{ width: '100%' }}
      />
    </div>
  )
}

// ✓ Next.js Image 组件
import Image from 'next/image'

export default function GoodExample() {
  return (
    <div>
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority
      />
    </div>
  )
}
```

**next/image 的优势:**

| 优势 | 说明 |
|------|------|
| 自动优化 | 转换为现代格式(WebP, AVIF) |
| 响应式 | 根据设备提供合适大小 |
| 懒加载 | 只加载视口内的图片 |
| 防止CLS | 预留空间,避免布局偏移 |
| 按需生成 | 首次请求时生成优化图片 |
| 缓存 | 自动缓存优化后的图片 |

### 1.2 基本用法

```typescript
// app/page.tsx
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Image Optimization Demo</h1>
      
      {/* 本地图片 - 静态导入 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Local Images</h2>
        <Image
          src="/images/hero.jpg"
          alt="Hero image"
          width={800}
          height={400}
          className="rounded-lg"
        />
      </section>
      
      {/* 远程图片 - 需要配置域名 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Remote Images</h2>
        <Image
          src="https://images.example.com/photo.jpg"
          alt="Remote photo"
          width={800}
          height={400}
          className="rounded-lg"
        />
      </section>
      
      {/* 填充容器 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Fill Container</h2>
        <div className="relative w-full h-96">
          <Image
            src="/images/background.jpg"
            alt="Background"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </section>
    </div>
  )
}
```

### 1.3 配置远程图片域名

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
        port: '',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      }
    ],
    // 或使用旧的 domains 配置(不推荐)
    domains: ['images.example.com', 'cdn.example.com']
  }
}

module.exports = nextConfig
```

---

## 二、Image 组件属性

### 2.1 必需属性

```typescript
import Image from 'next/image'

export default function RequiredProps() {
  return (
    <div className="grid gap-8">
      {/* 1. src, alt, width, height */}
      <Image
        src="/photo.jpg"
        alt="Photo description" // 必需 - 可访问性
        width={600}              // 必需 - 除非使用 fill
        height={400}             // 必需 - 除非使用 fill
      />
      
      {/* 2. 使用 fill 时不需要 width 和 height */}
      <div className="relative w-full h-96">
        <Image
          src="/photo.jpg"
          alt="Photo description"
          fill // 填充父容器
        />
      </div>
    </div>
  )
}
```

### 2.2 可选属性 - 尺寸与布局

```typescript
import Image from 'next/image'

export default function SizeAndLayout() {
  return (
    <div className="space-y-12">
      {/* 固定尺寸 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Fixed Size</h2>
        <Image
          src="/photo.jpg"
          alt="Fixed size"
          width={400}
          height={300}
        />
      </section>
      
      {/* 响应式 - 填充容器 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Fill Container</h2>
        <div className="relative w-full h-96 border">
          <Image
            src="/photo.jpg"
            alt="Fill container"
            fill
            className="object-cover"
          />
        </div>
      </section>
      
      {/* 响应式 - 保持宽高比 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Responsive with Aspect Ratio</h2>
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
          <Image
            src="/photo.jpg"
            alt="Responsive"
            fill
            className="object-cover"
          />
        </div>
      </section>
      
      {/* sizes - 响应式断点 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">With Sizes</h2>
        <Image
          src="/photo.jpg"
          alt="With sizes"
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </section>
    </div>
  )
}
```

### 2.3 可选属性 - 行为

```typescript
import Image from 'next/image'

export default function BehaviorProps() {
  return (
    <div className="space-y-12">
      {/* priority - 首屏图片优先加载 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Priority Loading</h2>
        <Image
          src="/hero.jpg"
          alt="Hero"
          width={1200}
          height={600}
          priority // 关闭懒加载,预加载
        />
      </section>
      
      {/* loading - 懒加载策略 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Lazy Loading</h2>
        <Image
          src="/photo.jpg"
          alt="Lazy loaded"
          width={800}
          height={600}
          loading="lazy" // 默认值
        />
      </section>
      
      {/* quality - 图片质量 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Image Quality</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="mb-2">Quality: 25</p>
            <Image
              src="/photo.jpg"
              alt="Low quality"
              width={300}
              height={200}
              quality={25}
            />
          </div>
          <div>
            <p className="mb-2">Quality: 75 (default)</p>
            <Image
              src="/photo.jpg"
              alt="Default quality"
              width={300}
              height={200}
              quality={75}
            />
          </div>
          <div>
            <p className="mb-2">Quality: 100</p>
            <Image
              src="/photo.jpg"
              alt="High quality"
              width={300}
              height={200}
              quality={100}
            />
          </div>
        </div>
      </section>
      
      {/* unoptimized - 跳过优化 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Unoptimized</h2>
        <Image
          src="/photo.jpg"
          alt="Unoptimized"
          width={400}
          height={300}
          unoptimized // 跳过图片优化
        />
      </section>
    </div>
  )
}
```

### 2.4 可选属性 - 样式

```typescript
import Image from 'next/image'

export default function StyleProps() {
  return (
    <div className="space-y-12">
      {/* className - Tailwind CSS */}
      <section>
        <h2 className="text-2xl font-bold mb-4">With Tailwind</h2>
        <Image
          src="/photo.jpg"
          alt="Styled with Tailwind"
          width={400}
          height={300}
          className="rounded-lg shadow-xl hover:scale-105 transition"
        />
      </section>
      
      {/* style - 内联样式 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Inline Styles</h2>
        <Image
          src="/photo.jpg"
          alt="Inline styled"
          width={400}
          height={300}
          style={{ borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        />
      </section>
      
      {/* objectFit - 对象适配 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Object Fit</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="relative w-full h-64 border">
            <p className="absolute top-2 left-2 bg-white px-2 z-10">cover</p>
            <Image
              src="/photo.jpg"
              alt="Object cover"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-full h-64 border">
            <p className="absolute top-2 left-2 bg-white px-2 z-10">contain</p>
            <Image
              src="/photo.jpg"
              alt="Object contain"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative w-full h-64 border">
            <p className="absolute top-2 left-2 bg-white px-2 z-10">fill</p>
            <Image
              src="/photo.jpg"
              alt="Object fill"
              fill
              className="object-fill"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

## 三、响应式图片

### 3.1 sizes 属性详解

```typescript
import Image from 'next/image'

export default function ResponsiveImages() {
  return (
    <div className="space-y-12">
      {/* 基础响应式 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Basic Responsive</h2>
        <Image
          src="/photo.jpg"
          alt="Responsive"
          width={1200}
          height={800}
          sizes="100vw"
          // 浏览器会选择合适的尺寸:
          // 生成: /photo.jpg?w=640, /photo.jpg?w=750, /photo.jpg?w=828...
        />
      </section>
      
      {/* 媒体查询断点 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">With Breakpoints</h2>
        <Image
          src="/photo.jpg"
          alt="With breakpoints"
          width={1200}
          height={800}
          sizes="(max-width: 640px) 100vw, 
                 (max-width: 1024px) 50vw, 
                 33vw"
          // 移动端: 100% 视口宽度
          // 平板: 50% 视口宽度
          // 桌面: 33% 视口宽度
        />
      </section>
      
      {/* 网格布局 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Grid Layout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Image
              key={i}
              src={`/photo-${i}.jpg`}
              alt={`Photo ${i}`}
              width={400}
              height={300}
              sizes="(max-width: 768px) 100vw, 
                     (max-width: 1024px) 50vw, 
                     33vw"
            />
          ))}
        </div>
      </section>
      
      {/* Hero 图片 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Hero Image</h2>
        <div className="relative w-full h-[60vh]">
          <Image
            src="/hero.jpg"
            alt="Hero"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>
    </div>
  )
}
```

### 3.2 艺术指导 (Art Direction)

```typescript
// 不同屏幕显示不同裁剪的图片
import Image from 'next/image'

export default function ArtDirection() {
  return (
    <div className="space-y-12">
      {/* 方法1: 使用 CSS 隐藏/显示 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">CSS Art Direction</h2>
        
        {/* 移动端 - 竖版 */}
        <div className="md:hidden">
          <Image
            src="/hero-portrait.jpg"
            alt="Hero"
            width={480}
            height={800}
            priority
          />
        </div>
        
        {/* 桌面端 - 横版 */}
        <div className="hidden md:block">
          <Image
            src="/hero-landscape.jpg"
            alt="Hero"
            width={1200}
            height={600}
            priority
          />
        </div>
      </section>
      
      {/* 方法2: 使用 picture 标签 (需要禁用优化) */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Picture Element</h2>
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/hero-mobile.jpg"
          />
          <source
            media="(min-width: 769px)"
            srcSet="/hero-desktop.jpg"
          />
          <img src="/hero-desktop.jpg" alt="Hero" />
        </picture>
      </section>
    </div>
  )
}
```

### 3.3 动态尺寸

```typescript
'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function DynamicSizes() {
  const [windowWidth, setWindowWidth] = useState(0)
  
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // 根据屏幕宽度计算图片尺寸
  const imageWidth = windowWidth > 1024 ? 800 : 
                     windowWidth > 768 ? 600 : 
                     400
  
  const imageHeight = Math.round(imageWidth * 0.75)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Dynamic Image Sizes</h1>
      
      <p className="mb-4">Window width: {windowWidth}px</p>
      <p className="mb-4">Image size: {imageWidth}x{imageHeight}px</p>
      
      {windowWidth > 0 && (
        <Image
          src="/photo.jpg"
          alt="Dynamic size"
          width={imageWidth}
          height={imageHeight}
          className="mx-auto"
        />
      )}
    </div>
  )
}
```

---

## 四、占位符与加载状态

### 4.1 Blur 占位符

```typescript
import Image from 'next/image'

export default function BlurPlaceholder() {
  return (
    <div className="space-y-12">
      {/* 自动生成模糊占位符 (本地图片) */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Auto Blur</h2>
        <Image
          src="/photo.jpg"
          alt="Auto blur"
          width={800}
          height={600}
          placeholder="blur"
          // Next.js 自动生成 base64 模糊图
        />
      </section>
      
      {/* 自定义模糊占位符 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Custom Blur</h2>
        <Image
          src="https://images.example.com/photo.jpg"
          alt="Custom blur"
          width={800}
          height={600}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AlVVVVp7Q"
        />
      </section>
      
      {/* 空占位符 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Empty Placeholder</h2>
        <Image
          src="/photo.jpg"
          alt="Empty placeholder"
          width={800}
          height={600}
          placeholder="empty"
          // 无占位符,直接加载
        />
      </section>
    </div>
  )
}
```

### 4.2 生成模糊占位符

```typescript
// lib/blur-placeholder.ts
import { getPlaiceholder } from 'plaiceholder'

export async function getBlurDataURL(src: string): Promise<string> {
  try {
    const buffer = await fetch(src).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    )
    
    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch (error) {
    console.error('Failed to generate blur placeholder:', error)
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' // fallback
  }
}

// app/gallery/page.tsx
import Image from 'next/image'
import { getBlurDataURL } from '@/lib/blur-placeholder'

interface Photo {
  id: string
  url: string
  alt: string
}

async function getPhotos(): Promise<Photo[]> {
  const res = await fetch('https://api.example.com/photos')
  return res.json()
}

export default async function GalleryPage() {
  const photos = await getPhotos()
  
  // 为每张图片生成模糊占位符
  const photosWithBlur = await Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      blurDataURL: await getBlurDataURL(photo.url)
    }))
  )
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Gallery</h1>
      
      <div className="grid grid-cols-3 gap-4">
        {photosWithBlur.map(photo => (
          <Image
            key={photo.id}
            src={photo.url}
            alt={photo.alt}
            width={400}
            height={300}
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
          />
        ))}
      </div>
    </div>
  )
}
```

### 4.3 加载动画

```typescript
'use client'
import Image from 'next/image'
import { useState } from 'react'

export default function LoadingAnimation() {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="space-y-12">
      {/* 淡入效果 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Fade In</h2>
        <div className="relative">
          <Image
            src="/photo.jpg"
            alt="Fade in"
            width={800}
            height={600}
            className={`transition-opacity duration-500 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </section>
      
      {/* 骨架屏 */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Skeleton</h2>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
          )}
          <Image
            src="/photo.jpg"
            alt="With skeleton"
            width={800}
            height={600}
            className="rounded-lg"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </section>
    </div>
  )
}

// 可复用的加载组件
export function ImageWithLoader({ src, alt, ...props }: any) {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        {...props}
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  )
}
```

---

## 五、图片优化配置

### 5.1 next.config.js 配置

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 允许的远程图片域名
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
        port: '',
        pathname: '/**',
      }
    ],
    
    // 图片设备尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // 图片断点尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 支持的图片格式
    formats: ['image/webp', 'image/avif'],
    
    // 最小缓存时间 (秒)
    minimumCacheTTL: 60,
    
    // 禁用静态导入
    disableStaticImages: false,
    
    // 危险允许 SVG
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 自定义 loader
    loader: 'default', // 'default' | 'imgix' | 'cloudinary' | 'akamai' | 'custom'
    path: '/_next/image',
    
    // 不优化的路径
    unoptimized: false
  }
}

module.exports = nextConfig
```

### 5.2 自定义 Loader

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  }
}

module.exports = nextConfig

// lib/image-loader.ts
export default function customLoader({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) {
  // Cloudinary 示例
  return `https://res.cloudinary.com/demo/image/upload/w_${width},q_${quality || 75}/${src}`
  
  // Imgix 示例
  // return `https://example.imgix.net${src}?w=${width}&q=${quality || 75}`
  
  // 自定义 CDN
  // return `https://cdn.example.com${src}?w=${width}&q=${quality || 75}`
}

// 使用
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/photo.jpg"
      alt="Photo"
      width={800}
      height={600}
      // 会调用自定义 loader
    />
  )
}
```

### 5.3 图片格式优化

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 优先使用现代格式
    formats: ['image/avif', 'image/webp'],
    
    // 为不同场景设置不同质量
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
}

// 浏览器会自动选择支持的格式:
// 1. 如果支持 AVIF → 使用 AVIF (最小文件)
// 2. 如果支持 WebP → 使用 WebP (较小文件)
// 3. 否则 → 使用原格式 (JPEG/PNG)
```

---

## 六、实战案例

### 6.1 图片画廊

```typescript
// app/gallery/page.tsx
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  title: string
  width: number
  height: number
}

async function getPhotos(): Promise<Photo[]> {
  const res = await fetch('https://api.example.com/photos')
  return res.json()
}

export default async function GalleryPage() {
  const photos = await getPhotos()
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Photo Gallery</h1>
      
      {/* Masonry 布局 */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
        {photos.map(photo => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <Image
              src={photo.url}
              alt={photo.title}
              width={photo.width}
              height={photo.height}
              className="rounded-lg hover:scale-105 transition"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <p className="mt-2 text-center text-gray-600">{photo.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// components/lightbox.tsx
'use client'
import Image from 'next/image'
import { useState } from 'react'

export function PhotoGalleryWithLightbox({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map(photo => (
          <button
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={photo.url}
              alt={photo.title}
              fill
              className="object-cover hover:scale-110 transition"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>
      
      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-7xl max-h-screen p-4">
            <Image
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              width={selectedPhoto.width}
              height={selectedPhoto.height}
              className="max-w-full max-h-screen object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white text-4xl"
              onClick={() => setSelectedPhoto(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

### 6.2 产品图片展示

```typescript
// app/products/[id]/page.tsx
'use client'
import Image from 'next/image'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

export default function ProductPage({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  
  return (
    <div className="container mx-auto p-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 图片展示 */}
        <div>
          {/* 主图 */}
          <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* 缩略图 */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded border-2 ${
                  selectedImage === index
                    ? 'border-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* 产品信息 */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            ${product.price.toFixed(2)}
          </p>
          <button className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 6.3 用户头像

```typescript
// components/avatar.tsx
import Image from 'next/image'

interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96
}

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const dimension = sizeMap[size]
  
  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gray-200 ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${dimension}px`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

// 使用
export default function UserCard() {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <Avatar
          src="https://api.example.com/avatar/john.jpg"
          alt="John Doe"
          size="lg"
        />
        <div>
          <div className="font-semibold">John Doe</div>
          <div className="text-gray-600">john@example.com</div>
        </div>
      </div>
    </div>
  )
}
```

### 6.4 背景图片

```typescript
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative h-screen">
      {/* 背景图片 */}
      <Image
        src="/hero-background.jpg"
        alt="Hero background"
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={90}
      />
      
      {/* 叠加层 */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* 内容 */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome</h1>
          <p className="text-2xl mb-8">Discover amazing content</p>
          <button className="px-8 py-4 bg-blue-500 rounded-lg hover:bg-blue-600">
            Get Started
          </button>
        </div>
      </div>
    </section>
  )
}
```

---

## 七、性能优化

### 7.1 优先加载策略

```typescript
import Image from 'next/image'

export default function PerformanceOptimized() {
  return (
    <div>
      {/* 首屏关键图片 - 优先加载 */}
      <Image
        src="/hero.jpg"
        alt="Hero"
        width={1200}
        height={600}
        priority // 禁用懒加载
      />
      
      {/* 首屏其他图片 - 正常加载 */}
      <Image
        src="/feature-1.jpg"
        alt="Feature 1"
        width={400}
        height={300}
      />
      
      {/* 折叠下方图片 - 懒加载 */}
      <Image
        src="/feature-2.jpg"
        alt="Feature 2"
        width={400}
        height={300}
        loading="lazy" // 默认值
      />
    </div>
  )
}
```

### 7.2 预加载关键图片

```typescript
// app/layout.tsx
import { ImageResponse } from 'next/og'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* 预加载关键图片 */}
        <link
          rel="preload"
          as="image"
          href="/hero.jpg"
          imageSrcSet="/hero.jpg?w=640 640w, /hero.jpg?w=1200 1200w"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 7.3 图片质量平衡

```typescript
import Image from 'next/image'

export default function QualityBalance() {
  return (
    <div className="grid gap-8">
      {/* 高质量 - 大型展示图 */}
      <Image
        src="/showcase.jpg"
        alt="Showcase"
        width={1200}
        height={800}
        quality={90}
      />
      
      {/* 标准质量 - 常规图片 */}
      <Image
        src="/photo.jpg"
        alt="Photo"
        width={800}
        height={600}
        quality={75} // 默认值
      />
      
      {/* 低质量 - 缩略图 */}
      <Image
        src="/thumbnail.jpg"
        alt="Thumbnail"
        width={200}
        height={150}
        quality={60}
      />
    </div>
  )
}
```

---

## 八、常见问题与解决

### 8.1 图片闪烁

```typescript
// 问题: 图片加载时闪烁
// 解决: 使用 placeholder

import Image from 'next/image'

export default function NoFlicker() {
  return (
    <Image
      src="/photo.jpg"
      alt="No flicker"
      width={800}
      height={600}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### 8.2 布局偏移

```typescript
// 问题: 图片加载导致布局跳动 (CLS)
// 解决: 始终指定尺寸

// ✗ 错误
<img src="/photo.jpg" alt="Bad" />

// ✓ 正确
<Image
  src="/photo.jpg"
  alt="Good"
  width={800}
  height={600}
/>

// 或使用 fill
<div className="relative w-full h-96">
  <Image
    src="/photo.jpg"
    alt="Good"
    fill
  />
</div>
```

### 8.3 远程图片错误

```typescript
// 问题: 远程图片无法加载
// 原因: 未配置域名

// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.example.com',
      }
    ]
  }
}

// 错误处理
'use client'
import Image from 'next/image'
import { useState } from 'react'

export function ImageWithFallback({ src, fallback = '/placeholder.jpg', ...props }: any) {
  const [imgSrc, setImgSrc] = useState(src)
  
  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallback)}
    />
  )
}
```

---

## 九、最佳实践

### 9.1 图片命名与组织

```
public/
  images/
    hero/
      desktop.jpg
      mobile.jpg
    products/
      product-1.jpg
      product-2.jpg
    avatars/
      default.jpg
    icons/
      logo.svg
```

### 9.2 性能检查清单

```typescript
// ✓ 使用 next/image 而非 <img>
// ✓ 为首屏图片设置 priority
// ✓ 使用合适的 sizes 属性
// ✓ 使用 placeholder="blur"
// ✓ 优化图片质量 (75-90)
// ✓ 使用现代格式 (WebP, AVIF)
// ✓ 配置适当的 deviceSizes
// ✓ 实现错误处理
// ✓ 监控图片性能指标
```

### 9.3 学习资源

1. 官方文档
   - next/image: https://nextjs.org/docs/app/api-reference/components/image
   - Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images

2. 性能工具
   - Lighthouse
   - WebPageTest
   - Chrome DevTools

---

## 课后练习

1. 创建一个响应式图片画廊
2. 实现产品图片缩放功能
3. 优化现有网站的图片
4. 构建自定义图片 loader
5. 实现图片懒加载最佳实践

通过本课程的学习,你应该能够熟练使用 Next.js 的图片优化功能,显著提升网站性能和用户体验!

