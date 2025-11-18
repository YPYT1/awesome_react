# CSS Modules最佳实践

## 概述

CSS Modules作为一种成熟的CSS模块化方案，在实际项目中需要遵循一系列最佳实践来确保代码质量、可维护性和性能。本文总结了CSS Modules在真实项目中的最佳实践，包括项目结构、命名规范、性能优化、团队协作等方面的经验。

## 项目结构最佳实践

### 标准目录结构

```bash
src/
├── styles/
│   ├── global/
│   │   ├── reset.css              # CSS重置
│   │   ├── variables.module.css   # 全局变量
│   │   └── utilities.module.css   # 工具类
│   ├── themes/
│   │   ├── light.module.css       # 亮色主题
│   │   ├── dark.module.css        # 暗色主题
│   │   └── index.js               # 主题导出
│   └── mixins/
│       ├── buttons.module.css     # 按钮混合
│       ├── cards.module.css       # 卡片混合
│       └── forms.module.css       # 表单混合
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   ├── Button.test.jsx
│   │   └── index.js
│   ├── Card/
│   │   ├── Card.jsx
│   │   ├── Card.module.css
│   │   └── index.js
│   └── Form/
│       ├── Form.jsx
│       ├── Form.module.css
│       ├── FormInput.jsx
│       ├── FormInput.module.css
│       └── index.js
├── features/
│   ├── auth/
│   │   ├── Login/
│   │   │   ├── Login.jsx
│   │   │   └── Login.module.css
│   │   └── Register/
│   │       ├── Register.jsx
│   │       └── Register.module.css
│   └── dashboard/
│       ├── Dashboard.jsx
│       └── Dashboard.module.css
└── layouts/
    ├── MainLayout/
    │   ├── MainLayout.jsx
    │   └── MainLayout.module.css
    └── AuthLayout/
        ├── AuthLayout.jsx
        └── AuthLayout.module.css
```

### 组件级样式组织

```jsx
// 推荐：将样式文件与组件放在同一目录
components/
├── ProductCard/
│   ├── index.js                    // 导出入口
│   ├── ProductCard.jsx             // 组件逻辑
│   ├── ProductCard.module.scss     // 组件样式
│   ├── ProductCard.test.jsx        // 组件测试
│   ├── ProductCardSkeleton.jsx     // 骨架屏
│   └── ProductCardSkeleton.module.scss

// index.js
export { ProductCard } from './ProductCard';
export { ProductCardSkeleton } from './ProductCardSkeleton';

// ProductCard.jsx
import React from 'react';
import styles from './ProductCard.module.scss';
import skeletonStyles from './ProductCardSkeleton.module.scss';

export function ProductCard({ loading, data }) {
  if (loading) {
    return <ProductCardSkeleton />;
  }
  
  return (
    <div className={styles.card}>
      {/* 组件内容 */}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className={skeletonStyles.skeleton}>
      {/* 骨架屏内容 */}
    </div>
  );
}
```

## 命名规范最佳实践

### 类名命名约定

```css
/* ✅ 推荐：使用BEM风格的语义化命名 */
.productCard { }
.productCard__image { }
.productCard__title { }
.productCard__price { }
.productCard--featured { }
.productCard--discount { }

/* ✅ 推荐：状态类使用is/has前缀 */
.isActive { }
.isDisabled { }
.isLoading { }
.hasError { }
.hasSuccess { }

/* ✅ 推荐：尺寸变体使用统一后缀 */
.buttonSmall { }
.buttonMedium { }
.buttonLarge { }

/* ✅ 推荐：颜色变体使用颜色名称 */
.buttonPrimary { }
.buttonSecondary { }
.buttonDanger { }
.buttonSuccess { }

/* ❌ 避免：过于简短或通用的名称 */
.btn { }
.item { }
.box { }
.text { }

/* ❌ 避免：使用样式属性作为类名 */
.red { }
.bold { }
.flex { }
.mt10 { }

/* ✅ 推荐：使用语义化名称 */
.errorText { }
.heading { }
.flexContainer { }
.spacingMedium { }
```

### 文件命名约定

```bash
# ✅ 推荐：组件名.module.css
Button.module.css
ProductCard.module.scss
UserProfile.module.less

# ✅ 推荐：共享样式使用描述性名称
variables.module.css
mixins.module.scss
utilities.module.css
theme-light.module.css

# ❌ 避免：非描述性名称
styles.module.css
index.module.css
main.module.css
```

