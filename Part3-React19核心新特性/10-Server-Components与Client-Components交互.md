# Server Components与Client Components交互

## 学习目标

通过本章学习，你将掌握：

- Server和Client Components的交互规则
- 数据传递模式
- 组件组合策略
- 事件处理方法
- Server Actions的使用
- 性能优化技巧
- 常见问题解决
- 实战交互模式

## 第一部分：组合规则

### 1.1 Server导入Client（✅ 允许）

```jsx
// ========== Server Component ==========
// app/page.jsx
import ClientButton from './ClientButton';

async function ServerPage() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>Server Content</h1>
      <p>{data.content}</p>
      
      {/* ✅ Server Component可以渲染Client Component */}
      <ClientButton label="Click Me" />
    </div>
  );
}


// ========== Client Component ==========
// app/ClientButton.jsx
'use client';

export default function ClientButton({ label }) {
  const [clicked, setClicked] = useState(false);
  
  return (
    <button onClick={() => setClicked(true)}>
      {label} {clicked && '✓'}
    </button>
  );
}
```

### 1.2 Client不能直接导入Server（❌ 禁止）

```jsx
// ❌ 错误的做法
'use client';

import ServerComponent from './ServerComponent';  // 错误！

function ClientComponent() {
  return (
    <div>
      <ServerComponent />  {/* 这会失败 */}
    </div>
  );
}


// ✅ 正确的做法：通过props.children
// Parent.jsx (Server)
import ClientWrapper from './ClientWrapper';
import ServerContent from './ServerContent';

async function Parent() {
  return (
    <ClientWrapper>
      {/* Server Component作为children传递 */}
      <ServerContent />
    </ClientWrapper>
  );
}

// ClientWrapper.jsx (Client)
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

### 1.3 组件边界

```jsx
// 组件树结构及边界

<ServerRoot>                {/* Server */}
  <ServerHeader />          {/* Server */}
  
  <ClientSidebar>           {/* Client - 边界 */}
    <ServerMenu />          {/* ❌ 不能嵌套 */}
  </ClientSidebar>
  
  <ServerMain>              {/* Server */}
    <ClientInteractive />   {/* ✅ 可以嵌套 */}
    <ServerContent>         {/* ✅ Client内的Server通过props */}
      <ClientButton />      {/* ✅ Server可以嵌套Client */}
    </ServerContent>
  </ServerMain>
</ServerRoot>
```

## 第二部分：数据传递

### 2.1 Server向Client传递数据

```jsx
// ========== Server Component ==========
async function BlogPost({ id }) {
  // 在服务器获取数据
  const post = await fetchPost(id);
  const comments = await fetchComments(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      
      {/* 通过props传递数据给Client Component */}
      <LikeButton 
        postId={post.id}
        initialLikes={post.likes}
      />
      
      <CommentForm postId={post.id} />
      
      <CommentsList 
        comments={comments}
        canModerate={post.author.isCurrentUser}
      />
    </article>
  );
}


// ========== Client Components ==========
'use client';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  
  const handleLike = async () => {
    setLiked(true);
    setLikes(prev => prev + 1);
    
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST'
    });
  };
  
  return (
    <button onClick={handleLike} disabled={liked}>
      ❤️ {likes}
    </button>
  );
}
```

### 2.2 可序列化的Props

```jsx
// ✅ 可以传递的数据类型
async function ServerComponent() {
  const data = {
    // ✅ 基本类型
    string: 'hello',
    number: 42,
    boolean: true,
    null: null,
    
    // ✅ 数组
    array: [1, 2, 3],
    
    // ✅ 对象
    object: { key: 'value' },
    
    // ✅ 日期（会被序列化为字符串）
    date: new Date(),
    
    // ✅ 嵌套结构
    nested: {
      deep: {
        value: 'data'
      }
    }
  };
  
  return <ClientComponent data={data} />;
}


// ❌ 不能传递的数据类型
async function BadServerComponent() {
  // ❌ 函数
  const handleClick = () => console.log('click');
  
  // ❌ Class实例
  const instance = new MyClass();
  
  // ❌ Symbol
  const sym = Symbol('key');
  
  // ❌ undefined（会被忽略）
  const undef = undefined;
  
  return (
    <ClientComponent
      onClick={handleClick}  // ❌ 错误！
      instance={instance}    // ❌ 错误！
      symbol={sym}           // ❌ 错误！
    />
  );
}
```

### 2.3 通过children传递

```jsx
// Server Component
async function DataProvider({ userId }) {
  const user = await fetchUser(userId);
  const permissions = await fetchPermissions(userId);
  
  return (
    <ClientLayout>
      {/* 将Server Component作为children传递 */}
      <ServerSidebar user={user} />
      
      <ServerContent 
        user={user}
        permissions={permissions}
      />
    </ClientLayout>
  );
}

