# Fiber架构深度解析 - React 16革命性重构

## 1. Fiber架构概述

### 1.1 什么是Fiber

```typescript
const fiberConcept = {
  definition: 'React 16引入的新协调引擎',
  
  purpose: {
    incremental: '可中断的渲染',
    priority: '任务优先级调度',
    concurrent: '并发渲染能力',
    smoother: '更流畅的用户体验'
  },
  
  before: {
    architecture: 'Stack Reconciler栈协调器',
    problem: '递归无法中断',
    issue: '长任务阻塞主线程',
    result: '卡顿掉帧'
  },
  
  after: {
    architecture: 'Fiber Reconciler纤维协调器',
    solution: '链表结构可中断',
    benefit: '时间切片调度',
    result: '流畅响应'
  }
};
```

### 1.2 为什么需要Fiber

```typescript
// Stack Reconciler的问题
const stackProblems = {
  scenario: '渲染大型组件树',
  
  example: `
    // 深度递归渲染
    function render(element) {
      const dom = createDOM(element);
      element.children.forEach(child => {
        render(child); // 递归,无法中断
      });
      return dom;
    }
  `,
  
  issues: [
    {
      problem: '同步递归',
      impact: 'JavaScript单线程,递归期间无法响应',
      example: '渲染1000个节点可能需要16ms,超过一帧时间'
    },
    {
      problem: '无法中断',
      impact: '长任务阻塞主线程',
      example: '用户点击按钮,需等待渲染完成才能响应'
    },
    {
      problem: '无优先级',
      impact: '所有更新同等对待',
      example: '动画更新和数据获取更新一视同仁'
    }
  ]
};

// Fiber的解决方案
const fiberSolutions = {
  可中断渲染: {
    mechanism: '将渲染工作分割成小单元',
    benefit: '可以暂停、恢复、取消',
    implementation: '使用requestIdleCallback'
  },
  
  优先级调度: {
    mechanism: '不同更新分配不同优先级',
    benefit: '高优先级任务优先执行',
    example: {
      high: '用户输入、动画',
      normal: '网络请求',
      low: '离屏内容'
    }
  },
  
  时间切片: {
    mechanism: '将工作分散到多个帧',
    benefit: '不阻塞渲染和响应',
    target: '每帧60fps,约16.6ms'
  }
};
```

### 1.3 Fiber数据结构

```typescript
// Fiber节点结构
interface Fiber {
  // 节点类型
  tag: WorkTag;
  type: any;
  key: null | string;
  
  // 实例引用
  stateNode: any; // 对应的DOM节点或组件实例
  
  // Fiber关系
  return: Fiber | null;    // 父Fiber
  child: Fiber | null;     // 第一个子Fiber
  sibling: Fiber | null;   // 下一个兄弟Fiber
  index: number;           // 在父Fiber children中的索引
  
  // 双缓冲
  alternate: Fiber | null; // 对应的另一个Fiber树节点
  
  // 属性和状态
  pendingProps: any;       // 新的props
  memoizedProps: any;      // 上次渲染的props
  memoizedState: any;      // 上次渲染的state
  updateQueue: UpdateQueue | null; // 更新队列
  
  // 副作用
  flags: Flags;            // 副作用标记
  subtreeFlags: Flags;     // 子树副作用标记
  deletions: Fiber[] | null; // 要删除的子Fiber
  
  // 调度相关
  lanes: Lanes;            // 优先级
  childLanes: Lanes;       // 子树优先级
  
  // Hooks
  memoizedState: Hook | null; // Hooks链表
}

// WorkTag类型
const enum WorkTag {
  FunctionComponent = 0,
  ClassComponent = 1,
  IndeterminateComponent = 2,
  HostRoot = 3,
  HostPortal = 4,
  HostComponent = 5,
  HostText = 6,
  Fragment = 7,
  Mode = 8,
  ContextConsumer = 9,
  ContextProvider = 10,
  ForwardRef = 11,
  Profiler = 12,
  SuspenseComponent = 13,
  MemoComponent = 14,
  SimpleMemoComponent = 15,
  LazyComponent = 16,
  IncompleteClassComponent = 17,
  DehydratedFragment = 18,
  SuspenseListComponent = 19,
  ScopeComponent = 21,
  OffscreenComponent = 22,
  LegacyHiddenComponent = 23,
  CacheComponent = 24,
  TracingMarkerComponent = 25
}
```

