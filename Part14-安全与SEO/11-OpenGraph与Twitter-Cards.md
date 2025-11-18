# OpenGraph与Twitter Cards - 社交媒体优化完整指南

## 1. 概述

### 1.1 什么是OpenGraph

OpenGraph(OG)是Facebook开发的协议,用于控制网页在社交媒体上分享时的展示效果。现已被LinkedIn、Pinterest等平台广泛采用。

**核心作用:**
- **控制标题**: 自定义分享标题
- **设置描述**: 精准描述分享内容
- **定制图片**: 使用吸引人的预览图
- **指定类型**: 标识内容类型(文章/产品/视频等)

### 1.2 什么是Twitter Cards

Twitter Cards是Twitter的类似协议,用于在Twitter上展示丰富的内容预览。

**卡片类型:**
- **Summary**: 小图摘要卡片
- **Summary Large Image**: 大图摘要卡片
- **App**: 应用卡片
- **Player**: 视频/音频播放器卡片

### 1.3 为什么重要

```typescript
// 数据统计
- 带图片的推文互动率提高150%
- 优化的OG标签可提高点击率35%
- 正确的预览图可提高分享率50%
```

## 2. OpenGraph基础

### 2.1 必需的OG标签

```tsx
// 最基础的4个必需标签
<meta property="og:title" content="页面标题" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:image" content="https://example.com/image.jpg" />

// React组件实现
import Head from 'next/head';

interface BaseOGProps {
  title: string;
  type: string;
  url: string;
  image: string;
}

export function BaseOpenGraph({ title, type, url, image }: BaseOGProps) {
  return (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
    </Head>
  );
}
```

### 2.2 推荐的OG标签

```tsx
// 完整的OpenGraph标签集
interface OpenGraphProps {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: OGType;
  siteName?: string;
  locale?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
}

type OGType = 
  | 'website' 
  | 'article' 
  | 'product' 
  | 'video.movie' 
  | 'music.song' 
  | 'profile';

export function OpenGraph({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'My Website',
  locale = 'zh_CN',
  imageWidth = 1200,
  imageHeight = 630,
  imageAlt
}: OpenGraphProps) {
  return (
    <Head>
      {/* 基础标签 */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* 图片标签 */}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:type" content="image/jpeg" />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      
      {/* 安全URL(HTTPS) */}
      <meta property="og:image:secure_url" content={image} />
    </Head>
  );
}

// 使用示例
<OpenGraph
  title="React 19 完整教程"
  description="深入学习React 19的所有新特性,包括Server Components、Suspense等"
  image="https://example.com/react-19-tutorial.jpg"
  url="https://example.com/blog/react-19-tutorial"
  type="article"
  imageAlt="React 19教程封面"
/>
```

## 3. OpenGraph内容类型

### 3.1 Article类型

```tsx
// 文章类型专用标签
interface ArticleOGProps extends OpenGraphProps {
  publishedTime: string;
  modifiedTime?: string;
  expirationTime?: string;
  author: string | string[];
  section: string;
  tags?: string[];
}

export function ArticleOG({
  publishedTime,
  modifiedTime,
  expirationTime,
  author,
  section,
  tags = [],
  ...baseProps
}: ArticleOGProps) {
  const authors = Array.isArray(author) ? author : [author];
  
  return (
    <>
      <OpenGraph {...baseProps} type="article" />
      <Head>
        {/* 发布和修改时间 */}
        <meta property="article:published_time" content={publishedTime} />
        {modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {expirationTime && (
          <meta property="article:expiration_time" content={expirationTime} />
        )}
        
        {/* 作者 - 可以有多个 */}
        {authors.map((authorUrl, index) => (
          <meta key={index} property="article:author" content={authorUrl} />
        ))}
        
        {/* 分类 */}
        <meta property="article:section" content={section} />
        
        {/* 标签 - 可以有多个 */}
        {tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}
      </Head>
    </>
  );
}

// 使用示例
<ArticleOG
  title="React Hooks深度解析"
  description="全面了解React Hooks的工作原理"
  image="https://example.com/hooks-article.jpg"
  url="https://example.com/blog/react-hooks"
  publishedTime="2024-01-15T10:00:00+08:00"
  modifiedTime="2024-01-16T15:30:00+08:00"
  author={[
    'https://example.com/author/zhangsan',
    'https://example.com/author/lisi'
  ]}
  section="前端开发"
  tags={['React', 'Hooks', 'JavaScript', '前端']}
/>
```

