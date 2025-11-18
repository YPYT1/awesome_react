# useMutation数据变更

## 概述

useMutation是TanStack Query中用于处理数据变更操作的Hook,如创建、更新、删除等。它提供了加载状态管理、错误处理、乐观更新、自动失效等功能,是处理数据变更的最佳实践。

## 基础用法

### 创建Mutation

```jsx
import { useMutation } from '@tanstack/react-query';

async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  
  return response.json();
}

function CreateUserForm() {
  const {
    mutate,         // 触发mutation的函数
    mutateAsync,    // 异步版本
    data,           // mutation返回的数据
    error,          // 错误对象
    isLoading,      // 加载状态(旧版API)
    isPending,      // 加载状态(新版API)
    isError,        // 是否有错误
    isSuccess,      // 是否成功
    reset,          // 重置状态
  } = useMutation({
    mutationFn: createUser,
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    mutate({
      name: formData.get('name'),
      email: formData.get('email'),
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
      
      {isError && <div className="error">{error.message}</div>}
      {isSuccess && <div className="success">User created: {data.name}</div>}
    </form>
  );
}
```

### mutate vs mutateAsync

```jsx
function MutateComparison() {
  const { mutate, mutateAsync } = useMutation({
    mutationFn: createUser,
  });
  
  // mutate: 不返回Promise
  const handleWithMutate = () => {
    mutate(
      { name: 'John' },
      {
        onSuccess: (data) => console.log('Success:', data),
        onError: (error) => console.error('Error:', error),
      }
    );
  };
  
  // mutateAsync: 返回Promise
  const handleWithMutateAsync = async () => {
    try {
      const data = await mutateAsync({ name: 'John' });
      console.log('Success:', data);
      
      // 可以继续执行其他异步操作
      await doSomethingElse(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div>
      <button onClick={handleWithMutate}>Use mutate</button>
      <button onClick={handleWithMutateAsync}>Use mutateAsync</button>
    </div>
  );
}
```

## CRUD操作

### Create (创建)

```jsx
function CreateTodo() {
  const queryClient = useQueryClient();
  
  const { mutate, isPending } = useMutation({
    mutationFn: (newTodo) => {
      return fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      }).then(res => res.json());
    },
    
    onSuccess: () => {
      // 使todos查询失效
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      text: e.target.text.value,
      completed: false,
    });
    e.target.reset();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Todo'}
      </button>
    </form>
  );
}
```

### Update (更新)

```jsx
function UpdateTodo({ todoId }) {
  const queryClient = useQueryClient();
  
  const { mutate } = useMutation({
    mutationFn: ({ id, updates }) => {
      return fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).then(res => res.json());
    },
    
    onSuccess: (data, variables) => {
      // 更新单个todo的缓存
      queryClient.setQueryData(['todo', variables.id], data);
      
      // 使todos列表失效
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  const handleToggle = (todo) => {
    mutate({
      id: todo.id,
      updates: { completed: !todo.completed },
    });
  };
  
  return (
    <button onClick={() => handleToggle(todo)}>
      {todo.completed ? 'Undo' : 'Complete'}
    </button>
  );
}
```

### Delete (删除)

