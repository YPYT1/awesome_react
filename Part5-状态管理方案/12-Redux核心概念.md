# Redux核心概念

## 概述

Redux是一个可预测的JavaScript状态容器，遵循单向数据流和函数式编程原则。虽然Redux Toolkit已成为推荐方式，但理解Redux核心概念对于掌握状态管理至关重要。

## Redux三大原则

### 1. 单一数据源

整个应用的state存储在单一的store中：

```jsx
// 整个应用只有一个store
const store = createStore(rootReducer);

// 状态树示例
const state = {
  user: {
    profile: { name: 'Alice', email: 'alice@example.com' },
    isAuthenticated: true
  },
  todos: [
    { id: 1, text: 'Learn Redux', completed: false }
  ],
  ui: {
    theme: 'dark',
    sidebarOpen: true
  }
};
```

### 2. State是只读的

唯一改变state的方法是触发action：

```jsx
// 不能直接修改state
// state.user.name = 'Bob'; // ❌ 错误

// 必须dispatch action
store.dispatch({
  type: 'user/updateName',
  payload: 'Bob'
}); // ✅ 正确
```

### 3. 使用纯函数执行修改

Reducer必须是纯函数，相同输入总是产生相同输出：

```jsx
// ✅ 纯函数reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1; // 返回新值
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}

// ❌ 非纯函数（有副作用）
function badReducer(state = 0, action) {
  if (action.type === 'INCREMENT') {
    state++; // 直接修改state
    console.log(state); // 副作用
    return state;
  }
  return state;
}
```

## 核心概念

### 1. Store

Store是保存应用state的容器：

```jsx
import { createStore } from 'redux';

// 创建store
const store = createStore(reducer);

// Store API
store.getState();      // 获取当前state
store.dispatch(action); // 派发action
store.subscribe(listener); // 订阅state变化
```

### 2. Action

Action是描述发生了什么的普通对象：

```jsx
// 基础action
const incrementAction = {
  type: 'INCREMENT'
};

// 带payload的action
const addTodoAction = {
  type: 'ADD_TODO',
  payload: {
    id: 1,
    text: 'Learn Redux',
    completed: false
  }
};

// Action Creator
function addTodo(text) {
  return {
    type: 'ADD_TODO',
    payload: {
      id: Date.now(),
      text,
      completed: false
    }
  };
}

// 使用
store.dispatch(addTodo('Learn React'));
```

### 3. Reducer

Reducer是纯函数，接收state和action，返回新state：

```jsx
// 基础reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'INCREMENT_BY':
      return state + action.payload;
    default:
      return state;
  }
}

// 复杂reducer
const initialState = {
  count: 0,
  history: []
};

function counterWithHistoryReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1,
        history: [...state.history, state.count + 1]
      };
    case 'DECREMENT':
      return {
        count: state.count - 1,
        history: [...state.history, state.count - 1]
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

## 数据流

Redux的数据流是单向的：

```
View → Action → Reducer → Store → View
```

### 完整数据流示例

```jsx
// 1. 定义action types
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';

// 2. 定义action creators
function increment() {
  return { type: INCREMENT };
}

function decrement() {
  return { type: DECREMENT };
}

// 3. 定义reducer
function counterReducer(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + 1;
    case DECREMENT:
      return state - 1;
    default:
      return state;
  }
}

// 4. 创建store
const store = createStore(counterReducer);

// 5. 订阅变化
store.subscribe(() => {
  console.log('State changed:', store.getState());
});

// 6. 派发actions
store.dispatch(increment()); // State changed: 1
store.dispatch(increment()); // State changed: 2
store.dispatch(decrement()); // State changed: 1
```

## Reducer组合

### 1. combineReducers

将多个reducer组合成一个：

```jsx
import { combineReducers } from 'redux';

// 用户reducer
function userReducer(state = null, action) {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'LOGOUT':
      return null;
    default:
      return state;
  }
}

// Todos reducer
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}

// UI reducer
function uiReducer(state = { theme: 'light' }, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

// 组合reducers
const rootReducer = combineReducers({
  user: userReducer,
  todos: todosReducer,
  ui: uiReducer
});

// 生成的state结构
const state = {
  user: null,
  todos: [],
  ui: { theme: 'light' }
};
```

### 2. 嵌套Reducer

```jsx
// products reducer
function productsReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return [...state, action.payload];
    default:
      return state;
  }
}

