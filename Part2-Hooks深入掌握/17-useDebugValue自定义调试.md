# useDebugValue自定义调试

## 学习目标

通过本章学习，你将全面掌握：

- useDebugValue的概念和作用
- 在React DevTools中显示调试信息
- 自定义Hook的调试优化
- 格式化函数的使用和性能优化
- 调试复杂状态
- 性能监控技巧
- 最佳实践和常见模式
- TypeScript集成
- 生产环境的调试策略
- 与其他调试工具配合使用

## 第一部分：useDebugValue基础

### 1.1 什么是useDebugValue

useDebugValue可以在React DevTools中显示自定义Hook的标签，方便调试。

```jsx
import { useDebugValue, useState } from 'react';

// 基本用法
function useCustomHook(value) {
  useDebugValue(value);
  
  const [state, setState] = useState(value);
  return [state, setState];
}

// 在React DevTools中会显示：
// CustomHook: value值

// 使用
function Component() {
  const [count] = useCustomHook(0);
  return <div>{count}</div>;
}
```

### 1.2 显示有意义的信息

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // 在DevTools中显示在线状态
  useDebugValue(isOnline ? '在线 ✅' : '离线 ❌');
  
  return isOnline;
}

// 使用
function App() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      网络状态: {isOnline ? '在线' : '离线'}
    </div>
  );
}
```

### 1.3 格式化函数的重要性

```jsx
// ❌ 不好：每次渲染都计算
function useBadDebug() {
  const [user, setUser] = useState({
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
    lastLogin: new Date()
  });
  
  // 即使DevTools未打开，也会每次计算
  const debugInfo = `${user.name} (${user.role}) - ${user.permissions.length}权限`;
  useDebugValue(debugInfo);
  
  return [user, setUser];
}

// ✅ 好：使用格式化函数（延迟计算）
function useGoodDebug() {
  const [user, setUser] = useState({
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
    lastLogin: new Date()
  });
  
  // 只在DevTools打开时才执行格式化
  useDebugValue(user, (u) => {
    return `${u.name} (${u.role}) - ${u.permissions.length}权限 - 最后登录: ${u.lastLogin.toLocaleString()}`;
  });
  
  return [user, setUser];
}

// 性能优化：只在需要时格式化
function useExpensiveDebug() {
  const [data, setData] = useState([]);
  
  // 不推荐：每次渲染都计算总和
  // useDebugValue(`${data.length} items, total: ${data.reduce((a,b) => a + b.value, 0)}`);
  
  // 推荐：使用格式化函数
  useDebugValue(data, (d) => {
    if (d.length === 0) return 'Empty';
    
    const total = d.reduce((sum, item) => sum + item.value, 0);
    const avg = total / d.length;
    
    return `${d.length} items | 总计: ${total} | 平均: ${avg.toFixed(2)}`;
  });
  
  return [data, setData];
}
```

### 1.4 useDebugValue的工作原理

```jsx
/**
 * useDebugValue的内部机制：
 * 
 * 1. 仅在开发模式下有效
 * 2. 仅在React DevTools打开时才执行格式化函数
 * 3. 不影响生产环境性能
 * 4. 只能在自定义Hook中使用
 * 
 * 执行时机：
 * - 无格式化函数：每次渲染都记录值
 * - 有格式化函数：只在DevTools检查时执行
 */

