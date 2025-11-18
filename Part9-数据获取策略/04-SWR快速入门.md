# SWR快速入门

## 概述

SWR (Stale-While-Revalidate) 是由Vercel开发的React Hooks数据获取库。它的名字来源于HTTP缓存失效策略stale-while-revalidate。SWR能够先从缓存返回数据(stale),然后发送请求(revalidate),最后得到最新数据,提供快速响应和自动更新的用户体验。

## 安装和配置

### 安装

```bash
# npm
npm install swr

# yarn
yarn add swr

# pnpm
pnpm add swr
```

### 基础配置

```jsx
import useSWR from 'swr';

// 定义fetcher函数
const fetcher = (url) => fetch(url).then(res => res.json());

function App() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load</div>;
  
  return <div>Hello {data.name}!</div>;
}
```

## 核心概念

### useSWR Hook

```jsx
import useSWR from 'swr';

function Profile() {
  const fetcher = (url) => fetch(url).then(r => r.json());
  
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    '/api/user/123',
    fetcher
  );
  
  console.log({
    data,           // 返回的数据
    error,          // 错误对象
    isLoading,      // 是否首次加载
    isValidating,   // 是否正在重新验证
    mutate,         // 手动触发重新验证的函数
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}
```

### Key模式

```jsx
// 字符串key
useSWR('/api/user', fetcher);

// 数组key(带参数)
useSWR(['/api/user', id], ([url, id]) => 
  fetch(`${url}/${id}`).then(r => r.json())
);

// 函数key
const getKey = (pageIndex, previousPageData) => {
  if (previousPageData && !previousPageData.length) return null;
  return `/api/users?page=${pageIndex}`;
};
useSWR(getKey, fetcher);

// 条件获取(null key不会发起请求)
const shouldFetch = user?.id;
useSWR(shouldFetch ? `/api/user/${user.id}` : null, fetcher);

// 依赖key
function UserProfile({ userId }) {
  const { data: user } = useSWR(`/api/user/${userId}`, fetcher);
  const { data: posts } = useSWR(
    user ? `/api/posts?author=${user.id}` : null,
    fetcher
  );
  
  return (
    <div>
      {user && <h1>{user.name}</h1>}
      {posts && (
        <ul>
          {posts.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Fetcher函数

### 基础Fetcher

```jsx
// 简单fetcher
const fetcher = url => fetch(url).then(r => r.json());

// 带错误处理的fetcher
const fetcher = async (url) => {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  
  return res.json();
};

// 使用Axios的fetcher
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);
```

### 带参数的Fetcher

```jsx
// 多参数fetcher
const fetcher = ([url, token]) => 
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

function Profile() {
  const token = localStorage.getItem('token');
  const { data } = useSWR(['/api/user', token], fetcher);
  
  return <div>{data?.name}</div>;
}

// GraphQL fetcher
const graphqlFetcher = (query, variables) => 
  fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }).then(res => res.json());

function UserComponent({ userId }) {
  const query = `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `;
  
  const { data } = useSWR(
    [query, { id: userId }],
    ([q, vars]) => graphqlFetcher(q, vars)
  );
  
  return <div>{data?.user?.name}</div>;
}
```

## 全局配置

### SWRConfig

```jsx
import { SWRConfig } from 'swr';

const fetcher = (url) => fetch(url).then(r => r.json());

