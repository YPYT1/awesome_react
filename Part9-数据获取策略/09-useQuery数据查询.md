# useQuery数据查询

## 概述

useQuery是TanStack Query中最核心的Hook,用于获取和缓存异步数据。它提供了强大的缓存策略、自动重新获取、后台更新等功能。本文将深入探讨useQuery的高级用法和最佳实践。

## 查询函数(Query Function)

### 基础查询函数

```jsx
import { useQuery } from '@tanstack/react-query';

// 简单的查询函数
const fetchUser = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  return response.json();
};

function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.name}</div>;
}
```

### 使用QueryFunctionContext

```jsx
// 查询函数接收context参数
const fetchUser = async ({ queryKey, signal }) => {
  const [, userId] = queryKey;
  
  const response = await fetch(`/api/users/${userId}`, {
    signal, // AbortController signal用于取消请求
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
};

function UserProfile({ userId }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: fetchUser,
  });
  
  return <div>{data?.name}</div>;
}

// 完整的context
const fetchWithFullContext = async (context) => {
  const {
    queryKey,      // 查询键
    signal,        // AbortSignal
    meta,          // 查询元数据
    pageParam,     // 无限查询的页面参数
  } = context;
  
  console.log('Query context:', context);
  
  const response = await fetch(`/api/data`, { signal });
  return response.json();
};
```

### 错误处理

```jsx
// 自定义错误类
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const fetchData = async () => {
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(
      errorData.message || 'Request failed',
      response.status,
      errorData
    );
  }
  
  return response.json();
};

function DataComponent() {
  const { data, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
  
  if (error) {
    return (
      <div className="error">
        <h3>Error {error.status}</h3>
        <p>{error.message}</p>
        {error.data && <pre>{JSON.stringify(error.data, null, 2)}</pre>}
      </div>
    );
  }
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## 缓存配置

### StaleTime和CacheTime

```jsx
function CacheConfig() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    
    // staleTime: 数据保持"新鲜"的时间
    // 在此期间不会重新获取数据
    staleTime: 1000 * 60 * 5, // 5分钟
    
    // cacheTime: 缓存保留时间
    // 未使用的查询在此时间后被垃圾回收
    cacheTime: 1000 * 60 * 10, // 10分钟
  });
  
  return <div>{JSON.stringify(data)}</div>;
}

// 永不过期
function NeverStale() {
  const { data } = useQuery({
    queryKey: ['static-data'],
    queryFn: fetchStaticData,
    staleTime: Infinity,  // 永不过期
    cacheTime: Infinity,  // 永不清除缓存
  });
  
  return <div>{JSON.stringify(data)}</div>;
}

