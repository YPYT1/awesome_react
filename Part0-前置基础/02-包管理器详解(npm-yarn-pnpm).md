# 包管理器详解：npm、yarn、pnpm完全指南

## 第一章：包管理器基础概念

### 1.1 什么是包管理器

包管理器（Package Manager）是现代前端开发的核心工具之一，它负责自动化地管理项目依赖。在Node.js生态系统中，主要有三大包管理器：npm、yarn和pnpm。

#### 包管理器的核心功能

1. **依赖安装**：自动下载和安装项目所需的第三方库
2. **版本管理**：管理不同版本的依赖包，确保版本一致性
3. **依赖解析**：自动处理依赖之间的关系和冲突
4. **脚本执行**：运行项目中定义的各种脚本命令
5. **发布包**：将自己开发的包发布到npm仓库

#### 为什么需要包管理器

在没有包管理器的时代，开发者需要：
- 手动下载每个库文件
- 手动管理版本更新
- 手动处理依赖冲突
- 手动配置加载顺序

这个过程既繁琐又容易出错。包管理器的出现彻底改变了这一现状。

### 1.2 包管理器发展历史

#### npm的诞生（2010年）

npm（Node Package Manager）是最早的Node.js包管理器，由Isaac Z. Schlueter创建于2010年。它随Node.js一起发布，成为事实上的标准包管理器。

**npm的里程碑：**
- 2010年：npm 0.x发布
- 2014年：npm 2.x引入扁平化依赖结构
- 2016年：npm 3.x完全扁平化安装
- 2017年：npm 5.x引入package-lock.json
- 2020年：npm 7.x支持workspaces
- 2024年：npm 10.x持续优化性能

#### yarn的革新（2016年）

2016年，Facebook、Google、Exponent和Tilde联合推出yarn，解决了当时npm的几个痛点：
- 安装速度慢
- 版本不一致
- 离线安装困难
- 安全性问题

**yarn的创新：**
- yarn.lock锁文件确保版本一致
- 并行安装大幅提升速度
- 离线缓存机制
- 更好的输出信息

#### pnpm的突破（2017年）

2017年，pnpm（performant npm）发布，带来了革命性的磁盘空间管理方式：
- 使用硬链接和符号链接
- 全局存储所有包
- 节省磁盘空间达90%以上
- 严格的依赖管理

### 1.3 三大包管理器对比

#### 核心差异对比表

```
特性对比：

安装速度：
npm:     ⭐⭐⭐
yarn:    ⭐⭐⭐⭐
pnpm:    ⭐⭐⭐⭐⭐

磁盘空间：
npm:     ⭐⭐
yarn:    ⭐⭐
pnpm:    ⭐⭐⭐⭐⭐

安全性：
npm:     ⭐⭐⭐⭐
yarn:    ⭐⭐⭐⭐
pnpm:    ⭐⭐⭐⭐⭐

Monorepo支持：
npm:     ⭐⭐⭐
yarn:    ⭐⭐⭐⭐⭐
pnpm:    ⭐⭐⭐⭐⭐

生态成熟度：
npm:     ⭐⭐⭐⭐⭐
yarn:    ⭐⭐⭐⭐
pnpm:    ⭐⭐⭐
```

## 第二章：npm详解

### 2.1 npm基础

#### 安装npm

npm随Node.js一起安装，无需单独安装：

```bash
# 检查npm版本
npm -v
# 或
npm --version

# 查看npm配置
npm config list

# 查看全局安装路径
npm config get prefix
```

#### npm版本管理

```bash
# 查看可用的npm版本
npm view npm versions --json

# 更新npm到最新版本
npm install -g npm@latest

# 更新到指定版本
npm install -g npm@10.2.0

# 使用npx运行最新npm（不安装）
npx npm@latest --version
```

### 2.2 package.json详解

package.json是项目的配置文件，包含了项目的元数据和依赖信息。

#### 创建package.json

```bash
# 交互式创建
npm init

# 使用默认配置快速创建
npm init -y

# 使用自定义初始化器
npm init react-app my-app
npm init vite@latest my-vue-app
```

