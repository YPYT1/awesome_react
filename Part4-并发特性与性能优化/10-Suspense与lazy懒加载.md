# Suspense与lazy懒加载

## 第一部分：React.lazy基础

### 1.1 什么是React.lazy

React.lazy是React提供的动态导入组件的函数，它允许你将组件的加载延迟到实际渲染时，从而实现代码分割（Code Splitting）。

**基本语法：**

```javascript
import { lazy, Suspense } from 'react';

// 动态导入
const LazyComponent = lazy(() => import('./LazyComponent'));

// 使用
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 1.2 工作原理

```javascript
// React.lazy的简化实现
function lazy(importFunc) {
  let moduleObject = null;
  let loadingPromise = null;
  
  return function LazyComponent(props) {
    if (moduleObject === null) {
      if (loadingPromise === null) {
        loadingPromise = importFunc().then(module => {
          moduleObject = module;
          return module;
        });
      }
      
      // 抛出Promise，触发Suspense
      throw loadingPromise;
    }
    
    // 已加载，渲染组件
    const Component = moduleObject.default;
    return <Component {...props} />;
  };
}

// 执行流程：
// 1. 首次渲染LazyComponent -> 发起import()
// 2. 抛出Promise -> Suspense捕获 -> 显示fallback
// 3. import()完成 -> 重新渲染
// 4. moduleObject有值 -> 渲染实际组件
```

### 1.3 基础示例

```javascript
// 1. 简单懒加载
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <About />
    </Suspense>
  );
}

// 2. 命名导出
// ComponentA.js
export function ComponentA() {
  return <div>Component A</div>;
}

// App.js
const LazyComponentA = lazy(() =>
  import('./ComponentA').then(module => ({
    default: module.ComponentA
  }))
);

// 3. 多个懒加载组件
const Header = lazy(() => import('./Header'));
const Main = lazy(() => import('./Main'));
const Footer = lazy(() => import('./Footer'));

function App() {
  return (
    <div>
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>
      
      <Suspense fallback={<MainSkeleton />}>
        <Main />
      </Suspense>
      
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  );
}

// 4. 共享Suspense边界
function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Header />
      <Main />
      <Footer />
    </Suspense>
  );
  // 任一组件未加载都显示PageLoader
  // 全部加载完才一起显示
}
```

### 1.4 条件懒加载

```javascript
// 根据条件懒加载
function ConditionalLazy({ showHeavy }) {
  const HeavyComponent = lazy(() => import('./HeavyComponent'));
  const LightComponent = lazy(() => import('./LightComponent'));
  
  return (
    <Suspense fallback={<Loading />}>
      {showHeavy ? <HeavyComponent /> : <LightComponent />}
    </Suspense>
  );
}

// 权限控制
function ProtectedRoute({ hasPermission }) {
  if (!hasPermission) {
    return <Redirect to="/login" />;
  }
  
  const AdminPanel = lazy(() => import('./AdminPanel'));
  
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminPanel />
    </Suspense>
  );
}

