# Jotai原子化状态

## 概述

Jotai是一个原子化的React状态管理库，采用自底向上的方法。它的核心概念是atom（原子），每个atom代表一小块独立的状态。Jotai简单、灵活，且完美支持TypeScript和并发模式。

## 为什么选择Jotai

### Jotai的特点

1. **原子化设计**：状态被拆分成小的独立单元
2. **无Provider包裹**：直接使用，无需Context Provider
3. **TypeScript友好**：完美的类型推导
4. **极简API**：只有atom和useAtom两个核心API
5. **性能优秀**：精确的依赖追踪和更新
6. **并发模式**：原生支持React 18+的并发特性
7. **体积小巧**：核心库仅约2.5KB

### 与Recoil对比

```jsx
// Recoil - 需要RecoilRoot
import { RecoilRoot, atom, useRecoilState } from 'recoil';

const countState = atom({
  key: 'count',
  default: 0
});

function App() {
  return (
    <RecoilRoot>
      <Counter />
    </RecoilRoot>
  );
}

// Jotai - 无需Provider
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function App() {
  return <Counter />; // 直接使用
}
```

## 安装和基础设置

### 安装

```bash
# npm
npm install jotai

# yarn
yarn add jotai

# pnpm
pnpm add jotai
```

### 第一个Atom

```jsx
import { atom, useAtom } from 'jotai';

// 创建atom
const countAtom = atom(0);

function Counter() {
  // 使用atom
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(c => c + 1)}>Increment (functional)</button>
    </div>
  );
}
```

## 核心概念

### 1. Atom（原子）

Atom是Jotai的基础单元，代表一小块状态：

```jsx
import { atom } from 'jotai';

// 基本类型atom
const countAtom = atom(0);
const nameAtom = atom('John');
const isActiveAtom = atom(true);

// 对象atom
const userAtom = atom({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
});

// 数组atom
const todosAtom = atom([
  { id: 1, text: 'Learn Jotai', completed: false }
]);

// null/undefined
const dataAtom = atom(null);
const optionalAtom = atom(undefined);
```

### 2. useAtom Hook

useAtom用于读写atom：

```jsx
import { useAtom } from 'jotai';

function Component() {
  // 读写
  const [count, setCount] = useAtom(countAtom);

  // 只读
  const [user] = useAtom(userAtom);

  // 只写
  const [, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

### 3. 只读和只写Hooks

```jsx
import { useAtomValue, useSetAtom } from 'jotai';

// 只读：不触发重渲染（当设置值时）
function DisplayCount() {
  const count = useAtomValue(countAtom);
  return <p>Count: {count}</p>;
}

// 只写：不触发重渲染（当值变化时）
function IncrementButton() {
  const setCount = useSetAtom(countAtom);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Increment
    </button>
  );
}
```

## 派生Atom

### 只读派生Atom

```jsx
import { atom } from 'jotai';

const countAtom = atom(0);

// 派生atom - 只读
const doubleCountAtom = atom((get) => get(countAtom) * 2);

const tripleCountAtom = atom((get) => {
  const count = get(countAtom);
  return count * 3;
});

