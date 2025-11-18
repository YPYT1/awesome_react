# useOptimistic实战案例

## 学习目标

通过本章学习，你将掌握：

- 社交媒体点赞系统
- 评论功能实现
- 购物车乐观更新
- 任务管理系统
- 实时协作编辑
- 离线优先应用
- 复杂状态管理
- 性能优化技巧

## 第一部分：社交媒体点赞系统

### 1.1 完整的点赞组件

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { likePost, unlikePost } from './actions';
import { HeartIcon, HeartFilledIcon } from './icons';

export default function PostLikeButton({ 
  postId, 
  initialLikes, 
  initialIsLiked 
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [error, setError] = useState(null);
  
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    { count: likes, liked: isLiked },
    (state, delta) => ({
      count: state.count + delta,
      liked: delta > 0 ? true : false
    })
  );
  
  const handleToggleLike = async () => {
    setError(null);
    
    const delta = isLiked ? -1 : 1;
    
    // 乐观更新
    addOptimisticLike(delta);
    
    try {
      const result = isLiked 
        ? await unlikePost(postId)
        : await likePost(postId);
      
      // 成功
      setLikes(result.likes);
      setIsLiked(result.isLiked);
    } catch (error) {
      setError('操作失败，请重试');
      
      // 自动回滚
      setTimeout(() => setError(null), 3000);
    }
  };
  
  return (
    <div className="like-button-container">
      <button 
        onClick={handleToggleLike}
        className={`like-button ${optimisticLikes.liked ? 'liked' : ''}`}
        aria-label={optimisticLikes.liked ? '取消点赞' : '点赞'}
      >
        {optimisticLikes.liked ? <HeartFilledIcon /> : <HeartIcon />}
        <span>{optimisticLikes.count}</span>
      </button>
      
      {error && (
        <div className="error-tooltip">{error}</div>
      )}
    </div>
  );
}

// actions.js
'use server';

export async function likePost(postId) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('请先登录');
  }
  
  // 检查是否已点赞
  const existingLike = await db.likes.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId
      }
    }
  });
  
  if (existingLike) {
    throw new Error('已经点赞过了');
  }
  
  // 创建点赞记录
  await db.likes.create({
    data: {
      userId: user.id,
      postId
    }
  });
  
  // 增加计数
  const post = await db.post.update({
    where: { id: postId },
    data: {
      likes: { increment: 1 }
    },
    select: { likes: true }
  });
  
  return {
    likes: post.likes,
    isLiked: true
  };
}

export async function unlikePost(postId) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('请先登录');
  }
  
  // 删除点赞记录
  await db.likes.delete({
    where: {
      userId_postId: {
        userId: user.id,
        postId
      }
    }
  });
  
  // 减少计数
  const post = await db.post.update({
    where: { id: postId },
    data: {
      likes: { decrement: 1 }
    },
    select: { likes: true }
  });
  
  return {
    likes: post.likes,
    isLiked: false
  };
}
```

### 1.2 收藏功能

```jsx
'use client';

import { useOptimistic, useState, useTransition } from 'react';

export default function BookmarkButton({ postId, initialBookmarked }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    bookmarked,
    (_, newState) => newState
  );
  
  const handleToggle = () => {
    const newState = !bookmarked;
    
    startTransition(async () => {
      setOptimisticBookmarked(newState);
      
      try {
        await toggleBookmark(postId, newState);
        setBookmarked(newState);
      } catch (error) {
        console.error('收藏操作失败', error);
      }
    });
  };
  
  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={optimisticBookmarked ? 'bookmarked' : ''}
    >
      {optimisticBookmarked ? '已收藏' : '收藏'}
    </button>
  );
}
```

### 1.3 关注系统

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { followUser, unfollowUser } from './actions';

export default function FollowButton({ userId, initialFollowing }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    following,
    (_, newValue) => newValue
  );
  
  const handleToggle = async () => {
    const newState = !following;
    
    setPending(true);
    setOptimisticFollowing(newState);
    
    try {
      if (newState) {
        await followUser(userId);
      } else {
        await unfollowUser(userId);
      }
      
      setFollowing(newState);
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setPending(false);
    }
  };
  
  return (
    <button 
      onClick={handleToggle}
      disabled={pending}
      className={optimisticFollowing ? 'following' : ''}
    >
      {optimisticFollowing ? '已关注' : '关注'}
    </button>
  );
}
```

