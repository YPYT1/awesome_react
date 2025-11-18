# 结构化数据(Schema.org) - 搜索引擎富媒体展示完整指南

## 1. 结构化数据概述

### 1.1 什么是结构化数据

结构化数据(Structured Data)是一种标准化格式,帮助搜索引擎理解网页内容。Schema.org是最广泛使用的结构化数据词汇表。

**核心作用:**
- **增强搜索结果**: 显示星级评分、价格、图片等
- **提高点击率**: 富媒体结果更吸引眼球
- **语义理解**: 帮助搜索引擎理解内容关系
- **语音搜索**: 优化语音助手的搜索结果

### 1.2 Rich Results(富媒体结果)类型

```typescript
// Google支持的富媒体结果
const richResultsTypes = [
  '文章(Article)',
  '面包屑导航(Breadcrumb)',
  '轮播(Carousel)',
  '课程(Course)',
  '活动(Event)',
  'FAQ(常见问题)',
  'HowTo(操作指南)',
  '工作发布(JobPosting)',
  '本地企业(LocalBusiness)',
  '产品(Product)',
  '食谱(Recipe)',
  '评论(Review)',
  '视频(Video)',
  '软件应用(SoftwareApplication)'
];
```

### 1.3 实现格式

```html
<!-- 1. JSON-LD (推荐) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题"
}
</script>

<!-- 2. Microdata -->
<div itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">文章标题</h1>
</div>

<!-- 3. RDFa -->
<div vocab="https://schema.org/" typeof="Article">
  <h1 property="headline">文章标题</h1>
</div>
```

## 2. JSON-LD基础实现

### 2.1 基础JSON-LD组件

```tsx
// JSONLDScript.tsx
import Head from 'next/head';

interface JSONLDProps {
  data: Record<string, any>;
}

export function JSONLD({ data }: JSONLDProps) {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data)
        }}
      />
    </Head>
  );
}

// 使用示例
<JSONLD data={{
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'React 19 完整教程',
  author: {
    '@type': 'Person',
    name: '张三'
  }
}} />
```

### 2.2 WebSite Schema

```tsx
// WebSiteSchema.tsx
interface WebSiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}

export function WebSiteSchema({
  name,
  url,
  description,
  searchUrl
}: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${searchUrl}?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<WebSiteSchema
  name="我的网站"
  url="https://example.com"
  description="专业的前端开发教程网站"
  searchUrl="https://example.com/search"
/>
```

### 2.3 Organization Schema

```tsx
// OrganizationSchema.tsx
interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
  sameAs?: string[];
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  contactPoint,
  sameAs = []
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo
    },
    description,
    ...(contactPoint && { contactPoint }),
    ...(sameAs.length > 0 && { sameAs })
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<OrganizationSchema
  name="Example Inc."
  url="https://example.com"
  logo="https://example.com/logo.png"
  description="领先的技术公司"
  contactPoint={{
    telephone: '+86-123-456-7890',
    contactType: 'customer service'
  }}
  sameAs={[
    'https://twitter.com/example',
    'https://facebook.com/example',
    'https://linkedin.com/company/example'
  ]}
/>
```

## 3. 内容类型Schema

### 3.1 Article Schema

```tsx
// ArticleSchema.tsx
interface ArticleSchemaProps {
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  url: string;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  url
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url })
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<ArticleSchema
  headline="React 19 新特性详解"
  description="深入了解React 19带来的革命性变化"
  image={[
    'https://example.com/article-image-1.jpg',
    'https://example.com/article-image-2.jpg'
  ]}
  datePublished="2024-01-15T10:00:00+08:00"
  dateModified="2024-01-16T15:30:00+08:00"
  author={{
    name: '张三',
    url: 'https://example.com/author/zhangsan'
  }}
  publisher={{
    name: 'Example Blog',
    logo: 'https://example.com/logo.png'
  }}
  url="https://example.com/blog/react-19"
/>
```

### 3.2 BlogPosting Schema

```tsx
// BlogPostingSchema.tsx (继承Article)
interface BlogPostingSchemaProps extends ArticleSchemaProps {
  wordCount?: number;
  keywords?: string[];
  articleSection?: string;
}

export function BlogPostingSchema({
  wordCount,
  keywords,
  articleSection,
  ...articleProps
}: BlogPostingSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: articleProps.headline,
    description: articleProps.description,
    image: articleProps.image,
    datePublished: articleProps.datePublished,
    dateModified: articleProps.dateModified || articleProps.datePublished,
    author: {
      '@type': 'Person',
      name: articleProps.author.name,
      ...(articleProps.author.url && { url: articleProps.author.url })
    },
    publisher: {
      '@type': 'Organization',
      name: articleProps.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: articleProps.publisher.logo
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleProps.url
    },
    ...(wordCount && { wordCount }),
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(articleSection && { articleSection })
  };
  
  return <JSONLD data={schema} />;
}
```

