# useCallback函数缓存

## 学习目标

通过本章学习，你将全面掌握：

- useCallback的概念和工作原理
- useCallback vs useMemo的区别
- useCallback的使用场景
- 如何避免不必要的子组件渲染
- 依赖数组的正确使用
- 常见错误和最佳实践
- useCallback的性能优化策略
- React 19中的useCallback增强

## 第一部分：useCallback基础

### 1.1 什么是useCallback

useCallback是React提供的Hook，用于缓存函数引用，避免在每次渲染时创建新的函数实例。

```jsx
import { useCallback } from 'react';

// 基本语法
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b]
);

// 示例
function Component() {
  const [count, setCount] = useState(0);
  
  // 没有useCallback：每次渲染创建新函数
  const handleClick = () => {
    setCount(count + 1);
  };
  
  // 使用useCallback：函数引用保持不变
  const handleClickMemo = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <Child onClick={handleClick} />
      <MemoChild onClick={handleClickMemo} />
    </div>
  );
}
```

### 1.2 useCallback的工作原理

```jsx
// useCallback的简化实现
function useCallbackSimplified(callback, deps) {
  // 本质上是useMemo的特殊形式
  return useMemo(() => callback, deps);
}

// 完整实现概念
function useCallbackImplementation(callback, deps) {
  const hook = getCurrentHook();
  
  // 检查依赖是否变化
  const hasChanged = !hook || !areDepsEqual(hook.deps, deps);
  
  if (hasChanged) {
    // 依赖变化，保存新函数
    hook.callback = callback;
    hook.deps = deps;
  }
  
  // 返回缓存的函数
  return hook.callback;
}
```

### 1.3 useCallback vs useMemo

```jsx
function ComparisonExample() {
  const [count, setCount] = useState(0);
  
  // useCallback: 缓存函数本身
  const handleClickCallback = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  // useMemo: 缓存函数返回值
  const handleClickMemo = useMemo(() => {
    return () => {
      setCount(c => c + 1);
    };
  }, []);
  
  // 两者等价
  console.log(handleClickCallback === handleClickMemo); // 行为相同
  
  // useCallback实际上是useMemo的语法糖
  // useCallback(fn, deps) === useMemo(() => fn, deps)
  
  return (
    <button onClick={handleClickCallback}>
      Count: {count}
    </button>
  );
}
```

### 1.4 基本使用示例

```jsx
function BasicExample() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 不使用useCallback
  const handleIncrement = () => {
    setCount(c => c + 1);
  };
  
  // 使用useCallback
  const handleIncrementMemo = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  const handleTextChange = useCallback((e) => {
    setText(e.target.value);
  }, []);
  
  return (
    <div>
      <input value={text} onChange={handleTextChange} />
      <p>Count: {count}</p>
      <ExpensiveChild onIncrement={handleIncrementMemo} />
    </div>
  );
}

// 使用React.memo的子组件
const ExpensiveChild = React.memo(({ onIncrement }) => {
  console.log('ExpensiveChild渲染');
  
  return (
    <button onClick={onIncrement}>
      增加
    </button>
  );
});
```

## 第二部分：使用场景

### 2.1 场景1：传递给子组件的回调

```jsx
// 父组件
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 不使用useCallback
  const handleClick = () => {
    setCount(c => c + 1);
  };
  
  // 使用useCallback
  const handleClickMemo = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      
      {/* text变化时，Child会重新渲染 */}
      <Child onClick={handleClick} />
      
      {/* text变化时，MemoChild不会重新渲染 */}
      <MemoChild onClick={handleClickMemo} />
    </div>
  );
}

// 普通子组件
const Child = ({ onClick }) => {
  console.log('Child渲染');
  return <button onClick={onClick}>点击</button>;
};

// 使用memo的子组件
const MemoChild = React.memo(({ onClick }) => {
  console.log('MemoChild渲染');
  return <button onClick={onClick}>点击</button>;
});
```

