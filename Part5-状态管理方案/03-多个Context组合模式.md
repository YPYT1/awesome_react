# 多个Context组合模式

## 概述

在实际项目中，我们通常需要多个Context来管理不同领域的状态。本文深入探讨如何优雅地组合多个Context，构建可维护、高性能的状态管理架构。

## Context组合的挑战

### 挑战1：Provider嵌套地狱

```jsx
// 问题：多层嵌套难以维护
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <UserPreferencesProvider>
              <DataProvider>
                <UIProvider>
                  <MainApp />
                </UIProvider>
              </DataProvider>
            </UserPreferencesProvider>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### 挑战2：Context间的依赖关系

```jsx
// UserProvider依赖AuthProvider的数据
function UserProvider({ children }) {
  const { userId } = useAuth(); // 依赖AuthContext
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUser(userId).then(setUser);
    }
  }, [userId]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
```

### 挑战3：状态同步问题

```jsx
// 多个Context之间需要保持数据一致性
function ThemeProvider({ children }) {
  const { preferences } = useUserPreferences();
  const [theme, setTheme] = useState(preferences.theme || 'light');

  // 需要同步用户偏好和主题状态
  useEffect(() => {
    if (preferences.theme !== theme) {
      setTheme(preferences.theme);
    }
  }, [preferences.theme]);

  // ...
}
```

## 组合模式

### 模式1：Compose Provider模式

创建一个组合Provider来避免嵌套地狱：

```jsx
// 辅助函数：组合多个Provider
function composeProviders(...providers) {
  return ({ children }) => {
    return providers.reduceRight((acc, Provider) => {
      return <Provider>{acc}</Provider>;
    }, children);
  };
}

// 定义各个Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh-CN');
  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// 组合所有Provider
const AppProviders = composeProviders(
  AuthProvider,
  ThemeProvider,
  LanguageProvider
);

// 使用
function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}
```

### 模式2：配置化Provider组合

```jsx
// 更灵活的配置方式
function ProviderComposer({ providers, children }) {
  return providers.reduceRight(
    (acc, { Provider, props = {} }) => (
      <Provider {...props}>{acc}</Provider>
    ),
    children
  );
}

// 使用
function App() {
  const providers = [
    { Provider: AuthProvider },
    { Provider: ThemeProvider, props: { defaultTheme: 'dark' } },
    { Provider: LanguageProvider, props: { defaultLanguage: 'en-US' } },
    { Provider: NotificationProvider }
  ];

  return (
    <ProviderComposer providers={providers}>
      <MainApp />
    </ProviderComposer>
  );
}
```

### 模式3：Provider工厂模式

```jsx
// 创建Provider工厂
function createProvider(useValue) {
  const Context = createContext(undefined);

  function Provider({ children }) {
    const value = useValue();
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContextValue() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useContextValue must be used within Provider');
    }
    return context;
  }

  return [Provider, useContextValue];
}

// 使用工厂创建多个Provider
const [AuthProvider, useAuth] = createProvider(() => {
  const [user, setUser] = useState(null);
  return useMemo(() => ({ user, setUser }), [user]);
});

const [ThemeProvider, useTheme] = createProvider(() => {
  const [theme, setTheme] = useState('light');
  return useMemo(() => ({ theme, setTheme }), [theme]);
});

const [LanguageProvider, useLanguage] = createProvider(() => {
  const [language, setLanguage] = useState('zh-CN');
  return useMemo(() => ({ language, setLanguage }), [language]);
});

