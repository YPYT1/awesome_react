# React与Web Components互操作

## 学习目标

通过本章学习，你将掌握：

- React组件与Web Components的集成模式
- Shadow DOM在React中的使用
- Slot机制的React实现
- 双向数据流和通信
- 生命周期同步
- 样式隔离和共享
- 性能优化策略
- 真实项目集成案例

## 第一部分：基础互操作

### 1.1 在React中使用Web Components

React 19使得在React应用中使用Web Components变得极其简单。

基本使用：
```tsx
// 1. 导入或定义Web Component
import './components/custom-button.js';

// 2. 在React组件中直接使用
function App() {
  const handleClick = (event: CustomEvent) => {
    console.log('Button clicked:', event.detail);
  };
  
  return (
    <div>
      <h1>React App</h1>
      <custom-button 
        label="Click Me"
        variant="primary"
        onclick={handleClick}
      />
    </div>
  );
}
```

Web Component定义：
```javascript
// components/custom-button.js
class CustomButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  static get observedAttributes() {
    return ['label', 'variant'];
  }
  
  connectedCallback() {
    this.render();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  render() {
    const label = this.getAttribute('label') || 'Button';
    const variant = this.getAttribute('variant') || 'default';
    
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }
        button.primary {
          background: #007bff;
          color: white;
        }
        button.primary:hover {
          background: #0056b3;
        }
        button.default {
          background: #6c757d;
          color: white;
        }
      </style>
      <button class="${variant}" id="btn">
        ${label}
      </button>
    `;
    
    const button = this.shadowRoot.querySelector('#btn');
    button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('click', {
        detail: { variant, label },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('custom-button', CustomButton);
```

TypeScript类型定义：
```typescript
// types/custom-button.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'custom-button': {
        label?: string;
        variant?: 'primary' | 'default' | 'danger';
        disabled?: boolean;
        onclick?: (event: CustomEvent<{ variant: string; label: string }>) => void;
      };
    }
  }
}
```

### 1.2 在Web Components中使用React

Web Component内部可以渲染React组件。

基本模式：
```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';

// React组件
function ReactCounter({ initialCount = 0 }) {
  const [count, setCount] = React.useState(initialCount);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(c => c - 1)}>
        Decrement
      </button>
    </div>
  );
}

// Web Component包装器
class ReactCounterElement extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this._initialCount = 0;
  }
  
  set initialCount(value) {
    this._initialCount = value;
    this.renderReact();
  }
  
  get initialCount() {
    return this._initialCount;
  }
  
  connectedCallback() {
    const container = document.createElement('div');
    this.appendChild(container);
    
    this.root = createRoot(container);
    this.renderReact();
  }
  
  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
  
  renderReact() {
    if (this.root) {
      this.root.render(
        <ReactCounter initialCount={this._initialCount} />
      );
    }
  }
}

customElements.define('react-counter', ReactCounterElement);
```

在React中使用这个包装的组件：
```tsx
function App() {
  const [initialValue, setInitialValue] = useState(0);
  
  return (
    <div>
      <h1>React App with Embedded React Component via Web Component</h1>
      
      <input 
        type="number" 
        value={initialValue}
        onChange={e => setInitialValue(Number(e.target.value))}
      />
      
      <react-counter initialCount={initialValue} />
    </div>
  );
}
```

### 1.3 混合架构模式

在同一应用中混合使用React和Web Components。

架构设计：
```
应用结构：
├── React主应用
│   ├── 路由（React Router）
│   ├── 状态管理（Zustand/Redux）
│   └── 页面组件
│       ├── React组件
│       └── Web Components（第三方或自定义）
│
└── Web Components库
    ├── UI组件（buttons, inputs, cards）
    ├── 复杂组件（charts, maps, editors）
    └── 第三方组件
```

实现示例：
```tsx
// App.tsx - React主应用
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 导入Web Components
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import './components/chart-widget.js';
import './components/map-widget.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/charts" element={<ChartsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// Dashboard.tsx - 混合使用
function Dashboard() {
  const [data, setData] = useState([]);
  
  return (
    <div className="dashboard">
      {/* React组件 */}
      <Header />
      <Sidebar />
      
      {/* Web Components */}
      <div className="main-content">
        <chart-widget 
          data={data}
          type="line"
        />
        
        <map-widget 
          markers={data}
          zoom={10}
        />
      </div>
      
      {/* React组件 */}
      <Footer />
    </div>
  );
}
```

## 第二部分：Shadow DOM集成

### 2.1 Shadow DOM基础

Shadow DOM提供样式和DOM封装。

基本Shadow DOM：
```javascript
class ShadowCard extends HTMLElement {
  constructor() {
    super();
    // 创建Shadow Root
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
        }
        
        ::slotted(h2) {
          margin: 0 0 12px 0;
          color: #333;
        }
        
        ::slotted(p) {
          margin: 0;
          color: #666;
        }
      </style>
      
