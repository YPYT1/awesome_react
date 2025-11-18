# SWR乐观更新

## 概述

乐观更新(Optimistic Update)是一种提升用户体验的重要技术,它在服务器响应之前就更新UI,让用户感觉操作立即生效。如果请求失败,则回滚到之前的状态。本文将深入探讨在SWR中实现乐观更新的各种模式和最佳实践。

## 基础乐观更新

### 简单乐观更新

```jsx
import useSWR from 'swr';

function SimpleOptimisticUpdate({ userId }) {
  const { data: user, mutate } = useSWR(`/api/users/${userId}`, fetcher);
  
  const updateName = async (newName) => {
    // 保存当前数据用于回滚
    const previousUser = user;
    
    // 立即更新UI
    mutate({ ...user, name: newName }, false);
    
    try {
      // 发送请求到服务器
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const updatedUser = await response.json();
      
      // 使用服务器返回的数据更新
      mutate(updatedUser);
    } catch (error) {
      // 回滚到之前的数据
      mutate(previousUser, false);
      
      console.error('Failed to update:', error);
      alert('Update failed, please try again');
    }
  };
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => updateName('New Name')}>
        Update Name
      </button>
    </div>
  );
}
```

### 使用mutate选项

```jsx
function OptimisticWithOptions({ userId }) {
  const { data: user, mutate } = useSWR(`/api/users/${userId}`, fetcher);
  
  const updateUser = async (updates) => {
    await mutate(
      // 更新函数
      async () => {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) throw new Error('Update failed');
        return response.json();
      },
      // 选项
      {
        optimisticData: { ...user, ...updates },
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <button onClick={() => updateUser({ name: 'New Name' })}>
        Update
      </button>
    </div>
  );
}
```

## 列表操作

### 添加项目

