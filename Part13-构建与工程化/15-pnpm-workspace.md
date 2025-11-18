# pnpm workspace - Monorepo 包管理解决方案

## 1. pnpm workspace 简介

### 1.1 什么是 pnpm workspace

pnpm workspace 是 pnpm 包管理器提供的 Monorepo（单体仓库）管理功能。它允许在单个仓库中管理多个相关的包（packages），这些包可以相互依赖，共享配置和工具链。

**核心优势：**

- **磁盘空间优化**：pnpm 使用内容寻址存储，所有包文件都存储在全局 store 中，项目中只保留硬链接
- **严格的依赖管理**：使用符号链接创建非扁平的 node_modules 结构，避免幽灵依赖
- **快速安装**：并行安装依赖，性能优于 npm 和 yarn
- **Monorepo 支持**：原生支持工作空间，无需额外配置
- **节省带宽**：相同版本的包只下载一次

### 1.2 与其他 Monorepo 工具对比

#### pnpm vs npm workspaces

```bash
# npm workspaces 特点
- 原生支持，无需额外安装
- 相对简单，适合小型项目
- 磁盘占用较大
- 依赖提升可能导致幽灵依赖

# pnpm workspace 特点
- 需要单独安装 pnpm
- 功能更强大，性能更优
- 严格的依赖隔离
- 磁盘空间节省显著
```

#### pnpm vs Yarn workspaces

```bash
# Yarn workspaces 特点
- 成熟的 Monorepo 解决方案
- 磁盘占用中等
- 依赖提升策略灵活
- 社区支持广泛

# pnpm workspace 特点
- 更快的安装速度
- 更小的磁盘占用
- 更严格的依赖管理
- 兼容性更好
```

### 1.3 适用场景

pnpm workspace 特别适合以下场景：

1. **大型前端项目**：多个应用共享组件库和工具
2. **组件库开发**：管理多个独立的组件包
3. **全栈项目**：前端、后端、共享代码在同一仓库
4. **多团队协作**：不同团队维护不同的包
5. **包开发工具链**：开发和测试 npm 包

## 2. 安装与配置

### 2.1 安装 pnpm

```bash
# 使用 npm 安装
npm install -g pnpm

# 使用 Homebrew (macOS)
brew install pnpm

# 使用 Scoop (Windows)
scoop install pnpm

# 使用独立脚本
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 验证安装
pnpm --version
```

### 2.2 初始化 workspace

#### 创建项目结构

```bash
# 创建项目根目录
mkdir my-monorepo
cd my-monorepo

# 初始化 package.json
pnpm init
```

#### 配置 pnpm-workspace.yaml

在项目根目录创建 `pnpm-workspace.yaml` 文件：

```yaml
# pnpm-workspace.yaml
packages:
  # 所有在 packages 目录下的子目录
  - 'packages/*'
  # 所有在 apps 目录下的子目录
  - 'apps/*'
  # 排除测试目录
  - '!**/test/**'
```

#### 更灵活的配置

```yaml
# pnpm-workspace.yaml - 高级配置
packages:
  # 使用通配符匹配多层目录
  - 'packages/**'
  - 'apps/**'
  
  # 匹配特定命名模式
  - 'components/react-*'
  
  # 排除特定目录
  - '!**/node_modules/**'
  - '!**/dist/**'
  - '!**/__tests__/**'
  
  # 包含根目录的包
  - '.'
```

### 2.3 项目结构示例

```
my-monorepo/
├── pnpm-workspace.yaml          # workspace 配置文件
├── package.json                  # 根 package.json
├── pnpm-lock.yaml               # 锁定文件
├── .npmrc                        # pnpm 配置
├── packages/
│   ├── shared/                   # 共享工具库
│   │   ├── package.json
│   │   └── src/
│   ├── ui-components/           # UI 组件库
│   │   ├── package.json
│   │   └── src/
│   └── utils/                   # 工具函数库
│       ├── package.json
│       └── src/
└── apps/
    ├── web/                     # Web 应用
    │   ├── package.json
    │   └── src/
    └── admin/                   # 管理后台
        ├── package.json
        └── src/
```

### 2.4 配置 .npmrc

创建 `.npmrc` 文件配置 pnpm 行为：

```ini
# .npmrc

# 使用严格的对等依赖
strict-peer-dependencies=true

# 自动安装对等依赖
auto-install-peers=true

# 不提升依赖（推荐）
hoist=false

# 或者选择性提升
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*

# 共享工作空间锁文件
shared-workspace-lockfile=true

# 保存精确版本
save-exact=true

# 使用符号链接
symlink=true

# 公共提升模式（可选）
public-hoist-pattern[]=*types*
public-hoist-pattern[]=eslint*
public-hoist-pattern[]=prettier*

# 设置仓库镜像（国内用户）
registry=https://registry.npmmirror.com

# 启用严格的 SSL
strict-ssl=true

# 引擎严格模式
engine-strict=true
```

