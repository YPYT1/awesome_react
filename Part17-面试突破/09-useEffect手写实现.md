# useEffect手写实现 - 副作用管理深度解析

## 1. useEffect原理概述

### 1.1 核心概念

```typescript
const useEffectOverview = {
  作用: '在函数组件中执行副作用操作',
  
  基本用法: `
    useEffect(() => {
      // 副作用逻辑
      return () => {
        // 清理函数
      };
    }, [dependencies]);
  `,
  
  副作用类型: [
    '数据获取',
    '订阅设置',
    'DOM操作',
    '定时器',
    '日志记录'
  ],
  
  执行时机: {
    mount: '组件挂载后',
    update: '依赖变化后',
    unmount: '组件卸载前执行清理'
  },
  
  与useLayoutEffect区别: {
    useEffect: '异步执行，不阻塞渲染',
    useLayoutEffect: '同步执行，阻塞渲染'
  }
};
```

### 1.2 Effect数据结构

```typescript
// Effect标记
type HookFlags = number;

const HookHasEffect = 0b001;      // 有副作用
const HookPassive = 0b010;        // useEffect
const HookLayout = 0b100;         // useLayoutEffect

// Effect对象
interface Effect {
  tag: HookFlags;
  create: () => (() => void) | void;
  destroy: (() => void) | void;
  deps: Array<any> | null;
  next: Effect;
}

// UpdateQueue存储Effect链表
interface FunctionComponentUpdateQueue {
  lastEffect: Effect | null;
}

// Hook节点
interface Hook {
  memoizedState: Effect | null;  // 当前effect
  baseState: null;
  baseQueue: null;
  queue: null;
  next: Hook | null;
}
```

## 2. mount阶段实现

### 2.1 mountEffect

```typescript
/**
 * mount阶段的useEffect
 */
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps
  );
}

/**
 * mount阶段的useLayoutEffect
 */
function mountLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  return mountEffectImpl(
    UpdateEffect,
    HookLayout,
    create,
    deps
  );
}

/**
 * mount阶段effect实现
 */
function mountEffectImpl(
  fiberFlags: Flags,
  hookFlags: HookFlags,
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  // 创建Hook节点
  const hook = mountWorkInProgressHook();
  
  const nextDeps = deps === undefined ? null : deps;
  
  // 标记fiber有副作用
  currentlyRenderingFiber.flags |= fiberFlags;
  
  // 创建effect并添加到链表
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps
  );
}
```

### 2.2 pushEffect

```typescript
/**
 * 创建effect并添加到环形链表
 */
function pushEffect(
  tag: HookFlags,
  create: () => (() => void) | void,
  destroy: (() => void) | void | undefined,
  deps: Array<any> | null
): Effect {
  // 创建effect对象
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    next: null as any
  };
  
  // 获取或创建updateQueue
  let componentUpdateQueue: FunctionComponentUpdateQueue | null = 
    currentlyRenderingFiber.updateQueue as any;
  
  if (componentUpdateQueue === null) {
    // 创建新队列
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue as any;
    
    // 创建环形链表
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    // 添加到现有链表
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

/**
 * 创建函数组件更新队列
 */
function createFunctionComponentUpdateQueue(): FunctionComponentUpdateQueue {
  return {
    lastEffect: null
  };
}
```

### 2.3 环形链表结构

```typescript
// Effect环形链表示例
const effectListExample = {
  结构: `
    function Component() {
      useEffect(() => {
        console.log('Effect 1');
      }, []);
      
      useEffect(() => {
        console.log('Effect 2');
      }, [count]);
      
      useEffect(() => {
        console.log('Effect 3');
      }, [name]);
    }
    
    // updateQueue.lastEffect 环形链表:
    //     ┌─────────────────┐
    //     ↓                 │
    // Effect3 → Effect1 → Effect2
    //                       ↑
    //                  lastEffect
  `,
  
  优势: [
    '方便遍历所有effects',
    '从lastEffect.next开始就是第一个effect',
    '便于插入新effect',
    '保持插入顺序'
  ]
};
```

## 3. update阶段实现

