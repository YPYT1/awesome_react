# React Router与Server Components

## 概述

React Server Components (RSC) 是React的革命性特性，允许组件在服务器端渲染并直接访问后端资源。React Router v6与Server Components的结合，为构建高性能、SEO友好的全栈应用提供了强大的支持。本文深入探讨如何在服务器组件环境中使用React Router。

## Server Components基础

### 什么是Server Components

Server Components是在服务器端运行的React组件，它们可以：

1. 直接访问数据库和后端服务
2. 减少客户端JavaScript包体积
3. 改善首次加载性能
4. 保持敏感逻辑在服务器端

```jsx
// 服务器组件示例 (在文件顶部标记)
'use server';

// 这是一个Server Component
export default async function ProductList() {
  // 直接访问数据库
  const products = await db.products.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// 客户端组件需要显式声明
'use client';

export function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => setLiked(!liked)}>
        {liked ? 'Unlike' : 'Like'}
      </button>
    </div>
  );
}
```

### Server Components与客户端组件的区别

```jsx
// 对比表
const componentComparison = {
  serverComponents: {
    capabilities: [
      '直接访问后端资源（数据库、文件系统）',
      '使用服务器专用的npm包',
      '保持敏感数据和逻辑在服务器端',
      '减少客户端包体积'
    ],
    limitations: [
      '不能使用useState、useEffect等客户端Hook',
      '不能访问浏览器API',
      '不能处理用户交互事件',
      '不能使用Context'
    ]
  },

  clientComponents: {
    capabilities: [
      '使用所有React Hook',
      '处理用户交互',
      '访问浏览器API',
      '使用Context进行状态管理'
    ],
    limitations: [
      '不能直接访问后端资源',
      '增加客户端包体积',
      '不能导入服务器专用包'
    ]
  }
};

// Server Component
'use server';

async function UserDashboard({ userId }) {
  // 直接查询数据库
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
      followers: true
    }
  });

  // 调用其他服务器函数
  const analytics = await calculateUserAnalytics(userId);

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      
      {/* 服务器组件可以渲染客户端组件 */}
      <InteractiveStats data={analytics} />
      
      {/* 传递数据给客户端组件 */}
      <PostsList posts={user.posts} />
    </div>
  );
}

// Client Component
'use client';

function InteractiveStats({ data }) {
  const [view, setView] = useState('chart');

  return (
    <div>
      <button onClick={() => setView('chart')}>Chart</button>
      <button onClick={() => setView('table')}>Table</button>
      
      {view === 'chart' ? (
        <StatsChart data={data} />
      ) : (
        <StatsTable data={data} />
      )}
    </div>
  );
}
```

## React Router集成Server Components

### 基础路由配置

```jsx
// app/routes.jsx (服务器端)
'use server';

import { createBrowserRouter } from 'react-router-dom';

// Server Component作为路由元素
export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'products',
        element: <ProductsPage />,
        loader: async () => {
          // 服务器端数据加载
          const products = await db.products.findMany();
          return { products };
        }
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
        loader: async ({ params }) => {
          const product = await db.products.findUnique({
            where: { id: params.id }
          });
          
          if (!product) {
            throw new Response('Product not found', { status: 404 });
          }
          
          return { product };
        }
      }
    ]
  }
];

// app/entry.server.jsx
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';

export default function handleRequest(request) {
  const markup = renderToString(
    <RemixServer context={{}} url={request.url} />
  );

  return new Response('<!DOCTYPE html>' + markup, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// app/entry.client.jsx
'use client';

import { hydrateRoot } from 'react-dom/client';
import { RemixBrowser } from '@remix-run/react';

hydrateRoot(document, <RemixBrowser />);
```

### Loader与Server Components

