# React Router v6基础

## 概述

React Router是React生态中最流行的路由解决方案，用于构建单页应用（SPA）的导航系统。React Router v6带来了重大更新，简化了API，提升了性能，增强了TypeScript支持。

## React Router v6的新特性

### 主要变化

1. **简化的API**：更直观的路由配置方式
2. **更好的性能**：优化的匹配算法和渲染逻辑
3. **增强的嵌套路由**：更灵活的嵌套路由支持
4. **内置的数据获取**：新的loader和action模式
5. **改进的TypeScript支持**：更好的类型推导

### v5 vs v6对比

```jsx
// React Router v5
import { BrowserRouter, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/users/:id" component={UserProfile} />
        <Route path="/products" component={Products} />
      </Switch>
    </BrowserRouter>
  );
}

// React Router v6
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 安装和基础设置

### 安装

```bash
# npm
npm install react-router-dom

# yarn
yarn add react-router-dom

# pnpm
pnpm add react-router-dom
```

### 基础配置

```jsx
// main.jsx 或 index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="App">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
```

## 核心概念

### 1. Router组件

Router是所有路由功能的基础容器：

```jsx
import { 
  BrowserRouter,
  HashRouter,
  MemoryRouter,
  StaticRouter
} from 'react-router-dom';

// BrowserRouter - 最常用，使用HTML5 history API
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </BrowserRouter>
  );
}

// HashRouter - 使用hash模式，兼容性更好
function HashApp() {
  return (
    <HashRouter>
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </HashRouter>
  );
}

// MemoryRouter - 在内存中管理历史记录，适用于测试
function TestApp() {
  return (
    <MemoryRouter initialEntries={['/users', '/products']}>
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </MemoryRouter>
  );
}

