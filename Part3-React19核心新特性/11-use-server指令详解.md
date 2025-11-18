# use server指令详解

## 学习目标

通过本章学习，你将掌握：

- 'use server'指令的作用
- Server Actions的创建和使用
- 函数级和文件级声明
- Server Actions的执行机制
- 表单集成
- 错误处理
- 性能优化
- 实战应用模式

## 第一部分：'use server'基础

### 1.1 什么是'use server'

'use server'是React 19引入的指令，用于标记**Server Actions**——只在服务器端执行的异步函数。

```jsx
// ========== Server Action ==========
'use server';

// 这个函数只在服务器执行
export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // 直接访问数据库
  const post = await db.posts.create({
    data: { title, content }
  });
  
  return { id: post.id };
}

// ========== Client Component使用 ==========
'use client';

function PostForm() {
  const handleSubmit = async (formData) => {
    // 调用Server Action
    const result = await createPost(formData);
    console.log('Created post:', result.id);
  };
  
  return (
    <form action={handleSubmit}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">发布</button>
    </form>
  );
}
```

### 1.2 为什么需要Server Actions

**对比传统API路由：**

```jsx
// ========== 传统方式：API路由 ==========
// /app/api/posts/route.js
export async function POST(request) {
  const body = await request.json();
  
  const post = await db.posts.create({
    data: body
  });
  
  return Response.json({ id: post.id });
}

// 客户端调用
'use client';

function PostForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}


// ========== Server Actions方式 ==========
// actions.js
'use server';

export async function createPost(formData) {
  const post = await db.posts.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
  
  return { id: post.id };
}

// 客户端调用
'use client';

import { createPost } from './actions';

function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">发布</button>
    </form>
  );
}

// 优势：
// ✅ 更简洁的代码
// ✅ 类型安全
// ✅ 自动序列化
// ✅ 表单原生集成
// ✅ 无需手动创建API端点
```

### 1.3 'use server'的两种用法

**1. 文件级别**

```jsx
// actions.js
'use server';  // ← 整个文件的所有导出函数都是Server Actions

export async function createUser(data) {
  return await db.users.create({ data });
}

export async function updateUser(id, data) {
  return await db.users.update({ where: { id }, data });
}

export async function deleteUser(id) {
  return await db.users.delete({ where: { id } });
}

// 所有这些函数都是Server Actions
```

**2. 函数级别**

```jsx
// component.jsx
async function ServerComponent() {
  // 内联Server Action
  async function handleAction(formData) {
    'use server';  // ← 标记这个函数为Server Action
    
    const data = await processData(formData);
    return data;
  }
  
  return (
    <form action={handleAction}>
      <input name="field" />
      <button type="submit">提交</button>
    </form>
  );
}
```

## 第二部分：创建Server Actions

### 2.1 独立文件定义

```jsx
// app/actions/posts.js
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/database';

// 创建文章
export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // 验证
  if (!title || title.length < 3) {
    return { error: '标题至少3个字符' };
  }
  
  // 创建
  const post = await db.posts.create({
    data: { title, content }
  });
  
  // 重新验证缓存
  revalidatePath('/posts');
  
  // 重定向
  redirect(`/posts/${post.id}`);
}

// 更新文章
export async function updatePost(id, formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  const post = await db.posts.update({
    where: { id },
    data: { title, content }
  });
  
  revalidatePath(`/posts/${id}`);
  
  return { success: true, post };
}

// 删除文章
export async function deletePost(id) {
  await db.posts.delete({
    where: { id }
  });
  
  revalidatePath('/posts');
  
  return { success: true };
}
```

### 2.2 内联定义

```jsx
// Server Component中内联定义
async function TodoList({ userId }) {
  const todos = await fetchTodos(userId);
  
  // 内联Server Action
  async function toggleTodo(formData) {
    'use server';
    
    const id = formData.get('id');
    const completed = formData.get('completed') === 'true';
    
    await db.todos.update({
      where: { id },
      data: { completed: !completed }
    });
    
    revalidatePath('/todos');
  }
  
  async function deleteTodo(formData) {
    'use server';
    
    const id = formData.get('id');
    
    await db.todos.delete({
      where: { id }
    });
    
    revalidatePath('/todos');
  }
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          <form action={toggleTodo}>
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="completed" value={todo.completed} />
            <button type="submit">
              {todo.completed ? '✓' : '○'}
            </button>
          </form>
          
          <span>{todo.title}</span>
          
          <form action={deleteTodo}>
            <input type="hidden" name="id" value={todo.id} />
            <button type="submit">删除</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
```

### 2.3 带参数的Server Actions

