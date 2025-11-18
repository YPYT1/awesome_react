# Monorepo概念

## 课程概述

本章节深入探讨Monorepo(单体仓库)的概念和应用,学习如何在一个代码仓库中管理多个项目。Monorepo是大型前端项目和团队协作的重要架构模式。

### 学习目标

- 理解Monorepo的概念和优势
- 掌握Monorepo与Polyrepo的区别
- 学习Monorepo的应用场景
- 了解常见的Monorepo工具
- 掌握Monorepo项目结构
- 学习依赖管理和版本控制

## 第一部分:Monorepo基础

### 1.1 什么是Monorepo

Monorepo(Monolithic Repository)是将多个相关项目存储在单个代码仓库中的软件开发策略。

**传统方式(Polyrepo):**
```
公司项目/
├── web-app/          # 独立仓库
├── mobile-app/       # 独立仓库
├── shared-ui/        # 独立仓库
└── api-client/       # 独立仓库
```

**Monorepo方式:**
```
company-monorepo/
├── apps/
│   ├── web/          # Web应用
│   └── mobile/       # 移动应用
├── packages/
│   ├── ui/          # 共享UI组件
│   ├── api/         # API客户端
│   └── utils/       # 工具库
└── package.json
```

### 1.2 Monorepo的优势

```javascript
1. 代码共享
   - 轻松共享组件和工具
   - 避免代码重复
   - 统一的依赖版本

2. 原子提交
   - 跨项目的更改在一个提交中
   - 保持代码同步
   - 简化版本管理

3. 统一工作流
   - 统一的构建流程
   - 统一的代码规范
   - 统一的测试标准

4. 更好的协作
   - 团队可见性高
   - 跨项目重构容易
   - 依赖关系清晰

5. 简化管理
   - 单一CI/CD配置
   - 统一的依赖升级
   - 集中的文档
```

### 1.3 Monorepo的挑战

```javascript
1. 性能问题
   - 仓库体积大
   - 克隆时间长
   - 构建可能慢

2. 权限管理
   - 难以限制访问
   - 所有人看到所有代码
   - 需要严格的代码审查

3. 工具要求
   - 需要专门的工具
   - 学习曲线陡峭
   - 迁移成本高

4. CI/CD复杂
   - 需要智能构建
   - 增量测试
   - 选择性部署
```

### 1.4 Monorepo vs Polyrepo

| 特性 | Monorepo | Polyrepo |
|------|----------|----------|
| 代码共享 | 容易 | 需要npm包 |
| 版本管理 | 统一版本 | 独立版本 |
| 跨项目修改 | 一次提交 | 多次提交 |
| 构建工具 | 需要专门工具 | 标准工具即可 |
| 团队规模 | 大团队友好 | 小团队友好 |
| 权限控制 | 较难 | 容易 |
| CI/CD | 复杂但统一 | 简单但分散 |

### 1.5 使用Monorepo的公司

```javascript
Google    - 所有代码在一个仓库
Facebook  - React, Jest等在monorepo
Microsoft - TypeScript相关项目
Uber      - 前端项目使用monorepo
Airbnb    - 部分项目使用monorepo
```

## 第二部分:Monorepo工具

### 2.1 工具对比

```javascript
// 主流Monorepo工具
1. Turborepo   - 高性能,智能缓存
2. Nx          - 功能强大,可扩展
3. Lerna       - 老牌工具,简单易用
4. pnpm        - Workspace原生支持
5. Yarn        - Workspace功能
6. Rush        - 微软开发,企业级
```

**特性对比:**

| 工具 | 缓存 | 并行构建 | 依赖图 | 学习曲线 |
|------|------|---------|--------|---------|
| Turborepo | ✅ | ✅ | ✅ | 低 |
| Nx | ✅ | ✅ | ✅ | 中 |
| Lerna | ❌ | ✅ | ❌ | 低 |
| pnpm | ❌ | ✅ | ❌ | 低 |
| Yarn | ❌ | ✅ | ❌ | 低 |

### 2.2 选择工具的考虑因素

```javascript
项目规模:
- 小型 (< 5个包) → pnpm/Yarn Workspace
- 中型 (5-20个包) → Turborepo
- 大型 (> 20个包) → Nx

性能要求:
- 高性能需求 → Turborepo/Nx
- 一般需求 → Lerna/pnpm

团队技能:
- 新手友好 → Turborepo
- 需要定制 → Nx
- 简单需求 → pnpm
```

### 2.3 工具组合

```javascript
// 推荐组合
pnpm + Turborepo
- pnpm管理依赖
- Turborepo处理构建

Yarn + Nx
- Yarn Workspace
- Nx构建和测试

npm + Lerna
- npm管理依赖
- Lerna发布包
```

## 第三部分:Monorepo项目结构

### 3.1 基础结构