// Client Component
'use client';

function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="layout">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        Toggle Sidebar
      </button>
      
      <div className={`content ${sidebarOpen ? 'with-sidebar' : ''}`}>
        {children}  {/* 渲染Server Components */}
      </div>
    </div>
  );
}
```

## 第三部分：事件处理

### 3.1 Client Component处理事件

```jsx
// Server Component
async function ProductPage({ productId }) {
  const product = await fetchProduct(productId);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>价格: ¥{product.price}</p>
      
      {/* Client Component处理交互 */}
      <AddToCartButton 
        productId={product.id}
        productName={product.name}
        price={product.price}
      />
    </div>
  );
}

// Client Component
'use client';

function AddToCartButton({ productId, productName, price }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  
  const handleAdd = async () => {
    setAdding(true);
    
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      alert('添加失败');
    } finally {
      setAdding(false);
    }
  };
  
  return (
    <button 
      onClick={handleAdd}
      disabled={adding}
    >
      {adding ? '添加中...' : added ? '已添加 ✓' : '加入购物车'}
    </button>
  );
}
```

### 3.2 使用Server Actions

```jsx
// ========== Server Actions ==========
// app/actions.js
'use server';

export async function addToCart(productId, quantity) {
  const session = await getSession();
  
  await db.cart.create({
    data: {
      userId: session.userId,
      productId,
      quantity
    }
  });
  
  revalidatePath('/cart');
  
  return { success: true };
}


// ========== Server Component ==========
import { addToCart } from './actions';

async function ProductPage({ productId }) {
  const product = await fetchProduct(productId);
  
  return (
    <div>
      <h1>{product.name}</h1>
      
      {/* 传递Server Action给Client Component */}
      <AddToCartForm 
        productId={product.id}
        addToCartAction={addToCart}
      />
    </div>
  );
}


// ========== Client Component ==========
'use client';

function AddToCartForm({ productId, addToCartAction }) {
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    
    try {
      // 调用Server Action
      const result = await addToCartAction(productId, quantity);
      
      if (result.success) {
        alert('已添加到购物车');
      }
    } catch (error) {
      alert('添加失败');
    } finally {
      setPending(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min="1"
      />
      <button type="submit" disabled={pending}>
        {pending ? '添加中...' : '加入购物车'}
      </button>
    </form>
  );
}
```

### 3.3 使用useFormStatus

```jsx
// Server Action
'use server';

export async function submitContact(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  await db.contact.create({
    data: { name, email, message }
  });
  
  return { success: true };
}

// Server Component
import { submitContact } from './actions';

async function ContactPage() {
  return (
    <div>
      <h1>联系我们</h1>
      <ContactForm action={submitContact} />
    </div>
  );
}

// Client Component
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '发送中...' : '发送'}
    </button>
  );
}

function ContactForm({ action }) {
  return (
    <form action={action}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      
      <SubmitButton />
    </form>
  );
}
```

## 第四部分：Context共享

### 4.1 Client Context Provider

```jsx
// ========== Context Provider (Client) ==========
// app/providers.jsx
'use client';

import { createContext, useState, useContext } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}


// ========== Root Layout (Server) ==========
// app/layout.jsx
import { ThemeProvider } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Server Component包裹Client Provider */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


// ========== Client Component使用Context ==========
// app/ThemeToggle.jsx
'use client';

import { useTheme } from './providers';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换到{theme === 'light' ? '深色' : '浅色'}模式
    </button>
  );
}
```

### 4.2 混合使用Context

```jsx
// Context Provider
'use client';

const UserContext = createContext(null);

export function UserProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Root Layout (Server)
async function RootLayout({ children }) {
  // 在服务器获取初始用户数据
  const user = await getCurrentUser();
  
  return (
    <html>
      <body>
        {/* 传递初始数据给Provider */}
        <UserProvider initialUser={user}>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}

// Client Component使用
'use client';

function UserProfile() {
  const { user, setUser } = useContext(UserContext);
  
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };
  
  return (
    <div>
      <p>欢迎, {user.name}</p>
      <button onClick={handleLogout}>退出</button>
    </div>
  );
}
```

## 第五部分：实战模式

### 5.1 数据展示 + 交互模式

```jsx
// Server Component负责数据，Client Component负责交互
async function TodoList({ userId }) {
  const todos = await fetchTodos(userId);
  
  return (
    <div>
      <h2>待办事项</h2>
      
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}  // Server Action
          onDelete={deleteTodo}  // Server Action
        />
      ))}
      
      <AddTodoForm addAction={addTodo} />
    </div>
  );
}

// Client Component
'use client';

