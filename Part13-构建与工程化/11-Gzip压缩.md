# Gzip压缩

## 课程概述

本章节深入探讨Gzip压缩技术在前端项目中的应用,学习如何通过压缩减小文件体积,提升传输效率。掌握Gzip压缩是优化Web性能的重要手段。

### 学习目标

- 理解Gzip压缩原理和优势
- 掌握构建时压缩配置
- 学习服务端压缩配置
- 了解Brotli等其他压缩算法
- 掌握压缩策略和最佳实践
- 学习压缩性能监控

## 第一部分:Gzip基础

### 1.1 什么是Gzip

Gzip是一种文件压缩算法,通过查找文件中的重复模式并用更短的符号替换,从而减小文件大小。

**压缩效果:**
```javascript
// 原始文件
app.js: 500KB

// Gzip压缩后
app.js.gz: 120KB (压缩率 76%)
```

**支持的文件类型:**
```javascript
✅ 文本文件  - HTML, CSS, JavaScript, JSON
✅ SVG      - 矢量图形
✅ XML      - 配置文件
❌ 已压缩   - JPEG, PNG, GIF, PDF (效果不佳)
```

### 1.2 压缩原理

```javascript
// 原始数据
"hello hello hello world world"

// 压缩后(简化示意)
"3×hello 2×world"
// 实际使用LZ77算法和Huffman编码
```

### 1.3 压缩级别

```javascript
Level 1 (最快) - 压缩率低,速度快
Level 6 (默认) - 平衡压缩率和速度
Level 9 (最佳) - 压缩率高,速度慢

// 示例
app.js (500KB)
├─ Level 1: 180KB (64% 压缩, 10ms)
├─ Level 6: 120KB (76% 压缩, 50ms)
└─ Level 9: 110KB (78% 压缩, 200ms)
```

## 第二部分:构建时压缩

### 2.1 Vite Gzip配置

```bash
# 安装插件
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression({
      // 压缩算法
      algorithm: 'gzip',
      
      // 生成的压缩文件扩展名
      ext: '.gz',
      
      // 压缩阈值,小于此值不压缩
      threshold: 10240, // 10KB
      
      // 是否删除原文件
      deleteOriginFile: false,
      
      // 压缩级别
      compressionOptions: {
        level: 9
      },
      
      // 禁用在开发环境
      disable: false,
      
      // 自定义过滤
      filter: /\.(js|mjs|json|css|html)$/i,
    })
  ]
})
```

**输出结果:**

```
dist/
├── assets/
│   ├── index-abc123.js          (500KB)
│   ├── index-abc123.js.gz       (120KB)
│   ├── vendor-def456.js         (800KB)
│   ├── vendor-def456.js.gz      (200KB)
│   ├── main-ghi789.css          (100KB)
│   └── main-ghi789.css.gz       (20KB)
└── index.html
```

### 2.2 Webpack Gzip配置

```bash
npm install -D compression-webpack-plugin
```

```javascript
// webpack.config.js
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    })
  ]
}
```

