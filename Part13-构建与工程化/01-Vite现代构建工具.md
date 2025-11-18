# Vite现代构建工具

## 课程概述

本章节深入探讨 Vite 现代构建工具,了解其核心原理、优势特性、配置方法以及在 React 项目中的最佳实践。Vite 是新一代前端构建工具,它利用浏览器原生 ES 模块功能和现代 JavaScript 工具链,为开发者提供极速的开发体验。

### 学习目标

- 理解 Vite 的核心工作原理和设计理念
- 掌握 Vite 在 React 项目中的配置和使用
- 了解 Vite 与传统构建工具的区别
- 学习 Vite 的性能优化策略
- 掌握 Vite 的开发服务器和生产构建
- 理解 Vite 的插件系统和生态

## 第一部分:Vite 简介

### 1.1 什么是 Vite

Vite(法语意为"快速的")是由 Vue.js 作者尤雨溪创建的新一代前端构建工具。它诞生于 2020 年,旨在解决传统构建工具在大型项目中启动缓慢的问题。

**核心特性:**

1. **极速的服务器启动** - 无需打包,即时启动开发服务器
2. **快速的热模块替换(HMR)** - 无论应用规模多大,HMR 始终快速
3. **真正的按需编译** - 只编译当前页面需要的代码
4. **丰富的功能** - 对 TypeScript、JSX、CSS 等开箱即用
5. **优化的构建** - 预配置 Rollup 构建,输出高度优化的静态资源
6. **通用的插件接口** - Rollup 插件兼容,丰富的插件生态

### 1.2 Vite 的诞生背景

**传统构建工具的痛点:**

在 Vite 出现之前,前端开发主要使用 Webpack、Parcel 等打包工具:

```javascript
// 传统开发流程
1. 启动开发服务器 → 构建整个应用 → 服务启动 (可能需要几十秒甚至几分钟)
2. 修改代码 → 重新构建模块 → 热更新 (延迟明显)
3. 项目越大,启动和热更新越慢
```

**Vite 的解决方案:**

```javascript
// Vite 开发流程
1. 启动开发服务器 → 即时启动 (通常 < 1 秒)
2. 修改代码 → 精确热更新 → 几乎瞬间完成
3. 项目规模不影响启动和更新速度
```

### 1.3 Vite 的核心原理

#### 开发环境原理

Vite 在开发环境利用浏览器原生的 ES 模块支持:

```javascript
// 传统打包工具:需要先打包所有模块
Bundle → Dev Server → Browser

// Vite:直接提供 ES 模块
Dev Server (ESM) → Browser (Native Import)
```

**工作流程:**

1. **使用 esbuild 预构建依赖** - 将 CommonJS/UMD 转换为 ESM
2. **源码使用原生 ESM** - 浏览器直接请求需要的模块
3. **按需编译** - 只编译浏览器请求的模块
4. **利用 HTTP 缓存** - 依赖模块强缓存,源码模块协商缓存

```javascript
// index.html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="/src/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

// main.jsx (浏览器直接请求)
import React from 'react'  // 预构建的依赖
import App from './App'     // 源码,按需编译
```

#### 生产环境原理

虽然原生 ESM 已被广泛支持,但在生产环境使用未打包的 ESM 仍然存在网络性能问题:

```javascript
// Vite 生产构建使用 Rollup
1. Tree-shaking
2. 代码分割
3. 压缩优化
4. 静态资源处理
```

### 1.4 为什么选择 Vite

**性能优势:**

```javascript
// 启动速度对比 (大型项目)
Webpack: 30-60 秒
Vite:    < 1 秒

// HMR 速度对比
Webpack: 2-5 秒
Vite:    < 100 毫秒
```

**开发体验优势:**

1. **零配置** - 开箱即用,默认配置已经很好
2. **快速反馈** - 修改代码立即看到效果
3. **现代化** - 原生支持 TS、JSX、CSS Modules 等
4. **灵活性** - 丰富的插件系统,易于扩展

