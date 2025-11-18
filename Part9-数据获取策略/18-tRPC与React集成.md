# tRPC与React集成

## 概述

tRPC提供了与React的深度集成,通过@trpc/react-query包结合TanStack Query,提供了强大的类型安全数据获取方案。本文将详细介绍tRPC在React应用中的各种集成模式和最佳实践。

## 项目结构

### Monorepo结构

```
my-app/
  ├── apps/
  │   ├── web/              # Next.js/React前端
  │   │   ├── pages/
  │   │   ├── components/
  │   │   └── utils/
  │   └── server/           # tRPC后端
  │       ├── routers/
  │       ├── context.ts
  │       └── trpc.ts
  ├── packages/
  │   └── api/              # 共享类型
  │       └── index.ts
  └── package.json
```

### 独立项目结构

```
frontend/
  ├── src/
  │   ├── components/
  │   ├── hooks/
  │   ├── utils/
  │   │   └── trpc.ts
  │   └── types/
  │       └── api.ts       # 从后端导入类型
  └── package.json

backend/
  ├── src/
  │   ├── routers/
  │   ├── types/
  │   ├── context.ts
  │   └── index.ts
  └── package.json
```

## React Hook模式

### 自定义查询Hook

```tsx
// hooks/useUser.ts
import { trpc } from '../utils/trpc';

export function useUser(userId: string | undefined) {
  const query = trpc.user.getUser.useQuery(
    { id: userId! },
    {
      enabled: !!userId,
      staleTime: 1000 * 60 * 5,
    }
  );
  
  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// 使用
function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading, error } = useUser(userId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{user?.name}</div>;
}
```

### 自定义Mutation Hook

```tsx
// hooks/useCreateUser.ts
import { trpc } from '../utils/trpc';
import { toast } from 'react-hot-toast';

export function useCreateUser() {
  const utils = trpc.useContext();
  
  return trpc.user.createUser.useMutation({
    onMutate: async (newUser) => {
      // 取消进行中的查询
      await utils.user.getUsers.cancel();
      
      // 保存当前数据
      const previousUsers = utils.user.getUsers.getData();
      
      // 乐观更新
      const tempUser = {
        id: `temp-${Date.now()}`,
        ...newUser,
        createdAt: new Date(),
      };
      
      utils.user.getUsers.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          users: [tempUser, ...old.users],
        };
      });
      
      return { previousUsers };
    },
    
    onError: (err, newUser, context) => {
      // 回滚
      utils.user.getUsers.setData(undefined, context?.previousUsers);
      toast.error(`Error: ${err.message}`);
    },
    
    onSuccess: (data) => {
      toast.success(`User ${data.name} created!`);
    },
    
    onSettled: () => {
      // 重新获取
      utils.user.getUsers.invalidate();
    },
  });
}

// 使用
function CreateUserButton() {
  const createUser = useCreateUser();
  
  const handleClick = () => {
    createUser.mutate({
      name: 'John Doe',
      email: 'john@example.com',
    });
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={createUser.isLoading}
    >
      {createUser.isLoading ? 'Creating...' : 'Create User'}
    </button>
  );
}
```

## 组件模式

### Provider模式

```tsx
// providers/TRPCProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
      },
    },
  }));
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL + '/trpc',
          
          // 自定义headers
          headers: () => {
            const token = localStorage.getItem('token');
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
        }),
      ],
    })
  );
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// App.tsx
import { TRPCProvider } from './providers/TRPCProvider';

function App() {
  return (
    <TRPCProvider>
      <YourApp />
    </TRPCProvider>
  );
}
```

### 数据容器组件

```tsx
// components/UserDataProvider.tsx
import { createContext, useContext } from 'react';
import { trpc } from '../utils/trpc';

type UserContextValue = {
  user: User | undefined;
  isLoading: boolean;
  error: any;
  refetch: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserDataProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const query = trpc.user.getUser.useQuery({ id: userId });
  
  return (
    <UserContext.Provider
      value={{
        user: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  
  return context;
}

// 使用
function UserProfile() {
  const { user, isLoading } = useUserData();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{user?.name}</div>;
}

function App() {
  return (
    <UserDataProvider userId="123">
      <UserProfile />
      <UserPosts />
    </UserDataProvider>
  );
}
```

## 状态管理集成

### 与Zustand集成

