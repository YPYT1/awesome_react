# Remix 路由与 Loader

## 课程概述

本课程深入讲解Remix的路由系统和Loader数据加载机制。Remix的嵌套路由和Loader模式是其核心特性,提供了优雅的数据加载和页面组织方式。

学习目标:
- 掌握Remix路由系统
- 理解嵌套路由
- 学习动态路由参数
- 掌握Loader数据加载
- 理解并行数据加载
- 学习路由优先级
- 掌握路由布局
- 构建复杂的路由结构

---

## 一、路由基础

### 1.1 文件系统路由

```
app/routes/
├── _index.tsx                    # GET /
├── about.tsx                     # GET /about
├── contact.tsx                   # GET /contact
├── blog._index.tsx               # GET /blog
├── blog.$slug.tsx                # GET /blog/:slug
├── blog.new.tsx                  # GET /blog/new
├── users._index.tsx              # GET /users
├── users.$userId.tsx             # GET /users/:userId
├── users.$userId.posts.$postId.tsx  # GET /users/:userId/posts/:postId
└── $.tsx                         # 捕获所有未匹配路由
```

### 1.2 基础路由示例

```typescript
// app/routes/_index.tsx
export default function Index() {
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <nav>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  )
}

// app/routes/about.tsx
export default function About() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Learn more about our company</p>
    </div>
  )
}

// app/routes/contact.tsx
export default function Contact() {
  return (
    <div>
      <h1>Contact</h1>
      <p>Get in touch with us</p>
    </div>
  )
}
```

### 1.3 Link 组件

```typescript
// app/routes/_index.tsx
import { Link } from "@remix-run/react"

export default function Index() {
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <nav>
        {/* Link 组件提供客户端路由 */}
        <Link to="/about">About</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/contact">Contact</Link>
        
        {/* prefetch 预加载 */}
        <Link to="/dashboard" prefetch="intent">
          Dashboard
        </Link>
        
        {/* 外部链接 */}
        <Link to="https://remix.run" reloadDocument>
          Remix Docs
        </Link>
      </nav>
    </div>
  )
}
```

---

## 二、动态路由

### 2.1 单个参数

```typescript
// app/routes/posts.$postId.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { postId } = params
  
  const post = await db.post.findUnique({
    where: { id: postId }
  })
  
  if (!post) {
    throw new Response("Post not found", { status: 404 })
  }
  
  return json({ post })
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author}</p>
      <div>{post.content}</div>
      <time>{new Date(post.createdAt).toLocaleDateString()}</time>
    </article>
  )
}
```

### 2.2 多个参数

```typescript
// app/routes/users.$userId.posts.$postId.tsx
// URL: /users/123/posts/456
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const { userId, postId } = params
  
  const [user, post] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.post.findUnique({ where: { id: postId } })
  ])
  
  if (!user || !post) {
    throw new Response("Not found", { status: 404 })
  }
  
  // 验证文章是否属于该用户
  if (post.authorId !== userId) {
    throw new Response("Forbidden", { status: 403 })
  }
  
  return json({ user, post })
}

export default function UserPost() {
  const { user, post } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <header>
        <h2>{user.name}'s Post</h2>
      </header>
      <article>
        <h1>{post.title}</h1>
        <p>{post.content}</p>
      </article>
    </div>
  )
}
```

### 2.3 可选参数

```typescript
// app/routes/shop.$.tsx
// 匹配: /shop, /shop/electronics, /shop/electronics/laptops
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const splat = params["*"] // 获取所有路径段
  const segments = splat ? splat.split("/") : []
  
  // 根据路径段加载不同数据
  if (segments.length === 0) {
    // /shop
    const categories = await db.category.findMany()
    return json({ type: "categories", data: categories })
  } else if (segments.length === 1) {
    // /shop/electronics
    const [category] = segments
    const products = await db.product.findMany({
      where: { category }
    })
    return json({ type: "products", data: products, category })
  } else {
    // /shop/electronics/laptops
    const [category, subcategory] = segments
    const products = await db.product.findMany({
      where: { category, subcategory }
    })
    return json({ type: "products", data: products, category, subcategory })
  }
}

export default function Shop() {
  const data = useLoaderData<typeof loader>()
  
  if (data.type === "categories") {
    return (
      <div>
        <h1>Shop Categories</h1>
        <ul>
          {data.data.map(cat => (
            <li key={cat.id}>
              <Link to={`/shop/${cat.slug}`}>{cat.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  
  return (
    <div>
      <h1>{data.category} Products</h1>
      {data.subcategory && <h2>{data.subcategory}</h2>}
      <div>
        {data.data.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 三、嵌套路由

### 3.1 布局路由

```typescript
// app/routes/blog.tsx (父布局)
import { Outlet, Link } from "@remix-run/react"