### 3.3 Video Schema

```tsx
// VideoSchema.tsx
interface VideoSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string[];
  uploadDate: string;
  duration?: string; // ISO 8601格式: PT1H30M
  contentUrl?: string;
  embedUrl?: string;
  interactionStatistic?: {
    interactionType: string;
    userInteractionCount: number;
  };
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
  interactionStatistic
}: VideoSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    ...(duration && { duration }),
    ...(contentUrl && { contentUrl }),
    ...(embedUrl && { embedUrl }),
    ...(interactionStatistic && { interactionStatistic })
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<VideoSchema
  name="React Hooks教程"
  description="完整的React Hooks使用指南"
  thumbnailUrl={['https://example.com/video-thumb.jpg']}
  uploadDate="2024-01-15T10:00:00+08:00"
  duration="PT15M"
  contentUrl="https://example.com/video.mp4"
  embedUrl="https://example.com/embed/video123"
  interactionStatistic={{
    interactionType: 'https://schema.org/WatchAction',
    userInteractionCount: 5000
  }}
/>
```

## 4. 商业Schema

### 4.1 Product Schema

```tsx
// ProductSchema.tsx
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  sku?: string;
  brand: {
    name: string;
  };
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url?: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: {
      ratingValue: number;
      bestRating?: number;
    };
  }>;
}

export function ProductSchema({
  name,
  description,
  image,
  sku,
  brand,
  offers,
  aggregateRating,
  review
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    ...(sku && { sku }),
    brand: {
      '@type': 'Brand',
      name: brand.name
    },
    offers: {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency,
      availability: `https://schema.org/${offers.availability}`,
      ...(offers.url && { url: offers.url }),
      ...(offers.priceValidUntil && { priceValidUntil: offers.priceValidUntil })
    },
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1
      }
    }),
    ...(review && {
      review: review.map(r => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.author
        },
        datePublished: r.datePublished,
        reviewBody: r.reviewBody,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.reviewRating.ratingValue,
          bestRating: r.reviewRating.bestRating || 5
        }
      }))
    })
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<ProductSchema
  name="MacBook Pro 16英寸"
  description="强大的M3 Max芯片，专业级性能"
  image={[
    'https://example.com/macbook-1.jpg',
    'https://example.com/macbook-2.jpg'
  ]}
  sku="MBP16-2024"
  brand={{ name: 'Apple' }}
  offers={{
    price: 19999,
    priceCurrency: 'CNY',
    availability: 'InStock',
    url: 'https://example.com/products/macbook-pro-16',
    priceValidUntil: '2024-12-31'
  }}
  aggregateRating={{
    ratingValue: 4.8,
    reviewCount: 256
  }}
  review={[
    {
      author: '李四',
      datePublished: '2024-01-10',
      reviewBody: '性能强劲，屏幕优秀',
      reviewRating: { ratingValue: 5 }
    }
  ]}
/>
```

### 4.2 LocalBusiness Schema

```tsx
// LocalBusinessSchema.tsx
interface LocalBusinessSchemaProps {
  name: string;
  image: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  url: string;
  telephone: string;
  openingHours: string[];
  priceRange?: string;
}

export function LocalBusinessSchema({
  name,
  image,
  address,
  geo,
  url,
  telephone,
  openingHours,
  priceRange
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant', // 或 'Store', 'Cafe' 等
    name,
    image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude
    },
    url,
    telephone,
    openingHoursSpecification: openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2]
    })),
    ...(priceRange && { priceRange })
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<LocalBusinessSchema
  name="美味餐厅"
  image="https://example.com/restaurant.jpg"
  address={{
    streetAddress: '中关村大街1号',
    addressLocality: '北京',
    addressRegion: '北京市',
    postalCode: '100000',
    addressCountry: 'CN'
  }}
  geo={{
    latitude: 39.9042,
    longitude: 116.4074
  }}
  url="https://example.com"
  telephone="+86-10-12345678"
  openingHours={[
    'Monday 09:00 22:00',
    'Tuesday 09:00 22:00',
    'Wednesday 09:00 22:00'
  ]}
  priceRange="$$"
