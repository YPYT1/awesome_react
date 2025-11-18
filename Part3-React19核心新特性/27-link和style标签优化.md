# link和style标签优化

## 学习目标

通过本章学习，你将掌握：

- `<link>`标签的动态使用
- 外部资源加载优化
- 动态样式表管理
- 预加载和预连接
- 字体优化加载
- `<style>`标签的使用
- CSS-in-JS集成
- 性能优化技巧

## 第一部分：动态link标签

### 1.1 基础link标签

```jsx
export default function MyPage() {
  return (
    <>
      <title>我的页面</title>
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://example.com/page" />
      
      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      
      {/* 多语言版本 */}
      <link rel="alternate" hrefLang="en" href="https://example.com/en" />
      <link rel="alternate" hrefLang="zh" href="https://example.com/zh" />
      
      <div>页面内容</div>
    </>
  );
}
```

### 1.2 条件加载样式表

```jsx
'use client';

import { useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  
  return (
    <>
      {theme === 'light' && (
        <link rel="stylesheet" href="/themes/light.css" />
      )}
      
      {theme === 'dark' && (
        <link rel="stylesheet" href="/themes/dark.css" />
      )}
      
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换到 {theme === 'light' ? '暗色' : '亮色'} 主题
      </button>
    </>
  );
}
```

### 1.3 动态字体加载

```jsx
export default function ArticlePage({ article }) {
  // 根据语言加载不同字体
  const fontUrl = article.lang === 'zh'
    ? 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap'
    : 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';
  
  return (
    <>
      <title>{article.title}</title>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontUrl} />
      
      <article style={{ fontFamily: article.lang === 'zh' ? 'Noto Sans SC' : 'Roboto' }}>
        <h1>{article.title}</h1>
        <p>{article.content}</p>
      </article>
    </>
  );
}
```

### 1.4 条件预加载

```jsx
export default function ProductPage({ product, relatedProducts }) {
  return (
    <>
      <title>{product.name}</title>
      
      {/* 预加载关键资源 */}
      <link rel="preload" href={product.image} as="image" />
      
      {/* 预加载相关产品图片 */}
      {relatedProducts.slice(0, 3).map(p => (
        <link 
          key={p.id} 
          rel="prefetch" 
          href={p.image} 
          as="image" 
        />
      ))}
      
      <div className="product">
        <img src={product.image} alt={product.name} />
        <h1>{product.name}</h1>
        
        <div className="related">
          <h2>相关产品</h2>
          {relatedProducts.map(p => (
            <a key={p.id} href={`/products/${p.id}`}>
              <img src={p.image} alt={p.name} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
```

### 1.5 响应式样式表加载

```jsx
export default function ResponsiveStyles() {
  return (
    <>
      <title>响应式样式</title>
      
      {/* 基础样式 */}
      <link rel="stylesheet" href="/base.css" />
      
      {/* 移动端样式 - 只在移动设备加载 */}
      <link 
        rel="stylesheet" 
        href="/mobile.css" 
        media="screen and (max-width: 767px)" 
      />
      
      {/* 平板样式 */}
      <link 
        rel="stylesheet" 
        href="/tablet.css" 
        media="screen and (min-width: 768px) and (max-width: 1023px)" 
      />
      
      {/* 桌面样式 */}
      <link 
        rel="stylesheet" 
        href="/desktop.css" 
        media="screen and (min-width: 1024px)" 
      />
      
      {/* 高DPI屏幕 */}
      <link 
        rel="stylesheet" 
        href="/retina.css" 
        media="(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)" 
      />
      
      {/* 打印样式 */}
      <link rel="stylesheet" href="/print.css" media="print" />
      
      {/* 深色模式 */}
      <link 
        rel="stylesheet" 
        href="/dark-mode.css" 
        media="(prefers-color-scheme: dark)" 
      />
      
      <div className="content">
        <h1>响应式页面</h1>
        <p>样式根据设备和用户偏好自动调整</p>
      </div>
    </>
  );
}
```

### 1.6 动态manifest和PWA配置

```jsx
export default function PWAConfig({ appName, themeColor }) {
  return (
    <>
      <title>{appName}</title>
      
      {/* PWA Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* iOS Meta Tags */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png" />
      
      {/* Android Chrome */}
      <meta name="theme-color" content={themeColor} />
      <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512.png" />
      
      {/* Safari Pinned Tab */}
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color={themeColor} />
      
      {/* Windows Tile */}
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      <div>
        <h1>{appName}</h1>
        <p>支持PWA安装</p>
      </div>
    </>
  );
}
```

### 1.7 SEO相关link标签

```jsx
export default function SEOLinks({ canonical, prevPage, nextPage, ampUrl }) {
  return (
    <>
      <title>SEO优化页面</title>
      
      {/* Canonical URL - 指定主要版本 */}
      <link rel="canonical" href={canonical} />
      
      {/* 分页导航 */}
      {prevPage && <link rel="prev" href={prevPage} />}
      {nextPage && <link rel="next" href={nextPage} />}
      
      {/* AMP版本 */}
      {ampUrl && <link rel="amphtml" href={ampUrl} />}
      
      {/* 多语言版本 */}
      <link rel="alternate" hrefLang="en" href="https://example.com/en/page" />
      <link rel="alternate" hrefLang="zh-CN" href="https://example.com/zh-cn/page" />
      <link rel="alternate" hrefLang="zh-TW" href="https://example.com/zh-tw/page" />
      <link rel="alternate" hrefLang="ja" href="https://example.com/ja/page" />
      <link rel="alternate" hrefLang="x-default" href="https://example.com/page" />
      
      {/* RSS/Atom Feed */}
      <link 
        rel="alternate" 
        type="application/rss+xml" 
        title="RSS Feed" 
        href="/feed.xml" 
      />
      <link 
        rel="alternate" 
        type="application/atom+xml" 
        title="Atom Feed" 
        href="/atom.xml" 
      />
      
      {/* JSON Feed */}
      <link 
        rel="alternate" 
        type="application/json" 
        title="JSON Feed" 
        href="/feed.json" 
      />
      
      {/* 搜索引擎 */}
      <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="Search" />
      
      <article>
        <h1>文章内容</h1>
        <p>完整的SEO优化配置</p>
      </article>
    </>
  );
}
```

### 1.8 安全策略和CORS

```jsx
export default function SecurityHeaders() {
  return (
    <>
      <title>安全配置</title>
      
      {/* CORS预检 */}
      <link rel="preconnect" href="https://api.example.com" crossOrigin="use-credentials" />
      
      {/* DNS Prefetch with CORS */}
      <link rel="dns-prefetch" href="https://secure-api.example.com" />
      
      {/* 资源完整性校验 */}
      <link 
        rel="stylesheet" 
        href="https://cdn.example.com/style.css"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossOrigin="anonymous"
      />
      
      {/* 预加载字体 - CORS必需 */}
      <link
        rel="preload"
        href="https://fonts.gstatic.com/s/roboto/v30/font.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* CSP策略 - 通过meta标签 */}
      <meta 
        httpEquiv="Content-Security-Policy" 
        content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
      />
      
      <div>
        <h1>安全配置示例</h1>
        <p>包含CORS、SRI和CSP设置</p>
      </div>
    </>
  );
}
```

## 第二部分：资源预加载优化

### 2.1 preconnect - 预连接

```jsx
export default function MediaGallery() {
  return (
    <>
      <title>图片库</title>
      
      {/* 预连接到CDN */}
      <link rel="preconnect" href="https://cdn.example.com" />
      <link rel="preconnect" href="https://images.example.com" />
      
      {/* 预连接到第三方服务 */}
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      <div className="gallery">
        {/* 图片会从已建立连接的CDN加载，更快 */}
        <img src="https://cdn.example.com/image1.jpg" alt="Image 1" />
        <img src="https://cdn.example.com/image2.jpg" alt="Image 2" />
      </div>
    </>
  );
}
```

### 2.2 dns-prefetch - DNS预解析

```jsx
export default function ExternalResourcesPage() {
  return (
    <>
      <title>外部资源页面</title>
      
      {/* DNS预解析 - 轻量级优化 */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://api.example.com" />
      
      <div>
        {/* 使用预解析的域名 */}
        <script src="https://www.googletagmanager.com/gtag.js" async />
      </div>
    </>
  );
}
```

### 2.3 preload - 预加载关键资源

