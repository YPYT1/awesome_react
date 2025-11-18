# Zustand入门

## 概述

Zustand是一个小巧、快速、可扩展的状态管理库，采用简化的Flux原则。它提供了基于Hooks的API，没有样板代码，使用起来非常简单直观。

## 为什么选择Zustand

### Zustand的优势

1. **简单直观**：API简洁，学习曲线平缓
2. **体积小巧**：压缩后仅约1KB
3. **无样板代码**：不需要Provider包裹
4. **TypeScript友好**：原生支持TypeScript
5. **性能优秀**：基于选择器的精确订阅
6. **中间件支持**：内置多种中间件
7. **React外使用**：可在React组件外部使用

### 与其他方案对比

```jsx
// Redux - 样板代码多
const INCREMENT = 'INCREMENT';
const increment = () => ({ type: INCREMENT });
const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
};

// Context - 需要Provider包裹
const CountContext = createContext();
function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

// Zustand - 简洁直观
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));
```

## 安装和基础设置

### 安装

```bash
# npm
npm install zustand

# yarn
yarn add zustand

# pnpm
pnpm add zustand
```

### 创建第一个Store

```jsx
import { create } from 'zustand';

// 创建store
const useCounterStore = create((set) => ({
  // 状态
  count: 0,
  
  // 操作
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));

// 在组件中使用
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

## 核心概念

### 1. State（状态）

```jsx
const useStore = create((set) => ({
  // 基本类型
  count: 0,
  name: 'John',
  isActive: true,
  
  // 对象
  user: {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com'
  },
  
  // 数组
  items: [],
  todos: [
    { id: 1, text: 'Learn Zustand', completed: false }
  ],
  
  // 复杂嵌套
  config: {
    theme: 'light',
    settings: {
      notifications: true,
      language: 'zh-CN'
    }
  }
}));
```

### 2. Actions（操作）

```jsx
const useStore = create((set, get) => ({
  count: 0,
  users: [],

  // 基础操作
  increment: () => set((state) => ({ count: state.count + 1 })),

  // 直接设置
  reset: () => set({ count: 0 }),

  // 使用get获取当前状态
  incrementIfEven: () => {
    const count = get().count;
    if (count % 2 === 0) {
      set({ count: count + 1 });
    }
  },

  // 异步操作
  fetchUsers: async () => {
    const response = await fetch('/api/users');
    const users = await response.json();
    set({ users });
  },

  // 批量更新
  updateMultiple: () => set({
    count: 0,
    name: 'Updated',
    isActive: false
  })
}));
```

### 3. Selectors（选择器）

```jsx
const useStore = create((set) => ({
  user: { name: 'Alice', age: 30 },
  posts: [],
  settings: { theme: 'light' }
}));

