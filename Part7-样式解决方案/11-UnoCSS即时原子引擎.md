# UnoCSS即时原子引擎

## 概述

UnoCSS是新一代原子化CSS引擎,由Vite和Vue的作者Anthony Fu创建。它采用即时(on-demand)生成的方式,只生成你实际使用的样式,具有极高的性能和灵活性。UnoCSS不仅兼容Tailwind CSS的语法,还提供了更强大的预设系统、变体组、图标集成等特性。本文将全面介绍UnoCSS的使用方法和高级特性。

## 安装和配置

### 基础安装

```bash
# 使用npm
npm install -D unocss

# 使用pnpm
pnpm add -D unocss

# 使用yarn
yarn add -D unocss
```

### Vite配置

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
  ],
})

// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // Tailwind / Windi CSS兼容预设
    presetAttributify(), // 属性化模式
    presetIcons({ // 图标预设
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
})

// main.tsx
import 'uno.css'
```

### Next.js配置

```javascript
// next.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      UnoCSS()
    )
    return config
  },
}

// _app.tsx
import 'uno.css'
```

### Webpack配置

```javascript
// webpack.config.js
const UnoCSS = require('@unocss/webpack').default

module.exports = {
  plugins: [
    UnoCSS(),
  ],
}
```

## 核心特性

### 即时按需生成

```jsx
// UnoCSS只生成你实际使用的样式
function Component() {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg">
      UnoCSS
    </div>
  )
}

// 编译后只生成:
// .p-4 { padding: 1rem; }
// .bg-blue-500 { background-color: rgb(59 130 246); }
// .text-white { color: rgb(255 255 255); }
// .rounded-lg { border-radius: 0.5rem; }

// 未使用的样式不会生成
// .p-8 ❌ 不生成
// .bg-red-500 ❌ 不生成
```

### 属性化模式

```jsx
// 启用属性化模式后
function AttributifyComponent() {
  return (
    <div
      text="white center"
      bg="blue-500"
      p="4"
      rounded="lg"
      hover:bg="blue-600"
    >
      Attributify Mode
    </div>
  )
}

// 等价于
function TraditionalComponent() {
  return (
    <div className="text-white text-center bg-blue-500 p-4 rounded-lg hover:bg-blue-600">
      Traditional Mode
    </div>
  )
}

// 属性化 + 分组
function GroupedAttributes() {
  return (
    <button
      btn="~ solid"  // 应用btn预设
      bg="blue-500 hover:blue-600"
      text="white center"
      p="x-4 y-2"
      rounded="md"
    >
      Click me
    </button>
  )
}
```

### 变体组

```jsx
// 传统写法
function Traditional() {
  return (
    <div className="hover:bg-blue-500 hover:text-white hover:scale-105">
      Hover me
    </div>
  )
}

// 使用变体组
function VariantGroup() {
  return (
    <div className="hover:(bg-blue-500 text-white scale-105)">
      Hover me
    </div>
  )
}

// 多个变体组
function MultipleVariants() {
  return (
    <div className="
      hover:(bg-blue-500 text-white scale-105)
      dark:(bg-gray-800 text-gray-100)
      md:(p-8 text-xl)
    ">
      Multiple Variant Groups
    </div>
  )
}

// 嵌套变体组
function NestedVariants() {
  return (
    <div className="
      dark:(
        bg-gray-800 
        text-gray-100
        hover:(bg-gray-700 scale-105)
      )
    ">
      Nested Variants
    </div>
  )
}
```

### 图标集成

```jsx
// 配置图标预设
import { presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      }
    }),
  ],
})

// 使用图标
function IconExample() {
  return (
    <div>
      {/* Iconify图标 */}
      <div className="i-carbon-logo-github text-2xl" />
      <div className="i-mdi-heart text-red-500 text-3xl" />
      
      {/* 自定义颜色和大小 */}
      <div className="i-carbon-star text-yellow-500 text-4xl" />
      
      {/* 组合使用 */}
      <button className="flex items-center gap-2">
        <div className="i-carbon-add" />
        Add Item
      </button>
    </div>
  )
}

