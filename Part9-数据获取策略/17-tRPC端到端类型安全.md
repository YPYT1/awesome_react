# tRPC端到端类型安全

## 概述

tRPC是一个轻量级的TypeScript RPC框架,提供端到端的类型安全。它无需代码生成或GraphQL Schema,直接利用TypeScript的类型推断,在客户端和服务端之间实现完全类型安全的API调用。本文将介绍tRPC的基础概念和使用方法。

## 核心概念

### 什么是tRPC

tRPC的特点：

1. **端到端类型安全**：客户端自动获得服务端的类型定义
2. **无需代码生成**：利用TypeScript类型推断
3. **轻量级**：核心包很小,无额外依赖
4. **开发体验好**：自动补全、类型检查
5. **灵活**：支持多种传输方式(HTTP、WebSocket)

### tRPC vs GraphQL

| 特性 | tRPC | GraphQL |
|------|------|---------|
| 类型安全 | TypeScript原生 | 需要代码生成 |
| Schema | 不需要 | 需要定义Schema |
| 学习曲线 | 低 | 中等 |
| 灵活性 | 高 | 非常高 |
| 生态系统 | 较新 | 成熟 |
| 适用场景 | TypeScript全栈 | 多语言团队 |

## 服务端设置

### 安装依赖

```bash
# 服务端
npm install @trpc/server zod

# 客户端(React)
npm install @trpc/client @trpc/react-query
npm install @tanstack/react-query
```

### 创建Router

```typescript
// server/trpc.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// server/routers/user.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  // 查询
  getUser: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
      });
      
      return user;
    }),
  
  // 列表查询
  getUsers: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { limit = 10, cursor } = input;
      
      const users = await db.user.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
      
      let nextCursor: string | undefined = undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }
      
      return {
        users,
        nextCursor,
      };
    }),
  
  // 变更
  createUser: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const user = await db.user.create({
        data: input,
      });
      
      return user;
    }),
  
  // 更新
  updateUser: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      const user = await db.user.update({
        where: { id },
        data: updates,
      });
      
      return user;
    }),
  
  // 删除
  deleteUser: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await db.user.delete({
        where: { id: input.id },
      });
      
      return { success: true };
    }),
});

// server/routers/_app.ts
import { router } from '../trpc';
import { userRouter } from './user';
import { postRouter } from './post';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
```

### Express集成

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers/_app';

const app = express();

app.use(cors());

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => ({}),
  })
);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Next.js集成

```typescript
// pages/api/trpc/[trpc].ts
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';

export default createNextApiHandler({
  router: appRouter,
  createContext: ({ req, res }) => ({}),
});
```

## 客户端设置

### React Query集成