```jsx
function DeleteTodo({ todoId }) {
  const queryClient = useQueryClient();
  
  const { mutate, isPending } = useMutation({
    mutationFn: (id) => {
      return fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
    },
    
    onSuccess: (data, deletedId) => {
      // 从缓存中移除
      queryClient.removeQueries({ queryKey: ['todo', deletedId] });
      
      // 使列表失效
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      mutate(todoId);
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## 乐观更新

### 基础乐观更新

```jsx
function OptimisticTodo() {
  const queryClient = useQueryClient();
  
  const { mutate } = useMutation({
    mutationFn: updateTodo,
    
    onMutate: async (newTodo) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      // 保存之前的数据用于回滚
      const previousTodos = queryClient.getQueryData(['todos']);
      
      // 乐观更新
      queryClient.setQueryData(['todos'], (old) => {
        return old.map(todo =>
          todo.id === newTodo.id ? { ...todo, ...newTodo } : todo
        );
      });
      
      // 返回context用于onError
      return { previousTodos };
    },
    
    onError: (err, newTodo, context) => {
      // 回滚
      queryClient.setQueryData(['todos'], context.previousTodos);
      toast.error('Failed to update todo');
    },
    
    onSettled: () => {
      // 重新获取以确保同步
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  const handleToggle = (todo) => {
    mutate({ ...todo, completed: !todo.completed });
  };
  
  return <TodoList onToggle={handleToggle} />;
}
```

### 复杂乐观更新

```jsx
function AdvancedOptimistic() {
  const queryClient = useQueryClient();
  
  const { mutate: likePo st } = useMutation({
    mutationFn: (postId) => {
      return fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      }).then(res => res.json());
    },
    
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      
      const previousPosts = queryClient.getQueryData(['posts']);
      const previousPost = queryClient.getQueryData(['post', postId]);
      
      // 更新列表中的post
      queryClient.setQueryData(['posts'], (old) =>
        old?.map(post =>
          post.id === postId
            ? {
                ...post,
                liked: true,
                likeCount: post.likeCount + 1,
              }
            : post
        )
      );
      
      // 更新单个post
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        liked: true,
        likeCount: old.likeCount + 1,
      }));
      
      return { previousPosts, previousPost };
    },
    
    onError: (err, postId, context) => {
      queryClient.setQueryData(['posts'], context.previousPosts);
      queryClient.setQueryData(['post', postId], context.previousPost);
    },
    
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
  
  return <PostList onLike={likePost} />;
}
```

## 回调函数

### Mutation回调

```jsx
function MutationCallbacks() {
  const { mutate } = useMutation({
    mutationFn: createUser,
    
    // Mutation级别的回调
    onMutate: (variables) => {
      console.log('Mutation starting with:', variables);
      
      // 可以返回context给其他回调使用
      return { startTime: Date.now() };
    },
    
    onSuccess: (data, variables, context) => {
      console.log('Mutation succeeded:', {
        data,
        variables,
        duration: Date.now() - context.startTime,
      });
      
      toast.success(`User ${data.name} created successfully`);
    },
    
    onError: (error, variables, context) => {
      console.error('Mutation failed:', {
        error,
        variables,
        duration: Date.now() - context.startTime,
      });
      
      toast.error(`Failed to create user: ${error.message}`);
    },
    
    onSettled: (data, error, variables, context) => {
      console.log('Mutation settled:', {
        data,
        error,
        variables,
        duration: Date.now() - context.startTime,
      });
    },
  });
  
  // mutate调用时的回调
  const handleCreate = () => {
    mutate(
      { name: 'John', email: 'john@example.com' },
      {
        onSuccess: (data) => {
          console.log('This mutate call succeeded:', data);
          navigate(`/users/${data.id}`);
        },
        onError: (error) => {
          console.error('This mutate call failed:', error);
        },
      }
    );
  };
  
  return <button onClick={handleCreate}>Create User</button>;
}
```

## 缓存失效

### 失效查询

```jsx
import { useQueryClient } from '@tanstack/react-query';

