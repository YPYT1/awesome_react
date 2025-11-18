# State更新规则

## 学习目标

通过本章学习，你将深入理解：

- State更新的机制和原理
- 同步vs异步更新
- 批量更新的规则
- 函数式更新的重要性
- State更新的时机
- React 19的自动批处理
- 性能优化策略

## 第一部分：State更新机制

### 1.1 State更新的基本原理

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    console.log('Before:', count);  // 0
    setCount(1);
    console.log('After:', count);   // 仍然是0（还未更新）
  };
  
  // State更新流程：
  // 1. 调用setCount(1)
  // 2. React将更新加入队列
  // 3. 当前函数执行完毕
  // 4. React开始处理更新队列
  // 5. 重新渲染组件
  // 6. count变为1
  
  return <button onClick={handleClick}>{count}</button>;
}
```

#### State更新是异步的

```jsx
function AsyncUpdate() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count);  // 0（旧值）
    
    setCount(count + 1);
    console.log(count);  // 仍然是0
    
    setCount(count + 1);
    console.log(count);  // 仍然是0
    
    // 三次都使用count=0，所以最终结果是1
  };
  
  // 点击后count变为1，不是3
  return <button onClick={handleClick}>{count}</button>;
}
```

### 1.2 直接更新vs函数式更新

#### 直接更新的问题

```jsx
function DirectUpdate() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    // 三次更新都使用相同的count值
    setCount(count + 1);  // 0 + 1 = 1
    setCount(count + 1);  // 0 + 1 = 1
    setCount(count + 1);  // 0 + 1 = 1
    // 最终：count = 1
  };
  
  return <button onClick={increment}>{count}</button>;
}
```

#### 函数式更新的优势

```jsx
function FunctionalUpdate() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    // 每次更新都基于前一个值
    setCount(prev => prev + 1);  // 0 + 1 = 1
    setCount(prev => prev + 1);  // 1 + 1 = 2
    setCount(prev => prev + 1);  // 2 + 1 = 3
    // 最终：count = 3
  };
  
  return <button onClick={increment}>{count}</button>;
}

// 实际应用
function ToggleButton() {
  const [isOn, setIsOn] = useState(false);
  
  // 推荐：使用函数式更新
  const toggle = () => {
    setIsOn(prev => !prev);  // 基于当前值切换
  };
  
  return <button onClick={toggle}>{isOn ? '开' : '关'}</button>;
}
```

#### 何时使用函数式更新

```jsx
// 规则：如果新值依赖于旧值，使用函数式更新

// 场景1：计数器
const [count, setCount] = useState(0);
setCount(prev => prev + 1);  // 使用函数式

// 场景2：切换布尔值
const [flag, setFlag] = useState(false);
setFlag(prev => !prev);  // 使用函数式

// 场景3：数组操作
const [items, setItems] = useState([]);
setItems(prev => [...prev, newItem]);  // 使用函数式

// 场景4：不依赖旧值
const [name, setName] = useState('');
setName('Alice');  // 直接更新即可

const [status, setStatus] = useState('idle');
setStatus('loading');  // 直接更新即可
```

### 1.3 State更新队列

```jsx
function UpdateQueue() {
  const [count, setCount] = useState(0);
  
  const complexUpdate = () => {
    // React会将这些更新加入队列
    setCount(count + 1);        // 队列：[count + 1]
    setCount(count + 1);        // 队列：[count + 1, count + 1]
    setCount(prev => prev + 1); // 队列：[count + 1, count + 1, prev => prev + 1]
    
    // 处理队列：
    // 1. count + 1 => 0 + 1 = 1
    // 2. count + 1 => 0 + 1 = 1（覆盖）
    // 3. prev => prev + 1 => 1 + 1 = 2
    // 最终：count = 2
  };
  
  return <button onClick={complexUpdate}>{count}</button>;
}

