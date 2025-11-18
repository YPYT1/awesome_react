# preinit预初始化API

## 学习目标

通过本章学习，你将掌握：

- preinit API的作用
- 与preload的区别
- 脚本和样式的预初始化
- 执行时机控制
- 实际应用场景
- 性能优化策略
- 最佳实践
- 常见问题解决

## 第一部分：理解preinit

### 1.1 preload vs preinit

```jsx
import { preload, preinit } from 'react-dom';

// preload：只下载，不执行
preload('/analytics.js', { as: 'script' });
// → 下载文件
// → 存入缓存
// → 等待后续<script>标签
// → 然后执行

// preinit：下载并执行
preinit('/analytics.js', { as: 'script' });
// → 下载文件
// → 自动添加<script>标签
// → 立即执行

// 对于样式表：
preload('/theme.css', { as: 'style' });
// → 只下载

preinit('/theme.css', { as: 'style' });
// → 下载并应用到页面
```

### 1.2 使用场景对比

```jsx
// 场景1：只需下载（图片、字体、数据）
preload('/image.jpg', { as: 'image' });
preload('/font.woff2', { as: 'font' });
preload('/data.json', { as: 'fetch' });

// 场景2：需要执行（脚本、样式）
preinit('/app.js', { as: 'script' });
preinit('/styles.css', { as: 'style' });
```

### 1.3 工作原理

```jsx
// preinit内部流程

// 步骤1：创建资源标签
function preinit(href, options) {
  if (options.as === 'script') {
    const script = document.createElement('script');
    script.src = href;
    script.async = true;
    
    // 步骤2：添加到DOM
    document.head.appendChild(script);
    
    // 步骤3：浏览器下载并执行
  } else if (options.as === 'style') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    
    document.head.appendChild(link);
  }
}
```

## 第二部分：基础用法

### 2.1 脚本预初始化

```jsx
import { preinit } from 'react-dom';

function ScriptPreinit() {
  // 预初始化第三方库
  preinit('https://cdn.example.com/library.js', { 
    as: 'script' 
  });
  
  // 预初始化多个脚本
  preinit('/vendor/react-dom.js', { as: 'script' });
  preinit('/vendor/react-router.js', { as: 'script' });
  preinit('/app/main.js', { as: 'script' });
  
  return <App />;
}
```

### 2.2 样式预初始化

```jsx
import { preinit } from 'react-dom';

function StylePreinit() {
  // 预初始化CSS
  preinit('/styles/theme.css', { as: 'style' });
  
  // 预初始化多个样式表
  preinit('/styles/reset.css', { as: 'style' });
  preinit('/styles/components.css', { as: 'style' });
  preinit('/styles/utilities.css', { as: 'style' });
  
  return <App />;
}
```

### 2.3 优先级控制

```jsx
import { preinit } from 'react-dom';

function PriorityControl() {
  // 高优先级：核心库
  preinit('/vendor/react.js', { 
    as: 'script',
    precedence: 'high',
    fetchPriority: 'high'
  });
  
  // 中等优先级：应用代码
  preinit('/app/main.js', { 
    as: 'script',
    precedence: 'medium'
  });
  
  // 低优先级：分析工具
  preinit('/analytics/tracker.js', { 
    as: 'script',
    precedence: 'low',
    fetchPriority: 'low'
  });
  
  return <App />;
}
```

## 第三部分：高级特性

### 3.1 跨域资源

```jsx
import { preinit } from 'react-dom';

function CrossOriginPreinit() {
  // 跨域脚本
  preinit('https://cdn.example.com/sdk.js', {
    as: 'script',
    crossOrigin: 'anonymous'
  });
  
  // 跨域样式
  preinit('https://fonts.googleapis.com/css2?family=Roboto', {
    as: 'style',
    crossOrigin: 'anonymous'
  });
  
  return <Content />;
}
```

### 3.2 完整性检查

```jsx
import { preinit } from 'react-dom';

function IntegrityCheck() {
  // 带完整性验证
  preinit('https://cdn.example.com/library.js', {
    as: 'script',
    integrity: 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux...',
    crossOrigin: 'anonymous'
  });
  
  return <App />;
}
```

### 3.3 Nonce支持

```jsx
import { preinit } from 'react-dom';

function NonceSupport({ nonce }) {
  // CSP nonce
  preinit('/app.js', {
    as: 'script',
    nonce: nonce
  });
  
  preinit('/styles.css', {
    as: 'style',
    nonce: nonce
  });
  
  return <App />;
}
```

### 3.4 条件初始化

```jsx
import { preinit } from 'react-dom';

function ConditionalPreinit({ features, userType }) {
  // 根据功能开关
  if (features.analytics) {
    preinit('/analytics.js', { as: 'script' });
  }
  
  if (features.liveChat) {
    preinit('/chat-widget.js', { as: 'script' });
  }
  
  // 根据用户类型
  if (userType === 'premium') {
    preinit('/premium-features.js', { as: 'script' });
    preinit('/premium-styles.css', { as: 'style' });
  }
  
  return <Dashboard />;
}
```

