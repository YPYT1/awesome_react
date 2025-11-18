# Hooks概述与规则

## 学习目标

通过本章学习，你将掌握：

- Hooks的概念和历史
- Hooks的核心规则
- 为什么需要Hooks
- Hooks的分类和作用
- 常见违反规则的情况
- React 19中的Hooks新特性
- 最佳实践指南

## 第一部分：Hooks概述

### 1.1 什么是Hooks

Hooks是React 16.8引入的特性，让函数组件也能使用State和其他React特性。

#### Hooks的定义

```jsx
// Hooks之前：只有类组件能使用State
class Counter extends React.Component {
  state = { count: 0 };
  
  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          +1
        </button>
      </div>
    );
  }
}

// Hooks之后：函数组件也能使用State
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 1.2 为什么需要Hooks

#### 问题1：组件间复用状态逻辑困难

```jsx
// Hooks之前：使用HOC或Render Props
// HOC方式
function withAuth(Component) {
  return function AuthComponent(props) {
    const user = useContext(AuthContext);
    if (!user) return <Login />;
    return <Component {...props} user={user} />;
  };
}

const AuthDashboard = withAuth(Dashboard);

// Hooks之后：自定义Hook
function useAuth() {
  const user = useContext(AuthContext);
  return user;
}

function Dashboard() {
  const user = useAuth();
  if (!user) return <Login />;
  return <div>Welcome {user.name}</div>;
}
```

#### 问题2：复杂组件难以理解

```jsx
// Hooks之前：生命周期分散逻辑
class ComplexComponent extends React.Component {
  componentDidMount() {
    // 订阅1
    this.subscription1 = subscribe1();
    // 订阅2
    this.subscription2 = subscribe2();
    // 获取数据
    fetchData();
  }
  
  componentWillUnmount() {
    // 清理1
    this.subscription1.unsubscribe();
    // 清理2
    this.subscription2.unsubscribe();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      fetchData();
    }
  }
  
  render() {
    return <div>{/* ... */}</div>;
  }
}

// Hooks之后：相关逻辑聚合
function ComplexComponent({ id }) {
  // 订阅1（逻辑聚合）
  useEffect(() => {
    const sub = subscribe1();
    return () => sub.unsubscribe();
  }, []);
  
  // 订阅2（逻辑聚合）
  useEffect(() => {
    const sub = subscribe2();
    return () => sub.unsubscribe();
  }, []);
  
  // 数据获取（逻辑聚合）
  useEffect(() => {
    fetchData(id);
  }, [id]);
  
  return <div>{/* ... */}</div>;
}
```

#### 问题3：类组件的this困惑

```jsx
// Hooks之前：this绑定问题
class Button extends React.Component {
  handleClick() {
    console.log(this.state);  // this可能是undefined
  }
  
  render() {
    return <button onClick={this.handleClick}>Click</button>;
  }
}

