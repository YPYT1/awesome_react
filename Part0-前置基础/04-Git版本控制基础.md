# Git版本控制基础完全指南

## 第一章：Git基础概念

### 1.1 什么是版本控制

版本控制（Version Control System，VCS）是一种记录文件内容变化，以便将来查阅特定版本修订情况的系统。它对于软件开发至关重要。

#### 版本控制的作用

1. **历史记录**：记录每次修改的详细信息
2. **协作开发**：多人同时在同一项目上工作
3. **版本回退**：可以恢复到任何历史版本
4. **分支管理**：并行开发多个功能
5. **代码备份**：防止代码丢失
6. **责任追踪**：明确每行代码的作者

#### 版本控制系统的演进

```
第一代（本地版本控制）：
RCS, SCCS
- 只能在本地使用
- 无法协作

第二代（集中式版本控制）：
CVS, SVN, Perforce
- 中央服务器存储
- 需要网络连接
- 单点故障风险

第三代（分布式版本控制）：
Git, Mercurial, Bazaar
- 每个人都有完整仓库
- 可离线工作
- 无单点故障
```

### 1.2 为什么选择Git

Git是目前最流行的分布式版本控制系统，由Linux之父Linus Torvalds于2005年创建。

#### Git的优势

1. **分布式架构**
   - 每个开发者都有完整的代码库副本
   - 可以离线工作
   - 本地操作速度快

2. **强大的分支管理**
   - 创建和切换分支非常快速
   - 分支合并智能化
   - 支持复杂的工作流

3. **数据完整性**
   - 使用SHA-1哈希保证数据完整性
   - 几乎不可能丢失数据
   - 自动检测损坏

4. **开源免费**
   - 完全开源
   - 社区活跃
   - 生态系统丰富

5. **广泛支持**
   - GitHub、GitLab、Bitbucket等平台
   - 各种IDE和编辑器集成
   - 大量第三方工具

#### Git在React开发中的应用

```
React项目中Git的典型用途：

1. 代码管理
   - 追踪组件变更
   - 管理样式文件
   - 记录配置修改

2. 团队协作
   - 多人共同开发功能
   - Code Review流程
   - 冲突解决

3. 发布管理
   - 版本标签
   - 发布分支
   - 回滚部署

4. CI/CD集成
   - 自动化测试
   - 自动部署
   - 代码质量检查
```

### 1.3 Git工作原理

#### Git的三个工作区域

```
工作目录 (Working Directory)
  │
  │  git add
  ↓
暂存区 (Staging Area/Index)
  │
  │  git commit
  ↓
本地仓库 (Local Repository)
  │
  │  git push
  ↓
远程仓库 (Remote Repository)
```

#### 文件的四种状态

1. **未跟踪（Untracked）**：新创建的文件
2. **已暂存（Staged）**：已添加到暂存区
3. **已提交（Committed）**：已保存到本地仓库
4. **已修改（Modified）**：文件被修改但未暂存

#### Git对象模型

```
Blob对象：
- 存储文件内容
- 由文件内容的SHA-1哈希标识

Tree对象：
- 存储目录结构
- 包含blob和子tree的引用

Commit对象：
- 指向tree对象
- 包含作者、时间、提交信息
- 指向父commit

Tag对象：
- 标记特定commit
- 通常用于版本发布
```

## 第二章：Git安装与配置

### 2.1 Git安装

#### Windows系统

```bash
# 方法1：官方安装包
# 访问 https://git-scm.com/download/win
# 下载并安装Git for Windows

# 方法2：使用Chocolatey
choco install git -y

# 方法3：使用Scoop
scoop install git

# 验证安装
git --version
```

#### macOS系统

```bash
# 方法1：使用Homebrew（推荐）
brew install git

# 方法2：Xcode Command Line Tools
xcode-select --install

# 方法3：官方安装包
# 访问 https://git-scm.com/download/mac

# 验证安装
git --version
```

