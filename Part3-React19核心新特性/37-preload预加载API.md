# preload预加载API

## 学习目标

通过本章学习，你将掌握：

- preload API的作用
- 资源预加载原理
- 各种资源类型的预加载
- 优先级控制
- 实际应用场景
- 性能优化策略
- 最佳实践
- 与传统方法对比

## 第一部分：资源加载问题

### 1.1 传统加载流程

```
用户访问页面
    ↓
解析HTML
    ↓
发现<link>或<script>标签
    ↓
开始下载资源  ← 延迟！
    ↓
资源下载完成
    ↓
页面渲染完成
```

### 1.2 预加载优化

```
页面开始加载
    ↓
立即预加载关键资源  ← 提前开始！
    ↓        ↓
解析HTML    资源下载（并行）
    ↓        ↓
需要资源    资源已就绪！
    ↓
页面快速渲染
```

### 1.3 传统方案的问题

```jsx
// ❌ 方案1：HTML中的link标签
<head>
  <link rel="preload" href="/font.woff2" as="font">
</head>

// 问题：
// - 静态定义，无法动态调整
// - 不能基于条件加载
// - 与组件逻辑分离

// ❌ 方案2：JavaScript动态创建
useEffect(() => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/data.json';
  link.as = 'fetch';
  document.head.appendChild(link);
  
  return () => document.head.removeChild(link);
}, []);

// 问题：
// - 代码繁琐
// - 时机可能太晚
// - 需要手动清理
// - SSR不友好
```

## 第二部分：React 19的preload

### 2.1 基础用法

```jsx
import { preload } from 'react-dom';

function ProductPage({ productId }) {
  // 预加载产品数据
  preload(`/api/products/${productId}`, { as: 'fetch' });
  
  // 预加载产品图片
  preload(`/images/products/${productId}.jpg`, { as: 'image' });
  
  return <ProductDetails id={productId} />;
}

// 优势：
// ✅ 简洁的API
// ✅ 与组件逻辑集成
// ✅ 自动管理资源
// ✅ 支持SSR
```

### 2.2 资源类型

```jsx
import { preload } from 'react-dom';

function AllResourceTypes() {
  // 1. JavaScript脚本
  preload('/vendor/library.js', { as: 'script' });
  
  // 2. CSS样式表
  preload('/styles/theme.css', { as: 'style' });
  
  // 3. 字体文件
  preload('/fonts/custom.woff2', { 
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous'
  });
  
  // 4. 图片
  preload('/images/hero.jpg', { as: 'image' });
  
  // 5. 视频
  preload('/videos/intro.mp4', { as: 'video' });
  
  // 6. 音频
  preload('/audio/notification.mp3', { as: 'audio' });
  
  // 7. 数据（Fetch API）
  preload('/api/data', { as: 'fetch' });
  
  // 8. Worker脚本
  preload('/workers/processor.js', { as: 'worker' });
  
  // 9. 文档
  preload('/document.html', { as: 'document' });
  
  return <App />;
}
```

### 2.3 条件预加载

```jsx
import { preload } from 'react-dom';

function ConditionalPreload({ userType, features, device }) {
  // 根据用户类型
  if (userType === 'premium') {
    preload('/api/premium-data', { as: 'fetch' });
    preload('/images/premium-badge.svg', { as: 'image' });
  }
  
  // 根据功能开关
  if (features.analytics) {
    preload('/vendor/analytics.js', { as: 'script' });
  }
  
  if (features.charts) {
    preload('/vendor/chart.js', { as: 'script' });
  }
  
  // 根据设备类型
  if (device === 'desktop') {
    preload('/images/hero-desktop.jpg', { as: 'image' });
  } else {
    preload('/images/hero-mobile.jpg', { as: 'image' });
  }
  
  return <Dashboard />;
}
```

## 第三部分：高级特性

### 3.1 优先级控制

```jsx
import { preload } from 'react-dom';

function PriorityPreload() {
  // 高优先级：关键资源
  preload('/critical.css', { 
    as: 'style',
    fetchPriority: 'high'  // 高优先级
  });
  
  preload('/hero-image.jpg', { 
    as: 'image',
    fetchPriority: 'high'
  });
  
  // 默认优先级：重要资源
  preload('/main.js', { 
    as: 'script'
    // fetchPriority默认为'auto'
  });
  
  preload('/data.json', { 
    as: 'fetch'
  });
  
  // 低优先级：非关键资源
  preload('/analytics.js', { 
    as: 'script',
    fetchPriority: 'low'  // 低优先级
  });
  
  preload('/optional-image.jpg', { 
    as: 'image',
    fetchPriority: 'low'
  });
  
  return <App />;
}
```

### 3.2 跨域资源

```jsx
import { preload } from 'react-dom';

function CrossOriginPreload() {
  // 跨域字体（需要CORS）
  preload('https://fonts.gstatic.com/custom.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous'  // 必需
  });
  
  // 跨域图片
  preload('https://cdn.example.com/image.jpg', {
    as: 'image',
    crossOrigin: 'anonymous'
  });
  
  // 跨域API（带凭证）
  preload('https://api.example.com/data', {
    as: 'fetch',
    crossOrigin: 'use-credentials'
  });
  
  // 跨域脚本
  preload('https://cdn.jsdelivr.net/npm/library@1.0.0', {
    as: 'script',
    crossOrigin: 'anonymous'
  });
  
  return <Content />;
}
```