## 第四部分：实际应用

### 4.1 第三方库初始化

```jsx
import { preinit } from 'react-dom';
import { useEffect, useState } from 'react';

function ThirdPartyInit() {
  const [libraryReady, setLibraryReady] = useState(false);
  
  // 预初始化第三方库
  preinit('https://cdn.jsdelivr.net/npm/chart.js', { 
    as: 'script' 
  });
  
  useEffect(() => {
    // 检查库是否加载
    const checkLibrary = setInterval(() => {
      if (window.Chart) {
        setLibraryReady(true);
        clearInterval(checkLibrary);
      }
    }, 100);
    
    return () => clearInterval(checkLibrary);
  }, []);
  
  if (!libraryReady) {
    return <div>加载图表库...</div>;
  }
  
  return <ChartComponent />;
}
```

### 4.2 动态主题

```jsx
import { preinit } from 'react-dom';
import { useEffect } from 'react';

function DynamicTheme({ theme }) {
  useEffect(() => {
    // 动态加载主题样式
    if (theme === 'dark') {
      preinit('/themes/dark.css', { 
        as: 'style',
        precedence: 'high'
      });
    } else if (theme === 'light') {
      preinit('/themes/light.css', { 
        as: 'style',
        precedence: 'high'
      });
    }
  }, [theme]);
  
  return <App />;
}
```

### 4.3 路由代码分割

```jsx
import { preinit } from 'react-dom';
import { useRouter } from 'next/router';

function RoutePreinit() {
  const router = useRouter();
  
  const handleLinkHover = (route) => {
    // 鼠标悬停时预初始化路由资源
    switch (route) {
      case '/dashboard':
        preinit('/chunks/dashboard.js', { as: 'script' });
        preinit('/chunks/dashboard.css', { as: 'style' });
        break;
        
      case '/profile':
        preinit('/chunks/profile.js', { as: 'script' });
        preinit('/chunks/profile.css', { as: 'style' });
        break;
        
      case '/settings':
        preinit('/chunks/settings.js', { as: 'script' });
        preinit('/chunks/settings.css', { as: 'style' });
        break;
    }
  };
  
  return (
    <nav>
      <Link 
        href="/dashboard"
        onMouseEnter={() => handleLinkHover('/dashboard')}
      >
        Dashboard
      </Link>
      
      <Link 
        href="/profile"
        onMouseEnter={() => handleLinkHover('/profile')}
      >
        Profile
      </Link>
    </nav>
  );
}
```

### 4.4 渐进式功能加载

```jsx
import { preinit } from 'react-dom';
import { useEffect } from 'react';

function ProgressiveFeatures() {
  useEffect(() => {
    // 页面加载后渐进式初始化功能
    
    // 立即：核心功能
    preinit('/core-features.js', { 
      as: 'script',
      precedence: 'high'
    });
    
    // 1秒后：次要功能
    setTimeout(() => {
      preinit('/secondary-features.js', { as: 'script' });
    }, 1000);
    
    // 3秒后：增强功能
    setTimeout(() => {
      preinit('/enhanced-features.js', { as: 'script' });
    }, 3000);
    
    // 空闲时：非必需功能
    requestIdleCallback(() => {
      preinit('/optional-features.js', { 
        as: 'script',
        precedence: 'low'
      });
    });
  }, []);
  
  return <App />;
}
```

## 第五部分：性能优化

### 5.1 智能初始化

```jsx
import { preinit } from 'react-dom';

function SmartPreinit() {
  const connection = navigator.connection;
  
  // 根据网络状况决定
  if (connection && connection.saveData) {
    // 省流量模式：不预初始化
    return <BasicApp />;
  }
  
  const effectiveType = connection?.effectiveType;
  
  if (effectiveType === '4g') {
    // 4G：预初始化所有资源
    preinit('/full-features.js', { as: 'script' });
    preinit('/animations.js', { as: 'script' });
    preinit('/high-res-images.css', { as: 'style' });
  } else if (effectiveType === '3g') {
    // 3G：只预初始化核心
    preinit('/core-features.js', { as: 'script' });
  } else {
    // 慢速网络：不预初始化
    return <LightweightApp />;
  }
  
  return <App />;
}

// 扩展案例：设备性能检测
function DeviceAwarePreinit() {
  useEffect(() => {
    // 检测设备性能
    const memory = navigator.deviceMemory; // GB
    const cpuCores = navigator.hardwareConcurrency;
    
    if (memory >= 8 && cpuCores >= 4) {
      // 高性能设备：预初始化所有功能
      preinit('/heavy-animations.js', { as: 'script' });
      preinit('/webgl-features.js', { as: 'script' });
      preinit('/advanced-effects.css', { as: 'style' });
    } else if (memory >= 4) {
      // 中等性能：预初始化基础功能
      preinit('/standard-features.js', { as: 'script' });
      preinit('/basic-effects.css', { as: 'style' });
    } else {
      // 低性能：轻量版本
      preinit('/lite-version.js', { as: 'script' });
    }
  }, []);
  
  return <App />;
}
```

