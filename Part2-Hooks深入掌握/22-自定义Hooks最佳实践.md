# 自定义Hooks最佳实践

## 学习目标

通过本章学习，你将全面掌握：

- 自定义Hooks的设计原则
- 命名规范和代码组织
- 参数设计和返回值模式
- 错误处理和边界情况
- 性能优化技巧
- 测试策略和方法
- TypeScript类型定义
- 文档编写规范
- 发布和维护最佳实践
- React 19特性集成

## 第一部分：设计原则

### 1.1 单一职责原则

每个自定义Hook应该只做一件事，并且做好。

```jsx
// ❌ 不好：一个Hook做太多事情
function useUserManager() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [followers, setFollowers] = useState([]);
  
  // 获取用户数据
  const fetchUser = async (userId) => {
    const userData = await fetch(`/api/users/${userId}`);
    setUser(userData);
  };
  
  // 获取用户文章
  const fetchPosts = async (userId) => {
    const postsData = await fetch(`/api/users/${userId}/posts`);
    setPosts(postsData);
  };
  
  // 获取评论
  const fetchComments = async (userId) => {
    const commentsData = await fetch(`/api/users/${userId}/comments`);
    setComments(commentsData);
  };
  
  // 获取关注者
  const fetchFollowers = async (userId) => {
    const followersData = await fetch(`/api/users/${userId}/followers`);
    setFollowers(followersData);
  };
  
  return {
    user,
    posts,
    comments,
    followers,
    fetchUser,
    fetchPosts,
    fetchComments,
    fetchFollowers
  };
}

// ✅ 好：拆分成多个专注的Hooks
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUser(data);
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
  }, [userId]);
  
  return { user, loading, error };
}

function useUserPosts(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/users/${userId}/posts`)
      .then(res => res.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { posts, loading };
}

