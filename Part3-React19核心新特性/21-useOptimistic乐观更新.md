# useOptimistic乐观更新

## 学习目标

通过本章学习，你将掌握：

- useOptimistic的核心概念
- 乐观更新的工作原理
- 基本使用方法
- UI即时反馈
- 错误回滚机制
- 与Server Actions集成
- 实际应用场景
- 最佳实践

## 第一部分：乐观更新概念

### 1.1 什么是乐观更新

乐观更新是一种UI模式：在服务器响应前，先乐观地更新UI，假设操作会成功。如果失败，再回滚到原始状态。

```jsx
// ========== 传统方式（悲观更新） ==========
function TraditionalLike({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);
  
  const handleLike = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      });
      
      const data = await response.json();
      setLikes(data.likes);  // 等待服务器响应
    } catch (error) {
      alert('点赞失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleLike} disabled={loading}>
      {loading ? '...' : `❤️ ${likes}`}
    </button>
  );
}

// 问题：
// - 点击后需要等待服务器响应
// - 有明显的延迟感
// - 用户体验不够流畅


// ========== 乐观更新方式 ==========
'use client';

import { useOptimistic } from 'react';
import { likePost } from './actions';

function OptimisticLike({ postId, initialLikes }) {
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    initialLikes,
    (currentLikes, newLikes) => newLikes
  );
  
  const handleLike = async () => {
    // 立即更新UI
    setOptimisticLikes(initialLikes + 1);
    
    // 后台发送请求
    await likePost(postId);
  };
  
  return (
    <button onClick={handleLike}>
      ❤️ {optimisticLikes}
    </button>
  );
}

// 优势：
// - 点击后立即响应
// - 无需等待服务器
// - 用户体验流畅
// - 失败时自动回滚
```

### 1.2 工作原理

```
乐观更新流程：

1. 用户操作（点击按钮）
   ↓
2. 立即更新UI（乐观状态）
   ↓
3. 发起服务器请求
   ↓
4. 等待服务器响应
   ↓
5a. 成功 → 保持乐观状态
   OR
5b. 失败 → 回滚到原始状态


详细流程图：

用户点击
  ↓
调用setOptimisticState(newValue)
  ↓
React立即更新optimisticState
  ↓
UI立即重新渲染
  ↓
发起异步请求（在后台）
  ↓
等待响应（用户看到乐观状态）
  ↓
┌─────────────┬─────────────┐
│  请求成功   │  请求失败   │
└─────────────┴─────────────┘
      ↓              ↓
更新actualState  actualState不变
      ↓              ↓
optimisticState  optimisticState
 = actualState    自动回滚到actualState
      ↓              ↓
    完成          显示错误
```

### 1.3 基本语法

```typescript
const [optimisticState, setOptimisticState] = useOptimistic(
  actualState,        // 实际状态（来自服务器）
  (currentState, optimisticValue) => {  // 更新函数
    return optimisticValue;
  }
);

// 参数：
// - actualState: 实际的状态值
// - updateFn: 接收当前状态和乐观值，返回新的乐观状态

// 返回值：
// - optimisticState: 当前显示的状态（可能是乐观值）
// - setOptimisticState: 设置乐观状态的函数


// TypeScript类型定义
function useOptimistic<State, Action>(
  passthrough: State,
  reducer: (state: State, action: Action) => State
): [State, (action: Action) => void];

// 示例
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,  // 实际的todos列表
  (state: Todo[], newTodo: Todo) => [...state, newTodo]
);
```

### 1.4 与传统方式的对比

```jsx
// ========== 方式1：传统加载状态 ==========
function TraditionalApproach() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const increment = async () => {
    setLoading(true);
    
    try {
      const result = await updateCount(count + 1);
      setCount(result);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment} disabled={loading}>
        {loading ? 'Loading...' : '+1'}
      </button>
    </div>
  );
}

// 时间线：
// 0ms: 用户点击
// 0ms: 显示Loading...
// 500ms: 服务器响应
// 500ms: 显示新数字
// 体验：500ms的等待时间


// ========== 方式2：乐观更新 ==========
function OptimisticApproach() {
  const [count, setCount] = useState(0);
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    count,
    (_, newCount) => newCount
  );
  
  const increment = async () => {
    setOptimisticCount(count + 1);
    
    const result = await updateCount(count + 1);
    setCount(result);
  };
  
  return (
    <div>
      <p>Count: {optimisticCount}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}

// 时间线：
// 0ms: 用户点击
// 0ms: 显示新数字（立即）
// 500ms: 服务器确认
// 体验：0ms等待时间！


// ========== 方式3：手动乐观更新（旧方式）==========
function ManualOptimistic() {
  const [count, setCount] = useState(0);
  const [optimisticCount, setOptimisticCount] = useState(0);
  
  const increment = async () => {
    // 手动设置乐观状态
    setOptimisticCount(count + 1);
    
    try {
      const result = await updateCount(count + 1);
      setCount(result);
      setOptimisticCount(result);
    } catch (error) {
      // 手动回滚
      setOptimisticCount(count);
    }
  };
  
  return (
    <div>
      <p>Count: {optimisticCount}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}

// 问题：
// - 需要手动管理两个状态
// - 需要手动回滚
// - 容易出错
// - 代码冗长


// ========== 方式4：useOptimistic（推荐）==========
// 简洁、自动回滚、类型安全
```