### 3.2 Product类型

```tsx
// 产品类型专用标签
interface ProductOGProps extends OpenGraphProps {
  price: {
    amount: number;
    currency: string;
  };
  availability: 'in stock' | 'out of stock' | 'preorder' | 'discontinued';
  condition?: 'new' | 'refurbished' | 'used';
  retailerItemId?: string;
}

export function ProductOG({
  price,
  availability,
  condition = 'new',
  retailerItemId,
  ...baseProps
}: ProductOGProps) {
  return (
    <>
      <OpenGraph {...baseProps} type="product" />
      <Head>
        {/* 价格 */}
        <meta property="product:price:amount" content={String(price.amount)} />
        <meta property="product:price:currency" content={price.currency} />
        
        {/* 库存状态 */}
        <meta property="product:availability" content={availability} />
        
        {/* 商品状态 */}
        <meta property="product:condition" content={condition} />
        
        {/* SKU */}
        {retailerItemId && (
          <meta property="product:retailer_item_id" content={retailerItemId} />
        )}
      </Head>
    </>
  );
}

// 使用示例
<ProductOG
  title="MacBook Pro 16英寸"
  description="强大的M3 Max芯片,专业级性能"
  image="https://example.com/macbook-pro.jpg"
  url="https://example.com/products/macbook-pro-16"
  price={{ amount: 19999, currency: 'CNY' }}
  availability="in stock"
  condition="new"
  retailerItemId="MACBOOK-PRO-16-2024"
/>
```

### 3.3 Video类型

```tsx
// 视频类型专用标签
interface VideoOGProps extends OpenGraphProps {
  videoUrl: string;
  videoSecureUrl?: string;
  videoType?: string;
  videoWidth?: number;
  videoHeight?: number;
  duration?: number;
  releaseDate?: string;
  tags?: string[];
  actors?: string[];
  directors?: string[];
}

export function VideoOG({
  videoUrl,
  videoSecureUrl,
  videoType = 'video/mp4',
  videoWidth = 1920,
  videoHeight = 1080,
  duration,
  releaseDate,
  tags = [],
  actors = [],
  directors = [],
  ...baseProps
}: VideoOGProps) {
  return (
    <>
      <OpenGraph {...baseProps} type="video.movie" />
      <Head>
        {/* 视频URL */}
        <meta property="og:video" content={videoUrl} />
        {videoSecureUrl && (
          <meta property="og:video:secure_url" content={videoSecureUrl} />
        )}
        <meta property="og:video:type" content={videoType} />
        <meta property="og:video:width" content={String(videoWidth)} />
        <meta property="og:video:height" content={String(videoHeight)} />
        
        {/* 视频元数据 */}
        {duration && (
          <meta property="video:duration" content={String(duration)} />
        )}
        {releaseDate && (
          <meta property="video:release_date" content={releaseDate} />
        )}
        
        {/* 演员 */}
        {actors.map((actor, index) => (
          <meta key={index} property="video:actor" content={actor} />
        ))}
        
        {/* 导演 */}
        {directors.map((director, index) => (
          <meta key={index} property="video:director" content={director} />
        ))}
        
        {/* 标签 */}
        {tags.map((tag, index) => (
          <meta key={index} property="video:tag" content={tag} />
        ))}
      </Head>
    </>
  );
}
```

### 3.4 Profile类型

