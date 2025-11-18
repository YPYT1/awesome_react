# CSRF 跨站请求伪造防护 - 完整防护指南

## 1. CSRF 攻击概述

### 1.1 什么是 CSRF

CSRF（Cross-Site Request Forgery，跨站请求伪造）是一种攻击方式，攻击者诱导用户在已登录的网站上执行非本意的操作。攻击者利用用户的登录凭证（Cookie），在用户不知情的情况下向目标网站发送恶意请求。

**核心原理：**

```
1. 用户登录 bank.com，获得会话 Cookie
2. 用户访问恶意网站 evil.com
3. evil.com 包含向 bank.com 发起请求的代码
4. 浏览器自动携带 bank.com 的 Cookie
5. bank.com 接收请求，误认为是用户主动操作
6. 攻击成功executed
```

**危害：**

- **资金转账**：未经授权的转账操作
- **密码修改**：更改用户密码
- **数据篡改**：修改用户信息
- **权限提升**：添加管理员账户
- **恶意操作**：删除数据、发送垃圾信息

### 1.2 CSRF 攻击示例

#### 基本攻击

```html
<!-- evil.com 上的恶意页面 -->
<!DOCTYPE html>
<html>
<body>
  <!-- GET 请求攻击 -->
  <img src="https://bank.com/transfer?to=attacker&amount=10000" style="display:none">
  
  <!-- POST 请求攻击 -->
  <form id="csrf-form" action="https://bank.com/transfer" method="POST" style="display:none">
    <input name="to" value="attacker">
    <input name="amount" value="10000">
  </form>
  
  <script>
    // 自动提交表单
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>
```

#### AJAX 攻击

```html
<!-- evil.com 上的 AJAX 攻击 -->
<script>
  fetch('https://bank.com/api/transfer', {
    method: 'POST',
    credentials: 'include',  // 携带 Cookie
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: 'attacker',
      amount: 10000
    })
  });
</script>
```

#### 链接诱导

```html
<!-- 诱导用户点击 -->
<a href="https://bank.com/transfer?to=attacker&amount=10000">
  查看可爱猫咪图片
</a>

<!-- 自动重定向 -->
<script>
  window.location = 'https://bank.com/transfer?to=attacker&amount=10000';
</script>
```

### 1.3 GET vs POST

```javascript
// ❌ GET 请求特别容易受 CSRF 攻击
app.get('/delete-account', (req, res) => {
  // 危险：GET 请求应该是幂等的
  deleteUserAccount(req.user.id);
  res.json({ success: true });
});

// ✅ 使用 POST/PUT/DELETE 进行状态改变
app.post('/delete-account', (req, res) => {
  // 仍需要 CSRF 保护
  deleteUserAccount(req.user.id);
  res.json({ success: true });
});
```

## 2. CSRF 防护策略

### 2.1 CSRF Token（推荐）

#### 同步 Token 模式

```typescript
// server.ts - Express 中间件
import crypto from 'crypto';
import session from 'express-session';

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// 生成 CSRF Token
app.use((req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

// 验证 CSRF Token
function verifyCsrfToken(req: any, res: any, next: any) {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  
  if (token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

// 应用到需要保护的路由
app.post('/transfer', verifyCsrfToken, (req, res) => {
  // 处理转账逻辑
});
```

#### 前端使用 CSRF Token

```tsx
import { useState, useEffect } from 'react';

function TransferForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    // 从服务器获取 CSRF Token
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token));
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append('_csrf', csrfToken);
    
    await fetch('/api/transfer', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      <input name="to" placeholder="收款人" />
      <input name="amount" type="number" placeholder="金额" />
      <button type="submit">转账</button>
    </form>
  );
}
```

#### AJAX 请求中使用

