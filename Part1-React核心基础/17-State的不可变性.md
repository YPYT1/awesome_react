# State的不可变性

## 学习目标

通过本章学习，你将深入理解：

- 什么是不可变性（Immutability）
- 为什么React需要不可变性
- 如何正确更新对象和数组State
- 不可变性的性能影响
- 常用的不可变操作模式
- Immer库的使用
- React 19中的最佳实践

## 第一部分：不可变性基础

### 1.1 什么是不可变性

不可变性（Immutability）是指数据一旦创建就不能被修改，任何修改都会创建新的数据副本。

#### 可变vs不可变

```jsx
// 可变操作（直接修改原数据）
const mutableArray = [1, 2, 3];
mutableArray.push(4);  // 修改原数组
console.log(mutableArray);  // [1, 2, 3, 4]

const mutableObject = { name: 'Alice' };
mutableObject.age = 25;  // 修改原对象
console.log(mutableObject);  // { name: 'Alice', age: 25 }

// 不可变操作（创建新数据）
const immutableArray = [1, 2, 3];
const newArray = [...immutableArray, 4];  // 创建新数组
console.log(immutableArray);  // [1, 2, 3]（原数组不变）
console.log(newArray);  // [1, 2, 3, 4]

const immutableObject = { name: 'Alice' };
const newObject = { ...immutableObject, age: 25 };  // 创建新对象
console.log(immutableObject);  // { name: 'Alice' }（原对象不变）
console.log(newObject);  // { name: 'Alice', age: 25 }
```

### 1.2 为什么React需要不可变性

#### 原因1：检测变化

```jsx
// React如何检测State变化
function DetectChange() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  // 错误：直接修改（React检测不到变化）
  const updateWrong = () => {
    user.age = 26;  // 修改原对象
    setUser(user);  // 引用相同，React认为没变化
    // 组件不会重新渲染！
  };
  
  // 正确：创建新对象
  const updateRight = () => {
    setUser({ ...user, age: 26 });  // 新对象，新引用
    // React检测到变化，触发重新渲染
  };
  
  return (
    <div>
      <p>年龄：{user.age}</p>
      <button onClick={updateWrong}>错误更新</button>
      <button onClick={updateRight}>正确更新</button>
    </div>
  );
}

// React的比较机制
Object.is(oldValue, newValue)  // 浅比较

// 示例
const obj1 = { a: 1 };
const obj2 = { a: 1 };
const obj3 = obj1;

Object.is(obj1, obj2)  // false（不同对象）
Object.is(obj1, obj3)  // true（相同引用）

// 这就是为什么需要创建新对象
```

#### 原因2：优化性能

```jsx
// React.memo使用浅比较
const ExpensiveComponent = React.memo(function({ user }) {
  console.log('渲染');
  return <div>{user.name}</div>;
});

function Parent() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  // 错误：修改原对象
  const updateWrong = () => {
    user.age = 26;
    setUser(user);  // 引用相同
    // ExpensiveComponent不会重新渲染（memo认为props没变）
  };
  
  // 正确：创建新对象
  const updateRight = () => {
    setUser({ ...user, age: 26 });  // 新引用
    // ExpensiveComponent会重新渲染
  };
  
  return <ExpensiveComponent user={user} />;
}
```

#### 原因3：时间旅行和状态回溯

```jsx
// 不可变性支持撤销/重做
function UndoRedo() {
  const [history, setHistory] = useState([{ value: 0 }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const current = history[currentIndex];
  
  const setValue = (newValue) => {
    // 创建新状态，保留历史
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, { value: newValue }]);
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
  
  return (
    <div>
      <p>值：{current.value}</p>
      <button onClick={() => setValue(current.value + 1)}>+1</button>
      <button onClick={undo}>撤销</button>
      <button onClick={redo}>重做</button>
    </div>
  );
}
```

## 第二部分：对象的不可变更新

### 2.1 基本对象更新

