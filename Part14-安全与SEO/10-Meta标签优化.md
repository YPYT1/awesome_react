# Meta标签优化 - 完整实战指南

## 1. Meta标签概述

### 1.1 什么是Meta标签

Meta标签是HTML文档头部的元数据标签,向搜索引擎和浏览器提供页面信息。虽然用户看不到,但对SEO和社交分享至关重要。

**核心作用:**
- **SEO优化**: 影响搜索引擎排名和展示
- **社交分享**: 控制社交媒体预览
- **浏览器行为**: 控制viewport、字符集等
- **爬虫指令**: 指导搜索引擎如何索引

### 1.2 Meta标签分类

```html
<!-- 1. 基础Meta标签 -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="页面描述">
<meta name="keywords" content="关键词1, 关键词2">
<meta name="author" content="作者名">

<!-- 2. SEO Meta标签 -->
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
<meta name="google" content="nositelinkssearchbox">

<!-- 3. OpenGraph标签 (Facebook, LinkedIn等) -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="图片URL">
<meta property="og:type" content="website">

<!-- 4. Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="标题">
<meta name="twitter:description" content="描述">
<meta name="twitter:image" content="图片URL">

<!-- 5. 移动端Meta标签 -->
<meta name="theme-color" content="#000000">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

## 2. 基础Meta标签

### 2.1 字符集

```tsx
// Next.js默认设置
import Head from 'next/head';

export default function Page() {
  return (
    <Head>
      <meta charSet="UTF-8" />
    </Head>
  );
}

// React Helmet
import { Helmet } from 'react-helmet-async';

<Helmet>
  <meta charSet="UTF-8" />
</Helmet>
```

### 2.2 Viewport (移动端适配)

```tsx
// 标准viewport
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

// 禁止缩放
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

// 自适应viewport
<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />

// Next.js组件
export function ViewportMeta() {
  return (
    <Head>
      <meta 
        name="viewport" 
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0" 
      />
    </Head>
  );
}
```

### 2.3 Description (描述)

```tsx
// ✅ 优秀的描述
<meta 
  name="description" 
  content="深入学习React 19最新特性,包括Server Components、Suspense、并发渲染等。适合初学者到高级开发者,包含完整代码示例。" 
/>

// ❌ 不好的描述
<meta name="description" content="React tutorial" /> // 太短
<meta name="description" content="React React React..." /> // 关键词堆砌

// 动态描述生成
interface MetaDescriptionProps {
  description: string;
  maxLength?: number;
}

export function MetaDescription({ 
  description, 
  maxLength = 160 
}: MetaDescriptionProps) {
  // 截断过长描述
  const truncated = description.length > maxLength
    ? description.slice(0, maxLength - 3) + '...'
    : description;
  
  return (
    <Head>
      <meta name="description" content={truncated} />
    </Head>
  );
}

// 使用
<MetaDescription 
  description="这是一篇关于React Hooks的详细教程,涵盖useState、useEffect、useContext等所有核心Hooks的使用方法和最佳实践。" 
/>
```

### 2.4 Keywords (关键词)

```tsx
// ⚠️ 注意: Google已不再使用keywords标签进行排名
// 但某些搜索引擎可能仍然参考

// 合理的关键词设置
<meta 
  name="keywords" 
  content="React 19, React Hooks, Server Components, TypeScript, 前端开发" 
/>

// 关键词生成工具
function generateKeywords(
  primary: string,
  secondary: string[],
  maxKeywords: number = 10
): string {
  const keywords = [primary, ...secondary].slice(0, maxKeywords);
  return keywords.join(', ');
}

// 使用
const keywords = generateKeywords(
  'React Hooks',
  ['useState', 'useEffect', 'React 19', 'TypeScript', '前端教程']
);

<meta name="keywords" content={keywords} />
```

## 3. SEO Meta标签

### 3.1 Robots (爬虫指令)

```tsx
// 允许索引和跟踪链接(默认)
<meta name="robots" content="index, follow" />

// 不索引但跟踪链接
<meta name="robots" content="noindex, follow" />

