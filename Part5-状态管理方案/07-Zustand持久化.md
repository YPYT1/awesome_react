# Zustand持久化

## 概述

状态持久化是现代应用的重要功能，可以在页面刷新后保留用户数据。Zustand提供了强大的persist中间件，支持多种存储方式和高级配置。

## 基础持久化

### 使用localStorage

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 }))
    }),
    {
      name: 'counter-storage' // localStorage的key名称
    }
  )
);

// 使用
function Counter() {
  const { count, increment, decrement } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### 使用sessionStorage

```jsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      sessionData: null,
      setSessionData: (data) => set({ sessionData: data })
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
```

## 存储配置

### 1. 部分持久化

只持久化部分状态：

```jsx
const useStore = create(
  persist(
    (set) => ({
      // 需要持久化的
      user: null,
      preferences: { theme: 'light', language: 'zh-CN' },
      
      // 不需要持久化的
      tempData: null,
      isLoading: false,
      
      setUser: (user) => set({ user }),
      setPreferences: (preferences) => set({ preferences }),
      setTempData: (data) => set({ tempData: data })
    }),
    {
      name: 'app-storage',
      // 只持久化user和preferences
      partialize: (state) => ({
        user: state.user,
        preferences: state.preferences
      })
    }
  )
);

// 或者使用白名单/黑名单模式
const useStoreWithWhitelist = create(
  persist(
    (set) => ({
      data1: 'persist',
      data2: 'persist',
      tempData: 'no persist',
      
      updateData1: (value) => set({ data1: value })
    }),
    {
      name: 'whitelist-storage',
      partialize: (state) => {
        const { tempData, ...rest } = state;
        return rest; // 排除tempData
      }
    }
  )
);
```

### 2. 自定义序列化

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 使用base64编码
const useEncodedStore = create(
  persist(
    (set) => ({
      sensitiveData: null,
      setSensitiveData: (data) => set({ sensitiveData: data })
    }),
    {
      name: 'encoded-storage',
      serialize: (state) => btoa(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(atob(str))
    }
  )
);

// 使用压缩库
import pako from 'pako';

const useCompressedStore = create(
  persist(
    (set) => ({
      largeData: [],
      setLargeData: (data) => set({ largeData: data })
    }),
    {
      name: 'compressed-storage',
      serialize: (state) => {
        const json = JSON.stringify(state);
        const compressed = pako.deflate(json);
        return btoa(String.fromCharCode(...compressed));
      },
      deserialize: (str) => {
        const compressed = Uint8Array.from(atob(str), c => c.charCodeAt(0));
        const json = pako.inflate(compressed, { to: 'string' });
        return JSON.parse(json);
      }
    }
  )
);

// 加密存储
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key';

const useEncryptedStore = create(
  persist(
    (set) => ({
      privateData: null,
      setPrivateData: (data) => set({ privateData: data })
    }),
    {
      name: 'encrypted-storage',
      serialize: (state) => {
        const json = JSON.stringify(state);
        return CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
      },
      deserialize: (str) => {
        const bytes = CryptoJS.AES.decrypt(str, SECRET_KEY);
        const json = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(json);
      }
    }
  )
);
```

### 3. 版本控制和迁移

```jsx
const useStore = create(
  persist(
    (set) => ({
      data: [],
      version: 3, // 当前版本
      
      updateData: (newData) => set({ data: newData })
    }),
    {
      name: 'versioned-storage',
      version: 3,
      
      migrate: (persistedState, version) => {
        // 从版本1迁移到版本2
        if (version === 1) {
          return {
            ...persistedState,
            // 添加新字段
            newField: 'default value',
            version: 2
          };
        }
        
        // 从版本2迁移到版本3
        if (version === 2) {
          return {
            ...persistedState,
            // 重命名字段
            renamedField: persistedState.oldField,
            version: 3
          };
        }
        
        return persistedState;
      }
    }
  )
);

// 复杂迁移场景
const useAdvancedStore = create(
  persist(
    (set) => ({
      users: [],
      settings: {}
    }),
    {
      name: 'advanced-storage',
      version: 2,
      
      migrate: (persistedState, version) => {
        const migrations = {
          // 版本0到1：添加默认设置
          0: (state) => ({
            ...state,
            settings: {
              theme: 'light',
              language: 'en',
              ...state.settings
            }
          }),
          
          // 版本1到2：转换用户数据结构
          1: (state) => ({
            ...state,
            users: state.users.map(user => ({
              ...user,
              fullName: `${user.firstName} ${user.lastName}`,
              firstName: undefined,
              lastName: undefined
            }))
          })
        };

        let currentState = persistedState;
        
        // 应用所有必要的迁移
        for (let v = version; v < 2; v++) {
          if (migrations[v]) {
            currentState = migrations[v](currentState);
          }
        }
        
        return currentState;
      }
    }
  )
);
```

## 不同存储方式

### 1. IndexedDB存储

```jsx
import { get, set, del } from 'idb-keyval';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 创建IndexedDB存储适配器
const indexedDBStorage = {
  getItem: async (name) => {
    console.log('Getting from IndexedDB:', name);
    return (await get(name)) || null;
  },
  setItem: async (name, value) => {
    console.log('Setting to IndexedDB:', name);
    await set(name, value);
  },
  removeItem: async (name) => {
    console.log('Removing from IndexedDB:', name);
    await del(name);
  }
};

const useIndexedDBStore = create(
  persist(
    (set) => ({
      largeDataset: [],
      files: [],
      
      addFile: (file) => set((state) => ({
        files: [...state.files, file]
      })),
      
      setLargeDataset: (data) => set({ largeDataset: data })
    }),
    {
      name: 'large-data-storage',
      storage: createJSONStorage(() => indexedDBStorage)
    }
  )
);

// 使用自定义IndexedDB实现
import { openDB } from 'idb';

const customIndexedDBStorage = {
  async getItem(name) {
    const db = await openDB('zustand-db', 1, {
      upgrade(db) {
        db.createObjectStore('state');
      }
    });
    return db.get('state', name);
  },
  
  async setItem(name, value) {
    const db = await openDB('zustand-db', 1);
    await db.put('state', value, name);
  },
  
  async removeItem(name) {
    const db = await openDB('zustand-db', 1);
    await db.delete('state', name);
  }
};
```

### 2. Cookie存储

```jsx
import Cookies from 'js-cookie';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const cookieStorage = {
  getItem: (name) => {
    const value = Cookies.get(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name, value) => {
    Cookies.set(name, JSON.stringify(value), { expires: 7 }); // 7天过期
  },
  removeItem: (name) => {
    Cookies.remove(name);
  }
};

const useCookieStore = create(
  persist(
    (set) => ({
      preferences: {},
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value }
        }))
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => cookieStorage)
    }
  )
);
```

### 3. React Native AsyncStorage

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const asyncStorage = {
  getItem: async (name) => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  }
};

const useReactNativeStore = create(
  persist(
    (set) => ({
      userData: null,
      appSettings: {},
      
      setUserData: (data) => set({ userData: data }),
      updateSettings: (settings) => set({ appSettings: settings })
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => asyncStorage)
    }
  )
);
```

