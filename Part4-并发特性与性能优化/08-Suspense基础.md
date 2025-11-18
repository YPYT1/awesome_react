# Suspense基础

## 第一部分：Suspense概述

### 1.1 什么是Suspense

Suspense是React的一个组件，用于优雅地处理异步操作的加载状态。它允许组件在等待某些内容加载时"挂起"，并显示一个备用UI（fallback）。

**基本语法：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}

// 当AsyncComponent挂起时，显示<Loading />
// 加载完成后，显示AsyncComponent的实际内容
```

### 1.2 核心概念

```javascript
// 1. Fallback UI
<Suspense fallback={<Spinner />}>
  <Content />
</Suspense>

// 2. 嵌套Suspense
<Suspense fallback={<PageLoader />}>
  <Header />
  <Suspense fallback={<ContentLoader />}>
    <MainContent />
  </Suspense>
  <Footer />
</Suspense>

// 3. 多个子组件
<Suspense fallback={<Loading />}>
  <Component1 />  {/* 任一组件挂起都会显示fallback */}
  <Component2 />
  <Component3 />
</Suspense>

// 4. 挂起条件
// 组件在以下情况会挂起：
// - 读取未完成的Promise（通过use Hook）
// - 使用React.lazy动态导入
// - 使用支持Suspense的数据获取库
```

### 1.3 工作原理

```javascript
// Suspense的内部机制（简化版）
class Suspense extends React.Component {
  state = {
    suspended: false,
    promise: null
  };
  
  componentDidCatch(error) {
    // 捕获Promise（特殊的"错误"）
    if (error instanceof Promise) {
      this.setState({ 
        suspended: true, 
        promise: error 
      });
      
      error.then(() => {
        // Promise完成后重新渲染
        this.setState({ suspended: false });
      });
    }
  }
  
  render() {
    if (this.state.suspended) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 组件如何"挂起"
function AsyncComponent() {
  const data = readResource();  // 抛出Promise
  return <div>{data}</div>;
}

function readResource() {
  if (!dataLoaded) {
    throw fetchDataPromise;  // 抛出Promise "挂起"
  }
  return cachedData;
}
```

### 1.4 简单示例

```javascript
// 示例1：基础使用
function App() {
  return (
    <div>
      <h1>我的应用</h1>
      
      <Suspense fallback={<div>加载中...</div>}>
        <UserProfile userId={1} />
      </Suspense>
    </div>
  );
}

// 示例2：自定义Fallback
function CustomFallback() {
  return (
    <div className="loading-container">
      <Spinner />
      <p>正在加载内容...</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<CustomFallback />}>
      <Content />
    </Suspense>
  );
}

// 示例3：条件Suspense
function ConditionalSuspense({ showAsync }) {
  return (
    <div>
      {showAsync ? (
        <Suspense fallback={<Loading />}>
          <AsyncContent />
        </Suspense>
      ) : (
        <SyncContent />
      )}
    </div>
  );
}

// 示例4：多个边界
function MultipleB boundaries() {
  return (
    <div>
      <Suspense fallback={<HeaderLoading />}>
        <Header />
      </Suspense>
      
      <Suspense fallback={<MainLoading />}>
        <Main />
      </Suspense>
      
      <Suspense fallback={<SidebarLoading />}>
        <Sidebar />
      </Suspense>
    </div>
  );
}
```

## 第二部分：Fallback设计

### 2.1 Fallback类型

```javascript
// 1. 简单文本
<Suspense fallback="加载中...">
  <Content />
</Suspense>

// 2. Spinner组件
<Suspense fallback={<Spinner />}>
  <Content />
</Suspense>

// 3. 骨架屏
<Suspense fallback={<Skeleton />}>
  <UserCard />
</Suspense>

// 4. 完整布局占位
<Suspense fallback={<ContentSkeleton />}>
  <Article />
</Suspense>

// 5. 自定义动画
<Suspense fallback={<LoadingAnimation />}>
  <Dashboard />
</Suspense>
```

### 2.2 骨架屏设计

```javascript
// 用户卡片骨架屏
function UserCardSkeleton() {
  return (
    <div className="user-card skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-info">
        <div className="skeleton-line skeleton-line-title"></div>
        <div className="skeleton-line skeleton-line-subtitle"></div>
      </div>
    </div>
  );
}

// CSS
/*
.skeleton {
  background: #f0f0f0;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-line {
  height: 12px;
  margin: 8px 0;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-line-title {
  width: 80%;
}

.skeleton-line-subtitle {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
*/

// 使用骨架屏
function UserProfile({ userId }) {
  return (
    <Suspense fallback={<UserCardSkeleton />}>
      <UserCard userId={userId} />
    </Suspense>
  );
}
```

### 2.3 渐进式Fallback

```javascript
// 分层加载
function ProgressiveFallback() {
  return (
    <div className="page">
      {/* 立即显示的部分 */}
      <Header />
      
      {/* 第一层Suspense：快速内容 */}
      <Suspense fallback={<QuickContentSkeleton />}>
        <QuickContent />
        
        {/* 第二层Suspense：慢速内容 */}
        <Suspense fallback={<DetailsSkeleton />}>
          <DetailedContent />
        </Suspense>
      </Suspense>
      
      {/* 始终显示的部分 */}
      <Footer />
    </div>
  );
}

// 延迟显示Fallback
function DelayedFallback({ delay = 200, children }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!show) return null;
  return children;
}

