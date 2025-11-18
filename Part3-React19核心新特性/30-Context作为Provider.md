# Context作为Provider

## 学习目标

通过本章学习，你将掌握：

- Context.Provider的简化语法
- 直接使用Context作为Provider
- 与传统方式对比
- 简化的组件树
- TypeScript支持
- 迁移指南
- 最佳实践
- 兼容性处理

## 第一部分：传统Context.Provider

### 1.1 传统用法

```jsx
// ❌ React 18及之前：需要使用Context.Provider
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Page content</div>;
}

// 问题：
// 1. 需要显式使用.Provider
// 2. 代码略显冗长
// 3. 嵌套时更明显
```

### 1.2 多层嵌套的问题

```jsx
// ❌ 多个Provider嵌套非常冗长
const ThemeContext = createContext('light');
const UserContext = createContext(null);
const LanguageContext = createContext('en');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <UserContext.Provider value={{ name: 'Alice' }}>
        <LanguageContext.Provider value="zh">
          <Page />
        </LanguageContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// 金字塔式嵌套，难以阅读
```

### 1.3 TypeScript中的复杂性

```tsx
// ❌ Provider类型略显繁琐
import { createContext, useContext } from 'react';

interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
}

const ThemeContext = createContext<Theme>({
  mode: 'light',
  primaryColor: '#000'
});

function App() {
  const theme: Theme = {
    mode: 'dark',
    primaryColor: '#fff'
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}
```

## 第二部分：React 19的简化语法

### 2.1 Context直接作为Provider

```jsx
// ✅ React 19：可以直接使用Context作为Provider
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Page content</div>;
}

// 优势：
// ✅ 更简洁
// ✅ 更直观
// ✅ 减少一层嵌套
```

### 2.2 多个Context简化

```jsx
// ✅ 扁平化的Context提供
const ThemeContext = createContext('light');
const UserContext = createContext(null);
const LanguageContext = createContext('en');

function App() {
  return (
    <ThemeContext value="dark">
      <UserContext value={{ name: 'Alice' }}>
        <LanguageContext value="zh">
          <Page />
        </LanguageContext>
      </UserContext>
    </ThemeContext>
  );
}

// 虽然仍有嵌套，但更清晰简洁
```

### 2.3 对比传统方式

```jsx
// ❌ 旧方式
<ThemeContext.Provider value="dark">
  <UserContext.Provider value={user}>
    <Content />
  </UserContext.Provider>
</ThemeContext.Provider>

// ✅ 新方式（React 19）
<ThemeContext value="dark">
  <UserContext value={user}>
    <Content />
  </UserContext>
</ThemeContext>

// 看起来更加简洁
```

## 第三部分：实际应用

### 3.1 主题系统

#### 基础主题Provider

```jsx
// ✅ 简化的主题Provider
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// 使用
function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}

function Page() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={theme}>
      <h1>当前主题: {theme}</h1>
      <button onClick={toggleTheme}>切换主题</button>
    </div>
  );
}
```

#### 高级主题系统

```jsx
// ✅ 更完整的主题系统
import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
}

interface ThemeContextValue {
  mode: 'light' | 'dark' | 'auto';
  colors: ThemeColors;
  setMode: (mode: 'light' | 'dark' | 'auto') => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#ffffff',
  text: '#212529',
  border: '#dee2e6'
};

const darkColors: ThemeColors = {
  primary: '#0d6efd',
  secondary: '#6c757d',
  background: '#212529',
  text: '#f8f9fa',
  border: '#495057'
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark' | 'auto'>(() => {
    // 从localStorage读取用户偏好
    const saved = localStorage.getItem('theme-mode');
    return (saved as 'light' | 'dark' | 'auto') || 'auto';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 保存用户偏好到localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // 确定实际使用的主题
  const actualTheme = mode === 'auto' ? systemTheme : mode;
  const colors = actualTheme === 'dark' ? darkColors : lightColors;

  // 应用主题到document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // 设置CSS变量
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [actualTheme, colors]);

  const toggleTheme = () => {
    setMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const value: ThemeContextValue = {
    mode,
    colors,
    setMode,
    toggleTheme
  };

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 使用示例
function ThemeSelector() {
  const { mode, setMode } = useTheme();

  return (
    <div className="theme-selector">
      <button 
        onClick={() => setMode('light')}
        className={mode === 'light' ? 'active' : ''}
      >
        浅色
      </button>
      <button 
        onClick={() => setMode('dark')}
        className={mode === 'dark' ? 'active' : ''}
      >
        深色
      </button>
      <button 
        onClick={() => setMode('auto')}
        className={mode === 'auto' ? 'active' : ''}
      >
        自动
      </button>
    </div>
  );
}

function ThemedComponent() {
  const { colors } = useTheme();

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.text,
      border: `1px solid ${colors.border}`
    }}>
      主题化组件
    </div>
  );
}
```

