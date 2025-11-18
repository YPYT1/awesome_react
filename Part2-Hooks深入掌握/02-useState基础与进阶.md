# useState基础与进阶

## 学习目标

通过本章学习，你将全面掌握：

- useState的基本用法和原理
- 函数式更新详解
- 惰性初始化
- 批量更新机制
- 性能优化技巧
- 常见问题与解决方案
- React 19中的useState增强

## 第一部分：useState基础

### 1.1 基本语法

```jsx
import { useState } from 'react';

function BasicUsage() {
  // 语法：const [state, setState] = useState(initialValue)
  const [count, setCount] = useState(0);
  
  // 解构说明：
  // count：State当前值
  // setCount：更新State的函数
  // 0：初始值
  
  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### 1.2 各种类型的State

```jsx
function AllTypes() {
  // 1. 数字
  const [count, setCount] = useState(0);
  
  // 2. 字符串
  const [text, setText] = useState('');
  
  // 3. 布尔值
  const [isOpen, setIsOpen] = useState(false);
  
  // 4. 数组
  const [items, setItems] = useState([]);
  
  // 5. 对象
  const [user, setUser] = useState({
    name: '',
    age: 0
  });
  
  // 6. null
  const [data, setData] = useState(null);
  
  // 7. 函数（需要用函数包裹）
  const [fn, setFn] = useState(() => () => console.log('初始函数'));
  
  return <div>{/* ... */}</div>;
}
```

### 1.3 State更新方式

```jsx
function UpdateMethods() {
  const [count, setCount] = useState(0);
  
  // 方式1：直接设置值
  const method1 = () => {
    setCount(5);  // 设置为5
  };
  
  // 方式2：基于当前值更新
  const method2 = () => {
    setCount(count + 1);  // 使用当前的count
  };
  
  // 方式3：函数式更新（推荐）
  const method3 = () => {
    setCount(prevCount => prevCount + 1);  // 使用最新的count
  };
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={method1}>设置为5</button>
      <button onClick={method2}>+1</button>
      <button onClick={method3}>+1（函数式）</button>
    </div>
  );
}
```

## 第二部分：函数式更新

### 2.1 为什么需要函数式更新

```jsx
function WhyFunctional() {
  const [count, setCount] = useState(0);
  
  // 问题：多次更新只生效一次
  const badIncrement = () => {
    setCount(count + 1);  // count = 0，设为1
    setCount(count + 1);  // count仍是0，设为1
    setCount(count + 1);  // count仍是0，设为1
    // 最终count = 1
  };
  
  // 解决：函数式更新
  const goodIncrement = () => {
    setCount(prev => prev + 1);  // prev = 0，设为1
    setCount(prev => prev + 1);  // prev = 1，设为2
    setCount(prev => prev + 1);  // prev = 2，设为3
    // 最终count = 3
  };
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={badIncrement}>错误方式+3</button>
      <button onClick={goodIncrement}>正确方式+3</button>
    </div>
  );
}
```

### 2.2 函数式更新的应用场景

```jsx
function FunctionalScenarios() {
  const [items, setItems] = useState([]);
  
  // 场景1：异步操作中
  const addItemAsync = () => {
    setTimeout(() => {
      // 使用函数式更新获取最新State
      setItems(prev => [...prev, 'New Item']);
    }, 1000);
  };
  
  // 场景2：useEffect中
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => [...prev, Date.now()]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);  // 空依赖，函数式更新不依赖外部变量
  
  // 场景3：事件处理器中多次更新
  const handleMultipleUpdates = () => {
    setItems(prev => [...prev, 'Item 1']);
    setItems(prev => [...prev, 'Item 2']);
    setItems(prev => [...prev, 'Item 3']);
  };
  
  return (
    <div>
      <button onClick={addItemAsync}>异步添加</button>
      <button onClick={handleMultipleUpdates}>添加3项</button>
      <ul>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}
```

### 2.3 对象和数组的函数式更新

```jsx
function ComplexFunctional() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    address: {
      city: 'Beijing'
    }
  });
  
  // 更新对象
  const updateAge = () => {
    setUser(prev => ({
      ...prev,
      age: prev.age + 1
    }));
  };
  
  // 更新嵌套对象
  const updateCity = (newCity) => {
    setUser(prev => ({
      ...prev,
      address: {
        ...prev.address,
        city: newCity
      }
    }));
  };
  
  // 数组操作
  const [todos, setTodos] = useState([]);
  
  const addTodo = (text) => {
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text, completed: false }
    ]);
  };
  
  const toggleTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  return <div>{/* ... */}</div>;
}
```

## 第三部分：惰性初始化

### 3.1 基本惰性初始化

```jsx
// 问题：昂贵的初始化每次渲染都执行
function SlowInit() {
  const expensiveCalculation = () => {
    console.log('执行昂贵计算');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += i;
    }
    return result;
  };
  
  const [data, setData] = useState(expensiveCalculation());
  // expensiveCalculation()每次渲染都执行
  
  return <div>{data}</div>;
}

