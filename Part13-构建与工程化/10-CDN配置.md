# CDN配置

## 课程概述

本章节深入探讨CDN(Content Delivery Network)的配置和使用,学习如何通过CDN加速静态资源分发,提升全球用户访问速度。掌握CDN配置是优化应用性能的重要手段。

### 学习目标

- 理解CDN的工作原理和优势
- 掌握静态资源CDN配置
- 学习CDN域名和缓存策略
- 了解CDN回源和容灾配置
- 掌握主流CDN服务的使用
- 学习CDN性能优化技巧

## 第一部分:CDN基础

### 1.1 什么是CDN

CDN(内容分发网络)是一组分布在全球各地的服务器,通过将内容缓存到距离用户最近的节点,加速内容传输。

**工作流程:**
```
用户请求 → CDN边缘节点 → 
  ├─ 命中缓存 → 直接返回
  └─ 未命中 → 回源服务器 → 缓存并返回
```

**性能对比:**
```javascript
// 不使用CDN
用户(北京) → 源服务器(美国) = 200ms

// 使用CDN
用户(北京) → CDN节点(北京) = 20ms
```

### 1.2 CDN的优势

```javascript
1. 加速访问 - 就近访问,减少延迟
2. 减轻负载 - 分担源站压力
3. 提高可用性 - 多节点容灾
4. 节省带宽 - 边缘缓存减少回源
5. 安全防护 - DDoS防护,WAF
```

### 1.3 CDN缓存策略

```javascript
// 缓存层级
1. 浏览器缓存
2. CDN边缘节点
3. CDN中心节点
4. 源服务器
```

## 第二部分:静态资源CDN配置

### 2.1 Vite CDN配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: 'https://cdn.example.com/',  // CDN域名
  
  build: {
    rollupOptions: {
      output: {
        // 资源文件命名
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      }
    }
  }
})
```

**环境特定CDN:**

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const CDN_URLS = {
    development: '/',
    staging: 'https://staging-cdn.example.com/',
    production: 'https://cdn.example.com/',
  }
  
  return {
    base: CDN_URLS[mode] || '/',
    // ...
  }
})
```

### 2.2 Webpack CDN配置

```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/',
  },
  
  // 或使用环境变量
  output: {
    publicPath: process.env.CDN_URL || '/',
  }
}
```

### 2.3 动态公共路径

```typescript
// src/main.tsx
// 运行时设置公共路径
if (import.meta.env.PROD) {
  import.meta.env.BASE_URL = 'https://cdn.example.com/'
}

// 或从配置文件加载
fetch('/config.json')
  .then(res => res.json())
  .then(config => {
    import.meta.env.BASE_URL = config.cdnUrl
  })
```

### 2.4 HTML中引用CDN

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    
    <!-- 从CDN加载字体 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    
    <!-- 从CDN加载库 -->
    <script crossorigin src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## 第三部分:主流CDN服务

### 3.1 Cloudflare CDN

```bash
# 安装Cloudflare CLI
npm install -g wrangler

# 登录
wrangler login

# 部署到Cloudflare Pages
wrangler pages publish dist
```

**配置文件:**

```toml
# wrangler.toml
name = "my-app"
type = "webpack"

[site]
bucket = "./dist"

[env.production]
route = "https://example.com/*"
zone_id = "your-zone-id"
```

**自定义缓存规则:**

```javascript
// _headers (Cloudflare Pages)
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/static/*
  Cache-Control: public, max-age=31536000, immutable
```

### 3.2 AWS CloudFront

```javascript
// AWS CDK配置
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3 from 'aws-cdk-lib/aws-s3'

const bucket = new s3.Bucket(this, 'MyBucket')

const distribution = new cloudfront.CloudFrontWebDistribution(this, 'MyDistribution', {
  originConfigs: [{
    s3OriginSource: {
      s3BucketSource: bucket
    },
    behaviors: [{
      isDefaultBehavior: true,
      compress: true,
      allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
      forwardedValues: {
        queryString: false,
        cookies: { forward: 'none' }
      },
      minTtl: 0,
      defaultTtl: 86400,
      maxTtl: 31536000,
    }]
  }]
})
```