## 3. 基本使用

### 3.1 安装依赖

#### 为根目录安装依赖

```bash
# 安装开发依赖到根目录
pnpm add -D -w typescript eslint prettier

# -w 或 --workspace-root 标志表示安装到工作空间根目录
pnpm add -w lodash
```

#### 为特定包安装依赖

```bash
# 为 web 应用安装 react
pnpm add react --filter web

# 为 ui-components 安装开发依赖
pnpm add -D @types/react --filter ui-components

# 使用相对路径
pnpm add react --filter ./apps/web

# 使用包名
pnpm add react --filter @myorg/web
```

#### 批量安装依赖

```bash
# 为所有包安装依赖
pnpm install

# 为所有 apps 目录下的包安装
pnpm add react --filter "./apps/*"

# 为匹配模式的包安装
pnpm add lodash --filter "@myorg/*"
```

### 3.2 workspace 协议

pnpm 支持使用 `workspace:` 协议引用工作空间内的包：

#### 基本语法

```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/ui-components": "workspace:*",
    "@myorg/utils": "workspace:^",
    "@myorg/shared": "workspace:~"
  }
}
```

#### 协议说明

```json
{
  "dependencies": {
    // workspace:* - 链接到工作空间内任何版本
    "@myorg/ui": "workspace:*",
    
    // workspace:^ - 链接并在发布时转换为 ^version
    "@myorg/utils": "workspace:^",
    
    // workspace:~ - 链接并在发布时转换为 ~version
    "@myorg/shared": "workspace:~",
    
    // workspace:版本号 - 指定具体版本
    "@myorg/config": "workspace:1.0.0"
  }
}
```

#### 自动链接配置

```bash
# 添加工作空间依赖
cd apps/web
pnpm add @myorg/ui-components

# pnpm 会自动检测并使用 workspace: 协议
# 生成的 package.json:
# "@myorg/ui-components": "workspace:*"
```

### 3.3 运行脚本

#### 在特定包中运行脚本

```bash
# 在 web 应用中运行 dev 脚本
pnpm --filter web dev

# 简写形式
pnpm -F web dev

# 在多个包中运行
pnpm --filter "@myorg/*" build
```

#### 并行运行脚本

```bash
# 并行运行所有包的测试
pnpm -r --parallel test

# 限制并发数
pnpm -r --parallel --workspace-concurrency=2 build

# 顺序运行（考虑依赖关系）
pnpm -r build
```

#### 运行多个脚本

```bash
# 使用 pnpm-recursive (pnpm -r)
pnpm -r run build

# 只在有该脚本的包中运行
pnpm -r --if-present test

# 根据拓扑顺序运行
pnpm -r --workspace-concurrency=1 build
```

### 3.4 filter 过滤器

#### 基本过滤

```bash
# 按包名过滤
pnpm --filter @myorg/web dev

# 按目录过滤
pnpm --filter "./apps/web" dev

# 按模式过滤
pnpm --filter "@myorg/*" build
```

#### 高级过滤

```bash
# 过滤包及其依赖
pnpm --filter @myorg/web... build

# 过滤包的依赖（不包括自身）
pnpm --filter ...@myorg/web build

# 过滤包及其依赖者
pnpm --filter ...@myorg/ui-components... build

# 排除特定包
pnpm --filter "!@myorg/admin" test

# 组合过滤器
pnpm --filter "./apps/*" --filter "!@myorg/admin" dev
```

#### 基于更改的过滤

```bash
# 只运行改变的包
pnpm --filter "...[origin/main]" build

# 运行改变的包及其依赖者
pnpm --filter "...[origin/main]..." test

# 基于 Git 更改
pnpm --filter "{packages/ui-components}[HEAD~1]" build
```

## 4. 依赖管理

### 4.1 workspace 依赖类型

#### 内部依赖（Workspace Dependencies）

```json
// packages/ui-components/package.json
{
  "name": "@myorg/ui-components",
  "version": "1.0.0",
  "dependencies": {
    // 工作空间内的包
    "@myorg/utils": "workspace:*",
    "@myorg/shared": "workspace:^"
  }
}
```

#### 外部依赖（External Dependencies）

```json
{
  "dependencies": {
    // 普通的 npm 包
    "react": "^18.2.0",
    "lodash": "^4.17.21"
  }
}
```

