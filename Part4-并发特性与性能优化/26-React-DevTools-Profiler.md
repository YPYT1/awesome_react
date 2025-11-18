# React DevTools Profiler

## 第一部分：Profiler工具基础

### 1.1 什么是React DevTools Profiler

React DevTools Profiler是React官方提供的性能分析工具，用于记录和分析组件的渲染性能，帮助识别性能瓶颈。

**安装：**

```bash
# Chrome扩展
# 在Chrome Web Store搜索 "React Developer Tools"

# Firefox扩展
# 在Firefox Add-ons搜索 "React Developer Tools"

# Standalone应用
npm install -g react-devtools
react-devtools
```

**主要功能：**

```
1. 组件渲染时间记录
2. 渲染原因分析
3. 火焰图可视化
4. 排名图查看
5. 交互追踪
6. 提交分析
```

### 1.2 启动和使用

```javascript
// 开发环境自动可用
// 1. 打开Chrome DevTools
// 2. 切换到"Profiler"标签
// 3. 点击"Record"按钮
// 4. 与应用交互
// 5. 点击"Stop"停止记录
// 6. 分析结果

// 编程方式使用Profiler
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id,                   // Profiler组件的id
    phase,                // "mount" 或 "update"
    actualDuration,       // 本次渲染耗时
    baseDuration,         // 未优化的估计耗时
    startTime,            // React开始渲染的时间
    commitTime,           // React提交更新的时间
    interactions          // 本次更新的交互集合
  ) => {
    console.log({
      id,
      phase,
      actualDuration,
      baseDuration
    });
  };
  
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyComponent />
    </Profiler>
  );
}

// 嵌套Profiler
function NestedProfilers() {
  return (
    <Profiler id="App" onRender={onRenderApp}>
      <Header />
      
      <Profiler id="Main" onRender={onRenderMain}>
        <MainContent />
      </Profiler>
      
      <Profiler id="Sidebar" onRender={onRenderSidebar}>
        <Sidebar />
      </Profiler>
    </Profiler>
  );
}

// 条件性Profiler
function ConditionalProfiler({ enableProfiling, children }) {
  if (enableProfiling) {
    return (
      <Profiler id="conditional" onRender={onRender}>
        {children}
      </Profiler>
    );
  }
  
  return children;
}
```

### 1.3 火焰图解读

```javascript
// 火焰图显示：
// - 横轴：时间线
// - 纵轴：组件层级
// - 颜色：渲染时间（黄色=快，红色=慢）
// - 宽度：渲染持续时间

// 示例分析
/*
App (10ms)
├── Header (1ms) - 绿色
├── Main (8ms) - 黄色
│   ├── List (6ms) - 红色  ⚠️ 性能瓶颈
│   └── Sidebar (2ms) - 绿色
└── Footer (1ms) - 绿色
*/

// 识别问题：
// 1. 红色区域：渲染慢的组件
// 2. 宽度大：耗时长
// 3. 频繁渲染：高频更新

// 优化重点：
// - 优化红色组件
// - 减少不必要渲染
// - 使用memo/useMemo/useCallback
```

### 1.4 排名图解读

```javascript
// 排名图显示：
// - 按渲染时间排序的组件列表
// - 每个组件的渲染次数
// - 总耗时和平均耗时

// 示例数据
/*
Component       Renders  Total Time  Avg Time
List            15       450ms       30ms    ⚠️ 关注
ListItem        150      300ms       2ms
Header          5        10ms        2ms
Footer          5        10ms        2ms
*/

// 分析要点：
// 1. 渲染次数：是否过多？
// 2. 总耗时：是否占比大？
// 3. 平均耗时：单次是否慢？

// 优化策略：
// - 渲染次数多 → React.memo
// - 单次耗时长 → useMemo优化计算
// - 总耗时高 → 拆分组件或虚拟化
```

## 第二部分：实战分析

### 2.1 识别性能瓶颈

