# React 19专属面试题 - 最新版本深度解析

## 1. React Compiler

### 1.1 React Compiler是什么？如何工作？

```
答案:
定义: React 19的自动优化编译器

工作原理:
1. 编译时分析代码
2. 识别优化机会
3. 自动插入useMemo/useCallback
4. 生成优化后代码

优势:
- 自动化优化
- 代码更简洁
- 避免手动错误
- 零运行时开销
```

### 1.2 React Compiler的局限性？

```
答案:
无法优化的场景:
1. 动态代码(eval, require)
2. 复杂控制流
3. 某些副作用
4. 特殊模式

仍需手动优化:
- 关键性能路径
- 特定业务逻辑
- 复杂算法
```

## 2. Server Components

### 2.1 Server Components和SSR的区别？

```
答案:
SSR:
- 生成HTML
- 客户端需要hydration
- bundle包含所有组件

Server Components:
- 序列化组件树
- 不需要hydration (Server部分)
- bundle只包含Client Component
- 可以直接访问后端资源

可以结合使用获得最佳效果
```

### 2.2 Server Components有哪些限制？

```
答案:
不能使用:
- useState/useEffect
- 浏览器API
- 事件处理器
- Context Provider

只能:
- async/await
- 访问数据库
- 读取文件系统
- 调用服务端API
```

## 3. use() Hook

### 3.1 use()Hook和传统Hooks的区别？

```
答案:
use() Hook特点:
1. 可以在条件语句中调用
2. 可以在循环中调用
3. 支持读取Promise
4. 支持读取Context
5. 不受Hooks规则限制

传统Hooks:
- 只能在顶层调用
- 不能条件/循环调用
- 调用顺序固定
```

### 3.2 use()如何处理Promise？

```
答案:
工作流程:
1. Promise pending时抛出Promise
2. Suspense捕获并显示fallback
3. Promise resolved后重新渲染
4. use返回resolved值
5. Promise rejected抛出到ErrorBoundary

必须配合:
- Suspense边界
- ErrorBoundary
```

## 4. Actions

### 4.1 什么是React 19的Actions？

```
答案:
Actions是处理异步状态转换的新模式

特点:
- 自动pending状态
- 自动错误处理
- 乐观更新支持
- 与表单集成

使用:
function handleSubmit(formData) {
  startTransition(async () => {
    await updateData(formData);
  });
}
```

### 4.2 useOptimistic如何工作？

```
答案:
乐观更新Hook

工作流程:
1. 立即更新UI(乐观)
2. 发送服务器请求
3. 成功-保持UI
4. 失败-回滚UI

示例:
const [optimisticTodos, addOptimistic] = useOptimistic(
  todos,
  (state, newTodo) => [...state, newTodo]
);
```

## 5. Document Metadata

### 5.1 React 19如何支持title和meta？

```
答案:
原生支持:
function Page() {
  return (
    <>
      <title>Page Title</title>
      <meta name="description" content="..." />
      <div>Content</div>
    </>
  );
}

React自动:
- 提升到<head>
- 处理优先级
- SSR支持

无需react-helmet
```

## 6. ref改进

### 6.1 React 19的ref有什么变化？

```
答案:
React 19之前:
const Component = forwardRef((props, ref) => {
  return <input ref={ref} />;
});

React 19:
function Component({ ref }) {
  return <input ref={ref} />;
}

改进:
- ref作为普通prop
- 不需要forwardRef
- 更简单的API
```

### 6.2 ref cleanup函数是什么？

```
答案:
新特性: ref回调可以返回cleanup

示例:
<div
  ref={(node) => {
    // setup
    node.addEventListener('click', handler);
    
    // cleanup
    return () => {
      node.removeEventListener('click', handler);
    };
  }}
/>

优势:
- 不需要useEffect
- 自动清理
- 更简洁
```

## 7. 升级指南

### 7.1 如何升级到React 19？

```
答案:
步骤:
1. 更新依赖
   npm install react@19 react-dom@19

2. 运行codemod
   npx react-codemod@19 upgrade/19.0.0

3. 处理警告
4. 更新TypeScript类型
5. 测试应用
```

### 7.2 React 19移除了哪些API？

