# Turborepo使用

## 课程概述

本章节深入探讨Turborepo的使用,学习如何通过Turborepo构建高性能的Monorepo项目。Turborepo是Vercel开发的新一代Monorepo构建系统,以其出色的性能和简单的配置而闻名。

### 学习目标

- 理解Turborepo的核心特性
- 掌握Turborepo的安装和配置
- 学习Pipeline和任务编排
- 了解缓存机制和远程缓存
- 掌握增量构建和并行执行
- 学习Turborepo最佳实践

## 第一部分:Turborepo基础

### 1.1 什么是Turborepo

Turborepo是一个用于JavaScript和TypeScript monorepo的高性能构建系统,专注于加速开发和构建流程。

**核心特性:**

```javascript
1. 智能缓存      - 从不执行相同的工作两次
2. 最大并行      - 充分利用所有CPU核心
3. 远程缓存      - 在团队间共享缓存
4. 任务编排      - 理解任务依赖关系
5. 增量构建      - 只构建变化的部分
6. 零配置        - 开箱即用
```

**性能对比:**

```javascript
// 传统Monorepo工具
构建时间: 10分钟
测试时间: 5分钟
总计: 15分钟

// Turborepo (有缓存)
构建时间: 30秒
测试时间: 20秒
总计: 50秒

// 提速: 18倍
```

### 1.2 Turborepo优势

```javascript
1. 速度快
   - 智能缓存
   - 并行执行
   - 增量构建

2. 易于使用
   - 简单配置
   - 渐进式采用
   - 良好文档

3. 灵活性
   - 支持任何包管理器
   - 自定义Pipeline
   - 可扩展

4. 团队协作
   - 远程缓存
   - 一致性保证
   - CI/CD友好
```

### 1.3 与其他工具对比

| 特性 | Turborepo | Nx | Lerna |
|------|-----------|-------|--------|
| 缓存 | ✅ 本地+远程 | ✅ 本地+远程 | ❌ |
| 并行执行 | ✅ | ✅ | ✅ |
| 依赖图 | ✅ | ✅ | ❌ |
| 配置复杂度 | 低 | 中 | 低 |
| 性能 | 极快 | 快 | 一般 |
| 学习曲线 | 平缓 | 陡峭 | 平缓 |

## 第二部分:安装和配置

### 2.1 创建Turborepo项目

```bash
# 使用官方模板
npx create-turbo@latest

# 选择包管理器
? Which package manager do you want to use?
  npm
  yarn
  pnpm  ← 推荐

# 项目创建完成
cd my-turborepo
```

**生成的项目结构:**

```
my-turborepo/
├── apps/
│   ├── docs/              # 文档应用
│   │   ├── package.json
│   │   └── ...
│   └── web/              # Web应用
│       ├── package.json
│       └── ...
├── packages/
│   ├── eslint-config/    # ESLint配置
│   ├── typescript-config/ # TS配置
│   └── ui/              # UI组件库
│       ├── package.json
│       └── ...
├── turbo.json           # Turborepo配置
├── package.json
└── pnpm-workspace.yaml
```

### 2.2 添加到现有项目

```bash
# 1. 安装Turborepo
pnpm add -Dw turbo

# 2. 创建配置文件
touch turbo.json

# 3. 更新package.json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

### 2.3 基础配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 2.4 Workspace配置

**pnpm-workspace.yaml:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**根package.json:**

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

## 第三部分:Pipeline配置

### 3.1 基础Pipeline

```json
// turbo.json
{
  "pipeline": {
    "build": {
      // 依赖其他包的build任务
      "dependsOn": ["^build"],
      
      // 输出目录
      "outputs": ["dist/**"],
      
      // 启用缓存
      "cache": true
    }
  }
}
```

**dependsOn说明:**

```javascript
// ^build - 依赖包的build任务
packages/ui → build
packages/api → build (依赖ui)
apps/web → build (依赖api和ui)

// build - 自己的build任务
build → test (先build再test)

// 组合使用
"test": {
  "dependsOn": ["^build", "build"]
}
// 先运行依赖包的build,再运行自己的build,最后test
```

### 3.2 复杂Pipeline

```json
{
  "pipeline": {
    // 构建任务
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "env": ["NODE_ENV"]
    },
    
    // 开发任务
    "dev": {
      "cache": false,
      "persistent": true
    },
    
    // 测试任务
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**/*"]
    },
    
    // Lint任务
    "lint": {
      "outputs": [],
      "inputs": ["src/**/*.ts", "src/**/*.tsx"]
    },
    
    // 类型检查
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    
    // 清理任务
    "clean": {
      "cache": false
    }
  }
}
```

### 3.3 环境变量

```json
{
  "globalEnv": [
    "CI",
    "VERCEL"
  ],
  "globalDependencies": [
    ".env",
    "tsconfig.json"
  ],
  "pipeline": {
    "build": {
      "env": [
        "NEXT_PUBLIC_API_URL",
        "DATABASE_URL"
      ],
      "outputs": [".next/**"]
    }
  }
}
```

**使用环境变量:**

```bash
# .env
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...