// Hooks之后：无需this
function Button() {
  const [state, setState] = useState(0);
  
  const handleClick = () => {
    console.log(state);  // 直接访问
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

### 1.3 Hooks的分类

```jsx
// 1. 基础Hooks
import { useState, useEffect, useContext } from 'react';

// 2. 额外Hooks
import { 
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue
} from 'react';

// 3. React 18新增
import {
  useId,
  useTransition,
  useDeferredValue,
  useSyncExternalStore,
  useInsertionEffect
} from 'react';

// 4. React 19新增
import {
  use,
  useOptimistic,
  useFormStatus,
  useActionState
} from 'react';

// 5. 自定义Hooks
function useCustomHook() {
  // 自定义逻辑
}
```

## 第二部分：Hooks规则

### 2.1 规则1：只在顶层调用Hooks

```jsx
// 错误：在条件语句中调用
function BadExample1({ condition }) {
  if (condition) {
    const [state, setState] = useState(0);  // 错误！
  }
  
  return <div>{/* ... */}</div>;
}

// 错误：在循环中调用
function BadExample2() {
  for (let i = 0; i < 10; i++) {
    const [state, setState] = useState(i);  // 错误！
  }
  
  return <div>{/* ... */}</div>;
}

// 错误：在嵌套函数中调用
function BadExample3() {
  function nestedFunction() {
    const [state, setState] = useState(0);  // 错误！
  }
  
  return <div>{/* ... */}</div>;
}

// 正确：在组件顶层调用
function GoodExample({ condition }) {
  const [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0);
  
  // 可以条件使用State的值
  const value = condition ? state1 : state2;
  
  return <div>{value}</div>;
}
```

#### 为什么有这个规则

```jsx
// React通过调用顺序识别Hooks
function Component() {
  const [name, setName] = useState('');     // Hook 1
  const [age, setAge] = useState(0);        // Hook 2
  const [email, setEmail] = useState('');   // Hook 3
  
  // React内部维护：
  // hooks = [
  //   { state: '' },      // Hook 1
  //   { state: 0 },       // Hook 2
  //   { state: '' }       // Hook 3
  // ]
  
  return <div>{/* ... */}</div>;
}

// 如果条件调用：
function BrokenComponent({ condition }) {
  const [name, setName] = useState('');     // Hook 1
  
  if (condition) {
    const [age, setAge] = useState(0);      // 有时是Hook 2
  }
  
  const [email, setEmail] = useState('');   // 有时是Hook 2，有时是Hook 3
  
  // Hook顺序不一致，React会混乱
  
  return <div>{/* ... */}</div>;
}
```

### 2.2 规则2：只在React函数中调用Hooks

```jsx
// 错误：在普通JavaScript函数中调用
function regularFunction() {
  const [state, setState] = useState(0);  // 错误！
  return state;
}

// 错误：在类组件中调用
class MyClass extends React.Component {
  method() {
    const [state, setState] = useState(0);  // 错误！
  }
  
  render() {
    return <div>{/* ... */}</div>;
  }
}

// 正确：在函数组件中调用
function MyComponent() {
  const [state, setState] = useState(0);  // 正确
  return <div>{state}</div>;
}

// 正确：在自定义Hook中调用
function useCustomHook() {
  const [state, setState] = useState(0);  // 正确
  return [state, setState];
}
```

### 2.3 React 19的规则放宽

```jsx
// React 19：允许条件调用use() Hook
import { use } from 'react';

function ConditionalUse({ shouldFetch, userId }) {
  // 允许：条件使用use()
  const user = shouldFetch ? use(fetchUser(userId)) : null;
  
  if (!shouldFetch) {
    return <div>未获取数据</div>;
  }
  
  return <div>{user.name}</div>;
}

// 但其他Hooks仍然不能条件调用
function StillBad({ condition }) {
  // 仍然错误
  if (condition) {
    const [state, setState] = useState(0);  // 错误！
  }
  
  return <div>{/* ... */}</div>;
}
```

## 第三部分：常见违反规则的情况

### 3.1 提前返回后调用Hooks

```jsx
// 错误
function BadEarlyReturn({ user }) {
  if (!user) {
    return <Login />;
  }
  
  // 错误：提前返回后的Hooks
  const [count, setCount] = useState(0);
  
  return <div>{count}</div>;
}

// 正确
function GoodEarlyReturn({ user }) {
  const [count, setCount] = useState(0);  // 先调用Hooks
  
  if (!user) {
    return <Login />;
  }
  
  return <div>{count}</div>;
}
```

### 3.2 循环中调用Hooks

```jsx
// 错误
function BadLoop({ items }) {
  const states = [];
  
  for (let i = 0; i < items.length; i++) {
    const [state, setState] = useState(items[i]);  // 错误！
    states.push(state);
  }
  
  return <div>{/* ... */}</div>;
}

// 正确
function GoodLoop({ items }) {
  const [states, setStates] = useState(items);
  
  return <div>{/* ... */}</div>;
}

// 或使用单个State存储数组
function BetterLoop({ items }) {
  const [itemStates, setItemStates] = useState(
    items.map(item => ({ id: item.id, value: item.value }))
  );
  
  return <div>{/* ... */}</div>;
}
```

### 3.3 回调函数中调用Hooks

```jsx
// 错误
function BadCallback() {
  const handleClick = () => {
    const [state, setState] = useState(0);  // 错误！
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// 正确
function GoodCallback() {
  const [state, setState] = useState(0);
  
  const handleClick = () => {
    setState(state + 1);  // 使用Hook返回的setter
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

## 第四部分：Hooks最佳实践

### 4.1 命名规范

```jsx
// 自定义Hook必须以use开头
function useAuth() {  // 正确
  const [user, setUser] = useState(null);
  return user;
}

function getAuth() {  // 错误：不能调用Hooks
  // const [user, setUser] = useState(null);
  return null;
}

// Hook名称应该描述功能
function useUser() { }           // 好
function useUserData() { }       // 好
function useCurrentUser() { }    // 好
function useAuthentication() { } // 好

function useX() { }              // 不好：太简短
function useTemp() { }           // 不好：不明确
```

### 4.2 依赖数组的正确使用

```jsx
function DependencyArray() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 正确：列出所有依赖
  useEffect(() => {
    console.log(count, text);
  }, [count, text]);
  
  // 错误：遗漏依赖
  useEffect(() => {
    console.log(count, text);
  }, [count]);  // 遗漏text
  
  // 正确：空依赖（只执行一次）
  useEffect(() => {
    console.log('组件挂载');
  }, []);
  
  // 正确：无依赖数组（每次渲染都执行）
  useEffect(() => {
    console.log('每次渲染');
  });
}
```

### 4.3 避免过度使用Hooks

```jsx
// 不好：过度拆分State
function BadSplit() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  // 太多State...
  
  return <div>{/* ... */}</div>;
}