### 3.3 阿里云CDN

```javascript
// 阿里云OSS + CDN配置
const OSS = require('ali-oss')

const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  bucket: 'your-bucket-name'
})

// 上传文件到OSS
async function uploadToOSS(localFile, remotePath) {
  try {
    const result = await client.put(remotePath, localFile, {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'Content-Type': 'application/javascript'
      }
    })
    
    // CDN URL
    const cdnUrl = `https://cdn.example.com/${remotePath}`
    console.log('CDN URL:', cdnUrl)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### 3.4 腾讯云CDN

```javascript
// 腾讯云COS + CDN
const COS = require('cos-nodejs-sdk-v5')

const cos = new COS({
  SecretId: 'your-secret-id',
  SecretKey: 'your-secret-key'
})

// 上传文件
cos.putObject({
  Bucket: 'your-bucket',
  Region: 'ap-guangzhou',
  Key: 'assets/app.js',
  Body: fs.createReadStream('./dist/app.js'),
  Headers: {
    'Cache-Control': 'max-age=31536000'
  }
}, (err, data) => {
  if (err) {
    console.error(err)
  } else {
    console.log('CDN URL:', `https://cdn.example.com/assets/app.js`)
  }
})
```

## 第四部分:缓存策略

### 4.1 HTTP缓存头

```javascript
// 不同资源的缓存策略

// HTML - 不缓存或短期缓存
Cache-Control: no-cache
// 或
Cache-Control: public, max-age=300, must-revalidate

// JS/CSS - 长期缓存(使用hash)
Cache-Control: public, max-age=31536000, immutable

// 图片 - 长期缓存
Cache-Control: public, max-age=31536000

// API响应 - 不缓存
Cache-Control: no-store
```

### 4.2 Vite缓存配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 使用内容hash,确保缓存失效
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          }
          
          return `assets/[name]-[hash][extname]`
        },
        
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      }
    }
  }
})
```

### 4.3 服务端缓存配置

**Nginx配置:**

```nginx
# nginx.conf
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    
    # HTML - 不缓存
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires -1;
    }
    
    # JS/CSS - 长期缓存
    location ~* \.(js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        expires 1y;
    }
    
    # 图片 - 长期缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        add_header Cache-Control "public, max-age=31536000";
        expires 1y;
    }
    
    # 字体 - 长期缓存
    location ~* \.(woff2?|ttf|otf|eot)$ {
        add_header Cache-Control "public, max-age=31536000";
        add_header Access-Control-Allow-Origin "*";
        expires 1y;
    }
}
```

### 4.4 CDN缓存刷新

```javascript
// 阿里云CDN刷新
const Core = require('@alicloud/pop-core')

const client = new Core({
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  endpoint: 'https://cdn.aliyuncs.com',
  apiVersion: '2018-05-10'
})

// 刷新URL
async function refreshCDN(urls) {
  const params = {
    ObjectPath: urls.join('\n'),
    ObjectType: 'File'
  }
  
  try {
    const result = await client.request('RefreshObjectCaches', params)
    console.log('CDN刷新成功:', result)
  } catch (error) {
    console.error('CDN刷新失败:', error)
  }
}

// 使用
refreshCDN([
  'https://cdn.example.com/js/app-abc123.js',
  'https://cdn.example.com/css/main-def456.css'
])
```

## 第五部分:部署自动化

### 5.1 部署脚本

