# react-error-boundary库

## 第一部分：库简介

### 1.1 什么是react-error-boundary

`react-error-boundary`是一个轻量级的React错误边界库，提供了简单易用的错误处理组件和Hook，无需自己编写类组件即可实现错误边界功能。

**安装：**

```bash
npm install react-error-boundary
# 或
yarn add react-error-boundary
# 或
pnpm add react-error-boundary
```

**基本使用：**

```javascript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>出错了：</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyApp />
    </ErrorBoundary>
  );
}
```

### 1.2 为什么使用这个库

```javascript
// 传统方式：需要类组件
class MyErrorBoundary extends React.Component {
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

// 使用库：简洁的函数组件方式
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyApp />
    </ErrorBoundary>
  );
}

// 优势：
// ✅ 无需类组件
// ✅ 更简洁的API
// ✅ 内置重置功能
// ✅ 提供useErrorHandler Hook
// ✅ TypeScript支持完善
```

### 1.3 核心特性

```javascript
// 1. FallbackComponent
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>

// 2. fallback（简单UI）
<ErrorBoundary fallback={<div>出错了</div>}>
  <App />
</ErrorBoundary>

// 3. fallbackRender（渲染函数）
<ErrorBoundary
  fallbackRender={({ error, resetErrorBoundary }) => (
    <div>
      <p>错误: {error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  )}
>
  <App />
</ErrorBoundary>

// 4. onError（错误回调）
<ErrorBoundary
  onError={(error, errorInfo) => {
    logErrorToService(error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>

// 5. onReset（重置回调）
<ErrorBoundary
  onReset={() => {
    // 重置应用状态
    resetAppState();
  }}
>
  <App />
</ErrorBoundary>

// 6. resetKeys（自动重置）
<ErrorBoundary resetKeys={[userId, pageId]}>
  <App />
</ErrorBoundary>
// 当resetKeys中的值变化时，自动重置错误边界
```

## 第二部分：基础用法

### 2.1 ErrorBoundary组件

```javascript
import { ErrorBoundary } from 'react-error-boundary';

// 基础用法
function App() {
  return (
    <ErrorBoundary fallback={<div>出错了</div>}>
      <MyComponent />
    </ErrorBoundary>
  );
}

// 使用FallbackComponent
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-fallback">
      <h2>出错了</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyComponent />
    </ErrorBoundary>
  );
}

// 使用fallbackRender
function App() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <h2>Something went wrong:</h2>
          <pre style={{ color: 'red' }}>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// onError回调
function App() {
  const handleError = (error, errorInfo) => {
    // 发送到错误追踪服务
    logErrorToMyService(error, errorInfo);
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// 完整示例
function App() {
  const handleReset = () => {
    // 重置应用状态
    console.log('Resetting app state');
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught:', error, errorInfo);
      }}
      onReset={handleReset}
      resetKeys={['currentUser']}
    >
      <MyApp />
    </ErrorBoundary>
  );
}
```

### 2.2 useErrorHandler Hook

```javascript
import { useErrorHandler } from 'react-error-boundary';

// 基础用法
function MyComponent() {
  const handleError = useErrorHandler();
  
  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      handleError(error);  // 抛出到最近的ErrorBoundary
    }
  };
  
  return <button onClick={handleClick}>Fetch</button>;
}

// 包裹在ErrorBoundary中
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MyComponent />
    </ErrorBoundary>
  );
}

// 异步错误处理
function AsyncComponent() {
  const handleError = useErrorHandler();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(handleError);  // 捕获Promise错误
  }, [handleError]);
  
  return <div>{data}</div>;
}

// 事件处理器错误
function EventHandlerComponent() {
  const handleError = useErrorHandler();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      processForm(formData);
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}

// 条件性错误处理
function ConditionalError() {
  const handleError = useErrorHandler();
  const [shouldError, setShouldError] = useState(false);
  
  // 当shouldError为true时抛出错误
  useErrorHandler(shouldError ? new Error('Conditional error') : undefined);
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
}
```

### 2.3 withErrorBoundary HOC

