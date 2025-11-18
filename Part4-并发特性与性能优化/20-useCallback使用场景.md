# useCallback使用场景

## 第一部分：useCallback基础

### 1.1 什么是useCallback

`useCallback`是React Hook，用于缓存函数引用。它返回一个记忆化的回调函数，只有在依赖项改变时才会更新函数引用。

**基本语法：**

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b]
);
```

**工作原理：**

```javascript
// useCallback的简化实现
function useCallback(callback, deps) {
  const hook = getCurrentHook();
  const prevDeps = hook.deps;
  const prevCallback = hook.callback;
  
  // 首次渲染或依赖变化
  if (!prevDeps || !depsEqual(prevDeps, deps)) {
    hook.deps = deps;
    hook.callback = callback;
    return callback;
  }
  
  // 依赖未变，返回缓存的函数
  return prevCallback;
}

// useCallback等价于useMemo返回函数
function useCallback(fn, deps) {
  return useMemo(() => fn, deps);
}
```

### 1.2 基础使用

```javascript
// 1. 简单回调
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);  // 永不变化
  
  return <button onClick={handleClick}>Click</button>;
}

// 2. 带依赖的回调
function Component({ userId }) {
  const [data, setData] = useState(null);
  
  const fetchData = useCallback(async () => {
    const result = await fetch(`/api/users/${userId}`);
    setData(await result.json());
  }, [userId]);  // userId变化时更新
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return <div>{data?.name}</div>;
}

// 3. 事件处理器
function TodoList({ todos }) {
  const handleToggle = useCallback((id) => {
    setTodos(prev => 
      prev.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }, []);
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={handleToggle} 
        />
      ))}
    </ul>
  );
}

// 4. 传递给子组件的回调
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent onIncrement={handleIncrement} />
    </div>
  );
}

const ChildComponent = React.memo(function ChildComponent({ onIncrement }) {
  console.log('Child rendered');
  return <button onClick={onIncrement}>Increment</button>;
});
```

### 1.3 何时使用useCallback

```javascript
// ✅ 适合使用的场景

// 1. 传递给优化的子组件
const MemoizedChild = React.memo(Child);

function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ 没有useCallback，每次都是新函数
  const handleClick = () => console.log('clicked');
  
  // ✅ 使用useCallback，稳定引用
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <MemoizedChild onClick={handleClick} />
    </div>
  );
}

// 2. 作为useEffect的依赖
function Component({ userId }) {
  const fetchData = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }, [userId]);
  
  useEffect(() => {
    fetchData().then(data => {
      console.log(data);
    });
  }, [fetchData]);  // fetchData稳定，避免无限循环
}

// 3. 作为其他Hook的依赖
function Component({ searchTerm }) {
  const performSearch = useCallback((term) => {
    return searchAPI(term);
  }, []);
  
  const debouncedSearch = useMemo(() => {
    return debounce(performSearch, 500);
  }, [performSearch]);  // performSearch稳定
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
}

// 4. 传递给Context
const ActionContext = React.createContext();

function Provider({ children }) {
  const [state, setState] = useState({});
  
  const actions = useCallback({
    update: (key, value) => {
      setState(prev => ({ ...prev, [key]: value }));
    },
    reset: () => {
      setState({});
    }
  }, []);
  
  return (
    <ActionContext.Provider value={actions}>
      {children}
    </ActionContext.Provider>
  );
}

// ❌ 不适合使用的场景

// 1. 不传递给子组件的函数
function Bad1() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  // 仅在当前组件使用，不需要useCallback
  return <button onClick={handleClick}>Click</button>;
}

// 2. 依赖频繁变化
function Bad2({ value }) {
  const handleChange = useCallback(() => {
    console.log(value);
  }, [value]);  // value每次都变，useCallback无意义
  
  return <input onChange={handleChange} />;
}

// 3. 简单的内联函数
function Bad3() {
  return (
    <button onClick={useCallback(() => alert('Hi'), [])}>
      Click
    </button>
  );
  // 过度优化，直接内联更简单
}
```

### 1.4 useCallback vs useMemo

```javascript
// useCallback缓存函数本身
const memoizedFn = useCallback(() => {
  return a + b;
}, [a, b]);

// useMemo缓存函数的返回值
const memoizedValue = useMemo(() => {
  return a + b;
}, [a, b]);