## 2. Fiber树的构建

### 2.1 双缓冲技术

```typescript
// 双缓冲Fiber树
const doubleBuffering = {
  current树: {
    description: '当前显示在屏幕上的Fiber树',
    lifecycle: '已完成渲染'
  },
  
  workInProgress树: {
    description: '正在内存中构建的Fiber树',
    lifecycle: '构建中'
  },
  
  mechanism: `
    1. 基于current树创建workInProgress树
    2. 在workInProgress树上进行更新
    3. 完成后,workInProgress成为新的current
    4. 旧current成为新的workInProgress备用
  `,
  
  benefits: [
    '不影响当前显示',
    '可以随时中断和恢复',
    '出错时可以回滚',
    '内存复用'
  ]
};

// alternate指针
function createWorkInProgress(current: Fiber, pendingProps: any): Fiber {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 创建新的workInProgress
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    
    // 建立双向连接
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用已有的
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    
    // 清空副作用
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  
  // 复制属性
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  
  return workInProgress;
}
```

### 2.2 Fiber树的遍历

```typescript
// 深度优先遍历
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  // 开始工作
  let next = beginWork(current, unitOfWork, renderLanes);
  
  // 更新memoizedProps
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 没有子节点,完成工作
    completeUnitOfWork(unitOfWork);
  } else {
    // 有子节点,继续处理
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 完成工作
    completeWork(current, completedWork, renderLanes);
    
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // 有兄弟节点,处理兄弟
      workInProgress = siblingFiber;
      return;
    }
    
    // 没有兄弟节点,返回父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}
```

### 2.3 遍历顺序示例

```typescript
// Fiber树结构
const fiberTreeExample = `
        App
       /   \\
     Div    Div
     /       \\
    H1       P
`;

// 遍历顺序
const traversalOrder = {
  beginWork: [
    '1. App (beginWork)',
    '2. Div (beginWork)',
    '3. H1 (beginWork)',
    '4. H1 (completeWork) - 无子节点',
    '5. Div (completeWork) - 无兄弟节点',
    '6. Div (beginWork) - App的兄弟',
    '7. P (beginWork)',
    '8. P (completeWork) - 无子节点',
    '9. Div (completeWork) - 无兄弟节点',
    '10. App (completeWork) - 根节点完成'
  ],
  
  principle: `
    1. 先处理child(深度优先)
    2. child为null时处理sibling
    3. sibling为null时返回return(父节点)
    4. 重复直到回到根节点
  `
};
```

## 3. 工作阶段

### 3.1 Render阶段(可中断)

```typescript
// Render阶段
const renderPhase = {
  description: '在内存中构建Fiber树',
  
  characteristics: [
    '可以被中断',
    '不会产生副作用',
    '可以并发进行',
    '可以重复执行'
  ],
  
  mainWork: {
    beginWork: {
      purpose: '向下遍历,创建子Fiber',
      process: [
        '1. 根据type创建Fiber',
        '2. 对比props',
        '3. 调用render方法',
        '4. diff子节点',
        '5. 标记副作用'
      ]
    },
    
    completeWork: {
      purpose: '向上归并,完成节点',
      process: [
        '1. 创建DOM实例',
        '2. 处理props',
        '3. 收集副作用',
        '4. 构建DOM树'
      ]
    }
  }
};

// beginWork实现
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  // 根据tag分发
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(
        current,
        workInProgress,
        renderLanes
      );
    
    case ClassComponent:
      return updateClassComponent(
        current,
        workInProgress,
        renderLanes
      );
    
    case HostComponent:
      return updateHostComponent(
        current,
        workInProgress,
        renderLanes
      );
    
    case HostText:
      return updateHostText(current, workInProgress);
    
    // ... 其他类型
  }
}

// 函数组件更新
function updateFunctionComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  
  // 执行函数组件
  const children = Component(props);
  
  // 协调子节点
  reconcileChildren(current, workInProgress, children, renderLanes);
  
  return workInProgress.child;
}

// completeWork实现
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case HostComponent: {
      const type = workInProgress.type;
      
      if (current !== null && workInProgress.stateNode != null) {
        // 更新
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          renderLanes
        );
      } else {
        // 创建DOM
        const instance = createInstance(type, newProps, workInProgress);
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
      }
      
      return null;
    }
    
    case HostText: {
      const newText = newProps;
      
      if (current && workInProgress.stateNode != null) {
        // 更新文本
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        // 创建文本节点
        const textInstance = createTextInstance(newText, workInProgress);
        workInProgress.stateNode = textInstance;
      }
      
      return null;
    }
  }
}
```

