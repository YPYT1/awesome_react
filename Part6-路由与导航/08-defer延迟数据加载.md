# defer延迟数据加载

## 概述

React Router v6的defer功能允许在Loader中延迟加载某些数据，让关键数据先加载并渲染页面，而非关键数据可以稍后加载。这种流式渲染(Streaming)方式显著改善了用户体验，特别是在处理慢速API或大量数据时。

## defer基础

### 基本用法

```jsx
import { defer, Await, useLoaderData } from 'react-router-dom';
import { Suspense } from 'react';

// Loader with defer
async function productLoader({ params }) {
  const { productId } = params;

  // 快速数据 - 立即await
  const product = await fetch(`/api/products/${productId}`)
    .then(r => r.json());

  // 慢速数据 - 不await，让它在后台加载
  const reviews = fetch(`/api/products/${productId}/reviews`)
    .then(r => r.json());

  const relatedProducts = fetch(`/api/products/${productId}/related`)
    .then(r => r.json());

  // 使用defer返回
  return defer({
    product,      // 已解析的数据
    reviews,      // Promise，稍后解析
    relatedProducts  // Promise，稍后解析
  });
}

// 组件
function ProductDetail() {
  const { product, reviews, relatedProducts } = useLoaderData();

  return (
    <div className="product-detail">
      {/* 关键内容立即显示 */}
      <div className="product-header">
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
        <button className="add-to-cart">Add to Cart</button>
      </div>

      {/* 延迟加载的评论 */}
      <section className="product-reviews">
        <h2>Customer Reviews</h2>
        <Suspense fallback={<ReviewsSkeleton />}>
          <Await
            resolve={reviews}
            errorElement={<ReviewsError />}
          >
            {(resolvedReviews) => (
              <ReviewsList reviews={resolvedReviews} />
            )}
          </Await>
        </Suspense>
      </section>

      {/* 延迟加载的相关产品 */}
      <section className="related-products">
        <h2>You May Also Like</h2>
        <Suspense fallback={<ProductsSkeleton />}>
          <Await
            resolve={relatedProducts}
            errorElement={<div>Failed to load related products</div>}
          >
            {(resolvedProducts) => (
              <ProductsGrid products={resolvedProducts} />
            )}
          </Await>
        </Suspense>
      </section>
    </div>
  );
}

// Skeleton组件
function ReviewsSkeleton() {
  return (
    <div className="reviews-skeleton">
      {[1, 2, 3].map(i => (
        <div key={i} className="review-skeleton">
          <div className="skeleton-line skeleton-header" />
          <div className="skeleton-line skeleton-text" />
          <div className="skeleton-line skeleton-text" />
        </div>
      ))}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="products-skeleton">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="product-card-skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
```

### 多层次延迟加载

```jsx
// 复杂的多层次延迟加载
async function dashboardLoader() {
  // 第一优先级：必须立即显示的数据
  const user = await fetch('/api/user/current').then(r => r.json());

  // 第二优先级：重要但可以稍后加载的数据
  const recentActivity = fetch('/api/user/recent-activity')
    .then(r => r.json());

  const notifications = fetch('/api/user/notifications')
    .then(r => r.json());

  // 第三优先级：不太重要的数据
  const statistics = fetch('/api/user/statistics')
    .then(r => r.json());

  const recommendations = fetch('/api/user/recommendations')
    .then(r => r.json());

  return defer({
    user,
    critical: {
      recentActivity,
      notifications
    },
    optional: {
      statistics,
      recommendations
    }
  });
}

function Dashboard() {
  const { user, critical, optional } = useLoaderData();

  return (
    <div className="dashboard">
      {/* 立即显示用户信息 */}
      <header className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <div className="user-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
      </header>

      <div className="dashboard-content">
        {/* 第二优先级内容 */}
        <div className="dashboard-main">
          <section className="activity-section">
            <h2>Recent Activity</h2>
            <Suspense fallback={<ActivitySkeleton />}>
              <Await resolve={critical.recentActivity}>
                {(activity) => <ActivityFeed activity={activity} />}
              </Await>
            </Suspense>
          </section>

          <section className="notifications-section">
            <h2>Notifications</h2>
            <Suspense fallback={<NotificationsSkeleton />}>
              <Await resolve={critical.notifications}>
                {(notifications) => (
                  <NotificationsList notifications={notifications} />
                )}
              </Await>
            </Suspense>
          </section>
        </div>

        {/* 第三优先级内容 */}
        <aside className="dashboard-sidebar">
          <section className="statistics-section">
            <h2>Statistics</h2>
            <Suspense fallback={<StatsSkeleton />}>
              <Await
                resolve={optional.statistics}
                errorElement={<div>Statistics unavailable</div>}
              >
                {(stats) => <StatsDisplay stats={stats} />}
              </Await>
            </Suspense>
          </section>

          <section className="recommendations-section">
            <h2>Recommended for You</h2>
            <Suspense fallback={<RecommendationsSkeleton />}>
              <Await
                resolve={optional.recommendations}
                errorElement={<div>No recommendations available</div>}
              >
                {(recs) => <RecommendationsList recommendations={recs} />}
              </Await>
            </Suspense>
          </section>
        </aside>
      </div>
    </div>
  );
}
```

