# SWR Mutation变更

## 概述

SWR Mutation是专门用于处理数据变更操作的Hook,如POST、PUT、DELETE等。它提供了加载状态管理、错误处理、乐观更新等功能,简化了数据变更的开发流程。本文将深入探讨SWR中的数据变更策略。

## useSWRMutation

### 基础使用

```bash
# 安装(已包含在swr中)
npm install swr
```

```jsx
import useSWRMutation from 'swr/mutation';

async function sendRequest(url, { arg }) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then(res => res.json());
}

function CreateUser() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/users',
    sendRequest
  );
  
  const handleSubmit = async (formData) => {
    try {
      const result = await trigger(formData);
      console.log('Created:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleSubmit(Object.fromEntries(formData));
    }}>
      <input name="name" required />
      <button type="submit" disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">Created: {data.name}</div>}
    </form>
  );
}
```

### 返回值

```jsx
function MutationExample() {
  const {
    data,          // 变更返回的数据
    error,         // 错误对象
    trigger,       // 触发变更的函数
    reset,         // 重置状态的函数
    isMutating,    // 是否正在变更
  } = useSWRMutation('/api/user', updateUser);
  
  console.log({
    data,
    error,
    isMutating,
  });
  
  const handleUpdate = async () => {
    await trigger({ name: 'New Name' });
  };
  
  const handleReset = () => {
    reset(); // 清除data和error
  };
  
  return (
    <div>
      <button onClick={handleUpdate} disabled={isMutating}>
        Update
      </button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

## CRUD操作

### Create (创建)

```jsx
async function createUser(url, { arg }) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}