## 第二部分：基础用法

### 2.1 简单计数器

```jsx
'use server';

export async function incrementCounter(currentValue) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 更新数据库
  await db.counters.update({
    where: { id: 1 },
    data: { value: currentValue + 1 }
  });
  
  return currentValue + 1;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { incrementCounter } from './actions';

export default function OptimisticCounter() {
  const [count, setCount] = useState(0);
  
  const [optimisticCount, setOptimisticCount] = useOptimistic(
    count,
    (currentCount, newCount) => newCount
  );
  
  const handleIncrement = async () => {
    // 立即更新UI
    setOptimisticCount(count + 1);
    
    // 发送到服务器
    const newCount = await incrementCounter(count);
    
    // 更新实际状态
    setCount(newCount);
  };
  
  return (
    <div>
      <p>计数: {optimisticCount}</p>
      <button onClick={handleIncrement}>
        增加
      </button>
    </div>
  );
}

// 体验：
// - 点击按钮，计数立即增加（乐观）
// - 1秒后服务器响应确认
// - 如果失败，自动回滚
```

### 2.2 点赞功能

```jsx
// Server Action
'use server';

export async function likePost(postId) {
  const session = await getSession();
  
  if (!session) {
    throw new Error('未登录');
  }
  
  await db.likes.create({
    data: {
      postId,
      userId: session.userId
    }
  });
  
  const likes = await db.likes.count({
    where: { postId }
  });
  
  return likes;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { likePost } from './actions';

export default function LikeButton({ postId, initialLikes, initialLiked }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    likes,
    (currentLikes, increment) => currentLikes + increment
  );
  
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    liked,
    (_, newLiked) => newLiked
  );
  
  const handleLike = async () => {
    if (liked) return;  // 已经点赞
    
    // 立即更新UI
    setOptimisticLikes(1);
    setOptimisticLiked(true);
    
    try {
      // 发送请求
      const newLikes = await likePost(postId);
      
      // 更新实际状态
      setLikes(newLikes);
      setLiked(true);
    } catch (error) {
      // 失败时自动回滚到原始状态
      alert('点赞失败');
    }
  };
  
  return (
    <button 
      onClick={handleLike}
      disabled={optimisticLiked}
      className={optimisticLiked ? 'liked' : ''}
    >
      {optimisticLiked ? '❤️' : '🤍'} {optimisticLikes}
    </button>
  );
}
```

### 2.3 切换状态

```jsx
// Server Action
'use server';

export async function toggleTodo(todoId, currentCompleted) {
  await db.todos.update({
    where: { id: todoId },
    data: { completed: !currentCompleted }
  });
  
  return !currentCompleted;
}

// Client Component
'use client';

import { useOptimistic } from 'react';
import { toggleTodo } from './actions';

export default function TodoItem({ todo }) {
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    todo.completed,
    (_, newCompleted) => newCompleted
  );
  
  const handleToggle = async () => {
    // 立即切换状态
    setOptimisticCompleted(!todo.completed);
    
    try {
      // 发送请求
      await toggleTodo(todo.id, todo.completed);
    } catch (error) {
      // 失败会自动回滚
      alert('更新失败');
    }
  };
  
  return (
    <div className={optimisticCompleted ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={optimisticCompleted}
        onChange={handleToggle}
      />
      <span>{todo.text}</span>
    </div>
  );
}
```

### 2.4 输入字段实时更新

