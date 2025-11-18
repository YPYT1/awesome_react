# createSlice创建切片

## 概述

createSlice是Redux Toolkit的核心API之一，它极大简化了Redux的使用方式。一个slice包含了某个功能域的所有Redux逻辑，包括reducer和action creators。本文深入探讨createSlice的各种用法和最佳实践。

## createSlice基础

### 基本语法

```jsx
import { createSlice } from '@reduxjs/toolkit';

const sliceName = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    // reducer函数
  },
  extraReducers: (builder) => {
    // 处理外部actions
  }
});
```

### 简单示例

```jsx
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
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

// 自动生成的action creators
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 导出reducer
export default counterSlice.reducer;
```

## Reducer函数详解

### 使用Immer进行不可变更新

createSlice使用Immer库，允许直接"修改"state：

```jsx
const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    filter: 'all'
  },
  reducers: {
    // 直接修改state（Immer处理不可变性）
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },

    // 修改嵌套属性
    toggleTodo: (state, action) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    // 数组操作
    removeTodo: (state, action) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
      // 或者直接返回新状态
      // return {
      //   ...state,
      //   items: state.items.filter(todo => todo.id !== action.payload)
      // };
    },

    // 批量更新
    updateTodos: (state, action) => {
      action.payload.forEach(update => {
        const todo = state.items.find(todo => todo.id === update.id);
        if (todo) {
          Object.assign(todo, update.changes);
        }
      });
    },

    // 设置过滤器
    setFilter: (state, action) => {
      state.filter = action.payload;
    },

    // 重置状态
    resetTodos: () => {
      return { items: [], filter: 'all' };
    }
  }
});
```

### Reducer函数的参数

```jsx
const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    preferences: {},
    notifications: []
  },
  reducers: {
    // state: 当前状态
    // action: { type, payload, meta }
    setProfile: (state, action) => {
      state.profile = action.payload;
    },

    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },

    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      });
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});
```

## Action Creators

### 自动生成的Action Creators

```jsx
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

// 自动生成的action creators
const { increment, incrementByAmount } = counterSlice.actions;

// 生成的actions
console.log(increment());
// { type: 'counter/increment' }

console.log(incrementByAmount(5));
// { type: 'counter/incrementByAmount', payload: 5 }
```

### Prepare Callback

自定义action payload的生成：

```jsx
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    status: 'idle'
  },
  reducers: {
    // 基础用法
    postAdded: (state, action) => {
      state.posts.push(action.payload);
    },

    // 使用prepare callback
    postAddedWithId: {
      reducer: (state, action) => {
        state.posts.push(action.payload);
      },
      prepare: (title, content, userId) => {
        return {
          payload: {
            id: Date.now(),
            title,
            content,
            userId,
            createdAt: new Date().toISOString(),
            reactions: {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0
            }
          }
        };
      }
    },

    // 带meta的prepare
    postUpdated: {
      reducer: (state, action) => {
        const { id, changes } = action.payload;
        const post = state.posts.find(post => post.id === id);
        if (post) {
          Object.assign(post, changes);
        }
      },
      prepare: (id, changes, updateReason) => {
        return {
          payload: { id, changes },
          meta: {
            updateReason,
            updatedAt: new Date().toISOString()
          }
        };
      }
    },

    // 错误处理的prepare
    postDeleted: {
      reducer: (state, action) => {
        if (action.error) {
          state.status = 'error';
          return;
        }
        state.posts = state.posts.filter(post => post.id !== action.payload);
      },
      prepare: (postId) => {
        if (!postId) {
          return {
            payload: null,
            error: true,
            meta: { errorMessage: 'Post ID is required' }
          };
        }
        return {
          payload: postId
        };
      }
    }
  }
});

// 使用
dispatch(postAddedWithId('Title', 'Content', 'user123'));
dispatch(postUpdated(1, { title: 'New Title' }, 'User edit'));
dispatch(postDeleted('invalid-id')); // 触发错误
```

### Action Creator类型

