# Redux原理与中间件 - 状态管理深度解析

## 1. Redux核心概念

### 1.1 三大原则

```typescript
const reduxPrinciples = {
  单一数据源: {
    原则: '整个应用的state存储在单一store中',
    好处: ['易于调试', '易于持久化', '易于同构'],
    示例: `
      const store = {
        user: { id: 1, name: 'John' },
        todos: [{ id: 1, text: 'Learn Redux' }],
        ui: { theme: 'dark' }
      };
    `
  },
  
  State只读: {
    原则: 'State只能通过dispatch action来修改',
    好处: ['可预测', '易于追踪', '时间旅行调试'],
    示例: `
      // ❌ 错误
      store.state.user.name = 'Jane';
      
      // ✓ 正确
      store.dispatch({ type: 'UPDATE_USER', payload: { name: 'Jane' } });
    `
  },
  
  纯函数修改: {
    原则: '使用纯函数reducer来描述state变化',
    好处: ['可测试', '可预测', '易于理解'],
    示例: `
      function userReducer(state = initialState, action) {
        switch (action.type) {
          case 'UPDATE_USER':
            return { ...state, ...action.payload };
          default:
            return state;
        }
      }
    `
  }
};
```

### 1.2 核心API

```typescript
const coreAPIs = {
  createStore: {
    作用: '创建Redux store',
    签名: 'createStore(reducer, preloadedState, enhancer)',
    示例: `
      import { createStore } from 'redux';
      
      const store = createStore(rootReducer, initialState);
    `
  },
  
  combineReducers: {
    作用: '合并多个reducer',
    示例: `
      import { combineReducers } from 'redux';
      
      const rootReducer = combineReducers({
        user: userReducer,
        todos: todosReducer,
        ui: uiReducer
      });
    `
  },
  
  applyMiddleware: {
    作用: '应用中间件',
    示例: `
      import { applyMiddleware } from 'redux';
      import thunk from 'redux-thunk';
      
      const store = createStore(
        rootReducer,
        applyMiddleware(thunk, logger)
      );
    `
  },
  
  bindActionCreators: {
    作用: '绑定action creators到dispatch',
    示例: `
      const boundActions = bindActionCreators(
        { increment, decrement },
        store.dispatch
      );
    `
  }
};
```

## 2. Redux实现原理

### 2.1 createStore实现

```typescript
/**
 * 简化版createStore
 */
function createStore(reducer, preloadedState, enhancer) {
  // 处理enhancer
  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(reducer, preloadedState);
  }
  
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;
  
  // 确保可以修改listeners
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  
  // 获取当前state
  function getState() {
    if (isDispatching) {
      throw new Error('不能在reducer执行时调用getState');
    }
    return currentState;
  }
  
  // 订阅state变化
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('listener必须是函数');
    }
    
    if (isDispatching) {
      throw new Error('不能在reducer执行时订阅');
    }
    
    let isSubscribed = true;
    
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    
    // 返回取消订阅函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      
      if (isDispatching) {
        throw new Error('不能在reducer执行时取消订阅');
      }
      
      isSubscribed = false;
      
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  
  // 派发action
  function dispatch(action) {
    if (typeof action.type === 'undefined') {
      throw new Error('action必须有type属性');
    }
    
    if (isDispatching) {
      throw new Error('Reducer不能dispatch action');
    }
    
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    
    // 通知所有监听器
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
    
    return action;
  }
  
  // 替换reducer (用于代码分割)
  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: '@@redux/REPLACE' });
    return store;
  }
  
  // 初始化state
  dispatch({ type: '@@redux/INIT' });
  
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  };
}
```

### 2.2 combineReducers实现

```typescript
/**
 * 简化版combineReducers
 */
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  
  // 过滤有效的reducer
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  
  const finalReducerKeys = Object.keys(finalReducers);
  
  // 返回组合后的reducer
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
    
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    
    return hasChanged ? nextState : state;
  };
}

// 使用示例
const rootReducer = combineReducers({
  user: (state = null, action) => {
    if (action.type === 'SET_USER') return action.payload;
    return state;
  },
  
  todos: (state = [], action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return [...state, action.payload];
      case 'REMOVE_TODO':
        return state.filter(t => t.id !== action.payload);
      default:
        return state;
    }
  }
});

// 等价于
function rootReducer(state = {}, action) {
  return {
    user: userReducer(state.user, action),
    todos: todosReducer(state.todos, action)
  };
}
```

