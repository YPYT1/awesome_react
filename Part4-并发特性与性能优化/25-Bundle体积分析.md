# Bundle体积分析

## 第一部分：分析工具

### 1.1 webpack-bundle-analyzer

**安装和配置：**

```bash
npm install --save-dev webpack-bundle-analyzer
```

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',      // 生成静态HTML报告
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,          // 不自动打开浏览器
      generateStatsFile: true,      // 生成stats.json
      statsFilename: 'bundle-stats.json'
    })
  ]
};

// 不同模式
// 1. server模式：启动服务器查看
new BundleAnalyzerPlugin({
  analyzerMode: 'server',
  analyzerPort: 8888
})

// 2. static模式：生成HTML文件
new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  reportFilename: 'report.html'
})

// 3. json模式：只生成数据文件
new BundleAnalyzerPlugin({
  analyzerMode: 'json',
  reportFilename: 'report.json'
})

// 4. disabled模式：禁用但生成stats
new BundleAnalyzerPlugin({
  analyzerMode: 'disabled',
  generateStatsFile: true
})
```

**使用示例：**

```javascript
// package.json
{
  "scripts": {
    "build": "webpack --mode production",
    "analyze": "webpack --mode production --profile --json > stats.json && webpack-bundle-analyzer stats.json"
  }
}

// 运行分析
// npm run analyze
```

### 1.2 source-map-explorer

```bash
npm install --save-dev source-map-explorer
```

```javascript
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}

// 分析特定文件
// source-map-explorer build/static/js/main.*.js

// 对比两个bundle
// source-map-explorer bundle1.js bundle2.js --only-mapped
```

### 1.3 其他分析工具

```javascript
// 1. webpack-visualizer
const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  plugins: [
    new Visualizer({
      filename: './statistics.html'
    })
  ]
};

// 2. size-limit
// package.json
{
  "size-limit": [
    {
      "path": "dist/bundle.js",
      "limit": "100 KB"
    }
  ],
  "scripts": {
    "size": "size-limit"
  }
}

// 3. bundlephobia在线分析
// https://bundlephobia.com
// 输入包名查看大小

// 4. VS Code扩展
// Import Cost - 显示导入的大小
import React from 'react';  // 6.3 KB
import lodash from 'lodash';  // 72.4 KB
```

## 第二部分：分析方法

### 2.1 识别大型依赖

```javascript
// 分析stats.json
const stats = require('./bundle-stats.json');

// 查找最大的模块
const modules = stats.modules
  .sort((a, b) => b.size - a.size)
  .slice(0, 20);

console.log('Top 20 largest modules:');
modules.forEach(mod => {
  console.log(`${mod.name}: ${(mod.size / 1024).toFixed(2)} KB`);
});

// 查找重复依赖
const duplicates = {};

