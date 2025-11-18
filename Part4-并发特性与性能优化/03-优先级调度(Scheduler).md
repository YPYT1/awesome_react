# 优先级调度 (Scheduler)

## 第一部分：Scheduler概述

### 1.1 什么是Scheduler

Scheduler是React团队开发的独立任务调度库，负责管理任务的优先级和执行时机。它是React并发特性的核心基础设施。

**核心职责：**
- 任务优先级管理
- 时间切片调度
- 任务中断和恢复
- 饥饿防止机制

### 1.2 为什么需要优先级调度

在没有优先级系统的情况下，所有更新都是同等重要的，这会导致用户体验问题。

**问题示例：**

```javascript
// 没有优先级的问题
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleInput = (e) => {
    // 问题：输入和搜索都是同步的
    setQuery(e.target.value);           // 用户输入
    setResults(expensiveSearch(e.target.value));  // 耗时搜索
    
    // 结果：输入框卡顿
  };
  
  return (
    <div>
      <input value={query} onChange={handleInput} />
      <SearchResults results={results} />
    </div>
  );
}
```

**优先级调度的解决方案：**

```javascript
// 使用优先级调度
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleInput = (e) => {
    // 高优先级：立即更新输入框
    setQuery(e.target.value);
    
    // 低优先级：可中断的搜索
    startTransition(() => {
      setResults(expensiveSearch(e.target.value));
    });
  };
  
  return (
    <div>
      <input value={query} onChange={handleInput} />
      {isPending && <Spinner />}
      <SearchResults results={results} />
    </div>
  );
}
```

### 1.3 Scheduler的设计原理

**优先级队列系统：**

```javascript
// Scheduler的核心结构
const Scheduler = {
  // 任务队列
  taskQueue: [],          // 待执行任务
  timerQueue: [],         // 延迟任务
  
  // 优先级常量
  ImmediatePriority: 1,
  UserBlockingPriority: 2,
  NormalPriority: 3,
  LowPriority: 4,
  IdlePriority: 5,
  
  // 核心API
  scheduleCallback(priority, callback) {
    // 调度任务
  },
  
  cancelCallback(task) {
    // 取消任务
  },
  
  shouldYield() {
    // 检查是否应该让出
  },
  
  getCurrentPriorityLevel() {
    // 获取当前优先级
  }
};
```

## 第二部分：优先级系统

### 2.1 五级优先级

Scheduler定义了5个优先级级别，每个级别对应不同的超时时间。

```javascript
// 优先级定义
const ImmediatePriority = 1;        // 立即执行
const UserBlockingPriority = 2;     // 用户阻塞
const NormalPriority = 3;           // 正常
const LowPriority = 4;              // 低优先级
const IdlePriority = 5;             // 空闲

// 超时时间配置
const IMMEDIATE_PRIORITY_TIMEOUT = -1;        // 立即
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;   // 250ms
const NORMAL_PRIORITY_TIMEOUT = 5000;         // 5s
const LOW_PRIORITY_TIMEOUT = 10000;           // 10s
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;  // 永不过期

// 使用示例
import { 
  unstable_scheduleCallback as scheduleCallback,
  unstable_ImmediatePriority as ImmediatePriority,
  unstable_UserBlockingPriority as UserBlockingPriority,
  unstable_NormalPriority as NormalPriority,
  unstable_LowPriority as LowPriority,
  unstable_IdlePriority as IdlePriority
} from 'scheduler';

// 1. 立即优先级 - 同步必须完成的任务
scheduleCallback(ImmediatePriority, () => {
  // 关键更新，如错误处理
  handleCriticalError();
});

// 2. 用户阻塞优先级 - 用户交互
scheduleCallback(UserBlockingPriority, () => {
  // 点击、输入等
  updateUIFromUserInput();
});

// 3. 正常优先级 - 默认优先级
scheduleCallback(NormalPriority, () => {
  // 数据更新、网络请求响应
  updateDataFromAPI();
});

// 4. 低优先级 - 非关键任务
scheduleCallback(LowPriority, () => {
  // 预加载、分析
  prefetchNextPage();
});

// 5. 空闲优先级 - 完全不紧急
scheduleCallback(IdlePriority, () => {
  // 日志、统计
  sendAnalytics();
});
```