```javascript
// 分析慢速组件
function SlowComponent({ items }) {
  // 问题1：未优化的过滤
  const filteredItems = items.filter(item => item.active);
  
  // 问题2：未优化的排序
  const sortedItems = filteredItems.sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // 问题3：未优化的映射
  const displayItems = sortedItems.map(item => ({
    id: item.id,
    label: `${item.name} - ${item.description}`
  }));
  
  return (
    <ul>
      {displayItems.map(item => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
}

// 使用Profiler查看：
// - actualDuration: 50ms（慢！）
// - 每次parent渲染都重新计算

// 优化后
function OptimizedComponent({ items }) {
  const displayItems = useMemo(() => {
    return items
      .filter(item => item.active)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => ({
        id: item.id,
        label: `${item.name} - ${item.description}`
      }));
  }, [items]);
  
  return (
    <ul>
      {displayItems.map(item => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
}

// Profiler显示：
// - actualDuration: 5ms（快！）
// - items不变时不重新计算
```

### 2.2 分析渲染频率

```javascript
// 检测过度渲染
function OverRenderingComponent({ value }) {
  console.log('Rendering...');  // 在Profiler中查看调用次数
  
  return <div>{value}</div>;
}

// 在Profiler中观察：
// - 如果parent更新，child是否也渲染？
// - props没变，是否还在渲染？

// 优化：使用React.memo
const OptimizedComponent = React.memo(function Component({ value }) {
  console.log('Rendering...');
  return <div>{value}</div>;
});

// Profiler记录性能
function App() {
  const [metrics, setMetrics] = useState([]);
  
  const onRender = useCallback((
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    setMetrics(prev => [...prev, {
      id,
      phase,
      actualDuration,
      timestamp: Date.now()
    }]);
    
    // 警告慢速渲染
    if (actualDuration > 16) {  // 16ms = 60fps
      console.warn(`Slow render in ${id}: ${actualDuration}ms`);
    }
  }, []);
  
  return (
    <Profiler id="App" onRender={onRender}>
      <MyApp />
      <MetricsDisplay metrics={metrics} />
    </Profiler>
  );
}
```

### 2.3 分析组件更新原因

```javascript
// 使用React DevTools查看更新原因
// 1. 在Profiler中选择一个提交
// 2. 点击组件
// 3. 查看右侧"Why did this render?"

// 常见原因：
// - Props changed
// - State changed
// - Context changed
// - Parent rendered
// - Hooks changed

// 自定义更新原因追踪
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// 使用
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props);
  
  return <div>{props.value}</div>;
}
```

### 2.4 交互追踪

```javascript
// 使用unstable_trace (实验性)
import { unstable_trace as trace } from 'scheduler/tracing';

function handleClick() {
  trace('button-click', performance.now(), () => {
    // 这里的更新会被追踪
    setState(newValue);
  });
}

// 在Profiler中查看交互
// 可以看到是哪个用户交互触发的渲染

// 自定义交互追踪
function useInteractionTracking() {
  const [interactions, setInteractions] = useState([]);
  
  const trackInteraction = useCallback((name, callback) => {
    const startTime = performance.now();
    
    callback();
    
    const duration = performance.now() - startTime;
    
    setInteractions(prev => [...prev, {
      name,
      duration,
      timestamp: Date.now()
    }]);
  }, []);
  
  return { interactions, trackInteraction };
}

// 使用
function App() {
  const { interactions, trackInteraction } = useInteractionTracking();
  
  const handleClick = () => {
    trackInteraction('button-click', () => {
      setCount(c => c + 1);
    });
  };
  
  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <InteractionLog interactions={interactions} />
    </div>
  );
}
```

## 第三部分：优化实践

### 3.1 基于Profiler的优化流程