### 2.2 场景2：作为useEffect的依赖

```jsx
function EffectDependency({ userId }) {
  const [data, setData] = useState(null);
  
  // 不使用useCallback
  const fetchData = () => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setData);
  };
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);  // fetchData每次都变，Effect每次都执行
  
  // 使用useCallback
  const fetchDataMemo = useCallback(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setData);
  }, [userId]);
  
  useEffect(() => {
    fetchDataMemo();
  }, [fetchDataMemo]);  // fetchDataMemo只在userId变化时变化
  
  return <div>{data?.name}</div>;
}
```

### 2.3 场景3：事件处理器优化

```jsx
function EventHandlers() {
  const [items, setItems] = useState([
    { id: 1, text: '项目1' },
    { id: 2, text: '项目2' },
    { id: 3, text: '项目3' }
  ]);
  
  // 不好：每个项目都创建新函数
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          {item.text}
          <button onClick={() => handleDelete(item.id)}>
            删除
          </button>
        </li>
      ))}
    </ul>
  );
  
  // 好：使用useCallback + 函数式更新
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

const ListItem = React.memo(({ item, onDelete }) => {
  console.log('ListItem渲染:', item.id);
  
  return (
    <li>
      {item.text}
      <button onClick={() => onDelete(item.id)}>
        删除
      </button>
    </li>
  );
});
```

### 2.4 场景4：自定义Hook中

```jsx
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  // 使用useCallback确保函数引用稳定
  const updateValue = useCallback(() => {
    setDebouncedValue(value);
  }, [value]);
  
  useEffect(() => {
    const timer = setTimeout(updateValue, delay);
    return () => clearTimeout(timer);
  }, [updateValue, delay]);
  
  return debouncedValue;
}

// 使用
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedTerm) {
      performSearch(debouncedTerm);
    }
  }, [debouncedTerm]);
  
  return (
    <input
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  );
}
```

### 2.5 场景5：大列表优化

```jsx
function LargeList() {
  const [items, setItems] = useState(
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
  );
  
  // 缓存删除函数
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  // 缓存更新函数
  const handleUpdate = useCallback((id, newValue) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, value: newValue } : item
    ));
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <ListRow
          key={item.id}
          item={item}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}

const ListRow = React.memo(({ item, onDelete, onUpdate }) => {
  console.log('Row渲染:', item.id);
  
  return (
    <div>
      <span>{item.name}: {item.value.toFixed(2)}</span>
      <button onClick={() => onUpdate(item.id, Math.random())}>
        更新
      </button>
      <button onClick={() => onDelete(item.id)}>
        删除
      </button>
    </div>
  );
});
```

## 第三部分：依赖数组详解

### 3.1 空依赖数组

```jsx
function EmptyDependencies() {
  const [count, setCount] = useState(0);
  
  // 空依赖：函数永远不变
  const handleClick = useCallback(() => {
    setCount(c => c + 1);  // 使用函数式更新
  }, []);
  
  // 错误：闭包陷阱
  const handleClickBad = useCallback(() => {
    setCount(count + 1);  // count永远是0
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>正确的增加</button>
      <button onClick={handleClickBad}>错误的增加</button>
    </div>
  );
}
```

### 3.2 包含依赖的数组

```jsx
function WithDependencies() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  // 依赖count和multiplier
  const handleClick = useCallback(() => {
    setCount(count + multiplier);
  }, [count, multiplier]);  // count或multiplier变化时，函数更新
  
  // 更好的方式：使用函数式更新减少依赖
  const handleClickBetter = useCallback(() => {
    setCount(c => c + multiplier);
  }, [multiplier]);  // 只依赖multiplier
  
  return (
    <div>
      <p>Count: {count}</p>
      <input
        type="number"
        value={multiplier}
        onChange={e => setMultiplier(Number(e.target.value))}
      />
      <button onClick={handleClickBetter}>增加</button>
    </div>
  );
}
```

