# useReducer与useState对比

## 学习目标

通过本章学习,你将全面掌握:

- useReducer和useState的核心区别与工作原理
- 各自的适用场景与最佳实践
- 详细的性能对比分析
- 何时选择useReducer及原因
- 何时选择useState及原因
- 从useState平滑迁移到useReducer的策略
- 实战案例中的决策指南
- TypeScript中的类型定义差异
- React 19中的优化建议

## 第一部分:基本对比

### 1.1 语法对比

```jsx
import { useState, useReducer } from 'react';

// useState版本 - 简单直观
function CounterWithState() {
  const [count, setCount] = useState(0);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);
  const incrementBy = (amount) => setCount(count + amount);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={() => incrementBy(5)}>+5</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// useReducer版本 - 集中管理
function CounterWithReducer() {
  const initialState = { count: 0 };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      case 'decrement':
        return { count: state.count - 1 };
      case 'reset':
        return { count: 0 };
      case 'incrementBy':
        return { count: state.count + action.payload };
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'incrementBy', payload: 5 })}>+5</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}

// 对比总结:
/*
useState:
- API简单: setCount(newValue)
- 代码少
- 学习曲线平缓
- 适合简单场景

useReducer:
- API统一: dispatch(action)
- 代码结构化
- 学习曲线陡峭
- 适合复杂场景
*/
```

### 1.2 API对比

```jsx
// useState API
const [state, setState] = useState(initialState);

// 直接设置值
setState(newValue);

// 函数式更新
setState(prevState => newValue);

// useReducer API
const [state, dispatch] = useReducer(reducer, initialState, init);

// 通过dispatch发送action
dispatch({ type: 'ACTION_TYPE' });
dispatch({ type: 'ACTION_TYPE', payload: data });

// reducer函数
function reducer(state, action) {
  // 根据action返回新state
  return newState;
}

// API特点对比
/*
useState:
1. setState直接设置新值
2. 支持函数式更新
3. 每个状态独立管理
4. 更新逻辑分散在组件中

useReducer:
1. dispatch发送action
2. reducer集中处理所有更新
3. 状态更新可预测
4. 更新逻辑集中在reducer
5. 便于测试和调试
*/
```

### 1.3 状态更新方式对比

```jsx
// useState: 直接更新
function UseStateExample() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  // 直接设置新对象
  const updateName = () => {
    setUser({ ...user, name: 'Bob' });
  };
  
  // 函数式更新
  const incrementAge = () => {
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
  };
  
  return (
    <div>
      <p>{user.name}, {user.age}</p>
      <button onClick={updateName}>改名</button>
      <button onClick={incrementAge}>增加年龄</button>
    </div>
  );
}

// useReducer: 通过action更新
function UseReducerExample() {
  const initialState = { name: 'Alice', age: 25 };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_NAME':
        return { ...state, name: action.payload };
      case 'INCREMENT_AGE':
        return { ...state, age: state.age + 1 };
      default:
        return state;
    }
  };
  
  const [user, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <p>{user.name}, {user.age}</p>
      <button onClick={() => dispatch({ type: 'UPDATE_NAME', payload: 'Bob' })}>
        改名
      </button>
      <button onClick={() => dispatch({ type: 'INCREMENT_AGE' })}>
        增加年龄
      </button>
    </div>
  );
}

// 多个相关状态的对比
function MultipleStates() {
  // useState版本 - 多个独立状态
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const submit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await api.submit({ name, email, age });
      // 成功后重置
      setName('');
      setEmail('');
      setAge(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // useReducer版本 - 统一管理
  const initialState = {
    name: '',
    email: '',
    age: 0,
    loading: false,
    error: null
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value };
      case 'SUBMIT_START':
        return { ...state, loading: true, error: null };
      case 'SUBMIT_SUCCESS':
        return {
          ...initialState  // 重置到初始状态
        };
      case 'SUBMIT_ERROR':
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const submitWithReducer = async () => {
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await api.submit({
        name: state.name,
        email: state.email,
        age: state.age
      });
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', payload: err.message });
    }
  };
  
  return (
    <div>
      {/* 使用useState版本 */}
      <input value={name} onChange={e => setName(e.target.value)} />
      
      {/* 使用useReducer版本 */}
      <input
        value={state.name}
        onChange={e => dispatch({
          type: 'SET_FIELD',
          field: 'name',
          value: e.target.value
        })}
      />
    </div>
  );
}
```

