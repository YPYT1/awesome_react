# Valtio代理状态

## 概述

Valtio是一个基于JavaScript Proxy的React状态管理库，它让你可以直接修改状态对象而无需考虑不可变性。Valtio的核心思想是使用原生JavaScript对象和简单的修改操作，通过Proxy自动追踪状态变化并触发重渲染。

## 为什么选择Valtio

### Valtio的优势

1. **原生JavaScript语法**：可以直接修改对象，无需学习新的API
2. **自动优化**：只有实际使用的状态变化才会触发重渲染
3. **TypeScript友好**：完全的类型推导支持
4. **零样板代码**：没有actions、reducers等概念
5. **体积小巧**：核心包小于3KB
6. **灵活性高**：可以与任何数据结构配合使用
7. **简单易学**：学习曲线平缓

### 与其他方案对比

```jsx
// Redux - 需要大量样板代码
const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

const increment = () => ({ type: 'INCREMENT' });

// Zustand - 需要创建store
const useCountStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// Valtio - 直接修改
import { proxy, useSnapshot } from 'valtio';

const state = proxy({ count: 0 });

// 直接修改
state.count++;

// 在组件中使用
function Counter() {
  const snap = useSnapshot(state);
  return (
    <div>
      <p>{snap.count}</p>
      <button onClick={() => ++state.count}>+</button>
    </div>
  );
}
```

## 安装和基础使用

### 安装

```bash
# npm
npm install valtio

# yarn
yarn add valtio

# pnpm
pnpm add valtio
```

### 基础概念

```jsx
import { proxy, useSnapshot } from 'valtio';

// 1. 创建代理状态
const state = proxy({
  count: 0,
  text: 'Hello',
  nested: {
    value: 42
  }
});

// 2. 直接修改状态
state.count++;
state.text = 'World';
state.nested.value = 100;

// 3. 在组件中使用
function MyComponent() {
  const snap = useSnapshot(state);
  
  return (
    <div>
      <p>Count: {snap.count}</p>
      <p>Text: {snap.text}</p>
      <p>Nested: {snap.nested.value}</p>
      
      <button onClick={() => state.count++}>Increment</button>
      <button onClick={() => (state.text = 'Updated')}>Update Text</button>
    </div>
  );
}
```

## 核心API

### proxy() - 创建代理状态

```jsx
import { proxy } from 'valtio';

// 基本类型
const simpleState = proxy({
  name: 'John',
  age: 30,
  active: true
});

// 嵌套对象
const nestedState = proxy({
  user: {
    profile: {
      name: 'Alice',
      email: 'alice@example.com'
    },
    preferences: {
      theme: 'dark',
      language: 'en'
    }
  },
  posts: []
});

// 数组
const arrayState = proxy({
  items: [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' }
  ]
});

// 复杂数据结构
const complexState = proxy({
  users: new Map(),
  cache: new Set(),
  config: {
    apiUrl: 'https://api.example.com',
    retryCount: 3
  }
});
```

### useSnapshot() - 订阅状态

```jsx
import { useSnapshot } from 'valtio';

function UserProfile() {
  // 获取状态快照
  const snap = useSnapshot(state);
  
  // 只有使用的字段变化才会重渲染
  return (
    <div>
      <h1>{snap.user.profile.name}</h1>
      <p>{snap.user.profile.email}</p>
      {/* 如果只有posts变化，这个组件不会重渲染 */}
    </div>
  );
}

// 选择性订阅
function PostCount() {
  const snap = useSnapshot(state);
  
  // 只订阅posts数组的长度
  return <p>Posts count: {snap.posts.length}</p>;
}

// 条件订阅
function ConditionalComponent() {
  const snap = useSnapshot(state);
  
  // 根据条件显示不同内容
  if (snap.user.active) {
    return <div>User is active: {snap.user.profile.name}</div>;
  }
  
  return <div>User is inactive</div>;
}
```

### subscribe() - 外部订阅

```jsx
import { subscribe } from 'valtio';

// 监听状态变化
const unsubscribe = subscribe(state, () => {
  console.log('State changed:', state);
});

// 监听特定路径
const unsubscribe2 = subscribe(state, () => {
  console.log('User changed:', state.user);
});

// 清理订阅
unsubscribe();
unsubscribe2();

// 在React外部使用
subscribe(state, () => {
  // 同步到localStorage
  localStorage.setItem('appState', JSON.stringify(state));
});

// 监听数组变化
subscribe(state.posts, () => {
  console.log('Posts updated:', state.posts.length);
});
```