      <div class="card">
        <slot name="title"></slot>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('shadow-card', ShadowCard);
```

React中使用Shadow DOM组件：
```tsx
function App() {
  return (
    <shadow-card>
      <h2 slot="title">Card Title</h2>
      <p>This is the card content.</p>
      <p>It can have multiple paragraphs.</p>
    </shadow-card>
  );
}
```

### 2.2 Slot机制

Slot允许将React内容投影到Web Component中。

基本Slot：
```javascript
class SlotExample extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        .header { background: #f0f0f0; padding: 16px; }
        .body { padding: 16px; }
        .footer { background: #e0e0e0; padding: 16px; }
      </style>
      
      <div class="container">
        <div class="header">
          <slot name="header">默认标题</slot>
        </div>
        <div class="body">
          <slot>默认内容</slot>
        </div>
        <div class="footer">
          <slot name="footer">默认页脚</slot>
        </div>
      </div>
    `;
  }
}

customElements.define('slot-example', SlotExample);
```

React使用命名Slot：
```tsx
function App() {
  return (
    <slot-example>
      <div slot="header">
        <h1>My Custom Header</h1>
        <nav>Navigation</nav>
      </div>
      
      <p>This goes to the default slot</p>
      <p>Multiple elements in default slot</p>
      
      <footer slot="footer">
        <p>Copyright 2025</p>
      </footer>
    </slot-example>
  );
}
```

动态Slot内容：
```tsx
function DynamicSlots() {
  const [showHeader, setShowHeader] = useState(true);
  const [content, setContent] = useState('Initial content');
  
  return (
    <div>
      <button onClick={() => setShowHeader(!showHeader)}>
        Toggle Header
      </button>
      
      <slot-example>
        {showHeader && (
          <div slot="header">
            <h1>Dynamic Header</h1>
          </div>
        )}
        
        <p>{content}</p>
        
        <div slot="footer">
          <button onClick={() => setContent('Updated content')}>
            Update Content
          </button>
        </div>
      </slot-example>
    </div>
  );
}
```

### 2.3 Shadow DOM穿透

React组件样式如何影响Shadow DOM：
```javascript
class ThemedComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* 从外部继承CSS变量 */
          --primary-color: var(--app-primary, #007bff);
          --font-family: var(--app-font, sans-serif);
        }
        
        .container {
          color: var(--primary-color);
          font-family: var(--font-family);
          padding: 20px;
        }
      </style>
      
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('themed-component', ThemedComponent);
```

React提供CSS变量：
```tsx
function App() {
  const theme = {
    '--app-primary': '#ff6b6b',
    '--app-font': "'Helvetica Neue', Arial, sans-serif"
  };
  
  return (
    <div style={theme as React.CSSProperties}>
      <h1>Themed App</h1>
      
      <themed-component>
        <p>This text inherits the theme via CSS variables</p>
      </themed-component>
    </div>
  );
}
```

### 2.4 事件穿透Shadow DOM

确保事件正确穿透Shadow DOM边界：
```javascript
class EventExample extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        button { padding: 8px 16px; }
      </style>
      <button id="internal-btn">Click Me</button>
    `;
    
    const btn = this.shadowRoot.querySelector('#internal-btn');
    btn.addEventListener('click', (e) => {
      // composed: true 允许穿透Shadow DOM
      const customEvent = new CustomEvent('buttonClick', {
        detail: { message: 'Hello from Shadow DOM' },
        bubbles: true,
        composed: true // 关键！
      });
      this.dispatchEvent(customEvent);
    });
  }
}

customElements.define('event-example', EventExample);
```

React捕获事件：
```tsx
function App() {
  const handleButtonClick = (event: CustomEvent) => {
    console.log(event.detail.message); // "Hello from Shadow DOM"
  };
  
  return (
    <div onbuttonClick={handleButtonClick}>
      <event-example />
    </div>
  );
}
```

## 第三部分：双向通信

### 3.1 从React到Web Component

React向Web Component传递数据和回调：
```tsx
function ParentReactComponent() {
  const [config, setConfig] = useState({
    theme: 'dark',
    language: 'en',
    settings: {
      notifications: true,
      autoSave: true
    }
  });
  
  const callbacks = {
    onSave: (data: any) => {
      console.log('Saving:', data);
      api.save(data);
    },
    onError: (error: Error) => {
      console.error('Error:', error);
      showNotification(error.message);
    }
  };
  
  return (
    <complex-element
      config={config}
      callbacks={callbacks}
    />
  );
}
```

Web Component接收：
```javascript
class ComplexElement extends HTMLElement {
  constructor() {
    super();
    this.config = null;
    this.callbacks = null;
  }
  
  set config(value) {
    this._config = value;
    this.updateUI();
  }
  
  set callbacks(value) {
    this._callbacks = value;
  }
  
  updateUI() {
    if (this._config) {
      this.className = this._config.theme;
      // 更新UI
    }
  }
  
  saveData(data) {
    if (this._callbacks && this._callbacks.onSave) {
      this._callbacks.onSave(data);
    }
  }
  
  reportError(error) {
    if (this._callbacks && this._callbacks.onError) {
      this._callbacks.onError(error);
    }
  }
}
```

### 3.2 从Web Component到React

Web Component向React发送数据：
```javascript
class DataProvider extends HTMLElement {
  constructor() {
    super();
    this.dataUpdateInterval = null;
  }
  
  connectedCallback() {
    // 模拟数据源（如WebSocket、轮询等）
    this.dataUpdateInterval = setInterval(() => {
      const newData = {
        timestamp: Date.now(),
        value: Math.random() * 100,
        status: 'active'
      };
      
      this.dispatchEvent(new CustomEvent('dataUpdate', {
        detail: newData,
        bubbles: true,
        composed: true
      }));
    }, 1000);
  }
  
  disconnectedCallback() {
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }
  }
}

customElements.define('data-provider', DataProvider);
```

React接收实时数据：
```tsx
interface DataUpdate {
  timestamp: number;
  value: number;
  status: string;
}