```jsx
// Server Action
'use server';

export async function updateUserName(userId, name) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await db.users.update({
    where: { id: userId },
    data: { name }
  });
  
  return name;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updateUserName } from './actions';

export default function UserNameEditor({ userId, initialName }) {
  const [name, setName] = useState(initialName);
  const [optimisticName, setOptimisticName] = useOptimistic(
    name,
    (_, newName) => newName
  );
  
  const handleSave = async (newName) => {
    // 立即更新显示
    setOptimisticName(newName);
    
    try {
      await updateUserName(userId, newName);
      setName(newName);
    } catch (error) {
      alert('保存失败');
    }
  };
  
  return (
    <div>
      <p>当前名称：{optimisticName}</p>
      <input
        type="text"
        defaultValue={name}
        onBlur={(e) => handleSave(e.target.value)}
      />
    </div>
  );
}
```

## 第三部分：高级用法

### 3.1 列表添加

```jsx
// Server Action
'use server';

export async function addTodo(text) {
  const todo = await db.todos.create({
    data: {
      text,
      completed: false
    }
  });
  
  return todo;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { addTodo } from './actions';

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, newTodo) => [...currentTodos, newTodo]
  );
  
  const handleAdd = async (text) => {
    // 创建临时ID的乐观Todo
    const tempTodo = {
      id: `temp-${Date.now()}`,
      text,
      completed: false,
      pending: true  // 标记为待确认
    };
    
    // 立即显示
    setOptimisticTodos(tempTodo);
    
    try {
      // 发送请求
      const newTodo = await addTodo(text);
      
      // 更新实际状态（替换临时Todo）
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      alert('添加失败');
      // 失败会自动从列表中移除
    }
  };
  
  return (
    <div>
      <TodoForm onAdd={handleAdd} />
      
      <ul>
        {optimisticTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo}
            isPending={todo.pending}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({ todo, isPending }) {
  return (
    <li className={isPending ? 'pending' : ''}>
      {todo.text}
      {isPending && <span className="spinner">...</span>}
    </li>
  );
}
```

### 3.2 列表删除

```jsx
// Server Action
'use server';

export async function deleteTodo(todoId) {
  await db.todos.delete({
    where: { id: todoId }
  });
  
  return todoId;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { deleteTodo } from './actions';

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, deletedId) => 
      currentTodos.filter(todo => todo.id !== deletedId)
  );
  
  const handleDelete = async (todoId) => {
    // 立即从列表中移除
    setOptimisticTodos(todoId);
    
    try {
      // 发送删除请求
      await deleteTodo(todoId);
      
      // 更新实际状态
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (error) {
      alert('删除失败');
      // 失败会自动恢复到列表中
    }
  };
  
  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => handleDelete(todo.id)}>
            删除
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### 3.3 复杂对象更新

```jsx
// Server Action
'use server';

export async function updatePost(postId, updates) {
  const post = await db.posts.update({
    where: { id: postId },
    data: updates
  });
  
  return post;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updatePost } from './actions';

export default function Post({ initialPost }) {
  const [post, setPost] = useState(initialPost);
  
  const [optimisticPost, setOptimisticPost] = useOptimistic(
    post,
    (currentPost, updates) => ({
      ...currentPost,
      ...updates
    })
  );
  
  const handleEdit = async (field, value) => {
    // 立即更新UI
    setOptimisticPost({ [field]: value });
    
    try {
      // 发送更新
      const updatedPost = await updatePost(post.id, { [field]: value });
      
      // 更新实际状态
      setPost(updatedPost);
    } catch (error) {
      alert('更新失败');
    }
  };
  
  return (
    <article>
      <h1 
        contentEditable
        onBlur={(e) => handleEdit('title', e.target.textContent)}
      >
        {optimisticPost.title}
      </h1>
      
      <div
        contentEditable
        onBlur={(e) => handleEdit('content', e.target.textContent)}
      >
        {optimisticPost.content}
      </div>
      
      <span className="likes">
        ❤️ {optimisticPost.likes}
      </span>
    </article>
  );
}
```

### 3.4 列表排序

```jsx
// Server Action
'use server';