// 使用延迟Fallback
function SmartSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <DelayedFallback delay={200}>
          <Spinner />
        </DelayedFallback>
      }
    >
      {children}
    </Suspense>
  );
}
```

### 2.4 交互式Fallback

```javascript
// 带取消按钮的Fallback
function CancellableFallback({ onCancel }) {
  return (
    <div className="loading-with-cancel">
      <Spinner />
      <p>正在加载...</p>
      <button onClick={onCancel}>取消</button>
    </div>
  );
}

// 使用
function DataLoader() {
  const [load, setLoad] = useState(true);
  
  if (!load) return <div>已取消加载</div>;
  
  return (
    <Suspense fallback={
      <CancellableFallback onCancel={() => setLoad(false)} />
    }>
      <DataComponent />
    </Suspense>
  );
}

// 带进度的Fallback
function ProgressFallback({ progress }) {
  return (
    <div className="progress-loader">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p>{progress}% 已加载</p>
    </div>
  );
}
```

## 第三部分：Suspense边界

### 3.1 边界粒度

```javascript
// ❌ 粒度太粗：整个页面一个边界
function TooCoarse() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Header />
      <Main />
      <Sidebar />
      <Footer />
    </Suspense>
  );
  // 问题：任何一个组件挂起，整个页面都显示加载
}

// ❌ 粒度太细：每个元素一个边界
function TooFine() {
  return (
    <div>
      <Suspense fallback={<span>...</span>}>
        <UserName />
      </Suspense>
      <Suspense fallback={<span>...</span>}>
        <UserAvatar />
      </Suspense>
      <Suspense fallback={<span>...</span>}>
        <UserBio />
      </Suspense>
    </div>
  );
  // 问题：过多的边界，UI闪烁严重
}

// ✅ 合适的粒度：按功能区域
function JustRight() {
  return (
    <div>
      <Header />  {/* 不挂起，立即显示 */}
      
      <Suspense fallback={<MainContentSkeleton />}>
        <MainContent />  {/* 主要内容一个边界 */}
      </Suspense>
      
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />  {/* 侧边栏独立边界 */}
      </Suspense>
      
      <Footer />  {/* 不挂起，立即显示 */}
    </div>
  );
}
```

### 3.2 嵌套边界

```javascript
// 嵌套Suspense的执行顺序
function NestedSuspense() {
  return (
    <Suspense fallback={<OuterLoader />}>
      {/* 外层边界 */}
      
      <OuterContent />
      
      <Suspense fallback={<InnerLoader />}>
        {/* 内层边界 */}
        <InnerContent />
      </Suspense>
    </Suspense>
  );
}

