# 字体优化 (next/font)

## 课程概述

本课程深入探讨 Next.js 15 中的字体优化。`next/font` 提供了自动字体优化、自托管字体、零布局偏移等功能,确保最佳的性能和用户体验。

学习目标:
- 理解字体加载对性能的影响
- 掌握 next/font 的使用
- 学习 Google Fonts 集成
- 理解本地字体的使用
- 掌握字体优化策略
- 学习字体回退
- 理解可变字体
- 构建字体优化的最佳实践

---

## 一、字体优化基础

### 1.1 为什么需要字体优化

```typescript
// 传统字体加载的问题:
// 1. FOUT (Flash of Unstyled Text) - 无样式文本闪烁
// 2. FOIT (Flash of Invisible Text) - 不可见文本闪烁
// 3. 累积布局偏移 (CLS)
// 4. 外部字体请求延迟
// 5. 隐私问题

// ✗ 传统方式 (链接 Google Fonts)
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
  rel="stylesheet"
/>

// ✓ Next.js 方式
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**next/font 的优势:**

| 优势 | 说明 |
|------|------|
| 自动优化 | 自动内联字体CSS,消除额外请求 |
| 零布局偏移 | 使用 size-adjust 防止CLS |
| 自托管 | 自动下载并托管字体文件 |
| 隐私保护 | 不向 Google 发送用户数据 |
| 灵活配置 | 支持字重、样式、子集等 |
| 本地字体 | 支持自定义字体文件 |

### 1.2 工作原理

```
1. 构建时
   ↓
2. 下载字体文件
   ↓
3. 托管在项目中
   ↓
4. 生成优化的 CSS
   ↓
5. 运行时
   ↓
6. 直接从服务器加载
   ↓
7. 零外部请求
```

### 1.3 基本使用

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

// 加载字体
const inter = Inter({
  subsets: ['latin'], // 字符子集
  display: 'swap',    // 字体显示策略
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 二、Google Fonts

### 2.1 单个字体

```typescript
// app/layout.tsx
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 2.2 多个字重

```typescript
import { Inter } from 'next/font/google'

// 方式1: 数组
const inter = Inter({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// 方式2: 可变字体
const interVariable = Inter({
  subsets: ['latin'],
  display: 'swap',
  // 可变字体自动包含所有字重
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="font-normal">Normal text</div>
        <div className="font-bold">Bold text</div>
        {children}
      </body>
    </html>
  )
}
```

### 2.3 多种样式

```typescript
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Page() {
  return (
    <div className={playfair.className}>
      <p className="font-normal">Normal text</p>
      <p className="font-bold">Bold text</p>
      <p className="italic">Italic text</p>
      <p className="font-bold italic">Bold italic text</p>
    </div>
  )
}
```

### 2.4 多个字体

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google'

// 正文字体
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// 等宽字体
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}

// globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: var(--font-inter);
}

code {
  font-family: var(--font-roboto-mono);
}

// 使用
export default function Page() {
  return (
    <div>
      <p>This is Inter font</p>
      <code>This is Roboto Mono font</code>
    </div>
  )
}
```

### 2.5 常用 Google Fonts

```typescript
// 无衬线字体
import { Inter } from 'next/font/google'
import { Roboto } from 'next/font/google'
import { Open_Sans } from 'next/font/google'
import { Lato } from 'next/font/google'
import { Montserrat } from 'next/font/google'

// 衬线字体
import { Merriweather } from 'next/font/google'
import { Playfair_Display } from 'next/font/google'
import { Lora } from 'next/font/google'

// 等宽字体
import { Roboto_Mono } from 'next/font/google'
import { Source_Code_Pro } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'

// 手写字体
import { Caveat } from 'next/font/google'
import { Pacifico } from 'next/font/google'