```jsx
function ObjectUpdate() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  });
  
  // 更新单个属性
  const updateName = (newName) => {
    setUser({
      ...user,
      name: newName
    });
  };
  
  // 更新多个属性
  const updateMultiple = () => {
    setUser({
      ...user,
      age: 26,
      email: 'newemail@example.com'
    });
  };
  
  // 函数式更新
  const updateFunctional = () => {
    setUser(prev => ({
      ...prev,
      age: prev.age + 1
    }));
  };
  
  // 删除属性
  const deleteEmail = () => {
    const { email, ...rest } = user;
    setUser(rest);
  };
  
  return <div>{/* ... */}</div>;
}
```

### 2.2 嵌套对象更新

```jsx
function NestedObjectUpdate() {
  const [user, setUser] = useState({
    name: 'Alice',
    address: {
      city: 'Beijing',
      country: 'China',
      zipCode: '100000'
    },
    preferences: {
      theme: 'light',
      language: 'zh-CN'
    }
  });
  
  // 更新嵌套属性
  const updateCity = (newCity) => {
    setUser({
      ...user,
      address: {
        ...user.address,
        city: newCity
      }
    });
  };
  
  // 更新深层嵌套
  const updateTheme = (newTheme) => {
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        theme: newTheme
      }
    });
  };
  
  // 更新多层嵌套
  const updateMultipleNested = () => {
    setUser({
      ...user,
      name: 'Bob',
      address: {
        ...user.address,
        city: 'Shanghai',
        zipCode: '200000'
      },
      preferences: {
        ...user.preferences,
        theme: 'dark'
      }
    });
  };
  
  return <div>{user.address.city}</div>;
}
```

### 2.3 动态属性更新

```jsx
function DynamicPropertyUpdate() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // 通用更新函数
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value  // 计算属性名
    });
  };
  
  // 或使用事件对象
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  return (
    <form>
      <input
        name="username"
        value={formData.username}
        onChange={handleInputChange}
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleInputChange}
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
      />
    </form>
  );
}
```

## 第三部分：数组的不可变更新

### 3.1 基本数组操作

```jsx
function ArrayUpdate() {
  const [items, setItems] = useState(['A', 'B', 'C']);
  
  // 添加元素
  const addToEnd = (item) => {
    setItems([...items, item]);  // 末尾添加
  };
  
  const addToStart = (item) => {
    setItems([item, ...items]);  // 开头添加
  };
  
  const addAtIndex = (index, item) => {
    setItems([
      ...items.slice(0, index),
      item,
      ...items.slice(index)
    ]);
  };
  
  // 删除元素
  const removeByIndex = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const removeByValue = (value) => {
    setItems(items.filter(item => item !== value));
  };
  
  const removeFirst = () => {
    setItems(items.slice(1));
  };
  
  const removeLast = () => {
    setItems(items.slice(0, -1));
  };
  
  // 更新元素
  const updateByIndex = (index, newValue) => {
    setItems(items.map((item, i) => 
      i === index ? newValue : item
    ));
  };
  
  // 排序
  const sortItems = () => {
    setItems([...items].sort());  // 创建副本再排序
  };
  
  // 反转
  const reverseItems = () => {
    setItems([...items].reverse());
  };
  
  return <div>{/* ... */}</div>;
}
```

### 3.2 对象数组更新

```jsx
function ObjectArrayUpdate() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Task 1', completed: false },
    { id: 2, text: 'Task 2', completed: true },
    { id: 3, text: 'Task 3', completed: false }
  ]);
  
  // 添加新对象
  const addTodo = (text) => {
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text,
        completed: false
      }
    ]);
  };
  
  // 更新对象属性
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  const updateText = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, text: newText }
        : todo
    ));
  };
  
  // 删除对象
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // 批量操作
  const completeAll = () => {
    setTodos(todos.map(todo => ({
      ...todo,
      completed: true
    })));
  };
  
  const deleteCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
  
  return <div>{/* ... */}</div>;
}
```