```jsx
// Server Component with Loader
'use server';

import { useLoaderData } from 'react-router-dom';

// Loader函数在服务器端执行
export async function loader({ params }) {
  // 并行获取多个数据源
  const [user, posts, followers] = await Promise.all([
    fetchUser(params.userId),
    fetchUserPosts(params.userId),
    fetchUserFollowers(params.userId)
  ]);

  // 数据预处理
  const processedData = {
    user,
    posts: posts.map(post => ({
      ...post,
      excerpt: post.content.substring(0, 150)
    })),
    followerCount: followers.length,
    topFollowers: followers.slice(0, 5)
  };

  return processedData;
}

// Server Component
export default function UserProfile() {
  const { user, posts, followerCount, topFollowers } = useLoaderData();

  return (
    <div className="user-profile">
      {/* 服务器渲染的内容 */}
      <header className="profile-header">
        <img src={user.avatar} alt={user.name} />
        <h1>{user.name}</h1>
        <p>{followerCount} followers</p>
      </header>

      {/* 服务器渲染的帖子列表 */}
      <section className="posts-section">
        <h2>Recent Posts</h2>
        {posts.map(post => (
          <article key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>

      {/* 客户端交互组件 */}
      <FollowButton userId={user.id} />
      
      {/* 嵌套客户端组件 */}
      <CommentSection postId={posts[0]?.id} />
    </div>
  );
}

// 客户端组件
'use client';

function FollowButton({ userId }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await fetch(`/api/users/${userId}/follow`, {
        method: 'POST'
      });
      setFollowing(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleFollow} disabled={loading}>
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
```

### Action与Server Functions

```jsx
// Server Actions
'use server';

// Server Action函数
export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const userId = formData.get('userId');

  // 验证
  if (!title || !content) {
    return {
      error: 'Title and content are required'
    };
  }

  // 直接操作数据库
  const post = await db.post.create({
    data: {
      title,
      content,
      userId
    }
  });

  // 重新验证相关路由
  revalidatePath('/posts');
  revalidatePath(`/users/${userId}`);

  return {
    success: true,
    post
  };
}

// Server Action用于更新
export async function updatePost(postId, formData) {
  const title = formData.get('title');
  const content = formData.get('content');

  const post = await db.post.update({
    where: { id: postId },
    data: { title, content }
  });

  revalidatePath(`/posts/${postId}`);

  return { success: true, post };
}

// Server Action用于删除
export async function deletePost(postId) {
  await db.post.delete({
    where: { id: postId }
  });

  revalidatePath('/posts');

  return { success: true };
}

// 客户端组件使用Server Action
'use client';

import { useRouter } from 'react-router-dom';
import { createPost } from './actions';

function CreatePostForm({ userId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.target);
    formData.append('userId', userId);

    const result = await createPost(formData);

    if (result.error) {
      setError(result.error);
    } else {
      router.push(`/posts/${result.post.id}`);
    }

    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        name="title"
        placeholder="Post title"
        required
      />
      
      <textarea
        name="content"
        placeholder="Post content"
        rows="10"
        required
      />

      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## 流式渲染与Suspense

### 流式SSR

```jsx
// 流式渲染的Server Component
'use server';

import { Suspense } from 'react';

export default async function DashboardPage() {
  // 快速数据立即返回
  const user = await fetchUser();

  return (
    <div className="dashboard">
      {/* 立即渲染用户信息 */}
      <header>
        <h1>Welcome, {user.name}</h1>
      </header>

      {/* 慢速数据使用Suspense */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics userId={user.id} />
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity userId={user.id} />
      </Suspense>

      <Suspense fallback={<NotificationsSkeleton />}>
        <Notifications userId={user.id} />
      </Suspense>
    </div>
  );
}

// 独立的异步Server Component
async function Analytics({ userId }) {
  // 这个数据加载较慢，但不会阻塞页面其他部分
  const analytics = await fetchAnalytics(userId);

  return (
    <div className="analytics-widget">
      <h2>Analytics</h2>
      <div className="metrics">
        <div className="metric">
          <span className="value">{analytics.pageViews}</span>
          <span className="label">Page Views</span>
        </div>
        <div className="metric">
          <span className="value">{analytics.visitors}</span>
          <span className="label">Visitors</span>
        </div>
      </div>
    </div>
  );
}

async function RecentActivity({ userId }) {
  const activities = await fetchRecentActivity(userId);

  return (
    <div className="activity-feed">
      <h2>Recent Activity</h2>
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <span>{activity.description}</span>
          <time>{activity.timestamp}</time>
        </div>
      ))}
    </div>
  );
}

