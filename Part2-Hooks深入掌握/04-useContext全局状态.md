# useContext全局状态

## 学习目标

通过本章学习,你将全面掌握:

- Context API的核心概念与应用场景
- createContext创建Context的最佳实践
- useContext消费Context的正确方式
- Provider组件的优化技巧
- 多个Context的组织与管理
- Context性能优化策略
- Context与其他Hooks的配合使用
- React 19中Context的增强特性
- TypeScript中的Context类型定义
- 复杂全局状态管理模式

## 第一部分:Context核心概念

### 1.1 为什么需要Context

```jsx
// 问题演示:Props Drilling (属性钻取)
function App() {
  const user = {
    id: 1,
    name: 'Alice',
    avatar: '/avatar.jpg',
    role: 'admin'
  };
  
  const theme = 'dark';
  const language = 'zh-CN';
  
  // 需要将这些数据传递到深层组件
  return <Layout user={user} theme={theme} language={language} />;
}

function Layout({ user, theme, language }) {
  // 中间组件不需要这些数据,只是传递
  return (
    <div>
      <Sidebar user={user} theme={theme} language={language} />
      <Main user={user} theme={theme} language={language} />
    </div>
  );
}

function Sidebar({ user, theme, language }) {
  // 继续传递
  return (
    <nav>
      <UserMenu user={user} theme={theme} language={language} />
    </nav>
  );
}

function UserMenu({ user, theme, language }) {
  // 终于可以使用了
  return (
    <div className={`menu-${theme}`}>
      <img src={user.avatar} alt={user.name} />
      <span>{language === 'zh-CN' ? user.name : user.name}</span>
    </div>
  );
}

// Props Drilling的问题:
// 1. 代码冗余:中间组件需要接收并传递不需要的props
// 2. 维护困难:添加新数据时,需要修改所有中间组件
// 3. 重构风险:改变组件层级时,需要调整所有props传递
// 4. 类型复杂:TypeScript中需要在每层定义props类型
```

```jsx
import { createContext, useContext, useState } from 'react';

// 解决方案:使用Context
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const LanguageContext = createContext('en');

function AppWithContext() {
  const [user] = useState({
    id: 1,
    name: 'Alice',
    avatar: '/avatar.jpg',
    role: 'admin'
  });
  const [theme] = useState('dark');
  const [language] = useState('zh-CN');
  
  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <LanguageContext.Provider value={language}>
          <Layout />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

function Layout() {
  // 中间组件不需要传递任何props
  return (
    <div>
      <Sidebar />
      <Main />
    </div>
  );
}

function Sidebar() {
  return (
    <nav>
      <UserMenu />
    </nav>
  );
}

function UserMenu() {
  // 直接从Context获取数据
  const user = useContext(UserContext);
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);
  
  return (
    <div className={`menu-${theme}`}>
      <img src={user.avatar} alt={user.name} />
      <span>{language === 'zh-CN' ? user.name : user.name}</span>
    </div>
  );
}
```

### 1.2 Context的工作原理

```jsx
// Context的三个核心部分
import { createContext, useContext, useState } from 'react';

// 1. 创建Context对象
const MyContext = createContext(defaultValue);
// Context对象包含:
// - Provider: 提供数据的组件
// - Consumer: 消费数据的组件(已被useContext替代)
// - displayName: 调试用的名称

// 2. Provider提供数据
function Provider({ children }) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// 3. Consumer消费数据
function Consumer() {
  // 使用useContext Hook
  const value = useContext(MyContext);
  
  // 或使用Context.Consumer (旧方式,不推荐)
  return (
    <MyContext.Consumer>
      {value => <div>{value}</div>}
    </MyContext.Consumer>
  );
}

// Context的数据流
/*
Provider (提供数据)
    ↓
  Context
    ↓
Consumer (消费数据,使用useContext)

数据流是单向的:从Provider流向所有Consumer
当Provider的value变化时,所有Consumer组件都会重新渲染
*/
```

### 1.3 createContext详解

```jsx
import { createContext } from 'react';

// 基本创建
const SimpleContext = createContext();
// 默认值: undefined
// 当组件不在Provider内使用时,使用undefined

// 带默认值
const ConfigContext = createContext({
  apiUrl: '/api',
  timeout: 5000,
  retries: 3
});
// 默认值: { apiUrl: '/api', timeout: 5000, retries: 3 }
// 当组件不在Provider内使用时,使用这个默认配置

// 带类型的Context (TypeScript)
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
// 默认值: null
// 强制要求使用Provider,否则会抛出错误

// 设置displayName (调试用)
const UserContext = createContext(null);
UserContext.displayName = 'UserContext';
// 在React DevTools中显示为 <UserContext.Provider>

// Context命名规范
const AuthContext = createContext(null);      // 认证相关
const ThemeContext = createContext('light');  // 主题相关
const LanguageContext = createContext('en');  // 语言相关
const ToastContext = createContext(null);     // 通知相关
const ModalContext = createContext(null);     // 模态框相关
```

## 第二部分:Provider深度应用

### 2.1 Provider的value优化

