# Zustand DevTools

## 概述

Zustand提供了Redux DevTools集成，让开发者可以可视化追踪状态变化、时间旅行调试和性能分析。本文深入探讨如何使用DevTools提升开发效率。

## 基础配置

### 安装Redux DevTools扩展

首先需要安装浏览器扩展：

- Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)
- Firefox: [Redux DevTools](https://addons.mozilla.org/firefox/addon/reduxdevtools/)
- Edge: [Redux DevTools](https://microsoftedge.microsoft.com/addons/detail/redux-devtools)

### 基础使用

```jsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 })
    }),
    {
      name: 'CounterStore' // DevTools中显示的名称
    }
  )
);

// 使用
function Counter() {
  const { count, increment, decrement, reset } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## DevTools配置选项

### 完整配置

```jsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      user: null,
      increment: () => set((state) => ({ count: state.count + 1 }))
    }),
    {
      // Store名称
      name: 'MyStore',
      
      // 是否启用（通常在开发环境启用）
      enabled: process.env.NODE_ENV === 'development',
      
      // 匿名action名称
      anonymousActionType: 'unknown',
      
      // 序列化选项
      serialize: {
        options: {
          undefined: true,
          function: (fn) => fn.toString(),
          symbol: (sym) => sym.toString()
        }
      },
      
      // 最大操作数
      maxAge: 50,
      
      // 是否追踪
      trace: true,
      traceLimit: 25
    }
  )
);
```

### 条件启用

```jsx
const isDev = process.env.NODE_ENV === 'development';

const useStore = create(
  isDev
    ? devtools(
        (set) => ({
          count: 0,
          increment: () => set((state) => ({ count: state.count + 1 }))
        }),
        { name: 'CounterStore' }
      )
    : (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 }))
      })
);

// 或使用条件中间件
const conditionalDevtools = (enabled) => (enabled ? devtools : (config) => config);

const useStore = create(
  conditionalDevtools(isDev)(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    }),
    { name: 'CounterStore' }
  )
);
```

## Action命名

### 自动命名

```jsx
const useStore = create(
  devtools((set) => ({
    count: 0,
    
    // 第三个参数设置action名称
    increment: () =>
      set((state) => ({ count: state.count + 1 }), false, 'increment'),
    
    decrement: () =>
      set((state) => ({ count: state.count - 1 }), false, 'decrement'),
    
    incrementBy: (value) =>
      set(
        (state) => ({ count: state.count + value }),
        false,
        { type: 'incrementBy', payload: value }
      ),
    
    reset: () => set({ count: 0 }, false, 'reset')
  }))
);
```

### Redux风格命名

```jsx
const useStore = create(
  devtools((set) => ({
    count: 0,
    user: null,

    // 使用对象格式
    increment: () =>
      set(
        (state) => ({ count: state.count + 1 }),
        false,
        { type: 'counter/increment' }
      ),

    setUser: (user) =>
      set(
        { user },
        false,
        { type: 'user/set', payload: user }
      ),

    updateUser: (updates) =>
      set(
        (state) => ({ user: { ...state.user, ...updates } }),
        false,
        { type: 'user/update', payload: updates }
      )
  }))
);
```

### 动态action名称

```jsx
const useStore = create(
  devtools((set) => ({
    items: [],

    addItem: (item) => {
      const actionName = `addItem: ${item.type}`;
      set(
        (state) => ({ items: [...state.items, item] }),
        false,
        actionName
      );
    },

    removeItem: (id) => {
      const item = useStore.getState().items.find((i) => i.id === id);
      const actionName = `removeItem: ${item?.name || id}`;
      set(
        (state) => ({ items: state.items.filter((i) => i.id !== id) }),
        false,
        actionName
      );
    }
  }))
);
```

## 高级调试功能

### 时间旅行调试

```jsx
// DevTools会自动支持时间旅行
// 点击DevTools中的action可以跳转到该状态

