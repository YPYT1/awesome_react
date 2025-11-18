# Form Actions实战案例

## 学习目标

通过本章学习，你将掌握：

- 完整的表单应用实现
- 用户认证系统
- 内容管理系统
- 电商结账流程
- 文件上传系统
- 评论系统
- 搜索功能
- 实际项目架构

## 第一部分：用户认证系统

### 1.1 注册表单

```javascript
// app/actions/auth.js
'use server';

import { hash } from 'bcrypt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/database';
import { createSession } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string()
    .min(8, '密码至少8个字符')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[0-9]/, '密码必须包含数字'),
  name: z.string().min(2, '姓名至少2个字符')
});

export async function register(prevState, formData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name')
  };
  
  const result = registerSchema.safeParse(rawData);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors
    };
  }
  
  const { email, password, name } = result.data;
  
  const existingUser = await db.users.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    return {
      success: false,
      errors: { email: '邮箱已被注册' }
    };
  }
  
  const passwordHash = await hash(password, 10);
  
  const user = await db.users.create({
    data: {
      email,
      password: passwordHash,
      name
    }
  });
  
  const session = await createSession(user.id);
  
  cookies().set('session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });
  
  redirect('/dashboard');
}

// app/register/page.jsx
'use client';

import { useActionState } from 'react';
import { register } from './actions';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, {
    success: false,
    errors: {}
  });
  
  return (
    <div className="register-page">
      <h1>注册账号</h1>
      
      <form action={formAction}>
        <div>
          <label htmlFor="name">姓名</label>
          <input
            id="name"
            name="name"
            required
          />
          {state.errors?.name && (
            <span className="error">{state.errors.name[0]}</span>
          )}
        </div>
        
        <div>
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            name="email"
            type="email"
            required
          />
          {state.errors?.email && (
            <span className="error">{state.errors.email[0]}</span>
          )}
        </div>
        
        <div>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            required
          />
          {state.errors?.password && (
            <span className="error">{state.errors.password[0]}</span>
          )}
        </div>
        
        <button type="submit" disabled={isPending}>
          {isPending ? '注册中...' : '注册'}
        </button>
      </form>
      
      <p>
        已有账号？<a href="/login">登录</a>
      </p>
    </div>
  );
}
```

### 1.2 登录表单

```javascript
// app/actions/auth.js
'use server';

import { compare } from 'bcrypt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  if (!email || !password) {
    return {
      success: false,
      error: '请填写完整信息'
    };
  }
  
  const user = await db.users.findUnique({
    where: { email }
  });
  
  if (!user) {
    return {
      success: false,
      error: '邮箱或密码错误'
    };
  }
  
  const passwordValid = await compare(password, user.password);
  
  if (!passwordValid) {
    return {
      success: false,
      error: '邮箱或密码错误'
    };
  }
  
  const session = await createSession(user.id);
  
  cookies().set('session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });
  
  redirect('/dashboard');
}

// app/login/page.jsx
'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {
    success: false
  });
  
  return (
    <div className="login-page">
      <h1>登录</h1>
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      <form action={formAction}>
        <div>
          <label htmlFor="email">邮箱</label>
          <input
            id="email"
            name="email"
            type="email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password">密码</label>
          <input
            id="password"
            name="password"
            type="password"
            required
          />
        </div>
        
        <div>
          <label>
            <input type="checkbox" name="remember" />
            记住我
          </label>
        </div>
        
        <button type="submit" disabled={isPending}>
          {isPending ? '登录中...' : '登录'}
        </button>
      </form>
      
      <p>
        还没账号？<a href="/register">注册</a>
      </p>
    </div>
  );
}
```

### 1.3 密码重置

