# TypeScript最佳实践

## 概述

TypeScript在React项目中能够带来类型安全、更好的IDE支持和代码可维护性。但要充分发挥TypeScript的优势,需要遵循一系列最佳实践。本文将全面介绍React TypeScript开发中的最佳实践和常见模式。

## 类型定义最佳实践

### 优先使用类型推断

```typescript
// ✅ 好 - 让TypeScript推断类型
const [count, setCount] = useState(0);
const name = 'Alice';
const users = ['Alice', 'Bob'];

// ❌ 不好 - 不必要的显式类型
const [count, setCount] = useState<number>(0);
const name: string = 'Alice';
const users: string[] = ['Alice', 'Bob'];

// ✅ 好 - 只在必要时指定类型
const [user, setUser] = useState<User | null>(null);
const [data, setData] = useState<Data[]>([]);
```

### 使用接口而非Type(对象类型)

```typescript
// ✅ 好 - 使用interface定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ 不好 - 对象类型使用type
type User = {
  id: string;
  name: string;
  email: string;
};

// ✅ 好 - type用于联合类型、元组等
type Status = 'idle' | 'loading' | 'success' | 'error';
type Point = [number, number];
type Callback = (data: string) => void;
```

### 避免使用any

```typescript
// ❌ 不好 - 使用any失去类型安全
const handleData = (data: any) => {
  console.log(data.name); // 可能出错
};

// ✅ 好 - 使用unknown并进行类型检查
const handleData = (data: unknown) => {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    console.log((data as { name: string }).name);
  }
};

// ✅ 更好 - 定义具体类型
interface Data {
  name: string;
}

const handleData = (data: Data) => {
  console.log(data.name);
};
```

### 使用字面量类型

```typescript
// ✅ 好 - 使用字面量类型
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
}

// ❌ 不好 - 使用string
interface ButtonProps {
  variant: string;
  size: string;
}

// ✅ 好 - 使用const断言
const Colors = {
  Red: '#ff0000',
  Green: '#00ff00',
  Blue: '#0000ff',
} as const;

type ColorValue = typeof Colors[keyof typeof Colors];
```

## Props设计最佳实践

### 明确的Props类型

```typescript
// ✅ 好 - 清晰的Props定义
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

const UserCard = ({ user, onEdit, onDelete, showActions = true }: UserCardProps) => {
  return (
    <div>
      <h2>{user.name}</h2>
      {showActions && (
        <div>
          <button onClick={() => onEdit(user.id)}>Edit</button>
          <button onClick={() => onDelete(user.id)}>Delete</button>
        </div>
      )}
    </div>
  );
};

// ❌ 不好 - 模糊的Props
const UserCard = (props: any) => {
  // ...
};
```

### 可选Props的默认值

```typescript
// ✅ 好 - 使用解构默认值
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const Button = ({ 
  label, 
  variant = 'primary', 
  size = 'medium' 
}: ButtonProps) => {
  return <button className={`btn-${variant} btn-${size}`}>{label}</button>;
};

// ❌ 不好 - 在组件内部检查
const Button = ({ label, variant, size }: ButtonProps) => {
  const finalVariant = variant || 'primary';
  const finalSize = size || 'medium';
  // ...
};
```

### Props的文档化

```typescript
/**
 * Button组件
 * 
 * @example
 * ```tsx
 * <Button
 *   label="Submit"
 *   variant="primary"
 *   onClick={() => handleSubmit()}
 * />
 * ```
 */
interface ButtonProps {
  /**
   * 按钮文本
   */
  label: string;
  
  /**
   * 按钮样式变体
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * 按钮大小
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 点击事件处理器
   */
  onClick?: () => void;
  
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
}
```

## Hooks最佳实践

### useState类型定义

```typescript
// ✅ 好 - 明确的初始状态类型
const [user, setUser] = useState<User | null>(null);
const [users, setUsers] = useState<User[]>([]);

// ✅ 好 - 使用类型推断
const [count, setCount] = useState(0);

// ❌ 不好 - 不必要的类型断言
const [user, setUser] = useState({} as User); // 可能导致运行时错误
```

### useEffect依赖数组

```typescript
// ✅ 好 - 包含所有依赖
useEffect(() => {
  fetchUser(userId);
}, [userId, fetchUser]);

// ❌ 不好 - 缺少依赖
useEffect(() => {
  fetchUser(userId);
}, []); // ESLint警告

// ✅ 好 - 使用useCallback确保函数引用稳定
const fetchUser = useCallback((id: string) => {
  // ...
}, []);

useEffect(() => {
  fetchUser(userId);
}, [userId, fetchUser]);
```

### 自定义Hooks命名

```typescript
// ✅ 好 - use开头
function useCounter(initialValue: number) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

// ❌ 不好 - 不遵循命名约定
function counter(initialValue: number) {
  // ...
}
```

### 自定义Hooks返回值

```typescript
// ✅ 好 - 返回对象(命名清晰)
function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  return { user, loading, error, refetch };
}

// 使用
const { user, loading, error } = useUser('1');

// ✅ 也可以 - 返回数组(简洁)
function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle] as const;
}

// 使用
const [isOpen, toggleOpen] = useToggle(false);
```

## 组件设计最佳实践

### 组件拆分原则

