# Vite配置与插件

## 课程概述

本章节深入探讨 Vite 的配置系统和插件生态,学习如何通过配置和插件来定制和扩展 Vite 的功能。掌握 Vite 的配置技巧和插件开发能力,能够帮助您构建更强大、更高效的前端应用。

### 学习目标

- 深入理解 Vite 配置文件的结构和选项
- 掌握各种配置项的使用方法和最佳实践
- 学习如何选择和使用 Vite 插件
- 了解常用插件的功能和配置
- 掌握自定义插件的开发方法
- 学习插件的执行顺序和生命周期

## 第一部分:Vite 配置基础

### 1.1 配置文件概述

Vite 使用 `vite.config.ts` (或 `.js`, `.mjs`) 作为配置文件:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  // 配置选项
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

**配置文件位置:**

```
project/
├── vite.config.ts        # 默认配置文件
├── vite.config.js        # JavaScript 配置
├── vite.config.mjs       # ES 模块配置
└── package.json
```

### 1.2 智能配置提示

使用 `defineConfig` 获得 TypeScript 类型提示:

```typescript
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'

// 方式 1: 使用 defineConfig
export default defineConfig({
  // 自动类型提示
})

// 方式 2: 类型注解
const config: UserConfig = {
  // 手动类型提示
}
export default config

// 方式 3: JSDoc
/** @type {import('vite').UserConfig} */
export default {
  // JSDoc 类型提示
}
```

### 1.3 条件配置

根据环境或命令返回不同配置:

```typescript
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // 开发环境配置
    return {
      server: {
        port: 3000
      }
    }
  } else {
    // 生产环境配置
    return {
      build: {
        rollupOptions: {
          // ...
        }
      }
    }
  }
})
```

**参数说明:**

```typescript
interface ConfigEnv {
  command: 'build' | 'serve'  // 运行的命令
  mode: string                // 环境模式
  ssrBuild?: boolean          // 是否为 SSR 构建
}
```

### 1.4 异步配置

支持异步配置函数:

```typescript
import { defineConfig } from 'vite'

export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  
  return {
    // 使用异步数据的配置
    define: {
      __APP_DATA__: JSON.stringify(data)
    }
  }
})
```

### 1.5 多配置文件

为不同场景创建多个配置文件:

```typescript
// vite.config.base.ts - 基础配置
import { defineConfig } from 'vite'

export const baseConfig = defineConfig({
  // 共享配置
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

```typescript
// vite.config.dev.ts - 开发配置
import { defineConfig, mergeConfig } from 'vite'
import { baseConfig } from './vite.config.base'

export default mergeConfig(baseConfig, defineConfig({
  server: {
    port: 3000
  }
}))
```

```typescript
// vite.config.prod.ts - 生产配置
import { defineConfig, mergeConfig } from 'vite'
import { baseConfig } from './vite.config.base'

export default mergeConfig(baseConfig, defineConfig({
  build: {
    minify: 'terser'
  }
}))
```

**使用特定配置:**

```bash
# 使用开发配置
vite --config vite.config.dev.ts

# 使用生产配置
vite build --config vite.config.prod.ts
```

## 第二部分:核心配置选项

### 2.1 根目录配置

```typescript
export default defineConfig({
  // 项目根目录
  root: process.cwd(),
  
  // 公共基础路径
  base: '/',
  
  // 环境变量目录
  envDir: './',
  
  // 环境变量前缀
  envPrefix: 'VITE_'
})
```

**base 配置示例:**

```typescript
// 部署到子路径
export default defineConfig({
  base: '/my-app/',  // https://example.com/my-app/
})

// 相对路径 (使用 ./)
export default defineConfig({
  base: './',  // 相对于部署位置
})