// 执行流程：
// 1. OuterContent挂起 -> 显示OuterLoader
// 2. OuterContent加载完 -> 开始渲染内容
// 3. InnerContent挂起 -> 显示InnerLoader（不影响OuterContent）
// 4. InnerContent加载完 -> 完整显示

// 实际示例：文章页面
function ArticlePage() {
  return (
    <div className="article-page">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleHeader />
        <ArticleContent />
        
        <Suspense fallback={<CommentsSkeleton />}>
          <Comments />
        </Suspense>
        
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations />
        </Suspense>
      </Suspense>
    </div>
  );
}

// 多级嵌套
function MultiLevelNesting() {
  return (
    <Suspense fallback={<Level1Loader />}>
      <Level1Content />
      
      <Suspense fallback={<Level2Loader />}>
        <Level2Content />
        
        <Suspense fallback={<Level3Loader />}>
          <Level3Content />
        </Suspense>
      </Suspense>
    </Suspense>
  );
}
```

### 3.3 SuspenseList（实验性）

```javascript
// SuspenseList协调多个Suspense的显示顺序
import { SuspenseList } from 'react';

// 1. 按顺序显示（revealOrder="forwards"）
function ForwardsList() {
  return (
    <SuspenseList revealOrder="forwards">
      <Suspense fallback={<Skeleton />}>
        <Item1 />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <Item2 />
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <Item3 />
      </Suspense>
    </SuspenseList>
  );
  // Item1加载完才显示Item2，Item2完才显示Item3
}

// 2. 倒序显示（revealOrder="backwards"）
function BackwardsList() {
  return (
    <SuspenseList revealOrder="backwards">
      <Suspense fallback={<Skeleton />}>
        <Item1 />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Item2 />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Item3 />
      </Suspense>
    </SuspenseList>
  );
  // Item3、Item2、Item1的顺序显示
}

// 3. 同时显示（revealOrder="together"）
function TogetherList() {
  return (
    <SuspenseList revealOrder="together">
      <Suspense fallback={<Skeleton />}>
        <Item1 />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Item2 />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Item3 />
      </Suspense>
    </SuspenseList>
  );
  // 等所有都加载完才一起显示
}

// 4. tail属性控制Fallback显示
function WithTail() {
  return (
    <SuspenseList revealOrder="forwards" tail="collapsed">
      <Suspense fallback={<Skeleton />}>
        <Item1 />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Item2 />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Item3 />
      </Suspense>
    </SuspenseList>
  );
  // tail="collapsed": 只显示下一个Fallback
  // tail="hidden": 不显示后续Fallback
}
```

### 3.4 动态边界

```javascript
// 根据条件添加/移除Suspense
function DynamicSuspense({ enableSuspense, children }) {
  if (enableSuspense) {
    return (
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    );
  }
  return children;
}

// 使用
function App() {
  const [useSuspense, setUseSuspense] = useState(true);
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={useSuspense}
          onChange={e => setUseSuspense(e.target.checked)}
        />
        启用Suspense
      </label>
      
      <DynamicSuspense enableSuspense={useSuspense}>
        <AsyncContent />
      </DynamicSuspense>
    </div>
  );
}

// 根据网络状态决定
function NetworkAwareSuspense({ children }) {
  const isOnline = useNetworkStatus();
  
  if (!isOnline) {
    return <OfflineMessage />;
  }
  
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}
```

## 第四部分：与其他模式结合

### 4.1 Suspense + Error Boundary

```javascript
// 结合错误边界
function SafeContent({ userId }) {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}

// 流程：
// 1. UserProfile挂起 -> 显示Loading
// 2. 加载成功 -> 显示UserProfile
// 3. 加载失败 -> ErrorBoundary捕获 -> 显示ErrorMessage

// 复杂错误处理
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    logError(error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>出错了</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 完整的加载流程
function RobustComponent() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Skeleton />}>
        <ErrorBoundary>
          <Suspense fallback={<DetailsSkeleton />}>
            <Details />
          </Suspense>
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Suspense fallback={<CommentsSkeleton />}>
            <Comments />
          </Suspense>
        </ErrorBoundary>
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 4.2 Suspense + Transition