// 自定义图标集合
const customIcons = {
  'my-icon': '<svg>...</svg>',
}

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        custom: {
          icons: customIcons,
        },
      },
    }),
  ],
})
```

## 预设系统

### 官方预设

```typescript
// uno.config.ts
import {
  defineConfig,
  presetUno,           // Tailwind/Windi兼容
  presetAttributify,   // 属性化模式
  presetIcons,         // 图标
  presetTypography,    // 排版
  presetWebFonts,      // Web字体
  presetWind,          // Windi CSS预设
  presetMini,          // 最小预设
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'Fira Code',
      },
    }),
  ],
})
```

### 自定义预设

```typescript
// 创建自定义预设
import { Preset } from 'unocss'

const myPreset: Preset = {
  name: 'my-preset',
  rules: [
    // 自定义规则
    ['custom-rule', { color: 'red' }],
    [/^m-(.+)$/, ([, d]) => ({ margin: `${d}px` })],
  ],
  variants: [
    // 自定义变体
    (matcher) => {
      if (!matcher.startsWith('my:'))
        return matcher
      return {
        matcher: matcher.slice(3),
        selector: s => `${s}.my-class`,
      }
    },
  ],
  shortcuts: [
    // 快捷方式
    ['btn', 'px-4 py-2 rounded bg-blue-500 text-white'],
    ['card', 'p-6 bg-white rounded-lg shadow'],
  ],
  theme: {
    colors: {
      brand: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
    },
  },
}

export default defineConfig({
  presets: [
    presetUno(),
    myPreset,
  ],
})

// 使用自定义预设
function CustomPresetExample() {
  return (
    <div>
      <button className="btn">Custom Button</button>
      <div className="card">Custom Card</div>
      <div className="m-20">Custom Margin</div>
      <div className="my:custom-rule">Custom Variant</div>
    </div>
  )
}
```

## 规则和快捷方式

### 自定义规则

```typescript
// 静态规则
export default defineConfig({
  rules: [
    ['custom-red', { color: 'red' }],
    ['full-screen', { 
      width: '100vw', 
      height: '100vh' 
    }],
  ],
})

// 动态规则
export default defineConfig({
  rules: [
    // 匹配 m-数字
    [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}px` })],
    
    // 匹配 text-任意颜色
    [/^text-(.+)$/, ([, color]) => ({ color })],
    
    // 匹配 grid-cols-数字
    [/^grid-cols-(\d+)$/, ([, d]) => ({
      'grid-template-columns': `repeat(${d}, minmax(0, 1fr))`,
    })],
    
    // 复杂规则
    [/^card-(.+)$/, ([, variant]) => {
      const variants = {
        primary: { background: '#3b82f6', color: 'white' },
        secondary: { background: '#8b5cf6', color: 'white' },
      }
      return variants[variant] || {}
    }],
  ],
})

// 使用自定义规则
function CustomRules() {
  return (
    <div>
      <div className="custom-red">Red Text</div>
      <div className="m-20">20px margin</div>
      <div className="text-#ff0000">Custom color</div>
      <div className="grid grid-cols-3">Grid</div>
      <div className="card-primary">Primary Card</div>
    </div>
  )
}
```

### 快捷方式

```typescript
// 静态快捷方式
export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-2 rounded bg-blue-500 text-white cursor-pointer',
    'btn-green': 'px-4 py-2 rounded bg-green-500 text-white cursor-pointer',
    'card': 'p-6 bg-white rounded-lg shadow-md',
    'container': 'max-w-7xl mx-auto px-4',
  },
})

// 动态快捷方式
export default defineConfig({
  shortcuts: [
    // 数组形式
    ['btn', 'px-4 py-2 rounded cursor-pointer'],
    
    // 函数形式
    [/^btn-(.+)$/, ([, color]) => `px-4 py-2 rounded bg-${color}-500 text-white`],
    
    // 带变体
    ['btn-with-icon', 'btn flex items-center gap-2'],
  ],
})

// 嵌套快捷方式
export default defineConfig({
  shortcuts: {
    'btn-base': 'px-4 py-2 rounded cursor-pointer',
    'btn-primary': 'btn-base bg-blue-500 text-white',
    'btn-secondary': 'btn-base bg-gray-500 text-white',
  },
})

// 使用快捷方式
function Shortcuts() {
  return (
    <div className="container">
      <button className="btn">Button</button>
      <button className="btn-green">Green Button</button>
      <button className="btn-red">Red Button</button>
      <div className="card">Card Content</div>
    </div>
  )
}
```

## 主题配置

### 自定义主题

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
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
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
    },
    spacing: {
      'xs': '0.5rem',
      'sm': '1rem',
      'md': '1.5rem',
      'lg': '2rem',
      'xl': '3rem',
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
    },
    breakpoints: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    boxShadow: {
      'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
  },
})