function InvalidateQueries() {
  const queryClient = useQueryClient();
  
  const { mutate } = useMutation({
    mutationFn: updateUser,
    
    onSuccess: (data, variables) => {
      // 失效所有用户相关查询
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // 失效特定用户
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      
      // 失效所有查询
      queryClient.invalidateQueries();
      
      // 精确匹配
      queryClient.invalidateQueries({
        queryKey: ['users'],
        exact: true,
      });
      
      // 使用predicate
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'users' && query.queryKey[1]?.status === 'active',
      });
    },
  });
  
  return <UpdateUserForm onSubmit={mutate} />;
}
```

### 直接更新缓存

```jsx
function DirectCacheUpdate() {
  const queryClient = useQueryClient();
  
  const { mutate } = useMutation({
    mutationFn: updateUser,
    
    onSuccess: (updatedUser) => {
      // 更新单个用户缓存
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      
      // 更新用户列表
      queryClient.setQueryData(['users'], (old) =>
        old?.map(user =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      
      // 部分更新
      queryClient.setQueryData(['user', updatedUser.id], (old) => ({
        ...old,
        ...updatedUser,
      }));
    },
  });
  
  return <UpdateUserForm onSubmit={mutate} />;
}
```

## 批量操作

### 批量mutation

```jsx
function BatchMutation() {
  const queryClient = useQueryClient();
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (userIds) => {
      // 批量删除
      return Promise.all(
        userIds.map(id =>
          fetch(`/api/users/${id}`, { method: 'DELETE' })
        )
      );
    },
    
    onSuccess: (data, deletedIds) => {
      // 更新缓存
      queryClient.setQueryData(['users'], (old) =>
        old?.filter(user => !deletedIds.includes(user.id))
      );
      
      // 移除单个用户缓存
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['user', id] });
      });
      
      toast.success(`Deleted ${deletedIds.length} users`);
    },
  });
  
  const [selectedIds, setSelectedIds] = useState([]);
  
  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedIds.length} users?`)) {
      mutate(selectedIds);
      setSelectedIds([]);
    }
  };
  
  return (
    <div>
      <UserList
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
      />
      <button
        onClick={handleBatchDelete}
        disabled={selectedIds.length === 0 || isPending}
      >
        {isPending ? 'Deleting...' : `Delete ${selectedIds.length} users`}
      </button>
    </div>
  );
}
```

### 串行mutation

```jsx
function SerialMutations() {
  const { mutateAsync: createUser } = useMutation({
    mutationFn: (userData) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }).then(r => r.json()),
  });
  
  const { mutateAsync: createProfile } = useMutation({
    mutationFn: ({ userId, profileData }) =>
      fetch(`/api/users/${userId}/profile`, {
        method: 'POST',
        body: JSON.stringify(profileData),
      }).then(r => r.json()),
  });
  
  const handleCreateUserWithProfile = async (userData, profileData) => {
    try {
      // 1. 创建用户
      const user = await createUser(userData);
      
      // 2. 创建profile
      const profile = await createProfile({
        userId: user.id,
        profileData,
      });
      
      toast.success('User and profile created');
      navigate(`/users/${user.id}`);
    } catch (error) {
      toast.error('Failed to create user');
    }
  };
  
  return <CreateUserProfileForm onSubmit={handleCreateUserWithProfile} />;
}
```

## 文件上传

### 简单文件上传

```jsx
function FileUpload() {
  const { mutate, isPending, progress } = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    
    onSuccess: (data) => {
      toast.success(`File uploaded: ${data.url}`);
    },
  });
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      mutate(file);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isPending}
      />
      {isPending && <div>Uploading...</div>}
    </div>
  );
}
```

### 带进度的上传

```jsx
function UploadWithProgress() {
  const [progress, setProgress] = useState(0);
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (file) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded * 100) / e.total);
            setProgress(percentage);
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
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    },
    
    onSuccess: () => {
      setProgress(0);
      toast.success('Upload completed');
    },
    
    onError: () => {
      setProgress(0);
      toast.error('Upload failed');
    },
  });
  
  return (
    <div>
      <input
        type="file"
        onChange={(e) => mutate(e.target.files[0])}
        disabled={isPending}
      />
      
      {isPending && (
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
```

## 全局Mutation配置

### 默认选项

```jsx
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      // 全局mutation回调
      onError: (error) => {
        console.error('Mutation error:', error);
        toast.error(error.message);
      },
      
      onSuccess: (data) => {
        console.log('Mutation success:', data);
      },
      
      // 重试配置
      retry: 1,
      retryDelay: 1000,
    },
  },
});
```

### Mutation缓存

```jsx
function MutationCache() {
  const queryClient = useQueryClient();
  
  // 访问mutation缓存
  const mutationCache = queryClient.getMutationCache();
  
  // 获取所有mutations
  const allMutations = mutationCache.getAll();
  
  // 查找特定mutation
  const uploadMutations = mutationCache.find({
    mutationKey: ['upload'],
  });
  
  // 订阅mutation更新
  useEffect(() => {
    const unsubscribe = mutationCache.subscribe((event) => {
      if (event.type === 'added') {
        console.log('Mutation added:', event.mutation);
      }
      if (event.type === 'updated') {
        console.log('Mutation updated:', event.mutation);
      }
    });
    
    return unsubscribe;
  }, [mutationCache]);
  
  return <div>Mutations: {allMutations.length}</div>;
}
```