// 总是重新获取
function AlwaysRefetch() {
  const { data } = useQuery({
    queryKey: ['realtime-data'],
    queryFn: fetchRealtimeData,
    staleTime: 0,         // 立即过期
    cacheTime: 0,         // 不缓存
    refetchInterval: 1000, // 每秒refetch
  });
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 重新获取配置

```jsx
function RefetchConfig() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    
    // 窗口聚焦时重新获取
    refetchOnWindowFocus: true,
    
    // 组件挂载时重新获取
    refetchOnMount: true, // true | false | 'always'
    
    // 网络重连时重新获取
    refetchOnReconnect: true,
    
    // 定时重新获取(毫秒)
    refetchInterval: false, // false | number
    
    // 窗口不可见时是否继续定时refetch
    refetchIntervalInBackground: false,
  });
  
  return <div>{JSON.stringify(data)}</div>;
}

// 智能refetch
function SmartRefetch() {
  const [isImportant, setIsImportant] = useState(false);
  
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    
    // 只在重要时refetch
    refetchOnWindowFocus: isImportant,
    
    // 动态refetch间隔
    refetchInterval: isImportant ? 1000 : false,
  });
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isImportant}
          onChange={(e) => setIsImportant(e.target.checked)}
        />
        Important Data
      </label>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
```

## 重试机制

### 重试配置

```jsx
function RetryConfig() {
  const { data, error, failureCount } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    
    // 重试次数
    retry: 3,
    
    // 重试延迟(指数退避)
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // 自定义重试条件
    retryOnMount: true,
  });
  
  if (error) {
    return (
      <div>
        <p>Failed after {failureCount} attempts</p>
        <p>Error: {error.message}</p>
      </div>
    );
  }
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 条件重试

```jsx
function ConditionalRetry() {
  const { data, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    
    // 基于错误类型决定是否重试
    retry: (failureCount, error) => {
      // 不重试4xx错误
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      
      // 5xx错误最多重试3次
      if (error.status >= 500) {
        return failureCount < 3;
      }
      
      // 网络错误重试5次
      return failureCount < 5;
    },
    
    // 动态重试延迟
    retryDelay: (attemptIndex, error) => {
      // 429 Too Many Requests使用更长的延迟
      if (error.status === 429) {
        return Math.min(5000 * 2 ** attemptIndex, 60000);
      }
      
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });
  
  return <div>{data ? JSON.stringify(data) : error?.message}</div>;
}
```

## 初始数据和占位数据

### Initial Data

```jsx
import { useQueryClient } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    
    // 从其他查询获取初始数据
    initialData: () => {
      // 从用户列表查询中查找
      return queryClient
        .getQueryData(['users'])
        ?.find(user => user.id === userId);
    },
    
    // 初始数据的更新时间
    initialDataUpdatedAt: () => {
      return queryClient.getQueryState(['users'])?.dataUpdatedAt;
    },
  });
  
  return <div>{data?.name}</div>;
}

// 从localStorage获取初始数据
function CachedData() {
  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    
    initialData: () => {
      const cached = localStorage.getItem('settings');
      return cached ? JSON.parse(cached) : undefined;
    },
    
    onSuccess: (data) => {
      localStorage.setItem('settings', JSON.stringify(data));
    },
  });
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### Placeholder Data

```jsx
function PlaceholderData() {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ['user', 123],
    queryFn: () => fetchUser(123),
    
    // 占位数据(不会被缓存)
    placeholderData: {
      id: 123,
      name: 'Loading...',
      email: 'loading@example.com',
    },
  });
  
  return (
    <div className={isPlaceholderData ? 'placeholder' : ''}>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}

// 从其他查询获取占位数据
function SmartPlaceholder({ userId }) {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    
    placeholderData: () => {
      const users = queryClient.getQueryData(['users']);
      return users?.find(user => user.id === userId);
    },
  });
  
  return <div>{data?.name}</div>;
}
```

## 数据转换

### Select选项

```jsx
function SelectTransform({ userId }) {
  const { data: userName } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    select: (user) => user.name,
  });
  
  return <h1>{userName}</h1>;
}

// 复杂转换
function ComplexTransform({ userId }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    select: (user) => ({
      fullName: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      age: new Date().getFullYear() - new Date(user.birthDate).getFullYear(),
      isAdult: user.age >= 18,
      posts: user.posts?.length || 0,
    }),
  });
  
  return (
    <div>
      <h1>{data?.fullName} ({data?.initials})</h1>
      <p>Age: {data?.age}</p>
      <p>Posts: {data?.posts}</p>
    </div>
  );
}

// Memoized选择器
function MemoizedSelect() {
  const selectTodos = useCallback(
    (data) => data.filter(todo => todo.completed),
    []
  );
  
  const { data: completedTodos } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select: selectTodos,
  });
  
  return (
    <ul>
      {completedTodos?.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

## 查询依赖

### 串行查询

```jsx
function SerialQueries({ userId }) {
  // 第一个查询
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  // 依赖第一个查询的结果
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchPosts(user.id),
    enabled: !!user,
  });
  
  // 依赖第二个查询的结果
  const { data: comments } = useQuery({
    queryKey: ['comments', posts?.[0]?.id],
    queryFn: () => fetchComments(posts[0].id),
    enabled: !!posts?.length,
  });
  
  return (
    <div>
      {user && <h1>{user.name}</h1>}
      {posts && <p>{posts.length} posts</p>}
      {comments && <p>{comments.length} comments</p>}
    </div>
  );
}
```

### 动态查询键

```jsx
function DynamicQueryKey() {
  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    search: '',
  });
  
  const { data } = useQuery({
    queryKey: ['items', filters],
    queryFn: () => fetchItems(filters),
  });
  
  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search..."
      />
      
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      
      <ul>
        {data?.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 查询取消

### 自动取消

```jsx
function AutoCancel() {
  const [userId, setUserId] = useState(1);
  
  const { data, isFetching } = useQuery({
    queryKey: ['user', userId],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/users/${userId}`, { signal });
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      
      return response.json();
    },
  });
  
  // 当userId改变时,之前的请求会自动取消
  
  return (
    <div>
      <button onClick={() => setUserId(prev => prev + 1)}>
        Next User
      </button>
      {isFetching && <div>Loading...</div>}
      {data && <div>{data.name}</div>}
    </div>
  );
}
```

### 手动取消

```jsx
import { useQueryClient } from '@tanstack/react-query';

