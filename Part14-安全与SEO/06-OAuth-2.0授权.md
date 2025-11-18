# OAuth 2.0 授权 - 第三方授权标准协议

## 1. OAuth 2.0 简介

### 1.1 什么是 OAuth 2.0

OAuth 2.0 是一个开放标准的授权协议,允许用户授权第三方应用访问他们存储在另外服务提供者上的信息,而无需将用户名和密码提供给第三方应用。

**核心概念：**
- **资源所有者（Resource Owner）**: 用户
- **客户端（Client）**: 第三方应用
- **资源服务器（Resource Server）**: 存储用户资源的服务器
- **授权服务器（Authorization Server）**: 发放访问令牌的服务器

### 1.2 OAuth 2.0 vs OAuth 1.0

```typescript
// OAuth 1.0
- 复杂的签名过程
- 需要客户端密钥
- 仅支持HTTP
- 令牌有效期不明确

// OAuth 2.0
- 简化的授权流程
- 多种授权方式
- 支持HTTPS
- Bearer Token机制
- 明确的令牌过期时间
```

### 1.3 OAuth 2.0 的优势

**安全性：**
- 用户无需共享密码
- 限定授权范围
- 可撤销的访问权限
- 短期访问令牌

**灵活性：**
- 多种授权模式
- 适用各种场景
- 扩展性强

## 2. OAuth 2.0 授权流程

### 2.1 授权码模式（Authorization Code Flow）

最安全和最常用的模式。

```
┌──────┐                                           ┌────────────┐
│      │                                           │            │
│      │──(A)──授权请求──────────────────────────→│            │
│      │                                           │    授权    │
│      │←─(B)──授权码────────────────────────────│    服务器  │
│      │                                           │            │
│ 客户 │──(C)──授权码+客户端凭证──────────────────→│            │
│ 端   │                                           └────────────┘
│      │                                           ┌────────────┐
│      │←─(D)──访问令牌+刷新令牌──────────────────│    令牌    │
│      │                                           │    端点    │
│      │                                           └────────────┘
│      │                                           ┌────────────┐
│      │──(E)──访问令牌──────────────────────────→│    资源    │
│      │                                           │    服务器  │
│      │←─(F)──受保护资源─────────────────────────│            │
└──────┘                                           └────────────┘
```

**步骤详解：**

```typescript
// (A) 用户点击"使用XX登录"
const authUrl = `https://auth.example.com/oauth/authorize?
  response_type=code&
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  scope=read_user+read_email&
  state=${STATE}`;

window.location.href = authUrl;

// (B) 用户授权后重定向回来,携带授权码
// http://yourapp.com/callback?code=AUTHORIZATION_CODE&state=STATE

// (C) 后端用授权码换取访问令牌
const tokenResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  })
});

// (D) 获取访问令牌和刷新令牌
const { access_token, refresh_token, expires_in } = await tokenResponse.json();

// (E, F) 使用访问令牌请求资源
const userResponse = await fetch('https://api.example.com/user', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

### 2.2 隐式授权模式（Implicit Flow）

适用于纯前端应用（不推荐,已废弃）。

```typescript
// 直接返回访问令牌(不安全)
const authUrl = `https://auth.example.com/oauth/authorize?
  response_type=token&
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  scope=read_user`;

// 重定向
// http://yourapp.com/callback#access_token=TOKEN&token_type=Bearer
```

### 2.3 密码模式（Resource Owner Password Credentials）

用户直接提供用户名和密码（仅限可信应用）。

```typescript
const tokenResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'password',
    username: 'user@example.com',
    password: 'userpassword',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  })
});
```

### 2.4 客户端凭证模式（Client Credentials）

应用自身认证,不涉及用户。

```typescript
const tokenResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  })
});
```

### 2.5 刷新令牌流程

```typescript
const refreshResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  })
});

const { access_token, refresh_token } = await refreshResponse.json();
```

## 3. PKCE 增强安全性

PKCE（Proof Key for Code Exchange）用于增强授权码流程的安全性,特别适用于移动应用和SPA。

### 3.1 PKCE 流程

```typescript
// 1. 生成code_verifier
import crypto from 'crypto';

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// 2. 生成code_challenge
function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

