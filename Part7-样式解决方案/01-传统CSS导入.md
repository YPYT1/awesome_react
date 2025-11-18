# 传统CSS导入

## 概述

传统CSS导入是React应用中最基础的样式管理方式。虽然现代框架提供了众多样式解决方案，但理解传统CSS的工作原理和最佳实践仍然至关重要。本文详细探讨在React中使用传统CSS的各种方法、优化技巧和常见问题解决方案。

## CSS导入方式

### 全局CSS导入

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // 全局样式
import './normalize.css'; // CSS重置
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/index.css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--font-family);
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.2;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
  font-family: inherit;
}

input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}
```

### 组件级CSS导入

```jsx
// src/components/Button/Button.js
import React from 'react';
import './Button.css';

export function Button({ children, variant = 'primary', size = 'medium', onClick }) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// src/components/Button/Button.css
.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}

/* 按钮变体 */
.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-outline {
  background-color: transparent;
  border-color: #007bff;
  color: #007bff;
}

.btn-outline:hover {
  background-color: #007bff;
  color: white;
}

/* 按钮尺寸 */
.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.btn-large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.btn-full-width {
  width: 100%;
}

/* 禁用状态 */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
```

### 动态CSS导入

```jsx
// 根据条件动态导入样式
import React, { useEffect } from 'react';

function ThemeProvider({ theme, children }) {
  useEffect(() => {
    // 动态导入主题样式
    if (theme === 'dark') {
      import('./themes/dark.css');
    } else if (theme === 'light') {
      import('./themes/light.css');
    }
  }, [theme]);

  return <div className={`theme-${theme}`}>{children}</div>;
}

// 懒加载组件样式
function LazyStyledComponent() {
  useEffect(() => {
    import('./LazyStyledComponent.css');
  }, []);

  return <div className="lazy-component">Lazy Loaded Component</div>;
}

// 按需加载样式
function ConditionalStyles({ showAdvanced }) {
  useEffect(() => {
    if (showAdvanced) {
      import('./advanced-styles.css');
    }
  }, [showAdvanced]);

  return (
    <div className="component">
      <div className="basic-content">Basic Content</div>
      {showAdvanced && (
        <div className="advanced-content">Advanced Content</div>
      )}
    </div>
  );
}
```

## CSS组织结构

### BEM命名规范

```css
/* Block Element Modifier (BEM) 命名规范 */

/* Block - 独立的组件 */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

