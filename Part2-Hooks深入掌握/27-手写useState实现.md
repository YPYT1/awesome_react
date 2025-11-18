# 手写useState实现

## 学习目标

通过本章学习，你将深入理解：

- useState的内部工作原理
- Hook状态的存储机制
- 更新队列的处理流程
- 批量更新的实现
- 函数式更新的原理
- useState与Fiber的关系
- 手写简化版useState
- React 19的优化实现

## 第一部分：useState基础回顾

### 1.1 useState的使用

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(c => c + 1)}>+1 (函数式)</button>
    </div>
  );
}
```

### 1.2 useState的特点

```jsx
// 1. 状态持久化 - 状态在重新渲染间保持
// 2. 触发重渲染 - 调用setState会触发组件重新渲染
// 3. 异步更新 - setState是异步的
// 4. 批量更新 - 多个setState会被批处理
// 5. 函数式更新 - 支持基于前一个state更新
```

## 第二部分：核心数据结构

### 2.1 Hook对象结构

```javascript
// useState创建的Hook对象
type Hook = {
  // 存储当前state值
  memoizedState: any,
  
  // 基础state（用于优先级更新）
  baseState: any,
  
  // 基础更新队列
  baseQueue: Update<any> | null,
  
  // 更新队列
  queue: UpdateQueue<any> | null,
  
  // 指向下一个Hook
  next: Hook | null
};

// 更新队列结构
type UpdateQueue<S> = {
  // 待处理的更新（环形链表）
  pending: Update<S> | null,
  
  // dispatch函数（即setState）
  dispatch: Dispatch<S> | null,
  
  // 最后渲染的reducer（对于useState就是basicStateReducer）
  lastRenderedReducer: ((S, A) => S) | null,
  
  // 最后渲染的state
  lastRenderedState: S | null
};

// 单个更新对象
type Update<S> = {
  // 更新的action（新值或函数）
  action: S | ((prevState: S) => S),
  
  // 下一个更新（环形链表）
  next: Update<S>
};
```

### 2.2 全局变量

```javascript
// React维护的全局变量
let currentlyRenderingFiber = null;  // 当前渲染的Fiber节点
let currentHook = null;              // current树的Hook指针
let workInProgressHook = null;       // workInProgress树的Hook指针
```

## 第三部分：mountState实现

### 3.1 初始化阶段

```javascript
// 简化的mountState实现
function mountState(initialState) {
  // 1. 创建Hook对象
  const hook = mountWorkInProgressHook();
  
  // 2. 处理初始state
  if (typeof initialState === 'function') {
    // 惰性初始化
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  
  // 3. 创建更新队列
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  hook.queue = queue;
  
  // 4. 创建dispatch函数
  const dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  );
  queue.dispatch = dispatch;
  
  // 5. 返回state和dispatch
  return [hook.memoizedState, dispatch];
}

// 创建并挂载Hook
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  
  if (workInProgressHook === null) {
    // 第一个Hook，挂载到Fiber
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 后续Hook，添加到链表末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return workInProgressHook;
}

// 基础state reducer
function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}
```

### 3.2 完整示例

```javascript
// 示例：两个useState的初始化
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  
  return <div>{count} - {name}</div>;
}

// 执行流程：
// 1. 调用useState(0)
//    → mountState(0)
//    → 创建Hook1 { memoizedState: 0, queue: {...}, next: null }
//    → Fiber.memoizedState = Hook1
//    → 返回 [0, dispatch1]

// 2. 调用useState('Alice')
//    → mountState('Alice')
//    → 创建Hook2 { memoizedState: 'Alice', queue: {...}, next: null }
//    → Hook1.next = Hook2
//    → 返回 ['Alice', dispatch2]

// Fiber结构：
// Fiber.memoizedState → Hook1 → Hook2 → null
```

## 第四部分：dispatchSetState实现

### 4.1 dispatch函数

```javascript
function dispatchSetState(fiber, queue, action) {
  // 1. 创建update对象
  const update = {
    action,
    next: null
  };
  
  // 2. 将update添加到队列（环形链表）
  const pending = queue.pending;
  if (pending === null) {
    // 第一个update，指向自己形成环
    update.next = update;
  } else {
    // 插入到环形链表中
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
  
  // 3. 计算新状态（急切更新优化）
  const lastRenderedReducer = queue.lastRenderedReducer;
  if (lastRenderedReducer !== null) {
    try {
      const currentState = queue.lastRenderedState;
      const eagerState = lastRenderedReducer(currentState, action);
      
      // 如果状态没变，不触发更新
      if (Object.is(eagerState, currentState)) {
        return;
      }
    } catch (error) {
      // 忽略错误，继续正常流程
    }
  }
  
  // 4. 调度更新
  scheduleUpdateOnFiber(fiber);
}

// 简化的调度函数
function scheduleUpdateOnFiber(fiber) {
  // 标记fiber需要更新
  markUpdateLaneFromFiberToRoot(fiber);
  
  // 调度渲染
  ensureRootIsScheduled(fiber.root);
}
```

### 4.2 更新队列示例

```javascript
// 示例：多次调用setState
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);  // update1
    setCount(count + 1);  // update2
    setCount(c => c + 1); // update3
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 点击后的更新队列（环形链表）：
// queue.pending → update3
//                   ↓
// update1 ← update2 ←┘
//   ↓_________________↑

