# Robots.txt配置 - 爬虫控制完整指南

## 1. Robots.txt概述

### 1.1 什么是Robots.txt

Robots.txt是放置在网站根目录的文本文件,用于告诉搜索引擎爬虫哪些页面可以访问,哪些不可以。

**核心作用:**
- **控制爬取**: 指定允许/禁止爬取的路径
- **节省资源**: 避免爬取无价值页面
- **保护隐私**: 阻止敏感页面被索引
- **指定Sitemap**: 告知爬虫sitemap位置

**访问地址:**
```
https://example.com/robots.txt
```

### 1.2 基本语法

```txt
# 注释
User-agent: *           # 适用于所有爬虫
Disallow: /admin/       # 禁止访问/admin/目录
Allow: /admin/public/   # 允许访问/admin/public/
Sitemap: https://example.com/sitemap.xml  # sitemap位置
Crawl-delay: 10         # 爬取延迟(秒)
```

### 1.3 重要概念

```typescript
// User-agent: 指定规则适用的爬虫
const commonUserAgents = {
  all: '*',                    // 所有爬虫
  google: 'Googlebot',         // Google爬虫
  googleImage: 'Googlebot-Image',
  bing: 'Bingbot',            // Bing爬虫
  baidu: 'Baiduspider',       // 百度爬虫
  yandex: 'Yandex',           // Yandex爬虫
  facebook: 'facebookexternalhit'
};

// Disallow: 禁止爬取的路径
// Allow: 允许爬取的路径(优先级高于Disallow)
// Sitemap: sitemap文件位置
// Crawl-delay: 请求间隔时间
```

## 2. 基础配置

### 2.1 简单Robots.txt

```txt
# robots.txt

# 允许所有爬虫访问所有内容
User-agent: *
Allow: /

# Sitemap位置
Sitemap: https://example.com/sitemap.xml
```

### 2.2 标准配置

```txt
# robots.txt

# 所有爬虫的规则
User-agent: *
Disallow: /admin/          # 禁止管理后台
Disallow: /api/            # 禁止API接口
Disallow: /private/        # 禁止私密内容
Disallow: /*.json$         # 禁止JSON文件
Disallow: /*?*             # 禁止带参数的URL
Allow: /api/public/        # 允许公开API

# Google爬虫特定规则
User-agent: Googlebot
Crawl-delay: 1

# 百度爬虫特定规则
User-agent: Baiduspider
Crawl-delay: 2

# Sitemap
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
Sitemap: https://example.com/sitemap-image.xml
```

### 2.3 Next.js实现

```typescript
// pages/robots.txt.ts
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotsTxt = `# robots.txt
User-agent: *
Allow: /

# Disallow admin and API routes
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/sitemap-news.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return {
    props: {}
  };
};