```tsx
import create from 'zustand';
import { trpc } from '../utils/trpc';

type UserStore = {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: CreateUserInput) => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await trpcClient.user.getUsers.query();
      set({ users: data.users, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addUser: async (input) => {
    try {
      const newUser = await trpcClient.user.createUser.mutate(input);
      set((state) => ({
        users: [newUser, ...state.users],
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

// 使用
function UserList() {
  const { users, isLoading, fetchUsers } = useUserStore();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 与Redux Toolkit集成

```tsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { trpcClient } from '../utils/trpc';

export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async () => {
    return await trpcClient.user.getUsers.query();
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
```

## 预取和缓存

### 预取数据

```tsx
import { useQueryClient } from '@tanstack/react-query';

function UserList() {
  const queryClient = useQueryClient();
  const utils = trpc.useContext();
  
  const { data: users } = trpc.user.getUsers.useQuery();
  
  const handleMouseEnter = async (userId: string) => {
    // 预取用户详情
    await utils.user.getUser.prefetch({ id: userId });
  };
  
  return (
    <ul>
      {users?.users.map(user => (
        <li
          key={user.id}
          onMouseEnter={() => handleMouseEnter(user.id)}
        >
          <Link to={`/users/${user.id}`}>{user.name}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### 初始数据

```tsx
function UserProfile({ userId }: { userId: string }) {
  const utils = trpc.useContext();
  
  const { data: user } = trpc.user.getUser.useQuery(
    { id: userId },
    {
      initialData: () => {
        // 从用户列表中获取初始数据
        const users = utils.user.getUsers.getData();
        return users?.users.find(u => u.id === userId);
      },
      initialDataUpdatedAt: () => {
        return utils.user.getUsers.getQueryState()?.dataUpdatedAt;
      },
    }
  );
  
  return <div>{user?.name}</div>;
}
```

## SSR和SSG

### Next.js SSR

```tsx
// pages/user/[id].tsx
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import { appRouter } from '../../server/routers/_app';
import { createContext } from '../../server/context';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(context),
  });
  
  const id = context.params?.id as string;
  
  // 预获取数据
  await ssg.user.getUser.prefetch({ id });
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

function UserPage({ id }: { id: string }) {
  // 这个查询会立即从缓存返回数据
  const { data: user } = trpc.user.getUser.useQuery({ id });
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
    </div>
  );
}

export default UserPage;
```

### Next.js SSG

```tsx
// pages/posts/[id].tsx
export async function getStaticPaths() {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  
  const { posts } = await ssg.post.getAllPosts.fetch();
  
  return {
    paths: posts.map(post => ({
      params: { id: post.id },
    })),
    fallback: 'blocking',
  };
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContext(),
  });
  
  const id = context.params?.id as string;
  
  await ssg.post.getPost.prefetch({ id });
  
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
    revalidate: 60, // ISR: 每60秒重新生成
  };
}

function PostPage({ id }: { id: string }) {
  const { data: post } = trpc.post.getPost.useQuery({ id });
  
  return (
    <article>
      <h1>{post?.title}</h1>
      <p>{post?.content}</p>
    </article>
  );
}

export default PostPage;
```

## 实时更新

### WebSocket订阅

```tsx
function LiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  trpc.notification.onNew.useSubscription(undefined, {
    onData: (notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.info(notification.message);
    },
    
    onError: (error) => {
      console.error('Subscription error:', error);
    },
  });
  
  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map(notif => (
          <li key={notif.id}>{notif.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 轮询更新

```tsx
function LiveStats() {
  const { data } = trpc.stats.getCurrent.useQuery(undefined, {
    refetchInterval: 5000, // 每5秒更新
    refetchIntervalInBackground: true,
  });
  
  return (
    <div className="stats">
      <div>Users: {data?.userCount}</div>
      <div>Posts: {data?.postCount}</div>
      <div>Active: {data?.activeUsers}</div>
    </div>
  );
}
```

## 错误处理

### 全局错误处理

```tsx
// utils/trpc.ts
import { TRPCClientError } from '@trpc/client';

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          if (error.data?.code === 'UNAUTHORIZED') {
            window.location.href = '/login';
          }
          
          toast.error(error.message);
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          toast.error(error.message);
        }
      },
    },
  },
});
```

### 组件级错误边界

```tsx
import { TRPCClientError } from '@trpc/client';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  if (error instanceof TRPCClientError) {
    return (
      <div className="error">
        <h2>API Error</h2>
        <p>{error.message}</p>
        <p>Code: {error.data?.code}</p>
      </div>
    );
  }
  
  return (
    <div className="error">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <UserList />
    </ErrorBoundary>
  );
}
```

## 性能优化

### 请求批处理

```tsx
import { httpBatchLink } from '@trpc/client';

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      maxURLLength: 2083,
      // 批处理配置
      maxBatchSize: 10,
    }),
  ],
});

