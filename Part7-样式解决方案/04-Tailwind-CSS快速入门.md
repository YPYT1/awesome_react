# Tailwind CSS快速入门

## 概述

Tailwind CSS是一个功能优先(utility-first)的CSS框架,它提供了大量的原子化CSS类,让开发者无需编写自定义CSS即可快速构建现代化界面。与传统CSS框架不同,Tailwind不提供预设计的组件,而是提供构建块,让开发者自由组合创建独特的设计。本文将带你快速掌握Tailwind CSS在React项目中的使用。

## 安装和配置

### 在Vite项目中安装

```bash
# 创建Vite + React项目
npm create vite@latest my-tailwind-app -- --template react
cd my-tailwind-app

# 安装Tailwind CSS及其依赖
npm install -D tailwindcss postcss autoprefixer

# 初始化Tailwind配置
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 在Next.js项目中安装

```bash
# 创建Next.js项目
npx create-next-app@latest my-tailwind-app

# 在创建过程中选择：
# ✔ Would you like to use Tailwind CSS? Yes

# 或手动安装
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* app/globals.css 或 styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 在Create React App中安装

```bash
# 创建CRA项目
npx create-react-app my-tailwind-app
cd my-tailwind-app

# 安装Tailwind及CRACO（CRA配置工具）
npm install -D tailwindcss postcss autoprefixer
npm install -D @craco/craco

# 初始化Tailwind
npx tailwindcss init
```

```javascript
// craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
}

// package.json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  }
}
```

## 核心概念

### Utility-First理念

```jsx
// 传统CSS方式
// Button.css
.button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.25rem;
  font-weight: 500;
}

.button:hover {
  background-color: #2563eb;
}

// Button.jsx
import './Button.css';
function Button() {
  return <button className="button">Click me</button>;
}

// Tailwind方式 - 直接使用工具类
function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600">
      Click me
    </button>
  );
}
```

### 响应式设计

```jsx
// Tailwind的移动优先响应式断点
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

function ResponsiveComponent() {
  return (
    <div className="
      w-full          // 默认宽度100%
      md:w-1/2        // 中等屏幕50%
      lg:w-1/3        // 大屏幕33.33%
      xl:w-1/4        // 超大屏幕25%
      p-4             // 默认padding 1rem
      md:p-6          // 中等屏幕padding 1.5rem
      lg:p-8          // 大屏幕padding 2rem
    ">
      <h1 className="
        text-2xl      // 默认字体大小
        md:text-3xl   // 中等屏幕
        lg:text-4xl   // 大屏幕
        font-bold
      ">
        Responsive Title
      </h1>
    </div>
  );
}

// 网格布局响应式
function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.id} className="bg-white p-4 rounded shadow">
          {item.content}
        </div>
      ))}
    </div>
  );
}
```

### 状态变体

```jsx
// 悬停状态
function HoverExample() {
  return (
    <button className="
      bg-blue-500 
      hover:bg-blue-600 
      text-white 
      px-4 py-2 
      rounded 
      transition-colors
    ">
      Hover me
    </button>
  );
}

// 焦点状态
function FocusExample() {
  return (
    <input 
      type="text"
      className="
        border 
        border-gray-300 
        focus:border-blue-500 
        focus:ring 
        focus:ring-blue-200 
        rounded 
        px-3 py-2 
        outline-none
      "
      placeholder="Focus me"
    />
  );
}

// 激活状态
function ActiveExample() {
  return (
    <button className="
      bg-blue-500 
      hover:bg-blue-600 
      active:bg-blue-700 
      text-white 
      px-4 py-2 
      rounded
    ">
      Click me
    </button>
  );
}

// 禁用状态
function DisabledExample({ disabled }) {
  return (
    <button 
      disabled={disabled}
      className="
        bg-blue-500 
        text-white 
        px-4 py-2 
        rounded
        disabled:opacity-50 
        disabled:cursor-not-allowed
      "
    >
      Submit
    </button>
  );
}

// 组合多个状态
function CombinedStates() {
  return (
    <button className="
      bg-blue-500 
      text-white 
      px-4 py-2 
      rounded
      hover:bg-blue-600 
      focus:outline-none 
      focus:ring-2 
      focus:ring-blue-300
      active:bg-blue-700
      disabled:opacity-50
      transition-all
    ">
      Button
    </button>
  );
}
```