## 样式复用策略

### 使用Composes进行组合

```css
/* base.module.css - 基础样式库 */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.flexCenter {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flexBetween {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Button.module.css - 具体组件样式 */
.primaryButton {
  composes: button from './base.module.css';
  background-color: #007bff;
  color: white;
}

.secondaryButton {
  composes: button from './base.module.css';
  background-color: #6c757d;
  color: white;
}

.outlineButton {
  composes: button from './base.module.css';
  background-color: transparent;
  border: 2px solid #007bff;
  color: #007bff;
}

/* ProductCard.module.css */
.productCard {
  composes: card from './base.module.css';
  max-width: 320px;
}

.cardHeader {
  composes: flexBetween from './base.module.css';
  margin-bottom: 1rem;
}

.cardFooter {
  composes: flexBetween from './base.module.css';
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}
```

### 创建可复用的混合模块

```scss
// mixins.module.scss
@mixin truncate($lines: 1) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

@mixin respond-to($breakpoint) {
  @if $breakpoint == 'mobile' {
    @media (max-width: 767px) { @content; }
  } @else if $breakpoint == 'tablet' {
    @media (min-width: 768px) and (max-width: 1023px) { @content; }
  } @else if $breakpoint == 'desktop' {
    @media (min-width: 1024px) { @content; }
  }
}

@mixin button-variant($bg-color, $text-color: white) {
  background-color: $bg-color;
  color: $text-color;
  
  &:hover {
    background-color: darken($bg-color, 10%);
  }
  
  &:active {
    background-color: darken($bg-color, 15%);
  }
}

// Component.module.scss
@import './mixins.module.scss';

.title {
  @include truncate(2);
  font-size: 1.25rem;
}

.description {
  @include truncate(3);
  color: #6c757d;
}

.primaryButton {
  @include button-variant(#007bff);
}

.container {
  padding: 1rem;
  
  @include respond-to('mobile') {
    padding: 0.5rem;
  }
  
  @include respond-to('desktop') {
    padding: 2rem;
  }
}
```

### 变量系统设计

```css
/* variables.module.css */
:export {
  /* 颜色系统 */
  colorPrimary: #007bff;
  colorSecondary: #6c757d;
  colorSuccess: #28a745;
  colorDanger: #dc3545;
  colorWarning: #ffc107;
  colorInfo: #17a2b8;
  
  /* 中性色 */
  colorWhite: #ffffff;
  colorBlack: #000000;
  colorGray100: #f8f9fa;
  colorGray200: #e9ecef;
  colorGray300: #dee2e6;
  colorGray400: #ced4da;
  colorGray500: #adb5bd;
  colorGray600: #6c757d;
  colorGray700: #495057;
  colorGray800: #343a40;
  colorGray900: #212529;
  
  /* 间距系统 */
  spacing1: 0.25rem;
  spacing2: 0.5rem;
  spacing3: 1rem;
  spacing4: 1.5rem;
  spacing5: 3rem;
  
  /* 字体系统 */
  fontSizeXs: 0.75rem;
  fontSizeSm: 0.875rem;
  fontSizeBase: 1rem;
  fontSizeLg: 1.125rem;
  fontSizeXl: 1.25rem;
  fontSize2xl: 1.5rem;
  fontSize3xl: 1.875rem;
  fontSize4xl: 2.25rem;
  
  /* 圆角 */
  radiusSm: 0.25rem;
  radiusMd: 0.5rem;
  radiusLg: 1rem;
  radiusFull: 9999px;
  
  /* 阴影 */
  shadowSm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  shadowMd: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  shadowLg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  shadowXl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* 过渡 */
  transitionFast: 150ms ease;
  transitionBase: 250ms ease;
  transitionSlow: 350ms ease;
  
  /* 断点 */
  breakpointSm: 640px;
  breakpointMd: 768px;
  breakpointLg: 1024px;
  breakpointXl: 1280px;
  breakpoint2xl: 1536px;
}

/* 在组件中使用 */
.component {
  color: var(--colorPrimary);
  padding: var(--spacing3);
  border-radius: var(--radiusMd);
  box-shadow: var(--shadowMd);
  transition: all var(--transitionBase);
}

// 在JavaScript中使用
import variables from './variables.module.css';

function Component() {
  const styles = {
    color: variables.colorPrimary,
    padding: variables.spacing3
  };
  
  return <div style={styles}>Content</div>;
}
```

