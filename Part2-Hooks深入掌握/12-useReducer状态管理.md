# useReducer状态管理

## 学习目标

通过本章学习,你将全面掌握:

- useReducer的核心概念与工作原理
- reducer函数的编写规则与最佳实践
- action对象的设计模式
- dispatch函数的使用技巧
- useReducer的高级应用场景
- 复杂状态管理策略
- useReducer与Redux的联系与区别
- 中间件模式的实现方法
- useReducer的性能优化
- TypeScript中的useReducer类型定义
- React 19中useReducer的增强特性

## 第一部分:useReducer核心概念

### 1.1 什么是useReducer

useReducer是useState的替代方案,特别适合管理包含多个子值的复杂state逻辑。

```jsx
import { useReducer } from 'react';

// 基本语法
const [state, dispatch] = useReducer(reducer, initialState, init);

// 参数说明:
// reducer: (state, action) => newState 的函数
// initialState: 初始状态
// init: 可选,惰性初始化函数

// reducer函数签名
function reducer(state, action) {
  // 根据action.type返回新state
  // 必须是纯函数,不能有副作用
  return newState;
}

// 最简单的示例
function SimpleCounter() {
  // 定义reducer
  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      case 'decrement':
        return { count: state.count - 1 };
      case 'reset':
        return { count: 0 };
      default:
        return state;
    }
  }
  
  // 使用useReducer
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        增加
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        减少
      </button>
      <button onClick={() => dispatch({ type: 'reset' })}>
        重置
      </button>
    </div>
  );
}
```

### 1.2 useReducer vs useState

```jsx
// useState适合:简单状态
function WithUseState() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // 简单,直观
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '关闭' : '打开'}
      </button>
    </div>
  );
}

// useReducer适合:复杂状态,多个相关状态
function WithUseReducer() {
  const initialState = {
    count: 0,
    name: '',
    isOpen: false,
    items: [],
    loading: false,
    error: null
  };
  
  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return { ...state, count: state.count + 1 };
      
      case 'setName':
        return { ...state, name: action.payload };
      
      case 'toggleOpen':
        return { ...state, isOpen: !state.isOpen };
      
      case 'addItem':
        return {
          ...state,
          items: [...state.items, action.payload]
        };
      
      case 'startLoading':
        return { ...state, loading: true, error: null };
      
      case 'loadSuccess':
        return {
          ...state,
          loading: false,
          items: action.payload
        };
      
      case 'loadError':
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      default:
        return state;
    }
  }
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 集中管理,逻辑清晰
  return (
    <div>
      <button onClick={() => dispatch({ type: 'increment' })}>
        {state.count}
      </button>
      
      <input
        value={state.name}
        onChange={e => dispatch({ type: 'setName', payload: e.target.value })}
      />
      
      <button onClick={() => dispatch({ type: 'toggleOpen' })}>
        {state.isOpen ? '关闭' : '打开'}
      </button>
      
      {state.loading && <p>加载中...</p>}
      {state.error && <p>错误: {state.error}</p>}
      {state.items.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );
}

// 对比总结
/*
useState:
- 适合简单、独立的状态
- API简单直观
- 每个状态单独管理
- 适合小组件

useReducer:
- 适合复杂、相关的状态
- 逻辑集中在reducer
- 状态更新可预测
- 适合大组件或复杂业务逻辑
- 便于测试
- 类似Redux的模式
*/
```

### 1.3 Reducer函数规则

```jsx
// Reducer必须是纯函数
function pureReducer(state, action) {
  // ✅ 正确:返回新对象
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    
    case 'addItem':
      return { ...state, items: [...state.items, action.payload] };
    
    case 'updateUser':
      return { ...state, user: { ...state.user, ...action.payload } };
    
    default:
      return state;
  }
}

// ❌ 错误:修改原state
function impureReducer(state, action) {
  switch (action.type) {
    case 'increment':
      state.count++;  // ❌ 直接修改state
      return state;
    
    case 'addItem':
      state.items.push(action.payload);  // ❌ 修改数组
      return state;
    
    case 'updateUser':
      state.user.name = action.payload.name;  // ❌ 修改对象
      return state;
    
    default:
      return state;
  }
}

// ❌ 错误:有副作用
function sideEffectReducer(state, action) {
  switch (action.type) {
    case 'save':
      // ❌ 不要在reducer中调用API
      fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(state)
      });
      return state;
    
    case 'log':
      // ❌ 不要有副作用
      console.log('State changed:', state);
      return state;
    
    case 'random':
      // ❌ 不要依赖随机值
      return { ...state, id: Math.random() };
    
    default:
      return state;
  }
}

// ✅ 正确:处理各种数据类型
function correctReducer(state, action) {
  switch (action.type) {
    // 原始类型
    case 'setCount':
      return { ...state, count: action.payload };
    
    // 数组 - 添加
    case 'addItem':
      return { ...state, items: [...state.items, action.payload] };
    
    // 数组 - 删除
    case 'removeItem':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    // 数组 - 更新
    case 'updateItem':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        )
      };
    
    // 对象 - 合并
    case 'updateUser':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    // 嵌套对象
    case 'updateAddress':
      return {
        ...state,
        user: {
          ...state.user,
          address: {
            ...state.user.address,
            ...action.payload
          }
        }
      };
    
    default:
      return state;
  }
}
```

