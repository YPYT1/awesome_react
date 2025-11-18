# React 19 Form Actions表单

## 概述

React 19引入了全新的Form Actions特性,这是对表单处理的重大改进。通过Actions,可以更直接地处理表单提交、服务器交互和状态管理,无需手动管理loading状态和错误处理。本文将深入探讨React 19的Form Actions特性及其实际应用。

## Form Actions基础

### 传统表单 vs Actions表单

```jsx
// 传统方式
function TraditionalForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.target);
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('提交失败');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="username" required />
      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '提交'}
      </button>
      {error && <div className="error">{error}</div>}
      {data && <div>成功: {JSON.stringify(data)}</div>}
    </form>
  );
}

// React 19 Actions方式
function ActionsForm() {
  async function submitForm(formData) {
    'use server'; // Server Action标记
    
    const username = formData.get('username');
    
    // 直接在action中处理
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) {
      throw new Error('提交失败');
    }
    
    return await response.json();
  }
  
  return (
    <form action={submitForm}>
      <input name="username" required />
      <button type="submit">提交</button>
    </form>
  );
}
```

### useFormStatus Hook

```jsx
import { useFormStatus } from 'react-dom';

// 提交按钮组件
function SubmitButton({ children }) {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : children}
    </button>
  );
}

// 使用示例
function FormWithStatus() {
  async function handleSubmit(formData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('提交:', Object.fromEntries(formData));
  }
  
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <SubmitButton>提交</SubmitButton>
    </form>
  );
}

// 完整状态显示
function DetailedStatus() {
  const { pending, data, method } = useFormStatus();
  
  return (
    <div className="form-status">
      {pending && (
        <div className="loading">
          <span>正在提交...</span>
          <div className="spinner" />
        </div>
      )}
      {data && (
        <div className="info">
          提交方法: {method}
        </div>
      )}
    </div>
  );
}
```

### useFormState Hook

```jsx
import { useFormState } from 'react-dom';

// 定义action
async function createUser(prevState, formData) {
  const username = formData.get('username');
  const email = formData.get('email');
  
  // 验证
  if (!username || username.length < 3) {
    return {
      success: false,
      message: '用户名至少3个字符',
    };
  }
  
  if (!email.includes('@')) {
    return {
      success: false,
      message: '邮箱格式不正确',
    };
  }
  
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: '用户创建成功!',
    data: { username, email },
  };
}

function FormWithState() {
  const [state, formAction] = useFormState(createUser, {
    success: null,
    message: '',
  });
  
  return (
    <form action={formAction}>
      <div>
        <input name="username" placeholder="用户名" required />
      </div>
      
      <div>
        <input name="email" type="email" placeholder="邮箱" required />
      </div>
      
      <button type="submit">创建用户</button>
      
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}
      
      {state.success && state.data && (
        <div className="result">
          <p>用户名: {state.data.username}</p>
          <p>邮箱: {state.data.email}</p>
        </div>
      )}
    </form>
  );
}
```

## 客户端Actions

### 基础客户端Action

```jsx
function ClientAction() {
  const [result, setResult] = useState(null);
  
  async function handleSubmit(formData) {
    const username = formData.get('username');
    const email = formData.get('email');
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });
      
      if (!response.ok) {
        throw new Error('创建失败');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('错误:', error);
      setResult({ error: error.message });
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="username" required />
      <input name="email" type="email" required />
      <button type="submit">提交</button>
      
      {result && (
        <div>
          {result.error ? (
            <div className="error">{result.error}</div>
          ) : (
            <div className="success">创建成功: {result.id}</div>
          )}
        </div>
      )}
    </form>
  );
}
```

### 带验证的客户端Action

