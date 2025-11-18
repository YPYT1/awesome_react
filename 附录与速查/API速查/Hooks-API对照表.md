# Hooks API对照表

本文档提供React所有Hooks的详细对照表，包括用法、参数、返回值、使用场景等完整信息。

## 1. 基础Hooks

### 1.1 useState

**签名**
```tsx
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
```

**参数**
- `initialState`: 初始状态值或返回初始值的函数

**返回值**
- `[state, setState]`: 当前状态和更新函数

**使用场景**
- 管理组件本地状态
- 简单的状态逻辑
- 独立的状态值

**示例**
```tsx
// 基础用法
const [count, setCount] = useState(0);

// 函数式初始化
const [data, setData] = useState(() => expensiveComputation());

// 函数式更新
setCount(prevCount => prevCount + 1);

// 对象状态
const [user, setUser] = useState({ name: '', age: 0 });
setUser(prev => ({ ...prev, name: 'John' }));
```

**注意事项**
- 不能在循环、条件或嵌套函数中调用
- 状态更新是异步的
- 使用函数式更新获取最新状态

---

### 1.2 useEffect

**签名**
```tsx
function useEffect(effect: EffectCallback, deps?: DependencyList): void

type EffectCallback = () => (void | Destructor);
type Destructor = () => void;
```

**参数**
- `effect`: 副作用函数，可选返回清理函数
- `deps`: 依赖数组（可选）

**返回值**
- 无

**使用场景**
- 数据获取
- 订阅/取消订阅
- DOM操作
- 定时器管理
- 日志记录

**示例**
```tsx
// 仅mount时执行
useEffect(() => {
  fetchData();
}, []);

// 依赖变化时执行
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// 带清理函数
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);

// 每次渲染都执行
useEffect(() => {
  document.title = `Count: ${count}`;
});
```

**执行时机**
- Mount后异步执行
- 依赖变化后异步执行
- Unmount前执行清理函数

**注意事项**
- 必须包含所有依赖
- 避免在effect中直接修改依赖
- 清理函数必须清理所有副作用

---

### 1.3 useContext

**签名**
```tsx
function useContext<T>(context: React.Context<T>): T
```

**参数**
- `context`: React.createContext创建的Context对象

**返回值**
- Context的当前值

**使用场景**
- 读取Context值
- 主题切换
- 用户认证状态
- 国际化
- 全局配置

**示例**
```tsx
// 创建Context
const ThemeContext = createContext('light');

// 提供值
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Child />
    </ThemeContext.Provider>
  );
}

// 消费值
function Child() {
  const theme = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}

// 多个Context
function Component() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const config = useContext(ConfigContext);
  
  return <div>{/* ... */}</div>;
}
```

**注意事项**
- Provider value变化时所有Consumer重渲染
- 使用useMemo优化Provider value
- 考虑拆分Context避免不必要渲染

---

## 2. 额外Hooks

### 2.1 useReducer

**签名**
```tsx
function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  initializer?: undefined
): [ReducerState<R>,<dispatch<ReducerAction<R>>]
```

**参数**
- `reducer`: (state, action) => newState
- `initialState`: 初始状态
- `init`: 初始化函数（可选）

**返回值**
- `[state, dispatch]`: 当前状态和dispatch函数

**使用场景**
- 复杂状态逻辑
- 多个子值的状态
- 下一个状态依赖前一个状态
- 深度嵌套的组件传递回调

**示例**
```tsx
// 基础用法
type State = { count: number };
type Action = { type: 'increment' | 'decrement' | 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </>
  );
}

// 惰性初始化
function init(initialCount) {
  return { count: initialCount };
}

const [state, dispatch] = useReducer(reducer, 0, init);
```

**对比useState**
| 特性 | useState | useReducer |
|------|----------|------------|
| 状态逻辑 | 简单 | 复杂 |
| 状态结构 | 单一值 | 对象/多值 |
| 更新方式 | 直接设置 | dispatch action |
| 测试性 | 中等 | 好（纯函数） |

---

### 2.2 useCallback

**签名**
```tsx
function useCallback<T extends Function>(callback: T, deps: DependencyList): T
```

**参数**
- `callback`: 要缓存的函数
- `deps`: 依赖数组

