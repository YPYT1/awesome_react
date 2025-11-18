# Fiber架构原理

## 第一部分：Fiber架构概述

### 1.1 什么是Fiber

Fiber是React 16引入的全新协调（Reconciliation）引擎架构，是React核心算法的完全重写。Fiber使React能够将渲染工作分割成多个小块，并在多个帧之间分配渲染工作，从而实现可中断的渲染过程。

**核心特点：**
- 可中断的渲染
- 优先级调度
- 增量渲染
- 并发模式支持
- 更好的错误处理

### 1.2 为什么需要Fiber

在React 15及之前的版本中，协调算法采用递归的方式，一旦开始就无法中断。这在处理大型组件树时会导致严重的性能问题。

**React 15的问题：**

```javascript
// React 15的递归渲染
function reconcile(element) {
  // 创建或更新DOM
  updateDOM(element);
  
  // 递归处理子元素
  element.children.forEach(child => {
    reconcile(child);  // 无法中断
  });
}

// 问题示例：
function HeavyComponent() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    value: Math.random()
  }));
  
  // React 15中，这会阻塞主线程
  return (
    <div>
      {items.map(item => (
        <ExpensiveItem key={item.id} data={item} />
      ))}
    </div>
  );
}
```

**React 15存在的问题：**
1. 长时间占用主线程，导致页面卡顿
2. 用户输入响应延迟
3. 动画掉帧
4. 无法按优先级处理更新
5. 无法实现异步渲染

### 1.3 Fiber的设计目标

Fiber架构的核心目标是实现增量渲染，将渲染工作分解成块，并在多个帧之间分配。

**主要目标：**

1. **暂停工作，稍后再回来**
```javascript
// 伪代码展示Fiber的工作方式
function workLoop(deadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  if (nextUnitOfWork) {
    // 还有工作要做，下一帧继续
    requestIdleCallback(workLoop);
  }
}
```

2. **为不同类型的工作分配优先级**
```javascript
// 优先级示例
const priorities = {
  Immediate: 1,      // 立即执行（如用户输入）
  UserBlocking: 2,   // 用户交互
  Normal: 3,         // 普通更新
  Low: 4,            // 低优先级
  Idle: 5            // 空闲时执行
};
```

3. **复用之前完成的工作**
```javascript
// Fiber可以复用之前的工作结果
function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  
  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    
    if (oldFiber && oldFiber.type === element.type) {
      // 复用现有Fiber
      newFiber = {
        ...oldFiber,
        props: element.props,
        alternate: oldFiber
      };
    } else {
      // 创建新Fiber
      newFiber = createFiber(element);
    }
    
    oldFiber = oldFiber?.sibling;
  }
}
```

4. **如果不再需要，可以中止工作**
```javascript
// 高优先级任务可以打断低优先级任务
function commitRoot() {
  if (hasHigherPriorityWork()) {
    // 放弃当前工作，处理高优先级任务
    currentWork = null;
    scheduleHighPriorityWork();
  } else {
    // 提交当前工作结果
    commitAllWork(workInProgress);
  }
}
```

### 1.4 Fiber与传统React的对比

**React 15 - 栈协调器（Stack Reconciler）：**

```javascript
// React 15的工作方式
class StackReconciler {
  reconcile(element) {
    // 同步递归，无法中断
    this.updateComponent(element);
    element.children.forEach(child => {
      this.reconcile(child);
    });
  }
  
  // 问题：一旦开始就必须完成
  render() {
    this.reconcile(this.rootElement);  // 阻塞
    this.commitChanges();              // 阻塞
  }
}
```

**React 16+ - Fiber协调器：**

```javascript
// Fiber的工作方式
class FiberReconciler {
  workLoop(deadline) {
    while (this.nextUnitOfWork && deadline.timeRemaining() > 0) {
      // 每次只处理一个工作单元
      this.nextUnitOfWork = this.performUnitOfWork(
        this.nextUnitOfWork
      );
    }
    
    if (this.nextUnitOfWork) {
      // 下一帧继续
      requestIdleCallback(this.workLoop);
    } else if (this.pendingCommit) {
      // 提交更改
      this.commitAllWork(this.pendingCommit);
    }
  }
  
  performUnitOfWork(fiber) {
    // 1. 处理当前Fiber
    this.beginWork(fiber);
    
    // 2. 返回下一个工作单元
    if (fiber.child) {
      return fiber.child;
    }
    
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
    
    return null;
  }
}
```

## 第二部分：Fiber数据结构

### 2.1 Fiber节点结构

每个React元素都对应一个Fiber节点，Fiber节点是一个JavaScript对象，包含了组件的类型、props、state等信息。

**Fiber节点的核心字段：**

```javascript
// Fiber节点的完整结构
interface Fiber {
  // 节点类型信息
  tag: WorkTag;              // Fiber类型（函数组件、类组件等）
  key: null | string;        // React key
  elementType: any;          // 元素类型
  type: any;                 // 组件类型或DOM标签
  stateNode: any;            // 关联的DOM节点或组件实例
  
  // Fiber树结构
  return: Fiber | null;      // 父Fiber
  child: Fiber | null;       // 第一个子Fiber
  sibling: Fiber | null;     // 下一个兄弟Fiber
  index: number;             // 在兄弟中的索引
  
  // 工作相关
  pendingProps: any;         // 新的props
  memoizedProps: any;        // 上次渲染的props
  updateQueue: UpdateQueue;  // 更新队列
  memoizedState: any;        // 上次渲染的state
  
  // Effect相关
  flags: Flags;              // 副作用标记
  subtreeFlags: Flags;       // 子树副作用标记
  deletions: Array<Fiber>;   // 要删除的子Fiber
  
  // 优先级调度
  lanes: Lanes;              // 当前Fiber的优先级
  childLanes: Lanes;         // 子树的优先级
  
  // 双缓冲
  alternate: Fiber | null;   // 对应的另一棵树的Fiber
}
```

