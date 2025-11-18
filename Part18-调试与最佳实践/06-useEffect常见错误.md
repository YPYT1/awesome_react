# useEffect常见错误 - React副作用管理完全指南

## 1. 依赖数组错误

### 1.1 缺少依赖项

```jsx
// ❌ 错误: 缺少count依赖
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Current count:', count);  // count永远是0
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 缺少count依赖
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// ✅ 解决方案1: 添加依赖
function CounterSolution1() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Current count:', count);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [count]);  // 添加count依赖
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// ✅ 解决方案2: 使用函数式更新
function CounterSolution2() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => {
        console.log('Current count:', c);
        return c;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 不需要count依赖
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// ✅ 解决方案3: 使用useRef
function CounterSolution3() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Current count:', countRef.current);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 1.2 错误的依赖项

```jsx
// ❌ 错误: 对象/数组作为依赖
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  const options = {  // 每次渲染都是新对象
    include: 'details'
  };
  
  useEffect(() => {
    // 因为options每次都是新对象，effect会无限执行
    fetchUser(userId, options).then(setUser);
  }, [userId, options]);  // options引用每次都变
  
  return <div>{user?.name}</div>;
}

// ✅ 解决方案1: 将对象移到effect内部
function UserProfileSolution1({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const options = {
      include: 'details'
    };
    fetchUser(userId, options).then(setUser);
  }, [userId]);  // 只依赖userId
  
  return <div>{user?.name}</div>;
}

// ✅ 解决方案2: 使用useMemo缓存
function UserProfileSolution2({ userId }) {
  const [user, setUser] = useState(null);
  
  const options = useMemo(() => ({
    include: 'details'
  }), []);  // 空依赖，options引用不变
  
  useEffect(() => {
    fetchUser(userId, options).then(setUser);
  }, [userId, options]);
  
  return <div>{user?.name}</div>;
}

// ✅ 解决方案3: 只依赖必要的值
function UserProfileSolution3({ userId }) {
  const [user, setUser] = useState(null);
  
  const includeDetails = true;
  
  useEffect(() => {
    const options = {
      include: includeDetails ? 'details' : 'basic'
    };
    fetchUser(userId, options).then(setUser);
  }, [userId, includeDetails]);  // 依赖原始值
  
  return <div>{user?.name}</div>;
}
```

### 1.3 函数作为依赖

```jsx
// ❌ 错误: 函数在每次渲染时都是新的
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const searchAPI = (q) => {  // 每次渲染都是新函数
    return fetch(`/api/search?q=${q}`).then(r => r.json());
  };
  
  useEffect(() => {
    // 因为searchAPI每次都是新函数，effect会无限执行
    if (query) {
      searchAPI(query).then(setResults);
    }
  }, [query, searchAPI]);  // searchAPI引用每次都变
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {results.map(r => <div key={r.id}>{r.title}</div>)}
    </div>
  );
}

// ✅ 解决方案1: 使用useCallback
function SearchComponentSolution1() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const searchAPI = useCallback((q) => {
    return fetch(`/api/search?q=${q}`).then(r => r.json());
  }, []);  // 空依赖，函数引用不变
  
  useEffect(() => {
    if (query) {
      searchAPI(query).then(setResults);
    }
  }, [query, searchAPI]);
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {results.map(r => <div key={r.id}>{r.title}</div>)}
    </div>
  );
}

// ✅ 解决方案2: 将函数移到effect内部
function SearchComponentSolution2() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    if (query) {
      const searchAPI = (q) => {
        return fetch(`/api/search?q=${q}`).then(r => r.json());
      };
      searchAPI(query).then(setResults);
    }
  }, [query]);  // 只依赖query
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {results.map(r => <div key={r.id}>{r.title}</div>)}
    </div>
  );
}
```

## 2. 清理函数错误

### 2.1 忘记清理副作用

```jsx
// ❌ 错误: 忘记清理定时器
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // 忘记返回清理函数!
    // 组件卸载后定时器仍在运行，导致内存泄漏
  }, []);
  
  return <div>Seconds: {seconds}</div>;
}

// ✅ 正确: 清理定时器
function TimerCorrect() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);  // 组件卸载时清理
    };
  }, []);
  
  return <div>Seconds: {seconds}</div>;
}
```

### 2.2 忘记取消订阅

```jsx
// ❌ 错误: 忘记取消事件监听
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // 忘记移除监听器!
  }, []);
  
  return <div>{size.width} x {size.height}</div>;
}

