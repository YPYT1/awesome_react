# React与TypeScript集成

## 概述

React与TypeScript的结合能够带来类型安全、更好的IDE支持和代码可维护性。本文将全面介绍如何在React项目中使用TypeScript,包括项目配置、组件类型定义、Hooks类型定义等。

## 项目搭建

### 使用Create React App

```bash
# 创建TypeScript项目
npx create-react-app my-app --template typescript

# 或使用已有项目添加TypeScript
npm install --save typescript @types/node @types/react @types/react-dom @types/jest
```

### 使用Vite

```bash
# 创建Vite + React + TypeScript项目
npm create vite@latest my-app -- --template react-ts

cd my-app
npm install
npm run dev
```

### 使用Next.js

```bash
# 创建Next.js + TypeScript项目
npx create-next-app@latest my-app --typescript

# 或
npm create next-app@latest my-app --ts
```

## tsconfig.json配置

### React项目专用配置

```json
{
  "compilerOptions": {
    // 目标JavaScript版本
    "target": "ES2020",
    
    // 使用的JavaScript库
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    
    // JSX支持
    "jsx": "react-jsx",
    
    // 模块系统
    "module": "ESNext",
    "moduleResolution": "node",
    
    // 严格模式
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // 额外检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // 模块解析
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    
    // 输出
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    // 路径映射
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"]
    },
    
    // 其他
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "build"]
}
```

## 函数组件类型定义

### 基本函数组件

```typescript
// 方式1: 使用React.FC
import React from 'react';

interface GreetingProps {
  name: string;
  age?: number;
}

const Greeting: React.FC<GreetingProps> = ({ name, age }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>Age: {age}</p>}
    </div>
  );
};

// 方式2: 直接定义函数(推荐)
const Greeting2 = ({ name, age }: GreetingProps) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>Age: {age}</p>}
    </div>
  );
};

// 方式3: 明确返回类型
const Greeting3 = ({ name, age }: GreetingProps): JSX.Element => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>Age: {age}</p>}
    </div>
  );
};

// 方式4: ReactElement
const Greeting4 = ({ name, age }: GreetingProps): React.ReactElement => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>Age: {age}</p>}
    </div>
  );
};
```

### React.FC vs 直接定义

```typescript
// React.FC的特点
// 1. 自动包含children
// 2. 自动包含默认的React组件属性
// 3. 返回类型被推断

// 直接定义的特点
// 1. 更灵活
// 2. 需要手动定义children
// 3. 更明确的类型控制

// 推荐: 直接定义
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Button = ({ label, onClick, disabled, children }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
      {children}
    </button>
  );
};
```

### Children类型

```typescript
import React from 'react';

// ReactNode - 最常用,接受任何可渲染的内容
interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return <div className="container">{children}</div>;
};

// ReactElement - 只接受单个React元素
interface WrapperProps {
  children: React.ReactElement;
}

const Wrapper = ({ children }: WrapperProps) => {
  return <div className="wrapper">{children}</div>;
};

// ReactElement数组
interface ListProps {
  children: React.ReactElement[];
}

// 函数children
interface RenderProps {
  children: (data: string) => React.ReactNode;
}

const DataProvider = ({ children }: RenderProps) => {
  const data = 'Hello';
  return <>{children(data)}</>;
};

// 使用
<DataProvider>
  {(data) => <div>{data}</div>}
</DataProvider>
```

## 类组件类型定义

### 基本类组件

```typescript
import React, { Component } from 'react';

// Props接口
interface CounterProps {
  initialCount: number;
  onCountChange?: (count: number) => void;
}

// State接口
interface CounterState {
  count: number;
}

// 类组件
class Counter extends Component<CounterProps, CounterState> {
  // 构造函数
  constructor(props: CounterProps) {
    super(props);
    this.state = {
      count: props.initialCount,
    };
  }

  // 方法
  increment = () => {
    this.setState(
      (prevState) => ({ count: prevState.count + 1 }),
      () => {
        this.props.onCountChange?.(this.state.count);
      }
    );
  };

  decrement = () => {
    this.setState((prevState) => ({ count: prevState.count - 1 }));
  };

  // 渲染
  render() {
    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={this.increment}>+</button>
        <button onClick={this.decrement}>-</button>
      </div>
    );
  }
}

export default Counter;
```