## 3. 中间件原理

### 3.1 中间件概念

```typescript
const middlewareConcept = {
  定义: '在dispatch和reducer之间的扩展点',
  
  作用: [
    '处理异步操作',
    '日志记录',
    '错误报告',
    '路由跳转',
    '调用API'
  ],
  
  签名: `
    const middleware = store => next => action => {
      // 中间件逻辑
      return next(action);
    };
  `,
  
  执行流程: `
    dispatch(action)
      -> middleware1
      -> middleware2
      -> middleware3
      -> reducer
      -> 更新state
      -> 通知订阅者
  `
};
```

### 3.2 applyMiddleware实现

```typescript
/**
 * 简化版applyMiddleware
 */
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    // 创建store
    const store = createStore(reducer, preloadedState);
    
    let dispatch = () => {
      throw new Error('Dispatching while constructing middleware');
    };
    
    // 传递给中间件的API
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    };
    
    // 应用所有中间件
    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    
    // 组合中间件
    dispatch = compose(...chain)(store.dispatch);
    
    return {
      ...store,
      dispatch
    };
  };
}

/**
 * compose函数
 */
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }
  
  if (funcs.length === 1) {
    return funcs[0];
  }
  
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// 示例
const middleware1 = store => next => action => {
  console.log('middleware1 before');
  const result = next(action);
  console.log('middleware1 after');
  return result;
};

const middleware2 = store => next => action => {
  console.log('middleware2 before');
  const result = next(action);
  console.log('middleware2 after');
  return result;
};

const store = createStore(
  reducer,
  applyMiddleware(middleware1, middleware2)
);

store.dispatch({ type: 'TEST' });

// 输出:
// middleware1 before
// middleware2 before
// reducer执行
// middleware2 after
// middleware1 after
```

### 3.3 常用中间件

```typescript
// Logger中间件
const logger = store => next => action => {
  console.group(action.type);
  console.log('dispatching', action);
  console.log('prev state', store.getState());
  
  const result = next(action);
  
  console.log('next state', store.getState());
  console.groupEnd();
  
  return result;
};

// Thunk中间件
const thunk = store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  
  return next(action);
};

// 使用thunk
const fetchUser = (id) => {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_START' });
    
    try {
      const user = await api.fetchUser(id);
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'FETCH_USER_ERROR', error });
    }
  };
};

// Promise中间件
const promiseMiddleware = store => next => action => {
  if (action.payload && typeof action.payload.then === 'function') {
    action.payload
      .then(result => {
        store.dispatch({ ...action, payload: result });
      })
      .catch(error => {
        store.dispatch({ ...action, payload: error, error: true });
      });
    
    return;
  }
  
  return next(action);
};
```

## 4. React-Redux集成

### 4.1 Provider实现

```typescript
/**
 * 简化版Provider
 */
const ReactReduxContext = React.createContext(null);

function Provider({ store, children }) {
  const contextValue = useMemo(() => ({ store }), [store]);
  
  return (
    <ReactReduxContext.Provider value={contextValue}>
      {children}
    </ReactReduxContext.Provider>
  );
}

// 使用
<Provider store={store}>
  <App />
</Provider>
```

### 4.2 useSelector实现

```typescript
/**
 * 简化版useSelector
 */
function useSelector(selector, equalityFn = Object.is) {
  const { store } = useContext(ReactReduxContext);
  const [, forceRender] = useReducer(s => s + 1, 0);
  
  const selectedState = useRef(null);
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);
  
  // 更新refs
  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;
  
  // 计算选中的state
  const newSelectedState = selectorRef.current(store.getState());
  
  useEffect(() => {
    selectedState.current = newSelectedState;
  });
  
  useEffect(() => {
    function checkForUpdates() {
      const newSelectedState = selectorRef.current(store.getState());
      
      if (equalityFnRef.current(selectedState.current, newSelectedState)) {
        return;
      }
      
      selectedState.current = newSelectedState;
      forceRender();
    }
    
    const unsubscribe = store.subscribe(checkForUpdates);
    
    checkForUpdates();
    
    return unsubscribe;
  }, [store]);
  
  return newSelectedState;
}

// 使用
function Component() {
  const user = useSelector(state => state.user);
  const todos = useSelector(state => state.todos);
  
  return <div>{user.name}</div>;
}
```

