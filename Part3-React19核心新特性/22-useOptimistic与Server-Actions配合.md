# useOptimistic与Server Actions配合

## 学习目标

通过本章学习，你将掌握：

- useOptimistic与Server Actions的集成
- 表单乐观更新
- useActionState配合
- useFormStatus配合
- 复杂数据流处理
- 实际应用模式
- 性能优化
- 错误处理策略

## 第一部分：基础集成

### 1.1 简单表单提交

```javascript
// Server Action
'use server';

export async function addComment(formData) {
  const content = formData.get('content');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const comment = await db.comments.create({
    data: { content }
  });
  
  return comment;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { addComment } from './actions';

export default function CommentForm({ postId }) {
  const [comments, setComments] = useState([]);
  
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => [...state, newComment]
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const content = formData.get('content');
    
    // 立即添加乐观评论
    addOptimisticComment({
      id: `temp-${Date.now()}`,
      content,
      pending: true,
      createdAt: new Date()
    });
    
    // 发送到服务器
    const newComment = await addComment(formData);
    
    // 更新实际状态
    setComments(prev => [...prev, newComment]);
    
    // 清空表单
    e.target.reset();
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea name="content" required />
        <button type="submit">发布</button>
      </form>
      
      <div className="comments">
        {optimisticComments.map(comment => (
          <div 
            key={comment.id}
            className={comment.pending ? 'pending' : ''}
          >
            {comment.content}
            {comment.pending && <span>发送中...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 1.2 使用action属性

```javascript
// Server Action
'use server';

export async function likePost(postId, currentLikes) {
  await db.likes.create({
    data: { postId, userId: await getCurrentUserId() }
  });
  
  return currentLikes + 1;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { likePost } from './actions';

export default function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    likes,
    (_, newLikes) => newLikes
  );
  
  const handleSubmit = async (formData) => {
    // 乐观更新
    setOptimisticLikes(likes + 1);
    
    // 调用Server Action
    const newLikes = await likePost(postId, likes);
    
    // 更新实际状态
    setLikes(newLikes);
  };
  
  return (
    <form action={handleSubmit}>
      <button type="submit">
        ❤️ {optimisticLikes}
      </button>
    </form>
  );
}
```

### 1.3 直接调用Server Action

```javascript
// Server Action
'use server';

export async function toggleBookmark(postId, isBookmarked) {
  if (isBookmarked) {
    await db.bookmarks.delete({
      where: {
        userId_postId: {
          userId: await getCurrentUserId(),
          postId
        }
      }
    });
  } else {
    await db.bookmarks.create({
      data: {
        userId: await getCurrentUserId(),
        postId
      }
    });
  }
  
  return !isBookmarked;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { toggleBookmark } from './actions';

export default function BookmarkButton({ postId, initialBookmarked }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    bookmarked,
    (_, newValue) => newValue
  );
  
  const handleClick = async () => {
    // 立即切换UI
    setOptimisticBookmarked(!bookmarked);
    
    try {
      // 调用Server Action
      const newBookmarked = await toggleBookmark(postId, bookmarked);
      
      // 更新实际状态
      setBookmarked(newBookmarked);
    } catch (error) {
      toast.error('操作失败');
    }
  };
  
  return (
    <button onClick={handleClick}>
      {optimisticBookmarked ? '已收藏' : '收藏'}
    </button>
  );
}
```

### 1.4 FormData处理

```javascript
// Server Action
'use server';

export async function updateProfile(formData) {
  const updates = {
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio'),
    avatar: formData.get('avatar')
  };
  
  const user = await db.users.update({
    where: { id: await getCurrentUserId() },
    data: updates
  });
  
  return user;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updateProfile } from './actions';