#### Linux系统

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL
sudo yum install git

# Fedora
sudo dnf install git

# Arch Linux
sudo pacman -S git

# 验证安装
git --version
```

### 2.2 Git基础配置

#### 用户信息配置

```bash
# 配置用户名（必需）
git config --global user.name "Your Name"

# 配置邮箱（必需）
git config --global user.email "your.email@example.com"

# 查看配置
git config --global user.name
git config --global user.email
```

#### 编辑器配置

```bash
# 使用VSCode
git config --global core.editor "code --wait"

# 使用Vim
git config --global core.editor "vim"

# 使用Nano
git config --global core.editor "nano"

# 使用Notepad++（Windows）
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"
```

#### 差异工具配置

```bash
# 配置diff工具
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'

# 配置merge工具
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# 使用工具
git difftool
git mergetool
```

#### 别名配置

```bash
# 常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 使用别名
git st      # 等同于 git status
git co main # 等同于 git checkout main
git lg      # 美化的日志显示
```

#### 颜色配置

```bash
# 启用颜色输出
git config --global color.ui auto

# 自定义颜色
git config --global color.branch.current "yellow reverse"
git config --global color.branch.local yellow
git config --global color.branch.remote green
git config --global color.diff.meta "yellow bold"
git config --global color.diff.frag "magenta bold"
git config --global color.diff.old "red bold"
git config --global color.diff.new "green bold"
git config --global color.status.added "yellow"
git config --global color.status.changed "green"
git config --global color.status.untracked "cyan"
```

#### 行结束符配置

```bash
# Windows系统
git config --global core.autocrlf true

# macOS/Linux系统
git config --global core.autocrlf input

# 禁用自动转换
git config --global core.autocrlf false
```

### 2.3 配置级别

Git有三个配置级别：

```bash
# 系统级（所有用户）
git config --system user.name "System Name"
# 配置文件位置：/etc/gitconfig

# 全局级（当前用户）
git config --global user.name "Global Name"
# 配置文件位置：~/.gitconfig 或 ~/.config/git/config

# 仓库级（当前项目）
git config --local user.name "Local Name"
# 配置文件位置：.git/config

# 优先级：仓库级 > 全局级 > 系统级

# 查看所有配置
git config --list

# 查看特定级别的配置
git config --global --list
git config --local --list

# 查看配置来源
git config --list --show-origin
```

## 第三章：Git基本操作

### 3.1 创建仓库

#### 初始化新仓库

```bash
# 创建项目目录
mkdir my-react-app
cd my-react-app

# 初始化Git仓库
git init

# 查看仓库状态
git status

# 仓库结构
.git/
  ├── HEAD              # 指向当前分支
  ├── config            # 仓库配置
  ├── description       # 仓库描述
  ├── hooks/            # Git钩子脚本
  ├── info/             # 排除文件
  ├── objects/          # Git对象数据库
  └── refs/             # 引用（分支、标签）
```

#### 克隆现有仓库

```bash
# 克隆HTTPS仓库
git clone https://github.com/username/repository.git

# 克隆SSH仓库
git clone git@github.com:username/repository.git

# 克隆到指定目录
git clone https://github.com/username/repository.git my-project

# 克隆特定分支
git clone -b develop https://github.com/username/repository.git

# 浅克隆（只获取最近的历史）
git clone --depth 1 https://github.com/username/repository.git

# 克隆包含子模块
git clone --recurse-submodules https://github.com/username/repository.git
```

### 3.2 基本文件操作

#### 查看状态

```bash
# 查看详细状态
git status

# 查看简短状态
git status -s
# 输出示例：
#  M README.md      # 已修改，未暂存
# M  lib/test.js    # 已修改，已暂存
# A  new-file.js    # 新文件，已暂存
# ?? untracked.js   # 未跟踪
```

#### 添加文件到暂存区

```bash
# 添加单个文件
git add filename.js

# 添加多个文件
git add file1.js file2.js file3.js