**返回值**
- 缓存的函数

**使用场景**
- 传递给优化子组件的回调
- useEffect的依赖
- 避免子组件不必要的重渲染

**示例**
```tsx
// 基础用法
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b]
);

// 传递给子组件
const MemoChild = React.memo(Child);

function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <MemoChild onClick={handleClick} />;
}

// 作为useEffect依赖
function Component({ id }) {
  const fetchData = useCallback(() => {
    return fetch(`/api/data/${id}`);
  }, [id]);
  
  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]);
}
```

**等价关系**
```tsx
useCallback(fn, deps) === useMemo(() => fn, deps)
```

**注意事项**
- 只在必要时使用（传给memo组件）
- 不要过度优化
- 依赖必须完整

---

### 2.3 useMemo

**签名**
```tsx
function useMemo<T>(factory: () => T, deps: DependencyList): T
```

**参数**
- `factory`: 返回缓存值的函数
- `deps`: 依赖数组

**返回值**
- 缓存的值

**使用场景**
- 昂贵的计算
- 避免子组件不必要重渲染
- 优化引用相等性

**示例**
```tsx
// 昂贵计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 避免创建新对象
const config = useMemo(() => ({
  api: 'https://api.example.com',
  timeout: 5000
}), []);

// 过滤和排序
const filteredItems = useMemo(() => {
  return items
    .filter(item => item.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// 传递给子组件
function Parent() {
  const [count, setCount] = useState(0);
  
  const options = useMemo(() => ({
    count,
    multiplier: 2
  }), [count]);
  
  return <MemoChild options={options} />;
}
```

**何时使用**
- 计算成本高（>50ms）
- 引用相等性重要
- 对象/数组作为依赖或props

**何时不用**
- 简单计算（count * 2）
- 基本类型值
- 过度优化反而降低性能

---

### 2.4 useRef

**签名**
```tsx
function useRef<T>(initialValue: T): MutableRefObject<T>
function useRef<T>(initialValue: T | null): RefObject<T>
function useRef<T = undefined>(): MutableRefObject<T | undefined>
```

**参数**
- `initialValue`: 初始值

**返回值**
- `{ current: T }`: ref对象

**使用场景**
- 访问DOM元素
- 保存可变值（不触发渲染）
- 保存前一个值
- 保存定时器ID
- 存储不需要触发渲染的数据

**示例**
```tsx
// DOM引用
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focus = () => {
    inputRef.current?.focus();
  };
  
  return <input ref={inputRef} />;
}

// 保存可变值
function Component() {
  const countRef = useRef(0);
  
  const handleClick = () => {
    countRef.current++; // 不触发重渲染
    console.log(countRef.current);
  };
}

// 保存前一个值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 保存定时器ID
function Component() {
  const timerRef = useRef<number>();
  
  useEffect(() => {
    timerRef.current = window.setInterval(() => {}, 1000);
    
    return () => clearInterval(timerRef.current);
  }, []);
}

// 保存最新回调
function useLatestCallback<T extends Function>(callback: T) {
  const ref = useRef(callback);
  
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  
  return ref;
}
```

**useRef vs useState**
| 特性 | useRef | useState |
|------|--------|----------|
| 触发渲染 | 否 | 是 |
| 值获取 | .current | 直接 |
| 更新时机 | 同步 | 异步 |
| 用途 | 可变值/DOM | 状态 |

---

### 2.5 useImperativeHandle

**签名**
```tsx
function useImperativeHandle<T, R extends T>(
  ref: Ref<T>,
  createHandle: () => R,
  deps?: DependencyList
): void
```

**参数**
- `ref`: 父组件传入的ref
- `createHandle`: 返回暴露对象的函数
- `deps`: 依赖数组

**返回值**
- 无

**使用场景**
- 自定义ref暴露的值
- 限制父组件可调用的方法
- 封装复杂组件的API

**示例**
```tsx
// 基础用法
const FancyInput = forwardRef<
  { focus: () => void; clear: () => void },
  { placeholder?: string }
>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }));
  
  return <input ref={inputRef} {...props} />;
});

// 使用
function Parent() {
  const inputRef = useRef<{ focus: () => void; clear: () => void }>(null);
  
  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
      <button onClick={() => inputRef.current?.clear()}>Clear</button>
    </>
  );
}

// 视频播放器示例
const VideoPlayer = forwardRef((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  }));
  
  return <video ref={videoRef} {...props} />;
});
```