```javascript
// scripts/deploy-cdn.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'
import fs from 'fs'
import path from 'path'
import glob from 'glob'

const s3Client = new S3Client({ region: 'us-east-1' })
const cfClient = new CloudFrontClient({ region: 'us-east-1' })

const BUCKET = 'my-bucket'
const DISTRIBUTION_ID = 'E1234567890'
const CDN_PATH = 'https://cdn.example.com'

// 上传文件到S3
async function uploadFile(localPath, remotePath) {
  const fileContent = fs.readFileSync(localPath)
  const ext = path.extname(localPath)
  
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  }[ext] || 'application/octet-stream'
  
  const cacheControl = ext === '.html' 
    ? 'no-cache' 
    : 'public, max-age=31536000, immutable'
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: remotePath,
    Body: fileContent,
    ContentType: contentType,
    CacheControl: cacheControl,
  })
  
  await s3Client.send(command)
  console.log(`Uploaded: ${remotePath}`)
}

// 批量上传
async function uploadDirectory(dir) {
  const files = glob.sync(`${dir}/**/*`, { nodir: true })
  
  for (const file of files) {
    const remotePath = file.replace(dir + '/', '')
    await uploadFile(file, remotePath)
  }
}

// 刷新CDN缓存
async function invalidateCache(paths) {
  const command = new CreateInvalidationCommand({
    DistributionId: DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: paths.length,
        Items: paths,
      },
    },
  })
  
  await cfClient.send(command)
  console.log('CDN cache invalidated')
}

// 执行部署
async function deploy() {
  console.log('Starting deployment...')
  
  // 上传文件
  await uploadDirectory('dist')
  
  // 刷新关键文件缓存
  await invalidateCache([
    '/index.html',
    '/manifest.json',
  ])
  
  console.log('Deployment complete!')
  console.log(`Site available at: ${CDN_PATH}`)
}

deploy().catch(console.error)
```

### 5.2 GitHub Actions部署

```yaml
# .github/workflows/deploy-cdn.yml
name: Deploy to CDN

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_CDN_URL: https://cdn.example.com/
      
      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --follow-symlinks --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: 'us-east-1'
          SOURCE_DIR: 'dist'
      
      - name: Invalidate CloudFront
        uses: chetan/invalidate-cloudfront-action@v2
        env:
          DISTRIBUTION: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
          PATHS: '/*'
          AWS_REGION: 'us-east-1'
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### 5.3 部署配置文件

```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:prod": "vite build --mode production",
    "deploy": "npm run build:prod && node scripts/deploy-cdn.js",
    "deploy:staging": "vite build --mode staging && node scripts/deploy-cdn.js --env staging"
  }
}
```

## 第六部分:性能优化

### 6.1 资源压缩

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    
    // Brotli压缩
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ]
})
```

### 6.2 图片优化

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
        ],
      },
    })
  ]
})
```

### 6.3 CDN预热

```javascript
// scripts/cdn-preheat.js
// 阿里云CDN预热
const Core = require('@alicloud/pop-core')

const client = new Core({
  accessKeyId: 'your-access-key-id',
  accessKeySecret: 'your-access-key-secret',
  endpoint: 'https://cdn.aliyuncs.com',
  apiVersion: '2018-05-10'
})

async function preheatCDN(urls) {
  const params = {
    ObjectPath: urls.join('\n'),
    Area: 'domestic' // domestic | overseas | global
  }
  
  try {
    const result = await client.request('PushObjectCache', params)
    console.log('CDN预热成功:', result)
  } catch (error) {
    console.error('CDN预热失败:', error)
  }
}