// 使用自定义主题
function ThemedComponent() {
  return (
    <div className="
      bg-brand-500 
      text-white 
      p-md 
      font-sans 
      text-lg 
      shadow-md
      rounded-lg
    ">
      Themed Component
    </div>
  )
}
```

### 暗黑模式

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        dark: '#60a5fa',
      },
    },
  },
  presets: [
    presetUno({
      dark: 'class', // 或 'media'
    }),
  ],
})

// 使用暗黑模式
function DarkMode() {
  return (
    <div className="
      bg-white dark:bg-gray-900
      text-gray-900 dark:text-gray-100
      p-4
    ">
      <button className="
        bg-primary 
        dark:bg-primary-dark
        text-white
        px-4 py-2
        rounded
      ">
        Theme-aware Button
      </button>
    </div>
  )
}

// 暗黑模式切换
function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState(false)
  
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])
  
  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? '🌞' : '🌙'}
    </button>
  )
}
```

## 高级特性

### 任意值

```jsx
// 方括号语法 - 任意值
function ArbitraryValues() {
  return (
    <div>
      {/* 任意颜色 */}
      <div className="text-[#1da1f2]">Twitter Blue</div>
      <div className="bg-[rgb(59,130,246)]">RGB Color</div>
      
      {/* 任意尺寸 */}
      <div className="w-[789px]">Custom Width</div>
      <div className="h-[50vh]">Viewport Height</div>
      
      {/* 任意属性值 */}
      <div className="text-[length:var(--my-var)]">CSS Variable</div>
      <div className="grid-cols-[1fr_2fr_1fr]">Custom Grid</div>
      
      {/* 任意CSS */}
      <div className="[mask-image:linear-gradient(#000,transparent)]">
        Custom CSS
      </div>
    </div>
  )
}
```

### 变体

```typescript
// 自定义变体
export default defineConfig({
  variants: [
    // 父元素状态
    (matcher) => {
      if (!matcher.startsWith('parent-hover:'))
        return matcher
      return {
        matcher: matcher.slice(13),
        selector: s => `.parent:hover ${s}`,
      }
    },
    
    // 数据属性
    (matcher) => {
      if (!matcher.startsWith('data-active:'))
        return matcher
      return {
        matcher: matcher.slice(12),
        selector: s => `${s}[data-active="true"]`,
      }
    },
    
    // 兄弟元素
    (matcher) => {
      if (!matcher.startsWith('peer-focus:'))
        return matcher
      return {
        matcher: matcher.slice(11),
        selector: s => `.peer:focus ~ ${s}`,
      }
    },
  ],
})

// 使用自定义变体
function CustomVariants() {
  return (
    <div className="parent">
      <div className="parent-hover:bg-blue-500">
        Hover parent to see effect
      </div>
      
      <button data-active="true" className="data-active:bg-green-500">
        Active Button
      </button>
      
      <input className="peer" type="checkbox" />
      <div className="peer-focus:opacity-100 opacity-0">
        Checkbox focused
      </div>
    </div>
  )
}
```

### Transformers

```typescript
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import transformerCompileClass from '@unocss/transformer-compile-class'

export default defineConfig({
  transformers: [
    transformerDirectives(), // @apply指令
    transformerVariantGroup(), // 变体组
    transformerCompileClass(), // 编译类
  ],
})

// 使用@apply
<style>
.custom-button {
  @apply px-4 py-2 rounded bg-blue-500 text-white;
}

.custom-button:hover {
  @apply bg-blue-600;
}
</style>

// 使用变体组
function VariantGroups() {
  return (
    <div className="hover:(bg-blue-500 text-white scale-105)">
      Variant Group
    </div>
  )
}

// 编译类
function CompiledClass() {
  return (
    <div className=":uno: px-4 py-2 bg-blue-500 text-white rounded">
      This will be compiled to a single class
    </div>
  )
}
```

## 实战案例

### 组件库构建

