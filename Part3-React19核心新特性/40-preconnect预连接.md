# preconnect预连接

## 学习目标

通过本章学习，你将掌握：

- preconnect的作用
- TCP/TLS连接过程
- 与prefetchDNS的区别
- 实际应用场景
- 性能提升效果
- 最佳实践
- 资源消耗
- 优化策略

## 第一部分：连接建立过程

### 1.1 完整连接流程

```
用户请求 https://api.example.com/data
    ↓
1. DNS解析 (20-120ms)
   api.example.com → 192.168.1.100
    ↓
2. TCP握手 (20-100ms)
   SYN → SYN-ACK → ACK
    ↓
3. TLS协商 (30-100ms) [HTTPS]
   ClientHello → ServerHello → Certificate → ...
    ↓
4. 发送HTTP请求
    ↓
5. 接收响应
    
总延迟：70-320ms！
```

### 1.2 preconnect优化

```
没有preconnect：
用户操作 → DNS(50ms) → TCP(30ms) → TLS(40ms) → 请求(100ms) = 220ms

有preconnect：
提前建立连接 ← DNS+TCP+TLS在后台完成(120ms)
用户操作 → 请求(100ms) = 100ms

节省：120ms！
```

### 1.3 与prefetchDNS对比

```
prefetchDNS:
- 只解析DNS
- 耗时：20-120ms
- 开销：极小
- 适用：次要域名

preconnect:
- DNS + TCP + TLS
- 耗时：70-320ms
- 开销：占用连接
- 适用：关键域名（2-3个）
```

## 第二部分：preconnect API

### 2.1 基础用法

```jsx
import { preconnect } from 'react-dom';

function CDNResources() {
  // 预连接到CDN
  preconnect('https://cdn.example.com');
  
  // 预连接到API服务器
  preconnect('https://api.example.com');
  
  // 预连接到字体服务
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com');
  
  return <App />;
}

// 生成的HTML：
// <link rel="preconnect" href="https://cdn.example.com">
// <link rel="preconnect" href="https://api.example.com">
// ...
```

### 2.2 跨域预连接

```jsx
import { preconnect } from 'react-dom';

function CrossOriginPreconnect() {
  // 跨域资源需要设置crossOrigin
  preconnect('https://fonts.gstatic.com', {
    crossOrigin: 'anonymous'
  });
  
  preconnect('https://cdn.jsdelivr.net', {
    crossOrigin: 'anonymous'
  });
  
  preconnect('https://api.example.com', {
    crossOrigin: 'use-credentials'
  });
  
  return <App />;
}
```

### 2.3 条件预连接

```jsx
import { preconnect } from 'react-dom';

function ConditionalPreconnect({ features, userType, region }) {
  // 根据功能开关
  if (features.externalAPI) {
    preconnect('https://api.external.com');
  }
  
  if (features.videoStreaming) {
    preconnect('https://video-cdn.example.com');
  }
  
  // 根据用户类型
  if (userType === 'premium') {
    preconnect('https://premium-api.example.com');
  }
  
  // 根据地区
  const cdnMap = {
    'US': 'https://cdn-us.example.com',
    'EU': 'https://cdn-eu.example.com',
    'ASIA': 'https://cdn-asia.example.com'
  };
  
  const cdn = cdnMap[region];
  if (cdn) {
    preconnect(cdn);
  }
  
  return <Dashboard />;
}
```

## 第三部分：实际应用场景

### 3.1 关键API预连接

```jsx
import { preconnect } from 'react-dom';

function APIPreconnect() {
  // 立即预连接主API
  preconnect('https://api.example.com');
  
  // 稍后预连接备用API
  useEffect(() => {
    setTimeout(() => {
      preconnect('https://api-backup.example.com');
    }, 1000);
  }, []);
  
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // API调用将使用已建立的连接
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return <DataView data={data} />;
}
```

### 3.2 字体预连接

```jsx
import { preconnect } from 'react-dom';

function FontPreconnect() {
  // Google Fonts需要两个域名
  preconnect('https://fonts.googleapis.com');
  preconnect('https://fonts.gstatic.com', {
    crossOrigin: 'anonymous'
  });
  
  // 自定义字体CDN
  preconnect('https://fonts-cdn.example.com', {
    crossOrigin: 'anonymous'
  });
  
  return <App />;
}
```

### 3.3 图片CDN预连接

```jsx
import { preconnect } from 'react-dom';

function ImageCDNPreconnect({ images }) {
  // 预连接到图片CDN
  preconnect('https://images.unsplash.com');
  preconnect('https://cdn.pixabay.com');
  
  return (
    <div className="gallery">
      {images.map(img => (
        <img key={img.id} src={img.url} alt={img.title} />
      ))}
    </div>
  );
}
```

### 3.4 支付网关预连接

```jsx
import { preconnect } from 'react-dom';

function CheckoutFlow() {
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    // 步骤1：就开始预连接支付网关
    if (step === 1) {
      preconnect('https://payment.stripe.com');
      preconnect('https://api.paypal.com');
    }
  }, [step]);
  
  return (
    <div className="checkout">
      {step === 1 && <CartReview onNext={() => setStep(2)} />}
      {step === 2 && <ShippingInfo onNext={() => setStep(3)} />}
      {step === 3 && <PaymentInfo />}
    </div>
  );
}
```

### 3.5 路由预连接

```jsx
import { preconnect } from 'react-dom';

function Navigation() {
  const handleMouseEnter = (route) => {
    // 鼠标悬停时预连接该路由需要的域名
    
    switch (route) {
      case '/dashboard':
        preconnect('https://api.example.com');
        break;
        
      case '/analytics':
        preconnect('https://analytics-api.example.com');
        break;
        
      case '/profile':
        preconnect('https://user-api.example.com');
        preconnect('https://avatar-cdn.example.com');
        break;
    }
  };
  
  return (
    <nav>
      <Link 
        href="/dashboard"
        onMouseEnter={() => handleMouseEnter('/dashboard')}
      >
        Dashboard
      </Link>
      
      <Link 
        href="/analytics"
        onMouseEnter={() => handleMouseEnter('/analytics')}
      >
        Analytics
      </Link>
    </nav>
  );
}
```

## 第四部分：性能优化策略

### 4.1 优先级分级

