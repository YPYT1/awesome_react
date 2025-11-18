# useReducer手写实现 - 复杂状态管理深度解析

## 1. useReducer概述

### 1.1 核心概念

```typescript
const useReducerConcept = {
  作用: '管理复杂状态逻辑',
  
  基本用法: `
    const [state, dispatch] = useReducer(reducer, initialState, init);
  `,
  
  参数: {
    reducer: '(state, action) => newState',
    initialState: '初始状态',
    init: '惰性初始化函数（可选）'
  },
  
  返回值: {
    state: '当前状态',
    dispatch: '分发action的函数'
  },
  
  适用场景: [
    '状态逻辑复杂',
    '多个子值',
    '状态更新依赖前一个状态',
    '需要深层更新',
    '可预测的状态转换'
  ],
  
  与useState对比: {
    useState: '简单状态',
    useReducer: '复杂状态逻辑'
  }
};
```

### 1.2 数据结构

```typescript
// Reducer类型
type Reducer<S, A> = (state: S, action: A) => S;
type Dispatch<A> = (action: A) => void;

// Hook节点（复用useState的结构）
interface Hook {
  memoizedState: any;           // 当前状态
  baseState: any;               // 基础状态
  baseQueue: Update<any, any> | null;  // 基础更新队列
  queue: UpdateQueue<any, any> | null;  // 更新队列
  next: Hook | null;
}

// 更新队列
interface UpdateQueue<S, A> {
  pending: Update<S, A> | null;
  lanes: Lanes;
  dispatch: Dispatch<A> | null;
  lastRenderedReducer: Reducer<S, A>;
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
```

## 2. mount阶段实现

### 2.1 mountReducer

```typescript
/**
 * mount阶段的useReducer
 */
function mountReducer<S, I, A>(
  reducer: Reducer<S, A>,
  initialArg: I,
  init?: (arg: I) => S
): [S, Dispatch<A>] {
  // 创建Hook节点
  const hook = mountWorkInProgressHook();
  
  // 初始化状态
  let initialState: S;
  if (init !== undefined) {
    // 惰性初始化
    initialState = init(initialArg);
  } else {
    initialState = initialArg as any;
  }
  
  hook.memoizedState = hook.baseState = initialState;
  
  // 创建更新队列
  const queue: UpdateQueue<S, A> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: initialState
  };
  
  hook.queue = queue;
  
  // 创建dispatch函数
  const dispatch: Dispatch<A> = (queue.dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ) as any);
  
  return [hook.memoizedState, dispatch];
}

// 使用示例
const mountExample = `
  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      case 'decrement':
        return { count: state.count - 1 };
      default:
        return state;
    }
  }
  
  function Component() {
    const [state, dispatch] = useReducer(reducer, { count: 0 });
    
    // mount时:
    // 1. 初始化state为{ count: 0 }
    // 2. 创建dispatch函数
    // 3. 返回[state, dispatch]
  }
`;
```

### 2.2 惰性初始化

```typescript
/**
 * 惰性初始化示例
 */
const lazyInitialization = {
  基本用法: `
    function init(initialCount) {
      console.log('Init called');
      return { count: initialCount };
    }
    
    function Component({ initialCount }) {
      const [state, dispatch] = useReducer(
        reducer,
        initialCount,
        init  // 初始化函数
      );
      
      // init只在mount时调用一次
    }
  `,
  
  应用场景: `
    // 从localStorage读取初始状态
    function init(key) {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultState;
    }
    
    const [state, dispatch] = useReducer(
      reducer,
      'myAppState',
      init
    );
  `,
  
  性能优势: `
    // ❌ 不好：每次渲染都执行
    const [state, dispatch] = useReducer(
      reducer,
      expensiveComputation()
    );
    
    // ✓ 好：只在mount时执行
    const [state, dispatch] = useReducer(
      reducer,
      initialArg,
      expensiveComputation
    );
  `
};
```

## 3. update阶段实现

### 3.1 updateReducer

```typescript
/**
 * update阶段的useReducer
 */
function updateReducer<S, I, A>(
  reducer: Reducer<S, A>,
  initialArg: I,
  init?: (arg: I) => S
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
        
        // 执行reducer
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
    
    // 状态比较
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
```

### 3.2 dispatchReducerAction

```typescript
/**
 * 分发reducer action
 */
function dispatchReducerAction<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
): void {
  const lane = requestUpdateLane(fiber);
  
  // 创建更新对象
  const update: Update<S, A> = {
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
          
          // 如果状态没变，提前退出
          if (Object.is(eagerState, currentState)) {
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
    scheduleUpdateOnFiber(fiber, lane, eventTime);
  }
}
```

## 4. useState与useReducer的关系

### 4.1 useState是useReducer的特例