```bash
my-monorepo/
├── apps/                    # 应用程序
│   ├── web/                # Web应用
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── mobile/             # 移动应用
│   │   ├── src/
│   │   └── package.json
│   └── admin/              # 管理后台
│       ├── src/
│       └── package.json
│
├── packages/               # 共享包
│   ├── ui/                # UI组件库
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── api/               # API客户端
│   │   ├── src/
│   │   └── package.json
│   ├── utils/             # 工具函数
│   │   ├── src/
│   │   └── package.json
│   └── types/             # 类型定义
│       ├── src/
│       └── package.json
│
├── tools/                  # 开发工具
│   ├── eslint-config/     # ESLint配置
│   ├── tsconfig/          # TypeScript配置
│   └── scripts/           # 构建脚本
│
├── docs/                   # 文档
├── .github/               # GitHub配置
│   └── workflows/         # CI/CD
├── package.json           # 根package.json
├── pnpm-workspace.yaml    # pnpm配置
├── turbo.json             # Turborepo配置
└── tsconfig.json          # 根TS配置
```

### 3.2 应用程序目录(apps)

```typescript
// apps/web/package.json
{
  "name": "@myapp/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "@myapp/ui": "workspace:*",
    "@myapp/api": "workspace:*",
    "@myapp/utils": "workspace:*"
  },
  "devDependencies": {
    "@myapp/eslint-config": "workspace:*",
    "@myapp/tsconfig": "workspace:*"
  }
}
```

### 3.3 共享包目录(packages)

```typescript
// packages/ui/package.json
{
  "name": "@myapp/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "tsup": "^7.0.0",
    "@myapp/tsconfig": "workspace:*"
  }
}
```

### 3.4 工具配置目录(tools)

```typescript
// tools/eslint-config/package.json
{
  "name": "@myapp/eslint-config",
  "version": "1.0.0",
  "main": "index.js",
  "files": [
    "index.js"
  ]
}

// tools/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    // 自定义规则
  }
}
```

## 第四部分:依赖管理

### 4.1 Workspace协议

```json
// package.json
{
  "dependencies": {
    "@myapp/ui": "workspace:*",      // 任意版本
    "@myapp/api": "workspace:^",     // 兼容版本
    "@myapp/utils": "workspace:~"    // 补丁版本
  }
}
```

**workspace协议优势:**
```javascript
1. 始终使用本地版本
2. 自动链接包
3. 避免版本冲突
4. 提升安装速度
```

### 4.2 依赖提升

```javascript
// pnpm配置
// .npmrc
shamefully-hoist=true
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*

// 效果:
node_modules/
├── react/              # 提升到根目录
├── @myapp/
│   ├── ui/
│   └── api/
└── apps/
    └── web/
        └── node_modules/  # 特定依赖
```

### 4.3 依赖版本统一

```json
// 根package.json
{
  "devDependencies": {
    "react": "18.2.0",
    "typescript": "5.0.0",
    "vite": "4.0.0"
  },
  "pnpm": {
    "overrides": {
      "react": "18.2.0"
    }
  }
}
```

### 4.4 共享依赖

```typescript
// packages/shared-deps/package.json
{
  "name": "@myapp/shared-deps",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lodash": "^4.17.21"
  }
}

// apps/web/package.json
{
  "dependencies": {
    "@myapp/shared-deps": "workspace:*"
  }
}
```

## 第五部分:构建和脚本

### 5.1 根package.json脚本

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    
    "dev:web": "turbo run dev --filter=@myapp/web",
    "build:packages": "turbo run build --filter=./packages/*",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo run build && changeset publish"
  }
}
```

### 5.2 Turborepo配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 5.3 并行和串行执行

```json
// turbo.json
{
  "pipeline": {
    "build": {
      // 先构建依赖
      "dependsOn": ["^build"]
    },
    "test": {
      // 先构建自己,再测试
      "dependsOn": ["build"]
    },
    "deploy": {
      // 先构建和测试
      "dependsOn": ["build", "test"]
    }
  }
}
```

**执行顺序:**
```javascript
// 串行
packages/utils   → build
packages/ui      → build (依赖utils)
apps/web         → build (依赖ui)

// 并行
packages/utils   → test
packages/ui      → test
apps/web         → test
```

### 5.4 选择性执行

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
turbo run build --filter=./packages/*
```

## 第六部分:版本管理

### 6.1 Changesets

```bash
# 安装
pnpm add -Dw @changesets/cli

# 初始化
pnpm changeset init
```

```json
// .changeset/config.json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### 6.2 创建Changeset

```bash
# 创建变更记录
pnpm changeset

# 选择包
? Which packages would you like to include?
  ◉ @myapp/ui
  ◉ @myapp/api
  ◯ @myapp/web