## 第二部分:适用场景对比

### 2.1 useState适合的场景

```jsx
// 场景1: 简单的独立状态
function SimpleToggle() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '关闭' : '打开'}
      </button>
      {isOpen && <div>内容</div>}
    </div>
  );
}

// 场景2: 单一值的状态
function SimpleCounter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

// 场景3: 表单的单个字段
function SingleField() {
  const [name, setName] = useState('');
  
  return (
    <input
      value={name}
      onChange={e => setName(e.target.value)}
    />
  );
}

// 场景4: 数组或对象状态(简单操作)
function SimpleList() {
  const [items, setItems] = useState([]);
  
  const addItem = () => {
    setItems([...items, `Item ${items.length + 1}`]);
  };
  
  return (
    <div>
      <button onClick={addItem}>添加</button>
      <ul>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

// 场景5: 临时UI状态
function Tooltip() {
  const [visible, setVisible] = useState(false);
  
  return (
    <div>
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        悬停显示提示
      </button>
      {visible && <div className="tooltip">提示信息</div>}
    </div>
  );
}

// useState的优势总结:
/*
1. 简单直观,学习成本低
2. 代码量少,适合小组件
3. 状态独立,互不影响
4. 适合简单的CRUD操作
5. 适合临时的UI状态
*/
```

### 2.2 useReducer适合的场景

```jsx
// 场景1: 复杂的状态逻辑
function ComplexForm() {
  const initialState = {
    // 表单字段
    fields: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    // 验证错误
    errors: {},
    // 触碰状态
    touched: {},
    // 提交状态
    submitting: false,
    submitError: null
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_FIELD':
        return {
          ...state,
          fields: {
            ...state.fields,
            [action.name]: action.value
          },
          touched: {
            ...state.touched,
            [action.name]: true
          }
        };
      
      case 'SET_ERROR':
        return {
          ...state,
          errors: {
            ...state.errors,
            [action.name]: action.error
          }
        };
      
      case 'SUBMIT_START':
        return {
          ...state,
          submitting: true,
          submitError: null
        };
      
      case 'SUBMIT_SUCCESS':
        return initialState;
      
      case 'SUBMIT_ERROR':
        return {
          ...state,
          submitting: false,
          submitError: action.error
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 复杂的状态更新逻辑集中在reducer中
  return (
    <form>
      {/* 表单字段 */}
    </form>
  );
}

// 场景2: 多个子值相互依赖
function ShoppingCart() {
  const initialState = {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    discount: null,
    discountAmount: 0
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM':
        const newItems = [...state.items, action.payload];
        const newSubtotal = calculateSubtotal(newItems);
        const newTax = newSubtotal * 0.1;
        const newDiscountAmount = state.discount
          ? newSubtotal * (state.discount.percentage / 100)
          : 0;
        const newTotal = newSubtotal + newTax - newDiscountAmount;
        
        return {
          ...state,
          items: newItems,
          subtotal: newSubtotal,
          tax: newTax,
          discountAmount: newDiscountAmount,
          total: newTotal
        };
      
      case 'APPLY_DISCOUNT':
        const discountAmount = state.subtotal * (action.payload.percentage / 100);
        return {
          ...state,
          discount: action.payload,
          discountAmount,
          total: state.subtotal + state.tax - discountAmount
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 相关值自动更新,保持一致性
  return <div>{/* 购物车UI */}</div>;
}

// 场景3: 状态转换逻辑复杂
function Wizard() {
  const initialState = {
    step: 1,
    maxStep: 3,
    data: {},
    canGoNext: false,
    canGoPrev: false,
    completed: false
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'NEXT_STEP':
        if (state.step < state.maxStep) {
          const nextStep = state.step + 1;
          return {
            ...state,
            step: nextStep,
            canGoNext: nextStep < state.maxStep,
            canGoPrev: true,
            completed: nextStep === state.maxStep
          };
        }
        return state;
      
      case 'PREV_STEP':
        if (state.step > 1) {
          const prevStep = state.step - 1;
          return {
            ...state,
            step: prevStep,
            canGoNext: true,
            canGoPrev: prevStep > 1,
            completed: false
          };
        }
        return state;
      
      case 'SET_STEP_DATA':
        return {
          ...state,
          data: {
            ...state.data,
            [state.step]: action.payload
          }
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 复杂的状态转换逻辑
  return <div>{/* 向导UI */}</div>;
}

// 场景4: 类似Redux的状态管理
function AppStateManagement() {
  const initialState = {
    user: null,
    theme: 'light',
    language: 'en',
    notifications: [],
    settings: {}
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      // 用户相关
      case 'USER/LOGIN':
        return { ...state, user: action.payload };
      case 'USER/LOGOUT':
        return { ...state, user: null };
      
      // 主题相关
      case 'THEME/SET':
        return { ...state, theme: action.payload };
      
      // 语言相关
      case 'LANGUAGE/SET':
        return { ...state, language: action.payload };
      
      // 通知相关
      case 'NOTIFICATION/ADD':
        return {
          ...state,
          notifications: [...state.notifications, action.payload]
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 类似Redux的集中状态管理
  return <div>{/* App UI */}</div>;
}

// useReducer的优势总结:
/*
1. 状态逻辑集中,易于维护
2. 状态更新可预测
3. 适合复杂的状态转换
4. 便于测试reducer
5. 适合多个相关状态
6. 类似Redux,易于理解
7. 更新逻辑可复用
*/
```