export default function BlogLayout() {
  return (
    <div className="blog-layout">
      <header className="blog-header">
        <h1>My Blog</h1>
        <nav>
          <Link to="/blog">All Posts</Link>
          <Link to="/blog/new">New Post</Link>
          <Link to="/blog/categories">Categories</Link>
        </nav>
      </header>
      
      <main className="blog-content">
        {/* 子路由渲染在这里 */}
        <Outlet />
      </main>
      
      <aside className="blog-sidebar">
        <h3>Recent Posts</h3>
        {/* 侧边栏内容 */}
      </aside>
    </div>
  )
}

// app/routes/blog._index.tsx (子路由)
import { json } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"

export async function loader() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return json({ posts })
}

export default function BlogIndex() {
  const { posts } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <h2>All Posts</h2>
      <div className="posts-grid">
        {posts.map(post => (
          <article key={post.id}>
            <h3>
              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

// app/routes/blog.$slug.tsx (子路由)
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { slug: params.slug }
  })
  
  if (!post) {
    throw new Response("Not found", { status: 404 })
  }
  
  return json({ post })
}

export default function BlogPost() {
  const { post } = useLoaderData<typeof loader>()
  
  return (
    <article>
      <h2>{post.title}</h2>
      <div>{post.content}</div>
    </article>
  )
}
```

### 3.2 多层嵌套

```typescript
// app/routes/dashboard.tsx (一级布局)
import { Outlet, Link } from "@remix-run/react"

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <nav className="sidebar">
        <Link to="/dashboard">Overview</Link>
        <Link to="/dashboard/settings">Settings</Link>
        <Link to="/dashboard/users">Users</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

// app/routes/dashboard._index.tsx
export default function DashboardIndex() {
  return <h2>Dashboard Overview</h2>
}

// app/routes/dashboard.settings.tsx (二级布局)
import { Outlet, Link } from "@remix-run/react"

export default function SettingsLayout() {
  return (
    <div>
      <h2>Settings</h2>
      <nav>
        <Link to="/dashboard/settings">Profile</Link>
        <Link to="/dashboard/settings/account">Account</Link>
        <Link to="/dashboard/settings/security">Security</Link>
      </nav>
      <Outlet />
    </div>
  )
}

// app/routes/dashboard.settings._index.tsx
export default function SettingsIndex() {
  return <div>Profile Settings</div>
}

// app/routes/dashboard.settings.account.tsx
export default function AccountSettings() {
  return <div>Account Settings</div>
}

// app/routes/dashboard.settings.security.tsx
export default function SecuritySettings() {
  return <div>Security Settings</div>
}
```

### 3.3 无布局路由

```typescript
// app/routes/_auth.tsx (下划线前缀 = 无布局)
import { Outlet } from "@remix-run/react"

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  )
}

// app/routes/_auth.login.tsx
// URL: /login (不包含 _auth 前缀)
export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form method="post">
        <input type="email" name="email" />
        <input type="password" name="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

