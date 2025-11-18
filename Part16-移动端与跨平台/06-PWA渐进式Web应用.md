# PWA渐进式Web应用 - 完整Progressive Web App指南

## 1. PWA概述

### 1.1 什么是PWA

PWA(Progressive Web App)是一种结合了Web和原生应用优势的应用模式,能够提供类似原生应用的用户体验。

```typescript
const pwaCharacteristics = {
  progressive: {
    name: '渐进式',
    description: '适用于所有浏览器,逐步增强功能'
  },
  
  responsive: {
    name: '响应式',
    description: '适配各种设备和屏幕尺寸'
  },
  
  connectivity: {
    name: '离线可用',
    description: '通过Service Worker实现离线访问'
  },
  
  appLike: {
    name: '类应用',
    description: '具有应用式的交互和导航'
  },
  
  fresh: {
    name: '持续更新',
    description: 'Service Worker自动更新'
  },
  
  safe: {
    name: '安全',
    description: '必须通过HTTPS提供服务'
  },
  
  discoverable: {
    name: '可发现',
    description: 'manifest使其可被识别为应用'
  },
  
  reEngageable: {
    name: '可重新参与',
    description: '推送通知等功能提高用户参与度'
  },
  
  installable: {
    name: '可安装',
    description: '可添加到主屏幕'
  },
  
  linkable: {
    name: '可链接',
    description: '通过URL分享,无需复杂安装'
  }
};
```

### 1.2 PWA核心技术

```typescript
const pwaCoretech = {
  serviceWorker: {
    purpose: '离线缓存和后台同步',
    capabilities: [
      '拦截网络请求',
      '缓存管理',
      '后台同步',
      '推送通知'
    ]
  },
  
  manifest: {
    purpose: '应用配置和安装',
    features: [
      '应用名称和图标',
      '启动画面',
      '主题颜色',
      '显示模式'
    ]
  },
  
  https: {
    purpose: '安全传输',
    requirement: 'PWA必须在HTTPS环境下运行'
  },
  
  responsiveDesign: {
    purpose: '适配多设备',
    techniques: [
      '响应式布局',
      '触摸优化',
      '自适应图片'
    ]
  }
};
```

## 2. PWA优势与应用场景

### 2.1 PWA优势

```typescript
const pwaAdvantages = {
  userExperience: [
    '快速加载(缓存)',
    '离线可用',
    '流畅动画(60fps)',
    '推送通知',
    '全屏体验'
  ],
  
  development: [
    '单一代码库',
    '降低开发成本',
    '快速部署',
    '自动更新',
    'Web技术栈'
  ],
  
  distribution: [
    '无需应用商店审核',
    'URL分享',
    '跨平台',
    '搜索引擎可发现',
    '降低获客成本'
  ],
  
  performance: [
    '更小的包体积',
    '增量更新',
    '按需加载',
    '更快的首屏加载'
  ]
};
```

### 2.2 适用场景

```typescript
const pwaUseCases = {
  ideal: [
    '内容型网站(新闻、博客)',
    '电商平台',
    '社交媒体',
    '工具类应用',
    'SaaS应用'
  ],
  
  notIdeal: [
    '需要复杂硬件交互',
    '高性能3D游戏',
    '需要深度系统集成',
    '仅针对单一平台'
  ],
  
  successCases: {
    twitter: 'Twitter Lite - 减少65%数据使用',
    pinterest: 'Pinterest - 转化率提升60%',
    alibaba: '阿里巴巴 - 76%提升转化率',
    starbucks: '星巴克 - 离线订餐'
  }
};
```

## 3. PWA检测与审计

### 3.1 Lighthouse审计

```typescript
const lighthouseAudit = {
  installation: 'Chrome DevTools或命令行工具',
  
  categories: {
    performance: '性能评分',
    accessibility: '可访问性',
    bestPractices: '最佳实践',
    seo: 'SEO优化',
    pwa: 'PWA标准'
  },
  
  pwaChecklist: [
    '注册Service Worker',
    '响应200当离线',
    '提供Web App Manifest',
    '配置启动URL',
    '设置图标',
    '使用HTTPS',
    '页面在3秒内可交互',
    '跨浏览器兼容'
  ]
};

// 命令行使用
// npm install -g lighthouse
// lighthouse https://example.com --view
```

### 3.2 PWA检测代码