```jsx
export default function VideoPage({ video }) {
  return (
    <>
      <title>{video.title}</title>
      
      {/* 预加载关键资源 */}
      <link rel="preload" href={video.posterImage} as="image" />
      <link rel="preload" href={video.subtitles} as="fetch" crossOrigin="anonymous" />
      
      {/* 预加载字体 */}
      <link 
        rel="preload" 
        href="/fonts/custom-font.woff2" 
        as="font" 
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* 预加载关键CSS */}
      <link rel="preload" href="/critical.css" as="style" />
      <link rel="stylesheet" href="/critical.css" />
      
      <div className="video-container">
        <video 
          poster={video.posterImage}
          controls
        >
          <source src={video.url} type="video/mp4" />
          <track 
            src={video.subtitles} 
            kind="subtitles" 
            srcLang="zh" 
            label="中文" 
          />
        </video>
      </div>
    </>
  );
}
```

### 2.4 prefetch - 预获取下一页资源

```jsx
export default function ArticleWithPagination({ article, nextArticle }) {
  return (
    <>
      <title>{article.title}</title>
      
      {/* 预获取下一篇文章的资源 */}
      {nextArticle && (
        <>
          <link 
            rel="prefetch" 
            href={`/api/articles/${nextArticle.id}`} 
            as="fetch" 
          />
          <link 
            rel="prefetch" 
            href={nextArticle.coverImage} 
            as="image" 
          />
        </>
      )}
      
      <article>
        <h1>{article.title}</h1>
        <p>{article.content}</p>
        
        {nextArticle && (
          <a href={`/articles/${nextArticle.id}`}>
            下一篇：{nextArticle.title}
          </a>
        )}
      </article>
    </>
  );
}
```

### 2.5 modulepreload - 模块预加载

```jsx
export default function ModulePreloading() {
  return (
    <>
      <title>ES模块预加载</title>
      
      {/* 预加载关键JS模块 */}
      <link rel="modulepreload" href="/js/main.js" />
      <link rel="modulepreload" href="/js/utils.js" />
      
      {/* 预加载动态导入的模块 */}
      <link rel="modulepreload" href="/js/chart-library.js" />
      
      {/* 预加载依赖模块 */}
      <link rel="modulepreload" href="/js/react-dom.production.min.js" />
      
      <div>
        <h1>模块预加载优化</h1>
        <p>加速ES模块的加载速度</p>
      </div>
    </>
  );
}
```

### 2.6 智能预加载策略

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function IntelligentPreloading() {
  const [connectionType, setConnectionType] = useState('4g');
  
  useEffect(() => {
    // 检测网络连接类型
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      setConnectionType(conn.effectiveType || '4g');
    }
  }, []);
  
  // 根据网络状况决定预加载策略
  const shouldPreload = connectionType === '4g' || connectionType === 'wifi';
  
  return (
    <>
      <title>智能预加载</title>
      
      {/* 关键资源 - 始终预加载 */}
      <link rel="preload" href="/critical.css" as="style" />
      
      {/* 非关键资源 - 仅在良好网络下预加载 */}
      {shouldPreload && (
        <>
          <link rel="prefetch" href="/hero-image.jpg" as="image" />
          <link rel="prefetch" href="/video-background.mp4" as="video" />
          <link rel="preload" href="/analytics.js" as="script" />
        </>
      )}
      
      {/* 慢速网络下只加载必需资源 */}
      {!shouldPreload && (
        <link rel="stylesheet" href="/minimal.css" />
      )}
      
      <div>
        <h1>智能预加载</h1>
        <p>当前连接: {connectionType}</p>
        <p>预加载状态: {shouldPreload ? '开启' : '关闭'}</p>
      </div>
    </>
  );
}
```

### 2.7 资源优先级控制

```jsx
export default function ResourcePriority() {
  return (
    <>
      <title>资源优先级</title>
      
      {/* 高优先级 - 关键首屏资源 */}
      <link rel="preload" href="/hero-image.jpg" as="image" fetchpriority="high" />
      <link rel="preload" href="/critical.css" as="style" fetchpriority="high" />
      
      {/* 正常优先级 - 普通资源 */}
      <link rel="preload" href="/logo.svg" as="image" />
      <link rel="preload" href="/main.js" as="script" />
      
      {/* 低优先级 - 次要资源 */}
      <link rel="prefetch" href="/footer-image.jpg" as="image" fetchpriority="low" />
      <link rel="prefetch" href="/analytics.js" as="script" fetchpriority="low" />
      
      {/* 预连接优先级 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      <div>
        <img src="/hero-image.jpg" alt="Hero" fetchpriority="high" />
        <img src="/footer-image.jpg" alt="Footer" loading="lazy" fetchpriority="low" />
      </div>
    </>
  );
}
```

### 2.8 实战案例：电商产品页优化

```jsx
export default async function OptimizedProductPage({ productId }) {
  // 服务器端获取数据
  const product = await fetchProduct(productId);
  const relatedProducts = await fetchRelatedProducts(productId);
  const reviews = await fetchReviews(productId);
  
  return (
    <>
      <title>{product.name} - 在线商城</title>
      
      {/* ========== 关键资源 - 立即加载 ========== */}
      
      {/* 预连接到CDN */}
      <link rel="preconnect" href="https://cdn.example.com" />
      <link rel="preconnect" href="https://images.example.com" />
      
      {/* 预加载主图片 - 高优先级 */}
      <link 
        rel="preload" 
        href={product.mainImage} 
        as="image" 
        fetchpriority="high"
      />
      
      {/* 预加载关键CSS */}
      <link rel="preload" href="/product.css" as="style" />
      <link rel="stylesheet" href="/product.css" />
      
      {/* 预加载字体 */}
      <link
        rel="preload"
        href="/fonts/product-font.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* ========== 次要资源 - 预获取 ========== */}
      
      {/* 预获取产品图库 */}
      {product.gallery?.slice(0, 3).map((img, idx) => (
        <link 
          key={idx} 
          rel="prefetch" 
          href={img.url} 
          as="image"
        />
      ))}
      
      {/* 预获取相关产品 */}
      {relatedProducts.slice(0, 2).map(p => (
        <link 
          key={p.id} 
          rel="prefetch" 
          href={`/api/products/${p.id}`} 
          as="fetch"
        />
      ))}
      
      {/* ========== 第三方服务 ========== */}
      
      {/* 预连接到支付服务 */}
      <link rel="preconnect" href="https://checkout.stripe.com" />
      
      {/* DNS预解析分析服务 */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* ========== SEO优化 ========== */}
      
      <link rel="canonical" href={`https://example.com/products/${productId}`} />
      
      <div className="product-page">
        <div className="product-gallery">
          <img 
            src={product.mainImage} 
            alt={product.name}
            fetchpriority="high"
          />
        </div>
        
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">{product.price}</p>
          <button>立即购买</button>
        </div>
        
        <div className="related-products">
          <h2>相关产品</h2>
          {/* 相关产品列表 */}
        </div>
      </div>
    </>
  );
}

async function fetchProduct(id: string) {
  // 实现产品数据获取
  return {
    name: '示例产品',
    mainImage: 'https://cdn.example.com/product.jpg',
    gallery: [],
    price: '¥99.00'
  };
}

async function fetchRelatedProducts(id: string) {
  return [];
}

