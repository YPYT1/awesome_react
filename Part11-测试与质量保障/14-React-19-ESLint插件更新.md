# React 19 ESLint插件更新

## 学习目标

通过本章学习，你将掌握：

- React 19对ESLint配置的重要更新
- eslint-plugin-react-hooks新版本特性
- React Compiler驱动的lint规则
- recommended vs recommended-legacy配置
- 自定义规则配置方法
- 常见lint错误和解决方案
- 迁移指南和最佳实践
- 团队代码规范制定

## 第一部分：ESLint插件概述

### 1.1 React 19的ESLint变化

React 19引入了重大的ESLint配置更新，特别是针对Hooks规则。

核心变化：
```
React 18 ESLint：
- eslint-plugin-react-hooks@4.x
- 基本的Hooks规则
- rules-of-hooks
- exhaustive-deps

React 19 ESLint：
- eslint-plugin-react-hooks@5.x
- React Compiler集成
- 增强的规则
- recommended vs recommended-legacy
```

主要更新：
```bash
# React 18配置
npm install eslint-plugin-react-hooks@^4.0.0

# React 19配置
npm install eslint-plugin-react-hooks@latest
# 或
npm install eslint-plugin-react-hooks@^5.0.0
```

### 1.2 recommended配置

React 19引入新的recommended预设：
```javascript
// .eslintrc.json (旧配置格式)
{
  "extends": ["plugin:react-hooks/recommended"]
}

// 包含的规则：
// 1. rules-of-hooks（保持）
//    - 只在顶层调用Hooks
//    - 只在React函数中调用Hooks
//
// 2. exhaustive-deps（保持）
//    - 检查依赖数组完整性
//
// 3. compiler-powered rules（新增）
//    - 基于React Compiler的静态分析
//    - 检测不可优化的代码
//    - 提供优化建议
```

Flat Config格式（ESLint 9+）：
```javascript
// eslint.config.js (新配置格式)
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    plugins: {
      'react-hooks': reactHooks
    },
    rules: reactHooks.configs.recommended.rules
  }
];

// 或简化写法
export default [
  reactHooks.configs.flat.recommended
];
```

### 1.3 recommended-legacy配置

如果不想使用React Compiler驱动的规则，可以选择legacy版本：
```javascript
// .eslintrc.json
{
  "extends": ["plugin:react-hooks/recommended-legacy"]
}

// 只包含传统规则：
// - rules-of-hooks
// - exhaustive-deps
// 不包含compiler-powered规则
```

使用场景：
```
使用recommended-legacy的情况：
1. 还未启用React Compiler
2. 需要兼容旧代码
3. 团队还在学习Compiler
4. 渐进式采用策略

使用recommended的情况：
1. 已启用React Compiler
2. 新项目
3. 追求最佳性能
4. 想要最严格的检查
```

对比示例：
```javascript
// 代码示例
function Component({ items }) {
  const [filter, setFilter] = useState('all');
  
  // 可能不必要的useMemo
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  return <List items={filteredItems} />;
}

// recommended配置：
// 警告：useMemo可能不必要，Compiler可以自动优化
// 建议：移除useMemo，让Compiler处理

// recommended-legacy配置：
// 无警告（只检查Hooks规则）
```

## 第二部分：核心规则详解

### 2.1 rules-of-hooks

Hooks调用规则检查：
```javascript
// 规则：只在顶层调用Hooks

// 错误：在条件语句中调用
function BadComponent({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 错误
  }
  
  return <div>Bad</div>;
}

// 错误：在循环中调用
function BadComponent({ items }) {
  const states = items.map(item => {
    return useState(item.id); // 错误
  });
  
  return <div>Bad</div>;
}

// 错误：在回调中调用
function BadComponent() {
  const handleClick = () => {
    const [state, setState] = useState(0); // 错误
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// 正确：在顶层调用
function GoodComponent({ items }) {
  const [state, setState] = useState(0); // 正确
  
  const handleClick = () => {
    setState(1); // 使用Hook，而不是调用Hook
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

ESLint配置：
```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error"
  }
}
```

### 2.2 exhaustive-deps

依赖数组完整性检查：
```javascript
// 规则：Effect的依赖必须完整