### 2.2 优先级到超时时间的映射

```javascript
// 根据优先级计算超时时间
function timeoutForPriorityLevel(priorityLevel) {
  switch (priorityLevel) {
    case ImmediatePriority:
      return IMMEDIATE_PRIORITY_TIMEOUT;
    case UserBlockingPriority:
      return USER_BLOCKING_PRIORITY_TIMEOUT;
    case IdlePriority:
      return IDLE_PRIORITY_TIMEOUT;
    case LowPriority:
      return LOW_PRIORITY_TIMEOUT;
    case NormalPriority:
    default:
      return NORMAL_PRIORITY_TIMEOUT;
  }
}

// 任务调度时计算过期时间
function unstable_scheduleCallback(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  
  let startTime;
  if (options?.delay > 0) {
    startTime = currentTime + options.delay;
  } else {
    startTime = currentTime;
  }
  
  const timeout = timeoutForPriorityLevel(priorityLevel);
  const expirationTime = startTime + timeout;
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1
  };
  
  if (startTime > currentTime) {
    // 延迟任务
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
  } else {
    // 立即任务
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  
  return newTask;
}
```

### 2.3 优先级继承

当高优先级任务依赖低优先级任务时，低优先级任务会暂时提升优先级。

```javascript
// 优先级继承示例
function PriorityInheritance() {
  const [data, setData] = useState(null);
  const [ui, setUI] = useState(null);
  
  useEffect(() => {
    // 低优先级：加载数据
    scheduleCallback(LowPriority, async () => {
      const result = await fetchData();
      setData(result);
    });
  }, []);
  
  useEffect(() => {
    if (data) {
      // 高优先级：更新UI
      scheduleCallback(UserBlockingPriority, () => {
        // 此时如果data还在加载，会提升其优先级
        setUI(processData(data));
      });
    }
  }, [data]);
  
  return <div>{ui}</div>;
}

// Scheduler内部处理优先级继承
function ensurePriorityInheritance(task, dependencyTask) {
  if (task.priorityLevel < dependencyTask.priorityLevel) {
    // 提升依赖任务的优先级
    dependencyTask.priorityLevel = task.priorityLevel;
    dependencyTask.expirationTime = task.expirationTime;
    
    // 重新调度
    reScheduleTask(dependencyTask);
  }
}
```

### 2.4 动态优先级调整

```javascript
// 根据任务等待时间动态调整优先级
function adjustPriorityBasedOnAge(task) {
  const currentTime = getCurrentTime();
  const age = currentTime - task.startTime;
  
  // 等待超过阈值，提升优先级
  if (age > STARVATION_THRESHOLD) {
    const oldPriority = task.priorityLevel;
    
    if (oldPriority > ImmediatePriority) {
      task.priorityLevel = oldPriority - 1;
      task.expirationTime = currentTime + 
        timeoutForPriorityLevel(task.priorityLevel);
      
      console.log(`Task ${task.id} priority elevated from ${oldPriority} to ${task.priorityLevel}`);
      
      // 重新排序
      reorderTaskQueue();
    }
  }
}

// 实战示例：自适应优先级
function AdaptivePriorityComponent() {
  const [tasks, setTasks] = useState([]);
  
  const scheduleTasks = useCallback(() => {
    tasks.forEach(task => {
      const priority = calculateDynamicPriority(task);
      
      scheduleCallback(priority, () => {
        executeTask(task);
      });
    });
  }, [tasks]);
  
  function calculateDynamicPriority(task) {
    const { type, age, userVisible } = task;
    
    // 基础优先级
    let priority = NormalPriority;
    
    // 用户可见的任务提升优先级
    if (userVisible) {
      priority = UserBlockingPriority;
    }
    
    // 长时间等待的任务提升优先级
    if (age > 5000) {
      priority = Math.max(ImmediatePriority, priority - 1);
    }
    
    // 根据类型调整
    if (type === 'analytics') {
      priority = IdlePriority;
    } else if (type === 'critical') {
      priority = ImmediatePriority;
    }
    
    return priority;
  }
  
  return <div>{/* UI */}</div>;
}
```

