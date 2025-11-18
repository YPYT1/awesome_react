# Hooks使用最佳实践 - React Hooks完全指南

本文档详细介绍React Hooks的最佳实践、常见陷阱及解决方案。

## 1. useState最佳实践

### 1.1 初始状态

```tsx
// ✅ 简单值直接初始化
const [count, setCount] = useState(0);
const [name, setName] = useState('');

// ✅ 昂贵计算使用函数初始化
const [data, setData] = useState(() => {
  const savedData = localStorage.getItem('data');
  return savedData ? JSON.parse(savedData) : [];
});

// ❌ 避免每次渲染都执行昂贵计算
const [data, setData] = useState(expensiveComputation());
```

### 1.2 状态更新

```tsx
// ✅ 函数式更新 (依赖前一个值)
setCount(prevCount => prevCount + 1);

// ✅ 批量更新会自动合并
function handleClick() {
  setCount(c => c + 1);
  setCount(c => c + 1); // 会正确执行
}

// ❌ 避免直接依赖当前state
setCount(count + 1);
setCount(count + 1); // 第二次更新可能不正确
```

### 1.3 状态拆分

```tsx
// ❌ 过度集中的状态
const [state, setState] = useState({
  user: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {}
});

// ✅ 按关注点拆分
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({});
const [pagination, setPagination] = useState({});

// ✅ 相关状态可以组合
const [formData, setFormData] = useState({
  username: '',
  email: '',
  password: ''
});
```

## 2. useEffect最佳实践

### 2.1 依赖数组

```tsx
// ✅ 完整声明依赖
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]);

// ✅ 使用ESLint插件检查
// eslint-plugin-react-hooks会警告缺失依赖

// ❌ 避免省略依赖
useEffect(() => {
  fetchUser(userId).then(setUser);
}, []); // 错误: userId变化时不会重新执行
```

### 2.2 清理函数

```tsx
// ✅ 清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(timer);
}, []);

// ✅ 清理事件监听
useEffect(() => {
  const handleResize = () => setWindowSize(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
}, []);

// ✅ 清理异步操作
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

### 2.3 避免无限循环

```tsx
// ❌ 依赖对象/数组导致无限循环
useEffect(() => {
  const options = { page: 1 };
  fetchData(options);
}, [{ page: 1 }]); // 每次都是新对象

// ✅ 使用useMemo缓存
const options = useMemo(() => ({ page: 1 }), []);
useEffect(() => {
  fetchData(options);
}, [options]);

// ✅ 或者直接依赖原始值
useEffect(() => {
  fetchData({ page: 1 });
}, []);
```

## 3. useMemo和useCallback最佳实践

### 3.1 何时使用useMemo

```tsx
// ✅ 昂贵计算
const expensiveValue = useMemo(() => {
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += i;
  }
  return result;
}, []);

// ✅ 避免子组件不必要渲染
const userOptions = useMemo(() => 
  users.map(u => ({ label: u.name, value: u.id })),
  [users]
);

// ❌ 简单计算不需要useMemo
const doubleCount = useMemo(() => count * 2, [count]); // 过度优化
const doubleCount = count * 2; // 更简单
```

### 3.2 何时使用useCallback

```tsx
// ✅ 传递给优化子组件的回调
const MemoizedChild = React.memo(Child);

function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <MemoizedChild onClick={handleClick} />;
}

// ✅ useEffect的依赖
function Component({ userId }) {
  const fetchUser = useCallback(() => {
    return fetch(`/api/users/${userId}`);
  }, [userId]);
  
  useEffect(() => {
    fetchUser().then(setUser);
  }, [fetchUser]);
}

// ❌ 不需要memo的子组件不需要useCallback
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // 过度优化
  
  return <Child onClick={handleClick} />; // Child没有memo
}
```

## 4. useRef最佳实践

### 4.1 DOM引用

```tsx
// ✅ 访问DOM元素
function Component() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focus = () => {
    inputRef.current?.focus();
  };
  
  return <input ref={inputRef} />;
}
```

### 4.2 保存可变值

```tsx
// ✅ 保存定时器ID
function Component() {
  const timerRef = useRef<number>();
  
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      console.log('tick');
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, []);
}