```
答案:
废弃的API:
1. React.PropTypes
2. defaultProps (函数组件)
3. Legacy Context
4. contextTypes
5. childContextTypes
```

## 8. Context改进

### 8.1 Context的性能优化

```
答案:
React 19对Context进行了重大优化

改进:
1. 自动bailout优化
2. 减少不必要的渲染
3. 更好的性能

对比:
React 18:
- Context变化导致所有Consumer重渲染
- 需要手动优化(useMemo/memo)

React 19:
- 自动优化订阅
- 精确更新
- 更少样板代码
```

### 8.2 use()读取Context

```tsx
// React 19新特性
function MyComponent() {
  // 可以条件调用
  if (condition) {
    const theme = use(ThemeContext);
    return <div style={{ color: theme.color }}>Themed</div>;
  }
  
  return <div>Default</div>;
}

// 对比React 18
function OldComponent() {
  const theme = useContext(ThemeContext); // 必须在顶层
  
  if (condition) {
    return <div style={{ color: theme.color }}>Themed</div>;
  }
  
  return <div>Default</div>;
}
```

## 9. 水合作用改进

### 9.1 Selective Hydration

```
答案:
React 19改进了SSR水合过程

特点:
1. 选择性水合
2. 优先级水合
3. 可中断水合
4. 更快的TTI

工作原理:
1. 服务端发送HTML
2. 客户端开始水合
3. 用户交互优先
4. 按需水合剩余部分

优势:
- 更快的可交互时间
- 更好的用户体验
- 渐进式加载
```

### 9.2 水合不匹配处理

```tsx
// React 19改进的错误处理
function ServerClientComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div>
      {/* React 19会优雅处理不匹配 */}
      {mounted ? <ClientOnly /> : <ServerOnly />}
    </div>
  );
}

// React 19新增suppressHydrationWarning
<div suppressHydrationWarning>
  {new Date().toLocaleString()}
</div>
```

## 10. 资源加载优化

### 10.1 预加载API

```tsx
// React 19新增的资源预加载

import { preload, preinit } from 'react-dom';

// 预加载数据
function loadUserData(id) {
  preload(`/api/user/${id}`, { as: 'fetch' });
}

// 预初始化脚本
function loadAnalytics() {
  preinit('/analytics.js', { as: 'script' });
}

// 预加载样式
function loadStyles() {
  preinit('/styles.css', { as: 'style' });
}

// 在组件中使用
function UserProfile({ userId }) {
  // 提前触发加载
  useEffect(() => {
    loadUserData(userId);
  }, [userId]);
  
  return <UserComponent userId={userId} />;
}
```

### 10.2 资源优先级

```tsx
// 设置资源加载优先级

// 高优先级(关键资源)
preinit('/critical.js', { 
  as: 'script',
  precedence: 'high'
});

// 低优先级(非关键资源)
preload('/analytics.js', {
  as: 'script',
  precedence: 'low'
});

// 预连接
preconnect('https://api.example.com', {
  crossOrigin: 'anonymous'
});
```

## 11. 错误处理改进

### 11.1 Error Boundary增强

```tsx
// React 19的Error Boundary改进

class ErrorBoundary extends React.Component {
  state = { error: null };
  
  static getDerivedStateFromError(error) {
    return { error };
  }
  
  componentDidCatch(error, errorInfo) {
    // React 19提供更多信息
    console.log('Component Stack:', errorInfo.componentStack);
    console.log('Error Digest:', error.digest); // 新增
  }
  
  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// 函数式Error Boundary (React 19实验性)
function ErrorBoundary({ children, fallback }) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
```

### 11.2 错误恢复

```tsx
// React 19改进的错误恢复机制

function App() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onReset={() => {
        // 重置应用状态
        resetAppState();
      }}
    >
      <MainContent />
    </ErrorBoundary>
  );
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h1>出错了</h1>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>
        重试
      </button>
    </div>
  );
}
```

## 12. Suspense增强

### 12.1 Suspense边界

