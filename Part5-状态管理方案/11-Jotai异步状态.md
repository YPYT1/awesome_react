# Jotai异步状态

## 概述

Jotai原生支持异步状态管理，可以直接在atom中使用Promise和async/await。本文深入探讨Jotai的异步特性，包括数据获取、错误处理、加载状态管理等。

## 异步Atom基础

### 创建异步Atom

```jsx
import { atom, useAtom } from 'jotai';

// 异步atom
const userAtom = atom(async () => {
  const response = await fetch('/api/user');
  return response.json();
});

// 使用Suspense
function UserProfile() {
  const [user] = useAtom(userAtom);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

### 带参数的异步Atom

```jsx
import { atom, useAtom } from 'jotai';

const userIdAtom = atom(1);

// 依赖其他atom的异步atom
const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

function UserProfile() {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [user] = useAtom(userAtom);

  return (
    <div>
      <select value={userId} onChange={(e) => setUserId(Number(e.target.value))}>
        <option value="1">User 1</option>
        <option value="2">User 2</option>
      </select>
      
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

## 使用Loadable

loadable包装器让你在不使用Suspense的情况下处理异步状态：

```jsx
import { atom, useAtom } from 'jotai';
import { loadable } from 'jotai/utils';

const userAtom = atom(async () => {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
});

// 包装为loadable
const userLoadableAtom = loadable(userAtom);

function UserProfile() {
  const [userLoadable] = useAtom(userLoadableAtom);

  if (userLoadable.state === 'loading') {
    return <div>Loading...</div>;
  }

  if (userLoadable.state === 'hasError') {
    return <div>Error: {userLoadable.error.message}</div>;
  }

  const user = userLoadable.data;
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Loadable状态

```jsx
import { atom, useAtom } from 'jotai';
import { loadable } from 'jotai/utils';

const dataAtom = atom(async () => {
  await delay(1000);
  return { message: 'Hello' };
});

const dataLoadableAtom = loadable(dataAtom);

function DataDisplay() {
  const [loadable] = useAtom(dataLoadableAtom);

  // 三种状态
  switch (loadable.state) {
    case 'loading':
      return <div>Loading...</div>;
    
    case 'hasError':
      return (
        <div>
          <p>Error occurred:</p>
          <pre>{loadable.error.message}</pre>
        </div>
      );
    
    case 'hasData':
      return (
        <div>
          <p>Data: {loadable.data.message}</p>
        </div>
      );
  }
}
```

## 数据获取模式

### 1. 简单数据获取

```jsx
import { atom } from 'jotai';

const postsAtom = atom(async () => {
  const response = await fetch('/api/posts');
  return response.json();
});

// 带缓存的版本
const cachedPostsAtom = atom(async (get) => {
  // Jotai自动缓存Promise结果
  const response = await fetch('/api/posts');
  return response.json();
});
```

### 2. 依赖链式获取

```jsx
// 用户atom
const userIdAtom = atom(1);

const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// 用户的帖子（依赖用户数据）
const userPostsAtom = atom(async (get) => {
  const user = await get(userAtom);
  const response = await fetch(`/api/users/${user.id}/posts`);
  return response.json();
});

// 帖子评论（依赖帖子数据）
const postCommentsAtom = atom(async (get) => {
  const posts = await get(userPostsAtom);
  const firstPost = posts[0];
  const response = await fetch(`/api/posts/${firstPost.id}/comments`);
  return response.json();
});
```

### 3. 并行数据获取

```jsx
const userAtom = atom(async () => {
  const response = await fetch('/api/user');
  return response.json();
});

const postsAtom = atom(async () => {
  const response = await fetch('/api/posts');
  return response.json();
});

const settingsAtom = atom(async () => {
  const response = await fetch('/api/settings');
  return response.json();
});

// 并行获取所有数据
const allDataAtom = atom(async (get) => {
  const [user, posts, settings] = await Promise.all([
    get(userAtom),
    get(postsAtom),
    get(settingsAtom)
  ]);

  return { user, posts, settings };
});

// 使用loadable处理
const allDataLoadableAtom = loadable(allDataAtom);

function Dashboard() {
  const [loadable] = useAtom(allDataLoadableAtom);

  if (loadable.state === 'loading') {
    return <div>Loading dashboard...</div>;
  }

  if (loadable.state === 'hasError') {
    return <div>Error: {loadable.error.message}</div>;
  }

  const { user, posts, settings } = loadable.data;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Posts: {posts.length}</p>
      <p>Theme: {settings.theme}</p>
    </div>
  );
}
```

## 刷新和重新获取

### 手动刷新

```jsx
import { atom, useAtom, useSetAtom } from 'jotai';

const refreshIdAtom = atom(0);

const dataAtom = atom(async (get) => {
  get(refreshIdAtom); // 订阅refreshId
  const response = await fetch('/api/data');
  return response.json();
});

// 刷新atom
const refreshAtom = atom(
  null,
  (get, set) => {
    set(refreshIdAtom, get(refreshIdAtom) + 1);
  }
);

function DataDisplay() {
  const [data] = useAtom(dataAtom);
  const refresh = useSetAtom(refreshAtom);

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataDisplay />
    </Suspense>
  );
}
```

### 定时刷新

```jsx
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

