# prefetchDNS-DNS预解析

## 学习目标

通过本章学习，你将掌握：

- DNS解析过程
- prefetchDNS的作用
- DNS预解析原理
- 实际应用场景
- 性能提升效果
- 最佳实践
- 与preconnect对比
- 优化策略

## 第一部分：DNS解析基础

### 1.1 DNS解析流程

```
用户访问 https://api.example.com
    ↓
1. 浏览器检查本地缓存
    ↓ (缓存未命中)
2. 查询操作系统DNS缓存
    ↓ (缓存未命中)
3. 查询路由器缓存
    ↓ (缓存未命中)
4. 查询ISP DNS服务器
    ↓
5. 递归查询根服务器
    ↓
6. 查询.com顶级域服务器
    ↓
7. 查询example.com权威服务器
    ↓
8. 返回IP地址
    ↓
总耗时：20-120ms！
```

### 1.2 DNS延迟影响

```
没有DNS预解析：
用户点击 → DNS查询(50ms) → TCP连接(30ms) → 请求(100ms) = 180ms

有DNS预解析：
提前DNS查询(50ms) ← 在后台进行
用户点击 → TCP连接(30ms) → 请求(100ms) = 130ms

节省：50ms！
```

### 1.3 传统方案

```html
<!-- ❌ HTML中的link标签 -->
<head>
  <link rel="dns-prefetch" href="https://api.example.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
</head>

<!-- 问题：
- 静态定义
- 不能条件加载
- 与组件分离
-->
```

## 第二部分：prefetchDNS API

### 2.1 基础用法

```jsx
import { prefetchDNS } from 'react-dom';

function ExternalAPIs() {
  // 预解析API域名
  prefetchDNS('https://api.example.com');
  
  // 预解析CDN域名
  prefetchDNS('https://cdn.example.com');
  
  // 预解析第三方服务
  prefetchDNS('https://analytics.google.com');
  
  return <App />;
}

// 生成的HTML：
// <link rel="dns-prefetch" href="https://api.example.com">
// <link rel="dns-prefetch" href="https://cdn.example.com">
// <link rel="dns-prefetch" href="https://analytics.google.com">
```

### 2.2 条件DNS预解析

```jsx
import { prefetchDNS } from 'react-dom';

function ConditionalDNS({ features, region, userType }) {
  // 根据功能开关
  if (features.externalAPI) {
    prefetchDNS('https://api.external.com');
  }
  
  if (features.maps) {
    prefetchDNS('https://maps.googleapis.com');
  }
  
  // 根据用户地区
  if (region === 'US') {
    prefetchDNS('https://cdn-us.example.com');
  } else if (region === 'EU') {
    prefetchDNS('https://cdn-eu.example.com');
  } else if (region === 'ASIA') {
    prefetchDNS('https://cdn-asia.example.com');
  }
  
  // 根据用户类型
  if (userType === 'premium') {
    prefetchDNS('https://premium-api.example.com');
  }
  
  return <Dashboard />;
}
```

### 2.3 批量DNS预解析

```jsx
import { prefetchDNS } from 'react-dom';

function BatchDNSPrefetch() {
  // 第三方服务域名列表
  const thirdPartyDomains = [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://connect.facebook.net',
    'https://platform.twitter.com',
    'https://static.addtoany.com',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  // 批量预解析
  thirdPartyDomains.forEach(domain => {
    prefetchDNS(domain);
  });
  
  return <App />;
}
```

## 第三部分：实际应用场景

### 3.1 第三方服务

```jsx
import { prefetchDNS } from 'react-dom';

function ThirdPartyServices() {
  // 分析服务
  prefetchDNS('https://www.google-analytics.com');
  prefetchDNS('https://www.googletagmanager.com');
  
  // 社交媒体
  prefetchDNS('https://connect.facebook.net');
  prefetchDNS('https://platform.twitter.com');
  prefetchDNS('https://www.linkedin.com');
  
  // 广告服务
  prefetchDNS('https://googleads.g.doubleclick.net');
  prefetchDNS('https://adservice.google.com');
  
  // CDN服务
  prefetchDNS('https://cdn.jsdelivr.net');
  prefetchDNS('https://unpkg.com');
  
  return <App />;
}
```

### 3.2 API服务

```jsx
import { prefetchDNS } from 'react-dom';

function APIServices({ userRole }) {
  // 主API服务器
  prefetchDNS('https://api.example.com');
  
  // 备用API服务器
  prefetchDNS('https://api-backup.example.com');
  
  // 根据角色预解析
  if (userRole === 'admin') {
    prefetchDNS('https://admin-api.example.com');
  }
  
  if (userRole === 'developer') {
    prefetchDNS('https://dev-api.example.com');
  }
  
  return <Dashboard />;
}
```

### 3.3 多CDN策略