**示例代码展示Fiber结构：**

```javascript
// 示例组件
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app">
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// 对应的Fiber树结构
const appFiber = {
  type: App,
  tag: FunctionComponent,
  stateNode: null,
  
  // Hook状态
  memoizedState: {
    memoizedState: 0,        // count的值
    next: null               // 下一个Hook
  },
  
  // 子节点
  child: {
    type: 'div',
    tag: HostComponent,
    stateNode: divDOMNode,
    
    props: {
      className: 'app',
      children: [...]
    },
    
    child: {
      type: 'h1',
      tag: HostComponent,
      stateNode: h1DOMNode,
      
      sibling: {
        type: 'button',
        tag: HostComponent,
        stateNode: buttonDOMNode
      }
    }
  }
};
```

### 2.2 Fiber标签类型（WorkTag）

Fiber节点根据组件类型有不同的tag：

```javascript
// Fiber标签类型
const WorkTag = {
  FunctionComponent: 0,        // 函数组件
  ClassComponent: 1,           // 类组件
  IndeterminateComponent: 2,   // 未确定的组件类型
  HostRoot: 3,                 // 根节点
  HostPortal: 4,               // Portal
  HostComponent: 5,            // DOM原生组件（div、span等）
  HostText: 6,                 // 文本节点
  Fragment: 7,                 // Fragment
  Mode: 8,                     // Mode组件（StrictMode等）
  ContextConsumer: 9,          // Context消费者
  ContextProvider: 10,         // Context提供者
  ForwardRef: 11,              // ForwardRef
  Profiler: 12,                // Profiler
  SuspenseComponent: 13,       // Suspense
  MemoComponent: 14,           // Memo
  SimpleMemoComponent: 15,     // Simple Memo
  LazyComponent: 16,           // Lazy
  IncompleteClassComponent: 17,
  DehydratedFragment: 18,
  SuspenseListComponent: 19,
  ScopeComponent: 21,
  OffscreenComponent: 22,
  LegacyHiddenComponent: 23,
  CacheComponent: 24,
  TracingMarkerComponent: 25
};

// 使用示例
function createFiberFromElement(element) {
  let fiberTag;
  const { type } = element;
  
  if (typeof type === 'function') {
    // 函数或类组件
    fiberTag = type.prototype?.isReactComponent
      ? WorkTag.ClassComponent
      : WorkTag.FunctionComponent;
  } else if (typeof type === 'string') {
    // DOM元素
    fiberTag = WorkTag.HostComponent;
  } else if (type === REACT_FRAGMENT_TYPE) {
    fiberTag = WorkTag.Fragment;
  } else if (type === REACT_SUSPENSE_TYPE) {
    fiberTag = WorkTag.SuspenseComponent;
  }
  // ... 其他类型
  
  return createFiber(fiberTag, element.props, element.key);
}
```

### 2.3 副作用标记（Flags）

Fiber使用flags字段标记需要执行的副作用：

```javascript
// 副作用标记（Flags）
const Flags = {
  NoFlags: 0,                    // 无副作用
  PerformedWork: 1,              // 已执行工作
  Placement: 2,                  // 插入DOM
  Update: 4,                     // 更新
  Deletion: 8,                   // 删除
  ChildDeletion: 16,             // 删除子节点
  ContentReset: 32,              // 重置内容
  Callback: 64,                  // 回调
  DidCapture: 128,               // 捕获错误
  ForceClientRender: 256,        // 强制客户端渲染
  Ref: 512,                      // Ref更新
  Snapshot: 1024,                // Snapshot
  Passive: 2048,                 // Passive effect（useEffect）
  Hydrating: 4096,               // Hydrating
  Visibility: 8192,              // 可见性变化
  StoreConsistency: 16384,       // Store一致性
  
  // 生命周期相关
  LifecycleEffectMask: 2116,     // 生命周期effect mask
  HostEffectMask: 32767,         // Host effect mask
  
  // Suspense相关
  Incomplete: 32768,
  ShouldCapture: 65536,
  
  // 其他
  ForceUpdateForLegacySuspense: 131072,
  DidPropagateContext: 262144,
  NeedsPropagation: 524288,
  Forked: 1048576
};

// 使用示例
function markUpdate(fiber) {
  fiber.flags |= Flags.Update;
}

function markPlacement(fiber) {
  fiber.flags |= Flags.Placement;
}

function markDeletion(parentFiber, childFiber) {
  parentFiber.flags |= Flags.ChildDeletion;
  parentFiber.deletions = parentFiber.deletions || [];
  parentFiber.deletions.push(childFiber);
}

// 检查标记
function hasEffect(fiber, flag) {
  return (fiber.flags & flag) !== Flags.NoFlags;
}

// 完整示例
function completeWork(fiber) {
  switch (fiber.tag) {
    case HostComponent: {
      if (fiber.stateNode == null) {
        // 创建DOM节点
        const instance = createInstance(fiber.type, fiber.props);
        fiber.stateNode = instance;
        markPlacement(fiber);  // 标记为插入
      } else {
        // 更新DOM节点
        const instance = fiber.stateNode;
        prepareUpdate(instance, fiber.type, fiber.memoizedProps, fiber.pendingProps);
        markUpdate(fiber);  // 标记为更新
      }
      break;
    }
    // ... 其他case
  }
}
```

### 2.4 优先级通道（Lanes）

