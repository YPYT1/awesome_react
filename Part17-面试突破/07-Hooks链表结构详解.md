# Hooks链表结构详解 - React Hooks底层数据结构

## 1. Hooks链表概述

### 1.1 为什么使用链表

```typescript
const hooksLinkedListReason = {
  设计需求: {
    多个Hooks: '一个组件可以使用多个Hooks',
    顺序固定: 'Hooks调用顺序必须一致',
    状态持久: '状态需要在渲染间保持',
    快速访问: '按顺序快速访问每个Hook'
  },
  
  为什么不用数组: {
    问题: '条件调用会导致索引错位',
    示例: `
      function Component() {
        const [a, setA] = useState(0);
        
        if (someCondition) {
          const [b, setB] = useState(0); // 索引会变化!
        }
        
        const [c, setC] = useState(0);
      }
      
      // 第一次: a=index[0], b=index[1], c=index[2]
      // 第二次: a=index[0],            c=index[1] (错位!)
    `
  },
  
  链表优势: [
    '固定顺序',
    '不受条件影响',
    '快速遍历',
    '便于添加和删除'
  ]
};
```

### 1.2 Hook数据结构

```typescript
// Hook节点结构
type Hook = {
  // 当前状态值
  memoizedState: any;
  
  // 基础状态(用于useReducer)
  baseState: any;
  
  // 基础更新队列
  baseQueue: Update<any, any> | null;
  
  // 待处理更新队列
  queue: UpdateQueue<any, any> | null;
  
  // 指向下一个Hook
  next: Hook | null;
};

// 更新队列
type UpdateQueue<S, A> = {
  // 待处理的更新
  pending: Update<S, A> | null;
  
  // 调度优先级
  lanes: Lanes;
  
  // dispatch函数
  dispatch: ((A) => void) | null;
  
  // 最后一个渲染的reducer
  lastRenderedReducer: ((S, A) => S) | null;
  
  // 最后一个渲染的state
  lastRenderedState: S | null;
};

// 更新对象
type Update<S, A> = {
  // 优先级
  lane: Lane;
  
  // 更新action
  action: A;
  
  // 是否有急切更新
  hasEagerState: boolean;
  
  // 急切状态
  eagerState: S | null;
  
  // 指向下一个更新(环形链表)
  next: Update<S, A>;
};
```

### 1.3 Fiber与Hooks的关系

```typescript
// Fiber节点中的Hooks
interface Fiber {
  // ... 其他属性
  
  // Hooks链表头指针
  memoizedState: Hook | null;
  
  // 更新队列
  updateQueue: UpdateQueue<any, any> | null;
  
  // ... 其他属性
}

// Hooks存储在Fiber上
const fiberWithHooks = {
  tag: FunctionComponent,
  type: MyComponent,
  stateNode: null,
  
  // Hooks链表
  memoizedState: {
    memoizedState: 0,        // useState的值
    next: {
      memoizedState: () => {}, // useEffect的清理函数
      next: {
        memoizedState: {},     // useContext的值
        next: null
      }
    }
  }
};
```

## 2. Hooks链表构建

### 2.1 mount阶段

```typescript
// 当前正在工作的Fiber
let currentlyRenderingFiber: Fiber | null = null;

// Hooks链表
let workInProgressHook: Hook | null = null;

// 首次渲染时挂载Hook
function mountWorkInProgressHook(): Hook {
  // 创建新Hook
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
    // 后续Hook,添加到链表末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return workInProgressHook;
}

// 示例: 三个useState调用
function Component() {
  const [count, setCount] = useState(0);    // Hook 1
  const [name, setName] = useState('');     // Hook 2
  const [flag, setFlag] = useState(false);  // Hook 3
  
  // Fiber.memoizedState:
  // Hook1 -> Hook2 -> Hook3 -> null
}
```

### 2.2 update阶段