// 组合
const AppProviders = composeProviders(AuthProvider, ThemeProvider, LanguageProvider);
```

### 模式4：分层Provider架构

```jsx
// 核心层：基础服务
function CoreProviders({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <APIProvider>
          <CacheProvider>
            {children}
          </CacheProvider>
        </APIProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// UI层：界面相关
function UIProviders({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// 数据层：业务数据
function DataProviders({ children }) {
  return (
    <UserProvider>
      <ProductsProvider>
        <OrdersProvider>
          {children}
        </OrdersProvider>
      </ProductsProvider>
    </UserProvider>
  );
}

// 应用入口
function App() {
  return (
    <CoreProviders>
      <UIProviders>
        <DataProviders>
          <MainApp />
        </DataProviders>
      </UIProviders>
    </CoreProviders>
  );
}
```

## Context依赖管理

### 依赖注入模式

```jsx
// 创建一个依赖注入容器
const DependencyContext = createContext({});

function DependencyProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [api, setAPI] = useState(null);

  // 注册服务
  useEffect(() => {
    const authService = new AuthService();
    const apiService = new APIService(authService);

    setAuth(authService);
    setAPI(apiService);
  }, []);

  const dependencies = useMemo(
    () => ({
      auth,
      api
    }),
    [auth, api]
  );

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
}

// 使用依赖
function useDependency(key) {
  const dependencies = useContext(DependencyContext);
  if (!dependencies[key]) {
    throw new Error(`Dependency ${key} not found`);
  }
  return dependencies[key];
}

// 在组件中使用
function UserProfile() {
  const auth = useDependency('auth');
  const api = useDependency('api');

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = auth.getCurrentUserId();
    api.getUser(userId).then(setUser);
  }, [auth, api]);

  return <div>{user?.name}</div>;
}
```

### Context桥接模式

当一个Context需要访问另一个Context的数据：

```jsx
// AuthContext
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

// UserPreferencesContext依赖AuthContext
const UserPreferencesContext = createContext();

function UserPreferencesProvider({ children }) {
  const { user } = useAuth(); // 依赖AuthContext
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    if (user) {
      fetchUserPreferences(user.id).then(setPreferences);
    } else {
      setPreferences({});
    }
  }, [user]);

  const value = useMemo(
    () => ({ preferences, setPreferences }),
    [preferences]
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

// 确保Provider顺序正确
function App() {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        {/* UserPreferencesProvider可以访问AuthContext */}
        <MainApp />
      </UserPreferencesProvider>
    </AuthProvider>
  );
}
```

### Context聚合模式

将多个相关Context聚合到一个Hook中：

```jsx
// 定义各个Context
const UserContext = createContext();
const ThemeContext = createContext();
const LanguageContext = createContext();

// 聚合Hook
function useApp() {
  const user = useContext(UserContext);
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);

  if (!user || !theme || !language) {
    throw new Error('useApp must be used within AppProviders');
  }

  return {
    user,
    theme,
    language
  };
}

// 或者更细粒度的聚合
function useUserSettings() {
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  return {
    userId: user?.id,
    userName: user?.name,
    theme,
    language
  };
}

// 使用
function ProfilePage() {
  const { userId, userName, theme, language } = useUserSettings();

  return (
    <div className={theme}>
      <h1>{userName}</h1>
      <p>Language: {language}</p>
    </div>
  );
}
```

## 高级组合模式

### 模式1：动态Provider注册

```jsx
// 创建Provider注册表
const ProviderRegistry = createContext({
  providers: new Map(),
  registerProvider: () => {},
  unregisterProvider: () => {}
});

function DynamicProviderSystem({ children }) {
  const [providers, setProviders] = useState(new Map());

  const registerProvider = useCallback((id, Provider, props = {}) => {
    setProviders(prev => new Map(prev).set(id, { Provider, props }));
  }, []);

  const unregisterProvider = useCallback((id) => {
    setProviders(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      providers,
      registerProvider,
      unregisterProvider
    }),
    [providers, registerProvider, unregisterProvider]
  );

  // 渲染所有注册的Provider
  let content = children;
  providers.forEach(({ Provider, props }) => {
    content = <Provider {...props}>{content}</Provider>;
  });

  return (
    <ProviderRegistry.Provider value={value}>
      {content}
    </ProviderRegistry.Provider>
  );
}

// 使用动态注册
function FeatureModule() {
  const { registerProvider, unregisterProvider } = useContext(ProviderRegistry);

  useEffect(() => {
    registerProvider('feature', FeatureProvider, { config: {} });
    return () => unregisterProvider('feature');
  }, [registerProvider, unregisterProvider]);

  return <FeatureContent />;
}
```

### 模式2：条件Provider

```jsx
function ConditionalProviders({ children }) {
  const [features, setFeatures] = useState({
    analytics: false,
    experiments: false,
    notifications: false
  });

  return (
    <FeatureToggleContext.Provider value={{ features, setFeatures }}>
      {features.analytics && <AnalyticsProvider>{children}</AnalyticsProvider>}
      {features.experiments && <ExperimentsProvider>{children}</ExperimentsProvider>}
      {features.notifications && <NotificationProvider>{children}</NotificationProvider>}
      {!features.analytics && !features.experiments && !features.notifications && children}
    </FeatureToggleContext.Provider>
  );
}