### 4.3 useDispatch实现

```typescript
/**
 * 简化版useDispatch
 */
function useDispatch() {
  const { store } = useContext(ReactReduxContext);
  return store.dispatch;
}

// 使用
function Component() {
  const dispatch = useDispatch();
  
  const handleClick = () => {
    dispatch({ type: 'INCREMENT' });
  };
  
  return <button onClick={handleClick}>Increment</button>;
}
```

## 5. 面试高频问题

```typescript
const interviewQA = {
  Q1: {
    question: 'Redux的工作流程?',
    answer: [
      '1. 组件dispatch action',
      '2. action通过middleware',
      '3. reducer处理action',
      '4. 生成新state',
      '5. 通知订阅者',
      '6. 组件re-render'
    ]
  },
  
  Q2: {
    question: 'Redux中间件原理?',
    answer: `
      中间件洋葱模型:
      - 柯里化函数
      - store => next => action
      - compose组合多个中间件
      - 形成调用链
    `
  },
  
  Q3: {
    question: 'Redux vs Context?',
    answer: [
      'Redux: 可预测、时间旅行、中间件',
      'Context: 简单、内置、无额外依赖',
      'Redux适合: 复杂状态、大型应用',
      'Context适合: 简单状态、主题配置'
    ]
  }
};
```

## 6. 总结

Redux原理的核心要点:

1. **三大原则**: 单一数据源、只读、纯函数
2. **核心API**: createStore、combineReducers
3. **中间件**: 洋葱模型、异步处理
4. **React集成**: Provider、useSelector、useDispatch
5. **优化**: 精确订阅、memo、reselect

掌握Redux是理解状态管理的基础。

## 7. Redux源码深入分析

### 7.1 createStore完整实现

```javascript
// Redux createStore 完整实现
function createStore(reducer, preloadedState, enhancer) {
  // 处理参数重载
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }
  
  // 如果有enhancer（中间件），先应用
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected enhancer to be a function');
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  
  // 内部状态
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;
  
  // 确保可以修改listeners而不影响当前迭代
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  
  // 获取当前状态
  function getState() {
    if (isDispatching) {
      throw new Error('不能在reducer执行时调用getState');
    }
    return currentState;
  }
  
  // 订阅状态变化
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function');
    }
    
    if (isDispatching) {
      throw new Error('不能在reducer执行时调用subscribe');
    }
    
    let isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    
    // 返回取消订阅函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      
      if (isDispatching) {
        throw new Error('不能在reducer执行时调用unsubscribe');
      }
      
      isSubscribed = false;
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  
  // 派发action
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Action必须是plain object');
    }
    
    if (typeof action.type === 'undefined') {
      throw new Error('Action必须有type属性');
    }
    
    if (isDispatching) {
      throw new Error('Reducer不能dispatch action');
    }
    
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    
    // 通知所有订阅者
    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
    
    return action;
  }
  
  // 替换reducer（热重载使用）
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected nextReducer to be a function');
    }
    
    currentReducer = nextReducer;
    dispatch({ type: '@@redux/REPLACE' });
  }
  
  // 初始化状态
  dispatch({ type: '@@redux/INIT' });
  
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  };
}

// 工具函数
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}
```

### 7.2 combineReducers原理

```javascript
// combineReducers 完整实现
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
  
  // 返回组合后的reducer
  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      
      if (typeof nextStateForKey === 'undefined') {
        throw new Error(`Reducer "${key}" 返回了 undefined`);
      }
      
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

// 使用示例
const rootReducer = combineReducers({
  user: userReducer,
  todos: todosReducer,
  posts: postsReducer
});

// 等价于
function rootReducer(state = {}, action) {
  return {
    user: userReducer(state.user, action),
    todos: todosReducer(state.todos, action),
    posts: postsReducer(state.posts, action)
  };
}
```