```javascript
// Step 1: 记录基线
// 运行Profiler，记录当前性能

// Step 2: 识别问题
// - 哪些组件渲染慢？
// - 哪些组件渲染频繁？
// - 是否有不必要的渲染？

// Step 3: 应用优化
const ProblematicComponent = React.memo(function ProblematicComponent({ data }) {
  const processed = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);
  
  return <Display data={processed} />;
});

// Step 4: 再次Profile
// 对比优化前后的性能指标

// Step 5: 验证改进
// - actualDuration是否减少？
// - 渲染次数是否降低？
// - 用户体验是否提升？

// 完整示例
function OptimizationWorkflow() {
  const [optimized, setOptimized] = useState(false);
  const [metrics, setMetrics] = useState({ before: null, after: null });
  
  const onRender = useCallback((id, phase, actualDuration) => {
    if (!optimized && !metrics.before) {
      setMetrics(m => ({ ...m, before: actualDuration }));
    } else if (optimized && !metrics.after) {
      setMetrics(m => ({ ...m, after: actualDuration }));
    }
  }, [optimized, metrics]);
  
  return (
    <div>
      <button onClick={() => setOptimized(!optimized)}>
        Toggle Optimization
      </button>
      
      {metrics.before && metrics.after && (
        <div>
          <p>Before: {metrics.before.toFixed(2)}ms</p>
          <p>After: {metrics.after.toFixed(2)}ms</p>
          <p>Improvement: {((1 - metrics.after / metrics.before) * 100).toFixed(2)}%</p>
        </div>
      )}
      
      <Profiler id="test" onRender={onRender}>
        {optimized ? <OptimizedComponent /> : <UnoptimizedComponent />}
      </Profiler>
    </div>
  );
}
```

### 3.2 常见性能问题

```javascript
// 问题1：过度渲染
function OverRendering() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      {/* 每次count变化，HeavyComponent都重新渲染 */}
      <HeavyComponent data={staticData} />
    </div>
  );
}

// Profiler显示：HeavyComponent在count变化时渲染
// 优化：使用memo
const MemoizedHeavyComponent = React.memo(HeavyComponent);

// 问题2：昂贵的计算
function ExpensiveComputation({ items }) {
  // 每次渲染都执行
  const result = items
    .filter(item => item.active)
    .map(item => complexTransform(item))
    .sort((a, b) => expensiveCompare(a, b));
  
  return <List items={result} />;
}

// Profiler显示：actualDuration很高
// 优化：使用useMemo
function OptimizedComputation({ items }) {
  const result = useMemo(() => {
    return items
      .filter(item => item.active)
      .map(item => complexTransform(item))
      .sort((a, b) => expensiveCompare(a, b));
  }, [items]);
  
  return <List items={result} />;
}

// 问题3：不稳定的props
function UnstableProps() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Inc</button>
      
      {/* 每次都是新对象 */}
      <Child config={{ theme: 'dark' }} />
    </div>
  );
}

// Profiler显示：Child每次都渲染
// 优化：稳定props
function StableProps() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({ theme: 'dark' }), []);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Inc</button>
      <Child config={config} />
    </div>
  );
}
```

### 3.3 性能数据收集

```javascript
// 收集和上报性能数据
function PerformanceMonitor({ children }) {
  const metricsRef = useRef([]);
  
  const onRender = useCallback((
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    metricsRef.current.push({
      id,
      phase,
      actualDuration,
      baseDuration,
      timestamp: Date.now()
    });
    
    // 定期上报
    if (metricsRef.current.length >= 10) {
      reportMetrics(metricsRef.current);
      metricsRef.current = [];
    }
  }, []);
  
  useEffect(() => {
    return () => {
      // 组件卸载时上报剩余数据
      if (metricsRef.current.length > 0) {
        reportMetrics(metricsRef.current);
      }
    };
  }, []);
  
  return (
    <Profiler id="app" onRender={onRender}>
      {children}
    </Profiler>
  );
}

function reportMetrics(metrics) {
  fetch('/api/performance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metrics,
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  });
}

// 性能统计
function analyzeMetrics(metrics) {
  const stats = {
    totalRenders: metrics.length,
    totalTime: metrics.reduce((sum, m) => sum + m.actualDuration, 0),
    avgTime: 0,
    slowestRender: null,
    fastestRender: null
  };
  
  stats.avgTime = stats.totalTime / stats.totalRenders;
  
  stats.slowestRender = metrics.reduce((slowest, current) =>
    current.actualDuration > slowest.actualDuration ? current : slowest
  );
  
  stats.fastestRender = metrics.reduce((fastest, current) =>
    current.actualDuration < fastest.actualDuration ? current : fastest
  );
  
  return stats;
}
```