```tsx
// 个人资料类型
interface ProfileOGProps extends OpenGraphProps {
  firstName: string;
  lastName: string;
  username?: string;
  gender?: 'male' | 'female';
}

export function ProfileOG({
  firstName,
  lastName,
  username,
  gender,
  ...baseProps
}: ProfileOGProps) {
  return (
    <>
      <OpenGraph {...baseProps} type="profile" />
      <Head>
        <meta property="profile:first_name" content={firstName} />
        <meta property="profile:last_name" content={lastName} />
        {username && <meta property="profile:username" content={username} />}
        {gender && <meta property="profile:gender" content={gender} />}
      </Head>
    </>
  );
}
```

## 4. Twitter Cards

### 4.1 Summary Card (小图摘要)

```tsx
// 小图摘要卡片
interface TwitterSummaryProps {
  title: string;
  description: string;
  image: string;
  site?: string;
  creator?: string;
}

export function TwitterSummary({
  title,
  description,
  image,
  site,
  creator
}: TwitterSummaryProps) {
  return (
    <Head>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {site && <meta name="twitter:site" content={site} />}
      {creator && <meta name="twitter:creator" content={creator} />}
    </Head>
  );
}

// 图片要求
const SUMMARY_CARD_IMAGE = {
  minWidth: 144,
  minHeight: 144,
  maxSize: 5 * 1024 * 1024, // 5MB
  aspectRatio: '1:1',
  formats: ['JPG', 'PNG', 'WEBP', 'GIF']
};

// 使用示例
<TwitterSummary
  title="React Tips"
  description="学习React的实用技巧"
  image="https://example.com/square-image.jpg"
  site="@mywebsite"
  creator="@author"
/>
```

### 4.2 Summary Large Image (大图摘要)

```tsx
// 大图摘要卡片 - 最常用
interface TwitterLargeImageProps {
  title: string;
  description: string;
  image: string;
  site?: string;
  creator?: string;
  imageAlt?: string;
}

export function TwitterLargeImage({
  title,
  description,
  image,
  site,
  creator,
  imageAlt
}: TwitterLargeImageProps) {
  return (
    <Head>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
      {site && <meta name="twitter:site" content={site} />}
      {creator && <meta name="twitter:creator" content={creator} />}
    </Head>
  );
}

// 图片要求
const LARGE_IMAGE_CARD = {
  width: 1200,
  height: 675,
  maxWidth: 4096,
  maxHeight: 4096,
  maxSize: 5 * 1024 * 1024, // 5MB
  aspectRatio: '16:9' // 或 2:1
};

// 使用示例
<TwitterLargeImage
  title="React 19 新特性"
  description="探索React 19带来的革命性变化"
  image="https://example.com/react-19-banner.jpg"
  imageAlt="React 19新特性介绍图"
  site="@reactjs"
  creator="@author"
/>
```

### 4.3 App Card (应用卡片)

```tsx
// 应用卡片
interface TwitterAppCardProps {
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
  appName?: {
    iphone?: string;
    ipad?: string;
    googleplay?: string;
  };
}

export function TwitterAppCard({
  title,
  description,
  appId,
  appUrl,
  appName
}: TwitterAppCardProps) {
  return (
    <Head>
      <meta name="twitter:card" content="app" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* iPhone */}
      {appId.iphone && (
        <>
          <meta name="twitter:app:id:iphone" content={appId.iphone} />
          {appUrl.iphone && (
            <meta name="twitter:app:url:iphone" content={appUrl.iphone} />
          )}
          {appName?.iphone && (
            <meta name="twitter:app:name:iphone" content={appName.iphone} />
          )}
        </>
      )}
      
      {/* iPad */}
      {appId.ipad && (
        <>
          <meta name="twitter:app:id:ipad" content={appId.ipad} />
          {appUrl.ipad && (
            <meta name="twitter:app:url:ipad" content={appUrl.ipad} />
          )}
          {appName?.ipad && (
            <meta name="twitter:app:name:ipad" content={appName.ipad} />
          )}
        </>
      )}
      
      {/* Google Play */}
      {appId.googleplay && (
        <>
          <meta name="twitter:app:id:googleplay" content={appId.googleplay} />
          {appUrl.googleplay && (
            <meta name="twitter:app:url:googleplay" content={appUrl.googleplay} />
          )}
          {appName?.googleplay && (
            <meta name="twitter:app:name:googleplay" content={appName.googleplay} />
          )}
        </>
      )}
    </Head>
  );
}

// 使用示例
<TwitterAppCard
  title="下载我们的App"
  description="移动端体验更佳"
  appId={{
    iphone: '123456789',
    googleplay: 'com.example.app'
  }}
  appUrl={{
    iphone: 'myapp://home',
    googleplay: 'myapp://home'
  }}
  appName={{
    iphone: 'My App',
    googleplay: 'My App'
  }}
/>
```

