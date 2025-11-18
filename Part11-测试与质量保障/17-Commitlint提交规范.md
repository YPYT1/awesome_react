# Commitlint提交规范

## 概述

Commitlint是一个用于检查Git提交消息是否符合规范的工具。它能够强制团队遵循统一的提交消息格式,使得项目历史更清晰、易于追溯。本文将全面介绍Commitlint在React项目中的配置和使用。

## 为什么需要提交规范

### 传统提交消息的问题

```bash
# 不规范的提交消息
git commit -m "fix bug"
git commit -m "update"
git commit -m "修复了一个问题"
git commit -m "WIP"
git commit -m "asdfasdf"

# 问题:
# 1. 无法快速了解改动内容
# 2. 难以生成变更日志
# 3. 无法按类型筛选提交
# 4. 不便于代码审查
```

### 规范化的优势

```bash
# 规范的提交消息
git commit -m "feat: add user authentication"
git commit -m "fix: resolve memory leak in component"
git commit -m "docs: update API documentation"

# 优势:
# 1. 清晰的提交历史
# 2. 自动生成变更日志
# 3. 便于版本管理
# 4. 提升团队协作效率
```

## Conventional Commits规范

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 示例

```bash
feat(auth): add login functionality

Implement user login with email and password.
Add JWT token generation and validation.

Closes #123
```

### Type类型

```bash
feat:     新功能(feature)
fix:      修复bug
docs:     文档(documentation)
style:    格式(不影响代码运行的变动)
refactor: 重构(既不是新增功能,也不是修复bug)
perf:     性能优化(performance)
test:     增加测试
chore:    构建过程或辅助工具的变动
revert:   回滚
build:    构建系统或外部依赖的变动
ci:       CI配置文件的变动
```

### Scope范围

```bash
# 模块/功能范围
feat(auth): add login
feat(user): add profile page
fix(api): handle network errors
docs(readme): update installation guide

# 组件范围
feat(Button): add loading state
fix(Modal): resolve z-index issue
refactor(Form): simplify validation logic
```

### Subject主题

```bash
# 好的主题
feat: add user authentication
fix: resolve memory leak
docs: update API documentation

# 不好的主题
feat: added some stuff
fix: bug
docs: changes
```

### Body正文

```bash
feat(auth): add OAuth2 authentication

Implement OAuth2 authentication flow with Google and GitHub.
- Add OAuth2 provider configuration
- Implement callback handling
- Add user profile mapping

This allows users to sign in using their social media accounts.
```

### Footer页脚

```bash
# 关闭Issue
feat(auth): add login functionality

Closes #123
Closes #456, #789

# 破坏性变更
feat(api): change response format

BREAKING CHANGE: API response format has changed from array to object
Migration guide: https://example.com/migration
```

## 安装与配置

### 安装依赖

```bash
# 安装commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# 安装husky
npm install --save-dev husky

# 初始化husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 创建commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

### 配置文件

#### commitlint.config.js

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

#### 自定义配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Type枚举
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
        'build',    // 构建
        'ci',       // CI
      ],
    ],
    
    // Type必须小写
    'type-case': [2, 'always', 'lower-case'],
    
    // Type不能为空
    'type-empty': [2, 'never'],
    
    // Scope必须小写
    'scope-case': [2, 'always', 'lower-case'],
    
    // Subject不能为空
    'subject-empty': [2, 'never'],
    
    // Subject不能以句号结尾
    'subject-full-stop': [2, 'never', '.'],
    
    // Subject大小写(关闭,允许任意大小写)
    'subject-case': [0],
    
    // Header最大长度
    'header-max-length': [2, 'always', 100],
    
    // Body前必须有空行
    'body-leading-blank': [2, 'always'],
    
    // Body最大行长度
    'body-max-line-length': [2, 'always', 100],
    
    // Footer前必须有空行
    'footer-leading-blank': [2, 'always'],
    
    // Footer最大行长度
    'footer-max-line-length': [2, 'always', 100],
  },
};
```

## 实战配置

### React项目配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'chore',    // 其他
        'revert',   // 回滚
      ],
    ],
    
    'scope-enum': [
      2,
      'always',
      [
        'auth',       // 认证
        'user',       // 用户
        'api',        // API
        'ui',         // UI组件
        'router',     // 路由
        'store',      // 状态管理
        'hooks',      // Hooks
        'utils',      // 工具
        'config',     // 配置
        'deps',       // 依赖
        'ci',         // CI/CD
        'release',    // 发布
      ],
    ],
    
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
};
```

### Monorepo配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // 包名
        'web',
        'mobile',
        'api',
        'shared',
        'ui',
        
        // 全局
        'deps',
        'ci',
        'release',
        'root',
      ],
    ],
  },
};
```