## 第二部分:Action设计模式

### 2.1 基本Action结构

```jsx
// 基本Action:只有type
dispatch({ type: 'increment' });

// 带payload的Action
dispatch({
  type: 'setUser',
  payload: { id: 1, name: 'Alice' }
});

// 扩展的Action
dispatch({
  type: 'addTodo',
  payload: { text: '学习React', completed: false },
  meta: { timestamp: Date.now() }
});

// Flux标准Action (FSA)
const action = {
  type: 'ADD_TODO',        // 必需:action类型
  payload: todoData,       // 可选:数据
  error: false,            // 可选:是否错误
  meta: { timestamp }      // 可选:元数据
};

// Action Creator
function createAction(type, payload) {
  return { type, payload };
}

function createAddTodoAction(text) {
  return {
    type: 'ADD_TODO',
    payload: {
      id: Date.now(),
      text,
      completed: false
    },
    meta: {
      timestamp: Date.now()
    }
  };
}

// 使用Action Creator
function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const addTodo = (text) => {
    dispatch(createAddTodoAction(text));
  };
  
  return (
    <div>
      <button onClick={() => addTodo('新任务')}>
        添加任务
      </button>
    </div>
  );
}
```

### 2.2 Action类型常量

```jsx
// 定义Action类型常量
const ActionTypes = {
  // 计数器
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  
  // Todo
  ADD_TODO: 'ADD_TODO',
  REMOVE_TODO: 'REMOVE_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  UPDATE_TODO: 'UPDATE_TODO',
  
  // 数据获取
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR'
};

// 在reducer中使用
function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.INCREMENT:
      return { ...state, count: state.count + 1 };
    
    case ActionTypes.ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload]
      };
    
    case ActionTypes.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ActionTypes.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload
      };
    
    case ActionTypes.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    default:
      return state;
  }
}

// Action Creator使用常量
const Actions = {
  increment: () => ({ type: ActionTypes.INCREMENT }),
  
  decrement: () => ({ type: ActionTypes.DECREMENT }),
  
  reset: () => ({ type: ActionTypes.RESET }),
  
  addTodo: (text) => ({
    type: ActionTypes.ADD_TODO,
    payload: {
      id: Date.now(),
      text,
      completed: false
    }
  }),
  
  toggleTodo: (id) => ({
    type: ActionTypes.TOGGLE_TODO,
    payload: id
  }),
  
  fetchStart: () => ({ type: ActionTypes.FETCH_START }),
  
  fetchSuccess: (data) => ({
    type: ActionTypes.FETCH_SUCCESS,
    payload: data
  }),
  
  fetchError: (error) => ({
    type: ActionTypes.FETCH_ERROR,
    payload: error.message
  })
};

// 使用
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const handleClick = () => {
    dispatch(Actions.increment());
  };
  
  const handleAddTodo = () => {
    dispatch(Actions.addTodo('新任务'));
  };
  
  const handleFetch = async () => {
    dispatch(Actions.fetchStart());
    
    try {
      const data = await fetch('/api/data').then(r => r.json());
      dispatch(Actions.fetchSuccess(data));
    } catch (error) {
      dispatch(Actions.fetchError(error));
    }
  };
  
  return (
    <div>
      <button onClick={handleClick}>增加: {state.count}</button>
      <button onClick={handleAddTodo}>添加任务</button>
      <button onClick={handleFetch}>获取数据</button>
    </div>
  );
}
```

### 2.3 命名空间Action