// 使用
function DerivedExample() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);
  const tripleCount = useAtomValue(tripleCountAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <p>Triple: {tripleCount}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

### 可写派生Atom

```jsx
import { atom } from 'jotai';

const firstNameAtom = atom('John');
const lastNameAtom = atom('Doe');

// 可读可写的派生atom
const fullNameAtom = atom(
  (get) => `${get(firstNameAtom)} ${get(lastNameAtom)}`,
  (get, set, newFullName) => {
    const [first, last] = newFullName.split(' ');
    set(firstNameAtom, first);
    set(lastNameAtom, last);
  }
);

function FullNameExample() {
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const [fullName, setFullName] = useAtom(fullNameAtom);

  return (
    <div>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <p>Full Name: {fullName}</p>
      <button onClick={() => setFullName('Jane Smith')}>
        Set to Jane Smith
      </button>
    </div>
  );
}
```

### 只写派生Atom

```jsx
const countAtom = atom(0);

// 只写atom
const incrementAtom = atom(
  null, // 读取时返回null
  (get, set) => {
    set(countAtom, get(countAtom) + 1);
  }
);

const decrementAtom = atom(
  null,
  (get, set) => {
    set(countAtom, get(countAtom) - 1);
  }
);

const resetAtom = atom(
  null,
  (get, set) => {
    set(countAtom, 0);
  }
);

// 使用
function ActionsExample() {
  const count = useAtomValue(countAtom);
  const increment = useSetAtom(incrementAtom);
  const decrement = useSetAtom(decrementAtom);
  const reset = useSetAtom(resetAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## 基础用法示例

### 示例1：Todo应用

```jsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 原始atoms
const todosAtom = atom([]);
const filterAtom = atom('all'); // 'all' | 'active' | 'completed'

// 派生atom - 过滤后的todos
const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);

  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
});

// 派生atom - 统计
const todoStatsAtom = atom((get) => {
  const todos = get(todosAtom);
  return {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  };
});

// Actions atoms
const addTodoAtom = atom(
  null,
  (get, set, text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    set(todosAtom, [...get(todosAtom), newTodo]);
  }
);

const toggleTodoAtom = atom(
  null,
  (get, set, id) => {
    set(
      todosAtom,
      get(todosAtom).map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }
);

const deleteTodoAtom = atom(
  null,
  (get, set, id) => {
    set(todosAtom, get(todosAtom).filter(todo => todo.id !== id));
  }
);

// 组件
function TodoInput() {
  const [text, setText] = useState('');
  const addTodo = useSetAtom(addTodoAtom);

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
        placeholder="Add todo..."
      />
      <button type="submit">Add</button>
    </form>
  );
}