```jsx
import { preconnect, prefetchDNS } from 'react-dom';

function PrioritizedConnections() {
  // 第1级：关键域名 - preconnect (2-3个)
  preconnect('https://api.example.com');
  preconnect('https://cdn.example.com');
  
  // 第2级：重要但非关键 - prefetchDNS
  prefetchDNS('https://fonts.googleapis.com');
  prefetchDNS('https://analytics.example.com');
  
  // 第3级：次要域名 - 延迟prefetchDNS
  useEffect(() => {
    setTimeout(() => {
      prefetchDNS('https://tracking.example.com');
      prefetchDNS('https://social.example.com');
    }, 1000);
  }, []);
  
  return <App />;
}
```

### 4.2 数量限制

```jsx
import { preconnect, prefetchDNS } from 'react-dom';

function LimitedConnections() {
  // ✅ 好的做法：限制preconnect数量（2-3个）
  preconnect('https://api.example.com');
  preconnect('https://cdn.example.com');
  
  // ✅ prefetchDNS可以更多（5-10个）
  prefetchDNS('https://fonts.googleapis.com');
  prefetchDNS('https://analytics.example.com');
  prefetchDNS('https://tracking.example.com');
  prefetchDNS('https://social.example.com');
  
  // ❌ 不好：过多preconnect
  // preconnect('https://domain1.com');
  // preconnect('https://domain2.com');
  // ... 10个以上
  // 问题：
  // - 消耗连接资源
  // - 浏览器有连接数限制
  // - 可能适得其反
  
  return <App />;
}
```

### 4.3 智能连接

```jsx
import { preconnect, prefetchDNS } from 'react-dom';

function SmartConnection() {
  const connection = navigator.connection;
  const effectiveType = connection?.effectiveType;
  const saveData = connection?.saveData;
  
  // 根据网络状况决定策略
  
  if (saveData) {
    // 省流量模式：不预连接
    console.log('Data saver enabled');
    return <LightApp />;
  }
  
  if (effectiveType === '4g') {
    // 4G：积极预连接
    preconnect('https://api.example.com');
    preconnect('https://cdn.example.com');
    preconnect('https://fonts.googleapis.com');
    
  } else if (effectiveType === '3g') {
    // 3G：只连接关键域名
    preconnect('https://api.example.com');
    prefetchDNS('https://cdn.example.com');
    
  } else {
    // 慢速网络：只DNS预解析
    prefetchDNS('https://api.example.com');
    prefetchDNS('https://cdn.example.com');
  }
  
  return <App />;
}
```

### 4.4 延迟连接

```jsx
import { preconnect, prefetchDNS } from 'react-dom';

function DeferredConnection() {
  // 立即：最关键的连接
  preconnect('https://api.example.com');
  
  useEffect(() => {
    // 500ms后：次要连接
    setTimeout(() => {
      preconnect('https://cdn.example.com');
    }, 500);
    
    // 1秒后：DNS预解析
    setTimeout(() => {
      prefetchDNS('https://analytics.example.com');
      prefetchDNS('https://fonts.googleapis.com');
    }, 1000);
    
    // 空闲时：可选连接
    requestIdleCallback(() => {
      prefetchDNS('https://ads.example.com');
      prefetchDNS('https://social.example.com');
    });
  }, []);
  
  return <App />;
}
```

### 4.5 移动端优化

```jsx
import { preconnect, prefetchDNS } from 'react-dom';

function MobileFriendly() {
  const isMobile = /Mobile/.test(navigator.userAgent);
  const isLowPower = navigator.deviceMemory < 4; // 低内存设备
  
  if (isMobile && isLowPower) {
    // 低端移动设备：最小化连接
    preconnect('https://api.example.com');
    prefetchDNS('https://cdn.example.com');
    
  } else if (isMobile) {
    // 一般移动设备：适度连接
    preconnect('https://api.example.com');
    preconnect('https://cdn.example.com');
    
  } else {
    // 桌面端：可以更积极
    preconnect('https://api.example.com');
    preconnect('https://cdn.example.com');
    preconnect('https://fonts.googleapis.com');
    prefetchDNS('https://analytics.example.com');
    prefetchDNS('https://tracking.example.com');
  }
  
  return <App />;
}
```

## 第五部分：测量效果

### 5.1 连接时间测量

```jsx
// 测量连接建立时间
function measureConnectionTime() {
  const resources = performance.getEntriesByType('resource');
  
  resources.forEach(resource => {
    // DNS时间
    const dnsTime = resource.domainLookupEnd - resource.domainLookupStart;
    
    // TCP握手时间
    const tcpTime = resource.connectEnd - resource.connectStart;
    
    // TLS协商时间（HTTPS）
    const tlsTime = resource.secureConnectionStart > 0 
      ? resource.connectEnd - resource.secureConnectionStart 
      : 0;
    
    // 总连接时间
    const totalConnectionTime = resource.connectEnd - resource.domainLookupStart;
    
    if (totalConnectionTime > 0) {
      console.log(`${resource.name}:`, {
        dns: `${dnsTime.toFixed(2)}ms`,
        tcp: `${tcpTime.toFixed(2)}ms`,
        tls: tlsTime > 0 ? `${tlsTime.toFixed(2)}ms` : 'N/A',
        total: `${totalConnectionTime.toFixed(2)}ms`
      });
    }
  });
}

// 使用
function App() {
  useEffect(() => {
    window.addEventListener('load', () => {
      setTimeout(measureConnectionTime, 1000);
    });
  }, []);
  
  return <AppContent />;
}

// 扩展案例：详细的连接性能分析
function DetailedConnectionAnalysis() {
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntriesByType('resource');
      
      const analysis = entries.map(entry => {
        const dns = entry.domainLookupEnd - entry.domainLookupStart;
        const tcp = entry.connectEnd - entry.connectStart;
        const tls = entry.secureConnectionStart > 0 
          ? entry.connectEnd - entry.secureConnectionStart 
          : 0;
        const request = entry.responseStart - entry.requestStart;
        const response = entry.responseEnd - entry.responseStart;
        
        return {
          url: entry.name,
          dns: dns.toFixed(2),
          tcp: (tcp - tls).toFixed(2),
          tls: tls.toFixed(2),
          request: request.toFixed(2),
          response: response.toFixed(2),
          total: entry.duration.toFixed(2),
          wasPreconnected: dns === 0 && tcp === 0
        };
      });
      
      setMetrics(analysis);
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (metrics.length > 0) {
      const preconnectedCount = metrics.filter(m => m.wasPreconnected).length;
      const avgConnectionTime = metrics
        .map(m => parseFloat(m.dns) + parseFloat(m.tcp) + parseFloat(m.tls))
        .filter(t => t > 0)
        .reduce((sum, t, _, arr) => sum + t / arr.length, 0);
      
      console.log('Connection Performance:', {
        total: metrics.length,
        preconnected: preconnectedCount,
        avgConnectionTime: avgConnectionTime.toFixed(2) + 'ms'
      });
    }
  }, [metrics]);
  
  return <App />;
}
```

