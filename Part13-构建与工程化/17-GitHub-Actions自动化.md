# GitHub Actions 自动化 - CI/CD 实战指南

## 1. GitHub Actions 简介

### 1.1 什么是 GitHub Actions

GitHub Actions 是 GitHub 提供的持续集成和持续部署（CI/CD）平台，允许你自动化构建、测试和部署流程。它直接集成在 GitHub 仓库中，无需第三方服务。

**核心概念：**

- **Workflow（工作流）**：自动化流程的定义文件
- **Job（作业）**：工作流中的一组步骤
- **Step（步骤）**：作业中的单个任务
- **Action（动作）**：可重用的步骤单元
- **Runner（运行器）**：执行作业的服务器
- **Event（事件）**：触发工作流的事件

### 1.2 为什么选择 GitHub Actions

**优势：**

1. **原生集成**：与 GitHub 无缝集成，无需额外配置
2. **免费额度**：公开仓库无限使用，私有仓库每月 2000 分钟
3. **丰富的生态**：GitHub Marketplace 提供数千个可复用的 Actions
4. **灵活配置**：支持矩阵构建、条件执行、并行作业
5. **多平台支持**：Linux、Windows、macOS 运行器

**与其他 CI/CD 工具对比：**

```yaml
# GitHub Actions 特点
- 无需第三方服务
- YAML 配置简洁
- 丰富的 Actions 市场
- 容器原生支持

# Jenkins 特点
- 自托管，完全控制
- 强大的插件系统
- 学习曲线陡峭

# GitLab CI/CD 特点
- 需要使用 GitLab
- 配置相似
- 功能全面

# Travis CI 特点
- 历史悠久
- 配置简单
- 收费模式
```

### 1.3 适用场景

1. **自动化测试**：每次提交自动运行测试
2. **自动化部署**：通过测试后自动部署到生产环境
3. **代码质量检查**：自动运行 lint、格式检查
4. **发布管理**：自动创建发布、生成变更日志
5. **定时任务**：定期执行特定任务

## 2. 基础配置

### 2.1 创建第一个工作流

在仓库中创建 `.github/workflows/` 目录和工作流文件：

```yaml
# .github/workflows/ci.yml
name: CI

# 触发条件
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# 作业定义
jobs:
  build:
    # 运行器环境
    runs-on: ubuntu-latest
    
    # 步骤列表
    steps:
      # 检出代码
      - uses: actions/checkout@v4
      
      # 设置 Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      # 安装依赖
      - name: Install dependencies
        run: npm ci
      
      # 运行测试
      - name: Run tests
        run: npm test
      
      # 构建项目
      - name: Build
        run: npm run build
```

### 2.2 工作流语法

#### 基本结构

```yaml
name: Workflow Name          # 工作流名称

on:                          # 触发事件
  push:
  pull_request:

env:                         # 环境变量
  NODE_ENV: production

jobs:                        # 作业列表
  job1:
    runs-on: ubuntu-latest   # 运行器
    steps:                   # 步骤列表
      - name: Step 1
        run: echo "Hello"
```

#### 触发事件

```yaml
# 推送事件
on:
  push:
    branches:
      - main
      - 'release/**'
    tags:
      - v*
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'

# 拉取请求
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main

# 定时任务（cron）
on:
  schedule:
    - cron: '0 0 * * *'  # 每天午夜执行

# 手动触发
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

# 多个事件
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1'
```

#### 作业配置

```yaml
jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    # 运行条件
    if: github.event_name == 'push'
    
    # 环境变量
    env:
      NODE_ENV: production
    
    # 输出
    outputs:
      build-id: ${{ steps.build.outputs.id }}
    
    # 依赖其他作业
    needs: [test]
    
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
        id: build
```

### 2.3 使用 Actions

#### 官方 Actions

