# Suspense数据获取

## 第一部分：数据获取基础

### 1.1 传统数据获取方式

```javascript
// 方式1：useEffect + loading状态
function TraditionalFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  if (!data) return null;
  
  return <DataDisplay data={data} />;
}

// 方式2：自定义Hook
function useData(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    setState(s => ({ ...s, loading: true }));
    
    fetch(url)
      .then(res => res.json())
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [url]);
  
  return state;
}

// 传统方式的问题：
// 1. 样板代码多
// 2. 手动管理loading/error状态
// 3. 瀑布式加载
// 4. 难以组合
```

### 1.2 Suspense数据获取模式

```javascript
// 使用Suspense的数据获取
function SuspenseFetch() {
  const data = use(fetchData());  // React 19的use Hook
  
  return <DataDisplay data={data} />;
}

// 使用
function App() {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<Spinner />}>
        <SuspenseFetch />
      </Suspense>
    </ErrorBoundary>
  );
}

// 优势：
// 1. 代码简洁
// 2. 声明式加载状态
// 3. 并行加载
// 4. 易于组合
```

### 1.3 use Hook详解

```javascript
// React 19的use Hook
import { use } from 'react';

// 1. 读取Promise
function Component() {
  const data = use(fetchPromise);  // 如果pending则挂起
  return <div>{data}</div>;
}

// 2. 读取Context
function Component() {
  const theme = use(ThemeContext);
  return <div className={theme}></div>;
}

// 3. 条件使用（与其他Hook不同）
function Component({ shouldFetch }) {
  if (shouldFetch) {
    const data = use(fetchData());  // ✅ 可以在条件中
    return <div>{data}</div>;
  }
  return <div>No data</div>;
}

// 4. 循环中使用
function Component({ ids }) {
  return ids.map(id => {
    const data = use(fetchItem(id));  // ✅ 可以在循环中
    return <Item key={id} data={data} />;
  });
}
```

### 1.4 创建Suspense数据源

```javascript
// 基础实现
function fetchData(url) {
  let status = 'pending';
  let result;
  
  const promise = fetch(url)
    .then(res => res.json())
    .then(data => {
      status = 'success';
      result = data;
    })
    .catch(error => {
      status = 'error';
      result = error;
    });
  
  return {
    read() {
      if (status === 'pending') {
        throw promise;  // Suspense挂起
      } else if (status === 'error') {
        throw result;  // ErrorBoundary捕获
      } else {
        return result;  // 返回数据
      }
    }
  };
}

// 使用
function Component() {
  const resource = fetchData('/api/user');
  const data = resource.read();
  
  return <div>{data.name}</div>;
}

// 改进：支持缓存
const cache = new Map();

function createResource(fetchFunc) {
  return {
    read(key) {
      if (cache.has(key)) {
        const cached = cache.get(key);
        
        if (cached.status === 'pending') {
          throw cached.promise;
        } else if (cached.status === 'error') {
          throw cached.error;
        } else {
          return cached.data;
        }
      }
      
      const promise = fetchFunc(key)
        .then(data => {
          cache.set(key, { status: 'success', data });
          return data;
        })
        .catch(error => {
          cache.set(key, { status: 'error', error });
          throw error;
        });
      
      cache.set(key, { status: 'pending', promise });
      throw promise;
    }
  };
}

// 使用带缓存的resource
const userResource = createResource(fetchUser);

function UserProfile({ userId }) {
  const user = userResource.read(userId);
  return <div>{user.name}</div>;
}
```

## 第二部分：实战模式

### 2.1 基础数据获取

```javascript
// 简单GET请求
function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    });
}

function UserComponent({ userId }) {
  const user = use(fetchUser(userId));
  
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}

// 使用
function App() {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserComponent userId={1} />
    </Suspense>
  );
}

// POST请求
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
}

function CreateUserForm() {
  const [userData, setUserData] = useState(null);
  
  const handleSubmit = (formData) => {
    setUserData(formData);
  };
  
  if (!userData) {
    return <Form onSubmit={handleSubmit} />;
  }
  
  return (
    <Suspense fallback={<Saving />}>
      <SubmitUser data={userData} />
    </Suspense>
  );
}

function SubmitUser({ data }) {
  const result = use(createUser(data));
  return <SuccessMessage user={result} />;
}
```

### 2.2 并行数据获取

