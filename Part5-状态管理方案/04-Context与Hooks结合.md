# Context与Hooks结合

## 概述

Context API与Hooks的结合是React现代状态管理的核心模式。本文深入探讨如何有效地将Context与各种Hooks结合使用，构建强大而灵活的状态管理方案。

## 基础结合模式

### Context + useState

最基本的组合，适合简单状态管理：

```jsx
const CountContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  
  const value = useMemo(() => ({
    count,
    setCount,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1),
    reset: () => setCount(0)
  }), [count]);

  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  );
}

function useCount() {
  const context = useContext(CountContext);
  if (!context) {
    throw new Error('useCount must be used within CountProvider');
  }
  return context;
}

// 使用
function Counter() {
  const { count, increment, decrement, reset } = useCount();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Context + useReducer

适合复杂状态逻辑：

```jsx
// 1. 定义reducer
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { id: Date.now(), text: action.payload, completed: false }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        )
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

// 2. 创建Context
const TodoStateContext = createContext();
const TodoDispatchContext = createContext();

// 3. Provider组件
function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// 4. 自定义Hooks
function useTodoState() {
  const context = useContext(TodoStateContext);
  if (!context) {
    throw new Error('useTodoState must be used within TodoProvider');
  }
  return context;
}

function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (!context) {
    throw new Error('useTodoDispatch must be used within TodoProvider');
  }
  return context;
}

// 5. 高级Hook - 提供action creators
function useTodoActions() {
  const dispatch = useTodoDispatch();
  
  return useMemo(() => ({
    addTodo: (text) => dispatch({ type: 'ADD_TODO', payload: text }),
    toggleTodo: (id) => dispatch({ type: 'TOGGLE_TODO', payload: id }),
    deleteTodo: (id) => dispatch({ type: 'DELETE_TODO', payload: id }),
    setFilter: (filter) => dispatch({ type: 'SET_FILTER', payload: filter })
  }), [dispatch]);
}

// 使用
function TodoList() {
  const { todos, filter } = useTodoState();
  const { toggleTodo, deleteTodo } = useTodoActions();

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span>{todo.text}</span>
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### Context + useEffect

处理副作用和数据同步：

```jsx
const DataContext = createContext();

function DataProvider({ children }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 初始化时加载数据
  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // 数据变化时同步到服务器
  useEffect(() => {
    if (data.length > 0) {
      syncDataToServer(data).catch(console.error);
    }
  }, [data]);

  // 监听在线状态
  useEffect(() => {
    const handleOnline = () => {
      syncDataToServer(data);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [data]);

  const value = useMemo(
    () => ({
      data,
      setData,
      loading,
      error,
      refresh: () => {
        setLoading(true);
        fetchData()
          .then(setData)
          .catch(setError)
          .finally(() => setLoading(false));
      }
    }),
    [data, loading, error]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
```

### Context + useMemo

优化计算密集型操作：

```jsx
const DataContext = createContext();

function DataProvider({ children }) {
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // 缓存过滤逻辑
  const filteredData = useMemo(() => {
    console.log('Computing filtered data...');
    let result = rawData;

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => item[key] === value);
      }
    });

    return result;
  }, [rawData, filters]);

  // 缓存排序逻辑
  const sortedData = useMemo(() => {
    console.log('Computing sorted data...');
    const { key, direction } = sortConfig;
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // 缓存统计信息
  const statistics = useMemo(() => {
    console.log('Computing statistics...');
    return {
      total: rawData.length,
      filtered: filteredData.length,
      sorted: sortedData.length,
      categories: [...new Set(rawData.map(item => item.category))]
    };
  }, [rawData, filteredData, sortedData]);

  const value = useMemo(
    () => ({
      rawData,
      setRawData,
      filteredData,
      sortedData,
      statistics,
      filters,
      setFilters,
      sortConfig,
      setSortConfig
    }),
    [rawData, filteredData, sortedData, statistics, filters, sortConfig]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
```

### Context + useCallback

稳定函数引用，避免不必要的重渲染：

```jsx
const ActionsContext = createContext();

function ActionsProvider({ children }) {
  const [items, setItems] = useState([]);

  // 使用useCallback确保函数引用稳定
  const addItem = useCallback((item) => {
    setItems(prev => [...prev, { ...item, id: Date.now() }]);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  // 批量操作
  const batchUpdate = useCallback((operations) => {
    setItems(prev => {
      let result = prev;
      operations.forEach(op => {
        switch (op.type) {
          case 'add':
            result = [...result, { ...op.item, id: Date.now() }];
            break;
          case 'remove':
            result = result.filter(item => item.id !== op.id);
            break;
          case 'update':
            result = result.map(item =>
              item.id === op.id ? { ...item, ...op.updates } : item
            );
            break;
        }
      });
      return result;
    });
  }, []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateItem,
      clearItems,
      batchUpdate
    }),
    [items, addItem, removeItem, updateItem, clearItems, batchUpdate]
  );

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>;
}

// 使用React.memo的组件只在props变化时重渲染
const ItemComponent = React.memo(({ item, onRemove }) => {
  console.log('ItemComponent render:', item.id);
  return (
    <div>
      <span>{item.name}</span>
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </div>
  );
});

function ItemList() {
  const { items, removeItem } = useContext(ActionsContext);
  
  // removeItem引用稳定，ItemComponent不会因此重渲染
  return (
    <div>
      {items.map(item => (
        <ItemComponent key={item.id} item={item} onRemove={removeItem} />
      ))}
    </div>
  );
}
```

## 高级结合模式

### Context + useRef

保存可变值而不触发重渲染：

```jsx
const TimerContext = createContext();

function TimerProvider({ children }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
      setIsRunning(true);
    }
  }, [isRunning, time]);

  const pause = useCallback(() => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(false);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      time,
      isRunning,
      start,
      pause,
      reset
    }),
    [time, isRunning, start, pause, reset]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

function Timer() {
  const { time, isRunning, start, pause, reset } = useContext(TimerContext);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, '0')}:${(minutes % 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <h2>{formatTime(time)}</h2>
      <button onClick={start} disabled={isRunning}>Start</button>
      <button onClick={pause} disabled={!isRunning}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Context + useLayoutEffect

同步DOM操作：

```jsx
const LayoutContext = createContext();

function LayoutProvider({ children }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = useMemo(
    () => ({
      dimensions,
      containerRef
    }),
    [dimensions]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

function ResponsiveComponent() {
  const { dimensions, containerRef } = useContext(LayoutContext);

  return (
    <div ref={containerRef}>
      <p>Width: {dimensions.width}px</p>
      <p>Height: {dimensions.height}px</p>
    </div>
  );
}
```

### Context + useTransition

处理低优先级更新：

```jsx
import { useTransition } from 'react';

const SearchContext = createContext();

function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);

    // 将结果更新标记为低优先级
    startTransition(() => {
      const filtered = largeDataset.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    });
  }, []);

  const value = useMemo(
    () => ({
      query,
      results,
      isPending,
      search
    }),
    [query, results, isPending, search]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

function SearchInput() {
  const { query, search, isPending } = useContext(SearchContext);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <span className="loading">Searching...</span>}
    </div>
  );
}

