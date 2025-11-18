# useMemo和useCallback手写实现 - 性能优化Hook深度解析

## 1. useMemo和useCallback概述

### 1.1 核心概念

```typescript
const hooksConcept = {
  useMemo: {
    作用: '缓存计算结果',
    用法: 'const value = useMemo(() => compute(a, b), [a, b])',
    返回: '计算结果',
    场景: ['昂贵计算', '引用稳定']
  },
  
  useCallback: {
    作用: '缓存函数引用',
    用法: 'const callback = useCallback(() => {}, [deps])',
    返回: '函数引用',
    场景: ['传递给子组件', '依赖数组中的函数']
  },
  
  关系: 'useCallback(fn, deps) = useMemo(() => fn, deps)',
  
  性能优化原理: {
    问题: '每次渲染创建新对象/函数',
    导致: '子组件不必要的重渲染',
    解决: '缓存引用，保持稳定性'
  }
};
```

### 1.2 数据结构

```typescript
// Hook节点（复用useState的结构）
interface Hook {
  memoizedState: any;  // [value, deps]
  baseState: null;
  baseQueue: null;
  queue: null;
  next: Hook | null;
}

// useMemo/useCallback存储格式
type MemoState = [any, Array<any> | null];

// value: 缓存的值或函数
// deps: 依赖数组
```

## 2. useMemo实现

### 2.1 mount阶段

```typescript
/**
 * mount阶段的useMemo
 */
function mountMemo<T>(
  nextCreate: () => T,
  deps: Array<any> | void | null
): T {
  // 创建Hook节点
  const hook = mountWorkInProgressHook();
  
  const nextDeps = deps === undefined ? null : deps;
  
  // 执行计算函数
  const nextValue = nextCreate();
  
  // 保存值和依赖
  hook.memoizedState = [nextValue, nextDeps];
  
  return nextValue;
}

// 使用示例
const useMemoExample = `
  function Component({ a, b }) {
    const value = useMemo(() => {
      console.log('Computing...');
      return a + b;
    }, [a, b]);
    
    return <div>{value}</div>;
  }
  
  // mount时:
  // 1. 执行nextCreate() 计算 a + b
  // 2. 保存 [value, [a, b]] 到 hook.memoizedState
  // 3. 返回 value
`;
```

### 2.2 update阶段

```typescript
/**
 * update阶段的useMemo
 */
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<any> | void | null
): T {
  // 获取当前Hook
  const hook = updateWorkInProgressHook();
  
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps: Array<any> | null = prevState[1];
      
      // 比较依赖
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变，返回缓存值
        return prevState[0];
      }
    }
  }
  
  // 依赖变化，重新计算
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  
  return nextValue;
}

/**
 * 比较依赖数组
 */
function areHookInputsEqual(
  nextDeps: Array<any>,
  prevDeps: Array<any> | null
): boolean {
  if (prevDeps === null) {
    return false;
  }
  
  // 浅比较每个依赖项
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  
  return true;
}
```

### 2.3 依赖比较详解

```typescript
// 依赖比较示例
const dependencyComparisonExamples = {
  基本类型: {
    代码: `
      const value = useMemo(() => {
        return a + b;
      }, [a, b]);
    `,
    比较: `
      Object.is(1, 1) // true
      Object.is('hello', 'hello') // true
      Object.is(true, true) // true
    `
  },
  
  对象引用: {
    代码: `
      const obj1 = { id: 1 };
      const obj2 = { id: 1 };
      
      Object.is(obj1, obj2) // false (不同引用)
      Object.is(obj1, obj1) // true (相同引用)
    `,
    问题: `
      function Component() {
        const config = { threshold: 10 }; // 每次渲染都创建新对象
        
        const value = useMemo(() => {
          return compute(config);
        }, [config]); // config每次都是新引用，缓存失效
      }
    `,
    解决: `
      // 方案1: 提取到组件外
      const config = { threshold: 10 };
      
      function Component() {
        const value = useMemo(() => {
          return compute(config);
        }, []); // config稳定
      }
      
      // 方案2: 嵌套useMemo
      function Component() {
        const config = useMemo(() => ({ threshold: 10 }), []);
        
        const value = useMemo(() => {
          return compute(config);
        }, [config]); // config稳定
      }
      
      // 方案3: 解构需要的值
      function Component({ user }) {
        const userId = user.id;
        
        const value = useMemo(() => {
          return compute(userId);
        }, [userId]); // 只依赖id
      }
    `
  },
  
  数组: {
    代码: `
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      
      Object.is(arr1, arr2) // false
    `,
    注意: '数组也是按引用比较，需要保持引用稳定'
  },
  
  函数: {
    代码: `
      const fn1 = () => {};
      const fn2 = () => {};
      
      Object.is(fn1, fn2) // false
    `,
    建议: '函数依赖应该使用useCallback包裹'
  }
};
```