# 自动包含在缓存key中
turbo run build
```

### 3.4 输入和输出

```json
{
  "pipeline": {
    "build": {
      // 指定输入文件
      "inputs": [
        "src/**/*.ts",
        "src/**/*.tsx",
        "!src/**/*.test.ts"
      ],
      
      // 指定输出目录
      "outputs": [
        "dist/**",
        "!dist/**/*.map"
      ]
    }
  }
}
```

## 第四部分:缓存机制

### 4.1 本地缓存

Turborepo自动缓存任务输出:

```bash
# 第一次运行
turbo run build
# ✓ packages/ui:build: 10s
# ✓ apps/web:build: 15s
# 总计: 25s

# 第二次运行(无变化)
turbo run build
# ✓ packages/ui:build: cache hit
# ✓ apps/web:build: cache hit
# 总计: 0.5s
```

**缓存位置:**

```bash
node_modules/.cache/turbo/
├── <task-hash-1>/
│   ├── .turbo/
│   │   └── turbo-build.log
│   └── dist/
└── <task-hash-2>/
    └── ...
```

### 4.2 缓存Hash

Turborepo基于多个因素计算缓存hash:

```javascript
缓存Hash = hash(
  任务名称,
  输入文件内容,
  依赖包版本,
  环境变量,
  全局依赖,
  Turborepo配置
)

// 任何一个因素变化,hash就变化,缓存失效
```

### 4.3 缓存控制

```json
{
  "pipeline": {
    // 禁用缓存
    "dev": {
      "cache": false
    },
    
    // 强制缓存
    "build": {
      "cache": true,
      "outputs": ["dist/**"]
    },
    
    // 只读缓存
    "test": {
      "cache": "read-only"
    }
  }
}
```

**命令行控制:**

```bash
# 跳过缓存
turbo run build --force

# 只使用本地缓存
turbo run build --remote-cache-timeout=0

# 清除缓存
rm -rf node_modules/.cache/turbo
```

### 4.4 远程缓存

```bash
# 登录Vercel
turbo login

# 链接项目
turbo link

# 启用远程缓存
turbo run build
# ✓ Remote cache enabled
```

**配置远程缓存:**

```json
// turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

**自定义远程缓存:**

```bash
# 环境变量
export TURBO_API="https://cache.example.com"
export TURBO_TOKEN="your-token"
export TURBO_TEAM="your-team"

# 或在配置文件中
turbo run build --api="https://cache.example.com" --token="xxx"
```

## 第五部分:任务执行

### 5.1 运行任务

```bash
# 运行所有包的build
turbo run build

# 运行多个任务
turbo run build test lint

# 并行运行
turbo run build --parallel

# 持续运行
turbo run dev --parallel --continue
```

### 5.2 过滤器(Filter)

```bash
# 只运行特定包
turbo run build --filter=@myapp/web

# 运行包及其依赖
turbo run build --filter=@myapp/web...

# 运行包及其依赖者
turbo run build --filter=...@myapp/ui

# 运行多个包
turbo run build --filter=@myapp/web --filter=@myapp/mobile

# 运行目录下所有包
turbo run build --filter=./apps/*

# 基于git变化
turbo run build --filter=[HEAD^1]
```

### 5.3 并发控制

```bash
# 最大并发数
turbo run build --concurrency=4

# 无限并发
turbo run build --concurrency=100

# 串行执行
turbo run build --concurrency=1
```

### 5.4 继续执行

```bash
# 遇到错误继续执行
turbo run build --continue

# 输出摘要
turbo run build --summarize

# 生成执行图
turbo run build --graph=graph.png
```

## 第六部分:实战示例

### 6.1 React应用Monorepo

```
my-app/
├── apps/
│   ├── web/              # Next.js应用
│   │   ├── package.json
│   │   └── next.config.js
│   └── mobile/           # React Native应用
│       └── package.json
├── packages/
│   ├── ui/              # 共享UI组件
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsup.config.ts
│   ├── api/             # API客户端
│   │   └── package.json
│   └── types/           # 类型定义
│       └── package.json
└── turbo.json
```

