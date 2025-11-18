# use() Hook概述

## 学习目标

通过本章学习，你将全面掌握：

- use() Hook的核心概念
- use()与传统Hooks的区别
- use()的使用场景和优势
- use()的工作原理
- use()的限制和注意事项
- use()与Suspense的关系
- React 19中的use()最佳实践
- 从传统方案迁移到use()

## 第一部分：use() Hook简介

### 1.1 什么是use() Hook

`use()` 是React 19引入的全新Hook，用于在组件中**读取资源的值**。它可以读取Promise或Context，是React首个打破传统Hook规则的Hook。

```jsx
import { use } from 'react';

// 读取Promise
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// 读取Context
function ThemeButton() {
  const theme = use(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

### 1.2 use()的革命性特点

**1. 可以在条件语句中调用**

```jsx
// ✅ use()可以在if语句中
function Component({ shouldFetch }) {
  if (shouldFetch) {
    const data = use(dataPromise);  // 合法！
    return <div>{data}</div>;
  }
  return <div>No data</div>;
}

// ❌ 传统Hooks不能在条件语句中
function BadComponent({ shouldFetch }) {
  if (shouldFetch) {
    const [data] = useState(null);  // 违反Hook规则！
  }
}
```

**2. 可以在循环中调用**

```jsx
// ✅ use()可以在循环中
function MultiData({ promises }) {
  return promises.map(promise => {
    const data = use(promise);  // 合法！
    return <div key={data.id}>{data.name}</div>;
  });
}
```

**3. 可以在早期返回后调用**

```jsx
// ✅ use()可以在return之后的代码路径中
function Component({ isEmpty }) {
  if (isEmpty) {
    return <div>Empty</div>;
  }
  
  // 这里可以调用use()，即使上面有可能提前return
  const data = use(dataPromise);
  return <div>{data}</div>;
}
```

### 1.3 use()与传统Hooks的对比

| 特性 | use() | 传统Hooks |
|------|-------|-----------|
| 条件调用 | ✅ 允许 | ❌ 禁止 |
| 循环调用 | ✅ 允许 | ❌ 禁止 |
| 早期返回后调用 | ✅ 允许 | ❌ 禁止 |
| 调用位置 | 可在任何地方 | 必须在顶层 |
| 读取资源 | Promise/Context | 各种状态 |
| 与Suspense | ✅ 天然集成 | 需要额外处理 |

**代码对比：**

```jsx
// 传统方式：useEffect + useState
function TraditionalComponent({ userId }) {
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
  return <div>{user.name}</div>;
}

// use()方式：简洁直观
function ModernComponent({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}

// 使用时配合Suspense和ErrorBoundary
<Suspense fallback={<div>加载中...</div>}>
  <ErrorBoundary>
    <ModernComponent userPromise={fetchUser(userId)} />
  </ErrorBoundary>
</Suspense>
```

## 第二部分：use()的工作原理

### 2.1 读取Promise

```jsx
// use()如何处理Promise
function Component({ dataPromise }) {
  // 第一次渲染：Promise pending
  // → use()抛出Promise
  // → Suspense捕获，显示fallback
  
  // Promise resolved后
  // → 组件重新渲染
  // → use()返回resolved的值
  
  const data = use(dataPromise);
  return <div>{data.value}</div>;
}

// 内部原理简化版
function use(resource) {
  if (resource instanceof Promise) {
    // 检查Promise状态
    const status = getPromiseStatus(resource);
    
    if (status === 'pending') {
      // 抛出Promise，让Suspense捕获
      throw resource;
    } else if (status === 'fulfilled') {
      // 返回resolved的值
      return getPromiseValue(resource);
    } else if (status === 'rejected') {
      // 抛出错误，让ErrorBoundary捕获
      throw getPromiseError(resource);
    }
  }
  
  // 处理Context
  if (isContext(resource)) {
    return readContext(resource);
  }
}
```

### 2.2 与Suspense的集成

```jsx
// 完整的数据获取流程
function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ErrorBoundary fallback={<ErrorMessage />}>
        <UserProfile userPromise={fetchUser(123)} />
      </ErrorBoundary>
    </Suspense>
  );
}