#### 开发依赖（Dev Dependencies）

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0"
  }
}
```

### 4.2 依赖提升策略

#### 禁用提升（推荐）

```ini
# .npmrc
hoist=false
```

这样每个包只能访问其声明的依赖，避免幽灵依赖。

#### 选择性提升

```ini
# .npmrc
hoist=false

# 提升特定包到根目录
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*
hoist-pattern[]=*types*

# 公共提升（所有包都能访问）
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*types*
```

#### 完全提升（不推荐）

```ini
# .npmrc
hoist=true
shamefully-hoist=true
```

### 4.3 对等依赖处理

#### 自动安装对等依赖

```ini
# .npmrc
auto-install-peers=true
```

#### 严格的对等依赖

```ini
# .npmrc
strict-peer-dependencies=true
```

#### 在 package.json 中声明

```json
{
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true
    }
  }
}
```

### 4.4 版本管理

#### Changesets 集成

安装 Changesets：

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

配置 `.changeset/config.json`：

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.0/schema.json",
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

使用 Changesets：

```bash
# 添加变更集
pnpm changeset

# 更新版本
pnpm changeset version

# 发布
pnpm changeset publish
```

#### 版本锁定配置

```json
// package.json
{
  "scripts": {
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

## 5. 实战案例

### 5.1 创建 React Monorepo

#### 步骤 1：初始化项目

```bash
# 创建项目
mkdir react-monorepo
cd react-monorepo
pnpm init

# 创建 workspace 配置
cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
  - 'apps/*'
EOF
```

#### 步骤 2：创建包结构

```bash
# 创建目录
mkdir -p packages/ui apps/web apps/admin

# 初始化包
cd packages/ui && pnpm init && cd ../..
cd apps/web && pnpm init && cd ../..
cd apps/admin && pnpm init && cd ../..
```

#### 步骤 3：配置 TypeScript

安装 TypeScript：

```bash
pnpm add -D -w typescript @types/node
```

创建根 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@myorg/ui": ["./packages/ui/src"],
      "@myorg/ui/*": ["./packages/ui/src/*"]
    }
  }
}
```

#### 步骤 4：配置 UI 组件包

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
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
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

安装依赖：

```bash
pnpm add react --filter @myorg/ui --save-peer
pnpm add -D tsup --filter @myorg/ui
```

#### 步骤 5：创建组件

```tsx
// packages/ui/src/Button.tsx
import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

```tsx
// packages/ui/src/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

#### 步骤 6：配置 Web 应用

```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@myorg/ui": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}
```

安装依赖：

```bash
pnpm add react react-dom --filter @myorg/web
pnpm add -D vite @vitejs/plugin-react --filter @myorg/web
```

创建 Vite 配置：

```ts
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@myorg/ui': path.resolve(__dirname, '../../packages/ui/src')
    }
  }
});
```

#### 步骤 7：使用组件

```tsx
// apps/web/src/App.tsx
import { Button } from '@myorg/ui';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <Button onClick={() => alert('Clicked!')}>
        Click Me
      </Button>
    </div>
  );
}

export default App;
```

#### 步骤 8：添加脚本

```json
// package.json (根目录)
{
  "scripts": {
    "dev": "pnpm --filter @myorg/web dev",
    "dev:all": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "build:ui": "pnpm --filter @myorg/ui build",
    "build:web": "pnpm --filter @myorg/web build"
  }
}
```

### 5.2 创建全栈 Monorepo

#### 项目结构

```
fullstack-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── shared/              # 共享类型和工具
│   ├── database/            # 数据库模型和迁移
│   └── config/              # 共享配置
└── apps/
    ├── web/                 # Next.js 前端
    ├── api/                 # Express 后端
    └── mobile/              # React Native 应用
```

#### 共享类型包

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
```

```json
// packages/shared/package.json
{
  "name": "@myorg/shared",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

#### API 应用

```json
// apps/api/package.json
{
  "name": "@myorg/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "@myorg/shared": "workspace:*",
    "@myorg/database": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "tsx": "^3.12.0",
    "typescript": "^5.0.0"
  }
}
```

```typescript
// apps/api/src/routes/users.ts
import { Router } from 'express';
import { CreateUserDto, User } from '@myorg/shared';
import { UserModel } from '@myorg/database';

const router = Router();

router.post('/users', async (req, res) => {
  const dto: CreateUserDto = req.body;
  const user = await UserModel.create(dto);
  res.json(user);
});

export default router;
```

#### Web 应用

```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@myorg/shared": "workspace:*"
  }
}
```

```tsx
// apps/web/src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { CreateUserDto } from '@myorg/shared';

