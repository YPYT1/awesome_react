# 内容安全策略 (CSP) - Web 安全防护核心机制

## 1. CSP 简介

### 1.1 什么是 CSP

内容安全策略（Content Security Policy，CSP）是一个额外的安全层,用于检测并削弱某些特定类型的攻击,包括跨站脚本（XSS）和数据注入攻击。CSP 通过指定浏览器应该加载哪些内容来源来工作。

**核心功能：**

- **XSS 防护**：阻止未授权的脚本执行
- **数据注入防护**：防止恶意内容注入
- **点击劫持防护**：控制页面嵌入
- **协议降级防护**：强制使用 HTTPS
- **内容来源控制**：限制资源加载来源

### 1.2 CSP 工作原理

```
客户端请求 → 服务器响应(包含CSP头) → 浏览器解析CSP → 
按策略加载资源 → 阻止违规内容 → 报告违规(可选)
```

### 1.3 CSP 的优势

**安全性：**
- 大幅降低 XSS 攻击风险
- 防止未授权资源加载
- 提供违规报告机制

**控制力：**
- 精确控制资源来源
- 灵活的策略配置
- 支持渐进式部署

## 2. CSP 指令详解

### 2.1 获取指令（Fetch Directives）

#### default-src

```http
# 为所有资源设置默认策略
Content-Security-Policy: default-src 'self'

# 允许同源和特定CDN
Content-Security-Policy: default-src 'self' https://cdn.example.com
```

#### script-src

```http
# 只允许同源脚本
Content-Security-Policy: script-src 'self'

# 允许内联脚本(不安全)
Content-Security-Policy: script-src 'self' 'unsafe-inline'

# 允许eval(不安全)
Content-Security-Policy: script-src 'self' 'unsafe-eval'

# 使用nonce
Content-Security-Policy: script-src 'self' 'nonce-{random}'

# 使用哈希
Content-Security-Policy: script-src 'self' 'sha256-{hash}'

# 允许特定域名
Content-Security-Policy: script-src 'self' https://trusted.cdn.com
```

#### style-src

```http
# 只允许同源样式
Content-Security-Policy: style-src 'self'

# 允许内联样式
Content-Security-Policy: style-src 'self' 'unsafe-inline'

# 允许Google Fonts
Content-Security-Policy: style-src 'self' https://fonts.googleapis.com
```

#### img-src

```http
# 只允许同源图片
Content-Security-Policy: img-src 'self'

# 允许data: URL
Content-Security-Policy: img-src 'self' data:

# 允许所有HTTPS图片
Content-Security-Policy: img-src 'self' https:

# 允许blob: URL
Content-Security-Policy: img-src 'self' blob:
```

#### font-src

```http
# 只允许同源字体
Content-Security-Policy: font-src 'self'

# 允许Google Fonts
Content-Security-Policy: font-src 'self' https://fonts.gstatic.com
```

#### connect-src

```http
# 限制fetch、XHR、WebSocket连接
Content-Security-Policy: connect-src 'self'

# 允许API域名
Content-Security-Policy: connect-src 'self' https://api.example.com

# 允许WebSocket
Content-Security-Policy: connect-src 'self' wss://websocket.example.com
```

#### media-src

```http
# 限制音视频来源
Content-Security-Policy: media-src 'self'

# 允许CDN
Content-Security-Policy: media-src 'self' https://media.cdn.com
```

#### object-src

```http
# 禁止<object>、<embed>、<applet>
Content-Security-Policy: object-src 'none'
```

#### frame-src

```http
# 禁止iframe
Content-Security-Policy: frame-src 'none'

# 只允许同源iframe
Content-Security-Policy: frame-src 'self'

# 允许特定域名
Content-Security-Policy: frame-src https://trusted.com
```

#### worker-src

```http
# 限制Web Worker来源
Content-Security-Policy: worker-src 'self'

# 允许blob: Worker
Content-Security-Policy: worker-src 'self' blob:
```

### 2.2 文档指令（Document Directives）

#### base-uri

```http
# 限制<base>标签
Content-Security-Policy: base-uri 'self'

# 禁止<base>标签
Content-Security-Policy: base-uri 'none'
```

#### frame-ancestors

```http
# 禁止被iframe嵌入(防止点击劫持)
Content-Security-Policy: frame-ancestors 'none'

# 只允许同源嵌入
Content-Security-Policy: frame-ancestors 'self'

# 允许特定域名嵌入
Content-Security-Policy: frame-ancestors https://trusted.com
```

#### form-action

```http
# 限制表单提交目标
Content-Security-Policy: form-action 'self'

# 允许特定域名
Content-Security-Policy: form-action 'self' https://payment.example.com
```

