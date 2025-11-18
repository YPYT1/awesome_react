# Fiber调度原理 - React任务调度系统深度剖析

## 1. 调度系统概述

### 1.1 为什么需要调度

```typescript
const schedulingNeed = {
  问题背景: {
    浏览器限制: '单线程JavaScript执行',
    性能目标: '60fps,每帧16.6ms',
    现实挑战: 'React渲染可能超过一帧时间',
    用户体验: '长任务导致卡顿、掉帧'
  },
  
  解决方案: {
    任务分割: '将大任务拆分成小任务',
    时间切片: '每个小任务5ms左右',
    优先级: '重要任务优先执行',
    可中断: '随时暂停和恢复'
  },
  
  核心目标: [
    '保持界面流畅(60fps)',
    '快速响应用户交互',
    '合理分配CPU时间',
    '避免任务饥饿'
  ]
};
```

### 1.2 调度架构

```typescript
const schedulerArchitecture = {
  层次结构: {
    React层: {
      responsibility: '管理组件更新',
      api: 'scheduleUpdateOnFiber',
      priority: 'Lane优先级模型'
    },
    
    Scheduler层: {
      responsibility: '任务调度和时间切片',
      api: 'scheduleCallback',
      priority: 'Priority优先级模型'
    },
    
    浏览器层: {
      responsibility: '执行任务',
      api: 'MessageChannel/setTimeout',
      mechanism: '宏任务队列'
    }
  },
  
  工作流程: `
    1. React触发更新
    2. 根据Lane确定优先级
    3. 转换为Scheduler优先级
    4. 调度任务到Scheduler
    5. Scheduler选择合适时机执行
    6. 执行Fiber工作循环
    7. 检查是否需要让出控制权
    8. 继续或暂停任务
  `
};
```

### 1.3 优先级体系

```typescript
// React的Lane优先级
const enum ReactPriority {
  NoLane = 0,
  SyncLane = 1,              // 同步优先级
  InputContinuousLane = 2,   // 连续输入
  DefaultLane = 4,           // 默认优先级
  TransitionLane = 8,        // 过渡优先级
  IdleLane = 16              // 空闲优先级
}

// Scheduler的优先级
const enum SchedulerPriority {
  ImmediatePriority = 1,     // 立即执行
  UserBlockingPriority = 2,  // 用户阻塞
  NormalPriority = 3,        // 普通优先级
  LowPriority = 4,           // 低优先级
  IdlePriority = 5           // 空闲优先级
}

// 优先级转换
function lanesToSchedulerPriority(lanes: Lanes): SchedulerPriority {
  const lane = getHighestPriorityLane(lanes);
  
  if (includesSyncLane(lane)) {
    return ImmediatePriority;
  }
  
  if (includesInputContinuousLane(lane)) {
    return UserBlockingPriority;
  }
  
  if (includesDefaultLane(lane)) {
    return NormalPriority;
  }
  
  if (includesTransitionLane(lane)) {
    return LowPriority;
  }
  
  return IdlePriority;
}
```

## 2. Scheduler核心实现

### 2.1 任务队列