// 队列遍历：
// 从update3.next开始：update1 → update2 → update3
```

## 第五部分：updateState实现

### 5.1 更新阶段

```javascript
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}

function updateReducer(reducer, initialArg) {
  // 1. 获取对应的Hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  
  queue.lastRenderedReducer = reducer;
  
  // 2. 获取current Hook
  const current = currentHook;
  
  // 3. 处理更新队列
  const pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    // 有待处理的更新
    
    // 3.1 获取第一个update
    const first = pendingQueue.next;
    let newState = current.memoizedState;
    let update = first;
    
    // 3.2 遍历更新链表，计算新state
    do {
      const action = update.action;
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== first);
    
    // 3.3 清空pending队列
    queue.pending = null;
    
    // 3.4 更新Hook状态
    hook.memoizedState = newState;
    hook.baseState = newState;
    
    queue.lastRenderedState = newState;
  }
  
  // 4. 返回state和dispatch
  const dispatch = queue.dispatch;
  return [hook.memoizedState, dispatch];
}

// 获取并更新workInProgress Hook
function updateWorkInProgressHook() {
  // 从current树获取对应Hook
  let nextCurrentHook;
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    nextCurrentHook = current.memoizedState;
  } else {
    nextCurrentHook = currentHook.next;
  }
  
  // 移动current指针
  currentHook = nextCurrentHook;
  
  // 创建workInProgress Hook
  const newHook = {
    memoizedState: currentHook.memoizedState,
    baseState: currentHook.baseState,
    baseQueue: currentHook.baseQueue,
    queue: currentHook.queue,
    next: null
  };
  
  // 添加到workInProgress链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }
  
  return workInProgressHook;
}
```

### 5.2 更新流程示例

```javascript
// 完整的更新流程
function Component() {
  const [count, setCount] = useState(0);
  
  // 用户点击，执行setCount(5)
  return <button onClick={() => setCount(5)}>{count}</button>;
}

// 执行流程：
// 1. 点击按钮
//    ↓
// 2. setCount(5)
//    ↓
// 3. dispatchSetState(fiber, queue, 5)
//    ↓
// 4. 创建update: { action: 5, next: ... }
//    ↓
// 5. 添加到queue.pending
//    ↓
// 6. scheduleUpdateOnFiber(fiber)
//    ↓
// 7. 组件重新渲染
//    ↓
// 8. 调用useState(0)
//    ↓
// 9. updateState(0)
//    ↓
// 10. 从queue.pending获取update
//    ↓
// 11. 计算新state: basicStateReducer(0, 5) = 5
//    ↓
// 12. hook.memoizedState = 5
//    ↓
// 13. 返回 [5, dispatch]
//    ↓
// 14. 渲染显示5
```

## 第六部分：批量更新实现

### 6.1 批处理机制

```javascript
// 批处理上下文
let isBatchingUpdates = false;
const updateQueue = [];

function batchedUpdates(fn) {
  const prevIsBatching = isBatchingUpdates;
  isBatchingUpdates = true;
  
  try {
    return fn();
  } finally {
    isBatchingUpdates = prevIsBatching;
    
    if (!isBatchingUpdates && updateQueue.length > 0) {
      // 批量处理所有更新
      flushUpdates();
    }
  }
}

function dispatchSetState(fiber, queue, action) {
  const update = {
    action,
    next: null
  };
  
  // 添加到queue
  enqueueUpdate(queue, update);
  
  if (isBatchingUpdates) {
    // 批处理中，只收集更新
    updateQueue.push(fiber);
  } else {
    // 立即调度更新
    scheduleUpdateOnFiber(fiber);
  }
}

function flushUpdates() {
  // 批量处理收集的更新
  const fibers = new Set(updateQueue);
  updateQueue.length = 0;
  
  fibers.forEach(fiber => {
    scheduleUpdateOnFiber(fiber);
  });
}

// React事件处理器自动批处理
function dispatchEvent(event) {
  // React合成事件自动包裹batchedUpdates
  batchedUpdates(() => {
    // 执行用户的事件处理器
    invokeGuardedCallback(event);
  });
}
```

### 6.2 批处理示例

```javascript
function Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  const handleClick = () => {
    // React 18+: 自动批处理
    setCount(c => c + 1);  // 不会立即重渲染
    setFlag(f => !f);      // 不会立即重渲染
    setCount(c => c + 1);  // 不会立即重渲染
    // 批量处理后只触发一次重渲染
  };
  
  const handleAsync = () => {
    setTimeout(() => {
      // React 18+: 异步也会批处理
      setCount(c => c + 1);
      setFlag(f => !f);
      // 只触发一次重渲染
    }, 1000);
  };
  
  return (
    <div>
      <p>{count} - {flag ? 'true' : 'false'}</p>
      <button onClick={handleClick}>同步更新</button>
      <button onClick={handleAsync}>异步更新</button>
    </div>
  );
}
```

## 第七部分：简化版实现

### 7.1 完整的简化实现

```javascript
// 全局变量
let currentFiber = null;
let hookIndex = 0;

