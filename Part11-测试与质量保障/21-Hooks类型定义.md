# Hooks类型定义

## 概述

React Hooks在TypeScript中需要正确的类型定义才能充分发挥类型系统的优势。本文将全面介绍各种Hooks的类型定义方式、泛型使用和最佳实践。

## useState类型定义

### 基本类型

```typescript
import { useState } from 'react';

// 自动推断类型
const [count, setCount] = useState(0); // number
const [name, setName] = useState('Alice'); // string
const [isActive, setActive] = useState(true); // boolean

// 显式指定类型
const [count2, setCount2] = useState<number>(0);
const [name2, setName2] = useState<string>('');
```

### 对象和数组类型

```typescript
// 对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

const [user, setUser] = useState<User>({
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
});

// 数组类型
const [users, setUsers] = useState<User[]>([]);

// 更新对象
setUser((prev) => ({
  ...prev,
  name: 'Bob',
}));

// 更新数组
setUsers((prev) => [...prev, newUser]);
```

### 可空类型

```typescript
// null或undefined
const [user, setUser] = useState<User | null>(null);
const [data, setData] = useState<string | undefined>(undefined);

// 使用时需要检查
if (user) {
  console.log(user.name); // ✅ 类型安全
}

// 或使用可选链
console.log(user?.name);
```

### 联合类型

```typescript
// 字符串字面量联合
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

// 复杂联合类型
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: any }
  | { status: 'error'; error: Error };

const [state, setState] = useState<LoadingState>({ status: 'idle' });

// 类型守卫
if (state.status === 'success') {
  console.log(state.data); // ✅ 可以访问data
}
```

### 函数式更新

```typescript
// 函数式更新的类型推断
const [count, setCount] = useState(0);

// 参数类型自动推断为number
setCount((prev) => prev + 1);

// 对象更新
interface FormState {
  name: string;
  email: string;
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
});

// 参数类型自动推断为FormState
setForm((prev) => ({
  ...prev,
  name: 'Alice',
}));
```

## useEffect类型定义

### 基本用法

```typescript
import { useEffect } from 'react';

// 无依赖
useEffect(() => {
  console.log('Component mounted');
}, []);

// 有依赖
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);

// 返回清理函数
useEffect(() => {
  const timer = setTimeout(() => {
    console.log('Delayed');
  }, 1000);

  return () => {
    clearTimeout(timer);
  };
}, []);
```

### 异步Effect

```typescript
// ❌ 错误 - useEffect不能直接使用async
useEffect(async () => {
  const data = await fetch('/api/data');
}, []);

// ✅ 正确 - 在内部定义async函数
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
}, []);

// ✅ 使用IIFE
useEffect(() => {
  (async () => {
    const data = await fetchData();
    setData(data);
  })();
}, []);
```

### 依赖数组类型

```typescript
// 依赖必须是不可变的值
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  console.log(count, user);
}, [count, user]); // ✅

// ❌ 错误 - 对象字面量每次都是新的引用
useEffect(() => {
  console.log('Effect');
}, [{ id: 1 }]);

// ✅ 正确 - 使用useMemo
const config = useMemo(() => ({ id: 1 }), []);
useEffect(() => {
  console.log('Effect');
}, [config]);
```

## useRef类型定义

### DOM引用

```typescript
import { useRef, useEffect } from 'react';

// HTML元素引用
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  // 需要检查null
  inputRef.current?.focus();
  
  if (divRef.current) {
    divRef.current.scrollTop = 0;
  }
}, []);

return (
  <div>
    <input ref={inputRef} />
    <div ref={divRef}>Content</div>
    <button ref={buttonRef}>Click</button>
  </div>
);
```

### 可变值引用

```typescript
// 存储任意可变值
const countRef = useRef<number>(0);
const timerRef = useRef<NodeJS.Timeout | null>(null);
const prevValueRef = useRef<string>('');

// 不需要检查null
countRef.current += 1;

// 清理定时器
useEffect(() => {
  timerRef.current = setTimeout(() => {
    console.log('Delayed');
  }, 1000);

  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, []);

// 保存前一个值
useEffect(() => {
  prevValueRef.current = value;
});
```

### 回调Ref

```typescript
// 使用回调形式的ref
const [height, setHeight] = useState(0);

const measureRef = useCallback((node: HTMLDivElement | null) => {
  if (node !== null) {
    setHeight(node.getBoundingClientRect().height);
  }
}, []);

return <div ref={measureRef}>Content</div>;
```

## useContext类型定义

### 基本Context

```typescript
import { createContext, useContext } from 'react';

// 定义Context类型
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 创建Context(可以设置默认值)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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
const Component = () => {
  const { theme, toggleTheme } = useTheme();
  return <div>Theme: {theme}</div>;
};
```

### 泛型Context

```typescript
// 泛型Context
interface DataContextType<T> {
  data: T;
  setData: (data: T) => void;
}

function createDataContext<T>() {
  return createContext<DataContextType<T> | undefined>(undefined);
}

// 使用
interface User {
  id: string;
  name: string;
}

const UserContext = createDataContext<User>();

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<User>({ id: '1', name: 'Alice' });

  return (
    <UserContext.Provider value={{ data, setData }}>
      {children}
    </UserContext.Provider>
  );
};
```

