# Webpack配置(备选)

## 课程概述

本章节介绍 Webpack 作为备选构建工具的配置方法。虽然 Vite 是现代前端开发的首选,但 Webpack 仍然是许多项目的主流选择,特别是在需要特定功能或维护既有项目时。本章将帮助您深入理解 Webpack 的配置和优化策略。

### 学习目标

- 理解 Webpack 的核心概念和工作原理
- 掌握 Webpack 在 React 项目中的配置
- 学习 Webpack 的性能优化技巧
- 了解 Webpack 与 Vite 的区别
- 掌握常用 loader 和 plugin 的使用
- 学习 Webpack 的高级功能

## 第一部分:Webpack 基础

### 1.1 什么是 Webpack

Webpack 是一个现代 JavaScript 应用程序的静态模块打包工具。它将项目中的各种资源(JavaScript、CSS、图片等)视为模块,通过依赖关系构建依赖图,最终打包成浏览器可用的静态资源。

**核心概念:**

```javascript
// Webpack 的四个核心概念
1. Entry   - 入口
2. Output  - 输出
3. Loader  - 加载器
4. Plugin  - 插件
```

### 1.2 Webpack 工作原理

```javascript
// Webpack 构建流程
1. 初始化参数 → 从配置文件和命令行读取参数
2. 开始编译 → 用参数初始化 Compiler 对象
3. 确定入口 → 根据 entry 找出所有入口文件
4. 编译模块 → 从入口文件出发,调用 loader 转译模块
5. 完成编译 → 得到转译后的内容及依赖关系
6. 输出资源 → 根据入口和模块关系,组装成 chunk
7. 输出完成 → 根据 output 配置输出到文件系统
```

### 1.3 安装 Webpack

```bash
# 安装 Webpack 核心包
npm install --save-dev webpack webpack-cli

# 安装开发服务器
npm install --save-dev webpack-dev-server

# 安装 React 相关依赖
npm install --save-dev @babel/core @babel/preset-react @babel/preset-env
npm install --save-dev babel-loader css-loader style-loader
```

### 1.4 基础配置

创建 `webpack.config.js`:

```javascript
const path = require('path')

module.exports = {
  // 模式
  mode: 'development',
  
  // 入口
  entry: './src/index.js',
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  
  // 模块规则
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
}
```

**package.json 脚本:**

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production"
  }
}
```

## 第二部分:Entry 入口配置

### 2.1 单入口

```javascript
module.exports = {
  entry: './src/index.js'
}

// 等同于
module.exports = {
  entry: {
    main: './src/index.js'
  }
}
```

### 2.2 多入口

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js',
    vendor: './src/vendor.js'
  },
  
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}

// 输出:
// dist/app.bundle.js
// dist/admin.bundle.js
// dist/vendor.bundle.js
```

### 2.3 动态入口

```javascript
module.exports = {
  entry: () => ({
    app: './src/app.js',
    admin: './src/admin.js'
  })
}

// 异步入口
module.exports = {
  entry: () => new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        app: './src/app.js'
      })
    }, 1000)
  })
}
```

## 第三部分:Output 输出配置

### 3.1 基础输出配置

```javascript
const path = require('path')

module.exports = {
  output: {
    // 输出目录
    path: path.resolve(__dirname, 'dist'),
    
    // 文件名
    filename: 'bundle.js',
    
    // 公共路径
    publicPath: '/',
    
    // 清空输出目录
    clean: true
  }
}
```