### 3.3 对象和数组依赖

```jsx
function ObjectDependencies({ config }) {
  // 错误：config是对象，每次都变
  const handleSubmit = useCallback(() => {
    submitForm(config);
  }, [config]);  // config每次都变，callback失效
  
  // 正确：只依赖使用的属性
  const handleSubmitFixed = useCallback(() => {
    submitForm({ url: config.url, method: config.method });
  }, [config.url, config.method]);
  
  return <button onClick={handleSubmitFixed}>提交</button>;
}
```

### 3.4 函数依赖

```jsx
function FunctionDependencies() {
  const [count, setCount] = useState(0);
  
  // validator是函数，每次都变
  const validator = (value) => value > 0;
  
  const handleSubmit = useCallback(() => {
    if (validator(count)) {
      console.log('验证通过');
    }
  }, [count, validator]);  // validator每次都变
  
  // 解决方案1：把函数移到外部
  const handleSubmitFixed1 = useCallback(() => {
    if (isPositive(count)) {
      console.log('验证通过');
    }
  }, [count]);
  
  // 解决方案2：validator也用useCallback
  const validatorMemo = useCallback((value) => value > 0, []);
  
  const handleSubmitFixed2 = useCallback(() => {
    if (validatorMemo(count)) {
      console.log('验证通过');
    }
  }, [count, validatorMemo]);
  
  return <button onClick={handleSubmitFixed2}>提交</button>;
}

function isPositive(value) {
  return value > 0;
}
```

## 第四部分：常见错误和陷阱

### 4.1 错误1：闭包陷阱

```jsx
// 错误示例
function ClosureTrap() {
  const [count, setCount] = useState(0);
  
  // 错误：count被闭包捕获
  const handleClick = useCallback(() => {
    console.log(count);  // 永远打印0
    setCount(count + 1);  // 永远是0+1
  }, []);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>增加</button>
    </div>
  );
}

// 正确示例
function ClosureFixed() {
  const [count, setCount] = useState(0);
  
  // 方案1：使用函数式更新
  const handleClick = useCallback(() => {
    setCount(c => {
      console.log(c);  // 总是最新值
      return c + 1;
    });
  }, []);
  
  // 方案2：将count加入依赖
  const handleClickAlt = useCallback(() => {
    console.log(count);
    setCount(count + 1);
  }, [count]);  // count变化时更新函数
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>增加</button>
    </div>
  );
}
```

### 4.2 错误2：过度使用useCallback

```jsx
// 不好：过度使用
function OverUseCallback() {
  const [count, setCount] = useState(0);
  
  // 不必要：这个组件没有子组件
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  // 不必要：简单的事件处理器
  const handleReset = useCallback(() => {
    setCount(0);
  }, []);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>+1</button>
      <button onClick={handleReset}>重置</button>
    </div>
  );
}

// 好：合理使用
function ProperUseCallback() {
  const [count, setCount] = useState(0);
  
  // 只在传给memo组件时使用
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <p>{count}</p>
      <MemoButton onClick={handleClick} label="增加" />
    </div>
  );
}

const MemoButton = React.memo(({ onClick, label }) => {
  console.log('Button渲染');
  return <button onClick={onClick}>{label}</button>;
});
```

### 4.3 错误3：忘记函数式更新

```jsx
// 错误示例
function ForgotFunctionalUpdate() {
  const [items, setItems] = useState([]);
  
  // 错误：依赖items，但items每次都变
  const addItem = useCallback((item) => {
    setItems([...items, item]);  // items是旧值
  }, []);  // 缺少items依赖
  
  return <button onClick={() => addItem({ id: Date.now() })}>添加</button>;
}

// 正确示例
function WithFunctionalUpdate() {
  const [items, setItems] = useState([]);
  
  // 正确：使用函数式更新
  const addItem = useCallback((item) => {
    setItems(prevItems => [...prevItems, item]);
  }, []);  // 空依赖即可
  
  const removeItem = useCallback((id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  return (
    <div>
      <button onClick={() => addItem({ id: Date.now() })}>添加</button>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.id}</span>
          <button onClick={() => removeItem(item.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}
```

