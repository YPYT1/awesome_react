# Node.js环境配置完全指南

## 第一章：Node.js基础概念

### 1.1 什么是Node.js

Node.js是一个基于Chrome V8引擎的JavaScript运行时环境，允许JavaScript代码在服务器端运行。它由Ryan Dahl于2009年创建，彻底改变了JavaScript的应用范围。

#### Node.js的核心特性

1. **事件驱动**：基于事件循环机制处理异步操作
2. **非阻塞I/O**：高效处理并发请求
3. **单线程**：主线程单线程，但通过事件循环实现并发
4. **跨平台**：支持Windows、macOS、Linux等操作系统
5. **模块化**：内置模块系统（CommonJS和ES Modules）

#### Node.js架构

```
应用层
  │
  ├─ JavaScript代码
  │
Node.js核心
  │
  ├─ Node.js API (fs, http, path等)
  ├─ JavaScript引擎 (V8)
  ├─ libuv (事件循环、异步I/O)
  ├─ c-ares (DNS解析)
  └─ http-parser, OpenSSL, zlib等
  │
操作系统
```

### 1.2 为什么React开发需要Node.js

虽然React是前端框架，但React开发离不开Node.js环境：

#### 必需Node.js的原因

1. **包管理工具**
   - npm、yarn、pnpm都基于Node.js
   - 管理React及其依赖包

2. **构建工具**
   - Webpack、Vite、Rollup等需要Node.js
   - 编译JSX、TypeScript
   - 打包优化代码

3. **开发服务器**
   - webpack-dev-server提供热更新
   - Vite提供快速的开发体验

4. **脚本工具**
   - 运行测试（Jest、Vitest）
   - 代码检查（ESLint、Prettier）
   - 自动化任务

5. **服务端渲染（SSR）**
   - Next.js、Remix等框架
   - 提升首屏加载速度和SEO

### 1.3 Node.js版本说明

#### 版本类型

Node.js有两种发布线：

1. **LTS（Long Term Support）**
   - 长期支持版本
   - 稳定可靠，推荐生产环境使用
   - 支持周期：30个月
   - 偶数版本号（如18.x、20.x）

2. **Current（当前版本）**
   - 包含最新特性
   - 适合尝鲜和测试
   - 支持周期：6个月
   - 奇数版本号（如19.x、21.x）

#### 版本发布时间线

```
2024年版本：
- Node.js 18.x LTS (维护至2025年4月)
- Node.js 20.x LTS (维护至2026年4月) ← 推荐
- Node.js 21.x Current
- Node.js 22.x (预计2024年10月发布)

React 19推荐版本：
- 最低要求：Node.js 16.x
- 推荐使用：Node.js 18.x 或 20.x LTS
```

#### 如何选择版本

```
个人开发：
  → 使用最新LTS版本

团队协作：
  → 统一使用指定LTS版本
  → 在.nvmrc或package.json中声明

生产环境：
  → 使用稳定的LTS版本
  → Node.js 18.x 或 20.x

CI/CD环境：
  → 与生产环境保持一致
  → 使用Docker固定版本
```

## 第二章：Node.js安装

### 2.1 Windows系统安装

#### 方法1：官方安装包（推荐新手）

1. **下载安装包**
```
访问：https://nodejs.org/
下载：Windows Installer (.msi)
- 64位系统：node-v20.x.x-x64.msi
- 32位系统：node-v20.x.x-x86.msi
```

2. **安装步骤**
```
1. 双击安装包
2. 接受许可协议
3. 选择安装路径（默认：C:\Program Files\nodejs）
4. 选择组件：
   ☑ Node.js runtime
   ☑ npm package manager
   ☑ Online documentation shortcuts
   ☑ Add to PATH
5. 点击Install开始安装
6. 安装完成后重启命令行
```

3. **验证安装**
```bash
# 打开PowerShell或CMD
node --version
# v20.10.0

npm --version
# 10.2.3

# 测试Node.js
node -e "console.log('Hello Node.js')"
# Hello Node.js
```

#### 方法2：使用Chocolatey

```powershell
# 以管理员身份运行PowerShell

# 安装Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装Node.js LTS
choco install nodejs-lts -y

# 或安装指定版本
choco install nodejs --version=20.10.0 -y

# 验证
node --version
```

#### 方法3：使用nvm-windows

nvm（Node Version Manager）可以管理多个Node.js版本。

