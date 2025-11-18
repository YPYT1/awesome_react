# Redux中间件(Thunk-Saga)

## 概述

Redux中间件是扩展Redux功能的强大机制，特别是处理异步操作和副作用。本文深入探讨Redux生态中最重要的两个中间件：Redux Thunk和Redux-Saga，以及其他常用中间件。

## 中间件基础

### 中间件的工作原理

Redux中间件位于action dispatch和reducer之间，可以拦截、修改或增强actions：

```
Action → Middleware → Reducer → Store
```

### 中间件签名

```jsx
// 标准中间件签名
const middleware = (store) => (next) => (action) => {
  // 中间件逻辑
  return next(action);
};

// 示例：日志中间件
const logger = (store) => (next) => (action) => {
  console.log('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};
```

### 应用中间件

```jsx
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk, logger)
);

// Redux Toolkit (推荐)
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger)
});
```

## Redux Thunk

Redux Thunk是最简单、最常用的异步中间件，允许action creators返回函数而不仅仅是对象。

### 基础用法

```jsx
import { createAsyncThunk } from '@reduxjs/toolkit';

// 传统Thunk写法
const fetchUser = (userId) => {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_START' });
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'FETCH_USER_ERROR', payload: error.message });
    }
  };
};

// Redux Toolkit Thunk (推荐)
const fetchUserRTK = createAsyncThunk(
  'user/fetchUser',
  async (userId, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        return rejectWithValue('Failed to fetch user');
      }
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 使用
store.dispatch(fetchUser(123));
store.dispatch(fetchUserRTK(123));
```

### Thunk高级用法

```jsx
// 条件性Thunk
const fetchUserIfNeeded = (userId) => {
  return (dispatch, getState) => {
    const { user } = getState();
    
    // 如果用户已经存在且数据新鲜，跳过请求
    if (user.data && user.data.id === userId && 
        Date.now() - user.lastFetch < 60000) {
      return Promise.resolve(user.data);
    }
    
    return dispatch(fetchUser(userId));
  };
};

// 串联Thunk
const initializeApp = () => {
  return async (dispatch) => {
    // 1. 检查认证
    await dispatch(checkAuth());
    
    // 2. 获取用户配置
    const { auth } = store.getState();
    if (auth.isAuthenticated) {
      await dispatch(fetchUserPreferences());
      await dispatch(fetchNotifications());
    }
    
    // 3. 初始化UI
    dispatch(setAppInitialized(true));
  };
};

// 并行Thunk
const fetchDashboardData = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    
    try {
      const [users, posts, analytics] = await Promise.all([
        dispatch(fetchUsers()),
        dispatch(fetchPosts()),
        dispatch(fetchAnalytics())
      ]);
      
      dispatch(setDashboardData({ users, posts, analytics }));
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// 带重试的Thunk
const fetchWithRetry = (url, maxRetries = 3) => {
  return async (dispatch) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        dispatch(setRetryCount(i));
        const response = await fetch(url);
        const data = await response.json();
        return dispatch(fetchSuccess(data));
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          // 指数退避
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    dispatch(fetchError(lastError.message));
  };
};
```

### createAsyncThunk详解

```jsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// 基础异步Thunk
export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (postId) => {
    const response = await fetch(`/api/posts/${postId}`);
    return response.json();
  }
);

// 带错误处理的Thunk
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error);
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 访问State的Thunk
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    
    if (!auth.user) {
      return rejectWithValue('User not authenticated');
    }

    const response = await fetch(`/api/users/${auth.user.id}/posts`);
    return response.json();
  }
);

// 带条件的Thunk
export const fetchPostsIfNeeded = createAsyncThunk(
  'posts/fetchPostsIfNeeded',
  async (_, { getState, dispatch }) => {
    const { posts } = getState();
    
    // 如果数据已经存在且新鲜，不重新获取
    if (posts.data.length > 0 && Date.now() - posts.lastFetch < 300000) {
      return posts.data;
    }
    
    return dispatch(fetchPosts()).unwrap();
  }
);

// 处理Thunk在Slice中
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    data: [],
    loading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    clearPosts: (state) => {
      state.data = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPost
      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.loading = false;
        const existingPost = state.data.find(post => post.id === action.payload.id);
        if (existingPost) {
          Object.assign(existingPost, action.payload);
        } else {
          state.data.push(action.payload);
        }
        state.lastFetch = Date.now();
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // createPost
      .addCase(createPost.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })
      
      // fetchUserPosts
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.data = action.payload;
        state.lastFetch = Date.now();
      });
  }
});
```

## Redux-Saga