// 完整示例
const inter = Inter({ subsets: ['latin'] })
const robotoMono = Roboto_Mono({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

export default function TypographyShowcase() {
  return (
    <div className="container mx-auto p-4">
      <h1 className={`${inter.className} text-4xl font-bold mb-4`}>
        Inter: Modern Sans-Serif
      </h1>
      
      <p className={`${playfair.className} text-2xl mb-4`}>
        Playfair Display: Elegant Serif
      </p>
      
      <code className={`${robotoMono.className} block p-4 bg-gray-100`}>
        Roboto Mono: Clean Monospace
      </code>
    </div>
  )
}
```

---

## 三、本地字体

### 3.1 使用本地字体文件

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const customFont = localFont({
  src: './fonts/CustomFont.woff2',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={customFont.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 3.2 多个字重

```typescript
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    {
      path: './fonts/CustomFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CustomFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/CustomFont-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={customFont.className}>
      <body>
        <p className="font-normal">Normal text</p>
        <p className="font-bold">Bold text</p>
        <p className="italic">Italic text</p>
        {children}
      </body>
    </html>
  )
}
```

### 3.3 可变字体

```typescript
import localFont from 'next/font/local'

const customVariable = localFont({
  src: './fonts/CustomFont-Variable.woff2',
  display: 'swap',
  weight: '100 900', // 支持的字重范围
  variable: '--font-custom',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={customVariable.variable}>
      <body>
        {children}
      </body>
    </html>
  )
}

// globals.css
body {
  font-family: var(--font-custom);
}

// 使用任意字重
export default function Page() {
  return (
    <div>
      <p style={{ fontWeight: 350 }}>Custom weight 350</p>
      <p style={{ fontWeight: 650 }}>Custom weight 650</p>
    </div>
  )
}
```

### 3.4 字体文件组织

```
app/
  fonts/
    CustomFont/
      CustomFont-Regular.woff2
      CustomFont-Bold.woff2
      CustomFont-Italic.woff2
    AnotherFont/
      AnotherFont.woff2
  layout.tsx
```

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    {
      path: './fonts/CustomFont/CustomFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CustomFont/CustomFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
})

const anotherFont = localFont({
  src: './fonts/AnotherFont/AnotherFont.woff2',
  variable: '--font-another',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${customFont.variable} ${anotherFont.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 四、字体配置选项

### 4.1 display 选项

```typescript
import { Inter } from 'next/font/google'

// swap: 立即显示回退字体,字体加载后切换
const interSwap = Inter({
  subsets: ['latin'],
  display: 'swap', // 推荐
})

// optional: 字体可选,短时间内加载则使用,否则使用回退
const interOptional = Inter({
  subsets: ['latin'],
  display: 'optional',
})

// block: 短时间内隐藏文本,字体加载后显示
const interBlock = Inter({
  subsets: ['latin'],
  display: 'block',
})

// fallback: 短时间内显示回退字体,字体加载后切换
const interFallback = Inter({
  subsets: ['latin'],
  display: 'fallback',
})

// auto: 浏览器决定
const interAuto = Inter({
  subsets: ['latin'],
  display: 'auto',
})
```

### 4.2 preload 选项

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  preload: true, // 默认 true,预加载字体
  display: 'swap',
})

// 禁用预加载 (不推荐)
const interNoPreload = Inter({
  subsets: ['latin'],
  preload: false,
  display: 'swap',
})
```

### 4.3 adjustFontFallback 选项

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  adjustFontFallback: true, // 默认 true,自动调整回退字体
  display: 'swap',
})

// 禁用自动调整
const interNoAdjust = Inter({
  subsets: ['latin'],
  adjustFontFallback: false,
  display: 'swap',
})

// 自定义回退
const interCustomFallback = Inter({
  subsets: ['latin'],
  fallback: ['system-ui', 'arial'],
  display: 'swap',
})
```

### 4.4 variable 选项

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS 变量名
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}

// globals.css
body {
  font-family: var(--font-inter), sans-serif;
}

h1, h2, h3 {
  font-family: var(--font-inter), sans-serif;
}
```

### 4.5 完整配置示例

```typescript
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

// Google Font 完整配置
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'],
})

// 本地字体完整配置
const customFont = localFont({
  src: [
    {
      path: './fonts/Custom-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Custom-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  fallback: ['Arial', 'sans-serif'],
})
```

---

## 五、实战案例

### 5.1 网站字体系统

```typescript
// app/layout.tsx
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'

// 主要字体 - 正文
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// 标题字体
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

// 代码字体
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}

// globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: var(--font-sans), sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-serif), serif;
  }
  
  code, pre {
    font-family: var(--font-mono), monospace;
  }
}

// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
}

export default config

// 使用
export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="font-serif text-5xl font-bold mb-8">
        Beautiful Typography
      </h1>
      
      <p className="font-sans text-lg mb-4">
        This is body text using Inter font.
      </p>
      
      <code className="font-mono block p-4 bg-gray-100 rounded">
        const example = "code example";
      </code>
    </div>
  )
}
```

### 5.2 多语言字体

```typescript
// app/layout.tsx
import { Inter, Noto_Sans_SC, Noto_Sans_JP } from 'next/font/google'

// 英文
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-en',
})

// 简体中文
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-zh',
  weight: ['400', '700'],
})

// 日文
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-ja',
  weight: ['400', '700'],
})

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansSC.variable} ${notoSansJP.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}

// app/[locale]/page.tsx
export default async function LocalePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  const fontClass = locale === 'zh' ? 'font-zh' :
                    locale === 'ja' ? 'font-ja' :
                    'font-en'
  
  return (
    <div className={`container mx-auto p-4 ${fontClass}`}>
      <h1 className="text-4xl font-bold mb-4">
        {locale === 'zh' && '欢迎'}
        {locale === 'ja' && 'ようこそ'}
        {locale === 'en' && 'Welcome'}
      </h1>
    </div>
  )
}
```

