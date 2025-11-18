# 自定义Hooks基础

## 学习目标

通过本章学习，你将全面掌握：

- 自定义Hooks的概念和价值
- 自定义Hooks的命名规则和设计原则
- 如何提取和封装逻辑
- 自定义Hooks的参数和返回值设计
- 自定义Hooks的组合和嵌套
- 常见模式和最佳实践
- React 19中的自定义Hooks
- TypeScript集成
- 性能优化技巧
- 测试自定义Hooks
- 常见错误和解决方案

## 第一部分：自定义Hooks概述

### 1.1 什么是自定义Hooks

自定义Hooks是以"use"开头的函数，可以在其中调用其他Hooks，用于复用组件逻辑。

```jsx
// 不是自定义Hook：普通函数
function getWindowWidth() {
  return window.innerWidth;  // 无法调用Hooks
}

// 是自定义Hook：可以调用其他Hooks
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

// 使用自定义Hook
function Component() {
  const width = useWindowWidth();
  
  return (
    <div>
      窗口宽度: {width}px
      {width < 768 ? ' (移动端)' : ' (桌面端)'}
    </div>
  );
}
```

### 1.2 为什么需要自定义Hooks

自定义Hooks解决了逻辑复用的问题：

```jsx
// ❌ 问题：逻辑重复
function Component1() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>宽度: {width}</div>;
}

function Component2() {
  // 完全相同的逻辑
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>宽度: {width}</div>;
}

function Component3() {
  // 又是相同的逻辑
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>宽度: {width}</div>;
}

// ✅ 解决：提取为自定义Hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

// 所有组件都可以复用这个逻辑
function Component1() {
  const width = useWindowWidth();
  return <div>宽度: {width}</div>;
}

function Component2() {
  const width = useWindowWidth();
  return <div>宽度: {width}</div>;
}

function Component3() {
  const width = useWindowWidth();
  return <div>宽度: {width}</div>;
}
```

### 1.3 自定义Hooks vs 其他复用方案

```jsx
// 方案1：高阶组件（HOC）
function withWindowWidth(Component) {
  return function WrappedComponent(props) {
    const [width, setWidth] = useState(window.innerWidth);
    
    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return <Component {...props} width={width} />;
  };
}

// 问题：
// - 包装层级深
// - Props名称可能冲突
// - 调试困难

// 方案2：Render Props
function WindowWidth({ children }) {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return children(width);
}

// 使用
function Component() {
  return (
    <WindowWidth>
      {width => <div>宽度: {width}</div>}
    </WindowWidth>
  );
}

// 问题：
// - JSX嵌套深
// - 可读性差
// - 多个功能需要多层嵌套

// 方案3：自定义Hooks（推荐）
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

// 优势：
// - 简洁清晰
// - 无包装层级
// - 易于组合
// - 类型推导好
```

### 1.4 命名规则和约定

```jsx
// ✅ 正确：以use开头
function useCounter() { }
function useLocalStorage() { }
function useDebounce() { }
function useFetch() { }
function useAuth() { }

// ❌ 错误：不以use开头
function counter() { }  // 不能调用Hooks
function getLocalStorage() { }  // 不能调用Hooks
function fetchData() { }  // 不能调用Hooks

// ✅ 好的命名：描述性强、语义清晰
function useAuthentication() { }
function useFormValidation() { }
function useInfiniteScroll() { }
function useWindowDimensions() { }
function usePrevious() { }

// ❌ 不好的命名：过于简短或不明确
function useData() { }  // 太泛
function useX() { }  // 不明确
function useThing() { }  // 不清楚
function useHook() { }  // 无意义

// 命名建议：
// - 以use开头（必须）
// - 使用驼峰命名法
// - 描述Hook的功能
// - 避免过于抽象
// - 考虑可读性
```

## 第二部分：创建自定义Hooks

### 2.1 简单的自定义Hook