// 预热重要资源
preheatCDN([
  'https://cdn.example.com/js/app-abc123.js',
  'https://cdn.example.com/css/main-def456.css',
  'https://cdn.example.com/images/hero.jpg'
])
```

## 第七部分:监控和故障处理

### 7.1 CDN监控

```javascript
// src/utils/cdn-monitor.ts
export function monitorCDN() {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('cdn.example.com')) {
          // 记录CDN资源加载性能
          console.log('CDN Resource:', {
            url: entry.name,
            duration: entry.duration,
            transferSize: entry.transferSize,
          })
          
          // 发送到监控服务
          analytics.track('cdn_performance', {
            url: entry.name,
            duration: entry.duration,
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
  }
}
```

### 7.2 CDN降级

```typescript
// src/utils/cdn-fallback.ts
export function loadWithFallback(cdnUrl: string, fallbackUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = cdnUrl
    
    script.onload = () => resolve(cdnUrl)
    
    script.onerror = () => {
      console.warn('CDN failed, using fallback')
      
      // 降级到备用URL
      const fallbackScript = document.createElement('script')
      fallbackScript.src = fallbackUrl
      
      fallbackScript.onload = () => resolve(fallbackUrl)
      fallbackScript.onerror = () => reject(new Error('Both CDN and fallback failed'))
      
      document.head.appendChild(fallbackScript)
    }
    
    document.head.appendChild(script)
  })
}

// 使用
loadWithFallback(
  'https://cdn.example.com/lib.js',
  '/local/lib.js'
)
```

### 7.3 多CDN策略

```typescript
// src/config/cdn.ts
const CDN_PROVIDERS = [
  'https://cdn1.example.com',
  'https://cdn2.example.com',
  'https://cdn3.example.com',
]

export function getCDNUrl(path: string): string {
  // 根据用户地理位置选择CDN
  const userRegion = getUserRegion()
  
  const cdnMap: Record<string, string> = {
    'asia': CDN_PROVIDERS[0],
    'europe': CDN_PROVIDERS[1],
    'america': CDN_PROVIDERS[2],
  }
  
  const cdn = cdnMap[userRegion] || CDN_PROVIDERS[0]
  return `${cdn}/${path}`
}

function getUserRegion(): string {
  // 根据IP或其他方式判断用户地区
  return 'asia'
}
```

## 第八部分:CDN高级优化

### 8.1 智能CDN选择

```typescript
// 根据用户位置选择最优CDN
function selectOptimalCDN(userLocation: string): string {
  const cdnEndpoints = {
    'asia': 'https://asia.cdn.example.com',
    'europe': 'https://eu.cdn.example.com',
    'americas': 'https://us.cdn.example.com',
    'oceania': 'https://au.cdn.example.com'
  };
  
  const region = getRegion(userLocation);
  return cdnEndpoints[region as keyof typeof cdnEndpoints] || cdnEndpoints.americas;
}

// 自动检测最快CDN
async function detectFastestCDN(cdnList: string[]): Promise<string> {
  const pingResults = await Promise.all(
    cdnList.map(async (cdn) => {
      const start = performance.now();
      try {
        await fetch(`${cdn}/health-check`, { method: 'HEAD' });
        const latency = performance.now() - start;
        return { cdn, latency };
      } catch {
        return { cdn, latency: Infinity };
      }
    })
  );
  
  const fastest = pingResults.sort((a, b) => a.latency - b.latency)[0];
  return fastest.cdn;
}

// 使用
const cdnUrl = await detectFastestCDN([
  'https://cdn1.example.com',
  'https://cdn2.example.com',
  'https://cdn3.example.com'
]);

window.CDN_BASE_URL = cdnUrl;
```

### 8.2 CDN回源优化

```nginx
# Nginx配置回源优化
upstream origin_servers {
    least_conn;
    
    server origin1.example.com:443 weight=5;
    server origin2.example.com:443 weight=3;
    server origin3.example.com:443 backup;
    
    check interval=3000 rise=2 fall=3 timeout=1000;
}