function App() {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 3000,        // 每3秒重新验证
        revalidateOnFocus: true,      // 窗口聚焦时重新验证
        revalidateOnReconnect: true,  // 重新连接时重新验证
        dedupingInterval: 2000,       // 2秒内相同请求去重
        errorRetryCount: 3,           // 错误重试次数
        errorRetryInterval: 5000,     // 重试间隔
        shouldRetryOnError: true,     // 错误时是否重试
        onError: (error, key) => {
          console.error('SWR Error:', error, key);
        },
        onSuccess: (data, key) => {
          console.log('SWR Success:', data, key);
        },
      }}
    >
      <Dashboard />
    </SWRConfig>
  );
}
```

### 嵌套配置

```jsx
function App() {
  return (
    <SWRConfig value={{ refreshInterval: 3000 }}>
      <Dashboard />
      
      {/* 覆盖父级配置 */}
      <SWRConfig value={{ refreshInterval: 0, revalidateOnFocus: false }}>
        <Profile />
      </SWRConfig>
    </SWRConfig>
  );
}
```

## 数据更新

### 自动重新验证

```jsx
function AutoRevalidate() {
  const { data } = useSWR('/api/stats', fetcher, {
    // 窗口聚焦时重新验证
    revalidateOnFocus: true,
    
    // 重新连接时重新验证
    revalidateOnReconnect: true,
    
    // 定时重新验证(毫秒)
    refreshInterval: 5000,
    
    // 只在窗口可见时定时验证
    refreshWhenHidden: false,
    
    // 只在在线时定时验证
    refreshWhenOffline: false,
  });
  
  return <div>Stats: {data?.count}</div>;
}
```

### 手动重新验证

```jsx
function ManualRevalidate() {
  const { data, mutate } = useSWR('/api/user', fetcher);
  
  const handleRefresh = () => {
    // 重新验证数据
    mutate();
  };
  
  const handleUpdate = async () => {
    // 更新数据并重新验证
    await fetch('/api/user', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
    });
    
    mutate(); // 重新获取数据
  };
  
  return (
    <div>
      <p>{data?.name}</p>
      <button onClick={handleRefresh}>Refresh</button>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

## 条件获取

### 依赖数据获取

```jsx
function DependentFetching({ userId }) {
  // 先获取用户信息
  const { data: user } = useSWR(`/api/user/${userId}`, fetcher);
  
  // 基于用户信息获取项目列表
  const { data: projects } = useSWR(
    user ? `/api/projects?team=${user.teamId}` : null,
    fetcher
  );
  
  if (!user) return <div>Loading user...</div>;
  if (!projects) return <div>Loading projects...</div>;
  
  return (
    <div>
      <h1>{user.name}'s Projects</h1>
      <ul>
        {projects.map(project => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 条件启用

```jsx
function ConditionalFetching() {
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const { data, error } = useSWR(
    shouldFetch ? '/api/data' : null,
    fetcher
  );
  
  return (
    <div>
      <button onClick={() => setShouldFetch(true)}>
        Load Data
      </button>
      {data && <div>{JSON.stringify(data)}</div>}
      {error && <div>Error loading data</div>}
    </div>
  );
}
```

## 分页

### 基础分页

```jsx
function Pagination() {
  const [pageIndex, setPageIndex] = useState(0);
  
  const { data, error, isLoading } = useSWR(
    `/api/users?page=${pageIndex}&limit=10`,
    fetcher
  );
  
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error</div>}
      
      {data && (
        <>
          <ul>
            {data.users.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
          
          <div>
            <button
              disabled={pageIndex === 0}
              onClick={() => setPageIndex(pageIndex - 1)}
            >
              Previous
            </button>
            
            <span>Page {pageIndex + 1}</span>
            
            <button
              disabled={!data.hasMore}
              onClick={() => setPageIndex(pageIndex + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### useSWRInfinite

```jsx
import useSWRInfinite from 'swr/infinite';

function InfiniteList() {
  const getKey = (pageIndex, previousPageData) => {
    // 到达末尾
    if (previousPageData && !previousPageData.length) return null;
    
    // SWR key
    return `/api/users?page=${pageIndex}&limit=10`;
  };
  
  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(getKey, fetcher);
  
  const users = data ? data.flat() : [];
  const isLoadingMore = isValidating && data && typeof data[size - 1] !== 'undefined';
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 10);
  
  return (
    <div>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      
      {error && <div>Error loading data</div>}
      
      <button
        disabled={isLoadingMore || isReachingEnd}
        onClick={() => setSize(size + 1)}
      >
        {isLoadingMore
          ? 'Loading...'
          : isReachingEnd
          ? 'No More Data'
          : 'Load More'}
      </button>
    </div>
  );
}
```

## 预加载

### 预加载数据

```jsx
import { mutate } from 'swr';

function preload(key, fetcher) {
  mutate(key, fetcher(key), false);
}

function UserList() {
  const { data: users } = useSWR('/api/users', fetcher);
  
  const handleMouseEnter = (userId) => {
    // 鼠标悬停时预加载用户详情
    preload(`/api/user/${userId}`, fetcher);
  };
  
  return (
    <ul>
      {users?.map(user => (
        <li
          key={user.id}
          onMouseEnter={() => handleMouseEnter(user.id)}
        >
          <Link to={`/user/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}

function UserDetail({ userId }) {
  // 数据可能已被预加载
  const { data: user } = useSWR(`/api/user/${userId}`, fetcher);
  
  return <div>{user?.name}</div>;
}
```

### 路由预加载

```jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function LinkWithPreload({ href, children }) {
  const router = useRouter();
  
  const handleMouseEnter = () => {
    // 预加载路由和数据
    router.prefetch(href);
    preload(`/api${href}`, fetcher);
  };
  
  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

## 离线支持

### 离线缓存

```jsx
import useSWR from 'swr';

function OfflineSupport() {
  const { data, error } = useSWR('/api/user', fetcher, {
    // 重新连接时重新验证
    revalidateOnReconnect: true,
    
    // 离线时使用缓存
    revalidateIfStale: navigator.onLine,
    
    // 离线时不轮询
    refreshInterval: navigator.onLine ? 3000 : 0,
    
    // 错误重试
    shouldRetryOnError: navigator.onLine,
  });
  
  const isOffline = !navigator.onLine;
  
  return (
    <div>
      {isOffline && (
        <div className="offline-banner">
          You are offline. Showing cached data.
        </div>
      )}
      
      {error && <div>Error: {error.message}</div>}
      {data && <div>{data.name}</div>}
    </div>
  );
}
```

### 监听网络状态

```jsx
function NetworkAwareComponent() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const { data } = useSWR('/api/data', fetcher, {
    revalidateOnReconnect: true,
    refreshInterval: isOnline ? 3000 : 0,
  });
  
  return (
    <div>
      <div className={isOnline ? 'online' : 'offline'}>
        {isOnline ? 'Online' : 'Offline'}
      </div>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

## 错误处理

### 基础错误处理

```jsx
function ErrorHandling() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher, {
    onError: (error, key) => {
      console.error(`Error fetching ${key}:`, error);
      
      // 发送到错误追踪服务
      logErrorToService(error, key);
    },
    
    // 错误重试
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    
    // 自定义重试条件
    shouldRetryOnError: (error) => {
      // 只重试5xx错误
      return error.status >= 500;
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error.message}</p>
        {error.status && <p>Status: {error.status}</p>}
      </div>
    );
  }
  
  return <div>{data.name}</div>;
}
```

### 错误边界集成

```jsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SWRConfig value={{ fetcher }}>
        <Dashboard />
      </SWRConfig>
    </ErrorBoundary>
  );
}
```

## 总结

SWR核心特性：

1. **Hooks API**：简洁的useSWR Hook
2. **自动重新验证**：聚焦、重连、定时验证
3. **缓存策略**：Stale-While-Revalidate
4. **全局配置**：SWRConfig统一设置
5. **条件获取**：依赖数据、条件启用
6. **分页支持**：基础分页、无限滚动
7. **预加载**：数据预加载、路由预加载
8. **离线支持**：缓存使用、网络感知
9. **错误处理**：重试机制、错误边界

SWR提供了优雅的数据获取方案,特别适合需要实时数据和快速响应的应用。

## 第四部分：SWR高级应用

### 4.1 性能优化技巧

```jsx
// 1. 使用useSWRImmutable避免重新验证
import useSWRImmutable from 'swr/immutable';

function StaticData() {
  // 数据不会改变，不需要重新验证
  const { data } = useSWRImmutable('/api/static-config', fetcher);
  
  return <div>{JSON.stringify(data)}</div>;
}

// 2. 使用useSWRInfinite优化无限滚动
import useSWRInfinite from 'swr/infinite';

function OptimizedInfiniteList() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    return `/api/items?page=${pageIndex}&limit=20`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false, // 不重新验证第一页
    persistSize: true // 保持size状态
  });

  const items = data ? data.flatMap(page => page.items) : [];
  const isLoadingMore = isValidating && data && typeof data[size - 1] !== 'undefined';
  const isEmpty = data?.[0]?.items.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.hasMore);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      {!isReachingEnd && (
        <button 
          onClick={() => setSize(size + 1)}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? '加载中...' : '加载更多'}
        </button>
      )}
    </div>
  );
}