```typescript
/**
 * useState实际上是特殊的useReducer
 */
function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  return useReducer(
    basicStateReducer,  // 内置的reducer
    initialState
  );
}

/**
 * 基础状态reducer
 */
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' 
    ? (action as (prevState: S) => S)(state)
    : action;
}

// 关系示例
const relationExample = {
  useState实现: `
    const [count, setCount] = useState(0);
    
    // 等价于:
    const [count, setCount] = useReducer(
      (state, action) => 
        typeof action === 'function' 
          ? action(state) 
          : action,
      0
    );
  `,
  
  优势对比: {
    useState: {
      适合: '简单状态',
      语法: '简洁',
      示例: 'setCount(1)'
    },
    useReducer: {
      适合: '复杂状态逻辑',
      可测试: 'reducer是纯函数',
      示例: 'dispatch({ type: "increment" })'
    }
  }
};
```

## 5. 实战应用

### 5.1 表单状态管理

```typescript
// 表单reducer
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: 'SET_FIELD_VALUE'; field: string; value: any }
  | { type: 'SET_FIELD_ERROR'; field: string; error: string }
  | { type: 'SET_FIELD_TOUCHED'; field: string }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET_FORM' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        }
      };
    
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };
    
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };
    
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };
    
    case 'RESET_FORM':
      return initialState;
    
    default:
      return state;
  }
}

// 使用
function useForm(initialValues: Record<string, any>) {
  const initialState: FormState = {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  };
  
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  const setFieldValue = (field: string, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', field, value });
  };
  
  const setFieldError = (field: string, error: string) => {
    dispatch({ type: 'SET_FIELD_ERROR', field, error });
  };
  
  const setFieldTouched = (field: string) => {
    dispatch({ type: 'SET_FIELD_TOUCHED', field });
  };
  
  const handleSubmit = async (onSubmit: (values: any) => Promise<void>) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  };
  
  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };
  
  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    resetForm
  };
}
```

### 5.2 异步数据获取

```typescript
// 异步状态管理
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

type AsyncAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: T }
  | { type: 'FETCH_ERROR'; error: Error }
  | { type: 'RESET' };

function asyncReducer<T>(
  state: AsyncState<T>,
  action: AsyncAction<T>
): AsyncState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'FETCH_SUCCESS':
      return {
        data: action.data,
        loading: false,
        error: null
      };
    
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.error
      };
    
    case 'RESET':
      return {
        data: null,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}

// 自定义Hook
function useAsync<T>(asyncFunction: () => Promise<T>) {
  const initialState: AsyncState<T> = {
    data: null,
    loading: false,
    error: null
  };
  
  const [state, dispatch] = useReducer(asyncReducer, initialState);
  
  const execute = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const data = await asyncFunction();
      dispatch({ type: 'FETCH_SUCCESS', data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', error: error as Error });
    }
  }, [asyncFunction]);
  
  const reset = () => {
    dispatch({ type: 'RESET' });
  };
  
  return { ...state, execute, reset };
}

// 使用
function Component() {
  const { data, loading, error, execute } = useAsync(() => 
    fetch('/api/data').then(res => res.json())
  );
  
  useEffect(() => {
    execute();
  }, [execute]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### 5.3 复杂计数器

```typescript
// 复杂计数器state
interface CounterState {
  count: number;
  step: number;
  history: number[];
}

type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set_step'; step: number }
  | { type: 'undo' };

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, state.count]
      };
    
    case 'decrement':
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, state.count]
      };
    
    case 'reset':
      return {
        ...state,
        count: 0,
        history: []
      };
    
    case 'set_step':
      return {
        ...state,
        step: action.step
      };
    
    case 'undo':
      if (state.history.length === 0) return state;
      
      const newHistory = state.history.slice(0, -1);
      const previousCount = state.history[state.history.length - 1];
      
      return {
        ...state,
        count: previousCount,
        history: newHistory
      };
    
    default:
      return state;
  }
}

