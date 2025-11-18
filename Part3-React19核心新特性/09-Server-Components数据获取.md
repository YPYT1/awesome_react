# Server Components数据获取

## 学习目标

通过本章学习，你将掌握：

- Server Components中的数据获取方式
- 直接数据库访问
- 并行和串行数据获取
- 数据缓存策略
- 错误处理机制
- 性能优化技巧
- 与传统方式的对比
- 实战最佳实践

## 第一部分：基础数据获取

### 1.1 async/await模式

```jsx
// Server Component可以直接async
async function BlogPost({ id }) {
  // 直接await数据获取
  const post = await fetchPost(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// 无需：
// ❌ useState
// ❌ useEffect
// ❌ loading状态
// ❌ error状态
```

### 1.2 数据库直接访问

```jsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 直接查询数据库
async function UserList() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { posts: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20
  });
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user._count.posts} posts
        </li>
      ))}
    </ul>
  );
}

// Prisma客户端代码不会发送到客户端！
// 数据库连接字符串安全
```

### 1.3 API调用

```jsx
// Server Component中的API调用
async function WeatherWidget({ city }) {
  const response = await fetch(
    `https://api.weather.com/v1/current?city=${city}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_API_KEY}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather');
  }
  
  const weather = await response.json();
  
  return (
    <div className="weather">
      <h3>{weather.city}</h3>
      <p>{weather.temperature}°C</p>
      <p>{weather.description}</p>
    </div>
  );
}

// API密钥安全地保存在服务器环境变量中
```

## 第二部分：并行数据获取

### 2.1 Promise.all并行

```jsx
// 并行获取多个独立数据源
async function Dashboard({ userId }) {
  // 同时启动所有请求
  const [user, posts, stats, notifications] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserStats(userId),
    fetchNotifications(userId)
  ]);
  
  return (
    <div className="dashboard">
      <UserHeader user={user} />
      <StatsPanel stats={stats} />
      <PostsList posts={posts} />
      <NotificationsList notifications={notifications} />
    </div>
  );
}