```typescript
// 任务对象
interface Task {
  id: number;
  callback: (() => void) | null;
  priorityLevel: SchedulerPriority;
  startTime: number;
  expirationTime: number;
  sortIndex: number;
}

// 小顶堆实现
class MinHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => boolean;
  
  constructor(compare: (a: T, b: T) => boolean) {
    this.compare = compare;
  }
  
  push(node: T): void {
    const heap = this.heap;
    const index = heap.length;
    heap.push(node);
    this.siftUp(index);
  }
  
  peek(): T | null {
    return this.heap[0] || null;
  }
  
  pop(): T | null {
    const heap = this.heap;
    if (heap.length === 0) {
      return null;
    }
    
    const first = heap[0];
    const last = heap.pop()!;
    
    if (heap.length > 0) {
      heap[0] = last;
      this.siftDown(0);
    }
    
    return first;
  }
  
  private siftUp(index: number): void {
    const heap = this.heap;
    const node = heap[index];
    
    while (index > 0) {
      const parentIndex = (index - 1) >>> 1;
      const parent = heap[parentIndex];
      
      if (this.compare(parent, node)) {
        break;
      }
      
      heap[index] = parent;
      index = parentIndex;
    }
    
    heap[index] = node;
  }
  
  private siftDown(index: number): void {
    const heap = this.heap;
    const length = heap.length;
    const node = heap[index];
    
    while (true) {
      const leftIndex = (index + 1) * 2 - 1;
      const rightIndex = leftIndex + 1;
      
      if (leftIndex >= length) {
        break;
      }
      
      const left = heap[leftIndex];
      const right = rightIndex < length ? heap[rightIndex] : null;
      
      let minIndex = leftIndex;
      let minNode = left;
      
      if (right && this.compare(right, left)) {
        minIndex = rightIndex;
        minNode = right;
      }
      
      if (this.compare(node, minNode)) {
        break;
      }
      
      heap[index] = minNode;
      index = minIndex;
    }
    
    heap[index] = node;
  }
}

// 任务队列
const taskQueue = new MinHeap<Task>((a, b) => 
  a.sortIndex < b.sortIndex
);

// 延迟任务队列
const timerQueue = new MinHeap<Task>((a, b) => 
  a.startTime < b.startTime
);
```

### 2.2 调度任务

```typescript
let taskIdCounter = 1;
let currentTask: Task | null = null;
let currentPriorityLevel = NormalPriority;
let isSchedulerPaused = false;
let isPerformingWork = false;
let isHostCallbackScheduled = false;

/**
 * 调度回调
 */
function scheduleCallback(
  priorityLevel: SchedulerPriority,
  callback: () => boolean | void,
  options?: { delay?: number }
): Task {
  const currentTime = getCurrentTime();
  
  let startTime: number;
  if (options?.delay) {
    startTime = currentTime + options.delay;
  } else {
    startTime = currentTime;
  }
  
  // 计算过期时间
  let timeout: number;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = -1; // 立即过期
      break;
    case UserBlockingPriority:
      timeout = 250;
      break;
    case IdlePriority:
      timeout = 1073741823; // 永不过期
      break;
    case LowPriority:
      timeout = 10000;
      break;
    case NormalPriority:
    default:
      timeout = 5000;
      break;
  }
  
  const expirationTime = startTime + timeout;
  
  const newTask: Task = {
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
    timerQueue.push(newTask);
    
    if (taskQueue.peek() === null && newTask === timerQueue.peek()) {
      // 如果是最早的延迟任务,设置定时器
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    // 立即任务
    newTask.sortIndex = expirationTime;
    taskQueue.push(newTask);
    
    // 调度工作
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  
  return newTask;
}

/**
 * 取消任务
 */
function cancelCallback(task: Task): void {
  task.callback = null;
}
```

### 2.3 执行任务

```typescript
/**
 * 刷新工作
 */
function flushWork(hasTimeRemaining: boolean, initialTime: number): boolean {
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  
  const previousPriorityLevel = currentPriorityLevel;
  
  try {
    // 将到期的延迟任务移到任务队列
    advanceTimers(initialTime);
    
    // 执行任务队列
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

/**
 * 工作循环
 */
function workLoop(hasTimeRemaining: boolean, initialTime: number): boolean {
  let currentTime = initialTime;
  advanceTimers(currentTime);
  
  currentTask = taskQueue.peek();
  
  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // 任务未过期且需要让出控制权
      break;
    }
    
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      
      // 执行任务
      const continuationCallback = callback(didUserCallbackTimeout);
      
      currentTime = getCurrentTime();
      
      if (typeof continuationCallback === 'function') {
        // 任务返回了continuation,继续
        currentTask.callback = continuationCallback;
      } else {
        // 任务完成,移除
        if (currentTask === taskQueue.peek()) {
          taskQueue.pop();
        }
      }
      
      advanceTimers(currentTime);
    } else {
      // 任务已取消
      taskQueue.pop();
    }
    
    currentTask = taskQueue.peek();
  }
  
  // 返回是否还有更多工作
  if (currentTask !== null) {
    return true;
  } else {
    // 检查延迟任务
    const firstTimer = timerQueue.peek();
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}

/**
 * 推进定时器
 */
function advanceTimers(currentTime: number): void {
  let timer = timerQueue.peek();
  
  while (timer !== null) {
    if (timer.callback === null) {
      // 已取消
      timerQueue.pop();
    } else if (timer.startTime <= currentTime) {
      // 到期,移到任务队列
      timerQueue.pop();
      timer.sortIndex = timer.expirationTime;
      taskQueue.push(timer);
    } else {
      // 未到期
      return;
    }
    
    timer = timerQueue.peek();
  }
}
```

