# 时间切片 (Time Slicing)

## 第一部分：时间切片概述

### 1.1 什么是时间切片

时间切片（Time Slicing）是React实现可中断渲染的核心技术。它将长时间运行的渲染任务分割成多个小的工作单元，在浏览器的空闲时间执行，避免阻塞主线程。

**核心概念：**
- 将大任务拆分成小任务
- 在浏览器帧之间分配工作
- 保持UI响应性
- 优先处理用户交互

**浏览器帧结构：**

```
一个浏览器帧（16.67ms @ 60fps）:
┌─────────────────────────────────────┐
│ JavaScript (事件、定时器等)      ~5ms │
├─────────────────────────────────────┤
│ requestAnimationFrame回调        ~2ms │
├─────────────────────────────────────┤
│ Layout (重排)                    ~2ms │
├─────────────────────────────────────┤
│ Paint (重绘)                     ~2ms │
├─────────────────────────────────────┤
│ 空闲时间 (Idle)                  ~5ms │ ← React在这里工作
└─────────────────────────────────────┘
```

### 1.2 为什么需要时间切片

**React 15的问题：**

```javascript
// React 15 - 同步渲染，阻塞主线程
function HeavyComponent() {
  const items = Array.from({ length: 10000 }, (_, i) => i);
  
  return (
    <div>
      {items.map(item => (
        <div key={item}>
          {/* 复杂的组件 */}
          <ExpensiveItem value={item} />
        </div>
      ))}
    </div>
  );
}

// 渲染10000个组件可能需要1000ms
// 期间主线程被完全阻塞：
// ❌ 用户输入无响应
// ❌ 动画卡顿
// ❌ 页面冻结
```

**时间切片的解决方案：**

```javascript
// React 18 - 并发渲染，可中断
function HeavyComponent() {
  const items = Array.from({ length: 10000 }, (_, i) => i);
  
  return (
    <div>
      {items.map(item => (
        <div key={item}>
          <ExpensiveItem value={item} />
        </div>
      ))}
    </div>
  );
}

// 时间切片将渲染分成多个5ms的工作单元
// ✅ 每5ms检查是否需要让出控制权
// ✅ 处理用户输入
// ✅ 动画流畅
// ✅ 页面响应快速
```

### 1.3 时间切片的工作原理

**基本流程：**

```javascript
// 时间切片的核心循环
function workLoop(deadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    // 执行一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    
    // 检查是否需要让出控制权
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  if (nextUnitOfWork) {
    // 还有工作，下一帧继续
    requestIdleCallback(workLoop);
  } else {
    // 工作完成，提交更新
    commitRoot();
  }
}

// 启动时间切片
requestIdleCallback(workLoop);
```

**实际实现（简化版）：**

```javascript
// React的时间切片实现
let deadline = 0;
let yieldInterval = 5;  // 每5ms检查一次

function shouldYieldToHost() {
  const currentTime = performance.now();
  
  if (currentTime >= deadline) {
    // 当前帧时间用完
    if (needsPaint || isInputPending()) {
      return true;  // 让出控制权
    }
    
    // 更新deadline，继续工作
    deadline = currentTime + yieldInterval;
  }
  
  return false;
}

function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYieldToHost()) {
    performUnitOfWork(workInProgress);
  }
}
```

## 第二部分：调度器（Scheduler）

### 2.1 Scheduler包的作用

Scheduler是React团队开发的独立调度库，负责管理任务的优先级和执行时机。

**核心功能：**

```javascript
import {
  unstable_scheduleCallback as scheduleCallback,
  unstable_cancelCallback as cancelCallback,
  unstable_shouldYield as shouldYield,
  unstable_NormalPriority as NormalPriority,
  unstable_UserBlockingPriority as UserBlockingPriority,
  unstable_ImmediatePriority as ImmediatePriority,
  unstable_LowPriority as LowPriority,
  unstable_IdlePriority as IdlePriority
} from 'scheduler';

// 调度不同优先级的任务
function scheduleTask(priority, callback) {
  const task = scheduleCallback(priority, callback);
  return task;
}

// 取消任务
function cancelTask(task) {
  cancelCallback(task);
}

// 检查是否应该让出
function checkYield() {
  return shouldYield();
}
```