```jsx
function ProviderValueOptimization() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  // ❌ 问题1:每次渲染创建新对象
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {/* value每次都是新对象,所有Consumer都会重新渲染 */}
      <App />
    </UserContext.Provider>
  );
  
  // ❌ 问题2:内联对象包含函数
  return (
    <UserContext.Provider value={{
      user,
      login: (data) => setUser(data),  // 每次渲染创建新函数
      logout: () => setUser(null)
    }}>
      <App />
    </UserContext.Provider>
  );
  
  // ✅ 解决:使用useMemo缓存value
  const contextValue = useMemo(() => ({
    user,
    setUser
  }), [user]);  // 只在user变化时创建新对象
  
  return (
    <UserContext.Provider value={contextValue}>
      <App />
    </UserContext.Provider>
  );
  
  // ✅ 解决:将函数分离出来
  const login = useCallback((data) => {
    setUser(data);
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
  }, []);
  
  const contextValue = useMemo(() => ({
    user,
    login,
    logout
  }), [user, login, logout]);
  
  return (
    <UserContext.Provider value={contextValue}>
      <App />
    </UserContext.Provider>
  );
}

// 完整的优化示例
function OptimizedProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // 使用useCallback稳定函数引用
  const login = useCallback(async (credentials) => {
    const userData = await api.login(credentials);
    setUser(userData);
  }, []);
  
  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);
  
  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);
  
  // 使用useMemo缓存Context值
  const value = useMemo(() => ({
    user,
    login,
    logout,
    updateUser
  }), [user, login, logout, updateUser]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

### 2.2 嵌套Provider的组织

```jsx
// 方式1:直接嵌套
function DirectNesting({ children }) {
  return (
    <ThemeContext.Provider value={themeValue}>
      <LanguageContext.Provider value={languageValue}>
        <UserContext.Provider value={userValue}>
          <NotificationContext.Provider value={notificationValue}>
            {children}
          </NotificationContext.Provider>
        </UserContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

// 方式2:组合Providers
function ComposeProviders({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// 方式3:使用辅助函数
function composeProviders(...providers) {
  return ({ children }) => {
    return providers.reduceRight((child, Provider) => {
      return <Provider>{child}</Provider>;
    }, children);
  };
}

const AllProviders = composeProviders(
  ThemeProvider,
  LanguageProvider,
  UserProvider,
  NotificationProvider
);

function App() {
  return (
    <AllProviders>
      <Main />
    </AllProviders>
  );
}

// 方式4:创建单一Provider组件
function AppProvider({ children }) {
  const theme = useThemeState();
  const language = useLanguageState();
  const user = useUserState();
  const notification = useNotificationState();
  
  return (
    <ThemeContext.Provider value={theme}>
      <LanguageContext.Provider value={language}>
        <UserContext.Provider value={user}>
          <NotificationContext.Provider value={notification}>
            {children}
          </NotificationContext.Provider>
        </UserContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
```

### 2.3 Provider的条件渲染

```jsx
function ConditionalProvider({ isEnabled, children }) {
  const [value, setValue] = useState('default');
  
  // 根据条件决定是否提供Context
  if (!isEnabled) {
    return children;  // 不提供Context,使用默认值
  }
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

// 多级Provider
function MultiLevelProvider({ level, children }) {
  const [value, setValue] = useState(`Level ${level}`);
  
  return (
    <LevelContext.Provider value={{ level, value, setValue }}>
      {children}
    </LevelContext.Provider>
  );
}

// 使用
function NestedLevels() {
  return (
    <MultiLevelProvider level={1}>
      <Component />  {/* level=1 */}
      
      <MultiLevelProvider level={2}>
        <Component />  {/* level=2,覆盖外层 */}
        
        <MultiLevelProvider level={3}>
          <Component />  {/* level=3,覆盖外层 */}
        </MultiLevelProvider>
      </MultiLevelProvider>
    </MultiLevelProvider>
  );
}

function Component() {
  const { level, value } = useContext(LevelContext);
  return <div>Level {level}: {value}</div>;
}
```

## 第三部分:useContext最佳实践

### 3.1 创建自定义Hook

```jsx
import { createContext, useContext, useState, useMemo } from 'react';

// 创建Context
const UserContext = createContext(null);

// 创建Provider
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 创建自定义Hook
export function useUser() {
  const context = useContext(UserContext);
  
  // 错误检查:确保在Provider内使用
  if (context === null) {
    throw new Error('useUser必须在UserProvider内使用');
  }
  
  return context;
}

// 使用
function UserProfile() {
  const { user, setUser } = useUser();  // 类型安全,有错误检查
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <button onClick={() => setUser(null)}>退出</button>
    </div>
  );
}
```

### 3.2 Context的拆分策略

```jsx
// ❌ 不好:一个大Context包含所有状态
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  
  const value = {
    user, setUser,
    theme, setTheme,
    language, setLanguage,
    notifications, setNotifications,
    settings, setSettings
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
  
  // 问题:任何状态变化都会导致所有Consumer重新渲染
}

// ✅ 好:按职责拆分Context
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const LanguageContext = createContext('en');
const NotificationContext = createContext([]);
const SettingsContext = createContext({});

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    theme,
    setTheme
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 组件只订阅需要的Context
function ThemedButton() {
  const { theme } = useContext(ThemeContext);  // 只订阅theme,不受user变化影响
  return <button className={`btn-${theme}`}>按钮</button>;
}

function UserAvatar() {
  const { user } = useContext(UserContext);  // 只订阅user,不受theme变化影响
  return <img src={user?.avatar} alt={user?.name} />;
}
```

### 3.3 Context值的设计

```jsx
// 设计1:只包含state
const DataContext = createContext([]);

function DataProvider({ children }) {
  const [data, setData] = useState([]);
  
  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
}

// 使用
function Consumer() {
  const data = useContext(DataContext);
  // 问题:无法直接修改data,需要通过props传递setData
  return <div>{data.length}</div>;
}

// 设计2:包含state和setter (推荐)
const DataContext = createContext(null);

function DataProvider({ children }) {
  const [data, setData] = useState([]);
  
  const value = useMemo(() => ({
    data,
    setData
  }), [data]);
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// 使用
function Consumer() {
  const { data, setData } = useContext(DataContext);
  // 可以直接修改数据
  
  const addItem = () => {
    setData([...data, newItem]);
  };
  
  return (
    <div>
      <div>{data.length}</div>
      <button onClick={addItem}>添加</button>
    </div>
  );
}

// 设计3:包含state、actions和computed values
const TodoContext = createContext(null);

function TodoProvider({ children }) {
  const [todos, setTodos] = useState([]);
  
  // Actions
  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, {
      id: Date.now(),
      text,
      completed: false
    }]);
  }, []);
  
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  // Computed values
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  }), [todos]);
  
  const value = useMemo(() => ({
    todos,
    stats,
    addTodo,
    toggleTodo,
    deleteTodo
  }), [todos, stats, addTodo, toggleTodo, deleteTodo]);
  
  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos必须在TodoProvider内使用');
  }
  return context;
}
```

## 第四部分:性能优化深入

### 4.1 避免不必要的重新渲染

```jsx
// 问题:Context值变化导致所有Consumer重新渲染
const AppContext = createContext();