Lanes是Fiber中用于表示优先级的位掩码系统：

```javascript
// Lanes优先级系统
const Lanes = {
  NoLanes: 0,
  NoLane: 0,
  
  // 同步优先级
  SyncLane: 1,                          // 同步（最高优先级）
  
  // 连续事件优先级
  InputContinuousHydrationLane: 2,
  InputContinuousLane: 4,
  
  // 默认优先级
  DefaultHydrationLane: 8,
  DefaultLane: 16,
  
  // Transition优先级
  TransitionHydrationLane: 32,
  TransitionLane1: 64,
  TransitionLane2: 128,
  TransitionLane3: 256,
  // ... 更多Transition lanes
  
  // Retry优先级
  RetryLane1: 134217728,
  RetryLane2: 268435456,
  RetryLane3: 536870912,
  RetryLane4: 1073741824,
  
  // 其他
  SomeRetryLane: 2013265920,
  SelectiveHydrationLane: 2147483648,
  
  // 空闲优先级
  IdleHydrationLane: 1073741824,
  IdleLane: 2147483648,
  
  // Offscreen
  OffscreenLane: 4294967296
};

// Lane操作工具函数
function mergeLanes(a, b) {
  return a | b;
}

function removeLanes(set, subset) {
  return set & ~subset;
}

function includesSomeLane(a, b) {
  return (a & b) !== NoLanes;
}

function isSubsetOfLanes(set, subset) {
  return (set & subset) === subset;
}

// 获取最高优先级Lane
function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}

// 示例：计算更新优先级
function requestUpdateLane(fiber) {
  const mode = fiber.mode;
  
  if ((mode & ConcurrentMode) === NoMode) {
    return SyncLane;  // 非并发模式，同步更新
  }
  
  // 检查是否在Transition中
  if (currentTransition !== null) {
    return claimNextTransitionLane();
  }
  
  // 检查事件优先级
  const updateLane = getCurrentUpdateLane();
  if (updateLane !== NoLane) {
    return updateLane;
  }
  
  // 默认优先级
  return DefaultLane;
}

// 完整示例：处理不同优先级的更新
function scheduleUpdateOnFiber(fiber, lane) {
  // 1. 标记Fiber的lanes
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  
  // 2. 向上标记父Fiber的childLanes
  let node = fiber.return;
  while (node !== null) {
    node.childLanes = mergeLanes(node.childLanes, lane);
    node = node.return;
  }
  
  // 3. 调度更新
  if (lane === SyncLane) {
    // 同步更新
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, fiber));
  } else {
    // 异步更新
    scheduleCallback(
      lanePriorityToSchedulerPriority(lane),
      performConcurrentWorkOnRoot.bind(null, fiber)
    );
  }
}
```

## 第三部分：Fiber工作原理

### 3.1 双缓冲技术

Fiber使用双缓冲技术在内存中构建新的Fiber树，完成后再替换当前树。

```javascript
// 双缓冲Fiber树
let currentRoot = null;        // 当前显示的Fiber树
let workInProgressRoot = null; // 正在构建的Fiber树

// 创建WorkInProgress树
function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 首次渲染，创建新的Fiber
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    
    // 建立双向连接
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用现有Fiber
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    
    // 重置副作用
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  
  // 复制其他字段
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  
  return workInProgress;
}

// 完整的双缓冲流程
function performConcurrentWorkOnRoot(root) {
  // 1. 创建WorkInProgress树
  workInProgressRoot = createWorkInProgress(root.current, null);
  
  // 2. 开始渲染阶段
  renderRootConcurrent(root, lanes);
  
  // 3. 完成渲染，准备提交
  const finishedWork = workInProgressRoot;
  
  // 4. 提交阶段
  commitRoot(finishedWork);
  
  // 5. 切换current指针
  root.current = finishedWork;
  currentRoot = finishedWork;
  workInProgressRoot = null;
}
```

**双缓冲可视化：**

```javascript
// 初始状态
// current树（屏幕显示）
const currentTree = {
  type: 'div',
  props: { className: 'old' },
  stateNode: domNode,
  alternate: null
};

// 第一次更新
// 1. 创建workInProgress树
const workInProgressTree = {
  type: 'div',
  props: { className: 'new' },  // 新props
  stateNode: domNode,            // 复用DOM
  alternate: currentTree         // 指向current
};
currentTree.alternate = workInProgressTree;

// 2. 在workInProgress上工作（可中断）
performUnitOfWork(workInProgressTree);

// 3. 提交完成，切换指针
root.current = workInProgressTree;

// 第二次更新
// workInProgress和current角色互换
const newWorkInProgress = currentTree;  // 复用之前的current
newWorkInProgress.props = { className: 'newer' };
```

### 3.2 Fiber工作循环

Fiber的工作循环分为两个主要阶段：render阶段和commit阶段。

**Render阶段（可中断）：**

```javascript
// Render阶段工作循环
function workLoopConcurrent() {
  // 当有工作单元且未超时时继续
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function workLoopSync() {
  // 同步模式：一次性完成
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// 执行工作单元
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  
  // 1. 开始工作（beginWork）
  let next = beginWork(current, unitOfWork, renderLanes);
  
  // 2. 更新memoizedProps
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 3. 没有子节点，完成当前工作
    completeUnitOfWork(unitOfWork);
  } else {
    // 4. 有子节点，继续处理
    workInProgress = next;
  }
}

// beginWork - 处理Fiber节点
function beginWork(current, workInProgress, renderLanes) {
  // 根据tag类型处理
  switch (workInProgress.tag) {
    case FunctionComponent: {
      return updateFunctionComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    }
    case ClassComponent: {
      return updateClassComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    }
    case HostComponent: {
      return updateHostComponent(
        current,
        workInProgress,
        renderLanes
      );
    }
    // ... 其他类型
  }
}

// completeWork - 完成Fiber节点
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 完成当前Fiber
    completeWork(current, completedWork, renderLanes);
    
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // 有兄弟节点，处理兄弟
      workInProgress = siblingFiber;
      return;
    }
    
    // 回到父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}
```