## 第二部分:Vite 快速开始

### 2.1 环境要求

Vite 需要 Node.js 版本 18+ 或 20+:

```bash
# 检查 Node.js 版本
node -v

# 推荐使用 Node.js 20 LTS
```

### 2.2 创建 Vite 项目

#### 使用 npm

```bash
# 创建新项目
npm create vite@latest

# 按提示选择:
# Project name: my-react-app
# Select a framework: React
# Select a variant: TypeScript + SWC
```

#### 使用指定模板

```bash
# 直接创建 React + TypeScript 项目
npm create vite@latest my-react-app -- --template react-ts

# 可用模板:
# vanilla, vanilla-ts
# vue, vue-ts
# react, react-ts, react-swc, react-swc-ts
# preact, preact-ts
# lit, lit-ts
# svelte, svelte-ts
```

#### 项目结构

```
my-react-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html          # 入口 HTML
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts      # Vite 配置文件
```

### 2.3 启动开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 输出:
# VITE v5.0.0  ready in 500 ms
#
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**开发服务器特性:**

```javascript
// 1. 极速启动
// 2. 热模块替换 (HMR)
// 3. 源码映射 (Source Maps)
// 4. 错误覆盖层 (Error Overlay)
```

### 2.4 项目配置

基础的 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,        // 自定义端口
    open: true,        // 自动打开浏览器
    cors: true,        // 允许跨域
  },
  build: {
    outDir: 'dist',    // 输出目录
    sourcemap: true,   // 生成 source map
  },
})
```

### 2.5 基础使用示例

#### 导入静态资源

```typescript
// src/App.tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'  // 导入图片
import './App.css'                          // 导入 CSS

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
```

#### 环境变量

```typescript
// .env
VITE_API_URL=https://api.example.com

// .env.development
VITE_API_URL=http://localhost:3001

// .env.production
VITE_API_URL=https://api.production.com
```

```typescript
// 使用环境变量
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

console.log('API URL:', apiUrl)
console.log('Is Development:', isDev)
```

## 第三部分:深入理解 Vite

### 3.1 依赖预构建

Vite 使用 esbuild 预构建依赖,这是 Vite 快速的关键:

```javascript
// node_modules/.vite/deps/ 目录结构
.vite/
└── deps/
    ├── react.js
    ├── react-dom_client.js
    └── _metadata.json
```

**预构建的目的:**

1. **CommonJS 和 UMD 兼容性** - 转换为 ESM
2. **性能优化** - 减少模块请求数量

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['lodash-es', 'axios'],      // 强制预构建
    exclude: ['your-esm-package'],        // 排除预构建
    esbuildOptions: {
      define: {
        global: 'globalThis'              // 定义全局变量
      }
    }
  }
})
```

#### 依赖发现

Vite 自动发现需要预构建的依赖:

```javascript
// 第一次运行时
1. 扫描所有源码中的 import
2. 检测需要预构建的依赖
3. 使用 esbuild 构建
4. 缓存到 node_modules/.vite

// 后续运行
直接使用缓存,除非:
- package.json 的 dependencies 改变
- 包管理器的 lockfile 改变
- vite.config.ts 相关配置改变
```

### 3.2 模块热替换 (HMR)

Vite 提供了一套原生 ESM 的 HMR API:

```typescript
// src/components/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}

// HMR API (React 插件自动处理)
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 模块更新时的回调
  })
}
```

**HMR 工作原理:**

```javascript
// 1. 文件改变
src/components/Counter.tsx 修改

// 2. Vite 检测到改变
通过 chokidar 监听文件系统

// 3. 重新编译模块
只编译改变的模块及其依赖

// 4. WebSocket 推送更新
Server → Client: { type: 'update', path: '/src/components/Counter.tsx' }

// 5. 浏览器更新模块
动态 import 新模块,替换旧模块
```

**自定义 HMR:**