## 总结

useMutation核心特性：

1. **基础用法**：mutate、mutateAsync触发变更
2. **CRUD操作**：Create、Update、Delete封装
3. **乐观更新**：onMutate、回滚机制
4. **回调函数**：onSuccess、onError、onSettled
5. **缓存失效**：invalidateQueries、直接更新
6. **批量操作**：批量mutation、串行mutation
7. **文件上传**：FormData、上传进度
8. **全局配置**：默认选项、mutation缓存

useMutation提供了完整的数据变更解决方案,简化了状态管理和缓存更新。

## 第四部分：useMutation高级模式

### 4.1 Mutation队列和并发控制

```jsx
// 1. Mutation队列管理
class MutationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async add(mutationFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ mutationFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { mutationFn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await mutationFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }
}

const mutationQueue = new MutationQueue();

function useQueuedMutation(mutationFn, options = {}) {
  return useMutation({
    mutationFn: (variables) => mutationQueue.add(() => mutationFn(variables)),
    ...options
  });
}

// 2. 并发限制Mutation
function useConcurrentMutation(mutationFn, { maxConcurrent = 3, ...options } = {}) {
  const [activeCount, setActiveCount] = useState(0);
  const [pendingQueue, setPendingQueue] = useState([]);

  const processPending = useCallback(async () => {
    if (activeCount >= maxConcurrent || pendingQueue.length === 0) return;

    const next = pendingQueue[0];
    setPendingQueue(q => q.slice(1));
    setActiveCount(c => c + 1);

    try {
      const result = await mutationFn(next.variables);
      next.resolve(result);
    } catch (error) {
      next.reject(error);
    } finally {
      setActiveCount(c => c - 1);
    }
  }, [activeCount, maxConcurrent, pendingQueue, mutationFn]);

  useEffect(() => {
    processPending();
  }, [activeCount, pendingQueue, processPending]);

  const mutate = useCallback((variables) => {
    return new Promise((resolve, reject) => {
      setPendingQueue(q => [...q, { variables, resolve, reject }]);
    });
  }, []);

  return { mutate, activeCount, queueLength: pendingQueue.length };
}

// 3. 防抖Mutation
function useDebouncedMutation(mutationFn, delay = 500, options = {}) {
  const timeoutRef = useRef(null);
  const latestVariablesRef = useRef(null);

  const mutation = useMutation({
    mutationFn,
    ...options
  });

  const debouncedMutate = useCallback((variables) => {
    latestVariablesRef.current = variables;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      mutation.mutate(latestVariablesRef.current);
    }, delay);
  }, [mutation, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...mutation,
    mutate: debouncedMutate,
    cancel
  };
}

// 4. 节流Mutation
function useThrottledMutation(mutationFn, delay = 500, options = {}) {
  const lastRunRef = useRef(0);
  const pendingRef = useRef(null);

  const mutation = useMutation({
    mutationFn,
    ...options
  });

  const throttledMutate = useCallback((variables) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    if (timeSinceLastRun >= delay) {
      lastRunRef.current = now;
      mutation.mutate(variables);
    } else {
      pendingRef.current = variables;
      
      setTimeout(() => {
        if (pendingRef.current) {
          lastRunRef.current = Date.now();
          mutation.mutate(pendingRef.current);
          pendingRef.current = null;
        }
      }, delay - timeSinceLastRun);
    }
  }, [mutation, delay]);

  return {
    ...mutation,
    mutate: throttledMutate
  };
}
```

### 4.2 复杂乐观更新模式

