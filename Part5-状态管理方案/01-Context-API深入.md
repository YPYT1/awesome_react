# Context API深入

## 概述

Context API是React内置的状态管理解决方案，用于解决组件树中的跨层级数据传递问题。在React 19中，Context API得到了进一步优化，性能更强，使用更简便。

## Context的核心概念

### 什么是Context

Context提供了一种在组件树中共享数据的方式，无需通过props层层传递。它解决了"prop drilling"（属性钻取）的问题。

### Context的应用场景

1. 全局状态管理（如用户信息、主题、语言设置）
2. 跨层级组件通信
3. 依赖注入
4. 配置传递

### Context与Props的区别

Props是显式传递，Context是隐式共享：

```jsx
// Props方式 - 需要层层传递
function App() {
  const user = { name: 'Alice', role: 'admin' };
  return <Parent user={user} />;
}

function Parent({ user }) {
  return <Child user={user} />;
}

function Child({ user }) {
  return <GrandChild user={user} />;
}

function GrandChild({ user }) {
  return <div>{user.name}</div>;
}

// Context方式 - 直接获取
const UserContext = createContext();

function App() {
  const user = { name: 'Alice', role: 'admin' };
  return (
    <UserContext.Provider value={user}>
      <Parent />
    </UserContext.Provider>
  );
}

function Parent() {
  return <Child />;
}

function Child() {
  return <GrandChild />;
}

function GrandChild() {
  const user = useContext(UserContext);
  return <div>{user.name}</div>;
}
```

## 创建和使用Context

### 基础用法

#### 1. 创建Context

```jsx
import { createContext } from 'react';

// 创建Context，提供默认值
const ThemeContext = createContext('light');

// 创建多个Context
const UserContext = createContext(null);
const SettingsContext = createContext({
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
});
```

#### 2. 提供Context值

```jsx
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  return (
    <ThemeContext.Provider value={theme}>
      <UserContext.Provider value={{ user, setUser }}>
        <MainContent />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}
```

#### 3. 消费Context值

在React 19中，可以直接将Context作为Provider使用：

```jsx
// React 19新特性：Context直接作为Provider
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext value={theme}>
      <MainContent />
    </ThemeContext>
  );
}

// 使用useContext Hook消费
function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button className={`btn-${theme}`}>
      Themed Button
    </button>
  );
}
```

### 完整示例：主题切换

```jsx
import { createContext, useContext, useState } from 'react';

// 1. 创建Context
const ThemeContext = createContext();

// 2. 创建Provider组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. 创建自定义Hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 4. 使用Context
function App() {
  return (
    <ThemeProvider>
      <Header />
      <MainContent />
      <Footer />
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={theme}>
      <h1>My App</h1>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </header>
  );
}

function MainContent() {
  const { theme } = useTheme();
  
  return (
    <main className={theme}>
      <p>Current theme: {theme}</p>
    </main>
  );
}
```

## Context的高级用法

### 多个Context组合

```jsx
// 创建多个Context
const AuthContext = createContext();
const ThemeContext = createContext();
const LanguageContext = createContext();

// 组合Provider
function AppProviders({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          {children}
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// 使用组合Hook
function useAppContext() {
  const auth = useContext(AuthContext);
  const theme = useContext(ThemeContext);
  const language = useContext(LanguageContext);

  return { auth, theme, language };
}
```

### Context分离策略

将不同类型的状态分离到不同的Context中：

```jsx
// 用户认证Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const userData = await authAPI.login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// UI偏好Context
const UIContext = createContext();

function UIProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const value = {
    theme,
    setTheme,
    sidebarOpen,
    toggleSidebar,
    notifications,
    addNotification
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// 数据Context
const DataContext = createContext();

function DataProvider({ children }) {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('date');

  const filteredData = useMemo(() => {
    let result = data;
    
    // 应用过滤器
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => item[key] === value);
      }
    });
    
    // 应用排序
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });
    
    return result;
  }, [data, filters, sortBy]);

  const value = {
    data,
    setData,
    filteredData,
    filters,
    setFilters,
    sortBy,
    setSortBy
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
```

### Context with Reducer模式

结合useReducer使用Context：

