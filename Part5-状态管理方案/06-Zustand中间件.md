# Zustand中间件

## 概述

Zustand的中间件系统提供了强大的扩展能力，可以添加日志、持久化、开发工具等功能。本文深入探讨Zustand的中间件机制及常用中间件的使用方法。

## 中间件基础

### 中间件的工作原理

中间件是一个高阶函数，它接收store配置并返回增强后的store：

```jsx
const middleware = (config) => (set, get, api) => {
  // 在这里可以修改set、get或api
  return config(set, get, api);
};
```

### 基础中间件结构

```jsx
import { create } from 'zustand';

// 简单的日志中间件
const log = (config) => (set, get, api) => {
  return config(
    (...args) => {
      console.log('applying', args);
      set(...args);
      console.log('new state', get());
    },
    get,
    api
  );
};

const useStore = create(
  log((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 }))
  }))
);
```

## 内置中间件

### 1. devtools - Redux DevTools集成

```jsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement')
    }),
    {
      name: 'CounterStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// 使用action名称
const useStoreWithActions = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set(
        (state) => ({ count: state.count + 1 }),
        false,
        { type: 'counter/increment' }
      ),
      incrementBy: (value) => set(
        (state) => ({ count: state.count + value }),
        false,
        { type: 'counter/incrementBy', payload: value }
      )
    }),
    { name: 'CounterStore' }
  )
);
```

### 2. persist - 状态持久化

```jsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 基础持久化
const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    }),
    {
      name: 'counter-storage' // localStorage的key
    }
  )
);

// 使用sessionStorage
const useSessionStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

// 自定义持久化逻辑
const useCustomStore = create(
  persist(
    (set) => ({
      preferences: {},
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value }
        }))
    }),
    {
      name: 'preferences',
      // 部分持久化
      partialize: (state) => ({ preferences: state.preferences }),
      
      // 自定义序列化
      serialize: (state) => btoa(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(atob(str)),
      
      // 版本控制
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // 迁移逻辑
          return { ...persistedState, migrated: true };
        }
        return persistedState;
      }
    }
  )
);

// IndexedDB持久化
import { get, set, del } from 'idb-keyval';

const indexedDBStorage = {
  getItem: async (name) => {
    return (await get(name)) || null;
  },
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  }
};

const useIndexedDBStore = create(
  persist(
    (set) => ({
      largeData: [],
      setLargeData: (data) => set({ largeData: data })
    }),
    {
      name: 'large-data-storage',
      storage: createJSONStorage(() => indexedDBStorage)
    }
  )
);
```

### 3. immer - 不可变更新

```jsx
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useStore = create(
  immer((set) => ({
    nested: {
      level1: {
        level2: {
          value: 0,
          items: []
        }
      }
    },

    // 直接修改，immer处理不可变性
    updateValue: (newValue) =>
      set((state) => {
        state.nested.level1.level2.value = newValue;
      }),

    // 数组操作
    addItem: (item) =>
      set((state) => {
        state.nested.level1.level2.items.push(item);
      }),

    removeItem: (index) =>
      set((state) => {
        state.nested.level1.level2.items.splice(index, 1);
      }),

    updateItem: (index, newItem) =>
      set((state) => {
        state.nested.level1.level2.items[index] = newItem;
      })
  }))
);

// 复杂数据结构示例
const useTodoStore = create(
  immer((set) => ({
    todos: [],
    
    addTodo: (text) =>
      set((state) => {
        state.todos.push({
          id: Date.now(),
          text,
          completed: false,
          subtasks: []
        });
      }),

    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),

    addSubtask: (todoId, subtaskText) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === todoId);
        if (todo) {
          todo.subtasks.push({
            id: Date.now(),
            text: subtaskText,
            completed: false
          });
        }
      }),

    updateSubtask: (todoId, subtaskId, updates) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === todoId);
        if (todo) {
          const subtask = todo.subtasks.find((s) => s.id === subtaskId);
          if (subtask) {
            Object.assign(subtask, updates);
          }
        }
      })
  }))
);
```

### 4. subscribeWithSelector - 选择性订阅