### 5.2 按需初始化

```jsx
import { preinit } from 'react-dom';

function LazyPreinit() {
  const [section, setSection] = useState('home');
  
  useEffect(() => {
    // 只初始化当前section需要的资源
    switch (section) {
      case 'charts':
        preinit('/vendor/chart.js', { as: 'script' });
        break;
        
      case 'maps':
        preinit('/vendor/mapbox.js', { as: 'script' });
        preinit('/vendor/mapbox.css', { as: 'style' });
        break;
        
      case 'editor':
        preinit('/vendor/monaco-editor.js', { as: 'script' });
        break;
    }
  }, [section]);
  
  return (
    <div>
      <SectionNav onChange={setSection} />
      {section === 'charts' && <ChartsSection />}
      {section === 'maps' && <MapsSection />}
      {section === 'editor' && <EditorSection />}
    </div>
  );
}

// 扩展案例：基于可见性的初始化
function VisibilityBasedPreinit() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  useEffect(() => {
    if (inView) {
      // 组件即将可见时初始化
      preinit('/interactive-widgets.js', { as: 'script' });
      preinit('/widget-styles.css', { as: 'style' });
    }
  }, [inView]);
  
  return (
    <div ref={ref}>
      <HeavyComponent />
    </div>
  );
}
```

### 5.3 优先级分级

```jsx
import { preinit } from 'react-dom';

function PrioritizedPreinit() {
  // 第1级：立即初始化
  preinit('/critical.js', { 
    as: 'script',
    precedence: 'critical',
    fetchPriority: 'high'
  });
  
  // 第2级：高优先级
  setTimeout(() => {
    preinit('/important.js', { 
      as: 'script',
      precedence: 'high'
    });
  }, 0);
  
  // 第3级：正常优先级
  setTimeout(() => {
    preinit('/normal.js', { as: 'script' });
  }, 1000);
  
  // 第4级：低优先级
  requestIdleCallback(() => {
    preinit('/low-priority.js', { 
      as: 'script',
      precedence: 'low',
      fetchPriority: 'low'
    });
  });
  
  return <App />;
}

// 扩展案例：瀑布式加载
function WaterfallPreinit() {
  const [loadStage, setLoadStage] = useState(0);
  
  useEffect(() => {
    if (loadStage === 0) {
      // 阶段0：核心资源
      preinit('/core-framework.js', { 
        as: 'script',
        fetchPriority: 'high'
      });
      
      // 等待核心加载完成
      const checkCore = setInterval(() => {
        if (window.coreFramework) {
          clearInterval(checkCore);
          setLoadStage(1);
        }
      }, 100);
      
      return () => clearInterval(checkCore);
    }
    
    if (loadStage === 1) {
      // 阶段1：应用层
      preinit('/app-core.js', { as: 'script' });
      preinit('/app-styles.css', { as: 'style' });
      
      setTimeout(() => setLoadStage(2), 1000);
    }
    
    if (loadStage === 2) {
      // 阶段2：增强功能
      preinit('/enhancements.js', { 
        as: 'script',
        fetchPriority: 'low'
      });
    }
  }, [loadStage]);
  
  return <App loadStage={loadStage} />;
}
```

### 5.4 缓存策略

```jsx
import { preinit } from 'react-dom';

function CachedPreinit() {
  useEffect(() => {
    // 检查浏览器缓存
    const checkCache = async () => {
      if ('caches' in window) {
        const cache = await caches.open('script-cache');
        const cachedScripts = await cache.keys();
        
        // 如果未缓存，则预初始化
        const scriptUrl = '/important-library.js';
        const isCached = cachedScripts.some(
          req => req.url.includes(scriptUrl)
        );
        
        if (!isCached) {
          preinit(scriptUrl, { as: 'script' });
        }
      }
    };
    
    checkCache();
  }, []);
  
  return <App />;
}

// 版本化资源管理
function VersionedPreinit() {
  const APP_VERSION = '1.2.3';
  
  useEffect(() => {
    // 检查版本
    const storedVersion = localStorage.getItem('app-version');
    
    if (storedVersion !== APP_VERSION) {
      // 版本更新，重新初始化所有资源
      preinit(`/app.js?v=${APP_VERSION}`, { as: 'script' });
      preinit(`/app.css?v=${APP_VERSION}`, { as: 'style' });
      
      localStorage.setItem('app-version', APP_VERSION);
    }
  }, []);
  
  return <App />;
}
```

### 5.5 并发控制

```jsx
import { preinit } from 'react-dom';

function ConcurrentPreinit() {
  useEffect(() => {
    const scripts = [
      '/lib1.js',
      '/lib2.js',
      '/lib3.js',
      '/lib4.js',
      '/lib5.js'
    ];
    
    // 控制并发数量（每次最多3个）
    const maxConcurrent = 3;
    let currentIndex = 0;
    let activeCount = 0;
    
    const initNext = () => {
      if (currentIndex >= scripts.length || activeCount >= maxConcurrent) {
        return;
      }
      
      const scriptUrl = scripts[currentIndex++];
      activeCount++;
      
      preinit(scriptUrl, { as: 'script' });
      
      // 模拟加载完成（实际需要更可靠的检测）
      setTimeout(() => {
        activeCount--;
        initNext();
      }, 1000);
      
      initNext(); // 立即尝试加载下一个
    };
    
    // 开始加载
    initNext();
  }, []);
  
  return <App />;
}
```