function TodoItem({ todo, onToggle, onDelete }) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(todo.completed);
  
  const handleToggle = async () => {
    // 乐观更新
    setOptimisticCompleted(!optimisticCompleted);
    
    try {
      await onToggle(todo.id);
    } catch (error) {
      // 回滚
      setOptimisticCompleted(optimisticCompleted);
    }
  };
  
  return (
    <div className={optimisticCompleted ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={optimisticCompleted}
        onChange={handleToggle}
      />
      <span>{todo.title}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </div>
  );
}
```

### 5.2 表单提交模式

```jsx
// Server Actions
'use server';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  const post = await db.post.create({
    data: { title, content }
  });
  
  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}

// Server Component
import { createPost } from './actions';

async function NewPostPage() {
  return (
    <div>
      <h1>新建文章</h1>
      <PostForm action={createPost} />
    </div>
  );
}

// Client Component
'use client';

function PostForm({ action }) {
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // 客户端验证
    const title = formData.get('title');
    if (!title || title.length < 3) {
      setErrors({ title: '标题至少3个字符' });
      return;
    }
    
    // 调用Server Action
    try {
      await action(formData);
    } catch (error) {
      setErrors({ submit: '提交失败，请重试' });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>标题</label>
        <input name="title" required />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      
      <div>
        <label>内容</label>
        <textarea name="content" required />
      </div>
      
      {errors.submit && (
        <div className="error">{errors.submit}</div>
      )}
      
      <button type="submit">发布</button>
    </form>
  );
}
```

### 5.3 实时更新模式

```jsx
// Server Component
async function ChatRoom({ roomId }) {
  const initialMessages = await fetchMessages(roomId);
  
  return (
    <div>
      <h2>聊天室</h2>
      
      {/* Client Component处理实时更新 */}
      <ChatMessages 
        roomId={roomId}
        initialMessages={initialMessages}
        sendAction={sendMessage}
      />
    </div>
  );
}

// Client Component
'use client';

function ChatMessages({ roomId, initialMessages, sendAction }) {
  const [messages, setMessages] = useState(initialMessages);
  
  useEffect(() => {
    // WebSocket连接
    const ws = new WebSocket(`/ws/chat/${roomId}`);
    
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, newMessage]);
    };
    
    return () => ws.close();
  }, [roomId]);
  
  const handleSend = async (text) => {
    // 乐观更新
    const tempMessage = {
      id: Date.now(),
      text,
      pending: true
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      await sendAction(roomId, text);
    } catch (error) {
      // 移除失败的消息
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
```

## 注意事项

### 1. Props必须可序列化

```jsx
// ❌ 错误
async function Bad() {
  const handleClick = () => console.log('click');
  return <ClientComponent onClick={handleClick} />;
}

// ✅ 正确：使用Server Actions
import { handleAction } from './actions';

async function Good() {
  return <ClientComponent action={handleAction} />;
}
```

### 2. 避免过度Client化

```jsx
// ❌ 不好：整个组件都是Client
'use client';

function ProductPage({ product }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <div>
      {/* 大部分是静态内容 */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>¥{product.price}</p>
      
      {/* 只有这个按钮需要交互 */}
      <button onClick={() => setLiked(!liked)}>
        {liked ? '❤️' : '🤍'}
      </button>
    </div>
  );
}

// ✅ 更好：分离静态和动态部分
async function ProductPage({ id }) {
  const product = await fetchProduct(id);
  
  return (
    <div>
      {/* Server Component渲染静态内容 */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>¥{product.price}</p>
      
      {/* Client Component处理交互 */}
      <LikeButton productId={product.id} />
    </div>
  );
}
```

### 3. 合理使用Server Actions

```jsx
// ✅ Server Actions适合
- 表单提交
- 数据变更
- 需要服务器验证的操作

// ❌ 不适合Server Actions
- 频繁的UI状态更新
- 纯客户端交互
- 不需要服务器的操作
```

## 常见问题

### Q1: 如何在Client Component中获取新数据？

**A:** 使用Server Actions + revalidate，或者使用API路由。

### Q2: 能在Client Component中导入Server Component吗？

**A:** 不能直接导入，但可以通过props（如children）传递。

### Q3: Server Actions和API路由有什么区别？

**A:** Server Actions更简洁，自动处理序列化，但API路由更灵活，可以被非React客户端调用。

## 总结

### 交互规则

```
✅ Server → Client: 直接导入
❌ Client → Server: 不能直接导入
✅ 通过children传递: 可以
✅ 通过props传递: 数据必须可序列化
✅ 使用Server Actions: 推荐
```

### 最佳实践

```
1. 默认使用Server Components
2. 只在需要时使用Client Components
3. 使用Server Actions处理服务器操作
4. 保持组件边界清晰
5. 合理使用Context
6. 优化数据传递
7. 避免不必要的客户端代码
```

掌握Server和Client Components的交互是构建现代React应用的关键！