// 解决：使用函数形式
function LazyInit() {
  const [data, setData] = useState(() => {
    console.log('只在初始化时执行一次');
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += i;
    }
    return result;
  });
  
  return <div>{data}</div>;
}
```

### 3.2 从localStorage初始化

```jsx
function LocalStorageInit() {
  const [preferences, setPreferences] = useState(() => {
    // 只在首次渲染时从localStorage读取
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      language: 'zh-CN'
    };
  });
  
  // 更新时同步到localStorage
  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);
  
  return <div>{/* ... */}</div>;
}
```

### 3.3 从props计算初始值

```jsx
function ComputedInit({ userId, config }) {
  const [userData, setUserData] = useState(() => {
    // 基于props计算初始值
    return {
      id: userId,
      settings: processConfig(config),
      timestamp: Date.now()
    };
  });
  
  // 注意：初始化只使用props的初始值
  // props后续变化不会影响State
  
  return <div>{userData.id}</div>;
}
```

## 第四部分：批量更新

### 4.1 自动批处理

```jsx
function AutoBatching() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  console.log('渲染');
  
  // React 18+：自动批处理所有更新
  const handleClick = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 只渲染一次
  };
  
  const handleAsync = async () => {
    await fetchData();
    setCount(c => c + 1);
    setFlag(f => !f);
    // React 18+：仍然只渲染一次
  };
  
  return (
    <div>
      <p>Count: {count}, Flag: {String(flag)}</p>
      <button onClick={handleClick}>同步更新</button>
      <button onClick={handleAsync}>异步更新</button>
    </div>
  );
}
```

### 4.2 批处理的性能优势

```jsx
function BatchingPerformance() {
  const [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0);
  const [state3, setState3] = useState(0);
  
  const renderCount = useRef(0);
  renderCount.current++;
  
  const handleUpdate = async () => {
    // 所有更新批处理
    setState1(s => s + 1);
    setState2(s => s + 1);
    setState3(s => s + 1);
    
    await delay(100);
    
    setState1(s => s + 1);
    setState2(s => s + 1);
    setState3(s => s + 1);
    
    // React 18+：只触发2次渲染（每组批处理）
    // React 17：会触发6次渲染
  };
  
  return (
    <div>
      <p>渲染次数：{renderCount.current}</p>
      <button onClick={handleUpdate}>更新</button>
    </div>
  );
}
```

## 第五部分：useState原理

### 5.1 简化的useState实现

```jsx
// React内部的简化实现
let hooks = [];
let currentHookIndex = 0;

function useState(initialValue) {
  const hookIndex = currentHookIndex;
  
  // 初始化或获取现有值
  if (hooks[hookIndex] === undefined) {
    hooks[hookIndex] = {
      state: typeof initialValue === 'function' 
        ? initialValue() 
        : initialValue
    };
  }
  
  const setState = (newValue) => {
    const hook = hooks[hookIndex];
    
    // 处理函数式更新
    const nextState = typeof newValue === 'function'
      ? newValue(hook.state)
      : newValue;
    
    // 浅比较，相同则不更新
    if (Object.is(hook.state, nextState)) {
      return;
    }
    
    hook.state = nextState;
    
    // 触发重新渲染
    rerender();
  };
  
  currentHookIndex++;
  
  return [hooks[hookIndex].state, setState];
}

// 渲染组件
function renderComponent() {
  currentHookIndex = 0;  // 重置索引
  Component();           // 执行组件
}
```

### 5.2 useState与Fiber

```jsx
// 在Fiber架构中，每个组件实例有自己的Hook链表
const fiber = {
  memoizedState: {  // Hook链表头
    state: 0,         // useState的值
    next: {           // 下一个Hook
      state: '',
      next: {
        state: false,
        next: null
      }
    }
  }
};