// 使用环境变量
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/'
})
```

### 2.2 路径解析配置

```typescript
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    // 路径别名
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@store': resolve(__dirname, 'src/store'),
      '@services': resolve(__dirname, 'src/services'),
      '@types': resolve(__dirname, 'src/types'),
      '@styles': resolve(__dirname, 'src/styles'),
    },
    
    // 导入时想要省略的扩展名列表
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    
    // 解析包时的条件
    conditions: ['import', 'module', 'browser', 'default'],
    
    // 解析包入口点时的字段
    mainFields: ['module', 'jsnext:main', 'jsnext'],
    
    // 启用符号链接
    preserveSymlinks: false,
  }
})
```

**使用别名:**

```typescript
// 使用前
import Button from '../../../components/Button'
import { formatDate } from '../../../utils/date'

// 使用后
import Button from '@components/Button'
import { formatDate } from '@utils/date'
```

**TypeScript 配置:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### 2.3 服务器配置

```typescript
export default defineConfig({
  server: {
    // 端口
    port: 3000,
    
    // 端口被占用时是否直接退出
    strictPort: false,
    
    // 服务器主机名
    host: '0.0.0.0',  // 或 true, 'localhost'
    
    // 自动打开浏览器
    open: true,
    
    // HTTPS
    https: false,
    // 或使用证书
    https: {
      key: fs.readFileSync('path/to/key.pem'),
      cert: fs.readFileSync('path/to/cert.pem')
    },
    
    // CORS
    cors: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    
    // 预热文件
    warmup: {
      clientFiles: ['./src/components/*.tsx']
    },
    
    // WebSocket 配置
    ws: true,
    
    // 中间件模式
    middlewareMode: false,
    
    // 文件监听
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    
    // HMR
    hmr: {
      overlay: true,  // 错误覆盖层
      port: 3001      // HMR 端口
    }
  }
})
```

**代理配置详解:**

```typescript
export default defineConfig({
  server: {
    proxy: {
      // 字符串简写
      '/foo': 'http://localhost:4567',
      
      // 带选项
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      
      // 正则表达式
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      },
      
      // WebSocket
      '/socket.io': {
        target: 'ws://localhost:3001',
        ws: true
      },
      
      // 自定义配置函数
      '/custom': {
        target: 'http://localhost:8080',
        configure: (proxy, options) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err)
          })
        }
      }
    }
  }
})
```

### 2.4 构建配置

```typescript
export default defineConfig({
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 静态资源内联限制 (bytes)
    assetsInlineLimit: 4096,
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // CSS 目标浏览器
    cssTarget: 'chrome61',
    
    // 生成 source map
    sourcemap: false,  // true | 'inline' | 'hidden'
    
    // Rollup 配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    
    // 自定义底层 Rollup 打包配置
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    
    // 构建目标
    target: 'modules',  // 'esnext' | 'es2020' | 'es2015' 等
    
    // 压缩方式
    minify: 'esbuild',  // 'terser' | 'esbuild' | false
    
    // Terser 选项
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    
    // 禁用 gzip 压缩大小报告
    reportCompressedSize: true,
    
    // chunk 大小警告的限制
    chunkSizeWarningLimit: 500,
    
    // 监听模式
    watch: null,
    
    // 清空输出目录
    emptyOutDir: true,
    
    // SSR 构建
    ssr: false,
    
    // 库模式
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: 'my-lib',
      formats: ['es', 'cjs']
    }
  }
})
```

**构建优化配置:**

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 第三方库单独打包
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react'
            }
            if (id.includes('antd')) {
              return 'antd'
            }
            if (id.includes('lodash')) {
              return 'lodash'
            }
            return 'vendor'
          }
        },
        
        // 自定义文件命名
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images'
          } else if (/woff2?|ttf|otf|eot/i.test(extType)) {
            extType = 'fonts'
          }
          
          return `${extType}/[name]-[hash][extname]`
        }
      }
    }
  }
})
```

### 2.5 预览配置

