# JWT 认证原理 - 现代Web认证方案

## 1. JWT 简介

### 1.1 什么是 JWT

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息作为JSON对象。这些信息可以被验证和信任，因为它是数字签名的。

**核心特点：**
- **自包含**：包含所有必要的用户信息
- **无状态**：服务器不需要存储会话
- **可扩展**：易于在分布式系统中使用
- **跨域友好**：不依赖Cookie

### 1.2 JWT 结构

JWT由三部分组成，用点（.）分隔：

```
Header.Payload.Signature
```

#### Header（头部）

```json
{
  "alg": "HS256",  // 签名算法
  "typ": "JWT"     // 令牌类型
}
```

#### Payload（载荷）

```json
{
  // 标准声明
  "iss": "issuer",           // 签发者
  "sub": "user123",          // 主题(用户ID)
  "aud": "audience",         // 受众
  "exp": 1735689600,         // 过期时间
  "nbf": 1735603200,         // 生效时间
  "iat": 1735603200,         // 签发时间
  "jti": "unique-id",        // JWT ID
  
  // 自定义声明
  "username": "john",
  "email": "john@example.com",
  "role": "admin"
}
```

#### Signature（签名）

```javascript
// HMAC SHA256
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### 1.3 完整示例

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

┌─────────────────── Header ────────────────────┐
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9         │
│ {"alg":"HS256","typ":"JWT"}                   │
└───────────────────────────────────────────────┘

┌─────────────────── Payload ───────────────────┐
│ eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ │
│ {"sub":"user123","name":"John Doe","iat":1516239022}              │
└───────────────────────────────────────────────┘

┌─────────────────── Signature ─────────────────┐
│ SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  │
│ HMACSHA256(header.payload, secret)             │
└───────────────────────────────────────────────┘
```

## 2. JWT 认证流程

### 2.1 基本流程

```
┌─────┐                        ┌─────────┐
│     │ 1. 登录(用户名/密码)   │         │
│     │ ─────────────────────→ │         │
│     │                        │         │
│     │ 2. 验证成功,返回JWT    │         │
│     │ ←───────────────────── │         │
│     │                        │         │
│     │ 3. 携带JWT访问API      │         │
│用户 │ ─────────────────────→ │ 服务器  │
│     │                        │         │
│     │ 4. 验证JWT,返回数据    │         │
│     │ ←───────────────────── │         │
│     │                        │         │
│     │ 5. 后续请求携带JWT     │         │
│     │ ─────────────────────→ │         │
└─────┘                        └─────────┘
```

### 2.2 详细步骤

**步骤1：用户登录**
```typescript
// 客户端
const loginRequest = {
  username: 'john',
  password: 'secret123'
};

const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginRequest)
});

const { token } = await response.json();
```

**步骤2：服务器验证并生成JWT**
```typescript
// 服务器
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

async function login(username: string, password: string) {
  // 验证用户
  const user = await getUserByUsername(username);
  
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    throw new Error('Invalid credentials');
  }
  
  // 生成JWT
  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  
  return { token };
}
```

**步骤3：客户端存储JWT**
```typescript
// 存储到localStorage(不推荐,XSS风险)
localStorage.setItem('token', token);

// 存储到sessionStorage
sessionStorage.setItem('token', token);

// 存储到内存(推荐)
let authToken: string | null = token;

// 存储到HttpOnly Cookie(最安全,由服务器设置)
// 不需要客户端代码
```

**步骤4：发送请求时携带JWT**
```typescript
// Authorization header(推荐)
const response = await fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 自定义header
const response = await fetch('/api/protected', {
  headers: {
    'X-Auth-Token': token
  }
});

// Cookie(自动发送)
const response = await fetch('/api/protected', {
  credentials: 'include'
});
```

**步骤5：服务器验证JWT**
```typescript
// 中间件验证
import { Request, Response, NextFunction } from 'express';

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// 使用中间件
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Protected data',
    user: req.user 
  });
});
```

## 3. JWT 实现

### 3.1 Node.js 实现