// 错误：缺少依赖
function BadComponent({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // 错误：缺少userId依赖
  
  return <div>{user?.name}</div>;
}

// 错误：缺少props依赖
function BadComponent2({ items, sortOrder }) {
  const sortedItems = useMemo(() => {
    return items.sort(sortOrder);
  }, [items]); // 错误：缺少sortOrder依赖
  
  return <List items={sortedItems} />;
}

// 正确：包含所有依赖
function GoodComponent({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // 正确：包含userId
  
  return <div>{user?.name}</div>;
}

// 正确：包含所有依赖
function GoodComponent2({ items, sortOrder }) {
  const sortedItems = useMemo(() => {
    return items.sort(sortOrder);
  }, [items, sortOrder]); // 正确：包含所有依赖
  
  return <List items={sortedItems} />;
}
```

自定义Effect Hooks检查：
```json
{
  "settings": {
    "react-hooks": {
      "additionalEffectHooks": "(useMyEffect|useCustomEffect)"
    }
  }
}
```

或在规则级别配置：
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": ["warn", {
      "additionalHooks": "(useMyCustomHook|useAnotherHook)"
    }]
  }
}
```

### 2.3 React Compiler驱动的规则（新增）

React 19.2引入的Compiler驱动规则：
```javascript
// 检测不可优化的代码模式

// 警告：不必要的手动优化
function Component({ items }) {
  const processedItems = useMemo(() => {
    return items.map(item => item.name);
  }, [items]);
  
  // ESLint警告：
  // Unnecessary useMemo. React Compiler can optimize this automatically.
  // Consider removing useMemo and let the Compiler handle it.
  
  return <List items={processedItems} />;
}

// 警告：不必要的useCallback
function Component({ onUpdate }) {
  const handleClick = useCallback(() => {
    onUpdate();
  }, [onUpdate]);
  
  // ESLint警告：
  // Unnecessary useCallback. React Compiler can optimize this automatically.
  
  return <button onClick={handleClick}>Click</button>;
}

// 警告：不必要的React.memo
const MemoizedComponent = React.memo(function Component({ data }) {
  return <div>{data}</div>;
});

// ESLint警告：
// Unnecessary React.memo. React Compiler can optimize this automatically.

// 推荐：移除手动优化
function Component({ items }) {
  // Compiler自动优化
  const processedItems = items.map(item => item.name);
  
  return <List items={processedItems} />;
}
```

Compiler配置检查：
```javascript
// 检测无效的Compiler配置
// babel.config.js

// 错误配置
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      invalidOption: true, // 无效选项
      compilationMode: 'invalid' // 无效值
    }]
  ]
};

// ESLint会警告：
// Invalid React Compiler configuration
// - 'invalidOption' is not a valid option
// - 'compilationMode' must be 'annotation' or 'infer'

// 正确配置
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      compilationMode: 'infer',
      panicThreshold: 'critical_errors'
    }]
  ]
};
```

## 第三部分：配置指南

### 3.1 基础配置

完整的ESLint配置示例：
```javascript
// .eslintrc.json (Legacy格式)
{
  "root": true,
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended", // React 19推荐配置
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint"
  ],
  "settings": {
    "react": {
      "version": "detect"
    },
    "react-hooks": {
      "additionalEffectHooks": "(useEffectOnce|useUpdateEffect)"
    }
  },
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

Flat Config格式（推荐）：
```javascript
// eslint.config.js
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': typescript
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
```

### 3.2 项目特定配置

针对不同项目类型的配置：
```javascript
// 新项目（React 19 + Compiler）
// eslint.config.js
export default [
  reactHooks.configs.flat.recommended, // 使用最新规则
  {
    rules: {
      // 严格模式
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // React Compiler相关
      'react-hooks/config': 'error' // 检查Compiler配置
    }
  }
];

// 旧项目（迁移中）
export default [
  reactHooks.configs.flat['recommended-legacy'], // 使用传统规则
  {
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn' // 警告而不是错误
    }
  }
];

// 混合项目（部分使用Compiler）
export default [
  {
    files: ['src/modern/**/*.{js,jsx,ts,tsx}'],
    ...reactHooks.configs.flat.recommended // 现代代码：严格规则
  },
  {
    files: ['src/legacy/**/*.{js,jsx,ts,tsx}'],
    ...reactHooks.configs.flat['recommended-legacy'] // 旧代码：宽松规则
  }
];
```

### 3.3 自定义Hooks配置

配置自定义Hooks的lint规则：
```javascript
// .eslintrc.json
{
  "settings": {
    "react-hooks": {
      // 识别自定义Effect Hooks
      "additionalEffectHooks": "(useEffectOnce|useUpdateEffect|useAsyncEffect)"
    }
  },
  "rules": {
    "react-hooks/exhaustive-deps": ["warn", {
      // 规则级别的自定义Hooks
      "additionalHooks": "(useDataFetcher|useSubscription)"
    }]
  }
}
```

自定义Hook示例：
```jsx
// hooks/useEffectOnce.js
function useEffectOnce(effect) {
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    return effect();
  }, []); // 空依赖合法（只运行一次）
}