// Skeleton组件（客户端）
'use client';

function AnalyticsSkeleton() {
  return (
    <div className="analytics-skeleton">
      <div className="skeleton-title" />
      <div className="skeleton-metrics">
        <div className="skeleton-metric" />
        <div className="skeleton-metric" />
      </div>
    </div>
  );
}
```

### 嵌套Suspense边界

```jsx
// 多层Suspense
'use server';

export default async function ProductPage({ productId }) {
  // 关键产品信息
  const product = await fetchProduct(productId);

  return (
    <div className="product-page">
      {/* 立即显示产品基本信息 */}
      <div className="product-main">
        <img src={product.image} alt={product.name} />
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        <AddToCartButton productId={productId} />
      </div>

      {/* 第一优先级：产品描述和规格 */}
      <Suspense fallback={<DetailsSkeleton />}>
        <ProductDetails productId={productId} />
      </Suspense>

      {/* 第二优先级：评论区 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection productId={productId}>
          {/* 嵌套Suspense：评论统计 */}
          <Suspense fallback={<div>Loading stats...</div>}>
            <ReviewStats productId={productId} />
          </Suspense>

          {/* 嵌套Suspense：评论列表 */}
          <Suspense fallback={<div>Loading reviews...</div>}>
            <ReviewsList productId={productId} />
          </Suspense>
        </ReviewsSection>
      </Suspense>

      {/* 第三优先级：相关产品 */}
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts productId={productId} />
      </Suspense>
    </div>
  );
}

async function ProductDetails({ productId }) {
  const details = await fetchProductDetails(productId);

  return (
    <div className="product-details">
      <h2>Product Details</h2>
      <div dangerouslySetInnerHTML={{ __html: details.description }} />
      
      <div className="specifications">
        <h3>Specifications</h3>
        <dl>
          {Object.entries(details.specs).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

async function ReviewsSection({ productId, children }) {
  // 获取评论概览
  const overview = await fetchReviewsOverview(productId);

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <div className="rating-summary">
          <span className="average-rating">{overview.averageRating}</span>
          <span className="total-reviews">({overview.totalReviews} reviews)</span>
        </div>
      </div>

      {/* 渲染嵌套的Suspense内容 */}
      {children}
    </div>
  );
}

async function ReviewStats({ productId }) {
  const stats = await fetchReviewStats(productId);

  return (
    <div className="review-stats">
      {stats.distribution.map((item, index) => (
        <div key={index} className="rating-bar">
          <span>{5 - index} stars</span>
          <div className="bar">
            <div 
              className="fill" 
              style={{ width: `${item.percentage}%` }}
            />
          </div>
          <span>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

async function ReviewsList({ productId }) {
  const reviews = await fetchReviews(productId);

  return (
    <div className="reviews-list">
      {reviews.map(review => (
        <article key={review.id} className="review">
          <div className="review-header">
            <span className="author">{review.author}</span>
            <span className="rating">{'★'.repeat(review.rating)}</span>
          </div>
          <p className="review-text">{review.text}</p>
          <time>{new Date(review.date).toLocaleDateString()}</time>
        </article>
      ))}
    </div>
  );
}
```

## 数据获取策略

### 并行数据获取

```jsx
// 并行获取多个数据源
'use server';

export async function loader({ params }) {
  const { userId } = params;

  // 并行发起所有请求
  const [user, posts, followers, following, stats] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    db.follow.count({ where: { followingId: userId } }),
    db.follow.count({ where: { followerId: userId } }),
    calculateUserStats(userId)
  ]);

  return {
    user,
    posts,
    followerCount: followers,
    followingCount: following,
    stats
  };
}

// 瀑布式数据获取（避免）
async function badLoader({ params }) {
  // 不好的做法：串行请求
  const user = await fetchUser(params.userId);
  const posts = await fetchPosts(user.id); // 等待user
  const comments = await fetchComments(posts.map(p => p.id)); // 等待posts

  return { user, posts, comments };
}

// 优化后的并行请求
async function goodLoader({ params }) {
  const { userId } = params;

  // 第一批：只依赖userId
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId)
  ]);

  // 第二批：依赖第一批的结果
  const postIds = posts.map(p => p.id);
  const [comments, likes] = await Promise.all([
    fetchComments(postIds),
    fetchLikes(postIds)
  ]);

  return { user, posts, comments, likes };
}
```

### 增量静态生成

```jsx
// 使用ISR（Incremental Static Regeneration）
'use server';

export const revalidate = 60; // 60秒后重新生成

export async function loader({ params }) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });

  return { product };
}