// 组合使用
function UserProfile({ userId }) {
  const { user, loading: userLoading } = useUser(userId);
  const { posts, loading: postsLoading } = useUserPosts(userId);
  
  if (userLoading || postsLoading) return <div>加载中...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

### 1.2 可组合性原则

设计可以相互组合的Hooks。

```jsx
// 基础Hooks
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 组合使用创建复杂功能
function useDropdown() {
  const [isOpen, toggleOpen] = useToggle(false);
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, () => {
    if (isOpen) toggleOpen();
  });
  
  return {
    isOpen,
    toggleOpen,
    dropdownRef,
    dropdownProps: {
      ref: dropdownRef,
      'aria-expanded': isOpen
    }
  };
}

// 使用示例
function Dropdown({ options }) {
  const { isOpen, toggleOpen, dropdownProps } = useDropdown();
  
  return (
    <div {...dropdownProps}>
      <button onClick={toggleOpen}>选择</button>
      {isOpen && (
        <ul>
          {options.map(opt => <li key={opt.id}>{opt.label}</li>)}
        </ul>
      )}
    </div>
  );
}
```

### 1.3 数据不可变性原则

始终返回新的对象/数组，而不是修改原有的。

```jsx
// ❌ 不好：直接修改状态
function useBadArray(initialValue = []) {
  const [array, setArray] = useState(initialValue);
  
  const push = (element) => {
    array.push(element); // 直接修改！
    setArray(array);
  };
  
  return { array, push };
}

// ✅ 好：返回新数组
function useArray(initialValue = []) {
  const [array, setArray] = useState(initialValue);
  
  const push = useCallback((element) => {
    setArray(arr => [...arr, element]); // 创建新数组
  }, []);
  
  const filter = useCallback((callback) => {
    setArray(arr => arr.filter(callback));
  }, []);
  
  const update = useCallback((index, newElement) => {
    setArray(arr => [
      ...arr.slice(0, index),
      newElement,
      ...arr.slice(index + 1)
    ]);
  }, []);
  
  return { array, push, filter, update };
}
```

## 第二部分：命名规范

### 2.1 使用"use"前缀

所有自定义Hook必须以"use"开头，这是React的规则。

```jsx
// ✅ 正确
function useWindowSize() { }
function useLocalStorage() { }
function useDebounce() { }

// ❌ 错误
function windowSize() { }
function getLocalStorage() { }
function debounce() { }
```

### 2.2 清晰描述功能

名称应该清楚地表达Hook的用途。

```jsx
// ✅ 好：名称清晰
function useMousePosition() { }
function useAsyncData() { }
function useFormValidation() { }
function usePreviousValue() { }

// ❌ 不好：名称模糊
function useData() { }
function useUtil() { }
function useHelper() { }
function useLogic() { }
```

### 2.3 命名约定

```jsx
// 状态相关：use + 名词
function useUser() { }
function useCart() { }
function useSettings() { }

// 操作相关：use + 动词 + 名词
function useFetchUser() { }
function useToggleTheme() { }
function useDebounceValue() { }

// 事件监听：use + 事件名
function useKeyPress() { }
function useMouseMove() { }
function useWindowResize() { }

// 副作用：use + 动词 + Effect
function useMountEffect() { }
function useUpdateEffect() { }
function useUnmountEffect() { }
```

## 第三部分：参数设计

### 3.1 参数顺序

将必需参数放在前面，可选参数放在后面。

```jsx
// ✅ 好：必需参数在前
function useDebounce(value, delay, options = {}) {
  // value和delay是必需的
  // options是可选的
}

// ❌ 不好：混乱的参数顺序
function useDebounce(options = {}, value, delay) { }
```

### 3.2 使用配置对象

当参数较多时，使用配置对象。

```jsx
// ❌ 不好：太多独立参数
function useFetch(url, method, headers, body, retries, timeout, cache) {
  // 参数太多，难以记忆和使用
}

// ✅ 好：使用配置对象
function useFetch(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    retries = 3,
    timeout = 5000,
    cache = true
  } = options;
  
  // 实现...
}

// 使用
const { data } = useFetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
});
```

### 3.3 提供合理的默认值

```jsx
// ✅ 提供默认值
function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  return [storedValue, setStoredValue];
}

// 使用时可以省略第二个参数
const [theme] = useLocalStorage('theme'); // 默认为null
const [user] = useLocalStorage('user', {}); // 默认为{}
```

### 3.4 参数验证

对关键参数进行验证。

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  
  // 参数验证
  useEffect(() => {
    if (typeof callback !== 'function') {
      console.error('useInterval: callback必须是函数');
      return;
    }
  }, [callback]);
  
  useEffect(() => {
    if (delay !== null && typeof delay !== 'number') {
      console.error('useInterval: delay必须是数字或null');
      return;
    }
  }, [delay]);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

## 第四部分：返回值设计

### 4.1 数组vs对象

根据返回值的数量和性质选择合适的返回类型。

```jsx
// 返回2个值：使用数组（类似useState）
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return [value, toggle];
}

// 使用时可以自定义命名
const [isOpen, toggleOpen] = useToggle();
const [isVisible, toggleVisible] = useToggle();

// 返回多个值：使用对象
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const refetch = useCallback(() => {
    // 重新获取
  }, [userId]);
  
  return {
    user,
    loading,
    error,
    refetch
  };
}

// 使用时可以选择性解构
const { user, loading } = useUser(123); // 不需要error和refetch
```

### 4.2 一致的返回模式

在整个项目中保持一致的返回模式。

```jsx
// 统一的异步数据获取模式
function useAsyncPattern() {
  return {
    data: null,      // 数据
    loading: true,   // 加载状态
    error: null,     // 错误信息
    refetch: () => {}  // 重新获取函数
  };
}

// 所有数据获取Hooks使用相同模式
function useUser(userId) {
  // ...
  return { data: user, loading, error, refetch };
}

function usePosts() {
  // ...
  return { data: posts, loading, error, refetch };
}

function useComments() {
  // ...
  return { data: comments, loading, error, refetch };
}
```

### 4.3 返回辅助属性

返回有用的辅助信息和工具函数。

```jsx
function useAsync(asyncFunction) {
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: null
  });
  
  const execute = useCallback(async (...args) => {
    setState({ loading: true, data: null, error: null });
    try {
      const data = await asyncFunction(...args);
      setState({ loading: false, data, error: null });
      return data;
    } catch (error) {
      setState({ loading: false, data: null, error });
      throw error;
    }
  }, [asyncFunction]);
  
  return {
    // 主要状态
    ...state,
    
    // 辅助布尔值（方便条件判断）
    isIdle: !state.loading && !state.data && !state.error,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !state.loading && !state.error && !!state.data,
    
    // 操作函数
    execute
  };
}

// 使用
function Component() {
  const { data, isLoading, isError, execute } = useAsync(fetchData);
  
  if (isLoading) return <div>加载中...</div>;
  if (isError) return <div>出错了</div>;
  
  return <div>{data}</div>;
}
```

## 第五部分：错误处理

### 5.1 优雅的错误处理

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}
```

### 5.2 错误边界

```jsx
function useErrorBoundary() {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (error) {
      // 可以上报错误到监控系统
      logErrorToService(error);
    }
  }, [error]);
  
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  const catchError = useCallback((callback) => {
    try {
      callback();
    } catch (err) {
      setError(err);
    }
  }, []);
  
  return {
    error,
    resetError,
    catchError,
    hasError: error !== null
  };
}