```javascript
// app/actions/auth.js
'use server';

import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email';

export async function requestPasswordReset(prevState, formData) {
  const email = formData.get('email');
  
  if (!email) {
    return {
      success: false,
      error: '请输入邮箱'
    };
  }
  
  const user = await db.users.findUnique({
    where: { email }
  });
  
  if (!user) {
    return {
      success: true,
      message: '如果邮箱存在，重置链接已发送'
    };
  }
  
  const token = randomBytes(32).toString('hex');
  
  await db.passwordResetTokens.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000)
    }
  });
  
  await sendEmail({
    to: email,
    subject: '密码重置',
    html: `
      <p>点击以下链接重置密码：</p>
      <a href="${process.env.APP_URL}/reset-password?token=${token}">
        重置密码
      </a>
    `
  });
  
  return {
    success: true,
    message: '重置链接已发送到您的邮箱'
  };
}

export async function resetPassword(prevState, formData) {
  const token = formData.get('token');
  const password = formData.get('password');
  
  const resetToken = await db.passwordResetTokens.findUnique({
    where: { token },
    include: { user: true }
  });
  
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return {
      success: false,
      error: '重置链接无效或已过期'
    };
  }
  
  const passwordHash = await hash(password, 10);
  
  await db.users.update({
    where: { id: resetToken.userId },
    data: { password: passwordHash }
  });
  
  await db.passwordResetTokens.delete({
    where: { token }
  });
  
  return {
    success: true,
    message: '密码已重置，请登录'
  };
}
```

## 第二部分：博客管理系统

### 2.1 创建文章

```javascript
// app/actions/posts.js
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { uploadToS3 } from '@/lib/storage';

export async function createPost(prevState, formData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const title = formData.get('title');
  const content = formData.get('content');
  const excerpt = formData.get('excerpt');
  const coverImage = formData.get('coverImage');
  const tags = formData.get('tags')?.split(',').map(t => t.trim()) || [];
  
  const errors = {};
  
  if (!title || title.length < 3) {
    errors.title = '标题至少3个字符';
  }
  
  if (!content || content.length < 100) {
    errors.content = '内容至少100个字符';
  }
  
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors
    };
  }
  
  let coverImageUrl = null;
  
  if (coverImage && coverImage.size > 0) {
    if (coverImage.size > 2 * 1024 * 1024) {
      return {
        success: false,
        errors: { coverImage: '图片大小不能超过2MB' }
      };
    }
    
    const uploaded = await uploadToS3(coverImage, 'posts');
    coverImageUrl = uploaded.url;
  }
  
  const post = await db.posts.create({
    data: {
      title,
      content,
      excerpt: excerpt || content.slice(0, 200),
      coverImage: coverImageUrl,
      tags,
      authorId: user.id,
      published: false
    }
  });
  
  revalidatePath('/dashboard/posts');
  redirect(`/dashboard/posts/${post.id}`);
}

// app/dashboard/posts/new/page.jsx
'use client';

import { useActionState } from 'react';
import { createPost } from './actions';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function NewPostPage() {
  const [state, formAction, isPending] = useActionState(createPost, {
    success: false,
    errors: {}
  });
  
  return (
    <div className="new-post-page">
      <h1>新建文章</h1>
      
      <form action={formAction}>
        <div>
          <label htmlFor="title">标题</label>
          <input
            id="title"
            name="title"
            required
          />
          {state.errors?.title && (
            <span className="error">{state.errors.title}</span>
          )}
        </div>
        
        <div>
          <label htmlFor="excerpt">摘要</label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
          />
        </div>
        
        <div>
          <label htmlFor="coverImage">封面图</label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
          />
          {state.errors?.coverImage && (
            <span className="error">{state.errors.coverImage}</span>
          )}
        </div>
        
        <div>
          <label htmlFor="content">内容</label>
          <MarkdownEditor name="content" />
          {state.errors?.content && (
            <span className="error">{state.errors.content}</span>
          )}
        </div>
        
        <div>
          <label htmlFor="tags">标签</label>
          <input
            id="tags"
            name="tags"
            placeholder="用逗号分隔，如: React, TypeScript"
          />
        </div>
        
        <div className="actions">
          <button 
            type="submit" 
            name="action"
            value="draft"
            disabled={isPending}
          >
            保存草稿
          </button>
          <button 
            type="submit"
            name="action"
            value="publish"
            disabled={isPending}
          >
            发布
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 2.2 评论系统

```javascript
// app/actions/comments.js
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export async function createComment(prevState, formData) {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      success: false,
      error: '请先登录'
    };
  }
  
  const postId = formData.get('postId');
  const content = formData.get('content');
  const parentId = formData.get('parentId');
  
  if (!content || content.length < 5) {
    return {
      success: false,
      error: '评论至少5个字符'
    };
  }
  
  const comment = await db.comments.create({
    data: {
      content,
      postId,
      authorId: user.id,
      parentId: parentId || null
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
  
  revalidatePath(`/posts/${postId}`);
  
  return {
    success: true,
    comment
  };
}

// app/posts/[id]/CommentForm.jsx
'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createComment } from './actions';

export default function CommentForm({ postId, parentId = null, onSuccess }) {
  const formRef = useRef(null);
  
  const [state, formAction, isPending] = useActionState(
    createComment,
    { success: false }
  );
  
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.success, onSuccess]);
  
  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      {parentId && (
        <input type="hidden" name="parentId" value={parentId} />
      )}
      
      <textarea
        name="content"
        placeholder={parentId ? '回复...' : '写下你的评论...'}
        required
        minLength={5}
      />
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {state.success && (
        <div className="success">评论已发布！</div>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布评论'}
      </button>
    </form>
  );
}
```

## 第三部分：电商结账流程

### 3.1 购物车

```javascript
// app/actions/cart.js
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export async function addToCart(prevState, formData) {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      success: false,
      error: '请先登录'
    };
  }
  
  const productId = formData.get('productId');
  const quantity = Number(formData.get('quantity'));
  
  if (!productId || quantity < 1) {
    return {
      success: false,
      error: '无效的商品或数量'
    };
  }
  
  const product = await db.products.findUnique({
    where: { id: productId }
  });
  
  if (!product || product.stock < quantity) {
    return {
      success: false,
      error: '商品库存不足'
    };
  }
  
  await db.cartItems.upsert({
    where: {
      userId_productId: {
        userId: user.id,
        productId
      }
    },
    create: {
      userId: user.id,
      productId,
      quantity
    },
    update: {
      quantity: {
        increment: quantity
      }
    }
  });
  
  revalidatePath('/cart');
  
  return {
    success: true,
    message: '已添加到购物车'
  };
}

