# use()读取Promise数据

## 学习目标

通过本章学习，你将掌握：

- use()如何处理Promise的三种状态
- Promise数据获取的最佳实践
- 并行和串行数据加载策略
- Promise缓存和重用机制
- 数据预加载技术
- 与Suspense的深度集成
- 错误处理和重试机制
- 实际项目中的数据获取模式

## 第一部分：Promise基础概念回顾

### 1.1 Promise的三种状态

```javascript
// Promise的生命周期
const promise = new Promise((resolve, reject) => {
  // 1. Pending（进行中）
  setTimeout(() => {
    const success = Math.random() > 0.5;
    
    if (success) {
      // 2. Fulfilled（已成功）
      resolve({ data: 'Success!' });
    } else {
      // 3. Rejected（已失败）
      reject(new Error('Failed!'));
    }
  }, 1000);
});

// 使用Promise
promise
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

### 1.2 async/await语法

```javascript
// 传统Promise链
function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/posts?userId=${user.id}`)
        .then(response => response.json())
        .then(posts => ({ user, posts }));
    });
}

// async/await方式
async function fetchUserData(userId) {
  const userResponse = await fetch(`/api/users/${userId}`);
  const user = await userResponse.json();
  
  const postsResponse = await fetch(`/api/posts?userId=${user.id}`);
  const posts = await postsResponse.json();
  
  return { user, posts };
}
```

### 1.3 React中传统的Promise处理

```jsx
// 传统方式：useEffect + useState
function TraditionalDataFetching({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    fetchUser(userId)
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!data) return null;
  
  return <div>{data.name}</div>;
}
```

## 第二部分：use()处理Promise的工作原理

### 2.1 use()的内部机制

```jsx
// use()如何处理Promise（简化版实现）
function use(promise) {
  // 检查是否是Promise
  if (promise && typeof promise.then === 'function') {
    // 获取Promise的内部状态
    const status = getPromiseStatus(promise);
    
    switch (status) {
      case 'pending':
        // Promise还在进行中
        // 抛出Promise，让Suspense捕获
        throw promise;
      
      case 'fulfilled':
        // Promise已成功
        // 返回resolved的值
        return getPromiseResult(promise);
      
      case 'rejected':
        // Promise已失败
        // 抛出错误，让ErrorBoundary捕获
        throw getPromiseError(promise);
      
      default:
        throw new Error('Unknown promise status');
    }
  }
  
  throw new Error('Invalid argument');
}

// React内部会追踪Promise状态
const promiseStatusMap = new WeakMap();

function getPromiseStatus(promise) {
  if (promiseStatusMap.has(promise)) {
    return promiseStatusMap.get(promise).status;
  }
  
  // 首次遇到这个Promise，附加状态追踪
  const record = { status: 'pending', value: null };
  promiseStatusMap.set(promise, record);
  
  promise.then(
    value => {
      record.status = 'fulfilled';
      record.value = value;
    },
    error => {
      record.status = 'rejected';
      record.value = error;
    }
  );
  
  return 'pending';
}
```

### 2.2 渲染流程详解

```jsx
function DataComponent({ dataPromise }) {
  // 第一次渲染
  // 1. use()检查Promise状态 → pending
  // 2. use()抛出Promise
  // 3. React捕获Promise
  // 4. Suspense显示fallback
  // 5. React等待Promise resolve
  
  // Promise resolved后
  // 6. React重新渲染组件
  // 7. use()检查Promise状态 → fulfilled
  // 8. use()返回数据
  // 9. 组件正常渲染
  
  const data = use(dataPromise);
  return <div>{data.value}</div>;
}

// 完整示例
function App() {
  const [dataPromise] = useState(() => fetchData());
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DataComponent dataPromise={dataPromise} />
    </Suspense>
  );
}
```

### 2.3 与Suspense的配合

```jsx
// Suspense的工作原理
class Suspense extends React.Component {
  state = { isLoading: false };
  
  componentDidCatch(error) {
    // 捕获抛出的Promise
    if (error && typeof error.then === 'function') {
      this.setState({ isLoading: true });
      
      error.then(() => {
        // Promise resolved，重新渲染
        this.setState({ isLoading: false });
      });
    } else {
      // 真正的错误，继续抛出
      throw error;
    }
  }
  
  render() {
    if (this.state.isLoading) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

## 第三部分：基础数据获取模式

### 3.1 单个资源获取

```jsx
// API函数
async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// 使用use()
function UserProfile({ userId }) {
  // 在组件外或使用useMemo创建Promise
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserContent userPromise={userPromise} />
    </Suspense>
  );
}