export async function updateTodoOrder(todos) {
  await db.$transaction(
    todos.map((todo, index) =>
      db.todos.update({
        where: { id: todo.id },
        data: { order: index }
      })
    )
  );
  
  return todos;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { updateTodoOrder } from './actions';

export default function SortableTodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (_, newTodos) => newTodos
  );
  
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const newTodos = Array.from(todos);
    const [removed] = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, removed);
    
    // 立即更新UI
    setOptimisticTodos(newTodos);
    
    try {
      // 保存新顺序
      await updateTodoOrder(newTodos);
      setTodos(newTodos);
    } catch (error) {
      alert('保存顺序失败');
    }
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todos">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef}>
            {optimisticTodos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {todo.text}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

### 3.5 批量操作

```jsx
// Server Action
'use server';

export async function bulkCompleteTodos(todoIds) {
  await db.todos.updateMany({
    where: { id: { in: todoIds } },
    data: { completed: true }
  });
  
  return todoIds;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { bulkCompleteTodos } from './actions';

export default function TodoListWithBulk({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, completedIds) =>
      currentTodos.map(todo =>
        completedIds.includes(todo.id)
          ? { ...todo, completed: true }
          : todo
      )
  );
  
  const handleBulkComplete = async () => {
    // 立即更新UI
    setOptimisticTodos(selectedIds);
    
    try {
      // 批量更新
      await bulkCompleteTodos(selectedIds);
      
      // 更新实际状态
      setTodos(prev =>
        prev.map(todo =>
          selectedIds.includes(todo.id)
            ? { ...todo, completed: true }
            : todo
        )
      );
      
      setSelectedIds([]);
    } catch (error) {
      alert('批量操作失败');
    }
  };
  
  return (
    <div>
      <button 
        onClick={handleBulkComplete}
        disabled={selectedIds.length === 0}
      >
        完成所选 ({selectedIds.length})
      </button>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(todo.id)}
              onChange={(e) => {
                setSelectedIds(prev =>
                  e.target.checked
                    ? [...prev, todo.id]
                    : prev.filter(id => id !== todo.id)
                );
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

### 3.6 嵌套列表操作

```jsx
// Server Action
'use server';

export async function addComment(postId, text) {
  const comment = await db.comments.create({
    data: {
      postId,
      text,
      createdAt: new Date()
    }
  });
  
  return comment;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { addComment } from './actions';

export default function PostWithComments({ post, initialComments }) {
  const [comments, setComments] = useState(initialComments);
  
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    comments,
    (currentComments, newComment) => [...currentComments, newComment]
  );
  
  const handleAddComment = async (text) => {
    const tempComment = {
      id: `temp-${Date.now()}`,
      text,
      createdAt: new Date(),
      pending: true
    };
    
    // 立即显示评论
    setOptimisticComments(tempComment);
    
    try {
      const comment = await addComment(post.id, text);
      setComments(prev => [...prev, comment]);
    } catch (error) {
      alert('发表评论失败');
    }
  };
  
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      
      <section className="comments">
        <h3>评论 ({optimisticComments.length})</h3>
        
        {optimisticComments.map(comment => (
          <div 
            key={comment.id}
            className={comment.pending ? 'pending' : ''}
          >
            <p>{comment.text}</p>
            <time>{comment.createdAt.toLocaleString()}</time>
            {comment.pending && <span>发送中...</span>}
          </div>
        ))}
        
        <CommentForm onSubmit={handleAddComment} />
      </section>
    </article>
  );
}
```

## 第四部分：错误处理

### 4.1 显示错误状态

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function LikeButtonWithError({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [error, setError] = useState(null);
  
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    likes,
    (current, increment) => current + increment
  );
  
  const handleLike = async () => {
    setError(null);
    
    // 乐观更新
    setOptimisticLikes(1);
    
    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes);
    } catch (error) {
      setError('点赞失败，请重试');
      // useOptimistic会自动回滚
    }
  };
  
  return (
    <div>
      <button onClick={handleLike}>
        ❤️ {optimisticLikes}
      </button>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  );
}
```

### 4.2 重试机制

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function TodoWithRetry({ todo }) {
  const [completed, setCompleted] = useState(todo.completed);
  const [retrying, setRetrying] = useState(false);
  
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    completed,
    (_, newValue) => newValue
  );
  
  const toggleWithRetry = async (retryCount = 0) => {
    setRetrying(retryCount > 0);
    
    // 乐观更新
    setOptimisticCompleted(!completed);
    
    try {
      await toggleTodo(todo.id);
      setCompleted(!completed);
      setRetrying(false);
    } catch (error) {
      if (retryCount < 3) {
        // 自动重试
        setTimeout(() => {
          toggleWithRetry(retryCount + 1);
        }, 1000 * (retryCount + 1));
      } else {
        // 重试失败
        alert('操作失败，请稍后重试');
        setRetrying(false);
      }
    }
  };
  
  return (
    <div>
      <input
        type="checkbox"
        checked={optimisticCompleted}
        onChange={() => toggleWithRetry()}
      />
      <span>{todo.text}</span>
      {retrying && <span className="retrying">重试中...</span>}
    </div>
  );
}
```

### 4.3 显示待确认状态

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function TodoWithPendingState({ todo }) {
  const [completed, setCompleted] = useState(todo.completed);
  const [isPending, setIsPending] = useState(false);
  
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    completed,
    (_, newValue) => newValue
  );
  
  const handleToggle = async () => {
    setIsPending(true);
    
    // 乐观更新
    setOptimisticCompleted(!completed);
    
    try {
      await toggleTodo(todo.id);
      setCompleted(!completed);
    } catch (error) {
      alert('更新失败');
    } finally {
      setIsPending(false);
    }
  };
  
  return (
    <div className={isPending ? 'pending' : ''}>
      <input
        type="checkbox"
        checked={optimisticCompleted}
        onChange={handleToggle}
      />
      <span>{todo.text}</span>
      {isPending && <Spinner />}
    </div>
  );
}

/* CSS */
.pending {
  opacity: 0.7;
  pointer-events: none;
}
```