/* Element - Block的组成部分 */
.card__header {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.card__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.card__subtitle {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.card__body {
  line-height: 1.6;
}

.card__footer {
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card__action {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

/* Modifier - Block或Element的不同状态或变体 */
.card--featured {
  border: 2px solid #007bff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card--compact {
  padding: 0.5rem;
}

.card__action--disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.card__title--large {
  font-size: 2rem;
}
```

### 样式文件组织

```bash
src/
├── styles/
│   ├── base/
│   │   ├── reset.css          # CSS重置
│   │   ├── typography.css     # 排版样式
│   │   ├── colors.css         # 颜色变量
│   │   └── utilities.css      # 工具类
│   ├── components/
│   │   ├── button.css
│   │   ├── card.css
│   │   ├── form.css
│   │   └── modal.css
│   ├── layouts/
│   │   ├── header.css
│   │   ├── footer.css
│   │   ├── sidebar.css
│   │   └── grid.css
│   ├── pages/
│   │   ├── home.css
│   │   ├── about.css
│   │   └── contact.css
│   ├── themes/
│   │   ├── light.css
│   │   └── dark.css
│   └── main.css              # 主样式入口
```

```css
/* src/styles/main.css - 主样式入口 */
@import './base/reset.css';
@import './base/colors.css';
@import './base/typography.css';
@import './base/utilities.css';

@import './components/button.css';
@import './components/card.css';
@import './components/form.css';

@import './layouts/header.css';
@import './layouts/footer.css';
@import './layouts/grid.css';

/* src/styles/base/colors.css */
:root {
  /* 主色调 */
  --color-primary: #007bff;
  --color-primary-light: #4dabf7;
  --color-primary-dark: #0056b3;
  
  /* 辅助色 */
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* 中性色 */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-gray-100: #f8f9fa;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-400: #ced4da;
  --color-gray-500: #adb5bd;
  --color-gray-600: #6c757d;
  --color-gray-700: #495057;
  --color-gray-800: #343a40;
  --color-gray-900: #212529;
  
  /* 文本颜色 */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-muted: #adb5bd;
  
  /* 背景颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-dark: #343a40;
  
  /* 边框颜色 */
  --border-color: #dee2e6;
  
  /* 阴影 */
  --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
}

/* src/styles/base/utilities.css */
/* 间距工具类 */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }
.m-2 { margin: 0.5rem; }
.m-3 { margin: 1rem; }
.m-4 { margin: 1.5rem; }
.m-5 { margin: 3rem; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 1rem; }
.p-4 { padding: 1.5rem; }
.p-5 { padding: 3rem; }

/* 文本工具类 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--text-secondary); }
.text-muted { color: var(--text-muted); }

.font-bold { font-weight: bold; }
.font-normal { font-weight: normal; }

/* 显示工具类 */
.d-none { display: none; }
.d-block { display: block; }
.d-inline { display: inline; }
.d-inline-block { display: inline-block; }
.d-flex { display: flex; }

/* Flex工具类 */
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
```

## CSS变量和主题

### CSS自定义属性

```css
/* 定义CSS变量 */
:root {
  /* 颜色系统 */
  --primary-hue: 210;
  --primary-saturation: 100%;
  --primary-lightness: 50%;
  --primary: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
  
  /* 间距系统 */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5);
  --spacing-sm: var(--spacing-unit);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  --spacing-xl: calc(var(--spacing-unit) * 4);
  
  /* 字体系统 */
  --font-size-base: 16px;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;
  
  /* 过渡 */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  
  /* Z-index层级 */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* 使用CSS变量 */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.card {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### 主题切换

```jsx
// ThemeProvider组件
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 从localStorage读取主题设置
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// 主题样式定义
/* themes.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border-color: #404040;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.text-secondary {
  color: var(--text-secondary);
}

// 主题切换按钮组件
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## 响应式设计

### 媒体查询

```css
/* 断点定义 */
:root {
  --breakpoint-xs: 0;
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1400px;
}

/* 移动优先的响应式设计 */
.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

/* 小屏幕（手机） */
@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

/* 中等屏幕（平板） */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* 大屏幕（笔记本） */
@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
  
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .sidebar {
    display: block;
  }
}

/* 超大屏幕（桌面） */
@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
  
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 超超大屏幕 */
@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}

/* 响应式工具类 */
@media (max-width: 767px) {
  .d-md-none {
    display: none !important;
  }
}

@media (min-width: 768px) {
  .d-md-block {
    display: block !important;
  }
  
  .d-md-flex {
    display: flex !important;
  }
}

/* 响应式文字 */
.responsive-text {
  font-size: 1rem;
}

@media (min-width: 768px) {
  .responsive-text {
    font-size: 1.125rem;
  }
}

@media (min-width: 992px) {
  .responsive-text {
    font-size: 1.25rem;
  }
}
```

### CSS容器查询

```css
/* 现代CSS容器查询 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  padding: 1rem;
}

/* 当容器宽度大于400px时 */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1rem;
  }
  
  .card__image {
    grid-row: 1 / 3;
  }
}

/* 当容器宽度大于600px时 */
@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
    gap: 2rem;
  }
  
  .card__title {
    font-size: 1.5rem;
  }
}

/* 容器查询实战示例 */
.product-grid {
  container-type: inline-size;
  display: grid;
  gap: 1rem;
}

@container (min-width: 400px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 800px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container (min-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 性能优化

### CSS加载优化

```jsx
// 关键CSS内联
import React from 'react';

function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* 关键CSS - 首屏渲染必需 */
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto';
          }
          .app-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .header {
            height: 60px;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        `
      }} />
      
      <div className="app-container">
        <header className="header">Header</header>
        <main>{/* 内容 */}</main>
      </div>
    </>
  );
}

// CSS代码分割
function LazyComponent() {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    import('./LazyComponent.css').then(() => {
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return <div>Loading styles...</div>;
  }

  return <div className="lazy-component">Component with lazy-loaded styles</div>;
}

// 预加载CSS
function PrefetchStyles() {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/styles/future-page.css';
    document.head.appendChild(link);
  }, []);

  return null;
}
```

### CSS压缩和优化

```css
/* 开发环境 - 可读性好 */
.button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border-radius: 0.25rem;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}