## 3. 时间切片实现

### 3.1 shouldYield判断

```typescript
// 帧间隔(5ms)
let yieldInterval = 5;
let deadline = 0;

/**
 * 是否应该让出控制权
 */
function shouldYieldToHost(): boolean {
  const currentTime = getCurrentTime();
  return currentTime >= deadline;
}

/**
 * 强制让出
 */
function forceFrameRate(fps: number): void {
  if (fps < 0 || fps > 125) {
    console.error('fps must be between 0 and 125');
    return;
  }
  
  if (fps > 0) {
    yieldInterval = Math.floor(1000 / fps);
  } else {
    yieldInterval = 5;
  }
}

/**
 * 获取当前时间
 */
function getCurrentTime(): number {
  return performance.now();
}
```

### 3.2 宿主环境调度

```typescript
// 使用MessageChannel实现
let schedulePerformWorkUntilDeadline: () => void;

if (typeof MessageChannel !== 'undefined') {
  const channel = new MessageChannel();
  const port = channel.port2;
  
  channel.port1.onmessage = () => {
    if (scheduledHostCallback !== null) {
      const currentTime = getCurrentTime();
      deadline = currentTime + yieldInterval;
      
      const hasTimeRemaining = true;
      
      try {
        const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
        
        if (!hasMoreWork) {
          isMessageLoopRunning = false;
          scheduledHostCallback = null;
        } else {
          // 还有工作,继续调度
          port.postMessage(null);
        }
      } catch (error) {
        // 重新抛出错误
        port.postMessage(null);
        throw error;
      }
    } else {
      isMessageLoopRunning = false;
    }
  };
  
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
} else {
  // 降级到setTimeout
  schedulePerformWorkUntilDeadline = () => {
    setTimeout(() => {
      if (scheduledHostCallback !== null) {
        const currentTime = getCurrentTime();
        deadline = currentTime + yieldInterval;
        
        const hasTimeRemaining = true;
        
        try {
          const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
          
          if (hasMoreWork) {
            schedulePerformWorkUntilDeadline();
          } else {
            isMessageLoopRunning = false;
            scheduledHostCallback = null;
          }
        } catch (error) {
          schedulePerformWorkUntilDeadline();
          throw error;
        }
      }
    }, 0);
  };
}

let scheduledHostCallback: ((hasTimeRemaining: boolean, currentTime: number) => boolean) | null = null;
let isMessageLoopRunning = false;

/**
 * 请求宿主回调
 */
function requestHostCallback(callback: (hasTimeRemaining: boolean, currentTime: number) => boolean): void {
  scheduledHostCallback = callback;
  
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}
```

### 3.3 延迟任务处理

```typescript
let taskTimeoutID = -1;

/**
 * 请求宿主超时
 */
function requestHostTimeout(callback: () => void, ms: number): void {
  taskTimeoutID = setTimeout(() => {
    callback();
  }, ms);
}

/**
 * 取消宿主超时
 */
function cancelHostTimeout(): void {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}

/**
 * 处理超时
 */
function handleTimeout(currentTime: number): void {
  advanceTimers(currentTime);
  
  if (!isHostCallbackScheduled) {
    if (taskQueue.peek() !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      const firstTimer = timerQueue.peek();
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}
```

## 4. React调度集成

### 4.1 ensureRootIsScheduled