### 3.2 用户认证

#### 基础认证系统

```jsx
// ✅ 认证Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 检查用户登录状态
    checkAuthStatus().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);
  
  const login = async (credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };
  
  const logout = async () => {
    await api.logout();
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 使用
function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <button onClick={logout}>退出</button>
    </div>
  );
}
```

#### 完整认证系统

```jsx
// ✅ 更完整的认证系统
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 初始化：检查认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const user = await api.getCurrentUser(token);
          setUser(user);
        }
      } catch (err) {
        console.error('Failed to restore auth:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 自动刷新token
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (err) {
        console.error('Failed to refresh token:', err);
        await logout();
      }
    }, 15 * 60 * 1000); // 每15分钟刷新一次

    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.login({ email, password });
      const { user, token } = response;
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      
      // 记录登录事件
      analytics.track('user_login', { userId: user.id });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await api.logout();
      
      localStorage.removeItem('auth_token');
      setUser(null);
      
      // 记录登出事件
      analytics.track('user_logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.register(data);
      const { user, token } = response;
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      
      // 记录注册事件
      analytics.track('user_register', { userId: user.id });
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      const updatedUser = await api.updateProfile(user.id, data);
      setUser(updatedUser);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const newToken = await api.refreshToken(token);
      localStorage.setItem('auth_token', newToken);
    } catch (err) {
      throw err;
    }
  }, []);

  const hasRole = useCallback((role: string) => {
    return user?.roles.includes(role) || false;
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    // 实现权限检查逻辑
    if (!user) return false;
    
    // 假设管理员拥有所有权限
    if (user.roles.includes('admin')) return true;
    
    // 这里可以实现更复杂的权限检查逻辑
    return false;
  }, [user]);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    refreshToken,
    isAuthenticated: !!user,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 使用示例
function LoginForm() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // 登录成功后导航
      navigate('/dashboard');
    } catch (err) {
      // 错误已在context中处理
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={loading}
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={loading}
      />
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}

function UserProfile() {
  const { user, updateProfile, loading } = useAuth();
  const [name, setName] = useState(user?.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name });
      alert('个人资料已更新');
    } catch (err) {
      alert('更新失败');
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit}>
      <h2>个人资料</h2>
      <div>
        <label>姓名：</label>
        <input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label>邮箱：</label>
        <input value={user.email} disabled />
      </div>
      <div>
        <label>角色：</label>
        <span>{user.roles.join(', ')}</span>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
```

### 3.3 多语言国际化

#### 基础i18n系统

```jsx
// ✅ i18n Context
const LanguageContext = createContext('en');
const TranslationsContext = createContext({});

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('zh');
  const [translations, setTranslations] = useState({});
  
  useEffect(() => {
    // 加载翻译文件
    loadTranslations(language).then(setTranslations);
  }, [language]);
  
  return (
    <LanguageContext value={language}>
      <TranslationsContext value={translations}>
        {children}
      </TranslationsContext>
    </LanguageContext>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation() {
  const translations = useContext(TranslationsContext);
  
  const t = (key) => {
    return translations[key] || key;
  };
  
  return { t };
}

// 使用
function App() {
  return (
    <I18nProvider>
      <Page />
    </I18nProvider>
  );
}

function Page() {
  const { t } = useTranslation();
  const language = useLanguage();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('current_language')}: {language}</p>
    </div>
  );
}
```

#### 完整i18n系统