# 添加所有修改的文件
git add .

# 添加所有修改和删除的文件（不包括新文件）
git add -u

# 添加所有文件（包括新文件）
git add -A

# 交互式添加
git add -i

# 添加部分文件内容
git add -p filename.js
```

#### 提交更改

```bash
# 基本提交
git commit -m "Add new feature"

# 详细提交信息
git commit -m "Add user authentication" -m "- Implement login form\n- Add JWT token validation\n- Create protected routes"

# 修改和提交一步完成（跳过暂存区）
git commit -am "Update styles"

# 修改最后一次提交
git commit --amend

# 修改最后一次提交的信息
git commit --amend -m "New commit message"

# 提交时显示diff
git commit -v
```

#### 提交信息最佳实践

```bash
# 好的提交信息格式
<type>(<scope>): <subject>

<body>

<footer>

# 类型（type）：
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式（不影响代码运行）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建过程或辅助工具的变动

# 示例：
git commit -m "feat(auth): add login functionality

- Create login form component
- Implement JWT authentication
- Add protected route HOC

Closes #123"
```

### 3.3 查看历史

#### 查看提交日志

```bash
# 查看完整日志
git log

# 简洁日志（一行显示）
git log --oneline

# 查看最近n条记录
git log -n 5

# 查看图形化分支
git log --graph --oneline --all

# 查看详细修改
git log -p

# 查看统计信息
git log --stat

# 格式化输出
git log --pretty=format:"%h - %an, %ar : %s"

# 按日期过滤
git log --since="2024-01-01"
git log --until="2024-12-31"
git log --since="2 weeks ago"

# 按作者过滤
git log --author="John"

# 按提交信息过滤
git log --grep="fix"

# 查看文件历史
git log -- path/to/file.js

# 查看某个人的提交
git log --author="Alice" --oneline

# 美化输出
git log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

#### 查看文件差异

```bash
# 查看工作目录 vs 暂存区
git diff

# 查看暂存区 vs 最后一次提交
git diff --staged
# 或
git diff --cached

# 查看工作目录 vs 最后一次提交
git diff HEAD

# 比较两个提交
git diff commit1 commit2

# 比较两个分支
git diff main develop

# 查看某个文件的差异
git diff -- path/to/file.js

# 查看统计信息
git diff --stat

# 查看简短统计
git diff --shortstat

# 忽略空白变化
git diff -w
```

### 3.4 撤销操作

#### 撤销工作目录的修改

```bash
# 撤销单个文件的修改
git checkout -- filename.js

# Git 2.23+版本推荐使用
git restore filename.js

# 撤销所有修改
git checkout .
# 或
git restore .
```

#### 撤销暂存区的文件

```bash
# 取消暂存单个文件
git reset HEAD filename.js

# Git 2.23+版本推荐使用
git restore --staged filename.js

# 取消所有暂存
git reset HEAD
# 或
git restore --staged .
```

#### 撤销提交

```bash
# 撤销最后一次提交，保留更改
git reset --soft HEAD~1

# 撤销最后一次提交，保留工作目录更改
git reset --mixed HEAD~1
# 或
git reset HEAD~1

# 撤销最后一次提交，丢弃所有更改
git reset --hard HEAD~1

# 撤销多个提交
git reset --soft HEAD~3

# 撤销到特定提交
git reset --hard commit-hash

# 创建一个新提交来撤销之前的提交
git revert HEAD
git revert commit-hash
```

#### 找回丢失的提交

```bash
# 查看所有引用日志
git reflog

# 恢复到特定引用
git reset --hard HEAD@{2}

# 查看丢失的提交
git fsck --lost-found
```

## 第四章：分支管理

### 4.1 分支基础

#### 创建和切换分支

