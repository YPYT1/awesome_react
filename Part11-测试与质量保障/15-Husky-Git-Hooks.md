# Husky Git Hooks

## 概述

Husky是一个Git Hooks管理工具,使得配置和使用Git Hooks变得简单。它可以在代码提交、推送等Git操作时自动执行脚本,确保代码质量。本文将全面介绍Husky在React项目中的配置和使用。

## Git Hooks基础

### 什么是Git Hooks

Git Hooks是Git在特定事件发生时自动执行的脚本。它们存储在`.git/hooks`目录中。

### 常用的Git Hooks

```bash
# 客户端Hooks
pre-commit       # 提交前执行
prepare-commit-msg  # 准备提交消息时执行
commit-msg       # 提交消息验证
post-commit      # 提交后执行
pre-push         # 推送前执行
pre-rebase       # 变基前执行

# 服务端Hooks
pre-receive      # 接收前执行
update           # 更新前执行
post-receive     # 接收后执行
```

### 传统Git Hooks的问题

```bash
# 1. 不能版本控制(.git/hooks不在版本库中)
# 2. 需要手动复制到每个开发者的本地
# 3. 配置和维护复杂
# 4. 团队协作困难
```

## Husky安装与配置

### 安装Husky

```bash
# 安装Husky
npm install --save-dev husky

# 初始化Husky
npx husky install

# 添加到package.json(自动初始化)
npm pkg set scripts.prepare="husky install"
```

### 目录结构

```
project/
├── .husky/
│   ├── _/
│   │   ├── .gitignore
│   │   └── husky.sh
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── package.json
└── ...
```

### package.json配置

```json
{
  "scripts": {
    "prepare": "husky install",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "husky": "^8.0.0"
  }
}
```

## 创建Git Hooks

### pre-commit Hook

```bash
# 创建pre-commit hook
npx husky add .husky/pre-commit "npm test"

# 或手动创建
touch .husky/pre-commit
chmod +x .husky/pre-commit
```

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-commit checks..."

# 运行测试
npm test

# 运行lint
npm run lint

# 运行类型检查
npm run type-check

echo "✅ Pre-commit checks passed!"
```

### commit-msg Hook

```bash
# 创建commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 验证提交消息格式
npx --no -- commitlint --edit ${1}
```

### pre-push Hook

```bash
# 创建pre-push hook
npx husky add .husky/pre-push "npm test"
```

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# 运行完整测试套件
npm test

# 运行构建
npm run build

echo "✅ Pre-push checks passed!"
```

## 与lint-staged集成

### 安装lint-staged

```bash
npm install --save-dev lint-staged
```

### 配置lint-staged

#### package.json

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

#### .lintstagedrc.js

```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,css,scss,md}': [
    'prettier --write',
  ],
};
```

### pre-commit配置

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## 实战示例

### 基础React项目配置

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. Lint-staged
npx lint-staged

# 2. 类型检查
echo "📝 Type checking..."
npm run type-check

# 3. 运行测试
echo "🧪 Running tests..."
npm run test:staged

echo "✅ All checks passed!"
```

### TypeScript项目配置

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. Lint和格式化
npx lint-staged

# 2. TypeScript编译检查
echo "📝 TypeScript compilation check..."
npx tsc --noEmit

# 3. 测试
echo "🧪 Running tests..."
npm run test:changed

echo "✅ Pre-commit checks passed!"
```

### 完整的Hooks配置

#### pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Pre-commit checks..."

# Lint-staged
npx lint-staged

# 类型检查
npm run type-check

# 单元测试
npm run test:staged

echo "✅ Pre-commit passed!"
```

#### commit-msg

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."

# Commitlint
npx --no -- commitlint --edit ${1}

echo "✅ Commit message validated!"
```

#### pre-push

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Pre-push checks..."

# 完整测试
npm test

# 构建检查
npm run build

# E2E测试(可选)
# npm run test:e2e

echo "✅ Pre-push checks passed!"
```

#### post-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "📝 Post-commit actions..."

# 更新变更日志(可选)
# npm run changelog

# 通知(可选)
# node scripts/notify-commit.js

echo "✅ Post-commit completed!"
```

## 高级配置

### 条件执行

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 检查是否有TypeScript文件变更
TS_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep '\.tsx\?$')

if [ -n "$TS_FILES" ]; then
  echo "📝 TypeScript files changed, running type check..."
  npm run type-check
fi

# 检查是否有测试文件变更
TEST_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep 'test\|spec')

if [ -n "$TEST_FILES" ]; then
  echo "🧪 Test files changed, running tests..."
  npm test
fi
```

### 分支保护

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

# 获取当前分支
BRANCH=$(git symbolic-ref --short HEAD)

# 禁止直接提交到main/master分支
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "❌ Cannot commit directly to $BRANCH branch!"
  echo "Please create a feature branch."
  exit 1
fi

npx lint-staged
```

### 防止敏感信息提交

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

# 检查敏感信息
if git diff --cached | grep -E 'API_KEY|SECRET|PASSWORD|TOKEN'; then
  echo "❌ Potential sensitive information detected!"
  echo "Please remove sensitive data before committing."
  exit 1
fi

npx lint-staged
```

### 检查文件大小

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

# 检查大文件
MAX_SIZE=500000 # 500KB
FILES=$(git diff --cached --name-only --diff-filter=ACMR)

for FILE in $FILES; do
  if [ -f "$FILE" ]; then
    SIZE=$(wc -c < "$FILE")
    if [ $SIZE -gt $MAX_SIZE ]; then
      echo "❌ File $FILE is too large ($SIZE bytes > $MAX_SIZE bytes)"
      exit 1
    fi
  fi
done

npx lint-staged
```