```typescript
// 设置全局 AJAX 拦截器
import axios from 'axios';

// 获取 CSRF Token
async function getCsrfToken(): Promise<string> {
  const response = await fetch('/api/csrf-token');
  const data = await response.json();
  return data.token;
}

// 配置 axios
axios.interceptors.request.use(async (config) => {
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    const token = await getCsrfToken();
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

// 使用示例
async function transfer(to: string, amount: number) {
  const response = await axios.post('/api/transfer', { to, amount });
  return response.data;
}
```

### 2.2 双重 Cookie 验证

```typescript
// server.ts
import crypto from 'crypto';

app.use((req, res, next) => {
  // 生成 CSRF Token
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // 设置到 Cookie
  res.cookie('csrf-token', csrfToken, {
    httpOnly: false,  // 允许 JavaScript 读取
    secure: true,
    sameSite: 'strict'
  });
  
  next();
});

// 验证中间件
function verifyCsrfToken(req: any, res: any, next: any) {
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

// 应用到路由
app.post('/api/*', verifyCsrfToken, (req, res) => {
  // 处理请求
});
```

```typescript
// client.ts
// 从 Cookie 读取 Token 并添加到请求头
function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || '';
  }
  return '';
}

axios.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrf-token');
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});
```

### 2.3 SameSite Cookie

```typescript
// server.ts
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await authenticateUser(username, password);
  
  if (user) {
    // 设置 SameSite Cookie
    res.cookie('sessionId', user.sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',  // 或 'lax'
      maxAge: 3600000
    });
    
    res.json({ success: true });
  }
});
```

**SameSite 选项：**

```typescript
// Strict - 最严格，完全禁止跨站发送
sameSite: 'strict'

// Lax - 允许顶级导航的 GET 请求
sameSite: 'lax'

// None - 允许跨站发送（必须配合 Secure）
sameSite: 'none'
secure: true
```

### 2.4 验证 Origin 和 Referer

```typescript
// server.ts
function verifyOrigin(req: any, res: any, next: any) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  const allowedOrigins = [
    'https://example.com',
    'https://www.example.com'
  ];
  
  // 验证 Origin
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  // 验证 Referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!allowedOrigins.some(allowed => refererUrl.origin === allowed)) {
        return res.status(403).json({ error: 'Invalid referer' });
      }
    } catch {
      return res.status(403).json({ error: 'Invalid referer' });
    }
  }
  
  next();
}

app.post('/api/*', verifyOrigin, (req, res) => {
  // 处理请求
});
```

### 2.5 自定义 Header

```typescript
// client.ts
// 添加自定义 header
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// server.ts
function requireCustomHeader(req: any, res: any, next: any) {
  const customHeader = req.headers['x-requested-with'];
  
  if (customHeader !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Invalid request' });
  }
  
  next();
}

app.post('/api/*', requireCustomHeader, (req, res) => {
  // 处理请求
});
```

## 3. 使用 csurf 库

### 3.1 基本使用

```bash
# 安装 csurf
npm install csurf cookie-parser
```

```typescript
// server.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

const app = express();

// 必需的中间件
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CSRF 保护
const csrfProtection = csrf({ cookie: true });

// 获取 CSRF Token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ token: req.csrfToken() });
});

// 保护的路由
app.post('/api/transfer', csrfProtection, (req, res) => {
  const { to, amount } = req.body;
  
  // 处理转账逻辑
  res.json({ success: true });
});

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'Invalid CSRF token' });
  } else {
    next(err);
  }
});
```

### 3.2 配置选项

```typescript
// 使用 session 存储
import session from 'express-session';

app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));

const csrfProtection = csrf({
  cookie: false,  // 使用 session 而非 cookie
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    // 自定义 token 提取
    return req.body._csrf || req.headers['x-csrf-token'];
  }
});
```

### 3.3 表单集成