stats.modules.forEach(mod => {
  const match = mod.name.match(/node_modules\/(.+?)\//);
  if (match) {
    const pkg = match[1];
    duplicates[pkg] = (duplicates[pkg] || 0) + 1;
  }
});

Object.entries(duplicates)
  .filter(([, count]) => count > 1)
  .forEach(([pkg, count]) => {
    console.log(`${pkg} appears ${count} times`);
  });

// 查找未使用的导出
const unusedExports = stats.modules
  .filter(mod => mod.providedExports && mod.usedExports)
  .map(mod => ({
    name: mod.name,
    unused: mod.providedExports.filter(
      exp => !mod.usedExports.includes(exp)
    )
  }))
  .filter(item => item.unused.length > 0);

console.log('Modules with unused exports:', unusedExports);
```

### 2.2 chunk分析

```javascript
// 分析chunk大小
const analyzeChunks = (stats) => {
  const chunks = stats.chunks.map(chunk => ({
    id: chunk.id,
    name: chunk.names.join(', '),
    size: chunk.size,
    modules: chunk.modules.length
  }))
  .sort((a, b) => b.size - a.size);
  
  console.log('Chunks by size:');
  chunks.forEach(chunk => {
    console.log(`${chunk.name}: ${(chunk.size / 1024).toFixed(2)} KB (${chunk.modules} modules)`);
  });
  
  return chunks;
};

// 分析chunk依赖
const analyzeChunkDependencies = (stats) => {
  const chunkGraph = {};
  
  stats.chunks.forEach(chunk => {
    chunkGraph[chunk.id] = {
      name: chunk.names[0],
      parents: chunk.parents || [],
      children: chunk.children || [],
      size: chunk.size
    };
  });
  
  return chunkGraph;
};

// 识别可优化的chunk
const findOptimizationOpportunities = (stats) => {
  const opportunities = [];
  
  stats.chunks.forEach(chunk => {
    // 查找过大的chunk
    if (chunk.size > 500 * 1024) {
      opportunities.push({
        type: 'large-chunk',
        chunk: chunk.names.join(', '),
        size: chunk.size,
        suggestion: '考虑进一步分割此chunk'
      });
    }
    
    // 查找重复模块
    const moduleNames = chunk.modules.map(m => m.name);
    const duplicates = moduleNames.filter((name, index) => 
      moduleNames.indexOf(name) !== index
    );
    
    if (duplicates.length > 0) {
      opportunities.push({
        type: 'duplicate-modules',
        chunk: chunk.names.join(', '),
        modules: duplicates,
        suggestion: '提取公共模块到单独chunk'
      });
    }
  });
  
  return opportunities;
};
```

### 2.3 依赖分析

```javascript
// 分析node_modules大小
const analyzeDependencies = () => {
  const stats = require('./bundle-stats.json');
  const dependencies = {};
  
  stats.modules.forEach(mod => {
    const match = mod.name.match(/node_modules\/(@?[^\/]+)\/?/);
    if (match) {
      const pkgName = match[1];
      dependencies[pkgName] = (dependencies[pkgName] || 0) + mod.size;
    }
  });
  
  const sorted = Object.entries(dependencies)
    .map(([name, size]) => ({ name, size: size / 1024 }))
    .sort((a, b) => b.size - a.size);
  
  console.log('Dependencies by size:');
  sorted.forEach(({ name, size }) => {
    console.log(`${name}: ${size.toFixed(2)} KB`);
  });
  
  return sorted;
};

// 查找可替换的依赖
const findAlternatives = (packageName, currentSize) => {
  const alternatives = {
    'moment': [
      { name: 'date-fns', size: '13 KB' },
      { name: 'dayjs', size: '2 KB' }
    ],
    'lodash': [
      { name: 'lodash-es', size: 'tree-shakeable' },
      { name: 'individual functions', size: 'varies' }
    ],
    'axios': [
      { name: 'fetch API', size: 'native' },
      { name: 'ky', size: '11 KB' }
    ]
  };
  
  return alternatives[packageName] || [];
};

// 检测过时的依赖
const checkOutdatedDeps = async () => {
  const { exec } = require('child_process');
  
  return new Promise((resolve, reject) => {
    exec('npm outdated --json', (error, stdout) => {
      if (stdout) {
        const outdated = JSON.parse(stdout);
        console.log('Outdated dependencies:', outdated);
        resolve(outdated);
      }
    });
  });
};
```

## 第三部分：优化策略

### 3.1 chunk拆分优化

```javascript
// webpack splitChunks配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,       // 最小chunk大小
      maxSize: 244000,      // 最大chunk大小
      minChunks: 1,         // 最小复用次数
      maxAsyncRequests: 30, // 最大异步请求数
      maxInitialRequests: 30, // 最大初始请求数
      
      cacheGroups: {
        // React相关
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'react-vendors',
          priority: 20
        },
        
        // UI库
        ui: {
          test: /[\\/]node_modules[\\/](antd|@material-ui)[\\/]/,
          name: 'ui-vendors',
          priority: 15
        },
        
        // 其他vendor
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        
        // 公共代码
        common: {
          minChunks: 2,
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};

// 结果分析
// main.js - 应用代码
// react-vendors.js - React相关库
// ui-vendors.js - UI组件库
// vendors.js - 其他第三方库
// common.js - 公共模块
```

### 3.2 依赖优化

```javascript
// 1. 替换大型依赖
// ❌ Moment.js (约300KB)
import moment from 'moment';
const formatted = moment().format('YYYY-MM-DD');

// ✅ date-fns (约13KB，tree-shakeable)
import { format } from 'date-fns';
const formatted = format(new Date(), 'yyyy-MM-dd');

// ✅ Day.js (约2KB)
import dayjs from 'dayjs';
const formatted = dayjs().format('YYYY-MM-DD');

// 2. 按需导入Lodash
// ❌ 全量导入
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ 单独导入
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ✅ lodash-es（支持Tree-Shaking）
import { debounce } from 'lodash-es';

// 3. 优化React组件库
// ❌ 全量导入
import { Button, Modal, Table } from 'antd';

// ✅ 按需导入
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import Table from 'antd/es/table';

// 4. 移除未使用的依赖
// 检查package.json
// npm install depcheck -g
// depcheck

// 5. 使用轻量替代品
// ❌ axios (13KB)
import axios from 'axios';

// ✅ ky (11KB) 或原生fetch
import ky from 'ky';
```

### 3.3 代码优化

```javascript
// 1. 移除console.log
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            pure_funcs: ['console.log', 'console.info']
          }
        }
      })
    ]
  }
};