### 3.3 嵌套数组更新

```jsx
function NestedArrayUpdate() {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: '工作',
      items: [
        { id: 101, text: '会议' },
        { id: 102, text: '报告' }
      ]
    },
    {
      id: 2,
      name: '生活',
      items: [
        { id: 201, text: '购物' },
        { id: 202, text: '运动' }
      ]
    }
  ]);
  
  // 更新嵌套数组中的元素
  const updateItem = (categoryId, itemId, newText) => {
    setCategories(categories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            items: category.items.map(item =>
              item.id === itemId
                ? { ...item, text: newText }
                : item
            )
          }
        : category
    ));
  };
  
  // 添加到嵌套数组
  const addItem = (categoryId, text) => {
    setCategories(categories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            items: [
              ...category.items,
              { id: Date.now(), text }
            ]
          }
        : category
    ));
  };
  
  // 从嵌套数组删除
  const deleteItem = (categoryId, itemId) => {
    setCategories(categories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            items: category.items.filter(item => item.id !== itemId)
          }
        : category
    ));
  };
  
  return <div>{/* ... */}</div>;
}
```

## 第四部分：Immer库使用

### 4.1 Immer基础

```jsx
import { produce } from 'immer';

function WithImmer() {
  const [user, setUser] = useState({
    name: 'Alice',
    address: {
      city: 'Beijing',
      zipCode: '100000'
    }
  });
  
  // 不使用Immer（复杂）
  const updateCityWithout = (newCity) => {
    setUser({
      ...user,
      address: {
        ...user.address,
        city: newCity
      }
    });
  };
  
  // 使用Immer（简单）
  const updateCityWith = (newCity) => {
    setUser(produce(draft => {
      draft.address.city = newCity;  // 直接修改draft
    }));
  };
  
  // 或直接在setState中使用
  const updateCityDirect = (newCity) => {
    setUser(prev => produce(prev, draft => {
      draft.address.city = newCity;
    }));
  };
  
  return <div>{user.address.city}</div>;
}
```

### 4.2 Immer高级用法

```jsx
import { produce } from 'immer';

function ImmerAdvanced() {
  const [state, setState] = useState({
    users: [
      { id: 1, name: 'Alice', todos: [] },
      { id: 2, name: 'Bob', todos: [] }
    ],
    settings: {
      theme: 'light',
      notifications: true
    }
  });
  
  // 复杂的嵌套更新
  const addTodoToUser = (userId, todo) => {
    setState(produce(draft => {
      const user = draft.users.find(u => u.id === userId);
      if (user) {
        user.todos.push(todo);
      }
    }));
  };
  
  // 数组操作
  const removeUser = (userId) => {
    setState(produce(draft => {
      const index = draft.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        draft.users.splice(index, 1);  // 直接使用splice
      }
    }));
  };
  
  // 排序
  const sortUsers = () => {
    setState(produce(draft => {
      draft.users.sort((a, b) => a.name.localeCompare(b.name));
    }));
  };
  
  // 批量更新
  const batchUpdate = () => {
    setState(produce(draft => {
      draft.settings.theme = 'dark';
      draft.settings.notifications = false;
      draft.users[0].name = 'Alicia';
      draft.users.push({ id: 3, name: 'Charlie', todos: [] });
    }));
  };
  
  return <div>{/* ... */}</div>;
}
```

### 4.3 useImmer Hook

```jsx
import { useImmer } from 'use-immer';

function UseImmerExample() {
  const [todos, updateTodos] = useImmer([
    { id: 1, text: 'Task 1', completed: false },
    { id: 2, text: 'Task 2', completed: true }
  ]);
  
  // 直接修改语法
  const toggleTodo = (id) => {
    updateTodos(draft => {
      const todo = draft.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    });
  };
  
  const addTodo = (text) => {
    updateTodos(draft => {
      draft.push({
        id: Date.now(),
        text,
        completed: false
      });
    });
  };
  
  const deleteTodo = (id) => {
    updateTodos(draft => {
      const index = draft.findIndex(t => t.id === id);
      if (index !== -1) {
        draft.splice(index, 1);
      }
    });
  };
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span>{todo.text}</span>
          <button onClick={() => deleteTodo(todo.id)}>删除</button>
        </div>
      ))}
      <button onClick={() => addTodo('New Task')}>添加</button>
    </div>
  );
}
```

