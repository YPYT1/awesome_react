# Custom Elements支持改进

## 学习目标

通过本章学习，你将掌握：

- React 19对Web Components的全面支持
- Custom Elements在React中的使用方式
- 属性和事件传递机制
- TypeScript类型定义
- 最佳实践和性能优化
- 常见问题和解决方案
- 与原生Web Components的互操作
- 实际项目集成案例

## 第一部分：Custom Elements基础

### 1.1 什么是Custom Elements

Custom Elements是Web Components标准的核心部分，允许开发者创建自定义HTML元素。

基本概念：
```javascript
// 定义Custom Element
class MyElement extends HTMLElement {
  constructor() {
    super();
    // 初始化
  }
  
  connectedCallback() {
    // 元素被添加到DOM时调用
    this.innerHTML = '<p>Hello, Custom Element!</p>';
  }
  
  disconnectedCallback() {
    // 元素从DOM移除时调用
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    // 属性变化时调用
  }
  
  static get observedAttributes() {
    return ['value', 'color'];
  }
}

// 注册Custom Element
customElements.define('my-element', MyElement);

// 使用
// <my-element></my-element>
```

Custom Elements的优势：
```
1. 封装性
- 独立的组件
- 内部实现细节隐藏
- 可复用

2. 互操作性
- 可在任何框架中使用
- 标准Web平台API
- 不依赖特定框架

3. 生命周期
- connectedCallback
- disconnectedCallback
- attributeChangedCallback
- adoptedCallback

4. Shadow DOM集成
- 样式封装
- DOM封装
- 事件封装
```

### 1.2 React 18及之前的限制

在React 19之前，使用Custom Elements存在诸多限制：

限制1：属性传递问题
```jsx
// React 18：所有属性都作为字符串传递
function App() {
  const data = { name: 'John', age: 30 };
  
  // 问题：对象会被转为 "[object Object]"
  return <my-element value={data}></my-element>;
  
  // 实际DOM：<my-element value="[object Object]"></my-element>
}

// 必须手动使用ref设置属性
function App() {
  const ref = useRef(null);
  const data = { name: 'John', age: 30 };
  
  useEffect(() => {
    if (ref.current) {
      ref.current.value = data; // 手动设置
    }
  }, [data]);
  
  return <my-element ref={ref}></my-element>;
}
```

限制2：事件监听问题
```jsx
// React 18：自定义事件不能直接监听
function App() {
  // 不起作用
  return (
    <my-element 
      oncustomEvent={handleEvent}
    ></my-element>
  );
}

// 必须手动添加事件监听
function App() {
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('customEvent', handleEvent);
      return () => {
        element.removeEventListener('customEvent', handleEvent);
      };
    }
  }, []);
  
  return <my-element ref={ref}></my-element>;
}
```

限制3：类型定义问题
```typescript
// React 18：TypeScript不识别Custom Elements
function App() {
  // 错误：Property 'my-element' does not exist
  return <my-element value="hello"></my-element>;
}

// 需要手动声明
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        value?: string;
        oncustomEvent?: (e: CustomEvent) => void;
      };
    }
  }
}
```

### 1.3 React 19的改进

React 19全面改进了对Custom Elements的支持，解决了上述所有限制。

核心改进：
```
1. 属性传递
✅ 自动检测属性类型
✅ 对象、数组、函数直接传递
✅ 无需手动ref设置

2. 事件监听
✅ 自定义事件直接监听
✅ 使用on前缀
✅ 自动清理

3. 类型支持
✅ TypeScript类型定义改进
✅ 自动补全
✅ 类型检查

4. 性能优化
✅ 更少的DOM操作
✅ 更好的协调
✅ 更快的更新
```

改进对比：
```jsx
// React 18：复杂且易错
function React18Example() {
  const ref = useRef(null);
  const data = { items: [1, 2, 3] };
  
  useEffect(() => {
    if (ref.current) {
      ref.current.value = data;
      ref.current.addEventListener('change', handleChange);
      return () => {
        ref.current.removeEventListener('change', handleChange);
      };
    }
  }, [data]);
  
  return <my-element ref={ref}></my-element>;
}

// React 19：简洁直观
function React19Example() {
  const data = { items: [1, 2, 3] };
  
  return (
    <my-element 
      value={data}
      onchange={handleChange}
    ></my-element>
  );
}
```

## 第二部分：属性传递机制

### 2.1 字符串属性

最基本的属性传递，与原生HTML元素一致。

基本用法：
```jsx
function App() {
  return (
    <my-element 
      name="John"
      title="Hello World"
      color="blue"
    ></my-element>
  );
}

// 生成的HTML：
// <my-element name="John" title="Hello World" color="blue"></my-element>
```

Custom Element接收：
```javascript
class MyElement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'title', 'color'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`${name} changed from ${oldValue} to ${newValue}`);
    
    switch(name) {
      case 'name':
        this.updateName(newValue);
        break;
      case 'title':
        this.updateTitle(newValue);
        break;
      case 'color':
        this.updateColor(newValue);
        break;
    }
  }
  
  updateName(name) {
    if (this._nameElement) {
      this._nameElement.textContent = name;
    }
  }
  
  connectedCallback() {
    this.innerHTML = `
      <div style="color: ${this.getAttribute('color')}">
        <h2 id="title">${this.getAttribute('title')}</h2>
        <p id="name">${this.getAttribute('name')}</p>
      </div>
    `;
    this._nameElement = this.querySelector('#name');
  }
}

customElements.define('my-element', MyElement);
```