#### package.json结构详解

```json
{
  "name": "my-react-app",
  "version": "1.0.0",
  "description": "React应用示例",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext js,jsx",
    "format": "prettier --write \"src/**/*.{js,jsx}\""
  },
  "keywords": ["react", "vite"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

#### 字段详解

**基础字段：**
- `name`：包名称，必须小写，不能有空格
- `version`：版本号，遵循语义化版本规范
- `description`：包描述
- `main`：入口文件
- `type`：模块类型（"module"表示ES模块）

**脚本字段：**
- `scripts`：定义可执行的命令
- `bin`：可执行文件路径

**依赖字段：**
- `dependencies`：生产环境依赖
- `devDependencies`：开发环境依赖
- `peerDependencies`：对等依赖
- `optionalDependencies`：可选依赖

**限制字段：**
- `engines`：Node.js和npm版本要求
- `os`：操作系统限制
- `cpu`：CPU架构限制

### 2.3 依赖安装

#### 安装依赖的多种方式

```bash
# 安装所有依赖
npm install
# 或简写
npm i

# 安装生产依赖
npm install react react-dom
npm i react react-dom

# 安装开发依赖
npm install -D vite
npm install --save-dev vite

# 安装全局包
npm install -g create-react-app
npm i -g yarn pnpm

# 安装指定版本
npm install react@18.2.0
npm i lodash@^4.17.21
npm i typescript@~5.3.0

# 从GitHub安装
npm install user/repo
npm i github:user/repo#branch

# 从本地路径安装
npm install ../my-package
npm i file:../my-package

# 从tarball安装
npm install https://registry.npmjs.org/package/-/package-1.0.0.tgz
```

#### 版本符号说明

```bash
# 精确版本
"react": "18.2.0"         # 只安装18.2.0

# 波浪号 ~ (补丁版本)
"react": "~18.2.0"        # 安装18.2.x最新版

# 插入号 ^ (次版本)
"react": "^18.2.0"        # 安装18.x.x最新版

# 大于/小于
"react": ">18.0.0"        # 大于18.0.0
"react": ">=18.0.0"       # 大于等于18.0.0
"react": "<19.0.0"        # 小于19.0.0

# 范围
"react": ">=18.0.0 <19.0.0"
"react": "18.0.0 - 18.2.0"

# 最新版本
"react": "latest"         # 最新稳定版
"react": "*"              # 任意版本

# 预发布版本
"react": "19.0.0-rc.0"    # 候选版本
"react": "19.0.0-beta.1"  # 测试版本
```

### 2.4 package-lock.json

package-lock.json确保依赖版本的一致性。

#### package-lock.json的作用

1. **锁定版本**：记录安装的确切版本
2. **加速安装**：记录下载位置，减少解析时间
3. **保证一致性**：确保团队成员安装相同版本
4. **安全审计**：记录完整的依赖树

#### package-lock.json示例

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "my-app",
      "version": "1.0.0",
      "dependencies": {
        "react": "^19.0.0"
      }
    },
    "node_modules/react": {
      "version": "19.0.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.0.0.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    }
  }
}
```

#### 管理package-lock.json

```bash
# 更新锁文件
npm update

# 根据package.json更新锁文件
npm install

# 忽略锁文件安装
npm install --no-package-lock

# 删除锁文件重新生成
rm package-lock.json
npm install
```

### 2.5 npm scripts

npm scripts是定义在package.json中的可执行命令。

#### 基础脚本

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint src"
  }
}
```

运行脚本：

```bash
npm run dev
npm run build
npm run test