```jsx
import { prefetchDNS } from 'react-dom';

function MultiCDN() {
  const [region, setRegion] = useState(null);
  
  useEffect(() => {
    // 获取用户地理位置
    getUserLocation().then(location => {
      setRegion(location.region);
      
      // 根据位置预解析最近的CDN
      const cdnMap = {
        'NA': 'https://cdn-na.example.com',
        'SA': 'https://cdn-sa.example.com',
        'EU': 'https://cdn-eu.example.com',
        'ASIA': 'https://cdn-asia.example.com',
        'OCEANIA': 'https://cdn-oc.example.com'
      };
      
      const cdn = cdnMap[location.region];
      if (cdn) {
        prefetchDNS(cdn);
      }
      
      // 也预解析备用CDN
      prefetchDNS('https://cdn-global.example.com');
    });
  }, []);
  
  return <App />;
}
```

### 3.4 路由预解析

```jsx
import { prefetchDNS } from 'react-dom';

function Navigation() {
  const handleMouseEnter = (route) => {
    // 鼠标悬停时预解析该路由需要的域名
    
    switch (route) {
      case '/products':
        prefetchDNS('https://products-api.example.com');
        prefetchDNS('https://product-images.example.com');
        break;
        
      case '/analytics':
        prefetchDNS('https://analytics-api.example.com');
        prefetchDNS('https://charts-cdn.example.com');
        break;
        
      case '/profile':
        prefetchDNS('https://user-api.example.com');
        prefetchDNS('https://avatar-cdn.example.com');
        break;
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
        href="/analytics"
        onMouseEnter={() => handleMouseEnter('/analytics')}
      >
        Analytics
      </Link>
      
      <Link 
        href="/profile"
        onMouseEnter={() => handleMouseEnter('/profile')}
      >
        Profile
      </Link>
    </nav>
  );
}
```

### 3.5 延迟DNS预解析

```jsx
import { prefetchDNS } from 'react-dom';

function DeferredDNS() {
  useEffect(() => {
    // 立即：关键服务
    prefetchDNS('https://api.example.com');
    prefetchDNS('https://cdn.example.com');
    
    // 1秒后：次要服务
    setTimeout(() => {
      prefetchDNS('https://analytics.example.com');
      prefetchDNS('https://tracking.example.com');
    }, 1000);
    
    // 空闲时：可选服务
    requestIdleCallback(() => {
      prefetchDNS('https://social.example.com');
      prefetchDNS('https://ads.example.com');
      prefetchDNS('https://feedback.example.com');
    });
  }, []);
  
  return <App />;
}
```

## 第四部分：性能优化

### 4.1 优先级分级

```jsx
import { prefetchDNS } from 'react-dom';

function PrioritizedDNS() {
  // 第1级：立即预解析（马上要用）
  prefetchDNS('https://api.example.com');
  prefetchDNS('https://cdn.example.com');
  
  useEffect(() => {
    // 第2级：稍后预解析（可能会用）
    setTimeout(() => {
      prefetchDNS('https://images.example.com');
      prefetchDNS('https://fonts.example.com');
    }, 500);
    
    // 第3级：延迟预解析（低优先级）
    setTimeout(() => {
      prefetchDNS('https://analytics.example.com');
      prefetchDNS('https://tracking.example.com');
    }, 2000);
    
    // 第4级：空闲时预解析（可选）
    requestIdleCallback(() => {
      prefetchDNS('https://social-share.example.com');
      prefetchDNS('https://comments.example.com');
    });
  }, []);
  
  return <App />;
}
```

### 4.2 智能DNS预解析

```jsx
import { prefetchDNS } from 'react-dom';

function SmartDNS() {
  const [network, setNetwork] = useState('4g');
  
  useEffect(() => {
    // 检测网络状况
    if (navigator.connection) {
      setNetwork(navigator.connection.effectiveType);
    }
  }, []);
  
  useEffect(() => {
    // 根据网络状况调整策略
    
    if (network === '4g' || network === 'wifi') {
      // 快速网络：预解析所有域名
      prefetchDNS('https://api.example.com');
      prefetchDNS('https://cdn.example.com');
      prefetchDNS('https://images.example.com');
      prefetchDNS('https://analytics.example.com');
      prefetchDNS('https://social.example.com');
      
    } else if (network === '3g') {
      // 3G网络：只预解析关键域名
      prefetchDNS('https://api.example.com');
      prefetchDNS('https://cdn.example.com');
      
    } else {
      // 慢速网络：只预解析最关键的
      prefetchDNS('https://api.example.com');
    }
  }, [network]);
  
  return <App />;
}
```

### 4.3 用户行为预测

```jsx
import { prefetchDNS } from 'react-dom';

function PredictiveDNS({ userBehavior }) {
  useEffect(() => {
    // 基于用户行为模式预解析
    
    if (userBehavior.likelyToViewProducts) {
      prefetchDNS('https://products-api.example.com');
      prefetchDNS('https://product-images.example.com');
    }
    
    if (userBehavior.likelyToCheckout) {
      prefetchDNS('https://payment.example.com');
      prefetchDNS('https://checkout-api.example.com');
    }
    
    if (userBehavior.likelyToShareContent) {
      prefetchDNS('https://share.example.com');
      prefetchDNS('https://social-api.example.com');
    }
  }, [userBehavior]);
  
  return <App />;
}
```

## 第五部分：测量效果

### 5.1 DNS解析时间测量