```typescript
// Button组件
export const buttonPreset: Preset = {
  name: 'button-preset',
  shortcuts: {
    'btn': 'inline-flex items-center justify-center px-4 py-2 rounded font-medium transition-colors',
    'btn-sm': 'btn px-3 py-1.5 text-sm',
    'btn-lg': 'btn px-6 py-3 text-lg',
    'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
    'btn-secondary': 'btn bg-gray-500 text-white hover:bg-gray-600',
    'btn-outline': 'btn border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
  },
}

// Card组件
export const cardPreset: Preset = {
  name: 'card-preset',
  shortcuts: {
    'card': 'bg-white rounded-lg shadow-md p-6',
    'card-header': 'border-b pb-4 mb-4',
    'card-title': 'text-xl font-semibold',
    'card-body': 'text-gray-600',
    'card-footer': 'border-t pt-4 mt-4 flex justify-end gap-2',
  },
}

// 使用组件预设
function ComponentExample() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Card Title</h3>
      </div>
      <div className="card-body">
        Card content goes here
      </div>
      <div className="card-footer">
        <button className="btn-outline">Cancel</button>
        <button className="btn-primary">Confirm</button>
      </div>
    </div>
  )
}
```

### 响应式设计

```jsx
function ResponsiveLayout() {
  return (
    <div className="
      container mx-auto px-4
      grid gap-6
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
    ">
      {items.map(item => (
        <div key={item.id} className="
          card
          hover:(shadow-lg scale-105)
          transition-all
        ">
          <img className="
            w-full 
            h-48 
            object-cover 
            rounded-t-lg
          " src={item.image} alt={item.title} />
          
          <div className="p-4">
            <h3 className="
              text-lg font-semibold
              mb-2
              line-clamp-2
            ">
              {item.title}
            </h3>
            
            <p className="
              text-gray-600
              text-sm
              line-clamp-3
            ">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## 性能优化

### 扫描优化

```typescript
// uno.config.ts
export default defineConfig({
  // 指定扫描的文件
  content: {
    filesystem: [
      'src/**/*.{js,jsx,ts,tsx}',
    ],
  },
  
  // 排除不需要扫描的文件
  exclude: [
    'node_modules',
    'dist',
    '.git',
  ],
  
  // 自定义提取器
  extractors: [
    {
      extractor: (content) => {
        return content.match(/[\w-:[\]]+/g) || []
      },
      extensions: ['html', 'js', 'jsx', 'ts', 'tsx'],
    },
  ],
})
```

### 安全列表

```typescript
// 保护动态类名
export default defineConfig({
  safelist: [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
    // 或使用正则
    ...Array.from({ length: 10 }, (_, i) => `text-${i + 1}xl`),
  ],
})

// 在代码中使用
function DynamicColors({ color }) {
  return (
    <div className={`bg-${color}-500`}>
      Dynamic Color
    </div>
  )
}
```

## 最佳实践

### 1. 预设组织

```typescript
// presets/index.ts
import { Preset } from 'unocss'
import { buttonPreset } from './button'
import { cardPreset } from './card'
import { formPreset } from './form'

export const appPreset: Preset = {
  name: 'app-preset',
  presets: [
    buttonPreset,
    cardPreset,
    formPreset,
  ],
}

// uno.config.ts
import { appPreset } from './presets'

export default defineConfig({
  presets: [
    presetUno(),
    appPreset,
  ],
})
```

### 2. 类型安全

```typescript
// 生成类型定义
// package.json
{
  "scripts": {
    "uno:types": "unocss --write-transformed"
  }
}

// 使用类型安全的类名
type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  return (
    <button className={`btn-${variant} btn-${size}`}>
      {children}
    </button>
  )
}
```

### 3. 开发体验

```typescript
// 启用HMR
export default defineConfig({
  // 开发模式配置
  envMode: 'dev',
  
  // 启用Inspector
  inspector: true,
})

// VS Code扩展
// 安装 "UnoCSS" 扩展获得智能提示
```

## 总结

UnoCSS即时原子引擎要点：

1. **即时生成**：按需生成实际使用的样式
2. **属性化模式**：更灵活的样式编写方式
3. **变体组**：简化多状态样式
4. **图标集成**：内置图标系统
5. **预设系统**：高度可定制
6. **规则和快捷方式**：强大的扩展能力
7. **主题配置**：完整的主题系统
8. **性能优化**：极致的性能表现

UnoCSS是现代化、高性能的原子化CSS解决方案,适合追求极致性能和开发体验的项目。