function AppProvider({ children }) {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  const value = useMemo(() => ({
    count,
    setCount,
    text,
    setText
  }), [count, text]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

function CountDisplay() {
  const { count } = useContext(AppContext);
  console.log('CountDisplay渲染');  // text变化时也会重新渲染
  return <div>{count}</div>;
}

function TextDisplay() {
  const { text } = useContext(AppContext);
  console.log('TextDisplay渲染');  // count变化时也会重新渲染
  return <div>{text}</div>;
}

// 解决方案1:拆分Context
const CountContext = createContext(0);
const TextContext = createContext('');

function SplitProvider({ children }) {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  const countValue = useMemo(() => ({
    count,
    setCount
  }), [count]);
  
  const textValue = useMemo(() => ({
    text,
    setText
  }), [text]);
  
  return (
    <CountContext.Provider value={countValue}>
      <TextContext.Provider value={textValue}>
        {children}
      </TextContext.Provider>
    </CountContext.Provider>
  );
}

function CountDisplay() {
  const { count } = useContext(CountContext);
  console.log('CountDisplay渲染');  // 只在count变化时渲染
  return <div>{count}</div>;
}

function TextDisplay() {
  const { text } = useContext(TextContext);
  console.log('TextDisplay渲染');  // 只在text变化时渲染
  return <div>{text}</div>;
}

// 解决方案2:使用React.memo
const MemoizedCountDisplay = React.memo(function CountDisplay() {
  const { count } = useContext(AppContext);
  console.log('CountDisplay渲染');
  return <div>{count}</div>;
});

// 解决方案3:选择性订阅
function useContextSelector(Context, selector) {
  const value = useContext(Context);
  return useMemo(() => selector(value), [value, selector]);
}

function CountDisplay() {
  const count = useContextSelector(AppContext, ctx => ctx.count);
  console.log('CountDisplay渲染');  // 只在count变化时渲染
  return <div>{count}</div>;
}
```

### 4.2 Context分层架构

```jsx
// 分层策略:按更新频率分层
// 层1:很少变化的配置(最外层)
const ConfigContext = createContext({
  apiUrl: '/api',
  timeout: 5000
});

function ConfigProvider({ children }) {
  const config = useMemo(() => ({
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    timeout: 5000,
    retries: 3
  }), []);  // 空依赖,config永不变化
  
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

// 层2:偶尔变化的用户信息
const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);  // 登录/退出时变化
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 层3:频繁变化的UI状态
const UIContext = createContext({});

function UIProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const value = useMemo(() => ({
    theme,
    setTheme,
    sidebarOpen,
    setSidebarOpen,
    modalOpen,
    setModalOpen
  }), [theme, sidebarOpen, modalOpen]);  // 频繁变化
  
  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// 组合使用
function App() {
  return (
    <ConfigProvider>
      <UserProvider>
        <UIProvider>
          <Main />
        </UIProvider>
      </UserProvider>
    </ConfigProvider>
  );
}
```

### 4.3 Context的批量更新

```jsx
import { useReducer } from 'react';

// 使用useReducer管理Context状态
const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'BATCH_UPDATE':
      // 批量更新多个状态
      return { ...state, ...action.payload };
    
    case 'RESET':
      return action.payload;
    
    default:
      return state;
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    language: 'en'
  });
  
  const value = useMemo(() => ({
    ...state,
    dispatch
  }), [state]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp必须在AppProvider内使用');
  }
  return context;
}

// 使用
function Settings() {
  const { theme, language, dispatch } = useApp();
  
  // 批量更新
  const applyPreset = (preset) => {
    dispatch({
      type: 'BATCH_UPDATE',
      payload: {
        theme: preset.theme,
        language: preset.language
      }
    });
  };
  
  return (
    <div>
      <button onClick={() => applyPreset({ theme: 'dark', language: 'zh-CN' })}>
        中文深色模式
      </button>
    </div>
  );
}
```

## 第五部分:实战案例

### 5.1 完整的主题系统

```jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// 主题定义
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff',
      text: '#212529',
      border: '#dee2e6'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    },
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      background: '#212529',
      text: '#f8f9fa',
      border: '#495057'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    },
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px'
    }
  }
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children, initialTheme = 'light' }) {
  const [themeName, setThemeName] = useState(() => {
    // 从localStorage读取保存的主题
    const saved = localStorage.getItem('theme');
    return saved || initialTheme;
  });
  
  // 当前主题对象
  const theme = themes[themeName];
  
  // 切换主题
  const toggleTheme = useCallback(() => {
    setThemeName(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  // 设置特定主题
  const setTheme = useCallback((name) => {
    if (themes[name]) {
      setThemeName(name);
    }
  }, []);
  
  // 同步到localStorage
  useEffect(() => {
    localStorage.setItem('theme', themeName);
  }, [themeName]);
  
  // 应用到document.body
  useEffect(() => {
    document.body.className = `theme-${themeName}`;
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    
    return () => {
      document.body.className = '';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [themeName, theme]);
  
  const value = useMemo(() => ({
    theme,
    themeName,
    toggleTheme,
    setTheme
  }), [theme, themeName, toggleTheme, setTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内使用');
  }
  return context;
}

// 使用示例
function App() {
  return (
    <ThemeProvider initialTheme="dark">
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, themeName, toggleTheme } = useTheme();
  
  return (
    <header style={{
      background: theme.colors.primary,
      padding: theme.spacing.medium,
      color: theme.colors.text
    }}>
      <h1 style={{ fontSize: theme.fontSize.large }}>我的应用</h1>
      <button onClick={toggleTheme}>
        切换到{themeName === 'light' ? '深色' : '浅色'}模式
      </button>
    </header>
  );
}

function Card({ children }) {
  const { theme } = useTheme();
  
  return (
    <div style={{
      background: theme.colors.background,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      color: theme.colors.text
    }}>
      {children}
    </div>
  );
}
```

### 5.2 认证系统

```jsx
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('认证检查失败:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // 登录
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('登录失败');
      }
      
      const { user, token } = await response.json();
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 退出
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
    } catch (err) {
      console.error('退出失败:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);
  
  // 更新用户信息
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);
  
  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  }), [user, loading, error, login, logout, updateUser]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
}

// 使用示例
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function LoginPage() {
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={credentials.username}
        onChange={e => setCredentials({ ...credentials, username: e.target.value })}
        placeholder="用户名"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="密码"
      />
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function UserMenu() {
  const { user, logout } = useAuth();
  
  return (
    <div className="user-menu">
      <img src={user.avatar} alt={user.name} />
      <span>{user.name}</span>
      <button onClick={logout}>退出</button>
    </div>
  );
}
```

### 5.3 通知系统

```jsx
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationContext = createContext(null);

let notificationId = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  // 添加通知
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++notificationId;
    
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);
  
  // 移除通知
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // 清空所有通知
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // 便捷方法
  const success = useCallback((message, duration) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);
  
  const error = useCallback((message, duration) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);
  
  const warning = useCallback((message, duration) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);
  
  const info = useCallback((message, duration) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);
  
  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }), [notifications, addNotification, removeNotification, clearAll, success, error, warning, info]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification必须在NotificationProvider内使用');
  }
  return context;
}

