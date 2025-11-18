# Web Vitals核心指标(LCP-FID-CLS)

## 第一部分：Web Vitals概述

### 1.1 什么是Web Vitals

Web Vitals是Google提出的一组衡量用户体验的核心性能指标，重点关注加载速度、交互性和视觉稳定性三个方面。

**核心指标（Core Web Vitals）：**

```
1. LCP (Largest Contentful Paint)
   - 最大内容绘制时间
   - 衡量加载性能
   - 目标：<2.5s

2. FID (First Input Delay) / INP (Interaction to Next Paint)
   - 首次输入延迟 / 交互到下次绘制
   - 衡量交互性
   - 目标：FID <100ms，INP <200ms

3. CLS (Cumulative Layout Shift)
   - 累积布局偏移
   - 衡量视觉稳定性
   - 目标：<0.1
```

### 1.2 测量Web Vitals

```javascript
// 安装web-vitals库
// npm install web-vitals

import { onCLS, onFID, onLCP, onFCP, onINP, onTTFB } from 'web-vitals';

// 基础测量
onLCP(console.log);
onFID(console.log);
onCLS(console.log);

// 完整实现
function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFID, onLCP, onINP, onFCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onLCP(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
}

// 使用
reportWebVitals((metric) => {
  console.log(metric);
  // 上报到分析服务
  sendToAnalytics(metric);
});

// metric对象结构
{
  name: 'LCP',           // 指标名称
  value: 2234.5,         // 指标值
  rating: 'good',        // good/needs-improvement/poor
  delta: 123.4,          // 与上次的差值
  id: 'v2-1234567890',   // 唯一ID
  entries: [...]         // 性能条目
}

// React应用集成
// index.js
import { createRoot } from 'react-dom/client';
import { onCLS, onFID, onLCP } from 'web-vitals';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 报告Web Vitals
onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', {
      method: 'POST',
      body,
      keepalive: true
    });
  }
}
```

### 1.3 评分标准

```javascript
// 各指标的评分标准
const webVitalsThresholds = {
  LCP: {
    good: 2500,          // ≤2.5s
    needsImprovement: 4000,  // 2.5s-4s
    poor: Infinity       // >4s
  },
  
  FID: {
    good: 100,           // ≤100ms
    needsImprovement: 300,   // 100ms-300ms
    poor: Infinity       // >300ms
  },
  
  INP: {
    good: 200,           // ≤200ms
    needsImprovement: 500,   // 200ms-500ms
    poor: Infinity       // >500ms
  },
  
  CLS: {
    good: 0.1,           // ≤0.1
    needsImprovement: 0.25,  // 0.1-0.25
    poor: Infinity       // >0.25
  }
};

// 评分函数
function getRating(metric, value) {
  const thresholds = webVitalsThresholds[metric];
  
  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.needsImprovement) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

// 使用
const lcpValue = 2800;
const rating = getRating('LCP', lcpValue);
console.log(`LCP ${lcpValue}ms is ${rating}`);
// 输出：LCP 2800ms is needs-improvement
```

## 第二部分：LCP优化

### 2.1 LCP识别

```javascript
// 使用PerformanceObserver监控LCP
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  
  console.log('LCP element:', lastEntry.element);
  console.log('LCP value:', lastEntry.renderTime || lastEntry.loadTime);
  console.log('LCP size:', lastEntry.size);
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });

// React Hook监控LCP
function useLCP() {
  const [lcp, setLCP] = useState(null);
  
  useEffect(() => {
    let observer;
    
    if ('PerformanceObserver' in window) {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        setLCP({
          value: lastEntry.renderTime || lastEntry.loadTime,
          element: lastEntry.element.tagName,
          url: lastEntry.url
        });
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }
    
    return () => {
      if (observer) observer.disconnect();
    };
  }, []);
  
  return lcp;
}

// 使用
function App() {
  const lcp = useLCP();
  
  useEffect(() => {
    if (lcp) {
      console.log('LCP:', lcp);
      
      if (lcp.value > 2500) {
        console.warn('LCP is slow!');
      }
    }
  }, [lcp]);
  
  return <MyApp />;
}
```

### 2.2 LCP优化策略