// 2. 移除注释
terserOptions: {
  format: {
    comments: false
  }
}

// 3. 压缩CSS
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin()
    ]
  }
};

// 4. 图片优化
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }],
            ['svgo', {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false
                }
              ]
            }]
          ]
        }
      }
    })
  ]
};
```

## 第四部分：监控和报告

### 4.1 性能预算

```javascript
// webpack性能预算
module.exports = {
  performance: {
    maxAssetSize: 244000,        // 单个资源最大244KB
    maxEntrypointSize: 244000,   // 入口最大244KB
    hints: 'warning',             // 超出时警告
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js');
    }
  }
};

// size-limit配置
// package.json
{
  "size-limit": [
    {
      "name": "Main bundle",
      "path": "dist/main.*.js",
      "limit": "100 KB",
      "webpack": false
    },
    {
      "name": "Vendor bundle",
      "path": "dist/vendors.*.js",
      "limit": "150 KB"
    }
  ]
}

// CI集成
// .github/workflows/size-check.yml
name: Size Check
on: [pull_request]
jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - uses: andresz1/size-limit-action@v1
```

### 4.2 生成报告

```javascript
// 自动生成分析报告
const fs = require('fs');
const path = require('path');

class BundleReportPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BundleReportPlugin', (stats) => {
      const report = this.generateReport(stats.toJson());
      
      fs.writeFileSync(
        path.join(__dirname, 'bundle-report.md'),
        report
      );
    });
  }
  
  generateReport(stats) {
    const { assets, chunks, modules } = stats;
    
    let report = '# Bundle Analysis Report\n\n';
    
    // 总体概况
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    report += `## Overview\n`;
    report += `- Total Size: ${(totalSize / 1024).toFixed(2)} KB\n`;
    report += `- Assets: ${assets.length}\n`;
    report += `- Chunks: ${chunks.length}\n`;
    report += `- Modules: ${modules.length}\n\n`;
    
    // 最大资源
    report += `## Largest Assets\n`;
    assets
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(asset => {
        report += `- ${asset.name}: ${(asset.size / 1024).toFixed(2)} KB\n`;
      });
    
    // 最大依赖
    report += `\n## Largest Dependencies\n`;
    const deps = this.analyzeDependencies(modules);
    deps.slice(0, 10).forEach(({ name, size }) => {
      report += `- ${name}: ${size.toFixed(2)} KB\n`;
    });
    
    return report;
  }
  
  analyzeDependencies(modules) {
    const deps = {};
    
    modules.forEach(mod => {
      const match = mod.name.match(/node_modules\/(@?[^\/]+)/);
      if (match) {
        const name = match[1];
        deps[name] = (deps[name] || 0) + (mod.size || 0);
      }
    });
    
    return Object.entries(deps)
      .map(([name, size]) => ({ name, size: size / 1024 }))
      .sort((a, b) => b.size - a.size);
  }
}

module.exports = {
  plugins: [
    new BundleReportPlugin()
  ]
};
```

### 4.3 对比分析

```javascript
// 对比两次构建
const compareBundles = (before, after) => {
  const report = {
    added: [],
    removed: [],
    changed: []
  };
  
  const beforeAssets = new Map(
    before.assets.map(a => [a.name, a.size])
  );
  const afterAssets = new Map(
    after.assets.map(a => [a.name, a.size])
  );
  
  // 查找新增
  afterAssets.forEach((size, name) => {
    if (!beforeAssets.has(name)) {
      report.added.push({ name, size });
    }
  });
  
  // 查找删除
  beforeAssets.forEach((size, name) => {
    if (!afterAssets.has(name)) {
      report.removed.push({ name, size });
    }
  });
  
  // 查找变化
  afterAssets.forEach((afterSize, name) => {
    if (beforeAssets.has(name)) {
      const beforeSize = beforeAssets.get(name);
      const diff = afterSize - beforeSize;
      
      if (diff !== 0) {
        report.changed.push({
          name,
          before: beforeSize,
          after: afterSize,
          diff,
          percent: ((diff / beforeSize) * 100).toFixed(2)
        });
      }
    }
  });
  
  return report;
};

