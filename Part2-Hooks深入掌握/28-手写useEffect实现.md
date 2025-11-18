# 手写useEffect实现

## 学习目标

通过本章学习，你将深入理解：

- useEffect的内部工作原理
- Effect的数据结构和链表
- 依赖数组的比较机制
- cleanup函数的执行时机
- Effect的调度和执行流程
- useEffect与生命周期的关系
- 手写简化版useEffect
- React 19的优化实现

## 第一部分：useEffect基础回顾

### 1.1 useEffect的使用

```jsx
function Component() {
  const [count, setCount] = useState(0);
  
  // 无依赖数组：每次渲染都执行
  useEffect(() => {
    console.log('每次渲染');
  });
  
  // 空依赖数组：只在mount时执行
  useEffect(() => {
    console.log('组件挂载');
    return () => {
      console.log('组件卸载');
    };
  }, []);
  
  // 有依赖：依赖变化时执行
  useEffect(() => {
    console.log('count变化:', count);
  }, [count]);
  
  return <div>{count}</div>;
}
```

### 1.2 useEffect的特点

```jsx
// 1. 异步执行 - 不阻塞渲染
// 2. 依赖比较 - 浅比较依赖数组
// 3. 清理函数 - 返回cleanup函数
// 4. 执行时机 - 在DOM更新后、浏览器绘制前
// 5. 顺序保证 - 按声明顺序执行
```

## 第二部分：核心数据结构

### 2.1 Effect对象结构

```javascript
// Effect对象
type Effect = {
  // effect标记
  tag: HookFlags,
  
  // effect函数
  create: () => (() => void) | void,
  
  // cleanup函数
  destroy: (() => void) | void,
  
  // 依赖数组
  deps: Array<any> | null,
  
  // 下一个effect（环形链表）
  next: Effect
};

// HookFlags
const NoFlags = 0b000;
const HasEffect = 0b001;     // 有effect需要执行
const Layout = 0b010;         // useLayoutEffect
const Passive = 0b100;        // useEffect

// Hook对象（存储在Fiber上）
type Hook = {
  memoizedState: Effect,  // 指向effect环形链表
  baseState: null,
  baseQueue: null,
  queue: null,
  next: Hook | null
};
```

### 2.2 Effect链表结构

```javascript
// Fiber节点上的effect链表
type Fiber = {
  // ...其他属性
  
  // Hook链表
  memoizedState: Hook | null,
  
  // Effect链表
  updateQueue: {
    lastEffect: Effect | null  // 指向环形链表的最后一个effect
  } | null
};

// 可视化：
// Fiber.updateQueue.lastEffect → Effect3
//                                   ↓
// Effect1 ← Effect2 ← Effect3 ←┘
//   ↓_________________________↑
// 环形链表
```

## 第三部分：mountEffect实现

### 3.1 初始化阶段

```javascript
// 简化的mountEffect实现
function mountEffect(create, deps) {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps
  );
}

function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 1. 创建Hook对象
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 2. 标记Fiber需要执行effect
  currentlyRenderingFiber.flags |= fiberFlags;
  
  // 3. 创建effect并存储到Hook
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,  // destroy初始为undefined
    nextDeps
  );
}

// 创建effect并添加到链表
function pushEffect(tag, create, destroy, deps) {
  // 创建effect对象
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null
  };
  
  // 获取或创建updateQueue
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    
    // 第一个effect，形成环
    effect.next = effect;
    componentUpdateQueue.lastEffect = effect;
  } else {
    // 添加到环形链表
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      effect.next = effect;
      componentUpdateQueue.lastEffect = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  
  return effect;
}

function createFunctionComponentUpdateQueue() {
  return {
    lastEffect: null
  };
}
```

### 3.2 初始化示例

