# Loader数据加载

## 概述

React Router v6的Loader机制允许在路由组件渲染之前预先加载所需的数据，解决了传统方式中组件挂载后再获取数据导致的闪烁和加载状态管理问题。Loader提供了更好的用户体验和更清晰的数据流管理。

## Loader基础

### 基础Loader用法

```jsx
import { createBrowserRouter, useLoaderData } from 'react-router-dom';

// Loader函数
async function userLoader({ params }) {
  const { userId } = params;
  
  // 模拟API调用
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    throw new Response('User not found', { status: 404 });
  }
  
  return response.json();
}

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'users/:userId',
        element: <UserProfile />,
        loader: userLoader
      }
    ]
  }
]);

// 组件中使用Loader数据
function UserProfile() {
  // 获取Loader返回的数据
  const user = useLoaderData();
  
  // 数据已经预加载，无需loading状态
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Join Date: {new Date(user.joinDate).toLocaleDateString()}</p>
    </div>
  );
}

function App() {
  return <RouterProvider router={router} />;
}
```

### 复杂Loader示例

```jsx
// 产品详情页Loader
async function productDetailLoader({ params, request }) {
  const { productId } = params;
  const url = new URL(request.url);
  const variant = url.searchParams.get('variant');
  
  // 并行获取多个数据源
  const [product, reviews, relatedProducts] = await Promise.all([
    fetch(`/api/products/${productId}`).then(r => r.json()),
    fetch(`/api/products/${productId}/reviews`).then(r => r.json()),
    fetch(`/api/products/${productId}/related`).then(r => r.json())
  ]);
  
  // 如果指定了变体，获取变体信息
  let variantInfo = null;
  if (variant) {
    variantInfo = await fetch(`/api/products/${productId}/variants/${variant}`)
      .then(r => r.json());
  }

  return {
    product,
    reviews,
    relatedProducts,
    variantInfo,
    selectedVariant: variant
  };
}

// 使用复杂Loader数据
function ProductDetail() {
  const { 
    product, 
    reviews, 
    relatedProducts, 
    variantInfo, 
    selectedVariant 
  } = useLoaderData();

  const navigate = useNavigate();

  const handleVariantChange = (variantId) => {
    navigate(`/products/${product.id}?variant=${variantId}`);
  };

  return (
    <div className="product-detail">
      <div className="product-main">
        <div className="product-images">
          <img 
            src={variantInfo?.image || product.image} 
            alt={product.name} 
          />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-price">
            ${variantInfo?.price || product.price}
          </p>
          <p className="product-description">
            {product.description}
          </p>

          {/* 变体选择器 */}
          {product.variants && (
            <div className="variant-selector">
              <h3>Select Variant:</h3>
              {product.variants.map(variant => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantChange(variant.id)}
                  className={selectedVariant === variant.id ? 'active' : ''}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          )}

          <button className="add-to-cart">
            Add to Cart
          </button>
        </div>
      </div>

      {/* 评论区 */}
      <div className="product-reviews">
        <h2>Reviews ({reviews.length})</h2>
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{review.author}</span>
                <span className="review-rating">
                  {'★'.repeat(review.rating)}
                </span>
              </div>
              <p className="review-content">{review.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 相关产品 */}
      <div className="related-products">
        <h2>Related Products</h2>
        <div className="products-grid">
          {relatedProducts.map(relatedProduct => (
            <div key={relatedProduct.id} className="product-card">
              <Link to={`/products/${relatedProduct.id}`}>
                <img src={relatedProduct.image} alt={relatedProduct.name} />
                <h3>{relatedProduct.name}</h3>
                <p>${relatedProduct.price}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Loader参数

```jsx
// Loader函数接收的参数详解
async function advancedLoader({ params, request, context }) {
  // params: 路径参数
  const { userId, postId } = params;
  
  // request: 请求对象
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  
  // context: 额外的上下文（如果有）
  const { user, permissions } = context || {};
  
  console.log('Loading data for:', {
    userId,
    postId,
    page,
    limit,
    currentUser: user?.id
  });

  // 权限检查
  if (user && !permissions.includes('posts:read')) {
    throw new Response('Forbidden', { status: 403 });
  }

  // 条件性数据加载
  const baseData = {
    user: await fetchUser(userId),
    post: await fetchPost(postId)
  };

  // 根据查询参数加载额外数据
  if (searchParams.get('includeComments') === 'true') {
    baseData.comments = await fetchComments(postId, page, limit);
  }

  if (searchParams.get('includeRelated') === 'true') {
    baseData.relatedPosts = await fetchRelatedPosts(postId);
  }

  return baseData;
}