```tsx
// React 组件
import { useState, useEffect } from 'react';

function SecureForm() {
  const [csrfToken, setCsrfToken] = useState('');
  
  useEffect(() => {
    fetch('/api/csrf-token', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setCsrfToken(data.token));
  }, []);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch('/api/transfer', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        to: formData.get('to'),
        amount: formData.get('amount')
      })
    });
    
    if (response.ok) {
      alert('Transfer successful!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      <input name="to" placeholder="Recipient" required />
      <input name="amount" type="number" placeholder="Amount" required />
      <button type="submit">Transfer</button>
    </form>
  );
}
```

## 4. React 应用防护

### 4.1 Context + Hook 方案

```tsx
// CsrfContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CsrfContextType {
  token: string;
  refreshToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

export function CsrfProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState('');
  
  const refreshToken = async () => {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    const data = await response.json();
    setToken(data.token);
  };
  
  useEffect(() => {
    refreshToken();
  }, []);
  
  return (
    <CsrfContext.Provider value={{ token, refreshToken }}>
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrf() {
  const context = useContext(CsrfContext);
  if (!context) {
    throw new Error('useCsrf must be used within CsrfProvider');
  }
  return context;
}
```

```tsx
// App.tsx
import { CsrfProvider } from './CsrfContext';

function App() {
  return (
    <CsrfProvider>
      <YourApp />
    </CsrfProvider>
  );
}
```

```tsx
// TransferForm.tsx
import { useCsrf } from './CsrfContext';

function TransferForm() {
  const { token } = useCsrf();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/transfer', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token
      },
      body: JSON.stringify(formData)
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4.2 Axios 拦截器

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// 请求拦截器
apiClient.interceptors.request.use(async (config) => {
  // 获取 CSRF Token
  const response = await fetch('/api/csrf-token', {
    credentials: 'include'
  });
  const data = await response.json();
  
  // 添加 CSRF Token
  if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = data.token;
  }
  
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // CSRF token 失效，刷新页面或重新获取
      console.error('CSRF token invalid');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

```tsx
// 使用封装的 API 客户端
import apiClient from './api/client';

function TransferForm() {
  const handleTransfer = async () => {
    try {
      const response = await apiClient.post('/transfer', {
        to: 'recipient',
        amount: 1000
      });
      console.log('Transfer successful:', response.data);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };
  
  return <button onClick={handleTransfer}>Transfer</button>;
}
```

### 4.3 React Query 集成

```typescript
// hooks/useSecureMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export function useSecureMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onError: (error: any) => {
      if (error.response?.status === 403) {
        // CSRF token 失效
        alert('Security token expired. Please refresh the page.');
      }
    },
    onSuccess: () => {
      // 刷新相关查询
      queryClient.invalidateQueries();
    }
  });
}
```

```tsx
// TransferForm.tsx
import { useSecureMutation } from '../hooks/useSecureMutation';
import apiClient from '../api/client';

