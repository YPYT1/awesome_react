# Server Components限制与注意事项

## 学习目标

通过本章学习，你将掌握：

- Server Components的技术限制
- 常见错误和解决方案
- 性能陷阱
- 安全注意事项
- 最佳实践
- 调试技巧
- 常见反模式
- 迁移注意事项

## 第一部分：技术限制

### 1.1 不能使用Hooks

```jsx
// ❌ 错误：Server Component不能使用Hooks
async function BadServerComponent() {
  // 所有Hooks都不能使用
  const [state, setState] = useState(0);        // 错误！
  const ref = useRef(null);                      // 错误！
  const context = useContext(MyContext);         // 错误！
  
  useEffect(() => {                              // 错误！
    console.log('effect');
  }, []);
  
  const memoized = useMemo(() => {}, []);        // 错误！
  const callback = useCallback(() => {}, []);    // 错误！
  
  return <div>{state}</div>;
}

// ✅ 正确：将需要Hooks的部分提取到Client Component
async function GoodServerComponent() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>Server Content</h1>
      <p>{data.content}</p>
      
      {/* 使用Client Component处理交互 */}
      <ClientInteractive data={data} />
    </div>
  );
}

'use client';

function ClientInteractive({ data }) {
  const [selected, setSelected] = useState(null);
  
  return (
    <div>
      {/* 这里可以使用Hooks */}
      <button onClick={() => setSelected(data.id)}>
        Select
      </button>
    </div>
  );
}
```

### 1.2 不能使用浏览器API

```jsx
// ❌ 错误：Server Component不能使用浏览器API
async function BadServerComponent() {
  // 浏览器API在服务器不存在
  const width = window.innerWidth;               // 错误！window未定义
  const stored = localStorage.getItem('key');   // 错误！localStorage未定义
  
  document.title = 'Title';                      // 错误！document未定义
  
  navigator.geolocation.getCurrentPosition();    // 错误！navigator未定义
  
  return <div>{width}</div>;
}

// ✅ 正确：在Client Component中使用
'use client';

function GoodClientComponent() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div>
      窗口大小: {dimensions.width} x {dimensions.height}
    </div>
  );
}
```

### 1.3 不能使用事件处理

```jsx
// ❌ 错误：Server Component不能有事件处理
async function BadServerComponent() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  return (
    <div>
      <button onClick={handleClick}>  {/* 错误！ */}
        Click Me
      </button>
      
      <input 
        onChange={(e) => console.log(e.target.value)}  {/* 错误！ */}
      />
    </div>
  );
}

// ✅ 正确：事件处理放在Client Component
async function GoodServerComponent() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <ClientButton />
    </div>
  );
}

'use client';

function ClientButton() {
  const handleClick = () => {
    console.log('clicked');
  };
  
  return (
    <button onClick={handleClick}>
      Click Me
    </button>
  );
}
```

### 1.4 Props必须可序列化

```jsx
// ❌ 错误：不能传递不可序列化的值
async function BadServerComponent() {
  // 函数
  const handleClick = () => console.log('click');
  
  // Class实例
  const instance = new MyClass();
  
  // Symbol
  const sym = Symbol('key');
  
  // Date（会被序列化为字符串）
  const date = new Date();
  
  return (
    <ClientComponent 
      onClick={handleClick}  // ❌ 函数不可序列化
      instance={instance}    // ❌ Class实例不可序列化
      symbol={sym}           // ❌ Symbol不可序列化
      date={date}            // ⚠️ 会变成字符串
    />
  );
}

// ✅ 正确：只传递可序列化的数据
async function GoodServerComponent() {
  const data = {
    id: 1,
    name: 'Test',
    items: [1, 2, 3],
    meta: {
      created: new Date().toISOString()  // 字符串
    }
  };
  
  return <ClientComponent data={data} />;
}

// 如果需要传递函数，使用Server Actions
import { handleAction } from './actions';

async function ServerComponent() {
  return (
    <ClientComponent 
      action={handleAction}  // ✅ Server Action可以传递
    />
  );
}
```

