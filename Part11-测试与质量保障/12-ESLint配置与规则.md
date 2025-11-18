# ESLint配置与规则

## 概述

ESLint是JavaScript和TypeScript的静态代码分析工具,用于识别和修复代码中的问题。它可以统一代码风格、发现潜在错误、强制最佳实践。本文将全面介绍ESLint在React项目中的配置、规则设置以及最佳实践。

## ESLint核心概念

### 工作原理

```
源代码 -> 解析器(Parser) -> AST -> 规则检查(Rules) -> 报告问题
```

### 配置优先级

```
1. 内联配置(最高)
   /* eslint-disable */
   
2. .eslintrc.js (项目根目录)

3. package.json 中的 eslintConfig

4. 继承的配置(extends)

5. 默认规则(最低)
```

## 安装与基础配置

### 安装依赖

```bash
# 核心包
npm install --save-dev eslint

# TypeScript支持
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# React支持
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks

# Import规则
npm install --save-dev eslint-plugin-import

# JSX可访问性
npm install --save-dev eslint-plugin-jsx-a11y

# 初始化配置
npx eslint --init
```

### .eslintrc.js基础配置

```javascript
module.exports = {
  // 运行环境
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  
  // 继承配置
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
  ],
  
  // 解析器
  parser: '@typescript-eslint/parser',
  
  // 解析器选项
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  
  // 插件
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'import',
    'jsx-a11y',
  ],
  
  // 规则
  rules: {
    // 在后面详细配置
  },
  
  // 设置
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
```

## React规则配置

### React核心规则

```javascript
module.exports = {
  rules: {
    // React版本检测
    'react/react-in-jsx-scope': 'off', // React 17+不需要
    
    // JSX语法
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
    
    // Props验证
    'react/prop-types': 'off', // 使用TypeScript
    'react/require-default-props': 'off',
    
    // 组件定义
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    
    // JSX格式
    'react/jsx-closing-bracket-location': ['error', 'line-aligned'],
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-curly-spacing': ['error', { when: 'never' }],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],
    'react/jsx-props-no-multi-spaces': 'error',
    'react/jsx-tag-spacing': ['error', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    }],
    
    // 自闭合标签
    'react/self-closing-comp': ['error', {
      component: true,
      html: true,
    }],
    
    // 布尔属性
    'react/jsx-boolean-value': ['error', 'never'],
    
    // Fragment简写
    'react/jsx-fragments': ['error', 'syntax'],
    
    // Key属性
    'react/jsx-key': ['error', {
      checkFragmentShorthand: true,
      checkKeyMustBeforeSpread: true,
    }],
    
    // 危险属性
    'react/no-danger': 'warn',
    'react/no-danger-with-children': 'error',
    
    // 废弃API
    'react/no-deprecated': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-string-refs': 'error',
    
    // 性能
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'error',
    
    // 状态
    'react/no-direct-mutation-state': 'error',
    'react/no-unused-state': 'warn',
    
    // 渲染
    'react/no-render-return-value': 'error',
    'react/require-render-return': 'error',
  },
};
```

### React Hooks规则