## 第二部分：评论系统

### 2.1 发布评论

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { postComment } from './actions';

export default function CommentForm({ postId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => [...state, newComment]
  );
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    // 创建临时评论
    const tempComment = {
      id: `temp-${Date.now()}`,
      text,
      author: currentUser,
      createdAt: new Date().toISOString(),
      pending: true
    };
    
    // 乐观添加
    addOptimisticComment(tempComment);
    
    // 清空输入框
    setText('');
    
    try {
      const newComment = await postComment(postId, text);
      
      // 成功：更新实际状态
      setComments(prev => [...prev, newComment]);
    } catch (error) {
      // 失败：恢复输入框
      setText(text);
      alert('发布失败，请重试');
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="写下你的评论..."
        />
        <button type="submit" disabled={!text.trim()}>
          发布
        </button>
      </form>
      
      <CommentList comments={optimisticComments} />
    </div>
  );
}

function CommentList({ comments }) {
  return (
    <div className="comments">
      {comments.map(comment => (
        <div 
          key={comment.id} 
          className={`comment ${comment.pending ? 'pending' : ''}`}
        >
          <div className="author">{comment.author.name}</div>
          <div className="text">{comment.text}</div>
          <div className="date">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
          {comment.pending && <div className="badge">发布中...</div>}
        </div>
      ))}
    </div>
  );
}
```

### 2.2 删除评论

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function Comment({ comment, onDelete }) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState(null);
  
  const [optimisticDeleted, setOptimisticDeleted] = useOptimistic(
    isDeleted,
    (_, value) => value
  );
  
  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return;
    
    // 乐观删除
    setOptimisticDeleted(true);
    
    try {
      await deleteComment(comment.id);
      setIsDeleted(true);
      onDelete(comment.id);
    } catch (error) {
      setError('删除失败');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  if (optimisticDeleted && !error) {
    return null;  // 立即隐藏
  }
  
  return (
    <div className="comment">
      <p>{comment.text}</p>
      <button onClick={handleDelete}>删除</button>
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

### 2.3 评论点赞

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function CommentLikes({ commentId, initialLikes, initialIsLiked }) {
  const [state, setState] = useState({
    likes: initialLikes,
    isLiked: initialIsLiked
  });
  
  const [optimisticState, updateOptimistic] = useOptimistic(
    state,
    (current, liked) => ({
      likes: liked ? current.likes + 1 : current.likes - 1,
      isLiked: liked
    })
  );
  
  const handleToggle = async () => {
    const newLiked = !state.isLiked;
    
    updateOptimistic(newLiked);
    
    try {
      const result = await toggleCommentLike(commentId, newLiked);
      setState(result);
    } catch (error) {
      console.error('操作失败');
    }
  };
  
  return (
    <button 
      onClick={handleToggle}
      className={optimisticState.isLiked ? 'liked' : ''}
    >
      👍 {optimisticState.likes}
    </button>
  );
}
```

## 第三部分：购物车系统

### 3.1 添加到购物车

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { addToCart } from './actions';