```typescript
// 处理状态保持
if (import.meta.hot) {
  import.meta.hot.accept()
  
  import.meta.hot.dispose((data) => {
    // 保存状态
    data.count = count
  })
  
  if (import.meta.hot.data) {
    // 恢复状态
    count = import.meta.hot.data.count
  }
}
```

### 3.3 CSS 处理

Vite 原生支持多种 CSS 方案:

#### 普通 CSS

```typescript
// 直接导入 CSS
import './style.css'

// CSS 会被注入到页面中
```

#### CSS Modules

```css
/* Button.module.css */
.button {
  background: blue;
  color: white;
}

.primary {
  background: green;
}
```

```typescript
// Button.tsx
import styles from './Button.module.css'

function Button() {
  return (
    <button className={styles.button}>
      Click me
    </button>
  )
}
```

#### CSS 预处理器

```bash
# 安装预处理器
npm install -D sass
npm install -D less
npm install -D stylus
```

```scss
// styles.scss
$primary-color: #3498db;

.container {
  background: $primary-color;
  
  .title {
    font-size: 2rem;
  }
}
```

```typescript
// 直接导入
import './styles.scss'
```

#### PostCSS

```bash
# 安装 PostCSS 和插件
npm install -D postcss autoprefixer tailwindcss
```

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### CSS-in-JS

```typescript
// 使用 styled-components
import styled from 'styled-components'

const Button = styled.button`
  background: blue;
  color: white;
  padding: 10px 20px;
  
  &:hover {
    background: darkblue;
  }
`
```

### 3.4 静态资源处理

#### 导入资源为 URL

```typescript
// 导入图片
import imgUrl from './assets/logo.png'

// imgUrl 是资源的公共路径
<img src={imgUrl} alt="Logo" />
```

#### 导入资源为字符串

```typescript
// 导入为原始字符串
import shaderCode from './shader.glsl?raw'

// 导入 Web Worker
import Worker from './worker?worker'
const worker = new Worker()
```

#### 公共资源

```
public/
├── favicon.ico
├── robots.txt
└── images/
    └── hero.jpg
```

```html
<!-- 直接引用 public 目录下的资源 -->
<img src="/images/hero.jpg" alt="Hero" />
```

#### 资源优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096,  // 小于 4kb 的资源内联为 base64
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
      }
    }
  }
})
```

### 3.5 TypeScript 支持

Vite 原生支持 TypeScript:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**注意事项:**

1. Vite 只进行转译,不进行类型检查
2. 类型检查应该由 IDE 和构建流程处理

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",  // 构建前类型检查
    "type-check": "tsc --noEmit"   // 单独类型检查
  }
}
```

## 第四部分:Vite 构建优化

### 4.1 代码分割

Vite 使用 Rollup 的代码分割功能:

```typescript
// 动态导入自动分割
const UserProfile = lazy(() => import('./components/UserProfile'))

// 手动分割配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lodash': ['lodash-es'],
        }
      }
    }
  }
})
```

#### 自动分割策略

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 node_modules 中的模块分割到 vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          
          // 根据路径分割
          if (id.includes('/src/components/')) {
            return 'components'
          }
        }
      }
    }
  }
})
```

### 4.2 Tree Shaking

Vite 利用 ES 模块的静态结构进行 Tree Shaking:

```typescript
// utils.ts
export function usedFunction() {
  return 'This will be included'
}

export function unusedFunction() {
  return 'This will be removed'
}

// main.ts
import { usedFunction } from './utils'

console.log(usedFunction())
// unusedFunction 会被 tree-shake 掉
```

**优化建议:**

```typescript
// 1. 使用 ES 模块导入
import { specific } from 'package'  // 好
const pkg = require('package')      // 不好

// 2. 避免副作用
// package.json
{
  "sideEffects": false,  // 表示包没有副作用
  // 或
  "sideEffects": ["*.css"]  // 只有 CSS 有副作用
}

// 3. 使用具名导出
export { foo, bar }      // 好
export default { foo, bar }  // 不好
```

### 4.3 生产构建

```bash
# 构建生产版本
npm run build

