# Context性能优化

## 概述

Context API虽然方便，但如果使用不当会导致性能问题。本文深入探讨Context的性能优化策略，帮助你构建高性能的React应用。

## Context的性能问题

### 问题1：全局重渲染

当Context的value发生变化时，所有使用该Context的组件都会重新渲染，即使它们只使用了value中的一小部分数据。

```jsx
// 问题示例
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [settings, setSettings] = useState({});

  const value = {
    user,
    setUser,
    theme,
    setTheme,
    settings,
    setSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 即使只使用theme，user变化时也会重渲染
function ThemeDisplay() {
  const { theme } = useContext(AppContext);
  console.log('ThemeDisplay render');
  return <div>Theme: {theme}</div>;
}

// 即使只使用user，theme变化时也会重渲染
function UserDisplay() {
  const { user } = useContext(AppContext);
  console.log('UserDisplay render');
  return <div>User: {user?.name}</div>;
}
```

### 问题2：对象引用变化

每次Provider组件重渲染时，如果value是对象，即使内容相同，引用也会改变，导致所有消费者重渲染。

```jsx
function BadProvider({ children }) {
  const [count, setCount] = useState(0);

  // 每次渲染都创建新对象
  const value = {
    count,
    increment: () => setCount(c => c + 1)
  };

  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  );
}
```

### 问题3：嵌套Provider的性能开销

```jsx
// 多层嵌套导致额外的渲染开销
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <DataProvider>
            <UIProvider>
              <MainContent />
            </UIProvider>
          </DataProvider>
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

## 优化策略

### 策略1：拆分Context

将不同类型的状态拆分到独立的Context中：

```jsx
// 拆分前 - 所有状态在一个Context
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');

  const value = { user, setUser, theme, setTheme, language, setLanguage };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 拆分后 - 独立的Context
const UserContext = createContext();
const ThemeContext = createContext();
const LanguageContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh-CN');
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// 组合Provider
function AppProvider({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// 现在修改user不会导致ThemeDisplay重渲染
function ThemeDisplay() {
  const { theme } = useContext(ThemeContext);
  console.log('ThemeDisplay render');
  return <div>{theme}</div>;
}
```

### 策略2：使用useMemo稳定value引用

```jsx
function OptimizedProvider({ children }) {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);

  // 使用useMemo确保引用稳定
  const value = useMemo(
    () => ({
      count,
      setCount,
      user,
      setUser
    }),
    [count, user]
  );

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// 更好的方式：分别memoize
function BetterProvider({ children }) {
  const [count, setCount] = useState(0);

  // setCount是稳定的，不需要加入依赖
  const countValue = useMemo(() => ({ count, setCount }), [count]);

  return (
    <CountContext.Provider value={countValue}>
      {children}
    </CountContext.Provider>
  );
}
```

### 策略3：分离状态和更新函数

将状态和更新函数放在不同的Context中：

```jsx
const StateContext = createContext();
const DispatchContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <StateContext.Provider value={count}>
      <DispatchContext.Provider value={setCount}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 只读取状态
function CountDisplay() {
  const count = useContext(StateContext);
  console.log('CountDisplay render');
  return <div>Count: {count}</div>;
}

// 只使用更新函数，count变化时不会重渲染
function CountButton() {
  const setCount = useContext(DispatchContext);
  console.log('CountButton render');
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Increment
    </button>
  );
}

// 自定义Hooks
function useCountState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useCountState must be used within CountProvider');
  }
  return context;
}

function useCountDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useCountDispatch must be used within CountProvider');
  }
  return context;
}
```

### 策略4：使用useReducer优化复杂状态

```jsx
const TodoStateContext = createContext();
const TodoDispatchContext = createContext();

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
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
};

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

// 使用
function TodoList() {
  const { todos, filter } = useContext(TodoStateContext);
  const dispatch = useContext(TodoDispatchContext);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// 过滤器组件不会因为todos变化而重渲染
function TodoFilter() {
  const dispatch = useContext(TodoDispatchContext);
  const { filter } = useContext(TodoStateContext);

  return (
    <div>
      <button
        onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
        disabled={filter === 'all'}
      >
        All
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_FILTER', payload: 'active' })}
        disabled={filter === 'active'}
      >
        Active
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}
        disabled={filter === 'completed'}
      >
        Completed
      </button>
    </div>
  );
}
```

### 策略5：使用React.memo防止子组件重渲染

```jsx
// 不会因为Context变化而重渲染（如果props相同）
const ExpensiveChild = React.memo(function ExpensiveChild({ id, name }) {
  console.log('ExpensiveChild render:', id);
  
  return (
    <div>
      <h3>{name}</h3>
      {/* 大量复杂计算 */}
    </div>
  );
});