### 3.3 完整性校验

```jsx
import { preload } from 'react-dom';

function IntegrityCheck() {
  // 带完整性校验的CDN资源
  preload('https://cdn.example.com/library.js', {
    as: 'script',
    integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...',
    crossOrigin: 'anonymous'
  });
  
  // 多种哈希算法
  preload('https://cdn.example.com/style.css', {
    as: 'style',
    integrity: 'sha256-abc123... sha384-def456...',
    crossOrigin: 'anonymous'
  });
  
  return <App />;
}
```

### 3.4 媒体查询

```jsx
import { preload } from 'react-dom';

function ResponsivePreload() {
  // 移动端图片
  preload('/images/hero-mobile.jpg', {
    as: 'image',
    media: '(max-width: 768px)'
  });
  
  // 桌面端图片
  preload('/images/hero-desktop.jpg', {
    as: 'image',
    media: '(min-width: 769px)'
  });
  
  // 高分屏图片
  preload('/images/hero@2x.jpg', {
    as: 'image',
    media: '(min-resolution: 2dppx)'
  });
  
  // 打印样式
  preload('/styles/print.css', {
    as: 'style',
    media: 'print'
  });
  
  // 深色模式
  preload('/styles/dark-theme.css', {
    as: 'style',
    media: '(prefers-color-scheme: dark)'
  });
  
  return <Hero />;
}
```

## 第四部分：实际应用

### 4.1 路由预加载

```jsx
import { preload } from 'react-dom';
import { useRouter } from 'next/router';

function Navigation() {
  const router = useRouter();
  
  const handleMouseEnter = (path) => {
    // 鼠标悬停时预加载路由资源
    
    if (path === '/products') {
      preload('/api/products', { as: 'fetch' });
      preload('/images/products-banner.jpg', { as: 'image' });
      router.prefetch(path); // 预加载路由组件
    }
    
    if (path === '/dashboard') {
      preload('/api/dashboard', { as: 'fetch' });
      preload('/vendor/charts.js', { as: 'script' });
      router.prefetch(path);
    }
  };
  
  return (
    <nav>
      <Link 
        href="/products"
        onMouseEnter={() => handleMouseEnter('/products')}
      >
        Products
      </Link>
      
      <Link 
        href="/dashboard"
        onMouseEnter={() => handleMouseEnter('/dashboard')}
      >
        Dashboard
      </Link>
    </nav>
  );
}
```

### 4.2 数据预加载

```jsx
import { preload } from 'react-dom';

function DataPreloading({ category, page }) {
  // 预加载当前页数据
  preload(`/api/items?category=${category}&page=${page}`, { 
    as: 'fetch' 
  });
  
  // 预加载下一页数据（用户可能浏览）
  preload(`/api/items?category=${category}&page=${page + 1}`, { 
    as: 'fetch',
    fetchPriority: 'low'
  });
  
  // 预加载相关数据
  useEffect(() => {
    // 稍后预加载相关类别
    setTimeout(() => {
      preload(`/api/related?category=${category}`, { 
        as: 'fetch',
        fetchPriority: 'low'
      });
    }, 1000);
  }, [category]);
  
  const items = useItems(category, page);
  
  // 预加载item图片
  items.forEach((item, index) => {
    if (index < 5) { // 只预加载前5个
      preload(item.thumbnail, { as: 'image' });
    }
  });
  
  return <ItemList items={items} />;
}
```

### 4.3 多步骤流程

```jsx
import { preload } from 'react-dom';

function MultiStepForm() {
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    // 根据当前步骤预加载下一步资源
    
    if (step === 1) {
      // 步骤1：预加载步骤2需要的资源
      preload('/api/step2-options', { as: 'fetch' });
      preload('/images/step2-help.jpg', { as: 'image' });
      
    } else if (step === 2) {
      // 步骤2：预加载步骤3需要的资源
      preload('/api/step3-validation', { as: 'fetch' });
      preload('/vendor/payment.js', { as: 'script' });
      
    } else if (step === 3) {
      // 步骤3：预加载确认页资源
      preload('/api/submit-form', { as: 'fetch' });
      preload('/images/success-icon.svg', { as: 'image' });
    }
  }, [step]);
  
  return (
    <div className="form">
      {step === 1 && <Step1 onNext={() => setStep(2)} />}
      {step === 2 && <Step2 onNext={() => setStep(3)} />}
      {step === 3 && <Step3 onNext={() => setStep(4)} />}
      {step === 4 && <Confirmation />}
    </div>
  );
}
```

### 4.4 智能预加载