```bash
# 安装依赖
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

#### 生成JWT

```typescript
// auth.service.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  username: string;
  role: string;
}

export class AuthService {
  private static readonly SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_SECRET = process.env.REFRESH_SECRET!;
  
  // 生成访问令牌
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.SECRET,
      {
        expiresIn: '15m',
        issuer: 'my-app',
        audience: 'my-app-users'
      }
    );
  }
  
  // 生成刷新令牌
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { sub: userId },
      this.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }
  
  // 验证令牌
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.SECRET) as TokenPayload;
  }
  
  static verifyRefreshToken(token: string): { sub: string } {
    return jwt.verify(token, this.REFRESH_SECRET) as { sub: string };
  }
}
```

#### 登录端点

```typescript
// auth.controller.ts
import express from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // 生成令牌
    const accessToken = AuthService.generateAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role
    });
    
    const refreshToken = AuthService.generateRefreshToken(user.id);
    
    // 设置HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    });
    
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

#### 认证中间件

```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    username: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 从header获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // 验证token
    const payload = AuthService.verifyAccessToken(token);
    
    // 附加用户信息到请求
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// 角色检查中间件
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

#### 刷新令牌

```typescript
// auth.controller.ts
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }
    
    // 验证刷新令牌
    const payload = AuthService.verifyRefreshToken(refreshToken);
    
    // 获取用户信息
    const user = await getUserById(payload.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // 生成新的访问令牌
    const accessToken = AuthService.generateAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role
    });
    
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});
```

### 3.2 React 集成

#### 创建 Auth Context

```tsx
// AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // 从sessionStorage恢复token
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    }
  }, []);
  
  const fetchUser = async (token: string) => {
    try {
      const response = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      // Token无效,清除
      setToken(null);
      sessionStorage.removeItem('token');
    }
  };
  
  const login = async (username: string, password: string) => {
    const response = await axios.post('/api/login', {
      username,
      password
    });
    
    const { accessToken } = response.data;
    
    setToken(accessToken);
    sessionStorage.setItem('token', accessToken);
    
    await fetchUser(accessToken);
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    
    // 通知服务器
    axios.post('/api/logout');
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 配置 Axios 拦截器

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理token过期
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Token过期,尝试刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post('/api/refresh', {}, {
          withCredentials: true
        });
        
        const { accessToken } = response.data;
        sessionStorage.setItem('token', accessToken);
        
        // 重试原请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败,清除token并跳转登录
        sessionStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 受保护的路由

```tsx
// ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}

// 角色保护
export function RoleProtectedRoute({ roles }: { roles: string[] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  
  return <Outlet />;
}
```

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* 需要认证 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* 需要管理员角色 */}
          <Route element={<RoleProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

#### 登录表单

```tsx
// LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };
  
  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

## 4. JWT 最佳实践

### 4.1 安全存储

```typescript
// ❌ 不安全 - localStorage (XSS风险)
localStorage.setItem('token', token);

// ❌ 不安全 - 普通Cookie (CSRF风险)
document.cookie = `token=${token}`;

// ✅ 推荐 - HttpOnly Cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// ✅ 推荐 - 内存存储(单页应用)
class TokenStore {
  private token: string | null = null;
  
  setToken(token: string) {
    this.token = token;
  }
  
  getToken(): string | null {
    return this.token;
  }
  
  clearToken() {
    this.token = null;
  }
}
```

### 4.2 令牌过期策略

```typescript
// 双令牌策略
interface TokenPair {
  accessToken: string;   // 短期(15分钟)
  refreshToken: string;  // 长期(7天)
}

function generateTokenPair(userId: string): TokenPair {
  const accessToken = jwt.sign(
    { sub: userId },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { sub: userId },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// 刷新策略
async function refreshAccessToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, REFRESH_SECRET);
  const newAccessToken = jwt.sign(
    { sub: payload.sub },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  return newAccessToken;
}
```

### 4.3 令牌撤销

```typescript
// 使用黑名单
const tokenBlacklist = new Set<string>();

function revokeToken(token: string) {
  tokenBlacklist.add(token);
}

function isTokenRevoked(token: string): boolean {
  return tokenBlacklist.has(token);
}

// 验证时检查黑名单
function verifyToken(token: string) {
  if (isTokenRevoked(token)) {
    throw new Error('Token revoked');
  }
  
  return jwt.verify(token, SECRET);
}

// 使用Redis存储黑名单
import Redis from 'ioredis';

const redis = new Redis();

async function revokeToken(token: string) {
  const payload = jwt.decode(token) as any;
  const ttl = payload.exp - Math.floor(Date.now() / 1000);
  
  if (ttl > 0) {
    await redis.setex(`blacklist:${token}`, ttl, '1');
  }
}

async function isTokenRevoked(token: string): Promise<boolean> {
  const exists = await redis.exists(`blacklist:${token}`);
  return exists === 1;
}
```

### 4.4 敏感信息处理

```typescript
// ❌ 不要在payload中存储敏感信息
const badToken = jwt.sign({
  password: 'secret123',        // 永远不要
  creditCard: '1234-5678-9012',  // 永远不要
  ssn: '123-45-6789'             // 永远不要
}, SECRET);

// ✅ 只存储必要的标识信息
const goodToken = jwt.sign({
  sub: userId,
  role: userRole,
  iat: Math.floor(Date.now() / 1000)
}, SECRET, {
  expiresIn: '1h'
});

// 需要详细信息时从数据库查询
async function getUserData(userId: string) {
  const user = await db.users.findById(userId);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    // 其他非敏感信息
  };
}
```

## 5. 常见安全问题

### 5.1 XSS攻击

```typescript
// 防御措施
// 1. 不要在localStorage存储token
// 2. 使用HttpOnly Cookie
// 3. 实施CSP策略
// 4. 转义用户输入

// 设置安全的Cookie
res.cookie('token', token, {
  httpOnly: true,     // 防止JavaScript访问
  secure: true,       // 只在HTTPS下发送
  sameSite: 'strict', // CSRF保护
  maxAge: 3600000     // 1小时
});
```

### 5.2 CSRF攻击

```typescript
// 防御措施
// 1. 使用SameSite Cookie
// 2. 实施CSRF Token
// 3. 验证Origin/Referer

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://example.com'];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
});
```

### 5.3 重放攻击

```typescript
// 防御措施
// 1. 使用短期token
// 2. 添加jti(JWT ID)
// 3. 实施nonce机制