```javascript
// 结合useTransition避免闪烁
function TransitionSuspense() {
  const [resource, setResource] = useState(initialResource);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (newId) => {
    startTransition(() => {
      setResource(fetchResource(newId));
    });
  };
  
  return (
    <div>
      <Tabs onChange={handleChange} />
      
      {isPending && <InlineSpinner />}
      
      <Suspense fallback={<ContentSkeleton />}>
        <Content resource={resource} />
      </Suspense>
    </div>
  );
}

// 没有transition的问题
function WithoutTransition() {
  const [resource, setResource] = useState(initialResource);
  
  return (
    <div>
      <Tabs onChange={id => setResource(fetchResource(id))} />
      
      <Suspense fallback={<ContentSkeleton />}>
        <Content resource={resource} />
      </Suspense>
    </div>
  );
  // 问题：切换tab时，立即显示skeleton，闪烁
}

// 使用transition的优势
function WithTransition() {
  const [resource, setResource] = useState(initialResource);
  const [isPending, startTransition] = useTransition();
  
  return (
    <div>
      <Tabs 
        onChange={id => {
          startTransition(() => {
            setResource(fetchResource(id));
          });
        }} 
      />
      
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        <Suspense fallback={<ContentSkeleton />}>
          <Content resource={resource} />
        </Suspense>
      </div>
    </div>
  );
  // 优势：保留旧内容，新内容ready才切换
}
```

### 4.3 Suspense + useDeferredValue

```javascript
// 延迟Suspense触发
function DeferredSuspense() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </div>
  );
}

// 对比：不使用defer
function ImmediateSuspense() {
  const [query, setQuery] = useState('');
  
  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
  // 问题：每次输入都可能触发Suspense
}
```

### 4.4 Suspense + React.lazy

```javascript
// 代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<ComponentLoader />}>
      <LazyComponent />
    </Suspense>
  );
}

// 多个lazy组件
const Header = React.lazy(() => import('./Header'));
const Main = React.lazy(() => import('./Main'));
const Sidebar = React.lazy(() => import('./Sidebar'));

function App() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      
      <div className="content">
        <Suspense fallback={<MainSkeleton />}>
          <Main />
        </Suspense>
        
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </div>
    </div>
  );
}

// 条件lazy加载
function ConditionalLazy({ showHeavyComponent }) {
  const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
  
  if (!showHeavyComponent) {
    return <LightComponent />;
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 第五部分：实践技巧

### 5.1 预加载

```javascript
// 预加载资源
function preloadResource(resourceId) {
  const resource = fetchResource(resourceId);
  // 触发加载但不使用
  return resource;
}

// 使用预加载
function SmartPreload() {
  const [currentId, setCurrentId] = useState(1);
  const [resource, setResource] = useState(fetchResource(1));
  
  const handleHover = (nextId) => {
    // 鼠标悬停时预加载
    preloadResource(nextId);
  };
  
  const handleClick = (nextId) => {
    startTransition(() => {
      setCurrentId(nextId);
      setResource(fetchResource(nextId));
    });
  };
  
  return (
    <div>
      <nav>
        {[1, 2, 3].map(id => (
          <button
            key={id}
            onMouseEnter={() => handleHover(id)}
            onClick={() => handleClick(id)}
          >
            Item {id}
          </button>
        ))}
      </nav>
      
      <Suspense fallback={<ContentSkeleton />}>
        <Content resource={resource} />
      </Suspense>
    </div>
  );
}

// Route预加载
function RoutePreload() {
  const navigate = useNavigate();
  
  const routes = [
    { path: '/', component: React.lazy(() => import('./Home')) },
    { path: '/about', component: React.lazy(() => import('./About')) },
    { path: '/contact', component: React.lazy(() => import('./Contact')) }
  ];
  
  const preloadRoute = (path) => {
    const route = routes.find(r => r.path === path);
    if (route) {
      route.component.preload?.();
    }
  };
  
  return (
    <nav>
      <Link
        to="/"
        onMouseEnter={() => preloadRoute('/')}
      >
        Home
      </Link>
      
      <Link
        to="/about"
        onMouseEnter={() => preloadRoute('/about')}
      >
        About
      </Link>
    </nav>
  );
}
```

### 5.2 缓存策略

```javascript
// 简单缓存
const cache = new Map();

