# Prettier代码格式化

## 概述

Prettier是一个固执己见(Opinionated)的代码格式化工具,支持多种语言和框架。它能够自动格式化代码,统一团队代码风格,减少代码审查中关于格式的讨论。本文将全面介绍Prettier在React项目中的配置和使用。

## Prettier核心特性

### 工作原理

```
源代码 -> 解析(Parse) -> AST -> 重新打印(Print) -> 格式化后的代码
```

### 核心理念

1. **固执己见**: 提供最少的配置选项,避免无休止的代码风格讨论
2. **一致性**: 确保整个项目的代码风格完全一致
3. **自动化**: 保存时自动格式化,无需手动调整
4. **语言支持**: 支持JavaScript、TypeScript、JSX、CSS、JSON等多种格式

## 安装与配置

### 基础安装

```bash
# 安装Prettier
npm install --save-dev prettier

# 安装ESLint集成
npm install --save-dev eslint-config-prettier eslint-plugin-prettier

# 初始化配置
npx prettier --write .
```

### 配置文件

#### .prettierrc.json

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "requirePragma": false,
  "insertPragma": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

#### .prettierrc.js

```javascript
module.exports = {
  // 每行最大字符数
  printWidth: 100,
  
  // 缩进
  tabWidth: 2,
  useTabs: false,
  
  // 分号
  semi: true,
  
  // 引号
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  
  // 尾随逗号
  trailingComma: 'es5',
  
  // 括号空格
  bracketSpacing: true,
  bracketSameLine: false,
  
  // 箭头函数参数括号
  arrowParens: 'always',
  
  // 换行符
  endOfLine: 'lf',
  
  // 其他
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: false,
};
```

### 忽略文件(.prettierignore)

```
# 构建产物
dist/
build/
.next/
out/

# 依赖
node_modules/

# 生成文件
*.generated.ts
*.d.ts

# 配置文件
package-lock.json
yarn.lock
pnpm-lock.yaml

# 其他
coverage/
.cache/
public/
```

## 配置选项详解

### printWidth - 每行最大字符数

```javascript
// printWidth: 80
const result = someFunction(arg1, arg2, arg3, arg4, arg5);

// printWidth: 40
const result = someFunction(
  arg1,
  arg2,
  arg3,
  arg4,
  arg5
);
```

### tabWidth 和 useTabs - 缩进设置

```javascript
// tabWidth: 2, useTabs: false
function example() {
  if (true) {
    console.log('Hello');
  }
}

// tabWidth: 4, useTabs: false
function example() {
    if (true) {
        console.log('Hello');
    }
}

// useTabs: true
function example() {
→ if (true) {
→ → console.log('Hello');
→ }
}
```

### semi - 分号

```javascript
// semi: true
const x = 1;
const y = 2;

// semi: false
const x = 1
const y = 2
```

### singleQuote - 单引号

```javascript
// singleQuote: true
const str = 'Hello';
const jsx = <div className="container" />;

// singleQuote: false
const str = "Hello";
const jsx = <div className="container" />;
```

### jsxSingleQuote - JSX单引号

```javascript
// jsxSingleQuote: false (默认)
const element = <div className="container">Hello</div>;

// jsxSingleQuote: true
const element = <div className='container'>Hello</div>;
```

### trailingComma - 尾随逗号

```javascript
// trailingComma: 'none'
const obj = {
  a: 1,
  b: 2
};

// trailingComma: 'es5'
const obj = {
  a: 1,
  b: 2,
};

// trailingComma: 'all'
const obj = {
  a: 1,
  b: 2,
};
function example(
  arg1,
  arg2,
) {}
```

### bracketSpacing - 对象括号空格

```javascript
// bracketSpacing: true
const obj = { a: 1, b: 2 };

// bracketSpacing: false
const obj = {a: 1, b: 2};
```

### bracketSameLine - JSX括号位置

```javascript
// bracketSameLine: false (默认)
<Button
  onClick={handleClick}
  disabled={isDisabled}
>
  Click Me
</Button>

// bracketSameLine: true
<Button
  onClick={handleClick}
  disabled={isDisabled}>
  Click Me
</Button>
```

### arrowParens - 箭头函数参数括号

```javascript
// arrowParens: 'always'
const fn = (x) => x;

// arrowParens: 'avoid'
const fn = x => x;
```

### endOfLine - 换行符