### snapshot() - 获取快照

```jsx
import { snapshot } from 'valtio';

// 获取当前状态快照
const currentSnap = snapshot(state);

// 快照是不可变的
console.log(currentSnap.count); // 可以读取
// currentSnap.count = 10; // 错误：快照是只读的

// 比较快照
const snap1 = snapshot(state);
state.count++;
const snap2 = snapshot(state);

console.log(snap1 === snap2); // false
console.log(snap1.count !== snap2.count); // true

// 在非React环境中使用
function logState() {
  const snap = snapshot(state);
  console.log('Current state:', snap);
}
```

## 状态修改模式

### 直接修改

```jsx
const state = proxy({
  count: 0,
  user: {
    name: 'John',
    email: 'john@example.com'
  },
  items: []
});

// 基本字段修改
state.count = 10;
state.count++;
state.count += 5;

// 嵌套对象修改
state.user.name = 'Jane';
state.user.email = 'jane@example.com';

// 添加新属性
state.user.age = 25;
state.newProperty = 'new value';

// 数组操作
state.items.push({ id: 1, text: 'New item' });
state.items.pop();
state.items[0] = { id: 1, text: 'Updated item' };

// 数组方法
state.items.sort((a, b) => a.id - b.id);
state.items.reverse();
state.items.splice(1, 1);

// 删除属性
delete state.user.age;
```

### 批量修改

```jsx
// 对象展开
Object.assign(state.user, {
  name: 'Alice',
  email: 'alice@example.com',
  age: 30
});

// 替换整个对象
state.user = {
  name: 'Bob',
  email: 'bob@example.com',
  age: 35
};

// 数组替换
state.items = [
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' }
];

// 使用Array.from
state.items = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  text: `Item ${i + 1}`
}));
```

### 条件修改

```jsx
// 条件更新
function updateUserStatus(userId, isActive) {
  const user = state.users.find(u => u.id === userId);
  if (user) {
    user.active = isActive;
    user.lastUpdated = new Date().toISOString();
  }
}

// 切换状态
function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
}

// 递增计数
function incrementCounter(id) {
  if (!state.counters[id]) {
    state.counters[id] = 0;
  }
  state.counters[id]++;
}

// 复杂逻辑
function processOrder(order) {
  // 添加订单
  state.orders.push(order);
  
  // 更新库存
  order.items.forEach(item => {
    const product = state.products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  
  // 更新统计
  state.statistics.totalOrders++;
  state.statistics.totalRevenue += order.total;
}
```

## 高级特性

### 计算属性

```jsx
// 使用getter创建计算属性
const state = proxy({
  firstName: 'John',
  lastName: 'Doe',
  
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  
  items: [],
  
  get itemCount() {
    return this.items.length;
  },
  
  get totalValue() {
    return this.items.reduce((sum, item) => sum + item.value, 0);
  }
});

// 在组件中使用
function UserInfo() {
  const snap = useSnapshot(state);
  
  return (
    <div>
      <p>Name: {snap.fullName}</p>
      <p>Items: {snap.itemCount}</p>
      <p>Total: ${snap.totalValue}</p>
    </div>
  );
}

// 动态计算属性
const todoState = proxy({
  todos: [],
  filter: 'all',
  
  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  },
  
  get stats() {
    return {
      total: this.todos.length,
      active: this.todos.filter(t => !t.completed).length,
      completed: this.todos.filter(t => t.completed).length
    };
  }
});
```

### 异步操作

```jsx
// 异步状态管理
const asyncState = proxy({
  data: null,
  loading: false,
  error: null
});

async function fetchData() {
  asyncState.loading = true;
  asyncState.error = null;
  
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    asyncState.data = data;
  } catch (error) {
    asyncState.error = error.message;
  } finally {
    asyncState.loading = false;
  }
}

// 在组件中使用
function DataComponent() {
  const snap = useSnapshot(asyncState);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (snap.loading) return <div>Loading...</div>;
  if (snap.error) return <div>Error: {snap.error}</div>;
  if (!snap.data) return <div>No data</div>;
  
  return <div>{JSON.stringify(snap.data)}</div>;
}

// 多个异步操作
const apiState = proxy({
  users: { data: null, loading: false, error: null },
  posts: { data: null, loading: false, error: null }
});

async function fetchUsers() {
  apiState.users.loading = true;
  apiState.users.error = null;
  
  try {
    const response = await fetch('/api/users');
    apiState.users.data = await response.json();
  } catch (error) {
    apiState.users.error = error.message;
  } finally {
    apiState.users.loading = false;
  }
}

async function fetchPosts() {
  apiState.posts.loading = true;
  apiState.posts.error = null;
  
  try {
    const response = await fetch('/api/posts');
    apiState.posts.data = await response.json();
  } catch (error) {
    apiState.posts.error = error.message;
  } finally {
    apiState.posts.loading = false;
  }
}
```