### 2.3 何时从useState迁移到useReducer

```jsx
// 迁移信号1: 状态更新逻辑变复杂
// useState版本 - 复杂
function ComplexUpdateWithState() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 复杂的更新逻辑分散
  const addItem = (item) => {
    setData([...data, item]);
    // 可能需要重置分页
    setPage(1);
  };
  
  const changeFilter = (newFilter) => {
    setFilter(newFilter);
    setPage(1);  // 重置分页
  };
  
  const changeSort = (newSort) => {
    setSort(newSort);
    setPage(1);  // 重置分页
  };
  
  // 问题:状态更新逻辑分散,容易遗漏
  return <div>{/* UI */}</div>;
}

// useReducer版本 - 清晰
function ComplexUpdateWithReducer() {
  const initialState = {
    data: [],
    filter: 'all',
    sort: 'asc',
    page: 1,
    pageSize: 10
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM':
        return {
          ...state,
          data: [...state.data, action.payload],
          page: 1  // 自动重置分页
        };
      
      case 'SET_FILTER':
        return {
          ...state,
          filter: action.payload,
          page: 1  // 自动重置分页
        };
      
      case 'SET_SORT':
        return {
          ...state,
          sort: action.payload,
          page: 1  // 自动重置分页
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 状态更新逻辑集中,不会遗漏
  return <div>{/* UI */}</div>;
}

// 迁移信号2: 出现"状态地狱"
// useState版本 - 状态地狱
function StateHell() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // 太多独立的状态,难以管理
  return <div>{/* UI */}</div>;
}

// useReducer版本 - 清晰
function ReducerHeaven() {
  const initialState = {
    fields: { name: '', email: '', password: '' },
    errors: {},
    touched: {},
    submitting: false,
    submitError: null
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_FIELD':
        return {
          ...state,
          fields: { ...state.fields, [action.name]: action.value },
          touched: { ...state.touched, [action.name]: true }
        };
      
      case 'SET_ERROR':
        return {
          ...state,
          errors: { ...state.errors, [action.name]: action.error }
        };
      
      case 'SUBMIT_START':
        return { ...state, submitting: true, submitError: null };
      
      case 'SUBMIT_ERROR':
        return { ...state, submitting: false, submitError: action.error };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 状态组织清晰,易于管理
  return <div>{/* UI */}</div>;
}

// 迁移信号3: 需要状态历史/撤销重做
// useReducer更容易实现
function UndoRedoWithReducer() {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 };
      case 'DECREMENT':
        return { count: state.count - 1 };
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 包装dispatch以记录历史
  const dispatchWithHistory = (action) => {
    const newState = reducer(state, action);
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    dispatch(action);
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
  
  return <div>{/* UI with undo/redo */}</div>;
}

// 迁移指南:
/*
从useState迁移到useReducer的时机:

1. 状态更新逻辑超过3-5个相关操作
2. 出现5个以上相关的useState
3. 状态之间有复杂的依赖关系
4. 需要状态历史/撤销重做
5. 状态更新逻辑需要在多处复用
6. 状态转换逻辑复杂(如状态机)
7. 需要更好的可测试性
8. 团队熟悉Redux模式
*/
```