export async function POST(request: Request) {
  const dto: CreateUserDto = await request.json();
  
  const response = await fetch('http://localhost:3001/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  });
  
  const user = await response.json();
  return NextResponse.json(user);
}
```

### 5.3 组件库 Monorepo

#### 项目结构

```
ui-library/
├── pnpm-workspace.yaml
├── packages/
│   ├── react/               # React 组件
│   ├── vue/                 # Vue 组件
│   ├── core/                # 框架无关的核心逻辑
│   ├── icons/               # 图标库
│   └── themes/              # 主题系统
└── apps/
    ├── docs/                # 文档站点
    └── playground/          # 演示应用
```

#### Core 包（框架无关）

```typescript
// packages/core/src/utils/classnames.ts
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// packages/core/src/hooks/useClickOutside.ts
export function createClickOutsideHandler(
  callback: () => void
) {
  return (element: HTMLElement) => {
    const handler = (event: MouseEvent) => {
      if (!element.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('click', handler);
    
    return () => {
      document.removeEventListener('click', handler);
    };
  };
}
```

#### React 组件包

```json
// packages/react/package.json
{
  "name": "@myorg/react",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@myorg/core": "workspace:*",
    "@myorg/icons": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

```tsx
// packages/react/src/Button/Button.tsx
import React from 'react';
import { cn } from '@myorg/core';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}) => {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        disabled && 'btn-disabled'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

#### 文档站点

```json
// apps/docs/package.json
{
  "name": "@myorg/docs",
  "version": "1.0.0",
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview"
  },
  "dependencies": {
    "@myorg/react": "workspace:*",
    "@myorg/vue": "workspace:*"
  },
  "devDependencies": {
    "vitepress": "^1.0.0"
  }
}
```

## 6. 性能优化

### 6.1 并行安装优化

```ini
# .npmrc
# 网络并发数
network-concurrency=16

# 子进程并发数
child-concurrency=5

# 使用本地缓存
prefer-offline=true

# 缓存位置
store-dir=/path/to/.pnpm-store
```

### 6.2 构建优化

#### 增量构建配置

```json
// package.json
{
  "scripts": {
    "build": "pnpm -r --filter \"...[origin/main]\" build",
    "build:all": "pnpm -r build"
  }
}
```

#### 缓存构建产物

使用 Turborepo 或 Nx 缓存构建结果：

```bash
# 安装 Turborepo
pnpm add -D -w turbo

# turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

### 6.3 依赖去重

```bash
# 检查重复依赖
pnpm list --depth=Infinity

# 去重依赖
pnpm dedupe

# 修剪不需要的依赖
pnpm prune
```

### 6.4 本地开发优化

#### 使用 pnpm patch

```bash
# 创建补丁
pnpm patch some-package@1.0.0

# 编辑补丁后提交
pnpm patch-commit /path/to/patch
```

#### 使用链接开发

```bash
# 全局链接
cd packages/ui
pnpm link --global

# 在其他项目中使用
cd ~/other-project
pnpm link --global @myorg/ui
```

## 7. 持续集成

### 7.1 GitHub Actions 配置

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
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run linter
        run: pnpm -r lint
      
      - name: Run tests
        run: pnpm -r test
      
      - name: Build
        run: pnpm -r build
```

### 7.2 增量 CI

只测试和构建更改的包：

```yaml
# .github/workflows/ci.yml
- name: Get changed packages
  id: changed-packages
  run: |
    echo "packages=$(pnpm list --filter \"...[origin/main]\" --depth -1 --json | jq -r '.[].name' | tr '\n' ',')" >> $GITHUB_OUTPUT

- name: Test changed packages
  if: steps.changed-packages.outputs.packages != ''
  run: pnpm --filter ${{ steps.changed-packages.outputs.packages }} test

- name: Build changed packages
  if: steps.changed-packages.outputs.packages != ''
  run: pnpm --filter "${{ steps.changed-packages.outputs.packages }}..." build
```

### 7.3 发布流程

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
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 8. 常见问题与解决方案

### 8.1 幽灵依赖问题

**问题：** 代码中使用了未在 package.json 中声明的依赖。

**解决方案：**

```ini
# .npmrc
hoist=false
strict-peer-dependencies=true
```

### 8.2 循环依赖

**问题：** 包 A 依赖包 B，包 B 又依赖包 A。

**解决方案：**

1. 重构代码，提取共享逻辑到新包
2. 使用依赖注入
3. 延迟导入

```typescript
// 延迟导入避免循环依赖
export function someFunction() {
  const { someOtherFunction } = require('./other-module');
  return someOtherFunction();
}
```

### 8.3 TypeScript 路径解析

**问题：** TypeScript 无法解析 workspace 包的路径。

**解决方案：**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@myorg/*": ["packages/*/src"]
    }
  }
}
```

### 8.4 构建顺序问题

**问题：** 包的构建顺序不正确，导致依赖的包未构建。

**解决方案：**

```bash
# 使用拓扑排序构建
pnpm -r --workspace-concurrency=1 build

# 或使用 filter 的依赖链
pnpm --filter "@myorg/web..." build
```

### 8.5 开发时热更新

**问题：** 修改组件库后，应用未自动刷新。

**解决方案：**

在组件库中启用 watch 模式：

```json
// packages/ui/package.json
{
  "scripts": {
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  }
}
```

在应用中配置别名指向源码：

```ts
// apps/web/vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@myorg/ui': path.resolve(__dirname, '../../packages/ui/src')
    }
  }
});
```

## 9. 最佳实践

### 9.1 包命名规范

使用 scope 命名：

```json
{
  "name": "@公司名/包名",
  "name": "@myorg/ui-components",
  "name": "@myorg/web-app"
}
```

### 9.2 版本管理策略

#### Fixed Versioning（固定版本）

所有包使用相同版本号：

```json
// .changeset/config.json
{
  "fixed": [
    ["@myorg/ui", "@myorg/icons", "@myorg/themes"]
  ]
}
```

#### Independent Versioning（独立版本）

每个包独立管理版本：

```json
// .changeset/config.json
{
  "fixed": []
}
```

### 9.3 共享配置

创建共享配置包：

```json
// packages/config/package.json
{
  "name": "@myorg/eslint-config",
  "main": "index.js",
  "dependencies": {
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0"
  }
}
```

```js
// packages/config/index.js
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-console': 'warn'
  }
};
```

在其他包中使用：

```json
// apps/web/package.json
{
  "devDependencies": {
    "@myorg/eslint-config": "workspace:*"
  }
}
```

```json
// apps/web/.eslintrc.json
{
  "extends": "@myorg/eslint-config"
}
```

### 9.4 脚本组织

根目录的 package.json 脚本应该清晰明了：

```json
{
  "scripts": {
    // 开发
    "dev": "pnpm --parallel -r dev",
    "dev:web": "pnpm --filter @myorg/web dev",
    "dev:api": "pnpm --filter @myorg/api dev",
    
    // 构建
    "build": "pnpm -r build",
    "build:libs": "pnpm --filter \"./packages/*\" build",
    "build:apps": "pnpm --filter \"./apps/*\" build",
    
    // 测试
    "test": "pnpm -r test",
    "test:unit": "pnpm -r --filter \"./packages/*\" test",
    "test:e2e": "pnpm --filter \"./apps/*\" test:e2e",
    
    // 代码质量
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "type-check": "pnpm -r type-check",
    
    // 清理
    "clean": "pnpm -r clean && rm -rf node_modules",
    "clean:dist": "pnpm -r --parallel run clean",
    
    // 发布
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

### 9.5 文档管理

为每个包提供 README：

```markdown
# @myorg/ui-components

React UI 组件库

## 安装

\`\`\`bash
pnpm add @myorg/ui-components
\`\`\`

## 使用

\`\`\`tsx
import { Button } from '@myorg/ui-components';

function App() {
  return <Button>Click me</Button>;
}
\`\`\`

## API

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' | 'primary' | 按钮样式 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | 按钮大小 |
```

## 10. 总结

pnpm workspace 是一个强大的 Monorepo 管理工具，具有以下优势：

### 10.1 核心优势

1. **节省磁盘空间**：通过硬链接共享依赖
2. **严格的依赖管理**：避免幽灵依赖
3. **快速安装**：并行安装，智能缓存
4. **原生 Monorepo 支持**：workspace 协议简单易用
5. **性能优异**：比 npm 和 yarn 更快

### 10.2 适用场景

- 大型 React/Vue 项目
- 组件库开发
- 全栈应用
- 多团队协作项目
- npm 包开发

### 10.3 关键要点

1. 使用 `pnpm-workspace.yaml` 定义工作空间
2. 使用 `workspace:` 协议引用内部包
3. 使用 `--filter` 精确控制操作范围
4. 配置 `.npmrc` 优化行为
5. 集成 Changesets 管理版本
6. 使用 CI/CD 自动化流程

### 10.4 注意事项

1. 避免循环依赖
2. 合理配置依赖提升策略
3. 注意 TypeScript 路径配置
4. 确保构建顺序正确
5. 做好文档和规范

通过合理使用 pnpm workspace，可以极大提升 Monorepo 项目的开发效率和代码质量。
