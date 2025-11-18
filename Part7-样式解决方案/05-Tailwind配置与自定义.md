# Tailwind配置与自定义

## 概述

Tailwind CSS的强大之处在于其高度可定制性。通过配置文件,你可以自定义颜色、间距、字体等设计系统,创建符合品牌规范的独特样式。本文将深入探讨Tailwind CSS的配置选项和自定义技巧,帮助你打造专属的设计系统。

## 配置文件详解

### 基础配置结构

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 内容路径 - 告诉Tailwind在哪些文件中查找类名
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  // 暗黑模式策略
  darkMode: 'class', // 'media' | 'class' | false
  
  // 主题配置
  theme: {
    // 完全覆盖默认配置
    screens: {},
    colors: {},
    spacing: {},
    
    // 扩展默认配置
    extend: {
      colors: {},
      spacing: {},
      // ...
    },
  },
  
  // 变体配置
  variants: {
    extend: {},
  },
  
  // 插件
  plugins: [],
  
  // 预设
  presets: [],
  
  // 前缀
  prefix: '',
  
  // 重要性
  important: false,
  
  // 分隔符
  separator: ':',
  
  // 禁用的核心插件
  corePlugins: {},
}
```

### Content配置

```javascript
// 基础content配置
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}

// 高级content配置
module.exports = {
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    
    // 相对路径
    relative: true,
    
    // 提取器
    extract: {
      // 自定义提取逻辑
      js: (content) => {
        return content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
      }
    },
    
    // 转换器
    transform: {
      // 转换文件内容
      js: (content) => {
        return content.replace(/oldClassName/g, 'newClassName')
      }
    }
  },
}

// 包含node_modules
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@my-company/ui-lib/**/*.js",
  ],
}

// 使用glob模式
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "!./node_modules/**", // 排除node_modules
  ],
}
```

## 主题自定义

### 颜色系统

```javascript
// 完全自定义颜色
module.exports = {
  theme: {
    colors: {
      // 单一颜色
      white: '#ffffff',
      black: '#000000',
      
      // 品牌颜色
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      
      // 颜色色阶
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      
      // 语义化颜色
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
}

// 扩展默认颜色
module.exports = {
  theme: {
    extend: {
      colors: {
        // 添加品牌颜色
        brand: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        
        // 使用CSS变量
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        
        // 使用函数生成颜色
        'custom-blue': ({ opacityValue }) => {
          if (opacityValue !== undefined) {
            return `rgba(59, 130, 246, ${opacityValue})`
          }
          return `rgb(59, 130, 246)`
        },
      },
    },
  },
}

// 使用颜色库
const colors = require('tailwindcss/colors')

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.purple,
        success: colors.green,
        danger: colors.red,
        warning: colors.yellow,
      },
    },
  },
}

// 使用示例
function ColorExample() {
  return (
    <div className="bg-brand text-white">
      <button className="bg-primary hover:bg-primary/90">
        Primary Button
      </button>
      <div className="text-success">Success message</div>
    </div>
  );
}
```

### 间距系统

```javascript
// 自定义间距
module.exports = {
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        
        // 使用基础单位
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
        '2xl': '4rem',
        
        // 特定值
        'header': '4.5rem',
        'footer': '3rem',
        'sidebar': '16rem',
      },
    },
  },
}

// 使用函数生成间距
module.exports = {
  theme: {
    extend: {
      spacing: {
        ...Array.from({ length: 96 }, (_, i) => i * 0.25).reduce(
          (acc, value) => ({
            ...acc,
            [value]: `${value}rem`,
          }),
          {}
        ),
      },
    },
  },
}

// 使用示例
function SpacingExample() {
  return (
    <div className="p-md">
      <div className="mb-lg">Large margin bottom</div>
      <div className="space-y-xl">Extra large vertical spacing</div>
      <div className="h-header">Header height</div>
    </div>
  );
}
```

### 字体系统

```javascript
// 自定义字体
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['Oswald', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        
        // 自定义字号
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'body': ['1rem', { lineHeight: '1.6' }],
      },
      
      fontWeight: {
        hairline: 100,
        thin: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      
      letterSpacing: {
        tightest: '-.075em',
        tighter: '-.05em',
        tight: '-.025em',
        normal: '0',
        wide: '.025em',
        wider: '.05em',
        widest: '.1em',
      },
      
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
    },
  },
}

// 导入Google Fonts
// index.html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