### 5.2 对比测试

```jsx
// A/B测试preconnect效果
function PreconnectABTest() {
  const [variant, setVariant] = useState(null);
  
  useEffect(() => {
    const testVariant = Math.random() < 0.5 ? 'with-preconnect' : 'without-preconnect';
    setVariant(testVariant);
    
    if (testVariant === 'with-preconnect') {
      // 测试组：使用preconnect
      preconnect('https://api.example.com');
      preconnect('https://cdn.example.com');
    }
    
    trackABTest('preconnect', testVariant);
    
    // 测量第一次API调用时间
    const startTime = performance.now();
    
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 上报性能数据
        reportMetric('api-first-call', duration, testVariant);
      });
  }, []);
  
  return <App />;
}

// 扩展案例：多次测试取平均值
function MultiTestComparison() {
  const [results, setResults] = useState({
    withPreconnect: [],
    withoutPreconnect: []
  });
  
  const runTest = async (usePreconnect) => {
    const testDomain = 'https://test-api.example.com';
    
    if (usePreconnect) {
      preconnect(testDomain);
      await new Promise(r => setTimeout(r, 100)); // 等待连接建立
    }
    
    const startTime = performance.now();
    
    try {
      await fetch(testDomain + '/test');
      const duration = performance.now() - startTime;
      
      setResults(prev => ({
        ...prev,
        [usePreconnect ? 'withPreconnect' : 'withoutPreconnect']: [
          ...prev[usePreconnect ? 'withPreconnect' : 'withoutPreconnect'],
          duration
        ]
      }));
      
      return duration;
    } catch (error) {
      console.error('Test failed:', error);
      return null;
    }
  };
  
  useEffect(() => {
    const runAllTests = async () => {
      for (let i = 0; i < 10; i++) {
        await runTest(true);
        await new Promise(r => setTimeout(r, 500));
        await runTest(false);
        await new Promise(r => setTimeout(r, 500));
      }
    };
    
    runAllTests();
  }, []);
  
  useEffect(() => {
    if (results.withPreconnect.length >= 5 && results.withoutPreconnect.length >= 5) {
      const avgWith = results.withPreconnect.reduce((a, b) => a + b, 0) / results.withPreconnect.length;
      const avgWithout = results.withoutPreconnect.reduce((a, b) => a + b, 0) / results.withoutPreconnect.length;
      const improvement = ((avgWithout - avgWith) / avgWithout * 100).toFixed(2);
      
      console.log('Preconnect Test Results:', {
        withPreconnect: avgWith.toFixed(2) + 'ms',
        withoutPreconnect: avgWithout.toFixed(2) + 'ms',
        improvement: improvement + '%',
        timeSaved: (avgWithout - avgWith).toFixed(2) + 'ms'
      });
    }
  }, [results]);
  
  return <App />;
}
```

### 5.3 实时监控

```jsx
import { preconnect } from 'react-dom';

function ConnectionMonitoring() {
  const [connectionHealth, setConnectionHealth] = useState({});
  
  useEffect(() => {
    const monitoredDomains = [
      'https://api.example.com',
      'https://cdn.example.com'
    ];
    
    // 预连接监控的域名
    monitoredDomains.forEach(domain => {
      preconnect(domain);
    });
    
    // 定期检查连接性能
    const checkInterval = setInterval(() => {
      const resources = performance.getEntriesByType('resource');
      
      const health = {};
      
      monitoredDomains.forEach(domain => {
        const domainResources = resources.filter(r => r.name.includes(domain));
        
        if (domainResources.length > 0) {
          const avgConnection = domainResources
            .map(r => r.connectEnd - r.domainLookupStart)
            .filter(t => t > 0)
            .reduce((a, b, _, arr) => a + b / arr.length, 0);
          
          health[domain] = {
            avgConnectionTime: avgConnection.toFixed(2),
            status: avgConnection < 100 ? 'good' : avgConnection < 200 ? 'fair' : 'poor',
            requestCount: domainResources.length,
            lastCheck: new Date().toISOString()
          };
        }
      });
      
      setConnectionHealth(health);
      
      // 警报机制
      Object.entries(health).forEach(([domain, data]) => {
        if (data.status === 'poor') {
          console.warn(`Connection performance degraded for ${domain}: ${data.avgConnectionTime}ms`);
        }
      });
    }, 60000); // 每分钟检查
    
    return () => clearInterval(checkInterval);
  }, []);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <ConnectionHealthDashboard health={connectionHealth} />
      )}
    </div>
  );
}
```

## 第六部分：高级应用场景

### 6.1 动态连接管理

```jsx
import { preconnect, prefetchDNS } from 'react-dom';

function DynamicConnectionManager() {
  const [activeConnections, setActiveConnections] = useState(new Set());
  const [connectionLimit] = useState(3);
  
  const manageConnection = (domain, priority) => {
    if (priority === 'high' && activeConnections.size < connectionLimit) {
      preconnect(domain);
      setActiveConnections(prev => new Set([...prev, domain]));
    } else if (priority === 'medium') {
      prefetchDNS(domain);
    }
  };
  
  useEffect(() => {
    // 根据优先级动态管理连接
    manageConnection('https://api.example.com', 'high');
    manageConnection('https://cdn.example.com', 'high');
    manageConnection('https://fonts.googleapis.com', 'medium');
    manageConnection('https://analytics.example.com', 'medium');
  }, []);
  
  return <App activeConnections={activeConnections} />;
}
```

### 6.2 地理位置优化连接

