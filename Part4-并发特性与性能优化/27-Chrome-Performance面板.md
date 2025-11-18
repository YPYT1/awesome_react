# Chrome Performance面板

## 第一部分：Performance面板基础

### 1.1 工具介绍

Chrome Performance面板是Chrome DevTools中的性能分析工具，用于记录和分析网页运行时的性能表现，包括JavaScript执行、渲染、绘制等各个环节。

**打开方式：**

```
1. Chrome DevTools (F12)
2. 切换到"Performance"标签
3. 或使用快捷键：Ctrl+Shift+E (Windows/Linux) 或 Cmd+Shift+E (Mac)
```

**主要功能：**

```
1. 运行时性能记录
2. CPU使用率分析
3. 火焰图可视化
4. 网络请求追踪
5. 帧率监控
6. 内存快照
```

### 1.2 基本操作

```javascript
// 1. 开始记录
// - 点击Record按钮（圆形图标）
// - 或按 Ctrl+E (Windows) / Cmd+E (Mac)

// 2. 执行操作
// - 与页面交互
// - 触发要分析的功能
// - 建议记录3-10秒

// 3. 停止记录
// - 再次点击Record按钮
// - 或按 Ctrl+E / Cmd+E

// 4. 分析结果
// - 查看Overview面板
// - 分析Main线程活动
// - 检查FPS、CPU、NET

// 编程触发性能记录
console.profile('My Profile');
// 执行代码
performHeavyOperation();
console.profileEnd('My Profile');

// Performance API
const measure = () => {
  performance.mark('start');
  
  // 执行操作
  doSomething();
  
  performance.mark('end');
  performance.measure('operation', 'start', 'end');
  
  const measures = performance.getEntriesByType('measure');
  console.log('Duration:', measures[0].duration);
};

// User Timing API
performance.mark('component-render-start');
ReactDOM.render(<App />, root);
performance.mark('component-render-end');

performance.measure(
  'component-render',
  'component-render-start',
  'component-render-end'
);
```

### 1.3 界面解读

```javascript
// Overview区域
/*
FPS: 帧率图表
  - 绿色：60fps流畅
  - 黄色：30-60fps一般
  - 红色：<30fps卡顿

CPU: CPU使用率
  - 蓝色：JavaScript执行
  - 黄色：渲染
  - 紫色：绘制
  - 绿色：其他

NET: 网络请求
  - 每条线代表一个请求
  - 长度代表时间
*/

// Main线程
/*
火焰图：
  - Task: 单个任务
  - Long Task: >50ms的任务（性能问题）
  - 调用栈：从上到下的函数调用
*/

// 示例分析
/*
Main线程火焰图：
Task (200ms) - 红色，长任务！
├── onClick (150ms)
│   ├── setState (10ms)
│   ├── render (100ms) - 瓶颈
│   │   ├── ComponentA (80ms) - 最大瓶颈
│   │   └── ComponentB (20ms)
│   └── commit (40ms)
└── browser paint (50ms)

结论：ComponentA渲染慢，需优化
*/
```

### 1.4 常用功能

```javascript
// 1. 屏幕截图
// 勾选"Screenshots"查看每一帧的截图
// 可以看到UI变化过程

// 2. 网络节流
// 在Performance面板设置：
// - No throttling（无限制）
// - Fast 3G
// - Slow 3G
// - Offline

// 3. CPU节流
// 模拟低端设备：
// - No throttling（无限制）
// - 4x slowdown
// - 6x slowdown

// 4. 搜索功能
// Ctrl+F 搜索函数名或事件
// 快速定位特定操作

// 5. 时间选择
// 拖动Overview区域选择时间范围
// 聚焦特定时间段的分析

// 6. Bottom-Up视图
// 查看函数总耗时
// 识别耗时最多的函数

// 7. Call Tree视图
// 查看完整调用树
// 分析函数调用关系

// 8. Event Log视图
// 按时间顺序查看所有事件
// 追踪事件触发流程
```

## 第二部分：React性能分析

### 2.1 组件渲染分析