Redux-Saga是基于Generator函数的更强大的副作用管理库，提供了声明式的异步控制流。

### 基础概念

```jsx
import { call, put, takeEvery, takeLatest, select, fork } from 'redux-saga/effects';

// Generator函数（Saga）
function* fetchUserSaga(action) {
  try {
    // put: dispatch action
    yield put({ type: 'FETCH_USER_START' });
    
    // call: 调用函数
    const user = yield call(fetch, `/api/users/${action.payload}`);
    const userData = yield call([user, 'json']);
    
    yield put({ type: 'FETCH_USER_SUCCESS', payload: userData });
  } catch (error) {
    yield put({ type: 'FETCH_USER_ERROR', payload: error.message });
  }
}

// Watcher Saga
function* watchFetchUser() {
  yield takeEvery('FETCH_USER_REQUEST', fetchUserSaga);
}

// Root Saga
export default function* rootSaga() {
  yield fork(watchFetchUser);
}
```

### Saga Effects

```jsx
import { 
  call, put, take, select, fork, spawn,
  takeEvery, takeLatest, race, delay,
  cancelled, cancel
} from 'redux-saga/effects';

// call - 调用函数
function* fetchDataSaga() {
  const data = yield call(fetch, '/api/data');
  const json = yield call([data, 'json']);
  return json;
}

// put - dispatch action
function* updateUserSaga(action) {
  yield put({ type: 'UPDATE_USER_START' });
  
  try {
    const result = yield call(updateUserAPI, action.payload);
    yield put({ type: 'UPDATE_USER_SUCCESS', payload: result });
  } catch (error) {
    yield put({ type: 'UPDATE_USER_ERROR', payload: error.message });
  }
}

// select - 获取state
function* getCurrentUser() {
  const user = yield select(state => state.auth.user);
  return user;
}

function* fetchUserPostsSaga() {
  const currentUser = yield select(getCurrentUser);
  if (!currentUser) {
    yield put({ type: 'USER_NOT_AUTHENTICATED' });
    return;
  }
  
  const posts = yield call(fetch, `/api/users/${currentUser.id}/posts`);
  yield put({ type: 'FETCH_POSTS_SUCCESS', payload: posts });
}

// race - 竞争效果
function* fetchWithTimeoutSaga() {
  const { response, timeout } = yield race({
    response: call(fetch, '/api/slow-endpoint'),
    timeout: delay(5000)
  });

  if (timeout) {
    yield put({ type: 'FETCH_TIMEOUT' });
  } else {
    yield put({ type: 'FETCH_SUCCESS', payload: response });
  }
}

// fork - 非阻塞调用
function* backgroundTaskSaga() {
  while (true) {
    yield delay(10000); // 每10秒执行一次
    yield fork(syncDataSaga);
  }
}

// spawn - 独立进程
function* mainSaga() {
  yield spawn(backgroundTaskSaga); // 独立运行，不会被cancel影响
  yield fork(watchUserActions);
}

// 取消处理
function* longRunningTaskSaga() {
  try {
    while (true) {
      yield delay(1000);
      yield call(doSomeWork);
    }
  } finally {
    if (yield cancelled()) {
      yield call(cleanup);
    }
  }
}
```

### 监听模式

```jsx
// takeEvery - 处理每个action
function* watchFetchData() {
  yield takeEvery('FETCH_DATA', fetchDataSaga);
}

// takeLatest - 只处理最新的action，取消之前的
function* watchSearch() {
  yield takeLatest('SEARCH_REQUEST', searchSaga);
}

// 手动监听循环
function* watchManually() {
  while (true) {
    const action = yield take('SOME_ACTION');
    yield fork(handleActionSaga, action);
  }
}

// 带条件的监听
function* watchConditionally() {
  while (true) {
    const action = yield take('CONDITIONAL_ACTION');
    const user = yield select(state => state.auth.user);
    
    if (user && user.hasPermission) {
      yield fork(processActionSaga, action);
    }
  }
}

// 复杂监听模式
function* watchComplexFlow() {
  while (true) {
    // 等待登录
    const loginAction = yield take('LOGIN_SUCCESS');
    
    // 启动用户相关的任务
    const bgTask = yield fork(userBackgroundTasks);
    
    // 等待登出或错误
    yield take(['LOGOUT', 'LOGIN_ERROR']);
    
    // 取消后台任务
    yield cancel(bgTask);
  }
}
```

### 实战案例：购物车流程

