# Tailwind组件库(shadcn-ui-daisyUI)

## 概述

虽然Tailwind CSS提供了强大的工具类,但从零开始构建完整的UI组件仍然需要大量时间。幸运的是,社区提供了许多基于Tailwind的组件库,其中shadcn/ui和DaisyUI是最受欢迎的两个。本文将深入探讨这两个组件库的使用方法、特点对比和最佳实践。

## shadcn/ui

### 什么是shadcn/ui

shadcn/ui不是传统意义上的组件库,而是一个可复制粘贴的组件集合。它提供了精美设计的组件代码,你可以直接复制到项目中并完全拥有代码控制权。

### 安装和配置

```bash
# 使用CLI初始化
npx shadcn-ui@latest init

# 回答配置问题
# ✔ Would you like to use TypeScript (recommended)? yes
# ✔ Which style would you like to use? › Default
# ✔ Which color would you like to use as base color? › Slate
# ✔ Where is your global CSS file? › src/index.css
# ✔ Would you like to use CSS variables for colors? › yes
# ✔ Where is your tailwind.config.js located? › tailwind.config.js
# ✔ Configure the import alias for components: › @/components
# ✔ Configure the import alias for utils: › @/lib/utils
```

```typescript
// 生成的配置文件

// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

// src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### 添加组件

```bash
# 添加单个组件
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog

# 添加多个组件
npx shadcn-ui@latest add button card dialog

# 列出所有可用组件
npx shadcn-ui@latest add
```

### 核心组件使用

```tsx
// Button组件
import { Button } from "@/components/ui/button"

function ButtonExample() {
  return (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔍</Button>
    </div>
  )
}

// Card组件
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  )
}

// Dialog组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Form组件
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
})

function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

// Table组件
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function TableExample() {
  const data = [
    { id: 1, name: "John", email: "john@example.com" },
    { id: 2, name: "Jane", email: "jane@example.com" },
  ]

  return (
    <Table>
      <TableCaption>A list of users</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Toast通知
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

function ToastExample() {
  const { toast } = useToast()

  return (
    <Button
      onClick={() => {
        toast({
          title: "Scheduled: Catch up",
          description: "Friday, February 10, 2023 at 5:57 PM",
          action: (
            <ToastAction altText="Undo">Undo</ToastAction>
          ),
        })
      }}
    >
      Show Toast
    </Button>
  )
}
```

### 自定义主题

```typescript
// lib/themes.ts
export const themes = {
  zinc: {
    light: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      primary: "240 5.9% 10%",
      // ...
    },
    dark: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      primary: "0 0% 98%",
      // ...
    },
  },
  rose: {
    light: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      primary: "346.8 77.2% 49.8%",
      // ...
    },
    dark: {
      background: "20 14.3% 4.1%",
      foreground: "0 0% 95%",
      primary: "346.8 77.2% 49.8%",
      // ...
    },
  },
}

// 应用主题
function applyTheme(theme: keyof typeof themes, mode: 'light' | 'dark') {
  const colors = themes[theme][mode]
  const root = document.documentElement
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}
```

## DaisyUI

### 什么是DaisyUI

DaisyUI是一个基于Tailwind CSS的组件库,提供了预设计的组件类名。与shadcn/ui不同,DaisyUI作为Tailwind插件安装,组件通过类名使用。

### 安装和配置

```bash
# 安装DaisyUI
npm install -D daisyui@latest

# 或使用特定主题
npm install -D daisyui@latest @tailwindcss/typography
```

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    prefix: "",
    logs: true,
  },
}
```

### 核心组件

