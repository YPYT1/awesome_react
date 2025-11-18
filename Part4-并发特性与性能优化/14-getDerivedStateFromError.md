# getDerivedStateFromError

## 第一部分：getDerivedStateFromError基础

### 1.1 什么是getDerivedStateFromError

`getDerivedStateFromError` 是React类组件的静态生命周期方法，专门用于在子组件抛出错误后更新state。它是错误边界的核心方法之一。

**基本语法：**

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    // 返回新的state
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}
```

### 1.2 方法特点

```javascript
// 1. 静态方法
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    // ✅ 静态方法，无法访问this
    // ✅ 在渲染阶段调用
    // ✅ 必须返回state更新对象或null
    
    console.log(this);  // undefined
    
    return { hasError: true };
  }
}

// 2. 纯函数
static getDerivedStateFromError(error) {
  // ✅ 无副作用
  // ❌ 不能调用this.setState()
  // ❌ 不能访问实例方法
  // ❌ 不能发送网络请求
  
  // ✅ 只能返回state更新
  return {
    hasError: true,
    error: error
  };
}

// 3. 在渲染阶段调用
static getDerivedStateFromError(error) {
  // 调用时机：
  // 1. 子组件抛出错误
  // 2. React捕获错误
  // 3. 调用getDerivedStateFromError
  // 4. 返回新state
  // 5. 重新渲染（显示fallback）
  
  return { hasError: true };
}
```

### 1.3 参数详解

```javascript
static getDerivedStateFromError(error) {
  // error参数包含：
  // - error.message: 错误消息
  // - error.name: 错误类型
  // - error.stack: 错误堆栈
  
  console.log('Error message:', error.message);
  console.log('Error name:', error.name);
  console.log('Error stack:', error.stack);
  
  // 根据错误类型返回不同state
  if (error.name === 'NetworkError') {
    return {
      hasError: true,
      errorType: 'network',
      message: '网络错误'
    };
  }
  
  if (error.name === 'ValidationError') {
    return {
      hasError: true,
      errorType: 'validation',
      message: '验证失败'
    };
  }
  
  return {
    hasError: true,
    errorType: 'unknown',
    message: error.message
  };
}
```

### 1.4 返回值

```javascript
// 1. 返回state更新对象
static getDerivedStateFromError(error) {
  return {
    hasError: true,
    error: error,
    timestamp: Date.now()
  };
  // state将被更新为这些值
}

// 2. 返回null（不更新state）
static getDerivedStateFromError(error) {
  // 某些情况下可能不想更新state
  if (shouldIgnoreError(error)) {
    return null;  // 不更新state
  }
  
  return { hasError: true };
}

// 3. 部分state更新
static getDerivedStateFromError(error) {
  // 只更新部分state
  return { hasError: true };
  // 其他state字段保持不变
}

// 4. 基于错误类型的条件返回
static getDerivedStateFromError(error) {
  switch (error.constructor.name) {
    case 'TypeError':
      return { hasError: true, errorCategory: 'type' };
    case 'ReferenceError':
      return { hasError: true, errorCategory: 'reference' };
    default:
      return { hasError: true, errorCategory: 'general' };
  }
}
```

## 第二部分：实战应用

### 2.1 基础错误处理

```javascript
// 简单错误边界
class SimpleErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>出错了，请刷新页面</div>;
    }
    
    return this.props.children;
  }
}

// 显示错误信息
class ErrorBoundaryWithMessage extends React.Component {
  state = { 
    hasError: false,
    errorMessage: ''
  };
  
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.message
    };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>出错了</h2>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 保存完整错误对象