```jsx
// 使用命名空间组织Action
const TodoActions = {
  Types: {
    ADD: 'TODO/ADD',
    REMOVE: 'TODO/REMOVE',
    TOGGLE: 'TODO/TOGGLE',
    UPDATE: 'TODO/UPDATE',
    CLEAR_COMPLETED: 'TODO/CLEAR_COMPLETED'
  },
  
  Creators: {
    add: (text) => ({
      type: TodoActions.Types.ADD,
      payload: { text, id: Date.now(), completed: false }
    }),
    
    remove: (id) => ({
      type: TodoActions.Types.REMOVE,
      payload: id
    }),
    
    toggle: (id) => ({
      type: TodoActions.Types.TOGGLE,
      payload: id
    }),
    
    update: (id, text) => ({
      type: TodoActions.Types.UPDATE,
      payload: { id, text }
    }),
    
    clearCompleted: () => ({
      type: TodoActions.Types.CLEAR_COMPLETED
    })
  }
};

const UserActions = {
  Types: {
    LOGIN: 'USER/LOGIN',
    LOGOUT: 'USER/LOGOUT',
    UPDATE_PROFILE: 'USER/UPDATE_PROFILE'
  },
  
  Creators: {
    login: (user) => ({
      type: UserActions.Types.LOGIN,
      payload: user
    }),
    
    logout: () => ({
      type: UserActions.Types.LOGOUT
    }),
    
    updateProfile: (updates) => ({
      type: UserActions.Types.UPDATE_PROFILE,
      payload: updates
    })
  }
};

// 组合reducer
function combinedReducer(state, action) {
  // Todo reducer
  if (action.type.startsWith('TODO/')) {
    switch (action.type) {
      case TodoActions.Types.ADD:
        return {
          ...state,
          todos: [...state.todos, action.payload]
        };
      
      case TodoActions.Types.REMOVE:
        return {
          ...state,
          todos: state.todos.filter(t => t.id !== action.payload)
        };
      
      case TodoActions.Types.TOGGLE:
        return {
          ...state,
          todos: state.todos.map(t =>
            t.id === action.payload ? { ...t, completed: !t.completed } : t
          )
        };
      
      default:
        return state;
    }
  }
  
  // User reducer
  if (action.type.startsWith('USER/')) {
    switch (action.type) {
      case UserActions.Types.LOGIN:
        return { ...state, user: action.payload };
      
      case UserActions.Types.LOGOUT:
        return { ...state, user: null };
      
      case UserActions.Types.UPDATE_PROFILE:
        return {
          ...state,
          user: { ...state.user, ...action.payload }
        };
      
      default:
        return state;
    }
  }
  
  return state;
}

// 使用
function App() {
  const [state, dispatch] = useReducer(combinedReducer, {
    todos: [],
    user: null
  });
  
  return (
    <div>
      <button onClick={() => dispatch(TodoActions.Creators.add('新任务'))}>
        添加任务
      </button>
      
      <button onClick={() => dispatch(UserActions.Creators.login({ name: 'Alice' }))}>
        登录
      </button>
    </div>
  );
}
```

## 第三部分:高级应用模式

### 3.1 惰性初始化

```jsx
// 基本初始化
const initialState = { count: 0 };
const [state, dispatch] = useReducer(reducer, initialState);

// 惰性初始化:使用init函数
function init(initialCount) {
  return {
    count: initialCount,
    history: [initialCount],
    timestamp: Date.now()
  };
}

function LazyInitExample({ initialCount = 0 }) {
  const [state, dispatch] = useReducer(
    reducer,
    initialCount,
    init  // 第三个参数是init函数
  );
  
  // init函数只在组件挂载时执行一次
  // 适合昂贵的初始化计算
  
  return <div>Count: {state.count}</div>;
}

// 从localStorage恢复状态
function initFromStorage(key) {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('解析失败:', error);
    }
  }
  return { count: 0, items: [] };
}

function StorageExample() {
  const [state, dispatch] = useReducer(
    reducer,
    'myAppState',
    initFromStorage
  );
  
  // 同步到localStorage
  useEffect(() => {
    localStorage.setItem('myAppState', JSON.stringify(state));
  }, [state]);
  
  return <div>State已同步到localStorage</div>;
}

// 复杂初始化逻辑
function complexInit(props) {
  // 可以访问props
  const { userId, config } = props;
  
  // 执行复杂计算
  const initialData = processComplexData(config);
  
  // 返回初始状态
  return {
    userId,
    data: initialData,
    loading: false,
    error: null,
    cache: new Map(),
    timestamp: Date.now()
  };
}

function ComplexInitExample(props) {
  const [state, dispatch] = useReducer(
    reducer,
    props,
    complexInit
  );
  
  return <div>User: {state.userId}</div>;
}
```

