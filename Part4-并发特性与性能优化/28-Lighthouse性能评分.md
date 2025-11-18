# Lighthouse性能评分

## 第一部分：Lighthouse基础

### 1.1 什么是Lighthouse

Lighthouse是Google开发的开源自动化工具，用于评估网页质量，提供性能、可访问性、最佳实践、SEO和PWA等多方面的评分和优化建议。

**运行方式：**

```bash
# 1. Chrome DevTools
# 打开DevTools → Lighthouse标签 → Generate report

# 2. Chrome扩展
# 安装Lighthouse扩展 → 点击图标 → Generate report

# 3. 命令行
npm install -g lighthouse
lighthouse https://example.com --view

# 4. Node.js API
npm install lighthouse
```

**核心指标：**

```
Performance (性能)
- First Contentful Paint (FCP): 首次内容绘制
- Largest Contentful Paint (LCP): 最大内容绘制
- Total Blocking Time (TBT): 总阻塞时间
- Cumulative Layout Shift (CLS): 累积布局偏移
- Speed Index: 速度指数

Accessibility (可访问性)
Best Practices (最佳实践)
SEO (搜索引擎优化)
PWA (渐进式Web应用)
```

### 1.2 性能评分标准

```javascript
// 性能分数计算权重
const performanceWeights = {
  'first-contentful-paint': 10,
  'speed-index': 10,
  'largest-contentful-paint': 25,
  'total-blocking-time': 30,
  'cumulative-layout-shift': 25
};

// 评分范围
// 0-49: 差（红色）
// 50-89: 需改进（橙色）
// 90-100: 好（绿色）

// 各指标阈值
const thresholds = {
  FCP: {
    good: 1800,      // <1.8s
    needsWork: 3000  // 1.8-3s
  },
  LCP: {
    good: 2500,      // <2.5s
    needsWork: 4000  // 2.5-4s
  },
  TBT: {
    good: 200,       // <200ms
    needsWork: 600   // 200-600ms
  },
  CLS: {
    good: 0.1,       // <0.1
    needsWork: 0.25  // 0.1-0.25
  },
  SI: {
    good: 3400,      // <3.4s
    needsWork: 5800  // 3.4-5.8s
  }
};
```

### 1.3 命令行使用

```bash
# 基础分析
lighthouse https://example.com

# 指定设备
lighthouse https://example.com --emulated-form-factor=mobile
lighthouse https://example.com --emulated-form-factor=desktop

# 只分析性能
lighthouse https://example.com --only-categories=performance

# 自定义配置
lighthouse https://example.com --config-path=./lighthouse-config.js

# 输出格式
lighthouse https://example.com --output=html --output-path=./report.html
lighthouse https://example.com --output=json --output-path=./report.json

# CI集成
lighthouse https://example.com --output=json --quiet --chrome-flags="--headless"
```

**配置文件示例：**

```javascript
// lighthouse-config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1
    }
  }
};
```

### 1.4 Node.js API

```javascript
// lighthouse-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });
  
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse(url, options);
  
  // 结果
  console.log('Performance score:', runnerResult.lhr.categories.performance.score * 100);
  
  // 具体指标
  const metrics = runnerResult.lhr.audits;
  console.log('FCP:', metrics['first-contentful-paint'].displayValue);
  console.log('LCP:', metrics['largest-contentful-paint'].displayValue);
  console.log('TBT:', metrics['total-blocking-time'].displayValue);
  console.log('CLS:', metrics['cumulative-layout-shift'].displayValue);
  
  await chrome.kill();
  
  return runnerResult;
}

// 运行
runLighthouse('https://example.com');
```

## 第二部分：性能指标优化

### 2.1 FCP优化

```javascript
// First Contentful Paint：首次内容绘制时间

// 问题：FCP慢（>3s）
// 原因：
// 1. 服务器响应慢
// 2. JavaScript阻塞渲染
// 3. CSS阻塞渲染
// 4. 字体加载阻塞

// 优化1：服务器响应
// - 使用CDN
// - 启用HTTP/2
// - 压缩响应

// 优化2：关键CSS内联
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlCriticalWebpackPlugin = require('html-critical-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin(),
    new HtmlCriticalWebpackPlugin({
      base: path.resolve(__dirname, 'dist'),
      src: 'index.html',
      dest: 'index.html',
      inline: true,
      minify: true,
      width: 1300,
      height: 900
    })
  ]
};

// 优化3：预连接
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />

// 优化4：字体优化
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin />

// font-display策略
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/main.woff2') format('woff2');
  font-display: swap;  // 立即显示备用字体
}

// 优化5：SSR
// 使用服务器端渲染，快速返回HTML
```

### 2.2 LCP优化

