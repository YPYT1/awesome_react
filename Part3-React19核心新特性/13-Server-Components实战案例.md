# Server Components实战案例

## 学习目标

通过本章学习，你将掌握：

- 完整的Server Components应用架构
- 博客系统实现
- 电商平台实现
- 社交媒体实现
- Dashboard应用实现
- 实时数据展示
- 复杂表单处理
- 文件上传管理
- 性能优化实践

## 第一部分：博客系统

### 1.1 文章列表页

```jsx
// app/posts/page.jsx
import { Suspense } from 'react';
import { db } from '@/lib/database';
import PostCard from './PostCard';
import Pagination from './Pagination';
import PostsSkeleton from './PostsSkeleton';

// Server Component - 获取文章列表
async function getposts(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    db.posts.findMany({
      skip,
      take: limit,
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
            comments: true,
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    db.posts.count()
  ]);
  
  return { posts, total, totalPages: Math.ceil(total / limit) };
}

// Server Component - 文章列表页
export default async function PostsPage({ searchParams }) {
  const page = Number(searchParams.page) || 1;
  const { posts, totalPages } = await getPosts(page);
  
  return (
    <div className="posts-page">
      <header>
        <h1>博客文章</h1>
        <CreatePostButton />
      </header>
      
      <Suspense fallback={<PostsSkeleton />}>
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </Suspense>
      
      <Pagination 
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}

// Server Component - 文章卡片
function PostCard({ post }) {
  return (
    <article className="post-card">
      <Link href={`/posts/${post.id}`}>
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} />
        )}
        
        <h2>{post.title}</h2>
        <p className="excerpt">{post.excerpt}</p>
        
        <div className="meta">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="avatar"
          />
          <span>{post.author.name}</span>
          <time>{formatDate(post.createdAt)}</time>
        </div>
        
        <div className="stats">
          <span>❤️ {post._count.likes}</span>
          <span>💬 {post._count.comments}</span>
        </div>
      </Link>
    </article>
  );
}

// Client Component - 创建文章按钮
'use client';

function CreatePostButton() {
  const router = useRouter();
  
  return (
    <button onClick={() => router.push('/posts/new')}>
      ✏️ 写文章
    </button>
  );
}
```

### 1.2 文章详情页

```jsx
// app/posts/[id]/page.jsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/database';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import RelatedPosts from './RelatedPosts';

// 生成静态路径
export async function generateStaticParams() {
  const posts = await db.posts.findMany({
    select: { id: true }
  });
  
  return posts.map(post => ({
    id: post.id
  }));
}

// 生成元数据
export async function generateMetadata({ params }) {
  const post = await db.posts.findUnique({
    where: { id: params.id }
  });
  
  if (!post) return {};
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    }
  };
}

// 获取文章详情
async function getPost(id) {
  const post = await db.posts.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true
        }
      },
      _count: {
        select: {
          comments: true,
          likes: true
        }
      }
    }
  });
  
  if (!post) notFound();
  
  return post;
}

// Server Component - 文章详情页
export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  
  return (
    <div className="post-page">
      <article className="post-content">
        <header>
          <h1>{post.title}</h1>
          
          <div className="author-info">
            <img src={post.author.avatar} alt={post.author.name} />
            <div>
              <div className="name">{post.author.name}</div>
              <time>{formatDate(post.createdAt)}</time>
            </div>
          </div>
        </header>
        
        {post.coverImage && (
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="cover-image"
          />
        )}
        
        <div 
          className="content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <footer>
          <div className="tags">
            {post.tags.map(tag => (
              <Link key={tag} href={`/tags/${tag}`}>
                #{tag}
              </Link>
            ))}
          </div>
          
          <LikeButton 
            postId={post.id}
            initialLikes={post._count.likes}
          />
        </footer>
      </article>
      
      {/* 评论区 */}
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentSection postId={post.id} />
      </Suspense>
      
      {/* 相关文章 */}
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedPosts 
          postId={post.id}
          tags={post.tags}
        />
      </Suspense>
    </div>
  );
}

// Server Component - 评论区
async function CommentSection({ postId }) {
  const comments = await db.comments.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return (
    <div className="comments-section">
      <h2>评论 ({comments.length})</h2>
      
      <CommentForm postId={postId} />
      
      <div className="comments-list">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

// Client Component - 点赞按钮
'use client';

import { likePost } from './actions';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);
  
  const handleLike = async () => {
    if (pending) return;
    
    setPending(true);
    setLiked(true);
    setLikes(prev => prev + 1);
    
    try {
      await likePost(postId);
    } catch (error) {
      setLiked(false);
      setLikes(prev => prev - 1);
      alert('点赞失败');
    } finally {
      setPending(false);
    }
  };
  
  return (
    <button 
      className={`like-button ${liked ? 'liked' : ''}`}
      onClick={handleLike}
      disabled={pending}
    >
      {liked ? '❤️' : '🤍'} {likes}
    </button>
  );
}
```