// 渲染时遍历链表获取每个Hook的值
```

## 第六部分：性能优化

### 6.1 避免不必要的更新

```jsx
function AvoidUnnecessaryUpdates() {
  const [user, setUser] = useState({ name: 'Alice' });
  
  // 不好：总是创建新对象
  const updateNameBad = () => {
    setUser({ name: 'Alice' });  // 即使值相同，也创建新对象
    // 会触发重新渲染
  };
  
  // 好：检查后再更新
  const updateNameGood = () => {
    setUser(prev => 
      prev.name === 'Alice' ? prev : { name: 'Alice' }
    );
    // 如果值相同，返回prev，不触发渲染
  };
  
  return <div>{user.name}</div>;
}
```

### 6.2 State拆分策略

```jsx
// 不好：一个大State
function BadSplit() {
  const [state, setState] = useState({
    user: {},
    cart: [],
    settings: {},
    ui: {}
  });
  
  // 任何一个变化都触发整个组件渲染
  
  return <div>{/* ... */}</div>;
}

// 好：拆分独立State
function GoodSplit() {
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);
  const [settings, setSettings] = useState({});
  const [ui, setUI] = useState({});
  
  // 每个State独立更新
  
  return <div>{/* ... */}</div>;
}
```

## 第七部分：React 19增强

### 7.1 自动批处理增强

```jsx
// React 19：所有场景自动批处理
function React19Batching() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  
  const handleUpdate = () => {
    // 事件处理器
    setA(1);
    setB(2);
    setC(3);
    
    // Promise
    Promise.resolve().then(() => {
      setA(10);
      setB(20);
      setC(30);
    });
    
    // setTimeout
    setTimeout(() => {
      setA(100);
      setB(200);
      setC(300);
    }, 0);
    
    // 所有更新都自动批处理
  };
  
  return <button onClick={handleUpdate}>更新</button>;
}
```

### 7.2 与use()配合

```jsx
import { use, useState } from 'react';

function WithUse({ dataPromise }) {
  const data = use(dataPromise);
  const [localData, setLocalData] = useState(data);
  
  return (
    <div>
      <p>原始数据：{data.value}</p>
      <p>本地数据：{localData.value}</p>
      <button onClick={() => setLocalData({ value: 'modified' })}>
        修改本地数据
      </button>
    </div>
  );
}
```

### 7.3 服务器组件中的useState

```jsx
// React 19：客户端组件中的useState
'use client';

import { useState } from 'react';

function ClientCounter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}

// 服务器组件不能使用useState
function ServerComponent() {
  // ❌ 错误：服务器组件不能使用useState
  // const [count, setCount] = useState(0);
  
  // ✅ 可以渲染客户端组件
  return (
    <div>
      <h1>服务器组件</h1>
      <ClientCounter />
    </div>
  );
}
```

## 第八部分：useState常见错误

### 8.1 直接修改State

```jsx
// ❌ 错误：直接修改数组
function BadArrayMutation() {
  const [items, setItems] = useState(['a', 'b', 'c']);
  
  const handleAdd = () => {
    items.push('d');  // 错误！直接修改
    setItems(items);  // React不会检测到变化
  };
  
  return (
    <div>
      <ul>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <button onClick={handleAdd}>添加</button>
    </div>
  );
}

// ✅ 正确：创建新数组
function GoodArrayUpdate() {
  const [items, setItems] = useState(['a', 'b', 'c']);
  
  const handleAdd = () => {
    setItems([...items, 'd']);  // 创建新数组
  };
  
  return (
    <div>
      <ul>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <button onClick={handleAdd}>添加</button>
    </div>
  );
}

// ❌ 错误：直接修改对象
function BadObjectMutation() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  const handleUpdateAge = () => {
    user.age = 26;  // 错误！直接修改
    setUser(user);  // React不会检测到变化
  };
  
  return <div>{user.age}</div>;
}