```javascript
import { withErrorBoundary } from 'react-error-boundary';

// 基础用法
const MyComponent = () => <div>My Content</div>;

const MyComponentWithErrorBoundary = withErrorBoundary(MyComponent, {
  FallbackComponent: ErrorFallback,
  onError: (error, errorInfo) => {
    console.log('Error:', error, errorInfo);
  }
});

// 使用
function App() {
  return <MyComponentWithErrorBoundary />;
}

// 自定义配置
const ProtectedComponent = withErrorBoundary(
  MyComponent,
  {
    fallback: <div>出错了</div>,
    onError: logError,
    onReset: resetState,
    resetKeys: ['userId']
  }
);

// 多个组件包裹
const SafeHeader = withErrorBoundary(Header, {
  fallback: <div>Header Error</div>
});

const SafeMain = withErrorBoundary(Main, {
  fallback: <div>Main Error</div>
});

const SafeFooter = withErrorBoundary(Footer, {
  fallback: <div>Footer Error</div>
});

function App() {
  return (
    <div>
      <SafeHeader />
      <SafeMain />
      <SafeFooter />
    </div>
  );
}
```

## 第三部分：高级用法

### 3.1 resetKeys自动重置

```javascript
// 用户切换时重置错误
function UserProfile({ userId }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      resetKeys={[userId]}  // userId变化时自动重置
    >
      <ProfileContent userId={userId} />
    </ErrorBoundary>
  );
}

// 多个resetKey
function DataView({ filters, sorting }) {
  return (
    <ErrorBoundary
      resetKeys={[filters, sorting]}  // 任一变化都重置
    >
      <DataTable filters={filters} sorting={sorting} />
    </ErrorBoundary>
  );
}

// 复杂对象作为resetKey
function ComplexReset({ config }) {
  const configKey = JSON.stringify(config);
  
  return (
    <ErrorBoundary resetKeys={[configKey]}>
      <ConfiguredComponent config={config} />
    </ErrorBoundary>
  );
}

// 条件性重置
function ConditionalReset({ shouldReset, data }) {
  return (
    <ErrorBoundary resetKeys={shouldReset ? [data] : []}>
      <Content data={data} />
    </ErrorBoundary>
  );
}
```

### 3.2 onReset钩子

```javascript
// 重置时清理状态
function App() {
  const [appState, setAppState] = useState(initialState);
  
  const handleReset = () => {
    // 重置应用状态
    setAppState(initialState);
    
    // 清除缓存
    localStorage.removeItem('cache');
    
    // 重新初始化
    initializeApp();
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={handleReset}
    >
      <MyApp state={appState} setState={setAppState} />
    </ErrorBoundary>
  );
}

// 结合路由重置
import { useNavigate } from 'react-router-dom';

function AppWithRouter() {
  const navigate = useNavigate();
  
  const handleReset = () => {
    // 导航到首页
    navigate('/');
    
    // 重置状态
    resetGlobalState();
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={handleReset}
    >
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </ErrorBoundary>
  );
}

// Redux集成
import { useDispatch } from 'react-redux';

function AppWithRedux() {
  const dispatch = useDispatch();
  
  const handleReset = () => {
    // 重置Redux状态
    dispatch({ type: 'RESET_ALL' });
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={handleReset}
    >
      <MyApp />
    </ErrorBoundary>
  );
}
```

### 3.3 自定义ErrorFallback

```javascript
// 丰富的错误UI
function CustomErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      
      <h1>出错了</h1>
      
      <details className="error-details">
        <summary>错误详情</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </details>
      
      <div className="error-actions">
        <button onClick={resetErrorBoundary}>
          重试
        </button>
        <button onClick={() => window.location.href = '/'}>
          返回首页
        </button>
        <button onClick={() => window.location.reload()}>
          刷新页面
        </button>
      </div>
      
      <div className="error-help">
        <p>如果问题持续，请联系支持</p>
        <a href="mailto:support@example.com">support@example.com</a>
      </div>
    </div>
  );
}

// 带错误ID的Fallback
function FallbackWithErrorId({ error, resetErrorBoundary }) {
  const [errorId] = useState(() => 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  
  useEffect(() => {
    // 上报错误
    reportError({ errorId, error });
  }, [errorId, error]);
  
  return (
    <div>
      <h2>出错了</h2>
      <p>错误ID: {errorId}</p>
      <p>请提供此ID以便我们追踪问题</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

// 环境感知的Fallback
function EnvironmentAwareFallback({ error, resetErrorBoundary }) {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    return (
      <div className="dev-error">
        <h2>Development Error</h2>
        <pre>{error.stack}</pre>
        <button onClick={resetErrorBoundary}>Reset</button>
      </div>
    );
  }
  
  return (
    <div className="prod-error">
      <h2>出错了</h2>
      <p>我们正在修复这个问题</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}
```