```javascript
// 传统方式：串行加载（瀑布式）
function WaterfallLoading({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(userData => {
      setUser(userData);
      // 等user加载完才加载posts
      fetchPosts(userId).then(setPosts);
    });
  }, [userId]);
  
  if (!user) return <Loading />;
  if (!posts) return <Loading />;
  
  return <ProfilePage user={user} posts={posts} />;
}

// Suspense方式：并行加载
function ParallelLoading({ userId }) {
  const user = use(fetchUser(userId));
  const posts = use(fetchPosts(userId));
  
  // 两个请求同时发起，都完成后才渲染
  return <ProfilePage user={user} posts={posts} />;
}

// 使用
function App({ userId }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ParallelLoading userId={userId} />
    </Suspense>
  );
}

// 更复杂的并行加载
function Dashboard({ userId }) {
  const user = use(fetchUser(userId));
  const stats = use(fetchStats(userId));
  const activities = use(fetchActivities(userId));
  const notifications = use(fetchNotifications(userId));
  
  // 4个请求并行，全部完成后渲染
  return (
    <div className="dashboard">
      <UserHeader user={user} />
      <StatsPanel stats={stats} />
      <ActivityFeed activities={activities} />
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

### 2.3 嵌套数据获取

```javascript
// 逐步加载（瀑布优化）
function ProfilePage({ userId }) {
  return (
    <div className="profile">
      {/* 第一层：快速加载用户基本信息 */}
      <Suspense fallback={<HeaderSkeleton />}>
        <ProfileHeader userId={userId} />
      </Suspense>
      
      {/* 第二层：加载用户详情 */}
      <Suspense fallback={<ContentSkeleton />}>
        <ProfileContent userId={userId} />
        
        {/* 第三层：加载评论 */}
        <Suspense fallback={<CommentsSkeleton />}>
          <Comments userId={userId} />
        </Suspense>
      </Suspense>
    </div>
  );
}

function ProfileHeader({ userId }) {
  const user = use(fetchUserBasic(userId));
  return (
    <header>
      <img src={user.avatar} alt={user.name} />
      <h1>{user.name}</h1>
    </header>
  );
}

function ProfileContent({ userId }) {
  const details = use(fetchUserDetails(userId));
  return (
    <div className="content">
      <Bio text={details.bio} />
      <Stats data={details.stats} />
    </div>
  );
}

function Comments({ userId }) {
  const comments = use(fetchComments(userId));
  return (
    <div className="comments">
      {comments.map(comment => (
        <Comment key={comment.id} data={comment} />
      ))}
    </div>
  );
}

// 结果：
// 1. 用户头像、名字立即显示
// 2. 详情信息稍后显示
// 3. 评论最后显示
// 每一层都不阻塞其他层的显示
```

### 2.4 条件数据获取

```javascript
// 根据条件获取数据
function ConditionalData({ showDetails, userId }) {
  const basicInfo = use(fetchUserBasic(userId));
  
  let detailInfo = null;
  if (showDetails) {
    detailInfo = use(fetchUserDetails(userId));  // ✅ use可以在条件中
  }
  
  return (
    <div>
      <h1>{basicInfo.name}</h1>
      {detailInfo && (
        <div className="details">
          <p>{detailInfo.bio}</p>
          <Stats data={detailInfo.stats} />
        </div>
      )}
    </div>
  );
}

// 使用
function App() {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? '隐藏' : '显示'}详情
      </button>
      
      <Suspense fallback={<Loading />}>
        <ConditionalData showDetails={showDetails} userId={1} />
      </Suspense>
    </div>
  );
}

// 权限控制
function ProtectedData({ userId, hasPermission }) {
  const publicData = use(fetchPublicData(userId));
  
  if (!hasPermission) {
    return <PublicView data={publicData} />;
  }
  
  const privateData = use(fetchPrivateData(userId));
  return <PrivateView public={publicData} private={privateData} />;
}
```

### 2.5 依赖数据获取

```javascript
// 数据依赖关系
function DependentData({ categoryId }) {
  const category = use(fetchCategory(categoryId));
  
  // 基于category的结果获取products
  const products = use(fetchProductsByCategory(category.id));
  
  return (
    <div>
      <h2>{category.name}</h2>
      <ProductList products={products} />
    </div>
  );
}

// 多级依赖
function MultiLevelDependent({ userId }) {
  // 第一级
  const user = use(fetchUser(userId));
  
  // 第二级：依赖user
  const preferences = use(fetchPreferences(user.preferenceId));
  
  // 第三级：依赖preferences
  const recommendations = use(
    fetchRecommendations(preferences.categories)
  );
  
  return (
    <div>
      <h1>{user.name}</h1>
      <Preferences data={preferences} />
      <Recommendations items={recommendations} />
    </div>
  );
}