## 注意事项

### 1. 生产环境

```javascript
// Profiler在生产环境默认禁用
// 如需启用，使用特殊构建

// React < 17
import ReactDOM from 'react-dom';
import { unstable_Profiler as Profiler } from 'react';

// React 17+
import { Profiler } from 'react';

// Profiler有性能开销，生产环境谨慎使用
```

### 2. 数据解读

```javascript
// actualDuration vs baseDuration
// actualDuration: 实际渲染时间（包括优化）
// baseDuration: 估计的未优化时间

// 如果actualDuration远小于baseDuration，说明优化有效
```

### 3. 采样率

```javascript
// 不要在高频操作中使用Profiler
// 会产生大量数据，影响性能

// 使用采样
let sampleCount = 0;

const onRender = (...args) => {
  sampleCount++;
  
  if (sampleCount % 10 === 0) {  // 只记录10%
    recordMetrics(...args);
  }
};
```

## 常见问题

### Q1: Profiler会影响性能吗？

**A:** 会有轻微影响，主要用于开发环境。

### Q2: 如何判断组件是否需要优化？

**A:** actualDuration >16ms或渲染频率过高。

### Q3: 火焰图和排名图哪个更有用？

**A:** 火焰图看层级关系，排名图看整体排序。

### Q4: 可以在生产环境使用吗？

**A:** 可以，但建议只在需要时启用。

### Q5: Profiler数据如何导出？

**A:** 使用onRender回调收集并上报。

### Q6: 如何分析第三方组件性能？

**A:** 将Profiler包裹在第三方组件外。

### Q7: Profiler和Chrome Performance的区别？

**A:** Profiler专注React，Performance分析整个页面。

### Q8: 如何自动化性能测试？

**A:** 使用Lighthouse CI或自定义脚本。

### Q9: actualDuration多少算快？

**A:** <16ms理想，<50ms可接受，>100ms需优化。

### Q10: Profiler支持React 19吗？

**A:** 完全支持，且有增强功能。

## 总结

### 核心要点

```
1. Profiler功能
   ✅ 渲染时间记录
   ✅ 火焰图可视化
   ✅ 排名分析
   ✅ 更新原因追踪

2. 分析指标
   ✅ actualDuration
   ✅ baseDuration
   ✅ 渲染次数
   ✅ 更新触发原因

3. 优化方向
   ✅ 减少渲染次数
   ✅ 优化渲染时间
   ✅ 稳定props/state
   ✅ 使用memo
```

### 最佳实践

```
1. 分析流程
   ✅ 记录基线
   ✅ 识别瓶颈
   ✅ 应用优化
   ✅ 验证改进

2. 使用技巧
   ✅ 开发环境分析
   ✅ 定期审查
   ✅ 自动化监控
   ✅ 数据驱动优化

3. 性能目标
   ✅ <16ms渲染时间
   ✅ 最小化渲染次数
   ✅ 避免不必要更新
   ✅ 持续监控改进
```

React DevTools Profiler是性能优化的得力助手，掌握它能精准定位和解决性能问题。

## 第四部分：高级分析技术

### 4.1 火焰图深度分析

```javascript
// 火焰图数据导出和分析
function exportFlameGraphData(profilerData) {
  const flameData = {
    name: 'root',
    value: profilerData.actualDuration,
    children: []
  };

  function buildFlameTree(fiber, parent) {
    if (!fiber) return;

    const node = {
      name: fiber.elementType?.name || fiber.type?.name || 'Unknown',
      value: fiber.actualDuration || 0,
      selfTime: fiber.selfBaseDuration || 0,
      children: []
    };

    if (fiber.child) {
      buildFlameTree(fiber.child, node);
    }

    if (fiber.sibling) {
      buildFlameTree(fiber.sibling, parent);
    }

    parent.children.push(node);
  }

  buildFlameTree(profilerData.fiber, flameData);

  return flameData;
}

// 识别性能热点
function identifyHotspots(flameData, threshold = 16) {
  const hotspots = [];

  function traverse(node, path = []) {
    const currentPath = [...path, node.name];

    if (node.selfTime > threshold) {
      hotspots.push({
        component: currentPath.join(' > '),
        selfTime: node.selfTime,
        totalTime: node.value,
        severity: node.selfTime > 50 ? 'critical' : node.selfTime > 30 ? 'high' : 'medium'
      });
    }

    if (node.children) {
      node.children.forEach(child => traverse(child, currentPath));
    }
  }

  traverse(flameData);

  return hotspots.sort((a, b) => b.selfTime - a.selfTime);
}

// 使用
const flameData = exportFlameGraphData(profilerData);
const hotspots = identifyHotspots(flameData);

console.log('Performance Hotspots:');
hotspots.forEach(({ component, selfTime, severity }) => {
  console.log(`[${severity.toUpperCase()}] ${component}: ${selfTime.toFixed(2)}ms`);
});
```