```jsx
// ✅ 功能完整的国际化系统
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

type Language = 'en' | 'zh' | 'ja' | 'es' | 'fr';

interface Translations {
  [key: string]: string | Translations;
}

interface I18nContextValue {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  languages: { code: Language; name: string }[];
  loading: boolean;
  error: Error | null;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const SUPPORTED_LANGUAGES = [
  { code: 'en' as Language, name: 'English' },
  { code: 'zh' as Language, name: '中文' },
  { code: 'ja' as Language, name: '日本語' },
  { code: 'es' as Language, name: 'Español' },
  { code: 'fr' as Language, name: 'Français' }
];

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // 优先级：localStorage > 浏览器语言 > 默认语言
    const saved = localStorage.getItem('language') as Language;
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    
    const browserLang = navigator.language.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
      return browserLang;
    }
    
    return 'en';
  });

  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 加载翻译文件
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 动态导入翻译文件
        const module = await import(`./locales/${language}.json`);
        setTranslations(module.default);
        
        // 保存到localStorage
        localStorage.setItem('language', language);
        
        // 设置HTML lang属性
        document.documentElement.lang = language;
      } catch (err) {
        console.error(`Failed to load translations for ${language}:`, err);
        setError(err as Error);
        
        // 降级到英语
        if (language !== 'en') {
          setLanguageState('en');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // 翻译函数，支持嵌套键和参数替换
  const t = useCallback((key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    // 参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, param) => {
        return params[param] !== undefined ? String(params[param]) : `{${param}}`;
      });
    }
    
    return value;
  }, [translations]);

  const value: I18nContextValue = useMemo(() => ({
    language,
    translations,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
    loading,
    error
  }), [language, translations, setLanguage, t, loading, error]);

  return (
    <I18nContext value={value}>
      {children}
    </I18nContext>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// 使用示例
function LanguageSwitcher() {
  const { language, setLanguage, languages } = useI18n();

  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value as Language)}
    >
      {languages.map(lang => (
        <key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}

function WelcomeMessage() {
  const { t } = useI18n();
  const userName = 'Alice';

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: userName })}</p>
      <p>{t('account.settings.title')}</p>
    </div>
  );
}

// 翻译文件示例 (locales/zh.json)
/*
{
  "welcome": "欢迎",
  "greeting": "你好，{name}！",
  "account": {
    "settings": {
      "title": "账户设置"
    }
  }
}
*/
```

### 3.4 全局应用状态

```jsx
// ✅ 简单的全局状态管理
import { createContext, useContext, useState, useCallback } from 'react';

interface AppState {
  notifications: Notification[];
  sidebarOpen: boolean;
  modal: ModalState | null;
}

interface AppActions {
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
}

type AppContextValue = AppState & AppActions;

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);

  const addNotification = useCallback((notification: Notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);

    // 自动移除通知
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const openModal = useCallback((modalState: ModalState) => {
    setModal(modalState);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  const value: AppContextValue = {
    notifications,
    sidebarOpen,
    modal,
    addNotification,
    removeNotification,
    toggleSidebar,
    openModal,
    closeModal
  };

  return (
    <AppContext value={value}>
      {children}
    </AppContext>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// 使用示例
function NotificationsList() {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="notifications">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => removeNotification(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

function ActionButton() {
  const { addNotification } = useApp();

  const handleClick = () => {
    addNotification({
      type: 'success',
      message: '操作成功！',
      duration: 3000
    });
  };

  return <button onClick={handleClick}>执行操作</button>;
}

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleSidebar}>切换侧边栏</button>
      {/* 侧边栏内容 */}
    </div>
  );
}
```

### 3.5 购物车系统

```jsx
// ✅ 电商购物车Context
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // 从localStorage恢复购物车
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // 保存购物车到localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // 计算总价
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // 计算商品数量
  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  };

  return (
    <CartContext value={value}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
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
      <p>¥{product.price}</p>
      <button onClick={() => addItem(product)}>
        加入购物车
      </button>
    </div>
  );
}

function CartBadge() {
  const { itemCount } = useCart();

  return (
    <div className="cart-badge">
      🛒 {itemCount > 0 && <span className="badge">{itemCount}</span>}
    </div>
  );
}

function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return <div>购物车是空的</div>;
  }

  return (
    <div className="cart-page">
      <h2>购物车</h2>
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <p>¥{item.price}</p>
          </div>
          <div className="quantity-controls">
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
          </div>
          <div>¥{item.price * item.quantity}</div>
          <button onClick={() => removeItem(item.id)}>删除</button>
        </div>
      ))}
      <div className="cart-summary">
        <h3>总计: ¥{total.toFixed(2)}</h3>
        <button onClick={clearCart}>清空购物车</button>
        <button className="checkout">结算</button>
      </div>
    </div>
  );
}
```