## 第三部分：任务队列管理

### 3.1 最小堆数据结构

Scheduler使用最小堆（Min Heap）来管理任务队列，确保总是先执行优先级最高的任务。

```javascript
// 最小堆实现
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

function siftUp(heap, node, i) {
  let index = i;
  
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1;
    const parent = heap[parentIndex];
    
    if (compare(parent, node) > 0) {
      // parent > node，交换
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}

function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  const halfLength = length >>> 1;
  
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    
    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      return;
    }
  }
}

function compare(a, b) {
  // 按sortIndex排序
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
```

### 3.2 任务队列和定时器队列

```javascript
// 两个队列的管理
let taskQueue = [];        // 可执行的任务
let timerQueue = [];       // 延迟任务

// 任务结构
interface Task {
  id: number;
  callback: Callback;
  priorityLevel: PriorityLevel;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
}

// 添加任务
function scheduleTask(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  
  let startTime;
  if (typeof options === 'object' && options !== null) {
    const delay = options.delay;
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }
  
  const timeout = timeoutForPriorityLevel(priorityLevel);
  const expirationTime = startTime + timeout;
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1
  };
  
  if (startTime > currentTime) {
    // 延迟任务，加入timerQueue
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    
    if (peek(taskQueue) === null && peek(timerQueue) === newTask) {
      // 如果是最早的延迟任务，设置定时器
      if (isHostTimeoutScheduled) {
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    // 立即任务，加入taskQueue
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  
  return newTask;
}

// 处理超时，将到期的延迟任务移到taskQueue
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);
  
  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}

// 推进定时器
function advanceTimers(currentTime) {
  let timer = peek(timerQueue);
  
  while (timer !== null) {
    if (timer.callback === null) {
      // 已取消的任务
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // 到期了，移到taskQueue
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    
    timer = peek(timerQueue);
  }
}
```

### 3.3 任务执行和中断

```javascript
// 执行任务队列
function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;
  
  if (isHostTimeoutScheduled) {
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  
  isPerformingWork = true;
  const previousPriorityLevel = currentPriorityLevel;
  
  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

// 工作循环
function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  advanceTimers(currentTime);
  
  currentTask = peek(taskQueue);
  
  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // 任务未过期且应该让出
      break;
    }
    
    const callback = currentTask.callback;
    
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      
      if (typeof continuationCallback === 'function') {
        // 任务返回了延续函数
        currentTask.callback = continuationCallback;
      } else {
        // 任务完成
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      
      advanceTimers(currentTime);
    } else {
      pop(taskQueue);
    }
    
    currentTask = peek(taskQueue);
  }
  
  if (currentTask !== null) {
    return true;  // 还有任务
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;  // 没有任务了
  }
}

// 检查是否应该让出控制权
let deadline = 0;
const yieldInterval = 5;  // 5ms

function shouldYieldToHost() {
  const currentTime = getCurrentTime();
  
  if (currentTime >= deadline) {
    if (needsPaint || scheduling.isInputPending()) {
      return true;
    }
    
    return currentTime >= maxYieldInterval;
  }
  
  return false;
}
```

### 3.4 任务取消