```jsx
import { preload } from 'react-dom';

function SmartPreload() {
  const [network, setNetwork] = useState('4g');
  const [dataSaver, setDataSaver] = useState(false);
  
  useEffect(() => {
    // 检测网络状况
    if (navigator.connection) {
      setNetwork(navigator.connection.effectiveType);
      setDataSaver(navigator.connection.saveData);
      
      // 监听变化
      navigator.connection.addEventListener('change', () => {
        setNetwork(navigator.connection.effectiveType);
        setDataSaver(navigator.connection.saveData);
      });
    }
  }, []);
  
  useEffect(() => {
    // 根据网络状况智能预加载
    
    if (dataSaver) {
      // 省流量模式：不预加载
      console.log('Data saver enabled, skipping preload');
      return;
    }
    
    if (network === '4g' || network === 'wifi') {
      // 快速网络：预加载所有资源
      preload('/images/high-res.jpg', { as: 'image' });
      preload('/videos/intro.mp4', { as: 'video' });
      preload('/api/full-data', { as: 'fetch' });
      
    } else if (network === '3g') {
      // 3G网络：只预加载关键资源
      preload('/images/low-res.jpg', { as: 'image' });
      preload('/api/essential-data', { as: 'fetch' });
      
    } else {
      // 慢速网络：不预加载
      console.log('Slow network, skipping preload');
    }
  }, [network, dataSaver]);
  
  return <Content />;
}
```

### 4.5 可见性预加载

```jsx
import { preload } from 'react-dom';
import { useInView } from 'react-intersection-observer';

function LazyPreload({ imageUrl, dataUrl }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  useEffect(() => {
    if (inView) {
      // 当组件即将进入视口时预加载
      preload(imageUrl, { as: 'image' });
      preload(dataUrl, { as: 'fetch' });
    }
  }, [inView, imageUrl, dataUrl]);
  
  return (
    <div ref={ref}>
      {inView && <LazyContent />}
    </div>
  );
}
```

## 第五部分：性能优化

### 5.1 避免过度预加载

```jsx
import { preload } from 'react-dom';

function OptimizedPreload() {
  const [items] = useState(/* 100个项目 */);
  
  // ❌ 错误：预加载太多
  items.forEach(item => {
    preload(item.image, { as: 'image' });
  });
  // 浪费带宽，可能降低性能
  
  // ✅ 正确：只预加载可见/即将可见的
  const visibleItems = items.slice(0, 10);
  visibleItems.forEach(item => {
    preload(item.image, { as: 'image' });
  });
  
  return <List items={items} />;
}

// 实际案例：无限滚动优化
function InfiniteScroll() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    // 预加载当前页
    preload(`/api/items?page=${page}`, { 
      as: 'fetch',
      fetchPriority: 'high'
    });
    
    // 预加载下一页（低优先级）
    preload(`/api/items?page=${page + 1}`, { 
      as: 'fetch',
      fetchPriority: 'low'
    });
  }, [page]);
  
  useEffect(() => {
    // 只预加载首屏可见的图片
    items.slice(0, 5).forEach(item => {
      preload(item.thumbnail, { as: 'image' });
    });
  }, [items]);
  
  return <List items={items} onLoadMore={() => setPage(p => p + 1)} />;
}
```

### 5.2 延迟预加载

```jsx
import { preload } from 'react-dom';

function DeferredPreload() {
  useEffect(() => {
    // 关键资源：立即预加载
    preload('/critical.js', { 
      as: 'script',
      fetchPriority: 'high'
    });
    
    // 重要资源：稍后预加载
    setTimeout(() => {
      preload('/important.css', { as: 'style' });
    }, 100);
    
    // 非关键资源：空闲时预加载
    requestIdleCallback(() => {
      preload('/optional.js', { 
        as: 'script',
        fetchPriority: 'low'
      });
    });
  }, []);
  
  return <App />;
}

// 实际案例：分层预加载
function LayeredPreload() {
  const [loadPhase, setLoadPhase] = useState(0);
  
  useEffect(() => {
    // 第一阶段：关键资源
    const phase1 = () => {
      preload('/fonts/primary.woff2', { 
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        fetchPriority: 'high'
      });
      preload('/api/initial-data', { 
        as: 'fetch',
        fetchPriority: 'high'
      });
      
      setTimeout(() => setLoadPhase(1), 500);
    };
    
    // 第二阶段：重要资源
    const phase2 = () => {
      preload('/images/hero.jpg', { as: 'image' });
      preload('/api/secondary-data', { as: 'fetch' });
      
      setTimeout(() => setLoadPhase(2), 1000);
    };
    
    // 第三阶段：可选资源
    const phase3 = () => {
      requestIdleCallback(() => {
        preload('/vendor/analytics.js', { 
          as: 'script',
          fetchPriority: 'low'
        });
        preload('/images/background.jpg', { 
          as: 'image',
          fetchPriority: 'low'
        });
      });
    };
    
    if (loadPhase === 0) phase1();
    else if (loadPhase === 1) phase2();
    else if (loadPhase === 2) phase3();
  }, [loadPhase]);
  
  return <App />;
}
```

### 5.3 预加载策略