// 优化：尽可能并行
function OptimizedDependent({ userId }) {
  const user = use(fetchUser(userId));
  
  // 这两个不相互依赖，可以并行
  const preferences = use(fetchPreferences(user.preferenceId));
  const history = use(fetchHistory(user.id));
  
  return (
    <div>
      <h1>{user.name}</h1>
      <div className="parallel-content">
        <Preferences data={preferences} />
        <History data={history} />
      </div>
    </div>
  );
}
```

## 第三部分：高级技巧

### 3.1 数据预加载

```javascript
// 预加载策略
const preloadedData = new Map();

function preload(key, fetcher) {
  if (!preloadedData.has(key)) {
    const promise = fetcher();
    preloadedData.set(key, promise);
  }
  return preloadedData.get(key);
}

// 链接预加载
function UserLink({ userId, children }) {
  const handleMouseEnter = () => {
    preload(`user-${userId}`, () => fetchUser(userId));
  };
  
  return (
    <Link 
      to={`/users/${userId}`}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
}

// 路由预加载
function RoutePreload() {
  const navigate = useNavigate();
  
  const goToUser = (userId) => {
    // 预加载数据
    preload(`user-${userId}`, () => fetchUser(userId));
    preload(`posts-${userId}`, () => fetchPosts(userId));
    
    // 然后导航
    navigate(`/users/${userId}`);
  };
  
  return (
    <button onClick={() => goToUser(1)}>
      查看用户
    </button>
  );
}

// 智能预加载
function SmartPreload() {
  const [currentId, setCurrentId] = useState(1);
  
  useEffect(() => {
    // 预加载相邻数据
    const nextId = currentId + 1;
    const prevId = currentId - 1;
    
    if (nextId <= 10) {
      preload(`user-${nextId}`, () => fetchUser(nextId));
    }
    if (prevId >= 1) {
      preload(`user-${prevId}`, () => fetchUser(prevId));
    }
  }, [currentId]);
  
  return (
    <div>
      <button onClick={() => setCurrentId(id => id - 1)}>
        上一个
      </button>
      
      <Suspense fallback={<Skeleton />}>
        <UserProfile userId={currentId} />
      </Suspense>
      
      <button onClick={() => setCurrentId(id => id + 1)}>
        下一个
      </button>
    </div>
  );
}
```

### 3.2 缓存管理

```javascript
// 带过期时间的缓存
class DataCache {
  constructor(ttl = 60000) {  // 默认1分钟
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }
  
  clear() {
    this.cache.clear();
  }
  
  invalidate(key) {
    this.cache.delete(key);
  }
}

const dataCache = new DataCache(5 * 60 * 1000);  // 5分钟

function fetchWithCache(url) {
  const cached = dataCache.get(url);
  if (cached) {
    return Promise.resolve(cached);
  }
  
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      dataCache.set(url, data);
      return data;
    });
}

// SWR模式（Stale-While-Revalidate）
function useSWR(key, fetcher) {
  const cached = dataCache.get(key);
  
  if (cached) {
    // 返回缓存，同时后台刷新
    fetcher().then(fresh => {
      dataCache.set(key, fresh);
    });
    
    return cached;
  }
  
  // 无缓存，挂起
  const promise = fetcher().then(data => {
    dataCache.set(key, data);
    return data;
  });
  
  throw promise;
}

// 使用SWR
function UserProfile({ userId }) {
  const user = useSWR(
    `user-${userId}`,
    () => fetchUser(userId)
  );
  
  return <div>{user.name}</div>;
}

// 条件刷新
function ConditionalRevalidate({ userId, shouldRevalidate }) {
  useEffect(() => {
    if (shouldRevalidate) {
      dataCache.invalidate(`user-${userId}`);
    }
  }, [userId, shouldRevalidate]);
  
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId={userId} />
    </Suspense>
  );
}
```

### 3.3 错误重试

```javascript
// 带重试的数据获取
function fetchWithRetry(url, maxRetries = 3) {
  let retries = 0;
  
  const attempt = async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Request failed');
      return await res.json();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      // 指数退避
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return attempt();
    }
  };
  
  return attempt();
}

// 使用
function RobustData({ userId }) {
  const user = use(fetchWithRetry(`/api/users/${userId}`, 3));
  return <div>{user.name}</div>;
}

// 带UI反馈的重试
function RetryableComponent() {
  const [retryKey, setRetryKey] = useState(0);
  
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="error">
          <p>加载失败: {error.message}</p>
          <button onClick={() => setRetryKey(k => k + 1)}>
            重试
          </button>
        </div>
      )}
      resetKeys={[retryKey]}
    >
      <Suspense fallback={<Loading />}>
        <DataComponent key={retryKey} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.4 分页加载