// cart reducer
function cartReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TO_CART':
      return [...state, action.payload];
    default:
      return state;
  }
}

// 组合shop reducer
const shopReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer
});

// 组合根reducer
const rootReducer = combineReducers({
  user: userReducer,
  shop: shopReducer,
  ui: uiReducer
});

// 最终state结构
const state = {
  user: null,
  shop: {
    products: [],
    cart: []
  },
  ui: { theme: 'light' }
};
```

## React集成

### 1. 基础集成

```jsx
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

// Store
const store = createStore(counterReducer);

// App组件
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

// Counter组件
function Counter() {
  const count = useSelector(state => state);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

### 2. 选择器使用

```jsx
import { useSelector } from 'react-redux';

function UserProfile() {
  // 选择特定字段
  const userName = useSelector(state => state.user.name);
  const userEmail = useSelector(state => state.user.email);

  // 选择派生数据
  const completedTodos = useSelector(state =>
    state.todos.filter(todo => todo.completed)
  );

  // 使用相等性检查
  const user = useSelector(
    state => state.user,
    (left, right) => left.id === right.id // 自定义比较
  );

  return (
    <div>
      <h1>{userName}</h1>
      <p>{userEmail}</p>
    </div>
  );
}
```

## 中间件

### 1. 中间件概念

中间件扩展了dispatch功能，可以处理副作用：

```jsx
// 日志中间件
const logger = store => next => action => {
  console.log('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};

// 应用中间件
import { createStore, applyMiddleware } from 'redux';

const store = createStore(
  reducer,
  applyMiddleware(logger)
);
```

### 2. Redux Thunk

处理异步操作：

```jsx
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const store = createStore(
  reducer,
  applyMiddleware(thunk)
);

// Thunk action creator
function fetchUser(userId) {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_START' });

    try {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      
      dispatch({
        type: 'FETCH_USER_SUCCESS',
        payload: user
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_USER_ERROR',
        payload: error.message
      });
    }
  };
}

// 使用
store.dispatch(fetchUser(1));
```

## 最佳实践

### 1. Action Types常量

```jsx
// constants/actionTypes.js
export const ADD_TODO = 'ADD_TODO';
export const TOGGLE_TODO = 'TOGGLE_TODO';
export const DELETE_TODO = 'DELETE_TODO';

// actions/todos.js
import { ADD_TODO, TOGGLE_TODO, DELETE_TODO } from '../constants/actionTypes';

export function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: { id: Date.now(), text, completed: false }
  };
}

export function toggleTodo(id) {
  return {
    type: TOGGLE_TODO,
    payload: id
  };
}
```

### 2. Reducer组织

```jsx
// reducers/todos.js
import { ADD_TODO, TOGGLE_TODO, DELETE_TODO } from '../constants/actionTypes';

const initialState = [];

export function todosReducer(state = initialState, action) {
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

// reducers/index.js
import { combineReducers } from 'redux';
import { todosReducer } from './todos';
import { userReducer } from './user';

export const rootReducer = combineReducers({
  todos: todosReducer,
  user: userReducer
});
```

### 3. 选择器模式

```jsx
// selectors/todos.js
export const selectAllTodos = state => state.todos;

export const selectCompletedTodos = state =>
  state.todos.filter(todo => todo.completed);

export const selectActiveTodos = state =>
  state.todos.filter(todo => !todo.completed);

export const selectTodoById = (state, id) =>
  state.todos.find(todo => todo.id === id);

// 组件中使用
function TodoList() {
  const completedTodos = useSelector(selectCompletedTodos);
  
  return (
    <ul>
      {completedTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

## 不可变更新模式

### 1. 对象更新

```jsx
// ❌ 错误：直接修改
function badReducer(state, action) {
  state.name = action.payload;
  return state;
}

// ✅ 正确：返回新对象
function goodReducer(state, action) {
  return {
    ...state,
    name: action.payload
  };
}

// 深层更新
function updateNestedReducer(state, action) {
  return {
    ...state,
    user: {
      ...state.user,
      profile: {
        ...state.user.profile,
        name: action.payload
      }
    }
  };
}
```

### 2. 数组更新

```jsx
function arrayReducer(state = [], action) {
  switch (action.type) {
    // 添加
    case 'ADD_ITEM':
      return [...state, action.payload];
    
    // 删除
    case 'REMOVE_ITEM':
      return state.filter(item => item.id !== action.payload);
    
    // 更新
    case 'UPDATE_ITEM':
      return state.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );
    
    // 插入
    case 'INSERT_ITEM':
      return [
        ...state.slice(0, action.payload.index),
        action.payload.item,
        ...state.slice(action.payload.index)
      ];
    
    default:
      return state;
  }
}
```

## DevTools集成

```jsx
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(thunk, logger)
  )
);

