# API Mock (MSW)

## 概述

Mock Service Worker (MSW)是一个强大的API模拟库,它在服务工作线程(Service Worker)级别拦截网络请求,提供了一种优雅的方式来模拟REST和GraphQL API。与传统的Mock方法相比,MSW更接近真实的网络行为,且无需修改应用代码。本文将全面介绍MSW的使用方法、配置以及最佳实践。

## MSW核心概念

### 工作原理

```
Application Code
      ↓
  fetch/axios request
      ↓
Service Worker (MSW) ← 拦截请求
      ↓
Mock Response ← 返回模拟数据
      ↓
Application Code
```

### 优势

- ✅ **真实的网络行为**: 使用真实的请求和响应
- ✅ **与框架无关**: 可用于任何前端框架
- ✅ **开发和测试双用**: 同时支持开发和测试环境
- ✅ **类型安全**: 完整的TypeScript支持
- ✅ **GraphQL支持**: 原生支持GraphQL查询

## 安装与配置

### 安装

```bash
npm install --save-dev msw

# 初始化Service Worker
npx msw init public/ --save
```

### 基础配置

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // GET请求
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ])
    );
  }),
  
  // POST请求
  rest.post('/api/users', async (req, res, ctx) => {
    const newUser = await req.json();
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        ...newUser,
      })
    );
  }),
];
```

### Node环境配置(测试)

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/setupTests.ts
import { server } from './mocks/server';

// 启动服务器
beforeAll(() => server.listen());

// 每个测试后重置handlers
afterEach(() => server.resetHandlers());

// 测试完成后关闭服务器
afterAll(() => server.close());
```

### 浏览器环境配置(开发)

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// src/index.tsx
import { worker } from './mocks/browser';

if (process.env.NODE_ENV === 'development') {
  worker.start();
}
```

## 请求处理器

### GET请求

```typescript
rest.get('/api/users/:id', (req, res, ctx) => {
  const { id } = req.params;
  
  return res(
    ctx.status(200),
    ctx.json({
      id: Number(id),
      name: `User ${id}`,
      email: `user${id}@example.com`,
    })
  );
});
```

### POST请求

```typescript
rest.post('/api/users', async (req, res, ctx) => {
  const body = await req.json();
  
  // 验证请求体
  if (!body.email) {
    return res(
      ctx.status(400),
      ctx.json({
        error: 'Email is required',
      })
    );
  }
  
  return res(
    ctx.status(201),
    ctx.json({
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    })
  );
});
```

### PUT/PATCH请求

```typescript
rest.put('/api/users/:id', async (req, res, ctx) => {
  const { id } = req.params;
  const updates = await req.json();
  
  return res(
    ctx.status(200),
    ctx.json({
      id: Number(id),
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  );
});

rest.patch('/api/users/:id', async (req, res, ctx) => {
  const { id } = req.params;
  const partialUpdates = await req.json();
  
  return res(
    ctx.status(200),
    ctx.json({
      id: Number(id),
      name: 'Existing Name',
      ...partialUpdates,
    })
  );
});
```

### DELETE请求

```typescript
rest.delete('/api/users/:id', (req, res, ctx) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res(
      ctx.status(403),
      ctx.json({
        error: 'Cannot delete admin user',
      })
    );
  }
  
  return res(
    ctx.status(204)
  );
});
```

## 请求检查

### 查询参数

```typescript
rest.get('/api/users', (req, res, ctx) => {
  const page = req.url.searchParams.get('page') || '1';
  const limit = req.url.searchParams.get('limit') || '10';
  const search = req.url.searchParams.get('search');
  
  let users = mockUsers;
  
  if (search) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  
  return res(
    ctx.status(200),
    ctx.json({
      data: users.slice(start, end),
      total: users.length,
      page: Number(page),
      limit: Number(limit),
    })
  );
});
```

### 请求头

```typescript
rest.get('/api/protected', (req, res, ctx) => {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res(
      ctx.status(401),
      ctx.json({ error: 'Unauthorized' })
    );
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (token !== 'valid-token') {
    return res(
      ctx.status(403),
      ctx.json({ error: 'Invalid token' })
    );
  }
  
  return res(
    ctx.status(200),
    ctx.json({ message: 'Protected data' })
  );
});
```

### Cookies

```typescript
rest.get('/api/session', (req, res, ctx) => {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res(
      ctx.status(401),
      ctx.json({ error: 'No session' })
    );
  }
  
  return res(
    ctx.status(200),
    ctx.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 3600,
    }),
    ctx.json({ sessionId })
  );
});
```

## 响应上下文

### 状态码

```typescript
rest.get('/api/resource', (req, res, ctx) => {
  return res(
    ctx.status(200),        // 成功
    // ctx.status(201),     // 创建成功
    // ctx.status(204),     // 无内容
    // ctx.status(400),     // 错误请求
    // ctx.status(401),     // 未授权
    // ctx.status(403),     // 禁止访问
    // ctx.status(404),     // 未找到
    // ctx.status(500),     // 服务器错误
    ctx.json({ data: 'success' })
  );
});
```

### 响应头

```typescript
rest.get('/api/file', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.set('Content-Type', 'application/pdf'),
    ctx.set('Content-Disposition', 'attachment; filename="document.pdf"'),
    ctx.set('X-Custom-Header', 'custom-value'),
    ctx.body('Binary content')
  );
});
```

### Cookie设置

```typescript
rest.post('/api/login', async (req, res, ctx) => {
  const { email, password } = await req.json();
  
  if (email === 'user@example.com' && password === 'password') {
    return res(
      ctx.status(200),
      ctx.cookie('authToken', 'fake-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600,
      }),
      ctx.json({
        user: { id: 1, email },
      })
    );
  }
  
  return res(
    ctx.status(401),
    ctx.json({ error: 'Invalid credentials' })
  );
});
```

### 延迟响应

```typescript
rest.get('/api/slow', (req, res, ctx) => {
  return res(
    ctx.delay(2000), // 2秒延迟
    ctx.status(200),
    ctx.json({ data: 'delayed response' })
  );
});