# 特殊脚本可以省略run
npm start
npm test
npm stop
```

#### 生命周期脚本

npm提供了预定义的生命周期钩子：

```json
{
  "scripts": {
    "preinstall": "echo 'Before install'",
    "install": "echo 'Installing'",
    "postinstall": "echo 'After install'",
    
    "prebuild": "echo 'Before build'",
    "build": "vite build",
    "postbuild": "echo 'After build'",
    
    "pretest": "echo 'Before test'",
    "test": "vitest",
    "posttest": "echo 'After test'"
  }
}
```

执行顺序：
```
npm install → preinstall → install → postinstall
npm run build → prebuild → build → postbuild
```

#### 高级脚本技巧

```json
{
  "scripts": {
    "// 并行执行": "",
    "dev": "npm-run-all --parallel dev:*",
    "dev:server": "node server.js",
    "dev:client": "vite",
    
    "// 串行执行": "",
    "deploy": "npm-run-all build test deploy:prod",
    "deploy:prod": "scp -r dist/* user@server:/path",
    
    "// 环境变量": "",
    "build:dev": "NODE_ENV=development vite build",
    "build:prod": "NODE_ENV=production vite build",
    
    "// 跨平台环境变量": "",
    "build": "cross-env NODE_ENV=production vite build",
    
    "// 传递参数": "",
    "test": "vitest",
    "test:watch": "npm test -- --watch",
    
    "// 多命令组合": "",
    "clean": "rm -rf dist && mkdir dist",
    "copy": "cp -r public/* dist/",
    "build": "npm run clean && npm run copy && vite build"
  }
}
```

### 2.6 npm配置

#### 查看和修改配置

```bash
# 查看所有配置
npm config list
npm config ls -l

# 查看特定配置
npm config get registry
npm config get proxy

# 设置配置
npm config set registry https://registry.npmmirror.com
npm config set proxy http://proxy.example.com:8080

# 删除配置
npm config delete proxy

# 编辑配置文件
npm config edit
```

#### 常用配置项

```bash
# 镜像源配置
npm config set registry https://registry.npmmirror.com

# 代理配置
npm config set proxy http://proxy.example.com:8080
npm config set https-proxy http://proxy.example.com:8080

# 全局安装路径
npm config set prefix /usr/local

# 缓存路径
npm config set cache ~/.npm

# 初始化默认值
npm config set init-author-name "Your Name"
npm config set init-author-email "your.email@example.com"
npm config set init-license "MIT"
```

#### .npmrc配置文件

可以在多个位置创建.npmrc文件：

1. **项目级**：`/path/to/project/.npmrc`
2. **用户级**：`~/.npmrc`
3. **全局级**：`$PREFIX/etc/.npmrc`
4. **内置级**：`/path/to/npm/.npmrc`

优先级：项目级 > 用户级 > 全局级 > 内置级

示例.npmrc文件：

```ini
# 镜像源
registry=https://registry.npmmirror.com

# 作用域包镜像
@company:registry=https://npm.company.com

# 认证token
//registry.npmjs.org/:_authToken=${NPM_TOKEN}

# 包安装配置
save-exact=true
package-lock=true

# 性能优化
prefer-offline=true
audit=false

# 日志级别
loglevel=warn
```

### 2.7 npm实用命令

#### 包信息查询

```bash
# 查看包信息
npm view react
npm info react

# 查看包的所有版本
npm view react versions
npm view react versions --json

# 查看包的最新版本
npm view react version

# 查看包的依赖
npm view react dependencies

# 搜索包
npm search react router
```

#### 包管理命令

```bash
# 列出已安装的包
npm list
npm ls

# 列出全局包
npm list -g --depth=0

# 列出过期的包
npm outdated

# 更新包
npm update
npm update react
npm update -g

# 卸载包
npm uninstall react
npm un react
npm remove react
npm rm react

# 清理未使用的包
npm prune
```

#### 缓存管理

```bash
# 查看缓存路径
npm config get cache

# 查看缓存内容
npm cache ls

# 验证缓存
npm cache verify

# 清空缓存
npm cache clean --force
```

#### 审计和安全

```bash
# 安全审计
npm audit

# 自动修复安全问题
npm audit fix

# 强制修复（可能破坏性）
npm audit fix --force

# 查看详细审计报告
npm audit --json
```

### 2.8 发布包到npm

#### 准备发布

```bash
# 登录npm
npm login

# 查看当前用户
npm whoami

# 测试包
npm pack

# 发布前检查
npm publish --dry-run
```

#### 发布包

```bash
# 发布公共包
npm publish

# 发布作用域包
npm publish --access public