### 嵌套代理

```jsx
import { proxy, ref } from 'valtio';

// 深度代理
const deepState = proxy({
  level1: {
    level2: {
      level3: {
        value: 'deep'
      }
    }
  }
});

// 直接修改深层属性
deepState.level1.level2.level3.value = 'updated';

// 引用对象（阻止代理化）
const nonProxyObject = { immutable: true };

const state = proxy({
  normalObject: { proxied: true },
  refObject: ref(nonProxyObject) // 不会被代理化
});

// Map和Set支持
const mapSetState = proxy({
  userMap: new Map(),
  tagSet: new Set(),
  
  addUser(id, user) {
    this.userMap.set(id, user);
  },
  
  addTag(tag) {
    this.tagSet.add(tag);
  }
});

// 使用
mapSetState.addUser(1, { name: 'John' });
mapSetState.addTag('react');

function MapSetComponent() {
  const snap = useSnapshot(mapSetState);
  
  return (
    <div>
      <p>Users: {snap.userMap.size}</p>
      <p>Tags: {snap.tagSet.size}</p>
    </div>
  );
}
```

## 实战案例

### 案例1：Todo应用

```jsx
import { proxy, useSnapshot } from 'valtio';

// 创建todo状态
const todoState = proxy({
  todos: [],
  filter: 'all',
  
  // 计算属性
  get filteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);
      case 'completed':
        return this.todos.filter(todo => todo.completed);
      default:
        return this.todos;
    }
  },
  
  get stats() {
    return {
      total: this.todos.length,
      active: this.todos.filter(t => !t.completed).length,
      completed: this.todos.filter(t => t.completed).length
    };
  }
});

// Todo操作函数
const todoActions = {
  addTodo(text) {
    todoState.todos.push({
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    });
  },

  toggleTodo(id) {
    const todo = todoState.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();
    }
  },

  updateTodo(id, text) {
    const todo = todoState.todos.find(t => t.id === id);
    if (todo) {
      todo.text = text;
      todo.updatedAt = new Date().toISOString();
    }
  },

  deleteTodo(id) {
    const index = todoState.todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todoState.todos.splice(index, 1);
    }
  },

  setFilter(filter) {
    todoState.filter = filter;
  },

  clearCompleted() {
    todoState.todos = todoState.todos.filter(todo => !todo.completed);
  },

  toggleAll() {
    const allCompleted = todoState.todos.every(todo => todo.completed);
    todoState.todos.forEach(todo => {
      todo.completed = !allCompleted;
    });
  }
};

// 组件
function TodoApp() {
  const snap = useSnapshot(todoState);

  return (
    <div>
      <TodoInput />
      <TodoList />
      <TodoFilters />
      <TodoStats />
    </div>
  );
}

function TodoInput() {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      todoActions.addTodo(text.trim());
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
  const snap = useSnapshot(todoState);

  return (
    <ul>
      {snap.filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function TodoItem({ todo }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);

  const handleSave = () => {
    todoActions.updateTodo(todo.id, text);
    setEditing(false);
  };

  if (editing) {
    return (
      <li>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setText(todo.text);
              setEditing(false);
            }
          }}
          autoFocus
        />
      </li>
    );
  }

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => todoActions.toggleTodo(todo.id)}
      />
      <span
        onDoubleClick={() => setEditing(true)}
        style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
      >
        {todo.text}
      </span>
      <button onClick={() => todoActions.deleteTodo(todo.id)}>Delete</button>
    </li>
  );
}

function TodoFilters() {
  const snap = useSnapshot(todoState);

  return (
    <div>
      <button
        onClick={() => todoActions.setFilter('all')}
        disabled={snap.filter === 'all'}
      >
        All
      </button>
      <button
        onClick={() => todoActions.setFilter('active')}
        disabled={snap.filter === 'active'}
      >
        Active
      </button>
      <button
        onClick={() => todoActions.setFilter('completed')}
        disabled={snap.filter === 'completed'}
      >
        Completed
      </button>
    </div>
  );
}

function TodoStats() {
  const snap = useSnapshot(todoState);

  return (
    <div>
      <p>
        {snap.stats.active} active / {snap.stats.completed} completed / {snap.stats.total} total
      </p>
      {snap.stats.completed > 0 && (
        <button onClick={todoActions.clearCompleted}>
          Clear Completed
        </button>
      )}
    </div>
  );
}
```