// 功能开关
function FeatureToggle({ enableNewFeature }) {
  if (enableNewFeature) {
    const NewFeature = lazy(() => import('./NewFeature'));
    return (
      <Suspense fallback={<Loading />}>
        <NewFeature />
      </Suspense>
    );
  }
  
  return <OldFeature />;
}
```

## 第二部分：路由懒加载

### 2.1 React Router懒加载

```javascript
// React Router v6 懒加载
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 嵌套路由懒加载
const UserRoutes = lazy(() => import('./routes/UserRoutes'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/*" element={<UserRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 分层Suspense
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<HomeLoader />}>
              <Home />
            </Suspense>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<DashboardLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2.2 路由预加载

```javascript
// 预加载组件
const routes = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home'))
  },
  {
    path: '/about',
    component: lazy(() => import('./pages/About'))
  },
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard'))
  }
];

// 给lazy组件添加preload方法
function lazyWithPreload(importFunc) {
  const LazyComponent = lazy(importFunc);
  LazyComponent.preload = importFunc;
  return LazyComponent;
}

// 使用
const About = lazyWithPreload(() => import('./pages/About'));

// 链接预加载
function NavLink({ to, children }) {
  const route = routes.find(r => r.path === to);
  
  const handleMouseEnter = () => {
    route?.component.preload?.();
  };
  
  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}

// 智能预加载
function SmartNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // 预加载相关路由
    const relatedRoutes = getRelatedRoutes(location.pathname);
    
    relatedRoutes.forEach(route => {
      route.component.preload?.();
    });
  }, [location]);
  
  return <Navigation />;
}

function getRelatedRoutes(currentPath) {
  // 根据当前路径返回可能访问的路由
  if (currentPath === '/') {
    return routes.filter(r => 
      ['/about', '/contact'].includes(r.path)
    );
  }
  return [];
}
```

### 2.3 路由过渡动画

```javascript
// 路由切换动画
import { motion, AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense 
        key={location.pathname}
        fallback={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RouteLoader />
          </motion.div>
        }
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </motion.div>
      </Suspense>
    </AnimatePresence>
  );
}

// 页面切换进度条
function RouteWithProgress() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location]);
  
  return (
    <>
      {loading && <ProgressBar />}
      
      <Suspense fallback={<RouteLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </>
  );
}
```

## 第三部分：模块懒加载

### 3.1 组件库懒加载

```javascript
// 按需加载UI组件库
const Button = lazy(() => import('antd').then(m => ({ default: m.Button })));
const Modal = lazy(() => import('antd').then(m => ({ default: m.Modal })));
const Table = lazy(() => import('antd').then(m => ({ default: m.Table })));

// 批量懒加载
const components = {
  Button: lazy(() => import('antd/es/button')),
  Modal: lazy(() => import('antd/es/modal')),
  Table: lazy(() => import('antd/es/table'))
};

function App() {
  const { Button, Modal } = components;
  
  return (
    <Suspense fallback={<Loading />}>
      <Button>点击</Button>
      <Modal>内容</Modal>
    </Suspense>
  );
}

// 工具函数懒加载
const heavyUtils = lazy(() => import('./utils/heavyCalculations'));

function Calculator() {
  const [result, setResult] = useState(null);
  
  const calculate = async () => {
    const utils = await import('./utils/heavyCalculations');
    const res = utils.complexCalculation(data);
    setResult(res);
  };
  
  return (
    <div>
      <button onClick={calculate}>计算</button>
      {result && <div>{result}</div>}
    </div>
  );
}
```

### 3.2 动态import()

```javascript
// 动态导入模块
async function loadModule(moduleName) {
  try {
    const module = await import(`./modules/${moduleName}`);
    return module.default;
  } catch (error) {
    console.error('Module load failed:', error);
    return null;
  }
}

// 使用
function DynamicModuleLoader({ moduleName }) {
  const [Module, setModule] = useState(null);
  
  useEffect(() => {
    loadModule(moduleName).then(setModule);
  }, [moduleName]);
  
  if (!Module) return <Loading />;
  
  return <Module />;
}

// 条件导入
async function loadEditor(type) {
  if (type === 'rich') {
    return import('./editors/RichTextEditor');
  } else if (type === 'code') {
    return import('./editors/CodeEditor');
  } else {
    return import('./editors/PlainTextEditor');
  }
}

// 并行导入多个模块
async function loadMultipleModules() {
  const [moduleA, moduleB, moduleC] = await Promise.all([
    import('./ModuleA'),
    import('./ModuleB'),
    import('./ModuleC')
  ]);
  
  return {
    A: moduleA.default,
    B: moduleB.default,
    C: moduleC.default
  };
}
```

### 3.3 图片懒加载

```javascript
// 图片懒加载组件
function LazyImage({ src, alt, placeholder }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} className="lazy-image">
      {loaded ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="placeholder">{placeholder || 'Loading...'}</div>
      )}
    </div>
  );
}

// 使用Suspense的图片
const ImageResource = (src) => {
  let status = 'pending';
  let result;
  
  const suspender = new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      status = 'success';
      result = src;
      resolve(src);
    };
    img.onerror = (err) => {
      status = 'error';
      result = err;
      reject(err);
    };
  });
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    }
  };
};

function SuspenseImage({ src, alt }) {
  const resource = useMemo(() => ImageResource(src), [src]);
  const imageSrc = resource.read();
  
  return <img src={imageSrc} alt={alt} />;
}

// 使用
function Gallery({ images }) {
  return (
    <div className="gallery">
      {images.map(img => (
        <Suspense key={img.id} fallback={<ImageSkeleton />}>
          <SuspenseImage src={img.url} alt={img.title} />
        </Suspense>
      ))}
    </div>
  );
}
```

## 第四部分：性能优化

### 4.1 代码分割策略

```javascript
// 1. 路由级分割
const routes = [
  { path: '/', component: lazy(() => import('./pages/Home')) },
  { path: '/products', component: lazy(() => import('./pages/Products')) },
  { path: '/about', component: lazy(() => import('./pages/About')) }
];

// 2. 功能模块分割
const Editor = lazy(() => import('./features/Editor'));
const Chart = lazy(() => import('./features/Chart'));
const Analytics = lazy(() => import('./features/Analytics'));

// 3. 第三方库分割
const HeavyLibrary = lazy(() => 
  import(/* webpackChunkName: "heavy-lib" */ 'heavy-library')
);