function UserCreate() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/users',
    createUser
  );
  
  const { mutate: mutateUsers } = useSWRConfig();
  
  const handleCreate = async (userData) => {
    try {
      const newUser = await trigger(userData);
      
      // 更新用户列表缓存
      mutateUsers('/api/users');
      
      console.log('Created:', newUser);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return (
    <UserForm
      onSubmit={handleCreate}
      submitting={isMutating}
      error={error}
      success={data}
    />
  );
}
```

### Update (更新)

```jsx
async function updateUser(url, { arg }) {
  const { id, ...updates } = arg;
  
  const response = await fetch(`${url}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  
  return response.json();
}

function UserEdit({ userId }) {
  const { data: user } = useSWR(`/api/users/${userId}`, fetcher);
  
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/users',
    updateUser
  );
  
  const handleUpdate = async (updates) => {
    try {
      await trigger({ id: userId, ...updates });
      
      // 可以在这里显示成功消息
      toast.success('User updated successfully');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <UserForm
      initialValues={user}
      onSubmit={handleUpdate}
      submitting={isMutating}
      error={error}
    />
  );
}
```

### Delete (删除)

```jsx
async function deleteUser(url, { arg }) {
  const response = await fetch(`${url}/${arg}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  
  return { id: arg };
}

function UserDelete({ userId }) {
  const { trigger, isMutating } = useSWRMutation(
    '/api/users',
    deleteUser
  );
  
  const { mutate: mutateUsers } = useSWRConfig();
  
  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await trigger(userId);
      
      // 更新列表缓存
      mutateUsers('/api/users');
      
      // 删除详情缓存
      mutateUsers(`/api/users/${userId}`, undefined, { revalidate: false });
      
      toast.success('User deleted');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };
  
  return (
    <button
      onClick={handleDelete}
      disabled={isMutating}
      className="btn-danger"
    >
      {isMutating ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## 乐观更新

### 基础乐观更新

```jsx
function OptimisticUpdate({ userId }) {
  const { data: user, mutate } = useSWR(`/api/users/${userId}`, fetcher);
  
  const { trigger } = useSWRMutation(
    `/api/users/${userId}`,
    updateUser
  );
  
  const handleUpdate = async (updates) => {
    // 乐观更新UI
    mutate({ ...user, ...updates }, false);
    
    try {
      // 发送请求
      const updatedUser = await trigger(updates);
      
      // 使用服务器返回的数据
      mutate(updatedUser);
    } catch (err) {
      // 回滚到原始数据
      mutate(user);
      console.error('Update failed:', err);
    }
  };
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

### 高级乐观更新

```jsx
function AdvancedOptimisticUpdate({ postId }) {
  const { data: post, mutate: mutatePost } = useSWR(
    `/api/posts/${postId}`,
    fetcher
  );
  
  const { trigger: toggleLike } = useSWRMutation(
    `/api/posts/${postId}/like`,
    likePost
  );
  
  const handleLike = async () => {
    const previousPost = post;
    
    // 乐观更新
    mutatePost(
      {
        ...post,
        liked: !post.liked,
        likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1,
      },
      false
    );
    
    try {
      const updatedPost = await toggleLike();
      mutatePost(updatedPost);
    } catch (err) {
      // 回滚
      mutatePost(previousPost, false);
      toast.error('Failed to update like');
    }
  };
  
  return (
    <div>
      <h2>{post?.title}</h2>
      <button onClick={handleLike} className={post?.liked ? 'liked' : ''}>
        {post?.liked ? '❤️' : '🤍'} {post?.likeCount}
      </button>
    </div>
  );
}

async function likePost(url) {
  const response = await fetch(url, { method: 'POST' });
  return response.json();
}
```

### 列表乐观更新

```jsx
function TodoList() {
  const { data: todos, mutate } = useSWR('/api/todos', fetcher);
  
  const { trigger: addTodo } = useSWRMutation('/api/todos', createTodo);
  const { trigger: deleteTodo } = useSWRMutation('/api/todos', removeTodo);
  
  const handleAdd = async (text) => {
    const optimisticTodo = {
      id: `temp-${Date.now()}`,
      text,
      completed: false,
      _optimistic: true,
    };
    
    // 乐观添加
    mutate([...todos, optimisticTodo], false);
    
    try {
      const newTodo = await addTodo({ text });
      
      // 替换临时todo
      mutate(
        todos.map(t => t.id === optimisticTodo.id ? newTodo : t),
        false
      );
    } catch (err) {
      // 回滚
      mutate(todos, false);
      toast.error('Failed to add todo');
    }
  };
  
  const handleDelete = async (todoId) => {
    const previousTodos = todos;
    
    // 乐观删除
    mutate(todos.filter(t => t.id !== todoId), false);
    
    try {
      await deleteTodo(todoId);
      mutate(); // 重新验证
    } catch (err) {
      // 回滚
      mutate(previousTodos, false);
      toast.error('Failed to delete todo');
    }
  };
  
  return (
    <div>
      <TodoInput onAdd={handleAdd} />
      <ul>
        {todos?.map(todo => (
          <li key={todo.id} className={todo._optimistic ? 'optimistic' : ''}>
            {todo.text}
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 批量操作

### 批量更新

```jsx
function BatchUpdate() {
  const { data: users, mutate } = useSWR('/api/users', fetcher);
  
  const { trigger, isMutating } = useSWRMutation(
    '/api/users/batch',
    batchUpdate
  );
  
  const handleBatchUpdate = async (updates) => {
    const previousUsers = users;
    
    // 乐观更新所有用户
    const optimisticUsers = users.map(user => {
      const update = updates.find(u => u.id === user.id);
      return update ? { ...user, ...update } : user;
    });
    
    mutate(optimisticUsers, false);
    
    try {
      const updatedUsers = await trigger(updates);
      mutate(updatedUsers);
    } catch (err) {
      mutate(previousUsers, false);
      toast.error('Batch update failed');
    }
  };
  
  return (
    <div>
      <UserBatchEditor users={users} onSubmit={handleBatchUpdate} />
      {isMutating && <div>Updating...</div>}
    </div>
  );
}

async function batchUpdate(url, { arg }) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  
  return response.json();
}
```

### 批量删除

```jsx
function BatchDelete() {
  const { data: items, mutate } = useSWR('/api/items', fetcher);
  const [selected, setSelected] = useState([]);
  
  const { trigger, isMutating } = useSWRMutation(
    '/api/items/batch-delete',
    batchDelete
  );
  
  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selected.length} items?`)) return;
    
    const previousItems = items;
    
    // 乐观删除
    mutate(
      items.filter(item => !selected.includes(item.id)),
      false
    );
    
    try {
      await trigger(selected);
      mutate(); // 重新验证
      setSelected([]);
      toast.success(`Deleted ${selected.length} items`);
    } catch (err) {
      mutate(previousItems, false);
      toast.error('Batch delete failed');
    }
  };
  
  return (
    <div>
      <div className="toolbar">
        <span>{selected.length} selected</span>
        <button
          onClick={handleBatchDelete}
          disabled={selected.length === 0 || isMutating}
        >
          {isMutating ? 'Deleting...' : 'Delete Selected'}
        </button>
      </div>
      
      <ItemList
        items={items}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}

async function batchDelete(url, { arg }) {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: arg }),
  });
  
  if (!response.ok) {
    throw new Error('Batch delete failed');
  }
  
  return response.json();
}
```

## 文件上传

### 单文件上传

```jsx
async function uploadFile(url, { arg }) {
  const formData = new FormData();
  formData.append('file', arg.file);
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response.json();
}

function FileUpload() {
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/upload',
    uploadFile
  );
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await trigger({ file });
      toast.success('File uploaded successfully');
      console.log('Uploaded:', result);
    } catch (err) {
      toast.error('Upload failed');
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isMutating}
      />
      
      {isMutating && <div>Uploading...</div>}
      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">File URL: {data.url}</div>}
    </div>
  );
}
```

### 多文件上传

```jsx
async function uploadMultipleFiles(url, { arg }) {
  const formData = new FormData();
  
  arg.files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}