function RealtimeDashboard() {
  const [data, setData] = useState<DataUpdate[]>([]);
  
  const handleDataUpdate = (event: CustomEvent<DataUpdate>) => {
    const newData = event.detail;
    setData(prev => [...prev, newData].slice(-10)); // 保留最近10条
  };
  
  return (
    <div>
      <h2>Realtime Data</h2>
      
      <data-provider ondataUpdate={handleDataUpdate} />
      
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {new Date(item.timestamp).toLocaleTimeString()}: {item.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.3 双向绑定模式

实现类似v-model的双向绑定：
```javascript
class TwoWayInput extends HTMLElement {
  constructor() {
    super();
    this._value = '';
    this.onChange = null;
  }
  
  set value(val) {
    this._value = val;
    const input = this.querySelector('input');
    if (input && input.value !== val) {
      input.value = val;
    }
  }
  
  get value() {
    return this._value;
  }
  
  connectedCallback() {
    this.innerHTML = '<input type="text" />';
    const input = this.querySelector('input');
    
    input.value = this._value;
    
    input.addEventListener('input', (e) => {
      this._value = e.target.value;
      
      // 通知React
      if (this.onChange) {
        this.onChange(this._value);
      }
      
      this.dispatchEvent(new CustomEvent('valueChange', {
        detail: { value: this._value },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('two-way-input', TwoWayInput);
```

React中的双向绑定：
```tsx
function Form() {
  const [name, setName] = useState('');
  
  // 方式1：使用onChange回调
  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);
  
  // 方式2：使用事件
  const handleValueChange = (event: CustomEvent<{ value: string }>) => {
    setName(event.detail.value);
  };
  
  return (
    <div>
      <h2>Name: {name}</h2>
      
      {/* 使用onChange */}
      <two-way-input 
        value={name}
        onChange={handleNameChange}
      />
      
      {/* 或使用事件 */}
      <two-way-input 
        value={name}
        onvalueChange={handleValueChange}
      />
      
      <button onClick={() => setName('')}>Clear</button>
    </div>
  );
}
```

## 第四部分：生命周期同步

### 4.1 组件挂载和卸载

确保React和Web Component生命周期同步：
```tsx
function LifecycleSync() {
  const [show, setShow] = useState(true);
  const elementRef = useRef<HTMLElement>(null);
  
  // 监听Web Component连接
  useEffect(() => {
    const element = elementRef.current;
    
    if (element) {
      const handleConnected = () => {
        console.log('Web Component connected');
      };
      
      const handleDisconnected = () => {
        console.log('Web Component disconnected');
      };
      
      element.addEventListener('connected', handleConnected);
      element.addEventListener('disconnected', handleDisconnected);
      
      return () => {
        element.removeEventListener('connected', handleConnected);
        element.removeEventListener('disconnected', handleDisconnected);
      };
    }
  }, [show]);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>
        Toggle Component
      </button>
      
      {show && (
        <lifecycle-element ref={elementRef} />
      )}
    </div>
  );
}
```

Web Component生命周期钩子：
```javascript
class LifecycleElement extends HTMLElement {
  connectedCallback() {
    console.log('Connected to DOM');
    
    // 通知React
    this.dispatchEvent(new CustomEvent('connected', {
      bubbles: true,
      composed: true
    }));
    
    // 初始化
    this.init();
  }
  
  disconnectedCallback() {
    console.log('Disconnected from DOM');
    
    // 通知React
    this.dispatchEvent(new CustomEvent('disconnected', {
      bubbles: true,
      composed: true
    }));
    
    // 清理
    this.cleanup();
  }
  
  adoptedCallback() {
    console.log('Moved to new document');
  }
  
  init() {
    // 订阅、定时器等
    this.subscription = subscribeToData(data => {
      this.updateData(data);
    });
  }
  
  cleanup() {
    // 清理订阅
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

customElements.define('lifecycle-element', LifecycleElement);
```

### 4.2 数据同步

保持React state和Web Component属性同步：
```tsx
function DataSync() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // 从API获取数据
  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);
  
  // 计算过滤后的数据
  const filteredUsers = useMemo(() => {
    if (filter === 'all') return users;
    if (filter === 'active') return users.filter(u => u.active);
    if (filter === 'inactive') return users.filter(u => !u.active);
    return users;
  }, [users, filter]);
  
  // Web Component可能修改数据
  const handleUserUpdate = (event: CustomEvent<{ userId: number; changes: any }>) => {
    const { userId, changes } = event.detail;
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...changes } : u
    ));
  };
  
  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All Users</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      
      <user-list
        users={filteredUsers}
        onuserUpdate={handleUserUpdate}
      />
    </div>
  );
}
```

### 4.3 异步操作协调

协调React和Web Component的异步操作：
```javascript
class AsyncElement extends HTMLElement {
  constructor() {
    super();
    this._data = null;
    this.loading = false;
    this.onLoadStart = null;
    this.onLoadEnd = null;
    this.onLoadError = null;
  }
  
  set data(value) {
    this._data = value;
    this.loadData();
  }
  
  async loadData() {
    if (!this._data) return;
    
    this.loading = true;
    
    // 通知React加载开始
    if (this.onLoadStart) {
      this.onLoadStart();
    }
    
    this.dispatchEvent(new CustomEvent('loadStart', {
      bubbles: true,
      composed: true
    }));
    
    try {
      const result = await fetchDataFromAPI(this._data);
      this.render(result);
      
      // 通知React加载成功
      if (this.onLoadEnd) {
        this.onLoadEnd(result);
      }
      
      this.dispatchEvent(new CustomEvent('loadEnd', {
        detail: result,
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      // 通知React加载错误
      if (this.onLoadError) {
        this.onLoadError(error);
      }
      
      this.dispatchEvent(new CustomEvent('loadError', {
        detail: { error: error.message },
        bubbles: true,
        composed: true
      }));
    } finally {
      this.loading = false;
    }
  }
  
  render(data) {
    this.innerHTML = `<div>${JSON.stringify(data)}</div>`;
  }
}

customElements.define('async-element', AsyncElement);
```

React管理加载状态：
```tsx
function AsyncExample() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState(null);
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10 });
  
  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);
  
  const handleLoadEnd = useCallback((event: CustomEvent<any>) => {
    setLoading(false);
    setResult(event.detail);
  }, []);
  
  const handleLoadError = useCallback((event: CustomEvent<{ error: string }>) => {
    setLoading(false);
    setError(event.detail.error);
  }, []);
  
  return (
    <div>
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <async-element
        data={queryParams}
        onLoadStart={handleLoadStart}
        onloadEnd={handleLoadEnd}
        onloadError={handleLoadError}
      />
      
      <button onClick={() => setQueryParams(prev => ({ ...prev, page: prev.page + 1 }))}>
        Next Page
      </button>
    </div>
  );
}
```

## 第五部分：状态管理集成

### 5.1 Redux与Web Components

将Redux state传递给Web Components：
```tsx
import { useSelector, useDispatch } from 'react-redux';

function ReduxIntegration() {
  const user = useSelector(state => state.user);
  const theme = useSelector(state => state.theme);
  const dispatch = useDispatch();
  
  const handleThemeChange = (event: CustomEvent<{ theme: string }>) => {
    dispatch({ type: 'SET_THEME', payload: event.detail.theme });
  };
  
  return (
    <user-profile
      user={user}
      theme={theme}
      onthemeChange={handleThemeChange}
    />
  );
}
```

Web Component触发Redux action：
```javascript
class UserProfile extends HTMLElement {
  constructor() {
    super();
    this.user = null;
    this.theme = 'light';
  }
  
  set user(value) {
    this._user = value;
    this.render();
  }
  
  set theme(value) {
    this._theme = value;
    this.render();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    if (!this._user) return;
    
    this.innerHTML = `
      <div class="profile theme-${this._theme}">
        <h2>${this._user.name}</h2>
        <p>${this._user.email}</p>
        <button id="toggle-theme">Toggle Theme</button>
      </div>
    `;
    
    this.querySelector('#toggle-theme').addEventListener('click', () => {
      const newTheme = this._theme === 'light' ? 'dark' : 'light';
      this.dispatchEvent(new CustomEvent('themeChange', {
        detail: { theme: newTheme },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('user-profile', UserProfile);
```

### 5.2 Context与Web Components

使用Context向Web Components提供数据：
```tsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} });

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext value={{ theme, setTheme }}>
      <ThemedSection />
    </ThemeContext>
  );
}

function ThemedSection() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  const handleThemeToggle = (event: CustomEvent) => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <themed-card
      theme={theme}
      onthemeToggle={handleThemeToggle}
    >
      <h2>Themed Content</h2>
      <p>This is themed via Context</p>
    </themed-card>
  );
}
```

### 5.3 Zustand与Web Components

使用Zustand store：
```tsx
import create from 'zustand';

const useStore = create((set) => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] })),
  removeItem: (id) => set(state => ({ 
    items: state.items.filter(i => i.id !== id) 
  }))
}));

function ZustandIntegration() {
  const items = useStore(state => state.items);
  const addItem = useStore(state => state.addItem);
  const removeItem = useStore(state => state.removeItem);
  
  const handleItemAdd = (event: CustomEvent<{ item: any }>) => {
    addItem(event.detail.item);
  };
  
  const handleItemRemove = (event: CustomEvent<{ id: string }>) => {
    removeItem(event.detail.id);
  };
  
  return (
    <item-manager
      items={items}
      onitemAdd={handleItemAdd}
      onitemRemove={handleItemRemove}
    />
  );
}
```

## 第六部分：实战案例

### 6.1 集成第三方UI库

使用Shoelace UI库：
```bash
npm install @shoelace-style/shoelace
```

配置：
```tsx
// main.tsx
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.11.2/dist/');
```

TypeScript类型定义：
```typescript
// types/shoelace.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'sl-button': {
        variant?: 'default' | 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
        size?: 'small' | 'medium' | 'large';
        disabled?: boolean;
        loading?: boolean;
        onclick?: (event: MouseEvent) => void;
        children?: React.ReactNode;
      };
      
      'sl-input': {
        type?: string;
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        oninput?: (event: CustomEvent) => void;
        onchange?: (event: CustomEvent) => void;
      };
      
      'sl-dialog': {
        label?: string;
        open?: boolean;
        onslShow?: (event: CustomEvent) => void;
        onslHide?: (event: CustomEvent) => void;
        children?: React.ReactNode;
      };
      
      'sl-select': {
        value?: string;
        placeholder?: string;
        multiple?: boolean;
        clearable?: boolean;
        onslChange?: (event: CustomEvent) => void;
        children?: React.ReactNode;
      };
    }
  }
}
```

完整表单示例：
```tsx
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';

function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const handleNameChange = (event: CustomEvent) => {
    const target = event.target as any;
    setFormData(prev => ({ ...prev, name: target.value }));
  };
  
  const handleEmailChange = (event: CustomEvent) => {
    const target = event.target as any;
    setFormData(prev => ({ ...prev, email: target.value }));
  };
  
  const handleRoleChange = (event: CustomEvent) => {
    const target = event.target as any;
    setFormData(prev => ({ ...prev, role: target.value }));
  };
  
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitUserData(formData);
      setDialogOpen(true);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="user-form">
      <h2>Create User</h2>
      
      <sl-input
        label="Name"
        value={formData.name}
        placeholder="Enter name"
        required
        oninput={handleNameChange}
      />
      
      <sl-input
        label="Email"
        type="email"
        value={formData.email}
        placeholder="Enter email"
        required
        oninput={handleEmailChange}
      />
      
      <sl-select
        label="Role"
        value={formData.role}
        placeholder="Select role"
        onslChange={handleRoleChange}
      >
        <sl-option value="admin">Admin</sl-option>
        <sl-option value="user">User</sl-option>
        <sl-option value="guest">Guest</sl-option>
      </sl-select>
      
      <sl-button
        variant="primary"
        loading={submitting}
        disabled={!formData.name || !formData.email || !formData.role}
        onclick={handleSubmit}
      >
        Submit
      </sl-button>
      
      <sl-dialog
        label="Success"
        open={dialogOpen}
        onslHide={() => setDialogOpen(false)}
      >
        <p>User created successfully!</p>
        <sl-button slot="footer" onclick={() => setDialogOpen(false)}>
          Close
        </sl-button>
      </sl-dialog>
    </div>
  );
}
```

### 6.2 复杂数据可视化

集成ECharts：
```javascript
// echarts-element.js
import * as echarts from 'echarts';

class EChartsElement extends HTMLElement {
  constructor() {
    super();
    this.chart = null;
    this._option = null;
    this._theme = 'light';
  }
  
  set option(value) {
    this._option = value;
    this.updateChart();
  }
  
  get option() {
    return this._option;
  }
  
  set theme(value) {
    this._theme = value;
    if (this.chart) {
      this.chart.dispose();
      this.initChart();
    }
  }
  
  connectedCallback() {
    this.initChart();
  }
  
  disconnectedCallback() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }
  
  initChart() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '400px';
    this.appendChild(container);
    
    this.chart = echarts.init(container, this._theme);
    
    if (this._option) {
      this.chart.setOption(this._option);
    }
    
    // 监听图表事件
    this.chart.on('click', (params) => {
      this.dispatchEvent(new CustomEvent('chartClick', {
        detail: params,
        bubbles: true,
        composed: true
      }));
    });
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      this.chart.resize();
    });
  }
  
  updateChart() {
    if (this.chart && this._option) {
      this.chart.setOption(this._option, true);
    }
  }
}

customElements.define('echarts-element', EChartsElement);
```

React集成：
```tsx
import './echarts-element.js';

function Dashboard() {
  const [data, setData] = useState([120, 200, 150, 80, 70, 110, 130]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const option = useMemo(() => ({
    title: {
      text: 'Sales Data'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true
    }]
  }), [data]);
  
  const handleChartClick = (event: CustomEvent) => {
    console.log('Chart clicked:', event.detail);
    const dataIndex = event.detail.dataIndex;
    if (dataIndex !== undefined) {
      alert(`Clicked on ${event.detail.name}: ${data[dataIndex]}`);
    }
  };
  
  const addRandomData = () => {
    setData(prev => [...prev, Math.floor(Math.random() * 200)]);
  };
  
  return (
    <div className={`dashboard theme-${theme}`}>
      <div className="controls">
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          Toggle Theme
        </button>
        <button onClick={addRandomData}>
          Add Data
        </button>
      </div>
      
      <echarts-element
        option={option}
        theme={theme}
        onchartClick={handleChartClick}
      />
    </div>
  );
}
```

### 6.3 构建可复用组件库

创建企业级组件库：
```javascript
// components/index.js
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Modal } from './Modal';
export { default as Table } from './Table';

// Button.js
class UIButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._label = '';
    this._variant = 'default';
    this._size = 'medium';
    this._disabled = false;
    this._loading = false;
  }
  
  static get observedAttributes() {
    return ['label', 'variant', 'size', 'disabled', 'loading'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this[`_${name}`] = name === 'disabled' || name === 'loading' 
      ? newValue !== null 
      : newValue;
    this.render();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    const disabled = this._disabled || this._loading;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        button {
          padding: var(--button-padding-${this._size}, 8px 16px);
          font-size: var(--button-font-size-${this._size}, 14px);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        button.default {
          background: var(--button-bg-default, #6c757d);
          color: var(--button-color-default, white);
        }
        button.primary {
          background: var(--button-bg-primary, #007bff);
          color: var(--button-color-primary, white);
        }
        button.danger {
          background: var(--button-bg-danger, #dc3545);
          color: var(--button-color-danger, white);
        }
        .loader {
          display: ${this._loading ? 'inline-block' : 'none'};
          width: 14px;
          height: 14px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      
      <button 
        class="${this._variant}" 
        ${disabled ? 'disabled' : ''}
      >
        <span class="loader"></span>
        <span>${this._label || '<slot></slot>'}</span>
      </button>
    `;
    
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => {
      if (!disabled) {
        this.dispatchEvent(new CustomEvent('buttonClick', {
          bubbles: true,
          composed: true
        }));
      }
    });
  }
}