## 第三部分:性能对比

### 3.1 渲染性能

```jsx
// 性能测试1: 简单状态更新
function SimpleUpdatePerformance() {
  // useState版本
  const UseStateVersion = () => {
    const [count, setCount] = useState(0);
    const renderCount = useRef(0);
    renderCount.current++;
    
    console.log('useState渲染次数:', renderCount.current);
    
    return (
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>增加</button>
      </div>
    );
  };
  
  // useReducer版本
  const UseReducerVersion = () => {
    const reducer = (state, action) => {
      switch (action.type) {
        case 'increment':
          return { count: state.count + 1 };
        default:
          return state;
      }
    };
    
    const [state, dispatch] = useReducer(reducer, { count: 0 });
    const renderCount = useRef(0);
    renderCount.current++;
    
    console.log('useReducer渲染次数:', renderCount.current);
    
    return (
      <div>
        <p>Count: {state.count}</p>
        <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
      </div>
    );
  };
  
  // 结论:对于简单更新,性能差异可以忽略
  return (
    <div>
      <UseStateVersion />
      <UseReducerVersion />
    </div>
  );
}

// 性能测试2: 复杂状态更新
function ComplexUpdatePerformance() {
  // useState版本 - 多次setState可能导致多次渲染
  const UseStateVersion = () => {
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');
    const [field3, setField3] = useState('');
    const renderCount = useRef(0);
    renderCount.current++;
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      
      // 可能触发多次渲染
      if (name === 'field1') setField1(value);
      if (name === 'field2') setField2(value);
      if (name === 'field3') setField3(value);
    };
    
    console.log('useState复杂更新渲染次数:', renderCount.current);
    
    return <div>{/* fields */}</div>;
  };
  
  // useReducer版本 - 一次dispatch,一次渲染
  const UseReducerVersion = () => {
    const reducer = (state, action) => {
      switch (action.type) {
        case 'SET_FIELD':
          return { ...state, [action.name]: action.value };
        default:
          return state;
      }
    };
    
    const [state, dispatch] = useReducer(reducer, {
      field1: '',
      field2: '',
      field3: ''
    });
    const renderCount = useRef(0);
    renderCount.current++;
    
    const handleChange = (e) => {
      dispatch({
        type: 'SET_FIELD',
        name: e.target.name,
        value: e.target.value
      });
    };
    
    console.log('useReducer复杂更新渲染次数:', renderCount.current);
    
    return <div>{/* fields */}</div>;
  };
  
  // 结论:useReducer更容易避免多余渲染
  return (
    <div>
      <UseStateVersion />
      <UseReducerVersion />
    </div>
  );
}

// 性能测试3: 批量更新
function BatchUpdatePerformance() {
  // useState版本
  const UseStateVersion = () => {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [count3, setCount3] = useState(0);
    const renderCount = useRef(0);
    renderCount.current++;
    
    const incrementAll = () => {
      // React 18+会自动批处理
      setCount1(c => c + 1);
      setCount2(c => c + 1);
      setCount3(c => c + 1);
      // 只触发一次渲染
    };
    
    console.log('useState批量更新渲染次数:', renderCount.current);
    
    return (
      <button onClick={incrementAll}>
        {count1} + {count2} + {count3}
      </button>
    );
  };
  
  // useReducer版本
  const UseReducerVersion = () => {
    const reducer = (state, action) => {
      switch (action.type) {
        case 'INCREMENT_ALL':
          return {
            count1: state.count1 + 1,
            count2: state.count2 + 1,
            count3: state.count3 + 1
          };
        default:
          return state;
      }
    };
    
    const [state, dispatch] = useReducer(reducer, {
      count1: 0,
      count2: 0,
      count3: 0
    });
    const renderCount = useRef(0);
    renderCount.current++;
    
    const incrementAll = () => {
      dispatch({ type: 'INCREMENT_ALL' });
      // 一次dispatch,一次渲染
    };
    
    console.log('useReducer批量更新渲染次数:', renderCount.current);
    
    return (
      <button onClick={incrementAll}>
        {state.count1} + {state.count2} + {state.count3}
      </button>
    );
  };
  
  // 结论:
  // React 18+: useState自动批处理,性能相当
  // React 17-: useReducer性能更好
  return (
    <div>
      <UseStateVersion />
      <UseReducerVersion />
    </div>
  );
}
```