function UserProfile({ userPromise }) {
  // 1. 首次渲染，Promise pending
  //    → use()抛出Promise
  //    → Suspense显示Skeleton
  
  // 2. Promise resolved
  //    → React重新渲染
  //    → use()返回user数据
  //    → 显示用户信息
  
  const user = use(userPromise);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 2.3 Promise缓存机制

```jsx
// React会缓存Promise的结果
const userPromise = fetchUser(123);  // 创建Promise

function ParentComponent() {
  return (
    <div>
      {/* 多个组件共享同一个Promise */}
      <UserName userPromise={userPromise} />
      <UserEmail userPromise={userPromise} />
      <UserAvatar userPromise={userPromise} />
    </div>
  );
}

function UserName({ userPromise }) {
  const user = use(userPromise);  // 第一次use，等待Promise
  return <span>{user.name}</span>;
}

function UserEmail({ userPromise }) {
  const user = use(userPromise);  // 复用缓存的结果
  return <span>{user.email}</span>;
}

function UserAvatar({ userPromise }) {
  const user = use(userPromise);  // 复用缓存的结果
  return <img src={user.avatar} />;
}

// 只会发起一次网络请求！
```

## 第三部分：use()读取Promise

### 3.1 基础用法

```jsx
// 最简单的数据获取
async function fetchTodo(id) {
  const response = await fetch(`/api/todos/${id}`);
  return response.json();
}

function TodoItem({ todoPromise }) {
  const todo = use(todoPromise);
  
  return (
    <div>
      <h3>{todo.title}</h3>
      <p>{todo.description}</p>
      <span>状态: {todo.completed ? '完成' : '未完成'}</span>
    </div>
  );
}

// 使用
function App() {
  const todoPromise = fetchTodo(1);
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <TodoItem todoPromise={todoPromise} />
    </Suspense>
  );
}
```

### 3.2 条件数据获取

```jsx
// 根据条件决定是否获取数据
function ConditionalData({ shouldFetch, dataPromise }) {
  if (!shouldFetch) {
    return <div>无需获取数据</div>;
  }
  
  // ✅ 可以在条件分支中使用use()
  const data = use(dataPromise);
  
  return <div>{data.content}</div>;
}

// 更复杂的条件
function ComplexConditional({ type, promiseA, promiseB }) {
  let data;
  
  if (type === 'A') {
    data = use(promiseA);
  } else if (type === 'B') {
    data = use(promiseB);
  } else {
    return <div>无效类型</div>;
  }
  
  return <div>{data}</div>;
}
```

### 3.3 列表数据获取

```jsx
// 获取多个Promise的数据
function TodoList({ todoIds }) {
  return (
    <ul>
      {todoIds.map(id => {
        const todoPromise = fetchTodo(id);
        return (
          <Suspense key={id} fallback={<li>加载中...</li>}>
            <TodoListItem todoPromise={todoPromise} />
          </Suspense>
        );
      })}
    </ul>
  );
}

function TodoListItem({ todoPromise }) {
  // ✅ 在map循环中使用use()
  const todo = use(todoPromise);
  
  return (
    <li>
      <input type="checkbox" checked={todo.completed} />
      {todo.title}
    </li>
  );
}
```

### 3.4 串行数据获取

```jsx
// 先获取用户，再根据用户获取文章
function UserPosts({ userPromise }) {
  const user = use(userPromise);
  
  // 基于user数据创建新的Promise
  const postsPromise = fetchUserPosts(user.id);
  const posts = use(postsPromise);
  
  return (
    <div>
      <h2>{user.name}的文章</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// 使用
<Suspense fallback={<div>加载用户信息...</div>}>
  <Suspense fallback={<div>加载文章列表...</div>}>
    <UserPosts userPromise={fetchUser(123)} />
  </Suspense>
</Suspense>
```

## 第四部分：use()读取Context

### 4.1 基础用法

```jsx
import { createContext, use } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  // ✅ 使用use()读取Context
  const theme = use(ThemeContext);
  
  return (
    <button className={theme}>
      当前主题: {theme}
    </button>
  );
}

// 对比useContext
function TraditionalButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>{theme}</button>;
}
```

### 4.2 条件读取Context

```jsx
// use()的优势：可以条件读取
function ConditionalTheme({ useTheme }) {
  if (!useTheme) {
    return <button>默认按钮</button>;
  }
  
  // ✅ 可以在条件分支中调用
  const theme = use(ThemeContext);
  
  return <button className={theme}>主题按钮</button>;
}

// 对比useContext：必须无条件调用
function BadConditionalTheme({ useTheme }) {
  // ❌ 这样会违反Hook规则
  const theme = useTheme ? useContext(ThemeContext) : null;
  
  if (!useTheme) {
    return <button>默认按钮</button>;
  }
  
  return <button className={theme}>主题按钮</button>;
}
```

### 4.3 嵌套Context

```jsx
const ThemeContext = createContext('light');
const LanguageContext = createContext('zh-CN');
const UserContext = createContext(null);

function MultiContextComponent({ showUser }) {
  const theme = use(ThemeContext);
  const language = use(LanguageContext);
  
  // ✅ 可以条件读取某些Context
  const user = showUser ? use(UserContext) : null;
  
  return (
    <div className={theme}>
      <p>语言: {language}</p>
      {user && <p>用户: {user.name}</p>}
    </div>
  );
}
```

## 第五部分：实战案例

### 5.1 带搜索的用户列表

```jsx
function UserSearch() {
  const [query, setQuery] = useState('');
  const [searchPromise, setSearchPromise] = useState(null);
  
  const handleSearch = () => {
    if (query) {
      setSearchPromise(searchUsers(query));
    }
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索用户..."
      />
      <button onClick={handleSearch}>搜索</button>
      
      {searchPromise && (
        <Suspense fallback={<div>搜索中...</div>}>
          <SearchResults searchPromise={searchPromise} />
        </Suspense>
      )}
    </div>
  );
}

function SearchResults({ searchPromise }) {
  const users = use(searchPromise);
  
  if (users.length === 0) {
    return <div>未找到用户</div>;
  }
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}
```

### 5.2 Tab切换加载数据

```jsx
function TabPanel() {
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab('profile')}>个人资料</button>
        <button onClick={() => setActiveTab('posts')}>文章</button>
        <button onClick={() => setActiveTab('followers')}>关注者</button>
      </div>
      
      <Suspense fallback={<div>加载中...</div>}>
        <TabContent tab={activeTab} userId={123} />
      </Suspense>
    </div>
  );
}

function TabContent({ tab, userId }) {
  // ✅ 根据tab条件加载不同数据
  if (tab === 'profile') {
    const user = use(fetchUser(userId));
    return <ProfileView user={user} />;
  }
  
  if (tab === 'posts') {
    const posts = use(fetchUserPosts(userId));
    return <PostsList posts={posts} />;
  }
  
  if (tab === 'followers') {
    const followers = use(fetchUserFollowers(userId));
    return <FollowersList followers={followers} />;
  }
  
  return null;
}
```

### 5.3 瀑布流数据加载

```jsx
// 主详情页
function ProductPage({ productId }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductDetails productId={productId} />
    </Suspense>
  );
}

function ProductDetails({ productId }) {
  const product = use(fetchProduct(productId));
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>价格: ¥{product.price}</p>
      
      {/* 嵌套的Suspense边界 */}
      <Suspense fallback={<div>加载评论...</div>}>
        <ProductReviews productId={productId} />
      </Suspense>
      
      <Suspense fallback={<div>加载推荐...</div>}>
        <RelatedProducts category={product.category} />
      </Suspense>
    </div>
  );
}

function ProductReviews({ productId }) {
  const reviews = use(fetchReviews(productId));
  
  return (
    <div>
      <h2>用户评价</h2>
      {reviews.map(review => (
        <div key={review.id}>
          <p>{review.content}</p>
          <span>评分: {review.rating}</span>
        </div>
      ))}
    </div>
  );
}

function RelatedProducts({ category }) {
  const products = use(fetchRelatedProducts(category));
  
  return (
    <div>
      <h2>相关推荐</h2>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

## 注意事项

### 1. use()不是普通Hook

```jsx
// ❌ use()不需要遵守Hook规则
// 但其他Hook仍然需要
function Component({ condition }) {
  // ✅ use()可以在条件中
  if (condition) {
    const data = use(promise);
  }
  
  // ❌ useState不能在条件中
  if (condition) {
    const [state] = useState(0);  // 错误！
  }
}
```

### 2. Promise必须是稳定的

```jsx
// ❌ 错误：每次渲染创建新Promise
function Bad() {
  const data = use(fetchData());  // 每次都是新Promise！
  return <div>{data}</div>;
}

// ✅ 正确：Promise在组件外或缓存
const dataPromise = fetchData();
function Good() {
  const data = use(dataPromise);
  return <div>{data}</div>;
}

// ✅ 或使用useMemo缓存
function AlsoGood() {
  const promise = useMemo(() => fetchData(), []);
  const data = use(promise);
  return <div>{data}</div>;
}
```

### 3. 需要Suspense边界

```jsx
// ❌ 错误：没有Suspense
function App() {
  return <DataComponent />;  // 会报错！
}

// ✅ 正确：包裹Suspense
function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DataComponent />
    </Suspense>
  );
}
```

### 4. 错误处理需要ErrorBoundary

```jsx
// ✅ 完整的错误处理
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>错误: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>加载中...</div>}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 5. 避免重复请求