```bash
# 查看所有分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支（包括远程）
git branch -a

# 创建新分支
git branch feature-login

# 切换分支
git checkout feature-login

# 创建并切换分支
git checkout -b feature-signup

# Git 2.23+版本推荐使用
git switch feature-login      # 切换分支
git switch -c feature-signup  # 创建并切换

# 基于特定提交创建分支
git branch feature-x commit-hash
git checkout -b feature-y commit-hash

# 查看分支详细信息
git branch -v

# 查看已合并的分支
git branch --merged

# 查看未合并的分支
git branch --no-merged
```

#### 删除分支

```bash
# 删除已合并的分支
git branch -d feature-login

# 强制删除分支
git branch -D feature-login

# 删除远程分支
git push origin --delete feature-login
# 或
git push origin :feature-login
```

### 4.2 分支合并

#### 快进合并（Fast-Forward）

```bash
# 当前在main分支
git checkout main

# 合并feature分支（快进）
git merge feature

# 禁用快进合并
git merge --no-ff feature
```

#### 三方合并（3-way Merge）

```bash
# 合并develop到main
git checkout main
git merge develop

# 合并时添加提交信息
git merge develop -m "Merge develop into main"
```

#### 解决合并冲突

```bash
# 查看冲突文件
git status

# 冲突标记示例
<<<<<<< HEAD
const name = "main branch";
=======
const name = "feature branch";
>>>>>>> feature

# 手动解决后
git add conflicted-file.js
git commit -m "Resolve merge conflict"

# 中止合并
git merge --abort

# 使用工具解决冲突
git mergetool
```

### 4.3 变基（Rebase）

#### 基本变基

```bash
# 将feature分支变基到main
git checkout feature
git rebase main

# 交互式变基
git rebase -i HEAD~3

# 变基选项：
# pick   - 使用提交
# reword - 使用提交，但修改提交信息
# edit   - 使用提交，但停下来修改
# squash - 使用提交，但合并到前一个提交
# fixup  - 类似squash，但丢弃提交信息
# drop   - 移除提交

# 继续变基
git rebase --continue

# 跳过当前提交
git rebase --skip

# 中止变基
git rebase --abort
```

#### Merge vs Rebase

```bash
# Merge的优点：
- 保留完整的历史记录
- 安全，不会改变历史
- 适合公共分支

# Rebase的优点：
- 线性的提交历史
- 更清晰的项目历史
- 适合私有分支

# 黄金法则：
# 永远不要对公共分支进行rebase
```

## 第五章：远程仓库

### 5.1 远程仓库基础

#### 添加远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/username/repository.git

# 添加多个远程仓库
git remote add upstream https://github.com/original/repository.git

# 查看远程仓库
git remote
git remote -v

# 查看远程仓库详细信息
git remote show origin

# 重命名远程仓库
git remote rename origin github

# 删除远程仓库
git remote remove origin
```

#### 获取和拉取

```bash
# 获取远程更新（不合并）
git fetch origin

# 获取所有远程分支
git fetch --all

# 拉取并合并
git pull origin main

# 拉取并变基
git pull --rebase origin main

# 设置默认上游分支
git branch --set-upstream-to=origin/main main

# 之后可以直接使用
git pull
git push
```

#### 推送更改

```bash
# 推送到远程仓库
git push origin main

# 推送所有分支
git push --all origin

# 推送标签
git push --tags

# 强制推送（危险操作）
git push -f origin main
# 或
git push --force origin main

# 更安全的强制推送
git push --force-with-lease origin main

# 设置上游分支并推送
git push -u origin feature-login

# 删除远程分支
git push origin --delete feature-login
```

### 5.2 SSH密钥配置

#### 生成SSH密钥

```bash
# 生成新的SSH密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 如果系统不支持ed25519
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 启动ssh-agent
eval "$(ssh-agent -s)"

# 添加SSH私钥
ssh-add ~/.ssh/id_ed25519
```

#### 配置GitHub/GitLab

```bash
# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 复制公钥并添加到GitHub/GitLab
# GitHub: Settings -> SSH and GPG keys -> New SSH key
# GitLab: Preferences -> SSH Keys