export default function ProfileForm({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (current, updates) => ({ ...current, ...updates })
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // 从FormData提取数据
    const updates = {
      name: formData.get('name'),
      email: formData.get('email'),
      bio: formData.get('bio')
    };
    
    // 立即更新UI
    setOptimisticUser(updates);
    
    try {
      const updatedUser = await updateProfile(formData);
      setUser(updatedUser);
      toast.success('保存成功');
    } catch (error) {
      toast.error('保存失败');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>姓名</label>
        <input 
          name="name" 
          defaultValue={optimisticUser.name}
          required
        />
      </div>
      
      <div>
        <label>邮箱</label>
        <input 
          name="email" 
          type="email"
          defaultValue={optimisticUser.email}
          required
        />
      </div>
      
      <div>
        <label>简介</label>
        <textarea 
          name="bio"
          defaultValue={optimisticUser.bio}
          rows={4}
        />
      </div>
      
      <button type="submit">保存</button>
    </form>
  );
}
```

## 第二部分：与useActionState集成

### 2.1 完整表单处理

```javascript
// Server Action
'use server';

export async function createPost(prevState, formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  if (!title || title.length < 3) {
    return {
      success: false,
      errors: { title: '标题至少3个字符' }
    };
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const post = await db.posts.create({
    data: { title, content }
  });
  
  return {
    success: true,
    post
  };
}

// Client Component
'use client';

import { useActionState, useOptimistic, useState } from 'react';
import { createPost } from './actions';

export default function PostForm() {
  const [posts, setPosts] = useState([]);
  
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost) => [newPost, ...state]
  );
  
  const [state, formAction, isPending] = useActionState(
    createPost,
    { success: false }
  );
  
  const handleSubmit = async (formData) => {
    const title = formData.get('title');
    const content = formData.get('content');
    
    // 添加乐观文章
    addOptimisticPost({
      id: `temp-${Date.now()}`,
      title,
      content,
      pending: true
    });
    
    // 调用Server Action
    const result = await formAction(formData);
    
    // 如果成功，更新实际状态
    if (result.success) {
      setPosts(prev => [result.post, ...prev]);
    }
  };
  
  return (
    <div>
      <form action={handleSubmit}>
        <input name="title" required />
        <textarea name="content" required />
        
        {state.errors?.title && (
          <span className="error">{state.errors.title}</span>
        )}
        
        <button type="submit" disabled={isPending}>
          {isPending ? '发布中...' : '发布'}
        </button>
      </form>
      
      <div className="posts">
        {optimisticPosts.map(post => (
          <article 
            key={post.id}
            className={post.pending ? 'pending' : ''}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            {post.pending && <span>发布中...</span>}
          </article>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 多步表单

```javascript
// Server Action
'use server';

export async function updateProfile(prevState, formData) {
  const step = Number(formData.get('step'));
  
  if (step === 1) {
    const name = formData.get('name');
    if (!name) {
      return {
        ...prevState,
        step: 1,
        errors: { name: '请输入姓名' }
      };
    }
    
    return {
      step: 2,
      data: { ...prevState.data, name },
      errors: {}
    };
  }
  
  if (step === 2) {
    const bio = formData.get('bio');
    
    await db.users.update({
      where: { id: await getCurrentUserId() },
      data: {
        name: prevState.data.name,
        bio
      }
    });
    
    return {
      step: 'complete',
      data: { ...prevState.data, bio }
    };
  }
}

// Client Component
'use client';

import { useActionState, useOptimistic } from 'react';
import { updateProfile } from './actions';

export default function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    { step: 1, data: {}, errors: {} }
  );
  
  const [optimisticStep, setOptimisticStep] = useOptimistic(
    state.step,
    (_, newStep) => newStep
  );
  
  const handleSubmit = async (formData) => {
    // 乐观地前进到下一步
    if (state.step === 1) {
      setOptimisticStep(2);
    }
    
    // 提交表单
    await formAction(formData);
  };
  
  if (state.step === 'complete') {
    return <div>个人资料已更新！</div>;
  }
  
  return (
    <form action={handleSubmit}>
      <input type="hidden" name="step" value={state.step} />
      
      {optimisticStep === 1 && (
        <div>
          <input name="name" placeholder="姓名" required />
          {state.errors?.name && (
            <span className="error">{state.errors.name}</span>
          )}
        </div>
      )}
      
      {optimisticStep === 2 && (
        <div>
          <textarea name="bio" placeholder="个人简介" />
        </div>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '处理中...' : optimisticStep === 2 ? '完成' : '下一步'}
      </button>
    </form>
  );
}
```

### 2.3 表单验证集成

```javascript
// Server Action
'use server';

import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(3, '标题至少3个字符').max(100, '标题最多100个字符'),
  content: z.string().min(10, '内容至少10个字符'),
  tags: z.array(z.string()).min(1, '至少选择一个标签')
});

export async function createPost(prevState, formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const tags = formData.getAll('tags');
  
  // 验证
  const validation = postSchema.safeParse({ title, content, tags });
  
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors
    };
  }
  
  // 创建文章
  const post = await db.posts.create({
    data: {
      title,
      content,
      tags: {
        connect: tags.map(id => ({ id }))
      }
    },
    include: {
      tags: true
    }
  });
  
  return {
    success: true,
    post
  };
}

// Client Component
'use client';

import { useActionState, useOptimistic, useState } from 'react';
import { createPost } from './actions';

export default function PostForm({ availableTags }) {
  const [posts, setPosts] = useState([]);
  
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost) => [newPost, ...state]
  );
  
  const [state, formAction, isPending] = useActionState(
    createPost,
    { success: false, errors: {} }
  );
  
  const handleSubmit = async (formData) => {
    const title = formData.get('title');
    const content = formData.get('content');
    const tags = formData.getAll('tags');
    
    // 乐观添加
    addOptimisticPost({
      id: `temp-${Date.now()}`,
      title,
      content,
      tags: tags.map(id => availableTags.find(t => t.id === id)),
      pending: true
    });
    
    const result = await formAction(formData);
    
    if (result.success) {
      setPosts(prev => [result.post, ...prev]);
    }
  };
  
  return (
    <div>
      <form action={handleSubmit}>
        <div>
          <label>标题</label>
          <input name="title" required />
          {state.errors?.title && (
            <span className="error">{state.errors.title[0]}</span>
          )}
        </div>
        
        <div>
          <label>内容</label>
          <textarea name="content" required rows={6} />
          {state.errors?.content && (
            <span className="error">{state.errors.content[0]}</span>
          )}
        </div>
        
        <div>
          <label>标签</label>
          {availableTags.map(tag => (
            <label key={tag.id}>
              <input 
                type="checkbox"
                name="tags"
                value={tag.id}
              />
              {tag.name}
            </label>
          ))}
          {state.errors?.tags && (
            <span className="error">{state.errors.tags[0]}</span>
          )}
        </div>
        
        <button type="submit" disabled={isPending}>
          {isPending ? '发布中...' : '发布'}
        </button>
      </form>
      
      <div className="posts">
        {optimisticPosts.map(post => (
          <article 
            key={post.id}
            className={post.pending ? 'pending' : ''}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <div className="tags">
              {post.tags.map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
            {post.pending && <span>发布中...</span>}
          </article>
        ))}
      </div>
    </div>
  );
}
```

### 2.4 状态持久化

```javascript
// Server Action
'use server';

import { cookies } from 'next/headers';

export async function saveDraft(formData) {
  const draft = {
    title: formData.get('title'),
    content: formData.get('content'),
    savedAt: new Date().toISOString()
  };
  
  // 保存到cookie
  cookies().set('draft', JSON.stringify(draft), {
    maxAge: 60 * 60 * 24 * 7 // 7天
  });
  
  return { success: true, draft };
}

export async function publishPost(prevState, formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  const post = await db.posts.create({
    data: { title, content }
  });
  
  // 清除草稿
  cookies().delete('draft');
  
  return {
    success: true,
    post
  };
}

// Client Component
'use client';

import { useActionState, useOptimistic, useState, useEffect } from 'react';
import { saveDraft, publishPost } from './actions';

export default function PostEditor({ initialDraft }) {
  const [draft, setDraft] = useState(initialDraft);
  
  const [optimisticDraft, setOptimisticDraft] = useOptimistic(
    draft,
    (_, newDraft) => newDraft
  );
  
  const [state, formAction, isPending] = useActionState(
    publishPost,
    { success: false }
  );
  
  // 自动保存草稿
  useEffect(() => {
    const timer = setInterval(async () => {
      const formData = new FormData();
      formData.set('title', draft.title);
      formData.set('content', draft.content);
      
      await saveDraft(formData);
    }, 30000); // 30秒自动保存
    
    return () => clearInterval(timer);
  }, [draft]);
  
  const handleChange = (field, value) => {
    const newDraft = { ...draft, [field]: value };
    setOptimisticDraft(newDraft);
    setDraft(newDraft);
  };
  
  const handlePublish = async (formData) => {
    const result = await formAction(formData);
    
    if (result.success) {
      setDraft({ title: '', content: '' });
    }
  };
  
  return (
    <form action={handlePublish}>
      <div>
        <input
          name="title"
          value={optimisticDraft.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="标题"
          required
        />
      </div>
      
      <div>
        <textarea
          name="content"
          value={optimisticDraft.content || ''}
          onChange={(e) => handleChange('content', e.target.value)}
          placeholder="内容"
          required
          rows={10}
        />
      </div>
      
      {optimisticDraft.savedAt && (
        <span className="saved-hint">
          已保存：{new Date(optimisticDraft.savedAt).toLocaleString()}
        </span>
      )}
      
      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布'}
      </button>
    </form>
  );
}
```

## 第三部分：与useFormStatus集成

### 3.1 智能提交按钮

```javascript
// Server Action
'use server';

export async function submitForm(formData) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true };
}

// Submit Button Component
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton({ optimisticText }) {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : optimisticText || '提交'}
    </button>
  );
}

// Form Component
'use client';

import { useOptimistic, useState } from 'react';
import { submitForm } from './actions';

export default function Form() {
  const [submitted, setSubmitted] = useState(false);
  
  const [optimisticSubmitted, setOptimisticSubmitted] = useOptimistic(
    submitted,
    (_, newValue) => newValue
  );
  
  const handleSubmit = async (formData) => {
    // 乐观更新
    setOptimisticSubmitted(true);
    
    try {
      await submitForm(formData);
      setSubmitted(true);
    } catch (error) {
      // 失败会自动回滚
    }
  };
  
  if (optimisticSubmitted) {
    return <div>提交成功！</div>;
  }
  
  return (
    <form action={handleSubmit}>
      <input name="data" required />
      <SubmitButton />
    </form>
  );
}
```

### 3.2 字段禁用

```javascript
'use client';

import { useFormStatus } from 'react-dom';
import { useOptimistic } from 'react';

function FormFields({ optimisticData }) {
  const { pending } = useFormStatus();
  
  return (
    <>
      <input
        name="title"
        defaultValue={optimisticData.title}
        disabled={pending}
      />
      
      <textarea
        name="content"
        defaultValue={optimisticData.content}
        disabled={pending}
      />
    </>
  );
}

export default function PostForm() {
  const [data, setData] = useState({ title: '', content: '' });
  
  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (_, newData) => newData
  );
  
  const handleSubmit = async (formData) => {
    const newData = {
      title: formData.get('title'),
      content: formData.get('content')
    };
    
    // 乐观更新
    setOptimisticData(newData);
    
    // 提交
    await submitPost(formData);
    
    // 更新实际状态
    setData(newData);
  };
  
  return (
    <form action={handleSubmit}>
      <FormFields optimisticData={optimisticData} />
      <button type="submit">保存</button>
    </form>
  );
}
```

### 3.3 进度指示器

```javascript
'use client';

import { useFormStatus } from 'react-dom';
import { useOptimistic, useState } from 'react';

function ProgressIndicator() {
  const { pending, data } = useFormStatus();
  
  if (!pending) return null;
  
  return (
    <div className="progress">
      <div className="progress-bar" />
      <span>正在保存...</span>
    </div>
  );
}

export default function Form({ initialData }) {
  const [data, setData] = useState(initialData);
  
  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (_, newData) => newData
  );
  
  const handleSubmit = async (formData) => {
    const newData = Object.fromEntries(formData);
    
    setOptimisticData(newData);
    
    await saveData(formData);
    
    setData(newData);
  };
  
  return (
    <form action={handleSubmit}>
      <ProgressIndicator />
      
      <input 
        name="field1" 
        defaultValue={optimisticData.field1}
      />
      
      <input 
        name="field2" 
        defaultValue={optimisticData.field2}
      />
      
      <button type="submit">保存</button>
    </form>
  );
}

/* CSS */
.progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f0f0f0;
}

.progress-bar {
  height: 100%;
  background: #007bff;
  animation: progress 1s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 50%; }
  100% { width: 100%; }
}
```

### 3.4 动态按钮文本

```javascript
'use client';

import { useFormStatus } from 'react-dom';

function DynamicSubmitButton({ action }) {
  const { pending, data } = useFormStatus();
  
  const getButtonText = () => {
    if (!pending) {
      switch (action) {
        case 'create': return '创建';
        case 'update': return '更新';
        case 'delete': return '删除';
        default: return '提交';
      }
    }
    
    switch (action) {
      case 'create': return '创建中...';
      case 'update': return '更新中...';
      case 'delete': return '删除中...';
      default: return '提交中...';
    }
  };
  
  return (
    <button type="submit" disabled={pending}>
      {getButtonText()}
    </button>
  );
}

export default function PostForm({ action, initialPost }) {
  const [post, setPost] = useState(initialPost);
  
  const [optimisticPost, setOptimisticPost] = useOptimistic(
    post,
    (_, updates) => ({ ..._, ...updates })
  );
  
  const handleSubmit = async (formData) => {
    const updates = Object.fromEntries(formData);
    setOptimisticPost(updates);
    
    const result = await submitPost(action, formData);
    setPost(result);
  };
  
  return (
    <form action={handleSubmit}>
      <input name="title" defaultValue={optimisticPost.title} />
      <textarea name="content" defaultValue={optimisticPost.content} />
      
      <DynamicSubmitButton action={action} />
    </form>
  );
}
```

## 第四部分：复杂场景

### 4.1 嵌套数据更新

```javascript
// Server Action
'use server';

export async function updateSettings(category, key, value) {
  await db.settings.upsert({
    where: { key: `${category}.${key}` },
    create: {
      key: `${category}.${key}`,
      value
    },
    update: { value }
  });
  
  return { category, key, value };
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updateSettings } from './actions';

export default function Settings() {
  const [settings, setSettings] = useState({
    general: { theme: 'light', language: 'zh-CN' },
    privacy: { profile: 'public', email: 'private' }
  });
  
  const [optimisticSettings, updateOptimisticSettings] = useOptimistic(
    settings,
    (state, { category, key, value }) => ({
      ...state,
      [category]: {
        ...state[category],
        [key]: value
      }
    })
  );
  
  const handleChange = async (category, key, value) => {
    // 乐观更新
    updateOptimisticSettings({ category, key, value });
    
    try {
      // 发送到服务器
      await updateSettings(category, key, value);
      
      // 更新实际状态
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    } catch (error) {
      alert('更新失败');
    }
  };
  
  return (
    <div>
      <section>
        <h3>通用设置</h3>
        <select
          value={optimisticSettings.general.theme}
          onChange={(e) => handleChange('general', 'theme', e.target.value)}
        >
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </section>
      
      <section>
        <h3>隐私设置</h3>
        <select
          value={optimisticSettings.privacy.profile}
          onChange={(e) => handleChange('privacy', 'profile', e.target.value)}
        >
          <option value="public">公开</option>
          <option value="private">私密</option>
        </select>
      </section>
    </div>
  );
}
```

### 4.2 批量操作

```javascript
// Server Action
'use server';

export async function batchToggleTodos(todoIds) {
  await db.todos.updateMany({
    where: { id: { in: todoIds } },
    data: { completed: true }
  });
  
  return todoIds;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { batchToggleTodos } from './actions';

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [optimisticTodos, updateOptimisticTodos] = useOptimistic(
    todos,
    (state, completedIds) => 
      state.map(todo => 
        completedIds.includes(todo.id)
          ? { ...todo, completed: true, pending: true }
          : todo
      )
  );
  
  const handleBatchComplete = async () => {
    if (selectedIds.length === 0) return;
    
    // 乐观更新
    updateOptimisticTodos(selectedIds);
    
    try {
      // 批量处理
      await batchToggleTodos(selectedIds);
      
      // 更新实际状态
      setTodos(prev => 
        prev.map(todo => 
          selectedIds.includes(todo.id)
            ? { ...todo, completed: true }
            : todo
        )
      );
      
      // 清空选择
      setSelectedIds([]);
    } catch (error) {
      alert('批量操作失败');
    }
  };
  
  return (
    <div>
      <button onClick={handleBatchComplete}>
        完成选中的 {selectedIds.length} 项
      </button>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} className={todo.pending ? 'pending' : ''}>
            <input
              type="checkbox"
              checked={selectedIds.includes(todo.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(prev => [...prev, todo.id]);
                } else {
                  setSelectedIds(prev => prev.filter(id => id !== todo.id));
                }
              }}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.3 条件乐观更新

```javascript
// Server Action
'use server';

export async function publishPost(postId) {
  const post = await db.posts.findUnique({
    where: { id: postId }
  });
  
  if (!post.title || post.content.length < 100) {
    throw new Error('文章内容不完整');
  }
  
  await db.posts.update({
    where: { id: postId },
    data: { published: true }
  });
  
  return { id: postId, published: true };
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { publishPost } from './actions';

export default function PostEditor({ post }) {
  const [published, setPublished] = useState(post.published);
  const [error, setError] = useState(null);
  
  const [optimisticPublished, setOptimisticPublished] = useOptimistic(
    published,
    (_, newValue) => newValue
  );
  
  const handlePublish = async () => {
    // 检查条件
    if (!post.title) {
      setError('请输入标题');
      return;
    }
    
    if (post.content.length < 100) {
      setError('内容至少100个字符');
      return;
    }
    
    setError(null);
    
    // 条件满足，乐观更新
    setOptimisticPublished(true);
    
    try {
      await publishPost(post.id);
      setPublished(true);
    } catch (error) {
      setError(error.message);
      // 失败会自动回滚
    }
  };
  
  return (
    <div>
      <div className="editor">
        <input value={post.title} placeholder="标题" />
        <textarea value={post.content} placeholder="内容" />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button 
        onClick={handlePublish}
        disabled={optimisticPublished}
      >
        {optimisticPublished ? '已发布' : '发布'}
      </button>
    </div>
  );
}
```

### 4.4 关联数据更新

```javascript
// Server Actions
'use server';

export async function updatePostWithTags(postId, formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const tagIds = formData.getAll('tags');
  
  const post = await db.posts.update({
    where: { id: postId },
    data: {
      title,
      content,
      tags: {
        set: [], // 先清空
        connect: tagIds.map(id => ({ id })) // 再连接
      }
    },
    include: {
      tags: true,
      author: true,
      _count: {
        select: { comments: true, likes: true }
      }
    }
  });
  
  return post;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updatePostWithTags } from './actions';

export default function PostEditor({ initialPost, availableTags }) {
  const [post, setPost] = useState(initialPost);
  
  const [optimisticPost, setOptimisticPost] = useOptimistic(
    post,
    (current, updates) => ({
      ...current,
      ...updates,
      tags: updates.tags || current.tags
    })
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const content = formData.get('content');
    const tagIds = formData.getAll('tags');
    
    // 乐观更新（包括关联的tags）
    setOptimisticPost({
      title,
      content,
      tags: tagIds.map(id => availableTags.find(t => t.id === id))
    });
    
    try {
      const updatedPost = await updatePostWithTags(post.id, formData);
      setPost(updatedPost);
      toast.success('保存成功');
    } catch (error) {
      toast.error('保存失败');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>标题</label>
        <input 
          name="title" 
          defaultValue={optimisticPost.title}
          required
        />
      </div>
      
      <div>
        <label>内容</label>
        <textarea 
          name="content"
          defaultValue={optimisticPost.content}
          required
          rows={10}
        />
      </div>
      
      <div>
        <label>标签</label>
        <div className="tag-selector">
          {availableTags.map(tag => (
            <label key={tag.id}>
              <input
                type="checkbox"
                name="tags"
                value={tag.id}
                defaultChecked={optimisticPost.tags.some(t => t.id === tag.id)}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>
      
      <div className="metadata">
        <span>评论: {optimisticPost._count.comments}</span>
        <span>点赞: {optimisticPost._count.likes}</span>
      </div>
      
      <button type="submit">保存</button>
    </form>
  );
}
```

### 4.5 依赖链更新

```javascript
// Server Actions
'use server';

export async function updateCart(cartId, itemId, quantity) {
  // 更新购物车项数量
  await db.cartItems.update({
    where: { id: itemId },
    data: { quantity }
  });
  
  // 重新计算总价
  const cart = await db.carts.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  await db.carts.update({
    where: { id: cartId },
    data: { total }
  });
  
  return { cart, total };
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updateCart } from './actions';

export default function ShoppingCart({ initialCart }) {
  const [cart, setCart] = useState(initialCart);
  
  const [optimisticCart, setOptimisticCart] = useOptimistic(
    cart,
    (current, { itemId, quantity }) => {
      // 更新项数量
      const updatedItems = current.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      // 重新计算总价
      const newTotal = updatedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      
      return {
        ...current,
        items: updatedItems,
        total: newTotal
      };
    }
  );
  
  const handleQuantityChange = async (itemId, newQuantity) => {
    // 乐观更新（包括依赖的总价）
    setOptimisticCart({ itemId, quantity: newQuantity });
    
    try {
      const { cart: updatedCart, total } = await updateCart(
        cart.id,
        itemId,
        newQuantity
      );
      
      setCart(updatedCart);
    } catch (error) {
      toast.error('更新失败');
    }
  };
  
  return (
    <div className="shopping-cart">
      <h2>购物车</h2>
      
      {optimisticCart.items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.product.image} alt={item.product.name} />
          <div className="info">
            <h3>{item.product.name}</h3>
            <p>¥{item.product.price}</p>
          </div>
          
          <div className="quantity">
            <button 
              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
              +
            </button>
          </div>
          
          <div className="subtotal">
            ¥{(item.product.price * item.quantity).toFixed(2)}
          </div>
        </div>
      ))}
      
      <div className="total">
        <strong>总计：</strong>
        <span>¥{optimisticCart.total.toFixed(2)}</span>
      </div>
      
      <button className="checkout">结算</button>
    </div>
  );
}
```

## 第五部分：错误处理与恢复

### 5.1 全局错误处理

```javascript
'use client';

import { useOptimistic, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function FormWithGlobalError() {
  const [data, setData] = useState({ items: [] });
  
  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (current, action) => {
      // 处理各种操作
      switch (action.type) {
        case 'add':
          return {
            ...current,
            items: [...current.items, action.item]
          };
        case 'remove':
          return {
            ...current,
            items: current.items.filter(i => i.id !== action.id)
          };
        default:
          return current;
      }
    }
  );
  
  const withErrorHandling = async (action, serverAction, successMessage) => {
    // 乐观更新
    setOptimisticData(action);
    
    try {
      // 执行Server Action
      const result = await serverAction();
      
      // 更新实际状态
      setData(result);
      
      // 成功提示
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      // 错误提示
      toast.error(error.message || '操作失败');
      // useOptimistic自动回滚
    }
  };
  
  const handleAdd = (item) => {
    withErrorHandling(
      { type: 'add', item },
      () => addItem(item),
      '添加成功'
    );
  };
  
  const handleRemove = (id) => {
    withErrorHandling(
      { type: 'remove', id },
      () => removeItem(id),
      '删除成功'
    );
  };
  
  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### 5.2 重试机制

```javascript
'use client';

import { useOptimistic, useState, useRef } from 'react';

export default function FormWithRetry() {
  const [data, setData] = useState([]);
  const retryQueue = useRef(new Map());
  
  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (current, action) => {
      if (action.type === 'add') {
        return [...current, action.item];
      }
      return current;
    }
  );
  
  const retryWithBackoff = async (id, action, serverAction, attempt = 0) => {
    const maxAttempts = 3;
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    
    try {
      const result = await serverAction();
      setData(result);
      retryQueue.current.delete(id);
      toast.success('操作成功');
    } catch (error) {
      if (attempt < maxAttempts) {
        toast.info(`重试中... (${attempt + 1}/${maxAttempts})`);
        
        setTimeout(() => {
          retryWithBackoff(id, action, serverAction, attempt + 1);
        }, delay);
      } else {
        toast.error('操作失败，已达最大重试次数');
        retryQueue.current.delete(id);
      }
    }
  };
  
  const handleAdd = (item) => {
    const id = crypto.randomUUID();
    const action = { type: 'add', item: { ...item, id } };
    
    setOptimisticData(action);
    
    retryQueue.current.set(id, { action, serverAction: () => addItem(item) });
    retryWithBackoff(id, action, () => addItem(item));
  };
  
  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

## 注意事项

### 1. 保持Server Action纯净

```javascript
// ✅ 好：Server Action只处理业务逻辑
'use server';

export async function likePost(postId) {
  await db.likes.create({
    data: { postId, userId: await getCurrentUserId() }
  });
  
  const likes = await db.likes.count({
    where: { postId }
  });
  
  return likes;
}

// ❌ 不好：Server Action不应该处理UI逻辑
'use server';

export async function likePost(postId, optimisticUpdate) {
  // Server Action不应该关心乐观更新
}
```

### 2. 成功后更新实际状态

```javascript
// ✅ 必须更新实际状态
const handleSubmit = async (formData) => {
  setOptimisticValue(newValue);
  
  const result = await submitForm(formData);
  
  // 必须！
  setValue(result);
};
```

### 3. 处理部分成功

```javascript
// 批量操作可能部分成功
const handleBatchUpdate = async (ids) => {
  updateOptimistic(ids);
  
  const result = await batchUpdate(ids);
  
  // 只更新成功的
  setValue(result.successful);
  
  // 显示失败的
  if (result.failed.length > 0) {
    alert(`${result.failed.length} 项失败`);
  }
};
```

### 4. 避免状态不一致

```javascript
// ✅ 好：保持乐观状态和实际状态同步
const handleUpdate = async (newValue) => {
  setOptimisticValue(newValue);
  
  const result = await updateValue(newValue);
  setValue(result); // 同步
};

// ❌ 不好：忘记更新实际状态
const handleUpdate = async (newValue) => {
  setOptimisticValue(newValue);
  
  await updateValue(newValue);
  // 忘记更新setValue！
};
```

### 5. 处理竞态条件

```javascript
'use client';

import { useOptimistic, useState, useRef } from 'react';

export default function SearchWithRace() {
  const [results, setResults] = useState([]);
  const requestId = useRef(0);
  
  const [optimisticResults, setOptimisticResults] = useOptimistic(
    results,
    (_, newResults) => newResults
  );
  
  const handleSearch = async (query) => {
    const currentId = ++requestId.current;
    
    setOptimisticResults([]); // 清空
    
    const results = await searchAction(query);
    
    // 只处理最新的请求
    if (currentId === requestId.current) {
      setResults(results);
    }
  };
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {optimisticResults.map(result => (
        <div key={result.id}>{result.name}</div>
      ))}
    </div>
  );
}
```

## 常见问题

### Q1: 如何处理依赖的乐观更新？

**A:** 使用单独的useOptimistic跟踪每个依赖状态，或在reducer中计算依赖值。

```javascript
const [optimisticCart, setOptimisticCart] = useOptimistic(
  cart,
  (current, { itemId, quantity }) => {
    const updatedItems = current.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    
    // 同时更新依赖的总价
    const total = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    return { ...current, items: updatedItems, total };
  }
);
```

### Q2: Server Action失败后如何通知用户？

**A:** useOptimistic会自动回滚，你只需显示错误消息。

```javascript
try {
  await serverAction();
} catch (error) {
  toast.error(error.message);
  // useOptimistic自动回滚
}
```

### Q3: 可以在Server Action中访问乐观状态吗？

**A:** 不能！乐观状态只存在于客户端，Server Action无法访问。

### Q4: 如何处理表单重置？

**A:** 在Server Action成功后，手动重置表单或使用`form.reset()`。

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  setOptimisticData(/* ... */);
  
  await serverAction(formData);
  
  // 重置表单
  e.target.reset();
};
```

### Q5: 如何在多个组件间共享乐观状态？

**A:** 使用Context或状态管理库（如Zustand）。

```javascript
// Context
const OptimisticContext = createContext();

export function OptimisticProvider({ children }) {
  const [data, setData] = useState([]);
  
  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (current, action) => {
      // reducer逻辑
    }
  );
  
  return (
    <OptimisticContext.Provider value={{ optimisticData, setOptimisticData, setData }}>
      {children}
    </OptimisticContext.Provider>
  );
}
```

## 总结

### 集成要点

```
✅ useOptimistic在Client Component
✅ Server Actions处理业务逻辑
✅ 成功后更新实际状态
✅ useActionState管理表单
✅ useFormStatus显示pending
✅ 提供错误反馈
✅ 处理竞态条件
✅ 避免状态不一致
```

### 最佳实践

```
1. 保持Server Actions纯净
2. 客户端处理乐观更新
3. 成功后同步实际状态
4. 失败时显示错误
5. 显示待确认状态
6. 考虑条件更新
7. 处理批量操作
8. 添加重试机制
9. 使用TypeScript类型
10. 充分测试边界情况
```

### 性能优化

```
✅ 使用防抖处理高频操作
✅ 批量更新减少请求
✅ 合理使用React.memo
✅ 避免不必要的重新渲染
✅ 使用虚拟列表处理大数据
```

### 架构建议

```javascript
// 推荐的项目结构
/app
  /actions           # Server Actions
    /posts.js
    /users.js
  /components        # Client Components
    /PostForm.js
    /UserProfile.js
  /hooks             # 自定义Hooks
    /useOptimisticPost.js
  /utils             # 工具函数
    /withOptimistic.js
```

### 关键收益

```
✅ 即时UI反馈
✅ 流畅用户体验
✅ 简化状态管理
✅ 自动错误恢复
✅ 类型安全
✅ 易于测试
✅ 渐进增强
```

useOptimistic与Server Actions的配合让React应用响应迅速且可靠！