```typescript
export default defineConfig({
  preview: {
    // 端口
    port: 4173,
    
    // 端口被占用时是否直接退出
    strictPort: false,
    
    // 服务器主机名
    host: true,
    
    // 自动打开浏览器
    open: true,
    
    // HTTPS
    https: false,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
    
    // CORS
    cors: true,
    
    // 请求头
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})
```

### 2.6 优化配置

```typescript
export default defineConfig({
  optimizeDeps: {
    // 强制预构建的依赖项
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lodash-es'
    ],
    
    // 排除预构建的依赖项
    exclude: ['your-esm-package'],
    
    // 预构建入口
    entries: ['./src/main.tsx'],
    
    // esbuild 选项
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        // esbuild 插件
      ]
    },
    
    // 强制进行依赖预构建
    force: false,
    
    // 禁用依赖项发现
    disabled: false
  }
})
```

### 2.7 SSR 配置

```typescript
export default defineConfig({
  ssr: {
    // SSR 外部化的依赖
    external: ['some-dep'],
    
    // SSR 不外部化的依赖
    noExternal: ['another-dep'],
    
    // SSR 构建目标
    target: 'node',  // 'node' | 'webworker'
    
    // SSR 格式
    format: 'cjs'    // 'cjs' | 'esm'
  }
})
```

### 2.8 Worker 配置

```typescript
export default defineConfig({
  worker: {
    // Worker bundle 格式
    format: 'es',  // 'es' | 'iife'
    
    // Worker 插件
    plugins: [],
    
    // Rollup 选项
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  }
})
```

## 第三部分:环境变量与模式

### 3.1 环境变量文件

Vite 使用 dotenv 加载环境变量:

```bash
.env                # 所有情况下都会加载
.env.local          # 所有情况下都会加载,但会被 git 忽略
.env.[mode]         # 只在指定模式下加载
.env.[mode].local   # 只在指定模式下加载,但会被 git 忽略
```

**优先级:**

```
.env.[mode].local > .env.[mode] > .env.local > .env
```

### 3.2 定义环境变量

```bash
# .env
VITE_APP_TITLE=My App
VITE_API_BASE_URL=https://api.example.com

# .env.development
VITE_API_BASE_URL=http://localhost:3001
VITE_DEBUG=true

# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_DEBUG=false
```

**注意事项:**

1. 只有以 `VITE_` 开头的变量才会暴露给客户端
2. 不要在环境变量中存储敏感信息

### 3.3 使用环境变量

```typescript
// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE

console.log('API URL:', apiUrl)
console.log('Is Development:', isDev)
console.log('Current Mode:', mode)
```

**内置环境变量:**

```typescript
import.meta.env.MODE          // 应用运行的模式
import.meta.env.BASE_URL      // 部署应用时的基本 URL
import.meta.env.PROD          // 是否运行在生产环境
import.meta.env.DEV           // 是否运行在开发环境
import.meta.env.SSR           // 是否运行在 server 上
```

### 3.4 TypeScript 类型定义

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_DEBUG: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 3.5 动态环境变量

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      // 注入环境变量
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000
    }
  }
})
```

### 3.6 自定义模式

```bash
# 开发模式
npm run dev           # mode = development

# 生产模式
npm run build         # mode = production

# 自定义模式
npm run dev -- --mode staging
npm run build -- --mode staging
```

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "build": "vite build",
    "build:staging": "vite build --mode staging"
  }
}
```

## 第四部分:Vite 插件系统

### 4.1 插件基础

Vite 插件扩展了 Rollup 插件接口:

```typescript
// plugins/myPlugin.ts
import type { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',  // 必需,插件名称
    
    // 钩子
    config(config, env) {
      // 修改配置
    },
    
    configResolved(config) {
      // 配置解析完成
    },
    
    configureServer(server) {
      // 配置开发服务器
    },
    
    transformIndexHtml(html) {
      // 转换 index.html
    },
    
    transform(code, id) {
      // 转换代码
    }
  }
}
```

### 4.2 插件执行顺序