// 索引但不跟踪链接
<meta name="robots" content="index, nofollow" />

// 完全不索引
<meta name="robots" content="noindex, nofollow" />

// 其他指令
<meta name="robots" content="noarchive" /> // 不缓存
<meta name="robots" content="nosnippet" /> // 不显示摘要
<meta name="robots" content="noimageindex" /> // 不索引图片
<meta name="robots" content="max-snippet:50" /> // 摘要最大字符数
<meta name="robots" content="max-image-preview:large" /> // 图片预览大小
<meta name="robots" content="max-video-preview:30" /> // 视频预览秒数

// 动态Robots组件
interface RobotsMetaProps {
  index?: boolean;
  follow?: boolean;
  archive?: boolean;
  snippet?: boolean;
}

export function RobotsMeta({
  index = true,
  follow = true,
  archive = true,
  snippet = true
}: RobotsMetaProps) {
  const directives = [
    index ? 'index' : 'noindex',
    follow ? 'follow' : 'nofollow',
    !archive && 'noarchive',
    !snippet && 'nosnippet'
  ].filter(Boolean);
  
  return (
    <meta name="robots" content={directives.join(', ')} />
  );
}

// 使用场景
// 私密页面
<RobotsMeta index={false} follow={false} />

// 感谢页面
<RobotsMeta index={false} follow={true} />

// 登录页面
<RobotsMeta index={true} follow={false} />
```

### 3.2 Googlebot特定指令

```tsx
// Google特定爬虫
<meta name="googlebot" content="index, follow" />
<meta name="googlebot-news" content="noindex" />

// 不显示站点链接搜索框
<meta name="google" content="nositelinkssearchbox" />

// 不翻译页面
<meta name="google" content="notranslate" />

// Google News发布日期
<meta name="pubdate" content="2024-01-15T10:00:00+08:00" />

// Google新闻关键词
<meta name="news_keywords" content="React 19, 前端开发, JavaScript" />
```

### 3.3 Canonical URL

```tsx
import { useRouter } from 'next/router';
import Head from 'next/head';

export function CanonicalMeta() {
  const router = useRouter();
  const baseUrl = 'https://yourdomain.com';
  
  // 移除查询参数
  const canonicalPath = router.asPath.split('?')[0];
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  
  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}

// 带查询参数的canonical
export function CanonicalWithParams() {
  const router = useRouter();
  const baseUrl = 'https://yourdomain.com';
  
  // 保留重要参数
  const importantParams = ['category', 'page'];
  const params = new URLSearchParams();
  
  importantParams.forEach(key => {
    const value = router.query[key];
    if (value) {
      params.set(key, String(value));
    }
  });
  
  const queryString = params.toString();
  const canonicalUrl = queryString 
    ? `${baseUrl}${router.pathname}?${queryString}`
    : `${baseUrl}${router.pathname}`;
  
  return <link rel="canonical" href={canonicalUrl} />;
}
```

## 4. OpenGraph标签(Facebook/LinkedIn)

### 4.1 基础OG标签

```tsx
// 完整的OpenGraph设置
interface OpenGraphProps {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  siteName?: string;
}

export function OpenGraphMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'My Site'
}: OpenGraphProps) {
  return (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="zh_CN" />
    </Head>
  );
}

// 使用
<OpenGraphMeta
  title="React 19 完整教程"
  description="从零开始学习React 19的所有特性"
  image="https://yourdomain.com/og-image.jpg"
  url="https://yourdomain.com/blog/react-19"
  type="article"
/>
```

### 4.2 文章类型OG标签

```tsx
interface ArticleOGProps extends OpenGraphProps {
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  section: string;
  tags?: string[];
}