### 中文配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'chore',    // 其他
        'revert',   // 回滚
      ],
    ],
    
    // 允许中文
    'subject-case': [0],
    
    // 自定义提示消息
    'type-empty': [2, 'never', '提交类型不能为空'],
    'subject-empty': [2, 'never', '提交主题不能为空'],
  },
  
  prompt: {
    messages: {
      type: '选择你要提交的类型:',
      scope: '选择一个scope (可选):',
      customScope: '请输入自定义的scope:',
      subject: '填写简短精炼的变更描述:\n',
      body: '填写更加详细的变更描述 (可选)。使用 "|" 换行:\n',
      breaking: '列举非兼容性重大的变更 (可选):\n',
      footer: '列举出所有变更的ISSUES CLOSED (可选)。 例如: #31, #34:\n',
      confirmCommit: '确认提交?',
    },
    types: [
      { value: 'feat', name: 'feat:     新功能' },
      { value: 'fix', name: 'fix:      修复bug' },
      { value: 'docs', name: 'docs:     文档变更' },
      { value: 'style', name: 'style:    代码格式' },
      { value: 'refactor', name: 'refactor: 重构' },
      { value: 'perf', name: 'perf:     性能优化' },
      { value: 'test', name: 'test:     增加测试' },
      { value: 'chore', name: 'chore:    构建/工具变动' },
      { value: 'revert', name: 'revert:   回滚' },
    ],
  },
};
```

## Git Hooks集成

### Husky配置

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

### 完整的pre-commit和commit-msg

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Lint-staged
npx lint-staged

# 类型检查
npm run type-check

echo "✅ Pre-commit checks passed!"

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."

# Commitlint
npx --no -- commitlint --edit ${1}

echo "✅ Commit message validated!"
```

## 交互式提交

### Commitizen安装

```bash
# 安装commitizen
npm install --save-dev commitizen cz-conventional-changelog

# 初始化
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

### package.json配置

```json
{
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}
```

### 使用Commitizen

```bash
# 使用交互式提交
npm run commit

# 或
npx cz

# 或
git cz
```

### 自定义Commitizen配置

```bash
# 安装自定义适配器
npm install --save-dev cz-customizable

# 创建配置文件
touch .cz-config.js
```

```javascript
// .cz-config.js
module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复bug' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'style', name: 'style:    代码格式(不影响代码运行的变动)' },
    { value: 'refactor', name: 'refactor: 重构(既不是新增功能,也不是修复bug)' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     增加测试' },
    { value: 'chore', name: 'chore:    构建过程或辅助工具的变动' },
    { value: 'revert', name: 'revert:   回滚' },
    { value: 'build', name: 'build:    打包' },
  ],
  
  scopes: [
    { name: 'auth' },
    { name: 'user' },
    { name: 'api' },
    { name: 'ui' },
    { name: 'router' },
    { name: 'store' },
    { name: 'hooks' },
    { name: 'utils' },
    { name: 'config' },
  ],
  
  messages: {
    type: '选择一种你的提交类型:',
    scope: '选择一个scope (可选):',
    customScope: '请输入自定义的scope:',
    subject: '短说明:\n',
    body: '长说明,使用"|"换行(可选):\n',
    breaking: '非兼容性说明 (可选):\n',
    footer: '关联关闭的issue,例如:#31, #34(可选):\n',
    confirmCommit: '确定提交说明?',
  },
  
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  skipQuestions: ['body'],
  subjectLimit: 100,
};

// package.json
{
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    }
  }
}
```

## CI/CD集成

### GitHub Actions

```yaml
name: Commit Lint

on:
  pull_request:
    branches: [main]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate PR commits
        run: npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose
```

### 验证单个提交

```yaml
name: Commit Lint

on:
  push:
    branches: [main]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate commit message
        run: echo "${{ github.event.head_commit.message }}" | npx commitlint
```

## 自动生成变更日志

### Standard-version

```bash
# 安装
npm install --save-dev standard-version

# package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:patch": "standard-version --release-as patch"
  }
}

# 使用
npm run release
```

### Conventional-changelog

```bash
# 安装
npm install --save-dev conventional-changelog-cli