### 2.3 其他指令

#### upgrade-insecure-requests

```http
# 自动将HTTP升级为HTTPS
Content-Security-Policy: upgrade-insecure-requests
```

#### block-all-mixed-content

```http
# 阻止所有混合内容
Content-Security-Policy: block-all-mixed-content
```

#### require-trusted-types-for

```http
# 要求使用Trusted Types
Content-Security-Policy: require-trusted-types-for 'script'
```

## 3. CSP 实现方式

### 3.1 HTTP 响应头（推荐）

```typescript
// Express.js
import express from 'express';

const app = express();

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://trusted.cdn.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  next();
});
```

```typescript
// Next.js (next.config.js)
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data:",
              "font-src 'self'",
              "connect-src 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

```nginx
# Nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' 'unsafe-inline';" always;
```

### 3.2 Meta 标签

```html
<!-- 不推荐：功能受限 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' https://trusted.cdn.com">
```

### 3.3 Report-Only 模式

```typescript
// 仅报告，不阻止
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; report-uri /csp-report"
  );
  next();
});
```

## 4. Nonce 和 Hash

### 4.1 使用 Nonce

```typescript
// server.ts
import crypto from 'crypto';
import express from 'express';

const app = express();

app.use((req, res, next) => {
  // 生成随机nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}'; ` +
    `style-src 'self' 'nonce-${nonce}';`
  );
  
  next();
});