```jsx
// 1. 多级乐观更新
function useNestedOptimisticUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComment,
    onMutate: async (newComment) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['comments', newComment.postId] });

      // 保存快照
      const previousPosts = queryClient.getQueryData(['posts']);
      const previousComments = queryClient.getQueryData(['comments', newComment.postId]);

      // 更新评论列表
      queryClient.setQueryData(['comments', newComment.postId], (old) => {
        return old?.map(comment =>
          comment.id === newComment.id
            ? { ...comment, ...newComment }
            : comment
        );
      });

      // 更新帖子中的评论计数
      queryClient.setQueryData(['posts'], (old) => {
        return old?.map(post =>
          post.id === newComment.postId
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        );
      });

      return { previousPosts, previousComments };
    },
    onError: (err, newComment, context) => {
      // 回滚所有更新
      queryClient.setQueryData(['posts'], context.previousPosts);
      queryClient.setQueryData(
        ['comments', newComment.postId],
        context.previousComments
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    }
  });
}

// 2. 条件乐观更新
function useConditionalOptimisticUpdate() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return useMutation({
    mutationFn: updateTodo,
    onMutate: async (newTodo) => {
      // 只在在线时进行乐观更新
      if (!isOnline) return;

      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old) =>
        old?.map(todo => todo.id === newTodo.id ? newTodo : todo)
      );

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
    onSettled: () => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
      }
    }
  });
}

// 3. 带有撤销的乐观更新
function useOptimisticUpdateWithUndo() {
  const queryClient = useQueryClient();
  const [undoStack, setUndoStack] = useState([]);

  const mutation = useMutation({
    mutationFn: updateItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items']);

      queryClient.setQueryData(['items'], (old) =>
        old?.map(item => item.id === newItem.id ? newItem : item)
      );

      // 添加到撤销栈
      const undoEntry = {
        id: Date.now(),
        previousItems,
        newItem
      };
      setUndoStack(stack => [...stack, undoEntry]);

      return { previousItems, undoId: undoEntry.id };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['items'], context.previousItems);
      setUndoStack(stack => stack.filter(entry => entry.id !== context.undoId));
    }
  });

  const undo = useCallback((undoId) => {
    const entry = undoStack.find(e => e.id === undoId);
    if (entry) {
      queryClient.setQueryData(['items'], entry.previousItems);
      setUndoStack(stack => stack.filter(e => e.id !== undoId));
    }
  }, [undoStack, queryClient]);

  return {
    ...mutation,
    undo,
    undoStack
  };
}

// 4. 乐观更新冲突解决
function useOptimisticUpdateWithConflictResolution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDocument,
    onMutate: async (newDoc) => {
      await queryClient.cancelQueries({ queryKey: ['document', newDoc.id] });
      const previousDoc = queryClient.getQueryData(['document', newDoc.id]);

      // 检查版本冲突
      if (previousDoc && previousDoc.version !== newDoc.baseVersion) {
        throw new Error('Version conflict detected');
      }

      // 乐观更新
      queryClient.setQueryData(['document', newDoc.id], {
        ...previousDoc,
        ...newDoc,
        version: previousDoc.version + 1,
        isPending: true
      });

      return { previousDoc };
    },
    onSuccess: (data, variables, context) => {
      // 用服务器返回的数据替换乐观更新
      queryClient.setQueryData(['document', variables.id], data);
    },
    onError: (err, newDoc, context) => {
      if (err.message === 'Version conflict detected') {
        // 冲突处理：合并变更
        const serverDoc = queryClient.getQueryData(['document', newDoc.id]);
        const mergedDoc = mergeDocuments(context.previousDoc, newDoc, serverDoc);
        queryClient.setQueryData(['document', newDoc.id], mergedDoc);
      } else {
        queryClient.setQueryData(['document', newDoc.id], context.previousDoc);
      }
    }
  });
}

function mergeDocuments(base, local, server) {
  // 简单的三向合并逻辑
  return {
    ...server,
    // 保留本地未冲突的更改
    ...Object.keys(local).reduce((acc, key) => {
      if (local[key] !== base[key] && server[key] === base[key]) {
        acc[key] = local[key];
      }
      return acc;
    }, {})
  };
}
```

### 4.3 Mutation重试策略