```jsx
// actions.js
'use server';

// 方式1：使用.bind()
export async function updateUser(userId, formData) {
  const name = formData.get('name');
  
  await db.users.update({
    where: { id: userId },
    data: { name }
  });
  
  revalidatePath('/profile');
}

// 使用
'use client';

function UserForm({ userId }) {
  // 绑定userId参数
  const updateUserWithId = updateUser.bind(null, userId);
  
  return (
    <form action={updateUserWithId}>
      <input name="name" />
      <button type="submit">更新</button>
    </form>
  );
}


// 方式2：hidden input
export async function updateUserFromHidden(formData) {
  const userId = formData.get('userId');
  const name = formData.get('name');
  
  await db.users.update({
    where: { id: userId },
    data: { name }
  });
}

// 使用
'use client';

function UserForm({ userId }) {
  return (
    <form action={updateUserFromHidden}>
      <input type="hidden" name="userId" value={userId} />
      <input name="name" />
      <button type="submit">更新</button>
    </form>
  );
}
```

## 第三部分：使用Server Actions

### 3.1 表单action

```jsx
// Server Action
'use server';

export async function submitContact(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  await db.contacts.create({
    data: { name, email, message }
  });
  
  return { success: true };
}

// Client Component
'use client';

import { submitContact } from './actions';

function ContactForm() {
  return (
    <form action={submitContact}>
      <div>
        <label>姓名</label>
        <input name="name" required />
      </div>
      
      <div>
        <label>邮箱</label>
        <input name="email" type="email" required />
      </div>
      
      <div>
        <label>留言</label>
        <textarea name="message" required />
      </div>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 3.2 按钮调用

```jsx
// Server Action
'use server';

export async function likePost(postId) {
  await db.posts.update({
    where: { id: postId },
    data: {
      likes: { increment: 1 }
    }
  });
  
  revalidatePath('/posts');
}

// Client Component
'use client';

import { likePost } from './actions';

function LikeButton({ postId }) {
  const [pending, setPending] = useState(false);
  
  const handleLike = async () => {
    setPending(true);
    
    try {
      await likePost(postId);
    } catch (error) {
      console.error('Like failed:', error);
    } finally {
      setPending(false);
    }
  };
  
  return (
    <button onClick={handleLike} disabled={pending}>
      {pending ? '点赞中...' : '❤️ 点赞'}
    </button>
  );
}
```

### 3.3 useFormState集成

```jsx
// Server Action
'use server';

export async function createComment(prevState, formData) {
  const content = formData.get('content');
  
  // 验证
  if (!content || content.length < 5) {
    return {
      error: '评论至少5个字符',
      fields: { content }
    };
  }
  
  try {
    const comment = await db.comments.create({
      data: { content }
    });
    
    revalidatePath('/posts');
    
    return {
      success: true,
      comment
    };
  } catch (error) {
    return {
      error: '创建失败，请重试'
    };
  }
}

// Client Component
'use client';

import { useFormState } from 'react-dom';
import { createComment } from './actions';

function CommentForm() {
  const [state, formAction] = useFormState(createComment, {
    error: null,
    success: false
  });
  
  return (
    <form action={formAction}>
      <textarea 
        name="content"
        defaultValue={state.fields?.content}
      />
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {state.success && (
        <div className="success">评论已发布！</div>
      )}
      
      <button type="submit">发布评论</button>
    </form>
  );
}
```

### 3.4 useFormStatus获取状态

```jsx
// Server Action
'use server';

export async function processPayment(formData) {
  const amount = formData.get('amount');
  
  // 模拟处理
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 处理支付...
  
  return { success: true };
}

// Submit Button Component
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Spinner />
          处理中...
        </>
      ) : (
        '确认支付'
      )}
    </button>
  );
}

// Form Component
'use client';

import { processPayment } from './actions';

function PaymentForm() {
  return (
    <form action={processPayment}>
      <input name="amount" type="number" />
      <SubmitButton />
    </form>
  );
}
```

## 第四部分：高级特性

### 4.1 缓存重新验证

```jsx
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

// 重新验证路径
export async function createPost(formData) {
  const post = await db.posts.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
  
  // 重新验证特定路径
  revalidatePath('/posts');
  revalidatePath(`/posts/${post.id}`);
  
  // 重新验证layout
  revalidatePath('/posts', 'layout');
  
  return { success: true };
}

// 使用缓存标签
export async function updatePost(id, formData) {
  const post = await db.posts.update({
    where: { id },
    data: {
      title: formData.get('title')
    }
  });
  
  // 重新验证带特定标签的缓存
  revalidateTag(`post-${id}`);
  revalidateTag('posts-list');
  
  return { success: true };
}
```

### 4.2 重定向

```jsx
'use server';

import { redirect } from 'next/navigation';