```javascript
// 取消任务
function unstable_cancelCallback(task) {
  // 将callback设为null标记为已取消
  task.callback = null;
}

// 使用示例
function CancellableTask() {
  const taskRef = useRef(null);
  
  const scheduleWork = () => {
    // 取消之前的任务
    if (taskRef.current) {
      unstable_cancelCallback(taskRef.current);
    }
    
    // 调度新任务
    taskRef.current = scheduleCallback(NormalPriority, () => {
      performWork();
    });
  };
  
  useEffect(() => {
    return () => {
      // 组件卸载时取消任务
      if (taskRef.current) {
        unstable_cancelCallback(taskRef.current);
      }
    };
  }, []);
  
  return <button onClick={scheduleWork}>执行工作</button>;
}

// 批量取消
function BatchCancellation() {
  const tasksRef = useRef([]);
  
  const scheduleBatch = (items) => {
    // 取消所有旧任务
    tasksRef.current.forEach(task => {
      unstable_cancelCallback(task);
    });
    tasksRef.current = [];
    
    // 调度新任务
    items.forEach(item => {
      const task = scheduleCallback(NormalPriority, () => {
        processItem(item);
      });
      tasksRef.current.push(task);
    });
  };
  
  return <div>{/* UI */}</div>;
}
```

## 第四部分：与React的集成

### 4.1 Lane到Scheduler优先级的转换

```javascript
// Lane优先级系统
const SyncLane = 1;
const InputContinuousLane = 4;
const DefaultLane = 16;
const TransitionLane1 = 64;
const IdleLane = 2147483648;

// 转换函数
function lanePriorityToSchedulerPriority(lanePriority) {
  switch (lanePriority) {
    case SyncLane:
    case SyncBatchedLane:
      return ImmediatePriority;
    case InputContinuousLane:
      return UserBlockingPriority;
    case DefaultLane:
      return NormalPriority;
    case TransitionLane1:
    case TransitionLane2:
      return NormalPriority;
    case IdleLane:
      return IdlePriority;
    default:
      return NormalPriority;
  }
}

// React调度更新
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 1. 标记Fiber的lanes
  markUpdateLaneFromFiberToRoot(fiber, lane);
  
  // 2. 确保根节点被调度
  ensureRootIsScheduled(root, eventTime);
}

function ensureRootIsScheduled(root, currentTime) {
  const existingCallbackNode = root.callbackNode;
  
  // 获取下一个要处理的lanes
  const nextLanes = getNextLanes(root, NoLanes);
  
  if (nextLanes === NoLanes) {
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode);
    }
    root.callbackNode = null;
    return;
  }
  
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  const existingCallbackPriority = root.callbackPriority;
  
  if (existingCallbackPriority === newCallbackPriority) {
    return;
  }
  
  if (existingCallbackNode != null) {
    cancelCallback(existingCallbackNode);
  }
  
  let newCallbackNode;
  
  if (newCallbackPriority === SyncLane) {
    // 同步优先级
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    newCallbackNode = null;
  } else {
    // 异步优先级
    const schedulerPriorityLevel = lanePriorityToSchedulerPriority(
      newCallbackPriority
    );
    
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }
  
  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}
```

### 4.2 并发渲染调度

```javascript
// 并发渲染的完整流程
function performConcurrentWorkOnRoot(root) {
  const originalCallbackNode = root.callbackNode;
  
  const didFlushPassiveEffects = flushPassiveEffects();
  if (didFlushPassiveEffects) {
    if (root.callbackNode !== originalCallbackNode) {
      return null;
    }
  }
  
  const lanes = getNextLanes(root, NoLanes);
  if (lanes === NoLanes) {
    return null;
  }
  
  const shouldTimeSlice = 
    !includesBlockingLane(root, lanes) &&
    !includesExpiredLane(root, lanes);
  
  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes);
  
  if (exitStatus !== RootInProgress) {
    if (exitStatus === RootErrored) {
      // 错误处理
      const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root);
      if (errorRetryLanes !== NoLanes) {
        lanes = errorRetryLanes;
        exitStatus = renderRootSync(root, lanes);
      }
    }
    
    if (exitStatus === RootFatalErrored) {
      throw fatalError;
    }
    
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    
    finishConcurrentRender(root, exitStatus, lanes);
  }
  
  ensureRootIsScheduled(root, now());
  
  if (root.callbackNode === originalCallbackNode) {
    // 还有工作要做
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  
  return null;
}

// 并发渲染
function renderRootConcurrent(root, lanes) {
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes);
  }
  
  do {
    try {
      workLoopConcurrent();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
  
  executionContext = prevExecutionContext;
  
  if (workInProgress !== null) {
    return RootInProgress;
  } else {
    workInProgressRoot = null;
    workInProgressRootRenderLanes = NoLanes;
    return workInProgressRootExitStatus;
  }
}

// 工作循环
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

### 4.3 优先级上下文

```javascript
// 优先级上下文管理
let currentPriorityLevel = NormalPriority;