```jsx
import { createContext, useContext, useReducer } from 'react';

// 定义action类型
const actionTypes = {
  ADD_TODO: 'ADD_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  DELETE_TODO: 'DELETE_TODO',
  SET_FILTER: 'SET_FILTER'
};

// Reducer函数
function todoReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TODO:
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false
          }
        ]
      };
      
    case actionTypes.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
      
    case actionTypes.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
      
    case actionTypes.SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };
      
    default:
      return state;
  }
}

// Context
const TodoContext = createContext();

// Provider
function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });

  // Action creators
  const actions = {
    addTodo: (text) => dispatch({ type: actionTypes.ADD_TODO, payload: text }),
    toggleTodo: (id) => dispatch({ type: actionTypes.TOGGLE_TODO, payload: id }),
    deleteTodo: (id) => dispatch({ type: actionTypes.DELETE_TODO, payload: id }),
    setFilter: (filter) => dispatch({ type: actionTypes.SET_FILTER, payload: filter })
  };

  // 计算过滤后的todos
  const filteredTodos = useMemo(() => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(todo => !todo.completed);
      case 'completed':
        return state.todos.filter(todo => todo.completed);
      default:
        return state.todos;
    }
  }, [state.todos, state.filter]);

  const value = {
    ...state,
    filteredTodos,
    ...actions
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

// Custom Hook
function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within TodoProvider');
  }
  return context;
}

// 使用示例
function TodoApp() {
  return (
    <TodoProvider>
      <TodoInput />
      <TodoList />
      <TodoFilters />
    </TodoProvider>
  );
}

function TodoInput() {
  const [text, setText] = useState('');
  const { addTodo } = useTodos();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addTodo(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo..."
      />
      <button type="submit">Add</button>
    </form>
  );
}

function TodoList() {
  const { filteredTodos, toggleTodo, deleteTodo } = useTodos();

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

function TodoFilters() {
  const { filter, setFilter } = useTodos();

  return (
    <div>
      <button 
        onClick={() => setFilter('all')}
        disabled={filter === 'all'}
      >
        All
      </button>
      <button 
        onClick={() => setFilter('active')}
        disabled={filter === 'active'}
      >
        Active
      </button>
      <button 
        onClick={() => setFilter('completed')}
        disabled={filter === 'completed'}
      >
        Completed
      </button>
    </div>
  );
}
```

## Context的默认值

### 默认值的作用

```jsx
// 提供默认值
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {
    console.warn('toggleTheme function not implemented');
  }
});

// 即使没有Provider，也能使用默认值
function Component() {
  const { theme } = useContext(ThemeContext);
  // 如果没有Provider，theme将是'light'
  return <div className={theme}>Content</div>;
}
```

### TypeScript中的Context

```typescript
import { createContext, useContext, ReactNode, useState } from 'react';

// 定义类型
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// 创建Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider组件
interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // 模拟API调用
    const userData: User = {
      id: '1',
      name: 'John Doe',
      email,
      role: 'user'
    };
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 使用示例
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Context的高级模式

### 1. Context Selector模式

使用选择器避免不必要的重渲染：

```jsx
import { createContext, useContext, useRef, useSyncExternalStore } from 'react';

function createContextSelector(useValue) {
  const Context = createContext(null);

  function Provider({ children }) {
    const value = useValue();
    const valueRef = useRef(value);
    const subscribersRef = useRef(new Set());

    useEffect(() => {
      valueRef.current = value;
      subscribersRef.current.forEach(callback => callback());
    }, [value]);

    const contextValue = useMemo(() => ({
      subscribe: (callback) => {
        subscribersRef.current.add(callback);
        return () => subscribersRef.current.delete(callback);
      },
      getSnapshot: () => valueRef.current
    }), []);

    return (
      <Context.Provider value={contextValue}>
        {children}
      </Context.Provider>
    );
  }

  function useContextSelector(selector) {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useContextSelector must be used within Provider');
    }

    return useSyncExternalStore(
      context.subscribe,
      () => selector(context.getSnapshot()),
      () => selector(context.getSnapshot())
    );
  }

  return [Provider, useContextSelector];
}

