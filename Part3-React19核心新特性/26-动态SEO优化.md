# 动态SEO优化

## 学习目标

通过本章学习，你将掌握：

- 动态SEO的重要性
- 页面标题优化
- Meta描述最佳实践
- Open Graph协议
- Twitter Cards
- 结构化数据
- 动态站点地图
- 多语言SEO

## 第一部分:动态标题优化

### 1.1 基础标题模式

```jsx
// 标题模板组件
function PageTitle({ title, siteName = '我的网站' }) {
  return <title>{title} | {siteName}</title>;
}

// 使用示例
export default function ProductPage({ product }) {
  return (
    <>
      <PageTitle title={product.name} />
      
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}

// 渲染结果：<title>iPhone 15 Pro | 我的网站</title>
```

### 1.2 分层标题结构

```jsx
// 根据页面层级生成标题
function HierarchicalTitle({ parts }) {
  const title = parts.filter(Boolean).join(' > ');
  return <title>{title}</title>;
}

export default function CategoryProductPage({ category, subcategory, product }) {
  return (
    <>
      <HierarchicalTitle 
        parts={[
          product.name,
          subcategory?.name,
          category.name,
          '我的商店'
        ]} 
      />
      
      <div>
        {/* 面包屑导航 */}
        <nav>
          <a href={`/categories/${category.id}`}>{category.name}</a>
          {subcategory && (
            <>
              <span> &gt; </span>
              <a href={`/categories/${subcategory.id}`}>{subcategory.name}</a>
            </>
          )}
        </nav>
        
        <h1>{product.name}</h1>
      </div>
    </>
  );
}

// 渲染：<title>iPhone 15 Pro > 智能手机 > 电子产品 > 我的商店</title>
```