# 发布beta版本
npm version prerelease --preid=beta
npm publish --tag beta

# 更新版本并发布
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

#### 管理已发布的包

```bash
# 撤销发布（72小时内）
npm unpublish package-name@version

# 废弃包
npm deprecate package-name@version "message"

# 查看包的下载统计
npm view package-name

# 添加/移除维护者
npm owner add username package-name
npm owner rm username package-name
```

## 第三章：yarn详解

### 3.1 yarn基础

#### 安装yarn

```bash
# 使用npm安装
npm install -g yarn

# 检查版本
yarn --version

# 升级yarn
npm upgrade -g yarn
```

#### yarn 1 vs yarn 2/3/4 (Berry)

yarn有两个主要版本：
- **Yarn Classic (1.x)**：传统版本
- **Yarn Berry (2.x+)**：现代版本，完全重写

### 3.2 yarn基本命令

#### 依赖管理

```bash
# 初始化项目
yarn init
yarn init -y

# 安装所有依赖
yarn
yarn install

# 添加依赖
yarn add react
yarn add -D vite
yarn add react@18.2.0

# 升级依赖
yarn upgrade react
yarn upgrade-interactive

# 移除依赖
yarn remove react
```

#### yarn.lock

yarn.lock是yarn的锁文件，功能类似package-lock.json：

```yaml
react@^19.0.0:
  version "19.0.0"
  resolved "https://registry.yarnpkg.com/react/-/react-19.0.0.tgz"
  integrity sha512-...
  dependencies:
    loose-envify "^1.1.0"
```

### 3.3 yarn workspaces

yarn workspaces是管理monorepo的强大工具。

#### 配置workspaces

根目录package.json：

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

目录结构：

```
my-project/
  package.json
  packages/
    app/
      package.json
    shared/
      package.json
```

#### workspaces命令

```bash
# 在所有workspace中执行命令
yarn workspaces run build
yarn workspaces run test

# 在特定workspace中执行
yarn workspace app run dev
yarn workspace shared add lodash

# 查看workspaces信息
yarn workspaces info
```

### 3.4 yarn 2+ (Berry)特性

#### 零安装（Zero-Installs）

yarn 2+可以将依赖提交到Git，实现零安装：

```bash
# 启用PnP模式
yarn set version berry

# 生成.pnp.cjs文件
yarn install

# .gitignore中移除
# .pnp.cjs
# .yarn/cache
```

#### Plug'n'Play (PnP)

PnP模式不使用node_modules：

```javascript
// .yarnrc.yml
nodeLinker: pnp
```

优点：
- 安装速度快10倍以上
- 磁盘空间占用小
- 依赖解析更严格

### 3.5 yarn脚本和配置

#### 脚本执行

```bash
# 运行脚本
yarn run dev
yarn dev  # 可省略run

# 传递参数
yarn test --watch
```

#### 配置文件

.yarnrc.yml（yarn 2+）：

```yaml
nodeLinker: node-modules
yarnPath: .yarn/releases/yarn-4.0.0.cjs

plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs
    spec: "@yarnpkg/plugin-typescript"

npmRegistryServer: "https://registry.npmmirror.com"
```

## 第四章：pnpm详解

### 4.1 pnpm基础

#### 安装pnpm

```bash
# 使用npm安装
npm install -g pnpm

# 使用独立脚本安装
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 检查版本
pnpm -v
```

#### pnpm的优势

1. **节省磁盘空间**：使用硬链接，节省90%以上空间
2. **安装速度快**：比npm快2-3倍
3. **严格的依赖管理**：防止幽灵依赖
4. **天然支持monorepo**

### 4.2 pnpm核心概念

#### 存储结构

pnpm使用全局store存储所有包：

```
~/.pnpm-store/
  v3/
    files/
      00/
        abc123...
```

项目中使用硬链接：

```
node_modules/
  .pnpm/
    react@19.0.0/
      node_modules/
        react/
  react -> .pnpm/react@19.0.0/node_modules/react
```

#### 依赖管理方式

