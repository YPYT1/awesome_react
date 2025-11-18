# SWR缓存策略

## 概述

SWR的核心优势在于其强大的缓存机制。通过"stale-while-revalidate"策略,SWR能够立即返回缓存数据(stale),同时在后台重新验证(revalidate),确保数据的新鲜度。本文将深入探讨SWR的缓存策略和最佳实践。

## 缓存机制

### Stale-While-Revalidate

```jsx
import useSWR from 'swr';

function UserProfile() {
  const { data, isValidating } = useSWR('/api/user', fetcher);
  
  // 流程:
  // 1. 检查缓存,如果有则立即返回(stale)
  // 2. 发起新请求(revalidate)
  // 3. 收到响应后更新缓存和UI
  
  return (
    <div>
      <h1>{data?.name}</h1>
      {isValidating && <span className="updating">Updating...</span>}
    </div>
  );
}

/*
时间线:
T0: 组件挂载
  - 检查缓存: 无缓存
  - isLoading: true
  - 发起请求

T1: 收到响应
  - 更新缓存
  - isLoading: false
  - data: {...}

T2: 用户离开再返回
  - 检查缓存: 有缓存
  - data: {...} (立即显示缓存数据)
  - isValidating: true
  - 发起新请求

T3: 收到新响应
  - 更新缓存
  - isValidating: false
  - data: {...} (新数据)
*/
```

### 缓存键(Cache Key)

```jsx
// 字符串键
useSWR('/api/user', fetcher);

// 数组键 - 带参数
useSWR(['/api/user', userId], ([url, id]) => fetcher(`${url}/${id}`));

// 对象键 - 复杂参数
useSWR(
  { url: '/api/posts', params: { page: 1, limit: 10 } },
  ({ url, params }) => fetcher(url, params)
);

// 函数键 - 动态生成
const getKey = () => {
  const user = getCurrentUser();
  if (!user) return null; // 不发起请求
  return `/api/user/${user.id}`;
};
useSWR(getKey, fetcher);

// 序列化键
function serializeKey(key) {
  if (typeof key === 'string') return key;
  if (Array.isArray(key)) return JSON.stringify(key);
  if (typeof key === 'object') return JSON.stringify(key);
  return String(key);
}
```

## 缓存配置

### 全局缓存配置

```jsx
import { SWRConfig, Cache } from 'swr';

// 自定义缓存实现
class MyCache extends Map {
  set(key, value) {
    console.log('Setting cache:', key, value);
    return super.set(key, value);
  }
  
  get(key) {
    console.log('Getting cache:', key);
    return super.get(key);
  }
  
  delete(key) {
    console.log('Deleting cache:', key);
    return super.delete(key);
  }
}

function App() {
  return (
    <SWRConfig
      value={{
        provider: () => new MyCache(),
        
        // 缓存相关配置
        dedupingInterval: 2000,      // 去重间隔(ms)
        focusThrottleInterval: 5000, // 聚焦节流间隔(ms)
        loadingTimeout: 3000,        // 加载超时时间(ms)
        errorRetryInterval: 5000,    // 错误重试间隔(ms)
        errorRetryCount: 3,          // 错误重试次数
      }}
    >
      <Dashboard />
    </SWRConfig>
  );
}
```

### 请求去重

```jsx
function RequestDeduplication() {
  // 多个组件同时请求相同数据
  // SWR会自动去重,只发起一个请求
  
  return (
    <div>
      <UserProfile userId={123} />
      <UserStats userId={123} />
      <UserPosts userId={123} />
    </div>
  );
}

function UserProfile({ userId }) {
  const { data } = useSWR(`/api/user/${userId}`, fetcher);
  return <div>{data?.name}</div>;
}

function UserStats({ userId }) {
  const { data } = useSWR(`/api/user/${userId}`, fetcher);
  return <div>Posts: {data?.postCount}</div>;
}

function UserPosts({ userId }) {
  const { data } = useSWR(`/api/user/${userId}`, fetcher);
  return <div>Followers: {data?.followerCount}</div>;
}

// 配置去重间隔
useSWR('/api/user', fetcher, {
  dedupingInterval: 2000, // 2秒内相同请求只发起一次
});
```

## 缓存持久化

### LocalStorage持久化

```jsx
function localStorageProvider() {
  const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'));
  
  // 在卸载前将缓存写入localStorage
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('app-cache', appCache);
  });
  
  return map;
}

function App() {
  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      <Dashboard />
    </SWRConfig>
  );
}
```

### IndexedDB持久化

```jsx
class IndexedDBCache {
  constructor() {
    this.dbName = 'swr-cache';
    this.storeName = 'cache';
    this.db = null;
    this.initDB();
  }
  
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  
  async get(key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async set(key, value) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

function indexedDBProvider() {
  return new IndexedDBCache();
}

function App() {
  return (
    <SWRConfig value={{ provider: indexedDBProvider }}>
      <Dashboard />
    </SWRConfig>
  );
}
```