```jsx
function TodoList() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);
  
  const addTodo = async (text) => {
    // 生成临时ID
    const tempId = `temp-${Date.now()}`;
    
    const newTodo = {
      id: tempId,
      text,
      completed: false,
      _pending: true, // 标记为待处理
    };
    
    // 乐观添加
    mutate([...todos, newTodo], false);
    
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to add todo');
      
      const createdTodo = await response.json();
      
      // 替换临时todo为真实todo
      mutate(
        todos.map(t => t.id === tempId ? createdTodo : t).concat(
          todos.find(t => t.id === tempId) ? [] : [createdTodo]
        ),
        false
      );
    } catch (error) {
      // 移除临时todo
      mutate(todos.filter(t => t.id !== tempId), false);
      
      toast.error('Failed to add todo');
    }
  };
  
  return (
    <div>
      <TodoInput onAdd={addTodo} />
      <ul>
        {todos?.map(todo => (
          <li
            key={todo.id}
            className={todo._pending ? 'pending' : ''}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 删除项目

```jsx
function TodoDelete() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);
  
  const deleteTodo = async (todoId) => {
    // 保存被删除的项目用于回滚
    const deletedTodo = todos.find(t => t.id === todoId);
    
    if (!deletedTodo) return;
    
    // 乐观删除
    mutate(todos.filter(t => t.id !== todoId), false);
    
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      // 重新验证以确保同步
      mutate();
    } catch (error) {
      // 恢复被删除的项目
      const index = todos.findIndex(t => t.id === todoId);
      const restored = [...todos];
      restored.splice(index, 0, deletedTodo);
      
      mutate(restored, false);
      
      toast.error('Failed to delete todo');
    }
  };
  
  return (
    <ul>
      {todos?.map(todo => (
        <li key={todo.id}>
          {todo.text}
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### 更新项目

```jsx
function TodoUpdate() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);
  
  const toggleTodo = async (todoId) => {
    // 找到要更新的项目
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    // 乐观更新
    mutate(
      todos.map(t =>
        t.id === todoId ? { ...t, completed: !t.completed } : t
      ),
      false
    );
    
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const updated = await response.json();
      
      // 使用服务器返回的数据
      mutate(
        todos.map(t => t.id === todoId ? updated : t),
        false
      );
    } catch (error) {
      // 回滚
      mutate(todos, false);
      
      toast.error('Failed to update todo');
    }
  };
  
  return (
    <ul>
      {todos?.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span className={todo.completed ? 'completed' : ''}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

## 复杂场景

### 级联更新

```jsx
function CascadeUpdate({ postId }) {
  const { data: post, mutate: mutatePost } = useSWR(
    `/api/posts/${postId}`,
    fetcher
  );
  
  const { data: user, mutate: mutateUser } = useSWR(
    post ? `/api/users/${post.authorId}` : null,
    fetcher
  );
  
  const { mutate: mutateAllPosts } = useSWRConfig();
  
  const updatePost = async (updates) => {
    const previousPost = post;
    
    // 1. 乐观更新文章
    mutatePost({ ...post, ...updates }, false);
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const updatedPost = await response.json();
      
      // 2. 更新文章数据
      mutatePost(updatedPost);
      
      // 3. 如果更新了作者,需要更新相关缓存
      if (updates.authorId && updates.authorId !== post.authorId) {
        // 更新旧作者的文章列表
        mutateAllPosts(
          `/api/users/${post.authorId}/posts`,
          undefined,
          { revalidate: true }
        );
        
        // 更新新作者的文章列表
        mutateAllPosts(
          `/api/users/${updates.authorId}/posts`,
          undefined,
          { revalidate: true }
        );
      }
      
      // 4. 更新所有文章列表
      mutateAllPosts('/api/posts', undefined, { revalidate: true });
      
      toast.success('Post updated successfully');
    } catch (error) {
      // 回滚
      mutatePost(previousPost, false);
      toast.error('Failed to update post');
    }
  };
  
  return (
    <div>
      <h1>{post?.title}</h1>
      <p>by {user?.name}</p>
      <button onClick={() => updatePost({ title: 'New Title' })}>
        Update Title
      </button>
    </div>
  );
}
```

### 嵌套数据更新

```jsx
function NestedDataUpdate({ userId }) {
  const { data: user, mutate } = useSWR(`/api/users/${userId}`, fetcher);
  
  const updateAddress = async (addressUpdates) => {
    const previousUser = user;
    
    // 乐观更新嵌套数据
    mutate(
      {
        ...user,
        address: {
          ...user.address,
          ...addressUpdates,
        },
      },
      false
    );
    
    try {
      const response = await fetch(`/api/users/${userId}/address`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressUpdates),
      });
      
      if (!response.ok) throw new Error('Update failed');
      
      const updatedUser = await response.json();
      mutate(updatedUser);
    } catch (error) {
      mutate(previousUser, false);
      toast.error('Failed to update address');
    }
  };
  
  const addTag = async (tag) => {
    const previousUser = user;
    
    // 乐观添加标签
    mutate(
      {
        ...user,
        tags: [...(user.tags || []), tag],
      },
      false
    );
    
    try {
      const response = await fetch(`/api/users/${userId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });
      
      if (!response.ok) throw new Error('Failed to add tag');
      
      const updatedUser = await response.json();
      mutate(updatedUser);
    } catch (error) {
      mutate(previousUser, false);
      toast.error('Failed to add tag');
    }
  };
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <div>
        <h3>Address</h3>
        <p>{user?.address?.street}</p>
        <button onClick={() => updateAddress({ street: 'New Street' })}>
          Update Address
        </button>
      </div>
      <div>
        <h3>Tags</h3>
        {user?.tags?.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
        <button onClick={() => addTag('new-tag')}>Add Tag</button>
      </div>
    </div>
  );
}
```

### 批量乐观更新

```jsx
function BatchOptimisticUpdate() {
  const { data: items, mutate } = useSWR('/api/items', fetcher);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const batchUpdate = async (updates) => {
    const previousItems = items;
    
    // 乐观批量更新
    mutate(
      items.map(item =>
        selectedIds.includes(item.id)
          ? { ...item, ...updates }
          : item
      ),
      false
    );
    
    try {
      const response = await fetch('/api/items/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          updates,
        }),
      });
      
      if (!response.ok) throw new Error('Batch update failed');
      
      const updatedItems = await response.json();
      
      // 合并更新后的数据
      mutate(
        items.map(item => {
          const updated = updatedItems.find(u => u.id === item.id);
          return updated || item;
        })
      );
      
      setSelectedIds([]);
      toast.success(`Updated ${selectedIds.length} items`);
    } catch (error) {
      mutate(previousItems, false);
      toast.error('Batch update failed');
    }
  };
  
  const batchDelete = async () => {
    const previousItems = items;
    
    // 乐观批量删除
    mutate(
      items.filter(item => !selectedIds.includes(item.id)),
      false
    );
    
    try {
      const response = await fetch('/api/items/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      
      if (!response.ok) throw new Error('Batch delete failed');
      
      mutate();
      setSelectedIds([]);
      toast.success(`Deleted ${selectedIds.length} items`);
    } catch (error) {
      mutate(previousItems, false);
      toast.error('Batch delete failed');
    }
  };
  
  return (
    <div>
      <div className="toolbar">
        <span>{selectedIds.length} selected</span>
        <button onClick={() => batchUpdate({ status: 'active' })}>
          Mark as Active
        </button>
        <button onClick={batchDelete}>Delete Selected</button>
      </div>
      
      <ItemList
        items={items}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
      />
    </div>
  );
}
```

## 交互优化

### 点赞功能

```jsx
function LikeButton({ postId }) {
  const { data: post, mutate } = useSWR(`/api/posts/${postId}`, fetcher);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const toggleLike = async () => {
    const previousPost = post;
    const wasLiked = post.liked;
    
    // 触发动画
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    // 乐观更新
    mutate(
      {
        ...post,
        liked: !post.liked,
        likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1,
      },
      false
    );
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to toggle like');
      
      const updatedPost = await response.json();
      mutate(updatedPost);
    } catch (error) {
      // 回滚并显示错误
      mutate(previousPost, false);
      toast.error('Failed to update like');
    }
  };
  
  return (
    <button
      onClick={toggleLike}
      className={`like-button ${post?.liked ? 'liked' : ''} ${
        isAnimating ? 'animating' : ''
      }`}
    >
      <span className="heart">{post?.liked ? '❤️' : '🤍'}</span>
      <span className="count">{post?.likeCount || 0}</span>
    </button>
  );
}
```

### 关注功能

```jsx
function FollowButton({ userId }) {
  const { data: currentUser, mutate: mutateCurrentUser } = useSWR(
    '/api/user',
    fetcher
  );
  
  const { data: targetUser, mutate: mutateTargetUser } = useSWR(
    `/api/users/${userId}`,
    fetcher
  );
  
  const isFollowing = currentUser?.following?.includes(userId);
  
  const toggleFollow = async () => {
    const previousCurrentUser = currentUser;
    const previousTargetUser = targetUser;
    
    // 乐观更新当前用户的关注列表
    mutateCurrentUser(
      {
        ...currentUser,
        following: isFollowing
          ? currentUser.following.filter(id => id !== userId)
          : [...currentUser.following, userId],
      },
      false
    );
    
    // 乐观更新目标用户的粉丝数
    mutateTargetUser(
      {
        ...targetUser,
        followerCount: isFollowing
          ? targetUser.followerCount - 1
          : targetUser.followerCount + 1,
      },
      false
    );
    
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to toggle follow');
      
      // 重新验证数据
      mutateCurrentUser();
      mutateTargetUser();
    } catch (error) {
      // 回滚两个缓存
      mutateCurrentUser(previousCurrentUser, false);
      mutateTargetUser(previousTargetUser, false);
      
      toast.error('Failed to update follow status');
    }
  };
  
  return (
    <button
      onClick={toggleFollow}
      className={isFollowing ? 'following' : 'not-following'}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
```

### 投票功能

```jsx
function VoteButtons({ commentId }) {
  const { data: comment, mutate } = useSWR(
    `/api/comments/${commentId}`,
    fetcher
  );
  
  const vote = async (voteType) => {
    const previousComment = comment;
    const currentVote = comment.userVote; // 'up', 'down', or null
    
    let scoreChange = 0;
    let newVote = null;
    
    if (currentVote === voteType) {
      // 取消投票
      scoreChange = voteType === 'up' ? -1 : 1;
      newVote = null;
    } else if (currentVote) {
      // 改变投票
      scoreChange = voteType === 'up' ? 2 : -2;
      newVote = voteType;
    } else {
      // 新投票
      scoreChange = voteType === 'up' ? 1 : -1;
      newVote = voteType;
    }
    
    // 乐观更新
    mutate(
      {
        ...comment,
        score: comment.score + scoreChange,
        userVote: newVote,
      },
      false
    );
    
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: newVote }),
      });
      
      if (!response.ok) throw new Error('Vote failed');
      
      const updatedComment = await response.json();
      mutate(updatedComment);
    } catch (error) {
      mutate(previousComment, false);
      toast.error('Failed to vote');
    }
  };
  
  return (
    <div className="vote-buttons">
      <button
        onClick={() => vote('up')}
        className={comment?.userVote === 'up' ? 'active' : ''}
      >
        ▲
      </button>
      
      <span className="score">{comment?.score || 0}</span>
      
      <button
        onClick={() => vote('down')}
        className={comment?.userVote === 'down' ? 'active' : ''}
      >
        ▼
      </button>
    </div>
  );
}
```

## 错误处理

### 重试策略

```jsx
function OptimisticWithRetry({ todoId }) {
  const { data: todo, mutate } = useSWR(`/api/todos/${todoId}`, fetcher);
  
  const updateWithRetry = async (updates, retries = 3) => {
    const previousTodo = todo;
    
    // 乐观更新
    mutate({ ...todo, ...updates }, false);
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`/api/todos/${todoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) throw new Error('Update failed');
        
        const updatedTodo = await response.json();
        mutate(updatedTodo);
        return;
      } catch (error) {
        if (i === retries - 1) {
          // 最后一次重试失败,回滚
          mutate(previousTodo, false);
          toast.error('Update failed after retries');
        } else {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
  };
  
  return (
    <div>
      <h3>{todo?.text}</h3>
      <button onClick={() => updateWithRetry({ completed: !todo.completed })}>
        Toggle
      </button>
    </div>
  );
}
```

### 冲突解决

```jsx
function ConflictResolution({ documentId }) {
  const { data: document, mutate } = useSWR(
    `/api/documents/${documentId}`,
    fetcher
  );
  
  const updateDocument = async (updates) => {
    const previousDocument = document;
    
    // 乐观更新(包含版本号)
    mutate(
      {
        ...document,
        ...updates,
        version: document.version + 1,
      },
      false
    );
    
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          version: document.version,
        }),
      });
      
      if (response.status === 409) {
        // 版本冲突
        const serverDocument = await response.json();
        
        // 显示冲突解决界面
        const resolved = await showConflictDialog(
          previousDocument,
          updates,
          serverDocument
        );
        
        if (resolved) {
          // 用户解决了冲突,重新提交
          mutate(resolved, false);
          return updateDocument(resolved);
        } else {
          // 用户取消,使用服务器版本
          mutate(serverDocument);
        }
        
        return;
      }
      
      if (!response.ok) throw new Error('Update failed');
      
      const updatedDocument = await response.json();
      mutate(updatedDocument);
    } catch (error) {
      mutate(previousDocument, false);
      toast.error('Failed to update document');
    }
  };
  
  return (
    <div>
      <h1>{document?.title}</h1>
      <p>Version: {document?.version}</p>
      <button onClick={() => updateDocument({ title: 'New Title' })}>
        Update
      </button>
    </div>
  );
}