```jsx
// 示例1：useToggle - 布尔值切换
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return [value, { toggle, setTrue, setFalse }];
}

// 使用
function ModalComponent() {
  const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false);
  const [isLoading, { setTrue: startLoading, setFalse: stopLoading }] = useToggle(false);
  
  const handleSubmit = async () => {
    startLoading();
    await submitData();
    stopLoading();
    setFalse(); // 关闭模态框
  };
  
  return (
    <div>
      <button onClick={setTrue}>打开模态框</button>
      <button onClick={setFalse}>关闭模态框</button>
      <button onClick={toggle}>切换模态框</button>
      
      {isOpen && (
        <Modal onClose={setFalse}>
          <form onSubmit={handleSubmit}>
            {/* 表单内容 */}
            <button type="submit" disabled={isLoading}>
              {isLoading ? '提交中...' : '提交'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

async function submitData() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}
```

### 2.2 带参数的自定义Hook

```jsx
// useCounter：可配置的计数器
function useCounter(initialValue = 0, { min, max, step = 1 } = {}) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(c => {
      const newValue = c + step;
      if (max !== undefined && newValue > max) return c;
      return newValue;
    });
  }, [step, max]);
  
  const decrement = useCallback(() => {
    setCount(c => {
      const newValue = c - step;
      if (min !== undefined && newValue < min) return c;
      return newValue;
    });
  }, [step, min]);
  
  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);
  
  const set = useCallback((value) => {
    setCount(prev => {
      if (min !== undefined && value < min) return prev;
      if (max !== undefined && value > max) return prev;
      return value;
    });
  }, [min, max]);
  
  return {
    count,
    increment,
    decrement,
    reset,
    set
  };
}

// 使用
function CounterDemo() {
  const counter1 = useCounter(0, { min: 0, max: 10, step: 1 });
  const counter2 = useCounter(50, { min: 0, max: 100, step: 5 });
  
  return (
    <div>
      <div>
        <h3>计数器1 (0-10, 步长1)</h3>
        <p>Count: {counter1.count}</p>
        <button onClick={counter1.increment}>+1</button>
        <button onClick={counter1.decrement}>-1</button>
        <button onClick={counter1.reset}>重置</button>
      </div>
      
      <div>
        <h3>计数器2 (0-100, 步长5)</h3>
        <p>Count: {counter2.count}</p>
        <button onClick={counter2.increment}>+5</button>
        <button onClick={counter2.decrement}>-5</button>
        <button onClick={counter2.reset}>重置</button>
      </div>
    </div>
  );
}
```

### 2.3 返回值设计模式

```jsx
// 模式1：数组形式（类似useState）
function useArrayReturn(initialValue) {
  const [value, setValue] = useState(initialValue);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  
  // 优点：可以任意命名
  return [value, setValue, reset];
}

// 使用
function Component1() {
  const [count, setCount, resetCount] = useArrayReturn(0);
  const [name, setName, resetName] = useArrayReturn('');
  
  return <div />;
}

// 模式2：对象形式（推荐用于多返回值）
function useObjectReturn(initialValue) {
  const [value, setValue] = useState(initialValue);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  
  // 优点：语义清晰，不需要记住顺序
  return {
    value,
    setValue,
    reset
  };
}

// 使用
function Component2() {
  const { value: count, setValue: setCount, reset: resetCount } = useObjectReturn(0);
  const { value: name, setValue: setName, reset: resetName } = useObjectReturn('');
  
  return <div />;
}

// 模式3：混合形式
function useMixedReturn(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  return [
    value,  // 主要值
    {       // 辅助方法
      set: setValue,
      reset: () => setValue(initialValue),
      increment: () => setValue(v => v + 1),
      decrement: () => setValue(v => v - 1)
    }
  ];
}

// 使用
function Component3() {
  const [count, { set, reset, increment, decrement }] = useMixedReturn(0);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

### 2.4 复杂自定义Hook示例

```jsx
// useArray：数组操作Hook
function useArray(initialValue = []) {
  const [array, setArray] = useState(initialValue);
  
  const push = useCallback((element) => {
    setArray(arr => [...arr, element]);
  }, []);
  
  const filter = useCallback((callback) => {
    setArray(arr => arr.filter(callback));
  }, []);
  
  const update = useCallback((index, value) => {
    setArray(arr => {
      const copy = [...arr];
      copy[index] = value;
      return copy;
    });
  }, []);
  
  const remove = useCallback((index) => {
    setArray(arr => arr.filter((_, i) => i !== index));
  }, []);
  
  const clear = useCallback(() => {
    setArray([]);
  }, []);
  
  const insertAt = useCallback((index, element) => {
    setArray(arr => {
      const copy = [...arr];
      copy.splice(index, 0, element);
      return copy;
    });
  }, []);
  
  const move = useCallback((fromIndex, toIndex) => {
    setArray(arr => {
      const copy = [...arr];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  }, []);
  
  return {
    array,
    set: setArray,
    push,
    filter,
    update,
    remove,
    clear,
    insertAt,
    move
  };
}

// 使用
function TodoList() {
  const { array: todos, push, remove, update } = useArray([
    { id: 1, text: '学习React', completed: false },
    { id: 2, text: '构建项目', completed: false }
  ]);
  
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      push({ id: Date.now(), text: input, completed: false });
      setInput('');
    }
  };
  
  const toggleTodo = (index) => {
    update(index, { ...todos[index], completed: !todos[index].completed });
  };
  
  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && addTodo()}
        placeholder="添加待办事项"
      />
      <button onClick={addTodo}>添加</button>
      
      <ul>
        {todos.map((todo, index) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(index)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => remove(index)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 第三部分：常见自定义Hooks

### 3.1 useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  // 惰性初始化：避免每次渲染都读取localStorage
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });
  
  // 包装setState：自动同步到localStorage
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing localStorage:', error);
    }
  }, [key, storedValue]);
  
  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
}

