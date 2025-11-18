# useSyncExternalStore外部状态同步

## 学习目标

通过本章学习，你将全面掌握：

- useSyncExternalStore的概念和作用
- 订阅外部数据源
- 与第三方状态库集成
- 浏览器API的订阅
- SSR支持和最佳实践
- 性能优化技巧
- 实际应用案例
- Concurrent Mode兼容性
- TypeScript集成
- 跨标签页通信
- 自定义状态管理库

## 第一部分：useSyncExternalStore基础

### 1.1 什么是useSyncExternalStore

useSyncExternalStore是React 18引入的Hook，用于订阅外部数据源，并确保UI与外部状态保持同步，特别是在Concurrent Mode下。

```jsx
import { useSyncExternalStore } from 'react';

// 基本语法
const state = useSyncExternalStore(
  subscribe,        // 订阅函数：接收callback，返回清理函数
  getSnapshot,      // 获取当前快照：返回当前状态
  getServerSnapshot // 服务器端快照（可选）：SSR时使用
);

// 简单示例：订阅window.innerWidth
function useWindowWidth() {
  const width = useSyncExternalStore(
    // subscribe：订阅函数
    (callback) => {
      // 当窗口大小变化时调用callback
      window.addEventListener('resize', callback);
      // 返回清理函数
      return () => window.removeEventListener('resize', callback);
    },
    
    // getSnapshot：获取当前宽度
    () => window.innerWidth,
    
    // getServerSnapshot：服务器端返回默认值
    () => 0
  );
  
  return width;
}

// 使用
function Component() {
  const width = useWindowWidth();
  
  return (
    <div>
      窗口宽度: {width}px
      {width < 768 ? ' (移动端)' : ' (桌面端)'}
    </div>
  );
}
```

### 1.2 为什么需要useSyncExternalStore

在React 18的Concurrent Mode下，组件渲染可能被中断和恢复，这可能导致外部状态和React内部状态不一致。useSyncExternalStore解决了这个问题。

```jsx
// ❌ 问题：在Concurrent Mode下可能出现"tearing"
let externalState = 0;

function BadComponent() {
  const [state, setState] = useState(externalState);
  
  useEffect(() => {
    // 订阅外部状态变化
    const interval = setInterval(() => {
      externalState++;
      setState(externalState);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // 问题：在Concurrent Mode下，不同组件可能看到不同的状态值
  return <div>{state}</div>;
}

// ✅ 解决：使用useSyncExternalStore
class ExternalStore {
  constructor() {
    this.value = 0;
    this.listeners = new Set();
  }
  
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getSnapshot = () => {
    return this.value;
  };
  
  increment = () => {
    this.value++;
    this.listeners.forEach(listener => listener());
  };
}

const store = new ExternalStore();

function GoodComponent() {
  // 确保所有组件看到一致的状态
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
  
  return <div>{value}</div>;
}
```

### 1.3 基本模式

```jsx
// 创建一个简单的外部store
class CounterStore {
  constructor() {
    this.state = { count: 0 };
    this.listeners = new Set();
  }
  
  // 订阅方法
  subscribe = (listener) => {
    this.listeners.add(listener);
    // 返回取消订阅的函数
    return () => this.listeners.delete(listener);
  };
  
  // 获取当前状态快照
  getSnapshot = () => {
    return this.state;
  };
  
  // 更新状态
  setState = (newState) => {
    this.state = { ...this.state, ...newState };
    // 通知所有监听器
    this.listeners.forEach(listener => listener());
  };
  
  // 业务方法
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  };
  
  reset = () => {
    this.setState({ count: 0 });
  };
}

// 创建store实例
const counterStore = new CounterStore();

// 使用useSyncExternalStore订阅
function Counter() {
  const state = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot
  );
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => counterStore.increment()}>+1</button>
      <button onClick={() => counterStore.decrement()}>-1</button>
      <button onClick={() => counterStore.reset()}>重置</button>
    </div>
  );
}

// 多个组件共享同一个store
function AnotherCounter() {
  const state = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot
  );
  
  return (
    <div>
      <p>另一个计数器也显示: {state.count}</p>
    </div>
  );
}
```

## 第二部分：订阅浏览器API

### 2.1 窗口尺寸订阅