### 4. URL参数存储

```jsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const urlStorage = {
  getItem: (name) => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(name);
    return value ? JSON.parse(decodeURIComponent(value)) : null;
  },
  setItem: (name, value) => {
    const params = new URLSearchParams(window.location.search);
    params.set(name, encodeURIComponent(JSON.stringify(value)));
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  },
  removeItem: (name) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(name);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }
};

const useURLStore = create(
  persist(
    (set) => ({
      filters: {},
      sortBy: 'date',
      
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value }
        })),
      setSortBy: (sortBy) => set({ sortBy })
    }),
    {
      name: 'filters',
      storage: createJSONStorage(() => urlStorage)
    }
  )
);
```

## 高级持久化模式

### 1. 多存储策略

```jsx
const createMultiStorage = (storages) => {
  return {
    getItem: async (name) => {
      for (const storage of storages) {
        const value = await storage.getItem(name);
        if (value !== null) {
          return value;
        }
      }
      return null;
    },
    
    setItem: async (name, value) => {
      await Promise.all(
        storages.map(storage => storage.setItem(name, value))
      );
    },
    
    removeItem: async (name) => {
      await Promise.all(
        storages.map(storage => storage.removeItem(name))
      );
    }
  };
};

// 同时保存到localStorage和IndexedDB
const useMultiStore = create(
  persist(
    (set) => ({
      importantData: null,
      setImportantData: (data) => set({ importantData: data })
    }),
    {
      name: 'multi-storage',
      storage: createJSONStorage(() => 
        createMultiStorage([localStorage, indexedDBStorage])
      )
    }
  )
);
```