### 3.2 内存占用对比

```jsx
// 内存测试1: 简单状态
function SimpleStateMemory() {
  // useState: 每个状态独立存储
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  // 内存: 3个独立的state + 3个setter函数
  
  // useReducer: 统一存储
  const [state, dispatch] = useReducer(reducer, { a: 0, b: 0, c: 0 });
  // 内存: 1个state对象 + 1个dispatch函数
  
  // 结论:useReducer内存占用更少
}

// 内存测试2: 复杂状态
function ComplexStateMemory() {
  // useState: 大量状态hook
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  // ... 假设有20个字段
  const [field20, setField20] = useState('');
  // 内存: 20个state + 20个setter = 40个函数引用
  
  // useReducer: 单一reducer
  const [state, dispatch] = useReducer(reducer, {
    field1: '',
    field2: '',
    // ...
    field20: ''
  });
  // 内存: 1个state对象 + 1个dispatch函数 + 1个reducer函数
  
  // 结论:状态越多,useReducer内存优势越明显
}
```

### 3.3 代码大小对比

```jsx
// 代码大小测试
function CodeSizeComparison() {
  // useState版本: 总代码量约100行
  function UseStateVersion() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
      // 验证逻辑
      if (!e.target.value) {
        setUsernameError('用户名不能为空');
      } else {
        setUsernameError('');
      }
    };
    
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
      // 验证逻辑
      if (!e.target.value.includes('@')) {
        setEmailError('邮箱格式不正确');
      } else {
        setEmailError('');
      }
    };
    
    // ... 更多处理函数
    
    return <form>{/* fields */}</form>;
  }
  
  // useReducer版本: 总代码量约80行
  function UseReducerVersion() {
    const initialState = {
      fields: { username: '', email: '', password: '' },
      errors: {}
    };
    
    const reducer = (state, action) => {
      switch (action.type) {
        case 'SET_FIELD':
          const { name, value } = action.payload;
          const error = validate(name, value);
          
          return {
            ...state,
            fields: { ...state.fields, [name]: value },
            errors: error
              ? { ...state.errors, [name]: error }
              : { ...state.errors, [name]: undefined }
          };
        
        default:
          return state;
      }
    };
    
    const [state, dispatch] = useReducer(reducer, initialState);
    
    const handleChange = (e) => {
      dispatch({
        type: 'SET_FIELD',
        payload: { name: e.target.name, value: e.target.value }
      });
    };
    
    return <form>{/* fields with handleChange */}</form>;
  }
  
  // 结论:复杂状态时,useReducer代码更简洁
}
```

## 第四部分:迁移策略

### 4.1 渐进式迁移

```jsx
// 步骤1: 识别需要迁移的状态
// 原useState版本
function OriginalComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await api.login(credentials);
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return <div>{/* UI */}</div>;
}

// 步骤2: 定义Action Types
const ActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT'
};

// 步骤3: 编写Reducer
function authReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ActionTypes.LOGIN_SUCCESS:
      return {
        user: action.payload,
        loading: false,
        error: null
      };
    
    case ActionTypes.LOGIN_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ActionTypes.LOGOUT:
      return {
        user: null,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}

// 步骤4: 迁移到useReducer
function MigratedComponent() {
  const initialState = {
    user: null,
    loading: false,
    error: null
  };
  
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const login = async (credentials) => {
    dispatch({ type: ActionTypes.LOGIN_START });
    
    try {
      const userData = await api.login(credentials);
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: userData
      });
    } catch (err) {
      dispatch({
        type: ActionTypes.LOGIN_ERROR,
        payload: err.message
      });
    }
  };
  
  const logout = () => {
    dispatch({ type: ActionTypes.LOGOUT });
  };
  
  return <div>{/* UI */}</div>;
}

// 步骤5: 创建Action Creators(可选)
const Actions = {
  loginStart: () => ({ type: ActionTypes.LOGIN_START }),
  
  loginSuccess: (user) => ({
    type: ActionTypes.LOGIN_SUCCESS,
    payload: user
  }),
  
  loginError: (error) => ({
    type: ActionTypes.LOGIN_ERROR,
    payload: error
  }),
  
  logout: () => ({ type: ActionTypes.LOGOUT })
};

// 步骤6: 使用Action Creators
function FinalComponent() {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const login = async (credentials) => {
    dispatch(Actions.loginStart());
    
    try {
      const userData = await api.login(credentials);
      dispatch(Actions.loginSuccess(userData));
    } catch (err) {
      dispatch(Actions.loginError(err.message));
    }
  };
  
  const logout = () => {
    dispatch(Actions.logout());
  };
  
  return <div>{/* UI */}</div>;
}
```