// 更新队列的执行规则
function QueueRules() {
  const [state, setState] = useState(0);
  
  const demo = () => {
    setState(state + 1);           // 替换为1
    setState(state + 1);           // 替换为1
    setState(prev => prev + 1);    // 基于上一个结果：1 + 1 = 2
    setState(42);                  // 替换为42
    setState(prev => prev + 1);    // 基于上一个结果：42 + 1 = 43
    // 最终：state = 43
  };
  
  return <button onClick={demo}>{state}</button>;
}
```

## 第二部分：批量更新

### 2.1 自动批处理（React 18+）

```jsx
function AutomaticBatching() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  console.log('渲染');  // 记录渲染次数
  
  // 事件处理器中（React 17也会批处理）
  const handleSync = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 只渲染一次
  };
  
  // 异步回调中（React 18+自动批处理）
  const handleAsync = () => {
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // React 18+：只渲染一次
      // React 17：渲染两次
    }, 0);
  };
  
  // Promise中
  const handlePromise = () => {
    fetch('/api').then(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // React 18+：只渲染一次
    });
  };
  
  // 原生事件中
  useEffect(() => {
    const button = document.getElementById('native-btn');
    button?.addEventListener('click', () => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // React 18+：只渲染一次
    });
  }, []);
  
  return (
    <div>
      <p>Count: {count}, Flag: {String(flag)}</p>
      <button onClick={handleSync}>同步</button>
      <button onClick={handleAsync}>异步</button>
      <button onClick={handlePromise}>Promise</button>
      <button id="native-btn">原生事件</button>
    </div>
  );
}
```

### 2.2 flushSync：强制同步更新

```jsx
import { useState } from 'react';
import { flushSync } from 'react-dom';

function FlushSyncExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  const handleClick = () => {
    // 正常批处理
    setCount(c => c + 1);
    setFlag(f => !f);
    // 批量更新，只渲染一次
    
    console.log(count);  // 旧值
  };
  
  const handleClickFlush = () => {
    flushSync(() => {
      setCount(c => c + 1);  // 立即更新
    });
    
    console.log(count);  // 仍是旧值（在同一次渲染中）
    
    flushSync(() => {
      setFlag(f => !f);  // 立即更新
    });
    
    // 触发两次渲染
  };
  
  return (
    <div>
      <p>Count: {count}, Flag: {String(flag)}</p>
      <button onClick={handleClick}>批量更新</button>
      <button onClick={handleClickFlush}>强制同步</button>
    </div>
  );
}

// flushSync的使用场景
function ScrollToBottom() {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  
  const addMessage = (text) => {
    flushSync(() => {
      setMessages([...messages, text]);
    });
    
    // DOM已更新，可以安全滚动
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
      <div ref={scrollRef} />
      <button onClick={() => addMessage('New Message')}>
        添加消息
      </button>
    </div>
  );
}
```

### 2.3 批处理的边界

```jsx
function BatchingBoundaries() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 同一个事件处理器中：批处理
  const handleClick = () => {
    setCount(c => c + 1);
    setText('updated');
    // 只渲染一次
  };
  
  // 分开的事件处理器：不批处理
  const handleSeparate1 = () => {
    setCount(c => c + 1);  // 渲染一次
  };
  
  const handleSeparate2 = () => {
    setText('updated');  // 再渲染一次
  };
  
  // 链式调用：批处理
  const handleChain = () => {
    setCount(c => c + 1);
    otherFunction();
  };
  
  function otherFunction() {
    setText('updated');
    // 仍在同一个事件循环，会批处理
  }
  
  return <div>{/* ... */}</div>;
}
```

## 第三部分：State更新时机

### 3.1 更新的生命周期

```jsx
function UpdateLifecycle() {
  const [count, setCount] = useState(0);
  const renderCountRef = useRef(0);
  
  console.log('1. 渲染阶段', count);
  
  renderCountRef.current++;
  
  useEffect(() => {
    console.log('3. Effect阶段', count);
  });
  
  useLayoutEffect(() => {
    console.log('2. Layout Effect阶段', count);
  });
  
  const handleClick = () => {
    console.log('A. 点击事件', count);
    
    setCount(count + 1);
    
    console.log('B. setState后立即', count);  // 旧值
    
    setTimeout(() => {
      console.log('C. Timeout中', count);  // 旧值（闭包）
    }, 0);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>渲染次数: {renderCountRef.current}</p>
      <button onClick={handleClick}>Update</button>
    </div>
  );
}

// 执行顺序：
// A. 点击事件 0
// B. setState后立即 0
// 1. 渲染阶段 1
// 2. Layout Effect阶段 1
// 3. Effect阶段 1
// C. Timeout中 0
```

### 3.2 闭包陷阱

```jsx
function ClosureTrap() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setTimeout(() => {
      // 错误：使用闭包中的旧值
      setCount(count + 1);
    }, 3000);
  };
  
  // 点击3次（快速连续点击）
  // 3秒后count只变为1，不是3
  
  return <button onClick={handleClick}>{count}</button>;
}

// 解决方案1：函数式更新
function ClosureFix1() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setTimeout(() => {
      setCount(prev => prev + 1);  // 使用最新值
    }, 3000);
  };
  
  // 点击3次，3秒后count变为3
  
  return <button onClick={handleClick}>{count}</button>;
}

