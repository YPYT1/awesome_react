# useState手写实现 - 深入理解状态管理

## 1. useState原理概述

### 1.1 核心概念

```typescript
const useStateOverview = {
  作用: '为函数组件添加状态管理能力',
  
  基本用法: `
    const [state, setState] = useState(initialState);
  `,
  
  返回值: [
    'state: 当前状态值',
    'setState: 更新状态的函数'
  ],
  
  特点: {
    状态持久: '渲染间保持状态',
    异步更新: '批量处理更新',
    函数式更新: '支持(prevState) => newState',
    惰性初始化: '支持函数作为初始值'
  },
  
  底层实现: {
    存储: 'Fiber.memoizedState链表',
    更新: '环形更新队列',
    调度: '基于优先级的调度系统'
  }
};
```

### 1.2 实现目标

```typescript
const implementationGoals = {
  基础功能: [
    '存储和获取状态',
    '更新状态触发重渲染',
    '支持多个useState',
    '保持调用顺序'
  ],
  
  高级功能: [
    '函数式更新',
    '批量更新',
    '惰性初始化',
    '优先级调度'
  ],
  
  性能优化: [
    '急切更新优化',
    '状态比较优化',
    '更新队列优化'
  ]
};
```

## 2. 简易版实现

### 2.1 最简单的实现

```javascript
// 极简版useState
let state; // 全局变量存储状态
let setterFn; // 存储setter函数

function useState(initialValue) {
  // 初始化状态
  if (state === undefined) {
    state = initialValue;
  }
  
  // 创建setter函数
  function setState(newValue) {
    state = newValue;
    // 触发重新渲染
    render();
  }
  
  setterFn = setState;
  return [state, setState];
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0);
  
  return `
    <div>
      <p>Count: ${count}</p>
      <button onclick="setterFn(${count + 1})">Increment</button>
    </div>
  `;
}

function render() {
  document.getElementById('root').innerHTML = Counter();
}

// 初始渲染
render();

// 问题：
// 1. 只能有一个useState
// 2. 无法区分不同组件
// 3. 没有批量更新
```

### 2.2 支持多个useState

```javascript
// 支持多个useState的版本
let currentStateIndex = 0;
let states = [];

function useState(initialValue) {
  // 保存当前索引
  const index = currentStateIndex;
  
  // 初始化状态
  if (states[index] === undefined) {
    states[index] = initialValue;
  }
  
  // 创建setter
  function setState(newValue) {
    states[index] = newValue;
    // 重置索引并重新渲染
    currentStateIndex = 0;
    render();
  }
  
  // 移动到下一个索引
  currentStateIndex++;
  
  return [states[index], setState];
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');
  const [flag, setFlag] = useState(false);
  
  return `
    <div>
      <p>Count: ${count}</p>
      <p>Name: ${name}</p>
      <p>Flag: ${flag}</p>
      <button onclick="increment()">Increment</button>
    </div>
  `;
}

// 全局函数用于测试
function increment() {
  currentStateIndex = 0;
  const [count, setCount] = useState(0);
  setCount(count + 1);
}

function render() {
  currentStateIndex = 0;
  document.getElementById('root').innerHTML = Counter();
}

// 问题：
// 1. 仍然是全局状态
// 2. 无法区分多个组件实例
// 3. 依赖调用顺序（这是正确的）
```

### 2.3 支持多组件

```javascript
// 支持多组件的版本
const componentStates = new WeakMap();

function useState(component, initialValue) {
  // 获取组件的状态数组
  let states = componentStates.get(component);
  if (!states) {
    states = {
      values: [],
      index: 0
    };
    componentStates.set(component, states);
  }
  
  const index = states.index;
  
  // 初始化状态
  if (states.values[index] === undefined) {
    states.values[index] = initialValue;
  }
  
  // 创建setter
  function setState(newValue) {
    states.values[index] = newValue;
    renderComponent(component);
  }
  
  states.index++;
  
  return [states.values[index], setState];
}

function renderComponent(component) {
  const states = componentStates.get(component);
  if (states) {
    states.index = 0; // 重置索引
  }
  // 重新渲染组件
  component.render();
}
```

