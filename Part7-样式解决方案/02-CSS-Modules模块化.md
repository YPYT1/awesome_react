# CSS Modules模块化

## 概述

CSS Modules是一种CSS模块化解决方案,它通过构建工具自动生成唯一的类名,从而实现CSS的局部作用域。这种方式避免了全局命名冲突,使组件样式更加可维护和可复用。本文将深入探讨CSS Modules的原理、用法和最佳实践。

## CSS Modules基础

### 什么是CSS Modules

CSS Modules不是官方规范,而是一种构建步骤中的处理方式。它通过以下方式实现模块化:

1. 每个CSS文件都是一个独立的模块
2. 类名会被编译成唯一的哈希值
3. 通过import导入后作为对象使用
4. 完全避免全局作用域污染

### 基础使用

```jsx
// Button.module.css
.button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: #0056b3;
}

.primary {
  background-color: #007bff;
}

.secondary {
  background-color: #6c757d;
}

.large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

// Button.jsx
import React from 'react';
import styles from './Button.module.css';

export function Button({ children, variant = 'primary', size = 'medium', onClick }) {
  const buttonClass = `${styles.button} ${styles[variant]} ${styles[size]}`;
  
  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
}

// 编译后的类名示例
// .Button_button__2x3Kl
// .Button_primary__1a2b3
// .Button_large__4c5d6
```

### 配置CSS Modules

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // 自定义生成的类名格式
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      
      // 哈希前缀
      hashPrefix: 'prefix',
      
      // 局部化模式
      localsConvention: 'camelCase', // 支持驼峰命名
      
      // 导出全局类名
      exportGlobals: true
    }
  }
});

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                exportLocalsConvention: 'camelCaseOnly'
              }
            }
          }
        ]
      }
    ]
  }
};