// 解决方案2：使用ref
function ClosureFix2() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const handleClick = () => {
    setTimeout(() => {
      setCount(countRef.current + 1);  // 使用ref中的最新值
    }, 3000);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}
```

### 3.3 State更新的合并

```jsx
// 对象State的合并
function ObjectMerge() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  });
  
  // 错误：只设置一个属性（其他属性丢失）
  const updateWrong = () => {
    setUser({ age: 26 });
    // user变为 { age: 26 }
    // name和email丢失！
  };
  
  // 正确：展开旧值，再覆盖
  const updateRight = () => {
    setUser({
      ...user,
      age: 26
    });
    // user变为 { name: 'Alice', age: 26, email: 'alice@example.com' }
  };
  
  // 函数式更新
  const updateFunctional = () => {
    setUser(prev => ({
      ...prev,
      age: 26
    }));
  };
  
  return <div>{user.name}, {user.age}</div>;
}

// 类组件的setState会自动合并（浅合并）
class ClassComponent extends Component {
  state = {
    name: 'Alice',
    age: 25
  };
  
  updateAge = () => {
    this.setState({ age: 26 });  // 自动合并
    // state仍然保留name
  };
  
  render() {
    return <div>{this.state.name}, {this.state.age}</div>;
  }
}
```

## 第四部分：React 19的批处理增强

### 4.1 自动批处理的范围

```jsx
// React 19自动批处理所有场景
function React19Batching() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  console.log('渲染');
  
  // 1. 事件处理器（React 17也支持）
  const handleClick = () => {
    setCount(c => c + 1);
    setText('clicked');
    // 批处理，只渲染一次
  };
  
  // 2. setTimeout（React 19新增）
  const handleTimeout = () => {
    setTimeout(() => {
      setCount(c => c + 1);
      setText('timeout');
      // 批处理，只渲染一次
    }, 100);
  };
  
  // 3. Promise（React 19新增）
  const handlePromise = () => {
    Promise.resolve().then(() => {
      setCount(c => c + 1);
      setText('promise');
      // 批处理，只渲染一次
    });
  };
  
  // 4. fetch（React 19新增）
  const handleFetch = async () => {
    const data = await fetch('/api');
    setCount(c => c + 1);
    setText('fetched');
    // 批处理，只渲染一次
  };
  
  // 5. 原生事件（React 19新增）
  useEffect(() => {
    const handleNative = () => {
      setCount(c => c + 1);
      setText('native');
      // 批处理，只渲染一次
    };
    
    document.addEventListener('custom-event', handleNative);
    return () => document.removeEventListener('custom-event', handleNative);
  }, []);
  
  return (
    <div>
      <p>Count: {count}, Text: {text}</p>
      <button onClick={handleClick}>事件</button>
      <button onClick={handleTimeout}>Timeout</button>
      <button onClick={handlePromise}>Promise</button>
      <button onClick={handleFetch}>Fetch</button>
    </div>
  );
}
```

### 4.2 批处理的性能优势

```jsx
function PerformanceComparison() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [flag, setFlag] = useState(false);
  const renderCount = useRef(0);
  
  renderCount.current++;
  
  // React 17：可能渲染3次
  // React 19：只渲染1次
  const handleUpdate = async () => {
    const data = await fetch('/api').then(r => r.json());
    
    setCount(data.count);
    setText(data.text);
    setFlag(data.flag);
    
    // React 19自动批处理
  };
  
  return (
    <div>
      <p>渲染次数: {renderCount.current}</p>
      <p>Count: {count}</p>
      <p>Text: {text}</p>
      <p>Flag: {String(flag)}</p>
      <button onClick={handleUpdate}>更新</button>
    </div>
  );
}
```

## 第五部分：State更新的性能优化

### 5.1 避免不必要的更新

```jsx
// 问题：频繁的State更新
function FrequentUpdates() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // 鼠标移动触发大量更新
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
}

// 优化1：节流
import { throttle } from 'lodash';

function ThrottledUpdates() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = throttle((e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    }, 100);  // 每100ms最多更新一次
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      handleMouseMove.cancel();
    };
  }, []);
  
  return <div>X: {position.x}, Y: {position.y}</div>;
}

// 优化2：防抖
import { debounce } from 'lodash';

