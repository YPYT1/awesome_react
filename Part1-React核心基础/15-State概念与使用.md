# State概念与使用

## 学习目标

通过本章学习，你将掌握：

- State的概念和作用
- useState Hook的完整用法
- State与Props的区别
- 函数式更新与惰性初始化
- 多个State的管理策略
- State的最佳实践
- React 19中State的新特性

## 第一部分：State基础概念

### 1.1 什么是State

State（状态）是组件内部的私有数据，用于存储会随时间变化的信息。

#### State的本质

```jsx
// State是组件的"记忆"
function Counter() {
  // count是State，初始值为0
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

// 每次点击按钮：
// 1. 调用setCount更新State
// 2. 触发组件重新渲染
// 3. count显示新值
```

#### State的特点

```jsx
// 1. 私有性：State属于组件内部
function ComponentA() {
  const [value, setValue] = useState('A');
  // value只在ComponentA中可用
  return <div>{value}</div>;
}

function ComponentB() {
  const [value, setValue] = useState('B');
  // ComponentB有自己独立的State
  return <div>{value}</div>;
}

// 2. 可变性：State可以更新
function ToggleButton() {
  const [isOn, setIsOn] = useState(false);
  
  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? '开' : '关'}
    </button>
  );
}

// 3. 响应式：State更新触发重新渲染
function InputMirror() {
  const [text, setText] = useState('');
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>你输入了：{text}</p>
    </>
  );
}
```

### 1.2 State vs Props

```jsx
// Props：从父组件传递，不可修改
function Child({ name }) {
  // name是props，只读
  // name = 'New Name';  // 错误！
  
  return <div>Hello, {name}</div>;
}

// State：组件内部数据，可以修改
function Parent() {
  const [name, setName] = useState('Alice');
  
  // 可以修改State
  const changeName = () => {
    setName('Bob');
  };
  
  return (
    <>
      <Child name={name} />
      <button onClick={changeName}>改名</button>
    </>
  );
}

// 对比总结
/*
Props:
- 由父组件传递
- 只读，不可修改
- 用于组件间通信
- 类似函数参数

State:
- 组件内部定义
- 可以修改
- 触发重新渲染
- 类似局部变量
*/
```

### 1.3 为什么需要State

```jsx
// 问题：普通变量不能触发重新渲染
function BrokenCounter() {
  let count = 0;  // 普通变量
  
  const increment = () => {
    count++;  // 修改变量
    console.log(count);  // 输出新值
    // 但组件不会重新渲染，UI不更新
  };
  
  return (
    <div>
      <p>计数：{count}</p>  {/* 永远显示0 */}
      <button onClick={increment}>增加</button>
    </div>
  );
}

// 解决：使用State
function WorkingCounter() {
  const [count, setCount] = useState(0);  // State
  
  const increment = () => {
    setCount(count + 1);  // 更新State
    // 触发重新渲染，UI更新
  };
  
  return (
    <div>
      <p>计数：{count}</p>  {/* 显示实时值 */}
      <button onClick={increment}>增加</button>
    </div>
  );
}
```

## 第二部分：useState Hook详解

### 2.1 基本用法

