# React 19 完整API速查表

本文档提供React 19所有核心API的快速参考，包括组件、Hooks、工具函数等。

## 1. 核心组件API

### 1.1 Component

```tsx
class MyComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { count: 0 };
  }
  
  static defaultProps = { /* ... */ };
  static getDerivedStateFromProps(props, state) { /* ... */ }
  static getDerivedStateFromError(error) { /* ... */ }
  
  componentDidMount() { /* ... */ }
  shouldComponentUpdate(nextProps, nextState) { /* ... */ }
  componentDidUpdate(prevProps, prevState, snapshot) { /* ... */ }
  componentWillUnmount() { /* ... */ }
  componentDidCatch(error, errorInfo) { /* ... */ }
  
  render() { return <div />; }
}
```

### 1.2 PureComponent

```tsx
class MyPureComponent extends React.PureComponent<Props, State> {
  // 自动实现浅比较的shouldComponentUpdate
  render() { return <div />; }
}
```

### 1.3 memo

```tsx
const MemoizedComponent = React.memo(
  function Component({ value }) {
    return <div>{value}</div>;
  },
  (prevProps, nextProps) => {
    // 返回true跳过更新，false重新渲染
    return prevProps.value === nextProps.value;
  }
);
```

### 1.4 Fragment

```tsx
// 完整语法
<React.Fragment key={item.id}>
  <Child1 />
  <Child2 />
</React.Fragment>

// 简写语法
<>
  <Child1 />
  <Child2 />
</>
```

### 1.5 StrictMode

```tsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

### 1.6 Suspense

```tsx
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 1.7 Profiler

```tsx
<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>

function onRenderCallback(
  id, phase, actualDuration, baseDuration,
  startTime, commitTime, interactions
) {
  console.log({ id, phase, actualDuration });
}
```

## 2. Hooks API

### 2.1 useState

```tsx
const [state, setState] = useState(initialState);
const [state, setState] = useState(() => expensiveComputation());

// 更新
setState(newState);
setState(prevState => prevState + 1);
```

### 2.2 useEffect

```tsx
useEffect(() => {
  // 副作用代码
  
  return () => {
    // 清理代码
  };
}, [dependencies]);

// 仅mount时执行
useEffect(() => {}, []);

// 每次渲染都执行
useEffect(() => {});
```

### 2.3 useContext

```tsx
const MyContext = React.createContext(defaultValue);

function Component() {
  const value = useContext(MyContext);
  return <div>{value}</div>;
}
```

### 2.4 useReducer

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
const [state, dispatch] = useReducer(reducer, initialArg, init);

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

// 使用
dispatch({ type: 'INCREMENT' });
```

### 2.5 useCallback

```tsx
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b]
);
```

### 2.6 useMemo

```tsx
const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
);
```

### 2.7 useRef

```tsx
const ref = useRef(initialValue);

// DOM引用
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />

// 可变值
const countRef = useRef(0);
countRef.current++;
```

### 2.8 useImperativeHandle

```tsx
useImperativeHandle(
  ref,
  () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }),
  [dependencies]
);

// 使用
const MyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus()
  }));
  
  return <input ref={inputRef} />;
});
```

### 2.9 useLayoutEffect

```tsx
useLayoutEffect(() => {
  // 在DOM更新后同步执行
  measureElement();
  
  return () => {
    // 清理
  };
}, [dependencies]);
```

### 2.10 useDebugValue

```tsx
function useCustomHook(value) {
  useDebugValue(value, value => `Custom: ${value}`);
  return value;
}
```

### 2.11 useId (React 18+)

```tsx
function Component() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}
```

### 2.12 useTransition (React 18+)

```tsx
const [isPending, startTransition] = useTransition();

startTransition(() => {
  // 非紧急更新
  setSearchResults(search(query));
});
```

### 2.13 useDeferredValue (React 18+)

```tsx
const deferredValue = useDeferredValue(value);

function Component({ value }) {
  const deferredValue = useDeferredValue(value);
  return <ExpensiveComponent value={deferredValue} />;
}
```

### 2.14 useSyncExternalStore (React 18+)

```tsx
const state = useSyncExternalStore(
  subscribe,
  getSnapshot,
  getServerSnapshot
);

// 示例
function useWindowWidth() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth,
    () => 0 // server snapshot
  );
}
```

### 2.15 useInsertionEffect (React 18+)

```tsx
useInsertionEffect(() => {
  // 在DOM插入前执行(主要用于CSS-in-JS库)
  insertStyles();
}, [dependencies]);
```

### 2.16 use (React 19)

```tsx
// 读取Promise
function Component({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data}</div>;
}

// 读取Context
function Component() {
  const theme = use(ThemeContext);
  return <div>{theme}</div>;
}
```

### 2.17 useOptimistic (React 19)

```tsx
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => {
    // 返回乐观更新后的状态
    return [...currentState, optimisticValue];
  }
);