// 使用
function Component({ userId }) {
  useEffectOnce(() => {
    // ESLint不会警告缺少userId依赖
    // 因为useEffectOnce的语义是只运行一次
    logInitialVisit(userId);
  });
}

// hooks/useUpdateEffect.js
function useUpdateEffect(effect, deps) {
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
  }, deps);
}

// 使用
function Component({ count }) {
  useUpdateEffect(() => {
    // 只在count更新时运行，不在mount时运行
    console.log('Count updated:', count);
  }, [count]); // ESLint检查[count]的完整性
}
```

## 第四部分：常见lint错误

### 4.1 Hooks顺序错误

rules-of-hooks规则捕获的错误：
```jsx
// 错误1：条件调用Hook
function BadConditional({ show }) {
  if (show) {
    const [value, setValue] = useState(0);
  }
  // ESLint Error: React Hook "useState" is called conditionally.
  // React Hooks must be called in the exact same order in every component render.
}

// 修复
function GoodConditional({ show }) {
  const [value, setValue] = useState(0);
  
  if (show) {
    // 使用Hook的结果
    return <div>{value}</div>;
  }
  
  return null;
}

// 错误2：循环中调用Hook
function BadLoop({ items }) {
  return items.map(item => {
    const [selected, setSelected] = useState(false);
    // ESLint Error: React Hook "useState" may be executed more than once
    return <Item selected={selected} />;
  });
}

// 修复：提取为组件
function Item({ item }) {
  const [selected, setSelected] = useState(false);
  return <div className={selected ? 'selected' : ''}>{item.name}</div>;
}

function GoodLoop({ items }) {
  return items.map(item => <Item key={item.id} item={item} />);
}

// 错误3：普通函数中调用Hook
function badHelper() {
  const [value, setValue] = useState(0); // 错误
  return value;
}

function Component() {
  const val = badHelper();
  return <div>{val}</div>;
}

// 修复：改为自定义Hook
function useHelper() {
  const [value, setValue] = useState(0);
  return value;
}

function Component() {
  const val = useHelper(); // 正确
  return <div>{val}</div>;
}
```

### 4.2 依赖数组错误

exhaustive-deps规则捕获的错误：
```jsx
// 错误1：缺少props依赖
function BadComponent({ userId, onUpdate }) {
  useEffect(() => {
    fetchUser(userId).then(user => {
      onUpdate(user);
    });
  }, []); // 错误：缺少userId和onUpdate
  
  // ESLint Warning:
  // React Hook useEffect has missing dependencies: 'userId' and 'onUpdate'.
  // Either include them or remove the dependency array.
}