```jsx
import { preload } from 'react-dom';

function PreloadStrategy() {
  // 第1层：关键资源（立即）
  preload('/critical.css', { 
    as: 'style',
    fetchPriority: 'high'
  });
  preload('/hero-image.jpg', { 
    as: 'image',
    fetchPriority: 'high'
  });
  
  // 第2层：重要资源（立即）
  preload('/main.js', { as: 'script' });
  preload('/data.json', { as: 'fetch' });
  
  useEffect(() => {
    // 第3层：次要资源（延迟）
    setTimeout(() => {
      preload('/secondary.js', { as: 'script' });
    }, 1000);
    
    // 第4层：可选资源（空闲）
    requestIdleCallback(() => {
      preload('/optional.css', { 
        as: 'style',
        fetchPriority: 'low'
      });
    });
  }, []);
  
  return <App />;
}

// 实际案例：电商首页优化
function EcommercePage() {
  const [category, setCategory] = useState('featured');
  
  useEffect(() => {
    // 关键资源
    preload('/api/featured-products', { 
      as: 'fetch',
      fetchPriority: 'high'
    });
    preload('/images/banner.jpg', { 
      as: 'image',
      fetchPriority: 'high'
    });
    
    // 预加载常用分类
    const commonCategories = ['electronics', 'fashion', 'home'];
    setTimeout(() => {
      commonCategories.forEach(cat => {
        preload(`/api/products?category=${cat}`, { 
          as: 'fetch',
          fetchPriority: 'low'
        });
      });
    }, 2000);
    
    // 预加载用户可能感兴趣的
    requestIdleCallback(() => {
      preload('/api/recommendations', { 
        as: 'fetch',
        fetchPriority: 'low'
      });
    });
  }, []);
  
  return <ProductGrid category={category} />;
}
```

### 5.4 缓存协调

```jsx
import { preload } from 'react-dom';

function CacheCoordination() {
  const [userPreferences] = useLocalStorage('preferences', {});
  
  useEffect(() => {
    // 预加载与缓存策略结合
    
    // 检查缓存是否过期
    const cacheExpiry = localStorage.getItem('data-cache-expiry');
    const isCacheValid = cacheExpiry && Date.now() < parseInt(cacheExpiry);
    
    if (!isCacheValid) {
      // 缓存过期，重新预加载
      preload('/api/fresh-data', { 
        as: 'fetch',
        cache: 'reload'  // 绕过缓存
      });
    } else {
      // 缓存有效，使用缓存
      preload('/api/fresh-data', { 
        as: 'fetch',
        cache: 'force-cache'
      });
    }
    
    // 根据用户偏好预加载
    if (userPreferences.theme === 'dark') {
      preload('/styles/dark-theme.css', { as: 'style' });
    }
    
    if (userPreferences.language === 'zh') {
      preload('/locales/zh.json', { as: 'fetch' });
    }
  }, [userPreferences]);
  
  return <App />;
}
```

### 5.5 性能监控

```jsx
import { preload } from 'react-dom';

function PerformanceMonitoring() {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    // 监控预加载性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'link' && entry.name.includes('preload')) {
          setMetrics(prev => ({
            ...prev,
            [entry.name]: {
              duration: entry.duration,
              size: entry.transferSize,
              cached: entry.transferSize === 0
            }
          }));
        }
      }
    });
    
    observer.observe({ 
      entryTypes: ['resource', 'navigation'] 
    });
    
    // 预加载资源
    preload('/api/data', { as: 'fetch' });
    preload('/images/hero.jpg', { as: 'image' });
    
    return () => observer.disconnect();
  }, []);
  
  // 根据性能指标调整策略
  useEffect(() => {
    const avgDuration = Object.values(metrics)
      .reduce((sum, m) => sum + m.duration, 0) / Object.keys(metrics).length;
    
    if (avgDuration > 1000) {
      console.warn('Preload performance degraded, reducing preload count');
      // 调整预加载策略
    }
  }, [metrics]);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <PreloadMetrics metrics={metrics} />
      )}
    </div>
  );
}

function PreloadMetrics({ metrics }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'white', padding: '10px' }}>
      <h4>Preload Metrics</h4>
      {Object.entries(metrics).map(([url, data]) => (
        <div key={url}>
          <small>{url.split('/').pop()}</small>: 
          {data.duration.toFixed(2)}ms, 
          {(data.size / 1024).toFixed(2)}KB
          {data.cached && ' (cached)'}
        </div>
      ))}
    </div>
  );
}
```

## 第六部分：高级应用场景

### 6.1 组件级预加载

```jsx
import { preload } from 'react-dom';
import { lazy, Suspense } from 'react';

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function ComponentPreload() {
  const [showHeavy, setShowHeavy] = useState(false);
  
  const handleMouseEnter = () => {
    // 鼠标悬停时预加载组件依赖
    preload('/api/heavy-component-data', { as: 'fetch' });
    preload('/images/heavy-component-bg.jpg', { as: 'image' });
    preload('/vendor/heavy-lib.js', { as: 'script' });
  };
  
  return (
    <div>
      <button 
        onClick={() => setShowHeavy(true)}
        onMouseEnter={handleMouseEnter}
      >
        Load Heavy Component
      </button>
      
      {showHeavy && (
        <Suspense fallback={<Loading />}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

### 6.2 A/B测试预加载

```jsx
import { preload } from 'react-dom';