server {
    listen 443 ssl http2;
    server_name cdn.example.com;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass https://origin_servers;
        
        proxy_cache cdn_cache;
        proxy_cache_valid 200 30d;
        proxy_cache_valid 404 10m;
        
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        proxy_cache_lock on;
        proxy_cache_lock_timeout 5s;
        
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503;
        proxy_cache_background_update on;
        
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### 8.3 边缘计算

```typescript
// Cloudflare Workers边缘计算
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    const width = url.searchParams.get('w');
    const quality = url.searchParams.get('q') || '80';
    const format = url.searchParams.get('f') || 'webp';
    
    const originalUrl = `https://origin.example.com${url.pathname}`;
    const response = await fetch(originalUrl);
    
    if (!response.ok) {
      return response;
    }
    
    const options = {
      cf: {
        image: {
          width: width ? parseInt(width) : undefined,
          quality: parseInt(quality),
          format: format as 'webp' | 'jpeg' | 'png'
        }
      }
    };
    
    return fetch(originalUrl, options);
  }
};
```

## 第九部分:多CDN容灾

### 9.1 多CDN切换

```typescript
class MultiCDNManager {
  private cdns = [
    'https://cdn1.example.com',
    'https://cdn2.example.com',
    'https://cdn3.example.com'
  ];
  
  private currentIndex = 0;
  private failureCount: Map<string, number> = new Map();
  private readonly MAX_FAILURES = 3;
  
  getResourceUrl(path: string): string {
    const cdn = this.cdns[this.currentIndex];
    return `${cdn}${path}`;
  }
  
  async loadWithFallback(path: string): Promise<Response> {
    for (let i = 0; i < this.cdns.length; i++) {
      const cdn = this.cdns[(this.currentIndex + i) % this.cdns.length];
      
      if ((this.failureCount.get(cdn) || 0) >= this.MAX_FAILURES) {
        continue;
      }
      
      try {
        const response = await fetch(`${cdn}${path}`);
        
        if (response.ok) {
          this.failureCount.set(cdn, 0);
          this.currentIndex = (this.currentIndex + i) % this.cdns.length;
          return response;
        }
      } catch (error) {
        console.warn(`CDN ${cdn} failed:`, error);
        this.failureCount.set(cdn, (this.failureCount.get(cdn) || 0) + 1);
      }
    }
    
    throw new Error('All CDNs failed');
  }
  
  startHealthCheck() {
    setInterval(async () => {
      for (const cdn of this.cdns) {
        try {
          const response = await fetch(`${cdn}/health`, { method: 'HEAD' });
          if (response.ok) {
            this.failureCount.set(cdn, 0);
          }
        } catch {
          // 健康检查失败
        }
      }
    }, 60000);
  }
}

const cdnManager = new MultiCDNManager();
cdnManager.startHealthCheck();

async function cdnFetch(path: string): Promise<Response> {
  return cdnManager.loadWithFallback(path);
}
```

### 9.2 P2P CDN

```typescript
import PeerCDN from '@peercdn/client';

const peerCDN = new PeerCDN({
  cdn: 'https://cdn.example.com',
  p2pEnabled: true,
  p2pRatio: 0.5,
  trackerUrls: [
    'wss://tracker1.example.com',
    'wss://tracker2.example.com'
  ]
});

function loadResource(url: string) {
  return peerCDN.load(url);
}

peerCDN.on('stats', (stats) => {
  console.log('P2P Stats:', {
    httpDownloaded: stats.httpDownloaded,
    p2pDownloaded: stats.p2pDownloaded,
    p2pRatio: (stats.p2pDownloaded / (stats.httpDownloaded + stats.p2pDownloaded) * 100).toFixed(2) + '%',
    peers: stats.connectedPeers
  });
});
```

## 第十部分:CDN安全配置

### 10.1 防盗链配置

```nginx
location ~* \.(jpg|jpeg|png|gif|mp4|mp3)$ {
    valid_referers none blocked example.com *.example.com;
    
    if ($invalid_referer) {
        return 403;
    }
}
```

```typescript
import crypto from 'crypto';

function generateSignedUrl(
  path: string,
  expiresIn: number = 3600
): string {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const secret = process.env.CDN_SECRET!;
  
  const stringToSign = `${path}${expires}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('hex');
  
  return `https://cdn.example.com${path}?expires=${expires}&signature=${signature}`;
}