```jsx
import { useState } from 'react';

function Example() {
  // 语法：const [state, setState] = useState(initialValue)
  const [count, setCount] = useState(0);
  
  // 解构说明：
  // count：当前State值
  // setCount：更新State的函数
  // 0：初始值
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

#### 各种类型的State

```jsx
function TypesExample() {
  // 1. 数字State
  const [count, setCount] = useState(0);
  
  // 2. 字符串State
  const [name, setName] = useState('Alice');
  
  // 3. 布尔State
  const [isVisible, setIsVisible] = useState(false);
  
  // 4. 数组State
  const [items, setItems] = useState([]);
  
  // 5. 对象State
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25
  });
  
  // 6. null State
  const [data, setData] = useState(null);
  
  return (
    <div>
      <p>数字：{count}</p>
      <p>字符串：{name}</p>
      <p>布尔：{String(isVisible)}</p>
      <p>数组长度：{items.length}</p>
      <p>对象：{user.name}, {user.age}</p>
      <p>Null：{data === null ? 'null' : data}</p>
    </div>
  );
}
```

### 2.2 更新State

```jsx
function UpdateExamples() {
  const [count, setCount] = useState(0);
  
  // 方式1：直接设置新值
  const increment1 = () => {
    setCount(count + 1);
  };
  
  // 方式2：函数式更新（推荐）
  const increment2 = () => {
    setCount(prevCount => prevCount + 1);
  };
  
  // 区别演示
  const handleClick1 = () => {
    setCount(count + 1);  // count是0
    setCount(count + 1);  // count还是0
    setCount(count + 1);  // count还是0
    // 最终count = 1（不是3）
  };
  
  const handleClick2 = () => {
    setCount(prev => prev + 1);  // prev是0，设为1
    setCount(prev => prev + 1);  // prev是1，设为2
    setCount(prev => prev + 1);  // prev是2，设为3
    // 最终count = 3
  };
  
  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={handleClick1}>方式1: +3?</button>
      <button onClick={handleClick2}>方式2: +3</button>
    </div>
  );
}
```

#### 对象State的更新

```jsx
function ObjectStateExample() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  });
  
  // 错误：直接修改State（不会触发更新）
  const updateWrong = () => {
    user.age = 26;  // 错误！
    setUser(user);  // 不会重新渲染（引用相同）
  };
  
  // 正确：创建新对象
  const updateRight = () => {
    setUser({
      ...user,  // 展开旧值
      age: 26   // 覆盖age
    });
  };
  
  // 更新单个属性
  const updateName = (newName) => {
    setUser(prev => ({
      ...prev,
      name: newName
    }));
  };
  
  // 更新多个属性
  const updateMultiple = () => {
    setUser(prev => ({
      ...prev,
      age: 26,
      email: 'new@example.com'
    }));
  };
  
  return (
    <div>
      <p>姓名：{user.name}</p>
      <p>年龄：{user.age}</p>
      <p>邮箱：{user.email}</p>
      <button onClick={updateRight}>更新年龄</button>
      <button onClick={() => updateName('Bob')}>更新姓名</button>
      <button onClick={updateMultiple}>更新多个</button>
    </div>
  );
}
```

#### 数组State的更新

```jsx
function ArrayStateExample() {
  const [items, setItems] = useState(['A', 'B', 'C']);
  
  // 添加元素
  const addItem = () => {
    setItems([...items, 'New']);  // 在末尾添加
    // 或
    setItems(prev => [...prev, 'New']);
  };
  
  const addToStart = () => {
    setItems(['New', ...items]);  // 在开头添加
  };
  
  // 删除元素
  const removeFirst = () => {
    setItems(items.slice(1));  // 删除第一个
  };
  
  const removeLast = () => {
    setItems(items.slice(0, -1));  // 删除最后一个
  };
  
  const removeByIndex = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  // 更新元素
  const updateByIndex = (index, newValue) => {
    setItems(items.map((item, i) => 
      i === index ? newValue : item
    ));
  };
  
  // 排序
  const sortItems = () => {
    setItems([...items].sort());  // 创建新数组再排序
  };
  
  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item}
            <button onClick={() => removeByIndex(index)}>删除</button>
            <button onClick={() => updateByIndex(index, 'Updated')}>
              更新
            </button>
          </li>
        ))}
      </ul>
      <button onClick={addItem}>添加到末尾</button>
      <button onClick={addToStart}>添加到开头</button>
      <button onClick={sortItems}>排序</button>
    </div>
  );
}
```

### 2.3 惰性初始化

```jsx
// 问题：昂贵的初始化计算每次渲染都执行
function SlowComponent() {
  const [data, setData] = useState(
    expensiveCalculation()  // 每次渲染都调用
  );
  
  return <div>{data}</div>;
}

