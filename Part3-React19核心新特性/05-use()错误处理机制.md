# use()错误处理机制

## 学习目标

通过本章学习，你将掌握：

- use()的错误抛出机制
- ErrorBoundary的使用
- 错误恢复策略
- 优雅降级方案
- 错误重试机制
- 网络错误处理
- 用户友好的错误展示
- 错误监控和日志

## 第一部分：错误抛出机制

### 1.1 use()如何处理错误

```jsx
// use()的错误处理流程
function use(promise) {
  const status = getPromiseStatus(promise);
  
  if (status === 'pending') {
    // Promise进行中 → 抛出Promise
    throw promise;
  }
  
  if (status === 'fulfilled') {
    // Promise成功 → 返回值
    return getPromiseValue(promise);
  }
  
  if (status === 'rejected') {
    // Promise失败 → 抛出错误
    throw getPromiseError(promise);
  }
}

// 示例
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    // 这个错误会被use()捕获并抛出
    throw new Error('用户不存在');
  }
  
  return response.json();
}

function UserComponent({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId]);
  const user = use(userPromise);  // 如果Promise rejected，这里会抛出错误
  
  return <div>{user.name}</div>;
}
```

### 1.2 错误类型

```jsx
// 1. 网络错误
async function fetchDataWithNetworkError() {
  try {
    const response = await fetch('/api/data');
    return response.json();
  } catch (error) {
    // 网络连接失败
    throw new Error('网络连接失败');
  }
}

// 2. HTTP错误
async function fetchDataWithHttpError() {
  const response = await fetch('/api/data');
  
  if (response.status === 404) {
    throw new Error('数据不存在');
  }
  
  if (response.status === 403) {
    throw new Error('没有访问权限');
  }
  
  if (response.status === 500) {
    throw new Error('服务器错误');
  }
  
  return response.json();
}

// 3. 数据验证错误
async function fetchDataWithValidation() {
  const response = await fetch('/api/data');
  const data = await response.json();
  
  if (!data.id || !data.name) {
    throw new Error('数据格式不正确');
  }
  
  return data;
}

// 4. 超时错误
async function fetchDataWithTimeout(timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('/api/data', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}
```

### 1.3 错误对象结构