export async function createPost(formData) {
  const post = await db.posts.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
  
  // 创建后重定向到文章页
  redirect(`/posts/${post.id}`);
}

export async function deletePost(id) {
  await db.posts.delete({
    where: { id }
  });
  
  // 删除后重定向到列表页
  redirect('/posts');
}
```

### 4.3 Cookies操作

```jsx
'use server';

import { cookies } from 'next/headers';

export async function setTheme(theme) {
  cookies().set('theme', theme, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365 // 1年
  });
  
  revalidatePath('/');
}

export async function getTheme() {
  const theme = cookies().get('theme');
  return theme?.value || 'light';
}

export async function clearTheme() {
  cookies().delete('theme');
  revalidatePath('/');
}
```

### 4.4 Headers操作

```jsx
'use server';

import { headers } from 'next/headers';

export async function getClientInfo() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent');
  const referer = headersList.get('referer');
  
  return {
    userAgent,
    referer
  };
}

export async function logRequest(data) {
  const headersList = headers();
  
  await db.logs.create({
    data: {
      ip: headersList.get('x-forwarded-for'),
      userAgent: headersList.get('user-agent'),
      ...data
    }
  });
}
```

## 第五部分：错误处理

### 5.1 返回错误状态

```jsx
'use server';

export async function createUser(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  // 验证
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: '邮箱格式不正确'
    };
  }
  
  if (!password || password.length < 8) {
    return {
      success: false,
      error: '密码至少8个字符'
    };
  }
  
  try {
    // 检查邮箱是否已存在
    const existing = await db.users.findUnique({
      where: { email }
    });
    
    if (existing) {
      return {
        success: false,
        error: '邮箱已被注册'
      };
    }
    
    // 创建用户
    const user = await db.users.create({
      data: { email, password }
    });
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Create user error:', error);
    
    return {
      success: false,
      error: '注册失败，请稍后重试'
    };
  }
}
```

### 5.2 抛出错误

```jsx
'use server';

export async function updatePost(id, formData) {
  const post = await db.posts.findUnique({
    where: { id }
  });
  
  if (!post) {
    throw new Error('文章不存在');
  }
  
  const session = await getSession();
  
  if (post.authorId !== session.userId) {
    throw new Error('无权限修改此文章');
  }
  
  return await db.posts.update({
    where: { id },
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
}

// 使用
'use client';

function EditForm({ postId }) {
  const [error, setError] = useState(null);
  
  const handleSubmit = async (formData) => {
    try {
      await updatePost(postId, formData);
      // 成功处理
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    <form action={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="title" />
      <button type="submit">更新</button>
    </form>
  );
}
```

## 注意事项

### 1. 只能在特定位置使用

```jsx
// ✅ 可以使用的地方
- Server Components
- Server Actions文件
- 内联在Server Components中

// ❌ 不能使用的地方
- Client Components
- 中间件
- 工具函数文件
```

### 2. 参数和返回值必须可序列化

```jsx
// ❌ 不可序列化
'use server';

export async function badAction(callback) {  // 函数不可序列化
  return new Map();  // Map不可序列化
}

// ✅ 可序列化
'use server';

export async function goodAction(data) {  // 普通对象
  return { result: 'success' };  // 普通对象
}
```

### 3. 安全考虑

```jsx
'use server';

export async function deletePost(id) {
  // ✅ 始终验证权限
  const session = await getSession();
  
  const post = await db.posts.findUnique({
    where: { id }
  });
  
  if (post.authorId !== session.userId) {
    throw new Error('无权限删除');
  }
  
  await db.posts.delete({
    where: { id }
  });
}
```

## 常见问题

### Q1: Server Actions和API路由有什么区别？

**A:** 
- Server Actions更简洁，自动序列化
- API路由更灵活，可被非React客户端调用

### Q2: Server Actions在哪里执行？

**A:** 始终在服务器执行，客户端通过RPC调用。

### Q3: 如何处理文件上传？

**A:** FormData自动支持文件：

```jsx
'use server';

export async function uploadFile(formData) {
  const file = formData.get('file');
  const buffer = await file.arrayBuffer();
  // 处理文件...
}
```

## 总结

### 'use server'核心要点

```
✅ 标记Server Actions
✅ 只在服务器执行
✅ 类型安全
✅ 自动序列化
✅ 表单原生集成
✅ 缓存重新验证
✅ 简化数据变更
```

### 最佳实践

```
1. 将Server Actions组织在actions文件中
2. 总是验证输入和权限
3. 返回明确的成功/错误状态
4. 使用revalidatePath更新缓存
5. 合理使用redirect
6. 提供友好的错误消息
7. 考虑安全性
```

Server Actions是React 19简化服务器交互的重要特性！