## TypeScript集成

### 类型定义生成

```typescript
// 使用typed-css-modules自动生成
// npm install -D typed-css-modules

// package.json
{
  "scripts": {
    "css-types": "tcm src/**/*.module.css",
    "css-types:watch": "tcm src/**/*.module.css --watch"
  }
}

// Button.module.css.d.ts (自动生成)
declare const styles: {
  readonly button: string;
  readonly primary: string;
  readonly secondary: string;
  readonly large: string;
  readonly small: string;
  readonly disabled: string;
};

export default styles;

// Button.tsx
import React from 'react';
import styles from './Button.module.css';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  disabled,
  children,
  onClick 
}: ButtonProps) {
  // TypeScript会提供类型检查和自动完成
  const className = [
    styles.button,
    styles[variant],
    size !== 'medium' && styles[size],
    disabled && styles.disabled
  ].filter(Boolean).join(' ');
  
  return (
    <button className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
```

### 类型安全的样式工具

```typescript
// styleUtils.ts
type StyleModule = Record<string, string>;

export function combineStyles<T extends StyleModule>(
  styles: T,
  ...classNames: (keyof T | false | undefined | null)[]
): string {
  return classNames
    .filter((name): name is keyof T => Boolean(name))
    .map(name => styles[name])
    .join(' ');
}

export function conditionalStyles<T extends StyleModule>(
  styles: T,
  conditions: Partial<Record<keyof T, boolean>>
): string {
  return Object.entries(conditions)
    .filter(([_, condition]) => condition)
    .map(([className]) => styles[className as keyof T])
    .join(' ');
}

// 使用示例
import styles from './Component.module.css';
import { combineStyles, conditionalStyles } from './styleUtils';

function Component({ active, disabled, size }: Props) {
  // 类型安全的样式组合
  const className = combineStyles(
    styles,
    'base',
    active && 'active',
    disabled && 'disabled',
    size
  );
  
  // 条件样式
  const className2 = conditionalStyles(styles, {
    base: true,
    active: active,
    disabled: disabled,
    [size]: true
  });
  
  return <div className={className}>Content</div>;
}
```

## 性能优化实践

### 代码分割策略

```jsx
// 路由级代码分割
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 懒加载组件（包括CSS）
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 条件加载重型样式
function HeavyComponent() {
  const [stylesLoaded, setStylesLoaded] = React.useState(false);
  
  React.useEffect(() => {
    import('./HeavyComponent.module.css').then(() => {
      setStylesLoaded(true);
    });
  }, []);
  
  if (!stylesLoaded) {
    return <Skeleton />;
  }
  
  return <div>Heavy Component</div>;
}
```

### 样式优化配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: (name, filename, css) => {
        if (process.env.NODE_ENV === 'production') {
          // 生产环境：短哈希名称
          const hash = Buffer.from(css).toString('base64').slice(0, 5);
          return `${name}_${hash}`;
        }
        // 开发环境：可读名称
        const componentName = filename.split('/').slice(-2)[0];
        return `${componentName}_${name}`;
      }
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "./src/styles/variables.scss";
          @import "./src/styles/mixins.scss";
        `
      }
    }
  },
  build: {
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 为CSS文件设置特定的命名模式
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
});

// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: 
                  process.env.NODE_ENV === 'production'
                    ? '[hash:base64:8]'
                    : '[path][name]__[local]',
                exportLocalsConvention: 'camelCase'
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    })
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeUnicode: false
            }
          ]
        }
      })
    ]
  }
};
```

### 关键CSS提取

```jsx
// 提取首屏关键CSS
import React from 'react';
import { renderToString } from 'react-dom/server';

// 关键CSS内联
function Document({ children, criticalCss }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}

// 使用critical库提取关键CSS
// npm install -D critical

const critical = require('critical');

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  target: 'index.html',
  width: 1300,
  height: 900,
  css: ['dist/assets/main.css']
});
```

## 主题系统实现

### 完整的主题方案

```css
/* themes/base.module.css */
.theme {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.light {
  composes: theme;
  --color-primary: #007bff;
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
}

.dark {
  composes: theme;
  --color-primary: #4dabf7;
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --border-color: #404040;
}

.auto {
  composes: light;
}

@media (prefers-color-scheme: dark) {
  .auto {
    --color-primary: #4dabf7;
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #f8f9fa;
    --text-secondary: #adb5bd;
    --border-color: #404040;
  }
}

// ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import themeStyles from './themes/base.module.css';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'auto';
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <div className={themeStyles[theme]}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Component.module.css
.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.button {
  background-color: var(--color-primary);
  color: white;
}
```