export default function AddToCartButton({ product }) {
  const [cart, setCart] = useState([]);
  const [addedItems, setAddedItems] = useState(new Set());
  
  const [optimisticCart, addOptimisticItem] = useOptimistic(
    cart,
    (state, item) => [...state, item]
  );
  
  const handleAddToCart = async () => {
    // 防止重复点击
    if (addedItems.has(product.id)) return;
    
    const tempItem = {
      id: `temp-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      pending: true
    };
    
    // 标记为已添加
    setAddedItems(prev => new Set([...prev, product.id]));
    
    // 乐观添加
    addOptimisticItem(tempItem);
    
    try {
      const newItem = await addToCart(product.id);
      
      // 成功
      setCart(prev => [...prev, newItem]);
      
      // 显示成功提示
      showToast(`${product.name} 已添加到购物车`);
    } catch (error) {
      alert('添加失败，请重试');
    } finally {
      // 解除限制
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };
  
  const isInCart = optimisticCart.some(
    item => item.productId === product.id
  );
  
  return (
    <button 
      onClick={handleAddToCart}
      disabled={addedItems.has(product.id)}
    >
      {isInCart ? '已在购物车' : '加入购物车'}
    </button>
  );
}
```

### 3.2 更新商品数量

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function CartItem({ item }) {
  const [quantity, setQuantity] = useState(item.quantity);
  
  const [optimisticQuantity, updateQuantity] = useOptimistic(
    quantity,
    (_, newQty) => newQty
  );
  
  const handleUpdateQuantity = async (delta) => {
    const newQty = Math.max(1, quantity + delta);
    
    updateQuantity(newQty);
    
    try {
      await updateCartItemQuantity(item.id, newQty);
      setQuantity(newQty);
    } catch (error) {
      alert('更新失败');
    }
  };
  
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="info">
        <h3>{item.name}</h3>
        <p>${item.price}</p>
      </div>
      
      <div className="quantity-control">
        <button onClick={() => handleUpdateQuantity(-1)}>-</button>
        <span>{optimisticQuantity}</span>
        <button onClick={() => handleUpdateQuantity(1)}>+</button>
      </div>
      
      <div className="subtotal">
        ${(item.price * optimisticQuantity).toFixed(2)}
      </div>
    </div>
  );
}
```

### 3.3 删除购物车商品

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function ShoppingCart({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (state, removeId) => state.filter(item => item.id !== removeId)
  );
  
  const handleRemove = async (id) => {
    // 乐观删除
    removeOptimistic(id);
    
    try {
      await removeFromCart(id);
      
      // 成功
      setItems(prev => prev.filter(item => item.id !== id));
      
      showToast('商品已移出购物车');
    } catch (error) {
      alert('删除失败');
    }
  };
  
  const total = optimisticItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  return (
    <div className="shopping-cart">
      <h2>购物车 ({optimisticItems.length})</h2>
      
      {optimisticItems.length === 0 ? (
        <p>购物车是空的</p>
      ) : (
        <>
          {optimisticItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>
                  ${item.price} × {item.quantity} = 
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <button onClick={() => handleRemove(item.id)}>
                删除
              </button>
            </div>
          ))}
          
          <div className="total">
            总计: ${total.toFixed(2)}
          </div>
          
          <button className="checkout">去结算</button>
        </>
      )}
    </div>
  );
}
```

## 第四部分：任务管理系统

### 4.1 完整的Todo应用

```jsx
'use client';

import { useOptimistic, useState } from 'react';
import { 
  addTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodo 
} from './actions';

export default function TodoApp({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [text, setText] = useState('');
  
  const [optimisticTodos, updateOptimistic] = useOptimistic(
    todos,
    (state, action) => {
      switch (action.type) {
        case 'add':
          return [...state, action.todo];
          
        case 'update':
          return state.map(todo =>
            todo.id === action.id
              ? { ...todo, ...action.updates }
              : todo
          );
          
        case 'delete':
          return state.filter(todo => todo.id !== action.id);
          
        case 'toggle':
          return state.map(todo =>
            todo.id === action.id
              ? { ...todo, completed: !todo.completed }
              : todo
          );
          
        default:
          return state;
      }
    }
  );
  
  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    const tempTodo = {
      id: `temp-${Date.now()}`,
      text,
      completed: false,
      pending: true
    };
    
    updateOptimistic({ type: 'add', todo: tempTodo });
    setText('');
    
    try {
      const newTodo = await addTodo(text);
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      setText(text);
      alert('添加失败');
    }
  };
  
  const handleToggle = async (id) => {
    updateOptimistic({ type: 'toggle', id });
    
    try {
      const updated = await toggleTodo(id);
      setTodos(prev =>
        prev.map(todo => todo.id === id ? updated : todo)
      );
    } catch (error) {
      alert('更新失败');
    }
  };
  
  const handleDelete = async (id) => {
    updateOptimistic({ type: 'delete', id });
    
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      alert('删除失败');
    }
  };
  
  const handleUpdate = async (id, newText) => {
    updateOptimistic({ 
      type: 'update', 
      id, 
      updates: { text: newText } 
    });
    
    try {
      const updated = await updateTodo(id, newText);
      setTodos(prev =>
        prev.map(todo => todo.id === id ? updated : todo)
      );
    } catch (error) {
      alert('更新失败');
    }
  };
  
  const stats = {
    total: optimisticTodos.length,
    completed: optimisticTodos.filter(t => t.completed).length,
    pending: optimisticTodos.filter(t => t.pending).length
  };
  
  return (
    <div className="todo-app">
      <h1>待办事项</h1>
      
      <div className="stats">
        <span>总计: {stats.total}</span>
        <span>已完成: {stats.completed}</span>
        <span>待确认: {stats.pending}</span>
      </div>
      
      <form onSubmit={handleAdd}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="添加新任务..."
        />
        <button type="submit">添加</button>
      </form>
      
      <ul className="todo-list">
        {optimisticTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  
  const handleSave = () => {
    if (text.trim() && text !== todo.text) {
      onUpdate(todo.id, text);
    }
    setEditing(false);
  };
  
  return (
    <li className={`todo-item ${todo.pending ? 'pending' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      
      {editing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
        />
      ) : (
        <span 
          className={todo.completed ? 'completed' : ''}
          onDoubleClick={() => setEditing(true)}
        >
          {todo.text}
        </span>
      )}
      
      {todo.pending && <span className="badge">...</span>}
      
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </li>
  );
}
```

### 4.2 批量操作

```jsx
'use client';