```typescript
/**
 * 确保Root被调度
 */
function ensureRootIsScheduled(root: FiberRoot, currentTime: number): void {
  const existingCallbackNode = root.callbackNode;
  
  // 标记饥饿的lanes为过期
  markStarvedLanesAsExpired(root, currentTime);
  
  // 获取下一个要处理的lanes
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );
  
  if (nextLanes === NoLanes) {
    // 没有工作,取消现有调度
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode);
    }
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }
  
  // 获取最高优先级lane
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  const existingCallbackPriority = root.callbackPriority;
  
  if (existingCallbackPriority === newCallbackPriority) {
    // 优先级相同,复用现有调度
    return;
  }
  
  // 取消现有调度
  if (existingCallbackNode !== null) {
    cancelCallback(existingCallbackNode);
  }
  
  // 调度新任务
  let newCallbackNode;
  if (newCallbackPriority === SyncLane) {
    // 同步优先级
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    
    if (supportsMicrotasks) {
      scheduleMicrotask(flushSyncCallbacks);
    } else {
      scheduleCallback(ImmediatePriority, flushSyncCallbacks);
    }
    
    newCallbackNode = null;
  } else {
    // 异步优先级
    let schedulerPriorityLevel = lanesToSchedulerPriority(newCallbackPriority);
    
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }
  
  root.callbackNode = newCallbackNode;
  root.callbackPriority = newCallbackPriority;
}
```

### 4.2 并发工作

```typescript
/**
 * 执行并发工作
 */
function performConcurrentWorkOnRoot(
  root: FiberRoot,
  didTimeout: boolean
): boolean | void {
  // 获取要处理的lanes
  const originalCallbackNode = root.callbackNode;
  
  // 检查是否有过期任务
  const didFlushPassiveEffects = flushPassiveEffects();
  if (didFlushPassiveEffects) {
    // passive effects可能调度了新的更新
    if (root.callbackNode !== originalCallbackNode) {
      return null;
    }
  }
  
  let lanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );
  
  if (lanes === NoLanes) {
    return null;
  }
  
  // 检查是否应该同步渲染
  const shouldTimeSlice =
    !includesBlockingLane(root, lanes) &&
    !includesExpiredLane(root, lanes) &&
    !didTimeout;
  
  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes);
  
  if (exitStatus !== RootInProgress) {
    if (exitStatus === RootErrored) {
      // 错误处理
      const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root);
      if (errorRetryLanes !== NoLanes) {
        lanes = errorRetryLanes;
        exitStatus = recoverFromConcurrentError(root, errorRetryLanes);
      }
    }
    
    if (exitStatus === RootFatalErrored) {
      const fatalError = workInProgressRootFatalError;
      prepareFreshStack(root, NoLanes);
      markRootSuspended(root, lanes);
      ensureRootIsScheduled(root, now());
      throw fatalError;
    }
    
    if (exitStatus === RootDidNotComplete) {
      // 渲染未完成,标记为suspended
      markRootSuspended(root, lanes);
    } else {
      // 渲染完成
      const finishedWork = root.current.alternate;
      root.finishedWork = finishedWork;
      root.finishedLanes = lanes;
      
      finishConcurrentRender(root, exitStatus, lanes);
    }
  }
  
  // 确保被调度
  ensureRootIsScheduled(root, now());
  
  // 返回continuation
  if (root.callbackNode === originalCallbackNode) {
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  
  return null;
}
```

### 4.3 同步工作

```typescript
/**
 * 执行同步工作
 */
function performSyncWorkOnRoot(root: FiberRoot): void {
  // 获取lanes
  const lanes = getNextLanes(root, NoLanes);
  
  if (!includesSomeLane(lanes, SyncLane)) {
    // 没有同步工作
    ensureRootIsScheduled(root, now());
    return;
  }
  
  let exitStatus = renderRootSync(root, lanes);
  
  if (root.tag !== LegacyRoot && exitStatus === RootErrored) {
    // 错误恢复
    const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root);
    if (errorRetryLanes !== NoLanes) {
      lanes = errorRetryLanes;
      exitStatus = recoverFromConcurrentError(root, errorRetryLanes);
    }
  }
  
  if (exitStatus === RootFatalErrored) {
    const fatalError = workInProgressRootFatalError;
    prepareFreshStack(root, NoLanes);
    markRootSuspended(root, lanes);
    ensureRootIsScheduled(root, now());
    throw fatalError;
  }
  
  if (exitStatus === RootDidNotComplete) {
    throw new Error('Root did not complete');
  }
  
  // 完成渲染
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  
  commitRoot(root);
  
  ensureRootIsScheduled(root, now());
}
```

