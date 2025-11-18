# 手写useMemo和useCallback

## 学习目标

通过本章学习，你将深入理解：

- useMemo的内部实现原理
- useCallback的内部实现原理
- 两者的关系和区别
- 依赖数组的比较机制
- 缓存策略的实现
- 性能优化的原理
- 手写简化版实现
- React 19的优化改进

## 第一部分：useMemo和useCallback基础回顾

### 1.1 useMemo的使用

```jsx
function Component({ items }) {
  // 缓存计算结果
  const expensiveValue = useMemo(() => {
    console.log('计算中...');
    return items
      .filter(item => item.active)
      .reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return <div>总计: {expensiveValue}</div>;
}
```

### 1.2 useCallback的使用

```jsx
function Component() {
  const [count, setCount] = useState(0);
  
  // 缓存函数引用
  const handleClick = useCallback(() => {
    console.log('点击:', count);
  }, [count]);
  
  return <Child onClick={handleClick} />;
}
```

### 1.3 两者的关系

```javascript
// useCallback是useMemo的特殊形式
useCallback(fn, deps) 
// 等价于
useMemo(() => fn, deps)

// 示例：
const callback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 等同于：
const callback = useMemo(() => {
  return () => {
    doSomething(a, b);
  };
}, [a, b]);
```

## 第二部分：核心数据结构

### 2.1 Hook对象结构

```javascript
// useMemo/useCallback的Hook对象
type Hook = {
  // 存储 [缓存的值, 依赖数组]
  memoizedState: [any, Array<any>] | null,
  
  baseState: null,
  baseQueue: null,
  queue: null,
  
  // 指向下一个Hook
  next: Hook | null
};

// 示例：
// useMemo(() => computeExpensiveValue(), [dep1, dep2])
// Hook.memoizedState = [computedValue, [dep1, dep2]]

// useCallback((a, b) => doSomething(a, b), [a, b])
// Hook.memoizedState = [callbackFunction, [a, b]]
```

### 2.2 依赖比较机制

```javascript
// React使用Object.is进行依赖比较
function areHookInputsEqual(nextDeps, prevDeps) {
  // 没有依赖数组，总是更新
  if (prevDeps === null) {
    return false;
  }
  
  // 依赖数量不同，更新
  if (nextDeps.length !== prevDeps.length) {
    return false;
  }
  
  // 逐个比较依赖项
  for (let i = 0; i < prevDeps.length; i++) {
    // 使用Object.is进行比较（浅比较）
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;  // 有任何一项不同就返回false
  }
  
  return true;  // 所有项都相同
}

// Object.is的特点：
Object.is(0, -0);           // false（与===不同）
Object.is(NaN, NaN);        // true（与===不同）
Object.is({}, {});          // false（对象比较引用）
Object.is([1], [1]);        // false（数组比较引用）
```

## 第三部分：mountMemo实现

### 3.1 初始化阶段

```javascript
// 简化的mountMemo实现
function mountMemo(nextCreate, deps) {
  // 1. 创建Hook对象
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 2. 执行计算函数，获取初始值
  const nextValue = nextCreate();
  
  // 3. 存储值和依赖
  hook.memoizedState = [nextValue, nextDeps];
  
  // 4. 返回计算结果
  return nextValue;
}

// mountWorkInProgressHook的实现（复用）
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
```

### 3.2 初始化示例

```javascript
function Component({ items }) {
  // useMemo 1
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  // useMemo 2
  const average = useMemo(() => {
    return total / items.length;
  }, [total, items.length]);
  
  return <div>{average}</div>;
}

// 执行流程：
// 1. 调用第一个useMemo
//    → mountMemo
//    → 创建Hook1
//    → 执行 () => items.reduce(...)
//    → 计算得到 total = 100
//    → Hook1.memoizedState = [100, [items]]
//    → 返回 100

// 2. 调用第二个useMemo
//    → mountMemo
//    → 创建Hook2
//    → 执行 () => total / items.length
//    → 计算得到 average = 20
//    → Hook2.memoizedState = [20, [total, items.length]]
//    → 返回 20

// Fiber.memoizedState → Hook1 → Hook2 → null
```

## 第四部分：updateMemo实现

### 4.1 更新阶段