## 第五部分：不可变性的性能考虑

### 5.1 浅拷贝vs深拷贝

```jsx
// 浅拷贝（推荐用于State更新）
const shallowCopy = {
  ...original,
  property: newValue
};

// 深拷贝（通常不必要）
const deepCopy = JSON.parse(JSON.stringify(original));
// 问题：
// 1. 性能差
// 2. 丢失函数、Date等
// 3. 循环引用会出错

// React只需要浅拷贝
function ShallowCopyExample() {
  const [state, setState] = useState({
    user: {
      name: 'Alice',
      profile: {
        avatar: 'url'
      }
    },
    settings: {
      theme: 'light'
    }
  });
  
  // 只需要拷贝改变的层级
  const updateAvatar = (newAvatar) => {
    setState({
      ...state,
      user: {
        ...state.user,
        profile: {
          ...state.user.profile,
          avatar: newAvatar
        }
      }
    });
  };
  
  return <div>{state.user.profile.avatar}</div>;
}
```

### 5.2 结构共享

```jsx
// React的结构共享优化
function StructuralSharing() {
  const [data, setData] = useState({
    a: { value: 1 },
    b: { value: 2 },
    c: { value: 3 }
  });
  
  // 更新b时，a和c的引用保持不变
  const updateB = () => {
    setData({
      ...data,
      b: { value: 4 }
    });
  };
  
  // 验证
  useEffect(() => {
    const oldA = data.a;
    updateB();
    // 新data.a === oldA（引用相同）
  }, []);
  
  return <div>{data.b.value}</div>;
}

// 性能优势
const MemoComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
});

function Parent() {
  const [state, setState] = useState({
    a: { value: 1 },
    b: { value: 2 }
  });
  
  const updateB = () => {
    setState({
      ...state,
      b: { value: 3 }
    });
  };
  
  return (
    <>
      <MemoComponent data={state.a} />  {/* 不会重新渲染 */}
      <MemoComponent data={state.b} />  {/* 会重新渲染 */}
      <button onClick={updateB}>Update B</button>
    </>
  );
}
```

### 5.3 大数据集的优化

```jsx
function LargeDataset() {
  const [items, setItems] = useState(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
  );
  
  // 不好：每次更新都拷贝整个数组
  const updateItemBad = (id, newValue) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, value: newValue }
        : item
    ));
  };
  
  // 好：使用索引避免遍历
  const updateItemGood = (index, newValue) => {
    setItems([
      ...items.slice(0, index),
      { ...items[index], value: newValue },
      ...items.slice(index + 1)
    ]);
  };
  
  // 更好：使用Map存储（规范化）
  const [itemsMap, setItemsMap] = useState(
    new Map(items.map(item => [item.id, item]))
  );
  
  const updateItemBest = (id, newValue) => {
    setItemsMap(prev => {
      const next = new Map(prev);
      const item = next.get(id);
      if (item) {
        next.set(id, { ...item, value: newValue });
      }
      return next;
    });
  };
  
  return <div>{/* ... */}</div>;
}
```

## 第六部分：常见陷阱和解决方案

### 6.1 数组方法的可变性