function ParentComponent() {
  const { items } = useContext(DataContext);

  return (
    <div>
      {items.map(item => (
        <ExpensiveChild key={item.id} id={item.id} name={item.name} />
      ))}
    </div>
  );
}

// 自定义比较函数
const OptimizedComponent = React.memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回true表示不需要重渲染
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### 策略6：Context Selector模式

实现细粒度的订阅：

```jsx
import { createContext, useContext, useRef, useSyncExternalStore, useCallback } from 'react';

function createContextSelector() {
  const Context = createContext(null);

  function Provider({ value, children }) {
    const stateRef = useRef(value);
    const listenersRef = useRef(new Set());

    // 更新state引用
    stateRef.current = value;

    // 订阅函数
    const subscribe = useCallback((callback) => {
      listenersRef.current.add(callback);
      return () => listenersRef.current.delete(callback);
    }, []);

    // 获取快照
    const getSnapshot = useCallback(() => stateRef.current, []);

    const contextValue = useCallback(() => ({
      subscribe,
      getSnapshot
    }), [subscribe, getSnapshot]);

    return (
      <Context.Provider value={contextValue()}>
        {children}
      </Context.Provider>
    );
  }

  function useSelector(selector) {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useSelector must be used within Provider');
    }

    const { subscribe, getSnapshot } = context;

    return useSyncExternalStore(
      subscribe,
      () => selector(getSnapshot()),
      () => selector(getSnapshot())
    );
  }

  return [Provider, useSelector];
}

// 使用示例
const [StoreProvider, useStoreSelector] = createContextSelector();

function App() {
  const [state, setState] = useState({
    user: { id: 1, name: 'Alice', email: 'alice@example.com' },
    theme: 'light',
    count: 0
  });

  return (
    <StoreProvider value={state}>
      <UserName />
      <UserEmail />
      <ThemeDisplay />
      <Counter />
      <UpdateButtons setState={setState} />
    </StoreProvider>
  );
}

// 只订阅name，其他字段变化不会重渲染
function UserName() {
  const name = useStoreSelector(state => state.user.name);
  console.log('UserName render');
  return <div>Name: {name}</div>;
}

// 只订阅email
function UserEmail() {
  const email = useStoreSelector(state => state.user.email);
  console.log('UserEmail render');
  return <div>Email: {email}</div>;
}

// 只订阅theme
function ThemeDisplay() {
  const theme = useStoreSelector(state => state.theme);
  console.log('ThemeDisplay render');
  return <div>Theme: {theme}</div>;
}

// 只订阅count
function Counter() {
  const count = useStoreSelector(state => state.count);
  console.log('Counter render');
  return <div>Count: {count}</div>;
}
```

### 策略7：懒初始化和按需加载

```jsx
const HeavyDataContext = createContext();

function HeavyDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (data) return; // 已加载则跳过

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/heavy-data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  const value = useMemo(
    () => ({
      data,
      isLoading,
      error,
      loadData
    }),
    [data, isLoading, error, loadData]
  );

  return (
    <HeavyDataContext.Provider value={value}>
      {children}
    </HeavyDataContext.Provider>
  );
}

// 只在需要时加载
function HeavyDataComponent() {
  const { data, isLoading, error, loadData } = useContext(HeavyDataContext);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return <div>{JSON.stringify(data)}</div>;
}
```

## 高级优化技术

### 技术1：使用useCallback稳定函数引用

```jsx
function OptimizedProvider({ children }) {
  const [items, setItems] = useState([]);

  // 使用useCallback确保函数引用稳定
  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateItem
    }),
    [items, addItem, removeItem, updateItem]
  );

  return (
    <ItemsContext.Provider value={value}>
      {children}
    </ItemsContext.Provider>
  );
}
```

### 技术2：计算属性缓存

```jsx
function DataProvider({ children }) {
  const [rawData, setRawData] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // 缓存过滤后的数据
  const filteredData = useMemo(() => {
    let result = rawData;

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => item[key] === value);
      }
    });

    return result;
  }, [rawData, filters]);

  // 缓存排序后的数据
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // 缓存统计数据
  const statistics = useMemo(() => {
    return {
      total: rawData.length,
      filtered: filteredData.length,
      sorted: sortedData.length
    };
  }, [rawData.length, filteredData.length, sortedData.length]);

  const value = useMemo(
    () => ({
      rawData,
      filteredData,
      sortedData,
      statistics,
      setRawData,
      setFilters,
      setSortConfig
    }),
    [rawData, filteredData, sortedData, statistics]
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
```

### 技术3：批量更新优化

