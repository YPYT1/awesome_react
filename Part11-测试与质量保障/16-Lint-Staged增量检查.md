# Lint-Staged增量检查

## 概述

lint-staged是一个在Git暂存文件上运行linters的工具。它只对即将提交的文件运行检查,大大提升了检查速度和效率。本文将全面介绍lint-staged在React项目中的配置和使用。

## 为什么需要lint-staged

### 传统Lint的问题

```bash
# 对整个项目运行lint
npm run lint

# 问题:
# 1. 速度慢(检查所有文件)
# 2. 可能会检查到别人的代码
# 3. 遗留代码的lint错误阻碍提交
# 4. 消耗大量时间
```

### lint-staged的优势

```bash
# 只检查暂存的文件
npx lint-staged

# 优势:
# 1. 只检查变更的文件
# 2. 速度快
# 3. 不受遗留代码影响
# 4. 渐进式代码质量提升
```

## 安装与配置

### 安装

```bash
# 安装lint-staged
npm install --save-dev lint-staged

# 通常与husky一起使用
npm install --save-dev husky lint-staged

# 初始化husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 创建pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

### 配置方式

#### 1. package.json配置

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

#### 2. .lintstagedrc.json配置

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,scss,md}": [
    "prettier --write"
  ]
}
```

#### 3. .lintstagedrc.js配置

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

#### 4. lint-staged.config.js配置

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

## 基础配置示例

### React项目配置

```javascript
// .lintstagedrc.js
module.exports = {
  // JavaScript/TypeScript文件
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // 样式文件
  '*.{css,scss,less}': [
    'stylelint --fix',
    'prettier --write',
  ],
  
  // JSON文件
  '*.json': [
    'prettier --write',
  ],
  
  // Markdown文件
  '*.md': [
    'prettier --write',
  ],
};
```

### TypeScript项目配置

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit', // 类型检查
  ],
  
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  '*.{json,css,scss,md}': [
    'prettier --write',
  ],
};
```

## 高级配置

### 运行测试

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests', // 运行相关测试
  ],
};
```

### 添加文件到暂存区

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add', // 将修复后的文件重新添加到暂存区
  ],
};
```

### 函数式配置

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = [];
    
    // ESLint
    commands.push(`eslint --fix ${filenames.join(' ')}`);
    
    // Prettier
    commands.push(`prettier --write ${filenames.join(' ')}`);
    
    // 类型检查
    if (filenames.some((file) => file.endsWith('.ts') || file.endsWith('.tsx'))) {
      commands.push('tsc --noEmit');
    }
    
    // 测试
    commands.push(`jest --bail --findRelatedTests ${filenames.join(' ')}`);
    
    return commands;
  },
};
```

### 并发执行

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write',
  ],
};

// lint-staged会自动并发执行不同模式的任务
```

### 忽略特定文件

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    // 过滤掉特定文件
    const filtered = filenames.filter(
      (file) => !file.includes('generated') && !file.includes('vendor')
    );
    
    if (filtered.length === 0) return [];
    
    return [
      `eslint --fix ${filtered.join(' ')}`,
      `prettier --write ${filtered.join(' ')}`,
    ];
  },
};
```

### 基于文件类型的不同处理

```javascript
// .lintstagedrc.js
module.exports = {
  // TypeScript文件
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit',
  ],
  
  // JavaScript文件
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // 测试文件
  '*.test.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests',
  ],
  
  // 组件文件
  'src/components/**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'npm run validate-components', // 自定义组件验证
  ],
  
  // 样式文件
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write',
  ],
  
  // JSON文件
  '*.json': [
    'prettier --write',
    () => 'npm run validate-json', // JSON验证
  ],
};
```

## 实战案例

### 完整的React + TypeScript配置