// 随机延迟
rest.get('/api/random-delay', (req, res, ctx) => {
  const delay = Math.random() * 3000;
  return res(
    ctx.delay(delay),
    ctx.status(200),
    ctx.json({ data: 'response' })
  );
});
```

## 动态处理器

### 运行时添加处理器

```typescript
// 测试中动态添加
test('handle specific scenario', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Server error' })
      );
    })
  );
  
  // 测试逻辑
});

// 测试后自动重置
afterEach(() => {
  server.resetHandlers();
});
```

### 一次性处理器

```typescript
test('handle once', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res.once(
        ctx.status(503),
        ctx.json({ error: 'Service unavailable' })
      );
    })
  );
  
  // 第一次请求返回503
  const response1 = await fetch('/api/users');
  expect(response1.status).toBe(503);
  
  // 第二次请求使用原始处理器
  const response2 = await fetch('/api/users');
  expect(response2.status).toBe(200);
});
```

### 网络错误

```typescript
rest.get('/api/network-error', (req, res, ctx) => {
  return res.networkError('Failed to connect');
});

test('handle network error', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res.networkError('Connection failed');
    })
  );
  
  await expect(fetchUsers()).rejects.toThrow('Connection failed');
});
```

## GraphQL支持

### GraphQL查询

```typescript
import { graphql } from 'msw';

const graphqlHandlers = [
  graphql.query('GetUser', (req, res, ctx) => {
    const { id } = req.variables;
    
    return res(
      ctx.data({
        user: {
          id,
          name: 'John Doe',
          email: 'john@example.com',
        },
      })
    );
  }),
  
  graphql.query('GetUsers', (req, res, ctx) => {
    return res(
      ctx.data({
        users: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ],
      })
    );
  }),
];
```

### GraphQL Mutation

```typescript
graphql.mutation('CreateUser', async (req, res, ctx) => {
  const { input } = req.variables;
  
  return res(
    ctx.data({
      createUser: {
        id: Date.now(),
        ...input,
      },
    })
  );
});

graphql.mutation('UpdateUser', async (req, res, ctx) => {
  const { id, input } = req.variables;
  
  return res(
    ctx.data({
      updateUser: {
        id,
        ...input,
      },
    })
  );
});
```

### GraphQL错误

```typescript
graphql.query('GetUser', (req, res, ctx) => {
  const { id } = req.variables;
  
  if (id < 0) {
    return res(
      ctx.errors([
        {
          message: 'Invalid user ID',
          extensions: {
            code: 'INVALID_INPUT',
          },
        },
      ])
    );
  }
  
  return res(
    ctx.data({
      user: { id, name: 'User' },
    })
  );
});
```

## 实战案例

### 1. 用户认证流程

```typescript
// auth handlers
const authHandlers = [
  // 登录
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();
    
    if (email === 'admin@example.com' && password === 'admin123') {
      return res(
        ctx.status(200),
        ctx.cookie('token', 'fake-jwt-token', {
          httpOnly: true,
          maxAge: 3600,
        }),
        ctx.json({
          user: {
            id: 1,
            email,
            role: 'admin',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Invalid credentials',
      })
    );
  }),
  
  // 登出
  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.cookie('token', '', { maxAge: 0 }),
      ctx.json({ message: 'Logged out' })
    );
  }),
  
  // 获取当前用户
  rest.get('/api/auth/me', (req, res, ctx) => {
    const token = req.cookies.token;
    
    if (!token) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Not authenticated' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 1,
          email: 'admin@example.com',
          role: 'admin',
        },
      })
    );
  }),
];