const useStore = create(
  devtools((set) => ({
    history: [],
    currentIndex: -1,

    addHistory: (entry) =>
      set(
        (state) => ({
          history: [...state.history.slice(0, state.currentIndex + 1), entry],
          currentIndex: state.currentIndex + 1
        }),
        false,
        'addHistory'
      ),

    undo: () =>
      set(
        (state) => ({
          currentIndex: Math.max(0, state.currentIndex - 1)
        }),
        false,
        'undo'
      ),

    redo: () =>
      set(
        (state) => ({
          currentIndex: Math.min(state.history.length - 1, state.currentIndex + 1)
        }),
        false,
        'redo'
      )
  }))
);
```

### 状态快照

```jsx
const useStore = create(
  devtools((set, get) => ({
    data: {},
    snapshots: [],

    updateData: (updates) =>
      set(
        (state) => ({ data: { ...state.data, ...updates } }),
        false,
        'updateData'
      ),

    createSnapshot: () => {
      const snapshot = {
        id: Date.now(),
        data: get().data,
        timestamp: new Date().toISOString()
      };

      set(
        (state) => ({
          snapshots: [...state.snapshots, snapshot]
        }),
        false,
        'createSnapshot'
      );
    },

    restoreSnapshot: (snapshotId) => {
      const snapshot = get().snapshots.find((s) => s.id === snapshotId);
      if (snapshot) {
        set(
          { data: snapshot.data },
          false,
          { type: 'restoreSnapshot', payload: snapshotId }
        );
      }
    }
  }))
);
```

### 性能追踪

```jsx
const useStore = create(
  devtools(
    (set) => ({
      items: [],

      addItem: (item) => {
        const start = performance.now();
        
        set(
          (state) => ({ items: [...state.items, item] }),
          false,
          {
            type: 'addItem',
            payload: item,
            meta: { duration: performance.now() - start }
          }
        );
      },

      processItems: () => {
        const start = performance.now();
        const items = useStore.getState().items;
        
        // 处理逻辑
        const processed = items.map(processItem);
        
        set(
          { items: processed },
          false,
          {
            type: 'processItems',
            meta: {
              duration: performance.now() - start,
              itemCount: items.length
            }
          }
        );
      }
    }),
    {
      name: 'PerformanceStore',
      trace: true
    }
  )
);
```

## 多Store管理

### Store命名空间

```jsx
// 用户Store
const useUserStore = create(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }, false, 'setUser'),
      logout: () => set({ user: null }, false, 'logout')
    }),
    { name: 'UserStore' }
  )
);

// 产品Store
const useProductStore = create(
  devtools(
    (set) => ({
      products: [],
      fetchProducts: async () => {
        const products = await fetchProductsAPI();
        set({ products }, false, 'fetchProducts');
      }
    }),
    { name: 'ProductStore' }
  )
);

// 购物车Store
const useCartStore = create(
  devtools(
    (set) => ({
      items: [],
      addItem: (item) =>
        set(
          (state) => ({ items: [...state.items, item] }),
          false,
          'addItem'
        )
    }),
    { name: 'CartStore' }
  )
);
```

### Store组合调试

```jsx
const useAppStore = create(
  devtools(
    (set, get) => ({
      // 用户相关
      user: null,
      setUser: (user) => set({ user }, false, 'app/setUser'),

      // 购物车相关
      cart: [],
      addToCart: (item) => {
        const user = get().user;
        if (!user) {
          console.warn('User must be logged in');
          return;
        }
        set(
          (state) => ({ cart: [...state.cart, item] }),
          false,
          { type: 'app/addToCart', userId: user.id }
        );
      },

      // 组合操作
      checkout: async () => {
        const { user, cart } = get();
        
        set({ checkoutLoading: true }, false, 'app/checkout/start');
        
        try {
          await checkoutAPI(user.id, cart);
          set(
            { cart: [], checkoutLoading: false },
            false,
            'app/checkout/success'
          );
        } catch (error) {
          set(
            { checkoutLoading: false, checkoutError: error.message },
            false,
            { type: 'app/checkout/error', error: error.message }
          );
        }
      }
    }),
    { name: 'AppStore' }
  )
);
```

## 自定义DevTools集成

### 自定义日志格式

```jsx
const createCustomDevtools = (config, options = {}) => {
  const { name, enabled = true, format = 'default' } = options;

  if (!enabled || typeof window === 'undefined' || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return config;
  }

  return (set, get, api) => {
    const devtoolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
      name,
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
    });

    const originalSet = set;
    const customSet = (partial, replace, actionName) => {
      const formattedAction = formatAction(actionName, format);
      originalSet(partial, replace);
      devtoolsExtension.send(formattedAction, get());
    };

    const formatAction = (action, format) => {
      if (format === 'emoji') {
        const emojis = {
          add: '➕',
          remove: '➖',
          update: '✏️',
          fetch: '📥',
          save: '💾'
        };
        const type = typeof action === 'string' ? action : action.type;
        const emoji = emojis[type.split('/').pop()] || '📝';
        return { ...action, type: `${emoji} ${type}` };
      }
      return action;
    };

    return config(customSet, get, api);
  };
};