customElements.define('ui-button', UIButton);
```

TypeScript类型库：
```typescript
// types/ui-library.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': {
        label?: string;
        variant?: 'default' | 'primary' | 'danger';
        size?: 'small' | 'medium' | 'large';
        disabled?: boolean;
        loading?: boolean;
        onbuttonClick?: (event: CustomEvent) => void;
        children?: React.ReactNode;
      };
      
      'ui-input': {
        value?: string;
        type?: string;
        placeholder?: string;
        disabled?: boolean;
        error?: string;
        oninput?: (event: CustomEvent<{ value: string }>) => void;
        onchange?: (event: CustomEvent<{ value: string }>) => void;
      };
      
      'ui-select': {
        value?: string;
        placeholder?: string;
        options?: Array<{ value: string; label: string }>;
        onchange?: (event: CustomEvent<{ value: string }>) => void;
      };
      
      'ui-modal': {
        open?: boolean;
        title?: string;
        onclose?: (event: CustomEvent) => void;
        children?: React.ReactNode;
      };
    }
  }
}
```

React应用使用组件库：
```tsx
import './components/ui-library';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: '' });
  const [loading, setLoading] = useState(false);
  
  const handleAddUser = async () => {
    setLoading(true);
    try {
      const newUser = await api.createUser(formData);
      setUsers(prev => [...prev, newUser]);
      setModalOpen(false);
      setFormData({ name: '', email: '', role: '' });
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-management">
      <div className="header">
        <h1>User Management</h1>
        <ui-button
          variant="primary"
          onbuttonClick={() => setModalOpen(true)}
        >
          Add User
        </ui-button>
      </div>
      
      <user-table
        users={users}
        onuserSelect={(e) => setSelectedUser(e.detail)}
      />
      
      <ui-modal
        open={modalOpen}
        title="Create New User"
        onclose={() => setModalOpen(false)}
      >
        <ui-input
          label="Name"
          value={formData.name}
          placeholder="Enter name"
          required
          oninput={(e) => setFormData(prev => ({ 
            ...prev, 
            name: (e.target as any).value 
          }))}
        />
        
        <ui-input
          label="Email"
          type="email"
          value={formData.email}
          placeholder="Enter email"
          required
          oninput={(e) => setFormData(prev => ({ 
            ...prev, 
            email: (e.target as any).value 
          }))}
        />
        
        <ui-select
          label="Role"
          value={formData.role}
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'user', label: 'User' },
            { value: 'guest', label: 'Guest' }
          ]}
          onchange={(e) => setFormData(prev => ({ 
            ...prev, 
            role: (e.target as any).value 
          }))}
        />
        
        <div slot="footer">
          <ui-button
            variant="default"
            onbuttonClick={() => setModalOpen(false)}
          >
            Cancel
          </ui-button>
          <ui-button
            variant="primary"
            loading={loading}
            disabled={!formData.name || !formData.email || !formData.role}
            onbuttonClick={handleAddUser}
          >
            Create
          </ui-button>
        </div>
      </ui-modal>
    </div>
  );
}
```

### 6.4 地图和地理位置

集成Google Maps作为Web Component：
```javascript
// google-map.js
class GoogleMap extends HTMLElement {
  constructor() {
    super();
    this.map = null;
    this.markers = [];
    this._center = { lat: 0, lng: 0 };
    this._zoom = 10;
    this._markerData = [];
  }
  