function UserContent({ userPromise }) {
  const user = use(userPromise);
  
  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <p>邮箱: {user.email}</p>
      <p>加入时间: {new Date(user.joinDate).toLocaleDateString()}</p>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="user-profile skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-text" />
      <div className="skeleton-text" />
    </div>
  );
}
```

### 3.2 参数化请求

```jsx
// 带参数的数据获取
function SearchResults() {
  const [query, setQuery] = useState('');
  const [searchPromise, setSearchPromise] = useState(null);
  
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      // 创建新的Promise
      setSearchPromise(searchProducts(query));
    }
  }, [query]);
  
  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索商品..."
        />
        <button type="submit">搜索</button>
      </form>
      
      {searchPromise && (
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResultsList searchPromise={searchPromise} />
        </Suspense>
      )}
    </div>
  );
}

function SearchResultsList({ searchPromise }) {
  const results = use(searchPromise);
  
  if (results.length === 0) {
    return <div>未找到相关商品</div>;
  }
  
  return (
    <ul>
      {results.map(product => (
        <li key={product.id}>
          <h3>{product.name}</h3>
          <p>¥{product.price}</p>
        </li>
      ))}
    </ul>
  );
}
```

### 3.3 条件数据获取

```jsx
// 根据条件决定是否获取数据
function ConditionalProfile({ userId, shouldLoad }) {
  // 只在需要时创建Promise
  const userPromise = useMemo(() => {
    return shouldLoad ? fetchUser(userId) : null;
  }, [userId, shouldLoad]);
  
  if (!shouldLoad) {
    return <div>请先登录</div>;
  }
  
  return (
    <Suspense fallback={<div>加载用户信息...</div>}>
      <ProfileContent userPromise={userPromise} />
    </Suspense>
  );
}

function ProfileContent({ userPromise }) {
  // use()可以在条件分支中调用
  if (!userPromise) {
    return <div>无数据</div>;
  }
  
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// 多条件数据获取
function MultiConditionalData({ type, id }) {
  const promise = useMemo(() => {
    switch (type) {
      case 'user':
        return fetchUser(id);
      case 'post':
        return fetchPost(id);
      case 'product':
        return fetchProduct(id);
      default:
        return null;
    }
  }, [type, id]);
  
  if (!promise) {
    return <div>无效的类型</div>;
  }
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DataRenderer promise={promise} type={type} />
    </Suspense>
  );
}

function DataRenderer({ promise, type }) {
  const data = use(promise);
  
  switch (type) {
    case 'user':
      return <UserView user={data} />;
    case 'post':
      return <PostView post={data} />;
    case 'product':
      return <ProductView product={data} />;
  }
}
```

## 第四部分：并行数据获取

### 4.1 Promise.all并行加载

```jsx
// 同时获取多个资源
function Dashboard({ userId }) {
  const dataPromise = useMemo(() => {
    return Promise.all([
      fetchUser(userId),
      fetchUserPosts(userId),
      fetchUserStats(userId)
    ]);
  }, [userId]);
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent dataPromise={dataPromise} />
    </Suspense>
  );
}

