# use()与useEffect对比

## 学习目标

通过本章学习，你将掌握：

- use()和useEffect的根本区别
- 各自的适用场景
- 数据获取的两种范式
- 何时使用use()替代useEffect
- 何时仍需要useEffect
- 迁移策略和最佳实践
- 性能对比分析
- 实际项目中的选择策略

## 第一部分：概念对比

### 1.1 根本区别

```jsx
// useEffect：副作用执行
// - 异步执行
// - 组件渲染后执行
// - 用于执行操作（数据获取、订阅、DOM操作等）

function WithUseEffect({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);
  
  if (loading) return <div>加载中...</div>;
  return <div>{user?.name}</div>;
}

// use()：资源读取
// - 同步返回（抛出Promise）
// - 组件渲染时读取
// - 用于读取数据（Promise、Context）

function WithUse({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// 使用
<Suspense fallback={<div>加载中...</div>}>
  <WithUse userPromise={fetchUser(userId)} />
</Suspense>
```

### 1.2 执行时机对比

```jsx
function TimingComparison() {
  console.log('1. 组件渲染');
  
  // use()在渲染时执行
  const data = use(dataPromise);
  console.log('2. use()返回数据:', data);
  
  useEffect(() => {
    // useEffect在渲染后执行
    console.log('3. useEffect执行');
  });
  
  console.log('4. 返回JSX');
  return <div>{data}</div>;
}

// 输出顺序：
// 1. 组件渲染
// 2. use()返回数据: {...}
// 4. 返回JSX
// 3. useEffect执行
```

### 1.3 特性对比表

| 特性 | useEffect | use() |
|------|-----------|-------|
| **执行时机** | 渲染后 | 渲染时 |
| **返回值** | undefined | Promise的值 |
| **加载状态** | 手动管理 | Suspense管理 |
| **错误处理** | try-catch | ErrorBoundary |
| **条件调用** | ❌ 不允许 | ✅ 允许 |
| **依赖数组** | ✅ 需要 | ❌ 不需要 |
| **清理函数** | ✅ 支持 | ❌ 不支持 |
| **适用场景** | 副作用执行 | 数据读取 |

## 第二部分：数据获取对比

### 2.1 初始数据获取

```jsx
// ========== useEffect方式 ==========
function UserProfileWithEffect({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    fetchUser(userId)
      .then(data => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// ========== use()方式 ==========
function UserProfileWithUse({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <ErrorBoundary fallback={<div>错误</div>}>
      <Suspense fallback={<div>加载中...</div>}>
        <UserContent userPromise={userPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}

function UserContent({ userPromise }) {
  const user = use(userPromise);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 对比：
// useEffect: 23行代码，需要管理3个状态
// use(): 8行核心代码，声明式
```

### 2.2 依赖数据获取

```jsx
// ========== useEffect方式 ==========
function UserPostsWithEffect({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 第一步：获取用户
  useEffect(() => {
    setLoading(true);
    fetchUser(userId).then(data => {
      setUser(data);
    });
  }, [userId]);
  
  // 第二步：获取文章（依赖user）
  useEffect(() => {
    if (user) {
      fetchPosts(user.id).then(data => {
        setPosts(data);
        setLoading(false);
      });
    }
  }, [user]);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      <h1>{user?.name}的文章</h1>
      <ul>
        {posts?.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// ========== use()方式 ==========
function UserPostsWithUse({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<div>加载用户...</div>}>
      <UserWithPosts userPromise={userPromise} />
    </Suspense>
  );
}

function UserWithPosts({ userPromise }) {
  const user = use(userPromise);
  const postsPromise = useMemo(() => fetchPosts(user.id), [user.id]);
  
  return (
    <div>
      <h1>{user.name}的文章</h1>
      <Suspense fallback={<div>加载文章...</div>}>
        <PostsList postsPromise={postsPromise} />
      </Suspense>
    </div>
  );
}

function PostsList({ postsPromise }) {
  const posts = use(postsPromise);
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// 对比：
// useEffect: 需要两个effect，复杂的状态管理
// use(): 清晰的数据流，嵌套的Suspense边界
```