```powershell
# 下载nvm-windows
# https://github.com/coreybutler/nvm-windows/releases
# 下载 nvm-setup.exe

# 安装后使用：

# 列出可用版本
nvm list available

# 安装指定版本
nvm install 20.10.0
nvm install 18.19.0

# 查看已安装版本
nvm list

# 切换版本
nvm use 20.10.0

# 设置默认版本
nvm alias default 20.10.0
```

### 2.2 macOS系统安装

#### 方法1：官方安装包

```bash
# 访问 https://nodejs.org/
# 下载 macOS Installer (.pkg)
# 双击安装

# 验证
node --version
npm --version
```

#### 方法2：使用Homebrew（推荐）

```bash
# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js LTS
brew install node@20

# 或安装最新版本
brew install node

# 链接版本
brew link node@20

# 验证
node --version
npm --version

# 更新Node.js
brew upgrade node
```

#### 方法3：使用nvm（推荐多版本管理）

```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 或使用wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重启终端或执行
source ~/.bashrc  # 或 ~/.zshrc

# 验证nvm安装
nvm --version

# 安装Node.js
nvm install 20
nvm install 18
nvm install --lts

# 查看已安装版本
nvm ls

# 使用指定版本
nvm use 20

# 设置默认版本
nvm alias default 20

# 查看当前版本
nvm current
```

### 2.3 Linux系统安装

#### Ubuntu/Debian

```bash
# 方法1：使用NodeSource仓库（推荐）

# 安装Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node --version
npm --version

# 方法2：使用apt（版本可能较旧）
sudo apt update
sudo apt install nodejs npm

# 方法3：使用nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
```

#### CentOS/RHEL/Fedora

```bash
# 使用NodeSource仓库

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Fedora
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# 验证
node --version
npm --version
```

#### Arch Linux

```bash
# 使用pacman
sudo pacman -S nodejs npm

# 验证
node --version
npm --version
```

### 2.4 Docker环境

```dockerfile
# Dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

使用Docker Compose：

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm run dev"
```

## 第三章：Node.js版本管理

### 3.1 nvm使用详解

#### 基础命令

```bash
# 查看帮助
nvm --help

# 列出所有可用版本
nvm ls-remote        # Linux/macOS
nvm list available   # Windows

# 安装最新LTS版本
nvm install --lts

# 安装指定版本
nvm install 20.10.0
nvm install 18.19.0

# 安装最新版本
nvm install node

# 卸载版本
nvm uninstall 18.19.0

# 列出已安装版本
nvm ls

# 使用指定版本
nvm use 20.10.0
nvm use default
nvm use --lts

# 查看当前版本
nvm current

# 运行指定版本的Node
nvm run 20.10.0 app.js

# 在指定版本下执行命令
nvm exec 20.10.0 npm install
```

#### 别名管理

```bash
# 设置默认版本
nvm alias default 20.10.0

# 创建自定义别名
nvm alias my-project 18.19.0

# 使用别名
nvm use my-project

# 删除别名
nvm unalias my-project

# 列出所有别名
nvm alias
```

#### 项目级版本控制

```bash
# 在项目根目录创建.nvmrc文件
echo "20.10.0" > .nvmrc

# 或指定LTS
echo "lts/*" > .nvmrc

# 使用.nvmrc指定的版本
nvm use

# 自动切换版本（需配置）
# 在 ~/.bashrc 或 ~/.zshrc 中添加：
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
```

### 3.2 fnm - 更快的版本管理器

fnm（Fast Node Manager）是用Rust编写的Node版本管理器，速度比nvm快10-20倍。

#### 安装fnm

```bash
# macOS/Linux
curl -fsSL https://fnm.vercel.app/install | bash

# Windows (使用Scoop)
scoop install fnm

# 或使用Chocolatey
choco install fnm
```

#### 使用fnm

```bash
# 列出远程版本
fnm ls-remote

# 安装版本
fnm install 20.10.0
fnm install --lts

# 使用版本
fnm use 20.10.0

# 设置默认版本
fnm default 20.10.0

# 列出已安装版本
fnm ls

# 自动切换（.node-version 或 .nvmrc）
fnm use --install-if-missing
```

### 3.3 Volta - 无忧的版本管理

Volta是一个现代化的JavaScript工具管理器，自动处理版本切换。

#### 安装Volta

```bash
# macOS/Linux
curl https://get.volta.sh | bash

# Windows
# 下载安装器：https://docs.volta.sh/guide/getting-started
```

