# Server vs Client Components对比

## 学习目标

通过本章学习，你将掌握：

- Server和Client Components的详细对比
- 各自的能力和限制
- 如何选择组件类型
- 组件之间的交互规则
- 性能影响分析
- 最佳实践模式
- 常见问题和解决方案
- 迁移策略

## 第一部分：基础对比

### 1.1 核心差异

```jsx
// ========== Server Component ==========
// 默认就是Server Component
async function ServerComponent({ userId }) {
  // ✅ 可以async/await
  const user = await fetchUser(userId);
  
  // ✅ 可以直接访问数据库
  const posts = await db.posts.findMany({
    where: { authorId: userId }
  });
  
  // ✅ 可以使用Node.js API
  const fs = require('fs');
  const config = fs.readFileSync('./config.json');
  
  return (
    <div>
      <h1>{user.name}</h1>
      <PostsList posts={posts} />
    </div>
  );
}


// ========== Client Component ==========
'use client';  // ← 必须声明

function ClientComponent({ userId }) {
  // ✅ 可以使用Hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ 可以使用useEffect
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);
  
  // ✅ 可以添加事件处理
  const handleClick = () => {
    console.log('Clicked!');
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div onClick={handleClick}>
      <h1>{user.name}</h1>
    </div>
  );
}
```

### 1.2 特性对比表

| 特性 | Server Component | Client Component |
|------|------------------|------------------|
| **声明方式** | 默认 | 需要'use client' |
| **执行环境** | 服务器 | 客户端（浏览器） |
| **async/await** | ✅ 支持 | ❌ 不支持（组件函数） |
| **Hooks** | ❌ 不支持 | ✅ 支持 |
| **事件处理** | ❌ 不支持 | ✅ 支持 |
| **浏览器API** | ❌ 不支持 | ✅ 支持 |
| **Node.js API** | ✅ 支持 | ❌ 不支持 |
| **数据库访问** | ✅ 支持 | ❌ 不支持 |
| **客户端bundle** | ❌ 不包含 | ✅ 包含 |
| **状态管理** | ❌ 无状态 | ✅ 有状态 |
| **SEO** | ✅ 完美 | ⚠️ 需要SSR |
| **首次渲染** | 服务器 | 客户端hydration |

### 1.3 代码示例对比

```jsx
// ========== 数据获取对比 ==========

// Server Component：直接async/await
async function ServerBlogPost({ id }) {
  const post = await db.posts.findById(id);
  const comments = await db.comments.findByPostId(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <CommentsList comments={comments} />
    </article>
  );
}

// Client Component：useEffect + useState
'use client';

function ClientBlogPost({ id }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then(r => r.json()),
      fetch(`/api/posts/${id}/comments`).then(r => r.json())
    ]).then(([postData, commentsData]) => {
      setPost(postData);
      setComments(commentsData);
      setLoading(false);
    });
  }, [id]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <CommentsList comments={comments} />
    </article>
  );
}
```

## 第二部分：能力分析

### 2.1 Server Component能做什么

**1. 直接数据库访问**

```jsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function Users() {
  // 直接查询数据库
  const users = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.posts.length} posts
        </li>
      ))}
    </ul>
  );
}

// prisma客户端代码不会发送到浏览器！
```

**2. 文件系统操作**

```jsx
import { readFile } from 'fs/promises';
import path from 'path';

async function ConfigDisplay() {
  // 直接读取服务器文件
  const configPath = path.join(process.cwd(), 'config.json');
  const config = JSON.parse(await readFile(configPath, 'utf-8'));
  
  return (
    <div>
      <h2>Configuration</h2>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}
```

**3. 环境变量和密钥**

```jsx
async function APIStatus() {
  // 直接使用服务器环境变量
  const apiKey = process.env.SECRET_API_KEY;
  const dbUrl = process.env.DATABASE_URL;
  
  // 调用第三方API（使用密钥）
  const status = await fetch('https://api.service.com/status', {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  }).then(r => r.json());
  
  return (
    <div>
      <h3>API Status: {status.health}</h3>
      {/* apiKey永远不会暴露到客户端 */}
    </div>
  );
}
```

