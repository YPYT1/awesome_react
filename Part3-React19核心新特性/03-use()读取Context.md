# use()读取Context

## 学习目标

通过本章学习，你将掌握：

- use()读取Context的基本用法
- use()与useContext的区别
- 条件读取Context的优势
- 多层Context的处理
- Context性能优化
- use()与Provider的配合
- 实际项目中的Context模式
- 从useContext迁移到use()

## 第一部分：Context基础回顾

### 1.1 什么是Context

Context提供了一种在组件树中共享数据的方式，无需逐层传递props。

```jsx
import { createContext, useContext } from 'react';

// 创建Context
const ThemeContext = createContext('light');

// 提供Context值
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 消费Context（传统方式）
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>按钮</button>;
}
```

### 1.2 useContext的限制

```jsx
// useContext必须无条件调用
function Component({ needsTheme }) {
  // ❌ 不能在条件语句中
  if (needsTheme) {
    const theme = useContext(ThemeContext);  // 违反Hook规则！
  }
  
  // ❌ 不能在循环中
  for (let i = 0; i < 3; i++) {
    const theme = useContext(ThemeContext);  // 违反Hook规则！
  }
  
  // ✅ 只能在顶层调用
  const theme = useContext(ThemeContext);
  
  if (needsTheme) {
    return <div className={theme}>有主题</div>;
  }
  return <div>无主题</div>;
}
```

### 1.3 传统Context的问题

```jsx
// 问题1：必须无条件读取
function OptionalTheming({ useTheme }) {
  // 即使不需要，也必须调用
  const theme = useContext(ThemeContext);
  
  if (!useTheme) {
    return <button>普通按钮</button>;
  }
  
  return <button className={theme}>主题按钮</button>;
}

// 问题2：多个Context嵌套臃肿
function MultiContext() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const language = useContext(LanguageContext);
  const settings = useContext(SettingsContext);
  
  // 全部都要在顶层调用，即使可能不需要
}
```

## 第二部分：use()读取Context基础

### 2.1 基本用法

```jsx
import { createContext, use } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  // ✅ 使用use()读取Context
  const theme = use(ThemeContext);
  
  return (
    <button className={`btn-${theme}`}>
      当前主题: {theme}
    </button>
  );
}

// 使用
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}
```

### 2.2 与useContext的对比

```jsx
const ThemeContext = createContext('light');

// 使用useContext
function WithUseContext() {
  const theme = useContext(ThemeContext);
  return <div>主题: {theme}</div>;
}

// 使用use()
function WithUse() {
  const theme = use(ThemeContext);
  return <div>主题: {theme}</div>;
}

// 表面上看起来相同，但use()更灵活
```

### 2.3 功能对比表

| 特性 | useContext | use() |
|------|-----------|-------|
| 基本读取 | ✅ | ✅ |
| 条件调用 | ❌ | ✅ |
| 循环调用 | ❌ | ✅ |
| 早期返回后调用 | ❌ | ✅ |
| 类型推断 | ✅ | ✅ |
| 性能 | 相同 | 相同 |

## 第三部分：条件读取Context

### 3.1 基于条件读取

```jsx
const ThemeContext = createContext('light');
const UserContext = createContext(null);

function ConditionalTheming({ isAuthenticated }) {
  // ✅ use()可以在条件语句中调用
  if (isAuthenticated) {
    const theme = use(ThemeContext);
    const user = use(UserContext);
    
    return (
      <div className={theme}>
        欢迎, {user.name}!
      </div>
    );
  }
  
  // 未登录时不读取Context
  return <div>请先登录</div>;
}

// 对比useContext的实现
function WithUseContext({ isAuthenticated }) {
  // ❌ 必须无条件调用
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  
  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }
  
  return (
    <div className={theme}>
      欢迎, {user.name}!
    </div>
  );
}
```

### 3.2 多分支Context读取