const useStore = create(
  createCustomDevtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'add')
    }),
    { name: 'MyStore', format: 'emoji' }
  )
);
```

### 分组和过滤

```jsx
const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      debug: false,

      // 普通操作
      increment: () =>
        set(
          (state) => ({ count: state.count + 1 }),
          false,
          { type: 'counter/increment', group: 'counter' }
        ),

      // 调试操作
      toggleDebug: () =>
        set(
          (state) => ({ debug: !state.debug }),
          false,
          { type: 'debug/toggle', group: 'debug' }
        ),

      // 批量操作
      batchUpdate: (updates) =>
        set(
          updates,
          false,
          { type: 'batch/update', group: 'batch', payload: updates }
        )
    }),
    {
      name: 'FilteredStore',
      // 过滤某些actions
      actionsDenylist: ['debug/toggle'],
      // 或只允许某些actions
      // actionsWhitelist: ['counter/increment', 'counter/decrement']
    }
  )
);
```

## 调试工具和技巧

### 1. 状态比较工具

```jsx
const useStore = create(
  devtools((set, get) => ({
    data: {},

    updateData: (updates) => {
      const prevState = get();
      set(
        (state) => ({ data: { ...state.data, ...updates } }),
        false,
        {
          type: 'updateData',
          payload: updates,
          diff: getDiff(prevState.data, { ...prevState.data, ...updates })
        }
      );
    }
  }))
);

function getDiff(obj1, obj2) {
  const diff = {};
  Object.keys(obj2).forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      diff[key] = { from: obj1[key], to: obj2[key] };
    }
  });
  return diff;
}
```

### 2. 调试助手

```jsx
const useStore = create(
  devtools((set, get) => ({
    // 状态
    count: 0,
    history: [],

    // 操作
    increment: () => {
      const timestamp = Date.now();
      set(
        (state) => ({
          count: state.count + 1,
          history: [
            ...state.history,
            { action: 'increment', value: state.count + 1, timestamp }
          ]
        }),
        false,
        { type: 'increment', timestamp }
      );
    },

    // 调试工具
    getDebugInfo: () => {
      const state = get();
      return {
        currentState: state,
        historyLength: state.history.length,
        lastAction: state.history[state.history.length - 1],
        stateSize: JSON.stringify(state).length
      };
    },

    clearHistory: () =>
      set({ history: [] }, false, 'debug/clearHistory')
  }))
);

// 使用
function DebugPanel() {
  const getDebugInfo = useStore((state) => state.getDebugInfo);
  const clearHistory = useStore((state) => state.clearHistory);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleDebug = () => {
    const info = getDebugInfo();
    setDebugInfo(info);
    console.table(info);
  };

  return (
    <div>
      <button onClick={handleDebug}>Show Debug Info</button>
      <button onClick={clearHistory}>Clear History</button>
      {debugInfo && <pre>{JSON.stringify(debugInfo, null, 2)}</pre>}
    </div>
  );
}
```

### 3. 性能监控

```jsx
const useStore = create(
  devtools((set) => ({
    metrics: {
      actionCount: 0,
      totalDuration: 0,
      slowActions: []
    },

    trackAction: (actionName, fn) => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;

      set(
        (state) => ({
          metrics: {
            actionCount: state.metrics.actionCount + 1,
            totalDuration: state.metrics.totalDuration + duration,
            slowActions:
              duration > 100
                ? [
                    ...state.metrics.slowActions,
                    { action: actionName, duration, timestamp: Date.now() }
                  ]
                : state.metrics.slowActions
          }
        }),
        false,
        {
          type: 'metrics/track',
          action: actionName,
          duration
        }
      );

      return result;
    },

    getMetrics: () => {
      const state = useStore.getState();
      return {
        ...state.metrics,
        avgDuration:
          state.metrics.totalDuration / state.metrics.actionCount || 0
      };
    }
  }))
);
```

## 实战案例

### 案例1：异步操作调试

```jsx
const useAsyncStore = create(
  devtools((set) => ({
    users: [],
    loading: false,
    error: null,

    fetchUsers: async () => {
      const requestId = Date.now();
      
      set(
        { loading: true, error: null },
        false,
        { type: 'users/fetch/start', requestId }
      );

      try {
        const response = await fetch('/api/users');
        const users = await response.json();

        set(
          { users, loading: false },
          false,
          {
            type: 'users/fetch/success',
            requestId,
            payload: { count: users.length }
          }
        );
      } catch (error) {
        set(
          { error: error.message, loading: false },
          false,
          {
            type: 'users/fetch/error',
            requestId,
            error: error.message
          }
        );
      }
    },

    deleteUser: async (userId) => {
      const requestId = Date.now();
      
      set(
        { loading: true },
        false,
        { type: 'users/delete/start', userId, requestId }
      );

      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });

        set(
          (state) => ({
            users: state.users.filter((u) => u.id !== userId),
            loading: false
          }),
          false,
          { type: 'users/delete/success', userId, requestId }
        );
      } catch (error) {
        set(
          { error: error.message, loading: false },
          false,
          { type: 'users/delete/error', userId, requestId, error: error.message }
        );
      }
    }
  }))
);
```

### 案例2：表单调试

```jsx
const useFormStore = create(
  devtools((set, get) => ({
    formData: {
      name: '',
      email: '',
      message: ''
    },
    errors: {},
    touched: {},
    isValid: false,

    setField: (field, value) => {
      set(
        (state) => ({
          formData: { ...state.formData, [field]: value },
          touched: { ...state.touched, [field]: true }
        }),
        false,
        {
          type: 'form/setField',
          field,
          value,
          isValid: validateForm({ ...get().formData, [field]: value })
        }
      );
    },

    setError: (field, error) =>
      set(
        (state) => ({ errors: { ...state.errors, [field]: error } }),
        false,
        { type: 'form/setError', field, error }
      ),

    validate: () => {
      const { formData } = get();
      const errors = validateForm(formData);
      const isValid = Object.keys(errors).length === 0;

      set(
        { errors, isValid },
        false,
        { type: 'form/validate', isValid, errorCount: Object.keys(errors).length }
      );

      return isValid;
    },

    submit: async () => {
      if (!get().validate()) {
        return;
      }

      const formData = get().formData;
      
      set({ submitting: true }, false, 'form/submit/start');

      try {
        await submitFormAPI(formData);
        set(
          { submitting: false, submitted: true },
          false,
          { type: 'form/submit/success', data: formData }
        );
      } catch (error) {
        set(
          { submitting: false, submitError: error.message },
          false,
          { type: 'form/submit/error', error: error.message }
        );
      }
    },

    reset: () =>
      set(
        {
          formData: { name: '', email: '', message: '' },
          errors: {},
          touched: {},
          isValid: false
        },
        false,
        'form/reset'
      )
  }))
);