### 1.3 文章创建/编辑

```jsx
// app/posts/new/page.jsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/database';
import PostForm from './PostForm';

// Server Action - 创建文章
async function createPost(formData) {
  'use server';
  
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  const title = formData.get('title');
  const content = formData.get('content');
  const excerpt = formData.get('excerpt');
  const tags = formData.get('tags')?.split(',').map(t => t.trim()) || [];
  
  // 验证
  if (!title || title.length < 3) {
    return { error: '标题至少3个字符' };
  }
  
  if (!content || content.length < 100) {
    return { error: '内容至少100个字符' };
  }
  
  // 创建文章
  const post = await db.posts.create({
    data: {
      title,
      content,
      excerpt,
      tags,
      authorId: session.userId
    }
  });
  
  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}

// Server Component
export default async function NewPostPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="new-post-page">
      <h1>写文章</h1>
      <PostForm action={createPost} />
    </div>
  );
}

// Client Component - 文章表单
'use client';

function PostForm({ action, initialData = {} }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 客户端验证
    const newErrors = {};
    
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = '标题至少3个字符';
    }
    
    if (!formData.content || formData.content.length < 100) {
      newErrors.content = '内容至少100个字符';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setPending(true);
    
    try {
      const formData = new FormData(e.target);
      const result = await action(formData);
      
      if (result?.error) {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: '提交失败，请重试' });
    } finally {
      setPending(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="form-group">
        <label>标题</label>
        <input
          name="title"
          value={formData.title || ''}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="输入文章标题..."
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      
      <div className="form-group">
        <label>摘要</label>
        <textarea
          name="excerpt"
          value={formData.excerpt || ''}
          onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
          placeholder="简短描述..."
          rows={3}
        />
      </div>
      
      <div className="form-group">
        <label>内容</label>
        <MarkdownEditor
          name="content"
          value={formData.content || ''}
          onChange={(value) => setFormData({...formData, content: value})}
        />
        {errors.content && <span className="error">{errors.content}</span>}
      </div>
      
      <div className="form-group">
        <label>标签</label>
        <input
          name="tags"
          value={formData.tags || ''}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
          placeholder="用逗号分隔，如: React, TypeScript"
        />
      </div>
      
      {errors.submit && (
        <div className="error">{errors.submit}</div>
      )}
      
      <button type="submit" disabled={pending}>
        {pending ? '发布中...' : '发布文章'}
      </button>
    </form>
  );
}
```

## 第二部分：电商平台

### 2.1 商品列表页