```jsx
function useWindowSize() {
  const size = useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => ({
      width: window.innerWidth,
      height: window.innerHeight
    }),
    () => ({
      width: 0,
      height: 0
    })
  );
  
  return size;
}

// 使用
function ResponsiveLayout() {
  const { width, height } = useWindowSize();
  
  return (
    <div>
      <p>窗口大小: {width} x {height}</p>
      {width < 768 && <MobileLayout />}
      {width >= 768 && width < 1024 && <TabletLayout />}
      {width >= 1024 && <DesktopLayout />}
    </div>
  );
}

function MobileLayout() {
  return <div>移动端布局</div>;
}

function TabletLayout() {
  return <div>平板布局</div>;
}

function DesktopLayout() {
  return <div>桌面布局</div>;
}
```

### 2.2 在线状态订阅

```jsx
function useOnlineStatus() {
  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true  // SSR默认在线
  );
  
  return isOnline;
}

// 使用
function OnlineIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={`status ${isOnline ? 'online' : 'offline'}`}>
      <span className="indicator" />
      <span>{isOnline ? '在线' : '离线'}</span>
      {!isOnline && <span className="warning">请检查网络连接</span>}
    </div>
  );
}

// 与业务逻辑结合
function DataSyncComponent() {
  const isOnline = useOnlineStatus();
  const [pendingData, setPendingData] = useState([]);
  
  useEffect(() => {
    if (isOnline && pendingData.length > 0) {
      // 网络恢复时同步待处理数据
      syncPendingData(pendingData);
      setPendingData([]);
    }
  }, [isOnline, pendingData]);
  
  const handleSaveData = (data) => {
    if (isOnline) {
      saveDataToServer(data);
    } else {
      setPendingData(prev => [...prev, data]);
    }
  };
  
  return (
    <div>
      <OnlineIndicator />
      {pendingData.length > 0 && (
        <div className="pending">
          {pendingData.length}条数据待同步
        </div>
      )}
      {/* 表单等UI */}
    </div>
  );
}

function saveDataToServer(data) {
  // 保存到服务器
}

function syncPendingData(data) {
  // 同步待处理数据
}
```

### 2.3 媒体查询订阅

```jsx
function useMediaQuery(query) {
  const subscribe = useCallback((callback) => {
    const mediaQuery = window.matchMedia(query);
    
    // 使用新API（如果可用）
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    } else {
      // 降级到旧API
      mediaQuery.addListener(callback);
      return () => mediaQuery.removeListener(callback);
    }
  }, [query]);
  
  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };
  
  const getServerSnapshot = () => {
    return false;  // 服务器端默认false
  };
  
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// 使用
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <h2>设备类型</h2>
      {isMobile && <p>移动设备</p>}
      {isTablet && <p>平板设备</p>}
      {isDesktop && <p>桌面设备</p>}
      
      <h2>用户偏好</h2>
      <p>主题: {isDarkMode ? '深色' : '浅色'}</p>
      <p>动画: {prefersReducedMotion ? '减少' : '正常'}</p>
    </div>
  );
}
```

### 2.4 滚动位置订阅

```jsx
function useScrollPosition() {
  const position = useSyncExternalStore(
    (callback) => {
      window.addEventListener('scroll', callback, { passive: true });
      return () => window.removeEventListener('scroll', callback);
    },
    () => ({
      x: window.scrollX,
      y: window.scrollY
    }),
    () => ({
      x: 0,
      y: 0
    })
  );
  
  return position;
}

// 使用：返回顶部按钮
function ScrollToTopButton() {
  const { y } = useScrollPosition();
  const showButton = y > 300;
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (!showButton) return null;
  
  return (
    <button
      className="scroll-to-top"
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        opacity: showButton ? 1 : 0,
        transition: 'opacity 0.3s'
      }}
    >
      ↑ 返回顶部
    </button>
  );
}

// 使用：导航栏背景变化
function StickyNav() {
  const { y } = useScrollPosition();
  const hasBackground = y > 50;
  
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: hasBackground ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        boxShadow: hasBackground ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s'
      }}
    >
      导航内容
    </nav>
  );
}
```

## 第三部分：LocalStorage订阅

### 3.1 基础LocalStorage订阅

