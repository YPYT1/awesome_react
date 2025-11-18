# if-else条件渲染

## 学习目标

通过本章学习，你将掌握：

- 条件渲染的概念和作用
- if-else语句在React中的使用
- 提前返回模式
- 多条件渲染的实现
- 条件渲染的性能优化
- React 19中的条件渲染最佳实践
- 实战案例和常见问题

## 第一部分：条件渲染基础

### 1.1 什么是条件渲染

条件渲染是指根据不同的条件显示不同的UI内容。

#### 基本概念

```jsx
// 简单示例
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>欢迎回来！</h1>;
  }
  return <h1>请先登录</h1>;
}

// 使用
<Greeting isLoggedIn={true} />   // 显示：欢迎回来！
<Greeting isLoggedIn={false} />  // 显示：请先登录
```

### 1.2 基本if-else模式

```jsx
function BasicIfElse({ user }) {
  if (user) {
    return (
      <div>
        <h2>用户信息</h2>
        <p>姓名：{user.name}</p>
        <p>邮箱：{user.email}</p>
      </div>
    );
  } else {
    return (
      <div>
        <h2>未登录</h2>
        <button>登录</button>
      </div>
    );
  }
}

// 简化（省略else）
function SimplifiedIfElse({ user }) {
  if (!user) {
    return (
      <div>
        <h2>未登录</h2>
        <button>登录</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>用户信息</h2>
      <p>姓名：{user.name}</p>
    </div>
  );
}
```

### 1.3 if语句在JSX中的使用限制

```jsx
function IfInJSX() {
  const isLoggedIn = true;
  
  return (
    <div>
      {/* 错误：JSX中不能直接使用if语句 */}
      {/* {if (isLoggedIn) { return <p>已登录</p> }} */}
      
      {/* 正确：使用三元运算符 */}
      {isLoggedIn ? <p>已登录</p> : <p>未登录</p>}
      
      {/* 正确：使用逻辑与运算符 */}
      {isLoggedIn && <p>已登录</p>}
      
      {/* 正确：使用立即执行函数 */}
      {(() => {
        if (isLoggedIn) {
          return <p>已登录</p>;
        }
        return <p>未登录</p>;
      })()}
    </div>
  );
}
```

## 第二部分：提前返回模式

### 2.1 Early Return模式

```jsx
// 提前返回（Guard Clauses）
function UserProfile({ user }) {
  // 处理null/undefined
  if (!user) {
    return <div>用户不存在</div>;
  }
  
  // 处理加载状态
  if (user.loading) {
    return <div>加载中...</div>;
  }
  
  // 处理错误状态
  if (user.error) {
    return <div>错误：{user.error}</div>;
  }
  
  // 正常渲染
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 优势对比
// 不好：嵌套的if-else
function NestedIfElse({ user }) {
  if (user) {
    if (!user.loading) {
      if (!user.error) {
        return <div>{user.name}</div>;
      } else {
        return <div>错误</div>;
      }
    } else {
      return <div>加载中</div>;
    }
  } else {
    return <div>用户不存在</div>;
  }
}

// 好：提前返回
function EarlyReturn({ user }) {
  if (!user) return <div>用户不存在</div>;
  if (user.loading) return <div>加载中</div>;
  if (user.error) return <div>错误</div>;
  
  return <div>{user.name}</div>;
}
```

### 2.2 Loading、Error、Empty状态