// ✅ 正确: 清理事件监听
function WindowSizeCorrect() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div>{size.width} x {size.height}</div>;
}
```

### 2.3 异步操作的清理

```jsx
// ❌ 错误: 异步操作完成后设置已卸载组件的状态
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      // 如果组件已卸载，这里会报警告
      setUser(data);
    });
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// ✅ 正确: 使用取消标志
function UserProfileCorrect({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// ✅ 更好: 使用AbortController
function UserProfileBetter({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    fetch(`/api/users/${userId}`, {
      signal: abortController.signal
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      });
    
    return () => {
      abortController.abort();
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

## 3. 无限循环

### 3.1 缺少依赖数组

```jsx
// ❌ 错误: 没有依赖数组
function InfiniteLoop() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // 每次渲染都执行，导致无限循环
    setCount(count + 1);
  });  // 缺少依赖数组!
  
  return <div>{count}</div>;
}

// ✅ 正确: 添加空依赖数组
function NoInfiniteLoop() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1);
  }, []);  // 只在mount时执行一次
  
  return <div>{count}</div>;
}
```

### 3.2 依赖项导致循环

```jsx
// ❌ 错误: 在effect中更新依赖项
function DataFetcher() {
  const [data, setData] = useState([]);
  const [config, setConfig] = useState({ page: 1 });
  
  useEffect(() => {
    fetchData(config).then(newData => {
      setData(newData);
      // 错误!更新了config，触发新的effect执行
      setConfig({ ...config, page: config.page + 1 });
    });
  }, [config]);  // config变化触发effect，effect又更新config
  
  return <div>{data.length} items</div>;
}

// ✅ 解决方案1: 移除不必要的依赖
function DataFetcherSolution1() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    fetchData({ page }).then(newData => {
      setData(newData);
    });
  }, [page]);  // 只依赖page
  
  const loadMore = () => {
    setPage(p => p + 1);  // 在外部更新page
  };
  
  return (
    <div>
      <div>{data.length} items</div>
      <button onClick={loadMore}>Load More</button>
    </div>
  );
}

// ✅ 解决方案2: 使用useReducer
function dataReducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.data,
        page: state.page + 1
      };
    default:
      return state;
  }
}

function DataFetcherSolution2() {
  const [state, dispatch] = useReducer(dataReducer, {
    data: [],
    page: 1
  });
  
  useEffect(() => {
    fetchData({ page: state.page }).then(data => {
      dispatch({ type: 'FETCH_SUCCESS', data });
    });
  }, [state.page]);
  
  return <div>{state.data.length} items</div>;
}
```

## 4. 竞态条件

### 4.1 快速切换导致的竞态

```jsx
// ❌ 错误: 未处理竞态条件
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // 如果query快速变化，可能显示错误的结果
    searchAPI(query).then(data => {
      // 后返回的请求可能不是最新query的结果
      setResults(data);
    });
  }, [query]);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}

// ✅ 解决方案1: 使用取消标志
function SearchResultsSolution1({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    let cancelled = false;
    
    searchAPI(query).then(data => {
      if (!cancelled) {
        setResults(data);
      }
    });
    
    return () => {
      cancelled = true;
    };
  }, [query]);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}

// ✅ 解决方案2: 使用AbortController
function SearchResultsSolution2({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    fetch(`/api/search?q=${query}`, {
      signal: abortController.signal
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      });
    
    return () => {
      abortController.abort();
    };
  }, [query]);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}

// ✅ 解决方案3: 使用请求ID
function SearchResultsSolution3({ query }) {
  const [results, setResults] = useState([]);
  const requestIdRef = useRef(0);
  
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    
    searchAPI(query).then(data => {
      // 只处理最新请求的结果
      if (requestId === requestIdRef.current) {
        setResults(data);
      }
    });
  }, [query]);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

## 5. 过度使用useEffect

### 5.1 不必要的effect

```jsx
// ❌ 错误: 用effect计算派生状态
function TodoList({ todos }) {
  const [completedCount, setCompletedCount] = useState(0);
  
  useEffect(() => {
    // 不必要的effect!
    const count = todos.filter(t => t.completed).length;
    setCompletedCount(count);
  }, [todos]);
  
  return (
    <div>
      <p>{completedCount} completed</p>
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}

// ✅ 正确: 直接计算
function TodoListCorrect({ todos }) {
  // 直接计算，不需要effect
  const completedCount = todos.filter(t => t.completed).length;
  
  return (
    <div>
      <p>{completedCount} completed</p>
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}

// ✅ 如果计算昂贵，使用useMemo
function TodoListOptimized({ todos }) {
  const completedCount = useMemo(() => {
    return todos.filter(t => t.completed).length;
  }, [todos]);
  
  return (
    <div>
      <p>{completedCount} completed</p>
      {todos.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}
```

### 5.2 用effect同步props到state

```jsx
// ❌ 错误: props变化时用effect更新state
function EmailInput({ defaultEmail }) {
  const [email, setEmail] = useState(defaultEmail);
  
  useEffect(() => {
    // 不必要的effect!
    setEmail(defaultEmail);
  }, [defaultEmail]);
  
  return (
    <input 
      value={email} 
      onChange={e => setEmail(e.target.value)} 
    />
  );
}

// ✅ 解决方案1: 完全受控
function EmailInputControlled({ email, onChange }) {
  return (
    <input 
      value={email} 
      onChange={e => onChange(e.target.value)} 
    />
  );
}

// ✅ 解决方案2: 使用key重置
function Parent() {
  const [email, setEmail] = useState('john@example.com');
  
  return (
    <EmailInput 
      key={email}  // key变化会重新创建组件
      defaultEmail={email} 
    />
  );
}

// ✅ 解决方案3: 派生状态
function EmailInputDerived({ defaultEmail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftEmail, setDraftEmail] = useState('');
  
  // 派生显示的email
  const displayEmail = isEditing ? draftEmail : defaultEmail;
  
  const handleFocus = () => {
    setIsEditing(true);
    setDraftEmail(defaultEmail);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
  };
  
  return (
    <input 
      value={displayEmail} 
      onChange={e => setDraftEmail(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
```

## 6. 执行时机错误

### 6.1 useEffect vs useLayoutEffect

```jsx
// ❌ 错误: 需要同步测量DOM时使用useEffect
function MeasureHeight() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    // useEffect是异步的，可能看到闪烁
    setHeight(ref.current.offsetHeight);
  }, []);
  
  return (
    <div ref={ref} style={{ height: height > 100 ? '100px' : 'auto' }}>
      Content
    </div>
  );
}

// ✅ 正确: 使用useLayoutEffect同步测量
function MeasureHeightCorrect() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    // useLayoutEffect在DOM更新后同步执行
    setHeight(ref.current.offsetHeight);
  }, []);
  
  return (
    <div ref={ref} style={{ height: height > 100 ? '100px' : 'auto' }}>
      Content
    </div>
  );
}
```

### 6.2 在effect中调用setState

```jsx
// ❌ 错误: 条件可能永不满足
function DataLoader() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      // 错误!如果data不是真值，loading永远不会变false
      if (data) {
        setLoading(false);
      }
    });
  }, []);
  
  return loading ? <div>Loading...</div> : <div>{data}</div>;
}

// ✅ 正确: 使用局部变量
function DataLoaderCorrect() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      // 使用result判断，不依赖state
      if (result) {
        setLoading(false);
      }
    });
  }, []);
  
  return loading ? <div>Loading...</div> : <div>{data}</div>;
}
```

## 7. 依赖项对比错误

### 7.1 对象比较

```jsx
// ❌ 错误: 每次渲染都是新对象
function UserList() {
  const [users, setUsers] = useState([]);
  
  const filter = {  // 每次都是新对象
    status: 'active'
  };
  
  useEffect(() => {
    // filter每次都不同，导致无限请求
    fetchUsers(filter).then(setUsers);
  }, [filter]);
  
  return <div>{users.length} users</div>;
}

