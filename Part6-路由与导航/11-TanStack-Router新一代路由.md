# TanStack Router新一代路由

## 概述

TanStack Router是TanStack团队推出的下一代路由解决方案，专为TypeScript优先、类型安全的现代React应用设计。它提供了100%类型安全的路由、强大的数据加载能力、内置的缓存管理和出色的开发体验。

## TanStack Router核心特性

### 主要优势

```typescript
// TanStack Router的核心优势
const tanStackRouterFeatures = {
  typeScript: {
    fullTypeSafety: '100%类型安全的路由定义',
    autoComplete: 'IDE智能提示和自动补全',
    typeInference: '路径参数和搜索参数类型推断',
    compileTimeErrors: '编译时发现路由错误'
  },

  performance: {
    codeSpitting: '自动代码分割',
    prefetching: '智能预取',
    caching: '内置缓存管理',
    streaming: '支持流式SSR'
  },

  devExperience: {
    fileRouting: '文件系统路由（可选）',
    devTools: '强大的开发工具',
    errorHandling: '完善的错误处理',
    testing: '易于测试'
  },

  dataManagement: {
    loaders: '类型安全的数据加载',
    mutations: '变更管理',
    invalidation: '智能缓存失效',
    optimistic: '乐观更新支持'
  }
};
```

## 安装和配置

### 基础安装

```bash
npm install @tanstack/react-router
# 或
pnpm add @tanstack/react-router

# 类型生成工具（可选但推荐）
npm install -D @tanstack/router-vite-plugin
```

### Vite配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      // 自动生成路由类型
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts'
    })
  ]
});
```

### 基础路由设置

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// 创建路由实例
const router = createRouter({
  routeTree,
  defaultPreload: 'intent' // 悬停时预加载
});

// 注册路由类型
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

## 路由定义

### 文件系统路由

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users">Users</Link>
      </nav>
      
      <hr />
      
      <Outlet />
      
      {/* 开发工具 */}
      <TanStackRouterDevtools />
    </div>
  )
});

// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage
});

function HomePage() {
  return (
    <div>
      <h1>Welcome Home!</h1>
    </div>
  );
}

// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage
});

function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
    </div>
  );
}

// src/routes/users.index.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/')({
  loader: async () => {
    const users = await fetch('/api/users').then(r => r.json());
    return { users };
  },
  component: UsersListPage
});

function UsersListPage() {
  const { users } = Route.useLoaderData();
  
  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <Link to="/users/$userId" params={{ userId: user.id }}>
              {user.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// src/routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    const user = await fetch(`/api/users/${params.userId}`)
      .then(r => r.json());
    return { user };
  },
  component: UserDetailPage
});

function UserDetailPage() {
  const { user } = Route.useLoaderData();
  const { userId } = Route.useParams();
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>User ID: {userId}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### 编程式路由定义

```typescript
// src/routes.tsx
import { 
  createRootRoute, 
  createRoute,
  createRouter 
} from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: RootLayout
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersLayout
});

const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/',
  loader: async () => {
    const users = await fetchUsers();
    return { users };
  },
  component: UsersList
});

const userDetailRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/$userId',
  loader: async ({ params }) => {
    const user = await fetchUser(params.userId);
    return { user };
  },
  component: UserDetail
});

// 构建路由树
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute.addChildren([
    usersIndexRoute,
    userDetailRoute
  ])
]);

// 创建路由实例
export const router = createRouter({
  routeTree
});
```

## 类型安全

### 路径参数类型

```typescript
// src/routes/products/$productId.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

// 定义参数Schema
const productParamsSchema = z.object({
  productId: z.string().uuid() // 必须是UUID格式
});

export const Route = createFileRoute('/products/$productId')({
  // 参数验证
  params: {
    parse: (params) => productParamsSchema.parse(params),
    stringify: (params) => params
  },
  
  loader: async ({ params }) => {
    // params.productId 类型安全且已验证
    const product = await fetch(`/api/products/${params.productId}`)
      .then(r => r.json());
    return { product };
  },
  
  component: ProductDetail
});

