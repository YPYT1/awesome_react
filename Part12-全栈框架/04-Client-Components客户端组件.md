# Client Components客户端组件

## 概述

客户端组件是在浏览器中渲染和执行的React组件。在Next.js App Router中,需要通过`'use client'`指令显式声明客户端组件。客户端组件支持React的所有特性,包括Hooks、事件处理、浏览器API等。本文将全面介绍客户端组件的使用方法和最佳实践。

## 'use client'指令

### 声明客户端组件

```typescript
// components/Counter.tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### 客户端边界

```typescript
// app/page.tsx (服务端组件)
import Counter from '@/components/Counter';

export default function Page() {
  return (
    <div>
      <h1>Server Component</h1>
      {/* Counter及其子组件都是客户端组件 */}
      <Counter />
    </div>
  );
}

// components/Counter.tsx
'use client';

import { useState } from 'react';
import ChildComponent from './ChildComponent';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      {/* ChildComponent自动成为客户端组件 */}
      <ChildComponent />
    </div>
  );
}

// components/ChildComponent.tsx
// 不需要'use client',因为父组件已声明
export default function ChildComponent() {
  return <div>Child Component</div>;
}
```

## 使用React Hooks

### useState

```typescript
'use client';

import { useState } from 'react';

export default function ToggleButton() {
  const [isOn, setIsOn] = useState(false);
  
  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
```

### useEffect

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <div>Seconds: {seconds}</div>;
}
```

### useContext

```typescript
// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
} | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
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

// components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}

// app/layout.tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### useRef

```typescript
'use client';

import { useRef, useEffect } from 'react';

export default function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  return <input ref={inputRef} type="text" />;
}
```

### useReducer

```typescript
'use client';

import { useReducer } from 'react';

type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

export default function CounterWithReducer() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

### useMemo和useCallback

```typescript
'use client';

import { useState, useMemo, useCallback } from 'react';

export default function ExpensiveComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 缓存计算结果
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...');
    return count * 2;
  }, [count]);
  
  // 缓存回调函数
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Expensive Value: {expensiveValue}</p>
      <button onClick={handleClick}>Increment</button>
      <input value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}
```

## 事件处理

### 基本事件

```typescript
'use client';

export default function EventHandlers() {
  const handleClick = () => {
    console.log('Clicked');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Value:', e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### 事件对象

```typescript
'use client';

export default function EventObjectExample() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked at:', e.clientX, e.clientY);
    console.log('Target:', e.currentTarget);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };
  
  return (
    <div>
      <button onClick={handleClick}>Click me</button>
      <input onKeyDown={handleKeyDown} />
    </div>
  );
}
```

### 事件冒泡和捕获

```typescript
'use client';

export default function EventBubbling() {
  const handleDivClick = () => {
    console.log('Div clicked');
  };
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡
    console.log('Button clicked');
  };
  
  return (
    <div onClick={handleDivClick}>
      <button onClick={handleButtonClick}>Click me</button>
    </div>
  );
}
```

## 浏览器API

### Local Storage

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function LocalStorageExample() {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    const stored = localStorage.getItem('myKey');
    if (stored) {
      setValue(stored);
    }
  }, []);
  
  const handleSave = () => {
    localStorage.setItem('myKey', value);
  };
  
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Window API

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function WindowSizeExample() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return (
    <div>
      Window size: {size.width} x {size.height}
    </div>
  );
}
```

### Geolocation

```typescript
'use client';

import { useState } from 'react';

export default function GeolocationExample() {
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
    }
  };
  
  return (
    <div>
      <button onClick={getLocation}>Get Location</button>
      {position && (
        <p>
          Latitude: {position.latitude}, Longitude: {position.longitude}
        </p>
      )}
    </div>
  );
}
```

## 数据获取

### 使用fetch

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function DataFetching() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 使用SWR

```typescript
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SWRExample() {
  const { data, error, isLoading } = useSWR(
    'https://api.example.com/data',
    fetcher
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  
  return <div>{data.title}</div>;
}
```

### 使用TanStack Query

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export default function TanStackQueryExample() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('https://api.example.com/todos').then(r => r.json()),
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  
  return (
    <ul>
      {data.map((todo: any) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

## 表单处理

### 受控组件

```typescript
'use client';

import { useState } from 'react';

export default function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 使用React Hook Form

```typescript
'use client';

import { useForm } from 'react-hook-form';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ReactHookFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} placeholder="Name" />
      {errors.name && <span>Name is required</span>}
      
      <input
        {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
        placeholder="Email"
      />
      {errors.email && <span>Valid email is required</span>}
      
      <textarea {...register('message')} placeholder="Message" />
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 第三方库集成

### Chart.js

```typescript
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartExample() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };
  
  return <Line data={data} />;
}
```

### Map库

```typescript
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapExample() {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[51.505, -0.09]}>
        <Popup>A popup</Popup>
      </Marker>
    </MapContainer>
  );
}
```

## 动画

### Framer Motion

```typescript
'use client';

import { motion } from 'framer-motion';

export default function AnimationExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Animated content
    </motion.div>
  );
}
```

### CSS动画

```typescript
'use client';

import { useState } from 'react';
import styles from './Animation.module.css';

export default function CSSAnimationExample() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  return (
    <div
      className={isAnimating ? styles.animate : ''}
      onClick={() => setIsAnimating(!isAnimating)}
    >
      Click to animate
    </div>
  );
}
```

## 性能优化

### React.memo

```typescript
'use client';

import React, { useState } from 'react';

const ExpensiveComponent = React.memo(({ value }: { value: number }) => {
  console.log('ExpensiveComponent rendered');
  return <div>Value: {value}</div>;
});

export default function MemoExample() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  return (
    <div>
      <ExpensiveComponent value={count} />
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <input value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}
```

### 虚拟化列表

```typescript
'use client';

import { FixedSizeList } from 'react-window';

export default function VirtualizedList() {
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>{items[index]}</div>
  );
  
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

## 最佳实践

### 1. 最小化客户端组件

```typescript
// ✅ 好 - 只将需要交互的部分设为客户端组件
// app/page.tsx (服务端)
import ClientButton from '@/components/ClientButton';

export default async function Page() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <ClientButton />
    </div>
  );
}

// ❌ 不好 - 整个页面都是客户端组件
'use client';

export default function Page() {
  // ...
}
```

### 2. 将Context Provider设为客户端组件

```typescript
// ✅ 好
// app/providers.tsx
'use client';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// app/layout.tsx (服务端)
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3. 使用'use server'标记服务端函数

```typescript
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  await db.user.create({ name });
}

// components/Form.tsx
'use client';

import { createUser } from '@/app/actions';

export default function Form() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

客户端组件提供了React的全部功能,合理使用可以构建出交互丰富的用户界面。

