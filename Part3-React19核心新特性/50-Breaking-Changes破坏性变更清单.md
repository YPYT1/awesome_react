# Breaking Changes破坏性变更

## 学习目标

通过本章学习，你将掌握：

- React 19所有破坏性变更
- 影响范围和解决方案
- 代码迁移指南
- 避免常见陷阱
- TypeScript类型变更
- 第三方库兼容性
- 升级检查清单
- 最佳实践

## 第一部分：已移除的API

### 1.1 ReactDOM.render

```jsx
// ❌ React 18及更早：旧的渲染API
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('root'));

// ✅ React 19：必须使用createRoot
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 迁移步骤：
// 1. 替换导入
// 2. 创建root
// 3. 使用root.render()
```

### 1.2 ReactDOM.hydrate

```jsx
// ❌ React 18：旧的hydrate API
import ReactDOM from 'react-dom';

ReactDOM.hydrate(<App />, document.getElementById('root'));

// ✅ React 19：使用hydrateRoot
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(document.getElementById('root'), <App />);

// SSR应用迁移：
// 1. 服务器端保持不变
// 2. 客户端使用hydrateRoot
```

### 1.3 ReactDOM.unmountComponentAtNode

```jsx
// ❌ React 18：旧的卸载API
import ReactDOM from 'react-dom';

const root = document.getElementById('root');
ReactDOM.render(<App />, root);
// 稍后卸载
ReactDOM.unmountComponentAtNode(root);

// ✅ React 19：使用root.unmount()
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
// 稍后卸载
root.unmount();
```

### 1.4 defaultProps（函数组件）

```jsx
// ❌ React 18：defaultProps
function Button({ size = 'medium', children }) {
  return <button className={`btn-${size}`}>{children}</button>;
}

Button.defaultProps = {
  size: 'medium'
};

// ✅ React 19：使用默认参数
function Button({ size = 'medium', children }) {
  return <button className={`btn-${size}`}>{children}</button>;
}

// 注意：类组件的defaultProps仍然支持
class Button extends React.Component {
  static defaultProps = {
    size: 'medium'
  };
  
  render() {
    return <button>{this.props.children}</button>;
  }
}
```

### 1.5 propTypes

```jsx
// ❌ React 18：内置propTypes支持
import PropTypes from 'prop-types';

function User({ name, age }) {
  return <div>{name}: {age}</div>;
}

User.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number
};

// ✅ React 19：使用TypeScript
interface UserProps {
  name: string;
  age?: number;
}

function User({ name, age }: UserProps) {
  return <div>{name}: {age}</div>;
}

// 或者继续使用prop-types库（需要单独安装）
import PropTypes from 'prop-types';

User.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number
};
```

### 1.6 Legacy Context API

```jsx
// ❌ React 18：旧的Context API
import PropTypes from 'prop-types';

class Parent extends React.Component {
  static childContextTypes = {
    theme: PropTypes.string
  };
  
  getChildContext() {
    return { theme: 'dark' };
  }
  
  render() {
    return <Child />;
  }
}

class Child extends React.Component {
  static contextTypes = {
    theme: PropTypes.string
  };
  
  render() {
    return <div>Theme: {this.context.theme}</div>;
  }
}

// ✅ React 19：使用新的Context API
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function Parent() {
  return (
    <ThemeContext value="dark">
      <Child />
    </ThemeContext>
  );
}

function Child() {
  const theme = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}
```

## 第二部分：API行为变更

### 2.1 ref清理函数

```jsx
// ❌ React 18：ref callback无返回值
function Component() {
  const ref = useCallback((node) => {
    if (node) {
      // 设置
      node.focus();
    } else {
      // 清理（组件卸载时node为null）
      // 但无法执行清理逻辑
    }
  }, []);
  
  return <input ref={ref} />;
}

// ✅ React 19：ref callback可以返回清理函数
function Component() {
  const ref = useCallback((node) => {
    if (node) {
      node.focus();
      
      // 返回清理函数
      return () => {
        console.log('Cleanup');
        node.blur();
      };
    }
  }, []);
  
  return <input ref={ref} />;
}

// 清理函数会在以下时机调用：
// 1. 组件卸载时
// 2. ref改变时
// 3. ref callback重新执行前
```

### 2.2 Context.Provider简化

```jsx
// ❌ React 18：必须使用Provider组件
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

// ✅ React 19：Context即Provider
const ThemeContext = createContext('light');

function App() {
  // 两种方式都可以
  
  // 方式1：新语法（推荐）
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
  
  // 方式2：旧语法（仍然支持）
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}
```

### 2.3 useReducer初始化

```jsx
// ❌ React 18：可以省略初始action
const [state, dispatch] = useReducer(reducer, initialState);

// ✅ React 19：行为更严格
// 如果reducer期望action参数，必须提供
function reducer(state, action) {
  // action不能为undefined
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    default:
      return state;
  }
}

// 正确用法
const [state, dispatch] = useReducer(
  reducer,
  0,
  // 如果需要初始化函数，必须返回有效的state
  (initialState) => initialState
);
```

### 2.4 StrictMode更严格

```jsx
// React 19的StrictMode更严格

// ❌ 会报错：副作用在渲染中执行
function Component() {
  // 不要在渲染中直接修改DOM
  document.title = 'New Title';  // 错误！
  
  return <div>Content</div>;
}

// ✅ 使用useEffect
function Component() {
  useEffect(() => {
    document.title = 'New Title';
  }, []);
  
  return <div>Content</div>;
}

// ❌ 会报错：渲染中的异步操作
function Component() {
  fetch('/api/data');  // 错误！
  return <div>Content</div>;
}

// ✅ 使用useEffect或use()
function Component() {
  const dataPromise = fetch('/api/data').then(r => r.json());
  const data = use(dataPromise);
  
  return <div>{data}</div>;
}
```

## 第三部分：TypeScript类型变更

### 3.1 ref类型更新

```typescript
// ❌ React 18：ref类型
import { Ref } from 'react';

interface ButtonProps {
  ref?: Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

// ✅ React 19：ref作为普通prop
interface ButtonProps {
  ref?: React.RefObject<HTMLButtonElement> | 
        ((instance: HTMLButtonElement | null) => void | (() => void));
  children: React.ReactNode;
}

// 或者使用新的类型工具
interface ButtonProps {
  ref?: React.ComponentRef<'button'>;
  children: React.ReactNode;
}
```

### 3.2 forwardRef不再需要

```typescript
// ❌ React 18：必须用forwardRef
import { forwardRef } from 'react';

interface InputProps {
  placeholder?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);

// ✅ React 19：ref作为普通prop
interface InputProps {
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
}

function Input({ ref, ...props }: InputProps) {
  return <input ref={ref} {...props} />;
}
```

### 3.3 Context类型简化

```typescript
// ❌ React 18：需要定义Provider类型
import { createContext, Provider } from 'react';

interface Theme {
  mode: 'light' | 'dark';
  colors: Record<string, string>;
}

const ThemeContext = createContext<Theme | undefined>(undefined);

type ThemeProviderProps = {
  value: Theme;
  children: React.ReactNode;
};

// ✅ React 19：Context即Provider
const ThemeContext = createContext<Theme | undefined>(undefined);

// 直接使用
<ThemeContext value={theme}>
  <App />
</ThemeContext>

// 类型自动推导
```

### 3.4 Hook返回类型更新

```typescript
// use()的类型定义
function use<T>(promise: Promise<T>): T;
function use<T>(context: React.Context<T>): T;

// useActionState的类型
function useActionState<State, Payload>(
  action: (state: State, payload: Payload) => Promise<State>,
  initialState: State,
  permalink?: string
): [state: State, dispatch: (payload: Payload) => void, isPending: boolean];

// useOptimistic的类型
function useOptimistic<State, Action>(
  passthrough: State,
  reducer: (state: State, action: Action) => State
): [optimisticState: State, dispatch: (action: Action) => void];
```