## 3. React风格实现

### 3.1 Hook数据结构

```typescript
// Hook节点
interface Hook {
  memoizedState: any;
  baseState: any;
  baseQueue: Update<any, any> | null;
  queue: UpdateQueue<any, any> | null;
  next: Hook | null;
}

// 更新队列
interface UpdateQueue<S, A> {
  pending: Update<S, A> | null;
  lanes: Lanes;
  dispatch: Dispatch<A> | null;
  lastRenderedReducer: (S, A) => S;
  lastRenderedState: S;
}

// 更新对象
interface Update<S, A> {
  lane: Lane;
  action: A;
  hasEagerState: boolean;
  eagerState: S | null;
  next: Update<S, A>;
}

type Dispatch<A> = (value: A) => void;
type BasicStateAction<S> = ((S) => S) | S;
```

### 3.2 全局变量

```typescript
// 当前渲染的Fiber
let currentlyRenderingFiber: Fiber | null = null;

// 当前Hook指针
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

// 是否正在重新渲染
let didScheduleRenderPhaseUpdate = false;

// 渲染阶段更新队列
let renderPhaseUpdates: Map<UpdateQueue<any, any>, Update<any, any>> | null = null;

// 渲染阶段更新计数
let numberOfReRenders = 0;

// 最大渲染次数
const RE_RENDER_LIMIT = 25;
```

### 3.3 mount实现

```typescript
/**
 * mount阶段的useState实现
 */
function mountState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  // 创建Hook节点
  const hook = mountWorkInProgressHook();
  
  // 处理惰性初始化
  if (typeof initialState === 'function') {
    initialState = (initialState as () => S)();
  }
  
  // 保存初始状态
  hook.memoizedState = hook.baseState = initialState;
  
  // 创建更新队列
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState as S
  };
  
  hook.queue = queue;
  
  // 创建dispatch函数
  const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch = 
    dispatchSetState.bind(
      null,
      currentlyRenderingFiber,
      queue
    ) as any);
  
  return [hook.memoizedState, dispatch];
}

/**
 * 创建Hook节点
 */
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
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

/**
 * 基础状态reducer
 */
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' 
    ? (action as (S) => S)(state) 
    : action;
}
```

### 3.4 update实现

```typescript
/**
 * update阶段的useState实现
 */
function updateState<S>(
  initialState?: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, initialState as any);
}

/**
 * 通用的reducer更新逻辑
 */
function updateReducer<S, A>(
  reducer: (S, A) => S,
  initialArg?: any,
  init?: any
): [S, Dispatch<A>] {
  // 获取当前Hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue!;
  
  queue.lastRenderedReducer = reducer;
  
  const current = currentHook!;
  let baseQueue = current.baseQueue;
  
  // 处理pending更新
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    // 合并pending队列到base队列
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }
    
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  
  if (baseQueue !== null) {
    // 处理更新队列
    const first = baseQueue.next;
    let newState = current.baseState;
    
    let newBaseState = null;
    let newBaseQueueFirst: Update<S, A> | null = null;
    let newBaseQueueLast: Update<S, A> | null = null;
    let update = first;
    
    do {
      const updateLane = update.lane;
      
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // 优先级不够，跳过此更新
        const clone: Update<S, A> = {
          lane: updateLane,
          action: update.action,
          hasEagerState: update.hasEagerState,
          eagerState: update.eagerState,
          next: null as any
        };
        
        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        
        // 标记跳过的lane
        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane
        );
        markSkippedUpdateLanes(updateLane);
      } else {
        // 处理此更新
        if (newBaseQueueLast !== null) {
          const clone: Update<S, A> = {
            lane: NoLane,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null as any
          };
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        
        // 执行更新
        if (update.hasEagerState) {
          // 使用急切状态
          newState = update.eagerState as S;
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      
      update = update.next!;
    } while (update !== null && update !== first);
    
    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = newBaseQueueFirst!;
    }
    
    // 对象比较优化
    if (!Object.is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate();
    }
    
    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;
    
    queue.lastRenderedState = newState;
  }
  
  const dispatch = queue.dispatch!;
  return [hook.memoizedState, dispatch];
}

/**
 * 更新Hook节点
 */
function updateWorkInProgressHook(): Hook {
  let nextCurrentHook: Hook | null;
  
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    nextCurrentHook = current !== null ? current.memoizedState : null;
  } else {
    nextCurrentHook = currentHook.next;
  }
  
  let nextWorkInProgressHook: Hook | null;
  
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }
  
  if (nextWorkInProgressHook !== null) {
    // 重用workInProgress hook
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;
    currentHook = nextCurrentHook;
  } else {
    // 克隆current hook
    currentHook = nextCurrentHook!;
    
    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null
    };
    
    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }
  
  return workInProgressHook;
}
```