### 1.5 不能使用Context Provider

```jsx
// ❌ 错误：Server Component不能是Context Provider
async function BadServerComponent() {
  const value = await fetchData();
  
  return (
    <MyContext.Provider value={value}>  {/* 错误！ */}
      <ChildComponent />
    </MyContext.Provider>
  );
}

// ✅ 正确：在Client Component中提供Context
// layout.jsx (Server)
async function RootLayout({ children }) {
  const initialData = await fetchData();
  
  return (
    <ClientProvider initialData={initialData}>
      {children}
    </ClientProvider>
  );
}

// provider.jsx (Client)
'use client';

import { createContext, useState } from 'react';

const DataContext = createContext(null);

export function ClientProvider({ initialData, children }) {
  const [data, setData] = useState(initialData);
  
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
}
```

## 第二部分：常见错误

### 2.1 组件边界错误

```jsx
// ❌ 错误：Client Component不能直接导入Server Component
'use client';

import ServerComponent from './ServerComponent';  // 错误！

function BadClientComponent() {
  return (
    <div>
      <ServerComponent />  {/* 会变成Client Component！ */}
    </div>
  );
}

// ✅ 正确：通过props.children传递
// Parent.jsx (Server)
import ClientWrapper from './ClientWrapper';
import ServerContent from './ServerContent';

async function Parent() {
  return (
    <ClientWrapper>
      <ServerContent />  {/* 作为children传递 */}
    </ClientWrapper>
  );
}

// ClientWrapper.jsx (Client)
'use client';

function ClientWrapper({ children }) {
  const [visible, setVisible] = useState(true);
  
  return (
    <div>
      <button onClick={() => setVisible(!visible)}>
        Toggle
      </button>
      {visible && children}
    </div>
  );
}
```

### 2.2 忘记'use client'声明

```jsx
// ❌ 错误：使用了Client特性但没有声明'use client'
function BadComponent() {
  // 这看起来像Client Component但没有声明
  const [count, setCount] = useState(0);  // 错误！
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

// ✅ 正确：添加'use client'声明
'use client';

function GoodComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

### 2.3 async Client Component

```jsx
// ❌ 错误：Client Component函数不能是async
'use client';

async function BadClientComponent() {  // 错误！
  const data = await fetchData();
  
  return <div>{data}</div>;
}

// ✅ 正确：在useEffect中获取数据
'use client';

function GoodClientComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  if (!data) return <div>Loading...</div>;
  
  return <div>{data}</div>;
}

// ✅ 更好：让Server Component获取数据
async function ServerParent() {
  const data = await fetchData();
  
  return <ClientChild data={data} />;
}

'use client';

function ClientChild({ data }) {
  return <div>{data}</div>;
}
```

### 2.4 环境变量暴露

```jsx
// ❌ 危险：敏感环境变量可能暴露
'use client';

function BadComponent() {
  // 客户端代码会包含这个值！
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;  // 会暴露
  
  return <div>Key: {apiKey}</div>;
}