## 第六部分：高级应用场景

### 6.1 A/B测试集成

```jsx
import { preinit } from 'react-dom';

function ABTestPreinit() {
  const experiment = useABTest('feature-redesign');
  
  useEffect(() => {
    if (experiment.variant === 'A') {
      // 变体A：旧版资源
      preinit('/features/legacy.js', { as: 'script' });
      preinit('/styles/legacy.css', { as: 'style' });
    } else if (experiment.variant === 'B') {
      // 变体B：新版资源
      preinit('/features/redesign.js', { as: 'script' });
      preinit('/styles/redesign.css', { as: 'style' });
    }
  }, [experiment.variant]);
  
  return experiment.variant === 'A' ? <LegacyUI /> : <RedesignedUI />;
}
```

### 6.2 权限控制加载

```jsx
import { preinit } from 'react-dom';

function PermissionBasedPreinit() {
  const { user, permissions } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // 根据权限初始化功能
    if (permissions.includes('admin')) {
      preinit('/admin-panel.js', { as: 'script' });
      preinit('/admin-styles.css', { as: 'style' });
    }
    
    if (permissions.includes('analytics')) {
      preinit('/analytics-dashboard.js', { as: 'script' });
    }
    
    if (permissions.includes('editor')) {
      preinit('/content-editor.js', { as: 'script' });
    }
  }, [user, permissions]);
  
  return <Dashboard />;
}
```

### 6.3 地理位置优化

```jsx
import { preinit } from 'react-dom';

function GeoPreinit() {
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    // 获取用户位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        }
      );
    }
  }, []);
  
  useEffect(() => {
    if (!userLocation) return;
    
    // 根据位置初始化本地化资源
    const region = getRegion(userLocation);
    
    preinit(`/locales/${region}.js`, { as: 'script' });
    preinit(`/styles/${region}.css`, { as: 'style' });
    
    // 预初始化区域特定功能
    if (region === 'CN') {
      preinit('/features/wechat-integration.js', { as: 'script' });
    } else if (region === 'US') {
      preinit('/features/google-integration.js', { as: 'script' });
    }
  }, [userLocation]);
  
  return <LocalizedApp />;
}

function getRegion({ latitude, longitude }) {
  // 简化的区域判断逻辑
  if (latitude > 18 && latitude < 54 && longitude > 73 && longitude < 135) {
    return 'CN';
  }
  return 'US';
}
```

### 6.4 Feature Flags集成

```jsx
import { preinit } from 'react-dom';

function FeatureFlagPreinit() {
  const flags = useFeatureFlags();
  
  useEffect(() => {
    // 根据feature flags初始化
    if (flags.newCheckout) {
      preinit('/features/new-checkout.js', { as: 'script' });
      preinit('/styles/new-checkout.css', { as: 'style' });
    }
    
    if (flags.aiAssistant) {
      preinit('/features/ai-assistant.js', { as: 'script' });
    }
    
    if (flags.darkMode) {
      preinit('/styles/dark-theme.css', { 
        as: 'style',
        precedence: 'high'
      });
    }
    
    if (flags.experimentalFeatures) {
      preinit('/features/experimental.js', { 
        as: 'script',
        precedence: 'low'
      });
    }
  }, [flags]);
  
  return <App />;
}
```

### 6.5 用户偏好驱动

```jsx
import { preinit } from 'react-dom';

function PreferencePreinit() {
  const preferences = useUserPreferences();
  
  useEffect(() => {
    // 根据用户偏好预初始化
    
    // 主题偏好
    if (preferences.theme === 'dark') {
      preinit('/themes/dark.css', { as: 'style' });
    } else if (preferences.theme === 'high-contrast') {
      preinit('/themes/high-contrast.css', { as: 'style' });
    }
    
    // 语言偏好
    preinit(`/locales/${preferences.language}.js`, { as: 'script' });
    
    // 辅助功能
    if (preferences.accessibility.screenReader) {
      preinit('/accessibility/screen-reader.js', { as: 'script' });
    }
    
    if (preferences.accessibility.largeText) {
      preinit('/accessibility/large-text.css', { as: 'style' });
    }
    
    // 功能偏好
    if (preferences.features.advancedSearch) {
      preinit('/features/advanced-search.js', { as: 'script' });
    }
  }, [preferences]);
  
  return <App />;
}
```

### 6.6 错误恢复机制