```jsx
import { preconnect } from 'react-dom';

function GeoOptimizedConnection() {
  const [userLocation, setUserLocation] = useState(null);
  const [optimalCDN, setOptimalCDN] = useState(null);
  
  useEffect(() => {
    // 获取用户地理位置
    const getLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const location = await response.json();
        setUserLocation(location);
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    };
    
    getLocation();
  }, []);
  
  useEffect(() => {
    if (userLocation) {
      // 根据位置选择最优CDN
      const cdnMap = {
        'NA': 'https://cdn-na.example.com',
        'SA': 'https://cdn-sa.example.com',
        'EU': 'https://cdn-eu.example.com',
        'AS': 'https://cdn-asia.example.com',
        'OC': 'https://cdn-oceania.example.com'
      };
      
      const continent = userLocation.continent_code;
      const cdn = cdnMap[continent] || 'https://cdn-global.example.com';
      
      setOptimalCDN(cdn);
      
      // 预连接到最优CDN
      preconnect(cdn);
      
      // 也预连接全球CDN作为备用
      preconnect('https://cdn-global.example.com');
    }
  }, [userLocation]);
  
  return <App optimalCDN={optimalCDN} />;
}
```

### 6.3 负载均衡连接

```jsx
import { preconnect } from 'react-dom';

function LoadBalancedConnection() {
  const [apiServers] = useState([
    'https://api-1.example.com',
    'https://api-2.example.com',
    'https://api-3.example.com'
  ]);
  const [selectedServer, setSelectedServer] = useState(null);
  
  useEffect(() => {
    // 测试所有服务器的连接时间
    const testServers = async () => {
      const results = await Promise.all(
        apiServers.map(async (server) => {
          const start = performance.now();
          
          try {
            await fetch(server + '/ping');
            const duration = performance.now() - start;
            return { server, duration };
          } catch (error) {
            return { server, duration: Infinity };
          }
        })
      );
      
      // 选择最快的服务器
      const fastest = results.reduce((min, curr) => 
        curr.duration < min.duration ? curr : min
      );
      
      setSelectedServer(fastest.server);
      
      // 预连接到最快的服务器
      preconnect(fastest.server);
      
      // 预连接到次快的作为备用
      const sorted = results.sort((a, b) => a.duration - b.duration);
      if (sorted[1]) {
        setTimeout(() => {
          preconnect(sorted[1].server);
        }, 500);
      }
    };
    
    testServers();
  }, [apiServers]);
  
  return <App apiServer={selectedServer} />;
}
```

### 6.4 WebSocket预连接

```jsx
import { preconnect } from 'react-dom';

function WebSocketPreconnect() {
  const [wsReady, setWsReady] = useState(false);
  
  useEffect(() => {
    // 预连接到WebSocket服务器
    const wsUrl = 'wss://ws.example.com';
    preconnect(wsUrl);
    
    // 稍后建立WebSocket连接
    setTimeout(() => {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsReady(true);
        console.log('WebSocket connected');
      };
      
      ws.onclose = () => {
        setWsReady(false);
        console.log('WebSocket disconnected');
      };
      
      return () => ws.close();
    }, 100);
  }, []);
  
  return <RealtimeApp wsReady={wsReady} />;
}
```

### 6.5 HTTP/2服务器推送协同

```jsx
import { preconnect } from 'react-dom';

function HTTP2PushCoordination() {
  useEffect(() => {
    // 检测HTTP/2支持
    const checkHTTP2 = () => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.nextHopProtocol?.includes('h2')) {
            console.log('HTTP/2 detected');
            
            // HTTP/2服务器：可以更积极地预连接
            preconnect('https://api.example.com');
            preconnect('https://cdn.example.com');
            preconnect('https://assets.example.com');
          } else {
            // HTTP/1.1：更保守
            preconnect('https://api.example.com');
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    };
    
    checkHTTP2();
  }, []);
  
  return <App />;
}
```

### 6.6 Progressive Web App集成

```jsx
import { preconnect } from 'react-dom';

function PWAPreconnect() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swReady, setSwReady] = useState(false);
  
  useEffect(() => {
    // 监听网络状态
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => setSwReady(true));
    }
  }, []);
  
  useEffect(() => {
    if (isOnline && swReady) {
      // 在线且SW就绪时预连接
      preconnect('https://api.example.com');
      preconnect('https://cdn.example.com');
    }
  }, [isOnline, swReady]);
  
  return isOnline ? <OnlineApp /> : <OfflineApp />;
}
```

## 注意事项

### 1. 不要过度使用

```jsx
// ❌ 过度使用preconnect
function Bad() {
  preconnect('https://domain1.com');
  preconnect('https://domain2.com');
  preconnect('https://domain3.com');
  // ... 10个以上
  
  // 问题：
  // - 消耗连接资源
  // - 可能降低性能
  // - 浏览器有连接数限制(通常6个/域名)
}

// ✅ 只连接关键域名
function Good() {
  preconnect('https://api.example.com');  // 关键
  preconnect('https://cdn.example.com');  // 关键
  prefetchDNS('https://other.com');  // 次要，只DNS
}
```

### 2. 跨域配置

```jsx
// ✅ 正确配置crossOrigin
preconnect('https://fonts.gstatic.com', {
  crossOrigin: 'anonymous'  // 必须设置
});

preconnect('https://api.example.com', {
  crossOrigin: 'use-credentials'  // 需要凭证时
});
```

### 3. 连接保持时间

```
浏览器会保持preconnect连接一段时间：
- Chrome: ~10秒
- Firefox: ~10秒
- Safari: ~10秒

超时后连接会关闭，需要重新建立
所以：在用户操作前10秒内preconnect
```

## 常见问题

### Q1: preconnect和prefetchDNS应该用哪个？

**A:** preconnect用于马上要用的关键域名（2-3个），prefetchDNS用于可能用到的域名（5-10个）。