```jsx
const exampleSlice = createSlice({
  name: 'example',
  initialState: { items: [] },
  reducers: {
    // 无参数action
    reset: (state) => {
      state.items = [];
    },

    // 单参数action
    addItem: (state, action) => {
      state.items.push(action.payload);
    },

    // 多参数action（使用prepare）
    updateItem: {
      reducer: (state, action) => {
        const { id, updates } = action.payload;
        const item = state.items.find(item => item.id === id);
        if (item) {
          Object.assign(item, updates);
        }
      },
      prepare: (id, updates) => ({ payload: { id, updates } })
    },

    // 复杂逻辑action
    batchUpdate: {
      reducer: (state, action) => {
        const { operations } = action.payload;
        operations.forEach(op => {
          switch (op.type) {
            case 'add':
              state.items.push(op.item);
              break;
            case 'update':
              const item = state.items.find(item => item.id === op.id);
              if (item) Object.assign(item, op.updates);
              break;
            case 'remove':
              state.items = state.items.filter(item => item.id !== op.id);
              break;
          }
        });
      },
      prepare: (operations) => ({
        payload: {
          operations,
          batchId: Date.now(),
          timestamp: new Date().toISOString()
        }
      })
    }
  }
});
```

## extraReducers详解

### 处理外部Actions

extraReducers用于处理不是在当前slice中定义的actions：

```jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步thunk
export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    // 普通reducers
    clearUser: (state) => {
      state.data = null;
      state.error = null;
    },
    updateUserField: (state, action) => {
      if (state.data) {
        const { field, value } = action.payload;
        state.data[field] = value;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 处理fetchUserData的不同状态
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 处理其他slice的actions
      .addCase('auth/logout', (state) => {
        // 用户登出时清除用户数据
        state.data = null;
        state.error = null;
        state.lastFetch = null;
      });
  }
});
```

### Builder模式 vs 对象语法

```jsx
// Builder模式（推荐）
extraReducers: (builder) => {
  builder
    .addCase(actionCreator, (state, action) => {
      // 处理逻辑
    })
    .addMatcher(
      (action) => action.type.endsWith('/pending'),
      (state) => {
        state.loading = true;
      }
    )
    .addDefaultCase((state, action) => {
      // 默认处理
    });
}

// 对象语法（不推荐，但仍支持）
extraReducers: {
  [actionCreator.type]: (state, action) => {
    // 处理逻辑
  }
}
```

### 使用Matchers

```jsx
const apiSlice = createSlice({
  name: 'api',
  initialState: {
    requests: {},
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 匹配所有pending状态
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true;
          state.requests[action.type.replace('/pending', '')] = {
            status: 'loading',
            startTime: Date.now()
          };
        }
      )
      // 匹配所有fulfilled状态
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false;
          const requestKey = action.type.replace('/fulfilled', '');
          state.requests[requestKey] = {
            status: 'success',
            data: action.payload,
            completedAt: Date.now()
          };
        }
      )
      // 匹配所有rejected状态
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          const requestKey = action.type.replace('/rejected', '');
          state.requests[requestKey] = {
            status: 'error',
            error: action.error.message,
            failedAt: Date.now()
          };
        }
      )
      // 默认处理
      .addDefaultCase((state, action) => {
        console.log('Unhandled action:', action.type);
      });
  }
});
```

## 高级Slice模式

### 嵌套Slice结构

```jsx
const complexSlice = createSlice({
  name: 'complex',
  initialState: {
    ui: {
      theme: 'light',
      sidebarOpen: false,
      modals: {
        settingsOpen: false,
        confirmationOpen: false
      }
    },
    data: {
      users: [],
      posts: [],
      comments: []
    },
    cache: {
      lastUpdate: null,
      etags: {}
    }
  },
  reducers: {
    // UI操作
    setTheme: (state, action) => {
      state.ui.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
    },
    openModal: (state, action) => {
      state.ui.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.ui.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.ui.modals).forEach(modal => {
        state.ui.modals[modal] = false;
      });
    },

    // 数据操作
    setUsers: (state, action) => {
      state.data.users = action.payload;
      state.cache.lastUpdate = new Date().toISOString();
    },
    addUser: (state, action) => {
      state.data.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const { id, updates } = action.payload;
      const user = state.data.users.find(user => user.id === id);
      if (user) {
        Object.assign(user, updates);
      }
    },
    removeUser: (state, action) => {
      state.data.users = state.data.users.filter(user => user.id !== action.payload);
    },

    // 缓存操作
    updateCache: (state, action) => {
      const { key, etag } = action.payload;
      state.cache.etags[key] = etag;
    },
    clearCache: (state) => {
      state.cache.etags = {};
      state.cache.lastUpdate = null;
    }
  }
});
```