// 3. 授权请求(携带code_challenge)
const authUrl = `https://auth.example.com/oauth/authorize?
  response_type=code&
  client_id=${CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`;

// 4. 令牌请求(携带code_verifier)
const tokenResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier  // 验证
  })
});
```

### 3.2 React 实现 PKCE

```tsx
// OAuthLogin.tsx
import { useState, useEffect } from 'react';

export function OAuthLogin() {
  const handleLogin = () => {
    // 生成并存储code_verifier
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('code_verifier', codeVerifier);
    
    // 生成code_challenge
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // 生成state(防CSRF)
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    
    // 构建授权URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.REACT_APP_CLIENT_ID!,
      redirect_uri: process.env.REACT_APP_REDIRECT_URI!,
      scope: 'read_user read_email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    window.location.href = `https://auth.example.com/oauth/authorize?${params}`;
  };
  
  return (
    <button onClick={handleLogin}>
      使用OAuth登录
    </button>
  );
}

// 辅助函数
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeChallenge(verifier: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  
  return crypto.subtle.digest('SHA-256', data)
    .then(hash => {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
      return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    });
}
```

## 4. 实现 OAuth 服务器

### 4.1 授权服务器

```typescript
// auth-server.ts
import express from 'express';
import crypto from 'crypto';

const app = express();

// 存储授权码和令牌(实际应使用数据库)
const authCodes = new Map();
const tokens = new Map();

// 授权端点
app.get('/oauth/authorize', (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge,
    code_challenge_method
  } = req.query;
  
  // 验证客户端
  const client = getClientById(client_id);
  if (!client || client.redirect_uri !== redirect_uri) {
    return res.status(400).json({ error: 'invalid_client' });
  }
  
  // 渲染授权页面
  res.render('authorize', {
    client_id,
    scope,
    state
  });
});

// 用户授权
app.post('/oauth/authorize', (req, res) => {
  const {
    client_id,
    redirect_uri,
    scope,
    state,
    code_challenge,
    user_id  // 来自session
  } = req.body;
  
  // 生成授权码
  const authCode = crypto.randomBytes(32).toString('hex');
  
  // 存储授权码
  authCodes.set(authCode, {
    client_id,
    redirect_uri,
    scope,
    user_id,
    code_challenge,
    expires_at: Date.now() + 10 * 60 * 1000  // 10分钟
  });
  
  // 重定向回客户端
  const callbackUrl = new URL(redirect_uri);
  callbackUrl.searchParams.set('code', authCode);
  callbackUrl.searchParams.set('state', state);
  
  res.redirect(callbackUrl.toString());
});

// 令牌端点
app.post('/oauth/token', async (req, res) => {
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    code_verifier,
    refresh_token
  } = req.body;
  
  if (grant_type === 'authorization_code') {
    // 验证授权码
    const authData = authCodes.get(code);
    
    if (!authData || authData.expires_at < Date.now()) {
      return res.status(400).json({ error: 'invalid_grant' });
    }
    
    // 验证客户端
    if (authData.client_id !== client_id) {
      return res.status(400).json({ error: 'invalid_client' });
    }
    
    // 验证PKCE
    if (authData.code_challenge) {
      const computedChallenge = crypto
        .createHash('sha256')
        .update(code_verifier)
        .digest('base64url');
      
      if (computedChallenge !== authData.code_challenge) {
        return res.status(400).json({ error: 'invalid_grant' });
      }
    }
    
    // 删除已使用的授权码
    authCodes.delete(code);
    
    // 生成访问令牌和刷新令牌
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    tokens.set(accessToken, {
      user_id: authData.user_id,
      scope: authData.scope,
      expires_at: Date.now() + 60 * 60 * 1000  // 1小时
    });
    
    tokens.set(refreshToken, {
      user_id: authData.user_id,
      scope: authData.scope,
      type: 'refresh'
    });
    
    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authData.scope
    });
  } 
  else if (grant_type === 'refresh_token') {
    // 刷新令牌逻辑
    const tokenData = tokens.get(refresh_token);
    
    if (!tokenData || tokenData.type !== 'refresh') {
      return res.status(400).json({ error: 'invalid_grant' });
    }
    
    // 生成新的访问令牌
    const newAccessToken = crypto.randomBytes(32).toString('hex');
    
    tokens.set(newAccessToken, {
      user_id: tokenData.user_id,
      scope: tokenData.scope,
      expires_at: Date.now() + 60 * 60 * 1000
    });
    
    res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: 3600
    });
  }
});
```

### 4.2 资源服务器

```typescript
// resource-server.ts
import express from 'express';

