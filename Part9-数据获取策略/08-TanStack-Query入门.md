# TanStack Query入门

## 概述

TanStack Query (原React Query) 是一个强大的数据同步库,用于获取、缓存和更新React应用中的异步数据。它提供了开箱即用的缓存、重试、轮询等功能,被认为是React数据获取的最佳解决方案之一。本文将全面介绍TanStack Query的核心概念和使用方法。

## 安装和配置

### 安装

```bash
# npm
npm install @tanstack/react-query

# yarn
yarn add @tanstack/react-query

# pnpm
pnpm add @tanstack/react-query
```

### 开发工具

```bash
# React Query Devtools
npm install @tanstack/react-query-devtools
```

### 基础配置

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5分钟
      cacheTime: 1000 * 60 * 10, // 10分钟
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      
      {/* 开发工具 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## useQuery - 查询数据

### 基础用法

```jsx
import { useQuery } from '@tanstack/react-query';

async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

function UserProfile({ userId }) {
  const {
    data,           // 查询数据
    error,          // 错误对象
    isLoading,      // 首次加载状态
    isFetching,     // 获取数据状态(包括后台refetch)
    isError,        // 是否有错误
    isSuccess,      // 是否成功
    status,         // 状态: 'pending' | 'error' | 'success'
    refetch,        // 手动refetch函数
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
      <button onClick={() => refetch()}>Refresh</button>
      {isFetching && <span>Updating...</span>}
    </div>
  );
}
```

### Query Key

```jsx
// 字符串key
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});

// 数组key(带参数)
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// 对象参数
useQuery({
  queryKey: ['posts', { status: 'published', page: 1 }],
  queryFn: () => fetchPosts({ status: 'published', page: 1 }),
});

// 嵌套数组
useQuery({
  queryKey: ['users', userId, 'posts', { page: 1 }],
  queryFn: () => fetchUserPosts(userId, { page: 1 }),
});

// 使用queryKey中的参数
useQuery({
  queryKey: ['user', userId],
  queryFn: ({ queryKey }) => {
    const [, id] = queryKey;
    return fetchUser(id);
  },
});
```

### Query Options

```jsx
function UserProfile({ userId }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    
    // 缓存配置
    staleTime: 1000 * 60 * 5,      // 数据保持新鲜的时间(5分钟)
    cacheTime: 1000 * 60 * 10,     // 缓存保留时间(10分钟)
    
    // 重新获取配置
    refetchOnMount: true,           // 组件挂载时refetch
    refetchOnWindowFocus: true,     // 窗口聚焦时refetch
    refetchOnReconnect: true,       // 重新连接时refetch
    refetchInterval: 0,             // 定时refetch(毫秒)
    refetchIntervalInBackground: false, // 后台时是否定时refetch
    
    // 重试配置
    retry: 3,                       // 重试次数
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // 启用配置
    enabled: !!userId,              // 是否启用查询
    
    // 回调
    onSuccess: (data) => {
      console.log('Query success:', data);
    },
    onError: (error) => {
      console.error('Query error:', error);
    },
    onSettled: (data, error) => {
      console.log('Query settled:', data, error);
    },
    
    // 数据选择
    select: (data) => data.name,    // 转换返回数据
    
    // 占位数据
    placeholderData: { name: 'Loading...', email: '' },
    
    // 初始数据
    initialData: () => {
      return queryClient.getQueryData(['user', userId]);
    },
    initialDataUpdatedAt: () => {
      return queryClient.getQueryState(['user', userId])?.dataUpdatedAt;
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.name}</div>;
}
```

## 条件查询

### Enabled选项

```jsx
function UserPosts({ userId }) {
  // 先获取用户信息
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  // 只在用户数据存在时获取文章
  const { data: posts } = useQuery({
    queryKey: ['user', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!user, // 条件启用
  });
  
  if (!user) return <div>Loading user...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
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

### 依赖查询

```jsx
function DependentQueries({ userId }) {
  // 查询1: 获取用户
  const {
    data: user,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  // 查询2: 基于用户的团队ID获取团队
  const {
    data: team,
    isLoading: teamLoading,
  } = useQuery({
    queryKey: ['team', user?.teamId],
    queryFn: () => fetchTeam(user.teamId),
    enabled: !!user?.teamId,
  });
  
  // 查询3: 基于团队获取项目
  const {
    data: projects,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['projects', team?.id],
    queryFn: () => fetchProjects(team.id),
    enabled: !!team?.id,
  });
  
  if (userLoading) return <div>Loading user...</div>;
  if (teamLoading) return <div>Loading team...</div>;
  if (projectsLoading) return <div>Loading projects...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <h2>Team: {team?.name}</h2>
      <ul>
        {projects?.map(project => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 并行查询

### 多个useQuery

```jsx
function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });
  
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });
  
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
  
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <div>Views: {stats?.views}</div>
      <div>Notifications: {notifications?.length}</div>
    </div>
  );
}
```

### useQueries

```jsx
import { useQueries } from '@tanstack/react-query';

function UserList({ userIds }) {
  const userQueries = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id),
      staleTime: 1000 * 60 * 5,
    })),
  });
  
  const isLoading = userQueries.some(query => query.isLoading);
  const isError = userQueries.some(query => query.isError);
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading users</div>;
  
  return (
    <ul>
      {userQueries.map((query, index) => (
        <li key={userIds[index]}>
          {query.data?.name}
        </li>
      ))}
    </ul>
  );
}

// 动态数量的查询
function DynamicQueries({ filters }) {
  const queries = useQueries({
    queries: filters.map(filter => ({
      queryKey: ['items', filter],
      queryFn: () => fetchItems(filter),
    })),
    combine: (results) => {
      return {
        data: results.map(result => result.data),
        pending: results.some(result => result.isPending),
      };
    },
  });
  
  if (queries.pending) return <div>Loading...</div>;
  
  return (
    <div>
      {queries.data.map((items, index) => (
        <div key={index}>
          <h3>Filter {filters[index]}</h3>
          <ul>
            {items?.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## 分页

### 基础分页

```jsx
function PaginatedPosts() {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isFetching, isPreviousData } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    keepPreviousData: true, // 保持上一页数据直到新数据到达
    staleTime: 1000 * 60 * 5,
  });
  
  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul>
            {data.posts.map(post => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
          
          <div className="pagination">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            
            <span>Page {page}</span>
            
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={isPreviousData && !data?.hasMore}
            >
              Next
            </button>
          </div>
          
          {isFetching && <div className="fetching">Updating...</div>}
        </>
      )}
    </div>
  );
}
```

### 预取下一页

```jsx
import { useQueryClient } from '@tanstack/react-query';

function PaginatedWithPrefetch() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    keepPreviousData: true,
  });
  
  // 预取下一页
  useEffect(() => {
    if (data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page + 1],
        queryFn: () => fetchPosts(page + 1),
      });
    }
  }, [data, page, queryClient]);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <ul>
        {data.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      
      <button
        onClick={() => setPage(prev => prev - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      
      <button
        onClick={() => setPage(prev => prev + 1)}
        disabled={!data.hasMore}
      >
        Next
      </button>
    </div>
  );
}
```

## 数据转换

### Select选项

```jsx
function UserName({ userId }) {
  const { data: userName } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    select: (user) => user.name, // 只返回name字段
  });
  
  return <h1>{userName}</h1>;
}

// 复杂转换
function UserStats({ userId }) {
  const { data: stats } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    select: (user) => ({
      fullName: `${user.firstName} ${user.lastName}`,
      age: calculateAge(user.birthDate),
      postsCount: user.posts?.length || 0,
      isActive: user.lastLoginAt > Date.now() - 7 * 24 * 60 * 60 * 1000,
    }),
  });
  
  return (
    <div>
      <h1>{stats?.fullName}</h1>
      <p>Age: {stats?.age}</p>
      <p>Posts: {stats?.postsCount}</p>
      <p>Status: {stats?.isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}

// 数组过滤
function ActiveUsers() {
  const { data: activeUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (users) => users.filter(user => user.active),
  });
  
  return (
    <ul>
      {activeUsers?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## 查询状态

### 状态标志

```jsx
function QueryStates() {
  const { status, fetchStatus, data, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
  
  // status: 'pending' | 'error' | 'success'
  // fetchStatus: 'fetching' | 'paused' | 'idle'
  
  console.log({
    status,
    fetchStatus,
    isPending: status === 'pending',
    isError: status === 'error',
    isSuccess: status === 'success',
    isFetching: fetchStatus === 'fetching',
    isPaused: fetchStatus === 'paused',
    isIdle: fetchStatus === 'idle',
  });
  
  if (status === 'pending') {
    return <div>Loading...</div>;
  }
  
  if (status === 'error') {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 组合状态

```jsx
function CombinedStates() {
  const query = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
  
  // 首次加载
  if (query.isLoading) {
    return <div>Loading for the first time...</div>;
  }
  
  // 后台更新
  if (query.isFetching && !query.isLoading) {
    return (
      <div>
        <div>{JSON.stringify(query.data)}</div>
        <div className="updating">Updating...</div>
      </div>
    );
  }
  
  // 错误但有缓存数据
  if (query.isError && query.data) {
    return (
      <div>
        <div>{JSON.stringify(query.data)}</div>
        <div className="error">Failed to update: {query.error.message}</div>
      </div>
    );
  }
  
  // 纯错误
  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }
  
  // 成功
  return <div>{JSON.stringify(query.data)}</div>;
}
```

## 手动触发

### Refetch

```jsx
function ManualRefetch() {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    enabled: false, // 禁用自动获取
  });
  
  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? 'Loading...' : 'Load Data'}
      </button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}

// 条件refetch
function ConditionalRefetch() {
  const { data, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });
  
  const handleRefresh = async () => {
    const result = await refetch();
    
    if (result.isError) {
      console.error('Refetch failed:', result.error);
    } else {
      console.log('Refetch success:', result.data);
    }
  };
  
  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

## 总结

TanStack Query核心特性：

1. **useQuery**：声明式数据获取
2. **Query Key**：唯一标识和缓存键
3. **Query Options**：灵活的配置选项
4. **条件查询**：依赖查询、enabled选项
5. **并行查询**：useQueries批量查询
6. **分页**：keepPreviousData、预取
7. **数据转换**：select选项转换数据
8. **状态管理**：完整的加载和错误状态
9. **手动触发**：refetch按需获取

TanStack Query是React数据获取的强大工具,提供了完整的缓存和状态管理解决方案。

## 第四部分：TanStack Query高级特性

### 4.1 查询键(Query Keys)深入

```jsx
// 1. 查询键最佳实践
const queryKeys = {
  // 简单键
  all: ['todos'] as const,
  
  // 列表键
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters) => [...queryKeys.lists(), filters] as const,
  
  // 详情键
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id) => [...queryKeys.details(), id] as const,
};

// 使用
function TodoList({ status }) {
  const { data } = useQuery({
    queryKey: queryKeys.list({ status }),
    queryFn: () => fetchTodos({ status })
  });
}

function TodoDetail({ id }) {
  const { data } = useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => fetchTodo(id)
  });
}

// 2. 动态查询键工厂
function createQueryKeyFactory(entity) {
  return {
    all: [entity],
    lists: () => [entity, 'list'],
    list: (filters) => [entity, 'list', filters],
    details: () => [entity, 'detail'],
    detail: (id) => [entity, 'detail', id],
    infinite: (filters) => [entity, 'infinite', filters]
  };
}

const userKeys = createQueryKeyFactory('user');
const postKeys = createQueryKeyFactory('post');

// 3. 序列化复杂查询键
const queryKey = useMemo(() => [
  'search',
  {
    query: searchTerm,
    filters: {
      category: selectedCategory,
      priceRange: [minPrice, maxPrice],
      tags: selectedTags.sort() // 确保顺序一致
    },
    page,
    sort: sortBy
  }
], [searchTerm, selectedCategory, minPrice, maxPrice, selectedTags, page, sortBy]);
```

### 4.2 查询状态和生命周期

```jsx
// 1. 完整的查询状态
function ComprehensiveQueryStatus() {
  const query = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });

  const {
    data,
    error,
    status,        // 'pending' | 'error' | 'success'
    fetchStatus,   // 'fetching' | 'paused' | 'idle'
    isPending,
    isError,
    isSuccess,
    isFetching,
    isLoading,     // isPending && isFetching
    isRefetching,  // isFetching && !isPending
    isStale,
    isPlaceholderData,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    failureReason
  } = query;

  if (isPending && !isFetching) return <div>准备中...</div>;
  if (isLoading) return <div>首次加载...</div>;
  if (isRefetching) return <div>后台刷新中... {data}</div>;
  if (isError) return <div>错误: {error.message}</div>;

  return (
    <div>
      <div>数据: {JSON.stringify(data)}</div>
      <div>状态: {status}</div>
      <div>获取状态: {fetchStatus}</div>
      <div>失败次数: {failureCount}</div>
      {isStale && <div>数据已过期</div>}
    </div>
  );
}

// 2. 查询生命周期回调
function QueryLifecycleCallbacks() {
  const { data } = useQuery({
    queryKey: ['lifecycle'],
    queryFn: fetchData,
    
    // 成功回调
    onSuccess: (data) => {
      console.log('查询成功:', data);
      toast.success('数据加载成功');
    },
    
    // 错误回调
    onError: (error) => {
      console.error('查询失败:', error);
      toast.error(`加载失败: ${error.message}`);
    },
    
    // 完成回调(无论成功失败)
    onSettled: (data, error) => {
      console.log('查询完成', { data, error });
    }
  });

  return <div>{data}</div>;
}

// 3. 查询观察者模式
function QueryObserverPattern() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 订阅查询状态变化
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.queryKey[0] === 'todos') {
        console.log('Todos查询更新:', event.query.state);
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return <div>监听查询变化</div>;
}
```

### 4.3 缓存时间和陈旧时间

```jsx
// 1. 缓存策略配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 陈旧时间：数据多久后被认为是过期的
      staleTime: 1000 * 60 * 5, // 5分钟
      
      // 缓存时间：未使用的数据在缓存中保留多久
      gcTime: 1000 * 60 * 30, // 30分钟 (原cacheTime)
      
      // 重试次数
      retry: 3,
      
      // 重试延迟
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 网络模式
      networkMode: 'online', // 'online' | 'always' | 'offlineFirst'
      
      // 重新获取配置
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: false,
      refetchIntervalInBackground: false
    }
  }
});

// 2. 不同数据的不同策略
function DataWithDifferentStrategies() {
  // 静态数据：长时间缓存
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24 // 24小时
  });

  // 实时数据：短时间缓存
  const { data: stock } = useQuery({
    queryKey: ['stock-price'],
    queryFn: fetchStockPrice,
    staleTime: 0, // 立即过期
    gcTime: 1000 * 60, // 1分钟
    refetchInterval: 1000 // 每秒刷新
  });

  // 用户数据：中等缓存
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5分钟
    gcTime: 1000 * 60 * 30 // 30分钟
  });

  return <div>...</div>;
}

// 3. 条件性陈旧时间
function ConditionalStaleTime() {
  const [isPremium, setIsPremium] = useState(false);

  const { data } = useQuery({
    queryKey: ['data', isPremium],
    queryFn: fetchData,
    // 高级用户获得更新鲜的数据
    staleTime: isPremium ? 1000 * 30 : 1000 * 60 * 5
  });

  return <div>...</div>;
}
```

### 4.4 依赖查询和串行查询

```jsx
// 1. 依赖查询链
function DependentQueries() {
  // 第一步：获取用户
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });

  // 第二步：基于用户ID获取项目
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchProjects(user.id),
    enabled: !!user?.id // 只在user存在时执行
  });

  // 第三步：基于项目获取任务
  const { data: tasks } = useQuery({
    queryKey: ['tasks', projects?.[0]?.id],
    queryFn: () => fetchTasks(projects[0].id),
    enabled: !!projects?.[0]?.id
  });

  return <div>...</div>;
}

// 2. 使用useQueries处理动态依赖
function DynamicDependentQueries({ userIds }) {
  const userQueries = useQueries({
    queries: userIds.map(id => ({
      queryKey: ['user', id],
      queryFn: () => fetchUser(id)
    }))
  });

  const users = userQueries.map(q => q.data).filter(Boolean);
  
  // 基于获取的用户加载更多数据
  const detailQueries = useQueries({
    queries: users.map(user => ({
      queryKey: ['user-details', user.id],
      queryFn: () => fetchUserDetails(user.id),
      enabled: !!user
    }))
  });

  return <div>...</div>;
}

// 3. 串行查询优化
function OptimizedSerialQueries() {
  const { data: step1 } = useQuery({
    queryKey: ['step1'],
    queryFn: fetchStep1
  });

  const { data: step2 } = useQuery({
    queryKey: ['step2', step1?.id],
    queryFn: () => fetchStep2(step1.id),
    enabled: !!step1,
    // 使用初始数据减少等待
    placeholderData: { loading: true }
  });

  const { data: step3 } = useQuery({
    queryKey: ['step3', step2?.id],
    queryFn: () => fetchStep3(step2.id),
    enabled: !!step2 && !step2.loading
  });

  return <div>...</div>;
}
```

### 4.5 查询预取和预加载

```jsx
// 1. 路由预取
function RouteBasedPrefetch() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleNavigate = async (path, queryKey, queryFn) => {
    // 预取数据
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 1000 * 60 * 5
    });
    
    // 然后导航
    navigate(path);
  };

  return (
    <button onClick={() => 
      handleNavigate(
        '/profile',
        ['user-profile'],
        fetchUserProfile
      )
    }>
      查看个人资料
    </button>
  );
}

// 2. 悬停预取
function HoverPrefetch({ items }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = (id) => {
    queryClient.prefetchQuery({
      queryKey: ['item', id],
      queryFn: () => fetchItem(id)
    });
  };

  return (
    <div>
      {items.map(item => (
        <div 
          key={item.id}
          onMouseEnter={() => handleMouseEnter(item.id)}
        >
          <Link to={`/items/${item.id}`}>{item.name}</Link>
        </div>
      ))}
    </div>
  );
}

// 3. 智能预加载策略
function SmartPreloading() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['items', page],
    queryFn: () => fetchItems(page)
  });

  useEffect(() => {
    // 预取下一页
    if (data?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ['items', page + 1],
        queryFn: () => fetchItems(page + 1)
      });
    }

    // 预取前一页(如果有)
    if (page > 1) {
      queryClient.prefetchQuery({
        queryKey: ['items', page - 1],
        queryFn: () => fetchItems(page - 1)
      });
    }
  }, [page, data, queryClient]);

  return <div>...</div>;
}

// 4. 批量预取
async function batchPrefetch(queryClient, items) {
  const prefetchPromises = items.map(item =>
    queryClient.prefetchQuery({
      queryKey: ['item', item.id],
      queryFn: () => fetchItem(item.id)
    })
  );

  await Promise.allSettled(prefetchPromises);
}
```

### 4.6 查询取消和超时

```jsx
// 1. 自动查询取消
function AutoCancellation() {
  const [id, setId] = useState(1);

  const { data } = useQuery({
    queryKey: ['user', id],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/users/${id}`, { signal });
      return response.json();
    }
  });

  // 当id变化时，之前的请求会自动取消
  return (
    <div>
      <button onClick={() => setId(id + 1)}>下一个用户</button>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}

// 2. 手动查询取消
function ManualCancellation() {
  const queryClient = useQueryClient();

  const handleCancel = () => {
    // 取消特定查询
    queryClient.cancelQueries({ queryKey: ['todos'] });
    
    // 取消所有查询
    // queryClient.cancelQueries();
  };

  const { data, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/todos', { signal });
      return response.json();
    }
  });

  return (
    <div>
      {isFetching && <button onClick={handleCancel}>取消</button>}
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}

// 3. 超时控制
function QueryWithTimeout() {
  const { data, error } = useQuery({
    queryKey: ['slow-data'],
    queryFn: async ({ signal }) => {
      const timeoutId = setTimeout(() => {
        signal.dispatchEvent(new Event('abort'));
      }, 5000); // 5秒超时

      try {
        const response = await fetch('/api/slow-endpoint', { signal });
        clearTimeout(timeoutId);
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    retry: false // 超时不重试
  });

  if (error?.name === 'AbortError') {
    return <div>请求超时</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
}

// 4. 竞态条件处理
function RaceConditionHandling() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async ({ signal }) => {
      // 等待防抖
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 检查是否已取消
      if (signal.aborted) {
        throw new Error('Cancelled');
      }

      const response = await fetch(
        `/api/search?q=${searchTerm}`,
        { signal }
      );
      return response.json();
    },
    enabled: searchTerm.length > 0
  });

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
```

## TanStack Query最佳实践总结

### 核心优化策略
```
1. 查询键管理
   ✅ 使用工厂函数组织键
   ✅ 保持键的一致性
   ✅ 序列化复杂对象

2. 缓存策略
   ✅ 根据数据特性设置staleTime
   ✅ 合理配置gcTime
   ✅ 区分静态和动态数据

3. 查询优化
   ✅ 启用条件查询
   ✅ 使用依赖查询链
   ✅ 实现智能预取

4. 性能控制
   ✅ 实现请求取消
   ✅ 设置超时控制
   ✅ 处理竞态条件

5. 状态管理
   ✅ 充分利用查询状态
   ✅ 使用生命周期回调
   ✅ 订阅缓存变化
```

TanStack Query提供了完整的数据同步解决方案，是构建高性能React应用的最佳选择。