### 多主题支持

```tsx
// themes.ts
export const themes = {
  light: {
    primary: '#007bff',
    background: '#ffffff',
    text: '#212529'
  },
  dark: {
    primary: '#4dabf7',
    background: '#1a1a1a',
    text: '#f8f9fa'
  },
  blue: {
    primary: '#0066cc',
    background: '#f0f8ff',
    text: '#003366'
  },
  green: {
    primary: '#28a745',
    background: '#f0fff4',
    text: '#1a5a32'
  }
} as const;

export type ThemeName = keyof typeof themes;

// ThemeManager.tsx
import React from 'react';
import { themes, ThemeName } from './themes';

export function ThemeManager({ theme }: { theme: ThemeName }) {
  React.useEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[theme];
    
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme]);
  
  return null;
}
```

## 响应式设计实践

### 移动优先策略

```scss
// responsive.module.scss
.container {
  // 移动端基础样式
  padding: 1rem;
  
  // 平板及以上
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  // 桌面及以上
  @media (min-width: 1024px) {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.navigation {
  // 移动端：汉堡菜单
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100vh;
  background: white;
  transition: left 0.3s ease;
  
  &.open {
    left: 0;
  }
  
  // 桌面端：水平导航
  @media (min-width: 768px) {
    position: static;
    width: auto;
    height: auto;
    background: transparent;
  }
}
```

### 断点管理

```scss
// breakpoints.module.scss
$breakpoints: (
  xs: 0,
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  xxl: 1536px
);

@mixin respond-above($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    $value: map-get($breakpoints, $breakpoint);
    @media (min-width: $value) {
      @content;
    }
  }
}

@mixin respond-below($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    $value: map-get($breakpoints, $breakpoint);
    @media (max-width: $value - 1) {
      @content;
    }
  }
}

@mixin respond-between($lower, $upper) {
  $lower-value: map-get($breakpoints, $lower);
  $upper-value: map-get($breakpoints, $upper);
  
  @media (min-width: $lower-value) and (max-width: $upper-value - 1) {
    @content;
  }
}

// 使用示例
.component {
  font-size: 1rem;
  
  @include respond-above(md) {
    font-size: 1.125rem;
  }
  
  @include respond-above(lg) {
    font-size: 1.25rem;
  }
  
  @include respond-between(sm, md) {
    padding: 1.5rem;
  }
}
```

## 团队协作规范

### 样式审查清单

```markdown
## CSS Modules代码审查清单

### 命名规范
- [ ] 类名使用camelCase或BEM命名
- [ ] 避免使用通用或模糊的类名
- [ ] 状态类使用is/has前缀
- [ ] 文件名与组件名匹配

### 代码组织
- [ ] 样式文件与组件文件在同一目录
- [ ] 共享样式放在合适的位置
- [ ] 使用composes进行样式复用
- [ ] 变量定义集中管理

### 性能优化
- [ ] 避免深层嵌套选择器
- [ ] 使用CSS变量替代硬编码值
- [ ] 合理使用代码分割
- [ ] 移除未使用的样式

### 响应式设计
- [ ] 采用移动优先策略
- [ ] 断点定义统一
- [ ] 媒体查询使用mixins
- [ ] 考虑容器查询

### 可访问性
- [ ] 颜色对比度符合WCAG标准
- [ ] 焦点状态明显
- [ ] 支持键盘导航
- [ ] 文字大小可调整

### TypeScript
- [ ] 生成类型定义文件
- [ ] 类型安全的样式工具
- [ ] 导出的类名有类型提示
```

### 文档规范

```tsx
/**
 * Button组件
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="large">
 *   Click me
 * </Button>
 * ```
 * 
 * @styles
 * - `button`: 基础按钮样式
 * - `primary`: 主要按钮变体
 * - `secondary`: 次要按钮变体
 * - `large`: 大尺寸变体
 * - `small`: 小尺寸变体
 * - `disabled`: 禁用状态
 */
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary';
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 点击事件处理 */
  onClick?: () => void;
  /** 子元素 */
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary',
  size = 'medium',
  disabled,
  onClick,
  children 
}: ButtonProps) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${size !== 'medium' ? styles[size] : ''}
        ${disabled ? styles.disabled : ''}
      `.trim()}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

## 调试和工具

### 开发者工具

```tsx
// StyleDebugger.tsx - 样式调试组件
import React, { useState } from 'react';
import styles from './StyleDebugger.module.css';