// 修复
function GoodComponent({ userId, onUpdate }) {
  useEffect(() => {
    fetchUser(userId).then(user => {
      onUpdate(user);
    });
  }, [userId, onUpdate]); // 正确
}

// 错误2：函数依赖问题
function BadComponent({ userId }) {
  function fetchAndDisplay() {
    fetchUser(userId).then(displayUser);
  }
  
  useEffect(() => {
    fetchAndDisplay();
  }, []); // 错误：缺少fetchAndDisplay
  
  // ESLint Warning:
  // React Hook useEffect has a missing dependency: 'fetchAndDisplay'.
}

// 修复方式1：包含函数
function GoodComponent1({ userId }) {
  const fetchAndDisplay = useCallback(() => {
    fetchUser(userId).then(displayUser);
  }, [userId]);
  
  useEffect(() => {
    fetchAndDisplay();
  }, [fetchAndDisplay]); // 正确
}

// 修复方式2：移到Effect内部
function GoodComponent2({ userId }) {
  useEffect(() => {
    function fetchAndDisplay() {
      fetchUser(userId).then(displayUser);
    }
    fetchAndDisplay();
  }, [userId]); // 正确
}

// 错误3：对象依赖问题
function BadComponent({ config }) {
  useEffect(() => {
    setupWithConfig(config.apiUrl, config.timeout);
  }, [config]); // 可能不必要的重新运行
  
  // ESLint Warning:
  // The 'config' object makes the dependencies of useEffect Hook change on every render.
  // To fix this, wrap the initialization of 'config' in useMemo hook.
}

// 修复
function GoodComponent({ config }) {
  useEffect(() => {
    setupWithConfig(config.apiUrl, config.timeout);
  }, [config.apiUrl, config.timeout]); // 只依赖使用的属性
}

// 或
function GoodComponent2({ config }) {
  const memoizedConfig = useMemo(() => config, [config.apiUrl, config.timeout]);
  
  useEffect(() => {
    setupWithConfig(memoizedConfig.apiUrl, memoizedConfig.timeout);
  }, [memoizedConfig]);
}
```

### 4.3 React Compiler警告（新增）

Compiler检测的可优化代码：
```jsx
// 警告：冗余的useMemo
function Component({ items }) {
  // 简单的计算，Compiler可以自动优化
  const count = useMemo(() => items.length, [items]);
  
  // ESLint Warning (React 19.2+):
  // Unnecessary useMemo for simple computation.
  // React Compiler can automatically optimize this.
  // Consider removing useMemo.
  
  return <div>Count: {count}</div>;
}

// 修复
function Component({ items }) {
  const count = items.length; // Compiler自动优化
  return <div>Count: {count}</div>;
}

// 警告：冗余的React.memo
const Component = React.memo(function Component({ name }) {
  return <div>{name}</div>;
});

// ESLint Warning:
// Unnecessary React.memo for this component.
// React Compiler can automatically prevent unnecessary re-renders.

// 修复
function Component({ name }) {
  return <div>{name}</div>;
}

// 警告：过度嵌套的优化
function Component({ data }) {
  const processed = useMemo(() => {
    const filtered = useMemo(() => {
      return data.filter(item => item.active);
    }, [data]); // 嵌套useMemo
    
    return filtered.map(item => item.name);
  }, [data]);
  
  // ESLint Warning:
  // Avoid nested memoization. React Compiler handles this automatically.
  
  return <List items={processed} />;
}