### 3.2 Reducer组合

```jsx
// 拆分reducer
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    default:
      return state;
  }
}

function todosReducer(state, action) {
  switch (action.type) {
    case 'addTodo':
      return [...state, action.payload];
    case 'removeTodo':
      return state.filter(t => t.id !== action.payload);
    default:
      return state;
  }
}

function userReducer(state, action) {
  switch (action.type) {
    case 'login':
      return action.payload;
    case 'logout':
      return null;
    default:
      return state;
  }
}

// 组合多个reducer
function combineReducers(reducers) {
  return function combinedReducer(state, action) {
    const newState = {};
    let hasChanged = false;
    
    for (const [key, reducer] of Object.entries(reducers)) {
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      newState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    
    return hasChanged ? newState : state;
  };
}

// 使用组合的reducer
function App() {
  const rootReducer = combineReducers({
    counter: counterReducer,
    todos: todosReducer,
    user: userReducer
  });
  
  const [state, dispatch] = useReducer(rootReducer, {
    counter: 0,
    todos: [],
    user: null
  });
  
  return (
    <div>
      <p>Counter: {state.counter}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        增加
      </button>
      
      <p>Todos: {state.todos.length}</p>
      <button onClick={() => dispatch({
        type: 'addTodo',
        payload: { id: Date.now(), text: '新任务' }
      })}>
        添加任务
      </button>
      
      <p>User: {state.user?.name || '未登录'}</p>
      <button onClick={() => dispatch({
        type: 'login',
        payload: { name: 'Alice' }
      })}>
        登录
      </button>
    </div>
  );
}
```

### 3.3 中间件模式

```jsx
// 日志中间件
function loggerMiddleware(reducer) {
  return function loggedReducer(state, action) {
    console.group(action.type);
    console.log('Previous State:', state);
    console.log('Action:', action);
    
    const nextState = reducer(state, action);
    
    console.log('Next State:', nextState);
    console.groupEnd();
    
    return nextState;
  };
}

// 性能监控中间件
function performanceMiddleware(reducer) {
  return function performanceReducer(state, action) {
    const start = performance.now();
    
    const nextState = reducer(state, action);
    
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 10) {
      console.warn(`慢reducer: ${action.type} 耗时 ${duration.toFixed(2)}ms`);
    }
    
    return nextState;
  };
}

// Thunk中间件(支持异步action)
function thunkMiddleware(dispatch, getState) {
  return function thunkReducer(reducer) {
    return function(state, action) {
      if (typeof action === 'function') {
        // action是函数,执行它并传入dispatch和getState
        return action(dispatch, getState);
      }
      
      // 普通action,正常处理
      return reducer(state, action);
    };
  };
}

// 组合多个中间件
function applyMiddleware(...middlewares) {
  return function(reducer) {
    return middlewares.reduceRight(
      (wrappedReducer, middleware) => middleware(wrappedReducer),
      reducer
    );
  };
}

// 使用中间件
function MiddlewareExample() {
  function baseReducer(state, action) {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      default:
        return state;
    }
  }
  
  // 应用中间件
  const enhancedReducer = applyMiddleware(
    loggerMiddleware,
    performanceMiddleware
  )(baseReducer);
  
  const [state, dispatch] = useReducer(enhancedReducer, { count: 0 });
  
  // 异步action
  const incrementAsync = () => {
    setTimeout(() => {
      dispatch({ type: 'increment' });
    }, 1000);
  };
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        同步增加
      </button>
      <button onClick={incrementAsync}>
        异步增加
      </button>
    </div>
  );
}

// 完整的中间件系统
function createStore(reducer, initialState, middlewares = []) {
  const stateRef = useRef(initialState);
  const [, forceUpdate] = useState({});
  
  // 应用中间件
  const enhancedReducer = middlewares.reduceRight(
    (wrappedReducer, middleware) => middleware(wrappedReducer),
    reducer
  );
  
  const dispatch = useCallback((action) => {
    const newState = enhancedReducer(stateRef.current, action);
    
    if (newState !== stateRef.current) {
      stateRef.current = newState;
      forceUpdate({});
    }
  }, [enhancedReducer]);
  
  const getState = useCallback(() => {
    return stateRef.current;
  }, []);
  
  return [stateRef.current, dispatch, getState];
}
```

## 第四部分:实战应用

### 4.1 Todo应用