动态更新：
```jsx
function App() {
  const [name, setName] = useState('John');
  const [color, setColor] = useState('blue');
  
  return (
    <div>
      <my-element 
        name={name}
        color={color}
      ></my-element>
      
      <button onClick={() => setName('Jane')}>
        Change Name
      </button>
      <button onClick={() => setColor('red')}>
        Change Color
      </button>
    </div>
  );
}
```

### 2.2 对象和数组属性

React 19的重大改进：可以直接传递对象和数组。

对象属性：
```jsx
function App() {
  const user = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  };
  
  return (
    <my-element value={user}></my-element>
  );
}
```

Custom Element定义：
```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    // 关键：在构造函数中定义属性
    this.value = undefined;
  }
  
  connectedCallback() {
    // value现在是对象，不是字符串
    if (this.value) {
      this.innerHTML = `
        <div>
          <h2>${this.value.name}</h2>
          <p>Age: ${this.value.age}</p>
          <p>Email: ${this.value.email}</p>
        </div>
      `;
    }
  }
  
  set value(val) {
    this._value = val;
    if (this.isConnected) {
      this.render();
    }
  }
  
  get value() {
    return this._value;
  }
  
  render() {
    if (this._value) {
      this.innerHTML = `
        <div>
          <h2>${this._value.name}</h2>
          <p>Age: ${this._value.age}</p>
          <p>Email: ${this._value.email}</p>
        </div>
      `;
    }
  }
}

customElements.define('my-element', MyElement);
```

数组属性：
```jsx
function App() {
  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];
  
  return (
    <my-list items={items}></my-list>
  );
}
```

Custom Element处理数组：
```javascript
class MyList extends HTMLElement {
  constructor() {
    super();
    this.items = [];
  }
  
  set items(value) {
    this._items = value || [];
    if (this.isConnected) {
      this.render();
    }
  }
  
  get items() {
    return this._items;
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <ul>
        ${this._items.map(item => `
          <li key="${item.id}">${item.name}</li>
        `).join('')}
      </ul>
    `;
  }
}

customElements.define('my-list', MyList);
```

复杂嵌套对象：
```jsx
function App() {
  const data = {
    user: {
      profile: {
        name: 'John',
        avatar: '/avatar.jpg'
      },
      settings: {
        theme: 'dark',
        language: 'en'
      }
    },
    posts: [
      { id: 1, title: 'Post 1', tags: ['react', 'web'] },
      { id: 2, title: 'Post 2', tags: ['javascript'] }
    ],
    stats: {
      views: 1000,
      likes: 50
    }
  };
  
  return (
    <complex-element data={data}></complex-element>
  );
}
```

### 2.3 函数属性

React 19允许传递函数作为属性，实现回调功能。

基本回调：
```jsx
function App() {
  const handleClick = (data) => {
    console.log('Clicked:', data);
  };
  
  const handleChange = (value) => {
    console.log('Changed:', value);
  };
  
  return (
    <my-element 
      onClick={handleClick}
      onChange={handleChange}
    ></my-element>
  );
}
```

Custom Element使用回调：
```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    this.onClick = null;
    this.onChange = null;
  }
  
  connectedCallback() {
    this.innerHTML = `
      <button id="btn">Click Me</button>
      <input id="input" type="text" />
    `;
    
    const btn = this.querySelector('#btn');
    const input = this.querySelector('#input');
    
    btn.addEventListener('click', () => {
      if (this.onClick) {
        this.onClick({ timestamp: Date.now() });
      }
    });
    
    input.addEventListener('input', (e) => {
      if (this.onChange) {
        this.onChange(e.target.value);
      }
    });
  }
}

customElements.define('my-element', MyElement);
```

多个回调函数：
```jsx
function App() {
  const [data, setData] = useState(null);
  
  const callbacks = {
    onSave: (value) => {
      console.log('Saving:', value);
      setData(value);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    onValidate: (value) => {
      return value.length > 0;
    }
  };
  
  return (
    <my-form 
      callbacks={callbacks}
      initialData={data}
    ></my-form>
  );
}
```

### 2.4 属性更新机制

React 19智能检测属性变化并高效更新。

属性类型检测：
```javascript
// React 19内部逻辑（简化版）
function setProperty(element, name, value) {
  // 1. 检查元素是否定义了该属性
  if (name in element) {
    // 2. 直接设置属性（对象、数组、函数）
    element[name] = value;
  } else {
    // 3. 作为HTML属性设置（字符串）
    if (value == null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, String(value));
    }
  }
}
```

性能优化：
```jsx
// React自动优化，只在值变化时更新
function App() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState({ items: [] });
  
  // data引用相同时，不会触发更新
  const stableData = useMemo(() => data, [data]);
  
  return (
    <my-element 
      count={count}
      data={stableData}
    ></my-element>
  );
}
```

监听属性变化：
```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    this._data = null;
  }
  
  set data(value) {
    const oldValue = this._data;
    this._data = value;
    
    // 只在值真正改变时更新
    if (oldValue !== value) {
      console.log('Data changed:', { oldValue, newValue: value });
      this.render();
    }
  }
  
  get data() {
    return this._data;
  }
  
  render() {
    // 渲染逻辑
  }
}
```

## 第三部分：事件处理

### 3.1 自定义事件监听

React 19支持直接监听Custom Elements的自定义事件。

基本事件监听：
```jsx
function App() {
  const handleSpeak = (event) => {
    console.log('Element spoke:', event.detail.message);
  };
  
  return (
    <my-element 
      onspeak={handleSpeak}
    ></my-element>
  );
}
```

Custom Element触发事件：
```javascript
class MyElement extends HTMLElement {
  constructor() {
    super();
    this.emitEvent = this._emitEvent.bind(this);
  }
  