// useCallback等价于
const memoizedFn = useMemo(() => {
  return () => {
    return a + b;
  };
}, [a, b]);

// 实例对比
function Component({ a, b }) {
  // 场景1：需要函数本身
  const handleClick = useCallback(() => {
    console.log(a + b);
  }, [a, b]);
  
  // 场景2：需要计算结果
  const sum = useMemo(() => {
    return a + b;
  }, [a, b]);
  
  return (
    <div>
      <button onClick={handleClick}>Log Sum</button>
      <div>Sum: {sum}</div>
    </div>
  );
}
```

## 第二部分：常见使用场景

### 2.1 事件处理器优化

```javascript
// 场景1：列表项事件
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const handleToggle = useCallback((id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);
  
  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  const handleEdit = useCallback((id, newText) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  }, []);
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </ul>
  );
}

const TodoItem = React.memo(function TodoItem({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit 
}) {
  console.log('TodoItem rendered:', todo.id);
  
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
      <button onClick={() => onEdit(todo.id, prompt('New text'))}>
        Edit
      </button>
    </li>
  );
});

// 场景2：表单处理
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const handleChange = useCallback((field) => {
    return (e) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };
  }, []);
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
  }, [formData]);
  
  return (
    <form onSubmit={handleSubmit}>
      <Input 
        value={formData.name} 
        onChange={handleChange('name')} 
        placeholder="Name" 
      />
      <Input 
        value={formData.email} 
        onChange={handleChange('email')} 
        placeholder="Email" 
      />
      <TextArea 
        value={formData.message} 
        onChange={handleChange('message')} 
        placeholder="Message" 
      />
      <button type="submit">Submit</button>
    </form>
  );
}

const Input = React.memo(function Input({ value, onChange, placeholder }) {
  console.log('Input rendered:', placeholder);
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
});

// 场景3：防抖处理
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const performSearch = useCallback(async (searchTerm) => {
    const response = await fetch(`/api/search?q=${searchTerm}`);
    const data = await response.json();
    setResults(data);
  }, []);
  
  const debouncedSearch = useMemo(() => {
    return debounce(performSearch, 500);
  }, [performSearch]);
  
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="搜索..."
      />
      <SearchResults results={results} />
    </div>
  );
}

// 场景4：节流处理
function ScrollComponent() {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const handleScroll = useCallback(
    throttle(() => {
      setScrollPosition(window.scrollY);
    }, 100),
    []
  );
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return <div>Scroll Position: {scrollPosition}</div>;
}
```

### 2.2 useEffect依赖

```javascript
// 场景1：数据获取
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data);
  }, [userId]);
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  return <div>{user?.name}</div>;
}

// 场景2：WebSocket订阅
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  const handleMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  useEffect(() => {
    const ws = new WebSocket(`wss://chat.example.com/${roomId}`);
    
    ws.onmessage = (event) => {
      handleMessage(JSON.parse(event.data));
    };
    
    return () => ws.close();
  }, [roomId, handleMessage]);
  
  return <MessageList messages={messages} />;
}

// 场景3：定时器
function Timer({ interval, onTick }) {
  const tick = useCallback(() => {
    onTick();
  }, [onTick]);
  
  useEffect(() => {
    const timer = setInterval(tick, interval);
    return () => clearInterval(timer);
  }, [interval, tick]);
  
  return null;
}

// 场景4：事件监听
function KeyboardHandler({ onKeyPress }) {
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      onKeyPress();
    }
  }, [onKeyPress]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  return null;
}
```

### 2.3 Context Provider优化

```javascript
// 场景1：Actions Context
const ActionsContext = React.createContext();