function Component() {
  // 选择单个属性
  const userName = useStore((state) => state.user.name);
  
  // 选择多个属性
  const { user, settings } = useStore((state) => ({
    user: state.user,
    settings: state.settings
  }));
  
  // 使用计算属性
  const userAge = useStore((state) => state.user.age);
  const isAdult = userAge >= 18;
  
  // 选择器函数
  const postCount = useStore((state) => state.posts.length);
}
```

### 4. 订阅机制

```jsx
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// 在组件中订阅
function Counter() {
  // 只在count变化时重渲染
  const count = useStore((state) => state.count);
  
  // 不会引起重渲染（只获取函数）
  const increment = useStore((state) => state.increment);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// 在React外部订阅
const unsubscribe = useStore.subscribe(
  (state) => console.log('State changed:', state)
);

// 取消订阅
unsubscribe();
```

## 基础用法示例

### 示例1：计数器应用

```jsx
import { create } from 'zustand';

const useCounterStore = create((set, get) => ({
  count: 0,
  
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementBy: (value) => set((state) => ({ count: state.count + value })),
  reset: () => set({ count: 0 }),
  
  // 使用get
  double: () => {
    const currentCount = get().count;
    set({ count: currentCount * 2 });
  }
}));

function Counter() {
  const { count, increment, decrement, incrementBy, reset, double } = useCounterStore();

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={() => incrementBy(5)}>+5</button>
      <button onClick={double}>×2</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### 示例2：Todo应用

```jsx
import { create } from 'zustand';

const useTodoStore = create((set) => ({
  todos: [],
  filter: 'all',

  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false }
      ]
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id)
    })),

  setFilter: (filter) => set({ filter }),

  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed)
    }))
}));

// 计算属性选择器
const selectFilteredTodos = (state) => {
  const { todos, filter } = state;
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
};

function TodoApp() {
  const filteredTodos = useTodoStore(selectFilteredTodos);
  const { addTodo, toggleTodo, deleteTodo, setFilter, clearCompleted } = useTodoStore();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input);
      setInput('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add todo..."
        />
        <button type="submit">Add</button>
      </form>

      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button onClick={clearCompleted}>Clear Completed</button>
    </div>
  );
}
```

### 示例3：用户认证

```jsx
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, token } = await response.json();
      set({ user, token, loading: false });
      
      // 保存token
      localStorage.setItem('token', token);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true });
    try {
      const response = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const user = await response.json();
        set({ user, token, loading: false });
      } else {
        set({ user: null, token: null, loading: false });
        localStorage.removeItem('token');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));

// 使用
function LoginForm() {
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 高级特性

### 1. 不可变更新模式

```jsx
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// 使用immer中间件
const useStore = create(
  immer((set) => ({
    nested: {
      level1: {
        level2: {
          value: 0
        }
      }
    },

    // 直接修改，immer处理不可变性
    updateNested: (newValue) =>
      set((state) => {
        state.nested.level1.level2.value = newValue;
      }),

    // 数组操作
    items: [],
    addItem: (item) =>
      set((state) => {
        state.items.push(item);
      }),
    removeItem: (index) =>
      set((state) => {
        state.items.splice(index, 1);
      })
  }))
);
```

### 2. 派生状态

```jsx
const useStore = create((set, get) => ({
  items: [],
  filter: '',

  // Actions
  setItems: (items) => set({ items }),
  setFilter: (filter) => set({ filter }),

  // Getters（派生状态）
  get filteredItems() {
    return get().items.filter((item) =>
      item.name.toLowerCase().includes(get().filter.toLowerCase())
    );
  },

  get itemCount() {
    return get().items.length;
  },

  get filteredCount() {
    return this.filteredItems.length;
  }
}));

// 使用
function ItemList() {
  // 使用选择器获取派生状态
  const filteredItems = useStore((state) =>
    state.items.filter((item) =>
      item.name.toLowerCase().includes(state.filter.toLowerCase())
    )
  );

  return (
    <ul>
      {filteredItems.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 3. 临时更新（Transient Updates）

```jsx
const useStore = create((set) => ({
  x: 0,
  y: 0,

  // 不触发订阅的更新
  setCoordinates: (x, y) => {
    useStore.setState({ x, y }, true); // replace参数为true
  }
}));

// 在React外部使用
useStore.getState().setCoordinates(100, 200);
```

### 4. 订阅部分状态

```jsx
const useStore = create((set) => ({
  count: 0,
  user: { name: 'Alice' },
  settings: { theme: 'light' }
}));

function Component() {
  // 只订阅count
  const count = useStore((state) => state.count);

  // 使用浅比较订阅多个值
  const { user, settings } = useStore(
    (state) => ({ user: state.user, settings: state.settings }),
    shallow
  );

  return <div>{count}</div>;
}
```

## React外部使用

### 在vanilla JS中使用

```jsx
import { create } from 'zustand/vanilla';

// 创建vanilla store
const store = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// 获取状态
const state = store.getState();
console.log(state.count); // 0

// 更新状态
store.getState().increment();
console.log(store.getState().count); // 1

// 订阅变化
const unsubscribe = store.subscribe((state) => {
  console.log('State changed:', state);
});

// 取消订阅
unsubscribe();
```

### 在React中使用vanilla store

```jsx
import { create } from 'zustand/vanilla';
import { useStore } from 'zustand';

// 创建vanilla store
const vanillaStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// 在React组件中使用
function Counter() {
  const count = useStore(vanillaStore, (state) => state.count);
  const increment = useStore(vanillaStore, (state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## TypeScript支持

### 基础类型定义

```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));
```

### 复杂类型定义

```typescript
import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const { user, token } = await response.json();
      set({ user, token, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  logout: () => set({ user: null, token: null }),

  checkAuth: async () => {
    // 实现...
  }
}));
```

### 使用State Creator类型

```typescript
import { create, StateCreator } from 'zustand';

type CounterSlice = {
  count: number;
  increment: () => void;
};

type UserSlice = {
  user: User | null;
  setUser: (user: User) => void;
};

const createCounterSlice: StateCreator<CounterSlice> = (set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
});

const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user })
});