```javascript
// 分页数据获取
function PaginatedData({ page }) {
  const data = use(fetchPage(page));
  
  return (
    <div>
      {data.items.map(item => (
        <Item key={item.id} data={item} />
      ))}
    </div>
  );
}

// 使用
function PaginatedList() {
  const [page, setPage] = useState(1);
  
  return (
    <div>
      <Suspense fallback={<ListSkeleton />}>
        <PaginatedData page={page} />
      </Suspense>
      
      <div className="pagination">
        <button 
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          上一页
        </button>
        
        <span>第 {page} 页</span>
        
        <button onClick={() => setPage(p => p + 1)}>
          下一页
        </button>
      </div>
    </div>
  );
}

// 无限滚动
function InfiniteScroll() {
  const [pages, setPages] = useState([1]);
  const observerRef = useRef();
  
  const loadMore = () => {
    setPages(p => [...p, p.length + 1]);
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div>
      {pages.map(page => (
        <Suspense key={page} fallback={<PageSkeleton />}>
          <PageData page={page} />
        </Suspense>
      ))}
      
      <div ref={observerRef} />
    </div>
  );
}
```

### 3.5 实时更新

```javascript
// WebSocket + Suspense
function useRealtimeData(url, initialFetch) {
  const [data, setData] = useState(() => {
    throw initialFetch().then(setData);
  });
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setData(update);
    };
    
    return () => ws.close();
  }, [url]);
  
  return data;
}

// 使用
function LiveData() {
  const data = useRealtimeData(
    'ws://api.example.com/live',
    () => fetch('/api/initial').then(r => r.json())
  );
  
  return <DataDisplay data={data} />;
}

// Server-Sent Events
function useSSE(url, initialFetch) {
  const [data, setData] = useState(() => {
    throw initialFetch().then(setData);
  });
  
  useEffect(() => {
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setData(update);
    };
    
    return () => eventSource.close();
  }, [url]);
  
  return data;
}
```

## 第四部分：数据获取库集成

### 4.1 使用React Query

```javascript
// React Query + Suspense
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true  // 启用Suspense模式
    }
  }
});

function UserProfile({ userId }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  });
  
  // 在Suspense模式下，data总是有值
  return <div>{data.name}</div>;
}

// 使用
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId={1} />
      </Suspense>
    </QueryClientProvider>
  );
}

// 预取数据
function UserLink({ userId }) {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId)
    });
  };
  
  return (
    <Link 
      to={`/users/${userId}`}
      onMouseEnter={handleMouseEnter}
    >
      用户 {userId}
    </Link>
  );
}
```

### 4.2 使用SWR

```javascript
// SWR + Suspense
import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

function UserProfile({ userId }) {
  const { data } = useSWR(
    `/api/users/${userId}`,
    fetcher,
    { suspense: true }
  );
  
  return <div>{data.name}</div>;
}

// 使用
function App() {
  return (
    <SWRConfig value={{ suspense: true }}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId={1} />
      </Suspense>
    </SWRConfig>
  );
}

// 预加载
import { preload } from 'swr';

function UserLink({ userId }) {
  const handleMouseEnter = () => {
    preload(`/api/users/${userId}`, fetcher);
  };
  
  return (
    <Link 
      to={`/users/${userId}`}
      onMouseEnter={handleMouseEnter}
    >
      用户 {userId}
    </Link>
  );
}
```

### 4.3 使用Relay

```javascript
// Relay + Suspense（原生支持）
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';

function UserProfile({ userId }) {
  const data = useLazyLoadQuery(
    graphql`
      query UserProfileQuery($userId: ID!) {
        user(id: $userId) {
          name
          email
          avatar
        }
      }
    `,
    { userId }
  );
  
  return (
    <div>
      <img src={data.user.avatar} alt={data.user.name} />
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
    </div>
  );
}

// 使用（Relay自带Suspense支持）
function App() {
  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId="1" />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

### 4.4 使用Apollo Client

```javascript
// Apollo Client + Suspense
import { useSuspenseQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_USER = gql`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
    }
  }
`;

function UserProfile({ userId }) {
  const { data } = useSuspenseQuery(GET_USER, {
    variables: { userId }
  });
  
  return <div>{data.user.name}</div>;
}

// 使用
function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId="1" />
      </Suspense>
    </ApolloProvider>
  );
}
```

## 注意事项

### 1. 避免瀑布式加载

```javascript
// ❌ 瀑布式加载
function Waterfall({ userId }) {
  return (
    <Suspense fallback={<Loading />}>
      <User userId={userId} />
    </Suspense>
  );
}