```javascript
// 简化的updateMemo实现
function updateMemo(nextCreate, deps) {
  // 1. 获取对应的Hook
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 2. 获取上次缓存的值和依赖
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      
      // 3. 比较依赖是否变化
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变，返回缓存的值
        return prevState[0];
      }
    }
  }
  
  // 4. 依赖变化，重新计算
  const nextValue = nextCreate();
  
  // 5. 更新缓存
  hook.memoizedState = [nextValue, nextDeps];
  
  // 6. 返回新值
  return nextValue;
}

// updateWorkInProgressHook的实现（复用）
function updateWorkInProgressHook() {
  // 从current树获取对应Hook
  let nextCurrentHook;
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    nextCurrentHook = current.memoizedState;
  } else {
    nextCurrentHook = currentHook.next;
  }
  
  currentHook = nextCurrentHook;
  
  // 创建workInProgress Hook
  const newHook = {
    memoizedState: currentHook.memoizedState,
    baseState: currentHook.baseState,
    baseQueue: currentHook.baseQueue,
    queue: currentHook.queue,
    next: null
  };
  
  // 添加到链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }
  
  return workInProgressHook;
}
```

### 4.2 更新流程示例

```javascript
function Component({ count }) {
  const doubled = useMemo(() => {
    console.log('计算doubled');
    return count * 2;
  }, [count]);
  
  const tripled = useMemo(() => {
    console.log('计算tripled');
    return count * 3;
  }, [count]);
  
  return <div>{doubled} - {tripled}</div>;
}

// 首次渲染（count = 1）:
// → 计算doubled: 1 * 2 = 2
// → Hook1.memoizedState = [2, [1]]
// → 计算tripled: 1 * 3 = 3
// → Hook2.memoizedState = [3, [1]]

// 第二次渲染（count = 1，未变化）:
// → updateMemo(doubled)
//   → 比较deps: [1] === [1] ✅
//   → 返回缓存值 2（不计算）
// → updateMemo(tripled)
//   → 比较deps: [1] === [1] ✅
//   → 返回缓存值 3（不计算）

// 第三次渲染（count = 2，变化）:
// → updateMemo(doubled)
//   → 比较deps: [2] !== [1] ❌
//   → 重新计算: 2 * 2 = 4
//   → Hook1.memoizedState = [4, [2]]
// → updateMemo(tripled)
//   → 比较deps: [2] !== [1] ❌
//   → 重新计算: 2 * 3 = 6
//   → Hook2.memoizedState = [6, [2]]
```

## 第五部分：useCallback实现

### 5.1 mountCallback和updateCallback

```javascript
// mountCallback的实现
function mountCallback(callback, deps) {
  // 创建Hook
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 直接存储callback和deps
  hook.memoizedState = [callback, nextDeps];
  
  // 返回callback
  return callback;
}

// updateCallback的实现
function updateCallback(callback, deps) {
  // 获取Hook
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 获取上次的callback和deps
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      
      // 比较依赖
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变，返回旧callback
        return prevState[0];
      }
    }
  }
  
  // 依赖变化，存储新callback
  hook.memoizedState = [callback, nextDeps];
  
  // 返回新callback
  return callback;
}
```

### 5.2 useCallback与useMemo的区别

```javascript
// 实现对比
function useMemo(create, deps) {
  // 执行create函数，缓存返回值
  const value = create();
  return value;
}

function useCallback(callback, deps) {
  // 直接缓存callback函数本身
  return callback;
}

// 使用对比
const value = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
// value是计算结果

const callback = useCallback(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
// callback是函数本身

// useCallback可以用useMemo实现
const callback = useMemo(() => {
  return () => {
    return computeExpensiveValue(a, b);
  };
}, [a, b]);
```

## 第六部分：简化版实现

### 6.1 完整的简化实现

```javascript
// 全局变量
let currentFiber = null;
let hookIndex = 0;

// 简化的useMemo实现
function useMemo(create, deps) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = hookIndex++;
  
  // 初始化Hook
  if (!hooks[index]) {
    // 首次渲染，执行create并缓存
    const value = create();
    hooks[index] = {
      value,
      deps
    };
    return value;
  }
  
  const hook = hooks[index];
  
  // 比较依赖
  const hasChanged = !deps || !hook.deps ||
    deps.some((dep, i) => !Object.is(dep, hook.deps[i]));
  
  if (hasChanged) {
    // 依赖变化，重新计算
    const value = create();
    hook.value = value;
    hook.deps = deps;
    return value;
  }
  
  // 依赖未变，返回缓存值
  return hook.value;
}

// 简化的useCallback实现
function useCallback(callback, deps) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = hookIndex++;
  
  // 初始化Hook
  if (!hooks[index]) {
    hooks[index] = {
      callback,
      deps
    };
    return callback;
  }
  
  const hook = hooks[index];
  
  // 比较依赖
  const hasChanged = !deps || !hook.deps ||
    deps.some((dep, i) => !Object.is(dep, hook.deps[i]));
  
  if (hasChanged) {
    // 依赖变化，使用新callback
    hook.callback = callback;
    hook.deps = deps;
    return callback;
  }
  
  // 依赖未变，返回旧callback
  return hook.callback;
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
const ComponentFiber = createComponent(() => {
  const [count, setCount] = useState(0);
  
  // useMemo示例
  const doubled = useMemo(() => {
    console.log('计算doubled');
    return count * 2;
  }, [count]);
  
  // useCallback示例
  const handleClick = useCallback(() => {
    console.log('点击count:', count);
  }, [count]);
  
  console.log('渲染 count:', count, 'doubled:', doubled);
  
  return {
    count,
    doubled,
    handleClick,
    increment: () => setCount(count + 1)
  };
});

// 初始渲染
let result = ComponentFiber.render();
// 输出: 计算doubled
//       渲染 count: 0 doubled: 0

// 第一次更新（count变化）
result.increment();
// 输出: 计算doubled
//       渲染 count: 1 doubled: 2

// 第二次渲染（count未变）
ComponentFiber.render();
// 输出: 渲染 count: 1 doubled: 2
// 注意：没有"计算doubled"，使用了缓存
```