```jsx
// 自定义错误类
class APIError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

// 使用自定义错误
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    
    throw new APIError(
      errorData.message || '请求失败',
      response.status,
      errorData
    );
  }
  
  return response.json();
}

// 错误处理组件可以访问完整的错误信息
class ErrorBoundary extends React.Component {
  state = { error: null };
  
  static getDerivedStateFromError(error) {
    return { error };
  }
  
  render() {
    if (this.state.error) {
      const { message, statusCode, details } = this.state.error;
      
      return (
        <div className="error-display">
          <h3>错误 {statusCode}</h3>
          <p>{message}</p>
          {details && <pre>{JSON.stringify(details, null, 2)}</pre>}
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 第二部分：ErrorBoundary实现

### 2.1 基础ErrorBoundary

```jsx
// 最简单的错误边界
class SimpleErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    // 更新state，下次渲染显示降级UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误到日志服务
    console.error('错误:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>出错了！</div>;
    }
    
    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <SimpleErrorBoundary>
      <Suspense fallback={<div>加载中...</div>}>
        <DataComponent />
      </Suspense>
    </SimpleErrorBoundary>
  );
}
```

### 2.2 功能完整的ErrorBoundary

```jsx
class FullErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }
  
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: error
    };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState(prev => ({
      errorInfo: errorInfo,
      errorCount: prev.errorCount + 1
    }));
    
    // 发送错误到监控服务
    this.logErrorToService(error, errorInfo);
  }
  
  logErrorToService(error, errorInfo) {
    // 发送到错误监控服务（如Sentry）
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }
  
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  
  render() {
    if (this.state.hasError) {
      const { error, errorCount } = this.state;
      const { fallback } = this.props;
      
      // 如果提供了自定义fallback
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, reset: this.handleReset, errorCount })
          : fallback;
      }
      
      // 默认错误UI
      return (
        <div className="error-boundary">
          <h2>出错了</h2>
          <details>
            <summary>错误详情</summary>
            <p>{error.message}</p>
            <pre>{error.stack}</pre>
          </details>
          {errorCount < 3 && (
            <button onClick={this.handleReset}>
              重试 ({errorCount}/3)
            </button>
          )}
          {errorCount >= 3 && (
            <p>多次重试失败，请刷新页面</p>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用
<FullErrorBoundary
  fallback={({ error, reset, errorCount }) => (
    <div>
      <h3>加载失败</h3>
      <p>{error.message}</p>
      <button onClick={reset}>重试</button>
      <small>已重试 {errorCount} 次</small>
    </div>
  )}
>
  <Suspense fallback={<div>加载中...</div>}>
    <DataComponent />
  </Suspense>
</FullErrorBoundary>
```

### 2.3 嵌套错误边界

```jsx
function App() {
  return (
    // 顶层错误边界：捕获整个应用的错误
    <FullErrorBoundary fallback={<AppErrorFallback />}>
      <Header />
      
      {/* 侧边栏错误边界 */}
      <FullErrorBoundary fallback={<SidebarError />}>
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </FullErrorBoundary>
      
      {/* 主内容错误边界 */}
      <FullErrorBoundary fallback={<ContentError />}>
        <Suspense fallback={<ContentSkeleton />}>
          <MainContent />
        </Suspense>
      </FullErrorBoundary>
      
      <Footer />
    </FullErrorBoundary>
  );
}

// 细粒度的错误处理
function MainContent() {
  return (
    <div>
      {/* 每个独立模块都有自己的错误边界 */}
      <FullErrorBoundary fallback={<div>文章加载失败</div>}>
        <Suspense fallback={<PostsSkeleton />}>
          <Posts />
        </Suspense>
      </FullErrorBoundary>
      
      <FullErrorBoundary fallback={<div>评论加载失败</div>}>
        <Suspense fallback={<CommentsSkeleton />}>
          <Comments />
        </Suspense>
      </FullErrorBoundary>
    </div>
  );
}
```

## 第三部分：错误恢复策略

### 3.1 重试机制

```jsx
// 带重试的数据获取
function createRetryablePromise(fetcher, maxRetries = 3, delay = 1000) {
  return async function retryableFetch(...args) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fetcher(...args);
      } catch (error) {
        lastError = error;
        
        // 最后一次尝试失败，抛出错误
        if (i === maxRetries) {
          throw error;
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        console.log(`重试第 ${i + 1} 次...`);
      }
    }
    
    throw lastError;
  };
}

// 使用重试机制
const fetchUserWithRetry = createRetryablePromise(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('请求失败');
    return response.json();
  },
  3,  // 最多重试3次
  1000  // 初始延迟1秒
);

function UserProfile({ userId }) {
  const userPromise = useMemo(() => 
    fetchUserWithRetry(userId),
    [userId]
  );
  
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

### 3.2 降级数据

```jsx
// 主数据失败时使用缓存数据
async function fetchWithFallback(url, cacheKey) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('请求失败');
    
    const data = await response.json();
    
    // 缓存成功的数据
    localStorage.setItem(cacheKey, JSON.stringify(data));
    
    return data;
  } catch (error) {
    // 尝试从缓存读取
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      console.warn('使用缓存数据');
      return JSON.parse(cachedData);
    }
    
    // 缓存也没有，抛出错误
    throw error;
  }
}

function DataComponent() {
  const dataPromise = useMemo(() => 
    fetchWithFallback('/api/data', 'data-cache'),
    []
  );
  
  const data = use(dataPromise);
  
  return (
    <div>
      {data.fromCache && <div className="warning">显示缓存数据</div>}
      {data.content}
    </div>
  );
}
```

### 3.3 用户手动重试

```jsx
function RetryableComponent({ userId }) {
  const [retryKey, setRetryKey] = useState(0);
  
  const userPromise = useMemo(() => 
    fetchUser(userId),
    [userId, retryKey]
  );
  
  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
  };
  
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className="error-card">
          <h3>加载失败</h3>
          <p>{error.message}</p>
          <button onClick={handleRetry}>重新加载</button>
        </div>
      )}
    >
      <Suspense fallback={<UserSkeleton />}>
        <UserContent userPromise={userPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.4 自动重试倒计时

```jsx
function AutoRetryComponent({ userId }) {
  const [retryKey, setRetryKey] = useState(0);
  const [countdown, setCountdown] = useState(null);
  
  const userPromise = useMemo(() => 
    fetchUser(userId),
    [userId, retryKey]
  );
  
  const startCountdown = () => {
    setCountdown(5);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRetryKey(k => k + 1);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div>
          <h3>加载失败: {error.message}</h3>
          {countdown === null ? (
            <button onClick={startCountdown}>
              重新加载
            </button>
          ) : (
            <p>{countdown}秒后自动重试...</p>
          )}
        </div>
      )}
    >
      <Suspense fallback={<div>加载中...</div>}>
        <UserContent userPromise={userPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## 第四部分：错误类型处理

### 4.1 网络错误

```jsx
// 检测网络错误
function isNetworkError(error) {
  return (
    error instanceof TypeError &&
    (error.message.includes('fetch') || 
     error.message.includes('network'))
  );
}

// 网络错误特殊处理
class NetworkErrorBoundary extends React.Component {
  state = { error: null };
  
  static getDerivedStateFromError(error) {
    return { error };
  }
  
  render() {
    const { error } = this.state;
    
    if (error && isNetworkError(error)) {
      return (
        <div className="network-error">
          <h3>网络连接失败</h3>
          <p>请检查您的网络连接</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="generic-error">
          <h3>出错了</h3>
          <p>{error.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 4.2 权限错误

```jsx
class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = 401;
  }
}