## 3. useCallback实现

### 3.1 mount阶段

```typescript
/**
 * mount阶段的useCallback
 */
function mountCallback<T>(
  callback: T,
  deps: Array<any> | void | null
): T {
  // 创建Hook节点
  const hook = mountWorkInProgressHook();
  
  const nextDeps = deps === undefined ? null : deps;
  
  // 保存函数和依赖
  hook.memoizedState = [callback, nextDeps];
  
  return callback;
}

// 使用示例
const useCallbackExample = `
  function Component() {
    const [count, setCount] = useState(0);
    
    const handleClick = useCallback(() => {
      console.log('Clicked', count);
    }, [count]);
    
    return <Button onClick={handleClick} />;
  }
  
  // mount时:
  // 1. 保存 [handleClick, [count]] 到 hook.memoizedState
  // 2. 返回 handleClick
`;
```

### 3.2 update阶段

```typescript
/**
 * update阶段的useCallback
 */
function updateCallback<T>(
  callback: T,
  deps: Array<any> | void | null
): T {
  // 获取当前Hook
  const hook = updateWorkInProgressHook();
  
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps: Array<any> | null = prevState[1];
      
      // 比较依赖
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变，返回缓存的函数
        return prevState[0];
      }
    }
  }
  
  // 依赖变化，保存新函数
  hook.memoizedState = [callback, nextDeps];
  
  return callback;
}
```

### 3.3 useCallback与useMemo的关系

```typescript
// useCallback是useMemo的语法糖
const callbackMemoRelation = {
  等价关系: `
    // 这两者完全等价:
    const callback = useCallback(fn, deps);
    const callback = useMemo(() => fn, deps);
  `,
  
  实现对比: `
    // useCallback实现
    function useCallback(callback, deps) {
      return useMemo(() => callback, deps);
    }
    
    // 或者独立实现（更高效）
    function useCallback(callback, deps) {
      const hook = updateWorkInProgressHook();
      // ... 直接保存callback
      hook.memoizedState = [callback, deps];
      return callback;
    }
  `,
  
  选择: {
    useCallback: '缓存函数',
    useMemo: '缓存计算结果或其他值'
  }
};
```

## 4. 性能优化场景

### 4.1 避免子组件重渲染

```typescript
// 场景：子组件使用React.memo
const avoidRerender = {
  问题代码: `
    function Parent() {
      const [count, setCount] = useState(0);
      const [name, setName] = useState('');
      
      // ❌ 每次渲染都创建新函数
      const handleClick = () => {
        console.log(count);
      };
      
      return (
        <div>
          <Child onClick={handleClick} />
          <button onClick={() => setName('New')}>Change Name</button>
        </div>
      );
    }
    
    const Child = React.memo(({ onClick }) => {
      console.log('Child render');
      return <button onClick={onClick}>Click</button>;
    });
    
    // 问题: name变化时，Child也重渲染
    // 因为handleClick是新引用
  `,
  
  优化代码: `
    function Parent() {
      const [count, setCount] = useState(0);
      const [name, setName] = useState('');
      
      // ✓ 使用useCallback缓存函数
      const handleClick = useCallback(() => {
        console.log(count);
      }, [count]);
      
      return (
        <div>
          <Child onClick={handleClick} />
          <button onClick={() => setName('New')}>Change Name</button>
        </div>
      );
    }
    
    const Child = React.memo(({ onClick }) => {
      console.log('Child render');
      return <button onClick={onClick}>Click</button>;
    });
    
    // name变化时，handleClick引用不变，Child不重渲染
  `
};
```