  set center(value) {
    this._center = value;
    if (this.map) {
      this.map.setCenter(value);
    }
  }
  
  set zoom(value) {
    this._zoom = value;
    if (this.map) {
      this.map.setZoom(value);
    }
  }
  
  set markerData(value) {
    this._markerData = value || [];
    this.updateMarkers();
  }
  
  connectedCallback() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    this.appendChild(container);
    
    // 等待Google Maps API加载
    if (window.google && window.google.maps) {
      this.initMap(container);
    } else {
      window.addEventListener('google-maps-loaded', () => {
        this.initMap(container);
      });
    }
  }
  
  initMap(container) {
    this.map = new google.maps.Map(container, {
      center: this._center,
      zoom: this._zoom
    });
    
    this.updateMarkers();
  }
  
  disconnectedCallback() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    this.map = null;
  }
  
  updateMarkers() {
    if (!this.map) return;
    
    // 清除旧标记
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    
    // 添加新标记
    this._markerData.forEach(data => {
      const marker = new google.maps.Marker({
        position: data.position,
        map: this.map,
        title: data.title
      });
      
      marker.addListener('click', () => {
        this.dispatchEvent(new CustomEvent('markerClick', {
          detail: data,
          bubbles: true,
          composed: true
        }));
      });
      
      this.markers.push(marker);
    });
  }
}