// 对比传统方式：需要多个useEffect或复杂的Promise管理
```

### 2.2 嵌套Suspense并行

```jsx
// 父组件
async function Page({ userId }) {
  // 立即创建所有Promise（开始并行加载）
  return (
    <div>
      {/* 用户信息 */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile userId={userId} />
      </Suspense>
      
      {/* 文章列表 */}
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
      
      {/* 统计数据 */}
      <Suspense fallback={<StatsSkeleton />}>
        <UserStats userId={userId} />
      </Suspense>
    </div>
  );
}

// 子组件独立获取数据
async function UserProfile({ userId }) {
  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
}

async function UserPosts({ userId }) {
  const posts = await fetchPosts(userId);
  return <PostsList posts={posts} />;
}

async function UserStats({ userId }) {
  const stats = await fetchStats(userId);
  return <Stats data={stats} />;
}

// 三个请求并行执行，各自独立显示
```

### 2.3 条件并行

```jsx
async function ProductPage({ productId, includeReviews = false }) {
  // 基础数据总是获取
  const productPromise = fetchProduct(productId);
  
  // 条件性数据获取
  const promises = [productPromise];
  
  if (includeReviews) {
    promises.push(fetchReviews(productId));
  }
  
  const results = await Promise.all(promises);
  const product = results[0];
  const reviews = results[1] || null;
  
  return (
    <div>
      <ProductDetail product={product} />
      {reviews && <Reviews data={reviews} />}
    </div>
  );
}
```

## 第三部分：串行数据获取

### 3.1 依赖数据获取

```jsx
// 第二个请求依赖第一个请求的结果
async function UserWithRecentPosts({ username }) {
  // 1. 先获取用户信息
  const user = await fetchUserByUsername(username);
  
  // 2. 使用用户ID获取文章
  const posts = await fetchPostsByUserId(user.id);
  
  // 3. 获取每篇文章的评论统计
  const postsWithCommentCount = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      commentCount: await fetchCommentCount(post.id)
    }))
  );
  
  return (
    <div>
      <h1>{user.name}的文章</h1>
      <ul>
        {postsWithCommentCount.map(post => (
          <li key={post.id}>
            {post.title} - {post.commentCount} 评论
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.2 瀑布流优化

```jsx
// ❌ 问题：瀑布流（串行）
async function SlowPage({ userId }) {
  const user = await fetchUser(userId);
  // 等待user完成
  
  const posts = await fetchPosts(user.id);
  // 等待posts完成
  
  const comments = await fetchComments(posts[0].id);
  // 等待comments完成
  
  return <div>...</div>;
}

// ✅ 优化：提前启动请求
async function FastPage({ userId }) {
  // 立即启动第一个请求
  const userPromise = fetchUser(userId);
  
  // 可以在外部组件中启动更多请求
  return (
    <Suspense fallback={<Loading />}>
      <UserContent userPromise={userPromise} userId={userId} />
    </Suspense>
  );
}

async function UserContent({ userPromise, userId }) {
  const user = await userPromise;
  
  // 立即启动下一个请求
  const postsPromise = fetchPosts(user.id);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <Suspense fallback={<PostsLoading />}>
        <PostsContent postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}
```

### 3.3 组件级数据预取

```jsx
// layout.jsx - 提前启动数据获取
export default async function Layout({ params, children }) {
  // 在布局层启动数据获取
  const userPromise = fetchUser(params.userId);
  
  return (
    <div>
      <Suspense fallback={<NavSkeleton />}>
        <Nav userPromise={userPromise} />
      </Suspense>
      
      <main>
        {children}
      </main>
    </div>
  );
}

// page.jsx - 可以复用父级的Promise
export default async function Page({ params }) {
  // 如果layout已经获取，这里会使用缓存
  const user = await fetchUser(params.userId);
  
  return <div>{user.name}</div>;
}
```

## 第四部分：数据缓存

### 4.1 fetch缓存

```jsx
// Next.js 自动缓存fetch请求
async function CachedComponent() {
  // 默认缓存
  const data = await fetch('https://api.example.com/data');
  
  // 自定义缓存选项
  const freshData = await fetch('https://api.example.com/data', {
    cache: 'no-store'  // 不缓存
  });
  
  const revalidatedData = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }  // 1小时后重新验证
  });
  
  return <div>...</div>;
}
```

### 4.2 React Cache API

```jsx
import { cache } from 'react';

// 创建缓存的数据获取函数
const getUser = cache(async (userId) => {
  console.log('Fetching user:', userId);
  
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// 多个组件调用相同参数
async function Header({ userId }) {
  const user = await getUser(userId);  // 发起请求
  return <div>{user.name}</div>;
}

async function Sidebar({ userId }) {
  const user = await getUser(userId);  // 使用缓存
  return <div>{user.email}</div>;
}

async function Main({ userId }) {
  const user = await getUser(userId);  // 使用缓存
  return <div>{user.bio}</div>;
}

// 相同userId只会请求一次！
```

### 4.3 自定义缓存层

```jsx
// 创建内存缓存
class DataCache {
  constructor() {
    this.cache = new Map();
  }
  
  async get(key, fetcher, ttl = 5 * 60 * 1000) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log('Cache hit:', key);
      return cached.data;
    }
    
    console.log('Cache miss:', key);
    const data = await fetcher();
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  invalidate(key) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

const dataCache = new DataCache();

// 使用缓存
async function CachedData({ userId }) {
  const user = await dataCache.get(
    `user:${userId}`,
    () => fetchUser(userId),
    10 * 60 * 1000  // 10分钟TTL
  );
  
  return <div>{user.name}</div>;
}
```

## 第五部分：错误处理

### 5.1 try-catch

```jsx
async function SafeComponent({ userId }) {
  try {
    const user = await fetchUser(userId);
    
    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.bio}</p>
      </div>
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // 返回错误UI
    return (
      <div className="error">
        <h2>加载失败</h2>
        <p>{error.message}</p>
      </div>
    );
  }
}
```

### 5.2 ErrorBoundary配合

```jsx
// 抛出错误让ErrorBoundary处理
async function UserProfile({ userId }) {
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    // 抛出错误
    throw new Error(`Failed to load user: ${response.status}`);
  }
  
  const user = await response.json();
  
  return <div>{user.name}</div>;
}

// 使用ErrorBoundary
function Page() {
  return (
    <ErrorBoundary fallback={<ErrorUI />}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId={123} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 5.3 降级处理

```jsx
async function ProductWithFallback({ productId }) {
  try {
    // 尝试获取完整产品信息
    const product = await fetchFullProduct(productId);
    return <FullProductView product={product} />;
  } catch (error) {
    console.warn('Failed to load full product, using basic info');
    
    // 降级到基础信息
    try {
      const basicProduct = await fetchBasicProduct(productId);
      return <BasicProductView product={basicProduct} />;
    } catch (fallbackError) {
      // 最后的降级
      return (
        <div className="error">
          <h3>商品暂时无法显示</h3>
          <p>请稍后再试</p>
        </div>
      );
    }
  }
}
```

## 第六部分：性能优化

### 6.1 查询优化

```jsx
import { prisma } from '@/lib/database';

async function OptimizedUserList() {
  // ✅ 只查询需要的字段
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      // 不查询不需要的字段（如password, token等）
    },
    // ✅ 使用索引字段排序
    orderBy: {
      createdAt: 'desc'
    },
    // ✅ 限制返回数量
    take: 50
  });
  
  return <UserList users={users} />;
}
```

### 6.2 预加载关联数据

```jsx
async function PostsWithAuthors() {
  // ✅ 使用include预加载关联数据
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      _count: {
        select: {
          comments: true
        }
      }
    }
  });
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>作者: {post.author.name}</p>
          <p>评论: {post._count.comments}</p>
        </li>
      ))}
    </ul>
  );
}