### Slice组合

```jsx
// 创建多个相关的slices
const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null, preferences: {} },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updatePreferences: (state, action) => {
      Object.assign(state.preferences, action.payload);
    }
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], loading: false },
  reducers: {
    addPost: (state, action) => {
      state.items.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // 监听用户相关的actions
      .addCase(userSlice.actions.setProfile, (state, action) => {
        // 用户变化时可能需要重新加载posts
        if (!action.payload) {
          state.items = [];
        }
      });
  }
});

// 在store中组合
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    posts: postsSlice.reducer
  }
});
```

### 动态Slice

```jsx
// Slice工厂函数
function createEntitySlice(name, initialState = []) {
  return createSlice({
    name,
    initialState: {
      items: initialState,
      loading: false,
      error: null
    },
    reducers: {
      setItems: (state, action) => {
        state.items = action.payload;
      },
      addItem: (state, action) => {
        state.items.push(action.payload);
      },
      updateItem: (state, action) => {
        const { id, updates } = action.payload;
        const item = state.items.find(item => item.id === id);
        if (item) {
          Object.assign(item, updates);
        }
      },
      removeItem: (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      },
      setLoading: (state, action) => {
        state.loading = action.payload;
      },
      setError: (state, action) => {
        state.error = action.payload;
      }
    }
  });
}

// 创建不同的实体slices
const usersSlice = createEntitySlice('users');
const productsSlice = createEntitySlice('products');
const ordersSlice = createEntitySlice('orders');
```

## 实战案例

### 案例1：电商购物车

```jsx
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    discounts: [],
    shippingInfo: null,
    paymentMethod: null,
    totals: {
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0
    }
  },
  reducers: {
    addToCart: {
      reducer: (state, action) => {
        const newItem = action.payload;
        const existingItem = state.items.find(
          item => item.productId === newItem.productId && 
                 JSON.stringify(item.options) === JSON.stringify(newItem.options)
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          state.items.push(newItem);
        }
      },
      prepare: (product, quantity = 1, options = {}) => ({
        payload: {
          id: `${product.id}_${JSON.stringify(options)}_${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          options,
          addedAt: new Date().toISOString()
        }
      })
    },

    updateQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== itemId);
        } else {
          item.quantity = quantity;
        }
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    clearCart: (state) => {
      state.items = [];
      state.discounts = [];
    },

    applyDiscount: {
      reducer: (state, action) => {
        const discount = action.payload;
        const existingDiscount = state.discounts.find(d => d.code === discount.code);
        
        if (!existingDiscount) {
          state.discounts.push(discount);
        }
      },
      prepare: (code, type, value, description) => ({
        payload: {
          code,
          type, // 'percentage' | 'fixed'
          value,
          description,
          appliedAt: new Date().toISOString()
        }
      })
    },

    removeDiscount: (state, action) => {
      state.discounts = state.discounts.filter(
        discount => discount.code !== action.payload
      );
    },

    setShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    calculateTotals: (state) => {
      // 计算小计
      const subtotal = state.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );

      // 计算折扣
      let discountAmount = 0;
      state.discounts.forEach(discount => {
        if (discount.type === 'percentage') {
          discountAmount += subtotal * (discount.value / 100);
        } else {
          discountAmount += discount.value;
        }
      });

      // 计算税费（假设8%）
      const taxRate = 0.08;
      const taxableAmount = subtotal - discountAmount;
      const tax = taxableAmount * taxRate;

      // 计算运费
      const shipping = state.shippingInfo?.cost || 0;

      // 总计
      const total = subtotal - discountAmount + tax + shipping;

      state.totals = {
        subtotal: Math.round(subtotal * 100) / 100,
        discount: Math.round(discountAmount * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping,
        total: Math.round(total * 100) / 100
      };
    }
  }
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  removeDiscount,
  setShippingInfo,
  setPaymentMethod,
  calculateTotals
} = cartSlice.actions;