## 常用工具类

### 布局类

```jsx
// Flexbox布局
function FlexLayout() {
  return (
    <>
      {/* 水平居中 */}
      <div className="flex justify-center items-center h-screen">
        <div>Centered Content</div>
      </div>
      
      {/* 两端对齐 */}
      <div className="flex justify-between items-center p-4">
        <div>Left</div>
        <div>Right</div>
      </div>
      
      {/* 垂直堆叠 */}
      <div className="flex flex-col gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
      
      {/* 响应式Flex方向 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">Content 1</div>
        <div className="flex-1">Content 2</div>
      </div>
    </>
  );
}

// Grid布局
function GridLayout() {
  return (
    <>
      {/* 基础Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
      
      {/* 响应式Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(item => <div key={item.id}>{item.content}</div>)}
      </div>
      
      {/* 自动填充 */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
        {items.map(item => <div key={item.id}>{item.content}</div>)}
      </div>
      
      {/* Grid区域 */}
      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-screen">
        <div className="col-span-3">Header</div>
        <div className="row-span-2">Sidebar</div>
        <div className="col-span-2 row-span-2">Main Content</div>
      </div>
    </>
  );
}

// 定位
function PositionExample() {
  return (
    <>
      {/* 相对定位 */}
      <div className="relative">
        <div className="absolute top-0 right-0">Badge</div>
      </div>
      
      {/* 固定定位 */}
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full">
        Scroll to Top
      </div>
      
      {/* 粘性定位 */}
      <div className="sticky top-0 bg-white shadow z-10">
        Sticky Header
      </div>
    </>
  );
}
```

### 间距类

```jsx
function SpacingExample() {
  return (
    <>
      {/* Padding */}
      <div className="p-4">Padding all sides: 1rem</div>
      <div className="px-4 py-2">Horizontal & Vertical padding</div>
      <div className="pt-4 pr-3 pb-2 pl-1">Individual padding</div>
      
      {/* Margin */}
      <div className="m-4">Margin all sides: 1rem</div>
      <div className="mx-auto">Centered with auto margin</div>
      <div className="mt-4 mb-8">Top & Bottom margin</div>
      
      {/* Gap (for Flex/Grid) */}
      <div className="flex gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
      
      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
      
      {/* Space between */}
      <div className="flex flex-col space-y-4">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    </>
  );
}
```

### 颜色类

```jsx
function ColorExample() {
  return (
    <>
      {/* 文本颜色 */}
      <p className="text-gray-900">Dark text</p>
      <p className="text-blue-500">Blue text</p>
      <p className="text-red-600">Red text</p>
      
      {/* 背景颜色 */}
      <div className="bg-white">White background</div>
      <div className="bg-gray-100">Gray background</div>
      <div className="bg-blue-500">Blue background</div>
      
      {/* 边框颜色 */}
      <div className="border border-gray-300">Gray border</div>
      <div className="border-2 border-blue-500">Blue border</div>
      
      {/* 渐变背景 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600">
        Gradient background
      </div>
      
      <div className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500">
        Multi-color gradient
      </div>
      
      {/* 透明度 */}
      <div className="bg-blue-500 bg-opacity-50">50% opacity</div>
      <div className="text-gray-900 text-opacity-75">75% text opacity</div>
    </>
  );
}
```

### 文字类