// 使用
const beforeStats = require('./stats-before.json');
const afterStats = require('./stats-after.json');
const comparison = compareBundles(beforeStats, afterStats);

console.log('Bundle Comparison:');
console.log('Added:', comparison.added);
console.log('Removed:', comparison.removed);
console.log('Changed:', comparison.changed);
```

## 注意事项

### 1. 分析频率

```javascript
// 定期分析
// - 每次重大功能添加后
// - 每次依赖更新后
// - 定期（如每周）审查

// CI/CD集成
// package.json
{
  "scripts": {
    "analyze:ci": "webpack --mode production --profile --json > stats.json && node analyze-ci.js"
  }
}

// analyze-ci.js
const stats = require('./stats.json');
const MAX_SIZE = 500 * 1024; // 500KB

const oversized = stats.assets.filter(asset => asset.size > MAX_SIZE);

if (oversized.length > 0) {
  console.error('Oversized assets:', oversized);
  process.exit(1);
}
```

### 2. 优化目标

```javascript
// 设定合理的目标
const performanceBudgets = {
  initial: {
    js: 170,      // KB
    css: 30,      // KB
    total: 200    // KB
  },
  lazy: {
    js: 100,      // KB per chunk
    css: 20       // KB per chunk
  }
};
```

### 3. 持续监控

```javascript
// Lighthouse CI
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 5000 }],
        'total-byte-weight': ['error', { maxNumericValue: 500000 }]
      }
    }
  }
};
```

## 常见问题

### Q1: 多久分析一次bundle？

**A:** 建议每次重大更新后分析，或设置CI自动分析。

### Q2: bundle多大算大？

**A:** 初始bundle建议<200KB，单个chunk<100KB。

### Q3: 如何减小bundle体积？

**A:** 代码分割、Tree-Shaking、依赖优化、压缩。

### Q4: 分析工具哪个最好？

**A:** webpack-bundle-analyzer功能最全，source-map-explorer更直观。

### Q5: 如何发现重复依赖？

**A:** 使用bundle analyzer查看依赖树。

### Q6: CSS如何分析？

**A:** 使用PurgeCSS和coverage工具。

### Q7: 图片算在bundle里吗？

**A:** 小图片可能被内联，大图片单独处理。

### Q8: 如何对比版本差异？

**A:** 保存历史stats.json，编写对比脚本。

### Q9: chunk命名有什么技巧？

**A:** 使用有意义的名称，便于识别和缓存。

### Q10: 性能预算如何设定？

**A:** 基于实际需求和竞品分析。

## 总结

### 核心要点

```
1. 分析工具
   ✅ webpack-bundle-analyzer
   ✅ source-map-explorer
   ✅ size-limit
   ✅ Lighthouse CI

2. 分析内容
   ✅ bundle总体积
   ✅ chunk分布
   ✅ 依赖大小
   ✅ 重复模块

3. 优化方向
   ✅ 代码分割
   ✅ 依赖优化
   ✅ Tree-Shaking
   ✅ 压缩混淆
```

### 最佳实践

```
1. 定期分析
   ✅ CI集成
   ✅ 版本对比
   ✅ 设定预算
   ✅ 监控趋势

2. 优化策略
   ✅ 识别大型依赖
   ✅ 查找替代方案
   ✅ 消除重复
   ✅ 持续优化

3. 团队协作
   ✅ 分享报告
   ✅ 设定标准
   ✅ 审查流程
   ✅ 知识沉淀
```

Bundle体积分析是性能优化的第一步，只有准确识别问题才能有效优化。

## 第五部分：深度分析技巧

### 5.1 Source Map分析

```javascript
// 使用source-map-explorer详细分析
// package.json
{
  "scripts": {
    "analyze:sourcemap": "source-map-explorer build/static/js/*.js --html build/source-map-report.html"
  }
}

// 对比多个构建
// compare-builds.js
const fs = require('fs');
const path = require('path');