```typescript
// 当前Hook在旧Fiber上的指针
let currentHook: Hook | null = null;

// 更新时复用Hook
function updateWorkInProgressHook(): Hook {
  let nextCurrentHook: Hook | null;
  
  if (currentHook === null) {
    // 第一个Hook
    const current = currentlyRenderingFiber.alternate;
    nextCurrentHook = current ? current.memoizedState : null;
  } else {
    // 后续Hook
    nextCurrentHook = currentHook.next;
  }
  
  let nextWorkInProgressHook: Hook | null;
  
  if (workInProgressHook === null) {
    // 第一个Hook
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    // 后续Hook
    nextWorkInProgressHook = workInProgressHook.next;
  }
  
  if (nextWorkInProgressHook !== null) {
    // 已有workInProgress Hook(重复渲染)
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;
    
    currentHook = nextCurrentHook;
  } else {
    // 克隆current Hook
    currentHook = nextCurrentHook;
    
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

### 2.3 Hooks调用流程

```typescript
// renderWithHooks入口
function renderWithHooks<Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes
): any {
  // 设置当前渲染的Fiber
  currentlyRenderingFiber = workInProgress;
  
  // 清空Hooks链表
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  
  // 根据mount/update选择不同的Hooks实现
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;
  
  // 执行函数组件
  let children = Component(props, secondArg);
  
  // 清理
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
  
  return children;
}

// Mount时的Hooks实现
const HooksDispatcherOnMount = {
  useState: mountState,
  useEffect: mountEffect,
  useContext: readContext,
  useReducer: mountReducer,
  useCallback: mountCallback,
  useMemo: mountMemo,
  useRef: mountRef
  // ... 其他Hooks
};

// Update时的Hooks实现
const HooksDispatcherOnUpdate = {
  useState: updateState,
  useEffect: updateEffect,
  useContext: readContext,
  useReducer: updateReducer,
  useCallback: updateCallback,
  useMemo: updateMemo,
  useRef: updateRef
  // ... 其他Hooks
};
```

## 3. 不同Hook的链表应用

### 3.1 useState链表

```typescript
// useState mount实现
function mountState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  // 创建Hook节点
  const hook = mountWorkInProgressHook();
  
  // 初始化状态
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  hook.memoizedState = hook.baseState = initialState;
  
  // 创建更新队列
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  
  hook.queue = queue;
  
  // 创建dispatch函数
  const dispatch: Dispatch<BasicStateAction<S>> = 
    dispatchSetState.bind(null, currentlyRenderingFiber, queue);
  
  queue.dispatch = dispatch;
  
  return [hook.memoizedState, dispatch];
}

// useState update实现
function updateState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, initialState);
}

// 基础reducer
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
}

// 链表示例
const useStateExample = `
  function Component() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('');
    
    // Fiber.memoizedState:
    // {
    //   memoizedState: 0,
    //   queue: { dispatch: setCount, ... },
    //   next: {
    //     memoizedState: '',
    //     queue: { dispatch: setName, ... },
    //     next: null
    //   }
    // }
  }
`;
```

### 3.2 useEffect链表

```typescript
// Effect Hook结构
type Effect = {
  tag: HookFlags;
  create: () => (() => void) | void;
  destroy: (() => void) | void;
  deps: Array<any> | null;
  next: Effect;
};

// useEffect mount实现
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 标记副作用
  currentlyRenderingFiber.flags |= PassiveEffect;
  
  // 创建Effect对象
  hook.memoizedState = pushEffect(
    HookHasEffect | HookPassive,
    create,
    undefined,
    nextDeps
  );
}

// pushEffect添加到环形链表
function pushEffect(
  tag: HookFlags,
  create: () => (() => void) | void,
  destroy: (() => void) | void | undefined,
  deps: Array<any> | null
): Effect {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    next: null as any
  };
  
  let componentUpdateQueue: FunctionComponentUpdateQueue | null =
    currentlyRenderingFiber.updateQueue as any;
  
  if (componentUpdateQueue === null) {
    // 创建新队列
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue as any;
    
    // 创建环形链表
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    // 添加到环形链表
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

// useEffect链表示例
const useEffectExample = `
  function Component() {
    useEffect(() => {
      console.log('Effect 1');
    }, []);
    
    useEffect(() => {
      console.log('Effect 2');
    }, [count]);
    
    // updateQueue.lastEffect: (环形链表)
    // Effect2 -> Effect1 -> Effect2 -> ...
    //   ↑                      |
    //   |______________________|
  }
`;
```

### 3.3 useReducer链表

```typescript
// useReducer mount实现
function mountReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S
): [S, Dispatch<A>] {
  const hook = mountWorkInProgressHook();
  
  let initialState;
  if (init !== undefined) {
    initialState = init(initialArg);
  } else {
    initialState = initialArg as any;
  }
  
  hook.memoizedState = hook.baseState = initialState;
  
  const queue: UpdateQueue<S, A> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: initialState
  };
  
  hook.queue = queue;
  
  const dispatch: Dispatch<A> = 
    dispatchReducerAction.bind(null, currentlyRenderingFiber, queue);
  
  queue.dispatch = dispatch;
  
  return [hook.memoizedState, dispatch];
}