```jsx
const AdminContext = createContext(null);
const UserContext = createContext(null);
const GuestContext = createContext(null);

function RoleBasedComponent({ role }) {
  // ✅ 根据角色读取不同Context
  if (role === 'admin') {
    const admin = use(AdminContext);
    return <AdminPanel admin={admin} />;
  }
  
  if (role === 'user') {
    const user = use(UserContext);
    return <UserPanel user={user} />;
  }
  
  if (role === 'guest') {
    const guest = use(GuestContext);
    return <GuestPanel guest={guest} />;
  }
  
  return <div>无效角色</div>;
}

// 使用
<AdminContext.Provider value={adminData}>
  <UserContext.Provider value={userData}>
    <GuestContext.Provider value={guestData}>
      <RoleBasedComponent role="admin" />
    </GuestContext.Provider>
  </UserContext.Provider>
</AdminContext.Provider>
```

### 3.3 可选Context

```jsx
const FeatureContext = createContext(null);

function OptionalFeature({ enableFeature }) {
  if (!enableFeature) {
    return <div>功能未启用</div>;
  }
  
  // ✅ 只在需要时读取Context
  const feature = use(FeatureContext);
  
  if (!feature) {
    return <div>功能不可用</div>;
  }
  
  return (
    <div>
      <h3>{feature.name}</h3>
      <p>{feature.description}</p>
    </div>
  );
}
```

## 第四部分：循环中读取Context

### 3.1 动态Context读取

```jsx
// 多个Context数组
const contexts = [
  ThemeContext,
  LanguageContext,
  UserContext
];

function MultiContextReader({ enabledContexts }) {
  const values = enabledContexts.map(contextIndex => {
    // ✅ use()可以在map中调用
    const context = contexts[contextIndex];
    return use(context);
  });
  
  return (
    <div>
      {values.map((value, index) => (
        <div key={index}>
          Context {index}: {JSON.stringify(value)}
        </div>
      ))}
    </div>
  );
}
```

### 4.2 列表项Context

```jsx
const ItemContext = createContext(null);

function ItemList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <ItemContext.Provider key={item.id} value={item}>
          <ListItem />
        </ItemContext.Provider>
      ))}
    </ul>
  );
}

function ListItem() {
  // ✅ 在循环渲染的组件中使用
  const item = use(ItemContext);
  
  return (
    <li>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
    </li>
  );
}
```

## 第五部分：嵌套Context处理

### 5.1 多层Context

```jsx
const ThemeContext = createContext('light');
const LanguageContext = createContext('zh-CN');
const UserContext = createContext(null);
const SettingsContext = createContext({});

function NestedContextComponent() {
  // ✅ 清晰地读取多个Context
  const theme = use(ThemeContext);
  const language = use(LanguageContext);
  const user = use(UserContext);
  const settings = use(SettingsContext);
  
  return (
    <div className={theme}>
      <h1>{language === 'zh-CN' ? '你好' : 'Hello'}, {user.name}</h1>
      <p>字体大小: {settings.fontSize}px</p>
    </div>
  );
}

// 提供所有Context
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <LanguageContext.Provider value="zh-CN">
        <UserContext.Provider value={{ name: '张三' }}>
          <SettingsContext.Provider value={{ fontSize: 16 }}>
            <NestedContextComponent />
          </SettingsContext.Provider>
        </UserContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
```

### 5.2 Context组合

```jsx
// 创建组合Provider
function AppProviders({ children }) {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');
  const [user, setUser] = useState(null);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        <UserContext.Provider value={{ user, setUser }}>
          {children}
        </UserContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}

// 使用组合Hook
function useAppContext() {
  const theme = use(ThemeContext);
  const language = use(LanguageContext);
  const user = use(UserContext);
  
  return { theme, language, user };
}

function Component() {
  const { theme, language, user } = useAppContext();
  return <div>...</div>;
}
```

### 5.3 选择性Context读取

```jsx
function SmartComponent({ needsAuth, needsTheme, needsSettings }) {
  let user, theme, settings;
  
  // ✅ 按需读取Context
  if (needsAuth) {
    user = use(UserContext);
  }
  
  if (needsTheme) {
    theme = use(ThemeContext);
  }
  
  if (needsSettings) {
    settings = use(SettingsContext);
  }
  
  return (
    <div className={theme}>
      {user && <span>用户: {user.name}</span>}
      {settings && <span>设置: {JSON.stringify(settings)}</span>}
    </div>
  );
}
```

## 第六部分：性能优化

### 6.1 Context分离