// 路由配置
{
  path: 'users/:userId/posts/:postId',
  element: <PostDetail />,
  loader: advancedLoader
}
```

## Loader错误处理

### 错误处理策略

```jsx
// 带错误处理的Loader
async function userWithErrorHandling({ params }) {
  const { userId } = params;
  
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (response.status === 404) {
      throw new Response('User not found', { 
        status: 404,
        statusText: 'User Not Found'
      });
    }
    
    if (response.status === 403) {
      throw new Response('Access forbidden', { 
        status: 403,
        statusText: 'Forbidden'
      });
    }
    
    if (!response.ok) {
      throw new Response('Failed to load user', { 
        status: response.status,
        statusText: 'Server Error'
      });
    }
    
    const user = await response.json();
    
    // 数据验证
    if (!user || !user.id) {
      throw new Response('Invalid user data', { 
        status: 500,
        statusText: 'Invalid Data'
      });
    }
    
    return user;
    
  } catch (error) {
    // 处理网络错误
    if (error instanceof TypeError) {
      throw new Response('Network error', { 
        status: 0,
        statusText: 'Network Error'
      });
    }
    
    // 重新抛出Response错误
    if (error instanceof Response) {
      throw error;
    }
    
    // 处理其他错误
    console.error('Loader error:', error);
    throw new Response('Unexpected error', { 
      status: 500,
      statusText: 'Internal Error'
    });
  }
}

// 错误边界组件
function UserProfileErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (error?.status === 404) {
    return (
      <div className="error-page">
        <h1>User Not Found</h1>
        <p>The requested user does not exist.</p>
        <button onClick={() => navigate('/users')}>
          Back to Users List
        </button>
      </div>
    );
  }

  if (error?.status === 403) {
    return (
      <div className="error-page">
        <h1>Access Denied</h1>
        <p>You don't have permission to view this user's profile.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>Error: {error?.statusText || 'Unknown error'}</p>
      <button onClick={() => navigate(0)}>Try Again</button>
    </div>
  );
}

// 路由配置with错误处理
{
  path: 'users/:userId',
  element: <UserProfile />,
  loader: userWithErrorHandling,
  errorElement: <UserProfileErrorBoundary />
}
```

### 重试和降级机制

```jsx
// 带重试机制的Loader
async function resilientLoader({ params }, retryCount = 0) {
  const MAX_RETRIES = 3;
  const { resourceId } = params;
  
  try {
    const response = await fetch(`/api/resources/${resourceId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
    
  } catch (error) {
    console.error(`Loader attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES) {
      // 指数退避重试
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return resilientLoader({ params }, retryCount + 1);
    }
    
    // 重试次数用尽，返回降级数据
    console.warn('All retry attempts failed, returning fallback data');
    
    return {
      id: resourceId,
      name: 'Resource Unavailable',
      error: true,
      fallback: true
    };
  }
}