// 使用
addOptimistic(newItem);
```

### 2.18 useFormStatus (React 19)

```tsx
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

### 2.19 useFormState (React 19)

```tsx
const [state, formAction] = useFormState(serverAction, initialState);

<form action={formAction}>
  <input name="email" />
  <button>Submit</button>
</form>
```

### 2.20 useActionState (React 19)

```tsx
const [state, action, isPending] = useActionState(
  async (prevState, formData) => {
    // 处理action
    return newState;
  },
  initialState
);
```

## 3. React DOM API

### 3.1 createRoot (React 18+)

```tsx
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
root.unmount();
```

### 3.2 hydrateRoot (React 18+)

```tsx
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(
  document.getElementById('root'),
  <App />
);
```

### 3.3 createPortal

```tsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    children,
    document.body
  );
}
```

### 3.4 flushSync

```tsx
import { flushSync } from 'react-dom';

flushSync(() => {
  setState(newState);
});
// DOM已同步更新
```

### 3.5 render (Legacy)

```tsx
import { render } from 'react-dom';

render(<App />, document.getElementById('root'));
```

### 3.6 hydrate (Legacy)

```tsx
import { hydrate } from 'react-dom';

hydrate(<App />, document.getElementById('root'));
```

### 3.7 unmountComponentAtNode (Legacy)

```tsx
import { unmountComponentAtNode } from 'react-dom';

unmountComponentAtNode(document.getElementById('root'));
```

### 3.8 findDOMNode (Deprecated)

```tsx
// ⚠️ 已废弃，不推荐使用
import { findDOMNode } from 'react-dom';

const node = findDOMNode(componentInstance);
```

## 4. Server Components API (React 19)

### 4.1 server/client directives

```tsx
// 服务器组件
'use server';

export async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// 客户端组件
'use client';

export function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 4.2 Server Actions

```tsx
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  const user = await db.users.create({ name });
  return user;
}

// 客户端使用
<form action={createUser}>
  <input name="name" />
  <button>Create</button>
</form>
```

## 5. 工具API

### 5.1 lazy

```tsx
const LazyComponent = lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 5.2 startTransition

```tsx
import { startTransition } from 'react';

startTransition(() => {
  // 非紧急更新
  setQuery(input);
});
```

### 5.3 Children

```tsx
React.Children.map(children, child => {
  return React.cloneElement(child, { newProp: value });
});

React.Children.forEach(children, child => {
  console.log(child);
});

React.Children.count(children);
React.Children.only(children);
React.Children.toArray(children);
```

### 5.4 cloneElement

```tsx
React.cloneElement(
  element,
  { ...additionalProps },
  ...children
);
```

### 5.5 createElement

```tsx
React.createElement(
  'div',
  { className: 'container' },
  'Hello World'
);
```

### 5.6 createContext

```tsx
const MyContext = React.createContext(defaultValue);

<MyContext.Provider value={value}>
  <Child />
</MyContext.Provider>
```

### 5.7 forwardRef

```tsx
const MyInput = forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);
```

### 5.8 isValidElement

```tsx
React.isValidElement(object);
```

## 6. 资源加载API (React 19)

### 6.1 preload

```tsx
import { preload } from 'react-dom';

preload('/script.js', { as: 'script' });
preload('/style.css', { as: 'style' });
preload('/image.jpg', { as: 'image' });
```

### 6.2 preinit

```tsx
import { preinit } from 'react-dom';

preinit('/script.js', { as: 'script' });
preinit('/style.css', { as: 'style' });
```

### 6.3 preconnect

```tsx
import { preconnect } from 'react-dom';

preconnect('https://api.example.com');
preconnect('https://cdn.example.com', { crossOrigin: 'anonymous' });
```

### 6.4 prefetchDNS

```tsx
import { prefetchDNS } from 'react-dom';

prefetchDNS('https://api.example.com');
```

## 7. Document Metadata API (React 19)

### 7.1 title

```tsx
function Page() {
  return (
    <>
      <title>My Page Title</title>
      <Content />
    </>
  );
}
```

### 7.2 meta

```tsx
function Page() {
  return (
    <>
      <meta name="description" content="Page description" />
      <meta property="og:title" content="Page Title" />
      <Content />
    </>
  );
}
```

### 7.3 link

```tsx
function Page() {
  return (
    <>
      <link rel="icon" href="/favicon.ico" />
      <link rel="canonical" href="https://example.com/page" />
      <Content />
    </>
  );
}
```

### 7.4 script

```tsx
function Page() {
  return (
    <>
      <script src="/analytics.js" async />
      <Content />
    </>
  );
}
```

### 7.5 style

```tsx
function Component() {
  return (
    <>
      <style>{`
        .custom { color: red; }
      `}</style>
      <div className="custom">Styled</div>
    </>
  );
}
```

## 8. 类型定义

### 8.1 基础类型