// ✅ 正确：创建新对象
function GoodObjectUpdate() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  const handleUpdateAge = () => {
    setUser({ ...user, age: 26 });  // 创建新对象
  };
  
  return <div>{user.age}</div>;
}
```

### 8.2 State更新不及时

```jsx
// 问题：State更新是异步的
function AsyncStateUpdate() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count);  // 仍然是旧值
    
    // State更新是异步的，不会立即生效
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 解决方案1：使用Effect监听变化
function WithEffect() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('count已更新:', count);
  }, [count]);
  
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 解决方案2：直接使用新值
function WithNewValue() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    const newCount = count + 1;
    setCount(newCount);
    console.log('新值:', newCount);  // 直接使用计算后的值
  };
  
  return <button onClick={handleClick}>{count}</button>;
}
```

### 8.3 State丢失问题

```jsx
// 问题：组件key变化导致State重置
function Parent() {
  const [userId, setUserId] = useState(1);
  
  return (
    <div>
      <button onClick={() => setUserId(userId + 1)}>切换用户</button>
      
      {/* ❌ 每次userId变化，Counter的State都会重置 */}
      <Counter key={userId} />
    </div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}

// 解决：不使用key或提升State
function ParentFixed() {
  const [userId, setUserId] = useState(1);
  const [counts, setCounts] = useState({});  // 为每个用户保存count
  
  return (
    <div>
      <button onClick={() => setUserId(userId + 1)}>切换用户</button>
      
      <CounterWithId 
        userId={userId}
        count={counts[userId] || 0}
        setCount={(c) => setCounts({ ...counts, [userId]: c })}
      />
    </div>
  );
}
```

## 第九部分：useState实战案例

### 9.1 表单状态管理

```jsx
function FormWithState() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // 通用字段更新函数
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  // 字段失焦处理
  const handleBlur = (field) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // 验证字段
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };
  
  // 表单验证
  const validateField = (field, value) => {
    switch (field) {
      case 'username':
        if (!value) return '用户名不能为空';
        if (value.length < 3) return '用户名至少3个字符';
        return null;
      
      case 'email':
        if (!value) return '邮箱不能为空';
        if (!/\S+@\S+\.\S+/.test(value)) return '邮箱格式不正确';
        return null;
      
      case 'password':
        if (!value) return '密码不能为空';
        if (value.length < 6) return '密码至少6个字符';
        return null;
      
      case 'confirmPassword':
        if (value !== formData.password) return '两次密码不一致';
        return null;
      
      default:
        return null;
    }
  };
  
  // 表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证所有字段
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 提交表单
    setSubmitting(true);
    
    try {
      await submitForm(formData);
      alert('注册成功！');
      
      // 重置表单
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>用户名:</label>
        <input
          value={formData.username}
          onChange={handleChange('username')}
          onBlur={handleBlur('username')}
        />
        {touched.username && errors.username && (
          <span className="error">{errors.username}</span>
        )}
      </div>
      
      <div>
        <label>邮箱:</label>
        <input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
        />
        {touched.email && errors.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>
      
      <div>
        <label>密码:</label>
        <input
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
        />
        {touched.password && errors.password && (
          <span className="error">{errors.password}</span>
        )}
      </div>
      
      <div>
        <label>确认密码:</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange('agreeToTerms')}
          />
          我同意服务条款
        </label>
      </div>
      
      {errors.submit && <div className="error">{errors.submit}</div>}
      
      <button type="submit" disabled={submitting || !formData.agreeToTerms}>
        {submitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

### 9.2 购物车状态管理

```jsx
function ShoppingCart() {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'iPhone 15', price: 5999, stock: 10 },
    { id: 2, name: 'iPad Pro', price: 6799, stock: 5 },
    { id: 3, name: 'MacBook Pro', price: 13999, stock: 3 }
  ]);
  
  // 添加到购物车
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // 增加数量
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 新增商品
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };
  
  // 更新数量
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // 移除商品
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };
  
  // 清空购物车
  const clearCart = () => {
    setCart([]);
  };
  
  // 计算总价
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // 计算商品总数
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="shopping-cart">
      <h2>商品列表</h2>
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product">
            <h3>{product.name}</h3>
            <p>价格: ¥{product.price}</p>
            <p>库存: {product.stock}</p>
            <button onClick={() => addToCart(product)}>
              加入购物车
            </button>
          </div>
        ))}
      </div>
      
      <h2>购物车 ({itemCount}件商品)</h2>
      {cart.length === 0 ? (
        <p>购物车是空的</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                <span>¥{item.price}</span>
                
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                </div>
                
                <span>小计: ¥{item.price * item.quantity}</span>
                
                <button onClick={() => removeFromCart(item.id)}>
                  删除
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-footer">
            <p className="total">总计: ¥{total}</p>
            <button onClick={clearCart}>清空购物车</button>
            <button className="checkout">去结算</button>
          </div>
        </>
      )}
    </div>
  );
}
```

### 9.3 分页数据管理

```jsx
function PaginatedList() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  
  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/data?page=${page}&size=${pageSize}`);
        const result = await response.json();
        
        setData(result.items);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [page, pageSize]);
  
  // 跳转到指定页
  const goToPage = (pageNumber) => {
    setPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };
  
  // 上一页
  const previousPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };
  
  // 下一页
  const nextPage = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };
  
  // 改变每页数量
  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);  // 重置到第一页
  };
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      <div className="page-size-selector">
        每页显示:
        <select value={pageSize} onChange={e => changePageSize(Number(e.target.value))}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      <div className="pagination">
        <button onClick={previousPage} disabled={page === 1}>
          上一页
        </button>
        
        <span>
          第 {page} / {totalPages} 页
        </span>
        
        <button onClick={nextPage} disabled={page === totalPages}>
          下一页
        </button>
        
        <div className="page-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              className={page === pageNum ? 'active' : ''}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## 第十部分：useState高级模式