### 2.2 优先级系统

Scheduler定义了5个优先级级别：

```javascript
// Scheduler优先级
const priorities = {
  ImmediatePriority: 1,      // 立即执行（最高优先级）
  UserBlockingPriority: 2,   // 用户交互
  NormalPriority: 3,         // 普通优先级
  LowPriority: 4,            // 低优先级
  IdlePriority: 5            // 空闲时执行
};

// 优先级对应的超时时间
const timeoutForPriority = {
  [ImmediatePriority]: -1,          // 立即执行
  [UserBlockingPriority]: 250,      // 250ms
  [NormalPriority]: 5000,           // 5s
  [LowPriority]: 10000,             // 10s
  [IdlePriority]: maxSigned31BitInt // 永不过期
};

// 使用示例
function handleUserClick() {
  // 用户交互 - 高优先级
  scheduleCallback(UserBlockingPriority, () => {
    updateUI();
  });
}

function loadData() {
  // 数据加载 - 普通优先级
  scheduleCallback(NormalPriority, () => {
    fetchAndRender();
  });
}

function prefetchResources() {
  // 预加载 - 低优先级
  scheduleCallback(LowPriority, () => {
    prefetch();
  });
}

function analytics() {
  // 分析 - 空闲时执行
  scheduleCallback(IdlePriority, () => {
    sendAnalytics();
  });
}
```

### 2.3 任务队列管理

Scheduler使用最小堆（Min Heap）管理任务队列：

```javascript
// 任务队列结构
const taskQueue = [];        // 未过期的任务
const timerQueue = [];       // 延迟任务

// 任务结构
interface Task {
  id: number;                // 任务ID
  callback: Function;        // 任务回调
  priorityLevel: Priority;   // 优先级
  startTime: number;         // 开始时间
  expirationTime: number;    // 过期时间
  sortIndex: number;         // 排序索引
}

// 调度任务
function unstable_scheduleCallback(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  
  let startTime;
  if (options?.delay > 0) {
    startTime = currentTime + options.delay;
  } else {
    startTime = currentTime;
  }
  
  const timeout = timeoutForPriority[priorityLevel];
  const expirationTime = startTime + timeout;
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: expirationTime
  };
  
  if (startTime > currentTime) {
    // 延迟任务，加入timerQueue
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    
    if (peek(taskQueue) === null && peek(timerQueue) === newTask) {
      // 设置定时器
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    // 立即任务，加入taskQueue
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    
    // 开始调度
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  
  return newTask;
}

// 最小堆操作
function push(heap, node) {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

function peek(heap) {
  return heap.length === 0 ? null : heap[0];
}

function pop(heap) {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop();
  
  if (last !== first) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  
  return first;
}
```

### 2.4 MessageChannel实现

现代React使用MessageChannel代替requestIdleCallback：

```javascript
// MessageChannel实现时间切片
const channel = new MessageChannel();
const port = channel.port2;

channel.port1.onmessage = () => {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    const hasTimeRemaining = frameDeadline - currentTime > 0;
    
    try {
      const hasMoreWork = scheduledHostCallback(
        hasTimeRemaining,
        currentTime
      );
      
      if (!hasMoreWork) {
        scheduledHostCallback = null;
      } else {
        // 还有工作，下一帧继续
        port.postMessage(null);
      }
    } catch (error) {
      // 错误处理
      port.postMessage(null);
      throw error;
    }
  }
};

function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);
  }
}

// 设置帧deadline
let frameDeadline = 0;
const frameInterval = Math.floor(1000 / 60);  // 16.67ms

function forceFrameRate(fps) {
  if (fps < 0 || fps > 125) {
    return;
  }
  
  if (fps > 0) {
    frameInterval = Math.floor(1000 / fps);
  }
}

// 完整示例
function scheduleWork() {
  requestHostCallback((hasTimeRemaining, currentTime) => {
    frameDeadline = currentTime + frameInterval;
    
    while (workInProgress && hasTimeRemaining && !shouldYield()) {
      workInProgress = performUnitOfWork(workInProgress);
      hasTimeRemaining = getCurrentTime() < frameDeadline;
    }
    
    return workInProgress !== null;  // 返回是否还有工作
  });
}
```