function generateToken(userId: string) {
  const jti = crypto.randomBytes(16).toString('hex');
  
  return jwt.sign({
    sub: userId,
    jti: jti
  }, SECRET, {
    expiresIn: '15m'
  });
}

// 验证时检查jti是否已使用
const usedJtis = new Set<string>();

function verifyToken(token: string) {
  const payload = jwt.verify(token, SECRET) as any;
  
  if (usedJtis.has(payload.jti)) {
    throw new Error('Token已被使用');
  }
  
  usedJtis.add(payload.jti);
  
  return payload;
}
```

## 6. JWT vs Session

### 6.1 对比

```typescript
// Session认证
/**
 * 优点:
 * - 服务器可控制会话
 * - 易于撤销
 * - 更安全(信息存服务器)
 * 
 * 缺点:
 * - 需要服务器存储
 * - 难以扩展
 * - CORS问题
 */

// JWT认证
/**
 * 优点:
 * - 无状态,易扩展
 * - 跨域友好
 * - 减少数据库查询
 * 
 * 缺点:
 * - 难以撤销
 * - payload大小限制
 * - 无法更新未过期token
 */
```

### 6.2 选择建议

```typescript
// 使用Session的场景
- 需要频繁撤销会话
- 高安全性要求
- 单体应用

// 使用JWT的场景
- 微服务架构
- 移动应用
- 第三方API集成
- 需要跨域认证
```

## 7. 实战技巧

### 7.1 Token刷新机制

```typescript
// 自动刷新策略
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    this.scheduleRefresh();
  }
  
  private scheduleRefresh() {
    // 解析token获取过期时间
    const payload = jwt.decode(this.accessToken!) as any;
    const expiresIn = payload.exp * 1000 - Date.now();
    
    // 在过期前5分钟刷新
    const refreshIn = expiresIn - 5 * 60 * 1000;
    
    if (refreshIn > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refresh();
      }, refreshIn);
    }
  }
  
  private async refresh() {
    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      const { accessToken } = await response.json();
      this.accessToken = accessToken;
      this.scheduleRefresh();
    } catch (error) {
      // 刷新失败,跳转登录
      window.location.href = '/login';
    }
  }
  
  getAccessToken() {
    return this.accessToken;
  }
  
  clear() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.accessToken = null;
    this.refreshToken = null;
  }
}
```

### 7.2 多设备管理

```typescript
// 记录登录设备
interface Session {
  userId: string;
  deviceId: string;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
}