function User({ userId }) {
  const user = use(fetchUser(userId));
  
  // 等user加载完才开始加载posts
  return (
    <div>
      <h1>{user.name}</h1>
      <Suspense fallback={<PostsLoading />}>
        <Posts userId={userId} />
      </Suspense>
    </div>
  );
}

// ✅ 并行加载
function Parallel({ userId }) {
  return (
    <Suspense fallback={<Loading />}>
      <UserAndPosts userId={userId} />
    </Suspense>
  );
}

function UserAndPosts({ userId }) {
  const user = use(fetchUser(userId));
  const posts = use(fetchPosts(userId));  // 同时发起
  
  return (
    <div>
      <h1>{user.name}</h1>
      <PostsList posts={posts} />
    </div>
  );
}
```

### 2. 处理竞态条件

```javascript
// 竞态条件问题
function SearchResults({ query }) {
  const results = use(search(query));
  return <Results data={results} />;
}

// 用户快速输入 "a" -> "ab" -> "abc"
// 可能 "abc" 的结果先返回，然后 "ab" 的结果覆盖它

// 解决方案：使用库（React Query、SWR）
// 它们自动处理竞态条件

// 或手动处理
function SearchResults({ query }) {
  const latestQuery = useRef(query);
  latestQuery.current = query;
  
  const results = use(
    search(query).then(data => {
      if (latestQuery.current === query) {
        return data;
      }
      return [];  // 过期的结果
    })
  );
  
  return <Results data={results} />;
}
```

### 3. 缓存策略

```javascript
// 考虑缓存失效
const cache = new Map();

function fetchWithCache(key, fetcher, ttl = 60000) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.time < ttl) {
    return Promise.resolve(cached.data);
  }
  
  return fetcher().then(data => {
    cache.set(key, { data, time: Date.now() });
    return data;
  });
}

// 主动失效缓存
function invalidateCache(key) {
  cache.delete(key);
}

// 全局刷新
function refreshAll() {
  cache.clear();
}
```

## 常见问题

### Q1: use Hook和useEffect有什么区别？

**A:** use在渲染时同步读取数据并可能挂起；useEffect在渲染后异步执行。

### Q2: 如何避免重复请求？

**A:** 使用缓存或数据获取库（React Query、SWR）。

### Q3: Suspense数据获取支持SSR吗？

**A:** React 18+支持，但需要服务器框架配合（如Next.js）。

### Q4: 如何取消pending的请求？

**A:** 使用AbortController或数据获取库的cancel功能。

### Q5: 数据更新后如何刷新？

**A:** 重新触发数据获取或使用库的mutation功能。

### Q6: 可以在Suspense中使用多个数据源吗？

**A:** 可以，use Hook可以多次调用。

### Q7: 如何处理认证？

**A:** 在fetcher中添加认证头，或使用库的配置。

### Q8: 分页数据如何缓存？

**A:** 使用数据获取库，或手动管理Map缓存。

### Q9: 如何优化慢速网络？

**A:** 预加载、缓存、显示骨架屏、使用Service Worker。

### Q10: Suspense数据获取的最佳实践？

**A:** 使用成熟的库、合理缓存、避免瀑布、处理错误。

## 总结

### 核心要点

```
1. Suspense数据获取优势
   ✅ 声明式加载状态
   ✅ 并行请求优化
   ✅ 代码简洁
   ✅ 易于组合

2. 关键模式
   ✅ use Hook读取数据
   ✅ 并行vs嵌套加载
   ✅ 预加载优化
   ✅ 缓存管理

3. 最佳实践
   ✅ 使用数据获取库
   ✅ 避免瀑布式加载
   ✅ 合理的边界粒度
   ✅ 错误和重试处理
```

### 实践建议

```
1. 选择合适的工具
   ✅ React Query: 功能全面
   ✅ SWR: 简单轻量
   ✅ Relay: GraphQL最佳
   ✅ Apollo: GraphQL备选

2. 性能优化
   ✅ 预加载关键数据
   ✅ 智能缓存策略
   ✅ 并行加载
   ✅ 分层Suspense

3. 用户体验
   ✅ 快速首屏
   ✅ 优雅的加载状态
   ✅ 错误处理
   ✅ 离线支持
```

Suspense数据获取是现代React应用的核心模式，掌握它能构建更流畅的用户体验。