// app/routes/_auth.register.tsx
// URL: /register
export default function Register() {
  return (
    <div>
      <h1>Register</h1>
      <form method="post">
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="password" name="password" />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
```

---

## 四、Loader 数据加载

### 4.1 基础 Loader

```typescript
// app/routes/products._index.tsx
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

interface Product {
  id: string
  name: string
  price: number
  image: string
}

export async function loader() {
  const products = await db.product.findMany()
  return json({ products })
}

export default function Products() {
  const { products } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <h1>Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4.2 访问请求对象

```typescript
// app/routes/search.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useSearchParams } from "@remix-run/react"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get("q") || ""
  const page = parseInt(url.searchParams.get("page") || "1")
  const limit = 20
  
  if (!query) {
    return json({ results: [], query: "", page, totalPages: 0 })
  }
  
  const [results, total] = await Promise.all([
    db.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    db.product.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }
    })
  ])
  
  return json({
    results,
    query,
    page,
    totalPages: Math.ceil(total / limit)
  })
}

export default function Search() {
  const { results, query, page, totalPages } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  
  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      
      <form>
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search products..."
        />
        <button type="submit">Search</button>
      </form>
      
      {results.length > 0 ? (
        <>
          <div>
            {results.map(result => (
              <div key={result.id}>
                <h3>{result.name}</h3>
                <p>{result.description}</p>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  to={`?q=${query}&page=${p}`}
                  className={p === page ? 'active' : ''}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : query ? (
        <p>No results found</p>
      ) : (
        <p>Enter a search query</p>
      )}
    </div>
  )
}
```

### 4.3 Headers 和 Cookies

```typescript
// app/routes/profile.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ request }: LoaderFunctionArgs) {
  // 访问 cookies
  const cookieHeader = request.headers.get("Cookie")
  const cookies = parseCookies(cookieHeader)
  const sessionId = cookies.session
  
  if (!sessionId) {
    throw redirect("/login")
  }
  
  // 访问其他 headers
  const userAgent = request.headers.get("User-Agent")
  const acceptLanguage = request.headers.get("Accept-Language")
  
  const user = await getUserBySession(sessionId)
  
  if (!user) {
    throw redirect("/login")
  }
  
  return json({
    user,
    userAgent,
    language: acceptLanguage
  })
}

export default function Profile() {
  const { user, userAgent } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <h1>Profile: {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Browser: {userAgent}</p>
    </div>
  )
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  
  return Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, ...rest] = cookie.split('=')
      return [name, rest.join('=')]
    })
  )
}
```

### 4.4 并行数据加载

```typescript
// app/routes/dashboard.tsx
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  // 并行获取多个数据源
  const [user, stats, notifications, recentActivity] = await Promise.all([
    getUser(),
    getStats(),
    getNotifications(),
    getRecentActivity()
  ])
  
  return json({
    user,
    stats,
    notifications,
    recentActivity
  })
}

export default function Dashboard() {
  const { user, stats, notifications, recentActivity } = 
    useLoaderData<typeof loader>()
  
  return (
    <div className="dashboard">
      <header>
        <h1>Welcome, {user.name}</h1>
      </header>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Views</h3>
          <p>{stats.totalViews}</p>
        </div>
        <div className="stat-card">
          <h3>New Users</h3>
          <p>{stats.newUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p>${stats.revenue}</p>
        </div>
      </div>
      
      <div className="notifications">
        <h2>Notifications ({notifications.length})</h2>
        {notifications.map(notif => (
          <div key={notif.id}>{notif.message}</div>
        ))}
      </div>
      
      <div className="activity">
        <h2>Recent Activity</h2>
        {recentActivity.map(activity => (
          <div key={activity.id}>{activity.description}</div>
        ))}
      </div>
    </div>
  )
}
```

---

## 五、嵌套路由数据加载

### 5.1 父子数据传递

```typescript
// app/routes/projects.tsx (父路由)
import { json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"

export async function loader() {
  const projects = await db.project.findMany()
  return json({ projects })
}

export default function ProjectsLayout() {
  const { projects } = useLoaderData<typeof loader>()
  
  return (
    <div className="projects-layout">
      <aside>
        <h2>Projects</h2>
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              <Link to={`/projects/${project.id}`}>
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      
      <main>
        <Outlet /> {/* 子路由可以访问父路由的数据 */}
      </main>
    </div>
  )
}

// app/routes/projects.$projectId.tsx (子路由)
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useMatches } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await db.project.findUnique({
    where: { id: params.projectId },
    include: { tasks: true }
  })
  
  if (!project) {
    throw new Response("Project not found", { status: 404 })
  }
  
  return json({ project })
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>()
  
  // 访问父路由的数据
  const matches = useMatches()
  const projectsRoute = matches.find(m => m.id === "routes/projects")
  const allProjects = projectsRoute?.data.projects
  
  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      
      <h2>Tasks</h2>
      <ul>
        {project.tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
      
      <aside>
        <h3>Other Projects</h3>
        <ul>
          {allProjects?.filter(p => p.id !== project.id).map(p => (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`}>{p.name}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
```

### 5.2 useMatches 访问所有路由数据

```typescript
// app/routes/docs.$category.$slug.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useMatches } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const doc = await getDoc(params.category, params.slug)
  return json({ doc })
}

export default function DocPage() {
  const { doc } = useLoaderData<typeof loader>()
  const matches = useMatches()
  
  // 从所有匹配的路由获取数据
  // matches[0] = root route
  // matches[1] = docs layout
  // matches[2] = current route
  
  return (
    <div>
      <nav>
        {matches.map((match, index) => (
          <span key={match.id}>
            {index > 0 && ' > '}
            {match.pathname}
          </span>
        ))}
      </nav>
      
      <article>
        <h1>{doc.title}</h1>
        <div>{doc.content}</div>
      </article>
    </div>
  )
}
```

---

## 六、高级路由技巧

### 6.1 资源路由

```typescript
// app/routes/api.posts.$postId.json.tsx
// URL: /api/posts/123.json
import { json, LoaderFunctionArgs } from "@remix-run/node"

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { id: params.postId }
  })
  
  if (!post) {
    throw new Response("Not found", { status: 404 })
  }
  
  return json(post)
}

// 没有默认导出 = 资源路由 (只返回数据,不渲染UI)
```

### 6.2 PDF 下载路由

```typescript
// app/routes/invoices.$id.pdf.tsx
import { LoaderFunctionArgs } from "@remix-run/node"
import PDFDocument from 'pdfkit'