# 构建输出
dist/
├── assets/
│   ├── index-abc123.css
│   ├── index-def456.js
│   └── logo-ghi789.png
└── index.html
```

**构建配置:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',           // 浏览器兼容目标
    outDir: 'dist',             // 输出目录
    assetsDir: 'assets',        // 静态资源目录
    minify: 'terser',           // 压缩方式
    terserOptions: {
      compress: {
        drop_console: true,     // 移除 console
        drop_debugger: true,    // 移除 debugger
      }
    },
    sourcemap: false,           // 是否生成 sourcemap
    chunkSizeWarningLimit: 500, // chunk 大小警告限制
    cssCodeSplit: true,         // CSS 代码分割
  }
})
```

### 4.4 预览构建

```bash
# 预览生产构建
npm run preview

# 输出:
# VITE v5.0.0  built in 2.5s
# 
# ➜  Local:   http://localhost:4173/
# ➜  Network: use --host to expose
```

```typescript
// vite.config.ts
export default defineConfig({
  preview: {
    port: 8080,
    open: true,
  }
})
```

### 4.5 压缩优化

#### Gzip 压缩

```bash
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,  // 大于 10kb 才压缩
    })
  ]
})
```

#### Brotli 压缩

```typescript
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    })
  ]
})
```

## 第五部分:Vite 插件系统

### 5.1 使用插件

Vite 插件系统基于 Rollup 插件接口:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
})
```

### 5.2 常用插件

#### React 插件

```bash
# React with SWC (推荐,更快)
npm install -D @vitejs/plugin-react-swc

# React with Babel
npm install -D @vitejs/plugin-react
```

```typescript
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react({
      // SWC 选项
      jsxImportSource: '@emotion/react',
    })
  ]
})
```

#### SVG 插件

```bash
npm install -D vite-plugin-svgr
```

```typescript
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      }
    })
  ]
})
```

```typescript
// 使用
import { ReactComponent as Logo } from './logo.svg'

function App() {
  return <Logo />
}
```

#### PWA 插件

```bash
npm install -D vite-plugin-pwa
```

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

#### 自动导入插件

```bash
npm install -D unplugin-auto-import
```

```typescript
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: ['react', 'react-router-dom'],
      dts: 'src/auto-imports.d.ts',
    })
  ]
})
```

```typescript
// 无需手动导入
// import { useState, useEffect } from 'react'

function App() {
  const [count, setCount] = useState(0)  // 自动导入
  
  useEffect(() => {
    console.log(count)
  }, [count])
}
```

### 5.3 创建自定义插件

#### 简单插件

```typescript
// plugins/myPlugin.ts
import type { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    // 开发服务器启动时调用
    configureServer(server) {
      console.log('Dev server started')
    },
    
    // 转换代码
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: transformCode(code),
          map: null
        }
      }
    }
  }
}
```

#### 完整示例:自动注入版本号

```typescript
// plugins/injectVersion.ts
import type { Plugin } from 'vite'

export function injectVersion(): Plugin {
  return {
    name: 'inject-version',
    
    transformIndexHtml(html) {
      const version = process.env.npm_package_version
      return html.replace(
        '</head>',
        `<meta name="version" content="${version}"></head>`
      )
    },
    
    transform(code, id) {
      if (id.endsWith('.tsx') || id.endsWith('.ts')) {
        return code.replace(
          '__APP_VERSION__',
          JSON.stringify(process.env.npm_package_version)
        )
      }
    }
  }
}
```

```typescript
// vite.config.ts
import { injectVersion } from './plugins/injectVersion'

export default defineConfig({
  plugins: [
    react(),
    injectVersion()
  ]
})
```

```typescript
// 使用
console.log('App version:', __APP_VERSION__)
```

## 第六部分:Vite 高级特性

### 6.1 多页面应用

```typescript
// vite.config.ts
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html'),
      }
    }
  }
})
```

```
project/
├── index.html
├── admin/
│   └── index.html
├── mobile/
│   └── index.html
└── src/
    ├── main.tsx
    ├── admin.tsx
    └── mobile.tsx