function ABTestPreload() {
  const [experiment] = useABTest('homepage-redesign');
  
  useEffect(() => {
    if (experiment.variant === 'A') {
      // 变体A资源
      preload('/api/variant-a-data', { as: 'fetch' });
      preload('/styles/variant-a.css', { as: 'style' });
      preload('/images/hero-a.jpg', { as: 'image' });
      
    } else if (experiment.variant === 'B') {
      // 变体B资源
      preload('/api/variant-b-data', { as: 'fetch' });
      preload('/styles/variant-b.css', { as: 'style' });
      preload('/images/hero-b.jpg', { as: 'image' });
    }
  }, [experiment.variant]);
  
  return experiment.variant === 'A' ? <VariantA /> : <VariantB />;
}
```

### 6.3 用户行为预测

```jsx
import { preload } from 'react-dom';

function PredictivePreload() {
  const [userBehavior, setUserBehavior] = useState({
    scrollSpeed: 0,
    clickPattern: []
  });
  
  useEffect(() => {
    // 跟踪用户行为
    let scrollTimeout;
    let startTime = Date.now();
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setUserBehavior(prev => ({
          ...prev,
          scrollSpeed: window.scrollY / ((Date.now() - startTime) / 1000)
        }));
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // 快速滚动：可能快速浏览
    if (userBehavior.scrollSpeed > 1000) {
      preload('/api/quick-summary', { 
        as: 'fetch',
        fetchPriority: 'high'
      });
    }
  }, [userBehavior]);
  
  return <Content />;
}
```

## 第七部分：与其他优化技术结合

### 7.1 与代码分割结合

```jsx
import { preload } from 'react-dom';
import { lazy, Suspense } from 'react';

// 代码分割的路由
const routes = {
  Home: lazy(() => import('./pages/Home')),
  Products: lazy(() => import('./pages/Products')),
  Dashboard: lazy(() => import('./pages/Dashboard'))
};

function OptimizedRouter() {
  const [currentRoute, setCurrentRoute] = useState('Home');
  
  const navigateTo = (route) => {
    // 预加载目标路由资源
    if (route === 'Products') {
      preload('/api/products', { as: 'fetch' });
      preload('/images/products-banner.jpg', { as: 'image' });
    } else if (route === 'Dashboard') {
      preload('/api/dashboard-data', { as: 'fetch' });
      preload('/vendor/chart-lib.js', { as: 'script' });
    }
    
    setCurrentRoute(route);
  };
  
  // 预加载相邻路由
  useEffect(() => {
    if (currentRoute === 'Home') {
      // Home页最可能跳转到Products
      setTimeout(() => {
        preload('/api/products', { 
          as: 'fetch',
          fetchPriority: 'low'
        });
      }, 2000);
    }
  }, [currentRoute]);
  
  const CurrentPage = routes[currentRoute];
  
  return (
    <div>
      <nav>
        <button onClick={() => navigateTo('Home')}>Home</button>
        <button onClick={() => navigateTo('Products')}>Products</button>
        <button onClick={() => navigateTo('Dashboard')}>Dashboard</button>
      </nav>
      
      <Suspense fallback={<Loading />}>
        <CurrentPage />
      </Suspense>
    </div>
  );
}
```

### 7.2 与Service Worker结合

```jsx
import { preload } from 'react-dom';

function ServiceWorkerPreload() {
  const [swReady, setSwReady] = useState(false);
  
  useEffect(() => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => setSwReady(true));
    }
  }, []);
  
  useEffect(() => {
    if (swReady) {
      // Service Worker就绪后预加载关键资源
      
      // 这些资源会被Service Worker缓存
      preload('/api/offline-data', { as: 'fetch' });
      preload('/images/app-shell.jpg', { as: 'image' });
      preload('/styles/critical.css', { as: 'style' });
      
      // 通知Service Worker预缓存
      navigator.serviceWorker.controller?.postMessage({
        type: 'PRECACHE_URLS',
        urls: [
          '/api/offline-data',
          '/images/app-shell.jpg',
          '/styles/critical.css'
        ]
      });
    }
  }, [swReady]);
  
  return <App />;
}
```

// sw.js
```javascript
self.addEventListener('message', (event) => {
  if (event.data.type === 'PRECACHE_URLS') {
    // 预缓存指定的URL
    caches.open('v1').then((cache) => {
      cache.addAll(event.data.urls);
    });
  }
});
```

### 7.3 与HTTP/2推送结合

```jsx
import { preload } from 'react-dom';