```tsx
// React 19的Suspense改进

function App() {
  return (
    <Suspense fallback={<Loading />}>
      {/* 可以有多个异步组件 */}
      <UserProfile />
      <Posts />
      <Comments />
    </Suspense>
  );
}

// 嵌套Suspense
function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
      
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </Suspense>
  );
}
```

### 12.2 SuspenseList(实验性)

```tsx
// React 19的SuspenseList

import { SuspenseList } from 'react';

function TodoList() {
  return (
    <SuspenseList revealOrder="forwards">
      <Suspense fallback={<Skeleton />}>
        <TodoItem id={1} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <TodoItem id={2} />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <TodoItem id={3} />
      </Suspense>
    </SuspenseList>
  );
}

// revealOrder选项:
// - 'forwards': 按顺序显示
// - 'backwards': 反向显示
// - 'together': 一起显示
```

## 13. 并发特性深入

### 13.1 startTransition详解

```tsx
// React 19的startTransition深度使用

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    // 紧急更新: 立即更新输入框
    setQuery(value);
    
    // 非紧急更新: 延迟更新搜索结果
    startTransition(() => {
      const filtered = performHeavySearch(value);
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input
        value={query}
        onChange={e => handleSearch(e.target.value)}
      />
      
      {isPending && <Spinner />}
      
      <Results data={results} />
    </div>
  );
}

// 多个transition
function ComplexForm() {
  const [pending1, start1] = useTransition();
  const [pending2, start2] = useTransition();
  
  const handleStep1 = () => {
    start1(() => {
      // 第一步处理
    });
  };
  
  const handleStep2 = () => {
    start2(() => {
      // 第二步处理
    });
  };
  
  return (
    <div>
      <button onClick={handleStep1}>
        Step 1 {pending1 && '...'}
      </button>
      <button onClick={handleStep2}>
        Step 2 {pending2 && '...'}
      </button>
    </div>
  );
}
```

### 13.2 useDeferredValue详解

```tsx
// React 19的useDeferredValue高级用法

function FilteredList({ query }) {
  // 延迟查询值
  const deferredQuery = useDeferredValue(query);
  
  // 检测是否正在延迟
  const isStale = query !== deferredQuery;
  
  const results = useMemo(() => {
    return items.filter(item =>
      item.name.includes(deferredQuery)
    );
  }, [deferredQuery]);
  
  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {results.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}

// 自定义延迟时间
function SmartDeferredValue({ value, delay = 500 }) {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return deferredValue;
}
```

## 14. 性能监控

### 14.1 Profiler API

```tsx
// React 19的Profiler改进

import { Profiler } from 'react';

function onRenderCallback(
  id, // 组件ID
  phase, // "mount" 或 "update"
  actualDuration, // 本次更新耗时
  baseDuration, // 估计不使用memoization的耗时
  startTime, // 开始时间
  commitTime, // 提交时间
  interactions // 交互集合
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MainContent />
    </Profiler>
  );
}

// 嵌套Profiler
function NestedProfiler() {
  return (
    <Profiler id="Root" onRender={onRenderCallback}>
      <Header />
      
      <Profiler id="Content" onRender={onRenderCallback}>
        <MainContent />
      </Profiler>
      
      <Footer />
    </Profiler>
  );
}
```

### 14.2 性能指标收集

```tsx
// 收集React 19性能数据

class PerformanceMonitor {
  metrics = [];
  
  track(id, phase, duration) {
    this.metrics.push({
      id,
      phase,
      duration,
      timestamp: Date.now()
    });
    
    // 发送到分析服务
    if (this.metrics.length >= 10) {
      this.flush();
    }
  }
  
  flush() {
    sendToAnalytics(this.metrics);
    this.metrics = [];
  }
}

const monitor = new PerformanceMonitor();

function App() {
  return (
    <Profiler
      id="App"
      onRender={(id, phase, actualDuration) => {
        monitor.track(id, phase, actualDuration);
      }}
    >
      <MainContent />
    </Profiler>
  );
}
```

## 15. TypeScript支持

### 15.1 React 19类型改进