// 或使用增强器
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
```

## 常见问题

### 1. State规范化

```jsx
// ❌ 嵌套数据
const badState = {
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 1, name: 'Alice' },
      comments: [
        { id: 1, text: 'Comment 1', author: { id: 2, name: 'Bob' } }
      ]
    }
  ]
};

// ✅ 规范化数据
const goodState = {
  posts: {
    byId: {
      1: { id: 1, title: 'Post 1', authorId: 1, commentIds: [1] }
    },
    allIds: [1]
  },
  users: {
    byId: {
      1: { id: 1, name: 'Alice' },
      2: { id: 2, name: 'Bob' }
    },
    allIds: [1, 2]
  },
  comments: {
    byId: {
      1: { id: 1, text: 'Comment 1', authorId: 2 }
    },
    allIds: [1]
  }
};
```

### 2. Reducer拆分

```jsx
// 按功能拆分
const userReducer = (state = {}, action) => {
  // 处理用户相关actions
};

const todosReducer = (state = [], action) => {
  // 处理todos相关actions
};

// 按状态类型拆分
const loadingReducer = (state = {}, action) => {
  // 处理所有loading状态
};

const errorsReducer = (state = {}, action) => {
  // 处理所有errors
};
```

## 总结

Redux核心概念是理解现代状态管理的基础：

1. **三大原则**：单一数据源、只读state、纯函数reducer
2. **核心概念**：Store、Action、Reducer
3. **数据流**：单向数据流保证可预测性
4. **组合模式**：combineReducers组合多个reducer
5. **中间件**：扩展dispatch处理副作用
6. **不可变更新**：始终返回新对象/数组
7. **最佳实践**：常量、选择器、规范化

虽然Redux Toolkit简化了很多操作，但理解这些核心概念对于掌握状态管理至关重要。

## 第四部分：高级Redux模式

### 4.1 Redux源码剖析

```javascript
// createStore的简化实现
function createStore(reducer, preloadedState, enhancer) {
  // 如果有enhancer（如applyMiddleware），应用它
  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentState = preloadedState;
  let currentReducer = reducer;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  function getState() {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing.');
    }
    return currentState;
  }

  function subscribe(listener) {
    if (isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing.');
    }

    let isSubscribed = true;

    // 确保可以在dispatch过程中取消订阅
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) return;

      isSubscribed = false;

      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Actions must be plain objects.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property.');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: '@@redux/REPLACE' });
  }

  // 初始化store
  dispatch({ type: '@@redux/INIT' });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  };
}

// combineReducers的简化实现
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  // 过滤掉非函数的reducer
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

// applyMiddleware的简化实现
function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    const store = createStore(...args);
    let dispatch = () => {
      throw new Error('Dispatching while constructing middleware is not allowed.');
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}

// compose函数
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
```

### 4.2 高级中间件模式

```javascript
// 1. 错误处理中间件
const errorHandler = store => next => action => {
  try {
    return next(action);
  } catch (error) {
    console.error('Caught an exception!', error);
    
    // 发送错误到监控服务
    trackError(error, {
      action,
      state: store.getState()
    });

    // 派发错误action
    store.dispatch({
      type: 'APP_ERROR',
      payload: error.message
    });

    throw error;
  }
};

