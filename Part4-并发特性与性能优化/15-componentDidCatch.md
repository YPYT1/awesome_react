# componentDidCatch

## 第一部分：componentDidCatch基础

### 1.1 什么是componentDidCatch

`componentDidCatch` 是React类组件的生命周期方法，用于捕获子组件树中抛出的错误，并在提交阶段处理副作用（如错误日志记录）。它与`getDerivedStateFromError`配合使用来实现完整的错误边界。

**基本语法：**

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    // 更新state以显示fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误到错误报告服务
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
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
// 1. 实例方法（非静态）
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // ✅ 可以访问this
    // ✅ 可以调用this.setState()
    // ✅ 可以访问this.props
    // ✅ 可以访问实例方法
    
    this.logError(error, errorInfo);
    this.setState({ errorLogged: true });
  }
  
  logError(error, info) {
    // 实例方法
  }
}

// 2. 在提交阶段调用
componentDidCatch(error, errorInfo) {
  // 调用时机：
  // 1. 子组件抛出错误
  // 2. getDerivedStateFromError执行
  // 3. 组件重新渲染（显示fallback）
  // 4. 提交到DOM
  // 5. componentDidCatch执行
}

// 3. 可以有副作用
componentDidCatch(error, errorInfo) {
  // ✅ 发送网络请求
  fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({ error, errorInfo })
  });
  
  // ✅ 更新本地存储
  localStorage.setItem('lastError', error.message);
  
  // ✅ 调用第三方服务
  Sentry.captureException(error);
}
```

### 1.3 参数详解

```javascript
componentDidCatch(error, errorInfo) {
  // 参数1: error - 错误对象
  console.log('Error message:', error.message);
  console.log('Error name:', error.name);
  console.log('Error stack:', error.stack);
  
  // 参数2: errorInfo - 错误信息对象
  console.log('Component stack:', errorInfo.componentStack);
  
  // errorInfo.componentStack示例：
  /*
    in ComponentThatThrows (at App.js:12)
    in ErrorBoundary (at App.js:20)
    in div (at App.js:25)
    in App (at index.js:7)
  */
}