### 2. 条件持久化

```jsx
const useConditionalStore = create(
  persist(
    (set, get) => ({
      data: [],
      shouldPersist: true,
      
      setData: (data) => set({ data }),
      setShouldPersist: (value) => set({ shouldPersist: value })
    }),
    {
      name: 'conditional-storage',
      partialize: (state) => {
        if (!state.shouldPersist) {
          return {}; // 不持久化任何内容
        }
        return { data: state.data };
      }
    }
  )
);
```

### 3. 延迟持久化

```jsx
import { debounce } from 'lodash-es';

const createDebouncedStorage = (storage, delay = 1000) => {
  const debouncedSet = debounce(
    (name, value) => storage.setItem(name, value),
    delay
  );

  return {
    getItem: storage.getItem,
    setItem: debouncedSet,
    removeItem: storage.removeItem
  };
};

const useDebouncedStore = create(
  persist(
    (set) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query })
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => 
        createDebouncedStorage(localStorage, 500)
      )
    }
  )
);
```

### 4. 过期策略

```jsx
const createExpiringStorage = (storage, ttl = 24 * 60 * 60 * 1000) => {
  return {
    getItem: async (name) => {
      const item = await storage.getItem(name);
      if (!item) return null;

      const { value, timestamp } = JSON.parse(item);
      
      // 检查是否过期
      if (Date.now() - timestamp > ttl) {
        await storage.removeItem(name);
        return null;
      }

      return value;
    },
    
    setItem: async (name, value) => {
      const item = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      await storage.setItem(name, item);
    },
    
    removeItem: storage.removeItem
  };
};

const useExpiringStore = create(
  persist(
    (set) => ({
      cachedData: null,
      setCachedData: (data) => set({ cachedData: data })
    }),
    {
      name: 'expiring-storage',
      storage: createJSONStorage(() => 
        createExpiringStorage(localStorage, 60 * 60 * 1000) // 1小时
      )
    }
  )
);
```

## 持久化同步

### 跨标签页同步

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    }),
    {
      name: 'sync-storage',
      
      // 监听storage事件实现跨标签页同步
      storage: createJSONStorage(() => ({
        ...localStorage,
        setItem: (name, value) => {
          localStorage.setItem(name, value);
          
          // 触发自定义事件
          window.dispatchEvent(
            new CustomEvent('zustand-storage', {
              detail: { name, value }
            })
          );
        }
      }))
    }
  )
);

// 监听其他标签页的更新
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'sync-storage') {
      const newState = JSON.parse(e.newValue);
      useStore.setState(newState.state);
    }
  });
}
```

### BroadcastChannel同步

```jsx
const createBroadcastStorage = (storage, channelName) => {
  const channel = new BroadcastChannel(channelName);

  channel.addEventListener('message', (event) => {
    if (event.data.type === 'sync') {
      // 更新本地存储
      storage.setItem(event.data.name, event.data.value);
    }
  });

  return {
    getItem: storage.getItem,
    
    setItem: (name, value) => {
      storage.setItem(name, value);
      
      // 广播到其他标签页
      channel.postMessage({
        type: 'sync',
        name,
        value
      });
    },
    
    removeItem: (name) => {
      storage.removeItem(name);
      
      channel.postMessage({
        type: 'remove',
        name
      });
    }
  };
};

const useBroadcastStore = create(
  persist(
    (set) => ({
      sharedData: null,
      setSharedData: (data) => set({ sharedData: data })
    }),
    {
      name: 'broadcast-storage',
      storage: createJSONStorage(() => 
        createBroadcastStorage(localStorage, 'app-sync')
      )
    }
  )
);
```

## 实战案例

### 案例1：用户偏好设置

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePreferencesStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',
      fontSize: 16,
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      
      updateNotification: (type, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [type]: value
          }
        })),
      
      resetPreferences: () =>
        set({
          theme: 'light',
          language: 'zh-CN',
          fontSize: 16,
          notifications: {
            email: true,
            push: false,
            sms: false
          }
        })
    }),
    {
      name: 'user-preferences',
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        fontSize: state.fontSize,
        notifications: state.notifications
      })
    }
  )
);

// 使用
function SettingsPage() {
  const {
    theme,
    language,
    fontSize,
    notifications,
    setTheme,
    setLanguage,
    setFontSize,
    updateNotification
  } = usePreferencesStore();

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>

      <input
        type="range"
        min="12"
        max="24"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />

      <label>
        <input
          type="checkbox"
          checked={notifications.email}
          onChange={(e) => updateNotification('email', e.target.checked)}
        />
        Email Notifications
      </label>
    </div>
  );
}
```