function HTTP2PushPreload() {
  useEffect(() => {
    // 检查是否支持HTTP/2
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // 检查是否是HTTP/2 Push
          if (entry.nextHopProtocol === 'h2' && entry.transferSize === 0) {
            console.log('Resource pushed via HTTP/2:', entry.name);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
    
    // 对于不支持HTTP/2 Push的浏览器，使用preload
    preload('/critical.css', { 
      as: 'style',
      fetchPriority: 'high'
    });
    preload('/critical.js', { 
      as: 'script',
      fetchPriority: 'high'
    });
  }, []);
  
  return <App />;
}
```

### 7.4 与Resource Hints结合

```jsx
import { preload } from 'react-dom';
import { useEffect } from 'react';

function ResourceHintsCombination() {
  useEffect(() => {
    // DNS预解析（最早）
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = 'https://api.example.com';
    document.head.appendChild(dnsPrefetch);
    
    // 预连接（较早）
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://cdn.example.com';
    document.head.appendChild(preconnect);
    
    // 预加载（当前页面需要）
    setTimeout(() => {
      preload('https://api.example.com/data', { 
        as: 'fetch',
        crossOrigin: 'anonymous'
      });
      preload('https://cdn.example.com/image.jpg', { 
        as: 'image',
        crossOrigin: 'anonymous'
      });
    }, 100);
    
    // 预取（未来可能需要）
    setTimeout(() => {
      const prefetch = document.createElement('link');
      prefetch.rel = 'prefetch';
      prefetch.href = '/next-page.html';
      document.head.appendChild(prefetch);
    }, 2000);
  }, []);
  
  return <App />;
}
```

## 第八部分：调试和测试

### 8.1 Chrome DevTools调试

```jsx
import { preload } from 'react-dom';

function DebugPreload() {
  useEffect(() => {
    // 启用性能标记
    performance.mark('preload-start');
    
    preload('/api/data', { as: 'fetch' });
    preload('/images/hero.jpg', { as: 'image' });
    
    performance.mark('preload-end');
    performance.measure('preload-duration', 'preload-start', 'preload-end');
    
    // 查看性能指标
    const measures = performance.getEntriesByType('measure');
    console.table(measures);
    
    // 查看资源加载
    const resources = performance.getEntriesByType('resource');
    const preloadedResources = resources.filter(r => 
      r.initiatorType === 'link' || r.name.includes('preload')
    );
    console.table(preloadedResources);
  }, []);
  
  return <App />;
}
```

### 8.2 性能追踪

```jsx
import { preload } from 'react-dom';

function PreloadWithTracking() {
  useEffect(() => {
    // 监听资源加载
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'link') {
          console.log('Preloaded:', {
            url: entry.name,
            duration: entry.duration,
            size: entry.transferSize
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    preload('/api/data', { as: 'fetch' });
    preload('/images/hero.jpg', { as: 'image' });
    
    return () => observer.disconnect();
  }, []);
  
  return <App />;
}
```

## 注意事项

### 1. 不要预加载所有资源

```jsx
// ❌ 过度预加载
function Bad() {
  images.forEach(img => preload(img, { as: 'image' }));
  // 可能浪费带宽，降低性能
}

// ✅ 只预加载必要的
function Good() {
  preload('/hero-image.jpg', { as: 'image' });
  // 只预加载首屏可见的
}
```

### 2. 注意跨域配置

```jsx
// ❌ 缺少crossOrigin
preload('https://cdn.example.com/font.woff2', {
  as: 'font',
  type: 'font/woff2'
  // 缺少crossOrigin可能导致CORS错误
});

// ✅ 正确配置
preload('https://cdn.example.com/font.woff2', {
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous'
});
```

### 3. 合理使用优先级

```jsx
// ✅ 合理分配优先级
preload('/critical.css', { 
  as: 'style',
  fetchPriority: 'high'    // 关键CSS
});

preload('/analytics.js', { 
  as: 'script',
  fetchPriority: 'low'     // 分析脚本
});
```

### 4. 避免重复预加载

```jsx
// ❌ 重复预加载
function Bad() {
  preload('/data.json', { as: 'fetch' });
  preload('/data.json', { as: 'fetch' }); // 重复！
}

// ✅ 使用缓存避免重复
const preloadCache = new Set();

function preloadOnce(url, options) {
  if (!preloadCache.has(url)) {
    preloadCache.add(url);
    preload(url, options);
  }
}
```

### 5. 考虑移动设备

```jsx
// ✅ 根据设备调整策略
function MobileAware() {
  const isMobile = /Mobile|Android|iOS/.test(navigator.userAgent);
  
  if (isMobile) {
    // 移动设备：只预加载关键资源
    preload('/api/essential', { as: 'fetch' });
  } else {
    // 桌面设备：可以预加载更多
    preload('/api/essential', { as: 'fetch' });
    preload('/api/secondary', { as: 'fetch' });
    preload('/images/high-res.jpg', { as: 'image' });
  }
}
```

### 6. 监控带宽使用

```jsx
// ✅ 监控预加载的带宽影响
function BandwidthMonitor() {
  const [totalSize, setTotalSize] = useState(0);
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      let size = 0;
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'link') {
          size += entry.transferSize;
        }
      }
      setTotalSize(prev => prev + size);
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    // 预警机制
    if (totalSize > 5 * 1024 * 1024) { // 5MB
      console.warn('Preload bandwidth usage exceeds 5MB');
    }
  }, [totalSize]);
}
```

### 7. SSR考虑

```jsx
// ✅ SSR友好的预加载
function SSRPreload() {
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      preload('/api/client-data', { as: 'fetch' });
    }
  }, []);
  
  // 或者在组件顶层（SSR和客户端都会执行）
  if (typeof window !== 'undefined') {
    preload('/api/client-data', { as: 'fetch' });
  }
  
  return <App />;
}
```

## 常见问题

### Q1: preload和prefetch有什么区别？

**A:** 
- **preload**: 用于当前页面需要的资源，浏览器会以高优先级立即下载
- **prefetch**: 用于未来页面可能需要的资源，浏览器会在空闲时以低优先级下载
- **使用场景**: preload用于首屏关键资源，prefetch用于路由预加载

```jsx
// 当前页面需要（preload）
preload('/critical-data.json', { as: 'fetch' });