```jsx
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const useStore = create(
  subscribeWithSelector((set) => ({
    count: 0,
    user: { name: 'Alice', age: 30 },
    increment: () => set((state) => ({ count: state.count + 1 })),
    updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } }))
  }))
);

// 订阅特定字段
const unsubscribe = useStore.subscribe(
  (state) => state.count,
  (count, prevCount) => {
    console.log('Count changed from', prevCount, 'to', count);
  }
);

// 订阅嵌套字段
useStore.subscribe(
  (state) => state.user.name,
  (name) => {
    console.log('User name changed to:', name);
  }
);

// 条件订阅
useStore.subscribe(
  (state) => state.count,
  (count) => {
    console.log('Count is even!');
  },
  {
    equalityFn: (a, b) => a % 2 === b % 2 // 只在奇偶性变化时触发
  }
);

// 延迟订阅
useStore.subscribe(
  (state) => state.count,
  (count) => {
    console.log('Count changed (delayed):', count);
  },
  {
    fireImmediately: false // 不立即触发
  }
);
```

### 5. redux - Redux风格

```jsx
import { create } from 'zustand';
import { redux } from 'zustand/middleware';

const types = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  SET_COUNT: 'SET_COUNT'
};

const reducer = (state, action) => {
  switch (action.type) {
    case types.INCREMENT:
      return { ...state, count: state.count + 1 };
    case types.DECREMENT:
      return { ...state, count: state.count - 1 };
    case types.SET_COUNT:
      return { ...state, count: action.payload };
    default:
      return state;
  }
};

const useStore = create(redux(reducer, { count: 0 }));

// 使用
function Counter() {
  const count = useStore((state) => state.count);
  const dispatch = useStore((state) => state.dispatch);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch({ type: types.INCREMENT })}>+</button>
      <button onClick={() => dispatch({ type: types.DECREMENT })}>-</button>
      <button onClick={() => dispatch({ type: types.SET_COUNT, payload: 0 })}>Reset</button>
    </div>
  );
}
```

## 组合多个中间件

### 中间件组合顺序

```jsx
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';

// 中间件执行顺序：从内到外
const useStore = create(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        count: 0,
        user: null,
        increment: () => set((state) => ({ count: state.count + 1 }))
      })),
      { name: 'app-storage' }
    ),
    { name: 'AppStore' }
  )
);

// TypeScript版本
import { StateCreator } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
}

const useTypedStore = create<CounterState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 }))
      }),
      { name: 'counter-storage' }
    ),
    { name: 'CounterStore' }
  )
);
```

### 中间件组合最佳实践

```jsx
// 1. devtools应该在最外层
// 2. persist通常在devtools之后
// 3. immer在persist之后（如果需要）
// 4. subscribeWithSelector在最内层

const useStore = create(
  devtools(
    persist(
      immer(
        subscribeWithSelector((set) => ({
          // store配置
        }))
      ),
      { name: 'storage-key' }
    ),
    { name: 'StoreName' }
  )
);
```

## 自定义中间件

### 示例1：日志中间件

```jsx
const logger = (config) => (set, get, api) => {
  return config(
    (...args) => {
      const prevState = get();
      set(...args);
      const nextState = get();
      
      console.group('State Update');
      console.log('Previous State:', prevState);
      console.log('Arguments:', args);
      console.log('Next State:', nextState);
      console.groupEnd();
    },
    get,
    api
  );
};

const useStore = create(
  logger((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 }))
  }))
);
```

### 示例2：性能监控中间件

```jsx
const performance = (config) => (set, get, api) => {
  return config(
    (...args) => {
      const start = performance.now();
      set(...args);
      const end = performance.now();
      
      console.log(`State update took ${end - start}ms`);
    },
    get,
    api
  );
};
```

### 示例3：撤销/重做中间件