```jsx
// ❌ 问题：所有数据在一个Context
const AppContext = createContext({
  user: null,
  theme: 'light',
  language: 'zh-CN',
  settings: {},
  // 更多数据...
});

// 任何数据变化都会导致所有消费组件重渲染

// ✅ 解决：拆分成多个Context
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const LanguageContext = createContext('zh-CN');
const SettingsContext = createContext({});

// 组件只订阅需要的Context
function ThemedButton() {
  const theme = use(ThemeContext);  // 只在theme变化时重渲染
  return <button className={theme}>按钮</button>;
}
```

### 6.2 Context值优化

```jsx
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  // ❌ 每次渲染创建新对象
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
  
  // ✅ 使用useMemo缓存value
  const userValue = useMemo(() => ({ user, setUser }), [user]);
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <UserContext.Provider value={userValue}>
      <ThemeContext.Provider value={themeValue}>
        {children}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

### 6.3 选择器模式

```jsx
// 创建带选择器的Context
const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    posts: [],
    comments: [],
    settings: {}
  });
  
  return (
    <StoreContext.Provider value={state}>
      {children}
    </StoreContext.Provider>
  );
}

// 自定义Hook with selector
function useStore(selector) {
  const store = use(StoreContext);
  return useMemo(() => selector(store), [store, selector]);
}

// 使用
function UserName() {
  // 只订阅user部分
  const userName = useStore(store => store.user?.name);
  return <div>{userName}</div>;
}