```javascript
module.exports = {
  rules: {
    // Hooks规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### JSX可访问性规则

```javascript
module.exports = {
  rules: {
    // 可访问性
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/media-has-caption': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'jsx-a11y/no-access-key': 'error',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-distracting-elements': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-redundant-roles': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/tabindex-no-positive': 'warn',
  },
};
```

## TypeScript规则配置

### TypeScript核心规则

```javascript
module.exports = {
  rules: {
    // 类型注解
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    
    // 命名规范
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
    ],
    
    // 未使用变量
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    
    // 导入顺序
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    
    // 类型断言
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      },
    ],
    
    // 数组类型
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array-simple',
      },
    ],
    
    // 禁止使用
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
        'ts-check': false,
      },
    ],
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // 函数
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/require-await': 'off',
    
    // Switch
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
  },
};
```

## Import规则配置

### Import顺序

```javascript
module.exports = {
  rules: {
    'import/order': [
      'error',
      {
        groups: [
          'builtin',   // Node.js内置模块
          'external',  // 外部依赖
          'internal',  // 内部别名
          'parent',    // 父级导入
          'sibling',   // 同级导入
          'index',     // index文件
          'object',    // object导入
          'type',      // 类型导入
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // 导入规则
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'warn',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    
    // 导出
    'import/export': 'error',
    'import/no-mutable-exports': 'error',
    
    // 首选
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',
  },
};
```

## JavaScript规则配置

### 代码风格

```javascript
module.exports = {
  rules: {
    // 缩进
    'indent': ['error', 2, { SwitchCase: 1 }],
    
    // 引号
    'quotes': ['error', 'single', { avoidEscape: true }],
    
    // 分号
    'semi': ['error', 'always'],
    
    // 逗号
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    
    // 括号
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    
    // 箭头函数
    'arrow-spacing': ['error', { before: true, after: true }],
    'arrow-parens': ['error', 'always'],
    'arrow-body-style': ['error', 'as-needed'],
    
    // 空格
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    }],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'keyword-spacing': 'error',
    
    // 换行
    'linebreak-style': ['error', 'unix'],
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'padded-blocks': ['error', 'never'],
    
    // 最大长度
    'max-len': ['warn', {
      code: 100,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
    }],
    
    // 文件
    'max-lines': ['warn', {
      max: 300,
      skipBlankLines: true,
      skipComments: true,
    }],
  },
};
```

### 最佳实践

```javascript
module.exports = {
  rules: {
    // 相等性
    'eqeqeq': ['error', 'always'],
    
    // console
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // debugger
    'no-debugger': 'error',
    
    // alert
    'no-alert': 'warn',
    
    // 变量
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': 'off', // 使用@typescript-eslint版本
    'no-use-before-define': 'off', // 使用@typescript-eslint版本
    
    // 函数
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'no-empty-function': 'off', // 使用@typescript-eslint版本
    
    // 对象
    'object-shorthand': ['error', 'always'],
    'quote-props': ['error', 'as-needed'],
    
    // 数组
    'array-callback-return': 'error',
    'prefer-destructuring': ['error', {
      array: true,
      object: true,
    }],
    
    // 字符串
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    
    // 循环
    'no-loop-func': 'error',
    'no-await-in-loop': 'warn',
    
    // Promise
    'no-promise-executor-return': 'error',
    'prefer-promise-reject-errors': 'error',
    
    // 其他
    'no-nested-ternary': 'warn',
    'no-unneeded-ternary': 'error',
    'no-mixed-operators': 'error',
    'no-return-await': 'error',
    'require-await': 'off', // 使用@typescript-eslint版本
  },
};
```

## 项目特定配置

### 忽略文件(.eslintignore)

```
# 构建产物
dist/
build/
.next/
out/

# 依赖
node_modules/

# 配置文件
*.config.js
*.config.ts

# 测试覆盖率
coverage/

# 生成文件
*.generated.ts
*.d.ts

# 其他
.cache/
public/
```

### 目录级配置

```javascript
// src/legacy/.eslintrc.js
module.exports = {
  rules: {
    // 放松对遗留代码的要求
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
  },
};

// src/tests/.eslintrc.js
module.exports = {
  rules: {
    // 测试文件特殊规则
    '@typescript-eslint/no-explicit-any': 'off',
    'max-lines': 'off',
  },
};
```

### 内联配置

```typescript
// 禁用整个文件
/* eslint-disable */

// 禁用特定规则
/* eslint-disable @typescript-eslint/no-explicit-any */

// 禁用下一行
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = {};

// 禁用当前行
const data: any = {}; // eslint-disable-line

// 禁用代码块
/* eslint-disable @typescript-eslint/no-explicit-any */
function legacy() {
  const data: any = {};
}
/* eslint-enable @typescript-eslint/no-explicit-any */
```

## NPM脚本配置

### package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "lint:cache": "eslint . --ext .js,.jsx,.ts,.tsx --cache",
    "lint:report": "eslint . --ext .js,.jsx,.ts,.tsx --format html --output-file eslint-report.html",
    "lint:staged": "lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 编辑器集成

### VSCode配置(.vscode/settings.json)

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.lintTask.enable": true,
  "eslint.run": "onType"
}
```

### VSCode扩展

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

## 自定义规则

### 创建自定义规则

```javascript
// eslint-rules/no-direct-dom-manipulation.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止直接操作DOM',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noDirect: '不应该直接操作DOM，请使用React ref',
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.name === 'document' &&
          ['getElementById', 'querySelector', 'querySelectorAll'].includes(
            node.property.name
          )
        ) {
          context.report({
            node,
            messageId: 'noDirect',
          });
        }
      },
    };
  },
};

// .eslintrc.js
module.exports = {
  rules: {
    'custom/no-direct-dom-manipulation': 'error',
  },
  overrides: [
    {
      files: ['eslint-rules/**/*.js'],
      rules: {
        'custom/no-direct-dom-manipulation': 'off',
      },
    },
  ],
};
```

## 常见问题处理

### 规则冲突

```javascript
// Prettier与ESLint冲突
// 1. 安装插件
npm install --save-dev eslint-config-prettier

// 2. 配置
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier', // 必须放在最后
  ],
};
```

### 性能优化

```javascript
// .eslintrc.js
module.exports = {
  // 使用缓存
  cache: true,
  cacheLocation: '.eslintcache',
  
  // 忽略特定目录
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
  
  // 减少解析
  parserOptions: {
    project: './tsconfig.json',
    createDefaultProgram: false,
  },
};
```

### TypeScript项目优化

```javascript
// tsconfig.eslint.json
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*",
    "tests/**/*",
    "*.config.ts"
  ]
}

// .eslintrc.js
module.exports = {
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
};
```

## CI/CD集成

### GitHub Actions

```yaml
name: ESLint

on: [push, pull_request]

jobs:
  eslint:
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
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Annotate code linting results
        uses: ataylorme/eslint-annotate-action@v2
        if: failure()
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          report-json: "eslint-report.json"
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint:staged
```

## 最佳实践

### 渐进式采用

```javascript
// 1. 从宽松开始
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn', // 警告而非错误
  },
};

// 2. 逐步严格
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  rules: {
    'no-console': 'error',
    'react/prop-types': 'warn',
  },
};

// 3. 最终配置
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'error',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### 团队协作

```javascript
// 1. 共享配置包
// eslint-config-company/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  rules: {
    // 公司统一规则
  },
};