async function fetchReviews(id: string) {
  return [];
}
```

## 第三部分：字体优化

### 3.1 Google Fonts优化

```jsx
export default function OptimizedFonts() {
  return (
    <>
      <title>字体优化示例</title>
      
      {/* 步骤1：预连接 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link 
        rel="preconnect" 
        href="https://fonts.gstatic.com" 
        crossOrigin="anonymous" 
      />
      
      {/* 步骤2：预加载关键字体 */}
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
      />
      
      {/* 步骤3：加载字体（异步） */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
        media="print"
        onLoad="this.media='all'"
      />
      
      {/* 无JS时的备用 */}
      <noscript>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
        />
      </noscript>
      
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <h1>优化的字体加载</h1>
        <p>这段文字使用Inter字体</p>
      </div>
    </>
  );
}
```

### 3.2 自托管字体

```jsx
export default function SelfHostedFonts() {
  return (
    <>
      <title>自托管字体</title>
      
      {/* 预加载字体文件 */}
      <link
        rel="preload"
        href="/fonts/custom-regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/custom-bold.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* 定义@font-face */}
      <style>{`
        @font-face {
          font-family: 'CustomFont';
          src: url('/fonts/custom-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'CustomFont';
          src: url('/fonts/custom-bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
      `}</style>
      
      <div style={{ fontFamily: 'CustomFont, sans-serif' }}>
        <h1>自托管字体</h1>
        <p>这段文字使用自托管的CustomFont</p>
      </div>
    </>
  );
}
```

### 3.3 可变字体

```jsx
export default function VariableFont() {
  return (
    <>
      <title>可变字体示例</title>
      
      <link
        rel="preload"
        href="/fonts/variable-font.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      <style>{`
        @font-face {
          font-family: 'VariableFont';
          src: url('/fonts/variable-font.woff2') format('woff2-variations');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        
        .light { font-weight: 300; }
        .regular { font-weight: 400; }
        .bold { font-weight: 700; }
        .extra-bold { font-weight: 900; }
      `}</style>
      
      <div style={{ fontFamily: 'VariableFont, sans-serif' }}>
        <p className="light">Light Weight (300)</p>
        <p className="regular">Regular Weight (400)</p>
        <p className="bold">Bold Weight (700)</p>
        <p className="extra-bold">Extra Bold Weight (900)</p>
      </div>
    </>
  );
}
```

### 3.4 字体子集优化

```jsx
export default function FontSubsetting() {
  return (
    <>
      <title>字体子集优化</title>
      
      {/* 中文字体 - 仅加载常用字 */}
      <link
        rel="preload"
        href="/fonts/noto-sans-sc-subset.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* 英文字体 - 完整字符集 */}
      <link
        rel="preload"
        href="/fonts/inter-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      <style>{`
        /* Unicode-range 指定字符范围 */
        @font-face {
          font-family: 'NotoSansSC';
          src: url('/fonts/noto-sans-sc-subset.woff2') format('woff2');
          unicode-range: U+4E00-9FFF; /* 常用汉字 */
          font-weight: 400;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'Inter';
          src: url('/fonts/inter-latin.woff2') format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153; /* Latin */
          font-weight: 400;
          font-display: swap;
        }
      `}</style>
      
      <div>
        <h1 style={{ fontFamily: 'NotoSansSC, Inter, sans-serif' }}>
          中英混合字体 Mixed Font
        </h1>
      </div>
    </>
  );
}
```

### 3.5 字体加载策略对比

```jsx
export default function FontLoadingStrategies() {
  return (
    <>
      <title>字体加载策略</title>
      
      <style>{`
        /* 策略1: font-display: swap - 立即显示备用字体 */
        @font-face {
          font-family: 'SwapFont';
          src: url('/fonts/swap.woff2') format('woff2');
          font-display: swap; /* 推荐 */
        }
        
        /* 策略2: font-display: block - 短暂阻塞 */
        @font-face {
          font-family: 'BlockFont';
          src: url('/fonts/block.woff2') format('woff2');
          font-display: block; /* 最多阻塞3秒 */
        }
        
        /* 策略3: font-display: fallback - 极短阻塞 */
        @font-face {
          font-family: 'FallbackFont';
          src: url('/fonts/fallback.woff2') format('woff2');
          font-display: fallback; /* 100ms阻塞期 */
        }
        
        /* 策略4: font-display: optional - 完全可选 */
        @font-face {
          font-family: 'OptionalFont';
          src: url('/fonts/optional.woff2') format('woff2');
          font-display: optional; /* 快速网络才加载 */
        }
        
        .demo-swap { font-family: 'SwapFont', sans-serif; }
        .demo-block { font-family: 'BlockFont', sans-serif; }
        .demo-fallback { font-family: 'FallbackFont', sans-serif; }
        .demo-optional { font-family: 'OptionalFont', sans-serif; }
      `}</style>
      
      <div>
        <h2>字体加载策略对比</h2>
        
        <div className="demo-swap">
          <h3>Swap策略</h3>
          <p>立即显示备用字体，自定义字体加载后替换</p>
          <p>优点：无闪烁，用户体验好</p>
          <p>缺点：可能看到FOUT（样式闪烁）</p>
        </div>
        
        <div className="demo-block">
          <h3>Block策略</h3>
          <p>短暂阻塞渲染（最多3秒），等待字体加载</p>
          <p>优点：无FOUT</p>
          <p>缺点：可能看到FOIT（不可见文本闪烁）</p>
        </div>
        
        <div className="demo-fallback">
          <h3>Fallback策略</h3>
          <p>100ms阻塞期，然后显示备用字体</p>
          <p>优点：平衡性能和视觉效果</p>
          <p>缺点：仍可能出现轻微闪烁</p>
        </div>
        
        <div className="demo-optional">
          <h3>Optional策略</h3>
          <p>完全不阻塞，根据网络状况决定是否使用</p>
          <p>优点：性能最佳</p>
          <p>缺点：慢速网络可能永远不加载自定义字体</p>
        </div>
      </div>
    </>
  );
}
```

### 3.6 动态字体切换

```jsx
'use client';

import { useState } from 'react';

export default function DynamicFontSwitching() {
  const [selectedFont, setSelectedFont] = useState('system');
  
  const fonts = [
    { id: 'system', name: '系统字体', url: null },
    { id: 'serif', name: '衬线字体', url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC&display=swap' },
    { id: 'sans', name: '无衬线字体', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap' },
    { id: 'mono', name: '等宽字体', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap' }
  ];
  
  const currentFont = fonts.find(f => f.id === selectedFont);
  
  return (
    <>
      <title>动态字体切换</title>
      
      {/* 预连接Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* 动态加载选中的字体 */}
      {currentFont?.url && (
        <link rel="stylesheet" href={currentFont.url} />
      )}
      
      <div>
        <h2>选择阅读字体</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          {fonts.map(font => (
            <button
              key={font.id}
              onClick={() => setSelectedFont(font.id)}
              style={{
                margin: '0 0.5rem',
                padding: '0.5rem 1rem',
                background: selectedFont === font.id ? '#3b82f6' : '#e5e7eb',
                color: selectedFont === font.id ? 'white' : 'black',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              {font.name}
            </button>
          ))}
        </div>
        
        <article
          style={{
            fontFamily: getFontFamily(selectedFont),
            lineHeight: 1.8,
            fontSize: '1.1rem'
          }}
        >
          <h3>示例文章</h3>
          <p>
            这是一段示例文本，用于展示不同字体的效果。
            你可以通过上方的按钮切换字体，体验不同字体的阅读感受。
          </p>
          <p>
            This is sample text in English to demonstrate font rendering
            with mixed languages. The quick brown fox jumps over the lazy dog.
          </p>
          <code style={{ display: 'block', padding: '1rem', background: '#f3f4f6' }}>
            const code = "This is monospace font for code";
            console.log(code);
          </code>
        </article>
      </div>
    </>
  );
}

function getFontFamily(fontId: string): string {
  switch (fontId) {
    case 'serif':
      return '"Noto Serif SC", serif';
    case 'sans':
      return '"Noto Sans SC", sans-serif';
    case 'mono':
      return '"JetBrains Mono", monospace';
    default:
      return 'system-ui, -apple-system, sans-serif';
  }
}
```

## 第四部分：动态style标签

### 4.1 内联关键CSS

```jsx
export default function CriticalCSS() {
  const criticalStyles = `
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
    }
    
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3rem;
      margin: 0;
    }
  `;
  
  return (
    <>
      <title>关键CSS示例</title>
      
      {/* 内联关键CSS */}
      <style>{criticalStyles}</style>
      
      {/* 延迟加载非关键CSS */}
      <link
        rel="stylesheet"
        href="/non-critical.css"
        media="print"
        onLoad="this.media='all'"
      />
      
      <div className="hero">
        <h1>欢迎来到我的网站</h1>
      </div>
    </>
  );
}
```

### 4.2 动态主题样式

```jsx
'use client';

import { useState } from 'react';

export default function DynamicTheme() {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  
  const themeStyles = `
    :root {
      --primary-color: ${primaryColor};
      --primary-hover: ${adjustColor(primaryColor, -20)};
    }
    
    button {
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    
    button:hover {
      background-color: var(--primary-hover);
    }
  `;
  
  return (
    <>
      <title>动态主题</title>
      
      <style>{themeStyles}</style>
      
      <div>
        <h1>选择主题颜色</h1>
        
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
        />
        
        <button>示例按钮</button>
      </div>
    </>
  );
}

function adjustColor(color, amount) {
  // 简化的颜色调整函数
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
```

### 4.3 条件样式

```jsx
export default function ConditionalStyles({ isMobile, userPreferences }) {
  return (
    <>
      <title>条件样式</title>
      
      {/* 移动端样式 */}
      {isMobile && (
        <style>{`
          .container {
            padding: 1rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
          }
        `}</style>
      )}
      
      {/* 桌面端样式 */}
      {!isMobile && (
        <style>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        `}</style>
      )}
      
      {/* 用户偏好 */}
      {userPreferences.reducedMotion && (
        <style>{`
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        `}</style>
      )}
      
      {userPreferences.highContrast && (
        <style>{`
          body {
            filter: contrast(1.5);
          }
        `}</style>
      )}
      
      <div className="container">
        <div className="grid">
          <div>卡片 1</div>
          <div>卡片 2</div>
          <div>卡片 3</div>
        </div>
      </div>
    </>
  );
}
```

### 4.4 CSS变量动态管理

```jsx
'use client';