## 第四部分：TypeScript支持

### 4.1 类型定义

```tsx
// ✅ TypeScript中的Context类型
import { createContext, useContext, ReactNode } from 'react';

interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

const ThemeContext = createContext<Theme>({
  mode: 'light',
  primaryColor: '#000',
  secondaryColor: '#666'
});

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    initialTheme || {
      mode: 'light',
      primaryColor: '#000',
      secondaryColor: '#666'
    }
  );
  
  return (
    <ThemeContext value={theme}>
      {children}
    </ThemeContext>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

### 4.2 可选Context

```tsx
// ✅ 处理可选的Context
interface User {
  id: string;
  name: string;
  email: string;
}

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <UserContext value={user}>
      {children}
    </UserContext>
  );
}

export function useUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error('useUser must be used within UserProvider');
  }
  return user;
}

export function useOptionalUser() {
  return useContext(UserContext);
}
```

### 4.3 泛型Context

```tsx
// ✅ 泛型Context工厂
function createGenericContext<T>() {
  const Context = createContext<T | undefined>(undefined);
  
  function useGenericContext() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useGenericContext must be used within Provider');
    }
    return context;
  }
  
  return [Context, useGenericContext] as const;
}

// 使用
interface AppState {
  count: number;
  increment: () => void;
}

const [AppStateContext, useAppState] = createGenericContext<AppState>();

function AppStateProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  
  const value: AppState = {
    count,
    increment: () => setCount(c => c + 1)
  };
  
  return (
    <AppStateContext value={value}>
      {children}
    </AppStateContext>
  );
}
```

## 第五部分：组合多个Context

### 5.1 Context组合器

```jsx
// ✅ 创建Context组合器
function combineProviders(...providers) {
  return ({ children }) => {
    return providers.reduceRight((acc, Provider) => {
      return <Provider>{acc}</Provider>;
    }, children);
  };
}

// 使用
const AppProviders = combineProviders(
  ThemeProvider,
  AuthProvider,
  I18nProvider
);

function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}
```

### 5.2 嵌套Context

```jsx
// ✅ 更高级的组合
function Providers({ children }) {
  return (
    <ThemeContext value={themeValue}>
      <UserContext value={userValue}>
        <SettingsContext value={settingsValue}>
          {children}
        </SettingsContext>
      </UserContext>
    </ThemeContext>
  );
}
```

## 第六部分：迁移指南

### 6.1 渐进式迁移

```jsx
// 步骤1：识别Context.Provider
<ThemeContext.Provider value={theme}>

// 步骤2：替换为简化语法
<ThemeContext value={theme}>

// 两种方式在React 19中都有效
```

### 6.2 兼容性处理

```jsx
// ✅ 同时支持两种方式
import { createContext, version } from 'react';

const ThemeContext = createContext('light');