```jsx
// actions
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const CHECKOUT_REQUEST = 'CHECKOUT_REQUEST';
const SYNC_CART = 'SYNC_CART';

// Sagas
function* addToCartSaga(action) {
  try {
    const { productId, quantity } = action.payload;
    
    // 获取当前购物车
    const cart = yield select(state => state.cart);
    
    // 检查库存
    const product = yield call(checkProductAvailability, productId, quantity);
    
    if (!product.available) {
      yield put({ 
        type: 'ADD_TO_CART_ERROR', 
        payload: 'Product not available' 
      });
      return;
    }
    
    // 添加到本地购物车
    yield put({ 
      type: 'ADD_TO_CART_SUCCESS', 
      payload: { productId, quantity, product } 
    });
    
    // 同步到服务器
    yield fork(syncCartSaga);
    
    // 显示通知
    yield put({ 
      type: 'SHOW_NOTIFICATION', 
      payload: { message: 'Added to cart', type: 'success' } 
    });
    
  } catch (error) {
    yield put({ 
      type: 'ADD_TO_CART_ERROR', 
      payload: error.message 
    });
  }
}

function* syncCartSaga() {
  try {
    const cart = yield select(state => state.cart);
    const user = yield select(state => state.auth.user);
    
    if (user) {
      yield call(syncCartToServer, user.id, cart);
    } else {
      yield call(saveCartToLocalStorage, cart);
    }
  } catch (error) {
    console.error('Failed to sync cart:', error);
  }
}

function* checkoutSaga() {
  try {
    yield put({ type: 'CHECKOUT_START' });
    
    const cart = yield select(state => state.cart);
    const user = yield select(state => state.auth.user);
    
    if (!user) {
      yield put({ type: 'CHECKOUT_ERROR', payload: 'Please login first' });
      return;
    }
    
    if (cart.items.length === 0) {
      yield put({ type: 'CHECKOUT_ERROR', payload: 'Cart is empty' });
      return;
    }
    
    // 验证购物车项目
    const validationResults = yield call(validateCartItems, cart.items);
    
    if (!validationResults.valid) {
      yield put({ 
        type: 'CHECKOUT_ERROR', 
        payload: validationResults.errors 
      });
      return;
    }
    
    // 创建订单
    const order = yield call(createOrder, {
      userId: user.id,
      items: cart.items,
      total: cart.total
    });
    
    // 处理支付
    const paymentResult = yield call(processPayment, order.id, order.total);
    
    if (paymentResult.success) {
      yield put({ 
        type: 'CHECKOUT_SUCCESS', 
        payload: { order, paymentResult } 
      });
      
      // 清空购物车
      yield put({ type: 'CLEAR_CART' });
      
      // 同步到服务器
      yield fork(syncCartSaga);
      
    } else {
      yield put({ 
        type: 'CHECKOUT_ERROR', 
        payload: paymentResult.error 
      });
    }
    
  } catch (error) {
    yield put({ 
      type: 'CHECKOUT_ERROR', 
      payload: error.message 
    });
  }
}

// 自动同步购物车
function* autoSyncCartSaga() {
  while (true) {
    try {
      // 每30秒同步一次
      yield delay(30000);
      
      const lastSync = yield select(state => state.cart.lastSync);
      const now = Date.now();
      
      // 如果有修改且超过30秒未同步
      if (lastSync && now - lastSync > 30000) {
        yield fork(syncCartSaga);
      }
    } catch (error) {
      console.error('Auto sync failed:', error);
    }
  }
}

// Watchers
function* watchCart() {
  yield takeEvery(ADD_TO_CART, addToCartSaga);
  yield takeEvery(REMOVE_FROM_CART, removeFromCartSaga);
  yield takeLatest(CHECKOUT_REQUEST, checkoutSaga);
  yield fork(autoSyncCartSaga);
}

// Root saga
export default function* rootSaga() {
  yield fork(watchCart);
  yield fork(watchAuth);
  yield fork(watchNotifications);
}
```

### 高级Saga模式