// 简化的useState实现
function useState(initialState) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = hookIndex++;
  
  // 初始化Hook
  if (!hooks[index]) {
    hooks[index] = {
      state: typeof initialState === 'function' 
        ? initialState() 
        : initialState,
      queue: []
    };
  }
  
  const hook = hooks[index];
  
  // 处理更新队列
  hook.queue.forEach(action => {
    hook.state = typeof action === 'function'
      ? action(hook.state)
      : action;
  });
  hook.queue = [];
  
  // setState函数
  const setState = (action) => {
    hook.queue.push(action);
    scheduleRender(fiber);
  };
  
  return [hook.state, setState];
}

// 调度渲染
function scheduleRender(fiber) {
  // 简化版：立即重新渲染
  requestIdleCallback(() => {
    hookIndex = 0;  // 重置Hook索引
    currentFiber = fiber;
    fiber.render();  // 重新执行组件函数
  });
}

// 使用示例
function createComponent(renderFn) {
  const fiber = {
    hooks: null,
    render: () => {
      hookIndex = 0;
      currentFiber = fiber;
      return renderFn();
    }
  };
  
  return fiber;
}

// 组件
const CounterFiber = createComponent(() => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  
  console.log(`Render: count=${count}, name=${name}`);
  
  return {
    count,
    name,
    increment: () => setCount(c => c + 1),
    changeName: () => setName('Bob')
  };
});

// 初始渲染
let result = CounterFiber.render();
console.log(result);  // { count: 0, name: 'Alice', ... }

// 更新
result.increment();
// 触发重渲染，输出：Render: count=1, name=Alice

result.changeName();
// 触发重渲染，输出：Render: count=1, name=Bob
```

### 7.2 支持批处理的版本

```javascript
// 批处理版本
let updateQueue = [];
let isBatching = false;

function batchedUpdates(fn) {
  isBatching = true;
  fn();
  isBatching = false;
  
  // 批量处理更新
  if (updateQueue.length > 0) {
    const fibers = [...new Set(updateQueue)];
    updateQueue = [];
    fibers.forEach(fiber => fiber.render());
  }
}

function scheduleRender(fiber) {
  if (isBatching) {
    updateQueue.push(fiber);
  } else {
    requestIdleCallback(() => {
      hookIndex = 0;
      currentFiber = fiber;
      fiber.render();
    });
  }
}

// 使用
batchedUpdates(() => {
  result.increment();  // 不立即渲染
  result.increment();  // 不立即渲染
  result.changeName(); // 不立即渲染
  // 退出batchedUpdates后，批量处理，只渲染一次
});
```

## 注意事项

### 1. 状态不可变

```javascript
// ❌ 错误：直接修改state
const [user, setUser] = useState({ name: 'Alice' });
user.name = 'Bob';  // 不会触发更新
setUser(user);      // 引用相同，不会重渲染

// ✅ 正确：创建新对象
setUser({ ...user, name: 'Bob' });
```

### 2. 异步更新

```javascript
// setState是异步的
const [count, setCount] = useState(0);

setCount(1);
console.log(count);  // 仍然是0

// 使用函数式更新访问最新值
setCount(c => {
  console.log(c);  // 最新值
  return c + 1;
});
```

### 3. 批处理

```javascript
// React自动批处理
function handleClick() {
  setCount(c => c + 1);  // 更新1
  setCount(c => c + 1);  // 更新2
  // 只触发一次渲染
}
```

## 常见问题

### Q1: 为什么setState是异步的？

**A:** 
- 性能优化：批量处理多个更新
- 一致性：保证props和state的一致性
- 未来优化：支持异步渲染

### Q2: 函数式更新和直接更新的区别？

**A:**
```javascript
// 直接更新：依赖当前闭包中的state
setCount(count + 1);

// 函数式更新：总是使用最新的state
setCount(c => c + 1);
```

### Q3: 如何实现立即更新？

**A:**
```javascript
// React没有提供立即更新的API
// 但可以使用flushSync（慎用）
import { flushSync } from 'react-dom';

flushSync(() => {
  setCount(1);
});
console.log(count);  // 1
```

## 总结

### useState实现要点

1. **数据结构**：Hook对象、更新队列、环形链表
2. **初始化**：mountState创建Hook并挂载到Fiber
3. **更新**：updateState处理更新队列
4. **调度**：dispatchSetState触发组件重渲染
5. **批处理**：自动批量处理多个更新
6. **优化**：急切更新、对象比较

### 核心流程

```
useState(0)
  ↓
首次: mountState
  ↓
创建Hook对象
  ↓
返回 [state, setState]
  ↓
setState(newValue)
  ↓
创建update对象
  ↓
添加到更新队列
  ↓
调度渲染
  ↓
组件重渲染
  ↓
updateState
  ↓
处理更新队列
  ↓
计算新state
  ↓
返回 [newState, setState]
```

理解useState的实现原理，有助于我们更好地使用它，避免常见陷阱，写出高质量的React代码！