// 下一页可能需要（prefetch）
<link rel="prefetch" href="/next-page.html" />
```

### Q2: preload会阻塞渲染吗？

**A:** 不会。preload是异步的，不会阻塞页面渲染：
- 资源下载在后台进行
- 页面继续正常渲染
- 资源就绪后可立即使用
- 不影响关键渲染路径

但要注意：过多的高优先级preload可能竞争带宽，间接影响其他资源加载。

### Q3: 如何验证preload是否生效？

**A:** 有多种方式验证：

1. **Chrome DevTools Network面板**
   - Initiator列显示为"preload"
   - Priority列显示资源优先级
   - Timing标签显示下载时间

2. **Performance API**
```jsx
const resources = performance.getEntriesByType('resource');
const preloaded = resources.filter(r => 
  r.initiatorType === 'link' && r.name.includes('your-resource')
);
console.log(preloaded);
```

3. **检查DOM**
```jsx
const preloadLinks = document.querySelectorAll('link[rel="preload"]');
console.log(preloadLinks);
```

### Q4: 预加载会增加流量吗？

**A:** 是的，预加载会增加数据传输：
- 预加载的资源会立即下载
- 如果用户没有使用，则浪费带宽
- 移动网络用户尤其敏感

**最佳实践**:
```jsx
// 检测网络状况
if (navigator.connection?.effectiveType === '4g') {
  preload('/large-resource', { as: 'image' });
}

// 检测省流量模式
if (!navigator.connection?.saveData) {
  preload('/optional-resource', { as: 'fetch' });
}
```

### Q5: preload支持哪些资源类型？

**A:** 支持多种资源类型：
- **script**: JavaScript文件
- **style**: CSS样式表
- **font**: 字体文件（需要crossOrigin）
- **image**: 图片
- **video/audio**: 媒体文件
- **fetch**: API数据
- **document**: HTML文档
- **worker**: Web Worker脚本

每种类型都需要正确的`as`参数。

### Q6: 为什么字体preload需要crossOrigin？

**A:** 浏览器安全策略要求：
- 字体文件使用CORS模式加载
- 即使是同源字体也需要`crossOrigin="anonymous"`
- 否则会导致字体加载两次

```jsx
// ✅ 正确
preload('/fonts/custom.woff2', {
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous'
});

// ❌ 错误（会重复加载）
preload('/fonts/custom.woff2', {
  as: 'font',
  type: 'font/woff2'
});
```

### Q7: preload在SSR中如何工作？

**A:** React 19的preload在SSR中自动处理：
- 服务端渲染时生成`<link rel="preload">`标签
- 浏览器接收HTML后立即开始下载
- 客户端hydration时复用预加载的资源

```jsx
// 服务端和客户端都会执行
function App() {
  preload('/api/data', { as: 'fetch' });
  return <Content />;
}
```

### Q8: preload可以取消吗？

**A:** 一旦调用preload，资源下载通常无法取消：
- 浏览器已经开始下载
- 没有官方API取消preload

**变通方案**:
- 使用条件判断，避免不必要的preload
- 延迟preload调用
- 使用AbortController控制fetch（对于as: 'fetch'）

```jsx
const controller = new AbortController();

// 注意：这不是标准preload用法
fetch('/api/data', { signal: controller.signal });

// 取消
controller.abort();
```

### Q9: preload和动态import有什么关系？

**A:** 可以结合使用：

```jsx
// 预加载模块
const preloadComponent = () => {
  // 预加载模块依赖
  preload('/api/component-data', { as: 'fetch' });
  preload('/images/component-bg.jpg', { as: 'image' });
  
  // 动态导入组件
  return import('./HeavyComponent');
};

// 鼠标悬停时预加载
<button onMouseEnter={preloadComponent}>
  Load Component