// 使用
function SettingsPanel() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');
  const [preferences, setPreferences] = useLocalStorage('preferences', {
    notifications: true,
    autoSave: true,
    fontSize: 16
  });
  
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };
  
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className={`settings ${theme}`}>
      <h2>设置面板</h2>
      
      <div>
        <h3>主题</h3>
        <button onClick={toggleTheme}>
          切换到{theme === 'light' ? '深色' : '浅色'}模式
        </button>
      </div>
      
      <div>
        <h3>语言</h3>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>
      
      <div>
        <h3>偏好设置</h3>
        <label>
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={e => updatePreference('notifications', e.target.checked)}
          />
          接收通知
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={preferences.autoSave}
            onChange={e => updatePreference('autoSave', e.target.checked)}
          />
          自动保存
        </label>
        
        <label>
          字体大小:
          <input
            type="range"
            min="12"
            max="24"
            value={preferences.fontSize}
            onChange={e => updatePreference('fontSize', parseInt(e.target.value))}
          />
          {preferences.fontSize}px
        </label>
      </div>
    </div>
  );
}
```

### 3.2 useDebounce

```jsx
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // 清理定时器
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      
      fetch(`/api/search?q=${debouncedSearchTerm}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Search error:', error);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="搜索..."
      />
      
      {loading && <div>搜索中...</div>}
      
      {!loading && results.length > 0 && (
        <ul>
          {results.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
      
      {!loading && searchTerm && results.length === 0 && (
        <div>没有找到结果</div>
      )}
    </div>
  );
}
```

### 3.3 useThrottle

```jsx
function useThrottle(value, delay = 500) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastRan.current >= delay) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, delay - (Date.now() - lastRan.current));
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return throttledValue;
}

// 使用
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 100);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 1000
      }}
    >
      <div>实时滚动: {scrollY}px</div>
      <div>节流滚动: {throttledScrollY}px</div>
      <div className="note">节流可减少更新频率</div>
    </div>
  );
}
```

### 3.4 useFetch

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchWithCancel = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    fetchWithCancel();
    
    return () => {
      cancelled = true;
    };
  }, [url]);
  
  return { data, loading, error, refetch: fetchData };
}

// 使用
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useFetch(`/api/users/${userId}`);
  
  if (loading) return <div>加载中...</div>;
  if (error) return (
    <div>
      <p>错误: {error}</p>
      <button onClick={refetch}>重试</button>
    </div>
  );
  if (!user) return null;
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>邮箱: {user.email}</p>
      <p>角色: {user.role}</p>
      <button onClick={refetch}>刷新</button>
    </div>
  );
}
```

## 第四部分：Hooks组合

### 4.1 组合多个Hooks

```jsx
// useForm：组合多个Hook实现完整表单管理
function useForm(initialValues, validate) {
  // 组合useState
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // 组合useCallback
  const handleChange = useCallback((field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    setValues(prev => ({ ...prev, [field]: value }));
    
    // 如果已经访问过，立即验证
    if (touched[field] && validate) {
      const newValues = { ...values, [field]: value };
      const validationErrors = validate(newValues);
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    }
  }, [values, touched, validate]);
  
  const handleBlur = useCallback((field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
    }
  }, [values, validate]);
  
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault();
    
    // 标记所有字段为已访问
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // 验证
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setSubmitting(true);
    setSubmitCount(prev => prev + 1);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [values, validate]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    submitting,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
}