```jsx
import { preinit } from 'react-dom';

function ResilientPreinit() {
  const [failedScripts, setFailedScripts] = useState(new Set());
  const [retryCount, setRetryCount] = useState({});
  
  const safePreinit = (url, options, maxRetries = 3) => {
    preinit(url, options);
    
    // 检测加载失败
    setTimeout(() => {
      // 假设检查全局变量来判断加载成功
      const scriptLoaded = checkScriptLoaded(url);
      
      if (!scriptLoaded && (retryCount[url] || 0) < maxRetries) {
        console.warn(`Failed to load ${url}, retrying...`);
        
        setFailedScripts(prev => new Set([...prev, url]));
        setRetryCount(prev => ({
          ...prev,
          [url]: (prev[url] || 0) + 1
        }));
        
        // 延迟重试
        setTimeout(() => {
          safePreinit(url, options, maxRetries);
        }, 1000 * (retryCount[url] || 1));
      } else if (!scriptLoaded) {
        // 达到最大重试次数，使用降级方案
        console.error(`Failed to load ${url} after ${maxRetries} retries`);
        loadFallback(url);
      }
    }, 3000);
  };
  
  useEffect(() => {
    safePreinit('/critical-library.js', { as: 'script' });
  }, []);
  
  return failedScripts.size > 0 ? (
    <ErrorBoundary failed={Array.from(failedScripts)}>
      <App />
    </ErrorBoundary>
  ) : (
    <App />
  );
}

function checkScriptLoaded(url) {
  // 实际实现需要根据具体脚本判断
  return true;
}

function loadFallback(url) {
  // 加载降级版本或显示错误
  console.log(`Loading fallback for ${url}`);
}
```

## 第七部分：性能监控与调试

### 7.1 监控脚本加载

```jsx
import { preinit } from 'react-dom';

function MonitoredPreinit() {
  const [loadMetrics, setLoadMetrics] = useState({});
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'script' || entry.initiatorType === 'link') {
          setLoadMetrics(prev => ({
            ...prev,
            [entry.name]: {
              duration: entry.duration,
              size: entry.transferSize,
              startTime: entry.startTime,
              responseEnd: entry.responseEnd
            }
          }));
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    // 预初始化资源
    preinit('/app.js', { as: 'script' });
    preinit('/styles.css', { as: 'style' });
    
    return () => observer.disconnect();
  }, []);
  
  // 分析性能
  useEffect(() => {
    if (Object.keys(loadMetrics).length > 0) {
      const avgDuration = Object.values(loadMetrics)
        .reduce((sum, m) => sum + m.duration, 0) / Object.keys(loadMetrics).length;
      
      console.log('Average load duration:', avgDuration.toFixed(2) + 'ms');
      
      if (avgDuration > 1000) {
        console.warn('Script loading is slow, consider optimization');
      }
    }
  }, [loadMetrics]);
  
  return <App />;
}
```

### 7.2 依赖关系追踪

```jsx
import { preinit } from 'react-dom';

function DependencyTracker() {
  const [dependencies, setDependencies] = useState({
    loaded: new Set(),
    pending: new Set(),
    failed: new Set()
  });
  
  const trackPreinit = (url, options, deps = []) => {
    setDependencies(prev => ({
      ...prev,
      pending: new Set([...prev.pending, url])
    }));
    
    // 检查依赖
    const allDepsLoaded = deps.every(dep => dependencies.loaded.has(dep));
    
    if (!allDepsLoaded) {
      console.warn(`Dependencies not loaded for ${url}:`, deps);
    }
    
    preinit(url, options);
    
    // 模拟加载完成检测
    setTimeout(() => {
      setDependencies(prev => {
        const pending = new Set(prev.pending);
        const loaded = new Set(prev.loaded);
        pending.delete(url);
        loaded.add(url);
        
        return { ...prev, pending, loaded };
      });
    }, 1000);
  };
  
  useEffect(() => {
    // 按依赖顺序初始化
    trackPreinit('/vendor/react.js', { as: 'script' });
    
    setTimeout(() => {
      trackPreinit('/vendor/react-dom.js', { as: 'script' }, ['/vendor/react.js']);
    }, 100);
    
    setTimeout(() => {
      trackPreinit('/app.js', { as: 'script' }, ['/vendor/react.js', '/vendor/react-dom.js']);
    }, 200);
  }, []);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <DependencyStatus dependencies={dependencies} />
      )}
    </div>
  );
}
```

### 7.3 加载时序图

```jsx
import { preinit } from 'react-dom';

function LoadTimeline() {
  const [timeline, setTimeline] = useState([]);
  
  const recordPreinit = (url, options) => {
    const startTime = performance.now();
    
    setTimeline(prev => [...prev, {
      url,
      start: startTime,
      status: 'loading'
    }]);
    
    preinit(url, options);
    
    // 监听加载完成
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === url) {
          setTimeline(prev => prev.map(item =>
            item.url === url
              ? { ...item, end: entry.responseEnd, status: 'loaded' }
              : item
          ));
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  };
  
  useEffect(() => {
    recordPreinit('/critical.js', { as: 'script', precedence: 'high' });
    recordPreinit('/app.js', { as: 'script' });
    recordPreinit('/styles.css', { as: 'style' });
  }, []);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <Timeline events={timeline} />
      )}
    </div>
  );
}
```

