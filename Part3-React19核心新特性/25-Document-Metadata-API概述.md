# Document Metadata API概述

## 学习目标

通过本章学习，你将掌握：

- Document Metadata API的背景
- 内置元数据组件
- 与传统方法对比
- 工作原理
- 基本使用方法
- 优势与限制
- 适用场景
- 最佳实践

## 第一部分：传统方法的局限

### 1.1 传统的document操作

```jsx
// ❌ 传统方法：手动操作DOM
import { useEffect } from 'react';

export default function ProductPage({ product }) {
  useEffect(() => {
    // 修改页面标题
    document.title = `${product.name} - 我的商店`;
    
    // 修改meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', product.description);
    }
    
    // 修改Open Graph标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', product.name);
    }
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', product.image);
    }
    
    // 清理函数
    return () => {
      document.title = '我的商店';
    };
  }, [product]);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}

// 问题：
// 1. 代码冗长繁琐
// 2. 需要在useEffect中执行
// 3. 需要手动清理
// 4. 不支持SSR
// 5. 难以维护
```

### 1.2 使用第三方库

```jsx
// react-helmet
import { Helmet } from 'react-helmet';

export default function ProductPage({ product }) {
  return (
    <>
      <Helmet>
        <title>{product.name} - 我的商店</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.image} />
      </Helmet>
      
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}

// 优点：
// ✅ 声明式API
// ✅ 支持SSR

// 问题：
// ❌ 需要额外依赖
// ❌ 增加bundle大小
// ❌ 可能有性能开销
```

### 1.3 Next.js的Head组件

```jsx
// Next.js的解决方案
import Head from 'next/head';

export default function ProductPage({ product }) {
  return (
    <>
      <Head>
        <title>{product.name} - 我的商店</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.image} />
      </Head>
      
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}

// 优点：
// ✅ 框架内置
// ✅ 性能优化
// ✅ SSR支持

// 限制：
// ❌ 仅限Next.js
// ❌ 不是React标准
```

### 1.4 传统方法的更多问题

```jsx
// 问题1：竞态条件
function RaceCondition({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        // 可能会被后续的请求覆盖
        document.title = data.name;
      });
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// 问题2：内存泄漏风险
function MemoryLeak() {
  useEffect(() => {
    const interval = setInterval(() => {
      document.title = `Time: ${new Date().toLocaleTimeString()}`;
    }, 1000);
    
    // 如果忘记清理...
    // return () => clearInterval(interval);
  }, []);
  
  return <div>Clock</div>;
}

// 问题3：测试困难
function HardToTest({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  // 需要mock document对象
  return <div>Content</div>;
}
```

## 第二部分：React 19的解决方案

### 2.1 内置的元数据组件

React 19引入了原生的元数据组件：

```jsx
// ✅ React 19的原生方案
export default function ProductPage({ product }) {
  return (
    <>
      <title>{product.name} - 我的商店</title>
      <meta name="description" content={product.description} />
      <meta property="og:title" content={product.name} />
      <meta property="og:image" content={product.image} />
      
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}

// 优势：
// ✅ 原生React支持
// ✅ 无需额外依赖
// ✅ 自动提升到<head>
// ✅ 支持SSR
// ✅ 类型安全
```

### 2.2 支持的元数据标签

```jsx
export default function SEOExample() {
  return (
    <>
      {/* 页面标题 */}
      <title>我的页面标题</title>
      
      {/* 元标签 */}
      <meta name="description" content="页面描述" />
      <meta name="keywords" content="关键词1, 关键词2" />
      <meta name="author" content="作者名" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph */}
      <meta property="og:title" content="分享标题" />
      <meta property="og:description" content="分享描述" />
      <meta property="og:image" content="https://example.com/image.jpg" />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Twitter标题" />
      <meta name="twitter:description" content="Twitter描述" />
      <meta name="twitter:image" content="https://example.com/twitter.jpg" />
      
      {/* 链接标签 */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href="https://example.com/page" />
      <link rel="alternate" hrefLang="en" href="https://example.com/en" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      
      {/* 样式表 */}
      <link rel="stylesheet" href="/styles.css" />
      
      {/* 实际内容 */}
      <div>页面内容...</div>
    </>
  );
}
```

### 2.3 自动提升机制