function ProductDetail() {
  // 完全类型安全
  const { productId } = Route.useParams();
  const { product } = Route.useLoaderData();
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Product ID: {productId}</p>
    </div>
  );
}

// 导航时的类型检查
function ProductsList() {
  const navigate = Route.useNavigate();
  
  const handleNavigate = (id: string) => {
    // TypeScript会检查params类型
    navigate({
      to: '/products/$productId',
      params: { productId: id } // 必须匹配定义的类型
    });
  };
  
  return <div>{/* 产品列表 */}</div>;
}
```

### 搜索参数类型

```typescript
// src/routes/search.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

// 定义搜索参数Schema
const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(10000).optional(),
  sortBy: z.enum(['name', 'price', 'rating']).optional(),
  page: z.number().int().positive().default(1)
});

type SearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute('/search')({
  // 验证搜索参数
  validateSearch: (search) => searchParamsSchema.parse(search),
  
  loader: async ({ search }) => {
    // search 是完全类型安全的
    const results = await searchProducts(search);
    return { results };
  },
  
  component: SearchPage
});

function SearchPage() {
  const { results } = Route.useLoaderData();
  const search = Route.useSearch(); // 类型安全的搜索参数
  const navigate = Route.useNavigate();
  
  const updateSearch = (newParams: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({ ...prev, ...newParams })
    });
  };
  
  return (
    <div>
      <h1>Search Results for: {search.q}</h1>
      
      <div className="filters">
        <select
          value={search.category}
          onChange={(e) => updateSearch({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
        </select>
        
        <input
          type="number"
          placeholder="Min Price"
          value={search.minPrice}
          onChange={(e) => updateSearch({ 
            minPrice: parseFloat(e.target.value) 
          })}
        />
        
        <input
          type="number"
          placeholder="Max Price"
          value={search.maxPrice}
          onChange={(e) => updateSearch({ 
            maxPrice: parseFloat(e.target.value) 
          })}
        />
      </div>
      
      <div className="results">
        {results.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### Context类型安全

```typescript
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// 定义路由上下文类型
interface RouterContext {
  user: {
    id: string;
    name: string;
    role: 'admin' | 'user';
  } | null;
  auth: {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
  };
}

export const router = createRouter({
  routeTree,
  context: undefined! as RouterContext, // 初始化时设置类型
  defaultPreload: 'intent'
});

// 在应用入口注入context
function App() {
  const [user, setUser] = useState<RouterContext['user']>(null);
  
  const auth = {
    login: async (credentials: LoginCredentials) => {
      const user = await loginAPI(credentials);
      setUser(user);
    },
    logout: async () => {
      await logoutAPI();
      setUser(null);
    }
  };
  
  return (
    <RouterProvider 
      router={router} 
      context={{ user, auth }}
    />
  );
}

// 在路由中使用context
// src/routes/dashboard.tsx
export const Route = createFileRoute('/dashboard')({
  // 访问控制
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: '/dashboard' }
      });
    }
    
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/unauthorized' });
    }
  },
  
  loader: async ({ context }) => {
    // context.user 类型安全
    const data = await fetchDashboardData(context.user.id);
    return { data };
  },
  
  component: DashboardPage
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
    </div>
  );
}
```

## 数据加载

### Loader详解

```typescript
// 基础Loader
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const post = await fetch(`/api/posts/${params.postId}`)
      .then(r => r.json());
    return { post };
  },
  component: PostDetail
});

// 并行数据加载
export const AdvancedRoute = createFileRoute('/users/$userId')({
  loader: async ({ params }) => {
    // 并行加载多个数据源
    const [user, posts, followers] = await Promise.all([
      fetchUser(params.userId),
      fetchUserPosts(params.userId),
      fetchUserFollowers(params.userId)
    ]);
    
    return { user, posts, followers };
  }
});

// 依赖加载
export const DependentRoute = createFileRoute('/projects/$projectId')({
  loader: async ({ params }) => {
    // 先加载项目
    const project = await fetchProject(params.projectId);
    
    // 基于项目加载团队成员
    const members = await fetchTeamMembers(project.teamId);
    
    // 基于项目加载任务
    const tasks = await fetchTasks(params.projectId);
    
    return { project, members, tasks };
  }
});

// 条件加载
export const ConditionalRoute = createFileRoute('/content/$contentId')({
  loader: async ({ params, context, search }) => {
    const content = await fetchContent(params.contentId);
    
    // 根据用户权限加载额外数据
    let extendedData = null;
    if (context.user?.role === 'admin') {
      extendedData = await fetchAdminData(params.contentId);
    }
    
    // 根据搜索参数加载评论
    let comments = null;
    if (search.includeComments) {
      comments = await fetchComments(params.contentId);
    }
    
    return { content, extendedData, comments };
  }
});

// 错误处理
export const ErrorHandlingRoute = createFileRoute('/data/$id')({
  loader: async ({ params }) => {
    try {
      const data = await fetchData(params.id);
      
      if (!data) {
        throw new NotFoundError('Data not found');
      }
      
      return { data };
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw redirect({ to: '/404' });
      }
      
      if (error instanceof UnauthorizedError) {
        throw redirect({ to: '/login' });
      }
      
      // 其他错误继续抛出
      throw error;
    }
  },
  
  errorComponent: ({ error }) => {
    return (
      <div className="error">
        <h1>Error Loading Data</h1>
        <p>{error.message}</p>
      </div>
    );
  }
});
```

### Pending组件

```typescript
// 使用pending状态
export const Route = createFileRoute('/slow-data')({
  loader: async () => {
    // 模拟慢速API
    await new Promise(resolve => setTimeout(resolve, 2000));
    const data = await fetchData();
    return { data };
  },
  
  pendingComponent: () => (
    <div className="loading">
      <Spinner />
      <p>Loading data...</p>
    </div>
  ),
  
  component: SlowDataPage
});

// 使用useLoaderData with suspense
function SlowDataPage() {
  const { data } = Route.useLoaderData();
  
  return (
    <div>
      <h1>Data Loaded!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// 使用Await进行渐进式渲染
import { Await } from '@tanstack/react-router';
import { Suspense } from 'react';

export const StreamingRoute = createFileRoute('/streaming')({
  loader: async () => {
    // 快速数据
    const critical = await fetchCriticalData();
    
    // 慢速数据（不await）
    const slow = fetchSlowData();
    
    return { critical, slow };
  },
  
  component: StreamingPage
});

function StreamingPage() {
  const { critical, slow } = Route.useLoaderData();
  
  return (
    <div>
      {/* 立即显示关键数据 */}
      <div className="critical">
        <h1>Critical Data</h1>
        <p>{critical.content}</p>
      </div>
      
      {/* 流式加载慢速数据 */}
      <Suspense fallback={<div>Loading additional data...</div>}>
        <Await promise={slow}>
          {(slowData) => (
            <div className="additional">
              <h2>Additional Data</h2>
              <p>{slowData.content}</p>
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
```

## 导航和链接

### Link组件

```typescript
import { Link } from '@tanstack/react-router';

function Navigation() {
  return (
    <nav>
      {/* 基础链接 */}
      <Link to="/">Home</Link>
      
      {/* 带参数的链接 */}
      <Link 
        to="/users/$userId" 
        params={{ userId: '123' }}
      >
        User 123
      </Link>
      
      {/* 带搜索参数的链接 */}
      <Link
        to="/search"
        search={{ q: 'react', category: 'books' }}
      >
        Search React Books
      </Link>
      
      {/* 更新搜索参数（保留其他参数） */}
      <Link
        to="/search"
        search={(prev) => ({ ...prev, page: 2 })}
      >
        Next Page
      </Link>
      
      {/* 激活状态 */}
      <Link
        to="/dashboard"
        activeProps={{
          className: 'active',
          style: { fontWeight: 'bold' }
        }}
        activeOptions={{
          exact: true // 精确匹配
        }}
      >
        Dashboard
      </Link>
      
      {/* 预加载 */}
      <Link
        to="/products/$productId"
        params={{ productId: '456' }}
        preload="intent" // 悬停时预加载
      >
        Product 456
      </Link>
      
      {/* 替换历史记录 */}
      <Link
        to="/login"
        replace
      >
        Login
      </Link>
    </nav>
  );
}
```

### useNavigate Hook

```typescript
import { useNavigate } from '@tanstack/react-router';

function ProductActions() {
  const navigate = useNavigate();
  
  const handleViewProduct = (productId: string) => {
    navigate({
      to: '/products/$productId',
      params: { productId }
    });
  };
  
  const handleSearch = (query: string) => {
    navigate({
      to: '/search',
      search: { q: query }
    });
  };
  
  const handleUpdateFilters = () => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        category: 'electronics',
        minPrice: 100
      })
    });
  };
  
  const handleGoBack = () => {
    navigate({ to: '..', from: '/products/$productId' });
  };
  
  const handleReplace = () => {
    navigate({
      to: '/success',
      replace: true // 替换历史记录
    });
  };
  
  return (
    <div>
      <button onClick={() => handleViewProduct('123')}>
        View Product
      </button>
      <button onClick={() => handleSearch('laptop')}>
        Search
      </button>
      <button onClick={handleUpdateFilters}>
        Update Filters
      </button>
      <button onClick={handleGoBack}>
        Go Back
      </button>
    </div>
  );
}
```

## 缓存管理

### Loader缓存

```typescript
// 配置全局缓存
export const router = createRouter({
  routeTree,
  defaultPreloadStaleTime: 10000, // 10秒内认为数据新鲜
  defaultPreloadDelay: 100 // 悬停100ms后开始预加载
});

// 路由级缓存配置
export const Route = createFileRoute('/users')({
  loader: async () => {
    const users = await fetchUsers();
    return { users };
  },
  
  // 缓存配置
  staleTime: 30000, // 30秒内数据视为新鲜
  gcTime: 600000, // 10分钟后清理缓存
  
  component: UsersPage
});

// 手动失效缓存
function UserActions() {
  const router = useRouter();
  
  const handleCreateUser = async (userData: UserData) => {
    await createUser(userData);
    
    // 失效用户列表缓存
    router.invalidate({
      filter: (route) => route.id === '/users'
    });
  };
  
  const handleUpdateUser = async (userId: string, data: UserData) => {
    await updateUser(userId, data);
    
    // 失效特定用户的缓存
    router.invalidate({
      filter: (route) => 
        route.id === `/users/$userId` && 
        route.params.userId === userId
    });
    
    // 同时失效用户列表
    router.invalidate({ filter: (route) => route.id === '/users' });
  };
  
  return <div>{/* UI */}</div>;
}
```

### 预加载策略

```typescript
// 不同的预加载策略
const preloadStrategies = {
  // 悬停时预加载
  intent: {
    example: <Link to="/products" preload="intent" />
  },
  
  // 渲染时立即预加载
  render: {
    example: <Link to="/products" preload="render" />
  },
  
  // 从不预加载
  none: {
    example: <Link to="/products" preload={false} />
  }
};

// 编程式预加载
function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  
  const handleMouseEnter = () => {
    // 手动预加载产品详情页
    router.preloadRoute({
      to: '/products/$productId',
      params: { productId: product.id }
    });
  };
  
  return (
    <div onMouseEnter={handleMouseEnter}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}

// 预加载多个路由
function Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    // 预加载常用路由
    Promise.all([
      router.preloadRoute({ to: '/dashboard/analytics' }),
      router.preloadRoute({ to: '/dashboard/reports' }),
      router.preloadRoute({ to: '/dashboard/settings' })
    ]);
  }, [router]);
  
  return <div>{/* Dashboard content */}</div>;
}
```

## 高级特性

### 路由掩码

```typescript
// 使用路由掩码隐藏实际URL
export const Route = createFileRoute('/users/$userId')({
  component: UserDetail
});

function UsersList() {
  return (
    <div>
      {users.map(user => (
        <Link
          key={user.id}
          to="/users/$userId"
          params={{ userId: user.id }}
          mask={{
            to: '/u/$username',
            params: { username: user.username }
          }}
        >
          {user.name}
        </Link>
      ))}
    </div>
  );
}

// 实际路由: /users/123
// 浏览器显示: /u/john-doe
```

### 路由元数据

```typescript
// 添加路由元数据
export const Route = createFileRoute('/blog/$slug')({
  meta: ({ loaderData }) => [
    {
      title: loaderData.post.title
    },
    {
      name: 'description',
      content: loaderData.post.excerpt
    },
    {
      property: 'og:title',
      content: loaderData.post.title
    },
    {
      property: 'og:image',
      content: loaderData.post.image
    }
  ],
  
  loader: async ({ params }) => {
    const post = await fetchPost(params.slug);
    return { post };
  },
  
  component: BlogPost
});

// 在Root中应用meta
export const RootRoute = createRootRoute({
  component: () => {
    const matches = useMatches();
    const meta = matches.flatMap(match => match.meta ?? []);
    
    return (
      <>
        <Head>
          {meta.map((tag, i) => {
            if ('title' in tag) {
              return <title key={i}>{tag.title}</title>;
            }
            return <meta key={i} {...tag} />;
          })}
        </Head>
        
        <Outlet />
      </>
    );
  }
});
```

### 路由守卫

```typescript
// 全局认证守卫
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href
        }
      });
    }
  },
  
  component: Dashboard
});

// 角色权限守卫
export const AdminRoute = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' });
    }
    
    if (context.user.role !== 'admin') {
      throw redirect({ to: '/unauthorized' });
    }
  },
  
  component: AdminPanel
});

// 数据验证守卫
export const PostRoute = createFileRoute('/posts/$postId')({
  beforeLoad: async ({ params }) => {
    // 验证ID格式
    if (!isValidUUID(params.postId)) {
      throw redirect({ to: '/404' });
    }
  },
  
  loader: async ({ params }) => {
    const post = await fetchPost(params.postId);
    
    if (!post) {
      throw redirect({ to: '/404' });
    }
    
    return { post };
  }
});
```

## 开发工具

### TanStack Router DevTools

```typescript
// 启用开发工具
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      
      {/* 开发工具面板 */}
      <TanStackRouterDevtools 
        position="bottom-right"
        initialIsOpen={false}
      />
    </>
  )
});

// DevTools功能
const devToolsFeatures = {
  routeTree: '可视化路由树结构',
  navigation: '导航历史记录',
  loaderData: '查看loader数据',
  cache: '缓存状态检查',
  params: '路径和搜索参数',
  matches: '当前匹配的路由'
};
```

## 实战案例

### 案例1：博客平台

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="app">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
});

// src/routes/blog.index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const blogSearchSchema = z.object({
  category: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10)
});