## 第三部分：时间切片实战

### 3.1 长列表渲染优化

```javascript
// 问题：渲染大列表导致页面卡顿
function SlowList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <ExpensiveItem data={item} />
        </li>
      ))}
    </ul>
  );
}

// 解决方案1：使用Transition
import { useTransition } from 'react';

function OptimizedList({ items }) {
  const [isPending, startTransition] = useTransition();
  const [displayItems, setDisplayItems] = useState([]);
  
  useEffect(() => {
    // 使用startTransition包裹低优先级更新
    startTransition(() => {
      setDisplayItems(items);
    });
  }, [items]);
  
  return (
    <>
      {isPending && <LoadingSpinner />}
      <ul>
        {displayItems.map(item => (
          <li key={item.id}>
            <ExpensiveItem data={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

// 解决方案2：分批渲染
function BatchRenderedList({ items }) {
  const [visibleCount, setVisibleCount] = useState(20);
  
  useEffect(() => {
    if (visibleCount < items.length) {
      const timer = setTimeout(() => {
        setVisibleCount(count => Math.min(count + 20, items.length));
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [visibleCount, items.length]);
  
  return (
    <ul>
      {items.slice(0, visibleCount).map(item => (
        <li key={item.id}>
          <ExpensiveItem data={item} />
        </li>
      ))}
    </ul>
  );
}

// 解决方案3：虚拟滚动
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
        <div style={style}>
          <ExpensiveItem data={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 3.2 搜索功能优化

```javascript
// 实时搜索 - 平衡响应性和性能
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    // 立即更新输入框（高优先级）
    setQuery(value);
    
    // 延迟更新搜索结果（低优先级）
    startTransition(() => {
      const searchResults = performExpensiveSearch(value);
      setResults(searchResults);
    });
  };
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      
      {isPending ? (
        <div>搜索中...</div>
      ) : (
        <SearchResults results={results} />
      )}
    </div>
  );
}

// 使用useDeferredValue的替代方案
function SearchWithDeferred() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(
    () => performExpensiveSearch(deferredQuery),
    [deferredQuery]
  );
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      <SearchResults 
        results={results} 
        isPending={query !== deferredQuery}
      />
    </div>
  );
}
```

### 3.3 Tab切换优化

```javascript
// Tab切换 - 保持响应性
function TabContainer() {
  const [activeTab, setActiveTab] = useState('home');
  const [isPending, startTransition] = useTransition();
  
  const handleTabClick = (tab) => {
    // 立即更新激活状态（UI反馈）
    setActiveTab(tab);
    
    // 延迟加载Tab内容
    startTransition(() => {
      // 这里可以触发数据加载等操作
      loadTabContent(tab);
    });
  };
  
  return (
    <div>
      <div className="tabs">
        <button 
          onClick={() => handleTabClick('home')}
          className={activeTab === 'home' ? 'active' : ''}
        >
          首页
        </button>
        <button 
          onClick={() => handleTabClick('profile')}
          className={activeTab === 'profile' ? 'active' : ''}
        >
          个人资料
        </button>
        <button 
          onClick={() => handleTabClick('settings')}
          className={activeTab === 'settings' ? 'active' : ''}
        >
          设置
        </button>
      </div>
      
      <div className="tab-content">
        {isPending && <LoadingOverlay />}
        
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// 预加载优化
function OptimizedTabContainer() {
  const [activeTab, setActiveTab] = useState('home');
  const [loadedTabs, setLoadedTabs] = useState(new Set(['home']));
  
  const handleTabHover = (tab) => {
    // 鼠标悬停时预加载
    if (!loadedTabs.has(tab)) {
      startTransition(() => {
        loadTabContent(tab);
        setLoadedTabs(prev => new Set(prev).add(tab));
      });
    }
  };
  
  return (
    <div>
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('home')}
          onMouseEnter={() => handleTabHover('home')}
        >
          首页
        </button>
        {/* 其他tabs... */}
      </div>
      
      <div className="tab-content">
        {activeTab === 'home' && <HomeTab />}
        {/* 其他内容... */}
      </div>
    </div>
  );
}
```

### 3.4 数据可视化优化

```javascript
// 大数据图表渲染优化
function ChartComponent({ data }) {
  const [displayData, setDisplayData] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    // 处理大数据集
    startTransition(() => {
      const processedData = processLargeDataset(data);
      setDisplayData(processedData);
    });
  }, [data]);
  
  return (
    <div>
      {isPending && (
        <div className="chart-loading">
          <Spinner />
          <p>处理数据中...</p>
        </div>
      )}
      
      <svg width={800} height={400}>
        {displayData.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="blue"
          />
        ))}
      </svg>
    </div>
  );
}

