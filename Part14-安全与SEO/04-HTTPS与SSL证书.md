# HTTPS与SSL证书 - Web安全通信基石

## 1. HTTPS概述

### 1.1 什么是HTTPS

HTTPS（HyperText Transfer Protocol Secure）是HTTP的安全版本,通过SSL/TLS协议对HTTP通信进行加密。它在HTTP和TCP之间添加了一个加密层,确保数据在传输过程中的机密性和完整性。

**核心组成：**
- **HTTP**：应用层协议
- **SSL/TLS**：安全传输层协议
- **TCP**：传输层协议

**工作流程：**
```
客户端 → TLS握手 → 服务器
      ← 证书验证 ←
      → 密钥交换 →
      ← 加密通信 ←
```

### 1.2 为什么需要HTTPS

**安全性：**
- **加密传输**：防止数据被窃听
- **数据完整性**：防止数据被篡改
- **身份验证**：确认服务器身份

**SEO和用户信任：**
- Google排名因素
- 浏览器地址栏显示安全标识
- 用户信任度提升
- 支持HTTP/2和HTTP/3

**功能要求：**
- Service Worker需要HTTPS
- 地理位置API需要HTTPS
- 摄像头和麦克风访问需要HTTPS
- PWA必须使用HTTPS

### 1.3 HTTP vs HTTPS

```typescript
// HTTP (不安全)
http://example.com
- 端口: 80
- 明文传输
- 容易被窃听和篡改
- SEO不友好

// HTTPS (安全)
https://example.com
- 端口: 443
- 加密传输
- 数据安全
- SEO友好
```

## 2. SSL/TLS基础

### 2.1 SSL和TLS的区别

```bash
# SSL (Secure Sockets Layer)
SSL 1.0 - 从未发布
SSL 2.0 - 1995年，已废弃
SSL 3.0 - 1996年，已废弃

# TLS (Transport Layer Security)
TLS 1.0 - 1999年，已废弃
TLS 1.1 - 2006年，已废弃
TLS 1.2 - 2008年，广泛使用
TLS 1.3 - 2018年，推荐使用
```

### 2.2 TLS握手过程

```typescript
// TLS 1.2 握手流程
/**
 * 1. Client Hello
 *    - 支持的TLS版本
 *    - 支持的加密套件
 *    - 随机数
 */

/**
 * 2. Server Hello
 *    - 选择的TLS版本
 *    - 选择的加密套件
 *    - 服务器随机数
 *    - SSL证书
 */

/**
 * 3. 证书验证
 *    - 验证证书有效性
 *    - 验证证书链
 *    - 验证域名匹配
 */

/**
 * 4. 密钥交换
 *    - 生成预主密钥
 *    - 使用服务器公钥加密
 *    - 发送给服务器
 */

/**
 * 5. 完成握手
 *    - 双方生成会话密钥
 *    - 发送Finished消息
 *    - 开始加密通信
 */
```

### 2.3 加密套件

```nginx
# 推荐的加密套件配置
ssl_protocols TLSv1.2 TLSv1.3;

ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

ssl_prefer_server_ciphers off;
```

**加密套件组成：**
```
ECDHE-RSA-AES256-GCM-SHA384
│     │   │      │   │
│     │   │      │   └── 消息认证码算法
│     │   │      └────── 加密模式
│     │   └───────────── 对称加密算法
│     └───────────────── 密钥交换算法
└─────────────────────── 认证算法
```

## 3. SSL证书类型

### 3.1 按验证级别分类

#### DV证书（域名验证）

```bash
# 特点
- 只验证域名所有权
- 签发最快(几分钟到几小时)
- 价格最低(免费-便宜)
- 适合个人网站和博客

# 获取方式
- Let's Encrypt (免费)
- ZeroSSL (免费)
- Cloudflare (免费)
```

#### OV证书（组织验证）

```bash
# 特点
- 验证域名和组织身份
- 签发需要1-3天
- 价格中等
- 适合企业网站

# 验证内容
- 域名所有权
- 组织合法性
- 联系人身份
```

#### EV证书（扩展验证）