customElements.define('google-map', GoogleMap);
```

React应用：
```tsx
import './google-map.js';

interface MarkerData {
  position: { lat: number; lng: number };
  title: string;
  id: string;
  info?: string;
}

function LocationApp() {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [zoom, setZoom] = useState(12);
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      position: { lat: 37.7749, lng: -122.4194 },
      title: 'San Francisco',
      id: '1',
      info: 'Tech hub'
    }
  ]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  
  const handleMarkerClick = (event: CustomEvent<MarkerData>) => {
    setSelectedMarker(event.detail);
  };
  
  const addMarker = () => {
    const newMarker: MarkerData = {
      position: {
        lat: center.lat + (Math.random() - 0.5) * 0.1,
        lng: center.lng + (Math.random() - 0.5) * 0.1
      },
      title: `Marker ${markers.length + 1}`,
      id: String(markers.length + 1)
    };
    setMarkers(prev => [...prev, newMarker]);
  };
  
  return (
    <div className="location-app">
      <div className="sidebar">
        <h2>Locations</h2>
        <button onClick={addMarker}>Add Random Location</button>
        
        {selectedMarker && (
          <div className="marker-info">
            <h3>{selectedMarker.title}</h3>
            <p>{selectedMarker.info}</p>
            <p>Lat: {selectedMarker.position.lat.toFixed(4)}</p>
            <p>Lng: {selectedMarker.position.lng.toFixed(4)}</p>
          </div>
        )}
      </div>
      
      <google-map
        center={center}
        zoom={zoom}
        markerData={markers}
        onmarkerClick={handleMarkerClick}
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  );
}
```

## 第七部分：性能优化

### 7.1 懒加载Web Components

按需加载Web Components：
```tsx
function LazyLoadExample() {
  const [showChart, setShowChart] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  
  useEffect(() => {
    if (showChart && !chartLoaded) {
      // 动态导入Web Component
      import('./components/heavy-chart.js').then(() => {
        setChartLoaded(true);
      });
    }
  }, [showChart, chartLoaded]);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>
      
      {showChart && chartLoaded && (
        <heavy-chart data={chartData} />
      )}
    </div>
  );
}
```

Code splitting：
```tsx
import { lazy, Suspense } from 'react';

// 懒加载包含Web Component的React组件
const ChartPage = lazy(() => import('./pages/ChartPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChartPage />
    </Suspense>
  );
}

// ChartPage.tsx
import './components/chart-widget.js'; // 只在需要时加载

function ChartPage() {
  return <chart-widget data={data} />;
}
```

### 7.2 缓存和Memoization

避免不必要的属性更新：
```tsx
function OptimizedComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  // 使用useMemo缓存复杂对象
  const complexData = useMemo(() => ({
    user: { name, id: 123 },
    settings: { theme: 'dark' },
    stats: { count }
  }), [name, count]);
  
  // 使用useCallback缓存回调
  const handleUpdate = useCallback((event: CustomEvent) => {
    console.log('Update:', event.detail);
  }, []);
  
  return (
    <complex-widget
      data={complexData}
      onupdate={handleUpdate}
    />
  );
}
```

Web Component端的优化：
```javascript
class OptimizedWidget extends HTMLElement {
  constructor() {
    super();
    this._data = null;
    this._prevData = null;
  }
  
  set data(value) {
    // 深度比较避免不必要的更新
    if (JSON.stringify(value) === JSON.stringify(this._prevData)) {
      return; // 数据未变化，跳过更新
    }
    
    this._prevData = this._data;
    this._data = value;
    this.render();
  }
  
  render() {
    // 只更新变化的部分
    if (!this._prevData || this._data.user.name !== this._prevData.user.name) {
      this.updateName(this._data.user.name);
    }
    
    if (!this._prevData || this._data.stats.count !== this._prevData.stats.count) {
      this.updateCount(this._data.stats.count);
    }
  }
  
  updateName(name) {
    const nameEl = this.querySelector('.name');
    if (nameEl) nameEl.textContent = name;
  }
  