const app = express();

// 验证访问令牌中间件
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  
  const token = authHeader.substring(7);
  
  // 验证令牌(实际应调用授权服务器或查数据库)
  const tokenData = tokens.get(token);
  
  if (!tokenData || tokenData.expires_at < Date.now()) {
    return res.status(401).json({ error: 'invalid_token' });
  }
  
  req.user_id = tokenData.user_id;
  req.scope = tokenData.scope;
  next();
}

// 受保护的资源
app.get('/api/user', authenticate, async (req, res) => {
  const user = await getUserById(req.user_id);
  res.json(user);
});

app.get('/api/emails', authenticate, async (req, res) => {
  // 检查scope
  if (!req.scope.includes('read_email')) {
    return res.status(403).json({ error: 'insufficient_scope' });
  }
  
  const emails = await getUserEmails(req.user_id);
  res.json(emails);
});
```

## 5. 客户端实现

### 5.1 授权流程实现

```typescript
// oauth-client.ts
export class OAuthClient {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private authorizationUrl: string;
  private tokenUrl: string;
  
  constructor(config: OAuthConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.authorizationUrl = config.authorizationUrl;
    this.tokenUrl = config.tokenUrl;
  }
  
  // 获取授权URL
  getAuthorizationUrl(scope: string[]): string {
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scope.join(' '),
      state
    });
    
    return `${this.authorizationUrl}?${params}`;
  }
  
  // 处理回调
  async handleCallback(callbackUrl: string): Promise<TokenResponse> {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    // 验证state
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }
    
    // 交换令牌
    return this.exchangeCodeForToken(code!);
  }
  
  // 用授权码换取令牌
  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });
    
    if (!response.ok) {
      throw new Error('Token exchange failed');
    }
    
    return response.json();
  }
  
  // 刷新令牌
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      })
    });
    
    return response.json();
  }
}
```

### 5.2 React 集成

```tsx
// OAuthProvider.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { OAuthClient } from './oauth-client';

interface OAuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (scope: string[]) => void;
  logout: () => void;
}

const OAuthContext = createContext<OAuthContextType | undefined>(undefined);

export function OAuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  
  const oauthClient = new OAuthClient({
    clientId: process.env.REACT_APP_CLIENT_ID!,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET!,
    redirectUri: process.env.REACT_APP_REDIRECT_URI!,
    authorizationUrl: 'https://auth.example.com/oauth/authorize',
    tokenUrl: 'https://auth.example.com/oauth/token'
  });
  
  const login = (scope: string[]) => {
    const authUrl = oauthClient.getAuthorizationUrl(scope);
    window.location.href = authUrl;
  };
  
  const handleCallback = async () => {
    try {
      const tokens = await oauthClient.handleCallback(window.location.href);
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      
      // 清理URL参数
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error) {
      console.error('OAuth callback failed:', error);
    }
  };
  
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };
  
  // 检查URL是否有回调参数
  useEffect(() => {
    if (window.location.search.includes('code=')) {
      handleCallback();
    }
  }, []);
  
  return (
    <OAuthContext.Provider value={{
      isAuthenticated: !!accessToken,
      accessToken,
      login,
      logout
    }}>
      {children}
    </OAuthContext.Provider>
  );
}

export function useOAuth() {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error('useOAuth must be used within OAuthProvider');
  }
  return context;
}
```

```tsx
// LoginButton.tsx
import { useOAuth } from './OAuthProvider';

export function LoginButton() {
  const { isAuthenticated, login, logout, accessToken } = useOAuth();
  
  const handleLogin = () => {
    login(['read_user', 'read_email']);
  };
  
  if (isAuthenticated) {
    return (
      <div>
        <p>已登录</p>
        <button onClick={logout}>登出</button>
      </div>
    );
  }
  
  return (
    <button onClick={handleLogin}>
      使用OAuth登录
    </button>
  );
}
```

## 6. 安全最佳实践

### 6.1 防止CSRF攻击

```typescript
// 使用state参数
const state = crypto.randomUUID();
sessionStorage.setItem('oauth_state', state);