```jsx
function subscribeToLocalStorage(key, callback) {
  // 监听storage事件（跨标签页）
  const handleStorage = (e) => {
    if (e.key === key) {
      callback();
    }
  };
  
  window.addEventListener('storage', handleStorage);
  
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}

function useLocalStorageValue(key, defaultValue) {
  const value = useSyncExternalStore(
    (callback) => subscribeToLocalStorage(key, callback),
    () => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    () => defaultValue  // SSR默认值
  );
  
  const setValue = (newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // 手动触发storage事件（同标签页）
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(valueToStore)
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };
  
  return [value, setValue];
}

// 使用
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorageValue('theme', 'light');
  
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };
  
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  return (
    <button onClick={toggleTheme}>
      切换到{theme === 'light' ? '深色' : '浅色'}模式
    </button>
  );
}
```

### 3.2 高级LocalStorage同步

```jsx
class LocalStorageStore {
  constructor(key, initialValue) {
    this.key = key;
    this.initialValue = initialValue;
    this.listeners = new Set();
    
    // 监听storage事件
    window.addEventListener('storage', this.handleStorageEvent);
  }
  
  handleStorageEvent = (e) => {
    if (e.key === this.key) {
      this.listeners.forEach(listener => listener());
    }
  };
  
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  
  getSnapshot = () => {
    try {
      const item = window.localStorage.getItem(this.key);
      return item ? JSON.parse(item) : this.initialValue;
    } catch {
      return this.initialValue;
    }
  };
  
  getServerSnapshot = () => {
    return this.initialValue;
  };
  
  setValue = (newValue) => {
    const current = this.getSnapshot();
    const valueToStore = newValue instanceof Function ? newValue(current) : newValue;
    
    try {
      window.localStorage.setItem(this.key, JSON.stringify(valueToStore));
      // 触发本地监听器
      this.listeners.forEach(listener => listener());
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };
  
  destroy = () => {
    window.removeEventListener('storage', this.handleStorageEvent);
  };
}

function useLocalStorageStore(key, initialValue) {
  const store = useMemo(() => new LocalStorageStore(key, initialValue), [key]);
  
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  
  useEffect(() => {
    return () => store.destroy();
  }, [store]);
  
  return [value, store.setValue];
}

// 使用：跨标签页计数器
function CrossTabCounter() {
  const [count, setCount] = useLocalStorageStore('counter', 0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <p className="note">在多个标签页中打开此页面，计数会同步</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <button onClick={() => setCount(c => c - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
```

## 第四部分：第三方库集成

### 4.1 集成Redux

```jsx
import { createStore } from 'redux';

// Redux reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'SET':
      return { count: action.payload };
    default:
      return state;
  }
}

// 创建Redux store
const reduxStore = createStore(counterReducer);

// 使用useSyncExternalStore订阅Redux
function useReduxStore(selector) {
  const state = useSyncExternalStore(
    reduxStore.subscribe,
    () => selector(reduxStore.getState()),
    () => selector(reduxStore.getState())
  );
  
  return state;
}

// 使用
function ReduxCounter() {
  const count = useReduxStore(state => state.count);
  
  return (
    <div>
      <p>Redux Count: {count}</p>
      <button onClick={() => reduxStore.dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => reduxStore.dispatch({ type: 'DECREMENT' })}>-1</button>
    </div>
  );
}

// 带性能优化的selector
function useReduxSelector(selector, equalityFn = Object.is) {
  const selectedState = useRef(null);
  
  const subscribe = useCallback((callback) => {
    return reduxStore.subscribe(() => {
      const newState = selector(reduxStore.getState());
      if (!equalityFn(selectedState.current, newState)) {
        selectedState.current = newState;
        callback();
      }
    });
  }, [selector, equalityFn]);
  
  const getSnapshot = () => {
    const state = selector(reduxStore.getState());
    selectedState.current = state;
    return state;
  };
  
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

### 4.2 集成MobX

```jsx
import { makeObservable, observable, action } from 'mobx';

// MobX store
class TodoStore {
  todos = [];
  
  constructor() {
    makeObservable(this, {
      todos: observable,
      addTodo: action,
      removeTodo: action
    });
  }
  
  addTodo = (text) => {
    this.todos.push({ id: Date.now(), text, completed: false });
  };
  
  removeTodo = (id) => {
    this.todos = this.todos.filter(todo => todo.id !== id);
  };
  
  subscribe = (callback) => {
    // MobX的observe或reaction
    const dispose = reaction(
      () => this.todos,
      () => callback()
    );
    
    return dispose;
  };
  