**Commit阶段（不可中断）：**

```javascript
// Commit阶段 - 同步执行，不可中断
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  
  // 阶段1：before mutation
  commitBeforeMutationEffects(finishedWork);
  
  // 阶段2：mutation（DOM操作）
  commitMutationEffects(finishedWork, root);
  
  // 切换current树
  root.current = finishedWork;
  
  // 阶段3：layout
  commitLayoutEffects(finishedWork, lanes);
  
  // 请求绘制
  requestPaint();
}

// Before Mutation阶段
function commitBeforeMutationEffects(finishedWork) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    
    // 处理Snapshot effect（getSnapshotBeforeUpdate）
    if ((fiber.flags & Snapshot) !== NoFlags) {
      commitBeforeMutationEffectOnFiber(fiber);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

// Mutation阶段
function commitMutationEffects(finishedWork, root) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const flags = fiber.flags;
    
    // 重置文本内容
    if (flags & ContentReset) {
      commitResetTextContent(fiber);
    }
    
    // 处理Ref
    if (flags & Ref) {
      const current = fiber.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
    
    // 主要DOM操作
    const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
    
    switch (primaryFlags) {
      case Placement: {
        commitPlacement(fiber);
        fiber.flags &= ~Placement;
        break;
      }
      case Update: {
        const current = fiber.alternate;
        commitWork(current, fiber);
        break;
      }
      case Deletion: {
        commitDeletion(root, fiber);
        break;
      }
      // ...
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

// Layout阶段
function commitLayoutEffects(finishedWork, lanes) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const flags = fiber.flags;
    
    // 处理Layout effect
    if (flags & (Update | Callback)) {
      commitLayoutEffectOnFiber(fiber, lanes);
    }
    
    // 绑定Ref
    if (flags & Ref) {
      commitAttachRef(fiber);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}
```

### 3.3 Fiber遍历算法

Fiber树采用深度优先遍历：

```javascript
// Fiber树遍历
function traverseFiber(fiber) {
  // 1. 处理当前节点
  console.log('处理:', fiber.type);
  
  // 2. 遍历子节点（深度优先）
  if (fiber.child) {
    traverseFiber(fiber.child);
  }
  
  // 3. 遍历兄弟节点
  if (fiber.sibling) {
    traverseFiber(fiber.sibling);
  }
}

// 示例：组件树
function App() {
  return (
    <div>
      <Header />
      <Main>
        <Article />
        <Sidebar />
      </Main>
      <Footer />
    </div>
  );
}

// Fiber树结构和遍历顺序
const fiberTree = {
  type: App,
  child: {
    type: 'div',
    child: {
      type: Header,        // 1
      sibling: {
        type: Main,        // 2
        child: {
          type: Article,   // 3
          sibling: {
            type: Sidebar  // 4
          }
        },
        sibling: {
          type: Footer     // 5
        }
      }
    }
  }
};

// 遍历顺序：App -> div -> Header -> Main -> Article -> Sidebar -> Footer
```

**迭代式遍历（Fiber的实际实现）：**

```javascript
// 非递归的Fiber遍历
function iterativeFiberTraversal(root) {
  let node = root;
  
  while (true) {
    // 处理当前节点
    performWork(node);
    
    // 如果有子节点，进入子节点
    if (node.child) {
      node = node.child;
      continue;
    }
    
    // 没有子节点，完成当前节点
    if (node === root) {
      return;  // 遍历完成
    }
    
    // 找下一个兄弟节点或返回父节点
    while (!node.sibling) {
      if (!node.return || node.return === root) {
        return;  // 遍历完成
      }
      node = node.return;
    }
    
    node = node.sibling;
  }
}

// 可中断的工作循环
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  
  if (nextUnitOfWork) {
    // 还有工作，下一帧继续
    requestIdleCallback(workLoop);
  }
}
```

### 3.4 更新队列（Update Queue）

Fiber使用更新队列管理状态更新：