```javascript
function Component() {
  // Effect 1
  useEffect(() => {
    console.log('Effect 1');
    return () => console.log('Cleanup 1');
  }, []);
  
  // Effect 2
  useEffect(() => {
    console.log('Effect 2');
  }, []);
  
  return <div>Component</div>;
}

// 执行流程：
// 1. 调用第一个useEffect
//    → mountEffect
//    → 创建Hook1
//    → 创建Effect1
//    → Hook1.memoizedState = Effect1
//    → Fiber.updateQueue.lastEffect = Effect1
//    → Effect1.next = Effect1 (环形)

// 2. 调用第二个useEffect
//    → mountEffect
//    → 创建Hook2
//    → 创建Effect2
//    → Hook2.memoizedState = Effect2
//    → Effect1.next = Effect2
//    → Effect2.next = Effect1
//    → Fiber.updateQueue.lastEffect = Effect2

// 结构：
// Fiber.memoizedState → Hook1 → Hook2 → null
//                         ↓       ↓
// Fiber.updateQueue.lastEffect → Effect2
//                                   ↓
//              Effect1 ← Effect2 ←┘
//                ↓________________↑
```

## 第四部分：updateEffect实现

### 4.1 更新阶段

```javascript
function updateEffect(create, deps) {
  return updateEffectImpl(
    PassiveEffect,
    HookPassive,
    create,
    deps
  );
}

function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 1. 获取对应的Hook
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  
  // 2. 获取上次的effect
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    
    // 3. 比较依赖数组
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      
      // 依赖没变，不需要执行effect
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 创建effect但不标记HookHasEffect
        hook.memoizedState = pushEffect(
          hookFlags,        // 不包含HookHasEffect
          create,
          destroy,
          nextDeps
        );
        return;
      }
    }
  }
  
  // 4. 依赖变化，需要执行effect
  currentlyRenderingFiber.flags |= fiberFlags;
  
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,  // 标记需要执行
    create,
    destroy,
    nextDeps
  );
}

// 比较依赖数组
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }
  
  // 逐个比较依赖项（使用Object.is）
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  
  return true;
}
```

### 4.2 依赖比较示例

```javascript
function Component({ userId }) {
  const [count, setCount] = useState(0);
  
  // 场景1：依赖变化，执行effect
  useEffect(() => {
    console.log('userId变化:', userId);
  }, [userId]);
  
  // 场景2：依赖未变，不执行
  useEffect(() => {
    console.log('count不变');
  }, [count]);
  
  // 场景3：对象依赖（引用比较）
  const config = { api: 'url' };
  useEffect(() => {
    // ❌ 每次都执行，因为config每次都是新对象
    console.log('config变化');
  }, [config]);
  
  return <div>{count}</div>;
}

// 依赖比较过程：
// prevDeps = [1]
// nextDeps = [1]
// Object.is(1, 1) = true → 不执行effect

// prevDeps = [{ api: 'url' }]
// nextDeps = [{ api: 'url' }]
// Object.is(oldObj, newObj) = false → 执行effect
```

## 第五部分：Effect执行流程

### 5.1 提交阶段的Effect处理

```javascript
// 简化的commit阶段流程
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  // 1. Before mutation阶段
  commitBeforeMutationEffects(finishedWork);
  
  // 2. Mutation阶段（更新DOM）
  commitMutationEffects(finishedWork);
  
  // 3. Layout阶段
  commitLayoutEffects(finishedWork);
  
  // 4. Passive阶段（useEffect）
  schedulePassiveEffects(finishedWork);
}

// 调度passive effects
function schedulePassiveEffects(fiber) {
  if (fiber.flags & Passive) {
    // 收集需要执行的effects
    const updateQueue = fiber.updateQueue;
    if (updateQueue !== null) {
      const lastEffect = updateQueue.lastEffect;
      if (lastEffect !== null) {
        // 遍历effect环形链表
        let effect = lastEffect.next;
        do {
          if ((effect.tag & HookPassive) !== NoHookEffect) {
            if ((effect.tag & HookHasEffect) !== NoHookEffect) {
              // 需要执行的effect
              enqueuePendingPassiveHookEffectUnmount(fiber, effect);
              enqueuePendingPassiveHookEffectMount(fiber, effect);
            }
          }
          effect = effect.next;
        } while (effect !== lastEffect.next);
      }
    }
  }
  
  // 递归处理子节点
  if (fiber.child !== null) {
    schedulePassiveEffects(fiber.child);
  }
  if (fiber.sibling !== null) {
    schedulePassiveEffects(fiber.sibling);
  }
}

// 执行passive effects
function flushPassiveEffects() {
  // 1. 执行所有cleanup函数
  flushPassiveUnmountEffects();
  
  // 2. 执行所有effect函数
  flushPassiveMountEffects();
}

function flushPassiveUnmountEffects() {
  while (pendingPassiveHookEffectsUnmount.length > 0) {
    const effect = pendingPassiveHookEffectsUnmount.shift();
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

function flushPassiveMountEffects() {
  while (pendingPassiveHookEffectsMount.length > 0) {
    const effect = pendingPassiveHookEffectsMount.shift();
    const create = effect.create;
    
    try {
      const destroy = create();
      effect.destroy = destroy;
    } catch (error) {
      captureCommitPhaseError(fiber, error);
    }
  }
}
```