</button>
```

### Q10: 如何处理preload失败？

**A:** preload本身不提供错误回调，需要手动检测：

```jsx
function PreloadWithErrorHandling() {
  useEffect(() => {
    preload('/api/data', { as: 'fetch' });
    
    // 监听加载失败
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('/api/data')) {
          if (entry.transferSize === 0 && entry.duration > 0) {
            console.error('Preload failed:', entry.name);
            // 使用备用方案
            preload('/api/backup-data', { as: 'fetch' });
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }, []);
}
```

### Q11: preload对SEO有影响吗？

**A:** 有积极影响：
- 提升页面加载速度
- 改善Core Web Vitals指标
- 提高LCP（Largest Contentful Paint）
- 搜索引擎认为加载快的页面更优质

```jsx
// 优化LCP
function SEOOptimized() {
  // 预加载首屏大图
  preload('/hero-image.jpg', {
    as: 'image',
    fetchPriority: 'high'
  });
  
  // 预加载关键CSS
  preload('/critical.css', {
    as: 'style',
    fetchPriority: 'high'
  });
}
```

### Q12: 多个preload的执行顺序是什么？

**A:** 由`fetchPriority`和浏览器策略决定：

```jsx
// 高优先级最先执行
preload('/critical.js', { 
  as: 'script',
  fetchPriority: 'high'
});

// 默认优先级
preload('/normal.js', { 
  as: 'script'
});

// 低优先级最后执行
preload('/optional.js', { 
  as: 'script',
  fetchPriority: 'low'
});
```

实际执行顺序还受：
- 浏览器并发连接数限制
- 网络带宽
- 资源大小
- HTTP/2多路复用

### Q13: preload会缓存资源吗？

**A:** 是的，遵循HTTP缓存策略：
- 资源下载后存入浏览器缓存
- 后续使用直接从缓存读取
- 缓存时间由服务器Cache-Control头决定

```jsx
// 强制从缓存加载
preload('/api/data', {
  as: 'fetch',
  cache: 'force-cache'
});

// 绕过缓存
preload('/api/fresh-data', {
  as: 'fetch',
  cache: 'reload'
});
```

### Q14: 如何在Next.js中使用preload？

**A:** Next.js与React 19 preload完美集成：

```jsx
// pages/_app.js
import { preload } from 'react-dom';

function MyApp({ Component, pageProps }) {
  // 预加载全局资源
  preload('/fonts/main.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous'
  });
  
  return <Component {...pageProps} />;
}

// pages/index.js
export default function Home() {
  // 预加载页面特定资源
  preload('/api/homepage-data', { as: 'fetch' });
  
  return <div>Home Page</div>;
}
```

### Q15: 预加载对移动设备电池有影响吗？

**A:** 有一定影响，需要权衡：
- 更多网络活动消耗电池
- 但提升体验，减少等待时间
- 建议：移动设备只预加载关键资源

```jsx
function BatteryAwarePreload() {
  const [battery, setBattery] = useState(null);
  
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(b => setBattery(b));
    }
  }, []);
  
  useEffect(() => {
    if (battery) {
      // 电量充足且未充电：预加载更多
      if (battery.level > 0.5 && !battery.charging) {
        preload('/api/secondary-data', { as: 'fetch' });
      }
      
      // 电量低：只预加载关键资源
      else if (battery.level < 0.2) {
        preload('/api/critical-only', { as: 'fetch' });
      }
    }
  }, [battery]);
}
```

## 总结

### preload的核心优势

1. **性能提升**
   - 减少资源加载延迟
   - 提前准备关键资源
   - 改善首屏加载时间
   - 提升Core Web Vitals

2. **开发体验**
   - 简洁的API调用
   - 与React组件紧密集成
   - 类型安全（TypeScript）
   - 自动管理资源生命周期

3. **灵活控制**
   - 条件预加载
   - 优先级管理
   - 跨域资源支持
   - 媒体查询适配

4. **生产就绪**
   - SSR/SSG支持
   - 自动去重
   - 浏览器原生优化
   - 向后兼容

### 适用场景

1. **关键资源预加载**
   - 首屏图片
   - 关键CSS
   - 关键JavaScript
   - Web字体

2. **用户交互预判**
   - 路由预加载
   - 鼠标悬停预加载
   - 滚动到视口前预加载
   - 表单步骤预加载

3. **数据预取**
   - API数据预加载
   - 下一页数据
   - 搜索结果
   - 用户个性化内容

4. **多媒体优化**
   - 视频封面
   - 音频文件
   - 大图优化
   - 响应式图片

### 最佳实践总结

1. **资源选择**
   - 只预加载真正需要的资源
   - 优先预加载首屏资源
   - 考虑资源大小和数量
   - 避免预加载过时资源

2. **优先级管理**
   - 关键资源：high
   - 重要资源：auto（默认）
   - 可选资源：low
   - 分层预加载策略

3. **网络适配**
   - 检测网络类型
   - 尊重省流量模式
   - 监控带宽使用
   - 移动端优化

4. **性能监控**
   - 使用Performance API
   - 追踪预加载效果
   - A/B测试验证
   - 持续优化调整

5. **错误处理**
   - 预加载失败降级
   - 备用资源方案
   - 超时处理
   - 用户体验保障

### 性能提升预期

合理使用preload可以带来：

```
首屏加载时间: ↓ 20-40%
LCP指标: ↓ 30-50%
用户感知延迟: ↓ 40-60%
页面跳出率: ↓ 15-25%
用户满意度: ↑ 25-35%
```

### 注意避免的陷阱

1. **过度预加载**
   - 浪费带宽
   - 竞争资源
   - 拖慢首屏

2. **错误配置**
   - 缺少crossOrigin
   - 错误的as类型
   - 优先级设置不当

3. **忽略用户环境**
   - 移动网络
   - 省流量模式
   - 低端设备

4. **缺乏监控**
   - 不知道效果
   - 无法优化
   - 资源浪费

### 未来展望

React 19的preload API为前端性能优化开启了新篇章：

- 更简洁的资源管理
- 更好的SSR集成
- 更精细的控制能力
- 更智能的优化策略

配合React Compiler和其他React 19新特性，可以构建性能极致的现代Web应用。

合理使用preload，能显著提升应用性能和用户体验！