```jsx
function DataDisplay({ data, loading, error }) {
  // 1. 处理加载状态
  if (loading) {
    return (
      <div className="loading">
        <Spinner />
        <p>加载中...</p>
      </div>
    );
  }
  
  // 2. 处理错误状态
  if (error) {
    return (
      <div className="error">
        <p>发生错误：{error.message}</p>
        <button onClick={retry}>重试</button>
      </div>
    );
  }
  
  // 3. 处理空数据
  if (!data || data.length === 0) {
    return (
      <div className="empty">
        <p>暂无数据</p>
      </div>
    );
  }
  
  // 4. 正常渲染数据
  return (
    <div className="data-list">
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

// 实际应用：用户列表
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);
  
  if (loading) {
    return <div>加载用户列表...</div>;
  }
  
  if (error) {
    return <div>加载失败：{error.message}</div>;
  }
  
  if (users.length === 0) {
    return <div>暂无用户</div>;
  }
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2.3 权限检查模式

```jsx
function ProtectedComponent({ user, requiredRole }) {
  // 1. 未登录
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // 2. 无权限
  if (user.role !== requiredRole) {
    return (
      <div>
        <h2>无权访问</h2>
        <p>您的角色：{user.role}</p>
        <p>需要角色：{requiredRole}</p>
      </div>
    );
  }
  
  // 3. 账号未激活
  if (!user.isActive) {
    return <div>请先激活账号</div>;
  }
  
  // 4. 有权限，正常显示
  return (
    <div>
      <h2>受保护的内容</h2>
      <p>欢迎，{user.name}</p>
    </div>
  );
}

// 使用
<ProtectedComponent 
  user={currentUser} 
  requiredRole="admin" 
/>
```

## 第三部分：多条件渲染

### 3.1 if-else if-else链

```jsx
function MultipleConditions({ status }) {
  if (status === 'loading') {
    return <div>加载中...</div>;
  } else if (status === 'error') {
    return <div>发生错误</div>;
  } else if (status === 'empty') {
    return <div>暂无数据</div>;
  } else if (status === 'success') {
    return <div>加载成功</div>;
  } else {
    return <div>未知状态</div>;
  }
}

// 简化（省略else）
function SimplifiedMultiple({ status }) {
  if (status === 'loading') return <div>加载中...</div>;
  if (status === 'error') return <div>发生错误</div>;
  if (status === 'empty') return <div>暂无数据</div>;
  if (status === 'success') return <div>加载成功</div>;
  
  return <div>未知状态</div>;
}
```

### 3.2 switch语句

```jsx
function SwitchStatement({ status }) {
  switch (status) {
    case 'loading':
      return <div>加载中...</div>;
      
    case 'error':
      return <div>发生错误</div>;
      
    case 'empty':
      return <div>暂无数据</div>;
      
    case 'success':
      return <div>加载成功</div>;
      
    default:
      return <div>未知状态</div>;
  }
}

// switch在JSX中的使用
function SwitchInJSX({ type }) {
  return (
    <div>
      {(() => {
        switch (type) {
          case 'info':
            return <InfoIcon />;
          case 'warning':
            return <WarningIcon />;
          case 'error':
            return <ErrorIcon />;
          default:
            return <DefaultIcon />;
        }
      })()}
    </div>
  );
}
```

### 3.3 对象映射模式

```jsx
// 使用对象映射替代if-else
function ObjectMapping({ status }) {
  const statusComponents = {
    loading: <div>加载中...</div>,
    error: <div>发生错误</div>,
    empty: <div>暂无数据</div>,
    success: <div>加载成功</div>
  };
  
  return statusComponents[status] || <div>未知状态</div>;
}

// 组件映射
function ComponentMapping({ type }) {
  const components = {
    button: Button,
    input: Input,
    select: Select,
    textarea: Textarea
  };
  
  const Component = components[type] || DefaultComponent;
  
  return <Component />;
}

// 动态配置
function DynamicConfig({ level }) {
  const configs = {
    beginner: {
      title: '初级',
      content: <BeginnerContent />,
      color: 'green'
    },
    intermediate: {
      title: '中级',
      content: <IntermediateContent />,
      color: 'blue'
    },
    advanced: {
      title: '高级',
      content: <AdvancedContent />,
      color: 'red'
    }
  };
  
  const config = configs[level];
  
  if (!config) {
    return <div>未知级别</div>;
  }
  
  return (
    <div style={{ borderColor: config.color }}>
      <h2>{config.title}</h2>
      {config.content}
    </div>
  );
}
```

## 第四部分：条件渲染的变量提取

### 4.1 提取为变量

```jsx
function ExtractToVariable({ user, showDetails }) {
  // 复杂条件提取为变量
  const isAdmin = user?.role === 'admin';
  const isActive = user?.status === 'active';
  const hasPermission = isAdmin && isActive;
  
  if (!user) {
    return <div>请登录</div>;
  }
  
  if (!hasPermission) {
    return <div>无权访问</div>;
  }
  
  return (
    <div>
      <h2>{user.name}</h2>
      {showDetails && (
        <div>
          <p>角色：{user.role}</p>
          <p>状态：{user.status}</p>
        </div>
      )}
    </div>
  );
}