### 5.2 执行时机示例

```javascript
function Component() {
  const [count, setCount] = useState(0);
  
  console.log('1. 渲染阶段');
  
  useEffect(() => {
    console.log('3. Effect执行');
    return () => {
      console.log('4. Cleanup执行（下次effect前或卸载时）');
    };
  }, [count]);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// 首次渲染：
// 1. 渲染阶段
// 2. DOM更新
// 3. Effect执行

// 点击按钮（count: 0 → 1）：
// 1. 渲染阶段
// 2. DOM更新
// 4. Cleanup执行（清理count=0的effect）
// 3. Effect执行（执行count=1的effect）

// 组件卸载：
// 4. Cleanup执行
```

## 第六部分：cleanup函数处理

### 6.1 cleanup的执行时机

```javascript
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Effect: count =', count);
    
    // cleanup函数
    return () => {
      console.log('Cleanup: count =', count);
    };
  }, [count]);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// 执行顺序：
// 首次渲染（count = 0）:
// → Effect: count = 0

// 点击按钮（count = 1）:
// → Cleanup: count = 0  （先执行旧的cleanup）
// → Effect: count = 1   （再执行新的effect）

// 再次点击（count = 2）:
// → Cleanup: count = 1
// → Effect: count = 2

// 组件卸载:
// → Cleanup: count = 2  （最后执行cleanup）
```

### 6.2 cleanup实现细节

```javascript
// Effect更新时的cleanup处理
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;  // ✅ 保存上次的cleanup
    
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变，不执行effect
        hook.memoizedState = pushEffect(
          hookFlags,
          create,
          destroy,      // ✅ 保留cleanup
          nextDeps
        );
        return;
      }
    }
  }
  
  // 依赖变化，创建新effect
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,  // ✅ 传递旧的cleanup，会在新effect前执行
    nextDeps
  );
}

// 执行cleanup
function commitHookEffectListUnmount(tag, fiber) {
  const updateQueue = fiber.updateQueue;
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
            captureCommitPhaseError(fiber, error);
          }
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

## 第七部分：简化版实现

### 7.1 完整的简化实现

```javascript
// 全局变量
let currentFiber = null;
let hookIndex = 0;

// 待执行的effects
let pendingEffects = [];

// 简化的useEffect实现
function useEffect(effect, deps) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = hookIndex++;
  
  // 初始化Hook
  if (!hooks[index]) {
    hooks[index] = {
      effect,
      deps,
      cleanup: undefined
    };
    
    // 首次渲染，添加到待执行队列
    pendingEffects.push({
      fiber,
      hookIndex: index,
      effect,
      deps
    });
  } else {
    const hook = hooks[index];
    
    // 比较依赖
    const hasChanged = !deps || !hook.deps || 
      deps.some((dep, i) => !Object.is(dep, hook.deps[i]));
    
    if (hasChanged) {
      // 依赖变化，需要执行新effect
      
      // 先添加cleanup任务
      if (hook.cleanup) {
        pendingEffects.push({
          fiber,
          hookIndex: index,
          cleanup: hook.cleanup
        });
      }
      
      // 再添加新effect任务
      pendingEffects.push({
        fiber,
        hookIndex: index,
        effect,
        deps
      });
      
      // 更新hook
      hook.effect = effect;
      hook.deps = deps;
    }
  }
}

// 执行所有待执行的effects
function flushEffects() {
  pendingEffects.forEach(task => {
    const hook = task.fiber.hooks[task.hookIndex];
    
    if (task.cleanup) {
      // 执行cleanup
      task.cleanup();
    } else if (task.effect) {
      // 执行effect，保存cleanup
      const cleanup = task.effect();
      if (typeof cleanup === 'function') {
        hook.cleanup = cleanup;
      }
    }
  });
  
  pendingEffects = [];
}