export default function ProductPage() {
  const { product } = useLoaderData();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
      
      {/* 显示页面生成时间 */}
      <footer>
        <small>Page generated at: {new Date().toLocaleString()}</small>
      </footer>
    </div>
  );
}

// 按需重新验证
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateProduct(productId, data) {
  await db.product.update({
    where: { id: productId },
    data
  });

  // 重新验证特定路径
  revalidatePath(`/products/${productId}`);
  revalidatePath('/products'); // 产品列表页

  // 或使用标签重新验证
  revalidateTag('products');

  return { success: true };
}

// 在loader中使用缓存标签
export async function productsLoader() {
  const products = await fetch('https://api.example.com/products', {
    next: {
      tags: ['products'],
      revalidate: 3600 // 1小时
    }
  }).then(r => r.json());

  return { products };
}
```

### 请求去重

```jsx
// React自动去重相同的请求
'use server';

import { cache } from 'react';

// 使用cache包装数据获取函数
const getUser = cache(async (userId) => {
  console.log('Fetching user:', userId);
  
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  return user;
});

// 多个组件可以调用相同的函数，只会执行一次
export default async function UserPage({ userId }) {
  const user = await getUser(userId); // 第1次调用

  return (
    <div>
      <UserHeader userId={userId} /> {/* 内部调用getUser，使用缓存 */}
      <UserPosts userId={userId} />   {/* 内部调用getUser，使用缓存 */}
      <UserStats userId={userId} />   {/* 内部调用getUser，使用缓存 */}
    </div>
  );
}

async function UserHeader({ userId }) {
  const user = await getUser(userId); // 使用缓存，不会重复请求

  return (
    <header>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </header>
  );
}

async function UserPosts({ userId }) {
  const user = await getUser(userId); // 使用缓存
  const posts = await db.post.findMany({
    where: { authorId: user.id }
  });

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
        </article>
      ))}
    </div>
  );
}

// 预加载数据
'use server';

import { preload } from 'react-dom';

export async function ProductPage({ productId }) {
  // 预加载相关数据
  preload(getProductReviews(productId));
  preload(getRelatedProducts(productId));

  // 获取主要产品数据
  const product = await getProduct(productId);

  return (
    <div>
      <h1>{product.name}</h1>
      
      {/* 这些组件的数据已经预加载 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={productId} />
      </Suspense>
      
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts productId={productId} />
      </Suspense>
    </div>
  );
}
```

## 性能优化

### 代码分割与懒加载

```jsx
// 动态导入Server Components
'use server';

import { lazy } from 'react';

// 懒加载Server Component
const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function Page() {
  return (
    <div>
      <h1>Main Content</h1>
      
      {/* 懒加载heavy组件 */}
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}

// 条件加载
export default async function ConditionalPage({ userId }) {
  const user = await getUser(userId);

  return (
    <div>
      <h1>User: {user.name}</h1>
      
      {user.isPremium && (
        <Suspense fallback={<div>Loading premium features...</div>}>
          <PremiumFeatures userId={userId} />
        </Suspense>
      )}
    </div>
  );
}

// 路由级别的代码分割
const routes = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/dashboard',
    lazy: async () => {
      const { Dashboard, loader } = await import('./routes/dashboard');
      return { Component: Dashboard, loader };
    }
  },
  {
    path: '/admin',
    lazy: async () => {
      const { AdminPanel, loader } = await import('./routes/admin');
      return { Component: AdminPanel, loader };
    }
  }
];
```

### 选择性hydration

```jsx
// 只hydrate需要交互的部分
'use server';