```bash
# 特点
- 最严格的验证
- 签发需要1-2周
- 价格最高
- 浏览器地址栏显示公司名称
- 适合金融、电商等

# 验证内容
- 域名所有权
- 组织法律地位
- 实体存在
- 运营资格
```

### 3.2 按覆盖范围分类

#### 单域名证书

```bash
# 只保护一个域名
example.com
或
www.example.com
```

#### 通配符证书

```bash
# 保护主域名和所有一级子域名
*.example.com

# 保护范围
blog.example.com ✓
api.example.com ✓
www.example.com ✓
example.com ✗ (需要单独添加)
sub.blog.example.com ✗ (二级子域名不保护)
```

#### 多域名证书（SAN）

```bash
# 可以保护多个不同域名
example.com
www.example.com
blog.example.com
another-domain.com
```

## 4. Let's Encrypt免费证书

### 4.1 什么是Let's Encrypt

Let's Encrypt是一个免费、自动化、开放的证书颁发机构,提供免费的DV SSL证书。

**特点：**
- 完全免费
- 自动化签发和续期
- 支持通配符证书
- 90天有效期
- 广泛的浏览器支持

### 4.2 使用Certbot获取证书

#### 安装Certbot

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx

# 使用Snap(推荐)
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

#### 获取证书

```bash
# 方式1: Nginx插件(自动配置)
sudo certbot --nginx -d example.com -d www.example.com

# 方式2: Webroot(手动配置)
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d example.com \
  -d www.example.com

# 方式3: Standalone(临时服务器)
sudo certbot certonly --standalone \
  -d example.com \
  -d www.example.com

# 方式4: DNS验证(用于通配符证书)
sudo certbot certonly --manual \
  --preferred-challenges dns \
  -d example.com \
  -d '*.example.com'
```

#### 证书文件位置

```bash
/etc/letsencrypt/live/example.com/
├── cert.pem          # 服务器证书
├── chain.pem         # 证书链
├── fullchain.pem     # 完整证书链(cert.pem + chain.pem)
└── privkey.pem       # 私钥
```

### 4.3 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# 手动续期
sudo certbot renew

# 自动续期(Cron)
# 编辑crontab
sudo crontab -e

# 添加定时任务(每天检查)
0 0 * * * /usr/bin/certbot renew --quiet

# 或每周检查
0 0 * * 0 /usr/bin/certbot renew --quiet
```

```bash
# Systemd定时器(推荐)
sudo systemctl status certbot.timer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 4.4 续期Hooks

```bash
# 续期前执行
certbot renew --pre-hook "systemctl stop nginx"

# 续期后执行
certbot renew --post-hook "systemctl start nginx"

# 续期成功后执行
certbot renew --deploy-hook "systemctl reload nginx"

# 完整示例
certbot renew \
  --pre-hook "echo 'Starting renewal'" \
  --post-hook "echo 'Renewal complete'" \
  --deploy-hook "systemctl reload nginx"
```

## 5. Nginx配置HTTPS

### 5.1 基础HTTPS配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    # HTTP重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    # SSL证书
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    
    # SSL会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    
    # DNS解析器
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # 网站配置
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 5.2 完整的安全配置

```nginx
# 包含通用SSL配置
# /etc/nginx/snippets/ssl-params.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;

ssl_session_cache shared:SSL:50m;
ssl_session_timeout 1d;
ssl_session_tickets off;

ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# 安全Headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

```nginx
# 主配置使用
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    include snippets/ssl-params.conf;
    
    # 其他配置...
}
```

### 5.3 HTTP/2配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL配置
    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    
    # HTTP/2特定配置
    http2_push_preload on;
    
    location / {
        # 推送关键资源
        add_header Link "</css/style.css>; rel=preload; as=style";
        add_header Link "</js/app.js>; rel=preload; as=script";
    }
}
```

## 6. Node.js/Express配置HTTPS

### 6.1 使用内置HTTPS模块