### 10.1 状态机模式

```jsx
function StateMachine() {
  const [status, setStatus] = useState('idle');  // idle, loading, success, error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    // 状态转换：idle -> loading
    setStatus('loading');
    setError(null);
    
    try {
      const result = await fetch('/api/data');
      const json = await result.json();
      
      // 状态转换：loading -> success
      setStatus('success');
      setData(json);
    } catch (err) {
      // 状态转换：loading -> error
      setStatus('error');
      setError(err.message);
    }
  };
  
  const reset = () => {
    // 状态转换：任意状态 -> idle
    setStatus('idle');
    setData(null);
    setError(null);
  };
  
  return (
    <div>
      {status === 'idle' && (
        <button onClick={fetchData}>加载数据</button>
      )}
      
      {status === 'loading' && (
        <div>加载中...</div>
      )}
      
      {status === 'success' && (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <button onClick={reset}>重置</button>
        </div>
      )}
      
      {status === 'error' && (
        <div>
          <p>错误: {error}</p>
          <button onClick={fetchData}>重试</button>
          <button onClick={reset}>重置</button>
        </div>
      )}
    </div>
  );
}
```

### 10.2 撤销/重做功能

```jsx
function useHistory(initialState) {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentState = history[currentIndex];
  
  const setState = (newState) => {
    const newValue = typeof newState === 'function' 
      ? newState(currentState) 
      : newState;
    
    // 移除当前位置之后的历史
    const newHistory = history.slice(0, currentIndex + 1);
    
    setHistory([...newHistory, newValue]);
    setCurrentIndex(currentIndex + 1);
  };
  
  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history
  };
}

// 使用撤销/重做
function DrawingApp() {
  const {
    state: lines,
    setState: setLines,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory([]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  
  const startDrawing = (e) => {
    setIsDrawing(true);
    setCurrentLine([{ x: e.clientX, y: e.clientY }]);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    setCurrentLine(prev => [...prev, { x: e.clientX, y: e.clientY }]);
  };
  
  const stopDrawing = () => {
    if (isDrawing && currentLine.length > 0) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine([]);
    }
    setIsDrawing(false);
  };
  
  const clear = () => {
    setLines([]);
  };
  
  return (
    <div>
      <div className="toolbar">
        <button onClick={undo} disabled={!canUndo}>
          撤销
        </button>
        <button onClick={redo} disabled={!canRedo}>
          重做
        </button>
        <button onClick={clear}>
          清空
        </button>
      </div>
      
      <svg
        width="800"
        height="600"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      >
        {lines.map((line, i) => (
          <polyline
            key={i}
            points={line.map(p => `${p.x},${p.y}`).join(' ')}
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
        ))}
        
        {isDrawing && currentLine.length > 0 && (
          <polyline
            points={currentLine.map(p => `${p.x},${p.y}`).join(' ')}
            stroke="blue"
            strokeWidth="2"
            fill="none"
          />
        )}
      </svg>
    </div>
  );
}
```

### 10.3 复杂数据结构的更新

```jsx
function ComplexDataStructure() {
  const [data, setData] = useState({
    users: [
      {
        id: 1,
        name: 'Alice',
        posts: [
          { id: 101, title: 'Post 1', likes: 5 },
          { id: 102, title: 'Post 2', likes: 10 }
        ]
      }
    ],
    comments: {},
    settings: {
      theme: 'light',
      notifications: {
        email: true,
        push: false
      }
    }
  });
  
  // 更新用户名
  const updateUserName = (userId, newName) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === userId
          ? { ...user, name: newName }
          : user
      )
    }));
  };
  
  // 更新帖子标题
  const updatePostTitle = (userId, postId, newTitle) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === userId
          ? {
              ...user,
              posts: user.posts.map(post =>
                post.id === postId
                  ? { ...post, title: newTitle }
                  : post
              )
            }
          : user
      )
    }));
  };
  
  // 点赞帖子
  const likePost = (userId, postId) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === userId
          ? {
              ...user,
              posts: user.posts.map(post =>
                post.id === postId
                  ? { ...post, likes: post.likes + 1 }
                  : post
              )
            }
          : user
      )
    }));
  };
  
  // 更新深层嵌套的设置
  const updateNotificationSetting = (type, value) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings.notifications,
          [type]: value
        }
      }
    }));
  };
  
  // 使用immer简化深层更新（可选）
  // import { produce } from 'immer';
  // 
  // const likePostWithImmer = (userId, postId) => {
  //   setData(produce(draft => {
  //     const user = draft.users.find(u => u.id === userId);
  //     const post = user.posts.find(p => p.id === postId);
  //     post.likes += 1;
  //   }));
  // };
  
  return (
    <div>
      {data.users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          
          <input
            value={user.name}
            onChange={e => updateUserName(user.id, e.target.value)}
          />
          
          {user.posts.map(post => (
            <div key={post.id}>
              <h4>{post.title}</h4>
              <p>点赞数: {post.likes}</p>
              <button onClick={() => likePost(user.id, post.id)}>
                点赞
              </button>
            </div>
          ))}
        </div>
      ))}
      
      <div className="settings">
        <label>
          <input
            type="checkbox"
            checked={data.settings.notifications.email}
            onChange={e => updateNotificationSetting('email', e.target.checked)}
          />
          邮件通知
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={data.settings.notifications.push}
            onChange={e => updateNotificationSetting('push', e.target.checked)}
          />
          推送通知
        </label>
      </div>
    </div>
  );
}
```