**注意事项**
- 通常与forwardRef一起使用
- 避免过度使用，优先使用props
- 依赖数组要包含所有使用的变量

---

### 2.6 useLayoutEffect

**签名**
```tsx
function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void
```

**参数**
- 同useEffect

**返回值**
- 无

**使用场景**
- DOM测量
- 同步DOM更新
- 避免视觉闪烁
- 动画初始化

**示例**
```tsx
// DOM测量
function Component() {
  const [height, setHeight] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    if (divRef.current) {
      setHeight(divRef.current.offsetHeight);
    }
  }, []);
  
  return <div ref={divRef}>Content</div>;
}

// 避免闪烁
function Tooltip() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      // 同步调整位置，避免闪烁
      setPosition({
        x: Math.min(rect.x, window.innerWidth - rect.width),
        y: Math.min(rect.y, window.innerHeight - rect.height)
      });
    }
  }, []);
  
  return <div ref={tooltipRef} style={{ left: position.x, top: position.y }} />;
}
```

**useLayoutEffect vs useEffect**
| 特性 | useLayoutEffect | useEffect |
|------|----------------|-----------|
| 执行时机 | DOM更新后同步 | DOM更新后异步 |
| 阻塞渲染 | 是 | 否 |
| 用途 | DOM测量/同步更新 | 数据获取/订阅 |
| SSR | 警告 | 正常 |

**注意事项**
- 会阻塞视觉更新
- 大多数情况使用useEffect
- SSR时会有警告

---

### 2.7 useDebugValue

**签名**
```tsx
function useDebugValue<T>(value: T, format?: (value: T) => any): void
```

**参数**
- `value`: 要显示的值
- `format`: 格式化函数（可选）

**返回值**
- 无

**使用场景**
- 自定义Hook调试
- 显示Hook状态
- 开发工具增强

**示例**
```tsx
// 基础用法
function useCustomHook(value) {
  useDebugValue(value);
  return value;
}

// 格式化显示
function useFetch(url) {
  const [data, setData] = useState(null);
  
  useDebugValue(data, data => 
    data ? `${data.length} items` : 'Loading...'
  );
  
  // ...
  
  return data;
}

// 复杂状态显示
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useDebugValue(isOnline ? 'Online' : 'Offline');
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

**注意事项**
- 仅在React DevTools中可见
- 不影响生产环境性能
- 格式化函数仅在检查时调用

---

## 3. React 18+ Hooks

### 3.1 useId

**签名**
```tsx
function useId(): string
```

**参数**
- 无

**返回值**
- 唯一ID字符串

**使用场景**
- 生成表单元素ID
- 无障碍属性
- 避免SSR hydration不匹配

**示例**
```tsx
// 基础用法
function FormField({ label }) {
  const id = useId();
  
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}

// 多个元素
function Component() {
  const id = useId();
  
  return (
    <>
      <label htmlFor={`${id}-name`}>Name</label>
      <input id={`${id}-name`} />
      
      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} />
    </>
  );
}

// 无障碍
function Dialog() {
  const titleId = useId();
  const descId = useId();
  
  return (
    <div role="dialog" aria-labelledby={titleId} aria-describedby={descId}>
      <h2 id={titleId}>Title</h2>
      <p id={descId}>Description</p>
    </div>
  );
}
```

**注意事项**
- 不要用于key
- 服务端和客户端生成相同ID
- 每次调用生成不同ID

---

### 3.2 useTransition

**签名**
```tsx
function useTransition(): [boolean, (callback: () => void) => void]
```

**参数**
- 无

**返回值**
- `[isPending, startTransition]`

**使用场景**
- 标记非紧急更新
- 保持UI响应
- 大列表渲染
- 复杂计算

**示例**
```tsx
// 基础用法
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value); // 紧急更新
    
    startTransition(() => {
      // 非紧急更新
      const searchResults = performExpensiveSearch(value);
      setResults(searchResults);
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList results={results} />
    </>
  );
}