export default function Robots() {
  return null;
}
```

## 3. 高级配置

### 3.1 多环境配置

```typescript
// lib/robots.ts
interface RobotsConfig {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

function generateRobotsTxt(
  configs: RobotsConfig[],
  sitemaps: string[] = []
): string {
  const rules = configs.map(config => {
    const lines = [`User-agent: ${config.userAgent}`];
    
    if (config.allow) {
      config.allow.forEach(path => {
        lines.push(`Allow: ${path}`);
      });
    }
    
    if (config.disallow) {
      config.disallow.forEach(path => {
        lines.push(`Disallow: ${path}`);
      });
    }
    
    if (config.crawlDelay) {
      lines.push(`Crawl-delay: ${config.crawlDelay}`);
    }
    
    return lines.join('\n');
  }).join('\n\n');
  
  const sitemapLines = sitemaps.map(url => `Sitemap: ${url}`).join('\n');
  
  return `${rules}\n\n${sitemapLines}`;
}

// 生产环境
const productionConfig: RobotsConfig[] = [
  {
    userAgent: '*',
    allow: ['/'],
    disallow: ['/admin/', '/api/', '/private/']
  },
  {
    userAgent: 'Googlebot',
    crawlDelay: 1
  }
];

// 开发/测试环境 - 阻止所有爬虫
const developmentConfig: RobotsConfig[] = [
  {
    userAgent: '*',
    disallow: ['/']
  }
];

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  
  const config = isProduction ? productionConfig : developmentConfig;
  const sitemaps = isProduction ? [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap-news.xml`
  ] : [];
  
  const robotsTxt = generateRobotsTxt(config, sitemaps);
  
  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();
  
  return { props: {} };
};
```

### 3.2 动态规则生成

```typescript
// pages/robots.txt.ts
import { GetServerSideProps } from 'next';

interface DynamicRule {
  pattern: string;
  shouldBlock: (request: any) => boolean;
}

const dynamicRules: DynamicRule[] = [
  {
    pattern: '/user/*',
    shouldBlock: (req) => {
      // 根据请求判断是否阻止
      return req.headers['user-agent']?.includes('BadBot');
    }
  }
];

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  
  // 基础规则
  let disallowPaths = [
    '/admin/',
    '/api/',
    '/_next/',
    '/private/'
  ];
  
  // 动态添加规则
  dynamicRules.forEach(rule => {
    if (rule.shouldBlock(req)) {
      disallowPaths.push(rule.pattern);
    }
  });
  
  const robotsTxt = `# robots.txt
User-agent: *
Allow: /
${disallowPaths.map(path => `Disallow: ${path}`).join('\n')}

Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return { props: {} };
};
```

## 4. 特定爬虫配置

### 4.1 主流搜索引擎

```txt
# Google
User-agent: Googlebot
Crawl-delay: 1
Disallow: /search
Allow: /

User-agent: Googlebot-Image
Disallow: /private-images/
Allow: /images/

# Bing
User-agent: Bingbot
Crawl-delay: 2
Disallow: /admin/
Allow: /

# 百度
User-agent: Baiduspider
Crawl-delay: 3
Disallow: /admin/
Allow: /

# Yandex
User-agent: Yandex
Crawl-delay: 2
Disallow: /private/
Allow: /

# DuckDuckGo
User-agent: DuckDuckBot
Disallow: /admin/
Allow: /
```

### 4.2 社交媒体爬虫

```txt
# Facebook
User-agent: facebookexternalhit
Disallow: /private/
Allow: /

# Twitter
User-agent: Twitterbot
Disallow: /private/
Allow: /

# LinkedIn
User-agent: LinkedInBot
Disallow: /private/
Allow: /

# Pinterest
User-agent: Pinterestbot
Disallow: /private/
Allow: /
```

### 4.3 阻止恶意爬虫

```txt
# 阻止已知的恶意爬虫
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# 阻止所有未列出的爬虫
User-agent: *
Crawl-delay: 10
```

## 5. 路径模式

### 5.1 基本模式

```txt
# 精确路径
Disallow: /admin.html

# 目录及其下所有内容
Disallow: /admin/

# 以某个字符串开头的所有路径
Disallow: /admin

# 所有路径
Disallow: /

# 特定文件类型
Disallow: /*.pdf$
Disallow: /*.json$
Disallow: /*.xml$

# 包含特定字符串的路径
Disallow: /*?sessionid=
Disallow: /*?ref=
```

### 5.2 通配符使用

```txt
# * 匹配0个或多个字符
Disallow: /admin*         # 阻止 /admin, /admin/, /admin.html 等
Disallow: /*.pdf          # 阻止所有PDF文件

# $ 表示URL结尾
Disallow: /*.pdf$         # 只阻止以.pdf结尾的URL
Disallow: /*/private$     # 阻止以/private结尾的路径

# 组合使用
Disallow: /*/temp/*       # 阻止任意目录下的temp子目录
Disallow: /*?sort=*       # 阻止包含sort参数的URL
```

### 5.3 Allow优先级

```txt
# Allow优先于Disallow
User-agent: *
Disallow: /admin/
Allow: /admin/public/     # 允许访问/admin/public/

Disallow: /api/
Allow: /api/v1/public/    # 允许访问/api/v1/public/

Disallow: /*.json$
Allow: /data/public/*.json$  # 允许访问特定JSON
```

## 6. 完整配置示例

### 6.1 电商网站

```txt
# robots.txt - E-commerce Site

# 所有爬虫
User-agent: *
Allow: /

# 禁止访问
Disallow: /admin/
Disallow: /checkout/
Disallow: /cart/
Disallow: /account/
Disallow: /api/
Disallow: /*?sort=*
Disallow: /*?filter=*
Disallow: /*?page=*
Disallow: /search?q=*

# 允许访问
Allow: /api/public/
Allow: /products/
Allow: /categories/

# Google购物爬虫
User-agent: Googlebot
Crawl-delay: 1
Allow: /products/
Allow: /categories/

# 搜索引擎图片爬虫
User-agent: Googlebot-Image
User-agent: Bingbot-Image
Allow: /images/products/
Disallow: /images/users/

# Sitemap
Sitemap: https://shop.example.com/sitemap.xml
Sitemap: https://shop.example.com/sitemap-products.xml
Sitemap: https://shop.example.com/sitemap-categories.xml
```

### 6.2 博客/新闻网站

```txt
# robots.txt - Blog/News Site

# 所有爬虫
User-agent: *
Allow: /

# 禁止访问
Disallow: /admin/
Disallow: /author/private/
Disallow: /draft/
Disallow: /preview/
Disallow: /*?utm_*
Disallow: /*?ref=*

# Google新闻
User-agent: Googlebot-News
Allow: /news/
Allow: /articles/
Crawl-delay: 1

# 一般爬虫
User-agent: Googlebot
User-agent: Bingbot
Crawl-delay: 2

# Sitemap
Sitemap: https://blog.example.com/sitemap.xml
Sitemap: https://blog.example.com/sitemap-news.xml
Sitemap: https://blog.example.com/sitemap-posts.xml
Sitemap: https://blog.example.com/sitemap-authors.xml
```

### 6.3 SaaS应用

```txt
# robots.txt - SaaS Application

# 开发/测试环境 - 阻止所有
User-agent: *
Disallow: /

# 生产环境配置
# User-agent: *
# Allow: /
# Disallow: /app/
# Disallow: /dashboard/
# Disallow: /api/
# Disallow: /auth/
# Disallow: /account/
# Allow: /blog/
# Allow: /docs/
# Allow: /pricing/
# 
# Sitemap: https://saas.example.com/sitemap.xml
```

## 7. 配置工具与验证

### 7.1 生成器函数

```typescript
// lib/robots-generator.ts
interface RobotsOptions {
  userAgent?: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
  sitemaps?: string[];
  host?: string;
}

export class RobotsGenerator {
  private rules: RobotsOptions[] = [];
  
  addRule(options: RobotsOptions) {
    this.rules.push(options);
    return this;
  }
  
  generate(): string {
    const lines: string[] = [];
    
    this.rules.forEach(rule => {
      lines.push(`User-agent: ${rule.userAgent || '*'}`);
      
      if (rule.allow) {
        rule.allow.forEach(path => {
          lines.push(`Allow: ${path}`);
        });
      }
      
      if (rule.disallow) {
        rule.disallow.forEach(path => {
          lines.push(`Disallow: ${path}`);
        });
      }
      
      if (rule.crawlDelay) {
        lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      }
      
      if (rule.host) {
        lines.push(`Host: ${rule.host}`);
      }
      
      if (rule.sitemaps) {
        rule.sitemaps.forEach(sitemap => {
          lines.push(`Sitemap: ${sitemap}`);
        });
      }
      
      lines.push(''); // 空行分隔
    });
    
    return lines.join('\n');
  }
}

// 使用示例
const generator = new RobotsGenerator()
  .addRule({
    userAgent: '*',
    allow: ['/'],
    disallow: ['/admin/', '/api/']
  })
  .addRule({
    userAgent: 'Googlebot',
    crawlDelay: 1,
    sitemaps: ['https://example.com/sitemap.xml']
  });

const robotsTxt = generator.generate();
```

### 7.2 验证函数

```typescript
// lib/robots-validator.ts
export function validateRobotsTxt(robotsTxt: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const lines = robotsTxt.split('\n');
  let currentUserAgent = '';
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const [directive, ...valueParts] = trimmed.split(':');
    const value = valueParts.join(':').trim();
    
    switch (directive.toLowerCase()) {
      case 'user-agent':
        if (!value) {
          errors.push(`Line ${index + 1}: User-agent requires a value`);
        }
        currentUserAgent = value;
        break;
        
      case 'disallow':
      case 'allow':
        if (!currentUserAgent) {
          errors.push(`Line ${index + 1}: ${directive} must follow User-agent`);
        }
        if (value && !value.startsWith('/')) {
          warnings.push(`Line ${index + 1}: ${directive} path should start with /`);
        }
        break;
        
      case 'sitemap':
        if (!value) {
          errors.push(`Line ${index + 1}: Sitemap requires a URL`);
        } else if (!value.startsWith('http')) {
          errors.push(`Line ${index + 1}: Sitemap must be a full URL`);
        }
        break;
        
      case 'crawl-delay':
        if (!value || isNaN(Number(value))) {
          errors.push(`Line ${index + 1}: Crawl-delay must be a number`);
        }
        break;
        
      default:
        warnings.push(`Line ${index + 1}: Unknown directive '${directive}'`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// 使用
const validation = validateRobotsTxt(robotsTxt);
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

### 7.3 测试工具

```typescript
// lib/robots-tester.ts
export function testRobotsRule(
  robotsTxt: string,
  url: string,
  userAgent: string = '*'
): { allowed: boolean; matchedRule?: string } {
  const lines = robotsTxt.split('\n');
  let currentAgent = '';
  let allowed = true;
  let matchedRule = '';
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    if (trimmed.startsWith('user-agent:')) {
      const agent = trimmed.substring(11).trim();
      currentAgent = agent === '*' || agent === userAgent.toLowerCase() ? agent : '';
    }
    
    if (!currentAgent) continue;
    
    if (trimmed.startsWith('disallow:')) {
      const pattern = trimmed.substring(9).trim();
      if (matchesPattern(url, pattern)) {
        allowed = false;
        matchedRule = line.trim();
      }
    }
    
    if (trimmed.startsWith('allow:')) {
      const pattern = trimmed.substring(6).trim();
      if (matchesPattern(url, pattern)) {
        allowed = true;
        matchedRule = line.trim();
      }
    }
  }
  
  return { allowed, matchedRule };
}

function matchesPattern(url: string, pattern: string): boolean {
  if (pattern === '/') return true;
  if (pattern === '') return true;
  
  // 转换通配符为正则
  const regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\$/, '$');
  
  return new RegExp('^' + regex).test(url);
}

// 使用
const result = testRobotsRule(robotsTxt, '/admin/users', 'Googlebot');
console.log(result.allowed ? 'Allowed' : 'Disallowed');
console.log('Matched rule:', result.matchedRule);
```

## 8. 与Meta标签配合

```tsx
// 页面级别的robots控制
import Head from 'next/head';

// 完全阻止索引
<Head>
  <meta name="robots" content="noindex, nofollow" />
</Head>

// 阻止索引但允许跟踪链接
<Head>
  <meta name="robots" content="noindex, follow" />
</Head>

// 特定爬虫控制
<Head>
  <meta name="googlebot" content="noindex" />
  <meta name="bingbot" content="index, follow" />
</Head>

// 组合使用
export default function PrivatePage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <h1>Private Content</h1>
    </>
  );
}
```

## 9. 常见错误与解决方案

```typescript
// 错误1: 阻止CSS/JS
// ❌ 错误
Disallow: /*.css
Disallow: /*.js

// ✅ 正确 - 允许CSS/JS以便正确渲染
Allow: /*.css
Allow: /*.js

// 错误2: 使用相对路径
// ❌ 错误
Sitemap: /sitemap.xml

// ✅ 正确 - 使用完整URL
Sitemap: https://example.com/sitemap.xml

// 错误3: 错误的通配符
// ❌ 错误
Disallow: admin  // 会阻止 /administrator 等

// ✅ 正确
Disallow: /admin/  // 只阻止 /admin/ 目录

// 错误4: 忘记Allow优先级
// ❌ 可能导致意外阻止
User-agent: *
Disallow: /api/
# 忘记允许公开API

// ✅ 正确
User-agent: *
Disallow: /api/
Allow: /api/public/
```

## 10. 监控与维护

### 10.1 监控爬取

```typescript
// 分析robots.txt效果
import { WebClient } from '@slack/web-api';

async function monitorRobotsTxt() {
  const response = await fetch('https://example.com/robots.txt');
  const robotsTxt = await response.text();
  
  // 验证
  const validation = validateRobotsTxt(robotsTxt);
  
  if (!validation.valid) {
    // 发送告警
    const slack = new WebClient(process.env.SLACK_TOKEN);
    await slack.chat.postMessage({
      channel: '#alerts',
      text: `Robots.txt validation failed:\n${validation.errors.join('\n')}`
    });
  }
}

// 定期检查
setInterval(monitorRobotsTxt, 3600000); // 每小时
```

### 10.2 日志分析

```typescript
// 分析被阻止的爬取请求
interface CrawlLog {
  userAgent: string;
  path: string;
  blocked: boolean;
  timestamp: Date;
}

async function analyzeCrawlLogs(logs: CrawlLog[]) {
  const blockedPaths = new Map<string, number>();
  const blockedAgents = new Map<string, number>();
  
  logs
    .filter(log => log.blocked)
    .forEach(log => {
      blockedPaths.set(log.path, (blockedPaths.get(log.path) || 0) + 1);
      blockedAgents.set(log.userAgent, (blockedAgents.get(log.userAgent) || 0) + 1);
    });
  
  console.log('Most blocked paths:', 
    Array.from(blockedPaths.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );
  
  console.log('Most blocked agents:', 
    Array.from(blockedAgents.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );
}
```

## 11. 最佳实践

```typescript
const robotsBestPractices = {
  general: [
    '使用robots.txt控制爬取,meta robots控制索引',
    '允许访问CSS/JS以便正确渲染',
    '提供sitemap位置',
    '使用完整URL指定sitemap',
    '定期验证robots.txt有效性'
  ],
  
  performance: [
    '合理设置crawl-delay',
    '避免过度限制爬虫',
    '优先使用Allow而非大范围Disallow',
    '考虑不同爬虫的crawl-delay'
  ],
  
  security: [
    '不依赖robots.txt保护敏感数据',
    '使用认证保护敏感页面',
    'robots.txt是公开的,任何人都能查看',
    '阻止恶意爬虫'
  ],
  
  seo: [
    '不要阻止重要内容',
    '允许爬虫访问结构化数据',
    '为不同搜索引擎定制规则',
    '配合meta robots使用'
  ]
};
```

## 12. 总结

Robots.txt配置的关键要点:

1. **基本规则**: 理解User-agent、Allow、Disallow语法
2. **优先级**: Allow优先于Disallow
3. **通配符**: 正确使用 * 和 $ 通配符
4. **环境区分**: 开发环境阻止所有,生产环境精细控制
5. **特定爬虫**: 为不同爬虫设置不同规则
6. **验证测试**: 使用工具验证配置正确性
7. **安全意识**: 不依赖robots.txt保护敏感数据

通过正确配置robots.txt,可以有效控制搜索引擎爬取,提升网站SEO效果。