```javascript
// 策略1：优化服务器响应
// - 使用CDN
// - 启用HTTP/2或HTTP/3
// - 压缩响应
// - 使用缓存

// 策略2：预加载LCP资源
function HeroSection() {
  return (
    <>
      <link 
        rel="preload" 
        as="image" 
        href="/hero-image.jpg"
        fetchpriority="high"
      />
      
      <section className="hero">
        <img 
          src="/hero-image.jpg" 
          alt="Hero"
          fetchpriority="high"
        />
      </section>
    </>
  );
}

// 策略3：优化图片
// - 使用适当的格式（WebP）
// - 响应式图片
// - 压缩图片
function OptimizedHeroImage() {
  return (
    <picture>
      <source 
        type="image/webp"
        srcSet="/hero-400.webp 400w, /hero-800.webp 800w"
      />
      <img
        src="/hero-800.jpg"
        srcSet="/hero-400.jpg 400w, /hero-800.jpg 800w"
        sizes="(max-width: 600px) 400px, 800px"
        alt="Hero"
        fetchpriority="high"
      />
    </picture>
  );
}

// 策略4：避免渲染阻塞
// - 内联关键CSS
// - 延迟非关键CSS
// - 移除未使用的CSS
function CriticalCSS() {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
        <link rel="preload" href="/styles.css" as="style" onLoad="this.onload=null;this.rel='stylesheet'" />
        <noscript>
          <link rel="stylesheet" href="/styles.css" />
        </noscript>
      </head>
      <body>
        <App />
      </body>
    </html>
  );
}

// 策略5：减少JavaScript
// - 代码分割
// - Tree-Shaking
// - 压缩混淆
```

## 第三部分：FID/INP优化

### 3.1 FID测量

```javascript
// FID只能在真实用户交互中测量
import { onFID } from 'web-vitals';

onFID((metric) => {
  console.log('FID:', metric.value);
  console.log('Event type:', metric.entries[0].name);
  
  if (metric.value > 100) {
    console.warn('FID is slow!');
  }
  
  sendToAnalytics(metric);
});

// INP测量（Chrome 96+）
import { onINP } from 'web-vitals';

onINP((metric) => {
  console.log('INP:', metric.value);
  
  // INP是所有交互的最差值
  if (metric.value > 200) {
    console.warn('INP is slow!');
  }
});

// 自定义交互监控
function useInteractionTracking() {
  useEffect(() => {
    const interactions = [];
    
    const trackInteraction = (event) => {
      const startTime = performance.now();
      
      requestAnimationFrame(() => {
        const duration = performance.now() - startTime;
        
        interactions.push({
          type: event.type,
          duration,
          timestamp: Date.now()
        });
        
        if (duration > 100) {
          console.warn('Slow interaction:', event.type, duration);
        }
      });
    };
    
    ['click', 'keydown', 'touchstart'].forEach(type => {
      document.addEventListener(type, trackInteraction, { passive: true });
    });
    
    return () => {
      ['click', 'keydown', 'touchstart'].forEach(type => {
        document.removeEventListener(type, trackInteraction);
      });
    };
  }, []);
}
```

### 3.2 FID/INP优化策略

```javascript
// 策略1：减少JavaScript执行时间
// ❌ 主线程阻塞
function HeavyClick() {
  const handleClick = () => {
    // 耗时的同步操作
    const result = expensiveCalculation(largeData);
    setState(result);
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 使用transition
function OptimizedClick() {
  const [isPending, startTransition] = useTransition();
  
  const handleClick = () => {
    startTransition(() => {
      const result = expensiveCalculation(largeData);
      setState(result);
    });
  };
  
  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Processing...' : 'Click'}
    </button>
  );
}

// 策略2：分批处理
function BatchedProcessing() {
  const handleClick = () => {
    const chunks = chunkArray(largeData, 100);
    
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        processChunk(chunk);
      }, index * 10);
    });
  };
  
  return <button onClick={handleClick}>Process</button>;
}

// 策略3：Web Worker
function WorkerProcessing() {
  const workerRef = useRef();
  
  useEffect(() => {
    workerRef.current = new Worker('/worker.js');
    
    workerRef.current.onmessage = (e) => {
      setState(e.data);
    };
    
    return () => workerRef.current.terminate();
  }, []);
  
  const handleClick = () => {
    workerRef.current.postMessage(largeData);
  };
  
  return <button onClick={handleClick}>Process</button>;
}

// 策略4：防抖和节流
function DebouncedInput() {
  const [value, setValue] = useState('');
  
  const debouncedSave = useMemo(
    () => debounce((val) => {
      saveToServer(val);
    }, 300),
    []
  );
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSave(newValue);
  };
  
  return <input value={value} onChange={handleChange} />;
}
```