```jsx
function ValidatedClientAction() {
  const [errors, setErrors] = useState({});
  
  function validateForm(formData) {
    const errors = {};
    
    const username = formData.get('username');
    if (!username || username.length < 3) {
      errors.username = '用户名至少3个字符';
    }
    
    const email = formData.get('email');
    if (!email || !email.includes('@')) {
      errors.email = '邮箱格式不正确';
    }
    
    const password = formData.get('password');
    if (!password || password.length < 8) {
      errors.password = '密码至少8个字符';
    }
    
    return errors;
  }
  
  async function handleSubmit(formData) {
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors({});
    
    // 提交数据
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    
    if (response.ok) {
      alert('注册成功!');
    }
  }
  
  return (
    <form action={handleSubmit}>
      <div>
        <input name="username" placeholder="用户名" />
        {errors.username && (
          <span className="error">{errors.username}</span>
        )}
      </div>
      
      <div>
        <input name="email" type="email" placeholder="邮箱" />
        {errors.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>
      
      <div>
        <input name="password" type="password" placeholder="密码" />
        {errors.password && (
          <span className="error">{errors.password}</span>
        )}
      </div>
      
      <button type="submit">注册</button>
    </form>
  );
}
```

## Server Actions

### 基础Server Action

```jsx
// app/actions.js
'use server';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // 服务器端验证
  if (!title || title.length < 5) {
    return {
      success: false,
      error: '标题至少5个字符',
    };
  }
  
  // 数据库操作
  const post = await db.post.create({
    data: { title, content },
  });
  
  // 重新验证缓存
  revalidatePath('/posts');
  
  return {
    success: true,
    data: post,
  };
}

// app/PostForm.jsx
import { createPost } from './actions';

export default function PostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="标题" required />
      <textarea name="content" placeholder="内容" required />
      <button type="submit">发布</button>
    </form>
  );
}
```

### 带状态的Server Action

```jsx
// app/actions.js
'use server';

export async function updateProfile(prevState, formData) {
  const name = formData.get('name');
  const bio = formData.get('bio');
  
  try {
    // 更新用户资料
    const updatedUser = await db.user.update({
      where: { id: prevState.userId },
      data: { name, bio },
    });
    
    revalidatePath('/profile');
    
    return {
      success: true,
      message: '资料更新成功',
      user: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      message: '更新失败: ' + error.message,
    };
  }
}

// app/ProfileForm.jsx
'use client';

import { useFormState } from 'react-dom';
import { updateProfile } from './actions';

export default function ProfileForm({ userId, initialData }) {
  const [state, formAction] = useFormState(updateProfile, {
    userId,
    success: null,
    message: '',
  });
  
  return (
    <form action={formAction}>
      <input
        name="name"
        defaultValue={initialData.name}
        placeholder="姓名"
      />
      
      <textarea
        name="bio"
        defaultValue={initialData.bio}
        placeholder="个人简介"
      />
      
      <button type="submit">更新资料</button>
      
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}
    </form>
  );
}
```

### 文件上传Server Action

```jsx
// app/actions.js
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(formData) {
  const file = formData.get('file');
  
  if (!file) {
    return { success: false, error: '请选择文件' };
  }
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: '只允许上传图片文件' };
  }
  
  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: '文件大小不能超过5MB' };
  }
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 生成唯一文件名
    const filename = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public', 'uploads', filename);
    
    await writeFile(path, buffer);
    
    return {
      success: true,
      url: `/uploads/${filename}`,
    };
  } catch (error) {
    return {
      success: false,
      error: '上传失败: ' + error.message,
    };
  }
}

// app/UploadForm.jsx
'use client';

import { useFormState } from 'react-dom';
import { uploadFile } from './actions';

export default function UploadForm() {
  const [state, formAction] = useFormState(uploadFile, {
    success: null,
    url: null,
  });
  
  return (
    <form action={formAction}>
      <input
        type="file"
        name="file"
        accept="image/*"
        required
      />
      
      <button type="submit">上传</button>
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {state.success && state.url && (
        <div className="success">
          <p>上传成功!</p>
          <img src={state.url} alt="上传的图片" />
        </div>
      )}
    </form>
  );
}
```

## 乐观更新

### 基础乐观更新

```jsx
'use client';

import { useOptimistic } from 'react';
import { addTodo } from './actions';

export default function TodoList({ initialTodos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );
  
  async function handleSubmit(formData) {
    const text = formData.get('text');
    
    // 乐观更新UI
    addOptimisticTodo({
      id: Date.now(),
      text,
      completed: false,
    });
    
    // 实际提交
    await addTodo(formData);
  }
  
  return (
    <div>
      <form action={handleSubmit}>
        <input name="text" placeholder="添加待办事项" required />
        <button type="submit">添加</button>
      </form>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} className={todo.pending ? 'pending' : ''}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 复杂乐观更新

```jsx
'use client';