```jsx
function TypographyExample() {
  return (
    <>
      {/* 字体大小 */}
      <p className="text-xs">Extra small</p>
      <p className="text-sm">Small</p>
      <p className="text-base">Base</p>
      <p className="text-lg">Large</p>
      <p className="text-xl">Extra large</p>
      <p className="text-2xl">2X large</p>
      <p className="text-4xl">4X large</p>
      
      {/* 字重 */}
      <p className="font-thin">Thin</p>
      <p className="font-normal">Normal</p>
      <p className="font-medium">Medium</p>
      <p className="font-semibold">Semibold</p>
      <p className="font-bold">Bold</p>
      <p className="font-black">Black</p>
      
      {/* 文本对齐 */}
      <p className="text-left">Left aligned</p>
      <p className="text-center">Center aligned</p>
      <p className="text-right">Right aligned</p>
      <p className="text-justify">Justified text</p>
      
      {/* 行高 */}
      <p className="leading-none">No line height</p>
      <p className="leading-tight">Tight</p>
      <p className="leading-normal">Normal</p>
      <p className="leading-relaxed">Relaxed</p>
      <p className="leading-loose">Loose</p>
      
      {/* 文本装饰 */}
      <p className="underline">Underlined</p>
      <p className="line-through">Line through</p>
      <p className="no-underline">No underline</p>
      
      {/* 文本转换 */}
      <p className="uppercase">UPPERCASE</p>
      <p className="lowercase">lowercase</p>
      <p className="capitalize">Capitalize Each Word</p>
      
      {/* 文本截断 */}
      <p className="truncate w-64">
        This is a very long text that will be truncated with ellipsis
      </p>
      
      <p className="line-clamp-3">
        This text will be limited to 3 lines and show ellipsis after that.
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </p>
    </>
  );
}
```

### 边框和圆角

```jsx
function BorderExample() {
  return (
    <>
      {/* 边框宽度 */}
      <div className="border">1px border</div>
      <div className="border-2">2px border</div>
      <div className="border-4">4px border</div>
      <div className="border-8">8px border</div>
      
      {/* 单边边框 */}
      <div className="border-t">Top border</div>
      <div className="border-r">Right border</div>
      <div className="border-b">Bottom border</div>
      <div className="border-l">Left border</div>
      
      {/* 圆角 */}
      <div className="rounded">Small rounded</div>
      <div className="rounded-md">Medium rounded</div>
      <div className="rounded-lg">Large rounded</div>
      <div className="rounded-xl">Extra large rounded</div>
      <div className="rounded-full">Fully rounded</div>
      
      {/* 单角圆角 */}
      <div className="rounded-tl-lg">Top-left rounded</div>
      <div className="rounded-tr-lg">Top-right rounded</div>
      <div className="rounded-bl-lg">Bottom-left rounded</div>
      <div className="rounded-br-lg">Bottom-right rounded</div>
      
      {/* 边框样式 */}
      <div className="border-solid">Solid border</div>
      <div className="border-dashed">Dashed border</div>
      <div className="border-dotted">Dotted border</div>
      <div className="border-double">Double border</div>
    </>
  );
}
```

### 阴影和效果

```jsx
function EffectsExample() {
  return (
    <>
      {/* 阴影 */}
      <div className="shadow-sm">Small shadow</div>
      <div className="shadow">Default shadow</div>
      <div className="shadow-md">Medium shadow</div>
      <div className="shadow-lg">Large shadow</div>
      <div className="shadow-xl">Extra large shadow</div>
      <div className="shadow-2xl">2X large shadow</div>
      <div className="shadow-inner">Inner shadow</div>
      
      {/* 透明度 */}
      <div className="opacity-0">Invisible</div>
      <div className="opacity-25">25% opacity</div>
      <div className="opacity-50">50% opacity</div>
      <div className="opacity-75">75% opacity</div>
      <div className="opacity-100">Fully visible</div>
      
      {/* 模糊 */}
      <div className="blur-sm">Small blur</div>
      <div className="blur">Default blur</div>
      <div className="blur-lg">Large blur</div>
      
      {/* 亮度 */}
      <div className="brightness-50">50% brightness</div>
      <div className="brightness-100">Normal brightness</div>
      <div className="brightness-150">150% brightness</div>
      
      {/* 对比度 */}
      <div className="contrast-50">50% contrast</div>
      <div className="contrast-100">Normal contrast</div>
      <div className="contrast-150">150% contrast</div>
    </>
  );
}
```

## 实战组件示例

### 按钮组件

```jsx
// 基础按钮
function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const baseClasses = "font-medium rounded transition-colors duration-200";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700",
    outline: "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100",
    ghost: "text-blue-500 hover:bg-blue-50 active:bg-blue-100",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}

// 使用示例
function ButtonExamples() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
    </div>
  );
}
```

### 卡片组件

