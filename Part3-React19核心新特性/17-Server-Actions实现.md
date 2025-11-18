# Server Actions实现

## 学习目标

通过本章学习，你将掌握：

- Server Actions的完整实现方式
- 数据库操作集成
- 认证和授权处理
- 文件上传实现
- 缓存管理
- 错误处理策略
- 日志和监控
- 实际项目架构

## 第一部分：基础实现

### 1.1 创建Server Action文件

```javascript
// app/actions/posts.js
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/database';
import { getSession } from '@/lib/auth';

export async function createPost(formData) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  const title = formData.get('title');
  const content = formData.get('content');
  
  const post = await db.posts.create({
    data: {
      title,
      content,
      authorId: session.userId
    }
  });
  
  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}

export async function updatePost(postId, formData) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (!post || post.authorId !== session.userId) {
    throw new Error('无权限');
  }
  
  const title = formData.get('title');
  const content = formData.get('content');
  
  const updatedPost = await db.posts.update({
    where: { id: postId },
    data: { title, content }
  });
  
  revalidatePath(`/posts/${postId}`);
  
  return { success: true, post: updatedPost };
}

export async function deletePost(postId) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (!post || post.authorId !== session.userId) {
    throw new Error('无权限');
  }
  
  await db.posts.delete({
    where: { id: postId }
  });
  
  revalidatePath('/posts');
  redirect('/posts');
}
```

### 1.2 组织Actions结构

```
app/
├── actions/
│   ├── auth.js          # 认证相关
│   ├── posts.js         # 文章相关
│   ├── comments.js      # 评论相关
│   ├── users.js         # 用户相关
│   └── uploads.js       # 文件上传
├── lib/
│   ├── database.js      # 数据库客户端
│   ├── auth.js          # 认证工具
│   └── validation.js    # 验证工具
```

```javascript
// app/actions/auth.js
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validation';

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  if (!validateEmail(email)) {
    return { error: '邮箱格式不正确' };
  }
  
  if (!validatePassword(password)) {
    return { error: '密码至少8个字符' };
  }
  
  try {
    const session = await signIn(email, password);
    
    cookies().set('session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7天
    });
    
    redirect('/dashboard');
  } catch (error) {
    return { error: '邮箱或密码错误' };
  }
}

export async function logout() {
  await signOut();
  cookies().delete('session');
  redirect('/');
}

export async function register(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');
  
  if (!validateEmail(email)) {
    return { error: '邮箱格式不正确' };
  }
  
  if (!validatePassword(password)) {
    return { error: '密码至少8个字符，包含字母和数字' };
  }
  
  const existingUser = await db.users.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    return { error: '邮箱已被注册' };
  }
  
  const user = await db.users.create({
    data: {
      email,
      password: await hashPassword(password),
      name
    }
  });
  
  const session = await createSession(user.id);
  
  cookies().set('session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7
  });
  
  redirect('/dashboard');
}
```

### 1.3 数据库集成

```javascript
// lib/database.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const db = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// app/actions/posts.js
'use server';

import { db } from '@/lib/database';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const tags = formData.get('tags')?.split(',').map(t => t.trim()) || [];
  
  const post = await db.posts.create({
    data: {
      title,
      content,
      tags,
      authorId: await getCurrentUserId()
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });
  
  return { success: true, post };
}

export async function getPosts(filters = {}) {
  const { category, search, page = 1, limit = 10 } = filters;
  
  const where = {};
  
  if (category) {
    where.categoryId = category;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  const [posts, total] = await db.$transaction([
    db.posts.findMany({
      where,
      skip: (page - 1) * limit,
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
    db.posts.count({ where })
  ]);
  
  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

## 第二部分：认证和授权

### 2.1 会话管理

```javascript
// lib/auth.js
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './database';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  
  return { token };
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  const user = await db.users.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true
    }
  });
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('未登录');
  }
  
  return user;
}

export async function requireRole(role) {
  const user = await requireAuth();
  
  if (user.role !== role && user.role !== 'admin') {
    throw new Error('无权限');
  }
  
  return user;
}
```

### 2.2 权限检查

```javascript
// app/actions/posts.js
'use server';

import { requireAuth, requireRole } from '@/lib/auth';

export async function createPost(formData) {
  const user = await requireAuth();
  
  const title = formData.get('title');
  const content = formData.get('content');
  
  const post = await db.posts.create({
    data: {
      title,
      content,
      authorId: user.id
    }
  });
  
  return { success: true, post };
}

export async function updatePost(postId, formData) {
  const user = await requireAuth();
  
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (!post) {
    throw new Error('文章不存在');
  }
  
  if (post.authorId !== user.id && user.role !== 'admin') {
    throw new Error('无权限修改此文章');
  }
  
  const title = formData.get('title');
  const content = formData.get('content');
  
  const updatedPost = await db.posts.update({
    where: { id: postId },
    data: { title, content }
  });
  
  return { success: true, post: updatedPost };
}