### 案例2：购物车持久化

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useCartStore = create(
  persist(
    immer((set) => ({
      items: [],
      
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            state.items.push({ ...product, quantity: 1 });
          }
        }),
      
      removeItem: (productId) =>
        set((state) => {
          state.items = state.items.filter(item => item.id !== productId);
        }),
      
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items.find(item => item.id === productId);
          if (item) {
            item.quantity = quantity;
          }
        }),
      
      clearCart: () => set({ items: [] }),
      
      // 计算总价
      get total() {
        return this.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
      
      // 计算商品数量
      get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
      }
    })),
    {
      name: 'shopping-cart',
      version: 1,
      
      // 只持久化items
      partialize: (state) => ({ items: state.items }),
      
      // 迁移旧版本数据
      migrate: (persistedState, version) => {
        if (version === 0) {
          // 添加quantity字段
          return {
            items: persistedState.items.map(item => ({
              ...item,
              quantity: item.quantity || 1
            }))
          };
        }
        return persistedState;
      }
    }
  )
);
```

### 案例3：表单草稿自动保存

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debounce } from 'lodash-es';

// 创建防抖存储
const createDebouncedPersist = (delay = 1000) => {
  let debouncedSave;

  return (config) => (set, get, api) => {
    const persistConfig = config(set, get, api);

    debouncedSave = debounce(() => {
      const state = get();
      localStorage.setItem('form-draft', JSON.stringify(state));
    }, delay);

    return {
      ...persistConfig,
      setState: (...args) => {
        set(...args);
        debouncedSave();
      }
    };
  };
};

const useFormDraftStore = create(
  persist(
    (set) => ({
      formData: {
        title: '',
        content: '',
        category: '',
        tags: []
      },
      lastSaved: null,
      
      updateField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          lastSaved: new Date().toISOString()
        })),
      
      updateFormData: (data) =>
        set({
          formData: data,
          lastSaved: new Date().toISOString()
        }),
      
      clearDraft: () =>
        set({
          formData: { title: '', content: '', category: '', tags: [] },
          lastSaved: null
        })
    }),
    {
      name: 'form-draft',
      version: 1
    }
  )
);

// 使用
function BlogPostForm() {
  const { formData, lastSaved, updateField, clearDraft } = useFormDraftStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await savePost(formData);
    clearDraft();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={formData.content}
        onChange={(e) => updateField('content', e.target.value)}
        placeholder="Content"
      />
      {lastSaved && (
        <p>Last saved: {new Date(lastSaved).toLocaleString()}</p>
      )}
      <button type="submit">Publish</button>
    </form>
  );
}
```

## 持久化最佳实践

### 1. 数据清理

```jsx
const useStore = create(
  persist(
    (set) => ({
      data: [],
      tempData: null,
      
      setData: (data) => set({ data }),
      setTempData: (data) => set({ tempData: data })
    }),
    {
      name: 'app-storage',
      
      // 只持久化需要的数据
      partialize: (state) => ({
        data: state.data
      }),
      
      // 定期清理
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 清理过期数据
          state.data = state.data.filter(
            item => Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000
          );
        }
      }
    }
  )
);
```

### 2. 错误处理

```jsx
const useStore = create(
  persist(
    (set) => ({
      data: null
    }),
    {
      name: 'app-storage',
      
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate:', error);
          // 使用默认值
          return { data: null };
        }
      }
    }
  )
);
```

### 3. 性能优化

```jsx
// 大数据集使用IndexedDB
// 频繁更新使用防抖
// 敏感数据使用加密
// 定期清理过期数据
```

## 总结

Zustand持久化功能强大且灵活，关键要点：

1. **多种存储**：localStorage、sessionStorage、IndexedDB等
2. **部分持久化**：使用partialize选择需要持久化的状态
3. **版本控制**：使用migrate处理数据迁移
4. **自定义序列化**：支持压缩、加密等
5. **跨标签页同步**：使用storage事件或BroadcastChannel
6. **性能优化**：防抖、延迟保存等策略

合理使用持久化可以大大提升用户体验。