```jsx
// React会自动将这些标签提升到<head>
export default function MyPage() {
  return (
    <div>
      <title>页面标题</title>  {/* 会被提升到<head> */}
      
      <div>
        <h1>标题</h1>
        
        <meta name="description" content="描述" />  {/* 也会被提升 */}
        
        <p>内容</p>
      </div>
    </div>
  );
}

// 渲染结果：
// <html>
//   <head>
//     <title>页面标题</title>
//     <meta name="description" content="描述" />
//   </head>
//   <body>
//     <div>
//       <div>
//         <h1>标题</h1>
//         <p>内容</p>
//       </div>
//     </div>
//   </body>
// </html>
```

### 2.4 完整的SEO示例

```jsx
export default function CompleteS营SEO({ page }) {
  return (
    <>
      {/* 基础SEO */}
      <title>{page.title} | 我的网站</title>
      <meta name="description" content={page.description} />
      <meta name="keywords" content={page.keywords.join(', ')} />
      <link rel="canonical" href={page.canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:image" content={page.image} />
      <meta property="og:url" content={page.url} />
      <meta property="og:site_name" content="我的网站" />
      <meta property="article:published_time" content={page.publishedAt} />
      <meta property="article:modified_time" content={page.updatedAt} />
      <meta property="article:author" content={page.author.name} />
      {page.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@mywebsite" />
      <meta name="twitter:creator" content={`@${page.author.twitter}`} />
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={page.image} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: page.title,
          description: page.description,
          image: page.image,
          datePublished: page.publishedAt,
          dateModified: page.updatedAt,
          author: {
            '@type': 'Person',
            name: page.author.name
          }
        })}
      </script>
      
      {/* 多语言支持 */}
      {page.alternateLanguages.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* 页面内容 */}
      <article>
        <h1>{page.title}</h1>
        <p>{page.content}</p>
      </article>
    </>
  );
}
```

## 第三部分：基本使用

### 3.1 动态标题

```jsx
export default function BlogPost({ post }) {
  return (
    <>
      <title>{post.title} | 我的博客</title>
      
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </>
  );
}
```

### 3.2 根据状态更新

```jsx
'use client';

import { useState } from 'react';

export default function UnreadMessages() {
  const [unread, setUnread] = useState(5);
  
  return (
    <>
      <title>
        {unread > 0 ? `(${unread}) ` : ''}消息中心
      </title>
      
      <div>
        <h1>消息中心</h1>
        <p>未读消息：{unread}</p>
      </div>
    </>
  );
}
```

### 3.3 条件渲染

```jsx
export default function UserProfile({ user, isPublic }) {
  return (
    <>
      <title>{user.name}的个人主页</title>
      
      {isPublic && (
        <>
          <meta name="description" content={user.bio} />
          <meta property="og:title" content={`${user.name}的个人主页`} />
          <meta property="og:image" content={user.avatar} />
        </>
      )}
      
      {!isPublic && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      <div>
        <h1>{user.name}</h1>
        <p>{user.bio}</p>
      </div>
    </>
  );
}
```

### 3.4 组件封装

```jsx
// 封装SEO组件
function SEO({ title, description, image, url }) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}

// 使用
export default function ProductPage({ product }) {
  return (
    <>
      <SEO
        title={`${product.name} - 我的商店`}
        description={product.description}
        image={product.image}
        url={`https://mystore.com/products/${product.id}`}
      />
      
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    </>
  );
}
```

### 3.5 高级组件封装

```jsx
// 通用SEO组件
interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  locale = 'zh_CN',
  siteName = '我的网站',
  twitterHandle,
  noindex = false,
  nofollow = false
}: SEOProps) {
  const robots = [
    noindex && 'noindex',
    nofollow && 'nofollow'
  ].filter(Boolean).join(', ');
  
  return (
    <>
      {/* 基础Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {robots && <meta name="robots" content={robots} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {twitterHandle && <meta name="twitter:site" content={`@${twitterHandle}`} />}
      
      {/* 规范链接 */}
      {url && <link rel="canonical" href={url} />}
    </>
  );
}

// 使用示例
export default function Article({ article }) {
  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        keywords={article.tags}
        image={article.coverImage}
        url={article.url}
        type="article"
        twitterHandle="mywebsite"
      />
      
      <article>
        <h1>{article.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </>
  );
}
```

### 3.6 动态语言支持

```jsx
// 多语言SEO组件
export default function MultiLanguagePage({ content, locale, alternateUrls }) {
  const t = useTranslations(locale);
  
  return (
    <>
      <title>{t(content.title)}</title>
      <meta name="description" content={t(content.description)} />
      
      {/* 当前语言 */}
      <meta property="og:locale" content={locale} />
      
      {/* 备用语言 */}
      {alternateUrls.map(({ lang, url }) => (
        <>
          <meta key={`og-${lang}`} property="og:locale:alternate" content={lang} />
          <link key={`alt-${lang}`} rel="alternate" hrefLang={lang} href={url} />
        </>
      ))}
      
      {/* 内容 */}
      <div>
        <h1>{t(content.title)}</h1>
        <p>{t(content.body)}</p>
      </div>
    </>
  );
}
```

## 第四部分：与传统方法对比

### 4.1 代码对比

```jsx
// ❌ 旧方法：useEffect + DOM操作
function OldWay({ title }) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'Default Title';
    };
  }, [title]);
  
  return <div>Content</div>;
}