// 使用示例
function TypographyExample() {
  return (
    <div className="font-sans">
      <h1 className="font-display text-display font-bold tracking-tight">
        Display Heading
      </h1>
      <p className="font-body text-body leading-relaxed">
        Body text with relaxed line height
      </p>
      <code className="font-mono text-sm">const code = 'example'</code>
    </div>
  );
}
```

### 断点系统

```javascript
// 自定义断点
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      
      // 自定义断点名
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
      
      // max-width断点
      'max-md': {'max': '767px'},
      
      // 范围断点
      'md-only': {'min': '768px', 'max': '1023px'},
      
      // 原始媒体查询
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
      'print': {'raw': 'print'},
    },
  },
}

// 使用示例
function ResponsiveExample() {
  return (
    <div className="
      w-full 
      xs:w-11/12 
      sm:w-10/12 
      md:w-8/12 
      lg:w-6/12 
      xl:w-4/12
      tablet:bg-blue-500 
      laptop:bg-green-500
      portrait:flex-col 
      landscape:flex-row
    ">
      Responsive Content
    </div>
  );
}
```

### 圆角和阴影

```javascript
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        
        // 自定义值
        'button': '0.375rem',
        'card': '0.75rem',
        'modal': '1rem',
      },
      
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
        
        // 彩色阴影
        'blue': '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
        'purple': '0 4px 14px 0 rgba(139, 92, 246, 0.39)',
        'pink': '0 4px 14px 0 rgba(236, 72, 153, 0.39)',
        
        // 自定义阴影
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
    },
  },
}

// 使用示例
function ShadowExample() {
  return (
    <div className="rounded-card shadow-card hover:shadow-card-hover transition-shadow">
      <button className="rounded-button shadow-blue">
        Blue Shadow Button
      </button>
    </div>
  );
}
```

## 自定义工具类

### 使用@layer添加自定义类

```css
/* styles/custom.css */

/* 基础层 - 重置和基础样式 */
@layer base {
  h1 {
    @apply text-4xl font-bold;
  }
  
  h2 {
    @apply text-3xl font-semibold;
  }
  
  a {
    @apply text-blue-500 hover:text-blue-600 transition-colors;
  }
  
  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
  }
}

/* 组件层 - 可复用组件样式 */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
  }
  
  .btn-primary {
    @apply btn bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700;
  }
  
  .btn-secondary {
    @apply btn bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700;
  }
  
  .btn-outline {
    @apply btn border-2 border-blue-500 text-blue-500 hover:bg-blue-50;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .card-hover {
    @apply card hover:shadow-xl transition-shadow duration-300;
  }
  
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
  
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-primary {
    @apply badge bg-blue-100 text-blue-800;
  }
  
  .badge-success {
    @apply badge bg-green-100 text-green-800;
  }
}

/* 工具层 - 覆盖默认样式 */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .writing-vertical {
    writing-mode: vertical-rl;
  }
  
  .text-stroke {
    -webkit-text-stroke: 1px currentColor;
  }
  
  .glass {
    @apply bg-white/30 backdrop-blur-md border border-white/20;
  }
  
  .gradient-text {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600;
  }
}

/* 使用示例 */
function CustomUtilitiesExample() {
  return (
    <div>
      <h1>Auto-styled heading</h1>
      <button className="btn-primary">Primary Button</button>
      <div className="card-hover">Hover Card</div>
      <input className="input" placeholder="Styled input" />
      <span className="badge-primary">Badge</span>
      <div className="glass">Glass morphism</div>
      <h2 className="gradient-text">Gradient Text</h2>
    </div>
  );
}
```

### 使用插件添加工具类

```javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, e, config }) {
      // 添加工具类
      addUtilities({
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
      })
      
      // 添加组件
      addComponents({
        '.flip-card': {
          position: 'relative',
          width: '300px',
          height: '400px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          '&:hover': {
            transform: 'rotateY(180deg)',
          },
        },
        '.flip-card-front, .flip-card-back': {
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
        },
        '.flip-card-back': {
          transform: 'rotateY(180deg)',
        },
      })
    }),
    
    // 响应式字体大小插件
    plugin(function({ addUtilities, theme }) {
      const newUtilities = {}
      const sizes = theme('fontSize')
      
      Object.keys(sizes).forEach(size => {
        newUtilities[`.text-responsive-${size}`] = {
          fontSize: sizes[size][0],
          '@screen md': {
            fontSize: `calc(${sizes[size][0]} * 1.1)`,
          },
          '@screen lg': {
            fontSize: `calc(${sizes[size][0]} * 1.2)`,
          },
        }
      })
      
      addUtilities(newUtilities)
    }),
  ],
}