// 带基础路径的配置
function AppWithBasename() {
  return (
    <BrowserRouter basename="/my-app">
      <Routes>
        <Route path="/" element={<Home />} /> {/* 实际URL: /my-app/ */}
        <Route path="/users" element={<Users />} /> {/* 实际URL: /my-app/users */}
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. Routes和Route

Routes是Route的容器，Route定义路径与组件的映射：

```jsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* 精确匹配根路径 */}
      <Route path="/" element={<Home />} />
      
      {/* 静态路径 */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* 动态参数 */}
      <Route path="/users/:id" element={<UserProfile />} />
      <Route path="/products/:category/:id" element={<ProductDetail />} />
      
      {/* 可选参数 */}
      <Route path="/blog/:year?/:month?" element={<BlogArchive />} />
      
      {/* 通配符匹配 */}
      <Route path="/docs/*" element={<Documentation />} />
      
      {/* 404页面 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// 多个Routes
function AppWithMultipleRoutes() {
  return (
    <div>
      <header>
        <Routes>
          <Route path="/admin/*" element={<AdminHeader />} />
          <Route path="*" element={<UserHeader />} />
        </Routes>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/user/*" element={<UserRoutes />} />
        </Routes>
      </main>
    </div>
  );
}
```

### 3. Link和NavLink

用于创建导航链接：

```jsx
import { Link, NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* 基础链接 */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
      
      {/* 带状态的链接 */}
      <Link to="/users" state={{ from: 'navigation' }}>
        Users
      </Link>
      
      {/* 替换历史记录 */}
      <Link to="/login" replace>
        Login
      </Link>
      
      {/* 相对链接 */}
      <Link to="../parent">Go to Parent</Link>
      <Link to="child">Go to Child</Link>
      
      {/* NavLink - 自动应用active样式 */}
      <NavLink
        to="/dashboard"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Dashboard
      </NavLink>
      
      {/* 自定义active判断 */}
      <NavLink
        to="/products"
        className={({ isActive }) => 
          `nav-link ${isActive ? 'nav-link-active' : ''}`
        }
        style={({ isActive }) => ({
          color: isActive ? '#ff6b6b' : '#333'
        })}
      >
        Products
      </NavLink>
      
      {/* end属性 - 只有完全匹配才active */}
      <NavLink to="/users" end>
        Users
      </NavLink>
    </nav>
  );
}
```

## 路由参数

### URL参数

```jsx
import { useParams } from 'react-router-dom';

// 路由定义
<Route path="/users/:id" element={<UserProfile />} />
<Route path="/products/:category/:productId" element={<ProductDetail />} />

// 获取参数
function UserProfile() {
  const { id } = useParams(); // id是字符串
  const userId = parseInt(id, 10);

  return (
    <div>
      <h1>User Profile #{userId}</h1>
    </div>
  );
}

function ProductDetail() {
  const { category, productId } = useParams();

  return (
    <div>
      <h1>Product: {productId}</h1>
      <p>Category: {category}</p>
    </div>
  );
}

// 可选参数
<Route path="/blog/:year?/:month?/:day?" element={<BlogArchive />} />

function BlogArchive() {
  const { year, month, day } = useParams();

  const buildDateString = () => {
    let dateStr = '';
    if (year) dateStr += year;
    if (month) dateStr += `-${month}`;
    if (day) dateStr += `-${day}`;
    return dateStr || 'All time';
  };

  return (
    <div>
      <h1>Blog Archive</h1>
      <p>Viewing posts from: {buildDateString()}</p>
    </div>
  );
}
```

### 查询参数

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 获取查询参数
  const category = searchParams.get('category');
  const sortBy = searchParams.get('sortBy') || 'name';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  // 更新查询参数
  const updateFilters = (filters) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  // 清除特定参数
  const clearFilter = (filterName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterName);
    setSearchParams(newParams);
  };

  return (
    <div>
      <div className="filters">
        <select
          value={category || ''}
          onChange={(e) => updateFilters({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="date">Sort by Date</option>
        </select>

        <input
          type="number"
          value={limit}
          onChange={(e) => updateFilters({ limit: e.target.value })}
          min="5"
          max="50"
        />
      </div>

      <div className="products">
        {/* 产品列表 */}
        <ProductGrid 
          category={category} 
          sortBy={sortBy} 
          page={page} 
          limit={limit} 
        />
      </div>

      <div className="pagination">
        <button
          onClick={() => updateFilters({ page: page - 1 })}
          disabled={page <= 1}
        >
          Previous
        </button>
        
        <span>Page {page}</span>
        
        <button
          onClick={() => updateFilters({ page: page + 1 })}
        >
          Next
        </button>
      </div>

      <div className="actions">
        <button onClick={() => setSearchParams({})}>
          Clear All Filters
        </button>
        
        <button onClick={() => clearFilter('category')}>
          Clear Category Filter
        </button>
      </div>
    </div>
  );
}
```

### Location状态

```jsx
import { useLocation, useNavigate } from 'react-router-dom';

// 传递状态
function UserList() {
  const navigate = useNavigate();

  const handleUserClick = (user) => {
    navigate(`/users/${user.id}`, {
      state: { 
        user,
        from: 'user-list',
        timestamp: Date.now()
      }
    });
  };

  return (
    <div>
      {users.map(user => (
        <button key={user.id} onClick={() => handleUserClick(user)}>
          {user.name}
        </button>
      ))}
    </div>
  );
}

// 接收状态
function UserProfile() {
  const location = useLocation();
  const { id } = useParams();

  // 获取传递的状态
  const userFromState = location.state?.user;
  const fromPage = location.state?.from;
  
  const [user, setUser] = useState(userFromState);

  useEffect(() => {
    // 如果没有从状态获取到用户信息，则从API获取
    if (!userFromState) {
      fetchUser(id).then(setUser);
    }
  }, [id, userFromState]);

  return (
    <div>
      <h1>{user?.name}</h1>
      {fromPage && <p>Navigated from: {fromPage}</p>}
      
      <button onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}

// 监听位置变化
function LocationTracker() {
  const location = useLocation();

  useEffect(() => {
    // 记录页面访问
    analytics.track('page_view', {
      path: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return null; // 这是一个工具组件
}
```

## 编程式导航

### useNavigate Hook

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = async (credentials) => {
    try {
      const user = await login(credentials);
      
      // 登录成功后导航
      navigate('/dashboard', { 
        replace: true // 替换历史记录，防止返回到登录页
      });
      
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCancel = () => {
    // 返回上一页
    navigate(-1);
  };

  const handleSignUp = () => {
    // 导航到注册页，保持历史记录
    navigate('/signup');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit">Login</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
      <button type="button" onClick={handleSignUp}>Sign Up</button>
    </form>
  );
}

// 条件导航
function ProtectedComponent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [user, navigate]);

  if (!user) return null;

  return <div>Protected content</div>;
}

// 导航with state
function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/products/${product.id}`, {
      state: {
        product,
        from: 'product-list',
        filters: currentFilters
      }
    });
  };

  return (
    <div onClick={handleClick}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

## 布局和嵌套路由

### Outlet组件

```jsx
import { Outlet } from 'react-router-dom';

// 布局组件
function Layout() {
  return (
    <div className="layout">
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main>
        {/* Outlet渲染匹配的子路由 */}
        <Outlet />
      </main>

      <footer>
        <p>&copy; 2024 My App</p>
      </footer>
    </div>
  );
}

// 嵌套路由配置
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 这些是Layout的子路由 */}
        <Route index element={<Home />} /> {/* index路由匹配父路径 */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* 嵌套的嵌套路由 */}
        <Route path="users" element={<UsersLayout />}>
          <Route index element={<UsersList />} />
          <Route path=":id" element={<UserDetail />} />
          <Route path=":id/edit" element={<UserEdit />} />
          <Route path="new" element={<UserCreate />} />
        </Route>
      </Route>

      {/* 独立路由（不使用Layout） */}
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// 用户模块的布局
function UsersLayout() {
  return (
    <div className="users-layout">
      <aside>
        <nav>
          <Link to="/users">All Users</Link>
          <Link to="/users/new">Add User</Link>
        </nav>
      </aside>

      <div className="users-content">
        <Outlet /> {/* 渲染用户相关的子路由 */}
      </div>
    </div>
  );
}
```

### 传递数据给Outlet

```jsx
function ParentLayout() {
  const [sharedData, setSharedData] = useState({
    theme: 'light',
    user: null
  });

  return (
    <div>
      <header>Layout Header</header>
      
      {/* 传递context给子路由 */}
      <Outlet context={{ sharedData, setSharedData }} />
    </div>
  );
}

// 在子组件中使用
import { useOutletContext } from 'react-router-dom';

function ChildComponent() {
  const { sharedData, setSharedData } = useOutletContext();

  return (
    <div>
      <p>Current theme: {sharedData.theme}</p>
      <button onClick={() => 
        setSharedData(prev => ({ 
          ...prev, 
          theme: prev.theme === 'light' ? 'dark' : 'light' 
        }))
      }>
        Toggle Theme
      </button>
    </div>
  );
}
```

## 实战案例

### 案例1：博客应用路由

```jsx
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

function BlogApp() {
  return (
    <div className="blog-app">
      <Routes>
        <Route path="/" element={<BlogLayout />}>
          {/* 首页显示所有文章 */}
          <Route index element={<PostsList />} />
          
          {/* 分类页面 */}
          <Route path="category/:category" element={<CategoryPosts />} />
          
          {/* 标签页面 */}
          <Route path="tag/:tag" element={<TagPosts />} />
          
          {/* 搜索页面 */}
          <Route path="search" element={<SearchResults />} />
          
          {/* 文章详情 */}
          <Route path="posts/:slug" element={<PostDetail />} />
          
          {/* 作者页面 */}
          <Route path="authors/:authorId" element={<AuthorProfile />} />
          
          {/* 归档页面 */}
          <Route path="archive" element={<ArchiveLayout />}>
            <Route index element={<ArchiveHome />} />
            <Route path=":year" element={<YearlyArchive />} />
            <Route path=":year/:month" element={<MonthlyArchive />} />
          </Route>
        </Route>

        {/* 管理后台 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPostsList />} />
          <Route path="posts/new" element={<CreatePost />} />
          <Route path="posts/:id/edit" element={<EditPost />} />
        </Route>

        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function BlogLayout() {
  return (
    <div className="blog-layout">
      <header className="blog-header">
        <Link to="/" className="logo">
          <h1>My Blog</h1>
        </Link>

        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/category/tech">Tech</Link>
          <Link to="/category/lifestyle">Lifestyle</Link>
          <Link to="/archive">Archive</Link>
        </nav>

        <SearchBox />
      </header>

      <main className="blog-main">
        <Outlet />
      </main>

      <footer className="blog-footer">
        <p>&copy; 2024 My Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then(posts => {
      setPosts(posts);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading posts...</div>;

  return (
    <div className="posts-list">
      <h2>Latest Posts</h2>
      
      <div className="posts-grid">
        {posts.map(post => (
          <article key={post.id} className="post-card">
            <Link to={`/posts/${post.slug}`}>
              <img src={post.thumbnail} alt={post.title} />
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              
              <div className="post-meta">
                <span>{post.publishedAt}</span>
                <Link to={`/authors/${post.author.id}`}>
                  {post.author.name}
                </Link>
                
                <div className="post-tags">
                  {post.tags.map(tag => (
                    <Link key={tag} to={`/tag/${tag}`} className="tag">
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostBySlug(slug)
      .then(setPost)
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article className="post-detail">
      <header className="post-header">
        <h1>{post.title}</h1>
        
        <div className="post-meta">
          <time>{post.publishedAt}</time>
          <Link to={`/authors/${post.author.id}`}>
            By {post.author.name}
          </Link>
        </div>

        <div className="post-categories">
          {post.categories.map(category => (
            <Link key={category} to={`/category/${category}`} className="category">
              {category}
            </Link>
          ))}
        </div>
      </header>

      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <footer className="post-footer">
        <div className="post-tags">
          {post.tags.map(tag => (
            <Link key={tag} to={`/tag/${tag}`} className="tag">
              #{tag}
            </Link>
          ))}
        </div>

        <div className="post-actions">
          <button onClick={() => navigate(-1)}>
            Back
          </button>
          
          <button onClick={() => navigate(`/posts/${slug}/edit`)}>
            Edit
          </button>
        </div>
      </footer>
    </article>
  );
}

function SearchBox() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-box">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
      />
      <button type="submit">Search</button>
    </form>
  );
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchPosts(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }
  }, [query]);

  if (!query) {
    return (
      <div className="search-results">
        <h2>Search</h2>
        <p>Enter a search term to find posts.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <h2>Search Results for "{query}"</h2>
      
      {loading ? (
        <div>Searching...</div>
      ) : (
        <div>
          <p>Found {results.length} results</p>
          
          <div className="search-results-list">
            {results.map(post => (
              <div key={post.id} className="search-result">
                <Link to={`/posts/${post.slug}`}>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 案例2：电商应用路由

```jsx
function EcommerceApp() {
  return (
    <Routes>
      <Route path="/" element={<ShopLayout />}>
        {/* 首页 */}
        <Route index element={<HomePage />} />
        
        {/* 产品相关 */}
        <Route path="products" element={<ProductsLayout />}>
          <Route index element={<ProductsList />} />
          <Route path="category/:category" element={<CategoryProducts />} />
          <Route path=":productId" element={<ProductDetail />} />
        </Route>
        
        {/* 用户相关 */}
        <Route path="account" element={<AccountLayout />}>
          <Route index element={<AccountOverview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="addresses" element={<AddressBook />} />
        </Route>
        
        {/* 购物流程 */}
        <Route path="cart" element={<ShoppingCart />} />
        <Route path="checkout" element={<CheckoutLayout />}>
          <Route index element={<CheckoutOverview />} />
          <Route path="shipping" element={<ShippingInfo />} />
          <Route path="payment" element={<PaymentInfo />} />
          <Route path="review" element={<OrderReview />} />
          <Route path="success" element={<OrderSuccess />} />
        </Route>
      </Route>

      {/* 认证页面 */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* 管理后台 */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

function ProductsLayout() {
  return (
    <div className="products-layout">
      <aside className="filters-sidebar">
        <ProductFilters />
      </aside>

      <div className="products-main">
        <Outlet />
      </div>
    </div>
  );
}

function CheckoutLayout() {
  const location = useLocation();
  
  const steps = [
    { path: '/checkout', label: 'Overview' },
    { path: '/checkout/shipping', label: 'Shipping' },
    { path: '/checkout/payment', label: 'Payment' },
    { path: '/checkout/review', label: 'Review' }
  ];

  const currentStepIndex = steps.findIndex(step => 
    location.pathname === step.path
  );

  return (
    <div className="checkout-layout">
      <div className="checkout-progress">
        {steps.map((step, index) => (
          <div
            key={step.path}
            className={`step ${index <= currentStepIndex ? 'completed' : ''}`}
          >
            {step.label}
          </div>
        ))}
      </div>

      <div className="checkout-content">
        <Outlet />
      </div>
    </div>
  );
}
```

## 路由配置对象

### 使用createBrowserRouter

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 配置对象方式定义路由
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'products',
        element: <ProductsLayout />,
        children: [
          {
            index: true,
            element: <ProductsList />
          },
          {
            path: ':id',
            element: <ProductDetail />,
            loader: ({ params }) => fetchProduct(params.id)
          }
        ]
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        loader: dashboardLoader
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  }
]);

// 使用RouterProvider
function App() {
  return <RouterProvider router={router} />;
}

// Loader函数
async function dashboardLoader() {
  const [user, stats, notifications] = await Promise.all([
    fetchCurrentUser(),
    fetchUserStats(),
    fetchNotifications()
  ]);

  return {
    user,
    stats,
    notifications
  };
}

// 在组件中使用loader数据
import { useLoaderData } from 'react-router-dom';

function Dashboard() {
  const { user, stats, notifications } = useLoaderData();

  return (
    <div className="dashboard">
      <h1>Welcome back, {user.name}!</h1>
      
      <div className="stats-grid">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="stat-card">
            <h3>{key}</h3>
            <p>{value}</p>
          </div>
        ))}
      </div>

      <div className="notifications">
        <h2>Recent Notifications</h2>
        {notifications.map(notification => (
          <div key={notification.id} className="notification">
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 最佳实践

### 1. 路由结构设计

```jsx
// 好的路由结构 - 层次清晰
const goodRouteStructure = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      
      // 用户相关路由群组
      {
        path: 'users',
        element: <UsersLayout />,
        children: [
          { index: true, element: <UsersList /> },
          { path: ':id', element: <UserDetail /> },
          { path: ':id/edit', element: <UserEdit /> }
        ]
      },
      
      // 产品相关路由群组
      {
        path: 'products',
        element: <ProductsLayout />,
        children: [
          { index: true, element: <ProductsList /> },
          { path: 'category/:category', element: <CategoryProducts /> },
          { path: ':id', element: <ProductDetail /> }
        ]
      }
    ]
  }
];

// 避免的结构 - 扁平化过度
const badRouteStructure = [
  { path: '/', element: <Home /> },
  { path: '/users', element: <UsersList /> },
  { path: '/users/:id', element: <UserDetail /> },
  { path: '/users/:id/edit', element: <UserEdit /> },
  { path: '/products', element: <ProductsList /> },
  { path: '/products/category/:category', element: <CategoryProducts /> },
  { path: '/products/:id', element: <ProductDetail /> },
  // ... 大量扁平路由
];
```

### 2. 错误处理

```jsx
// 全局错误边界
function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    // 记录错误
    console.error('Route error:', error);
  }, [error]);

  if (error?.status === 404) {
    return (
      <div className="error-page">
        <h1>页面未找到</h1>
        <p>抱歉，您访问的页面不存在。</p>
        <button onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1>出现错误</h1>
      <p>抱歉，页面加载时出现了问题。</p>
      <pre>{error?.message}</pre>
      <button onClick={() => navigate(-1)}>
        返回上页
      </button>
    </div>
  );
}
```

### 3. 性能优化

```jsx
// 路由级代码分割
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        
        <Route 
          path="dashboard" 
          element={
            <Suspense fallback={<div>Loading dashboard...</div>}>
              <Dashboard />
            </Suspense>
          } 
        />
        
        <Route 
          path="products/:id" 
          element={
            <Suspense fallback={<ProductSkeleton />}>
              <ProductDetail />
            </Suspense>
          } 
        />
      </Route>
    </Routes>
  );
}
```

## 总结

React Router v6提供了强大而灵活的路由功能：

1. **简化的API**：更直观的Routes和Route组件
2. **强大的嵌套路由**：支持复杂的应用结构
3. **灵活的导航**：声明式和编程式导航
4. **数据获取集成**：loader和action模式
5. **性能优化**：内置的优化和代码分割支持

掌握这些基础概念是构建现代React应用的重要技能。