### 3.2 Commit阶段(不可中断)

```typescript
// Commit阶段
const commitPhase = {
  description: '将更新应用到DOM',
  
  characteristics: [
    '不可中断',
    '同步执行',
    '产生副作用',
    '用户可见'
  ],
  
  subPhases: {
    beforeMutation: {
      name: '执行DOM操作前',
      work: [
        '执行getSnapshotBeforeUpdate',
        '调度useEffect'
      ]
    },
    
    mutation: {
      name: '执行DOM操作',
      work: [
        '插入、更新、删除DOM',
        '执行ref卸载',
        '执行useLayoutEffect清理'
      ]
    },
    
    layout: {
      name: '执行DOM操作后',
      work: [
        '执行componentDidMount/Update',
        '执行ref回调',
        '执行useLayoutEffect回调',
        '调度useEffect'
      ]
    }
  }
};

// commit主流程
function commitRoot(root: FiberRoot) {
  const finishedWork = root.finishedWork;
  
  // 准备工作
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  
  if (subtreeHasEffects || rootHasEffect) {
    // Before mutation
    commitBeforeMutationEffects(root, finishedWork);
    
    // Mutation
    commitMutationEffects(root, finishedWork);
    
    // 切换current树
    root.current = finishedWork;
    
    // Layout
    commitLayoutEffects(finishedWork, root);
  }
  
  // 清理
  root.finishedWork = null;
}

// Mutation阶段
function commitMutationEffects(
  root: FiberRoot,
  finishedWork: Fiber
) {
  // 遍历Fiber树
  commitMutationEffectsOnFiber(finishedWork, root);
}

function commitMutationEffectsOnFiber(
  finishedWork: Fiber,
  root: FiberRoot
) {
  const flags = finishedWork.flags;
  
  // 处理ref
  if (flags & Ref) {
    const current = finishedWork.alternate;
    if (current !== null) {
      commitDetachRef(current);
    }
  }
  
  // 处理Placement
  if (flags & Placement) {
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
  
  // 处理Update
  if (flags & Update) {
    const current = finishedWork.alternate;
    commitWork(current, finishedWork);
  }
  
  // 处理Deletion
  if (flags & Deletion) {
    commitDeletion(root, finishedWork);
  }
}

// 插入节点
function commitPlacement(finishedWork: Fiber) {
  const parentFiber = getHostParentFiber(finishedWork);
  const parent = parentFiber.stateNode;
  
  const before = getHostSibling(finishedWork);
  
  if (before) {
    insertBefore(parent, finishedWork.stateNode, before);
  } else {
    appendChild(parent, finishedWork.stateNode);
  }
}

// 更新节点
function commitWork(current: Fiber | null, finishedWork: Fiber) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
      // 执行useLayoutEffect清理
      commitHookEffectListUnmount(finishedWork);
      return;
    
    case HostComponent: {
      const instance = finishedWork.stateNode;
      if (instance != null) {
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        
        // 更新DOM属性
        updateProperties(instance, type, oldProps, newProps);
      }
      return;
    }
    
    case HostText: {
      const textInstance = finishedWork.stateNode;
      const newText = finishedWork.memoizedProps;
      const oldText = current !== null ? current.memoizedProps : newText;
      
      // 更新文本
      commitTextUpdate(textInstance, oldText, newText);
      return;
    }
  }
}
```