```javascript
// endOfLine: 'lf' (Unix/Linux)
// 每行以 \n 结尾

// endOfLine: 'crlf' (Windows)
// 每行以 \r\n 结尾

// endOfLine: 'cr' (Old Mac)
// 每行以 \r 结尾

// endOfLine: 'auto'
// 自动检测
```

## 与ESLint集成

### 解决冲突

```bash
# 安装集成包
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // 必须放在最后,关闭ESLint中与Prettier冲突的规则
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // Prettier错误显示为ESLint错误
  },
};
```

### 推荐配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // 关闭冲突规则
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto', // 避免Windows/Unix换行符问题
      },
    ],
  },
};
```

## 编辑器集成

### VSCode配置

#### settings.json

```json
{
  // Prettier设置
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  
  // 特定语言配置
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Prettier配置文件
  "prettier.configPath": ".prettierrc.json",
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false,
  
  // 保存时的操作顺序
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### extensions.json

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### WebStorm配置

```
Settings/Preferences -> Languages & Frameworks -> JavaScript -> Prettier
- Prettier package: [项目路径]/node_modules/prettier
- Run on save for files: {**/*,*}.{js,ts,jsx,tsx,css,scss,json,md}
- On 'Reformat Code' action: √
- On save: √
```

## NPM脚本

### package.json

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix && prettier --write ."
  }
}
```

### 详细脚本示例

```json
{
  "scripts": {
    // 格式化所有文件
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    
    // 检查格式(不修改文件)
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    
    // 格式化特定目录
    "format:src": "prettier --write \"src/**/*.{js,jsx,ts,tsx}\"",
    "format:tests": "prettier --write \"tests/**/*.{js,jsx,ts,tsx}\"",
    
    // 格式化已修改的文件
    "format:changed": "git diff --name-only --diff-filter=ACMR | grep -E '\\.(js|jsx|ts|tsx)$' | xargs prettier --write",
    
    // 组合命令
    "lint:format": "npm run lint:fix && npm run format",
    
    // 验证格式和lint
    "validate": "npm run format:check && npm run lint"
  }
}
```

## Git Hooks集成

### Husky + lint-staged

```bash
# 安装
npm install --save-dev husky lint-staged

# 初始化husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 创建pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### lint-staged配置

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
  // JavaScript/TypeScript文件
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add',
  ],
  
  // 样式文件
  '*.{css,scss,less}': [
    'prettier --write',
    'git add',
  ],
  
  // JSON文件
  '*.json': [
    'prettier --write',
    'git add',
  ],
  
  // Markdown文件
  '*.md': [
    'prettier --write',
    'git add',
  ],
};
```

### pre-commit配置示例

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🚀 Running pre-commit checks..."

# 1. Lint-staged
npx lint-staged

# 2. 类型检查
npm run type-check

# 3. 测试
npm run test:staged

echo "✅ Pre-commit checks passed!"
```

## CI/CD集成

### GitHub Actions

```yaml
name: Format Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  format:
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
      
      - name: Check formatting
        run: npm run format:check
      
      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Code formatting check failed. Please run `npm run format` locally.'
            })
```

### Auto-format Action

```yaml
name: Auto Format

on:
  pull_request:
    branches: [main]

jobs:
  format:
    runs-on: ubuntu-latest
    
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.head_ref }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Format code
        run: npm run format
      
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'style: auto-format code with Prettier'
          file_pattern: '*.js *.jsx *.ts *.tsx *.json *.css *.scss *.md'
```

## 高级用法

### 针对不同文件的配置

```javascript
// .prettierrc.js
module.exports = {
  // 默认配置
  printWidth: 100,
  singleQuote: true,
  
  // 针对特定文件的配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,
      },
    },
    {
      files: 'package.json',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
```

### EditorConfig集成

```
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,json}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

```javascript
// .prettierrc.js
module.exports = {
  // Prettier会读取.editorconfig的设置
  // 如果设置了相同的选项,Prettier配置优先
  printWidth: 100,
  singleQuote: true,
};
```

### 格式化忽略

#### 代码块忽略

```javascript
// prettier-ignore
const matrix = [
  [1,  0,  0],
  [0,  1,  0],
  [0,  0,  1]
];

// JSX
{/* prettier-ignore */}
<div    className="formatted"    >
  Badly formatted but preserved
</div>

// CSS
/* prettier-ignore */
.selector {
  color:    red;
  padding:  10px;
}

// HTML
<!-- prettier-ignore -->
<div    class="preserved"    >
  Content