```typescript
// server.ts
import https from 'https';
import fs from 'fs';
import express from 'express';

const app = express();

// 读取证书
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem')
};

// 创建HTTPS服务器
const httpsServer = https.createServer(options, app);

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

// HTTP重定向到HTTPS
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, {
    'Location': 'https://' + req.headers.host + req.url
  });
  res.end();
}).listen(80);
```

### 6.2 使用Helmet增强安全性

```typescript
import express from 'express';
import helmet from 'helmet';

const app = express();

// 使用Helmet设置安全Headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  frameguard: {
    action: 'deny'
  }
}));

// 强制HTTPS
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
});
```

## 7. 前端HTTPS最佳实践

### 7.1 混合内容问题

```tsx
// ❌ 混合内容(HTTPS页面加载HTTP资源)
<img src="http://example.com/image.jpg" />
<script src="http://cdn.example.com/script.js"></script>

// ✅ 使用HTTPS
<img src="https://example.com/image.jpg" />
<script src="https://cdn.example.com/script.js"></script>

// ✅ 使用协议相对URL
<img src="//example.com/image.jpg" />

// ✅ 动态检测
function getSecureUrl(url: string): string {
  if (window.location.protocol === 'https:') {
    return url.replace('http:', 'https:');
  }
  return url;
}
```

### 7.2 HSTS预加载

```html
<!-- 添加到<head>标签 -->
<link rel="preload" href="https://example.com" as="document">
```

```typescript
// 检查HSTS状态
async function checkHSTS() {
  const response = await fetch('https://example.com');
  const hsts = response.headers.get('strict-transport-security');
  console.log('HSTS Header:', hsts);
}
```

### 7.3 升级不安全请求

```html
<!-- 通过Meta标签 -->
<meta http-equiv="Content-Security-Policy" 
      content="upgrade-insecure-requests">
```

```nginx
# 通过HTTP响应头
add_header Content-Security-Policy "upgrade-insecure-requests" always;
```

## 8. 证书监控和管理

### 8.1 证书过期检查

```bash
# 检查证书有效期
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -dates

# 输出示例
notBefore=Jan 1 00:00:00 2024 GMT
notAfter=Apr 1 00:00:00 2024 GMT

# 检查剩余天数
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -checkend 2592000

# 如果证书在30天内过期,返回1
```

### 8.2 自动监控脚本

```bash
#!/bin/bash
# check-cert.sh

DOMAIN="example.com"
WARNING_DAYS=30

# 获取过期日期
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)

# 转换为时间戳
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
NOW_TIMESTAMP=$(date +%s)

# 计算剩余天数
DAYS_LEFT=$(( ($EXPIRY_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))

echo "证书剩余天数: $DAYS_LEFT"

if [ $DAYS_LEFT -lt $WARNING_DAYS ]; then
    echo "警告: 证书即将过期!"
    # 发送告警邮件或通知
    mail -s "SSL证书即将过期" admin@example.com <<< "证书将在${DAYS_LEFT}天后过期"
fi
```

### 8.3 证书信息检查

```bash
# 查看完整证书信息
openssl s_client -showcerts -servername example.com -connect example.com:443 </dev/null

# 查看证书详细信息
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -text -noout

# 检查证书链
openssl s_client -showcerts -connect example.com:443 </dev/null 2>/dev/null | awk '/BEGIN/,/END/{print}' | openssl x509 -noout -subject -issuer

# 验证证书
openssl verify -CAfile /etc/letsencrypt/live/example.com/chain.pem /etc/letsencrypt/live/example.com/cert.pem
```

## 9. 性能优化

### 9.1 SSL会话复用

```nginx
# 会话缓存
ssl_session_cache shared:SSL:50m;
ssl_session_timeout 1d;

# 会话票据
ssl_session_tickets off;  # 推荐关闭以提高安全性
```

### 9.2 OCSP Stapling

```nginx
# 启用OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /path/to/chain.pem;

# 设置解析器
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

### 9.3 HTTP/2服务器推送

```nginx
server {
    listen 443 ssl http2;
    
    location / {
        # Server Push
        http2_push /css/style.css;
        http2_push /js/app.js;
        http2_push /images/logo.png;
    }
}
```

## 10. 安全检查工具

### 10.1 在线检测工具

```bash
# SSL Labs测试
https://www.ssllabs.com/ssltest/