## 第四部分：CLS优化

### 4.1 CLS测量

```javascript
// 测量CLS
import { onCLS } from 'web-vitals';

onCLS((metric) => {
  console.log('CLS:', metric.value);
  console.log('Entries:', metric.entries);
  
  metric.entries.forEach(entry => {
    console.log('Shifted element:', entry.sources[0].node);
    console.log('Shift value:', entry.value);
  });
  
  if (metric.value > 0.1) {
    console.warn('CLS is poor!');
  }
});

// 自定义CLS监控
function useCLSTracking() {
  const [shifts, setShifts] = useState([]);
  
  useEffect(() => {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          
          setShifts(prev => [...prev, {
            value: entry.value,
            sources: entry.sources,
            timestamp: Date.now()
          }]);
        }
      }
    });
    
    observer.observe({ type: 'layout-shift', buffered: true });
    
    return () => observer.disconnect();
  }, []);
  
  return shifts;
}

// 使用
function App() {
  const shifts = useCLSTracking();
  
  useEffect(() => {
    const totalCLS = shifts.reduce((sum, shift) => sum + shift.value, 0);
    
    if (totalCLS > 0.1) {
      console.warn('CLS threshold exceeded:', totalCLS);
      console.log('Problematic shifts:', shifts);
    }
  }, [shifts]);
  
  return <MyApp />;
}
```

### 4.2 CLS优化策略

```javascript
// 策略1：预留空间
// ❌ 无尺寸图片
<img src="image.jpg" alt="Image" />

// ✅ 指定尺寸
<img src="image.jpg" alt="Image" width="800" height="600" />

// React组件
function ResponsiveImage({ src, alt, aspectRatio = '16/9' }) {
  return (
    <div style={{ aspectRatio, overflow: 'hidden' }}>
      <img 
        src={src} 
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

// 策略2：避免动态内容插入
// ❌ 内容突然插入
function BadDynamicContent() {
  const [banner, setBanner] = useState(null);
  
  useEffect(() => {
    loadBanner().then(setBanner);
  }, []);
  
  return (
    <div>
      {banner && <Banner data={banner} />}  {/* 突然出现 */}
      <MainContent />
    </div>
  );
}

// ✅ 预留空间
function GoodDynamicContent() {
  const [banner, setBanner] = useState(null);
  
  useEffect(() => {
    loadBanner().then(setBanner);
  }, []);
  
  return (
    <div>
      <div style={{ minHeight: '100px' }}>
        {banner ? <Banner data={banner} /> : <BannerPlaceholder />}
      </div>
      <MainContent />
    </div>
  );
}

// 策略3：字体加载优化
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/font.woff2') format('woff2');
  font-display: swap;  // 避免字体加载导致的布局偏移
}

// 策略4：动画使用transform
// ❌ 引起布局变化
.slide-in {
  animation: slide 0.3s;
}

@keyframes slide {
  from { margin-left: -100px; }
  to { margin-left: 0; }
}

// ✅ 使用transform
.slide-in {
  animation: slide 0.3s;
}

@keyframes slide {
  from { transform: translateX(-100px); }
  to { transform: translateX(0); }
}

// 策略5：固定容器尺寸
function FixedContainer({ children }) {
  return (
    <div style={{ 
      minHeight: '500px',  // 固定最小高度
      display: 'flex',
      flexDirection: 'column'
    }}>
      {children}
    </div>
  );
}
```

## 注意事项

### 1. 真实用户监控