**详细选择指南：**
```jsx
// 场景1：用户即将访问的资源
function OnUserAction() {
  const handleClick = () => {
    // 确定会访问 -> preconnect
    preconnect('https://api.example.com');
    // 200ms后发起请求
    setTimeout(() => {
      fetch('https://api.example.com/data');
    }, 200);
  };
  
  const handleHover = () => {
    // 可能访问 -> prefetchDNS
    prefetchDNS('https://optional-api.com');
  };
  
  return <button onClick={handleClick} onMouseEnter={handleHover}>操作</button>;
}

// 场景2：根据优先级选择
function PriorityBasedPreconnect() {
  useEffect(() => {
    // 第1优先级：关键API（必定使用）
    preconnect('https://core-api.example.com');
    
    // 第2优先级：重要资源（大概率使用）
    preconnect('https://cdn.example.com');
    
    // 第3优先级：次要资源（可能使用）
    prefetchDNS('https://analytics.example.com');
    prefetchDNS('https://ads.example.com');
    
    // 第4优先级：低优先级资源（延迟预解析）
    setTimeout(() => {
      prefetchDNS('https://tracking.example.com');
    }, 3000);
  }, []);
}

// 场景3：资源类型决定
function ResourceTypeStrategy() {
  useEffect(() => {
    // 字体文件：必定使用 -> preconnect
    preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' });
    
    // 图片CDN：页面已显示 -> preconnect
    preconnect('https://images.example.com');
    
    // 分析服务：异步加载 -> prefetchDNS
    prefetchDNS('https://analytics.google.com');
    
    // 社交分享：用户操作触发 -> prefetchDNS
    prefetchDNS('https://platform.twitter.com');
  }, []);
}
```

### Q2: preconnect会消耗很多资源吗？

**A:** 会占用连接，所以不要过度使用。每个域名消耗1个连接。

**详细资源消耗分析：**
```jsx
// 资源消耗监控
function ConnectionResourceMonitor() {
  const [resourceUsage, setResourceUsage] = useState({
    connections: 0,
    bandwidth: 0,
    memory: 0
  });
  
  useEffect(() => {
    const domains = [
      'https://api.example.com',
      'https://cdn.example.com',
      'https://fonts.gstatic.com'
    ];
    
    // 预连接前记录
    const beforeConnections = performance.getEntriesByType('resource').length;
    
    // 执行预连接
    domains.forEach(domain => preconnect(domain));
    
    // 预连接后检查
    setTimeout(() => {
      const afterConnections = performance.getEntriesByType('resource').length;
      const newConnections = afterConnections - beforeConnections;
      
      setResourceUsage({
        connections: newConnections,
        bandwidth: estimateBandwidthUsage(domains), // 自定义函数
        memory: estimateMemoryUsage(domains) // 自定义函数
      });
      
      console.log('预连接资源消耗:', {
        新增连接: newConnections,
        带宽消耗: resourceUsage.bandwidth + 'KB',
        内存消耗: resourceUsage.memory + 'KB'
      });
    }, 1000);
  }, []);
  
  return <App />;
}

// 连接数限制检查
function ConnectionLimitChecker() {
  const [connectionStatus, setConnectionStatus] = useState({
    active: 0,
    limit: 6, // Chrome默认限制
    available: 6
  });
  
  const safePreconnect = (domain) => {
    if (connectionStatus.available > 0) {
      preconnect(domain);
      setConnectionStatus(prev => ({
        ...prev,
        active: prev.active + 1,
        available: prev.available - 1
      }));
    } else {
      console.warn('连接数已达上限，使用prefetchDNS替代');
      prefetchDNS(domain);
    }
  };
  
  useEffect(() => {
    safePreconnect('https://api.example.com');
    safePreconnect('https://cdn.example.com');
  }, []);
  
  return <App />;
}
```

### Q3: 所有浏览器都支持吗？

**A:** 现代浏览器都支持，旧浏览器会忽略。

**浏览器兼容性详情：**
```jsx
// 浏览器支持检测
function BrowserSupportCheck() {
  const [support, setSupport] = useState({
    preconnect: false,
    prefetchDNS: false
  });
  
  useEffect(() => {
    // 检测preconnect支持
    const supportsPreconnect = 'preconnect' in document.createElement('link').relList;
    
    // 检测prefetchDNS支持
    const supportsPrefetchDNS = 'dns-prefetch' in document.createElement('link').relList;
    
    setSupport({
      preconnect: supportsPreconnect,
      prefetchDNS: supportsPrefetchDNS
    });
    
    console.log('浏览器支持:', {
      preconnect: supportsPreconnect ? '✅ 支持' : '❌ 不支持',
      prefetchDNS: supportsPrefetchDNS ? '✅ 支持' : '❌ 不支持'
    });
  }, []);
  
  // 降级策略
  const safePreconnect = (domain, options) => {
    if (support.preconnect) {
      preconnect(domain, options);
    } else if (support.prefetchDNS) {
      prefetchDNS(domain);
    } else {
      console.warn('浏览器不支持预连接，将正常加载');
    }
  };
  
  return <App preconnectFn={safePreconnect} />;
}

// 浏览器兼容性表
/*
Chrome:  46+ ✅
Firefox: 39+ ✅
Safari:  11.1+ ✅
Edge:    79+ ✅
IE:      不支持 ❌
Opera:   33+ ✅

移动端：
iOS Safari: 11.3+ ✅
Chrome Android: 46+ ✅
Firefox Android: 39+ ✅
*/
```

### Q4: 如何测试preconnect效果？

**A:** 使用Chrome DevTools的Network面板，观察连接时机和耗时。