// 修复
function Component({ data }) {
  const processed = data
    .filter(item => item.active)
    .map(item => item.name);
  
  return <List items={processed} />;
}
```

## 第五部分：迁移指南

### 5.1 从recommended-legacy到recommended

逐步启用新规则：
```javascript
// 步骤1：当前配置（React 18）
// .eslintrc.json
{
  "extends": ["plugin:react-hooks/recommended"]
}

// 步骤2：升级插件但使用legacy
// package.json
{
  "devDependencies": {
    "eslint-plugin-react-hooks": "^5.0.0"
  }
}

// .eslintrc.json
{
  "extends": ["plugin:react-hooks/recommended-legacy"]
}

// 步骤3：启用React Compiler
// babel.config.js
module.exports = {
  plugins: [
    'babel-plugin-react-compiler'
  ]
};

// 步骤4：切换到recommended
// .eslintrc.json
{
  "extends": ["plugin:react-hooks/recommended"]
}

// 步骤5：修复所有lint警告
// - 移除不必要的useMemo/useCallback
// - 修复Compiler配置问题
// - 调整代码以符合最佳实践

// 步骤6：严格模式（可选）
{
  "rules": {
    "react-hooks/exhaustive-deps": "error" // 从warn改为error
  }
}
```

### 5.2 处理lint错误

批量修复lint错误的策略：
```bash
# 1. 查看所有错误
npx eslint src --ext .js,.jsx,.ts,.tsx

# 2. 自动修复简单问题
npx eslint src --ext .js,.jsx,.ts,.tsx --fix

# 3. 查看剩余错误
npx eslint src --ext .js,.jsx,.ts,.tsx --format table

# 4. 按类型分组
npx eslint src --ext .js,.jsx,.ts,.tsx --format json > lint-errors.json

# 分析错误类型
node analyze-errors.js
```

分析脚本：
```javascript
// analyze-errors.js
const fs = require('fs');

const errors = JSON.parse(fs.readFileSync('lint-errors.json', 'utf8'));

const grouped = {};

errors.forEach(file => {
  file.messages.forEach(msg => {
    const ruleId = msg.ruleId || 'unknown';
    if (!grouped[ruleId]) {
      grouped[ruleId] = [];
    }
    grouped[ruleId].push({
      file: file.filePath,
      line: msg.line,
      message: msg.message
    });
  });
});

// 输出统计
Object.entries(grouped)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([rule, instances]) => {
    console.log(`\n${rule}: ${instances.length} errors`);
    console.log('Top 5 files:');
    instances.slice(0, 5).forEach(inst => {
      console.log(`  ${inst.file}:${inst.line} - ${inst.message}`);
    });
  });
```

### 5.3 渐进式启用

分阶段启用严格规则：
```javascript
// 阶段1：警告模式
{
  "rules": {
    "react-hooks/rules-of-hooks": "warn",
    "react-hooks/exhaustive-deps": "warn"
  }
}

// 阶段2：新代码严格，旧代码宽松
{
  "overrides": [
    {
      "files": ["src/new/**/*.{js,jsx,ts,tsx}"],
      "rules": {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error"
      }
    },
    {
      "files": ["src/legacy/**/*.{js,jsx,ts,tsx}"],
      "rules": {
        "react-hooks/rules-of-hooks": "warn",
        "react-hooks/exhaustive-deps": "warn"
      }
    }
  ]
}

// 阶段3：全部严格
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

## 第六部分：CI/CD集成

### 6.1 GitHub Actions配置

在CI中运行lint：
```yaml
# .github/workflows/lint.yml
name: ESLint

on: [push, pull_request]

jobs:
  lint:
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
        run: npx eslint src --ext .js,.jsx,.ts,.tsx --format json --output-file eslint-report.json
      
      - name: Annotate Code
        if: failure()
        uses: ataylorme/eslint-annotate-action@v2
        with:
          report-json: 'eslint-report.json'
      
      - name: Upload ESLint report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: eslint-report
          path: eslint-report.json
```

### 6.2 Pre-commit Hooks