// 渐进式渲染
function ProgressiveChart({ data }) {
  const [renderedCount, setRenderedCount] = useState(0);
  const batchSize = 1000;
  
  useEffect(() => {
    if (renderedCount < data.length) {
      const timer = setTimeout(() => {
        setRenderedCount(count => 
          Math.min(count + batchSize, data.length)
        );
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [renderedCount, data.length]);
  
  const progress = (renderedCount / data.length) * 100;
  
  return (
    <div>
      {renderedCount < data.length && (
        <div className="progress">
          渲染进度: {progress.toFixed(0)}%
        </div>
      )}
      
      <svg width={800} height={400}>
        {data.slice(0, renderedCount).map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="blue"
          />
        ))}
      </svg>
    </div>
  );
}
```

## 第四部分：时间切片与优先级

### 4.1 优先级调度策略

```javascript
// React 18的优先级策略
function handleUserInteraction() {
  // 方式1：同步更新（最高优先级）
  flushSync(() => {
    setCount(count + 1);  // 立即同步更新
  });
  
  // 方式2：默认更新
  setData(newData);  // 正常优先级
  
  // 方式3：Transition更新（低优先级）
  startTransition(() => {
    setHeavyData(processHeavyData());  // 可被打断
  });
  
  // 方式4：延迟更新
  const deferredValue = useDeferredValue(value);  // 延迟到空闲时更新
}

// 优先级示例：点击计数器
function Counter() {
  const [count, setCount] = useState(0);
  const [heavyList, setHeavyList] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleClick = () => {
    // 高优先级：立即更新计数器
    setCount(c => c + 1);
    
    // 低优先级：更新列表（可能很耗时）
    startTransition(() => {
      const newList = generateHeavyList(count + 1);
      setHeavyList(newList);
    });
  };
  
  return (
    <div>
      <button onClick={handleClick}>
        点击: {count}
      </button>
      
      {isPending && <Spinner />}
      
      <HeavyList items={heavyList} />
    </div>
  );
}
```

### 4.2 优先级饥饿问题

```javascript
// 防止低优先级任务饥饿
class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.starvationThreshold = 5000;  // 5秒
  }
  
  scheduleTask(id, callback, priority) {
    const task = {
      id,
      callback,
      priority,
      scheduledTime: performance.now(),
      expirationTime: this.calculateExpiration(priority)
    };
    
    this.tasks.set(id, task);
    this.processTasks();
  }
  
  calculateExpiration(priority) {
    const now = performance.now();
    
    switch (priority) {
      case 'immediate':
        return now - 1;  // 立即过期
      case 'user-blocking':
        return now + 250;
      case 'normal':
        return now + 5000;
      case 'low':
        return now + 10000;
      case 'idle':
        return Infinity;
      default:
        return now + 5000;
    }
  }
  
  processTasks() {
    const now = performance.now();
    const sortedTasks = Array.from(this.tasks.values())
      .sort((a, b) => {
        // 检查是否饥饿
        const aStarving = now - a.scheduledTime > this.starvationThreshold;
        const bStarving = now - b.scheduledTime > this.starvationThreshold;
        
        if (aStarving && !bStarving) return -1;
        if (!aStarving && bStarving) return 1;
        
        // 按过期时间排序
        return a.expirationTime - b.expirationTime;
      });
    
    // 执行任务
    for (const task of sortedTasks) {
      if (this.shouldYield()) break;
      
      task.callback();
      this.tasks.delete(task.id);
    }
    
    // 如果还有任务，继续调度
    if (this.tasks.size > 0) {
      requestIdleCallback(() => this.processTasks());
    }
  }
  
  shouldYield() {
    return performance.now() >= this.currentDeadline;
  }
}