```typescript
export default defineConfig({
  plugins: [
    {
      name: 'plugin-pre',
      enforce: 'pre',  // 最先执行
    },
    {
      name: 'plugin-normal',
      // 默认执行顺序
    },
    {
      name: 'plugin-post',
      enforce: 'post',  // 最后执行
    }
  ]
})
```

**执行顺序:**

```
1. Alias
2. enforce: 'pre' 的用户插件
3. Vite 核心插件
4. 没有 enforce 的用户插件
5. Vite 构建插件
6. enforce: 'post' 的用户插件
7. Vite 构建后置插件
```

### 4.3 条件应用插件

```typescript
export default defineConfig({
  plugins: [
    {
      name: 'dev-only-plugin',
      apply: 'serve'  // 只在开发环境应用
    },
    {
      name: 'build-only-plugin',
      apply: 'build'  // 只在构建时应用
    },
    {
      name: 'custom-apply-plugin',
      apply(config, { command }) {
        // 自定义应用条件
        return command === 'build' && config.mode === 'production'
      }
    }
  ]
})
```

## 第五部分:常用插件详解

### 5.1 React 插件

#### @vitejs/plugin-react-swc

```bash
npm install -D @vitejs/plugin-react-swc
```

```typescript
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh 选项
      fastRefresh: true,
      
      // SWC 选项
      jsxImportSource: '@emotion/react',
      
      // 开发装饰器
      devTarget: 'es2022'
    })
  ]
})
```

#### @vitejs/plugin-react

```bash
npm install -D @vitejs/plugin-react
```

```typescript
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Babel 配置
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      },
      
      // Fast Refresh 选项
      fastRefresh: true,
      
      // JSX Runtime
      jsxRuntime: 'automatic',  // 'automatic' | 'classic'
      
      // JSX Import Source
      jsxImportSource: '@emotion/react'
    })
  ]
})
```

### 5.2 自动导入插件

```bash
npm install -D unplugin-auto-import
```

```typescript
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      // 预设
      imports: [
        'react',
        'react-router-dom',
        {
          'ahooks': ['useRequest', 'useLocalStorageState']
        }
      ],
      
      // 自动导入的目录
      dirs: [
        './src/hooks',
        './src/utils'
      ],
      
      // 类型声明文件
      dts: './src/auto-imports.d.ts',
      
      // ESLint 配置
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json'
      }
    })
  ]
})
```

**使用效果:**

```typescript
// 之前
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 之后 (自动导入)
function App() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()
}
```

### 5.3 组件自动导入

```bash
npm install -D unplugin-vue-components
```

```typescript
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    Components({
      // 组件目录
      dirs: ['src/components'],
      
      // 组件扩展名
      extensions: ['tsx', 'ts'],
      
      // 自动导入的解析器
      resolvers: [
        AntDesignVueResolver()
      ],
      
      // 类型声明文件
      dts: 'src/components.d.ts',
      
      // 深度搜索
      deep: true,
      
      // 包含的文件
      include: [/\.tsx$/, /\.ts$/]
    })
  ]
})
```

### 5.4 SVG 处理插件

```bash
npm install -D vite-plugin-svgr
```

```typescript
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr({
      // SVGR 选项
      svgrOptions: {
        icon: true,
        dimensions: false,
        typescript: true
      },
      
      // 包含的文件
      include: '**/*.svg',
      
      // 排除的文件
      exclude: ''
    })
  ]
})
```

**使用方式:**

```typescript
// 作为 URL
import logoUrl from './logo.svg'

// 作为 React 组件
import { ReactComponent as Logo } from './logo.svg?react'

function App() {
  return (
    <div>
      <img src={logoUrl} alt="Logo" />
      <Logo />
    </div>
  )
}
```

### 5.5 PWA 插件