```typescript
// 检测PWA支持
export function checkPWASupport() {
  const support = {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotification: 'PushManager' in window,
    notification: 'Notification' in window,
    storage: 'storage' in navigator && 'estimate' in navigator.storage,
    badgeAPI: 'setAppBadge' in navigator,
    share: 'share' in navigator,
    beforeInstallPrompt: true // 需要监听事件
  };
  
  return support;
}

// 检测是否已安装
export function isPWAInstalled(): boolean {
  // 检测display-mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // 检测navigator.standalone (iOS)
  const isIOS = (navigator as any).standalone === true;
  
  return isStandalone || isIOS;
}

// 检测是否在PWA中运行
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         window.matchMedia('(display-mode: minimal-ui)').matches ||
         (navigator as any).standalone === true;
}
```

## 4. 安装提示与引导

### 4.1 beforeinstallprompt事件

```typescript
// 监听安装提示事件
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  // 阻止默认的安装提示
  e.preventDefault();
  
  // 保存事件,稍后触发
  deferredPrompt = e;
  
  // 显示自定义安装按钮
  showInstallButton();
});

// 触发安装
async function installPWA() {
  if (!deferredPrompt) {
    return;
  }
  
  // 显示安装提示
  deferredPrompt.prompt();
  
  // 等待用户响应
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`用户${outcome === 'accepted' ? '接受' : '拒绝'}了安装`);
  
  // 清空事件
  deferredPrompt = null;
}

// 监听安装成功
window.addEventListener('appinstalled', () => {
  console.log('PWA已安装成功');
  hideInstallButton();
  
  // 发送分析事件
  analytics.logEvent('pwa_installed');
});
```

### 4.2 React安装组件

```tsx
// InstallPrompt.tsx
import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  useEffect(() => {
    // 检查是否已安装
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(standalone);
    
    // 监听安装提示
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // 监听安装成功
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);
  
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受安装');
    }
    
    setInstallPrompt(null);
  };
  
  if (isInstalled || !installPrompt) {
    return null;
  }
  
  return (
    <div className="install-prompt">
      <p>安装我们的应用,获得更好的体验!</p>
      <button onClick={handleInstall}>立即安装</button>
    </div>
  );
}

// 底部横幅样式
export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [prompt, setPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex items-center justify-between">
      <div>
        <h3 className="font-bold">安装应用</h3>
        <p className="text-sm">快速访问,离线可用</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShow(false)}
          className="px-4 py-2 bg-white/20 rounded"
        >
          暂不
        </button>
        <button
          onClick={async () => {
            if (prompt) {
              prompt.prompt();
              await prompt.userChoice;
              setShow(false);
            }
          }}
          className="px-4 py-2 bg-white text-blue-600 rounded"
        >
          安装
        </button>
      </div>
    </div>
  );
}
```

### 4.3 iOS安装引导

```tsx
// iOSInstallGuide.tsx
export function IOSInstallGuide() {
  const [showGuide, setShowGuide] = useState(false);
  
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = (navigator as any).standalone;
    
    // iOS且未安装
    if (isIOS && !isStandalone) {
      setShowGuide(true);
    }
  }, []);
  
  if (!showGuide) return null;
  
  return (
    <div className="ios-install-guide">
      <div className="overlay" onClick={() => setShowGuide(false)} />
      <div className="guide-content">
        <h3>安装到主屏幕</h3>
        <ol>
          <li>点击底部的分享按钮</li>
          <li>滚动并选择"添加到主屏幕"</li>
          <li>点击"添加"完成安装</li>
        </ol>
        <button onClick={() => setShowGuide(false)}>知道了</button>
      </div>
    </div>
  );
}
```

## 5. PWA更新策略

### 5.1 检测更新

```typescript
// 检测Service Worker更新
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      // 每小时检查更新
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              showUpdatePrompt();
            }
          });
        }
      });
    });
  }
}

// 提示用户更新
function showUpdatePrompt() {
  if (confirm('发现新版本,是否立即更新?')) {
    // 通知Service Worker跳过等待
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // 刷新页面
    window.location.reload();
  }
}
```

### 5.2 React更新组件

```tsx
// UpdatePrompt.tsx
export function UpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
        
        // 定期检查更新
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000);
      });
    }
  }, []);
  
  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // 监听控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };
  
  if (!updateAvailable) return null;
  
  return (
    <div className="update-prompt">
      <p>发现新版本!</p>
      <button onClick={handleUpdate}>立即更新</button>
      <button onClick={() => setUpdateAvailable(false)}>稍后</button>
    </div>
  );
}
```

## 6. 离线体验优化

### 6.1 离线页面

```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>离线</title>
  <style>
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: sans-serif;
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="icon">📡</div>
  <h1>您当前处于离线状态</h1>
  <p>请检查您的网络连接</p>
  <button onclick="location.reload()">重试</button>
</body>
</html>
```

### 6.2 离线状态检测