### 2.3 多种压缩格式

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    // Brotli 压缩
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      compressionOptions: {
        level: 11
      }
    })
  ]
})
```

**输出对比:**

```
app.js (500KB)
├── app.js.gz  (120KB) - Gzip
└── app.js.br  (95KB)  - Brotli (更好)
```

## 第三部分:服务端压缩

### 3.1 Nginx Gzip配置

```nginx
# nginx.conf
http {
    # 开启 Gzip
    gzip on;
    
    # Gzip 压缩级别 (1-9)
    gzip_comp_level 6;
    
    # 最小压缩文件大小
    gzip_min_length 1024;
    
    # 压缩的文件类型
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    
    # 为所有代理请求启用压缩
    gzip_proxied any;
    
    # 添加 Vary: Accept-Encoding 响应头
    gzip_vary on;
    
    # 禁用IE6的Gzip
    gzip_disable "msie6";
    
    # 压缩缓冲区
    gzip_buffers 16 8k;
    
    # HTTP版本
    gzip_http_version 1.1;
    
    server {
        listen 80;
        server_name example.com;
        root /var/www/html;
        
        # 静态资源
        location /static/ {
            gzip_static on;  # 使用预压缩文件
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # API不压缩
        location /api/ {
            gzip off;
            proxy_pass http://backend;
        }
    }
}
```

**Gzip静态文件:**

```nginx
# 使用预压缩的 .gz 文件
location ~* \.(js|css|html)$ {
    gzip_static on;
    
    # 尝试按顺序查找
    # 1. xxx.js.gz (如果支持gzip)
    # 2. xxx.js (原文件)
    try_files $uri$gz_ext $uri =404;
}
```

### 3.2 Express/Node.js压缩

```bash
npm install compression
```

```javascript
// server.js
const express = require('express')
const compression = require('compression')

const app = express()

// 压缩中间件
app.use(compression({
  // 压缩级别
  level: 6,
  
  // 压缩阈值
  threshold: 1024,
  
  // 自定义过滤
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))

// 静态文件
app.use(express.static('dist'))

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

**使用预压缩文件:**

```javascript
const express = require('express')
const expressStaticGzip = require('express-static-gzip')

const app = express()

app.use('/', expressStaticGzip('dist', {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  serveStatic: {
    maxAge: '1y',
    setHeaders: (res) => {
      res.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
  }
}))
```

### 3.3 Apache Gzip配置

```apache
# .htaccess
<IfModule mod_deflate.c>
    # 启用压缩
    SetOutputFilter DEFLATE
    
    # 压缩特定文件类型
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/json
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE image/svg+xml
    
    # 排除已压缩的文件
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|zip|gz|bz2)$ no-gzip
    
    # 兼容性处理
    BrowserMatch ^Mozilla/4 gzip-only-text/html
    BrowserMatch ^Mozilla/4\.0[678] no-gzip
    BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
    
    # 添加Vary头
    Header append Vary User-Agent env=!dont-vary
</IfModule>

# 预压缩文件
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # 检查是否支持Gzip
    RewriteCond %{HTTP:Accept-Encoding} gzip
    RewriteCond %{REQUEST_FILENAME}.gz -f
    RewriteRule ^(.*)$ $1.gz [L]
    
    # 设置正确的Content-Type
    <FilesMatch "\.js\.gz$">
        ForceType application/javascript
        Header set Content-Encoding gzip
    </FilesMatch>
    
    <FilesMatch "\.css\.gz$">
        ForceType text/css
        Header set Content-Encoding gzip
    </FilesMatch>
</IfModule>
```

## 第四部分:压缩优化策略

### 4.1 选择性压缩

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      
      // 只压缩特定文件
      filter: (file) => {
        // 排除已压缩的图片
        if (/\.(png|jpg|jpeg|gif|webp)$/.test(file)) {
          return false
        }
        
        // 只压缩大文件
        const stats = fs.statSync(file)
        return stats.size > 10240 // 10KB
      }
    })
  ]
})
```

### 4.2 压缩级别优化

```javascript
// 开发环境 - 快速压缩
if (process.env.NODE_ENV === 'development') {
  compressionOptions = { level: 1 }
}

// 生产环境 - 最佳压缩
if (process.env.NODE_ENV === 'production') {
  compressionOptions = { level: 9 }
}
```

### 4.3 动态vs静态压缩

**静态压缩(推荐):**

```javascript
// 构建时预压缩
优点:
- 服务器负载低
- 响应速度快
- 压缩级别高

缺点:
- 占用更多磁盘空间
- 需要构建步骤
```

**动态压缩:**

```javascript
// 运行时压缩
优点:
- 不占用额外空间
- 适合动态内容

缺点:
- 服务器CPU开销
- 响应稍慢
- 压缩级别受限
```

### 4.4 缓存压缩结果

```javascript
// 压缩缓存
const cache = new Map()

function compressWithCache(content, key) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const compressed = gzip(content)
  cache.set(key, compressed)
  
  return compressed
}
```

## 第五部分:Brotli压缩

### 5.1 Brotli vs Gzip

```javascript
// 压缩对比
文件: app.js (500KB)

Gzip (level 9):
- 压缩后: 120KB (76%)
- 压缩时间: 200ms
- 解压时间: 50ms

Brotli (level 11):
- 压缩后: 95KB (81%)  ✓ 更小
- 压缩时间: 800ms    ✗ 更慢
- 解压时间: 40ms     ✓ 更快
```

### 5.2 Vite Brotli配置

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Brotli压缩
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        }
      }
    })
  ]
})
```

### 5.3 Nginx Brotli配置

```bash
# 安装Brotli模块
# Ubuntu/Debian
apt-get install nginx-module-brotli

# 或编译时添加
./configure --add-module=/path/to/ngx_brotli
```