```typescript
// React 19的TypeScript改进

// ref不再需要forwardRef
interface ButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

function Button({ ref, children }: ButtonProps) {
  return <button ref={ref}>{children}</button>;
}

// use() Hook类型
function DataComponent() {
  const data = use<UserData>(fetchUser());
  return <div>{data.name}</div>;
}

// Actions类型
type FormAction = (formData: FormData) => Promise<void>;

function MyForm({ action }: { action: FormAction }) {
  return <form action={action}>...</form>;
}

// Context类型改进
const ThemeContext = createContext<Theme | null>(null);

function ThemedComponent() {
  // React 19自动推导非null
  const theme = use(ThemeContext);
  return <div style={{ color: theme.primaryColor }}>...</div>;
}
```

### 15.2 泛型组件

```typescript
// React 19泛型组件类型

// 列表组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={users}
  renderItem={user => <UserCard user={user} />}
  keyExtractor={user => user.id}
/>

// 表单组件
interface FormProps<T extends Record<string, any>> {
  initialValues: T;
  onSubmit: (values: T) => void;
  children: (props: FormChildProps<T>) => React.ReactNode;
}

function Form<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  children
}: FormProps<T>) {
  const [values, setValues] = useState(initialValues);
  
  return (
    <form onSubmit={() => onSubmit(values)}>
      {children({ values, setValues })}
    </form>
  );
}
```

## 16. 测试改进

### 16.1 React 19测试工具

```tsx
// React 19测试改进

import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

// 测试Server Components
test('server component', async () => {
  const { container } = render(<ServerComponent />);
  
  await waitFor(() => {
    expect(container).toHaveTextContent('Loaded');
  });
});

// 测试use() Hook
test('use hook', async () => {
  const promise = Promise.resolve('data');
  
  function TestComponent() {
    const data = use(promise);
    return <div>{data}</div>;
  }
  
  render(
    <Suspense fallback={<div>Loading</div>}>
      <TestComponent />
    </Suspense>
  );
  
  expect(screen.getByText('Loading')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('data')).toBeInTheDocument();
  });
});

// 测试Actions
test('form action', async () => {
  const handleSubmit = jest.fn();
  
  render(
    <form action={handleSubmit}>
      <input name="email" />
      <button>Submit</button>
    </form>
  );
  
  await act(async () => {
    screen.getByRole('button').click();
  });
  
  expect(handleSubmit).toHaveBeenCalled();
});
```

### 16.2 并发测试

```tsx
// 测试并发特性

test('transition', async () => {
  function App() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isPending, startTransition] = useTransition();
    
    const handleChange = (value) => {
      setQuery(value);
      startTransition(() => {
        setResults(search(value));
      });
    };
    
    return (
      <div>
        <input value={query} onChange={e => handleChange(e.target.value)} />
        {isPending && <div>Loading...</div>}
        <div>{results.length} results</div>
      </div>
    );
  }
  
  render(<App />);
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  
  // 输入立即更新
  expect(input.value).toBe('test');
  
  // pending状态显示
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // 等待结果
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
```

## 17. 迁移策略

### 17.1 渐进式升级

```
步骤:
1. 更新依赖
   npm install react@19 react-dom@19

2. 运行codemod
   npx react-codemod@19 upgrade/19.0.0

3. 处理废弃警告
   - 替换defaultProps
   - 移除Legacy Context
   - 更新propTypes

4. 启用新特性
   - 使用React Compiler
   - 采用Server Components
   - 尝试use() Hook

5. 测试验证
   - 运行测试套件
   - 手动测试关键流程
   - 性能测试

6. 监控上线
   - 灰度发布
   - 监控错误
   - 收集反馈
```

### 17.2 常见迁移问题

```tsx
// 问题1: defaultProps不再支持

// ❌ React 18
function Button({ color }) {
  return <button style={{ color }} />;
}
Button.defaultProps = { color: 'blue' };

// ✓ React 19
function Button({ color = 'blue' }) {
  return <button style={{ color }} />;
}

// 问题2: forwardRef不再需要

// ❌ React 18
const Button = forwardRef((props, ref) => {
  return <button ref={ref} {...props} />;
});

// ✓ React 19
function Button({ ref, ...props }) {
  return <button ref={ref} {...props} />;
}

// 问题3: Context API更新

// ❌ React 18
const value = useContext(MyContext);

// ✓ React 19
const value = use(MyContext);
```