```tsx
// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import { useState } from 'react';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
        }),
      ],
    })
  );
  
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Vanilla Client

```typescript
// utils/trpc.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// 使用
async function fetchUser(id: string) {
  const user = await trpc.user.getUser.query({ id });
  console.log(user);
}
```

## 查询数据

### 基础查询

```tsx
import { trpc } from '../utils/trpc';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = trpc.user.getUser.useQuery({
    id: userId,
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // data 自动拥有完整的类型
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### 查询选项

```tsx
function UserList() {
  const { data, isLoading, refetch } = trpc.user.getUsers.useQuery(
    { limit: 10 },
    {
      // TanStack Query选项
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      
      onSuccess: (data) => {
        console.log('Users loaded:', data);
      },
      
      onError: (error) => {
        console.error('Failed to load users:', error);
      },
    }
  );
  
  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      
      {isLoading && <div>Loading...</div>}
      
      <ul>
        {data?.users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 条件查询

```tsx
function UserPosts({ userId }: { userId: string | null }) {
  const { data: posts } = trpc.post.getUserPosts.useQuery(
    { userId: userId! },
    {
      // 只在userId存在时查询
      enabled: !!userId,
    }
  );
  
  if (!userId) return <div>Select a user</div>;
  
  return (
    <ul>
      {posts?.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 数据变更

### Mutation

```tsx
function CreateUserForm() {
  const utils = trpc.useContext();
  
  const { mutate, isLoading, error } = trpc.user.createUser.useMutation({
    onSuccess: (newUser) => {
      // 使用户列表失效
      utils.user.getUsers.invalidate();
      
      // 或直接更新缓存
      utils.user.getUsers.setData(
        { limit: 10 },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            users: [newUser, ...old.users],
          };
        }
      );
      
      toast.success(`User ${newUser.name} created`);
    },
    
    onError: (error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
      
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

### 乐观更新

```tsx
function UpdateUserForm({ userId }: { userId: string }) {
  const utils = trpc.useContext();
  
  const { data: user } = trpc.user.getUser.useQuery({ id: userId });
  
  const { mutate } = trpc.user.updateUser.useMutation({
    onMutate: async (newData) => {
      // 取消相关查询
      await utils.user.getUser.cancel({ id: userId });
      
      // 保存之前的数据
      const previousUser = utils.user.getUser.getData({ id: userId });
      
      // 乐观更新
      utils.user.getUser.setData(
        { id: userId },
        (old) => {
          if (!old) return old;
          return { ...old, ...newData };
        }
      );
      
      return { previousUser };
    },
    
    onError: (err, newData, context) => {
      // 回滚
      utils.user.getUser.setData(
        { id: userId },
        context?.previousUser
      );
    },
    
    onSettled: () => {
      // 重新获取以确保同步
      utils.user.getUser.invalidate({ id: userId });
    },
  });
  
  const handleUpdate = (updates: Partial<User>) => {
    mutate({ id: userId, ...updates });
  };
  
  return <UserForm user={user} onSubmit={handleUpdate} />;
}
```

## 无限查询

### useInfiniteQuery

```tsx
function InfiniteUserList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.user.getUsers.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.users.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
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
```

## 中间件和Context

### 创建Context

```typescript
// server/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createContext({ req, res }: CreateNextContextOptions) {
  const getUser = () => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) return null;
    
    try {
      const decoded = verifyToken(token);
      return decoded.user;
    } catch {
      return null;
    }
  };
  
  return {
    req,
    res,
    user: await getUser(),
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;

// 在router中使用
const t = initTRPC.context<Context>().create();
```

### Protected Procedure

```typescript
// server/trpc.ts
import { TRPCError } from '@trpc/server';

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// 使用
export const userRouter = router({
  getProfile: protectedProcedure
    .query(({ ctx }) => {
      // ctx.user 保证存在
      return ctx.user;
    }),
  
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
      
      return user;
    }),
});
```

### 日志中间件

```typescript
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  
  const result = await next();
  
  const duration = Date.now() - start;
  
  console.log(`${type} ${path} - ${duration}ms`);
  
  return result;
});

export const loggedProcedure = t.procedure.use(loggerMiddleware);
```

## 订阅(Subscriptions)

### WebSocket设置

```bash
npm install ws
```

```typescript
// server/index.ts
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';

const wss = new ws.Server({ port: 3001 });

applyWSSHandler({
  wss,
  router: appRouter,
  createContext,
});

// server/routers/post.ts
import { observable } from '@trpc/server/observable';

export const postRouter = router({
  onPostCreate: publicProcedure
    .subscription(() => {
      return observable<Post>((emit) => {
        const onCreate = (post: Post) => {
          emit.next(post);
        };
        
        // 监听事件
        eventEmitter.on('post:create', onCreate);
        
        return () => {
          eventEmitter.off('post:create', onCreate);
        };
      });
    }),
});
```

### 客户端订阅

```tsx
import { createWSClient, wsLink } from '@trpc/client';

const wsClient = createWSClient({
  url: 'ws://localhost:3001',
});

const trpcClient = trpc.createClient({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});

// 组件中使用
function LivePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  
  trpc.post.onPostCreate.useSubscription(undefined, {
    onData: (post) => {
      setPosts(prev => [post, ...prev]);
      toast.info(`New post: ${post.title}`);
    },
  });
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 错误处理

### 自定义错误

```typescript
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with id ${input.id} not found`,
        });
      }
      
      return user;
    }),
});
```

### 客户端错误处理

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data, error } = trpc.user.getUser.useQuery(
    { id: userId },
    {
      onError: (error) => {
        if (error.data?.code === 'NOT_FOUND') {
          toast.error('User not found');
        } else if (error.data?.code === 'UNAUTHORIZED') {
          window.location.href = '/login';
        } else {
          toast.error('An error occurred');
        }
      },
    }
  );
  
  if (error) {
    return (
      <div className="error">
        <h3>Error</h3>
        <p>{error.message}</p>
        <p>Code: {error.data?.code}</p>
      </div>
    );
  }
  
  return <div>{data?.name}</div>;
}
```