```nginx
# nginx.conf
http {
    # 加载Brotli模块
    load_module modules/ngx_http_brotli_filter_module.so;
    load_module modules/ngx_http_brotli_static_module.so;
    
    # Brotli配置
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        image/svg+xml;
    
    # 静态Brotli
    brotli_static on;
    
    server {
        listen 80;
        server_name example.com;
        
        location / {
            root /var/www/html;
            
            # 优先使用Brotli,其次Gzip
            brotli_static on;
            gzip_static on;
        }
    }
}
```

### 5.4 浏览器支持检测

```javascript
// 检测Brotli支持
function supportsBrotli() {
  const testString = 'accept-encoding'
  return testString.includes('br')
}

// 条件加载
if (supportsBrotli()) {
  // 请求 .br 文件
  fetch('/app.js.br')
} else {
  // 请求 .gz 文件
  fetch('/app.js.gz')
}
```

## 第六部分:监控和调试

### 6.1 压缩效果验证

```javascript
// 检查响应头
fetch('/app.js').then(res => {
  console.log('Content-Encoding:', res.headers.get('content-encoding'))
  console.log('Content-Length:', res.headers.get('content-length'))
  console.log('Original Size:', res.headers.get('x-original-size'))
})

// 输出:
// Content-Encoding: gzip
// Content-Length: 120000
// X-Original-Size: 500000
```

### 6.2 性能监控

```javascript
// src/utils/compression-monitor.ts
export function monitorCompression() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        
        if (resource.transferSize && resource.decodedBodySize) {
          const compressionRatio = 
            (1 - resource.transferSize / resource.decodedBodySize) * 100
          
          console.log({
            url: resource.name,
            original: resource.decodedBodySize,
            transferred: resource.transferSize,
            ratio: compressionRatio.toFixed(2) + '%'
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
  }
}
```

### 6.3 Chrome DevTools检查

```javascript
// 打开Chrome DevTools
1. Network面板
2. 查看Size列
   - xxx KB (实际传输大小)
   - xxx KB (解压后大小)
3. 查看Headers
   - Content-Encoding: gzip
   - Content-Length: xxx
```

### 6.4 命令行测试

```bash
# 测试Gzip压缩
curl -H "Accept-Encoding: gzip" -I https://example.com/app.js

# 查看响应头
HTTP/1.1 200 OK
Content-Type: application/javascript
Content-Encoding: gzip
Content-Length: 120000
Vary: Accept-Encoding

# 对比压缩前后大小
curl -H "Accept-Encoding: gzip" https://example.com/app.js | wc -c
# 120000

curl https://example.com/app.js | wc -c
# 500000
```

## 第七部分:最佳实践

### 7.1 压缩策略

```javascript
1. 文本文件      - 启用压缩 (JS, CSS, HTML, JSON, SVG)
2. 已压缩文件    - 禁用压缩 (JPEG, PNG, GIF, PDF, ZIP)
3. 小文件        - 不压缩 (< 1KB,压缩开销大于收益)
4. 动态内容      - 谨慎压缩 (考虑CPU开销)
5. API响应       - 选择性压缩 (JSON可压缩)
```

### 7.2 性能优化

```typescript
// 完整配置示例
// vite.config.ts
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip - 广泛支持
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      compressionOptions: { level: 9 }
    }),
    
    // Brotli - 更好的压缩率
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html|svg)$/i,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      }
    })
  ],
  
  build: {
    // 关闭内联,允许压缩
    assetsInlineLimit: 0,
    
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
```

### 7.3 部署清单

```javascript
构建阶段:
☑ 使用Gzip level 9压缩
☑ 同时生成Brotli压缩
☑ 保留原始文件
☑ 压缩阈值设置合理(1-10KB)

服务器配置:
☑ 启用静态压缩(gzip_static, brotli_static)
☑ 配置正确的Content-Encoding
☑ 添加Vary: Accept-Encoding头
☑ 排除已压缩的文件类型

监控检查:
☑ 验证压缩效果
☑ 监控传输大小
☑ 检查浏览器兼容性
☑ 测试降级方案
```

## 第八部分:压缩性能监控

### 8.1 压缩效果分析