```jsx
// 测量DNS解析时间
function measureDNSTime() {
  // 使用Performance API
  const resources = performance.getEntriesByType('resource');
  
  resources.forEach(resource => {
    const dnsTime = resource.domainLookupEnd - resource.domainLookupStart;
    
    if (dnsTime > 0) {
      console.log(`${resource.name}: DNS time = ${dnsTime.toFixed(2)}ms`);
    }
  });
}

// 在页面加载后测量
function App() {
  useEffect(() => {
    window.addEventListener('load', () => {
      setTimeout(measureDNSTime, 1000);
    });
  }, []);
  
  return <AppContent />;
}

// 扩展案例：详细的DNS性能分析
function DetailedDNSAnalysis() {
  const [dnsMetrics, setDnsMetrics] = useState([]);
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntriesByType('resource');
      
      const metrics = entries.map(entry => {
        const dnsTime = entry.domainLookupEnd - entry.domainLookupStart;
        const connectTime = entry.connectEnd - entry.connectStart;
        const requestTime = entry.responseStart - entry.requestStart;
        const responseTime = entry.responseEnd - entry.responseStart;
        
        return {
          url: entry.name,
          dnsTime: dnsTime.toFixed(2),
          connectTime: connectTime.toFixed(2),
          requestTime: requestTime.toFixed(2),
          responseTime: responseTime.toFixed(2),
          totalTime: entry.duration.toFixed(2)
        };
      });
      
      setDnsMetrics(metrics);
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (dnsMetrics.length > 0) {
      // 计算DNS时间统计
      const dnsTimes = dnsMetrics
        .filter(m => parseFloat(m.dnsTime) > 0)
        .map(m => parseFloat(m.dnsTime));
      
      if (dnsTimes.length > 0) {
        const avgDNS = dnsTimes.reduce((a, b) => a + b, 0) / dnsTimes.length;
        const maxDNS = Math.max(...dnsTimes);
        const minDNS = Math.min(...dnsTimes);
        
        console.log('DNS Performance Stats:', {
          average: avgDNS.toFixed(2) + 'ms',
          max: maxDNS.toFixed(2) + 'ms',
          min: minDNS.toFixed(2) + 'ms',
          count: dnsTimes.length
        });
      }
    }
  }, [dnsMetrics]);
  
  return <App />;
}
```

### 5.2 对比测试

```jsx
// A/B测试DNS预解析效果
function DNSPrefetchABTest() {
  const [variant, setVariant] = useState(null);
  
  useEffect(() => {
    // 随机分配测试组
    const testVariant = Math.random() < 0.5 ? 'with-prefetch' : 'without-prefetch';
    setVariant(testVariant);
    
    if (testVariant === 'with-prefetch') {
      // 测试组：使用DNS预解析
      prefetchDNS('https://api.example.com');
      prefetchDNS('https://cdn.example.com');
    }
    
    // 记录测试组
    trackABTest('dns-prefetch', testVariant);
    
    // 测量性能
    const startTime = performance.now();
    
    fetch('https://api.example.com/data')
      .then(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // 上报性能数据
        reportMetric('api-load-time', duration, testVariant);
      });
  }, []);
  
  return <App />;
}

// 扩展案例：实时性能对比
function RealTimeComparison() {
  const [metrics, setMetrics] = useState({
    withPrefetch: [],
    withoutPrefetch: []
  });
  
  const testDNSPrefetch = async (usePrefetch) => {
    const testDomain = 'https://test-api.example.com';
    
    if (usePrefetch) {
      // 预解析
      prefetchDNS(testDomain);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const startTime = performance.now();
    
    try {
      await fetch(testDomain + '/ping');
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        [usePrefetch ? 'withPrefetch' : 'withoutPrefetch']: [
          ...prev[usePrefetch ? 'withPrefetch' : 'withoutPrefetch'],
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
    // 运行多次测试
    const runTests = async () => {
      for (let i = 0; i < 10; i++) {
        await testDNSPrefetch(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        await testDNSPrefetch(false);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    };
    
    runTests();
  }, []);
  
  // 计算统计结果
  useEffect(() => {
    if (metrics.withPrefetch.length > 5 && metrics.withoutPrefetch.length > 5) {
      const avgWith = metrics.withPrefetch.reduce((a, b) => a + b, 0) / metrics.withPrefetch.length;
      const avgWithout = metrics.withoutPrefetch.reduce((a, b) => a + b, 0) / metrics.withoutPrefetch.length;
      const improvement = ((avgWithout - avgWith) / avgWithout * 100).toFixed(2);
      
      console.log('DNS Prefetch Performance:', {
        withPrefetch: avgWith.toFixed(2) + 'ms',
        withoutPrefetch: avgWithout.toFixed(2) + 'ms',
        improvement: improvement + '%'
      });
    }
  }, [metrics]);
  
  return <App />;
}
```

### 5.3 持续监控