  updateCount(count) {
    const countEl = this.querySelector('.count');
    if (countEl) countEl.textContent = count;
  }
}
```

### 7.3 批量更新

协调React和Web Component的更新：
```tsx
function BatchedUpdates() {
  const [updates, setUpdates] = useState([]);
  const elementRef = useRef<HTMLElement>(null);
  
  // 批量应用更新
  useEffect(() => {
    if (updates.length > 0 && elementRef.current) {
      // React 19自动批处理
      const element = elementRef.current as any;
      
      updates.forEach(update => {
        element[update.key] = update.value;
      });
      
      setUpdates([]); // 清空更新队列
    }
  }, [updates]);
  
  const queueUpdate = (key: string, value: any) => {
    setUpdates(prev => [...prev, { key, value }]);
  };
  
  return (
    <div>
      <button onClick={() => queueUpdate('theme', 'dark')}>
        Set Theme
      </button>
      <button onClick={() => queueUpdate('language', 'zh')}>
        Set Language
      </button>
      
      <configurable-element ref={elementRef} />
    </div>
  );
}
```

## 第八部分：测试策略

### 8.1 单元测试

测试使用Web Components的React组件：
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// 模拟Web Component
class MockElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div data-testid="mock-content">Mock Content</div>';
  }
}

beforeAll(() => {
  customElements.define('test-element', MockElement);
});

test('renders web component', () => {
  render(<test-element />);
  expect(screen.getByTestId('mock-content')).toBeInTheDocument();
});

test('passes props to web component', () => {
  const { container } = render(
    <test-element value="hello" count={42} />
  );
  
  const element = container.querySelector('test-element');
  expect((element as any).value).toBe('hello');
  expect((element as any).count).toBe(42);
});

test('handles web component events', () => {
  const handleClick = jest.fn();
  const { container } = render(
    <test-element onclick={handleClick} />
  );
  
  const element = container.querySelector('test-element');
  element.dispatchEvent(new CustomEvent('click', {
    detail: { data: 'test' },
    bubbles: true
  }));
  
  expect(handleClick).toHaveBeenCalledWith(
    expect.objectContaining({
      detail: { data: 'test' }
    })
  );
});
```

### 8.2 集成测试

测试React和Web Component的交互：
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('React and Web Component Integration', () => {
  beforeAll(async () => {
    // 加载Web Components
    await import('./components/user-card.js');
  });
  
  test('bidirectional data flow', async () => {
    function TestComponent() {
      const [name, setName] = useState('John');
      
      return (
        <div>
          <input 
            data-testid="react-input"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          
          <user-card
            name={name}
            onnameChange={(e: CustomEvent) => setName(e.detail.name)}
          />
        </div>
      );
    }
    
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const input = screen.getByTestId('react-input');
    
    // 从React更新
    await user.clear(input);
    await user.type(input, 'Jane');
    
    await waitFor(() => {
      const userCard = document.querySelector('user-card');
      expect((userCard as any).name).toBe('Jane');
    });
  });
});
```

### 8.3 E2E测试

使用Playwright测试：
```typescript
import { test, expect } from '@playwright/test';

test('web component interaction', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 等待Web Component加载
  await page.waitForSelector('custom-button');
  
  // 与Web Component交互
  await page.click('custom-button');
  
  // 验证React状态更新
  await expect(page.locator('.status')).toHaveText('Clicked');
  
  // 验证Web Component属性
  const element = await page.locator('custom-button');
  const variant = await element.getAttribute('variant');
  expect(variant).toBe('primary');
});

test('shadow dom interaction', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 穿透Shadow DOM查找元素
  const button = await page.locator('custom-button').locator('button');
  await button.click();
  
  // 验证事件传播
  await expect(page.locator('.event-log')).toContainText('Button clicked');
});
```

## 第九部分：最佳实践

### 9.1 组件设计原则

设计可复用的Web Components：
```
1. 单一职责
每个组件只做一件事

2. 明确接口
- 清晰的属性定义
- 语义化的事件
- 完整的文档

3. 样式封装
- 使用Shadow DOM
- CSS变量支持主题
- 响应式设计

4. 性能优先
- 延迟渲染
- 虚拟滚动
- 事件委托

5. 可访问性
- ARIA属性
- 键盘支持
- 语义化HTML