  connectedCallback() {
    this.innerHTML = '<button id="btn">Say Hi</button>';
    const btn = this.querySelector('#btn');
    btn.addEventListener('click', this.emitEvent);
  }
  
  disconnectedCallback() {
    const btn = this.querySelector('#btn');
    if (btn) {
      btn.removeEventListener('click', this.emitEvent);
    }
  }
  
  _emitEvent() {
    // 创建自定义事件
    const event = new CustomEvent('speak', {
      detail: {
        message: 'Hello, World!',
        timestamp: Date.now()
      },
      bubbles: true,
      composed: true
    });
    
    // 触发事件
    this.dispatchEvent(event);
  }
}

customElements.define('my-element', MyElement);
```

事件命名规则：
```jsx
// React 19自动将onXxx转换为对应的事件名
function App() {
  return (
    <my-element 
      onspeak={handleSpeak}           // 监听 'speak' 事件
      oncustomChange={handleChange}    // 监听 'customChange' 事件
      onmyEvent={handleMyEvent}        // 监听 'myEvent' 事件
    ></my-element>
  );
}

// 注意：
// - on后的首字母小写对应事件名
// - onspeak -> 'speak'
// - oncustomChange -> 'customChange'
// - onmyEvent -> 'myEvent'
```

### 3.2 事件对象和detail

CustomEvent的detail属性用于传递自定义数据。

简单数据：
```javascript
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<button>Click</button>';
    this.querySelector('button').addEventListener('click', () => {
      const event = new CustomEvent('buttonClick', {
        detail: { count: this.clickCount++ },
        bubbles: true
      });
      this.dispatchEvent(event);
    });
  }
}
```

React组件接收：
```jsx
function App() {
  const [count, setCount] = useState(0);
  
  const handleButtonClick = (event) => {
    setCount(event.detail.count);
  };
  
  return (
    <div>
      <my-button onbuttonClick={handleButtonClick}></my-button>
      <p>Clicked: {count} times</p>
    </div>
  );
}
```

复杂数据传递：
```javascript
class DataTable extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <table>
        <tr onclick="this.getRootNode().host.handleRowClick(event, 0)">
          <td>Row 1</td>
        </tr>
        <tr onclick="this.getRootNode().host.handleRowClick(event, 1)">
          <td>Row 2</td>
        </tr>
      </table>
    `;
  }
  
  handleRowClick(event, rowIndex) {
    const rowData = {
      index: rowIndex,
      cells: Array.from(event.currentTarget.cells).map(cell => cell.textContent),
      timestamp: Date.now()
    };
    
    const customEvent = new CustomEvent('rowClick', {
      detail: rowData,
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(customEvent);
  }
}

customElements.define('data-table', DataTable);
```

React组件使用：
```jsx
function App() {
  const [selectedRow, setSelectedRow] = useState(null);
  
  const handleRowClick = (event) => {
    const { index, cells, timestamp } = event.detail;
    setSelectedRow({ index, cells, timestamp });
  };
  
  return (
    <div>
      <data-table onrowClick={handleRowClick}></data-table>
      {selectedRow && (
        <div>
          <h3>Selected Row:</h3>
          <p>Index: {selectedRow.index}</p>
          <p>Cells: {selectedRow.cells.join(', ')}</p>
          <p>Time: {new Date(selectedRow.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
```

### 3.3 事件冒泡和捕获

Custom Events可以配置冒泡和composed行为。

事件冒泡：
```javascript
class NestedElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="outer">
        <div id="inner">
          <button id="btn">Click</button>
        </div>
      </div>
    `;
    
    this.querySelector('#btn').addEventListener('click', () => {
      // bubbles: true - 事件会冒泡
      const event = new CustomEvent('nested-click', {
        detail: { source: 'button' },
        bubbles: true
      });
      this.dispatchEvent(event);
    });
  }
}

customElements.define('nested-element', NestedElement);
```

React捕获冒泡事件：
```jsx
function App() {
  const handleNestedClick = (event) => {
    console.log('Caught bubbled event:', event.detail.source);
  };
  
  return (
    <div onnestedClick={handleNestedClick}>
      <nested-element></nested-element>
    </div>
  );
}
```

Shadow DOM事件：
```javascript
class ShadowElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = '<button id="btn">Click</button>';
    
    this.shadowRoot.querySelector('#btn').addEventListener('click', () => {
      // composed: true - 穿透Shadow DOM边界
      const event = new CustomEvent('shadow-click', {
        detail: { from: 'shadow-dom' },
        bubbles: true,
        composed: true  // 关键：允许穿透Shadow DOM
      });
      this.dispatchEvent(event);
    });
  }
}

customElements.define('shadow-element', ShadowElement);
```

React监听Shadow DOM事件：
```jsx
function App() {
  const handleShadowClick = (event) => {
    console.log('Event from Shadow DOM:', event.detail.from);
  };
  
  return (
    <shadow-element onshadowClick={handleShadowClick}></shadow-element>
  );
}
```

### 3.4 事件清理

React 19自动处理事件监听器的清理。

自动清理：
```jsx
function App() {
  const [show, setShow] = useState(true);
  
  const handleCustomEvent = (event) => {
    console.log('Event:', event.detail);
  };
  
  return (
    <div>
      {show && (
        <my-element oncustomEvent={handleCustomEvent}></my-element>
      )}
      <button onClick={() => setShow(!show)}>
        Toggle
      </button>
    </div>
  );
}