// 2. 异步队列中间件
const asyncQueue = store => {
  const queue = [];
  let isProcessing = false;

  async function processQueue() {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;

    while (queue.length > 0) {
      const { action, resolve, reject } = queue.shift();
      
      try {
        const result = await action(store.dispatch, store.getState);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    isProcessing = false;
  }

  return next => action => {
    if (typeof action === 'function') {
      return new Promise((resolve, reject) => {
        queue.push({ action, resolve, reject });
        processQueue();
      });
    }

    return next(action);
  };
};

// 3. 防抖中间件
const debounceMiddleware = store => {
  const debounceMap = new Map();

  return next => action => {
    const { meta } = action;

    if (!meta || !meta.debounce) {
      return next(action);
    }

    const key = meta.debounce.key || action.type;
    const delay = meta.debounce.delay || 300;

    // 清除之前的定时器
    if (debounceMap.has(key)) {
      clearTimeout(debounceMap.get(key));
    }

    // 设置新的定时器
    const timeoutId = setTimeout(() => {
      next(action);
      debounceMap.delete(key);
    }, delay);

    debounceMap.set(key, timeoutId);
  };
};

// 4. 节流中间件
const throttleMiddleware = store => {
  const throttleMap = new Map();

  return next => action => {
    const { meta } = action;

    if (!meta || !meta.throttle) {
      return next(action);
    }

    const key = meta.throttle.key || action.type;
    const delay = meta.throttle.delay || 300;

    if (throttleMap.has(key)) {
      return; // 忽略
    }

    throttleMap.set(key, true);

    setTimeout(() => {
      throttleMap.delete(key);
    }, delay);

    return next(action);
  };
};

// 5. 条件派发中间件
const conditionalDispatch = store => next => action => {
  const { meta } = action;

  if (meta && meta.condition) {
    const shouldDispatch = meta.condition(store.getState(), action);
    
    if (!shouldDispatch) {
      return; // 不派发action
    }
  }

  return next(action);
};

// 6. 批量派发中间件
const batchMiddleware = store => {
  let batch = [];
  let isBatching = false;

  return next => action => {
    if (action.type === 'BATCH_START') {
      isBatching = true;
      batch = [];
      return;
    }

    if (action.type === 'BATCH_END') {
      isBatching = false;
      
      // 批量派发所有action
      batch.forEach(a => next(a));
      batch = [];
      
      return;
    }

    if (isBatching) {
      batch.push(action);
      return;
    }

    return next(action);
  };
};

// 使用示例
const store = createStore(
  rootReducer,
  applyMiddleware(
    errorHandler,
    asyncQueue,
    debounceMiddleware,
    throttleMiddleware,
    conditionalDispatch,
    batchMiddleware
  )
);

// 使用防抖
store.dispatch({
  type: 'SEARCH',
  payload: 'query',
  meta: {
    debounce: { delay: 500 }
  }
});

// 使用节流
store.dispatch({
  type: 'SCROLL',
  payload: { y: 100 },
  meta: {
    throttle: { delay: 100 }
  }
});

// 条件派发
store.dispatch({
  type: 'UPDATE_USER',
  payload: { name: 'Alice' },
  meta: {
    condition: (state, action) => state.user.id !== null
  }
});

// 批量派发
store.dispatch({ type: 'BATCH_START' });
store.dispatch({ type: 'ACTION_1' });
store.dispatch({ type: 'ACTION_2' });
store.dispatch({ type: 'ACTION_3' });
store.dispatch({ type: 'BATCH_END' });
```

### 4.3 高级Reducer模式

```javascript
// 1. Reducer工厂函数
function createListReducer(name) {
  const initialState = {
    items: [],
    loading: false,
    error: null
  };

  return (state = initialState, action) => {
    switch (action.type) {
      case `${name}/FETCH_START`:
        return {
          ...state,
          loading: true,
          error: null
        };

      case `${name}/FETCH_SUCCESS`:
        return {
          ...state,
          loading: false,
          items: action.payload
        };

      case `${name}/FETCH_ERROR`:
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      case `${name}/ADD`:
        return {
          ...state,
          items: [...state.items, action.payload]
        };

      case `${name}/REMOVE`:
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload)
        };

      default:
        return state;
    }
  };
}

// 使用
const usersReducer = createListReducer('users');
const productsReducer = createListReducer('products');

// 2. 高阶Reducer
function withUndo(reducer) {
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: []
  };

  return (state = initialState, action) => {
    const { past, present, future } = state;

    switch (action.type) {
      case 'UNDO':
        if (past.length === 0) return state;

        return {
          past: past.slice(0, -1),
          present: past[past.length - 1],
          future: [present, ...future]
        };

      case 'REDO':
        if (future.length === 0) return state;

        return {
          past: [...past, present],
          present: future[0],
          future: future.slice(1)
        };

      default:
        const newPresent = reducer(present, action);

        if (present === newPresent) {
          return state;
        }

        return {
          past: [...past, present],
          present: newPresent,
          future: []
        };
    }
  };
}

// 使用
const todosReducer = (state = [], action) => {
  // ... todo reducer logic
};

const undoableTodosReducer = withUndo(todosReducer);

// 3. 动态Reducer注入
class DynamicReducerManager {
  constructor(initialReducers) {
    this.reducers = { ...initialReducers };
    this.combinedReducer = combineReducers(this.reducers);
  }