```jsx
// Todo应用的完整reducer
const TodoActionTypes = {
  ADD: 'ADD_TODO',
  REMOVE: 'REMOVE_TODO',
  TOGGLE: 'TOGGLE_TODO',
  UPDATE: 'UPDATE_TODO',
  CLEAR_COMPLETED: 'CLEAR_COMPLETED',
  TOGGLE_ALL: 'TOGGLE_ALL',
  SET_FILTER: 'SET_FILTER'
};

function todoReducer(state, action) {
  switch (action.type) {
    case TodoActionTypes.ADD:
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false,
            createdAt: Date.now()
          }
        ]
      };
    
    case TodoActionTypes.REMOVE:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case TodoActionTypes.TOGGLE:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case TodoActionTypes.UPDATE:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        )
      };
    
    case TodoActionTypes.CLEAR_COMPLETED:
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
    
    case TodoActionTypes.TOGGLE_ALL:
      const allCompleted = state.todos.every(todo => todo.completed);
      return {
        ...state,
        todos: state.todos.map(todo => ({
          ...todo,
          completed: !allCompleted
        }))
      };
    
    case TodoActionTypes.SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };
    
    default:
      return state;
  }
}

// Todo组件
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });
  
  const [inputValue, setInputValue] = useState('');
  
  const handleAdd = () => {
    if (inputValue.trim()) {
      dispatch({ type: TodoActionTypes.ADD, payload: inputValue });
      setInputValue('');
    }
  };
  
  const filteredTodos = useMemo(() => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(todo => !todo.completed);
      case 'completed':
        return state.todos.filter(todo => todo.completed);
      default:
        return state.todos;
    }
  }, [state.todos, state.filter]);
  
  const stats = useMemo(() => ({
    total: state.todos.length,
    active: state.todos.filter(t => !t.completed).length,
    completed: state.todos.filter(t => t.completed).length
  }), [state.todos]);
  
  return (
    <div className="todo-app">
      <h1>Todo List</h1>
      
      <div className="input-container">
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
          placeholder="添加新任务..."
        />
        <button onClick={handleAdd}>添加</button>
      </div>
      
      <div className="filters">
        <button
          className={state.filter === 'all' ? 'active' : ''}
          onClick={() => dispatch({ type: TodoActionTypes.SET_FILTER, payload: 'all' })}
        >
          全部 ({stats.total})
        </button>
        <button
          className={state.filter === 'active' ? 'active' : ''}
          onClick={() => dispatch({ type: TodoActionTypes.SET_FILTER, payload: 'active' })}
        >
          进行中 ({stats.active})
        </button>
        <button
          className={state.filter === 'completed' ? 'active' : ''}
          onClick={() => dispatch({ type: TodoActionTypes.SET_FILTER, payload: 'completed' })}
        >
          已完成 ({stats.completed})
        </button>
      </div>
      
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: TodoActionTypes.TOGGLE, payload: todo.id })}
            />
            <span>{todo.text}</span>
            <button onClick={() => dispatch({ type: TodoActionTypes.REMOVE, payload: todo.id })}>
              删除
            </button>
          </li>
        ))}
      </ul>
      
      {state.todos.length > 0 && (
        <div className="actions">
          <button onClick={() => dispatch({ type: TodoActionTypes.TOGGLE_ALL })}>
            全选/取消全选
          </button>
          <button onClick={() => dispatch({ type: TodoActionTypes.CLEAR_COMPLETED })}>
            清除已完成
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4.2 表单管理

```jsx
// 表单reducer
const FormActionTypes = {
  SET_FIELD: 'SET_FIELD',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  VALIDATE_FIELD: 'VALIDATE_FIELD',
  SUBMIT_START: 'SUBMIT_START',
  SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
  SUBMIT_ERROR: 'SUBMIT_ERROR',
  RESET: 'RESET'
};

function formReducer(state, action) {
  switch (action.type) {
    case FormActionTypes.SET_FIELD:
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value
        },
        touched: {
          ...state.touched,
          [action.payload.name]: true
        }
      };
    
    case FormActionTypes.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.name]: action.payload.error
        }
      };
    
    case FormActionTypes.CLEAR_ERROR:
      const { [action.payload]: removed, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors
      };
    
    case FormActionTypes.VALIDATE_FIELD:
      const error = validateField(action.payload.name, state.values[action.payload.name]);
      return {
        ...state,
        errors: error
          ? { ...state.errors, [action.payload.name]: error }
          : { ...state.errors, [action.payload.name]: undefined }
      };
    
    case FormActionTypes.SUBMIT_START:
      return {
        ...state,
        submitting: true,
        submitError: null
      };
    
    case FormActionTypes.SUBMIT_SUCCESS:
      return {
        ...state,
        submitting: false,
        submitted: true
      };
    
    case FormActionTypes.SUBMIT_ERROR:
      return {
        ...state,
        submitting: false,
        submitError: action.payload
      };
    
    case FormActionTypes.RESET:
      return action.payload || initialFormState;
    
    default:
      return state;
  }
}