function compareBuilds(build1Path, build2Path) {
  const build1Files = getJSFiles(build1Path);
  const build2Files = getJSFiles(build2Path);

  const comparison = {
    added: [],
    removed: [],
    changed: [],
    totalSizeChange: 0
  };

  // 查找变化
  build1Files.forEach(file1 => {
    const file2 = build2Files.find(f => f.name === file1.name);

    if (!file2) {
      comparison.removed.push(file1);
      comparison.totalSizeChange -= file1.size;
    } else if (file1.size !== file2.size) {
      comparison.changed.push({
        name: file1.name,
        sizeBefore: file1.size,
        sizeAfter: file2.size,
        diff: file2.size - file1.size,
        percentChange: ((file2.size - file1.size) / file1.size * 100).toFixed(2)
      });
      comparison.totalSizeChange += file2.size - file1.size;
    }
  });

  build2Files.forEach(file2 => {
    if (!build1Files.find(f => f.name === file2.name)) {
      comparison.added.push(file2);
      comparison.totalSizeChange += file2.size;
    }
  });

  return comparison;
}

function getJSFiles(dirPath) {
  const files = [];
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && item.endsWith('.js')) {
      files.push({
        name: item,
        size: stat.size,
        path: fullPath
      });
    }
  });

  return files;
}

// 使用
const comparison = compareBuilds('./build-old', './build-new');
console.log('Build Comparison:', comparison);
```

### 5.2 依赖关系图

```javascript
// 生成依赖关系可视化
// dependency-graph.js
const madge = require('madge');

async function generateDependencyGraph() {
  const result = await madge('src/index.js', {
    fileExtensions: ['js', 'jsx'],
    excludeRegExp: /node_modules/
  });

  const graph = result.obj();
  const circular = result.circular();
  const orphans = result.orphans();

  // 查找最深依赖链
  const chains = findDeepestChains(graph);

  // 生成报告
  const report = {
    totalModules: Object.keys(graph).length,
    circularDependencies: circular.length,
    orphanModules: orphans.length,
    deepestChains: chains.slice(0, 10),
    largestModules: findLargestModules(graph)
  };

  // 生成图片
  await result.image('dependency-graph.svg');

  // 输出JSON
  fs.writeFileSync('dependency-report.json', JSON.stringify(report, null, 2));

  console.log('Dependency Graph Analysis:');
  console.log(`Total Modules: ${report.totalModules}`);
  console.log(`Circular Dependencies: ${report.circularDependencies}`);
  console.log(`Orphan Modules: ${report.orphanModules}`);

  if (circular.length > 0) {
    console.log('\nCircular Dependencies Found:');
    circular.forEach(cycle => {
      console.log(`  ${cycle.join(' → ')}`);
    });
  }

  return report;
}

function findDeepestChains(graph, maxDepth = 10) {
  const chains = [];

  function traverse(node, chain = [], visited = new Set()) {
    if (chain.length >= maxDepth || visited.has(node)) {
      return;
    }

    const newChain = [...chain, node];
    const newVisited = new Set([...visited, node]);

    if (!graph[node] || graph[node].length === 0) {
      chains.push(newChain);
      return;
    }

    graph[node].forEach(dep => {
      traverse(dep, newChain, newVisited);
    });
  }

  Object.keys(graph).forEach(node => {
    traverse(node);
  });

  return chains.sort((a, b) => b.length - a.length);
}

function findLargestModules(graph) {
  return Object.entries(graph)
    .map(([name, deps]) => ({
      name,
      directDeps: deps.length,
      totalDeps: countTotalDeps(name, graph)
    }))
    .sort((a, b) => b.totalDeps - a.totalDeps)
    .slice(0, 20);
}

function countTotalDeps(node, graph, visited = new Set()) {
  if (visited.has(node) || !graph[node]) return 0;

  visited.add(node);
  let count = graph[node].length;

  graph[node].forEach(dep => {
    count += countTotalDeps(dep, graph, visited);
  });

  return count;
}

generateDependencyGraph();
```

### 5.3 运行时性能分析

```javascript
// 运行时Bundle加载性能
class BundlePerformanceMonitor {
  constructor() {
    this.metrics = {
      bundles: [],
      resources: [],
      timings: {}
    };

    this.observeResources();
    this.observePerformance();
  }