```javascript
// Largest Contentful Paint：最大内容绘制时间

// 问题：LCP慢（>4s）
// 常见LCP元素：
// - 大型图片
// - 视频封面
// - 背景图片
// - 大块文本

// 优化1：图片优化
// - 使用合适的格式（WebP）
// - 响应式图片
// - 图片CDN
<img
  src="image.webp"
  srcSet="image-400.webp 400w, image-800.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  alt="Hero image"
/>

// - 预加载LCP图片
<link rel="preload" as="image" href="hero.jpg" />

// 优化2：文本渲染优化
// - Web字体优化
// - 避免FOIT（Flash of Invisible Text）
@font-face {
  font-family: 'MyFont';
  font-display: swap;
}

// 优化3：服务器优化
// - CDN加速
// - 压缩图片
// - 使用缓存

// 优化4：资源优先级
// - 提高LCP资源优先级
<img src="hero.jpg" fetchpriority="high" alt="Hero" />

// React实现
function HeroSection() {
  return (
    <section className="hero">
      <img
        src="/images/hero.webp"
        alt="Hero"
        fetchPriority="high"
        loading="eager"  // 不要lazy加载LCP图片
      />
    </section>
  );
}
```

### 2.3 TBT优化

```javascript
// Total Blocking Time：总阻塞时间

// 问题：TBT高（>600ms）
// 原因：主线程被Long Task阻塞

// 优化1：代码分割
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// 优化2：延迟非关键JavaScript
// - 使用async/defer
<script src="analytics.js" async></script>
<script src="non-critical.js" defer></script>

// - 延迟执行
function App() {
  useEffect(() => {
    // 延迟加载非关键功能
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('./analytics').then(mod => mod.init());
      });
    } else {
      setTimeout(() => {
        import('./analytics').then(mod => mod.init());
      }, 1000);
    }
  }, []);
}

// 优化3：减少JavaScript执行时间
// - Tree-Shaking
// - 代码压缩
// - 移除未使用的代码

// 优化4：分批处理
function BatchProcessing({ items }) {
  const [processedItems, setProcessedItems] = useState([]);
  
  useEffect(() => {
    const process = async () => {
      const chunks = chunkArray(items, 100);
      
      for (const chunk of chunks) {
        await new Promise(resolve => {
          requestIdleCallback(() => {
            const processed = chunk.map(processItem);
            setProcessedItems(prev => [...prev, ...processed]);
            resolve();
          });
        });
      }
    };
    
    process();
  }, [items]);
  
  return <List items={processedItems} />;
}
```

### 2.4 CLS优化

```javascript
// Cumulative Layout Shift：累积布局偏移

// 问题：CLS高（>0.25）
// 原因：
// 1. 无尺寸的图片
// 2. 动态插入的内容
// 3. Web字体加载
// 4. 广告/iframe

// 优化1：图片尺寸
// ❌ 未指定尺寸
<img src="image.jpg" alt="Image" />

// ✅ 指定宽高
<img src="image.jpg" alt="Image" width="800" height="600" />

// ✅ 使用aspect-ratio
<img 
  src="image.jpg" 
  alt="Image"
  style={{ aspectRatio: '16/9', width: '100%' }}
/>

// React组件
function ResponsiveImage({ src, alt, aspectRatio }) {
  return (
    <div style={{ aspectRatio }}>
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

// 优化2：预留空间
// ❌ 动态内容无占位
function BadDynamicContent() {
  const [ads, setAds] = useState(null);
  
  useEffect(() => {
    loadAds().then(setAds);
  }, []);
  
  return (
    <div>
      <Content />
      {ads && <AdBanner ads={ads} />}  {/* 突然插入，导致偏移 */}
    </div>
  );
}

// ✅ 预留空间
function GoodDynamicContent() {
  const [ads, setAds] = useState(null);
  
  useEffect(() => {
    loadAds().then(setAds);
  }, []);
  
  return (
    <div>
      <Content />
      <div style={{ minHeight: '250px' }}>  {/* 预留空间 */}
        {ads ? <AdBanner ads={ads} /> : <AdPlaceholder />}
      </div>
    </div>
  );
}

// 优化3：字体优化
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/font.woff2') format('woff2');
  font-display: swap;  // 避免FOIT
}

// 优化4：变换动画
// ❌ 引起布局偏移
.animate {
  width: 100px;
  transition: width 0.3s;
}

.animate:hover {
  width: 200px;  // 改变width导致布局偏移
}

// ✅ 使用transform
.animate {
  transition: transform 0.3s;
}

.animate:hover {
  transform: scaleX(2);  // 不影响布局
}
```

## 第三部分：CI/CD集成

### 3.1 Lighthouse CI