### 2.3 并行数据获取

```jsx
// ========== useEffect方式 ==========
function DashboardWithEffect({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      fetchUser(userId),
      fetchPosts(userId),
      fetchStats(userId)
    ]).then(([userData, postsData, statsData]) => {
      setUser(userData);
      setPosts(postsData);
      setStats(statsData);
      setLoading(false);
    });
  }, [userId]);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      <UserInfo user={user} />
      <PostsList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}

// ========== use()方式 ==========
function DashboardWithUse({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  const postsPromise = useMemo(() => fetchPosts(userId), [userId]);
  const statsPromise = useMemo(() => fetchStats(userId), [userId]);
  
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo userPromise={userPromise} />
      </Suspense>
      
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList postsPromise={postsPromise} />
      </Suspense>
      
      <Suspense fallback={<StatsSkeleton />}>
        <StatsPanel statsPromise={statsPromise} />
      </Suspense>
    </div>
  );
}

// 对比：
// useEffect: 全部完成才显示（瀑布流）
// use(): 独立显示（流式渲染）
```

## 第三部分：适用场景分析

### 3.1 use()更适合的场景

```jsx
// ✅ 场景1：初始数据加载
function ProductPage({ productId }) {
  const productPromise = useMemo(() => fetchProduct(productId), [productId]);
  
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetails productPromise={productPromise} />
    </Suspense>
  );
}

// ✅ 场景2：基于props的数据获取
function UserProfile({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent userPromise={userPromise} />
    </Suspense>
  );
}

// ✅ 场景3：服务端渲染数据
async function ServerComponent({ id }) {
  // 在服务端直接await
  const data = await fetchData(id);
  
  // 传递Promise给客户端
  return <ClientComponent dataPromise={Promise.resolve(data)} />;
}

// ✅ 场景4：条件数据获取
function ConditionalData({ shouldLoad, dataPromise }) {
  if (!shouldLoad) {
    return <div>不加载数据</div>;
  }
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DataDisplay dataPromise={dataPromise} />
    </Suspense>
  );
}
```

### 3.2 useEffect更适合的场景

```jsx
// ✅ 场景1：用户交互触发的请求
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = () => {
    // 用户点击触发
    fetchSearchResults(query).then(setResults);
  };
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={handleSearch}>搜索</button>
      <ResultsList results={results} />
    </div>
  );
}

// ✅ 场景2：轮询/定时更新
function RealTimeData() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = () => {
      fetchLatestData().then(setData);
    };
    
    // 初始加载
    fetchData();
    
    // 每5秒更新
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <div>{data?.value}</div>;
}

// ✅ 场景3：WebSocket/订阅
function ChatMessages({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const socket = connectToRoom(roomId);
    
    socket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [roomId]);
  
  return (
    <ul>
      {messages.map(msg => (
        <li key={msg.id}>{msg.text}</li>
      ))}
    </ul>
  );
}

// ✅ 场景4：DOM操作
function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return <div>内容</div>;
}

// ✅ 场景5：第三方库集成
function ChartComponent({ data }) {
  const chartRef = useRef(null);
  
  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'line',
      data: data
    });
    
    return () => {
      chart.destroy();
    };
  }, [data]);
  
  return <canvas ref={chartRef} />;
}
```

### 3.3 场景选择指南

```
使用use():
✅ 组件挂载时需要的数据
✅ 基于props的数据获取
✅ 服务端渲染的数据
✅ 可以预先创建Promise的场景
✅ 希望使用Suspense的场景

使用useEffect:
✅ 用户交互触发的操作
✅ 定时器/间隔操作
✅ WebSocket/EventSource订阅
✅ DOM操作
✅ 第三方库集成
✅ 需要清理的副作用
✅ 不能预先创建Promise的场景
```