```bash
npm install -D vite-plugin-pwa
```

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      // 注册类型
      registerType: 'autoUpdate',
      
      // Workbox 选项
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7  // 1 week
              }
            }
          }
        ]
      },
      
      // Manifest
      manifest: {
        name: 'My App',
        short_name: 'App',
        description: 'My awesome app',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      // 开发选项
      devOptions: {
        enabled: true
      }
    })
  ]
})
```

### 5.6 图片优化插件

```bash
npm install -D vite-plugin-imagemin
```

```typescript
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      // 图片压缩
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 80
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  ]
})
```

### 5.7 压缩插件

```bash
npm install -D vite-plugin-compression
```

```typescript
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,  // 10KB 以上才压缩
      deleteOriginFile: false
    }),
    
    // Brotli 压缩
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240
    })
  ]
})
```

### 5.8 可视化分析插件

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      // 输出文件
      filename: 'dist/stats.html',
      
      // 自动打开
      open: true,
      
      // Gzip 大小
      gzipSize: true,
      
      // Brotli 大小
      brotliSize: true,
      
      // 模板类型
      template: 'treemap'  // 'sunburst' | 'treemap' | 'network'
    })
  ]
})
```

### 5.9 环境变量插件

```bash
npm install -D vite-plugin-env-compatible
```

```typescript
import envCompatible from 'vite-plugin-env-compatible'

export default defineConfig({
  plugins: [
    envCompatible({
      // 兼容 CRA 的环境变量前缀
      prefix: 'REACT_APP_'
    })
  ]
})
```

### 5.10 HTML 插件

```bash
npm install -D vite-plugin-html
```

```typescript
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      // 压缩
      minify: true,
      
      // 注入数据
      inject: {
        data: {
          title: 'My App',
          injectScript: '<script src="./inject.js"></script>'
        }
      },
      
      // 标签
      tags: [
        {
          injectTo: 'head',
          tag: 'meta',
          attrs: {
            name: 'description',
            content: 'My awesome app'
          }
        }
      ]
    })
  ]
})
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
    <%= injectScript %>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## 第六部分:自定义插件开发

### 6.1 插件基本结构

```typescript
import type { Plugin, ResolvedConfig } from 'vite'

export function myCustomPlugin(options = {}): Plugin {
  let config: ResolvedConfig
  
  return {
    name: 'my-custom-plugin',
    
    // 配置钩子
    config(config, env) {
      // 返回部分配置(会与现有配置合并)
      return {
        define: {
          __PLUGIN_VERSION__: JSON.stringify('1.0.0')
        }
      }
    },
    
    // 配置解析完成
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    
    // 配置开发服务器
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next()
      })
    },
    
    // 转换 HTML
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        '<script>console.log("Plugin loaded")</script></head>'
      )
    },
    
    // 解析模块 ID
    resolveId(source) {
      if (source === 'virtual-module') {
        return source
      }
    },
    
    // 加载模块
    load(id) {
      if (id === 'virtual-module') {
        return 'export default "Virtual module content"'
      }
    },
    
    // 转换代码
    transform(code, id) {
      if (id.endsWith('.custom')) {
        // 转换代码
        return {
          code: transformedCode,
          map: null
        }
      }
    },
    
    // 构建开始
    buildStart() {
      console.log('Build started')
    },
    
    // 构建结束
    buildEnd() {
      console.log('Build ended')
    },
    
    // 关闭
    closeBundle() {
      console.log('Bundle closed')
    }
  }
}
```

### 6.2 实战:自动导入样式插件

```typescript
// plugins/autoImportStyles.ts
import type { Plugin } from 'vite'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import fs from 'fs'
import path from 'path'

interface Options {
  extensions?: string[]
  styleDir?: string
}