```jsx
// app/products/page.jsx
import { db } from '@/lib/database';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import SortSelect from './SortSelect';

// Server Component - 获取商品
async function getProducts(filters = {}) {
  const { category, minPrice, maxPrice, sortBy = 'newest' } = filters;
  
  const where = {};
  
  if (category) {
    where.categoryId = category;
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  
  const orderBy = {
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    popular: { salesCount: 'desc' }
  }[sortBy] || { createdAt: 'desc' };
  
  const products = await db.products.findMany({
    where,
    orderBy,
    include: {
      category: true,
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });
  
  return products;
}

// Server Component - 商品列表页
export default async function ProductsPage({ searchParams }) {
  const filters = {
    category: searchParams.category,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    sortBy: searchParams.sortBy
  };
  
  const products = await getProducts(filters);
  const categories = await db.categories.findMany();
  
  return (
    <div className="products-page">
      <FilterSidebar 
        categories={categories}
        currentFilters={filters}
      />
      
      <main>
        <div className="toolbar">
          <h1>商品列表</h1>
          <SortSelect currentSort={filters.sortBy} />
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

// Server Component - 商品卡片
function ProductCard({ product }) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  
  return (
    <article className="product-card">
      <Link href={`/products/${product.id}`}>
        <div className="image-wrapper">
          <img src={product.images[0]} alt={product.name} />
          {discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
        </div>
        
        <h3>{product.name}</h3>
        
        <div className="price">
          <span className="current">¥{product.price}</span>
          {product.originalPrice && (
            <span className="original">¥{product.originalPrice}</span>
          )}
        </div>
        
        <div className="rating">
          <Stars rating={product.averageRating} />
          <span>({product._count.reviews})</span>
        </div>
      </Link>
      
      <AddToCartButton 
        productId={product.id}
        productName={product.name}
        price={product.price}
      />
    </article>
  );
}
```

### 2.2 商品详情页

```jsx
// app/products/[id]/page.jsx
import { notFound } from 'next/navigation';
import { db } from '@/lib/database';
import ImageGallery from './ImageGallery';
import AddToCartForm from './AddToCartForm';
import ProductTabs from './ProductTabs';
import Reviews from './Reviews';
import Recommendations from './Recommendations';

// 获取商品详情
async function getProduct(id) {
  const product = await db.products.findUnique({
    where: { id },
    include: {
      category: true,
      specifications: true,
      _count: {
        select: {
          reviews: true
        }
      }
    }
  });
  
  if (!product) notFound();
  
  return product;
}

// Server Component - 商品详情页
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  
  return (
    <div className="product-page">
      <div className="product-detail">
        <ImageGallery images={product.images} />
        
        <div className="product-info">
          <h1>{product.name}</h1>
          
          <div className="rating-row">
            <Stars rating={product.averageRating} />
            <span>{product._count.reviews} 评价</span>
          </div>
          
          <div className="price-row">
            <span className="price">¥{product.price}</span>
            {product.originalPrice && (
              <span className="original">¥{product.originalPrice}</span>
            )}
          </div>
          
          <div className="description">
            {product.description}
          </div>
          
          <AddToCartForm 
            product={product}
            addToCartAction={addToCart}
          />
          
          <div className="specs">
            <h3>商品参数</h3>
            <dl>
              {product.specifications.map(spec => (
                <React.Fragment key={spec.key}>
                  <dt>{spec.key}</dt>
                  <dd>{spec.value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </div>
      </div>
      
      <ProductTabs 
        description={product.detailedDescription}
        specs={product.specifications}
      />
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={product.id} />
      </Suspense>
      
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations 
          productId={product.id}
          categoryId={product.categoryId}
        />
      </Suspense>
    </div>
  );
}

// Server Action - 添加到购物车
async function addToCart(formData) {
  'use server';
  
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const productId = formData.get('productId');
  const quantity = Number(formData.get('quantity'));
  
  // 检查库存
  const product = await db.products.findUnique({
    where: { id: productId }
  });
  
  if (!product || product.stock < quantity) {
    return { error: '库存不足' };
  }
  
  // 添加到购物车
  await db.cartItems.upsert({
    where: {
      userId_productId: {
        userId: session.userId,
        productId
      }
    },
    create: {
      userId: session.userId,
      productId,
      quantity
    },
    update: {
      quantity: {
        increment: quantity
      }
    }
  });
  
  revalidatePath('/cart');
  
  return { success: true };
}

// Client Component - 添加到购物车表单
'use client';

function AddToCartForm({ product, addToCartAction }) {
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setPending(true);
    
    try {
      const formData = new FormData();
      formData.set('productId', product.id);
      formData.set('quantity', quantity.toString());
      
      const result = await addToCartAction(formData);
      
      if (result.success) {
        alert('已添加到购物车');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('添加失败');
    } finally {
      setPending(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="add-to-cart-form">
      <div className="quantity-selector">
        <button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
        >
          +
        </button>
      </div>
      
      <button 
        type="submit"
        disabled={pending || product.stock === 0}
      >
        {pending ? '添加中...' : product.stock === 0 ? '已售罄' : '加入购物车'}
      </button>
      
      <span className="stock-info">
        库存: {product.stock} 件
      </span>
    </form>
  );
}
```