### 生命周期方法

```typescript
class LifecycleComponent extends Component<Props, State> {
  componentDidMount() {
    // 类型安全的生命周期方法
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevProps.id !== this.props.id) {
      // ...
    }
  }

  componentWillUnmount() {
    // 清理
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return nextProps.id !== this.props.id;
  }

  static getDerivedStateFromProps(props: Readonly<Props>, state: State): Partial<State> | null {
    return null;
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error, errorInfo);
  }
}
```

### 默认Props

```typescript
// 方式1: 使用defaultProps
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

class Button extends Component<ButtonProps> {
  static defaultProps = {
    variant: 'primary' as const,
    size: 'medium' as const,
  };

  render() {
    const { label, variant, size } = this.props;
    return (
      <button className={`btn-${variant} btn-${size}`}>
        {label}
      </button>
    );
  }
}

// 方式2: 使用解构默认值(推荐)
const Button2 = ({ 
  label, 
  variant = 'primary', 
  size = 'medium' 
}: ButtonProps) => {
  return (
    <button className={`btn-${variant} btn-${size}`}>
      {label}
    </button>
  );
};
```

## 事件处理

### 事件类型

```typescript
import React from 'react';

const EventsExample = () => {
  // 鼠标事件
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked', e.currentTarget);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Double clicked', e.clientX, e.clientY);
  };

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  // 表单事件
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Value:', e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  // 焦点事件
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input focused');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input blurred');
  };

  // 拖拽事件
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Drag started');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('Dropped');
  };

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
      <div onDoubleClick={handleDoubleClick}>Double click</div>
      <input onKeyDown={handleKeyDown} onChange={handleChange} />
      <form onSubmit={handleSubmit}>
        <input onFocus={handleFocus} onBlur={handleBlur} />
        <button type="submit">Submit</button>
      </form>
      <div
        draggable
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      >
        Drag me
      </div>
    </div>
  );
};
```

### 事件处理器类型

```typescript
// 作为Props传递
interface FormProps {
  onSubmit: (data: FormData) => void;
  onChange: (value: string) => void;
}

const Form = ({ onSubmit, onChange }: FormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => onChange(e.target.value)} />
    </form>
  );
};

// 使用React.EventHandler
interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ onClick }: ButtonProps) => {
  return <button onClick={onClick}>Click</button>;
};
```

## Refs类型定义

### useRef

```typescript
import { useRef, useEffect } from 'react';

const RefExample = () => {
  // DOM引用
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // 可变值
  const countRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 访问DOM元素
    inputRef.current?.focus();
    
    // 清理定时器
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div ref={divRef}>
      <input ref={inputRef} />
    </div>
  );
};
```

### forwardRef

```typescript
import { forwardRef, useRef } from 'react';

// 基本forwardRef
interface InputProps {
  placeholder?: string;
}

const FancyInput = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder }, ref) => {
    return <input ref={ref} placeholder={placeholder} className="fancy-input" />;
  }
);

// 使用
const Parent = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <FancyInput ref={inputRef} placeholder="Enter text" />
      <button onClick={handleClick}>Focus Input</button>
    </div>
  );
};
```

### useImperativeHandle

```typescript
import { forwardRef, useImperativeHandle, useRef } from 'react';

// 定义暴露的方法
interface VideoHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer = forwardRef<VideoHandle, VideoPlayerProps>(
  ({ src }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      play() {
        videoRef.current?.play();
      },
      pause() {
        videoRef.current?.pause();
      },
      seek(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
    }));

    return <video ref={videoRef} src={src} />;
  }
);

// 使用
const App = () => {
  const videoRef = useRef<VideoHandle>(null);

  return (
    <div>
      <VideoPlayer ref={videoRef} src="video.mp4" />
      <button onClick={() => videoRef.current?.play()}>Play</button>
      <button onClick={() => videoRef.current?.pause()}>Pause</button>
      <button onClick={() => videoRef.current?.seek(10)}>Seek to 10s</button>
    </div>
  );
};
```

## Context类型定义

### 基本Context