```javascript
// .lintstagedrc.js
module.exports = {
  // TypeScript/JavaScript文件
  '*.{ts,tsx,js,jsx}': (filenames) => {
    const commands = [];
    
    // 1. ESLint修复
    commands.push(`eslint --fix ${filenames.join(' ')}`);
    
    // 2. Prettier格式化
    commands.push(`prettier --write ${filenames.join(' ')}`);
    
    // 3. TypeScript类型检查
    const tsFiles = filenames.filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
    if (tsFiles.length > 0) {
      commands.push('tsc --noEmit');
    }
    
    // 4. 运行相关测试
    commands.push(`jest --bail --findRelatedTests ${filenames.join(' ')}`);
    
    return commands;
  },
  
  // 样式文件
  '*.{css,scss,less}': [
    'stylelint --fix',
    'prettier --write',
  ],
  
  // JSON文件
  '*.json': [
    'prettier --write',
  ],
  
  // Markdown文件
  '*.md': [
    'prettier --write',
    'markdownlint --fix',
  ],
  
  // YAML文件
  '*.{yml,yaml}': [
    'prettier --write',
  ],
  
  // package.json
  'package.json': [
    'prettier --write',
    () => 'npm run validate-dependencies', // 验证依赖
  ],
};
```

### Monorepo配置

```javascript
// .lintstagedrc.js
const path = require('path');

module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    // 按包分组
    const filesByPackage = filenames.reduce((acc, filename) => {
      const match = filename.match(/packages\/([^\/]+)/);
      if (match) {
        const pkg = match[1];
        if (!acc[pkg]) acc[pkg] = [];
        acc[pkg].push(filename);
      }
      return acc;
    }, {});
    
    // 为每个包生成命令
    const commands = [];
    Object.entries(filesByPackage).forEach(([pkg, files]) => {
      const cwd = path.join('packages', pkg);
      commands.push(
        `cd ${cwd} && eslint --fix ${files.join(' ')}`,
        `cd ${cwd} && prettier --write ${files.join(' ')}`,
        `cd ${cwd} && jest --bail --findRelatedTests ${files.join(' ')}`
      );
    });
    
    return commands;
  },
};
```

### 渐进式迁移配置

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    const commands = [];
    
    // 新代码(src/新目录)
    const newFiles = filenames.filter((f) => f.includes('src/new'));
    if (newFiles.length > 0) {
      commands.push(`eslint --fix ${newFiles.join(' ')}`);
      commands.push(`prettier --write ${newFiles.join(' ')}`);
      commands.push(`jest --bail --findRelatedTests ${newFiles.join(' ')}`);
    }
    
    // 遗留代码(src/legacy)
    const legacyFiles = filenames.filter((f) => f.includes('src/legacy'));
    if (legacyFiles.length > 0) {
      // 只运行Prettier,不运行ESLint
      commands.push(`prettier --write ${legacyFiles.join(' ')}`);
    }
    
    return commands;
  },
};
```

## 性能优化

### 使用缓存

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --cache --fix', // 使用ESLint缓存
    'prettier --write',
  ],
};
```

### 限制并发

```javascript
// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  },
  "lint-staged-config": {
    "concurrent": false, // 禁用并发
    "chunkSize": 10 // 每次处理10个文件
  }
}
```

### 减少不必要的检查

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    // 跳过node_modules和生成文件
    const filtered = filenames.filter(
      (f) => !f.includes('node_modules') && !f.includes('.generated.')
    );
    
    if (filtered.length === 0) return [];
    
    return [
      `eslint --fix ${filtered.join(' ')}`,
      `prettier --write ${filtered.join(' ')}`,
    ];
  },
};
```

## 与其他工具集成

### 与Husky集成

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### 与Commitlint集成

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行lint-staged
npx lint-staged

# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 验证提交消息
npx --no -- commitlint --edit ${1}
```

### 与Jest集成

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
};