async function fetchProtectedData() {
  const response = await fetch('/api/protected');
  
  if (response.status === 401) {
    throw new AuthError('未登录或登录已过期');
  }
  
  if (response.status === 403) {
    throw new AuthError('没有访问权限');
  }
  
  return response.json();
}

class AuthErrorBoundary extends React.Component {
  state = { error: null };
  
  static getDerivedStateFromError(error) {
    return { error };
  }
  
  render() {
    const { error } = this.state;
    
    if (error && error.name === 'AuthError') {
      return (
        <div className="auth-error">
          <h3>需要登录</h3>
          <p>{error.message}</p>
          <button onClick={() => {
            // 跳转到登录页
            window.location.href = '/login';
          }}>
            去登录
          </button>
        </div>
      );
    }
    
    if (error) {
      throw error;  // 其他错误继续向上抛出
    }
    
    return this.props.children;
  }
}
```

### 4.3 404错误

```jsx
class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} 不存在`);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);
  
  if (response.status === 404) {
    throw new NotFoundError('用户');
  }
  
  return response.json();
}

function NotFoundFallback({ error, resource }) {
  return (
    <div className="not-found">
      <h3>404</h3>
      <p>{error.message}</p>
      <button onClick={() => window.history.back()}>
        返回
      </button>
    </div>
  );
}

// 使用
<ErrorBoundary
  fallback={({ error }) => {
    if (error.name === 'NotFoundError') {
      return <NotFoundFallback error={error} />;
    }
    return <GenericError error={error} />;
  }}
>
  <Suspense fallback={<div>加载中...</div>}>
    <UserProfile userId={userId} />
  </Suspense>
</ErrorBoundary>
```

## 第五部分：用户体验优化

### 5.1 友好的错误提示

```jsx
function FriendlyErrorBoundary({ children }) {
  const [error, setError] = useState(null);
  
  const errorMessages = {
    NetworkError: {
      title: '网络连接失败',
      message: '请检查您的网络连接后重试',
      icon: '🌐'
    },
    AuthError: {
      title: '需要登录',
      message: '请登录后继续使用',
      icon: '🔒'
    },
    NotFoundError: {
      title: '内容不存在',
      message: '您访问的内容可能已被删除',
      icon: '🔍'
    },
    ServerError: {
      title: '服务器错误',
      message: '服务器暂时无法响应，请稍后重试',
      icon: '⚠️'
    },
    default: {
      title: '出错了',
      message: '发生了未知错误',
      icon: '❌'
    }
  };
  
  if (error) {
    const errorType = error.name || 'default';
    const config = errorMessages[errorType] || errorMessages.default;
    
    return (
      <div className="friendly-error">
        <div className="error-icon">{config.icon}</div>
        <h3>{config.title}</h3>
        <p>{config.message}</p>
        <button onClick={() => setError(null)}>
          重试
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary
      onError={setError}
      fallback={null}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 5.2 错误反馈按钮

```jsx
function ErrorFeedback({ error, componentStack }) {
  const [submitted, setSubmitted] = useState(false);
  
  const handleFeedback = async () => {
    await fetch('/api/error-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });
    
    setSubmitted(true);
  };
  
  return (
    <div className="error-feedback">
      <h3>遇到问题？</h3>
      {!submitted ? (
        <>
          <p>帮助我们改进</p>
          <button onClick={handleFeedback}>
            发送错误报告
          </button>
        </>
      ) : (
        <p className="success">感谢您的反馈！</p>
      )}
    </div>
  );
}
```

### 5.3 错误页面布局

```jsx
function ErrorPageLayout({ error, reset }) {
  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-illustration">
          {/* 错误插图 */}
          <svg>...</svg>
        </div>
        
        <div className="error-content">
          <h1>哎呀！出错了</h1>
          <p className="error-message">{error.message}</p>
          
          <div className="error-actions">
            <button className="primary" onClick={reset}>
              重新加载
            </button>
            <button className="secondary" onClick={() => window.history.back()}>
              返回上一页
            </button>
            <button className="secondary" onClick={() => window.location.href = '/'}>
              回到首页
            </button>
          </div>
          
          <ErrorFeedback error={error} />
        </div>
      </div>
    </div>
  );
}
```

## 注意事项

### 1. ErrorBoundary不捕获的错误

```jsx
// ❌ ErrorBoundary不能捕获这些错误：