```jsx
const temporal = (config, options = {}) => (set, get, api) => {
  const { limit = 10 } = options;
  
  const temporalState = {
    past: [],
    present: null,
    future: []
  };

  return {
    ...config(
      (partial, replace) => {
        const currentState = get();
        
        // 保存当前状态到past
        temporalState.past.push(currentState);
        if (temporalState.past.length > limit) {
          temporalState.past.shift();
        }
        
        // 清空future
        temporalState.future = [];
        
        set(partial, replace);
      },
      get,
      api
    ),

    undo: () => {
      if (temporalState.past.length === 0) return;
      
      const currentState = get();
      const previousState = temporalState.past.pop();
      
      temporalState.future.push(currentState);
      
      set(previousState, true);
    },

    redo: () => {
      if (temporalState.future.length === 0) return;
      
      const currentState = get();
      const nextState = temporalState.future.pop();
      
      temporalState.past.push(currentState);
      
      set(nextState, true);
    },

    clear: () => {
      temporalState.past = [];
      temporalState.future = [];
    },

    canUndo: () => temporalState.past.length > 0,
    canRedo: () => temporalState.future.length > 0
  };
};

// 使用
const useStore = create(
  temporal(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 }))
    }),
    { limit: 20 }
  )
);

function Counter() {
  const { count, increment, decrement, undo, redo, canUndo, canRedo } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={undo} disabled={!canUndo()}>Undo</button>
      <button onClick={redo} disabled={!canRedo()}>Redo</button>
    </div>
  );
}
```

### 示例4：请求去重中间件

```jsx
const dedupe = (config) => (set, get, api) => {
  const pendingRequests = new Map();

  return config(
    (...args) => {
      set(...args);
    },
    get,
    {
      ...api,
      fetchWithDedupe: async (key, fetcher) => {
        // 如果已有pending请求，返回同一个promise
        if (pendingRequests.has(key)) {
          return pendingRequests.get(key);
        }

        const promise = fetcher();
        pendingRequests.set(key, promise);

        try {
          const result = await promise;
          return result;
        } finally {
          pendingRequests.delete(key);
        }
      }
    }
  );
};

const useStore = create(
  dedupe((set, get, api) => ({
    users: [],
    loading: false,

    fetchUsers: async () => {
      set({ loading: true });
      
      const users = await api.fetchWithDedupe('users', async () => {
        const response = await fetch('/api/users');
        return response.json();
      });

      set({ users, loading: false });
    }
  }))
);
```

### 示例5：乐观更新中间件

```jsx
const optimistic = (config) => (set, get, api) => {
  return {
    ...config(set, get, api),

    optimisticUpdate: async (optimisticState, asyncFn, rollbackFn) => {
      const previousState = get();
      
      // 立即应用乐观更新
      set(optimisticState);

      try {
        // 执行异步操作
        const result = await asyncFn();
        return result;
      } catch (error) {
        // 失败则回滚
        if (rollbackFn) {
          rollbackFn();
        } else {
          set(previousState, true);
        }
        throw error;
      }
    }
  };
};

const useStore = create(
  optimistic((set, get, api) => ({
    todos: [],

    addTodo: async (text) => {
      const tempId = `temp-${Date.now()}`;
      
      await api.optimisticUpdate(
        // 乐观更新
        (state) => ({
          todos: [...state.todos, { id: tempId, text, completed: false }]
        }),
        // 异步操作
        async () => {
          const response = await fetch('/api/todos', {
            method: 'POST',
            body: JSON.stringify({ text })
          });
          const newTodo = await response.json();
          
          // 替换临时数据
          set((state) => ({
            todos: state.todos.map((todo) =>
              todo.id === tempId ? newTodo : todo
            )
          }));
        }
      );
    }
  }))
);
```

## 中间件高级技巧

### 1. 条件中间件

```jsx
const conditionalMiddleware = (condition, middleware) => {
  return condition ? middleware : (config) => config;
};

const useStore = create(
  conditionalMiddleware(
    process.env.NODE_ENV === 'development',
    devtools
  )(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    })
  )
);
```

### 2. 中间件工厂

```jsx
const createLoggerMiddleware = (options = {}) => {
  const { prefix = '[Store]', enabled = true } = options;

  return (config) => (set, get, api) => {
    if (!enabled) return config(set, get, api);

    return config(
      (...args) => {
        console.log(`${prefix} Update:`, args);
        set(...args);
        console.log(`${prefix} New State:`, get());
      },
      get,
      api
    );
  };
};

const useStore = create(
  createLoggerMiddleware({ prefix: '[MyStore]', enabled: true })(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    })
  )
);
```

### 3. 中间件组合工具

```jsx
const compose = (...middlewares) => (config) => {
  return middlewares.reduceRight((acc, middleware) => middleware(acc), config);
};

const useStore = create(
  compose(
    devtools,
    persist,
    logger
  )((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 }))
  }))
);
```