```yaml
steps:
  # 检出代码
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0
      submodules: true
  
  # 设置 Node.js
  - uses: actions/setup-node@v4
    with:
      node-version: '18'
      cache: 'npm'
  
  # 设置 Python
  - uses: actions/setup-python@v5
    with:
      python-version: '3.11'
  
  # 缓存依赖
  - uses: actions/cache@v3
    with:
      path: ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-
  
  # 上传产物
  - uses: actions/upload-artifact@v3
    with:
      name: build-output
      path: dist/
  
  # 下载产物
  - uses: actions/download-artifact@v3
    with:
      name: build-output
      path: dist/
```

#### 社区 Actions

```yaml
steps:
  # 代码覆盖率上传
  - uses: codecov/codecov-action@v3
    with:
      token: ${{ secrets.CODECOV_TOKEN }}
      files: ./coverage/coverage-final.json
  
  # Slack 通知
  - uses: slackapi/slack-github-action@v1
    with:
      webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
      payload: |
        {
          "text": "Build completed!"
        }
  
  # Docker 构建和推送
  - uses: docker/build-push-action@v5
    with:
      context: .
      push: true
      tags: user/app:latest
```

## 3. React 项目 CI/CD

### 3.1 基础 CI 配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.node-version == '18'
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
  
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build production
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
          retention-days: 7
```

### 3.2 使用 pnpm

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
```

### 3.3 Monorepo 项目

```yaml
name: CI - Monorepo

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  changes:
    name: Detect changes
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v4
      
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            web:
              - 'apps/web/**'
            api:
              - 'apps/api/**'
            ui:
              - 'packages/ui/**'
  
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: changes
    if: ${{ needs.changes.outputs.packages != '[]' }}
    
    strategy:
      matrix:
        package: ${{ fromJSON(needs.changes.outputs.packages) }}
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Test ${{ matrix.package }}
        run: pnpm --filter ${{ matrix.package }} test
      
      - name: Build ${{ matrix.package }}
        run: pnpm --filter ${{ matrix.package }} build
```

### 3.4 使用 Nx

```yaml
name: CI - Nx

on: [push, pull_request]

jobs:
  main:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      
      - name: Derive appropriate SHAs for base and head
        uses: nrwl/nx-set-shas@v3
      
      - name: Run affected lint
        run: npx nx affected --target=lint --parallel=3
      
      - name: Run affected test
        run: npx nx affected --target=test --parallel=3 --ci --code-coverage
      
      - name: Run affected build
        run: npx nx affected --target=build --parallel=3
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
```

## 4. 自动化部署

### 4.1 部署到 Vercel

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 4.2 部署到 Netlify

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: 'Deploy from GitHub Actions'
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 4.3 部署到 GitHub Pages

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      
      - name: Build
        run: npm run build
        env:
          PUBLIC_URL: /my-repo
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### 4.4 部署到 AWS S3

```yaml
name: Deploy to AWS S3

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### 4.5 Docker 部署

```yaml
name: Build and Deploy Docker

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
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
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 5. 高级功能

### 5.1 矩阵构建

```yaml
name: Matrix Build

on: [push]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node-version: 20
            experimental: true
        exclude:
          - os: windows-latest
            node-version: 16
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - run: npm ci
      - run: npm test
```

### 5.2 条件执行

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # 只在主分支执行
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: npm run deploy:prod
      
      # 只在 PR 执行
      - name: Deploy to preview
        if: github.event_name == 'pull_request'
        run: npm run deploy:preview
      
      # 基于环境变量
      - name: Deploy to staging
        if: env.DEPLOY_ENV == 'staging'
        run: npm run deploy:staging
      
      # 基于步骤结果
      - name: Run tests
        id: test
        run: npm test
        continue-on-error: true
      
      - name: Upload logs
        if: failure() && steps.test.outcome == 'failure'
        uses: actions/upload-artifact@v3
        with:
          name: test-logs
          path: logs/