// 好：合并相关State
function GoodMerge() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [addressInfo, setAddressInfo] = useState({
    address: '',
    city: '',
    country: ''
  });
  
  return <div>{/* ... */}</div>;
}
```

## 第五部分：React 19的Hooks

### 5.1 use() Hook

```jsx
import { use, Suspense } from 'react';

// 用于Promise
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  
  return <div>{user.name}</div>;
}

// 用于Context
const ThemeContext = createContext('light');

function ThemedComponent() {
  const theme = use(ThemeContext);
  return <div className={theme}>Content</div>;
}

// 条件使用（React 19新特性）
function ConditionalUse({ shouldFetch }) {
  const data = shouldFetch ? use(fetchData()) : null;
  
  return <div>{data?.value}</div>;
}
```

### 5.2 useOptimistic

```jsx
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  async function handleSubmit(formData) {
    const newTodo = {
      id: Date.now(),
      text: formData.get('todo')
    };
    
    addOptimisticTodo(newTodo);
    await addTodo(newTodo);
  }
  
  return (
    <div>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
      <form action={handleSubmit}>
        <input name="todo" />
        <button>添加</button>
      </form>
    </div>
  );
}
```

### 5.3 useActionState

```jsx
'use client';

import { useActionState } from 'react';

async function submitForm(prevState, formData) {
  'use server';
  
  const name = formData.get('name');
  await saveData(name);
  
  return { success: true, message: '保存成功' };
}

function MyForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null);
  
  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

### 5.4 useFormStatus

```jsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

// 必须在form内部使用
function MyForm() {
  return (
    <form action={serverAction}>
      <input name="data" />
      <SubmitButton />
    </form>
  );
}
```

## 第六部分：Hooks调试

### 6.1 使用React DevTools

```jsx
// 使用useDebugValue
function useCustomHook(value) {
  useDebugValue(value, v => `Current: ${v}`);
  
  const [state, setState] = useState(value);
  return [state, setState];
}

// 在React DevTools中会显示调试信息
```

### 6.2 Hooks调用追踪

```jsx
function HookTracing() {
  console.log('1. 组件渲染开始');
  
  const [state1, setState1] = useState(() => {
    console.log('2. useState初始化');
    return 0;
  });
  
  console.log('3. useState后');
  
  useEffect(() => {
    console.log('5. useEffect执行');
    
    return () => {
      console.log('清理函数');
    };
  }, []);
  
  console.log('4. useEffect注册后');
  
  return <div>Component</div>;
}

// 执行顺序：
// 1 -> 2 -> 3 -> 4 -> 5
```

## 第七部分：Hooks调试技巧

### 7.1 使用React DevTools

```jsx
// 在React DevTools中查看Hooks状态
function DebuggingHooks() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  useEffect(() => {
    console.log('Effect执行');
  }, [count]);
  
  // 在DevTools的Components标签中可以看到：
  // State: 0
  // State: ""
  // Effect
  
  return <div>{count}</div>;
}

// 使用useDebugValue为自定义Hook添加标签
function useCustomCounter(initialValue) {
  const [count, setCount] = useState(initialValue);
  
  // 在DevTools中显示自定义信息
  useDebugValue(count > 10 ? '高' : '低');
  
  return [count, setCount];
}
```

### 7.2 常见Hooks错误的调试