function ThemeProvider({ children, value }) {
  const isReact19 = parseInt(version) >= 19;
  
  if (isReact19) {
    return (
      <ThemeContext value={value}>
        {children}
      </ThemeContext>
    );
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 6.3 代码检查和重构

```bash
# 使用正则表达式查找所有Context.Provider
grep -r "\.Provider" src/

# 批量替换
# 手动审查每个替换，确保正确性
```

## 注意事项

### 1. 保持一致性

```jsx
// ✅ 在项目中保持一致的风格
// 要么全用新语法
<ThemeContext value={theme}>

// 要么全用旧语法
<ThemeContext.Provider value={theme}>

// ❌ 不要混用，影响可读性
```

### 2. Consumer仍然可用

```jsx
// ✅ Context.Consumer仍然有效
<ThemeContext.Consumer>
  {theme => <div className={theme}>Content</div>}
</ThemeContext.Consumer>

// 但推荐使用useContext
const theme = useContext(ThemeContext);
```

### 3. 默认值仍然重要

```jsx
// ✅ 提供合理的默认值
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {
    console.warn('toggleTheme called outside ThemeProvider');
  }
});
```

## 常见问题

### Q1: 旧的Context.Provider语法还能用吗？

**A:** 可以，React 19完全兼容旧语法。两种语法可以共存：

```jsx
// ✅ 旧语法（仍然有效）
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// ✅ 新语法（React 19推荐）
<ThemeContext value="dark">
  <App />
</ThemeContext>

// 甚至可以在同一个项目中混用（但不推荐）
<ThemeContext value="dark">
  <UserContext.Provider value={user}>
    <App />
  </UserContext.Provider>
</ThemeContext>
```

React团队承诺会长期支持旧语法，不会强制要求迁移。

### Q2: 什么时候应该迁移到新语法？

**A:** 迁移时机取决于项目情况：

**立即迁移的情况：**
-新项目或新功能
- 正在升级到React 19
- 代码重构期间
- 团队已熟悉React 19

**延迟迁移的情况：**
- 稳定的生产环境
- 大型遗留代码库
- 团队资源有限
- 没有明显的问题

```jsx
// 渐进式迁移策略
// 第1步：新组件使用新语法
function NewFeature() {
  return (
    <FeatureContext value={value}>
      <Feature />
    </FeatureContext>
  );
}

// 第2步：修改现有组件时逐步更新
function ExistingFeature() {
  // 从旧语法
  // <ThemeContext.Provider value={theme}>
  
  // 更新为新语法
  return (
    <ThemeContext value={theme}>
      <Content />
    </ThemeContext>
  );
}

// 第3步：批量更新（可选）
// 使用脚本或工具辅助批量替换
```

### Q3: 性能上有区别吗？

**A:** 没有性能区别。新语法只是语法糖，底层实现完全相同：

```jsx
// 这两种写法编译后的结果相同
<ThemeContext.Provider value="dark">  // 旧语法
<ThemeContext value="dark">           // 新语法

// React内部会将新语法转换为旧语法的调用
// 所以性能特征完全一致
```

**性能考虑：**
```jsx
// ❌ 避免在render中创建新对象（无论新旧语法）
function Bad() {
  return (
    <ThemeContext value={{ theme: 'dark' }}>  // 每次render都创建新对象
      <App />
    </ThemeContext>
  );
}

// ✅ 使用useMemo优化
function Good() {
  const value = useMemo(() => ({ theme: 'dark' }), []);
  
  return (
    <ThemeContext value={value}>
      <App />
    </ThemeContext>
  );
}

// ✅ 或使用useState
function Better() {
  const [value] = useState({ theme: 'dark' });
  
  return (
    <ThemeContext value={value}>
      <App />
    </ThemeContext>
  );
}
```

### Q4: 需要更新Context的TypeScript类型吗？

**A:** 不需要，类型定义保持不变：

```tsx
// TypeScript类型定义对新旧语法都适用
interface Theme {
  mode: 'light' | 'dark';
}

const ThemeContext = createContext<Theme>({ mode: 'light' });

// ✅ 旧语法的类型
<ThemeContext.Provider value={{ mode: 'dark' }}>
  <App />
</ThemeContext.Provider>

// ✅ 新语法的类型（完全相同）
<ThemeContext value={{ mode: 'dark' }}>
  <App />
</ThemeContext>

// 类型检查和自动完成在两种语法中都正常工作
```

### Q5: Context.Consumer还能用吗？

**A:** 可以，但推荐使用`useContext`：

```jsx
// ✅ 仍然有效
<ThemeContext.Consumer>
  {theme => <div className={theme}>Content</div>}
</ThemeContext.Consumer>

// ✅ 推荐使用useContext（更简洁）
function Content() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>Content</div>;
}

// 在类组件中Consumer仍然有用
class ClassComponent extends React.Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {theme => <div className={theme}>{this.props.children}</div>}
      </ThemeContext.Consumer>
    );
  }
}
```

### Q6: 如何在多个Provider间共享状态？

**A:** Context本身是独立的，需要组合使用：

```jsx
// 方案1：嵌套Context
function App() {
  return (
    <ThemeContext value={theme}>
      <UserContext value={user}>
        {/* 子组件可以同时访问两个context */}
        <Page />
      </UserContext>
    </ThemeContext>
  );
}

// 方案2：组合到单个Context
interface AppContextValue {
  theme: Theme;
  user: User;
  updateTheme: (theme: Theme) => void;
  updateUser: (user: User) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [user, setUser] = useState(null);

  const value = {
    theme,
    user,
    updateTheme: setTheme,
    updateUser: setUser
  };

  return (
    <AppContext value={value}>
      {children}
    </AppContext>
  );
}

// 方案3：使用Provider组合器
const Combined Provider = combineProviders(
  ThemeProvider,
  UserProvider,
  I18nProvider
);
```

### Q7: Context值变化会导致哪些组件重新渲染？

**A:** 所有使用该Context的组件都会重新渲染：

```jsx
function App() {
  const [count, setCount] = useState(0);

  return (
    <CountContext value={count}>
      <ComponentA />  {/* 如果使用了context会重渲染 */}
      <ComponentB />  {/* 如果使用了context会重渲染 */}
      <ComponentC />  {/* 如果没使用context不会重渲染 */}
    </CountContext>
  );
}

// ✅ 优化：分离不常变化的值
function OptimizedApp() {
  const [theme, setTheme] = useState('light');      // 不常变化
  const [count, setCount] = useState(0);            // 频繁变化

  return (
    <ThemeContext value={theme}>                    {/* 很少触发重渲染 */}
      <CountContext value={count}>                  {/* 频繁触发重渲染 */}
        <App />
      </CountContext>
    </ThemeContext>
  );
}
```

### Q8: 如何避免Context导致的不必要重渲染？

**A:** 使用多种优化策略：

```jsx
// 策略1：分离Context
// ❌ 不好：所有值在一个Context中
const AppContext = createContext({ theme, user, settings, cart });

// ✅ 好：按变化频率分离Context
const ThemeContext = createContext(theme);        // 很少变化
const UserContext = createContext(user);          // 偶尔变化
const CartContext = createContext(cart);          // 频繁变化

// 策略2：使用React.memo
const ExpensiveComponent = React.memo(({ data }) => {
  // 只在props变化时重渲染
  return <div>{/* 复杂的渲染逻辑 */}</div>;
});

// 策略3：拆分值和setter
const ValueContext = createContext(value);
const SetterContext = createContext(setter);

function Consumer1() {
  const value = useContext(ValueContext);  // 值变化时重渲染
  return <div>{value}</div>;
}

function Consumer2() {
  const setter = useContext(SetterContext);  // setter不变化，不重渲染
  return <button onClick={setter}>Update</button>;
}

// 策略4：使用selector模式
function useThemeMode() {
  const theme = useContext(ThemeContext);
  return theme.mode;  // 只返回需要的部分
}
```

### Q9: 如何测试使用Context的组件？

**A:** 使用测试库提供测试Context：

```jsx
import { render, screen } from '@testing-library/react';
import { ThemeContext } from './ThemeContext';

test('renders with theme', () => {
  const mockTheme = { mode: 'dark', colors: {...} };

  render(
    <ThemeContext value={mockTheme}>
      <ThemedComponent />
    </ThemeContext>
  );

  expect(screen.getByText(/dark mode/i)).toBeInTheDocument();
});

// 创建测试工具函数
function renderWithTheme(ui, { theme = defaultTheme } = {}) {
  return render(
    <ThemeContext value={theme}>
      {ui}
    </ThemeContext>
  );
}

test('themed component', () => {
  renderWithTheme(<ThemedComponent />, {
    theme: { mode: 'dark' }
  });
});

// 测试多个Context
function renderWithProviders(ui, { theme, user, i18n } = {}) {
  return render(
    <ThemeContext value={theme || defaultTheme}>
      <UserContext value={user || null}>
        <I18nContext value={i18n || defaultI18n}>
          {ui}
        </I18nContext>
      </UserContext>
    </ThemeContext>
  );
}
```

### Q10: Context和Redux如何选择？

**A:** 根据应用需求选择：

**使用Context的场景：**
- 简单到中等复杂度的状态
- 状态更新不频繁
- 不需要时间旅行调试
- 团队熟悉React Hooks
- 想减少依赖

```jsx
// Context适合：主题、认证、语言等
<ThemeContext value={theme}>
  <UserContext value={user}>
    <I18nContext value={i18n}>
      <App />
    </I18nContext>
  </UserContext>
</ThemeContext>
```

**使用Redux的场景：**
- 复杂的状态管理
- 需要中间件（如redux-thunk、redux-saga）
- 需要时间旅行调试
- 大型团队协作
- 已有Redux生态的项目

**混合使用：**
```jsx
// 在Redux应用中仍可使用Context
<ReduxProvider store={store}>
  <ThemeContext value={theme}>
    <I18nContext value={i18n}>
      <App />
    </I18nContext>
  </ThemeContext>
</ReduxProvider>
```

| 特性 | Context API | Redux |
|------|-------------|-------|
| 学习曲线 | 低 | 中等 |
| 样板代码 | 少 | 多 |
| DevTools | 基础 | 强大 |
| 中间件支持 | 无 | 丰富 |
| 时间旅行 | 无 | 有 |
| 代码分割 | 容易 | 需配置 |
| 适用规模 | 小到中 | 中到大 |

### Q11: 如何在Server Components中使用Context？

**A:** Server Components不能使用Context，需要在Client Components中：

```jsx
// ❌ 不能在Server Component中使用Context
// app/page.tsx (Server Component)
export default function Page() {
  const theme = useContext(ThemeContext);  // 错误！
  return <div>{theme}</div>;
}

// ✅ 在Client Component中使用Context
// app/page.tsx (Server Component)
import { ThemedContent } from './ThemedContent';

export default function Page() {
  return (
    <ThemeProvider>
      <ThemedContent />
    </ThemeProvider>
  );
}

// app/ThemedContent.tsx (Client Component)
'use client';

export function ThemedContent() {
  const theme = useContext(ThemeContext);  // 正确！
  return <div>{theme}</div>;
}

// Provider也必须在Client Component中
// app/providers.tsx
'use client';

export function Providers({ children }) {
  return (
    <ThemeContext value={theme}>
      <UserContext value={user}>
        {children}
      </UserContext>
    </ThemeContext>
  );
}

// app/layout.tsx (Server Component)
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Q12: Context值应该如何初始化？

**A:** 提供合理的默认值：

```tsx
// ❌ 不好：undefined默认值
const ThemeContext = createContext<Theme | undefined>(undefined);

// 使用时需要检查
function Component() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('Must be used within Provider');
  }
  return <div>{theme.mode}</div>;
}