/>
```

## 5. 交互Schema

### 5.1 FAQ Schema

```tsx
// FAQSchema.tsx
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<FAQSchema faqs={[
  {
    question: 'React 19有哪些新特性?',
    answer: 'React 19引入了Server Components、Actions、use hook等新特性。'
  },
  {
    question: 'React 19什么时候发布?',
    answer: 'React 19预计在2024年正式发布。'
  }
]} />
```

### 5.2 HowTo Schema

```tsx
// HowToSchema.tsx
interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  image?: string;
  totalTime?: string; // ISO 8601: PT30M
  estimatedCost?: {
    currency: string;
    value: number;
  };
  tool?: string[];
  supply?: string[];
  steps: HowToStep[];
}

export function HowToSchema({
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  tool,
  supply,
  steps
}: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(image && { image }),
    ...(totalTime && { totalTime }),
    ...(estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: estimatedCost.currency,
        value: estimatedCost.value
      }
    }),
    ...(tool && { tool }),
    ...(supply && { supply }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url })
    }))
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<HowToSchema
  name="如何创建React应用"
  description="从零开始创建一个React应用的完整步骤"
  totalTime="PT30M"
  tool={['Node.js', 'npm']}
  steps={[
    {
      name: '安装Node.js',
      text: '从官网下载并安装Node.js'
    },
    {
      name: '创建项目',
      text: '运行 npx create-react-app my-app'
    },
    {
      name: '启动项目',
      text: '运行 npm start'
    }
  ]}
/>
```

### 5.3 Course Schema

```tsx
// CourseSchema.tsx
interface CourseSchemaProps {
  name: string;
  description: string;
  provider: {
    name: string;
    url?: string;
  };
  hasCourseInstance?: {
    courseMode: string; // 'online' | 'onsite' | 'blended'
    courseWorkload?: string; // ISO 8601: PT10H
    instructor?: {
      name: string;
    };
  };
  offers?: {
    price: number;
    priceCurrency: string;
    availability?: string;
  };
}

export function CourseSchema({
  name,
  description,
  provider,
  hasCourseInstance,
  offers
}: CourseSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      ...(provider.url && { url: provider.url })
    },
    ...(hasCourseInstance && {
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: hasCourseInstance.courseMode,
        ...(hasCourseInstance.courseWorkload && {
          courseWorkload: hasCourseInstance.courseWorkload
        }),
        ...(hasCourseInstance.instructor && {
          instructor: {
            '@type': 'Person',
            name: hasCourseInstance.instructor.name
          }
        })
      }
    }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency,
        ...(offers.availability && {
          availability: `https://schema.org/${offers.availability}`
        })
      }
    })
  };
  
  return <JSONLD data={schema} />;
}
```

## 6. 导航Schema

### 6.1 BreadcrumbList Schema

```tsx
// BreadcrumbSchema.tsx
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
  
  return <JSONLD data={schema} />;
}

// 使用
<BreadcrumbSchema items={[
  { name: '首页', url: 'https://example.com' },
  { name: '博客', url: 'https://example.com/blog' },
  { name: 'React教程', url: 'https://example.com/blog/react' }
]} />
```

### 6.2 SiteNavigationElement Schema

```tsx
// SiteNavigationSchema.tsx
interface NavigationItem {
  name: string;
  url: string;
}

interface SiteNavigationSchemaProps {
  items: NavigationItem[];
}

export function SiteNavigationSchema({ items }: SiteNavigationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    about: items.map(item => ({
      '@type': 'Thing',
      name: item.name,
      url: item.url
    }))
  };
  
  return <JSONLD data={schema} />;
}
```

## 7. 聚合Schema

### 7.1 ItemList Schema

```tsx
// ItemListSchema.tsx
interface ItemListSchemaProps {
  items: Array<{
    name: string;
    url: string;
    image?: string;
    position: number;
  }>;
  listType?: 'ItemListOrderAscending' | 'ItemListOrderDescending' | 'ItemListUnordered';
}

export function ItemListSchema({ 
  items, 
  listType = 'ItemListUnordered' 
}: ItemListSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: `https://schema.org/${listType}`,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      url: item.url,
      name: item.name,
      ...(item.image && { image: item.image })
    }))
  };
  
  return <JSONLD data={schema} />;
}
```

### 7.2 CollectionPage Schema

```tsx
// CollectionPageSchema.tsx
interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  items: Array<{
    type: string;
    name: string;
    url: string;
  }>;
}