### 7.3 applyMiddleware源码

```javascript
// applyMiddleware 完整实现
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = store.dispatch;
    let chain = [];
    
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    };
    
    // 给每个中间件注入 dispatch 和 getState
    chain = middlewares.map(middleware => middleware(middlewareAPI));
    
    // 组合中间件链
    dispatch = compose(...chain)(store.dispatch);
    
    return {
      ...store,
      dispatch
    };
  };
}

// compose 函数实现
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  
  if (funcs.length === 1) {
    return funcs[0];
  }
  
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// 中间件执行流程示例
const middleware1 = store => next => action => {
  console.log('middleware1: before');
  const result = next(action);
  console.log('middleware1: after');
  return result;
};

const middleware2 = store => next => action => {
  console.log('middleware2: before');
  const result = next(action);
  console.log('middleware2: after');
  return result;
};

const middleware3 = store => next => action => {
  console.log('middleware3: before');
  const result = next(action);
  console.log('middleware3: after');
  return result;
};

// 执行顺序：
// middleware1: before
// middleware2: before
// middleware3: before
// [reducer执行]
// middleware3: after
// middleware2: after
// middleware1: after
```

## 8. 高级中间件实现

### 8.1 异步中间件thunk源码

```javascript
// redux-thunk 完整实现
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    // 如果action是函数，执行它
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }
    
    // 否则传递给下一个中间件
    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;

// 使用示例
function fetchUser(userId) {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_REQUEST' });
    
    try {
      const response = await api.fetchUser(userId);
      dispatch({
        type: 'FETCH_USER_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_USER_FAILURE',
        payload: error.message
      });
    }
  };
}
```

### 8.2 Promise中间件实现

```javascript
// redux-promise 实现
const promiseMiddleware = ({ dispatch }) => next => action => {
  // 如果action.payload是Promise
  if (action.payload && typeof action.payload.then === 'function') {
    return action.payload
      .then(result => dispatch({ ...action, payload: result }))
      .catch(error => dispatch({ ...action, payload: error, error: true }));
  }
  
  return next(action);
};

// 使用示例
dispatch({
  type: 'FETCH_USER',
  payload: api.fetchUser(userId) // Promise
});
```

### 8.3 Logger中间件实现

```javascript
// redux-logger 简化实现
const logger = store => next => action => {
  console.group(action.type);
  console.log('prev state', store.getState());
  console.log('action', action);
  
  const result = next(action);
  
  console.log('next state', store.getState());
  console.groupEnd();
  
  return result;
};

// 增强版logger
const createLogger = (options = {}) => {
  const {
    collapsed = true,
    duration = true,
    timestamp = true,
    colors = {
      title: () => 'inherit',
      prevState: () => '#9E9E9E',
      action: () => '#03A9F4',
      nextState: () => '#4CAF50',
      error: () => '#F20404'
    }
  } = options;
  
  return store => next => action => {
    const startTime = Date.now();
    const prevState = store.getState();
    
    const formattedTime = timestamp
      ? new Date().toLocaleTimeString()
      : '';
    
    const title = `action ${action.type} ${formattedTime}`;
    const groupMethod = collapsed ? console.groupCollapsed : console.group;
    
    try {
      groupMethod(`%c ${title}`, `color: ${colors.title()}`);
    } catch (e) {
      console.log(title);
    }
    
    console.log('%c prev state', `color: ${colors.prevState()}`, prevState);
    console.log('%c action', `color: ${colors.action()}`, action);
    
    const result = next(action);
    
    const nextState = store.getState();
    const endTime = Date.now();
    
    console.log('%c next state', `color: ${colors.nextState()}`, nextState);
    
    if (duration) {
      console.log(`%c duration`, 'color: #9E9E9E', `${endTime - startTime}ms`);
    }
    
    try {
      console.groupEnd();
    } catch (e) {
      console.log('— log end —');
    }
    
    return result;
  };
};
```

### 8.4 错误处理中间件