6. 向后兼容
- 优雅降级
- Polyfill支持
- 渐进增强
```

示例：设计良好的Card组件：
```javascript
class WellDesignedCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // 1. 定义属性
    this._title = '';
    this._variant = 'default';
    this._clickable = false;
  }
  
  // 2. 观察属性变化
  static get observedAttributes() {
    return ['title', 'variant', 'clickable'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this[`_${name}`] = newValue;
    this.render();
  }
  
  connectedCallback() {
    this.render();
    
    // 3. 可访问性
    this.setAttribute('role', 'article');
    if (this._clickable) {
      this.setAttribute('tabindex', '0');
      this.addEventListener('keydown', this.handleKeyboard);
    }
  }
  
  disconnectedCallback() {
    this.removeEventListener('keydown', this.handleKeyboard);
  }
  
  handleKeyboard = (event) => {
    if (this._clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.handleClick();
    }
  }
  
  handleClick = () => {
    this.dispatchEvent(new CustomEvent('cardClick', {
      detail: { title: this._title },
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    // 4. 样式封装
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --card-bg: var(--bg-default, white);
          --card-border: var(--border-default, #ddd);
          --card-radius: var(--radius, 8px);
        }
        
        :host([variant="primary"]) {
          --card-bg: var(--bg-primary, #007bff);
          --card-border: var(--border-primary, #0056b3);
        }
        
        .card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--card-radius);
          padding: 16px;
          cursor: ${this._clickable ? 'pointer' : 'default'};
          transition: transform 0.2s;
        }
        
        :host([clickable]) .card:hover {
          transform: translateY(-2px);
        }
        
        .title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
        }
      </style>
      
      <div class="card" ${this._clickable ? 'onclick="this.getRootNode().host.handleClick()"' : ''}>
        ${this._title ? `<h2 class="title">${this._title}</h2>` : ''}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('well-designed-card', WellDesignedCard);
```

### 9.2 错误边界

处理Web Component错误：
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong with the Web Component</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 重置状态
      }}
    >
      <potentially-failing-element />
    </ErrorBoundary>
  );
}
```

Web Component内部错误处理：
```javascript
class SafeElement extends HTMLElement {
  connectedCallback() {
    try {
      this.init();
    } catch (error) {
      this.renderError(error);
      
      // 通知React
      this.dispatchEvent(new CustomEvent('elementError', {
        detail: { error: error.message, stack: error.stack },
        bubbles: true,
        composed: true
      }));
    }
  }
  
  init() {
    // 可能抛出错误的初始化代码
  }
  
  renderError(error) {
    this.innerHTML = `
      <div class="error">
        <h3>Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}
```

### 9.3 内存管理

防止内存泄漏：
```javascript
class MemorySafeElement extends HTMLElement {
  constructor() {
    super();
    this.subscriptions = [];
    this.intervals = [];
    this.listeners = new Map();
  }
  
  connectedCallback() {
    // 记录所有订阅
    const sub = dataSource.subscribe(data => {
      this.update(data);
    });
    this.subscriptions.push(sub);
    
    // 记录所有定时器
    const interval = setInterval(() => {
      this.refresh();
    }, 1000);
    this.intervals.push(interval);
    
    // 记录所有事件监听器
    const handler = this.handleClick.bind(this);
    this.addEventListener('click', handler);
    this.listeners.set('click', handler);
  }
  
  disconnectedCallback() {
    // 清理所有订阅
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    // 清理所有定时器
    this.intervals.forEach(id => clearInterval(id));
    this.intervals = [];
    
    // 清理所有事件监听器
    this.listeners.forEach((handler, event) => {
      this.removeEventListener(event, handler);
    });
    this.listeners.clear();
  }
  
  handleClick(event) {
    // 处理点击
  }
}

customElements.define('memory-safe-element', MemorySafeElement);
```

React端的清理：
```tsx
function CleanupExample() {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    // React组件卸载时，Web Component也会被正确清理
    return () => {
      console.log('Cleaning up');
    };
  }, [show]);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>
        Toggle
      </button>
      
      {show && <memory-safe-element />}
    </div>
  );
}
```

## 常见问题

### Q1: Web Component在React中渲染性能如何？

A: React 19优化了Custom Elements的渲染，性能接近原生React组件。

性能对比：
```
React Component：
- 初始渲染：10ms
- 更新：3ms
- 内存：50KB

Web Component（无Shadow DOM）：
- 初始渲染：12ms
- 更新：4ms
- 内存：55KB

Web Component（有Shadow DOM）：
- 初始渲染：15ms
- 更新：5ms
- 内存：70KB

结论：性能差异很小，可以混用
```

### Q2: 如何在Web Component中使用React Context？

A: 通过props传递Context值。

```tsx
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ComponentUsingContext />
    </ThemeContext.Provider>
  );
}

function ComponentUsingContext() {
  const theme = useContext(ThemeContext);
  
  // 将Context值传递给Web Component
  return (
    <themed-element theme={theme} />
  );
}
```

### Q3: Web Component能否使用React Hooks？

A: 不能直接使用，但可以在Web Component内部渲染React组件来间接使用。

```javascript
import { createRoot } from 'react-dom/client';

class ReactWrappedElement extends HTMLElement {
  connectedCallback() {
    const container = document.createElement('div');
    this.appendChild(container);
    
    const root = createRoot(container);
    root.render(<ReactComponentWithHooks />);
  }
}

function ReactComponentWithHooks() {
  const [state, setState] = useState(0);
  const theme = useContext(ThemeContext);
  
  useEffect(() => {
    // 可以使用所有Hooks
  }, []);
  
  return <div>State: {state}</div>;
}
```

### Q4: 如何优化大量Web Components的性能？

A: 使用虚拟化、懒加载和批量更新。

```tsx
import { FixedSizeList } from 'react-window';

function VirtualizedWebComponents() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));
  
  const Row = ({ index, style }) => (
    <div style={style}>
      <item-card
        data={items[index]}
        key={items[index].id}
      />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Q5: 如何调试React和Web Component的交互？

A: 使用浏览器DevTools和React DevTools。

调试技巧：
```tsx
function DebuggableComponent() {
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    
    if (element) {
      // 监听所有属性变化
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          console.log('Attribute changed:', {
            name: mutation.attributeName,
            oldValue: mutation.oldValue,
            newValue: element.getAttribute(mutation.attributeName)
          });
        });
      });
      
      observer.observe(element, {
        attributes: true,
        attributeOldValue: true
      });
      
      return () => observer.disconnect();
    }
  }, []);
  
  // 拦截所有事件
  const handleAllEvents = (event: Event) => {
    console.log('Event from Web Component:', {
      type: event.type,
      detail: (event as CustomEvent).detail,
      target: event.target
    });
  };
  
  return (
    <debug-element
      ref={elementRef}
      data={data}
      onAll={handleAllEvents} // 自定义：监听所有事件
    />
  );
}
```

## 总结

React 19与Web Components的互操作特性：

核心能力：
```
1. 无缝集成
✅ 直接使用Web Components
✅ 属性自动传递
✅ 事件自动绑定
✅ 生命周期同步

2. 双向通信
✅ React -> Web Component
✅ Web Component -> React
✅ 状态管理集成
✅ 实时数据流

3. 样式管理
✅ Shadow DOM支持
✅ CSS变量穿透
✅ Slot内容投影
✅ 主题系统

4. 性能优化
✅ 懒加载
✅ 批量更新
✅ 内存管理
✅ 虚拟化
```

最佳实践：
```
1. 合理选择
- 简单UI用React组件
- 复杂封装用Web Components
- 第三方库用Web Components

2. 性能优化
- 使用useMemo/useCallback
- 避免不必要的更新
- 正确管理生命周期

3. 类型安全
- 完整的TypeScript定义
- 事件类型定义
- 属性验证

4. 测试覆盖
- 单元测试
- 集成测试
- E2E测试

5. 文档完善
- API文档
- 使用示例
- 最佳实践指南
```

React 19让Web Components成为React生态的重要组成部分，实现真正的组件互操作性！