### 带过期时间的缓存

```jsx
class CacheWithExpiry {
  constructor(ttl = 5 * 60 * 1000) { // 默认5分钟
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
    return this.cache;
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    return this.cache.clear();
  }
  
  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

function cacheWithExpiryProvider() {
  const cache = new CacheWithExpiry(5 * 60 * 1000);
  
  // 定期清理过期缓存
  setInterval(() => cache.cleanup(), 60 * 1000);
  
  return cache;
}

function App() {
  return (
    <SWRConfig value={{ provider: cacheWithExpiryProvider }}>
      <Dashboard />
    </SWRConfig>
  );
}
```

## 缓存操作

### 读取缓存

```jsx
import { cache } from 'swr';
import { useSWRConfig } from 'swr';

// 方式1: 直接访问cache
function DirectCacheAccess() {
  useEffect(() => {
    const cachedUser = cache.get('/api/user');
    console.log('Cached user:', cachedUser);
  }, []);
  
  return <div>Check console</div>;
}

// 方式2: 使用useSWRConfig
function ConfigCacheAccess() {
  const { cache } = useSWRConfig();
  
  useEffect(() => {
    const cachedUser = cache.get('/api/user');
    console.log('Cached user:', cachedUser);
  }, [cache]);
  
  return <div>Check console</div>;
}

// 遍历所有缓存
function ListAllCache() {
  const { cache } = useSWRConfig();
  const [cacheKeys, setCacheKeys] = useState([]);
  
  useEffect(() => {
    const keys = [];
    for (const key of cache.keys()) {
      keys.push(key);
    }
    setCacheKeys(keys);
  }, [cache]);
  
  return (
    <ul>
      {cacheKeys.map(key => (
        <li key={key}>{key}</li>
      ))}
    </ul>
  );
}
```

### 更新缓存

```jsx
import { mutate } from 'swr';
import { useSWRConfig } from 'swr';

// 方式1: 导入mutate
function UpdateCacheImport() {
  const handleUpdate = async () => {
    // 更新缓存并重新验证
    await mutate('/api/user');
    
    // 更新缓存为特定值
    mutate('/api/user', { id: 1, name: 'New Name' }, false);
    
    // 乐观更新
    mutate('/api/user', updateUser({ name: 'New Name' }), {
      optimisticData: { id: 1, name: 'New Name' },
      rollbackOnError: true,
    });
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}

// 方式2: 使用Hook中的mutate
function UpdateCacheHook() {
  const { data, mutate } = useSWR('/api/user', fetcher);
  
  const handleUpdate = () => {
    mutate(); // 重新验证
    
    mutate({ ...data, name: 'New Name' }, false); // 更新缓存
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}

// 方式3: 使用useSWRConfig
function UpdateCacheConfig() {
  const { mutate } = useSWRConfig();
  
  const handleUpdate = () => {
    mutate('/api/user');
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}
```

### 清除缓存

```jsx
import { cache } from 'swr';
import { mutate } from 'swr';

// 清除单个缓存
function clearSingleCache(key) {
  cache.delete(key);
}

// 清除所有缓存
function clearAllCache() {
  cache.clear();
}

// 清除匹配的缓存
function clearMatchingCache(pattern) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// 清除并重新验证
function clearAndRevalidate(key) {
  cache.delete(key);
  mutate(key);
}

// 使用示例
function CacheClearExample() {
  const { cache, mutate } = useSWRConfig();
  
  const handleClearUser = () => {
    cache.delete('/api/user');
  };
  
  const handleClearAll = () => {
    cache.clear();
  };
  
  const handleClearUserCache = () => {
    // 清除所有用户相关缓存
    for (const key of cache.keys()) {
      if (key.startsWith('/api/user')) {
        cache.delete(key);
      }
    }
  };
  
  const handleLogout = () => {
    // 登出时清除所有缓存
    cache.clear();
    
    // 或者清除特定缓存并跳转
    cache.delete('/api/user');
    window.location.href = '/login';
  };
  
  return (
    <div>
      <button onClick={handleClearUser}>Clear User Cache</button>
      <button onClick={handleClearAll}>Clear All Cache</button>
      <button onClick={handleClearUserCache}>Clear User Related</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## 缓存预热

### 预填充缓存

```jsx
import { SWRConfig } from 'swr';

function App({ initialData }) {
  return (
    <SWRConfig
      value={{
        fallback: {
          '/api/user': initialData.user,
          '/api/posts': initialData.posts,
        },
      }}
    >
      <Dashboard />
    </SWRConfig>
  );
}