// Tab切换
function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();
  
  const selectTab = (nextTab) => {
    startTransition(() => {
      setTab(nextTab);
    });
  };
  
  return (
    <>
      <TabButton onClick={() => selectTab('home')} active={tab === 'home'}>
        Home
      </TabButton>
      <TabButton onClick={() => selectTab('posts')} active={tab === 'posts'}>
        Posts {isPending && <Spinner />}
      </TabButton>
      <TabPanel tab={tab} />
    </>
  );
}
```

**对比setTimeout**
- useTransition: React调度，可中断
- setTimeout: 固定延迟，不可中断

---

### 3.3 useDeferredValue

**签名**
```tsx
function useDeferredValue<T>(value: T): T
```

**参数**
- `value`: 要延迟的值

**返回值**
- 延迟后的值

**使用场景**
- 延迟非紧急UI更新
- 搜索输入优化
- 大列表渲染优化

**示例**
```tsx
// 基础用法
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(() => {
    return performExpensiveSearch(deferredQuery);
  }, [deferredQuery]);
  
  return <ResultList results={results} />;
}

// 完整示例
function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const isStale = query !== deferredQuery;
  
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </>
  );
}
```

**useTransition vs useDeferredValue**
- useTransition: 包装更新函数
- useDeferredValue: 包装值本身

---

### 3.4 useSyncExternalStore

**签名**
```tsx
function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T
): T
```

**参数**
- `subscribe`: 订阅函数
- `getSnapshot`: 获取当前值
- `getServerSnapshot`: SSR时的值

**返回值**
- 外部store的当前值

**使用场景**
- 订阅外部store
- 浏览器API
- 第三方状态库

**示例**
```tsx
// Window宽度
function useWindowWidth() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth,
    () => 0 // SSR默认值
  );
}

// 在线状态
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true
  );
}

// 自定义store
class Store {
  private listeners = new Set<() => void>();
  private state = { count: 0 };
  
  subscribe = (callback: () => void) => {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  };
  
  getSnapshot = () => {
    return this.state;
  };
  
  increment = () => {
    this.state = { count: this.state.count + 1 };
    this.listeners.forEach(listener => listener());
  };
}

const store = new Store();

function Counter() {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
  
  return (
    <>
      <div>Count: {state.count}</div>
      <button onClick={store.increment}>Increment</button>
    </>
  );
}
```

---

### 3.5 useInsertionEffect

**签名**
```tsx
function useInsertionEffect(effect: EffectCallback, deps?: DependencyList): void
```

**参数**
- 同useEffect

**返回值**
- 无

**使用场景**
- CSS-in-JS库
- 动态插入样式
- 性能优化

**示例**
```tsx
// CSS-in-JS
function useCSS(rule) {
  useInsertionEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = rule;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [rule]);
}

function Component() {
  useCSS('.my-class { color: red; }');
  return <div className="my-class">Styled</div>;
}
```

**执行顺序**
1. useInsertionEffect
2. useLayoutEffect
3. useEffect

---

## 4. React 19 Hooks

### 4.1 use

**签名**
```tsx
function use<T>(resource: Promise<T> | Context<T>): T
```

**参数**
- Promise或Context

**返回值**
- Promise的resolved值或Context值

**使用场景**
- 在渲染中读取Promise
- 条件读取Context
- Suspense集成

**示例**
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

// 条件使用
function Component({ useCustomTheme }) {
  const theme = useCustomTheme ? use(CustomThemeContext) : 'default';
  return <div>{theme}</div>;
}
```

---

### 4.2 useOptimistic

**签名**
```tsx
function useOptimistic<State, Update>(
  state: State,
  updateFn: (currentState: State, optimisticValue: Update) => State
): [State, (update: Update) => void]
```

**参数**
- `state`: 当前状态
- `updateFn`: 乐观更新函数

**返回值**
- `[optimisticState, addOptimistic]`

**使用场景**
- 表单提交
- 点赞/收藏
- 实时协作
- 即时反馈