```jsx
// 错误1：Hooks调用次数不匹配
function InconsistentHooks({ condition }) {
  const [state1] = useState(1);
  
  // 这会导致错误：Rendered fewer hooks than expected
  if (condition) {
    return <div>Early return</div>;
  }
  
  const [state2] = useState(2);  // 有时调用，有时不调用
  
  return <div>{state1} {state2}</div>;
}

// 错误信息：
// "Rendered fewer hooks than expected. This may be caused by an accidental early return statement."

// 修复：确保Hooks调用次数一致
function FixedHooks({ condition }) {
  const [state1] = useState(1);
  const [state2] = useState(2);  // 总是调用
  
  if (condition) {
    return <div>Early return: {state1}</div>;
  }
  
  return <div>{state1} {state2}</div>;
}
```

### 7.3 性能分析

```jsx
// 使用React Profiler分析Hooks性能
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log('组件渲染信息:', {
    id,
    phase,
    actualDuration,
    baseDuration
  });
}

function App() {
  return (
    <Profiler id="HooksComponent" onRender={onRenderCallback}>
      <HooksComponent />
    </Profiler>
  );
}

// 分析Hooks导致的重新渲染
function PerformanceAnalysis() {
  const renderCount = useRef(0);
  renderCount.current++;
  
  const [count, setCount] = useState(0);
  
  console.log('渲染次数:', renderCount.current);
  console.log('当前count:', count);
  
  return (
    <div>
      <p>渲染了 {renderCount.current} 次</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

## 第八部分：Hooks最佳实践进阶

### 8.1 自定义Hook的设计原则

```jsx
// 原则1：单一职责
// ❌ 不好：一个Hook做太多事
function useBadMultiPurpose() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState([]);
  
  // 太多不相关的逻辑
  
  return { user, setUser, theme, setTheme, language, setLanguage, notifications, setNotifications };
}

// ✅ 好：拆分为多个专注的Hook
function useUser() {
  const [user, setUser] = useState(null);
  return { user, setUser };
}

function useTheme() {
  const [theme, setTheme] = useState('light');
  return { theme, setTheme };
}

function useLanguage() {
  const [language, setLanguage] = useState('en');
  return { language, setLanguage };
}

function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  return { notifications, setNotifications };
}

// 原则2：可组合性
function useApp() {
  const user = useUser();
  const theme = useTheme();
  const language = useLanguage();
  const notifications = useNotifications();
  
  return { user, theme, language, notifications };
}
```

### 8.2 Hooks的测试

```jsx
// 使用@testing-library/react-hooks测试
import { renderHook, act } from '@testing-library/react-hooks';

// 测试useCounter
test('useCounter应该正确增加', () => {
  const { result } = renderHook(() => useCounter(0));
  
  expect(result.current.count).toBe(0);
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

// 测试useEffect的清理
test('useEffect清理函数应该被调用', () => {
  const cleanup = jest.fn();
  
  const { unmount } = renderHook(() => {
    useEffect(() => {
      return cleanup;
    }, []);
  });
  
  expect(cleanup).not.toHaveBeenCalled();
  
  unmount();
  
  expect(cleanup).toHaveBeenCalledTimes(1);
});
```

### 8.3 Hooks的类型定义（TypeScript）

```tsx
// TypeScript中的Hooks类型定义
import { useState, useEffect, useCallback } from 'react';

// 基本类型推断
function TypedComponent() {
  const [count, setCount] = useState(0);  // number
  const [name, setName] = useState('');   // string
  const [user, setUser] = useState<User | null>(null);  // User | null
  
  return <div>{count}</div>;
}

// 自定义Hook的类型定义
function useCounter(initialValue: number = 0): {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
} {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);
  
  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);
  
  return { count, increment, decrement, reset };
}

// 泛型Hook
function useArray<T>(initialValue: T[] = []): {
  array: T[];
  push: (element: T) => void;
  filter: (callback: (item: T) => boolean) => void;
  clear: () => void;
} {
  const [array, setArray] = useState<T[]>(initialValue);
  
  const push = useCallback((element: T) => {
    setArray(a => [...a, element]);
  }, []);
  
  const filter = useCallback((callback: (item: T) => boolean) => {
    setArray(a => a.filter(callback));
  }, []);
  
  const clear = useCallback(() => {
    setArray([]);
  }, []);
  
  return { array, push, filter, clear };
}
```

## 第九部分：Hooks常见问题FAQ

### 9.1 为什么我的Effect执行了两次？

```jsx
// 问题：在React 18+ Strict Mode下，Effect会执行两次
function DoubleEffect() {
  useEffect(() => {
    console.log('这会在开发模式下打印两次');
    
    return () => {
      console.log('清理函数也会执行两次');
    };
  }, []);
  
  return <div>Component</div>;
}