### 3.4 嵌套错误边界

```javascript
// 分层错误处理
function App() {
  return (
    // 全局错误边界
    <ErrorBoundary
      FallbackComponent={AppLevelError}
      onError={logCriticalError}
    >
      <Layout>
        {/* 页面级错误边界 */}
        <ErrorBoundary
          FallbackComponent={PageLevelError}
          resetKeys={[currentPage]}
        >
          <CurrentPage />
        </ErrorBoundary>
        
        {/* 组件级错误边界 */}
        <ErrorBoundary
          fallback={<WidgetPlaceholder />}
          onError={logMinorError}
        >
          <SidebarWidget />
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
}

// 特定功能边界
function Dashboard() {
  return (
    <div className="dashboard">
      <ErrorBoundary fallback={<ChartError />}>
        <ChartWidget />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<StatsError />}>
        <StatsWidget />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<TableError />}>
        <DataTable />
      </ErrorBoundary>
    </div>
  );
}
```

## 第四部分：实战场景

### 4.1 异步数据获取

```javascript
// 结合数据获取
function DataFetchingComponent() {
  const handleError = useErrorHandler();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData()
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        handleError(error);  // 抛出到ErrorBoundary
      });
  }, [handleError]);
  
  if (loading) return <Loading />;
  
  return <DataDisplay data={data} />;
}

// 包裹
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={DataError}
      onReset={() => window.location.reload()}
    >
      <DataFetchingComponent />
    </ErrorBoundary>
  );
}

// React Query集成
import { useQuery } from '@tanstack/react-query';

function QueryComponent() {
  const handleError = useErrorHandler();
  
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    onError: handleError  // 错误时抛出到ErrorBoundary
  });
  
  return <div>{data}</div>;
}
```

### 4.2 表单错误处理

```javascript
// 表单提交错误
function FormComponent() {
  const handleError = useErrorHandler();
  
  const handleSubmit = async (formData) => {
    try {
      await submitForm(formData);
    } catch (error) {
      if (error.type === 'validation') {
        // 验证错误：本地处理
        setValidationErrors(error.errors);
      } else {
        // 其他错误：抛出到ErrorBoundary
        handleError(error);
      }
    }
  };
  
  return <Form onSubmit={handleSubmit} />;
}

// 包裹
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={FormError}
      onReset={() => {
        // 重置表单
        resetForm();
      }}
    >
      <FormComponent />
    </ErrorBoundary>
  );
}
```

### 4.3 路由错误处理

```javascript
// React Router集成
import { Routes, Route, useLocation } from 'react-router-dom';

function AppRouter() {
  const location = useLocation();
  
  return (
    <ErrorBoundary
      FallbackComponent={RouteError}
      resetKeys={[location.pathname]}  // 路由变化时重置
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ErrorBoundary>
  );
}

function RouteError({ error, resetErrorBoundary }) {
  const navigate = useNavigate();
  
  return (
    <div>
      <h2>页面加载失败</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}
```

### 4.4 第三方组件集成

```javascript
// 包裹不可靠的第三方组件
import ThirdPartyMap from 'third-party-map';

function MapWrapper() {
  return (
    <ErrorBoundary
      fallback={<div>地图加载失败</div>}
      onError={(error) => {
        console.warn('Third party map error:', error);
      }}
    >
      <ThirdPartyMap />
    </ErrorBoundary>
  );
}

// 多个第三方组件
function ThirdPartyIntegrations() {
  return (
    <div>
      <ErrorBoundary fallback={<ChatPlaceholder />}>
        <ThirdPartyChat />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<AnalyticsPlaceholder />}>
        <ThirdPartyAnalytics />
      </ErrorBoundary>
      
      <ErrorBoundary fallback={null}>
        <ThirdPartyAds />
      </ErrorBoundary>
    </div>
  );
}
```