### 4.2 提交阶段分析

```javascript
// 分析React提交阶段
class CommitPhaseAnalyzer {
  constructor() {
    this.commits = [];
  }

  recordCommit(commitData) {
    this.commits.push({
      id: commitData.id,
      phase: commitData.phase,
      actualDuration: commitData.actualDuration,
      baseDuration: commitData.baseDuration,
      startTime: commitData.startTime,
      commitTime: commitData.commitTime,
      interactions: commitData.interactions
    });
  }

  analyzeCommits() {
    const analysis = {
      totalCommits: this.commits.length,
      avgDuration: 0,
      slowestCommit: null,
      fastestCommit: null,
      mountVsUpdate: { mount: 0, update: 0 },
      interactionBreakdown: {}
    };

    if (this.commits.length === 0) return analysis;

    // 计算平均时间
    const totalDuration = this.commits.reduce((sum, c) => sum + c.actualDuration, 0);
    analysis.avgDuration = totalDuration / this.commits.length;

    // 找最慢和最快的提交
    analysis.slowestCommit = this.commits.reduce((slowest, current) =>
      current.actualDuration > slowest.actualDuration ? current : slowest
    );

    analysis.fastestCommit = this.commits.reduce((fastest, current) =>
      current.actualDuration < fastest.actualDuration ? current : fastest
    );

    // Mount vs Update统计
    this.commits.forEach(commit => {
      if (commit.phase === 'mount') {
        analysis.mountVsUpdate.mount++;
      } else {
        analysis.mountVsUpdate.update++;
      }
    });

    // 交互分析
    this.commits.forEach(commit => {
      if (commit.interactions) {
        commit.interactions.forEach(interaction => {
          if (!analysis.interactionBreakdown[interaction.name]) {
            analysis.interactionBreakdown[interaction.name] = {
              count: 0,
              totalDuration: 0,
              avgDuration: 0
            };
          }

          const breakdown = analysis.interactionBreakdown[interaction.name];
          breakdown.count++;
          breakdown.totalDuration += commit.actualDuration;
        });
      }
    });

    // 计算交互平均时间
    Object.values(analysis.interactionBreakdown).forEach(breakdown => {
      breakdown.avgDuration = breakdown.totalDuration / breakdown.count;
    });

    return analysis;
  }

  generateReport() {
    const analysis = this.analyzeCommits();

    console.log('Commit Phase Analysis Report');
    console.log('============================');
    console.log(`Total Commits: ${analysis.totalCommits}`);
    console.log(`Average Duration: ${analysis.avgDuration.toFixed(2)}ms`);
    console.log(`\nMount vs Update:`);
    console.log(`  Mount: ${analysis.mountVsUpdate.mount}`);
    console.log(`  Update: ${analysis.mountVsUpdate.update}`);

    if (analysis.slowestCommit) {
      console.log(`\nSlowest Commit:`);
      console.log(`  ID: ${analysis.slowestCommit.id}`);
      console.log(`  Duration: ${analysis.slowestCommit.actualDuration.toFixed(2)}ms`);
      console.log(`  Phase: ${analysis.slowestCommit.phase}`);
    }

    if (Object.keys(analysis.interactionBreakdown).length > 0) {
      console.log(`\nInteraction Breakdown:`);
      Object.entries(analysis.interactionBreakdown).forEach(([name, data]) => {
        console.log(`  ${name}:`);
        console.log(`    Count: ${data.count}`);
        console.log(`    Avg Duration: ${data.avgDuration.toFixed(2)}ms`);
      });
    }

    return analysis;
  }
}

// 使用
const analyzer = new CommitPhaseAnalyzer();

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) {
  analyzer.recordCommit({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  });
}

// 定期生成报告
setInterval(() => {
  analyzer.generateReport();
}, 30000);
```