### 案例2：购物车系统

```jsx
import { proxy, useSnapshot } from 'valtio';

// 购物车状态
const cartState = proxy({
  items: [],
  discounts: [],
  shipping: null,
  
  // 计算属性
  get subtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  
  get discountAmount() {
    return this.discounts.reduce((sum, discount) => {
      if (discount.type === 'percentage') {
        return sum + (this.subtotal * discount.value / 100);
      }
      return sum + discount.value;
    }, 0);
  },
  
  get shippingCost() {
    return this.shipping?.cost || 0;
  },
  
  get tax() {
    return (this.subtotal - this.discountAmount) * 0.08; // 8% tax
  },
  
  get total() {
    return this.subtotal - this.discountAmount + this.shippingCost + this.tax;
  },
  
  get itemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }
});

// 购物车操作
const cartActions = {
  addItem(product, quantity = 1) {
    const existingItem = cartState.items.find(
      item => item.productId === product.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartState.items.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        addedAt: new Date().toISOString()
      });
    }
  },

  removeItem(itemId) {
    const index = cartState.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      cartState.items.splice(index, 1);
    }
  },

  updateQuantity(itemId, quantity) {
    const item = cartState.items.find(item => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
      }
    }
  },

  clearCart() {
    cartState.items = [];
  },

  applyDiscount(code, type, value) {
    const existingDiscount = cartState.discounts.find(d => d.code === code);
    if (!existingDiscount) {
      cartState.discounts.push({ code, type, value });
    }
  },

  removeDiscount(code) {
    const index = cartState.discounts.findIndex(d => d.code === code);
    if (index !== -1) {
      cartState.discounts.splice(index, 1);
    }
  },

  setShipping(shippingOption) {
    cartState.shipping = shippingOption;
  }
};

// 组件
function ShoppingCart() {
  const snap = useSnapshot(cartState);

  return (
    <div className="shopping-cart">
      <h2>Shopping Cart ({snap.itemCount} items)</h2>
      
      <CartItems />
      <DiscountSection />
      <ShippingSection />
      <CartSummary />
      
      {snap.items.length > 0 && (
        <div className="cart-actions">
          <button onClick={cartActions.clearCart}>Clear Cart</button>
          <button className="checkout-btn">Checkout</button>
        </div>
      )}
    </div>
  );
}

function CartItems() {
  const snap = useSnapshot(cartState);

  if (snap.items.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div className="cart-items">
      {snap.items.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function CartItem({ item }) {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      <div className="item-details">
        <h4>{item.name}</h4>
        <p>${item.price}</p>
      </div>
      <div className="quantity-controls">
        <button 
          onClick={() => cartActions.updateQuantity(item.id, item.quantity - 1)}
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button 
          onClick={() => cartActions.updateQuantity(item.id, item.quantity + 1)}
        >
          +
        </button>
      </div>
      <div className="item-total">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
      <button 
        className="remove-btn"
        onClick={() => cartActions.removeItem(item.id)}
      >
        Remove
      </button>
    </div>
  );
}

function DiscountSection() {
  const snap = useSnapshot(cartState);
  const [discountCode, setDiscountCode] = useState('');

  const applyDiscount = () => {
    if (discountCode.trim()) {
      // 模拟验证折扣码
      if (discountCode === 'SAVE10') {
        cartActions.applyDiscount(discountCode, 'percentage', 10);
        setDiscountCode('');
      } else if (discountCode === 'SAVE20') {
        cartActions.applyDiscount(discountCode, 'fixed', 20);
        setDiscountCode('');
      } else {
        alert('Invalid discount code');
      }
    }
  };

  return (
    <div className="discount-section">
      <h3>Discount Codes</h3>
      
      {snap.discounts.map(discount => (
        <div key={discount.code} className="applied-discount">
          <span>{discount.code}</span>
          <button onClick={() => cartActions.removeDiscount(discount.code)}>
            Remove
          </button>
        </div>
      ))}
      
      <div className="discount-input">
        <input
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          placeholder="Enter discount code"
        />
        <button onClick={applyDiscount}>Apply</button>
      </div>
    </div>
  );
}

function ShippingSection() {
  const snap = useSnapshot(cartState);

  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping', cost: 5.99, days: '5-7' },
    { id: 'express', name: 'Express Shipping', cost: 12.99, days: '2-3' },
    { id: 'overnight', name: 'Overnight Shipping', cost: 24.99, days: '1' }
  ];

  return (
    <div className="shipping-section">
      <h3>Shipping Options</h3>
      {shippingOptions.map(option => (
        <label key={option.id} className="shipping-option">
          <input
            type="radio"
            name="shipping"
            value={option.id}
            checked={snap.shipping?.id === option.id}
            onChange={() => cartActions.setShipping(option)}
          />
          <span>
            {option.name} - ${option.cost} ({option.days} business days)
          </span>
        </label>
      ))}
    </div>
  );
}

function CartSummary() {
  const snap = useSnapshot(cartState);

  return (
    <div className="cart-summary">
      <h3>Order Summary</h3>
      
      <div className="summary-line">
        <span>Subtotal:</span>
        <span>${snap.subtotal.toFixed(2)}</span>
      </div>
      
      {snap.discountAmount > 0 && (
        <div className="summary-line discount">
          <span>Discount:</span>
          <span>-${snap.discountAmount.toFixed(2)}</span>
        </div>
      )}
      
      {snap.shipping && (
        <div className="summary-line">
          <span>Shipping:</span>
          <span>${snap.shippingCost.toFixed(2)}</span>
        </div>
      )}
      
      <div className="summary-line">
        <span>Tax:</span>
        <span>${snap.tax.toFixed(2)}</span>
      </div>
      
      <div className="summary-line total">
        <span>Total:</span>
        <span>${snap.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
```