// 这些请求会被批处理成一个HTTP请求
function Dashboard() {
  const { data: user } = trpc.user.getUser.useQuery({ id: '1' });
  const { data: posts } = trpc.post.getUserPosts.useQuery({ userId: '1' });
  const { data: stats } = trpc.stats.getStats.useQuery();
  
  return <div>...</div>;
}
```

### 选择性字段查询

```tsx
// 服务端支持字段选择
const userRouter = router({
  getUser: publicProcedure
    .input(z.object({
      id: z.string(),
      select: z.object({
        id: z.boolean().optional(),
        name: z.boolean().optional(),
        email: z.boolean().optional(),
      }).optional(),
    }))
    .query(async ({ input }) => {
      return db.user.findUnique({
        where: { id: input.id },
        select: input.select,
      });
    }),
});

// 客户端使用
function UserName({ userId }: { userId: string }) {
  const { data: user } = trpc.user.getUser.useQuery({
    id: userId,
    select: { id: true, name: true },
  });
  
  return <span>{user?.name}</span>;
}
```

## 总结

tRPC与React集成要点：

1. **项目结构**：Monorepo、独立项目
2. **Hook模式**：自定义查询、自定义Mutation
3. **组件模式**：Provider、数据容器
4. **状态管理**：Zustand、Redux集成
5. **预取缓存**：prefetch、initialData
6. **SSR/SSG**：Next.js集成、静态生成
7. **实时更新**：WebSocket订阅、轮询
8. **错误处理**：全局处理、错误边界
9. **性能优化**：批处理、选择性查询

tRPC提供了React应用中类型安全数据获取的完美解决方案。

## 第四部分：tRPC React高级模式

### 4.1 高级查询模式

```tsx
// 1. 条件查询
function ConditionalQuery({ enabled }: { enabled: boolean }) {
  const { data } = trpc.user.getProfile.useQuery(undefined, {
    enabled, // 条件控制查询
    onSuccess: (data) => {
      console.log('Data loaded:', data);
    }
  });

  return data ? <div>{data.name}</div> : null;
}

// 2. 依赖查询链
function DependentQueries() {
  const { data: user } = trpc.user.getCurrent.useQuery();
  
  const { data: posts } = trpc.post.getByUserId.useQuery(
    { userId: user?.id! },
    { enabled: !!user?.id }
  );

  const { data: comments } = trpc.comment.getByPostIds.useQuery(
    { postIds: posts?.map(p => p.id) || [] },
    { enabled: !!posts?.length }
  );

  return <div>...</div>;
}

// 3. 并行查询
function ParallelQueries() {
  const queries = trpc.useQueries((t) => [
    t.user.getProfile(),
    t.user.getSettings(),
    t.user.getNotifications({ limit: 10 })
  ]);

  const [profile, settings, notifications] = queries;

  if (queries.some(q => q.isLoading)) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Profile data={profile.data} />
      <Settings data={settings.data} />
      <Notifications data={notifications.data} />
    </div>
  );
}