### 3.2 多输出配置

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    
    // 使用占位符
    filename: '[name].[contenthash:8].js',
    
    // chunk 文件名
    chunkFilename: '[name].[contenthash:8].chunk.js',
    
    // 资源文件名
    assetModuleFilename: 'assets/[hash][ext][query]'
  }
}
```

**常用占位符:**

```javascript
[name]           // chunk 名称
[hash]           // 编译 hash
[chunkhash]      // chunk hash
[contenthash]    // 内容 hash
[id]             // chunk id
[query]          // 查询参数
[ext]            // 扩展名
```

### 3.3 Library 输出

```javascript
module.exports = {
  output: {
    filename: 'my-library.js',
    path: path.resolve(__dirname, 'dist'),
    
    // 库配置
    library: {
      name: 'MyLibrary',
      type: 'umd',
      export: 'default'
    },
    
    // 全局变量名
    globalObject: 'this'
  }
}
```

## 第四部分:Loader 配置

### 4.1 Babel Loader

```bash
npm install -D babel-loader @babel/core @babel/preset-env @babel/preset-react
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      }
    ]
  }
}
```

**独立 Babel 配置:**

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead',
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties'
  ]
}
```

### 4.2 TypeScript Loader

```bash
npm install -D typescript ts-loader
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  }
}
```

**使用 Babel + TypeScript:**

```bash
npm install -D @babel/preset-typescript
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  }
}
```

### 4.3 CSS Loader

```bash
npm install -D style-loader css-loader
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

**CSS Modules:**

```javascript
{
  test: /\.module\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[name]__[local]--[hash:base64:5]'
        }
      }
    }
  ]
}
```

### 4.4 CSS 预处理器

```bash
npm install -D sass-loader sass
npm install -D less-loader less
npm install -D stylus-loader stylus
```

```javascript
module.exports = {
  module: {
    rules: [
      // Sass
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      
      // Less
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      
      // Stylus
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader']
      }
    ]
  }
}
```

### 4.5 PostCSS

```bash
npm install -D postcss-loader postcss autoprefixer
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true
      }
    })
  ]
}
```

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  }
}
```

### 4.6 文件 Loader

```bash
npm install -D file-loader url-loader
```

```javascript
module.exports = {
  module: {
    rules: [
      // 图片
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 8kb
          }
        },
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      
      // 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      }
    ]
  }
}
```

**Webpack 5 资源模块:**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.png$/,
        type: 'asset/resource'  // 输出单独文件
      },
      {
        test: /\.svg$/,
        type: 'asset/inline'    // 内联 data URI
      },
      {
        test: /\.txt$/,
        type: 'asset/source'    // 导出源代码
      },
      {
        test: /\.jpg$/,
        type: 'asset'          // 自动选择
      }
    ]
  }
}
```

## 第五部分:Plugin 配置

### 5.1 HTML Plugin

```bash
npm install -D html-webpack-plugin
```

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    })
  ]
}
```

**多页面配置:**

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/app.html',
      filename: 'app.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      template: './public/admin.html',
      filename: 'admin.html',
      chunks: ['admin']
    })
  ]
}
```

### 5.2 Clean Plugin

```javascript
// Webpack 5 内置
module.exports = {
  output: {
    clean: true
  }
}

// 或使用插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```

### 5.3 MiniCssExtract Plugin

```bash
npm install -D mini-css-extract-plugin
```

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    })
  ]
}
```

### 5.4 CSS 压缩 Plugin

```bash
npm install -D css-minimizer-webpack-plugin
```

```javascript
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      `...`,  // 保留默认压缩器
      new CssMinimizerPlugin()
    ]
  }
}
```

### 5.5 DefinePlugin

```javascript
const webpack = require('webpack')

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify('https://api.example.com'),
      '__DEV__': JSON.stringify(true),
      '__VERSION__': JSON.stringify('1.0.0')
    })
  ]
}
```

### 5.6 Copy Plugin

```bash
npm install -D copy-webpack-plugin
```

```javascript
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/favicon.ico', to: 'favicon.ico' },
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/robots.txt', to: 'robots.txt' }
      ]
    })
  ]
}
```

### 5.7 Bundle Analyzer

```bash
npm install -D webpack-bundle-analyzer
```

```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
}
```

## 第六部分:优化配置

### 6.1 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // React 相关
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20
        },
        
        // 第三方库
        vendor: {
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
    }
  }
}
```

