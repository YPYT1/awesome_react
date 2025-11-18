# useFormStatus表单状态

## 学习目标

通过本章学习，你将掌握：

- useFormStatus的用法
- 获取表单提交状态
- 创建智能提交按钮
- 表单加载指示器
- 与useActionState的配合
- 实战应用模式
- 性能优化
- 常见问题解决

## 第一部分：基础概念

### 1.1 什么是useFormStatus

`useFormStatus`是React 19提供的Hook，用于获取**父级表单**的提交状态。它必须在表单的子组件中调用。

```jsx
'use client';

import { useFormStatus } from 'react-dom';

// ✅ 必须在表单的子组件中
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

function MyForm() {
  return (
    <form action={submitAction}>
      <input name="username" />
      <SubmitButton />  {/* ← 在这里使用 */}
    </form>
  );
}

// ❌ 错误：在表单组件本身中调用
function BadForm() {
  const { pending } = useFormStatus();  // 无效！
  
  return (
    <form action={submitAction}>
      <input name="username" />
      <button type="submit">{pending ? '...' : 'Submit'}</button>
    </form>
  );
}
```

### 1.2 返回值

```typescript
interface FormStatus {
  pending: boolean;    // 表单是否正在提交
  data: FormData | null;  // 提交的FormData
  method: string | null;  // 提交方法（'get' | 'post'）
  action: string | ((formData: FormData) => void) | null;  // action
}

const status = useFormStatus();

// status.pending: 布尔值，表示表单是否正在提交
// status.data: FormData对象（提交中）或null（未提交）
// status.method: 提交方法，通常是'post'
// status.action: 表单的action（URL或函数）
```

### 1.3 基本用法

```jsx
'use server';

async function submitForm(formData) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const name = formData.get('name');
  return { success: true, name };
}

// Client Component
'use client';

import { useFormStatus } from 'react-dom';
import { submitForm } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

function MyForm() {
  return (
    <form action={submitForm}>
      <input name="name" placeholder="姓名" />
      <SubmitButton />
    </form>
  );
}
```

## 第二部分：智能提交按钮

### 2.1 基础提交按钮

```jsx
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton({ children = '提交', loadingText = '提交中...' }) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={pending ? 'loading' : ''}
    >
      {pending ? loadingText : children}
    </button>
  );
}

// 使用
<form action={submitAction}>
  <input name="email" />
  <SubmitButton>订阅</SubmitButton>
</form>
```

### 2.2 带图标的提交按钮

```jsx
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Spinner className="animate-spin" />
          <span>处理中...</span>
        </>
      ) : (
        <>
          <SendIcon />
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

// Spinner组件
function Spinner({ className }) {
  return (
    <svg 
      className={className}
      width="20" 
      height="20" 
      viewBox="0 0 20 20"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray="50"
        strokeDashoffset="25"
      />
    </svg>
  );
}
```

### 2.3 进度百分比按钮

```jsx
'use client';

import { useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';

function ProgressButton({ children }) {
  const { pending } = useFormStatus();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (pending) {
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [pending]);
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="progress-button"
      style={{
        '--progress': `${progress}%`
      }}
    >
      {pending ? `${progress}%` : children}
    </button>
  );
}

/* CSS */
.progress-button {
  position: relative;
  overflow: hidden;
}

.progress-button::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: var(--progress);
  background: rgba(0, 123, 255, 0.2);
  transition: width 0.2s;
}
```

### 2.4 多个提交按钮