/* 生产环境 - 压缩后 */
.button{display:inline-block;padding:.5rem 1rem;background-color:#007bff;color:#fff;border-radius:.25rem;transition:background-color .3s ease}.button:hover{background-color:#0056b3}

/* 使用CSS变量减少重复 */
:root {
  --btn-padding: 0.5rem 1rem;
  --btn-radius: 0.25rem;
  --btn-transition: 0.3s ease;
}

.button {
  padding: var(--btn-padding);
  border-radius: var(--btn-radius);
  transition: all var(--btn-transition);
}

/* 简写属性 */
/* 不好 */
.element {
  margin-top: 1rem;
  margin-right: 2rem;
  margin-bottom: 1rem;
  margin-left: 2rem;
}

/* 好 */
.element {
  margin: 1rem 2rem;
}
```

### 避免CSS性能陷阱

```css
/* 避免过度使用通配符选择器 */
/* 不好 - 性能差 */
* {
  margin: 0;
  padding: 0;
}

/* 好 - 针对性重置 */
h1, h2, h3, h4, h5, h6, p {
  margin: 0;
  padding: 0;
}

/* 避免深层嵌套 */
/* 不好 - 选择器过于具体 */
.header .nav .menu .item .link {
  color: blue;
}

/* 好 - 扁平化选择器 */
.nav-link {
  color: blue;
}

/* 避免使用!important */
/* 不好 */
.text {
  color: red !important;
}

/* 好 - 提高选择器优先级 */
.component .text {
  color: red;
}

/* 或者使用更具体的选择器 */
.component-text {
  color: red;
}

/* 优化动画性能 */
/* 不好 - 触发重排 */
.animate {
  animation: move 1s;
}

@keyframes move {
  from {
    left: 0;
  }
  to {
    left: 100px;
  }
}

/* 好 - 使用transform */
.animate {
  animation: move 1s;
}

@keyframes move {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100px);
  }
}

/* will-change优化 */
.will-animate {
  will-change: transform;
}

.will-animate:hover {
  transform: scale(1.1);
}
```

## 常见布局模式

### Flexbox布局

```css
/* 水平居中 */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐 */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 垂直堆叠 */
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 响应式Flex布局 */
.flex-responsive {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-responsive > * {
  flex: 1 1 300px;
}

/* Flex导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar__brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar__menu {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__item {
  cursor: pointer;
}

/* Flex卡片布局 */
.card-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-layout__header {
  flex-shrink: 0;
}

.card-layout__body {
  flex: 1;
  overflow-y: auto;
}

.card-layout__footer {
  flex-shrink: 0;
  margin-top: auto;
}
```

### Grid布局

```css
/* 基础Grid布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* 响应式Grid */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* 复杂Grid布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 50px;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  min-height: 100vh;
  gap: 0;
}

.dashboard-sidebar {
  grid-area: sidebar;
  background: #2c3e50;
  color: white;
}

.dashboard-header {
  grid-area: header;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-main {
  grid-area: main;
  padding: 2rem;
  background: #f5f5f5;
}

.dashboard-footer {
  grid-area: footer;
  background: white;
  border-top: 1px solid #eee;
}

/* 响应式Dashboard */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 60px auto 1fr 50px;
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "footer";
  }
  
  .dashboard-sidebar {
    position: static;
  }
}

/* Grid画廊布局 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 1rem;
}

.gallery-item:nth-child(3n) {
  grid-column: span 2;
  grid-row: span 2;
}
```

## 动画和过渡

### CSS过渡

```css
/* 基础过渡 */
.transition-element {
  transition: all 0.3s ease;
}

.transition-element:hover {
  transform: scale(1.05);
}

/* 多属性过渡 */
.button {
  background-color: #007bff;
  color: white;
  transform: scale(1);
  transition: background-color 0.3s ease,
              transform 0.2s ease;
}

.button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

/* 过渡时序函数 */
.ease-in {
  transition: transform 0.3s ease-in;
}

.ease-out {
  transition: transform 0.3s ease-out;
}

.ease-in-out {
  transition: transform 0.3s ease-in-out;
}