**详细测试方法：**
```jsx
// 方法1：自动化性能测试
function AutomatedPerformanceTest() {
  const [testResults, setTestResults] = useState([]);
  
  const runTest = async (scenario) => {
    const results = [];
    
    // 测试组：使用preconnect
    for (let i = 0; i < 5; i++) {
      preconnect('https://api.example.com');
      await new Promise(r => setTimeout(r, 100));
      
      const start = performance.now();
      await fetch('https://api.example.com/test');
      const duration = performance.now() - start;
      
      results.push({ type: 'with-preconnect', duration });
      await new Promise(r => setTimeout(r, 500));
    }
    
    // 对照组：不使用preconnect
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await fetch('https://api.example.com/test');
      const duration = performance.now() - start;
      
      results.push({ type: 'without-preconnect', duration });
      await new Promise(r => setTimeout(r, 500));
    }
    
    return results;
  };
  
  useEffect(() => {
    runTest().then(results => {
      const withPreconnect = results
        .filter(r => r.type === 'with-preconnect')
        .map(r => r.duration);
      const withoutPreconnect = results
        .filter(r => r.type === 'without-preconnect')
        .map(r => r.duration);
      
      const avgWith = withPreconnect.reduce((a, b) => a + b, 0) / withPreconnect.length;
      const avgWithout = withoutPreconnect.reduce((a, b) => a + b, 0) / withoutPreconnect.length;
      
      setTestResults({
        avgWith: avgWith.toFixed(2),
        avgWithout: avgWithout.toFixed(2),
        improvement: ((avgWithout - avgWith) / avgWithout * 100).toFixed(1),
        timeSaved: (avgWithout - avgWith).toFixed(2)
      });
      
      console.log('测试结果:', testResults);
    });
  }, []);
  
  return <App />;
}

// 方法2：可视化连接时间轴
function ConnectionTimeline() {
  const [timeline, setTimeline] = useState([]);
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      const timelineData = entries.map(entry => ({
        url: entry.name,
        startTime: entry.startTime,
        dnsStart: entry.domainLookupStart,
        dnsEnd: entry.domainLookupEnd,
        tcpStart: entry.connectStart,
        tcpEnd: entry.connectEnd,
        tlsStart: entry.secureConnectionStart,
        requestStart: entry.requestStart,
        responseStart: entry.responseStart,
        responseEnd: entry.responseEnd
      }));
      
      setTimeline(timelineData);
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#f0f0f0', padding: 10 }}>
          <h4>连接时间轴</h4>
          {timeline.slice(0, 3).map((item, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 5 }}>
              <div>{item.url}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <span>DNS: {(item.dnsEnd - item.dnsStart).toFixed(0)}ms</span>
                <span>TCP: {(item.tcpEnd - item.tcpStart).toFixed(0)}ms</span>
                <span>请求: {(item.responseStart - item.requestStart).toFixed(0)}ms</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 方法3：Chrome DevTools集成
function DevToolsHelper() {
  useEffect(() => {
    // 添加调试标记
    window.__PRECONNECT_DEBUG__ = {
      domains: [],
      timings: {}
    };
    
    const originalPreconnect = window.preconnect;
    window.preconnect = (domain, options) => {
      window.__PRECONNECT_DEBUG__.domains.push({
        domain,
        timestamp: Date.now(),
        options
      });
      
      return originalPreconnect(domain, options);
    };
    
    // 在控制台显示调试信息
    console.table(window.__PRECONNECT_DEBUG__.domains);
  }, []);
  
  return <App />;
}
```

### Q5: preconnect在移动设备上效果如何？

**A:** 移动设备网络延迟更高，preconnect效果更明显，但要控制数量以节省电量和流量。

```jsx
// 移动端优化策略
function MobileOptimizedPreconnect() {
  const [isMobile, setIsMobile] = useState(false);
  const [networkType, setNetworkType] = useState('4g');
  
  useEffect(() => {
    setIsMobile(/Mobile|Android|iPhone/i.test(navigator.userAgent));
    setNetworkType(navigator.connection?.effectiveType || '4g');
  }, []);
  
  useEffect(() => {
    if (isMobile) {
      if (networkType === '4g' || networkType === '5g') {
        // 快速网络：适度预连接
        preconnect('https://api.example.com');
        preconnect('https://cdn.example.com');
      } else if (networkType === '3g') {
        // 中速网络：只连接关键域名
        preconnect('https://api.example.com');
        prefetchDNS('https://cdn.example.com');
      } else {
        // 慢速网络：只DNS预解析
        prefetchDNS('https://api.example.com');
        prefetchDNS('https://cdn.example.com');
      }
    } else {
      // 桌面端：更积极的预连接
      preconnect('https://api.example.com');
      preconnect('https://cdn.example.com');
      preconnect('https://assets.example.com');
    }
  }, [isMobile, networkType]);
  
  return <App />;
}
```

### Q6: preconnect连接会保持多久？

**A:** 浏览器通常保持预连接10秒左右，超时后会关闭连接。

```jsx
// 连接保活策略
function ConnectionKeepAlive() {
  const [lastPreconnectTime, setLastPreconnectTime] = useState({});
  
  const smartPreconnect = (domain) => {
    const now = Date.now();
    const lastTime = lastPreconnectTime[domain] || 0;
    const elapsed = now - lastTime;
    
    // 如果距离上次预连接超过8秒，重新预连接
    if (elapsed > 8000) {
      preconnect(domain);
      setLastPreconnectTime(prev => ({ ...prev, [domain]: now }));
      console.log(`预连接到 ${domain}，有效期约10秒`);
    } else {
      console.log(`连接仍然有效（已过${(elapsed/1000).toFixed(1)}秒）`);
    }
  };
  
  useEffect(() => {
    // 初始预连接
    smartPreconnect('https://api.example.com');
    
    // 定期检查并刷新连接
    const interval = setInterval(() => {
      smartPreconnect('https://api.example.com');
    }, 9000); // 每9秒刷新
    
    return () => clearInterval(interval);
  }, []);
  
  return <App />;
}
```

### Q7: 如何处理preconnect失败？

**A:** preconnect不会抛出错误，失败时会回退到正常连接。

```jsx
// 预连接失败处理
function PreconnectWithFallback() {
  const [connectionStatus, setConnectionStatus] = useState({});
  
  const preconnectWithTracking = async (domain) => {
    const startTime = performance.now();
    
    try {
      preconnect(domain);
      
      // 检查连接是否成功
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        const connected = resources.some(r => 
          r.name.includes(domain) && 
          r.connectEnd - r.connectStart === 0
        );
        
        setConnectionStatus(prev => ({
          ...prev,
          [domain]: {
            status: connected ? 'success' : 'fallback',
            duration: performance.now() - startTime
          }
        }));
        
        if (!connected) {
          console.warn(`预连接失败，将使用正常连接: ${domain}`);
        }
      }, 1000);
    } catch (error) {
      console.error('预连接错误:', error);
      setConnectionStatus(prev => ({
        ...prev,
        [domain]: { status: 'error', error: error.message }
      }));
    }
  };
  
  useEffect(() => {
    preconnectWithTracking('https://api.example.com');
  }, []);
  
  return <App />;
}
```

### Q8: preconnect对SEO有影响吗？

**A:** preconnect本身不影响SEO，但通过加快页面加载速度可以间接提升SEO得分。