import { useState } from 'react';

export default function CSSVariableManagement() {
  const [theme, setTheme] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    spacing: 16,
    borderRadius: 8
  });
  
  const cssVariables = `
    :root {
      --color-primary: ${theme.primary};
      --color-secondary: ${theme.secondary};
      --spacing-unit: ${theme.spacing}px;
      --border-radius: ${theme.borderRadius}px;
      
      /* 计算颜色变体 */
      --color-primary-light: color-mix(in srgb, ${theme.primary} 80%, white);
      --color-primary-dark: color-mix(in srgb, ${theme.primary} 80%, black);
    }
    
    .button {
      background: var(--color-primary);
      padding: calc(var(--spacing-unit) * 0.5) var(--spacing-unit);
      border-radius: var(--border-radius);
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .button:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
    }
    
    .card {
      padding: calc(var(--spacing-unit) * 1.5);
      border-radius: calc(var(--border-radius) * 1.5);
      border: 2px solid var(--color-primary);
      margin: var(--spacing-unit);
    }
  `;
  
  return (
    <>
      <title>CSS变量动态管理</title>
      
      <style>{cssVariables}</style>
      
      <div style={{ padding: '2rem' }}>
        <h1>主题定制器</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <label>
            主色:
            <input
              type="color"
              value={theme.primary}
              onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
            />
          </label>
          
          <label style={{ marginLeft: '1rem' }}>
            次色:
            <input
              type="color"
              value={theme.secondary}
              onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
            />
          </label>
          
          <label style={{ marginLeft: '1rem' }}>
            间距: {theme.spacing}px
            <input
              type="range"
              min="8"
              max="32"
              value={theme.spacing}
              onChange={(e) => setTheme({ ...theme, spacing: parseInt(e.target.value) })}
            />
          </label>
          
          <label style={{ marginLeft: '1rem' }}>
            圆角: {theme.borderRadius}px
            <input
              type="range"
              min="0"
              max="20"
              value={theme.borderRadius}
              onChange={(e) => setTheme({ ...theme, borderRadius: parseInt(e.target.value) })}
            />
          </label>
        </div>
        
        <div className="card">
          <h2>预览卡片</h2>
          <p>这是一个使用动态CSS变量的卡片</p>
          <button className="button">动作按钮</button>
        </div>
      </div>
    </>
  );
}
```

### 4.5 关键帧动画

```jsx
'use client';

import { useState } from 'react';

export default function DynamicKeyframes() {
  const [animationConfig, setAnimationConfig] = useState({
    duration: 2,
    direction: 'horizontal',
    easing: 'ease-in-out'
  });
  
  const getKeyframes = () => {
    if (animationConfig.direction === 'horizontal') {
      return `
        @keyframes slide {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `;
    } else {
      return `
        @keyframes slide {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `;
    }
  };
  
  const animationStyles = `
    ${getKeyframes()}
    
    .animated-box {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      animation: slide ${animationConfig.duration}s ${animationConfig.easing} infinite;
    }
  `;
  
  return (
    <>
      <title>动态关键帧动画</title>
      
      <style>{animationStyles}</style>
      
      <div style={{ padding: '2rem' }}>
        <h1>动画配置器</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <label>
            持续时间: {animationConfig.duration}s
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={animationConfig.duration}
              onChange={(e) => setAnimationConfig({ 
                ...animationConfig, 
                duration: parseFloat(e.target.value) 
              })}
            />
          </label>
          
          <label style={{ marginLeft: '1rem' }}>
            方向:
            <select
              value={animationConfig.direction}
              onChange={(e) => setAnimationConfig({ 
                ...animationConfig, 
                direction: e.target.value 
              })}
            >
              <option value="horizontal">水平</option>
              <option value="vertical">垂直</option>
            </select>
          </label>
          
          <label style={{ marginLeft: '1rem' }}>
            缓动:
            <select
              value={animationConfig.easing}
              onChange={(e) => setAnimationConfig({ 
                ...animationConfig, 
                easing: e.target.value 
              })}
            >
              <option value="linear">线性</option>
              <option value="ease">缓动</option>
              <option value="ease-in">缓入</option>
              <option value="ease-out">缓出</option>
              <option value="ease-in-out">缓入缓出</option>
            </select>
          </label>
        </div>
        
        <div className="animated-box">
          动画盒子
        </div>
      </div>
    </>
  );
}
```

### 4.6 媒体查询和容器查询

```jsx
export default function ResponsiveQueries() {
  return (
    <>
      <title>响应式查询</title>
      
      <style>{`
        /* 传统媒体查询 */
        .responsive-box {
          padding: 1rem;
          background: #e5e7eb;
        }
        
        @media (min-width: 768px) {
          .responsive-box {
            padding: 2rem;
            background: #bfdbfe;
          }
        }
        
        @media (min-width: 1024px) {
          .responsive-box {
            padding: 3rem;
            background: #93c5fd;
          }
        }
        
        /* 容器查询 - React 19支持 */
        .container {
          container-type: inline-size;
          container-name: box-container;
        }
        
        .container-box {
          padding: 1rem;
          background: #fef3c7;
        }
        
        @container box-container (min-width: 400px) {
          .container-box {
            padding: 2rem;
            background: #fde68a;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }
        
        @container box-container (min-width: 600px) {
          .container-box {
            padding: 3rem;
            background: #fcd34d;
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        /* 特性查询 */
        @supports (container-type: inline-size) {
          .supports-container {
            border: 3px solid green;
          }
          .supports-container::before {
            content: '支持容器查询';
            color: green;
            font-weight: bold;
          }
        }
        
        @supports not (container-type: inline-size) {
          .supports-container {
            border: 3px solid orange;
          }
          .supports-container::before {
            content: '不支持容器查询';
            color: orange;
            font-weight: bold;
          }
        }
      `}</style>
      
      <div style={{ padding: '2rem' }}>
        <h1>响应式查询示例</h1>
        
        <h2>媒体查询（基于视口）</h2>
        <div className="responsive-box">
          <p>调整浏览器窗口大小查看效果</p>
        </div>
        
        <h2>容器查询（基于父容器）</h2>
        <div className="container supports-container" style={{ resize: 'horizontal', overflow: 'auto', border: '2px solid #ccc' }}>
          <div className="container-box">
            <div>项目 1</div>
            <div>项目 2</div>
            <div>项目 3</div>
          </div>
        </div>
      </div>
    </>
  );
}
```

## 第五部分：CSS-in-JS集成

### 5.1 与styled-components集成

```jsx
'use client';

import styled from 'styled-components';

const Button = styled.button`
  background: ${props => props.primary ? '#3b82f6' : '#6b7280'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
`;