  observeResources() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.initiatorType === 'script') {
            this.metrics.bundles.push({
              name: entry.name,
              size: entry.transferSize,
              duration: entry.duration,
              startTime: entry.startTime,
              responseEnd: entry.responseEnd
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  observePerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;

      this.metrics.timings = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        domProcessing: timing.domComplete - timing.domLoading,
        total: timing.loadEventEnd - timing.navigationStart
      };
    }
  }

  getBundleReport() {
    const totalSize = this.metrics.bundles.reduce((sum, b) => sum + b.size, 0);
    const avgDuration = this.metrics.bundles.reduce((sum, b) => sum + b.duration, 0) / this.metrics.bundles.length;

    return {
      totalBundles: this.metrics.bundles.length,
      totalSize: totalSize,
      avgLoadTime: avgDuration,
      bundles: this.metrics.bundles.sort((a, b) => b.size - a.size),
      timings: this.metrics.timings,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const totalSize = this.metrics.bundles.reduce((sum, b) => sum + b.size, 0);

    // 检查总体积
    if (totalSize > 500 * 1024) {
      recommendations.push({
        type: 'size',
        severity: 'high',
        message: `Total bundle size (${(totalSize / 1024).toFixed(2)}KB) exceeds 500KB`,
        suggestion: 'Consider code splitting or lazy loading'
      });
    }

    // 检查大型bundle
    this.metrics.bundles.forEach(bundle => {
      if (bundle.size > 200 * 1024) {
        recommendations.push({
          type: 'large-bundle',
          severity: 'medium',
          message: `${bundle.name} is ${(bundle.size / 1024).toFixed(2)}KB`,
          suggestion: 'Split this bundle into smaller chunks'
        });
      }
    });

    // 检查加载时间
    if (this.metrics.timings.total > 3000) {
      recommendations.push({
        type: 'slow-load',
        severity: 'high',
        message: `Page load time (${this.metrics.timings.total}ms) exceeds 3s`,
        suggestion: 'Optimize bundle loading strategy'
      });
    }

    return recommendations;
  }

  reportToAnalytics() {
    const report = this.getBundleReport();

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/performance/bundle', JSON.stringify(report));
    } else {
      fetch('/api/performance/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
    }
  }
}

// 使用
const monitor = new BundlePerformanceMonitor();

window.addEventListener('load', () => {
  setTimeout(() => {
    monitor.reportToAnalytics();
    console.log('Bundle Performance Report:', monitor.getBundleReport());
  }, 1000);
});
```

### 5.4 历史趋势分析

```javascript
// 跟踪bundle大小历史趋势
// bundle-history.js
const fs = require('fs');
const path = require('path');

class BundleHistoryTracker {
  constructor(historyFile = 'bundle-history.json') {
    this.historyFile = historyFile;
    this.history = this.loadHistory();
  }

  loadHistory() {
    if (fs.existsSync(this.historyFile)) {
      return JSON.parse(fs.readFileSync(this.historyFile, 'utf-8'));
    }
    return { entries: [] };
  }

  saveHistory() {
    fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
  }

  addEntry(stats) {
    const entry = {
      timestamp: new Date().toISOString(),
      commit: process.env.GIT_COMMIT || 'unknown',
      branch: process.env.GIT_BRANCH || 'unknown',
      totalSize: 0,
      assets: []
    };

    stats.assets.forEach(asset => {
      entry.totalSize += asset.size;
      entry.assets.push({
        name: asset.name,
        size: asset.size
      });
    });

    this.history.entries.push(entry);

    // 保留最近100个条目
    if (this.history.entries.length > 100) {
      this.history.entries = this.history.entries.slice(-100);
    }

    this.saveHistory();
  }

  analyzeTrend(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentEntries = this.history.entries.filter(entry =>
      new Date(entry.timestamp) > cutoff
    );

    if (recentEntries.length < 2) {
      return { trend: 'insufficient-data' };
    }

    const first = recentEntries[0];
    const last = recentEntries[recentEntries.length - 1];

    const sizeChange = last.totalSize - first.totalSize;
    const percentChange = (sizeChange / first.totalSize) * 100;

    return {
      trend: sizeChange > 0 ? 'increasing' : 'decreasing',
      sizeChange,
      percentChange: percentChange.toFixed(2),
      firstSize: first.totalSize,
      lastSize: last.totalSize,
      entries: recentEntries.length,
      averageSize: recentEntries.reduce((sum, e) => sum + e.totalSize, 0) / recentEntries.length
    };
  }

  findAnomalies(threshold = 10) {
    const anomalies = [];

    for (let i = 1; i < this.history.entries.length; i++) {
      const prev = this.history.entries[i - 1];
      const curr = this.history.entries[i];

      const change = ((curr.totalSize - prev.totalSize) / prev.totalSize) * 100;

      if (Math.abs(change) > threshold) {
        anomalies.push({
          timestamp: curr.timestamp,
          commit: curr.commit,
          change: change.toFixed(2),
          prevSize: prev.totalSize,
          currSize: curr.totalSize
        });
      }
    }

    return anomalies;
  }