function useDebugValueDemo() {
  const [count, setCount] = useState(0);
  
  console.log('1. Hook渲染');
  
  // 基础用法：直接传值
  useDebugValue(count);
  
  // 格式化用法：延迟计算
  useDebugValue(count, (c) => {
    console.log('2. 格式化函数执行（只在DevTools打开时）');
    return `计数: ${c}`;
  });
  
  console.log('3. Hook渲染完成');
  
  return [count, setCount];
}
```

## 第二部分：实际应用场景

### 2.1 调试表单Hook

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  
  // 显示详细的表单状态摘要
  useDebugValue(
    { values, errors, touched, isSubmitting, submitCount },
    (state) => {
      const errorCount = Object.keys(state.errors).length;
      const touchedCount = Object.keys(state.touched).length;
      const fieldCount = Object.keys(state.values).length;
      const filledCount = Object.values(state.values).filter(v => v).length;
      
      const status = state.isSubmitting ? '提交中' : 
                     errorCount > 0 ? '有错误' : 
                     filledCount === fieldCount ? '已完成' : '进行中';
      
      return `表单(${status}): ${fieldCount}字段 | ${touchedCount}已访问 | ${filledCount}已填 | ${errorCount}错误 | ${state.submitCount}次提交`;
    }
  );
  
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 验证
    if (validate) {
      const fieldErrors = validate({ ...values, [field]: value });
      setErrors(prev => ({
        ...prev,
        [field]: fieldErrors[field]
      }));
    }
  };
  
  const handleBlur = (field) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };
  
  const handleSubmit = async (onSubmit) => async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);
    
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit
  };
}

// 使用
function FormExample() {
  const form = useForm(
    { username: '', email: '', password: '' },
    (values) => {
      const errors = {};
      if (!values.username) errors.username = '用户名必填';
      if (!values.email) errors.email = '邮箱必填';
      if (!values.password) errors.password = '密码必填';
      return errors;
    }
  );
  
  return (
    <form onSubmit={form.handleSubmit(async (values) => {
      console.log('提交:', values);
    })}>
      <input
        value={form.values.username}
        onChange={form.handleChange('username')}
        onBlur={form.handleBlur('username')}
        placeholder="用户名"
      />
      {form.errors.username && <span>{form.errors.username}</span>}
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

### 2.2 调试数据获取Hook

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const fetchStartTime = useRef(null);
  const fetchDuration = useRef(0);
  
  // 显示详细的请求状态
  useDebugValue(
    { url, data, loading, error, retryCount, duration: fetchDuration.current },
    (state) => {
      if (state.loading) {
        return `🔄 获取中: ${state.url} (尝试 #${state.retryCount + 1})`;
      }
      
      if (state.error) {
        return `❌ 错误: ${state.error} (${state.url}, ${state.retryCount}次重试)`;
      }
      
      if (state.data) {
        const dataSize = JSON.stringify(state.data).length;
        return `✅ 成功: ${state.url} (${dataSize} bytes, ${state.duration}ms, ${state.retryCount}次重试)`;
      }
      
      return `⏸️ 未开始: ${state.url}`;
    }
  );
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      fetchStartTime.current = performance.now();
      
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!cancelled) {
          fetchDuration.current = Math.round(performance.now() - fetchStartTime.current);
          setData(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [url, retryCount]);
  
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  return { data, loading, error, retry, retryCount };
}

// 使用
function DataComponent() {
  const { data, loading, error, retry } = useFetch('/api/users');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error} <button onClick={retry}>重试</button></div>;
  if (!data) return null;
  
  return (
    <div>
      <h2>用户列表</h2>
      {/* 显示数据 */}
    </div>
  );
}
```

### 2.3 调试本地存储Hook

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  
  // 调试信息
  useDebugValue(
    { key, value: storedValue, lastUpdated, updateCount },
    (state) => {
      const valueSize = JSON.stringify(state.value).length;
      const timeSinceUpdate = Math.round((Date.now() - state.lastUpdated.getTime()) / 1000);
      
      return `LocalStorage(${state.key}): ${valueSize} bytes | 更新${state.updateCount}次 | ${timeSinceUpdate}秒前`;
    }
  );
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      setLastUpdated(new Date());
      setUpdateCount(prev => prev + 1);
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      setLastUpdated(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue, removeValue];
}

// 使用
function SettingsComponent() {
  const [settings, setSettings, removeSettings] = useLocalStorage('settings', {
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  });
  
  return (
    <div>
      <h2>设置</h2>
      {/* 设置表单 */}
    </div>
  );
}
```