// ✅ 好：提供有意义的默认值
const ThemeContext = createContext<Theme>({
  mode: 'light',
  colors: defaultColors
});

// 直接使用，不需要检查
function Component() {
  const theme = useContext(ThemeContext);
  return <div>{theme.mode}</div>;
}

// ✅ 也可以：创建自定义Hook处理检查
const ThemeContext = createContext<Theme | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 使用自定义Hook
function Component() {
  const theme = useTheme();  // 自动检查，类型安全
  return <div>{theme.mode}</div>;
}
```

### Q13: 如何调试Context问题？

**A:** 使用多种调试技巧：

```jsx
// 技巧1：使用React DevTools
// 在DevTools中查看Context的当前值

// 技巧2：添加调试日志
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // 记录Context值的变化
  useEffect(() => {
    console.log('Theme changed:', theme);
  }, [theme]);

  return (
    <ThemeContext value={{ theme, setTheme }}>
      {children}
    </ThemeContext>
  );
}

// 技巧3：创建调试Hook
export function useThemeDebug() {
  const theme = useContext(ThemeContext);
  
  useEffect(() => {
    console.log('Component using theme:', theme);
    console.trace('Theme access stack trace');
  }, [theme]);
  
  return theme;
}

// 技巧4：使用displayName
ThemeContext.displayName = 'ThemeContext';
UserContext.displayName = 'UserContext';