# package.json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}

# 使用
npm run changelog
```

### 配置

```javascript
// .versionrc.js
module.exports = {
  types: [
    { type: 'feat', section: '✨ Features' },
    { type: 'fix', section: '🐛 Bug Fixes' },
    { type: 'docs', section: '📝 Documentation' },
    { type: 'style', section: '💄 Styles' },
    { type: 'refactor', section: '♻️ Code Refactoring' },
    { type: 'perf', section: '⚡️ Performance Improvements' },
    { type: 'test', section: '✅ Tests' },
    { type: 'chore', section: '🔧 Chores' },
    { type: 'revert', section: '⏪ Reverts' },
  ],
  
  skip: {
    bump: false,
    changelog: false,
    commit: false,
    tag: false,
  },
  
  scripts: {
    postchangelog: 'prettier --write CHANGELOG.md',
  },
};
```

## 实战示例

### 完整的项目配置

```bash
# 安装所有依赖
npm install --save-dev \
  @commitlint/cli \
  @commitlint/config-conventional \
  commitizen \
  cz-customizable \
  husky \
  lint-staged \
  standard-version
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'chore', 'revert', 'build', 'ci',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth', 'user', 'api', 'ui', 'router',
        'store', 'hooks', 'utils', 'config', 'deps', 'ci',
      ],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};

// .cz-config.js
module.exports = {
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'fix', name: 'fix:      修复bug' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'style', name: 'style:    代码格式' },
    { value: 'refactor', name: 'refactor: 重构' },
    { value: 'perf', name: 'perf:     性能优化' },
    { value: 'test', name: 'test:     增加测试' },
    { value: 'chore', name: 'chore:    构建/工具变动' },
    { value: 'revert', name: 'revert:   回滚' },
  ],
  scopes: [
    { name: 'auth' },
    { name: 'user' },
    { name: 'api' },
    { name: 'ui' },
    { name: 'router' },
    { name: 'store' },
  ],
  messages: {
    type: '选择提交类型:',
    scope: '选择scope (可选):',
    customScope: '输入自定义scope:',
    subject: '简短描述:\n',
    body: '详细描述 (可选):\n',
    footer: '关联issue (可选):\n',
    confirmCommit: '确认提交?',
  },
  allowCustomScopes: true,
  subjectLimit: 100,
};
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "commit": "cz",
    "release": "standard-version",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-customizable"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit ${1}
```

## 最佳实践

### 1. 提交消息模板

```bash
# .gitmessage
# <type>(<scope>): <subject>
# 
# <body>
# 
# <footer>

# Type:
#   feat:     新功能
#   fix:      修复
#   docs:     文档
#   style:    格式
#   refactor: 重构
#   perf:     性能
#   test:     测试
#   chore:    其他

# 配置Git使用模板
git config commit.template .gitmessage
```

### 2. 渐进式采用

```javascript
// 第一阶段: 只检查type
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'chore']],
    'subject-empty': [2, 'never'],
  },
};

// 第二阶段: 添加scope
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'chore']],
    'scope-enum': [2, 'always', ['auth', 'user', 'api']],
    'subject-empty': [2, 'never'],
  },
};
```

### 3. 团队培训

```markdown
# 提交规范指南

## 基本格式

\`\`\`
<type>(<scope>): <subject>
\`\`\`

## 示例

\`\`\`bash
feat(auth): add login functionality
fix(api): resolve timeout issue
docs(readme): update installation guide
\`\`\`

## 工具

\`\`\`bash
# 交互式提交
npm run commit

# 查看提交历史
git log --oneline

# 生成变更日志
npm run changelog
\`\`\`
```

### 4. 持续改进

```javascript
// 根据团队反馈调整规则
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 放松某些规则
    'subject-case': [0],
    'header-max-length': [2, 'always', 120], // 增加长度限制
    
    // 添加新的type
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'chore', 'revert',
        'wip', // 工作进行中
      ],
    ],
  },
};
```

## 总结

Commitlint是维护高质量提交历史的重要工具,它能够:

1. **统一格式**: 强制团队使用统一的提交消息格式
2. **清晰历史**: 使Git历史更易读、易追溯
3. **自动化**: 自动生成变更日志和版本号
4. **团队协作**: 提升代码审查和项目管理效率
5. **质量保证**: 确保每个提交都有明确的描述

通过合理配置和使用Commitlint,可以显著提升项目的可维护性和团队协作效率。