// ✅ 解决方案1: 使用原始值
function UserListSolution1() {
  const [users, setUsers] = useState([]);
  
  const status = 'active';  // 原始值
  
  useEffect(() => {
    fetchUsers({ status }).then(setUsers);
  }, [status]);  // 原始值比较正确
  
  return <div>{users.length} users</div>;
}

// ✅ 解决方案2: useMemo缓存
function UserListSolution2() {
  const [users, setUsers] = useState([]);
  
  const filter = useMemo(() => ({
    status: 'active'
  }), []);  // 对象引用不变
  
  useEffect(() => {
    fetchUsers(filter).then(setUsers);
  }, [filter]);
  
  return <div>{users.length} users</div>;
}

// ✅ 解决方案3: 自定义比较
function useEffectDeep(effect, deps) {
  const ref = useRef();
  const signalRef = useRef(0);
  
  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
    signalRef.current += 1;
  }
  
  useEffect(effect, [signalRef.current]);
}

function UserListSolution3() {
  const [users, setUsers] = useState([]);
  
  const filter = {
    status: 'active'
  };
  
  useEffectDeep(() => {
    fetchUsers(filter).then(setUsers);
  }, [filter]);  // 深度比较
  
  return <div>{users.length} users</div>;
}
```

## 8. 内存泄漏

### 8.1 未清理的订阅

```jsx
// ❌ 错误: WebSocket未关闭
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://chat.server/${roomId}`);
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    // 忘记关闭WebSocket!
  }, [roomId]);
  
  return (
    <ul>
      {messages.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  );
}