### 4.4 错误边界处理

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function FallbackComponent({ error, resetErrorBoundary }) {
  return (
    <div className="error-container">
      <h3>操作失败</h3>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

export default function TodoListWithErrorBoundary({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, action) => {
      switch (action.type) {
        case 'add':
          return [...currentTodos, action.todo];
        case 'delete':
          return currentTodos.filter(t => t.id !== action.id);
        case 'update':
          return currentTodos.map(t =>
            t.id === action.id ? { ...t, ...action.updates } : t
          );
        default:
          return currentTodos;
      }
    }
  );
  
  const handleAdd = async (text) => {
    const tempTodo = {
      id: `temp-${Date.now()}`,
      text,
      pending: true
    };
    
    setOptimisticTodos({ type: 'add', todo: tempTodo });
    
    try {
      const newTodo = await addTodo(text);
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      throw new Error('添加失败：' + error.message);
    }
  };
  
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <div>
        <TodoForm onAdd={handleAdd} />
        <TodoItems todos={optimisticTodos} />
      </div>
    </ErrorBoundary>
  );
}
```

### 4.5 Toast通知

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TodoWithToast({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, action) => {
      if (action.type === 'delete') {
        return currentTodos.filter(t => t.id !== action.id);
      }
      return currentTodos;
    }
  );
  
  const handleDelete = async (todoId) => {
    // 立即更新UI
    setOptimisticTodos({ type: 'delete', id: todoId });
    
    // 显示加载提示
    const toastId = toast.loading('删除中...');
    
    try {
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(t => t.id !== todoId));
      
      // 成功提示
      toast.success('删除成功', { id: toastId });
    } catch (error) {
      // 失败提示
      toast.error('删除失败：' + error.message, { id: toastId });
    }
  };
  
  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id}>
          <span>{todo.text}</span>
          <button onClick={() => handleDelete(todo.id)}>删除</button>
        </li>
      ))}
    </ul>
  );
}
```

## 第五部分：性能优化

### 5.1 防抖处理

```jsx
'use client';

import { useOptimistic, useState, useCallback } from 'react';
import { debounce } from 'lodash';

export default function SearchWithOptimistic() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(
    query,
    (_, newQuery) => newQuery
  );
  
  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      try {
        const results = await searchPosts(searchQuery);
        setQuery(searchQuery);
        setResults(results);
      } catch (error) {
        toast.error('搜索失败');
      }
    }, 500),
    []
  );
  
  const handleSearch = (value) => {
    // 立即更新搜索框
    setOptimisticQuery(value);
    
    // 防抖发送请求
    debouncedSearch(value);
  };
  
  return (
    <div>
      <input
        type="search"
        value={optimisticQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      
      <SearchResults results={results} query={optimisticQuery} />
    </div>
  );
}
```

### 5.2 节流处理

```jsx
'use client';

import { useOptimistic, useState, useRef } from 'react';

export default function LikeButtonThrottled({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const isThrottled = useRef(false);
  
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    likes,
    (current, increment) => current + increment
  );
  
  const handleLike = async () => {
    // 节流：1秒内只能点击一次
    if (isThrottled.current) return;
    
    isThrottled.current = true;
    setTimeout(() => {
      isThrottled.current = false;
    }, 1000);
    
    // 乐观更新
    setOptimisticLikes(1);
    
    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes);
    } catch (error) {
      toast.error('点赞失败');
    }
  };
  
  return (
    <button onClick={handleLike}>
      ❤️ {optimisticLikes}
    </button>
  );
}
```

### 5.3 批量更新优化

