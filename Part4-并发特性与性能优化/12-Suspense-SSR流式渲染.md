# Suspense SSR流式渲染

## 第一部分：SSR流式渲染基础

### 1.1 什么是SSR流式渲染

SSR流式渲染（Streaming Server Rendering）是React 18引入的服务器渲染新特性。它允许服务器以"流"的方式逐步发送HTML，而不是等待整个页面渲染完成后一次性发送。

**传统SSR vs 流式SSR：**

```javascript
// 传统SSR
// 服务器端
import { renderToString } from 'react-dom/server';

app.get('/', (req, res) => {
  const html = renderToString(<App />);  // 等待全部完成
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
  `);
});

// 问题：
// 1. 必须等待所有数据加载完成
// 2. 阻塞整个响应
// 3. 用户长时间看到白屏

// 流式SSR（React 18）
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      pipe(res);  // 立即开始发送HTML
    }
  });
});

// 优势：
// 1. 快速发送页面框架
// 2. 异步组件逐步流入
// 3. 更快的首屏时间
```

### 1.2 工作原理

```javascript
// 流式渲染的执行流程
function StreamingApp() {
  return (
    <html>
      <body>
        <Header />  {/* 1. 立即渲染并发送 */}
        
        <Suspense fallback={<Spinner />}>
          <SlowContent />  {/* 2. 显示fallback，后续流入真实内容 */}
        </Suspense>
        
        <Footer />  {/* 3. 立即渲染并发送 */}
      </body>
    </html>
  );
}

// 发送顺序：
// 1. Header HTML
// 2. Spinner HTML（fallback）
// 3. Footer HTML
// --- 此时用户已经看到页面 ---
// 4. SlowContent加载完成
// 5. 发送<script>替换Spinner为SlowContent
```

### 1.3 基础示例

```javascript
// 服务器端（Node.js + Express）
import express from 'express';
import { renderToPipeableStream } from 'react-dom/server';

const app = express();

app.get('/', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/client.js'],
      
      onShellReady() {
        // Shell准备好（同步部分）
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      
      onShellError(error) {
        // Shell渲染错误
        res.statusCode = 500;
        res.send('<h1>Server Error</h1>');
      },
      
      onAllReady() {
        // 所有内容准备好（包括Suspense）
        // 爬虫等待此时机
      },
      
      onError(error) {
        console.error('Streaming error:', error);
      }
    }
  );
  
  // 请求超时处理
  setTimeout(() => {
    abort();
  }, 10000);
});

app.listen(3000);

// 客户端
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document, <App />);
```

### 1.4 Suspense在SSR中的作用

```javascript
// SSR中的Suspense
function SSRApp() {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="root">
          <Header />
          
          {/* Suspense边界：异步内容 */}
          <Suspense fallback={<ContentSkeleton />}>
            <AsyncContent />
          </Suspense>
          
          <Footer />
        </div>
        
        <script src="/client.js"></script>
      </body>
    </html>
  );
}

// 服务器渲染流程：
// 1. 渲染Header -> 发送HTML
// 2. 遇到Suspense -> 发送ContentSkeleton
// 3. 渲染Footer -> 发送HTML
// 4. AsyncContent准备好 -> 发送替换脚本
// 5. 客户端hydration
```

## 第二部分：实战模式

### 2.1 数据获取流式渲染

```javascript
// 服务器端数据获取
// api.js
export async function fetchUserData(userId) {
  const res = await fetch(`https://api.example.com/users/${userId}`);
  return res.json();
}

export async function fetchPosts(userId) {
  // 模拟慢速API
  await new Promise(resolve => setTimeout(resolve, 2000));
  const res = await fetch(`https://api.example.com/users/${userId}/posts`);
  return res.json();
}

// App.js
import { use } from 'react';

function UserProfile({ userId }) {
  const user = use(fetchUserData(userId));
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  );
}

function UserPosts({ userId }) {
  const posts = use(fetchPosts(userId));
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}

// server.js
app.get('/user/:id', (req, res) => {
  const { pipe } = renderToPipeableStream(
    <UserProfile userId={req.params.id} />,
    {
      onShellReady() {
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      }
    }
  );
});

// 执行流程：
// 1. 快速发送用户基本信息（name, email）
// 2. 发送PostsSkeleton
// 3. 2秒后发送UserPosts真实内容
```

### 2.2 多层嵌套流式渲染

```javascript
// 复杂页面结构
function ProductPage({ productId }) {
  return (
    <html>
      <body>
        <Navbar />  {/* 立即渲染 */}
        
        <main>
          {/* 第一层：产品基本信息 */}
          <Suspense fallback={<ProductInfoSkeleton />}>
            <ProductInfo productId={productId} />
            
            {/* 第二层：评论 */}
            <Suspense fallback={<ReviewsSkeleton />}>
              <Reviews productId={productId} />
            </Suspense>
            
            {/* 第二层：推荐 */}
            <Suspense fallback={<RecommendationsSkeleton />}>
              <Recommendations productId={productId} />
            </Suspense>
          </Suspense>
        </main>
        
        <Footer />  {/* 立即渲染 */}
      </body>
    </html>
  );
}