```jsx
import { prefetchDNS } from 'react-dom';

function ContinuousMonitoring() {
  const [dnsHealth, setDnsHealth] = useState({});
  
  useEffect(() => {
    const monitoredDomains = [
      'https://api.example.com',
      'https://cdn.example.com',
      'https://images.example.com'
    ];
    
    // 预解析所有监控的域名
    monitoredDomains.forEach(domain => {
      prefetchDNS(domain);
    });
    
    // 定期检查DNS性能
    const checkInterval = setInterval(() => {
      const resources = performance.getEntriesByType('resource');
      
      const healthData = {};
      
      monitoredDomains.forEach(domain => {
        const domainResources = resources.filter(r => r.name.includes(domain));
        
        if (domainResources.length > 0) {
          const avgDNS = domainResources
            .map(r => r.domainLookupEnd - r.domainLookupStart)
            .filter(t => t > 0)
            .reduce((a, b, _, arr) => a + b / arr.length, 0);
          
          healthData[domain] = {
            avgDNSTime: avgDNS.toFixed(2),
            status: avgDNS < 50 ? 'good' : avgDNS < 100 ? 'fair' : 'poor',
            lastCheck: new Date().toISOString()
          };
        }
      });
      
      setDnsHealth(healthData);
      
      // 如果DNS性能下降，上报警报
      Object.entries(healthData).forEach(([domain, health]) => {
        if (health.status === 'poor') {
          console.warn(`DNS performance degraded for ${domain}: ${health.avgDNSTime}ms`);
          // 可以发送到监控服务
          // reportAlert('dns-slow', { domain, time: health.avgDNSTime });
        }
      });
    }, 60000); // 每分钟检查一次
    
    return () => clearInterval(checkInterval);
  }, []);
  
  return (
    <div>
      <App />
      {process.env.NODE_ENV === 'development' && (
        <DNSHealthDashboard health={dnsHealth} />
      )}
    </div>
  );
}
```

## 第六部分：高级应用场景

### 6.1 动态域名管理

```jsx
import { prefetchDNS } from 'react-dom';

function DynamicDomainManagement() {
  const [activeDomains, setActiveDomains] = useState(new Set());
  const [domainConfig, setDomainConfig] = useState({});
  
  useEffect(() => {
    // 从配置服务加载域名列表
    fetch('/api/domain-config')
      .then(res => res.json())
      .then(config => {
        setDomainConfig(config);
        
        // 预解析优先级高的域名
        config.highPriority?.forEach(domain => {
          prefetchDNS(domain);
          setActiveDomains(prev => new Set([...prev, domain]));
        });
        
        // 延迟预解析中等优先级域名
        setTimeout(() => {
          config.mediumPriority?.forEach(domain => {
            prefetchDNS(domain);
            setActiveDomains(prev => new Set([...prev, domain]));
          });
        }, 1000);
        
        // 空闲时预解析低优先级域名
        requestIdleCallback(() => {
          config.lowPriority?.forEach(domain => {
            prefetchDNS(domain);
            setActiveDomains(prev => new Set([...prev, domain]));
          });
        });
      });
  }, []);
  
  return <App activeDomains={activeDomains} />;
}
```

### 6.2 故障转移策略

```jsx
import { prefetchDNS } from 'react-dom';

function FailoverStrategy() {
  const [primaryAPI, setPrimaryAPI] = useState('https://api-primary.example.com');
  const [fallbackAPIs] = useState([
    'https://api-backup1.example.com',
    'https://api-backup2.example.com',
    'https://api-backup3.example.com'
  ]);
  
  useEffect(() => {
    // 预解析主API
    prefetchDNS(primaryAPI);
    
    // 预解析所有备用API（以防主API失败）
    fallbackAPIs.forEach(api => {
      prefetchDNS(api);
    });
  }, [primaryAPI, fallbackAPIs]);
  
  const makeRequest = async (url) => {
    try {
      const response = await fetch(primaryAPI + url);
      if (!response.ok) throw new Error('Primary API failed');
      return response.json();
    } catch (error) {
      console.warn('Primary API failed, trying fallbacks...');
      
      // 依次尝试备用API
      for (const fallbackAPI of fallbackAPIs) {
        try {
          const response = await fetch(fallbackAPI + url);
          if (response.ok) {
            // 切换到工作的备用API
            setPrimaryAPI(fallbackAPI);
            return response.json();
          }
        } catch (err) {
          continue;
        }
      }
      
      throw new Error('All APIs failed');
    }
  };
  
  return <App makeRequest={makeRequest} />;
}
```

### 6.3 地理分布优化