```javascript
// 标记组件渲染
function MyComponent({ value }) {
  performance.mark('MyComponent-render-start');
  
  // 组件渲染逻辑
  const result = expensiveCalculation(value);
  
  useEffect(() => {
    performance.mark('MyComponent-render-end');
    performance.measure(
      'MyComponent-render',
      'MyComponent-render-start',
      'MyComponent-render-end'
    );
  });
  
  return <div>{result}</div>;
}

// 在Performance面板中：
// User Timing区域会显示自定义标记

// 分析长任务
function analyzeMainThread() {
  // 在Performance面板Main线程中查找：
  // 1. Long Task（黄色警告条）
  // 2. >50ms的任务块
  // 3. 点击查看详细调用栈
}

// 常见问题模式：
/*
Task (150ms) - Long Task
├── React Schedule Update (10ms)
├── Render Phase (100ms) - 慢！
│   ├── ComponentA (80ms) - 瓶颈
│   └── ComponentB (20ms)
└── Commit Phase (40ms)
*/
```

### 2.2 交互延迟分析

```javascript
// 用户交互标记
function trackInteraction(name, callback) {
  const interactionId = `interaction-${name}-${Date.now()}`;
  
  performance.mark(`${interactionId}-start`);
  
  callback();
  
  requestAnimationFrame(() => {
    performance.mark(`${interactionId}-end`);
    performance.measure(
      interactionId,
      `${interactionId}-start`,
      `${interactionId}-end`
    );
  });
}

// 使用
function Button() {
  const handleClick = () => {
    trackInteraction('button-click', () => {
      updateState();
    });
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// 在Performance面板分析：
// 1. 找到interaction标记
// 2. 查看从点击到视觉反馈的时间
// 3. 目标：<100ms感觉即时，<300ms可接受

// 识别掉帧
/*
FPS图表：
60 ━━━━━━━━━━━━━━━━━━━━━━━━━━ (流畅)
30 ━━━━━━━━━━━━━━━━━━━━━━━━━━ (一般)
0  ▃▅▂▇▁▅▃▂  (卡顿！)

掉帧原因：
- JavaScript执行时间过长
- 复杂的DOM操作
- 强制同步布局
- 大量重绘
*/
```

### 2.3 内存泄漏检测

```javascript
// 使用Performance面板检测内存增长
// 1. 开始记录并勾选"Memory"
// 2. 执行可能导致泄漏的操作多次
// 3. 观察Memory图表是否持续上升

// 常见泄漏场景
function LeakyComponent() {
  useEffect(() => {
    // ❌ 未清理的定时器
    setInterval(() => {
      console.log('tick');
    }, 1000);
    
    // ❌ 未清理的事件监听
    window.addEventListener('resize', handleResize);
    
    // ❌ 未清理的订阅
    const subscription = observable.subscribe(handleData);
  }, []);
  
  // 组件卸载时内存没有释放
}

// 正确的清理
function CleanComponent() {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    window.addEventListener('resize', handleResize);
    const subscription = observable.subscribe(handleData);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
      subscription.unsubscribe();
    };
  }, []);
}

// 在Performance面板检查：
// 重复操作后，Memory图表应该稳定或波动
// 持续上升表明可能有内存泄漏
```

## 第三部分：高级分析

### 3.1 Long Task分析

```javascript
// 识别Long Task
// Performance面板中：
// - 黄色/红色警告条
// - 标注"Long Task"
// - 点击查看详情

// 优化Long Task
// 问题代码
function HeavyTask() {
  const data = largeArray.map(item => {
    return expensiveOperation(item);  // 阻塞主线程
  });
  
  return <List items={data} />;
}

// 优化1：使用useMemo
function OptimizedTask1() {
  const data = useMemo(() => {
    return largeArray.map(item => expensiveOperation(item));
  }, [largeArray]);
  
  return <List items={data} />;
}

// 优化2：分批处理
function OptimizedTask2() {
  const [processedData, setProcessedData] = useState([]);
  
  useEffect(() => {
    const batchSize = 100;
    let index = 0;
    
    function processBatch() {
      const batch = largeArray.slice(index, index + batchSize);
      const processed = batch.map(item => expensiveOperation(item));
      
      setProcessedData(prev => [...prev, ...processed]);
      
      index += batchSize;
      
      if (index < largeArray.length) {
        requestIdleCallback(processBatch);
      }
    }
    
    processBatch();
  }, [largeArray]);
  
  return <List items={processedData} />;
}

// 优化3：Web Worker
function OptimizedTask3() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const worker = new Worker('worker.js');
    
    worker.postMessage({ data: largeArray });
    
    worker.onmessage = (e) => {
      setData(e.data);
    };
    
    return () => worker.terminate();
  }, [largeArray]);
  
  return <List items={data} />;
}

// worker.js
self.onmessage = (e) => {
  const result = e.data.data.map(item => expensiveOperation(item));
  self.postMessage(result);
};
```