#### 使用Volta

```bash
# 安装Node.js
volta install node@20
volta install node@18

# 安装npm/yarn
volta install npm@10
volta install yarn@1

# 固定项目版本（自动写入package.json）
volta pin node@20
volta pin npm@10

# package.json中会添加：
{
  "volta": {
    "node": "20.10.0",
    "npm": "10.2.3"
  }
}

# 查看当前版本
volta list

# 进入项目目录会自动切换到固定版本
cd my-project  # 自动使用项目指定的版本
```

## 第四章：Node.js环境配置

### 4.1 环境变量配置

#### Windows环境变量

```powershell
# 查看Node.js路径
where node
# C:\Program Files\nodejs\node.exe

# 查看PATH
echo $env:PATH

# 临时添加到PATH
$env:PATH += ";C:\my-node-path"

# 永久添加（以管理员运行）
[Environment]::SetEnvironmentVariable(
  "PATH",
  $env:PATH + ";C:\my-node-path",
  [EnvironmentVariableTarget]::Machine
)

# 设置NODE_ENV
$env:NODE_ENV = "development"

# 永久设置
[Environment]::SetEnvironmentVariable(
  "NODE_ENV",
  "development",
  [EnvironmentVariableTarget]::User
)
```

#### macOS/Linux环境变量

```bash
# 编辑配置文件
nano ~/.bashrc      # Bash
nano ~/.zshrc       # Zsh

# 添加环境变量
export NODE_ENV=development
export PATH=$PATH:/usr/local/node/bin

# 应用配置
source ~/.bashrc
# 或
source ~/.zshrc

# 临时设置
export NODE_ENV=production

# 在命令前设置
NODE_ENV=production node app.js
```

### 4.2 npm全局配置

```bash
# 查看全局安装路径
npm config get prefix

# 修改全局安装路径（Windows）
npm config set prefix "C:\npm-global"

# 修改全局安装路径（macOS/Linux）
npm config set prefix ~/.npm-global

# 添加到PATH（macOS/Linux）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 修改缓存路径
npm config set cache ~/.npm-cache

# 查看所有配置
npm config list
npm config list -l
```

### 4.3 镜像源配置

#### 配置淘宝镜像

```bash
# npm
npm config set registry https://registry.npmmirror.com

# 验证
npm config get registry

# 临时使用
npm install --registry=https://registry.npmmirror.com

# 还原官方源
npm config set registry https://registry.npmjs.org
```

#### 使用nrm管理镜像源

```bash
# 安装nrm
npm install -g nrm

# 列出可用镜像源
nrm ls

# 输出：
# * npm ---------- https://registry.npmjs.org/
#   yarn --------- https://registry.yarnpkg.com/
#   tencent ------ https://mirrors.cloud.tencent.com/npm/
#   cnpm --------- https://r.cnpmjs.org/
#   taobao ------- https://registry.npmmirror.com/
#   npmMirror ---- https://skimdb.npmjs.com/registry/

# 切换镜像源
nrm use taobao

# 测试速度
nrm test

# 添加自定义源
nrm add company http://npm.company.com/

# 删除源
nrm del company
```

### 4.4 Node.js调试配置

#### VSCode调试配置

创建`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "调试当前文件",
      "skipFiles": ["<node_internals>/**"],
      "program": "${file}",
      "outFiles": ["${workspaceFolder}/**/*.js"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "调试React应用",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start"],
      "port": 3000,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "调试测试",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### Chrome DevTools调试

```bash
# 启动调试模式
node --inspect app.js

# 指定端口
node --inspect=9229 app.js

# 启动时暂停
node --inspect-brk app.js

# 在Chrome中打开
chrome://inspect
```

## 第五章：开发工具配置

### 5.1 VSCode配置

#### 安装必要扩展

```json
// extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens"
  ]
}
```

#### VSCode settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

### 5.2 终端配置

#### Windows Terminal配置

```json
{
  "defaultProfile": "{...}",
  "profiles": {
    "list": [
      {
        "name": "PowerShell",
        "source": "Windows.Terminal.PowerShell",
        "startingDirectory": "D:\\Projects"
      },
      {
        "name": "Node.js",
        "commandline": "powershell.exe -NoExit -Command \"nvm use 20\"",
        "startingDirectory": "D:\\Projects"
      }
    ]
  }
}
```

#### Oh My Zsh配置（macOS/Linux）

```bash
# 安装Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 编辑 ~/.zshrc
plugins=(
  git
  node
  npm
  nvm
  yarn
  vscode
  docker
)