```javascript
// 更新对象结构
interface Update<State> {
  lane: Lane;                    // 优先级
  tag: UpdateTag;                // 更新类型
  payload: any;                  // 更新内容
  callback: (() => mixed) | null; // 回调函数
  next: Update<State> | null;    // 下一个更新
}

// 更新队列结构
interface UpdateQueue<State> {
  baseState: State;              // 基础state
  firstBaseUpdate: Update<State> | null;  // 第一个基础更新
  lastBaseUpdate: Update<State> | null;   // 最后一个基础更新
  shared: {
    pending: Update<State> | null;  // 待处理的更新（环形链表）
  };
  effects: Array<Update<State>> | null;  // 有回调的更新
}

// 创建更新
function createUpdate(lane) {
  return {
    lane,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null
  };
}

// 入队更新
function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    return;
  }
  
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  
  if (pending === null) {
    // 第一个更新，创建环形链表
    update.next = update;
  } else {
    // 插入到环形链表中
    update.next = pending.next;
    pending.next = update;
  }
  
  sharedQueue.pending = update;
}

// 处理更新队列
function processUpdateQueue(workInProgress, props, instance, renderLanes) {
  const queue = workInProgress.updateQueue;
  
  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;
  
  // 检查是否有待处理的更新
  let pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    
    // 将pending队列接入base队列
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate;
    } else {
      lastBaseUpdate.next = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate;
  }
  
  // 处理更新
  if (firstBaseUpdate !== null) {
    let newState = queue.baseState;
    let newBaseState = null;
    let newFirstBaseUpdate = null;
    let newLastBaseUpdate = null;
    
    let update = firstBaseUpdate;
    do {
      const updateLane = update.lane;
      
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // 优先级不够，跳过此更新
        const clone = {
          lane: updateLane,
          tag: update.tag,
          payload: update.payload,
          callback: update.callback,
          next: null
        };
        
        if (newLastBaseUpdate === null) {
          newFirstBaseUpdate = newLastBaseUpdate = clone;
          newBaseState = newState;
        } else {
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
      } else {
        // 处理更新
        if (newLastBaseUpdate !== null) {
          const clone = {
            lane: NoLane,
            tag: update.tag,
            payload: update.payload,
            callback: update.callback,
            next: null
          };
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
        
        // 计算新state
        newState = getStateFromUpdate(
          workInProgress,
          queue,
          update,
          newState,
          props,
          instance
        );
        
        // 处理callback
        const callback = update.callback;
        if (callback !== null) {
          workInProgress.flags |= Callback;
          const effects = queue.effects;
          if (effects === null) {
            queue.effects = [update];
          } else {
            effects.push(update);
          }
        }
      }
      
      update = update.next;
      if (update === null) {
        break;
      }
    } while (true);
    
    // 更新队列
    if (newLastBaseUpdate === null) {
      newBaseState = newState;
    }
    
    queue.baseState = newBaseState;
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
    
    workInProgress.memoizedState = newState;
  }
}
```

## 第四部分：Fiber与Hooks

### 4.1 Hook在Fiber中的存储

Hook信息存储在Fiber的memoizedState中，形成链表结构：

```javascript
// Hook结构
interface Hook {
  memoizedState: any;       // Hook的state
  baseState: any;           // 基础state
  baseQueue: Update | null; // 基础更新队列
  queue: UpdateQueue | null; // 更新队列
  next: Hook | null;        // 下一个Hook
}

// Fiber存储Hook链表
const fiber = {
  memoizedState: {          // 第一个Hook（useState）
    memoizedState: 0,       // count值
    baseState: 0,
    queue: {...},
    next: {                 // 第二个Hook（useEffect）
      memoizedState: {
        create: () => {...},
        destroy: undefined,
        deps: [count],
        next: null,
        tag: HookHasEffect
      },
      next: null            // 最后一个Hook
    }
  }
};

// 示例组件
function Counter() {
  const [count, setCount] = useState(0);        // Hook 1
  const [name, setName] = useState('React');    // Hook 2
  
  useEffect(() => {                             // Hook 3
    document.title = `${name}: ${count}`;
  }, [name, count]);
  
  const increment = useCallback(() => {         // Hook 4
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <h1>{name}: {count}</h1>
      <button onClick={increment}>+1</button>
    </div>
  );
}

// 对应的Hook链表
const hookChain = {
  // Hook 1: useState(0)
  memoizedState: 0,
  queue: {
    pending: null,
    dispatch: setCount
  },
  next: {
    // Hook 2: useState('React')
    memoizedState: 'React',
    queue: {
      pending: null,
      dispatch: setName
    },
    next: {
      // Hook 3: useEffect
      memoizedState: {
        tag: HookHasEffect | HookPassive,
        create: () => { document.title = `${name}: ${count}`; },
        destroy: undefined,
        deps: ['React', 0],
        next: null
      },
      queue: null,
      next: {
        // Hook 4: useCallback
        memoizedState: increment,
        queue: null,
        next: null
      }
    }
  }
};
```

### 4.2 Hook的执行时机

```javascript
// 渲染函数组件
function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  secondArg,
  nextRenderLanes
) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  
  // 重置Hook状态
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  
  // 设置Hook dispatcher
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount      // 首次渲染
      : HooksDispatcherOnUpdate;    // 更新渲染
  
  // 调用组件函数
  let children = Component(props, secondArg);
  
  // 重置dispatcher
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  
  renderLanes = NoLanes;
  currentlyRenderingFiber = null;
  
  return children;
}

// useState的实现
function useState(initialState) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

// Mount时的useState
function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  hook.memoizedState = hook.baseState = initialState;
  
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  hook.queue = queue;
  
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));
  
  return [hook.memoizedState, dispatch];
}

// Update时的useState
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}

// 创建Hook
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  
  if (workInProgressHook === null) {
    // 第一个Hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 后续Hook
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return workInProgressHook;
}

// 更新Hook
function updateWorkInProgressHook() {
  let nextCurrentHook;
  
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    nextCurrentHook = current?.memoizedState;
  } else {
    nextCurrentHook = currentHook.next;
  }
  
  let nextWorkInProgressHook;
  
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }
  
  if (nextWorkInProgressHook !== null) {
    // 复用现有Hook
    workInProgressHook = nextWorkInProgressHook;
    currentHook = nextCurrentHook;
  } else {
    // 克隆current Hook
    const newHook = {
      memoizedState: nextCurrentHook.memoizedState,
      baseState: nextCurrentHook.baseState,
      baseQueue: nextCurrentHook.baseQueue,
      queue: nextCurrentHook.queue,
      next: null
    };
    
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
    
    currentHook = nextCurrentHook;
  }
  
  return workInProgressHook;
}
```

### 4.3 Effect的执行机制