```jsx
// ❌ 问题：每个组件都发起请求
function Parent() {
  return (
    <div>
      <Child1 userId={123} />
      <Child2 userId={123} />
      <Child3 userId={123} />
    </div>
  );
}

function Child1({ userId }) {
  const user = use(fetchUser(userId));  // 请求1
  return <div>{user.name}</div>;
}

// ✅ 解决：共享Promise
function Parent() {
  const userPromise = useMemo(() => fetchUser(123), []);
  
  return (
    <div>
      <Child1 userPromise={userPromise} />
      <Child2 userPromise={userPromise} />
      <Child3 userPromise={userPromise} />
    </div>
  );
}
```

## 常见问题

### Q1: use()和useEffect有什么区别？

**A:** 
- **use()**: 读取资源，同步返回值
- **useEffect**: 执行副作用，异步执行

```jsx
// useEffect方式
function WithEffect({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  if (!user) return <div>加载中...</div>;
  return <div>{user.name}</div>;
}

// use()方式
function WithUse({ userPromise }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

### Q2: use()可以替代所有数据获取吗？

**A:** 不完全是。use()适合：
- 初始数据加载
- 服务端渲染数据
- 依赖其他数据的加载

但以下场景仍需useEffect：
- 用户交互触发的请求
- 定时刷新数据
- WebSocket连接

### Q3: use()的性能如何？

**A:** 
- Promise缓存避免重复请求
- 配合Suspense实现流式渲染
- 比useEffect更少的重渲染

### Q4: 如何迁移到use()？

**A:**
```jsx
// 迁移前
function Old({ userId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData(userId).then(setData);
  }, [userId]);
  
  return data ? <div>{data}</div> : <div>Loading...</div>;
}

// 迁移后
function New({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data}</div>;
}

// 使用时
<Suspense fallback={<div>Loading...</div>}>
  <New dataPromise={fetchData(userId)} />
</Suspense>
```

## 总结

### use() Hook的核心价值

1. **简化数据获取**：告别useEffect的复杂状态管理
2. **更灵活的调用**：打破传统Hook规则限制
3. **天然Suspense集成**：更好的加载体验
4. **性能优化**：Promise缓存和流式渲染

### 适用场景

```
✅ 适合use():
- 组件挂载时获取数据
- 基于props获取数据
- 串行数据依赖
- 服务端渲染

✅ 仍用useEffect:
- 用户交互触发
- 定时器/轮询
- WebSocket
- DOM操作
```

### 最佳实践

1. **始终包裹Suspense**
2. **使用ErrorBoundary处理错误**
3. **缓存Promise避免重复请求**
4. **合理设置Suspense边界**
5. **配合Server Components使用**

use() Hook是React 19最重要的新特性之一，它为数据获取提供了更现代、更简洁的解决方案！