// 解决：使用函数形式（只在首次渲染时调用）
function FastComponent() {
  const [data, setData] = useState(() => {
    console.log('只在初始化时执行一次');
    return expensiveCalculation();
  });
  
  return <div>{data}</div>;
}

// 实际应用
function UserComponent({ userId }) {
  // 从localStorage读取（只在首次渲染时读取）
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem(`user-${userId}`);
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });
  
  // 复杂计算
  const [computed, setComputed] = useState(() => {
    return complexCalculation(userId);
  });
  
  return <div>{/* ... */}</div>;
}
```

### 2.4 多个State的管理

```jsx
function MultipleStates() {
  // 方式1：分别定义（简单State）
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');
  
  // 方式2：合并为对象（相关State）
  const [user, setUser] = useState({
    name: '',
    age: 0,
    email: ''
  });
  
  // 方式3：使用useReducer（复杂逻辑）
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return <div>{/* ... */}</div>;
}

// 何时分开，何时合并？
function WhenToMerge() {
  // 分开：不相关的State
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);
  
  // 合并：相关的State
  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: false
  });
  
  // 合并：一起更新的State
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  
  return <div>{/* ... */}</div>;
}
```

## 第三部分：State的进阶用法

### 3.1 派生State（Derived State）

```jsx
// 从props派生State（通常不推荐）
function SearchResults({ query }) {
  const [localQuery, setLocalQuery] = useState(query);
  
  // 问题：props变化时，localQuery不会更新
  
  return <div>{localQuery}</div>;
}

// 解决方案1：直接使用props
function SearchResults({ query }) {
  // 直接使用query，不需要State
  const results = useMemo(() => {
    return searchData(query);
  }, [query]);
  
  return <div>{results}</div>;
}

// 解决方案2：使用key重置组件
function Parent() {
  const [query, setQuery] = useState('');
  
  return (
    <SearchResults 
      key={query}  // query变化时重新创建组件
      query={query} 
    />
  );
}

// 解决方案3：useEffect同步
function SearchResults({ query }) {
  const [localQuery, setLocalQuery] = useState(query);
  
  useEffect(() => {
    setLocalQuery(query);  // props变化时同步
  }, [query]);
  
  return <div>{localQuery}</div>;
}
```

### 3.2 State与useEffect

```jsx
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (isMounted) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => {
      isMounted = false;  // 清理
    };
  }, [userId]);  // userId变化时重新获取
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;
  if (!data) return null;
  
  return <div>{data.name}</div>;
}
```

### 3.3 状态提升（Lifting State Up）

```jsx
// 问题：两个组件需要共享State
function TemperatureInput1() {
  const [temperature, setTemperature] = useState('');
  return (
    <input
      value={temperature}
      onChange={e => setTemperature(e.target.value)}
    />
  );
}

function TemperatureInput2() {
  const [temperature, setTemperature] = useState('');
  // 两个组件的State独立，无法同步
  return (
    <input
      value={temperature}
      onChange={e => setTemperature(e.target.value)}
    />
  );
}

// 解决：提升State到共同父组件
function TemperatureConverter() {
  const [temperature, setTemperature] = useState('');
  
  return (
    <div>
      <h3>摄氏度</h3>
      <TemperatureInput
        value={temperature}
        onChange={setTemperature}
      />
      
      <h3>华氏度</h3>
      <TemperatureInput
        value={temperature ? (temperature * 9/5 + 32).toFixed(1) : ''}
        onChange={value => setTemperature(
          value ? ((value - 32) * 5/9).toFixed(1) : ''
        )}
      />
    </div>
  );
}

function TemperatureInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}
```

### 3.4 State批量更新

```jsx
function BatchingExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  // React 18之前：同步更新会批量处理
  const handleClickSync = () => {
    setCount(c => c + 1);  // 批量更新
    setFlag(f => !f);      // 批量更新
    // 只触发一次重新渲染
  };
  
  // React 18之前：异步更新不会批量处理
  const handleClickAsync = () => {
    setTimeout(() => {
      setCount(c => c + 1);  // 单独更新
      setFlag(f => !f);      // 单独更新
      // 触发两次重新渲染
    }, 0);
  };
  
  // React 18+：自动批量处理所有更新
  const handleClickAutomatic = () => {
    setTimeout(() => {
      setCount(c => c + 1);  // 自动批量
      setFlag(f => !f);      // 自动批量
      // 只触发一次重新渲染
    }, 0);
    
    fetch('/api').then(() => {
      setCount(c => c + 1);  // 自动批量
      setFlag(f => !f);      // 自动批量
      // 只触发一次重新渲染
    });
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {String(flag)}</p>
      <button onClick={handleClickSync}>同步更新</button>
      <button onClick={handleClickAsync}>异步更新</button>
      <button onClick={handleClickAutomatic}>自动批量</button>
    </div>
  );
}
```

## 第四部分：State设计原则

### 4.1 最小化State

```jsx
// 不好：冗余State
function BadExample({ items }) {
  const [items, setItems] = useState(props.items);
  const [count, setCount] = useState(items.length);  // 冗余
  const [hasItems, setHasItems] = useState(items.length > 0);  // 冗余
  
  return <div>{count} items</div>;
}

// 好：计算派生值
function GoodExample({ items }) {
  const count = items.length;  // 计算
  const hasItems = count > 0;  // 计算
  
  return <div>{count} items</div>;
}

// 不好：可以计算的State
function BadCalculation() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');  // 冗余
  
  const handleFirstNameChange = (value) => {
    setFirstName(value);
    setFullName(`${value} ${lastName}`);  // 需要手动同步
  };
  
  return <div>{fullName}</div>;
}

// 好：直接计算
function GoodCalculation() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = `${firstName} ${lastName}`.trim();  // 自动同步
  
  return <div>{fullName}</div>;
}
```

### 4.2 避免State镜像Props

```jsx
// 不好：State镜像Props
function BadComponent({ user }) {
  const [currentUser, setCurrentUser] = useState(user);
  
  // 问题：user变化时，currentUser不会更新
  
  return <div>{currentUser.name}</div>;
}

// 好的方案

// 方案1：直接使用Props
function GoodComponent1({ user }) {
  return <div>{user.name}</div>;
}

// 方案2：重命名Props表示初始值
function GoodComponent2({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  // 只用于初始化，之后独立管理
  
  return (
    <div>
      <p>{user.name}</p>
      <button onClick={() => setUser({ ...user, name: 'New Name' })}>
        改名
      </button>
    </div>
  );
}

// 方案3：使用key重置
function Parent() {
  const [selectedUser, setSelectedUser] = useState(users[0]);
  
  return (
    <UserEditor
      key={selectedUser.id}  // id变化时重新创建组件
      user={selectedUser}
    />
  );
}
```

### 4.3 扁平化State结构

```jsx
// 不好：深度嵌套
function BadNested() {
  const [state, setState] = useState({
    user: {
      profile: {
        name: 'Alice',
        address: {
          city: 'Beijing',
          country: 'China'
        }
      },
      settings: {
        theme: 'light',
        notifications: {
          email: true,
          push: false
        }
      }
    }
  });
  
  // 更新很复杂
  const updateCity = (city) => {
    setState({
      ...state,
      user: {
        ...state.user,
        profile: {
          ...state.user.profile,
          address: {
            ...state.user.profile.address,
            city
          }
        }
      }
    });
  };
  
  return <div>{state.user.profile.address.city}</div>;
}

// 好：扁平化
function GoodFlat() {
  const [name, setName] = useState('Alice');
  const [city, setCity] = useState('Beijing');
  const [country, setCountry] = useState('China');
  const [theme, setTheme] = useState('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // 更新简单
  const updateCity = (newCity) => {
    setCity(newCity);
  };
  
  return <div>{city}</div>;
}

// 或使用多个State对象（按功能分组）
function GoodGrouped() {
  const [profile, setProfile] = useState({
    name: 'Alice',
    city: 'Beijing',
    country: 'China'
  });
  
  const [settings, setSettings] = useState({
    theme: 'light',
    emailNotifications: true,
    pushNotifications: false
  });
  
  const updateCity = (city) => {
    setProfile({ ...profile, city });
  };
  
  return <div>{profile.city}</div>;
}
```

### 4.4 规范化State

```jsx
// 不好：重复的数据
function BadDuplication() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Post 1',
      author: { id: 1, name: 'Alice' }
    },
    {
      id: 2,
      title: 'Post 2',
      author: { id: 1, name: 'Alice' }  // 重复
    }
  ]);
  
  // 更新作者名需要遍历所有帖子
  const updateAuthorName = (authorId, newName) => {
    setPosts(posts.map(post => 
      post.author.id === authorId
        ? { ...post, author: { ...post.author, name: newName } }
        : post
    ));
  };
  
  return <div>{/* ... */}</div>;
}