function ActionsProvider({ children }) {
  const [state, setState] = useState({});
  
  const actions = useMemo(() => ({
    update: (key, value) => {
      setState(prev => ({ ...prev, [key]: value }));
    },
    remove: (key) => {
      setState(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    },
    clear: () => {
      setState({});
    }
  }), []);
  
  return (
    <ActionsContext.Provider value={actions}>
      {children}
    </ActionsContext.Provider>
  );
}

// 场景2：Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = useCallback(async (credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const userData = await response.json();
    setUser(userData);
  }, []);
  
  const logout = useCallback(async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  }, []);
  
  const updateProfile = useCallback(async (updates) => {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    const updated = await response.json();
    setUser(updated);
  }, []);
  
  const value = useMemo(() => ({
    user,
    login,
    logout,
    updateProfile
  }), [user, login, logout, updateProfile]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 场景3：Theme Context
const ThemeContext = React.createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  const setSpecificTheme = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);
  
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme: setSpecificTheme
  }), [theme, toggleTheme, setSpecificTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 2.4 自定义Hook

```javascript
// 场景1：useDebounce
function useDebounce(callback, delay) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  const debouncedCallback = useCallback(
    debounce((...args) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );
  
  return debouncedCallback;
}

// 使用
function SearchComponent() {
  const [query, setQuery] = useState('');
  
  const performSearch = useDebounce((searchTerm) => {
    console.log('Searching for:', searchTerm);
  }, 500);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
  };
  
  return <input value={query} onChange={handleChange} />;
}

// 场景2：useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}

// 场景3：useAsync
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
  
  return { ...state, execute };
}

// 场景4：useEventListener
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
```

## 第三部分：高级技巧

### 3.1 动态参数处理

```javascript
// 场景1：柯里化
function Component() {
  const [items, setItems] = useState([]);
  
  const handleItemAction = useCallback((action) => {
    return (id) => {
      setItems(prev => {
        switch (action) {
          case 'delete':
            return prev.filter(item => item.id !== id);
          case 'toggle':
            return prev.map(item =>
              item.id === id ? { ...item, active: !item.active } : item
            );
          default:
            return prev;
        }
      });
    };
  }, []);
  
  const handleDelete = useCallback(handleItemAction('delete'), [handleItemAction]);
  const handleToggle = useCallback(handleItemAction('toggle'), [handleItemAction]);
  
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          item={item}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}

// 场景2：工厂函数
function useActionCreators(dispatch) {
  return useMemo(() => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
    decrement: () => dispatch({ type: 'DECREMENT' }),
    setCount: (count) => dispatch({ type: 'SET_COUNT', payload: count }),
    reset: () => dispatch({ type: 'RESET' })
  }), [dispatch]);
}

// 场景3：配置化回调
function ConfigurableComponent({ onSuccess, onError, config }) {
  const handleAction = useCallback(async (data) => {
    try {
      const result = await processData(data, config);
      onSuccess?.(result);
    } catch (error) {
      onError?.(error);
    }
  }, [onSuccess, onError, config]);
  
  return <Button onClick={() => handleAction(someData)}>Action</Button>;
}
```

### 3.2 性能优化模式

```javascript
// 场景1：批量更新
function BatchUpdateComponent() {
  const [items, setItems] = useState([]);
  
  const batchUpdate = useCallback((updates) => {
    setItems(prev => {
      let newItems = [...prev];
      updates.forEach(update => {
        const index = newItems.findIndex(item => item.id === update.id);
        if (index !== -1) {
          newItems[index] = { ...newItems[index], ...update };
        }
      });
      return newItems;
    });
  }, []);
  
  const handleBulkAction = useCallback(() => {
    const updates = [
      { id: 1, status: 'completed' },
      { id: 2, status: 'completed' },
      { id: 3, status: 'completed' }
    ];
    batchUpdate(updates);
  }, [batchUpdate]);
  
  return <button onClick={handleBulkAction}>Complete All</button>;
}

// 场景2：惰性初始化
function LazyInitComponent({ expensiveComputation }) {
  const [data, setData] = useState(null);
  
  const initialize = useCallback(() => {
    setData(() => expensiveComputation());
  }, [expensiveComputation]);
  
  useEffect(() => {
    if (!data) {
      initialize();
    }
  }, [data, initialize]);
  
  return <div>{data}</div>;
}

// 场景3：选择性更新
function SelectiveUpdateComponent() {
  const [state, setState] = useState({
    count: 0,
    text: '',
    items: []
  });
  
  const updateCount = useCallback(() => {
    setState(prev => ({ ...prev, count: prev.count + 1 }));
  }, []);
  
  const updateText = useCallback((newText) => {
    setState(prev => ({ ...prev, text: newText }));
  }, []);
  
  const addItem = useCallback((item) => {
    setState(prev => ({ ...prev, items: [...prev.items, item] }));
  }, []);
  
  return (
    <div>
      <button onClick={updateCount}>Count: {state.count}</button>
      <input value={state.text} onChange={e => updateText(e.target.value)} />
      <button onClick={() => addItem({ id: Date.now() })}>Add Item</button>
    </div>
  );
}
```

### 3.3 错误处理

```javascript
// 场景1：带错误处理的回调
function Component() {
  const [error, setError] = useState(null);
  
  const handleAction = useCallback(async (data) => {
    setError(null);
    
    try {
      await performAction(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  
  return (
    <div>
      {error && <ErrorMessage message={error} />}
      <button onClick={() => handleAction(someData)}>Action</button>
    </div>
  );
}

// 场景2：带重试的回调
function RetryableComponent() {
  const [retryCount, setRetryCount] = useState(0);
  
  const handleWithRetry = useCallback(async (action, maxRetries = 3) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        setRetryCount(i + 1);
        return await action();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw lastError;
  }, []);
  
  return <div>Retry count: {retryCount}</div>;
}

// 场景3：带取消的回调
function CancellableComponent() {
  const abortControllerRef = useRef();
  
  const fetchData = useCallback(async () => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/data', {
        signal: abortControllerRef.current.signal
      });
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        throw error;
      }
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return <button onClick={fetchData}>Fetch</button>;
}
```

### 3.4 组合模式

```javascript
// 场景1：组合多个回调
function ComposedCallbacks({ onBefore, onAction, onAfter }) {
  const handleComposed = useCallback(async (data) => {
    onBefore?.(data);
    
    try {
      const result = await onAction(data);
      onAfter?.(result);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [onBefore, onAction, onAfter]);
  
  return <button onClick={() => handleComposed(someData)}>Action</button>;
}

// 场景2：管道模式
function PipelineComponent() {
  const transform1 = useCallback((data) => {
    return { ...data, step1: true };
  }, []);
  
  const transform2 = useCallback((data) => {
    return { ...data, step2: true };
  }, []);
  
  const transform3 = useCallback((data) => {
    return { ...data, step3: true };
  }, []);
  
  const pipeline = useCallback((data) => {
    return [transform1, transform2, transform3].reduce(
      (result, fn) => fn(result),
      data
    );
  }, [transform1, transform2, transform3]);
  
  return <button onClick={() => console.log(pipeline({}))}>Run Pipeline</button>;
}

// 场景3：装饰器模式
function withLogging(callback) {
  return useCallback((...args) => {
    console.log('Before:', args);
    const result = callback(...args);
    console.log('After:', result);
    return result;
  }, [callback]);
}

function DecoratedComponent() {
  const baseAction = useCallback((value) => {
    return value * 2;
  }, []);
  
  const decoratedAction = withLogging(baseAction);
  
  return <button onClick={() => decoratedAction(5)}>Action</button>;
}
```

## 第四部分：常见陷阱与解决

### 4.1 依赖陷阱

```javascript
// ❌ 陷阱1：遗漏依赖
function Bad1({ userId }) {
  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }, []);  // 遗漏userId
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
}

// ✅ 修复：添加完整依赖
function Good1({ userId }) {
  const fetchUser = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }, [userId]);
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
}

// ❌ 陷阱2：过多依赖
function Bad2({ config }) {
  const handleAction = useCallback(() => {
    console.log(config);
  }, [config]);  // config是对象，每次都变
}

// ✅ 修复：只依赖需要的值
function Good2({ config }) {
  const configValue = config.value;
  
  const handleAction = useCallback(() => {
    console.log(configValue);
  }, [configValue]);
}

// ❌ 陷阱3：闭包陷阱
function Bad3() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log(count);  // 总是打印0
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      <button onClick={handleClick}>Log</button>
    </div>
  );
}

// ✅ 修复：添加依赖或使用ref
function Good3() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  });
  
  const handleClick = useCallback(() => {
    console.log(countRef.current);  // 总是最新值
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      <button onClick={handleClick}>Log</button>
    </div>
  );
}
```

### 4.2 性能陷阱

```javascript
// ❌ 陷阱1：不必要的useCallback
function Bad1() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  // 不传给子组件，不作为依赖，useCallback无意义
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 修复：直接使用
function Good1() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// ❌ 陷阱2：过度优化
function Bad2({ items }) {
  const handleClick1 = useCallback(() => {}, []);
  const handleClick2 = useCallback(() => {}, []);
  const handleClick3 = useCallback(() => {}, []);
  // ... 过多useCallback
}

// ✅ 修复：只优化必要的
function Good2({ items }) {
  const handleItemClick = useCallback((id) => {
    // 传给memo化的子组件，需要useCallback
  }, []);
  
  const handleLocalClick = () => {
    // 本地使用，不需要useCallback
  };
}
```

### 4.3 使用技巧

```javascript
// 技巧1：使用useRef存储最新值
function LatestValueCallback({ onChange }) {
  const latestOnChange = useRef(onChange);
  
  useEffect(() => {
    latestOnChange.current = onChange;
  });
  
  const stableCallback = useCallback((...args) => {
    latestOnChange.current(...args);
  }, []);
  
  return <Child onChange={stableCallback} />;
}

// 技巧2：条件性useCallback
function ConditionalCallback({ shouldOptimize, onClick }) {
  const handleClick = shouldOptimize
    ? useCallback(onClick, [onClick])
    : onClick;
  
  return <button onClick={handleClick}>Click</button>;
}

// 技巧3：工厂模式
function useCallbackFactory() {
  const callbacks = useRef({});
  
  const getCallback = useCallback((key, fn, deps) => {
    if (!callbacks.current[key]) {
      callbacks.current[key] = fn;
    }
    
    return callbacks.current[key];
  }, []);
  
  return getCallback;
}
```

## 注意事项

### 1. 正确的依赖

```javascript
// ✅ 包含所有使用的值
const callback = useCallback(() => {
  doSomething(a, b, c);
}, [a, b, c]);

// ❌ 依赖不完整
const callback = useCallback(() => {
  doSomething(a, b, c);
}, [a]);  // 缺少b和c
```

### 2. 避免过度使用

```javascript
// 评估是否真的需要
// 1. 是否传给memo化的子组件？
// 2. 是否作为useEffect/useMemo的依赖？
// 3. 是否作为Context value？

// 如果都不是，可能不需要useCallback
```

### 3. useRef配合

```javascript
// 获取最新值但保持引用稳定
function Component({ value, onSave }) {
  const latestValue = useRef(value);
  
  useEffect(() => {
    latestValue.current = value;
  });
  
  const handleSave = useCallback(() => {
    onSave(latestValue.current);
  }, [onSave]);
  
  return <button onClick={handleSave}>Save</button>;
}
```

## 常见问题

### Q1: useCallback和useMemo的区别？

**A:** useCallback缓存函数，useMemo缓存值；`useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`。

### Q2: 何时应该使用useCallback？

**A:** 传给memo化子组件、作为Hook依赖、Context value时。

### Q3: useCallback会影响性能吗？

**A:** 有轻微开销，只在必要时使用。

### Q4: 依赖数组为空可以吗？

**A:** 可以，但要确保回调不依赖任何外部变量。

### Q5: 如何避免闭包陷阱？

**A:** 添加正确依赖或使用useRef。

### Q6: useCallback可以在循环中使用吗？

**A:** 不可以，Hook必须在组件顶层调用。

### Q7: 怎么调试useCallback问题？

**A:** 使用React DevTools或添加console.log。

### Q8: useCallback影响首次渲染吗？

**A:** 有轻微影响，需要创建和存储函数。

### Q9: 所有事件处理器都需要useCallback吗？

**A:** 不需要，只有特定场景才需要。

### Q10: React 19对useCallback有改进吗？

**A:** 编译器可能自动优化，减少手动使用。

## 总结

### 核心要点

```
1. useCallback作用
   ✅ 缓存函数引用
   ✅ 避免子组件重渲染
   ✅ 稳定Hook依赖
   ✅ 优化性能

2. 适用场景
   ✅ memo化子组件
   ✅ useEffect依赖
   ✅ Context value
   ✅ 自定义Hook

3. 注意事项
   ❌ 过度使用
   ❌ 依赖不完整
   ❌ 忽略开销
   ❌ 闭包陷阱
```

### 最佳实践

```
1. 使用原则
   ✅ 先测量再优化
   ✅ 正确的依赖数组
   ✅ 配合React.memo
   ✅ 理解闭包

2. 性能优化
   ✅ 避免不必要使用
   ✅ 合理的粒度
   ✅ 监控效果
   ✅ 持续优化

3. 代码质量
   ✅ 清晰的意图
   ✅ 完整的依赖
   ✅ 易于维护
   ✅ 充分测试
```

useCallback是React性能优化的重要工具，合理使用能避免不必要的渲染，提升应用性能。