class ErrorBoundaryWithFullError extends React.Component {
  state = {
    hasError: false,
    error: null
  };
  
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    };
  }
  
  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      return (
        <div className="error-details">
          <h2>错误详情</h2>
          <p><strong>类型:</strong> {error.name}</p>
          <p><strong>消息:</strong> {error.message}</p>
          <details>
            <summary>堆栈</summary>
            <pre>{error.stack}</pre>
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 2.2 错误分类处理

```javascript
// 根据错误类型显示不同UI
class CategorizedErrorBoundary extends React.Component {
  state = {
    errorType: null,
    errorMessage: null
  };
  
  static getDerivedStateFromError(error) {
    // 网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        errorType: 'network',
        errorMessage: '网络连接失败，请检查网络设置'
      };
    }
    
    // API错误
    if (error.message.includes('API') || error.message.includes('401')) {
      return {
        errorType: 'api',
        errorMessage: 'API请求失败，请稍后重试'
      };
    }
    
    // 数据错误
    if (error.message.includes('undefined') || error.message.includes('null')) {
      return {
        errorType: 'data',
        errorMessage: '数据加载失败'
      };
    }
    
    // 其他错误
    return {
      errorType: 'unknown',
      errorMessage: error.message || '未知错误'
    };
  }
  
  render() {
    const { errorType, errorMessage } = this.state;
    
    if (errorType) {
      return (
        <div className={`error error-${errorType}`}>
          <ErrorIcon type={errorType} />
          <h3>{errorMessage}</h3>
          <ErrorActions type={errorType} />
        </div>
      );
    }
    
    return this.props.children;
  }
}

function ErrorActions({ type }) {
  switch (type) {
    case 'network':
      return (
        <button onClick={() => window.location.reload()}>
          重新加载
        </button>
      );
    
    case 'api':
      return (
        <div>
          <button onClick={() => window.location.reload()}>重试</button>
          <button onClick={() => window.history.back()}>返回</button>
        </div>
      );
    
    case 'data':
      return (
        <button onClick={() => window.location.reload()}>
          刷新数据
        </button>
      );
    
    default:
      return (
        <button onClick={() => window.location.href = '/'}>
          返回首页
        </button>
      );
  }
}
```

### 2.3 错误严重级别

```javascript
// 根据严重程度处理
class SeverityBasedErrorBoundary extends React.Component {
  state = {
    hasError: false,
    severity: null,
    error: null
  };
  
  static getDerivedStateFromError(error) {
    const severity = determineSeverity(error);
    
    return {
      hasError: true,
      severity,
      error
    };
  }
  
  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    
    const { severity, error } = this.state;
    
    switch (severity) {
      case 'critical':
        return (
          <CriticalError 
            error={error}
            onReload={() => window.location.reload()}
          />
        );
      
      case 'high':
        return (
          <HighSeverityError 
            error={error}
            onRetry={() => this.setState({ hasError: false })}
          />
        );
      
      case 'medium':
        return (
          <MediumSeverityError 
            error={error}
            onDismiss={() => this.setState({ hasError: false })}
          />
        );
      
      case 'low':
        // 低严重度：显示通知但保留内容
        return (
          <>
            <ErrorNotification error={error} />
            {this.props.children}
          </>
        );
      
      default:
        return <GenericError error={error} />;
    }
  }
}

function determineSeverity(error) {
  // 致命错误
  if (error.message.includes('FATAL') || 
      error.message.includes('Critical')) {
    return 'critical';
  }
  
  // 高优先级
  if (error.message.includes('Payment') ||
      error.message.includes('Auth')) {
    return 'high';
  }
  
  // 中等优先级
  if (error.message.includes('Data') ||
      error.message.includes('Validation')) {
    return 'medium';
  }
  
  // 低优先级
  return 'low';
}
```

### 2.4 条件性错误处理

```javascript
// 开发环境vs生产环境
class EnvironmentAwareErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };
  
  static getDerivedStateFromError(error) {
    const isDev = process.env.NODE_ENV === 'development';
    
    return {
      hasError: true,
      error: isDev ? error : { message: error.message },
      showStack: isDev
    };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      if (this.state.showStack) {
        // 开发环境：显示详细错误
        return (
          <div className="dev-error">
            <h2>Development Error</h2>
            <pre>{this.state.error.stack}</pre>
            <pre>{this.state.errorInfo?.componentStack}</pre>
          </div>
        );
      } else {
        // 生产环境：友好错误提示
        return (
          <div className="prod-error">
            <h2>出错了</h2>
            <p>我们已经记录了这个问题</p>
            <button onClick={() => window.location.reload()}>
              刷新页面
            </button>
          </div>
        );
      }
    }
    
    return this.props.children;
  }
}

// 特定用户的错误处理
class UserSpecificErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      const { user } = this.props;
      
      // 管理员：显示详细信息
      if (user?.role === 'admin') {
        return (
          <AdminErrorView 
            error={this.state.error}
            user={user}
          />
        );
      }
      
      // 普通用户：简单提示
      return (
        <UserErrorView 
          message="出错了，请稍后重试"
        />
      );
    }
    
    return this.props.children;
  }
}
```

## 第三部分：高级技巧

### 3.1 错误状态管理

```javascript
// 复杂错误状态
class AdvancedErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorCount: 0,
    lastError: null,
    errorHistory: []
  };
  
  static getDerivedStateFromError(error) {
    return (prevState) => ({
      hasError: true,
      error,
      errorCount: prevState.errorCount + 1,
      lastError: new Date(),
      errorHistory: [
        ...prevState.errorHistory.slice(-4),  // 保留最近5个
        {
          error: error.message,
          timestamp: Date.now()
        }
      ]
    });
  }
  
  render() {
    if (this.state.hasError) {
      const { errorCount, errorHistory } = this.state;
      
      // 错误频繁发生
      if (errorCount > 3) {
        return (
          <div>
            <h2>检测到频繁错误</h2>
            <p>已发生 {errorCount} 次错误</p>
            <button onClick={() => window.location.href = '/'}>
              返回首页
            </button>
          </div>
        );
      }
      
      return (
        <div>
          <h2>出错了</h2>
          <ErrorHistory history={errorHistory} />
          <button onClick={() => this.setState({ hasError: false })}>
            重试 ({errorCount}/3)
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 3.2 错误恢复策略

```javascript
// 智能错误恢复
class SmartRecoveryErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    recoveryAttempts: 0
  };
  
  static getDerivedStateFromError(error) {
    // 某些错误可以自动恢复
    if (isRecoverable(error)) {
      return {
        hasError: true,
        error,
        canAutoRecover: true
      };
    }
    
    return {
      hasError: true,
      error,
      canAutoRecover: false
    };
  }
  
  componentDidUpdate(prevProps, prevState) {
    // 自动恢复逻辑
    if (this.state.hasError && this.state.canAutoRecover) {
      if (this.state.recoveryAttempts < 3) {
        setTimeout(() => {
          this.setState(prev => ({
            hasError: false,
            error: null,
            recoveryAttempts: prev.recoveryAttempts + 1
          }));
        }, 1000 * (this.state.recoveryAttempts + 1));
      }
    }
  }
  
  render() {
    if (this.state.hasError) {
      if (this.state.canAutoRecover) {
        return (
          <div>
            <p>正在尝试恢复... ({this.state.recoveryAttempts}/3)</p>
            <Spinner />
          </div>
        );
      }
      
      return <FatalError error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

function isRecoverable(error) {
  const recoverableErrors = [
    'NetworkError',
    'TimeoutError',
    'TemporaryError'
  ];
  
  return recoverableErrors.some(type => 
    error.name.includes(type) || error.message.includes(type)
  );
}
```

### 3.3 错误数据收集

```javascript
// 收集错误元数据
class MetadataCollectingErrorBoundary extends React.Component {
  state = {
    hasError: false,
    errorData: null
  };
  
  static getDerivedStateFromError(error) {
    const errorData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize
      } : null
    };
    
    return {
      hasError: true,
      errorData
    };
  }
  
  componentDidCatch(error, errorInfo) {
    // 发送错误数据到服务器
    sendErrorReport({
      ...this.state.errorData,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          data={this.state.errorData}
          onDismiss={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### 3.4 错误过滤

```javascript
// 过滤和忽略特定错误
class FilteringErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    // 忽略特定错误
    const ignoredErrors = [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Script error.'
    ];
    
    const shouldIgnore = ignoredErrors.some(ignored =>
      error.message?.includes(ignored)
    );
    
    if (shouldIgnore) {
      console.warn('Ignored error:', error);
      return null;  // 不更新state
    }
    
    // 过滤敏感信息
    const sanitizedError = {
      ...error,
      message: sanitizeErrorMessage(error.message)
    };
    
    return {
      hasError: true,
      error: sanitizedError
    };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorView error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

function sanitizeErrorMessage(message) {
  // 移除敏感信息
  return message
    .replace(/token=[^&\s]*/gi, 'token=***')
    .replace(/password=[^&\s]*/gi, 'password=***')
    .replace(/\d{16}/g, '****-****-****-****');  // 信用卡号
}
```

## 注意事项

### 1. 静态方法限制

```javascript
// ❌ 不能访问this
class WrongErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    this.logError(error);  // 错误！this是undefined
    return { hasError: true };
  }
  
  logError(error) {
    console.error(error);
  }
}

// ✅ 使用componentDidCatch访问实例
class CorrectErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };  // 只更新state
  }
  
  componentDidCatch(error, errorInfo) {
    this.logError(error, errorInfo);  // 可以访问this
  }
  
  logError(error, errorInfo) {
    console.error(error, errorInfo);
  }
}
```

### 2. 副作用限制

```javascript
// ❌ 不能有副作用
static getDerivedStateFromError(error) {
  fetch('/api/log-error', {  // 错误！不能在这里发请求
    method: 'POST',
    body: JSON.stringify({ error })
  });
  
  return { hasError: true };
}

// ✅ 在componentDidCatch中处理副作用
componentDidCatch(error, errorInfo) {
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({ error, errorInfo })
  });
}
```

### 3. 返回值规则

```javascript
// ✅ 正确的返回值
static getDerivedStateFromError(error) {
  return { hasError: true };  // ✅ 返回对象
}

static getDerivedStateFromError(error) {
  return null;  // ✅ 返回null
}

// ❌ 错误的返回值
static getDerivedStateFromError(error) {
  return true;  // ❌ 不能返回基本类型
}

static getDerivedStateFromError(error) {
  return [{ hasError: true }];  // ❌ 不能返回数组
}

static getDerivedStateFromError(error) {
  // ❌ 不能不返回
}
```

## 常见问题

### Q1: getDerivedStateFromError和componentDidCatch的区别？

**A:** 前者在渲染阶段更新state，后者在提交阶段处理副作用。

### Q2: 可以在getDerivedStateFromError中访问props吗？

**A:** 不能，它是静态方法，无法访问实例。

### Q3: 必须返回完整的state吗？

**A:** 不需要，只返回要更新的部分即可。

### Q4: 可以在getDerivedStateFromError中抛出新错误吗？

**A:** 不建议，会导致无限循环。

### Q5: 如何在getDerivedStateFromError中记录日志？

**A:** 使用console或全局函数，不要访问this。

### Q6: 错误对象包含哪些信息？

**A:** message、name、stack等标准Error属性。

### Q7: 可以条件性返回null吗？

**A:** 可以，返回null表示不更新state。

### Q8: getDerivedStateFromError会被调用多次吗？

**A:** 每次子组件抛出错误都会调用。

### Q9: 如何区分首次错误和重复错误？

**A:** 在state中维护错误计数器。

### Q10: 生产环境和开发环境有区别吗？

**A:** 方法行为相同，但可以基于环境返回不同state。

## 总结

### 核心要点

```
1. 方法特性
   ✅ 静态方法
   ✅ 纯函数
   ✅ 渲染阶段调用
   ✅ 返回state更新

2. 使用限制
   ❌ 不能访问this
   ❌ 不能有副作用
   ❌ 不能setState
   ❌ 只能更新state

3. 主要用途
   ✅ 更新错误状态
   ✅ 触发fallback UI
   ✅ 错误分类
   ✅ 条件处理
```

### 最佳实践

```
1. 状态设计
   ✅ hasError标志
   ✅ 错误详情
   ✅ 错误类型
   ✅ 恢复信息

2. 错误处理
   ✅ 分类错误
   ✅ 过滤敏感信息
   ✅ 收集元数据
   ✅ 智能恢复

3. 配合使用
   ✅ componentDidCatch处理副作用
   ✅ 环境感知
   ✅ 用户友好提示
   ✅ 错误上报
```

getDerivedStateFromError是错误边界的核心，掌握它是构建健壮React应用的关键。