// 好：规范化（类似数据库）
function GoodNormalized() {
  const [posts, setPosts] = useState({
    1: { id: 1, title: 'Post 1', authorId: 1 },
    2: { id: 2, title: 'Post 2', authorId: 1 }
  });
  
  const [authors, setAuthors] = useState({
    1: { id: 1, name: 'Alice' }
  });
  
  // 更新作者名只需要一处修改
  const updateAuthorName = (authorId, newName) => {
    setAuthors({
      ...authors,
      [authorId]: { ...authors[authorId], name: newName }
    });
  };
  
  return <div>{/* ... */}</div>;
}
```

## 第五部分：React 19的State新特性

### 5.1 自动批量更新

```jsx
// React 19：所有更新都自动批量处理
function AutoBatching() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  // 事件处理器中
  const handleClick = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 自动批量，只触发一次渲染
  };
  
  // 异步回调中
  const handleAsync = async () => {
    const data = await fetchData();
    setCount(data.count);
    setFlag(data.flag);
    // 自动批量，只触发一次渲染
  };
  
  // Promise中
  const handlePromise = () => {
    Promise.resolve().then(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // 自动批量，只触发一次渲染
    });
  };
  
  // setTimeout中
  const handleTimeout = () => {
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // 自动批量，只触发一次渲染
    }, 1000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {String(flag)}</p>
      <button onClick={handleClick}>同步</button>
      <button onClick={handleAsync}>异步</button>
      <button onClick={handlePromise}>Promise</button>
      <button onClick={handleTimeout}>Timeout</button>
    </div>
  );
}
```

### 5.2 useTransition与State

```jsx
import { useState, useTransition } from 'react';

function TransitionExample() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    // 高优先级更新：立即响应用户输入
    setInput(e.target.value);
    
    // 低优先级更新：可以延迟的列表更新
    startTransition(() => {
      const newList = generateLargeList(e.target.value);
      setList(newList);
    });
  };
  
  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending && <div>更新中...</div>}
      <ul>
        {list.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}
```

### 5.3 useDeferredValue与State

```jsx
import { useState, useDeferredValue } from 'react';

function DeferredExample() {
  const [input, setInput] = useState('');
  
  // 延迟的值
  const deferredInput = useDeferredValue(input);
  
  // 使用延迟值进行昂贵的计算
  const filteredList = useMemo(() => {
    return largeList.filter(item => 
      item.includes(deferredInput)
    );
  }, [deferredInput]);
  
  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <p>输入：{input}</p>
      <p>延迟：{deferredInput}</p>
      <List items={filteredList} />
    </div>
  );
}
```

### 5.4 useOptimistic与State

```jsx
import { useOptimistic, useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  async function addTodo(text) {
    const newTodo = { id: Date.now(), text, pending: true };
    
    // 乐观更新UI
    addOptimisticTodo(newTodo);
    
    try {
      // 实际API调用
      const savedTodo = await api.createTodo(text);
      setTodos([...todos, savedTodo]);
    } catch (error) {
      // 失败时自动回滚
      console.error('Failed to add todo');
    }
  }
  
  return (
    <div>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            {todo.pending && <span> (保存中...)</span>}
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo('New Todo')}>添加</button>
    </div>
  );
}
```

## 第六部分：State性能优化

### 6.1 避免不必要的State更新

```jsx
// 问题：相同值的更新也会触发渲染
function InefficientComponent() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(0);  // 即使值相同，也会触发渲染
  };
  
  return <button onClick={handleClick}>Count: {count}</button>;
}

