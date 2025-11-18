# Tree-Shaking优化

## 第一部分：Tree-Shaking基础

### 1.1 什么是Tree-Shaking

Tree-Shaking是一种通过静态分析删除未使用代码（dead code）的优化技术。它基于ES6模块的静态结构，在打包时移除未被引用的导出，减小bundle体积。

**原理：**

```javascript
// math.js - 导出多个函数
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
}

// app.js - 只使用add
import { add } from './math';

console.log(add(2, 3));

// 打包结果（Tree-Shaking后）
// 只包含add函数，subtract/multiply/divide被移除
```

### 1.2 工作原理

```javascript
// ES6模块的静态特性
// ✅ 可以Tree-Shake
import { specificFunction } from './module';

// ❌ 不能Tree-Shake（动态）
const module = require('./module');
const fn = module[functionName];

// Webpack Tree-Shaking流程
// 1. 标记阶段：标记所有被使用的导出
// 2. 清除阶段：移除未使用的导出
// 3. 压缩阶段：删除dead code

// 示例：标记过程
// module.js
export const used = 'I am used';
export const unused = 'I am not used';

// app.js
import { used } from './module';
console.log(used);

// Webpack标记：
// used: ✅ 使用
// unused: ❌ 未使用

// 打包后只包含used
```

### 1.3 基础配置

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // production模式自动启用Tree-Shaking
  
  optimization: {
    usedExports: true,  // 标记未使用的导出
    minimize: true,     // 压缩代码
    sideEffects: false  // 假设所有模块无副作用
  }
};

// package.json
{
  "sideEffects": false  // 声明项目无副作用
}

// 或指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// Rollup配置
// rollup.config.js
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'esm'
  },
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  }
};
```

### 1.4 验证Tree-Shaking

```javascript
// 检查是否生效
// 1. 查看webpack bundle analyzer
// 2. 检查打包后的代码
// 3. 对比bundle大小

// 测试示例
// utils.js
export function usedFunction() {
  return 'I am used';
}

export function unusedFunction() {
  return 'I am not used';
}

// app.js
import { usedFunction } from './utils';

console.log(usedFunction());

// 打包后检查dist/bundle.js
// 应该只包含usedFunction
// 不包含unusedFunction
```

## 第二部分：React组件Tree-Shaking

### 2.1 组件库优化

```javascript
// ❌ 全量导入（无法Tree-Shake）
import { Button, Modal, Table, Form } from 'antd';

// ✅ 按需导入
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';

// 或使用babel-plugin-import
// .babelrc
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": true
    }]
  ]
}

// 然后可以这样写，自动转换
import { Button, Modal } from 'antd';

// Lodash优化
// ❌ 全量导入
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ 按需导入
import debounce from 'lodash/debounce';
debounce(fn, 300);

// 或使用lodash-es
import { debounce } from 'lodash-es';

// Material-UI优化
// ❌ 全量导入
import { Button, TextField, Dialog } from '@material-ui/core';

// ✅ 按需导入
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

// 自定义组件库
// components/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';

// 使用（支持Tree-Shaking）
import { Button, Input } from './components';
```

### 2.2 工具函数Tree-Shaking

```javascript
// utils/index.js - 正确的导出方式
export function formatDate(date) {
  return date.toLocaleDateString();
}

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// app.js - 按需导入
import { formatDate, formatCurrency } from './utils';

// 打包后只包含formatDate和formatCurrency
// validateEmail被Tree-Shake掉

// ❌ 错误方式：default导出对象
export default {
  formatDate,
  formatCurrency,
  validateEmail
};

// 使用
import utils from './utils';
utils.formatDate(new Date());

// 问题：整个对象被打包，无法Tree-Shake

// ✅ 混合导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export default {
  add,
  subtract
};

// 按需导入（支持Tree-Shake）
import { add } from './math';

// 全量导入（不支持Tree-Shake）
import math from './math';
```

### 2.3 React特定优化

```javascript
// ✅ 使用命名导入
import { useState, useEffect, useMemo } from 'react';

// ❌ 避免整体导入
import React from 'react';
const { useState, useEffect } = React;