**示例**
```tsx
// 发送消息
function ChatInput({ sendMessage }) {
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (current, newMessage) => [...current, newMessage]
  );
  
  const handleSubmit = async (text) => {
    const tempMessage = { id: Date.now(), text, pending: true };
    addOptimisticMessage(tempMessage);
    
    const response = await sendMessage(text);
    setMessages([...messages, response]);
  };
  
  return (
    <>
      <MessageList messages={optimisticMessages} />
      <form onSubmit={handleSubmit}>...</form>
    </>
  );
}
```

---

### 4.3 useFormStatus

**签名**
```tsx
function useFormStatus(): {
  pending: boolean;
  data: FormData | null;
  method: string | null;
  action: string | null;
}
```

**参数**
- 无

**返回值**
- 表单状态对象

**使用场景**
- 表单提交状态
- 禁用提交按钮
- 显示加载状态

**示例**
```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function Form() {
  async function handleSubmit(formData) {
    await submitToServer(formData);
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" />
      <SubmitButton />
    </form>
  );
}
```

---

### 4.4 useFormState

**签名**
```tsx
function useFormState<State>(
  action: (state: State, payload: FormData) => Promise<State>,
  initialState: State
): [State, (payload: FormData) => void]
```

**参数**
- `action`: Server Action
- `initialState`: 初始状态

**返回值**
- `[state, formAction]`

**使用场景**
- 表单验证
- 服务端状态
- 错误处理

**示例**
```tsx
async function createUser(prevState, formData) {
  try {
    const user = await db.users.create({
      name: formData.get('name')
    });
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

function Form() {
  const [state, formAction] = useFormState(createUser, {
    user: null,
    error: null
  });
  
  return (
    <form action={formAction}>
      <input name="name" />
      {state.error && <p>{state.error}</p>}
      <button>Create</button>
    </form>
  );
}
```

---

## 5. Hooks使用规则

### 5.1 调用规则

```tsx
// ✅ 正确
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {});
  const value = useContext(MyContext);
  
  return <div>{count}</div>;
}

// ❌ 错误: 条件调用
function Component({ condition }) {
  if (condition) {
    const [count, setCount] = useState(0); // ❌
  }
}

// ❌ 错误: 循环调用
function Component() {
  for (let i = 0; i < 10; i++) {
    useState(0); // ❌
  }
}

// ❌ 错误: 嵌套函数调用
function Component() {
  function handleClick() {
    useState(0); // ❌
  }
}
```

### 5.2 依赖规则

```tsx
// ✅ 包含所有依赖
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// ❌ 缺少依赖
useEffect(() => {
  fetchUser(userId);
}, []); // userId缺失

// ✅ 使用ESLint检查
// eslint-plugin-react-hooks
```

### 5.3 命名规则

```tsx
// ✅ 自定义Hook以use开头
function useCustomHook() {
  const [state, setState] = useState(null);
  return state;
}

// ❌ 错误命名
function customHook() { } // 不以use开头
function UseCustomHook() { } // 首字母大写
```

## 6. Hooks最佳实践

### 6.1 选择合适的Hook

```typescript
const hookSelection = {
  简单状态: 'useState',
  复杂状态: 'useReducer',
  副作用: 'useEffect',
  同步副作用: 'useLayoutEffect',
  Context: 'useContext',
  缓存函数: 'useCallback',
  缓存值: 'useMemo',
  可变引用: 'useRef',
  非紧急更新: 'useTransition/useDeferredValue'
};
```

### 6.2 性能优化

```tsx
// 避免过度优化
// ❌ 简单计算不需要useMemo
const doubled = useMemo(() => count * 2, [count]);

// ✅ 简单计算直接使用
const doubled = count * 2;

// ✅ 昂贵计算使用useMemo
const sorted = useMemo(() => 
  items.sort((a, b) => a.value - b.value),
  [items]
);
```

### 6.3 自定义Hooks

```tsx
// 提取重复逻辑
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
```

## 7. 总结

React Hooks完整对照:

1. **基础**: useState, useEffect, useContext
2. **额外**: useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue
3. **React 18**: useId, useTransition, useDeferredValue, useSyncExternalStore, useInsertionEffect
4. **React 19**: use, useOptimistic, useFormStatus, useFormState, useActionState

选择合适的Hook,遵循使用规则,编写高质量React代码。