```jsx
import { unstable_batchedUpdates } from 'react-dom';

function BatchProvider({ children }) {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});

  const batchUpdate = useCallback((updates) => {
    unstable_batchedUpdates(() => {
      if (updates.count !== undefined) setCount(updates.count);
      if (updates.user !== undefined) setUser(updates.user);
      if (updates.settings !== undefined) setSettings(updates.settings);
    });
  }, []);

  const value = useMemo(
    () => ({
      count,
      user,
      settings,
      setCount,
      setUser,
      setSettings,
      batchUpdate
    }),
    [count, user, settings, batchUpdate]
  );

  return (
    <BatchContext.Provider value={value}>
      {children}
    </BatchContext.Provider>
  );
}

// 使用
function UpdateButton() {
  const { batchUpdate } = useContext(BatchContext);

  const handleClick = () => {
    // 批量更新，只触发一次重渲染
    batchUpdate({
      count: 100,
      user: { name: 'Bob' },
      settings: { theme: 'dark' }
    });
  };

  return <button onClick={handleClick}>Batch Update</button>;
}
```

### 技术4：虚拟化长列表

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedListProvider({ children }) {
  const [items, setItems] = useState(
    Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` }))
  );

  const value = useMemo(() => ({ items, setItems }), [items]);

  return (
    <ListContext.Provider value={value}>
      {children}
    </ListContext.Provider>
  );
}

function VirtualizedList() {
  const { items } = useContext(ListContext);

  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].text}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 技术5：使用Transition API

```jsx
import { useTransition } from 'react';

function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const search = useCallback((searchQuery) => {
    setQuery(searchQuery);

    // 将搜索结果更新标记为低优先级
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

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

function SearchInput() {
  const { search, isPending } = useContext(SearchContext);

  return (
    <div>
      <input
        type="text"
        onChange={(e) => search(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <span>Searching...</span>}
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

## 性能监控和调试

### 使用React DevTools Profiler

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyProvider>
        <MainContent />
      </MyProvider>
    </Profiler>
  );
}
```

### 自定义性能追踪Hook

```jsx
function useRenderCount(componentName) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
}

function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// 使用
function MyComponent(props) {
  useRenderCount('MyComponent');
  useWhyDidYouUpdate('MyComponent', props);

  const { theme } = useContext(ThemeContext);

  return <div className={theme}>Content</div>;
}
```

### Context更新追踪

```jsx
function createTrackedContext(initialValue, contextName) {
  const Context = createContext(initialValue);
  Context.displayName = contextName;

  function TrackedProvider({ value, children }) {
    const previousValue = useRef(value);

    useEffect(() => {
      if (previousValue.current !== value) {
        console.log(`[${contextName}] value changed:`, {
          from: previousValue.current,
          to: value
        });
        previousValue.current = value;
      }
    }, [value]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  return [Context, TrackedProvider];
}

// 使用
const [ThemeContext, ThemeProvider] = createTrackedContext('light', 'ThemeContext');
```

## 实战案例：性能优化的完整示例

### 案例：优化的用户管理系统

```jsx
import { createContext, useContext, useState, useMemo, useCallback, useReducer } from 'react';

// 1. 拆分State和Dispatch Context
const UserStateContext = createContext();
const UserDispatchContext = createContext();

// 2. 使用Reducer管理复杂状态
const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload.updates } : user
        )
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(user => user.id !== action.payload) };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    default:
      return state;
  }
};

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, {
    users: [],
    filter: '',
    sortBy: 'name'
  });

  // 3. 缓存计算属性
  const filteredAndSortedUsers = useMemo(() => {
    let result = state.users;

    // 过滤
    if (state.filter) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(state.filter.toLowerCase()) ||
        user.email.toLowerCase().includes(state.filter.toLowerCase())
      );
    }

    // 排序
    result.sort((a, b) => {
      if (a[state.sortBy] < b[state.sortBy]) return -1;
      if (a[state.sortBy] > b[state.sortBy]) return 1;
      return 0;
    });

    return result;
  }, [state.users, state.filter, state.sortBy]);

  // 4. 添加计算属性到state
  const stateWithComputed = useMemo(
    () => ({
      ...state,
      filteredAndSortedUsers,
      totalUsers: state.users.length,
      filteredCount: filteredAndSortedUsers.length
    }),
    [state, filteredAndSortedUsers]
  );

  return (
    <UserStateContext.Provider value={stateWithComputed}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

// 5. 自定义Hooks
function useUserState() {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('useUserState must be used within UserProvider');
  }
  return context;
}

function useUserDispatch() {
  const context = useContext(UserDispatchContext);
  if (!context) {
    throw new Error('useUserDispatch must be used within UserProvider');
  }
  return context;
}

// 6. 优化的组件 - 只读取dispatch，不会因state变化重渲染
const UserForm = React.memo(function UserForm() {
  const dispatch = useUserDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      dispatch({
        type: 'ADD_USER',
        payload: { id: Date.now(), name, email }
      });
      setName('');
      setEmail('');
    },
    [dispatch, name, email]
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Add User</button>
    </form>
  );
});