### 4.3 组件更新链追踪

```javascript
// 追踪组件更新链
class UpdateChainTracker {
  constructor() {
    this.updateChains = [];
    this.currentChain = null;
  }

  startChain(rootComponent) {
    this.currentChain = {
      root: rootComponent,
      chain: [rootComponent],
      startTime: performance.now(),
      totalDuration: 0
    };
  }

  addToChain(component, reason) {
    if (this.currentChain) {
      this.currentChain.chain.push({
        component,
        reason,
        timestamp: performance.now()
      });
    }
  }

  endChain() {
    if (this.currentChain) {
      this.currentChain.totalDuration = performance.now() - this.currentChain.startTime;
      this.updateChains.push(this.currentChain);
      this.currentChain = null;
    }
  }

  analyzeLongestChains(count = 5) {
    return this.updateChains
      .sort((a, b) => b.chain.length - a.chain.length)
      .slice(0, count)
      .map(chain => ({
        root: chain.root,
        length: chain.chain.length,
        duration: chain.totalDuration,
        chain: chain.chain.map(c => c.component || c)
      }));
  }

  findCascadingUpdates() {
    return this.updateChains
      .filter(chain => chain.chain.length > 3)
      .map(chain => ({
        root: chain.root,
        cascade: chain.chain.map((c, i) => ({
          step: i + 1,
          component: c.component || c,
          reason: c.reason
        }))
      }));
  }
}

// 集成到应用
const updateTracker = new UpdateChainTracker();

function TrackedApp() {
  useEffect(() => {
    updateTracker.startChain('App');

    return () => {
      updateTracker.endChain();
    };
  }, []);

  return (
    <Profiler
      id="App"
      onRender={(id, phase) => {
        if (phase === 'update') {
          updateTracker.addToChain(id, 'state-change');
        }
      }}
    >
      <MyApp />
    </Profiler>
  );
}

// 分析结果
console.log('Longest Update Chains:', updateTracker.analyzeLongestChains());
console.log('Cascading Updates:', updateTracker.findCascadingUpdates());
```

### 4.4 内存与性能关联分析