// 组件导出优化
// components/Button/index.js
export { Button } from './Button';
export { IconButton } from './IconButton';
export { ButtonGroup } from './ButtonGroup';

// 使用
import { Button } from './components/Button';

// 条件渲染组件优化
function App({ userType }) {
  // ❌ 两个组件都会被打包
  return userType === 'admin' ? <AdminPanel /> : <UserPanel />;
}

// ✅ 使用lazy
const AdminPanel = lazy(() => import('./AdminPanel'));
const UserPanel = lazy(() => import('./UserPanel'));

function App({ userType }) {
  const Panel = userType === 'admin' ? AdminPanel : UserPanel;
  
  return (
    <Suspense fallback={<Loading />}>
      <Panel />
    </Suspense>
  );
}
```

## 第三部分：高级技巧

### 3.1 副作用处理

```javascript
// 标记副作用
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js",
    "./src/setupTests.js"
  ]
}

// 或在webpack配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        sideEffects: false
      },
      {
        test: /\.css$/,
        sideEffects: true  // CSS有副作用
      }
    ]
  }
};

// PURE注释
/*#__PURE__*/ const obj = createExpensiveObject();

export default obj;

// Webpack会移除未使用的PURE代码

// 避免副作用
// ❌ 模块级副作用
console.log('Module loaded');  // 副作用

export function myFunction() {
  return 'hello';
}

// ✅ 无副作用
export function myFunction() {
  return 'hello';
}

// 副作用在函数内
export function init() {
  console.log('Initialized');  // 使用时才执行
}
```

### 3.2 条件导入优化

```javascript
// 环境特定代码
// ❌ 开发代码被打包到生产
import { devTools } from './devTools';
import { prodAnalytics } from './analytics';

if (process.env.NODE_ENV === 'development') {
  devTools.init();
} else {
  prodAnalytics.init();
}

// ✅ 使用动态导入
if (process.env.NODE_ENV === 'development') {
  import('./devTools').then(mod => mod.devTools.init());
} else {
  import('./analytics').then(mod => mod.prodAnalytics.init());
}

// webpack DefinePlugin
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};

// 使用后，未命中的分支会被移除
if (process.env.NODE_ENV === 'development') {
  // 生产环境此分支被完全移除
  console.log('Dev mode');
}
```

### 3.3 polyfill优化

```javascript
// ❌ 全量polyfill
import 'core-js';

// ✅ 按需polyfill
import 'core-js/es/promise';
import 'core-js/es/array/from';

// 使用@babel/preset-env
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',  // 按需引入
      corejs: 3
    }]
  ]
};

// 动态polyfill
async function loadPolyfills() {
  const needed = [];
  
  if (!window.Promise) {
    needed.push(import('core-js/es/promise'));
  }
  
  if (!Array.from) {
    needed.push(import('core-js/es/array/from'));
  }
  
  await Promise.all(needed);
}

loadPolyfills().then(() => {
  // 启动应用
  ReactDOM.render(<App />, root);
});
```

### 3.4 CSS Tree-Shaking

```javascript
// PurgeCSS配置
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.html',
        './src/**/*.js',
        './src/**/*.jsx'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: ['active', 'disabled']  // 保留的类
    })
  ]
};

// Tailwind CSS Tree-Shaking
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // 未使用的Tailwind类会被移除
};

// CSS Modules自动Tree-Shake
// Button.module.css
.primary { color: blue; }
.secondary { color: gray; }
.danger { color: red; }

// Button.jsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.primary}>Click</button>;
}

// 打包后只包含.primary样式
```

## 注意事项

### 1. ES6模块

```javascript
// ✅ 使用ES6 import/export
import { foo } from './module';
export const bar = () => {};