## defer错误处理

### 优雅的错误处理

```jsx
// 带完整错误处理的延迟加载
async function userProfileLoader({ params }) {
  const { userId } = params;

  // 关键数据必须成功
  const user = await fetch(`/api/users/${userId}`)
    .then(r => {
      if (!r.ok) throw new Error('User not found');
      return r.json();
    });

  // 延迟数据with错误处理
  const posts = fetch(`/api/users/${userId}/posts`)
    .then(r => r.json())
    .catch(error => {
      console.error('Failed to load posts:', error);
      return { error: true, message: 'Failed to load posts' };
    });

  const followers = fetch(`/api/users/${userId}/followers`)
    .then(r => r.json())
    .catch(error => {
      console.error('Failed to load followers:', error);
      return { error: true, message: 'Failed to load followers' };
    });

  return defer({
    user,
    posts,
    followers
  });
}

// 组件with错误处理
function UserProfile() {
  const { user, posts, followers } = useLoaderData();

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={user.avatar} alt={user.name} />
        <h1>{user.name}</h1>
        <p>{user.bio}</p>
      </div>

      <div className="profile-content">
        <section className="user-posts">
          <h2>Posts</h2>
          <Suspense fallback={<PostsSkeleton />}>
            <Await
              resolve={posts}
              errorElement={
                <ErrorBoundary
                  fallback={
                    <div className="error-message">
                      <p>Unable to load posts at this time.</p>
                      <button onClick={() => window.location.reload()}>
                        Try Again
                      </button>
                    </div>
                  }
                />
              }
            >
              {(resolvedPosts) => {
                if (resolvedPosts.error) {
                  return (
                    <div className="error-message">
                      <p>{resolvedPosts.message}</p>
                    </div>
                  );
                }
                return <PostsList posts={resolvedPosts} />;
              }}
            </Await>
          </Suspense>
        </section>

        <section className="user-followers">
          <h2>Followers</h2>
          <Suspense fallback={<FollowersSkeleton />}>
            <Await
              resolve={followers}
              errorElement={
                <div className="error-message">
                  Unable to load followers
                </div>
              }
            >
              {(resolvedFollowers) => {
                if (resolvedFollowers.error) {
                  return <div className="error-message">Failed to load followers</div>;
                }
                return <FollowersList followers={resolvedFollowers} />;
              }}
            </Await>
          </Suspense>
        </section>
      </div>
    </div>
  );
}

// 自定义错误边界组件
function ErrorBoundary({ fallback, children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (event) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return fallback || <div>Something went wrong: {error?.message}</div>;
  }

  return children;
}
```

### 超时处理