## 第四部分：混合使用模式

### 4.1 use()获取初始数据，useEffect处理交互

```jsx
function TodoApp({ userId }) {
  // use()获取初始数据
  const todosPromise = useMemo(() => fetchTodos(userId), [userId]);
  
  return (
    <Suspense fallback={<TodosSkeleton />}>
      <TodoList todosPromise={todosPromise} userId={userId} />
    </Suspense>
  );
}

function TodoList({ todosPromise, userId }) {
  const initialTodos = use(todosPromise);
  const [todos, setTodos] = useState(initialTodos);
  
  // useEffect处理用户操作
  const addTodo = async (text) => {
    const newTodo = await createTodo(userId, text);
    setTodos(prev => [...prev, newTodo]);
  };
  
  const toggleTodo = async (id) => {
    await updateTodo(id);
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  return (
    <div>
      <TodoInput onAdd={addTodo} />
      <ul>
        {todos.map(todo => (
          <TodoItem 
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
}
```

### 4.2 use()读取Context，useEffect处理副作用

```jsx
const ThemeContext = createContext('light');

function ThemedComponent() {
  // use()读取Context
  const theme = use(ThemeContext);
  
  // useEffect处理副作用
  useEffect(() => {
    // 更新document.body的类名
    document.body.className = `theme-${theme}`;
    
    // 保存到localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return <div className={theme}>内容</div>;
}
```

### 4.3 use()初始化，useEffect同步

```jsx
function SyncedComponent({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserWithSync userPromise={userPromise} />
    </Suspense>
  );
}

function UserWithSync({ userPromise }) {
  const user = use(userPromise);
  const [localUser, setLocalUser] = useState(user);
  
  // useEffect同步服务端变化
  useEffect(() => {
    const eventSource = new EventSource(`/api/users/${user.id}/updates`);
    
    eventSource.onmessage = (event) => {
      const updatedUser = JSON.parse(event.data);
      setLocalUser(updatedUser);
    };
    
    return () => {
      eventSource.close();
    };
  }, [user.id]);
  
  return <div>{localUser.name}</div>;
}
```

## 第五部分：迁移策略

### 5.1 从useEffect迁移到use()

```jsx
// 迁移前：useEffect
function BeforeMigration({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  return <div>{user?.name}</div>;
}

// 迁移步骤1：提取数据获取
function Step1({ userId }) {
  const [userPromise, setUserPromise] = useState(null);
  
  useEffect(() => {
    setUserPromise(fetchUser(userId));
  }, [userId]);
  
  if (!userPromise) return <div>准备中...</div>;
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ErrorBoundary fallback={<div>错误</div>}>
        <UserContent userPromise={userPromise} />
      </ErrorBoundary>
    </Suspense>
  );
}

function UserContent({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// 迁移步骤2：使用useMemo
function Step2({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ErrorBoundary fallback={<div>错误</div>}>
        <UserContent userPromise={userPromise} />
      </ErrorBoundary>
    </Suspense>
  );
}

// 最终：完全迁移
function AfterMigration({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <ErrorBoundary fallback={<ErrorDisplay />}>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile userPromise={userPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 5.2 保留useEffect的情况

```jsx
// 需要保留useEffect
function ComponentWithBoth({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserComponent userPromise={userPromise} />
    </Suspense>
  );
}

function UserComponent({ userPromise }) {
  const user = use(userPromise);
  const [notifications, setNotifications] = useState([]);
  
  // 保留useEffect用于订阅
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(user.id, (notification) => {
      setNotifications(prev => [...prev, notification]);
    });
    
    return unsubscribe;
  }, [user.id]);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