## 4. 优先级调度

### 4.1 Lane模型

```typescript
// Lane优先级模型(React 18+)
const enum Lanes {
  NoLanes = 0b0000000000000000000000000000000,
  NoLane = NoLanes,
  
  // 同步优先级
  SyncLane = 0b0000000000000000000000000000001,
  
  // 输入连续优先级
  InputContinuousHydrationLane = 0b0000000000000000000000000000010,
  InputContinuousLane = 0b0000000000000000000000000000100,
  
  // 默认优先级
  DefaultHydrationLane = 0b0000000000000000000000000001000,
  DefaultLane = 0b0000000000000000000000000010000,
  
  // 过渡优先级
  TransitionLane1 = 0b0000000000000000000000000100000,
  TransitionLane2 = 0b0000000000000000000000001000000,
  // ... 更多过渡lane
  
  // 重试lane
  RetryLane1 = 0b0000000100000000000000000000000,
  RetryLane2 = 0b0000001000000000000000000000000,
  
  // 离屏/隐藏
  OffscreenLane = 0b1000000000000000000000000000000,
  
  // Idle优先级
  IdleHydrationLane = 0b0100000000000000000000000000000,
  IdleLane = 0b0010000000000000000000000000000
}

// Lane操作
function mergeLanes(a: Lanes, b: Lanes): Lanes {
  return a | b;
}

function removeLanes(set: Lanes, subset: Lanes): Lanes {
  return set & ~subset;
}

function intersectLanes(a: Lanes, b: Lanes): Lanes {
  return a & b;
}

function includesSomeLane(a: Lanes, b: Lanes): boolean {
  return (a & b) !== NoLanes;
}

function isSubsetOfLanes(set: Lanes, subset: Lanes): boolean {
  return (set & subset) === subset;
}
```

### 4.2 优先级分配

```typescript
// 根据事件类型分配优先级
function getEventPriority(domEventName: string): Lane {
  switch (domEventName) {
    // 离散事件: 同步优先级
    case 'click':
    case 'keydown':
    case 'keyup':
    case 'input':
      return SyncLane;
    
    // 连续事件: 输入连续优先级
    case 'drag':
    case 'dragover':
    case 'mousemove':
    case 'scroll':
      return InputContinuousLane;
    
    // 默认事件: 默认优先级
    default:
      return DefaultLane;
  }
}

// 更新优先级
function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane,
  eventTime: number
) {
  // 标记更新lane
  markUpdateLaneFromFiberToRoot(fiber, lane);
  
  // 调度更新
  if (lane === SyncLane) {
    // 同步更新
    performSyncWorkOnRoot(root);
  } else {
    // 异步更新
    ensureRootIsScheduled(root, eventTime);
  }
}
```

### 4.3 饥饿问题处理

```typescript
// 防止低优先级任务饥饿
function markStarvedLanesAsExpired(
  root: FiberRoot,
  currentTime: number
) {
  const pendingLanes = root.pendingLanes;
  const expirationTimes = root.expirationTimes;
  
  let lanes = pendingLanes;
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;
    const expirationTime = expirationTimes[index];
    
    if (expirationTime === NoTimestamp) {
      // 设置过期时间
      expirationTimes[index] = computeExpirationTime(lane, currentTime);
    } else if (expirationTime <= currentTime) {
      // 已过期,提升为过期lane
      root.expiredLanes |= lane;
    }
    
    lanes &= ~lane;
  }
}

function computeExpirationTime(lane: Lane, currentTime: number): number {
  switch (lane) {
    case SyncLane:
      return currentTime + 250; // 250ms
    
    case InputContinuousLane:
      return currentTime + 1000; // 1s
    
    case DefaultLane:
      return currentTime + 5000; // 5s
    
    case TransitionLane1:
    case TransitionLane2:
      return currentTime + 10000; // 10s
    
    default:
      return NoTimestamp;
  }
}
```

## 5. 可中断渲染

### 5.1 时间切片