// 解决：React会自动检测相同值（Object.is比较）
function EfficientComponent() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(0);  // React检测到值相同，不会重新渲染
  };
  
  return <button onClick={handleClick}>Count: {count}</button>;
}

// 对象State需要注意
function ObjectComponent() {
  const [user, setUser] = useState({ name: 'Alice' });
  
  const handleClick = () => {
    setUser({ name: 'Alice' });  // 新对象，会触发渲染
    // 即使内容相同
  };
  
  // 解决：检查是否真正改变
  const handleClickSmart = () => {
    setUser(prev => 
      prev.name === 'Alice' ? prev : { name: 'Alice' }
    );
  };
  
  return <button onClick={handleClickSmart}>Name: {user.name}</button>;
}
```

### 6.2 使用useCallback缓存更新函数

```jsx
import { useState, useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);
  
  // 不好：每次渲染创建新函数
  const increment = () => {
    setCount(c => c + 1);
  };
  
  // 好：使用useCallback缓存
  const incrementMemo = useCallback(() => {
    setCount(c => c + 1);
  }, []);  // 依赖为空，函数永不变
  
  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent onIncrement={incrementMemo} />
    </div>
  );
}

const ChildComponent = React.memo(({ onIncrement }) => {
  console.log('Child rendered');
  return <button onClick={onIncrement}>Increment</button>;
});
```

### 6.3 合理拆分State

```jsx
// 不好：一个大State
function BadSplit() {
  const [state, setState] = useState({
    count: 0,
    text: '',
    isOpen: false,
    theme: 'light'
  });
  
  // 任何一个值变化都会触发整个组件渲染
  const updateCount = () => {
    setState({ ...state, count: state.count + 1 });
  };
  
  return <div>{/* ... */}</div>;
}

// 好：拆分独立的State
function GoodSplit() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // 每个State独立更新
  const updateCount = () => {
    setCount(c => c + 1);
  };
  
  return <div>{/* ... */}</div>;
}

// 更好：按组件职责拆分
function BestSplit() {
  return (
    <>
      <Counter />  {/* count独立 */}
      <TextInput />  {/* text独立 */}
      <Modal />  {/* isOpen独立 */}
      <ThemeToggle />  {/* theme独立 */}
    </>
  );
}
```

## 第七部分：常见问题与解决

### 7.1 State更新不及时

```jsx
// 问题：使用旧的State值
function StaleState() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count);  // 输出旧值（0）
    
    setTimeout(() => {
      console.log(count);  // 仍然是旧值（0）
    }, 1000);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 解决：使用函数式更新
function FreshState() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prev => {
      console.log('Previous:', prev);  // 最新值
      return prev + 1;
    });
    
    // 如果需要在更新后获取新值，使用useEffect
  };
  
  useEffect(() => {
    console.log('Updated count:', count);
  }, [count]);
  
  return <button onClick={handleClick}>{count}</button>;
}
```

### 7.2 State丢失或重置

```jsx
// 问题：组件位置变化导致State重置
function BadPosition({ showA }) {
  return (
    <div>
      {showA ? (
        <Counter />
      ) : (
        <div>
          <Counter />  {/* 不同位置，会重新创建 */}
        </div>
      )}
    </div>
  );
}