### 3.5 dispatch实现

```typescript
/**
 * 分发状态更新
 */
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, BasicStateAction<S>>,
  action: A
): void {
  const lane = requestUpdateLane(fiber);
  
  // 创建更新对象
  const update: Update<S, BasicStateAction<S>> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null as any
  };
  
  // 检查是否在渲染阶段
  if (
    fiber === currentlyRenderingFiber ||
    (fiber.alternate !== null && fiber.alternate === currentlyRenderingFiber)
  ) {
    // 渲染阶段更新
    didScheduleRenderPhaseUpdate = true;
    
    update.lane = mergeLanes(update.lane, renderLanes);
    
    if (renderPhaseUpdates === null) {
      renderPhaseUpdates = new Map();
    }
    
    const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
    if (firstRenderPhaseUpdate === undefined) {
      renderPhaseUpdates.set(queue, update);
    } else {
      // 添加到队列
      let lastRenderPhaseUpdate = firstRenderPhaseUpdate;
      while (lastRenderPhaseUpdate.next !== null) {
        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      }
      lastRenderPhaseUpdate.next = update;
    }
  } else {
    // 正常更新
    const alternate = fiber.alternate;
    
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      // 队列当前为空，尝试急切计算
      const lastRenderedReducer = queue.lastRenderedReducer;
      
      if (lastRenderedReducer !== null) {
        try {
          const currentState: S = queue.lastRenderedState as any;
          const eagerState = lastRenderedReducer(currentState, action);
          
          // 保存急切状态
          update.hasEagerState = true;
          update.eagerState = eagerState;
          
          // 如果状态没变，可以提前退出
          if (Object.is(eagerState, currentState)) {
            // 状态相同，不需要调度更新
            return;
          }
        } catch (error) {
          // 忽略错误
        }
      }
    }
    
    // 入队更新
    const pending = queue.pending;
    if (pending === null) {
      // 第一个更新，创建环形链表
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    queue.pending = update;
    
    // 调度更新
    const eventTime = requestEventTime();
    const root = scheduleUpdateOnFiber(fiber, lane, eventTime);
    
    if (root !== null) {
      entangleTransitionUpdate(root, queue, lane);
    }
  }
}
```

## 4. 批量更新实现

### 4.1 批量更新机制