```typescript
// 时间切片实现
let yieldInterval = 5; // 5ms

function shouldYield(): boolean {
  const currentTime = getCurrentTime();
  return currentTime >= deadline;
}

function workLoopConcurrent() {
  // 并发模式工作循环
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// Scheduler调度
function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback
): Task {
  const currentTime = getCurrentTime();
  
  const startTime = currentTime;
  const timeout = timeoutForPriorityLevel(priorityLevel);
  const expirationTime = startTime + timeout;
  
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: expirationTime
  };
  
  push(taskQueue, newTask);
  requestHostCallback(flushWork);
  
  return newTask;
}
```

### 5.2 中断和恢复

```typescript
// 中断渲染
function interruptRender() {
  // 保存当前工作
  const currentWork = workInProgress;
  
  // 清空工作栈
  workInProgress = null;
  
  // 返回未完成的工作
  return currentWork;
}

// 恢复渲染
function resumeRender(work: Fiber) {
  // 恢复工作
  workInProgress = work;
  
  // 继续工作循环
  workLoopConcurrent();
}

// 示例: 处理高优先级中断
function handleHighPriorityUpdate(newUpdate: Update) {
  if (workInProgress !== null) {
    // 保存当前工作
    const interruptedWork = interruptRender();
    
    // 处理高优先级更新
    performSyncWorkOnRoot(root);
    
    // 恢复之前的工作
    resumeRender(interruptedWork);
  }
}
```

## 6. 副作用处理

### 6.1 副作用标记

```typescript
// Flags(副作用标记)
const enum Flags {
  NoFlags = 0b000000000000000000000,
  PerformedWork = 0b000000000000000000001,
  Placement = 0b000000000000000000010,
  Update = 0b000000000000000000100,
  Deletion = 0b000000000000000001000,
  ChildDeletion = 0b000000000000000010000,
  ContentReset = 0b000000000000000100000,
  Callback = 0b000000000000001000000,
  DidCapture = 0b000000000000010000000,
  ForceClientRender = 0b000000000000100000000,
  Ref = 0b000000000001000000000,
  Snapshot = 0b000000000010000000000,
  Passive = 0b000000000100000000000,
  Hydrating = 0b000000001000000000000,
  Visibility = 0b000000010000000000000,
  StoreConsistency = 0b000000100000000000000,
  
  // 生命周期标记
  LifecycleEffectMask = Passive | Update | Callback | Ref | Snapshot,
  
  // Host相关标记
  HostEffectMask = Update | Callback | Ref | Snapshot | ContentReset,
  
  // 需要在commit阶段处理的标记
  BeforeMutationMask = Update | Snapshot,
  MutationMask = Placement | Update | ChildDeletion | ContentReset | Ref | Hydrating | Visibility,
  LayoutMask = Update | Callback | Ref
}

// 标记副作用
function markUpdate(workInProgress: Fiber) {
  workInProgress.flags |= Update;
}

function markRef(workInProgress: Fiber) {
  workInProgress.flags |= Ref;
}

// 收集副作用
function bubbleProperties(completedWork: Fiber) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  
  while (child !== null) {
    // 收集子节点的flags
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    
    child = child.sibling;
  }
  
  completedWork.subtreeFlags = subtreeFlags;
}
```

### 6.2 副作用链表

```typescript
// 构建副作用链表(React 16)
function completeUnitOfWork(unitOfWork: Fiber) {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 构建effect list
    if (returnFiber !== null) {
      // 将子节点的effectList追加到父节点
      if (returnFiber.firstEffect === null) {
        returnFiber.firstEffect = completedWork.firstEffect;
      }
      
      if (completedWork.lastEffect !== null) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
        }
        returnFiber.lastEffect = completedWork.lastEffect;
      }
      
      // 如果当前节点有副作用,追加到链表
      if (completedWork.flags > PerformedWork) {
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = completedWork;
        } else {
          returnFiber.firstEffect = completedWork;
        }
        returnFiber.lastEffect = completedWork;
      }
    }
    
    // ... 其他逻辑
  } while (completedWork !== null);
}
```

## 7. 错误边界

