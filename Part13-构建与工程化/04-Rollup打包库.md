# Rollup打包库

## 课程概述

本章节深入探讨 Rollup 作为专业库打包工具的使用方法。Rollup 专注于 ES 模块,提供优秀的 Tree Shaking 能力,是构建 JavaScript 库的理想选择。我们将学习如何使用 Rollup 打包 React 组件库、工具库等。

### 学习目标

- 理解 Rollup 的核心概念和优势
- 掌握 Rollup 配置和使用方法
- 学习如何打包 JavaScript 库
- 了解各种输出格式(ESM、CJS、UMD)
- 掌握 Rollup 插件的使用
- 学习库的发布和版本管理

## 第一部分:Rollup 基础

### 1.1 什么是 Rollup

Rollup 是一个 JavaScript 模块打包器,将小块代码编译成更大更复杂的代码,如库或应用程序。它使用 ES6 模块标准,而不是以前的 CommonJS 和 AMD。

**核心特点:**

```javascript
1. ES 模块原生支持
2. 优秀的 Tree Shaking
3. 生成简洁的代码
4. 支持多种输出格式
5. 丰富的插件生态
6. 适合库开发
```

### 1.2 Rollup vs Webpack

| 特性 | Rollup | Webpack |
|------|---------|---------|
| 主要用途 | 库打包 | 应用打包 |
| Tree Shaking | 优秀 | 良好 |
| 代码分割 | 支持 | 强大 |
| 热更新 | 需配置 | 内置 |
| 输出代码 | 简洁 | 较复杂 |
| 学习曲线 | 平缓 | 陡峭 |
| 生态系统 | 丰富 | 非常丰富 |

### 1.3 安装 Rollup

```bash
# 安装 Rollup
npm install --save-dev rollup

# 安装常用插件
npm install --save-dev @rollup/plugin-node-resolve
npm install --save-dev @rollup/plugin-commonjs
npm install --save-dev @rollup/plugin-babel
npm install --save-dev @rollup/plugin-typescript
npm install --save-dev @rollup/plugin-terser
```

### 1.4 基础配置

创建 `rollup.config.js`:

```javascript
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  }
}
```

**运行构建:**

```bash
# 使用配置文件构建
rollup -c

# 或使用命令行
rollup src/index.js -o dist/bundle.js -f esm
```

## 第二部分:配置详解

### 2.1 Input 输入配置

```javascript
export default {
  // 单入口
  input: 'src/index.js',
  
  // 多入口
  input: {
    main: 'src/index.js',
    utils: 'src/utils.js'
  },
  
  // 数组形式
  input: [
    'src/index.js',
    'src/utils.js'
  ]
}
```

**入口选项:**

```javascript
export default {
  input: 'src/index.js',
  
  // 外部依赖
  external: ['react', 'react-dom'],
  
  // 插件
  plugins: [],
  
  // 监听选项
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}
```

### 2.2 Output 输出配置

```javascript
export default {
  input: 'src/index.js',
  
  output: {
    // 输出文件
    file: 'dist/bundle.js',
    
    // 输出格式
    format: 'esm',  // 'esm' | 'cjs' | 'umd' | 'iife' | 'amd'
    
    // 输出目录 (用于多输出)
    dir: 'dist',
    
    // 模块名称 (UMD/IIFE)
    name: 'MyLibrary',
    
    // 全局变量
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    },
    
    // 源码映射
    sourcemap: true,
    
    // Banner/Footer
    banner: '/* My Library v1.0.0 */',
    footer: '/* Built with Rollup */',
    
    // 导出模式
    exports: 'auto',  // 'default' | 'named' | 'none' | 'auto'
    
    // 代码分割
    chunkFileNames: '[name]-[hash].js',
    entryFileNames: '[name].js',
    
    // 压缩
    compact: false
  }
}
```

### 2.3 多输出配置

```javascript
export default {
  input: 'src/index.js',
  
  output: [
    // ESM 输出
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    
    // CommonJS 输出
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    
    // UMD 输出
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true,
      globals: {
        react: 'React'
      }
    }
  ]
}
```

### 2.4 外部依赖