// React自动：
// - 组件mount时添加事件监听
// - 组件unmount时移除事件监听
// - 无需手动cleanup
```

对比React 18的手动清理：
```jsx
// React 18：需要手动清理
function React18Example() {
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (element) {
      const handler = (event) => {
        console.log('Event:', event.detail);
      };
      
      element.addEventListener('customEvent', handler);
      
      // 必须手动清理
      return () => {
        element.removeEventListener('customEvent', handler);
      };
    }
  }, []);
  
  return <my-element ref={ref}></my-element>;
}

// React 19：自动清理
function React19Example() {
  const handleCustomEvent = (event) => {
    console.log('Event:', event.detail);
  };
  
  return (
    <my-element oncustomEvent={handleCustomEvent}></my-element>
  );
}
```

## 第四部分：TypeScript集成

### 4.1 类型定义基础

React 19改进了Custom Elements的TypeScript支持。

基本类型定义：
```typescript
// global.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        value?: string;
        count?: number;
        onspeak?: (event: CustomEvent<{ message: string }>) => void;
      };
    }
  }
}
```

使用类型定义：
```tsx
function App() {
  const handleSpeak = (event: CustomEvent<{ message: string }>) => {
    console.log(event.detail.message); // 类型安全
  };
  
  return (
    <my-element 
      value="hello"
      count={42}
      onspeak={handleSpeak}
    ></my-element>
  );
}
```

### 4.2 复杂类型定义

定义复杂的属性类型：
```typescript
// types/custom-elements.d.ts
interface UserData {
  id: number;
  name: string;
  email: string;
}

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'user-card': {
        user?: UserData;
        theme?: 'light' | 'dark';
        onuserClick?: (event: CustomEvent<UserData>) => void;
      };
      
      'todo-list': {
        items?: ListItem[];
        filter?: 'all' | 'active' | 'completed';
        onitemToggle?: (event: CustomEvent<{ id: string; completed: boolean }>) => void;
        onitemDelete?: (event: CustomEvent<{ id: string }>) => void;
      };
    }
  }
}
```

类型安全的使用：
```tsx
function App() {
  const user: UserData = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  const handleUserClick = (event: CustomEvent<UserData>) => {
    const userData = event.detail;
    console.log(`User ${userData.name} clicked`);
  };
  
  const items: ListItem[] = [
    { id: '1', text: 'Learn React', completed: false },
    { id: '2', text: 'Build App', completed: true }
  ];
  
  const handleItemToggle = (event: CustomEvent<{ id: string; completed: boolean }>) => {
    console.log(`Item ${event.detail.id} toggled to ${event.detail.completed}`);
  };
  
  return (
    <div>
      <user-card 
        user={user}
        theme="dark"
        onuserClick={handleUserClick}
      ></user-card>
      
      <todo-list
        items={items}
        filter="all"
        onitemToggle={handleItemToggle}
      ></todo-list>
    </div>
  );
}
```

### 4.3 泛型Custom Elements

使用泛型定义可复用的Custom Elements：
```typescript
// types/generic-elements.d.ts
interface DataTableItem {
  id: string | number;
  [key: string]: any;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'data-table': {
        data?: DataTableItem[];
        columns?: Array<{
          key: string;
          title: string;
          render?: (value: any, item: DataTableItem) => string;
        }>;
        onrowClick?: (event: CustomEvent<DataTableItem>) => void;
        onsort?: (event: CustomEvent<{ column: string; direction: 'asc' | 'desc' }>) => void;
      };
    }
  }
}
```

使用泛型类型：
```tsx
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