## 第四部分：服务器端渲染变更

### 4.1 renderToString变更

```javascript
// ❌ React 18：同步renderToString
import { renderToString } from 'react-dom/server';

app.get('/', (req, res) => {
  const html = renderToString(<App />);
  res.send(`<!DOCTYPE html><html><body>${html}</body></html>`);
});

// ✅ React 19：推荐使用流式渲染
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    }
  });
});

// renderToString仍然支持，但：
// - 不支持Suspense
// - 不支持Server Components
// - 性能较差
```

### 4.2 hydration警告更严格

```jsx
// React 19对hydration不匹配更严格

// ❌ 会报错：服务器和客户端不一致
// server.js
<div>{new Date().toISOString()}</div>

// client.js
<div>{new Date().toISOString()}</div>

// ✅ 使用suppressHydrationWarning
<div suppressHydrationWarning>
  {new Date().toISOString()}
</div>

// ✅ 或者确保一致性
function ServerTime() {
  const [time, setTime] = useState(() => {
    // 使用传递的时间
    return typeof window !== 'undefined'
      ? window.__INITIAL_TIME__
      : new Date().toISOString();
  });
  
  return <div>{time}</div>;
}
```

## 第五部分：第三方库兼容性

### 5.1 常见库的兼容性

```
✅ 完全兼容：
- React Router v6.4+
- Redux Toolkit v1.9+
- React Query v5+
- Zustand v4+
- Formik v2.4+

⚠️ 需要更新：
- React Router v5 → v6
- Redux v4 → Redux Toolkit
- React Query v4 → v5

❌ 暂不兼容：
- 一些旧的HOC库
- 使用Legacy Context的库
- 依赖旧渲染API的库
```

### 5.2 检查库兼容性

```bash
# 检查依赖是否与React 19兼容
npx react-check-deps

# 或者手动检查
npm list react react-dom

# 查看库的React版本要求
npm info react-router-dom peerDependencies
```

### 5.3 迁移常见库

```jsx
// React Router v5 → v6
// ❌ v5
import { Switch, Route } from 'react-router-dom';

<Switch>
  <Route path="/about" component={About} />
  <Route path="/" component={Home} />
</Switch>

// ✅ v6
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/about" element={<About />} />
  <Route path="/" element={<Home />} />
</Routes>

// Redux连接组件
// ❌ 旧方式
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(UserProfile);

// ✅ 新方式（推荐）
import { useSelector } from 'react-redux';

function UserProfile() {
  const user = useSelector(state => state.user);
  return <div>{user.name}</div>;
}
```

## 第六部分：升级检查清单

### 6.1 代码检查

```bash
# 使用自动化工具检查
npx react-codemod react-19 src/

# 检查项目：
✅ ReactDOM.render → createRoot
✅ ReactDOM.hydrate → hydrateRoot
✅ forwardRef → 普通ref prop
✅ Context.Provider → Context
✅ defaultProps → 默认参数
✅ propTypes → TypeScript
```

### 6.2 手动检查清单

```
[ ] 所有ReactDOM.render已替换
[ ] 所有ReactDOM.hydrate已替换
[ ] 移除不必要的forwardRef
[ ] 简化Context.Provider
[ ] 检查ref callback清理
[ ] 更新TypeScript类型
[ ] 测试StrictMode
[ ] 检查第三方库兼容性
[ ] 运行所有测试
[ ] 检查SSR hydration
[ ] 性能测试
[ ] 用户验收测试
```

### 6.3 测试验证

```javascript
// 测试破坏性变更
describe('React 19 Breaking Changes', () => {
  test('createRoot API', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    
    act(() => {
      root.render(<App />);
    });
    
    expect(container.textContent).toBe('App');
    
    act(() => {
      root.unmount();
    });
  });
  
  test('ref cleanup', () => {
    const cleanupSpy = jest.fn();
    
    function Component() {
      const ref = useCallback((node) => {
        if (node) {
          return cleanupSpy;
        }
      }, []);
      
      return <div ref={ref} />;
    }
    
    const { unmount } = render(<Component />);
    unmount();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });
  
  test('Context as Provider', () => {
    const Context = createContext('default');
    
    function Consumer() {
      const value = useContext(Context);
      return <div>{value}</div>;
    }
    
    const { getByText } = render(
      <Context value="test">
        <Consumer />
      </Context>
    );
    
    expect(getByText('test')).toBeInTheDocument();
  });
});
```

## 第七部分：详细迁移指南

### 7.1 createRoot完整迁移

```javascript
// 完整的迁移示例

// ❌ React 18代码
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// 开发环境
if (process.env.NODE_ENV === 'development') {
  ReactDOM.render(<App />, document.getElementById('root'));
} else {
  ReactDOM.hydrate(<App />, document.getElementById('root'));
}

// ✅ React 19迁移后
import React from 'react';
import { createRoot } from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container.hasChildNodes()) {
  // SSR情况使用hydrate
  hydrateRoot(container, <App />);
} else {
  // 普通渲染使用createRoot
  const root = createRoot(container);
  root.render(<App />);
}

// 进阶：错误处理
const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

try {
  if (container.hasChildNodes()) {
    hydrateRoot(container, <App />, {
      onRecoverableError: (error) => {
        console.error('Hydration error:', error);
        // 上报错误
        reportError(error);
      }
    });
  } else {
    const root = createRoot(container, {
      onRecoverableError: (error) => {
        console.error('Render error:', error);
        reportError(error);
      }
    });
    root.render(<App />);
  }
} catch (error) {
  console.error('Failed to render:', error);
  // 显示错误UI
  container.innerHTML = '<div>Failed to load app</div>';
}
```

### 7.2 ref迁移完整示例

```typescript
// 复杂的ref迁移场景

// ❌ React 18：复杂的forwardRef
import { forwardRef, useImperativeHandle, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
}

interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, autoPlay }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useImperativeHandle(ref, () => ({
      play() {
        videoRef.current?.play();
      },
      pause() {
        videoRef.current?.pause();
      },
      seek(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      }
    }));
    
    return <video ref={videoRef} src={src} autoPlay={autoPlay} />;
  }
);

// ✅ React 19：简化的ref
interface VideoPlayerProps {
  ref?: React.Ref<VideoPlayerRef>;
  src: string;
  autoPlay?: boolean;
}

interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

function VideoPlayer({ ref, src, autoPlay }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 仍然可以使用useImperativeHandle
  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current?.play();
    },
    pause() {
      videoRef.current?.pause();
    },
    seek(time: number) {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  }));
  
  return <video ref={videoRef} src={src} autoPlay={autoPlay} />;
}

// 使用示例
function App() {
  const playerRef = useRef<VideoPlayerRef>(null);
  
  return (
    <>
      <VideoPlayer ref={playerRef} src="/video.mp4" />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={() => playerRef.current?.pause()}>Pause</button>
    </>
  );
}

// ref清理函数示例
function ScrollTracker() {
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const handleScroll = () => {
        console.log('Scrolled:', node.scrollTop);
      };
      
      node.addEventListener('scroll', handleScroll);
      
      // React 19新特性：返回清理函数
      return () => {
        node.removeEventListener('scroll', handleScroll);
        console.log('Cleanup scroll listener');
      };
    }
  }, []);
  
  return <div ref={ref} style={{ height: 200, overflow: 'auto' }}>
    {/* content */}
  </div>;
}
```

### 7.3 Context迁移完整示例