// ❌ 避免CommonJS
const module = require('./module');
module.exports = {};
```

### 2. 副作用声明

```javascript
// 准确标记副作用文件
{
  "sideEffects": [
    "*.css",
    "./src/polyfills.js"
  ]
}
```

### 3. 生产模式

```javascript
// webpack.config.js
module.exports = {
  mode: 'production'  // 必须是production
};
```

## 常见问题

### Q1: Tree-Shaking和代码分割的区别？

**A:** Tree-Shaking删除未使用代码，代码分割拆分代码为多个bundle。

### Q2: 所有打包工具都支持吗？

**A:** Webpack、Rollup、Parcel等主流工具都支持。

### Q3: CommonJS模块能Tree-Shake吗？

**A:** 不能，必须使用ES6模块。

### Q4: CSS能Tree-Shake吗？

**A:** 可以，使用PurgeCSS等工具。

### Q5: 如何验证Tree-Shaking效果？

**A:** 使用bundle analyzer分析打包结果。

### Q6: 副作用如何影响Tree-Shaking？

**A:** 有副作用的代码不会被移除，需正确标记。

### Q7: development模式支持吗？

**A:** 支持，但production模式效果更好。

### Q8: 可以Tree-Shake TypeScript代码吗？

**A:** 可以，编译为ES6模块后支持。

### Q9: 第三方库不支持Tree-Shaking怎么办？

**A:** 寻找替代库或按需导入子模块。

### Q10: React 19对Tree-Shaking有改进吗？

**A:** 编译器优化可能减少打包体积。

## 总结

### 核心要点

```
1. Tree-Shaking作用
   ✅ 删除未使用代码
   ✅ 减小bundle体积
   ✅ 提升加载速度
   ✅ 优化性能

2. 实现要点
   ✅ 使用ES6模块
   ✅ production模式
   ✅ 正确标记副作用
   ✅ 优化导入方式

3. 优化范围
   ✅ JavaScript代码
   ✅ CSS样式
   ✅ 第三方库
   ✅ 工具函数
```

### 最佳实践

```
1. 代码组织
   ✅ ES6 import/export
   ✅ 命名导出
   ✅ 避免副作用
   ✅ 模块化设计

2. 配置优化
   ✅ 准确的sideEffects
   ✅ production模式
   ✅ 启用压缩
   ✅ 监控效果

3. 开发习惯
   ✅ 按需导入
   ✅ 避免整体导入
   ✅ 清理未使用代码
   ✅ 定期审查
```

Tree-Shaking是现代前端构建的核心优化技术，正确使用能显著减小应用体积,提升性能。

## 第四部分：React特定优化深度

### 4.1 Hooks Tree-Shaking

```javascript
// ❌ Hooks全量导入
import * as React from 'react';

function Component() {
  const [state, setState] = React.useState(0);
  const ref = React.useRef(null);
  // 导入整个React对象，无法Tree-Shake
}

// ✅ 按需导入Hooks
import { useState, useRef, useEffect, useMemo } from 'react';

function Component() {
  const [state, setState] = useState(0);
  const ref = useRef(null);
  // 只打包使用的Hooks
}

// 自定义Hooks优化
// hooks/index.js - ❌ 错误方式
export default {
  useCounter,
  useToggle,
  useLocalStorage,
  useFetch
};

// hooks/index.js - ✅ 正确方式
export { useCounter } from './useCounter';
export { useToggle } from './useToggle';
export { useLocalStorage } from './useLocalStorage';
export { useFetch } from './useFetch';

// 使用
import { useCounter, useToggle } from './hooks';
// 只打包useCounter和useToggle

// 条件Hooks优化
// ❌ 总是导入
import { useDevTools } from './devtools-hooks';
import { useAnalytics } from './analytics-hooks';

function App() {
  if (process.env.NODE_ENV === 'development') {
    useDevTools();
  } else {
    useAnalytics();
  }
}

// ✅ 动态导入
function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('./devtools-hooks').then(({ useDevTools }) => {
        // 使用devtools
      });
    } else {
      import('./analytics-hooks').then(({ useAnalytics }) => {
        // 使用analytics
      });
    }
  }, []);
}
```

### 4.2 Context优化

```javascript
// Context Tree-Shaking
// ❌ 全量导出
export const AppContext = React.createContext({
  user: null,
  theme: null,
  settings: null,
  notifications: null,
  // ... 更多状态
});