```

### 5.3 可重用工作流

#### 定义可重用工作流

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      environment:
        required: false
        type: string
        default: 'development'
    secrets:
      deploy-token:
        required: true
    outputs:
      build-id:
        description: "The build ID"
        value: ${{ jobs.build.outputs.build-id }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      build-id: ${{ steps.build.outputs.id }}
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      
      - run: npm ci
      
      - name: Build
        id: build
        run: |
          npm run build
          echo "id=$(date +%s)" >> $GITHUB_OUTPUT
        env:
          ENVIRONMENT: ${{ inputs.environment }}
```

#### 调用可重用工作流

```yaml
# .github/workflows/main.yml
name: Main Workflow

on: [push]

jobs:
  build-dev:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '18'
      environment: 'development'
    secrets:
      deploy-token: ${{ secrets.DEV_DEPLOY_TOKEN }}
  
  build-prod:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '18'
      environment: 'production'
    secrets:
      deploy-token: ${{ secrets.PROD_DEPLOY_TOKEN }}
```

### 5.4 复合 Actions

创建自定义复合 Action：

```yaml
# .github/actions/setup-project/action.yml
name: 'Setup Project'
description: 'Setup Node.js and install dependencies'

inputs:
  node-version:
    description: 'Node.js version'
    required: true
    default: '18'
  package-manager:
    description: 'Package manager (npm, pnpm, yarn)'
    required: false
    default: 'npm'

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: ${{ inputs.package-manager }}
    
    - name: Install dependencies
      shell: bash
      run: |
        if [ "${{ inputs.package-manager }}" == "pnpm" ]; then
          pnpm install --frozen-lockfile
        elif [ "${{ inputs.package-manager }}" == "yarn" ]; then
          yarn install --frozen-lockfile
        else
          npm ci
        fi
```

使用自定义 Action：

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup project
        uses: ./.github/actions/setup-project
        with:
          node-version: '18'
          package-manager: 'pnpm'
      
      - run: pnpm test
      - run: pnpm build
```

### 5.5 环境保护

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy:staging
  
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment:
      name: production
      url: https://example.com
    
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy:production
        env:
          DEPLOY_TOKEN: ${{ secrets.PROD_DEPLOY_TOKEN }}
```

## 6. 性能优化

### 6.1 依赖缓存

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # npm 缓存
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      
      # 自定义缓存
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - run: npm ci
```

### 6.2 构建产物缓存

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Cache build output
        uses: actions/cache@v3
        with:
          path: dist/
          key: ${{ runner.os }}-build-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-build-
      
      - run: npm ci
      - run: npm run build
```

### 6.3 并发控制

```yaml
# 取消正在运行的工作流
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
```

### 6.4 减少不必要的运行

```yaml
on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'package.json'
      - '.github/workflows/**'
  pull_request:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'docs/**'

jobs:
  build:
    # 跳过包含 [skip ci] 的提交
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
```

## 7. 安全最佳实践

### 7.1 密钥管理

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # 使用 GitHub Secrets
      - name: Deploy
        run: npm run deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      # 使用环境密钥
      - name: Deploy to production
        environment: production
        run: npm run deploy
        env:
          PROD_TOKEN: ${{ secrets.PROD_TOKEN }}
```

### 7.2 权限最小化

```yaml
name: CI

on: [push]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  test:
    runs-on: ubuntu-latest
    
    # 作业级别权限
    permissions:
      contents: read
      checks: write
    
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

### 7.3 依赖安全扫描

```yaml
jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'my-project'
          path: '.'
          format: 'HTML'
```

### 7.4 代码签名

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Import GPG key
        uses: crazy-max/ghaction-import-gpg@v6
        with:
          gpg_private_key: ${{ secrets.GPG_PRIVATE_KEY }}
          passphrase: ${{ secrets.GPG_PASSPHRASE }}
      
      - name: Sign release
        run: |
          gpg --detach-sign --armor dist/bundle.js
```

## 8. 通知与报告

### 8.1 Slack 通知

```yaml
jobs:
  notify:
    runs-on: ubuntu-latest
    if: always()
    needs: [build, test, deploy]
    
    steps:
      - name: Slack Notification
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "Build ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*${{ github.workflow }}* ${{ job.status }}\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}"
                  }
                }
              ]
            }