// 更优雅的实现
function SmartConditionalProviders({ children }) {
  const [features, setFeatures] = useState({
    analytics: false,
    experiments: false,
    notifications: false
  });

  const providerMap = {
    analytics: AnalyticsProvider,
    experiments: ExperimentsProvider,
    notifications: NotificationProvider
  };

  let content = children;

  Object.entries(features).forEach(([key, enabled]) => {
    if (enabled && providerMap[key]) {
      const Provider = providerMap[key];
      content = <Provider>{content}</Provider>;
    }
  });

  return (
    <FeatureToggleContext.Provider value={{ features, setFeatures }}>
      {content}
    </FeatureToggleContext.Provider>
  );
}
```

### 模式3：异步Provider加载

```jsx
function LazyProviderLoader({ loader, fallback, children }) {
  const [Provider, setProvider] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loader()
      .then(module => setProvider(() => module.default))
      .catch(setError);
  }, [loader]);

  if (error) {
    return <div>Error loading provider: {error.message}</div>;
  }

  if (!Provider) {
    return fallback || <div>Loading provider...</div>;
  }

  return <Provider>{children}</Provider>;
}

// 使用
function App() {
  return (
    <LazyProviderLoader
      loader={() => import('./providers/HeavyProvider')}
      fallback={<div>Loading...</div>}
    >
      <MainApp />
    </LazyProviderLoader>
  );
}
```

## 实战案例

### 案例1：电商应用的Context架构

```jsx
// 1. 核心认证Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(userData => {
      setUser(userData);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (credentials) => {
    const userData = await authAPI.login(credentials);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 2. 购物车Context（依赖Auth）
const CartContext = createContext();

function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  // 用户登录后同步购物车
  useEffect(() => {
    if (user) {
      syncCartFromServer(user.id).then(setItems);
    } else {
      loadCartFromLocalStorage().then(setItems);
    }
  }, [user]);

  const addItem = useCallback((product) => {
    setItems(prev => {
      const updated = [...prev, product];
      if (user) {
        syncCartToServer(user.id, updated);
      } else {
        saveCartToLocalStorage(updated);
      }
      return updated;
    });
  }, [user]);

  const value = useMemo(() => ({ items, addItem }), [items, addItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 3. 商品Context
const ProductsContext = createContext();

function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async (filters) => {
    setLoading(true);
    const data = await productsAPI.getProducts(filters);
    setProducts(data);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ products, loading, fetchProducts }),
    [products, loading, fetchProducts]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

// 4. UI状态Context
const UIContext = createContext();

function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      notifications,
      addNotification
    }),
    [sidebarOpen, notifications, addNotification]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// 5. 组合所有Provider
const EcommerceProviders = composeProviders(
  AuthProvider,
  CartProvider,
  ProductsProvider,
  UIProvider
);

// 6. 聚合Hook
function useEcommerce() {
  const auth = useContext(AuthContext);
  const cart = useContext(CartContext);
  const products = useContext(ProductsContext);
  const ui = useContext(UIContext);

  return {
    auth,
    cart,
    products,
    ui
  };
}

// 使用
function App() {
  return (
    <EcommerceProviders>
      <Router>
        <Layout>
          <Routes />
        </Layout>
      </Router>
    </EcommerceProviders>
  );
}