// ✅ 分离Context
export const UserContext = React.createContext(null);
export const ThemeContext = React.createContext(null);
export const SettingsContext = React.createContext(null);
export const NotificationsContext = React.createContext(null);

// 使用时按需导入
import { UserContext, ThemeContext } from './contexts';

function Component() {
  const user = useContext(UserContext);
  const theme = useContext(ThemeContext);
  // 只导入需要的Context
}

// Context Provider优化
// contexts/index.js
export { UserProvider, UserContext } from './UserContext';
export { ThemeProvider, ThemeContext } from './ThemeContext';
export { SettingsProvider, SettingsContext } from './SettingsContext';

// 使用
import { UserProvider, ThemeProvider } from './contexts';

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </UserProvider>
  );
}

// 懒加载Context
const LazyContext = React.lazy(() => import('./HeavyContext'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyContext.Provider value={value}>
        <Content />
      </LazyContext.Provider>
    </Suspense>
  );
}
```

### 4.3 高阶组件(HOC)优化

```javascript
// HOC Tree-Shaking
// ❌ 全量导出HOC工具
export default {
  withAuth,
  withLogging,
  withErrorBoundary,
  withPermissions,
  withTheme
};

// ✅ 分别导出
export { withAuth } from './withAuth';
export { withLogging } from './withLogging';
export { withErrorBoundary } from './withErrorBoundary';
export { withPermissions } from './withPermissions';
export { withTheme } from './withTheme';

// 按需使用
import { withAuth, withLogging } from './hocs';

const EnhancedComponent = withAuth(withLogging(Component));

// HOC组合优化
import compose from 'lodash/flowRight';  // 按需导入

const enhance = compose(
  withAuth,
  withLogging,
  withErrorBoundary
);

const EnhancedComponent = enhance(Component);

// 条件HOC
function conditionalHOC(Component, condition) {
  if (condition) {
    return withFeature(Component);
  }
  return Component;
}

// Webpack会移除未使用的分支
const Enhanced = process.env.FEATURE_FLAG
  ? withFeature(Component)
  : Component;
```

### 4.4 路由代码分割

```javascript
// React Router代码分割
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ❌ 全量导入路由组件
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

// ✅ 懒加载路由组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 嵌套路由分割
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const UserRoutes = lazy(() => import('./routes/UserRoutes'));

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={
        <Suspense fallback={<Loading />}>
          <AdminRoutes />
        </Suspense>
      } />
      <Route path="/user/*" element={
        <Suspense fallback={<Loading />}>
          <UserRoutes />
        </Suspense>
      } />
    </Routes>
  );
}

// 预加载优化
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const Dashboard = lazy(() => import(/* webpackPreload: true */ './pages/Dashboard'));

// 路由级别的Tree-Shaking
// routes/index.js
export const publicRoutes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];

export const privateRoutes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', component: Profile }
];

// 使用时只导入需要的
import { publicRoutes } from './routes';