## 5. 批量更新

### 5.1 批量更新机制

```typescript
// 批量更新上下文
let executionContext = NoContext;

const enum ExecutionContext {
  NoContext = 0b000,
  BatchedContext = 0b001,
  RenderContext = 0b010,
  CommitContext = 0b100
}

/**
 * 批量更新
 */
function batchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    
    if (executionContext === NoContext) {
      // 批量更新结束,刷新同步队列
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
}

/**
 * 离散更新
 */
function discreteUpdates<A, B, C, D, R>(
  fn: (a: A, b: B, c: C, d: D) => R,
  a: A,
  b: B,
  c: C,
  d: D
): R {
  const prevExecutionContext = executionContext;
  executionContext |= DiscreteEventContext;
  
  try {
    return runWithPriority(
      UserBlockingPriority,
      fn.bind(null, a, b, c, d)
    );
  } finally {
    executionContext = prevExecutionContext;
    
    if (executionContext === NoContext) {
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
}
```

### 5.2 同步回调队列

```typescript
// 同步回调队列
let syncQueue: Array<() => void> | null = null;
let isFlushingSyncQueue = false;

/**
 * 调度同步回调
 */
function scheduleSyncCallback(callback: () => void): void {
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

/**
 * 刷新同步回调
 */
function flushSyncCallbacks(): void {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    isFlushingSyncQueue = true;
    
    try {
      const queue = syncQueue;
      
      runWithPriority(ImmediatePriority, () => {
        for (let i = 0; i < queue.length; i++) {
          let callback = queue[i];
          do {
            callback = callback();
          } while (callback !== null);
        }
      });
      
      syncQueue = null;
    } finally {
      isFlushingSyncQueue = false;
    }
  }
}
```

## 6. 优先级计算

### 6.1 Lane选择

```typescript
/**
 * 获取下一个lanes
 */
function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
  const pendingLanes = root.pendingLanes;
  
  if (pendingLanes === NoLanes) {
    return NoLanes;
  }
  
  let nextLanes = NoLanes;
  let nextLanePriority = NoLanePriority;
  
  const expiredLanes = root.expiredLanes;
  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  
  // 检查过期lanes
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
  if (nonIdlePendingLanes !== NoLanes) {
    const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
    
    if (nonIdleUnblockedLanes !== NoLanes) {
      nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
      nextLanePriority = return_highestLanePriority;
    } else {
      const nonIdlePingedLanes = nonIdlePendingLanes & pingedLanes;
      if (nonIdlePingedLanes !== NoLanes) {
        nextLanes = getHighestPriorityLanes(nonIdlePingedLanes);
        nextLanePriority = return_highestLanePriority;
      }
    }
  } else {
    // 只有idle lanes
    const unblockedLanes = pendingLanes & ~suspendedLanes;
    
    if (unblockedLanes !== NoLanes) {
      nextLanes = getHighestPriorityLanes(unblockedLanes);
      nextLanePriority = return_highestLanePriority;
    } else {
      if (pingedLanes !== NoLanes) {
        nextLanes = getHighestPriorityLanes(pingedLanes);
        nextLanePriority = return_highestLanePriority;
      }
    }
  }
  
  if (nextLanes === NoLanes) {
    return NoLanes;
  }
  
  // 包含wipLanes中与nextLanes相同或更高优先级的lanes
  if (wipLanes !== NoLanes && wipLanes !== nextLanes) {
    const wipLanePriority = getHighestPriorityLane(wipLanes);
    
    if (nextLanePriority <= wipLanePriority) {
      return wipLanes;
    }
  }
  
  // 包含被纠缠的lanes
  const entangledLanes = root.entangledLanes;
  if (entangledLanes !== NoLanes) {
    const entanglements = root.entanglements;
    let lanes = nextLanes & entangledLanes;
    
    while (lanes > 0) {
      const index = pickArbitraryLaneIndex(lanes);
      const lane = 1 << index;
      
      nextLanes |= entanglements[index];
      
      lanes &= ~lane;
    }
  }
  
  return nextLanes;
}

/**
 * 获取最高优先级lanes
 */
function getHighestPriorityLanes(lanes: Lanes): Lanes {
  // 同步lane
  if ((lanes & SyncLane) !== NoLanes) {
    return_highestLanePriority = SyncLanePriority;
    return SyncLane;
  }
  
  // 输入连续lane
  const inputContinuousLanes = InputContinuousLanes & lanes;
  if (inputContinuousLanes !== NoLanes) {
    return_highestLanePriority = InputContinuousLanePriority;
    return inputContinuousLanes;
  }
  
  // 默认lane
  const defaultLanes = DefaultLanes & lanes;
  if (defaultLanes !== NoLanes) {
    return_highestLanePriority = DefaultLanePriority;
    return defaultLanes;
  }
  
  // 过渡lanes
  const transitionLanes = TransitionLanes & lanes;
  if (transitionLanes !== NoLanes) {
    return_highestLanePriority = TransitionPriority;
    return transitionLanes;
  }
  
  // Idle lanes
  if ((lanes & IdleLanes) !== NoLanes) {
    return_highestLanePriority = IdleLanePriority;
    return lanes & IdleLanes;
  }
  
  return_highestLanePriority = DefaultLanePriority;
  return lanes;
}
```