### 4.2 混合使用策略

```jsx
// 策略: 部分useState + 部分useReducer
function HybridComponent() {
  // 简单状态用useState
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('home');
  
  // 复杂状态用useReducer
  const formReducer = (state, action) => {
    switch (action.type) {
      case 'SET_FIELD':
        return {
          ...state,
          fields: { ...state.fields, [action.name]: action.value }
        };
      case 'VALIDATE':
        return {
          ...state,
          errors: validateForm(state.fields)
        };
      default:
        return state;
    }
  };
  
  const [formState, formDispatch] = useReducer(formReducer, {
    fields: {},
    errors: {}
  });
  
  // 根据场景选择合适的方式
  return (
    <div>
      {/* 简单UI状态用useState */}
      <Tabs active={tab} onChange={setTab} />
      
      {/* 复杂表单状态用useReducer */}
      <Form state={formState} dispatch={formDispatch} />
    </div>
  );
}

// 混合策略的优势:
/*
1. 保持简单状态的简洁性
2. 复杂状态获得更好的管理
3. 渐进式迁移,风险小
4. 团队学习成本低
*/
```

## 第五部分:决策指南

### 5.1 决策流程图

```jsx
// 状态管理决策指南
function StateManagementDecision() {
  /*
  决策流程:
  
  1. 是否是简单的布尔值、数字、字符串?
     是 → useState
     否 → 继续
  
  2. 状态是否独立,不与其他状态相关?
     是 → useState
     否 → 继续
  
  3. 状态更新逻辑是否简单(1-2行代码)?
     是 → useState
     否 → 继续
  
  4. 是否有3个以上相关的状态?
     是 → useReducer
     否 → 继续
  
  5. 状态更新是否涉及复杂计算或依赖?
     是 → useReducer
     否 → useState
  
  6. 是否需要状态历史或撤销功能?
     是 → useReducer
     否 → useState
  
  7. 团队是否熟悉Redux模式?
     是 → useReducer
     否 → useState
  */
  
  return null;
}
```

### 5.2 实际案例决策

```jsx
// 案例1: 模态框状态
// 决策: useState
function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  // 简单布尔值,使用useState
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开</button>
      {isOpen && <div>模态框内容</div>}
    </div>
  );
}

// 案例2: 表单验证
// 决策: useReducer
function ValidatedForm() {
  const initialState = {
    fields: {},
    errors: {},
    touched: {},
    submitting: false
  };
  
  const reducer = (state, action) => {
    // 复杂的状态逻辑
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  // 多个相关状态,复杂验证逻辑,使用useReducer
  
  return <form>{/* fields */}</form>;
}

// 案例3: 计数器
// 决策: useState
function Counter() {
  const [count, setCount] = useState(0);
  // 简单数字,使用useState
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  );
}

// 案例4: 数据表格
// 决策: useReducer
function DataTable() {
  const initialState = {
    data: [],
    sortBy: null,
    sortOrder: 'asc',
    filters: {},
    page: 1,
    pageSize: 10,
    selectedRows: []
  };
  
  const reducer = (state, action) => {
    // 复杂的表格状态管理
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  // 多个相关状态,复杂交互,使用useReducer
  
  return <table>{/* rows */}</table>;
}

// 案例5: 主题切换
// 决策: useState或useReducer都可以
function ThemeSwitcher() {
  // 简单场景:useState
  const [theme, setTheme] = useState('light');
  
  // 复杂场景(带配置):useReducer
  const themeReducer = (state, action) => {
    switch (action.type) {
      case 'SET_THEME':
        return {
          ...state,
          theme: action.payload,
          colors: getThemeColors(action.payload)
        };
      default:
        return state;
    }
  };
  
  const [themeState, dispatch] = useReducer(themeReducer, {
    theme: 'light',
    colors: {}
  });
  
  // 根据复杂度选择
  return <div>{/* theme UI */}</div>;
}
```