function ManualCancel() {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/data', { signal });
      return response.json();
    },
  });
  
  const handleCancel = () => {
    // 取消所有查询
    queryClient.cancelQueries();
    
    // 取消特定查询
    queryClient.cancelQueries({ queryKey: ['data'] });
    
    // 取消匹配的查询
    queryClient.cancelQueries({ queryKey: ['users'] });
  };
  
  return (
    <div>
      <button onClick={handleCancel}>Cancel</button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

## 回调函数

### onSuccess, onError, onSettled

```jsx
function QueryCallbacks() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    
    onSuccess: (data) => {
      console.log('Query succeeded:', data);
      toast.success('Data loaded successfully');
      
      // 更新其他状态
      updateAnalytics('data_loaded', data);
    },
    
    onError: (error) => {
      console.error('Query failed:', error);
      toast.error(`Failed to load data: ${error.message}`);
      
      // 错误追踪
      trackError(error);
    },
    
    onSettled: (data, error) => {
      console.log('Query settled:', { data, error });
      
      // 无论成功失败都执行的逻辑
      hideLoadingSpinner();
    },
  });
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## 元数据

### Query Meta

```jsx
function QueryMeta() {
  const { data } = useQuery({
    queryKey: ['user', 123],
    queryFn: fetchUser,
    
    meta: {
      errorMessage: 'Failed to load user profile',
      requiresAuth: true,
      analytics: {
        category: 'user',
        action: 'fetch',
      },
    },
  });
  
  return <div>{data?.name}</div>;
}

// 在全局配置中使用meta
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error, query) => {
        const meta = query.meta;
        
        if (meta?.errorMessage) {
          toast.error(meta.errorMessage);
        }
        
        if (meta?.analytics) {
          trackEvent('query_error', meta.analytics);
        }
      },
    },
  },
});
```

## 总结

useQuery核心特性：

1. **查询函数**：异步数据获取、错误处理
2. **缓存配置**：staleTime、cacheTime控制
3. **重试机制**：智能重试、条件重试
4. **初始数据**：initialData、placeholderData
5. **数据转换**：select选项转换数据
6. **查询依赖**：串行查询、动态查询键
7. **查询取消**：自动取消、手动取消
8. **回调函数**：onSuccess、onError、onSettled
9. **元数据**：query meta自定义信息

useQuery提供了完整的数据查询解决方案,满足各种复杂场景需求。

## 第四部分：useQuery深度优化

### 4.1 查询重复数据删除

```jsx
// 1. 自动去重
function AutoDeduplication() {
  // 多个组件同时请求相同数据时，只发送一次请求
  const Component1 = () => {
    const { data } = useQuery({
      queryKey: ['user', 1],
      queryFn: () => fetchUser(1)
    });
    return <div>{data?.name}</div>;
  };

  const Component2 = () => {
    const { data } = useQuery({
      queryKey: ['user', 1],
      queryFn: () => fetchUser(1)
    });
    return <div>{data?.email}</div>;
  };

  return (
    <>
      <Component1 />
      <Component2 />
    </>
  );
}