// 避免N+1查询问题
```

### 6.3 数据聚合

```jsx
async function DashboardStats() {
  // ✅ 在数据库层面聚合
  const stats = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_users,
      AVG(post_count) as avg_posts_per_user
    FROM users
  `;
  
  return (
    <div className="stats">
      <StatCard title="总用户" value={stats[0].total_users} />
      <StatCard title="新用户(7天)" value={stats[0].new_users} />
      <StatCard title="平均文章数" value={stats[0].avg_posts_per_user} />
    </div>
  );
}

// 在服务器聚合，不传输原始数据
```

### 6.4 流式渲染

```jsx
// 使用Suspense实现流式渲染
async function ProductPage({ id }) {
  return (
    <div>
      {/* 快速显示的部分 */}
      <Suspense fallback={<HeaderSkeleton />}>
        <ProductHeader productId={id} />
      </Suspense>
      
      {/* 慢速显示的部分 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={id} />
      </Suspense>
      
      {/* 最慢的部分 */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={id} />
      </Suspense>
    </div>
  );
}

// 渐进式显示，无需等待全部完成
```

## 第七部分：实战模式

### 7.1 分页数据

```jsx
async function PostsPage({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div>
      <PostsList posts={posts} />
      <Pagination 
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
```

### 7.2 搜索功能

```jsx
async function SearchResults({ searchParams }) {
  const query = searchParams.q || '';
  
  if (!query) {
    return <EmptySearch />;
  }
  
  const results = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      author: {
        select: { name: true }
      }
    },
    take: 50
  });
  
  return (
    <div>
      <h2>找到 {results.length} 个结果</h2>
      <ResultsList results={results} />
    </div>
  );
}
```

### 7.3 实时数据

```jsx
async function LiveStats() {
  // 每次请求都获取最新数据
  const stats = await fetch('https://api.example.com/stats', {
    cache: 'no-store'  // 不缓存
  }).then(r => r.json());
  
  return (
    <div>
      <StatCard title="在线用户" value={stats.onlineUsers} />
      <StatCard title="活跃会话" value={stats.activeSessions} />
      <time>更新时间: {new Date().toLocaleTimeString()}</time>
    </div>
  );
}
```

## 注意事项

### 1. 避免过度串行

```jsx
// ❌ 不好：串行获取
async function Slow() {
  const a = await fetchA();
  const b = await fetchB();  // 等待a
  const c = await fetchC();  // 等待a和b
  return <div>{a + b + c}</div>;
}

// ✅ 好：并行获取
async function Fast() {
  const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC()
  ]);
  return <div>{a + b + c}</div>;
}
```

### 2. 合理使用缓存

```jsx
// ✅ 根据数据特性设置缓存
// 静态数据：长期缓存
const staticData = await fetch('/api/config', {
  next: { revalidate: 86400 }  // 24小时
});

// 动态数据：短期缓存
const dynamicData = await fetch('/api/stats', {
  next: { revalidate: 60 }  // 1分钟
});

// 实时数据：不缓存
const liveData = await fetch('/api/live', {
  cache: 'no-store'
});
```

### 3. 错误处理全面

```jsx
// ✅ 完整的错误处理
async function RobustComponent({ id }) {
  try {
    const data = await fetchData(id);
    
    if (!data) {
      return <NotFound />;
    }
    
    return <DataView data={data} />;
  } catch (error) {
    if (error.status === 404) {
      return <NotFound />;
    }
    
    if (error.status === 403) {
      return <Forbidden />;
    }
    
    throw error;  // 其他错误向上抛出
  }
}
```

## 常见问题

### Q1: Server Component中能使用useState吗？

**A:** 不能。Server Component无状态，不能使用任何Hooks。

### Q2: 如何处理用户交互触发的数据获取？

**A:** 使用Server Actions或在Client Component中获取。

### Q3: 数据获取失败会怎样？

**A:** 会抛出错误，需要ErrorBoundary捕获。

## 总结

### Server Components数据获取优势

```
✅ 直接async/await
✅ 访问服务器资源
✅ 并行请求优化
✅ 自动缓存
✅ 流式渲染
✅ 更少的客户端代码
✅ 更好的性能
```

### 最佳实践

```
1. 优先使用并行请求
2. 合理设置缓存策略
3. 使用Suspense流式渲染
4. 完善错误处理
5. 优化数据库查询
6. 避免过度获取数据
7. 利用React Cache API
```

Server Components让数据获取变得简单而强大！
