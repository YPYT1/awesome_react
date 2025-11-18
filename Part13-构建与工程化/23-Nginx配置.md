# Nginx 配置 - 前端应用部署与优化

## 1. Nginx 简介

### 1.1 什么是 Nginx

Nginx 是一个高性能的 HTTP 和反向代理服务器，也是一个 IMAP/POP3/SMTP 代理服务器。它以事件驱动的异步架构闻名，能够处理大量并发连接。

**核心特性：**

- **高性能**：事件驱动、异步非阻塞架构
- **反向代理**：负载均衡、缓存、SSL 终止
- **静态文件服务**：高效的文件服务能力
- **URL 重写**：灵活的路由规则
- **Gzip 压缩**：自动压缩响应内容
- **负载均衡**：多种均衡策略

### 1.2 为什么使用 Nginx

**优势：**

1. **性能优异**：单机可处理数万并发
2. **资源占用低**：内存占用少，CPU 利用率高
3. **配置灵活**：强大的配置系统
4. **高可用性**：稳定可靠，支持热部署
5. **丰富的模块**：扩展功能丰富

### 1.3 适用场景

```
✓ 静态文件服务器
✓ 反向代理服务器
✓ 负载均衡器
✓ API 网关
✓ SSL/TLS 终止
✓ HTTP 缓存
```

## 2. 安装与基础配置

### 2.1 安装 Nginx

#### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装 Nginx
sudo apt install nginx

# 启动 Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 查看状态
sudo systemctl status nginx
```

#### CentOS/RHEL

```bash
# 安装 Nginx
sudo yum install nginx

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### macOS

```bash
# 使用 Homebrew
brew install nginx

# 启动服务
brew services start nginx
```

#### 使用 Docker

```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:alpine
```

### 2.2 目录结构

```bash
# 主要目录
/etc/nginx/                 # 配置文件目录
├── nginx.conf             # 主配置文件
├── conf.d/                # 子配置文件目录
│   └── default.conf       # 默认站点配置
├── sites-available/       # 可用站点配置
├── sites-enabled/         # 已启用站点配置
└── mime.types            # MIME 类型定义

/var/log/nginx/            # 日志目录
├── access.log            # 访问日志
└── error.log             # 错误日志

/usr/share/nginx/html/     # 默认网站根目录
/var/www/html/            # 替代网站根目录
```

### 2.3 基本命令

```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload

# 停止服务
nginx -s stop

# 优雅停止
nginx -s quit

# 重新打开日志文件
nginx -s reopen

# 查看版本
nginx -v
nginx -V  # 详细信息
```

## 3. React 应用配置

### 3.1 基础 SPA 配置

```nginx
# /etc/nginx/conf.d/react-app.conf

server {
    listen 80;
    server_name example.com www.example.com;
    
    root /var/www/react-app;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

### 3.2 完整的生产配置

```nginx
# /etc/nginx/conf.d/react-app.conf

server {
    listen 80;
    server_name example.com www.example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    # SSL 证书
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 网站根目录
    root /var/www/react-app;
    index index.html;
    
    # 字符集
    charset utf-8;
    
    # 日志
    access_log /var/log/nginx/react-app.access.log;
    error_log /var/log/nginx/react-app.error.log;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
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
    
    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # index.html 不缓存
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # service-worker.js 不缓存
    location = /service-worker.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # 安全 headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.example.com;" always;
}
```

### 3.3 多环境配置

```nginx
# 开发环境
server {
    listen 80;
    server_name dev.example.com;
    
    root /var/www/react-app-dev;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 开发环境允许 CORS
    add_header Access-Control-Allow-Origin "*" always;
}

# 测试环境
server {
    listen 80;
    server_name staging.example.com;
    
    root /var/www/react-app-staging;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 基本认证保护
    auth_basic "Staging Environment";
    auth_basic_user_file /etc/nginx/.htpasswd;
}