// jest.config.js
module.exports = {
  testMatch: ['**/*.test.{ts,tsx,js,jsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
};
```

### 与TypeScript集成

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit', // 全局类型检查
  ],
  
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
};
```

## 错误处理

### 跳过失败的任务

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    return [
      `eslint --fix ${filenames.join(' ')}`,
      `prettier --write ${filenames.join(' ')}`,
      // 即使类型检查失败也继续
      `tsc --noEmit || true`,
    ];
  },
};
```

### 自定义错误处理

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': async (filenames) => {
    const commands = [];
    
    try {
      // 尝试运行ESLint
      commands.push(`eslint --fix ${filenames.join(' ')}`);
    } catch (error) {
      console.error('ESLint failed:', error);
      // 继续执行其他任务
    }
    
    commands.push(`prettier --write ${filenames.join(' ')}`);
    
    return commands;
  },
};
```

## 调试

### 启用调试模式

```bash
# 显示详细日志
DEBUG=lint-staged* npx lint-staged

# 显示所有执行的命令
npx lint-staged --verbose

# 不执行命令,只显示将要执行的命令
npx lint-staged --debug
```

### 手动测试

```bash
# 测试特定文件
npx lint-staged --config .lintstagedrc.js

# 测试所有暂存文件
git add .
npx lint-staged

# 测试特定模式
npx lint-staged --pattern "*.ts"
```

## 常见问题

### 问题1: TypeScript类型检查影响性能

```javascript
// 解决方案: 使用增量编译
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --incremental --noEmit', // 增量编译
  ],
};
```

### 问题2: 测试运行时间过长

```javascript
// 解决方案: 只运行相关测试
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --maxWorkers=2', // 限制并发数
  ],
};
```

### 问题3: 文件路径包含空格

```javascript
// 解决方案: 使用函数式配置
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    // 对每个文件名进行转义
    const escaped = filenames.map((f) => `"${f}"`);
    return [
      `eslint --fix ${escaped.join(' ')}`,
      `prettier --write ${escaped.join(' ')}`,
    ];
  },
};
```

### 问题4: Windows路径问题

```javascript
// 解决方案: 使用path模块
// .lintstagedrc.js
const path = require('path');

module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    // 规范化路径
    const normalized = filenames.map((f) => path.normalize(f));
    return [
      `eslint --fix ${normalized.join(' ')}`,
      `prettier --write ${normalized.join(' ')}`,
    ];
  },
};
```

## 最佳实践

### 1. 渐进式采用

```javascript
// 第一阶段: 只格式化
module.exports = {
  '*.{ts,tsx,js,jsx}': ['prettier --write'],
};

// 第二阶段: 添加lint
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
};

// 第三阶段: 添加测试
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests',
  ],
};
```

### 2. 快速反馈

```javascript
// 优先执行快速任务
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'prettier --write',      // 快
    'eslint --fix',          // 中等
    'jest --findRelatedTests', // 慢
  ],
};
```

### 3. 合理的任务顺序

```javascript
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'prettier --write',       // 1. 格式化
    'eslint --fix',           // 2. 修复lint错误
    () => 'tsc --noEmit',     // 3. 类型检查
    'jest --findRelatedTests', // 4. 运行测试
  ],
};
```

### 4. 避免重复工作

```javascript
// 不好: ESLint和Prettier都运行格式化
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
};

// 好: 使用eslint-config-prettier避免冲突
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
};

// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
};
```

### 5. 团队协作

```javascript
// 确保所有团队成员使用相同的配置
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint:staged": "lint-staged"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## NPM脚本

```json
{
  "scripts": {
    "lint:staged": "lint-staged",
    "lint:all": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format:staged": "lint-staged",
    "format:all": "prettier --write .",
    "test:staged": "jest --bail --findRelatedTests",
    "test:all": "jest"
  }
}
```

## 总结

lint-staged是提升代码质量和开发效率的重要工具,它能够:

1. **提升速度**: 只检查变更的文件,大大减少检查时间
2. **渐进式改进**: 不受遗留代码影响,逐步提升代码质量
3. **自动化**: 配合Husky自动执行检查
4. **灵活配置**: 支持多种配置方式和自定义规则
5. **团队协作**: 确保所有提交的代码符合团队标准

通过合理配置lint-staged,可以在不影响开发效率的前提下,确保代码质量。