使用Husky和lint-staged：
```json
// package.json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

Husky配置：
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### 6.3 编辑器集成

VSCode配置：
```json
// .vscode/settings.json
{
  "eslint.enable": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.options": {
    "extensions": [".js", ".jsx", ".ts", ".tsx"]
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [
    { "mode": "auto" }
  ]
}
```

## 第七部分：最佳实践

### 7.1 团队规范

制定团队ESLint规范：
```javascript
// eslint.config.team.js
export default [
  reactHooks.configs.flat.recommended,
  {
    rules: {
      // 核心规则：严格执行
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // 自定义规则
      'react-hooks/config': 'error',
      
      // 团队约定
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      
      // React相关
      'react/prop-types': 'off', // 使用TypeScript
      'react/react-in-jsx-scope': 'off', // React 19不需要
      'react/jsx-uses-react': 'off'
    },
    
    settings: {
      'react-hooks': {
        // 团队自定义Hooks
        additionalEffectHooks: '(useEffectOnce|useUpdateEffect|useInterval)'
      }
    }
  }
];
```

代码审查清单：
```
ESLint检查项：
1. 所有Hooks规则通过
2. 无警告（或警告有documented原因）
3. 自定义Hooks正确配置
4. 依赖数组完整且最小
5. 无不必要的手动优化（如果使用Compiler）

手动检查项：
6. Hook命名以use开头
7. 自定义Hook逻辑清晰
8. Effect cleanup正确实现
9. 依赖数组有注释说明（如果特殊）
10. 性能考虑documented
```

### 7.2 常见豁免场景

何时可以禁用规则：
```jsx
// 场景1：已知的安全case
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // 只想在mount时运行一次
    logInitialRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖是有意的
}

// 更好的方式：使用自定义Hook
function useEffectOnce(effect) {
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      effect();
    }
  }, []); // 这个空依赖是合理的
}

function Component() {
  useEffectOnce(() => {
    logInitialRender();
  }); // 无需eslint-disable
}

// 场景2：第三方库的特殊要求
function Component() {
  useEffect(() => {
    // 某些库要求特定的调用方式
    specialLibrary.init({
      onEvent: handleEvent // 库内部会管理这个引用
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 有documented原因
}

// 场景3：性能优化的trade-off
function Component({ heavyData }) {
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // 有意只在mount时计算一次
    // 因为heavyData的计算成本极高
    const computed = expensiveComputation(heavyData);
    setResult(computed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 性能trade-off，有注释说明
  
  return <div>{result}</div>;
}
```

## 第八部分：错误修复模式

### 8.1 常见修复模式

依赖问题的系统化解决：
```jsx
// 模式1：函数依赖
// 问题
function Component({ callback }) {
  useEffect(() => {
    callback();
  }, []); // 缺少callback
}

// 修复选项1：添加依赖
function Component({ callback }) {
  useEffect(() => {
    callback();
  }, [callback]);
}

// 修复选项2：useCallback稳定化
function Parent() {
  const callback = useCallback(() => {
    console.log('called');
  }, []);
  
  return <Component callback={callback} />;
}

// 模式2：对象/数组依赖
// 问题
function Component({ config }) {
  useEffect(() => {
    setup(config);
  }, [config]); // config每次都是新对象
}

// 修复选项1：解构依赖
function Component({ config }) {
  const { apiUrl, timeout } = config;
  
  useEffect(() => {
    setup({ apiUrl, timeout });
  }, [apiUrl, timeout]);
}

// 修复选项2：useMemo稳定化
function Parent() {
  const config = useMemo(() => ({
    apiUrl: 'https://api.example.com',
    timeout: 5000
  }), []);
  
  return <Component config={config} />;
}

// 模式3：state更新函数
// 问题
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // 闭包问题
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 缺少count
}

// 修复：使用函数式更新
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1); // 不依赖外部count
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 无需count依赖
}
```

### 8.2 自动修复工具

使用ESLint自动修复：
```bash
# 自动修复所有可修复的问题
npx eslint src --fix

# 只修复特定规则
npx eslint src --fix --rule 'react-hooks/exhaustive-deps'

# 交互式修复
npx eslint src --fix-dry-run
```

自定义修复脚本：
```javascript
// scripts/fix-hooks.js
const { ESLint } = require('eslint');

async function fixHooks() {
  const eslint = new ESLint({
    fix: true,
    overrideConfig: {
      rules: {
        'react-hooks/exhaustive-deps': 'error'
      }
    }
  });
  
  const results = await eslint.lintFiles(['src/**/*.{js,jsx,ts,tsx}']);
  
  await ESLint.outputFixes(results);
  
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);
  
  console.log(resultText);
  
  const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
  const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);
  
  console.log(`\nTotal: ${errorCount} errors, ${warningCount} warnings`);
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

fixHooks();
```

## 第九部分：性能优化

### 9.1 减少lint时间

优化ESLint性能：
```javascript
// eslint.config.js
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    // 只在需要的文件上运行
  }
];
```

缓存配置：
```json
// package.json
{
  "scripts": {
    "lint": "eslint --cache --cache-location .eslintcache src"
  }
}
```

### 9.2 并行lint

使用并行处理：
```bash
# 并行lint
npx eslint src --ext .js,.jsx,.ts,.tsx --max-warnings 0 --cache