// 通知容器
function NotificationContainer() {
  const { notifications } = useNotification();
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function NotificationItem({ notification }) {
  const { removeNotification } = useNotification();
  
  return (
    <div className={`notification notification-${notification.type}`}>
      <span>{notification.message}</span>
      <button onClick={() => removeNotification(notification.id)}>
        关闭
      </button>
    </div>
  );
}

// 使用示例
function FormSubmit() {
  const { success, error } = useNotification();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await submitForm();
      success('提交成功!');
    } catch (err) {
      error('提交失败: ' + err.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">提交</button>
    </form>
  );
}
```

### 5.4 购物车系统

```jsx
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // 从localStorage初始化
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // 同步到localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  // 添加商品
  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        // 更新数量
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // 添加新商品
        return [...prev, { ...product, quantity }];
      }
    });
  }, []);
  
  // 移除商品
  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);
  
  // 更新数量
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev => prev.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    ));
  }, [removeItem]);
  
  // 清空购物车
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);
  
  // 计算统计信息
  const stats = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    return {
      totalItems,
      totalPrice,
      itemCount: items.length
    };
  }, [items]);
  
  const value = useMemo(() => ({
    items,
    stats,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }), [items, stats, addItem, removeItem, updateQuantity, clearCart]);
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart必须在CartProvider内使用');
  }
  return context;
}

// 使用示例
function ProductCard({ product }) {
  const { addItem } = useCart();
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{product.price}元</p>
      <button onClick={() => addItem(product)}>
        加入购物车
      </button>
    </div>
  );
}

function CartSummary() {
  const { items, stats, updateQuantity, removeItem, clearCart } = useCart();
  
  return (
    <div className="cart-summary">
      <h2>购物车</h2>
      
      {items.length === 0 ? (
        <p>购物车为空</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map(item => (
              <li key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="price">{item.price}元</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <button onClick={() => removeItem(item.id)}>删除</button>
              </li>
            ))}
          </ul>
          
          <div className="cart-stats">
            <p>商品种类: {stats.itemCount}</p>
            <p>商品总数: {stats.totalItems}</p>
            <p className="total-price">总价: {stats.totalPrice}元</p>
          </div>
          
          <div className="cart-actions">
            <button onClick={clearCart}>清空购物车</button>
            <button className="checkout">去结算</button>
          </div>
        </>
      )}
    </div>
  );
}

function CartBadge() {
  const { stats } = useCart();
  
  return (
    <div className="cart-badge">
      购物车 ({stats.totalItems})
    </div>
  );
}
```

## 第六部分:Context高级模式

### 6.1 Context组合模式

```jsx
// 创建多个相关的Context
const UserContext = createContext(null);
const UserDispatchContext = createContext(null);

// 拆分state和dispatch到不同Context
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // state context值(频繁变化)
  const userValue = useMemo(() => user, [user]);
  
  // dispatch context值(永不变化)
  const dispatchValue = useMemo(() => ({
    setUser,
    login: async (credentials) => {
      const userData = await api.login(credentials);
      setUser(userData);
    },
    logout: () => setUser(null)
  }), []);  // 空依赖,永不变化
  
  return (
    <UserContext.Provider value={userValue}>
      <UserDispatchContext.Provider value={dispatchValue}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

// 只读取user的组件
function UserDisplay() {
  const user = useContext(UserContext);
  console.log('UserDisplay渲染');  // 只在user变化时渲染
  return <div>{user?.name}</div>;
}

// 只修改user的组件
function LoginButton() {
  const { login, logout } = useContext(UserDispatchContext);
  console.log('LoginButton渲染');  // dispatch永不变化,不会重新渲染
  
  return (
    <button onClick={() => login({ username: 'alice' })}>
      登录
    </button>
  );
}
```

### 6.2 Context选择器模式

```jsx
// 实现选择器模式
function createContextWithSelector(initialValue) {
  const Context = createContext(initialValue);
  
  function Provider({ value, children }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }
  
  function useContextSelector(selector) {
    const value = useContext(Context);
    const selectedValue = selector(value);
    const selectedRef = useRef(selectedValue);
    
    // 只在选择的值变化时更新
    useEffect(() => {
      selectedRef.current = selectedValue;
    });
    
    return selectedRef.current;
  }
  
  return { Provider, useContextSelector };
}

// 使用
const { Provider: AppProvider, useContextSelector: useAppSelector } = 
  createContextWithSelector(null);

function App() {
  const [state, setState] = useState({
    user: { name: 'Alice', age: 30 },
    theme: 'light',
    count: 0
  });
  
  return (
    <AppProvider value={state}>
      <UserName />
      <UserAge />
      <ThemeDisplay />
      <Counter />
    </AppProvider>
  );
}

function UserName() {
  const name = useAppSelector(state => state.user.name);
  console.log('UserName渲染');  // 只在name变化时渲染
  return <div>{name}</div>;
}

function UserAge() {
  const age = useAppSelector(state => state.user.age);
  console.log('UserAge渲染');  // 只在age变化时渲染
  return <div>{age}</div>;
}

function ThemeDisplay() {
  const theme = useAppSelector(state => state.theme);
  console.log('ThemeDisplay渲染');  // 只在theme变化时渲染
  return <div>{theme}</div>;
}
```

### 6.3 Context与Reducer结合

```jsx
import { createContext, useContext, useReducer, useMemo } from 'react';

// 定义state和actions
const initialState = {
  user: null,
  theme: 'light',
  language: 'en',
  notifications: []
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    
    case 'LOGOUT':
      return { ...state, user: null };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };
    
    default:
      throw new Error(`未知的action类型: ${action.type}`);
  }
}