function ProductTable() {
  const products: Product[] = [
    { id: 1, name: 'Product A', price: 99.99, stock: 10 },
    { id: 2, name: 'Product B', price: 149.99, stock: 5 }
  ];
  
  const columns = [
    { key: 'name', title: 'Name' },
    { 
      key: 'price', 
      title: 'Price',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { key: 'stock', title: 'Stock' }
  ];
  
  const handleRowClick = (event: CustomEvent<Product>) => {
    const product = event.detail as Product;
    console.log(`Selected product: ${product.name}`);
  };
  
  return (
    <data-table
      data={products}
      columns={columns}
      onrowClick={handleRowClick}
    ></data-table>
  );
}
```

### 4.4 类型增强和自动补全

配置JSX命名空间以获得更好的IDE支持：
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx", // 或 "react"
    "jsxImportSource": "react", // React 19推荐
    "types": ["./types/custom-elements.d.ts"]
  }
}
```

详细的类型定义：
```typescript
// types/custom-elements.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'advanced-input': {
        // 基本属性
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        
        // 复杂属性
        validators?: Array<(value: string) => boolean | string>;
        formatters?: Array<(value: string) => string>;
        
        // 事件
        oninput?: (event: CustomEvent<{ value: string; valid: boolean }>) => void;
        onfocus?: (event: CustomEvent<{}>) => void;
        onblur?: (event: CustomEvent<{ value: string }>) => void;
        onvalidate?: (event: CustomEvent<{ valid: boolean; errors: string[] }>) => void;
        
        // 样式相关
        className?: string;
        style?: React.CSSProperties;
        
        // 子元素
        children?: React.ReactNode;
      };
    }
  }
}
```

完整的类型安全示例：
```tsx
function Form() {
  const validators = [
    (value: string) => value.length > 0 || 'Required',
    (value: string) => value.length <= 50 || 'Too long'
  ];
  
  const formatters = [
    (value: string) => value.trim(),
    (value: string) => value.toUpperCase()
  ];
  
  const handleInput = (event: CustomEvent<{ value: string; valid: boolean }>) => {
    console.log('Input:', event.detail.value, 'Valid:', event.detail.valid);
  };
  
  const handleValidate = (event: CustomEvent<{ valid: boolean; errors: string[] }>) => {
    if (!event.detail.valid) {
      console.error('Validation errors:', event.detail.errors);
    }
  };
  
  return (
    <advanced-input
      placeholder="Enter text..."
      validators={validators}
      formatters={formatters}
      oninput={handleInput}
      onvalidate={handleValidate}
      style={{ border: '1px solid #ccc', padding: '8px' }}
    />
  );
}
```

## 第五部分：实战案例

### 5.1 第三方UI组件库集成

集成Material Web Components：
```bash
npm install @material/web
```

使用Material Components：
```tsx
// types/material-web.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': {
        disabled?: boolean;
        type?: 'button' | 'submit' | 'reset';
        onclick?: (event: MouseEvent) => void;
        children?: React.ReactNode;
      };
      
      'md-filled-text-field': {
        label?: string;
        value?: string;
        type?: string;
        required?: boolean;
        disabled?: boolean;
        error?: boolean;
        errorText?: string;
        oninput?: (event: InputEvent) => void;
        onchange?: (event: Event) => void;
      };
    }
  }
}
```

React组件中使用：
```tsx
import '@material/web/button/filled-button.js';
import '@material/web/textfield/filled-text-field.js';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleEmailChange = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    setEmail(target.value);
  };
  
  const handlePasswordChange = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    setPassword(target.value);
  };
  
  const handleSubmit = (event: MouseEvent) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    console.log('Submitting:', { email, password });
  };
  
  return (
    <form>
      <md-filled-text-field
        label="Email"
        type="email"
        value={email}
        required
        oninput={handleEmailChange}
      ></md-filled-text-field>
      
      <md-filled-text-field
        label="Password"
        type="password"
        value={password}
        required
        error={!!error}
        errorText={error}
        oninput={handlePasswordChange}
      ></md-filled-text-field>
      
      <md-filled-button
        type="submit"
        onclick={handleSubmit}
      >
        Login
      </md-filled-button>
    </form>
  );
}
```

### 5.2 自定义Chart组件

创建基于Chart.js的Custom Element：
```javascript
// chart-element.js
import Chart from 'chart.js/auto';

class ChartElement extends HTMLElement {
  constructor() {
    super();
    this.chart = null;
    this._data = null;
    this._options = null;
  }
  
  set data(value) {
    this._data = value;
    this.updateChart();
  }
  
  get data() {
    return this._data;
  }
  
  set options(value) {
    this._options = value;
    this.updateChart();
  }
  
  get options() {
    return this._options;
  }
  
  connectedCallback() {
    const canvas = document.createElement('canvas');
    this.appendChild(canvas);
    
    if (this._data) {
      this.createChart(canvas);
    }
  }
  
  disconnectedCallback() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
  
  createChart(canvas) {
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: this._data.type || 'line',
      data: this._data,
      options: this._options || {}
    });
  }
  
  updateChart() {
    if (this.chart && this._data) {
      this.chart.data = this._data;
      if (this._options) {
        this.chart.options = this._options;
      }
      this.chart.update();
    }
  }
}

customElements.define('chart-element', ChartElement);
```

TypeScript类型定义：
```typescript
// types/chart-element.d.ts
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'chart-element': {
        data?: ChartData;
        options?: ChartOptions;
        onchartClick?: (event: CustomEvent<{ index: number; datasetIndex: number }>) => void;
      };
    }
  }
}
```

React组件中使用：
```tsx
import './chart-element.js';

function Dashboard() {
  const [chartData, setChartData] = useState({
    type: 'line',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  });
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Sales'
      }
    }
  };
  
  const addData = () => {
    setChartData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: [...prev.datasets[0].data, Math.floor(Math.random() * 20)]
      }]
    }));
  };
  
  return (
    <div>
      <chart-element 
        data={chartData}
        options={options}
      ></chart-element>
      
      <button onClick={addData}>Add Data Point</button>
    </div>
  );
}
```

### 5.3 富文本编辑器集成

集成Quill编辑器作为Custom Element：
```javascript
// quill-editor.js
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

class QuillEditor extends HTMLElement {
  constructor() {
    super();
    this.quill = null;
    this._value = '';
    this.onChange = null;
  }
  
  set value(val) {
    this._value = val;
    if (this.quill && this.quill.root.innerHTML !== val) {
      this.quill.root.innerHTML = val;
    }
  }
  
  get value() {
    return this._value;
  }
  
  connectedCallback() {
    const container = document.createElement('div');
    container.className = 'quill-container';
    this.appendChild(container);
    
    this.quill = new Quill(container, {
      theme: 'snow',
      placeholder: this.getAttribute('placeholder') || 'Write something...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['link', 'image'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['clean']
        ]
      }
    });
    
    if (this._value) {
      this.quill.root.innerHTML = this._value;
    }
    
    this.quill.on('text-change', () => {
      this._value = this.quill.root.innerHTML;
      
      if (this.onChange) {
        this.onChange(this._value);
      }
      
      const event = new CustomEvent('contentChange', {
        detail: { 
          html: this._value,
          text: this.quill.getText(),
          delta: this.quill.getContents()
        },
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    });
  }
  
  disconnectedCallback() {
    if (this.quill) {
      this.quill.off('text-change');
      this.quill = null;
    }
  }
}

customElements.define('quill-editor', QuillEditor);
```

TypeScript类型：
```typescript
// types/quill-editor.d.ts
interface QuillContent {
  html: string;
  text: string;
  delta: any;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'quill-editor': {
        value?: string;
        placeholder?: string;
        onChange?: (html: string) => void;
        oncontentChange?: (event: CustomEvent<QuillContent>) => void;
      };
    }
  }
}
```

React使用示例：
```tsx
import './quill-editor.js';

function ArticleEditor() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  const handleContentChange = (event: CustomEvent<QuillContent>) => {
    const { html, text } = event.detail;
    setContent(html);
    setWordCount(text.trim().split(/\s+/).length);
  };
  
  const handleSave = () => {
    console.log('Saving article:', content);
    // API调用
  };
  
  return (
    <div className="article-editor">
      <div className="editor-header">
        <h2>Write Article</h2>
        <span>Words: {wordCount}</span>
      </div>
      
      <quill-editor
        value={content}
        placeholder="Start writing your article..."
        oncontentChange={handleContentChange}
      ></quill-editor>
      
      <div className="editor-footer">
        <button onClick={handleSave}>Save Draft</button>
        <button onClick={() => console.log('Publishing...')}>Publish</button>
      </div>
    </div>
  );
}
```

### 5.4 地图组件集成

集成Leaflet地图：
```javascript
// map-element.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class MapElement extends HTMLElement {
  constructor() {
    super();
    this.map = null;
    this.markers = [];
    this._center = [51.505, -0.09];
    this._zoom = 13;
    this._markerData = [];
  }
  
  set center(value) {
    this._center = value;
    if (this.map) {
      this.map.setView(value, this._zoom);
    }
  }
  
  get center() {
    return this._center;
  }
  
  set zoom(value) {
    this._zoom = value;
    if (this.map) {
      this.map.setZoom(value);
    }
  }
  
  get zoom() {
    return this._zoom;
  }
  
  set markerData(value) {
    this._markerData = value || [];
    this.updateMarkers();
  }
  
  get markerData() {
    return this._markerData;
  }
  
  connectedCallback() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '400px';
    this.appendChild(container);
    
    this.map = L.map(container).setView(this._center, this._zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    this.updateMarkers();
  }
  
  disconnectedCallback() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
  
  updateMarkers() {
    if (!this.map) return;
    
    // 清除旧标记
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
    
    // 添加新标记
    this._markerData.forEach(data => {
      const marker = L.marker(data.position).addTo(this.map);
      
      if (data.popup) {
        marker.bindPopup(data.popup);
      }
      
      marker.on('click', () => {
        const event = new CustomEvent('markerClick', {
          detail: data,
          bubbles: true,
          composed: true
        });
        this.dispatchEvent(event);
      });
      
      this.markers.push(marker);
    });
  }
}

customElements.define('map-element', MapElement);
```

TypeScript类型：
```typescript
// types/map-element.d.ts
interface MarkerData {
  position: [number, number];
  popup?: string;
  id?: string;
  [key: string]: any;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'map-element': {
        center?: [number, number];
        zoom?: number;
        markerData?: MarkerData[];
        onmarkerClick?: (event: CustomEvent<MarkerData>) => void;
      };
    }
  }
}
```

React使用：
```tsx
import './map-element.js';

function LocationPicker() {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      position: [51.5, -0.09],
      popup: 'London',
      id: '1',
      name: 'London'
    },
    {
      position: [51.51, -0.1],
      popup: 'Westminster',
      id: '2',
      name: 'Westminster'
    }
  ]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  
  const handleMarkerClick = (event: CustomEvent<MarkerData>) => {
    const marker = event.detail;
    setSelectedMarker(marker);
    console.log('Marker clicked:', marker);
  };
  
  const addMarker = () => {
    const newMarker: MarkerData = {
      position: [51.505 + Math.random() * 0.1, -0.09 + Math.random() * 0.1],
      popup: `Marker ${markers.length + 1}`,
      id: String(markers.length + 1),
      name: `Location ${markers.length + 1}`
    };
    setMarkers([...markers, newMarker]);
  };
  
  return (
    <div className="location-picker">
      <div className="map-controls">
        <button onClick={addMarker}>Add Random Marker</button>
        {selectedMarker && (
          <div className="selected-info">
            Selected: {selectedMarker.name}
          </div>
        )}
      </div>
      
      <map-element
        center={center}
        zoom={13}
        markerData={markers}
        onmarkerClick={handleMarkerClick}
      ></map-element>
    </div>
  );
}
```

## 第六部分：性能优化

### 6.1 属性更新优化

避免不必要的属性更新：
```tsx
// 不好：每次渲染都创建新对象
function BadExample() {
  const [count, setCount] = useState(0);
  
  return (
    <my-element 
      data={{ count }}  // 每次都是新对象
    ></my-element>
  );
}

// 好：使用useMemo缓存对象
function GoodExample() {
  const [count, setCount] = useState(0);
  
  const data = useMemo(() => ({ count }), [count]);
  
  return (
    <my-element 
      data={data}  // 只在count变化时更新
    ></my-element>
  );
}
```

优化函数属性：
```tsx
// 不好：每次都是新函数
function BadExample() {
  return (
    <my-element 
      onChange={(value) => console.log(value)}
    ></my-element>
  );
}

// 好：使用useCallback
function GoodExample() {
  const handleChange = useCallback((value) => {
    console.log(value);
  }, []);
  
  return (
    <my-element 
      onChange={handleChange}
    ></my-element>
  );
}
```

### 6.2 事件处理优化

事件委托：
```javascript
// Custom Element内部使用事件委托
class OptimizedList extends HTMLElement {
  constructor() {
    super();
    this._items = [];
  }
  
  connectedCallback() {
    this.render();
    
    // 使用事件委托而不是为每个项添加监听器
    this.addEventListener('click', this.handleClick.bind(this));
  }
  
  handleClick(event) {
    const item = event.target.closest('[data-item-id]');
    if (item) {
      const itemId = item.dataset.itemId;
      const customEvent = new CustomEvent('itemClick', {
        detail: { id: itemId },
        bubbles: true
      });
      this.dispatchEvent(customEvent);
    }
  }
  
  set items(value) {
    this._items = value;
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <ul>
        ${this._items.map(item => `
          <li data-item-id="${item.id}">${item.text}</li>
        `).join('')}
      </ul>
    `;
  }
}