## 第五部分：TypeScript支持

### 5.1 类型定义

```typescript
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

// FallbackComponent类型
const ErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
};

// ErrorBoundary props类型
interface AppProps {
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error: Error, info: { componentStack: string }) => {
        console.error(error, info);
      }}
      onReset={() => {
        // 重置逻辑
      }}
      resetKeys={[]}
    >
      {children}
    </ErrorBoundary>
  );
};

// useErrorHandler类型
function TypedComponent() {
  const handleError = useErrorHandler<Error>();
  
  const fetchData = async () => {
    try {
      await fetch('/api/data');
    } catch (error) {
      handleError(error as Error);
    }
  };
}

// 自定义错误类型
class CustomError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

const CustomErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  const customError = error as CustomError;
  
  return (
    <div>
      <p>Error Code: {customError.code}</p>
      <p>Message: {customError.message}</p>
    </div>
  );
};
```

## 注意事项

### 1. 性能考虑

```javascript
// ✅ 合理的边界粒度
<ErrorBoundary>
  <ComponentGroup />
</ErrorBoundary>

// ❌ 避免过多独立边界
<>
  <ErrorBoundary><Comp1 /></ErrorBoundary>
  <ErrorBoundary><Comp2 /></ErrorBoundary>
  <ErrorBoundary><Comp3 /></ErrorBoundary>
</>
```

### 2. 不捕获的错误

```javascript
// 事件处理器错误需要useErrorHandler
function Component() {
  const handleError = useErrorHandler();
  
  const handleClick = () => {
    try {
      riskyOperation();
    } catch (error) {
      handleError(error);
    }
  };
}

// Promise错误需要.catch
fetchData().catch(useErrorHandler());
```

### 3. 重置状态

```javascript
// 确保onReset正确清理
<ErrorBoundary
  onReset={() => {
    clearCache();
    resetState();
    // 确保应用可以正常重新渲染
  }}
>
  <App />
</ErrorBoundary>
```

## 常见问题

### Q1: react-error-boundary和自己写的区别？

**A:** 库提供了更简洁的API、重置功能、Hook支持。

### Q2: useErrorHandler可以在哪里使用？

**A:** 任何React组件内，但需要外层有ErrorBoundary。

### Q3: resetKeys如何工作？

**A:** 值变化时自动调用resetErrorBoundary。

### Q4: 可以嵌套使用吗？

**A:** 可以，内层错误被最近的边界捕获。

### Q5: TypeScript支持如何？

**A:** 完善的类型定义，全面的TS支持。

### Q6: 如何测试？

**A:** 使用testing-library模拟错误抛出。

### Q7: 生产环境注意什么？

**A:** 友好的错误提示、完整的错误上报。

### Q8: 性能影响？

**A:** 几乎无影响，仅错误时有开销。

### Q9: 能否与Redux/Context配合？

**A:** 可以，在onReset中重置全局状态。

### Q10: 与React 19兼容吗？

**A:** 完全兼容，持续维护更新。

## 总结

### 核心特性

```
1. ErrorBoundary组件
   ✅ fallback/FallbackComponent
   ✅ onError回调
   ✅ onReset钩子
   ✅ resetKeys自动重置

2. useErrorHandler Hook
   ✅ 异步错误处理
   ✅ 事件错误处理
   ✅ 条件错误处理

3. withErrorBoundary HOC
   ✅ 组件包裹
   ✅ 配置传递
```

### 最佳实践

```
1. 使用建议
   ✅ 优先使用库而非自己实现
   ✅ 合理配置resetKeys
   ✅ 提供有意义的fallback
   ✅ 正确处理重置

2. 错误处理
   ✅ onError记录日志
   ✅ useErrorHandler处理异步
   ✅ 环境区分处理
   ✅ 用户友好提示

3. 性能优化
   ✅ 避免过度嵌套
   ✅ 合理的边界粒度
   ✅ 按需使用HOC
```

react-error-boundary是React错误处理的最佳实践库，简化了错误边界的实现和使用。