```typescript
// 批量更新标志
let isBatchingUpdates = false;
const updateQueue: Array<() => void> = [];

/**
 * 批量执行更新
 */
function batchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  const prevIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  
  try {
    return fn(a);
  } finally {
    isBatchingUpdates = prevIsBatchingUpdates;
    
    if (!isBatchingUpdates && updateQueue.length > 0) {
      flushUpdates();
    }
  }
}

/**
 * 刷新更新队列
 */
function flushUpdates(): void {
  const updates = updateQueue.slice();
  updateQueue.length = 0;
  
  updates.forEach(update => update());
}

/**
 * 改进的dispatch支持批量更新
 */
function dispatchSetStateWithBatch<S>(
  fiber: Fiber,
  queue: UpdateQueue<S, BasicStateAction<S>>,
  action: BasicStateAction<S>
): void {
  // ... 创建update对象
  
  if (isBatchingUpdates) {
    // 批量模式，加入队列
    updateQueue.push(() => {
      scheduleUpdateOnFiber(fiber, lane, eventTime);
    });
  } else {
    // 立即调度
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  }
}

// 使用示例
function handleClick() {
  batchedUpdates(() => {
    setCount(c => c + 1);  // 批量
    setName('John');        // 批量
    setFlag(true);          // 批量
  });
  // 只触发一次重渲染
}
```

### 4.2 React 18自动批量

```typescript
/**
 * React 18自动批量更新
 */
const automaticBatching = {
  原理: `
    React 18使用unstable_batchedUpdates包裹所有更新:
    - 事件处理器中的更新
    - Promise回调中的更新
    - setTimeout中的更新
    - 原生事件中的更新
  `,
  
  实现: `
    function scheduleUpdateOnFiber(fiber, lane, eventTime) {
      // React 18总是批量处理
      if (executionContext === NoContext) {
        // 异步更新也批量处理
        ensureRootIsScheduled(root, eventTime);
      }
    }
  `,
  
  示例: `
    // React 17: 只批量同步更新
    setTimeout(() => {
      setCount(c => c + 1);  // 触发渲染
      setName('John');        // 触发渲染
    }, 0);
    
    // React 18: 自动批量所有更新
    setTimeout(() => {
      setCount(c => c + 1);  // 批量
      setName('John');        // 批量
    }, 0);
    // 只触发一次渲染
  `
};
```

## 5. 函数式更新实现

### 5.1 基本实现

```typescript
/**
 * 支持函数式更新的reducer
 */
function basicStateReducer<S>(
  state: S, 
  action: BasicStateAction<S>
): S {
  // 检查是否是函数
  if (typeof action === 'function') {
    // 函数式更新
    return (action as (prevState: S) => S)(state);
  }
  
  // 直接返回新值
  return action;
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    // 方式1：直接传值
    setCount(count + 1);
    
    // 方式2：函数式更新（推荐）
    setCount(prevCount => prevCount + 1);
  };
  
  const incrementThreeTimes = () => {
    // 直接传值：只+1（因为count还是旧值）
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    
    // 函数式更新：+3（每次都基于最新值）
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  };
  
  return <button onClick={incrementThreeTimes}>Count: {count}</button>;
}
```

### 5.2 闭包陷阱