// 使用示例
const [StoreProvider, useStoreSelector] = createContextSelector(() => {
  const [state, setState] = useState({
    user: { name: 'Alice', age: 30 },
    theme: 'light',
    settings: { notifications: true }
  });

  return [state, setState];
});

function App() {
  return (
    <StoreProvider>
      <UserName />
      <UserAge />
      <Theme />
    </StoreProvider>
  );
}

// 只订阅name，age改变时不会重渲染
function UserName() {
  const name = useStoreSelector(([state]) => state.user.name);
  console.log('UserName render');
  return <div>Name: {name}</div>;
}

// 只订阅age，name改变时不会重渲染
function UserAge() {
  const age = useStoreSelector(([state]) => state.user.age);
  console.log('UserAge render');
  return <div>Age: {age}</div>;
}

// 只订阅theme
function Theme() {
  const theme = useStoreSelector(([state]) => state.theme);
  console.log('Theme render');
  return <div>Theme: {theme}</div>;
}
```

### 2. Context工厂模式

创建可复用的Context工厂：

```jsx
function createGenericContext(hookName) {
  const Context = createContext(undefined);

  function useGenericContext() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`${hookName} must be used within its Provider`);
    }
    return context;
  }

  return [Context.Provider, useGenericContext];
}

// 使用工厂创建多个Context
const [CountProvider, useCount] = createGenericContext('useCount');
const [UserProvider, useUser] = createGenericContext('useUser');
const [SettingsProvider, useSettings] = createGenericContext('useSettings');

// 使用示例
function App() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});

  return (
    <CountProvider value={{ count, setCount }}>
      <UserProvider value={{ user, setUser }}>
        <SettingsProvider value={{ settings, setSettings }}>
          <MainContent />
        </SettingsProvider>
      </UserProvider>
    </CountProvider>
  );
}
```

### 3. 懒加载Context

按需加载Context值：

```jsx
const HeavyDataContext = createContext();

function HeavyDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (data) return; // 已加载
    
    setLoading(true);
    try {
      const response = await fetch('/api/heavy-data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [data]);

  const value = {
    data,
    loading,
    loadData
  };

  return (
    <HeavyDataContext.Provider value={value}>
      {children}
    </HeavyDataContext.Provider>
  );
}

function HeavyComponent() {
  const { data, loading, loadData } = useContext(HeavyDataContext);

  useEffect(() => {
    loadData(); // 组件挂载时才加载
  }, [loadData]);

  if (loading) return <div>Loading...</div>;
  if (!data) return null;

  return <div>{JSON.stringify(data)}</div>;
}
```

## Context的调试技巧

### 1. displayName

为Context设置displayName便于调试：

```jsx
const ThemeContext = createContext();
ThemeContext.displayName = 'ThemeContext';

const UserContext = createContext();
UserContext.displayName = 'UserContext';

// 在React DevTools中会显示为ThemeContext.Provider和UserContext.Provider
```

### 2. 开发模式警告

```jsx
function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuth must be used within AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider>.'
    );
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Current auth state:', context);
  }
  
  return context;
}
```

### 3. Context值追踪

```jsx
function DebugProvider({ children, name, value }) {
  useEffect(() => {
    console.log(`[${name}] Context value changed:`, value);
  }, [name, value]);

  return children;
}

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      <DebugProvider name="ThemeContext" value={theme}>
        <MainContent />
      </DebugProvider>
    </ThemeContext.Provider>
  );
}
```

## Context的实际应用案例

### 案例1：国际化（i18n）

```jsx
import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  'zh-CN': {
    welcome: '欢迎',
    logout: '退出',
    settings: '设置'
  },
  'en-US': {
    welcome: 'Welcome',
    logout: 'Logout',
    settings: 'Settings'
  }
};

const I18nContext = createContext();