### 4.4 错误4：useCallback和内联函数混用

```jsx
// 不一致的使用
function InconsistentUsage() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <MemoChild onIncrement={handleIncrement} />
      {/* 这里又用了内联函数，失去了memo的意义 */}
      <MemoChild onDecrement={() => setCount(c => c - 1)} />
    </div>
  );
}

// 一致的使用
function ConsistentUsage() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  const handleDecrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);
  
  return (
    <div>
      <MemoChild onIncrement={handleIncrement} />
      <MemoChild onDecrement={handleDecrement} />
    </div>
  );
}
```

## 第五部分：实战案例

### 5.1 案例1：表单处理

```jsx
function FormComponent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // 通用的字段更新处理器
  const handleFieldChange = useCallback((field) => {
    return (e) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
      
      // 清除错误
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    };
  }, []);
  
  // 验证处理器
  const handleValidate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = '姓名不能为空';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = '邮箱格式错误';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.email]);
  
  // 提交处理器
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (handleValidate()) {
      console.log('提交:', formData);
    }
  }, [formData, handleValidate]);
  
  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="姓名"
        value={formData.name}
        onChange={handleFieldChange('name')}
        error={errors.name}
      />
      
      <FormField
        label="邮箱"
        value={formData.email}
        onChange={handleFieldChange('email')}
        error={errors.email}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}

const FormField = React.memo(({ label, value, onChange, error }) => {
  console.log('FormField渲染:', label);
  
  return (
    <div>
      <label>{label}</label>
      <input value={value} onChange={onChange} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});
```

### 5.2 案例2：Todo列表

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // 添加Todo
  const addTodo = useCallback((text) => {
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text, completed: false }
    ]);
  }, []);
  
  // 切换完成状态
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  // 删除Todo
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  // 编辑Todo
  const editTodo = useCallback((id, newText) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  }, []);
  
  // 批量操作
  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  }, []);
  
  const toggleAll = useCallback(() => {
    setTodos(prev => {
      const allCompleted = prev.every(t => t.completed);
      return prev.map(t => ({ ...t, completed: !allCompleted }));
    });
  }, []);
  
  // 过滤
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);
  
  return (
    <div>
      <TodoInput onAdd={addTodo} />
      
      <FilterButtons filter={filter} onFilterChange={setFilter} />
      
      <TodoListView
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />
      
      <TodoFooter
        count={todos.filter(t => !t.completed).length}
        onClearCompleted={clearCompleted}
        onToggleAll={toggleAll}
      />
    </div>
  );
}

const TodoItem = React.memo(({ todo, onToggle, onDelete, onEdit }) => {
  console.log('TodoItem渲染:', todo.id);
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </div>
  );
});
```

### 5.3 案例3：购物车

```jsx
function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState('');
  
  // 添加商品
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
  
  // 更新数量
  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  }, []);
  
  // 移除商品
  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // 清空购物车
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);
  
  // 计算总价
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);
  
  // 应用优惠券
  const applyCoupon = useCallback((code) => {
    setCoupon(code);
  }, []);
  
  const discount = useMemo(() => {
    if (coupon === 'SAVE10') return subtotal * 0.1;
    if (coupon === 'SAVE20') return subtotal * 0.2;
    return 0;
  }, [coupon, subtotal]);
  
  const total = subtotal - discount;
  
  return (
    <div>
      <CartItems
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
      
      <CouponInput onApply={applyCoupon} />
      
      <CartSummary
        subtotal={subtotal}
        discount={discount}
        total={total}
      />
      
      <button onClick={clearCart}>清空购物车</button>
    </div>
  );
}