// 渲染时间线：
// 0ms:    发送 Navbar, ProductInfoSkeleton, Footer
// 500ms:  ProductInfo准备好 -> 发送替换脚本
//         同时发送 ReviewsSkeleton 和 RecommendationsSkeleton
// 1000ms: Reviews准备好 -> 发送替换脚本
// 1500ms: Recommendations准备好 -> 发送替换脚本
```

### 2.3 选择性Hydration

```javascript
// React 18的选择性Hydration
function App() {
  return (
    <html>
      <body>
        <Header />  {/* 立即hydrate */}
        
        <Suspense fallback={<Spinner />}>
          <Comments />  {/* 延迟hydrate，用户交互时优先 */}
        </Suspense>
        
        <Suspense fallback={<Spinner />}>
          <Sidebar />  {/* 延迟hydrate */}
        </Suspense>
      </body>
    </html>
  );
}

// Hydration顺序：
// 1. Header立即hydrate
// 2. 用户点击Comments -> Comments优先hydrate
// 3. Sidebar等待或后台hydrate

// 客户端代码
hydrateRoot(document, <App />, {
  onRecoverableError(error) {
    console.error('Hydration error:', error);
  }
});
```

### 2.4 流式渲染 + 代码分割

```javascript
// 结合lazy和Suspense
import { lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));
const Chart = lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <html>
      <body>
        <Header />
        
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardStats />
          
          <Suspense fallback={<ChartSkeleton />}>
            <Chart />  {/* 代码分割 + 流式渲染 */}
          </Suspense>
        </Suspense>
      </body>
    </html>
  );
}

// 执行流程：
// 1. 服务器发送Header, DashboardSkeleton
// 2. DashboardStats准备好 -> 发送HTML
// 3. 发送ChartSkeleton
// 4. Chart组件下载完成 -> hydrate
// 5. Chart数据准备好 -> 渲染
```

### 2.5 错误处理

```javascript
// SSR错误边界
class ServerErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>出错了</h2>
          <details>
            <summary>错误详情</summary>
            <pre>{this.state.error.stack}</pre>
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <html>
      <body>
        <ServerErrorBoundary>
          <Suspense fallback={<Loading />}>
            <MainContent />
          </Suspense>
        </ServerErrorBoundary>
      </body>
    </html>
  );
}

