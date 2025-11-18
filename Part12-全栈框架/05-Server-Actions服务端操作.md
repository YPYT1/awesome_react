# Server Actions服务端操作

## 概述

Server Actions是Next.js 13.4引入的强大特性,允许在服务器上执行异步代码。它们可以在服务端组件和客户端组件中调用,无需创建API端点,简化了表单提交和数据变更操作。本文将全面介绍Server Actions的使用方法和最佳实践。

## Server Actions基础

### 定义Server Action

```typescript
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // 数据库操作
  await db.user.create({
    data: { name, email },
  });
  
  // 重定向
  redirect('/users');
}

// 或在组件中定义
// app/page.tsx
export default function Page() {
  async function create(formData: FormData) {
    'use server';
    
    const name = formData.get('name') as string;
    await db.user.create({ data: { name } });
  }
  
  return (
    <form action={create}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### 在表单中使用

```typescript
// app/users/new/page.tsx
import { createUser } from '@/app/actions';

export default function NewUserPage() {
  return (
    <form action={createUser}>
      <input name="name" placeholder="Name" required />
      <input name="email" placeholder="Email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

### 在客户端组件中使用

```typescript
// components/CreateUserForm.tsx
'use client';

import { createUser } from '@/app/actions';
import { useFormState, useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create User'}
    </button>
  );
}

export default function CreateUserForm() {
  const [state, formAction] = useFormState(createUser, null);
  
  return (
    <form action={formAction}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <SubmitButton />
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

## 数据变更

### 创建数据

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(0).max(150),
});

export async function createUser(formData: FormData) {
  // 验证数据
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    age: Number(formData.get('age')),
  });
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    // 创建用户
    await db.user.create({
      data: validatedFields.data,
    });
    
    // 重新验证缓存
    revalidatePath('/users');
    
    return { success: true };
  } catch (error) {
    return { error: 'Failed to create user' };
  }
}
```

### 更新数据

```typescript
// app/actions.ts
'use server';

export async function updateUser(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  try {
    await db.user.update({
      where: { id },
      data: { name, email },
    });
    
    revalidatePath(`/users/${id}`);
    revalidatePath('/users');
    
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update user' };
  }
}

// components/EditUserForm.tsx
'use client';

import { updateUser } from '@/app/actions';

export default function EditUserForm({ user }: { user: User }) {
  const updateUserWithId = updateUser.bind(null, user.id);
  
  return (
    <form action={updateUserWithId}>
      <input name="name" defaultValue={user.name} />
      <input name="email" defaultValue={user.email} />
      <button type="submit">Update</button>
    </form>
  );
}
```

### 删除数据

```typescript
// app/actions.ts
'use server';

export async function deleteUser(id: string) {
  try {
    await db.user.delete({
      where: { id },
    });
    
    revalidatePath('/users');
    
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete user' };
  }
}

// components/DeleteUserButton.tsx
'use client';

import { deleteUser } from '@/app/actions';

export default function DeleteUserButton({ userId }: { userId: string }) {
  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      const result = await deleteUser(userId);
      if (result.error) {
        alert(result.error);
      }
    }
  };
  
  return (
    <button onClick={handleDelete}>
      Delete
    </button>
  );
}
```

## 表单状态管理

### useFormState Hook

```typescript
// app/actions.ts
'use server';

export async function submitForm(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name) {
    return { error: 'Name is required' };
  }
  
  await db.user.create({ data: { name } });
  
  return { success: true, message: 'User created successfully' };
}

// components/Form.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitForm } from '@/app/actions';

export default function Form() {
  const [state, formAction] = useFormState(submitForm, { error: null });
  
  return (
    <form action={formAction}>
      <input name="name" />
      
      {state?.error && (
        <p className="error">{state.error}</p>
      )}
      
      {state?.success && (
        <p className="success">{state.message}</p>
      )}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### useFormStatus Hook

```typescript
// components/SubmitButton.tsx
'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

// components/Form.tsx
'use client';

import { createUser } from '@/app/actions';
import SubmitButton from './SubmitButton';

export default function Form() {
  return (
    <form action={createUser}>
      <input name="name" />
      <SubmitButton />
    </form>
  );
}
```

### useOptimistic Hook

```typescript
// components/TodoList.tsx
'use client';

import { useOptimistic } from 'react';
import { addTodo } from '@/app/actions';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: string) => [
      ...state,
      { id: 'temp-' + Date.now(), text: newTodo, completed: false },
    ]
  );
  
  const formAction = async (formData: FormData) => {
    const text = formData.get('text') as string;
    addOptimisticTodo(text);
    await addTodo(text);
  };
  
  return (
    <div>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.id.startsWith('temp-') ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
      
      <form action={formAction}>
        <input name="text" />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}