```jsx
// Button组件
function DaisyButtonExample() {
  return (
    <div className="flex gap-2">
      <button className="btn">Default</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-accent">Accent</button>
      <button className="btn btn-ghost">Ghost</button>
      <button className="btn btn-link">Link</button>
      
      <button className="btn btn-sm">Small</button>
      <button className="btn btn-lg">Large</button>
      
      <button className="btn btn-outline">Outline</button>
      <button className="btn btn-outline btn-primary">Outline Primary</button>
      
      <button className="btn btn-square">
        <svg>...</svg>
      </button>
      <button className="btn btn-circle">
        <svg>...</svg>
      </button>
      
      <button className="btn loading">Loading</button>
      <button className="btn" disabled>Disabled</button>
    </div>
  )
}

// Card组件
function DaisyCardExample() {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure><img src="/image.jpg" alt="Album" /></figure>
      <div className="card-body">
        <h2 className="card-title">
          Card Title
          <div className="badge badge-secondary">NEW</div>
        </h2>
        <p>Card description goes here</p>
        <div className="card-actions justify-end">
          <div className="badge badge-outline">Fashion</div>
          <div className="badge badge-outline">Products</div>
        </div>
      </div>
    </div>
  )
}

// Modal组件
function DaisyModalExample() {
  return (
    <>
      <label htmlFor="my-modal" className="btn">Open Modal</label>
      
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Modal Title</h3>
          <p className="py-4">Modal content goes here</p>
          <div className="modal-action">
            <label htmlFor="my-modal" className="btn">Close</label>
          </div>
        </div>
      </div>
    </>
  )
}

// Form组件
function DaisyFormExample() {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Email</span>
        <span className="label-text-alt">Alt label</span>
      </label>
      <input 
        type="text" 
        placeholder="Type here" 
        className="input input-bordered w-full max-w-xs" 
      />
      <label className="label">
        <span className="label-text-alt">Helper text</span>
        <span className="label-text-alt">Alt label</span>
      </label>
    </div>
  )
}

// Alert组件
function DaisyAlertExample() {
  return (
    <div className="space-y-4">
      <div className="alert alert-info">
        <svg>...</svg>
        <span>Info alert</span>
      </div>
      
      <div className="alert alert-success">
        <svg>...</svg>
        <span>Success alert</span>
      </div>
      
      <div className="alert alert-warning">
        <svg>...</svg>
        <span>Warning alert</span>
      </div>
      
      <div className="alert alert-error">
        <svg>...</svg>
        <span>Error alert</span>
      </div>
    </div>
  )
}

// Navbar组件
function DaisyNavbarExample() {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">daisyUI</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><a>Link</a></li>
          <li>
            <details>
              <summary>Parent</summary>
              <ul className="p-2 bg-base-100">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  )
}

// Drawer组件
function DaisyDrawerExample() {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
          Open drawer
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li><a>Sidebar Item 1</a></li>
          <li><a>Sidebar Item 2</a></li>
        </ul>
      </div>
    </div>
  )
}

// Table组件
function DaisyTableExample() {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            <td>Cy Ganderton</td>
            <td>Quality Control Specialist</td>
            <td>Blue</td>
          </tr>
          <tr className="hover">
            <th>2</th>
            <td>Hart Hagerty</td>
            <td>Desktop Support Technician</td>
            <td>Purple</td>
          </tr>
          <tr>
            <th>3</th>
            <td>Brice Swyre</td>
            <td>Tax Accountant</td>
            <td>Red</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

### 主题系统

```javascript
// 使用预设主题
module.exports = {
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}

// 自定义主题
module.exports = {
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#3b82f6",
          "secondary": "#f000b8",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "dark",
      "cupcake",
    ],
  },
}

// 在React中切换主题
function ThemeSwitch() {
  const [theme, setTheme] = React.useState('light')
  
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  return (
    <select 
      className="select select-bordered"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="cupcake">Cupcake</option>
      <option value="mytheme">My Theme</option>
    </select>
  )
}

// 使用主题颜色
function ThemeColorExample() {
  return (
    <div className="bg-primary text-primary-content p-4">
      Primary themed content
    </div>
  )
}
```

## 对比与选择

### shadcn/ui vs DaisyUI

```typescript
// 特性对比

interface Comparison {
  feature: string;
  shadcn: string;
  daisyui: string;
}

const comparison: Comparison[] = [
  {
    feature: "安装方式",
    shadcn: "CLI复制组件到项目",
    daisyui: "npm包作为Tailwind插件"
  },
  {
    feature: "代码控制",
    shadcn: "完全控制组件代码",
    daisyui: "通过配置和类名控制"
  },
  {
    feature: "自定义程度",
    shadcn: "极高，可修改任何代码",
    daisyui: "中等，通过主题和CSS变量"
  },
  {
    feature: "类型安全",
    shadcn: "TypeScript原生支持",
    daisyui: "通过类名，无类型提示"
  },
  {
    feature: "组件数量",
    shadcn: "30+核心组件",
    daisyui: "50+组件"
  },
  {
    feature: "主题系统",
    shadcn: "CSS变量，需手动实现",
    daisyui: "内置29个主题"
  },
  {
    feature: "文件大小",
    shadcn: "只包含使用的组件",
    daisyui: "包含所有组件样式"
  },
  {
    feature: "学习曲线",
    shadcn: "需要理解组件实现",
    daisyui: "简单，记住类名即可"
  },
  {
    feature: "适用场景",
    shadcn: "需要高度定制的项目",
    daisyui: "快速原型和标准UI"
  }
]
```

### 选择建议

```typescript
// 选择shadcn/ui的情况
const useShadcn = {
  scenarios: [
    "需要完全控制组件代码",
    "TypeScript项目",
    "需要高度自定义的UI",
    "团队熟悉React和Tailwind",
    "长期维护的企业项目",
    "需要无障碍访问优化",
    "使用Radix UI等headless UI库"
  ],
  
  example: `
    // shadcn/ui适合这样的场景
    import { Button } from "@/components/ui/button"
    
    // 可以直接修改组件源码
    export function CustomButton() {
      return (
        <Button 
          className="custom-animation"
          // 添加自定义props
        >
          Click me
        </Button>
      )
    }
  `
}