```typescript
import { createContext, useContext, useState } from 'react';

// 定义Context类型
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 创建Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider组件
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 使用
const ThemedComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`theme-${theme}`}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
```

### 复杂Context

```typescript
import { createContext, useContext, useReducer } from 'react';

// State类型
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Action类型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' };

// Context类型
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // API调用
      const user = await fakeLogin(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 辅助函数
async function fakeLogin(email: string, password: string): Promise<User> {
  return {
    id: '1',
    name: 'John Doe',
    email,
  };
}
```

## 泛型组件

### 泛型函数组件

```typescript
// List组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

<List items={users} renderItem={(user) => <span>{user.name}</span>} />

// Select组件
interface SelectProps<T> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
}

function Select<T>({
  options,
  value,
  onChange,
  getLabel,
  getValue,
}: SelectProps<T>) {
  return (
    <select
      value={getValue(value)}
      onChange={(e) => {
        const option = options.find(
          (opt) => getValue(opt).toString() === e.target.value
        );
        if (option) {
          onChange(option);
        }
      }}
    >
      {options.map((option) => (
        <option key={getValue(option)} value={getValue(option)}>
          {getLabel(option)}
        </option>
      ))}
    </select>
  );
}

// 使用
interface Country {
  code: string;
  name: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
];

const [selected, setSelected] = useState<Country>(countries[0]);

<Select
  options={countries}
  value={selected}
  onChange={setSelected}
  getLabel={(country) => country.name}
  getValue={(country) => country.code}
/>
```

## 高阶组件(HOC)类型

```typescript
import { ComponentType } from 'react';

// 简单HOC
function withLoading<P extends object>(
  Component: ComponentType<P>
): ComponentType<P & { isLoading: boolean }> {
  return ({ isLoading, ...props }: P & { isLoading: boolean }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...(props as P)} />;
  };
}

// 使用
interface DataProps {
  data: string[];
}

const DataList = ({ data }: DataProps) => (
  <ul>
    {data.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const DataListWithLoading = withLoading(DataList);

<DataListWithLoading data={['a', 'b']} isLoading={false} />

// 复杂HOC
interface InjectedProps {
  user: User | null;
}

function withAuth<P extends InjectedProps>(
  Component: ComponentType<P>
): ComponentType<Omit<P, keyof InjectedProps>> {
  return (props: Omit<P, keyof InjectedProps>) => {
    const { state } = useAuth();
    
    if (!state.isAuthenticated) {
      return <div>Please login</div>;
    }
    
    return <Component {...(props as P)} user={state.user} />;
  };
}

// 使用
interface ProfileProps extends InjectedProps {
  title: string;
}

const Profile = ({ user, title }: ProfileProps) => (
  <div>
    <h1>{title}</h1>
    <p>{user?.name}</p>
  </div>
);

const ProtectedProfile = withAuth(Profile);

<ProtectedProfile title="My Profile" />
```

## 实用类型工具

### React内置类型

```typescript
// ComponentProps - 获取组件的Props类型
type ButtonProps = React.ComponentProps<'button'>;
type InputProps = React.ComponentProps<'input'>;

// ComponentPropsWithoutRef - 不包含ref的Props
type DivProps = React.ComponentPropsWithoutRef<'div'>;

// ComponentPropsWithRef - 包含ref的Props
type SpanProps = React.ComponentPropsWithRef<'span'>;

// ElementType - 组件类型
const Container = <T extends React.ElementType = 'div'>({
  as,
  ...props
}: { as?: T } & React.ComponentPropsWithoutRef<T>) => {
  const Component = as || 'div';
  return <Component {...props} />;
};

<Container as="section" />
<Container as="article" />
```

### 自定义类型工具

```typescript
// 提取组件Props
type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

// 组件Props的某个属性类型
type OnClick = ExtractProps<typeof Button>['onClick'];

// 可选Props
type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface UserFormProps {
  name: string;
  email: string;
  age: number;
}

type OptionalUserForm = OptionalProps<UserFormProps, 'age'>;
// { name: string; email: string; age?: number }
```

TypeScript与React的集成能够显著提升代码质量和开发体验,合理使用类型系统是构建大型React应用的基础。