function DashboardContent({ dataPromise }) {
  // 等待所有Promise完成
  const [user, posts, stats] = use(dataPromise);
  
  return (
    <div className="dashboard">
      <UserInfo user={user} />
      <PostsList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

### 4.2 分离Suspense边界并行加载

```jsx
// 更好的方式：独立的Suspense边界
function OptimizedDashboard({ userId }) {
  // 立即创建所有Promise
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  const postsPromise = useMemo(() => fetchUserPosts(userId), [userId]);
  const statsPromise = useMemo(() => fetchUserStats(userId), [userId]);
  
  return (
    <div className="dashboard">
      {/* 用户信息优先显示 */}
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo userPromise={userPromise} />
      </Suspense>
      
      {/* 文章列表独立加载 */}
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList postsPromise={postsPromise} />
      </Suspense>
      
      {/* 统计数据独立加载 */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel statsPromise={statsPromise} />
      </Suspense>
    </div>
  );
}

function UserInfo({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

function PostsList({ postsPromise }) {
  const posts = use(postsPromise);
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}

function StatsPanel({ statsPromise }) {
  const stats = use(statsPromise);
  return <div>文章: {stats.postCount}</div>;
}
```

### 4.3 动态并行加载

```jsx
// 加载多个动态资源
function ImageGallery({ imageIds }) {
  // 为每个图片创建Promise
  const imagePromises = useMemo(() => {
    return imageIds.map(id => fetchImage(id));
  }, [imageIds]);
  
  return (
    <div className="gallery">
      {imagePromises.map((promise, index) => (
        <Suspense key={imageIds[index]} fallback={<ImageSkeleton />}>
          <ImageCard imagePromise={promise} />
        </Suspense>
      ))}
    </div>
  );
}

function ImageCard({ imagePromise }) {
  const image = use(imagePromise);
  
  return (
    <div className="image-card">
      <img src={image.url} alt={image.title} />
      <p>{image.title}</p>
    </div>
  );
}
```

## 第五部分：串行数据获取

### 5.1 依赖数据加载

```jsx
// 第二个请求依赖第一个请求的结果
function UserPostsWithComments({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<div>加载用户信息...</div>}>
      <UserWithPosts userPromise={userPromise} />
    </Suspense>
  );
}

function UserWithPosts({ userPromise }) {
  const user = use(userPromise);
  
  // 基于user数据创建新Promise
  const postsPromise = useMemo(() => {
    return fetchUserPosts(user.id);
  }, [user.id]);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <Suspense fallback={<div>加载文章...</div>}>
        <PostsWithComments postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}

function PostsWithComments({ postsPromise }) {
  const posts = use(postsPromise);
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <Suspense fallback={<div>加载评论...</div>}>
            <Comments postId={post.id} />
          </Suspense>
        </div>
      ))}
    </div>
  );
}

function Comments({ postId }) {
  const commentsPromise = useMemo(() => {
    return fetchComments(postId);
  }, [postId]);
  
  const comments = use(commentsPromise);
  
  return (
    <ul>
      {comments.map(c => (
        <li key={c.id}>{c.content}</li>
      ))}
    </ul>
  );
}
```

### 5.2 瀑布流优化

```jsx
// 问题：串行加载导致瀑布流
function SlowComponent({ userId }) {
  return (
    <Suspense fallback={<div>加载用户...</div>}>
      <User userId={userId}>
        <Suspense fallback={<div>加载文章...</div>}>
          <Posts userId={userId}>
            <Suspense fallback={<div>加载评论...</div>}>
              <Comments userId={userId} />
            </Suspense>
          </Posts>
        </Suspense>
      </User>
    </Suspense>
  );
}

// 优化：提前启动所有请求
function OptimizedComponent({ userId }) {
  // 立即创建所有Promise
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  const postsPromise = useMemo(() => fetchPosts(userId), [userId]);
  const commentsPromise = useMemo(() => fetchComments(userId), [userId]);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserSection userPromise={userPromise} />
      <PostsSection postsPromise={postsPromise} />
      <CommentsSection commentsPromise={commentsPromise} />
    </Suspense>
  );
}
```

## 第六部分：Promise缓存和重用

### 6.1 组件级缓存

```jsx
// 使用useMemo缓存Promise
function CachedDataComponent({ userId }) {
  // Promise只在userId变化时重新创建
  const userPromise = useMemo(() => {
    console.log('创建新Promise');
    return fetchUser(userId);
  }, [userId]);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserDisplay userPromise={userPromise} />
      <UserStats userPromise={userPromise} />  {/* 复用同一个Promise */}
      <UserPosts userPromise={userPromise} />  {/* 复用同一个Promise */}
    </Suspense>
  );
}
```

### 6.2 全局缓存

```jsx
// 创建Promise缓存
const promiseCache = new Map();

function getCachedPromise(key, fetcher) {
  if (promiseCache.has(key)) {
    return promiseCache.get(key);
  }
  
  const promise = fetcher();
  promiseCache.set(key, promise);
  
  // 可选：设置过期时间
  setTimeout(() => {
    promiseCache.delete(key);
  }, 5 * 60 * 1000);  // 5分钟后过期
  
  return promise;
}

// 使用缓存
function CachedUser({ userId }) {
  const userPromise = useMemo(() => {
    return getCachedPromise(`user:${userId}`, () => fetchUser(userId));
  }, [userId]);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserContent userPromise={userPromise} />
    </Suspense>
  );
}
```

### 6.3 React Cache API

```jsx
import { cache } from 'react';

// 使用React的cache API
const getUser = cache(async (userId) => {
  console.log('Fetching user:', userId);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

function CachedComponent({ userId }) {
  // 相同参数会返回相同的Promise
  const userPromise = getUser(userId);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserInfo userPromise={userPromise} />
      <UserPosts userPromise={userPromise} />
    </Suspense>
  );
}
```

## 第七部分：数据预加载

### 7.1 路由预加载

```jsx
import { use, startTransition } from 'react';

// 预加载函数
function preloadUser(userId) {
  // 启动请求但不等待
  return fetchUser(userId);
}

// 路由组件
function UserPage({ params }) {
  const [userPromise, setUserPromise] = useState(() => {
    return preloadUser(params.userId);
  });
  
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}

// 在Link组件上预加载
function UserLink({ userId, children }) {
  const handleMouseEnter = () => {
    // 鼠标悬停时预加载
    preloadUser(userId);
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
```

### 7.2 视口预加载

```jsx
function LazyLoadedList({ items }) {
  const observerRef = useRef(null);
  const [loadedItems, setLoadedItems] = useState(new Set());
  
  useEffect(() => {
    // 使用IntersectionObserver预加载即将可见的项
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const itemId = entry.target.dataset.itemId;
            setLoadedItems(prev => new Set([...prev, itemId]));
          }
        });
      },
      { rootMargin: '200px' }  // 提前200px开始加载
    );
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <div 
          key={item.id}
          data-item-id={item.id}
          ref={el => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
        >
          {loadedItems.has(item.id) ? (
            <Suspense fallback={<ItemSkeleton />}>
              <ItemContent itemId={item.id} />
            </Suspense>
          ) : (
            <ItemPlaceholder />
          )}
        </div>
      ))}
    </div>
  );
}
```

## 第八部分：实战案例

### 8.1 无限滚动列表

```jsx
function InfiniteScrollList() {
  const [pages, setPages] = useState([0]);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = useCallback(() => {
    if (hasMore) {
      setPages(prev => [...prev, prev.length]);
    }
  }, [hasMore]);
  
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);
  
  return (
    <div>
      {pages.map(page => (
        <Suspense key={page} fallback={<PageSkeleton />}>
          <PageContent 
            pagePromise={fetchPage(page)}
            onLoaded={(data) => {
              if (data.length === 0) setHasMore(false);
            }}
          />
        </Suspense>
      ))}
    </div>
  );
}

function PageContent({ pagePromise, onLoaded }) {
  const items = use(pagePromise);
  
  useEffect(() => {
    onLoaded(items);
  }, [items, onLoaded]);
  
  return (
    <div className="page">
      {items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### 8.2 实时搜索建议

```jsx
function SearchWithSuggestions() {
  const [query, setQuery] = useState('');
  const [suggestionPromise, setSuggestionPromise] = useState(null);
  
  // 防抖处理
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setSuggestionPromise(fetchSuggestions(debouncedQuery));
    } else {
      setSuggestionPromise(null);
    }
  }, [debouncedQuery]);
  
  return (
    <div className="search-container">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      {suggestionPromise && (
        <Suspense fallback={<SuggestionsSkeleton />}>
          <Suggestions suggestionPromise={suggestionPromise} />
        </Suspense>
      )}
    </div>
  );
}