**turbo.json配置:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        ".next/**",
        "android/app/build/**",
        "ios/build/**"
      ],
      "env": [
        "NEXT_PUBLIC_API_URL",
        "REACT_APP_API_URL"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 6.2 包配置示例

**packages/ui/package.json:**

```json
{
  "name": "@myapp/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@myapp/tsconfig": "workspace:*",
    "tsup": "^7.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}
```

**apps/web/package.json:**

```json
{
  "name": "@myapp/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "@myapp/ui": "workspace:*",
    "@myapp/api": "workspace:*"
  }
}
```

### 6.3 CI/CD配置

**GitHub Actions:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm turbo run build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
      
      - name: Test
        run: pnpm turbo run test
      
      - name: Lint
        run: pnpm turbo run lint
```

### 6.4 部署配置

**Vercel部署:**

```json
// vercel.json
{
  "buildCommand": "turbo run build --filter=@myapp/web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## 第七部分:优化技巧

### 7.1 增量构建

```bash
# 只构建变化的包
turbo run build --filter=[HEAD^1]

# 基于分支
turbo run build --filter=[origin/main]

# 基于tag
turbo run build --filter=[v1.0.0]
```

### 7.2 并行优化

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      // 不依赖build,可以并行
      "outputs": ["coverage/**"]
    }
  }
}
```

### 7.3 缓存优化

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],
      // 细化inputs,减少缓存失效
      "inputs": [
        "src/**/*.ts",
        "src/**/*.tsx",
        "package.json",
        "tsconfig.json"
      ]
    }
  }
}
```

### 7.4 性能监控

```bash
# 生成性能报告
turbo run build --summarize

# 查看执行图
turbo run build --graph=graph.html

# 详细日志
turbo run build --verbosity=2

# 性能分析
turbo run build --profile=profile.json
```

## 第八部分:调试和故障排除

### 8.1 调试命令

```bash
# 查看执行计划
turbo run build --dry-run

# 查看缓存状态
turbo run build --summarize

# 查看依赖图
turbo run build --graph

# 详细日志
turbo run build --verbosity=2

# 跳过缓存
turbo run build --force

# 输出更多信息
turbo run build --output-logs=full
```

### 8.2 常见问题

**问题1: 缓存未命中**

```bash
# 检查inputs配置
turbo run build --summarize

# 查看hash计算
turbo run build --dry-run=json

# 解决方案:
# 1. 检查inputs是否正确
# 2. 确认环境变量配置
# 3. 验证globalDependencies
```

**问题2: 构建失败**

```bash
# 查看详细错误
turbo run build --output-logs=full

# 串行执行定位问题
turbo run build --concurrency=1

# 跳过缓存测试
turbo run build --force
```

**问题3: 远程缓存失败**

```bash
# 检查连接
turbo run build --remote-cache-timeout=60

# 验证token
turbo login

# 重新链接
turbo unlink
turbo link
```

### 8.3 性能分析

```bash
# 生成profile
turbo run build --profile=profile.json

# 分析profile
node -e "console.log(JSON.stringify(require('./profile.json'), null, 2))"

# 查看任务时间
turbo run build --summarize | grep duration
```

## 第九部分:最佳实践

### 9.1 项目组织

```
monorepo/
├── apps/              # 应用程序
│   ├── web/
│   └── mobile/
├── packages/          # 共享包
│   ├── ui/
│   ├── api/
│   └── utils/
├── tools/            # 工具配置
│   ├── eslint-config/
│   └── tsconfig/
├── .github/          # CI/CD
│   └── workflows/
├── turbo.json        # Turborepo配置
└── package.json
```

### 9.2 命名规范

```javascript
// 包命名
@company/package-name

// 应用
@myapp/web
@myapp/mobile

// 共享包
@myapp/ui
@myapp/api

// 配置包
@myapp/eslint-config
@myapp/tsconfig
```

### 9.3 脚本组织

```json
{
  "scripts": {
    // 基础命令
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    
    // 特定包
    "dev:web": "turbo run dev --filter=@myapp/web",
    "build:packages": "turbo run build --filter=./packages/*",
    
    // 清理
    "clean": "turbo run clean && rm -rf node_modules",
    
    // 类型检查
    "type-check": "turbo run type-check"
  }
}
```

### 9.4 配置检查清单

```javascript
构建配置:
☑ 正确的dependsOn
☑ 完整的outputs
☑ 必要的inputs
☑ 环境变量配置

性能优化:
☑ 启用本地缓存
☑ 配置远程缓存
☑ 合理的并发数
☑ 增量构建

CI/CD:
☑ 远程缓存配置
☑ 增量构建
☑ 缓存token安全
☑ 构建超时设置
```

## 总结

本章全面介绍了Turborepo的使用:

1. **基础概念** - 理解Turborepo的特性和优势
2. **安装配置** - 项目创建和基础设置
3. **Pipeline** - 任务编排和依赖管理
4. **缓存机制** - 本地和远程缓存
5. **任务执行** - 过滤器和并发控制
6. **实战示例** - 完整的Monorepo项目
7. **优化技巧** - 性能优化和监控
8. **故障排除** - 调试和问题解决
9. **最佳实践** - 项目组织和规范

Turborepo是构建高性能Monorepo的最佳选择之一。

## 扩展阅读

- [Turborepo官方文档](https://turbo.build/repo/docs)
- [Turborepo示例](https://github.com/vercel/turbo/tree/main/examples)
- [Vercel Remote Cache](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Monorepo工具对比](https://monorepo.tools/)