```typescript
// 分析压缩效果
class CompressionAnalyzer {
  analyze() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // 检查是否使用了压缩
          if (resource.transferSize > 0 && resource.encodedBodySize > 0) {
            const compressionRatio = (1 - resource.transferSize / resource.encodedBodySize) * 100;
            
            console.log({
              url: resource.name,
              original: resource.encodedBodySize,
              compressed: resource.transferSize,
              saved: resource.encodedBodySize - resource.transferSize,
              ratio: compressionRatio.toFixed(2) + '%'
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
}

new CompressionAnalyzer().analyze();
```

### 8.2 实时压缩监控

```typescript
// 监控压缩性能
interface CompressionMetrics {
  totalRequests: number;
  compressedRequests: number;
  totalOriginal: number;
  totalCompressed: number;
  avgRatio: number;
}

class CompressionMonitor {
  private metrics: CompressionMetrics = {
    totalRequests: 0,
    compressedRequests: 0,
    totalOriginal: 0,
    totalCompressed: 0,
    avgRatio: 0
  };
  
  track(resource: PerformanceResourceTiming) {
    this.metrics.totalRequests++;
    
    if (resource.transferSize > 0 && resource.encodedBodySize > 0) {
      const compressed = resource.transferSize < resource.encodedBodySize;
      
      if (compressed) {
        this.metrics.compressedRequests++;
        this.metrics.totalOriginal += resource.encodedBodySize;
        this.metrics.totalCompressed += resource.transferSize;
      }
    }
    
    // 计算平均压缩率
    if (this.metrics.totalOriginal > 0) {
      this.metrics.avgRatio = (1 - this.metrics.totalCompressed / this.metrics.totalOriginal) * 100;
    }
  }
  
  getReport(): CompressionMetrics {
    return {
      ...this.metrics,
      avgRatio: parseFloat(this.metrics.avgRatio.toFixed(2))
    };
  }
}

const monitor = new CompressionMonitor();

// 自动收集
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    monitor.track(entry as PerformanceResourceTiming);
  }
}).observe({ entryTypes: ['resource'] });
```

### 8.3 压缩警告系统

```typescript
// 检测未压缩的大文件
function detectUncompressedAssets() {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const warnings: string[] = [];
  
  resources.forEach(resource => {
    // 检查大于50KB的文件
    if (resource.encodedBodySize > 50 * 1024) {
      // 检查是否压缩
      const compressionRatio = resource.transferSize / resource.encodedBodySize;
      
      // 如果压缩率低于10%，说明可能没有压缩
      if (compressionRatio > 0.9) {
        warnings.push(`⚠️ 大文件未压缩: ${resource.name} (${(resource.encodedBodySize / 1024).toFixed(2)}KB)`);
      }
    }
  });
  
  if (warnings.length > 0) {
    console.warn('发现未压缩的大文件:', warnings);
  }
  
  return warnings;
}

// 页面加载完成后检查
window.addEventListener('load', () => {
  setTimeout(detectUncompressedAssets, 1000);
});
```

## 第九部分:高级压缩策略

### 9.1 自适应压缩

```typescript
// 根据客户端能力选择压缩算法
function selectCompressionAlgorithm(acceptEncoding: string): string {
  const algorithms = ['br', 'gzip', 'deflate', 'identity'];
  
  for (const algo of algorithms) {
    if (acceptEncoding.includes(algo)) {
      return algo;
    }
  }
  
  return 'identity'; // 不压缩
}

// Express中间件
app.use((req, res, next) => {
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const algorithm = selectCompressionAlgorithm(acceptEncoding);
  
  req.compressionAlgorithm = algorithm;
  next();
});
```

### 9.2 动态压缩级别

```typescript
// 根据文件大小和类型动态调整压缩级别
function getOptimalCompressionLevel(
  fileSize: number,
  fileType: string
): number {
  // 小文件用高压缩
  if (fileSize < 10 * 1024) { // 小于10KB
    return 9; // 最高压缩
  }
  
  // 中等文件平衡压缩
  if (fileSize < 100 * 1024) { // 小于100KB
    return 6; // 平衡压缩
  }
  
  // 大文件用快速压缩
  if (fileSize < 1024 * 1024) { // 小于1MB
    return 4; // 快速压缩
  }
  
  // 特大文件最快压缩
  return 1;
}

// 使用
import zlib from 'zlib';

function compressFile(buffer: Buffer, filename: string): Buffer {
  const level = getOptimalCompressionLevel(buffer.length, path.extname(filename));
  
  return zlib.gzipSync(buffer, {
    level,
    memLevel: 8
  });
}
```