# 生产环境（已在上面配置）
```

## 4. 反向代理配置

### 4.1 代理到后端 API

```nginx
server {
    listen 80;
    server_name example.com;
    
    root /var/www/react-app;
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # 代理 headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 图片上传代理
    location /upload {
        client_max_body_size 10M;
        proxy_pass http://localhost:3000/upload;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4.2 负载均衡

```nginx
# 定义上游服务器组
upstream backend {
    # 负载均衡策略：轮询（默认）
    server backend1.example.com:3000;
    server backend2.example.com:3000;
    server backend3.example.com:3000;
    
    # 备用服务器
    server backup.example.com:3000 backup;
    
    # 健康检查
    keepalive 32;
}

# IP Hash 策略
upstream backend_ip_hash {
    ip_hash;
    server backend1.example.com:3000;
    server backend2.example.com:3000;
}

# 最少连接策略
upstream backend_least_conn {
    least_conn;
    server backend1.example.com:3000;
    server backend2.example.com:3000;
}

# 权重策略
upstream backend_weighted {
    server backend1.example.com:3000 weight=3;
    server backend2.example.com:3000 weight=2;
    server backend3.example.com:3000 weight=1;
}

server {
    listen 80;
    server_name example.com;
    
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4.3 微服务路由

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    # 用户服务
    location /users {
        proxy_pass http://user-service:8001;
        proxy_set_header Host $host;
    }
    
    # 订单服务
    location /orders {
        proxy_pass http://order-service:8002;
        proxy_set_header Host $host;
    }
    
    # 产品服务
    location /products {
        proxy_pass http://product-service:8003;
        proxy_set_header Host $host;
    }
    
    # 支付服务
    location /payments {
        proxy_pass http://payment-service:8004;
        proxy_set_header Host $host;
        
        # 增加超时时间
        proxy_read_timeout 120s;
    }
}
```

## 5. 缓存配置

### 5.1 静态资源缓存

```nginx
server {
    listen 80;
    server_name example.com;
    
    root /var/www/react-app;
    
    # 长期缓存的资源
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # CSS 和 JS 文件
    location ~* \.(css|js)$ {
        expires 1M;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # 字体文件
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 5.2 代理缓存

```nginx
# 缓存路径配置
proxy_cache_path /var/cache/nginx/api
    levels=1:2
    keys_zone=api_cache:10m
    max_size=1g
    inactive=60m
    use_temp_path=off;

server {
    listen 80;
    server_name example.com;
    
    location /api {
        proxy_pass http://backend;
        
        # 启用缓存
        proxy_cache api_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_valid 404 1m;
        
        # 缓存键
        proxy_cache_key "$scheme$request_method$host$request_uri";
        
        # 缓存控制
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
        
        # 过期后在后台更新
        proxy_cache_background_update on;
        proxy_cache_revalidate on;
        
        # 使用过期缓存
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        
        # 锁定
        proxy_cache_lock on;
        proxy_cache_lock_timeout 5s;
    }
}
```

### 5.3 FastCGI 缓存

```nginx
fastcgi_cache_path /var/cache/nginx/fastcgi
    levels=1:2
    keys_zone=fastcgi_cache:100m
    inactive=60m;

server {
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        
        # 启用 FastCGI 缓存
        fastcgi_cache fastcgi_cache;
        fastcgi_cache_valid 200 60m;
        fastcgi_cache_key "$scheme$request_method$host$request_uri";
        
        add_header X-FastCGI-Cache $upstream_cache_status;
    }
}
```

## 6. SSL/TLS 配置

### 6.1 基础 HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL 证书
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # SSL 协议
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # SSL 密码套件
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    
    # SSL 会话
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    root /var/www/react-app;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 6.2 Let's Encrypt 配置

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    
    # ACME 挑战
    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/letsencrypt;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # 其他配置...
}
```

```bash
# 获取证书
certbot certonly --webroot \
    -w /var/www/letsencrypt \
    -d example.com \
    -d www.example.com

# 自动续期
certbot renew --dry-run
```

### 6.3 OCSP Stapling

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/ca-certs.pem;
    
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
}
```

## 7. 性能优化

### 7.1 连接优化

```nginx
# 全局配置
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # TCP 优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # 超时设置
    keepalive_timeout 65;
    keepalive_requests 100;
    client_header_timeout 12;
    client_body_timeout 12;
    send_timeout 10;
    
    # 缓冲区大小
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
}
```

### 7.2 压缩优化

```nginx
http {
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
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
    
    # Brotli 压缩（需要安装模块）
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss;
}
```

### 7.3 缓冲和限制

```nginx
http {
    # 连接限制
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_conn addr 100;
    
    # 请求速率限制
    limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
    limit_req zone=one burst=20 nodelay;
    
    # 文件缓存
    open_file_cache max=10000 inactive=30s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

## 8. 安全配置

### 8.1 基础安全

```nginx
server {
    # 隐藏 Nginx 版本
    server_tokens off;
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 禁止执行 PHP
    location ~* \.(php|phtml)$ {
        deny all;
    }
    
    # 限制请求方法
    if ($request_method !~ ^(GET|HEAD|POST)$ ) {
        return 405;
    }
    
    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # XSS 保护
    add_header X-XSS-Protection "1; mode=block" always;
    
    # MIME 类型嗅探保护
    add_header X-Content-Type-Options "nosniff" always;
}
```

### 8.2 访问控制

```nginx
server {
    # IP 白名单
    location /admin {
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;
        
        try_files $uri $uri/ /index.html;
    }
    
    # 基本认证
    location /private {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        try_files $uri $uri/ /index.html;
    }
    
    # 地理位置限制
    location / {
        if ($geoip_country_code ~ (CN|US|GB)) {
            return 403;
        }
    }
}
```

### 8.3 防 DDoS

```nginx
http {
    # 连接限制
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_conn_zone $server_name zone=perserver:10m;
    
    # 请求限制
    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=5r/s;
    
    server {
        # 应用限制
        limit_conn addr 10;
        limit_conn perserver 1000;
        limit_req zone=req_limit_per_ip burst=10 nodelay;
        
        # 超时保护
        client_body_timeout 10s;
        client_header_timeout 10s;
        
        # 慢速攻击防护
        send_timeout 10s;
    }
}
```

## 9. 日志管理

### 9.1 日志配置

```nginx
http {
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    # JSON 日志格式
    log_format json escape=json
        '{'
            '"time_local":"$time_local",'
            '"remote_addr":"$remote_addr",'
            '"request":"$request",'
            '"status":$status,'
            '"body_bytes_sent":$body_bytes_sent,'
            '"http_referer":"$http_referer",'
            '"http_user_agent":"$http_user_agent",'
            '"request_time":$request_time,'
            '"upstream_response_time":"$upstream_response_time"'
        '}';
    
    # 访问日志
    access_log /var/log/nginx/access.log main;
    
    # 错误日志级别
    error_log /var/log/nginx/error.log warn;
    
    server {
        # 站点特定日志
        access_log /var/log/nginx/example.com.access.log json;
        error_log /var/log/nginx/example.com.error.log;
        
        # 禁用特定 location 的日志
        location /health {
            access_log off;
            return 200 "OK\n";
        }
    }
}
```

### 9.2 日志轮转

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

## 10. 监控和调试

### 10.1 状态监控

```nginx
server {
    listen 8080;
    server_name localhost;
    
    # Nginx 状态
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 10.2 调试配置

```nginx
# 启用调试日志
error_log /var/log/nginx/debug.log debug;

server {
    # 调试特定请求
    location /api {
        error_log /var/log/nginx/api-debug.log debug;
        proxy_pass http://backend;
    }
}
```

## 11. Docker 中的 Nginx

### 11.1 Dockerfile

```dockerfile
FROM nginx:alpine

# 复制配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# 复制静态文件
COPY dist/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80 443

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 11.2 docker-compose.yml

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./dist:/usr/share/nginx/html:ro
      - ./ssl:/etc/nginx/ssl:ro
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## 12. 最佳实践

### 12.1 配置组织

```bash
# 模块化配置结构
/etc/nginx/
├── nginx.conf              # 主配置
├── conf.d/                 # 站点配置
│   ├── example.com.conf
│   └── api.example.com.conf
├── snippets/               # 可复用配置片段
│   ├── ssl-params.conf
│   ├── security-headers.conf
│   └── gzip.conf
└── sites-available/        # 可用站点
    └── sites-enabled/      # 已启用站点
```

```nginx
# snippets/security-headers.conf
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# 在主配置中引用
server {
    include snippets/security-headers.conf;
}
```

### 12.2 性能检查清单

- [ ] 启用 Gzip 压缩
- [ ] 配置静态资源缓存
- [ ] 使用 HTTP/2
- [ ] 启用 keepalive
- [ ] 优化 worker 进程数
- [ ] 配置代理缓存
- [ ] 使用 sendfile
- [ ] 调整缓冲区大小

### 12.3 安全检查清单

- [ ] 隐藏 Nginx 版本号
- [ ] 配置 SSL/TLS
- [ ] 添加安全 headers
- [ ] 限制请求速率
- [ ] 配置访问控制
- [ ] 禁止访问敏感文件
- [ ] 使用最新版本

## 13. 故障排除

### 13.1 常见问题

```bash
# 配置测试失败
nginx -t  # 查看详细错误信息

# 端口被占用
sudo lsof -i :80
sudo netstat -tuln | grep :80

# 权限问题
sudo chown -R www-data:www-data /var/www/
sudo chmod -R 755 /var/www/

# 日志查看
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 13.2 性能调优

```bash
# 查看连接数
netstat -an | grep :80 | wc -l

# 查看进程状态
ps aux | grep nginx

# 监控资源使用
top -p $(pgrep nginx | tr '\n' ',' | sed 's/,$//')
```

## 14. 总结

Nginx 为前端应用提供了：

1. **高性能服务**：静态文件服务和反向代理
2. **灵活配置**：丰富的配置选项
3. **安全保障**：SSL/TLS、访问控制、安全 headers
4. **缓存优化**：多层缓存策略
5. **负载均衡**：多种均衡算法

通过合理配置 Nginx，可以显著提升应用的性能和安全性。