### 3.1 updateEffect

```typescript
/**
 * update阶段的useEffect
 */
function updateEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  return updateEffectImpl(
    PassiveEffect,
    HookPassive,
    create,
    deps
  );
}

/**
 * update阶段的useLayoutEffect
 */
function updateLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  return updateEffectImpl(
    UpdateEffect,
    HookLayout,
    create,
    deps
  );
}

/**
 * update阶段effect实现
 */
function updateEffectImpl(
  fiberFlags: Flags,
  hookFlags: HookFlags,
  create: () => (() => void) | void,
  deps: Array<any> | void | null
): void {
  const hook = updateWorkInProgressHook();
  
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState as Effect;
    destroy = prevEffect.destroy;
    
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      
      // 比较依赖
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变，不需要执行effect
        hook.memoizedState = pushEffect(
          hookFlags,  // 注意：没有HookHasEffect标记
          create,
          destroy,
          nextDeps
        );
        return;
      }
    }
  }
  
  // 依赖变化，需要执行effect
  currentlyRenderingFiber.flags |= fiberFlags;
  
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,  // 有HookHasEffect标记
    create,
    destroy,
    nextDeps
  );
}
```

### 3.2 依赖比较

```typescript
/**
 * 比较effect依赖是否相等
 */
function areHookInputsEqual(
  nextDeps: Array<any>,
  prevDeps: Array<any> | null
): boolean {
  if (prevDeps === null) {
    return false;
  }
  
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  
  return true;
}

// 依赖比较示例
const dependencyComparison = {
  相等情况: `
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      console.log('Effect');
    }, [count]);
    
    // count不变时，不执行effect
  `,
  
  不相等情况: `
    useEffect(() => {
      console.log('Effect');
    }, [{ id: 1 }]);
    
    // 每次渲染都创建新对象，总是不相等
    // 导致effect每次都执行
  `,
  
  最佳实践: `
    // ✓ 使用基本类型
    useEffect(() => {}, [count, name]);
    
    // ✓ 使用稳定引用
    const user = useMemo(() => ({ id: 1 }), []);
    useEffect(() => {}, [user]);
    
    // ❌ 避免每次创建新对象
    useEffect(() => {}, [{ id: 1 }]);
  `
};
```

## 4. Effect执行时机

### 4.1 commit阶段流程

```typescript
/**
 * commit阶段处理effects
 */
function commitRoot(root: FiberRoot) {
  const finishedWork = root.finishedWork;
  
  // 阶段1: before mutation
  commitBeforeMutationEffects(root, finishedWork);
  
  // 阶段2: mutation (DOM操作)
  commitMutationEffects(root, finishedWork);
  
  // 切换current树
  root.current = finishedWork;
  
  // 阶段3: layout (同步执行useLayoutEffect)
  commitLayoutEffects(finishedWork, root);
  
  // 调度useEffect (异步执行)
  schedulePassiveEffects(finishedWork);
}

/**
 * layout阶段执行useLayoutEffect
 */
function commitLayoutEffects(finishedWork: Fiber, root: FiberRoot) {
  const flags = finishedWork.flags;
  
  if (flags & LayoutMask) {
    switch (finishedWork.tag) {
      case FunctionComponent:
        commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
        break;
    }
  }
  
  // 递归子节点
  const child = finishedWork.child;
  if (child !== null) {
    commitLayoutEffects(child, root);
  }
  
  // 遍历兄弟节点
  const sibling = finishedWork.sibling;
  if (sibling !== null) {
    commitLayoutEffects(sibling, root);
  }
}

/**
 * 调度useEffect
 */
function schedulePassiveEffects(finishedWork: Fiber) {
  const updateQueue = finishedWork.updateQueue as FunctionComponentUpdateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      const { next, tag } = effect;
      
      if ((tag & HookPassive) !== NoHookEffect) {
        // 收集需要执行的passive effects
        enqueuePendingPassiveHookEffectUnmount(finishedWork, effect);
        enqueuePendingPassiveHookEffectMount(finishedWork, effect);
      }
      
      effect = next;
    } while (effect !== firstEffect);
  }
}
```