// 使用
function RegistrationForm() {
  const form = useForm(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    (values) => {
      const errors = {};
      
      if (!values.username) {
        errors.username = '用户名不能为空';
      } else if (values.username.length < 3) {
        errors.username = '用户名至少3个字符';
      }
      
      if (!values.email) {
        errors.email = '邮箱不能为空';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = '邮箱格式不正确';
      }
      
      if (!values.password) {
        errors.password = '密码不能为空';
      } else if (values.password.length < 8) {
        errors.password = '密码至少8个字符';
      }
      
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = '两次密码不一致';
      }
      
      return errors;
    }
  );
  
  const handleFormSubmit = async (values) => {
    console.log('提交表单:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('注册成功！');
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)}>
      <div>
        <label>用户名:</label>
        <input
          value={form.values.username}
          onChange={form.handleChange('username')}
          onBlur={form.handleBlur('username')}
        />
        {form.errors.username && form.touched.username && (
          <span className="error">{form.errors.username}</span>
        )}
      </div>
      
      <div>
        <label>邮箱:</label>
        <input
          type="email"
          value={form.values.email}
          onChange={form.handleChange('email')}
          onBlur={form.handleBlur('email')}
        />
        {form.errors.email && form.touched.email && (
          <span className="error">{form.errors.email}</span>
        )}
      </div>
      
      <div>
        <label>密码:</label>
        <input
          type="password"
          value={form.values.password}
          onChange={form.handleChange('password')}
          onBlur={form.handleBlur('password')}
        />
        {form.errors.password && form.touched.password && (
          <span className="error">{form.errors.password}</span>
        )}
      </div>
      
      <div>
        <label>确认密码:</label>
        <input
          type="password"
          value={form.values.confirmPassword}
          onChange={form.handleChange('confirmPassword')}
          onBlur={form.handleBlur('confirmPassword')}
        />
        {form.errors.confirmPassword && form.touched.confirmPassword && (
          <span className="error">{form.errors.confirmPassword}</span>
        )}
      </div>
      
      <div>
        <button type="submit" disabled={form.submitting}>
          {form.submitting ? '提交中...' : '注册'}
        </button>
        <button type="button" onClick={form.reset}>重置</button>
      </div>
      
      <p className="meta">提交次数: {form.submitCount}</p>
    </form>
  );
}
```

### 4.2 useAsync

```jsx
function useAsync(asyncFunction, immediate = true) {
  const [state, setState] = useState({
    loading: immediate,
    data: null,
    error: null
  });
  
  const execute = useCallback(async (...args) => {
    setState({ loading: true, data: null, error: null });
    
    try {
      const response = await asyncFunction(...args);
      setState({ loading: false, data: response, error: null });
      return response;
    } catch (error) {
      setState({ loading: false, data: null, error });
      throw error;
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);
  
  return {
    ...state,
    execute
  };
}

// 使用
function DataComponent() {
  const fetchData = useCallback(async () => {
    const response = await fetch('/api/data');
    return response.json();
  }, []);
  
  const { data, loading, error, execute } = useAsync(fetchData, true);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!data) return null;
  
  return (
    <div>
      <h2>数据</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={execute}>刷新</button>
    </div>
  );
}
```

## 第五部分：高级模式

### 5.1 usePrevious

```jsx
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 使用
function ComparisonComponent({ count }) {
  const previousCount = usePrevious(count);
  
  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一个值: {previousCount}</p>
      {previousCount !== undefined && (
        <p>
          变化: {count > previousCount ? '增加' : count < previousCount ? '减少' : '不变'}
        </p>
      )}
    </div>
  );
}
```

### 5.2 useUpdateEffect

```jsx
function useUpdateEffect(effect, deps) {
  const isFirstMount = useRef(true);
  
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    return effect();
  }, deps);
}