```javascript
// Effect Hook结构
interface Effect {
  tag: HookFlags;           // Effect类型
  create: () => (() => void) | void;  // effect函数
  destroy: (() => void) | void;       // 清理函数
  deps: Array<mixed> | null;          // 依赖数组
  next: Effect;             // 下一个Effect（环形链表）
}

// Fiber的updateQueue存储Effect链表
const fiber = {
  updateQueue: {
    lastEffect: effect3,  // 指向最后一个Effect
    
    // Effect环形链表
    // effect1 -> effect2 -> effect3 -> effect1
  }
};

// useEffect实现
function mountEffect(create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  currentlyRenderingFiber.flags |= PassiveEffect;
  
  hook.memoizedState = pushEffect(
    HookHasEffect | HookPassive,
    create,
    undefined,
    nextDeps
  );
}

function updateEffect(create, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变化，不执行effect
        hook.memoizedState = pushEffect(
          HookPassive,
          create,
          destroy,
          nextDeps
        );
        return;
      }
    }
  }
  
  currentlyRenderingFiber.flags |= PassiveEffect;
  
  hook.memoizedState = pushEffect(
    HookHasEffect | HookPassive,
    create,
    destroy,
    nextDeps
  );
}

// 添加Effect到Fiber
function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null
  };
  
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
  
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  
  return effect;
}

// Commit阶段执行Effect
function commitPassiveEffects(finishedWork) {
  // 1. 执行清理函数
  commitPassiveUnmountEffects(finishedWork);
  
  // 2. 执行effect函数
  commitPassiveMountEffects(finishedWork);
}

function commitPassiveMountEffects(finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & HookPassive) !== NoFlags && 
          (effect.tag & HookHasEffect) !== NoFlags) {
        // 执行effect
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

## 第五部分：Fiber调度机制

### 5.1 时间切片（Time Slicing）

Fiber通过时间切片实现可中断的渲染：

```javascript
// 检查是否应该让出控制权
function shouldYield() {
  const currentTime = getCurrentTime();
  
  if (currentTime >= deadline) {
    // 当前帧时间用完
    if (needsPaint || scheduling.isInputPending()) {
      // 需要绘制或有用户输入
      return true;
    }
    
    // 还有时间可以继续工作
    return currentTime >= maxYieldInterval;
  }
  
  return false;
}

// 工作循环 - 并发模式
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// 完整的调度流程
function performConcurrentWorkOnRoot(root) {
  const originalCallbackNode = root.callbackNode;
  
  // 1. 刷新同步工作
  flushPassiveEffects();
  
  // 2. 获取待处理的lanes
  const lanes = getNextLanes(root, NoLanes);
  if (lanes === NoLanes) {
    return null;
  }
  
  // 3. 设置渲染优先级
  const prevDispatcher = pushDispatcher();
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  
  // 4. 准备fresh stack
  prepareFreshStack(root, lanes);
  
  // 5. 开始渲染循环
  do {
    try {
      workLoopConcurrent();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
  
  // 6. 恢复上下文
  popDispatcher(prevDispatcher);
  executionContext = prevExecutionContext;
  
  // 7. 检查是否完成
  if (workInProgress !== null) {
    // 还有工作未完成
    return performConcurrentWorkOnRoot.bind(null, root);
  } else {
    // 工作完成，准备提交
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    
    finishConcurrentRender(root, exitStatus, lanes);
  }
  
  return null;
}
```

### 5.2 优先级调度

```javascript
// Scheduler优先级
const ImmediatePriority = 1;
const UserBlockingPriority = 2;
const NormalPriority = 3;
const LowPriority = 4;
const IdlePriority = 5;

// Lane优先级转Scheduler优先级
function lanePriorityToSchedulerPriority(lanePriority) {
  switch (lanePriority) {
    case SyncLane:
    case SyncBatchedLane:
      return ImmediatePriority;
    case InputContinuousLane:
      return UserBlockingPriority;
    case DefaultLane:
      return NormalPriority;
    case IdleLane:
      return IdlePriority;
    default:
      return NormalPriority;
  }
}

// 调度更新
function ensureRootIsScheduled(root, currentTime) {
  const existingCallbackNode = root.callbackNode;
  
  // 1. 标记过期的lanes
  markStarvedLanesAsExpired(root, currentTime);
  
  // 2. 获取下一个要处理的lane
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );
  
  if (nextLanes === NoLanes) {
    // 没有工作要做
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode);
    }
    root.callbackNode = null;
    root.callbackPriority = NoLane;
    return;
  }
  
  // 3. 获取最高优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  const existingCallbackPriority = root.callbackPriority;
  
  // 4. 检查是否需要新调度
  if (existingCallbackPriority === newCallbackPriority) {
    // 优先级相同，继续当前调度
    return;
  }
  
  // 5. 取消现有调度
  if (existingCallbackNode !== null) {
    cancelCallback(existingCallbackNode);
  }
  
  // 6. 调度新任务
  let newCallbackNode;
  
  if (newCallbackPriority === SyncLane) {
    // 同步优先级
    scheduleSyncCallback(
      performSyncWorkOnRoot.bind(null, root)
    );
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

// 完整示例：处理多个不同优先级的更新
function handleMultiplePriorityUpdates() {
  const root = createRoot(container);
  
  // 低优先级更新
  startTransition(() => {
    setHeavyData(computeHeavyData());  // Transition Lane
  });
  
  // 中优先级更新
  setTimeout(() => {
    setNormalData(data);  // Default Lane
  }, 100);
  
  // 高优先级更新
  onClick={() => {
    setCount(count + 1);  // Sync Lane
  });
  
  // Fiber会按优先级处理：
  // 1. Sync Lane (onClick) - 立即处理
  // 2. Default Lane (setTimeout) - 正常处理
  // 3. Transition Lane (startTransition) - 可被打断
}
```

### 5.3 饥饿问题处理

```javascript
// 标记过期的lanes，防止低优先级任务饥饿
function markStarvedLanesAsExpired(root, currentTime) {
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
      // 设置过期时间
      if ((lane & suspendedLanes) === NoLanes || 
          (lane & pingedLanes) !== NoLanes) {
        expirationTimes[index] = computeExpirationTime(lane, currentTime);
      }
    } else if (expirationTime <= currentTime) {
      // 已过期，升级为过期lane
      root.expiredLanes |= lane;
    }
    
    lanes &= ~lane;
  }
}