## 第十一部分：useState性能优化深度解析

### 11.1 对象State的优化

```jsx
// ❌ 不好：频繁创建新对象
function BadObjectUpdates() {
  const [config, setConfig] = useState({
    theme: 'light',
    language: 'zh-CN',
    fontSize: 14,
    lineHeight: 1.5
  });
  
  // 每个字段都创建新对象
  const updateTheme = (theme) => {
    setConfig({ ...config, theme });
  };
  
  const updateLanguage = (language) => {
    setConfig({ ...config, language });
  };
  
  const updateFontSize = (fontSize) => {
    setConfig({ ...config, fontSize });
  };
  
  return <div>{/* ... */}</div>;
}

// ✅ 好：拆分为独立State或使用useReducer
function GoodSplitState() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  
  // 每个状态独立更新
  return <div>{/* ... */}</div>;
}

// 或使用通用更新函数
function WithGenericUpdate() {
  const [config, setConfig] = useState({
    theme: 'light',
    language: 'zh-CN',
    fontSize: 14,
    lineHeight: 1.5
  });
  
  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  return (
    <div>
      <button onClick={() => updateConfig({ theme: 'dark' })}>
        切换主题
      </button>
      <button onClick={() => updateConfig({ fontSize: 16 })}>
        增大字体
      </button>
    </div>
  );
}
```

### 11.2 避免State计算

```jsx
// ❌ 不好：派生状态用State存储
function BadDerivedState({ items }) {
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [average, setAverage] = useState(0);
  
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.value, 0);
    const newCount = items.length;
    const newAverage = newCount > 0 ? newTotal / newCount : 0;
    
    setTotal(newTotal);
    setCount(newCount);
    setAverage(newAverage);
  }, [items]);
  
  return (
    <div>
      <p>总计: {total}</p>
      <p>数量: {count}</p>
      <p>平均: {average}</p>
    </div>
  );
}

// ✅ 好：直接计算派生值
function GoodDerivedValue({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const count = items.length;
  const average = count > 0 ? total / count : 0;
  
  return (
    <div>
      <p>总计: {total}</p>
      <p>数量: {count}</p>
      <p>平均: {average}</p>
    </div>
  );
}

// 如果计算昂贵，使用useMemo
function WithMemo({ items }) {
  const statistics = useMemo(() => {
    console.log('计算统计信息');
    
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const count = items.length;
    const average = count > 0 ? total / count : 0;
    
    return { total, count, average };
  }, [items]);
  
  return (
    <div>
      <p>总计: {statistics.total}</p>
      <p>数量: {statistics.count}</p>
      <p>平均: {statistics.average}</p>
    </div>
  );
}
```

### 11.3 State初始化优化

```jsx
// ❌ 不好：昂贵的初始化每次渲染都执行
function BadInitialization() {
  const expensiveCalculation = () => {
    console.log('执行昂贵计算');
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.random();
    }
    return result;
  };
  
  const [value, setValue] = useState(expensiveCalculation());
  // expensiveCalculation()在每次渲染时都会执行
  
  return <div>{value}</div>;
}

// ✅ 好：使用函数形式
function GoodInitialization() {
  const [value, setValue] = useState(() => {
    console.log('只在初始化时执行一次');
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.random();
    }
    return result;
  });
  
  return <div>{value}</div>;
}

// 从Props初始化（只使用初始值）
function InitFromProps({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  
  // 注意：initialValue后续变化不会影响State
  // 如果需要同步，应该使用Effect
  
  return <div>{value}</div>;
}

// 需要同步Props的情况
function SyncWithProps({ externalValue }) {
  const [value, setValue] = useState(externalValue);
  
  // 当externalValue变化时更新State
  useEffect(() => {
    setValue(externalValue);
  }, [externalValue]);
  
  return (
    <div>
      <p>内部值: {value}</p>
      <button onClick={() => setValue(value + 1)}>
        本地增加
      </button>
    </div>
  );
}
```