```javascript
// 错误捕获中间件
const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error('捕获一个异常!', err);
    
    // 发送错误报告到服务器
    Raven.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    });
    
    throw err;
  }
};

// 异步错误处理中间件
const errorHandlerMiddleware = store => next => action => {
  const result = next(action);
  
  // 处理Promise rejection
  if (result && typeof result.catch === 'function') {
    return result.catch(error => {
      console.error('异步操作失败:', error);
      
      // 分发错误action
      store.dispatch({
        type: 'GLOBAL_ERROR',
        payload: error,
        error: true
      });
      
      return Promise.reject(error);
    });
  }
  
  return result;
};
```

## 9. Redux Toolkit深入

### 9.1 createSlice源码分析

```javascript
// createSlice 简化实现
function createSlice(options) {
  const {
    name,
    initialState,
    reducers = {},
    extraReducers
  } = options;
  
  const actionCreators = {};
  const sliceReducers = {};
  
  // 生成action creators和reducers
  Object.keys(reducers).forEach(reducerName => {
    const type = `${name}/${reducerName}`;
    
    // Action creator
    actionCreators[reducerName] = (payload) => ({
      type,
      payload
    });
    
    // Reducer
    sliceReducers[type] = reducers[reducerName];
  });
  
  // 主reducer
  function reducer(state = initialState, action) {
    // 处理slice自己的actions
    if (sliceReducers[action.type]) {
      return sliceReducers[action.type](state, action);
    }
    
    // 处理extraReducers
    if (extraReducers && extraReducers[action.type]) {
      return extraReducers[action.type](state, action);
    }
    
    return state;
  }
  
  return {
    name,
    reducer,
    actions: actionCreators
  };
}

// 使用示例
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

### 9.2 createAsyncThunk实现

```javascript
// createAsyncThunk 简化实现
function createAsyncThunk(typePrefix, payloadCreator, options = {}) {
  const pending = `${typePrefix}/pending`;
  const fulfilled = `${typePrefix}/fulfilled`;
  const rejected = `${typePrefix}/rejected`;
  
  // Action creators
  const actionCreators = {
    pending: (requestId, arg) => ({
      type: pending,
      meta: { requestId, arg }
    }),
    fulfilled: (payload, requestId, arg) => ({
      type: fulfilled,
      payload,
      meta: { requestId, arg }
    }),
    rejected: (error, requestId, arg) => ({
      type: rejected,
      payload: error,
      error: true,
      meta: { requestId, arg }
    })
  };
  
  // Thunk action creator
  function thunk(arg) {
    return async (dispatch, getState, extra) => {
      const requestId = nanoid();
      
      dispatch(actionCreators.pending(requestId, arg));
      
      try {
        const result = await payloadCreator(arg, {
          dispatch,
          getState,
          extra,
          requestId
        });
        
        dispatch(actionCreators.fulfilled(result, requestId, arg));
        return result;
      } catch (error) {
        dispatch(actionCreators.rejected(error, requestId, arg));
        throw error;
      }
    };
  }
  
  // 添加类型属性
  thunk.pending = pending;
  thunk.fulfilled = fulfilled;
  thunk.rejected = rejected;
  
  return thunk;
}

// 使用示例
const fetchUser = createAsyncThunk(
  'users/fetch',
  async (userId, { getState }) => {
    const response = await api.fetchUser(userId);
    return response.data;
  }
);

// 在slice中处理
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    entities: {},
    loading: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities[action.payload.id] = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
      });
  }
});
```

## 10. 性能优化深入

### 10.1 selector性能优化

```javascript
// reselect 实现原理
function createSelector(...funcs) {
  const resultFunc = funcs.pop();
  const dependencies = funcs;
  
  let lastArgs = null;
  let lastResult = null;
  
  return function selector(state, props) {
    const args = dependencies.map(dep => dep(state, props));
    
    // 浅比较参数是否变化
    if (lastArgs === null || !shallowEqual(args, lastArgs)) {
      lastResult = resultFunc(...args);
      lastArgs = args;
    }
    
    return lastResult;
  };
}

function shallowEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// 高级selector模式
import { createSelector, createStructuredSelector } from 'reselect';