// 1. 事件处理器中的错误
<button onClick={() => {
  throw new Error('事件错误');  // 不会被捕获
}}>
  点击
</button>

// 2. 异步代码中的错误
useEffect(() => {
  setTimeout(() => {
    throw new Error('异步错误');  // 不会被捕获
  }, 1000);
}, []);

// 3. 服务端渲染错误（需要在服务端处理）

// 4. ErrorBoundary自身的错误

// ✅ 正确处理方式
function SafeComponent() {
  const [error, setError] = useState(null);
  
  const handleClick = () => {
    try {
      // 可能出错的代码
      dangerousOperation();
    } catch (err) {
      setError(err);
    }
  };
  
  if (error) {
    return <div>错误: {error.message}</div>;
  }
  
  return <button onClick={handleClick}>安全操作</button>;
}
```

### 2. 避免错误边界过于粗粒度

```jsx
// ❌ 太粗：整个应用一个错误边界
<ErrorBoundary>
  <App />  {/* 一个组件错误导致整个应用崩溃 */}
</ErrorBoundary>

// ✅ 细粒度：关键部分各自的错误边界
<ErrorBoundary>
  <Header />
  <ErrorBoundary>
    <Sidebar />
  </ErrorBoundary>
  <ErrorBoundary>
    <MainContent />
  </ErrorBoundary>
  <Footer />
</ErrorBoundary>
```

### 3. 记录错误信息

```jsx
// ✅ 总是记录错误到监控服务
componentDidCatch(error, errorInfo) {
  // 发送到错误监控（如Sentry）
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack
      }
    }
  });
  
  // 或者发送到自己的服务
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  });
}
```

## 常见问题

### Q1: use()抛出的错误一定要用ErrorBoundary吗？

**A:** 是的。use()抛出的错误只能被ErrorBoundary捕获，无法用try-catch。

### Q2: 如何处理多个并行请求的错误？

**A:**
```jsx
function MultiDataComponent() {
  return (
    <>
      <ErrorBoundary fallback={<div>用户数据错误</div>}>
        <Suspense fallback={<div>加载用户...</div>}>
          <UserData />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<div>文章数据错误</div>}>
        <Suspense fallback={<div>加载文章...</div>}>
          <PostsData />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
```

### Q3: 如何实现全局错误处理？

**A:**
```jsx
function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <Routes />
      </Router>
    </GlobalErrorBoundary>
  );
}
```

## 总结

### 错误处理最佳实践

```
✅ 总是使用ErrorBoundary包裹use()
✅ 合理设置错误边界粒度
✅ 提供友好的错误提示
✅ 实现错误重试机制
✅ 记录错误到监控服务
✅ 区分不同类型的错误
✅ 提供降级方案
✅ 添加错误反馈渠道
```

### 错误处理层次

```
1. Promise层：捕获和转换错误
2. use()层：抛出错误
3. ErrorBoundary层：捕获和展示错误
4. 监控层：记录和分析错误
```

完善的错误处理机制是高质量React应用的重要组成部分！