export async function updateCartItem(prevState, formData) {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      success: false,
      error: '请先登录'
    };
  }
  
  const itemId = formData.get('itemId');
  const quantity = Number(formData.get('quantity'));
  
  if (quantity < 1) {
    await db.cartItems.delete({
      where: { id: itemId, userId: user.id }
    });
  } else {
    await db.cartItems.update({
      where: { id: itemId, userId: user.id },
      data: { quantity }
    });
  }
  
  revalidatePath('/cart');
  
  return { success: true };
}
```

### 3.2 结账表单

```javascript
// app/actions/checkout.js
'use server';

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { processPayment } from '@/lib/payment';

export async function checkout(prevState, formData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login?redirect=/checkout');
  }
  
  const cartItems = await db.cartItems.findMany({
    where: { userId: user.id },
    include: { product: true }
  });
  
  if (cartItems.length === 0) {
    return {
      success: false,
      error: '购物车为空'
    };
  }
  
  const shippingAddress = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    city: formData.get('city'),
    zipCode: formData.get('zipCode')
  };
  
  const errors = {};
  
  if (!shippingAddress.name) errors.name = '请输入收件人姓名';
  if (!shippingAddress.phone) errors.phone = '请输入联系电话';
  if (!shippingAddress.address) errors.address = '请输入详细地址';
  
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors
    };
  }
  
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const order = await db.orders.create({
    data: {
      userId: user.id,
      total,
      shippingAddress: JSON.stringify(shippingAddress),
      status: 'pending',
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }))
      }
    }
  });
  
  try {
    await processPayment({
      orderId: order.id,
      amount: total,
      paymentMethod: formData.get('paymentMethod')
    });
    
    await db.orders.update({
      where: { id: order.id },
      data: { status: 'paid' }
    });
    
    await db.cartItems.deleteMany({
      where: { userId: user.id }
    });
    
    redirect(`/orders/${order.id}/success`);
  } catch (error) {
    return {
      success: false,
      error: '支付失败，请重试'
    };
  }
}
```

## 第四部分：搜索和过滤

### 4.1 搜索表单

```javascript
// app/search/page.jsx
import { db } from '@/lib/database';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