// 组合slices
const useStore = create<CounterSlice & UserSlice>()((...a) => ({
  ...createCounterSlice(...a),
  ...createUserSlice(...a)
}));
```

## 性能优化

### 1. 使用选择器

```jsx
// 不好：选择整个store
const Component = () => {
  const store = useStore();
  return <div>{store.count}</div>;
};

// 好：只选择需要的部分
const Component = () => {
  const count = useStore((state) => state.count);
  return <div>{count}</div>;
};
```

### 2. 使用浅比较

```jsx
import { shallow } from 'zustand/shallow';

const Component = () => {
  // 使用浅比较避免不必要的重渲染
  const { count, user } = useStore(
    (state) => ({ count: state.count, user: state.user }),
    shallow
  );

  return <div>{count} - {user.name}</div>;
};
```

### 3. 分离数据和操作

```jsx
const Component = () => {
  // 数据会触发重渲染
  const count = useStore((state) => state.count);
  
  // 操作不会触发重渲染（引用稳定）
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};
```

## 调试技巧

### 使用Redux DevTools

```jsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 }))
    }),
    { name: 'CounterStore' }
  )
);
```

### 日志中间件

```jsx
const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get());
      set(...args);
      console.log('New state:', get());
    },
    get,
    api
  );

const useStore = create(
  log((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 }))
  }))
);
```

## 最佳实践

### 1. Store组织

```jsx
// 按功能域划分store
const useAuthStore = create((set) => ({...}));
const useUserStore = create((set) => ({...}));
const useProductStore = create((set) => ({...}));

// 或使用slices模式
const useStore = create((set) => ({
  // Auth slice
  user: null,
  login: () => {...},
  logout: () => {...},

  // Products slice
  products: [],
  fetchProducts: () => {...},
  
  // Cart slice
  cart: [],
  addToCart: () => {...}
}));
```

### 2. 异步操作

```jsx
const useStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

### 3. 命名约定

```jsx
// Store名称：use + 领域 + Store
const useUserStore = create((set) => ({...}));
const useProductStore = create((set) => ({...}));

// Action名称：动词开头
const useStore = create((set) => ({
  // 好
  fetchUsers: () => {...},
  updateUser: () => {...},
  deleteUser: () => {...},
  
  // 不好
  users: () => {...},
  user: () => {...}
}));
```

## 总结

Zustand是一个简单、灵活、高性能的状态管理库。关键要点：

1. **简单API**：create创建store，使用Hook订阅
2. **无样板代码**：不需要Provider和action types
3. **灵活选择器**：精确订阅需要的状态
4. **TypeScript支持**：完善的类型定义
5. **中间件支持**：devtools、persist、immer等
6. **React外使用**：vanilla版本支持非React环境

Zustand非常适合中小型应用的状态管理，也可以通过slices模式扩展到大型应用。