```jsx
function ArrayMethodTraps() {
  const [items, setItems] = useState([3, 1, 4, 1, 5]);
  
  // 危险：可变方法
  const dangerousMethods = () => {
    // 这些方法会修改原数组
    items.push(2);        // 添加
    items.pop();          // 删除末尾
    items.shift();        // 删除开头
    items.unshift(0);     // 开头添加
    items.splice(1, 1);   // 删除/插入
    items.reverse();      // 反转
    items.sort();         // 排序
    
    setItems(items);  // 引用相同，不会更新！
  };
  
  // 安全：不可变方法
  const safeMethods = () => {
    // 这些方法返回新数组
    const added = [...items, 2];                    // push
    const removedLast = items.slice(0, -1);        // pop
    const removedFirst = items.slice(1);           // shift
    const addedFirst = [0, ...items];              // unshift
    const spliced = [                              // splice
      ...items.slice(0, 1),
      ...items.slice(2)
    ];
    const reversed = [...items].reverse();         // reverse
    const sorted = [...items].sort();              // sort
    
    setItems(sorted);  // 新数组，正确更新
  };
  
  return <div>{items.join(', ')}</div>;
}
```

### 6.2 对象属性删除

```jsx
function PropertyDeletion() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com',
    phone: '123456'
  });
  
  // 错误：直接delete
  const deleteWrong = () => {
    delete user.phone;
    setUser(user);  // 引用相同，不会更新
  };
  
  // 正确：解构排除
  const deleteRight = () => {
    const { phone, ...rest } = user;
    setUser(rest);
  };
  
  // 或使用Immer
  const deleteWithImmer = () => {
    setUser(produce(draft => {
      delete draft.phone;  // Immer内可以直接delete
    }));
  };
  
  return <div>{JSON.stringify(user)}</div>;
}
```

### 6.3 引用比较问题

```jsx
function ReferenceComparison() {
  const [data, setData] = useState({ value: 1 });
  
  useEffect(() => {
    // 错误：创建相同内容的新对象
    setData({ value: 1 });
    // 引用不同，会触发无限循环
  }, [data]);  // data每次都变
  
  // 解决方案1：移除依赖
  useEffect(() => {
    if (condition) {
      setData({ value: 1 });
    }
  }, []);  // 空依赖
  
  // 解决方案2：深度比较
  useEffect(() => {
    // ...
  }, [data.value]);  // 只依赖具体值
  
  // 解决方案3：useMemo
  const memoData = useMemo(() => ({ value: 1 }), []);
  
  useEffect(() => {
    // ...
  }, [memoData]);  // 引用稳定
  
  return <div>{data.value}</div>;
}
```

## 第七部分：实战模式

### 7.1 购物车状态管理

```jsx
function ShoppingCart() {
  const [cart, setCart] = useState({
    items: [],
    total: 0
  });
  
  // 添加商品
  const addItem = (product) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.id === product.id);
      
      if (existingItem) {
        // 增加数量
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: prev.total + product.price
        };
      } else {
        // 添加新商品
        return {
          ...prev,
          items: [
            ...prev.items,
            { ...product, quantity: 1 }
          ],
          total: prev.total + product.price
        };
      }
    });
  };
  
  // 更新数量
  const updateQuantity = (productId, quantity) => {
    setCart(prev => {
      const item = prev.items.find(i => i.id === productId);
      if (!item) return prev;
      
      const priceDiff = (quantity - item.quantity) * item.price;
      
      if (quantity <= 0) {
        // 删除商品
        return {
          ...prev,
          items: prev.items.filter(i => i.id !== productId),
          total: prev.total + priceDiff
        };
      }
      
      // 更新数量
      return {
        ...prev,
        items: prev.items.map(i =>
          i.id === productId
            ? { ...i, quantity }
            : i
        ),
        total: prev.total + priceDiff
      };
    });
  };
  
  // 清空购物车
  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };
  
  return <div>{/* ... */}</div>;
}
```

### 7.2 表单状态管理