### 5.3 品牌字体系统

```typescript
// lib/fonts.ts
import localFont from 'next/font/local'

// 品牌主字体
export const brandPrimary = localFont({
  src: [
    {
      path: '../app/fonts/Brand-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../app/fonts/Brand-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../app/fonts/Brand-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../app/fonts/Brand-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-brand-primary',
  display: 'swap',
})

// 品牌副字体
export const brandSecondary = localFont({
  src: './app/fonts/BrandSecondary.woff2',
  variable: '--font-brand-secondary',
  display: 'swap',
})

// app/layout.tsx
import { brandPrimary, brandSecondary } from '@/lib/fonts'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${brandPrimary.variable} ${brandSecondary.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}

// components/branding.tsx
export function LogoText() {
  return (
    <h1 className="font-brand-primary text-4xl font-bold">
      Brand Name
    </h1>
  )
}

export function Tagline() {
  return (
    <p className="font-brand-secondary text-xl">
      Brand tagline goes here
    </p>
  )
}
```

### 5.4 条件字体加载

```typescript
'use client'
import { Inter, Playfair_Display } from 'next/font/google'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

export default function ConditionalFont() {
  const [useSerifFont, setUseSerifFont] = useState(false)
  
  // 从用户偏好读取
  useEffect(() => {
    const preference = localStorage.getItem('fontPreference')
    setUseSerifFont(preference === 'serif')
  }, [])
  
  const toggleFont = () => {
    const newPreference = !useSerifFont
    setUseSerifFont(newPreference)
    localStorage.setItem('fontPreference', newPreference ? 'serif' : 'sans')
  }
  
  return (
    <div className={useSerifFont ? playfair.className : inter.className}>
      <button
        onClick={toggleFont}
        className="mb-8 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Toggle Font: {useSerifFont ? 'Serif' : 'Sans-Serif'}
      </button>
      
      <article className="prose max-w-none">
        <h1>Typography Example</h1>
        <p>
          This text will change font based on user preference.
          The choice is preserved in localStorage.
        </p>
      </article>
    </div>
  )
}
```

---

## 六、性能优化

### 6.1 子集优化

```typescript
import { Inter, Noto_Sans_SC } from 'next/font/google'

// 只加载需要的字符子集
const inter = Inter({
  subsets: ['latin'], // 只加载拉丁字符
  display: 'swap',
})

// 中文字体 - 只加载简体中文
const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'], // 基础拉丁字符
  // 中文字体会自动包含中文字符
  weight: ['400', '700'],
  display: 'swap',
})

// 支持多个子集
const interExtended = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
})
```

### 6.2 字重优化

```typescript
import { Inter } from 'next/font/google'

// ✗ 加载所有字重 (不推荐)
const interAll = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

// ✓ 只加载需要的字重
const interOptimized = Inter({
  subsets: ['latin'],
  weight: ['400', '700'], // 只加载常规和粗体
})

// ✓ 使用可变字体 (最优)
const interVariable = Inter({
  subsets: ['latin'],
  // 可变字体包含所有字重,但文件大小相近
})
```

### 6.3 预加载策略

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true, // 预加载字体
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Next.js 自动添加 preload 链接 */}
        {/* <link rel="preload" as="font" ... /> */}
      </head>
      <body>{children}</body>
    </html>
  )
}

// 对于非关键字体,可以延迟加载
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // 不预加载
})
```

### 6.4 font-display 策略

```typescript
import { Inter } from 'next/font/google'

// 推荐: swap (最常用)
const interSwap = Inter({
  subsets: ['latin'],
  display: 'swap', // 立即显示回退字体,加载后切换
})

// 性能优先: optional
const interOptional = Inter({
  subsets: ['latin'],
  display: 'optional', // 100ms内加载则使用,否则使用回退
})

// 体验优先: block
const interBlock = Inter({
  subsets: ['latin'],
  display: 'block', // 最多3秒等待,然后显示回退
})
```

---

## 七、回退字体

### 7.1 系统字体栈

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
}

export default config
```

### 7.2 自定义回退

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  adjustFontFallback: true, // 自动调整回退字体以匹配主字体
  display: 'swap',
})
```

### 7.3 回退字体优化

```typescript
import localFont from 'next/font/local'

const customFont = localFont({
  src: './fonts/Custom.woff2',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // 调整回退字体的大小和间距
  display: 'swap',
})