customElements.define('optimized-list', OptimizedList);
```

防抖和节流：
```tsx
function OptimizedSearch() {
  const [query, setQuery] = useState('');
  
  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      console.log('Searching:', value);
    }, 300),
    []
  );
  
  const handleInput = useCallback((event: CustomEvent<{ value: string }>) => {
    const value = event.detail.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);
  
  return (
    <search-input 
      value={query}
      oninput={handleInput}
    ></search-input>
  );
}

// 辅助函数
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### 6.3 渲染优化

使用Shadow DOM优化样式隔离：
```javascript
class PerformantElement extends HTMLElement {
  constructor() {
    super();
    // 使用Shadow DOM
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    // Shadow DOM中的样式不会影响外部
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          contain: layout style paint;
        }
        .container {
          padding: 16px;
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('performant-element', PerformantElement);
```

使用CSS containment：
```javascript
class ContainedElement extends HTMLElement {
  connectedCallback() {
    this.style.contain = 'layout style paint';
    // 告诉浏览器这个元素是独立的
    // 浏览器可以优化渲染
  }
}
```

## 第七部分：最佳实践

### 7.1 命名规范

Custom Elements命名：
```
规则：
1. 必须包含连字符（-）
2. 小写字母
3. 不能是保留字
4. 语义化命名

✅ 好的命名：
- user-card
- data-table
- date-picker
- nav-menu

❌ 不好的命名：
- usercard（没有连字符）
- UserCard（大写）
- div（保留字）
- x（不语义化）
```