function MultiFileUpload() {
  const [files, setFiles] = useState([]);
  
  const { trigger, isMutating, data } = useSWRMutation(
    '/api/upload/multiple',
    uploadMultipleFiles
  );
  
  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    try {
      const result = await trigger({ files });
      toast.success(`${files.length} files uploaded`);
      setFiles([]);
    } catch (err) {
      toast.error('Upload failed');
    }
  };
  
  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFilesChange}
        disabled={isMutating}
      />
      
      <div className="file-list">
        {files.map((file, index) => (
          <div key={index}>{file.name}</div>
        ))}
      </div>
      
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || isMutating}
      >
        {isMutating ? 'Uploading...' : `Upload ${files.length} files`}
      </button>
      
      {data && (
        <div className="success">
          Uploaded: {data.urls.join(', ')}
        </div>
      )}
    </div>
  );
}
```

### 带进度的上传

```jsx
async function uploadWithProgress(url, { arg }) {
  const { file, onProgress } = arg;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded * 100) / e.total);
        onProgress?.(percentage);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

function FileUploadWithProgress() {
  const [progress, setProgress] = useState(0);
  
  const { trigger, isMutating, error, data } = useSWRMutation(
    '/api/upload',
    uploadWithProgress
  );
  
  const handleUpload = async (file) => {
    setProgress(0);
    
    try {
      const result = await trigger({
        file,
        onProgress: setProgress,
      });
      
      toast.success('Upload completed');
      setProgress(0);
    } catch (err) {
      toast.error('Upload failed');
      setProgress(0);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={isMutating}
      />
      
      {isMutating && (
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
          <span>{progress}%</span>
        </div>
      )}
      
      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">File URL: {data.url}</div>}
    </div>
  );
}
```

## 错误处理

### 重试机制

```jsx
function MutationWithRetry() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/data',
    updateData,
    {
      onError: (err, key, config) => {
        console.error('Mutation failed:', err);
      },
      
      throwOnError: false, // 不抛出错误
    }
  );
  
  const handleUpdate = async (data) => {
    let retries = 3;
    
    while (retries > 0) {
      try {
        await trigger(data);
        break;
      } catch (err) {
        retries--;
        
        if (retries === 0) {
          toast.error('Update failed after 3 retries');
          break;
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };
  
  return (
    <button onClick={() => handleUpdate({ value: 123 })}>
      Update
    </button>
  );
}
```

### 回滚策略

```jsx
function RollbackStrategy({ userId }) {
  const { data: user, mutate } = useSWR(`/api/users/${userId}`, fetcher);
  
  const { trigger } = useSWRMutation(
    `/api/users/${userId}`,
    updateUser,
    {
      onError: (err) => {
        // 自动回滚到服务器数据
        mutate();
        toast.error('Update failed, rolled back');
      },
      
      populateCache: true,  // 自动填充缓存
      revalidate: false,    // 不重新验证
    }
  );
  
  const handleUpdate = async (updates) => {
    const previousUser = user;
    
    // 乐观更新
    mutate({ ...user, ...updates }, false);
    
    try {
      await trigger(updates);
    } catch (err) {
      // 错误已在onError中处理
    }
  };
  
  return (
    <UserForm user={user} onSubmit={handleUpdate} />
  );
}
```

## 总结

SWR Mutation核心特性：

1. **useSWRMutation**：专门的变更Hook
2. **CRUD操作**：Create、Update、Delete封装
3. **乐观更新**：即时UI反馈、错误回滚
4. **批量操作**：批量更新、批量删除
5. **文件上传**：单文件、多文件、进度跟踪
6. **错误处理**：重试机制、回滚策略

合理使用Mutation能够提供流畅的用户体验和可靠的数据操作。