```jsx
// 1. 自定义重试逻辑
function useRetryableMutation(mutationFn, options = {}) {
  return useMutation({
    mutationFn,
    retry: (failureCount, error) => {
      // 网络错误：重试
      if (error.message === 'Network Error') {
        return failureCount < 3;
      }

      // 429 Too Many Requests：延迟重试
      if (error.status === 429) {
        return failureCount < 5;
      }

      // 500 服务器错误：重试
      if (error.status >= 500) {
        return failureCount < 2;
      }

      // 其他错误：不重试
      return false;
    },
    retryDelay: (attemptIndex, error) => {
      // 429错误：使用Retry-After头
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'];
        return retryAfter ? parseInt(retryAfter) * 1000 : 1000 * attemptIndex;
      }

      // 指数退避
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    ...options
  });
}

// 2. 带有指数退避的重试
function useExponentialBackoffMutation(mutationFn, options = {}) {
  const [retryState, setRetryState] = useState({
    count: 0,
    lastError: null
  });

  const mutation = useMutation({
    mutationFn: async (variables) => {
      try {
        const result = await mutationFn(variables);
        setRetryState({ count: 0, lastError: null });
        return result;
      } catch (error) {
        setRetryState(state => ({
          count: state.count + 1,
          lastError: error
        }));
        throw error;
      }
    },
    retry: 5,
    retryDelay: (attemptIndex) => {
      const baseDelay = 1000;
      const maxDelay = 60000;
      const jitter = Math.random() * 1000;
      
      return Math.min(baseDelay * Math.pow(2, attemptIndex) + jitter, maxDelay);
    },
    ...options
  });

  return {
    ...mutation,
    retryState
  };
}

// 3. 智能重试（基于错误类型）
function useSmartRetryMutation(mutationFn, options = {}) {
  const networkStatus = useNetworkStatus();

  return useMutation({
    mutationFn,
    retry: (failureCount, error) => {
      // 离线时暂停重试
      if (!networkStatus.online) {
        return false;
      }

      // 客户端错误不重试
      if (error.status >= 400 && error.status < 500) {
        return false;
      }

      // 服务器错误重试
      if (error.status >= 500 || error.message === 'Network Error') {
        return failureCount < 3;
      }

      return false;
    },
    networkMode: 'online',
    ...options
  });
}

function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { online };
}
```

### 4.4 Mutation持久化

```jsx
// 1. 离线Mutation队列
class OfflineMutationQueue {
  constructor() {
    this.queue = this.loadQueue();
  }

  loadQueue() {
    const saved = localStorage.getItem('offline-mutations');
    return saved ? JSON.parse(saved) : [];
  }

  saveQueue() {
    localStorage.setItem('offline-mutations', JSON.stringify(this.queue));
  }

  add(mutation) {
    this.queue.push({
      id: Date.now(),
      ...mutation,
      timestamp: new Date().toISOString()
    });
    this.saveQueue();
  }

  remove(id) {
    this.queue = this.queue.filter(m => m.id !== id);
    this.saveQueue();
  }

  getAll() {
    return this.queue;
  }

  clear() {
    this.queue = [];
    this.saveQueue();
  }
}

const offlineQueue = new OfflineMutationQueue();

function useOfflineMutation(mutationFn, options = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 处理离线队列
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processOfflineQueue = async () => {
    const queue = offlineQueue.getAll();
    
    for (const mutation of queue) {
      try {
        await mutationFn(mutation.variables);
        offlineQueue.remove(mutation.id);
        
        if (mutation.queryKey) {
          queryClient.invalidateQueries({ queryKey: mutation.queryKey });
        }
      } catch (error) {
        console.error('Failed to process offline mutation:', error);
      }
    }
  };

  return useMutation({
    mutationFn: async (variables) => {
      if (!isOnline) {
        // 离线时添加到队列
        offlineQueue.add({
          variables,
          queryKey: options.queryKey
        });
        
        // 执行乐观更新
        if (options.onMutate) {
          options.onMutate(variables);
        }
        
        return { offline: true };
      }

      return mutationFn(variables);
    },
    ...options
  });
}

// 2. Mutation状态持久化
function usePersistentMutation(key, mutationFn, options = {}) {
  const [persistedState, setPersistedState] = useState(() => {
    const saved = localStorage.getItem(`mutation-${key}`);
    return saved ? JSON.parse(saved) : null;
  });

  const mutation = useMutation({
    mutationFn,
    onMutate: (variables) => {
      const state = { status: 'loading', variables };
      localStorage.setItem(`mutation-${key}`, JSON.stringify(state));
      setPersistedState(state);
      options.onMutate?.(variables);
    },
    onSuccess: (data, variables) => {
      const state = { status: 'success', data, variables };
      localStorage.setItem(`mutation-${key}`, JSON.stringify(state));
      setPersistedState(state);
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const state = { status: 'error', error: error.message, variables };
      localStorage.setItem(`mutation-${key}`, JSON.stringify(state));
      setPersistedState(state);
      options.onError?.(error, variables);
    },
    ...options
  });

  const clearPersistedState = useCallback(() => {
    localStorage.removeItem(`mutation-${key}`);
    setPersistedState(null);
  }, [key]);

  return {
    ...mutation,
    persistedState,
    clearPersistedState
  };
}
```