```jsx
// SEO友好的预连接策略
function SEOFriendlyPreconnect() {
  useEffect(() => {
    // 预连接关键资源，加快首屏加载
    preconnect('https://cdn.example.com'); // 首屏图片
    preconnect('https://fonts.googleapis.com'); // Web字体
    
    // 改善Core Web Vitals指标
    // - LCP (Largest Contentful Paint): 通过预连接CDN加快主图加载
    // - FID (First Input Delay): 预连接API加快交互响应
    // - CLS (Cumulative Layout Shift): 预加载字体减少布局偏移
    
    // 监控性能指标
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'largest-contentful-paint') {
          console.log('LCP:', entry.renderTime || entry.loadTime);
          // 上报到分析服务
          reportWebVitals('LCP', entry.renderTime || entry.loadTime);
        }
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    return () => observer.disconnect();
  }, []);
  
  return <App />;
}
```

### Q9: 如何在Next.js中使用preconnect？

**A:** Next.js 13+内置支持React 19的preconnect API。

```jsx
// Next.js App Router中使用
import { preconnect } from 'react-dom';

export default function RootLayout({ children }) {
  // 在布局组件中预连接
  preconnect('https://api.example.com');
  preconnect('https://fonts.googleapis.com', { crossOrigin: 'anonymous' });
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// 页面级预连接
'use client';
import { preconnect } from 'react-dom';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    preconnect('https://api.example.com');
  }, []);
  
  return <div>Page Content</div>;
}

// 结合Next.js的数据获取
export default async function ServerPage() {
  // 服务端组件中也可以使用
  preconnect('https://api.example.com');
  
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  
  return <div>{data.title}</div>;
}
```

### Q10: preconnect和HTTP/2 Server Push有什么区别？

**A:** preconnect是客户端发起的连接预建立，Server Push是服务端主动推送资源。两者可以配合使用。

```jsx
// HTTP/2 Server Push协同
function ServerPushCoordination() {
  useEffect(() => {
    // 检测HTTP/2支持
    const resources = performance.getEntriesByType('resource');
    const http2Supported = resources.some(r => r.nextHopProtocol?.includes('h2'));
    
    if (http2Supported) {
      console.log('HTTP/2支持，Server可能会Push资源');
      
      // 预连接其他未被Push的域名
      preconnect('https://third-party-api.com');
    } else {
      // HTTP/1.1，更依赖preconnect
      preconnect('https://api.example.com');
      preconnect('https://cdn.example.com');
    }
  }, []);
  
  return <App />;
}
```

## 总结

### preconnect优势

```
✅ 提前建立完整连接
✅ 节省70-320ms
✅ DNS + TCP + TLS
✅ 适用HTTPS
✅ 简洁易用
✅ 支持SSR
```

### 使用场景

```
✅ 关键API服务器
✅ 主CDN域名
✅ 字体服务
✅ 支付网关
✅ 图片CDN
✅ 视频流服务
```

### 与其他优化技术对比

**preconnect vs prefetchDNS**
- preconnect：完整连接（DNS + TCP + TLS），节省100-300ms，适合确定使用的关键资源
- prefetchDNS：仅DNS解析，节省20-100ms，适合可能使用的次要资源

**preconnect vs preload**
- preconnect：建立连接但不下载资源，为后续请求做准备
- preload：建立连接并下载资源，适合立即需要的资源

**preconnect vs HTTP/2 Server Push**
- preconnect：客户端主动发起，适用于第三方域名
- Server Push：服务端主动推送，仅适用于同源资源

### 选择策略

```
关键且马上用：preconnect (2-3个)
次要或可能用：prefetchDNS (5-10个)
根据网络调整：智能选择
移动端更谨慎：减少连接
```

### 实施策略

```jsx
// 完整的预连接策略
function ComprehensivePreconnectStrategy() {
  const [deviceType, setDeviceType] = useState('desktop');
  const [networkSpeed, setNetworkSpeed] = useState('fast');
  
  useEffect(() => {
    // 检测设备和网络
    const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
    const connection = navigator.connection;
    const effectiveType = connection?.effectiveType || '4g';
    
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    setNetworkSpeed(['4g', '5g'].includes(effectiveType) ? 'fast' : 'slow');
  }, []);
  
  useEffect(() => {
    // 第1层：关键资源（始终预连接）
    preconnect('https://api.example.com');
    
    if (deviceType === 'desktop' || networkSpeed === 'fast') {
      // 第2层：重要资源（桌面或快速网络）
      preconnect('https://cdn.example.com');
      
      if (deviceType === 'desktop') {
        // 第3层：次要资源（仅桌面）
        preconnect('https://fonts.googleapis.com', { crossOrigin: 'anonymous' });
      }
    }
    
    // 第4层：可选资源（DNS预解析）
    if (networkSpeed === 'fast') {
      prefetchDNS('https://analytics.example.com');
      prefetchDNS('https://social.example.com');
    }
    
    // 第5层：延迟预连接（用户交互后）
    const handleUserInteraction = () => {
      preconnect('https://payment.example.com');
    };
    
    document.addEventListener('click', handleUserInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [deviceType, networkSpeed]);
  
  return <App />;
}
```

### 最佳实践

```
✅ 只连接关键域名
✅ 限制preconnect数量（2-3个）
✅ 多用prefetchDNS
✅ 考虑网络状况
✅ 延迟非关键连接
✅ 测试性能改进
✅ 正确配置crossOrigin
✅ 移动端更保守
```

### 数量建议

```
桌面端：
- preconnect: 2-3个
- prefetchDNS: 5-10个

移动端：
- preconnect: 1-2个
- prefetchDNS: 3-5个
```

### 性能预期

**不同场景的性能提升：**

1. **快速网络（光纤/5G）**
   - DNS: 10-30ms
   - TCP: 10-30ms
   - TLS: 30-80ms
   - 总节省: 50-140ms

2. **中速网络（4G）**
   - DNS: 30-80ms
   - TCP: 30-80ms
   - TLS: 60-150ms
   - 总节省: 120-310ms

3. **慢速网络（3G）**
   - DNS: 100-300ms
   - TCP: 100-300ms
   - TLS: 150-400ms
   - 总节省: 350-1000ms

### 常见错误及解决方案

```jsx
// ❌ 错误1：过度使用
function Bad1() {
  for (let i = 0; i < 20; i++) {
    preconnect(`https://api${i}.example.com`);
  }
}