export default async function Page() {
  const data = await fetchData();

  return (
    <div>
      {/* 纯展示内容，不需要hydration */}
      <article className="static-content">
        <h1>{data.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.content }} />
      </article>

      {/* 需要交互的部分才hydrate */}
      <InteractiveComments postId={data.id} />
    </div>
  );
}

'use client';

function InteractiveComments({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 这部分会被hydrate，因为需要交互
  return (
    <div className="comments">
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit">Post Comment</button>
      </form>
      
      {comments.map(comment => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  );
}

// 使用React.lazy进行选择性hydration
'use server';

const LazyInteractiveWidget = lazy(() => import('./InteractiveWidget'));

export default function Page() {
  return (
    <div>
      <StaticContent />
      
      {/* 只在需要时加载和hydrate */}
      <Suspense fallback={<div>Loading widget...</div>}>
        <LazyInteractiveWidget />
      </Suspense>
    </div>
  );
}
```

### 缓存策略

```jsx
// 多层缓存策略
'use server';

// 1. 应用层缓存
const appCache = new Map();

export async function getCachedData(key, fetcher, ttl = 60000) {
  const cached = appCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetcher();
  appCache.set(key, {
    data,
    timestamp: Date.now()
  });

  return data;
}

// 2. HTTP缓存
export async function loader() {
  const data = await fetch('https://api.example.com/data', {
    next: {
      revalidate: 3600 // 1小时缓存
    }
  }).then(r => r.json());

  return { data };
}

// 3. 数据库查询缓存
export async function getProductsWithCache() {
  return getCachedData(
    'products-list',
    async () => {
      return await db.product.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    300000 // 5分钟缓存
  );
}

// 4. CDN缓存头
export async function productImageLoader({ params }) {
  const product = await getProduct(params.id);

  return new Response(product.image, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}

// 5. 智能失效策略
'use server';

import { unstable_cache } from 'next/cache';

export const getCachedProducts = unstable_cache(
  async () => {
    return await db.product.findMany();
  },
  ['products-list'],
  {
    revalidate: 3600,
    tags: ['products']
  }
);

export async function createProduct(data) {
  const product = await db.product.create({ data });

  // 失效产品缓存
  revalidateTag('products');

  return product;
}
```

## 安全性考虑

### 敏感数据保护

```jsx
// Server Component中处理敏感数据
'use server';

export async function UserDashboard({ userId }) {
  // 在服务器端获取完整用户数据（包括敏感信息）
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      paymentMethods: true,
      privateSettings: true
    }
  });

  // 只传递必要的数据给客户端
  const safeUserData = {
    id: user.id,
    name: user.name,
    email: user.email
    // 不包含敏感字段如：password, apiKeys, paymentMethods等
  };

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      
      {/* 服务器端渲染敏感信息 */}
      <div className="payment-methods">
        {user.paymentMethods.map(pm => (
          <div key={pm.id}>
            {/* 只显示后4位 */}
            Card ending in {pm.last4}
          </div>
        ))}
      </div>

      {/* 只传递安全数据给客户端组件 */}
      <ClientProfile user={safeUserData} />
    </div>
  );
}

// 客户端组件只接收安全数据
'use client';

function ClientProfile({ user }) {
  // user对象不包含敏感信息
  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

// Server Action中的数据验证
'use server';

export async function updateUserEmail(userId, newEmail) {
  // 服务器端验证
  if (!isValidEmail(newEmail)) {
    throw new Error('Invalid email format');
  }

  // 检查权限
  const session = await getSession();
  if (session.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // 更新数据库
  const user = await db.user.update({
    where: { id: userId },
    data: { email: newEmail }
  });

  // 只返回必要信息
  return {
    success: true,
    email: user.email
  };
}
```

### API密钥保护

```jsx
// Server Component中安全使用API密钥
'use server';

export async function WeatherWidget({ city }) {
  // API密钥只存在于服务器端
  const apiKey = process.env.WEATHER_API_KEY;

  const weather = await fetch(
    `https://api.weather.com/data?city=${city}&apiKey=${apiKey}`
  ).then(r => r.json());

  return (
    <div className="weather-widget">
      <h3>Weather in {city}</h3>
      <p>Temperature: {weather.temp}°C</p>
      <p>Conditions: {weather.conditions}</p>
    </div>
  );
}

// 错误示例：不要在客户端组件中使用API密钥
'use client';

function BadWeatherWidget({ city }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // 错误！API密钥暴露在客户端
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
    fetch(`https://api.weather.com/data?city=${city}&apiKey=${apiKey}`)
      .then(r => r.json())
      .then(setWeather);
  }, [city]);

  return <div>{/* 渲染天气数据 */}</div>;
}

// 正确做法：通过Server Action调用API
'use server';

export async function fetchWeather(city) {
  const apiKey = process.env.WEATHER_API_KEY;
  
  const weather = await fetch(
    `https://api.weather.com/data?city=${city}&apiKey=${apiKey}`
  ).then(r => r.json());

  return weather;
}

// 客户端组件通过Server Action获取数据
'use client';

import { fetchWeather } from './actions';

function GoodWeatherWidget({ city }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // 调用Server Action，API密钥安全
    fetchWeather(city).then(setWeather);
  }, [city]);

  return <div>{/* 渲染天气数据 */}</div>;
}
```

## 实战案例

### 案例1：博客平台

```jsx
// 博客首页 - Server Component
'use server';