// 创建Context
const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // state和dispatch分开,dispatch永不变化
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// 创建自定义Hooks
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState必须在AppProvider内使用');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch必须在AppProvider内使用');
  }
  return context;
}

// 创建actions
export function useAppActions() {
  const dispatch = useAppDispatch();
  
  return useMemo(() => ({
    login: (user) => dispatch({ type: 'LOGIN', payload: user }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    setLanguage: (lang) => dispatch({ type: 'SET_LANGUAGE', payload: lang }),
    addNotification: (notification) => dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    }),
    removeNotification: (id) => dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    })
  }), [dispatch]);
}

// 使用示例
function LoginButton() {
  const { user } = useAppState();
  const { login, logout } = useAppActions();
  
  if (user) {
    return (
      <button onClick={logout}>
        退出 ({user.name})
      </button>
    );
  }
  
  return (
    <button onClick={() => login({ id: 1, name: 'Alice' })}>
      登录
    </button>
  );
}

function ThemeToggle() {
  const { theme } = useAppState();
  const { setTheme } = useAppActions();
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换主题: {theme}
    </button>
  );
}
```

## 第七部分:TypeScript支持

### 7.1 Context的类型定义

```typescript
import { createContext, useContext, ReactNode } from 'react';

// 定义Context值的类型
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface UserContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

// 创建带类型的Context
const UserContext = createContext<UserContextType | null>(null);

// Provider组件
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const userData = await api.login(credentials);
    setUser(userData);
  }, []);
  
  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);
  
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);
  
  const value = useMemo<UserContextType>(() => ({
    user,
    login,
    logout,
    updateUser
  }), [user, login, logout, updateUser]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 自定义Hook
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser必须在UserProvider内使用');
  }
  
  return context;
}

// 使用
function UserProfile() {
  const { user, logout } = useUser();  // 完全类型安全
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <button onClick={logout}>退出</button>
    </div>
  );
}
```

### 7.2 泛型Context

```typescript
// 创建泛型Context工具函数
function createTypedContext<T>() {
  const Context = createContext<T | null>(null);
  
  function Provider({ value, children }: { value: T; children: ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }
  
  function useTypedContext(): T {
    const context = useContext(Context);
    if (!context) {
      throw new Error('必须在Provider内使用');
    }
    return context;
  }
  
  return { Provider, useContext: useTypedContext };
}

// 使用泛型Context
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

const { Provider: ThemeProvider, useContext: useTheme } = createTypedContext<Theme>();

// 使用
function App() {
  const theme: Theme = {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      background: '#ffffff'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    }
  };
  
  return (
    <ThemeProvider value={theme}>
      <Main />
    </ThemeProvider>
  );
}

function Main() {
  const theme = useTheme();  // 完全类型推断
  
  return (
    <div style={{
      background: theme.colors.background,
      padding: theme.spacing.medium
    }}>
      主内容
    </div>
  );
}
```

### 7.3 高级类型模式

```typescript
// 带默认值的Context
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

const defaultConfig: Config = {
  apiUrl: '/api',
  timeout: 5000,
  retries: 3
};

const ConfigContext = createContext<Config>(defaultConfig);

// 可选Context
interface OptionalUserContextType {
  user?: User;
  setUser?: (user: User | null) => void;
}

const OptionalUserContext = createContext<OptionalUserContextType>({});

export function useOptionalUser() {
  return useContext(OptionalUserContext);
}

// 使用
function Component() {
  const { user, setUser } = useOptionalUser();
  
  // user和setUser都是可选的,需要检查
  if (user && setUser) {
    return <button onClick={() => setUser(null)}>退出</button>;
  }
  
  return <div>未登录</div>;
}
```

## 第八部分:React 19增强特性

### 8.1 use() Hook消费Context

```jsx
import { use } from 'react';

// 传统方式
function TraditionalWay() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  
  return <div className={theme}>{user?.name}</div>;
}

// React 19新方式:使用use()
function NewWay() {
  const theme = use(ThemeContext);
  const user = use(UserContext);
  
  return <div className={theme}>{user?.name}</div>;
}

// use()的优势:可以在条件语句中使用
function ConditionalContextConsumption({ useTheme }) {
  let theme;
  
  // ❌ useContext不能在条件语句中使用
  // if (useTheme) {
  //   theme = useContext(ThemeContext);  // 违反Hooks规则
  // }
  
  // ✅ use()可以在条件语句中使用
  if (useTheme) {
    theme = use(ThemeContext);
  } else {
    theme = 'default';
  }
  
  return <div className={theme}>内容</div>;
}