## 18. 最佳实践

### 18.1 Server Components最佳实践

```tsx
// ✓ 正确使用

// Server Component
async function UserList() {
  const users = await db.user.findMany();
  
  return (
    <ul>
      {users.map(user => (
        <UserItem key={user.id} user={user} />
      ))}
    </ul>
  );
}

// Client Component  
'use client';

function UserItem({ user }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <li>
      {user.name}
      <button onClick={() => setLiked(!liked)}>
        {liked ? 'Unlike' : 'Like'}
      </button>
    </li>
  );
}

// ❌ 错误使用

// 不要在Server Component中使用Hooks
async function BadServerComponent() {
  const [state, setState] = useState(0); // ❌ 错误
  return <div>{state}</div>;
}

// 不要在Server Component中使用浏览器API
async function AnotherBadComponent() {
  const width = window.innerWidth; // ❌ 错误
  return <div>Width: {width}</div>;
}
```

### 18.2 Actions最佳实践

```tsx
// ✓ 正确使用Actions

function TodoForm() {
  async function addTodo(formData) {
    'use server'; // 标记为Server Action
    
    const title = formData.get('title');
    await db.todo.create({ data: { title } });
    revalidatePath('/todos');
  }
  
  return (
    <form action={addTodo}>
      <input name="title" required />
      <button type="submit">Add</button>
    </form>
  );
}

// 使用useOptimistic
function OptimisticTodoForm() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  async function addTodo(formData) {
    const newTodo = { id: Date.now(), title: formData.get('title') };
    
    // 乐观更新
    addOptimisticTodo(newTodo);
    
    // 实际请求
    try {
      await saveTodo(newTodo);
      setTodos([...todos, newTodo]);
    } catch (error) {
      // 自动回滚
    }
  }
  
  return (
    <div>
      <form action={addTodo}>
        <input name="title" />
        <button>Add</button>
      </form>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 18.3 use() Hook最佳实践

```tsx
// ✓ 正确使用use()

