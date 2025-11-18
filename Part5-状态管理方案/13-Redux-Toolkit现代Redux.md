# Redux Toolkit现代Redux

## 概述

Redux Toolkit (RTK) 是Redux官方推荐的工具集，简化了Redux的使用，减少了样板代码，内置了最佳实践。RTK已成为编写Redux逻辑的标准方式。

## 为什么使用Redux Toolkit

### 传统Redux vs Redux Toolkit

```jsx
// ❌ 传统Redux - 大量样板代码
// actionTypes.js
export const INCREMENT = 'counter/increment';
export const DECREMENT = 'counter/decrement';

// actions.js
export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });

// reducer.js
const initialState = { value: 0 };

export function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 };
    case DECREMENT:
      return { ...state, value: state.value - 1 };
    default:
      return state;
  }
}

// store.js
import { createStore } from 'redux';
import { counterReducer } from './reducer';

const store = createStore(counterReducer);

// ✅ Redux Toolkit - 简洁明了
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // 使用Immer，可以直接修改
    },
    decrement: (state) => {
      state.value -= 1;
    }
  }
});

export const { increment, decrement } = counterSlice.actions;

const store = configureStore({
  reducer: counterSlice.reducer
});
```

## 安装和配置

### 安装

```bash
# npm
npm install @reduxjs/toolkit react-redux

# yarn
yarn add @reduxjs/toolkit react-redux

# pnpm
pnpm add @reduxjs/toolkit react-redux
```

### 基础配置

```jsx
// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  }
});

// App.jsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}
```

## createSlice

createSlice是RTK的核心API，自动生成action creators和reducer：

### 基础用法

```jsx
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0,
    history: []
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
      state.history.push(state.value);
    },
    decrement: (state) => {
      state.value -= 1;
      state.history.push(state.value);
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
      state.history.push(state.value);
    },
    reset: (state) => {
      state.value = 0;
      state.history = [];
    }
  }
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;
export default counterSlice.reducer;
```

### 使用Immer

Redux Toolkit使用Immer，可以直接"修改"state：

```jsx
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      // 可以直接push
      state.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.find(todo => todo.id === action.payload);
      if (todo) {
        // 可以直接修改
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      // 也可以返回新数组
      return state.filter(todo => todo.id !== action.payload);
    }
  }
});
```

### Prepare Callback

自定义action payload：

```jsx
const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    addPost: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: (title, content) => {
        return {
          payload: {
            id: Date.now(),
            title,
            content,
            createdAt: new Date().toISOString(),
            reactions: { likes: 0, shares: 0 }
          }
        };
      }
    },
    reactionAdded: {
      reducer: (state, action) => {
        const { postId, reaction } = action.payload;
        const post = state.find(post => post.id === postId);
        if (post) {
          post.reactions[reaction]++;
        }
      },
      prepare: (postId, reaction) => {
        return {
          payload: { postId, reaction }
        };
      }
    }
  }
});

// 使用
dispatch(addPost('Title', 'Content')); // 自动添加id、timestamp等
dispatch(reactionAdded(postId, 'likes'));
```

## configureStore

configureStore简化store配置，自动添加中间件和DevTools：

### 基础配置

```jsx
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});

// 自动包含：
// - Redux Thunk中间件
// - Redux DevTools Extension
// - 开发环境的序列化检查
// - 开发环境的不可变性检查
```

### 高级配置

```jsx
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    posts: postsReducer
  },
  
  // 添加自定义中间件
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 配置默认中间件
      thunk: {
        extraArgument: { api: myApi }
      },
      serializableCheck: {
        // 忽略特定action types
        ignoredActions: ['posts/addPost'],
        // 忽略特定路径
        ignoredPaths: ['user.lastLogin']
      }
    }).concat(logger),
  
  // DevTools配置
  devTools: process.env.NODE_ENV !== 'production',
  
  // Preloaded state
  preloadedState: {
    counter: { value: 10 }
  },
  
  // Enhancers
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(customEnhancer)
});
```

## createAsyncThunk

处理异步逻辑：

### 基础用法

```jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 创建async thunk
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

// Slice中处理
const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

// 使用
function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

### 错误处理

```jsx
export const createPost = createAsyncThunk(
  'posts/create',
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
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 在slice中处理
extraReducers: (builder) => {
  builder
    .addCase(createPost.rejected, (state, action) => {
      if (action.payload) {
        // 自定义错误
        state.error = action.payload;
      } else {
        // 网络错误等
        state.error = action.error.message;
      }
    });
}
```

### 访问State和其他信息

```jsx
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      // 访问当前state
      const { user } = getState();
      
      if (!user.data) {
        return rejectWithValue('No user logged in');
      }

      const response = await fetch(`/api/users/${user.data.id}/posts`);
      const posts = await response.json();

      // 可以dispatch其他actions
      dispatch(updateLastFetch(Date.now()));

      return posts;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
```

## createEntityAdapter

管理规范化数据：

### 基础用法

```jsx
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// 创建adapter
const usersAdapter = createEntityAdapter({
  // 指定ID字段
  selectId: (user) => user.userId,
  
  // 排序规则
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

// 获取初始state
const initialState = usersAdapter.getInitialState({
  loading: false,
  error: null
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    userAdded: usersAdapter.addOne,
    usersReceived: usersAdapter.setAll,
    userUpdated: usersAdapter.updateOne,
    userRemoved: usersAdapter.removeOne
  }
});

// Adapter生成的selectors
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
} = usersAdapter.getSelectors((state) => state.users);

// 使用
function UserList() {
  const users = useSelector(selectAllUsers);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.userId}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### CRUD操作

```jsx
const postsAdapter = createEntityAdapter();

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    // 添加单个
    postAdded: postsAdapter.addOne,
    
    // 添加多个
    postsAdded: postsAdapter.addMany,
    
    // 更新单个
    postUpdated: postsAdapter.updateOne,
    
    // 更新多个
    postsUpdated: postsAdapter.updateMany,
    
    // 删除单个
    postRemoved: postsAdapter.removeOne,
    
    // 删除多个
    postsRemoved: postsAdapter.removeMany,
    
    // 设置所有
    postsReceived: postsAdapter.setAll,
    
    // 清空
    postsCleared: postsAdapter.removeAll
  }
});

// 使用
dispatch(postAdded({ id: 1, title: 'Post 1' }));
dispatch(postUpdated({ id: 1, changes: { title: 'Updated' } }));
dispatch(postRemoved(1));
```

## TypeScript支持

### 定义类型

```typescript
import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
  history: number[];
}

const initialState: CounterState = {
  value: 0,
  history: []
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
      state.history.push(state.value);
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.history.push(state.value);
    }
  }
});

// Store类型
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Typed Hooks

```typescript
// hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 使用
function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
    </div>
  );
}
```

### AsyncThunk类型

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';

interface User {
  id: number;
  name: string;
  email: string;
}

export const fetchUser = createAsyncThunk<
  User, // 返回类型
  number, // 参数类型
  {
    state: RootState;
    rejectValue: string;
  }
>(
  'user/fetchUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        return rejectWithValue('Failed to fetch user');
      }
      return response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
```

## 实战案例

### 案例1：Todo应用

```jsx
import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

// Entity Adapter
const todosAdapter = createEntityAdapter();

// Async Thunks
export const fetchTodos = createAsyncThunk('todos/fetch', async () => {
  const response = await fetch('/api/todos');
  return response.json();
});

export const addTodo = createAsyncThunk('todos/add', async (text) => {
  const response = await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text, completed: false })
  });
  return response.json();
});

// Slice
const todosSlice = createSlice({
  name: 'todos',
  initialState: todosAdapter.getInitialState({
    loading: false,
    error: null,
    filter: 'all'
  }),
  reducers: {
    todoToggled: (state, action) => {
      const todo = state.entities[action.payload];
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    filterChanged: (state, action) => {
      state.filter = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        todosAdapter.setAll(state, action.payload);
      })
      .addCase(addTodo.fulfilled, todosAdapter.addOne);
  }
});

export const { todoToggled, filterChanged } = todosSlice.actions;

// Selectors
export const {
  selectAll: selectAllTodos,
  selectById: selectTodoById
} = todosAdapter.getSelectors((state) => state.todos);

export const selectFilteredTodos = (state) => {
  const todos = selectAllTodos(state);
  const filter = state.todos.filter;
  
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};

export default todosSlice.reducer;
```

### 案例2：购物车

```jsx
import { createSlice, createSelector } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: []
  },
  reducers: {
    itemAdded: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    itemRemoved: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    quantityUpdated: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    cartCleared: (state) => {
      state.items = [];
    }
  }
});

export const { itemAdded, itemRemoved, quantityUpdated, cartCleared } = cartSlice.actions;

// Memoized Selectors
export const selectCartItems = (state) => state.cart.items;

export const selectCartTotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.price * item.quantity, 0)
);

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((count, item) => count + item.quantity, 0)
);

export default cartSlice.reducer;
```

## 最佳实践

### 1. Slice组织

```jsx
// features/users/usersSlice.js
export const usersSlice = createSlice({...});
export const { userAdded, userUpdated } = usersSlice.actions;
export default usersSlice.reducer;

// features/users/selectors.js
export const selectAllUsers = (state) => state.users.entities;
export const selectUserById = (state, userId) => state.users.entities[userId];
```

### 2. 异步逻辑

```jsx
// 使用createAsyncThunk处理异步
export const fetchData = createAsyncThunk('data/fetch', async () => {
  // ...
});

// 而不是在组件中处理
// ❌ 不好
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => dispatch(dataReceived(data)));
}, []);
```

### 3. 选择器复用

```jsx
import { createSelector } from '@reduxjs/toolkit';

// 基础选择器
const selectTodos = state => state.todos;
const selectFilter = state => state.filter;

// 组合选择器
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    // 只在todos或filter变化时重新计算
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }
);
```

## 总结

Redux Toolkit极大简化了Redux开发：

1. **createSlice**：自动生成actions和reducer
2. **configureStore**：简化store配置
3. **createAsyncThunk**：标准化异步逻辑
4. **createEntityAdapter**：管理规范化数据
5. **Immer集成**：可以直接"修改"state
6. **TypeScript支持**：完整的类型定义
7. **DevTools内置**：开箱即用

RTK已成为Redux开发的标准方式，强烈推荐使用。