```javascript
export default {
  input: 'src/index.js',
  
  // 数组形式
  external: ['react', 'react-dom'],
  
  // 函数形式
  external: (id) => {
    // 排除所有 node_modules
    return id.includes('node_modules')
  },
  
  // 正则表达式
  external: /^@babel\//,
  
  output: {
    format: 'esm',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  }
}
```

## 第三部分:常用插件

### 3.1 Node Resolve 插件

解析 node_modules 中的模块:

```bash
npm install -D @rollup/plugin-node-resolve
```

```javascript
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.js',
  
  plugins: [
    resolve({
      // 扩展名
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      
      // 浏览器环境
      browser: true,
      
      // 使用 browser 字段
      preferBuiltins: false
    })
  ]
}
```

### 3.2 CommonJS 插件

转换 CommonJS 模块为 ES6:

```bash
npm install -D @rollup/plugin-commonjs
```

```javascript
import commonjs from '@rollup/plugin-commonjs'

export default {
  plugins: [
    commonjs({
      // 包含的文件
      include: 'node_modules/**',
      
      // 排除的文件
      exclude: [],
      
      // 动态 require
      transformMixedEsModules: true,
      
      // 忽略特定模块
      ignore: ['conditional-runtime-dependency']
    })
  ]
}
```

### 3.3 Babel 插件

转译现代 JavaScript:

```bash
npm install -D @rollup/plugin-babel @babel/core @babel/preset-env @babel/preset-react
```

```javascript
import babel from '@rollup/plugin-babel'

export default {
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    })
  ]
}
```

**独立 Babel 配置:**

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      modules: false  // 保留 ES 模块
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ]
}
```

### 3.4 TypeScript 插件

```bash
npm install -D @rollup/plugin-typescript typescript tslib
```

```javascript
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
      exclude: ['**/*.test.ts']
    })
  ]
}
```

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### 3.5 Terser 压缩插件

```bash
npm install -D @rollup/plugin-terser
```

```javascript
import terser from '@rollup/plugin-terser'

export default {
  plugins: [
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    })
  ]
}
```

### 3.6 JSON 插件

```bash
npm install -D @rollup/plugin-json
```

```javascript
import json from '@rollup/plugin-json'

export default {
  plugins: [
    json({
      compact: true,
      preferConst: true,
      indent: '  '
    })
  ]
}
```

```javascript
// 使用
import packageInfo from './package.json'
console.log(packageInfo.version)
```

### 3.7 Replace 插件

替换代码中的字符串:

```bash
npm install -D @rollup/plugin-replace
```

```javascript
import replace from '@rollup/plugin-replace'

export default {
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      '__VERSION__': JSON.stringify('1.0.0'),
      preventAssignment: true
    })
  ]
}
```

### 3.8 PostCSS 插件

处理 CSS:

```bash
npm install -D rollup-plugin-postcss
```

```javascript
import postcss from 'rollup-plugin-postcss'

export default {
  plugins: [
    postcss({
      extensions: ['.css', '.scss'],
      extract: true,
      minimize: true,
      modules: true
    })
  ]
}
```

### 3.9 文件复制插件

```bash
npm install -D rollup-plugin-copy
```

```javascript
import copy from 'rollup-plugin-copy'

export default {
  plugins: [
    copy({
      targets: [
        { src: 'src/assets/*', dest: 'dist/assets' },
        { src: 'README.md', dest: 'dist' }
      ]
    })
  ]
}
```

### 3.10 清理插件

```bash
npm install -D rollup-plugin-delete
```

```javascript
import del from 'rollup-plugin-delete'

export default {
  plugins: [
    del({
      targets: 'dist/*',
      verbose: true
    })
  ]
}
```

## 第四部分:React 组件库打包

### 4.1 项目结构

```
my-component-library/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   └── Input/
│   │       ├── Input.tsx
│   │       ├── Input.module.css
│   │       └── index.ts
│   ├── index.ts
│   └── types.ts
├── rollup.config.js
├── package.json
└── tsconfig.json
```

### 4.2 组件示例

```typescript
// src/components/Button/Button.tsx
import React from 'react'
import styles from './Button.module.css'

export interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onClick,
  children
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