// 调度渲染（在渲染后执行effects）
function scheduleRender(fiber) {
  requestIdleCallback(() => {
    // 1. 重新渲染
    hookIndex = 0;
    currentFiber = fiber;
    fiber.render();
    
    // 2. 执行effects（异步）
    setTimeout(() => {
      flushEffects();
    }, 0);
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
  
  // Effect 1
  useEffect(() => {
    console.log('Effect 1: count =', count);
    return () => {
      console.log('Cleanup 1: count =', count);
    };
  }, [count]);
  
  // Effect 2
  useEffect(() => {
    console.log('Effect 2: mounted');
    return () => {
      console.log('Cleanup 2: unmounted');
    };
  }, []);
  
  console.log('Render: count =', count);
  
  return {
    count,
    increment: () => setCount(count + 1)
  };
});

// 初始渲染
let result = CounterFiber.render();
// 输出: Render: count = 0
flushEffects();
// 输出: Effect 1: count = 0
//       Effect 2: mounted

// 更新
result.increment();
// 触发重渲染
// 输出: Render: count = 1
//       Cleanup 1: count = 0
//       Effect 1: count = 1
```

### 7.2 支持依赖比较的完整版本

```javascript
// 增强版useEffect
function useEffect(effect, deps) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = hookIndex++;
  
  // 初始化Hook
  if (!hooks[index]) {
    hooks[index] = {
      effect,
      deps,
      cleanup: undefined,
      hasEffect: true  // 首次总是执行
    };
  } else {
    const hook = hooks[index];
    
    // 比较依赖
    let hasEffect = false;
    
    if (deps === undefined) {
      // 无依赖数组，每次都执行
      hasEffect = true;
    } else if (hook.deps === null) {
      // 上次无依赖，这次有依赖，执行
      hasEffect = true;
    } else if (deps.length !== hook.deps.length) {
      // 依赖数量变化，执行
      hasEffect = true;
    } else {
      // 逐项比较
      hasEffect = deps.some((dep, i) => !Object.is(dep, hook.deps[i]));
    }
    
    hook.hasEffect = hasEffect;
    
    if (hasEffect) {
      hook.effect = effect;
      hook.deps = deps;
    }
  }
  
  // 添加到待执行队列
  const hook = hooks[index];
  if (hook.hasEffect) {
    pendingEffects.push({
      fiber,
      hookIndex: index
    });
  }
}

// 执行effects
function flushEffects() {
  // 1. 执行所有cleanup
  pendingEffects.forEach(task => {
    const hook = task.fiber.hooks[task.hookIndex];
    if (hook.cleanup) {
      try {
        hook.cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
      hook.cleanup = undefined;
    }
  });
  
  // 2. 执行所有effect
  pendingEffects.forEach(task => {
    const hook = task.fiber.hooks[task.hookIndex];
    if (hook.effect && hook.hasEffect) {
      try {
        const cleanup = hook.effect();
        if (typeof cleanup === 'function') {
          hook.cleanup = cleanup;
        }
      } catch (error) {
        console.error('Effect error:', error);
      }
    }
  });
  
  pendingEffects = [];
}
```

## 第八部分：useLayoutEffect区别

### 8.1 useLayoutEffect实现

```javascript
// useLayoutEffect的实现几乎相同，只是tag不同
function mountLayoutEffect(create, deps) {
  return mountEffectImpl(
    UpdateEffect,  // 不同的flag
    HookLayout,    // 不同的tag
    create,
    deps
  );
}

function updateLayoutEffect(create, deps) {
  return updateEffectImpl(
    UpdateEffect,
    HookLayout,
    create,
    deps
  );
}

// 执行时机不同
function commitLifeCycles(fiber) {
  switch (fiber.tag) {
    case FunctionComponent: {
      // useLayoutEffect在mutation阶段后立即同步执行
      commitHookEffectListMount(HookLayout | HookHasEffect, fiber);
      break;
    }
  }
}

// useEffect在commit阶段完成后异步执行
function commitPassiveEffects(fiber) {
  // useEffect异步调度
  scheduleCallback(NormalPriority, () => {
    flushPassiveEffects();
  });
}
```

### 8.2 执行时机对比

```javascript
function Component() {
  console.log('1. 渲染');
  
  useLayoutEffect(() => {
    console.log('2. useLayoutEffect（DOM更新后，浏览器绘制前）');
  });
  
  useEffect(() => {
    console.log('4. useEffect（浏览器绘制后）');
  });
  
  console.log('3. 渲染完成，即将commit');
  
  return <div>Component</div>;
}

// 执行顺序：
// 1. 渲染
// 3. 渲染完成，即将commit
// → DOM更新
// 2. useLayoutEffect（同步执行）
// → 浏览器绘制
// 4. useEffect（异步执行）
```

## 注意事项

### 1. 依赖数组的重要性

```javascript
// ❌ 错误：缺少依赖
useEffect(() => {
  console.log(count);
}, []);  // count不在依赖中

// ✅ 正确：包含所有依赖
useEffect(() => {
  console.log(count);
}, [count]);
```

### 2. cleanup函数的必要性

```javascript
// ❌ 错误：忘记cleanup
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  // 没有cleanup，导致内存泄漏
}, []);