// ✅ 保存最新值
function Component({ count }) {
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current); // 总是最新值
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
}
```

## 5. useContext最佳实践

### 5.1 Context设计

```tsx
// ✅ 拆分Context避免不必要渲染
const UserContext = createContext(null);
const ThemeContext = createContext('light');

// ✅ 提供自定义Hook
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// ✅ 使用useMemo优化value
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

## 6. 自定义Hook最佳实践

### 6.1 命名规范

```tsx
// ✅ use前缀
function useAuth() { /* ... */ }
function useLocalStorage() { /* ... */ }
function useDebounce() { /* ... */ }

// ❌ 错误命名
function authHook() { /* ... */ }
function getLocalStorage() { /* ... */ }
```

### 6.2 Hook组合

```tsx
// ✅ 组合多个Hook创建复杂逻辑
function useUserData(userId: string) {
  const { user, loading: userLoading } = useUser(userId);
  const { posts, loading: postsLoading } = usePosts(userId);
  const followers = useFollowers(userId);
  
  return {
    user,
    posts,
    followers,
    loading: userLoading || postsLoading
  };
}
```

### 6.3 返回值设计

```tsx
// ✅ 单一值直接返回
function useWindowSize() {
  const [size, setSize] = useState(window.innerWidth);
  // ...
  return size;
}

// ✅ 多个值返回对象
function useFetch(url: string) {
  return {
    data,
    loading,
    error,
    refetch
  };
}

// ✅ 类似useState的返回数组
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle] as const;
}
```

## 7. Hooks规则

```typescript
const hooksRules = {
  规则1: '只在函数组件或自定义Hook中调用Hook',
  规则2: '只在函数顶层调用Hook，不在循环、条件或嵌套函数中调用',
  规则3: 'Hook调用顺序必须保持一致',
  
  // ❌ 违反规则
  错误示例: [
    `
    // 条件调用
    if (condition) {
      useEffect(() => {});
    }
    `,
    `
    // 循环调用
    for (let i = 0; i < 10; i++) {
      useState(0);
    }
    `,
    `
    // 嵌套函数调用
    function handleClick() {
      useState(0);
    }
    `
  ],
  
  // ✅ 正确示例
  正确示例: `
    function Component() {
      const [count, setCount] = useState(0);
      useEffect(() => {});
      const data = useFetch('/api/data');
      return <div>{count}</div>;
    }
  `
};
```

## 8. 性能优化

```tsx
// ✅ React.memo优化组件
const MemoizedComponent = React.memo(function Component({ data }) {
  return <div>{data}</div>;
});

// ✅ useMemo优化计算
const sortedData = useMemo(() => 
  data.sort((a, b) => a.value - b.value),
  [data]
);

// ✅ useCallback优化回调
const handleClick = useCallback(() => {
  console.log(data);
}, [data]);

// ✅ 使用useTransition处理非紧急更新
const [isPending, startTransition] = useTransition();

function handleChange(value) {
  setInputValue(value); // 紧急更新
  startTransition(() => {
    setSearchResults(search(value)); // 非紧急更新
  });
}
```

## 9. 常见Hook模式

### 9.1 数据获取

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [url]);
  
  return { data, loading, error };
}
```

### 9.2 本地存储

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue] as const;
}
```

### 9.3 防抖和节流

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return throttledValue;
}
```

## 10. 测试Hooks

```tsx
import { renderHook, act } from '@testing-library/react';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## 11. 总结

Hooks最佳实践要点:

1. **useState**: 函数式初始化、函数式更新、合理拆分
2. **useEffect**: 完整依赖、清理函数、避免无限循环
3. **useMemo/useCallback**: 适度优化、避免过度使用
4. **useRef**: DOM引用、保存可变值
5. **useContext**: 拆分Context、提供自定义Hook
6. **自定义Hook**: 遵循命名规范、合理组合
7. **遵循规则**: 顶层调用、保持顺序

持续实践这些原则可以写出高质量的React代码。