const dataAtom = atom(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

const refreshIdAtom = atom(0);

const autoRefreshDataAtom = atom(async (get) => {
  get(refreshIdAtom);
  const response = await fetch('/api/data');
  return response.json();
});

function AutoRefreshData() {
  const [, setRefreshId] = useAtom(refreshIdAtom);
  const [data] = useAtom(autoRefreshDataAtom);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshId(id => id + 1);
    }, 5000); // 每5秒刷新

    return () => clearInterval(interval);
  }, [setRefreshId]);

  return <div>{JSON.stringify(data)}</div>;
}
```

## 错误处理

### 使用ErrorBoundary

```jsx
import { ErrorBoundary } from 'react-error-boundary';

const userAtom = atom(async () => {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
});

function UserProfile() {
  const [user] = useAtom(userAtom);
  return <div>{user.name}</div>;
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<div>Loading...</div>}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 使用Loadable处理错误

```jsx
import { atom, useAtom, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';

const userIdAtom = atom(1);

const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${userId}`);
  }
  
  return response.json();
});

const userLoadableAtom = loadable(userAtom);

function UserProfile() {
  const [userLoadable] = useAtom(userLoadableAtom);
  const setUserId = useSetAtom(userIdAtom);

  if (userLoadable.state === 'loading') {
    return <div>Loading user...</div>;
  }

  if (userLoadable.state === 'hasError') {
    return (
      <div>
        <p>Error: {userLoadable.error.message}</p>
        <button onClick={() => setUserId(id => id)}>Retry</button>
      </div>
    );
  }

  const user = userLoadable.data;
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 重试机制

```jsx
import { atom, useAtom } from 'jotai';
import { loadable } from 'jotai/utils';

const retryCountAtom = atom(0);

const dataAtom = atom(async (get) => {
  const retryCount = get(retryCountAtom);
  
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('Fetch failed');
    }
    return response.json();
  } catch (error) {
    if (retryCount < 3) {
      // 自动重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      throw error; // 触发重试
    }
    throw error;
  }
});

const dataLoadableAtom = loadable(dataAtom);

const retryAtom = atom(
  null,
  (get, set) => {
    set(retryCountAtom, get(retryCountAtom) + 1);
  }
);

function DataDisplay() {
  const [loadable] = useAtom(dataLoadableAtom);
  const retry = useSetAtom(retryAtom);
  const [retryCount] = useAtom(retryCountAtom);

  if (loadable.state === 'loading') {
    return <div>Loading... (Attempt {retryCount + 1})</div>;
  }

  if (loadable.state === 'hasError') {
    return (
      <div>
        <p>Error: {loadable.error.message}</p>
        <p>Retry count: {retryCount}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return <div>{JSON.stringify(loadable.data)}</div>;
}
```

## 实战案例

### 案例1：搜索功能

```jsx
import { atom, useAtom } from 'jotai';
import { loadable } from 'jotai/utils';
import { debounce } from 'lodash-es';

const searchQueryAtom = atom('');

// 防抖的搜索atom
const debouncedSearchAtom = atom((get) => {
  const query = get(searchQueryAtom);
  return query;
});

// 搜索结果atom
const searchResultsAtom = atom(async (get) => {
  const query = get(debouncedSearchAtom);
  
  if (!query) {
    return [];
  }

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
});

const searchResultsLoadableAtom = loadable(searchResultsAtom);

function SearchBox() {
  const [query, setQuery] = useAtom(searchQueryAtom);
  const [resultsLoadable] = useAtom(searchResultsLoadableAtom);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {resultsLoadable.state === 'loading' && <div>Searching...</div>}

      {resultsLoadable.state === 'hasError' && (
        <div>Error: {resultsLoadable.error.message}</div>
      )}

      {resultsLoadable.state === 'hasData' && (
        <ul>
          {resultsLoadable.data.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 案例2：无限滚动

```jsx
import { atom, useAtom, useSetAtom } from 'jotai';
import { loadable } from 'jotai/utils';

const pageAtom = atom(1);
const allItemsAtom = atom([]);

// 获取当前页数据
const currentPageDataAtom = atom(async (get) => {
  const page = get(pageAtom);
  const response = await fetch(`/api/items?page=${page}`);
  return response.json();
});

const currentPageLoadableAtom = loadable(currentPageDataAtom);

// 追加数据atom
const appendDataAtom = atom(
  null,
  (get, set) => {
    const loadable = get(currentPageLoadableAtom);
    
    if (loadable.state === 'hasData') {
      const currentItems = get(allItemsAtom);
      set(allItemsAtom, [...currentItems, ...loadable.data]);
      set(pageAtom, get(pageAtom) + 1);
    }
  }
);

function InfiniteScroll() {
  const [allItems] = useAtom(allItemsAtom);
  const [loadable] = useAtom(currentPageLoadableAtom);
  const appendData = useSetAtom(appendDataAtom);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    
    if (bottom && loadable.state !== 'loading') {
      appendData();
    }
  };

  useEffect(() => {
    if (allItems.length === 0 && loadable.state === 'hasData') {
      appendData();
    }
  }, []);

  return (
    <div onScroll={handleScroll} style={{ height: '400px', overflow: 'auto' }}>
      {allItems.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
      {loadable.state === 'loading' && <div>Loading more...</div>}
    </div>
  );
}
```

### 案例3：分页数据

```jsx
import { atom, useAtom } from 'jotai';
import { loadable } from 'jotai/utils';

const currentPageAtom = atom(1);
const pageSizeAtom = atom(10);

const paginatedDataAtom = atom(async (get) => {
  const page = get(currentPageAtom);
  const pageSize = get(pageSizeAtom);
  
  const response = await fetch(
    `/api/items?page=${page}&pageSize=${pageSize}`
  );
  return response.json();
});

const paginatedDataLoadableAtom = loadable(paginatedDataAtom);

function PaginatedList() {
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const [loadable] = useAtom(paginatedDataLoadableAtom);

  if (loadable.state === 'loading') {
    return <div>Loading...</div>;
  }

  if (loadable.state === 'hasError') {
    return <div>Error: {loadable.error.message}</div>;
  }

  const { items, totalPages } = loadable.data;

  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>

      <div>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        <span> Page {currentPage} of {totalPages} </span>
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 案例4：数据预取

```jsx
import { atom, useAtom, useSetAtom } from 'jotai';

const userIdAtom = atom(1);

// 当前用户atom
const currentUserAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// 预取下一个用户
const prefetchNextUserAtom = atom(
  null,
  async (get, set) => {
    const currentUserId = get(userIdAtom);
    const nextUserId = currentUserId + 1;
    
    // 触发预取（但不设置为当前用户）
    const response = await fetch(`/api/users/${nextUserId}`);
    const nextUser = await response.json();
    
    // 可以缓存到某个atom中
    console.log('Prefetched next user:', nextUser);
  }
);

function UserProfile() {
  const [userId, setUserId] = useAtom(userIdAtom);
  const [user] = useAtom(currentUserAtom);
  const prefetchNext = useSetAtom(prefetchNextUserAtom);

  useEffect(() => {
    // 预取下一个用户
    prefetchNext();
  }, [userId]);

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => setUserId(id => id + 1)}>
        Next User
      </button>
    </div>
  );
}
```

## 高级异步模式

### 1. Suspense边界优化

```jsx
// 拆分为多个独立的Suspense边界
function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading user...</div>}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<div>Loading posts...</div>}>
        <PostsList />
      </Suspense>

      <Suspense fallback={<div>Loading settings...</div>}>
        <Settings />
      </Suspense>
    </div>
  );
}
```

### 2. 异步依赖优化

```jsx
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

// 创建atom family用于缓存
const userAtomFamily = atomFamily((userId) =>
  atom(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  })
);

// 使用
function UserProfile({ userId }) {
  const userAtom = userAtomFamily(userId);
  const [user] = useAtom(userAtom);

  return <div>{user.name}</div>;
}
```

### 3. 乐观更新

```jsx
const todosAtom = atom([]);

const optimisticAddTodoAtom = atom(
  null,
  async (get, set, newTodo) => {
    const tempId = Date.now();
    const optimisticTodo = { ...newTodo, id: tempId, pending: true };

    // 立即更新UI
    set(todosAtom, [...get(todosAtom), optimisticTodo]);

    try {
      // 发送到服务器
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo)
      });
      const savedTodo = await response.json();

      // 替换为真实数据
      set(
        todosAtom,
        get(todosAtom).map(todo =>
          todo.id === tempId ? savedTodo : todo
        )
      );
    } catch (error) {
      // 失败则移除
      set(
        todosAtom,
        get(todosAtom).filter(todo => todo.id !== tempId)
      );
      throw error;
    }
  }
);
```

## 最佳实践

### 1. 错误边界策略

```jsx
// 为不同数据层级设置错误边界
<ErrorBoundary fallback={<AppError />}>
  <Suspense fallback={<AppLoading />}>
    <ErrorBoundary fallback={<UserError />}>
      <Suspense fallback={<UserLoading />}>
        <UserData />
      </Suspense>
    </ErrorBoundary>

    <ErrorBoundary fallback={<PostsError />}>
      <Suspense fallback={<PostsLoading />}>
        <PostsData />
      </Suspense>
    </ErrorBoundary>
  </Suspense>
</ErrorBoundary>
```

### 2. 加载状态优化

```jsx
// 使用loadable避免Suspense瀑布
const dataLoadableAtom = loadable(dataAtom);

function Component() {
  const [loadable] = useAtom(dataLoadableAtom);

  // 可以立即显示loading，而不是等待Suspense
  if (loadable.state === 'loading') {
    return <Skeleton />;
  }

  // ...
}
```

### 3. 数据刷新策略

```jsx
// 结合refreshId和时间戳
const refreshIdAtom = atom(0);
const lastFetchAtom = atom(0);

const dataAtom = atom(async (get) => {
  get(refreshIdAtom);
  const now = Date.now();
  const lastFetch = get(lastFetchAtom);

  // 避免频繁刷新
  if (now - lastFetch < 1000) {
    return get(cachedDataAtom);
  }

  const response = await fetch('/api/data');
  const data = await response.json();
  
  set(lastFetchAtom, now);
  set(cachedDataAtom, data);
  
  return data;
});
```

## 总结

Jotai的异步状态管理简洁而强大，关键要点：

1. **原生async支持**：atom可以直接返回Promise
2. **Suspense集成**：自动与React Suspense配合
3. **Loadable工具**：灵活处理加载、错误状态
4. **刷新机制**：通过refreshId触发重新获取
5. **错误处理**：ErrorBoundary和loadable两种方式
6. **性能优化**：合理拆分Suspense边界、使用atomFamily

Jotai的异步模式让数据获取变得简单而优雅，特别适合现代React应用。