```jsx
// 带超时的延迟加载
function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
}

async function timeoutAwareLoader({ params }) {
  const { id } = params;

  // 关键数据，短超时
  const mainData = await withTimeout(
    fetch(`/api/items/${id}`).then(r => r.json()),
    3000
  );

  // 延迟数据，长超时
  const details = withTimeout(
    fetch(`/api/items/${id}/details`).then(r => r.json()),
    10000
  ).catch(error => {
    if (error.message === 'Request timeout') {
      return {
        error: true,
        message: 'Loading details is taking longer than expected...',
        timeout: true
      };
    }
    throw error;
  });

  const related = withTimeout(
    fetch(`/api/items/${id}/related`).then(r => r.json()),
    10000
  ).catch(error => ({
    error: true,
    message: 'Unable to load related items',
    timeout: error.message === 'Request timeout'
  }));

  return defer({
    mainData,
    details,
    related
  });
}

// 使用超时处理
function ItemDetail() {
  const { mainData, details, related } = useLoaderData();
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  return (
    <div className="item-detail">
      <h1>{mainData.title}</h1>
      <p>{mainData.description}</p>

      <Suspense fallback={<DetailsSkeleton />}>
        <Await resolve={details}>
          {(resolvedDetails) => {
            if (resolvedDetails.timeout) {
              return (
                <div className="timeout-message">
                  <p>{resolvedDetails.message}</p>
                  <button onClick={handleRetry}>
                    Retry {retryCount > 0 && `(${retryCount})`}
                  </button>
                </div>
              );
            }

            if (resolvedDetails.error) {
              return <div className="error-message">{resolvedDetails.message}</div>;
            }

            return <DetailsView details={resolvedDetails} />;
          }}
        </Await>
      </Suspense>

      <Suspense fallback={<RelatedSkeleton />}>
        <Await resolve={related}>
          {(resolvedRelated) => {
            if (resolvedRelated.error) {
              return null; // 静默失败，相关项不是关键的
            }
            return <RelatedItems items={resolvedRelated} />;
          }}
        </Await>
      </Suspense>
    </div>
  );
}
```

## 高级defer模式

### 条件延迟加载

```jsx
// 根据用户偏好或设备类型决定是否延迟加载
async function adaptiveLoader({ params, request }) {
  const url = new URL(request.url);
  const { productId } = params;

  // 检测用户连接速度
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isFastConnection = !connection || 
                          connection.effectiveType === '4g' || 
                          connection.effectiveType === '5g';

  // 检测用户偏好
  const prefersReducedData = url.searchParams.get('dataMode') === 'lite';

  // 基础产品数据总是立即加载
  const product = await fetch(`/api/products/${productId}`)
    .then(r => r.json());

  let reviews, images, relatedProducts;

  if (isFastConnection && !prefersReducedData) {
    // 快速连接：并行延迟加载所有额外内容
    reviews = fetch(`/api/products/${productId}/reviews`).then(r => r.json());
    images = fetch(`/api/products/${productId}/images`).then(r => r.json());
    relatedProducts = fetch(`/api/products/${productId}/related`).then(r => r.json());
  } else {
    // 慢速连接或精简模式：只加载必要内容
    reviews = fetch(`/api/products/${productId}/reviews?limit=5`).then(r => r.json());
    images = Promise.resolve(product.images.slice(0, 3)); // 只用已有的前3张图
    relatedProducts = Promise.resolve([]); // 跳过相关产品
  }

  return defer({
    product,
    reviews,
    images,
    relatedProducts,
    metadata: {
      connectionType: connection?.effectiveType,
      dataMode: prefersReducedData ? 'lite' : 'full'
    }
  });
}

function AdaptiveProductDetail() {
  const { product, reviews, images, relatedProducts, metadata } = useLoaderData();

  return (
    <div className="product-detail">
      {metadata.dataMode === 'lite' && (
        <div className="data-mode-notice">
          Lite mode enabled. <Link to="?dataMode=full">Switch to full mode</Link>
        </div>
      )}

      <div className="product-main">
        <h1>{product.name}</h1>
        <p>${product.price}</p>

        <Suspense fallback={<ImagesSkeleton />}>
          <Await resolve={images}>
            {(resolvedImages) => (
              <ImageGallery images={resolvedImages} />
            )}
          </Await>
        </Suspense>
      </div>

      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(resolvedReviews) => (
            <div>
              <h2>Reviews</h2>
              <ReviewsList reviews={resolvedReviews} />
              {metadata.dataMode === 'lite' && (
                <p className="limited-content-notice">
                  Showing limited reviews in lite mode
                </p>
              )}
            </div>
          )}
        </Await>
      </Suspense>

      {metadata.dataMode === 'full' && (
        <Suspense fallback={<RelatedSkeleton />}>
          <Await resolve={relatedProducts}>
            {(resolvedProducts) => {
              if (resolvedProducts.length === 0) return null;
              return (
                <div>
                  <h2>Related Products</h2>
                  <ProductsGrid products={resolvedProducts} />
                </div>
              );
            }}
          </Await>
        </Suspense>
      )}
    </div>
  );
}
```