export function ArticleOpenGraph({
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  ...baseProps
}: ArticleOGProps) {
  return (
    <>
      <OpenGraphMeta {...baseProps} type="article" />
      <Head>
        <meta property="article:published_time" content={publishedTime} />
        {modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        <meta property="article:author" content={author} />
        <meta property="article:section" content={section} />
        {tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
      </Head>
    </>
  );
}

// 使用
<ArticleOpenGraph
  title="React Hooks完全指南"
  description="深入理解React Hooks的工作原理"
  image="https://yourdomain.com/article-image.jpg"
  url="https://yourdomain.com/blog/react-hooks-guide"
  publishedTime="2024-01-15T10:00:00+08:00"
  modifiedTime="2024-01-16T15:30:00+08:00"
  author="张三"
  section="前端开发"
  tags={['React', 'Hooks', 'JavaScript']}
/>
```

### 4.3 产品类型OG标签

```tsx
interface ProductOGProps extends OpenGraphProps {
  price: number;
  currency: string;
  availability: 'in stock' | 'out of stock' | 'preorder';
}

export function ProductOpenGraph({
  price,
  currency,
  availability,
  ...baseProps
}: ProductOGProps) {
  return (
    <>
      <OpenGraphMeta {...baseProps} type="product" />
      <Head>
        <meta property="product:price:amount" content={String(price)} />
        <meta property="product:price:currency" content={currency} />
        <meta property="product:availability" content={availability} />
      </Head>
    </>
  );
}
```

### 4.4 图片优化

```tsx
// 多尺寸图片
<meta property="og:image" content="https://yourdomain.com/og-image-1200x630.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

// 备用图片
<meta property="og:image" content="https://yourdomain.com/og-image-square.jpg" />
<meta property="og:image:width" content="600" />
<meta property="og:image:height" content="600" />

// 图片类型
<meta property="og:image:type" content="image/jpeg" />

// 图片alt文本
<meta property="og:image:alt" content="React 19教程封面图" />

// 完整组件
interface OGImageProps {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

export function OGImage({ url, width, height, alt, type }: OGImageProps) {
  return (
    <Head>
      <meta property="og:image" content={url} />
      {width && <meta property="og:image:width" content={String(width)} />}
      {height && <meta property="og:image:height" content={String(height)} />}
      {alt && <meta property="og:image:alt" content={alt} />}
      {type && <meta property="og:image:type" content={type} />}
    </Head>
  );
}

// Facebook推荐尺寸
const FB_OG_IMAGE = {
  width: 1200,
  height: 630,
  ratio: '1.91:1'
};
```

## 5. Twitter Cards

### 5.1 Summary Card

```tsx
// 小图摘要卡片
export function TwitterSummaryCard({
  title,
  description,
  image
}: {
  title: string;
  description: string;
  image: string;
}) {
  return (
    <Head>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}

// Twitter用户名
<meta name="twitter:site" content="@yourusername" />
<meta name="twitter:creator" content="@authorusername" />
```

### 5.2 Summary Large Image Card

```tsx
// 大图摘要卡片(最常用)
export function TwitterLargeImageCard({
  title,
  description,
  image,
  site,
  creator
}: {
  title: string;
  description: string;
  image: string;
  site?: string;
  creator?: string;
}) {
  return (
    <Head>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {site && <meta name="twitter:site" content={site} />}
      {creator && <meta name="twitter:creator" content={creator} />}
    </Head>
  );
}

// Twitter推荐尺寸
const TWITTER_IMAGE = {
  width: 1200,
  height: 675,
  ratio: '16:9',
  maxSize: '5MB'
};
```

### 5.3 App Card

```tsx
// 应用卡片
export function TwitterAppCard({
  title,
  description,
  appId,
  appUrl
}: {
  title: string;
  description: string;
  appId: {
    iphone?: string;
    ipad?: string;
    googleplay?: string;
  };
  appUrl: {
    iphone?: string;
    ipad?: string;
    googleplay?: string;
  };
}) {
  return (
    <Head>
      <meta name="twitter:card" content="app" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {appId.iphone && (
        <>
          <meta name="twitter:app:id:iphone" content={appId.iphone} />
          <meta name="twitter:app:url:iphone" content={appUrl.iphone} />
        </>
      )}
      
      {appId.ipad && (
        <>
          <meta name="twitter:app:id:ipad" content={appId.ipad} />
          <meta name="twitter:app:url:ipad" content={appUrl.ipad} />
        </>
      )}
      
      {appId.googleplay && (
        <>
          <meta name="twitter:app:id:googleplay" content={appId.googleplay} />
          <meta name="twitter:app:url:googleplay" content={appUrl.googleplay} />
        </>
      )}
    </Head>
  );
}
```

## 6. 移动端Meta标签

### 6.1 iOS Safari

```tsx
// PWA配置
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="App Name" />

// 启动画面
<link rel="apple-touch-startup-image" href="/splash-screen.png" />

// 图标
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />

// 完整iOS配置组件
export function IOSMeta({
  appName,
  themeColor = '#000000',
  startupImage = '/splash-screen.png'
}: {
  appName: string;
  themeColor?: string;
  startupImage?: string;
}) {
  return (
    <Head>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={appName} />
      <meta name="theme-color" content={themeColor} />
      <link rel="apple-touch-startup-image" href={startupImage} />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    </Head>
  );
}
```

### 6.2 Android Chrome

```tsx
// 主题颜色
<meta name="theme-color" content="#000000" />

// Android Chrome全屏
<meta name="mobile-web-app-capable" content="yes" />

// manifest.json
<link rel="manifest" href="/manifest.json" />

// manifest.json内容
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 7. 其他重要Meta标签

### 7.1 安全相关

```tsx
// Content Security Policy
<meta 
  http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" 
/>

// 防止MIME类型嗅探
<meta http-equiv="X-Content-Type-Options" content="nosniff" />

// XSS保护
<meta http-equiv="X-XSS-Protection" content="1; mode=block" />

// 禁止在iframe中嵌入
<meta http-equiv="X-Frame-Options" content="DENY" />

// Referrer Policy
<meta name="referrer" content="strict-origin-when-cross-origin" />
```

### 7.2 作者和版权

```tsx
<meta name="author" content="张三" />
<meta name="copyright" content="© 2024 My Company" />
<meta name="generator" content="Next.js 14" />
<meta name="application-name" content="My App" />
```

### 7.3 地理位置

```tsx
<meta name="geo.region" content="CN-BJ" />
<meta name="geo.placename" content="Beijing" />
<meta name="geo.position" content="39.9042;116.4074" />
<meta name="ICBM" content="39.9042, 116.4074" />
```

## 8. 完整的Meta标签组件

### 8.1 通用SEO组件

```tsx
// SEOHead.tsx
import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  image = '/default-og-image.jpg',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  noindex = false
}: SEOProps) {
  const router = useRouter();
  const siteUrl = 'https://yourdomain.com';
  const canonicalUrl = `${siteUrl}${router.asPath}`;
  const fullTitle = `${title} | My Site`;
  
  return (
    <Head>
      {/* 基础Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="My Site" />
      
      {/* 文章特定 */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {tags.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />
    </Head>
  );
}

// 使用
<SEOHead
  title="React 19 完整教程"
  description="深入学习React 19的所有新特性"
  image="/blog/react-19-og.jpg"
  type="article"
  publishedTime="2024-01-15T10:00:00+08:00"
  author="张三"
  tags={['React', 'JavaScript', '前端']}
/>
```

### 8.2 产品页SEO组件

```tsx
// ProductSEO.tsx
interface ProductSEOProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'in stock' | 'out of stock' | 'preorder';
  brand: string;
  sku?: string;
}

export function ProductSEO({
  name,
  description,
  image,
  price,
  currency,
  availability,
  brand,
  sku
}: ProductSEOProps) {
  const router = useRouter();
  const siteUrl = 'https://yourdomain.com';
  const url = `${siteUrl}${router.asPath}`;
  
  return (
    <Head>
      <title>{name} | My Store</title>
      <meta name="description" content={description} />
      
      {/* Product OpenGraph */}
      <meta property="og:title" content={name} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={String(price)} />
      <meta property="product:price:currency" content={currency} />
      <meta property="product:availability" content={availability} />
      <meta property="product:brand" content={brand} />
      {sku && <meta property="product:retailer_item_id" content={sku} />}
      
      {/* Twitter Product */}
      <meta name="twitter:card" content="product" />
      <meta name="twitter:title" content={name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />
      <meta name="twitter:label1" content="Price" />
      <meta name="twitter:data1" content={`${currency} ${price}`} />
      <meta name="twitter:label2" content="Availability" />
      <meta name="twitter:data2" content={availability} />
    </Head>
  );
}
```

## 9. Meta标签测试与验证

### 9.1 测试工具

```typescript
// 1. Facebook分享调试器
https://developers.facebook.com/tools/debug/

// 2. Twitter Card验证器
https://cards-dev.twitter.com/validator

// 3. LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/

// 4. Google Rich Results Test
https://search.google.com/test/rich-results

// 5. Meta Tags检查器
https://metatags.io/
```

### 9.2 自动化测试

```typescript
// meta-tags.test.ts
import { render } from '@testing-library/react';
import { SEOHead } from './SEOHead';

describe('SEO Meta Tags', () => {
  it('should render correct title', () => {
    render(
      <SEOHead
        title="Test Page"
        description="Test description"
      />
    );
    
    expect(document.title).toBe('Test Page | My Site');
  });
  
  it('should render OpenGraph tags', () => {
    render(
      <SEOHead
        title="Test Page"
        description="Test description"
        image="/test-image.jpg"
      />
    );
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Test Page | My Site');
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toContain('/test-image.jpg');
  });
  
  it('should set noindex when specified', () => {
    render(
      <SEOHead
        title="Private Page"
        description="Private content"
        noindex={true}
      />
    );
    
    const robots = document.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex,nofollow');
  });
});
```

## 10. 最佳实践清单

```typescript
const metaTagsBestPractices = {
  title: [
    '长度控制在50-60字符',
    '包含主要关键词',
    '每个页面唯一',
    '格式: 页面标题 | 网站名称'
  ],
  
  description: [
    '长度控制在150-160字符',
    '准确描述页面内容',
    '包含行动号召(CTA)',
    '自然融入关键词'
  ],
  
  openGraph: [
    '图片尺寸1200x630px',
    '图片大小 < 8MB',
    '使用高质量图片',
    '包含品牌元素'
  ],
  
  twitter: [
    '图片尺寸1200x675px',
    '支持summary_large_image',
    '设置@username',
    '描述简洁明了'
  ],
  
  general: [
    '使用HTTPS',
    '设置canonical URL',
    '移动端适配viewport',
    'UTF-8字符编码',
    '合理使用robots标签'
  ]
};
```

## 11. 常见错误

```tsx
// ❌ 错误1: 所有页面使用相同meta
<meta name="description" content="Welcome to My Site" />

// ✅ 正确: 每个页面动态meta
<meta name="description" content={page.description} />

// ❌ 错误2: 描述过长
<meta name="description" content="这是一个非常非常非常... (200字符)" />

// ✅ 正确: 控制长度
<meta name="description" content={truncate(description, 160)} />

// ❌ 错误3: 缺少OG图片
<meta property="og:title" content="My Page" />
// 没有og:image

// ✅ 正确: 完整OG标签
<meta property="og:title" content="My Page" />
<meta property="og:image" content="/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

// ❌ 错误4: 图片路径错误
<meta property="og:image" content="og-image.jpg" />

// ✅ 正确: 完整URL
<meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
```

## 12. 总结

Meta标签优化的关键要点:

1. **标题优化**: 50-60字符,包含关键词,每页唯一
2. **描述优化**: 150-160字符,吸引点击,自然融入关键词
3. **OpenGraph**: 正确尺寸图片,完整标签,适配不同类型
4. **Twitter Cards**: 选择合适卡片类型,优化图片和文案
5. **移动端**: viewport配置,PWA支持,主题颜色
6. **技术SEO**: canonical URL, robots指令,安全头部

通过系统地优化Meta标签,可以显著提升搜索引擎排名和社交媒体分享效果。