// 服务器配置
app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellError(error) {
      // Shell渲染失败
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <body>
            <h1>500 - Server Error</h1>
            <p>${error.message}</p>
          </body>
        </html>
      `);
    },
    
    onError(error) {
      // Suspense内容错误（不中断流）
      console.error('Streaming error:', error);
      // 错误会被ErrorBoundary捕获
    }
  });
});
```

## 第三部分：性能优化

### 3.1 Shell优化

```javascript
// 最小化Shell大小
function OptimizedShell() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>My App</title>
        <link rel="stylesheet" href="/critical.css" />
      </head>
      <body>
        <div id="root">
          {/* Shell：关键UI框架 */}
          <header>
            <Logo />
            <nav>{/* 简化的导航 */}</nav>
          </header>
          
          {/* 非关键内容放在Suspense中 */}
          <Suspense fallback={<PageSkeleton />}>
            <MainContent />
          </Suspense>
        </div>
      </body>
    </html>
  );
}

// Shell应该包含：
// ✅ HTML结构
// ✅ 关键CSS
// ✅ 基本布局
// ✅ 品牌元素

// Shell不应包含：
// ❌ 大型数据
// ❌ 复杂计算
// ❌ 异步内容
// ❌ 非关键脚本
```

### 3.2 预加载优化

```javascript
// 资源预加载
function AppWithPreload() {
  return (
    <html>
      <head>
        <title>My App</title>
        
        {/* 预加载关键资源 */}
        <link rel="preload" href="/critical.css" as="style" />
        <link rel="preload" href="/app.js" as="script" />
        <link rel="preload" href="/font.woff2" as="font" crossOrigin="" />
        
        {/* 预连接API */}
        <link rel="preconnect" href="https://api.example.com" />
        <link rel="dns-prefetch" href="https://cdn.example.com" />
      </head>
      <body>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </body>
    </html>
  );
}

// 动态预加载
function DynamicPreload({ resources }) {
  return (
    <html>
      <head>
        {resources.map(resource => (
          <link
            key={resource.href}
            rel="preload"
            href={resource.href}
            as={resource.as}
          />
        ))}
      </head>
      <body>
        <App />
      </body>
    </html>
  );
}
```

### 3.3 数据预取

```javascript
// 服务器端数据预取
// server.js
import { preloadQuery } from './data-fetching';

app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  
  // 预取关键数据
  const userDataPromise = preloadQuery('user', userId);
  
  const { pipe } = renderToPipeableStream(
    <UserProfileWithData 
      userId={userId}
      userDataPromise={userDataPromise}
    />,
    {
      onShellReady() {
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      }
    }
  );
});

// 组件使用预取数据
function UserProfileWithData({ userId, userDataPromise }) {
  // 直接使用预取的Promise
  const user = use(userDataPromise);
  
  return (
    <div>
      <h1>{user.name}</h1>
      
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  );
}
```

### 3.4 缓存策略

```javascript
// 服务器端缓存
import LRU from 'lru-cache';

const htmlCache = new LRU({
  max: 100,
  ttl: 1000 * 60 * 5  // 5分钟
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const cacheKey = `product-${productId}`;
  
  // 检查缓存
  const cached = htmlCache.get(cacheKey);
  if (cached) {
    res.send(cached);
    return;
  }
  
  let html = '';
  
  const { pipe } = renderToPipeableStream(
    <ProductPage productId={productId} />,
    {
      onShellReady() {
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      
      onAllReady() {
        // 所有内容准备好，缓存完整HTML
        htmlCache.set(cacheKey, html);
      }
    }
  );
  
  // 收集HTML
  const originalPipe = pipe;
  pipe = (destination) => {
    destination.on('data', chunk => {
      html += chunk.toString();
    });
    return originalPipe(destination);
  };
});

// CDN缓存
app.get('/public-page', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  
  const { pipe } = renderToPipeableStream(<PublicPage />, {
    onShellReady() {
      pipe(res);
    }
  });
});
```

## 第四部分：高级技巧

### 4.1 SEO优化

```javascript
// SEO友好的流式渲染
app.get('/article/:id', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <ArticlePage articleId={req.params.id} />,
    {
      onShellReady() {
        // 普通浏览器：立即发送
        if (!isCrawler(req.headers['user-agent'])) {
          res.setHeader('Content-Type', 'text/html');
          pipe(res);
        }
      },
      
      onAllReady() {
        // 爬虫：等待所有内容
        if (isCrawler(req.headers['user-agent'])) {
          res.setHeader('Content-Type', 'text/html');
          pipe(res);
        }
      },
      
      onError(error) {
        console.error(error);
      }
    }
  );
  
  // 超时保护
  setTimeout(() => {
    abort();
  }, 10000);
});

function isCrawler(userAgent) {
  const crawlers = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider'
  ];
  
  return crawlers.some(bot => 
    userAgent?.toLowerCase().includes(bot)
  );
}
```

### 4.2 渐进式Hydration

```javascript
// 分优先级hydration
import { lazy } from 'react';

const HighPriorityComponent = lazy(() => 
  import('./HighPriorityComponent')
);

const LowPriorityComponent = lazy(() =>
  import(
    /* webpackPrefetch: true */
    './LowPriorityComponent'
  )
);

function App() {
  return (
    <html>
      <body>
        {/* 高优先级：立即hydrate */}
        <Suspense fallback={<Spinner />}>
          <HighPriorityComponent />
        </Suspense>
        
        {/* 低优先级：延迟hydrate */}
        <Suspense fallback={<Spinner />}>
          <LowPriorityComponent />
        </Suspense>
      </body>
    </html>
  );
}

// 客户端
import { startTransition } from 'react';

hydrateRoot(document, <App />);

// 低优先级组件使用transition hydrate
startTransition(() => {
  // 低优先级hydration
});
```

### 4.3 流式渲染监控

```javascript
// 性能监控
app.get('/', (req, res) => {
  const metrics = {
    shellTime: 0,
    totalTime: 0,
    suspenseCount: 0
  };
  
  const startTime = Date.now();
  
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      metrics.shellTime = Date.now() - startTime;
      console.log(`Shell ready: ${metrics.shellTime}ms`);
      
      pipe(res);
    },
    
    onAllReady() {
      metrics.totalTime = Date.now() - startTime;
      
      // 发送监控数据
      sendMetrics({
        route: req.path,
        ...metrics,
        userAgent: req.headers['user-agent']
      });
    },
    
    onError(error) {
      trackError({
        error: error.message,
        route: req.path
      });
    }
  });
});

// 客户端性能监控
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    
    console.log('Performance Metrics:', {
      TTFB: perfData.responseStart - perfData.requestStart,
      FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime
    });
  });
}
```

### 4.4 降级策略

```javascript
// 优雅降级
app.get('/', (req, res) => {
  const supportsStreaming = 
    !isCrawler(req.headers['user-agent']) &&
    !req.query.nostream;
  
  if (supportsStreaming) {
    // 流式渲染
    const { pipe } = renderToPipeableStream(<App />, {
      onShellReady() {
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      }
    });
  } else {
    // 传统SSR
    const html = renderToString(<App />);
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="root">${html}</div>
          <script src="/client.js"></script>
        </body>
      </html>
    `);
  }
});