// 完整示例
componentDidCatch(error, errorInfo) {
  const errorData = {
    // 错误对象信息
    message: error.message,
    name: error.name,
    stack: error.stack,
    
    // React组件堆栈
    componentStack: errorInfo.componentStack,
    
    // 额外上下文
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  console.log('Full error data:', errorData);
}
```

### 1.4 与getDerivedStateFromError的区别

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, errorInfo: null };
  
  // 1. getDerivedStateFromError: 更新state
  static getDerivedStateFromError(error) {
    // 静态方法
    // 渲染阶段调用
    // 不能有副作用
    // 只能返回state更新
    
    return { hasError: true };
  }
  
  // 2. componentDidCatch: 处理副作用
  componentDidCatch(error, errorInfo) {
    // 实例方法
    // 提交阶段调用
    // 可以有副作用
    // 可以访问this
    
    // 保存errorInfo到state
    this.setState({ errorInfo });
    
    // 记录错误
    this.logErrorToService(error, errorInfo);
  }
  
  logErrorToService(error, errorInfo) {
    // 发送到错误追踪服务
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Error occurred</h1>
          {this.state.errorInfo && (
            <details>
              <summary>Component Stack</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 第二部分：实战应用

### 2.1 错误日志记录

```javascript
// 基础日志记录
class LoggingErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 1. 控制台日志
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // 2. 发送到服务器
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        timestamp: Date.now(),
        url: window.location.href
      })
    }).catch(err => {
      console.error('Failed to log error:', err);
    });
    
    // 3. 本地存储
    try {
      const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errorLog.push({
        error: error.toString(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('errorLog', JSON.stringify(errorLog.slice(-10)));
    } catch (e) {
      console.error('Failed to store error:', e);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    
    return this.props.children;
  }
}

// Sentry集成
class SentryErrorBoundary extends React.Component {
  state = { hasError: false, eventId: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    if (window.Sentry) {
      const eventId = window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          boundary: 'SentryErrorBoundary'
        }
      });
      
      this.setState({ eventId });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>出错了</h2>
          <button
            onClick={() => 
              window.Sentry?.showReportDialog({ eventId: this.state.eventId })
            }
          >
            报告问题
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// LogRocket集成
class LogRocketErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    if (window.LogRocket) {
      window.LogRocket.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack
        }
      });
    }
  }
  
  render() {
    // ...
  }
}
```

### 2.2 错误分析

```javascript
// 错误模式分析
class AnalyticsErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: true,
        component_stack: errorInfo.componentStack
      });
    }
    
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Error Occurred', {
        error_message: error.message,
        error_name: error.name,
        component_stack: errorInfo.componentStack,
        url: window.location.pathname
      });
    }
    
    // 自定义分析
    this.trackErrorPattern(error, errorInfo);
  }
  
  trackErrorPattern(error, errorInfo) {
    const pattern = {
      type: error.name,
      message: error.message,
      component: this.extractMainComponent(errorInfo.componentStack),
      frequency: this.updateErrorFrequency(error.message)
    };
    
    // 发送模式数据
    fetch('/api/error-patterns', {
      method: 'POST',
      body: JSON.stringify(pattern)
    });
  }
  
  extractMainComponent(componentStack) {
    const match = componentStack.match(/in (\w+)/);
    return match ? match[1] : 'Unknown';
  }
  
  updateErrorFrequency(message) {
    const key = `error_freq_${message}`;
    const current = parseInt(sessionStorage.getItem(key) || '0');
    const updated = current + 1;
    sessionStorage.setItem(key, updated.toString());
    return updated;
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### 2.3 用户通知

```javascript
// 用户友好的错误通知
class NotificationErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 显示Toast通知
    if (window.toast) {
      window.toast.error('出错了，请刷新页面重试');
    }
    
    // 发送邮件通知（关键错误）
    if (this.isCriticalError(error)) {
      this.sendEmailNotification(error, errorInfo);
    }
    
    // Slack通知（团队）
    if (process.env.NODE_ENV === 'production') {
      this.sendSlackNotification(error, errorInfo);
    }
    
    // 记录错误
    this.logError(error, errorInfo);
  }
  
  isCriticalError(error) {
    const criticalPatterns = [
      'Payment',
      'Auth',
      'Database',
      'FATAL'
    ];
    
    return criticalPatterns.some(pattern =>
      error.message.includes(pattern)
    );
  }
  
  async sendEmailNotification(error, errorInfo) {
    await fetch('/api/notify/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'admin@example.com',
        subject: 'Critical Error in Production',
        body: `
          Error: ${error.message}
          Stack: ${error.stack}
          Component: ${errorInfo.componentStack}
          URL: ${window.location.href}
        `
      })
    });
  }
  
  async sendSlackNotification(error, errorInfo) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Production Error`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Error:* ${error.message}\n*URL:* ${window.location.href}`
            }
          }
        ]
      })
    });
  }
  
  logError(error, errorInfo) {
    // 标准错误日志
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    
    return this.props.children;
  }
}
```

### 2.4 错误恢复

```javascript
// 智能错误恢复
class RecoveryErrorBoundary extends React.Component {
  state = { 
    hasError: false, 
    recoveryAttempted: false 
  };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误
    this.logError(error, errorInfo);
    
    // 尝试自动恢复
    if (!this.state.recoveryAttempted) {
      this.attemptRecovery(error);
    }
  }
  
  attemptRecovery(error) {
    this.setState({ recoveryAttempted: true });
    
    // 清除可能损坏的缓存
    this.clearCache();
    
    // 重置应用状态
    this.resetAppState();
    
    // 延迟重试
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 2000);
  }
  
  clearCache() {
    // 清除localStorage
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear cache:', e);
    }
    
    // 清除sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }
  
  resetAppState() {
    // 通知应用重置状态
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // 清除Redux状态（如果使用）
    if (window.__REDUX_STORE__) {
      window.__REDUX_STORE__.dispatch({ type: 'RESET' });
    }
  }
  
  logError(error, errorInfo) {
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        recoveryAttempted: this.state.recoveryAttempted
      })
    });
  }
  
  render() {
    if (this.state.hasError) {
      if (this.state.recoveryAttempted) {
        return (
          <div>
            <h2>正在尝试恢复...</h2>
            <Spinner />
          </div>
        );
      }
      
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

## 第三部分：高级技巧

### 3.1 错误上下文收集

```javascript
// 收集丰富的错误上下文
class ContextRichErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    const context = this.collectContext(error, errorInfo);
    this.reportError(context);
  }
  
  collectContext(error, errorInfo) {
    return {
      // 错误信息
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      
      // 组件信息
      component: {
        stack: errorInfo.componentStack,
        props: this.props,
        state: this.state
      },
      
      // 浏览器信息
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      
      // 页面信息
      page: {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title
      },
      
      // 性能信息
      performance: this.getPerformanceData(),
      
      // 用户信息
      user: this.getUserInfo(),
      
      // 时间信息
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
  
  getPerformanceData() {
    if (!window.performance) return null;
    
    const navigation = performance.getEntriesByType('navigation')[0];
    const memory = performance.memory;
    
    return {
      loadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart,
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null
    };
  }
  
  getUserInfo() {
    // 从应用状态获取用户信息
    return {
      id: this.props.user?.id,
      email: this.props.user?.email,
      role: this.props.user?.role,
      sessionDuration: this.getSessionDuration()
    };
  }
  
  getSessionDuration() {
    const sessionStart = sessionStorage.getItem('sessionStart');
    if (!sessionStart) return 0;
    return Date.now() - parseInt(sessionStart);
  }
  
  reportError(context) {
    fetch('/api/errors/detailed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context)
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    
    return this.props.children;
  }
}
```

### 3.2 错误聚合

```javascript
// 错误聚合和去重
class AggregatingErrorBoundary extends React.Component {
  state = { hasError: false };
  errorQueue = [];
  flushTimeout = null;
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 添加到队列
    this.errorQueue.push({
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    });
    
    // 去重
    this.deduplicateErrors();
    
    // 批量发送
    this.scheduleFlush();
  }
  
  deduplicateErrors() {
    const seen = new Set();
    this.errorQueue = this.errorQueue.filter(item => {
      const key = `${item.error}-${item.componentStack}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  scheduleFlush() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
    
    this.flushTimeout = setTimeout(() => {
      this.flushErrors();
    }, 5000);  // 5秒后批量发送
  }
  
  flushErrors() {
    if (this.errorQueue.length === 0) return;
    
    fetch('/api/errors/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errors: this.errorQueue,
        count: this.errorQueue.length
      })
    }).then(() => {
      this.errorQueue = [];
    });
  }
  
  componentWillUnmount() {
    // 组件卸载时立即发送剩余错误
    this.flushErrors();
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    
    return this.props.children;
  }
}
```

### 3.3 错误重放

```javascript
// 错误重放功能
class ReplayableErrorBoundary extends React.Component {
  state = { hasError: false };
  actionLog = [];
  
  componentDidMount() {
    // 记录用户操作
    this.startRecording();
  }
  
  startRecording() {
    // 记录点击
    document.addEventListener('click', this.recordClick);
    
    // 记录输入
    document.addEventListener('input', this.recordInput);
    
    // 记录导航
    window.addEventListener('popstate', this.recordNavigation);
  }
  
  recordClick = (e) => {
    this.actionLog.push({
      type: 'click',
      target: e.target.tagName,
      text: e.target.textContent?.slice(0, 50),
      timestamp: Date.now()
    });
  };
  
  recordInput = (e) => {
    this.actionLog.push({
      type: 'input',
      target: e.target.name || e.target.id,
      timestamp: Date.now()
    });
  };
  
  recordNavigation = () => {
    this.actionLog.push({
      type: 'navigation',
      url: window.location.href,
      timestamp: Date.now()
    });
  };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 发送错误和用户操作日志
    fetch('/api/errors/with-replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        actionLog: this.actionLog.slice(-50),  // 最近50个操作
        timestamp: Date.now()
      })
    });
  }
  
  componentWillUnmount() {
    document.removeEventListener('click', this.recordClick);
    document.removeEventListener('input', this.recordInput);
    window.removeEventListener('popstate', this.recordNavigation);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorPage />;
    }
    
    return this.props.children;
  }
}
```

## 注意事项

### 1. 只在提交阶段调用

```javascript
// componentDidCatch在commit阶段调用
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // DOM已更新
    // 可以安全地操作DOM
    // 可以发送网络请求
    // 可以更新localStorage
  }
}
```

### 2. 不要在componentDidCatch中抛出错误

```javascript
// ❌ 不要抛出新错误
componentDidCatch(error, errorInfo) {
  throw new Error('Logging failed');  // 危险！
}

// ✅ 正确处理错误
componentDidCatch(error, errorInfo) {
  try {
    this.logError(error, errorInfo);
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
}
```

### 3. 异步操作要处理错误

```javascript
// ✅ 正确处理异步错误
componentDidCatch(error, errorInfo) {
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({ error, errorInfo })
  })
  .catch(err => {
    console.error('Failed to report error:', err);
    // 降级方案
    localStorage.setItem('pendingError', JSON.stringify(error));
  });
}
```

## 常见问题

### Q1: componentDidCatch何时调用？

**A:** 子组件抛出错误后，在提交阶段调用。

### Q2: 可以在componentDidCatch中setState吗？

**A:** 可以，但通常在getDerivedStateFromError中更新state。

### Q3: componentDidCatch能捕获异步错误吗？

**A:** 不能，只能捕获渲染时的同步错误。

### Q4: 如何区分首次错误和重复错误？

**A:** 在state中维护错误历史记录。

### Q5: componentDidCatch会被调用多次吗？

**A:** 每次子组件抛出新错误都会调用。

### Q6: 可以在componentDidCatch中访问DOM吗？

**A:** 可以，此时DOM已更新完成。

### Q7: 如何防止错误日志过多？

**A:** 实现去重、聚合、限流机制。

### Q8: componentDidCatch影响性能吗？

**A:** 只在错误发生时执行，正常情况无影响。

### Q9: 开发环境和生产环境有区别吗？

**A:** 方法行为相同，但可以基于环境做不同处理。

### Q10: 如何测试componentDidCatch？

**A:** 手动抛出错误或使用测试库模拟错误场景。

## 总结

### 核心要点

```
1. 方法特性
   ✅ 实例方法
   ✅ 提交阶段调用
   ✅ 可以有副作用
   ✅ 可以访问this

2. 主要用途
   ✅ 错误日志记录
   ✅ 错误上报
   ✅ 用户通知
   ✅ 错误分析

3. 实践要点
   ✅ 与getDerivedStateFromError配合
   ✅ 捕获异常
   ✅ 收集上下文
   ✅ 优雅降级
```

### 最佳实践

```
1. 错误记录
   ✅ 完整的上下文
   ✅ 去重和聚合
   ✅ 批量发送
   ✅ 降级方案

2. 用户体验
   ✅ 友好提示
   ✅ 自动恢复
   ✅ 重试机制
   ✅ 问题反馈

3. 开发实践
   ✅ 环境区分
   ✅ 敏感信息过滤
   ✅ 性能优化
   ✅ 监控告警
```

componentDidCatch是错误边界中处理副作用的关键方法，合理使用能构建完善的错误处理体系。