## 性能优化

### 并行执行

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running checks in parallel..."

# 并行执行多个任务
(npx lint-staged) &
(npm run type-check) &
(npm run test:staged) &

# 等待所有任务完成
wait

echo "✅ All checks passed!"
```

### 缓存优化

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 使用ESLint缓存
eslint --cache .

# 使用TypeScript增量编译
tsc --incremental

# 使用Jest缓存
jest --cache
```

### 跳过Hooks

```bash
# 临时跳过hooks(不推荐)
git commit --no-verify -m "commit message"

# 或
HUSKY_SKIP_HOOKS=1 git commit -m "commit message"
```

## 团队协作

### 统一配置

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "postinstall": "husky install",
    "precommit": "lint-staged",
    "prepush": "npm test"
  }
}
```

### 文档化

```markdown
# README.md

## Git Hooks

本项目使用Husky管理Git Hooks。

### 安装

\`\`\`bash
npm install
\`\`\`

### 配置的Hooks

- **pre-commit**: 运行lint-staged,检查代码格式和质量
- **commit-msg**: 验证提交消息格式(Conventional Commits)
- **pre-push**: 运行完整测试套件

### 跳过Hooks(紧急情况)

\`\`\`bash
git commit --no-verify
\`\`\`

**注意**: 仅在紧急情况下使用,正常情况下应通过所有检查。
```

### CI/CD集成

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
```

## 常见问题

### Husky不生效

```bash
# 1. 确保已初始化
npx husky install

# 2. 检查hooks文件权限
chmod +x .husky/pre-commit

# 3. 检查Git版本(需要2.9+)
git --version

# 4. 检查core.hooksPath配置
git config core.hooksPath
# 应该输出: .husky
```

### Windows环境问题

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Windows兼容性
if [ "$OS" = "Windows_NT" ]; then
  export PATH="/c/Program Files/nodejs:$PATH"
fi

npx lint-staged
```

### Monorepo配置

```json
// 根目录 package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "workspaces": ["packages/*"]
}

// packages/app/package.json
{
  "scripts": {
    "lint": "eslint .",
    "test": "jest"
  }
}
```

```bash
#!/usr/bin/env sh
# .husky/pre-commit
. "$(dirname -- "$0")/_/husky.sh"

# Monorepo: 只检查变更的包
CHANGED_PACKAGES=$(lerna changed --json | jq -r '.[].location')

for PACKAGE in $CHANGED_PACKAGES; do
  echo "Checking $PACKAGE..."
  cd $PACKAGE
  npm run lint
  npm test
  cd -
done
```

### 禁用特定Hook

```bash
# 临时禁用
HUSKY_SKIP_HOOKS=1 git commit -m "message"

# 永久禁用(不推荐)
# 删除对应的hook文件
rm .husky/pre-commit
```

## 实战案例

### 完整的React项目配置

#### package.json

```json
{
  "name": "react-app",
  "scripts": {
    "prepare": "husky install",
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "jest",
    "test:staged": "jest --findRelatedTests",
    "test:changed": "jest --onlyChanged",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 检查分支
BRANCH=$(git symbolic-ref --short HEAD)
if [ "$BRANCH" = "main" ]; then
  echo "❌ Cannot commit directly to main branch!"
  exit 1
fi

# Lint-staged
echo "📝 Linting and formatting..."
npx lint-staged

# 类型检查
echo "🔤 Type checking..."
npm run type-check

echo "✅ Pre-commit checks passed!"
```

#### .husky/commit-msg

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."

npx --no -- commitlint --edit ${1}

echo "✅ Commit message validated!"
```

#### .husky/pre-push

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-push checks..."

# 完整测试
echo "🧪 Running all tests..."
npm test

# 构建检查
echo "🏗️ Building..."
npm run build

echo "✅ Pre-push checks passed!"
```

#### commitlint.config.js

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复bug
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建/工具
        'revert',   // 回滚
      ],
    ],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100],
  },
};
```

## 最佳实践

### 1. 渐进式采用

```bash
# 第一阶段: 只检查格式
# .husky/pre-commit
npx lint-staged

# 第二阶段: 添加类型检查
npx lint-staged
npm run type-check

# 第三阶段: 添加测试
npx lint-staged
npm run type-check
npm run test:staged
```

### 2. 快速反馈

```bash
# 只检查相关文件
jest --bail --findRelatedTests

# 使用缓存
eslint --cache .

# 并行执行
(npx lint-staged) & (npm run type-check) & wait
```

### 3. 清晰的错误信息

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Pre-commit checks..."

if ! npx lint-staged; then
  echo "❌ Lint-staged failed!"
  echo "Please fix linting errors before committing."
  exit 1
fi

if ! npm run type-check; then
  echo "❌ Type check failed!"
  echo "Please fix TypeScript errors before committing."
  exit 1
fi

echo "✅ All checks passed!"
```

### 4. 团队一致性

- 所有hooks都提交到版本库
- 文档化hooks的作用
- 提供跳过hooks的指南(仅紧急情况)
- 在CI中执行相同的检查

### 5. 性能优化

- 只检查变更的文件
- 使用缓存
- 并行执行独立任务
- 避免重复检查

## 总结

Husky是确保代码质量的重要工具,它能够:

1. **自动化检查**: 在提交前自动运行lint、test等检查
2. **团队一致性**: 确保所有团队成员遵循相同的代码质量标准
3. **提前发现问题**: 在本地捕获问题,避免污染代码库
4. **减少CI失败**: 本地通过检查后再推送到远程
5. **强制规范**: 自动执行提交消息规范等团队约定

通过合理配置Husky,可以显著提升团队的代码质量和开发效率。