// 计算过期时间
function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case SyncLane:
    case InputContinuousLane:
      // 高优先级：250ms后过期
      return currentTime + 250;
    case DefaultLane:
      // 默认优先级：5s后过期
      return currentTime + 5000;
    case IdleLane:
      // 空闲优先级：永不过期
      return NoTimestamp;
    default:
      // Transition：5s后过期
      return currentTime + 5000;
  }
}
```

## 第六部分：Fiber性能优化

### 6.1 Bailout优化

Fiber会跳过不需要更新的组件：

```javascript
// Bailout检查
function bailoutOnAlreadyFinishedWork(
  current,
  workInProgress,
  renderLanes
) {
  // 检查children是否需要更新
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    // children也不需要更新，直接返回null
    return null;
  }
  
  // children需要更新，克隆children
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}

// 检查是否可以bailout
function checkScheduledUpdateOrContext(
  current,
  renderLanes
) {
  const updateLanes = workInProgress.lanes;
  
  if (includesSomeLane(updateLanes, renderLanes)) {
    return false;  // 有更新，不能bailout
  }
  
  // 检查context
  if (current !== null) {
    const context = current.dependencies;
    if (context !== null && checkIfContextChanged(context)) {
      return false;  // context变化，不能bailout
    }
  }
  
  return true;  // 可以bailout
}

// 示例：React.memo + bailout
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  console.log('Rendering ExpensiveComponent');
  
  return (
    <div>
      {data.map(item => (
        <Item key={item.id} value={item.value} />
      ))}
    </div>
  );
});

function App() {
  const [count, setCount] = useState(0);
  const [data] = useState(expensiveData);  // 不变的数据
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {/* 
        data没变化，ExpensiveComponent会bailout
        不会重新渲染
      */}
      <ExpensiveComponent data={data} />
    </div>
  );
}
```

### 6.2 优先级复用

```javascript
// 复用之前计算的结果
function reuseFiber(fiber, pendingProps) {
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}

// 示例：列表diff复用
function reconcileChildrenArray(
  returnFiber,
  currentFirstChild,
  newChildren,
  lanes
) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  
  // 第一轮遍历：复用相同位置的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes
    );
    
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }
    
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        deleteChild(returnFiber, oldFiber);
      }
    }
    
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  
  if (newIdx === newChildren.length) {
    // 新children已经遍历完，删除剩余oldFiber
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  
  if (oldFiber === null) {
    // oldFiber已遍历完，创建剩余新节点
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null) continue;
      
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }
  
  // 将剩余oldFiber加入Map
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  
  // 第二轮遍历：处理移动的节点
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes
    );
    
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key
          );
        }
      }
      
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  
  if (shouldTrackSideEffects) {
    // 删除未使用的oldFiber
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }
  
  return resultingFirstChild;
}
```

### 6.3 批量更新

```javascript
// 批量更新机制
let isBatchingUpdates = false;
let batchedUpdates = [];

function batchedUpdates(fn) {
  const prevIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  
  try {
    return fn();
  } finally {
    isBatchingUpdates = prevIsBatchingUpdates;
    
    if (!isBatchingUpdates) {
      flushSyncCallbackQueue();
    }
  }
}

// 自动批量更新示例
function handleClick() {
  // React 18会自动批量这些更新
  setCount(c => c + 1);      // 不会立即重渲染
  setFlag(f => !f);          // 不会立即重渲染
  setValue(v => v * 2);      // 批量后一次性重渲染
}

// React 18之前需要手动批量
function handleClickLegacy() {
  ReactDOM.unstable_batchedUpdates(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
    setValue(v => v * 2);
  });
}

// 异步更新也会批量（React 18+）
async function handleAsyncClick() {
  await fetchData();
  
  // React 18会自动批量
  setData(newData);
  setLoading(false);
  setError(null);
}
```

## 第七部分：Fiber调试技巧

### 7.1 Fiber DevTools

```javascript
// 在开发环境中访问Fiber
function inspectFiber(component) {
  const fiber = component._reactInternals || 
                component._reactInternalFiber;
  
  console.log('Fiber节点:', fiber);
  console.log('类型:', fiber.type);
  console.log('Props:', fiber.memoizedProps);
  console.log('State:', fiber.memoizedState);
  console.log('Flags:', fiber.flags);
  
  return fiber;
}