// ✅ 正确：敏感操作在Server Component或Server Actions
async function GoodServerComponent() {
  // 这个密钥只在服务器使用
  const secretKey = process.env.SECRET_API_KEY;  // 安全
  
  const data = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${secretKey}`
    }
  }).then(r => r.json());
  
  return <div>{data.content}</div>;
}
```

## 第三部分：性能陷阱

### 3.1 过度串行请求

```jsx
// ❌ 问题：串行请求导致瀑布流
async function SlowPage({ userId }) {
  // 请求1
  const user = await fetchUser(userId);
  
  // 等待user完成后才开始请求2
  const posts = await fetchPosts(user.id);
  
  // 等待posts完成后才开始请求3
  const comments = await fetchComments(posts[0].id);
  
  // 总时间 = 请求1 + 请求2 + 请求3
  return <div>...</div>;
}

// ✅ 解决：并行请求
async function FastPage({ userId }) {
  // 同时启动所有请求
  const [user, posts, comments] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),  // 如果不依赖user，直接用userId
    fetchComments(userId)
  ]);
  
  // 总时间 = max(请求1, 请求2, 请求3)
  return <div>...</div>;
}
```

### 3.2 过度查询数据库

```jsx
// ❌ 问题：N+1查询
async function PostsList() {
  const posts = await db.posts.findMany();
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Post post={post} />
        </li>
      ))}
    </ul>
  );
}

async function Post({ post }) {
  // 每个post都查询一次author！
  const author = await db.users.findUnique({
    where: { id: post.authorId }
  });
  
  return (
    <div>
      <h3>{post.title}</h3>
      <p>作者: {author.name}</p>
    </div>
  );
}

// ✅ 解决：预加载关联数据
async function PostsList() {
  const posts = await db.posts.findMany({
    include: {
      author: true  // 一次查询包含所有author
    }
  });
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <div>
            <h3>{post.title}</h3>
            <p>作者: {post.author.name}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

### 3.3 过度获取数据

```jsx
// ❌ 问题：获取不需要的数据
async function UserCard({ userId }) {
  // 获取了用户的所有字段，包括password等
  const user = await db.users.findUnique({
    where: { id: userId }
  });
  
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// ✅ 解决：只选择需要的字段
async function UserCard({ userId }) {
  const user = await db.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true
      // 不包含password等敏感字段
    }
  });
  
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3.4 不合理的缓存策略

```jsx
// ❌ 问题：动态数据使用了长期缓存
async function UserStats({ userId }) {
  // 用户统计是实时变化的，不应该缓存太久
  const stats = await fetch(`/api/stats/${userId}`, {
    next: { revalidate: 86400 }  // 缓存1天！
  });
  
  return <div>{stats.count}</div>;
}

// ✅ 解决：根据数据特性设置合适的缓存
async function UserStats({ userId }) {
  // 实时数据不缓存
  const liveStats = await fetch(`/api/stats/${userId}`, {
    cache: 'no-store'
  });
  
  // 或短期缓存
  const recentStats = await fetch(`/api/stats/${userId}`, {
    next: { revalidate: 60 }  // 1分钟
  });
  
  return <div>{liveStats.count}</div>;
}
```

## 第四部分：安全注意事项

### 4.1 始终验证权限

```jsx
// ❌ 危险：没有权限验证
'use server';

export async function deletePost(postId) {
  // 任何人都可以删除任何文章！
  await db.posts.delete({
    where: { id: postId }
  });
}

// ✅ 安全：验证权限
'use server';

export async function deletePost(postId) {
  // 获取当前用户
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  // 检查文章所有权
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (!post) {
    throw new Error('文章不存在');
  }
  
  if (post.authorId !== session.userId && !session.isAdmin) {
    throw new Error('无权限删除此文章');
  }
  
  // 验证通过，执行删除
  await db.posts.delete({
    where: { id: postId }
  });
}
```

### 4.2 验证和清理输入

```jsx
// ❌ 危险：直接使用用户输入
'use server';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // 没有验证就直接创建！
  await db.posts.create({
    data: { title, content }
  });
}

// ✅ 安全：验证和清理输入
'use server';

import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const postSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(10000)
});

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // 验证
  const result = postSchema.safeParse({ title, content });
  
  if (!result.success) {
    return {
      error: '输入不合法',
      details: result.error.issues
    };
  }
  
  // 清理HTML（防止XSS）
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: ['p', 'b', 'i', 'em', 'strong'],
    allowedAttributes: {}
  });
  
  await db.posts.create({
    data: {
      title: result.data.title,
      content: sanitizedContent
    }
  });
}
```

### 4.3 防止SQL注入

