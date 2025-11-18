# use()实战案例

## 学习目标

通过本章学习，你将掌握：

- use()在真实项目中的应用
- 完整的数据获取方案
- 复杂业务场景的处理
- 性能优化实践
- 用户体验优化
- 错误处理最佳实践
- 缓存和预加载策略
- 生产环境注意事项

## 第一部分：博客系统

### 1.1 文章列表页

```jsx
// API函数
async function fetchPosts(page = 1, limit = 10) {
  const response = await fetch(
    `/api/posts?page=${page}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('获取文章列表失败');
  }
  
  return response.json();
}

async function fetchCategories() {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('获取分类失败');
  return response.json();
}

// 文章列表组件
function PostsPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);
  
  // 创建Promise
  const postsPromise = useMemo(() => 
    fetchPosts(page, 10, category),
    [page, category]
  );
  
  const categoriesPromise = useMemo(() => 
    fetchCategories(),
    []
  );
  
  return (
    <div className="posts-page">
      <h1>博客文章</h1>
      
      {/* 分类筛选 */}
      <ErrorBoundary fallback={<div>分类加载失败</div>}>
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoryFilter 
            categoriesPromise={categoriesPromise}
            selected={category}
            onSelect={setCategory}
          />
        </Suspense>
      </ErrorBoundary>
      
      {/* 文章列表 */}
      <ErrorBoundary fallback={<PostsError />}>
        <Suspense fallback={<PostsSkeleton />}>
          <PostsList 
            postsPromise={postsPromise}
            page={page}
            onPageChange={setPage}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// 分类筛选器
function CategoryFilter({ categoriesPromise, selected, onSelect }) {
  const categories = use(categoriesPromise);
  
  return (
    <div className="category-filter">
      <button
        className={selected === null ? 'active' : ''}
        onClick={() => onSelect(null)}
      >
        全部
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={selected === cat.id ? 'active' : ''}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// 文章列表
function PostsList({ postsPromise, page, onPageChange }) {
  const { posts, totalPages } = use(postsPromise);
  
  if (posts.length === 0) {
    return <div className="empty">暂无文章</div>;
  }
  
  return (
    <div className="posts-list">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      
      <Pagination 
        current={page}
        total={totalPages}
        onChange={onPageChange}
      />
    </div>
  );
}

function PostCard({ post }) {
  return (
    <article className="post-card">
      <img src={post.coverImage} alt={post.title} />
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <div className="meta">
        <span>{post.author.name}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <Link to={`/posts/${post.id}`}>阅读更多</Link>
    </article>
  );
}
```

### 1.2 文章详情页

```jsx
// API函数
async function fetchPost(postId) {
  const response = await fetch(`/api/posts/${postId}`);
  
  if (response.status === 404) {
    throw new NotFoundError('文章不存在');
  }
  
  if (!response.ok) {
    throw new Error('获取文章失败');
  }
  
  return response.json();
}

async function fetchComments(postId) {
  const response = await fetch(`/api/posts/${postId}/comments`);
  if (!response.ok) throw new Error('获取评论失败');
  return response.json();
}

async function fetchRelatedPosts(postId) {
  const response = await fetch(`/api/posts/${postId}/related`);
  if (!response.ok) throw new Error('获取相关文章失败');
  return response.json();
}

// 文章详情页
function PostDetailPage({ params }) {
  const postId = params.postId;
  
  // 预创建所有Promise
  const postPromise = useMemo(() => fetchPost(postId), [postId]);
  const commentsPromise = useMemo(() => fetchComments(postId), [postId]);
  const relatedPromise = useMemo(() => fetchRelatedPosts(postId), [postId]);
  
  return (
    <div className="post-detail-page">
      {/* 文章内容 */}
      <ErrorBoundary fallback={<PostNotFound />}>
        <Suspense fallback={<PostSkeleton />}>
          <PostContent postPromise={postPromise} />
        </Suspense>
      </ErrorBoundary>
      
      {/* 评论区 */}
      <ErrorBoundary fallback={<div>评论加载失败</div>}>
        <Suspense fallback={<CommentsSkeleton />}>
          <CommentsSection 
            commentsPromise={commentsPromise}
            postId={postId}
          />
        </Suspense>
      </ErrorBoundary>
      
      {/* 相关文章 */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedPosts relatedPromise={relatedPromise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// 文章内容
function PostContent({ postPromise }) {
  const post = use(postPromise);
  
  return (
    <article className="post-content">
      <header>
        <h1>{post.title}</h1>
        <div className="meta">
          <img src={post.author.avatar} alt={post.author.name} />
          <div>
            <div className="author">{post.author.name}</div>
            <div className="date">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </header>
      
      {post.coverImage && (
        <img 
          className="cover" 
          src={post.coverImage} 
          alt={post.title} 
        />
      )}
      
      <div 
        className="body" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
      
      <footer>
        <div className="tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </footer>
    </article>
  );
}

// 评论区
function CommentsSection({ commentsPromise, postId }) {
  const initialComments = use(commentsPromise);
  const [comments, setComments] = useState(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (text) => {
    setIsSubmitting(true);
    try {
      const newComment = await submitComment(postId, text);
      setComments(prev => [newComment, ...prev]);
    } catch (error) {
      alert('评论失败');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="comments-section">
      <h2>评论 ({comments.length})</h2>
      
      <CommentForm 
        onSubmit={handleSubmit}
        disabled={isSubmitting}
      />
      
      <div className="comments-list">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
```

## 第二部分：电商系统

### 2.1 商品列表页

```jsx
// 商品列表API
async function fetchProducts(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/products?${query}`);
  
  if (!response.ok) {
    throw new Error('获取商品列表失败');
  }
  
  return response.json();
}

// 商品列表页
function ProductsPage() {
  const [filters, setFilters] = useState({
    category: null,
    priceRange: null,
    sortBy: 'newest'
  });
  
  const productsPromise = useMemo(() => 
    fetchProducts(filters),
    [filters]
  );
  
  return (
    <div className="products-page">
      <aside className="filters">
        <FilterPanel 
          filters={filters}
          onChange={setFilters}
        />
      </aside>
      
      <main className="products">
        <ErrorBoundary fallback={<ProductsError />}>
          <Suspense fallback={<ProductsGrid skeleton />}>
            <ProductsGrid productsPromise={productsPromise} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

// 商品网格
function ProductsGrid({ productsPromise }) {
  const { products, total } = use(productsPromise);
  
  if (products.length === 0) {
    return <EmptyState message="暂无商品" />;
  }
  
  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <img src={product.images[0]} alt={product.name} />
      <h3>{product.name}</h3>
      <div className="price">
        <span className="current">¥{product.price}</span>
        {product.originalPrice && (
          <span className="original">¥{product.originalPrice}</span>
        )}
      </div>
      <div className="rating">
        <Stars rating={product.rating} />
        <span>({product.reviewCount})</span>
      </div>
    </Link>
  );
}
```

### 2.2 商品详情页

```jsx
// 商品详情API
async function fetchProductDetail(productId) {
  const response = await fetch(`/api/products/${productId}`);
  
  if (response.status === 404) {
    throw new NotFoundError('商品不存在');
  }
  
  if (!response.ok) {
    throw new Error('获取商品详情失败');
  }
  
  return response.json();
}

async function fetchProductReviews(productId) {
  const response = await fetch(`/api/products/${productId}/reviews`);
  if (!response.ok) throw new Error('获取评价失败');
  return response.json();
}

async function fetchRecommendations(productId) {
  const response = await fetch(`/api/products/${productId}/recommendations`);
  if (!response.ok) throw new Error('获取推荐失败');
  return response.json();
}

// 商品详情页
function ProductDetailPage({ params }) {
  const productId = params.productId;
  
  const productPromise = useMemo(() => 
    fetchProductDetail(productId),
    [productId]
  );
  
  const reviewsPromise = useMemo(() => 
    fetchProductReviews(productId),
    [productId]
  );
  
  const recommendationsPromise = useMemo(() => 
    fetchRecommendations(productId),
    [productId]
  );
  
  return (
    <div className="product-detail-page">
      <ErrorBoundary fallback={<ProductNotFound />}>
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail productPromise={productPromise} />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<div>评价加载失败</div>}>
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection reviewsPromise={reviewsPromise} />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={null}>
        <Suspense fallback={<RecommendationsSkeleton />}>
          <Recommendations recommendationsPromise={recommendationsPromise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// 商品详情
function ProductDetail({ productPromise }) {
  const product = use(productPromise);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      alert('已添加到购物车');
    } catch (error) {
      alert('添加失败');
    }
  };
  
  return (
    <div className="product-detail">
      <div className="images">
        <img 
          src={product.images[selectedImage]} 
          alt={product.name}
          className="main-image"
        />
        <div className="thumbnails">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              className={index === selectedImage ? 'active' : ''}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </div>
      
      <div className="info">
        <h1>{product.name}</h1>
        
        <div className="rating">
          <Stars rating={product.rating} />
          <span>{product.reviewCount} 评价</span>
        </div>
        
        <div className="price">
          <span className="current">¥{product.price}</span>
          {product.originalPrice && (
            <span className="original">¥{product.originalPrice}</span>
          )}
        </div>
        
        <div className="description">
          {product.description}
        </div>
        
        <div className="actions">
          <QuantitySelector 
            value={quantity}
            onChange={setQuantity}
            max={product.stock}
          />
          <button 
            className="add-to-cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? '加入购物车' : '已售罄'}
          </button>
        </div>
        
        <div className="specs">
          <h3>商品参数</h3>
          <dl>
            {Object.entries(product.specifications).map(([key, value]) => (
              <React.Fragment key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
```

## 第三部分：社交媒体应用

### 3.1 动态流

```jsx
// 动态流API
async function fetchFeed(page = 1) {
  const response = await fetch(`/api/feed?page=${page}`);
  if (!response.ok) throw new Error('获取动态失败');
  return response.json();
}

// 动态流组件
function FeedPage() {
  const [pages, setPages] = useState([1]);
  
  const loadMore = useCallback(() => {
    setPages(prev => [...prev, prev.length + 1]);
  }, []);
  
  // 监听滚动加载更多
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = 
        document.documentElement;
      
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);
  
  return (
    <div className="feed-page">
      <h1>动态</h1>
      
      {pages.map(page => (
        <ErrorBoundary key={page} fallback={<FeedPageError />}>
          <Suspense fallback={<FeedPageSkeleton />}>
            <FeedPage 
              feedPromise={fetchFeed(page)}
            />
          </Suspense>
        </ErrorBoundary>
      ))}
    </div>
  );
}

// 单页动态
function FeedPage({ feedPromise }) {
  const { posts } = use(feedPromise);
  
  return (
    <div className="feed-page">
      {posts.map(post => (
        <FeedItem key={post.id} post={post} />
      ))}
    </div>
  );
}

function FeedItem({ post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  
  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => prev + (newLiked ? 1 : -1));
    
    try {
      await toggleLike(post.id);
    } catch (error) {
      // 回滚
      setLiked(!newLiked);
      setLikeCount(prev => prev + (newLiked ? -1 : 1));
    }
  };
  
  return (
    <article className="feed-item">
      <header>
        <img src={post.author.avatar} alt={post.author.name} />
        <div>
          <div className="name">{post.author.name}</div>
          <div className="time">
            {formatRelativeTime(post.createdAt)}
          </div>
        </div>
      </header>
      
      <div className="content">{post.content}</div>
      
      {post.images && (
        <div className="images">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" />
          ))}
        </div>
      )}
      
      <footer>
        <button 
          className={liked ? 'liked' : ''}
          onClick={handleLike}
        >
          ❤️ {likeCount}
        </button>
        <button>
          💬 {post.commentCount}
        </button>
        <button>
          🔗 分享
        </button>
      </footer>
    </article>
  );
}
```

### 3.2 用户主页

```jsx
// 用户主页API
async function fetchUserProfile(username) {
  const response = await fetch(`/api/users/${username}`);
  
  if (response.status === 404) {
    throw new NotFoundError('用户不存在');
  }
  
  if (!response.ok) {
    throw new Error('获取用户信息失败');
  }
  
  return response.json();
}

async function fetchUserPosts(username) {
  const response = await fetch(`/api/users/${username}/posts`);
  if (!response.ok) throw new Error('获取用户动态失败');
  return response.json();
}

// 用户主页
function UserProfilePage({ params }) {
  const username = params.username;
  
  const profilePromise = useMemo(() => 
    fetchUserProfile(username),
    [username]
  );
  
  const postsPromise = useMemo(() => 
    fetchUserPosts(username),
    [username]
  );
  
  return (
    <div className="user-profile-page">
      <ErrorBoundary fallback={<UserNotFound />}>
        <Suspense fallback={<ProfileSkeleton />}>
          <UserProfile profilePromise={profilePromise} />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<div>动态加载失败</div>}>
        <Suspense fallback={<PostsSkeleton />}>
          <UserPosts postsPromise={postsPromise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// 用户资料
function UserProfile({ profilePromise }) {
  const user = use(profilePromise);
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  
  const handleFollow = async () => {
    const newFollowing = !isFollowing;
    setIsFollowing(newFollowing);
    
    try {
      await toggleFollow(user.id);
    } catch (error) {
      setIsFollowing(!newFollowing);
      alert('操作失败');
    }
  };
  
  return (
    <div className="user-profile">
      <div className="cover">
        <img src={user.coverImage} alt="" />
      </div>
      
      <div className="info">
        <img 
          className="avatar" 
          src={user.avatar} 
          alt={user.name} 
        />
        
        <h1>{user.name}</h1>
        <p className="username">@{user.username}</p>
        <p className="bio">{user.bio}</p>
        
        <div className="stats">
          <div>
            <strong>{user.postsCount}</strong>
            <span>动态</span>
          </div>
          <div>
            <strong>{user.followersCount}</strong>
            <span>关注者</span>
          </div>
          <div>
            <strong>{user.followingCount}</strong>
            <span>关注中</span>
          </div>
        </div>
        
        <button 
          className={isFollowing ? 'following' : 'follow'}
          onClick={handleFollow}
        >
          {isFollowing ? '已关注' : '关注'}
        </button>
      </div>
    </div>
  );
}
```

## 第四部分：搜索功能

### 4.1 实时搜索

```jsx
// 搜索API
async function searchContent(query, filters = {}) {
  const params = new URLSearchParams({
    q: query,
    ...filters
  }).toString();
  
  const response = await fetch(`/api/search?${params}`);
  if (!response.ok) throw new Error('搜索失败');
  return response.json();
}

// 搜索页面
function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'relevance'
  });
  
  // 防抖查询
  const debouncedQuery = useDebounce(query, 500);
  
  const searchPromise = useMemo(() => {
    if (!debouncedQuery) return null;
    return searchContent(debouncedQuery, filters);
  }, [debouncedQuery, filters]);
  
  return (
    <div className="search-page">
      <div className="search-header">
        <SearchInput 
          value={query}
          onChange={setQuery}
          placeholder="搜索..."
        />
        
        <SearchFilters 
          filters={filters}
          onChange={setFilters}
        />
      </div>
      
      <div className="search-results">
        {!searchPromise ? (
          <EmptySearch />
        ) : (
          <ErrorBoundary fallback={<SearchError />}>
            <Suspense fallback={<SearchSkeleton />}>
              <SearchResults searchPromise={searchPromise} />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

// 搜索结果
function SearchResults({ searchPromise }) {
  const { results, total, suggestions } = use(searchPromise);
  
  if (results.length === 0) {
    return (
      <div className="no-results">
        <p>未找到相关结果</p>
        {suggestions.length > 0 && (
          <div className="suggestions">
            <p>您是否要找：</p>
            {suggestions.map(suggestion => (
              <a key={suggestion} href={`/search?q=${suggestion}`}>
                {suggestion}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="results-list">
      <div className="results-header">
        找到 {total} 个结果
      </div>
      
      {results.map(result => (
        <SearchResultItem key={result.id} result={result} />
      ))}
    </div>
  );
}

function SearchResultItem({ result }) {
  return (
    <article className="search-result-item">
      <h3>
        <a href={result.url}>
          <Highlight text={result.title} />
        </a>
      </h3>
      <p className="description">
        <Highlight text={result.description} />
      </p>
      <div className="meta">
        <span className="type">{result.type}</span>
        <span className="date">{formatDate(result.date)}</span>
      </div>
    </article>
  );
}
```

## 第五部分：性能优化实践

### 5.1 路由预加载

```jsx
// 路由配置
const routes = [
  { path: '/', component: HomePage },
  { path: '/posts/:id', component: PostPage },
  { path: '/users/:username', component: UserPage }
];

// 预加载函数
const preloadData = {
  '/posts/:id': (id) => fetchPost(id),
  '/users/:username': (username) => fetchUserProfile(username)
};

// Link组件with预加载
function SmartLink({ to, children, ...props }) {
  const handleMouseEnter = () => {
    // 鼠标悬停时预加载
    const preloader = findPreloader(to);
    if (preloader) {
      preloader();
    }
  };
  
  return (
    <Link 
      to={to}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  );
}

// 使用
<SmartLink to={`/posts/${post.id}`}>
  {post.title}
</SmartLink>
```

### 5.2 数据缓存

```jsx
// 创建缓存系统
class DataCache {
  constructor(ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.promise;
  }
  
  set(key, promise) {
    this.cache.set(key, {
      promise,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

const dataCache = new DataCache();

// 带缓存的数据获取
function fetchWithCache(key, fetcher) {
  const cached = dataCache.get(key);
  
  if (cached) {
    console.log('使用缓存:', key);
    return cached;
  }
  
  console.log('发起请求:', key);
  const promise = fetcher();
  dataCache.set(key, promise);
  
  return promise;
}

// 使用
function UserProfile({ userId }) {
  const userPromise = useMemo(() => 
    fetchWithCache(`user:${userId}`, () => fetchUser(userId)),
    [userId]
  );
  
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

## 注意事项

### 1. Promise稳定性

```jsx
// ❌ 错误：每次渲染创建新Promise
function Bad() {
  const data = use(fetchData());  // 无限循环！
  return <div>{data}</div>;
}

// ✅ 正确：使用useMemo
function Good() {
  const promise = useMemo(() => fetchData(), []);
  const data = use(promise);
  return <div>{data}</div>;
}
```

### 2. 错误边界覆盖

```jsx
// ✅ 总是配合ErrorBoundary使用
<ErrorBoundary fallback={<Error />}>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

### 3. 合理的Suspense边界

```jsx
// ✅ 细粒度的Suspense边界
<div>
  <Suspense fallback={<HeaderSkeleton />}>
    <Header />
  </Suspense>
  
  <Suspense fallback={<ContentSkeleton />}>
    <Content />
  </Suspense>
</div>
```

## 常见问题

### Q1: 如何处理竞态条件？

**A:** use()和Suspense会自动处理，新的Promise会取消旧的。

### Q2: 如何实现数据刷新？

**A:** 改变Promise的依赖，重新创建Promise。

### Q3: 如何优化大量数据的渲染？

**A:** 使用虚拟滚动、分页加载、懒加载等技术。

## 总结

### use()实战要点

```
✅ Promise必须稳定（useMemo）
✅ 配合ErrorBoundary和Suspense
✅ 合理设置边界粒度
✅ 实现缓存机制
✅ 预加载优化体验
✅ 处理各种错误类型
✅ 提供友好的加载状态
✅ 注意性能优化
```

### 最佳实践总结

```
1. 数据获取：use()
2. 用户交互：useState + useEffect
3. 错误处理：ErrorBoundary
4. 加载状态：Suspense
5. 性能优化：缓存 + 预加载
6. 用户体验：骨架屏 + 友好提示
```

通过这些实战案例，你应该能够在真实项目中熟练使用use() Hook了！