app.get('/', (req, res) => {
  const nonce = res.locals.nonce;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script nonce="${nonce}">
        console.log('Allowed script');
      </script>
      <style nonce="${nonce}">
        body { color: blue; }
      </style>
    </head>
    <body>
      <h1>CSP with Nonce</h1>
    </body>
    </html>
  `);
});
```

```tsx
// React + Next.js
import { headers } from 'next/headers';
import Script from 'next/script';

export default function Page() {
  const nonce = headers().get('x-nonce');
  
  return (
    <>
      <Script
        src="/my-script.js"
        strategy="afterInteractive"
        nonce={nonce || ''}
      />
      <div>Content</div>
    </>
  );
}
```

### 4.2 使用 Hash

```typescript
// 计算脚本哈希
import crypto from 'crypto';

const script = "console.log('Hello');";
const hash = crypto
  .createHash('sha256')
  .update(script)
  .digest('base64');

console.log(hash); // 用于CSP

// CSP配置
const csp = `script-src 'self' 'sha256-${hash}'`;
```

```html
<!-- HTML中使用 -->
<!DOCTYPE html>
<html>
<head>
  <script>console.log('Hello');</script>
</head>
</html>
```

```http
# HTTP响应头
Content-Security-Policy: script-src 'self' 'sha256-xyz123...'
```

## 5. CSP 报告

### 5.1 配置报告端点

```typescript
// Express
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://trusted.cdn.com",
      "report-uri /csp-report",
      "report-to csp-endpoint"
    ].join('; ')
  );
  
  // Report-To header (新标准)
  res.setHeader('Report-To', JSON.stringify({
    group: 'csp-endpoint',
    max_age: 10886400,
    endpoints: [
      {
        url: 'https://example.com/csp-report'
      }
    ],
    include_subdomains: true
  }));
  
  next();
});
```

### 5.2 接收和处理报告

```typescript
// 接收CSP违规报告
app.post(
  '/csp-report',
  express.json({ type: 'application/csp-report' }),
  (req, res) => {
    const report = req.body;
    
    console.log('CSP Violation Report:');
    console.log(JSON.stringify(report, null, 2));
    
    // 报告结构
    const violation = report['csp-report'];
    console.log({
      documentUri: violation['document-uri'],
      violatedDirective: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      columnNumber: violation['column-number']
    });
    
    // 存储到数据库
    saveCSPReport(violation);
    
    // 发送告警
    if (isSerious(violation)) {
      sendAlert(violation);
    }
    
    res.status(204).send();
  }
);
```

### 5.3 报告示例

```json
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "referrer": "",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self'",
    "blocked-uri": "https://evil.com/malicious.js",
    "status-code": 200,
    "source-file": "https://example.com/page",
    "line-number": 23,
    "column-number": 15
  }
}
```

## 6. 实战配置

### 6.1 React SPA 配置

```typescript
// server.ts
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",  // React需要内联脚本
    "'unsafe-eval'",    // 开发环境需要
    'https://cdn.jsdelivr.net'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",  // styled-components需要
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.example.com',
    'wss://websocket.example.com'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

const csp = Object.entries(cspDirectives)
  .map(([key, values]) => `${key} ${values.join(' ')}`)
  .join('; ');

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', csp);
  next();
});
```

### 6.2 Next.js 配置

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

### 6.3 生产环境严格配置

```typescript
const productionCSP = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'sha256-abc123...'",  // 使用哈希
    'https://trusted.cdn.com'
  ],
  'style-src': [
    "'self'",
    "'sha256-def456...'"   // 使用哈希
  ],
  'img-src': [
    "'self'",
    'https://images.example.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.example.com'
  ],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
  'block-all-mixed-content': [],
  'require-trusted-types-for': ["'script'"]
};
```

## 7. 常见问题和解决方案

### 7.1 第三方脚本

```typescript
// 问题：需要加载Google Analytics
const csp = {
  'script-src': [
    "'self'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
  ],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com'
  ],
  'img-src': [
    "'self'",
    'https://www.google-analytics.com'
  ]
};
```

### 7.2 内联样式

```typescript
// 问题：styled-components需要内联样式

// 方法1：使用unsafe-inline(不推荐)
'style-src': ["'self'", "'unsafe-inline'"]

// 方法2：使用nonce
const nonce = generateNonce();
'style-src': [`'self'`, `'nonce-${nonce}'`]

// 在styled-components中使用
const StyledComponent = styled.div.attrs({
  style: { nonce }
})`
  color: blue;
`;
```

### 7.3 开发环境vs生产环境

```typescript
const getCSP = (env: string) => {
  const base = {
    'default-src': ["'self'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https://fonts.gstatic.com']
  };
  
  if (env === 'development') {
    return {
      ...base,
      'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"]
    };
  }
  
  return {
    ...base,
    'script-src': ["'self'", "'sha256-abc...'"],
    'style-src': ["'self'", "'sha256-def...'"]
  };
};
```

### 7.4 WebSocket连接

```typescript
const csp = {
  'connect-src': [
    "'self'",
    'wss://websocket.example.com',
    'https://api.example.com'
  ]
};
```

## 8. CSP 最佳实践

### 8.1 渐进式部署

```typescript
// 阶段1：Report-Only模式
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    csp + '; report-uri /csp-report'
  );
  next();
});

// 阶段2：收集报告，调整策略

// 阶段3：启用强制模式
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', csp);
  next();
});
```

### 8.2 安全等级

```typescript
// Level 1: 基础保护
const level1CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'";

// Level 2: 中等保护
const level2CSP = "default-src 'self'; script-src 'self' https://trusted.cdn.com";

// Level 3: 严格保护
const level3CSP = "default-src 'self'; script-src 'self' 'nonce-xxx'; style-src 'self' 'nonce-xxx'";

// Level 4: 最严格(Strict CSP)
const level4CSP = "default-src 'none'; script-src 'strict-dynamic' 'nonce-xxx'; style-src 'nonce-xxx'";
```

### 8.3 监控和维护

```typescript
// 定期审查CSP报告
async function analyzeCSPReports() {
  const reports = await getCSPReportsFromDB();
  
  // 统计违规类型
  const violations = reports.reduce((acc, report) => {
    const directive = report['violated-directive'];
    acc[directive] = (acc[directive] || 0) + 1;
    return acc;
  }, {});
  
  // 识别模式
  const patterns = identifyPatterns(reports);
  
  // 生成建议
  const suggestions = generateSuggestions(violations, patterns);
  
  return { violations, patterns, suggestions };
}

// 自动更新CSP
async function updateCSP() {
  const analysis = await analyzeCSPReports();
  
  if (analysis.suggestions.length > 0) {
    const newCSP = applysuggestions(currentCSP, analysis.suggestions);
    deployNewCSP(newCSP);
  }
}
```

## 9. 工具和资源

### 9.1 在线工具

```bash
# CSP评估器
https://csp-evaluator.withgoogle.com

# CSP生成器
https://report-uri.com/home/generate

# CSP测试
https://cspvalidator.org
```

### 9.2 浏览器扩展

- CSP Evaluator
- Security Headers
- Observatory by Mozilla

### 9.3 NPM包

```bash
# Helmet - 设置安全headers
npm install helmet

# CSP报告收集
npm install csp-report

# CSP哈希生成
npm install csp-hash-generator
```

## 10. 总结

CSP的关键要点：

1. **从严格开始**：使用最严格的策略，逐步放宽
2. **使用nonce或hash**：避免unsafe-inline和unsafe-eval
3. **启用报告**：监控违规行为
4. **渐进式部署**：先用Report-Only模式
5. **持续优化**：根据报告调整策略

通过正确实施CSP，可以大幅提升Web应用的安全性，有效防止XSS和数据注入攻击。