// 使用
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  // 只在userId更新时执行，不在初始挂载时执行
  useUpdateEffect(() => {
    console.log('用户ID已更新，重新获取用户数据');
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

function fetchUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

### 5.3 useInterval

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  
  // 保存最新的callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // 设置interval
  useEffect(() => {
    if (delay === null) {
      return;
    }
    
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    
    return () => clearInterval(id);
  }, [delay]);
}

// 使用
function Clock() {
  const [time, setTime] = useState(new Date());
  
  useInterval(() => {
    setTime(new Date());
  }, 1000);
  
  return (
    <div className="clock">
      {time.toLocaleTimeString()}
    </div>
  );
}

// 动态控制的定时器
function CountdownTimer({ initialSeconds }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  
  useInterval(
    () => {
      if (seconds > 0) {
        setSeconds(s => s - 1);
      } else {
        setIsRunning(false);
      }
    },
    isRunning ? 1000 : null  // delay为null时停止
  );
  
  return (
    <div>
      <h2>{seconds}秒</h2>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '暂停' : '开始'}
      </button>
      <button onClick={() => setSeconds(initialSeconds)}>重置</button>
    </div>
  );
}
```

## 第六部分：TypeScript集成

### 6.1 类型安全的自定义Hooks

```typescript
import { useState, useCallback, useEffect } from 'react';

// 泛型useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}

// 使用
function TypedComponent() {
  const [count, setCount] = useLocalStorage<number>('count', 0);
  const [user, setUser] = useLocalStorage<{ name: string; email: string } | null>('user', null);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      {user && <p>User: {user.name}</p>}
    </div>
  );
}
```

### 6.2 类型化的useFetch

```typescript
interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useFetch<T = any>(url: string, options?: RequestInit): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json() as T;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, loading, error, refetch: fetchData };
}

// 使用
interface User {
  id: number;
  name: string;
  email: string;
}

function UserComponent({ userId }: { userId: number }) {
  const { data: user, loading, error } = useFetch<User>(`/api/users/${userId}`);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;
  
  return <div>{user.name}</div>;
}
```

## 注意事项

### 1. 遵循Hooks规则

```jsx
// ❌ 错误：条件调用
function BadHook(condition) {
  if (condition) {
    const value = useState(0);  // 错误！
  }
  
  return value;
}

// ❌ 错误：循环调用
function BadLoop(items) {
  const states = items.map(item => useState(item));  // 错误！
  return states;
}

// ✅ 正确：顶层调用
function GoodHook() {
  const [value, setValue] = useState(0);
  const [name, setName] = useState('');
  
  // 可以在条件语句中使用Hook的返回值
  if (value > 10) {
    console.log('Value is large');
  }
  
  return { value, setValue, name, setName };
}
```

### 2. 依赖数组要正确

```jsx
// ❌ 错误：缺少依赖
function BadDeps(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(url).then(r => r.json()).then(setData);
  }, []);  // 缺少url依赖
  
  return data;
}

// ✅ 正确：包含所有依赖
function GoodDeps(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setData(data);
      });
    
    return () => {
      cancelled = true;
    };
  }, [url]);  // 包含url
  
  return data;
}
```

### 3. 避免过度抽象

```jsx
// ❌ 不好：过度抽象
function useValue(initial) {
  const [value, setValue] = useState(initial);
  return [value, setValue];
}

// 这和useState没什么区别，没必要封装

// ✅ 好：有实际价值的抽象
function useLocalStorageState(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// 这个Hook提供了额外的功能（持久化）
```

### 4. 性能优化

```jsx
// 使用useCallback缓存函数
function useOptimizedHook() {
  const [value, setValue] = useState(0);
  
  // ✅ 缓存回调函数
  const increment = useCallback(() => {
    setValue(v => v + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setValue(v => v - 1);
  }, []);
  
  return { value, increment, decrement };
}

// 使用useMemo缓存计算
function useComputedValue(data) {
  const computed = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  return computed;
}

function expensiveCalculation(data) {
  // 耗时计算
  return data.reduce((sum, item) => sum + item.value, 0);
}
```

### 5. 清理副作用

```jsx
// ✅ 正确清理
function useWebSocket(url) {
  const [data, setData] = useState(null);
  const ws = useRef(null);
  
  useEffect(() => {
    ws.current = new WebSocket(url);
    
    ws.current.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };
    
    // 清理函数
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);
  
  const send = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);
  
  return { data, send };
}
```

## 常见问题

### 1. 自定义Hook和普通函数的区别？

```jsx
// 普通函数：不能调用Hooks
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 自定义Hook：可以调用Hooks
function useTotal(items) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  return total;
}