export async function loader({ params }: LoaderFunctionArgs) {
  const invoice = await db.invoice.findUnique({
    where: { id: params.id }
  })
  
  if (!invoice) {
    throw new Response("Not found", { status: 404 })
  }
  
  // 生成 PDF
  const doc = new PDFDocument()
  const chunks: Buffer[] = []
  
  doc.on('data', chunk => chunks.push(chunk))
  doc.on('end', () => {})
  
  doc.fontSize(20).text(`Invoice #${invoice.id}`, 100, 100)
  doc.fontSize(12).text(`Total: $${invoice.total}`, 100, 150)
  doc.end()
  
  const pdfBuffer = Buffer.concat(chunks)
  
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.id}.pdf"`
    }
  })
}
```

### 6.3 路由优先级

```typescript
// Remix 路由优先级规则:
// 1. 精确匹配优先于动态匹配
// 2. 更具体的路由优先于通用路由

// 优先级从高到低:
// app/routes/blog.new.tsx              # /blog/new (精确)
// app/routes/blog.$slug.tsx            # /blog/:slug (动态)
// app/routes/blog.$.tsx                # /blog/* (通配符)
// app/routes/$.tsx                     # * (全局通配符)

// 示例:
// GET /blog/new        → blog.new.tsx
// GET /blog/my-post    → blog.$slug.tsx
// GET /blog/a/b/c      → blog.$.tsx
// GET /random/path     → $.tsx
```

---

## 七、实战案例

### 7.1 电商产品系统

```typescript
// app/routes/shop.tsx (布局)
import { json } from "@remix-run/node"
import { Outlet, useLoaderData, Link } from "@remix-run/react"

export async function loader() {
  const categories = await db.category.findMany()
  return json({ categories })
}

export default function ShopLayout() {
  const { categories } = useLoaderData<typeof loader>()
  
  return (
    <div className="shop-layout">
      <header>
        <h1>Shop</h1>
        <nav>
          <Link to="/shop">All Products</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/shop/category/${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>
    </div>
  )
}

// app/routes/shop._index.tsx
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const products = await db.product.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  })
  return json({ products })
}

export default function ShopIndex() {
  const { products } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <h2>All Products</h2>
      <div className="products-grid">
        {products.map(product => (
          <Link key={product.id} to={`/shop/product/${product.slug}`}>
            <div className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// app/routes/shop.category.$slug.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: { products: true }
  })
  
  if (!category) {
    throw new Response("Category not found", { status: 404 })
  }
  
  return json({ category })
}

export default function CategoryPage() {
  const { category } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <h2>{category.name}</h2>
      <p>{category.description}</p>
      
      <div className="products-grid">
        {category.products.map(product => (
          <Link key={product.id} to={`/shop/product/${product.slug}`}>
            <div className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// app/routes/shop.product.$slug.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      reviews: {
        include: { user: true }
      }
    }
  })
  
  if (!product) {
    throw new Response("Product not found", { status: 404 })
  }
  
  return json({ product })
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>()
  
  return (
    <div className="product-detail">
      <div className="product-images">
        <img src={product.image} alt={product.name} />
      </div>
      
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="category">{product.category.name}</p>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
        
        <form method="post">
          <button type="submit">Add to Cart</button>
        </form>
      </div>
      
      <div className="product-reviews">
        <h2>Reviews ({product.reviews.length})</h2>
        {product.reviews.map(review => (
          <div key={review.id} className="review">
            <div className="review-header">
              <strong>{review.user.name}</strong>
              <span>★ {review.rating}/5</span>
            </div>
            <p>{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 八、最佳实践

### 8.1 类型安全

```typescript
// 使用 TypeScript 确保类型安全
export async function loader() {
  const posts = await getPosts()
  return json({ posts }) // 类型推导
}

export default function Posts() {
  // 自动类型推导
  const { posts } = useLoaderData<typeof loader>()
  // posts 的类型是正确的
}
```

### 8.2 错误处理

```typescript
// 在 loader 中抛出 Response
export async function loader({ params }: LoaderFunctionArgs) {
  const post = await getPost(params.id)
  
  if (!post) {
    throw new Response("Post not found", { status: 404 })
  }
  
  return json({ post })
}

// ErrorBoundary 会捕获错误
export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    )
  }
  
  return <div>Unknown error</div>
}
```

### 8.3 学习资源

1. 官方文档
   - Routing: https://remix.run/docs/en/main/guides/routing
   - Loaders: https://remix.run/docs/en/main/route/loader

2. 示例项目
   - Remix Examples
   - Remix Stacks

---

## 课后练习

1. 创建嵌套路由结构
2. 实现动态路由参数
3. 使用 Loader 加载数据
4. 实现并行数据加载
5. 构建完整的路由系统

通过本课程的学习,你应该能够熟练使用Remix的路由系统和Loader,构建复杂的Web应用!