export default function StyledComponentsExample() {
  return (
    <>
      <title>Styled Components示例</title>
      
      {/* styled-components会自动注入样式 */}
      
      <div>
        <Button primary>Primary Button</Button>
        <Button>Secondary Button</Button>
      </div>
    </>
  );
}
```

### 5.2 与Emotion集成

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export default function EmotionExample() {
  const buttonStyle = css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
  `;
  
  return (
    <>
      <title>Emotion示例</title>
      
      <div>
        <button css={buttonStyle}>
          Gradient Button
        </button>
      </div>
    </>
  );
}
```

### 5.3 与Tailwind CSS集成

```jsx
export default function TailwindIntegration() {
  return (
    <>
      <title>Tailwind CSS集成</title>
      
      {/* Tailwind CSS CDN - 仅用于演示 */}
      <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
      
      {/* 自定义Tailwind配置 */}
      <style type="text/tailwindcss">{`
        @layer utilities {
          .text-shadow {
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-shadow mb-8">
            Tailwind CSS + React 19
          </h1>
          
          <div className="glass-effect rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-semibold mb-4">玻璃效果卡片</h2>
            <p className="mb-4">
              使用Tailwind的自定义工具类创建现代UI效果
            </p>
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:scale-105 transition-transform">
              了解更多
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 5.4 与CSS Modules集成

```jsx
// styles.module.css 文件内容（在组件中动态生成）
export default function CSSModulesIntegration() {
  const cssModuleStyles = `
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 1rem;
      padding: 2rem;
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .description {
      font-size: 1.1rem;
      line-height: 1.6;
      opacity: 0.9;
    }
  `;
  
  return (
    <>
      <title>CSS Modules风格</title>
      
      <style>{cssModuleStyles}</style>
      
      <div className="container">
        <div className="card">
          <h1 className="title">CSS Modules风格</h1>
          <p className="description">
            模拟CSS Modules的样式隔离和组织方式
          </p>
        </div>
      </div>
    </>
  );
}
```

## 第六部分：性能优化策略

### 6.1 Critical CSS分离

```jsx
// 服务器端组件
export default async function OptimizedPage() {
  // 内联关键CSS
  const criticalCSS = await getCriticalCSS();
  
  return (
    <>
      <title>性能优化页面</title>
      
      {/* 内联关键CSS - 立即可用 */}
      <style>{criticalCSS}</style>
      
      {/* 预加载完整CSS */}
      <link rel="preload" href="/main.css" as="style" />
      
      {/* 异步加载完整CSS */}
      <link
        rel="stylesheet"
        href="/main.css"
        media="print"
        onLoad="this.media='all'"
      />
      
      <div className="hero">
        <h1>首屏内容</h1>
      </div>
      
      <div className="content">
        {/* 其他内容 */}
      </div>
    </>
  );
}
```

### 6.2 条件资源加载

```jsx
export default function ConditionalResources({ features }) {
  return (
    <>
      <title>条件资源加载</title>
      
      {/* 只在需要时加载 */}
      {features.charts && (
        <>
          <link rel="preconnect" href="https://cdn.jsdelivr.net" />
          <link rel="prefetch" href="https://cdn.jsdelivr.net/npm/chart.js" as="script" />
        </>
      )}
      
      {features.maps && (
        <>
          <link rel="preconnect" href="https://maps.googleapis.com" />
          <link rel="prefetch" href="https://maps.googleapis.com/maps/api/js" as="script" />
        </>
      )}
      
      {features.richText && (
        <link rel="stylesheet" href="/editor.css" />
      )}
      
      <div>
        {features.charts && <ChartComponent />}
        {features.maps && <MapComponent />}
        {features.richText && <RichTextEditor />}
      </div>
    </>
  );
}
```

### 6.3 渐进式资源加载

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function ProgressiveLoading() {
  const [stage, setStage] = useState('critical');
  
  useEffect(() => {
    // 关键资源加载后，加载高优先级资源
    const timer1 = setTimeout(() => setStage('high'), 1000);
    
    // 高优先级资源加载后，加载低优先级资源
    const timer2 = setTimeout(() => setStage('low'), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  return (
    <>
      <title>渐进式加载</title>
      
      {/* 关键CSS - 立即加载 */}
      <link rel="stylesheet" href="/critical.css" />
      
      {/* 高优先级CSS - 1秒后加载 */}
      {stage !== 'critical' && (
        <link rel="stylesheet" href="/high-priority.css" />
      )}
      
      {/* 低优先级CSS - 3秒后加载 */}
      {stage === 'low' && (
        <link rel="stylesheet" href="/low-priority.css" />
      )}
      
      <div>
        <h1>渐进式资源加载</h1>
        <p>当前阶段: {stage}</p>
      </div>
    </>
  );
}
```

### 6.4 性能监控和调试

```jsx
'use client';

import { useEffect, useState } from 'react';

export default function PerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    fontLoadTime: 0,
    cssLoadTime: 0,
    totalResources: 0
  });
  
  useEffect(() => {
    // 监听资源加载性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'link') {
          console.log(`资源加载: ${entry.name}`);
          console.log(`加载时间: ${entry.duration}ms`);
          console.log(`传输大小: ${entry.transferSize} bytes`);
          
          // 更新metrics
          if (entry.name.includes('font')) {
            setMetrics(prev => ({ 
              ...prev, 
              fontLoadTime: entry.duration,
              totalResources: prev.totalResources + 1
            }));
          } else if (entry.name.includes('.css')) {
            setMetrics(prev => ({ 
              ...prev, 
              cssLoadTime: entry.duration,
              totalResources: prev.totalResources + 1
            }));
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <>
      <title>性能监控</title>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        rel="stylesheet" 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
      />
      
      <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
        <h1>性能监控面板</h1>
        
        <div style={{ 
          background: '#f3f4f6', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginTop: '1rem'
        }}>
          <h2>加载指标</h2>
          <p>字体加载时间: {metrics.fontLoadTime.toFixed(2)}ms</p>
          <p>CSS加载时间: {metrics.cssLoadTime.toFixed(2)}ms</p>
          <p>已加载资源数: {metrics.totalResources}</p>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <h2>优化建议</h2>
          <ul>
            <li>{metrics.fontLoadTime > 1000 ? '字体加载较慢，建议使用预加载' : '字体加载正常'}</li>
            <li>{metrics.cssLoadTime > 500 ? 'CSS加载较慢，建议压缩CSS文件' : 'CSS加载正常'}</li>
            <li>{metrics.totalResources > 10 ? '资源数量较多，建议合并资源' : '资源数量正常'}</li>
          </ul>
        </div>
      </div>
    </>
  );
}
```

### 6.5 资源加载策略最佳实践

```jsx
export default function BestPracticesExample() {
  return (
    <>
      <title>资源加载最佳实践</title>
      
      {/* ========== 1. 关键渲染路径优化 ========== */}
      
      {/* 内联关键CSS - 阻塞渲染的最小CSS */}
      <style>{`
        /* 首屏必需的样式 */
        body { margin: 0; font-family: system-ui, sans-serif; }
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      `}</style>
      
      {/* 预连接到关键域名 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://cdn.example.com" />
      
      {/* 预加载关键字体 */}
      <link
        rel="preload"
        href="https://fonts.gstatic.com/s/inter/v12/inter.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* 预加载首屏图片 */}
      <link rel="preload" href="/hero-image.jpg" as="image" fetchpriority="high" />
      
      {/* ========== 2. 非关键资源延迟加载 ========== */}
      
      {/* 异步加载完整CSS */}
      <link
        rel="stylesheet"
        href="/main.css"
        media="print"
        onLoad="this.media='all'"
      />
      <noscript>
        <link rel="stylesheet" href="/main.css" />
      </noscript>
      
      {/* 预获取下一页资源 */}
      <link rel="prefetch" href="/about.html" as="document" />
      <link rel="prefetch" href="/about.css" as="style" />
      
      {/* ========== 3. 第三方资源优化 ========== */}
      
      {/* DNS预解析第三方域名 */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* 预连接分析服务 */}
      <link rel="preconnect" href="https://analytics.example.com" crossOrigin="anonymous" />
      
      {/* ========== 4. 响应式资源加载 ========== */}
      
      {/* 根据媒体查询加载不同资源 */}
      <link
        rel="stylesheet"
        href="/mobile.css"
        media="screen and (max-width: 768px)"
      />
      <link
        rel="stylesheet"
        href="/desktop.css"
        media="screen and (min-width: 769px)"
      />
      
      {/* 根据用户偏好加载 */}
      <link
        rel="stylesheet"
        href="/dark-mode.css"
        media="(prefers-color-scheme: dark)"
      />
      
      <div className="hero">
        <h1>资源加载最佳实践</h1>
      </div>
    </>
  );
}
```

### 6.6 Bundle大小优化

```jsx
export default function BundleOptimization() {
  return (
    <>
      <title>Bundle优化</title>
      
      <style>{`
        /* 使用CSS的layer功能组织样式 */
        @layer reset, base, components, utilities;
        
        @layer reset {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
        }
        
        @layer base {
          body {
            font-family: system-ui, sans-serif;
            line-height: 1.6;
          }
        }
        
        @layer components {
          .btn {
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            border: none;
            cursor: pointer;
          }
          
          .btn-primary {
            background: #3b82f6;
            color: white;
          }
        }
        
        @layer utilities {
          .text-center { text-align: center; }
          .mt-4 { margin-top: 1rem; }
          .p-4 { padding: 1rem; }
        }
      `}</style>
      
      <div>
        <h1 className="text-center">Bundle优化技巧</h1>
        
        <div className="p-4">
          <h2>CSS Layer优势</h2>
          <ul>
            <li>更好的样式组织和优先级管理</li>
            <li>减少样式冲突</li>
            <li>提高可维护性</li>
            <li>支持按需加载特定layer</li>
          </ul>
          
          <button className="btn btn-primary mt-4">示例按钮</button>
        </div>
      </div>
    </>
  );
}
```

### 6.7 实战案例：新闻网站优化

```jsx
export default async function OptimizedNewsPage({ articleId }) {
  const article = await fetchArticle(articleId);
  const relatedArticles = await fetchRelatedArticles(articleId);
  
  return (
    <>
      <title>{article.title} - 新闻网站</title>
      
      {/* ========== SEO优化 ========== */}
      <link rel="canonical" href={`https://news.example.com/articles/${articleId}`} />
      
      {/* ========== 关键资源 ========== */}
      
      {/* 预连接CDN */}
      <link rel="preconnect" href="https://cdn.news.com" />
      
      {/* 预加载文章主图 */}
      <link rel="preload" href={article.featuredImage} as="image" fetchpriority="high" />
      
      {/* 内联关键CSS */}
      <style>{`
        article {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: Georgia, serif;
        }
        
        .article-header {
          margin-bottom: 2rem;
        }
        
        .article-title {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1.2;
          margin-bottom: 1rem;
        }
        
        .article-meta {
          color: #666;
          font-size: 0.9rem;
        }
        
        .featured-image {
          width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 0.5rem;
        }
      `}</style>
      
      {/* ========== 次要资源 ========== */}
      
      {/* 预获取相关文章 */}
      {relatedArticles.slice(0, 3).map(related => (
        <link
          key={related.id}
          rel="prefetch"
          href={`/articles/${related.id}`}
          as="document"
        />
      ))}
      
      {/* 预获取评论系统 */}
      <link rel="prefetch" href="/comments-widget.js" as="script" />
      
      {/* ========== 第三方服务 ========== */}
      
      {/* DNS预解析社交分享服务 */}
      <link rel="dns-prefetch" href="https://platform.twitter.com" />
      <link rel="dns-prefetch" href="https://connect.facebook.net" />
      
      {/* 预连接广告服务 */}
      <link rel="preconnect" href="https://ads.example.com" />
      
      <article>
        <div className="article-header">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span>{article.author}</span> · 
            <span>{article.publishDate}</span> · 
            <span>{article.readTime}分钟阅读</span>
          </div>
        </div>
        
        <img 
          src={article.featuredImage} 
          alt={article.title}
          className="featured-image"
          fetchpriority="high"
        />
        
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        <div className="related-articles">
          <h2>相关文章</h2>
          {relatedArticles.map(related => (
            <div key={related.id}>
              <a href={`/articles/${related.id}`}>{related.title}</a>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}

async function fetchArticle(id: string) {
  return {
    title: '示例新闻标题',
    author: '张三',
    publishDate: '2025-01-15',
    readTime: 5,
    featuredImage: '/article-image.jpg',
    content: '<p>文章内容...</p>'
  };
}

async function fetchRelatedArticles(id: string) {
  return [];
}
```

## 注意事项

### 1. preload vs prefetch区别

```jsx
// ✅ preload - 当前页面必需的资源（高优先级）
<link rel="preload" href="/critical.css" as="style" />
<link rel="preload" href="/hero-image.jpg" as="image" fetchpriority="high" />

// ✅ prefetch - 下一页可能需要的资源（低优先级）
<link rel="prefetch" href="/next-page.css" as="style" />
<link rel="prefetch" href="/about-page-data.json" as="fetch" />

// ❌ 错误：不要过度使用preload
// 只预加载真正关键的资源（通常< 3个）
<link rel="preload" href="/footer-image.jpg" as="image" /> {/* 不需要 */}
<link rel="preload" href="/analytics.js" as="script" /> {/* 不需要 */}

// ✅ 正确：preload首屏关键资源
<link rel="preload" href="/above-fold.css" as="style" />
<link rel="preload" href="/logo.svg" as="image" />
```

**关键区别：**
- `preload`: 当前页面立即需要，浏览器高优先级加载
- `prefetch`: 未来页面可能需要，浏览器空闲时加载
- `preconnect`: 提前建立连接，适用于第三方域名
- `dns-prefetch`: 仅DNS解析，比preconnect更轻量

### 2. crossOrigin属性必需场景

```jsx
// ✅ 字体文件必须使用crossOrigin
<link
  rel="preload"
  href="https://fonts.gstatic.com/font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous" // 必需！
/>

// ✅ 跨域样式表需要CORS
<link
  rel="stylesheet"
  href="https://cdn.example.com/styles.css"
  crossOrigin="anonymous"
/>

// ✅ 带integrity的资源需要crossOrigin
<link
  rel="stylesheet"
  href="https://cdn.example.com/bootstrap.css"
  integrity="sha384-..."
  crossOrigin="anonymous"
/>

// ❌ 错误：同域名资源不需要crossOrigin
<link rel="preload" href="/local-font.woff2" as="font" crossOrigin="anonymous" />
// 应该是：
<link rel="preload" href="/local-font.woff2" as="font" />
```

### 3. 媒体查询优化策略

```jsx
// ✅ 根据媒体查询条件加载
<link rel="stylesheet" href="/print.css" media="print" />
<link rel="stylesheet" href="/mobile.css" media="(max-width: 768px)" />
<link rel="stylesheet" href="/desktop.css" media="(min-width: 769px)" />

// ✅ 用户偏好查询
<link rel="stylesheet" href="/dark.css" media="(prefers-color-scheme: dark)" />
<link rel="stylesheet" href="/reduced-motion.css" media="(prefers-reduced-motion: reduce)" />

// ✅ 设备特性查询
<link rel="stylesheet" href="/retina.css" media="(min-resolution: 2dppx)" />
<link rel="stylesheet" href="/landscape.css" media="(orientation: landscape)" />

// ❌ 错误：不要用JavaScript检查然后再加载CSS
// 应该直接使用media属性让浏览器决定
```

### 4. as属性的正确使用

```jsx
// ✅ 正确指定资源类型
<link rel="preload" href="/data.json" as="fetch" />
<link rel="preload" href="/script.js" as="script" />
<link rel="preload" href="/style.css" as="style" />
<link rel="preload" href="/image.jpg" as="image" />
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" />
<link rel="preload" href="/video.mp4" as="video" />
<link rel="preload" href="/audio.mp3" as="audio" />

// ❌ 错误：缺少as属性
<link rel="preload" href="/important.css" /> {/* 浏览器不知道如何处理 */}

// ❌ 错误：as类型不匹配
<link rel="preload" href="/image.jpg" as="script" /> {/* 类型错误 */}
```

### 5. fetchpriority使用注意

```jsx
// ✅ 正确：首屏关键图片使用high
<link rel="preload" href="/hero-image.jpg" as="image" fetchpriority="high" />

// ✅ 正确：次要资源使用low
<link rel="prefetch" href="/footer-logo.svg" as="image" fetchpriority="low" />

// ❌ 错误：所有资源都设置high（等于没设置）
<link rel="preload" href="/image1.jpg" as="image" fetchpriority="high" />
<link rel="preload" href="/image2.jpg" as="image" fetchpriority="high" />
<link rel="preload" href="/image3.jpg" as="image" fetchpriority="high" />

// ✅ 正确：优先级分级
<link rel="preload" href="/critical.jpg" as="image" fetchpriority="high" />
<link rel="preload" href="/important.jpg" as="image" /> {/* 默认优先级 */}
<link rel="prefetch" href="/future.jpg" as="image" fetchpriority="low" />
```

### 6. 内联CSS的大小限制

```jsx
// ✅ 正确：内联关键CSS（< 14KB）
<style>{`
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; display: flex; }
  /* 只包含首屏必需的样式 */
`}</style>

// ❌ 错误：内联过多CSS
<style>{`
  /* 几千行CSS... */
  /* 这会阻塞渲染，应该外部加载 */
`}</style>

// ✅ 正确做法
<style>{`/* 关键CSS < 14KB */`}</style>
<link rel="stylesheet" href="/main.css" media="print" onLoad="this.media='all'" />
```

### 7. 字体加载策略选择

```jsx
// ✅ 推荐：font-display: swap（适合大多数场景）
<style>{`
  @font-face {
    font-family: 'CustomFont';
    src: url('/font.woff2') format('woff2');
    font-display: swap; /* 立即显示备用字体 */
  }
`}</style>

// ⚠️ 谨慎使用：font-display: block
// 仅在品牌一致性非常重要时使用
<style>{`
  @font-face {
    font-family: 'BrandFont';
    src: url('/brand.woff2') format('woff2');
    font-display: block; /* 最多阻塞3秒 */
  }
`}</style>

// ✅ 性能优先：font-display: optional
<style>{`
  @font-face {
    font-family: 'EnhancementFont';
    src: url('/enhancement.woff2') format('woff2');
    font-display: optional; /* 快速网络才使用 */
  }
`}</style>
```

### 8. 避免样式冲突

```jsx
// ❌ 错误：多个地方定义相同样式
<style>{`.button { background: blue; }`}</style>
<style>{`.button { background: red; }`}</style>

// ✅ 正确：使用CSS Layers组织样式
<style>{`
  @layer base, components, utilities;
  
  @layer base {
    .button { padding: 0.5rem 1rem; }
  }
  
  @layer components {
    .button { background: blue; }
  }
  
  @layer utilities {
    .button-red { background: red !important; }
  }
`}</style>
```

### 9. CSP策略兼容性

```jsx
// ⚠️ 注意：内联样式可能违反CSP策略
<style>{`body { color: red; }`}</style> {/* 需要 'unsafe-inline' */}

// ✅ 推荐：使用nonce
<style nonce="random-nonce-value">{`
  body { color: red; }
`}</style>

// ✅ 或使用外部CSS文件
<link rel="stylesheet" href="/styles.css" />
```

### 10. React 19特定注意事项

```jsx
// ✅ React 19自动提升到<head>
export default function MyComponent() {
  return (
    <>
      <title>My Page</title>
      <link rel="stylesheet" href="/style.css" />
      {/* ↑ 这些会自动提升到<head>，无论在组件树哪里 */}
      
      <div>Content</div>
    </>
  );
}

// ✅ 同名资源会自动去重
export default function App() {
  return (
    <>
      <Component1 /> {/* 包含 <link href="/shared.css" /> */}
      <Component2 /> {/* 也包含 <link href="/shared.css" /> */}
      {/* ↑ React 19只会加载一次 */}
    </>
  );
}

// ⚠️ 动态link需要key属性
export default function DynamicLinks({ theme }) {
  return (
    <>
      <link 
        key={`theme-${theme}`} // 必需！
        rel="stylesheet" 
        href={`/themes/${theme}.css`} 
      />
    </>
  );
}
```

## 常见问题

### Q1: preload和prefetch有什么区别？如何选择？

**A:** 主要区别在于优先级和用途：

- **preload**（高优先级）：
  - 用于当前页面立即需要的资源
  - 浏览器会尽快加载，高优先级
  - 适用于：首屏图片、关键CSS、关键字体
  - 示例：`<link rel="preload" href="/hero.jpg" as="image" />`

- **prefetch**（低优先级）：
  - 用于未来页面可能需要的资源
  - 浏览器在空闲时加载，低优先级
  - 适用于：下一页资源、异步组件、用户可能访问的页面
  - 示例：`<link rel="prefetch" href="/next-page.js" as="script" />`

**选择建议：**
- 首屏关键资源 → preload
- 2-3秒内需要的资源 → preload
- 未来可能需要的资源 → prefetch
- 不确定是否需要 → 不要预加载

### Q2: 字体闪烁（FOUT/FOIT）如何解决？

**A:** 字体加载闪烁有两种类型：

**FOUT（Flash of Unstyled Text）** - 样式闪烁：
- 先显示系统字体，自定义字体加载后切换
- 解决方案：使用`font-display: swap`

**FOIT（Flash of Invisible Text）** - 不可见文本闪烁：
- 字体加载期间文本不可见
- 解决方案：使用`font-display: optional`或`font-display: fallback`

**最佳实践：**
```jsx
<style>{`
  @font-face {
    font-family: 'CustomFont';
    src: url('/font.woff2') format('woff2');
    font-display: swap; /* 推荐 */
  }
`}</style>

{/* 预加载关键字体 */}
<link
  rel="preload"
  href="/font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### Q3: 内联CSS的最佳实践是什么？

**A:** 内联CSS遵循以下原则：

**应该内联的：**
- 首屏渲染必需的CSS（通常< 14KB）
- 关键渲染路径的样式
- 避免render-blocking的最小CSS

**不应该内联的：**
- 完整的CSS框架
- 非首屏样式
- 大于14KB的样式

**示例：**
```jsx
{/* ✅ 内联关键CSS */}
<style>{`
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; }
`}</style>

{/* ✅ 异步加载完整CSS */}
<link 
  rel="stylesheet" 
  href="/main.css" 
  media="print" 
  onLoad="this.media='all'" 
/>
```

### Q4: 如何测试资源加载性能？

**A:** 推荐使用以下工具：

**1. Chrome DevTools:**
- Network面板：查看资源加载时间、大小、优先级
- Performance面板：分析关键渲染路径
- Coverage面板：查找未使用的CSS/JS

**2. Lighthouse:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- 运行命令：`npx lighthouse https://example.com`

**3. WebPageTest:**
- 多地域测试
- 连接速度模拟
- 瀑布图分析
- 网址：https://webpagetest.org

**4. Performance Observer API:**
```jsx
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
observer.observe({ entryTypes: ['resource'] });
```

### Q5: 为什么字体加载需要crossOrigin属性？

**A:** 字体文件跨域加载有特殊的CORS要求：

**原因：**
- 字体文件被视为敏感资源
- 浏览器需要验证服务器允许跨域访问
- 防止字体被未授权网站使用

**正确用法：**
```jsx
{/* ✅ 必须添加crossOrigin */}
<link
  rel="preload"
  href="https://fonts.gstatic.com/font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous" // 必需！
/>

{/* ❌ 缺少crossOrigin会导致二次下载 */}
<link
  rel="preload"
  href="https://fonts.gstatic.com/font.woff2"
  as="font"
  type="font/woff2"
/>
```

### Q6: React 19的link标签自动去重是如何工作的？

**A:** React 19会自动处理重复的资源：

**工作机制：**
- React跟踪已加载的资源URL
- 相同href的`<link>`只会加载一次
- 自动合并多个组件中的相同资源

**示例：**
```jsx
// Component A
function ComponentA() {
  return <link rel="stylesheet" href="/shared.css" />;
}

// Component B
function ComponentB() {
  return <link rel="stylesheet" href="/shared.css" />;
}

// App
function App() {
  return (
    <>
      <ComponentA />
      <ComponentB />
      {/* shared.css只会加载一次 */}
    </>
  );
}
```

**注意事项：**
- 动态资源需要key属性
- 不同参数的URL被视为不同资源
- 去重基于完整的href值

### Q7: 什么时候使用preconnect vs dns-prefetch？

**A:** 选择取决于连接重要性和浏览器兼容性：

**preconnect**（推荐用于关键域名）：
- 完整的连接准备：DNS + TCP + TLS
- 消耗更多资源
- 适用于：即将请求的关键第三方域名
- 浏览器限制：通常最多6个

```jsx
<link rel="preconnect" href="https://cdn.example.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
```

**dns-prefetch**（用于可能的连接）：
- 仅DNS解析
- 消耗资源少
- 适用于：可能需要的多个第三方域名
- 浏览器兼容性更好

```jsx
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
<link rel="dns-prefetch" href="https://api.example.com" />
```

**最佳实践：**
```jsx
{/* 关键资源 - 使用preconnect */}
<link rel="preconnect" href="https://cdn.example.com" />

{/* 备用方案 - 提供dns-prefetch */}
<link rel="dns-prefetch" href="https://cdn.example.com" />

{/* 次要资源 - 只用dns-prefetch */}
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

### Q8: 媒体查询的link会增加HTTP请求吗？

**A:** 不会！这是CSS媒体查询的优势：

**工作原理：**
- 浏览器会评估media属性
- 不匹配的资源不会下载
- 条件变化时才加载

**示例：**
```jsx
{/* 只在移动端加载 */}
<link 
  rel="stylesheet" 
  href="/mobile.css" 
  media="(max-width: 768px)" 
/>

{/* 只在桌面端加载 */}
<link 
  rel="stylesheet" 
  href="/desktop.css" 
  media="(min-width: 769px)" 
/>

{/* 只在打印时加载 */}
<link rel="stylesheet" href="/print.css" media="print" />
```

**优势：**
- 减少不必要的下载
- 节省带宽
- 提升性能
- 响应式加载

### Q9: 如何调试link标签不生效的问题？

**A:** 按以下步骤排查：

**1. 检查基础语法：**
```jsx
{/* ✅ 正确 */}
<link rel="preload" href="/image.jpg" as="image" />

{/* ❌ 错误：缺少as属性 */}
<link rel="preload" href="/image.jpg" />

{/* ❌ 错误：as类型错误 */}
<link rel="preload" href="/image.jpg" as="style" />
```

**2. 检查CORS设置：**
```jsx
{/* 字体必需crossOrigin */}
<link
  rel="preload"
  href="https://fonts.gstatic.com/font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

**3. 使用Chrome DevTools：**
- Network面板查看资源状态
- Console查看错误信息
- 检查Priority列（High/Medium/Low）

**4. 验证文件路径：**
```jsx
{/* ✅ 绝对路径 */}
<link rel="preload" href="/assets/image.jpg" as="image" />

{/* ✅ 完整URL */}
<link rel="preload" href="https://cdn.example.com/image.jpg" as="image" />

{/* ❌ 相对路径可能出问题 */}
<link rel="preload" href="../image.jpg" as="image" />
```

### Q10: 多个style标签会影响性能吗？

**A:** 有一定影响，但React 19做了优化：

**性能影响：**
- 每个`<style>`标签都需要解析
- CSSOM构建可能被分段
- 多次触发样式重计算

**React 19优化：**
- 自动合并相邻的style标签
- 智能去重相同的样式
- 优化样式插入顺序

**最佳实践：**
```jsx
{/* ❌ 不推荐：多个小的style标签 */}
<style>{`.a { color: red; }`}</style>
<style>{`.b { color: blue; }`}</style>
<style>{`.c { color: green; }`}</style>

{/* ✅ 推荐：合并相关样式 */}
<style>{`
  .a { color: red; }
  .b { color: blue; }
  .c { color: green; }
`}</style>

{/* ✅ 或按用途分组 */}
<style>{`/* Critical CSS */`}</style>
<style>{`/* Component CSS */`}</style>
```

## 总结

### link标签优化核心要点

#### 1. 资源加载策略

```
✅ preload - 当前页面关键资源（< 3个）
✅ prefetch - 下一页可能需要的资源
✅ preconnect - 关键第三方域名（< 6个）
✅ dns-prefetch - 可能需要的第三方域名
✅ modulepreload - ES模块预加载
```

**优先级排序：**
1. 首屏关键图片/CSS/字体 → `preload` + `fetchpriority="high"`
2. 首屏第三方资源 → `preconnect`
3. 即将需要的资源 → `preload`
4. 未来可能需要的资源 → `prefetch` + `fetchpriority="low"`
5. 可选的第三方服务 → `dns-prefetch`

#### 2. 字体加载最佳实践

```
✅ 使用woff2格式（最佳压缩）
✅ 预加载关键字体
✅ font-display: swap（推荐）
✅ 字体子集化（中文字体必需）
✅ 添加crossOrigin="anonymous"
✅ 预连接字体CDN
```

**完整优化方案：**
```jsx
{/* 1. 预连接 */}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

{/* 2. 预加载 */}
<link
  rel="preload"
  href="/fonts/critical-font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

{/* 3. 定义字体 */}
<style>{`
  @font-face {
    font-family: 'CustomFont';
    src: url('/fonts/critical-font.woff2') format('woff2');
    font-display: swap;
  }
`}</style>
```

#### 3. 响应式资源加载

```
✅ 使用media属性条件加载
✅ 根据设备特性加载不同资源
✅ 支持深色模式
✅ 支持打印样式
✅ 支持无障碍偏好
```

**实战模式：**
```jsx
{/* 设备响应 */}
<link rel="stylesheet" href="/mobile.css" media="(max-width: 768px)" />
<link rel="stylesheet" href="/desktop.css" media="(min-width: 769px)" />

{/* 用户偏好 */}
<link rel="stylesheet" href="/dark.css" media="(prefers-color-scheme: dark)" />
<link rel="stylesheet" href="/reduced-motion.css" media="(prefers-reduced-motion)" />

{/* 设备特性 */}
<link rel="stylesheet" href="/retina.css" media="(min-resolution: 2dppx)" />
```

### style标签最佳实践

#### 1. 内联CSS策略

```
✅ 仅内联首屏关键CSS（< 14KB）
✅ 包含基础布局和字体定义
✅ 避免内联框架和库
✅ 异步加载完整CSS
✅ 使用CSS minification
```

**理想模式：**
```jsx
{/* 内联关键CSS */}
<style>{`
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; display: flex; }
`}</style>

{/* 异步加载完整CSS */}
<link rel="stylesheet" href="/main.css" media="print" onLoad="this.media='all'" />
```

#### 2. 动态样式管理

```
✅ 使用CSS变量实现主题切换
✅ 条件渲染样式
✅ 动态关键帧动画
✅ 媒体查询和容器查询
✅ CSS Layers组织样式
```

#### 3. CSS-in-JS集成

```
✅ styled-components
✅ Emotion
✅ Tailwind CSS
✅ CSS Modules
✅ 原生CSS变量
```

### React 19特定优化

#### 1. 自动提升和去重

```
✅ link/style标签自动提升到<head>
✅ 相同资源自动去重
✅ 智能合并样式
✅ 优化插入顺序
```

#### 2. 服务器组件集成

```
✅ 服务器端预渲染样式
✅ 流式SSR支持
✅ 自动资源依赖追踪
✅ 优化的初始加载
```

#### 3. 关键注意事项

```
⚠️ 动态link需要key属性
⚠️ 字体加载必需crossOrigin
⚠️ preload不要超过3个
⚠️ 内联CSS不要超过14KB
⚠️ 优先使用media属性而非JS
```

### 性能优化完整清单

#### 关键渲染路径优化

```
□ 内联首屏关键CSS（< 14KB）
□ 预加载首屏关键图片
□ 预加载关键字体文件
□ 预连接到CDN和关键第三方域名
□ 使用fetchpriority标记优先级
□ 避免render-blocking资源
```

#### 资源加载优化

```
□ 使用preload加载关键资源（< 3个）
□ 使用prefetch预获取下一页资源
□ 使用preconnect连接第三方域名（< 6个）
□ 使用dns-prefetch预解析DNS
□ 使用modulepreload预加载ES模块
□ 根据media属性条件加载样式
```

#### 字体优化

```
□ 使用woff2格式
□ 预加载关键字体
□ 使用font-display: swap
□ 中文字体子集化
□ 添加crossOrigin属性
□ 预连接字体服务
□ 考虑使用系统字体栈
```

#### CSS优化

```
□ 压缩CSS文件（minify）
□ 移除未使用的CSS（PurgeCSS）
□ 使用CSS Layers组织代码
□ 启用Gzip/Brotli压缩
□ 使用CDN分发静态资源
□ 合并相似的样式规则
□ 避免过深的选择器嵌套
```

#### 监控和测试

```
□ 使用Lighthouse进行性能审计
□ 监控Core Web Vitals指标
□ 使用Chrome DevTools分析资源加载
□ 测试不同网络条件下的表现
□ 监控FCP、LCP、CLS指标
□ 使用Performance Observer API
□ 定期进行性能回归测试
```

### 实战经验总结

#### 优化效果对比

**优化前：**
- FCP（First Contentful Paint）: 2.5s
- LCP（Largest Contentful Paint）: 4.2s
- 总资源大小: 3.2MB
- 字体加载时间: 1.8s

**优化后：**
- FCP: 0.8s（提升68%）
- LCP: 1.5s（提升64%）
- 总资源大小: 1.2MB（减少62%）
- 字体加载时间: 0.3s（提升83%）

#### 常见错误避免

```
❌ 过度使用preload（超过3个）
❌ 内联过多CSS（超过14KB）
❌ 忘记添加crossOrigin属性
❌ preload和prefetch混淆
❌ 不使用media属性条件加载
❌ 忽略字体优化
❌ 不压缩CSS文件
❌ 不监控性能指标
```

#### 优化优先级建议

**第一优先级（必需）：**
1. 内联关键CSS（< 14KB）
2. 预加载首屏关键图片
3. 字体优化（preload + font-display: swap）
4. 异步加载非关键CSS

**第二优先级（推荐）：**
1. 预连接到CDN和第三方域名
2. 使用fetchpriority标记优先级
3. 预获取下一页资源
4. 响应式资源加载

**第三优先级（锦上添花）：**
1. DNS预解析
2. 模块预加载
3. 智能网络适应
4. 高级性能监控

### 技术栈推荐

**开发工具：**
- Chrome DevTools
- Lighthouse
- WebPageTest
- React DevTools

**构建工具：**
- Next.js（内置优化）
- Vite（快速构建）
- Webpack（灵活配置）
- Turbopack（极速构建）

**CSS工具：**
- PostCSS（转换处理）
- PurgeCSS（移除未用CSS）
- cssnano（压缩优化）
- Tailwind CSS（实用优先）

**字体服务：**
- Google Fonts
- Adobe Fonts
- Fontsource（自托管）
- Variable Fonts

### 最后建议

React 19的link和style标签优化为开发者提供了强大而灵活的资源管理能力。通过合理使用这些特性，可以显著提升应用性能和用户体验。记住：

1. **性能优化是持续的过程**，需要定期监控和调整
2. **测量比优化更重要**，先测量再优化
3. **用户体验优先**，不要为了优化而优化
4. **保持简单**，过度优化可能适得其反
5. **跟进最新实践**，Web性能标准在不断evolving

合理使用link和style标签，结合React 19的自动优化特性，能够打造出快速、流畅、用户体验优秀的现代Web应用！