// 4. 无限查询
function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = trpc.post.getList.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  );

  const allPosts = data?.pages.flatMap(page => page.items) ?? [];

  return (
    <div>
      {allPosts.map(post => (
        <Post key={post.id} post={post} />
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// 5. 预取查询
function PrefetchExample() {
  const utils = trpc.useUtils();

  const handleMouseEnter = (id: string) => {
    utils.post.getById.prefetch({ id });
  };

  return (
    <Link
      to={`/posts/${id}`}
      onMouseEnter={() => handleMouseEnter(id)}
    >
      Post Title
    </Link>
  );
}
```

### 4.2 高级Mutation模式

```tsx
// 1. 乐观更新
function OptimisticUpdate() {
  const utils = trpc.useUtils();

  const updatePost = trpc.post.update.useMutation({
    onMutate: async (newPost) => {
      // 取消进行中的查询
      await utils.post.getById.cancel({ id: newPost.id });

      // 保存当前数据快照
      const previousPost = utils.post.getById.getData({ id: newPost.id });

      // 乐观更新
      utils.post.getById.setData({ id: newPost.id }, (old) => ({
        ...old!,
        ...newPost
      }));

      return { previousPost };
    },
    onError: (err, newPost, context) => {
      // 回滚到之前的数据
      utils.post.getById.setData(
        { id: newPost.id },
        context?.previousPost
      );
    },
    onSettled: (data, error, variables) => {
      // 重新获取数据
      utils.post.getById.invalidate({ id: variables.id });
    }
  });

  return (
    <button onClick={() => updatePost.mutate({ id: '1', title: 'New Title' })}>
      Update
    </button>
  );
}

// 2. 批量Mutation
function BatchMutation() {
  const utils = trpc.useUtils();

  const deletePosts = trpc.post.deleteMany.useMutation({
    onSuccess: () => {
      // 失效相关查询
      utils.post.invalidate();
    }
  });

  const handleBatchDelete = async (ids: string[]) => {
    await deletePosts.mutateAsync({ ids });
  };

  return <button onClick={() => handleBatchDelete(['1', '2', '3'])}>
    Delete Selected
  </button>;
}

// 3. 链式Mutation
function ChainedMutations() {
  const createUser = trpc.user.create.useMutation();
  const createProfile = trpc.profile.create.useMutation();
  const sendEmail = trpc.email.send.useMutation();

  const handleSignup = async (data: SignupData) => {
    try {
      const user = await createUser.mutateAsync({
        email: data.email,
        password: data.password
      });

      const profile = await createProfile.mutateAsync({
        userId: user.id,
        name: data.name
      });

      await sendEmail.mutateAsync({
        to: user.email,
        template: 'welcome'
      });

      toast.success('Signup successful!');
    } catch (error) {
      toast.error('Signup failed');
    }
  };

  return <button onClick={() => handleSignup(formData)}>Sign Up</button>;
}

// 4. Mutation队列
function useMutationQueue<T, V>(
  mutation: ReturnType<typeof trpc.post.create.useMutation>
) {
  const [queue, setQueue] = useState<V[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = (variables: V) => {
    setQueue(q => [...q, variables]);
  };

  useEffect(() => {
    if (!isProcessing && queue.length > 0) {
      setIsProcessing(true);
      const [next, ...rest] = queue;
      
      mutation.mutate(next, {
        onSettled: () => {
          setQueue(rest);
          setIsProcessing(false);
        }
      });
    }
  }, [queue, isProcessing]);

  return { addToQueue, queueLength: queue.length };
}
```

### 4.3 订阅集成

```tsx
// 1. 基础订阅
function SubscriptionExample() {
  const [messages, setMessages] = useState<Message[]>([]);

  trpc.chat.onMessage.useSubscription(undefined, {
    onData: (message) => {
      setMessages(prev => [...prev, message]);
    },
    onError: (err) => {
      console.error('Subscription error:', err);
    }
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.text}</div>
      ))}
    </div>
  );
}

// 2. 带参数的订阅
function RoomSubscription({ roomId }: { roomId: string }) {
  const utils = trpc.useUtils();

  trpc.chat.onRoomMessage.useSubscription(
    { roomId },
    {
      onData: (message) => {
        // 更新查询缓存
        utils.chat.getMessages.setData(
          { roomId },
          (old) => [...(old || []), message]
        );
      }
    }
  );

  const { data: messages } = trpc.chat.getMessages.useQuery({ roomId });

  return (
    <div>
      {messages?.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
    </div>
  );
}

// 3. 订阅管理Hook
function useSubscriptionManager() {
  const subscriptions = useRef<Set<() => void>>(new Set());

  const subscribe = useCallback((unsub: () => void) => {
    subscriptions.current.add(unsub);
  }, []);

  useEffect(() => {
    return () => {
      subscriptions.current.forEach(unsub => unsub());
      subscriptions.current.clear();
    };
  }, []);

  return { subscribe };
}

// 4. 条件订阅
function ConditionalSubscription({ enabled }: { enabled: boolean }) {
  trpc.notifications.onNew.useSubscription(undefined, {
    enabled,
    onData: (notification) => {
      toast.info(notification.message);
    }
  });

  return null;
}
```

### 4.4 错误处理策略

```tsx
// 1. 全局错误处理
function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        onError: (error) => {
          if (error instanceof TRPCClientError) {
            if (error.data?.code === 'UNAUTHORIZED') {
              router.push('/login');
            }
          }
        }
      },
      mutations: {
        onError: (error) => {
          if (error instanceof TRPCClientError) {
            toast.error(error.message);
          }
        }
      }
    }
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          onError: ({ error }) => {
            console.error('Global tRPC error:', error);
          }
        })
      ]
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// 2. 错误边界
class TRPCErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error instanceof TRPCClientError) {
      console.error('tRPC Error:', {
        code: error.data?.code,
        message: error.message,
        path: error.data?.path
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// 3. 重试策略
function RetryExample() {
  const { data, error, refetch } = trpc.user.getProfile.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error instanceof TRPCClientError) {
        // 客户端错误不重试
        if (error.data?.code === 'BAD_REQUEST') {
          return false;
        }
      }
      // 最多重试3次
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // 指数退避
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    }
  });

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return <div>{data?.name}</div>;
}