# 主题
ZSH_THEME="robbyrussell"

# 应用配置
source ~/.zshrc
```

### 5.3 Git配置

```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置编辑器
git config --global core.editor "code --wait"

# 配置别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# 配置换行符
git config --global core.autocrlf input    # macOS/Linux
git config --global core.autocrlf true     # Windows

# 配置代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 查看配置
git config --list
```

## 第六章：项目环境配置

### 6.1 EditorConfig

创建`.editorconfig`：

```ini
# EditorConfig is awesome: https://EditorConfig.org

root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

### 6.2 ESLint配置

```bash
# 安装ESLint
npm install -D eslint

# 初始化配置
npx eslint --init
```

`.eslintrc.json`：

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### 6.3 Prettier配置

```bash
# 安装Prettier
npm install -D prettier
```

`.prettierrc`：

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

`.prettierignore`：

```
node_modules
dist
build
.next
coverage
*.min.js
```

### 6.4 TypeScript配置

```bash
# 安装TypeScript
npm install -D typescript @types/react @types/react-dom
```

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

## 第七章：性能优化配置

### 7.1 Node.js性能配置

```bash
# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# Windows
set NODE_OPTIONS=--max-old-space-size=4096

# 启用实验性功能
node --experimental-modules app.js

# 调整垃圾回收
node --expose-gc --optimize-for-size app.js
```

### 7.2 npm/yarn/pnpm优化

```bash
# npm优化
npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# 使用离线模式
npm install --prefer-offline

# 禁用审计加速安装
npm install --no-audit

# yarn优化
yarn config set network-timeout 600000

# pnpm优化
pnpm config set store-dir ~/.pnpm-store
pnpm config set verify-store-integrity false
```

### 7.3 构建优化

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});
```

## 第八章：常见问题与解决方案

### 8.1 权限问题

#### Windows权限问题

```powershell
# 以管理员运行PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 修复npm权限
npm config set prefix "%APPDATA%\npm"
```

#### macOS/Linux权限问题

```bash
# 方法1：修改npm全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 方法2：修复权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 方法3：使用nvm（推荐）
# nvm会自动处理权限问题
```

### 8.2 网络问题

```bash
# 使用代理
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890

# 取消代理
npm config delete proxy
npm config delete https-proxy

# 使用镜像源
npm config set registry https://registry.npmmirror.com

# 临时使用代理
npm install --proxy=http://127.0.0.1:7890
```

### 8.3 版本冲突

```bash
# 清理缓存
npm cache clean --force

# 删除node_modules和锁文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 使用特定版本
nvm use 20.10.0
npm install
```

### 8.4 模块找不到

```bash
# 检查NODE_PATH
echo $NODE_PATH

# 设置NODE_PATH
export NODE_PATH=$(npm root -g)

# 重新链接
npm link

# 检查模块安装
npm ls package-name
```

## 第九章：生产环境配置

### 9.1 Docker部署

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

### 9.2 PM2进程管理

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "my-app" -- start

# 配置文件
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};

# 使用配置启动
pm2 start ecosystem.config.js

# 管理命令
pm2 list
pm2 restart my-app
pm2 stop my-app
pm2 logs my-app
pm2 monit
```

### 9.3 环境变量管理

```bash
# 使用dotenv
npm install dotenv

# .env
NODE_ENV=production
API_URL=https://api.example.com
API_KEY=your-api-key

# .env.local（不提交到Git）
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# 在应用中使用
require('dotenv').config();
console.log(process.env.API_URL);
```

## 总结

本章详细介绍了Node.js环境配置的各个方面：

1. **Node.js基础**：了解Node.js的核心特性和架构
2. **安装方法**：多种平台的安装方式
3. **版本管理**：使用nvm、fnm、Volta管理版本
4. **环境配置**：环境变量、npm配置、镜像源
5. **开发工具**：VSCode、终端、Git配置
6. **项目配置**：ESLint、Prettier、TypeScript
7. **性能优化**：Node.js性能调优
8. **问题解决**：常见问题的解决方案
9. **生产部署**：Docker、PM2部署配置

掌握Node.js环境配置是React开发的基础，下一章我们将学习Git版本控制。