```jsx
import { prefetchDNS } from 'react-dom';

function GeographicOptimization() {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCDNs, setNearestCDNs] = useState([]);
  
  useEffect(() => {
    // 获取用户位置
    const getUserLocation = async () => {
      try {
        // 方法1：IP地理定位
        const response = await fetch('https://ipapi.co/json/');
        const location = await response.json();
        setUserLocation(location);
        
        // 方法2：Geolocation API（需要用户授权）
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }));
            }
          );
        }
      } catch (error) {
        console.error('Failed to get user location:', error);
      }
    };
    
    getUserLocation();
  }, []);
  
  useEffect(() => {
    if (userLocation) {
      // 根据位置计算最近的CDN
      const cdnLocations = [
        { url: 'https://cdn-us-east.example.com', lat: 40.7128, lng: -74.0060, region: 'US-East' },
        { url: 'https://cdn-us-west.example.com', lat: 37.7749, lng: -122.4194, region: 'US-West' },
        { url: 'https://cdn-eu.example.com', lat: 51.5074, lng: -0.1278, region: 'EU' },
        { url: 'https://cdn-asia.example.com', lat: 35.6762, lng: 139.6503, region: 'Asia' }
      ];
      
      // 计算距离并排序
      const sorted = cdnLocations
        .map(cdn => ({
          ...cdn,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            cdn.lat,
            cdn.lng
          )
        }))
        .sort((a, b) => a.distance - b.distance);
      
      setNearestCDNs(sorted);
      
      // 预解析最近的3个CDN
      sorted.slice(0, 3).forEach(cdn => {
        prefetchDNS(cdn.url);
      });
    }
  }, [userLocation]);
  
  return <App nearestCDNs={nearestCDNs} />;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine公式计算两点距离
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### 6.4 智能预测预解析

```jsx
import { prefetchDNS } from 'react-dom';

function PredictiveDNSPrefetch() {
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  
  useEffect(() => {
    // 分析用户导航模式
    const analyzePattern = () => {
      if (navigationHistory.length < 3) return;
      
      // 简单的马尔可夫链预测
      const patterns = {};
      
      for (let i = 0; i < navigationHistory.length - 1; i++) {
        const current = navigationHistory[i];
        const next = navigationHistory[i + 1];
        
        if (!patterns[current]) {
          patterns[current] = {};
        }
        
        patterns[current][next] = (patterns[current][next] || 0) + 1;
      }
      
      // 获取当前页面最可能的下一页
      const currentPage = navigationHistory[navigationHistory.length - 1];
      if (patterns[currentPage]) {
        const nextPages = Object.entries(patterns[currentPage])
          .sort((a, b) => b[1] - a[1])
          .map(([page]) => page);
        
        setPredictions(nextPages);
        
        // 预解析预测的页面域名
        nextPages.slice(0, 3).forEach(page => {
          const domains = getDomainsByPage(page);
          domains.forEach(domain => prefetchDNS(domain));
        });
      }
    };
    
    analyzePattern();
  }, [navigationHistory]);
  
  useEffect(() => {
    // 监听路由变化
    const handleRouteChange = (url) => {
      setNavigationHistory(prev => [...prev, url].slice(-10)); // 保留最近10次
    };
    
    // 假设使用React Router
    // router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      // router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);
  
  return <App predictions={predictions} />;
}

function getDomainsByPage(page) {
  // 根据页面返回需要的域名
  const domainMap = {
    '/products': ['https://products-api.example.com', 'https://product-images.example.com'],
    '/checkout': ['https://payment.example.com', 'https://checkout-api.example.com'],
    '/profile': ['https://user-api.example.com', 'https://avatar-cdn.example.com']
  };
  
  return domainMap[page] || [];
}
```

### 6.5 Service Worker集成

```jsx
import { prefetchDNS } from 'react-dom';

function ServiceWorkerDNS() {
  const [swReady, setSwReady] = useState(false);
  const [cachedDomains, setCachedDomains] = useState(new Set());
  
  useEffect(() => {
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwReady(true);
          
          // 从SW获取缓存的域名列表
          registration.active?.postMessage({ type: 'GET_CACHED_DOMAINS' });
          
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHED_DOMAINS') {
              setCachedDomains(new Set(event.data.domains));
            }
          });
        });
    }
  }, []);
  
  useEffect(() => {
    if (swReady) {
      // 预解析未缓存的域名
      const domainsToPreload = [
        'https://api.example.com',
        'https://cdn.example.com',
        'https://images.example.com'
      ];
      
      domainsToPreload.forEach(domain => {
        if (!cachedDomains.has(domain)) {
          prefetchDNS(domain);
        }
      });
    }
  }, [swReady, cachedDomains]);
  
  return <App />;
}
```

// sw.js
```javascript
let cachedDomains = new Set();