// 2. 请求合并
function RequestBatching() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 批量触发多个查询
    const ids = [1, 2, 3, 4, 5];
    
    ids.forEach(id => {
      queryClient.prefetchQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id)
      });
    });
  }, [queryClient]);

  return <div>批量预取</div>;
}

// 3. DataLoader模式实现
class QueryDataLoader {
  constructor(batchFn, options = {}) {
    this.batchFn = batchFn;
    this.maxBatchSize = options.maxBatchSize || 100;
    this.batchScheduleFn = options.batchScheduleFn || (cb => setTimeout(cb, 0));
    
    this.queue = [];
    this.scheduled = false;
  }

  load(key) {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });
      
      if (!this.scheduled) {
        this.scheduled = true;
        this.batchScheduleFn(() => this.dispatch());
      }
    });
  }

  dispatch() {
    const queue = this.queue;
    this.queue = [];
    this.scheduled = false;

    const keys = queue.map(item => item.key);
    
    this.batchFn(keys)
      .then(results => {
        queue.forEach((item, index) => {
          item.resolve(results[index]);
        });
      })
      .catch(error => {
        queue.forEach(item => item.reject(error));
      });
  }
}

// 使用DataLoader
const userLoader = new QueryDataLoader(async (ids) => {
  const response = await fetch(`/api/users?ids=${ids.join(',')}`);
  return response.json();
});

function useUserQuery(id) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userLoader.load(id)
  });
}
```

### 4.2 查询轮询优化

```jsx
// 1. 智能轮询
function SmartPolling() {
  const [isActive, setIsActive] = useState(true);
  const [interval, setInterval] = useState(5000);

  const { data } = useQuery({
    queryKey: ['realtime-data'],
    queryFn: fetchRealtimeData,
    refetchInterval: isActive ? interval : false,
    refetchIntervalInBackground: false
  });

  useEffect(() => {
    // 根据数据变化调整轮询间隔
    if (data?.changeRate === 'high') {
      setInterval(1000);
    } else if (data?.changeRate === 'medium') {
      setInterval(5000);
    } else {
      setInterval(30000);
    }
  }, [data?.changeRate]);

  return <div>{JSON.stringify(data)}</div>;
}

// 2. 条件轮询
function ConditionalPolling() {
  const { data, refetch } = useQuery({
    queryKey: ['task-status'],
    queryFn: fetchTaskStatus,
    refetchInterval: (data) => {
      // 任务完成后停止轮询
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      
      // 根据任务状态调整间隔
      if (data?.status === 'processing') {
        return 1000; // 处理中，快速轮询
      }
      
      return 5000; // 默认间隔
    }
  });

  return <div>任务状态: {data?.status}</div>;
}

// 3. 可见性轮询
function VisibilityBasedPolling() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { data } = useQuery({
    queryKey: ['live-data'],
    queryFn: fetchLiveData,
    refetchInterval: isVisible ? 2000 : false,
    refetchOnWindowFocus: true
  });

  return <div>{JSON.stringify(data)}</div>;
}

// 4. 长轮询实现
function LongPolling() {
  const { data } = useQuery({
    queryKey: ['long-poll'],
    queryFn: async () => {
      const response = await fetch('/api/long-poll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Poll failed');
      return response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: true,
    retryDelay: 1000,
    // 使用onSettled实现连续轮询
    onSettled: (data, error) => {
      if (!error) {
        // 立即触发下一次轮询
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['long-poll'] });
        }, 100);
      }
    }
  });

  return <div>{JSON.stringify(data)}</div>;
}
```

### 4.3 查询结果合并

```jsx
// 1. 合并多个查询结果
function MergeQueries() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  });

  // 合并结果
  const mergedData = useMemo(() => {
    if (!user || !profile || !settings) return null;
    
    return {
      ...user,
      profile,
      settings
    };
  }, [user, profile, settings]);

  return <div>{JSON.stringify(mergedData)}</div>;
}

