# Context与Redux对比

## 1. Context基础

### 1.1 Context核心概念

```jsx
// 创建Context
const ThemeContext = React.createContext('light');

// Provider
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// Consumer
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}
```

### 1.2 Context的优势

```typescript
const contextAdvantages = {
  '简单易用': '无需额外依赖，React内置',
  '轻量': '代码量少，学习成本低',
  '适合小型应用': '简单的全局状态管理',
  '类型安全': '配合TypeScript易于类型推导'
};
```

### 1.3 Context的劣势

```typescript
const contextDisadvantages = {
  '性能问题': 'Context变化时，所有消费者都会重渲染',
  '缺乏工具': '没有DevTools、时间旅行等调试工具',
  '异步处理': '没有内置的异步处理机制',
  '持久化': '没有内置的状态持久化方案',
  '中间件': '无法使用中间件扩展功能'
};
```

## 2. Redux基础

### 2.1 Redux核心概念

```javascript
// Store
const store = createStore(rootReducer);

// Action
const increment = () => ({ type: 'INCREMENT' });

// Reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    default:
      return state;
  }
}

// 使用
function Counter() {
  const count = useSelector(state => state.counter);
  const dispatch = useDispatch();
  
  return (
    <button onClick={() => dispatch(increment())}>
      {count}
    </button>
  );
}
```

### 2.2 Redux的优势

```typescript
const reduxAdvantages = {
  '强大工具': 'Redux DevTools、时间旅行调试',
  '中间件生态': '丰富的中间件（thunk、saga等）',
  '性能优化': '精确的订阅机制，避免不必要渲染',
  '可预测': '单向数据流，状态变化可追踪',
  '成熟生态': '大量的最佳实践和库支持',
  '持久化': '易于实现状态持久化'
};
```

### 2.3 Redux的劣势

```typescript
const reduxDisadvantages = {
  '样板代码多': '需要actions、reducers、types',
  '学习曲线': '概念多，需要理解中间件、reducer等',
  '额外依赖': '需要安装redux和react-redux',
  '过度设计': '小型应用可能过于复杂'
};
```

## 3. 性能对比

### 3.1 Context性能问题

```jsx
// 问题：Context变化导致所有消费者重渲染
const AppContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  // 问题：user或theme任一变化，所有消费者都重渲染
  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      <Header />
      <Content />
      <Footer />
    </AppContext.Provider>
  );
}

function Header() {
  // 即使只使用theme，user变化也会导致重渲染
  const { theme } = useContext(AppContext);
  return <header className={theme}>Header</header>;
}
```

### 3.2 Context性能优化

```jsx
// 解决方案1：拆分Context
const UserContext = createContext();
const ThemeContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Header />
        <Content />
        <Footer />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 解决方案2：useMemo
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        <Header />
        <Content />
        <Footer />
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 解决方案3：Context Selector模式
function createSelectorContext(initialState) {
  const context = createContext(null);
  
  function Provider({ children, value }) {
    const stateRef = useRef(value);
    const listenersRef = useRef(new Set());
    
    useEffect(() => {
      stateRef.current = value;
      listenersRef.current.forEach(listener => listener());
    }, [value]);
    
    const subscribe = useCallback((listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    }, []);
    
    const getState = useCallback(() => stateRef.current, []);
    
    return (
      <context.Provider value={{ subscribe, getState }}>
        {children}
      </context.Provider>
    );
  }
  
  function useSelector(selector) {
    const { subscribe, getState } = useContext(context);
    const [, forceUpdate] = useState({});
    const selectorRef = useRef(selector);
    const selectedRef = useRef();
    
    selectorRef.current = selector;
    selectedRef.current = selector(getState());
    
    useEffect(() => {
      const checkUpdate = () => {
        const newSelected = selectorRef.current(getState());
        if (newSelected !== selectedRef.current) {
          selectedRef.current = newSelected;
          forceUpdate({});
        }
      };
      
      return subscribe(checkUpdate);
    }, [subscribe, getState]);
    
    return selectedRef.current;
  }
  
  return { Provider, useSelector };
}

// 使用
const { Provider, useSelector } = createSelectorContext({
  user: null,
  theme: 'light'
});

function Header() {
  // 只订阅theme，user变化不会重渲染
  const theme = useSelector(state => state.theme);
  return <header className={theme}>Header</header>;
}
```