export function autoImportStyles(options: Options = {}): Plugin {
  const {
    extensions = ['.tsx', '.ts'],
    styleDir = 'src/styles'
  } = options
  
  return {
    name: 'auto-import-styles',
    
    transform(code, id) {
      // 只处理指定扩展名的文件
      if (!extensions.some(ext => id.endsWith(ext))) {
        return null
      }
      
      try {
        // 解析代码为 AST
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx']
        })
        
        let componentName = ''
        
        // 遍历 AST 寻找组件定义
        traverse(ast, {
          // 函数声明
          FunctionDeclaration(path) {
            componentName = path.node.id?.name || ''
          },
          
          // 箭头函数 const Component = () => {}
          VariableDeclarator(path) {
            if (path.node.id.type === 'Identifier') {
              componentName = path.node.id.name
            }
          }
        })
        
        if (!componentName) {
          return null
        }
        
        // 检查样式文件是否存在
        const styleFile = path.join(
          process.cwd(),
          styleDir,
          `${componentName}.css`
        )
        
        if (fs.existsSync(styleFile)) {
          // 自动添加样式导入
          const importStatement = `import '${styleDir}/${componentName}.css';\n`
          
          return {
            code: importStatement + code,
            map: null
          }
        }
      } catch (error) {
        console.error('Parse error:', error)
      }
      
      return null
    }
  }
}
```

**使用插件:**

```typescript
// vite.config.ts
import { autoImportStyles } from './plugins/autoImportStyles'

export default defineConfig({
  plugins: [
    autoImportStyles({
      styleDir: 'src/styles',
      extensions: ['.tsx']
    })
  ]
})
```

### 6.3 实战:环境变量注入插件

```typescript
// plugins/injectEnv.ts
import type { Plugin } from 'vite'

interface EnvConfig {
  [key: string]: string | number | boolean
}

export function injectEnv(envConfig: EnvConfig): Plugin {
  return {
    name: 'inject-env',
    
    config() {
      // 将环境变量转换为可注入的格式
      const define: Record<string, string> = {}
      
      for (const [key, value] of Object.entries(envConfig)) {
        define[`__ENV_${key}__`] = JSON.stringify(value)
      }
      
      return {
        define
      }
    },
    
    transformIndexHtml(html) {
      // 在 HTML 中注入环境变量脚本
      const envScript = `
        <script>
          window.__APP_ENV__ = ${JSON.stringify(envConfig)};
        </script>
      `
      
      return html.replace('</head>', `${envScript}</head>`)
    }
  }
}
```

**使用:**

```typescript
// vite.config.ts
import { injectEnv } from './plugins/injectEnv'

export default defineConfig({
  plugins: [
    injectEnv({
      API_URL: 'https://api.example.com',
      APP_VERSION: '1.0.0',
      FEATURE_FLAG: true
    })
  ]
})
```

```typescript
// 在代码中使用
console.log(__ENV_API_URL__)
console.log(window.__APP_ENV__)
```

### 6.4 实战:虚拟模块插件

```typescript
// plugins/virtualModule.ts
import type { Plugin } from 'vite'

export function virtualModule(): Plugin {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  
  return {
    name: 'virtual-module',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `
          export const version = '1.0.0'
          export const buildTime = '${new Date().toISOString()}'
          export const config = ${JSON.stringify({
            env: process.env.NODE_ENV,
            api: process.env.VITE_API_URL
          })}
        `
      }
    }
  }
}
```

**使用虚拟模块:**

```typescript
// 声明虚拟模块类型
// vite-env.d.ts
declare module 'virtual:my-module' {
  export const version: string
  export const buildTime: string
  export const config: {
    env: string
    api: string
  }
}
```

```typescript
// 使用
import { version, buildTime, config } from 'virtual:my-module'

console.log('Version:', version)
console.log('Build Time:', buildTime)
console.log('Config:', config)
```

### 6.5 实战:代码转换插件

```typescript
// plugins/transformCode.ts
import type { Plugin } from 'vite'
import MagicString from 'magic-string'