// 遍历Fiber树
function traverseFiberTree(fiber, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${fiber.type?.name || fiber.type || 'Host'}`);
  
  if (fiber.child) {
    traverseFiberTree(fiber.child, depth + 1);
  }
  
  if (fiber.sibling) {
    traverseFiberTree(fiber.sibling, depth);
  }
}

// 使用示例
function DebugComponent() {
  useEffect(() => {
    const fiber = inspectFiber(DebugComponent);
    traverseFiberTree(fiber);
  }, []);
  
  return <div>Debug</div>;
}
```

### 7.2 性能分析

```javascript
// Profiler API
import { Profiler } from 'react';

function onRenderCallback(
  id,                   // Profiler的id
  phase,                // "mount"或"update"
  actualDuration,       // 本次渲染耗时
  baseDuration,         // 理论最短耗时
  startTime,            // 开始时间
  commitTime,           // 提交时间
  interactions          // 交互集合
) {
  console.log(`[${id}] ${phase}阶段`);
  console.log(`实际耗时: ${actualDuration}ms`);
  console.log(`基准耗时: ${baseDuration}ms`);
  
  if (actualDuration > baseDuration * 1.5) {
    console.warn('性能警告：渲染时间超过基准50%');
  }
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Profiler id="Main" onRender={onRenderCallback}>
        <Main />
      </Profiler>
      <Footer />
    </Profiler>
  );
}
```

## 注意事项

### 1. Fiber架构的限制

```
Fiber虽然强大，但有一些限制：

1. 内存开销
   - 每个元素都有对应的Fiber节点
   - 双缓冲需要两倍内存

2. 调试复杂度
   - 调用栈更深
   - 异步渲染难以追踪

3. 学习曲线
   - 概念复杂
   - 源码难懂
```

### 2. 最佳实践

```javascript
// 1. 合理使用key
function List({ items }) {
  return items.map(item => (
    // 使用稳定的key帮助Fiber复用
    <Item key={item.id} data={item} />
  ));
}

// 2. 避免在渲染中修改数据
function Component() {
  const [items, setItems] = useState([]);
  
  // ❌ 错误：在渲染中修改
  items.push(newItem);
  
  // ✅ 正确：使用setState
  const addItem = () => {
    setItems([...items, newItem]);
  };
}

// 3. 合理使用memo避免不必要的渲染
const HeavyComponent = React.memo(function HeavyComponent({ data }) {
  // 大量计算
  return <div>{expensiveComputation(data)}</div>;
});
```

### 3. 性能优化建议

```javascript
// 1. 使用Transition标记非紧急更新
import { useTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    setQuery(e.target.value);  // 紧急：立即更新输入框
    
    startTransition(() => {
      // 非紧急：可被打断的搜索
      setResults(search(e.target.value));
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  );
}

// 2. 使用useDeferredValue延迟更新
function Component() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value);
  
  return (
    <>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <SlowList text={deferredValue} />
    </>
  );
}

// 3. 避免频繁的context更新
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  // 使用useMemo避免每次都创建新对象
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 常见问题

### Q1: Fiber如何实现可中断的渲染？

**A:** Fiber将渲染工作分解为小的工作单元，每完成一个单元就检查是否需要让出控制权。通过`requestIdleCallback`或`MessageChannel`实现帧间调度。

### Q2: 为什么需要双缓冲技术？

**A:** 双缓冲允许React在内存中构建新的UI树，完成后再一次性替换，避免渲染过程中的视觉闪烁，并且支持中断和恢复。

### Q3: Lane和Priority有什么区别？

**A:** Lane是Fiber内部的优先级系统，使用位掩码表示。Priority是Scheduler的优先级。Lane会被转换为Priority进行任务调度。

### Q4: Hook为什么不能在条件语句中使用？

**A:** Hook依赖调用顺序来匹配Fiber的memoizedState链表。条件调用会破坏顺序，导致状态错乱。

### Q5: Fiber如何处理错误边界？

**A:** Fiber在catch错误后会查找最近的错误边界组件，执行其`getDerivedStateFromError`和`componentDidCatch`，然后从该点重新渲染。

### Q6: 如何优化Fiber性能？

**A:** 主要方法包括：使用React.memo减少不必要渲染、合理使用key帮助diff、使用Transition标记低优先级更新、避免大量同步setState。

### Q7: Fiber与虚拟DOM的关系？

**A:** Fiber是虚拟DOM的一种实现方式。每个Fiber节点对应一个虚拟DOM节点，但包含更多信息用于调度和协调。

### Q8: 如何调试Fiber问题？

**A:** 使用React DevTools的Profiler、在组件上添加Profiler API收集性能数据、检查组件的`_reactInternals`属性查看Fiber节点。

### Q9: Concurrent Mode对Fiber有什么影响？

**A:** Concurrent Mode充分利用了Fiber的可中断特性，允许React同时准备多个版本的UI，并根据优先级选择最合适的版本提交。

### Q10: Fiber的未来发展方向？

**A:** React团队正在优化Fiber的性能，改进Suspense和Transition的体验，探索更细粒度的更新机制，以及更好的服务器组件支持。

## 总结

### Fiber核心要点

```
1. 架构特点
   ✅ 可中断的协调过程
   ✅ 优先级调度
   ✅ 增量渲染
   ✅ 双缓冲技术
   ✅ 时间切片

2. 数据结构
   ✅ Fiber节点（类型、props、state、flags等）
   ✅ 树形结构（parent、child、sibling）
   ✅ 双向链接（current、alternate）
   ✅ 更新队列（update queue）
   ✅ Effect链表

3. 工作流程
   ✅ Render阶段（可中断）
   ✅ Commit阶段（不可中断）
   ✅ 双缓冲切换
   ✅ 优先级调度
   ✅ 批量更新

4. 性能优化
   ✅ Bailout跳过
   ✅ Fiber复用
   ✅ Lane优先级
   ✅ 时间切片
   ✅ 批量提交
```

### 最佳实践

```
开发建议：
1. 理解Fiber工作原理，合理使用React特性
2. 使用Profiler分析性能瓶颈
3. 合理使用memo、useMemo、useCallback
4. 为列表项提供稳定的key
5. 使用Transition标记低优先级更新
6. 避免在渲染中产生副作用
7. 合理拆分组件粒度
8. 利用Concurrent特性提升用户体验
```

Fiber架构是React实现高性能、可中断渲染的基石，深入理解Fiber有助于编写更高效的React应用。