```jsx
'use server';

async function handleAction(formData) {
  const action = formData.get('action');
  
  if (action === 'save') {
    // 保存草稿
    await saveDraft(formData);
    return { message: '已保存草稿' };
  }
  
  if (action === 'publish') {
    // 发布
    await publish(formData);
    return { message: '已发布' };
  }
}

// Client Component
'use client';

function SaveButton() {
  const { pending, data } = useFormStatus();
  const isSaving = pending && data?.get('action') === 'save';
  
  return (
    <button
      type="submit"
      name="action"
      value="save"
      disabled={pending}
    >
      {isSaving ? '保存中...' : '保存草稿'}
    </button>
  );
}

function PublishButton() {
  const { pending, data } = useFormStatus();
  const isPublishing = pending && data?.get('action') === 'publish';
  
  return (
    <button
      type="submit"
      name="action"
      value="publish"
      disabled={pending}
    >
      {isPublishing ? '发布中...' : '发布'}
    </button>
  );
}

function PostForm() {
  return (
    <form action={handleAction}>
      <input name="title" placeholder="标题" />
      <textarea name="content" placeholder="内容" />
      
      <div className="actions">
        <SaveButton />
        <PublishButton />
      </div>
    </form>
  );
}
```

## 第三部分：表单加载指示器

### 3.1 全局加载指示器

```jsx
'use client';

import { useFormStatus } from 'react-dom';

function FormLoadingIndicator() {
  const { pending } = useFormStatus();
  
  if (!pending) return null;
  
  return (
    <div className="form-loading-overlay">
      <div className="spinner" />
      <p>正在处理...</p>
    </div>
  );
}

function MyForm() {
  return (
    <form action={submitAction} className="relative">
      <FormLoadingIndicator />
      
      <input name="field1" />
      <input name="field2" />
      <button type="submit">提交</button>
    </form>
  );
}

/* CSS */
.form-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
```

### 3.2 字段禁用

```jsx
'use client';

import { useFormStatus } from 'react-dom';

function FormFields() {
  const { pending } = useFormStatus();
  
  return (
    <>
      <input 
        name="username" 
        placeholder="用户名"
        disabled={pending}
      />
      
      <input 
        name="email" 
        type="email"
        placeholder="邮箱"
        disabled={pending}
      />
      
      <textarea 
        name="bio"
        placeholder="个人简介"
        disabled={pending}
      />
    </>
  );
}

function ProfileForm() {
  return (
    <form action={updateProfile}>
      <FormFields />
      <SubmitButton>更新</SubmitButton>
    </form>
  );
}
```

### 3.3 进度条

```jsx
'use client';

import { useFormStatus } from 'react-dom';

function ProgressBar() {
  const { pending } = useFormStatus();
  
  return (
    <div className="progress-bar-container">
      <div 
        className={`progress-bar ${pending ? 'active' : ''}`}
      />
    </div>
  );
}

function MyForm() {
  return (
    <div>
      <ProgressBar />
      
      <form action={submitAction}>
        <input name="data" />
        <SubmitButton />
      </form>
    </div>
  );
}

/* CSS */
.progress-bar-container {
  height: 3px;
  background: #f0f0f0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 0;
  background: #007bff;
  transition: width 0.3s ease;
}

.progress-bar.active {
  width: 100%;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0; }
  50% { width: 70%; }
  100% { width: 100%; }
}
```

## 第四部分：与useActionState配合

### 4.1 完整表单示例