// 元素提取
function ElementExtraction({ status, data }) {
  let content;
  
  if (status === 'loading') {
    content = <Spinner />;
  } else if (status === 'error') {
    content = <ErrorMessage />;
  } else {
    content = <DataDisplay data={data} />;
  }
  
  return (
    <div className="container">
      <header>标题</header>
      <main>{content}</main>
      <footer>页脚</footer>
    </div>
  );
}
```

### 4.2 函数提取

```jsx
function FunctionExtraction({ status, data, error }) {
  // 提取渲染逻辑为函数
  function renderContent() {
    if (status === 'loading') {
      return <div>加载中...</div>;
    }
    
    if (status === 'error') {
      return <div>错误：{error}</div>;
    }
    
    if (!data || data.length === 0) {
      return <div>暂无数据</div>;
    }
    
    return (
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
  
  return (
    <div>
      <h1>数据列表</h1>
      {renderContent()}
    </div>
  );
}

// 提取为独立组件
function ContentRenderer({ status, data, error }) {
  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState error={error} />;
  if (!data?.length) return <EmptyState />;
  
  return <DataList data={data} />;
}

function App() {
  const { data, loading, error } = useFetchData();
  const status = loading ? 'loading' : error ? 'error' : 'success';
  
  return (
    <div>
      <h1>应用</h1>
      <ContentRenderer status={status} data={data} error={error} />
    </div>
  );
}
```

## 第五部分：复杂条件渲染

### 5.1 嵌套条件

```jsx
function NestedConditions({ user, isOnline, hasMessages }) {
  if (!user) {
    return <LoginPrompt />;
  }
  
  if (!user.isVerified) {
    return <VerificationRequired user={user} />;
  }
  
  if (user.isBanned) {
    return <BannedNotice />;
  }
  
  // 用户已登录且验证
  if (isOnline) {
    if (hasMessages) {
      return <DashboardWithMessages user={user} />;
    }
    return <Dashboard user={user} />;
  }
  
  return <OfflineMode user={user} />;
}

// 优化：减少嵌套
function FlattenedConditions({ user, isOnline, hasMessages }) {
  if (!user) return <LoginPrompt />;
  if (!user.isVerified) return <VerificationRequired user={user} />;
  if (user.isBanned) return <BannedNotice />;
  
  if (!isOnline) {
    return <OfflineMode user={user} />;
  }
  
  if (hasMessages) {
    return <DashboardWithMessages user={user} />;
  }
  
  return <Dashboard user={user} />;
}
```

### 5.2 组合条件

```jsx
function CombinedConditions({ user, subscription, feature }) {
  // 复杂的权限判断
  const isAdmin = user?.role === 'admin';
  const isPremium = subscription?.type === 'premium';
  const isFeatureEnabled = feature?.enabled === true;
  
  const hasAccess = isAdmin || (isPremium && isFeatureEnabled);
  
  if (!hasAccess) {
    if (!isPremium) {
      return (
        <div>
          <h2>需要升级</h2>
          <p>此功能仅对高级用户开放</p>
          <button>升级到高级版</button>
        </div>
      );
    }
    
    if (!isFeatureEnabled) {
      return (
        <div>
          <h2>功能未启用</h2>
          <p>请在设置中启用此功能</p>
        </div>
      );
    }
  }
  
  return <PremiumFeature />;
}
```

### 5.3 数据驱动的条件渲染

```jsx
function DataDrivenRendering({ userType }) {
  const configs = {
    guest: {
      canEdit: false,
      canDelete: false,
      canView: true,
      message: '游客模式'
    },
    user: {
      canEdit: true,
      canDelete: false,
      canView: true,
      message: '普通用户'
    },
    admin: {
      canEdit: true,
      canDelete: true,
      canView: true,
      message: '管理员'
    }
  };
  
  const config = configs[userType] || configs.guest;
  
  return (
    <div>
      <h2>{config.message}</h2>
      {config.canView && <ViewButton />}
      {config.canEdit && <EditButton />}
      {config.canDelete && <DeleteButton />}
    </div>
  );
}
```

## 第六部分：性能优化

### 6.1 避免不必要的渲染

```jsx
// 不好：总是创建元素
function AlwaysCreate({ showDetails, user }) {
  const details = (
    <div>
      <p>邮箱：{user.email}</p>
      <p>电话：{user.phone}</p>
      <p>地址：{user.address}</p>
    </div>
  );
  
  return (
    <div>
      <h2>{user.name}</h2>
      {showDetails && details}  {/* details总是被创建 */}
    </div>
  );
}

// 好：条件创建
function ConditionalCreate({ showDetails, user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      {showDetails && (
        <div>
          <p>邮箱：{user.email}</p>
          <p>电话：{user.phone}</p>
          <p>地址：{user.address}</p>
        </div>
      )}
    </div>
  );
}
```

### 6.2 懒加载组件

```jsx
import { lazy, Suspense } from 'react';

// 懒加载重组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function ConditionalLazy({ showHeavy }) {
  if (!showHeavy) {
    return <div>点击按钮加载组件</div>;
  }
  
  return (
    <Suspense fallback={<div>加载组件中...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 条件懒加载
function DynamicLazy({ componentType }) {
  const Component = lazy(() => {
    switch (componentType) {
      case 'chart':
        return import('./ChartComponent');
      case 'table':
        return import('./TableComponent');
      case 'map':
        return import('./MapComponent');
      default:
        return import('./DefaultComponent');
    }
  });
  
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}
```

### 6.3 使用useMemo优化

```jsx
function MemoizedCondition({ showExpensive, data }) {
  // 昂贵的条件计算
  const shouldShow = useMemo(() => {
    return data.length > 100 && showExpensive;
  }, [data.length, showExpensive]);
  
  // 昂贵的组件创建
  const expensiveComponent = useMemo(() => {
    if (!shouldShow) return null;
    
    return <ExpensiveComponent data={data} />;
  }, [shouldShow, data]);
  
  return (
    <div>
      <h1>数据展示</h1>
      {expensiveComponent}
    </div>
  );
}
```

## 第七部分：React 19最佳实践

### 7.1 Server Components条件渲染

```jsx
// Server Component
async function UserDashboard({ userId }) {
  const user = await db.users.findById(userId);
  
  // 提前返回
  if (!user) {
    return <div>用户不存在</div>;
  }
  
  if (user.suspended) {
    return <SuspendedNotice user={user} />;
  }
  
  // 异步获取更多数据
  const [posts, stats] = await Promise.all([
    db.posts.findByUser(userId),
    db.stats.getForUser(userId)
  ]);
  
  return (
    <div>
      <UserHeader user={user} />
      {stats.postCount > 0 && <UserPosts posts={posts} />}
      {stats.followerCount > 100 && <PopularBadge />}
    </div>
  );
}
```

### 7.2 use() Hook条件使用

```jsx
import { use } from 'react';

function ConditionalUse({ shouldFetch, userId }) {
  // React 19允许条件使用use()
  const user = shouldFetch ? use(fetchUser(userId)) : null;
  
  if (!shouldFetch) {
    return <div>数据获取已禁用</div>;
  }
  
  if (!user) {
    return <div>用户不存在</div>;
  }
  
  return <div>{user.name}</div>;
}
```

## 第八部分：实战案例

### 8.1 认证系统

```jsx
function AuthenticatedApp() {
  const { user, loading } = useAuth();
  
  // 加载中
  if (loading) {
    return (
      <div className="app-loading">
        <Spinner />
        <p>初始化应用...</p>
      </div>
    );
  }
  
  // 未登录
  if (!user) {
    return <LoginPage />;
  }
  
  // 账号未验证
  if (!user.emailVerified) {
    return <EmailVerificationPage user={user} />;
  }
  
  // 首次登录
  if (user.isFirstLogin) {
    return <OnboardingFlow user={user} />;
  }
  
  // 正常应用
  return (
    <div>
      <Navigation user={user} />
      <Main />
      <Footer />
    </div>
  );
}
```

### 8.2 支付流程

```jsx
function PaymentFlow() {
  const [step, setStep] = useState('cart');
  const [cart, setCart] = useState([]);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  
  // 步骤1：购物车
  if (step === 'cart') {
    if (cart.length === 0) {
      return (
        <div>
          <h2>购物车是空的</h2>
          <button onClick={() => navigate('/products')}>
            去购物
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <CartView cart={cart} />
        <button onClick={() => setStep('shipping')}>
          去结算
        </button>
      </div>
    );
  }
  
  // 步骤2：配送信息
  if (step === 'shipping') {
    return (
      <div>
        <ShippingForm
          onSubmit={(info) => {
            setShippingInfo(info);
            setStep('payment');
          }}
          onBack={() => setStep('cart')}
        />
      </div>
    );
  }
  
  // 步骤3：支付信息
  if (step === 'payment') {
    return (
      <div>
        <PaymentForm
          onSubmit={(info) => {
            setPaymentInfo(info);
            setStep('confirm');
          }}
          onBack={() => setStep('shipping')}
        />
      </div>
    );
  }
  
  // 步骤4：确认订单
  if (step === 'confirm') {
    return (
      <div>
        <OrderSummary
          cart={cart}
          shipping={shippingInfo}
          payment={paymentInfo}
        />
        <button onClick={placeOrder}>确认下单</button>
        <button onClick={() => setStep('payment')}>返回</button>
      </div>
    );
  }
  
  // 步骤5：完成
  if (step === 'complete') {
    return (
      <div>
        <h2>订单已提交</h2>
        <p>感谢您的购买！</p>
      </div>
    );
  }
  
  return <div>未知步骤</div>;
}
```

### 8.3 权限控制系统

```jsx
function PermissionGate({ children, requiredPermissions, user }) {
  // 未登录
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // 账号被禁用
  if (user.disabled) {
    return (
      <div>
        <h2>账号已被禁用</h2>
        <p>原因：{user.disabledReason}</p>
        <button onClick={contactSupport}>联系客服</button>
      </div>
    );
  }
  
  // 检查权限
  const hasPermission = requiredPermissions.every(permission =>
    user.permissions.includes(permission)
  );
  
  if (!hasPermission) {
    const missingPermissions = requiredPermissions.filter(
      p => !user.permissions.includes(p)
    );
    
    return (
      <div>
        <h2>权限不足</h2>
        <p>缺少权限：</p>
        <ul>
          {missingPermissions.map(p => <li key={p}>{p}</li>)}
        </ul>
        <button onClick={requestPermission}>申请权限</button>
      </div>
    );
  }
  
  // 有权限，渲染子组件
  return children;
}

// 使用
<PermissionGate 
  requiredPermissions={['read:users', 'write:users']}
  user={currentUser}
>
  <UserManagement />
</PermissionGate>
```

## 第九部分：最佳实践

### 9.1 条件渲染清单

```jsx
// 1. 简单二选一：提前返回
if (condition) return <ComponentA />;
return <ComponentB />;

// 2. 复杂逻辑：提取为变量或函数
const content = getContent(status);
return <div>{content}</div>;

// 3. 多个条件：switch或对象映射
const Component = componentMap[type];

// 4. 性能敏感：useMemo
const component = useMemo(() => {
  if (condition) return <Heavy />;
}, [condition]);

// 5. 懒加载：lazy + Suspense
const Heavy = lazy(() => import('./Heavy'));
if (show) return <Suspense><Heavy /></Suspense>;
```

## 练习题

### 基础练习

1. 创建一个登录状态显示组件
2. 实现加载、错误、成功三种状态的渲染
3. 使用if-else实现用户权限检查

### 进阶练习

1. 实现一个多步骤表单流程
2. 创建一个支付流程的状态机
3. 实现一个条件渲染的路由守卫

### 高级练习

1. 优化复杂条件渲染的性能
2. 实现一个灵活的权限控制系统
3. 使用React 19特性优化条件渲染

通过本章学习，你已经掌握了if-else条件渲染的所有技巧。合理使用条件渲染能让你的应用更加灵活和健壮。继续学习，探索更多渲染模式！