```typescript
// src/components/Button/index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

```typescript
// src/index.ts
export { Button } from './components/Button'
export type { ButtonProps } from './components/Button'
export { Input } from './components/Input'
export type { InputProps } from './components/Input'
```

### 4.3 Rollup 配置

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import del from 'rollup-plugin-delete'
import { dts } from 'rollup-plugin-dts'

const packageJson = require('./package.json')

export default [
  // 主构建
  {
    input: 'src/index.ts',
    
    external: ['react', 'react-dom'],
    
    output: [
      // ESM
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      },
      // CommonJS
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ],
    
    plugins: [
      del({ targets: 'dist/*' }),
      
      resolve({
        extensions: ['.tsx', '.ts', '.jsx', '.js']
      }),
      
      commonjs(),
      
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        exclude: ['**/*.test.ts', '**/*.stories.tsx']
      }),
      
      postcss({
        modules: true,
        extract: false,
        minimize: true,
        use: ['sass']
      }),
      
      terser()
    ]
  },
  
  // 类型声明
  {
    input: 'dist/types/index.d.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'esm'
      }
    ],
    plugins: [dts()],
    external: [/\.css$/]
  }
]
```

### 4.4 package.json 配置

```json
{
  "name": "my-component-library",
  "version": "1.0.0",
  "description": "React component library",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-terser": "^0.4.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "@types/react": "^18.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-dts": "^6.0.0",
    "rollup-plugin-postcss": "^4.0.0",
    "rollup-plugin-delete": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 第五部分:工具库打包

### 5.1 工具库示例

```typescript
// src/utils/string.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}
```

```typescript
// src/utils/array.ts
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}
```

```typescript
// src/index.ts
export * from './utils/string'
export * from './utils/array'
```

### 5.2 配置文件

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { dts } from 'rollup-plugin-dts'

const packageJson = require('./package.json')

export default [
  // 主构建
  {
    input: 'src/index.ts',
    
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyUtils',
        sourcemap: true
      }
    ],
    
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      terser()
    ]
  },
  
  // 类型声明
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()]
  }
]
```

## 第六部分:高级功能

### 6.1 代码分割

```javascript
export default {
  input: {
    main: 'src/index.js',
    utils: 'src/utils.js'
  },
  
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: '[name]-[hash].js'
  },
  
  manualChunks: {
    vendor: ['react', 'react-dom']
  }
}
```

**动态导入:**

```javascript
// src/index.js
export function loadHeavyModule() {
  return import('./heavy-module.js')
}
```

### 6.2 Tree Shaking 优化

```javascript
// package.json
{
  "sideEffects": false,
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

```javascript
// rollup.config.js
export default {
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  }
}
```

### 6.3 监听模式

```javascript
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
    clearScreen: false,
    buildDelay: 1000
  }
}
```

**命令行监听:**

```bash
rollup -c -w
```

### 6.4 环境变量

```javascript
import replace from '@rollup/plugin-replace'

export default (commandLineArgs) => {
  const isProduction = commandLineArgs.environment === 'production'
  
  return {
    input: 'src/index.js',
    
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
        preventAssignment: true
      })
    ]
  }
}
```

**使用:**

```bash
rollup -c --environment production
```

### 6.5 Sourcemap 配置

```javascript
export default {
  output: {
    sourcemap: true,              // 外部 sourcemap
    // sourcemap: 'inline',       // 内联 sourcemap
    // sourcemap: 'hidden',       // 生成但不引用
    sourcemapExcludeSources: true // 排除源码
  }
}
```

## 第七部分:发布库

### 7.1 准备发布

```json
// package.json
{
  "name": "@myorg/my-library",
  "version": "1.0.0",
  "description": "My awesome library",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "react",
    "component",
    "library"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/my-library"
  },
  "bugs": {
    "url": "https://github.com/yourusername/my-library/issues"
  },
  "homepage": "https://github.com/yourusername/my-library#readme",
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

### 7.2 版本管理

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 小版本 (1.0.0 -> 1.1.0)
npm version minor

# 大版本 (1.0.0 -> 2.0.0)
npm version major

# 预发布版本
npm version prerelease --preid=beta
```

### 7.3 发布到 npm

```bash
# 登录 npm
npm login

# 发布
npm publish

# 发布作用域包
npm publish --access public