**4. 大型库的使用**

```jsx
import { marked } from 'marked';  // Markdown解析器
import hljs from 'highlight.js';  // 代码高亮
import { generatePDF } from 'huge-pdf-lib';  // 大型PDF库

async function DocumentRenderer({ docId }) {
  const doc = await fetchDocument(docId);
  
  // 使用大型库处理数据
  const html = marked(doc.markdown);
  const highlighted = hljs.highlightAuto(html);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: highlighted }} />
  );
}

// 这些库不会包含在客户端bundle中！
```

**5. 复杂计算**

```jsx
import { performHeavyComputation } from './compute';

async function DataAnalysis({ dataset }) {
  // 在服务器执行耗时计算
  const data = await fetchDataset(dataset);
  const analysis = performHeavyComputation(data);  // 可能需要几秒
  const insights = generateInsights(analysis);
  
  return (
    <div>
      <h2>Analysis Results</h2>
      <AnalysisChart data={analysis} />
      <InsightsList insights={insights} />
    </div>
  );
}

// 客户端只接收计算结果，不需要执行计算
```

### 2.2 Client Component能做什么

**1. 交互式UI**

```jsx
'use client';

function InteractiveForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 实时验证
    validateField(name, value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 提交表单
    submitForm(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      {errors.name && <span>{errors.name}</span>}
      
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      {errors.email && <span>{errors.email}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

**2. 浏览器API**

```jsx
'use client';

function GeolocationComponent() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError(err.message);
        }
      );
    }
  }, []);
  
  if (error) return <div>Error: {error}</div>;
  if (!location) return <div>Getting location...</div>;
  
  return (
    <div>
      Latitude: {location.lat}, Longitude: {location.lng}
    </div>
  );
}
```

**3. 动态动画**

```jsx
'use client';

import { motion } from 'framer-motion';

function AnimatedCard({ children }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)'
      }}
    >
      {children}
    </motion.div>
  );
}
```

**4. 本地存储**

```jsx
'use client';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取主题
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <button onClick={toggleTheme}>
      当前主题: {theme}
    </button>
  );
}
```

**5. 实时更新**

```jsx
'use client';