# Mozilla Observatory
https://observatory.mozilla.org/

# Security Headers
https://securityheaders.com/
```

### 10.2 命令行工具

```bash
# testssl.sh
git clone --depth 1 https://github.com/drwetter/testssl.sh.git
cd testssl.sh
./testssl.sh example.com

# nmap
nmap --script ssl-enum-ciphers -p 443 example.com

# sslyze
pip install sslyze
sslyze --regular example.com:443
```

### 10.3 持续监控

```typescript
// 使用Node.js监控证书
import https from 'https';
import tls from 'tls';

async function checkCertificate(hostname: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      host: hostname,
      port: 443,
      method: 'GET',
      rejectUnauthorized: true
    };
    
    const req = https.get(options, (res) => {
      const cert = (res.socket as tls.TLSSocket).getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error('无法获取证书'));
        return;
      }
      
      const validTo = new Date(cert.valid_to);
      const daysLeft = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      console.log(`证书信息:`);
      console.log(`- 域名: ${cert.subject.CN}`);
      console.log(`- 颁发者: ${cert.issuer.O}`);
      console.log(`- 有效期至: ${cert.valid_to}`);
      console.log(`- 剩余天数: ${daysLeft}`);
      
      if (daysLeft < 30) {
        console.warn('⚠️  证书即将过期!');
      }
      
      resolve();
    });
    
    req.on('error', reject);
    req.end();
  });
}

// 使用
checkCertificate('example.com');
```

## 11. 故障排除

### 11.1 常见问题

```bash
# 问题1: 证书不受信任
# 原因: 证书链不完整
# 解决: 使用fullchain.pem而非cert.pem

ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;

# 问题2: 混合内容错误
# 原因: HTTPS页面加载HTTP资源
# 解决: 确保所有资源使用HTTPS

# 问题3: 证书域名不匹配
# 原因: 访问的域名与证书不符
# 解决: 确保证书包含所有需要的域名

# 问题4: 证书过期
# 原因: 未及时续期
# 解决: 设置自动续期

# 问题5: SSL握手失败
# 原因: 协议或加密套件不兼容
# 解决: 更新SSL配置
```

### 11.2 调试技巧

```bash
# 查看SSL握手详情
openssl s_client -connect example.com:443 -servername example.com -showcerts

# 测试特定协议
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3

# 测试特定加密套件
openssl s_client -connect example.com:443 -cipher 'ECDHE-RSA-AES128-GCM-SHA256'

# 查看Nginx配置
nginx -t
nginx -T

# 查看日志
tail -f /var/log/nginx/error.log
```

## 12. 最佳实践总结

### 12.1 证书管理

- [ ] 使用自动续期
- [ ] 监控证书过期
- [ ] 使用通配符证书(如需)
- [ ] 定期更新证书
- [ ] 备份证书和私钥

### 12.2 配置安全

- [ ] 只使用TLS 1.2和1.3
- [ ] 使用强加密套件
- [ ] 启用HSTS
- [ ] 配置OCSP Stapling
- [ ] 实施HTTP到HTTPS重定向

### 12.3 性能优化

- [ ] 启用HTTP/2
- [ ] 配置SSL会话缓存
- [ ] 使用CDN分发
- [ ] 实施资源预加载
- [ ] 优化证书链

### 12.4 监控维护

- [ ] 定期检查证书状态
- [ ] 使用SSL Labs测试
- [ ] 监控SSL/TLS错误
- [ ] 审查安全headers
- [ ] 更新最佳实践

## 13. 总结

HTTPS和SSL证书的关键要点:

1. **全站HTTPS**: 确保所有页面和资源使用HTTPS
2. **自动续期**: 使用Let's Encrypt和Certbot自动管理证书
3. **安全配置**: 使用最新的TLS协议和强加密套件
4. **性能优化**: 启用HTTP/2和会话复用
5. **持续监控**: 监控证书状态和安全配置

通过正确实施HTTPS,可以确保数据传输安全,提升用户信任,改善SEO排名。