// 使用示例
const scheduler = new TaskScheduler();

// 添加不同优先级的任务
scheduler.scheduleTask('urgent', urgentUpdate, 'immediate');
scheduler.scheduleTask('normal', normalUpdate, 'normal');
scheduler.scheduleTask('bg', backgroundTask, 'idle');
```

### 4.3 动态优先级调整

```javascript
// 根据用户行为动态调整优先级
function DynamicPriorityComponent() {
  const [priority, setPriority] = useState('normal');
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // 监听用户交互频率
    let lastInteraction = Date.now();
    
    const handleInteraction = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;
      
      if (timeSinceLastInteraction < 100) {
        // 用户快速交互，提升优先级
        setPriority('user-blocking');
      } else if (timeSinceLastInteraction < 1000) {
        setPriority('normal');
      } else {
        // 用户不活跃，降低优先级
        setPriority('idle');
      }
      
      lastInteraction = now;
    };
    
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);
  
  const updateData = useCallback((newData) => {
    if (priority === 'user-blocking') {
      // 高优先级，立即更新
      flushSync(() => {
        setData(newData);
      });
    } else if (priority === 'normal') {
      // 正常更新
      setData(newData);
    } else {
      // 低优先级，使用Transition
      startTransition(() => {
        setData(newData);
      });
    }
  }, [priority]);
  
  return <div>{/* UI */}</div>;
}
```

## 第五部分：性能监控与调试

### 5.1 性能监控

```javascript
// 监控时间切片性能
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frameDrops: 0,
      longTasks: 0,
      totalRenderTime: 0,
      renderCount: 0
    };
    
    this.setup();
  }
  
  setup() {
    // 监控长任务
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.metrics.longTasks++;
            console.warn('Long task detected:', entry.duration, 'ms');
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
    
    // 监控帧率
    this.monitorFrameRate();
  }
  
  monitorFrameRate() {
    let lastTime = performance.now();
    let frames = 0;
    
    const checkFrame = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      frames++;
      
      if (delta > 16.67) {  // 超过一帧的时间
        this.metrics.frameDrops++;
      }
      
      if (frames >= 60) {
        const fps = 1000 / (delta / frames);
        console.log('FPS:', fps.toFixed(2));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkFrame);
    };
    
    requestAnimationFrame(checkFrame);
  }
  
  recordRender(duration) {
    this.metrics.totalRenderTime += duration;
    this.metrics.renderCount++;
    
    const avgRenderTime = this.metrics.totalRenderTime / this.metrics.renderCount;
    
    if (duration > avgRenderTime * 2) {
      console.warn('Slow render detected:', duration, 'ms');
    }
  }
  
  getReport() {
    return {
      ...this.metrics,
      avgRenderTime: this.metrics.totalRenderTime / this.metrics.renderCount
    };
  }
}

// 使用示例
const monitor = new PerformanceMonitor();

function MonitoredComponent() {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      monitor.recordRender(duration);
    };
  });
  
  return <div>{/* content */}</div>;
}
```

### 5.2 Profiler API使用

```javascript
// 使用Profiler监控组件性能
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    console.log('Profiler:', {
      id,
      phase,
      actualDuration,
      baseDuration,
      renderEfficiency: (baseDuration / actualDuration * 100).toFixed(2) + '%'
    });
    
    // 上报性能数据
    reportPerformance({
      component: id,
      phase,
      duration: actualDuration,
      timestamp: commitTime
    });
  };
  
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Profiler id="Header" onRender={onRenderCallback}>
        <Header />
      </Profiler>
      
      <Profiler id="Main" onRender={onRenderCallback}>
        <Main />
      </Profiler>
      
      <Profiler id="Footer" onRender={onRenderCallback}>
        <Footer />
      </Profiler>
    </Profiler>
  );
}