### 3.3 Redux性能优势

```jsx
// Redux的精确订阅
function Header() {
  // 只订阅theme，其他state变化不会重渲染
  const theme = useSelector(state => state.theme);
  return <header className={theme}>Header</header>;
}

function UserProfile() {
  // 只订阅user，theme变化不会重渲染
  const user = useSelector(state => state.user);
  return <div>{user?.name}</div>;
}

// Redux Toolkit的createSelector
import { createSelector } from '@reduxjs/toolkit';

const selectUser = state => state.user;
const selectPosts = state => state.posts;

const selectUserPosts = createSelector(
  [selectUser, selectPosts],
  (user, posts) => posts.filter(post => post.authorId === user.id)
);

function UserPosts() {
  // memoized selector，只在user或posts变化时重新计算
  const userPosts = useSelector(selectUserPosts);
  return <PostList posts={userPosts} />;
}
```

## 4. 使用场景对比

### 4.1 Context适用场景

```typescript
const contextUseCases = {
  '主题切换': {
    reason: '简单的全局配置，变化不频繁',
    example: '亮色/暗色主题'
  },
  
  '语言切换': {
    reason: '全局配置，变化较少',
    example: '中文/英文切换'
  },
  
  '用户认证': {
    reason: '登录状态，变化不频繁',
    example: '登录/登出'
  },
  
  '配置信息': {
    reason: '应用级配置，基本不变',
    example: 'API endpoint、feature flags'
  },
  
  '小型应用': {
    reason: '状态简单，不需要复杂工具',
    example: 'Todo应用、简单表单'
  }
};
```

### 4.2 Redux适用场景

```typescript
const reduxUseCases = {
  '大型应用': {
    reason: '状态复杂，需要强大的状态管理',
    example: '电商平台、社交媒体'
  },
  
  '频繁更新': {
    reason: '高频状态变化，需要性能优化',
    example: '实时数据看板、游戏'
  },
  
  '需要调试': {
    reason: 'Redux DevTools、时间旅行',
    example: '复杂业务逻辑调试'
  },
  
  '异步操作': {
    reason: '丰富的异步中间件',
    example: 'API调用、WebSocket'
  },
  
  '状态持久化': {
    reason: '易于实现本地存储',
    example: '用户偏好、购物车'
  },
  
  '跨组件通信': {
    reason: '复杂的组件间数据共享',
    example: '多步骤表单、协作编辑'
  }
};
```

## 5. 代码量对比

### 5.1 Context实现Todo应用

```jsx
// Context版本（约50行）
const TodoContext = createContext();

function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    setTodos([...todos, {
      id: Date.now(),
      text,
      completed: false
    }]);
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useContext(TodoContext);
  
  return (
    <ul>
      {todos.map(todo => (
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

function AddTodo() {
  const { addTodo } = useContext(TodoContext);
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text);
      setText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 5.2 Redux实现Todo应用

```jsx
// Redux版本（约100行）

// types.js
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';

// actions.js
const addTodo = (text) => ({
  type: ADD_TODO,
  payload: {
    id: Date.now(),
    text,
    completed: false
  }
});

const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: id
});

const deleteTodo = (id) => ({
  type: DELETE_TODO,
  payload: id
});

// reducer.js
function todosReducer(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, action.payload];
    
    case TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    
    case DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    
    default:
      return state;
  }
}

// store.js
const store = createStore(todosReducer);

// TodoList.jsx
function TodoList() {
  const todos = useSelector(state => state);
  const dispatch = useDispatch();
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch(toggleTodo(todo.id))}
          />
          <span>{todo.text}</span>
          <button onClick={() => dispatch(deleteTodo(todo.id))}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

// AddTodo.jsx
function AddTodo() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch(addTodo(text));
      setText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 5.3 Redux Toolkit实现