function SearchResults() {
  const { results } = useContext(SearchContext);

  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Context + useSyncExternalStore

同步外部状态：

```jsx
import { useSyncExternalStore } from 'react';

// 外部存储
class ExternalStore {
  constructor() {
    this.state = { count: 0 };
    this.listeners = new Set();
  }

  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => {
    return this.state;
  };

  setState = (newState) => {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
}

const externalStore = new ExternalStore();

const ExternalStoreContext = createContext(externalStore);

function ExternalStoreProvider({ children }) {
  return (
    <ExternalStoreContext.Provider value={externalStore}>
      {children}
    </ExternalStoreContext.Provider>
  );
}

function useExternalStore() {
  const store = useContext(ExternalStoreContext);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  return {
    state,
    increment: store.increment
  };
}

function ExternalStoreComponent() {
  const { state, increment } = useExternalStore();

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## 自定义Hooks模式

### 模式1：封装Context逻辑

```jsx
// 创建完整的Context模块
function createContextModule(useValue, displayName) {
  const Context = createContext(undefined);
  Context.displayName = displayName;

  function Provider({ children }) {
    const value = useValue();
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContextValue() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`useContextValue must be used within ${displayName}Provider`);
    }
    return context;
  }

  return [Provider, useContextValue];
}

// 使用
const [CountProvider, useCount] = createContextModule(() => {
  const [count, setCount] = useState(0);
  return useMemo(
    () => ({
      count,
      increment: () => setCount(c => c + 1),
      decrement: () => setCount(c => c - 1)
    }),
    [count]
  );
}, 'Count');
```

### 模式2：组合多个Hooks

```jsx
const UserContext = createContext();

function UserProvider({ children }) {
  // 组合多个Hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 认证逻辑
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authAPI.login(credentials);
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 持久化
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // 自动刷新token
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const refreshedUser = await authAPI.refreshToken();
        setUser(refreshedUser);
      } catch (err) {
        setError(err.message);
        setUser(null);
      }
    }, 15 * 60 * 1000); // 15分钟

    return () => clearInterval(interval);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      isAuthenticated: !!user
    }),
    [user, loading, error, login, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
```

### 模式3：条件Hook执行

```jsx
const FeatureContext = createContext();

function FeatureProvider({ children }) {
  const [features, setFeatures] = useState({
    analytics: false,
    experiments: false
  });

  // 条件执行Hook
  useEffect(() => {
    if (features.analytics) {
      // 初始化分析工具
      initAnalytics();
      return () => cleanupAnalytics();
    }
  }, [features.analytics]);

  useEffect(() => {
    if (features.experiments) {
      // 初始化实验工具
      initExperiments();
      return () => cleanupExperiments();
    }
  }, [features.experiments]);

  const value = useMemo(
    () => ({
      features,
      setFeatures,
      enableFeature: (name) => setFeatures(prev => ({ ...prev, [name]: true })),
      disableFeature: (name) => setFeatures(prev => ({ ...prev, [name]: false }))
    }),
    [features]
  );

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}
```

## 实战案例

### 案例1：表单管理Context

```jsx
const FormContext = createContext();

function FormProvider({ initialValues = {}, onSubmit, children }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 字段值更新
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // 字段错误设置
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // 字段触摸状态
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // 验证字段
  const validateField = useCallback((name, value, validator) => {
    if (validator) {
      const error = validator(value);
      setFieldError(name, error);
      return !error;
    }
    return true;
  }, [setFieldError]);

  // 提交表单
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    // 标记所有字段为已触摸
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // 检查错误
    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, errors, onSubmit]);

  // 重置表单
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const value = useMemo(
    () => ({
      values,
      errors,
      touched,
      isSubmitting,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      validateField,
      handleSubmit,
      resetForm
    }),
    [
      values,
      errors,
      touched,
      isSubmitting,
      setFieldValue,
      setFieldError,
      setFieldTouched,
      validateField,
      handleSubmit,
      resetForm
    ]
  );

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
}