```jsx
'use server';

export async function submitContact(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  // 验证
  const errors = {};
  
  if (!name) errors.name = '请输入姓名';
  if (!email) errors.email = '请输入邮箱';
  if (!message) errors.message = '请输入留言';
  
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }
  
  // 模拟提交
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 保存数据
  await db.contacts.create({
    data: { name, email, message }
  });
  
  return { 
    success: true, 
    message: '感谢您的留言！我们会尽快回复。' 
  };
}

// Client Component
'use client';

import { useActionState, useFormStatus } from 'react';
import { submitContact } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="submit-button"
    >
      {pending ? (
        <>
          <Spinner />
          <span>发送中...</span>
        </>
      ) : (
        <>
          <SendIcon />
          <span>发送留言</span>
        </>
      )}
    </button>
  );
}

function FormFields() {
  const { pending } = useFormStatus();
  
  return (
    <>
      <div>
        <label>姓名</label>
        <input 
          name="name" 
          required 
          disabled={pending}
        />
      </div>
      
      <div>
        <label>邮箱</label>
        <input 
          name="email" 
          type="email" 
          required 
          disabled={pending}
        />
      </div>
      
      <div>
        <label>留言</label>
        <textarea 
          name="message" 
          required 
          disabled={pending}
        />
      </div>
    </>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, {
    success: false,
    errors: {}
  });
  
  return (
    <form action={formAction} className="contact-form">
      <FormFields />
      
      {state.errors.name && (
        <p className="error">{state.errors.name}</p>
      )}
      {state.errors.email && (
        <p className="error">{state.errors.email}</p>
      )}
      {state.errors.message && (
        <p className="error">{state.errors.message}</p>
      )}
      
      {state.success && (
        <div className="success">{state.message}</div>
      )}
      
      <SubmitButton />
    </form>
  );
}
```

### 4.2 实时验证

```jsx
'use client';

import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function EmailField() {
  const { pending } = useFormStatus();
  const [error, setError] = useState('');
  
  const handleBlur = (e) => {
    const email = e.target.value;
    
    if (!email.includes('@')) {
      setError('邮箱格式不正确');
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
        disabled={pending}
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

## 注意事项

### 1. 必须在表单子组件中调用

```jsx
// ❌ 错误：在表单组件本身
function BadForm() {
  const { pending } = useFormStatus();  // 无效！
  
  return (
    <form action={submitAction}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ 正确：在子组件中
function SubmitButton() {
  const { pending } = useFormStatus();  // 有效
  return <button disabled={pending}>Submit</button>;
}

function GoodForm() {
  return (
    <form action={submitAction}>
      <SubmitButton />
    </form>
  );
}
```

### 2. pending只在提交期间为true

```jsx
// pending状态：
// - 表单提交前：false
// - 提交中：true
// - 提交完成：false

function SubmitButton() {
  const { pending } = useFormStatus();
  
  console.log('pending:', pending);
  // 只有在实际提交时才为true
  
  return <button type="submit">{pending ? 'Loading...' : 'Submit'}</button>;
}
```

### 3. 嵌套表单

```jsx
// 每个表单独立跟踪
function NestedForms() {
  return (
    <div>
      <form action={action1}>
        <SubmitButton1 />  {/* 只跟踪action1 */}
      </form>
      
      <form action={action2}>
        <SubmitButton2 />  {/* 只跟踪action2 */}
      </form>
    </div>
  );
}
```

## 常见问题

### Q1: useFormStatus和useActionState的pending有什么区别？

**A:**
- `useFormStatus`: 必须在表单子组件中，跟踪表单提交状态
- `useActionState`: 返回的isPending，跟踪特定action的状态

### Q2: 如何在表单外使用pending状态？

**A:** 使用useActionState返回的isPending。

### Q3: pending什么时候变为true？

**A:** 表单开始提交时（action函数开始执行）。

### Q4: 可以在多个子组件中使用useFormStatus吗？

**A:** 可以，它们都会获得相同的状态。

## 总结

### useFormStatus核心价值

```
✅ 简化提交状态管理
✅ 创建智能提交按钮
✅ 提供加载反馈
✅ 禁用表单字段
✅ 支持多个提交按钮
✅ 组件级别复用
```

### 最佳实践

```
1. 在子组件中调用
2. 创建可复用的提交按钮
3. 提供清晰的加载状态
4. pending时禁用表单
5. 显示进度指示器
6. 处理多个提交按钮
7. 配合useActionState使用
```

### 常见模式

```
✅ 智能提交按钮
✅ 表单加载覆盖层
✅ 字段禁用
✅ 进度条
✅ 多按钮表单
✅ 实时验证
```

useFormStatus是创建用户友好表单的关键工具！