### 渐进式数据加载

```jsx
// 分批次加载数据
async function progressiveLoader({ params }) {
  const { categoryId } = params;

  // 第一批：最重要的内容
  const featured = await fetch(`/api/categories/${categoryId}/featured`)
    .then(r => r.json());

  // 第二批：重要内容（延迟）
  const batch1 = fetch(`/api/categories/${categoryId}/products?page=1`)
    .then(r => r.json());

  // 第三批：额外内容（更长延迟）
  const batch2 = new Promise(resolve => {
    setTimeout(() => {
      fetch(`/api/categories/${categoryId}/products?page=2`)
        .then(r => r.json())
        .then(resolve);
    }, 1000); // 1秒后才开始加载
  });

  // 第四批：不太重要的内容（最长延迟）
  const batch3 = new Promise(resolve => {
    setTimeout(() => {
      fetch(`/api/categories/${categoryId}/products?page=3`)
        .then(r => r.json())
        .then(resolve);
    }, 2000); // 2秒后才开始加载
  });

  return defer({
    featured,
    batch1,
    batch2,
    batch3
  });
}

function CategoryPage() {
  const { featured, batch1, batch2, batch3 } = useLoaderData();
  const [loadBatch2, setLoadBatch2] = useState(false);
  const [loadBatch3, setLoadBatch3] = useState(false);

  // 当用户滚动到一定位置时才加载更多
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent > 50 && !loadBatch2) {
        setLoadBatch2(true);
      }
      
      if (scrollPercent > 75 && !loadBatch3) {
        setLoadBatch3(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadBatch2, loadBatch3]);

  return (
    <div className="category-page">
      {/* 第一批：立即显示 */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <ProductsGrid products={featured} />
      </section>

      {/* 第二批：延迟加载 */}
      <section className="products-batch-1">
        <Suspense fallback={<ProductsSkeleton count={8} />}>
          <Await resolve={batch1}>
            {(products) => (
              <>
                <h2>Popular Products</h2>
                <ProductsGrid products={products} />
              </>
            )}
          </Await>
        </Suspense>
      </section>

      {/* 第三批：按需加载 */}
      {loadBatch2 && (
        <section className="products-batch-2">
          <Suspense fallback={<ProductsSkeleton count={8} />}>
            <Await resolve={batch2}>
              {(products) => (
                <>
                  <h2>More Products</h2>
                  <ProductsGrid products={products} />
                </>
              )}
            </Await>
          </Suspense>
        </section>
      )}

      {/* 第四批：按需加载 */}
      {loadBatch3 && (
        <section className="products-batch-3">
          <Suspense fallback={<ProductsSkeleton count={8} />}>
            <Await resolve={batch3}>
              {(products) => (
                <>
                  <h2>Even More Products</h2>
                  <ProductsGrid products={products} />
                </>
              )}
            </Await>
          </Suspense>
        </section>
      )}
    </div>
  );
}
```

### 并行vs串行延迟加载

