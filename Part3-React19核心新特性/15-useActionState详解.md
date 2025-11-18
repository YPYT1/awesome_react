# useActionState详解

## 学习目标

通过本章学习，你将掌握：

- useActionState（原useFormState）的用法
- 表单状态管理
- 错误处理机制
- 乐观更新
- 与Server Actions的集成
- 多步表单实现
- 实战应用模式
- 性能优化技巧

## 第一部分：基础概念

### 1.1 什么是useActionState

`useActionState`（React 19中从`useFormState`重命名）是用于管理Server Actions状态的Hook。它跟踪action的执行状态、返回值和错误。

```jsx
'use client';

import { useActionState } from 'react';
import { submitForm } from './actions';

function Form() {
  // useActionState返回[state, action, isPending]
  const [state, formAction, isPending] = useActionState(
    submitForm,     // Server Action
    { message: '' } // 初始状态
  );
  
  return (
    <form action={formAction}>
      <input name="data" />
      
      {state.message && (
        <div>{state.message}</div>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

### 1.2 基本语法

```typescript
const [state, action, isPending] = useActionState(
  actionFunction,  // Server Action函数
  initialState,    // 初始状态
  permalink?       // 可选：永久链接（用于渐进增强）
);

// 参数：
// - actionFunction: Server Action，签名为 (prevState, formData) => newState
// - initialState: 初始状态对象
// - permalink: 可选，表单提交的URL（JavaScript禁用时使用）

// 返回值：
// - state: 当前状态（action的返回值）
// - action: 包装后的action函数
// - isPending: 布尔值，表示action是否正在执行
```

### 1.3 工作流程

```jsx
// Server Action
'use server';

export async function submitComment(prevState, formData) {
  const content = formData.get('content');
  
  // 1. 验证输入
  if (!content || content.length < 5) {
    return {
      success: false,
      error: '评论至少5个字符',
      fields: { content }
    };
  }
  
  try {
    // 2. 处理数据
    const comment = await db.comments.create({
      data: { content }
    });
    
    // 3. 返回新状态
    return {
      success: true,
      comment,
      message: '评论已发布！'
    };
  } catch (error) {
    // 4. 错误处理
    return {
      success: false,
      error: '发布失败，请重试'
    };
  }
}

// Client Component
'use client';

import { useActionState } from 'react';
import { submitComment } from './actions';

function CommentForm() {
  const [state, formAction, isPending] = useActionState(
    submitComment,
    { success: false, error: null }
  );
  
  return (
    <form action={formAction}>
      <textarea 
        name="content"
        defaultValue={state.fields?.content}
      />
      
      {/* 显示错误 */}
      {state.error && (
        <div className="error">{state.error}</div>
      )}
      
      {/* 显示成功消息 */}
      {state.success && (
        <div className="success">{state.message}</div>
      )}
      
      {/* pending状态 */}
      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布评论'}
      </button>
    </form>
  );
}

// 流程：
// 1. 用户提交表单
// 2. isPending变为true
// 3. submitComment执行（接收prevState和formData）
// 4. 返回新的state
// 5. isPending变为false
// 6. 组件用新state重新渲染
```

## 第二部分：状态管理模式

### 2.1 简单状态

```jsx
// Server Action
'use server';

export async function subscribe(prevState, formData) {
  const email = formData.get('email');
  
  if (!email || !email.includes('@')) {
    return { error: '邮箱格式不正确' };
  }
  
  await db.subscribers.create({ data: { email } });
  
  return { success: true, message: '订阅成功！' };
}

// Client Component
'use client';

function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribe, {});
  
  return (
    <form action={formAction}>
      <input 
        name="email" 
        type="email" 
        placeholder="your@email.com"
        required
      />
      
      {state.error && <span className="error">{state.error}</span>}
      {state.success && <span className="success">{state.message}</span>}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '订阅中...' : '订阅'}
      </button>
    </form>
  );
}
```

### 2.2 复杂状态

```jsx
// Server Action
'use server';

export async function createPost(prevState, formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const tags = formData.get('tags')?.split(',').map(t => t.trim()) || [];
  
  // 构建详细的状态对象
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
      errors,
      fields: { title, content, tags: tags.join(', ') },
      timestamp: Date.now()
    };
  }
  
  try {
    const post = await db.posts.create({
      data: { title, content, tags }
    });
    
    return {
      success: true,
      post,
      message: '文章已发布！',
      redirect: `/posts/${post.id}`,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      success: false,
      errors: { submit: '发布失败，请重试' },
      fields: { title, content, tags: tags.join(', ') },
      timestamp: Date.now()
    };
  }
}