### 4.2 异步执行useEffect

```typescript
// passive effects队列
let pendingPassiveHookEffectsUnmount: Array<Effect> = [];
let pendingPassiveHookEffectsMount: Array<Effect> = [];

/**
 * 入队unmount effects
 */
function enqueuePendingPassiveHookEffectUnmount(
  fiber: Fiber,
  effect: Effect
): void {
  pendingPassiveHookEffectsUnmount.push(effect);
  
  if (!rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = true;
    scheduleCallback(NormalPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
}

/**
 * 入队mount effects
 */
function enqueuePendingPassiveHookEffectMount(
  fiber: Fiber,
  effect: Effect
): void {
  pendingPassiveHookEffectsMount.push(effect);
}

/**
 * 刷新passive effects
 */
function flushPassiveEffects(): boolean {
  if (pendingPassiveHookEffectsUnmount.length > 0) {
    const unmountEffects = pendingPassiveHookEffectsUnmount;
    pendingPassiveHookEffectsUnmount = [];
    
    // 执行清理函数
    for (let i = 0; i < unmountEffects.length; i++) {
      const effect = unmountEffects[i];
      const destroy = effect.destroy;
      
      if (typeof destroy === 'function') {
        try {
          destroy();
        } catch (error) {
          captureCommitPhaseError(fiber, error);
        }
      }
    }
  }
  
  if (pendingPassiveHookEffectsMount.length > 0) {
    const mountEffects = pendingPassiveHookEffectsMount;
    pendingPassiveHookEffectsMount = [];
    
    // 执行effect
    for (let i = 0; i < mountEffects.length; i++) {
      const effect = mountEffects[i];
      const create = effect.create;
      
      try {
        const destroy = create();
        if (typeof destroy === 'function') {
          effect.destroy = destroy;
        }
      } catch (error) {
        captureCommitPhaseError(fiber, error);
      }
    }
  }
  
  return true;
}
```

### 4.3 执行顺序

```typescript
const effectExecutionOrder = {
  示例代码: `
    function Parent() {
      useLayoutEffect(() => {
        console.log('Parent layoutEffect');
        return () => console.log('Parent layoutEffect cleanup');
      });
      
      useEffect(() => {
        console.log('Parent effect');
        return () => console.log('Parent effect cleanup');
      });
      
      return <Child />;
    }
    
    function Child() {
      useLayoutEffect(() => {
        console.log('Child layoutEffect');
        return () => console.log('Child layoutEffect cleanup');
      });
      
      useEffect(() => {
        console.log('Child effect');
        return () => console.log('Child effect cleanup');
      });
      
      return <div>Child</div>;
    }
  `,
  
  mount时输出: [
    '1. Child layoutEffect',
    '2. Parent layoutEffect',
    '3. Child effect',
    '4. Parent effect'
  ],
  
  update时输出: [
    '1. Child layoutEffect cleanup',
    '2. Parent layoutEffect cleanup',
    '3. Child layoutEffect',
    '4. Parent layoutEffect',
    '5. Child effect cleanup',
    '6. Parent effect cleanup',
    '7. Child effect',
    '8. Parent effect'
  ],
  
  unmount时输出: [
    '1. Child layoutEffect cleanup',
    '2. Parent layoutEffect cleanup',
    '3. Child effect cleanup',
    '4. Parent effect cleanup'
  ],
  
  规律: [
    'layoutEffect：子组件先于父组件',
    'effect：子组件先于父组件',
    'cleanup：在effect执行前',
    'layoutEffect同步，effect异步'
  ]
};
```

## 5. 清理函数实现

### 5.1 cleanup执行