## 第十二部分：useState调试技巧

### 12.1 追踪State变化

```jsx
function useTrackedState(initialState, name = 'state') {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    console.log(`[${name}] 变化:`, state);
  }, [state, name]);
  
  return [state, setState];
}

// 使用
function TrackedComponent() {
  const [count, setCount] = useTrackedState(0, 'count');
  const [text, setText] = useTrackedState('', 'text');
  
  // 每次State变化都会打印日志
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <input value={text} onChange={e => setText(e.target.value)} />
    </div>
  );
}
```

### 12.2 State历史记录

```jsx
function useStateWithHistory(initialState, maxHistory = 10) {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  
  const setStateWithHistory = useCallback((newState) => {
    setState(prevState => {
      const newValue = typeof newState === 'function' 
        ? newState(prevState) 
        : newState;
      
      setHistory(prevHistory => {
        const newHistory = [...prevHistory, newValue];
        
        // 限制历史记录长度
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory);
        }
        
        return newHistory;
      });
      
      return newValue;
    });
  }, [maxHistory]);
  
  return [state, setStateWithHistory, history];
}

// 使用
function DebugComponent() {
  const [count, setCount, history] = useStateWithHistory(0);
  
  return (
    <div>
      <p>当前值: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      <div>
        <h4>历史记录:</h4>
        <ul>
          {history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

## 第十三部分：useState最佳实践总结

### 13.1 命名规范

```jsx
// ✅ 好的命名
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [items, setItems] = useState([]);

// ❌ 不好的命名
const [c, setC] = useState(0);  // 太简短
const [data, setData] = useState(null);  // 太泛
const [flag, setFlag] = useState(false);  // 不明确
const [thing, setThing] = useState([]);  // 不清楚

// 布尔值建议使用is/has/should前缀
const [isOpen, setIsOpen] = useState(false);
const [hasPermission, setHasPermission] = useState(false);
const [shouldUpdate, setShouldUpdate] = useState(false);

// 数组建议使用复数
const [users, setUsers] = useState([]);
const [todos, setTodos] = useState([]);
const [products, setProducts] = useState([]);
```

### 13.2 State组织原则

```jsx
// 原则1：相关State放在一起
function GoodGrouping() {
  // 用户相关
  const [user, setUser] = useState({ name: '', email: '' });
  
  // UI相关
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 数据相关
  const [items, setItems] = useState([]);
  
  return <div>{/* ... */}</div>;
}

// 原则2：独立变化的State分开
function GoodSeparation() {
  const [username, setUsername] = useState('');  // 独立变化
  const [password, setPassword] = useState('');  // 独立变化
  const [remember, setRemember] = useState(false);  // 独立变化
  
  return <div>{/* ... */}</div>;
}

// 原则3：避免冗余State
function AvoidRedundancy() {
  const [items, setItems] = useState([1, 2, 3]);
  
  // ❌ 不要存储派生值
  // const [count, setCount] = useState(items.length);
  
  // ✅ 直接计算
  const count = items.length;
  
  return <div>{/* ... */}</div>;
}
```

### 13.3 更新模式

```jsx
// 模式1：直接设置值
const [count, setCount] = useState(0);
setCount(5);  // 设置为5

// 模式2：基于当前值（同步）
setCount(count + 1);  // 同步场景下可以

// 模式3：函数式更新（推荐）
setCount(prev => prev + 1);  // 总是安全的

// 模式4：条件更新
setCount(prev => prev > 10 ? prev : prev + 1);

// 模式5：批量更新多个字段
setUser(prev => ({
  ...prev,
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
}));

// 模式6：数组操作
// 添加
setItems(prev => [...prev, newItem]);

// 删除
setItems(prev => prev.filter(item => item.id !== id));

// 更新
setItems(prev => prev.map(item => 
  item.id === id ? { ...item, ...updates } : item
));

// 排序
setItems(prev => [...prev].sort((a, b) => a.value - b.value));