```
传统npm/yarn：
node_modules/
  package-a/
  package-b/
  package-c/

pnpm：
node_modules/
  .pnpm/
    package-a@1.0.0/
    package-b@2.0.0/
    package-c@3.0.0/
  package-a -> .pnpm/package-a@1.0.0/node_modules/package-a
```

### 4.3 pnpm基本命令

#### 依赖管理

```bash
# 初始化
pnpm init

# 安装依赖
pnpm install
pnpm i

# 添加依赖
pnpm add react
pnpm add -D vite
pnpm add -g typescript

# 更新依赖
pnpm update
pnpm up react

# 移除依赖
pnpm remove react
pnpm rm react
```

#### pnpm-lock.yaml

pnpm使用pnpm-lock.yaml作为锁文件：

```yaml
lockfileVersion: '6.0'

dependencies:
  react:
    specifier: ^19.0.0
    version: 19.0.0

packages:
  /react@19.0.0:
    resolution: {integrity: sha512-...}
    dependencies:
      loose-envify: 1.4.0
```

### 4.4 pnpm workspaces

#### 配置workspaces

pnpm-workspace.yaml：

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

#### workspaces命令

```bash
# 递归执行命令
pnpm -r run build
pnpm -r test

# 过滤执行
pnpm --filter app run dev
pnpm --filter @scope/package build

# 并行执行
pnpm -r --parallel run build

# 安装所有workspace依赖
pnpm install -r
```

### 4.5 pnpm高级特性

#### 严格模式

pnpm默认使用严格模式，防止访问未声明的依赖：

```javascript
// 错误：lodash未在package.json中声明
import _ from 'lodash'; // 会报错

// 正确：先添加依赖
// pnpm add lodash
import _ from 'lodash';
```

#### .npmrc配置

```ini
# shamefully-hoist（兼容性）
shamefully-hoist=false

# 公共hoist模式
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# 严格对等依赖
strict-peer-dependencies=true

# 自动安装对等依赖
auto-install-peers=true
```

#### 性能优化

```bash
# 使用硬链接而非符号链接
pnpm config set symlink false

# 禁用进度条（CI环境）
pnpm install --reporter=append-only

# 冻结锁文件（CI环境）
pnpm install --frozen-lockfile
```

### 4.6 pnpm与其他工具集成

#### 与Turborepo集成

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"]
    }
  }
}
```

```bash
pnpm exec turbo run build
```

#### 与Nx集成

```bash
pnpm add -D nx
pnpm exec nx run-many --target=build
```

## 第五章：三大包管理器对比与选择

### 5.1 性能对比

#### 安装速度测试（React项目）

```
初次安装：
npm:    45s
yarn:   30s
pnpm:   18s

有缓存：
npm:    28s
yarn:   12s
pnpm:   8s

CI环境（冷缓存）：
npm:    52s
yarn:   35s
pnpm:   20s
```

#### 磁盘空间占用

```
5个React项目：
npm:    1.2GB
yarn:   1.0GB
pnpm:   120MB (节省90%)
```

### 5.2 功能对比

#### Monorepo支持

```
npm workspaces:   基础支持
yarn workspaces:  强大支持
pnpm workspaces:  最佳支持
```

#### 安全性

```
npm audit:        内置审计
yarn audit:       内置审计
pnpm audit:       内置审计

依赖隔离：
npm:              弱
yarn:             中
pnpm:             强（最严格）
```

### 5.3 选择建议

#### 个人项目

推荐：**pnpm**

理由：
- 安装速度最快
- 节省磁盘空间
- 依赖管理严格

#### 团队项目

推荐：**yarn 或 pnpm**

理由：
- yarn成熟稳定，生态完善
- pnpm性能优秀，适合大型项目

#### 开源项目

推荐：**npm**

理由：
- 用户最多，兼容性最好
- 无需额外安装
- 社区支持最好

#### Monorepo项目

推荐：**pnpm > yarn > npm**

理由：
- pnpm天然支持，性能最好
- yarn workspaces功能强大
- npm workspaces基础但够用

### 5.4 迁移指南

#### 从npm迁移到yarn

```bash
# 删除npm相关文件
rm -rf node_modules package-lock.json