function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const promise = fetch(url)
    .then(res => res.json())
    .then(data => {
      cache.set(url, data);
      return data;
    });
  
  cache.set(url, promise);
  throw promise;  // Suspense
}

// 使用SWR模式
function useSWR(key, fetcher) {
  const [data, setData] = useState(() => {
    if (cache.has(key)) {
      return cache.get(key);
    }
    throw fetcher(key).then(d => {
      cache.set(key, d);
      setData(d);
      return d;
    });
  });
  
  return data;
}

// React Query风格
function useQuery(key, fetcher) {
  const [state, setState] = useState(() => {
    const cached = queryCache.get(key);
    if (cached && !isStale(cached)) {
      return cached.data;
    }
    
    const promise = fetcher().then(data => {
      queryCache.set(key, {
        data,
        timestamp: Date.now()
      });
      setState(data);
      return data;
    });
    
    throw promise;
  });
  
  return state;
}
```

### 5.3 超时处理

```javascript
// Suspense超时
function SuspenseWithTimeout({ timeout = 5000, children, fallback }) {
  const [showFallback, setShowFallback] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  
  useEffect(() => {
    setShowFallback(true);
    
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeout);
    
    return () => {
      clearTimeout(timer);
      setShowFallback(false);
      setTimedOut(false);
    };
  }, [timeout]);
  
  if (timedOut) {
    return (
      <div className="timeout-error">
        <p>加载超时</p>
        <button onClick={() => window.location.reload()}>
          刷新页面
        </button>
      </div>
    );
  }
  
  return (
    <Suspense fallback={showFallback ? fallback : null}>
      {children}
    </Suspense>
  );
}

// 使用
function App() {
  return (
    <SuspenseWithTimeout
      timeout={5000}
      fallback={<Loading />}
    >
      <SlowComponent />
    </SuspenseWithTimeout>
  );
}
```

### 5.4 调试技巧

```javascript
// Suspense调试工具
function DebugSuspense({ name, children, ...props }) {
  const [suspended, setSuspended] = useState(false);
  
  useEffect(() => {
    console.log(`[Suspense:${name}] Mounted`);
    
    return () => {
      console.log(`[Suspense:${name}] Unmounted`);
    };
  }, [name]);
  
  const fallback = (
    <div>
      {props.fallback}
      <DebugInfo name={name} suspended={true} />
    </div>
  );
  
  return (
    <Suspense {...props} fallback={fallback}>
      {children}
      <DebugInfo name={name} suspended={false} />
    </Suspense>
  );
}

function DebugInfo({ name, suspended }) {
  useEffect(() => {
    console.log(`[Suspense:${name}] ${suspended ? 'Suspended' : 'Resumed'}`);
  });
  
  return null;
}

// 性能监控
function MonitoredSuspense({ children, fallback, onSuspend, onResume }) {
  const startTimeRef = useRef(null);
  
  const trackedFallback = (
    <SuspenseTracker onMount={() => {
      startTimeRef.current = performance.now();
      onSuspend?.();
    }}>
      {fallback}
    </SuspenseTracker>
  );
  
  useEffect(() => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      onResume?.(duration);
      startTimeRef.current = null;
    }
  });
  
  return (
    <Suspense fallback={trackedFallback}>
      {children}
    </Suspense>
  );
}
```

## 注意事项

### 1. 常见陷阱

```javascript
// ❌ 在循环中使用Suspense
function BadLoop() {
  return items.map(item => (
    <Suspense key={item.id} fallback={<Skeleton />}>
      <Item data={item} />
    </Suspense>
  ));
  // 问题：过多边界，性能差
}