### 4.4 Player Card (播放器卡片)

```tsx
// 视频/音频播放器卡片
interface TwitterPlayerCardProps {
  title: string;
  description: string;
  image: string;
  player: string;
  playerWidth: number;
  playerHeight: number;
  playerStream?: string;
  site?: string;
}

export function TwitterPlayerCard({
  title,
  description,
  image,
  player,
  playerWidth,
  playerHeight,
  playerStream,
  site
}: TwitterPlayerCardProps) {
  return (
    <Head>
      <meta name="twitter:card" content="player" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:player" content={player} />
      <meta name="twitter:player:width" content={String(playerWidth)} />
      <meta name="twitter:player:height" content={String(playerHeight)} />
      {playerStream && (
        <meta name="twitter:player:stream" content={playerStream} />
      )}
      {site && <meta name="twitter:site" content={site} />}
    </Head>
  );
}

// 使用示例
<TwitterPlayerCard
  title="观看教程视频"
  description="React 19完整教程"
  image="https://example.com/video-thumbnail.jpg"
  player="https://example.com/video-player?id=123"
  playerWidth={1280}
  playerHeight={720}
  playerStream="https://example.com/video.mp4"
  site="@mywebsite"
/>
```

## 5. 统一的社交媒体组件

### 5.1 完整的社交分享组件

```tsx
// SocialMeta.tsx
import { useRouter } from 'next/router';
import Head from 'next/head';

interface SocialMetaProps {
  title: string;
  description: string;
  image: string;
  type?: 'website' | 'article' | 'product';
  
  // 可选的文章信息
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author: string;
    section: string;
    tags?: string[];
  };
  
  // 可选的产品信息
  product?: {
    price: number;
    currency: string;
    availability: string;
  };
  
  // Twitter特定
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  
  // 站点信息
  siteName?: string;
  locale?: string;
}

export function SocialMeta({
  title,
  description,
  image,
  type = 'website',
  article,
  product,
  twitterCard = 'summary_large_image',
  twitterSite,
  twitterCreator,
  siteName = 'My Website',
  locale = 'zh_CN'
}: SocialMetaProps) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const currentUrl = `${siteUrl}${router.asPath}`;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  return (
    <Head>
      {/* OpenGraph基础 */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* OpenGraph图片 */}
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      
      {/* 文章特定 */}
      {type === 'article' && article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* 产品特定 */}
      {type === 'product' && product && (
        <>
          <meta property="product:price:amount" content={String(product.price)} />
          <meta property="product:price:currency" content={product.currency} />
          <meta property="product:availability" content={product.availability} />
        </>
      )}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* 产品的Twitter特定标签 */}
      {type === 'product' && product && (
        <>
          <meta name="twitter:label1" content="价格" />
          <meta name="twitter:data1" content={`${product.currency} ${product.price}`} />
          <meta name="twitter:label2" content="库存" />
          <meta name="twitter:data2" content={product.availability} />
        </>
      )}
    </Head>
  );
}

// 使用示例 - 文章
<SocialMeta
  title="React 19深度解析"
  description="全面了解React 19的新特性和改进"
  image="/blog/react-19-cover.jpg"
  type="article"
  article={{
    publishedTime: '2024-01-15T10:00:00+08:00',
    author: 'https://example.com/author/zhangsan',
    section: '前端开发',
    tags: ['React', 'JavaScript']
  }}
  twitterSite="@mywebsite"
  twitterCreator="@author"
/>

// 使用示例 - 产品
<SocialMeta
  title="MacBook Pro 16英寸"
  description="强大的M3 Max芯片"
  image="/products/macbook-pro.jpg"
  type="product"
  product={{
    price: 19999,
    currency: 'CNY',
    availability: 'in stock'
  }}
  twitterCard="summary_large_image"
/>
```