async function showConflictDialog(local, changes, server) {
  // 显示冲突解决对话框
  return new Promise((resolve) => {
    // 实现冲突解决UI
    // 返回解决后的数据或null
  });
}
```

## 最佳实践

### 乐观更新Hook

```jsx
function useOptimisticUpdate(key, fetcher) {
  const { data, mutate } = useSWR(key, fetcher);
  const [isPending, setIsPending] = useState(false);
  
  const optimisticUpdate = useCallback(
    async (updateFn, options = {}) => {
      const {
        onSuccess,
        onError,
        rollbackOnError = true,
        revalidate = true,
      } = options;
      
      const previousData = data;
      setIsPending(true);
      
      try {
        // 获取乐观数据
        const optimisticData =
          typeof updateFn === 'function' ? updateFn(data) : updateFn;
        
        // 乐观更新
        mutate(optimisticData, false);
        
        // 如果updateFn是async,等待结果
        if (updateFn.constructor.name === 'AsyncFunction') {
          const result = await updateFn(data);
          mutate(result, revalidate);
          onSuccess?.(result);
        } else {
          onSuccess?.(optimisticData);
        }
      } catch (error) {
        if (rollbackOnError) {
          mutate(previousData, false);
        }
        onError?.(error);
      } finally {
        setIsPending(false);
      }
    },
    [data, mutate]
  );
  
  return {
    data,
    isPending,
    optimisticUpdate,
  };
}