async function searchProducts(query, filters = {}) {
  const where = {};
  
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } }
    ];
  }
  
  if (filters.category) {
    where.categoryId = filters.category;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
  }
  
  const products = await db.products.findMany({
    where,
    take: 50
  });
  
  return products;
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  const filters = {
    category: searchParams.category,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice
  };
  
  const products = await searchProducts(query, filters);
  
  return (
    <div className="search-page">
      <SearchForm initialQuery={query} initialFilters={filters} />
      <SearchResults products={products} query={query} />
    </div>
  );
}

// app/search/SearchForm.jsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchForm({ initialQuery, initialFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const params = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
      if (value) {
        params.set(key, value);
      }
    }
    
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="q"
        defaultValue={initialQuery}
        placeholder="搜索商品..."
      />
      
      <select name="category" defaultValue={initialFilters.category}>
        <option value="">所有分类</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
        <option value="books">图书</option>
      </select>
      
      <input
        name="minPrice"
        type="number"
        placeholder="最低价格"
        defaultValue={initialFilters.minPrice}
      />
      
      <input
        name="maxPrice"
        type="number"
        placeholder="最高价格"
        defaultValue={initialFilters.maxPrice}
      />
      
      <button type="submit">搜索</button>
    </form>
  );
}
```

## 注意事项

### 1. 安全性

```javascript
// ✅ 始终验证权限
const user = await getCurrentUser();
if (!user) {
  throw new Error('未登录');
}

// ✅ 验证输入
if (!title || title.length < 3) {
  return { error: '标题至少3个字符' };
}

// ✅ 防止SQL注入（使用ORM）
await db.posts.findMany({
  where: {
    title: { contains: query }
  }
});
```

### 2. 用户体验

```javascript
// ✅ 提供即时反馈
if (state.success) {
  return <div className="success">操作成功！</div>;
}

// ✅ 显示加载状态
<button disabled={isPending}>
  {isPending ? '处理中...' : '提交'}
</button>

// ✅ 保留用户输入
<input defaultValue={state.fields?.name} />
```

### 3. 性能优化

```javascript
// ✅ 使用revalidatePath更新缓存
revalidatePath('/posts');

// ✅ 只查询需要的字段
await db.users.findUnique({
  select: {
    id: true,
    name: true,
    avatar: true
  }
});
```

## 常见问题

### Q1: 如何处理大文件上传？

**A:** 使用云存储服务（S3、OSS等），分块上传，显示进度。

### Q2: 如何实现实时搜索？

**A:** 客户端防抖 + Server Action，或使用API路由。

### Q3: 表单提交后如何保持滚动位置？

**A:** 使用URL hash或保存滚动位置到sessionStorage。

## 总结

### 实战要点

```
✅ 完善的认证系统
✅ 数据验证
✅ 错误处理
✅ 文件上传
✅ 权限控制
✅ 缓存管理
✅ 用户体验优化
✅ 性能优化
```

### 开发流程

```
1. 设计数据模型
2. 创建Server Actions
3. 实现表单UI
4. 添加验证
5. 处理错误
6. 优化体验
7. 测试功能
8. 部署上线
```

通过这些实战案例，你应该能够构建完整的Form Actions应用了！