```jsx
// 并行延迟加载（同时开始所有请求）
async function parallelLoader({ params }) {
  const { userId } = params;

  const user = await fetch(`/api/users/${userId}`).then(r => r.json());

  // 这些请求同时开始
  const posts = fetch(`/api/users/${userId}/posts`).then(r => r.json());
  const comments = fetch(`/api/users/${userId}/comments`).then(r => r.json());
  const likes = fetch(`/api/users/${userId}/likes`).then(r => r.json());

  return defer({ user, posts, comments, likes });
}

// 串行延迟加载（一个接一个）
async function serialLoader({ params }) {
  const { userId } = params;

  const user = await fetch(`/api/users/${userId}`).then(r => r.json());

  // 先加载posts，然后基于posts加载comments
  const posts = fetch(`/api/users/${userId}/posts`)
    .then(r => r.json())
    .then(async (postsData) => {
      const postIds = postsData.map(p => p.id);
      const commentsData = await fetch('/api/comments/bulk', {
        method: 'POST',
        body: JSON.stringify({ postIds })
      }).then(r => r.json());
      
      return postsData.map(post => ({
        ...post,
        comments: commentsData.filter(c => c.postId === post.id)
      }));
    });

  return defer({ user, posts });
}

// 混合模式：部分并行，部分串行
async function hybridLoader({ params }) {
  const { productId } = params;

  // 第一步：获取产品基本信息
  const product = await fetch(`/api/products/${productId}`).then(r => r.json());

  // 第二步：基于产品信息并行获取相关数据
  const reviews = fetch(`/api/products/${productId}/reviews`).then(r => r.json());
  const inventory = fetch(`/api/products/${productId}/inventory`).then(r => r.json());

  // 第三步：基于产品类别获取相关产品（依赖product）
  const relatedProducts = fetch(`/api/products/related?category=${product.category}`)
    .then(r => r.json());

  // 第四步：基于产品品牌获取品牌信息（依赖product）
  const brand = fetch(`/api/brands/${product.brandId}`)
    .then(r => r.json())
    .then(async (brandData) => {
      // 进一步获取品牌的其他产品
      const otherProducts = await fetch(`/api/brands/${brandData.id}/products?exclude=${productId}`)
        .then(r => r.json());
      
      return {
        ...brandData,
        otherProducts
      };
    });

  return defer({
    product,
    reviews,
    inventory,
    relatedProducts,
    brand
  });
}
```

## defer性能优化

### 预连接和DNS预解析

```jsx
// 使用资源提示优化延迟加载
function OptimizedLoader() {
  // 在文档头部添加资源提示
  useEffect(() => {
    // DNS预解析
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = 'https://api.example.com';
    document.head.appendChild(dnsLink);

    // 预连接
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = 'https://api.example.com';
    document.head.appendChild(preconnectLink);

    return () => {
      document.head.removeChild(dnsLink);
      document.head.removeChild(preconnectLink);
    };
  }, []);

  // 组件内容...
}

// Loader中预热连接
async function preWarmedLoader({ params }) {
  const { id } = params;

  // 预热API连接
  const preWarmPromise = fetch('https://api.example.com/ping', {
    method: 'HEAD',
    mode: 'no-cors'
  }).catch(() => {}); // 忽略错误，这只是预热

  // 获取主要数据
  const mainData = await fetch(`/api/items/${id}`).then(r => r.json());

  // 确保预热完成后再发起其他请求
  await preWarmPromise;

  // 延迟数据（现在连接已经预热）
  const details = fetch(`/api/items/${id}/details`).then(r => r.json());
  const related = fetch(`/api/items/${id}/related`).then(r => r.json());

  return defer({ mainData, details, related });
}
```

### 智能预取

```jsx
// 鼠标悬停时预取数据
function ProductCard({ product }) {
  const prefetch = usePrefetch();
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    // 用户悬停时预取产品详情数据
    prefetch(`/products/${product.id}`, {
      // 指定要预取哪些数据
      prefetchData: ['reviews', 'related']
    });
  };

  return (
    <Link
      to={`/products/${product.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovering(false)}
      className={isHovering ? 'hovering' : ''}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </Link>
  );
}