// ✅ 新方法：声明式
function NewWay({ title }) {
  return (
    <>
      <title>{title}</title>
      <div>Content</div>
    </>
  );
}
```

### 4.2 SSR支持对比

```jsx
// ❌ 旧方法：SSR时不生效
function OldSSR({ product }) {
  useEffect(() => {
    // 在服务器端不执行！
    document.title = product.name;
  }, [product]);
  
  return <div>{product.name}</div>;
}

// ✅ 新方法：SSR自动支持
function NewSSR({ product }) {
  return (
    <>
      <title>{product.name}</title>
      <div>{product.name}</div>
    </>
  );
}

// SSR渲染结果包含正确的title
```

### 4.3 性能对比

```jsx
// ❌ 旧方法：运行时DOM操作
function OldPerformance() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // 每次count变化都会操作DOM
    document.title = `Count: ${count}`;
  }, [count]);
  
  return <button onClick={() => setCount(count + 1)}>+</button>;
}

// ✅ 新方法：React优化的更新
function NewPerformance() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <title>Count: {count}</title>
      <button onClick={() => setCount(count + 1)}>+</button>
    </>
  );
}

// React会批量处理和优化title更新
```

### 4.4 代码量对比

```jsx
// ❌ 旧方法：100行代码
function OldComplexMeta({ product }) {
  useEffect(() => {
    document.title = product.name;
    
    updateMeta('description', product.description);
    updateMeta('og:title', product.name, 'property');
    updateMeta('og:description', product.description, 'property');
    updateMeta('og:image', product.image, 'property');
    updateMeta('og:type', 'product', 'property');
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', product.name);
    updateMeta('twitter:description', product.description);
    updateMeta('twitter:image', product.image);
    
    return () => {
      // 清理所有meta
      document.title = 'Default';
      removeMeta('description');
      removeMeta('og:title', 'property');
      // ... 更多清理
    };
  }, [product]);
  
  return <div>{product.name}</div>;
}

function updateMeta(name, content, attribute = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function removeMeta(name, attribute = 'name') {
  const meta = document.querySelector(`meta[${attribute}="${name}"]`);
  if (meta) {
    meta.remove();
  }
}


// ✅ 新方法：20行代码
function NewComplexMeta({ product }) {
  return (
    <>
      <title>{product.name}</title>
      <meta name="description" content={product.description} />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description} />
      <meta property="og:image" content={product.image} />
      <meta property="og:type" content="product" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={product.name} />
      <meta name="twitter:description" content={product.description} />
      <meta name="twitter:image" content={product.image} />
      
      <div>{product.name}</div>
    </>
  );
}
```

## 第五部分：工作原理

### 5.1 自动提升到head

```jsx
// 组件树
<App>
  <title>App Title</title>
  <Layout>
    <meta name="description" content="Layout meta" />
    <Page>
      <link rel="canonical" href="/page" />
      <Content />
    </Page>
  </Layout>
</App>

// React会收集所有元数据标签，提升到<head>
```

### 5.2 优先级规则

```jsx
// 当有多个相同标签时，后者优先
<App>
  <title>App Title</title>
  
  <Layout>
    <title>Layout Title</title>  {/* 这个会被保留 */}
    
    <Page>
      <title>Page Title</title>  {/* 这个优先级最高 */}
    </Page>
  </Layout>
</App>

// 最终渲染：<title>Page Title</title>
```

### 5.3 重复meta的处理

```jsx
// name属性相同的meta会被去重
<>
  <meta name="description" content="First" />
  <meta name="description" content="Second" />  {/* 这个生效 */}
</>

// 最终只有一个：<meta name="description" content="Second" />
```

### 5.4 内部实现机制

```jsx
// React内部如何处理元数据标签

// 1. 收集阶段
// React在渲染过程中收集所有元数据标签