// 使用降级数据的组件
function ResourceDetail() {
  const resource = useLoaderData();
  
  if (resource.fallback) {
    return (
      <div className="resource-fallback">
        <h1>{resource.name}</h1>
        <div className="error-message">
          <p>Unable to load resource details. Please try again later.</p>
          <button onClick={() => navigate(0)}>Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-detail">
      <h1>{resource.name}</h1>
      <p>{resource.description}</p>
      {/* 正常渲染逻辑 */}
    </div>
  );
}
```

## 高级Loader模式

### 依赖加载

```jsx
// 依赖链式Loader
async function blogPostLoader({ params }) {
  const { postId } = params;
  
  // 首先获取文章基本信息
  const post = await fetch(`/api/posts/${postId}`).then(r => r.json());
  
  // 基于文章信息获取作者数据
  const author = await fetch(`/api/users/${post.authorId}`).then(r => r.json());
  
  // 获取同作者的其他文章
  const otherPosts = await fetch(`/api/users/${post.authorId}/posts?exclude=${postId}`)
    .then(r => r.json());
  
  // 获取文章分类信息
  const category = post.categoryId 
    ? await fetch(`/api/categories/${post.categoryId}`).then(r => r.json())
    : null;
    
  // 获取相关标签
  const tags = await Promise.all(
    post.tagIds.map(tagId =>
      fetch(`/api/tags/${tagId}`).then(r => r.json())
    )
  );

  return {
    post,
    author,
    otherPosts,
    category,
    tags
  };
}

// 条件加载Loader
async function dashboardLoader({ request }) {
  const url = new URL(request.url);
  const includeAnalytics = url.searchParams.get('analytics') === 'true';
  const dateRange = url.searchParams.get('range') || '7d';
  
  // 基础数据
  const baseData = {
    user: await fetchCurrentUser(),
    notifications: await fetchNotifications()
  };
  
  // 条件性加载分析数据
  if (includeAnalytics) {
    baseData.analytics = await fetchAnalytics(dateRange);
    baseData.chartData = await fetchChartData(dateRange);
  }
  
  return baseData;
}

// 批量Loader
async function batchLoader({ params }) {
  const { category } = params;
  
  // 并行加载所有需要的数据
  const [products, filters, brands, reviews] = await Promise.all([
    fetch(`/api/products?category=${category}`).then(r => r.json()),
    fetch(`/api/categories/${category}/filters`).then(r => r.json()),
    fetch(`/api/categories/${category}/brands`).then(r => r.json()),
    fetch(`/api/categories/${category}/reviews-summary`).then(r => r.json())
  ]);
  
  return {
    products,
    filters,
    brands,
    reviews,
    category,
    loadedAt: new Date().toISOString()
  };
}
```

### 缓存Loader

```jsx
// Loader缓存系统
class LoaderCache {
  constructor(ttl = 5 * 60 * 1000) { // 默认5分钟TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

const loaderCache = new LoaderCache();

// 带缓存的Loader
async function cachedUserLoader({ params }) {
  const { userId } = params;
  const cacheKey = `user-${userId}`;
  
  // 检查缓存
  const cached = loaderCache.get(cacheKey);
  if (cached) {
    console.log('Returning cached user data');
    return cached;
  }
  
  console.log('Fetching fresh user data');
  const user = await fetch(`/api/users/${userId}`).then(r => r.json());
  
  // 缓存结果
  loaderCache.set(cacheKey, user);
  
  return user;
}

// 智能缓存Loader
async function smartCachedLoader({ params, request }) {
  const { resourceId } = params;
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';
  
  const cacheKey = `resource-${resourceId}-${url.search}`;
  
  if (!forceRefresh) {
    const cached = loaderCache.get(cacheKey);
    if (cached) return cached;
  }
  
  const data = await fetchResource(resourceId, Object.fromEntries(url.searchParams));
  loaderCache.set(cacheKey, data);
  
  return data;
}
```

## Loader与状态管理结合

### Loader与Redux结合

```jsx
import { store } from './store';

// 使用Redux store的Loader
async function reduxAwareLoader({ params }) {
  const state = store.getState();
  const { currentUser } = state.auth;
  
  if (!currentUser) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  // 使用当前用户信息加载数据
  const data = await fetchUserSpecificData(currentUser.id, params.resourceId);
  
  // 可以dispatch action更新store
  store.dispatch(setLoaderData(data));
  
  return data;
}

// 与Zustand结合
import { useUserStore } from './stores/userStore';

async function zustandAwareLoader({ params }) {
  const userStore = useUserStore.getState();
  
  if (!userStore.user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  return await fetchData(params.id, userStore.preferences);
}

// 更新Zustand store的Loader
async function loaderThatUpdatesStore({ params }) {
  const data = await fetchData(params.id);
  
  // 更新store
  useUserStore.getState().setLastViewedItem(data);
  
  return data;
}
```

### Loader预处理数据

```jsx
// 数据预处理Loader
async function preprocessedDataLoader({ params }) {
  const { userId } = params;
  
  // 获取原始数据
  const [user, posts, activities] = await Promise.all([
    fetch(`/api/users/${userId}`).then(r => r.json()),
    fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    fetch(`/api/users/${userId}/activities`).then(r => r.json())
  ]);
  
  // 数据预处理
  const processedData = {
    user: {
      ...user,
      displayName: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
      memberSince: new Date(user.createdAt).getFullYear()
    },
    
    posts: posts.map(post => ({
      ...post,
      excerpt: post.content.substring(0, 150) + '...',
      readTime: Math.ceil(post.content.split(' ').length / 200), // 假设200词/分钟
      publishedAt: new Date(post.publishedAt).toLocaleDateString()
    })),
    
    activities: activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10) // 只保留最新10条
      .map(activity => ({
        ...activity,
        timeAgo: formatTimeAgo(activity.timestamp),
        icon: getActivityIcon(activity.type)
      })),
    
    stats: {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
      avgPostsPerMonth: posts.length / getMonthsSinceJoined(user.createdAt),
      lastActivity: activities[0]?.timestamp
    }
  };

  return processedData;
}

// 使用预处理数据
function EnhancedUserProfile() {
  const { user, posts, activities, stats } = useLoaderData();

  return (
    <div className="enhanced-user-profile">
      <div className="user-header">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.displayName} />
          ) : (
            <div className="avatar-initials">{user.initials}</div>
          )}
        </div>
        
        <div className="user-info">
          <h1>{user.displayName}</h1>
          <p>Member since {user.memberSince}</p>
          <p>{user.bio}</p>
        </div>
        
        <div className="user-stats">
          <div className="stat">
            <span className="stat-value">{stats.totalPosts}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.totalLikes}</span>
            <span className="stat-label">Likes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.avgPostsPerMonth.toFixed(1)}</span>
            <span className="stat-label">Posts/Month</span>
          </div>
        </div>
      </div>

      <div className="user-content">
        <div className="user-posts">
          <h2>Recent Posts</h2>
          {posts.map(post => (
            <article key={post.id} className="post-preview">
              <h3>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <p className="post-meta">
                {post.publishedAt} · {post.readTime} min read
              </p>
              <p className="post-excerpt">{post.excerpt}</p>
            </article>
          ))}
        </div>

        <aside className="user-activity">
          <h2>Recent Activity</h2>
          {activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">{activity.icon}</span>
              <div className="activity-details">
                <p>{activity.description}</p>
                <time>{activity.timeAgo}</time>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
```

## 实战案例

### 案例1：电商产品搜索

```jsx
// 搜索结果Loader
async function searchResultsLoader({ request }) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);
  
  const {
    q: query = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sortBy = 'relevance',
    page = '1',
    limit = '20'
  } = searchParams;

  if (!query.trim()) {
    return {
      results: [],
      totalCount: 0,
      facets: {},
      suggestions: await fetchPopularSearches()
    };
  }

  // 构建搜索请求
  const searchRequest = {
    query: query.trim(),
    filters: {
      category: category || undefined,
      priceRange: minPrice && maxPrice ? [+minPrice, +maxPrice] : undefined
    },
    sort: {
      field: sortBy,
      order: sortBy === 'price' ? 'asc' : 'desc'
    },
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };

  // 并行执行搜索和相关数据获取
  const [searchResults, facets, suggestions] = await Promise.all([
    performSearch(searchRequest),
    fetchSearchFacets(query, { category }),
    fetchSearchSuggestions(query)
  ]);

  return {
    results: searchResults.items,
    totalCount: searchResults.totalCount,
    facets,
    suggestions,
    searchParams,
    hasNextPage: searchResults.hasNextPage,
    hasPreviousPage: searchResults.hasPreviousPage
  };
}