```jsx
function ComplexForm() {
  const [formState, setFormState] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      zipCode: ''
    },
    preferences: {
      newsletter: false,
      notifications: true
    }
  });
  
  // 通用更新函数
  const updateField = (section, field, value) => {
    setFormState({
      ...formState,
      [section]: {
        ...formState[section],
        [field]: value
      }
    });
  };
  
  // 使用Immer简化
  const updateFieldImmer = (section, field, value) => {
    setFormState(produce(draft => {
      draft[section][field] = value;
    }));
  };
  
  // 批量更新
  const updateSection = (section, data) => {
    setFormState({
      ...formState,
      [section]: {
        ...formState[section],
        ...data
      }
    });
  };
  
  return (
    <form>
      <input
        value={formState.personal.firstName}
        onChange={e => updateField('personal', 'firstName', e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

### 7.3 嵌套评论系统

```jsx
function Comments() {
  const [comments, setComments] = useState([
    {
      id: 1,
      text: '评论1',
      replies: [
        {
          id: 11,
          text: '回复1-1',
          replies: []
        }
      ]
    }
  ]);
  
  // 添加回复（递归更新）
  const addReply = (parentId, reply) => {
    const updateComments = (comments) => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateComments(comment.replies)
          };
        }
        
        return comment;
      });
    };
    
    setComments(updateComments(comments));
  };
  
  // 使用Immer简化
  const addReplyImmer = (parentId, reply) => {
    setComments(produce(draft => {
      const findAndAdd = (comments) => {
        for (const comment of comments) {
          if (comment.id === parentId) {
            comment.replies.push(reply);
            return true;
          }
          if (findAndAdd(comment.replies)) {
            return true;
          }
        }
        return false;
      };
      
      findAndAdd(draft);
    }));
  };
  
  return <div>{/* 递归渲染评论 */}</div>;
}
```

## 第八部分：最佳实践

### 8.1 不可变更新清单

```jsx
// 1. 对象更新：使用展开运算符
const updated = { ...original, property: newValue };

// 2. 数组更新：创建新数组
const added = [...array, newItem];
const removed = array.filter(item => item.id !== id);
const updated = array.map(item => 
  item.id === id ? { ...item, property: newValue } : item
);

// 3. 嵌套更新：逐层展开
const updated = {
  ...original,
  nested: {
    ...original.nested,
    property: newValue
  }
};

// 4. 使用Immer简化
const updated = produce(original, draft => {
  draft.nested.property = newValue;
});

// 5. 避免可变方法
// 不要用：push, pop, shift, unshift, splice, sort, reverse
// 使用：concat, slice, map, filter, reduce

// 6. 函数式更新
setState(prev => ({ ...prev, property: newValue }));

// 7. 条件更新避免无效渲染
setState(prev => 
  prev.value !== newValue ? { ...prev, value: newValue } : prev
);
```

### 8.2 性能优化建议

```jsx
// 1. 避免深拷贝
// 不要：JSON.parse(JSON.stringify(obj))
// 使用：浅拷贝 + 结构共享

// 2. 大数据集使用规范化
// 数组 → Map/Object
const normalized = {
  byId: {
    1: { id: 1, name: 'Alice' },
    2: { id: 2, name: 'Bob' }
  },
  allIds: [1, 2]
};

// 3. 使用Immer处理复杂更新
import { useImmer } from 'use-immer';

// 4. 合理使用React.memo
const Memoized = React.memo(Component);

// 5. 避免内联对象/数组
// 不好
<Component data={{ x: 1 }} />
// 好
const data = useMemo(() => ({ x: 1 }), []);
<Component data={data} />
```

## 练习题

### 基础练习

1. 实现对象和数组的不可变更新
2. 对比可变和不可变操作的差异
3. 修复直接修改State的错误代码

### 进阶练习

1. 实现嵌套对象的不可变更新
2. 使用Immer重写复杂State更新
3. 优化大数据集的不可变更新

### 高级练习

1. 实现撤销/重做功能（基于不可变性）
2. 创建通用的深度不可变更新工具
3. 对比不同不可变更新方案的性能

通过本章学习，你已经深入理解了React中State的不可变性原则。掌握不可变性是编写高质量React代码的关键，它确保了组件的可预测性和性能。继续学习，成为React状态管理专家！