### 2.4 调试定时器Hook

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  const intervalId = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  // 调试信息
  useDebugValue(
    { delay, isRunning, tickCount, startTime },
    (state) => {
      if (!state.isRunning) {
        return `⏸️ 已停止 | ${state.tickCount}次触发`;
      }
      
      const elapsed = state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0;
      const avgInterval = state.tickCount > 0 ? Math.round(elapsed / state.tickCount) : 0;
      
      return `▶️ 运行中 | 间隔${state.delay}ms | ${state.tickCount}次触发 | 已运行${elapsed}秒 | 平均${avgInterval}秒/次`;
    }
  );
  
  // 更新callback引用
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    setIsRunning(true);
    setStartTime(Date.now());
    
    const tick = () => {
      savedCallback.current();
      setTickCount(prev => prev + 1);
    };
    
    intervalId.current = setInterval(tick, delay);
    
    return () => {
      clearInterval(intervalId.current);
      setIsRunning(false);
    };
  }, [delay]);
  
  return { isRunning, tickCount };
}

// 使用
function TimerComponent() {
  const [count, setCount] = useState(0);
  
  useInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return <div>计数: {count}</div>;
}
```

## 第三部分：高级调试模式

### 3.1 性能监控

```jsx
function usePerformanceMonitor(componentName) {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const lastRenderTime = useRef(null);
  
  renderCount.current++;
  
  const currentTime = performance.now();
  if (lastRenderTime.current) {
    renderTimes.current.push(currentTime - lastRenderTime.current);
  }
  lastRenderTime.current = currentTime;
  
  // 性能统计
  useDebugValue(
    { name: componentName, renderCount: renderCount.current, renderTimes: renderTimes.current },
    (state) => {
      if (state.renderTimes.length === 0) {
        return `${state.name}: ${state.renderCount}次渲染`;
      }
      
      const avgTime = state.renderTimes.reduce((a, b) => a + b, 0) / state.renderTimes.length;
      const maxTime = Math.max(...state.renderTimes);
      const minTime = Math.min(...state.renderTimes);
      const recentTime = state.renderTimes[state.renderTimes.length - 1];
      
      return `${state.name}: ${state.renderCount}次 | 平均${avgTime.toFixed(2)}ms | 最近${recentTime.toFixed(2)}ms | 范围[${minTime.toFixed(2)}-${maxTime.toFixed(2)}]ms`;
    }
  );
  
  return renderCount.current;
}