// 性能数据收集和分析
class PerformanceCollector {
  constructor() {
    this.data = [];
  }
  
  collect(metric) {
    this.data.push({
      ...metric,
      timestamp: Date.now()
    });
    
    // 定期上报
    if (this.data.length >= 100) {
      this.flush();
    }
  }
  
  flush() {
    if (this.data.length === 0) return;
    
    const report = this.analyze();
    
    // 发送到服务器
    fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    
    this.data = [];
  }
  
  analyze() {
    const byComponent = {};
    
    this.data.forEach(metric => {
      if (!byComponent[metric.component]) {
        byComponent[metric.component] = {
          count: 0,
          totalDuration: 0,
          maxDuration: 0,
          phases: { mount: 0, update: 0 }
        };
      }
      
      const comp = byComponent[metric.component];
      comp.count++;
      comp.totalDuration += metric.duration;
      comp.maxDuration = Math.max(comp.maxDuration, metric.duration);
      comp.phases[metric.phase]++;
    });
    
    return {
      summary: Object.entries(byComponent).map(([name, stats]) => ({
        component: name,
        avgDuration: stats.totalDuration / stats.count,
        maxDuration: stats.maxDuration,
        renderCount: stats.count,
        mountCount: stats.phases.mount,
        updateCount: stats.phases.update
      })),
      timestamp: Date.now()
    };
  }
}

const collector = new PerformanceCollector();

function reportPerformance(metric) {
  collector.collect(metric);
}
```

### 5.3 DevTools调试

```javascript
// 使用React DevTools调试时间切片
function DebugTimeSlicing() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  // 标记更新来源
  const handleSyncUpdate = () => {
    // 同步更新
    setCount(c => c + 1);
  };
  
  const handleTransitionUpdate = () => {
    // Transition更新
    startTransition(() => {
      setCount(c => c + 1);
    });
  };
  
  // 在DevTools中可以看到不同的优先级标记
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={handleSyncUpdate}>
        同步更新
      </button>
      <button onClick={handleTransitionUpdate}>
        Transition更新 {isPending && '(pending)'}
      </button>
    </div>
  );
}

// 使用Profiler标记
import { unstable_trace as trace } from 'scheduler/tracing';

function TracedComponent() {
  const handleAction = () => {
    trace('User Action', performance.now(), () => {
      // 这里的操作会在DevTools中标记
      performExpensiveOperation();
    });
  };
  
  return <button onClick={handleAction}>执行操作</button>;
}
```

## 注意事项

### 1. 时间切片的限制

```
时间切片虽然强大，但不是万能的：

1. 最小工作单元限制
   - 单个组件渲染不可分割
   - 过大的组件仍会阻塞

2. 优先级反转
   - 低优先级任务可能被无限推迟
   - 需要防饥饿机制

3. 内存开销
   - 需要维护工作进度
   - 双缓冲增加内存

4. 调试困难
   - 异步渲染难追踪
   - 中间状态难观察
```

### 2. 最佳实践

```javascript
// 1. 合理拆分组件
// ❌ 单个大组件
function BigComponent() {
  return (
    <div>
      {/* 数千行JSX */}
    </div>
  );
}

// ✅ 拆分为小组件
function SmallComponent() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

// 2. 使用key帮助diff
// ❌ 没有key
list.map(item => <Item data={item} />)

// ✅ 稳定的key
list.map(item => <Item key={item.id} data={item} />)

// 3. 避免不必要的渲染
// ✅ 使用memo
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive render */}</div>;
});

// 4. 合理使用Transition
// ✅ 非紧急更新使用Transition
startTransition(() => {
  setSearchResults(results);  // 搜索结果可以延迟
});