  getSnapshot = () => {
    return [...this.todos];
  };
}

const todoStore = new TodoStore();

function useMobXStore(store) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}

// 使用
function TodoList() {
  const todos = useMobXStore(todoStore);
  const [input, setInput] = useState('');
  
  const handleAdd = () => {
    if (input.trim()) {
      todoStore.addTodo(input);
      setInput('');
    }
  };
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button onClick={handleAdd}>添加</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => todoStore.removeTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.3 自定义状态管理库

```jsx
class SimpleStore {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Set();
    this.middleware = [];
  }
  
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getState = () => {
    return this.state;
  };
  
  setState = (updater) => {
    const prevState = this.state;
    const nextState = updater instanceof Function ? updater(prevState) : updater;
    
    // 执行middleware
    const finalState = this.middleware.reduce(
      (state, middleware) => middleware(state, prevState),
      nextState
    );
    
    this.state = finalState;
    
    // 通知订阅者
    this.listeners.forEach(listener => listener());
  };
  
  use = (middleware) => {
    this.middleware.push(middleware);
  };
}

// 创建logger middleware
function createLogger() {
  return (nextState, prevState) => {
    console.group('State Update');
    console.log('Previous:', prevState);
    console.log('Next:', nextState);
    console.groupEnd();
    return nextState;
  };
}

// 创建store
const appStore = new SimpleStore({
  user: null,
  theme: 'light',
  count: 0
});

// 添加middleware
appStore.use(createLogger());

// Hook
function useStore(selector = state => state) {
  return useSyncExternalStore(
    appStore.subscribe,
    () => selector(appStore.getState()),
    () => selector(appStore.getState())
  );
}

// 使用
function AppComponent() {
  const theme = useStore(state => state.theme);
  const count = useStore(state => state.count);
  
  return (
    <div className={theme}>
      <p>主题: {theme}</p>
      <p>计数: {count}</p>
      
      <button onClick={() => appStore.setState(state => ({
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      }))}>
        切换主题
      </button>
      
      <button onClick={() => appStore.setState(state => ({
        ...state,
        count: state.count + 1
      }))}>
        增加计数
      </button>
    </div>
  );
}
```

## 第五部分：高级应用

### 5.1 跨标签页通信

```jsx
class BroadcastStore {
  constructor(channelName, initialState) {
    this.channel = new BroadcastChannel(channelName);
    this.state = initialState;
    this.listeners = new Set();
    
    // 监听其他标签页的消息
    this.channel.onmessage = (event) => {
      this.state = event.data;
      this.listeners.forEach(listener => listener());
    };
  }
  
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getSnapshot = () => {
    return this.state;
  };
  
  setState = (newState) => {
    const nextState = newState instanceof Function ? newState(this.state) : newState;
    
    this.state = nextState;
    
    // 广播到其他标签页
    this.channel.postMessage(nextState);
    
    // 通知本地监听器
    this.listeners.forEach(listener => listener());
  };
  
  close = () => {
    this.channel.close();
  };
}

function useBroadcastState(channelName, initialState) {
  const store = useMemo(
    () => new BroadcastStore(channelName, initialState),
    [channelName]
  );
  
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  
  useEffect(() => {
    return () => store.close();
  }, [store]);
  
  return [state, store.setState];
}

// 使用：跨标签页聊天
function CrossTabChat() {
  const [messages, setMessages] = useBroadcastState('chat', []);
  const [input, setInput] = useState('');
  
  const sendMessage = () => {
    if (input.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: input,
          timestamp: new Date().toISOString()
        }
      ]);
      setInput('');
    }
  };
  
  return (
    <div className="chat">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <span className="time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            <span className="text">{msg.text}</span>
          </div>
        ))}
      </div>
      
      <div className="input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息（所有标签页可见）"
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  );
}
```

### 5.2 WebSocket状态订阅

```jsx
class WebSocketStore {
  constructor(url) {
    this.url = url;
    this.data = null;
    this.status = 'disconnected';
    this.listeners = new Set();
    this.ws = null;
    
    this.connect();
  }
  
  connect = () => {
    this.status = 'connecting';
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.status = 'connected';
      this.notify();
    };
    
    this.ws.onmessage = (event) => {
      try {
        this.data = JSON.parse(event.data);
        this.notify();
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
    
    this.ws.onclose = () => {
      this.status = 'disconnected';
      this.notify();
      
      // 自动重连
      setTimeout(() => this.connect(), 3000);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };
  
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getSnapshot = () => {
    return {
      data: this.data,
      status: this.status
    };
  };
  
  send = (data) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  };
  
  notify = () => {
    this.listeners.forEach(listener => listener());
  };
  
  close = () => {
    if (this.ws) {
      this.ws.close();
    }
  };
}

function useWebSocket(url) {
  const store = useMemo(() => new WebSocketStore(url), [url]);
  
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => ({ data: null, status: 'disconnected' })
  );
  
  useEffect(() => {
    return () => store.close();
  }, [store]);
  
  return {
    ...state,
    send: store.send
  };
}

// 使用：实时数据订阅
function RealtimeData() {
  const { data, status, send } = useWebSocket('wss://example.com/data');
  
  return (
    <div>
      <div className={`status ${status}`}>
        状态: {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中' : '已断开'}
      </div>
      
      {data && (
        <div className="data">
          <h3>实时数据</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      <button onClick={() => send({ type: 'REQUEST_UPDATE' })}>
        请求更新
      </button>
    </div>
  );
}
```

### 5.3 性能监控

```jsx
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      memory: 0,
      renderTime: 0
    };
    this.listeners = new Set();
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    this.startMonitoring();
  }
  
  startMonitoring = () => {
    const updateMetrics = () => {
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastTime >= 1000) {
        this.metrics.fps = Math.round(this.frameCount * 1000 / (now - this.lastTime));
        this.frameCount = 0;
        this.lastTime = now;
        
        // 内存使用（如果可用）
        if (performance.memory) {
          this.metrics.memory = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
        }
        
        this.notify();
      }
      
      this.rafId = requestAnimationFrame(updateMetrics);
    };
    
    this.rafId = requestAnimationFrame(updateMetrics);
  };
  
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getSnapshot = () => {
    return { ...this.metrics };
  };
  
  notify = () => {
    this.listeners.forEach(listener => listener());
  };
  
  destroy = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  };
}

const performanceMonitor = new PerformanceMonitor();

function usePerformanceMetrics() {
  return useSyncExternalStore(
    performanceMonitor.subscribe,
    performanceMonitor.getSnapshot,
    () => ({ fps: 0, memory: 0, renderTime: 0 })
  );
}

// 使用
function PerformanceDisplay() {
  const metrics = usePerformanceMetrics();
  
  return (
    <div className="performance-metrics">
      <div className="metric">
        <span>FPS:</span>
        <span className={metrics.fps < 30 ? 'warning' : 'good'}>
          {metrics.fps}
        </span>
      </div>
      
      <div className="metric">
        <span>内存:</span>
        <span>{metrics.memory}MB</span>
      </div>
    </div>
  );
}
```

## 第六部分：TypeScript集成

### 6.1 类型安全的Store

```typescript
interface StoreState {
  count: number;
  user: { name: string; id: number } | null;
  theme: 'light' | 'dark';
}

type Listener = () => void;

class TypedStore {
  private state: StoreState;
  private listeners = new Set<Listener>();
  
  constructor(initialState: StoreState) {
    this.state = initialState;
  }
  
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  
  getSnapshot = (): StoreState => {
    return this.state;
  };
  
  setState = (updater: Partial<StoreState> | ((prev: StoreState) => Partial<StoreState>)): void => {
    const updates = updater instanceof Function ? updater(this.state) : updater;
    
    this.state = {
      ...this.state,
      ...updates
    };
    
    this.listeners.forEach(listener => listener());
  };
}

// Hook with type safety
function useTypedStore<T = StoreState>(
  store: TypedStore,
  selector: (state: StoreState) => T = (state) => state as unknown as T
): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(store.getSnapshot())
  );
}

// 使用
const typedStore = new TypedStore({
  count: 0,
  user: null,
  theme: 'light'
});

function TypedComponent() {
  const count = useTypedStore(typedStore, state => state.count);
  const theme = useTypedStore(typedStore, state => state.theme);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Theme: {theme}</p>
    </div>
  );
}
```

### 6.2 泛型Store Hook

```typescript
function createStore<T>(initialState: T) {
  type Listener = () => void;
  type Selector<R> = (state: T) => R;
  
  let state = initialState;
  const listeners = new Set<Listener>();
  
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  
  const getState = () => state;
  
  const setState = (updater: Partial<T> | ((prev: T) => Partial<T>)) => {
    const updates = updater instanceof Function ? updater(state) : updater;
    state = { ...state, ...updates };
    listeners.forEach(listener => listener());
  };
  
  return {
    subscribe,
    getState,
    setState,
    useStore: <R = T>(selector: Selector<R> = (s) => s as unknown as R): R => {
      return useSyncExternalStore(
        subscribe,
        () => selector(getState()),
        () => selector(getState())
      );
    }
  };
}

// 使用
interface AppState {
  user: { name: string; email: string } | null;
  settings: {
    theme: 'light' | 'dark';
    language: string;
  };
  notifications: Array<{ id: number; message: string }>;
}

const appStore = createStore<AppState>({
  user: null,
  settings: {
    theme: 'light',
    language: 'zh-CN'
  },
  notifications: []
});

function UserProfile() {
  const user = appStore.useStore(state => state.user);
  const theme = appStore.useStore(state => state.settings.theme);
  
  return (
    <div className={theme}>
      {user ? (
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <p>未登录</p>
      )}
    </div>
  );
}
```

## 注意事项

### 1. subscribe函数必须稳定

```jsx
// ❌ 错误：subscribe每次都是新函数
function BadComponent() {
  const value = useSyncExternalStore(
    (callback) => {  // 每次渲染都是新函数
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth
  );
  
  return <div>{value}</div>;
}

// ✅ 正确：使用useCallback或外部函数
function GoodComponent() {
  const subscribe = useCallback((callback) => {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  }, []);
  
  const value = useSyncExternalStore(
    subscribe,
    () => window.innerWidth
  );
  
  return <div>{value}</div>;
}

// ✅ 或者：使用自定义Hook
function useWindowWidth() {
  return useSyncExternalStore(
    subscribeToWindowResize,  // 外部稳定函数
    () => window.innerWidth,
    () => 0
  );
}

function subscribeToWindowResize(callback) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}
```

### 2. getSnapshot必须返回不可变值

```jsx
// ❌ 错误：返回可变对象
const mutableStore = {
  state: { count: 0 },
  subscribe: (callback) => {
    // ...
  },
  getSnapshot: () => {
    return mutableStore.state;  // 危险！返回可变引用
  }
};

// ✅ 正确：返回新对象
const immutableStore = {
  state: { count: 0 },
  subscribe: (callback) => {
    // ...
  },
  getSnapshot: () => {
    return { ...immutableStore.state };  // 返回新对象
  }
};
```

### 3. SSR时提供getServerSnapshot

```jsx
// ⚠️ 没有getServerSnapshot可能导致hydration警告
function useClientOnly() {
  const value = useSyncExternalStore(
    subscribe,
    () => window.innerWidth
    // 缺少getServerSnapshot
  );
  
  return value;
}

// ✅ 提供getServerSnapshot
function useSSRSafe() {
  const value = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 0  // 服务器端默认值
  );
  
  return value;
}
```

### 4. 避免在getSnapshot中执行副作用

```jsx
// ❌ 错误：在getSnapshot中修改状态
const badStore = {
  count: 0,
  getSnapshot: () => {
    badStore.count++;  // 副作用！
    return badStore.count;
  }
};

// ✅ 正确：getSnapshot是纯函数
const goodStore = {
  count: 0,
  getSnapshot: () => {
    return goodStore.count;
  },
  increment: () => {
    goodStore.count++;
    // 通知订阅者
  }
};
```

### 5. 性能考虑

```jsx
// ⚠️ 每次都创建新对象会导致过度渲染
function useExpensiveSnapshot() {
  return useSyncExternalStore(
    subscribe,
    () => ({  // 每次都是新对象！
      count: store.count,
      name: store.name
    })
  );
}

// ✅ 使用浅比较或选择器
function useOptimizedSnapshot() {
  // 方案1：只订阅需要的值
  const count = useSyncExternalStore(
    subscribe,
    () => store.count
  );
  
  // 方案2：缓存快照
  const cachedSnapshot = useRef(null);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const newSnapshot = {
        count: store.count,
        name: store.name
      };
      
      if (
        cachedSnapshot.current &&
        cachedSnapshot.current.count === newSnapshot.count &&
        cachedSnapshot.current.name === newSnapshot.name
      ) {
        return cachedSnapshot.current;
      }
      
      cachedSnapshot.current = newSnapshot;
      return newSnapshot;
    }
  );
  
  return snapshot;
}
```

## 常见问题

### 1. 为什么需要useSyncExternalStore而不是useEffect?

useSyncExternalStore确保在Concurrent Mode下的一致性：

```jsx
// ❌ useEffect可能导致"tearing"
function BadSync() {
  const [value, setValue] = useState(externalStore.value);
  
  useEffect(() => {
    return externalStore.subscribe(() => {
      setValue(externalStore.value);
    });
  }, []);
  
  // 在Concurrent Mode下，不同组件可能看到不同的值
  return <div>{value}</div>;
}

// ✅ useSyncExternalStore保证一致性
function GoodSync() {
  const value = useSyncExternalStore(
    externalStore.subscribe,
    () => externalStore.value
  );
  
  // 所有组件看到相同的值
  return <div>{value}</div>;
}
```

### 2. 如何处理昂贵的getSnapshot计算？

使用选择器模式：

```jsx
function useExpensiveStore() {
  // 缓存计算结果
  const snapshot = useSyncExternalStore(
    store.subscribe,
    () => {
      return store.expensiveComputation();
    }
  );
  
  return snapshot;
}

// 更好：在store层面缓存
class SmartStore {
  constructor() {
    this.cachedSnapshot = null;
    this.dirty = true;
  }
  
  getSnapshot = () => {
    if (this.dirty) {
      this.cachedSnapshot = this.expensiveComputation();
      this.dirty = false;
    }
    return this.cachedSnapshot;
  };
  
  setState = (newState) => {
    this.state = newState;
    this.dirty = true;  // 标记为需要重新计算
    this.notify();
  };
}
```

### 3. 如何在多个组件间共享store?

使用Context或模块级变量：

```jsx
// 方案1：Context
const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const store = useMemo(() => new MyStore(), []);
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

function useSharedStore() {
  const store = useContext(StoreContext);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot
  );
}

// 方案2：模块级变量
const globalStore = new MyStore();

function useGlobalStore() {
  return useSyncExternalStore(
    globalStore.subscribe,
    globalStore.getSnapshot
  );
}
```

### 4. 如何调试订阅问题？

添加调试日志：

```jsx
function createDebugStore(name) {
  const listeners = new Set();
  
  return {
    subscribe: (listener) => {
      console.log(`[${name}] 新订阅, 总数: ${listeners.size + 1}`);
      listeners.add(listener);
      
      return () => {
        console.log(`[${name}] 取消订阅, 总数: ${listeners.size - 1}`);
        listeners.delete(listener);
      };
    },
    
    notify: () => {
      console.log(`[${name}] 通知 ${listeners.size} 个订阅者`);
      listeners.forEach(listener => listener());
    }
  };
}
```

## 总结

### useSyncExternalStore核心要点

1. **主要用途**
   - 订阅外部数据源
   - 确保Concurrent Mode下的一致性
   - 集成第三方状态库
   - 订阅浏览器API

2. **三个参数**
   - subscribe: 订阅函数，返回清理函数
   - getSnapshot: 获取当前快照，必须是纯函数
   - getServerSnapshot: SSR时的快照（可选）

3. **适用场景**
   - Redux、MobX等状态库
   - 浏览器API（resize、online、media query等）
   - LocalStorage/SessionStorage
   - WebSocket连接
   - 跨标签页通信

4. **最佳实践**
   - subscribe函数保持稳定（useCallback或外部函数）
   - getSnapshot返回不可变值
   - 提供getServerSnapshot避免hydration警告
   - 避免在getSnapshot中执行副作用
   - 使用选择器优化性能

5. **性能优化**
   - 缓存快照对象
   - 使用选择器订阅部分状态
   - 在store层面优化计算

6. **与useEffect对比**
   - useSyncExternalStore: Concurrent Mode安全
   - useEffect: 可能导致tearing

7. **TypeScript支持**
   - 完整的类型推导
   - 泛型Store和Selector
   - 类型安全的状态管理

通过本章学习，你已经全面掌握了useSyncExternalStore的使用。这个Hook是React 18中连接外部世界的重要桥梁，特别是在Concurrent Mode下确保状态一致性方面发挥着关键作用。记住：当你需要订阅外部数据源时，useSyncExternalStore是最佳选择！