```jsx
'use client';

import { useOptimistic, useState, useRef } from 'react';

export default function BatchUpdateTodos({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const updateQueue = useRef([]);
  const flushTimer = useRef(null);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, action) => {
      return currentTodos.map(todo =>
        todo.id === action.id
          ? { ...todo, ...action.updates }
          : todo
      );
    }
  );
  
  const flushUpdates = async () => {
    if (updateQueue.current.length === 0) return;
    
    const updates = [...updateQueue.current];
    updateQueue.current = [];
    
    try {
      await batchUpdateTodos(updates);
      setTodos(prev =>
        prev.map(todo => {
          const update = updates.find(u => u.id === todo.id);
          return update ? { ...todo, ...update.updates } : todo;
        })
      );
    } catch (error) {
      toast.error('批量更新失败');
    }
  };
  
  const handleUpdate = (id, updates) => {
    // 立即更新UI
    setOptimisticTodos({ id, updates });
    
    // 添加到更新队列
    updateQueue.current.push({ id, updates });
    
    // 延迟批量提交
    clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flushUpdates, 1000);
  };
  
  return (
    <ul>
      {optimisticTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} />
      ))}
    </ul>
  );
}
```

## 第六部分：实战案例

### 6.1 社交媒体点赞系统

```jsx
// Server Actions
'use server';

export async function toggleLike(postId, userId, currentLiked) {
  if (currentLiked) {
    // 取消点赞
    await db.likes.delete({
      where: {
        postId_userId: { postId, userId }
      }
    });
  } else {
    // 点赞
    await db.likes.create({
      data: { postId, userId }
    });
  }
  
  const likesCount = await db.likes.count({
    where: { postId }
  });
  
  return { liked: !currentLiked, likesCount };
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { toggleLike } from './actions';

export default function SocialPost({ post, userId, initialLiked, initialLikesCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    liked,
    (_, newLiked) => newLiked
  );
  
  const [optimisticLikesCount, setOptimisticLikesCount] = useOptimistic(
    likesCount,
    (currentCount, increment) => currentCount + increment
  );
  
  const handleToggleLike = async () => {
    // 立即更新UI
    setOptimisticLiked(!liked);
    setOptimisticLikesCount(liked ? -1 : 1);
    
    try {
      const result = await toggleLike(post.id, userId, liked);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      toast.error('操作失败');
    }
  };
  
  return (
    <article className="social-post">
      <header>
        <img src={post.author.avatar} alt={post.author.name} />
        <span>{post.author.name}</span>
      </header>
      
      <div className="content">{post.content}</div>
      
      <footer>
        <button 
          onClick={handleToggleLike}
          className={optimisticLiked ? 'liked' : ''}
        >
          {optimisticLiked ? '❤️' : '🤍'}
          <span>{optimisticLikesCount}</span>
        </button>
      </footer>
    </article>
  );
}
```

### 6.2 实时协作编辑器

```jsx
// Server Action
'use server';

export async function updateDocument(docId, content) {
  const doc = await db.documents.update({
    where: { id: docId },
    data: { 
      content,
      updatedAt: new Date()
    }
  });
  
  return doc;
}

// Client Component
'use client';

import { useOptimistic, useState, useEffect } from 'react';
import { updateDocument } from './actions';

export default function CollaborativeEditor({ initialDoc }) {
  const [doc, setDoc] = useState(initialDoc);
  
  const [optimisticDoc, setOptimisticDoc] = useOptimistic(
    doc,
    (currentDoc, updates) => ({ ...currentDoc, ...updates })
  );
  
  const handleContentChange = async (newContent) => {
    // 立即更新UI
    setOptimisticDoc({ content: newContent });
    
    try {
      const updatedDoc = await updateDocument(doc.id, newContent);
      setDoc(updatedDoc);
    } catch (error) {
      toast.error('保存失败');
    }
  };
  
  return (
    <div className="editor">
      <header>
        <h2>{optimisticDoc.title}</h2>
        <span className="last-updated">
          最后更新：{optimisticDoc.updatedAt.toLocaleString()}
        </span>
      </header>
      
      <textarea
        value={optimisticDoc.content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="开始编辑..."
      />
    </div>
  );
}
```

### 6.3 购物车系统