// use()在循环中使用
function MultiContextConsumption({ contexts }) {
  const values = contexts.map(context => use(context));
  
  return (
    <div>
      {values.map((value, index) => (
        <div key={index}>{JSON.stringify(value)}</div>
      ))}
    </div>
  );
}
```

### 8.2 Context与Server Components

```jsx
// Server Component中的Context
'use server';

import { createContext } from 'react';

// Server Context
export const ServerDataContext = createContext(null);

export async function ServerDataProvider({ children }) {
  // 在服务器端获取数据
  const data = await fetchDataOnServer();
  
  return (
    <ServerDataContext.Provider value={data}>
      {children}
    </ServerDataContext.Provider>
  );
}

// Client Component消费Context
'use client';

import { use } from 'react';
import { ServerDataContext } from './ServerDataProvider';

export function ClientComponent() {
  const data = use(ServerDataContext);
  
  return <div>{data?.title}</div>;
}
```

### 8.3 Context与Suspense集成

```jsx
import { Suspense, use } from 'react';

// 创建资源Context
const DataContext = createContext(null);

// 创建可挂起的资源
function createResource(promise) {
  let status = 'pending';
  let result;
  
  const suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );
  
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      }
      if (status === 'error') {
        throw result;
      }
      return result;
    }
  };
}

function DataProvider({ children }) {
  const resource = useMemo(() => 
    createResource(fetch('/api/data').then(r => r.json())),
    []
  );
  
  return (
    <DataContext.Provider value={resource}>
      {children}
    </DataContext.Provider>
  );
}

function DataDisplay() {
  const resource = useContext(DataContext);
  const data = resource.read();  // 可能抛出Promise(Suspense捕获)
  
  return <div>{data.title}</div>;
}

// 使用
function App() {
  return (
    <DataProvider>
      <Suspense fallback={<div>加载中...</div>}>
        <DataDisplay />
      </Suspense>
    </DataProvider>
  );
}
```

## 第九部分:复杂状态管理

### 9.1 多层级Context架构

```jsx
// 应用级Context
const AppContext = createContext(null);

function AppProvider({ children }) {
  const [globalState, setGlobalState] = useState({
    version: '1.0.0',
    env: 'production'
  });
  
  return (
    <AppContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </AppContext.Provider>
  );
}

// 功能级Context
const FeatureContext = createContext(null);

function FeatureProvider({ children }) {
  const [featureState, setFeatureState] = useState({
    enabled: true,
    config: {}
  });
  
  return (
    <FeatureContext.Provider value={{ featureState, setFeatureState }}>
      {children}
    </FeatureContext.Provider>
  );
}

// 页面级Context
const PageContext = createContext(null);

function PageProvider({ children }) {
  const [pageState, setPageState] = useState({
    title: '',
    breadcrumb: []
  });
  
  return (
    <PageContext.Provider value={{ pageState, setPageState }}>
      {children}
    </PageContext.Provider>
  );
}

// 组合使用
function App() {
  return (
    <AppProvider>
      <FeatureProvider>
        <PageProvider>
          <Main />
        </PageProvider>
      </FeatureProvider>
    </AppProvider>
  );
}

function Main() {
  const { globalState } = useContext(AppContext);
  const { featureState } = useContext(FeatureContext);
  const { pageState } = useContext(PageContext);
  
  return (
    <div>
      <div>版本: {globalState.version}</div>
      <div>功能: {featureState.enabled ? '启用' : '禁用'}</div>
      <div>页面: {pageState.title}</div>
    </div>
  );
}
```

### 9.2 Context持久化

```jsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

function createPersistedContext(key, defaultValue) {
  const Context = createContext(defaultValue);
  
  function Provider({ children }) {
    const [value, setValue] = useState(() => {
      try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
      } catch (error) {
        console.error(`读取localStorage失败(${key}):`, error);
        return defaultValue;
      }
    });
    
    // 同步到localStorage
    useEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`写入localStorage失败(${key}):`, error);
      }
    }, [value]);
    
    // 监听其他标签页的变化
    useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === key && e.newValue) {
          try {
            setValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error(`解析localStorage变化失败(${key}):`, error);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);
    
    const contextValue = useMemo(() => ({
      value,
      setValue
    }), [value]);
    
    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  }
  
  function usePersistedContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('必须在Provider内使用');
    }
    return context;
  }
  
  return { Provider, useContext: usePersistedContext };
}

// 使用
const { Provider: PreferencesProvider, useContext: usePreferences } = 
  createPersistedContext('preferences', {
    theme: 'light',
    language: 'en',
    fontSize: 14
  });

function App() {
  return (
    <PreferencesProvider>
      <Settings />
      <Main />
    </PreferencesProvider>
  );
}

function Settings() {
  const { value: preferences, setValue: setPreferences } = usePreferences();
  
  return (
    <div>
      <select
        value={preferences.theme}
        onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
      >
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
      
      <select
        value={preferences.language}
        onChange={e => setPreferences({ ...preferences, language: e.target.value })}
      >
        <option value="en">English</option>
        <option value="zh-CN">中文</option>
      </select>
    </div>
  );
}
```

### 9.3 Context中间件模式

```jsx
// Context中间件
function createContextWithMiddleware(reducer, initialState, middlewares = []) {
  const Context = createContext(null);
  
  function Provider({ children }) {
    const [state, baseDispatch] = useReducer(reducer, initialState);
    
    // 应用中间件
    const dispatch = useMemo(() => {
      return middlewares.reduceRight(
        (next, middleware) => middleware(next, state),
        baseDispatch
      );
    }, [state]);
    
    const value = useMemo(() => ({
      state,
      dispatch
    }), [state, dispatch]);
    
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  }
  
  function useTypedContext() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('必须在Provider内使用');
    }
    return context;
  }
  
  return { Provider, useContext: useTypedContext };
}

// 日志中间件
const loggerMiddleware = (next, state) => (action) => {
  console.group('Action:', action.type);
  console.log('当前状态:', state);
  console.log('Action:', action);
  
  const result = next(action);
  
  console.log('新状态:', result);
  console.groupEnd();
  
  return result;
};