function validateForm(data) {
  const errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  if (!data.message) errors.message = 'Message is required';
  return errors;
}
```

## 生产环境注意事项

### 1. 禁用DevTools

```jsx
const useStore = create(
  process.env.NODE_ENV === 'development'
    ? devtools((set) => ({...}))
    : (set) => ({...})
);

// 或使用enabled选项
const useStore = create(
  devtools(
    (set) => ({...}),
    {
      name: 'Store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);
```

### 2. 移除DevTools代码

```jsx
// vite.config.js
export default {
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  build: {
    rollupOptions: {
      external: process.env.NODE_ENV === 'production' ? ['zustand/middleware'] : []
    }
  }
};
```

### 3. 条件导入

```jsx
// 动态导入DevTools
let devtools = (config) => config;

if (process.env.NODE_ENV === 'development') {
  import('zustand/middleware').then((module) => {
    devtools = module.devtools;
  });
}

const useStore = create(devtools((set) => ({...})));
```

## 最佳实践

### 1. Action命名规范

```jsx
// 使用一致的命名模式
// pattern: domain/action
const useStore = create(
  devtools((set) => ({
    // 用户操作
    user: null,
    setUser: (user) => set({ user }, false, 'user/set'),
    updateUser: (updates) => set(
      (state) => ({ user: { ...state.user, ...updates } }),
      false,
      'user/update'
    ),

    // 产品操作
    products: [],
    fetchProducts: () => set({ products: [] }, false, 'products/fetch'),
    addProduct: (product) => set(
      (state) => ({ products: [...state.products, product] }),
      false,
      'products/add'
    )
  }))
);
```

### 2. 组织Store

```jsx
// 按功能拆分
const useUserStore = create(devtools((set) => ({...}), { name: 'User' }));
const useProductStore = create(devtools((set) => ({...}), { name: 'Product' }));
const useCartStore = create(devtools((set) => ({...}), { name: 'Cart' }));
```

### 3. 调试信息

```jsx
const useStore = create(
  devtools((set) => ({
    data: [],
    
    addData: (item) => {
      const timestamp = new Date().toISOString();
      set(
        (state) => ({ data: [...state.data, { ...item, timestamp }] }),
        false,
        {
          type: 'data/add',
          payload: item,
          meta: { timestamp, index: useStore.getState().data.length }
        }
      );
    }
  }))
);
```

## 总结

Zustand DevTools提供强大的调试能力，关键要点：

1. **基础集成**：使用devtools中间件
2. **Action命名**：提供清晰的action名称
3. **性能追踪**：记录操作耗时
4. **状态快照**：支持时间旅行调试
5. **多Store管理**：合理组织多个store
6. **生产环境**：禁用DevTools减少bundle大小

合理使用DevTools可以大大提升开发和调试效率。