const CartItem = React.memo(({ item, onUpdateQuantity, onRemove }) => {
  console.log('CartItem渲染:', item.id);
  
  return (
    <div>
      <span>{item.name}</span>
      <input
        type="number"
        value={item.quantity}
        onChange={e => onUpdateQuantity(item.id, Number(e.target.value))}
        min="0"
      />
      <span>¥{item.price * item.quantity}</span>
      <button onClick={() => onRemove(item.id)}>删除</button>
    </div>
  );
});
```

## 第六部分：性能优化

### 6.1 配合React.memo使用

```jsx
// 子组件必须用React.memo包裹
const OptimizedChild = React.memo(({ onClick, data }) => {
  console.log('Child渲染');
  return (
    <div onClick={onClick}>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
});

// 父组件使用useCallback
function OptimizedParent() {
  const [count, setCount] = useState(0);
  const [items] = useState([{ id: 1, name: 'Item 1' }]);
  
  // useCallback确保函数引用稳定
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  // useMemo确保数组引用稳定
  const memoItems = useMemo(() => items, [items]);
  
  return (
    <div>
      <p>Count: {count}</p>
      {/* count变化时，OptimizedChild不会重新渲染 */}
      <OptimizedChild onClick={handleClick} data={memoItems} />
    </div>
  );
}
```

### 6.2 减少依赖数组

```jsx
function ReduceDependencies() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  const [offset, setOffset] = useState(10);
  
  // 不好：依赖count和offset
  const handleClick = useCallback(() => {
    setCount(count + offset);
  }, [count, offset]);
  
  // 好：使用函数式更新减少依赖
  const handleClickBetter = useCallback(() => {
    setCount(c => c + offset);
  }, [offset]);
  
  // 最好：如果可能，进一步减少依赖
  const handleClickBest = useCallback(() => {
    setCount(c => c + 10);  // 如果offset是常量
  }, []);
  
  return <button onClick={handleClickBest}>增加</button>;
}
```

### 6.3 提取到组件外部

```jsx
// 不依赖组件状态的函数可以提取到外部
function validateEmail(email) {
  return email.includes('@');
}

function isPositive(value) {
  return value > 0;
}

function Component() {
  const [email, setEmail] = useState('');
  
  // 不需要useCallback
  const handleSubmit = () => {
    if (validateEmail(email)) {
      console.log('有效邮箱');
    }
  };
  
  return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}
```

## 第七部分：React 19增强

### 7.1 自动优化

```jsx
// React 19编译器可能自动优化函数
function AutoOptimized() {
  const [count, setCount] = useState(0);
  
  // 编译器可能自动识别并优化
  const handleClick = () => {
    setCount(c => c + 1);
  };
  
  // 可能被编译为：
  // const handleClick = useCallback(() => {
  //   setCount(c => c + 1);
  // }, []);
  
  return <MemoChild onClick={handleClick} />;
}
```

### 7.2 与Server Actions配合

```jsx
'use client';

import { useCallback, useTransition } from 'react';
import { updateUser } from './actions';

function UserProfile({ userId }) {
  const [isPending, startTransition] = useTransition();
  
  const handleUpdate = useCallback((data) => {
    startTransition(async () => {
      await updateUser(userId, data);
    });
  }, [userId]);
  
  return (
    <ProfileForm
      onSubmit={handleUpdate}
      isPending={isPending}
    />
  );
}
```

## 第八部分：最佳实践

### 8.1 何时使用useCallback

```jsx
// ✅ 使用useCallback的场景：
// 1. 传给React.memo组件的props
const handleClick = useCallback(() => {}, []);
<MemoComponent onClick={handleClick} />

// 2. 作为useEffect的依赖
useEffect(() => {
  fetchData();
}, [fetchData]);

// 3. 作为其他Hook的依赖
const value = useMemo(() => computeValue(callback), [callback]);

// ❌ 不需要useCallback的场景：
// 1. 没有传给memo组件
<RegularComponent onClick={handleClick} />

// 2. 组件内部使用，不作为依赖
const handleClick = () => {};