function PublicApp() {
  return (
    <Routes>
      {publicRoutes.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Routes>
  );
}
```

## 第五部分：构建工具深度优化

### 5.1 Webpack高级配置

```javascript
// webpack.config.js - 深度优化
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2,  // 多次压缩
            ecma: 2015,
            toplevel: true,
            dead_code: true,
            unused: true
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // React核心
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'react-vendor',
          priority: 30,
          reuseExistingChunk: true
        },
        
        // 路由
        routerVendor: {
          test: /[\\/]node_modules[\\/]react-router(-dom)?[\\/]/,
          name: 'router-vendor',
          priority: 25
        },
        
        // 工具库
        utilsVendor: {
          test: /[\\/]node_modules[\\/](lodash|date-fns|axios)[\\/]/,
          name: 'utils-vendor',
          priority: 20
        },
        
        // 其他vendor
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        
        // 公共模块
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    
    sideEffects: true  // 启用副作用检测
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: /src/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,  // 保留ES6模块
                useBuiltIns: 'usage',
                corejs: 3
              }],
              '@babel/preset-react'
            ],
            plugins: [
              // 移除propTypes（生产环境）
              ['transform-react-remove-prop-types', {
                removeImport: true
              }]
            ]
          }
        }
      }
    ]
  },
  
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ],
  
  resolve: {
    alias: {
      // 使用优化版本的库
      'react': 'react/cjs/react.production.min.js',
      'react-dom': 'react-dom/cjs/react-dom.production.min.js'
    }
  }
};
```

### 5.2 Rollup优化配置

```javascript
// rollup.config.js
import { terser } from 'rollup-plugin-terser';
import analyze from 'rollup-plugin-analyzer';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true
    }
  ],
  
  plugins: [
    resolve({
      extensions: ['.js', '.jsx'],
      mainFields: ['module', 'main']
    }),
    
    commonjs({
      include: /node_modules/
    }),
    
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: { esmodules: true }
        }],
        '@babel/preset-react'
      ]
    }),
    
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        passes: 2
      },
      mangle: true
    }),
    
    analyze({
      summaryOnly: true,
      limit: 20
    })
  ],
  
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false
  },
  
  external: [
    'react',
    'react-dom',
    /^lodash/
  ]
};
```

### 5.3 Vite优化配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // 移除开发工具
          ['transform-remove-console', {
            exclude: ['error', 'warn']
          }]
        ]
      }
    }),
    
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  build: {
    target: 'es2015',
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'utils': ['lodash-es', 'date-fns']
        }
      },
      
      treeshake: {
        moduleSideEffects: 'no-external'
      }
    },
    
    chunkSizeWarningLimit: 500,
    
    cssCodeSplit: true,
    
    sourcemap: false  // 生产环境关闭sourcemap
  },
  
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
```

## 第六部分：监控与持续优化

### 6.1 自动化Tree-Shaking检测

```javascript
// scripts/check-tree-shaking.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function analyzeTreeShaking() {
  // 构建项目
  execSync('npm run build', { stdio: 'inherit' });
  
  // 读取stats.json
  const stats = JSON.parse(
    fs.readFileSync('dist/stats.json', 'utf-8')
  );
  
  const report = {
    totalSize: 0,
    unusedExports: [],
    largeDependencies: [],
    recommendations: []
  };
  
  // 分析未使用的导出
  stats.modules.forEach(module => {
    if (module.providedExports && module.usedExports) {
      const unused = module.providedExports.filter(
        exp => !module.usedExports.includes(exp)
      );
      
      if (unused.length > 0) {
        report.unusedExports.push({
          module: module.name,
          unused,
          potentialSavings: estimateSize(module, unused)
        });
      }
    }
    
    report.totalSize += module.size || 0;
  });
  
  // 识别大型依赖
  const deps = {};
  stats.modules.forEach(mod => {
    const match = mod.name.match(/node_modules\/(@?[^\/]+)/);
    if (match) {
      const dep = match[1];
      deps[dep] = (deps[dep] || 0) + (mod.size || 0);
    }
  });
  
  Object.entries(deps)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([name, size]) => {
      if (size > 100 * 1024) {  // >100KB
        report.largeDependencies.push({
          name,
          size,
          suggestion: findAlternative(name)
        });
      }
    });
  
  // 生成建议
  if (report.unusedExports.length > 0) {
    report.recommendations.push(
      '移除未使用的导出以减小bundle体积'
    );
  }
  
  if (report.largeDependencies.length > 0) {
    report.recommendations.push(
      '考虑替换大型依赖或按需导入'
    );
  }
  
  // 输出报告
  console.log('Tree-Shaking Analysis Report');
  console.log('============================');
  console.log(`Total Size: ${(report.totalSize / 1024).toFixed(2)} KB`);
  console.log(`\nUnused Exports: ${report.unusedExports.length}`);
  console.log(`\nLarge Dependencies:`);
  report.largeDependencies.forEach(({ name, size, suggestion }) => {
    console.log(`  ${name}: ${(size / 1024).toFixed(2)} KB`);
    if (suggestion) {
      console.log(`    → Consider: ${suggestion}`);
    }
  });
  
  console.log(`\nRecommendations:`);
  report.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  
  // 保存报告
  fs.writeFileSync(
    'tree-shaking-report.json',
    JSON.stringify(report, null, 2)
  );
}

function estimateSize(module, unusedExports) {
  // 粗略估算未使用导出的大小
  const totalExports = module.providedExports?.length || 1;
  const moduleSize = module.size || 0;
  return Math.floor(
    (moduleSize / totalExports) * unusedExports.length
  );
}

function findAlternative(packageName) {
  const alternatives = {
    'moment': 'date-fns (更小)',
    'lodash': 'lodash-es (支持Tree-Shaking)',
    'axios': 'ky (更轻量)',
    'jquery': '原生DOM API'
  };
  
  return alternatives[packageName] || null;
}

analyzeTreeShaking();
```

