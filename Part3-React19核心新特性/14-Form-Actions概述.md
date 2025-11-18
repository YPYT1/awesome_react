# Form Actions概述

## 学习目标

通过本章学习，你将掌握：

- Form Actions的核心概念
- 与传统表单处理的区别
- Form Actions的工作原理
- 基本使用方法
- 与Server Actions的关系
- 表单状态管理
- 渐进增强特性
- 实际应用场景

## 第一部分：什么是Form Actions

### 1.1 基本概念

Form Actions是React 19引入的表单处理新特性，允许将**异步函数直接作为表单的action属性**，简化表单提交和状态管理。

```jsx
// ========== 传统表单处理 ==========
function TraditionalForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.target);
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('提交失败');
      }
      
      const data = await response.json();
      // 处理成功...
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '提交'}
      </button>
    </form>
  );
}


// ========== Form Actions方式 ==========
'use server';

async function submitForm(formData) {
  const email = formData.get('email');
  
  // 处理表单数据
  await saveToDatabase(email);
  
  return { success: true };
}

function ModernForm() {
  return (
    <form action={submitForm}>
      <input name="email" type="email" required />
      <button type="submit">提交</button>
    </form>
  );
}

// 优势：
// ✅ 代码更简洁
// ✅ 自动处理加载状态
// ✅ 支持渐进增强
// ✅ 原生表单行为
```

### 1.2 核心特性

**1. 异步action支持**

```jsx
'use server';

async function handleSubmit(formData) {
  // 可以直接在这里执行异步操作
  await new Promise(resolve => setTimeout(resolve, 1000));
  const email = formData.get('email');
  await sendEmail(email);
  return { success: true };
}

function Form() {
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">提交</button>
    </form>
  );
}

// React会自动：
// - 禁用提交按钮
// - 等待异步操作完成
// - 处理错误
// - 更新UI
```

**2. 自动FormData处理**

```jsx
'use server';

async function createUser(formData) {
  // formData会自动传递给action
  const name = formData.get('name');
  const email = formData.get('email');
  const age = Number(formData.get('age'));
  
  const user = await db.users.create({
    data: { name, email, age }
  });
  
  return { success: true, user };
}

function SignupForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <input name="age" type="number" required />
      <button type="submit">注册</button>
    </form>
  );
}

// 无需手动创建FormData
// 无需手动序列化数据
```

**3. 渐进增强**

```jsx
'use server';

async function submitForm(formData) {
  const data = formData.get('data');
  await processData(data);
  return { success: true };
}

function ProgressiveForm() {
  return (
    <form action={submitForm}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}

// 工作方式：
// - JavaScript启用：通过XHR/Fetch异步提交
// - JavaScript禁用：标准表单POST提交
// - 两种情况下都能工作！
```

## 第二部分：Form Actions与Server Actions

### 2.1 关系说明

```jsx
// Form Actions 就是 Server Actions 的特殊用法
// Server Actions：可以在任何地方调用的服务器函数
// Form Actions：用作表单action属性的Server Actions

// ========== Server Action ==========
'use server';

export async function updateProfile(formData) {
  const name = formData.get('name');
  await db.users.update({ name });
}

// ========== 用作Form Action ==========
function ProfileForm() {
  return (
    <form action={updateProfile}>  {/* ← Form Action */}
      <input name="name" />
      <button type="submit">更新</button>
    </form>
  );
}

// ========== 也可以手动调用 ==========
function OtherComponent() {
  const handleClick = async () => {
    const formData = new FormData();
    formData.set('name', 'New Name');
    
    await updateProfile(formData);  // ← Server Action
  };
  
  return <button onClick={handleClick}>更新</button>;
}
```

### 2.2 action属性的演进

```jsx
// ========== 传统HTML表单 ==========
<form action="/api/submit" method="POST">
  <input name="data" />
  <button type="submit">提交</button>
</form>

// → 页面刷新
// → 导航到action URL


// ========== React 早期（受控组件） ==========
function EarlyReactForm() {
  const [data, setData] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 处理数据
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={data}
        onChange={e => setData(e.target.value)}
      />
      <button type="submit">提交</button>
    </form>
  );
}

// → 阻止默认行为
// → 手动处理提交


// ========== React 19（Form Actions） ==========
'use server';

async function handleSubmit(formData) {
  const data = formData.get('data');
  await processData(data);
}

function ModernForm() {
  return (
    <form action={handleSubmit}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}

// → 异步提交
// → 自动状态管理
// → 渐进增强
```