// 自定义字段Hook
function useField(name, validator) {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateField
  } = useFormContext();

  const value = values[name] || '';
  const error = errors[name];
  const isTouched = touched[name];

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setFieldValue(name, newValue);
    validateField(name, newValue, validator);
  }, [name, setFieldValue, validateField, validator]);

  const handleBlur = useCallback(() => {
    setFieldTouched(name, true);
    validateField(name, value, validator);
  }, [name, value, setFieldTouched, validateField, validator]);

  return {
    value,
    error,
    isTouched,
    onChange: handleChange,
    onBlur: handleBlur
  };
}

// 使用示例
function LoginForm() {
  const handleSubmit = async (values) => {
    console.log('Submitting:', values);
    await login(values);
  };

  return (
    <FormProvider
      initialValues={{ email: '', password: '' }}
      onSubmit={handleSubmit}
    >
      <FormContent />
    </FormProvider>
  );
}

function FormContent() {
  const { handleSubmit, isSubmitting } = useFormContext();

  const emailField = useField('email', (value) => {
    if (!value) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
    return null;
  });

  const passwordField = useField('password', (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input {...emailField} placeholder="Email" />
        {emailField.isTouched && emailField.error && (
          <span className="error">{emailField.error}</span>
        )}
      </div>

      <div>
        <input {...passwordField} type="password" placeholder="Password" />
        {passwordField.isTouched && passwordField.error && (
          <span className="error">{passwordField.error}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 案例2：通知系统Context

```jsx
const NotificationContext = createContext();

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timeoutRefs = useRef(new Map());

  // 添加通知
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeNotification(id);
      }, duration);
      timeoutRefs.current.set(id, timeoutId);
    }

    return id;
  }, []);

  // 移除通知
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  }, []);

  // 清理所有定时器
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, []);

  // 便捷方法
  const success = useCallback((message, duration) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  const error = useCallback((message, duration) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  const warning = useCallback((message, duration) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  const info = useCallback((message, duration) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      success,
      error,
      warning,
      info
    }),
    [notifications, addNotification, removeNotification, success, error, warning, info]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useContext(NotificationContext);

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => removeNotification(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// 使用
function MyComponent() {
  const { success, error } = useNotifications();

  const handleSave = async () => {
    try {
      await saveData();
      success('Data saved successfully!');
    } catch (err) {
      error('Failed to save data');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## 最佳实践总结

### 1. Hook选择指南

```jsx
// 简单状态 -> useState
const [count, setCount] = useState(0);

// 复杂状态逻辑 -> useReducer
const [state, dispatch] = useReducer(reducer, initialState);

// 副作用 -> useEffect
useEffect(() => {
  // 副作用代码
}, [dependencies]);

// 计算缓存 -> useMemo
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 函数缓存 -> useCallback
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// 可变值 -> useRef
const mutableValue = useRef(initialValue);
```

### 2. Context + Hooks结合原则

1. **分离关注点**：State和Dispatch使用不同Context
2. **稳定引用**：使用useMemo和useCallback
3. **避免过度优化**：先确保正确性，再优化性能
4. **清理副作用**：useEffect返回清理函数
5. **错误处理**：提供清晰的错误信息

### 3. 性能优化检查清单

- [ ] Context value使用useMemo包装
- [ ] 回调函数使用useCallback包装
- [ ] 计算属性使用useMemo缓存
- [ ] 分离读写Context
- [ ] 合理使用React.memo
- [ ] 避免在render中创建新对象/函数

## 总结

Context与Hooks的结合是React状态管理的核心。关键要点：

1. **useState**：简单状态管理
2. **useReducer**：复杂状态逻辑
3. **useEffect**：副作用处理
4. **useMemo**：计算缓存
5. **useCallback**：函数缓存
6. **useRef**：可变值引用
7. **自定义Hooks**：封装和复用逻辑

正确使用这些Hooks，可以构建强大、灵活、高性能的状态管理方案。