function collectMetadata(element) {
  const metadata = [];
  
  React.Children.forEach(element, child => {
    if (isMetadataTag(child.type)) {
      metadata.push(child);
    }
  });
  
  return metadata;
}

// 2. 去重阶段
// 根据标签类型和属性去重

function deduplicateMetadata(metadata) {
  const seen = new Map();
  
  return metadata.filter(tag => {
    const key = getMetadataKey(tag);
    if (seen.has(key)) {
      return false; // 跳过重复的
    }
    seen.set(key, true);
    return true;
  });
}

// 3. 提升阶段
// 将去重后的标签插入到<head>

function hoistMetadata(metadata) {
  metadata.forEach(tag => {
    const element = document.createElement(tag.type);
    Object.keys(tag.props).forEach(key => {
      element.setAttribute(key, tag.props[key]);
    });
    document.head.appendChild(element);
  });
}
```

### 5.5 批量更新优化

```jsx
// React会批量处理元数据更新，避免频繁的DOM操作

'use client';

import { useState } from 'react';

export default function BatchUpdates() {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(Date.now());
  
  const handleClick = () => {
    // 这两个更新会被批处理
    setCount(c => c + 1);
    setTime(Date.now());
  };
  
  return (
    <>
      {/* React会将这两个title的更新合并为一次 */}
      <title>Count: {count}, Time: {time}</title>
      <button onClick={handleClick}>Update</button>
    </>
  );
}
```

## 第六部分：限制与注意事项

### 6.1 仅支持特定标签

```jsx
// ✅ 支持的标签
<title>...</title>
<meta ... />
<link ... />
<style>...</style>
<script>...</script>

// ❌ 不支持其他HTML标签
<base href="/" />  {/* 可能不支持 */}
```

### 6.2 不能在事件处理程序中使用

```jsx
// ❌ 错误
function BadExample() {
  const handleClick = () => {
    return <title>New Title</title>;  // 无效！
  };
  
  return <button onClick={handleClick}>Change Title</button>;
}

// ✅ 正确：通过状态控制
function GoodExample() {
  const [clicked, setClicked] = useState(false);
  
  return (
    <>
      <title>{clicked ? 'Clicked' : 'Not Clicked'}</title>
      <button onClick={() => setClicked(true)}>Click</button>
    </>
  );
}
```

### 6.3 与某些第三方库冲突

```jsx
// 可能与以下库冲突：
// - react-helmet
// - next/head
// - gatsby-plugin-react-helmet

// 建议：迁移到React 19原生API
```

### 6.4 不支持动态script内容

```jsx
// ❌ 不能动态生成script内容
function BadScriptExample({ data }) {
  return (
    <script>
      {`console.log(${JSON.stringify(data)})`}  {/* 不推荐 */}
    </script>
  );
}

// ✅ 使用JSON-LD
function GoodScriptExample({ data }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}
```

### 6.5 性能考虑

```jsx
// ❌ 避免在每次渲染时创建新对象
function BadPerformance({ product }) {
  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name
        })}  {/* 每次都创建新对象 */}
      </script>
    </>
  );
}

// ✅ 使用useMemo缓存
function GoodPerformance({ product }) {
  const structuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name
  }), [product.name]);
  
  return (
    <script type="application/ld+json">
      {JSON.stringify(structuredData)}
    </script>
  );
}
```

## 第七部分：实战案例

### 7.1 电商产品页面

```jsx
export default function ProductPage({ product }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'CNY',
      availability: product.inStock 
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
    },
    aggregateRating: product.reviews && {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviews.length
    }
  };
  
  return (
    <>
      <title>{product.name} - 价格 ¥{product.price} | 我的商店</title>
      <meta name="description" content={product.description} />
      
      <meta property="og:type" content="product" />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description} />
      <meta property="og:image" content={product.images[0]} />
      <meta property="product:price:amount" content={product.price} />
      <meta property="product:price:currency" content="CNY" />
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <div>
        <h1>{product.name}</h1>
        <p>¥{product.price}</p>
        <p>{product.description}</p>
      </div>
    </>
  );
}
```

### 7.2 博客文章页面

```jsx
export default function BlogArticle({ article }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: '我的博客',
      logo: {
        '@type': 'ImageObject',
        url: 'https://myblog.com/logo.png'
      }
    }
  };
  
  return (
    <>
      <title>{article.title} | 我的博客</title>
      <meta name="description" content={article.excerpt} />
      <meta name="author" content={article.author.name} />
      
      <meta property="og:type" content="article" />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={article.excerpt} />
      <meta property="og:image" content={article.coverImage} />
      <meta property="article:published_time" content={article.publishedAt} />
      <meta property="article:modified_time" content={article.updatedAt} />
      <meta property="article:author" content={article.author.name} />
      
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <article>
        <h1>{article.title}</h1>
        <time>{article.publishedAt}</time>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </>
  );
}
```

## 注意事项

### 1. 保持标题简洁

```jsx
// ✅ 好的标题
<title>产品名称 | 商店名称</title>