const imageUrl = generateSignedUrl('/images/product.jpg', 3600);
```

### 10.2 DDoS防护

```typescript
const cloudflare = {
  security: {
    ddos_protection: true,
    
    waf: {
      enabled: true,
      rules: [
        {
          expression: '(http.request.uri.path contains "admin")',
          action: 'challenge'
        },
        {
          expression: '(cf.threat_score > 30)',
          action: 'block'
        }
      ]
    },
    
    rate_limiting: {
      threshold: 100,
      period: 60,
      action: 'challenge'
    },
    
    bot_management: {
      enabled: true,
      fight_mode: true
    }
  }
};

const cloudfront = {
  webACL: {
    rules: [
      {
        name: 'RateLimitRule',
        priority: 1,
        statement: {
          rateBasedStatement: {
            limit: 2000,
            aggregateKeyType: 'IP'
          }
        },
        action: { block: {} }
      },
      {
        name: 'GeoBlockRule',
        priority: 2,
        statement: {
          geoMatchStatement: {
            countryCodes: ['CN', 'RU']
          }
        },
        action: { block: {} }
      }
    ]
  }
};
```

## 第十一部分:CDN成本优化

### 11.1 智能缓存策略

```typescript
function getCacheDuration(path: string, accessCount: number): string {
  if (accessCount > 1000) {
    return 'public, max-age=31536000, immutable';
  }
  
  if (accessCount > 100) {
    return 'public, max-age=86400';
  }
  
  return 'public, max-age=3600';
}

function getDynamicCacheHeaders(data: any): HeadersInit {
  const etag = generateETag(data);
  const lastModified = new Date(data.updatedAt).toUTCString();
  
  return {
    'ETag': etag,
    'Last-Modified': lastModified,
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'CDN-Cache-Control': 'public, max-age=60'
  };
}
```

### 11.2 压缩优化

```typescript
function getOptimalCompression(
  userAgent: string,
  acceptEncoding: string
): 'br' | 'gzip' | 'none' {
  if (acceptEncoding.includes('br')) {
    return 'br';
  }
  
  if (acceptEncoding.includes('gzip')) {
    return 'gzip';
  }
  
  return 'none';
}

const compressionPlugin = {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('CompressionPlugin', (compilation, callback) => {
      Object.keys(compilation.assets).forEach(filename => {
        if (filename.match(/\.(js|css|html|svg)$/)) {
          const source = compilation.assets[filename].source();
          
          const brCompressed = brotliCompressSync(source);
          compilation.assets[`${filename}.br`] = {
            source: () => brCompressed,
            size: () => brCompressed.length
          };
          
          const gzipCompressed = gzipSync(source);
          compilation.assets[`${filename}.gz`] = {
            source: () => gzipCompressed,
            size: () => gzipCompressed.length
          };
        }
      });
      
      callback();
    });
  }
};
```

## 第十二部分:性能监控和分析

### 12.1 CDN性能监控

```typescript
class CDNPerformanceMonitor {
  private metrics: {
    url: string;
    loadTime: number;
    transferSize: number;
    cached: boolean;
  }[] = [];
  