// 性能监控中间件
const performanceMiddleware = (next) => (action) => {
  const start = performance.now();
  const result = next(action);
  const end = performance.now();
  
  console.log(`Action ${action.type} 耗时: ${(end - start).toFixed(2)}ms`);
  
  return result;
};

// 使用
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        )
      };
    default:
      return state;
  }
};

const { Provider: TodoProvider, useContext: useTodos } = createContextWithMiddleware(
  todoReducer,
  { todos: [] },
  [loggerMiddleware, performanceMiddleware]
);

function App() {
  return (
    <TodoProvider>
      <TodoList />
    </TodoProvider>
  );
}

function TodoList() {
  const { state, dispatch } = useTodos();
  
  return (
    <div>
      <button onClick={() => dispatch({
        type: 'ADD_TODO',
        payload: { id: Date.now(), text: '新任务', completed: false }
      })}>
        添加任务
      </button>
      
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: todo.id })}
            />
            <span>{todo.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 第十部分:性能优化进阶

### 10.1 Context分片

```jsx
// 将大Context拆分为多个小Context
// 原始大Context
const BigContext = createContext({
  user: null,
  theme: 'light',
  language: 'en',
  notifications: [],
  settings: {}
});

// 拆分后的小Context
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const LanguageContext = createContext('en');
const NotificationsContext = createContext([]);
const SettingsContext = createContext({});

// 统一的Provider
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const languageValue = useMemo(() => ({ language, setLanguage }), [language]);
  const notificationsValue = useMemo(() => ({ notifications, setNotifications }), [notifications]);
  const settingsValue = useMemo(() => ({ settings, setSettings }), [settings]);
  
  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        <LanguageContext.Provider value={languageValue}>
          <NotificationsContext.Provider value={notificationsValue}>
            <SettingsContext.Provider value={settingsValue}>
              {children}
            </SettingsContext.Provider>
          </NotificationsContext.Provider>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 组件只订阅需要的Context
function ThemeButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  console.log('ThemeButton渲染');  // 只在theme变化时渲染
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  );
}

function UserAvatar() {
  const { user } = useContext(UserContext);
  console.log('UserAvatar渲染');  // 只在user变化时渲染
  
  return <img src={user?.avatar} alt={user?.name} />;
}
```

### 10.2 懒加载Provider

```jsx
import { lazy, Suspense } from 'react';

// 懒加载Provider
const LazyProvider = lazy(() => import('./HeavyProvider'));

function App() {
  return (
    <Suspense fallback={<div>加载Provider中...</div>}>
      <LazyProvider>
        <Main />
      </LazyProvider>
    </Suspense>
  );
}

// 条件加载Provider
function ConditionalProviderLoading({ children }) {
  const [shouldLoad, setShouldLoad] = useState(false);
  
  useEffect(() => {
    // 延迟加载,提高初始渲染性能
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!shouldLoad) {
    return children;  // 不提供Context
  }
  
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <LazyProvider>
        {children}
      </LazyProvider>
    </Suspense>
  );
}
```

### 10.3 Context的memo优化

```jsx
// 使用React.memo包裹Context消费者
const UserDisplay = React.memo(function UserDisplay() {
  const { user } = useContext(UserContext);
  console.log('UserDisplay渲染');
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
    </div>
  );
});

// 使用shouldComponentUpdate逻辑
const UserDisplayWithCompare = React.memo(
  function UserDisplay({ extraProp }) {
    const { user } = useContext(UserContext);
    console.log('UserDisplay渲染');
    
    return (
      <div>
        <h2>{user?.name}</h2>
        <p>{extraProp}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 返回true表示不重新渲染
    return prevProps.extraProp === nextProps.extraProp;
  }
);

// 嵌套memo
function OptimizedTree() {
  return (
    <UserContext.Provider value={user}>
      <MemoizedParent>
        <MemoizedChild>
          <MemoizedGrandchild />
        </MemoizedChild>
      </MemoizedParent>
    </UserContext.Provider>
  );
}

const MemoizedParent = React.memo(({ children }) => {
  console.log('Parent渲染');
  return <div className="parent">{children}</div>;
});

const MemoizedChild = React.memo(({ children }) => {
  console.log('Child渲染');
  return <div className="child">{children}</div>;
});

const MemoizedGrandchild = React.memo(() => {
  const { user } = useContext(UserContext);
  console.log('Grandchild渲染');  // 只在user变化时渲染
  return <div>{user?.name}</div>;
});
```

## 第十一部分:调试与监控

### 11.1 Context调试工具

```jsx
// Context调试Hook
function useContextDebugger(Context, name = 'Context') {
  const value = useContext(Context);
  const previousValue = useRef(value);
  const renderCount = useRef(0);
  
  renderCount.current++;
  
  useEffect(() => {
    if (value !== previousValue.current) {
      console.group(`[${name}] 值变化 (渲染 #${renderCount.current})`);
      console.log('之前:', previousValue.current);
      console.log('当前:', value);
      console.log('变化:', {
        changed: value !== previousValue.current,
        type: typeof value
      });
      console.groupEnd();
      
      previousValue.current = value;
    }
  });
  
  return value;
}

// 使用
function Component() {
  const user = useContextDebugger(UserContext, 'UserContext');
  const theme = useContextDebugger(ThemeContext, 'ThemeContext');
  
  return <div className={theme}>{user?.name}</div>;
}
```

### 11.2 Context性能监控

```jsx
function createMonitoredContext(initialValue, name = 'Context') {
  const Context = createContext(initialValue);
  const updateCount = { current: 0 };
  const consumerCount = { current: 0 };
  
  function Provider({ value, children }) {
    updateCount.current++;
    
    console.log(`[${name} Provider] 更新 #${updateCount.current}`, {
      value,
      consumerCount: consumerCount.current
    });
    
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  }
  
  function useMonitoredContext() {
    const value = useContext(Context);
    const renderCount = useRef(0);
    
    useEffect(() => {
      consumerCount.current++;
      
      return () => {
        consumerCount.current--;
      };
    }, []);
    
    renderCount.current++;
    
    console.log(`[${name} Consumer] 渲染 #${renderCount.current}`, {
      value
    });
    
    return value;
  }
  
  return { Provider, useContext: useMonitoredContext };
}