```jsx
function Card({ image, title, description, tags, author, date }) {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      {/* 图片 */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      {/* 内容 */}
      <div className="p-6">
        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* 标题 */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        {/* 描述 */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {description}
        </p>
        
        {/* 作者信息 */}
        {author && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <img 
                src={author.avatar} 
                alt={author.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{author.name}</p>
                <p className="text-xs text-gray-500">{date}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 使用示例
function CardExample() {
  return (
    <Card
      image="https://example.com/image.jpg"
      title="Understanding Tailwind CSS"
      description="Learn how to use Tailwind CSS to build modern user interfaces quickly and efficiently."
      tags={['CSS', 'React', 'Tutorial']}
      author={{
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg'
      }}
      date="2024-01-15"
    />
  );
}
```

### 表单组件

```jsx
function FormInput({ label, type = 'text', error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-2 border rounded-lg 
          focus:outline-none focus:ring-2 transition-colors
          ${error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function FormTextarea({ label, error, rows = 4, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2 border rounded-lg resize-none
          focus:outline-none focus:ring-2 transition-colors
          ${error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = React.useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 表单验证和提交逻辑
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
      
      <FormInput
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Your name"
      />
      
      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="your@email.com"
      />
      
      <FormTextarea
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        error={errors.message}
        placeholder="Your message..."
      />
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
```

### 导航栏组件

```jsx
function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Logo</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Sign Up
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
              Home
            </a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
              About
            </a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
              Services
            </a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
              Contact
            </a>
            <button className="w-full text-left px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
```

## 暗黑模式

### 配置暗黑模式

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 或 'media' 使用系统偏好
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 实现暗黑模式

```jsx
// 使用class策略
function DarkModeExample() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <h1 className="text-gray-900 dark:text-white">
        Title
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Description
      </p>
      <button className="bg-blue-500 dark:bg-blue-600 text-white">
        Button
      </button>
    </div>
  );
}

// 暗黑模式切换
function DarkModeToggle() {
  const [darkMode, setDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {darkMode ? '🌞' : '🌙'}
    </button>
  );
}

// 使用localStorage持久化
function useDarkMode() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  
  React.useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return [darkMode, setDarkMode];
}

// 使用系统偏好
function useSystemDarkMode() {
  const [darkMode, setDarkMode] = React.useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return darkMode;
}
```

## 性能优化

### 生产环境优化

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 生产环境配置
  ...(process.env.NODE_ENV === 'production' ? {
    // 移除未使用的样式
    purge: {
      enabled: true,
      content: ['./src/**/*.{js,jsx,ts,tsx}']
    }
  } : {})
}
```

### 使用JIT模式

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit', // Just-In-Time模式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 最佳实践

### 1. 组件抽象

```jsx
// 将重复的类组合抽象为组件
// 不好
function BadExample() {
  return (
    <>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Button 1
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Button 2
      </button>
    </>
  );
}

// 好
function Button({ children, ...props }) {
  return (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      {...props}
    >
      {children}
    </button>
  );
}

function GoodExample() {
  return (
    <>
      <Button>Button 1</Button>
      <Button>Button 2</Button>
    </>
  );
}
```

### 2. 使用@apply提取重复样式

```css
/* styles/components.css */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200;
  }
}

// 使用
function Component() {
  return (
    <div className="card">
      <input className="input-field" />
      <button className="btn-primary">Submit</button>
    </div>
  );
}
```

### 3. 条件类名管理

```jsx
// 使用clsx或classnames库
import clsx from 'clsx';

function Button({ variant, size, disabled, children }) {
  return (
    <button
      className={clsx(
        'font-medium rounded transition-colors',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
          'bg-gray-500 text-white hover:bg-gray-600': variant === 'secondary',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled
        }
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

## 总结

Tailwind CSS快速入门要点：

1. **安装配置**：支持Vite、Next.js、CRA等主流工具
2. **核心概念**：Utility-first、响应式、状态变体
3. **常用工具类**：布局、间距、颜色、文字、边框等
4. **实战组件**：按钮、卡片、表单、导航栏
5. **暗黑模式**：class或media策略
6. **性能优化**：JIT模式、生产环境配置
7. **最佳实践**：组件抽象、@apply、条件类名

掌握这些基础知识，就能快速使用Tailwind CSS构建现代化界面。