.cubic-bezier {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### CSS动画

```css
/* 关键帧动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* 加载动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.bounce {
  animation: bounce 1s;
}

/* 滑入动画 */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}
```

## 实战案例

### 完整的组件样式系统

```css
/* components/ProductCard.css */
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-card__badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  background: #dc3545;
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
}

.product-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-card__content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-card__category {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.product-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #212529;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-card__price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
}

.product-card__price--old {
  font-size: 1rem;
  color: #adb5bd;
  text-decoration: line-through;
  margin-left: 0.5rem;
}

.product-card__button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.product-card__button:hover {
  background: #0056b3;
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #ffc107;
}

.product-card__rating-count {
  color: #6c757d;
  margin-left: 0.25rem;
}

/* 骨架屏加载状态 */
.product-card--loading .product-card__image,
.product-card--loading .product-card__title,
.product-card--loading .product-card__description,
.product-card--loading .product-card__price {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 响应式导航栏

```css
/* components/Navbar.css */
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.navbar__brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
  text-decoration: none;
}

.navbar__menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.navbar__item {
  position: relative;
}

.navbar__link {
  color: #212529;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.navbar__link:hover {
  color: #007bff;
}

.navbar__link--active {
  color: #007bff;
}

.navbar__link--active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
}

.navbar__toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.navbar__toggle-icon {
  display: block;
  width: 24px;
  height: 2px;
  background: #212529;
  position: relative;
  transition: background 0.3s ease;
}

.navbar__toggle-icon::before,
.navbar__toggle-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: #212529;
  transition: transform 0.3s ease;
}

.navbar__toggle-icon::before {
  top: -8px;
}

.navbar__toggle-icon::after {
  bottom: -8px;
}

.navbar__toggle--active .navbar__toggle-icon {
  background: transparent;
}

.navbar__toggle--active .navbar__toggle-icon::before {
  transform: rotate(45deg) translate(5px, 5px);
}

.navbar__toggle--active .navbar__toggle-icon::after {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .navbar__toggle {
    display: block;
  }
  
  .navbar__menu {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
  }
  
  .navbar__menu--open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .navbar__item {
    width: 100%;
  }
  
  .navbar__link {
    display: block;
    padding: 0.5rem 0;
  }
}
```

## 最佳实践

### 1. CSS组织原则

```css
/* 按SMACSS方法组织CSS */

/* 1. Base - 基础样式 */
html {
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

/* 2. Layout - 布局 */
.l-container {
  max-width: 1200px;
  margin: 0 auto;
}

.l-grid {
  display: grid;
  gap: 1rem;
}

/* 3. Module - 模块/组件 */
.button { /* ... */ }
.card { /* ... */ }
.form { /* ... */ }

/* 4. State - 状态 */
.is-active { /* ... */ }
.is-hidden { /* ... */ }
.is-disabled { /* ... */ }

/* 5. Theme - 主题 */
.theme-dark { /* ... */ }
.theme-light { /* ... */ }
```

### 2. 命名约定

```css
/* 使用有意义的类名 */
/* 不好 */
.btn-1 { }
.box { }
.item { }

/* 好 */
.primary-button { }
.product-card { }
.nav-item { }

/* 使用连字符分隔单词 */
/* 不好 */
.userProfile { }
.UserProfile { }
.user_profile { }

/* 好 */
.user-profile { }

/* 避免过于抽象 */
/* 不好 */
.large { }
.small { }
.blue { }

/* 好 */
.heading-primary { }
.text-small { }
.button-primary { }
```

### 3. 性能优化清单

```css
/* 性能优化检查清单 */

/* ✅ 使用class而不是标签选择器 */
.nav-item { }  /* 好 */
nav li { }     /* 避免 */

/* ✅ 避免深层嵌套 */
.header-nav-item { }  /* 好 */
.header .nav .item { } /* 避免 */

/* ✅ 使用transform代替position */
.animated {
  transform: translateX(100px);  /* 好 */
  /* left: 100px; */              /* 避免 */
}

/* ✅ 合理使用will-change */
.will-animate {
  will-change: transform;
}

/* ✅ 使用CSS变量减少重复 */
:root {
  --spacing: 1rem;
}

.element {
  margin: var(--spacing);
  padding: var(--spacing);
}

/* ✅ 压缩和合并CSS文件 */
/* 生产环境使用压缩后的CSS */
```

## 总结

传统CSS在React中的应用仍然是基础且重要的：

1. **灵活的导入方式**：全局、组件级、动态导入
2. **组织良好的结构**：BEM、SMACSS等方法论
3. **强大的CSS特性**：变量、主题、容器查询
4. **响应式设计**：媒体查询、Flexbox、Grid
5. **性能优化**：关键CSS、代码分割、压缩
6. **最佳实践**：命名约定、组织原则、性能优化

掌握传统CSS的精髓，是使用其他现代样式方案的基础。