```bash
# 安装
npm install -g @lhci/cli

# 初始化
lhci init

# 配置文件
```

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run serve',
      url: ['http://localhost:3000'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

**GitHub Actions集成：**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### 3.2 自动化测试

```javascript
// Puppeteer + Lighthouse
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

async function runAudit(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  const { lhr } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: 'json',
    onlyCategories: ['performance']
  });
  
  await browser.close();
  
  const score = lhr.categories.performance.score * 100;
  const metrics = {
    score,
    fcp: lhr.audits['first-contentful-paint'].numericValue,
    lcp: lhr.audits['largest-contentful-paint'].numericValue,
    tbt: lhr.audits['total-blocking-time'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue
  };
  
  console.log('Performance Score:', score);
  console.log('Metrics:', metrics);
  
  // 断言
  if (score < 90) {
    throw new Error(`Performance score ${score} below threshold 90`);
  }
  
  return metrics;
}

// 运行测试
runAudit('https://example.com');
```

### 3.3 性能预算

```javascript
// budget.json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 170
    },
    {
      "resourceType": "image",
      "budget": 500
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "document",
      "budget": 30
    },
    {
      "resourceType": "total",
      "budget": 750
    }
  ],
  "resourceCounts": [
    {
      "resourceType": "script",
      "budget": 10
    },
    {
      "resourceType": "third-party",
      "budget": 5
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 2000
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "interactive",
      "budget": 3500
    }
  ]
}

// 使用预算
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000']
    },
    assert: {
      budgetFile: './budget.json'
    }
  }
};
```

## 注意事项

### 1. 测试环境

```javascript
// 保持一致的测试环境
// - 相同的网络条件
// - 相同的设备模拟
// - 多次运行取平均值

// 配置一致性
const config = {
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4
  },
  screenEmulation: {
    mobile: true,
    width: 375,
    height: 667,
    deviceScaleFactor: 2
  }
};
```

### 2. 指标波动

```javascript
// 运行多次取平均
async function runMultiple(url, runs = 5) {
  const results = [];
  
  for (let i = 0; i < runs; i++) {
    const result = await runLighthouse(url);
    results.push(result);
  }
  
  const avg = {
    score: average(results.map(r => r.score)),
    fcp: average(results.map(r => r.fcp)),
    lcp: average(results.map(r => r.lcp))
  };
  
  return avg;
}
```

### 3. 真实设备测试

```javascript
// 模拟真实设备条件
// - 使用Chrome远程调试
// - 在真实设备上运行Lighthouse
// - 考虑不同网络条件
```

## 常见问题

### Q1: Lighthouse评分多少算好？

**A:** 90+为优秀，50-89需改进，<50差。

### Q2: 如何提高性能分数？

**A:** 优化FCP、LCP、TBT、CLS四个核心指标。

### Q3: Lighthouse和真实用户数据有差异吗？

**A:** 有差异，Lighthouse是模拟环境，建议结合RUM数据。

### Q4: 移动端和桌面端分数差很多？

**A:** 正常，移动端网络和CPU较弱，需分别优化。

### Q5: 如何在CI中使用Lighthouse？

**A:** 使用Lighthouse CI或自定义脚本。

### Q6: 评分突然下降怎么办？

**A:** 对比历史报告，识别变化的指标和资源。

### Q7: 第三方脚本影响评分吗？

**A:** 会影响，建议异步加载或延迟加载。

### Q8: 如何设置合理的性能预算？

**A:** 基于竞品分析和业务需求。

### Q9: PWA分数重要吗？

**A:** 根据应用类型，移动优先应用应重视。

### Q10: React 19对Lighthouse评分有影响吗？

**A:** 新特性如Server Components可能提升评分。

## 总结

### 核心指标

```
1. FCP (首次内容绘制)
   目标: <1.8s
   优化: 服务器、关键资源、字体

2. LCP (最大内容绘制)
   目标: <2.5s
   优化: 图片、服务器、预加载

3. TBT (总阻塞时间)
   目标: <200ms
   优化: 代码分割、延迟加载

4. CLS (累积布局偏移)
   目标: <0.1
   优化: 尺寸预留、字体、动画
```

### 最佳实践

```
1. 定期审查
   ✅ 每次发布前测试
   ✅ CI自动化检查
   ✅ 设置性能预算
   ✅ 追踪历史趋势

2. 优化策略
   ✅ 针对性优化低分项
   ✅ 平衡各项指标
   ✅ 真实环境测试
   ✅ 持续监控改进

3. 团队协作
   ✅ 共享报告
   ✅ 设定标准
   ✅ 审查流程
   ✅ 知识传承
```

Lighthouse是web性能优化的黄金标准，定期审查和优化能确保应用始终保持最佳性能。