```

### 6.2 Library 模式

构建一个库:

```typescript
// vite.config.ts
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

```typescript
// src/index.ts
export { Button } from './components/Button'
export { Input } from './components/Input'
export type { ButtonProps } from './components/Button'
```

### 6.3 后端集成

#### Express 集成

```typescript
// server.js
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()
  
  // 创建 Vite 服务器
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })
  
  // 使用 Vite 的中间件
  app.use(vite.middlewares)
  
  app.use('*', async (req, res) => {
    try {
      // 读取 index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      )
      
      // 应用 Vite HTML 转换
      template = await vite.transformIndexHtml(req.originalUrl, template)
      
      // 渲染应用
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
      const appHtml = await render(req.originalUrl)
      
      const html = template.replace(`<!--app-html-->`, appHtml)
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      res.status(500).end(e.stack)
    }
  })
  
  app.listen(3000)
}

createServer()
```

### 6.4 SSR 支持

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    ssr: true,
    rollupOptions: {
      input: './src/entry-server.tsx'
    }
  }
})
```

```typescript
// src/entry-server.tsx
import { renderToString } from 'react-dom/server'
import App from './App'

export function render() {
  const html = renderToString(<App />)
  return { html }
}
```

### 6.5 Web Worker

```typescript
// worker.ts
self.addEventListener('message', (e) => {
  const result = e.data * 2
  self.postMessage(result)
})
```

```typescript
// 使用 Worker
import MyWorker from './worker?worker'

const worker = new MyWorker()

worker.postMessage(10)

worker.addEventListener('message', (e) => {
  console.log('Result:', e.data)  // 20
})
```

**Worker 配置:**

```typescript
// vite.config.ts
export default defineConfig({
  worker: {
    format: 'es',  // 'es' | 'iife'
    plugins: [
      // Worker 特定插件
    ]
  }
})
```

## 第七部分:性能优化实践

### 7.1 开发环境优化

#### 减少依赖预构建

```typescript
export default defineConfig({
  optimizeDeps: {
    entries: ['src/main.tsx'],  // 限制入口文件
    exclude: [
      'large-package-not-used-initially'
    ]
  }
})
```

#### 使用 SWC 替代 Babel

```bash
npm install -D @vitejs/plugin-react-swc
```

```typescript
// 更快的 JSX 转换
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()]
})
```

### 7.2 生产环境优化

#### 减小包体积

```typescript
export default defineConfig({
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // 移除 console 和 debugger
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    
    // 分割大块
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@mui/material']
        }
      }
    }
  }
})
```

#### 资源优化

```typescript
export default defineConfig({
  build: {
    // 图片内联限制
    assetsInlineLimit: 4096,
    
    // 静态资源目录
    assetsDir: 'assets',
    
    rollupOptions: {
      output: {
        // 自定义文件命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          }
          
          return `assets/[name]-[hash][extname]`
        }
      }
    }
  }
})
```

### 7.3 缓存策略

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 使用 hash 命名,利用浏览器缓存
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  
  // 开发环境缓存
  cacheDir: 'node_modules/.vite'
})
```

### 7.4 监控和分析

#### Bundle 分析

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ]
})
```

#### 构建性能分析

```typescript
export default defineConfig({
  build: {
    // 启用性能分析
    reportCompressedSize: true,
    
    // Rollup 性能分析
    rollupOptions: {
      plugins: [
        {
          name: 'timing',
          buildStart() {
            this.buildStartTime = Date.now()
          },
          buildEnd() {
            console.log(
              `Build time: ${Date.now() - this.buildStartTime}ms`
            )
          }
        }
      ]
    }
  }
})
```

## 第八部分:迁移到 Vite

### 8.1 从 Create React App 迁移

#### 1. 安装依赖

```bash
npm install -D vite @vitejs/plugin-react-swc
```

#### 2. 创建配置文件

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
  }
})
```

#### 3. 更新 index.html