function TodoList() {
  const todos = useAtomValue(filteredTodosAtom);
  const toggleTodo = useSetAtom(toggleTodoAtom);
  const deleteTodo = useSetAtom(deleteTodoAtom);

  return (
    <ul>
      {todos.map(todo => (
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
  const [filter, setFilter] = useAtom(filterAtom);

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

function TodoStats() {
  const stats = useAtomValue(todoStatsAtom);

  return (
    <p>
      {stats.active} active / {stats.completed} completed / {stats.total} total
    </p>
  );
}

function TodoApp() {
  return (
    <div>
      <h1>Todos</h1>
      <TodoInput />
      <TodoFilters />
      <TodoList />
      <TodoStats />
    </div>
  );
}
```

### 示例2：表单管理

```jsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 表单字段atoms
const emailAtom = atom('');
const passwordAtom = atom('');
const rememberMeAtom = atom(false);

// 验证atoms
const emailErrorAtom = atom((get) => {
  const email = get(emailAtom);
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email';
  return null;
});

const passwordErrorAtom = atom((get) => {
  const password = get(passwordAtom);
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
});

// 表单有效性atom
const isFormValidAtom = atom((get) => {
  return !get(emailErrorAtom) && !get(passwordErrorAtom);
});

// 表单数据atom
const formDataAtom = atom((get) => ({
  email: get(emailAtom),
  password: get(passwordAtom),
  rememberMe: get(rememberMeAtom)
}));

// 重置atom
const resetFormAtom = atom(
  null,
  (get, set) => {
    set(emailAtom, '');
    set(passwordAtom, '');
    set(rememberMeAtom, false);
  }
);

// 组件
function LoginForm() {
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [rememberMe, setRememberMe] = useAtom(rememberMeAtom);
  
  const emailError = useAtomValue(emailErrorAtom);
  const passwordError = useAtomValue(passwordErrorAtom);
  const isValid = useAtomValue(isFormValidAtom);
  const formData = useAtomValue(formDataAtom);
  const resetForm = useSetAtom(resetFormAtom);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      console.log('Form data:', formData);
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {emailError && <span className="error">{emailError}</span>}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        {passwordError && <span className="error">{passwordError}</span>}
      </div>

      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>

      <button type="submit" disabled={!isValid}>
        Login
      </button>
    </form>
  );
}
```

### 示例3：购物车

```jsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 购物车items atom
const cartItemsAtom = atom([]);

// 派生atoms
const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((count, item) => count + item.quantity, 0);
});

// Action atoms
const addToCartAtom = atom(
  null,
  (get, set, product) => {
    const items = get(cartItemsAtom);
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      set(
        cartItemsAtom,
        items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      set(cartItemsAtom, [...items, { ...product, quantity: 1 }]);
    }
  }
);

const removeFromCartAtom = atom(
  null,
  (get, set, productId) => {
    set(
      cartItemsAtom,
      get(cartItemsAtom).filter(item => item.id !== productId)
    );
  }
);

const updateQuantityAtom = atom(
  null,
  (get, set, { productId, quantity }) => {
    if (quantity <= 0) {
      set(
        cartItemsAtom,
        get(cartItemsAtom).filter(item => item.id !== productId)
      );
    } else {
      set(
        cartItemsAtom,
        get(cartItemsAtom).map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }
);

const clearCartAtom = atom(
  null,
  (get, set) => {
    set(cartItemsAtom, []);
  }
);

// 组件
function ProductCard({ product }) {
  const addToCart = useSetAtom(addToCartAtom);

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}

function CartItem({ item }) {
  const updateQuantity = useSetAtom(updateQuantityAtom);
  const removeFromCart = useSetAtom(removeFromCartAtom);

  return (
    <div className="cart-item">
      <span>{item.name}</span>
      <input
        type="number"
        min="0"
        value={item.quantity}
        onChange={(e) =>
          updateQuantity({
            productId: item.id,
            quantity: parseInt(e.target.value)
          })
        }
      />
      <span>${item.price * item.quantity}</span>
      <button onClick={() => removeFromCart(item.id)}>Remove</button>
    </div>
  );
}

function Cart() {
  const items = useAtomValue(cartItemsAtom);
  const total = useAtomValue(cartTotalAtom);
  const count = useAtomValue(cartCountAtom);
  const clearCart = useSetAtom(clearCartAtom);

  return (
    <div className="cart">
      <h2>Cart ({count} items)</h2>
      {items.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}
```

## TypeScript支持

### 基础类型定义

```typescript
import { atom, useAtom } from 'jotai';

// 自动推导类型
const countAtom = atom(0); // Atom<number>
const nameAtom = atom('John'); // Atom<string>

// 显式类型
interface User {
  id: number;
  name: string;
  email: string;
}

const userAtom = atom<User | null>(null);

// 数组类型
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const todosAtom = atom<Todo[]>([]);
```

### 派生Atom类型

```typescript
import { atom } from 'jotai';

const countAtom = atom(0);

// 只读派生atom
const doubleCountAtom = atom((get) => get(countAtom) * 2); // Atom<number>

// 可写派生atom
const incrementAtom = atom(
  null, // 读取值类型
  (get, set, value: number) => { // 写入值类型
    set(countAtom, get(countAtom) + value);
  }
); // WritableAtom<null, number, void>

// 复杂类型
interface FormData {
  email: string;
  password: string;
}

const formAtom = atom<FormData>({
  email: '',
  password: ''
});

const isValidAtom = atom((get) => {
  const { email, password } = get(formAtom);
  return email.includes('@') && password.length >= 6;
}); // Atom<boolean>
```

## 性能优化

### 1. 精确订阅

```jsx
// 只订阅需要的部分
function UserName() {
  const user = useAtomValue(userAtom);
  // 只在user变化时重渲染
  return <div>{user?.name}</div>;
}

// 使用派生atom优化
const userNameAtom = atom((get) => get(userAtom)?.name);

function OptimizedUserName() {
  const userName = useAtomValue(userNameAtom);
  // 只在name变化时重渲染
  return <div>{userName}</div>;
}
```

### 2. 分离读写

```jsx
// 不好：每次count变化都重渲染
function BadCounter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 好：拆分为两个组件
function CountDisplay() {
  const count = useAtomValue(countAtom);
  return <p>Count: {count}</p>;
}

function CountButton() {
  const setCount = useSetAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>Increment</button>;
}
```

### 3. 使用只写Atom

```jsx
// 不触发重渲染的操作
const logAtom = atom(
  null,
  (get, set, message: string) => {
    console.log(message, get(countAtom));
  }
);

function Logger() {
  const log = useSetAtom(logAtom);
  // log函数引用稳定，组件不会重渲染
  return <button onClick={() => log('Count:')}>Log Count</button>;
}
```

## Atom的组织模式

### 1. 分层组织

```jsx
// atoms/user.js
export const userAtom = atom(null);
export const isAuthenticatedAtom = atom((get) => !!get(userAtom));

// atoms/todos.js
export const todosAtom = atom([]);
export const filteredTodosAtom = atom((get) => {
  // ...
});

// atoms/index.js
export * from './user';
export * from './todos';
```

### 2. Atom工厂

```jsx
function createFormAtom(initialValue) {
  const dataAtom = atom(initialValue);
  const errorsAtom = atom({});
  const isValidAtom = atom((get) => {
    const errors = get(errorsAtom);
    return Object.keys(errors).length === 0;
  });

  return {
    dataAtom,
    errorsAtom,
    isValidAtom
  };
}

const loginForm = createFormAtom({ email: '', password: '' });
const signupForm = createFormAtom({ email: '', password: '', name: '' });
```

### 3. Atom组合

```jsx
const baseAtom = atom(0);
const incrementAtom = atom(null, (get, set) => set(baseAtom, get(baseAtom) + 1));
const decrementAtom = atom(null, (get, set) => set(baseAtom, get(baseAtom) - 1));
const resetAtom = atom(null, (get, set) => set(baseAtom, 0));

// 组合为一个对象
export const counterAtoms = {
  value: baseAtom,
  increment: incrementAtom,
  decrement: decrementAtom,
  reset: resetAtom
};
```

## 最佳实践

### 1. Atom命名

```jsx
// 好的命名
const countAtom = atom(0);
const userAtom = atom(null);
const isLoadingAtom = atom(false);

// 派生atom
const doubleCountAtom = atom((get) => get(countAtom) * 2);
const filteredItemsAtom = atom((get) => {
  // ...
});

// Action atoms
const incrementAtom = atom(null, (get, set) => {
  // ...
});
```

### 2. 避免直接修改

```jsx
// 不好
const itemsAtom = atom([]);
const addItemAtom = atom(null, (get, set, item) => {
  const items = get(itemsAtom);
  items.push(item); // 直接修改
  set(itemsAtom, items);
});

// 好
const addItemAtom = atom(null, (get, set, item) => {
  set(itemsAtom, [...get(itemsAtom), item]); // 返回新数组
});
```

### 3. 合理使用派生Atom

```jsx
// 好：计算逻辑放在派生atom中
const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// 不好：在组件中计算
function CartTotal() {
  const items = useAtomValue(cartItemsAtom);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div>{total}</div>;
}
```

## 总结

Jotai的原子化设计简洁而强大，关键要点：

1. **Atom是核心**：一切状态都是atom
2. **派生Atom**：通过组合创建复杂逻辑
3. **精确订阅**：只在需要的atom变化时重渲染
4. **TypeScript友好**：完美的类型推导
5. **无Provider**：直接使用，无需包裹
6. **只写Atom**：实现不触发渲染的操作

Jotai适合需要细粒度状态管理的应用，特别是复杂的表单、数据流等场景。