```typescript
// 复杂的Context迁移

// ❌ React 18：复杂的Context设置
import { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontSize: number;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>({
    mode: 'light',
    primaryColor: '#007bff',
    fontSize: 16
  });
  
  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };
  
  const value = { theme, setTheme, toggleMode };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// ✅ React 19：简化的Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>({
    mode: 'light',
    primaryColor: '#007bff',
    fontSize: 16
  });
  
  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };
  
  const value = { theme, setTheme, toggleMode };
  
  // 方式1：使用简化语法（推荐）
  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
  
  // 方式2：仍然可以用Provider（向后兼容）
  // return (
  //   <ThemeContext.Provider value={value}>
  //     {children}
  //   </ThemeContext.Provider>
  // );
}

// Hook保持不变
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 多Context嵌套简化
// ❌ React 18：嵌套Provider
function App() {
  return (
    <ThemeContext.Provider value={themeValue}>
      <UserContext.Provider value={userValue}>
        <I18nContext.Provider value={i18nValue}>
          <RouterContext.Provider value={routerValue}>
            <MainApp />
          </RouterContext.Provider>
        </I18nContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// ✅ React 19：更清晰的嵌套
function App() {
  return (
    <ThemeContext value={themeValue}>
      <UserContext value={userValue}>
        <I18nContext value={i18nValue}>
          <RouterContext value={routerValue}>
            <MainApp />
          </RouterContext>
        </I18nContext>
      </UserContext>
    </ThemeContext>
  );
}
```

### 7.4 StrictMode影响处理

```jsx
// StrictMode在React 19中更严格

// ❌ React 18：可能通过的代码
function Component() {
  // 直接修改props（不推荐但可能不报错）
  props.data = [...props.data, newItem];
  
  // 渲染中设置定时器
  setTimeout(() => {
    setState(newState);
  }, 1000);
  
  // 渲染中的fetch
  fetch('/api/data').then(setData);
  
  return <div>{data}</div>;
}

// ✅ React 19：必须修复
function Component({ data: initialData }) {
  const [data, setData] = useState(initialData);
  const [fetchedData, setFetchedData] = useState(null);
  
  // 副作用放在useEffect中
  useEffect(() => {
    const timer = setTimeout(() => {
      setData([...data, newItem]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [data]);
  
  // 数据获取使用use()或useEffect
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setFetchedData);
  }, []);
  
  return <div>{fetchedData}</div>;
}

// 或使用React 19的use() Hook
function Component() {
  const dataPromise = fetch('/api/data').then(r => r.json());
  const data = use(dataPromise);
  
  return <div>{data}</div>;
}

// StrictMode双重调用处理
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // ❌ 不应该依赖只调用一次
    console.log('Effect ran');  // StrictMode下会调用两次
    
    // ✅ 应该是幂等的
    const controller = new AbortController();
    
    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(setData);
    
    return () => {
      controller.abort();  // 清理
    };
  }, []);
}
```

### 7.5 服务器端渲染迁移

```javascript
// 完整的SSR迁移

// ❌ React 18 SSR
// server.js
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const html = renderToString(<App url={req.url} />);
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});

// client.js
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.hydrate(<App />, document.getElementById('root'));

// ✅ React 19 SSR（流式渲染）
// server.js
import express from 'express';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(<App url={req.url} />, {
    bootstrapScripts: ['/client.js'],
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    },
    onShellError(error) {
      res.statusCode = 500;
      res.send('<!DOCTYPE html><html><body>Server Error</body></html>');
    },
    onError(error) {
      console.error('SSR error:', error);
    }
  });
  
  // 超时处理
  setTimeout(() => {
    abort();
  }, 10000);
});

// client.js
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document.getElementById('root'), <App />);

// 高级：支持Suspense的SSR
// server.js
app.get('*', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <React.StrictMode>
      <App url={req.url} />
    </React.StrictMode>,
    {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        // Shell准备好（不等待Suspense）
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      onAllReady() {
        // 所有内容准备好（包括Suspense）
        // 可用于爬虫
      },
      onError(error) {
        console.error(error);
      }
    }
  );
});

// 带错误恢复的hydration
// client.js
import { hydrateRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

hydrateRoot(container, <App />, {
  onRecoverableError: (error, errorInfo) => {
    console.error('Hydration error:', error);
    console.log('Component stack:', errorInfo.componentStack);
    
    // 上报错误
    reportError({
      type: 'hydration',
      error: error.message,
      stack: errorInfo.componentStack
    });
  }
});
```

### 7.6 TypeScript严格类型迁移

```typescript
// TypeScript严格模式下的迁移

// ❌ React 18：宽松的类型
import { FC, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  onClick?: Function;  // 宽松
  ref?: any;  // 太宽松
}

const Button: FC<Props> = (props) => {
  return <button {...props} />;
};

// ✅ React 19：严格的类型
import { ReactNode, MouseEventHandler, ComponentPropsWithRef } from 'react';

interface ButtonProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;  // 具体类型
  ref?: React.Ref<HTMLButtonElement>;  // 正确的ref类型
  variant?: 'primary' | 'secondary';  // 精确类型
}

function Button({ ref, variant = 'primary', ...props }: ButtonProps) {
  return <button ref={ref} className={`btn-${variant}`} {...props} />;
}

// 泛型组件的类型
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  ref?: React.Ref<HTMLUListElement>;
}

function List<T>({ items, renderItem, ref }: ListProps<T>) {
  return (
    <ul ref={ref}>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用ComponentPropsWithRef
type DivProps = ComponentPropsWithRef<'div'>;
type ButtonProps = ComponentPropsWithRef<'button'>;
type CustomComponentProps = ComponentPropsWithRef<typeof CustomComponent>;

// 新Hook的类型
import { use, useActionState, useOptimistic } from 'react';

// use() Hook类型
function DataComponent() {
  const dataPromise: Promise<{ id: number; name: string }> = fetchData();
  const data = use(dataPromise);  // 类型自动推断
  
  return <div>{data.name}</div>;
}

// useActionState类型
type LoginState = {
  error?: string;
  success?: boolean;
};

function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (prevState, formData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      try {
        await login(email, password);
        return { success: true };
      } catch (error) {
        return { error: (error as Error).message };
      }
    },
    { success: false }
  );
  
  return <form action={formAction}>...</form>;
}

// useOptimistic类型
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic<Todo[], Todo>(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  return <div>...</div>;
}
```

## 第八部分：自动化迁移工具

### 8.1 React Codemod工具

```bash
# 安装codemod
npm install -g @react-codemod/cli

# 自动迁移createRoot
npx @react-codemod/cli react-19/create-root src/

# 自动迁移ref
npx @react-codemod/cli react-19/remove-forwardref src/

# 自动迁移Context
npx @react-codemod/cli react-19/context-provider src/

# 批量运行所有迁移
npx @react-codemod/cli react-19/all src/
```

### 8.2 自定义迁移脚本

```javascript
// custom-migration.js
const fs = require('fs');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// 迁移ReactDOM.render到createRoot
function migrateToCreateRoot(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  let needsCreateRoot = false;
  
  traverse(ast, {
    CallExpression(path) {
      // 查找ReactDOM.render
      if (
        path.node.callee.type === 'MemberExpression' &&
        path.node.callee.object.name === 'ReactDOM' &&
        path.node.callee.property.name === 'render'
      ) {
        needsCreateRoot = true;
        
        const [element, container] = path.node.arguments;
        
        // 替换为createRoot(container).render(element)
        const createRootCall = t.callExpression(
          t.identifier('createRoot'),
          [container]
        );
        
        const renderCall = t.callExpression(
          t.memberExpression(createRootCall, t.identifier('render')),
          [element]
        );
        
        path.replaceWith(renderCall);
      }
    },
    
    ImportDeclaration(path) {
      // 更新import
      if (path.node.source.value === 'react-dom') {
        if (needsCreateRoot) {
          path.node.source.value = 'react-dom/client';
          
          const createRootImport = t.importSpecifier(
            t.identifier('createRoot'),
            t.identifier('createRoot')
          );
          
          path.node.specifiers.push(createRootImport);
        }
      }
    }
  });
  
  return generate(ast).code;
}

// 运行迁移
const files = fs.readdirSync('./src').filter(f => f.endsWith('.jsx') || f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = `./src/${file}`;
  const code = fs.readFileSync(filePath, 'utf-8');
  const migratedCode = migrateToCreateRoot(code);
  fs.writeFileSync(filePath, migratedCode);
  console.log(`✓ Migrated ${file}`);
});
```