### 4.2 昂贵计算缓存

```typescript
// 场景：复杂计算
const expensiveComputation = {
  问题代码: `
    function Component({ items }) {
      const [filter, setFilter] = useState('');
      
      // ❌ 每次渲染都计算
      const filteredItems = items.filter(item => 
        item.name.includes(filter)
      ).sort((a, b) => 
        a.name.localeCompare(b.name)
      ).map(item => ({
        ...item,
        processed: true
      }));
      
      return (
        <div>
          <input value={filter} onChange={e => setFilter(e.target.value)} />
          <List items={filteredItems} />
        </div>
      );
    }
    
    // 问题: 即使filter没变，每次渲染都重新计算
  `,
  
  优化代码: `
    function Component({ items }) {
      const [filter, setFilter] = useState('');
      
      // ✓ 使用useMemo缓存计算结果
      const filteredItems = useMemo(() => {
        console.log('Computing filtered items...');
        return items.filter(item => 
          item.name.includes(filter)
        ).sort((a, b) => 
          a.name.localeCompare(b.name)
        ).map(item => ({
          ...item,
          processed: true
        }));
      }, [items, filter]);
      
      return (
        <div>
          <input value={filter} onChange={e => setFilter(e.target.value)} />
          <List items={filteredItems} />
        </div>
      );
    }
    
    // 只有items或filter变化时才重新计算
  `
};
```

### 4.3 引用稳定性

```typescript
// 场景：useEffect依赖
const referenceStability = {
  问题代码: `
    function Component({ id }) {
      const [data, setData] = useState(null);
      
      // ❌ 每次渲染都创建新对象
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
      
      useEffect(() => {
        fetchData(id, options).then(setData);
      }, [id, options]); // options每次都变，effect总是执行
      
      return <div>{data}</div>;
    }
  `,
  
  优化代码: `
    function Component({ id }) {
      const [data, setData] = useState(null);
      
      // ✓ 使用useMemo保持引用稳定
      const options = useMemo(() => ({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }), []);
      
      useEffect(() => {
        fetchData(id, options).then(setData);
      }, [id, options]); // options稳定，只在id变化时执行
      
      return <div>{data}</div>;
    }
    
    // 或者移除options依赖
    function Component({ id }) {
      const [data, setData] = useState(null);
      
      useEffect(() => {
        const options = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        };
        fetchData(id, options).then(setData);
      }, [id]); // 只依赖id
      
      return <div>{data}</div>;
    }
  `
};
```

## 5. 常见陷阱

### 5.1 过度使用

```typescript
const overuse = {
  问题: '不是所有场景都需要useMemo/useCallback',
  
  不必要的优化: `
    function Component() {
      // ❌ 不必要：基本类型计算很快
      const sum = useMemo(() => 1 + 2, []);
      
      // ❌ 不必要：简单字符串拼接
      const message = useMemo(() => 'Hello ' + name, [name]);
      
      // ❌ 不必要：子组件没有优化
      const handleClick = useCallback(() => {
        console.log('click');
      }, []);
      
      return <div onClick={handleClick}>{message}</div>;
      // div不会做props比较，useCallback无意义
    }
  `,
  
  应该使用的场景: [
    '1. 昂贵的计算',
    '2. 子组件使用React.memo',
    '3. 依赖数组中的引用类型',
    '4. 自定义Hook返回的值',
    '5. Context value对象'
  ],
  
  性能开销: `
    useMemo/useCallback本身也有开销:
    - 创建闭包
    - 存储依赖
    - 比较依赖
    
    如果计算很简单，可能还不如直接计算
  `
};
```

### 5.2 依赖遗漏