```

### 8.2 Discord 通知

```yaml
jobs:
  notify:
    runs-on: ubuntu-latest
    
    steps:
      - name: Discord Notification
        uses: Ilshidur/action-discord@master
        env:
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
        with:
          args: 'Build {{ EVENT_PAYLOAD.repository.full_name }} completed!'
```

### 8.3 GitHub 状态检查

```yaml
jobs:
  status:
    runs-on: ubuntu-latest
    
    steps:
      - name: Create status check
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: context.sha,
              state: 'success',
              target_url: 'https://example.com/build/123',
              description: 'Build passed',
              context: 'continuous-integration/custom'
            })
```

### 8.4 生成测试报告

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage --json --outputFile=test-results.json
      
      - name: Test Report
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Test Results
          path: test-results.json
          reporter: jest-json
      
      - name: Coverage Report
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
```

## 9. 实战案例

### 9.1 完整的 CI/CD 流程

```yaml
name: Complete CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: 18
  REGISTRY: ghcr.io

jobs:
  # 代码质量检查
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      
      - name: ESLint
        run: npm run lint
      
      - name: Prettier
        run: npm run format:check
      
      - name: TypeScript
        run: npm run type-check
  
  # 测试
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: quality
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      
      - name: Unit Tests
        run: npm run test:unit -- --coverage
      
      - name: Integration Tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  # E2E 测试
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: quality
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
  
  # 构建
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [test, e2e]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Upload build
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
  
  # 部署到预览环境
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: false
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
  
  # 部署到生产环境
  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://example.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.AWS_S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### 9.2 自动发布

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      
      - name: Generate changelog
        id: changelog
        uses: metcalfc/changelog-generator@v4
        with:
          myToken: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.changelog }}
          files: |
            dist/**
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Publish to npm
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 10. 调试与故障排除

### 10.1 启用调试日志

```yaml
jobs:
  debug:
    runs-on: ubuntu-latest
    
    steps:
      - name: Enable debug logging
        run: echo "ACTIONS_STEP_DEBUG=true" >> $GITHUB_ENV
      
      - name: Debug info
        run: |
          echo "Runner OS: ${{ runner.os }}"
          echo "Runner Arch: ${{ runner.arch }}"
          echo "GitHub Event: ${{ github.event_name }}"
          echo "GitHub Ref: ${{ github.ref }}"
          echo "GitHub SHA: ${{ github.sha }}"
```

### 10.2 使用 tmate 调试

```yaml
jobs:
  debug:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup tmate session
        uses: mxschmitt/action-tmate@v3
        if: ${{ failure() }}
```

### 10.3 查看工作流运行日志

```bash
# 使用 GitHub CLI
gh run list --workflow=ci.yml
gh run view <run-id>
gh run view <run-id> --log
```

## 11. 最佳实践总结

### 11.1 工作流组织

1. **单一职责**：每个工作流专注于一个任务
2. **可重用性**：提取公共逻辑到可重用工作流或 Actions
3. **清晰命名**：使用描述性的名称
4. **适当分离**：CI 和 CD 分开管理

### 11.2 性能优化

1. **使用缓存**：缓存依赖和构建产物
2. **并行执行**：合理使用矩阵和并行作业
3. **增量构建**：只构建受影响的部分
4. **取消冗余**：使用 concurrency 取消过时的运行

### 11.3 安全性

1. **密钥管理**：使用 GitHub Secrets
2. **最小权限**：明确声明所需权限
3. **依赖扫描**：定期检查安全漏洞
4. **代码审查**：PR 需要审批才能合并

### 11.4 可维护性

1. **文档化**：添加注释说明复杂逻辑
2. **版本固定**：使用特定版本的 Actions
3. **错误处理**：适当使用 continue-on-error 和 if 条件
4. **通知机制**：重要事件发送通知

通过合理使用 GitHub Actions，可以实现完整的 CI/CD 自动化流程，提升开发效率和代码质量。