# 或使用并行工具
npm install -D npm-run-all

# package.json
{
  "scripts": {
    "lint:js": "eslint src/**/*.{js,jsx} --cache",
    "lint:ts": "eslint src/**/*.{ts,tsx} --cache",
    "lint": "npm-run-all --parallel lint:*"
  }
}
```

## 常见问题

### Q1: recommended和recommended-legacy有什么区别？

A: recommended包含React Compiler驱动的规则，legacy只有传统规则。

选择指南：
```
使用recommended：
- 已启用React Compiler
- 新项目
- 追求最佳实践
- 愿意移除手动优化

使用recommended-legacy：
- 未启用Compiler
- 旧项目
- 渐进式迁移
- 保留现有优化代码
```

### Q2: 如何处理大量的exhaustive-deps警告？

A: 逐步修复，优先修复真正的bug。

```
优先级：
1. 真正的bug（使用过期值）
2. 性能问题（不必要的重新运行）
3. 代码清晰度（复杂的依赖）
4. 警告消除（合理的豁免）

策略：
1. 自动修复简单问题
2. 手动修复复杂问题
3. 记录合理的豁免
4. 定期审查
```

### Q3: 自定义Hook如何配置lint？

A: 使用additionalEffectHooks或additionalHooks。

### Q4: React Compiler规则可以单独禁用吗？

A: 可以，使用recommended-legacy或自定义规则配置。

### Q5: 如何在现有项目中逐步启用严格规则？

A: 使用overrides按目录或文件分别配置。

## 总结

React 19 ESLint插件更新要点：

核心变化：
```
1. 新的recommended预设
- React Compiler集成
- 增强的规则检查
- 更智能的建议

2. recommended-legacy
- 传统规则
- 向后兼容
- 渐进式迁移

3. 配置格式
- 支持Legacy Config
- 支持Flat Config
- 更灵活的配置
```

配置建议：
```
新项目：
- 使用recommended
- 启用React Compiler
- 严格模式

旧项目：
- 先用recommended-legacy
- 逐步迁移
- 分阶段启用

混合项目：
- 按目录分别配置
- 新代码strict
- 旧代码宽松
```

最佳实践：
```
1. 选择合适的预设
2. 配置自定义Hooks
3. CI/CD集成
4. Pre-commit检查
5. 编辑器集成
6. 定期审查规则
7. 团队培训
8. 文档化豁免原因
```

React 19的ESLint更新让代码质量检查更智能、更有针对性！