```

## 数据验证

### 使用Zod

```typescript
// app/actions.ts
'use server';

import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function createUser(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    age: Number(formData.get('age')),
    password: formData.get('password'),
  };
  
  const validatedFields = UserSchema.safeParse(rawData);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    };
  }
  
  try {
    await db.user.create({
      data: validatedFields.data,
    });
    
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    return { error: 'Database error' };
  }
}
```

### 字段级验证

```typescript
// app/actions.ts
'use server';

export async function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email format' };
  }
  
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    return { error: 'Email already exists' };
  }
  
  return { valid: true };
}

// components/EmailInput.tsx
'use client';

import { useState } from 'react';
import { validateEmail } from '@/app/actions';

export default function EmailInput() {
  const [error, setError] = useState('');
  
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const result = await validateEmail(e.target.value);
    if (result.error) {
      setError(result.error);
    } else {
      setError('');
    }
  };
  
  return (
    <div>
      <input
        name="email"
        type="email"
        onBlur={handleBlur}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

## 认证和授权

### 检查用户权限

```typescript
// app/actions.ts
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return { error: 'Unauthorized' };
  }
  
  const post = await db.post.findUnique({
    where: { id: postId },
  });
  
  if (post.authorId !== session.user.id) {
    return { error: 'Forbidden' };
  }
  
  await db.post.delete({
    where: { id: postId },
  });
  
  revalidatePath('/posts');
  return { success: true };
}
```

### 管理员操作

```typescript
// app/actions.ts
'use server';

import { getServerSession } from 'next-auth';

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return { error: 'Admin access required' };
  }
  
  await db.user.delete({
    where: { id: userId },
  });
  
  revalidatePath('/admin/users');
  return { success: true };
}
```

## 文件上传

### 处理文件上传

```typescript
// app/actions.ts
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { error: 'No file provided' };
  }
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type' };
  }
  
  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large' };
  }
  
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 生成唯一文件名
    const fileName = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public/uploads', fileName);
    
    await writeFile(path, buffer);
    
    return { 
      success: true, 
      url: `/uploads/${fileName}` 
    };
  } catch (error) {
    return { error: 'Upload failed' };
  }
}

// components/FileUpload.tsx
'use client';

import { uploadFile } from '@/app/actions';
import { useState } from 'react';

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  
  const handleSubmit = async (formData: FormData) => {
    setUploading(true);
    const result = await uploadFile(formData);
    setUploading(false);
    
    if (result.url) {
      setUrl(result.url);
    }
  };
  
  return (
    <form action={handleSubmit}>
      <input type="file" name="file" accept="image/*" />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {url && <img src={url} alt="Uploaded" />}
    </form>
  );
}
```

## 缓存重新验证

### revalidatePath

```typescript
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  
  await db.post.create({
    data: { title },
  });
  
  // 重新验证特定路径
  revalidatePath('/posts');
  
  // 重新验证特定路径和类型
  revalidatePath('/posts', 'page'); // 只重新验证页面
  revalidatePath('/posts', 'layout'); // 重新验证布局及以下所有页面
  
  return { success: true };
}
```

### revalidateTag

```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] },
  }).then(r => r.json());
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// app/actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  
  await db.post.create({
    data: { title },
  });
  
  // 重新验证带有'posts'标签的所有数据
  revalidateTag('posts');
  
  return { success: true };
}
```

## 重定向

### 基本重定向

```typescript
// app/actions.ts
'use server';

import { redirect } from 'next/navigation';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  
  const user = await db.user.create({
    data: { name },
  });
  
  // 重定向到新创建的用户页面
  redirect(`/users/${user.id}`);
}
```

### 条件重定向

```typescript
// app/actions.ts
'use server';

import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const name = formData.get('name') as string;
  
  await db.user.update({
    where: { id: session.user.id },
    data: { name },
  });
  
  redirect('/profile');
}
```

## 错误处理

### Try-Catch

```typescript
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    
    await db.user.create({
      data: { name },
    });
    
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { error: 'Failed to create user. Please try again.' };
  }
}
```

### 自定义错误类型

```typescript
// lib/errors.ts
export class ValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

// app/actions.ts
'use server';

import { ValidationError, UnauthorizedError } from '@/lib/errors';

export async function createPost(formData: FormData) {
  const session = await getServerSession();
  
  if (!session) {
    throw new UnauthorizedError();
  }
  
  const title = formData.get('title') as string;
  
  if (!title || title.length < 3) {
    throw new ValidationError({
      title: ['Title must be at least 3 characters'],
    });
  }
  
  await db.post.create({
    data: {
      title,
      authorId: session.user.id,
    },
  });
  
  revalidatePath('/posts');
  return { success: true };
}
```

## 批量操作

### 批量创建

```typescript
// app/actions.ts
'use server';

export async function bulkCreateUsers(users: Array<{ name: string; email: string }>) {
  try {
    await db.user.createMany({
      data: users,
    });
    
    revalidatePath('/users');
    return { success: true, count: users.length };
  } catch (error) {
    return { error: 'Bulk create failed' };
  }
}

// components/BulkUpload.tsx
'use client';

import { bulkCreateUsers } from '@/app/actions';

export default function BulkUpload() {
  const handleSubmit = async (formData: FormData) => {
    const file = formData.get('file') as File;
    const text = await file.text();
    const users = JSON.parse(text);
    
    const result = await bulkCreateUsers(users);
    if (result.success) {
      alert(`Created ${result.count} users`);
    }
  };
  
  return (
    <form action={handleSubmit}>
      <input type="file" name="file" accept=".json" />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### 批量更新

```typescript
// app/actions.ts
'use server';

export async function bulkUpdateUsers(updates: Array<{ id: string; data: any }>) {
  try {
    await db.$transaction(
      updates.map(({ id, data }) =>
        db.user.update({
          where: { id },
          data,
        })
      )
    );
    
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    return { error: 'Bulk update failed' };
  }
}
```

## 后台任务

### 异步处理

```typescript
// app/actions.ts
'use server';

export async function processLargeFile(formData: FormData) {
  const file = formData.get('file') as File;
  
  // 立即返回,不等待处理完成
  processFileInBackground(file).catch(console.error);
  
  return { 
    success: true, 
    message: 'File is being processed in the background' 
  };
}

async function processFileInBackground(file: File) {
  // 长时间运行的任务
  const data = await file.text();
  const processed = await heavyProcessing(data);
  await db.result.create({ data: processed });
}
```

### 队列系统集成

```typescript
// app/actions.ts
'use server';

import { Queue } from 'bullmq';

const emailQueue = new Queue('email', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

export async function sendWelcomeEmail(userId: string) {
  await emailQueue.add('welcome', {
    userId,
    type: 'welcome',
  });
  
  return { success: true, message: 'Email queued' };
}
```

## 最佳实践

### 1. 验证输入

```typescript
// ✅ 好 - 始终验证输入
'use server';

import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const validatedFields = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  
  // 继续处理...
}

// ❌ 不好 - 直接使用未验证的数据
export async function createUser(formData: FormData) {
  const name = formData.get('name');
  await db.user.create({ data: { name } });
}
```

### 2. 检查权限

```typescript
// ✅ 好 - 检查用户权限
'use server';

export async function deletePost(postId: string) {
  const session = await getServerSession();
  
  if (!session) {
    return { error: 'Unauthorized' };
  }
  
  const post = await db.post.findUnique({ where: { id: postId } });
  
  if (post.authorId !== session.user.id) {
    return { error: 'Forbidden' };
  }
  
  await db.post.delete({ where: { id: postId } });
  return { success: true };
}
```

### 3. 错误处理

```typescript
// ✅ 好 - 适当的错误处理
'use server';

export async function createUser(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    await db.user.create({ data: { name } });
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Failed to create user' };
  }
}
```

### 4. 重新验证缓存

```typescript
// ✅ 好 - 数据变更后重新验证
'use server';

export async function updatePost(id: string, formData: FormData) {
  await db.post.update({
    where: { id },
    data: { title: formData.get('title') as string },
  });
  
  revalidatePath(`/posts/${id}`);
  revalidatePath('/posts');
  
  return { success: true };
}
```

Server Actions提供了一种简洁的方式来处理服务器端逻辑,无需创建API端点,大大简化了全栈开发流程。