```tsx
// useOnlineStatus.ts
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// OfflineIndicator.tsx
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="offline-banner">
      您当前处于离线状态,部分功能可能不可用
    </div>
  );
}
```

## 7. PWA性能优化

### 7.1 资源预加载

```html
<!-- 预加载关键资源 -->
<link rel="preload" as="script" href="/app.js">
<link rel="preload" as="style" href="/app.css">
<link rel="preload" as="font" href="/font.woff2" crossorigin>
<link rel="preload" as="image" href="/hero.jpg">

<!-- DNS预解析 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预获取 -->
<link rel="prefetch" href="/next-page.js">
```

### 7.2 代码分割

```tsx
// 路由级代码分割
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}

// 组件级代码分割
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export function Page() {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShow(true)}>加载组件</button>
      {show && (
        <Suspense fallback={<Spinner />}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

## 8. PWA分析与监控

### 8.1 性能监控

```typescript
// 收集性能指标
export function collectPerformanceMetrics() {
  // Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log); // Cumulative Layout Shift
    getFID(console.log); // First Input Delay
    getFCP(console.log); // First Contentful Paint
    getLCP(console.log); // Largest Contentful Paint
    getTTFB(console.log); // Time to First Byte
  });
  
  // 自定义指标
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart
    };
    
    console.log('Performance Metrics:', metrics);
  }
}
```

### 8.2 使用分析

```typescript
// 跟踪PWA使用情况
export function trackPWAUsage() {
  // 安装来源
  if (document.referrer) {
    analytics.logEvent('pwa_install_source', {
      source: document.referrer
    });
  }
  
  // 显示模式
  const displayMode = window.matchMedia('(display-mode: standalone)').matches
    ? 'standalone'
    : 'browser';
  
  analytics.logEvent('pwa_display_mode', { displayMode });
  
  // 离线使用
  window.addEventListener('offline', () => {
    analytics.logEvent('pwa_went_offline');
  });
  
  window.addEventListener('online', () => {
    analytics.logEvent('pwa_came_online');
  });
  
  // Service Worker状态
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      analytics.logEvent('pwa_sw_ready', {
        scope: registration.scope
      });
    });
  }
}
```

## 9. PWA部署清单

```typescript
const pwaDeploymentChecklist = {
  manifest: [
    '创建manifest.json',
    '配置name和short_name',
    '添加icons(192x192, 512x512)',
    '设置start_url',
    '设置display模式',
    '设置theme_color和background_color',
    '添加到index.html'
  ],
  
  serviceWorker: [
    '注册Service Worker',
    '实现缓存策略',
    '处理离线场景',
    '实现更新机制',
    '测试离线功能'
  ],
  
  https: [
    '配置HTTPS证书',
    '强制HTTPS重定向',
    '更新所有资源URL为HTTPS'
  ],
  
  performance: [
    '优化首屏加载',
    '实现代码分割',
    '压缩资源',
    '配置CDN',
    '启用Gzip/Brotli'
  ],
  
  testing: [
    'Lighthouse审计',
    '多设备测试',
    '离线功能测试',
    '安装流程测试',
    '更新机制测试'
  ],
  
  monitoring: [
    '配置错误监控',
    '性能监控',
    '使用分析',
    'Service Worker状态监控'
  ]
};
```

## 10. 最佳实践

```typescript
const pwaBestPractices = {
  architecture: [
    '应用外壳架构(App Shell)',
    '渐进增强策略',
    '离线优先设计',
    '合理的缓存策略',
    '快速首屏加载'
  ],
  
  userExperience: [
    '提供安装提示',
    '流畅的动画',
    '即时反馈',
    '优雅的降级',
    '离线提示'
  ],
  
  performance: [
    '资源预加载',
    '代码分割',
    '延迟加载',
    '图片优化',
    '减少主线程工作'
  ],
  
  security: [
    '始终使用HTTPS',
    '内容安全策略',
    '安全的Service Worker',
    '定期更新依赖'
  ],
  
  maintenance: [
    '版本管理',
    '灰度发布',
    '回滚机制',
    '监控告警',
    '用户反馈'
  ]
};
```

## 11. 总结

PWA的核心要点:

1. **核心技术**: Service Worker + Manifest + HTTPS
2. **离线能力**: 缓存策略和离线页面
3. **可安装**: beforeinstallprompt和安装引导
4. **更新机制**: 自动检测和提示更新
5. **性能优化**: 代码分割和资源预加载
6. **用户体验**: 类原生应用体验
7. **监控分析**: 性能和使用情况追踪

通过正确实施PWA,可以提供接近原生应用的Web体验。