## 实战案例

### 案例1：完整的数据获取中间件

```jsx
const dataFetching = (config) => (set, get, api) => {
  const cache = new Map();

  return {
    ...config(set, get, api),

    fetch: async (key, fetcher, options = {}) => {
      const { 
        cacheTime = 5 * 60 * 1000, // 5分钟
        forceRefresh = false 
      } = options;

      // 检查缓存
      if (!forceRefresh && cache.has(key)) {
        const cached = cache.get(key);
        if (Date.now() - cached.timestamp < cacheTime) {
          return cached.data;
        }
      }

      // 设置loading
      set({ [`${key}Loading`]: true, [`${key}Error`]: null });

      try {
        const data = await fetcher();
        
        // 更新缓存
        cache.set(key, { data, timestamp: Date.now() });
        
        // 更新状态
        set({ [key]: data, [`${key}Loading`]: false });
        
        return data;
      } catch (error) {
        set({ [`${key}Error`]: error.message, [`${key}Loading`]: false });
        throw error;
      }
    },

    invalidateCache: (key) => {
      if (key) {
        cache.delete(key);
      } else {
        cache.clear();
      }
    }
  };
};

const useStore = create(
  dataFetching((set, get, api) => ({
    users: [],
    usersLoading: false,
    usersError: null,

    posts: [],
    postsLoading: false,
    postsError: null,

    fetchUsers: () => api.fetch('users', async () => {
      const response = await fetch('/api/users');
      return response.json();
    }),

    fetchPosts: (forceRefresh = false) => api.fetch(
      'posts',
      async () => {
        const response = await fetch('/api/posts');
        return response.json();
      },
      { forceRefresh }
    ),

    refreshData: () => {
      api.invalidateCache();
      get().fetchUsers();
      get().fetchPosts(true);
    }
  }))
);
```

### 案例2：状态同步中间件

```jsx
const sync = (config) => (set, get, api) => {
  const channel = new BroadcastChannel('zustand-sync');

  channel.addEventListener('message', (event) => {
    if (event.data.type === 'state-update') {
      set(event.data.state, true);
    }
  });

  return config(
    (...args) => {
      set(...args);
      
      // 广播状态更新
      channel.postMessage({
        type: 'state-update',
        state: get()
      });
    },
    get,
    api
  );
};

const useStore = create(
  sync((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 }))
  }))
);
```

## 中间件最佳实践

### 1. 中间件顺序

```jsx
// 推荐顺序
create(
  devtools(        // 1. 调试工具（最外层）
    persist(       // 2. 持久化
      immer(       // 3. 不可变更新
        subscribeWithSelector( // 4. 选择性订阅（最内层）
          (set) => ({...})
        )
      )
    )
  )
)
```

### 2. TypeScript支持

```typescript
import { StateCreator } from 'zustand';

type Logger = <T>(
  config: StateCreator<T>
) => StateCreator<T>;

const logger: Logger = (config) => (set, get, api) => {
  return config(
    (...args) => {
      console.log('State update:', args);
      set(...args);
    },
    get,
    api
  );
};
```

### 3. 性能考虑

```jsx
// 避免在中间件中进行重计算
const badMiddleware = (config) => (set, get, api) => {
  return config(
    (...args) => {
      // 不好：每次更新都重新计算
      const expensiveValue = heavyComputation(get());
      
      set(...args);
    },
    get,
    api
  );
};

// 好的做法：在需要时计算
const goodMiddleware = (config) => (set, get, api) => {
  let cachedValue = null;
  
  return config(
    (...args) => {
      set(...args);
      
      // 只在需要时计算
      cachedValue = null; // 清除缓存
    },
    () => {
      if (cachedValue === null) {
        cachedValue = heavyComputation(get());
      }
      return cachedValue;
    },
    api
  );
};
```

## 总结

Zustand中间件系统强大而灵活，关键要点：

1. **内置中间件**：devtools、persist、immer等
2. **组合中间件**：注意执行顺序
3. **自定义中间件**：遵循标准模式
4. **TypeScript支持**：使用正确的类型
5. **性能优化**：避免重复计算

中间件让Zustand可以适应各种复杂场景，是构建大型应用的关键工具。

