# Activity API未来特性预览

## 学习目标

通过本章学习，你将掌握：

- Activity API的设计目标和应用场景
- 组件状态保留机制
- 预渲染和性能优化
- 与ViewTransition的协同使用
- 路由和导航优化
- 内存管理策略
- 实战案例和最佳实践
- 未来发展方向

## 第一部分：Activity API概述

### 1.1 设计动机

Activity API旨在解决单页应用中的状态管理和导航性能问题。

传统SPA的问题：
```jsx
// 传统路由：组件完全卸载
function TraditionalRouter() {
  const { pathname } = useLocation();
  
  return (
    <>
      {pathname === '/home' && <HomePage />}
      {pathname === '/profile' && <ProfilePage />}
      {pathname === '/settings' && <SettingsPage />}
    </>
  );
}

// 问题：
// 1. 离开页面时，所有状态丢失
//    - 用户输入的表单数据
//    - 滚动位置
//    - 临时选择
//
// 2. 返回页面时需要重新加载
//    - 重新获取数据
//    - 重新渲染组件
//    - 用户体验差
//
// 3. 导航动画不流畅
//    - 旧页面卸载
//    - 新页面挂载
//    - 闪烁和跳动
```

Activity API的解决方案：
```jsx
import { Activity } from 'react';

function ActivityRouter() {
  const { pathname } = useLocation();
  
  return (
    <>
      {/* 状态保留：hidden时保持挂载 */}
      <Activity mode={pathname === '/home' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      <Activity mode={pathname === '/profile' ? 'visible' : 'hidden'}>
        <ProfilePage />
      </Activity>
      
      <Activity mode={pathname === '/settings' ? 'visible' : 'hidden'}>
        <SettingsPage />
      </Activity>
    </>
  );
}

// 优势：
// ✅ hidden页面保持挂载，状态不丢失
// ✅ 返回时即刻显示，无需重新加载
// ✅ 流畅的过渡动画
// ✅ 更好的用户体验
```

核心概念：
```
Activity组件的两种模式：

1. visible（可见）
   - 组件正常渲染
   - 用户可见可交互
   - 所有Effect运行
   - 优先级：高

2. hidden（隐藏）
   - 组件保持挂载
   - 视觉上不可见
   - Effect暂停（cleanup运行）
   - 优先级：低
   - 状态保留
   - 渲染延迟到空闲时间
```

### 1.2 基本用法

最简单的Activity使用：
```jsx
import { Activity } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  
  return (
    <div>
      <nav>
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('profile')}>Profile</button>
      </nav>
      
      <Activity mode={currentPage === 'home' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      <Activity mode={currentPage === 'profile' ? 'visible' : 'hidden'}>
        <ProfilePage />
      </Activity>
    </div>
  );
}

// HomePage保持挂载，切换到Profile时：
// - HomePage变为hidden（状态保留）
// - ProfilePage变为visible
// - 再切回时HomePage状态完整保留
```

状态保留示例：
```jsx
function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    // 保存滚动位置
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // 恢复滚动位置
    window.scrollTo(0, scrollPosition);
  }, []); // 只在mount时运行
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <SearchResults query={searchQuery} results={results} />
    </div>
  );
}

// 用户场景：
// 1. 在HomePage输入搜索词"React"
// 2. 滚动到某个位置
// 3. 导航到ProfilePage
// 4. 返回HomePage
// 结果：搜索词和滚动位置都保留！
```

### 1.3 API设计

Activity组件的props：
```typescript
interface ActivityProps {
  // 模式：visible或hidden
  mode: 'visible' | 'hidden';
  
  // 子组件
  children: React.ReactNode;
  
  // 可选：自定义过渡
  transition?: {
    enter?: string;
    exit?: string;
  };
  
  // 可选：内存限制
  memoryLimit?: number;
}

// 使用示例
<Activity 
  mode="hidden"
  transition={{ enter: 'fade-in', exit: 'fade-out' }}
  memoryLimit={50 * 1024 * 1024} // 50MB
>
  <Component />
</Activity>
```

## 第二部分：状态保留机制

### 2.1 组件状态保留

Activity保留组件的所有state：
```jsx
function StatefulComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [selected, setSelected] = useState(new Set());
  
  console.log('Component rendering, count:', count);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      
      <input 
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type something..."
      />
      
      <ItemSelector selected={selected} onSelect={setSelected} />
    </div>
  );
}

function App() {
  const [page, setPage] = useState('home');
  
  return (
    <>
      <nav>
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('other')}>Other</button>
      </nav>
      
      <Activity mode={page === 'home' ? 'visible' : 'hidden'}>
        <StatefulComponent />
      </Activity>
      
      <Activity mode={page === 'other' ? 'visible' : 'hidden'}>
        <OtherPage />
      </Activity>
    </>
  );
}

// 测试：
// 1. count增加到10
// 2. 输入一些文字
// 3. 选择一些项目
// 4. 切换到Other页面（StatefulComponent变hidden）
// 5. 再切回Home
// 结果：count=10，文字和选择都保留！
```

### 2.2 Effect行为

Activity切换时Effect的行为：
```jsx
function EffectBehavior() {
  const [mode, setMode] = useState('visible');
  
  return (
    <>
      <button onClick={() => setMode(m => m === 'visible' ? 'hidden' : 'visible')}>
        Toggle Mode
      </button>
      
      <Activity mode={mode}>
        <ComponentWithEffects />
      </Activity>
    </>
  );
}

function ComponentWithEffects() {
  useEffect(() => {
    console.log('Effect: setup');
    
    const timer = setInterval(() => {
      console.log('Timer tick');
    }, 1000);
    
    return () => {
      console.log('Effect: cleanup');
      clearInterval(timer);
    };
  }, []);
  
  // 行为：
  // visible → hidden：
  //   - 输出 "Effect: cleanup"
  //   - 定时器停止
  //
  // hidden → visible：
  //   - 输出 "Effect: setup"
  //   - 定时器重新开始
  //
  // 注意：状态保留，但Effect会cleanup/setup
}
```