// 3. 简单的事件处理器，没有性能问题
```

### 8.2 使用函数式更新

```jsx
// ✅ 好的做法
const handleClick = useCallback(() => {
  setCount(c => c + 1);  // 函数式更新
}, []);

// ❌ 避免
const handleClick = useCallback(() => {
  setCount(count + 1);  // 需要依赖count
}, [count]);
```

### 8.3 保持依赖数组准确

```jsx
// ✅ 准确的依赖
const handleSubmit = useCallback(() => {
  submitForm(userId, formData);
}, [userId, formData]);

// ❌ 缺少依赖
const handleSubmit = useCallback(() => {
  submitForm(userId, formData);
}, []);  // 缺少userId和formData
```

## 注意事项

### 1. 不要过度使用useCallback

```jsx
// ❌ 过度优化：不必要的useCallback
function OverOptimized() {
  const [count, setCount] = useState(0);
  
  // 不必要：没有传递给memo组件，也不作为依赖
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确：只在必要时使用
function Correct() {
  const [count, setCount] = useState(0);
  
  // 直接定义函数即可
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <button onClick={handleClick}>Click</button>;
}
```

### 2. useCallback本身也有成本

```jsx
// useCallback的开销包括：
// - 创建函数闭包
// - 维护依赖数组
// - 每次渲染时比较依赖

// 只有当避免子组件渲染的收益 > useCallback的成本时才值得使用
```

### 3. 必须配合React.memo使用才有效

```jsx
// ❌ 无效：子组件没有memo
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  // Child每次都会重新渲染，useCallback无效
  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  console.log('Child render');
  return <button onClick={onClick}>Click</button>;
}

// ✅ 有效：子组件使用memo
const MemoChild = React.memo(Child);

function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  // MemoChild不会因为handleClick重新渲染
  return <MemoChild onClick={handleClick} />;
}
```

### 4. 优先使用函数式更新减少依赖

```jsx
// ❌ 依赖state，导致useCallback频繁重新创建
function Bad() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(count + 1);
  }, [count]); // 依赖count
  
  return <MemoChild onClick={increment} />;
}

// ✅ 函数式更新，减少依赖
function Good() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 无依赖
  
  return <MemoChild onClick={increment} />;
}
```

### 5. 避免在useCallback中引用不稳定的对象

```jsx
// ❌ 问题：config每次都是新对象
function Bad() {
  const config = { setting: 'value' };
  
  const handleClick = useCallback(() => {
    doSomething(config);
  }, [config]); // config每次都变，useCallback失效
  
  return <MemoChild onClick={handleClick} />;
}

// ✅ 解决方案1：useMemo稳定对象
function Good() {
  const config = useMemo(() => ({ setting: 'value' }), []);
  
  const handleClick = useCallback(() => {
    doSomething(config);
  }, [config]);
  
  return <MemoChild onClick={handleClick} />;
}

// ✅ 解决方案2：只依赖具体的值
function AlsoGood() {
  const setting = 'value';
  
  const handleClick = useCallback(() => {
    doSomething({ setting });
  }, [setting]);
  
  return <MemoChild onClick={handleClick} />;
}
```

## 常见问题

### Q1: useCallback和useMemo有什么区别？

**A:** 

- `useCallback` 缓存**函数本身**
- `useMemo` 缓存**函数的返回值**

```jsx
// useCallback
const memoizedCallback = useCallback(() => {
  return a + b;
}, [a, b]);

// 等价于 useMemo
const memoizedCallback = useMemo(() => {
  return () => a + b;
}, [a, b]);

// useMemo用于缓存计算结果
const memoizedValue = useMemo(() => {
  return a + b;
}, [a, b]);
```

### Q2: 什么时候应该使用useCallback？

**A:** 只在以下场景使用：

1. **传递给React.memo包裹的子组件**
```jsx
const MemoChild = React.memo(Child);