  getReducerMap() {
    return { ...this.reducers };
  }

  reduce(state, action) {
    return this.combinedReducer(state, action);
  }

  add(key, reducer) {
    if (!key || this.reducers[key]) {
      return;
    }

    this.reducers[key] = reducer;
    this.combinedReducer = combineReducers(this.reducers);
  }

  remove(key) {
    if (!key || !this.reducers[key]) {
      return;
    }

    delete this.reducers[key];
    this.combinedReducer = combineReducers(this.reducers);
  }
}

// 使用
const reducerManager = new DynamicReducerManager({
  app: appReducer,
  user: userReducer
});

const store = createStore(
  (state, action) => reducerManager.reduce(state, action)
);

// 动态添加reducer
reducerManager.add('newFeature', newFeatureReducer);
store.dispatch({ type: '@@redux/REPLACE' });

// 4. 智能合并Reducer
function createSmartReducer(handlers) {
  return (state = {}, action) => {
    // 检查是否有对应的handler
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }

    // 检查通配符handler
    for (const pattern in handlers) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        if (regex.test(action.type)) {
          return handlers[pattern](state, action);
        }
      }
    }

    return state;
  };
}

// 使用
const userReducer = createSmartReducer({
  'user/SET_*': (state, action) => ({
    ...state,
    [action.meta.field]: action.payload
  }),

  'user/FETCH_*_SUCCESS': (state, action) => ({
    ...state,
    data: action.payload,
    loading: false
  }),

  'user/FETCH_*_ERROR': (state, action) => ({
    ...state,
    error: action.payload,
    loading: false
  })
});
```

### 4.4 性能优化技巧

```javascript
// 1. Selector记忆化
import { createSelector } from 'reselect';

// 基础选择器
const selectTodos = state => state.todos;
const selectFilter = state => state.filter;

// 记忆化派生数据
const selectVisibleTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    console.log('Computing visible todos'); // 只在输入变化时执行

    switch (filter) {
      case 'SHOW_ALL':
        return todos;
      case 'SHOW_COMPLETED':
        return todos.filter(todo => todo.completed);
      case 'SHOW_ACTIVE':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }
);

// 参数化选择器
const makeSelectTodoById = () => createSelector(
  [selectTodos, (state, id) => id],
  (todos, id) => todos.find(todo => todo.id === id)
);

// 使用
function TodoItem({ id }) {
  const selectTodoById = useMemo(makeSelectTodoById, []);
  const todo = useSelector(state => selectTodoById(state, id));

  return <div>{todo.text}</div>;
}

// 2. 批量更新优化
import { batch } from 'react-redux';

function performBatchUpdate() {
  batch(() => {
    store.dispatch({ type: 'ACTION_1' });
    store.dispatch({ type: 'ACTION_2' });
    store.dispatch({ type: 'ACTION_3' });
    // 只会触发一次组件更新
  });
}

// 3. 浅比较优化
import { shallowEqual } from 'react-redux';

function MyComponent() {
  const user = useSelector(
    state => ({
      name: state.user.name,
      email: state.user.email
    }),
    shallowEqual // 使用浅比较
  );

  return <div>{user.name}</div>;
}

// 4. State规范化
import { normalize, schema } from 'normalizr';

// 定义schema
const userSchema = new schema.Entity('users');
const commentSchema = new schema.Entity('comments', {
  author: userSchema
});
const postSchema = new schema.Entity('posts', {
  author: userSchema,
  comments: [commentSchema]
});

// 规范化数据
const originalData = {
  id: 1,
  title: 'Post',
  author: { id: 1, name: 'Alice' },
  comments: [
    { id: 1, text: 'Comment', author: { id: 2, name: 'Bob' } }
  ]
};

const normalizedData = normalize(originalData, postSchema);

// 规范化的reducer
function entitiesReducer(state = { users: {}, posts: {}, comments: {} }, action) {
  switch (action.type) {
    case 'FETCH_POST_SUCCESS':
      return {
        users: { ...state.users, ...action.payload.entities.users },
        posts: { ...state.posts, ...action.payload.entities.posts },
        comments: { ...state.comments, ...action.payload.entities.comments }
      };

    default:
      return state;
  }
}

// 5. 使用Immer简化不可变更新
import produce from 'immer';