export function transformCode(): Plugin {
  return {
    name: 'transform-code',
    
    transform(code, id) {
      if (!id.endsWith('.tsx')) {
        return null
      }
      
      const s = new MagicString(code)
      
      // 替换特定模式
      const pattern = /console\.log\((.*?)\)/g
      let match
      
      while ((match = pattern.exec(code)) !== null) {
        const start = match.index
        const end = start + match[0].length
        
        // 添加文件信息
        s.overwrite(
          start,
          end,
          `console.log('[${id}]', ${match[1]})`
        )
      }
      
      if (!s.hasChanged()) {
        return null
      }
      
      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    }
  }
}
```

## 第七部分:插件最佳实践

### 7.1 插件开发原则

**1. 单一职责:**

```typescript
// 好 - 每个插件只做一件事
export function optimizeImages(): Plugin { }
export function compressAssets(): Plugin { }

// 不好 - 插件功能过多
export function doEverything(): Plugin { }
```

**2. 配置灵活:**

```typescript
interface PluginOptions {
  enabled?: boolean
  include?: string | string[]
  exclude?: string | string[]
  [key: string]: any
}

export function myPlugin(options: PluginOptions = {}): Plugin {
  const {
    enabled = true,
    include = ['**/*.tsx'],
    exclude = ['node_modules/**']
  } = options
  
  return {
    name: 'my-plugin',
    apply: enabled ? undefined : () => false,
    // ...
  }
}
```

**3. 错误处理:**

```typescript
export function safePlugin(): Plugin {
  return {
    name: 'safe-plugin',
    
    transform(code, id) {
      try {
        // 转换逻辑
        return transformCode(code)
      } catch (error) {
        // 记录错误但不中断构建
        this.warn(`Transform failed for ${id}: ${error.message}`)
        return null
      }
    }
  }
}
```

### 7.2 性能优化

**1. 文件过滤:**

```typescript
export function optimizedPlugin(): Plugin {
  return {
    name: 'optimized-plugin',
    
    transform(code, id) {
      // 早期返回,避免不必要的处理
      if (!id.includes('/src/')) {
        return null
      }
      
      if (id.includes('node_modules')) {
        return null
      }
      
      // 处理逻辑
    }
  }
}
```

**2. 缓存结果:**

```typescript
export function cachedPlugin(): Plugin {
  const cache = new Map()
  
  return {
    name: 'cached-plugin',
    
    transform(code, id) {
      // 检查缓存
      if (cache.has(id)) {
        const cached = cache.get(id)
        if (cached.code === code) {
          return cached.result
        }
      }
      
      // 处理并缓存
      const result = processCode(code)
      cache.set(id, { code, result })
      
      return result
    },
    
    buildEnd() {
      // 清理缓存
      cache.clear()
    }
  }
}
```

### 7.3 调试技巧

```typescript
export function debugPlugin(debug = false): Plugin {
  return {
    name: 'debug-plugin',
    
    config(config, env) {
      if (debug) {
        console.log('Config:', config)
        console.log('Env:', env)
      }
    },
    
    transform(code, id) {
      if (debug && id.includes('target-file')) {
        console.log('Transform:', id)
        console.log('Code:', code)
      }
      
      const result = transform(code)
      
      if (debug) {
        console.log('Result:', result)
      }
      
      return result
    }
  }
}
```

## 总结

本章深入探讨了 Vite 的配置系统和插件生态:

1. **配置系统** - 全面了解 Vite 的各种配置选项
2. **环境变量** - 掌握环境变量的使用和管理
3. **插件系统** - 理解 Vite 插件的工作原理
4. **常用插件** - 学习各种实用插件的使用
5. **自定义开发** - 掌握自定义插件的开发方法
6. **最佳实践** - 了解插件开发的最佳实践

掌握 Vite 配置和插件能够帮助您构建更强大、更高效的前端应用。

## 扩展阅读

- [Vite 配置文档](https://vitejs.dev/config/)
- [Vite 插件 API](https://vitejs.dev/guide/api-plugin.html)
- [Rollup 插件文档](https://rollupjs.org/plugin-development/)
- [Awesome Vite Plugins](https://github.com/vitejs/awesome-vite#plugins)