// 使用
function MonitoredComponent() {
  usePerformanceMonitor('MonitoredComponent');
  
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

### 3.2 状态历史追踪

```jsx
function useStateWithHistory(initialValue, maxHistorySize = 10) {
  const [value, setValue] = useState(initialValue);
  const history = useRef([initialValue]);
  const historyIndex = useRef(0);
  
  // 调试信息：显示历史记录
  useDebugValue(
    { value, history: history.current, index: historyIndex.current },
    (state) => {
      const canUndo = state.index > 0;
      const canRedo = state.index < state.history.length - 1;
      
      return `值: ${JSON.stringify(state.value)} | 历史: ${state.index + 1}/${state.history.length} | ${canUndo ? '可撤销' : '不可撤销'} | ${canRedo ? '可重做' : '不可重做'}`;
    }
  );
  
  const setValueWithHistory = (newValue) => {
    const actualValue = newValue instanceof Function ? newValue(value) : newValue;
    
    // 移除当前位置之后的历史
    history.current = history.current.slice(0, historyIndex.current + 1);
    
    // 添加新值
    history.current.push(actualValue);
    
    // 限制历史大小
    if (history.current.length > maxHistorySize) {
      history.current.shift();
    } else {
      historyIndex.current++;
    }
    
    setValue(actualValue);
  };
  
  const undo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      setValue(history.current[historyIndex.current]);
    }
  };
  
  const redo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      setValue(history.current[historyIndex.current]);
    }
  };
  
  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;
  
  return {
    value,
    setValue: setValueWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    history: history.current
  };
}

// 使用
function HistoryComponent() {
  const state = useStateWithHistory(0);
  
  return (
    <div>
      <p>值: {state.value}</p>
      <button onClick={() => state.setValue(v => v + 1)}>增加</button>
      <button onClick={state.undo} disabled={!state.canUndo}>撤销</button>
      <button onClick={state.redo} disabled={!state.canRedo}>重做</button>
    </div>
  );
}
```

### 3.3 依赖追踪

```jsx
function useDependencyTracker(dependencies, hookName = 'Hook') {
  const previousDeps = useRef(dependencies);
  const renderCount = useRef(0);
  const changedDeps = useRef([]);
  
  renderCount.current++;
  
  // 检测哪些依赖改变了
  if (previousDeps.current) {
    changedDeps.current = dependencies
      .map((dep, index) => ({
        index,
        previous: previousDeps.current[index],
        current: dep,
        changed: !Object.is(dep, previousDeps.current[index])
      }))
      .filter(item => item.changed);
  }
  
  previousDeps.current = dependencies;
  
  // 调试信息
  useDebugValue(
    { hookName, renderCount: renderCount.current, changedDeps: changedDeps.current },
    (state) => {
      if (state.changedDeps.length === 0) {
        return `${state.hookName}: 第${state.renderCount}次渲染 | 无依赖变化`;
      }
      
      const changes = state.changedDeps
        .map(dep => `dep[${dep.index}]`)
        .join(', ');
      
      return `${state.hookName}: 第${state.renderCount}次渲染 | 变化: ${changes}`;
    }
  );
  
  return changedDeps.current;
}

// 使用
function TrackedComponent({ userId, filter }) {
  useDependencyTracker([userId, filter], 'TrackedComponent');
  
  useEffect(() => {
    console.log('Effect运行，因为userId或filter改变');
  }, [userId, filter]);
  
  return <div>User {userId}, Filter: {filter}</div>;
}
```

### 3.4 异步状态追踪

```jsx
function useAsyncState(initialValue) {
  const [state, setState] = useState({
    value: initialValue,
    loading: false,
    error: null,
    lastUpdated: null
  });
  
  const pendingPromises = useRef(new Set());
  
  // 调试信息
  useDebugValue(state, (s) => {
    const pendingCount = pendingPromises.current.size;
    const status = s.loading ? '加载中' : s.error ? '错误' : '正常';
    const timeSinceUpdate = s.lastUpdated 
      ? `${Math.round((Date.now() - s.lastUpdated.getTime()) / 1000)}秒前`
      : '从未更新';
    
    return `AsyncState(${status}): ${JSON.stringify(s.value)} | ${pendingCount}个待处理 | ${timeSinceUpdate}`;
  });
  
  const setAsyncValue = async (asyncFn) => {
    const promise = (async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const newValue = await asyncFn(state.value);
        
        setState({
          value: newValue,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message,
          lastUpdated: new Date()
        }));
      } finally {
        pendingPromises.current.delete(promise);
      }
    })();
    
    pendingPromises.current.add(promise);
    
    return promise;
  };
  
  return [state, setAsyncValue];
}

// 使用
function AsyncComponent() {
  const [state, setAsyncValue] = useAsyncState(0);
  
  const handleIncrement = async () => {
    await setAsyncValue(async (current) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return current + 1;
    });
  };
  
  return (
    <div>
      <p>值: {state.value}</p>
      <p>状态: {state.loading ? '加载中' : '就绪'}</p>
      {state.error && <p>错误: {state.error}</p>}
      <button onClick={handleIncrement} disabled={state.loading}>
        异步增加
      </button>
    </div>
  );
}
```

## 第四部分：组合使用

### 4.1 多个Hook组合调试

```jsx
function useComplexFeature(userId) {
  const user = useFetch(`/api/users/${userId}`);
  const [preferences, setPreferences] = useLocalStorage(`prefs-${userId}`, {});
  const online = useOnlineStatus();
  const [notifications, setNotifications] = useState([]);
  
  // 组合调试信息
  useDebugValue(
    { user, preferences, online, notifications },
    (state) => {
      const userStatus = state.user.loading ? '加载中' : 
                        state.user.error ? '错误' : 
                        state.user.data ? '已加载' : '未开始';
      
      const prefsCount = Object.keys(state.preferences).length;
      const notifCount = state.notifications.length;
      
      return `ComplexFeature: 用户(${userStatus}) | ${prefsCount}个偏好 | ${state.online ? '在线' : '离线'} | ${notifCount}个通知`;
    }
  );
  
  return {
    user: user.data,
    loading: user.loading,
    error: user.error,
    preferences,
    setPreferences,
    online,
    notifications
  };
}

// 使用
function ComplexComponent({ userId }) {
  const feature = useComplexFeature(userId);
  
  if (feature.loading) return <div>加载中...</div>;
  if (feature.error) return <div>错误: {feature.error}</div>;
  
  return (
    <div>
      <h2>{feature.user?.name}</h2>
      <p>在线状态: {feature.online ? '在线' : '离线'}</p>
      <p>通知: {feature.notifications.length}条</p>
    </div>
  );
}
```

### 4.2 创建调试工具

```jsx
function useDebugTools(componentName) {
  const renderCount = useRef(0);
  const previousProps = useRef(null);
  const renderTimestamps = useRef([]);
  const stateChanges = useRef([]);
  
  renderCount.current++;
  renderTimestamps.current.push(Date.now());
  
  // 工具方法
  const logState = (stateName, value) => {
    stateChanges.current.push({
      name: stateName,
      value,
      timestamp: Date.now(),
      renderCount: renderCount.current
    });
  };
  
  const logPropsChange = (props) => {
    if (previousProps.current) {
      const changes = Object.keys(props).filter(
        key => !Object.is(props[key], previousProps.current[key])
      );
      
      if (changes.length > 0) {
        console.log(`[${componentName}] Props changed:`, changes);
      }
    }
    
    previousProps.current = props;
  };
  
  // 综合调试信息
  useDebugValue(
    { componentName, renderCount: renderCount.current, stateChanges: stateChanges.current },
    (state) => {
      const recentChanges = state.stateChanges.slice(-3);
      const changesStr = recentChanges
        .map(change => `${change.name}=${JSON.stringify(change.value)}`)
        .join(', ');
      
      return `${state.componentName}: ${state.renderCount}次渲染 | 最近状态: ${changesStr || '无'}`;
    }
  );
  
  return {
    renderCount: renderCount.current,
    logState,
    logPropsChange
  };
}

// 使用
function DebuggedComponent({ userId, filter }) {
  const debug = useDebugTools('DebuggedComponent');
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  
  debug.logPropsChange({ userId, filter });
  
  useEffect(() => {
    debug.logState('count', count);
  }, [count]);
  
  useEffect(() => {
    debug.logState('items', items);
  }, [items]);
  
  return (
    <div>
      <p>渲染次数: {debug.renderCount}</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

## 第五部分：TypeScript集成

### 5.1 类型安全的useDebugValue

```typescript
import { useDebugValue, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface UseUserOptions {
  initialUser?: User | null;
  autoFetch?: boolean;
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  refetch: () => Promise<void>;
}

function useUser(userId: number, options: UseUserOptions = {}): UseUserReturn {
  const [user, setUser] = useState<User | null>(options.initialUser || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 类型安全的调试值
  useDebugValue<User | null>(user, (u) => {
    if (!u) return 'No user';
    return `User: ${u.name} (${u.role})`;
  });
  
  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  return { user, loading, error, setUser, refetch };
}
```

### 5.2 泛型Debug Hook

```typescript
interface DebugState<T> {
  value: T;
  history: T[];
  updateCount: number;
  lastUpdated: Date | null;
}

function useDebugState<T>(
  initialValue: T,
  hookName?: string
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<DebugState<T>>({
    value: initialValue,
    history: [initialValue],
    updateCount: 0,
    lastUpdated: null
  });
  
  useDebugValue<DebugState<T>>(
    state,
    (s) => {
      const name = hookName || 'State';
      const valueStr = JSON.stringify(s.value);
      const historySize = s.history.length;
      const timeSinceUpdate = s.lastUpdated
        ? `${Math.round((Date.now() - s.lastUpdated.getTime()) / 1000)}秒前`
        : '从未更新';
      
      return `${name}: ${valueStr} | ${s.updateCount}次更新 | ${historySize}条历史 | ${timeSinceUpdate}`;
    }
  );
  
  const setValue = (newValue: T | ((prev: T) => T)) => {
    setState(prevState => {
      const actualValue = newValue instanceof Function 
        ? newValue(prevState.value)
        : newValue;
      
      return {
        value: actualValue,
        history: [...prevState.history, actualValue].slice(-10),
        updateCount: prevState.updateCount + 1,
        lastUpdated: new Date()
      };
    });
  };
  
  return [state.value, setValue];
}

// 使用
function TypedComponent() {
  const [count, setCount] = useDebugState<number>(0, 'Counter');
  const [user, setUser] = useDebugState<User | null>(null, 'User');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      {user && <p>User: {user.name}</p>}
    </div>
  );
}
```

## 第六部分：生产环境策略

### 6.1 条件调试

```jsx
function useConditionalDebug(value, condition) {
  // 只在特定条件下显示调试信息
  useDebugValue(
    condition ? value : null,
    (v) => v ? JSON.stringify(v) : '调试已禁用'
  );
  
  return value;
}

// 使用
function Component() {
  const isDev = process.env.NODE_ENV === 'development';
  const isDebugMode = window.location.search.includes('debug=true');
  
  const data = useConditionalDebug(
    { count: 100, items: [] },
    isDev || isDebugMode
  );
  
  return <div>{/* ... */}</div>;
}
```

### 6.2 环境感知调试

```jsx
const DEBUG_ENABLED = process.env.NODE_ENV === 'development';

function useSmartDebug(value, label) {
  if (DEBUG_ENABLED) {
    useDebugValue(value, (v) => {
      return `${label}: ${JSON.stringify(v, null, 2)}`;
    });
  }
  
  return value;
}

// 使用
function Component() {
  const [count, setCount] = useState(0);
  
  // 在生产环境中不会添加调试信息
  useSmartDebug(count, 'Count');
  
  return <div>Count: {count}</div>;
}
```

## 注意事项

### 1. 只在自定义Hook中使用

```jsx
// ❌ 错误：在组件中使用
function Component() {
  const [count, setCount] = useState(0);
  
  useDebugValue(count); // 错误！不会显示
  
  return <div>{count}</div>;
}

// ✅ 正确：在自定义Hook中使用
function useCounter() {
  const [count, setCount] = useState(0);
  
  useDebugValue(count); // 正确！
  
  return [count, setCount];
}

function Component() {
  const [count, setCount] = useCounter();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

### 2. 使用格式化函数优化性能

```jsx
// ❌ 不好：每次渲染都计算
function useBadPerf() {
  const [data, setData] = useState([]);
  
  // 即使DevTools未打开，也会每次计算
  const summary = `${data.length} items, ${data.reduce((sum, item) => sum + item.value, 0)} total`;
  useDebugValue(summary);
  
  return [data, setData];
}

// ✅ 好：使用格式化函数
function useGoodPerf() {
  const [data, setData] = useState([]);
  
  // 只在DevTools打开时才计算
  useDebugValue(data, (d) => {
    return `${d.length} items, ${d.reduce((sum, item) => sum + item.value, 0)} total`;
  });
  
  return [data, setData];
}
```

### 3. 提供有意义的信息

```jsx
// ❌ 不好：信息不明确
function usePoorDebug() {
  const [state, setState] = useState({ a: 1, b: 2 });
  
  useDebugValue(state); // 只显示对象引用
  
  return [state, setState];
}

// ✅ 好：清晰的描述
function useGoodDebug() {
  const [state, setState] = useState({ a: 1, b: 2 });
  
  useDebugValue(state, (s) => {
    return `a=${s.a}, b=${s.b}, sum=${s.a + s.b}`;
  });
  
  return [state, setState];
}
```

### 4. 避免副作用

```jsx
// ❌ 错误：在格式化函数中修改状态
function useBadSideEffect() {
  const [count, setCount] = useState(0);
  
  useDebugValue(count, (c) => {
    setCount(c + 1); // ❌ 副作用！会导致无限循环
    return `Count: ${c}`;
  });
  
  return [count, setCount];
}

// ✅ 正确：只读取和格式化
function useGoodPure() {
  const [count, setCount] = useState(0);
  
  useDebugValue(count, (c) => {
    return `Count: ${c} (${c % 2 === 0 ? 'even' : 'odd'})`;
  });
  
  return [count, setCount];
}
```

### 5. 生产环境的影响

```jsx
// useDebugValue在生产环境中不执行
// 但最好还是避免昂贵的计算

// ⚠️ 不推荐：即使在生产环境也会计算
function useExpensiveAlways() {
  const [data, setData] = useState([]);
  
  const summary = expensiveCalculation(data); // 总是执行
  useDebugValue(summary);
  
  return [data, setData];
}

// ✅ 推荐：延迟计算
function useExpensiveLazy() {
  const [data, setData] = useState([]);
  
  useDebugValue(data, expensiveCalculation); // 只在需要时执行
  
  return [data, setData];
}

function expensiveCalculation(data) {
  // 耗时计算
  return `Processed: ${data.length} items`;
}
```

## 常见问题

### 1. 为什么我的useDebugValue不显示？

useDebugValue只在自定义Hook中有效：

```jsx
// ❌ 不会显示
function Component() {
  const [value, setValue] = useState(0);
  useDebugValue(value); // 无效
  return <div>{value}</div>;
}

// ✅ 会显示
function useValue() {
  const [value, setValue] = useState(0);
  useDebugValue(value); // 有效
  return [value, setValue];
}

function Component() {
  const [value, setValue] = useValue();
  return <div>{value}</div>;
}
```

### 2. 如何调试多个相关状态？

传递对象并使用格式化函数：

```jsx
function useMultiState() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(true);
  
  useDebugValue(
    { count, name, enabled },
    (state) => {
      return `count=${state.count}, name="${state.name}", enabled=${state.enabled}`;
    }
  );
  
  return { count, name, enabled, setCount, setName, setEnabled };
}
```

### 3. useDebugValue会影响性能吗？

在生产环境中不会，但开发环境中要注意：

```jsx
// 使用格式化函数避免不必要的计算
function usePerformant() {
  const [data, setData] = useState([]);
  
  useDebugValue(data, (d) => {
    // 只在DevTools打开时执行
    return `${d.length} items`;
  });
  
  return [data, setData];
}
```

### 4. 如何在TypeScript中使用？

提供正确的类型参数：

```typescript
function useTypedDebug<T>(value: T, name: string) {
  useDebugValue<T>(value, (v) => {
    return `${name}: ${JSON.stringify(v)}`;
  });
  
  return value;
}
```

### 5. 可以嵌套使用吗？

可以，但每个Hook应该有自己的useDebugValue：

```jsx
function useInner() {
  const [value, setValue] = useState(0);
  useDebugValue(value, (v) => `Inner: ${v}`);
  return [value, setValue];
}

function useOuter() {
  const [inner, setInner] = useInner();
  const [outer, setOuter] = useState('');
  
  useDebugValue({ inner, outer }, (state) => {
    return `Outer: inner=${state.inner}, outer="${state.outer}"`;
  });
  
  return { inner, setInner, outer, setOuter };
}
```

### 6. 如何在React DevTools中查看？

1. 打开React DevTools
2. 选择使用自定义Hook的组件
3. 查看组件的"hooks"标签
4. 自定义Hook会显示useDebugValue的值

## 总结

### useDebugValue核心要点

1. **主要用途**
   - 在React DevTools中显示自定义Hook的调试信息
   - 帮助理解Hook的内部状态
   - 优化开发体验

2. **使用场景**
   - 只在自定义Hook中使用
   - 显示Hook的关键状态
   - 提供有意义的调试信息
   - 性能监控
   - 状态历史追踪

3. **性能优化**
   - 使用格式化函数延迟计算
   - 避免昂贵的操作
   - 只在必要时显示详细信息

4. **最佳实践**
   - 提供清晰、有意义的标签
   - 使用格式化函数优化性能
   - 避免在格式化函数中产生副作用
   - 组合多个状态显示
   - 考虑生产环境的影响

5. **常见模式**
   - 状态摘要
   - 性能监控
   - 历史追踪
   - 依赖变化检测
   - 异步状态追踪

6. **注意事项**
   - 只在自定义Hook中有效
   - 格式化函数应该是纯函数
   - 生产环境中不执行
   - 不影响组件行为

7. **与DevTools配合**
   - 实时查看Hook状态
   - 理解组件重渲染原因
   - 追踪状态变化
   - 性能分析

通过本章学习，你已经全面掌握了useDebugValue的使用。虽然它是一个简单的Hook，但在调试复杂的自定义Hook时非常有用。记住：好的调试信息能大大提高开发效率，使用useDebugValue让你的自定义Hook更易于维护和理解！