```jsx
// 1. 取消模式
function* cancellableTaskSaga() {
  try {
    while (true) {
      const data = yield call(fetchData);
      yield put({ type: 'DATA_RECEIVED', payload: data });
      yield delay(5000);
    }
  } finally {
    if (yield cancelled()) {
      yield call(cleanup);
      yield put({ type: 'TASK_CANCELLED' });
    }
  }
}

function* watchCancellableTask() {
  let task;
  
  while (true) {
    const action = yield take(['START_TASK', 'STOP_TASK']);
    
    if (action.type === 'START_TASK') {
      if (task) {
        yield cancel(task);
      }
      task = yield fork(cancellableTaskSaga);
    } else {
      if (task) {
        yield cancel(task);
        task = null;
      }
    }
  }
}

// 2. 重试模式
function* retryableSaga(action, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = yield call(riskyOperation, action.payload);
      yield put({ type: 'OPERATION_SUCCESS', payload: result });
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        yield put({ type: 'OPERATION_FAILED', payload: error.message });
      } else {
        yield delay(Math.pow(2, i) * 1000); // 指数退避
      }
    }
  }
}

// 3. 节流模式
function* throttledSaga() {
  yield throttle(1000, 'THROTTLED_ACTION', handleThrottledAction);
}

function* handleThrottledAction(action) {
  // 最多每秒执行一次
  yield call(expensiveOperation, action.payload);
}

// 4. 条件执行模式
function* conditionalSaga(action) {
  const isAllowed = yield select(state => state.permissions.canExecute);
  
  if (!isAllowed) {
    yield put({ type: 'PERMISSION_DENIED' });
    return;
  }
  
  const user = yield select(state => state.auth.user);
  
  if (user.role !== 'admin') {
    yield put({ type: 'INSUFFICIENT_PRIVILEGES' });
    return;
  }
  
  yield call(adminOnlyOperation, action.payload);
}
```

## 其他中间件

### Redux-Observable (RxJS)

基于RxJS的响应式编程中间件：

```jsx
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

// Epic (类似Saga)
const fetchUserEpic = action$ =>
  action$.ofType('FETCH_USER')
    .mergeMap(action =>
      ajax.getJSON(`/api/users/${action.payload}`)
        .map(response => ({ type: 'FETCH_USER_SUCCESS', payload: response }))
        .catchError(error => of({ 
          type: 'FETCH_USER_ERROR', 
          payload: error.message 
        }))
    );

// 组合Epics
const rootEpic = combineEpics(
  fetchUserEpic,
  // 其他epics
);

// 配置中间件
const epicMiddleware = createEpicMiddleware();

const store = createStore(
  rootReducer,
  applyMiddleware(epicMiddleware)
);

epicMiddleware.run(rootEpic);
```

### Redux-Logger

开发环境日志中间件：

```jsx
import logger from 'redux-logger';

const loggerMiddleware = logger({
  // 配置选项
  predicate: (getState, action) => {
    // 过滤某些actions
    return !action.type.includes('@@redux-form');
  },
  
  collapsed: (getState, action, logEntry) => !logEntry.error,
  
  duration: true,
  timestamp: true,
  
  colors: {
    title: () => '#139BFE',
    prevState: () => '#1C5FAF',
    action: () => '#149945',
    nextState: () => '#A47104',
    error: () => '#ff0005'
  }
});

// 只在开发环境使用
const middlewares = [thunk];
if (process.env.NODE_ENV === 'development') {
  middlewares.push(loggerMiddleware);
}

const store = createStore(
  rootReducer,
  applyMiddleware(...middlewares)
);
```

### 自定义中间件

```jsx
// API调用中间件
const api = ({ dispatch, getState }) => next => action => {
  // 只处理API actions
  if (action.type !== 'API_CALL') {
    return next(action);
  }

  const {
    types,
    endpoint,
    method = 'GET',
    body,
    headers = {},
    onSuccess,
    onError
  } = action.payload;

  const [requestType, successType, errorType] = types;

  // Dispatch请求开始action
  dispatch({ type: requestType });

  // 执行API调用
  return fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })
  .then(response => response.json())
  .then(data => {
    dispatch({ type: successType, payload: data });
    if (onSuccess) onSuccess(data);
    return data;
  })
  .catch(error => {
    dispatch({ type: errorType, payload: error.message });
    if (onError) onError(error);
    throw error;
  });
};

// 使用API中间件
const fetchUser = (userId) => ({
  type: 'API_CALL',
  payload: {
    types: ['FETCH_USER_REQUEST', 'FETCH_USER_SUCCESS', 'FETCH_USER_FAILURE'],
    endpoint: `/api/users/${userId}`,
    method: 'GET'
  }
});

// 错误处理中间件
const errorHandler = ({ dispatch }) => next => action => {
  // 处理带error字段的actions
  if (action.error) {
    console.error('Error occurred:', action.payload);
    
    // 显示错误通知
    dispatch({
      type: 'SHOW_ERROR_NOTIFICATION',
      payload: {
        message: action.payload,
        id: Date.now()
      }
    });
  }

  return next(action);
};

// 分析中间件
const analytics = ({ getState }) => next => action => {
  const result = next(action);
  
  // 记录用户行为
  if (action.type.startsWith('USER_')) {
    const state = getState();
    analytics.track(action.type, {
      userId: state.auth.user?.id,
      timestamp: Date.now(),
      payload: action.payload
    });
  }
  
  return result;
};
```