选择性Effect暂停：
```jsx
function SelectiveEffects({ isActive }) {
  // 总是运行的Effect
  useEffect(() => {
    console.log('This always runs');
  });
  
  // 只在visible时运行的Effect
  useEffect(() => {
    if (isActive) {
      console.log('This runs only when visible');
      const subscription = subscribeToData();
      
      return () => subscription.unsubscribe();
    }
  }, [isActive]);
  
  return <div>Component</div>;
}

// Activity包装
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <SelectiveEffects isActive={isVisible} />
</Activity>
```

### 2.3 Ref保留

Ref引用在Activity切换时保持：
```jsx
function RefPersistence() {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div>
      <input 
        ref={inputRef}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
      />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('form');
  
  return (
    <>
      <button onClick={() => setPage('form')}>Form</button>
      <button onClick={() => setPage('other')}>Other</button>
      
      <Activity mode={page === 'form' ? 'visible' : 'hidden'}>
        <RefPersistence />
      </Activity>
    </>
  );
}

// 测试：
// 1. 在输入框中输入文字
// 2. 切换到Other页面
// 3. 再切回Form页面
// 4. 点击"Focus Input"
// 结果：输入框仍然存在，ref有效，可以聚焦！
```

## 第三部分：预渲染优化

### 3.1 预渲染概念

Activity可以预先渲染hidden页面：
```jsx
function PreRenderExample() {
  const [currentUrl, setCurrentUrl] = useState('/home');
  
  // 预渲染常见页面
  const commonPages = ['/home', '/profile', '/settings'];
  
  return (
    <>
      {commonPages.map(url => (
        <Activity 
          key={url}
          mode={currentUrl === url ? 'visible' : 'hidden'}
        >
          <PageComponent url={url} />
        </Activity>
      ))}
    </>
  );
}

// 优势：
// 1. 首次导航：页面已渲染，即时显示
// 2. 数据预加载：hidden时可以获取数据
// 3. 动画流畅：新旧页面都存在，过渡自然
```

智能预渲染：
```jsx
function SmartPreRender() {
  const [currentPage, setCurrentPage] = useState('home');
  const [visitHistory, setVisitHistory] = useState(['home']);
  
  // 基于历史记录预测下一页
  const predictedPages = useMemo(() => {
    const predictions = [];
    
    // 规则1：最近访问的页面
    const recent = visitHistory.slice(-3);
    predictions.push(...recent);
    
    // 规则2：常见导航路径
    if (currentPage === 'home') {
      predictions.push('search', 'profile');
    } else if (currentPage === 'search') {
      predictions.push('results', 'filters');
    }
    
    return [...new Set(predictions)];
  }, [currentPage, visitHistory]);
  
  return (
    <>
      {/* 当前页面 */}
      <Activity mode="visible">
        <Page name={currentPage} />
      </Activity>
      
      {/* 预渲染预测的页面 */}
      {predictedPages.map(page => page !== currentPage && (
        <Activity key={page} mode="hidden">
          <Page name={page} />
        </Activity>
      ))}
    </>
  );
}
```

### 3.2 数据预加载

hidden模式下的数据加载：
```jsx
function DataPreloading() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="dashboard">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
        <Tab value="reports">Reports</Tab>
      </Tabs>
      
      {/* Overview：visible */}
      <Activity mode={activeTab === 'overview' ? 'visible' : 'hidden'}>
        <OverviewTab />
      </Activity>
      
      {/* Analytics：提前加载数据 */}
      <Activity mode={activeTab === 'analytics' ? 'visible' : 'hidden'}>
        <AnalyticsTab />
      </Activity>
      
      {/* Reports：延迟加载 */}
      {activeTab === 'reports' && (
        <Activity mode="visible">
          <ReportsTab />
        </Activity>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 即使hidden，也会获取数据
    fetchAnalytics().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);
  
  if (loading) {
    return <div>Loading analytics...</div>;
  }
  
  return <Chart data={data} />;
}

// 用户体验：
// 1. 用户在Overview标签
// 2. AnalyticsTab在后台（hidden）加载数据
// 3. 用户点击Analytics标签
// 4. 数据已准备好，即时显示！
```

Suspense与Activity结合：
```jsx
function SuspensePreloading() {
  const [page, setPage] = useState('home');
  
  return (
    <>
      <Activity mode={page === 'home' ? 'visible' : 'hidden'}>
        <Suspense fallback={<Loading />}>
          <HomeWithData />
        </Suspense>
      </Activity>
      
      <Activity mode={page === 'details' ? 'visible' : 'hidden'}>
        <Suspense fallback={<Loading />}>
          <DetailsWithData />
        </Suspense>
      </Activity>
    </>
  );
}

// hidden模式下的Suspense：
// - 仍然会触发数据获取
// - fallback不会显示（因为hidden）
// - 数据准备好后，组件渲染完成
// - 切换到visible时立即显示
```

### 3.3 渲染优先级

Activity自动管理渲染优先级：
```jsx
function PriorityManagement() {
  const [activeRoute, setActiveRoute] = useState('/');
  
  return (
    <>
      {/* 高优先级：当前可见页面 */}
      <Activity mode={activeRoute === '/' ? 'visible' : 'hidden'}>
        <HomePage priority="high" />
      </Activity>
      
      {/* 中优先级：相邻页面（可能导航到） */}
      <Activity mode={activeRoute === '/search' ? 'visible' : 'hidden'}>
        <SearchPage priority="medium" />
      </Activity>
      
      {/* 低优先级：不太可能访问的页面 */}
      <Activity mode={activeRoute === '/settings' ? 'visible' : 'hidden'}>
        <SettingsPage priority="low" />
      </Activity>
    </>
  );
}

// React调度行为：
// 1. visible Activity：立即渲染（高优先级）
// 2. hidden Activity：空闲时渲染（低优先级）
// 3. 不阻塞用户交互
// 4. 充分利用空闲时间
```