## 第八部分：与其他技术结合

### 8.1 与Service Worker协同

```jsx
import { preinit } from 'react-dom';

function ServiceWorkerPreinit() {
  const [swReady, setSwReady] = useState(false);
  
  useEffect(() => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwReady(true);
          
          // 通知SW预缓存资源
          registration.active?.postMessage({
            type: 'PRECACHE',
            urls: [
              '/critical-app.js',
              '/app-styles.css'
            ]
          });
        });
    }
  }, []);
  
  useEffect(() => {
    if (swReady) {
      // SW就绪后预初始化
      preinit('/critical-app.js', { as: 'script' });
      preinit('/app-styles.css', { as: 'style' });
    }
  }, [swReady]);
  
  return <App />;
}
```

### 8.2 与Webpack动态导入结合

```jsx
import { preinit } from 'react-dom';

function WebpackPreinit() {
  const preloadChunk = (chunkName) => {
    // Webpack会生成chunk文件名
    const chunkUrl = `/chunks/${chunkName}.chunk.js`;
    
    preinit(chunkUrl, { 
      as: 'script',
      precedence: 'low'
    });
  };
  
  const handleRouteChange = (route) => {
    switch (route) {
      case '/dashboard':
        preloadChunk('dashboard');
        break;
      case '/profile':
        preloadChunk('profile');
        break;
    }
  };
  
  return <Router onRouteChange={handleRouteChange} />;
}
```

### 8.3 与React懒加载结合

```jsx
import { preinit } from 'react-dom';
import { lazy, Suspense } from 'react';

// 懒加载组件
const Dashboard = lazy(() => import('./Dashboard'));
const Profile = lazy(() => import('./Profile'));

function LazyWithPreinit() {
  const [route, setRoute] = useState('home');
  
  // 预初始化组件依赖
  const preinitRoute = (routeName) => {
    switch (routeName) {
      case 'dashboard':
        preinit('/vendor/chart.js', { as: 'script' });
        preinit('/styles/dashboard.css', { as: 'style' });
        break;
      case 'profile':
        preinit('/vendor/avatar-editor.js', { as: 'script' });
        preinit('/styles/profile.css', { as: 'style' });
        break;
    }
  };
  
  const navigate = (routeName) => {
    preinitRoute(routeName);
    setTimeout(() => setRoute(routeName), 100);
  };
  
  return (
    <div>
      <nav>
        <button onMouseEnter={() => preinitRoute('dashboard')}>
          Dashboard
        </button>
        <button onMouseEnter={() => preinitRoute('profile')}>
          Profile
        </button>
      </nav>
      
      <Suspense fallback={<Loading />}>
        {route === 'dashboard' && <Dashboard />}
        {route === 'profile' && <Profile />}
      </Suspense>
    </div>
  );
}
```

## 注意事项

### 1. 避免重复初始化

```jsx
// ❌ 重复初始化
function Bad() {
  preinit('/lib.js', { as: 'script' });
  preinit('/lib.js', { as: 'script' });  // 重复！
}

// ✅ 使用缓存避免重复
const preinitCache = new Set();

function preinitOnce(url, options) {
  if (!preinitCache.has(url)) {
    preinitCache.add(url);
    preinit(url, options);
  }
}
```

### 2. 考虑执行顺序

```jsx
// ✅ 依赖顺序很重要
function CorrectOrder() {
  // 先加载依赖
  preinit('/vendor/react.js', { 
    as: 'script',
    precedence: 'high'
  });
  
  // 再加载应用代码（稍后）
  setTimeout(() => {
    preinit('/app.js', { 
      as: 'script',
      precedence: 'medium'
    });
  }, 100);
}
```

### 3. 错误处理

```jsx
// ✅ 处理加载失败
function ErrorHandling() {
  const [error, setError] = useState(null);
  
  preinit('/critical.js', { as: 'script' });
  
  useEffect(() => {
    const checkLoad = setTimeout(() => {
      if (!window.criticalLibrary) {
        setError('Failed to load critical library');
        console.error('Failed to load critical library');
        // 加载降级版本
        preinit('/fallback.js', { as: 'script' });
      }
    }, 5000);
    
    return () => clearTimeout(checkLoad);
  }, []);
  
  if (error) {
    return <ErrorFallback message={error} />;
  }
  
  return <App />;
}
```

### 4. SSR兼容性

```jsx
// ✅ SSR友好的预初始化
function SSRCompatible() {
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      preinit('/client-only.js', { as: 'script' });
    }
  }, []);
  
  return <App />;
}
```

### 5. 内容安全策略(CSP)

```jsx
// ✅ 使用nonce满足CSP要求
function CSPCompliant({ nonce }) {
  preinit('/app.js', {
    as: 'script',
    nonce: nonce
  });
  
  preinit('/styles.css', {
    as: 'style',
    nonce: nonce
  });
  
  return <App />;
}
```

### 6. 性能预算