// 使用
const { Provider: UserProvider, useContext: useUser } = 
  createMonitoredContext(null, 'User');

function App() {
  const [user, setUser] = useState(null);
  
  return (
    <UserProvider value={user}>
      <UserDisplay />
      <button onClick={() => setUser({ name: 'Alice' })}>设置用户</button>
    </UserProvider>
  );
}

function UserDisplay() {
  const user = useUser();  // 自动记录渲染和更新
  return <div>{user?.name}</div>;
}
```

## 第十二部分:最佳实践汇总

### 12.1 Context使用检查清单

```jsx
/*
Context使用检查清单:

创建阶段:
- [ ] 是否真的需要Context?(是否存在Props Drilling?)
- [ ] Context的粒度是否合适?(不要创建过大的Context)
- [ ] 是否提供了合理的默认值?
- [ ] 是否设置了displayName?(便于调试)

Provider阶段:
- [ ] value是否使用useMemo缓存?
- [ ] 是否避免了内联对象和函数?
- [ ] 是否将state和dispatch分离?
- [ ] 是否提供了自定义Hook?
- [ ] 是否有错误边界处理?

Consumer阶段:
- [ ] 是否通过自定义Hook使用Context?
- [ ] 是否在Hook中检查Context是否存在?
- [ ] 是否只订阅需要的Context?
- [ ] 是否使用React.memo避免不必要的渲染?
- [ ] 是否考虑了性能影响?

维护阶段:
- [ ] Context的职责是否清晰?
- [ ] 是否有完善的类型定义?
- [ ] 是否有调试和监控?
- [ ] 是否有文档说明用途?
*/

// 完整示例:遵循所有最佳实践
interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
}

const TodoContext = createContext<TodoContextType | null>(null);
TodoContext.displayName = 'TodoContext';

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const addTodo = useCallback((text: string) => {
    setTodos(prev => [...prev, {
      id: Date.now(),
      text,
      completed: false
    }]);
  }, []);
  
  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  const deleteTodo = useCallback((id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  const value = useMemo<TodoContextType>(() => ({
    todos,
    addTodo,
    toggleTodo,
    deleteTodo
  }), [todos, addTodo, toggleTodo, deleteTodo]);
  
  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos(): TodoContextType {
  const context = useContext(TodoContext);
  
  if (!context) {
    throw new Error('useTodos必须在TodoProvider内使用');
  }
  
  return context;
}
```

### 12.2 常见模式总结

```jsx
// 模式1:简单状态共享
const SimpleContext = createContext(null);

function SimpleProvider({ children }) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <SimpleContext.Provider value={{ value, setValue }}>
      {children}
    </SimpleContext.Provider>
  );
}

// 模式2:带actions的状态管理
const StateContext = createContext(null);

function StateProvider({ children }) {
  const [state, setState] = useState(initialState);
  
  const actions = useMemo(() => ({
    update: (updates) => setState(prev => ({ ...prev, ...updates })),
    reset: () => setState(initialState)
  }), []);
  
  const value = useMemo(() => ({
    state,
    actions
  }), [state, actions]);
  
  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
}

// 模式3:Reducer + Context
const ReducerContext = createContext(null);

function ReducerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <ReducerContext.Provider value={{ state, dispatch }}>
      {children}
    </ReducerContext.Provider>
  );
}

// 模式4:分离state和dispatch
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function SplitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 模式5:带中间件的Context
const MiddlewareContext = createContext(null);

function MiddlewareProvider({ children }) {
  const [state, baseDispatch] = useReducer(reducer, initialState);
  
  const dispatch = useCallback((action) => {
    console.log('Action:', action);
    baseDispatch(action);
  }, []);
  
  return (
    <MiddlewareContext.Provider value={{ state, dispatch }}>
      {children}
    </MiddlewareContext.Provider>
  );
}
```

### 12.3 Context与组件解耦

```jsx
// 创建Context模块
// contexts/UserContext.jsx
import { createContext, useContext, useState, useMemo } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser必须在UserProvider内使用');
  }
  return context;
}

// 在组件中使用
// components/UserProfile.jsx
import { useUser } from '../contexts/UserContext';

export function UserProfile() {
  const { user, setUser } = useUser();
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <button onClick={() => setUser(null)}>退出</button>
    </div>
  );
}

// 在App中组合
// App.jsx
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProfile } from './components/UserProfile';

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <UserProfile />
      </ThemeProvider>
    </UserProvider>
  );
}
```

## 练习题

### 基础练习

1. 创建一个简单的Context传递用户信息
2. 实现主题切换功能(light/dark)
3. 使用Context传递配置对象
4. 创建语言切换Context

### 进阶练习

1. 实现完整的认证系统(登录/退出/持久化)
2. 创建通知系统Context
3. 实现购物车Context
4. 优化Context性能(拆分/memo)
5. 使用Reducer管理Context状态

### 高级练习

1. 实现Context选择器模式
2. 创建Context中间件系统
3. 实现Context持久化(localStorage/sessionStorage)
4. 使用TypeScript定义复杂Context类型
5. 实现多层级Context架构
6. 创建Context调试工具

### 实战项目

1. 实现完整的主题系统(多主题/持久化/CSS变量)
2. 创建全局状态管理库(类似Redux)
3. 实现国际化系统(i18n)
4. 创建权限管理系统
5. 实现实时通知系统

通过本章学习,你已经全面掌握了useContext和Context API的使用,从基础概念到高级模式,从性能优化到TypeScript支持,从简单状态共享到复杂状态管理。Context是React中实现跨组件通信的强大工具,掌握它将使你能够构建结构清晰、易于维护的大型应用。