### 9.3 预压缩+动态压缩混合

```typescript
// Nginx配置混合策略
/*
location / {
    # 优先使用预压缩文件
    gzip_static on;
    
    # 预压缩文件不存在时动态压缩
    gzip on;
    gzip_types text/css application/javascript;
    gzip_comp_level 6;
}
*/

// Node.js实现
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

async function serveCompressed(req: Request, res: Response) {
  const filePath = getFilePath(req.url);
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  // 尝试Brotli预压缩
  if (acceptEncoding.includes('br')) {
    const brPath = filePath + '.br';
    if (fs.existsSync(brPath)) {
      res.set('Content-Encoding', 'br');
      return res.sendFile(brPath);
    }
  }
  
  // 尝试Gzip预压缩
  if (acceptEncoding.includes('gzip')) {
    const gzPath = filePath + '.gz';
    if (fs.existsSync(gzPath)) {
      res.set('Content-Encoding', 'gzip');
      return res.sendFile(gzPath);
    }
  }
  
  // 动态压缩
  const content = fs.readFileSync(filePath);
  
  if (acceptEncoding.includes('gzip') && content.length > 1024) {
    const compressed = zlib.gzipSync(content);
    res.set('Content-Encoding', 'gzip');
    return res.send(compressed);
  }
  
  // 不压缩
  res.send(content);
}
```

## 第十部分:压缩最佳实践

### 10.1 完整压缩方案

```typescript
// 生产环境完整配置
const compressionConfig = {
  // 1. 构建时预压缩
  build: {
    plugins: [
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false
      }),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false
      })
    ]
  },
  
  // 2. 服务器配置
  server: {
    nginx: `
      # 预压缩优先
      gzip_static on;
      
      # 动态压缩备用
      gzip on;
      gzip_vary on;
      gzip_proxied any;
      gzip_comp_level 6;
      gzip_types text/plain text/css text/xml text/javascript 
                 application/json application/javascript application/xml+rss
                 application/rss+xml font/truetype font/opentype 
                 application/vnd.ms-fontobject image/svg+xml;
      
      # Brotli支持
      brotli_static on;
      brotli on;
      brotli_types text/plain text/css application/json 
                   application/javascript text/xml application/xml 
                   application/xml+rss text/javascript;
    `
  },
  
  // 3. CDN配置
  cdn: {
    compressionEnabled: true,
    automaticCompression: true,
    minimumFileSize: 1024
  },
  
  // 4. 监控
  monitoring: {
    enabled: true,
    threshold: 0.5, // 压缩率低于50%时告警
    reportInterval: 3600000 // 1小时上报一次
  }
};
```

### 10.2 压缩检查清单

```typescript
const compressionChecklist = {
  '✅ 构建配置': [
    '已配置Brotli和Gzip预压缩',
    '压缩阈值设置为1KB以上',
    '保留原始文件用于不支持压缩的客户端'
  ],
  
  '✅ 服务器配置': [
    '启用gzip_static和brotli_static',
    '配置正确的MIME类型',
    '设置合理的压缩级别(6)',
    '添加Vary: Accept-Encoding响应头'
  ],
  
  '✅ 文件选择': [
    '压缩文本文件(HTML, CSS, JS, JSON, XML)',
    '压缩SVG矢量图',
    '不压缩已压缩文件(JPEG, PNG, GIF, PDF)',
    '不压缩小文件(< 1KB)'
  ],
  
  '✅ 性能验证': [
    '检查响应头Content-Encoding',
    '对比压缩前后文件大小',
    '测试不同网络条件下的加载时间',
    '监控压缩CPU开销'
  ],
  
  '✅ 兼容性': [
    '支持不接受压缩的客户端',
    '正确处理Range请求',
    '配置ETag和Last-Modified',
    '测试各主流浏览器'
  ]
};
```

### 10.3 常见问题解决

```typescript
// 问题1: 压缩后反而变大
// 原因: 小文件或已压缩文件
// 解决: 设置最小压缩阈值
{
  threshold: 1024, // 只压缩大于1KB的文件
  filter: /\.(js|css|html|svg)$/ // 只压缩特定类型
}

// 问题2: 动态内容无法压缩
// 原因: 响应流已经开始
// 解决: 在开始发送响应前设置压缩
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 问题3: ETag不匹配
// 原因: 压缩改变了内容
// 解决: 使用弱ETag
res.setHeader('ETag', `W/"${etag}"`);

// 问题4: CDN不支持Brotli
// 原因: 部分CDN不支持
// 解决: 提供Gzip备选
location / {
    brotli_static on;
    gzip_static on; # 备选
}
```