## useReducer类型定义

### 基本用法

```typescript
import { useReducer } from 'react';

// State类型
interface State {
  count: number;
  error: string | null;
}

// Action类型
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number }
  | { type: 'error'; payload: string };

// Reducer函数
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'set':
      return { ...state, count: action.payload };
    case 'error':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// 使用
const Counter = () => {
  const [state, dispatch] = useReducer(reducer, { count: 0, error: null });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'set', payload: 10 })}>Set to 10</button>
    </div>
  );
};
```

### 复杂Reducer

```typescript
// 复杂State
interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  data: any[];
}

// 复杂Action
type AppAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { user: User; data: any[] } }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        data: action.payload.data,
      };
    
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        data: [],
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    default:
      return state;
  }
};
```

## useMemo和useCallback类型定义

### useMemo

```typescript
import { useMemo } from 'react';

// 基本用法 - 类型自动推断
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 显式指定返回类型
const value = useMemo<number>(() => {
  return a + b;
}, [a, b]);

// 复杂类型
interface ProcessedData {
  items: string[];
  total: number;
}

const processedData = useMemo<ProcessedData>(() => {
  return {
    items: data.map((item) => item.name),
    total: data.length,
  };
}, [data]);

// 返回React元素
const memoizedElement = useMemo(() => {
  return <ExpensiveComponent data={data} />;
}, [data]);
```

### useCallback

```typescript
import { useCallback } from 'react';

// 基本用法 - 参数和返回值类型自动推断
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);

// 带参数的回调
const handleItemClick = useCallback((id: string) => {
  console.log('Item clicked:', id);
}, []);

// 异步回调
const fetchData = useCallback(async (id: string): Promise<Data> => {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}, []);

// 复杂回调类型
interface FormData {
  name: string;
  email: string;
}

const handleSubmit = useCallback(
  (data: FormData): Promise<boolean> => {
    return submitForm(data);
  },
  [submitForm]
);

// 事件处理器
const handleChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  },
  [setValue]
);
```

## 自定义Hooks类型定义

### 基本自定义Hook

```typescript
// 返回值类型
function useCounter(initialValue: number): [number, () => void, () => void] {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((c) => c - 1);
  }, []);

  return [count, increment, decrement];
}

// 使用
const [count, increment, decrement] = useCounter(0);
```

### 对象返回值

```typescript
// 返回对象(更灵活)
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initialValue: number): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((c) => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}

// 使用
const { count, increment, decrement, reset } = useCounter(0);
```

### 泛型自定义Hook

```typescript
// 泛型Hook
interface UseAsyncReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: () => Promise<void>;
}

function useAsync<T>(
  asyncFunction: () => Promise<T>
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  return { data, error, isLoading, execute };
}

// 使用
interface User {
  id: string;
  name: string;
}

const fetchUser = async (): Promise<User> => {
  const response = await fetch('/api/user');
  return response.json();
};

const { data, error, isLoading, execute } = useAsync<User>(fetchUser);
```

### 复杂自定义Hook

```typescript
// useForm Hook
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  resetForm: () => void;
}

function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  };
}

// 使用
interface LoginForm {
  email: string;
  password: string;
}

const LoginComponent = () => {
  const form = useForm<LoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginForm, string>> = {};
      
      if (!values.email) {
        errors.email = 'Email is required';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        value={form.values.email}
        onChange={form.handleChange('email')}
        onBlur={form.handleBlur('email')}
      />
      {form.touched.email && form.errors.email && (
        <span>{form.errors.email}</span>
      )}
      
      <input
        type="password"
        value={form.values.password}
        onChange={form.handleChange('password')}
        onBlur={form.handleBlur('password')}
      />
      {form.touched.password && form.errors.password && (
        <span>{form.errors.password}</span>
      )}
      
      <button type="submit" disabled={form.isSubmitting}>
        Login
      </button>
    </form>
  );
};
```

## 最佳实践

### 1. 优先类型推断

```typescript
// ✅ 好 - 让TypeScript推断
const [count, setCount] = useState(0);

// ❌ 不必要 - 显式指定明显的类型
const [count, setCount] = useState<number>(0);
```

### 2. 处理可空值

```typescript
// ✅ 好 - 明确处理null
const [user, setUser] = useState<User | null>(null);

if (user) {
  console.log(user.name);
}

// ❌ 不好 - 强制断言
const [user, setUser] = useState<User>(null!);
console.log(user.name); // 可能出错
```

### 3. 使用const断言

```typescript
// ✅ 好 - 使用as const
const [status, setStatus] = useState<'idle' | 'loading'>('idle');

// ✅ 更好 - 使用enum或const对象
const Status = {
  Idle: 'idle',
  Loading: 'loading',
} as const;

type StatusType = typeof Status[keyof typeof Status];
const [status, setStatus] = useState<StatusType>(Status.Idle);
```

### 4. 抽取类型定义

```typescript
// ✅ 好 - 复用类型定义
interface User {
  id: string;
  name: string;
}

const [user, setUser] = useState<User | null>(null);
const [users, setUsers] = useState<User[]>([]);
```

Hooks的类型定义是React TypeScript开发的核心,正确的类型定义能够提供类型安全和良好的开发体验。