```

## 第六部分：性能对比

### 6.1 渲染次数对比

```jsx
// useEffect: 3次渲染
function WithEffect({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  console.log('渲染:', { user, loading });
  
  useEffect(() => {
    // 渲染1: user=null, loading=true
    fetchUser(userId).then(data => {
      // 渲染2: user=data, loading=true（setUser触发）
      setUser(data);
      // 渲染3: user=data, loading=false（setLoading触发）
      setLoading(false);
    });
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}

// use(): 1次渲染（Suspense期间不计）
function WithUse({ userPromise }) {
  console.log('渲染');
  const user = use(userPromise);
  // 只有这一次渲染
  return <div>{user.name}</div>;
}
```

### 6.2 内存使用对比

```jsx
// useEffect: 需要额外状态
function WithEffect() {
  const [data, setData] = useState(null);      // 状态1
  const [loading, setLoading] = useState(true); // 状态2
  const [error, setError] = useState(null);     // 状态3
  // 3个状态 + effect
}

// use(): 无额外状态
function WithUse({ promise }) {
  const data = use(promise);
  // 无额外状态
}
```

### 6.3 代码复杂度对比

```jsx
// 复杂度指标
useEffect方式:
- 代码行数: 约20-30行
- 需要管理的状态: 3个
- 需要处理的边界情况: loading、error、竞态
- 需要的清理逻辑: 取消请求

use()方式:
- 代码行数: 约5-10行
- 需要管理的状态: 0个
- 需要处理的边界情况: 由Suspense/ErrorBoundary处理
- 需要的清理逻辑: 无
```

## 注意事项

### 1. 不要盲目迁移

```jsx
// ❌ 不合适的迁移
// 这种情况应该保留useEffect
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // 用户输入触发搜索，不适合use()
  useEffect(() => {
    if (query) {
      searchAPI(query).then(setResults);
    }
  }, [query]);
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ResultsList results={results} />
    </div>
  );
}
```

### 2. 理解两者的范式差异

```jsx
// useEffect: 命令式
// "当userId变化时，执行获取用户的操作"
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]);

// use(): 声明式
// "这个组件需要userId对应的用户数据"
const user = use(fetchUser(userId));
```

### 3. 注意Suspense边界设置

```jsx
// ❌ 粒度太粗
<Suspense fallback={<PageLoading />}>
  <EntirePage />  {/* 整个页面一起等待 */}
</Suspense>

// ✅ 合理的粒度
<>
  <Header />
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
  <Suspense fallback={<ContentSkeleton />}>
    <MainContent />
  </Suspense>
</>
```

## 常见问题

### Q1: use()能完全替代useEffect吗？

**A:** 不能。use()专注于数据读取，useEffect处理副作用。两者互补。

### Q2: use()的性能一定更好吗？

**A:** 不一定。对于简单场景可能相差无几，但use()能更好地支持并行加载和流式渲染。

### Q3: 已有项目是否需要全部迁移？

**A:** 不需要。可以渐进式迁移，优先迁移数据获取逻辑，保留交互相关的useEffect。

### Q4: use()和useEffect可以混用吗？

**A:** 可以！实际项目中通常会混合使用。

## 总结

### 核心区别

```
useEffect:
- 执行副作用
- 异步执行
- 命令式
- 需要依赖数组
- 支持清理

use():
- 读取资源
- 同步返回（抛出Promise）
- 声明式
- 无需依赖数组
- 无需清理
```

### 选择建议

```
优先use():
✅ 初始数据加载
✅ 基于props的数据
✅ 服务端渲染
✅ 可预加载的场景

必须useEffect:
✅ 用户交互触发
✅ 定时器/订阅
✅ DOM操作
✅ 第三方库集成
✅ 需要清理的副作用
```

### 迁移原则

```
1. 评估是否真的需要迁移
2. 从简单场景开始
3. 保留交互相关的useEffect
4. 确保ErrorBoundary覆盖
5. 合理设置Suspense边界
6. 渐进式迁移，不求一步到位
```

use()和useEffect各有所长，理解它们的差异并合理选择，才能构建高质量的React应用！