// 使用示例
function PluginExample() {
  return (
    <div className="flip-card">
      <div className="flip-card-front bg-blue-500">
        Front
      </div>
      <div className="flip-card-back bg-green-500">
        Back
      </div>
    </div>
  );
}
```

## 变体自定义

### 添加自定义变体

```javascript
// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addVariant }) {
      // 子元素选择器
      addVariant('child', '& > *')
      addVariant('child-hover', '& > *:hover')
      
      // 奇偶子元素
      addVariant('nth-2', '&:nth-child(2)')
      addVariant('nth-3', '&:nth-child(3)')
      
      // 第一个/最后一个
      addVariant('not-first', '&:not(:first-child)')
      addVariant('not-last', '&:not(:last-child)')
      
      // 可选变体
      addVariant('optional', '&:optional')
      addVariant('required', '&:required')
      
      // 数据属性
      addVariant('data-active', '&[data-active="true"]')
      addVariant('data-disabled', '&[data-disabled="true"]')
      
      // ARIA属性
      addVariant('aria-expanded', '&[aria-expanded="true"]')
      addVariant('aria-checked', '&[aria-checked="true"]')
      
      // 组合变体
      addVariant('group-optional', ':merge(.group):optional &')
      addVariant('peer-optional', ':merge(.peer):optional ~ &')
    }),
  ],
}

// 使用示例
function VariantExample() {
  return (
    <div>
      {/* 子元素变体 */}
      <div className="child:p-4 child-hover:bg-gray-100">
        <div>Child 1</div>
        <div>Child 2</div>
      </div>
      
      {/* 非第一个元素 */}
      <div className="not-first:border-t">Item</div>
      
      {/* 数据属性 */}
      <button 
        data-active="true"
        className="data-active:bg-blue-500"
      >
        Active Button
      </button>
      
      {/* ARIA属性 */}
      <button 
        aria-expanded="true"
        className="aria-expanded:rotate-180"
      >
        Expandable
      </button>
    </div>
  );
}
```

### 响应式和状态变体组合

```jsx
function CombinedVariants() {
  return (
    <div>
      {/* 响应式 + 悬停 */}
      <button className="
        bg-blue-500 
        md:bg-green-500 
        hover:bg-blue-600 
        md:hover:bg-green-600
      ">
        Responsive Hover
      </button>
      
      {/* 暗黑模式 + 响应式 */}
      <div className="
        bg-white 
        dark:bg-gray-900 
        md:p-8 
        dark:md:p-10
      ">
        Dark Mode Responsive
      </div>
      
      {/* Group + 响应式 */}
      <div className="group">
        <div className="
          opacity-0 
          group-hover:opacity-100 
          md:group-hover:opacity-75
        ">
          Group Responsive Hover
        </div>
      </div>
      
      {/* Peer + 状态 */}
      <div>
        <input type="checkbox" className="peer" />
        <div className="
          peer-checked:bg-blue-500 
          peer-checked:md:bg-green-500
        ">
          Peer Checked Responsive
        </div>
      </div>
    </div>
  );
}
```

## 插件系统

### 官方插件

```bash
# 安装官方插件
npm install -D @tailwindcss/forms
npm install -D @tailwindcss/typography
npm install -D @tailwindcss/aspect-ratio
npm install -D @tailwindcss/container-queries
```

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    // 表单样式
    require('@tailwindcss/forms')({
      strategy: 'class', // 或 'base'
    }),
    
    // 排版样式
    require('@tailwindcss/typography'),
    
    // 宽高比
    require('@tailwindcss/aspect-ratio'),
    
    // 容器查询
    require('@tailwindcss/container-queries'),
  ],
}

// 使用Forms插件
function FormsExample() {
  return (
    <form>
      <input 
        type="text" 
        className="form-input rounded-md" 
        placeholder="Input"
      />
      <select className="form-select rounded-md">
        <option>Option 1</option>
      </select>
      <input 
        type="checkbox" 
        className="form-checkbox rounded text-blue-500"
      />
    </form>
  );
}

// 使用Typography插件
function TypographyExample() {
  return (
    <article className="prose lg:prose-xl">
      <h1>Article Title</h1>
      <p>Article content...</p>
    </article>
  );
}

// 使用Aspect Ratio插件
function AspectRatioExample() {
  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe src="https://youtube.com/embed/..."></iframe>
    </div>
  );
}

// 使用Container Queries插件
function ContainerExample() {
  return (
    <div className="@container">
      <div className="@lg:grid @lg:grid-cols-2">
        Content
      </div>
    </div>
  );
}
```