```typescript
const missingDependencies = {
  问题代码: `
    function Component() {
      const [count, setCount] = useState(0);
      const [multiplier, setMultiplier] = useState(2);
      
      // ❌ 错误：遗漏multiplier依赖
      const result = useMemo(() => {
        return count * multiplier;
      }, [count]); // 应该包含multiplier
      
      // multiplier变化时，result不会更新
    }
  `,
  
  正确代码: `
    const result = useMemo(() => {
      return count * multiplier;
    }, [count, multiplier]); // ✓ 包含所有依赖
  `,
  
  ESLint规则: `
    // 使用 eslint-plugin-react-hooks
    {
      "plugins": ["react-hooks"],
      "rules": {
        "react-hooks/exhaustive-deps": "warn"
      }
    }
    
    // 会警告遗漏的依赖
  `
};
```

### 5.3 闭包陷阱

```typescript
const closureTrap = {
  问题代码: `
    function Component() {
      const [count, setCount] = useState(0);
      
      // ❌ 空依赖导致闭包问题
      const handleClick = useCallback(() => {
        console.log(count); // 总是打印初始值0
        setCount(count + 1); // 总是设置为1
      }, []); // 闭包捕获初始count
      
      return (
        <button onClick={handleClick}>
          Count: {count}
        </button>
      );
    }
  `,
  
  解决方案1: `
    // 添加依赖
    const handleClick = useCallback(() => {
      console.log(count);
      setCount(count + 1);
    }, [count]); // count变化时更新函数
  `,
  
  解决方案2: `
    // 使用函数式更新
    const handleClick = useCallback(() => {
      setCount(c => {
        console.log(c); // 获取最新值
        return c + 1;
      });
    }, []); // 不依赖count
  `,
  
  解决方案3: `
    // 使用ref
    const countRef = useRef(count);
    countRef.current = count;
    
    const handleClick = useCallback(() => {
      console.log(countRef.current); // 最新值
      setCount(c => c + 1);
    }, []);
  `
};
```

## 6. 最佳实践

### 6.1 何时使用

```typescript
const whenToUse = {
  useMemo适用场景: [
    {
      场景: '昂贵计算',
      示例: `
        const result = useMemo(() => {
          return complexCalculation(data);
        }, [data]);
      `
    },
    {
      场景: '引用稳定性',
      示例: `
        const options = useMemo(() => ({
          method: 'GET'
        }), []);
        
        useEffect(() => {
          fetch(url, options);
        }, [url, options]);
      `
    },
    {
      场景: '避免子组件重渲染',
      示例: `
        const items = useMemo(() => 
          data.map(transform), 
          [data]
        );
        
        <MemoizedList items={items} />
      `
    }
  ],
  
  useCallback适用场景: [
    {
      场景: '传递给优化的子组件',
      示例: `
        const handleClick = useCallback(() => {
          doSomething();
        }, []);
        
        <MemoizedButton onClick={handleClick} />
      `
    },
    {
      场景: '作为useEffect依赖',
      示例: `
        const fetchData = useCallback(() => {
          fetch(url);
        }, [url]);
        
        useEffect(() => {
          fetchData();
        }, [fetchData]);
      `
    },
    {
      场景: '自定义Hook返回',
      示例: `
        function useCustomHook() {
          const handler = useCallback(() => {
            // ...
          }, []);
          
          return { handler };
        }
      `
    }
  ],
  
  不需要使用的场景: [
    '基本类型计算',
    '简单字符串操作',
    '子组件没有优化',
    '组件本身很简单',
    '不在依赖数组中的引用'
  ]
};
```

### 6.2 依赖管理