### 6.2 CI/CD集成

```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size Check

on:
  pull_request:
    branches: [main]

jobs:
  check-size:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Check bundle size
        run: |
          node scripts/check-tree-shaking.js
          
      - name: Compare with base
        run: |
          # 下载base分支的stats
          git fetch origin main:main
          git checkout main
          npm ci
          npm run build
          mv dist/stats.json base-stats.json
          
          # 切回当前分支
          git checkout -
          
          # 对比大小
          node scripts/compare-bundles.js base-stats.json dist/stats.json
      
      - name: Comment PR
        uses: actions/github-script@v5
        with:
          script: |
            const report = require('./tree-shaking-report.json');
            const comment = generateComment(report);
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### 6.3 实时监控

```javascript
// 运行时Tree-Shaking监控
class TreeShakingMonitor {
  constructor() {
    this.usedModules = new Set();
    this.unusedModules = new Set();
    this.allModules = new Map();
  }
  
  registerModule(name, exports) {
    this.allModules.set(name, {
      exports: Object.keys(exports),
      used: new Set()
    });
  }
  
  trackUsage(moduleName, exportName) {
    const module = this.allModules.get(moduleName);
    if (module) {
      module.used.add(exportName);
      this.usedModules.add(moduleName);
    }
  }
  
  generateReport() {
    const report = {
      modules: [],
      summary: {
        total: this.allModules.size,
        used: this.usedModules.size,
        unused: 0,
        potentialSavings: 0
      }
    };
    
    this.allModules.forEach((module, name) => {
      const unused = module.exports.filter(
        exp => !module.used.has(exp)
      );
      
      if (unused.length > 0) {
        report.summary.unused++;
        report.modules.push({
          name,
          totalExports: module.exports.length,
          usedExports: module.used.size,
          unusedExports: unused
        });
      }
    });
    
    return report;
  }
  
  sendToAnalytics(report) {
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/tree-shaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
    }
  }
}

// 使用
const monitor = new TreeShakingMonitor();

// 在模块中注册
monitor.registerModule('utils', {
  formatDate,
  formatCurrency,
  validateEmail
});

// 追踪使用
monitor.trackUsage('utils', 'formatDate');

// 定期报告
setInterval(() => {
  const report = monitor.generateReport();
  monitor.sendToAnalytics(report);
}, 60000);
```

## 总结强化

### 深度优化要点

```
1. React特定优化
   - Hooks按需导入
   - Context分离
   - HOC Tree-Shaking
   - 路由代码分割

2. 构建工具配置
   - Webpack深度优化
   - Rollup高级配置
   - Vite性能调优
   - 多次压缩pass

3. 自动化检测
   - 脚本化分析
   - CI/CD集成
   - 实时监控
   - 持续优化

4. 监控指标
   - 未使用导出
   - 大型依赖
   - Bundle增长
   - 优化建议
```

### 最佳实践清单

```
开发阶段：
☐ ES6模块化
☐ 命名导出优先
☐ 避免副作用
☐ 按需导入

构建阶段：
☐ production模式
☐ 正确配置sideEffects
☐ 优化splitChunks
☐ 启用多次压缩

部署阶段：
☐ Bundle分析
☐ 性能预算
☐ 监控告警
☐ 持续改进
```

Tree-Shaking是现代前端构建的核心优化技术，深入掌握能显著提升应用性能。