// ❌ 用户输入不应该用Transition
// setInputValue(value);  // 输入框必须立即响应
```

### 3. 性能优化建议

```javascript
// 1. 预加载策略
function PreloadStrategy() {
  const [hoveredId, setHoveredId] = useState(null);
  
  const handleHover = (id) => {
    setHoveredId(id);
    
    // 鼠标悬停时预加载
    startTransition(() => {
      preloadData(id);
    });
  };
  
  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onMouseEnter={() => handleHover(item.id)}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}

// 2. 批量更新
function BatchUpdates() {
  const [data, setData] = useState({});
  
  const updateMultiple = () => {
    // React 18会自动批量
    setData(d => ({ ...d, a: 1 }));
    setData(d => ({ ...d, b: 2 }));
    setData(d => ({ ...d, c: 3 }));
    // 只会触发一次渲染
  };
}

// 3. 使用虚拟化
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].title}
        </div>
      )}
    </FixedSizeList>
  );
}
```

## 常见问题

### Q1: 时间切片什么时候生效？

**A:** 时间切片在并发模式下自动生效。需要使用`createRoot` API并且更新被标记为可中断（如使用`startTransition`）。

### Q2: 如何判断是否需要时间切片？

**A:** 当遇到以下情况时应考虑使用时间切片：
- 长列表渲染（超过100项）
- 复杂计算
- 实时搜索/过滤
- 大型图表可视化
- 用户输入需要保持流畅

### Q3: Transition和Debounce的区别？

**A:** Transition是React的调度机制，可以被高优先级任务打断。Debounce是延迟执行，时间到了就执行，不会被打断。Transition更智能，能更好地保持UI响应。

### Q4: 时间切片会影响SEO吗？

**A:** 不会。时间切片只影响客户端渲染过程。SSR渲染仍是同步的，搜索引擎看到的内容不受影响。

### Q5: 如何测试时间切片的效果？

**A:** 使用Chrome DevTools的Performance面板，启用CPU throttling模拟慢速设备。观察Long Task和帧率变化。

### Q6: 所有更新都应该使用Transition吗？

**A:** 不是。用户直接交互（点击、输入）应该保持同步。只有非紧急的更新（搜索结果、数据刷新）才适合用Transition。

### Q7: 时间切片的开销有多大？

**A:** 很小。React的调度器开销通常小于1ms。相比同步渲染阻塞主线程带来的卡顿，这点开销完全值得。

### Q8: 如何在旧项目中使用时间切片？

**A:** 升级到React 18，将`ReactDOM.render`改为`createRoot`，然后在需要的地方使用`startTransition`或`useDeferredValue`。

### Q9: 时间切片与Web Workers的区别？

**A:** Web Workers在独立线程运行，适合CPU密集计算。时间切片在主线程分时运行，适合UI更新。两者可以结合使用。

### Q10: React 19对时间切片有什么改进？

**A:** React 19改进了优先级算法，提供了更细粒度的控制，并优化了Transition的性能。

## 总结

### 时间切片核心要点

```
1. 工作原理
   ✅ 分割渲染任务为小单元
   ✅ 在帧间隙执行工作
   ✅ 检查是否需要让出控制权
   ✅ 保持UI响应流畅

2. 调度策略
   ✅ 5个优先级级别
   ✅ 任务队列管理
   ✅ 防饥饿机制
   ✅ 动态优先级调整

3. 实战应用
   ✅ 长列表优化
   ✅ 实时搜索
   ✅ Tab切换
   ✅ 数据可视化

4. 性能监控
   ✅ Profiler API
   ✅ Performance监控
   ✅ DevTools调试
   ✅ 数据收集分析
```

### 最佳实践建议

```
优化策略：
1. 合理拆分组件粒度
2. 使用稳定的key
3. 避免不必要渲染（memo）
4. 区分紧急和非紧急更新
5. 使用虚拟化处理大列表
6. 实现预加载策略
7. 监控和分析性能
8. 持续优化改进
```

时间切片是React实现流畅用户体验的关键技术，合理使用可以显著提升应用性能。