# 选择版本类型
? What kind of change is this for @myapp/ui?
  ◯ patch (0.0.1)
  ◉ minor (0.1.0)
  ◯ major (1.0.0)

# 输入变更说明
Summary: Add new Button component
```

### 6.3 版本发布流程

```bash
# 1. 创建changeset
pnpm changeset

# 2. 更新版本
pnpm changeset version

# 3. 构建
pnpm build

# 4. 发布
pnpm changeset publish
```

### 6.4 GitHub Action发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
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
      
      - run: pnpm install
      
      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 第七部分:最佳实践

### 7.1 包命名规范

```javascript
// 使用scope
@company/package-name
@myapp/ui
@myapp/api

// 应用程序
@myapp/web
@myapp/mobile
@myapp/admin

// 共享包
@myapp/ui
@myapp/utils
@myapp/types

// 工具配置
@myapp/eslint-config
@myapp/tsconfig
```

### 7.2 依赖管理策略

```json
// 根package.json - 开发依赖
{
  "devDependencies": {
    "typescript": "5.0.0",
    "eslint": "8.0.0",
    "prettier": "3.0.0"
  }
}

// 包package.json - 运行时依赖
{
  "dependencies": {
    "react": "^18.2.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

### 7.3 TypeScript配置

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true
  }
}

// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": [
    { "path": "../types" }
  ]
}
```

### 7.4 ESLint配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: ['@myapp/eslint-config'],
  parserOptions: {
    project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json']
  }
}
```

### 7.5 Git工作流

```bash
# .gitignore
node_modules/
dist/
.turbo/
.next/
.vercel/
coverage/

# 每个包的gitignore
packages/*/dist/
apps/*/dist/
apps/*/.next/
```

## 第八部分:迁移到Monorepo

### 8.1 迁移策略

```javascript
// 步骤1: 创建Monorepo结构
mkdir my-monorepo
cd my-monorepo
pnpm init

// 步骤2: 移动现有项目
mv ../old-web apps/web
mv ../old-mobile apps/mobile
mv ../shared-ui packages/ui

// 步骤3: 更新依赖
pnpm install

// 步骤4: 配置工具
pnpm add -Dw turbo @changesets/cli

// 步骤5: 更新CI/CD
```

### 8.2 渐进式迁移

```javascript
// 阶段1: 共享配置
monorepo/
├── tools/
│   ├── eslint-config/
│   └── tsconfig/
└── package.json

// 阶段2: 提取公共代码
monorepo/
├── packages/
│   └── shared-utils/
└── tools/

// 阶段3: 迁移应用
monorepo/
├── apps/
│   └── web/
├── packages/
└── tools/

// 阶段4: 完全迁移
monorepo/
├── apps/
│   ├── web/
│   └── mobile/
├── packages/
│   ├── ui/
│   └── utils/
└── tools/
```

### 8.3 迁移检查清单

```javascript
准备阶段:
☑ 分析项目依赖关系
☑ 确定共享代码
☑ 选择Monorepo工具
☑ 规划目录结构

迁移阶段:
☑ 创建Monorepo结构
☑ 移动代码
☑ 更新package.json
☑ 配置workspace
☑ 更新导入路径

验证阶段:
☑ 测试构建
☑ 运行测试
☑ 更新CI/CD
☑ 文档更新
```

## 第九部分:常见问题

### 9.1 性能优化

```bash
# 使用过滤器减少构建范围
turbo run build --filter=[HEAD^1]

# 启用远程缓存
turbo run build --token=xxx

# 并行执行
turbo run build --parallel

# 增量构建
turbo run build --continue
```

### 9.2 调试技巧

```bash
# 查看执行计划
turbo run build --dry-run

# 查看缓存命中
turbo run build --summarize

# 查看依赖图
turbo run build --graph

# 详细日志
turbo run build --verbosity=2
```

### 9.3 故障排除

```bash
# 清除缓存
turbo run clean
rm -rf .turbo

# 重新安装依赖
rm -rf node_modules
pnpm install

# 检查workspace链接
pnpm list --depth=0

# 验证package.json
pnpm why package-name
```

## 总结

本章全面介绍了Monorepo概念:

1. **基础概念** - 理解Monorepo的定义和优势
2. **工具选择** - 主流Monorepo工具对比
3. **项目结构** - Monorepo的目录组织
4. **依赖管理** - Workspace和版本控制
5. **构建脚本** - Turborepo配置和执行
6. **版本发布** - Changesets工作流
7. **最佳实践** - 命名规范和配置策略
8. **迁移指南** - 从Polyrepo到Monorepo

Monorepo是现代大型前端项目的重要架构模式,合理使用能够显著提升开发效率。

## 扩展阅读

- [Turborepo文档](https://turbo.build/repo/docs)
- [Monorepo.tools](https://monorepo.tools/)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [Changesets](https://github.com/changesets/changesets)