// useReducer update实现
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S
): [S, Dispatch<A>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  
  queue.lastRenderedReducer = reducer;
  
  const current = currentHook;
  let baseQueue = current.baseQueue;
  
  // 处理pending更新
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    // 合并pending到base
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
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;
    
    do {
      const updateLane = update.lane;
      
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // 优先级不够,跳过
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
        
        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane
        );
        markSkippedUpdateLanes(updateLane);
      } else {
        // 处理更新
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
        
        if (update.hasEagerState) {
          newState = update.eagerState;
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      
      update = update.next;
    } while (update !== null && update !== first);
    
    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = newBaseQueueFirst;
    }
    
    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;
    
    queue.lastRenderedState = newState;
  }
  
  const dispatch = queue.dispatch;
  return [hook.memoizedState, dispatch];
}
```

### 3.4 useMemo和useCallback链表

```typescript
// useMemo mount实现
function mountMemo<T>(
  nextCreate: () => T,
  deps: Array<any> | void | null
): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  const nextValue = nextCreate();
  
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

// useMemo update实现
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<any> | void | null
): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变,返回缓存值
        return prevState[0];
      }
    }
  }
  
  // 重新计算
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

// useCallback mount实现
function mountCallback<T>(callback: T, deps: Array<any> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

// useCallback update实现
function updateCallback<T>(callback: T, deps: Array<any> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```

## 4. Hooks规则的底层原因

### 4.1 为什么不能条件调用

```typescript
// 错误示例
const conditionalHooksError = {
  代码: `
    function Component({ condition }) {
      const [a, setA] = useState(0);
      
      if (condition) {
        const [b, setB] = useState(0); // ❌ 错误!
      }
      
      const [c, setC] = useState(0);
    }
  `,
  
  问题: `
    第一次渲染(condition=true):
    Hook链表: Hook_a -> Hook_b -> Hook_c
    
    第二次渲染(condition=false):
    Hook链表期望: Hook_a -> Hook_b -> Hook_c
    实际执行: Hook_a -> Hook_c
    
    结果: Hook_c复用了Hook_b的状态!
  `,
  
  原因: `
    Hooks依赖固定的调用顺序来匹配
    条件调用会导致顺序不一致
    链表指针错位
  `
};
```

### 4.2 为什么不能在循环中调用

```typescript
// 错误示例
const loopHooksError = {
  代码: `
    function Component({ items }) {
      items.forEach(item => {
        const [value, setValue] = useState(item); // ❌ 错误!
      });
    }
  `,
  
  问题: `
    第一次渲染(items=[1, 2, 3]):
    Hook链表: Hook1 -> Hook2 -> Hook3
    
    第二次渲染(items=[1, 2]):
    Hook链表期望: Hook1 -> Hook2 -> Hook3
    实际执行: Hook1 -> Hook2
    
    结果: Hook3变成孤儿节点
  `,
  
  正确做法: `
    function Component({ items }) {
      // 用一个Hook管理所有状态
      const [values, setValues] = useState(items);
      
      // 或者将Hook移到子组件
      return items.map(item => <Item key={item.id} item={item} />);
    }
    
    function Item({ item }) {
      const [value, setValue] = useState(item);
      // ...
    }
  `
};
```

### 4.3 为什么只能在顶层调用

```typescript
const topLevelOnlyReason = {
  原因: `
    Hooks必须按照固定顺序调用
    嵌套函数/回调中调用无法保证顺序
  `,
  
  错误示例: `
    function Component() {
      const handleClick = () => {
        const [value, setValue] = useState(0); // ❌ 错误!
      };
      
      useEffect(() => {
        const [data, setData] = useState([]); // ❌ 错误!
      }, []);
    }
  `,
  
  正确做法: `
    function Component() {
      const [value, setValue] = useState(0); // ✓ 正确
      const [data, setData] = useState([]);  // ✓ 正确
      
      const handleClick = () => {
        setValue(v => v + 1); // 使用dispatch
      };
      
      useEffect(() => {
        setData([1, 2, 3]); // 使用dispatch
      }, []);
    }
  `
};
```

## 5. 更新队列处理

### 5.1 环形链表结构

```typescript
// 更新环形链表
type UpdateQueue<S, A> = {
  pending: Update<S, A> | null;  // 指向最后一个更新
  // ...
};

type Update<S, A> = {
  action: A;
  next: Update<S, A>;  // 指向下一个更新
};

// 添加更新
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
): void {
  const update: Update<S, A> = {
    lane: requestUpdateLane(fiber),
    action,
    hasEagerState: false,
    eagerState: null,
    next: null as any
  };
  
  // 添加到环形链表
  const pending = queue.pending;
  if (pending === null) {
    // 第一个更新,指向自己
    update.next = update;
  } else {
    // 插入到环的末尾
    update.next = pending.next;
    pending.next = update;
  }
  
  queue.pending = update;
  
  // 调度更新
  scheduleUpdateOnFiber(fiber, lane, eventTime);
}

// 处理更新队列
function processUpdateQueue() {
  const pending = queue.pending;
  
  if (pending !== null) {
    const first = pending.next;  // 第一个更新
    const last = pending;         // 最后一个更新
    
    let update = first;
    do {
      // 处理更新
      newState = reducer(newState, update.action);
      update = update.next;
    } while (update !== first);
  }
}
```

### 5.2 优先级跳过

```typescript
// 处理优先级
function processUpdatesWithPriority() {
  let update = first;
  let newState = baseState;
  let newBaseState = null;
  let newBaseQueue = null;
  
  do {
    const updateLane = update.lane;
    
    if (!isSubsetOfLanes(renderLanes, updateLane)) {
      // 优先级不够,跳过此更新
      const clone = {
        lane: updateLane,
        action: update.action,
        next: null
      };
      
      // 添加到新的baseQueue
      if (newBaseQueue === null) {
        newBaseQueue = clone;
        newBaseState = newState;
      } else {
        newBaseQueue.next = clone;
      }
    } else {
      // 处理更新
      newState = reducer(newState, update.action);
    }
    
    update = update.next;
  } while (update !== null);
  
  // 保存跳过的更新
  hook.baseState = newBaseState;
  hook.baseQueue = newBaseQueue;
  hook.memoizedState = newState;
}
```

## 6. 面试高频问题

```typescript
const hooksLinkedListQA = {
  Q1: {
    question: 'Hooks为什么使用链表而不是数组?',
    answer: [
      '1. 调用顺序固定',
      '2. 不受条件影响',
      '3. 快速遍历',
      '4. 便于添加删除',
      '5. 不会因索引错位导致状态混乱'
    ]
  },
  
  Q2: {
    question: 'Hooks链表如何存储?',
    answer: `
      存储在Fiber节点上:
      - Fiber.memoizedState: Hook链表头指针
      - 每个Hook通过next指针连接
      - Hook.memoizedState: 存储该Hook的状态
      - Hook.queue: 存储更新队列
    `
  },
  
  Q3: {
    question: 'Hooks为什么不能条件调用?',
    answer: `
      Hooks依赖固定的调用顺序:
      1. mount时按顺序创建链表
      2. update时按顺序遍历链表
      3. 条件调用会导致顺序不一致
      4. 链表指针错位,状态混乱
    `
  },
  
  Q4: {
    question: 'useState的更新队列如何组织?',
    answer: [
      '1. 环形链表结构',
      '2. queue.pending指向最后一个更新',
      '3. 最后一个更新.next指向第一个更新',
      '4. 方便从任意位置遍历',
      '5. 支持优先级跳过'
    ]
  },
  
  Q5: {
    question: 'mount和update时Hooks实现有什么区别?',
    answer: `
      mount:
      - 创建新的Hook节点
      - 初始化状态
      - 创建dispatch函数
      
      update:
      - 复用旧的Hook节点
      - 处理更新队列
      - 计算新状态
      - 保持dispatch引用不变
    `
  },
  
  Q6: {
    question: 'useEffect的链表结构?',
    answer: `
      两个层次:
      1. Hook链表: 存储在Fiber.memoizedState
      2. Effect链表: 存储在Fiber.updateQueue
      
      Effect链表是环形链表:
      - 方便遍历所有effects
      - lastEffect指向最后一个effect
      - 从lastEffect.next开始遍历
    `
  }
};
```

## 7. 总结

Hooks链表结构的核心要点:

1. **数据结构**: 单向链表存储Hooks
2. **存储位置**: Fiber.memoizedState
3. **构建时机**: 组件渲染时
4. **遍历方式**: 按顺序访问
5. **更新队列**: 环形链表
6. **规则原因**: 保证顺序一致
7. **优先级**: 支持跳过低优先级更新

理解Hooks链表是掌握Hooks原理的关键。