### 5.3 性能考虑

```jsx
// 性能优化建议
function PerformanceConsiderations() {
  // 建议1: 避免过度优化
  // ❌ 不好:为简单状态使用useReducer
  const reducer = (state, action) => {
    switch (action.type) {
      case 'toggle':
        return !state;
      default:
        return state;
    }
  };
  
  const [isOpen, dispatch] = useReducer(reducer, false);
  // 过度复杂,应该用useState
  
  // ✅ 好:简单状态用useState
  const [isOpen, setIsOpen] = useState(false);
  
  // 建议2: 状态拆分
  // ❌ 不好:一个大对象包含所有状态
  const [state, setState] = useState({
    ui: { isOpen: false, tab: 'home' },
    data: { items: [], filter: 'all' },
    user: { name: '', email: '' }
  });
  // 任何小改动都会触发整个对象更新
  
  // ✅ 好:按功能拆分
  const [ui, setUI] = useState({ isOpen: false, tab: 'home' });
  const [data, setData] = useState({ items: [], filter: 'all' });
  const [user, setUser] = useState({ name: '', email: '' });
  // 或使用useReducer分别管理
  
  // 建议3: 合理使用useCallback
  const reducer = (state, action) => {
    // reducer逻辑
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // dispatch已经是稳定的,不需要useCallback
  const handleClick = () => {
    dispatch({ type: 'INCREMENT' });
  };
  // handleClick每次都是新函数,但dispatch是稳定的
  
  // 如果需要传递给子组件,才使用useCallback
  const handleClickMemo = useCallback(() => {
    dispatch({ type: 'INCREMENT' });
  }, []);
  
  return null;
}
```

## 第六部分:TypeScript支持对比

### 6.1 类型定义对比

```typescript
import { useState, useReducer, Reducer } from 'react';

// useState类型定义
function UseStateTypes() {
  // 自动推断
  const [count, setCount] = useState(0);  // number
  const [name, setName] = useState('');   // string
  
  // 显式类型
  const [user, setUser] = useState<User | null>(null);
  
  // 联合类型
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  return null;
}

// useReducer类型定义
interface State {
  count: number;
  text: string;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setText'; payload: string };

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'decrement':
      return { ...state, count: state.count - 1 };
    case 'setText':
      return { ...state, text: action.payload };
    default:
      return state;
  }
};

function UseReducerTypes() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    text: ''
  });
  
  // dispatch有完整的类型检查
  dispatch({ type: 'increment' });  // ✅
  dispatch({ type: 'setText', payload: 'hello' });  // ✅
  // dispatch({ type: 'invalid' });  // ❌ 类型错误
  
  return null;
}

// 类型安全对比:
/*
useState:
- 类型推断简单
- 联合类型需要显式定义
- setState类型自动

useReducer:
- 需要定义State和Action类型
- 更严格的类型检查
- dispatch类型安全
- 适合复杂类型系统
*/
```

### 6.2 复杂类型对比