  init() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          if (resource.name.includes('cdn.example.com')) {
            this.metrics.push({
              url: resource.name,
              loadTime: resource.duration,
              transferSize: resource.transferSize,
              cached: resource.transferSize === 0
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
  
  getReport() {
    const total = this.metrics.length;
    const cached = this.metrics.filter(m => m.cached).length;
    const avgLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / total;
    const totalTransfer = this.metrics.reduce((sum, m) => sum + m.transferSize, 0);
    
    return {
      totalRequests: total,
      cachedRequests: cached,
      cacheHitRate: (cached / total * 100).toFixed(2) + '%',
      avgLoadTime: avgLoadTime.toFixed(2) + 'ms',
      totalTransfer: (totalTransfer / 1024 / 1024).toFixed(2) + 'MB',
      slowestResources: this.metrics
        .sort((a, b) => b.loadTime - a.loadTime)
        .slice(0, 10)
    };
  }
  
  sendReport() {
    const report = this.getReport();
    navigator.sendBeacon('/api/cdn-performance', JSON.stringify(report));
  }
}

const cdnMonitor = new CDNPerformanceMonitor();
cdnMonitor.init();

window.addEventListener('beforeunload', () => {
  cdnMonitor.sendReport();
});
```

### 12.2 真实用户监控(RUM)

```typescript
interface CDNMetrics {
  region: string;
  cdn: string;
  ttfb: number;
  downloadTime: number;
  totalTime: number;
  cacheStatus: 'HIT' | 'MISS' | 'EXPIRED';
}

function collectCDNMetrics(): CDNMetrics {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const cdnResource = resources.find(r => r.name.includes('cdn.example.com'));
  
  return {
    region: getUserRegion(),
    cdn: getCDNProvider(),
    ttfb: navigation.responseStart - navigation.requestStart,
    downloadTime: cdnResource ? cdnResource.responseEnd - cdnResource.responseStart : 0,
    totalTime: cdnResource ? cdnResource.duration : 0,
    cacheStatus: getCacheStatus(cdnResource)
  };
}

function getCacheStatus(resource: PerformanceResourceTiming | undefined): 'HIT' | 'MISS' | 'EXPIRED' {
  if (!resource) return 'MISS';
  
  if (resource.transferSize === 0) return 'HIT';
  if (resource.transferSize < resource.encodedBodySize) return 'EXPIRED';
  return 'MISS';
}

window.addEventListener('load', () => {
  setTimeout(() => {
    const metrics = collectCDNMetrics();
    
    fetch('https://analytics.example.com/rum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  }, 1000);
});
```

## 第十三部分:实战案例

### 13.1 全球化电商CDN部署

```typescript
const cdnConfig = {
  regions: {
    'asia-east': {
      cdn: 'https://asia.cdn.example.com',
      origins: ['origin-tokyo.example.com', 'origin-singapore.example.com'],
      caching: {
        static: '30d',
        dynamic: '5m'
      }
    },
    'europe': {
      cdn: 'https://eu.cdn.example.com',
      origins: ['origin-london.example.com', 'origin-frankfurt.example.com'],
      caching: {
        static: '30d',
        dynamic: '5m'
      }
    },
    'americas': {
      cdn: 'https://us.cdn.example.com',
      origins: ['origin-virginia.example.com', 'origin-california.example.com'],
      caching: {
        static: '30d',
        dynamic: '5m'
      }
    }
  },
  
  router: (userIP: string) => {
    const location = geoIP(userIP);
    const region = mapToRegion(location);
    return cdnConfig.regions[region];
  }
};

// 性能提升:
// 亚洲用户: TTFB 500ms -> 50ms (↓90%)
// 欧洲用户: TTFB 600ms -> 60ms (↓90%)
// 美洲用户: TTFB 100ms -> 30ms (↓70%)
```

## 总结

本章全面介绍了CDN配置:

1. **CDN基础** - 理解CDN原理和优势
2. **资源配置** - 静态资源CDN部署
3. **CDN服务** - 主流CDN服务使用
4. **缓存策略** - HTTP缓存和CDN缓存
5. **自动部署** - CI/CD集成CDN部署
6. **性能优化** - 压缩、预热、降级
7. **监控处理** - CDN性能监控和容灾
8. **高级优化** - 边缘计算、多CDN、P2P
9. **安全配置** - 防盗链、DDoS防护
10. **成本优化** - 智能缓存、压缩策略
11. **性能监控** - RUM监控和分析
12. **实战案例** - 全球化部署经验

合理使用CDN能够显著提升应用的全球访问速度。

## 扩展阅读

- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Cloudflare CDN](https://www.cloudflare.com/cdn/)
- [Web Performance](https://web.dev/performance/)
- [Edge Computing](https://www.cloudflare.com/learning/serverless/glossary/what-is-edge-computing/)