属性命名：
```typescript
// 使用小写和连字符
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        'data-value'?: string;      // ✅ 好
        dataValue?: string;          // ✅ 也可以
        DataValue?: string;          // ❌ 避免
      };
    }
  }
}
```

事件命名：
```javascript
// 使用语义化的动词
class MyElement extends HTMLElement {
  emitEvents() {
    // ✅ 好的事件名
    this.dispatchEvent(new CustomEvent('itemAdded', {...}));
    this.dispatchEvent(new CustomEvent('dataLoaded', {...}));
    this.dispatchEvent(new CustomEvent('userLoggedIn', {...}));
    
    // ❌ 不好的事件名
    this.dispatchEvent(new CustomEvent('e1', {...}));
    this.dispatchEvent(new CustomEvent('update', {...})); // 太泛
  }
}
```

### 7.2 错误处理

Custom Element中的错误处理：
```javascript
class RobustElement extends HTMLElement {
  constructor() {
    super();
    this._data = null;
    this._error = null;
  }
  
  set data(value) {
    try {
      // 验证数据
      if (!value) {
        throw new Error('Data is required');
      }
      
      if (typeof value !== 'object') {
        throw new Error('Data must be an object');
      }
      
      this._data = value;
      this._error = null;
      this.render();
    } catch (error) {
      this._error = error.message;
      this.renderError();
      
      // 触发错误事件
      this.dispatchEvent(new CustomEvent('error', {
        detail: { message: error.message, data: value },
        bubbles: true
      }));
    }
  }
  
  render() {
    this.innerHTML = `<div>${JSON.stringify(this._data)}</div>`;
  }
  
  renderError() {
    this.innerHTML = `<div class="error">${this._error}</div>`;
  }
}

customElements.define('robust-element', RobustElement);
```

React中处理错误：
```tsx
function App() {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = (event: CustomEvent<{ message: string }>) => {
    setError(event.detail.message);
    console.error('Element error:', event.detail.message);
  };
  
  return (
    <div>
      {error && <div className="error-banner">{error}</div>}
      
      <robust-element
        data={undefined} // 会触发错误
        onerror={handleError}
      ></robust-element>
    </div>
  );
}
```

### 7.3 可访问性

确保Custom Elements可访问：
```javascript
class AccessibleButton extends HTMLElement {
  connectedCallback() {
    // 设置ARIA属性
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.textContent || 'Button');
    }
    
    // 键盘支持
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
    
    // 焦点管理
    this.addEventListener('focus', () => {
      this.style.outline = '2px solid blue';
    });
    
    this.addEventListener('blur', () => {
      this.style.outline = 'none';
    });
  }
}

customElements.define('accessible-button', AccessibleButton);
```