function ProductPage({ productId }) {
  const { products, cart, ui } = useEcommerce();

  const handleAddToCart = () => {
    const product = products.products.find(p => p.id === productId);
    cart.addItem(product);
    ui.addNotification('Added to cart!', 'success');
  };

  return (
    <div>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### 案例2：多租户应用

```jsx
// 1. 租户Context
const TenantContext = createContext();

function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const tenantId = getTenantFromURL();
    loadTenant(tenantId).then(setTenant);
  }, []);

  const value = useMemo(() => ({ tenant, setTenant }), [tenant]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

// 2. 租户配置Context（依赖Tenant）
const TenantConfigContext = createContext();

function TenantConfigProvider({ children }) {
  const { tenant } = useContext(TenantContext);
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (tenant) {
      loadTenantConfig(tenant.id).then(setConfig);
    }
  }, [tenant]);

  const value = useMemo(() => ({ config }), [config]);

  return <TenantConfigContext.Provider value={value}>{children}</TenantConfigContext.Provider>;
}

// 3. 主题Context（依赖TenantConfig）
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const { config } = useContext(TenantConfigContext);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (config.theme) {
      setTheme(config.theme);
    }
  }, [config.theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 4. 权限Context（依赖Tenant）
const PermissionsContext = createContext();

function PermissionsProvider({ children }) {
  const { tenant } = useContext(TenantContext);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (tenant) {
      loadTenantPermissions(tenant.id).then(setPermissions);
    }
  }, [tenant]);

  const hasPermission = useCallback(
    (permission) => permissions.includes(permission),
    [permissions]
  );

  const value = useMemo(
    () => ({ permissions, hasPermission }),
    [permissions, hasPermission]
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

// 5. 组合（注意依赖顺序）
function App() {
  return (
    <TenantProvider>
      <TenantConfigProvider>
        <ThemeProvider>
          <PermissionsProvider>
            <MainApp />
          </PermissionsProvider>
        </ThemeProvider>
      </TenantConfigProvider>
    </TenantProvider>
  );
}

// 6. 使用聚合Hook
function useTenantApp() {
  const tenant = useContext(TenantContext);
  const config = useContext(TenantConfigContext);
  const theme = useContext(ThemeContext);
  const permissions = useContext(PermissionsContext);

  return {
    tenant: tenant.tenant,
    config: config.config,
    theme: theme.theme,
    hasPermission: permissions.hasPermission
  };
}
```

### 案例3：微前端架构

```jsx
// 主应用Provider
const MainAppContext = createContext();

function MainAppProvider({ children }) {
  const [globalState, setGlobalState] = useState({});
  const [microApps, setMicroApps] = useState([]);

  const registerMicroApp = useCallback((appId, appData) => {
    setMicroApps(prev => [...prev, { id: appId, ...appData }]);
  }, []);

  const value = useMemo(
    () => ({
      globalState,
      setGlobalState,
      microApps,
      registerMicroApp
    }),
    [globalState, microApps, registerMicroApp]
  );

  return <MainAppContext.Provider value={value}>{children}</MainAppContext.Provider>;
}

// 微应用通信Context
const MicroAppCommunicationContext = createContext();

function MicroAppCommunicationProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback((from, to, payload) => {
    setMessages(prev => [...prev, { from, to, payload, timestamp: Date.now() }]);
  }, []);

  const subscribeToMessages = useCallback((appId, handler) => {
    const subscription = messages
      .filter(msg => msg.to === appId)
      .forEach(handler);

    return () => {
      // 清理订阅
    };
  }, [messages]);

  const value = useMemo(
    () => ({ messages, sendMessage, subscribeToMessages }),
    [messages, sendMessage, subscribeToMessages]
  );

  return (
    <MicroAppCommunicationContext.Provider value={value}>
      {children}
    </MicroAppCommunicationContext.Provider>
  );
}

// 微应用包装器
function MicroAppWrapper({ appId, children }) {
  const { globalState } = useContext(MainAppContext);
  const { sendMessage, subscribeToMessages } = useContext(MicroAppCommunicationContext);

  const microAppContext = useMemo(
    () => ({
      appId,
      globalState,
      sendMessage: (to, payload) => sendMessage(appId, to, payload),
      subscribeToMessages: (handler) => subscribeToMessages(appId, handler)
    }),
    [appId, globalState, sendMessage, subscribeToMessages]
  );

  return (
    <MicroAppContext.Provider value={microAppContext}>
      {children}
    </MicroAppContext.Provider>
  );
}

// 主应用
function App() {
  return (
    <MainAppProvider>
      <MicroAppCommunicationProvider>
        <Layout>
          <MicroAppWrapper appId="app1">
            <App1 />
          </MicroAppWrapper>
          <MicroAppWrapper appId="app2">
            <App2 />
          </MicroAppWrapper>
        </Layout>
      </MicroAppCommunicationProvider>
    </MainAppProvider>
  );
}
```

## Context组合的最佳实践

### 1. Provider顺序规则

```jsx
// 规则：被依赖的Provider应该在外层
function CorrectOrder() {
  return (
    <AuthProvider>           {/* 1. 最基础的 */}
      <UserPreferencesProvider> {/* 2. 依赖Auth */}
        <ThemeProvider>          {/* 3. 依赖UserPreferences */}
          <MainApp />
        </ThemeProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  );
}

// 错误：依赖顺序颠倒
function WrongOrder() {
  return (
    <ThemeProvider>          {/* 错误：ThemeProvider依赖UserPreferences */}
      <UserPreferencesProvider>
        <AuthProvider>         {/* 错误：UserPreferences依赖Auth */}
          <MainApp />
        </AuthProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}
```

### 2. Context粒度控制

```jsx
// 好的实践：按功能域拆分
const AuthContext = createContext();      // 认证
const UserContext = createContext();      // 用户数据
const ThemeContext = createContext();     // 主题
const LanguageContext = createContext();  // 语言

// 不好的实践：单一巨大Context
const AppContext = createContext(); // 包含auth, user, theme, language等所有状态
```

### 3. 使用组合Hook简化访问

```jsx
// 创建领域特定的聚合Hook
function useUserExperience() {
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  return {
    user,
    theme,
    language,
    // 派生属性
    displayName: user?.name || 'Guest',
    isLightTheme: theme === 'light',
    languageCode: language.split('-')[0]
  };
}

// 使用
function ProfilePage() {
  const { displayName, isLightTheme, languageCode } = useUserExperience();
  // ...
}
```

### 4. 错误边界保护

```jsx
function ProtectedProviders({ children }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <ErrorBoundary fallback={<UIErrorFallback />}>
          <UIProviders>
            <ErrorBoundary fallback={<DataErrorFallback />}>
              <DataProviders>
                {children}
              </DataProviders>
            </ErrorBoundary>
          </UIProviders>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 5. 性能优化

```jsx
// 使用memo优化Provider组件
const OptimizedProvider = React.memo(function OptimizedProvider({ children }) {
  const [state, setState] = useState(initialState);
  const value = useMemo(() => ({ state, setState }), [state]);
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
});

// 分离不常变化的值
function SplitProvider({ children }) {
  const [dynamicState, setDynamicState] = useState({});
  const staticValue = useMemo(() => ({ /* 静态配置 */ }), []);
  
  return (
    <StaticContext.Provider value={staticValue}>
      <DynamicContext.Provider value={dynamicState}>
        {children}
      </DynamicContext.Provider>
    </StaticContext.Provider>
  );
}
```

## 组合模式对比

### composeProviders vs 手动嵌套

```jsx
// composeProviders - 推荐
const AppProviders = composeProviders(
  AuthProvider,
  ThemeProvider,
  LanguageProvider,
  NotificationProvider
);

function App() {
  return (
    <AppProviders>
      <MainApp />
    </AppProviders>
  );
}

// 手动嵌套 - 不推荐（但有时必要）
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <MainApp />
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### 依赖注入 vs 直接依赖

```jsx
// 依赖注入 - 更灵活
function DataProvider({ children, apiService }) {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    apiService.fetchData().then(setData);
  }, [apiService]);
  
  // ...
}

// 直接依赖 - 更简单但耦合
function DataProvider({ children }) {
  const { api } = useContext(ServicesContext);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    api.fetchData().then(setData);
  }, [api]);
  
  // ...
}
```

## 总结

多个Context组合的关键要点：

1. **使用组合函数**：避免Provider嵌套地狱
2. **明确依赖关系**：确保Provider顺序正确
3. **合理拆分粒度**：按功能域划分Context
4. **提供聚合Hook**：简化Context访问
5. **分层架构**：核心层、UI层、数据层分离
6. **错误边界保护**：防止单个Provider崩溃影响全局
7. **性能优化**：使用memo、分离静态/动态值
8. **依赖注入**：提高可测试性和灵活性

合理的Context组合架构可以让大型应用的状态管理既清晰又高效。

