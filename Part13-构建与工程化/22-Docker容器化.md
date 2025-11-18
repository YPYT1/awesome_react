# Docker 容器化 - 前端应用容器化实战

## 1. Docker 简介

### 1.1 什么是 Docker

Docker 是一个开源的容器化平台，可以将应用程序及其依赖打包到一个可移植的容器中，确保应用在任何环境中都能以相同的方式运行。

**核心概念：**

- **镜像（Image）**：应用程序的只读模板
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：构建镜像的指令文件
- **仓库（Registry）**：存储和分发镜像的服务
- **Docker Compose**：定义和运行多容器应用

### 1.2 为什么使用 Docker

**优势：**

1. **环境一致性**：开发、测试、生产环境完全一致
2. **快速部署**：秒级启动，快速扩展
3. **资源隔离**：每个容器独立运行，互不干扰
4. **版本管理**：镜像版本化，易于回滚
5. **跨平台**：在任何支持 Docker 的平台运行

### 1.3 适用场景

```
✓ 微服务架构
✓ CI/CD 流水线
✓ 多环境部署
✓ 开发环境标准化
✓ 应用快速交付
```

## 2. Docker 基础

### 2.1 安装 Docker

#### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到 docker 组
sudo usermod -aG docker $USER
```

#### macOS

```bash
# 使用 Homebrew
brew install --cask docker

# 或下载 Docker Desktop
https://www.docker.com/products/docker-desktop
```

#### Windows

```bash
# 下载 Docker Desktop for Windows
https://www.docker.com/products/docker-desktop

# 启用 WSL 2（推荐）
wsl --install
```

#### 验证安装

```bash
docker --version
docker run hello-world
```

### 2.2 基本命令

```bash
# 镜像操作
docker images                    # 列出本地镜像
docker pull <image>              # 拉取镜像
docker build -t <name> .         # 构建镜像
docker rmi <image>               # 删除镜像
docker tag <image> <new-name>    # 标记镜像

# 容器操作
docker ps                        # 列出运行中的容器
docker ps -a                     # 列出所有容器
docker run <image>               # 运行容器
docker start <container>         # 启动容器
docker stop <container>          # 停止容器
docker restart <container>       # 重启容器
docker rm <container>            # 删除容器
docker exec -it <container> sh   # 进入容器

# 日志和监控
docker logs <container>          # 查看日志
docker logs -f <container>       # 实时日志
docker stats                     # 查看资源使用
docker inspect <container>       # 查看详细信息

# 清理
docker system prune              # 清理未使用的数据
docker volume prune              # 清理未使用的卷
docker network prune             # 清理未使用的网络
```

## 3. Dockerfile 编写

### 3.1 基础 Dockerfile

#### 单阶段构建

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
```

#### 使用示例

```bash
# 构建镜像
docker build -t my-react-app .

# 运行容器
docker run -p 3000:3000 my-react-app

# 访问应用
http://localhost:3000
```

### 3.2 多阶段构建（推荐）

```dockerfile
# Dockerfile - 多阶段构建
# 阶段 1: 构建
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 阶段 2: 生产环境
FROM nginx:alpine

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**优势：**
- 减小镜像大小（只包含运行时需要的文件）
- 提高安全性（不包含构建工具）
- 加快部署速度

### 3.3 优化的 Dockerfile

```dockerfile
# Dockerfile - 优化版本
FROM node:18-alpine AS builder

# 安装必要的构建工具
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 利用缓存层，先复制依赖文件
COPY package.json package-lock.json ./

# 使用 npm ci 进行确定性安装
RUN npm ci --only=production && \
    npm cache clean --force

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 添加非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置正确的权限
RUN chown -R nodejs:nodejs /usr/share/nginx/html && \
    chown -R nodejs:nodejs /var/cache/nginx && \
    chown -R nodejs:nodejs /var/log/nginx && \
    chown -R nodejs:nodejs /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
    chown -R nodejs:nodejs /var/run/nginx.pid

# 切换到非 root 用户
USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### 3.4 .dockerignore

```bash
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
.env.*.local
dist
build
coverage
.DS_Store
*.log
.vscode
.idea
README.md
```

## 4. React 应用容器化

### 4.1 Vite + React

#### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # SPA 路由支持
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location /assets {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 代理（可选）
        location /api {
            proxy_pass http://backend:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 安全 headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

#### 构建和运行

```bash
# 构建镜像
docker build -t my-vite-app .

# 运行容器
docker run -d \
  --name my-app \
  -p 8080:80 \
  --restart unless-stopped \
  my-vite-app

# 查看日志
docker logs -f my-app

# 停止并删除
docker stop my-app
docker rm my-app
```

### 4.2 Next.js 应用

```dockerfile
# Dockerfile - Next.js
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'],
  },
};

module.exports = nextConfig;
```

### 4.3 开发环境容器

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

```bash
# 运行开发容器
docker run -d \
  -p 5173:5173 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --name dev-app \
  my-app:dev
```

## 5. Docker Compose

### 5.1 基础配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 5.2 全栈应用配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端应用
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3000
    networks:
      - app-network
    restart: unless-stopped

  # 后端 API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    networks:
      - app-network
    restart: unless-stopped

  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    networks:
      - app-network
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  db-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### 5.3 开发环境配置

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:3000
    command: npm run dev -- --host 0.0.0.0

  api:
    build:
      context: ./api
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./api:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

```bash
# 使用开发配置启动
docker-compose -f docker-compose.dev.yml up
```

## 6. 镜像优化

### 6.1 减小镜像大小

#### 使用 Alpine 基础镜像

```dockerfile
# 使用更小的基础镜像
FROM node:18-alpine  # ~40MB
# 而不是
FROM node:18         # ~900MB
```

#### 多阶段构建

```dockerfile
# 只包含运行时需要的文件
FROM node:18-alpine AS build
# ... 构建步骤

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# 最终镜像只有 ~20MB
```

#### 清理缓存

```dockerfile
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*
```

### 6.2 利用缓存层

```dockerfile
# 先复制依赖文件（变化少）
COPY package*.json ./
RUN npm ci

# 再复制源代码（变化多）
COPY . .
RUN npm run build
```

### 6.3 并行构建

```dockerfile
# 使用 BuildKit
# docker build --build-arg BUILDKIT_INLINE_CACHE=1 .

FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

## 7. 安全最佳实践

### 7.1 使用非 root 用户

```dockerfile
FROM nginx:alpine

# 创建用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置权限
RUN chown -R nodejs:nodejs /usr/share/nginx/html

# 切换用户
USER nodejs

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 7.2 扫描漏洞

```bash
# 使用 Trivy 扫描镜像
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image my-app:latest

# 使用 Docker Scan
docker scan my-app:latest

# 使用 Snyk
snyk container test my-app:latest
```

### 7.3 secrets 管理

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: my-app
    secrets:
      - db_password
      - api_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - API_KEY_FILE=/run/secrets/api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    file: ./secrets/api_key.txt
```

## 8. CI/CD 集成

### 8.1 GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main
            docker-compose up -d
```

### 8.2 GitLab CI

```yaml
# .gitlab-ci.yml
image: docker:latest

services:
  - docker:dind

variables:
  DOCKER_DRIVER: overlay2
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG

test:
  stage: test
  script:
    - docker run --rm $IMAGE_TAG npm test

deploy:
  stage: deploy
  only:
    - main
  script:
    - docker pull $IMAGE_TAG
    - docker-compose up -d
```

## 9. 监控和日志

### 9.1 容器监控

```yaml
# docker-compose.yml with monitoring
version: '3.8'

services:
  app:
    image: my-app
    # ...

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"

volumes:
  prometheus-data:
  grafana-data:
```

### 9.2 集中日志

```yaml
# docker-compose.yml with logging
version: '3.8'

services:
  app:
    image: my-app
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.7.0
    environment:
      - discovery.type=single-node

  logstash:
    image: docker.elastic.co/logstash/logstash:8.7.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.7.0
    ports:
      - "5601:5601"
```

## 10. 常见问题与解决方案

### 10.1 端口冲突

```bash
# 查看端口占用
lsof -i :3000
netstat -tuln | grep 3000

# 使用不同的端口
docker run -p 3001:3000 my-app
```

### 10.2 权限问题

```dockerfile
# 使用正确的用户权限
RUN chown -R node:node /app
USER node
```

### 10.3 网络问题

```bash
# 检查网络
docker network ls
docker network inspect bridge

# 创建自定义网络
docker network create my-network

# 使用自定义网络
docker run --network my-network my-app
```

### 10.4 卷挂载问题

```bash
# 检查卷
docker volume ls
docker volume inspect my-volume

# 清理未使用的卷
docker volume prune
```

## 11. 最佳实践总结

### 11.1 Dockerfile 最佳实践

- [ ] 使用官方基础镜像
- [ ] 使用多阶段构建
- [ ] 利用缓存层优化构建速度
- [ ] 使用 .dockerignore 排除不必要的文件
- [ ] 以非 root 用户运行
- [ ] 设置健康检查
- [ ] 使用明确的镜像标签

### 11.2 安全最佳实践

- [ ] 定期更新基础镜像
- [ ] 扫描镜像漏洞
- [ ] 使用 secrets 管理敏感信息
- [ ] 限制容器资源
- [ ] 使用只读文件系统

### 11.3 性能优化

- [ ] 减小镜像大小
- [ ] 启用 BuildKit
- [ ] 使用缓存
- [ ] 并行构建
- [ ] 优化层顺序

## 12. 总结

Docker 容器化为前端应用提供了：

1. **环境一致性**：消除"在我机器上能跑"的问题
2. **快速部署**：标准化的部署流程
3. **易于扩展**：水平扩展变得简单
4. **版本管理**：镜像版本化，易于回滚
5. **资源隔离**：安全可靠的运行环境

通过合理使用 Docker，可以大幅提升应用的可移植性和部署效率。