## 第四部分：与ViewTransition集成

### 4.1 基本集成

Activity和ViewTransition配合实现流畅动画：
```jsx
import { Activity, ViewTransition } from 'react';

function AnimatedNavigation() {
  const [page, setPage] = useState('home');
  
  return (
    <ViewTransition>
      <Activity mode={page === 'home' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      <Activity mode={page === 'profile' ? 'visible' : 'hidden'}>
        <ProfilePage />
      </Activity>
    </ViewTransition>
  );
}

// ViewTransition知道Activity的存在：
// - 页面切换时，新旧页面同时存在
// - 可以执行共享元素动画
// - 过渡更流畅自然
```

自定义动画：
```jsx
function CustomAnimations() {
  const { url } = useRouter();
  
  return (
    <ViewTransition>
      <Activity mode={url === '/' ? 'visible' : 'hidden'}>
        <ViewTransition 
          name="home-page"
          enter="slide-from-left"
          exit="slide-to-right"
        >
          <HomePage />
        </ViewTransition>
      </Activity>
      
      <Activity mode={url === '/details' ? 'visible' : 'hidden'}>
        <ViewTransition 
          name="details-page"
          enter="slide-from-right"
          exit="slide-to-left"
        >
          <DetailsPage />
        </ViewTransition>
      </Activity>
    </ViewTransition>
  );
}
```