### 案例3：表单状态管理

```jsx
import { proxy, useSnapshot } from 'valtio';

// 表单状态
const formState = proxy({
  data: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  },
  errors: {},
  touched: {},
  submitting: false,
  submitted: false,
  
  // 计算属性
  get isValid() {
    return Object.keys(this.errors).length === 0;
  },
  
  get isDirty() {
    return Object.keys(this.touched).length > 0;
  }
});

// 验证规则
const validationRules = {
  firstName: (value) => {
    if (!value) return 'First name is required';
    if (value.length < 2) return 'First name must be at least 2 characters';
    return null;
  },
  
  lastName: (value) => {
    if (!value) return 'Last name is required';
    if (value.length < 2) return 'Last name must be at least 2 characters';
    return null;
  },
  
  email: (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email format';
    return null;
  },
  
  phone: (value) => {
    if (!value) return 'Phone is required';
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(value)) return 'Phone format: (123) 456-7890';
    return null;
  }
};

// 表单操作
const formActions = {
  setField(path, value) {
    // 设置字段值
    const keys = path.split('.');
    let target = formState.data;
    
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    
    target[keys[keys.length - 1]] = value;
    
    // 标记为已触摸
    formState.touched[path] = true;
    
    // 验证字段
    this.validateField(path, value);
  },

  validateField(path, value) {
    const validator = validationRules[path];
    
    if (validator) {
      const error = validator(value);
      
      if (error) {
        formState.errors[path] = error;
      } else {
        delete formState.errors[path];
      }
    }
  },

  validateAll() {
    const data = formState.data;
    
    // 验证所有字段
    Object.keys(validationRules).forEach(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj[key], data)
        : data[field];
      
      this.validateField(field, value);
      formState.touched[field] = true;
    });
    
    return formState.isValid;
  },

  async submit() {
    if (formState.submitting) return;
    
    formState.submitting = true;
    
    if (!this.validateAll()) {
      formState.submitting = false;
      return;
    }
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      formState.submitted = true;
      formState.submitting = false;
      
      // 重置表单
      this.reset();
      
    } catch (error) {
      formState.errors.submit = 'Failed to submit form';
      formState.submitting = false;
    }
  },

  reset() {
    formState.data = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    };
    formState.errors = {};
    formState.touched = {};
    formState.submitted = false;
  }
};

// 组件
function ContactForm() {
  const snap = useSnapshot(formState);

  if (snap.submitted) {
    return (
      <div className="success-message">
        <h2>Form submitted successfully!</h2>
        <button onClick={formActions.reset}>Submit Another</button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      formActions.submit();
    }}>
      <h2>Contact Information</h2>
      
      <div className="form-row">
        <FormField
          label="First Name"
          name="firstName"
          value={snap.data.firstName}
          error={snap.errors.firstName}
          touched={snap.touched.firstName}
        />
        
        <FormField
          label="Last Name"
          name="lastName"
          value={snap.data.lastName}
          error={snap.errors.lastName}
          touched={snap.touched.lastName}
        />
      </div>
      
      <FormField
        label="Email"
        name="email"
        type="email"
        value={snap.data.email}
        error={snap.errors.email}
        touched={snap.touched.email}
      />
      
      <FormField
        label="Phone"
        name="phone"
        value={snap.data.phone}
        error={snap.errors.phone}
        touched={snap.touched.phone}
        placeholder="(123) 456-7890"
      />
      
      <h3>Address</h3>
      
      <FormField
        label="Street Address"
        name="address.street"
        value={snap.data.address.street}
      />
      
      <div className="form-row">
        <FormField
          label="City"
          name="address.city"
          value={snap.data.address.city}
        />
        
        <FormField
          label="State"
          name="address.state"
          value={snap.data.address.state}
        />
        
        <FormField
          label="Zip Code"
          name="address.zipCode"
          value={snap.data.address.zipCode}
        />
      </div>
      
      {snap.errors.submit && (
        <div className="error">{snap.errors.submit}</div>
      )}
      
      <div className="form-actions">
        <button type="button" onClick={formActions.reset}>Reset</button>
        <button 
          type="submit" 
          disabled={snap.submitting || !snap.isValid}
        >
          {snap.submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

function FormField({ label, name, type = 'text', value, error, touched, ...props }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => formActions.setField(name, e.target.value)}
        {...props}
      />
      {touched && error && (
        <div className="field-error">{error}</div>
      )}
    </div>
  );
}
```