function I18nProvider({ children, defaultLanguage = 'zh-CN' }) {
  const [language, setLanguage] = useState(defaultLanguage);

  const t = useCallback((key) => {
    return translations[language]?.[key] || key;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// 使用
function WelcomeMessage() {
  const { t } = useI18n();
  return <h1>{t('welcome')}</h1>;
}

function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  
  return (
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
```

### 案例2：表单Context

```jsx
const FormContext = createContext();

function FormProvider({ children, onSubmit }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setFieldValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const setFieldError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const setFieldTouched = (name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), 
      {}
    );
    setTouched(allTouched);
    
    // 检查是否有错误
    const hasErrors = Object.values(errors).some(error => error);
    
    if (!hasErrors) {
      onSubmit(values);
    }
  };

  const value = {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit
  };

  return (
    <FormContext.Provider value={value}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
}

function FormField({ name, label, validate }) {
  const { 
    values, 
    errors, 
    touched, 
    setFieldValue, 
    setFieldError, 
    setFieldTouched 
  } = useFormContext();

  const value = values[name] || '';
  const error = errors[name];
  const isTouched = touched[name];

  const handleChange = (e) => {
    const newValue = e.target.value;
    setFieldValue(name, newValue);
    
    if (validate) {
      const error = validate(newValue);
      setFieldError(name, error);
    }
  };

  const handleBlur = () => {
    setFieldTouched(name);
  };

  return (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {isTouched && error && (
        <span className="error">{error}</span>
      )}
    </div>
  );
}

// 使用
function LoginForm() {
  const handleSubmit = (values) => {
    console.log('Form values:', values);
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
    return null;
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  return (
    <FormProvider onSubmit={handleSubmit}>
      <FormField 
        name="email" 
        label="Email" 
        validate={validateEmail}
      />
      <FormField 
        name="password" 
        label="Password" 
        validate={validatePassword}
      />
      <button type="submit">Login</button>
    </FormProvider>
  );
}
```

### 案例3：购物车Context

```jsx
const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// 使用
function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>
        Add to Cart
      </button>
    </div>
  );
}

function CartSummary() {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart();

  return (
    <div className="cart-summary">
      <h2>Cart ({itemCount} items)</h2>
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <span>{item.name}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
          />
          <span>${item.price * item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}
```

## 最佳实践总结

### 1. 何时使用Context

适合使用Context的场景：
- 主题、语言等全局配置
- 用户认证信息
- 多个组件需要访问的数据
- 深层组件树的数据传递

不适合使用Context的场景：
- 频繁变化的数据
- 高性能要求的场景
- 简单的父子组件通信

### 2. Context设计原则

```jsx
// 好的实践：拆分Context
const ThemeContext = createContext();
const UserContext = createContext();
const SettingsContext = createContext();

// 不好的实践：所有状态放在一个Context
const AppContext = createContext(); // 包含theme, user, settings等
```

### 3. 性能优化建议

```jsx
// 1. 拆分value对象
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  // 不好：每次渲染都创建新对象
  // const value = { user, setUser, theme, setTheme };
  
  // 好：使用useMemo
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme]
  );
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// 2. 拆分Context
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 3. 使用React.memo防止子组件重渲染
const ExpensiveComponent = React.memo(function ExpensiveComponent() {
  // 只在props变化时重渲染
  return <div>Expensive computation here</div>;
});
```

### 4. 错误处理

```jsx
function useRequiredContext(Context, hookName) {
  const context = useContext(Context);
  
  if (context === undefined) {
    throw new Error(
      `${hookName} must be used within ${Context.displayName || 'Context'}.Provider`
    );
  }
  
  return context;
}

// 使用
function useTheme() {
  return useRequiredContext(ThemeContext, 'useTheme');
}
```

### 5. 测试Context

```jsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestComponent() {
  const { theme } = useTheme();
  return <div>Current theme: {theme}</div>;
}

describe('ThemeContext', () => {
  it('provides theme value', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/Current theme: light/)).toBeInTheDocument();
  });
  
  it('throws error when used outside provider', () => {
    // 测试错误情况
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within ThemeProvider');
  });
});
```

## 总结

Context API是React内置的强大状态管理工具，适合处理全局状态和跨层级组件通信。关键要点：

1. 合理拆分Context，避免单一巨大的Context
2. 使用useMemo优化value对象
3. 创建自定义Hooks封装Context逻辑
4. 提供清晰的错误提示
5. 结合useReducer处理复杂状态逻辑
6. 注意性能优化，避免不必要的重渲染

在React 19中，Context可以直接作为Provider使用，API更加简洁。但要记住，Context并非适用于所有场景，对于复杂的状态管理需求，可能需要考虑其他方案如Zustand、Jotai或Redux Toolkit。