export function CollectionPageSchema({
  name,
  description,
  url,
  items
}: CollectionPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': item.type,
        position: index + 1,
        name: item.name,
        url: item.url
      }))
    }
  };
  
  return <JSONLD data={schema} />;
}
```

## 8. 测试与验证

### 8.1 验证工具

```typescript
// Google Rich Results Test
const richResultsTest = 'https://search.google.com/test/rich-results';

// Schema.org Validator
const schemaValidator = 'https://validator.schema.org/';

// 使用方法
function validateSchema(url: string) {
  return {
    google: `${richResultsTest}?url=${encodeURIComponent(url)}`,
    schemaOrg: `${schemaValidator}#url=${encodeURIComponent(url)}`
  };
}
```

### 8.2 自动化测试

```typescript
// schema.test.ts
import { render } from '@testing-library/react';
import { ArticleSchema } from './ArticleSchema';

describe('Schema.org Structured Data', () => {
  it('should render valid Article schema', () => {
    render(
      <ArticleSchema
        headline="Test Article"
        description="Test Description"
        image={['https://example.com/image.jpg']}
        datePublished="2024-01-15T10:00:00+08:00"
        author={{ name: 'Test Author' }}
        publisher={{
          name: 'Test Publisher',
          logo: 'https://example.com/logo.png'
        }}
        url="https://example.com/article"
      />
    );
    
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
    
    const data = JSON.parse(script!.textContent || '{}');
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test Article');
  });
  
  it('should include required fields', () => {
    // 测试必需字段
  });
});
```

## 9. 最佳实践

### 9.1 Schema选择指南

```typescript
const schemaSelectionGuide = {
  content: {
    blog: 'BlogPosting',
    news: 'NewsArticle',
    tutorial: 'HowTo',
    video: 'VideoObject',
    podcast: 'PodcastEpisode'
  },
  
  business: {
    product: 'Product',
    service: 'Service',
    localBusiness: 'LocalBusiness',
    event: 'Event',
    job: 'JobPosting'
  },
  
  educational: {
    course: 'Course',
    faq: 'FAQPage',
    howTo: 'HowTo',
    quiz: 'Quiz'
  },
  
  creative: {
    book: 'Book',
    movie: 'Movie',
    musicRecording: 'MusicRecording',
    recipe: 'Recipe'
  }
};
```

### 9.2 常见错误

```typescript
// ❌ 错误: 缺少必需字段
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title"
  // 缺少 author, publisher, datePublished
}

// ✅ 正确: 包含所有必需字段
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Publisher",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2024-01-15"
}

// ❌ 错误: 日期格式不正确
"datePublished": "2024/01/15"

// ✅ 正确: ISO 8601格式
"datePublished": "2024-01-15T10:00:00+08:00"

// ❌ 错误: 相对URL
"image": "/image.jpg"

// ✅ 正确: 完整URL
"image": "https://example.com/image.jpg"
```

## 10. 高级技巧

### 10.1 多Schema组合

```tsx
// 组合多个Schema
export function CombinedSchema() {
  return (
    <>
      <WebSiteSchema
        name="My Site"
        url="https://example.com"
        searchUrl="https://example.com/search"
      />
      
      <OrganizationSchema
        name="My Company"
        url="https://example.com"
        logo="https://example.com/logo.png"
      />
      
      <ArticleSchema
        headline="Article Title"
        description="Description"
        // ... other props
      />
    </>
  );
}
```

### 10.2 动态Schema生成

```tsx
// 根据页面类型动态生成Schema
export function DynamicSchema({ pageType, data }: any) {
  switch (pageType) {
    case 'article':
      return <ArticleSchema {...data} />;
    case 'product':
      return <ProductSchema {...data} />;
    case 'faq':
      return <FAQSchema {...data} />;
    default:
      return null;
  }
}
```

## 11. 总结

Schema.org结构化数据的关键要点:

1. **使用JSON-LD**: 推荐格式,易于维护
2. **必需字段**: 确保包含所有必需属性
3. **完整URL**: 所有URL必须是绝对路径
4. **正确格式**: 日期使用ISO 8601,价格使用数字
5. **验证测试**: 使用Google Rich Results Test验证
6. **类型选择**: 根据内容选择最合适的Schema类型
7. **持续更新**: 跟进Schema.org的更新

通过正确实施结构化数据,可以显著提升搜索结果的展示效果和点击率。