使用语义化ARIA：
```tsx
function AccessibleForm() {
  const [error, setError] = useState('');
  
  return (
    <form role="form" aria-labelledby="form-title">
      <h2 id="form-title">Login Form</h2>
      
      <custom-input
        label="Email"
        type="email"
        required
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby="email-error"
      ></custom-input>
      
      {error && (
        <div id="email-error" role="alert">
          {error}
        </div>
      )}
      
      <accessible-button
        type="submit"
        aria-label="Submit login form"
      >
        Login
      </accessible-button>
    </form>
  );
}
```

### 7.4 文档和注释

为Custom Elements编写文档：
```typescript
/**
 * Data Table Custom Element
 * 
 * A flexible data table component with sorting, filtering, and pagination.
 * 
 * @element data-table
 * 
 * @prop {Array<Object>} data - Array of objects to display
 * @prop {Array<Column>} columns - Column definitions
 * @prop {number} pageSize - Number of items per page (default: 10)
 * @prop {boolean} sortable - Enable sorting (default: true)
 * 
 * @fires {CustomEvent<Object>} rowClick - Fired when a row is clicked
 * @fires {CustomEvent<{column: string, direction: string}>} sort - Fired when sorting changes
 * @fires {CustomEvent<number>} pageChange - Fired when page changes
 * 
 * @example
 * ```tsx
 * <data-table
 *   data={[{ id: 1, name: 'John' }]}
 *   columns={[{ key: 'name', title: 'Name' }]}
 *   pageSize={20}
 *   onrowClick={(e) => console.log(e.detail)}
 * />
 * ```
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'data-table': {
        data?: Array<Record<string, any>>;
        columns?: Array<{
          key: string;
          title: string;
          sortable?: boolean;
          render?: (value: any) => string;
        }>;
        pageSize?: number;
        sortable?: boolean;
        onrowClick?: (event: CustomEvent<Record<string, any>>) => void;
        onsort?: (event: CustomEvent<{ column: string; direction: 'asc' | 'desc' }>) => void;
        onpageChange?: (event: CustomEvent<number>) => void;
      };
    }
  }
}
```

## 常见问题

### Q1: 为什么我的对象属性没有被正确传递？

A: 确保在Custom Element的constructor中定义属性。

```javascript
// ❌ 错误：属性未在构造函数中定义
class BadElement extends HTMLElement {
  connectedCallback() {
    this.value = undefined; // 太晚了
  }
}

// ✅ 正确：在构造函数中定义
class GoodElement extends HTMLElement {
  constructor() {
    super();
    this.value = undefined; // React可以检测到这个属性
  }
}
```

### Q2: 自定义事件为什么不触发？

A: 检查事件名称和composed属性。

```javascript
// ❌ 可能不工作
this.dispatchEvent(new CustomEvent('myEvent', {
  detail: { data },
  // 缺少 composed: true
}));

// ✅ 正确
this.dispatchEvent(new CustomEvent('myEvent', {
  detail: { data },
  bubbles: true,
  composed: true // 允许事件穿透Shadow DOM
}));
```

React中监听：
```tsx
// 事件名要匹配
<my-element onmyEvent={handler}></my-element>
// 注意：on + 事件名（首字母小写）
```

### Q3: TypeScript报错找不到Custom Element？

A: 需要正确配置类型定义。

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx", // React 19
    "types": ["./types/custom-elements.d.ts"]
  }
}

// types/custom-elements.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        // 属性定义
      };
    }
  }
}
```

### Q4: Shadow DOM中的样式如何覆盖？

A: 使用CSS自定义属性（CSS变量）。

```javascript
class ThemedElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primary-color: blue;
          --font-size: 16px;
        }
        .container {
          color: var(--primary-color);
          font-size: var(--font-size);
        }
      </style>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}
```

React中覆盖：
```tsx
<themed-element
  style={{
    '--primary-color': 'red',
    '--font-size': '20px'
  } as React.CSSProperties}
>
  Content
</themed-element>
```

### Q5: 如何在Custom Element中使用React组件？

A: 使用ReactDOM.createRoot渲染React到Custom Element中。

```javascript
import { createRoot } from 'react-dom/client';
import React from 'react';

class ReactContainer extends HTMLElement {
  constructor() {
    super();
    this.root = null;
  }
  
  connectedCallback() {
    const container = document.createElement('div');
    this.appendChild(container);
    
    this.root = createRoot(container);
    this.render();
  }
  
  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
  
  set data(value) {
    this._data = value;
    if (this.root) {
      this.render();
    }
  }
  
  render() {
    if (this.root) {
      this.root.render(
        <MyReactComponent data={this._data} />
      );
    }
  }
}

customElements.define('react-container', ReactContainer);
```

## 总结

React 19对Custom Elements的支持改进包括：

核心改进：
```
1. 属性传递
✅ 对象、数组、函数直接传递
✅ 自动类型检测
✅ 高效更新

2. 事件处理
✅ 自定义事件直接监听
✅ 自动清理
✅ 类型安全

3. TypeScript支持
✅ 改进的类型定义
✅ 更好的自动补全
✅ 类型检查

4. 性能
✅ 更少的DOM操作
✅ 更好的协调
✅ 优化的更新策略
```

最佳实践：
```
1. 在constructor中定义所有属性
2. 使用语义化的命名
3. 正确配置事件（bubbles, composed）
4. 编写完整的TypeScript类型
5. 实现可访问性
6. 优化性能（memoization, 事件委托）
7. 提供清晰的文档
8. 适当的错误处理
```

React 19让Web Components成为React生态的一等公民，实现真正的互操作性！