import { useOptimistic, useState } from 'react';

export default function TodoBatchActions({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [selected, setSelected] = useState([]);
  
  const [optimisticTodos, updateOptimistic] = useOptimistic(
    todos,
    (state, action) => {
      switch (action.type) {
        case 'complete':
          return state.map(todo =>
            action.ids.includes(todo.id)
              ? { ...todo, completed: true, pending: true }
              : todo
          );
          
        case 'delete':
          return state.filter(todo => !action.ids.includes(todo.id));
          
        default:
          return state;
      }
    }
  );
  
  const handleBatchComplete = async () => {
    if (selected.length === 0) return;
    
    updateOptimistic({ type: 'complete', ids: selected });
    
    try {
      await batchCompleteTodos(selected);
      
      setTodos(prev =>
        prev.map(todo =>
          selected.includes(todo.id)
            ? { ...todo, completed: true }
            : todo
        )
      );
      
      setSelected([]);
    } catch (error) {
      alert('批量操作失败');
    }
  };
  
  const handleBatchDelete = async () => {
    if (selected.length === 0) return;
    
    if (!confirm(`确定要删除 ${selected.length} 项？`)) return;
    
    updateOptimistic({ type: 'delete', ids: selected });
    
    try {
      await batchDeleteTodos(selected);
      
      setTodos(prev =>
        prev.filter(todo => !selected.includes(todo.id))
      );
      
      setSelected([]);
    } catch (error) {
      alert('批量删除失败');
    }
  };
  
  return (
    <div>
      <div className="batch-actions">
        <span>已选择 {selected.length} 项</span>
        <button onClick={handleBatchComplete}>批量完成</button>
        <button onClick={handleBatchDelete}>批量删除</button>
      </div>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={selected.includes(todo.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelected(prev => [...prev, todo.id]);
                } else {
                  setSelected(prev => prev.filter(id => id !== todo.id));
                }
              }}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            {todo.pending && <span>...</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 第五部分：实时协作编辑

### 5.1 文档协作编辑

```jsx
'use client';

import { useOptimistic, useState, useEffect } from 'react';

export default function CollaborativeEditor({ documentId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [localChanges, setLocalChanges] = useState([]);
  
  const [optimisticContent, addOptimisticChange] = useOptimistic(
    content,
    (current, change) => applyChange(current, change)
  );
  
  const handleChange = async (change) => {
    // 乐观应用
    addOptimisticChange(change);
    
    // 添加到本地队列
    setLocalChanges(prev => [...prev, change]);
    
    try {
      // 发送到服务器
      await saveChange(documentId, change);
      
      // 成功：更新实际内容
      setContent(prev => applyChange(prev, change));
      
      // 移除队列
      setLocalChanges(prev => prev.filter(c => c.id !== change.id));
    } catch (error) {
      // 失败：保留在队列中稍后重试
      console.error('保存失败');
    }
  };
  
  // 监听其他用户的更改
  useEffect(() => {
    const unsubscribe = subscribeToChanges(documentId, (remoteChange) => {
      setContent(prev => applyChange(prev, remoteChange));
    });
    
    return unsubscribe;
  }, [documentId]);
  
  // 定期重试失败的更改
  useEffect(() => {
    if (localChanges.length === 0) return;
    
    const timer = setInterval(async () => {
      for (const change of localChanges) {
        try {
          await saveChange(documentId, change);
          setLocalChanges(prev => prev.filter(c => c.id !== change.id));
        } catch (error) {
          // 继续重试
        }
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [localChanges, documentId]);
  
  return (
    <div>
      <textarea
        value={optimisticContent}
        onChange={(e) => {
          const change = {
            id: Date.now(),
            type: 'replace',
            content: e.target.value
          };
          handleChange(change);
        }}
      />
      
      {localChanges.length > 0 && (
        <div className="sync-status">
          正在同步 {localChanges.length} 处更改...
        </div>
      )}
    </div>
  );
}

function applyChange(content, change) {
  switch (change.type) {
    case 'replace':
      return change.content;
    case 'insert':
      return content.slice(0, change.position) +
             change.text +
             content.slice(change.position);
    case 'delete':
      return content.slice(0, change.start) +
             content.slice(change.end);
    default:
      return content;
  }
}
```

## 注意事项

### 1. 防止重复提交

```jsx
// ✅ 使用状态跟踪
const [pending, setPending] = useState(false);

const handleSubmit = async () => {
  if (pending) return;  // 防止重复
  
  setPending(true);
  try {
    await submitData();
  } finally {
    setPending(false);
  }
};
```

### 2. 处理并发冲突

```jsx
// ✅ 版本控制
const handleUpdate = async (id, newData, version) => {
  try {
    await updateWithVersion(id, newData, version);
  } catch (error) {
    if (error.code === 'VERSION_CONFLICT') {
      // 重新获取最新数据
      const latest = await fetchLatest(id);
      alert('数据已被其他用户修改，请刷新后重试');
    }
  }
};
```

### 3. 离线支持

```jsx
// ✅ 队列系统
const [queue, setQueue] = useState([]);

useEffect(() => {
  const handleOnline = async () => {
    // 重新上线时处理队列
    for (const action of queue) {
      try {
        await action.execute();
        setQueue(prev => prev.filter(a => a.id !== action.id));
      } catch (error) {
        // 继续保留在队列中
      }
    }
  };
  
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, [queue]);
```

## 常见问题

### Q1: 如何处理长时间pending的操作？

**A:** 设置超时和重试机制。

### Q2: 如何显示多个用户的乐观更新？

**A:** 为每个用户维护独立的optimistic状态，最终合并到共享状态。

### Q3: 如何避免乐观更新的闪烁？

**A:** 使用CSS过渡动画，延迟显示错误状态。

### Q4: 如何测试乐观更新？

**A:** 模拟慢网络和失败场景，验证回滚行为。

## 总结

### 实战要点

```
✅ 社交功能（点赞、评论、关注）
✅ 购物车操作
✅ 任务管理
✅ 批量操作
✅ 实时协作
✅ 离线支持
✅ 防重复提交
✅ 错误处理
```

### 最佳实践

```
1. 立即反馈
2. 平滑过渡
3. 清晰状态
4. 错误恢复
5. 防止冲突
6. 队列管理
7. 性能优化
```

通过这些实战案例，你可以在真实项目中自信地使用useOptimistic！