### 8.3 验证工具

```javascript
// validate-migration.js
const fs = require('fs');
const path = require('path');

const issues = [];

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 检查是否还在使用ReactDOM.render
  if (content.includes('ReactDOM.render')) {
    issues.push({
      file: filePath,
      issue: 'Still using ReactDOM.render',
      line: findLineNumber(content, 'ReactDOM.render')
    });
  }
  
  // 检查是否还在使用ReactDOM.hydrate
  if (content.includes('ReactDOM.hydrate')) {
    issues.push({
      file: filePath,
      issue: 'Still using ReactDOM.hydrate',
      line: findLineNumber(content, 'ReactDOM.hydrate')
    });
  }
  
  // 检查是否还在使用defaultProps
  if (content.match(/\w+\.defaultProps\s*=/)) {
    issues.push({
      file: filePath,
      issue: 'Still using defaultProps on function component',
      line: findLineNumber(content, '.defaultProps')
    });
  }
  
  // 检查是否还在使用Legacy Context
  if (content.includes('getChildContext') || content.includes('childContextTypes')) {
    issues.push({
      file: filePath,
      issue: 'Still using Legacy Context API',
      line: findLineNumber(content, 'getChildContext')
    });
  }
}

function findLineNumber(content, search) {
  const lines = content.split('\n');
  return lines.findIndex(line => line.includes(search)) + 1;
}

// 递归检查所有文件
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.ts')) {
      validateFile(filePath);
    }
  });
}

walkDir('./src');

if (issues.length > 0) {
  console.log('\n❌ Migration Issues Found:\n');
  issues.forEach(issue => {
    console.log(`File: ${issue.file}`);
    console.log(`Line: ${issue.line}`);
    console.log(`Issue: ${issue.issue}`);
    console.log('---');
  });
  process.exit(1);
} else {
  console.log('✅ All files migrated successfully!');
}
```

## 注意事项

### 1. 渐进式迁移

```
不要一次性修改所有破坏性变更：

阶段1：关键API
- createRoot/hydrateRoot
- 确保应用运行

阶段2：类型更新
- TypeScript类型
- 编译通过

阶段3：代码优化
- 移除forwardRef
- 简化Context
- 添加ref清理

阶段4：测试验证
- 全面测试
- 性能测试
```

### 2. 保持兼容性

```jsx
// 创建兼容层
function createRootCompat(container) {
  if (typeof createRoot !== 'undefined') {
    // React 19
    return createRoot(container);
  } else {
    // React 18
    return {
      render: (element) => ReactDOM.render(element, container),
      unmount: () => ReactDOM.unmountComponentAtNode(container)
    };
  }
}
```

### 3. 监控和回滚

```javascript
// 监控破坏性变更影响
function monitorBreakingChanges() {
  // 监控错误
  window.addEventListener('error', (event) => {
    if (event.message.includes('createRoot')) {
      sendAlert('createRoot API error', event);
    }
  });
  
  // 监控性能
  if (performance.getEntriesByType('mark').length === 0) {
    console.warn('Performance marks missing');
  }
}
```

### 4. 团队协作

```
迁移时的团队协作建议：

✅ 指定迁移负责人
✅ 创建迁移文档
✅ 进行代码审查
✅ 定期同步进度
✅ 记录遇到的问题
✅ 分享解决方案
```

### 5. 回滚准备

```bash
# 准备回滚方案

# 1. 保留React 18构建
npm run build:react18

# 2. 创建回滚脚本
cat > rollback.sh << 'EOF'
#!/bin/bash
echo "Rolling back to React 18..."
git checkout backup/pre-react-19
npm install
npm run build
npm run deploy
echo "Rollback complete"
EOF

chmod +x rollback.sh

# 3. 测试回滚流程
./rollback.sh --dry-run
```

## 常见问题

### Q1: 必须立即修复所有破坏性变更吗？

**A:** 不需要立即全部修复，建议分阶段迁移：

```
优先级排序：

P0 - 必须立即修复：
✅ createRoot/hydrateRoot（应用无法启动）
✅ 移除的API（会直接报错）

P1 - 尽快修复：
✅ TypeScript类型错误（影响开发）
✅ 弃用警告（未来会移除）

P2 - 逐步优化：
✅ forwardRef移除（性能优化）
✅ Context简化（代码清晰）
✅ ref清理函数（内存优化）

P3 - 可选优化：
✅ 代码风格统一
✅ 最佳实践应用
```

实际示例：

```javascript
// 阶段1：先让应用跑起来
// index.js
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')).render(<App />);

// 阶段2：修复TypeScript错误
// 逐个组件修复类型

// 阶段3：代码优化
// 批量移除forwardRef，简化Context等
```

### Q2: 如何处理第三方库的破坏性变更兼容问题？

**A:** 第三方库兼容问题的解决方案：

```javascript
// 方法1：等待库更新
// 检查库的React 19兼容性
npm info react-select peerDependencies

// 方法2：使用版本覆盖（谨慎使用）
// package.json
{
  "overrides": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}

// 方法3：创建适配器
// 为不兼容的库创建wrapper
import { forwardRef } from 'react';
import OldLibComponent from 'old-lib';

// 如果库还在使用forwardRef但React 19已移除支持
const AdaptedComponent = forwardRef((props, ref) => {
  return <OldLibComponent {...props} innerRef={ref} />;
});

// 方法4：Fork并修复
// 如果库长期不维护
git clone https://github.com/author/old-lib
# 修复兼容性
# 发布为scoped package
npm publish @yourorg/old-lib-fixed

// 方法5：寻找替代库
// 例如从react-router v5迁移到v6
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 第三方库兼容性检查清单
const checkList = {
  routing: 'react-router-dom@6+',
  forms: 'react-hook-form@7+',
  state: 'redux@5+ / zustand@4+',
  ui: 'material-ui@5+ / antd@5+',
  animation: 'framer-motion@11+',
  charts: 'recharts@2.12+ / visx@3+'
};
```

### Q3: StrictMode在React 19中为何更严格？如何应对？

**A:** React 19的StrictMode会更积极地发现问题：

```jsx
// 问题1：渲染中的副作用
// ❌ 会被StrictMode检测到
function BadComponent({ id }) {
  // 直接在渲染中发起请求
  fetch(`/api/user/${id}`).then(setUser);
  return <div>{user?.name}</div>;
}

// ✅ 正确做法
function GoodComponent({ id }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`/api/user/${id}`, { signal: controller.signal })
      .then(res => res.json())
      .then(setUser);
    
    return () => controller.abort();
  }, [id]);
  
  return <div>{user?.name}</div>;
}

// 或使用React 19的use() Hook
function ModernComponent({ id }) {
  const userPromise = useMemo(
    () => fetch(`/api/user/${id}`).then(r => r.json()),
    [id]
  );
  const user = use(userPromise);
  
  return <div>{user.name}</div>;
}

// 问题2：不纯的渲染
// ❌ 会被检测
let renderCount = 0;
function BadCounter() {
  renderCount++;  // 修改外部变量
  return <div>Rendered {renderCount} times</div>;
}

// ✅ 正确做法
function GoodCounter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(c => c + 1);
  }, []);
  
  return <div>Rendered {count} times</div>;
}

// 问题3：不正确的依赖
// ❌ 会被检测
function BadEffect() {
  const obj = { id: 1 };  // 每次渲染创建新对象
  
  useEffect(() => {
    fetchData(obj.id);
  }, [obj]);  // obj每次都不同，导致无限循环
}

// ✅ 正确做法
function GoodEffect() {
  const id = 1;
  
  useEffect(() => {
    fetchData(id);
  }, [id]);  // 使用原始值
}

// StrictMode调试技巧
if (process.env.NODE_ENV === 'development') {
  // 临时禁用StrictMode进行调试
  // 但最终必须修复问题
  root.render(<App />);  // 而不是 <StrictMode><App /></StrictMode>
}
```