// 基础selectors
const selectUser = state => state.user;
const selectPosts = state => state.posts;
const selectFilter = (state, props) => props.filter;

// 派生selectors
const selectUserPosts = createSelector(
  [selectPosts, selectUser],
  (posts, user) => posts.filter(post => post.authorId === user.id)
);

const selectFilteredPosts = createSelector(
  [selectUserPosts, selectFilter],
  (posts, filter) => {
    switch (filter) {
      case 'published':
        return posts.filter(p => p.published);
      case 'draft':
        return posts.filter(p => !p.published);
      default:
        return posts;
    }
  }
);

// 结构化selector
const mapState = createStructuredSelector({
  user: selectUser,
  posts: selectFilteredPosts,
  postsCount: state => selectFilteredPosts(state).length
});
```

### 10.2 Redux批量更新

```javascript
// 批量dispatch
import { batch } from 'react-redux';

function updateMultipleStates() {
  batch(() => {
    dispatch(action1());
    dispatch(action2());
    dispatch(action3());
  });
  // 只触发一次重渲染
}

// 批量更新中间件
const batchMiddleware = store => {
  let batchedActions = [];
  let isBatching = false;
  
  return next => action => {
    if (action.type === 'BATCH_START') {
      isBatching = true;
      return;
    }
    
    if (action.type === 'BATCH_END') {
      isBatching = false;
      batch(() => {
        batchedActions.forEach(a => next(a));
      });
      batchedActions = [];
      return;
    }
    
    if (isBatching) {
      batchedActions.push(action);
      return;
    }
    
    return next(action);
  };
};
```

## 11. Redux面试重点

### 11.1 高频面试题

```typescript
const interviewQuestions = [
  {
    q: 'Redux三大原则是什么？',
    a: `
      1. 单一数据源：整个应用的state存储在一个store中
      2. State是只读的：只能通过dispatch action来修改
      3. 使用纯函数执行修改：reducer必须是纯函数
    `
  },
  
  {
    q: 'Redux中间件原理是什么？',
    a: `
      洋葱模型：
      1. 中间件接收store的dispatch和getState
      2. 返回一个函数接收next
      3. 再返回一个函数接收action
      4. 可以在调用next前后执行逻辑
      5. compose函数组合所有中间件
    `
  },
  
  {
    q: 'Redux如何处理异步？',
    a: `
      通过中间件：
      1. redux-thunk：action可以是函数
      2. redux-saga：使用Generator管理副作用
      3. redux-observable：使用RxJS
      4. RTK Query：内置数据获取
    `
  },
  
  {
    q: 'useSelector性能如何优化？',
    a: `
      1. 使用reselect创建memoized selector
      2. 使用shallowEqual比较函数
      3. 拆分selector，避免返回新对象
      4. 使用createStructuredSelector
      5. 考虑使用normalizedState
    `
  },
  
  {
    q: 'Redux vs Context，何时用Redux？',
    a: `
      使用Redux场景：
      1. 需要强大的调试工具
      2. 需要时间旅行调试
      3. 需要中间件处理副作用
      4. 需要持久化状态
      5. 大型应用，复杂状态逻辑
    `
  }
];
```

### 11.2 手写题精选

```javascript
// 1. 手写mini Redux
class MiniRedux {
  constructor(reducer, initialState) {
    this.reducer = reducer;
    this.state = initialState;
    this.listeners = [];
  }
  
  getState() {
    return this.state;
  }
  
  dispatch(action) {
    this.state = this.reducer(this.state, action);
    this.listeners.forEach(listener => listener());
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// 2. 手写combineReducers
function myCombineReducers(reducers) {
  return (state = {}, action) => {
    return Object.keys(reducers).reduce((nextState, key) => {
      nextState[key] = reducers[key](state[key], action);
      return nextState;
    }, {});
  };
}

// 3. 手写applyMiddleware
function myApplyMiddleware(...middlewares) {
  return (createStore) => (reducer) => {
    const store = createStore(reducer);
    const chain = middlewares.map(middleware => 
      middleware(store)
    );
    const dispatch = compose(...chain)(store.dispatch);
    return { ...store, dispatch };
  };
}
```