### 4.5 Mutation监控和分析

```jsx
// 1. Mutation性能监控
class MutationPerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  start(mutationKey) {
    return {
      startTime: performance.now(),
      mutationKey
    };
  }

  end(context, status) {
    const endTime = performance.now();
    const duration = endTime - context.startTime;

    const metric = {
      mutationKey: context.mutationKey,
      duration,
      status,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(metric);

    // 发送到分析服务
    if (duration > 3000) {
      console.warn('Slow mutation detected:', metric);
    }

    return metric;
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageDuration(mutationKey) {
    const filtered = this.metrics.filter(m => m.mutationKey === mutationKey);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }
}

const mutationMonitor = new MutationPerformanceMonitor();

function useMonitoredMutation(mutationKey, mutationFn, options = {}) {
  return useMutation({
    mutationFn: async (variables) => {
      const context = mutationMonitor.start(mutationKey);
      
      try {
        const result = await mutationFn(variables);
        mutationMonitor.end(context, 'success');
        return result;
      } catch (error) {
        mutationMonitor.end(context, 'error');
        throw error;
      }
    },
    ...options
  });
}

// 2. Mutation错误追踪
class MutationErrorTracker {
  constructor() {
    this.errors = [];
  }

  track(mutationKey, error, variables) {
    const errorEntry = {
      mutationKey,
      error: {
        message: error.message,
        stack: error.stack,
        status: error.status
      },
      variables,
      timestamp: new Date().toISOString()
    };

    this.errors.push(errorEntry);

    // 发送到错误追踪服务
    this.reportError(errorEntry);
  }

  reportError(errorEntry) {
    // 发送到Sentry, LogRocket等
    console.error('Mutation Error:', errorEntry);
  }

  getErrors() {
    return this.errors;
  }

  getErrorRate(mutationKey) {
    const total = this.errors.filter(e => e.mutationKey === mutationKey).length;
    return total;
  }
}

const errorTracker = new MutationErrorTracker();

function useTrackedMutation(mutationKey, mutationFn, options = {}) {
  return useMutation({
    mutationFn,
    onError: (error, variables) => {
      errorTracker.track(mutationKey, error, variables);
      options.onError?.(error, variables);
    },
    ...options
  });
}
```

## useMutation最佳实践总结

```
1. 并发控制
   ✅ 实现Mutation队列
   ✅ 限制并发数量
   ✅ 使用防抖/节流

2. 乐观更新
   ✅ 多级更新处理
   ✅ 冲突解决机制
   ✅ 撤销/重做功能

3. 重试策略
   ✅ 智能重试逻辑
   ✅ 指数退避算法
   ✅ 基于错误类型重试

4. 离线支持
   ✅ 持久化Mutation
   ✅ 离线队列管理
   ✅ 在线时同步

5. 监控分析
   ✅ 性能追踪
   ✅ 错误监控
   ✅ 指标收集
```

useMutation是数据变更的强大工具，合理使用可以构建健壮的数据交互层。