</div>
```

#### 范围忽略

```javascript
// prettier-ignore-start
const matrix = [
  [1,  0,  0],
  [0,  1,  0],
  [0,  0,  1]
];
const vector = [
  1,
  2,
  3
];
// prettier-ignore-end

const formatted = { a: 1, b: 2 };
```

### Pragma标记

```javascript
// .prettierrc.js
module.exports = {
  requirePragma: true,
  insertPragma: true,
};

// 需要格式化的文件顶部添加
/**
 * @prettier
 */

// 或
/**
 * @format
 */
```

## 团队协作

### 共享配置包

```bash
# 创建共享配置包
mkdir prettier-config-company
cd prettier-config-company
npm init -y
```

```javascript
// prettier-config-company/index.js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  semi: true,
  arrowParens: 'always',
  endOfLine: 'lf',
};

// prettier-config-company/package.json
{
  "name": "@company/prettier-config",
  "version": "1.0.0",
  "main": "index.js"
}
```

```bash
# 发布配置包
npm publish --access public

# 在项目中使用
npm install --save-dev @company/prettier-config
```

```json
// 项目的 package.json
{
  "prettier": "@company/prettier-config"
}

// 或 .prettierrc.json
"@company/prettier-config"

// 或 .prettierrc.js
module.exports = require('@company/prettier-config');
```

### 扩展共享配置

```javascript
// .prettierrc.js
module.exports = {
  ...require('@company/prettier-config'),
  // 项目特定覆盖
  printWidth: 120,
};
```

## 常见问题

### Windows换行符问题

```javascript
// .prettierrc.js
module.exports = {
  endOfLine: 'auto', // 自动检测
  // 或
  endOfLine: 'lf', // 统一使用Unix换行符
};

// .gitattributes
* text=auto
*.js text eol=lf
*.jsx text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
```

### 与其他工具冲突

```javascript
// 1. 与ESLint冲突
// 使用 eslint-config-prettier
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
};

// 2. 与stylelint冲突
// 使用 stylelint-config-prettier
module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
};
```

### 性能优化

```bash
# 使用缓存
prettier --write --cache .

# 只格式化变更的文件
git diff --name-only --diff-filter=ACMR | xargs prettier --write

# 并行处理
prettier --write . --loglevel warn
```

### 大型项目迁移

```bash
# 1. 创建配置文件
cat > .prettierrc.json << EOF
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5"
}
EOF

# 2. 格式化所有文件
npm run format

# 3. 提交为单独的commit
git add .
git commit -m "chore: format code with Prettier"

# 4. 配置Git blame忽略
echo "$(git rev-parse HEAD) # Prettier formatting" >> .git-blame-ignore-revs

# 5. Git配置
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## 实战示例

### 完整项目配置

```javascript
// .prettierrc.js
module.exports = {
  // 基础配置
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  
  // 针对不同文件的配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
  ],
};
```

```
# .prettierignore
# 依赖
node_modules/

# 构建产物
dist/
build/
.next/
out/

# 配置文件
package-lock.json
yarn.lock
pnpm-lock.yaml

# 生成文件
*.generated.ts
*.d.ts

# 其他
coverage/
.cache/
public/
.env
.env.local
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // 必须放在最后
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
```

```json
// package.json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "npm run lint -- --fix && npm run format",
    "validate": "npm run format:check && npm run lint"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

## 最佳实践

### 1. 从一开始就使用

在项目初始化时就配置Prettier,避免后期大规模代码格式化。

### 2. 团队统一配置

使用共享配置包确保整个团队使用相同的格式化规则。

### 3. 自动化执行

通过Git Hooks和CI/CD自动检查和格式化代码。

### 4. 最小化配置

Prettier的默认配置已经很好,尽量减少自定义配置。

### 5. 与ESLint配合

Prettier负责格式化,ESLint负责代码质量检查,两者配合使用。

### 6. 编辑器集成

确保团队成员都配置了编辑器的自动格式化功能。

### 7. 忽略不必要的文件

使用`.prettierignore`忽略生成文件和第三方代码。

### 8. 文档化

在项目README中说明格式化规则和使用方法。

## 总结

Prettier是现代前端项目必不可少的工具,它能够:

1. **统一代码风格**: 消除团队成员之间的格式差异
2. **提高效率**: 自动格式化,节省手动调整的时间
3. **减少争议**: 固执己见的配置避免无休止的代码风格讨论
4. **提升代码质量**: 一致的格式使代码更易读
5. **简化代码审查**: 减少关于格式的评论,专注于逻辑

通过合理配置和使用Prettier,可以显著提升团队的开发效率和代码质量。