export const Route = createFileRoute('/blog/')({
  validateSearch: blogSearchSchema,
  
  loader: async ({ search }) => {
    const posts = await fetchPosts({
      category: search.category,
      page: search.page,
      limit: search.limit
    });
    
    const categories = await fetchCategories();
    
    return { posts, categories };
  },
  
  component: BlogIndex
});

function BlogIndex() {
  const { posts, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  
  const handleCategoryChange = (category: string) => {
    navigate({
      search: { ...search, category, page: 1 }
    });
  };
  
  return (
    <div className="blog-index">
      <aside className="categories">
        <h3>Categories</h3>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={search.category === cat.slug ? 'active' : ''}
          >
            {cat.name}
          </button>
        ))}
      </aside>
      
      <div className="posts">
        {posts.items.map(post => (
          <article key={post.id}>
            <Link to="/blog/$slug" params={{ slug: post.slug }}>
              <h2>{post.title}</h2>
            </Link>
            <p>{post.excerpt}</p>
          </article>
        ))}
        
        <Pagination
          current={search.page}
          total={posts.totalPages}
          onChange={(page) => navigate({ search: { ...search, page } })}
        />
      </div>
    </div>
  );
}

// src/routes/blog/$slug.tsx
export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const [post, comments, related] = await Promise.all([
      fetchPost(params.slug),
      fetchComments(params.slug),
      fetchRelatedPosts(params.slug)
    ]);
    
    if (!post) {
      throw redirect({ to: '/404' });
    }
    
    return { post, comments, related };
  },
  
  meta: ({ loaderData }) => [
    { title: `${loaderData.post.title} | Blog` },
    { name: 'description', content: loaderData.post.excerpt },
    { property: 'og:title', content: loaderData.post.title },
    { property: 'og:image', content: loaderData.post.coverImage }
  ],
  
  component: BlogPost
});