# 发布 beta 版本
npm publish --tag beta
```

### 7.4 .npmignore

```
# .npmignore
src/
*.test.ts
*.test.tsx
*.stories.tsx
.storybook/
rollup.config.js
tsconfig.json
.gitignore
.eslintrc
.prettierrc
```

## 第八部分:最佳实践

### 8.1 完整配置示例

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import postcss from 'rollup-plugin-postcss'
import { dts } from 'rollup-plugin-dts'
import del from 'rollup-plugin-delete'

const packageJson = require('./package.json')

const isProduction = process.env.NODE_ENV === 'production'

export default [
  // 主构建
  {
    input: 'src/index.ts',
    
    external: [
      'react',
      'react-dom',
      /^@babel\/runtime/
    ],
    
    output: [
      // ESM
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      },
      // CommonJS
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      // UMD
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyLibrary',
        sourcemap: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    ],
    
    plugins: [
      del({ targets: 'dist/*' }),
      
      resolve({
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.css'],
        browser: true
      }),
      
      commonjs({
        include: 'node_modules/**'
      }),
      
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        exclude: ['**/*.test.ts', '**/*.stories.tsx']
      }),
      
      postcss({
        modules: true,
        extract: false,
        minimize: isProduction,
        use: ['sass'],
        config: {
          path: './postcss.config.js'
        }
      }),
      
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
        preventAssignment: true
      }),
      
      isProduction && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: {
          comments: false
        }
      })
    ].filter(Boolean),
    
    treeshake: {
      moduleSideEffects: false
    }
  },
  
  // 类型声明
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()],
    external: [/\.css$/, /\.scss$/]
  }
]
```

### 8.2 性能优化

**1. 合理使用插件:**

```javascript
export default {
  plugins: [
    // 按需使用插件
    isProduction && terser(),
    isDevelopment && serve()
  ].filter(Boolean)
}
```

**2. 缓存优化:**

```javascript
export default {
  cache: true,  // 启用缓存
  
  plugins: [
    typescript({
      cacheDir: '.rollup.tscache'
    })
  ]
}
```

**3. 并行处理:**

```bash
npm install -D rollup-plugin-parallel
```

```javascript
import parallel from 'rollup-plugin-parallel'

export default {
  plugins: [
    parallel()
  ]
}
```

### 8.3 调试技巧

```javascript
export default {
  // 详细输出
  output: {
    // ...
    indent: true,
    compact: false
  },
  
  // 保留模块结构
  preserveModules: true,
  preserveModulesRoot: 'src',
  
  onwarn(warning, warn) {
    // 忽略特定警告
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    warn(warning)
  }
}
```

## 第九部分:Monorepo 支持

### 9.1 Monorepo 结构

```
monorepo/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   ├── rollup.config.js
│   │   └── package.json
│   ├── ui/
│   │   ├── src/
│   │   ├── rollup.config.js
│   │   └── package.json
│   └── utils/
│       ├── src/
│       ├── rollup.config.js
│       └── package.json
└── package.json
```

### 9.2 共享配置

```javascript
// rollup.config.base.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export function createConfig(packageJson) {
  return {
    input: 'src/index.ts',
    
    external: Object.keys(packageJson.peerDependencies || {}),
    
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    
    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  }
}
```

```javascript
// packages/core/rollup.config.js
import { createConfig } from '../../rollup.config.base.js'
import packageJson from './package.json'

export default createConfig(packageJson)
```

## 总结

本章全面介绍了 Rollup 打包库的方法:

1. **基础概念** - Rollup 的核心特性和优势
2. **配置详解** - Input、Output、External 配置
3. **插件系统** - 常用插件的使用方法
4. **库打包** - React 组件库和工具库打包
5. **高级功能** - 代码分割、Tree Shaking、Sourcemap
6. **发布流程** - 版本管理和 npm 发布
7. **最佳实践** - 完整配置和性能优化
8. **Monorepo** - Monorepo 项目中的使用

Rollup 是构建 JavaScript 库的理想选择,其优秀的 Tree Shaking 和简洁的输出代码使其成为库开发的首选工具。

## 扩展阅读

- [Rollup 官方文档](https://rollupjs.org/)
- [Rollup 插件列表](https://github.com/rollup/awesome)
- [如何发布 npm 包](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本](https://semver.org/lang/zh-CN/)