  generateReport() {
    const trend = this.analyzeTrend();
    const anomalies = this.findAnomalies();

    console.log('Bundle Size History Report');
    console.log('=========================');
    console.log(`\nTrend (last 30 days):`);
    console.log(`  Direction: ${trend.trend}`);
    console.log(`  Size Change: ${(trend.sizeChange / 1024).toFixed(2)}KB`);
    console.log(`  Percent Change: ${trend.percentChange}%`);

    if (anomalies.length > 0) {
      console.log(`\nAnomalies Detected:`);
      anomalies.forEach(anomaly => {
        console.log(`  ${anomaly.timestamp} (${anomaly.commit}): ${anomaly.change}%`);
      });
    }

    return { trend, anomalies };
  }
}

// 使用
const tracker = new BundleHistoryTracker();
const stats = require('./dist/stats.json');
tracker.addEntry(stats);
tracker.generateReport();
```

## 第六部分：优化决策

### 6.1 优先级排序

```javascript
// 根据分析结果确定优化优先级
class OptimizationPrioritizer {
  constructor(analysisData) {
    this.data = analysisData;
    this.priorities = [];
  }

  analyze() {
    this.analyzeSize();
    this.analyzeDuplicates();
    this.analyzeUnused();
    this.analyzeLoadTime();

    return this.priorities.sort((a, b) => b.score - a.score);
  }

  analyzeSize() {
    const largeDeps = this.data.dependencies
      .filter(dep => dep.size > 100 * 1024)
      .map(dep => ({
        type: 'large-dependency',
        target: dep.name,
        issue: `Large dependency: ${(dep.size / 1024).toFixed(2)}KB`,
        score: dep.size / 10240,  // 分数基于大小
        effort: 'medium',
        impact: 'high',
        actions: [
          'Find lighter alternative',
          'Import only needed parts',
          'Consider lazy loading'
        ]
      }));

    this.priorities.push(...largeDeps);
  }

  analyzeDuplicates() {
    const duplicates = this.findDuplicates();

    duplicates.forEach(dup => {
      this.priorities.push({
        type: 'duplicate',
        target: dup.package,
        issue: `Duplicate versions: ${dup.versions.join(', ')}`,
        score: dup.totalSize / 5120,
        effort: 'low',
        impact: 'medium',
        actions: [
          'Align versions in package.json',
          'Use npm dedupe',
          'Check yarn.lock/package-lock.json'
        ]
      });
    });
  }

  analyzeUnused() {
    const unused = this.data.modules.filter(m => !m.used);

    if (unused.length > 0) {
      this.priorities.push({
        type: 'unused-code',
        target: 'Multiple modules',
        issue: `${unused.length} unused modules detected`,
        score: unused.length * 10,
        effort: 'low',
        impact: 'medium',
        actions: [
          'Remove unused imports',
          'Enable Tree-Shaking',
          'Check sideEffects config'
        ]
      });
    }
  }

  analyzeLoadTime() {
    if (this.data.performance.loadTime > 3000) {
      this.priorities.push({
        type: 'slow-load',
        target: 'Overall bundle',
        issue: `Load time: ${this.data.performance.loadTime}ms`,
        score: 100,
        effort: 'high',
        impact: 'high',
        actions: [
          'Implement code splitting',
          'Add lazy loading',
          'Optimize chunk strategy',
          'Use CDN for static assets'
        ]
      });
    }
  }

  findDuplicates() {
    const packages = {};

    this.data.modules.forEach(mod => {
      const match = mod.name.match(/node_modules\/(.+?)@/);
      if (match) {
        const pkg = match[1];
        const version = mod.version;

        if (!packages[pkg]) packages[pkg] = {};
        if (!packages[pkg][version]) packages[pkg][version] = 0;

        packages[pkg][version] += mod.size;
      }
    });

    return Object.entries(packages)
      .filter(([, versions]) => Object.keys(versions).length > 1)
      .map(([pkg, versions]) => ({
        package: pkg,
        versions: Object.keys(versions),
        totalSize: Object.values(versions).reduce((a, b) => a + b, 0)
      }));
  }