// next.config.js
module.exports = {
  // Next.js 默认支持 CSS Modules
  // 无需额外配置
};
```

## 高级特性

### 组合（Composes）

```css
/* Button.module.css */
.base {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.primary {
  composes: base;
  background-color: #007bff;
  color: white;
}

.secondary {
  composes: base;
  background-color: #6c757d;
  color: white;
}

.outline {
  composes: base;
  background-color: transparent;
  border: 2px solid #007bff;
  color: #007bff;
}

/* 从其他文件组合 */
.iconButton {
  composes: base from './common.module.css';
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* 组合多个类 */
.primaryLarge {
  composes: primary;
  composes: large from './sizes.module.css';
}

// 使用组合后的类
import styles from './Button.module.css';

function Button({ variant = 'primary' }) {
  return (
    <button className={styles[variant]}>
      Click me
    </button>
  );
}
```

### 全局类名

```css
/* styles.module.css */
/* 局部类名（默认） */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 全局类名 */
:global(.global-class) {
  color: red;
}

/* 混合使用 */
.wrapper :global(.ant-btn) {
  margin-right: 8px;
}

/* 全局选择器块 */
:global {
  .global-header {
    position: fixed;
    top: 0;
    width: 100%;
  }
  
  .global-footer {
    margin-top: 2rem;
  }
}

/* 本地与全局切换 */
:local(.local-class) {
  /* 明确指定为局部类名 */
}

// 使用示例
import styles from './styles.module.css';

function Component() {
  return (
    <div className={styles.container}>
      <div className="global-class">全局样式</div>
      <div className={styles.wrapper}>
        <button className="ant-btn">Ant Design Button</button>
      </div>
    </div>
  );
}
```

### CSS变量集成

```css
/* theme.module.css */
.light {
  --primary-color: #007bff;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #dee2e6;
}

.dark {
  --primary-color: #4dabf7;
  --background-color: #1a1a1a;
  --text-color: #f5f5f5;
  --border-color: #404040;
}

.card {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 8px;
}

.button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}

// 使用主题
import React, { useState } from 'react';
import styles from './theme.module.css';

function ThemedComponent() {
  const [theme, setTheme] = useState('light');
  
  return (
    <div className={styles[theme]}>
      <div className={styles.card}>
        <h2>Themed Card</h2>
        <button 
          className={styles.button}
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Toggle Theme
        </button>
      </div>
    </div>
  );
}
```

### 动态类名处理

```jsx
// 使用模板字符串
import styles from './Component.module.css';

function Component({ active, disabled, size }) {
  const className = `
    ${styles.base}
    ${active ? styles.active : ''}
    ${disabled ? styles.disabled : ''}
    ${styles[size]}
  `.trim();
  
  return <div className={className}>Content</div>;
}

// 使用数组和filter
function Component({ active, disabled, size }) {
  const classes = [
    styles.base,
    active && styles.active,
    disabled && styles.disabled,
    styles[size]
  ].filter(Boolean).join(' ');
  
  return <div className={classes}>Content</div>;
}

// 使用对象方式
function Component({ active, disabled }) {
  const classMap = {
    [styles.base]: true,
    [styles.active]: active,
    [styles.disabled]: disabled
  };
  
  const className = Object.keys(classMap)
    .filter(key => classMap[key])
    .join(' ');
  
  return <div className={className}>Content</div>;
}

// 使用classnames库
import classNames from 'classnames';
import styles from './Component.module.css';

function Component({ active, disabled, size = 'medium' }) {
  return (
    <div className={classNames(
      styles.base,
      {
        [styles.active]: active,
        [styles.disabled]: disabled
      },
      styles[size]
    )}>
      Content
    </div>
  );
}

// 使用clsx库（更轻量）
import clsx from 'clsx';
import styles from './Component.module.css';

function Component({ active, disabled, size }) {
  return (
    <div className={clsx(
      styles.base,
      active && styles.active,
      disabled && styles.disabled,
      styles[size]
    )}>
      Content
    </div>
  );
}
```

## 工具函数封装

### 创建样式工具

```javascript
// utils/styles.js

// 1. 样式组合工具
export function combineStyles(...classes) {
  return classes.filter(Boolean).join(' ');
}

// 2. 条件样式工具
export function conditionalStyle(styles, conditions) {
  return Object.keys(conditions)
    .filter(key => conditions[key])
    .map(key => styles[key])
    .filter(Boolean)
    .join(' ');
}

// 3. 变体样式工具
export function variantStyle(styles, variant, defaultVariant = 'default') {
  return styles[variant] || styles[defaultVariant] || '';
}

// 4. 组合工具类
export function createStyleComposer(styles) {
  return {
    base: (...baseClasses) => {
      const base = baseClasses.map(c => styles[c]).filter(Boolean).join(' ');
      
      return {
        with: (...additionalClasses) => {
          const additional = additionalClasses.map(c => styles[c]).filter(Boolean).join(' ');
          return `${base} ${additional}`.trim();
        },
        when: (condition, className) => {
          const conditional = condition ? styles[className] : '';
          return `${base} ${conditional}`.trim();
        },
        variant: (variantName) => {
          const variant = styles[variantName] || '';
          return `${base} ${variant}`.trim();
        }
      };
    }
  };
}

// 使用示例
import styles from './Button.module.css';
import { combineStyles, conditionalStyle, createStyleComposer } from './utils/styles';

function Button({ variant, size, active, disabled, children }) {
  // 方式1：基础组合
  const className1 = combineStyles(
    styles.button,
    styles[variant],
    styles[size],
    active && styles.active,
    disabled && styles.disabled
  );
  
  // 方式2：条件组合
  const className2 = conditionalStyle(styles, {
    button: true,
    [variant]: true,
    [size]: true,
    active: active,
    disabled: disabled
  });
  
  // 方式3：链式调用
  const composer = createStyleComposer(styles);
  const className3 = composer
    .base('button')
    .variant(variant)
    .with(size)
    .when(active, 'active')
    .when(disabled, 'disabled');
  
  return <button className={className3}>{children}</button>;
}
```

### 类型安全的样式

```typescript
// Button.module.css.d.ts (自动生成或手动创建)
declare const styles: {
  readonly button: string;
  readonly primary: string;
  readonly secondary: string;
  readonly large: string;
  readonly small: string;
  readonly active: string;
  readonly disabled: string;
};

export default styles;

// Button.tsx
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  variant?: keyof Pick<typeof styles, 'primary' | 'secondary'>;
  size?: keyof Pick<typeof styles, 'large' | 'small'>;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  active, 
  disabled, 
  children 
}: ButtonProps) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${size !== 'medium' ? styles[size] : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// 使用typed-css-modules自动生成类型
// npm install -D typed-css-modules
// package.json
{
  "scripts": {
    "generate-css-types": "tcm src/**/*.module.css"
  }
}
```

## 样式复用策略

### 共享样式文件

```css
/* common.module.css */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
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

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* ProductCard.module.css */
.productCard {
  composes: card from './common.module.css';
  max-width: 300px;
}

.header {
  composes: flexBetween from './common.module.css';
  margin-bottom: 1rem;
}

.addButton {
  composes: button from './common.module.css';
  background: #007bff;
  color: white;
}

/* UserProfile.module.css */
.profileCard {
  composes: card from './common.module.css';
  max-width: 400px;
}

.profileHeader {
  composes: flexCenter from './common.module.css';
  flex-direction: column;
  padding: 2rem;
}
```

### 主题系统

```css
/* themes/variables.module.css */
.lightTheme {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.darkTheme {
  --color-primary: #4dabf7;
  --color-secondary: #adb5bd;
  --color-success: #51cf66;
  --color-danger: #ff6b6b;
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --border-color: #404040;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* components/Card.module.css */
.card {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  border-radius: 8px;
}

.title {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.description {
  color: var(--text-secondary);
  line-height: 1.6;
}

// ThemeProvider.jsx
import React, { createContext, useContext, useState } from 'react';
import themeStyles from './themes/variables.module.css';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const themeClass = theme === 'light' 
    ? themeStyles.lightTheme 
    : themeStyles.darkTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={themeClass}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

### 响应式样式复用

```css
/* responsive.module.css */
.responsiveContainer {
  width: 100%;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .responsiveContainer {
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .responsiveContainer {
    max-width: 1200px;
    margin: 0 auto;
  }
}

.responsiveGrid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .responsiveGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsiveGrid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

.hideOnMobile {
  display: none;
}

@media (min-width: 768px) {
  .hideOnMobile {
    display: block;
  }
}

.showOnMobile {
  display: block;
}

@media (min-width: 768px) {
  .showOnMobile {
    display: none;
  }
}

/* 使用响应式复用 */
.productGrid {
  composes: responsiveContainer from './responsive.module.css';
  composes: responsiveGrid from './responsive.module.css';
}
```

## 与预处理器集成

### SASS/SCSS Modules

```scss
// Button.module.scss
$primary-color: #007bff;
$secondary-color: #6c757d;
$border-radius: 4px;

// 混合宏
@mixin button-base {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  transition: all 0.3s ease;
}

// 函数
@function darken-color($color, $amount: 10%) {
  @return darken($color, $amount);
}

.button {
  @include button-base;
  
  &Primary {
    background-color: $primary-color;
    color: white;
    
    &:hover {
      background-color: darken-color($primary-color);
    }
  }
  
  &Secondary {
    background-color: $secondary-color;
    color: white;
    
    &:hover {
      background-color: darken-color($secondary-color);
    }
  }
  
  &Large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
  
  &Small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}

// 使用嵌套
.card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  
  .header {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    
    .title {
      font-size: 1.25rem;
      font-weight: 600;
    }
  }
  
  .body {
    line-height: 1.6;
  }
  
  .footer {
    border-top: 1px solid #eee;
    padding-top: 0.5rem;
    margin-top: 1rem;
  }
}

// variables.module.scss
$colors: (
  primary: #007bff,
  secondary: #6c757d,
  success: #28a745,
  danger: #dc3545
);

@function color($name) {
  @return map-get($colors, $name);
}

.primaryText {
  color: color(primary);
}

.successButton {
  background-color: color(success);
}
```

### Less Modules

```less
// Button.module.less
@primary-color: #007bff;
@border-radius: 4px;

// 混合
.button-base() {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: @border-radius;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button {
  .button-base();
  
  &-primary {
    background-color: @primary-color;
    color: white;
    
    &:hover {
      background-color: darken(@primary-color, 10%);
    }
  }
  
  &-large {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
}

// 使用守卫
.text-size(@size) when (@size = small) {
  font-size: 0.875rem;
}

.text-size(@size) when (@size = large) {
  font-size: 1.25rem;
}

.textSmall {
  .text-size(small);
}

.textLarge {
  .text-size(large);
}
```

## 实战案例

### 完整的卡片组件

```scss
// Card.module.scss
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  &Horizontal {
    flex-direction: row;
  }
  
  &Elevated {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  
  .cardHorizontal & {
    width: 200px;
    height: auto;
  }
}

.content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 1rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #212529;
}

.subtitle {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

.body {
  flex: 1;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 1rem;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  
  &Primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &Secondary {
    background: transparent;
    color: #007bff;
    border: 1px solid #007bff;
    
    &:hover {
      background: #007bff;
      color: white;
    }
  }
}

// Card.jsx
import React from 'react';
import styles from './Card.module.scss';
import clsx from 'clsx';

export function Card({ 
  image, 
  title, 
  subtitle, 
  children, 
  actions,
  horizontal = false,
  elevated = false 
}) {
  return (
    <div className={clsx(
      styles.card,
      horizontal && styles.cardHorizontal,
      elevated && styles.cardElevated
    )}>
      {image && (
        <img src={image} alt={title} className={styles.image} />
      )}
      <div className={styles.content}>
        {(title || subtitle) && (
          <div className={styles.header}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={styles.body}>
          {children}
        </div>
        {actions && (
          <div className={styles.footer}>
            <div className={styles.actions}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={clsx(
                    styles.button,
                    action.primary ? styles.buttonPrimary : styles.buttonSecondary
                  )}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 使用示例
function App() {
  return (
    <Card
      image="https://example.com/image.jpg"
      title="Card Title"
      subtitle="Card Subtitle"
      elevated
      actions={[
        { label: 'Cancel', onClick: () => {} },
        { label: 'Confirm', primary: true, onClick: () => {} }
      ]}
    >
      <p>This is the card content</p>
    </Card>
  );
}
```

### 表单组件系统

```scss
// Form.module.scss
.form {
  width: 100%;
  max-width: 500px;
}

.formGroup {
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212529;
  
  &Required::after {
    content: '*';
    color: #dc3545;
    margin-left: 0.25rem;
  }
}

.input,
.textarea,
.select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    outline: 0;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  &:disabled {
    background-color: #e9ecef;
    opacity: 1;
  }
  
  &Error {
    border-color: #dc3545;
    
    &:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
  }
  
  &Success {
    border-color: #28a745;
    
    &:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }
  }
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.helpText {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.errorText {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.checkbox,
.radio {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  
  input {
    margin-right: 0.5rem;
  }
}

.buttonGroup {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submitButton {
  padding: 0.5rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
}

// Form.jsx
import React, { useState } from 'react';
import styles from './Form.module.scss';
import clsx from 'clsx';

export function FormGroup({ 
  label, 
  name, 
  type = 'text', 
  required, 
  error, 
  helpText,
  ...props 
}) {
  const inputClass = clsx(
    styles.input,
    error && styles.inputError
  );
  
  return (
    <div className={styles.formGroup}>
      <label 
        htmlFor={name} 
        className={clsx(styles.label, required && styles.labelRequired)}
      >
        {label}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className={clsx(styles.textarea, error && styles.textareaError)}
          {...props}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className={inputClass}
          {...props}
        />
      )}
      
      {helpText && <span className={styles.helpText}>{helpText}</span>}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export function Form({ children, onSubmit }) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {children}
    </form>
  );
}
```

### 布局组件

```scss
// Layout.module.scss
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 250px;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  
  @media (max-width: 768px) {
    position: fixed;
    left: -250px;
    top: 0;
    bottom: 0;
    transition: left 0.3s ease;
    z-index: 999;
    
    &Open {
      left: 0;
    }
  }
}

.content {
  flex: 1;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.footer {
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 2rem;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

// Layout.jsx
import React, { useState } from 'react';
import styles from './Layout.module.scss';
import clsx from 'clsx';

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            Menu
          </button>
        </div>
      </header>
      
      <main className={styles.main}>
        <aside className={clsx(
          styles.sidebar,
          sidebarOpen && styles.sidebarOpen
        )}>
          Sidebar
        </aside>
        
        <div className={styles.content}>
          {children}
        </div>
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.container}>
          Footer Content
        </div>
      </footer>
    </div>
  );
}
```

## 性能优化

### 代码分割

```jsx
// 动态导入CSS Modules
import React, { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// HeavyComponent.jsx
import React, { useEffect } from 'react';

function HeavyComponent() {
  const [styles, setStyles] = React.useState({});
  
  useEffect(() => {
    import('./HeavyComponent.module.css').then(module => {
      setStyles(module.default);
    });
  }, []);
  
  return (
    <div className={styles.container}>
      Heavy Component
    </div>
  );
}
```

### 样式压缩

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    modules: {
      generateScopedName: (name, filename, css) => {
        // 生产环境使用短类名
        if (process.env.NODE_ENV === 'production') {
          return `${name}_${hash(css)}`;
        }
        // 开发环境使用可读类名
        return `${filename}_${name}`;
      }
    }
  },
  build: {
    cssCodeSplit: true, // CSS代码分割
    cssMinify: true // CSS压缩
  }
});
```

## 调试技巧

### 开发工具

```jsx
// 开发环境显示原始类名
import styles from './Component.module.css';

function Component() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Styles:', styles);
  }
  
  return <div className={styles.container}>Content</div>;
}