### Q4: 如何验证迁移是否成功？

**A:** 完整的验证流程：

```javascript
// 1. 自动化测试验证
// migration-tests.spec.js
describe('React 19 Migration', () => {
  it('should use createRoot instead of ReactDOM.render', () => {
    const code = fs.readFileSync('src/index.js', 'utf-8');
    expect(code).not.toContain('ReactDOM.render');
    expect(code).toContain('createRoot');
  });
  
  it('should not use defaultProps on function components', () => {
    const files = glob.sync('src/**/*.{js,jsx,ts,tsx}');
    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf-8');
      const hasFunctionComponent = /^function \w+\(/.test(code);
      const hasDefaultProps = /\w+\.defaultProps\s*=/.test(code);
      
      if (hasFunctionComponent && hasDefaultProps) {
        throw new Error(`${file} has defaultProps on function component`);
      }
    });
  });
  
  it('should not use Legacy Context', () => {
    const code = findInFiles(['getChildContext', 'childContextTypes']);
    expect(code).toHaveLength(0);
  });
});

// 2. 运行时验证
// runtime-validator.js
function validateReact19() {
  const checks = [];
  
  // 检查React版本
  if (!React.version.startsWith('19')) {
    checks.push({
      level: 'error',
      message: `Wrong React version: ${React.version}`
    });
  }
  
  // 检查是否使用了createRoot
  if (typeof window.__REACT_ROOT__ === 'undefined') {
    checks.push({
      level: 'error',
      message: 'App not rendered with createRoot'
    });
  }
  
  // 检查是否有hydration错误
  window.addEventListener('error', (event) => {
    if (event.message.includes('Hydration')) {
      checks.push({
        level: 'error',
        message: 'Hydration mismatch detected',
        details: event.message
      });
    }
  });
  
  return checks;
}

// 在应用启动时运行
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    const issues = validateReact19();
    if (issues.length > 0) {
      console.error('Migration issues:', issues);
    } else {
      console.log('✅ React 19 migration successful');
    }
  }, 2000);
}

// 3. 性能验证
// performance-validator.js
function comparePerformance() {
  // 收集性能指标
  const metrics = {
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
    fid: performance.getEntriesByType('first-input')[0]?.processingStart,
    cls: getCLS(),
    ttfb: performance.getEntriesByType('navigation')[0]?.responseStart
  };
  
  // 与React 18基线比较
  const baseline = getBaselineMetrics();
  
  Object.keys(metrics).forEach(key => {
    const current = metrics[key];
    const base = baseline[key];
    const change = ((current - base) / base) * 100;
    
    console.log(`${key}: ${current.toFixed(2)}ms (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`);
  });
}

// 4. E2E测试验证
// e2e/migration.spec.js
test('应用在React 19下正常运行', async ({ page }) => {
  await page.goto('/');
  
  // 检查是否有错误
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // 执行关键用户流程
  await page.click('[data-testid="login-button"]');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('[type="submit"]');
  
  await page.waitForSelector('[data-testid="dashboard"]');
  
  // 验证没有错误
  expect(errors).toHaveLength(0);
});

// 5. 视觉回归测试
// visual-regression.spec.js
test('UI在React 19下保持一致', async ({ page }) => {
  await page.goto('/');
  
  // 截图对比
  const screenshot = await page.screenshot();
  const diff = await compareWithBaseline(screenshot, 'homepage-react-18.png');
  
  expect(diff.percentage).toBeLessThan(0.1);  // 小于0.1%差异
});
```

### Q5: 如何处理SSR中的Breaking Changes？

**A:** SSR特定的迁移策略：

```javascript
// 完整的SSR迁移方案

// 1. 服务器端代码迁移
// server-react-19.js
import { renderToPipeableStream } from 'react-dom/server';
import { ServerRouter } from './router';

app.get('*', async (req, res) => {
  // 预加载数据（可选）
  const initialData = await fetchInitialData(req.url);
  
  let didError = false;
  
  const { pipe, abort } = renderToPipeableStream(
    <ServerRouter url={req.url} initialData={initialData} />,
    {
      bootstrapScripts: ['/client.js'],
      bootstrapScriptContent: `window.__INITIAL_DATA__=${JSON.stringify(initialData)}`,
      
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-Type', 'text/html');
        pipe(res);
      },
      
      onShellError(error) {
        res.statusCode = 500;
        res.send('<!DOCTYPE html><p>Loading...</p>');
      },
      
      onError(error) {
        didError = true;
        console.error('SSR error:', error);
        // 上报错误
        logError(error);
      }
    }
  );
  
  // 设置超时
  setTimeout(() => {
    abort();
  }, 10000);
});

// 2. 客户端Hydration迁移
// client-react-19.js
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from './router';

const initialData = window.__INITIAL_DATA__;
const container = document.getElementById('root');

// 错误边界
class HydrationErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Hydration error:', error, errorInfo);
    
    // 回退到客户端渲染
    import('./client-render').then(({ render }) => {
      render(container, initialData);
    });
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Loading...</div>;
    }
    return this.props.children;
  }
}

// Hydrate with error handling
hydrateRoot(
  container,
  <HydrationErrorBoundary>
    <BrowserRouter initialData={initialData} />
  </HydrationErrorBoundary>,
  {
    onRecoverableError: (error, errorInfo) => {
      console.error('Recoverable hydration error:', error);
      logError({
        type: 'hydration',
        error: error.message,
        componentStack: errorInfo.componentStack
      });
    }
  }
);

// 3. Hydration Mismatch调试
// hydration-debugger.js
function debugHydrationMismatch() {
  // 收集所有hydration错误
  const errors = [];
  
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    
    if (message.includes('Hydration')) {
      errors.push({
        message,
        stack: new Error().stack,
        timestamp: Date.now()
      });
      
      // 提取组件信息
      const componentMatch = message.match(/in (\w+)/);
      if (componentMatch) {
        console.warn(`Hydration mismatch in component: ${componentMatch[1]}`);
      }
    }
    
    originalError.apply(console, args);
  };
  
  // 页面加载完成后报告
  window.addEventListener('load', () => {
    if (errors.length > 0) {
      console.table(errors);
      
      // 发送到监控
      fetch('/api/log-hydration-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors, url: location.href })
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  debugHydrationMismatch();
}

// 4. 流式SSR with Suspense
// streaming-ssr.js
import { Suspense } from 'react';

function App() {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <div id="root">
          {/* 立即发送的Shell */}
          <Header />
          <Nav />
          
          {/* 延迟加载的内容 */}
          <Suspense fallback={<Spinner />}>
            <Comments />
          </Suspense>
          
          <Suspense fallback={<Spinner />}>
            <Recommendations />
          </Suspense>
          
          <Footer />
        </div>
      </body>
    </html>
  );
}

// 服务器配置
app.get('*', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ['/client.js'],
    
    onShellReady() {
      // Shell准备好就发送（不等待Suspense）
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    }
  });
});
```

### Q6: TypeScript类型迁移遇到问题怎么办？

**A:** TypeScript迁移常见问题和解决方案：

```typescript
// 问题1：ref类型错误
// ❌ React 18
import { forwardRef, Ref } from 'react';

interface Props {
  value: string;
}

const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} {...props} />;
});

// ✅ React 19
interface Props {
  value: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ value, ref }: Props) {
  return <input ref={ref} value={value} />;
}

// 或使用ComponentPropsWithRef
import { ComponentPropsWithRef } from 'react';

type InputProps = ComponentPropsWithRef<'input'> & {
  customProp?: string;
};

function Input(props: InputProps) {
  return <input {...props} />;
}

// 问题2：Context类型错误
// ❌ React 18
const MyContext = createContext<ContextType>(defaultValue);

function Provider({ children }: { children: ReactNode }) {
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// ✅ React 19（简化Provider）
const MyContext = createContext<ContextType>(defaultValue);

function Provider({ children }: { children: ReactNode }) {
  return (
    <MyContext value={value}>
      {children}
    </MyContext>
  );
}

// 问题3：新Hook的类型
import { use, useActionState, useOptimistic } from 'react';

// use() Hook
function Component() {
  // 需要明确Promise类型
  const promise: Promise<User> = fetchUser();
  const user = use(promise);
  
  return <div>{user.name}</div>;
}

// useActionState类型
type State = {
  data?: string;
  error?: string;
};

function Form() {
  const [state, action] = useActionState<State, FormData>(
    async (prevState, formData) => {
      try {
        const data = await submit(formData);
        return { data };
      } catch (error) {
        return { error: (error as Error).message };
      }
    },
    { data: undefined, error: undefined }
  );
}

// useOptimistic类型
interface Todo {
  id: string;
  text: string;
  done: boolean;
}

function TodoList() {
  const [todos] = useState<Todo[]>([]);
  const [optimisticTodos, addOptimistic] = useOptimistic<Todo[], Todo>(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
}

// 问题4：事件处理器类型
// ❌ 宽松的类型
interface ButtonProps {
  onClick?: Function;
}

// ✅ 具体的事件类型
import { MouseEventHandler, FormEventHandler } from 'react';

interface ButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

interface FormProps {
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

// 类型迁移辅助工具
// migrate-types.ts
import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ForwardedRef,
  PropsWithChildren,
  PropsWithoutRef
} from 'react';

// 旧代码中的Ref类型
export type LegacyRef<T> = ForwardedRef<T>;

// 新代码推荐的类型
export type NewProps<T extends keyof JSX.IntrinsicElements> = 
  ComponentPropsWithRef<T>;

// 迁移辅助函数
export function migrateComponentProps<T extends keyof JSX.IntrinsicElements>(
  element: T
): ComponentPropsWithRef<T> {
  return {} as ComponentPropsWithRef<T>;
}
```

### Q7: 如何处理性能回归问题？

**A:** 性能问题诊断和优化流程：

```javascript
// 1. 性能诊断
// performance-diagnosis.js
class PerformanceDiagnostics {
  constructor() {
    this.metrics = new Map();
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    // Web Vitals监控
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.recordMetric.bind(this, 'CLS'));
      getFID(this.recordMetric.bind(this, 'FID'));
      getFCP(this.recordMetric.bind(this, 'FCP'));
      getLCP(this.recordMetric.bind(this, 'LCP'));
      getTTFB(this.recordMetric.bind(this, 'TTFB'));
    });
    
    // React组件性能
    this.setupReactProfiler();
  }
  
  setupReactProfiler() {
    // 使用React Profiler API
    const onRenderCallback = (
      id, phase, actualDuration, baseDuration, startTime, commitTime
    ) => {
      this.metrics.set(`${id}-${phase}`, {
        actualDuration,
        baseDuration,
        renderTime: commitTime - startTime
      });
      
      // 检测慢渲染
      if (actualDuration > 100) {
        console.warn(`Slow render in ${id}: ${actualDuration}ms`);
        
        // 上报性能问题
        this.reportSlowRender({
          component: id,
          phase,
          duration: actualDuration
        });
      }
    };
    
    return onRenderCallback;
  }
  
  recordMetric(name, metric) {
    this.metrics.set(name, metric.value);
    
    // 与基线比较
    const baseline = this.getBaseline(name);
    if (baseline && metric.value > baseline * 1.2) {
      console.error(`${name} regression: ${metric.value}ms vs ${baseline}ms baseline`);
      this.reportRegression(name, metric.value, baseline);
    }
  }
  
  async reportRegression(metric, current, baseline) {
    await fetch('/api/performance-regression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric,
        current,
        baseline,
        url: location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    });
  }
}

// 使用Profiler组件
function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Router>
        <Profiler id="MainContent" onRender={onRenderCallback}>
          <MainContent />
        </Profiler>
      </Router>
    </Profiler>
  );
}

// 2. 常见性能问题修复
// React 19迁移后的性能优化

// 问题1：过度重渲染
// ❌ 导致性能问题
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // 每次渲染都创建新对象
  const config = { value: count };
  
  return <ChildComponent config={config} />;
}

// ✅ 使用memo和useMemo
const ChildComponent = memo(function ChildComponent({ config }) {
  return <div>{config.value}</div>;
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({ value: count }), [count]);
  
  return <ChildComponent config={config} />;
}

// 或利用React 19 Compiler自动优化
// 无需手动memo和useMemo
function ParentComponent() {
  const [count, setCount] = useState(0);
  const config = { value: count };
  
  return <ChildComponent config={config} />;
}

// 问题2：大列表性能
// ❌ 渲染大量项目
function List({ items }) {
  return (
    <div>
      {items.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}

// ✅ 使用虚拟滚动
import { FixedSizeList } from 'react-window';

function List({ items }) {
  return (
    <FixedSizeList
      height={500}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Item data={items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// 问题3：不必要的Effect
// ❌ 会导致额外渲染
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  const greeting = user ? `Hello ${user.name}` : 'Loading...';
  
  return <div>{greeting}</div>;
}

// ✅ 使用React 19的use() Hook
function Component({ userId }) {
  const userPromise = useMemo(
    () => fetchUser(userId),
    [userId]
  );
  const user = use(userPromise);
  
  return <div>Hello {user.name}</div>;
}

// 3. 性能监控和报警
// monitoring.js
class PerformanceMonitoring {
  constructor() {
    this.thresholds = {
      FCP: 1800,  // First Contentful Paint
      LCP: 2500,  // Largest Contentful Paint
      FID: 100,   // First Input Delay
      CLS: 0.1,   // Cumulative Layout Shift
      TTI: 3800   // Time to Interactive
    };
  }
  
  async monitor() {
    const metrics = await this.collectMetrics();
    
    Object.entries(metrics).forEach(([name, value]) => {
      const threshold = this.thresholds[name];
      
      if (value > threshold) {
        this.alert({
          level: 'warning',
          metric: name,
          value,
          threshold,
          message: `${name} exceeded threshold: ${value} > ${threshold}`
        });
      }
    });
  }
  
  async collectMetrics() {
    return new Promise(resolve => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const metrics = {};
        
        entries.forEach(entry => {
          metrics[entry.name] = entry.value || entry.startTime;
        });
        
        resolve(metrics);
      }).observe({ entryTypes: ['paint', 'navigation', 'measure'] });
    });
  }
  
  alert(data) {
    // 发送警报
    console.error('Performance Alert:', data);
    
    fetch('/api/performance-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

// 4. A/B测试性能对比
// ab-testing.js
function setupPerformanceABTest() {
  const variant = Math.random() < 0.5 ? 'react-19' : 'react-18';
  
  // 记录variant
  sessionStorage.setItem('ab-variant', variant);
  
  // 收集性能数据
  window.addEventListener('load', () => {
    const metrics = {
      variant,
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
      // ... 其他指标
    };
    
    // 上报AB测试数据
    fetch('/api/ab-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  });
}
```

### Q8: 迁移后出现Hydration错误怎么办？

**A:** Hydration错误的调试和修复：

```javascript
// 1. 定位Hydration错误
// hydration-error-detector.js
function detectHydrationErrors() {
  // 捕获hydration错误
  const errors = [];
  
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    if (message.includes('Hydration') || message.includes('did not match')) {
      errors.push({
        message,
        stack: new Error().stack,
        timestamp: Date.now()
      });
      
      // 提取组件信息
      const componentMatch = message.match(/Text content did not match.*?<(.*?)>/);
      if (componentMatch) {
        console.warn('Hydration mismatch in:', componentMatch[1]);
      }
    }
    
    originalError.apply(console, args);
  };
  
  return errors;
}

// 2. 常见Hydration问题修复

// 问题1：服务器和客户端生成不同内容
// ❌ 会导致mismatch
function Component() {
  return <div>{new Date().toLocaleString()}</div>;
}

// ✅ 延迟到客户端
function Component() {
  const [time, setTime] = useState(null);
  
  useEffect(() => {
    setTime(new Date().toLocaleString());
  }, []);
  
  return <div>{time || 'Loading...'}</div>;
}

// 或使用客户端标记
function Component() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return <div>{isClient ? new Date().toLocaleString() : null}</div>;
}

// 问题2：条件渲染差异
// ❌ SSR和CSR逻辑不一致
function Component() {
  const isMobile = window.innerWidth < 768;
  
  return isMobile ? <MobileView /> : <DesktopView />;
}

// ✅ 使用useEffect确保一致性
function Component() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // SSR时渲染通用视图
  if (typeof window === 'undefined') {
    return <UniversalView />;
  }
  
  return isMobile ? <MobileView /> : <DesktopView />;
}

// 问题3：第三方库DOM操作
// ❌ 库直接修改DOM
function Component() {
  const ref = useRef();
  
  useEffect(() => {
    // 第三方库修改DOM
    $(ref.current).somePlugin();
  }, []);
  
  return <div ref={ref}>Content</div>;
}

// ✅ 使用suppressHydrationWarning
function Component() {
  const ref = useRef();
  
  useEffect(() => {
    $(ref.current).somePlugin();
  }, []);
  
  return <div ref={ref} suppressHydrationWarning>Content</div>;
}

// 3. Hydration错误监控
// hydration-monitor.js
class HydrationMonitor {
  constructor() {
    this.errors = [];
    this.setupErrorBoundary();
  }
  
  setupErrorBoundary() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('error', (event) => {
      if (event.message.includes('Hydration')) {
        this.recordError({
          type: 'hydration',
          message: event.message,
          url: location.href,
          timestamp: Date.now()
        });
      }
    });
  }
  
  recordError(error) {
    this.errors.push(error);
    
    // 达到阈值时报警
    if (this.errors.length > 5) {
      this.alert('High hydration error rate detected');
    }
    
    // 上报
    fetch('/api/hydration-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    });
  }
  
  alert(message) {
    console.error('[Hydration Monitor]', message);
    // 发送通知
  }
}

const monitor = new HydrationMonitor();
```

### Q9: 如何确保团队顺利迁移到React 19？

**A:** 团队迁移最佳实践：

```
团队迁移策略：

1. 准备阶段（1-2周）
   ✅ 评估现有代码库
   ✅ 识别潜在问题
   ✅ 创建迁移计划
   ✅ 准备培训材料

2. 培训阶段（1周）
   ✅ 举办React 19技术分享
   ✅ 讲解破坏性变更
   ✅ 演示迁移示例
   ✅ Q&A答疑

3. 试点阶段（2-3周）
   ✅ 选择1-2个小项目试点
   ✅ 记录遇到的问题
   ✅ 总结最佳实践
   ✅ 更新迁移文档

4. 推广阶段（4-8周）
   ✅ 团队分批迁移
   ✅ 代码审查把关
   ✅ 持续监控问题
   ✅ 定期同步进度

5. 完成阶段（1-2周）
   ✅ 清理旧代码
   ✅ 更新文档
   ✅ 性能优化
   ✅ 总结经验

团队协作工具：

# 迁移checklist
- [ ] 更新package.json依赖
- [ ] 运行codemod自动迁移
- [ ] 修复TypeScript错误
- [ ] 更新测试
- [ ] 本地测试通过
- [ ] 代码审查
- [ ] 部署到staging
- [ ] E2E测试
- [ ] 性能测试
- [ ] 生产部署
- [ ] 监控观察

沟通渠道：
✅ 创建#react-19-migration Slack频道
✅ 每周迁移进度会议
✅ 共享文档记录问题和解决方案
✅ 配对编程解决难题
```

### Q10: 迁移过程中应该注意哪些安全问题？

**A:** 迁移安全注意事项：

```javascript
// 1. 依赖安全检查
// 检查新版本的安全漏洞
npm audit

// 修复漏洞
npm audit fix

// 2. XSS防护
// React 19仍然会自动转义，但要注意：
function Component({ userInput }) {
  // ❌ 危险：dangerouslySetInnerHTML
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
  
  // ✅ 安全：自动转义
  return <div>{userInput}</div>;
  
  // ✅ 如果必须使用HTML，先sanitize
  const sanitized = DOMPurify.sanitize(userInput);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// 3. Server Actions安全
// server-actions.js
'use server';

import { verifyAuth } from './auth';

export async function updateUser(formData) {
  // ❌ 没有验证用户身份
  const userId = formData.get('userId');
  await db.users.update(userId, data);
  
  // ✅ 验证身份和权限
  const session = await verifyAuth();
  if (!session) throw new Error('Unauthorized');
  
  const userId = formData.get('userId');
  if (session.userId !== userId) {
    throw new Error('Forbidden');
  }
  
  await db.users.update(userId, data);
}

// 4. 环境变量安全
// ❌ 暴露敏感信息
const API_KEY = process.env.REACT_APP_SECRET_API_KEY;

// ✅ 区分公开和私密变量
// 客户端可访问（以REACT_APP_开头）
const PUBLIC_API = process.env.REACT_APP_PUBLIC_API;

// 服务器端专用
const SECRET_KEY = process.env.SECRET_KEY;  // 不会暴露到客户端

// 5. CSP策略更新
// 更新Content Security Policy以支持React 19
const helmet = require('helmet');

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // React 19可能使用inline scripts
        "'unsafe-inline'",  // 谨慎使用
        // 或使用nonce
        (req, res) => `'nonce-${res.locals.cspNonce}'`
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  })
);
```

## 总结

### 主要破坏性变更回顾

**1. 核心API变更**
```
已移除的API：
✅ ReactDOM.render() → createRoot().render()
✅ ReactDOM.hydrate() → hydrateRoot()
✅ ReactDOM.unmountComponentAtNode() → root.unmount()
✅ ReactDOM.renderToNodeStream() → renderToPipeableStream()

废弃的特性：
✅ 函数组件的defaultProps
✅ 函数组件的propTypes
✅ Legacy Context API (getChildContext)
✅ string refs
```

**2. 行为变更**
```
ref处理：
✅ ref作为普通prop传递
✅ ref callback支持返回清理函数
✅ 不再需要forwardRef包装

Context简化：
✅ <Context value={value}> 替代 <Context.Provider value={value}>
✅ 向后兼容旧语法

useReducer：
✅ 初始化函数参数改变
✅ 更严格的类型检查

StrictMode：
✅ 更积极地检测副作用
✅ 开发环境双重调用组件
✅ 检测不纯的渲染逻辑
```

**3. TypeScript类型变更**
```
ref类型：
✅ React.Ref<T> 替代 ForwardedRef<T>
✅ ComponentPropsWithRef<T> 简化类型定义

Hook类型：
✅ use() Hook的类型推断
✅ useActionState<State, Payload>
✅ useOptimistic<State, Action>

事件类型：
✅ 更严格的事件处理器类型
✅ 移除宽松的Function类型
```

**4. SSR变更**
```
流式渲染：
✅ renderToPipeableStream（Node.js）
✅ renderToReadableStream（Edge）
✅ Suspense原生支持

Hydration：
✅ hydrateRoot API
✅ onRecoverableError回调
✅ Selective Hydration
```

### 迁移策略总结

**1. 准备阶段**
```
评估工作：
✅ 分析代码库使用的弃用API
✅ 识别第三方库兼容性问题
✅ 评估迁移工作量
✅ 制定迁移时间表

准备工作：
✅ 创建备份分支
✅ 准备迁移工具和脚本
✅ 搭建测试环境
✅ 准备回滚方案
```

**2. 执行阶段**
```
迁移步骤：
1️⃣ 更新依赖包到React 19
2️⃣ 运行自动化迁移工具（codemod）
3️⃣ 修复TypeScript类型错误
4️⃣ 更新入口文件（createRoot/hydrateRoot）
5️⃣ 逐个修复破坏性变更
6️⃣ 更新测试代码
7️⃣ 执行全面测试
8️⃣ 性能基准测试
9️⃣ 部署到staging环境
🔟 生产环境灰度发布

质量保证：
✅ 单元测试覆盖率 > 80%
✅ E2E测试关键流程
✅ 性能指标不低于基线
✅ 无严重bug
✅ 浏览器兼容性测试
```

**3. 验证阶段**
```
功能验证：
✅ 所有功能正常运行
✅ 无Console错误和警告
✅ 用户流程完整可用
✅ 第三方集成正常

性能验证：
✅ FCP < 1.8s
✅ LCP < 2.5s
✅ FID < 100ms
✅ CLS < 0.1
✅ 无性能回归

监控验证：
✅ 错误监控正常
✅ 性能监控到位
✅ 用户行为分析
✅ 报警机制完善
```

**4. 优化阶段**
```
代码优化：
✅ 移除forwardRef（利用新特性）
✅ 简化Context使用
✅ 添加ref清理函数
✅ 清理旧的兼容代码

性能优化：
✅ 启用React Compiler
✅ 优化资源加载（preload/preinit）
✅ 使用Server Components（如适用）
✅ 优化Bundle大小

文档更新：
✅ 更新技术文档
✅ 记录迁移经验
✅ 分享最佳实践
✅ 培训团队成员
```

### 最佳实践建议

**1. 渐进式迁移**
```javascript
// 不要一次性修改所有代码
// 建议的迁移顺序：

// 第一步：核心入口
createRoot(document.getElementById('root')).render(<App />);

// 第二步：关键路径组件
// 修复编译错误和类型错误

// 第三步：非关键组件
// 逐步优化和清理

// 第四步：删除旧代码
// 确认无问题后清理
```

**2. 充分测试**
```javascript
// 测试金字塔
//         /\
//        /E2E\      ← 少量关键流程测试
//       /------\
//      /集成测试\    ← 适量接口和组件测试  
//     /----------\
//    /  单元测试  \  ← 大量单元测试
//   /--------------\

// 自动化测试覆盖：
✅ 单元测试：组件逻辑、Hooks、工具函数
✅ 集成测试：组件交互、API集成
✅ E2E测试：关键用户流程
✅ 视觉回归：UI一致性
✅ 性能测试：加载速度、渲染性能
```

**3. 监控和回滚**
```javascript
// 完善的监控体系
const monitoring = {
  错误监控: {
    工具: 'Sentry / Bugsnag',
    指标: ['错误率', '错误类型', '影响用户数']
  },
  
  性能监控: {
    工具: 'Lighthouse / Web Vitals',
    指标: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB']
  },
  
  用户监控: {
    工具: 'Google Analytics / Mixpanel',
    指标: ['活跃用户', '留存率', '转化率']
  },
  
  业务监控: {
    工具: '自定义Dashboard',
    指标: ['关键业务指标', 'SLA达成率']
  }
};

// 回滚预案
if (errorRate > threshold) {
  // 立即回滚到React 18
  deployPreviousVersion();
  notifyTeam('React 19 rollback initiated');
}
```

**4. 团队协作**
```
协作要点：

沟通：
✅ 定期同步会议
✅ 文档共享
✅ 问题追踪系统
✅ 技术分享会

分工：
✅ 指定迁移负责人
✅ 明确任务分配
✅ 设置里程碑
✅ 定期Review进度

知识传递：
✅ 编写迁移文档
✅ 录制教程视频
✅ 组织培训workshop
✅ 建立Q&A知识库
```

### 常见陷阱和避免方法

**陷阱1：一次性全面迁移**
```
❌ 风险：
- 工作量大，难以掌控
- 问题集中爆发
- 难以定位问题根源
- 回滚代价高

✅ 避免方法：
- 分模块渐进迁移
- 小步快跑，持续集成
- 及时发现和解决问题
- 保持可回滚能力
```

**陷阱2：忽视第三方库兼容性**
```
❌ 风险：
- 运行时错误
- 类型错误
- 功能异常

✅ 避免方法：
- 提前检查库的兼容性
- 寻找替代方案
- 创建适配层
- 联系维护者
```

**陷阱3：测试不充分**
```
❌ 风险：
- 生产环境bug
- 用户体验受损
- 紧急回滚

✅ 避免方法：
- 制定测试checklist
- 自动化测试覆盖
- staging环境验证
- 灰度发布策略
```

**陷阱4：性能监控缺失**
```
❌ 风险：
- 性能回归未察觉
- 用户投诉增加
- SEO受影响

✅ 避免方法：
- 建立性能基线
- 持续性能监控
- 设置性能预算
- 及时优化
```

### 迁移成功标准

**功能层面**
```
✅ 所有功能正常运行
✅ 无阻塞性bug
✅ 用户体验无降级
✅ 第三方集成完好
```

**技术层面**
```
✅ 无Console错误
✅ 无TypeScript错误
✅ 测试全部通过
✅ 代码质量提升
```

**性能层面**
```
✅ 性能指标达标
✅ 无性能回归
✅ Bundle大小可控
✅ 加载速度优化
```

**团队层面**
```
✅ 团队掌握新特性
✅ 文档完善
✅ 最佳实践建立
✅ 持续改进机制
```

### 后续优化方向

**1. 利用React 19新特性**
```javascript
// React Compiler自动优化
- 移除手动memo/useMemo/useCallback
- 享受自动memoization

// Server Components
- 减少客户端Bundle大小
- 改善首屏性能
- 优化数据获取

// 新Hooks
- use()简化异步处理
- useOptimistic改善UX
- useActionState简化表单

// 资源优化API
- preload/preinit预加载
- prefetchDNS/preconnect优化连接
```

**2. 持续性能优化**
```
定期优化：
✅ 代码分割优化
✅ 图片懒加载
✅ 第三方库精简
✅ 缓存策略优化
✅ CDN配置优化

监控优化：
✅ Core Web Vitals
✅ 自定义性能指标
✅ 用户体验监控
✅ A/B测试
```

**3. 开发体验提升**
```
工具链：
✅ 更快的构建速度
✅ 更好的HMR体验
✅ 智能代码提示
✅ 自动化工具

流程：
✅ CI/CD优化
✅ 自动化测试
✅ 性能监控集成
✅ 错误追踪
```

### 关键要点

```
核心原则：
1️⃣ 稳妥第一 - 确保系统稳定性
2️⃣ 渐进迁移 - 小步快跑，持续优化
3️⃣ 充分测试 - 自动化测试保障
4️⃣ 实时监控 - 及时发现和解决问题
5️⃣ 团队协作 - 知识共享，共同进步

成功关键：
✅ 详细的迁移计划
✅ 完善的测试策略
✅ 可靠的回滚方案
✅ 持续的性能监控
✅ 团队的技术提升

长期收益：
📈 更好的性能表现
🎯 更佳的开发体验  
🔒 更稳定的系统
💡 更现代的技术栈
🚀 更快的迭代速度
```

通过系统化的迁移策略、严格的质量保证和持续的优化改进，可以安全、平稳地完成从React 18到React 19的升级，并充分享受新版本带来的性能提升和开发体验改善。

### 影响评估

```
✅ 代码修改量：中等
✅ 迁移难度：低到中等
✅ 收益：性能提升+新特性
✅ 风险：可控
```

了解破坏性变更是成功迁移的关键！