### 7.1 错误捕获

```typescript
// 错误边界处理
function handleError(root: FiberRoot, thrownValue: any) {
  const erroredWork = workInProgress;
  
  try {
    // 寻找错误边界
    throwException(
      root,
      erroredWork,
      thrownValue,
      renderLanes
    );
    
    // 完成错误处理
    completeUnitOfWork(erroredWork);
  } catch (yetAnotherThrownValue) {
    // 错误边界自己出错
    handleError(root, yetAnotherThrownValue);
  }
}

function throwException(
  root: FiberRoot,
  returnFiber: Fiber,
  value: any,
  lanes: Lanes
) {
  // 标记为未完成
  value.flags &= ~Incomplete;
  value.flags |= ShouldCapture;
  
  // 寻找最近的错误边界
  let workInProgress = returnFiber;
  do {
    switch (workInProgress.tag) {
      case HostRoot:
        // 根节点是默认错误边界
        workInProgress.flags |= ShouldCapture;
        return;
      
      case ClassComponent:
        const ctor = workInProgress.type;
        const instance = workInProgress.stateNode;
        
        if (
          typeof ctor.getDerivedStateFromError === 'function' ||
          (instance !== null &&
            typeof instance.componentDidCatch === 'function')
        ) {
          // 找到错误边界
          workInProgress.flags |= ShouldCapture;
          
          // 创建错误更新
          const update = createUpdate(NoLane, lane);
          update.payload = { element: null };
          update.callback = () => {
            instance.componentDidCatch(value, errorInfo);
          };
          
          enqueueUpdate(workInProgress, update);
          return;
        }
        break;
    }
    
    workInProgress = workInProgress.return;
  } while (workInProgress !== null);
}
```

## 8. 面试高频问题

```typescript
const interviewQA = {
  Q1: {
    question: 'Fiber解决了什么问题?',
    answer: [
      '1. Stack Reconciler递归无法中断',
      '2. 长任务阻塞主线程',
      '3. 无法实现优先级调度',
      '4. 不能并发渲染'
    ]
  },
  
  Q2: {
    question: 'Fiber如何实现可中断渲染?',
    answer: `
      1. 链表结构: 可以随时暂停和恢复
      2. 时间切片: 每5ms检查是否需要让出控制权
      3. 双缓冲: workInProgress树不影响current树
      4. 增量渲染: 将工作分割成小单元
    `
  },
  
  Q3: {
    question: 'Fiber树的遍历过程?',
    answer: [
      '1. beginWork: 向下遍历,创建子Fiber',
      '2. completeWork: 向上归并,完成节点',
      '3. 优先child,其次sibling,最后return',
      '4. 深度优先遍历'
    ]
  },
  
  Q4: {
    question: 'Fiber双缓冲机制?',
    answer: `
      current树: 当前显示的
      workInProgress树: 正在构建的
      
      通过alternate指针相互引用:
      - 更新时基于current创建workInProgress
      - 完成后workInProgress成为新current
      - 旧current成为新workInProgress
    `
  },
  
  Q5: {
    question: 'Lane模型如何工作?',
    answer: [
      '1. 用二进制位表示优先级',
      '2. 可以表示多个优先级的组合',
      '3. 位运算快速判断和操作',
      '4. 解决优先级合并和比较问题'
    ]
  },
  
  Q6: {
    question: 'Render和Commit阶段的区别?',
    answer: `
      Render阶段:
      - 可中断
      - 不产生副作用
      - 在内存中构建Fiber树
      
      Commit阶段:
      - 不可中断
      - 产生副作用
      - 更新真实DOM
      - 同步执行
    `
  }
};
```

## 9. 总结

Fiber架构的核心要点:

1. **数据结构**: 链表结构支持可中断
2. **双缓冲**: current和workInProgress交替
3. **两个阶段**: Render(可中断)和Commit(同步)
4. **优先级**: Lane模型精确调度
5. **时间切片**: 5ms检查避免阻塞
6. **副作用**: Flags标记和收集
7. **错误处理**: 错误边界机制

Fiber是React性能优化的基石。