// 使用
function Component() {
  const { error, hasError, resetError, catchError } = useErrorBoundary();
  
  const handleClick = () => {
    catchError(() => {
      throw new Error('Something went wrong');
    });
  };
  
  if (hasError) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={resetError}>重试</button>
      </div>
    );
  }
  
  return <button onClick={handleClick}>点击</button>;
}
```

### 5.3 类型安全的错误处理

```tsx
// TypeScript版本
interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsync<T>(
  asyncFunction: () => Promise<T>
): UseAsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });
  
  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
    }
  }, [asyncFunction]);
  
  return { ...state, execute };
}
```

## 第六部分：性能优化

### 6.1 使用useCallback和useMemo

```jsx
function useFilteredList(items, filterText) {
  // 缓存过滤函数
  const filterFunction = useCallback((item) => {
    return item.name.toLowerCase().includes(filterText.toLowerCase());
  }, [filterText]);
  
  // 缓存过滤结果
  const filteredItems = useMemo(() => {
    return items.filter(filterFunction);
  }, [items, filterFunction]);
  
  // 缓存排序结果
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredItems]);
  
  return sortedItems;
}
```

### 6.2 避免不必要的Effect

```jsx
// ❌ 不好：不必要的useEffect
function useBadFullName(firstName, lastName) {
  const [fullName, setFullName] = useState('');
  
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  
  return fullName;
}

// ✅ 好：直接计算
function useFullName(firstName, lastName) {
  return useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);
}

// 或者更简单
function useFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}
```

### 6.3 懒初始化

```jsx
function useExpensiveInitialization() {
  // ❌ 不好：每次渲染都计算
  const [data] = useState(expensiveComputation());
  
  // ✅ 好：只在初始化时计算一次
  const [data] = useState(() => expensiveComputation());
  
  return data;
}
```

### 6.4 防抖和节流

```jsx
// 防抖Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 节流Hook
function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}
```

## 第七部分：测试策略

### 7.1 使用@testing-library/react-hooks

```jsx
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('should initialize with 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('should increment', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should decrement', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
  
  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
  
  it('should respect min and max values', () => {
    const { result } = renderHook(() => 
      useCounter(5, { min: 0, max: 10 })
    );
    
    // 不能超过max
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.increment();
      }
    });
    expect(result.current.count).toBe(10);
    
    // 不能低于min
    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.decrement();
      }
    });
    expect(result.current.count).toBe(0);
  });
});
```

### 7.2 测试异步Hooks

```jsx
import { renderHook, waitFor } from '@testing-library/react-hooks';
import useAsync from './useAsync';

describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const asyncFn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    
    act(() => {
      result.current.execute();
    });
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBe('data');
    expect(result.current.error).toBe(null);
  });
  
  it('should handle async error', async () => {
    const error = new Error('Failed');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn));
    
    act(() => {
      result.current.execute();
    });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(error);
  });
});
```

### 7.3 测试副作用清理

```jsx
describe('useEventListener', () => {
  it('should add and remove event listener', () => {
    const handler = jest.fn();
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => 
      useEventListener('resize', handler)
    );
    
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    
    unmount();
    
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });
});
```

## 第八部分：TypeScript最佳实践

### 8.1 泛型Hooks

```tsx
// 泛型useState Hook
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用
const [user, setUser] = useLocalStorage<User>('user', { name: '', age: 0 });
```

### 8.2 复杂类型定义

```tsx
interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null
  });
  
  const execute = useCallback(async (...args: any[]) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await asyncFunction(...args);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, loading: false, error: err });
      onError?.(err);
    }
  }, [asyncFunction, onSuccess, onError]);
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);
  
  return { ...state, execute, reset };
}
```

### 8.3 事件类型定义

```tsx
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement = window
) {
  const savedHandler = useRef<(event: WindowEventMap[K]) => void>();
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (event: Event) => {
      savedHandler.current?.(event as WindowEventMap[K]);
    };
    
    element.addEventListener(eventName, eventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// 使用时会有类型提示
useEventListener('click', (event) => {
  // event类型自动推断为MouseEvent
  console.log(event.clientX, event.clientY);
});

useEventListener('keydown', (event) => {
  // event类型自动推断为KeyboardEvent
  console.log(event.key);
});
```

## 第九部分：文档编写

### 9.1 JSDoc注释

```jsx
/**
 * 管理本地存储的Hook
 * 
 * @template T - 存储值的类型
 * @param {string} key - localStorage的键名
 * @param {T} initialValue - 初始值
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} 返回值数组，包含当前值和设置函数
 * 
 * @example
 * ```jsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * 
 * return (
 *   <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     切换主题
 *   </button>
 * );
 * ```
 */
function useLocalStorage(key, initialValue) {
  // 实现...
}
```

### 9.2 README文档

```markdown
# useAsync

异步操作管理Hook，提供loading、error、data状态。

## 安装

\`\`\`bash
npm install @your-package/use-async
\`\`\`

## 基础用法

\`\`\`jsx
import { useAsync } from '@your-package/use-async';

function UserProfile({ userId }) {
  const fetchUser = async () => {
    const response = await fetch(\`/api/users/\${userId}\`);
    return response.json();
  };
  
  const { data: user, loading, error, execute } = useAsync(fetchUser, {
    immediate: true
  });
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={execute}>刷新</button>
    </div>
  );
}
\`\`\`

## API

### 参数

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| asyncFunction | Function | 是 | - | 要执行的异步函数 |
| options | Object | 否 | {} | 配置选项 |
| options.immediate | boolean | 否 | false | 是否立即执行 |
| options.onSuccess | Function | 否 | - | 成功回调 |
| options.onError | Function | 否 | - | 错误回调 |

### 返回值

| 属性 | 类型 | 描述 |
|------|------|------|
| data | T | 异步操作返回的数据 |
| loading | boolean | 是否正在加载 |
| error | Error | 错误信息 |
| execute | Function | 手动执行异步函数 |
| reset | Function | 重置状态 |

## 高级用法

### 带参数的异步函数

\`\`\`jsx
const updateUser = async (userId, data) => {
  const response = await fetch(\`/api/users/\${userId}\`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
};

const { execute } = useAsync(updateUser);

const handleUpdate = () => {
  execute(123, { name: 'Alice' });
};
\`\`\`

### 成功和错误回调

\`\`\`jsx
const { data } = useAsync(fetchUser, {
  immediate: true,
  onSuccess: (data) => {
    console.log('获取成功:', data);
  },
  onError: (error) => {
    console.error('获取失败:', error);
  }
});
\`\`\`

## 注意事项

1. asyncFunction应该是稳定的引用，避免使用内联函数
2. 组件卸载时会自动取消pending状态的更新
3. TypeScript用户可以使用泛型指定返回类型

## License

MIT
```

## 注意事项

### 1. 遵循Hooks规则

```jsx
// ❌ 错误：在条件语句中调用Hook
function BadHook(condition) {
  if (condition) {
    const [state, setState] = useState(0); // 违反规则！
  }
}

// ✅ 正确：在顶层调用Hook
function GoodHook(condition) {
  const [state, setState] = useState(0);
  
  if (condition) {
    // 使用state
  }
}
```

### 2. 避免过度抽象

```jsx
// ❌ 过度抽象：简单逻辑不需要Hook
function useBadAddition(a, b) {
  return a + b; // 太简单，不需要Hook
}

// ✅ 合适的抽象：有状态或副作用
function useGoodAddition(initialA, initialB) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const sum = useMemo(() => a + b, [a, b]);
  
  return { sum, setA, setB };
}
```

### 3. 处理组件卸载

```jsx
function useDataFetch(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
        }
      });
    
    return () => {
      cancelled = true; // 组件卸载时取消更新
    };
  }, [url]);
  
  return data;
}
```

### 4. 依赖数组完整性

```jsx
// ❌ 错误：缺少依赖
function BadHook(userId, companyId) {
  useEffect(() => {
    fetchData(userId, companyId);
  }, [userId]); // 缺少companyId
}

// ✅ 正确：包含所有依赖
function GoodHook(userId, companyId) {
  useEffect(() => {
    fetchData(userId, companyId);
  }, [userId, companyId]);
}
```

### 5. SSR兼容性

```jsx
// 检查window是否存在
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  
  useEffect(() => {
    // useEffect只在客户端运行
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
```

## 常见问题

### Q1: 什么时候应该创建自定义Hook？

**A:** 当满足以下条件时考虑创建自定义Hook：

1. **逻辑复用**：多个组件需要相同的逻辑
2. **复杂度**：逻辑足够复杂，值得抽象
3. **有状态**：涉及useState、useEffect等Hook
4. **独立性**：逻辑相对独立，可以单独测试

```jsx
// ✅ 值得创建Hook的场景
function useFormValidation() {
  // 复杂的表单验证逻辑
  // 多个表单组件都需要
}

// ❌ 不需要Hook的场景
function calculateSum(a, b) {
  return a + b; // 简单纯函数
}
```

### Q2: Hook之间如何通信？

**A:** 通过共享状态或Context：

```jsx
// 方法1：通过props传递
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

function useDoubleCounter(count) {
  return count * 2;
}

function Component() {
  const { count, setCount } = useCounter();
  const doubled = useDoubleCounter(count); // 通过参数传递
}

// 方法2：通过Context
const CountContext = createContext();

function useCountProvider() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

function useCount() {
  return useContext(CountContext);
}
```

### Q3: 如何调试自定义Hook？

**A:** 使用多种调试技巧：

```jsx
// 1. console.log
function useDebugHook(value) {
  console.log('Hook called with:', value);
  
  useEffect(() => {
    console.log('Effect triggered');
  }, [value]);
  
  return value;
}

// 2. useDebugValue
function useCustomHook() {
  const [state, setState] = useState(0);
  
  // 在React DevTools中显示
  useDebugValue(state > 10 ? 'High' : 'Low');
  
  return [state, setState];
}

// 3. 自定义Hook日志
function useLogger(hookName, value) {
  useEffect(() => {
    console.log(`[${hookName}] Value changed:`, value);
  }, [hookName, value]);
}

function useTrackedState(initialState) {
  const [state, setState] = useState(initialState);
  useLogger('TrackedState', state);
  return [state, setState];
}
```

### Q4: Hook的性能开销大吗？

**A:** 正确使用时性能影响很小：

```jsx
// Hook本身很轻量
const [state, setState] = useState(0); // 非常快

// 主要开销来自：
// 1. 不必要的重新渲染
// 2. 复杂的计算
// 3. 频繁的副作用

// ✅ 优化技巧
function useOptimizedHook(data) {
  // 1. 缓存计算
  const processed = useMemo(() => {
    return expensiveOperation(data);
  }, [data]);
  
  // 2. 缓存回调
  const callback = useCallback(() => {
    doSomething(processed);
  }, [processed]);
  
  // 3. 减少依赖
  const stableRef = useRef(data);
  useEffect(() => {
    stableRef.current = data;
  }, [data]);
  
  return { processed, callback };
}
```

## 总结

### 核心原则清单

```jsx
// 1. 命名规范
✅ 使用"use"前缀
✅ 清晰描述功能
✅ 保持命名一致性

// 2. 设计原则
✅ 单一职责
✅ 可组合性
✅ 数据不可变

// 3. 参数设计
✅ 必需参数在前
✅ 使用配置对象
✅ 提供默认值
✅ 参数验证

// 4. 返回值设计
✅ 2个值用数组
✅ 多个值用对象
✅ 保持一致性
✅ 提供辅助信息

// 5. 错误处理
✅ 优雅降级
✅ 清晰的错误信息
✅ 类型安全

// 6. 性能优化
✅ 使用useCallback/useMemo
✅ 避免不必要的Effect
✅ 懒初始化
✅ 防抖节流

// 7. 测试
✅ 单元测试
✅ 异步测试
✅ 副作用清理测试

// 8. 文档
✅ JSDoc注释
✅ README文档
✅ 使用示例
✅ API文档
```

### 学习路径

1. **基础阶段**：理解React Hooks规则
2. **实践阶段**：创建简单的自定义Hooks
3. **进阶阶段**：设计复杂的Hooks组合
4. **专家阶段**：发布和维护Hooks库

### 推荐资源

- **官方文档**：React Hooks文档
- **开源项目**：ahooks、react-use、usehooks-ts
- **测试工具**：@testing-library/react-hooks
- **类型定义**：@types/react

通过遵循这些最佳实践，你可以创建出高质量、可维护、易测试的自定义Hooks，为项目和社区贡献优秀的代码！