export async function loader() {
  const [posts, categories, featuredAuthors] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      include: { author: true },
      orderBy: { publishedAt: 'desc' },
      take: 10
    }),
    db.category.findMany(),
    db.user.findMany({
      where: { featured: true },
      take: 5
    })
  ]);

  return { posts, categories, featuredAuthors };
}

export default function BlogHomePage() {
  const { posts, categories, featuredAuthors } = useLoaderData();

  return (
    <div className="blog-home">
      <header className="blog-header">
        <h1>Our Blog</h1>
        <CategoryFilter categories={categories} />
      </header>

      <div className="blog-layout">
        <main className="posts-main">
          {posts.map(post => (
            <article key={post.id} className="post-preview">
              <Link to={`/blog/${post.slug}`}>
                <h2>{post.title}</h2>
              </Link>
              <p className="post-meta">
                By {post.author.name} on{' '}
                {new Date(post.publishedAt).toLocaleDateString()}
              </p>
              <p className="post-excerpt">{post.excerpt}</p>
            </article>
          ))}
        </main>

        <aside className="blog-sidebar">
          <div className="featured-authors">
            <h3>Featured Authors</h3>
            {featuredAuthors.map(author => (
              <Link
                key={author.id}
                to={`/authors/${author.id}`}
                className="author-card"
              >
                <img src={author.avatar} alt={author.name} />
                <span>{author.name}</span>
              </Link>
            ))}
          </div>

          <Suspense fallback={<div>Loading popular posts...</div>}>
            <PopularPosts />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

// 博客文章页 - Server Component
'use server';

export async function postLoader({ params }) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      category: true
    }
  });

  if (!post) {
    throw new Response('Post not found', { status: 404 });
  }

  return { post };
}

export default function BlogPostPage() {
  const { post } = useLoaderData();

  return (
    <article className="blog-post">
      <header className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <img src={post.author.avatar} alt={post.author.name} />
          <div>
            <Link to={`/authors/${post.author.id}`}>
              {post.author.name}
            </Link>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      </header>

      <div 
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* 延迟加载评论 */}
      <Suspense fallback={<CommentsLoading />}>
        <Comments postId={post.id} />
      </Suspense>

      {/* 延迟加载相关文章 */}
      <Suspense fallback={<RelatedLoading />}>
        <RelatedPosts categoryId={post.categoryId} currentPostId={post.id} />
      </Suspense>
    </article>
  );
}

// 客户端交互组件
'use client';

import { submitComment } from './actions';

function CommentForm({ postId }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitComment(postId, content);
      setContent('');
      // 刷新评论列表
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
}
```

### 案例2：电商产品页

```jsx
// 产品页 - Server Component with Streaming
'use server';

export async function productLoader({ params }) {
  // 立即获取关键产品信息
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      brand: true,
      category: true
    }
  });

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  return { product };
}