function runWithPriority(priorityLevel, eventHandler) {
  const previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

// 使用示例
function handleUserClick() {
  runWithPriority(UserBlockingPriority, () => {
    // 这里的所有更新都是UserBlocking优先级
    setState(newState);
    updateUI();
  });
}

// React事件系统集成
function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  const previousPriority = getCurrentPriorityLevel();
  
  try {
    setCurrentUpdatePriority(DiscreteEventPriority);
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    setCurrentUpdatePriority(previousPriority);
  }
}

function dispatchContinuousEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  const previousPriority = getCurrentPriorityLevel();
  
  try {
    setCurrentUpdatePriority(ContinuousEventPriority);
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    setCurrentUpdatePriority(previousPriority);
  }
}
```

## 第五部分：高级调度模式

### 5.1 批量调度

```javascript
// 批量调度多个任务
class BatchScheduler {
  constructor() {
    this.batch = [];
    this.scheduled = false;
  }
  
  add(priority, callback) {
    this.batch.push({ priority, callback });
    
    if (!this.scheduled) {
      this.scheduled = true;
      this.schedule();
    }
  }
  
  schedule() {
    scheduleCallback(NormalPriority, () => {
      this.flush();
    });
  }
  
  flush() {
    const batch = this.batch.sort((a, b) => a.priority - b.priority);
    this.batch = [];
    this.scheduled = false;
    
    batch.forEach(({ callback }) => {
      try {
        callback();
      } catch (error) {
        console.error('Batch task error:', error);
      }
    });
  }
}

// 使用示例
const batchScheduler = new BatchScheduler();

function Component() {
  const handleMultipleUpdates = () => {
    // 批量添加多个更新
    batchScheduler.add(1, () => updateA());
    batchScheduler.add(2, () => updateB());
    batchScheduler.add(1, () => updateC());
    
    // 会按优先级顺序执行: updateA, updateC, updateB
  };
  
  return <button onClick={handleMultipleUpdates}>更新</button>;
}
```

### 5.2 分块调度

```javascript
// 将大任务分块调度
function scheduleChunkedWork(items, processItem, chunkSize = 100) {
  let index = 0;
  
  function processChunk() {
    const endIndex = Math.min(index + chunkSize, items.length);
    
    for (; index < endIndex; index++) {
      processItem(items[index]);
    }
    
    if (index < items.length) {
      // 还有数据，继续下一块
      return processChunk;  // 返回延续函数
    }
  }
  
  scheduleCallback(NormalPriority, processChunk);
}