// ❌ 过长的标题
<title>
  这是一个非常非常长的标题，包含了太多无关的信息，
  可能会在搜索结果中被截断...
</title>
```

### 2. 始终提供描述

```jsx
// ✅ 每个页面都应该有描述
<>
  <title>页面标题</title>
  <meta name="description" content="简洁明了的页面描述" />
</>
```

### 3. 注意字符编码

```jsx
// ✅ 正确处理特殊字符
<title>React 19 新特性 — 元数据 API</title>
<meta name="description" content="学习 React 19 的「元数据 API」" />
```

### 4. 使用类型安全

```typescript
// TypeScript类型定义
interface MetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function Meta({ title, description, image, url }: MetaProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <link rel="canonical" href={url} />}
    </>
  );
}
```

### 5. 避免重复标签

```jsx
// ✅ 每个页面只设置一次title
<title>页面标题</title>

// ❌ 避免重复
<title>标题1</title>
<title>标题2</title>  {/* 只有最后一个生效 */}
```

## 常见问题

### Q1: 如何在根组件设置默认元数据？

**A:** 在根布局组件中设置默认值，子组件可以覆盖。

```jsx
// layout.jsx
export default function RootLayout({ children }) {
  return (
    <>
      <title>默认标题</title>
      <meta name="description" content="默认描述" />
      {children}
    </>
  );
}

// page.jsx - 会覆盖默认值
export default function Page() {
  return (
    <>
      <title>页面标题</title>
      <div>内容</div>
    </>
  );
}
```

### Q2: 元数据组件可以放在任何位置吗？

**A:** 可以，React会自动提升到`<head>`。

### Q3: 如何处理多语言的元数据？

**A:** 根据当前语言动态渲染不同的元数据。

```jsx
export default function Page({ locale }) {
  const translations = {
    en: { title: 'My Site', description: 'Description' },
    zh: { title: '我的网站', description: '描述' }
  };
  
  const t = translations[locale];
  
  return (
    <>
      <title>{t.title}</title>
      <meta name="description" content={t.description} />
    </>
  );
}
```

### Q4: 性能会比useEffect好吗？

**A:** 是的，React可以更高效地批量处理和优化元数据更新。

### Q5: Document Metadata API在所有React 19应用中都可用吗？

**A:** 是的，这是React 19的核心特性，所有应用都可以使用。

### Q6: 需要配置什么吗？

**A:** 不需要，开箱即用。

### Q7: 可以和react-helmet一起使用吗？

**A:** 不建议，可能会冲突。应该迁移到原生API。

### Q8: Server Components支持吗？

**A:** 完全支持，而且在SSR场景下性能更好。

## 总结

### Document Metadata API优势

```
✅ 原生支持，无需依赖
✅ 声明式API
✅ 自动提升到<head>
✅ SSR友好
✅ 性能优化
✅ 类型安全
✅ 易于维护
✅ 批量更新优化
✅ 自动去重
```

### 适用场景

```
✅ SEO优化
✅ 社交媒体分享
✅ 动态标题
✅ 多页面应用
✅ 服务端渲染
✅ 静态站点生成
✅ 多语言网站
✅ 电商平台
✅ 博客文章
```

### 迁移建议

```
1. 逐步替换useEffect + document
2. 移除react-helmet等第三方库
3. 使用原生<title>和<meta>
4. 封装通用SEO组件
5. 测试SSR场景
6. 验证SEO效果
7. 添加类型定义
8. 优化性能
```

### 最佳实践

```javascript
// 1. 使用TypeScript获得类型安全
interface SEOProps {
  title: string;
  description: string;
}

// 2. 封装可复用组件
function SEO({ title, description }: SEOProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  );
}

// 3. 使用useMemo优化性能
const structuredData = useMemo(() => ({
  '@type': 'Product',
  name: product.name
}), [product.name]);

// 4. 提供合理的默认值
<title>{pageTitle || '默认标题'}</title>

// 5. 测试SEO效果
// - 使用Google Search Console
// - 验证结构化数据
// - 测试社交媒体分享
```

Document Metadata API让SEO优化变得简单而优雅！