```jsx
// Server Actions
'use server';

export async function addToCart(productId, quantity) {
  const cartItem = await db.cartItems.create({
    data: {
      productId,
      quantity,
      userId: (await getSession()).userId
    },
    include: {
      product: true
    }
  });
  
  return cartItem;
}

export async function updateCartQuantity(itemId, quantity) {
  const cartItem = await db.cartItems.update({
    where: { id: itemId },
    data: { quantity },
    include: {
      product: true
    }
  });
  
  return cartItem;
}

export async function removeFromCart(itemId) {
  await db.cartItems.delete({
    where: { id: itemId }
  });
  
  return itemId;
}

// Client Component
'use client';

import { useOptimistic, useState } from 'react';
import { addToCart, updateCartQuantity, removeFromCart } from './actions';

export default function ShoppingCart({ initialCartItems }) {
  const [cartItems, setCartItems] = useState(initialCartItems);
  
  const [optimisticCartItems, setOptimisticCartItems] = useOptimistic(
    cartItems,
    (currentItems, action) => {
      switch (action.type) {
        case 'add':
          return [...currentItems, action.item];
        case 'update':
          return currentItems.map(item =>
            item.id === action.id
              ? { ...item, quantity: action.quantity }
              : item
          );
        case 'remove':
          return currentItems.filter(item => item.id !== action.id);
        default:
          return currentItems;
      }
    }
  );
  
  const handleAddToCart = async (product) => {
    const tempItem = {
      id: `temp-${Date.now()}`,
      product,
      quantity: 1,
      pending: true
    };
    
    setOptimisticCartItems({ type: 'add', item: tempItem });
    
    try {
      const newItem = await addToCart(product.id, 1);
      setCartItems(prev => [...prev, newItem]);
      toast.success('已添加到购物车');
    } catch (error) {
      toast.error('添加失败');
    }
  };
  
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setOptimisticCartItems({ type: 'update', id: itemId, quantity: newQuantity });
    
    try {
      const updatedItem = await updateCartQuantity(itemId, newQuantity);
      setCartItems(prev =>
        prev.map(item => (item.id === itemId ? updatedItem : item))
      );
    } catch (error) {
      toast.error('更新失败');
    }
  };
  
  const handleRemove = async (itemId) => {
    setOptimisticCartItems({ type: 'remove', id: itemId });
    
    try {
      await removeFromCart(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('已从购物车移除');
    } catch (error) {
      toast.error('移除失败');
    }
  };
  
  const total = optimisticCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  return (
    <div className="shopping-cart">
      <h2>购物车 ({optimisticCartItems.length})</h2>
      
      {optimisticCartItems.map(item => (
        <div key={item.id} className={item.pending ? 'pending' : ''}>
          <img src={item.product.image} alt={item.product.name} />
          <div>
            <h3>{item.product.name}</h3>
            <p>¥{item.product.price}</p>
          </div>
          
          <div className="quantity">
            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
              -
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
              +
            </button>
          </div>
          
          <button onClick={() => handleRemove(item.id)}>删除</button>
        </div>
      ))}
      
      <footer>
        <div className="total">总计：¥{total.toFixed(2)}</div>
        <button className="checkout">结算</button>
      </footer>
    </div>
  );
}
```

## 注意事项

### 1. useOptimistic必须在Client Component中

```jsx
// ❌ 错误：在Server Component中
async function ServerComponent() {
  const [optimistic, setOptimistic] = useOptimistic(...);  // 错误！
}

// ✅ 正确：在Client Component中
'use client';

function ClientComponent() {
  const [optimistic, setOptimistic] = useOptimistic(...);  // 正确
}
```

### 2. 失败时自动回滚

```jsx
// useOptimistic会自动回滚
const handleLike = async () => {
  setOptimisticLikes(likes + 1);  // 乐观更新
  
  try {
    await likePost(postId);
  } catch (error) {
    // 无需手动回滚
    // useOptimistic会自动恢复到原始状态
  }
};
```

### 3. 更新实际状态

```jsx
// ✅ 成功后更新实际状态
const handleLike = async () => {
  setOptimisticLikes(likes + 1);
  
  const newLikes = await likePost(postId);
  
  // 必须更新实际状态
  setLikes(newLikes);
};
```

### 4. 避免过度使用

```jsx
// ❌ 不适合乐观更新
// - 复杂的业务逻辑
// - 低成功率操作
// - 需要服务器验证的操作

// ✅ 适合乐观更新
// - 简单的CRUD操作
// - 高成功率操作
// - 用户频繁操作
```

### 5. 处理竞态条件