// 7. 优化的列表组件
function UserList() {
  const { filteredAndSortedUsers } = useUserState();

  return (
    <ul>
      {filteredAndSortedUsers.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
}

// 8. 使用React.memo的列表项
const UserListItem = React.memo(function UserListItem({ user }) {
  const dispatch = useUserDispatch();

  const handleDelete = useCallback(() => {
    dispatch({ type: 'DELETE_USER', payload: user.id });
  }, [dispatch, user.id]);

  return (
    <li>
      <span>{user.name}</span>
      <span>{user.email}</span>
      <button onClick={handleDelete}>Delete</button>
    </li>
  );
});

// 9. 过滤和排序控件 - 只使用dispatch
function UserControls() {
  const dispatch = useUserDispatch();
  const { filter, sortBy, totalUsers, filteredCount } = useUserState();

  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
        placeholder="Filter users..."
      />
      <select
        value={sortBy}
        onChange={(e) => dispatch({ type: 'SET_SORT', payload: e.target.value })}
      >
        <option value="name">Sort by Name</option>
        <option value="email">Sort by Email</option>
      </select>
      <p>
        Showing {filteredCount} of {totalUsers} users
      </p>
    </div>
  );
}

// 10. 完整应用
function App() {
  return (
    <UserProvider>
      <h1>User Management</h1>
      <UserForm />
      <UserControls />
      <UserList />
    </UserProvider>
  );
}
```

## Context性能优化检查清单

### 设计阶段

- [ ] 将不相关的状态拆分到不同的Context
- [ ] 分离State Context和Dispatch Context
- [ ] 为Context设置合理的默认值
- [ ] 使用TypeScript定义Context类型

### 实现阶段

- [ ] 使用useMemo稳定Context value
- [ ] 使用useCallback稳定函数引用
- [ ] 对计算属性使用useMemo缓存
- [ ] 考虑使用useReducer管理复杂状态
- [ ] 为重组件使用React.memo
- [ ] 实现Context Selector模式（如需要）

### 优化阶段

- [ ] 使用React DevTools Profiler分析性能
- [ ] 识别不必要的重渲染
- [ ] 添加性能监控和日志
- [ ] 考虑懒加载和代码分割
- [ ] 对长列表使用虚拟化
- [ ] 使用Transition API处理低优先级更新

### 维护阶段

- [ ] 定期review Context结构
- [ ] 监控Context的使用范围
- [ ] 更新文档和类型定义
- [ ] 进行性能回归测试

## 性能对比测试

### 测试1：拆分vs不拆分Context

```jsx
// 不拆分 - 性能差
function SlowApp() {
  const [user, setUser] = useState({ name: 'Alice' });
  const [theme, setTheme] = useState('light');
  const [count, setCount] = useState(0);

  const value = { user, setUser, theme, setTheme, count, setCount };

  return (
    <AppContext.Provider value={value}>
      {/* count变化导致所有组件重渲染 */}
      <UserDisplay /> {/* 不需要count但仍重渲染 */}
      <ThemeDisplay /> {/* 不需要count但仍重渲染 */}
      <Counter />
    </AppContext.Provider>
  );
}

// 拆分 - 性能好
function FastApp() {
  return (
    <UserProvider>
      <ThemeProvider>
        <CountProvider>
          <UserDisplay /> {/* 只在user变化时重渲染 */}
          <ThemeDisplay /> {/* 只在theme变化时重渲染 */}
          <Counter /> {/* 只在count变化时重渲染 */}
        </CountProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

### 测试2：useMemo的影响

```jsx
// 不使用useMemo - 每次都创建新对象
function SlowProvider({ children }) {
  const [count, setCount] = useState(0);

  // 每次渲染都创建新对象，导致所有消费者重渲染
  const value = { count, setCount };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// 使用useMemo - 引用稳定
function FastProvider({ children }) {
  const [count, setCount] = useState(0);

  const value = useMemo(() => ({ count, setCount }), [count]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
```

## 总结

Context性能优化的关键原则：

1. **拆分Context**：将不同类型的状态分离到独立的Context中
2. **稳定引用**：使用useMemo和useCallback确保引用稳定
3. **分离关注点**：State和Dispatch使用不同的Context
4. **缓存计算**：对派生数据使用useMemo
5. **组件优化**：使用React.memo防止不必要的重渲染
6. **批量更新**：合并多个状态更新
7. **懒加载**：按需加载重数据
8. **性能监控**：使用工具识别性能瓶颈

正确使用这些优化技术，可以让Context在大型应用中依然保持良好的性能。但要记住，过早优化是万恶之源，先确保应用正常工作，再根据实际性能问题进行针对性优化。