## 总结

tRPC核心特性：

1. **端到端类型安全**：无需代码生成
2. **Router定义**：Query、Mutation、Subscription
3. **服务端集成**：Express、Next.js
4. **客户端集成**：React Query、Vanilla
5. **数据查询**：useQuery、useInfiniteQuery
6. **数据变更**：useMutation、乐观更新
7. **中间件**：Context、Protected Procedure
8. **订阅**：WebSocket实时通信
9. **错误处理**：TRPCError、客户端处理

tRPC提供了TypeScript全栈应用的完美解决方案,是类型安全API的首选。

## 第四部分：tRPC高级特性

### 4.1 高级路由器模式

```typescript
// 1. 路由器合并与命名空间
import { router } from './trpc';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';
import { commentRouter } from './routers/comment';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  comment: commentRouter,
  
  // 嵌套路由
  admin: router({
    users: adminUserRouter,
    settings: adminSettingsRouter
  })
});

export type AppRouter = typeof appRouter;

// 2. 条件路由
function createConditionalRouter(isEnabled: boolean) {
  const baseRouter = router({
    hello: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => `Hello ${input.name}`)
  });

  if (isEnabled) {
    return router({
      ...baseRouter._def.procedures,
      extra: publicProcedure.query(() => 'Extra feature')
    });
  }

  return baseRouter;
}

// 3. 动态路由生成
function createCRUDRouter<T extends z.ZodType>(
  name: string,
  schema: T
) {
  return router({
    getAll: publicProcedure
      .query(() => db[name].findMany()),
      
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => db[name].findUnique({ where: { id: input.id } })),
      
    create: protectedProcedure
      .input(schema)
      .mutation(({ input }) => db[name].create({ data: input })),
      
    update: protectedProcedure
      .input(z.object({ id: z.string(), data: schema }))
      .mutation(({ input }) => 
        db[name].update({ where: { id: input.id }, data: input.data })),
      
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input }) => db[name].delete({ where: { id: input.id } }))
  });
}

const userRouter = createCRUDRouter('user', userSchema);
const postRouter = createCRUDRouter('post', postSchema);

// 4. 路由器工厂模式
interface RouterOptions {
  requireAuth?: boolean;
  rateLimit?: number;
}

function createResourceRouter<T extends z.ZodType>(
  resource: string,
  schema: T,
  options: RouterOptions = {}
) {
  const procedure = options.requireAuth ? protectedProcedure : publicProcedure;

  return router({
    list: procedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10)
      }))
      .query(async ({ input }) => {
        const items = await db[resource].findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit
        });
        const total = await db[resource].count();
        
        return {
          items,
          pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit)
          }
        };
      }),
      
    // ... other CRUD operations
  });
}
```

### 4.2 Context高级用法

```typescript
// 1. 分层Context
interface BaseContext {
  req: Request;
  res: Response;
}

interface AuthContext extends BaseContext {
  user: User;
  session: Session;
}

interface AdminContext extends AuthContext {
  isAdmin: true;
  permissions: string[];
}

export const createContext = async ({
  req,
  res
}: {
  req: Request;
  res: Response;
}): Promise<BaseContext> => {
  return { req, res };
};

// 2. Context注入模式
class ContextInjector {
  private services = new Map<string, any>();

  register<T>(name: string, service: T) {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    return this.services.get(name) as T;
  }
}

const injector = new ContextInjector();
injector.register('db', prisma);
injector.register('cache', redis);
injector.register('logger', winston);

export const createContext = async () => {
  return {
    db: injector.get<PrismaClient>('db'),
    cache: injector.get<Redis>('cache'),
    logger: injector.get<Logger>('logger')
  };
};

// 3. 请求级Context增强
export const createContext = async ({ req }: { req: Request }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  let user = null;
  if (token) {
    try {
      user = await verifyToken(token);
    } catch (error) {
      // Token无效，继续但user为null
    }
  }

  // 请求追踪
  const requestId = req.headers['x-request-id'] || generateId();
  
  // 性能追踪
  const startTime = Date.now();

  return {
    user,
    requestId,
    startTime,
    // 日志器带上请求ID
    logger: logger.child({ requestId }),
    // 性能追踪
    trackPerformance: (label: string) => {
      const duration = Date.now() - startTime;
      logger.info(`${label} took ${duration}ms`, { requestId });
    }
  };
};

// 4. Context缓存
const contextCache = new Map<string, any>();

export const createContext = async ({ req }: { req: Request }) => {
  const cacheKey = req.headers['x-session-id'];
  
  if (cacheKey && contextCache.has(cacheKey)) {
    return contextCache.get(cacheKey);
  }

  const ctx = {
    user: await getUserFromSession(req),
    permissions: await getPermissions(req)
  };

  if (cacheKey) {
    contextCache.set(cacheKey, ctx);
  }

  return ctx;
};
```