function TransferForm() {
  const transferMutation = useSecureMutation((data: { to: string; amount: number }) =>
    apiClient.post('/transfer', data)
  );
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferMutation.mutate({
      to: 'recipient',
      amount: 1000
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={transferMutation.isPending}>
        {transferMutation.isPending ? 'Processing...' : 'Transfer'}
      </button>
    </form>
  );
}
```

## 5. Next.js 应用防护

### 5.1 API Routes 保护

```typescript
// pages/api/csrf-token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken } from '@/lib/csrf';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = generateToken();
  
  // 设置到 cookie
  res.setHeader('Set-Cookie', `csrf-token=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`);
  
  res.status(200).json({ token });
}
```

```typescript
// pages/api/transfer.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/csrf';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const token = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies['csrf-token'];
  
  if (!verifyToken(token, cookieToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // 处理转账逻辑
  res.status(200).json({ success: true });
}
```

### 5.2 Middleware 保护

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 只保护修改操作
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const token = request.headers.get('x-csrf-token');
    const cookieToken = request.cookies.get('csrf-token')?.value;
    
    if (!token || !cookieToken || token !== cookieToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
```

### 5.3 Server Actions 保护

```typescript
// app/actions/transfer.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function transfer(formData: FormData) {
  const csrfToken = formData.get('_csrf') as string;
  const cookieStore = cookies();
  const cookieToken = cookieStore.get('csrf-token')?.value;
  
  if (!csrfToken || csrfToken !== cookieToken) {
    throw new Error('Invalid CSRF token');
  }
  
  const to = formData.get('to') as string;
  const amount = formData.get('amount') as string;
  
  // 处理转账逻辑
  
  redirect('/success');
}
```

```tsx
// app/transfer/page.tsx
import { transfer } from '../actions/transfer';

export default function TransferPage() {
  return (
    <form action={transfer}>
      <input type="hidden" name="_csrf" value={getCsrfToken()} />
      <input name="to" placeholder="Recipient" required />
      <input name="amount" type="number" placeholder="Amount" required />
      <button type="submit">Transfer</button>
    </form>
  );
}
```

## 6. 测试与验证

### 6.1 手动测试

```html
<!-- 创建测试页面 test-csrf.html -->
<!DOCTYPE html>
<html>
<body>
  <h1>CSRF Test</h1>
  
  <!-- 测试 GET 请求 -->
  <img src="https://your-app.com/api/transfer?to=attacker&amount=1000">
  
  <!-- 测试 POST 请求 -->
  <form id="csrf-test" action="https://your-app.com/api/transfer" method="POST">
    <input name="to" value="attacker">
    <input name="amount" value="1000">
  </form>
  
  <script>
    document.getElementById('csrf-test').submit();
  </script>
</body>
</html>
```

### 6.2 自动化测试

```typescript
// csrf.test.ts
import request from 'supertest';
import app from '../app';

describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .send({ to: 'attacker', amount: 1000 });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toContain('CSRF');
  });
  
  it('should accept requests with valid CSRF token', async () => {
    // 获取 CSRF token
    const tokenResponse = await request(app)
      .get('/api/csrf-token');
    
    const csrfToken = tokenResponse.body.token;
    const cookie = tokenResponse.headers['set-cookie'];
    
    // 发送带 token 的请求
    const response = await request(app)
      .post('/api/transfer')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ to: 'recipient', amount: 1000 });
    
    expect(response.status).toBe(200);
  });
  
  it('should reject requests with invalid CSRF token', async () => {
    const response = await request(app)
      .post('/api/transfer')
      .set('X-CSRF-Token', 'invalid-token')
      .send({ to: 'attacker', amount: 1000 });
    
    expect(response.status).toBe(403);
  });
});
```

## 7. 最佳实践

### 7.1 防护清单

**基础防护：**
- [ ] 使用 CSRF Token 保护所有状态改变操作
- [ ] 设置 SameSite Cookie 属性
- [ ] 验证 Origin 和 Referer 头
- [ ] 使用 POST/PUT/DELETE 而非 GET 修改状态

**Token 管理：**
- [ ] 每次会话生成新的 CSRF Token
- [ ] Token 应该随机且不可预测
- [ ] Token 应该与用户会话绑定
- [ ] 定期轮换 Token

**实现细节：**
- [ ] 在表单中包含隐藏的 CSRF Token
- [ ] 在 AJAX 请求头中包含 Token
- [ ] 服务器端验证 Token
- [ ] 错误处理要友好

### 7.2 安全配置

```typescript
// 完整的安全配置
import express from 'express';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();

// 基础安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  frameguard: { action: 'deny' }
}));

// Cookie 解析
app.use(cookieParser());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000
  }
}));

// CSRF 保护
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// 验证 Origin
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://example.com'];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  next();
});
```

## 8. 总结

CSRF 防护的关键要点：

1. **CSRF Token**：最有效的防护手段
2. **SameSite Cookie**：简单有效的辅助防护
3. **验证来源**：检查 Origin 和 Referer
4. **安全设计**：避免 GET 请求修改状态
5. **多层防御**：结合多种防护措施

通过正确实施这些防护措施，可以有效防止 CSRF 攻击，保护用户账户安全。