// ✅ 正确: 清理WebSocket
function ChatRoomCorrect({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://chat.server/${roomId}`);
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    return () => {
      ws.close();  // 清理连接
    };
  }, [roomId]);
  
  return (
    <ul>
      {messages.map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  );
}
```

### 8.2 定时器泄漏

```jsx
// ❌ 错误: 多个定时器累积
function Poller({ interval }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData().then(setData);
    }, interval);
    
    // 忘记清理!
    // interval变化时创建新定时器，旧的仍在运行
  }, [interval]);
  
  return <div>{data}</div>;
}

// ✅ 正确: 清理旧定时器
function PollerCorrect({ interval }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData().then(setData);
    }, interval);
    
    return () => {
      clearInterval(timer);  // 清理旧定时器
    };
  }, [interval]);
  
  return <div>{data}</div>;
}
```

## 9. 调试技巧

### 9.1 effect执行追踪

```jsx
function useEffectDebug(effect, deps, name) {
  const prevDeps = useRef(deps);
  
  useEffect(() => {
    console.group(`[useEffect] ${name}`);
    
    if (prevDeps.current) {
      const changedDeps = deps.map((dep, i) => {
        if (dep !== prevDeps.current[i]) {
          return {
            index: i,
            from: prevDeps.current[i],
            to: dep
          };
        }
        return null;
      }).filter(Boolean);
      
      if (changedDeps.length > 0) {
        console.log('Changed dependencies:', changedDeps);
      }
    } else {
      console.log('Initial mount');
    }
    
    prevDeps.current = deps;
    
    const cleanup = effect();
    
    console.groupEnd();
    
    return cleanup;
  }, deps);
}

// 使用
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffectDebug(() => {
    fetchUser(userId).then(setUser);
  }, [userId], 'Fetch User');
  
  return <div>{user?.name}</div>;
}
```

### 9.2 effect cleanup追踪

```jsx
function useEffectWithCleanupDebug(effect, deps, name) {
  useEffect(() => {
    console.log(`[Effect] ${name} - Running`);
    
    const cleanup = effect();
    
    return () => {
      console.log(`[Effect] ${name} - Cleanup`);
      if (cleanup) cleanup();
    };
  }, deps);
}
```

## 10. 最佳实践

### 10.1 检查清单

```typescript
const useEffectChecklist = [
  '✅ 是否需要cleanup函数?',
  '✅ 依赖数组是否完整?',
  '✅ 是否有竞态条件?',
  '✅ 是否会导致无限循环?',
  '✅ 是否真的需要useEffect?',
  '✅ 是否应该用useLayoutEffect?',
  '✅ 是否有内存泄漏风险?',
  '✅ 异步操作是否正确取消?',
  '✅ 是否考虑了组件卸载场景?',
  '✅ 依赖项是否使用了正确的比较方式?'
];
```

### 10.2 常见模式

```jsx
// 模式1: 数据获取
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
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

// 模式2: 订阅
function useSubscription(subscribe) {
  const [value, setValue] = useState(null);
  
  useEffect(() => {
    const unsubscribe = subscribe(setValue);
    return unsubscribe;
  }, [subscribe]);
  
  return value;
}

// 模式3: 事件监听
function useEventListener(event, handler, element = window) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (e) => savedHandler.current(e);
    element.addEventListener(event, eventListener);
    
    return () => {
      element.removeEventListener(event, eventListener);
    };
  }, [event, element]);
}
```

## 11. 总结

useEffect常见错误的核心要点:

1. **依赖数组**: 确保所有依赖都包含在内
2. **清理函数**: 始终清理副作用
3. **竞态条件**: 处理异步操作的取消
4. **无限循环**: 避免在effect中更新依赖项
5. **过度使用**: 考虑是否真的需要effect
6. **执行时机**: 正确选择useEffect或useLayoutEffect
7. **对象比较**: 注意对象/数组的引用比较
8. **内存泄漏**: 清理所有订阅和定时器
9. **调试技巧**: 使用自定义Hook追踪effect
10. **最佳实践**: 遵循React官方建议

掌握这些知识可以避免useEffect的常见陷阱,写出更健壮的React应用。