### 3.2 强制同步布局检测

```javascript
// 强制同步布局（Layout Thrashing）
// ❌ 问题代码
function BadLayout() {
  const divs = document.querySelectorAll('.item');
  
  divs.forEach(div => {
    div.style.width = div.offsetWidth + 10 + 'px';
    // 读取offsetWidth触发布局
    // 写入width触发重新布局
    // 读-写-读-写导致多次布局
  });
}

// Performance面板显示：
// 多个紫色Layout块，性能差

// ✅ 优化：批量读取，批量写入
function GoodLayout() {
  const divs = document.querySelectorAll('.item');
  
  // 批量读取
  const widths = Array.from(divs).map(div => div.offsetWidth);
  
  // 批量写入
  divs.forEach((div, i) => {
    div.style.width = widths[i] + 10 + 'px';
  });
}

// Performance面板显示：
// 单个Layout块，性能好

// React中避免强制同步布局
function ReactComponent() {
  const ref = useRef();
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // ❌ 在effect中读取布局
    const width = ref.current.offsetWidth;
    setWidth(width);  // 触发重新渲染和布局
  });
  
  // ✅ 使用ResizeObserver
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width);
    });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return <div ref={ref}>Width: {width}</div>;
}
```

### 3.3 渲染性能分析

```javascript
// 分析FPS
// 在Performance面板：
// - FPS图表持续绿色：流畅（60fps）
// - 出现黄色或红色：卡顿

// 优化渲染性能
// 问题：频繁重绘
function FrequentRepaint() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      // 每次鼠标移动都触发setState -> 渲染 -> 重绘
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return <div style={{ left: position.x, top: position.y }}>Cursor</div>;
}

// Performance面板显示：
// - FPS图表剧烈波动
// - 大量Paint事件

// 优化：节流
function ThrottledRepaint() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    let rafId;
    
    const handleMouseMove = (e) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        rafId = null;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
  
  return <div style={{ left: position.x, top: position.y }}>Cursor</div>;
}

// Performance面板显示：
// - FPS稳定在60fps
// - Paint事件减少
```

## 第四部分：实战案例

### 4.1 列表滚动优化

```javascript
// 分析滚动性能
function ScrollAnalysis() {
  useEffect(() => {
    const handleScroll = () => {
      performance.mark('scroll-handler-start');
      
      // 处理滚动
      updateScrollPosition();
      
      performance.mark('scroll-handler-end');
      performance.measure(
        'scroll-handler',
        'scroll-handler-start',
        'scroll-handler-end'
      );
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// 在Performance面板查看：
// - scroll事件频率
// - 处理时间
// - 是否阻塞渲染

// 优化策略
// 1. 使用passive监听器
window.addEventListener('scroll', handler, { passive: true });

// 2. 使用RAF节流
let rafId = null;

const handleScroll = () => {
  if (rafId) return;
  
  rafId = requestAnimationFrame(() => {
    updateScrollPosition();
    rafId = null;
  });
};

// 3. 虚拟滚动
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

### 4.2 动画性能分析

```javascript
// CSS动画 vs JavaScript动画
// CSS动画（推荐）
.animated {
  transition: transform 0.3s ease-out;
  will-change: transform;
}

// Performance面板显示：
// - 在Compositor线程执行
// - 不阻塞Main线程
// - FPS稳定60

// JavaScript动画
function JSAnimation() {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    let start;
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      setPosition(Math.min(progress / 10, 100));
      
      if (progress < 1000) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);
  
  return (
    <div style={{ transform: `translateX(${position}px)` }}>
      Animated
    </div>
  );
}

// Performance面板显示：
// - 在Main线程执行
// - 可能阻塞其他任务
// - 使用transform而非left/top优化性能

// 优化动画性能
// 1. 使用transform和opacity
// ✅ 好
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

// ❌ 差
.animated {
  left: 100px;
  background-color: red;
}

// 2. 使用will-change提示浏览器
.will-animate {
  will-change: transform, opacity;
}

// 3. 动画完成后移除will-change
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

### 4.3 网络请求分析