function BlogPost() {
  const { post, comments, related } = Route.useLoaderData();
  
  return (
    <article className="blog-post">
      <header>
        <h1>{post.title}</h1>
        <div className="meta">
          <span>{post.author.name}</span>
          <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
        </div>
      </header>
      
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <CommentSection comments={comments} postSlug={post.slug} />
      
      <RelatedPosts posts={related} />
    </article>
  );
}
```

### 案例2：电商商品管理

```typescript
// src/routes/products.tsx
export const Route = createFileRoute('/products')({
  component: ProductsLayout
});

function ProductsLayout() {
  return (
    <div className="products-layout">
      <ProductsNav />
      <Outlet />
    </div>
  );
}

// src/routes/products/index.tsx
const productsSearchSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(10000).optional(),
  sortBy: z.enum(['name', 'price', 'rating']).default('name'),
  page: z.number().int().positive().default(1)
});

export const Route = createFileRoute('/products/')({
  validateSearch: productsSearchSchema,
  
  loader: async ({ search }) => {
    const products = await fetchProducts(search);
    const filters = await fetchFilters();
    
    return { products, filters };
  },
  
  staleTime: 60000, // 1分钟缓存
  
  component: ProductsList
});

// src/routes/products/$productId.tsx
export const Route = createFileRoute('/products/$productId')({
  params: {
    parse: (params) => ({
      productId: z.string().uuid().parse(params.productId)
    })
  },
  
  loader: async ({ params }) => {
    const product = await fetchProduct(params.productId);
    
    if (!product) {
      throw redirect({ to: '/404' });
    }
    
    return { product };
  },
  
  component: ProductDetail,
  
  pendingComponent: ProductDetailSkeleton
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const router = useRouter();
  
  const handleAddToCart = async () => {
    await addToCart(product.id);
    
    // 失效购物车缓存
    router.invalidate({
      filter: (route) => route.id === '/cart'
    });
  };
  
  return (
    <div className="product-detail">
      <div className="product-images">
        <ProductGallery images={product.images} />
      </div>
      
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
        
        <button onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <Await promise={fetchReviews(product.id)}>
          {(reviews) => <ProductReviews reviews={reviews} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

## 迁移指南

### 从React Router迁移

```typescript
// React Router v6
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/users/:userId" element={<UserDetail />} />
  </Routes>
</BrowserRouter>

function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  return <div>{userId}</div>;
}

// TanStack Router
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/users/$userId')({
  component: UserDetail
});

function UserDetail() {
  const { userId } = Route.useParams(); // 类型安全
  const navigate = Route.useNavigate();
  
  return <div>{userId}</div>;
}

// 迁移核心差异
const migrationDifferences = {
  typeScript: 'TanStack Router提供完整类型安全',
  dataLoading: '内置loader替代useEffect',
  caching: '内置缓存管理',
  devTools: '强大的开发工具',
  fileRouting: '可选的文件系统路由'
};
```

## 最佳实践

```typescript
const bestPractices = {
  typeScript: {
    useZod: '使用Zod验证参数',
    defineTypes: '明确定义路由类型',
    strictMode: '启用TypeScript严格模式'
  },
  
  performance: {
    caching: '合理配置缓存时间',
    preloading: '使用智能预加载',
    codeSpitting: '按路由分割代码'
  },
  
  organization: {
    fileRouting: '使用文件系统路由组织代码',
    coLocation: '相关代码放在一起',
    conventions: '遵循命名约定'
  },
  
  dataManagement: {
    loaders: '在loader中加载数据',
    parallelFetch: '并行获取独立数据',
    errorHandling: '完善的错误处理'
  }
};
```

## 总结

TanStack Router作为新一代路由解决方案，提供了：

1. **100%类型安全**：完整的TypeScript支持
2. **出色性能**：内置缓存和智能预加载
3. **现代开发体验**：强大的开发工具
4. **灵活配置**：文件路由或编程式配置
5. **数据管理**：内置loader和缓存管理

TanStack Router特别适合大型TypeScript项目，能够显著提升开发效率和代码质量。