// 在DevTools中更容易识别

// 技巧5：添加错误边界
function ContextErrorBoundary({ children }) {
  return (
    <ErrorBoundary 
      fallback={<div>Context Error</div>}
      onError={(error) => {
        console.error('Context error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// 技巧6：性能分析
import { Profiler } from 'react';

function App() {
  return (
    <Profiler 
      id="theme-context" 
      onRender={(id, phase, actualDuration) => {
        console.log(`${id} ${phase} took ${actualDuration}ms`);
      }}
    >
      <ThemeContext value={theme}>
        <App />
      </ThemeContext>
    </Profiler>
  );
}
```

## 总结

### 新语法优势

```
✅ 更简洁清晰
✅ 减少一层嵌套
✅ 更好的可读性
✅ 与组件语法一致
✅ 降低学习曲线
✅ 完全向后兼容
```

### 迁移步骤

```
1. 评估项目规模
2. 识别所有Context.Provider
3. 逐步替换为简化语法
4. 保持代码风格一致
5. 更新文档和示例
6. 团队培训
```

### 最佳实践

```
✅ 新项目使用新语法
✅ 提供合理默认值
✅ 配合自定义Hook使用
✅ 正确的TypeScript类型
✅ 适当的错误处理
✅ 保持一致性
```

Context作为Provider的简化语法让代码更加优雅！