```jsx
'use client';

import { useOptimistic, useState, useRef } from 'react';

export default function SearchWithRaceCondition() {
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(
    query,
    (_, newQuery) => newQuery
  );
  
  const handleSearch = async (searchQuery) => {
    // 生成请求ID
    const currentRequestId = ++requestId.current;
    
    // 乐观更新
    setOptimisticQuery(searchQuery);
    
    try {
      const results = await searchPosts(searchQuery);
      
      // 只处理最新的请求
      if (currentRequestId === requestId.current) {
        setQuery(searchQuery);
      }
    } catch (error) {
      toast.error('搜索失败');
    }
  };
  
  return (
    <input
      type="search"
      value={optimisticQuery}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

### 6. TypeScript类型定义

```typescript
import { useOptimistic } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

type TodoAction =
  | { type: 'add'; todo: Todo }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; updates: Partial<Todo> };

function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  
  const [optimisticTodos, setOptimisticTodos] = useOptimistic<Todo[], TodoAction>(
    todos,
    (currentTodos, action) => {
      switch (action.type) {
        case 'add':
          return [...currentTodos, action.todo];
        case 'delete':
          return currentTodos.filter(t => t.id !== action.id);
        case 'update':
          return currentTodos.map(t =>
            t.id === action.id ? { ...t, ...action.updates } : t
          );
        default:
          return currentTodos;
      }
    }
  );
  
  // ...
}
```

## 常见问题

### Q1: 什么时候使用乐观更新？

**A:** 适合以下场景：
- 用户操作频繁（点赞、切换状态）
- 成功率高（网络良好）
- 延迟明显（需要提升体验）
- 需要即时反馈（提高流畅度）

### Q2: 乐观更新失败了怎么办？

**A:** useOptimistic会自动回滚到原始状态，你只需提供错误提示即可。无需手动处理回滚逻辑。

### Q3: 可以同时有多个乐观状态吗？

**A:** 可以！每个useOptimistic独立管理自己的状态，互不干扰。

```jsx
const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes, ...);
const [optimisticComments, setOptimisticComments] = useOptimistic(comments, ...);
```

### Q4: useOptimistic和useState有什么区别？

**A:** 
- useState：通用状态管理，需要手动处理所有逻辑
- useOptimistic：专门用于乐观更新，自动处理回滚

### Q5: 如何处理并发更新？

**A:** 使用版本号或时间戳：

```jsx
const [data, setData] = useState({ value: 0, version: 0 });

const [optimisticData, setOptimisticData] = useOptimistic(
  data,
  (current, update) => ({
    ...current,
    ...update,
    version: current.version + 1
  })
);
```

### Q6: 乐观更新会影响SEO吗？

**A:** 不会。乐观更新只影响客户端交互，不影响服务端渲染和SEO。

### Q7: 如何测试乐观更新？

**A:** 使用网络节流模拟慢速网络：

```javascript
// 在Chrome DevTools中
// Network -> Throttling -> Slow 3G

// 或在Server Action中添加延迟
await new Promise(resolve => setTimeout(resolve, 2000));
```

## 总结

### 乐观更新的核心价值

```
✅ 即时UI反馈
✅ 流畅用户体验
✅ 隐藏网络延迟
✅ 自动错误回滚
✅ 简化代码逻辑
✅ 提升应用感知性能
✅ 减少用户等待时间
```

### 适用场景

```
✅ 点赞/收藏
✅ 待办事项切换
✅ 列表增删改
✅ 简单状态切换
✅ 高成功率操作
✅ 社交互动
✅ 实时协作
```

### 不适用场景

```
❌ 支付操作
❌ 关键业务逻辑
❌ 需要强一致性的操作
❌ 低成功率操作
❌ 复杂验证逻辑
```

### 最佳实践

```
1. 只在Client Component中使用
2. 成功后更新实际状态
3. 提供错误提示
4. 显示待确认状态
5. 考虑重试机制
6. 保持操作幂等性
7. 处理竞态条件
8. 合理使用防抖节流
9. 添加TypeScript类型
10. 充分测试错误场景
```

### 性能考虑

```
✅ 减少不必要的网络请求
✅ 使用防抖处理高频操作
✅ 批量处理多个更新
✅ 避免过度渲染
✅ 合理设置重试策略
```

### 与其他特性结合

```jsx
// 1. 与useActionState结合
const [state, formAction] = useActionState(serverAction, initialState);

// 2. 与useFormStatus结合
const { pending } = useFormStatus();

// 3. 与useTransition结合
const [isPending, startTransition] = useTransition();

// 4. 与Server Actions结合
'use server';
export async function updateData(formData) {
  // ...
}
```

useOptimistic让React应用响应更快、体验更好！