## 6. 图片优化

### 6.1 OG图片生成器

```tsx
// 动态生成OG图片
import { ImageResponse } from '@vercel/og';

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Default Title';
  const description = searchParams.get('description') || 'Default Description';
  
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          padding: '60px',
          color: 'white'
        }}
      >
        <h1 style={{ fontSize: '72px', margin: 0 }}>{title}</h1>
        <p style={{ fontSize: '32px', opacity: 0.8, marginTop: '20px' }}>
          {description}
        </p>
        <div style={{ marginTop: 'auto', fontSize: '24px', opacity: 0.6 }}>
          example.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}

// 使用
const ogImageUrl = `/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.excerpt)}`;

<meta property="og:image" content={ogImageUrl} />
```

### 6.2 图片规格参考

```typescript
// OpenGraph图片规格
const OG_IMAGE_SPECS = {
  facebook: {
    recommended: { width: 1200, height: 630 },
    minimum: { width: 600, height: 315 },
    aspectRatio: '1.91:1',
    maxSize: 8 * 1024 * 1024, // 8MB
    formats: ['JPG', 'PNG']
  },
  
  linkedin: {
    recommended: { width: 1200, height: 627 },
    minimum: { width: 520, height: 272 },
    aspectRatio: '1.91:1',
    maxSize: 5 * 1024 * 1024
  },
  
  pinterest: {
    recommended: { width: 1000, height: 1500 },
    aspectRatio: '2:3',
    maxSize: 32 * 1024 * 1024
  }
};

// Twitter图片规格
const TWITTER_IMAGE_SPECS = {
  summary: {
    size: { width: 144, height: 144 },
    aspectRatio: '1:1',
    maxSize: 5 * 1024 * 1024
  },
  
  summary_large_image: {
    recommended: { width: 1200, height: 675 },
    minimum: { width: 300, height: 157 },
    aspectRatio: '16:9' // 或 2:1
  },
  
  player: {
    recommended: { width: 1280, height: 720 },
    aspectRatio: '16:9'
  }
};

// 图片验证
function validateOGImage(width: number, height: number, size: number) {
  const aspectRatio = width / height;
  const targetRatio = 1200 / 630;
  const tolerance = 0.1;
  
  return {
    valid: Math.abs(aspectRatio - targetRatio) < tolerance && size <= 8 * 1024 * 1024,
    aspectRatio: aspectRatio.toFixed(2),
    size: (size / (1024 * 1024)).toFixed(2) + 'MB'
  };
}
```

## 7. 调试与验证

### 7.1 验证工具

```typescript
// 1. Facebook Sharing Debugger
const facebookDebugger = 'https://developers.facebook.com/tools/debug/';

// 2. Twitter Card Validator
const twitterValidator = 'https://cards-dev.twitter.com/validator';

// 3. LinkedIn Post Inspector
const linkedinInspector = 'https://www.linkedin.com/post-inspector/';

// 4. Open Graph Check
const ogCheck = 'https://opengraphcheck.com/';

// 使用方法
function debugSocialTags(url: string) {
  return {
    facebook: `${facebookDebugger}?q=${encodeURIComponent(url)}`,
    twitter: `${twitterValidator}?url=${encodeURIComponent(url)}`,
    linkedin: `${linkedinInspector}?url=${encodeURIComponent(url)}`
  };
}
```

### 7.2 自动化测试