function Suggestions({ suggestionPromise }) {
  const suggestions = use(suggestionPromise);
  
  if (suggestions.length === 0) {
    return <div className="no-suggestions">无建议</div>;
  }
  
  return (
    <ul className="suggestions-list">
      {suggestions.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}

// 防抖Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
```

## 注意事项

### 1. Promise必须稳定

```jsx
// ❌ 错误：每次渲染创建新Promise
function Bad() {
  const data = use(fetchData());  // 无限循环！
  return <div>{data}</div>;
}

// ✅ 正确：使用useMemo或状态
function Good() {
  const promise = useMemo(() => fetchData(), []);
  const data = use(promise);
  return <div>{data}</div>;
}

// ✅ 或在组件外创建
const dataPromise = fetchData();
function AlsoGood() {
  const data = use(dataPromise);
  return <div>{data}</div>;
}
```

### 2. 避免重复请求

```jsx
// ❌ 问题：多个组件独立请求
function Parent() {
  return (
    <>
      <Child1 userId={123} />
      <Child2 userId={123} />
    </>
  );
}

// 每个子组件都会发起请求
function Child1({ userId }) {
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
}

// ✅ 解决：共享Promise
function BetterParent() {
  const userPromise = useMemo(() => fetchUser(123), []);
  
  return (
    <>
      <Child1 userPromise={userPromise} />
      <Child2 userPromise={userPromise} />
    </>
  );
}
```

### 3. 处理Promise更新

```jsx
// 当Promise需要更新时
function DataComponent({ userId }) {
  const [promise, setPromise] = useState(() => fetchUser(userId));
  
  useEffect(() => {
    // userId变化时创建新Promise
    setPromise(fetchUser(userId));
  }, [userId]);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <UserContent promise={promise} />
    </Suspense>
  );
}
```

### 4. 合理设置Suspense边界

```jsx
// ❌ 太粗粒度：整个页面一起加载
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Sidebar />
  <MainContent />
  <Footer />
</Suspense>

// ✅ 细粒度：独立加载
<>
  <Header />
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
  <Footer />
</>
```

### 5. 错误边界必不可少

```jsx
// ✅ 始终配合ErrorBoundary
<ErrorBoundary fallback={<ErrorDisplay />}>
  <Suspense fallback={<Loading />}>
    <DataComponent promise={dataPromise} />
  </Suspense>
</ErrorBoundary>
```

## 常见问题

### Q1: use()会缓存Promise结果吗？

**A:** React会在同一次渲染中缓存Promise的结果，但不会跨渲染缓存。需要自己实现缓存逻辑：

```jsx
// 使用React Cache API
import { cache } from 'react';

const getUser = cache(async (id) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});
```

### Q2: 如何处理Promise竞态条件？

**A:** use()和Suspense会自动处理竞态：

```jsx
function Component({ id }) {
  // id变化时，旧Promise的结果会被忽略
  const promise = useMemo(() => fetchData(id), [id]);
  const data = use(promise);
  return <div>{data}</div>;
}
```

### Q3: 可以在use()后使用useEffect吗？

**A:** 可以，但要注意依赖：

```jsx
function Component({ promise }) {
  const data = use(promise);
  
  useEffect(() => {
    console.log('Data loaded:', data);
  }, [data]);
  
  return <div>{data}</div>;
}
```

### Q4: 如何实现数据重新加载？

**A:**
```jsx
function RefreshableData({ userId }) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const promise = useMemo(() => {
    return fetchUser(userId);
  }, [userId, refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <>
      <button onClick={handleRefresh}>刷新</button>
      <Suspense fallback={<div>加载中...</div>}>
        <UserContent promise={promise} />
      </Suspense>
    </>
  );
}
```

## 总结

### use()处理Promise的核心优势

1. **简化代码**：无需手动管理loading/error状态
2. **声明式**：专注于数据展示，而非数据获取过程
3. **自动优化**：与Suspense集成实现流式渲染
4. **灵活调用**：可以在条件、循环中使用

### Promise数据获取最佳实践

```
✅ 使用useMemo稳定Promise
✅ 合理设置Suspense边界
✅ 实现Promise缓存机制
✅ 配合ErrorBoundary处理错误
✅ 预加载优化用户体验
✅ 并行加载独立资源
✅ 注意避免瀑布流问题
```

### 何时使用use()读取Promise

```
✅ 适合：
- 组件挂载时的初始数据
- 基于props的数据获取
- 服务端渲染数据
- 路由级别的数据加载

⚠️ 谨慎：
- 频繁更新的数据
- 用户交互触发的请求
- 需要精细控制loading的场景
```

use()读取Promise是React 19数据获取的标准方式，掌握它是构建现代React应用的关键！