## 第三部分：基础用法

### 3.1 最简单的Form Action

```jsx
// actions.js
'use server';

export async function submitContact(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  // 保存到数据库
  await db.contacts.create({
    data: { name, email, message }
  });
  
  return { success: true };
}

// ContactForm.jsx
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

### 3.2 带状态反馈的Form Action

```jsx
'use server';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  // 验证
  if (!title || title.length < 3) {
    return {
      success: false,
      error: '标题至少3个字符'
    };
  }
  
  try {
    const post = await db.posts.create({
      data: { title, content }
    });
    
    return {
      success: true,
      post
    };
  } catch (error) {
    return {
      success: false,
      error: '创建失败，请重试'
    };
  }
}

// 使用useFormState获取状态
'use client';

import { useFormState } from 'react-dom';
import { createPost } from './actions';

function PostForm() {
  const [state, formAction] = useFormState(createPost, {
    success: false,
    error: null
  });
  
  return (
    <form action={formAction}>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {state.success && (
        <div className="success">发布成功！</div>
      )}
      
      <button type="submit">发布</button>
    </form>
  );
}
```

### 3.3 获取提交状态

```jsx
'use server';

export async function processPayment(formData) {
  const amount = formData.get('amount');
  
  // 模拟处理
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await chargePayment(amount);
  
  return { success: true };
}

// 使用useFormStatus获取pending状态
'use client';

import { useFormStatus } from 'react-dom';
import { processPayment } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '处理中...' : '确认支付'}
    </button>
  );
}

function PaymentForm() {
  return (
    <form action={processPayment}>
      <input 
        name="amount" 
        type="number" 
        placeholder="金额"
        required
      />
      
      <SubmitButton />
    </form>
  );
}
```

## 第四部分：高级特性

### 4.1 带参数的Form Action

```jsx
'use server';

export async function updateUser(userId, formData) {
  const name = formData.get('name');
  
  await db.users.update({
    where: { id: userId },
    data: { name }
  });
}

// 方式1：使用.bind()
'use client';

function UserForm({ userId }) {
  // 绑定userId参数
  const updateWithId = updateUser.bind(null, userId);
  
  return (
    <form action={updateWithId}>
      <input name="name" />
      <button type="submit">更新</button>
    </form>
  );
}

// 方式2：使用hidden input
'use server';

export async function updateUserFromForm(formData) {
  const userId = formData.get('userId');
  const name = formData.get('name');
  
  await db.users.update({
    where: { id: userId },
    data: { name }
  });
}

function UserForm({ userId }) {
  return (
    <form action={updateUserFromForm}>
      <input type="hidden" name="userId" value={userId} />
      <input name="name" />
      <button type="submit">更新</button>
    </form>
  );
}
```

### 4.2 文件上传

```jsx
'use server';

import { writeFile } from 'fs/promises';
import path from 'path';

export async function uploadFile(formData) {
  const file = formData.get('file');
  
  if (!file) {
    return { error: '请选择文件' };
  }
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return { error: '只能上传图片文件' };
  }
  
  // 检查文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    return { error: '文件大小不能超过5MB' };
  }
  
  // 保存文件
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(process.cwd(), 'public/uploads', filename);
  
  await writeFile(filepath, buffer);
  
  return {
    success: true,
    url: `/uploads/${filename}`
  };
}

// 使用
'use client';

import { useFormState } from 'react-dom';
import { uploadFile } from './actions';

function FileUploadForm() {
  const [state, formAction] = useFormState(uploadFile, {});
  
  return (
    <form action={formAction}>
      <input 
        name="file" 
        type="file" 
        accept="image/*"
        required
      />
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {state.success && (
        <div className="success">
          上传成功！
          <img src={state.url} alt="Uploaded" />
        </div>
      )}
      
      <button type="submit">上传</button>
    </form>
  );
}
```

### 4.3 多步表单

```jsx
'use server';