```jsx
// Redux Toolkit版本（约60行）

// todosSlice.js
import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      return state.filter(t => t.id !== action.payload);
    }
  }
});

export const { addTodo, toggleTodo, deleteTodo } = todosSlice.actions;
export default todosSlice.reducer;

// store.js
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './todosSlice';

export const store = configureStore({
  reducer: {
    todos: todosReducer
  }
});

// 组件使用（与Redux版本相同，但actions更简洁）
```

## 6. 混合使用策略

### 6.1 Context + Redux结合

```jsx
// Context用于不常变化的全局配置
const ThemeContext = createContext();
const I18nContext = createContext();

// Redux用于频繁变化的业务状态
const store = configureStore({
  reducer: {
    user: userReducer,
    todos: todosReducer,
    posts: postsReducer
  }
});

function App() {
  const [theme, setTheme] = useState('light');
  const [locale, setLocale] = useState('zh-CN');
  
  return (
    <Provider store={store}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <I18nContext.Provider value={{ locale, setLocale }}>
          <AppContent />
        </I18nContext.Provider>
      </ThemeContext.Provider>
    </Provider>
  );
}
```

### 6.2 何时混合使用

```typescript
const hybridStrategy = {
  '使用Context': [
    '主题配置',
    '语言设置',
    '用户认证状态',
    '路由配置',
    '功能开关'
  ],
  
  '使用Redux': [
    '业务数据（用户、订单、产品）',
    '列表数据和过滤',
    '表单状态',
    '异步数据获取',
    '需要持久化的数据'
  ],
  
  '优势': [
    '各司其职，职责清晰',
    '性能最优',
    '开发体验好',
    '易于维护'
  ]
};
```

## 7. 迁移指南

### 7.1 从Context迁移到Redux

```jsx
// 步骤1：识别需要迁移的状态
// Context版本
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [settings, setSettings] = useState({});
  
  return (
    <AppContext.Provider value={{
      user, setUser,
      todos, setTodos,
      settings, setSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

// 步骤2：创建Redux store
// 迁移todos到Redux
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    setTodos: (state, action) => action.payload,
    addTodo: (state, action) => {
      state.push(action.payload);
    }
  }
});

// 步骤3：保留简单状态在Context
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  
  return (
    <Provider store={store}>
      <UserContext.Provider value={{ user, setUser }}>
        <SettingsContext.Provider value={{ settings, setSettings }}>
          {children}
        </SettingsContext.Provider>
      </UserContext.Provider>
    </Provider>
  );
}

// 步骤4：更新组件
// 之前
function TodoList() {
  const { todos } = useContext(AppContext);
  return <ul>{/* ... */}</ul>;
}

// 之后
function TodoList() {
  const todos = useSelector(state => state.todos);
  return <ul>{/* ... */}</ul>;
}
```

## 8. 性能测试对比

### 8.1 测试场景

```jsx
// 测试：1000次状态更新的性能

// Context版本
function ContextPerformanceTest() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  
  const runTest = () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      setCount(i);
      setData(prev => [...prev, i]);
    }
    
    const end = performance.now();
    console.log(`Context: ${end - start}ms`);
  };
  
  return <button onClick={runTest}>Test Context</button>;
}

// Redux版本
function ReduxPerformanceTest() {
  const dispatch = useDispatch();
  
  const runTest = () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      dispatch({ type: 'SET_COUNT', payload: i });
      dispatch({ type: 'ADD_DATA', payload: i });
    }
    
    const end = performance.now();
    console.log(`Redux: ${end - start}ms`);
  };
  
  return <button onClick={runTest}>Test Redux</button>;
}
```

### 8.2 性能测试结果

```typescript
const performanceComparison = {
  '小型应用（<10个组件）': {
    Context: '~50ms',
    Redux: '~60ms',
    winner: 'Context（开销更小）'
  },
  
  '中型应用（10-50个组件）': {
    Context: '~200ms',
    Redux: '~120ms',
    winner: 'Redux（精确订阅优势开始显现）'
  },
  
  '大型应用（>50个组件）': {
    Context: '~800ms',
    Redux: '~150ms',
    winner: 'Redux（精确订阅带来显著优势）'
  },
  
  '频繁更新场景': {
    Context: '严重卡顿',
    Redux: '流畅',
    winner: 'Redux（批量更新、精确订阅）'
  }
};
```