// 自定义预取Hook
function usePrefetch() {
  const fetcher = useFetcher();
  const cache = useRef(new Map());

  return useCallback((path, options = {}) => {
    const cacheKey = `${path}-${JSON.stringify(options.prefetchData)}`;

    // 检查缓存
    if (cache.current.has(cacheKey)) {
      return;
    }

    // 标记为已预取
    cache.current.set(cacheKey, true);

    // 使用fetcher预取数据
    fetcher.load(path);

    // 清理旧缓存
    if (cache.current.size > 50) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
  }, [fetcher]);
}

// Intersection Observer自动预取
function useIntersectionPrefetch(ref, path) {
  const prefetch = usePrefetch();
  const [hasPreetched, setHasPrefetched] = useState(false);

  useEffect(() => {
    if (!ref.current || hasPreetched) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasPreetched) {
            prefetch(path);
            setHasPrefetched(true);
          }
        });
      },
      {
        rootMargin: '50px' // 提前50px开始预取
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, path, hasPreetched, prefetch]);
}

// 使用Intersection Observer预取
function ProductSection({ products }) {
  const sectionRef = useRef(null);
  
  useIntersectionPrefetch(
    sectionRef,
    '/api/products/next-page'
  );

  return (
    <section ref={sectionRef} className="product-section">
      <ProductsGrid products={products} />
    </section>
  );
}
```

### 缓存策略

```jsx
// 延迟加载的缓存策略
const deferredDataCache = new Map();

function getCacheKey(url, params) {
  return `${url}-${JSON.stringify(params)}`;
}

async function cachedDeferredLoader({ params }) {
  const { id } = params;

  // 主数据不缓存，总是获取最新的
  const mainData = await fetch(`/api/items/${id}`).then(r => r.json());

  // 延迟数据使用缓存
  const detailsCacheKey = getCacheKey('/api/items/details', { id });
  let details;

  if (deferredDataCache.has(detailsCacheKey)) {
    // 使用缓存数据
    details = Promise.resolve(deferredDataCache.get(detailsCacheKey));
    
    // 后台更新缓存
    fetch(`/api/items/${id}/details`)
      .then(r => r.json())
      .then(data => {
        deferredDataCache.set(detailsCacheKey, data);
      });
  } else {
    // 没有缓存，正常加载
    details = fetch(`/api/items/${id}/details`)
      .then(r => r.json())
      .then(data => {
        deferredDataCache.set(detailsCacheKey, data);
        return data;
      });
  }

  // 相关项使用时间限制的缓存
  const relatedCacheKey = getCacheKey('/api/items/related', { id });
  const cachedRelated = deferredDataCache.get(relatedCacheKey);
  let related;

  if (cachedRelated && Date.now() - cachedRelated.timestamp < 5 * 60 * 1000) {
    // 缓存未过期（5分钟）
    related = Promise.resolve(cachedRelated.data);
  } else {
    // 缓存过期或不存在
    related = fetch(`/api/items/${id}/related`)
      .then(r => r.json())
      .then(data => {
        deferredDataCache.set(relatedCacheKey, {
          data,
          timestamp: Date.now()
        });
        return data;
      });
  }

  return defer({
    mainData,
    details,
    related
  });
}

// 清理过期缓存
function cleanExpiredCache(maxAge = 10 * 60 * 1000) { // 10分钟
  const now = Date.now();
  
  for (const [key, value] of deferredDataCache.entries()) {
    if (value.timestamp && now - value.timestamp > maxAge) {
      deferredDataCache.delete(key);
    }
  }
}

// 定期清理缓存
setInterval(() => cleanExpiredCache(), 5 * 60 * 1000); // 每5分钟清理一次
```

## 实战案例

### 案例1：博客文章页面

```jsx
// 博客文章Loader with defer
async function blogPostLoader({ params }) {
  const { slug } = params;

  // 立即加载文章内容
  const post = await fetch(`/api/posts/${slug}`).then(r => r.json());

  // 延迟加载评论
  const comments = fetch(`/api/posts/${slug}/comments`)
    .then(r => r.json())
    .catch(() => []);

  // 延迟加载作者其他文章
  const authorPosts = fetch(`/api/authors/${post.authorId}/posts?exclude=${slug}`)
    .then(r => r.json())
    .catch(() => []);

  // 延迟加载相关文章
  const relatedPosts = fetch(`/api/posts/${slug}/related`)
    .then(r => r.json())
    .catch(() => []);

  return defer({
    post,
    comments,
    authorPosts,
    relatedPosts
  });
}