```javascript
// 分析数据获取性能
function DataFetchAnalysis() {
  useEffect(() => {
    performance.mark('fetch-start');
    
    fetch('/api/data')
      .then(res => {
        performance.mark('fetch-response');
        return res.json();
      })
      .then(data => {
        performance.mark('fetch-complete');
        
        performance.measure('fetch-network', 'fetch-start', 'fetch-response');
        performance.measure('fetch-parse', 'fetch-response', 'fetch-complete');
        
        const measures = performance.getEntriesByType('measure');
        console.log('Network:', measures[0].duration);
        console.log('Parse:', measures[1].duration);
      });
  }, []);
}

// Performance面板NET区域：
// - 查看请求时序
// - 识别瀑布式请求
// - 优化并行请求

// 优化请求性能
// 问题：串行请求
async function serialRequests() {
  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch(`/api/posts/${user.id}`).then(r => r.json());
  const comments = await fetch(`/api/comments/${user.id}`).then(r => r.json());
  
  return { user, posts, comments };
}

// Performance显示：
// request1 ━━━━━━━
//           request2 ━━━━━━━
//                     request3 ━━━━━━━
// 总时间：300ms

// 优化：并行请求
async function parallelRequests() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { user, posts, comments };
}

// Performance显示：
// request1 ━━━━━━━
// request2 ━━━━━━━
// request3 ━━━━━━━
// 总时间：100ms（最慢的那个）
```

## 注意事项

### 1. 隐私模式

```javascript
// 在隐私模式/访客模式下分析
// 避免扩展干扰
// 获得更准确的结果
```

### 2. 多次测量

```javascript
// 单次测量可能不准确
// 建议测量3-5次取平均值

const measureMultiple = async (fn, times = 5) => {
  const durations = [];
  
  for (let i = 0; i < times; i++) {
    performance.mark('start');
    await fn();
    performance.mark('end');
    
    performance.measure('test', 'start', 'end');
    const measure = performance.getEntriesByName('test').pop();
    durations.push(measure.duration);
    
    performance.clearMarks();
    performance.clearMeasures();
  }
  
  const avg = durations.reduce((a, b) => a + b) / durations.length;
  console.log('Average:', avg);
  console.log('Min:', Math.min(...durations));
  console.log('Max:', Math.max(...durations));
};
```

### 3. 环境一致性

```javascript
// 保持测试环境一致
// - 相同的硬件
// - 相同的浏览器版本
// - 相同的网络条件
// - 关闭其他标签页
```

## 常见问题

### Q1: Performance面板和Profiler的区别？

**A:** Performance分析整个页面，Profiler专注React组件。

### Q2: 如何导出Performance数据？

**A:** 点击下载按钮，保存为JSON文件。

### Q3: Long Task的阈值是多少？

**A:** 超过50ms被视为Long Task。

### Q4: FPS多少算流畅？

**A:** 60fps最佳，30fps可接受，低于30fps卡顿。

### Q5: 如何分析第三方脚本性能？

**A:** 在Call Tree中查找第三方域名。

### Q6: Memory图表持续上升怎么办？

**A:** 可能有内存泄漏，检查事件监听器和定时器清理。

### Q7: 如何测量首次渲染时间？

**A:** 使用performance.timing或Navigation Timing API。

### Q8: 移动设备如何分析？

**A:** 使用Remote Debugging或CPU/网络节流模拟。

### Q9: 如何自动化性能测试？

**A:** 使用Puppeteer + Performance API。

### Q10: React 19在Performance面板有什么不同？

**A:** 并发特性可能显示不同的任务调度模式。

## 总结

### 核心要点

```
1. Performance面板功能
   ✅ 运行时性能记录
   ✅ FPS监控
   ✅ CPU分析
   ✅ 网络追踪

2. 分析指标
   ✅ FPS帧率
   ✅ Long Task
   ✅ 渲染时间
   ✅ 内存使用

3. 优化方向
   ✅ 减少Long Task
   ✅ 优化渲染
   ✅ 避免强制同步布局
   ✅ 优化动画
```

### 最佳实践

```
1. 分析流程
   ✅ 记录用户场景
   ✅ 识别性能瓶颈
   ✅ 应用优化
   ✅ 验证改进

2. 使用技巧
   ✅ 隐私模式测试
   ✅ 多次测量
   ✅ CPU/网络节流
   ✅ 导出数据对比

3. 优化策略
   ✅ 代码分割
   ✅ 懒加载
   ✅ 虚拟化
   ✅ Web Worker
```

Chrome Performance面板是web性能分析的瑞士军刀，掌握它能全面诊断和优化应用性能。