export default cartSlice.reducer;

// 选择器
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotals = (state) => state.cart.totals;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
```

### 案例2：通知系统

```jsx
const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    settings: {
      maxCount: 10,
      autoRemoveDelay: 5000,
      position: 'top-right',
      enableSound: true
    }
  },
  reducers: {
    addNotification: {
      reducer: (state, action) => {
        const notification = action.payload;
        
        // 添加到开头
        state.items.unshift(notification);
        
        // 限制最大数量
        if (state.items.length > state.settings.maxCount) {
          state.items = state.items.slice(0, state.settings.maxCount);
        }
      },
      prepare: (message, type = 'info', options = {}) => ({
        payload: {
          id: Date.now(),
          message,
          type, // 'info' | 'success' | 'warning' | 'error'
          timestamp: new Date().toISOString(),
          read: false,
          persistent: options.persistent || false,
          action: options.action || null,
          data: options.data || null
        }
      })
    },

    removeNotification: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    markAsRead: (state, action) => {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    markAllAsRead: (state) => {
      state.items.forEach(item => {
        item.read = true;
      });
    },

    clearNotifications: (state) => {
      state.items = [];
    },

    clearReadNotifications: (state) => {
      state.items = state.items.filter(item => !item.read);
    },

    updateSettings: (state, action) => {
      Object.assign(state.settings, action.payload);
    },

    // 批量操作
    batchNotifications: {
      reducer: (state, action) => {
        const { notifications } = action.payload;
        
        notifications.forEach(notification => {
          state.items.unshift(notification);
        });
        
        // 去重（基于相同的message和type）
        const seen = new Set();
        state.items = state.items.filter(item => {
          const key = `${item.message}_${item.type}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
          return true;
        });
        
        // 限制数量
        if (state.items.length > state.settings.maxCount) {
          state.items = state.items.slice(0, state.settings.maxCount);
        }
      },
      prepare: (notifications) => ({
        payload: {
          notifications: notifications.map(notification => ({
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            read: false,
            persistent: false,
            ...notification
          }))
        }
      })
    }
  }
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  clearReadNotifications,
  updateSettings,
  batchNotifications
} = notificationSlice.actions;

// 便捷方法
export const showSuccess = (message, options) => 
  addNotification(message, 'success', options);

export const showError = (message, options) => 
  addNotification(message, 'error', { persistent: true, ...options });

export const showWarning = (message, options) => 
  addNotification(message, 'warning', options);

export default notificationSlice.reducer;
```

### 案例3：表单状态管理

```jsx
const formSlice = createSlice({
  name: 'form',
  initialState: {
    values: {},
    errors: {},
    touched: {},
    submitted: false,
    submitting: false,
    valid: true,
    dirty: false
  },
  reducers: {
    initializeForm: {
      reducer: (state, action) => {
        const { formId, initialValues } = action.payload;
        state[formId] = {
          values: initialValues,
          errors: {},
          touched: {},
          submitted: false,
          submitting: false,
          valid: true,
          dirty: false
        };
      },
      prepare: (formId, initialValues = {}) => ({
        payload: { formId, initialValues }
      })
    },

    setFieldValue: (state, action) => {
      const { formId, field, value } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.values[field] = value;
        form.dirty = true;
        
        // 清除该字段的错误
        if (form.errors[field]) {
          delete form.errors[field];
        }
      }
    },

    setFieldError: (state, action) => {
      const { formId, field, error } = action.payload;
      const form = state[formId];
      
      if (form) {
        if (error) {
          form.errors[field] = error;
        } else {
          delete form.errors[field];
        }
        
        // 更新表单有效性
        form.valid = Object.keys(form.errors).length === 0;
      }
    },

    setFieldTouched: (state, action) => {
      const { formId, field, touched = true } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.touched[field] = touched;
      }
    },

    validateForm: (state, action) => {
      const { formId, errors } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.errors = errors;
        form.valid = Object.keys(errors).length === 0;
      }
    },

    submitForm: (state, action) => {
      const { formId } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.submitting = true;
        form.submitted = true;
        
        // 标记所有字段为已触摸
        Object.keys(form.values).forEach(field => {
          form.touched[field] = true;
        });
      }
    },

    submitSuccess: (state, action) => {
      const { formId } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.submitting = false;
        form.dirty = false;
      }
    },

    submitError: (state, action) => {
      const { formId, errors } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.submitting = false;
        if (errors) {
          form.errors = { ...form.errors, ...errors };
          form.valid = false;
        }
      }
    },

    resetForm: (state, action) => {
      const { formId, initialValues } = action.payload;
      const form = state[formId];
      
      if (form) {
        form.values = initialValues || {};
        form.errors = {};
        form.touched = {};
        form.submitted = false;
        form.submitting = false;
        form.valid = true;
        form.dirty = false;
      }
    },

    destroyForm: (state, action) => {
      const { formId } = action.payload;
      delete state[formId];
    }
  }
});

export const {
  initializeForm,
  setFieldValue,
  setFieldError,
  setFieldTouched,
  validateForm,
  submitForm,
  submitSuccess,
  submitError,
  resetForm,
  destroyForm
} = formSlice.actions;

export default formSlice.reducer;

// 选择器
export const selectForm = (state, formId) => state.form[formId];
export const selectFieldValue = (state, formId, field) => 
  state.form[formId]?.values[field];
export const selectFieldError = (state, formId, field) => 
  state.form[formId]?.errors[field];
export const selectIsFieldTouched = (state, formId, field) => 
  state.form[formId]?.touched[field] || false;
```

## 最佳实践

### 1. Slice组织

```jsx
// 按功能域组织
// features/user/userSlice.js
// features/posts/postsSlice.js
// features/comments/commentsSlice.js

// 每个slice专注单一职责
const userSlice = createSlice({
  name: 'user',
  // 只处理用户相关状态
});

const postsSlice = createSlice({
  name: 'posts',
  // 只处理帖子相关状态
});
```

### 2. 状态结构

```jsx
// 好的状态结构
const goodSlice = createSlice({
  name: 'entities',
  initialState: {
    // 数据
    items: [],
    // 元数据
    loading: false,
    error: null,
    lastFetch: null,
    // UI状态
    selectedId: null,
    filter: 'all'
  }
});

// 避免深层嵌套
const badSlice = createSlice({
  name: 'bad',
  initialState: {
    data: {
      users: {
        list: {
          items: {
            active: []
          }
        }
      }
    }
  }
});
```

### 3. Action设计

```jsx
const slice = createSlice({
  name: 'example',
  initialState: { items: [] },
  reducers: {
    // 好：描述性的action名称
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    
    // 好：使用prepare处理复杂逻辑
    createItem: {
      reducer: (state, action) => {
        state.items.push(action.payload);
      },
      prepare: (data) => ({
        payload: {
          ...data,
          id: Date.now(),
          createdAt: new Date().toISOString()
        }
      })
    },
    
    // 避免：过于通用的名称
    // update: (state, action) => { ... }
  }
});
```

### 4. 类型安全

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    items: [],
    loading: false,
    error: null
  } as ItemsState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<Item, 'id'>>) => {
      state.items.push({
        ...action.payload,
        id: Date.now()
      });
    },
    updateItem: (state, action: PayloadAction<{id: number, updates: Partial<Item>}>) => {
      const { id, updates } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        Object.assign(item, updates);
      }
    }
  }
});
```

## 总结

createSlice是Redux Toolkit的核心，关键要点：

1. **简化Redux**：自动生成actions和reducer
2. **Immer集成**：可以直接"修改"state
3. **Prepare回调**：自定义action payload生成
4. **extraReducers**：处理外部actions
5. **类型安全**：完整的TypeScript支持
6. **最佳实践**：单一职责、清晰命名、合理结构

掌握createSlice是现代Redux开发的基础技能。