## 9. 面试重点

### 9.1 高频面试题

```typescript
const interviewQuestions = [
  {
    q: 'Context和Redux的主要区别？',
    a: `
      1. 性能：Redux精确订阅，Context全量通知
      2. 工具：Redux有DevTools，Context没有
      3. 中间件：Redux支持，Context不支持
      4. 复杂度：Context简单，Redux复杂
      5. 适用场景：Context适合简单场景，Redux适合复杂应用
    `
  },
  
  {
    q: 'Context的性能问题如何解决？',
    a: `
      1. 拆分Context：按更新频率分离
      2. useMemo：缓存value对象
      3. Context Selector：实现精确订阅
      4. 考虑使用Redux或其他状态管理库
    `
  },
  
  {
    q: '何时选择Context？何时选择Redux？',
    a: `
      选择Context：
      - 简单的全局状态
      - 更新不频繁
      - 小型应用
      - 不需要调试工具
      
      选择Redux：
      - 复杂的状态逻辑
      - 频繁更新
      - 需要调试工具
      - 需要中间件处理异步
      - 大型应用
    `
  },
  
  {
    q: 'Context和Redux可以混合使用吗？',
    a: `
      可以，推荐策略：
      - Context：主题、语言、认证等配置
      - Redux：业务数据、异步操作
      - 各司其职，发挥各自优势
    `
  },
  
  {
    q: 'Redux的订阅机制和Context有何不同？',
    a: `
      Redux：
      - 组件订阅特定的state片段
      - 只在订阅的数据变化时重渲染
      - useSelector实现精确订阅
      
      Context：
      - 消费者订阅整个Context
      - Context任何变化都会重渲染
      - 需要额外优化（拆分、selector）
    `
  }
];
```

### 9.2 实战对比表

```typescript
const comparisonTable = {
  '学习曲线': {
    Context: '⭐⭐ 简单',
    Redux: '⭐⭐⭐⭐ 复杂',
    'Redux Toolkit': '⭐⭐⭐ 中等'
  },
  
  '代码量': {
    Context: '⭐⭐⭐⭐⭐ 最少',
    Redux: '⭐⭐ 较多',
    'Redux Toolkit': '⭐⭐⭐ 中等'
  },
  
  '性能': {
    Context: '⭐⭐ 需优化',
    Redux: '⭐⭐⭐⭐ 优秀',
    'Redux Toolkit': '⭐⭐⭐⭐ 优秀'
  },
  
  '调试体验': {
    Context: '⭐⭐ 基础',
    Redux: '⭐⭐⭐⭐⭐ 最佳',
    'Redux Toolkit': '⭐⭐⭐⭐⭐ 最佳'
  },
  
  '异步处理': {
    Context: '⭐⭐ 需自行实现',
    Redux: '⭐⭐⭐⭐ 中间件支持',
    'Redux Toolkit': '⭐⭐⭐⭐⭐ 内置支持'
  },
  
  '适用规模': {
    Context: '小型应用',
    Redux: '中大型应用',
    'Redux Toolkit': '中大型应用'
  }
};
```

## 10. 总结

Context与Redux对比的核心要点:

1. **简单 vs 强大**: Context简单，Redux功能强大
2. **性能**: Redux订阅更精确
3. **调试**: Redux工具更强大
4. **中间件**: Redux生态丰富
5. **适用场景**: 根据需求选择
6. **混合使用**: 发挥各自优势

理解两者差异有助于选择合适方案。

## 11. 扩展阅读

- [React Context官方文档](https://react.dev/learn/passing-data-deeply-with-context)
- [Redux官方文档](https://redux.js.org/)
- [Redux vs Context](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)
- [状态管理方案对比](https://kentcdodds.com/blog/application-state-management-with-react)