export async function handleMultiStepForm(prevState, formData) {
  const step = Number(formData.get('step'));
  
  if (step === 1) {
    // 验证第一步
    const email = formData.get('email');
    if (!email || !email.includes('@')) {
      return {
        step: 1,
        error: '邮箱格式不正确'
      };
    }
    
    return {
      step: 2,
      data: { email }
    };
  }
  
  if (step === 2) {
    // 验证第二步
    const password = formData.get('password');
    if (!password || password.length < 8) {
      return {
        step: 2,
        error: '密码至少8个字符'
      };
    }
    
    return {
      step: 3,
      data: {
        ...prevState.data,
        password
      }
    };
  }
  
  if (step === 3) {
    // 最后一步：保存数据
    const name = formData.get('name');
    
    const user = await db.users.create({
      data: {
        ...prevState.data,
        name
      }
    });
    
    return {
      step: 'complete',
      user
    };
  }
}

// 使用
'use client';

import { useFormState } from 'react-dom';
import { handleMultiStepForm } from './actions';

function MultiStepForm() {
  const [state, formAction] = useFormState(handleMultiStepForm, {
    step: 1,
    data: {}
  });
  
  if (state.step === 'complete') {
    return <div>注册成功！欢迎 {state.user.name}</div>;
  }
  
  return (
    <form action={formAction}>
      <input type="hidden" name="step" value={state.step} />
      
      {state.step === 1 && (
        <div>
          <h2>步骤 1: 邮箱</h2>
          <input name="email" type="email" required />
        </div>
      )}
      
      {state.step === 2 && (
        <div>
          <h2>步骤 2: 密码</h2>
          <input name="password" type="password" required />
        </div>
      )}
      
      {state.step === 3 && (
        <div>
          <h2>步骤 3: 姓名</h2>
          <input name="name" required />
        </div>
      )}
      
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      <button type="submit">
        {state.step === 3 ? '完成' : '下一步'}
      </button>
    </form>
  );
}
```

## 注意事项

### 1. action必须是Server Action

```jsx
// ❌ 错误：普通函数不能作为action
function BadForm() {
  const handleSubmit = (formData) => {
    console.log(formData);
  };
  
  return (
    <form action={handleSubmit}>  {/* 错误！ */}
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}

// ✅ 正确：必须是Server Action
'use server';

async function handleSubmit(formData) {
  console.log(formData.get('data'));
}

function GoodForm() {
  return (
    <form action={handleSubmit}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 2. 表单必须在Client Component中渲染

```jsx
// ❌ 如果需要交互，表单本身需要是Client Component
// 但action可以是Server Action

// ✅ 正确的组织方式
// actions.js (Server)
'use server';

export async function submitForm(formData) {
  // 处理表单
}

// Form.jsx (Client)
'use client';

import { submitForm } from './actions';

export function Form() {
  return (
    <form action={submitForm}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 3. 注意表单重置

```jsx
'use client';

import { useRef } from 'react';

function Form() {
  const formRef = useRef(null);
  
  const handleAction = async (formData) => {
    await submitForm(formData);
    
    // 提交成功后重置表单
    formRef.current?.reset();
  };
  
  return (
    <form ref={formRef} action={handleAction}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}
```

## 常见问题

### Q1: Form Actions和onSubmit有什么区别？

**A:**
- `action`: 异步Server Action，自动处理状态
- `onSubmit`: 客户端事件处理，需要手动管理状态

### Q2: 可以同时使用action和onSubmit吗？

**A:** 可以，但通常选择其一。onSubmit会在action之前执行。

### Q3: Form Actions支持文件上传吗？

**A:** 支持！FormData会自动包含文件。

### Q4: 如何在提交后显示成功消息？

**A:** 使用useFormState管理表单状态。

## 总结

### Form Actions核心优势

```
✅ 简化表单处理
✅ 自动状态管理
✅ 渐进增强支持
✅ 类型安全
✅ 减少样板代码
✅ 原生表单行为
✅ 服务器端验证
```

### 适用场景

```
✅ 联系表单
✅ 登录注册
✅ 数据创建/更新
✅ 文件上传
✅ 搜索表单
✅ 过滤器
✅ 任何表单提交
```

### 最佳实践

```
1. 使用Server Actions作为action
2. 使用useFormState管理状态
3. 使用useFormStatus显示pending
4. 实现完善的验证
5. 提供清晰的错误消息
6. 支持渐进增强
7. 适当的加载反馈
```

Form Actions让表单处理变得简单而强大！