```typescript
const dependencyManagement = {
  规则: [
    '1. 包含所有使用的外部变量',
    '2. 不要遗漏依赖',
    '3. 不要在依赖中使用对象/数组字面量',
    '4. 考虑使用useRef减少依赖'
  ],
  
  技巧: {
    解构props: `
      // ✓ 好：解构需要的值
      function Component({ user }) {
        const userName = user.name;
        
        const greeting = useMemo(() => {
          return \`Hello, \${userName}\`;
        }, [userName]); // 只依赖name
      }
    `,
    
    提取常量: `
      // 组件外定义常量
      const CONFIG = { threshold: 10 };
      
      function Component() {
        const value = useMemo(() => {
          return compute(CONFIG);
        }, []); // CONFIG是常量，不需要依赖
      }
    `,
    
    使用ref: `
      function Component({ onChange }) {
        const onChangeRef = useRef(onChange);
        onChangeRef.current = onChange;
        
        const handler = useCallback(() => {
          onChangeRef.current();
        }, []); // 不依赖onChange
      }
    `
  }
};
```

## 7. 性能测试

```typescript
// 性能对比测试
const performanceTest = {
  测试代码: `
    function TestComponent({ items }) {
      const [count, setCount] = useState(0);
      
      // 不使用useMemo
      console.time('without useMemo');
      const result1 = items.filter(item => item.active)
                          .map(item => item.value)
                          .reduce((sum, val) => sum + val, 0);
      console.timeEnd('without useMemo');
      
      // 使用useMemo
      console.time('with useMemo');
      const result2 = useMemo(() => {
        return items.filter(item => item.active)
                    .map(item => item.value)
                    .reduce((sum, val) => sum + val, 0);
      }, [items]);
      console.timeEnd('with useMemo');
      
      return (
        <div>
          <p>Result: {result2}</p>
          <button onClick={() => setCount(c => c + 1)}>
            Trigger Re-render: {count}
          </button>
        </div>
      );
    }
  `,
  
  结果分析: `
    首次渲染:
    - without useMemo: 0.5ms
    - with useMemo: 0.6ms (稍慢，因为有额外的缓存逻辑)
    
    count变化导致的重渲染（items未变）:
    - without useMemo: 0.5ms (每次重新计算)
    - with useMemo: 0.01ms (使用缓存值)
    
    结论: 
    - 对于昂贵计算，useMemo有明显优势
    - 对于简单计算，可能还不如直接计算
  `
};
```

## 8. 面试高频问题

```typescript
const interviewQA = {
  Q1: {
    question: 'useMemo和useCallback的区别?',
    answer: [
      '1. useMemo缓存计算结果',
      '2. useCallback缓存函数引用',
      '3. useCallback等价于useMemo(() => fn, deps)',
      '4. 都用于性能优化',
      '5. 都使用浅比较依赖'
    ]
  },
  
  Q2: {
    question: 'useMemo的实现原理?',
    answer: `
      1. mount时执行计算函数获取值
      2. 保存[value, deps]到hook.memoizedState
      3. update时比较依赖
      4. 依赖未变返回缓存值
      5. 依赖变化重新计算
    `
  },
  
  Q3: {
    question: '何时使用useMemo?',
    answer: [
      '1. 昂贵的计算',
      '2. 需要引用稳定性',
      '3. 传递给React.memo组件',
      '4. 作为其他Hook的依赖',
      '5. Context value对象'
    ]
  },
  
  Q4: {
    question: 'useMemo一定能提升性能吗?',
    answer: `
      不一定:
      
      useMemo本身有开销:
      - 创建闭包
      - 存储依赖
      - 比较依赖
      
      只有当计算成本 > useMemo开销时，
      才真正提升性能
      
      简单计算可能还不如直接计算
    `
  },
  
  Q5: {
    question: 'useCallback的闭包陷阱如何避免?',
    answer: [
      '1. 正确添加依赖',
      '2. 使用函数式更新',
      '3. 使用useRef存储最新值',
      '4. 使用useReducer',
      '5. 启用ESLint规则检查'
    ]
  },
  
  Q6: {
    question: '如何优化大列表渲染?',
    answer: `
      1. 使用React.memo包裹列表项
      2. useCallback缓存事件处理器
      3. useMemo缓存过滤/排序结果
      4. 虚拟滚动(react-window)
      5. 分页加载
      6. key使用稳定ID
    `
  }
};
```

## 9. 总结

useMemo和useCallback手写实现的核心要点:

1. **数据结构**: [value, deps]存储在hook.memoizedState
2. **依赖比较**: Object.is浅比较
3. **缓存机制**: 依赖未变返回缓存值
4. **性能权衡**: 不是所有场景都需要
5. **最佳实践**: 昂贵计算、引用稳定、子组件优化
6. **陷阱**: 过度使用、依赖遗漏、闭包问题
7. **关系**: useCallback是useMemo的特例

理解useMemo和useCallback是React性能优化的关键。