// ✅ 正确做法
function GoodLoop() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      {items.map(item => (
        <Item key={item.id} data={item} />
      ))}
    </Suspense>
  );
}

// ❌ Fallback包含状态
function BadFallback() {
  const [count, setCount] = useState(0);
  
  return (
    <Suspense fallback={
      <div>
        <Spinner />
        <button onClick={() => setCount(c => c + 1)}>
          {count}
        </button>
      </div>
    }>
      <Content />
    </Suspense>
  );
  // 问题：每次挂起都重置状态
}

// ✅ Fallback应该是纯展示
function GoodFallback() {
  return (
    <Suspense fallback={<SimpleSpinner />}>
      <Content />
    </Suspense>
  );
}
```

### 2. 性能考虑

```javascript
// 避免不必要的Suspense
function UnnecessarySuspense() {
  return (
    <Suspense fallback={<Loading />}>
      <div>Hello World</div>  {/* 不会挂起 */}
    </Suspense>
  );
  // Suspense有开销，不挂起的内容不需要包裹
}

// 合并相近的边界
function MergeBoundaries() {
  // ❌ 太多边界
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <Header />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <SubHeader />
      </Suspense>
    </div>
  );
  
  // ✅ 合并
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <Header />
      <SubHeader />
    </Suspense>
  );
}
```

### 3. SSR考虑

```javascript
// SSR中的Suspense
function SSRSuspense() {
  return (
    <Suspense fallback={<ServerSkeleton />}>
      <AsyncServerComponent />
    </Suspense>
  );
}

// 注意：
// - React 18+支持SSR中的Suspense
// - Fallback会在服务器渲染
// - 流式HTML传输
// - 客户端hydration时继续加载
```

## 常见问题

### Q1: Suspense和loading状态有什么区别？

**A:** Suspense是声明式的，自动处理异步状态；传统loading是命令式的，需要手动管理。

### Q2: 可以在Suspense外部捕获Promise吗？

**A:** 不行，Promise必须在Suspense边界内抛出。

### Q3: Fallback何时显示？

**A:** 任一子组件挂起时立即显示。

### Q4: 多个组件同时挂起怎么办？

**A:** 显示同一个Fallback，全部ready后一起显示。

### Q5: Suspense会影响SEO吗？

**A:** React 18的SSR Suspense不影响SEO，服务器会等待内容ready。

### Q6: 可以嵌套多少层Suspense？

**A:** 无限制，但过深影响性能。

### Q7: Suspense支持哪些数据源？

**A:** React.lazy、use Hook、支持Suspense的库（如Relay）。

### Q8: 如何测试Suspense组件？

**A:** 使用testing-library的waitFor等待内容显示。

### Q9: Fallback可以是异步的吗？

**A:** 不可以，Fallback必须是同步组件。

### Q10: Suspense在并发模式下有什么不同？

**A:** 并发模式下Suspense可以被打断，配合Transition更流畅。

## 总结

### 核心要点

```
1. Suspense基本概念
   ✅ 异步状态的声明式处理
   ✅ Fallback UI设计
   ✅ 边界粒度控制
   ✅ 嵌套与组合

2. 最佳实践
   ✅ 合适的边界粒度
   ✅ 优秀的Fallback设计
   ✅ 配合Error Boundary
   ✅ 结合Transition避免闪烁

3. 高级技巧
   ✅ 预加载优化
   ✅ 缓存策略
   ✅ 超时处理
   ✅ 性能监控
```

### 使用指南

```
1. 何时使用Suspense
   ✅ 数据获取
   ✅ 代码分割
   ✅ 图片加载
   ✅ 异步组件

2. 设计原则
   ✅ 渐进式增强
   ✅ 优雅降级
   ✅ 用户体验优先
   ✅ 性能与体验平衡

3. 常见模式
   ✅ Suspense + lazy
   ✅ Suspense + Transition
   ✅ Suspense + Error Boundary
   ✅ Suspense + Cache
```

Suspense是React异步渲染的核心特性，掌握它能显著提升应用的加载体验。