const authUrl = `${authorizationUrl}?
  response_type=code&
  client_id=${clientId}&
  state=${state}`;

// 回调时验证
const callbackState = url.searchParams.get('state');
const savedState = sessionStorage.getItem('oauth_state');

if (callbackState !== savedState) {
  throw new Error('CSRF attack detected');
}
```

### 6.2 使用HTTPS

```typescript
// 确保所有OAuth流程使用HTTPS
if (window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
  window.location.href = window.location.href.replace('http:', 'https:');
}
```

### 6.3 令牌安全存储

```typescript
// ❌ 不安全
localStorage.setItem('access_token', token);

// ✅ 安全方案1: HttpOnly Cookie(服务器设置)
res.cookie('oauth_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// ✅ 安全方案2: 内存存储
class TokenStore {
  private accessToken: string | null = null;
  
  setToken(token: string) {
    this.accessToken = token;
  }
  
  getToken() {
    return this.accessToken;
  }
}
```

### 6.4 Scope最小化

```typescript
// ❌ 请求过多权限
login(['read_user', 'write_user', 'admin', 'delete_all']);

// ✅ 只请求必要权限
login(['read_user', 'read_email']);
```

## 7. 错误处理

```typescript
// OAuth错误类型
enum OAuthError {
  InvalidRequest = 'invalid_request',
  UnauthorizedClient = 'unauthorized_client',
  AccessDenied = 'access_denied',
  UnsupportedResponseType = 'unsupported_response_type',
  InvalidScope = 'invalid_scope',
  ServerError = 'server_error',
  TemporarilyUnavailable = 'temporarily_unavailable'
}

// 处理OAuth错误
async function handleOAuthError(error: any) {
  const errorCode = error.response?.data?.error;
  
  switch (errorCode) {
    case OAuthError.AccessDenied:
      // 用户拒绝授权
      showMessage('您拒绝了授权请求');
      break;
    
    case OAuthError.InvalidScope:
      // 无效的权限范围
      showMessage('请求的权限无效');
      break;
    
    case OAuthError.ServerError:
      // 服务器错误
      showMessage('授权服务器错误,请稍后重试');
      break;
    
    default:
      showMessage('授权失败');
  }
}
```

## 8. 常见OAuth提供商集成

### 8.1 Google OAuth

```typescript
const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/google/callback',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
};

// 请求Google用户信息
async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch(googleOAuthConfig.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return response.json();
}
```

### 8.2 GitHub OAuth

```typescript
const githubOAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/github/callback',
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userInfoUrl: 'https://api.github.com/user'
};
```

### 8.3 Facebook OAuth

```typescript
const facebookOAuthConfig = {
  clientId: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  redirectUri: 'http://localhost:3000/auth/facebook/callback',
  authorizationUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
  userInfoUrl: 'https://graph.facebook.com/me'
};
```

## 9. 测试

```typescript
// oauth.test.ts
describe('OAuth Flow', () => {
  it('should generate correct authorization URL', () => {
    const client = new OAuthClient(config);
    const url = client.getAuthorizationUrl(['read_user']);
    
    expect(url).toContain('response_type=code');
    expect(url).toContain(`client_id=${config.clientId}`);
    expect(url).toContain('scope=read_user');
  });
  
  it('should exchange code for token', async () => {
    const client = new OAuthClient(config);
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'test_token',
          refresh_token: 'refresh_token'
        })
      } as Response)
    );
    
    const tokens = await client.exchangeCodeForToken('test_code');
    
    expect(tokens.access_token).toBe('test_token');
  });
});
```

## 10. 总结

OAuth 2.0的关键要点:

1. **选择正确的授权模式**: 大多数情况使用授权码模式
2. **使用PKCE**: 增强移动和SPA的安全性
3. **状态参数**: 防止CSRF攻击
4. **HTTPS**: 所有OAuth流程必须使用HTTPS
5. **最小权限**: 只请求必要的scope
6. **安全存储**: 妥善保管令牌
7. **刷新令牌**: 实现无感刷新机制

通过正确实施OAuth 2.0,可以安全地集成第三方登录和授权功能。