const todosReducer = produce((draft, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      draft.push(action.payload); // 可以直接修改
      break;

    case 'TOGGLE_TODO':
      const todo = draft.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
      break;

    case 'REMOVE_TODO':
      const index = draft.findIndex(t => t.id === action.payload);
      if (index !== -1) {
        draft.splice(index, 1);
      }
      break;
  }
}, []);
```

### 4.5 调试与监控

```javascript
// 1. Action追踪
const actionTracker = store => {
  const actionHistory = [];
  const MAX_HISTORY = 100;

  return next => action => {
    const timestamp = Date.now();
    const prevState = store.getState();

    const result = next(action);

    const nextState = store.getState();

    actionHistory.push({
      action,
      timestamp,
      prevState,
      nextState,
      diff: getStateDiff(prevState, nextState)
    });

    if (actionHistory.length > MAX_HISTORY) {
      actionHistory.shift();
    }

    // 暴露全局访问
    window.__ACTION_HISTORY__ = actionHistory;

    return result;
  };
};

function getStateDiff(prev, next) {
  const diff = {};

  Object.keys(next).forEach(key => {
    if (prev[key] !== next[key]) {
      diff[key] = {
        prev: prev[key],
        next: next[key]
      };
    }
  });

  return diff;
}

// 2. 性能监控
const performanceMonitor = store => next => action => {
  const start = performance.now();

  const result = next(action);

  const duration = performance.now() - start;

  if (duration > 16) { // 超过一帧的时间
    console.warn(`Slow action: ${action.type} took ${duration.toFixed(2)}ms`);
  }

  // 发送到分析服务
  if (window.analytics) {
    window.analytics.track('redux_action', {
      type: action.type,
      duration
    });
  }

  return result;
};

// 3. State快照
class StateSnapshotManager {
  constructor() {
    this.snapshots = [];
  }

  take(store, label) {
    this.snapshots.push({
      label,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(store.getState()))
    });
  }

  restore(store, index) {
    if (index >= 0 && index < this.snapshots.length) {
      const snapshot = this.snapshots[index];
      
      store.dispatch({
        type: '@@RESTORE_SNAPSHOT',
        payload: snapshot.state
      });
    }
  }

  list() {
    return this.snapshots.map((s, i) => ({
      index: i,
      label: s.label,
      timestamp: new Date(s.timestamp).toISOString()
    }));
  }

  clear() {
    this.snapshots = [];
  }
}

// 使用
const snapshotManager = new StateSnapshotManager();

// 在关键点拍摄快照
snapshotManager.take(store, 'After login');
snapshotManager.take(store, 'After data load');

// 恢复到之前的状态
snapshotManager.restore(store, 0);

// 4. Redux DevTools增强
const devToolsEnhancer = window.__REDUX_DEVTOOLS_EXTENSION__ 
  ? window.__REDUX_DEVTOOLS_EXTENSION__({
      trace: true,
      traceLimit: 25,
      features: {
        pause: true,
        lock: true,
        persist: true,
        export: true,
        import: 'custom',
        jump: true,
        skip: true,
        reorder: true,
        dispatch: true,
        test: true
      }
    })
  : f => f;

const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(thunk, logger),
    devToolsEnhancer
  )
);
```

## 总结升级

Redux核心概念深入理解：

### 核心架构
```
Store（状态容器）
  ├── State（应用状态）
  ├── Dispatch（派发机制）
  └── Subscribe（订阅系统）

Data Flow（数据流）
  View → Action → Middleware → Reducer → Store → View

Middleware Chain（中间件链）
  Action → MW1 → MW2 → MW3 → Reducer
```

### 高级模式总结
```
1. 源码级理解
   ✅ createStore实现
   ✅ combineReducers逻辑
   ✅ applyMiddleware机制
   ✅ compose函数原理

2. 中间件模式
   ✅ 错误处理
   ✅ 异步队列
   ✅ 防抖节流
   ✅ 条件派发
   ✅ 批量更新

3. Reducer模式
   ✅ 工厂函数
   ✅ 高阶Reducer
   ✅ 动态注入
   ✅ 智能合并

4. 性能优化
   ✅ Selector记忆化
   ✅ 批量更新
   ✅ 浅比较
   ✅ State规范化
   ✅ Immer集成

5. 调试监控
   ✅ Action追踪
   ✅ 性能监控
   ✅ State快照
   ✅ DevTools增强
```

Redux的核心在于可预测性和可维护性，深入理解这些概念将为掌握现代状态管理奠定坚实基础。