import { useOptimistic } from 'react';

export default function PostList({ initialPosts }) {
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
    initialPosts,
    (state, { action, post }) => {
      switch (action) {
        case 'add':
          return [...state, { ...post, optimistic: true }];
        case 'delete':
          return state.filter(p => p.id !== post.id);
        case 'update':
          return state.map(p =>
            p.id === post.id ? { ...p, ...post, optimistic: true } : p
          );
        default:
          return state;
      }
    }
  );
  
  async function handleAdd(formData) {
    const title = formData.get('title');
    const content = formData.get('content');
    
    const newPost = {
      id: Date.now(),
      title,
      content,
      createdAt: new Date(),
    };
    
    updateOptimisticPosts({ action: 'add', post: newPost });
    
    await createPost(formData);
  }
  
  async function handleDelete(postId) {
    updateOptimisticPosts({ action: 'delete', post: { id: postId } });
    
    await deletePost(postId);
  }
  
  async function handleUpdate(postId, formData) {
    const title = formData.get('title');
    const content = formData.get('content');
    
    updateOptimisticPosts({
      action: 'update',
      post: { id: postId, title, content },
    });
    
    await updatePost(postId, formData);
  }
  
  return (
    <div>
      <form action={handleAdd}>
        <input name="title" placeholder="标题" required />
        <textarea name="content" placeholder="内容" required />
        <button type="submit">发布</button>
      </form>
      
      <div className="posts">
        {optimisticPosts.map(post => (
          <article key={post.id} className={post.optimistic ? 'optimistic' : ''}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <button onClick={() => handleDelete(post.id)}>删除</button>
          </article>
        ))}
      </div>
    </div>
  );
}
```

## 错误处理

### 错误边界

```jsx
'use client';

import { useFormState } from 'react-dom';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-boundary">
      <h2>出错了</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

export default function FormWithErrorBoundary() {
  async function handleSubmit(prevState, formData) {
    // 可能抛出错误的操作
    const result = await riskyOperation(formData);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return result;
  }
  
  const [state, formAction] = useFormState(handleSubmit, null);
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <form action={formAction}>
        <input name="data" required />
        <button type="submit">提交</button>
      </form>
    </ErrorBoundary>
  );
}
```

### 错误状态处理

```jsx
'use client';

import { useFormState } from 'react-dom';

async function submitForm(prevState, formData) {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        errors: error.errors || {},
        message: error.message,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: '网络错误: ' + error.message,
    };
  }
}

export default function FormWithErrorHandling() {
  const [state, formAction] = useFormState(submitForm, {
    success: null,
    errors: {},
    message: '',
  });
  
  return (
    <form action={formAction}>
      <div>
        <input name="username" />
        {state.errors?.username && (
          <span className="error">{state.errors.username}</span>
        )}
      </div>
      
      <div>
        <input name="email" type="email" />
        {state.errors?.email && (
          <span className="error">{state.errors.email}</span>
        )}
      </div>
      
      <button type="submit">提交</button>
      
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}
    </form>
  );
}
```

## 实战案例

### 完整的用户注册表单

```jsx
// app/actions.js
'use server';

import { z } from 'zod';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密码不匹配',
  path: ['confirmPassword'],
});

export async function register(prevState, formData) {
  // 验证
  const validatedFields = registerSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });
  
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: '验证失败',
    };
  }
  
  const { username, email, password } = validatedFields.data;
  
  // 检查用户名是否存在
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });
  
  if (existingUser) {
    return {
      success: false,
      message: existingUser.username === username
        ? '用户名已被使用'
        : '邮箱已被注册',
    };
  }
  
  // 创建用户
  const hashedPassword = await hash(password, 10);
  
  try {
    await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    
    // 重定向到登录页
    redirect('/login');
  } catch (error) {
    return {
      success: false,
      message: '注册失败,请稍后重试',
    };
  }
}