export default function ProductPage() {
  const { product } = useLoaderData();

  return (
    <div className="product-page">
      {/* 关键内容立即渲染 */}
      <div className="product-main">
        <div className="product-images">
          <ProductGallery images={product.images} />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="brand">by {product.brand.name}</p>
          <p className="price">${product.price}</p>
          
          <div className="product-description">
            {product.description}
          </div>

          {/* 客户端交互组件 */}
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* 流式加载的内容 */}
      <div className="product-secondary">
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviews productId={product.id} />
        </Suspense>

        <Suspense fallback={<SpecsSkeleton />}>
          <ProductSpecifications productId={product.id} />
        </Suspense>

        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedProducts 
            categoryId={product.categoryId}
            currentProductId={product.id}
          />
        </Suspense>

        <Suspense fallback={<QASkeleton />}>
          <ProductQA productId={product.id} />
        </Suspense>
      </div>
    </div>
  );
}

// 异步加载的评论组件
async function ProductReviews({ productId }) {
  const reviews = await db.review.findMany({
    where: { productId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const stats = await db.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: true
  });

  return (
    <div className="product-reviews">
      <div className="reviews-summary">
        <h2>Customer Reviews</h2>
        <div className="rating-overview">
          <span className="average-rating">
            {stats._avg.rating?.toFixed(1) || 'N/A'}
          </span>
          <span className="total-reviews">
            {stats._count} reviews
          </span>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="review-header">
              <span className="reviewer">{review.user.name}</span>
              <span className="rating">{'★'.repeat(review.rating)}</span>
            </div>
            <p className="review-text">{review.text}</p>
            <time>{new Date(review.createdAt).toLocaleDateString()}</time>
          </div>
        ))}
      </div>

      {/* 客户端评论表单 */}
      <ReviewForm productId={productId} />
    </div>
  );
}

// 相关产品推荐
async function RelatedProducts({ categoryId, currentProductId }) {
  const related = await db.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      published: true
    },
    take: 4,
    orderBy: { views: 'desc' }
  });

  return (
    <div className="related-products">
      <h2>You May Also Like</h2>
      <div className="products-grid">
        {related.map(product => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="product-card"
          >
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">${product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## 最佳实践总结

### 1. 组件划分原则

```jsx
// 组件类型决策树
const componentTypeDecision = {
  question1: '需要客户端交互（事件处理、状态）？',
  yesTo1: '使用Client Component',
  noTo1: {
    question2: '需要访问后端资源（数据库、API）？',
    yesTo2: '使用Server Component',
    noTo2: {
      question3: '是纯展示组件吗？',
      yesTo3: '优先使用Server Component（减少包体积）',
      noTo3: '使用Client Component'
    }
  }
};

// Server Component 适用场景
const serverComponentUseCases = [
  '数据获取',
  '直接访问后端资源',
  '包含敏感信息',
  '使用大型依赖库（只在服务器运行）',
  'SEO内容'
];

// Client Component 适用场景
const clientComponentUseCases = [
  '使用React Hooks（useState, useEffect等）',
  '事件处理',
  '浏览器API使用',
  '实时交互',
  '动画效果'
];
```

### 2. 性能优化

```jsx
const performanceOptimizations = {
  streaming: '使用Suspense实现流式渲染',
  parallelFetch: '并行获取独立数据源',
  caching: '多层缓存策略',
  codeS splitting: '按路由分割代码',
  selectiveHydration: '只hydrate需要交互的部分'
};
```

### 3. 安全性

```jsx
const securityBestPractices = {
  sensitiveData: '敏感数据只在Server Component处理',
  apiKeys: 'API密钥只在服务器端使用',
  validation: '服务器端验证所有输入',
  sanitization: '清理用户输入防止XSS',
  authorization: '服务器端检查权限'
};
```

## 总结

React Router与Server Components的结合提供了：

1. **更好的性能**：服务器端渲染和流式传输
2. **更小的包体积**：Server Components不增加客户端负担
3. **更好的SEO**：内容在服务器端渲染
4. **更安全**：敏感逻辑和数据保留在服务器端
5. **更灵活**：可以混合使用Server和Client Components

正确使用Server Components能够构建出高性能、安全、用户体验优秀的现代Web应用。