// 使用示例
function ChunkedRenderer({ data }) {
  const [processed, setProcessed] = useState([]);
  
  useEffect(() => {
    scheduleChunkedWork(
      data,
      (item) => {
        setProcessed(prev => [...prev, processItem(item)]);
      },
      50  // 每次处理50项
    );
  }, [data]);
  
  return (
    <div>
      {processed.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );
}
```

### 5.3 自适应调度

```javascript
// 根据设备性能自适应调度
class AdaptiveScheduler {
  constructor() {
    this.deviceCapability = this.detectCapability();
  }
  
  detectCapability() {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    
    if (memory >= 8 && cores >= 4) {
      return 'high';
    } else if (memory >= 4 && cores >= 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  schedule(task, basePriority) {
    let priority = basePriority;
    
    // 低性能设备提升优先级，减少切片
    if (this.deviceCapability === 'low') {
      priority = Math.max(ImmediatePriority, basePriority - 1);
    }
    
    // 高性能设备可以更多切片
    if (this.deviceCapability === 'high') {
      priority = Math.min(IdlePriority, basePriority + 1);
    }
    
    return scheduleCallback(priority, task);
  }
}

// 使用示例
const adaptiveScheduler = new AdaptiveScheduler();

function Component() {
  const handleHeavyWork = () => {
    adaptiveScheduler.schedule(() => {
      performHeavyComputation();
    }, NormalPriority);
  };
  
  return <button onClick={handleHeavyWork}>执行</button>;
}
```

## 第六部分：调度性能优化

### 6.1 饥饿预防

```javascript
// 防止低优先级任务饥饿
class StarvationPreventionScheduler {
  constructor() {
    this.taskAges = new Map();
    this.starvationThreshold = 5000;  // 5秒
  }
  
  schedule(id, priority, callback) {
    const now = performance.now();
    const age = this.taskAges.get(id);
    
    let adjustedPriority = priority;
    
    if (age && (now - age) > this.starvationThreshold) {
      // 饥饿了，提升优先级
      adjustedPriority = Math.max(ImmediatePriority, priority - 1);
      console.log(`Task ${id} starving, priority elevated`);
    } else if (!age) {
      this.taskAges.set(id, now);
    }
    
    const task = scheduleCallback(adjustedPriority, () => {
      this.taskAges.delete(id);
      callback();
    });
    
    return task;
  }
}

// 使用示例
const scheduler = new StarvationPreventionScheduler();

function Component() {
  useEffect(() => {
    // 低优先级任务
    scheduler.schedule('bg-task', LowPriority, () => {
      backgroundWork();
    });
    
    // 如果长时间未执行，会自动提升优先级
  }, []);
  
  return <div>Content</div>;
}
```

### 6.2 优先级队列优化

```javascript
// 使用优先级桶优化
class PriorityBucketScheduler {
  constructor() {
    this.buckets = new Map([
      [ImmediatePriority, []],
      [UserBlockingPriority, []],
      [NormalPriority, []],
      [LowPriority, []],
      [IdlePriority, []]
    ]);
  }
  
  schedule(priority, callback) {
    const bucket = this.buckets.get(priority);
    bucket.push(callback);
    
    if (bucket.length === 1) {
      // 第一个任务，调度执行
      this.scheduleFlush(priority);
    }
  }
  
  scheduleFlush(priority) {
    scheduleCallback(priority, () => {
      const bucket = this.buckets.get(priority);
      
      while (bucket.length > 0 && !shouldYield()) {
        const callback = bucket.shift();
        callback();
      }
      
      if (bucket.length > 0) {
        // 还有任务，继续
        this.scheduleFlush(priority);
      }
    });
  }
}
```

### 6.3 任务合并

```javascript
// 合并相同类型的任务
class TaskCoalescer {
  constructor() {
    this.pending = new Map();
  }
  
  schedule(key, priority, callback) {
    // 取消之前的同类任务
    const existing = this.pending.get(key);
    if (existing) {
      unstable_cancelCallback(existing.task);
    }
    
    // 调度新任务
    const task = scheduleCallback(priority, () => {
      this.pending.delete(key);
      callback();
    });
    
    this.pending.set(key, { task, priority, callback });
  }
}

// 使用示例
const coalescer = new TaskCoalescer();

function SearchComponent() {
  const [query, setQuery] = useState('');
  
  const handleInput = (value) => {
    setQuery(value);
    
    // 合并搜索请求
    coalescer.schedule(
      'search',
      NormalPriority,
      () => performSearch(value)
    );
  };
  
  return (
    <input
      value={query}
      onChange={e => handleInput(e.target.value)}
    />
  );
}
```

## 注意事项

### 1. 优先级使用原则

```
正确使用优先级：

✅ Immediate: 同步必须完成（错误处理）
✅ UserBlocking: 用户交互（点击、输入）
✅ Normal: 普通更新（数据刷新）
✅ Low: 非关键任务（预加载）
✅ Idle: 完全不紧急（分析、日志）

❌ 避免：
- 滥用高优先级
- 所有任务都用Idle
- 不考虑用户体验
```

### 2. 性能考虑

```javascript
// ✅ 合理的任务粒度
function GoodGranularity() {
  const tasks = largeDataSet.map(item => ({
    priority: NormalPriority,
    work: () => processItem(item)
  }));
  
  tasks.forEach(task => {
    scheduleCallback(task.priority, task.work);
  });
}

// ❌ 任务粒度太细
function BadGranularity() {
  largeDataSet.forEach(item => {
    item.properties.forEach(prop => {
      // 过多的小任务，调度开销大
      scheduleCallback(NormalPriority, () => {
        processProp(prop);
      });
    });
  });
}
```

### 3. 内存管理

```javascript
// ✅ 及时清理
function GoodCleanup() {
  const tasks = useRef([]);
  
  useEffect(() => {
    return () => {
      // 清理所有任务
      tasks.current.forEach(task => {
        unstable_cancelCallback(task);
      });
      tasks.current = [];
    };
  }, []);
}

// ❌ 内存泄漏
function BadCleanup() {
  const tasks = [];
  
  const schedule = () => {
    const task = scheduleCallback(NormalPriority, work);
    tasks.push(task);  // 永远不清理
  };
}
```

## 常见问题

### Q1: 如何选择合适的优先级？

**A:** 
- 用户直接交互 → UserBlocking
- 数据更新、API响应 → Normal
- 预加载、优化 → Low
- 分析、日志 → Idle

### Q2: 优先级会影响渲染顺序吗？

**A:** 会。高优先级任务会打断低优先级任务的渲染，优先执行。

### Q3: 如何避免任务饥饿？

**A:** Scheduler内置饥饿预防，长时间等待的任务会自动提升优先级。也可以手动实现防饥饿逻辑。

### Q4: 可以动态改变任务优先级吗？

**A:** 不能直接改变已调度任务的优先级。需要取消旧任务，用新优先级重新调度。

### Q5: Scheduler的性能开销有多大？

**A:** 很小，通常小于1ms。使用最小堆管理任务，时间复杂度O(log n)。

### Q6: 如何调试调度问题？

**A:** 使用React DevTools的Profiler，观察任务执行顺序和时间。也可以添加日志追踪优先级变化。

### Q7: 能否在Node.js中使用Scheduler？

**A:** 可以。Scheduler是独立的包，可以在任何JavaScript环境使用。

### Q8: 批量更新如何影响优先级？

**A:** React 18+自动批量更新，批次内的更新使用最高优先级。

### Q9: Transition和Scheduler的关系？

**A:** Transition内部使用Scheduler的低优先级调度非紧急更新。

### Q10: 如何优化调度性能？

**A:** 
- 合并相同任务
- 控制任务粒度
- 使用优先级桶
- 及时取消不需要的任务

## 总结

### 核心要点

```
1. 优先级系统
   ✅ 5级优先级
   ✅ 超时时间映射
   ✅ 优先级继承
   ✅ 动态调整

2. 队列管理
   ✅ 最小堆结构
   ✅ 任务队列
   ✅ 定时器队列
   ✅ 任务合并

3. 调度策略
   ✅ 时间切片
   ✅ 优先级调度
   ✅ 饥饿预防
   ✅ 任务取消

4. 性能优化
   ✅ 批量调度
   ✅ 分块处理
   ✅ 自适应策略
   ✅ 内存管理
```

### 最佳实践

```
1. 合理分配优先级
2. 控制任务粒度
3. 及时清理资源
4. 监控调度性能
5. 处理边界情况
6. 优化用户体验
```

Scheduler是React并发特性的基石，掌握其原理和用法对构建高性能应用至关重要。