function DebouncedUpdates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  // 防抖的搜索函数
  const debouncedSearch = useMemo(
    () => debounce(async (term) => {
      const data = await api.search(term);
      setResults(data);
    }, 300),
    []
  );
  
  const handleChange = (e) => {
    setSearchTerm(e.target.value);  // 立即更新输入框
    debouncedSearch(e.target.value);  // 防抖搜索
  };
  
  return (
    <div>
      <input value={searchTerm} onChange={handleChange} />
      <ul>
        {results.map(r => <li key={r.id}>{r.name}</li>)}
      </ul>
    </div>
  );
}
```

### 5.2 条件更新

```jsx
function ConditionalUpdate() {
  const [data, setData] = useState(null);
  
  const updateData = (newData) => {
    // 只在数据真正变化时更新
    setData(prev => {
      // 浅比较
      if (JSON.stringify(prev) === JSON.stringify(newData)) {
        return prev;  // 返回旧值，不触发更新
      }
      return newData;
    });
  };
  
  // 深度比较
  const updateDataDeep = (newData) => {
    setData(prev => {
      if (deepEqual(prev, newData)) {
        return prev;
      }
      return newData;
    });
  };
  
  return <div>{/* ... */}</div>;
}

// 实现简单的深度比较
function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}
```

### 5.3 使用useMemo优化计算

```jsx
function ExpensiveCalculation({ items }) {
  const [filter, setFilter] = useState('all');
  
  // 不好：每次渲染都计算
  const filteredItems = items.filter(item => {
    if (filter === 'completed') return item.completed;
    if (filter === 'active') return !item.completed;
    return true;
  });
  
  // 好：使用useMemo缓存结果
  const filteredItemsMemo = useMemo(() => {
    return items.filter(item => {
      if (filter === 'completed') return item.completed;
      if (filter === 'active') return !item.completed;
      return true;
    });
  }, [items, filter]);  // 只在依赖变化时重新计算
  
  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">全部</option>
        <option value="active">进行中</option>
        <option value="completed">已完成</option>
      </select>
      
      <ul>
        {filteredItemsMemo.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 第六部分：State更新的常见陷阱

### 6.1 在渲染期间更新State

```jsx
// 错误：在渲染期间直接更新State
function RenderUpdate() {
  const [count, setCount] = useState(0);
  
  // 错误！无限循环
  // setCount(count + 1);
  
  // 错误！条件更新也会导致问题
  // if (count < 10) {
  //   setCount(count + 1);
  // }
  
  return <div>{count}</div>;
}

// 正确：在事件处理器或Effect中更新
function CorrectUpdate() {
  const [count, setCount] = useState(0);
  
  // 在Effect中更新
  useEffect(() => {
    if (count < 10) {
      const timer = setTimeout(() => {
        setCount(c => c + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [count]);
  
  return <div>{count}</div>;
}
```

### 6.2 依赖闭包的State

```jsx
function ClosureDependency() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // 错误：count是闭包值，永远是0
      setCount(count + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);  // 空依赖
  
  // count只会变成1，然后停止更新
  
  return <div>{count}</div>;
}

// 解决方案1：添加依赖
function Fix1() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [count]);  // 添加count依赖
  
  // 但这样每次count变化都会重建interval
  
  return <div>{count}</div>;
}

// 解决方案2：函数式更新（最佳）
function Fix2() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);  // 不依赖外部变量
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);  // 空依赖即可
  
  return <div>{count}</div>;
}
```

### 6.3 竞态条件

```jsx
// 问题：快速切换导致数据错乱
function RaceCondition({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser);
    
    // 问题：
    // 1. 用户ID从1切换到2
    // 2. 请求1开始
    // 3. 请求2开始
    // 4. 请求2完成，设置user为用户2
    // 5. 请求1完成，设置user为用户1（错误！）
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// 解决方案1：使用cleanup取消请求
function Fix1({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`/api/users/${userId}`, {
      signal: controller.signal
    })
      .then(r => r.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => controller.abort();  // 取消旧请求
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// 解决方案2：使用标志位
function Fix2({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let ignore = false;
    
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!ignore) {  // 只有最新的请求才更新
          setUser(data);
        }
      });
    
    return () => {
      ignore = true;
    };
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// React 19：使用use() Hook（最佳）
import { use, Suspense } from 'react';

function Fix3({ userId }) {
  const user = use(fetchUser(userId));
  // 自动处理竞态条件
  
  return <div>{user.name}</div>;
}

// 包裹在Suspense中
<Suspense fallback={<Loading />}>
  <Fix3 userId={userId} />
</Suspense>
```

## 第七部分：State更新模式

### 7.1 累加器模式

```jsx
function Accumulator() {
  const [sum, setSum] = useState(0);
  
  const addValues = (values) => {
    // 累加多个值
    values.forEach(value => {
      setSum(prev => prev + value);
    });
  };
  
  const addAsync = async (values) => {
    for (const value of values) {
      await delay(100);
      setSum(prev => prev + value);
    }
  };
  
  return (
    <div>
      <p>Sum: {sum}</p>
      <button onClick={() => addValues([1, 2, 3, 4, 5])}>
        加1+2+3+4+5
      </button>
      <button onClick={() => addAsync([10, 20, 30])}>
        异步累加
      </button>
    </div>
  );
}
```

### 7.2 切换模式

```jsx
function TogglePattern() {
  const [mode, setMode] = useState('view');
  
  const cycleMode = () => {
    setMode(prev => {
      const modes = ['view', 'edit', 'preview'];
      const currentIndex = modes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % modes.length;
      return modes[nextIndex];
    });
  };
  
  return (
    <div>
      <p>当前模式: {mode}</p>
      <button onClick={cycleMode}>切换模式</button>
      
      {mode === 'view' && <ViewMode />}
      {mode === 'edit' && <EditMode />}
      {mode === 'preview' && <PreviewMode />}
    </div>
  );
}
```

### 7.3 重置模式

```jsx
function ResetPattern() {
  const initialState = {
    name: '',
    email: '',
    age: 0
  };
  
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleReset = () => {
    setFormData(initialState);  // 重置为初始值
  };
  
  const handleClear = () => {
    setFormData({});  // 清空
  };
  
  return (
    <div>
      <input
        value={formData.name || ''}
        onChange={e => handleChange('name', e.target.value)}
      />
      <button onClick={handleReset}>重置</button>
      <button onClick={handleClear}>清空</button>
    </div>
  );
}
```

### 7.4 撤销/重做模式

```jsx
function UndoRedo() {
  const [history, setHistory] = useState([0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const current = history[currentIndex];
  
  const setValue = (newValue) => {
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newValue]);
    setCurrentIndex(newHistory.length);
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
  
  return (
    <div>
      <p>当前值: {current}</p>
      <button onClick={() => setValue(current + 1)}>+1</button>
      <button onClick={() => setValue(current - 1)}>-1</button>
      <button onClick={undo} disabled={!canUndo}>撤销</button>
      <button onClick={redo} disabled={!canRedo}>重做</button>
    </div>
  );
}
```

## 第八部分：最佳实践总结

### 8.1 State更新规则清单

```jsx
// 1. 永远使用setState，不要直接修改State
const [count, setCount] = useState(0);
// 错误
count = 1;
// 正确
setCount(1);

// 2. State更新是异步的
setCount(1);
console.log(count);  // 旧值

// 3. 依赖旧值时使用函数式更新
setCount(count + 1);  // 不好
setCount(prev => prev + 1);  // 好

// 4. 对象和数组要创建新副本
setUser({ ...user, age: 26 });
setItems([...items, newItem]);

// 5. 多次更新会被批处理
setCount(1);
setFlag(true);
// 只触发一次渲染

// 6. 避免在渲染期间更新State
// 使用useEffect或事件处理器

// 7. 使用合适的数据结构
// 扁平化、规范化

// 8. 最小化State
// 能计算的不要存储
```

### 8.2 性能优化清单

```jsx
// 1. 避免频繁更新
// 使用节流/防抖

// 2. 合理拆分State
// 不相关的State分开定义

// 3. 使用useMemo缓存计算
const value = useMemo(() => expensive(data), [data]);

// 4. 使用useCallback缓存函数
const handler = useCallback(() => {}, []);

// 5. 条件更新避免无效渲染
setData(prev => changed(prev) ? newData : prev);

// 6. 使用React.memo包装组件
const Memoized = React.memo(Component);

// 7. 利用React 19自动批处理
// 无需手动优化

// 8. 使用useTransition处理低优先级更新
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setLargeData(newData);
});
```

## 练习题

### 基础练习

1. 实现一个计数器，支持加减和重置
2. 创建一个输入框组件，使用State管理值
3. 对比直接更新和函数式更新的区别

### 进阶练习

1. 实现一个撤销/重做功能
2. 创建一个防抖搜索组件
3. 处理异步请求的竞态条件

### 高级练习

1. 实现一个复杂表单的State管理
2. 优化一个频繁更新的组件
3. 使用React 19的新特性优化State更新

通过本章学习，你已经深入理解了State的更新规则和机制。掌握这些知识能让你编写出更高效、更可靠的React应用。继续学习，成为State管理大师！