```typescript
// 闭包陷阱示例
const closureTrap = {
  问题代码: `
    function Counter() {
      const [count, setCount] = useState(0);
      
      useEffect(() => {
        const timer = setInterval(() => {
          setCount(count + 1); // 闭包捕获的count永远是0
        }, 1000);
        
        return () => clearInterval(timer);
      }, []); // 空依赖，只执行一次
      
      return <div>{count}</div>;
    }
    
    // 结果：count只会变成1，不会继续增加
  `,
  
  解决方案1: `
    // 使用函数式更新
    setInterval(() => {
      setCount(c => c + 1); // 总是基于最新值
    }, 1000);
  `,
  
  解决方案2: `
    // 添加依赖
    useEffect(() => {
      const timer = setInterval(() => {
        setCount(count + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }, [count]); // count变化时重新创建定时器
  `,
  
  解决方案3: `
    // 使用useRef
    const countRef = useRef(count);
    countRef.current = count;
    
    useEffect(() => {
      const timer = setInterval(() => {
        setCount(countRef.current + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }, []);
  `
};
```

## 6. 惰性初始化实现

### 6.1 实现原理

```typescript
/**
 * 惰性初始化
 */
function mountStateWithLazyInit<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  
  // 检查是否是函数
  let initialStateValue: S;
  if (typeof initialState === 'function') {
    // 执行函数获取初始值（只在mount时执行一次）
    initialStateValue = (initialState as () => S)();
  } else {
    initialStateValue = initialState;
  }
  
  hook.memoizedState = hook.baseState = initialStateValue;
  
  // ... 创建队列和dispatch
  
  return [hook.memoizedState, dispatch];
}

// 使用场景
const lazyInitUseCases = {
  昂贵计算: `
    function Component() {
      // ❌ 不好：每次渲染都执行
      const [data, setData] = useState(expensiveComputation());
      
      // ✓ 好：只在初始化时执行一次
      const [data, setData] = useState(() => expensiveComputation());
    }
  `,
  
  读取localStorage: `
    function Component() {
      const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
      });
    }
  `,
  
  复杂初始化: `
    function Component() {
      const [state, setState] = useState(() => {
        // 复杂的初始化逻辑
        const initial = computeInitialState();
        return processInitialState(initial);
      });
    }
  `
};
```

## 7. 性能优化

### 7.1 急切状态计算

```typescript
/**
 * 急切状态优化
 */
function dispatchSetStateWithEager<S>(
  fiber: Fiber,
  queue: UpdateQueue<S, BasicStateAction<S>>,
  action: BasicStateAction<S>
): void {
  // ... 创建update
  
  const alternate = fiber.alternate;
  
  // 检查是否可以急切计算
  if (
    fiber.lanes === NoLanes &&
    (alternate === null || alternate.lanes === NoLanes)
  ) {
    // 当前没有pending更新，可以急切计算
    const lastRenderedReducer = queue.lastRenderedReducer;
    
    if (lastRenderedReducer !== null) {
      try {
        const currentState = queue.lastRenderedState;
        const eagerState = lastRenderedReducer(currentState, action);
        
        // 保存急切状态
        update.hasEagerState = true;
        update.eagerState = eagerState;
        
        // 如果状态相同，直接返回
        if (Object.is(eagerState, currentState)) {
          return; // 跳过调度
        }
      } catch (error) {
        // 计算失败，正常调度
      }
    }
  }
  
  // 正常调度更新
  scheduleUpdateOnFiber(fiber, lane, eventTime);
}

// 优化效果
const eagerOptimization = `
  function Counter() {
    const [count, setCount] = useState(0);
    
    const handleClick = () => {
      setCount(0); // 设置相同的值
      // 急切计算发现值没变，跳过重渲染
    };
  }
`;
```

### 7.2 对象比较优化

```typescript
/**
 * Object.is比较
 */
function updateReducerWithComparison<S, A>(
  reducer: (S, A) => S,
  initialArg: any
): [S, Dispatch<A>] {
  // ... 计算newState
  
  // 使用Object.is比较
  if (!Object.is(newState, hook.memoizedState)) {
    markWorkInProgressReceivedUpdate();
  }
  
  hook.memoizedState = newState;
  
  return [hook.memoizedState, dispatch];
}

// Object.is vs ===
const comparisonDifference = {
  '===': {
    'NaN === NaN': false,
    '+0 === -0': true
  },
  
  'Object.is': {
    'Object.is(NaN, NaN)': true,
    'Object.is(+0, -0)': false
  },
  
  使用场景: `
    // React使用Object.is确保更精确的比较
    const isSame = Object.is(newState, oldState);
  `
};
```

## 8. 测试用例

### 8.1 基础功能测试

```typescript
describe('useState', () => {
  test('初始值', () => {
    function Component() {
      const [count] = useState(0);
      return count;
    }
    
    const result = render(<Component />);
    expect(result).toBe(0);
  });
  
  test('更新状态', () => {
    let setCount;
    
    function Component() {
      const [count, _setCount] = useState(0);
      setCount = _setCount;
      return count;
    }
    
    const { result, rerender } = renderHook(() => Component());
    
    expect(result.current).toBe(0);
    
    act(() => {
      setCount(1);
    });
    
    expect(result.current).toBe(1);
  });
  
  test('函数式更新', () => {
    let setCount;
    
    function Component() {
      const [count, _setCount] = useState(0);
      setCount = _setCount;
      return count;
    }
    
    const { result } = renderHook(() => Component());
    
    act(() => {
      setCount(c => c + 1);
      setCount(c => c + 1);
      setCount(c => c + 1);
    });
    
    expect(result.current).toBe(3);
  });
  
  test('惰性初始化', () => {
    const expensive = jest.fn(() => 10);
    
    function Component() {
      const [value] = useState(expensive);
      return value;
    }
    
    const { result, rerender } = renderHook(() => Component());
    
    expect(expensive).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(10);
    
    rerender();
    
    expect(expensive).toHaveBeenCalledTimes(1); // 只调用一次
  });
  
  test('批量更新', () => {
    let renderCount = 0;
    
    function Component() {
      const [count, setCount] = useState(0);
      const [name, setName] = useState('');
      
      renderCount++;
      
      return { count, setCount, name, setName };
    }
    
    const { result } = renderHook(() => Component());
    
    act(() => {
      result.current.setCount(1);
      result.current.setName('John');
    });
    
    expect(renderCount).toBe(2); // mount + 1次批量更新
  });
});
```

## 9. 面试高频问题

```typescript
const useStateInterviewQA = {
  Q1: {
    question: 'useState的实现原理?',
    answer: [
      '1. mount时创建Hook节点，初始化状态',
      '2. 创建更新队列和dispatch函数',
      '3. update时处理更新队列，计算新状态',
      '4. 使用链表存储多个useState',
      '5. 通过闭包保持dispatch引用不变'
    ]
  },
  
  Q2: {
    question: '为什么useState返回数组而不是对象?',
    answer: `
      数组解构更灵活:
      
      // 数组：可以任意命名
      const [count, setCount] = useState(0);
      const [user, setUser] = useState(null);
      
      // 对象：必须使用固定名称
      const { state, setState } = useState(0);
      const { state: user, setState: setUser } = useState(null);
      
      数组解构语法更简洁
    `
  },
  
  Q3: {
    question: 'useState的更新是同步还是异步?',
    answer: `
      异步批量更新:
      
      1. setState不会立即更新状态
      2. React收集多个setState
      3. 批量处理，只触发一次重渲染
      4. 在事件处理器、生命周期中自动批量
      5. React 18在所有情况下都自动批量
    `
  },
  
  Q4: {
    question: '函数式更新有什么优势?',
    answer: [
      '1. 基于最新状态更新',
      '2. 避免闭包陷阱',
      '3. 多次更新正确累加',
      '4. 不依赖外部变量',
      '5. 更安全可靠'
    ]
  },
  
  Q5: {
    question: '如何优化useState性能?',
    answer: `
      1. 惰性初始化：
         useState(() => expensiveComputation())
      
      2. 函数式更新：
         setCount(c => c + 1)
      
      3. 状态拆分：
         // 而不是一个大对象
         const [count, setCount] = useState(0);
         const [name, setName] = useState('');
      
      4. 使用useReducer管理复杂状态
      
      5. 急切更新优化（React自动）
    `
  },
  
  Q6: {
    question: 'useState和useReducer的区别?',
    answer: [
      '1. useState适合简单状态',
      '2. useReducer适合复杂状态逻辑',
      '3. useState内部用useReducer实现',
      '4. useReducer更适合状态间有关联',
      '5. useReducer dispatch引用更稳定'
    ]
  }
};
```

## 10. 总结

useState手写实现的核心要点:

1. **Hook链表**: 存储在Fiber.memoizedState
2. **更新队列**: 环形链表存储pending更新
3. **dispatch**: 闭包保持引用不变
4. **批量更新**: 收集更新，统一处理
5. **函数式更新**: 基于最新状态
6. **惰性初始化**: 函数只执行一次
7. **性能优化**: 急切状态、Object.is比较
8. **优先级**: 支持跳过低优先级更新

理解useState实现是掌握React Hooks的基础。