export async function deletePost(postId) {
  const user = await requireAuth();
  
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (!post) {
    throw new Error('文章不存在');
  }
  
  if (post.authorId !== user.id && user.role !== 'admin') {
    throw new Error('无权限删除此文章');
  }
  
  await db.posts.delete({
    where: { id: postId }
  });
  
  return { success: true };
}

export async function publishPost(postId) {
  const user = await requireRole('editor');
  
  await db.posts.update({
    where: { id: postId },
    data: {
      published: true,
      publishedAt: new Date()
    }
  });
  
  return { success: true };
}
```

## 第三部分：文件上传

### 3.1 基础文件上传

```javascript
// app/actions/uploads.js
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { requireAuth } from '@/lib/auth';

export async function uploadFile(formData) {
  const user = await requireAuth();
  
  const file = formData.get('file');
  
  if (!file) {
    return { error: '请选择文件' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { error: '只能上传图片文件' };
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { error: '文件大小不能超过5MB' };
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(process.cwd(), 'public/uploads', filename);
  
  await writeFile(filepath, buffer);
  
  const fileRecord = await db.files.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `/uploads/${filename}`,
      uploadedBy: user.id
    }
  });
  
  return {
    success: true,
    file: fileRecord
  };
}
```

### 3.2 多文件上传

```javascript
'use server';

export async function uploadMultipleFiles(formData) {
  const user = await requireAuth();
  
  const files = formData.getAll('files');
  
  if (files.length === 0) {
    return { error: '请选择文件' };
  }
  
  if (files.length > 10) {
    return { error: '最多上传10个文件' };
  }
  
  const uploadedFiles = [];
  const errors = [];
  
  for (const file of files) {
    try {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: 不是图片文件`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: 文件过大`);
        continue;
      }
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filename = `${Date.now()}-${file.name}`;
      const filepath = join(process.cwd(), 'public/uploads', filename);
      
      await writeFile(filepath, buffer);
      
      const fileRecord = await db.files.create({
        data: {
          filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          path: `/uploads/${filename}`,
          uploadedBy: user.id
        }
      });
      
      uploadedFiles.push(fileRecord);
    } catch (error) {
      errors.push(`${file.name}: ${error.message}`);
    }
  }
  
  return {
    success: uploadedFiles.length > 0,
    files: uploadedFiles,
    errors: errors.length > 0 ? errors : undefined
  };
}
```

### 3.3 云存储集成

```javascript
// lib/storage.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function uploadToS3(file, folder = 'uploads') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const filename = `${folder}/${Date.now()}-${file.name}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: file.type
  }));
  
  return {
    filename,
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
  };
}

// app/actions/uploads.js
'use server';

import { uploadToS3 } from '@/lib/storage';

export async function uploadImage(formData) {
  const user = await requireAuth();
  
  const file = formData.get('image');
  
  if (!file) {
    return { error: '请选择图片' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { error: '只能上传图片文件' };
  }
  
  const { filename, url } = await uploadToS3(file, 'images');
  
  const image = await db.images.create({
    data: {
      filename,
      url,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: user.id
    }
  });
  
  return {
    success: true,
    image
  };
}
```

## 第四部分：缓存管理

### 4.1 路径重新验证

```javascript
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData) {
  const post = await db.posts.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
  
  revalidatePath('/posts');
  revalidatePath('/');
  
  return { success: true, post };
}

export async function updatePost(postId, formData) {
  const post = await db.posts.update({
    where: { id: postId },
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
  
  revalidatePath(`/posts/${postId}`);
  revalidatePath('/posts');
  
  return { success: true, post };
}

export async function deletePost(postId) {
  await db.posts.delete({
    where: { id: postId }
  });
  
  revalidatePath('/posts');
  revalidatePath('/');
}
```

### 4.2 标签重新验证

```javascript
'use server';

import { revalidateTag } from 'next/cache';

export async function createPost(formData) {
  const post = await db.posts.create({
    data: {
      title: formData.get('title'),
      content: formData.get('content')
    }
  });
  
  revalidateTag('posts');
  revalidateTag(`post-${post.id}`);
  
  return { success: true, post };
}

export async function likePost(postId) {
  await db.likes.create({
    data: {
      postId,
      userId: await getCurrentUserId()
    }
  });
  
  revalidateTag(`post-${postId}`);
  revalidateTag('posts-list');
}
```

### 4.3 选择性缓存

```javascript
'use server';

export async function getPost(postId) {
  const post = await fetch(`/api/posts/${postId}`, {
    next: {
      tags: [`post-${postId}`],
      revalidate: 3600 // 1小时
    }
  }).then(r => r.json());
  
  return post;
}

export async function getLivePosts() {
  const posts = await fetch('/api/posts/live', {
    cache: 'no-store'
  }).then(r => r.json());
  
  return posts;
}
```

## 第五部分：错误处理

### 5.1 统一错误处理

```javascript
// lib/errors.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message = '未授权') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// app/actions/posts.js
'use server';

import { ValidationError, NotFoundError, AuthError } from '@/lib/errors';

export async function createPost(formData) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new AuthError('请先登录');
    }
    
    const title = formData.get('title');
    const content = formData.get('content');
    
    const errors = {};
    
    if (!title || title.length < 3) {
      errors.title = '标题至少3个字符';
    }
    
    if (!content || content.length < 100) {
      errors.content = '内容至少100个字符';
    }
    
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('验证失败', errors);
    }
    
    const post = await db.posts.create({
      data: {
        title,
        content,
        authorId: user.id
      }
    });
    
    return {
      success: true,
      post
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        errors: error.errors
      };
    }
    
    if (error instanceof AuthError) {
      return {
        success: false,
        error: error.message,
        redirectTo: '/login'
      };
    }
    
    console.error('创建文章失败:', error);
    
    return {
      success: false,
      error: '创建失败，请稍后重试'
    };
  }
}
```

### 5.2 错误日志

```javascript
// lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };

// app/actions/posts.js
'use server';

import { logger } from '@/lib/logger';

export async function createPost(formData) {
  try {
    const post = await db.posts.create({
      data: {
        title: formData.get('title'),
        content: formData.get('content')
      }
    });
    
    logger.info('文章创建成功', {
      postId: post.id,
      title: post.title
    });
    
    return { success: true, post };
  } catch (error) {
    logger.error('文章创建失败', {
      error: error.message,
      stack: error.stack,
      formData: {
        title: formData.get('title')
      }
    });
    
    return {
      success: false,
      error: '创建失败，请重试'
    };
  }
}
```

## 注意事项

### 1. 始终验证输入

```javascript
// ✅ 完整的输入验证
'use server';

import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(100).max(10000),
  tags: z.array(z.string()).max(5).optional()
});

export async function createPost(formData) {
  const rawData = {
    title: formData.get('title'),
    content: formData.get('content'),
    tags: formData.get('tags')?.split(',').map(t => t.trim())
  };
  
  const result = postSchema.safeParse(rawData);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors
    };
  }
  
  const post = await db.posts.create({
    data: result.data
  });
  
  return { success: true, post };
}
```

### 2. 安全性考虑

```javascript
// ✅ 防止SQL注入（使用ORM）
const posts = await db.posts.findMany({
  where: {
    title: {
      contains: query,
      mode: 'insensitive'
    }
  }
});

// ✅ 防止XSS（清理HTML）
import sanitizeHtml from 'sanitize-html';

const cleanContent = sanitizeHtml(content, {
  allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a'],
  allowedAttributes: {
    'a': ['href']
  }
});

// ✅ 速率限制
import { rateLimit } from '@/lib/rate-limit';

export async function submitForm(formData) {
  await rateLimit.check(10, 'SUBMIT_FORM');
  // 继续处理...
}
```

### 3. 性能优化

```javascript
// ✅ 批量操作
export async function batchUpdatePosts(updates) {
  await db.$transaction(
    updates.map(update =>
      db.posts.update({
        where: { id: update.id },
        data: update.data
      })
    )
  );
}

// ✅ 选择性查询
const posts = await db.posts.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true
    // 不查询content等大字段
  }
});
```

## 常见问题

### Q1: Server Actions可以返回什么类型的数据？

**A:** 只能返回可序列化的数据（对象、数组、字符串、数字、布尔值等），不能返回函数、类实例等。

### Q2: 如何处理大文件上传？

**A:** 使用流式上传或分块上传，配合云存储服务。

### Q3: Server Actions会增加服务器负载吗？

**A:** 会，但可以通过缓存、负载均衡和优化查询来减少负载。

### Q4: 如何调试Server Actions？

**A:** 使用console.log（在服务器控制台显示）和错误日志系统。

## 总结

### Server Actions实现要点

```
✅ 合理组织文件结构
✅ 实现完善的认证授权
✅ 集成数据库操作
✅ 处理文件上传
✅ 管理缓存策略
✅ 统一错误处理
✅ 添加日志记录
✅ 考虑安全性
✅ 优化性能
```

### 最佳实践

```
1. 始终验证输入
2. 检查用户权限
3. 使用事务处理
4. 实现错误日志
5. 合理使用缓存
6. 防止常见安全漏洞
7. 优化数据库查询
8. 提供清晰的错误消息
```

### 安全检查清单

```
✅ 输入验证
✅ 权限检查
✅ SQL注入防护
✅ XSS防护
✅ CSRF防护
✅ 速率限制
✅ 文件上传安全
✅ 敏感数据保护
```

完善的Server Actions实现是构建安全可靠React应用的基础！