// ✅ 正确：只连接关键域名
function Good1() {
  preconnect('https://api.example.com');
  preconnect('https://cdn.example.com');
  // 其他使用prefetchDNS
  prefetchDNS('https://analytics.example.com');
}

// ❌ 错误2：忽略crossOrigin
function Bad2() {
  preconnect('https://fonts.gstatic.com'); // 字体加载会失败
}

// ✅ 正确：设置crossOrigin
function Good2() {
  preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' });
}

// ❌ 错误3：预连接后立即请求
function Bad3() {
  preconnect('https://api.example.com');
  fetch('https://api.example.com/data'); // 来不及建立连接
}

// ✅ 正确：给足够时间建立连接
function Good3() {
  useEffect(() => {
    preconnect('https://api.example.com');
  }, []);
  
  const fetchData = async () => {
    await new Promise(r => setTimeout(r, 100)); // 等待连接建立
    const res = await fetch('https://api.example.com/data');
    return res.json();
  };
}

// ❌ 错误4：忽略移动设备
function Bad4() {
  // 所有设备相同策略
  preconnect('https://api1.example.com');
  preconnect('https://api2.example.com');
  preconnect('https://api3.example.com');
}

// ✅ 正确：根据设备调整
function Good4() {
  const isMobile = /Mobile/i.test(navigator.userAgent);
  
  if (isMobile) {
    preconnect('https://api.example.com'); // 仅关键API
  } else {
    preconnect('https://api.example.com');
    preconnect('https://cdn.example.com');
  }
}
```

### 监控和优化

```jsx
// 完整的监控方案
function PreconnectMonitoring() {
  const [metrics, setMetrics] = useState({
    preconnectedDomains: [],
    connectionTimes: {},
    failedConnections: [],
    performanceGain: 0
  });
  
  useEffect(() => {
    const monitorPreconnect = () => {
      const resources = performance.getEntriesByType('resource');
      const preconnected = [];
      const times = {};
      const failed = [];
      
      resources.forEach(resource => {
        const domain = new URL(resource.name).origin;
        const connectionTime = resource.connectEnd - resource.domainLookupStart;
        
        if (connectionTime === 0) {
          preconnected.push(domain);
        } else if (connectionTime > 0) {
          times[domain] = connectionTime.toFixed(2);
        } else {
          failed.push(domain);
        }
      });
      
      // 计算性能提升
      const avgConnectionTime = Object.values(times)
        .map(parseFloat)
        .reduce((sum, time, _, arr) => sum + time / arr.length, 0);
      
      const estimatedGain = preconnected.length * avgConnectionTime;
      
      setMetrics({
        preconnectedDomains: preconnected,
        connectionTimes: times,
        failedConnections: failed,
        performanceGain: estimatedGain.toFixed(2)
      });
      
      // 上报到分析服务
      reportAnalytics('preconnect-performance', {
        preconnected: preconnected.length,
        avgConnectionTime: avgConnectionTime.toFixed(2),
        estimatedGain: estimatedGain.toFixed(2)
      });
    };
    
    // 页面加载后监控
    window.addEventListener('load', () => {
      setTimeout(monitorPreconnect, 2000);
    });
    
    return () => {
      window.removeEventListener('load', monitorPreconnect);
    };
  }, []);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: 15,
          fontSize: 12,
          maxWidth: 300
        }}>
          <h4>预连接性能</h4>
          <p>预连接域名: {metrics.preconnectedDomains.length}</p>
          <p>性能提升: ~{metrics.performanceGain}ms</p>
          <details>
            <summary>详细信息</summary>
            <div>
              <p>已预连接:</p>
              <ul>
                {metrics.preconnectedDomains.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
```

### 调试技巧

```jsx
// 调试工具函数
function debugPreconnect() {
  const resources = performance.getEntriesByType('resource');
  
  console.group('Preconnect Debug Info');
  
  resources.forEach(resource => {
    const url = new URL(resource.name);
    const dns = resource.domainLookupEnd - resource.domainLookupStart;
    const tcp = resource.connectEnd - resource.connectStart;
    const tls = resource.secureConnectionStart > 0 
      ? resource.connectEnd - resource.secureConnectionStart 
      : 0;
    
    const wasPreconnected = dns === 0 && tcp === 0;
    
    console.log(`${wasPreconnected ? '✅' : '❌'} ${url.origin}`, {
      url: resource.name,
      dns: dns.toFixed(2) + 'ms',
      tcp: (tcp - tls).toFixed(2) + 'ms',
      tls: tls.toFixed(2) + 'ms',
      total: (dns + tcp).toFixed(2) + 'ms',
      preconnected: wasPreconnected
    });
  });
  
  console.groupEnd();
}

// 在控制台调用：
// debugPreconnect()
```

### 迁移指南

如果你正在从旧的资源提示方式迁移到React 19的preconnect：

```jsx
// 旧方式：HTML link标签
<link rel="preconnect" href="https://api.example.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />

// 新方式：React 19 API
import { preconnect } from 'react-dom';

function App() {
  preconnect('https://api.example.com');
  preconnect('https://fonts.googleapis.com', { crossOrigin: 'anonymous' });
  
  return <div>App</div>;
}

// 迁移优势：
// 1. 动态控制：可以根据条件预连接
// 2. 类型安全：TypeScript支持
// 3. 更好的错误处理
// 4. 与React生命周期集成
```

### 未来展望

React 19的preconnect API为性能优化提供了强大工具，未来可能的改进方向：

1. **智能预连接**：基于机器学习的自动预连接
2. **优先级控制**：更精细的连接优先级调整
3. **连接池管理**：自动管理连接池大小
4. **性能预算**：集成性能预算机制
5. **实时监控**：内置性能监控仪表板

### 核心要点

1. **preconnect建立完整连接**（DNS + TCP + TLS），适合确定使用的关键资源
2. **限制数量**：桌面端2-3个，移动端1-2个
3. **配合prefetchDNS**：对次要资源使用DNS预解析
4. **正确配置crossOrigin**：字体和跨域资源必须设置
5. **考虑设备和网络**：移动端和慢速网络更保守
6. **给足够时间**：预连接后等待100-200ms再请求
7. **监控效果**：使用Performance API验证性能提升
8. **避免过度使用**：每个连接消耗资源，控制数量

合理使用preconnect能显著减少连接延迟，提升用户体验！