function PostCount() {
  // 只订阅posts.length
  const count = useStore(store => store.posts.length);
  return <div>文章数: {count}</div>;
}
```

## 第七部分：实战案例

### 7.1 主题系统

```jsx
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      <div className={`app-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// 主题切换按钮
function ThemeToggle() {
  const { theme, toggleTheme } = use(ThemeContext);
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'} 切换主题
    </button>
  );
}

// 主题化组件
function ThemedCard({ children }) {
  const { theme } = use(ThemeContext);
  
  return (
    <div className={`card card-${theme}`}>
      {children}
    </div>
  );
}
```

### 7.2 多语言系统

```jsx
const translations = {
  'zh-CN': {
    welcome: '欢迎',
    login: '登录',
    logout: '退出'
  },
  'en-US': {
    welcome: 'Welcome',
    login: 'Login',
    logout: 'Logout'
  }
};

const LanguageContext = createContext({
  language: 'zh-CN',
  setLanguage: () => {},
  t: (key) => key
});

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('zh-CN');
  
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key) => translations[language][key] || key
  }), [language]);
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 使用翻译
function WelcomeMessage() {
  const { t } = use(LanguageContext);
  return <h1>{t('welcome')}</h1>;
}

// 语言切换器
function LanguageSelector() {
  const { language, setLanguage } = use(LanguageContext);
  
  return (
    <select value={language} onChange={e => setLanguage(e.target.value)}>
      <option value="zh-CN">中文</option>
      <option value="en-US">English</option>
    </select>
  );
}
```

### 7.3 权限系统

```jsx
const AuthContext = createContext({
  user: null,
  permissions: [],
  hasPermission: () => false
});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  
  const value = useMemo(() => ({
    user,
    permissions,
    hasPermission: (permission) => permissions.includes(permission),
    login: async (credentials) => {
      const userData = await loginAPI(credentials);
      setUser(userData.user);
      setPermissions(userData.permissions);
    },
    logout: () => {
      setUser(null);
      setPermissions([]);
    }
  }), [user, permissions]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 权限检查组件
function ProtectedComponent({ permission, children }) {
  const { hasPermission } = use(AuthContext);
  
  if (!hasPermission(permission)) {
    return <div>无权限访问</div>;
  }
  
  return <>{children}</>;
}

// 条件渲染
function AdminPanel({ showAdmin }) {
  if (!showAdmin) {
    return <div>管理面板已隐藏</div>;
  }
  
  // ✅ 只在需要时读取Context
  const { user, hasPermission } = use(AuthContext);
  
  if (!hasPermission('admin')) {
    return <div>需要管理员权限</div>;
  }
  
  return (
    <div>
      <h2>管理面板</h2>
      <p>管理员: {user.name}</p>
    </div>
  );
}
```

### 7.4 表单Context

```jsx
const FormContext = createContext({
  values: {},
  errors: {},
  touched: {},
  handleChange: () => {},
  handleBlur: () => {},
  handleSubmit: () => {}
});

function FormProvider({ initialValues, onSubmit, children }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const value = useMemo(() => ({
    values,
    errors,
    touched,
    handleChange: (name, value) => {
      setValues(prev => ({ ...prev, [name]: value }));
    },
    handleBlur: (name) => {
      setTouched(prev => ({ ...prev, [name]: true }));
    },
    handleSubmit: (e) => {
      e.preventDefault();
      onSubmit(values);
    }
  }), [values, errors, touched, onSubmit]);
  
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// 表单字段
function FormField({ name, label, required }) {
  const { values, errors, touched, handleChange, handleBlur } = use(FormContext);
  
  const showError = touched[name] && errors[name];
  
  return (
    <div className="form-field">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        value={values[name] || ''}
        onChange={e => handleChange(name, e.target.value)}
        onBlur={() => handleBlur(name)}
      />
      {showError && <span className="error">{errors[name]}</span>}
    </div>
  );
}

// 提交按钮
function SubmitButton({ children }) {
  const { handleSubmit } = use(FormContext);
  
  return (
    <button type="submit" onClick={handleSubmit}>
      {children}
    </button>
  );
}
```

## 注意事项

### 1. 始终提供Provider

```jsx
const ThemeContext = createContext('light');

// ❌ 忘记Provider
function App() {
  return <ThemedButton />;  // 会使用默认值'light'
}

// ✅ 提供Provider
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}
```

### 2. 避免不必要的重渲染

```jsx
// ❌ 每次渲染创建新对象
function BadProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ theme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ✅ 使用稳定的值
function GoodProvider({ children }) {
  const value = useMemo(() => ({ theme: 'dark' }), []);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 3. 合理设置默认值

```jsx
// ✅ 提供有意义的默认值
const UserContext = createContext({
  user: null,
  login: () => console.warn('login not implemented'),
  logout: () => console.warn('logout not implemented')
});

// 这样即使没有Provider也不会报错
```

### 4. 注意Context更新性能

```jsx
// 大型Context更新可能影响性能
const LargeContext = createContext({
  data1: {},
  data2: {},
  // ... 很多数据
});

// ✅ 考虑拆分成多个小Context
const Data1Context = createContext({});
const Data2Context = createContext({});
```

## 常见问题

### Q1: use()和useContext在性能上有区别吗？

**A:** 没有。两者在性能上完全相同，只是use()提供了更灵活的调用方式。

### Q2: 什么时候应该用use()而不是useContext？

**A:** 
- 需要条件读取Context时
- 需要在循环中读取Context时
- 想要统一API（Promise和Context都用use()）

### Q3: use()可以读取没有Provider的Context吗？

**A:** 可以，会返回Context的默认值：

```jsx
const ThemeContext = createContext('light');

function Component() {
  const theme = use(ThemeContext);  // 返回'light'
  return <div>{theme}</div>;
}
```

### Q4: 如何从useContext迁移到use()？

**A:** 直接替换即可：

```jsx
// 迁移前
import { useContext } from 'react';
const theme = useContext(ThemeContext);

// 迁移后
import { use } from 'react';
const theme = use(ThemeContext);
```

## 总结

### use()读取Context的优势

1. **更灵活**：可以在条件、循环中调用
2. **更简洁**：统一的API处理Promise和Context
3. **更安全**：按需读取，避免不必要的依赖
4. **更优雅**：代码更符合实际逻辑

### Context最佳实践

```
✅ 拆分Context避免过度渲染
✅ 使用useMemo缓存Context值
✅ 提供有意义的默认值
✅ 合理组织Provider层级
✅ 按需读取Context
✅ 考虑使用选择器模式
```

### 何时使用use()读取Context

```
✅ 推荐use():
- React 19+项目
- 需要条件读取
- 追求代码统一性
- 新项目

✅ 继续useContext:
- 需要兼容旧版本
- 团队不熟悉use()
- 简单场景无特殊需求
```

use()让Context的使用更加灵活和强大，是React 19的重要改进！