```typescript
// social-tags.test.ts
import { render } from '@testing-library/react';
import { SocialMeta } from './SocialMeta';

describe('Social Meta Tags', () => {
  it('renders OpenGraph tags correctly', () => {
    render(
      <SocialMeta
        title="Test Title"
        description="Test Description"
        image="/test-image.jpg"
      />
    );
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toBe('Test Title');
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toContain('/test-image.jpg');
  });
  
  it('renders Twitter Cards correctly', () => {
    render(
      <SocialMeta
        title="Test Title"
        description="Test Description"
        image="/test-image.jpg"
        twitterCard="summary_large_image"
      />
    );
    
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });
  
  it('renders article tags when type is article', () => {
    render(
      <SocialMeta
        title="Test Article"
        description="Test Description"
        image="/test-image.jpg"
        type="article"
        article={{
          publishedTime: '2024-01-15T10:00:00+08:00',
          author: 'https://example.com/author',
          section: 'Tech',
          tags: ['React', 'JavaScript']
        }}
      />
    );
    
    const articleTime = document.querySelector('meta[property="article:published_time"]');
    expect(articleTime?.getAttribute('content')).toBe('2024-01-15T10:00:00+08:00');
    
    const articleTags = document.querySelectorAll('meta[property="article:tag"]');
    expect(articleTags).toHaveLength(2);
  });
});
```

## 8. 常见问题与解决方案

### 8.1 图片不显示

```typescript
// 问题: 相对路径图片
<meta property="og:image" content="/image.jpg" />

// 解决: 使用完整URL
const getFullImageUrl = (imagePath: string, baseUrl: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

<meta property="og:image" content={getFullImageUrl(image, 'https://example.com')} />
```

### 8.2 缓存问题

```typescript
// Facebook缓存清理
async function clearFacebookCache(url: string) {
  const response = await fetch(
    `https://graph.facebook.com/?id=${encodeURIComponent(url)}&scrape=true`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FB_ACCESS_TOKEN}`
      }
    }
  );
  
  return response.json();
}

// 手动清理: https://developers.facebook.com/tools/debug/
```

### 8.3 多语言支持

```tsx
// 多语言OG标签
export function MultiLanguageOG({ locale }: { locale: string }) {
  const alternateLocales = ['en_US', 'zh_CN', 'ja_JP'];
  
  return (
    <Head>
      <meta property="og:locale" content={locale} />
      {alternateLocales
        .filter(l => l !== locale)
        .map(altLocale => (
          <meta
            key={altLocale}
            property="og:locale:alternate"
            content={altLocale}
          />
        ))
      }
    </Head>
  );
}
```

## 9. 最佳实践

```typescript
const socialMediaBestPractices = {
  openGraph: [
    '始终使用完整URL(包括https://)',
    '图片尺寸1200x630px',
    '标题不超过60个字符',
    '描述不超过200个字符',
    '提供高质量图片(>300KB)',
    '使用og:image:alt提供图片描述'
  ],
  
  twitter: [
    '优先使用summary_large_image',
    '图片尺寸1200x675px',
    '设置@username获得通知',
    '使用twitter:image:alt',
    '测试不同卡片类型效果'
  ],
  
  images: [
    '使用JPEG格式(文件小)',
    '避免纯文字图片',
    '保持品牌一致性',
    '确保在移动端清晰',
    '添加logo/水印'
  ],
  
  general: [
    '每个页面唯一的OG标签',
    '在多个平台测试',
    '定期检查失效链接',
    '监控分享数据',
    'A/B测试不同图片'
  ]
};
```

## 10. 总结

OpenGraph和Twitter Cards优化关键要点:

1. **完整配置**: 包含所有必需和推荐标签
2. **图片优化**: 使用正确尺寸和格式
3. **类型特定**: 根据内容类型添加专属标签
4. **验证测试**: 使用官方工具验证效果
5. **性能监控**: 跟踪社交分享数据
6. **持续优化**: 基于数据调整策略

通过正确实施OpenGraph和Twitter Cards,可以显著提升社交媒体的分享效果和用户参与度。