// 登录时创建会话
async function createSession(userId: string, req: Request) {
  const session: Session = {
    userId,
    deviceId: generateDeviceId(req),
    refreshToken: generateRefreshToken(userId),
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip,
    createdAt: new Date()
  };
  
  await db.sessions.create(session);
  
  return session;
}

// 撤销特定设备
async function revokeDevice(userId: string, deviceId: string) {
  await db.sessions.deleteOne({ userId, deviceId });
}

// 撤销所有设备(登出所有)
async function revokeAllDevices(userId: string) {
  await db.sessions.deleteMany({ userId });
}
```

## 8. 测试

### 8.1 单元测试

```typescript
// auth.service.test.ts
import { AuthService } from './auth.service';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  describe('generateAccessToken', () => {
    it('should generate valid token', () => {
      const payload = {
        sub: 'user123',
        username: 'john',
        role: 'user'
      };
      
      const token = AuthService.generateAccessToken(payload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.sub).toBe('user123');
      expect(decoded.username).toBe('john');
      expect(decoded.role).toBe('user');
    });
    
    it('should set correct expiration', () => {
      const token = AuthService.generateAccessToken({
        sub: 'user123',
        username: 'john',
        role: 'user'
      });
      
      const decoded = jwt.decode(token) as any;
      const expiresIn = decoded.exp - decoded.iat;
      
      expect(expiresIn).toBe(15 * 60); // 15分钟
    });
  });
  
  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const token = AuthService.generateAccessToken({
        sub: 'user123',
        username: 'john',
        role: 'user'
      });
      
      const payload = AuthService.verifyAccessToken(token);
      
      expect(payload.sub).toBe('user123');
    });
    
    it('should reject expired token', () => {
      const token = jwt.sign(
        { sub: 'user123' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' }
      );
      
      expect(() => {
        AuthService.verifyAccessToken(token);
      }).toThrow();
    });
  });
});
```

### 8.2 集成测试

```typescript
// auth.e2e.test.ts
import request from 'supertest';
import app from '../app';

describe('Authentication E2E', () => {
  it('should login and access protected route', async () => {
    // 登录
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'testuser',
        password: 'testpass'
      });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();
    
    const { accessToken } = loginResponse.body;
    
    // 访问受保护路由
    const protectedResponse = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(protectedResponse.status).toBe(200);
  });
  
  it('should refresh expired token', async () => {
    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpass' });
    
    const cookies = loginResponse.headers['set-cookie'];
    
    // 刷新token
    const refreshResponse = await request(app)
      .post('/api/refresh')
      .set('Cookie', cookies);
    
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.accessToken).toBeDefined();
  });
});
```

## 9. 总结

JWT认证的关键要点:

1. **安全存储**: 使用HttpOnly Cookie或内存存储,避免localStorage
2. **短期有效**: accessToken使用短期有效期(15分钟)
3. **刷新机制**: 使用refreshToken实现无感刷新
4. **撤销策略**: 实施token黑名单或会话管理
5. **防御措施**: 防范XSS、CSRF、重放攻击

通过正确实施JWT认证,可以构建安全、可扩展的身份验证系统。