// 4. 条件分割
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const MobileView = lazy(() => import('./MobileView'));
  const DesktopView = lazy(() => import('./DesktopView'));
  
  return (
    <Suspense fallback={<Loading />}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Suspense>
  );
}

// 5. 用户交互触发分割
function ModalTrigger() {
  const [showModal, setShowModal] = useState(false);
  const Modal = lazy(() => import('./components/Modal'));
  
  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        打开弹窗
      </button>
      
      {showModal && (
        <Suspense fallback={<ModalSkeleton />}>
          <Modal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </div>
  );
}
```

### 4.2 预加载策略

```javascript
// 智能预加载
function IntelligentPreload() {
  const [currentRoute, setCurrentRoute] = useState('/');
  
  useEffect(() => {
    // 预加载可能的下一个路由
    const likelyNextRoutes = predictNextRoutes(currentRoute);
    
    likelyNextRoutes.forEach(route => {
      route.component.preload?.();
    });
  }, [currentRoute]);
  
  return <Routes />;
}

// 基于用户行为预加载
function BehaviorBasedPreload() {
  const handleMouseMove = useCallback((e) => {
    const target = e.target.closest('a');
    
    if (target && target.dataset.preload) {
      const component = componentMap[target.dataset.preload];
      component?.preload?.();
    }
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);
}

// 网络空闲时预加载
function IdlePreload({ components }) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => {
        components.forEach(component => {
          component.preload?.();
        });
      });
      
      return () => cancelIdleCallback(handle);
    }
  }, [components]);
}

// 可见性预加载
function VisibilityPreload({ component, threshold = 0.5 }) {
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          component.preload?.();
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [component, threshold]);
  
  return <div ref={ref} />;
}
```

### 4.3 错误处理

```javascript
// 懒加载错误边界
class LazyErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    if (error.name === 'ChunkLoadError') {
      // 处理chunk加载失败
      console.error('Chunk load failed, retrying...');
      window.location.reload();
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="lazy-load-error">
          <h2>加载失败</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LazyComponent />
      </Suspense>
    </LazyErrorBoundary>
  );
}

// 重试机制
function lazyWithRetry(importFunc, retries = 3) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attempt = (retriesLeft) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }
            
            setTimeout(() => {
              attempt(retriesLeft - 1);
            }, 1000 * (retries - retriesLeft));
          });
      };
      
      attempt(retries);
    });
  });
}

// 使用
const RobustComponent = lazyWithRetry(
  () => import('./Component'),
  3
);
```

### 4.4 Bundle分析

```javascript
// Webpack Bundle Analyzer配置
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};

// 动态chunk命名
const UserProfile = lazy(() => 
  import(
    /* webpackChunkName: "user-profile" */
    './pages/UserProfile'
  )
);

const AdminDashboard = lazy(() =>
  import(
    /* webpackChunkName: "admin-dashboard" */
    /* webpackPrefetch: true */
    './pages/AdminDashboard'
  )
);
```

## 第五部分：高级技巧

### 5.1 渐进式hydration

```javascript
// SSR + 懒加载
function ProgressiveHydration({ children }) {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  if (!hydrated) {
    return <div suppressHydrationWarning>{children}</div>;
  }
  
  return children;
}

// 分块hydration
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <StaticContent />
      
      <ProgressiveHydration>
        <Suspense fallback={<Skeleton />}>
          <HeavyComponent />
        </Suspense>
      </ProgressiveHydration>
    </div>
  );
}
```

### 5.2 自定义加载策略

```javascript
// 基于网络状态的加载
function NetworkAwareLazy({ component, fallback }) {
  const connection = navigator.connection;
  const [shouldLoad, setShouldLoad] = useState(true);
  
  useEffect(() => {
    if (connection) {
      // 慢速网络：延迟加载
      if (connection.effectiveType === '2g' || connection.effectiveType === '3g') {
        setShouldLoad(false);
      }
    }
  }, [connection]);
  
  if (!shouldLoad) {
    return fallback;
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <component />
    </Suspense>
  );
}