### 6.2 Lane纠缠

```typescript
/**
 * 标记纠缠的lanes
 */
function markRootEntangled(root: FiberRoot, entangledLanes: Lanes): void {
  const rootEntangledLanes = root.entangledLanes |= entangledLanes;
  const entanglements = root.entanglements;
  
  let lanes = rootEntangledLanes;
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;
    
    if (
      (lane & entangledLanes) |
      (entanglements[index] & entangledLanes)
    ) {
      entanglements[index] |= entangledLanes;
    }
    
    lanes &= ~lane;
  }
}

/**
 * 标记root更新
 */
function markRootUpdated(
  root: FiberRoot,
  updateLane: Lane,
  eventTime: number
): void {
  root.pendingLanes |= updateLane;
  
  if (updateLane !== IdleLane) {
    root.suspendedLanes = NoLanes;
    root.pingedLanes = NoLanes;
  }
  
  const eventTimes = root.eventTimes;
  const index = laneToIndex(updateLane);
  eventTimes[index] = eventTime;
}
```

## 7. 饥饿处理

### 7.1 过期时间

```typescript
/**
 * 标记饥饿lanes为过期
 */
function markStarvedLanesAsExpired(
  root: FiberRoot,
  currentTime: number
): void {
  const pendingLanes = root.pendingLanes;
  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;
  const expirationTimes = root.expirationTimes;
  
  let lanes = pendingLanes;
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;
    
    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp) {
      if (
        (lane & suspendedLanes) === NoLanes ||
        (lane & pingedLanes) !== NoLanes
      ) {
        // 设置过期时间
        expirationTimes[index] = computeExpirationTime(lane, currentTime);
      }
    } else if (expirationTime <= currentTime) {
      // 已过期
      root.expiredLanes |= lane;
    }
    
    lanes &= ~lane;
  }
}

/**
 * 计算过期时间
 */
function computeExpirationTime(lane: Lane, currentTime: number): number {
  const priority = getHighestPriorityLane(lane);
  
  switch (priority) {
    case SyncLane:
      return currentTime + 250;
    
    case InputContinuousLane:
      return currentTime + 250;
    
    case DefaultLane:
      return currentTime + 5000;
    
    case TransitionLane:
      return currentTime + 10000;
    
    case IdleLane:
      return NoTimestamp;
    
    default:
      return NoTimestamp;
  }
}
```

## 8. 性能优化

### 8.1 任务合并

```typescript
/**
 * 合并任务
 */
function mergeTasks(task1: Task, task2: Task): Task {
  // 取较高优先级
  const priorityLevel = task1.priorityLevel < task2.priorityLevel
    ? task1.priorityLevel
    : task2.priorityLevel;
  
  // 取较早过期时间
  const expirationTime = task1.expirationTime < task2.expirationTime
    ? task1.expirationTime
    : task2.expirationTime;
  
  // 合并回调
  const mergedCallback = (didTimeout: boolean) => {
    task1.callback && task1.callback(didTimeout);
    task2.callback && task2.callback(didTimeout);
  };
  
  return {
    id: taskIdCounter++,
    callback: mergedCallback,
    priorityLevel,
    startTime: getCurrentTime(),
    expirationTime,
    sortIndex: expirationTime
  };
}
```