### 自定义插件

```javascript
// plugins/custom-plugin.js
const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities, addComponents, theme, e }) {
  // 添加动画工具类
  const animations = {
    '.animate-fade-in': {
      animation: 'fadeIn 0.5s ease-in',
    },
    '.animate-slide-up': {
      animation: 'slideUp 0.5s ease-out',
    },
  }
  
  const keyframes = {
    '@keyframes fadeIn': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    '@keyframes slideUp': {
      '0%': { 
        transform: 'translateY(20px)',
        opacity: '0',
      },
      '100%': { 
        transform: 'translateY(0)',
        opacity: '1',
      },
    },
  }
  
  addUtilities({ ...animations, ...keyframes })
  
  // 添加组件
  addComponents({
    '.btn-animated': {
      padding: theme('spacing.4'),
      borderRadius: theme('borderRadius.lg'),
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme('boxShadow.lg'),
      },
    },
  })
}, {
  theme: {
    extend: {
      // 插件特定的主题扩展
    },
  },
})

// tailwind.config.js
module.exports = {
  plugins: [
    require('./plugins/custom-plugin'),
  ],
}
```

## 预设系统

### 创建预设

```javascript
// presets/company-preset.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

// tailwind.config.js
module.exports = {
  presets: [
    require('./presets/company-preset'),
  ],
  // 项目特定配置
  theme: {
    extend: {
      // 额外扩展
    },
  },
}
```

### 多预设组合

```javascript
// presets/base.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // 基础颜色
      },
    },
  },
}

// presets/components.js
module.exports = {
  plugins: [
    require('./plugins/custom-components'),
  ],
}

// tailwind.config.js
module.exports = {
  presets: [
    require('./presets/base'),
    require('./presets/components'),
  ],
}
```

## 高级配置技巧

### 环境特定配置

```javascript
// tailwind.config.js
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      colors: process.env.NODE_ENV === 'development' 
        ? {
            // 开发环境：使用所有颜色
            ...colors,
          }
        : {
            // 生产环境：只使用需要的颜色
            gray: colors.gray,
            blue: colors.blue,
          },
    },
  },
  
  // 开发环境禁用purge
  ...(process.env.NODE_ENV === 'development' ? {
    safelist: [
      {
        pattern: /./, // 匹配所有
      },
    ],
  } : {}),
}
```

### 动态类名安全列表

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  safelist: [
    // 保留特定类
    'bg-red-500',
    'text-3xl',
    'lg:text-4xl',
    
    // 使用正则保留一组类
    {
      pattern: /bg-(red|green|blue)-(400|500|600)/,
      variants: ['lg', 'hover', 'focus'],
    },
    
    // 保留所有特定前缀的类
    {
      pattern: /^bg-brand-/,
    },
    
    // 保留动态生成的类
    ...['primary', 'secondary', 'accent'].map(color => ({
      pattern: new RegExp(`^(bg|text|border)-${color}`),
    })),
  ],
}

// 使用场景：动态类名
function DynamicColors({ color }) {
  // 这些类会被保留
  return <div className={`bg-${color}-500`}>Dynamic Color</div>;
}
```

### 前缀和重要性

```javascript
// 添加前缀避免冲突
module.exports = {
  prefix: 'tw-',
  theme: {
    extend: {},
  },
}

// 使用
<div className="tw-flex tw-items-center tw-justify-center">

// 设置important
module.exports = {
  important: true, // 所有类都添加!important
  // 或
  important: '#app', // 提高特定选择器的优先级
}

// 选择性important
<div className="!bg-blue-500 bg-red-500">
  {/* bg-blue-500会生效因为有! */}
</div>
```

## 总结

Tailwind配置与自定义要点：

1. **配置文件**：Content、theme、plugins等核心配置
2. **主题自定义**：颜色、间距、字体、断点等
3. **自定义工具类**：使用@layer和插件添加
4. **变体系统**：自定义变体和组合使用
5. **插件系统**：官方插件和自定义插件
6. **预设系统**：创建和组合预设
7. **高级技巧**：环境配置、安全列表、前缀等

掌握这些配置技巧，可以打造完全符合项目需求的设计系统。