// 调试工具组件
function StyleDebugger({ styles }) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      right: 0, 
      background: 'black', 
      color: 'white',
      padding: '1rem',
      fontSize: '12px',
      maxWidth: '300px',
      overflow: 'auto'
    }}>
      <h4>CSS Modules Debug</h4>
      <pre>{JSON.stringify(styles, null, 2)}</pre>
    </div>
  );
}
```

## 最佳实践

### 1. 命名约定

- 使用有意义的类名
- 采用camelCase或kebab-case
- 避免过于通用的名称
- 使用语义化命名

### 2. 文件组织

- 一个组件一个样式文件
- 共享样式放在common目录
- 主题相关放在themes目录
- 保持文件结构清晰

### 3. 性能优化

- 使用composes减少重复
- 合理使用代码分割
- 压缩CSS输出
- 避免深层嵌套

### 4. 类型安全

- 使用TypeScript
- 生成类型定义文件
- 启用严格类型检查

## 总结

CSS Modules提供了一种优雅的CSS模块化解决方案：

1. **局部作用域**：避免全局污染
2. **组合复用**：通过composes实现样式复用
3. **类型安全**：与TypeScript完美集成
4. **工具丰富**：支持各种构建工具
5. **性能优异**：代码分割和压缩
6. **易于维护**：清晰的组织结构

掌握CSS Modules，能够写出更加模块化、可维护的React样式代码。