// 表单组件
function RegistrationForm() {
  const initialState = {
    values: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    errors: {},
    touched: {},
    submitting: false,
    submitted: false,
    submitError: null
  };
  
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  const handleChange = (name, value) => {
    dispatch({
      type: FormActionTypes.SET_FIELD,
      payload: { name, value }
    });
    
    // 验证字段
    dispatch({
      type: FormActionTypes.VALIDATE_FIELD,
      payload: { name }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证所有字段
    const errors = validateForm(state.values);
    
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([name, error]) => {
        dispatch({
          type: FormActionTypes.SET_ERROR,
          payload: { name, error }
        });
      });
      return;
    }
    
    dispatch({ type: FormActionTypes.SUBMIT_START });
    
    try {
      await submitForm(state.values);
      dispatch({ type: FormActionTypes.SUBMIT_SUCCESS });
    } catch (error) {
      dispatch({
        type: FormActionTypes.SUBMIT_ERROR,
        payload: error.message
      });
    }
  };
  
  if (state.submitted) {
    return <div className="success">注册成功!</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label>用户名</label>
        <input
          value={state.values.username}
          onChange={e => handleChange('username', e.target.value)}
          className={state.errors.username ? 'error' : ''}
        />
        {state.errors.username && (
          <span className="error-message">{state.errors.username}</span>
        )}
      </div>
      
      <div className="form-field">
        <label>邮箱</label>
        <input
          type="email"
          value={state.values.email}
          onChange={e => handleChange('email', e.target.value)}
          className={state.errors.email ? 'error' : ''}
        />
        {state.errors.email && (
          <span className="error-message">{state.errors.email}</span>
        )}
      </div>
      
      <div className="form-field">
        <label>密码</label>
        <input
          type="password"
          value={state.values.password}
          onChange={e => handleChange('password', e.target.value)}
          className={state.errors.password ? 'error' : ''}
        />
        {state.errors.password && (
          <span className="error-message">{state.errors.password}</span>
        )}
      </div>
      
      <div className="form-field">
        <label>确认密码</label>
        <input
          type="password"
          value={state.values.confirmPassword}
          onChange={e => handleChange('confirmPassword', e.target.value)}
          className={state.errors.confirmPassword ? 'error' : ''}
        />
        {state.errors.confirmPassword && (
          <span className="error-message">{state.errors.confirmPassword}</span>
        )}
      </div>
      
      {state.submitError && (
        <div className="submit-error">{state.submitError}</div>
      )}
      
      <div className="form-actions">
        <button type="submit" disabled={state.submitting}>
          {state.submitting ? '提交中...' : '注册'}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: FormActionTypes.RESET, payload: initialState })}
        >
          重置
        </button>
      </div>
    </form>
  );
}
```

### 4.3 购物车

```jsx
// 购物车reducer
const CartActionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  APPLY_DISCOUNT: 'APPLY_DISCOUNT',
  REMOVE_DISCOUNT: 'REMOVE_DISCOUNT'
};

function cartReducer(state, action) {
  switch (action.type) {
    case CartActionTypes.ADD_ITEM:
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    
    case CartActionTypes.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case CartActionTypes.UPDATE_QUANTITY:
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case CartActionTypes.CLEAR_CART:
      return {
        ...state,
        items: []
      };
    
    case CartActionTypes.APPLY_DISCOUNT:
      return {
        ...state,
        discount: action.payload
      };
    
    case CartActionTypes.REMOVE_DISCOUNT:
      return {
        ...state,
        discount: null
      };
    
    default:
      return state;
  }
}