interface StyleDebuggerProps {
  styleModules: Record<string, any>;
}

export function StyleDebugger({ styleModules }: StyleDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        🎨
      </button>
      
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <h3>CSS Modules Inspector</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className={styles.content}>
            {Object.entries(styleModules).map(([name, module]) => (
              <details key={name} className={styles.section}>
                <summary>{name}</summary>
                <ul>
                  {Object.entries(module).map(([className, value]) => (
                    <li key={className}>
                      <code className={styles.className}>{className}</code>
                      <code className={styles.compiledName}>{value as string}</code>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// 使用示例
import buttonStyles from './Button.module.css';
import cardStyles from './Card.module.css';

function App() {
  return (
    <>
      <YourApp />
      <StyleDebugger styleModules={{ buttonStyles, cardStyles }} />
    </>
  );
}
```

### Storybook集成

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import styles from './Button.module.css';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    cssModules: styles // 在Storybook中显示CSS类名
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary']
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  )
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  )
};
```

## 测试策略

### 样式测试

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import styles from './Button.module.css';

describe('Button', () => {
  it('应用正确的基础类名', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain(styles.button);
  });
  
  it('应用正确的变体类名', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain(styles.primary);
  });
  
  it('应用正确的尺寸类名', () => {
    render(<Button size="large">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain(styles.large);
  });
  
  it('禁用状态应用正确的类名', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain(styles.disabled);
    expect(button).toBeDisabled();
  });
});

// 视觉回归测试
import { test, expect } from '@playwright/test';

test('Button视觉回归', async ({ page }) => {
  await page.goto('/button');
  
  // 截图对比
  await expect(page.locator('.primary-button')).toHaveScreenshot('primary-button.png');
  
  // 悬停状态
  await page.locator('.primary-button').hover();
  await expect(page.locator('.primary-button')).toHaveScreenshot('primary-button-hover.png');
});
```

## 迁移指南

### 从传统CSS迁移

```bash
# 步骤1：重命名CSS文件
# 旧: Button.css
# 新: Button.module.css

# 步骤2：更新导入语句
# 旧: import './Button.css';
# 新: import styles from './Button.module.css';

# 步骤3：更新类名使用
# 旧: <div className="button primary">
# 新: <div className={`${styles.button} ${styles.primary}`}>
```

```tsx
// 迁移工具脚本
import fs from 'fs';
import path from 'path';

function migrateToCSSModules(componentPath: string) {
  const cssPath = componentPath.replace('.jsx', '.css');
  const modulePath = componentPath.replace('.jsx', '.module.css');
  
  // 重命名CSS文件
  if (fs.existsSync(cssPath)) {
    fs.renameSync(cssPath, modulePath);
  }
  
  // 读取组件文件
  let content = fs.readFileSync(componentPath, 'utf-8');
  
  // 更新导入语句
  content = content.replace(
    /import ['"]\.\/(.+?)\.css['"]/g,
    "import styles from './$1.module.css'"
  );
  
  // 更新className使用（简单替换）
  content = content.replace(
    /className=["']([^"']+)["']/g,
    (match, classes) => {
      const classList = classes.split(' ');
      const styleRefs = classList.map(cls => `styles.${cls}`).join(', ');
      return `className={\`\${${styleRefs}}\`}`;
    }
  );
  
  fs.writeFileSync(componentPath, content);
}
```

## 总结

CSS Modules最佳实践要点：

1. **项目结构**：清晰的目录组织和文件命名
2. **命名规范**：语义化、统一的类名约定
3. **样式复用**：composes、mixins、变量系统
4. **TypeScript**：类型安全的样式管理
5. **性能优化**：代码分割、压缩、关键CSS
6. **主题系统**：灵活的多主题支持
7. **响应式**：移动优先、断点管理
8. **团队协作**：规范文档、代码审查
9. **工具支持**：调试工具、Storybook集成
10. **测试策略**：单元测试、视觉回归测试

遵循这些最佳实践，可以构建出高质量、可维护的CSS Modules应用。