```javascript
// 关联内存和渲染性能
class MemoryPerformanceAnalyzer {
  constructor() {
    this.samples = [];
  }

  recordSample(profilerData) {
    if (performance.memory) {
      this.samples.push({
        timestamp: Date.now(),
        actualDuration: profilerData.actualDuration,
        memoryUsed: performance.memory.usedJSHeapSize,
        memoryTotal: performance.memory.totalJSHeapSize,
        componentId: profilerData.id
      });

      // 保留最近100个样本
      if (this.samples.length > 100) {
        this.samples.shift();
      }
    }
  }

  analyzeCorrelation() {
    if (this.samples.length < 10) {
      return { correlation: 'insufficient-data' };
    }

    // 计算内存和性能的相关性
    const avgMemory = this.samples.reduce((sum, s) => sum + s.memoryUsed, 0) / this.samples.length;
    const avgDuration = this.samples.reduce((sum, s) => sum + s.actualDuration, 0) / this.samples.length;

    let correlation = 0;
    let varianceMemory = 0;
    let varianceDuration = 0;

    this.samples.forEach(sample => {
      const memDiff = sample.memoryUsed - avgMemory;
      const durDiff = sample.actualDuration - avgDuration;

      correlation += memDiff * durDiff;
      varianceMemory += memDiff * memDiff;
      varianceDuration += durDiff * durDiff;
    });

    correlation /= Math.sqrt(varianceMemory * varianceDuration);

    // 识别内存峰值
    const memoryPeaks = this.samples
      .filter(s => s.memoryUsed > avgMemory * 1.2)
      .sort((a, b) => b.memoryUsed - a.memoryUsed)
      .slice(0, 5);

    // 识别性能谷底
    const performanceLows = this.samples
      .filter(s => s.actualDuration > avgDuration * 1.5)
      .sort((a, b) => b.actualDuration - a.actualDuration)
      .slice(0, 5);

    return {
      correlation: correlation.toFixed(3),
      avgMemory: (avgMemory / 1024 / 1024).toFixed(2) + ' MB',
      avgDuration: avgDuration.toFixed(2) + ' ms',
      memoryPeaks: memoryPeaks.map(p => ({
        component: p.componentId,
        memory: (p.memoryUsed / 1024 / 1024).toFixed(2) + ' MB',
        duration: p.actualDuration.toFixed(2) + ' ms'
      })),
      performanceLows: performanceLows.map(p => ({
        component: p.componentId,
        duration: p.actualDuration.toFixed(2) + ' ms',
        memory: (p.memoryUsed / 1024 / 1024).toFixed(2) + ' MB'
      }))
    };
  }

  generateReport() {
    const analysis = this.analyzeCorrelation();

    console.log('Memory-Performance Correlation Analysis');
    console.log('========================================');

    if (analysis.correlation !== 'insufficient-data') {
      console.log(`Correlation Coefficient: ${analysis.correlation}`);
      console.log(`Average Memory: ${analysis.avgMemory}`);
      console.log(`Average Render Duration: ${analysis.avgDuration}`);

      if (analysis.memoryPeaks.length > 0) {
        console.log(`\nMemory Peaks:`);
        analysis.memoryPeaks.forEach(peak => {
          console.log(`  ${peak.component}: ${peak.memory} (${peak.duration})`);
        });
      }

      if (analysis.performanceLows.length > 0) {
        console.log(`\nPerformance Lows:`);
        analysis.performanceLows.forEach(low => {
          console.log(`  ${low.component}: ${low.duration} (${low.memory})`);
        });
      }
    }

    return analysis;
  }
}

// 使用
const memPerfAnalyzer = new MemoryPerformanceAnalyzer();

function onRender(id, phase, actualDuration) {
  memPerfAnalyzer.recordSample({ id, phase, actualDuration });
}

// 定期分析
setInterval(() => {
  memPerfAnalyzer.generateReport();
}, 60000);
```

## 第五部分：自动化优化建议

### 5.1 智能优化建议引擎

```javascript
// 基于Profiler数据的自动优化建议
class OptimizationSuggestionEngine {
  constructor() {
    this.rules = this.initializeRules();
  }

  initializeRules() {
    return [
      {
        name: 'high-render-count',
        check: (data) => data.renderCount > 10,
        severity: 'high',
        message: (data) => `${data.componentName} rendered ${data.renderCount} times`,
        suggestions: [
          'Consider using React.memo()',
          'Check if props are changing unnecessarily',
          'Use useCallback for function props',
          'Implement shouldComponentUpdate if class component'
        ]
      },
      {
        name: 'slow-render',
        check: (data) => data.actualDuration > 50,
        severity: 'critical',
        message: (data) => `${data.componentName} took ${data.actualDuration.toFixed(2)}ms to render`,
        suggestions: [
          'Profile the component to find expensive operations',
          'Use useMemo for expensive calculations',
          'Consider code splitting or lazy loading',
          'Check for large list rendering without virtualization'
        ]
      },
      {
        name: 'inefficient-updates',
        check: (data) => data.actualDuration > data.baseDuration * 2,
        severity: 'medium',
        message: (data) => `${data.componentName} has inefficient updates`,
        suggestions: [
          'Review component structure',
          'Check for unnecessary re-renders',
          'Optimize state updates',
          'Use React DevTools to identify update triggers'
        ]
      },
      {
        name: 'cascading-renders',
        check: (data) => data.childRenderCount > data.renderCount * 5,
        severity: 'high',
        message: (data) => `${data.componentName} triggers cascading renders`,
        suggestions: [
          'Use Context API to avoid prop drilling',
          'Implement memo for child components',
          'Consider state colocation',
          'Review component composition'
        ]
      }
    ];
  }

  analyze(profilerData) {
    const suggestions = [];

    this.rules.forEach(rule => {
      if (rule.check(profilerData)) {
        suggestions.push({
          rule: rule.name,
          severity: rule.severity,
          message: rule.message(profilerData),
          suggestions: rule.suggestions,
          component: profilerData.componentName
        });
      }
    });

    return suggestions;
  }

  generateReport(allData) {
    const allSuggestions = allData
      .flatMap(data => this.analyze(data))
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

    console.log('Optimization Suggestions Report');
    console.log('================================\n');

    allSuggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. [${suggestion.severity.toUpperCase()}] ${suggestion.message}`);
      console.log(`   Component: ${suggestion.component}`);
      console.log(`   Suggestions:`);
      suggestion.suggestions.forEach(s => {
        console.log(`   - ${s}`);
      });
      console.log('');
    });

    return allSuggestions;
  }
}