// 3. 依赖数据优化
function DependentData() {
  const { data: user } = useSWR('/api/user', fetcher);
  
  // 只在user存在时才获取
  const { data: profile } = useSWR(
    user ? `/api/users/${user.id}/profile` : null,
    fetcher
  );

  // 使用fallbackData避免闪烁
  const { data: settings } = useSWR(
    user ? `/api/users/${user.id}/settings` : null,
    fetcher,
    {
      fallbackData: { theme: 'light', language: 'zh' }
    }
  );

  return <div>...</div>;
}

// 4. 并行请求优化
function ParallelRequests() {
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: posts } = useSWR('/api/posts', fetcher);
  const { data: comments } = useSWR('/api/comments', fetcher);

  // 使用Promise.all预加载
  useEffect(() => {
    Promise.all([
      fetcher('/api/user'),
      fetcher('/api/posts'),
      fetcher('/api/comments')
    ]).then(([userData, postsData, commentsData]) => {
      // 数据预填充到缓存
      mutate('/api/user', userData, false);
      mutate('/api/posts', postsData, false);
      mutate('/api/comments', commentsData, false);
    });
  }, []);

  return <div>...</div>;
}

// 5. 智能预加载
function SmartPrefetch() {
  const [hoveredId, setHoveredId] = useState(null);

  // 鼠标悬停时预加载
  const handleMouseEnter = (id) => {
    setHoveredId(id);
    mutate(`/api/items/${id}`, fetcher(`/api/items/${id}`), false);
  };

  return (
    <div>
      {items.map(item => (
        <div 
          key={item.id}
          onMouseEnter={() => handleMouseEnter(item.id)}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### 4.2 数据同步策略

```jsx
// 1. 跨标签页同步
import { useSWRConfig } from 'swr';

function CrossTabSync() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    // 监听storage事件实现跨标签页同步
    const handleStorage = (e) => {
      if (e.key?.startsWith('swr-')) {
        const key = e.key.replace('swr-', '');
        mutate(key);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [mutate]);

  return <div>跨标签页数据同步</div>;
}

// 2. WebSocket实时更新
function RealtimeSync() {
  const { data, mutate } = useSWR('/api/messages', fetcher);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // 乐观更新
      mutate(
        (currentData) => [...(currentData || []), message],
        { revalidate: false }
      );
    };

    return () => ws.close();
  }, [mutate]);

  return (
    <div>
      {data?.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}

// 3. 轮询优化
function OptimizedPolling() {
  const [isActive, setIsActive] = useState(true);

  const { data } = useSWR(
    '/api/status',
    fetcher,
    {
      refreshInterval: isActive ? 1000 : 0, // 根据状态调整轮询
      refreshWhenHidden: false, // 隐藏时停止轮询
      refreshWhenOffline: false, // 离线时停止轮询
      onSuccess: (data) => {
        // 根据数据决定是否继续轮询
        if (data.status === 'completed') {
          setIsActive(false);
        }
      }
    }
  );

  return <div>状态: {data?.status}</div>;
}

// 4. 增量更新
function IncrementalUpdate() {
  const { data, mutate } = useSWR('/api/feed', fetcher);

  const addItem = async (newItem) => {
    // 乐观添加
    mutate(
      (currentData) => [newItem, ...(currentData || [])],
      false
    );

    try {
      await fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
      
      // 成功后重新验证
      mutate();
    } catch (error) {
      // 失败回滚
      mutate();
    }
  };

  return <div>...</div>;
}
```

### 4.3 缓存管理策略

```jsx
// 1. 自定义缓存提供者
import { SWRConfig } from 'swr';

function createCustomCache() {
  const cache = new Map();
  const listeners = new Set();

  return {
    get(key) {
      return cache.get(key);
    },
    set(key, value) {
      cache.set(key, value);
      listeners.forEach(listener => listener());
    },
    delete(key) {
      cache.delete(key);
    },
    keys() {
      return Array.from(cache.keys());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function AppWithCustomCache() {
  const cache = useMemo(() => createCustomCache(), []);

  return (
    <SWRConfig value={{ provider: () => cache }}>
      <App />
    </SWRConfig>
  );
}

// 2. 持久化缓存
function PersistentCache() {
  const cache = useMemo(() => {
    const map = new Map();
    
    // 从localStorage恢复
    try {
      const saved = localStorage.getItem('swr-cache');
      if (saved) {
        const entries = JSON.parse(saved);
        entries.forEach(([key, value]) => map.set(key, value));
      }
    } catch (e) {
      console.error('Failed to restore cache', e);
    }

    // 定期保存
    const saveInterval = setInterval(() => {
      try {
        const entries = Array.from(map.entries());
        localStorage.setItem('swr-cache', JSON.stringify(entries));
      } catch (e) {
        console.error('Failed to save cache', e);
      }
    }, 5000);

    return {
      ...map,
      cleanup: () => clearInterval(saveInterval)
    };
  }, []);

  useEffect(() => {
    return () => cache.cleanup?.();
  }, [cache]);

  return (
    <SWRConfig value={{ provider: () => cache }}>
      <App />
    </SWRConfig>
  );
}

// 3. LRU缓存
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // 移到最后（最近使用）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  set(key, value) {
    // 如果存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 添加到最后
    this.cache.set(key, value);
    
    // 超出容量，删除最旧的
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  delete(key) {
    this.cache.delete(key);
  }

  keys() {
    return Array.from(this.cache.keys());
  }
}

// 使用LRU缓存
function AppWithLRUCache() {
  const cache = useMemo(() => new LRUCache(50), []);

  return (
    <SWRConfig value={{ provider: () => cache }}>
      <App />
    </SWRConfig>
  );
}

// 4. 缓存过期策略
function CacheWithExpiry() {
  const cache = useMemo(() => {
    const data = new Map();
    const expiry = new Map();

    return {
      get(key) {
        const expiryTime = expiry.get(key);
        if (expiryTime && Date.now() > expiryTime) {
          data.delete(key);
          expiry.delete(key);
          return undefined;
        }
        return data.get(key);
      },
      set(key, value, ttl = 60000) {
        data.set(key, value);
        expiry.set(key, Date.now() + ttl);
      },
      delete(key) {
        data.delete(key);
        expiry.delete(key);
      },
      keys() {
        // 清理过期数据
        expiry.forEach((time, key) => {
          if (Date.now() > time) {
            data.delete(key);
            expiry.delete(key);
          }
        });
        return Array.from(data.keys());
      }
    };
  }, []);

  return (
    <SWRConfig value={{ provider: () => cache }}>
      <App />
    </SWRConfig>
  );
}
```

### 4.4 错误处理增强

```jsx
// 1. 错误重试策略
function SmartRetry() {
  const { data, error } = useSWR('/api/data', fetcher, {
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // 404不重试
      if (error.status === 404) return;

      // 最多重试3次
      if (retryCount >= 3) return;

      // 指数退避
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      
      setTimeout(() => revalidate({ retryCount }), delay);
    }
  });

  return <div>...</div>;
}

// 2. 错误边界集成
class SWRErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>数据加载失败</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 3. 全局错误处理
function AppWithGlobalErrorHandler() {
  const handleError = useCallback((error, key) => {
    console.error('SWR Error:', error, 'Key:', key);
    
    // 发送到错误监控
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { swr: { key } }
      });
    }
    
    // 显示用户友好的错误消息
    toast.error(`数据加载失败: ${error.message}`);
  }, []);

  return (
    <SWRConfig value={{ onError: handleError }}>
      <App />
    </SWRConfig>
  );
}

// 4. 降级策略
function FallbackStrategy() {
  const { data, error } = useSWR('/api/primary', fetcher, {
    onError: async (err, key, config) => {
      // 主接口失败，尝试备用接口
      if (err.status >= 500) {
        try {
          const fallbackData = await fetcher('/api/fallback');
          mutate(key, fallbackData, false);
        } catch (fallbackError) {
          console.error('Fallback also failed', fallbackError);
        }
      }
    }
  });

  return <div>{data?.content || '加载中...'}</div>;
}
```

### 4.5 测试策略

```jsx
// 1. Mock SWR
import { SWRConfig } from 'swr';
import { render, screen } from '@testing-library/react';

function TestWrapper({ children, mockData }) {
  const mockCache = new Map();
  
  // 预填充mock数据
  Object.entries(mockData).forEach(([key, value]) => {
    mockCache.set(key, value);
  });

  return (
    <SWRConfig value={{ 
      provider: () => mockCache,
      dedupingInterval: 0 
    }}>
      {children}
    </SWRConfig>
  );
}

// 使用
test('renders user data', () => {
  const mockData = {
    '/api/user': { name: 'Alice', email: 'alice@example.com' }
  };

  render(
    <TestWrapper mockData={mockData}>
      <UserProfile />
    </TestWrapper>
  );

  expect(screen.getByText('Alice')).toBeInTheDocument();
});

// 2. 测试加载状态
test('shows loading state', async () => {
  let resolvePromise;
  const promise = new Promise(resolve => {
    resolvePromise = resolve;
  });

  const fetcher = () => promise;

  render(
    <SWRConfig value={{ fetcher }}>
      <DataComponent />
    </SWRConfig>
  );

  expect(screen.getByText('加载中...')).toBeInTheDocument();

  resolvePromise({ data: 'test' });
  
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});

// 3. 测试错误处理
test('handles errors correctly', async () => {
  const fetcher = jest.fn().mockRejectedValue(new Error('Failed'));

  render(
    <SWRConfig value={{ fetcher }}>
      <DataComponent />
    </SWRConfig>
  );

  await waitFor(() => {
    expect(screen.getByText('加载失败')).toBeInTheDocument();
  });
});

// 4. 测试乐观更新
test('optimistic update works', async () => {
  const { result } = renderHook(() => useSWR('/api/todo', fetcher));

  await waitFor(() => expect(result.current.data).toBeDefined());

  act(() => {
    result.current.mutate({ completed: true }, false);
  });

  expect(result.current.data.completed).toBe(true);
});
```

### 4.6 实战最佳实践

```jsx
// 综合实战案例
function ComprehensiveSWRApp() {
  return (
    <SWRConfig value={{
      // 全局配置
      fetcher: (url) => fetch(url).then(r => r.json()),
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      
      // 性能优化
      suspense: false,
      loadingTimeout: 3000,
      
      // 错误处理
      onError: (error, key) => {
        console.error('SWR Error:', error, key);
        if (error.status !== 403 && error.status !== 404) {
          // 发送错误到监控
          errorReporting.notify(error);
        }
      },
      
      // 自定义缓存
      provider: () => new LRUCache(100),
      
      // 重试策略
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (error.status === 404) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 
          Math.min(1000 * Math.pow(2, retryCount), 30000)
        );
      }
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </SWRConfig>
  );
}
```

## SWR完整最佳实践

### 核心要点
```
1. 性能优化
   ✅ useSWRImmutable静态数据
   ✅ 智能预加载
   ✅ 并行请求优化
   ✅ 依赖数据处理

2. 数据同步
   ✅ 跨标签页同步
   ✅ WebSocket实时更新
   ✅ 轮询优化
   ✅ 增量更新

3. 缓存管理
   ✅ 自定义缓存提供者
   ✅ 持久化缓存
   ✅ LRU策略
   ✅ 过期控制

4. 错误处理
   ✅ 智能重试
   ✅ 错误边界
   ✅ 全局处理
   ✅ 降级策略

5. 测试
   ✅ Mock数据
   ✅ 加载状态测试
   ✅ 错误处理测试
   ✅ 乐观更新测试
```

SWR凭借其简洁的API和强大的功能，是React数据获取的优秀选择。