```typescript
/**
 * 执行effect cleanup
 */
function commitHookEffectListUnmount(
  tag: HookFlags,
  finishedWork: Fiber
): void {
  const updateQueue = finishedWork.updateQueue as FunctionComponentUpdateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & tag) === tag) {
        // 执行cleanup
        const destroy = effect.destroy;
        effect.destroy = undefined;
        
        if (destroy !== undefined) {
          try {
            destroy();
          } catch (error) {
            captureCommitPhaseError(finishedWork, error);
          }
        }
      }
      
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

/**
 * 执行effect create
 */
function commitHookEffectListMount(
  tag: HookFlags,
  finishedWork: Fiber
): void {
  const updateQueue = finishedWork.updateQueue as FunctionComponentUpdateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & tag) === tag) {
        // 执行effect
        const create = effect.create;
        
        try {
          const destroy = create();
          effect.destroy = destroy;
        } catch (error) {
          captureCommitPhaseError(finishedWork, error);
        }
      }
      
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

### 5.2 cleanup时机

```typescript
const cleanupTiming = {
  useEffect: {
    cleanup执行时机: '下次effect执行前（异步）',
    示例: `
      useEffect(() => {
        const timer = setInterval(() => {
          console.log('tick');
        }, 1000);
        
        return () => {
          clearInterval(timer); // cleanup
        };
      }, []);
    `
  },
  
  useLayoutEffect: {
    cleanup执行时机: 'DOM更新后，浏览器绘制前（同步）',
    示例: `
      useLayoutEffect(() => {
        const element = ref.current;
        element.style.color = 'red';
        
        return () => {
          element.style.color = ''; // cleanup
        };
      }, []);
    `
  },
  
  组件卸载: {
    时机: '组件从DOM移除前',
    顺序: 'layoutEffect cleanup → effect cleanup'
  }
};
```

## 6. 常见问题和解决方案

### 6.1 无限循环

```typescript
// 问题：无限循环
const infiniteLoop = {
  错误示例: `
    function Component() {
      const [count, setCount] = useState(0);
      
      useEffect(() => {
        setCount(count + 1); // 导致无限循环
      }, [count]); // count变化触发effect，effect又改变count
      
      return <div>{count}</div>;
    }
  `,
  
  解决方案1: `
    // 移除依赖（只在mount时执行）
    useEffect(() => {
      setCount(c => c + 1);
    }, []); // 空依赖
  `,
  
  解决方案2: `
    // 使用条件判断
    useEffect(() => {
      if (count < 10) {
        setCount(count + 1);
      }
    }, [count]);
  `,
  
  解决方案3: `
    // 重新设计逻辑
    const [count, setCount] = useState(0);
    const [trigger, setTrigger] = useState(false);
    
    useEffect(() => {
      if (trigger) {
        setCount(c => c + 1);
        setTrigger(false);
      }
    }, [trigger]);
  `
};
```

### 6.2 闭包陷阱

```typescript
const closureTrap = {
  问题: `
    function Component() {
      const [count, setCount] = useState(0);
      
      useEffect(() => {
        const timer = setInterval(() => {
          console.log(count); // 总是打印初始值0
        }, 1000);
        
        return () => clearInterval(timer);
      }, []); // 空依赖，闭包捕获初始count
      
      return (
        <button onClick={() => setCount(c => c + 1)}>
          {count}
        </button>
      );
    }
  `,
  
  解决方案1: `
    // 使用ref
    const countRef = useRef(count);
    countRef.current = count;
    
    useEffect(() => {
      const timer = setInterval(() => {
        console.log(countRef.current); // 总是最新值
      }, 1000);
      
      return () => clearInterval(timer);
    }, []);
  `,
  
  解决方案2: `
    // 添加到依赖
    useEffect(() => {
      const timer = setInterval(() => {
        console.log(count);
      }, 1000);
      
      return () => clearInterval(timer);
    }, [count]); // count变化时重建定时器
  `,
  
  解决方案3: `
    // 使用函数式更新
    useEffect(() => {
      const timer = setInterval(() => {
        setCount(c => {
          console.log(c); // 获取最新值
          return c;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }, []);
  `
};
```

### 6.3 异步竞态条件

```typescript
const raceCondition = {
  问题: `
    function Component({ id }) {
      const [data, setData] = useState(null);
      
      useEffect(() => {
        fetchData(id).then(result => {
          setData(result); // 可能设置过期的数据
        });
      }, [id]);
      
      // 如果id快速变化：
      // id=1 -> 发起请求1
      // id=2 -> 发起请求2
      // 请求2先返回 -> setData(data2)
      // 请求1后返回 -> setData(data1) // 错误！
    }
  `,
  
  解决方案1: `
    // 使用cleanup取消
    useEffect(() => {
      let cancelled = false;
      
      fetchData(id).then(result => {
        if (!cancelled) {
          setData(result);
        }
      });
      
      return () => {
        cancelled = true;
      };
    }, [id]);
  `,
  
  解决方案2: `
    // 使用AbortController
    useEffect(() => {
      const controller = new AbortController();
      
      fetch(url, { signal: controller.signal })
        .then(res => res.json())
        .then(setData)
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error(err);
          }
        });
      
      return () => {
        controller.abort();
      };
    }, [url]);
  `,
  
  解决方案3: `
    // 使用最新的请求ID
    useEffect(() => {
      let latestId = id;
      
      fetchData(id).then(result => {
        if (id === latestId) {
          setData(result);
        }
      });
      
      return () => {
        latestId = null;
      };
    }, [id]);
  `
};
```

## 7. 性能优化

### 7.1 依赖优化

```typescript
const dependencyOptimization = {
  问题: `
    function Component() {
      const [count, setCount] = useState(0);
      const config = { threshold: 10 }; // 每次渲染都创建新对象
      
      useEffect(() => {
        if (count > config.threshold) {
          console.log('Threshold exceeded');
        }
      }, [count, config]); // config每次都变，effect总是执行
    }
  `,
  
  优化1: `
    // 移到组件外
    const config = { threshold: 10 };
    
    function Component() {
      const [count, setCount] = useState(0);
      
      useEffect(() => {
        if (count > config.threshold) {
          console.log('Threshold exceeded');
        }
      }, [count]); // 只依赖count
    }
  `,
  
  优化2: `
    // 使用useMemo
    function Component() {
      const [count, setCount] = useState(0);
      const config = useMemo(() => ({ threshold: 10 }), []);
      
      useEffect(() => {
        if (count > config.threshold) {
          console.log('Threshold exceeded');
        }
      }, [count, config]); // config稳定
    }
  `,
  
  优化3: `
    // 解构需要的值
    function Component({ user }) {
      const userId = user.id; // 提取需要的值
      
      useEffect(() => {
        fetchUserData(userId);
      }, [userId]); // 只依赖id而非整个user对象
    }
  `
};
```

### 7.2 避免不必要的effect

```typescript
const avoidUnnecessaryEffects = {
  问题: `
    function Component({ items }) {
      const [total, setTotal] = useState(0);
      
      // ❌ 不好：使用effect计算派生状态
      useEffect(() => {
        setTotal(items.reduce((sum, item) => sum + item.price, 0));
      }, [items]);
      
      return <div>Total: {total}</div>;
    }
  `,
  
  优化: `
    function Component({ items }) {
      // ✓ 好：直接计算
      const total = items.reduce((sum, item) => sum + item.price, 0);
      
      return <div>Total: {total}</div>;
    }
  `,
  
  或者: `
    function Component({ items }) {
      // ✓ 好：使用useMemo
      const total = useMemo(
        () => items.reduce((sum, item) => sum + item.price, 0),
        [items]
      );
      
      return <div>Total: {total}</div>;
    }
  `
};
```

## 8. 测试用例

```typescript
describe('useEffect', () => {
  test('mount时执行', () => {
    const effect = jest.fn();
    
    function Component() {
      useEffect(effect);
      return null;
    }
    
    render(<Component />);
    
    expect(effect).toHaveBeenCalledTimes(1);
  });
  
  test('依赖变化时执行', () => {
    const effect = jest.fn();
    
    function Component({ count }) {
      useEffect(effect, [count]);
      return null;
    }
    
    const { rerender } = render(<Component count={0} />);
    expect(effect).toHaveBeenCalledTimes(1);
    
    rerender(<Component count={1} />);
    expect(effect).toHaveBeenCalledTimes(2);
    
    rerender(<Component count={1} />);
    expect(effect).toHaveBeenCalledTimes(2); // 依赖未变
  });
  
  test('cleanup执行', () => {
    const cleanup = jest.fn();
    const effect = jest.fn(() => cleanup);
    
    function Component({ count }) {
      useEffect(effect, [count]);
      return null;
    }
    
    const { rerender, unmount } = render(<Component count={0} />);
    
    rerender(<Component count={1} />);
    expect(cleanup).toHaveBeenCalledTimes(1); // update前cleanup
    
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2); // unmount时cleanup
  });
  
  test('空依赖只执行一次', () => {
    const effect = jest.fn();
    
    function Component() {
      useEffect(effect, []);
      return null;
    }
    
    const { rerender } = render(<Component />);
    rerender(<Component />);
    rerender(<Component />);
    
    expect(effect).toHaveBeenCalledTimes(1); // 只在mount时
  });
  
  test('无依赖每次都执行', () => {
    const effect = jest.fn();
    
    function Component() {
      useEffect(effect); // 无deps参数
      return null;
    }
    
    const { rerender } = render(<Component />);
    rerender(<Component />);
    rerender(<Component />);
    
    expect(effect).toHaveBeenCalledTimes(3); // 每次都执行
  });
});
```

## 9. 面试高频问题

```typescript
const useEffectInterviewQA = {
  Q1: {
    question: 'useEffect的执行时机?',
    answer: [
      '1. mount：组件渲染完成后异步执行',
      '2. update：依赖变化后异步执行',
      '3. unmount：组件卸载前执行cleanup',
      '4. 不阻塞浏览器渲染',
      '5. 在commit阶段之后调度'
    ]
  },
  
  Q2: {
    question: 'useEffect和useLayoutEffect的区别?',
    answer: `
      useEffect:
      - 异步执行，不阻塞渲染
      - 适合大多数副作用
      - 在浏览器绘制后执行
      
      useLayoutEffect:
      - 同步执行，阻塞渲染
      - 适合DOM测量、同步更新
      - 在浏览器绘制前执行
      - 等同于componentDidMount/Update
    `
  },
  
  Q3: {
    question: 'useEffect的依赖数组如何工作?',
    answer: [
      '1. 无deps：每次渲染都执行',
      '2. 空deps []：只在mount时执行',
      '3. 有deps：deps变化时执行',
      '4. 使用Object.is比较依赖',
      '5. 依赖应包含所有使用的外部变量'
    ]
  },
  
  Q4: {
    question: 'useEffect中如何处理异步?',
    answer: `
      问题：effect不能是async函数
      
      ❌ 错误:
      useEffect(async () => {
        const data = await fetchData();
      }, []);
      
      ✓ 正确:
      useEffect(() => {
        async function fetch() {
          const data = await fetchData();
          setData(data);
        }
        fetch();
      }, []);
      
      或使用IIFE:
      useEffect(() => {
        (async () => {
          const data = await fetchData();
          setData(data);
        })();
      }, []);
    `
  },
  
  Q5: {
    question: '如何在useEffect中防止内存泄漏?',
    answer: [
      '1. 返回cleanup函数清理订阅',
      '2. 取消未完成的异步操作',
      '3. 清理定时器',
      '4. 使用AbortController取消fetch',
      '5. 使用标志位判断组件是否已卸载'
    ]
  },
  
  Q6: {
    question: 'useEffect的实现原理?',
    answer: `
      1. mount时创建effect对象
      2. 添加到环形链表
      3. 标记fiber有副作用
      4. commit阶段收集effects
      5. 异步调度执行
      6. 先执行cleanup
      7. 再执行effect
      8. 保存destroy函数
    `
  }
};
```

## 10. 总结

useEffect手写实现的核心要点:

1. **数据结构**: Effect对象和环形链表
2. **执行时机**: commit后异步执行
3. **依赖比较**: Object.is浅比较
4. **cleanup**: 下次effect前执行
5. **环形链表**: 方便遍历所有effects
6. **标记**: HookHasEffect标记是否执行
7. **异步调度**: 不阻塞渲染
8. **性能优化**: 依赖稳定、避免不必要effect

理解useEffect实现是掌握React副作用管理的关键。