  generateActionPlan() {
    const priorities = this.analyze();

    console.log('Optimization Action Plan');
    console.log('========================\n');

    priorities.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.issue}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   Target: ${item.target}`);
      console.log(`   Priority Score: ${item.score.toFixed(2)}`);
      console.log(`   Effort: ${item.effort} | Impact: ${item.impact}`);
      console.log(`   Actions:`);
      item.actions.forEach(action => {
        console.log(`   - ${action}`);
      });
      console.log('');
    });

    return priorities;
  }
}

// 使用
const prioritizer = new OptimizationPrioritizer(analysisData);
const actionPlan = prioritizer.generateActionPlan();
```

### 6.2 ROI计算

```javascript
// 计算优化的投资回报率
class OptimizationROI {
  calculate(optimization) {
    const {
      currentSize,
      estimatedNewSize,
      implementationHours,
      hourlyRate = 100
    } = optimization;

    const sizeSaved = currentSize - estimatedNewSize;
    const percentSaved = (sizeSaved / currentSize) * 100;

    // 成本
    const implementationCost = implementationHours * hourlyRate;

    // 收益（基于页面加载改善）
    const loadTimeImprovement = this.estimateLoadTimeImprovement(sizeSaved);
    const conversionImprovement = this.estimateConversionImprovement(loadTimeImprovement);
    const monthlyRevenue = this.estimateMonthlyRevenue(conversionImprovement);

    // ROI
    const monthlyROI = (monthlyRevenue / implementationCost) * 100;
    const breakEvenMonths = implementationCost / monthlyRevenue;

    return {
      sizeSaved,
      percentSaved: percentSaved.toFixed(2),
      implementationCost,
      loadTimeImprovement,
      conversionImprovement: (conversionImprovement * 100).toFixed(2),
      monthlyRevenue: monthlyRevenue.toFixed(2),
      monthlyROI: monthlyROI.toFixed(2),
      breakEvenMonths: breakEvenMonths.toFixed(2),
      recommendation: monthlyROI > 100 ? 'Highly Recommended' : monthlyROI > 50 ? 'Recommended' : 'Consider'
    };
  }

  estimateLoadTimeImprovement(sizeSaved) {
    // 假设：每100KB节省约200ms加载时间（基于3G网络）
    return (sizeSaved / 102400) * 200;
  }

  estimateConversionImprovement(loadTimeImprovement) {
    // 研究显示：每100ms的改善可提升1%转化率
    return (loadTimeImprovement / 100) * 0.01;
  }

  estimateMonthlyRevenue(conversionImprovement) {
    // 假设每月10000访问者，平均订单$50
    const monthlyVisitors = 10000;
    const avgOrderValue = 50;
    const baseConversionRate = 0.02;

    const additionalConversions = monthlyVisitors * conversionImprovement * baseConversionRate;
    return additionalConversions * avgOrderValue;
  }
}

// 使用
const roiCalculator = new OptimizationROI();

const optimization = {
  currentSize: 500 * 1024,  // 500KB
  estimatedNewSize: 300 * 1024,  // 300KB
  implementationHours: 8
};

const roi = roiCalculator.calculate(optimization);
console.log('Optimization ROI:', roi);
```

## 总结升级

### 高级分析技术

```
1. 深度分析
   - Source Map分析
   - 依赖关系图
   - 运行时性能
   - 历史趋势

2. 优化决策
   - 优先级排序
   - ROI计算
   - 行动计划
   - 效果预测

3. 持续改进
   - 自动化监控
   - 趋势追踪
   - 异常检测
   - 定期审查

4. 团队协作
   - 可视化报告
   - 共享指标
   - 优化目标
   - 知识沉淀
```

### 完整分析流程

```
第一阶段：数据收集
☐ 构建stats.json
☐ 生成source map
☐ 收集性能指标
☐ 记录历史数据

第二阶段：深度分析
☐ 分析bundle组成
☐ 识别大型依赖
☐ 检查重复模块
☐ 评估Tree-Shaking

第三阶段：优化决策
☐ 计算优先级
☐ 评估ROI
☐ 制定行动计划
☐ 设定目标

第四阶段：执行优化
☐ 实施优化措施
☐ 验证效果
☐ 调整策略
☐ 文档记录

第五阶段：持续监控
☐ 定期分析
☐ 趋势追踪
☐ 性能预警
☐ 迭代优化
```

Bundle体积分析不仅是技术活，更是持续改进的过程，需要系统化的方法和团队协作。