## 第十一部分:实战案例分析

### 11.1 大型SPA应用优化

```typescript
// 优化前
{
  'app.js': '2.5MB',      // 未压缩
  'vendor.js': '1.8MB',   // 未压缩
  'main.css': '350KB'     // 未压缩
}
// 总大小: 4.65MB
// 加载时间(4G): 8-10秒

// 优化后
// 1. 启用Brotli压缩
// vite.config.ts
export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024
    })
  ]
});

// 2. 配置Nginx
/*
location / {
    brotli_static on;
    brotli on;
    brotli_comp_level 6;
}
*/

// 结果
{
  'app.js.br': '380KB',      // 压缩率: 84.8%
  'vendor.js.br': '280KB',   // 压缩率: 84.4%
  'main.css.br': '45KB'      // 压缩率: 87.1%
}
// 总大小: 705KB (↓84.8%)
// 加载时间(4G): 1.5-2秒 (↓80%)
```

### 11.2 图片密集型网站

```typescript
// 电商网站优化策略
const imageOptimization = {
  // 1. SVG图标启用压缩
  'icons.svg': {
    original: '120KB',
    gzip: '28KB',      // 76.7%
    brotli: '22KB'     // 81.7%
  },
  
  // 2. JSON数据压缩
  'products.json': {
    original: '850KB',
    gzip: '125KB',     // 85.3%
    brotli: '95KB'     // 88.8%
  },
  
  // 3. CSS压缩
  'styles.css': {
    original: '450KB',
    minified: '320KB',
    gzip: '65KB',      // 85.6%
    brotli: '52KB'     // 88.4%
  }
};

// 配置示例
import imagemin from 'imagemin';
import imageminSvgo from 'imagemin-svgo';

// SVG优化+压缩
await imagemin(['src/icons/*.svg'], {
  destination: 'dist/icons',
  plugins: [
    imageminSvgo({
      plugins: [
        { removeViewBox: false },
        { cleanupIDs: false }
      ]
    })
  ]
});

// 然后Brotli压缩
execSync('brotli dist/icons/*.svg');
```

### 11.3 API响应压缩

```typescript
// API服务器启用压缩
import express from 'express';
import compression from 'compression';

const app = express();

// 智能压缩中间件
app.use(compression({
  // 只压缩JSON响应
  filter: (req, res) => {
    if (res.getHeader('Content-Type')?.includes('application/json')) {
      return true;
    }
    return false;
  },
  
  // 根据响应大小动态调整
  level: (req, res) => {
    const size = parseInt(res.getHeader('Content-Length') || '0');
    
    if (size > 100 * 1024) return 4; // 大响应快速压缩
    if (size > 10 * 1024) return 6;  // 中等响应平衡
    return 9; // 小响应最大压缩
  },
  
  threshold: 1024
}));

// 效果
const apiOptimization = {
  '/api/products': {
    original: '2.5MB',
    compressed: '320KB',
    ratio: '87.2%',
    timeSaved: '4.2s (4G网络)'
  },
  '/api/users': {
    original: '850KB',
    compressed: '125KB',
    ratio: '85.3%',
    timeSaved: '1.5s'
  }
};
```

## 总结

本章全面介绍了Gzip压缩:

1. **压缩基础** - 理解Gzip原理和优势
2. **构建压缩** - Vite/Webpack构建时压缩
3. **服务端配置** - Nginx/Node.js动态压缩
4. **优化策略** - 选择性压缩和级别优化
5. **Brotli** - 更高效的压缩算法
6. **监控调试** - 压缩效果验证和性能监控
7. **最佳实践** - 完整的压缩方案
8. **性能监控** - 实时压缩效果分析
9. **高级策略** - 自适应和动态压缩
10. **实战案例** - 真实项目优化经验

合理使用压缩能够显著减小文件体积,提升传输效率，是Web性能优化的重要手段。

## 扩展阅读

- [Gzip Compression](https://developers.google.com/speed/docs/insights/EnableCompression)
- [Brotli Compression](https://github.com/google/brotli)
- [Nginx Compression](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)
- [Web Performance](https://web.dev/performance/)
- [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)