// 解决：使用key保持State
function GoodPosition({ showA }) {
  return (
    <div>
      {showA ? (
        <Counter key="counter" />
      ) : (
        <div>
          <Counter key="counter" />  {/* 相同key，保持State */}
        </div>
      )}
    </div>
  );
}
```

### 7.3 对象/数组State更新无效

```jsx
// 问题：直接修改State
function BrokenUpdate() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  const updateAge = () => {
    user.age = 26;  // 直接修改
    setUser(user);  // 引用相同，不会更新
  };
  
  return <div>{user.age}</div>;
}

// 解决：创建新对象
function WorkingUpdate() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  const updateAge = () => {
    setUser({ ...user, age: 26 });  // 新对象
    // 或
    setUser(prev => ({ ...prev, age: 26 }));
  };
  
  return <div>{user.age}</div>;
}
```

## 第八部分：实战案例

### 8.1 表单State管理

```jsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
    
    // 清除该字段的错误
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = '用户名不能为空';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = '邮箱格式错误';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = '密码至少6位';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setSubmitting(true);
    try {
      await api.register(formData);
      alert('注册成功！');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={formData.username}
          onChange={handleChange('username')}
          placeholder="用户名"
        />
        {errors.username && <span>{errors.username}</span>}
      </div>
      
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="邮箱"
        />
        {errors.email && <span>{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          placeholder="密码"
        />
        {errors.password && <span>{errors.password}</span>}
      </div>
      
      <div>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          placeholder="确认密码"
        />
        {errors.confirmPassword && <span>{errors.confirmPassword}</span>}
      </div>
      
      {errors.submit && <div>{errors.submit}</div>}
      
      <button type="submit" disabled={submitting}>
        {submitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

### 8.2 购物车State

```jsx
function ShoppingCart() {
  const [items, setItems] = useState([]);
  
  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        // 增加数量
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 添加新商品
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };
  
  const removeItem = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
  };
  
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  return (
    <div>
      <h2>购物车</h2>
      {items.length === 0 ? (
        <p>购物车是空的</p>
      ) : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>¥{item.price}</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateQuantity(item.id, Number(e.target.value))}
                  min="0"
                />
                <span>小计：¥{item.price * item.quantity}</span>
                <button onClick={() => removeItem(item.id)}>删除</button>
              </li>
            ))}
          </ul>
          
          <div>
            <p>总计：¥{total.toFixed(2)}</p>
            <button onClick={clearCart}>清空购物车</button>
            <button>去结算</button>
          </div>
        </>
      )}
    </div>
  );
}
```

### 8.3 分页State管理

```jsx
function PaginatedList({ pageSize = 10 }) {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.getItems({
          page: currentPage,
          pageSize
        });
        setData(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, pageSize]);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const goToFirst = () => goToPage(1);
  const goToLast = () => goToPage(totalPages);
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      <div className="pagination">
        <button onClick={goToFirst} disabled={currentPage === 1}>
          首页
        </button>
        <button onClick={goToPrevious} disabled={currentPage === 1}>
          上一页
        </button>
        
        <span>
          第 {currentPage} / {totalPages} 页
        </span>
        
        <button onClick={goToNext} disabled={currentPage === totalPages}>
          下一页
        </button>
        <button onClick={goToLast} disabled={currentPage === totalPages}>
          末页
        </button>
      </div>
    </div>
  );
}
```

## 练习题

### 基础练习

1. 创建一个计数器，包含加、减、重置功能
2. 实现一个切换开关组件
3. 创建一个输入框，实时显示输入内容

### 进阶练习

1. 实现一个待办事项列表（增删改）
2. 创建一个表单验证系统
3. 实现购物车功能（添加、删除、修改数量）

### 高级练习

1. 实现一个支持撤销/重做的编辑器
2. 创建一个复杂的分页数据管理系统
3. 使用React 19的useOptimistic实现乐观更新

通过本章学习，你已经全面掌握了State的概念和使用方法。State是React的核心，理解State是掌握React的关键。继续学习，深入探索React的更多特性！