// app/register/page.jsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { register } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '注册中...' : '注册'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, {
    success: null,
    errors: {},
    message: '',
  });
  
  return (
    <div className="register-page">
      <h1>用户注册</h1>
      
      <form action={formAction}>
        <div className="form-group">
          <label>用户名</label>
          <input
            name="username"
            placeholder="用户名"
            required
          />
          {state.errors?.username && (
            <span className="error">{state.errors.username[0]}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>邮箱</label>
          <input
            name="email"
            type="email"
            placeholder="邮箱"
            required
          />
          {state.errors?.email && (
            <span className="error">{state.errors.email[0]}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>密码</label>
          <input
            name="password"
            type="password"
            placeholder="密码"
            required
          />
          {state.errors?.password && (
            <span className="error">{state.errors.password[0]}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>确认密码</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="确认密码"
            required
          />
          {state.errors?.confirmPassword && (
            <span className="error">{state.errors.confirmPassword[0]}</span>
          )}
        </div>
        
        <SubmitButton />
        
        {state.message && !state.success && (
          <div className="error-message">{state.message}</div>
        )}
      </form>
    </div>
  );
}
```

### 带图片上传的博客文章表单

```jsx
// app/actions.js
'use server';

import { z } from 'zod';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const postSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10),
  category: z.string(),
});

export async function createPost(prevState, formData) {
  // 验证文本字段
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category'),
  });
  
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  // 处理图片上传
  const image = formData.get('image');
  let imageUrl = null;
  
  if (image && image.size > 0) {
    // 验证文件类型和大小
    if (!image.type.startsWith('image/')) {
      return {
        success: false,
        message: '只能上传图片文件',
      };
    }
    
    if (image.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: '图片大小不能超过5MB',
      };
    }
    
    // 上传到Blob存储
    const blob = await put(image.name, image, {
      access: 'public',
    });
    
    imageUrl = blob.url;
  }
  
  // 创建文章
  try {
    const post = await db.post.create({
      data: {
        ...validatedFields.data,
        imageUrl,
        authorId: 1, // 从session获取
      },
    });
    
    revalidatePath('/posts');
    
    return {
      success: true,
      data: post,
    };
  } catch (error) {
    return {
      success: false,
      message: '创建失败: ' + error.message,
    };
  }
}

// app/posts/new/page.jsx
'use client';

import { useFormState } from 'react-dom';
import { createPost } from '@/app/actions';
import { useState } from 'react';

export default function NewPostPage() {
  const [state, formAction] = useFormState(createPost, {
    success: null,
    errors: {},
  });
  
  const [preview, setPreview] = useState(null);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="new-post-page">
      <h1>创建文章</h1>
      
      <form action={formAction}>
        <div className="form-group">
          <label>标题</label>
          <input
            name="title"
            placeholder="文章标题"
            required
          />
          {state.errors?.title && (
            <span className="error">{state.errors.title[0]}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>分类</label>
          <select name="category" required>
            <option value="">选择分类</option>
            <option value="tech">技术</option>
            <option value="life">生活</option>
            <option value="travel">旅行</option>
          </select>
          {state.errors?.category && (
            <span className="error">{state.errors.category[0]}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>封面图片</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {preview && (
            <img src={preview} alt="预览" className="preview" />
          )}
        </div>
        
        <div className="form-group">
          <label>内容</label>
          <textarea
            name="content"
            rows={10}
            placeholder="文章内容"
            required
          />
          {state.errors?.content && (
            <span className="error">{state.errors.content[0]}</span>
          )}
        </div>
        
        <button type="submit">发布文章</button>
        
        {state.message && (
          <div className={state.success ? 'success' : 'error'}>
            {state.message}
          </div>
        )}
        
        {state.success && (
          <div className="success">
            文章创建成功! <a href="/posts">查看文章列表</a>
          </div>
        )}
      </form>
    </div>
  );
}
```

## 总结

React 19 Form Actions要点：

1. **简化代码**：无需手动管理loading和error状态
2. **useFormStatus**：访问表单提交状态
3. **useFormState**：管理表单状态和结果
4. **Server Actions**：服务器端表单处理
5. **乐观更新**：useOptimistic提升用户体验
6. **错误处理**：统一的错误处理机制

Form Actions是React 19的重大改进,显著简化了表单处理流程。