// 原因：
// React 18的Strict Mode会故意double-invoke Effects
// 目的是帮助发现副作用清理不当的问题

// 解决：
// 1. 这是开发模式的行为，生产环境不会double-invoke
// 2. 确保Effect有正确的清理函数
// 3. 不要依赖Effect只执行一次
```

### 9.2 如何在Effect中获取最新的state？

```jsx
// 问题：闭包陷阱
function StaleState() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 永远是0
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 空依赖导致闭包
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 解决方案1：函数式更新
function Solution1() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => {
        console.log(c);  // 最新值
        return c;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 解决方案2：使用ref
function Solution2() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current);  // 最新值
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 解决方案3：使用useLatest自定义Hook
function useLatest(value) {
  const ref = useRef(value);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref;
}

function Solution3() {
  const [count, setCount] = useState(0);
  const latestCount = useLatest(count);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(latestCount.current);  // 最新值
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 9.3 为什么我的组件渲染了太多次？

```jsx
// 问题：不必要的重新渲染
function TooManyRenders() {
  const [count, setCount] = useState(0);
  
  // ❌ 每次渲染都创建新对象
  const config = { value: count };
  
  useEffect(() => {
    console.log('Effect执行');
  }, [config]);  // config每次都变，Effect每次都执行
  
  return <div>{count}</div>;
}

// 解决：使用useMemo
function OptimizedRenders() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({ value: count }), [count]);
  
  useEffect(() => {
    console.log('Effect只在count变化时执行');
  }, [config]);
  
  return <div>{count}</div>;
}

// 诊断工具：追踪重新渲染原因
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// 使用
function Component(props) {
  useWhyDidYouUpdate('Component', props);
  
  return <div>{/* ... */}</div>;
}
```

### 9.4 如何在Hooks中使用async/await？

```jsx
// ❌ 错误：Effect不能是async函数
function BadAsync() {
  useEffect(async () => {
    const data = await fetchData();
    setData(data);
  }, []);  // ⚠️ 错误！
  
  return <div>Component</div>;
}

// ✅ 正确：在Effect内部定义async函数
function GoodAsync() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchAsync = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchAsync();
  }, []);
  
  return <div>{data}</div>;
}

// 或使用IIFE
function WithIIFE() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    (async () => {
      const result = await fetchData();
      setData(result);
    })();
  }, []);
  
  return <div>{data}</div>;
}
```

## 第十部分：Hooks性能优化指南

### 10.1 避免不必要的Effect执行

```jsx
// ❌ 不好：Effect依赖过多
function BadDependencies() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  
  // 任何一个变化都会执行Effect
  useEffect(() => {
    saveToServer(user, settings);
  }, [user, settings]);
  
  return <div>{/* ... */}</div>;
}

// ✅ 好：拆分Effect
function GoodDependencies() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  
  // 只在user变化时保存user
  useEffect(() => {
    if (user) {
      saveUserToServer(user);
    }
  }, [user]);
  
  // 只在settings变化时保存settings
  useEffect(() => {
    saveSettingsToServer(settings);
  }, [settings]);
  
  return <div>{/* ... */}</div>;
}
```

### 10.2 优化依赖数组

```jsx
// ❌ 不好：函数作为依赖
function BadFunctionDep() {
  const [count, setCount] = useState(0);
  
  const logCount = () => {
    console.log(count);
  };
  
  useEffect(() => {
    logCount();
  }, [logCount]);  // logCount每次渲染都是新函数
  
  return <div>{count}</div>;
}

// ✅ 好：使用useCallback
function GoodFunctionDep() {
  const [count, setCount] = useState(0);
  
  const logCount = useCallback(() => {
    console.log(count);
  }, [count]);
  
  useEffect(() => {
    logCount();
  }, [logCount]);  // logCount引用稳定
  
  return <div>{count}</div>;
}

// 或直接在Effect中定义函数
function BetterApproach() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const logCount = () => {
      console.log(count);
    };
    
    logCount();
  }, [count]);  // 只依赖count
  
  return <div>{count}</div>;
}
```

### 10.3 减少State数量

```jsx
// ❌ 不好：派生状态也用State
function BadDerivedState() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  
  // 每次items变化都要手动更新total和count
  const addItem = (item) => {
    const newItems = [...items, item];
    setItems(newItems);
    setTotal(newItems.reduce((sum, i) => sum + i.price, 0));
    setCount(newItems.length);
  };
  
  return <div>{/* ... */}</div>;
}

// ✅ 好：派生状态用计算
function GoodDerivedState() {
  const [items, setItems] = useState([]);
  
  // 派生值
  const total = useMemo(() => 
    items.reduce((sum, i) => sum + i.price, 0),
    [items]
  );
  
  const count = items.length;
  
  const addItem = (item) => {
    setItems([...items, item]);
    // total和count自动更新
  };
  
  return <div>{/* ... */}</div>;
}
```

## 第十一部分：Hooks迁移指南

### 11.1 从类组件迁移到Hooks

```jsx
// 类组件
class OldComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      data: null,
      loading: false
    };
    this.intervalId = null;
  }
  
  componentDidMount() {
    this.fetchData();
    this.intervalId = setInterval(this.tick, 1000);
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchData();
    }
  }
  
  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  fetchData = async () => {
    this.setState({ loading: true });
    const data = await fetch(`/api/users/${this.props.userId}`);
    this.setState({ data, loading: false });
  }
  
  tick = () => {
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <p>Data: {JSON.stringify(this.state.data)}</p>
      </div>
    );
  }
}

// Hooks版本
function NewComponent({ userId }) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 数据获取
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await fetch(`/api/users/${userId}`);
      setData(result);
      setLoading(false);
    };
    
    fetchData();
  }, [userId]);
  
  // 定时器
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
}
```

### 11.2 迁移策略

```jsx
// 策略1：逐步迁移
// 1. 新组件用Hooks
// 2. 重构时转换为Hooks
// 3. 类组件和Hooks组件可以共存

// 策略2：共存模式
function HybridApp() {
  return (
    <div>
      {/* 旧的类组件 */}
      <OldClassComponent />
      
      {/* 新的Hooks组件 */}
      <NewHooksComponent />
      
      {/* 它们可以完美共存 */}
    </div>
  );
}

// 策略3：优先迁移的组件
// 1. 简单的展示组件
// 2. 有副作用但逻辑简单的组件
// 3. 需要复用逻辑的组件

// 策略4：暂缓迁移的组件
// 1. 复杂的生命周期逻辑
// 2. 使用了错误边界（Error Boundaries）
// 3. 依赖getDerivedStateFromProps等生命周期
```

## 第十二部分：Hooks设计模式

### 12.1 Container/Presenter模式

```jsx
// Container：使用Hooks管理逻辑
function TodoContainer() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };
  
  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);
  
  // 传递数据和方法给Presenter
  return (
    <TodoPresenter
      todos={filteredTodos}
      filter={filter}
      onAddTodo={addTodo}
      onToggleTodo={toggleTodo}
      onFilterChange={setFilter}
    />
  );
}

// Presenter：纯展示组件
function TodoPresenter({ todos, filter, onAddTodo, onToggleTodo, onFilterChange }) {
  return (
    <div>
      <TodoInput onAdd={onAddTodo} />
      <TodoFilters filter={filter} onChange={onFilterChange} />
      <TodoList todos={todos} onToggle={onToggleTodo} />
    </div>
  );
}
```

### 12.2 Compound Component模式

```jsx
// 使用Context和Hooks实现复合组件
const TabsContext = createContext(null);

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const value = useMemo(() => ({
    activeTab,
    setActiveTab
  }), [activeTab]);
  
  return (
    <TabsContext.Provider value={value}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

function TabPanel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) return null;
  
  return <div className="tab-panel">{children}</div>;
}

// 使用
function App() {
  return (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">标签1</Tab>
        <Tab value="tab2">标签2</Tab>
        <Tab value="tab3">标签3</Tab>
      </TabList>
      
      <TabPanel value="tab1">内容1</TabPanel>
      <TabPanel value="tab2">内容2</TabPanel>
      <TabPanel value="tab3">内容3</TabPanel>
    </Tabs>
  );
}
```

### 12.3 Render Props转Hooks

```jsx
// 旧方式：Render Props
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };
  
  handleMouseMove = (e) => {
    this.setState({ x: e.clientX, y: e.clientY });
  };
  
  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

// 使用
<MouseTracker render={({ x, y }) => (
  <p>鼠标位置: {x}, {y}</p>
)} />

// 新方式：自定义Hook
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return position;
}

// 使用
function Component() {
  const { x, y } = useMousePosition();
  
  return <p>鼠标位置: {x}, {y}</p>;
}
```

## 第十三部分：Hooks与并发特性

### 13.1 useTransition

```jsx
import { useState, useTransition } from 'react';

function SearchWithTransition() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // 标记为低优先级更新
    startTransition(() => {
      const filtered = expensiveSearch(value);
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input value={searchTerm} onChange={handleChange} />
      
      {isPending && <div>搜索中...</div>}
      
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 13.2 useDeferredValue

```jsx
import { useState, useDeferredValue, useMemo } from 'react';

function DeferredSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 延迟更新
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // 昂贵的计算使用延迟值
  const results = useMemo(() => {
    return expensiveSearch(deferredSearchTerm);
  }, [deferredSearchTerm]);
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      
      <div style={{ opacity: searchTerm !== deferredSearchTerm ? 0.5 : 1 }}>
        <ul>
          {results.map(result => (
            <li key={result.id}>{result.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## 第十四部分：Hooks实战技巧

### 14.1 条件Hook调用的替代方案

```jsx
// ❌ 不能条件调用Hooks
function BadConditional({ shouldUseEffect }) {
  if (shouldUseEffect) {
    useEffect(() => {  // 错误！
      // ...
    }, []);
  }
}

// ✅ 在Hook内部使用条件
function GoodConditional({ shouldRun }) {
  useEffect(() => {
    if (!shouldRun) return;  // 条件在内部
    
    // 执行副作用
    console.log('执行');
  }, [shouldRun]);
}

// ✅ 使用null作为依赖的技巧
function ConditionalTimer({ enabled }) {
  useEffect(() => {
    if (!enabled) return;
    
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    return () => clearInterval(timer);
  }, [enabled]);  // enabled变化时重新执行
}
```

### 14.2 动态数量的Hooks替代方案

```jsx
// ❌ 不能循环调用Hooks
function BadLoop({ items }) {
  const states = [];
  
  // 错误：Hooks数量不固定
  for (let item of items) {
    const [state, setState] = useState(item);
    states.push(state);
  }
  
  return <div>{/* ... */}</div>;
}

// ✅ 使用单个State管理数组
function GoodArray({ items }) {
  const [states, setStates] = useState(items);
  
  const updateState = (index, newValue) => {
    setStates(prev => prev.map((s, i) => i === index ? newValue : s));
  };
  
  return (
    <ul>
      {states.map((state, index) => (
        <li key={index}>
          <input
            value={state}
            onChange={e => updateState(index, e.target.value)}
          />
        </li>
      ))}
    </ul>
  );
}

// ✅ 或使用useReducer
function WithReducer({ items }) {
  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE':
        return state.map((item, i) => 
          i === action.index ? action.value : item
        );
      default:
        return state;
    }
  };
  
  const [states, dispatch] = useReducer(reducer, items);
  
  return (
    <ul>
      {states.map((state, index) => (
        <li key={index}>
          <input
            value={state}
            onChange={e => dispatch({
              type: 'UPDATE',
              index,
              value: e.target.value
            })}
          />
        </li>
      ))}
    </ul>
  );
}
```

### 14.3 Hook的条件返回

```jsx
// 可以根据条件返回不同的值
function useConditionalData(type) {
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  
  useEffect(() => {
    if (type === 'type1') {
      fetchType1Data().then(setData1);
    } else {
      fetchType2Data().then(setData2);
    }
  }, [type]);
  
  // Hook本身总是被调用，但可以返回不同的值
  if (type === 'type1') {
    return { data: data1, setData: setData1 };
  } else {
    return { data: data2, setData: setData2 };
  }
}
```

## 第十五部分：Hooks生态系统

### 15.1 流行的Hooks库

```jsx
// 1. ahooks：阿里开源的React Hooks库
import { useRequest, useLocalStorageState, useDebounce } from 'ahooks';

function WithAhooks() {
  const { data, loading, error, run } = useRequest(fetchUserData);
  const [value, setValue] = useLocalStorageState('key', 'default');
  const debouncedValue = useDebounce(value, { wait: 500 });
  
  return <div>{/* ... */}</div>;
}

// 2. react-use：通用Hooks集合
import { useToggle, useCounter, useList } from 'react-use';

function WithReactUse() {
  const [on, toggle] = useToggle(false);
  const [count, { inc, dec, reset }] = useCounter(0);
  const [list, { push, filter, clear }] = useList([]);
  
  return <div>{/* ... */}</div>;
}

// 3. usehooks-ts：TypeScript友好的Hooks
import { useLocalStorage, useDebounce } from 'usehooks-ts';

function WithUsehooksTs() {
  const [value, setValue] = useLocalStorage('key', 'default');
  const debouncedValue = useDebounce(value, 500);
  
  return <div>{/* ... */}</div>;
}
```

### 15.2 创建自己的Hooks库

```jsx
// hooks/index.js
export { useToggle } from './useToggle';
export { useCounter } from './useCounter';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useFetch } from './useFetch';
export { useForm } from './useForm';

// 使用
import { useToggle, useCounter, useFetch } from '@/hooks';

function MyComponent() {
  const [isOpen, toggle] = useToggle();
  const { count, increment } = useCounter(0);
  const { data, loading } = useFetch('/api/data');
  
  return <div>{/* ... */}</div>;
}
```

## 第十六部分：总结

### 16.1 Hooks核心规则总结

```jsx
// 1. 只在顶层调用（不要在条件、循环、嵌套函数中）
// 2. 只在React函数中调用（函数组件或自定义Hook）
// 3. 自定义Hook以use开头
// 4. 遵循依赖数组规则
// 5. Effect应该有正确的清理函数
// 6. 不要在Effect中直接修改State（使用setState）
```

### 16.2 所有官方Hooks一览

```jsx
// 基础Hooks（必须掌握）
useState      // 状态管理
useEffect     // 副作用
useContext    // Context

// 额外Hooks（常用）
useReducer    // 复杂状态
useMemo       // 计算缓存
useCallback   // 函数缓存
useRef        // 引用
useImperativeHandle  // 自定义ref
useLayoutEffect      // 同步副作用
useDebugValue        // 调试

// React 18新增
useId                // 唯一ID
useTransition        // 过渡
useDeferredValue     // 延迟值
useSyncExternalStore // 外部Store
useInsertionEffect   // CSS注入

// React 19新增
use              // Promise/Context
useOptimistic    // 乐观更新
useActionState   // Action状态
useFormStatus    // 表单状态
```

### 16.3 学习路径建议

```jsx
// 第一阶段：基础Hooks
// 1. useState - 状态管理基础
// 2. useEffect - 副作用处理
// 3. useContext - 跨组件通信

// 第二阶段：性能优化
// 4. useMemo - 缓存计算结果
// 5. useCallback - 缓存函数
// 6. React.memo - 组件缓存

// 第三阶段：进阶Hooks
// 7. useReducer - 复杂状态管理
// 8. useRef - DOM访问和可变值
// 9. useImperativeHandle - 自定义ref

// 第四阶段：特殊Hooks
// 10. useLayoutEffect - 同步副作用
// 11. useId - 唯一ID生成
// 12. useDebugValue - 调试工具

// 第五阶段：React 18/19新特性
// 13. useTransition - 并发更新
// 14. useDeferredValue - 延迟值
// 15. use() - Promise/Context读取
// 16. useOptimistic - 乐观更新

// 第六阶段：自定义Hooks
// 17. 创建自己的Hooks库
// 18. 学习开源Hooks库
```

## 练习题

### 基础练习

1. 说明Hooks的两个核心规则
2. 找出违反规则的代码并修复
3. 创建一个使用多个Hooks的组件
4. 解释为什么不能条件调用Hooks

### 进阶练习

1. 解释为什么需要遵守Hooks规则
2. 创建自定义Hook遵循命名规范
3. 理解Hooks的调用顺序
4. 实现一个useWhyDidYouUpdate Hook
5. 将类组件迁移到Hooks

### 高级练习

1. 分析Hooks的底层实现原理
2. 创建复杂的自定义Hooks
3. 使用React 19的新Hooks
4. 实现Compound Component模式
5. 创建一个完整的Hooks库
6. 优化Hooks的性能
7. 为Hooks编写单元测试

### 实战项目

1. 使用Hooks重构一个中型项目
2. 创建一个Hooks工具库并发布到npm
3. 实现一个状态管理解决方案（类似Redux）
4. 创建一个表单管理库（类似Formik）
5. 开发一个数据获取库（类似SWR）

通过本章学习，你已经全面了解了Hooks的概述和核心规则。Hooks是React现代开发的基石，遵守这些规则并熟练运用各种Hooks，将使你成为React开发专家。继续深入学习每个Hook的详细用法，探索Hooks的无限可能！