**详细配置:**

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,           // 最小大小
      minRemainingSize: 0,
      minChunks: 1,             // 最小引用次数
      maxAsyncRequests: 30,     // 最大异步请求数
      maxInitialRequests: 30,   // 最大初始请求数
      enforceSizeThreshold: 50000,
      
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```

### 6.2 Tree Shaking

```javascript
module.exports = {
  mode: 'production',
  
  optimization: {
    usedExports: true,
    minimize: true
  }
}
```

**package.json 配置:**

```json
{
  "sideEffects": false,
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

### 6.3 压缩优化

```bash
npm install -D terser-webpack-plugin
```

```javascript
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  }
}
```

### 6.4 缓存优化

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  },
  
  optimization: {
    // 运行时代码单独打包
    runtimeChunk: 'single',
    
    // 模块 ID 使用确定性算法
    moduleIds: 'deterministic'
  },
  
  // 缓存配置
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache')
  }
}
```

### 6.5 懒加载

```javascript
// 动态导入
const UserProfile = lazy(() => import('./components/UserProfile'))

// Webpack 魔法注释
const AdminPanel = lazy(() => 
  import(
    /* webpackChunkName: "admin" */
    /* webpackPrefetch: true */
    './components/AdminPanel'
  )
)
```

**预加载和预获取:**

```javascript
// 预加载 (并行加载)
import(/* webpackPreload: true */ './module')

// 预获取 (空闲时加载)
import(/* webpackPrefetch: true */ './module')
```

### 6.6 构建性能优化

```javascript
module.exports = {
  // 缩小解析范围
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // 减少 loader 处理范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  
  // 缓存
  cache: {
    type: 'filesystem'
  }
}
```

## 第七部分:开发服务器配置

### 7.1 DevServer 基础配置

```javascript
module.exports = {
  devServer: {
    // 端口
    port: 3000,
    
    // 主机
    host: '0.0.0.0',
    
    // 自动打开浏览器
    open: true,
    
    // 热更新
    hot: true,
    
    // 压缩
    compress: true,
    
    // 静态文件目录
    static: {
      directory: path.join(__dirname, 'public')
    },
    
    // History API fallback
    historyApiFallback: true
  }
}
```

### 7.2 代理配置

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
        secure: false
      },
      
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    }
  }
}
```