```jsx
// ✅ 控制预初始化的资源总量
function BudgetAware() {
  const [totalSize, setTotalSize] = useState(0);
  const MAX_BUDGET = 500 * 1024; // 500KB
  
  const budgetPreinit = (url, options) => {
    // 估算资源大小（实际需要更精确的方法）
    fetch(url, { method: 'HEAD' })
      .then(res => {
        const size = parseInt(res.headers.get('content-length') || '0');
        
        if (totalSize + size <= MAX_BUDGET) {
          preinit(url, options);
          setTotalSize(prev => prev + size);
        } else {
          console.warn(`Budget exceeded, skipping ${url}`);
        }
      });
  };
  
  useEffect(() => {
    budgetPreinit('/app.js', { as: 'script' });
    budgetPreinit('/styles.css', { as: 'style' });
  }, []);
  
  return <App />;
}
```

## 常见问题

### Q1: preinit和preload应该如何选择？

**A:** 
- **preload**: 只下载不执行，适用于图片、字体、数据等资源
- **preinit**: 下载并执行，适用于脚本和样式表

```jsx
// preload: 只下载
preload('/image.jpg', { as: 'image' });
preload('/font.woff2', { as: 'font' });

// preinit: 下载并执行
preinit('/app.js', { as: 'script' });
preinit('/styles.css', { as: 'style' });
```

### Q2: preinit会阻塞渲染吗？

**A:** preinit本身不会阻塞渲染，但有几点需要注意：
- 脚本默认异步加载（async）
- 脚本执行可能会阻塞（取决于脚本内容）
- 样式表加载会阻塞渲染直到加载完成

**解决方案**:
```jsx
// 使用低优先级避免阻塞
preinit('/non-critical.js', {
  as: 'script',
  precedence: 'low',
  fetchPriority: 'low'
});

// 延迟初始化非关键资源
requestIdleCallback(() => {
  preinit('/optional.js', { as: 'script' });
});
```

### Q3: 如何控制脚本执行时机？

**A:** 有多种方式控制执行时机：

```jsx
// 1. 使用setTimeout延迟
setTimeout(() => {
  preinit('/delayed.js', { as: 'script' });
}, 2000);

// 2. 使用requestIdleCallback空闲时执行
requestIdleCallback(() => {
  preinit('/idle.js', { as: 'script' });
});

// 3. 基于条件执行
useEffect(() => {
  if (userInteracted) {
    preinit('/interactive.js', { as: 'script' });
  }
}, [userInteracted]);

// 4. 使用precedence控制顺序
preinit('/first.js', { as: 'script', precedence: 'high' });
preinit('/second.js', { as: 'script', precedence: 'medium' });
```

### Q4: 可以取消preinit吗？

**A:** 不能直接取消，一旦调用preinit，资源就会开始下载并执行。

**变通方案**:
```jsx
// 使用条件判断避免不必要的初始化
const [shouldInit, setShouldInit] = useState(false);

useEffect(() => {
  if (shouldInit) {
    preinit('/resource.js', { as: 'script' });
  }
}, [shouldInit]);

// 或者使用防抖
const debouncedPreinit = debounce((url, options) => {
  preinit(url, options);
}, 300);
```

### Q5: preinit与动态import有什么区别？

**A:** 

| 特性 | preinit | dynamic import |
|------|---------|----------------|
| 用途 | 预初始化外部脚本/样式 | 动态加载ES模块 |
| 执行时机 | 立即下载并执行 | 调用时才加载 |
| 返回值 | 无 | Promise |
| 模块系统 | 不限 | ES模块 |
| 适用场景 | 第三方库、CDN资源 | 应用代码分割 |

```jsx
// preinit: 外部脚本
preinit('https://cdn.example.com/library.js', { as: 'script' });

// dynamic import: 应用模块
const Component = await import('./Component.jsx');
```

### Q6: precedence参数如何工作？

**A:** `precedence`控制资源在文档中的插入位置和执行顺序：

```jsx
// 高优先级：插入到head早期位置
preinit('/critical.js', { 
  as: 'script',
  precedence: 'high'
});

// 中等优先级：默认位置
preinit('/normal.js', { 
  as: 'script',
  precedence: 'medium'
});

// 低优先级：插入到较后位置
preinit('/optional.js', { 
  as: 'script',
  precedence: 'low'
});
```

**对于样式表特别重要**：precedence决定CSS的级联顺序。

### Q7: 如何处理第三方库的依赖关系？

**A:** 按顺序加载，并检测依赖是否就绪：