```tsx
// 组件Props
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// 事件处理器
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;
type ChangeHandler = React.ChangeEventHandler<HTMLInputElement>;

// Ref类型
type InputRef = React.RefObject<HTMLInputElement>;
type ForwardedRef = React.ForwardedRef<HTMLDivElement>;

// 组件类型
type FC<P = {}> = React.FunctionComponent<P>;
type ComponentType<P = {}> = React.ComponentType<P>;

// 元素类型
type ReactElement = React.ReactElement;
type ReactNode = React.ReactNode;
```

### 8.2 Hook类型

```tsx
// useState
const [state, setState] = useState<string>('');

// useRef
const ref = useRef<HTMLDivElement>(null);

// useReducer
type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };
const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer, initialState);

// useContext
const value = useContext<ContextType>(MyContext);
```

### 8.3 事件类型

```tsx
// 鼠标事件
React.MouseEvent<HTMLButtonElement>
React.MouseEventHandler<HTMLButtonElement>

// 键盘事件
React.KeyboardEvent<HTMLInputElement>
React.KeyboardEventHandler<HTMLInputElement>

// 表单事件
React.FormEvent<HTMLFormElement>
React.ChangeEvent<HTMLInputElement>
React.FocusEvent<HTMLInputElement>

// 拖放事件
React.DragEvent<HTMLDivElement>

// 触摸事件
React.TouchEvent<HTMLDivElement>
```

## 9. 弃用API

### 9.1 已移除API (React 18+)

```tsx
// ❌ React.render (使用createRoot)
// ❌ React.hydrate (使用hydrateRoot)
// ❌ ReactDOM.unmountComponentAtNode (使用root.unmount())
```

### 9.2 不推荐API

```tsx
// ⚠️ componentWillMount (使用componentDidMount)
// ⚠️ componentWillReceiveProps (使用getDerivedStateFromProps)
// ⚠️ componentWillUpdate (使用getSnapshotBeforeUpdate)
// ⚠️ findDOMNode (使用ref)
// ⚠️ 字符串ref (使用createRef或useRef)
// ⚠️ Legacy Context API (使用createContext)
```

## 10. 常用模式

### 10.1 条件渲染

```tsx
// if-else
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
{condition && <Component /> || <Fallback />}
```

### 10.2 列表渲染

```tsx
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

### 10.3 表单处理

```tsx
// 受控组件
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />

// 非受控组件
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
```

### 10.4 错误边界

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 10.5 Context使用

```tsx
const ThemeContext = createContext('light');

function Provider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function Consumer() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

## 11. 性能优化API

### 11.1 memo

```tsx
const MemoComponent = React.memo(Component);
```

### 11.2 useMemo

```tsx
const value = useMemo(() => expensiveComputation(), [deps]);
```

### 11.3 useCallback

```tsx
const callback = useCallback(() => {}, [deps]);
```

### 11.4 lazy + Suspense

```tsx
const Lazy = lazy(() => import('./Component'));
<Suspense fallback={<Loading />}><Lazy /></Suspense>
```

### 11.5 startTransition

```tsx
startTransition(() => {
  setQuery(input);
});
```

## 12. 快速参考表

### 12.1 Hooks对比

| Hook | 用途 | 返回值 |
|------|------|--------|
| useState | 状态管理 | [state, setState] |
| useEffect | 副作用 | cleanup函数 |
| useContext | 消费Context | context值 |
| useReducer | 复杂状态 | [state, dispatch] |
| useCallback | 缓存函数 | memoized函数 |
| useMemo | 缓存值 | memoized值 |
| useRef | 可变引用 | ref对象 |
| useImperativeHandle | 自定义ref | undefined |
| useLayoutEffect | 同步副作用 | cleanup函数 |
| useDebugValue | 调试标签 | undefined |

### 12.2 生命周期对应

| 类组件 | 函数组件 |
|--------|----------|
| constructor | useState |
| componentDidMount | useEffect(() => {}, []) |
| componentDidUpdate | useEffect(() => {}) |
| componentWillUnmount | useEffect(() => () => {}) |
| shouldComponentUpdate | React.memo |
| getDerivedStateFromProps | useEffect + setState |

### 12.3 常用快捷键

```tsx
// 组件快速创建
rfce  // React函数组件导出
rafc  // React箭头函数组件
rfc   // React函数组件

// Hook快速创建
useState  → const [state, setState] = useState(initialState)
useEffect → useEffect(() => {}, [])
useContext → const value = useContext(Context)
```

## 13. 总结

React 19 API核心要点:

1. **组件**: Component, PureComponent, memo
2. **Hooks**: 20+个内置Hooks
3. **渲染**: createRoot, hydrateRoot
4. **工具**: lazy, Suspense, Portal
5. **React 19新增**: use, useOptimistic, useFormStatus, Server Components
6. **性能**: memo, useMemo, useCallback, Suspense
7. **弃用**: findDOMNode, 字符串ref, Legacy API

本速查表涵盖了React 19的所有核心API,适合快速查阅和参考。