## 中间件对比

### Redux Thunk vs Redux-Saga

| 特性 | Redux Thunk | Redux-Saga |
|------|-------------|------------|
| 学习曲线 | 简单 | 陡峭 |
| 异步控制 | 基于Promise | 基于Generator |
| 测试难度 | 中等 | 容易 |
| 功能丰富度 | 基础 | 强大 |
| 包大小 | 小 | 大 |
| 取消操作 | 困难 | 容易 |
| 复杂流程 | 困难 | 容易 |

### 选择建议

```jsx
// 简单应用 - 使用Thunk
// - 基础CRUD操作
// - 简单的异步流程
// - 团队对Generator不熟悉

// 复杂应用 - 使用Saga
// - 复杂的异步流程
// - 需要取消操作
// - 需要复杂的错误处理
// - 需要后台任务

// Redux Toolkit - 默认使用Thunk
const store = configureStore({
  reducer: rootReducer,
  // 默认包含thunk中间件
});

// 添加Saga支持
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
});

sagaMiddleware.run(rootSaga);
```

## 最佳实践

### 1. 中间件组织

```jsx
// middleware/index.js
import { createListenerMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';

const sagaMiddleware = createSagaMiddleware();
const listenerMiddleware = createListenerMiddleware();

export const middlewares = (getDefaultMiddleware) => {
  const middlewares = getDefaultMiddleware({
    thunk: true,
    serializableCheck: {
      ignoredActions: ['persist/PERSIST']
    }
  });

  if (process.env.NODE_ENV === 'development') {
    middlewares.concat(logger);
  }

  return middlewares.concat(sagaMiddleware, listenerMiddleware.middleware);
};

export { sagaMiddleware, listenerMiddleware };
```

### 2. 错误处理

```jsx
// Thunk错误处理
const fetchUserWithErrorHandling = createAsyncThunk(
  'user/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUser(userId);
      return response.data;
    } catch (error) {
      // 结构化错误信息
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  }
);

// Saga错误处理
function* fetchUserSaga(action) {
  try {
    const user = yield call(userAPI.getUser, action.payload);
    yield put(fetchUserSuccess(user));
  } catch (error) {
    // 统一错误处理
    yield put(fetchUserError({
      message: error.message,
      status: error.status
    }));
    
    // 错误日志
    yield call(logError, 'fetchUser', error);
    
    // 错误通知
    if (error.status !== 404) {
      yield put(showErrorNotification(error.message));
    }
  }
}
```

### 3. 性能优化

```jsx
// 防抖Thunk
import { debounce } from 'lodash-es';

const debouncedSearch = debounce((dispatch, query) => {
  dispatch(searchUsers(query));
}, 300);

const searchUsersDebounced = (query) => (dispatch) => {
  debouncedSearch(dispatch, query);
};

// Saga防抖
function* searchSaga() {
  yield debounce(300, 'SEARCH_REQUEST', performSearch);
}

function* performSearch(action) {
  const results = yield call(searchAPI, action.payload);
  yield put({ type: 'SEARCH_SUCCESS', payload: results });
}
```

### 4. 测试

```jsx
// Thunk测试
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

describe('fetchUser thunk', () => {
  it('should dispatch success action', async () => {
    const store = mockStore({});
    
    // Mock API
    jest.spyOn(userAPI, 'getUser').mockResolvedValue({ id: 1, name: 'John' });
    
    await store.dispatch(fetchUser(1));
    
    const actions = store.getActions();
    expect(actions[0]).toEqual({ type: 'user/fetchUser/pending' });
    expect(actions[1]).toEqual({ 
      type: 'user/fetchUser/fulfilled', 
      payload: { id: 1, name: 'John' } 
    });
  });
});

// Saga测试
import { runSaga } from 'redux-saga';

describe('fetchUserSaga', () => {
  it('should fetch user successfully', async () => {
    const dispatched = [];
    
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
        getState: () => ({})
      },
      fetchUserSaga,
      { payload: 1 }
    ).toPromise();
    
    expect(dispatched).toEqual([
      { type: 'FETCH_USER_SUCCESS', payload: mockUser }
    ]);
  });
});
```

## 总结

Redux中间件是处理异步操作的关键：

1. **Redux Thunk**：简单、易学，适合基础异步操作
2. **Redux-Saga**：强大、灵活，适合复杂异步流程
3. **选择原则**：根据应用复杂度和团队技术栈选择
4. **最佳实践**：统一错误处理、性能优化、完善测试
5. **Redux Toolkit**：推荐使用createAsyncThunk

正确使用中间件是构建健壮Redux应用的关键。