// 选择DaisyUI的情况
const useDaisyUI = {
  scenarios: [
    "快速开发原型",
    "需要大量预设组件",
    "喜欢使用类名的开发方式",
    "需要多个现成主题",
    "团队成员Tailwind经验丰富",
    "内容驱动的网站",
    "不需要深度定制"
  ],
  
  example: `
    // DaisyUI适合这样的场景
    function QuickPrototype() {
      return (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">快速原型</h2>
            <p>使用预设类名快速构建</p>
            <div className="card-actions">
              <button className="btn btn-primary">Action</button>
            </div>
          </div>
        </div>
      )
    }
  `
}
```

## 实战案例

### 使用shadcn/ui构建Dashboard

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"

export function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <svg>...</svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            
            {/* 更多统计卡片 */}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 使用DaisyUI构建电商页面

```jsx
function EcommercePage() {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Shop</a>
        </div>
        <div className="flex-none gap-2">
          <div className="form-control">
            <input 
              type="text" 
              placeholder="Search" 
              className="input input-bordered w-24 md:w-auto" 
            />
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg className="h-5 w-5">...</svg>
                <span className="badge badge-sm indicator-item">8</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Hero */}
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <img src="/images/stock/photo-1635805737707-575885ab0820.jpg" 
               className="max-w-sm rounded-lg shadow-2xl" />
          <div>
            <h1 className="text-5xl font-bold">Box Office News!</h1>
            <p className="py-6">Provident cupiditate voluptatem...</p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="card bg-base-100 shadow-xl">
              <figure>
                <img src={product.image} alt={product.name} />
              </figure>
              <div className="card-body">
                <h2 className="card-title">
                  {product.name}
                  {product.isNew && <div className="badge badge-secondary">NEW</div>}
                </h2>
                <p>{product.description}</p>
                <div className="card-actions justify-end">
                  <div className="badge badge-outline">${product.price}</div>
                  <button className="btn btn-primary btn-sm">Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## 混合使用

### 结合shadcn/ui和DaisyUI

```tsx
// 可以在同一个项目中同时使用两者

// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // shadcn/ui主题
      colors: {
        border: "hsl(var(--border))",
        // ...
      },
    },
  },
  plugins: [
    require("daisyui"), // DaisyUI插件
  ],
  daisyui: {
    prefix: "daisy-", // 添加前缀避免冲突
  },
}

// 使用示例
function HybridComponent() {
  return (
    <div>
      {/* 使用shadcn/ui的对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          {/* 使用DaisyUI的表单 */}
          <div className="daisy-form-control">
            <label className="daisy-label">
              <span className="daisy-label-text">Email</span>
            </label>
            <input 
              type="text" 
              className="daisy-input daisy-input-bordered" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## 最佳实践

### 1. 组件抽象

```tsx
// 基于shadcn/ui创建应用级组件
import { Button as ShadcnButton } from "@/components/ui/button"

interface AppButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  loading?: boolean;
}

export function AppButton({ loading, children, ...props }: AppButtonProps) {
  return (
    <ShadcnButton disabled={loading} {...props}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : children}
    </ShadcnButton>
  )
}

// 基于DaisyUI创建应用级组件
export function AppCard({ children, className = "", ...props }) {
  return (
    <div className={`card bg-base-100 shadow-xl ${className}`} {...props}>
      {children}
    </div>
  )
}
```

### 2. 主题一致性

```typescript
// 统一主题管理
export const themeConfig = {
  shadcn: {
    colors: {
      primary: "hsl(221.2 83.2% 53.3%)",
      secondary: "hsl(210 40% 96.1%)",
    },
  },
  daisy: {
    mytheme: {
      primary: "#3b82f6",
      secondary: "#f0f4f8",
    },
  },
}

// 确保两个库的主题颜色一致
```

### 3. 性能优化

```typescript
// 按需导入shadcn/ui组件
import { Button } from "@/components/ui/button"
// 而不是 import * as UI from "@/components/ui"

// DaisyUI配置优化
module.exports = {
  daisyui: {
    themes: ["light", "dark"], // 只使用需要的主题
    styled: true,
    base: true,
    utils: true,
    logs: false, // 生产环境关闭日志
  },
}
```

## 总结

Tailwind组件库选择要点：

1. **shadcn/ui**：代码可控、TypeScript友好、高度可定制
2. **DaisyUI**：快速开发、丰富主题、简单易用
3. **对比选择**：根据项目需求选择合适的库
4. **混合使用**：可以同时使用两者的优势
5. **最佳实践**：组件抽象、主题一致、性能优化

选择合适的组件库能显著提升开发效率和代码质量。