// Next.js 会自动生成类似这样的 CSS:
// @font-face {
//   font-family: '__customFont_Fallback_abc123';
//   src: local('Arial');
//   ascent-override: 90%;
//   descent-override: 22%;
//   line-gap-override: 0%;
//   size-adjust: 107%;
// }
```

---

## 八、常见问题与解决

### 8.1 字体闪烁 (FOUT)

```typescript
// 问题: 页面加载时字体闪烁
// 解决: 使用 font-display: swap 和预加载

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 使用回退字体,加载后平滑切换
  preload: true,   // 预加载字体
})

// CSS 优化
// globals.css
body {
  font-family: var(--font-inter), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 8.2 布局偏移 (CLS)

```typescript
// 问题: 字体加载导致布局跳动
// 解决: 使用 adjustFontFallback

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  adjustFontFallback: true, // 自动调整回退字体
  display: 'swap',
})
```

### 8.3 字体未加载

```typescript
// 问题: Google Font 未加载
// 检查: 

// 1. 字体名称是否正确
import { Inter } from 'next/font/google' // ✓ 正确
// import { inter } from 'next/font/google' // ✗ 错误

// 2. className 是否应用
export default function Page() {
  const inter = Inter({ subsets: ['latin'] })
  
  return (
    <div className={inter.className}> {/* ✓ 正确 */}
      Content
    </div>
  )
}

// 3. 检查网络请求
// 打开 DevTools > Network,查看字体文件是否加载
```

### 8.4 本地字体路径错误

```typescript
// 问题: 本地字体无法加载
// 解决: 检查路径

import localFont from 'next/font/local'

// ✓ 正确 - 相对于当前文件
const font = localFont({
  src: './fonts/Custom.woff2'
})

// ✓ 正确 - 相对于 app 目录
const font2 = localFont({
  src: '../fonts/Custom.woff2'
})

// ✗ 错误 - 绝对路径
const font3 = localFont({
  src: '/public/fonts/Custom.woff2' // 不要使用 /public
})
```

---

## 九、最佳实践

### 9.1 字体选择指南

```typescript
// 1. 主要内容 - 使用易读的无衬线字体
import { Inter, Open_Sans, Roboto } from 'next/font/google'

// 2. 标题 - 使用有特色的字体
import { Playfair_Display, Montserrat } from 'next/font/google'

// 3. 代码 - 使用等宽字体
import { JetBrains_Mono, Source_Code_Pro } from 'next/font/google'

// 4. 数字 - 使用等宽数字字体
const inter = Inter({
  subsets: ['latin'],
  // 启用等宽数字
  variable: '--font-inter',
})

// globals.css
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

### 9.2 性能检查清单

```typescript
// ✓ 使用 next/font 而非外部链接
// ✓ 只加载需要的字重
// ✓ 使用 display: 'swap'
// ✓ 启用 adjustFontFallback
// ✓ 选择合适的子集
// ✓ 使用可变字体
// ✓ 预加载关键字体
// ✓ 优化回退字体栈
// ✓ 使用 CSS 变量
// ✓ 避免过多字体
```

### 9.3 可访问性

```typescript
// 1. 提供足够的字体大小
// globals.css
body {
  font-size: 16px; /* 最小 */
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
p { font-size: 1rem; }

// 2. 确保足够的对比度
.text {
  color: #1a1a1a; /* 深色文字 */
  background: #ffffff; /* 白色背景 */
}

// 3. 合理的行高
body {
  line-height: 1.6; /* 1.5-1.8 */
}

// 4. 支持用户字体大小偏好
html {
  font-size: 100%; /* 使用相对单位 */
}
```

### 9.4 学习资源

1. 官方文档
   - next/font: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
   - Google Fonts: https://fonts.google.com

2. 字体资源
   - Google Fonts
   - Adobe Fonts
   - Font Squirrel
   - Fontsource

3. 工具
   - Font Style Matcher
   - Wakamaifondue
   - Fontello

---

## 十、总结

### 10.1 关键要点

1. **使用 next/font**: 自动优化,零布局偏移
2. **选择合适的字体**: 易读性和品牌一致性
3. **优化加载**: 只加载需要的字重和子集
4. **配置回退**: 提供良好的降级体验
5. **性能监控**: 测试 CLS 和加载时间

### 10.2 何时使用

| 场景 | Google Font | 本地字体 |
|------|-------------|----------|
| 快速开发 | ✓ | |
| 品牌字体 | | ✓ |
| 自定义字体 | | ✓ |
| 中文字体 | ✓ | ✓ |
| 特殊字体 | | ✓ |

---

## 课后练习

1. 创建一个完整的字体系统
2. 实现多语言字体支持
3. 优化现有网站的字体加载
4. 配置品牌字体
5. 测试不同 font-display 策略的效果

通过本课程的学习,你应该能够熟练使用 Next.js 的字体优化功能,创建美观且性能优异的排版系统!