```typescript
// useState复杂类型
interface FormState {
  fields: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

function UseStateComplexTypes() {
  const [form, setForm] = useState<FormState>({
    fields: {},
    errors: {},
    touched: {}
  });
  
  // 更新时需要手动保证类型正确
  const updateField = (name: string, value: string) => {
    setForm({
      ...form,
      fields: { ...form.fields, [name]: value },
      touched: { ...form.touched, [name]: true }
    });
  };
  
  return null;
}

// useReducer复杂类型
interface FormState {
  fields: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

type FormAction =
  | { type: 'SET_FIELD'; payload: { name: string; value: string } }
  | { type: 'SET_ERROR'; payload: { name: string; error: string } }
  | { type: 'RESET' };

const formReducer: Reducer<FormState, FormAction> = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        fields: { ...state.fields, [action.payload.name]: action.payload.value },
        touched: { ...state.touched, [action.payload.name]: true }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.name]: action.payload.error }
      };
    
    case 'RESET':
      return { fields: {}, errors: {}, touched: {} };
    
    default:
      return state;
  }
};

function UseReducerComplexTypes() {
  const [state, dispatch] = useReducer(formReducer, {
    fields: {},
    errors: {},
    touched: {}
  });
  
  // 类型安全的dispatch
  const updateField = (name: string, value: string) => {
    dispatch({
      type: 'SET_FIELD',
      payload: { name, value }
    });
  };
  
  return null;
}

// 结论:
// useReducer在复杂类型系统中类型安全性更好
```

## 第七部分:最佳实践总结

### 7.1 选择清单

```jsx
/*
选择useState的场景:
□ 简单的独立状态(布尔值、数字、字符串)
□ 临时UI状态(模态框、下拉菜单)
□ 表单的单个字段
□ 状态更新逻辑简单(1-2行)
□ 不超过3个相关状态
□ 团队不熟悉Redux模式
□ 快速原型开发

选择useReducer的场景:
□ 复杂的对象或数组状态
□ 3个以上相关状态
□ 状态转换逻辑复杂
□ 需要状态历史/撤销重做
□ 状态更新依赖前一个状态
□ 需要在多处复用状态逻辑
□ 团队熟悉Redux模式
□ 需要更好的可测试性
*/
```

### 7.2 反模式警告

```jsx
// 反模式1: 过度使用useReducer
// ❌ 不好
const toggleReducer = (state, action) => {
  switch (action.type) {
    case 'toggle':
      return !state;
    default:
      return state;
  }
};

const [isOpen, dispatch] = useReducer(toggleReducer, false);

// ✅ 好
const [isOpen, setIsOpen] = useState(false);

// 反模式2: useState地狱
// ❌ 不好
const [field1, setField1] = useState('');
const [field2, setField2] = useState('');
// ... 10+ useState

// ✅ 好
const [state, dispatch] = useReducer(reducer, initialState);

// 反模式3: 混合过度
// ❌ 不好:同一功能混用
const [name, setName] = useState('');
const [formState, dispatch] = useReducer(formReducer, {
  email: '',
  password: ''
});
// name应该也放在formState中

// ✅ 好:统一管理
const [formState, dispatch] = useReducer(formReducer, {
  name: '',
  email: '',
  password: ''
});
```

### 7.3 迁移时机

```jsx
/*
从useState迁移到useReducer的信号:

1. 代码味道:
   - 大量相关的useState调用(>5个)
   - 复杂的setState嵌套
   - 状态更新逻辑分散在多处
   - 频繁的...spread操作符

2. 功能需求:
   - 需要添加撤销/重做
   - 需要状态持久化
   - 需要状态调试工具
   - 需要状态中间件

3. 团队因素:
   - 团队熟悉Redux
   - 需要更好的可维护性
   - 需要更严格的类型检查
   - 需要更好的测试覆盖

4. 性能问题:
   - 发现过多的重新渲染
   - 状态更新导致性能下降
   - 需要更精细的更新控制
*/
```

## 练习题

### 基础练习

1. 用useState实现一个计数器,然后迁移到useReducer
2. 对比两种方式实现Toggle组件
3. 分析什么情况下应该选择useReducer

### 进阶练习

1. 实现一个表单,对比useState和useReducer的代码量
2. 测试两种方式的性能差异
3. 设计一个决策流程图指导选择

### 高级练习

1. 实现一个复杂组件,混合使用两种方式
2. 创建TypeScript类型系统对比两者
3. 实现从useState到useReducer的自动化迁移工具
4. 分析真实项目中的状态管理选择

### 实战项目

1. 重构现有项目中的useState为useReducer
2. 建立团队的状态管理决策指南
3. 创建性能测试套件对比两者
4. 实现状态管理最佳实践检查工具

通过本章学习,你已经全面理解了useState和useReducer的区别、适用场景和选择策略。正确选择状态管理方式能显著提升代码质量和可维护性,是React开发中的重要技能。