function Parent() {
  const handleClick = useCallback(() => {
    // ...
  }, []);
  
  return <MemoChild onClick={handleClick} />;
}
```

2. **作为useEffect等Hook的依赖**
```jsx
function Component() {
  const fetchData = useCallback(() => {
    // 数据获取逻辑
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData作为依赖
}
```

3. **作为其他优化Hook的依赖**
```jsx
const value = useMemo(() => {
  return expensiveCalculation(callback);
}, [callback]); // callback作为依赖
```

### Q3: 为什么使用useCallback后性能反而变差了？

**A:** 可能的原因：

1. **子组件没有使用React.memo**
```jsx
// useCallback无效
function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <Child onClick={handleClick} />; // Child没有memo
}
```

2. **依赖项频繁变化**
```jsx
// 依赖count，每次count变化都重新创建
const handleClick = useCallback(() => {
  doSomething(count);
}, [count]);
```

3. **过度使用导致额外开销**
```jsx
// 不必要的useCallback反而增加开销
const handleClick = useCallback(() => {
  console.log('click');
}, []); // 简单函数不需要缓存
```

### Q4: useCallback能防止函数重复执行吗？

**A:** 不能！useCallback只缓存函数**引用**，不会防止函数执行。

```jsx
function Component() {
  const handleClick = useCallback(() => {
    console.log('执行了');
  }, []);
  
  // 每次点击都会执行console.log
  // useCallback只是保证handleClick的引用不变
  return <button onClick={handleClick}>Click</button>;
}
```

如果需要防抖或节流，使用专门的Hook：

```jsx
function useDebounceCallback(callback, delay) {
  const timeoutRef = useRef();
  
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}
```

### Q5: 如何处理useCallback中的闭包陷阱？

**A:** 使用useRef存储最新值：

```jsx
// ❌ 闭包陷阱：回调中的count永远是旧值
function Bad() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log(count); // 总是0
  }, []); // 空依赖数组
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <button onClick={handleClick}>打印</button>
    </div>
  );
}

// ✅ 解决方案1：添加依赖（但会重新创建函数）
function Solution1() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]); // 添加count作为依赖
}

// ✅ 解决方案2：使用useRef（保持函数引用稳定）
function Solution2() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const handleClick = useCallback(() => {
    console.log(countRef.current); // 总是最新值
  }, []); // 空依赖数组
}

// ✅ 解决方案3：使用函数式更新
function Solution3() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => {
      console.log(c); // 最新值
      return c;
    });
  }, []);
}
```

### Q6: useCallback在React 19中有什么变化？

**A:** React 19的主要变化：

1. **编译器自动优化**
```jsx
// 你写的代码
function Component() {
  const handleClick = () => {
    console.log('click');
  };
  
  return <MemoChild onClick={handleClick} />;
}

// 编译器可能自动转换为
function Component() {
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);
  
  return <MemoChild onClick={handleClick} />;
}
```

2. **更好的类型推断**（TypeScript）
```tsx
// React 19改进了类型推断
const handleClick = useCallback((event: React.MouseEvent) => {
  // event类型自动推断
}, []);
```

3. **与新特性集成**
```jsx
// 配合useTransition
const handleUpdate = useCallback(() => {
  startTransition(() => {
    // 更新逻辑
  });
}, []);

// 配合use Hook
const handleClick = useCallback(async () => {
  const data = await fetchData();
  // 处理数据
}, []);
```

### Q7: useCallback和内联函数哪个更好？

**A:** 取决于场景：

```jsx
// 场景1：传递给普通组件 - 内联函数更好
function Component() {
  return (
    <button onClick={() => console.log('click')}>
      Click
    </button>
  );
}

// 场景2：传递给memo组件 - useCallback更好
const MemoButton = React.memo(Button);

function Component() {
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);
  
  return <MemoButton onClick={handleClick} />;
}