// 购物车组件
function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    discount: null
  });
  
  // 计算统计信息
  const stats = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const discountAmount = state.discount
      ? subtotal * (state.discount.percentage / 100)
      : 0;
    
    const total = subtotal - discountAmount;
    
    const totalItems = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    
    return {
      subtotal,
      discountAmount,
      total,
      totalItems
    };
  }, [state.items, state.discount]);
  
  const handleAddItem = (product) => {
    dispatch({
      type: CartActionTypes.ADD_ITEM,
      payload: product
    });
  };
  
  const handleRemoveItem = (id) => {
    dispatch({
      type: CartActionTypes.REMOVE_ITEM,
      payload: id
    });
  };
  
  const handleUpdateQuantity = (id, quantity) => {
    dispatch({
      type: CartActionTypes.UPDATE_QUANTITY,
      payload: { id, quantity }
    });
  };
  
  const handleApplyDiscount = (code) => {
    // 模拟验证折扣码
    if (code === 'SAVE10') {
      dispatch({
        type: CartActionTypes.APPLY_DISCOUNT,
        payload: { code, percentage: 10 }
      });
    } else {
      alert('无效的折扣码');
    }
  };
  
  return (
    <div className="shopping-cart">
      <h2>购物车 ({stats.totalItems})</h2>
      
      {state.items.length === 0 ? (
        <p>购物车为空</p>
      ) : (
        <>
          <ul className="cart-items">
            {state.items.map(item => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="price">{item.price}元</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <p className="subtotal">{(item.price * item.quantity).toFixed(2)}元</p>
                <button onClick={() => handleRemoveItem(item.id)}>
                  删除
                </button>
              </li>
            ))}
          </ul>
          
          <div className="cart-summary">
            <div className="discount-section">
              <input
                type="text"
                placeholder="输入折扣码"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handleApplyDiscount(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              {state.discount && (
                <div className="applied-discount">
                  已应用: {state.discount.code} ({state.discount.percentage}% off)
                  <button onClick={() => dispatch({ type: CartActionTypes.REMOVE_DISCOUNT })}>
                    移除
                  </button>
                </div>
              )}
            </div>
            
            <div className="totals">
              <div className="subtotal">
                <span>小计:</span>
                <span>{stats.subtotal.toFixed(2)}元</span>
              </div>
              
              {stats.discountAmount > 0 && (
                <div className="discount">
                  <span>折扣:</span>
                  <span>-{stats.discountAmount.toFixed(2)}元</span>
                </div>
              )}
              
              <div className="total">
                <span>总计:</span>
                <span>{stats.total.toFixed(2)}元</span>
              </div>
            </div>
            
            <div className="actions">
              <button onClick={() => dispatch({ type: CartActionTypes.CLEAR_CART })}>
                清空购物车
              </button>
              <button className="checkout">
                去结算
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

## 第五部分:TypeScript支持

### 5.1 基本类型定义

```typescript
import { useReducer, Reducer } from 'react';

// 定义State类型
interface CounterState {
  count: number;
}

// 定义Action类型
type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'setCount'; payload: number };

// 定义Reducer
const counterReducer: Reducer<CounterState, CounterAction> = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    case 'setCount':
      return { count: action.payload };
    default:
      return state;
  }
};

// 使用
function TypedCounter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'setCount', payload: 10 })}>
        Set to 10
      </button>
    </div>
  );
}
```

### 5.2 复杂类型定义

```typescript
// 复杂State类型
interface TodoState {
  todos: Todo[];
  filter: FilterType;
  loading: boolean;
  error: string | null;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

// 复杂Action类型
type TodoAction =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'REMOVE_TODO'; payload: number }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'UPDATE_TODO'; payload: { id: number; text: string } }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Todo[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_COMPLETED' };

// Reducer实现
const todoReducer: Reducer<TodoState, TodoAction> = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false,
            createdAt: Date.now()
          }
        ]
      };
    
    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        )
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        todos: action.payload
      };
    
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
    
    default:
      return state;
  }
};

// Action Creators类型
const TodoActions = {
  addTodo: (text: string): TodoAction => ({
    type: 'ADD_TODO',
    payload: text
  }),
  
  removeTodo: (id: number): TodoAction => ({
    type: 'REMOVE_TODO',
    payload: id
  }),
  
  toggleTodo: (id: number): TodoAction => ({
    type: 'TOGGLE_TODO',
    payload: id
  }),
  
  updateTodo: (id: number, text: string): TodoAction => ({
    type: 'UPDATE_TODO',
    payload: { id, text }
  }),
  
  setFilter: (filter: FilterType): TodoAction => ({
    type: 'SET_FILTER',
    payload: filter
  }),
  
  fetchStart: (): TodoAction => ({
    type: 'FETCH_START'
  }),
  
  fetchSuccess: (todos: Todo[]): TodoAction => ({
    type: 'FETCH_SUCCESS',
    payload: todos
  }),
  
  fetchError: (error: string): TodoAction => ({
    type: 'FETCH_ERROR',
    payload: error
  }),
  
  clearCompleted: (): TodoAction => ({
    type: 'CLEAR_COMPLETED'
  })
};
```

### 5.3 泛型Reducer

```typescript
// 泛型Async State
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// 泛型Async Action
type AsyncAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'RESET' };

// 泛型Reducer
function createAsyncReducer<T>(): Reducer<AsyncState<T>, AsyncAction<T>> {
  return (state, action) => {
    switch (action.type) {
      case 'FETCH_START':
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case 'FETCH_SUCCESS':
        return {
          data: action.payload,
          loading: false,
          error: null
        };
      
      case 'FETCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      case 'RESET':
        return {
          data: null,
          loading: false,
          error: null
        };
      
      default:
        return state;
    }
  };
}

// 使用泛型Reducer
interface User {
  id: number;
  name: string;
  email: string;
}

function UserComponent() {
  const userReducer = createAsyncReducer<User>();
  
  const [state, dispatch] = useReducer(userReducer, {
    data: null,
    loading: false,
    error: null
  });
  
  const fetchUser = async (id: number) => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
  
  return (
    <div>
      {state.loading && <p>加载中...</p>}
      {state.error && <p>错误: {state.error}</p>}
      {state.data && <p>用户: {state.data.name}</p>}
      
      <button onClick={() => fetchUser(1)}>获取用户</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>重置</button>
    </div>
  );
}
```

## 第六部分:性能优化

### 6.1 避免不必要的渲染

```jsx
// 使用React.memo优化子组件
const TodoItem = React.memo(({ todo, onToggle, onRemove }) => {
  console.log('TodoItem渲染:', todo.id);
  
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onRemove(todo.id)}>删除</button>
    </li>
  );
});

// 使用useCallback稳定回调函数
function TodoList() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  
  const handleToggle = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  }, []);
  
  const handleRemove = useCallback((id) => {
    dispatch({ type: 'REMOVE_TODO', payload: id });
  }, []);
  
  return (
    <ul>
      {state.todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onRemove={handleRemove}
        />
      ))}
    </ul>
  );
}
```

### 6.2 Reducer拆分

```jsx
// 拆分大的reducer为小的reducer
function todosReducer(todos, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...todos, action.payload];
    case 'REMOVE_TODO':
      return todos.filter(t => t.id !== action.payload);
    default:
      return todos;
  }
}

function filterReducer(filter, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return action.payload;
    default:
      return filter;
  }
}

function mainReducer(state, action) {
  return {
    todos: todosReducer(state.todos, action),
    filter: filterReducer(state.filter, action)
  };
}
```

### 6.3 惰性初始化

```jsx
// 昂贵的初始化计算
function expensiveInit(initialData) {
  console.log('执行昂贵的初始化');
  
  // 复杂计算...
  const processedData = processData(initialData);
  
  return {
    data: processedData,
    timestamp: Date.now()
  };
}

// 使用惰性初始化
function Component({ initialData }) {
  const [state, dispatch] = useReducer(
    reducer,
    initialData,
    expensiveInit  // 只在挂载时执行一次
  );
  
  return <div>{state.data}</div>;
}
```

## 练习题

### 基础练习

1. 创建一个计数器,使用useReducer管理count状态
2. 实现一个Todo应用,支持添加、删除、切换完成状态
3. 创建一个表单,使用useReducer管理表单状态
4. 实现一个简单的购物车

### 进阶练习

1. 实现Action Creator和Action Types常量
2. 使用中间件模式添加日志功能
3. 创建组合的reducer管理多个状态
4. 实现异步action处理

### 高级练习

1. 使用TypeScript定义完整的reducer类型系统
2. 实现类似Redux的状态管理
3. 创建泛型reducer工厂函数
4. 实现time-travel调试功能
5. 性能优化:避免不必要的渲染

### 实战项目

1. 实现一个完整的Todo应用(过滤、统计、本地存储)
2. 创建一个表单构建器
3. 实现一个购物车系统(折扣、优惠券)
4. 开发一个数据表格组件(排序、过滤、分页)

通过本章学习,你已经全面掌握了useReducer的使用,从基础概念到高级模式,从简单计数器到复杂状态管理。useReducer是管理复杂状态的强大工具,掌握它将使你能够构建可维护、可测试的大型React应用。