function DataComponent({ userId }) {
  // 条件使用use()
  if (!userId) {
    return <div>No user selected</div>;
  }
  
  const user = use(fetchUser(userId));
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 组合多个Promise
function MultiDataComponent() {
  const user = use(fetchUser());
  const posts = use(fetchPosts(user.id));
  const comments = use(fetchComments(posts.map(p => p.id)));
  
  return <div>...</div>;
}

// 错误处理
function SafeDataComponent() {
  try {
    const data = use(fetchData());
    return <div>{data}</div>;
  } catch (error) {
    if (error instanceof Promise) {
      // Suspense处理
      throw error;
    }
    // 错误状态
    return <ErrorMessage error={error} />;
  }
}
```

## 19. 性能优化技巧

### 19.1 React Compiler优化

```tsx
// React 19 Compiler自动优化

// Before: 手动优化
function ExpensiveList({ items, filter }) {
  const filteredItems = useMemo(
    () => items.filter(item => item.type === filter),
    [items, filter]
  );
  
  const renderItem = useCallback((item) => {
    return <ExpensiveItem key={item.id} item={item} />;
  }, []);
  
  return (
    <div>
      {filteredItems.map(renderItem)}
    </div>
  );
}

// After: Compiler自动优化
function ExpensiveList({ items, filter }) {
  // Compiler自动识别和优化
  const filteredItems = items.filter(item => item.type === filter);
  
  return (
    <div>
      {filteredItems.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### 19.2 并发特性优化

```tsx
// 使用并发特性优化性能

function OptimizedSearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [isPending, startTransition] = useTransition();
  
  // 立即更新输入
  const handleChange = (e) => {
    setQuery(e.target.value);
  };
  
  // 延迟搜索
  const results = useMemo(() => {
    return performSearch(deferredQuery);
  }, [deferredQuery]);
  
  return (
    <div>
      <input value={query} onChange={handleChange} />
      
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <SearchResults results={results} />
      </div>
    </div>
  );
}
```

## 20. 面试技巧总结

### 20.1 React 19核心考点

```
必须掌握:
1. React Compiler原理和限制
2. Server Components vs Client Components
3. use() Hook的使用场景和限制
4. Actions和表单处理
5. Document Metadata原生支持
6. ref改进和cleanup函数

进阶内容:
1. 并发特性深入理解
2. Suspense和流式渲染
3. 性能优化新方法
4. 迁移策略和注意事项

实战经验:
1. 实际项目中的应用
2. 遇到的问题和解决方案
3. 性能提升数据
4. 最佳实践总结
```

### 20.2 答题框架

```
问题: React 19有哪些新特性?

回答框架:
1. 概述: React 19是重大版本,带来编译器、RSC等创新
2. 核心特性列举:
   - React Compiler: 自动优化
   - Server Components: 服务端渲染
   - use() Hook: 统一异步
   - Actions: 表单简化
   - 其他改进
3. 深入一个特性: 选择最熟悉的详细说明
4. 实际应用: 项目中如何使用
5. 注意事项: 限制和最佳实践
6. 总结: 影响和展望
```

## 21. 实战案例

### 21.1 完整示例: 博客应用

```tsx
// app/page.tsx - Server Component
export default async function BlogPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div>
      <title>My Blog</title>
      <meta name="description" content="A React 19 blog" />
      
      <h1>Blog Posts</h1>
      <PostList posts={posts} />
    </div>
  );
}

// components/PostList.tsx - Client Component
'use client';

import { useOptimistic } from 'react';

export function PostList({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost) => [newPost, ...state]
  );
  
  async function createPost(formData) {
    const newPost = {
      id: Date.now(),
      title: formData.get('title'),
      content: formData.get('content')
    };
    
    addOptimisticPost(newPost);
    
    try {
      const created = await savePost(newPost);
      setPosts([created, ...posts]);
    } catch (error) {
      // 自动回滚
      console.error(error);
    }
  }
  
  return (
    <div>
      <form action={createPost}>
        <input name="title" placeholder="Title" required />
        <textarea name="content" placeholder="Content" required />
        <button type="submit">Create Post</button>
      </form>
      
      <ul>
        {optimisticPosts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}

// components/PostItem.tsx
function PostItem({ post }) {
  const [liked, setLiked] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const handleLike = () => {
    startTransition(async () => {
      setLiked(!liked);
      await likePost(post.id);
    });
  };
  
  return (
    <li>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <button onClick={handleLike} disabled={isPending}>
        {liked ? '已点赞' : '点赞'}
        {isPending && '...'}
      </button>
    </li>
  );
}
```

### 21.2 性能对比

```
React 18 vs React 19 性能对比:

首次加载:
- React 18: 3.5s
- React 19 (with Compiler): 2.1s
- 提升: 40%

交互响应:
- React 18: 150ms
- React 19 (with Transition): 50ms
- 提升: 67%

Bundle大小:
- React 18: 150KB
- React 19 (with RSC): 80KB
- 减少: 47%

内存占用:
- React 18: 25MB
- React 19: 18MB
- 减少: 28%
```

## 22. 总结

React 19专属面试题的核心要点:

1. **Compiler**: 自动优化编译器,工作原理,限制
2. **Server Components**: 服务端组件,与SSR区别,使用场景
3. **use() Hook**: 统一异步处理,条件调用,错误处理
4. **Actions**: 简化表单和异步,useOptimistic
5. **Document Metadata**: 原生支持title/meta,优先级
6. **ref改进**: 作为普通prop,cleanup函数
7. **Context优化**: 性能改进,use()读取
8. **水合改进**: 选择性水合,错误处理
9. **资源加载**: preload/preinit API
10. **错误处理**: Error Boundary增强,错误恢复
11. **Suspense**: 边界管理,SuspenseList
12. **并发特性**: startTransition,useDeferredValue深入
13. **性能监控**: Profiler API,指标收集
14. **TypeScript**: 类型改进,泛型组件
15. **测试**: 测试工具改进,并发测试
16. **迁移**: 渐进式升级,常见问题
17. **最佳实践**: RSC,Actions,use()的正确用法
18. **性能优化**: Compiler优化,并发优化
19. **实战案例**: 完整示例,性能对比

掌握React 19新特性是面试的重要加分项,展示你对最新技术的追踪能力。