// 反转
setItems(prev => [...prev].reverse());
```

## 第十四部分：与其他Hooks结合

### 14.1 useState + useEffect

```jsx
function CombinedStateEffect() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Effect响应State变化
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    
    const timer = setTimeout(async () => {
      const data = await search(query);
      setResults(data);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      {loading && <div>搜索中...</div>}
      
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 14.2 useState + useRef

```jsx
function StateWithRef() {
  const [count, setCount] = useState(0);
  const prevCount = useRef(0);
  
  useEffect(() => {
    prevCount.current = count;
  }, [count]);
  
  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一次的值: {prevCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}

// 追踪渲染次数
function RenderCounter() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);
  
  renderCount.current++;
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>渲染次数: {renderCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

### 14.3 useState + useMemo

```jsx
function StateWithMemo() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
  // 计算过滤和排序后的items
  const processedItems = useMemo(() => {
    console.log('重新计算processedItems');
    
    let result = items;
    
    // 过滤
    if (filter !== 'all') {
      result = result.filter(item => item.category === filter);
    }
    
    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });
    
    return result;
  }, [items, filter, sortBy]);
  
  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">全部</option>
        <option value="electronics">电子产品</option>
        <option value="books">图书</option>
      </select>
      
      <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
        <option value="name">按名称</option>
        <option value="price">按价格</option>
      </select>
      
      <ul>
        {processedItems.map(item => (
          <li key={item.id}>
            {item.name} - ¥{item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 第十五部分：useState TypeScript完整指南

### 15.1 基本类型

```tsx
import { useState } from 'react';

function TypeScriptBasics() {
  // 类型推断
  const [count, setCount] = useState(0);  // number
  const [name, setName] = useState('');   // string
  const [flag, setFlag] = useState(true); // boolean
  
  // 显式类型
  const [age, setAge] = useState<number>(25);
  const [email, setEmail] = useState<string>('');
  
  // 联合类型
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // 可选类型
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<Data | undefined>();
  
  return <div>{/* ... */}</div>;
}

// 接口定义
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

function UserComponent() {
  const [user, setUser] = useState<User | null>(null);
  
  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };
  
  return <div>{user?.name}</div>;
}
```

### 15.2 复杂类型

```tsx
// 数组类型
function ArrayTypes() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // 元组类型
  const [pair, setPair] = useState<[string, number]>(['key', 0]);
  
  // 二维数组
  const [matrix, setMatrix] = useState<number[][]>([]);
  
  return <div>{/* ... */}</div>;
}

// 对象类型
interface FormState {
  fields: {
    username: string;
    email: string;
  };
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

function FormComponent() {
  const [form, setForm] = useState<FormState>({
    fields: {
      username: '',
      email: ''
    },
    errors: {},
    touched: {}
  });
  
  return <div>{/* ... */}</div>;
}

// 泛型Hook
function useArray<T>(initialValue: T[] = []) {
  const [array, setArray] = useState<T[]>(initialValue);
  
  const push = (element: T) => {
    setArray(prev => [...prev, element]);
  };
  
  const remove = (index: number) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  };
  
  return { array, push, remove, setArray };
}

// 使用
function GenericArrayComponent() {
  const { array: numbers, push: pushNumber } = useArray<number>([1, 2, 3]);
  const { array: users, push: pushUser } = useArray<User>([]);
  
  return <div>{/* ... */}</div>;
}
```

## 练习题

### 基础练习

1. 使用useState创建计数器，支持增加、减少、重置
2. 实现对象State的更新，包括嵌套对象
3. 实现数组State的增删改查
4. 对比直接更新和函数式更新的差异

### 进阶练习

1. 使用惰性初始化优化localStorage读取
2. 实现一个完整的表单，包含验证
3. 理解批量更新机制，并验证性能优势
4. 创建一个购物车，使用State管理所有数据
5. 实现撤销/重做功能

### 高级练习

1. 分析useState的源码实现
2. 优化大型应用的State结构
3. 使用React 19特性增强useState
4. 实现一个复杂的状态机
5. 创建useHistory Hook支持撤销重做
6. 使用TypeScript为所有State添加类型

### 实战项目

1. 创建一个数据表格，支持排序、筛选、分页
2. 实现一个可拖拽的看板系统
3. 开发一个图形编辑器，支持撤销重做
4. 创建一个多步骤表单向导
5. 实现一个实时协作的待办应用

通过本章学习，你已经全面掌握了useState的所有用法，从基础到进阶，从原理到实战。useState是Hooks的基础，也是React状态管理的核心。熟练运用useState的各种模式和技巧，将使你的React应用更加高效、可维护。继续深入学习其他Hooks，构建更强大的应用！