// 博客文章组件
function BlogPost() {
  const { post, comments, authorPosts, relatedPosts } = useLoaderData();
  const [commentCount, setCommentCount] = useState(0);

  return (
    <article className="blog-post">
      {/* 立即显示的文章内容 */}
      <header className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span className="author">By {post.author.name}</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
          <span className="reading-time">{post.readingTime} min read</span>
        </div>
      </header>

      <div className="post-content">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* 延迟加载的评论区 */}
      <section className="comments-section">
        <h2>
          Comments
          {commentCount > 0 && <span> ({commentCount})</span>}
        </h2>
        
        <Suspense fallback={<CommentsSkeleton />}>
          <Await
            resolve={comments}
            errorElement={<div>Unable to load comments</div>}
          >
            {(resolvedComments) => {
              setCommentCount(resolvedComments.length);
              return <CommentsList comments={resolvedComments} />;
            }}
          </Await>
        </Suspense>
      </section>

      {/* 延迟加载的作者其他文章 */}
      <aside className="author-posts">
        <h3>More from {post.author.name}</h3>
        <Suspense fallback={<PostsSkeleton count={3} />}>
          <Await resolve={authorPosts}>
            {(resolvedPosts) => {
              if (resolvedPosts.length === 0) return null;
              return <PostsList posts={resolvedPosts.slice(0, 3)} />;
            }}
          </Await>
        </Suspense>
      </aside>

      {/* 延迟加载的相关文章 */}
      <aside className="related-posts">
        <h3>Related Articles</h3>
        <Suspense fallback={<PostsSkeleton count={3} />}>
          <Await resolve={relatedPosts}>
            {(resolvedPosts) => {
              if (resolvedPosts.length === 0) return null;
              return <PostsList posts={resolvedPosts.slice(0, 3)} />;
            }}
          </Await>
        </Suspense>
      </aside>
    </article>
  );
}
```

### 案例2：电商搜索结果

```jsx
// 搜索结果Loader with defer
async function searchResultsLoader({ request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const page = parseInt(url.searchParams.get('page')) || 1;

  // 立即加载搜索结果
  const results = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&page=${page}`
  ).then(r => r.json());

  // 延迟加载过滤器选项
  const filters = fetch(
    `/api/search/filters?q=${encodeURIComponent(query)}`
  ).then(r => r.json());

  // 延迟加载搜索建议
  const suggestions = fetch(
    `/api/search/suggestions?q=${encodeURIComponent(query)}`
  ).then(r => r.json());

  // 延迟加载热门搜索
  const trending = fetch('/api/search/trending')
    .then(r => r.json());

  return defer({
    results,
    filters,
    suggestions,
    trending,
    query,
    page
  });
}

// 搜索结果页面
function SearchResults() {
  const { results, filters, suggestions, trending, query, page } = useLoaderData();

  return (
    <div className="search-results">
      <div className="search-header">
        <h1>Search Results for "{query}"</h1>
        <p>{results.totalCount} products found</p>
      </div>

      <div className="search-layout">
        {/* 延迟加载的过滤器 */}
        <aside className="search-filters">
          <h2>Filters</h2>
          <Suspense fallback={<FiltersSkeleton />}>
            <Await resolve={filters}>
              {(resolvedFilters) => (
                <FiltersPanel filters={resolvedFilters} />
              )}
            </Await>
          </Suspense>
        </aside>

        {/* 主要搜索结果（立即显示） */}
        <main className="search-main">
          {results.items.length > 0 ? (
            <>
              <ProductsGrid products={results.items} />
              <Pagination
                currentPage={page}
                totalPages={results.totalPages}
                query={query}
              />
            </>
          ) : (
            <div className="no-results">
              <h2>No results found for "{query}"</h2>
              
              {/* 延迟加载的搜索建议 */}
              <Suspense fallback={<div>Loading suggestions...</div>}>
                <Await resolve={suggestions}>
                  {(resolvedSuggestions) => {
                    if (resolvedSuggestions.length === 0) return null;
                    return (
                      <div className="suggestions">
                        <p>Did you mean:</p>
                        <ul>
                          {resolvedSuggestions.map(suggestion => (
                            <li key={suggestion}>
                              <Link to={`/search?q=${suggestion}`}>
                                {suggestion}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }}
                </Await>
              </Suspense>
            </div>
          )}
        </main>

        {/* 延迟加载的热门搜索 */}
        <aside className="trending-searches">
          <h3>Trending Searches</h3>
          <Suspense fallback={<TrendingSkeleton />}>
            <Await resolve={trending}>
              {(resolvedTrending) => (
                <TrendingList items={resolvedTrending} />
              )}
            </Await>
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
```

## defer最佳实践

### 1. 何时使用defer

```jsx
// 适合使用defer的场景
const deferUseCases = {
  // 1. 慢速非关键数据
  goodCase1: {
    description: '产品评论、推荐等非关键数据',
    example: 'defer({ product: await fast(), reviews: slow() })'
  },

  // 2. 多个独立数据源
  goodCase2: {
    description: '多个可以并行加载的独立数据',
    example: 'defer({ user: await main(), posts: fetch1(), comments: fetch2() })'
  },

  // 3. 分析和统计数据
  goodCase3: {
    description: '页面统计、分析数据等',
    example: 'defer({ content: await main(), analytics: fetchAnalytics() })'
  },

  // 不适合使用defer的场景
  badCase1: {
    description: '所有数据都是关键的',
    wrong: 'defer({ critical1: fetch1(), critical2: fetch2() })',
    correct: 'await Promise.all([fetch1(), fetch2()])'
  },

  badCase2: {
    description: '数据之间有依赖关系',
    wrong: 'defer({ user: fetchUser(), userPosts: fetchPosts(user.id) })',
    correct: 'const user = await fetchUser(); defer({ user, posts: fetchPosts(user.id) })'
  }
};
```

### 2. 性能考量

```jsx
// defer性能优化checklist
const performanceChecklist = {
  // 1. 优先级排序
  priority: {
    high: '立即await - 用户需要立刻看到的内容',
    medium: 'defer - 用户需要但可以稍后看到的内容',
    low: '按需加载 - 只在用户交互时才加载'
  },

  // 2. 加载策略
  strategy: {
    parallel: '独立数据源并行加载',
    serial: '有依赖关系的数据串行加载',
    adaptive: '根据网络状况调整加载策略'
  },

  // 3. 用户体验
  ux: {
    skeleton: '为延迟内容提供骨架屏',
    progressive: '逐步显示内容，避免布局跳动',
    feedback: '提供加载反馈和错误提示'
  }
};
```

### 3. 错误处理策略

```jsx
// 完整的错误处理示例
async function robustDeferLoader({ params }) {
  try {
    // 关键数据必须成功
    const mainData = await fetch(`/api/items/${params.id}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });

    // 延迟数据提供降级方案
    const optionalData = fetch(`/api/items/${params.id}/details`)
      .then(r => r.json())
      .catch(error => {
        console.warn('Failed to load optional data:', error);
        return { error: true, fallback: true };
      });

    return defer({ mainData, optionalData });

  } catch (error) {
    // 关键数据加载失败，抛出错误
    throw new Response('Failed to load page', { status: 500 });
  }
}
```

## 总结

React Router v6的defer功能提供了强大的延迟加载能力：

1. **流式渲染**：关键内容优先显示，提升感知性能
2. **灵活控制**：精确控制哪些数据延迟加载
3. **错误隔离**：延迟数据的错误不影响关键内容
4. **性能优化**：减少页面首次渲染时间
5. **用户体验**：通过Suspense提供流畅的加载体验

合理使用defer可以显著改善应用的性能和用户体验，特别是在处理大量数据或慢速API时。