# 使用yarn安装
yarn install

# 更新CI配置
# npm ci -> yarn install --frozen-lockfile
```

#### 从npm/yarn迁移到pnpm

```bash
# 删除旧文件
rm -rf node_modules package-lock.json yarn.lock

# 安装pnpm
npm install -g pnpm

# 使用pnpm安装
pnpm install

# 更新scripts（可选）
# npm run -> pnpm run
```

#### 迁移检查清单

1. 更新CI/CD配置
2. 更新团队文档
3. 修改.gitignore
4. 检查依赖兼容性
5. 测试构建流程

## 第六章：实战最佳实践

### 6.1 React项目配置

#### 使用npm

```bash
# 创建项目
npx create-react-app my-app
cd my-app

# 安装依赖
npm install

# 开发
npm start

# 构建
npm run build

# package.json配置
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

#### 使用yarn

```bash
# 创建项目
yarn create react-app my-app
cd my-app

# 安装依赖
yarn

# 开发
yarn start

# 构建
yarn build
```

#### 使用pnpm

```bash
# 创建项目
pnpm create react-app my-app
cd my-app

# 安装依赖
pnpm install

# 开发
pnpm start

# 构建
pnpm build
```

### 6.2 Vite + React项目

```bash
# npm
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev

# yarn
yarn create vite my-app --template react
cd my-app
yarn
yarn dev

# pnpm
pnpm create vite my-app --template react
cd my-app
pnpm install
pnpm dev
```

### 6.3 Next.js项目

```bash
# npm
npx create-next-app@latest
npm run dev

# yarn
yarn create next-app
yarn dev

# pnpm
pnpm create next-app
pnpm dev
```

### 6.4 Monorepo项目

#### 使用pnpm workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// 根package.json
{
  "name": "monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test"
  }
}
```

### 6.5 CI/CD配置

#### GitHub Actions - npm

```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

#### GitHub Actions - pnpm

```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test
```

### 6.6 常见问题解决

#### 依赖冲突

```bash
# npm
npm ls package-name
npm dedupe

# yarn
yarn why package-name

# pnpm
pnpm why package-name
```

#### 清理和重置

```bash
# npm
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# yarn
rm -rf node_modules yarn.lock
yarn cache clean
yarn install

# pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

#### 权限问题

```bash
# 修复npm全局权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 第七章：高级技巧

### 7.1 私有npm仓库

#### Verdaccio搭建

```bash
# 安装Verdaccio
npm install -g verdaccio

# 启动
verdaccio

# 配置.npmrc
registry=http://localhost:4873/
```

#### 使用私有仓库

```bash
# 发布到私有仓库
npm publish --registry http://localhost:4873/

# 从私有仓库安装
npm install package-name --registry http://localhost:4873/
```

### 7.2 性能优化技巧

#### npm优化

```bash
# 使用镜像
npm config set registry https://registry.npmmirror.com

# 禁用审计（加速安装）
npm install --no-audit

# 使用离线模式
npm install --prefer-offline
```

#### pnpm优化

```bash
# 并行安装
pnpm install --parallel

# 禁用进度条
pnpm install --reporter=silent

# 浅层安装
pnpm install --depth=0
```

### 7.3 安全最佳实践

```bash
# 定期审计
npm audit
npm audit fix

# 检查过期包
npm outdated

# 使用lock文件
# 在CI中使用：
npm ci          # npm
yarn install --frozen-lockfile  # yarn
pnpm install --frozen-lockfile  # pnpm

# 验证包完整性
npm install --integrity
```

## 总结

本章详细介绍了npm、yarn和pnpm三大包管理器的使用方法和最佳实践：

1. **npm**：最成熟的包管理器，Node.js官方工具
2. **yarn**：改进的包管理器，提供更好的性能和用户体验
3. **pnpm**：现代化的包管理器，性能最优，磁盘占用最小

选择建议：
- 个人项目：pnpm
- 团队项目：yarn或pnpm
- 开源项目：npm
- Monorepo：pnpm

掌握包管理器是React开发的基础，下一章我们将学习Node.js环境配置。