```typescript
// ✅ 好 - 单一职责
interface UserAvatarProps {
  user: User;
  size?: 'small' | 'medium' | 'large';
}

const UserAvatar = ({ user, size = 'medium' }: UserAvatarProps) => {
  return <img src={user.avatar} alt={user.name} className={`avatar-${size}`} />;
};

interface UserInfoProps {
  user: User;
}

const UserInfo = ({ user }: UserInfoProps) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className="user-card">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </div>
  );
};

// ❌ 不好 - 组件过大,职责混乱
const UserCard = ({ user }: { user: User }) => {
  return (
    <div>
      <img src={user.avatar} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button>Edit</button>
      <button>Delete</button>
      {/* 更多内容... */}
    </div>
  );
};
```

### 使用泛型组件

```typescript
// ✅ 好 - 可复用的泛型组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyText?: string;
}

function List<T>({ items, renderItem, keyExtractor, emptyText }: ListProps<T>) {
  if (items.length === 0) {
    return <div>{emptyText || 'No items'}</div>;
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

### 组合优于继承

```typescript
// ✅ 好 - 使用组合
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return <div className={`card ${className || ''}`}>{children}</div>;
};

const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-header">{children}</div>;
};

const CardBody = ({ children }: { children: React.ReactNode }) => {
  return <div className="card-body">{children}</div>;
};

// 使用
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>

// ❌ 不好 - 使用继承
class BaseCard extends React.Component {
  // ...
}

class UserCard extends BaseCard {
  // ...
}
```

## 错误处理最佳实践

### 类型安全的错误处理

```typescript
// ✅ 好 - 定义错误类型
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 使用
const fetchUser = async (id: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new ApiError(
        'Failed to fetch user',
        response.status,
        await response.json()
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.statusCode, error.response);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};
```

### 错误边界类型

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

## 性能优化最佳实践

### React.memo使用

```typescript
// ✅ 好 - 对props进行浅比较
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

const UserCard = React.memo(({ user, onEdit }: UserCardProps) => {
  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
});

// ✅ 好 - 自定义比较函数
const UserCard2 = React.memo(
  ({ user, onEdit }: UserCardProps) => {
    return (
      <div>
        <h2>{user.name}</h2>
        <button onClick={() => onEdit(user.id)}>Edit</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);

// ❌ 不好 - 过度使用memo
const SimpleText = React.memo(({ text }: { text: string }) => {
  return <span>{text}</span>;
});
```

### useMemo和useCallback

```typescript
// ✅ 好 - 缓存昂贵计算
const ExpensiveComponent = ({ items }: { items: Item[] }) => {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  return <div>Total: ${total}</div>;
};

// ✅ 好 - 缓存回调函数
const ParentComponent = () => {
  const [items, setItems] = useState<Item[]>([]);

  const handleItemClick = useCallback((id: string) => {
    console.log('Item clicked:', id);
  }, []);

  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onClick={handleItemClick} />
      ))}
    </div>
  );
};

// ❌ 不好 - 不必要的useMemo
const sum = useMemo(() => a + b, [a, b]); // 简单计算不需要memo
```

## 代码组织最佳实践

### 文件结构

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   ├── Button.styles.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useForm.ts
│   └── ...
├── types/
│   ├── user.ts
│   ├── api.ts
│   └── common.ts
├── utils/
│   ├── api.ts
│   ├── date.ts
│   └── ...
└── ...
```

### 类型定义文件

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// types/common.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncData<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};
```

### 导入顺序

```typescript
// ✅ 好 - 组织良好的导入
// 1. React和第三方库
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// 2. 类型
import type { User, Post } from '@/types';

// 3. 组件
import { Button, Card } from '@/components';

// 4. Hooks
import { useAuth, useForm } from '@/hooks';

// 5. 工具函数
import { formatDate, debounce } from '@/utils';

// 6. 样式
import styles from './Component.module.css';

// ❌ 不好 - 混乱的导入
import styles from './Component.module.css';
import { useState } from 'react';
import type { User } from '@/types';
import { Button } from '@/components';
import axios from 'axios';
```

## 测试最佳实践

### 组件测试类型

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state', () => {
    render(<Button label="Click me" onClick={() => {}} disabled />);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Hooks测试类型

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(9);
  });
});
```

## 常见陷阱和解决方案

### 避免类型断言滥用

```typescript
// ❌ 不好 - 滥用类型断言
const user = {} as User;
console.log(user.name); // 运行时可能出错

// ✅ 好 - 使用类型守卫
function isUser(value: any): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  );
}

if (isUser(data)) {
  console.log(data.name); // 类型安全
}
```

### 处理可选链

```typescript
// ✅ 好 - 使用可选链
const userName = user?.profile?.name;

// ✅ 好 - 使用空值合并
const displayName = user?.name ?? 'Guest';

// ❌ 不好 - 嵌套检查
const userName = user && user.profile && user.profile.name;
```

### 避免循环依赖

```typescript
// ❌ 不好
// fileA.ts
import { functionB } from './fileB';
export const functionA = () => functionB();

// fileB.ts
import { functionA } from './fileA';
export const functionB = () => functionA();

// ✅ 好 - 提取共享逻辑
// shared.ts
export const sharedLogic = () => {};

// fileA.ts
import { sharedLogic } from './shared';
export const functionA = () => sharedLogic();

// fileB.ts
import { sharedLogic } from './shared';
export const functionB = () => sharedLogic();
```

遵循这些最佳实践能够帮助构建更安全、更可维护的React TypeScript应用。