// 2. 项目中使用
module.exports = {
  extends: ['company'],
  rules: {
    // 项目特定规则
  },
};
```

### 规则分级

```javascript
module.exports = {
  rules: {
    // 错误级别 - 必须修复
    'no-console': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    
    // 警告级别 - 建议修复
    'max-lines': 'warn',
    'complexity': 'warn',
    
    // 关闭 - 不检查
    'react/prop-types': 'off',
  },
};
```

## 迁移指南

### 从无ESLint迁移

```bash
# 1. 安装依赖
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 2. 初始化配置
npx eslint --init

# 3. 修复自动可修复的问题
npm run lint:fix

# 4. 手动修复剩余问题
npm run lint
```

### 从旧版本迁移

```javascript
// ESLint 8 -> 9 迁移示例
module.exports = {
  // 移除已废弃的规则
  rules: {
    // 'indent-legacy': 'off', // 已移除
    'indent': ['error', 2],
  },
};
```

## 配置模板

### 完整的React + TypeScript配置

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  
  parser: '@typescript-eslint/parser',
  
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'import',
    'jsx-a11y',
  ],
  
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': 'error',
    
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
    }],
    
    // Import
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
    }],
    
    // 通用
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
```

ESLint是保证代码质量的重要工具。通过合理的配置和规则设置,可以统一团队代码风格,及早发现潜在问题,提升代码质量和可维护性。