// 4. 错误恢复Hook
function useErrorRecovery() {
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = (err: Error) => {
    setError(err);
    setRetryCount(c => c + 1);
  };

  const reset = () => {
    setError(null);
    setRetryCount(0);
  };

  return { error, retryCount, handleError, reset };
}
```

### 4.5 性能优化

```tsx
// 1. 请求去重
function DeduplicatedRequests() {
  // 多个组件使用相同查询，tRPC自动去重
  const Component1 = () => {
    const { data } = trpc.user.getProfile.useQuery();
    return <div>{data?.name}</div>;
  };

  const Component2 = () => {
    const { data } = trpc.user.getProfile.useQuery();
    return <div>{data?.email}</div>;
  };

  return (
    <>
      <Component1 />
      <Component2 />
    </>
  );
}

// 2. 选择性数据获取
function SelectiveQuery() {
  const { data: userName } = trpc.user.getProfile.useQuery(undefined, {
    select: (data) => data.name // 只返回需要的数据
  });

  return <div>{userName}</div>;
}

// 3. 缓存配置
function CacheConfiguration() {
  const { data } = trpc.user.getProfile.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5分钟内数据不过期
    cacheTime: 1000 * 60 * 30, // 30分钟后清除缓存
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  return <div>{data?.name}</div>;
}

// 4. 批处理请求
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      maxBatchSize: 10, // 最多批处理10个请求
      maxURLLength: 2000 // URL长度限制
    })
  ]
});

// 5. 懒查询
function LazyQuery() {
  const { refetch, data } = trpc.user.getProfile.useQuery(undefined, {
    enabled: false // 初始不执行
  });

  const handleClick = async () => {
    const { data } = await refetch();
    console.log(data);
  };

  return <button onClick={handleClick}>Load Profile</button>;
}
```

### 4.6 SSR与SSG集成

```tsx
// 1. Next.js SSR
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext({ req: context.req, res: context.res })
  });

  await ssg.user.getProfile.prefetch();
  await ssg.post.getList.prefetch({ limit: 10 });

  return {
    props: {
      trpcState: ssg.dehydrate()
    }
  };
}

function Page() {
  const { data: user } = trpc.user.getProfile.useQuery();
  const { data: posts } = trpc.post.getList.useQuery({ limit: 10 });

  return (
    <div>
      <h1>{user?.name}</h1>
      {posts?.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

// 2. Next.js SSG
export async function getStaticProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext()
  });

  await ssg.post.getList.prefetch({ limit: 100 });

  return {
    props: {
      trpcState: ssg.dehydrate()
    },
    revalidate: 60 // ISR: 每60秒重新生成
  };
}

// 3. 服务端流式渲染
import { renderToReadableStream } from 'react-dom/server';

export async function GET(request: Request) {
  const stream = await renderToReadableStream(
    <App trpcState={dehydratedState} />,
    {
      onError(error) {
        console.error('SSR Error:', error);
      }
    }
  );

  return new Response(stream, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// 4. 混合渲染策略
function HybridRendering() {
  // SSR数据
  const { data: initialData } = trpc.post.getList.useQuery(
    { limit: 10 },
    { initialData: serverData }
  );

  // CSR数据
  const { data: liveData } = trpc.post.getLive.useQuery();

  return (
    <div>
      <StaticContent data={initialData} />
      <LiveContent data={liveData} />
    </div>
  );
}
```

## tRPC React集成最佳实践总结

```
1. 查询模式
   ✅ 条件查询
   ✅ 依赖查询
   ✅ 并行查询
   ✅ 无限查询
   ✅ 预取优化

2. Mutation模式
   ✅ 乐观更新
   ✅ 批量操作
   ✅ 链式Mutation
   ✅ 队列管理

3. 订阅管理
   ✅ 基础订阅
   ✅ 参数订阅
   ✅ 订阅管理
   ✅ 条件订阅

4. 错误处理
   ✅ 全局处理
   ✅ 错误边界
   ✅ 重试策略
   ✅ 错误恢复

5. 性能优化
   ✅ 请求去重
   ✅ 选择性获取
   ✅ 缓存配置
   ✅ 批处理

6. SSR/SSG
   ✅ Next.js集成
   ✅ 数据预取
   ✅ 流式渲染
   ✅ 混合策略
```

tRPC与React的完美集成为TypeScript全栈应用提供了无与伦比的开发体验和类型安全保障。