```jsx
function LoadDependencies() {
  const [deps, setDeps] = useState({
    jquery: false,
    jqueryUI: false
  });
  
  useEffect(() => {
    // 加载jQuery
    preinit('https://cdn.jquery.com/jquery.min.js', { 
      as: 'script',
      precedence: 'high'
    });
    
    // 检测jQuery是否加载
    const checkJQuery = setInterval(() => {
      if (window.jQuery) {
        setDeps(prev => ({ ...prev, jquery: true }));
        clearInterval(checkJQuery);
      }
    }, 100);
    
    return () => clearInterval(checkJQuery);
  }, []);
  
  useEffect(() => {
    if (deps.jquery) {
      // jQuery加载完成后加载jQuery UI
      preinit('https://cdn.jqueryui.com/jquery-ui.min.js', { 
        as: 'script',
        precedence: 'high'
      });
      
      const checkJQueryUI = setInterval(() => {
        if (window.jQuery?.ui) {
          setDeps(prev => ({ ...prev, jqueryUI: true }));
          clearInterval(checkJQueryUI);
        }
      }, 100);
      
      return () => clearInterval(checkJQueryUI);
    }
  }, [deps.jquery]);
  
  if (!deps.jqueryUI) {
    return <Loading />;
  }
  
  return <App />;
}
```

### Q8: 如何在Next.js中使用preinit？

**A:** Next.js与React 19完美集成：

```jsx
// pages/_app.js
import { preinit } from 'react-dom';

function MyApp({ Component, pageProps }) {
  // 全局资源预初始化
  preinit('/vendor/global.js', { as: 'script' });
  preinit('/styles/global.css', { as: 'style' });
  
  return <Component {...pageProps} />;
}

// pages/dashboard.js
export default function Dashboard() {
  // 页面特定资源
  preinit('/vendor/chart.js', { as: 'script' });
  preinit('/styles/dashboard.css', { as: 'style' });
  
  return <DashboardContent />;
}
```

### Q9: preinit对SEO有影响吗？

**A:** 有积极影响：
- 提升页面加载速度
- 改善Core Web Vitals
- 更好的用户体验指标

但要注意：
- 搜索引擎爬虫可能不执行JavaScript
- 确保关键内容在SSR中渲染
- 不要依赖preinit的资源来渲染首屏内容

### Q10: 如何调试preinit问题？

**A:** 使用多种工具：

```jsx
// 1. Chrome DevTools
// Network面板 → 查看Initiator列

// 2. Performance API
const resources = performance.getEntriesByType('resource');
const scripts = resources.filter(r => r.initiatorType === 'script');
console.table(scripts);

// 3. 自定义监控
function DebugPreinit() {
  useEffect(() => {
    const originalPreinit = preinit;
    
    window.preinit = (url, options) => {
      console.log('[Preinit]', url, options);
      return originalPreinit(url, options);
    };
  }, []);
}

// 4. React DevTools Profiler
// 查看组件渲染时间和资源加载关系
```

## 总结

### preinit的核心优势

1. **自动化管理**
   - 自动创建script/link标签
   - 自动添加到DOM
   - 无需手动管理生命周期

2. **性能优化**
   - 提前下载并执行资源
   - 减少首屏加载时间
   - 优化关键渲染路径

3. **灵活控制**
   - precedence控制顺序
   - fetchPriority控制优先级
   - 条件初始化支持

4. **现代化API**
   - React 19原生支持
   - SSR友好
   - TypeScript类型安全

### 适用场景

1. **第三方库初始化**
   - 分析工具（Google Analytics, Sentry）
   - UI库（Bootstrap, Material-UI）
   - 功能库（Chart.js, Lodash）

2. **动态功能加载**
   - A/B测试变体
   - Feature flags功能
   - 权限功能

3. **样式动态切换**
   - 主题切换
   - 响应式样式
   - 条件样式

4. **代码分割优化**
   - 路由预加载
   - 组件预加载
   - 模块预加载

### 与preload对比

| 特性 | preload | preinit |
|------|---------|---------|
| 作用 | 只下载 | 下载并执行 |
| 适用资源 | 所有类型 | script/style |
| 执行时机 | 手动触发 | 自动执行 |
| DOM操作 | 需要手动 | 自动添加标签 |
| 使用复杂度 | 较低 | 较低 |
| 适用场景 | 图片、字体、数据 | 脚本、样式表 |

### 最佳实践总结

1. **资源选择**
   - 只初始化真正需要的资源
   - 优先初始化关键资源
   - 考虑资源依赖关系

2. **优先级管理**
   - 关键库：precedence: 'high'
   - 应用代码：precedence: 'medium'
   - 可选功能：precedence: 'low'

3. **性能考虑**
   - 避免重复初始化
   - 控制并发数量
   - 监控性能指标

4. **错误处理**
   - 检测加载失败
   - 提供降级方案
   - 记录错误日志

5. **环境适配**
   - 检测网络状况
   - 考虑设备性能
   - SSR兼容性

### 性能提升预期

合理使用preinit可以带来：

```
脚本加载时间: ↓ 30-50%
交互就绪时间: ↓ 40-60%
首次渲染时间: ↓ 20-30%
用户感知延迟: ↓ 50-70%
```

### 注意避免的陷阱

1. **过度初始化**
   - 不要初始化所有资源
   - 考虑实际使用场景

2. **依赖顺序错误**
   - 确保依赖先加载
   - 使用precedence控制

3. **重复初始化**
   - 使用缓存机制
   - 避免无效请求

4. **忽略错误**
   - 处理加载失败
   - 提供用户反馈

preinit让脚本和样式的加载更加高效和智能，是React 19性能优化的重要工具！