// 搜索结果页面
function SearchResults() {
  const {
    results,
    totalCount,
    facets,
    suggestions,
    searchParams,
    hasNextPage,
    hasPreviousPage
  } = useLoaderData();

  const [searchParamsState, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const updateSearch = (newParams) => {
    const updatedParams = { ...searchParams, ...newParams };
    
    // 清除空值
    Object.keys(updatedParams).forEach(key => {
      if (!updatedParams[key]) delete updatedParams[key];
    });
    
    setSearchParams(updatedParams);
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>
          {searchParams.q ? `Search results for "${searchParams.q}"` : 'Search'}
        </h1>
        
        {totalCount > 0 && (
          <p>{totalCount} products found</p>
        )}
        
        <div className="search-controls">
          <select
            value={searchParams.sortBy}
            onChange={(e) => updateSearch({ sortBy: e.target.value, page: 1 })}
          >
            <option value="relevance">Most Relevant</option>
            <option value="price">Price</option>
            <option value="rating">Customer Rating</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="search-content">
        {/* 侧边栏过滤器 */}
        <aside className="search-filters">
          <h3>Refine Results</h3>
          
          {/* 分类过滤 */}
          {facets.categories && (
            <div className="filter-section">
              <h4>Category</h4>
              {facets.categories.map(cat => (
                <label key={cat.id}>
                  <input
                    type="radio"
                    name="category"
                    value={cat.slug}
                    checked={searchParams.category === cat.slug}
                    onChange={(e) => updateSearch({ 
                      category: e.target.value, 
                      page: 1 
                    })}
                  />
                  {cat.name} ({cat.count})
                </label>
              ))}
            </div>
          )}
          
          {/* 价格范围 */}
          {facets.priceRange && (
            <div className="filter-section">
              <h4>Price Range</h4>
              <input
                type="range"
                min={facets.priceRange.min}
                max={facets.priceRange.max}
                value={searchParams.minPrice || facets.priceRange.min}
                onChange={(e) => updateSearch({ 
                  minPrice: e.target.value,
                  page: 1
                })}
              />
            </div>
          )}
        </aside>

        {/* 搜索结果 */}
        <main className="search-results">
          {results.length > 0 ? (
            <>
              <div className="products-grid">
                {results.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* 分页 */}
              <div className="pagination">
                <button
                  onClick={() => updateSearch({ 
                    page: parseInt(searchParams.page) - 1 
                  })}
                  disabled={!hasPreviousPage}
                >
                  Previous
                </button>
                
                <span>Page {searchParams.page}</span>
                
                <button
                  onClick={() => updateSearch({ 
                    page: parseInt(searchParams.page) + 1 
                  })}
                  disabled={!hasNextPage}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="no-results">
              <h2>No products found</h2>
              <p>Try adjusting your search or filters</p>
              
              {suggestions.length > 0 && (
                <div className="search-suggestions">
                  <h3>Did you mean:</h3>
                  {suggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => updateSearch({ q: suggestion, page: 1 })}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
```

### 案例2：用户仪表板

```jsx
// 仪表板数据Loader
async function dashboardDataLoader({ request }) {
  const url = new URL(request.url);
  const timeRange = url.searchParams.get('range') || '7d';
  const includeComparison = url.searchParams.get('compare') === 'true';
  
  // 获取基础仪表板数据
  const baseData = await fetch(`/api/dashboard?range=${timeRange}`)
    .then(r => r.json());
  
  // 条件性获取对比数据
  let comparisonData = null;
  if (includeComparison) {
    const previousRange = getPreviousTimeRange(timeRange);
    comparisonData = await fetch(`/api/dashboard?range=${previousRange}`)
      .then(r => r.json());
  }
  
  // 获取个性化推荐
  const recommendations = await fetch('/api/dashboard/recommendations')
    .then(r => r.json());
  
  // 数据处理和计算
  const processedData = {
    metrics: baseData.metrics,
    charts: processChartData(baseData.chartData),
    
    // 计算增长率
    growth: comparisonData ? calculateGrowthRates(baseData, comparisonData) : null,
    
    // 个性化内容
    recommendations: recommendations.slice(0, 5),
    
    // 快速操作
    quickActions: getQuickActionsForUser(baseData.userRole),
    
    // 重要提醒
    alerts: baseData.alerts.filter(alert => alert.priority === 'high'),
    
    metadata: {
      timeRange,
      lastUpdated: new Date().toISOString(),
      dataFreshness: calculateDataFreshness(baseData.timestamps)
    }
  };

  return processedData;
}

// 仪表板组件
function Dashboard() {
  const {
    metrics,
    charts,
    growth,
    recommendations,
    quickActions,
    alerts,
    metadata
  } = useLoaderData();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentRange = searchParams.get('range') || '7d';

  const handleRangeChange = (newRange) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('range', newRange);
      return newParams;
    });
  };

  const toggleComparison = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      const current = newParams.get('compare') === 'true';
      
      if (current) {
        newParams.delete('compare');
      } else {
        newParams.set('compare', 'true');
      }
      
      return newParams;
    });
  };

  return (
    <div className="dashboard">
      {/* 仪表板头部 */}
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        
        <div className="dashboard-controls">
          <select value={currentRange} onChange={(e) => handleRangeChange(e.target.value)}>
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <label>
            <input
              type="checkbox"
              checked={searchParams.get('compare') === 'true'}
              onChange={toggleComparison}
            />
            Compare with previous period
          </label>
        </div>
        
        <div className="data-freshness">
          Last updated: {new Date(metadata.lastUpdated).toLocaleTimeString()}
        </div>
      </header>

      {/* 警告提醒 */}
      {alerts.length > 0 && (
        <div className="dashboard-alerts">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.type}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* 关键指标 */}
      <div className="metrics-grid">
        {Object.entries(metrics).map(([key, metric]) => (
          <div key={key} className="metric-card">
            <h3>{metric.title}</h3>
            <div className="metric-value">
              {metric.value}
              {growth && growth[key] && (
                <span className={`growth-indicator ${growth[key].type}`}>
                  {growth[key].percentage > 0 ? '+' : ''}
                  {growth[key].percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="charts-section">
        {charts.map(chart => (
          <div key={chart.id} className="chart-container">
            <h3>{chart.title}</h3>
            <ChartComponent data={chart.data} type={chart.type} />
          </div>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {quickActions.map(action => (
            <Link
              key={action.id}
              to={action.path}
              className="action-card"
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-title">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 个性化推荐 */}
      <div className="recommendations">
        <h3>Recommended for You</h3>
        <div className="recommendations-list">
          {recommendations.map(rec => (
            <div key={rec.id} className="recommendation-card">
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
              <Link to={rec.path}>Learn More</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Loader性能优化

### 并行加载优化

```jsx
// 优化的并行Loader
async function optimizedParallelLoader({ params }) {
  const { userId } = params;
  
  // 并行发起所有请求
  const requestPromises = {
    user: fetch(`/api/users/${userId}`).then(r => r.json()),
    posts: fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    followers: fetch(`/api/users/${userId}/followers`).then(r => r.json()),
    following: fetch(`/api/users/${userId}/following`).then(r => r.json()),
    activities: fetch(`/api/users/${userId}/activities`).then(r => r.json())
  };
  
  // 等待所有请求完成
  const results = await Promise.allSettled(Object.entries(requestPromises).map(
    async ([key, promise]) => {
      try {
        const data = await promise;
        return [key, { data, success: true }];
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
        return [key, { error: error.message, success: false }];
      }
    }
  ));

  // 处理结果
  const loadedData = {};
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const [key, value] = result.value;
      loadedData[key] = value;
    }
  });

  return loadedData;
}

// 条件并行加载
async function conditionalParallelLoader({ params, request }) {
  const url = new URL(request.url);
  const { userId } = params;
  
  const loadExtras = url.searchParams.get('extras') === 'true';
  const loadSocial = url.searchParams.get('social') === 'true';
  
  // 基础数据总是加载
  const baseRequests = {
    user: fetch(`/api/users/${userId}`).then(r => r.json()),
    posts: fetch(`/api/users/${userId}/posts?limit=5`).then(r => r.json())
  };
  
  // 条件性添加请求
  if (loadExtras) {
    baseRequests.analytics = fetch(`/api/users/${userId}/analytics`).then(r => r.json());
    baseRequests.achievements = fetch(`/api/users/${userId}/achievements`).then(r => r.json());
  }
  
  if (loadSocial) {
    baseRequests.followers = fetch(`/api/users/${userId}/followers`).then(r => r.json());
    baseRequests.following = fetch(`/api/users/${userId}/following`).then(r => r.json());
  }
  
  const data = await Promise.all(
    Object.entries(baseRequests).map(async ([key, promise]) => {
      const result = await promise;
      return [key, result];
    })
  );
  
  return Object.fromEntries(data);
}
```

### Loader缓存策略

```jsx
// 智能缓存Loader
const loaderCacheStrategies = {
  // 永不过期缓存（适用于静态数据）
  permanent: (key) => ({
    get: () => localStorage.getItem(`loader_${key}`),
    set: (data) => localStorage.setItem(`loader_${key}`, JSON.stringify(data)),
    shouldRefresh: () => false
  }),
  
  // 基于时间的缓存
  timeBased: (key, ttl = 300000) => ({ // 5分钟默认TTL
    get: () => {
      const item = localStorage.getItem(`loader_${key}`);
      if (item) {
        const { data, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp < ttl) {
          return data;
        }
      }
      return null;
    },
    set: (data) => localStorage.setItem(`loader_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    })),
    shouldRefresh: () => true
  }),
  
  // 基于版本的缓存
  versionBased: (key) => ({
    get: () => {
      const item = localStorage.getItem(`loader_${key}`);
      if (item) {
        const { data, version } = JSON.parse(item);
        return { data, version };
      }
      return null;
    },
    set: (data, version) => localStorage.setItem(`loader_${key}`, JSON.stringify({
      data,
      version,
      timestamp: Date.now()
    })),
    shouldRefresh: (currentVersion, cachedVersion) => currentVersion > cachedVersion
  })
};

// 带缓存的用户Loader
async function cachedUserLoader({ params }) {
  const { userId } = params;
  const cacheKey = `user-${userId}`;
  const cache = loaderCacheStrategies.timeBased(cacheKey, 300000); // 5分钟缓存
  
  // 检查缓存
  const cached = cache.get();
  if (cached) {
    console.log('Using cached user data');
    return cached;
  }
  
  // 获取新数据
  console.log('Fetching fresh user data');
  const user = await fetch(`/api/users/${userId}`).then(r => r.json());
  
  // 缓存数据
  cache.set(user);
  
  return user;
}
```

## Loader最佳实践

### 1. 错误处理最佳实践

```jsx
// 标准化的Loader错误处理
async function standardLoader({ params }) {
  try {
    const data = await fetchData(params.id);
    return data;
  } catch (error) {
    // 根据错误类型决定处理方式
    if (error.status === 404) {
      throw new Response('Resource not found', { status: 404 });
    } else if (error.status === 403) {
      throw new Response('Access forbidden', { status: 403 });
    } else if (error.status >= 500) {
      throw new Response('Server error', { status: 500 });
    } else {
      throw new Response('Unknown error', { status: 500 });
    }
  }
}
```

### 2. 性能优化

```jsx
// Loader性能优化策略
const optimizationStrategies = {
  // 1. 数据分页
  pagination: async ({ params, request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    
    return await fetchPaginatedData(params.resourceId, { page, limit });
  },
  
  // 2. 字段选择
  fieldSelection: async ({ params, request }) => {
    const url = new URL(request.url);
    const fields = url.searchParams.get('fields')?.split(',') || [];
    
    return await fetchData(params.id, { fields });
  },
  
  // 3. 条件加载
  conditionalLoading: async ({ params, request }) => {
    const url = new URL(request.url);
    const includeExtras = url.searchParams.get('extras') === 'true';
    
    const data = await fetchBaseData(params.id);
    
    if (includeExtras) {
      data.extras = await fetchExtrasData(params.id);
    }
    
    return data;
  }
};
```

### 3. 类型安全

```typescript
// TypeScript Loader类型定义
import type { LoaderFunction } from '@remix-run/router';

interface UserLoaderData {
  user: User;
  posts: Post[];
  stats: UserStats;
}

const userLoader: LoaderFunction = async ({ params }): Promise<UserLoaderData> => {
  const { userId } = params;
  
  const [user, posts, stats] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserStats(userId)
  ]);

  return { user, posts, stats };
};

// 在组件中使用类型化的Loader数据
function TypedUserProfile() {
  const { user, posts, stats } = useLoaderData() as UserLoaderData;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{posts.length} posts</p>
      <p>{stats.totalViews} total views</p>
    </div>
  );
}
```

## 总结

React Router v6的Loader机制提供了优雅的数据预加载解决方案：

1. **数据预加载**：在组件渲染前获取数据
2. **错误处理**：统一的错误处理机制
3. **缓存支持**：可以实现多层次的缓存策略
4. **并行加载**：支持并行加载多个数据源
5. **类型安全**：完整的TypeScript支持
6. **性能优化**：减少组件挂载后的数据获取

合理使用Loader可以显著改善应用的用户体验和性能表现。