// ✅ 正确：返回cleanup
useEffect(() => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  return () => {
    clearInterval(timer);
  };
}, []);
```

### 3. 异步操作的取消

```javascript
// ✅ 正确处理异步
useEffect(() => {
  let cancelled = false;
  
  fetchData().then(data => {
    if (!cancelled) {
      setData(data);
    }
  });
  
  return () => {
    cancelled = true;
  };
}, []);
```

### 4. 避免无限循环

```javascript
// ❌ 错误：导致无限循环
useEffect(() => {
  setCount(count + 1);
}, [count]);  // count变化 → effect执行 → count变化 → ...

// ✅ 正确：使用函数式更新
useEffect(() => {
  setCount(c => c + 1);
}, []);  // 只执行一次
```

## 常见问题

### Q1: useEffect和useLayoutEffect的区别？

**A:**
- **useEffect**: 异步执行，不阻塞渲染
- **useLayoutEffect**: 同步执行，阻塞渲染

```javascript
// 使用场景：
// useEffect: 数据获取、订阅、日志等
// useLayoutEffect: DOM测量、同步更新DOM
```

### Q2: 为什么cleanup在新effect前执行？

**A:** 确保正确清理旧的副作用：

```javascript
useEffect(() => {
  const subscription = subscribe(userId);
  return () => unsubscribe(subscription);
}, [userId]);

// userId变化时：
// 1. 先unsubscribe旧userId
// 2. 再subscribe新userId
```

### Q3: 依赖数组为空和不传有什么区别？

**A:**
```javascript
// 空数组：只执行一次
useEffect(() => {
  // 只在mount时执行
}, []);

// 不传：每次渲染都执行
useEffect(() => {
  // 每次渲染都执行
});
```

### Q4: 如何在effect中获取最新的props/state？

**A:**
```javascript
// 方法1：添加到依赖数组
useEffect(() => {
  console.log(count);
}, [count]);

// 方法2：使用ref
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

useEffect(() => {
  console.log(countRef.current);
}, []);
```

## 总结

### useEffect实现要点

1. **数据结构**: Effect对象、环形链表
2. **初始化**: mountEffect创建effect
3. **更新**: updateEffect比较依赖
4. **调度**: 异步执行effects
5. **清理**: cleanup在新effect前执行
6. **顺序**: 按声明顺序执行

### 执行流程

```
useEffect(fn, deps)
  ↓
首次: mountEffect
  ↓
创建Effect对象
  ↓
添加到effect链表
  ↓
渲染完成
  ↓
异步执行effect
  ↓
保存cleanup函数
  ↓
依赖变化
  ↓
updateEffect
  ↓
比较deps
  ↓
deps变化?
  ├─ 是 → 执行cleanup → 执行新effect
  └─ 否 → 跳过
```

### cleanup执行时机

```
组件更新（deps变化）:
1. 执行旧effect的cleanup
2. 执行新effect

组件卸载:
1. 执行最后一个effect的cleanup
```

理解useEffect的实现原理，能帮助我们更好地使用它，避免内存泄漏和性能问题！