# 测试连接
ssh -T git@github.com
# 或
ssh -T git@gitlab.com
```

#### SSH配置文件

创建 `~/.ssh/config`:

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519

Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_rsa

Host company
  HostName git.company.com
  User git
  Port 2222
  IdentityFile ~/.ssh/id_company
```

## 第六章：React项目Git最佳实践

### 6.1 gitignore配置

创建 `.gitignore`:

```gitignore
# 依赖
node_modules/
/.pnp
.pnp.js

# 测试
/coverage

# 生产构建
/build
/dist
/.next
/out

# 调试
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 编辑器
.vscode/
.idea/
*.swp
*.swo
*~

# 操作系统
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo

# 可选的npm缓存
.npm

# 可选的eslint缓存
.eslintcache

# Vercel
.vercel

# Storybook
storybook-static/
```

### 6.2 提交规范

#### Conventional Commits

```bash
# 安装commitizen
npm install -D commitizen cz-conventional-changelog

# 配置package.json
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}

# 使用
git cz
# 或
npm run commit
```

#### Commitlint

```bash
# 安装
npm install -D @commitlint/cli @commitlint/config-conventional

# 创建配置文件 commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'revert'
    ]],
    'subject-case': [0]
  }
};

# 配合Husky使用
npm install -D husky
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

### 6.3 分支策略

#### Git Flow

```bash
# 主要分支
main      # 生产分支
develop   # 开发分支