## 最佳实践

### 1. 状态组织

```jsx
// 好的状态结构
const appState = proxy({
  // 分离关注点
  user: {
    profile: null,
    preferences: {},
    notifications: []
  },
  
  ui: {
    theme: 'light',
    sidebarOpen: false,
    loading: false
  },
  
  data: {
    posts: [],
    comments: [],
    cache: new Map()
  }
});

// 避免：过于扁平或过于深层嵌套
```

### 2. 操作函数

```jsx
// 将操作封装到函数中
const userActions = {
  setProfile(profile) {
    appState.user.profile = profile;
  },
  
  updatePreference(key, value) {
    appState.user.preferences[key] = value;
  },
  
  addNotification(notification) {
    appState.user.notifications.unshift({
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
  }
};
```

### 3. TypeScript支持

```typescript
import { proxy, useSnapshot } from 'valtio';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const state = proxy<AppState>({
  user: null,
  loading: false,
  error: null
});

// 在组件中使用
function UserComponent() {
  const snap = useSnapshot(state);
  
  return (
    <div>
      {snap.user?.name}
    </div>
  );
}
```

### 4. 性能优化

```jsx
// 使用React.memo避免不必要的重渲染
const UserProfile = React.memo(() => {
  const snap = useSnapshot(state);
  
  // 只有user相关状态变化才重渲染
  return <div>{snap.user?.name}</div>;
});

// 选择性订阅
function PostCount() {
  const snap = useSnapshot(state);
  
  // 只订阅posts数组长度
  return <div>Posts: {snap.posts.length}</div>;
}
```

## 总结

Valtio是一个简单而强大的状态管理库：

1. **直观API**：可以直接修改对象，无需学习复杂概念
2. **自动优化**：只有使用的状态变化才触发重渲染
3. **TypeScript友好**：完美的类型推导支持
4. **零样板代码**：没有actions、reducers等概念
5. **灵活性**：支持任何JavaScript数据结构
6. **性能优秀**：基于Proxy的精确追踪

Valtio特别适合需要简单、直观状态管理的应用场景。