// 客户端检测支持
if ('ReadableStream' in window) {
  // 支持流式
  hydrateRoot(document, <App />);
} else {
  // 不支持，使用传统hydration
  ReactDOM.hydrate(<App />, document.getElementById('root'));
}
```

## 注意事项

### 1. Shell设计

```javascript
// ❌ Shell太重
function HeavyShell() {
  const data = fetchHeavyData();  // 阻塞Shell
  
  return (
    <html>
      <body>
        <HeavyHeader data={data} />
        <Content />
      </body>
    </html>
  );
}

// ✅ 轻量Shell
function LightShell() {
  return (
    <html>
      <body>
        <SimpleHeader />  // 不依赖数据
        
        <Suspense fallback={<ContentSkeleton />}>
          <Content />
        </Suspense>
      </body>
    </html>
  );
}
```

### 2. 错误处理

```javascript
// 完善的错误处理
app.get('/', (req, res) => {
  let didError = false;
  
  const { pipe, abort } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = didError ? 500 : 200;
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    },
    
    onShellError(error) {
      res.statusCode = 500;
      res.send('<h1>Server Error</h1>');
    },
    
    onError(error) {
      didError = true;
      console.error(error);
    }
  });
  
  setTimeout(abort, 10000);
});
```

### 3. 浏览器兼容性

```javascript
// 检查流式支持
const supportsStreaming = () => {
  return (
    typeof ReadableStream !== 'undefined' &&
    typeof TextDecoder !== 'undefined'
  );
};

// 条件使用
if (supportsStreaming()) {
  // 使用流式渲染
} else {
  // 降级到传统SSR
}
```

## 常见问题

### Q1: 流式SSR和传统SSR的主要区别？

**A:** 流式SSR逐步发送HTML，传统SSR等待全部完成后发送。

### Q2: 所有浏览器都支持流式渲染吗？

**A:** 现代浏览器支持，老旧浏览器需要降级。

### Q3: SEO会受影响吗？

**A:** 不会，可以为爬虫等待onAllReady。

### Q4: 如何调试流式SSR？

**A:** 使用Network面板查看响应，或禁用流式模式调试。

### Q5: Suspense在SSR中必需吗？

**A:** 不是必需，但推荐用于异步内容。

### Q6: 如何处理hydration错误？

**A:** 使用onRecoverableError和ErrorBoundary。

### Q7: 流式渲染会增加服务器负担吗？

**A:** 轻微增加，但用户体验提升值得。

### Q8: 可以缓存流式响应吗？

**A:** 可以，在onAllReady后缓存完整HTML。

### Q9: Next.js支持流式SSR吗？

**A:** Next.js 13+默认支持。

### Q10: 如何测试流式SSR性能？

**A:** 使用Lighthouse、WebPageTest等工具。

## 总结

### 核心要点

```
1. 流式SSR优势
   ✅ 更快的首屏时间
   ✅ 渐进式内容显示
   ✅ 选择性Hydration
   ✅ 更好的用户体验

2. 关键概念
   ✅ Shell（页面框架）
   ✅ Suspense边界
   ✅ 流式发送
   ✅ 选择性Hydration

3. 最佳实践
   ✅ 轻量Shell
   ✅ 合理Suspense边界
   ✅ 错误处理
   ✅ SEO优化
```

### 实施建议

```
1. 渐进式采用
   ✅ 从简单页面开始
   ✅ 逐步添加Suspense
   ✅ 监控性能指标
   ✅ 优化Shell大小

2. 性能优化
   ✅ 预取关键数据
   ✅ 资源预加载
   ✅ CDN缓存
   ✅ 降级策略

3. 开发实践
   ✅ 完善错误处理
   ✅ 性能监控
   ✅ SEO友好
   ✅ 浏览器兼容
```

流式SSR是React 18的杀手级特性，掌握它能显著提升应用的加载性能和用户体验。