### 6.2 增强版：支持无依赖数组

```javascript
// 增强的useMemo
function useMemo(create, deps) {
  const fiber = currentFiber;
  const hooks = fiber.hooks || (fiber.hooks = []);
  const index = hookIndex++;
  
  if (!hooks[index]) {
    const value = create();
    hooks[index] = {
      value,
      deps,
      hasValue: true
    };
    return value;
  }
  
  const hook = hooks[index];
  
  // 处理不同的deps情况
  let shouldUpdate = false;
  
  if (deps === undefined) {
    // 无deps参数，每次都更新
    shouldUpdate = true;
  } else if (deps === null) {
    // deps为null，永不更新
    shouldUpdate = false;
  } else if (!hook.deps) {
    // 上次没有deps，这次有，更新
    shouldUpdate = true;
  } else if (deps.length !== hook.deps.length) {
    // deps长度变化，更新
    shouldUpdate = true;
  } else {
    // 比较每个依赖项
    shouldUpdate = deps.some((dep, i) => !Object.is(dep, hook.deps[i]));
  }
  
  if (shouldUpdate) {
    const value = create();
    hook.value = value;
    hook.deps = deps;
    return value;
  }
  
  return hook.value;
}
```

## 第七部分：性能优化原理

### 7.1 useMemo的优化效果

```javascript
// 未优化版本
function UnoptimizedComponent({ items }) {
  // 每次渲染都重新计算
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const average = total / items.length;
  const maximum = Math.max(...items.map(item => item.value));
  
  return <div>{total} - {average} - {maximum}</div>;
}

// 优化版本
function OptimizedComponent({ items }) {
  // 只在items变化时重新计算
  const total = useMemo(() => {
    console.log('计算total');
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  const average = useMemo(() => {
    console.log('计算average');
    return total / items.length;
  }, [total, items.length]);
  
  const maximum = useMemo(() => {
    console.log('计算maximum');
    return Math.max(...items.map(item => item.value));
  }, [items]);
  
  return <div>{total} - {average} - {maximum}</div>;
}

// 性能对比：
// 场景1：items未变，但父组件重新渲染
// 未优化：重复计算3次
// 优化：使用缓存，0次计算

// 场景2：只有items.length变化（内容未变）
// 未优化：重复计算3次
// 优化：只重新计算average，total和maximum使用缓存
```

### 7.2 useCallback的优化效果

```javascript
// 未优化版本
function UnoptimizedParent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 每次渲染都创建新函数
  const handleClick = () => {
    console.log('clicked');
  };
  
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      {/* text变化时，Child会重新渲染，即使handleClick逻辑未变 */}
      <MemoChild onClick={handleClick} />
    </div>
  );
}

// 优化版本
function OptimizedParent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 缓存函数引用
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      {/* text变化时，handleClick引用不变，Child不重新渲染 */}
      <MemoChild onClick={handleClick} />
    </div>
  );
}

const MemoChild = React.memo(function Child({ onClick }) {
  console.log('Child渲染');
  return <button onClick={onClick}>Click</button>;
});
```

## 第八部分：React 19的优化

### 8.1 自动缓存优化

```javascript
// React 19编译器可能自动优化
// 开发者编写的代码
function Component({ items }) {
  const filtered = items.filter(item => item.active);
  const total = filtered.reduce((sum, item) => sum + item.value, 0);
  
  return <div>{total}</div>;
}

// 编译器可能转换为
function Component({ items }) {
  const filtered = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  
  const total = useMemo(() => {
    return filtered.reduce((sum, item) => sum + item.value, 0);
  }, [filtered]);
  
  return <div>{total}</div>;
}
```

### 8.2 智能依赖追踪