// 使用
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    step: 1,
    history: []
  });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Step: {state.step}</p>
      
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'undo' })}>Undo</button>
      
      <input
        type="number"
        value={state.step}
        onChange={e => dispatch({ 
          type: 'set_step', 
          step: Number(e.target.value) 
        })}
      />
      
      <div>
        History: {state.history.join(', ')}
      </div>
    </div>
  );
}
```

## 6. 性能优化

### 6.1 dispatch稳定性

```typescript
const dispatchStability = {
  特点: 'dispatch引用永远不变',
  
  示例: `
    function Component() {
      const [state, dispatch] = useReducer(reducer, initialState);
      
      // dispatch引用稳定，可安全地用在依赖数组中
      useEffect(() => {
        dispatch({ type: 'init' });
      }, [dispatch]); // dispatch永远不会导致effect重新执行
      
      // 可以安全传递给子组件
      return <Child onUpdate={dispatch} />;
    }
    
    const Child = React.memo(({ onUpdate }) => {
      // onUpdate引用稳定，Child不会重渲染
      return <button onClick={() => onUpdate({ type: 'update' })}>
        Update
      </button>;
    });
  `,
  
  对比useState: `
    // useState的setter也是稳定的
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      setCount(1);
    }, [setCount]); // setCount引用稳定
  `
};
```

### 6.2 reducer优化

```typescript
const reducerOptimization = {
  不可变更新: `
    // ❌ 错误：直接修改state
    function reducer(state, action) {
      state.count++; // 突变！
      return state;
    }
    
    // ✓ 正确：返回新对象
    function reducer(state, action) {
      return {
        ...state,
        count: state.count + 1
      };
    }
  `,
  
  使用Immer: `
    import { useImmerReducer } from 'use-immer';
    
    function reducer(draft, action) {
      switch (action.type) {
        case 'increment':
          draft.count++; // Immer允许突变语法
          break;
        case 'add_item':
          draft.items.push(action.item);
          break;
      }
    }
    
    const [state, dispatch] = useImmerReducer(reducer, initialState);
  `,
  
  提取reducer: `
    // ✓ 好：reducer在组件外
    function counterReducer(state, action) {
      // ...
    }
    
    function Component() {
      const [state, dispatch] = useReducer(counterReducer, 0);
    }
    
    // 优势：
    // 1. reducer可以单独测试
    // 2. 可以在多个组件间共享
    // 3. 不会每次渲染都创建
  `
};
```

## 7. 测试

```typescript
describe('useReducer', () => {
  test('初始状态', () => {
    const reducer = (state, action) => state;
    
    function Component() {
      const [state] = useReducer(reducer, 10);
      return state;
    }
    
    const { result } = renderHook(() => Component());
    expect(result.current).toBe(10);
  });
  
  test('dispatch更新状态', () => {
    const reducer = (state, action) => {
      if (action.type === 'increment') {
        return state + 1;
      }
      return state;
    };
    
    function Component() {
      const [state, dispatch] = useReducer(reducer, 0);
      return { state, dispatch };
    }
    
    const { result } = renderHook(() => Component());
    
    expect(result.current.state).toBe(0);
    
    act(() => {
      result.current.dispatch({ type: 'increment' });
    });
    
    expect(result.current.state).toBe(1);
  });
  
  test('惰性初始化', () => {
    const init = jest.fn(initialCount => ({ count: initialCount }));
    const reducer = (state, action) => state;
    
    function Component() {
      const [state] = useReducer(reducer, 0, init);
      return state;
    }
    
    const { result, rerender } = renderHook(() => Component());
    
    expect(init).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({ count: 0 });
    
    rerender();
    expect(init).toHaveBeenCalledTimes(1); // 只调用一次
  });
});
```

## 8. 面试高频问题

```typescript
const interviewQA = {
  Q1: {
    question: 'useReducer的实现原理?',
    answer: [
      '1. mount时初始化状态和队列',
      '2. 创建dispatch函数',
      '3. update时处理更新队列',
      '4. 执行reducer计算新状态',
      '5. 支持优先级和批量更新',
      '6. dispatch引用永远不变'
    ]
  },
  
  Q2: {
    question: 'useReducer和useState的区别?',
    answer: `
      useState:
      - 简单状态管理
      - 直接设置新值
      - 适合独立状态
      
      useReducer:
      - 复杂状态逻辑
      - 通过action更新
      - 适合相关联的状态
      - reducer可测试
      - 类似Redux
      
      关系: useState是useReducer的特例
    `
  },
  
  Q3: {
    question: '何时使用useReducer?',
    answer: [
      '1. 状态逻辑复杂',
      '2. 包含多个子值',
      '3. 下一个状态依赖前一个',
      '4. 需要深层更新',
      '5. 状态转换可预测',
      '6. 需要单元测试reducer'
    ]
  },
  
  Q4: {
    question: 'dispatch为什么引用稳定?',
    answer: `
      dispatch在mount时创建，
      使用bind绑定fiber和queue，
      update时复用相同的dispatch，
      引用永远不变。
      
      优势:
      - 可以安全地用在依赖数组
      - 传递给子组件不会导致重渲染
      - 不需要useCallback包裹
    `
  },
  
  Q5: {
    question: 'useReducer如何处理副作用?',
    answer: `
      reducer必须是纯函数，
      不应该有副作用。
      
      副作用应该在:
      1. useEffect中处理
      2. 事件处理器中
      3. middleware中（如Redux）
      
      不要在reducer中:
      - 发起API请求
      - 修改DOM
      - 使用随机数
      - 读取外部状态
    `
  }
};
```

## 9. 总结

useReducer手写实现的核心要点:

1. **数据结构**: Hook节点 + 更新队列
2. **初始化**: 支持惰性初始化
3. **dispatch**: 创建更新对象入队
4. **更新处理**: 遍历队列执行reducer
5. **优先级**: 支持跳过低优先级更新
6. **性能**: dispatch引用稳定
7. **与useState关系**: useState是特殊的useReducer

理解useReducer是掌握React复杂状态管理的关键。