self.addEventListener('message', (event) => {
  if (event.data.type === 'GET_CACHED_DOMAINS') {
    event.ports[0].postMessage({
      type: 'CACHED_DOMAINS',
      domains: Array.from(cachedDomains)
    });
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  cachedDomains.add(url.origin);
});
```

### 6.6 用户偏好驱动

```jsx
import { prefetchDNS } from 'react-dom';

function UserPreferenceDNS() {
  const [preferences, setPreferences] = useState({});
  
  useEffect(() => {
    // 加载用户偏好
    const loadPreferences = async () => {
      const prefs = await fetch('/api/user/preferences').then(r => r.json());
      setPreferences(prefs);
    };
    
    loadPreferences();
  }, []);
  
  useEffect(() => {
    // 根据用户偏好预解析
    
    // 语言偏好
    if (preferences.language) {
      prefetchDNS(`https://${preferences.language}.content.example.com`);
    }
    
    // 内容偏好
    if (preferences.interests?.includes('sports')) {
      prefetchDNS('https://sports-api.example.com');
    }
    
    if (preferences.interests?.includes('news')) {
      prefetchDNS('https://news-api.example.com');
    }
    
    if (preferences.interests?.includes('tech')) {
      prefetchDNS('https://tech-api.example.com');
    }
    
    // 区域偏好
    if (preferences.region) {
      prefetchDNS(`https://cdn-${preferences.region}.example.com`);
    }
    
    // 功能偏好
    if (preferences.features?.darkMode) {
      prefetchDNS('https://theme-cdn.example.com');
    }
  }, [preferences]);
  
  return <App />;
}
```

## 注意事项

### 1. 适量使用

```jsx
// ❌ 过度使用
function Bad() {
  // 预解析太多域名（>10个）
  domains.forEach(domain => prefetchDNS(domain));
  // 可能浪费资源
}

// ✅ 合理使用
function Good() {
  // 只预解析关键域名（5-10个）
  prefetchDNS('https://api.example.com');
  prefetchDNS('https://cdn.example.com');
  prefetchDNS('https://fonts.example.com');
}

// 实际案例：分级预解析
function PrioritizedPrefetch() {
  // 立即预解析：必定要用的
  prefetchDNS('https://api.example.com');
  prefetchDNS('https://cdn.example.com');
  
  // 延迟预解析：可能要用的
  setTimeout(() => {
    prefetchDNS('https://analytics.example.com');
    prefetchDNS('https://social.example.com');
  }, 1000);
  
  // 空闲时预解析：可选的
  requestIdleCallback(() => {
    prefetchDNS('https://ads.example.com');
    prefetchDNS('https://feedback.example.com');
  });
  
  return <App />;
}
```

### 2. 与preconnect配合

```jsx
// ✅ 合理搭配使用
import { prefetchDNS, preconnect } from 'react-dom';

function OptimalStrategy() {
  // 马上要用的：preconnect（DNS + TCP + TLS）
  preconnect('https://api.example.com');
  preconnect('https://cdn.example.com');
  
  // 可能会用的：prefetchDNS（只DNS）
  prefetchDNS('https://analytics.example.com');
  prefetchDNS('https://social.example.com');
  prefetchDNS('https://ads.example.com');
}

// 详细对比
function DetailedComparison() {
  /*
   * preconnect vs prefetchDNS
   *
   * preconnect:
   * - DNS解析 + TCP连接 + TLS握手
   * - 节省时间：80-200ms
   * - 资源消耗：中等（保持连接）
   * - 适用：马上要访问的域名（2-3个）
   *
   * prefetchDNS:
   * - 只DNS解析
   * - 节省时间：20-120ms
   * - 资源消耗：极低
   * - 适用：可能访问的域名（5-10个）
   */
  
  // 策略：组合使用
  // 第1级：preconnect关键API
  preconnect('https://api.example.com');
  
  // 第2级：prefetchDNS次要域名
  prefetchDNS('https://images-api.example.com');
  prefetchDNS('https://user-api.example.com');
  prefetchDNS('https://analytics.example.com');
  
  return <App />;
}
```

### 3. 移动端优化

```jsx
// ✅ 移动端更保守
function MobileFriendly() {
  const isMobile = /Mobile/.test(navigator.userAgent);
  const connection = navigator.connection;
  
  useEffect(() => {
    if (isMobile) {
      // 检查网络状况
      const networkType = connection?.effectiveType;
      
      if (networkType === '4g' || networkType === 'wifi') {
        // 快速网络：适度预解析
        prefetchDNS('https://api.example.com');
        prefetchDNS('https://cdn.example.com');
        prefetchDNS('https://images.example.com');
      } else if (networkType === '3g') {
        // 3G：只预解析关键
        prefetchDNS('https://api.example.com');
      } else {
        // 慢速网络：不预解析
        console.log('Slow network, skipping DNS prefetch');
      }
      
      // 检查省流量模式
      if (connection?.saveData) {
        console.log('Data saver enabled, skipping DNS prefetch');
        return;
      }
    } else {
      // 桌面端：更积极
      prefetchDNS('https://api.example.com');
      prefetchDNS('https://cdn.example.com');
      prefetchDNS('https://images.example.com');
      prefetchDNS('https://fonts.example.com');
      prefetchDNS('https://analytics.example.com');
    }
  }, [isMobile]);
  
  return <App />;
}
```

### 4. 避免重复预解析

```jsx
// ✅ 使用缓存避免重复
const prefetchedDomains = new Set();

function prefetchOnce(domain) {
  if (!prefetchedDomains.has(domain)) {
    prefetchDNS(domain);
    prefetchedDomains.add(domain);
  }
}

// 在组件中使用
function MyComponent() {
  useEffect(() => {
    prefetchOnce('https://api.example.com');
    prefetchOnce('https://cdn.example.com');
    
    // 即使多次调用也只会预解析一次
    prefetchOnce('https://api.example.com'); // 被忽略
  }, []);
  
  return <App />;
}
```

### 5. SSR兼容性

```jsx
// ✅ SSR友好的预解析
function SSRCompatible() {
  // 服务端和客户端都可以调用
  prefetchDNS('https://api.example.com');
  
  // 或者只在客户端执行
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefetchDNS('https://client-only.example.com');
    }
  }, []);
  
  return <App />;
}
```

### 6. 性能预算

```jsx
// ✅ 控制DNS预解析数量
function BudgetAware() {
  const MAX_DNS_PREFETCH = 10;
  const [prefetchCount, setPrefetchCount] = useState(0);
  
  const budgetPrefetch = (domain) => {
    if (prefetchCount < MAX_DNS_PREFETCH) {
      prefetchDNS(domain);
      setPrefetchCount(c => c + 1);
    } else {
      console.warn('DNS prefetch budget exceeded');
    }
  };
  
  useEffect(() => {
    budgetPrefetch('https://api.example.com');
    budgetPrefetch('https://cdn.example.com');
    budgetPrefetch('https://images.example.com');
  }, []);
  
  return <App />;
}
```

## 常见问题

### Q1: prefetchDNS节省多少时间？

**A:** 
- **典型情况**: 20-120ms
- **快速DNS**: 10-30ms
- **慢速DNS**: 50-200ms
- **国际DNS**: 100-500ms

实际节省的时间取决于：
- DNS服务器距离
- 网络质量
- DNS缓存状态
- 服务器响应速度

```jsx
// 测量实际节省的时间
async function measureDNSSavings() {
  const domain = 'https://test-api.example.com';
  
  // 不使用prefetch
  const t1 = performance.now();
  await fetch(domain + '/ping');
  const timeWithout = performance.now() - t1;
  
  // 使用prefetch
  prefetchDNS(domain);
  await new Promise(r => setTimeout(r, 100)); // 等待DNS解析
  
  const t2 = performance.now();
  await fetch(domain + '/ping');
  const timeWith = performance.now() - t2;
  
  console.log('Time saved:', (timeWithout - timeWith).toFixed(2) + 'ms');
}
```

### Q2: 所有浏览器都支持吗？

**A:** 
现代浏览器支持情况：
- ✅ Chrome 46+
- ✅ Firefox 39+
- ✅ Safari 11.1+
- ✅ Edge 79+

对于不支持的浏览器：
- React会自动忽略
- 不会报错
- 不影响功能

```jsx
// 检测浏览器支持
function BrowserSupport() {
  const [supported, setSupported] = useState(false);
  
  useEffect(() => {
    // 检测prefetch支持
    const testLink = document.createElement('link');
    const isSupported = testLink.relList?.supports?.('dns-prefetch');
    setSupported(isSupported);
    
    if (isSupported) {
      prefetchDNS('https://api.example.com');
    } else {
      console.log('DNS prefetch not supported, using fallback');
    }
  }, []);
  
  return <App />;
}
```

### Q3: 会增加流量吗？

**A:** 几乎不会：
- DNS查询：通常 <1KB
- 10个域名：约5-10KB
- 相比节省的时间，流量可忽略

但要注意：
- 不要预解析几十个域名
- 移动端更要谨慎
- 考虑用户的流量套餐

### Q4: 多少个域名合适？

**A:** 推荐数量：

| 场景 | prefetchDNS | preconnect | 总计 |
|------|-------------|------------|------|
| 桌面端 | 5-10个 | 2-3个 | <15个 |
| 移动端（4G） | 3-5个 | 1-2个 | <8个 |
| 移动端（3G） | 1-2个 | 1个 | <3个 |

```jsx
// 动态调整数量
function AdaptiveCount() {
  const isMobile = /Mobile/.test(navigator.userAgent);
  const networkType = navigator.connection?.effectiveType;
  
  const getDomainLimit = () => {
    if (!isMobile) return 10;
    if (networkType === '4g') return 5;
    if (networkType === '3g') return 2;
    return 0; // 慢速网络不预解析
  };
  
  const limit = getDomainLimit();
  const domains = [
    'https://api.example.com',
    'https://cdn.example.com',
    'https://images.example.com',
    'https://fonts.example.com',
    'https://analytics.example.com',
    // ... 更多域名
  ];
  
  domains.slice(0, limit).forEach(domain => {
    prefetchDNS(domain);
  });
  
  return <App />;
}
```

### Q5: prefetchDNS和preload有什么区别？

**A:** 

| 特性 | prefetchDNS | preload |
|------|-------------|---------|
| 作用 | DNS解析 | 下载资源 |
| 时机 | 提前解析域名 | 提前下载文件 |
| 开销 | 极低 | 较高 |
| 适用 | 域名 | 具体资源URL |
| 数量 | 5-10个 | 2-5个 |

```jsx
// 组合使用
function Combined() {
  // 先解析域名
  prefetchDNS('https://cdn.example.com');
  
  // 再预加载资源
  preload('https://cdn.example.com/critical.js', { as: 'script' });
  preload('https://cdn.example.com/main.css', { as: 'style' });
  
  return <App />;
}
```

### Q6: 何时调用prefetchDNS最合适？

**A:** 最佳时机：

1. **页面加载时**（立即需要）
```jsx
function ImmediatePrefix() {
  prefetchDNS('https://api.example.com');
  return <App />;
}
```

2. **用户交互前**（鼠标悬停）
```jsx
function OnHover() {
  const handleMouseEnter = () => {
    prefetchDNS('https://next-page-api.example.com');
  };
  
  return <Link onMouseEnter={handleMouseEnter}>Next</Link>;
}
```

3. **空闲时**（低优先级）
```jsx
function OnIdle() {
  useEffect(() => {
    requestIdleCallback(() => {
      prefetchDNS('https://optional-api.example.com');
    });
  }, []);
}
```

### Q7: 如何调试prefetchDNS？

**A:** 使用多种工具：

1. **Chrome DevTools**
```
Network面板 → 筛选"Prefetch" → 查看dns-prefetch
```

2. **Performance API**
```jsx
function Debug() {
  useEffect(() => {
    // 查看所有资源
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(r => {
      if (r.domainLookupEnd - r.domainLookupStart > 0) {
        console.log({
          url: r.name,
          dns: (r.domainLookupEnd - r.domainLookupStart).toFixed(2) + 'ms'
        });
      }
    });
  }, []);
}
```

3. **检查DOM**
```jsx
function CheckDOM() {
  useEffect(() => {
    const links = document.querySelectorAll('link[rel="dns-prefetch"]');
    console.log('DNS Prefetch links:', Array.from(links).map(l => l.href));
  }, []);
}
```

### Q8: prefetchDNS会被缓存吗？

**A:** 是的，DNS解析结果会被多层缓存：

1. **浏览器缓存**：几分钟到几小时
2. **操作系统缓存**：类似浏览器
3. **路由器缓存**：通常较短
4. **ISP DNS缓存**：由TTL决定

```jsx
// 利用缓存
function CacheAware() {
  useEffect(() => {
    // 第一次访问预解析
    prefetchDNS('https://api.example.com');
    
    // 几分钟后再次访问，DNS已缓存
    setTimeout(() => {
      fetch('https://api.example.com/data'); // 快速！
    }, 60000);
  }, []);
}
```

### Q9: 跨域资源需要特殊处理吗？

**A:** 不需要，prefetchDNS只是DNS解析，不涉及CORS：

```jsx
// 所有这些都可以预解析
prefetchDNS('https://different-domain.com');
prefetchDNS('https://api.third-party.com');
prefetchDNS('https://cdn.example.org');