CSS动画定义：
```css
/* 页面滑动动画 */
::view-transition-old(.slide-to-left) {
  animation: 300ms ease-out both slide-out-left;
}

::view-transition-new(.slide-from-right) {
  animation: 300ms ease-in both slide-in-right;
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### 4.2 共享元素转换

跨页面的元素动画：
```jsx
function SharedElementTransition() {
  const { url, navigate } = useRouter();
  const videoId = url.split('/').pop();
  
  return (
    <ViewTransition>
      <Activity mode={url === '/' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      {videos.map(video => (
        <Activity 
          key={video.id}
          mode={videoId === video.id ? 'visible' : 'hidden'}
        >
          <DetailsPage video={video} />
        </Activity>
      ))}
    </ViewTransition>
  );
}

function HomePage() {
  const videos = useVideos();
  
  return (
    <div className="video-grid">
      {videos.map(video => (
        <VideoThumbnail key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoThumbnail({ video }) {
  const { navigate } = useRouter();
  
  return (
    <ViewTransition name={`video-${video.id}`}>
      <div 
        className="thumbnail"
        onClick={() => navigate(`/video/${video.id}`)}
      >
        <img src={video.thumbnail} alt={video.title} />
        <h3>{video.title}</h3>
      </div>
    </ViewTransition>
  );
}

function DetailsPage({ video }) {
  return (
    <div className="details">
      <ViewTransition name={`video-${video.id}`}>
        <img src={video.thumbnail} alt={video.title} className="hero" />
      </ViewTransition>
      
      <h1>{video.title}</h1>
      <p>{video.description}</p>
    </div>
  );
}

// 效果：
// 点击缩略图 → 图片平滑放大到详情页
// 因为Activity保留了HomePage，动画可以流畅执行
```

### 4.3 转场类型

不同的导航类型使用不同动画：
```jsx
import { addTransitionType } from 'react';

function TypedTransitions() {
  const { navigate } = useRouter();
  
  const navigateForward = (url) => {
    startTransition(() => {
      addTransitionType('nav-forward');
      navigate(url);
    });
  };
  
  const navigateBack = (url) => {
    startTransition(() => {
      addTransitionType('nav-back');
      navigate(url);
    });
  };
  
  const navigatePop = () => {
    startTransition(() => {
      addTransitionType('nav-pop');
      history.back();
    });
  };
  
  return (
    <div>
      <button onClick={() => navigateForward('/next')}>
        Forward
      </button>
      <button onClick={() => navigateBack('/prev')}>
        Back
      </button>
      <button onClick={navigatePop}>
        Pop
      </button>
    </div>
  );
}
```

CSS根据转场类型：
```css
/* 前进：从右滑入 */
::view-transition-old(.nav-forward) {
  animation: 300ms ease-out both slide-to-left, 300ms ease-out both fade-out;
}

::view-transition-new(.nav-forward) {
  animation: 300ms ease-in both slide-from-right, 300ms ease-in both fade-in;
}

/* 后退：从左滑入 */
::view-transition-old(.nav-back) {
  animation: 300ms ease-out both slide-to-right, 300ms ease-out both fade-out;
}

::view-transition-new(.nav-back) {
  animation: 300ms ease-in both slide-from-left, 300ms ease-in both fade-in;
}

/* 弹出：缩放效果 */
::view-transition-old(.nav-pop) {
  animation: 300ms ease-out both scale-down, 300ms ease-out both fade-out;
}

::view-transition-new(.nav-pop) {
  animation: 300ms ease-in both scale-up, 300ms ease-in both fade-in;
}
```

## 第五部分：内存管理

### 5.1 内存策略

Activity的内存管理机制：
```
内存使用策略：
1. visible Activity：正常内存使用
2. hidden Activity：
   - 保留组件树
   - 保留state
   - 保留ref
   - 释放部分资源（如canvas缓存）

内存限制：
- 自动管理hidden Activity数量
- 超出限制时卸载最旧的hidden Activity
- 可配置内存上限
```

配置内存限制：
```jsx
function MemoryConfig() {
  const [pages, setPages] = useState(['home', 'search', 'profile', 'settings']);
  const [currentPage, setCurrentPage] = useState('home');
  const maxHiddenPages = 3; // 最多保留3个hidden页面
  
  // 计算应该保留哪些hidden页面
  const activePage = currentPage;
  const recentPages = pages
    .filter(p => p !== activePage)
    .slice(-maxHiddenPages);
  
  return (
    <>
      {/* 当前页面 */}
      <Activity mode="visible">
        <Page name={activePage} />
      </Activity>
      
      {/* 最近访问的页面（保留） */}
      {recentPages.map(page => (
        <Activity key={page} mode="hidden">
          <Page name={page} />
        </Activity>
      ))}
      
      {/* 其他页面：不渲染（完全卸载） */}
    </>
  );
}
```

### 5.2 资源清理

hidden时清理非必要资源：
```jsx
function ResourceCleanup() {
  const [mode, setMode] = useState('visible');
  const canvasRef = useRef(null);
  const [heavyData, setHeavyData] = useState(null);
  
  useEffect(() => {
    if (mode === 'visible') {
      // visible时加载资源
      loadHeavyData().then(setHeavyData);
      initializeCanvas(canvasRef.current);
    } else {
      // hidden时清理资源
      setHeavyData(null);
      clearCanvas(canvasRef.current);
    }
  }, [mode]);
  
  return (
    <div>
      <canvas ref={canvasRef} />
      {heavyData && <DataDisplay data={heavyData} />}
    </div>
  );
}
```

### 5.3 LRU缓存策略

使用LRU策略管理Activity：
```jsx
function LRUActivityManager() {
  const [accessOrder, setAccessOrder] = useState(['home']);
  const [currentPage, setCurrentPage] = useState('home');
  const maxCachedPages = 5;
  
  const navigateTo = (page) => {
    setAccessOrder(prev => {
      // 移除旧的访问记录
      const filtered = prev.filter(p => p !== page);
      // 添加到最后（最近访问）
      return [...filtered, page].slice(-maxCachedPages);
    });
    setCurrentPage(page);
  };
  
  return (
    <>
      {/* 当前页面 */}
      <Activity mode="visible">
        <Page name={currentPage} />
      </Activity>
      
      {/* LRU缓存的页面 */}
      {accessOrder
        .filter(page => page !== currentPage)
        .map(page => (
          <Activity key={page} mode="hidden">
            <Page name={page} />
          </Activity>
        ))}
    </>
  );
}
```

## 第六部分：实战案例

### 6.1 电商应用

电商网站的导航优化：
```jsx
function ECommerceApp() {
  const { pathname, navigate } = useRouter();
  
  return (
    <ViewTransition>
      {/* 首页：总是预渲染 */}
      <Activity mode={pathname === '/' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      {/* 商品列表：保留状态（筛选、排序、滚动位置） */}
      <Activity mode={pathname === '/products' ? 'visible' : 'hidden'}>
        <ProductListPage />
      </Activity>
      
      {/* 购物车：保留用户选择 */}
      <Activity mode={pathname === '/cart' ? 'visible' : 'hidden'}>
        <CartPage />
      </Activity>
      
      {/* 商品详情：动态预渲染 */}
      {pathname.startsWith('/product/') && (
        <Activity mode="visible">
          <ProductDetailsPage productId={pathname.split('/')[2]} />
        </Activity>
      )}
    </ViewTransition>
  );
}

function ProductListPage() {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'relevance'
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  
  // 保存滚动位置
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollPosition(containerRef.current.scrollTop);
      }
    };
    
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 恢复滚动位置
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollPosition;
    }
  }, []); // 只在mount时运行
  
  return (
    <div ref={containerRef} className="product-list">
      <FilterPanel filters={filters} onChange={setFilters} />
      <ProductGrid filters={filters} />
    </div>
  );
}

// 用户体验：
// 1. 用户筛选商品、滚动列表
// 2. 点击某个商品查看详情
// 3. 点击返回
// 结果：筛选条件和滚动位置完全保留！
```

### 6.2 社交媒体应用

Feed流的状态保留：
```jsx
function SocialMediaApp() {
  const { pathname } = useRouter();
  
  return (
    <ViewTransition>
      {/* 主Feed：保留滚动位置和已加载内容 */}
      <Activity mode={pathname === '/feed' ? 'visible' : 'hidden'}>
        <FeedPage />
      </Activity>
      
      {/* 通知：保留已读/未读状态 */}
      <Activity mode={pathname === '/notifications' ? 'visible' : 'hidden'}>
        <NotificationsPage />
      </Activity>
      
      {/* 个人主页：保留标签状态 */}
      <Activity mode={pathname === '/profile' ? 'visible' : 'hidden'}>
        <ProfilePage />
      </Activity>
      
      {/* 消息：保留对话列表和选中对话 */}
      <Activity mode={pathname === '/messages' ? 'visible' : 'hidden'}>
        <MessagesPage />
      </Activity>
    </ViewTransition>
  );
}

function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const loadMore = async () => {
    const newPosts = await fetchPosts();
    setPosts(prev => [...prev, ...newPosts]);
    setHasMore(newPosts.length > 0);
  };
  
  useInfiniteScroll({
    hasMore,
    onLoadMore: loadMore,
    scrollPosition,
    onScrollChange: setScrollPosition
  });
  
  return (
    <div className="feed">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
      {hasMore && <LoadingSpinner />}
    </div>
  );
}

// 优势：
// - 用户滚动到第100条帖子
// - 切换到通知页面
// - 再回到Feed
// - 仍然在第100条位置，无需重新加载前99条！
```

### 6.3 文档编辑器

保留编辑状态：
```jsx
function DocumentEditor() {
  const { pathname } = useRouter();
  const openDocuments = useOpenDocuments();
  
  return (
    <ViewTransition>
      {/* 文档列表 */}
      <Activity mode={pathname === '/' ? 'visible' : 'hidden'}>
        <DocumentList />
      </Activity>
      
      {/* 打开的文档：每个都保留编辑状态 */}
      {openDocuments.map(doc => (
        <Activity 
          key={doc.id}
          mode={pathname === `/doc/${doc.id}` ? 'visible' : 'hidden'}
        >
          <EditorPage documentId={doc.id} />
        </Activity>
      ))}
    </ViewTransition>
  );
}

function EditorPage({ documentId }) {
  const [content, setContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const editorRef = useRef(null);
  
  // 加载文档
  useEffect(() => {
    loadDocument(documentId).then(doc => {
      setContent(doc.content);
    });
  }, [documentId]);
  
  // 自动保存
  useEffect(() => {
    const timer = setInterval(() => {
      if (content) {
        autoSave(documentId, content);
      }
    }, 30000); // 每30秒
    
    return () => clearInterval(timer);
  }, [documentId, content]);
  
  return (
    <div>
      <Editor
        ref={editorRef}
        content={content}
        onChange={setContent}
        onCursorMove={setCursorPosition}
      />
      
      <StatusBar
        cursorPosition={cursorPosition}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
    </div>
  );
}

// 用户体验：
// - 同时编辑多个文档
// - 在文档间快速切换
// - 每个文档的编辑状态、光标位置、撤销历史都保留
// - 无需担心状态丢失
```

## 第七部分：路由集成

### 7.1 与React Router集成

结合React Router使用Activity：
```jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { Activity, ViewTransition } from 'react';

function App() {
  const location = useLocation();
  
  return (
    <ViewTransition>
      <Activity mode={location.pathname === '/' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      <Activity mode={location.pathname === '/search' ? 'visible' : 'hidden'}>
        <SearchPage />
      </Activity>
      
      <Activity mode={location.pathname.startsWith('/user') ? 'visible' : 'hidden'}>
        <Routes>
          <Route path="/user/:id" element={<UserPage />} />
          <Route path="/user/:id/posts" element={<UserPosts />} />
        </Routes>
      </Activity>
    </ViewTransition>
  );
}
```

嵌套路由：
```jsx
function NestedRoutes() {
  const location = useLocation();
  const isSettingsSection = location.pathname.startsWith('/settings');
  
  return (
    <Activity mode={isSettingsSection ? 'visible' : 'hidden'}>
      <SettingsLayout>
        <Activity mode={location.pathname === '/settings/profile' ? 'visible' : 'hidden'}>
          <ProfileSettings />
        </Activity>
        
        <Activity mode={location.pathname === '/settings/privacy' ? 'visible' : 'hidden'}>
          <PrivacySettings />
        </Activity>
        
        <Activity mode={location.pathname === '/settings/notifications' ? 'visible' : 'hidden'}>
          <NotificationSettings />
        </Activity>
      </SettingsLayout>
    </Activity>
  );
}
```

### 7.2 动态路由

处理动态路由参数：
```jsx
function DynamicRouting() {
  const { pathname } = useRouter();
  const videos = useVideos();
  const currentVideoId = pathname.split('/')[2];
  
  return (
    <ViewTransition>
      {/* 列表页 */}
      <Activity mode={pathname === '/videos' ? 'visible' : 'hidden'}>
        <VideoList videos={videos} />
      </Activity>
      
      {/* 详情页：为每个视频创建Activity */}
      {videos.map(video => (
        <Activity 
          key={video.id}
          mode={currentVideoId === video.id ? 'visible' : 'hidden'}
        >
          <VideoDetails video={video} />
        </Activity>
      ))}
    </ViewTransition>
  );
}

function VideoDetails({ video }) {
  const [comments, setComments] = useState([]);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  
  // 加载评论
  useEffect(() => {
    loadComments(video.id).then(setComments);
  }, [video.id]);
  
  return (
    <div>
      <VideoPlayer 
        video={video}
        initialPosition={playbackPosition}
        onPositionChange={setPlaybackPosition}
      />
      <Comments comments={comments} />
    </div>
  );
}

// 效果：
// - 用户在视频A的第30秒暂停
// - 查看视频B
// - 返回视频A
// - 视频A仍在第30秒位置，评论都在！
```

### 7.3 选项卡导航

标签页的Activity应用：
```jsx
function TabbedInterface() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'analytics', 'reports', 'settings'];
  
  return (
    <div className="tabbed-interface">
      <TabBar 
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
      />
      
      <ViewTransition>
        {tabs.map(tab => (
          <Activity 
            key={tab}
            mode={activeTab === tab ? 'visible' : 'hidden'}
          >
            <TabContent tab={tab} />
          </Activity>
        ))}
      </ViewTransition>
    </div>
  );
}

function TabContent({ tab }) {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  
  // 获取数据
  useEffect(() => {
    fetchTabData(tab, filters).then(setData);
  }, [tab, filters]);
  
  return (
    <div className={`tab-content view-${viewMode}`}>
      <FilterBar filters={filters} onChange={setFilters} />
      <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      <DataDisplay data={data} mode={viewMode} />
    </div>
  );
}

// 用户体验：
// - 在Analytics标签应用复杂筛选
// - 切换到Reports标签
// - 再切回Analytics
// - 筛选条件和视图模式都保留！
```

## 第八部分：性能优化

### 8.1 渲染优化

利用Activity的优先级系统：
```jsx
function OptimizedApp() {
  const [route, setRoute] = useState('/home');
  
  // 预测用户下一步可能访问的页面
  const predictedRoutes = useMemo(() => {
    const predictions = {
      '/home': ['/search', '/profile'],
      '/search': ['/results', '/home'],
      '/profile': ['/settings', '/home']
    };
    return predictions[route] || [];
  }, [route]);
  
  return (
    <ViewTransition>
      {/* 当前页面：高优先级 */}
      <Activity mode="visible">
        <Page route={route} />
      </Activity>
      
      {/* 预测页面：低优先级预渲染 */}
      {predictedRoutes.map(predicted => (
        <Activity key={predicted} mode="hidden">
          <Page route={predicted} />
        </Activity>
      ))}
    </ViewTransition>
  );
}

// 性能优化：
// 1. visible页面：立即渲染（高优先级）
// 2. hidden页面：空闲时渲染（低优先级）
// 3. 不阻塞用户交互
// 4. 充分利用CPU空闲时间
```

### 8.2 数据预取

智能数据预取策略：
```jsx
function DataPrefetching() {
  const [currentPage, setCurrentPage] = useState('home');
  const [prefetchedData, setPrefetchedData] = useState({});
  
  // 预取数据
  useEffect(() => {
    const predictions = {
      'home': ['search', 'profile'],
      'search': ['results'],
      'profile': ['settings']
    };
    
    const toPrefetch = predictions[currentPage] || [];
    
    toPrefetch.forEach(page => {
      if (!prefetchedData[page]) {
        prefetchData(page).then(data => {
          setPrefetchedData(prev => ({
            ...prev,
            [page]: data
          }));
        });
      }
    });
  }, [currentPage]);
  
  return (
    <>
      <Activity mode={currentPage === 'home' ? 'visible' : 'hidden'}>
        <HomePage data={prefetchedData['home']} />
      </Activity>
      
      <Activity mode={currentPage === 'search' ? 'visible' : 'hidden'}>
        <SearchPage data={prefetchedData['search']} />
      </Activity>
    </>
  );
}
```

### 8.3 渐进式增强

逐步启用Activity特性：
```jsx
function ProgressiveEnhancement() {
  const supportsActivity = typeof Activity !== 'undefined';
  const [route, setRoute] = useState('/');
  
  if (!supportsActivity) {
    // 降级方案：传统路由
    return (
      <>
        {route === '/' && <HomePage />}
        {route === '/profile' && <ProfilePage />}
      </>
    );
  }
  
  // 增强方案：Activity路由
  return (
    <ViewTransition>
      <Activity mode={route === '/' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      <Activity mode={route === '/profile' ? 'visible' : 'hidden'}>
        <ProfilePage />
      </Activity>
    </ViewTransition>
  );
}
```

## 第九部分：最佳实践

### 9.1 合理使用Activity

不是所有页面都需要Activity：
```jsx
function SelectiveActivity() {
  const { pathname } = useRouter();
  
  return (
    <ViewTransition>
      {/* 频繁访问的页面：使用Activity */}
      <Activity mode={pathname === '/' ? 'visible' : 'hidden'}>
        <HomePage />
      </Activity>
      
      <Activity mode={pathname === '/search' ? 'visible' : 'hidden'}>
        <SearchPage />
      </Activity>
      
      {/* 偶尔访问的页面：普通渲染 */}
      {pathname === '/about' && <AboutPage />}
      {pathname === '/help' && <HelpPage />}
      
      {/* 一次性页面：不需要Activity */}
      {pathname === '/checkout' && <CheckoutPage />}
    </ViewTransition>
  );
}

// 选择标准：
// ✅ 使用Activity：
// - 用户频繁切换的页面
// - 包含复杂状态的页面
// - 需要保留用户输入的页面
// - 数据加载耗时的页面
//
// ❌ 不使用Activity：
// - 静态信息页面
// - 一次性流程页面（如支付）
// - 简单的展示页面
// - 不需要状态保留的页面
```

### 9.2 内存控制

防止内存泄漏：
```jsx
function MemoryControl() {
  const [visitedPages, setVisitedPages] = useState(['home']);
  const [currentPage, setCurrentPage] = useState('home');
  const MAX_CACHED_PAGES = 5;
  
  const navigateTo = (page) => {
    setVisitedPages(prev => {
      const newHistory = [...prev.filter(p => p !== page), page];
      
      // 限制缓存数量
      if (newHistory.length > MAX_CACHED_PAGES) {
        return newHistory.slice(-MAX_CACHED_PAGES);
      }
      
      return newHistory;
    });
    setCurrentPage(page);
  };
  
  const cleanupOldPages = () => {
    setVisitedPages([currentPage]); // 清理所有hidden页面
  };
  
  return (
    <div>
      <Navigation onNavigate={navigateTo} />
      
      <button onClick={cleanupOldPages}>
        Clear Cache
      </button>
      
      <div>Cached pages: {visitedPages.length - 1}</div>
      
      {visitedPages.map(page => (
        <Activity 
          key={page}
          mode={page === currentPage ? 'visible' : 'hidden'}
        >
          <Page name={page} />
        </Activity>
      ))}
    </div>
  );
}
```

### 9.3 可访问性

确保Activity不影响可访问性：
```jsx
function AccessibleActivity({ mode, children }) {
  return (
    <Activity mode={mode}>
      <div 
        role="region"
        aria-hidden={mode === 'hidden'}
        inert={mode === 'hidden'} // 防止键盘导航到hidden内容
      >
        {children}
      </div>
    </Activity>
  );
}

// 使用
function App() {
  const [page, setPage] = useState('home');
  
  return (
    <>
      <nav aria-label="Main navigation">
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('profile')}>Profile</button>
      </nav>
      
      <AccessibleActivity mode={page === 'home' ? 'visible' : 'hidden'}>
        <main aria-label="Home page">
          <HomePage />
        </main>
      </AccessibleActivity>
      
      <AccessibleActivity mode={page === 'profile' ? 'visible' : 'hidden'}>
        <main aria-label="Profile page">
          <ProfilePage />
        </main>
      </AccessibleActivity>
    </>
  );
}
```

## 第十部分：未来展望

### 10.1 当前状态

Activity API的开发状态：
```
当前状态（2025年初）：
- 实验性API
- 在React Canary版本可用
- API可能会变化
- 不建议生产环境使用

可用性：
import { unstable_Activity as Activity } from 'react';

或使用稳定版（如果可用）：
import { Activity } from 'react';

检测支持：
const hasActivity = typeof Activity !== 'undefined';
```

### 10.2 未来改进方向

预期的API增强：
```typescript
// 未来可能的API扩展
interface FutureActivityProps {
  mode: 'visible' | 'hidden' | 'prerender' | 'destroyed';
  
  // 优先级控制
  priority?: 'high' | 'normal' | 'low' | 'idle';
  
  // 生命周期回调
  onModeChange?: (mode: string) => void;
  onPrerender?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  
  // 内存控制
  memoryBudget?: number;
  persistStrategy?: 'memory' | 'disk' | 'sessionStorage';
  
  // 性能提示
  willNavigateTo?: boolean;
  prefetchData?: boolean;
}
```

可能的新模式：
```jsx
// prerender模式：预渲染但不保留
<Activity mode="prerender">
  <ExpensivePage />
</Activity>

// destroyed模式：卸载但保留skeleton
<Activity mode="destroyed">
  <Page />
</Activity>
```

### 10.3 与其他API集成

未来可能的集成：
```jsx
// 与Server Components集成
async function ServerActivity({ mode }) {
  const data = await fetchData();
  
  return (
    <Activity mode={mode}>
      <ClientComponent data={data} />
    </Activity>
  );
}

// 与Suspense更深度集成
<Activity mode="hidden">
  <Suspense fallback={<Skeleton />}>
    <AsyncContent />
  </Suspense>
</Activity>

// 与并发渲染集成
<Activity mode="hidden" priority="background">
  <HeavyComponent />
</Activity>
```

## 第十一部分：polyfill和降级

### 11.1 Feature检测

检测Activity支持：
```jsx
function FeatureDetection() {
  const [supportsActivity, setSupportsActivity] = useState(false);
  
  useEffect(() => {
    try {
      const { unstable_Activity, Activity: StableActivity } = require('react');
      setSupportsActivity(!!(StableActivity || unstable_Activity));
    } catch {
      setSupportsActivity(false);
    }
  }, []);
  
  return (
    <div>
      Activity API: {supportsActivity ? 'Supported' : 'Not Supported'}
    </div>
  );
}
```

### 11.2 Polyfill实现

简化的polyfill（仅用于理解）：
```jsx
// 注意：这只是概念性实现，不要在生产环境使用
function ActivityPolyfill({ mode, children }) {
  const [cachedContent] = useState(children);
  
  if (mode === 'visible') {
    return <div style={{ display: 'block' }}>{cachedContent}</div>;
  }
  
  // hidden模式：渲染但隐藏
  return (
    <div 
      style={{ 
        display: 'none',
        visibility: 'hidden',
        position: 'absolute',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
      inert
    >
      {cachedContent}
    </div>
  );
}

// 使用polyfill
const Activity = typeof window !== 'undefined' && window.__REACT_ACTIVITY__
  ? window.__REACT_ACTIVITY__
  : ActivityPolyfill;
```

### 11.3 渐进式采用

生产环境的采用策略：
```jsx
function ProgressiveAdoption() {
  const [enableActivity, setEnableActivity] = useState(false);
  
  // Feature flag控制
  useEffect(() => {
    const flag = localStorage.getItem('feature_activity_api');
    setEnableActivity(flag === 'true');
  }, []);
  
  const ActivityOrFragment = enableActivity ? Activity : React.Fragment;
  
  return (
    <ActivityOrFragment mode={enableActivity ? 'visible' : undefined}>
      <Component />
    </ActivityOrFragment>
  );
}
```

## 常见问题

### Q1: Activity何时稳定？

A: 预计在React 19后续版本或React 20中稳定。

当前建议：
```
学习阶段：
- 了解概念和用法
- 在实验项目中尝试
- 关注React官方博客

生产环境：
- 暂时不使用
- 使用传统状态管理方案
- 等待稳定版本
```

### Q2: Activity与普通条件渲染有什么区别？

A: Activity保留hidden组件的状态。

```jsx
// 普通条件渲染：完全卸载
{showA && <ComponentA />}
{showB && <ComponentB />}
// ComponentA卸载时，所有状态丢失

// Activity：保留状态
<Activity mode={showA ? 'visible' : 'hidden'}>
  <ComponentA />
</Activity>
<Activity mode={showB ? 'visible' : 'hidden'}>
  <ComponentB />
</Activity>
// ComponentA hidden时，状态保留
```

### Q3: Activity会影响性能吗？

A: 合理使用不会，过度使用可能会。

性能考虑：
```jsx
// ✅ 好：限制Activity数量
function GoodPractice() {
  const [page, setPage] = useState('home');
  const maxHidden = 3;
  
  return (
    <>
      <Activity mode="visible">
        <CurrentPage />
      </Activity>
      
      {/* 只保留最近3个页面 */}
      {recentPages.slice(0, maxHidden).map(page => (
        <Activity key={page} mode="hidden">
          <Page name={page} />
        </Activity>
      ))}
    </>
  );
}

// ❌ 坏：无限制的Activity
function BadPractice() {
  const [allVisitedPages, setAllVisitedPages] = useState([]);
  
  return (
    <>
      {/* 可能有几十上百个hidden Activity */}
      {allVisitedPages.map(page => (
        <Activity mode="hidden">
          <Page name={page} />
        </Activity>
      ))}
    </>
  );
  
  // 问题：
  // - 内存占用高
  // - 渲染负担重
  // - 可能导致卡顿
}
```

### Q4: Activity内的Effect如何工作？

A: hidden时Effect cleanup，visible时重新setup。

```jsx
function EffectInActivity() {
  const [mode, setMode] = useState('visible');
  
  return (
    <Activity mode={mode}>
      <ComponentWithEffect />
    </Activity>
  );
}

function ComponentWithEffect() {
  useEffect(() => {
    console.log('Setup: subscribe');
    const sub = subscribe();
    
    return () => {
      console.log('Cleanup: unsubscribe');
      sub.unsubscribe();
    };
  }, []);
  
  // 行为：
  // visible → hidden:
  //   输出 "Cleanup: unsubscribe"
  //   订阅被取消
  //
  // hidden → visible:
  //   输出 "Setup: subscribe"
  //   重新订阅
}
```

### Q5: 如何调试Activity？

A: 使用React DevTools和自定义日志。

```jsx
function DebuggableActivity({ mode, name, children }) {
  useEffect(() => {
    console.log(`Activity "${name}" mode changed to: ${mode}`);
  }, [mode, name]);
  
  return (
    <Activity mode={mode}>
      {children}
    </Activity>
  );
}

// 使用
<DebuggableActivity mode="visible" name="HomePage">
  <HomePage />
</DebuggableActivity>

// 控制台输出：
// Activity "HomePage" mode changed to: visible
// Activity "HomePage" mode changed to: hidden
// Activity "HomePage" mode changed to: visible
```

### Q6: Activity能否嵌套使用？

A: 可以，但要注意性能。

```jsx
function NestedActivity() {
  const [outerMode, setOuterMode] = useState('visible');
  const [innerMode, setInnerMode] = useState('visible');
  
  return (
    <Activity mode={outerMode}>
      <div>
        <h1>Outer Activity</h1>
        
        <Activity mode={innerMode}>
          <div>
            <h2>Inner Activity</h2>
          </div>
        </Activity>
      </div>
    </Activity>
  );
}

// 模式组合：
// outer=visible, inner=visible: 完全可见
// outer=visible, inner=hidden: 外层可见，内层隐藏
// outer=hidden, inner=visible: 整体隐藏（外层决定）
// outer=hidden, inner=hidden: 整体隐藏
```

### Q7: 如何测试使用Activity的组件？

A: 使用Testing Library测试。

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('Activity preserves state', async () => {
  const user = userEvent.setup();
  
  function TestComponent() {
    const [page, setPage] = useState('a');
    const [countA, setCountA] = useState(0);
    
    return (
      <>
        <button onClick={() => setPage('a')}>Page A</button>
        <button onClick={() => setPage('b')}>Page B</button>
        
        <Activity mode={page === 'a' ? 'visible' : 'hidden'}>
          <div>
            Count: {countA}
            <button onClick={() => setCountA(c => c + 1)}>
              Increment
            </button>
          </div>
        </Activity>
        
        <Activity mode={page === 'b' ? 'visible' : 'hidden'}>
          <div>Page B</div>
        </Activity>
      </>
    );
  }
  
  render(<TestComponent />);
  
  // 增加计数
  await user.click(screen.getByText('Increment'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
  
  // 切换到Page B
  await user.click(screen.getByText('Page B'));
  expect(screen.queryByText('Count: 1')).not.toBeVisible();
  
  // 切回Page A
  await user.click(screen.getByText('Page A'));
  
  // 状态应该保留
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Q8: Activity与React Router v6+如何集成？

A: 需要自定义路由wrapper。

```jsx
import { useLocation } from 'react-router-dom';

function ActivityRoutes({ routes }) {
  const location = useLocation();
  
  return (
    <ViewTransition>
      {routes.map(route => (
        <Activity 
          key={route.path}
          mode={location.pathname === route.path ? 'visible' : 'hidden'}
        >
          {route.element}
        </Activity>
      ))}
    </ViewTransition>
  );
}

// 使用
function App() {
  const routes = [
    { path: '/', element: <HomePage /> },
    { path: '/search', element: <SearchPage /> },
    { path: '/profile', element: <ProfilePage /> }
  ];
  
  return (
    <BrowserRouter>
      <ActivityRoutes routes={routes} />
    </BrowserRouter>
  );
}
```

### Q9: hidden模式下的性能影响？

A: minimal，React优化了hidden渲染。

性能对比：
```
测试：10个Activity，1个visible，9个hidden

内存使用：
- 无Activity：50MB
- 有Activity：65MB (+30%)

渲染性能：
- visible切换：16ms（一帧内）
- 首次hidden渲染：在空闲时执行，不阻塞
- 二次hidden渲染：跳过（已缓存）

结论：
- 内存增加可接受
- 性能影响很小
- 用户体验提升显著
```

### Q10: 如何与状态管理库集成？

A: 正常使用，Activity不影响状态管理。

```jsx
import { useStore } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  theme: 'light',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme })
}));