// 2. 使用useQueries批量查询和合并
function BatchQueriesWithMerge({ userIds }) {
  const queries = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id)
    }))
  });

  // 合并所有用户数据
  const allUsers = useMemo(() => {
    return queries
      .filter(q => q.data)
      .map(q => q.data);
  }, [queries]);

  const isLoading = queries.some(q => q.isLoading);
  const hasError = queries.some(q => q.isError);

  if (isLoading) return <div>加载中...</div>;
  if (hasError) return <div>加载失败</div>;

  return (
    <div>
      {allUsers.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// 3. 级联查询合并
function CascadingMerge() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const productQueries = useQueries({
    queries: (categories || []).map(category => ({
      queryKey: ['products', category.id],
      queryFn: () => fetchProducts(category.id),
      enabled: !!category
    }))
  });

  const allProducts = useMemo(() => {
    return productQueries
      .filter(q => q.data)
      .flatMap(q => q.data);
  }, [productQueries]);

  return (
    <div>
      {allProducts.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 4.4 查询数据规范化

```jsx
import { normalize, schema } from 'normalizr';

// 1. 定义Schema
const userSchema = new schema.Entity('users');
const commentSchema = new schema.Entity('comments', {
  author: userSchema
});
const postSchema = new schema.Entity('posts', {
  author: userSchema,
  comments: [commentSchema]
});

// 2. 规范化查询结果
function NormalizedQuery() {
  const { data, ...queryInfo } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    select: (data) => {
      // 规范化数据
      const normalized = normalize(data, [postSchema]);
      return normalized;
    }
  });

  // data结构：
  // {
  //   entities: {
  //     users: { '1': {...}, '2': {...} },
  //     comments: { '1': {...}, '2': {...} },
  //     posts: { '1': {...}, '2': {...} }
  //   },
  //   result: [1, 2]
  // }

  return <div>{JSON.stringify(data)}</div>;
}

// 3. 使用规范化数据
function UseNormalizedData() {
  const { data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    select: (data) => normalize(data, [postSchema])
  });

  const getPost = (id) => data?.entities.posts[id];
  const getUser = (id) => data?.entities.users[id];
  const getComment = (id) => data?.entities.comments[id];

  return (
    <div>
      {data?.result.map(postId => {
        const post = getPost(postId);
        const author = getUser(post.author);
        
        return (
          <div key={postId}>
            <h3>{post.title}</h3>
            <p>作者: {author.name}</p>
            <div>
              {post.comments.map(commentId => {
                const comment = getComment(commentId);
                const commentAuthor = getUser(comment.author);
                
                return (
                  <div key={commentId}>
                    {commentAuthor.name}: {comment.text}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4. 更新规范化数据
function UpdateNormalizedData() {
  const queryClient = useQueryClient();

  const updateUser = (userId, updates) => {
    queryClient.setQueryData(['posts'], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        entities: {
          ...oldData.entities,
          users: {
            ...oldData.entities.users,
            [userId]: {
              ...oldData.entities.users[userId],
              ...updates
            }
          }
        }
      };
    });
  };

  return <button onClick={() => updateUser(1, { name: 'New Name' })}>更新用户</button>;
}
```

### 4.5 查询错误边界

```jsx
// 1. 错误边界组件
class QueryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Query Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>查询出错</div>;
    }

    return this.props.children;
  }
}

// 2. 使用错误边界
function QueryWithErrorBoundary() {
  return (
    <QueryErrorBoundary fallback={<div>数据加载失败</div>}>
      <DataComponent />
    </QueryErrorBoundary>
  );
}

// 3. useErrorHandler Hook
function useErrorHandler() {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

function QueryWithErrorHandler() {
  const throwError = useErrorHandler();

  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    onError: (error) => {
      throwError(error);
    },
    useErrorBoundary: true // TanStack Query v4+
  });

  return <div>{JSON.stringify(data)}</div>;
}

// 4. 错误重试边界
function ErrorRetryBoundary({ children }) {
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  return (
    <QueryErrorBoundary
      key={retryCount}
      fallback={
        <div>
          <p>加载失败</p>
          <button onClick={handleRetry}>重试</button>
        </div>
      }
    >
      {children}
    </QueryErrorBoundary>
  );
}
```

### 4.6 查询性能监控

```jsx
// 1. 查询性能追踪
function QueryPerformanceTracker() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        const { queryKey, state } = event.query;
        
        // 记录查询性能
        if (state.dataUpdatedAt && state.dataUpdatedAt > 0) {
          const duration = state.dataUpdatedAt - (state.fetchMeta?.fetchedAt || 0);
          
          console.log('Query Performance:', {
            key: queryKey,
            duration,
            status: state.status,
            fetchStatus: state.fetchStatus
          });

          // 发送到分析服务
          if (duration > 1000) {
            analytics.track('slow_query', {
              queryKey: JSON.stringify(queryKey),
              duration
            });
          }
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return null;
}

// 2. 查询缓存命中率
class QueryCacheAnalytics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
  }

  trackQuery(wasCached) {
    if (wasCached) {
      this.hits++;
    } else {
      this.misses++;
    }
  }

  getHitRate() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
  }
}

const cacheAnalytics = new QueryCacheAnalytics();

function useQueryWithAnalytics(options) {
  const result = useQuery({
    ...options,
    onSuccess: (data) => {
      cacheAnalytics.trackQuery(result.isFetching === false);
      options.onSuccess?.(data);
    }
  });

  return result;
}

// 3. 查询监控面板
function QueryMonitoringDashboard() {
  const queryClient = useQueryClient();
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cache = queryClient.getQueryCache();
      const allQueries = cache.getAll();
      
      setQueries(allQueries.map(query => ({
        key: JSON.stringify(query.queryKey),
        status: query.state.status,
        fetchStatus: query.state.fetchStatus,
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
        observersCount: query.getObserversCount()
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <div>
      <h3>查询监控面板</h3>
      <table>
        <thead>
          <tr>
            <th>查询键</th>
            <th>状态</th>
            <th>获取状态</th>
            <th>观察者数量</th>
            <th>最后更新</th>
          </tr>
        </thead>
        <tbody>
          {queries.map((query, index) => (
            <tr key={index}>
              <td>{query.key}</td>
              <td>{query.status}</td>
              <td>{query.fetchStatus}</td>
              <td>{query.observersCount}</td>
              <td>{new Date(query.dataUpdatedAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## useQuery高级实战模式

### 自定义useQuery Hooks

```jsx
// 1. 分页查询Hook
function usePaginatedQuery(queryKey, fetchFn, options = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.defaultPageSize || 10);

  const query = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => fetchFn({ page, pageSize }),
    keepPreviousData: true,
    ...options
  });

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const goToPage = (page) => setPage(page);

  return {
    ...query,
    page,
    pageSize,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: query.data?.hasMore,
    hasPrevPage: page > 1
  };
}

// 2. 带缓存策略的查询Hook
function useCachedQuery(queryKey, fetchFn, cacheStrategy = 'stale-while-revalidate') {
  const strategies = {
    'stale-while-revalidate': {
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
      refetchOnMount: true
    },
    'cache-first': {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,
      refetchOnMount: false
    },
    'network-only': {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true
    }
  };

  return useQuery({
    queryKey,
    queryFn: fetchFn,
    ...strategies[cacheStrategy]
  });
}

// 3. 自动重试查询Hook
function useRetryableQuery(queryKey, fetchFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn: fetchFn,
    retry: (failureCount, error) => {
      // 4xx错误不重试
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      // 最多重试3次
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // 指数退避
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    ...options
  });
}
```

useQuery是TanStack Query的核心，掌握其高级特性能够构建高性能、可维护的数据层。