### 8.2 性能监控

```typescript
/**
 * 性能分析
 */
function profileScheduler() {
  const stats = {
    totalTasks: 0,
    completedTasks: 0,
    cancelledTasks: 0,
    avgExecutionTime: 0,
    avgWaitTime: 0
  };
  
  // 包装scheduleCallback
  const originalSchedule = scheduleCallback;
  
  scheduleCallback = function(priority, callback, options) {
    stats.totalTasks++;
    
    const startTime = getCurrentTime();
    
    const wrappedCallback = (didTimeout: boolean) => {
      const executeTime = getCurrentTime();
      const waitTime = executeTime - startTime;
      
      const result = callback(didTimeout);
      
      const endTime = getCurrentTime();
      const executionTime = endTime - executeTime;
      
      stats.completedTasks++;
      stats.avgWaitTime = 
        (stats.avgWaitTime * (stats.completedTasks - 1) + waitTime) /
        stats.completedTasks;
      stats.avgExecutionTime =
        (stats.avgExecutionTime * (stats.completedTasks - 1) + executionTime) /
        stats.completedTasks;
      
      return result;
    };
    
    return originalSchedule(priority, wrappedCallback, options);
  };
  
  return stats;
}
```

## 9. 面试高频问题

```typescript
const schedulerInterviewQA = {
  Q1: {
    question: 'React的调度系统如何工作?',
    answer: [
      '1. React触发更新,分配Lane优先级',
      '2. 转换为Scheduler优先级',
      '3. 将任务加入优先级队列',
      '4. Scheduler选择合适时机执行',
      '5. 时间切片,可中断渲染',
      '6. 完成或暂停,等待下次调度'
    ]
  },
  
  Q2: {
    question: '时间切片如何实现?',
    answer: `
      1. 使用MessageChannel(或setTimeout)调度宏任务
      2. 每5ms检查是否超时
      3. 超时则让出控制权
      4. 浏览器处理其他任务(渲染、交互)
      5. 下一帧继续执行
    `
  },
  
  Q3: {
    question: 'React如何处理不同优先级的更新?',
    answer: [
      '1. Lane模型: 用二进制位表示优先级',
      '2. 高优先级中断低优先级',
      '3. 饥饿处理: 低优先级超时提升',
      '4. 批量更新: 合并同优先级',
      '5. 过期lanes立即执行'
    ]
  },
  
  Q4: {
    question: 'Scheduler的任务队列如何实现?',
    answer: `
      使用最小堆(MinHeap):
      1. 按expirationTime排序
      2. peek()获取最早过期任务
      3. O(1)查找,O(logN)插入/删除
      4. 延迟任务单独队列
    `
  },
  
  Q5: {
    question: '为什么使用MessageChannel而非setTimeout?',
    answer: [
      '1. setTimeout最小延迟4ms(嵌套5层后)',
      '2. MessageChannel没有延迟限制',
      '3. MessageChannel是宏任务,不阻塞微任务',
      '4. 性能更好,更精确'
    ]
  },
  
  Q6: {
    question: '批量更新如何实现?',
    answer: `
      1. executionContext标记批量上下文
      2. 在事件处理器中自动批量
      3. 收集多个setState
      4. 批量结束后统一调度
      5. React 18自动批量(包括异步)
    `
  }
};
```

## 10. 总结

Fiber调度系统的核心要点:

1. **调度架构**: React层 -> Scheduler层 -> 浏览器层
2. **优先级**: Lane模型和Scheduler优先级转换
3. **任务队列**: 最小堆实现的优先级队列
4. **时间切片**: 5ms间隔,MessageChannel调度
5. **可中断**: workLoop检查shouldYield
6. **批量更新**: executionContext管理批量
7. **饥饿处理**: 过期时间防止低优先级饥饿
8. **性能优化**: 任务合并、优先级提升

理解调度系统是掌握React性能优化的关键。