function StoreIntegration() {
  const { user, theme } = useAppStore();
  const [page, setPage] = useState('home');
  
  return (
    <div className={`app theme-${theme}`}>
      <Activity mode={page === 'home' ? 'visible' : 'hidden'}>
        <HomePage user={user} />
      </Activity>
      
      <Activity mode={page === 'profile' ? 'visible' : 'hidden'}>
        <ProfilePage user={user} />
      </Activity>
    </div>
  );
}

// 全局状态在所有Activity间共享
// 每个Activity有自己的本地状态
```

## 总结

Activity API的核心价值：

设计目标：
```
1. 状态保留
✅ 组件hidden时保持挂载
✅ 状态不丢失
✅ 用户体验提升

2. 性能优化
✅ 预渲染常见页面
✅ 数据预加载
✅ 减少重复渲染

3. 流畅动画
✅ 新旧页面同时存在
✅ 共享元素转换
✅ 自然的过渡效果

4. 灵活性
✅ 可选择性使用
✅ 内存可控
✅ 优先级管理
```

适用场景：
```
推荐使用：
1. 多标签/多页面应用
2. 需要保留用户输入
3. 频繁切换的视图
4. 复杂的表单流程
5. 数据加载耗时的页面

不推荐使用：
1. 简单的条件渲染
2. 一次性流程
3. 内存受限环境
4. 静态内容页面
```

当前状态和建议：
```
现状：
- 实验性API
- 持续开发中
- API可能变化

建议：
1. 学习和了解概念
2. 关注官方更新
3. 实验项目中尝试
4. 生产环境等待稳定版
5. 准备迁移方案

未来：
- 预计成为React核心特性
- 与ViewTransition深度集成
- 更多优化和改进
- 成为现代SPA的标准方案
```

Activity API代表了React对单页应用体验的持续优化，值得密切关注和学习！