// 不需要crossOrigin属性
// 不需要CORS头部
```

### Q10: 如何在Next.js中使用？

**A:** Next.js与React 19完美集成：

```jsx
// pages/_app.js
import { prefetchDNS } from 'react-dom';

function MyApp({ Component, pageProps }) {
  // 全局域名预解析
  prefetchDNS('https://api.example.com');
  prefetchDNS('https://cdn.example.com');
  
  return <Component {...pageProps} />;
}

// pages/index.js
export default function Home() {
  // 页面特定域名
  prefetchDNS('https://homepage-api.example.com');
  
  return <HomePage />;
}

// 在getServerSideProps中
export async function getServerSideProps() {
  // 服务端渲染时也可以使用
  prefetchDNS('https://api.example.com');
  
  return { props: {} };
}
```

## 总结

### prefetchDNS的核心优势

1. **性能提升**
   - 节省20-120ms DNS查询时间
   - 改善首次连接速度
   - 提升用户体验

2. **低成本高回报**
   - 流量消耗极低（<1KB）
   - 实现简单
   - 无副作用

3. **广泛兼容**
   - 主流浏览器支持
   - 优雅降级
   - SSR友好

4. **灵活控制**
   - 条件预解析
   - 优先级分级
   - 动态调整

### 适用场景总结

1. **第三方服务**
   - Google Analytics
   - 社交媒体SDK
   - 广告服务
   - CDN服务

2. **API服务器**
   - 主API域名
   - 备用API域名
   - 区域API服务器

3. **静态资源CDN**
   - 图片CDN
   - 字体CDN
   - 脚本CDN

4. **用户可能访问**
   - 路由预判
   - 搜索建议
   - 相关链接

### 最佳实践总结

1. **数量控制**
   - 桌面端：5-10个
   - 移动端：3-5个
   - 慢速网络：1-2个

2. **优先级策略**
   - 必定用：立即预解析
   - 可能用：延迟预解析
   - 可选用：空闲预解析

3. **与其他技术结合**
   - preconnect：马上要用的
   - prefetchDNS：可能要用的
   - preload：具体资源

4. **智能优化**
   - 检测网络状况
   - 考虑设备类型
   - 尊重用户偏好

5. **性能监控**
   - 测量实际效果
   - A/B测试验证
   - 持续优化调整

### 性能提升预期

合理使用prefetchDNS可以带来：

```
DNS解析时间: ↓ 20-120ms
首次连接时间: ↓ 15-30%
用户感知延迟: ↓ 10-25%
页面交互速度: ↑ 20-40%
```

### 注意避免的陷阱

1. **过度预解析**
   - 不要超过10个域名
   - 移动端更要克制

2. **忽略网络状况**
   - 检测网络类型
   - 尊重省流量模式

3. **重复预解析**
   - 使用缓存机制
   - 避免无效调用

4. **缺乏监控**
   - 测量实际效果
   - 验证性能提升

prefetchDNS是性价比最高的性能优化手段之一！