# 辅助分支
feature/* # 功能分支
release/* # 发布分支
hotfix/*  # 热修复分支

# 工作流程
1. 从develop创建feature分支
git checkout -b feature/user-auth develop

2. 完成功能后合并到develop
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth

3. 准备发布
git checkout -b release/1.0.0 develop

4. 发布
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0
```

#### GitHub Flow

```bash
# 更简单的流程
main      # 主分支（始终可部署）
feature/* # 功能分支

# 工作流程
1. 从main创建分支
git checkout -b feature/new-component main

2. 提交更改
git commit -m "Add new component"

3. 推送并创建Pull Request
git push origin feature/new-component

4. Code Review后合并到main
git checkout main
git merge feature/new-component
git push origin main

5. 部署到生产环境
```

### 6.4 团队协作

#### Pull Request流程

```bash
# 1. Fork项目（在GitHub上点击Fork按钮）

# 2. 克隆Fork的仓库
git clone git@github.com:your-username/project.git

# 3. 添加上游仓库
git remote add upstream git@github.com:original-owner/project.git

# 4. 创建功能分支
git checkout -b feature/awesome-feature

# 5. 开发并提交
git add .
git commit -m "feat: add awesome feature"

# 6. 推送到自己的Fork
git push origin feature/awesome-feature

# 7. 在GitHub上创建Pull Request

# 8. 同步上游更新
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

#### Code Review清单

```
代码审查要点：

1. 代码质量
   - 是否遵循项目编码规范
   - 是否有适当的注释
   - 命名是否清晰

2. 功能实现
   - 是否解决了issue中的问题
   - 是否有遗漏的边界情况
   - 是否有潜在的bug

3. 测试
   - 是否包含测试用例
   - 测试覆盖率是否足够
   - 是否通过CI

4. 性能
   - 是否有性能问题
   - 是否有不必要的重渲染
   - 是否有内存泄漏

5. 安全
   - 是否有安全隐患
   - 是否正确处理用户输入
   - 是否有XSS/CSRF风险
```

## 第七章：Git高级技巧

### 7.1 Stash（储藏）

```bash
# 储藏当前工作
git stash

# 储藏包括未跟踪的文件
git stash -u

# 储藏并添加说明
git stash save "Work in progress on feature X"

# 查看储藏列表
git stash list

# 应用最新的储藏
git stash apply

# 应用特定储藏
git stash apply stash@{2}

# 应用并删除储藏
git stash pop

# 删除储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear

# 从储藏创建分支
git stash branch feature-x stash@{0}
```

### 7.2 Cherry-pick

```bash
# 拣选单个提交
git cherry-pick commit-hash

# 拣选多个提交
git cherry-pick commit1 commit2 commit3

# 拣选提交范围
git cherry-pick commit1..commit3

# 拣选但不提交
git cherry-pick -n commit-hash

# 解决冲突后继续
git cherry-pick --continue

# 中止cherry-pick
git cherry-pick --abort
```

### 7.3 子模块（Submodules）

```bash
# 添加子模块
git submodule add https://github.com/user/repo.git path/to/submodule

# 克隆包含子模块的项目
git clone --recurse-submodules https://github.com/user/repo.git

# 或者克隆后初始化子模块
git clone https://github.com/user/repo.git
git submodule init
git submodule update

# 更新子模块
git submodule update --remote

# 在子模块中工作
cd path/to/submodule
git checkout main
# 进行修改...
git commit -am "Update submodule"
cd ../..
git add path/to/submodule
git commit -m "Update submodule reference"

# 删除子模块
git submodule deinit path/to/submodule
git rm path/to/submodule
rm -rf .git/modules/path/to/submodule
```

### 7.4 工作树（Worktree）

```bash
# 创建新的工作树
git worktree add ../project-feature1 feature1

# 列出所有工作树
git worktree list

# 删除工作树
git worktree remove ../project-feature1

# 清理工作树
git worktree prune
```

## 第八章：Git钩子（Hooks）

### 8.1 客户端钩子

#### pre-commit

```bash
# .git/hooks/pre-commit
#!/bin/sh

# 运行linter
npm run lint || exit 1

# 运行测试
npm test || exit 1

echo "Pre-commit checks passed!"
```

#### commit-msg

```bash
# .git/hooks/commit-msg
#!/bin/sh

commit_msg=$(cat "$1")

# 检查提交信息格式
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)"; then
  echo "Error: Commit message must start with a type (feat, fix, docs, etc.)"
  exit 1
fi
```

### 8.2 使用Husky管理钩子

```bash
# 安装Husky
npm install -D husky

# 初始化Husky
npx husky install

# 添加pre-commit钩子
npx husky add .husky/pre-commit "npm run lint"

# 添加commit-msg钩子
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'

# package.json配置
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### 8.3 lint-staged

```bash
# 安装lint-staged
npm install -D lint-staged

# package.json配置
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}

# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

## 第九章：故障排除

### 9.1 常见问题

#### 撤销推送

```bash
# 撤销最近的推送
git reset --hard HEAD~1
git push -f origin main
```

#### 修复错误的提交

```bash
# 修改最后一次提交
git commit --amend

# 修改更早的提交
git rebase -i HEAD~3
# 将要修改的提交标记为 'edit'
# 进行修改
git commit --amend
git rebase --continue
```

#### 找回删除的分支

```bash
# 查看reflog
git reflog

# 恢复分支
git branch recovered-branch commit-hash
```

### 9.2 性能优化

```bash
# 清理不需要的文件并优化本地仓库
git gc

# 深度清理
git gc --aggressive --prune=now

# 清理reflog
git reflog expire --expire=now --all

# 检查仓库大小
git count-objects -vH

# 查找大文件
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k 3 -n -r | head -20
```

## 总结

本章全面介绍了Git版本控制系统：

1. **Git基础**：版本控制概念、Git优势
2. **安装配置**：多平台安装、全面配置
3. **基本操作**：创建仓库、文件操作、提交历史
4. **分支管理**：创建分支、合并、变基
5. **远程仓库**：远程操作、SSH配置
6. **React实践**：gitignore、提交规范、分支策略
7. **高级技巧**：stash、cherry-pick、子模块
8. **Git钩子**：Husky、lint-staged
9. **故障排除**：常见问题解决

掌握Git是React开发的必备技能，它将帮助你更好地管理代码、协作开发。现在你已经完成了Part 0的所有内容，可以开始正式学习React了！