### 1.3 实时更新标题

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function ChatPage() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // 监听页面可见性
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  useEffect(() => {
    // 模拟接收新消息
    const interval = setInterval(() => {
      if (!isActive) {
        setUnreadCount(prev => prev + 1);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // 重置未读计数
  useEffect(() => {
    if (isActive) {
      setUnreadCount(0);
    }
  }, [isActive]);
  
  return (
    <>
      <title>
        {unreadCount > 0 ? `(${unreadCount}) ` : ''}
        聊天室 | 我的应用
      </title>
      
      <div>
        <h1>聊天室</h1>
        {unreadCount > 0 && (
          <p>你有 {unreadCount} 条未读消息</p>
        )}
      </div>
    </>
  );
}
```

### 1.4 标题长度优化

```jsx
// 标题截断工具
function truncateTitle(text, maxLength = 60) {
  if (text.length <= maxLength) return text;
  
  // 在最后一个空格处截断
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

export default function ArticlePage({ article }) {
  const title = truncateTitle(`${article.title} - 作者：${article.author}`);
  
  return (
    <>
      <title>{title}</title>
      
      <article>
        <h1>{article.title}</h1>
        <p>作者：{article.author}</p>
        <div>{article.content}</div>
      </article>
    </>
  );
}
```

### 1.5 动态关键词组合

```jsx
// 智能标题生成
function generateOptimizedTitle({ product, category, location, action }) {
  const parts = [];
  
  // 主要关键词
  parts.push(product.name);
  
  // 行动词
  if (action) {
    parts.push(action); // 如："购买"、"预订"
  }
  
  // 品牌/分类
  if (product.brand) {
    parts.push(product.brand);
  } else if (category) {
    parts.push(category.name);
  }
  
  // 地理位置
  if (location) {
    parts.push(location);
  }
  
  // 价格信息
  if (product.discountPrice) {
    parts.push(`特价¥${product.discountPrice}`);
  }
  
  // 网站名称
  parts.push('在线商城');
  
  return truncateTitle(parts.join(' | '), 60);
}

export default function ProductPage({ product, category, userLocation }) {
  const title = generateOptimizedTitle({
    product,
    category,
    location: userLocation,
    action: '购买'
  });
  
  return (
    <>
      <title>{title}</title>
      <div>
        <h1>{product.name}</h1>
      </div>
    </>
  );
}

// 示例输出：
// "iPhone 15 Pro | 购买 | Apple | 北京 | 特价¥7999 | 在线商城"
```

### 1.6 A/B测试标题

```jsx
'use client';

import { useState, useEffect } from 'react';

export default function ABTestingTitle({ product }) {
  const [variant, setVariant] = useState('A');
  
  useEffect(() => {
    // 随机分配用户到A或B组
    const testVariant = Math.random() > 0.5 ? 'A' : 'B';
    setVariant(testVariant);
    
    // 记录用户看到的版本
    trackTitleVariant(product.id, testVariant);
  }, [product.id]);
  
  const titleVariants = {
    A: `${product.name} - 限时优惠 | 商城`,
    B: `【爆款】${product.name} - 立即抢购 | 商城`
  };
  
  return (
    <>
      <title>{titleVariants[variant]}</title>
      <div>
        <h1>{product.name}</h1>
      </div>
    </>
  );
}
```

## 第二部分：Meta描述优化

### 2.1 动态生成描述

```jsx
// 从内容自动生成描述
function generateDescription(content, maxLength = 155) {
  // 移除HTML标签
  const text = content.replace(/<[^>]*>/g, '');
  
  // 移除多余空格
  const cleaned = text.replace(/\s+/g, ' ').trim();
  
  // 截断到句子结束
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('。');
  const lastExclamation = truncated.lastIndexOf('！');
  const lastQuestion = truncated.lastIndexOf('？');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd > 0) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

export default function BlogPost({ post }) {
  const description = generateDescription(post.content);
  
  return (
    <>
      <title>{post.title} | 我的博客</title>
      <meta name="description" content={description} />
      
      <article>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
```

### 2.2 产品描述优化

```jsx
export default function ProductPage({ product }) {
  // 创建优化的描述
  const description = [
    product.description,
    `价格：¥${product.price}`,
    product.inStock ? '现货供应' : '预售中',
    `${product.reviewCount}+ 用户好评`
  ].join(' | ');
  
  return (
    <>
      <title>{product.name} - {product.category} | 在线商城</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={product.tags.join(', ')} />
      
      <div className="product">
        <h1>{product.name}</h1>
        <p className="price">¥{product.price}</p>
        <p>{product.description}</p>
        
        <div className="reviews">
          <span>{product.averageRating} ⭐</span>
          <span>({product.reviewCount} 评价)</span>
        </div>
        
        <button disabled={!product.inStock}>
          {product.inStock ? '立即购买' : '缺货'}
        </button>
      </div>
    </>
  );
}
```

### 2.3 搜索结果页描述

```jsx
export default function SearchResults({ query, results, total }) {
  const description = total > 0
    ? `找到 ${total} 个关于"${query}"的结果。浏览${results[0]?.title}等相关内容。`
    : `没有找到关于"${query}"的结果。试试其他关键词。`;
  
  return (
    <>
      <title>搜索: {query} | 我的网站</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex" />  {/* 搜索结果页通常不索引 */}
      
      <div>
        <h1>搜索结果: {query}</h1>
        <p>找到 {total} 个结果</p>
        
        {results.map(result => (
          <div key={result.id}>
            <h2>{result.title}</h2>
            <p>{result.excerpt}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

### 2.4 描述模板系统

```jsx
// 描述模板引擎
class DescriptionTemplate {
  constructor(templates) {
    this.templates = templates;
  }
  
  generate(type, data) {
    const template = this.templates[type];
    if (!template) return '';
    
    return template(data);
  }
}

const descriptionTemplates = new DescriptionTemplate({
  product: (data) => 
    `${data.name} - ${data.description} | 价格：¥${data.price} | ${data.inStock ? '现货' : '预售'} | ${data.reviewCount}条评价`,
  
  article: (data) =>
    `${data.excerpt} | 作者：${data.author} | ${data.publishedAt}`,
  
  category: (data) =>
    `浏览${data.name}分类，包含${data.productCount}件商品。${data.description}`,
  
  user: (data) =>
    `${data.name}的个人主页 | ${data.bio} | ${data.followersCount}位关注者`
});

export default function DynamicPage({ type, data }) {
  const description = descriptionTemplates.generate(type, data);
  
  return (
    <>
      <meta name="description" content={description} />
      {/* 页面内容 */}
    </>
  );
}
```

### 2.5 描述个性化

```jsx
export default function PersonalizedDescription({ product, user }) {
  // 根据用户历史生成个性化描述
  const generatePersonalizedDescription = () => {
    const parts = [product.description];
    
    // 基于用户浏览历史
    if (user?.viewedCategories.includes(product.categoryId)) {
      parts.push('您可能感兴趣');
    }
    
    // 基于用户购买历史
    if (user?.purchasedBrands.includes(product.brand)) {
      parts.push(`${product.brand}官方认证`);
    }
    
    // 基于用户地理位置
    if (user?.location && product.shipping[user.location]) {
      parts.push(`${user.location}快速配送`);
    }
    
    // 促销信息
    if (product.discountPercent > 10) {
      parts.push(`限时${product.discountPercent}%折扣`);
    }
    
    return parts.join(' | ');
  };
  
  const description = generatePersonalizedDescription();
  
  return (
    <>
      <meta name="description" content={description} />
      <div>
        <h1>{product.name}</h1>
      </div>
    </>
  );
}
```

## 第三部分：Open Graph优化

### 3.1 完整的OG标签

```jsx
function OpenGraphTags({ 
  title, 
  description, 
  image, 
  url,
  type = 'website',
  siteName = '我的网站'
}) {
  return (
    <>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
    </>
  );
}

export default function ArticlePage({ article }) {
  const url = `https://myblog.com/articles/${article.slug}`;
  
  return (
    <>
      <title>{article.title} | 我的博客</title>
      <meta name="description" content={article.excerpt} />
      
      <OpenGraphTags
        title={article.title}
        description={article.excerpt}
        image={article.coverImage}
        url={url}
        type="article"
      />
      
      {/* Article特有的OG标签 */}
      <meta property="article:published_time" content={article.publishedAt} />
      <meta property="article:author" content={article.author.name} />
      {article.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      <article>
        <h1>{article.title}</h1>
        <p>{article.content}</p>
      </article>
    </>
  );
}
```

### 3.2 产品的OG标签

```jsx
export default function ProductPage({ product }) {
  return (
    <>
      <title>{product.name} | 在线商城</title>
      
      {/* 基础OG标签 */}
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description} />
      <meta property="og:image" content={product.images[0]} />
      <meta property="og:url" content={`https://shop.com/products/${product.id}`} />
      <meta property="og:type" content="product" />
      
      {/* 产品特有的OG标签 */}
      <meta property="product:price:amount" content={product.price} />
      <meta property="product:price:currency" content="CNY" />
      {product.inStock && (
        <meta property="product:availability" content="in stock" />
      )}
      <meta property="product:condition" content="new" />
      
      {/* 多张图片 */}
      {product.images.slice(1).map((img, i) => (
        <meta key={i} property="og:image" content={img} />
      ))}
      
      <div className="product">
        <h1>{product.name}</h1>
        <p>¥{product.price}</p>
      </div>
    </>
  );
}
```

### 3.3 视频内容OG标签

```jsx
export default function VideoPage({ video }) {
  return (
    <>
      <title>{video.title} | 视频平台</title>
      
      <meta property="og:title" content={video.title} />
      <meta property="og:description" content={video.description} />
      <meta property="og:type" content="video.other" />
      <meta property="og:url" content={`https://video.com/watch/${video.id}`} />
      
      {/* 视频特有标签 */}
      <meta property="og:video" content={video.url} />
      <meta property="og:video:secure_url" content={video.secureUrl} />
      <meta property="og:video:type" content="video/mp4" />
      <meta property="og:video:width" content={video.width.toString()} />
      <meta property="og:video:height" content={video.height.toString()} />
      
      {/* 缩略图 */}
      <meta property="og:image" content={video.thumbnail} />
      
      {/* 视频详情 */}
      <meta property="video:duration" content={video.duration.toString()} />
      <meta property="video:release_date" content={video.publishedAt} />
      
      <div className="video-player">
        <video controls poster={video.thumbnail}>
          <source src={video.url} type="video/mp4" />
        </video>
        <h1>{video.title}</h1>
        <p>{video.description}</p>
      </div>
    </>
  );
}
```

### 3.4 OG图片优化

```jsx
// OG图片生成器
function generateOGImage({ title, subtitle, image, template = 'default' }) {
  // 调用图片生成API
  const params = new URLSearchParams({
    title,
    subtitle,
    image,
    template
  });
  
  return `https://og-image-api.com/generate?${params}`;
}

export default function Page({ data }) {
  const ogImage = generateOGImage({
    title: data.title,
    subtitle: data.category,
    image: data.thumbnail,
    template: 'product'
  });
  
  return (
    <>
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={data.title} />
    </>
  );
}
```

### 3.5 多语言OG标签

```jsx
export default function MultilingualPage({ content, locale, alternateLocales }) {
  return (
    <>
      <meta property="og:locale" content={locale} />
      
      {alternateLocales.map(({ locale: altLocale, url }) => (
        <meta 
          key={altLocale}
          property="og:locale:alternate" 
          content={altLocale}
        />
      ))}
      
      {alternateLocales.map(({ locale: altLocale, url }) => (
        <link
          key={altLocale}
          rel="alternate"
          hrefLang={altLocale}
          href={url}
        />
      ))}
      
      <div>
        <h1>{content.title}</h1>
      </div>
    </>
  );
}
```

## 第四部分：Twitter Cards

### 4.1 摘要卡片

```jsx
function TwitterCard({ 
  title, 
  description, 
  image, 
  cardType = 'summary_large_image',
  site = '@mysite'
}) {
  return (
    <>
      <meta name="twitter:card" content={cardType} />
      <meta name="twitter:site" content={site} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}

export default function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      
      <TwitterCard
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        cardType="summary_large_image"
      />
      
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

### 4.2 App卡片

```jsx
export default function AppPage({ app }) {
  return (
    <>
      <title>{app.name} - 下载应用</title>
      
      {/* Twitter App Card */}
      <meta name="twitter:card" content="app" />
      <meta name="twitter:site" content="@myappstore" />
      <meta name="twitter:description" content={app.description} />
      
      {/* iOS App */}
      <meta name="twitter:app:name:iphone" content={app.name} />
      <meta name="twitter:app:id:iphone" content={app.iosAppId} />
      <meta name="twitter:app:url:iphone" content={app.iosUrl} />
      
      {/* Android App */}
      <meta name="twitter:app:name:googleplay" content={app.name} />
      <meta name="twitter:app:id:googleplay" content={app.androidPackage} />
      <meta name="twitter:app:url:googleplay" content={app.androidUrl} />
      
      <div className="app-download">
        <h1>{app.name}</h1>
        <p>{app.description}</p>
        <a href={app.iosUrl}>iOS下载</a>
        <a href={app.androidUrl}>Android下载</a>
      </div>
    </>
  );
}
```

### 4.3 播放器卡片

```jsx
export default function MusicPlayerPage({ track }) {
  return (
    <>
      <title>{track.title} - {track.artist}</title>
      
      <meta name="twitter:card" content="player" />
      <meta name="twitter:site" content="@music_platform" />
      <meta name="twitter:title" content={track.title} />
      <meta name="twitter:description" content={`${track.artist} - ${track.album}`} />
      <meta name="twitter:image" content={track.albumArt} />
      
      {/* 播放器配置 */}
      <meta name="twitter:player" content={`https://music.com/player/${track.id}`} />
      <meta name="twitter:player:width" content="480" />
      <meta name="twitter:player:height" content="480" />
      <meta name="twitter:player:stream" content={track.audioUrl} />
      
      <div>
        <h1>{track.title}</h1>
        <p>{track.artist}</p>
      </div>
    </>
  );
}
```

## 第五部分：结构化数据

### 5.1 JSON-LD格式

```jsx
function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ProductPage({ product }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.images,
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': 'CNY',
      'availability': product.inStock 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      'url': `https://shop.com/products/${product.id}`
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.averageRating,
      'reviewCount': product.reviewCount
    }
  };
  
  return (
    <>
      <title>{product.name}</title>
      <meta name="description" content={product.description} />
      
      <StructuredData data={structuredData} />
      
      <div className="product">
        <h1>{product.name}</h1>
        <p>¥{product.price}</p>
      </div>
    </>
  );
}
```

### 5.2 文章结构化数据

```jsx
export default function ArticlePage({ article }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.excerpt,
    'image': article.coverImage,
    'author': {
      '@type': 'Person',
      'name': article.author.name,
      'url': `https://myblog.com/authors/${article.author.id}`
    },
    'publisher': {
      '@type': 'Organization',
      'name': '我的博客',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://myblog.com/logo.png'
      }
    },
    'datePublished': article.publishedAt,
    'dateModified': article.updatedAt
  };
  
  return (
    <>
      <title>{article.title}</title>
      
      <StructuredData data={structuredData} />
      
      <article>
        <h1>{article.title}</h1>
        <p>{article.content}</p>
      </article>
    </>
  );
}
```

### 5.3 面包屑导航

```jsx
export default function ProductPage({ category, subcategory, product }) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': '首页',
        'item': 'https://shop.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': category.name,
        'item': `https://shop.com/categories/${category.id}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': subcategory.name,
        'item': `https://shop.com/categories/${subcategory.id}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': product.name,
        'item': `https://shop.com/products/${product.id}`
      }
    ]
  };
  
  return (
    <>
      <title>{product.name}</title>
      
      <StructuredData data={breadcrumbData} />
      
      <nav aria-label="面包屑">
        <a href="/">首页</a>
        <span> &gt; </span>
        <a href={`/categories/${category.id}`}>{category.name}</a>
        <span> &gt; </span>
        <a href={`/categories/${subcategory.id}`}>{subcategory.name}</a>
        <span> &gt; </span>
        <span>{product.name}</span>
      </nav>
      
      <div className="product">
        <h1>{product.name}</h1>
      </div>
    </>
  );
}
```

### 5.4 FAQ结构化数据

```jsx
export default function FAQPage({ faqs }) {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
  
  return (
    <>
      <title>常见问题 - FAQ</title>
      
      <StructuredData data={faqData} />
      
      <div className="faq">
        <h1>常见问题</h1>
        {faqs.map((faq, i) => (
          <div key={i}>
            <h2>{faq.question}</h2>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

### 5.5 评论结构化数据

```jsx
export default function ProductWithReviews({ product, reviews }) {
  const reviewData = reviews.map(review => ({
    '@type': 'Review',
    'author': {
      '@type': 'Person',
      'name': review.author
    },
    'datePublished': review.createdAt,
    'reviewBody': review.content,
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.rating,
      'bestRating': '5'
    }
  }));
  
  const productData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'review': reviewData,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.averageRating,
      'reviewCount': reviews.length
    }
  };
  
  return (
    <>
      <StructuredData data={productData} />
      <div>
        <h1>{product.name}</h1>
        {reviews.map((review, i) => (
          <div key={i}>
            <p>{review.author}: {review.content}</p>
            <span>{review.rating}⭐</span>
          </div>
        ))}
      </div>
    </>
  );
}
```

## 第六部分：动态站点地图

### 6.1 生成XML站点地图

```jsx
// app/sitemap.xml/route.ts
export async function GET() {
  const products = await db.products.findMany({
    select: {
      id: true,
      slug: true,
      updatedAt: true
    }
  });
  
  const posts = await db.posts.findMany({
    select: {
      slug: true,
      updatedAt: true
    }
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysite.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${products.map(product => `
  <url>
    <loc>https://mysite.com/products/${product.slug}</loc>
    <lastmod>${product.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
  ${posts.map(post => `
  <url>
    <loc>https://mysite.com/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  `).join('')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
```

### 6.2 图片站点地图

```jsx
// app/sitemap-images.xml/route.ts
export async function GET() {
  const products = await db.products.findMany({
    include: {
      images: true
    }
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${products.map(product => `
  <url>
    <loc>https://mysite.com/products/${product.id}</loc>
    ${product.images.map(img => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>${img.alt}</image:caption>
    </image:image>
    `).join('')}
  </url>
  `).join('')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
```

## 第七部分：多语言SEO

### 7.1 hreflang标签

```jsx
export default function MultilingualPage({ content, currentLocale, availableLocales }) {
  return (
    <>
      {/* 当前语言 */}
      <link rel="canonical" href={content.url[currentLocale]} />
      
      {/* 备用语言 */}
      {availableLocales.map(locale => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={content.url[locale]}
        />
      ))}
      
      {/* 默认语言 */}
      <link rel="alternate" hrefLang="x-default" href={content.url.en} />
      
      <div>
        <h1>{content.title[currentLocale]}</h1>
      </div>
    </>
  );
}
```

## 注意事项

### 1. 标题长度

```jsx
// ✅ 保持在60字符以内
<title>简洁的产品标题 | 网站名称</title>

// ❌ 过长会被截断
<title>这是一个非常非常长的标题，包含了很多不必要的信息，在搜索结果中会被截断...</title>
```

### 2. 描述长度

```jsx
// ✅ 150-160字符最佳
<meta name="description" content="简洁明了的描述，突出核心价值，吸引用户点击。" />

// ❌ 过短或过长
<meta name="description" content="太短了" />
<meta name="description" content="这是一个超级超级长的描述..." />
```

### 3. 图片优化

```jsx
// ✅ 使用高质量图片
<meta property="og:image" content="https://example.com/high-res.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

// Open Graph推荐尺寸：1200x630px
```

### 4. 避免关键词堆砌

```jsx
// ❌ 不好：关键词堆砌
<title>买手机 购买手机 手机商城 手机店 手机价格 便宜手机</title>

// ✅ 好：自然的关键词使用
<title>iPhone 15 Pro - 正品保障 | 在线商城</title>
```

### 5. 保持一致性

```jsx
// ✅ Open Graph和Meta保持一致
<title>产品标题 | 网站名称</title>
<meta name="description" content="产品描述" />
<meta property="og:title" content="产品标题 | 网站名称" />
<meta property="og:description" content="产品描述" />
```

## 常见问题

### Q1: 如何测试SEO效果？

**A:** 使用Google Search Console、社交媒体调试工具（Facebook Debugger、Twitter Card Validator）。

### Q2: 动态生成的元数据会被搜索引擎收录吗？

**A:** 会的，React 19的元数据API支持SSR，搜索引擎可以正常抓取。

### Q3: 每个页面都需要Open Graph标签吗？

**A:** 建议所有公开页面都添加，特别是可能被分享的内容。

### Q4: 如何处理动态内容的SEO？

**A:** 使用Server Components获取数据，在服务器端渲染完整的元数据。

### Q5: 标题和描述应该包含关键词吗？

**A:** 是的，但要自然地融入，避免关键词堆砌。关键词应该出现在标题的前部分。

### Q6: 如何优化移动端SEO？

**A:** 
- 使用响应式设计
- 确保页面加载速度快
- 优化图片大小
- 使用viewport meta标签
- 测试移动端可用性

### Q7: 如何处理重复内容？

**A:** 使用canonical标签指向主要版本：

```jsx
<link rel="canonical" href="https://example.com/original-page" />
```

## 总结

### SEO优化要点

```
✅ 每个页面独特的标题
✅ 有吸引力的描述
✅ 完整的Open Graph标签
✅ Twitter Cards配置
✅ 结构化数据
✅ 适当的图片尺寸
✅ 移动端友好
✅ 多语言支持
✅ 动态站点地图
```

### 优化检查清单

```
□ 标题长度 < 60字符
□ 描述长度 150-160字符
□ 包含关键词
□ OG图片 1200x630px
□ 结构化数据正确
□ 适配移动端
□ SSR正常工作
□ 通过SEO工具验证
□ hreflang配置正确
□ sitemap已提交
□ robots.txt配置正确
□ 页面加载速度优化
```

### 性能优化

```javascript
// 1. 使用useMemo缓存昂贵的计算
const structuredData = useMemo(() => ({
  '@type': 'Product',
  name: product.name
}), [product.name]);

// 2. 条件渲染减少不必要的标签
{isPublic && (
  <meta property="og:image" content={image} />
)}

// 3. 组件复用
function SEO({ title, description, image }) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:image" content={image} />
    </>
  );
}
```

### 监控与分析

```
✅ Google Analytics追踪
✅ Search Console监控
✅ 社交媒体分享统计
✅ A/B测试不同标题
✅ 定期审查和更新
✅ 竞争对手分析
✅ 关键词排名追踪
```

完善的SEO优化能显著提升网站流量和用户体验！