```javascript
// React 19可能支持更智能的依赖追踪
// 开发者代码
function Component({ user }) {
  const greeting = useMemo(() => {
    return `Hello, ${user.name}`;
  }, [user]);  // 依赖整个user对象
  
  // React 19可能自动优化为只依赖user.name
  // 内部实现可能类似：
  // const greeting = useMemo(() => {
  //   return `Hello, ${user.name}`;
  // }, [user.name]);
}
```

## 注意事项

### 1. 不要过度使用

```javascript
// ❌ 过度优化：简单计算不需要useMemo
const doubled = useMemo(() => count * 2, [count]);

// ✅ 简单计算直接执行
const doubled = count * 2;

// ✅ 复杂计算才使用useMemo
const expensive = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

### 2. 依赖数组必须完整

```javascript
// ❌ 错误：缺少依赖
const result = useMemo(() => {
  return a + b + c;
}, [a, b]);  // 缺少c

// ✅ 正确：包含所有依赖
const result = useMemo(() => {
  return a + b + c;
}, [a, b, c]);
```

### 3. 对象和数组依赖

```javascript
// ❌ 问题：对象每次都是新的
function Parent() {
  const config = { api: 'url' };  // 每次渲染都创建新对象
  
  const data = useMemo(() => {
    return fetchData(config);
  }, [config]);  // config每次都不同，useMemo失效
}

// ✅ 解决方案1：提取到组件外
const CONFIG = { api: 'url' };
function Parent() {
  const data = useMemo(() => {
    return fetchData(CONFIG);
  }, []);
}

// ✅ 解决方案2：useMemo包裹config
function Parent() {
  const config = useMemo(() => ({ api: 'url' }), []);
  const data = useMemo(() => {
    return fetchData(config);
  }, [config]);
}
```

### 4. useCallback必须配合React.memo

```javascript
// ❌ 无效：子组件没有memo
function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <Child onClick={handleClick} />;  // Child没有memo，每次都渲染
}

// ✅ 有效：子组件使用memo
function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <MemoChild onClick={handleClick} />;
}

const MemoChild = React.memo(Child);
```

## 常见问题

### Q1: useMemo和useCallback什么时候使用？

**A:** 
- **useMemo**: 缓存计算结果
  - 复杂计算
  - 引用相等性重要
  
- **useCallback**: 缓存函数引用
  - 传给memo组件
  - 作为依赖使用

```javascript
// useMemo
const expensive = useMemo(() => heavyCalculation(), [deps]);

// useCallback
const callback = useCallback(() => {}, [deps]);
return <MemoChild onClick={callback} />;
```

### Q2: 为什么使用了useMemo性能反而变差？

**A:** 可能原因：
1. 计算本身不昂贵
2. 依赖频繁变化
3. useMemo本身有开销

```javascript
// ❌ 性能更差：简单计算 + useMemo开销
const sum = useMemo(() => a + b, [a, b]);

// ✅ 更好：直接计算
const sum = a + b;
```

### Q3: useMemo可以替代所有计算吗？

**A:** 不应该。遵循原则：
```javascript
// 先写可读的代码
const value = compute();

// 发现性能问题时才优化
const value = useMemo(() => compute(), [deps]);
```

### Q4: useCallback(fn, []) 和 直接定义函数有什么区别？

**A:**
```javascript
// 直接定义：每次渲染创建新函数
const fn = () => {};

// useCallback：函数引用保持不变
const fn = useCallback(() => {}, []);

// 区别只在引用相等性：
// 直接定义：fn1 !== fn2
// useCallback：fn1 === fn2
```

## 总结

### 实现要点

1. **数据结构**: Hook.memoizedState = [value, deps]
2. **初始化**: 执行计算/保存函数
3. **更新**: 比较deps决定是否更新
4. **缓存策略**: 浅比较依赖数组
5. **性能权衡**: 缓存收益 > 比较成本

### useMemo vs useCallback

```
useMemo(create, deps)
  ↓
执行create函数
  ↓
缓存返回值
  ↓
返回值

useCallback(fn, deps)
  ↓
直接缓存fn
  ↓
返回fn
```

### 使用决策树

```
需要缓存吗？
  ├─ 缓存计算结果 → useMemo
  ├─ 缓存函数引用 → useCallback
  └─ 简单值 → 不需要缓存

配合React.memo？
  ├─ 是 → 使用useCallback
  └─ 否 → 可能不需要

计算昂贵？
  ├─ 是 → 使用useMemo
  └─ 否 → 不需要
```

### 最佳实践

```javascript
// 1. 只优化瓶颈
// 2. 使用Profiler测量
// 3. 保持依赖完整
// 4. 避免依赖不稳定对象
// 5. 配合React.memo使用
```

理解useMemo和useCallback的实现原理，能帮助我们更明智地使用它们，真正提升应用性能！