// 场景3：复杂逻辑 - 提取为useCallback
function Component() {
  const handleSubmit = useCallback(async (data) => {
    await validate(data);
    await transform(data);
    await submit(data);
  }, []);
  
  return <Form onSubmit={handleSubmit} />;
}
```

## 总结

### 核心要点

1. **useCallback的作用**
   - 缓存函数引用，避免每次渲染创建新函数
   - 防止子组件因为props引用变化而重新渲染
   - 必须配合React.memo使用才能发挥作用

2. **使用时机**
   - ✅ 传递给React.memo包裹的组件
   - ✅ 作为useEffect等Hook的依赖
   - ✅ 作为其他优化Hook的依赖
   - ❌ 简单的事件处理器
   - ❌ 组件内部使用，不作为依赖
   - ❌ 没有传递给memo组件

3. **性能权衡**
   ```jsx
   useCallback的成本：
   - 创建闭包
   - 维护依赖数组
   - 比较依赖变化
   
   收益：
   - 避免子组件不必要的渲染
   
   只有当收益 > 成本时才使用
   ```

4. **最佳实践**
   - 优先使用函数式更新减少依赖
   - 保持依赖数组准确和稳定
   - 避免引用不稳定的对象作为依赖
   - 使用useRef解决闭包陷阱
   - 配合React.memo使用

5. **常见陷阱**
   - 过度使用导致代码复杂
   - 忘记配合React.memo
   - 依赖项不稳定导致频繁重新创建
   - 闭包陷阱捕获旧值
   - 误认为能防止函数执行

### 决策流程图

```
需要缓存函数吗？
    │
    ├─ 是否传递给memo组件？
    │   ├─ 是 → 使用useCallback
    │   └─ 否 → ↓
    │
    ├─ 是否作为Hook依赖？
    │   ├─ 是 → 使用useCallback
    │   └─ 否 → ↓
    │
    ├─ 函数逻辑是否复杂？
    │   ├─ 是 → 考虑useCallback
    │   └─ 否 → 内联函数
    │
    └─ 是否有性能问题？
        ├─ 是 → 测量后决定
        └─ 否 → 内联函数
```

### 最佳实践清单

```jsx
// ✅ DO - 推荐做法
1. 只在必要时使用useCallback
2. 配合React.memo使用
3. 使用函数式更新减少依赖
4. 保持依赖数组准确
5. 使用useRef解决闭包问题
6. 使用Profiler测量效果

// ❌ DON'T - 避免做法
1. 不要过度使用useCallback
2. 不要忘记配合React.memo
3. 不要依赖不稳定的对象
4. 不要忽略闭包陷阱
5. 不要依赖useCallback做防抖节流
6. 不要过早优化
```

### 与其他优化方案对比

```jsx
// useCallback - 缓存函数引用
const callback = useCallback(() => {}, []);

// useMemo - 缓存计算结果
const value = useMemo(() => compute(), []);

// React.memo - 缓存组件渲染
const MemoComp = React.memo(Component);

// 组合使用效果最好
function Parent() {
  const callback = useCallback(() => {}, []);
  const value = useMemo(() => compute(), []);
  
  return <MemoChild callback={callback} value={value} />;
}
```

### 学习建议

1. **理论学习**
   - 理解React渲染机制
   - 掌握函数引用相等性
   - 了解闭包原理

2. **实践技能**
   - 使用React DevTools Profiler
   - 测量优化前后性能
   - 在真实项目中应用

3. **进阶主题**
   - React 19编译器优化
   - 自定义优化Hook
   - 性能监控和分析

### 下一步学习

- 学习 `React.memo` - 组件缓存
- 学习性能优化实战对比
- 掌握React 19的自动优化
- 探索自定义Hooks的优化技巧

通过本章学习，你已经全面掌握了useCallback的使用。记住：**useCallback是优化工具，不是必需品**。先写清晰的代码，然后根据实际性能问题进行针对性优化。合理使用useCallback可以显著提升应用性能，避免不必要的重新渲染！