```javascript
// RUM (Real User Monitoring)
import { onCLS, onFID, onLCP } from 'web-vitals';

function setupRUM() {
  const vitals = {
    lcp: [],
    fid: [],
    cls: []
  };
  
  onLCP((metric) => {
    vitals.lcp.push(metric.value);
    reportToRUM('LCP', metric);
  });
  
  onFID((metric) => {
    vitals.fid.push(metric.value);
    reportToRUM('FID', metric);
  });
  
  onCLS((metric) => {
    vitals.cls.push(metric.value);
    reportToRUM('CLS', metric);
  });
  
  // 页面卸载时发送
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendBeacon('/rum', JSON.stringify(vitals));
    }
  });
}

function reportToRUM(metric, data) {
  fetch('/api/rum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric,
      value: data.value,
      rating: data.rating,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    }),
    keepalive: true
  });
}
```

### 2. 设备和网络差异

```javascript
// 收集上下文信息
function collectContext(metric) {
  return {
    ...metric,
    context: {
      connection: navigator.connection?.effectiveType,
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }
  };
}

onLCP((metric) => {
  const withContext = collectContext(metric);
  sendToAnalytics(withContext);
});
```

### 3. 归因分析

```javascript
// CLS归因
import { onCLS } from 'web-vitals/attribution';

onCLS((metric) => {
  console.log('CLS:', metric.value);
  console.log('Attribution:', metric.attribution);
  
  // 最大的布局偏移来源
  const largestShift = metric.attribution.largestShiftSource;
  console.log('Largest shift element:', largestShift);
  console.log('Largest shift value:', metric.attribution.largestShiftValue);
});

// LCP归因
import { onLCP } from 'web-vitals/attribution';

onLCP((metric) => {
  console.log('LCP element:', metric.attribution.element);
  console.log('LCP URL:', metric.attribution.url);
  console.log('Time to first byte:', metric.attribution.timeToFirstByte);
  console.log('Resource load duration:', metric.attribution.resourceLoadDuration);
  console.log('Element render delay:', metric.attribution.elementRenderDelay);
});
```

## 常见问题

### Q1: Web Vitals和Lighthouse的区别？

**A:** Lighthouse是实验室数据，Web Vitals是真实用户数据。

### Q2: 如何快速定位CLS问题元素？

**A:** 使用Chrome DevTools的Layout Shift Regions功能。

### Q3: FID和INP有什么区别？

**A:** FID只测量首次交互，INP测量所有交互。

### Q4: 所有用户的指标都一样吗？

**A:** 不一样，受设备、网络、浏览器等影响。

### Q5: 如何设定合理的阈值？

**A:** 参考Google建议：LCP<2.5s，FID<100ms，CLS<0.1。

### Q6: 指标恶化如何排查？

**A:** 对比历史数据，检查最近的代码变更。

### Q7: 第三方脚本影响指标吗？

**A:** 会影响，建议异步加载和监控。

### Q8: 如何优化移动端指标？

**A:** 针对性优化：减少JavaScript、优化图片、使用SSR。

### Q9: Web Vitals影响SEO吗？

**A:** 是的，Google已将其作为排名因素。

### Q10: React 19如何帮助改善指标？

**A:** Server Components、Suspense等特性可优化加载和交互。

## 总结

### 核心指标

```
1. LCP (加载性能)
   目标: ≤2.5s
   优化: 服务器、图片、预加载

2. FID/INP (交互性)
   目标: FID≤100ms，INP≤200ms
   优化: 减少JS、使用transition、Web Worker

3. CLS (视觉稳定性)
   目标: ≤0.1
   优化: 尺寸预留、字体、避免动态插入
```

### 最佳实践

```
1. 监控实施
   ✅ 集成web-vitals库
   ✅ 实时监控RUM数据
   ✅ 设定告警阈值
   ✅ 定期审查趋势

2. 优化策略
   ✅ 针对性优化差项
   ✅ 平衡多个指标
   ✅ A/B测试验证
   ✅ 持续迭代改进

3. 团队协作
   ✅ 共享性能数据
   ✅ 设定性能目标
   ✅ 代码审查关注性能
   ✅ 建立性能文化
```

Web Vitals是衡量用户体验的关键指标，优化这些指标能直接提升用户满意度和业务转化率。