```html
<!-- CRA -->
<script src="%PUBLIC_URL%/index.js"></script>

<!-- Vite -->
<script type="module" src="/src/main.tsx"></script>
```

#### 4. 更新环境变量

```bash
# CRA
REACT_APP_API_URL=xxx

# Vite
VITE_API_URL=xxx
```

```typescript
// CRA
process.env.REACT_APP_API_URL

// Vite
import.meta.env.VITE_API_URL
```

#### 5. 更新 package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 8.2 从 Webpack 迁移

#### 处理别名

```typescript
// webpack.config.js
{
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}

// vite.config.ts
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

#### 处理全局变量

```typescript
// webpack.config.js
new webpack.DefinePlugin({
  __DEV__: JSON.stringify(true)
})

// vite.config.ts
export default defineConfig({
  define: {
    __DEV__: JSON.stringify(true)
  }
})
```

#### 处理静态资源

```typescript
// Webpack
import logo from './logo.png'

// Vite (相同)
import logo from './logo.png'

// Webpack raw-loader
import txt from 'raw-loader!./file.txt'

// Vite
import txt from './file.txt?raw'
```

## 第九部分:故障排除

### 9.1 常见问题

#### 依赖预构建问题

```bash
# 清除预构建缓存
rm -rf node_modules/.vite

# 或使用命令
npx vite --force
```

#### 端口占用

```typescript
export default defineConfig({
  server: {
    port: 3000,
    strictPort: false,  // 端口被占用时自动尝试下一个
  }
})
```

#### CORS 问题

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 9.2 调试技巧

#### 启用调试日志

```bash
# 开发环境
DEBUG=vite:* vite

# 构建
DEBUG=vite:* vite build
```

#### 源码映射

```typescript
export default defineConfig({
  build: {
    sourcemap: true,  // 或 'inline' | 'hidden'
  }
})
```

## 第十部分:最佳实践总结

### 10.1 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 组件
├── hooks/           # 自定义 Hooks
├── pages/           # 页面
├── services/        # API 服务
├── stores/          # 状态管理
├── styles/          # 全局样式
├── types/           # 类型定义
├── utils/           # 工具函数
├── App.tsx
└── main.tsx
```

### 10.2 配置建议

```typescript
// vite.config.ts - 完整配置示例
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
    }
  },
  
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
})
```

### 10.3 开发建议

1. **使用 TypeScript** - 获得更好的类型安全
2. **合理使用代码分割** - 提升加载性能
3. **优化依赖** - 只导入需要的模块
4. **使用环境变量** - 区分不同环境配置
5. **启用 HMR** - 提升开发效率
6. **配置路径别名** - 简化导入路径
7. **使用合适的插件** - 扩展功能
8. **定期更新依赖** - 获得最新特性和修复

### 10.4 性能检查清单

- [ ] 启用代码分割
- [ ] 配置合理的 chunk 策略
- [ ] 压缩资源 (Gzip/Brotli)
- [ ] 优化图片资源
- [ ] 启用 Tree Shaking
- [ ] 移除未使用的依赖
- [ ] 使用动态导入
- [ ] 配置缓存策略
- [ ] 分析 bundle 大小
- [ ] 监控构建性能

## 总结

Vite 作为新一代构建工具,通过利用现代浏览器特性和优秀的工程设计,为开发者提供了极致的开发体验:

1. **极速的开发启动** - 无需等待,即时启动
2. **快速的热更新** - 精确更新,即时反馈
3. **优化的生产构建** - 高效打包,性能卓越
4. **丰富的生态系统** - 插件众多,易于扩展
5. **简单的配置** - 开箱即用,配置简单

掌握 Vite 能够显著提升 React 项目的开发效率和应用性能,是现代前端开发者必备的技能之一。

## 扩展阅读

- [Vite 官方文档](https://vitejs.dev)
- [Vite GitHub](https://github.com/vitejs/vite)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
- [Rollup 文档](https://rollupjs.org)
- [esbuild 文档](https://esbuild.github.io)