// 使用
function TodoItem({ todoId }) {
  const { data: todo, isPending, optimisticUpdate } = useOptimisticUpdate(
    `/api/todos/${todoId}`,
    fetcher
  );
  
  const toggleComplete = () => {
    optimisticUpdate(
      async (currentTodo) => {
        const response = await fetch(`/api/todos/${todoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !currentTodo.completed }),
        });
        
        if (!response.ok) throw new Error('Update failed');
        return response.json();
      },
      {
        onSuccess: () => toast.success('Todo updated'),
        onError: () => toast.error('Failed to update'),
      }
    );
  };
  
  return (
    <div className={isPending ? 'pending' : ''}>
      <input
        type="checkbox"
        checked={todo?.completed}
        onChange={toggleComplete}
      />
      <span>{todo?.text}</span>
    </div>
  );
}
```

## 总结

乐观更新核心要点：

1. **基础模式**：立即更新UI、发送请求、处理结果
2. **列表操作**：添加、删除、更新项目
3. **复杂场景**：级联更新、嵌套数据、批量操作
4. **交互优化**：点赞、关注、投票功能
5. **错误处理**：重试策略、冲突解决
6. **最佳实践**：封装Hook、状态管理、用户反馈

合理使用乐观更新可以显著提升应用的响应速度和用户体验。