// 在Next.js中使用
export async function getStaticProps() {
  const user = await fetchUser();
  const posts = await fetchPosts();
  
  return {
    props: {
      initialData: {
        user,
        posts,
      },
    },
  };
}
```

### 预加载数据

```jsx
import { mutate } from 'swr';

// 预加载函数
function preload(key, fetcher) {
  // 不阻塞渲染,异步更新缓存
  mutate(
    key,
    fetcher(key),
    { revalidate: false }
  );
}

// 路由预加载
function Navigation() {
  const router = useRouter();
  
  const handleMouseEnter = (path) => {
    // 预加载路由数据
    preload(`/api${path}`, fetcher);
    
    // 预加载路由组件(Next.js)
    router.prefetch(path);
  };
  
  return (
    <nav>
      <Link
        href="/dashboard"
        onMouseEnter={() => handleMouseEnter('/dashboard')}
      >
        Dashboard
      </Link>
      
      <Link
        href="/profile"
        onMouseEnter={() => handleMouseEnter('/profile')}
      >
        Profile
      </Link>
    </nav>
  );
}

// 列表项预加载
function UserList() {
  const { data: users } = useSWR('/api/users', fetcher);
  
  const handleItemHover = (userId) => {
    preload(`/api/user/${userId}`, fetcher);
  };
  
  return (
    <ul>
      {users?.map(user => (
        <li
          key={user.id}
          onMouseEnter={() => handleItemHover(user.id)}
        >
          <Link to={`/user/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

## 缓存同步

### 跨标签页同步

```jsx
import { useEffect } from 'react';
import { useSWRConfig } from 'swr';

function useCrossTabSync() {
  const { mutate } = useSWRConfig();
  
  useEffect(() => {
    // 监听storage事件
    const handleStorageChange = (e) => {
      if (e.key?.startsWith('swr-')) {
        const key = e.key.replace('swr-', '');
        mutate(key);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mutate]);
}

// 使用
function App() {
  useCrossTabSync();
  
  return <Dashboard />;
}
```

### BroadcastChannel同步

```jsx
function useBroadcastSync() {
  const { mutate } = useSWRConfig();
  
  useEffect(() => {
    const channel = new BroadcastChannel('swr-sync');
    
    channel.onmessage = (event) => {
      const { type, key, data } = event.data;
      
      if (type === 'mutate') {
        mutate(key, data, false);
      }
    };
    
    return () => {
      channel.close();
    };
  }, [mutate]);
  
  return (key, data) => {
    const channel = new BroadcastChannel('swr-sync');
    channel.postMessage({ type: 'mutate', key, data });
    channel.close();
  };
}

// 使用
function DataComponent() {
  const { data, mutate } = useSWR('/api/user', fetcher);
  const broadcast = useBroadcastSync();
  
  const handleUpdate = async (newData) => {
    await mutate(newData, false);
    broadcast('/api/user', newData);
  };
  
  return (
    <div>
      <p>{data?.name}</p>
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        Update
      </button>
    </div>
  );
}
```

## 缓存策略最佳实践

### 智能缓存更新

```jsx
function SmartCacheUpdate() {
  const { data: user, mutate: mutateUser } = useSWR('/api/user', fetcher);
  const { mutate: mutatePosts } = useSWRConfig();
  
  const handleUpdateProfile = async (updates) => {
    // 乐观更新用户信息
    mutateUser(
      async () => {
        const response = await fetch('/api/user', {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        return response.json();
      },
      {
        optimisticData: { ...user, ...updates },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
    
    // 如果更新了名字,也要更新相关的帖子缓存
    if (updates.name) {
      mutatePosts(
        key => key.startsWith('/api/posts'),
        undefined,
        { revalidate: true }
      );
    }
  };
  
  return (
    <div>
      <ProfileForm user={user} onSubmit={handleUpdateProfile} />
    </div>
  );
}
```

### 条件缓存

```jsx
function ConditionalCache() {
  const shouldCache = useMemo(() => {
    // 只缓存已登录用户的数据
    return !!localStorage.getItem('token');
  }, []);
  
  const { data } = useSWR(
    shouldCache ? '/api/user' : null,
    fetcher,
    {
      revalidateOnFocus: shouldCache,
      revalidateOnReconnect: shouldCache,
    }
  );
  
  return <div>{data?.name}</div>;
}
```

## 总结

SWR缓存策略要点：

1. **缓存机制**：Stale-While-Revalidate核心策略
2. **缓存键**：字符串、数组、对象、函数键
3. **缓存配置**：去重、持久化、过期时间
4. **缓存操作**：读取、更新、清除
5. **缓存预热**：预填充、预加载
6. **缓存同步**：跨标签页、BroadcastChannel
7. **最佳实践**：智能更新、条件缓存

合理使用SWR缓存策略可以显著提升应用性能和用户体验。