// Client Component
'use client';

function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, {
    success: false,
    errors: {},
    fields: {}
  });
  
  // 成功后重定向
  useEffect(() => {
    if (state.success && state.redirect) {
      router.push(state.redirect);
    }
  }, [state.success, state.redirect]);
  
  return (
    <form action={formAction}>
      <div>
        <label>标题</label>
        <input 
          name="title"
          defaultValue={state.fields.title}
        />
        {state.errors.title && (
          <span className="error">{state.errors.title}</span>
        )}
      </div>
      
      <div>
        <label>内容</label>
        <textarea 
          name="content"
          defaultValue={state.fields.content}
        />
        {state.errors.content && (
          <span className="error">{state.errors.content}</span>
        )}
      </div>
      
      <div>
        <label>标签</label>
        <input 
          name="tags"
          defaultValue={state.fields.tags}
          placeholder="React, TypeScript"
        />
      </div>
      
      {state.errors.submit && (
        <div className="error">{state.errors.submit}</div>
      )}
      
      {state.success && (
        <div className="success">{state.message}</div>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布'}
      </button>
    </form>
  );
}
```

### 2.3 累积状态

```jsx
// Server Action - 追加数据到列表
'use server';

export async function addTodo(prevState, formData) {
  const text = formData.get('text');
  
  if (!text || text.trim().length === 0) {
    return {
      ...prevState,
      error: '请输入待办事项'
    };
  }
  
  const newTodo = await db.todos.create({
    data: { text, completed: false }
  });
  
  return {
    todos: [...prevState.todos, newTodo],
    error: null
  };
}

// Client Component
'use client';

function TodoList({ initialTodos }) {
  const [state, formAction, isPending] = useActionState(
    addTodo,
    { todos: initialTodos, error: null }
  );
  
  return (
    <div>
      <form action={formAction}>
        <input name="text" placeholder="新增待办..." />
        
        {state.error && (
          <span className="error">{state.error}</span>
        )}
        
        <button type="submit" disabled={isPending}>
          {isPending ? '添加中...' : '添加'}
        </button>
      </form>
      
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 第三部分：高级用法

### 3.1 多步表单

```jsx
// Server Action
'use server';

export async function handleMultiStepForm(prevState, formData) {
  const step = Number(formData.get('step'));
  
  switch (step) {
    case 1:
      const email = formData.get('email');
      if (!email || !email.includes('@')) {
        return {
          ...prevState,
          step: 1,
          errors: { email: '邮箱格式不正确' }
        };
      }
      
      return {
        step: 2,
        data: { email },
        errors: {}
      };
    
    case 2:
      const password = formData.get('password');
      if (!password || password.length < 8) {
        return {
          ...prevState,
          step: 2,
          errors: { password: '密码至少8个字符' }
        };
      }
      
      return {
        step: 3,
        data: { ...prevState.data, password },
        errors: {}
      };
    
    case 3:
      const name = formData.get('name');
      if (!name) {
        return {
          ...prevState,
          step: 3,
          errors: { name: '请输入姓名' }
        };
      }
      
      // 最后一步：保存数据
      const user = await db.users.create({
        data: {
          ...prevState.data,
          name
        }
      });
      
      return {
        step: 'complete',
        user,
        errors: {}
      };
    
    default:
      return prevState;
  }
}

// Client Component
'use client';

function MultiStepForm() {
  const [state, formAction, isPending] = useActionState(
    handleMultiStepForm,
    { step: 1, data: {}, errors: {} }
  );
  
  if (state.step === 'complete') {
    return (
      <div className="success">
        <h2>注册成功！</h2>
        <p>欢迎, {state.user.name}</p>
      </div>
    );
  }
  
  return (
    <form action={formAction}>
      <input type="hidden" name="step" value={state.step} />
      
      {/* 进度指示器 */}
      <div className="steps">
        <span className={state.step >= 1 ? 'active' : ''}>1. 邮箱</span>
        <span className={state.step >= 2 ? 'active' : ''}>2. 密码</span>
        <span className={state.step >= 3 ? 'active' : ''}>3. 姓名</span>
      </div>
      
      {/* 步骤1 */}
      {state.step === 1 && (
        <div>
          <h3>步骤 1: 邮箱</h3>
          <input 
            name="email" 
            type="email"
            defaultValue={state.data.email}
          />
          {state.errors.email && (
            <span className="error">{state.errors.email}</span>
          )}
        </div>
      )}
      
      {/* 步骤2 */}
      {state.step === 2 && (
        <div>
          <h3>步骤 2: 密码</h3>
          <input 
            name="password" 
            type="password"
          />
          {state.errors.password && (
            <span className="error">{state.errors.password}</span>
          )}
        </div>
      )}
      
      {/* 步骤3 */}
      {state.step === 3 && (
        <div>
          <h3>步骤 3: 姓名</h3>
          <input 
            name="name"
            defaultValue={state.data.name}
          />
          {state.errors.name && (
            <span className="error">{state.errors.name}</span>
          )}
        </div>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '处理中...' : state.step === 3 ? '完成' : '下一步'}
      </button>
    </form>
  );
}
```

### 3.2 乐观更新

```jsx
// Server Action
'use server';

export async function likePost(prevState, formData) {
  const postId = formData.get('postId');
  
  await db.likes.create({
    data: { postId, userId: await getCurrentUserId() }
  });
  
  const newCount = await db.likes.count({
    where: { postId }
  });
  
  return { likes: newCount };
}

// Client Component
'use client';

import { useActionState, useOptimistic } from 'react';

function LikeButton({ postId, initialLikes }) {
  const [state, formAction, isPending] = useActionState(
    likePost,
    { likes: initialLikes }
  );
  
  // 乐观更新
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    state.likes,
    (currentLikes) => currentLikes + 1
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 立即更新UI
    setOptimisticLikes();
    
    // 提交表单
    const formData = new FormData(e.target);
    formAction(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="postId" value={postId} />
      <button type="submit" disabled={isPending}>
        ❤️ {optimisticLikes}
      </button>
    </form>
  );
}
```

### 3.3 表单重置

```jsx
'use client';

import { useActionState, useRef, useEffect } from 'react';

function CommentForm({ postId }) {
  const formRef = useRef(null);
  
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await submitComment(formData);
      return result;
    },
    { success: false }
  );
  
  // 成功后重置表单
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);
  
  return (
    <form ref={formRef} action={formAction}>
      <textarea name="content" required />
      
      {state.success && (
        <div className="success">评论已发布！</div>
      )}
      
      <button type="submit" disabled={isPending}>
        发布
      </button>
    </form>
  );
}
```

## 注意事项

### 1. Server Action签名

```jsx
// ✅ 正确：接收prevState和formData
'use server';

export async function myAction(prevState, formData) {
  // prevState: 上一次的状态
  // formData: FormData对象
  
  return { newState: 'value' };
}

// ❌ 错误：签名不匹配
export async function badAction(formData) {
  // 缺少prevState参数
  return { newState: 'value' };
}
```

### 2. 状态不可变性

```jsx
// ❌ 错误：直接修改prevState
export async function badAction(prevState, formData) {
  prevState.items.push(newItem);  // 错误！
  return prevState;
}

// ✅ 正确：返回新对象
export async function goodAction(prevState, formData) {
  return {
    ...prevState,
    items: [...prevState.items, newItem]
  };
}
```

### 3. 渐进增强

```jsx
// 使用permalink参数支持渐进增强
'use client';

function Form() {
  const [state, formAction, isPending] = useActionState(
    submitForm,
    { message: '' },
    '/submit-form'  // JavaScript禁用时的fallback URL
  );
  
  return (
    <form action={formAction}>
      <input name="data" />
      <button type="submit">提交</button>
    </form>
  );
}
```

## 常见问题

### Q1: useActionState和useState有什么区别？

**A:**
- `useActionState`: 专门用于Server Actions，自动管理pending状态
- `useState`: 通用状态管理，需要手动处理异步

### Q2: 如何在action中访问之前的所有状态？

**A:** `prevState`参数包含上一次action返回的完整状态。

### Q3: isPending和useFormStatus的pending有什么区别？

**A:**
- `isPending`: useActionState返回，只跟踪当前action
- `useFormStatus().pending`: 跟踪表单内任何提交按钮

### Q4: 可以在同一个表单中使用多个useActionState吗？

**A:** 不推荐。一个表单通常对应一个action。

## 总结

### useActionState核心价值

```
✅ 自动状态管理
✅ 内置pending状态
✅ 错误处理简化
✅ 支持乐观更新
✅ 渐进增强
✅ 类型安全
```

### 最佳实践

```
1. 使用详细的状态对象
2. 保持状态不可变
3. 提供清晰的错误消息
4. 实现表单重置
5. 考虑乐观更新
6. 支持渐进增强
7. 合理使用prevState
```

useActionState是React 19表单处理的核心Hook！