function LiveChat({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // WebSocket连接
    const ws = new WebSocket(`ws://api.example.com/chat/${roomId}`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    return () => {
      ws.close();
    };
  }, [roomId]);
  
  const sendMessage = (text) => {
    ws.send(JSON.stringify({ text }));
  };
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

## 第三部分：组件组合规则

### 3.1 Server Component可以导入Client Component

```jsx
// ✅ 正确：Server Component导入Client Component
// server-component.jsx
import ClientButton from './client-button';

async function ServerComponent() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>Server Content</h1>
      <p>{data.content}</p>
      
      {/* Server Component可以渲染Client Component */}
      <ClientButton onClick={() => console.log('click')} />
    </div>
  );
}

// client-button.jsx
'use client';

export default function ClientButton({ onClick }) {
  return <button onClick={onClick}>Click Me</button>;
}
```

### 3.2 Client Component不能导入Server Component

```jsx
// ❌ 错误：Client Component不能直接导入Server Component
'use client';

import ServerComponent from './server-component';  // 错误！

function ClientComponent() {
  return (
    <div>
      <ServerComponent />  {/* 这会失败 */}
    </div>
  );
}

// ✅ 正确：通过props.children传递
// parent-server.jsx
import ClientWrapper from './client-wrapper';
import ServerContent from './server-content';

async function ParentServer() {
  return (
    <ClientWrapper>
      {/* 作为children传递 */}
      <ServerContent />
    </ClientWrapper>
  );
}

// client-wrapper.jsx
'use client';

function ClientWrapper({ children }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>
        Toggle
      </button>
      {expanded && children}
    </div>
  );
}
```

### 3.3 组件边界

```jsx
// 组件树结构
<ServerRoot>                    {/* Server */}
  <ServerNav />                 {/* Server */}
  <ClientSidebar>               {/* Client - 边界 */}
    <ServerMenu />              {/* ❌ 不能直接嵌套 */}
  </ClientSidebar>
  <ServerContent>               {/* Server */}
    <ClientInteractive />       {/* Client - 可以 */}
  </ServerContent>
</ServerRoot>

// ✅ 正确的结构
<ServerRoot>
  <ServerNav />
  <ClientSidebar>
    {/* 通过props传递Server Component */}
  </ClientSidebar>
  <ServerContent>
    <ClientInteractive />
  </ServerContent>
</ServerRoot>
```

## 第四部分：性能影响

### 4.1 Bundle大小对比

```jsx
// 场景：显示格式化的日期列表

// ========== 纯Client Component ==========
'use client';

import { format } from 'date-fns';  // 67 KB
import { zhCN } from 'date-fns/locale';  // 15 KB

function DateList({ dates }) {
  return (
    <ul>
      {dates.map(date => (
        <li key={date}>
          {format(new Date(date), 'PPP', { locale: zhCN })}
        </li>
      ))}
    </ul>
  );
}

// 客户端bundle: +82 KB


// ========== Server Component ==========
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

async function DateList() {
  const dates = await fetchDates();
  
  return (
    <ul>
      {dates.map(date => (
        <li key={date}>
          {format(new Date(date), 'PPP', { locale: zhCN })}
        </li>
      ))}
    </ul>
  );
}

// 客户端bundle: +0 KB
// date-fns只在服务器运行！
```

### 4.2 首屏时间对比

```jsx
// ========== Client Component ==========
'use client';

function ProductPage({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);
  
  if (loading) return <Skeleton />;
  
  return <ProductDetail product={product} />;
}

// 时间线：
// 1. 下载HTML (100ms)
// 2. 下载JS (500ms)
// 3. React hydration (200ms)
// 4. 发起API请求 (50ms)
// 5. API响应 (300ms)
// 6. 显示内容
// 总计: ~1150ms


// ========== Server Component ==========
async function ProductPage({ id }) {
  const product = await fetchProduct(id);
  return <ProductDetail product={product} />;
}

// 时间线：
// 1. 服务器获取数据 (300ms)
// 2. 服务器渲染 (50ms)
// 3. 发送HTML (100ms)
// 4. 显示内容
// 总计: ~450ms（快2.5倍！）
```

### 4.3 水合（Hydration）开销

```jsx
// Client Component页面
'use client';

function LargePage() {
  return (
    <div>
      <Header />          {/* 需要hydrate */}
      <Sidebar />         {/* 需要hydrate */}
      <MainContent />     {/* 需要hydrate */}
      <Footer />          {/* 需要hydrate */}
    </div>
  );
}

// Hydration时间: ~500ms（整个页面）


// Server + Client混合页面
async function HybridPage() {
  return (
    <div>
      <Header />          {/* Server - 无需hydrate */}
      <ServerSidebar />   {/* Server - 无需hydrate */}
      <MainContent>       {/* Server - 无需hydrate */}
        <InteractiveWidget />  {/* Client - 需要hydrate */}
      </MainContent>
      <Footer />          {/* Server - 无需hydrate */}
    </div>
  );
}

// Hydration时间: ~50ms（只有InteractiveWidget）
// 快10倍！
```

## 第五部分：选择指南

### 5.1 何时使用Server Component

```jsx
// ✅ 数据获取和展示
async function BlogPosts() {
  const posts = await db.posts.findMany();
  return <PostsList posts={posts} />;
}

// ✅ SEO关键内容
async function ProductPage({ id }) {
  const product = await getProduct(id);
  return (
    <>
      <title>{product.name}</title>
      <meta name="description" content={product.description} />
      <ProductInfo product={product} />
    </>
  );
}

// ✅ 静态内容
async function AboutPage() {
  const content = await getPageContent('about');
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

// ✅ 复杂数据处理
async function Analytics() {
  const rawData = await fetchAnalyticsData();
  const processed = processData(rawData);  // 耗时操作
  const insights = generateInsights(processed);
  
  return <Dashboard data={insights} />;
}
```

### 5.2 何时使用Client Component

```jsx
// ✅ 交互式表单
'use client';

function ContactForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 处理提交
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ 实时更新
'use client';

function LiveNotifications() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket('/ws/notifications');
    ws.onmessage = (e) => {
      setNotifications(prev => [...prev, JSON.parse(e.data)]);
    };
    return () => ws.close();
  }, []);
  
  return <NotificationList items={notifications} />;
}

// ✅ 浏览器特性
'use client';

function CameraCapture() {
  const handleCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // 使用相机
  };
  
  return <button onClick={handleCapture}>拍照</button>;
}

// ✅ 动画和过渡
'use client';

import { motion } from 'framer-motion';

function AnimatedList({ items }) {
  return (
    <motion.ul>
      {items.map(item => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### 5.3 决策树

```
是否需要交互？
├─ 是 → Client Component
│   ├─ 需要useState/useEffect？ → Client
│   ├─ 需要事件处理？ → Client
│   └─ 需要浏览器API？ → Client
│
└─ 否 → 是否需要服务器资源？
    ├─ 是 → Server Component
    │   ├─ 数据库查询？ → Server
    │   ├─ 文件系统？ → Server
    │   ├─ 环境变量/密钥？ → Server
    │   └─ 大型库？ → Server
    │
    └─ 否 → Server Component（默认）
```

## 注意事项

### 1. 避免不必要的Client Component

```jsx
// ❌ 不好：整个页面都是Client Component
'use client';

function Page() {
  return (
    <div>
      <Header />        {/* 静态内容 */}
      <Content />       {/* 静态内容 */}
      <InteractiveWidget />  {/* 需要交互 */}
      <Footer />        {/* 静态内容 */}
    </div>
  );
}

// ✅ 更好：只有需要的部分是Client Component
function Page() {
  return (
    <div>
      <Header />        {/* Server */}
      <Content />       {/* Server */}
      <InteractiveWidget />  {/* Client */}
      <Footer />        {/* Server */}
    </div>
  );
}
```

### 2. Props必须可序列化

```jsx
// ❌ 不能传递函数
async function ServerComponent() {
  const handleClick = () => console.log('click');
  
  return <ClientComponent onClick={handleClick} />;  // 错误！
}

// ✅ 使用Server Actions
import { performAction } from './actions';

async function ServerComponent() {
  return <ClientComponent action={performAction} />;  // 正确
}
```

### 3. 注意组件边界

```jsx
// ✅ 清晰的组件边界
// layout.jsx (Server)
export default function Layout({ children }) {
  return (
    <html>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// page.jsx (Server)
export default function Page() {
  return (
    <div>
      <ServerContent />
      <ClientInteractive />
    </div>
  );
}
```

## 常见问题

### Q1: 如何在Client Component中使用Server数据？

**A:** 通过props从Server Component传递：

```jsx
async function ServerParent() {
  const data = await fetchData();
  return <ClientChild data={data} />;
}

'use client';
function ClientChild({ data }) {
  // 使用data
}
```

### Q2: 所有页面都应该用Server Components吗？

**A:** 不一定。仪表板、管理面板等高交互页面可能更适合Client Components。

### Q3: 性能提升有多大？

**A:** 根据应用类型，bundle大小可减少30-80%，首屏时间可减少40-60%。

## 总结

### 选择要点

```
Server Components:
✅ 数据获取
✅ SEO内容
✅ 静态展示
✅ 服务器资源
✅ 减小bundle

Client Components:
✅ 交互式UI
✅ 浏览器API
✅ 实时更新
✅ 动画效果
✅ 表单处理
```

### 最佳实践

```
1. 默认使用Server Components
2. 按需添加Client Components
3. 保持组件边界清晰
4. Props必须可序列化
5. 合理组织组件树
6. 性能优先考虑
```

理解Server和Client Components的差异是React 19开发的基础！