**高级代理配置:**

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        bypass: function(req, res, proxyOptions) {
          // 自定义绕过逻辑
          if (req.headers.accept.indexOf('html') !== -1) {
            return '/index.html'
          }
        },
        onProxyReq: function(proxyReq, req, res) {
          // 请求前处理
          proxyReq.setHeader('X-Custom-Header', 'value')
        },
        onProxyRes: function(proxyRes, req, res) {
          // 响应后处理
          proxyRes.headers['X-Custom-Header'] = 'value'
        }
      }
    }
  }
}
```

### 7.3 HTTPS 配置

```javascript
module.exports = {
  devServer: {
    https: true,
    
    // 或使用自定义证书
    https: {
      key: fs.readFileSync('/path/to/key.pem'),
      cert: fs.readFileSync('/path/to/cert.pem'),
      ca: fs.readFileSync('/path/to/ca.pem')
    }
  }
}
```

## 第八部分:环境区分

### 8.1 多配置文件

```javascript
// webpack.common.js - 通用配置
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
```

```javascript
// webpack.dev.js - 开发配置
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  
  devtool: 'eval-source-map',
  
  devServer: {
    port: 3000,
    hot: true
  },
  
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
})
```

```javascript
// webpack.prod.js - 生产配置
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  
  devtool: 'source-map',
  
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    clean: true
  },
  
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ],
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all'
    }
  }
})
```

**package.json 脚本:**

```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
  }
}
```

### 8.2 环境变量

```javascript
// webpack.config.js
module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development'
  const isProduction = argv.mode === 'production'
  
  return {
    mode: argv.mode,
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        '__DEV__': JSON.stringify(isDevelopment)
      })
    ]
  }
}
```

## 第九部分:React 项目完整配置

### 9.1 完整 Webpack 配置

```javascript
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development'
  const isProduction = argv.mode === 'production'
  
  return {
    mode: argv.mode,
    
    entry: './src/index.tsx',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction 
        ? 'js/[name].[contenthash:8].js'
        : 'js/[name].js',
      chunkFilename: isProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : 'js/[name].chunk.js',
      assetModuleFilename: 'assets/[hash][ext][query]',
      publicPath: '/'
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },
    
    module: {
      rules: [
        // TypeScript/JavaScript
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript'
              ],
              cacheDirectory: true
            }
          }
        },
        
        // CSS
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        
        // CSS Modules
        {
          test: /\.module\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: isProduction
                    ? '[hash:base64:8]'
                    : '[name]__[local]--[hash:base64:5]'
                }
              }
            },
            'postcss-loader'
          ]
        },
        
        // Sass
        {
          test: /\.scss$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        
        // 图片
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024
            }
          }
        },
        
        // 字体
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource'
        }
      ]
    },
    
    plugins: [
      new CleanWebpackPlugin(),
      
      new HtmlWebpackPlugin({
        template: './public/index.html',
        favicon: './public/favicon.ico',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false
      }),
      
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        '__DEV__': JSON.stringify(isDevelopment)
      }),
      
      isProduction && new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css'
      })
    ].filter(Boolean),
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        }),
        new CssMinimizerPlugin()
      ],
      
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          }
        }
      },
      
      runtimeChunk: 'single'
    },
    
    devServer: {
      port: 3000,
      hot: true,
      open: true,
      compress: true,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    cache: {
      type: 'filesystem'
    },
    
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  }
}
```

## 第十部分:Webpack vs Vite

### 10.1 性能对比

```javascript
// 启动速度
Webpack: 30-60 秒 (大型项目)
Vite:    < 1 秒

// 热更新速度
Webpack: 2-5 秒
Vite:    < 100 毫秒

// 构建速度
Webpack: 较慢,需要完整打包
Vite:    较快,使用 Rollup 和 esbuild
```

### 10.2 功能对比

| 功能 | Webpack | Vite |
|------|---------|------|
| 开发服务器 | webpack-dev-server | 内置,基于 ES 模块 |
| HMR | 需配置 | 开箱即用 |
| 代码分割 | 需配置 | 自动处理 |
| TypeScript | 需配置 loader | 开箱即用 |
| CSS 预处理 | 需配置 loader | 开箱即用 |
| 生态系统 | 非常成熟 | 快速发展 |
| 学习曲线 | 较陡峭 | 较平缓 |

### 10.3 选择建议

**选择 Webpack 的场景:**

1. 需要深度定制构建流程
2. 使用复杂的 loader 链
3. 维护老项目
4. 需要特定的 Webpack 插件
5. 团队已熟悉 Webpack

**选择 Vite 的场景:**

1. 新项目开发
2. 追求极致的开发体验
3. 现代浏览器目标
4. 简单的构建需求
5. React/Vue 等现代框架

## 总结

本章详细介绍了 Webpack 的配置方法:

1. **基础配置** - Entry、Output、Loader、Plugin
2. **开发配置** - DevServer、HMR、代理
3. **优化配置** - 代码分割、Tree Shaking、压缩
4. **环境区分** - 开发和生产环境配置
5. **完整示例** - React 项目完整配置
6. **对比分析** - Webpack vs Vite

虽然 Vite 是现代开发的首选,但 Webpack 仍然是重要的备选工具,特别是在需要深度定制或维护既有项目时。

## 扩展阅读

- [Webpack 官方文档](https://webpack.js.org/)
- [Webpack 中文文档](https://webpack.docschina.org/)
- [深入浅出 Webpack](https://webpack.wuhaolin.cn/)
- [Webpack 性能优化](https://webpack.js.org/guides/build-performance/)