### 4.3 中间件链式处理

```typescript
// 1. 中间件组合
const withAuth = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const withAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user?.isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});

const withRateLimit = (limit: number) => middleware(async ({ ctx, next }) => {
  const key = `ratelimit:${ctx.user?.id || ctx.ip}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60);
  }
  
  if (count > limit) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }
  
  return next({ ctx });
});

// 组合使用
const adminProcedure = publicProcedure
  .use(withAuth)
  .use(withAdmin)
  .use(withRateLimit(10));

// 2. 日志中间件
const withLogging = middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  
  console.log(`→ ${type} ${path} started`);

  try {
    const result = await next();
    const duration = Date.now() - start;
    
    console.log(`← ${type} ${path} completed in ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`✗ ${type} ${path} failed in ${duration}ms:`, error);
    throw error;
  }
});

// 3. 性能监控中间件
const withPerformance = middleware(async ({ path, type, next }) => {
  const start = performance.now();
  
  const result = await next();
  
  const duration = performance.now() - start;
  
  // 发送到监控系统
  metrics.record({
    type: `trpc.${type}`,
    path,
    duration,
    timestamp: Date.now()
  });
  
  // 慢查询警告
  if (duration > 1000) {
    logger.warn(`Slow ${type} procedure: ${path} took ${duration}ms`);
  }
  
  return result;
});

// 4. 错误处理中间件
const withErrorHandling = middleware(async ({ next, ctx }) => {
  try {
    return await next();
  } catch (error) {
    // 错误转换
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Resource already exists'
        });
      }
    }

    // 错误报告
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        user: ctx.user,
        tags: { type: 'trpc' }
      });
    }

    throw error;
  }
});
```

### 4.4 输入验证和转换

```typescript
// 1. 复杂输入验证
const userSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(8)
    .refine(val => /[A-Z]/.test(val), 'Must contain uppercase')
    .refine(val => /[0-9]/.test(val), 'Must contain number'),
  age: z.number().min(18).max(120),
  tags: z.array(z.string()).min(1).max(10),
  metadata: z.record(z.string(), z.any()).optional()
});

// 2. 条件验证
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  published: z.boolean(),
  publishedAt: z.date().optional()
}).refine(
  data => !data.published || data.publishedAt,
  { message: 'publishedAt required when published', path: ['publishedAt'] }
);

// 3. 自定义验证器
const uniqueEmail = z.string().email().refine(
  async (email) => {
    const exists = await db.user.findUnique({ where: { email } });
    return !exists;
  },
  { message: 'Email already exists' }
);

// 4. 输入转换管道
const transformedInput = z.object({
  search: z.string()
    .transform(v => v.trim())
    .transform(v => v.toLowerCase())
    .transform(v => v.replace(/\s+/g, ' ')),
  price: z.string()
    .transform(v => parseFloat(v))
    .pipe(z.number().positive()),
  tags: z.string()
    .transform(v => v.split(','))
    .pipe(z.array(z.string()).min(1))
});

// 5. 动态Schema
function createDynamicSchema(fields: string[]) {
  const shape: Record<string, z.ZodType> = {};
  
  fields.forEach(field => {
    if (field === 'email') {
      shape[field] = z.string().email();
    } else if (field === 'age') {
      shape[field] = z.number().min(0);
    } else {
      shape[field] = z.string();
    }
  });
  
  return z.object(shape);
}
```

### 4.5 订阅高级模式

```typescript
// 1. EventEmitter订阅
import { EventEmitter } from 'events';

const ee = new EventEmitter();

const appRouter = router({
  onPostCreate: publicProcedure
    .subscription(() => {
      return observable<Post>((emit) => {
        const onPost = (data: Post) => {
          emit.next(data);
        };

        ee.on('post:create', onPost);

        return () => {
          ee.off('post:create', onPost);
        };
      });
    }),
    
  onUserMessage: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .subscription(({ input, ctx }) => {
      return observable<Message>((emit) => {
        const handler = (msg: Message) => {
          if (msg.userId === input.userId) {
            emit.next(msg);
          }
        };

        ee.on('message', handler);
        return () => ee.off('message', handler);
      });
    })
});

// 2. Redis Pub/Sub订阅
import Redis from 'ioredis';

const redis = new Redis();
const subscriber = new Redis();

const appRouter = router({
  onNotification: protectedProcedure
    .subscription(({ ctx }) => {
      return observable<Notification>((emit) => {
        const channel = `user:${ctx.user.id}:notifications`;
        
        subscriber.subscribe(channel);
        
        subscriber.on('message', (ch, message) => {
          if (ch === channel) {
            emit.next(JSON.parse(message));
          }
        });

        return () => {
          subscriber.unsubscribe(channel);
        };
      });
    })
});

// 3. 数据库变更订阅
const appRouter = router({
  onDataChange: publicProcedure
    .input(z.object({ table: z.string() }))
    .subscription(({ input }) => {
      return observable<ChangeEvent>((emit) => {
        const watcher = db.$on('change', (event) => {
          if (event.table === input.table) {
            emit.next(event);
          }
        });

        return () => {
          watcher.unsubscribe();
        };
      });
    })
});

// 4. 定时订阅
const appRouter = router({
  onTicker: publicProcedure
    .input(z.object({ interval: z.number().min(1000) }))
    .subscription(({ input }) => {
      return observable<number>((emit) => {
        let count = 0;
        
        const timer = setInterval(() => {
          emit.next(count++);
        }, input.interval);

        return () => {
          clearInterval(timer);
        };
      });
    })
});
```

### 4.6 性能优化策略

```typescript
// 1. DataLoader集成
import DataLoader from 'dataloader';

const createContext = async () => {
  const userLoader = new DataLoader(async (ids: readonly string[]) => {
    const users = await db.user.findMany({
      where: { id: { in: [...ids] } }
    });
    return ids.map(id => users.find(u => u.id === id));
  });

  const postLoader = new DataLoader(async (ids: readonly string[]) => {
    const posts = await db.post.findMany({
      where: { id: { in: [...ids] } }
    });
    return ids.map(id => posts.find(p => p.id === id));
  });

  return {
    loaders: { userLoader, postLoader }
  };
};

// 使用
const appRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.loaders.userLoader.load(input.id))
});

// 2. 查询缓存
const queryCache = new Map<string, { data: any; timestamp: number }>();

const withCache = (ttl: number = 60000) => middleware(async ({ path, rawInput, next }) => {
  const cacheKey = `${path}:${JSON.stringify(rawInput)}`;
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const result = await next();
  
  queryCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });

  return result;
});

// 3. 批量操作优化
const appRouter = router({
  getUsers: publicProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(async ({ input }) => {
      // 一次查询所有用户
      const users = await db.user.findMany({
        where: { id: { in: input.ids } }
      });
      
      // 返回有序结果
      return input.ids.map(id => users.find(u => u.id === id));
    })
});

// 4. 并发控制
import pLimit from 'p-limit';

const limit = pLimit(5);

const appRouter = router({
  processBatch: protectedProcedure
    .input(z.object({ items: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.items.map(item => 
          limit(() => processItem(item))
        )
      );
      
      return results;
    })
});
```

## tRPC最佳实践总结

```
1. 路由设计
   ✅ 命名空间组织
   ✅ CRUD路由工厂
   ✅ 动态路由生成
   ✅ 条件路由

2. Context管理
   ✅ 分层Context
   ✅ 依赖注入
   ✅ 请求追踪
   ✅ 缓存优化

3. 中间件
   ✅ 链式组合
   ✅ 错误处理
   ✅ 性能监控
   ✅ 日志记录

4. 输入验证
   ✅ Zod Schema
   ✅ 复杂验证
   ✅ 自定义验证器
   ✅ 数据转换

5. 性能优化
   ✅ DataLoader
   ✅ 查询缓存
   ✅ 批量操作
   ✅ 并发控制

6. 订阅模式
   ✅ EventEmitter
   ✅ Redis Pub/Sub
   ✅ 数据库监听
   ✅ 定时推送
```

tRPC提供了端到端类型安全的完美解决方案，是TypeScript全栈应用的最佳选择。