## 第三部分：用户Dashboard

### 3.1 Dashboard主页

```jsx
// app/dashboard/page.jsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/database';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';
import Charts from './Charts';

// Server Component - Dashboard
export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="dashboard-page">
      <h1>欢迎回来, {session.user.name}</h1>
      
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards userId={session.userId} />
      </Suspense>
      
      <div className="dashboard-grid">
        <Suspense fallback={<ActivitySkeleton />}>
          <RecentActivity userId={session.userId} />
        </Suspense>
        
        <Suspense fallback={<ChartsSkeleton />}>
          <Charts userId={session.userId} />
        </Suspense>
      </div>
    </div>
  );
}

// Server Component - 统计卡片
async function StatsCards({ userId }) {
  const stats = await db.$transaction([
    db.posts.count({ where: { authorId: userId } }),
    db.comments.count({ where: { authorId: userId } }),
    db.likes.count({ where: { post: { authorId: userId } } }),
    db.followers.count({ where: { followingId: userId } })
  ]);
  
  return (
    <div className="stats-cards">
      <StatCard title="文章" value={stats[0]} icon="📝" />
      <StatCard title="评论" value={stats[1]} icon="💬" />
      <StatCard title="点赞" value={stats[2]} icon="❤️" />
      <StatCard title="粉丝" value={stats[3]} icon="👥" />
    </div>
  );
}

// Server Component - 最近活动
async function RecentActivity({ userId }) {
  const activities = await db.activities.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      post: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });
  
  return (
    <div className="recent-activity">
      <h2>最近活动</h2>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            <ActivityItem activity={activity} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 注意事项

### 1. 始终验证权限

```jsx
// ✅ 每个Server Action都要验证权限
'use server';

export async function deletePost(postId) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (post.authorId !== session.userId) {
    throw new Error('无权限');
  }
  
  await db.posts.delete({
    where: { id: postId }
  });
}
```

### 2. 优化数据查询

```jsx
// ✅ 使用include预加载，避免N+1查询
const posts = await db.posts.findMany({
  include: {
    author: true,
    _count: {
      select: {
        comments: true,
        likes: true
      }
    }
  }
});
```

### 3. 合理设置缓存

```jsx
// ✅ 根据数据特性设置缓存
// 静态数据
export const revalidate = 3600;  // 1小时

// 动态数据
export const revalidate = 0;  // 不缓存

// 按需重新验证
revalidatePath('/posts');
```

## 常见问题

### Q1: 如何处理大量并发请求？

**A:** 使用数据库连接池、缓存层、CDN和负载均衡。

### Q2: Server Components会增加服务器成本吗？

**A:** 会增加服务器负载，但通过缓存可以大大减少。整体上仍比纯客户端渲染更高效。

### Q3: 如何优化大型列表性能？

**A:** 使用分页、虚拟滚动和增量加载。

## 总结

### Server Components实战要点

```
✅ 合理组织组件结构
✅ Server Component获取数据
✅ Client Component处理交互
✅ Server Actions处理表单
✅ 优化数据库查询
✅ 实现错误处理
✅ 添加Loading状态
✅ 验证权限和输入
```

### 性能优化

```
✅ 并行数据获取
✅ 预加载关联数据
✅ 合理使用缓存
✅ 流式渲染
✅ 按需加载组件
✅ 优化图片资源
✅ 使用CDN
```

通过这些实战案例，你应该能够构建完整的Server Components应用了！