// 何时使用？
// - 需要状态：使用自定义Hook
// - 纯计算：使用普通函数
```

### 2. 自定义Hook的状态是共享的吗？

不是。每次调用自定义Hook都会创建独立的状态。

```jsx
function useCounter() {
  const [count, setCount] = useState(0);
  return [count, setCount];
}

function Component() {
  const [count1, setCount1] = useCounter();  // 独立状态
  const [count2, setCount2] = useCounter();  // 独立状态
  
  return (
    <div>
      <p>Counter 1: {count1}</p>
      <button onClick={() => setCount1(c => c + 1)}>+</button>
      
      <p>Counter 2: {count2}</p>
      <button onClick={() => setCount2(c => c + 1)}>+</button>
    </div>
  );
}
```

### 3. 如何共享状态？

使用Context：

```jsx
const CounterContext = createContext(null);

function useSharedCounter() {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useSharedCounter must be used within CounterProvider');
  }
  return context;
}

function CounterProvider({ children }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  
  const value = useMemo(() => ({
    count,
    increment,
    decrement
  }), [count, increment, decrement]);
  
  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}

// 使用
function Component1() {
  const { count, increment } = useSharedCounter();
  return <button onClick={increment}>Count: {count}</button>;
}

function Component2() {
  const { count, decrement } = useSharedCounter();
  return <button onClick={decrement}>Count: {count}</button>;
}

function App() {
  return (
    <CounterProvider>
      <Component1 />
      <Component2 />
    </CounterProvider>
  );
}
```

### 4. 自定义Hook可以调用其他自定义Hook吗？

可以，这是组合的关键：

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);  // 调用其他自定义Hook
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      
      fetch(`/api/search?q=${debouncedQuery}`)
        .then(r => r.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);
  
  return {
    query,
    setQuery,
    results,
    loading
  };
}
```

### 5. 如何测试自定义Hook？

使用@testing-library/react-hooks（React 18之前）或renderHook（React 18+）：

```jsx
import { renderHook, act } from '@testing-library/react';

test('useCounter', () => {
  const { result } = renderHook(() => useCounter());
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

### 6. 自定义Hook的命名有什么要求？

必须以"use"开头，这样：
- ESLint可以检查Hooks规则
- React DevTools可以识别
- 开发者能立即识别

## 总结

### 自定义Hooks核心要点

1. **基本概念**
   - 以"use"开头的函数
   - 可以调用其他Hooks
   - 用于复用状态逻辑
   - 每次调用都是独立的状态

2. **使用场景**
   - 提取重复的Hook逻辑
   - 封装复杂的业务逻辑
   - 创建可复用的工具
   - 简化组件代码

3. **设计原则**
   - 单一职责
   - 语义清晰
   - 参数简洁
   - 返回值明确
   - 性能优化

4. **返回值模式**
   - 数组：类似useState，可任意命名
   - 对象：语义明确，不需要记住顺序
   - 混合：主值+辅助方法

5. **最佳实践**
   - 遵循Hooks规则
   - 正确的依赖数组
   - 使用useCallback/useMemo优化
   - 提供清理函数
   - 考虑SSR兼容性
   - 添加TypeScript类型

6. **常见模式**
   - 状态管理：useToggle、useCounter、useArray
   - 副作用：useDebounce、useThrottle、useInterval
   - 数据获取：useFetch、useAsync
   - 持久化：useLocalStorage、useSessionStorage
   - DOM操作：usePrevious、useUpdateEffect
   - 组合：useForm、useAuth、usePagination

7. **注意事项**
   - 不要过度抽象
   - 避免循环或条件调用
   - 正确处理依赖
   - 及时清理副作用
   - 考虑性能影响

通过本章学习，你已经全面掌握了自定义Hooks的基础知识。自定义Hooks是React中复用逻辑的最佳方式，能让你的代码更简洁、可维护、可测试。继续学习，创建更多实用的自定义Hooks，成为React Hooks专家！