// 使用
const suggestionEngine = new OptimizationSuggestionEngine();
const profilerDataCollection = []; // 收集的profiler数据

const suggestions = suggestionEngine.generateReport(profilerDataCollection);
```

### 5.2 性能预算监控

```javascript
// 性能预算监控系统
class PerformanceBudgetMonitor {
  constructor(budgets) {
    this.budgets = budgets;
    this.violations = [];
  }

  checkBudget(componentId, actualDuration) {
    const budget = this.budgets[componentId] || this.budgets.default;

    if (actualDuration > budget) {
      this.violations.push({
        component: componentId,
        budget,
        actual: actualDuration,
        exceeded: actualDuration - budget,
        percentage: ((actualDuration - budget) / budget * 100).toFixed(2)
      });

      return false;
    }

    return true;
  }

  getViolations() {
    return this.violations.sort((a, b) => b.exceeded - a.exceeded);
  }

  generateAlert(violation) {
    const message = `Performance Budget Exceeded!
Component: ${violation.component}
Budget: ${violation.budget}ms
Actual: ${violation.actual.toFixed(2)}ms
Exceeded by: ${violation.exceeded.toFixed(2)}ms (${violation.percentage}%)`;

    if (typeof console.warn === 'function') {
      console.warn(message);
    }

    // 发送到监控系统
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/performance/violation', JSON.stringify(violation));
    }
  }

  reset() {
    this.violations = [];
  }
}

// 定义预算
const budgets = {
  default: 16,  // 60fps
  'App': 50,
  'Dashboard': 100,
  'HeavyComponent': 200
};

const budgetMonitor = new PerformanceBudgetMonitor(budgets);

function onRenderWithBudget(id, phase, actualDuration) {
  const withinBudget = budgetMonitor.checkBudget(id, actualDuration);

  if (!withinBudget) {
    const violations = budgetMonitor.getViolations();
    violations.forEach(v => budgetMonitor.generateAlert(v));
  }
}
```

## 总结强化

### 高级分析要点

```
1. 火焰图分析
   - 数据导出
   - 热点识别
   - 性能瓶颈定位
   - 优化路径规划

2. 提交阶段分析
   - 提交时间追踪
   - Mount vs Update
   - 交互关联分析
   - 性能趋势

3. 更新链追踪
   - 级联更新识别
   - 更新原因分析
   - 优化机会发现
   - 重构建议

4. 智能建议
   - 规则引擎
   - 自动化分析
   - 优先级排序
   - 行动计划
```

### 完整优化流程

```
第一步：数据收集
☐ 集成Profiler
☐ 记录渲染数据
☐ 收集用户交互
☐ 监控内存使用

第二步：深度分析
☐ 火焰图分析
☐ 提交阶段分析
☐ 更新链追踪
☐ 内存关联分析

第三步：问题识别
☐ 性能热点
☐ 过度渲染
☐ 级联更新
☐ 内存泄漏

第四步：优化建议
☐ 自动化建议
☐ 优先级排序
☐ ROI评估
☐ 实施计划

第五步：持续改进
☐ 性能预算
☐ 监控告警
☐ 趋势分析
☐ 迭代优化
```

React DevTools Profiler配合高级分析技术，能够系统化地优化React应用性能。