```jsx
// ❌ 危险：直接拼接SQL（如果使用原始查询）
'use server';

export async function searchUsers(query) {
  // 极其危险！可能导致SQL注入
  const sql = `SELECT * FROM users WHERE name LIKE '%${query}%'`;
  const users = await db.$queryRawUnsafe(sql);
  
  return users;
}

// ✅ 安全：使用参数化查询
'use server';

export async function searchUsers(query) {
  // 使用Prisma的安全API
  const users = await db.users.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    }
  });
  
  return users;
}

// 或使用参数化的原始查询
export async function searchUsersRaw(query) {
  const users = await db.$queryRaw`
    SELECT * FROM users 
    WHERE name LIKE ${`%${query}%`}
  `;
  
  return users;
}
```

### 4.4 速率限制

```jsx
// ✅ 实现速率限制
'use server';

import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1分钟
  uniqueTokenPerInterval: 500
});

export async function sendEmail(formData) {
  try {
    // 基于IP限制
    await limiter.check(10, 'SEND_EMAIL');  // 每分钟最多10次
    
    const email = formData.get('email');
    const message = formData.get('message');
    
    await sendEmailService(email, message);
    
    return { success: true };
  } catch (error) {
    if (error.message === 'Rate limit exceeded') {
      return {
        error: '操作过于频繁，请稍后再试'
      };
    }
    throw error;
  }
}
```

## 注意事项

### 1. 开发vs生产环境

```jsx
// 开发环境可能隐藏一些问题
// 生产环境要注意：

// ✅ 使用环境变量
const apiUrl = process.env.API_URL || 'http://localhost:3000';

// ✅ 错误处理要完善
try {
  const data = await fetchData();
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Debug:', error);
  }
  
  // 生产环境返回通用错误
  throw new Error('数据获取失败');
}

// ✅ 性能监控
if (process.env.NODE_ENV === 'production') {
  // 记录性能指标
}
```

### 2. 类型安全

```jsx
// ✅ 使用TypeScript确保类型安全
// actions.ts
'use server';

interface CreatePostInput {
  title: string;
  content: string;
}

interface CreatePostResult {
  success: boolean;
  post?: {
    id: string;
    title: string;
  };
  error?: string;
}

export async function createPost(
  formData: FormData
): Promise<CreatePostResult> {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  // TypeScript会检查类型
  const post = await db.posts.create({
    data: { title, content }
  });
  
  return {
    success: true,
    post: {
      id: post.id,
      title: post.title
    }
  };
}
```

### 3. 测试

```jsx
// ✅ 测试Server Components和Server Actions
// __tests__/actions.test.ts

import { createPost } from '@/app/actions';

describe('createPost', () => {
  it('should create a post', async () => {
    const formData = new FormData();
    formData.set('title', 'Test Post');
    formData.set('content', 'Test Content');
    
    const result = await createPost(formData);
    
    expect(result.success).toBe(true);
    expect(result.post).toBeDefined();
  });
  
  it('should validate input', async () => {
    const formData = new FormData();
    formData.set('title', 'Ab');  // 太短
    formData.set('content', 'Test');
    
    const result = await createPost(formData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## 常见问题

### Q1: 如何调试Server Components？

**A:** 使用console.log（只在服务器控制台显示）和React DevTools。

### Q2: Server Components会增加服务器负载吗？

**A:** 会，但可以通过缓存和优化减少。

### Q3: 如何处理大量并发请求？

**A:** 使用数据库连接池、缓存、CDN和负载均衡。

## 总结

### 核心限制

```
❌ 不能使用Hooks
❌ 不能使用浏览器API
❌ 不能有事件处理
❌ Props必须可序列化
❌ 不能是Context Provider
```

### 安全要点

```
✅ 总是验证权限
✅ 验证和清理输入
✅ 使用参数化查询
✅ 实现速率限制
✅ 保护敏感信息
```

### 性能要点

```
✅ 避免串行请求
✅ 预加载关联数据
✅ 只查询需要的字段
✅ 合理设置缓存
✅ 使用流式渲染
```

理解并遵守这些限制和注意事项，才能安全高效地使用Server Components！