// 基于设备的加载
function DeviceAwareLazy() {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const MobileComponent = lazy(() => import('./MobileComponent'));
  const DesktopComponent = lazy(() => import('./DesktopComponent'));
  
  return (
    <Suspense fallback={<Loading />}>
      {isMobile ? <MobileComponent /> : <DesktopComponent />}
    </Suspense>
  );
}
```

### 5.3 懒加载工具函数

```javascript
// 通用懒加载工具
export function createLazyComponent(importFunc, options = {}) {
  const {
    fallback = <div>Loading...</div>,
    retry = 3,
    delay = 1000,
    preload = false
  } = options;
  
  const LazyComp = lazy(() => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      
      const attempt = () => {
        importFunc()
          .then(resolve)
          .catch(error => {
            retries++;
            
            if (retries >= retry) {
              reject(error);
            } else {
              setTimeout(attempt, delay * retries);
            }
          });
      };
      
      attempt();
    });
  });
  
  if (preload) {
    LazyComp.preload = importFunc;
  }
  
  return function LazyWrapper(props) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          <LazyComp {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// 使用
const UserProfile = createLazyComponent(
  () => import('./UserProfile'),
  {
    fallback: <ProfileSkeleton />,
    retry: 3,
    preload: true
  }
);
```

## 注意事项

### 1. Suspense必需

```javascript
// ❌ 没有Suspense
function App() {
  const LazyComponent = lazy(() => import('./Component'));
  return <LazyComponent />;  // 错误！
}

// ✅ 有Suspense
function App() {
  const LazyComponent = lazy(() => import('./Component'));
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### 2. 默认导出

```javascript
// ❌ 命名导出不能直接用
const Component = lazy(() => import('./Component'));  // 找不到default

// ✅ 转换为默认导出
const Component = lazy(() =>
  import('./Component').then(module => ({
    default: module.NamedExport
  }))
);
```

### 3. SSR考虑

```javascript
// SSR时lazy不会工作
// 使用loadable-components或Next.js dynamic
import loadable from '@loadable/component';

const LoadableComponent = loadable(() => import('./Component'));

// 或Next.js
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <Loading />,
  ssr: true
});
```

## 常见问题

### Q1: lazy组件可以接收props吗？

**A:** 可以，lazy包裹的组件和普通组件一样使用。

### Q2: 如何预加载lazy组件？

**A:** 给lazy组件添加preload方法，手动调用import()。

### Q3: lazy支持SSR吗？

**A:** React的lazy不支持SSR，需使用loadable-components。

### Q4: chunk加载失败怎么办？

**A:** 使用ErrorBoundary捕获，提供重试机制。

### Q5: 如何控制chunk大小？

**A:** 使用Webpack的splitChunks配置和魔法注释。

### Q6: 多个lazy组件如何优化？

**A:** 合理分组、预加载、共享Suspense边界。

### Q7: lazy和动态import有什么区别？

**A:** lazy返回React组件，import()返回Promise。

### Q8: 如何测试lazy组件？

**A:** 使用waitFor等待组件加载完成。

### Q9: lazy会影响SEO吗？

**A:** 客户端渲染会影响，SSR不会。

### Q10: 如何监控lazy加载性能？

**A:** 使用Performance API和Analytics。

## 总结

### 核心要点

```
1. React.lazy基础
   ✅ 动态导入组件
   ✅ 必须配合Suspense
   ✅ 只支持默认导出
   ✅ 不支持SSR

2. 应用场景
   ✅ 路由级代码分割
   ✅ 功能模块分割
   ✅ 第三方库分割
   ✅ 条件加载

3. 性能优化
   ✅ 智能预加载
   ✅ 并行加载
   ✅ 错误重试
   ✅ Bundle分析
```

### 最佳实践

```
1. 分割策略
   ✅ 路由优先
   ✅ 功能模块次之
   ✅ 避免过度分割
   ✅ 合理chunk大小

2. 用户体验
   ✅ 优质fallback
   ✅ 预加载关键路由
   ✅ 错误处理
   ✅ 加载进度

3. 开发实践
   ✅ 命名chunk
   ✅ 分析bundle
   ✅ 监控性能
   ✅ 持续优化
```

React.lazy和Suspense的结合是实现代码分割的最佳方式，掌握它能显著提升应用性能。