// 测试
describe('Authentication Flow', () => {
  it('should complete login flow', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### 2. 分页和过滤

```typescript
const paginationHandlers = [
  rest.get('/api/products', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') || 1);
    const limit = Number(req.url.searchParams.get('limit') || 10);
    const category = req.url.searchParams.get('category');
    const minPrice = Number(req.url.searchParams.get('minPrice') || 0);
    const maxPrice = Number(req.url.searchParams.get('maxPrice') || Infinity);
    
    let products = mockProducts;
    
    // 过滤
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    products = products.filter(
      p => p.price >= minPrice && p.price <= maxPrice
    );
    
    // 分页
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = products.slice(start, end);
    
    return res(
      ctx.status(200),
      ctx.json({
        data: paginatedProducts,
        pagination: {
          page,
          limit,
          total: products.length,
          totalPages: Math.ceil(products.length / limit),
        },
      })
    );
  }),
];
```

### 3. 文件上传

```typescript
rest.post('/api/upload', async (req, res, ctx) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return res(
      ctx.status(400),
      ctx.json({ error: 'No file provided' })
    );
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return res(
      ctx.status(400),
      ctx.json({ error: 'Invalid file type' })
    );
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return res(
      ctx.status(400),
      ctx.json({ error: 'File too large' })
    );
  }
  
  return res(
    ctx.status(201),
    ctx.json({
      fileId: Date.now().toString(),
      url: `/uploads/${file.name}`,
      size: file.size,
      type: file.type,
    })
  );
});
```

### 4. WebSocket模拟

```typescript
// MSW不直接支持WebSocket,但可以模拟HTTP长轮询
rest.get('/api/events/stream', (req, res, ctx) => {
  const events = [
    { id: 1, type: 'message', data: 'Hello' },
    { id: 2, type: 'notification', data: 'New notification' },
  ];
  
  return res(
    ctx.status(200),
    ctx.set('Content-Type', 'text/event-stream'),
    ctx.body(
      events.map(e => `data: ${JSON.stringify(e)}\n\n`).join('')
    )
  );
});
```

### 5. 错误场景模拟

```typescript
const errorHandlers = [
  // 网络超时
  rest.get('/api/slow-endpoint', (req, res, ctx) => {
    return res(
      ctx.delay(30000),
      ctx.status(408),
      ctx.json({ error: 'Request timeout' })
    );
  }),
  
  // 服务器错误
  rest.get('/api/server-error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal server error',
        details: 'Database connection failed',
      })
    );
  }),
  
  // 限流
  rest.get('/api/rate-limited', (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.set('Retry-After', '60'),
      ctx.json({
        error: 'Too many requests',
        retryAfter: 60,
      })
    );
  }),
  
  // 随机错误
  rest.get('/api/flaky', (req, res, ctx) => {
    if (Math.random() > 0.7) {
      return res(
        ctx.status(500),
        ctx.json({ error: 'Random error' })
      );
    }
    return res(
      ctx.status(200),
      ctx.json({ data: 'success' })
    );
  }),
];
```

## 测试场景

### 测试成功场景

```typescript
describe('API Success Scenarios', () => {
  it('should fetch users successfully', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });
  });
});
```

### 测试错误处理

```typescript
describe('API Error Handling', () => {
  it('should handle server error', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
  
  it('should handle network error', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res.networkError('Failed to fetch');
      })
    );
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
```

### 测试加载状态

```typescript
describe('Loading States', () => {
  it('should show loading indicator', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(200),
          ctx.json([])
        );
      })
    );
    
    render(<UserList />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});
```

## 最佳实践

### 组织Handler文件

```typescript
// src/mocks/handlers/index.ts
export { authHandlers } from './auth';
export { userHandlers } from './users';
export { productHandlers } from './products';

// src/mocks/handlers.ts
import {
  authHandlers,
  userHandlers,
  productHandlers,
} from './handlers';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...productHandlers,
];
```

### 使用数据工厂

```typescript
// src/mocks/factories/user.ts
export function createMockUser(overrides = {}) {
  return {
    id: Math.random(),
    name: 'Mock User',
    email: 'mock@example.com',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// 在handler中使用
rest.get('/api/users/:id', (req, res, ctx) => {
  const { id } = req.params;
  const user = createMockUser({ id: Number(id) });
  
  return res(ctx.status(200), ctx.json(user));
});
```

### 环境配置

```typescript
// 不同环境使用不同配置
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

if (isDevelopment) {
  worker.start({
    onUnhandledRequest: 'warn',
  });
}

if (isTest) {
  server.listen({
    onUnhandledRequest: 'error',
  });
}
```

### TypeScript类型

```typescript
import { rest, RestHandler } from 'msw';

interface User {
  id: number;
  name: string;
  email: string;
}

const getUserHandler: RestHandler = rest.get<never, { id: string }, User>(
  '/api/users/:id',
  (req, res, ctx) => {
    const { id } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        id: Number(id),
        name: 'User',
        email: 'user@example.com',
      })
    );
  }
);
```

MSW提供了强大的API模拟能力,通过在Service Worker级别拦截请求,实现了真实的网络行为模拟。掌握MSW的使用,可以大大提升测试质量和开发体验。

