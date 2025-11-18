# React.memo深入

## 第一部分：React.memo基础

### 1.1 什么是React.memo

`React.memo`是一个高阶组件（HOC），用于对函数组件进行记忆化（memoization）。它通过浅比较props来决定是否重新渲染组件，从而优化性能。

**基本语法：**

```javascript
const MemoizedComponent = React.memo(Component);

// 或带比较函数
const MemoizedComponent = React.memo(Component, arePropsEqual);
```

### 1.2 工作原理

```javascript
// 未使用memo
function ExpensiveComponent({ value }) {
  console.log('Rendering ExpensiveComponent');
  
  // 复杂计算
  const result = heavyComputation(value);
  
  return <div>{result}</div>;
}

function Parent() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      <ExpensiveComponent value={value} />
      {/* count变化时，ExpensiveComponent也会重新渲染 */}
    </div>
  );
}

// 使用memo
const MemoizedExpensiveComponent = React.memo(ExpensiveComponent);

function Parent() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      <MemoizedExpensiveComponent value={value} />
      {/* count变化时，MemoizedExpensiveComponent不会重新渲染 */}
    </div>
  );
}

// React.memo的内部逻辑（简化）
function memo(Component, arePropsEqual) {
  return function MemoizedComponent(props) {
    const prevPropsRef = useRef();
    
    if (prevPropsRef.current) {
      const shouldSkip = arePropsEqual 
        ? arePropsEqual(prevPropsRef.current, props)
        : shallowEqual(prevPropsRef.current, props);
      
      if (shouldSkip) {
        return prevResultRef.current;  // 返回上次的结果
      }
    }
    
    prevPropsRef.current = props;
    const result = <Component {...props} />;
    prevResultRef.current = result;
    
    return result;
  };
}

function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) return true;
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  for (let key of keysA) {
    if (!Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  
  return true;
}
```

### 1.3 基础使用

```javascript
// 1. 基础memo
const SimpleComponent = React.memo(function SimpleComponent({ text }) {
  console.log('Rendering SimpleComponent');
  return <div>{text}</div>;
});

// 2. 箭头函数组件
const ArrowComponent = React.memo(({ value }) => {
  return <div>{value}</div>;
});

// 3. 命名导出
export const MemoizedButton = React.memo(Button);

// 4. 带displayName
const Component = React.memo(function Component(props) {
  return <div>{props.text}</div>;
});
Component.displayName = 'MemoizedComponent';

// 5. 内联使用（不推荐）
function Parent() {
  // ❌ 每次都会创建新的memo组件
  const Memoized = React.memo(Child);
  return <Memoized />;
}

// ✅ 推荐：组件外定义
const MemoizedChild = React.memo(Child);

function Parent() {
  return <MemoizedChild />;
}
```

### 1.4 何时使用React.memo

```javascript
// ✅ 适合使用的场景

// 1. 纯展示组件
const UserCard = React.memo(function UserCard({ user }) {
  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// 2. 重渲染频繁但props很少变化
function ParentComponent() {
  const [count, setCount] = useState(0);
  const user = { name: 'John', email: 'john@example.com' };
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      <UserCard user={user} />
      {/* user对象引用不变，UserCard不会重新渲染 */}
    </div>
  );
}

// 3. 列表项组件
const ListItem = React.memo(function ListItem({ item }) {
  return <li>{item.name}</li>;
});

function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

// 4. 昂贵的渲染
const Chart = React.memo(function Chart({ data }) {
  // 复杂的图表渲染逻辑
  return <canvas>{/* 渲染图表 */}</canvas>;
});

// ❌ 不适合使用的场景

// 1. props频繁变化
function Counter() {
  const [count, setCount] = useState(0);
  
  // 不需要memo，因为count每次都变
  return <Display count={count} />;
}

// 2. 简单组件
const Simple = React.memo(function Simple() {
  return <div>Hello</div>;
});
// 性能提升微小，反而增加复杂度

// 3. props包含复杂对象且每次都是新引用
function Bad() {
  const [count, setCount] = useState(0);
  
  const MemoizedComponent = React.memo(function Component({ data }) {
    return <div>{data.value}</div>;
  });
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      
      {/* 每次都是新对象，memo无效 */}
      <MemoizedComponent data={{ value: count }} />
    </div>
  );
}
```

## 第二部分：自定义比较函数

### 2.1 arePropsEqual函数

```javascript
// 基本语法
const MemoizedComponent = React.memo(Component, (prevProps, nextProps) => {
  // 返回true：不重新渲染
  // 返回false：重新渲染
  return prevProps.id === nextProps.id;
});

// 示例1：只比较特定prop
const UserProfile = React.memo(
  function UserProfile({ user, theme }) {
    return (
      <div className={theme}>
        <h1>{user.name}</h1>
        <p>{user.bio}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 只关心user.id是否变化
    return prevProps.user.id === nextProps.user.id;
  }
);

// 示例2：深度比较
import isEqual from 'lodash/isEqual';

const DeepMemoComponent = React.memo(
  Component,
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  }
);

// 示例3：部分prop比较
const PartialCompare = React.memo(
  function Component({ id, name, metadata }) {
    return <div>{name}</div>;
  },
  (prevProps, nextProps) => {
    // 忽略metadata变化
    return (
      prevProps.id === nextProps.id &&
      prevProps.name === nextProps.name
    );
  }
);

// 示例4：数组prop比较
const ArrayCompare = React.memo(
  function List({ items }) {
    return (
      <ul>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    );
  },
  (prevProps, nextProps) => {
    // 比较数组长度和内容
    if (prevProps.items.length !== nextProps.items.length) {
      return false;
    }
    
    return prevProps.items.every((item, index) => 
      item === nextProps.items[index]
    );
  }
);

// 示例5：性能优化的比较
const OptimizedCompare = React.memo(
  Component,
  (prevProps, nextProps) => {
    // 快速路径：引用相等
    if (prevProps === nextProps) return true;
    
    // 快速路径：检查关键prop
    if (prevProps.id !== nextProps.id) return false;
    
    // 深度比较其他prop
    return isEqual(prevProps.data, nextProps.data);
  }
);
```

### 2.2 常见比较模式

```javascript
// 1. ID比较（常用于列表项）
const ListItem = React.memo(
  function ListItem({ item }) {
    return <div>{item.name}</div>;
  },
  (prev, next) => prev.item.id === next.item.id
);

// 2. 版本号比较
const VersionedComponent = React.memo(
  function Component({ data, version }) {
    return <div>{data.content}</div>;
  },
  (prev, next) => prev.version === next.version
);

// 3. 时间戳比较
const TimestampComponent = React.memo(
  function Component({ data, updatedAt }) {
    return <div>{data.value}</div>;
  },
  (prev, next) => prev.updatedAt === next.updatedAt
);

// 4. 哈希比较
const HashCompare = React.memo(
  function Component({ data }) {
    return <div>{JSON.stringify(data)}</div>;
  },
  (prev, next) => {
    return hash(prev.data) === hash(next.data);
  }
);

function hash(obj) {
  return JSON.stringify(obj);
}

// 5. 选择性字段比较
const SelectiveCompare = React.memo(
  function Component({ user, settings, theme }) {
    return <div className={theme}>{user.name}</div>;
  },
  (prev, next) => {
    // 只比较实际使用的prop
    return (
      prev.user.name === next.user.name &&
      prev.theme === next.theme
    );
    // 忽略settings变化
  }
);

// 6. 复杂对象比较
const ComplexCompare = React.memo(
  Component,
  (prev, next) => {
    // 先比较简单值
    if (prev.id !== next.id) return false;
    if (prev.type !== next.type) return false;
    
    // 再比较复杂对象
    if (prev.config && next.config) {
      return JSON.stringify(prev.config) === JSON.stringify(next.config);
    }
    
    return prev.config === next.config;
  }
);
```

## 第三部分：实战应用

### 3.1 列表优化

```javascript
// 列表项memo
const TodoItem = React.memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log('Rendering TodoItem:', todo.id);
  
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </li>
  );
});

function TodoList() {
  const [todos, setTodos] = useState([]);
  
  // ❌ 问题：每次都创建新函数
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={(id) => {/* ... */}}  // 新函数
          onDelete={(id) => {/* ... */}}  // 新函数
        />
      ))}
    </ul>
  );
  // memo无效！函数props每次都是新的
}

// ✅ 解决方案1：useCallback
function TodoList() {
  const [todos, setTodos] = useState([]);
  
  const handleToggle = useCallback((id) => {
    setTodos(prev => 
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);
  
  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}  // 稳定引用
          onDelete={handleDelete}  // 稳定引用
        />
      ))}
    </ul>
  );
}

// ✅ 解决方案2：自定义比较（忽略函数prop）
const TodoItem = React.memo(
  function TodoItem({ todo, onToggle, onDelete }) {
    return (
      <li>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span>{todo.text}</span>
        <button onClick={() => onDelete(todo.id)}>删除</button>
      </li>
    );
  },
  (prevProps, nextProps) => {
    // 只比较todo，忽略函数
    return prevProps.todo === nextProps.todo;
  }
);
```

### 3.2 复杂对象props

```javascript
// 问题：对象prop每次都是新引用
function Parent() {
  const [count, setCount] = useState(0);
  
  const MemoChild = React.memo(Child);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      
      {/* 每次都是新对象，memo无效 */}
      <MemoChild config={{ theme: 'dark', size: 'large' }} />
    </div>
  );
}

// 解决方案1：useMemo稳定对象引用
function Parent() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({
    theme: 'dark',
    size: 'large'
  }), []);  // 稳定引用
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      <MemoChild config={config} />
    </div>
  );
}

// 解决方案2：提取到常量
const CONFIG = { theme: 'dark', size: 'large' };

function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      <MemoChild config={CONFIG} />
    </div>
  );
}

// 解决方案3：分离props
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Inc</button>
      <MemoChild theme="dark" size="large" />
    </div>
  );
}

const MemoChild = React.memo(function Child({ theme, size }) {
  return <div className={`${theme} ${size}`}>Content</div>;
});
```

### 3.3 Context配合使用

```javascript
// 问题：Context变化导致所有组件重新渲染
const ThemeContext = React.createContext();

function App() {
  const [theme, setTheme] = useState('light');
  const [count, setCount] = useState(0);
  
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      
      <ExpensiveTree />
      {/* count变化，ExpensiveTree也重新渲染 */}
    </ThemeContext.Provider>
  );
}

// 解决方案1：memo隔离
const MemoizedExpensiveTree = React.memo(ExpensiveTree);

function App() {
  const [theme, setTheme] = useState('light');
  const [count, setCount] = useState(0);
  
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      
      <MemoizedExpensiveTree />
      {/* count变化，不影响ExpensiveTree */}
    </ThemeContext.Provider>
  );
}

// 解决方案2：拆分Context
const ThemeContext = React.createContext();
const CountContext = React.createContext();

function App() {
  const [theme, setTheme] = useState('light');
  const [count, setCount] = useState(0);
  
  return (
    <ThemeContext.Provider value={theme}>
      <CountContext.Provider value={count}>
        <ExpensiveTree />
      </CountContext.Provider>
    </ThemeContext.Provider>
  );
}

// ExpensiveTree只订阅Theme
function ExpensiveTree() {
  const theme = useContext(ThemeContext);
  // 不订阅CountContext，所以count变化不影响
  return <div className={theme}>Tree</div>;
}
```

### 3.4 高阶组件配合

```javascript
// HOC + memo
function withLogging(Component) {
  return React.memo(function WithLogging(props) {
    useEffect(() => {
      console.log('Component rendered with props:', props);
    });
    
    return <Component {...props} />;
  });
}

const LoggedButton = withLogging(Button);

// memo + HOC
const MemoizedComponent = React.memo(Component);
const EnhancedComponent = withSomeFeature(MemoizedComponent);

// 顺序很重要
// ✅ 正确：先memo再HOC
const Good = withFeature(React.memo(Component));

// ❌ 错误：先HOC再memo可能无效
const Bad = React.memo(withFeature(Component));
// 如果withFeature每次返回新组件，memo无效
```

## 第四部分：性能优化技巧

### 4.1 避免过度使用

```javascript
// ❌ 过度使用
const App = React.memo(function App() {
  return (
    <div>
      {React.memo(() => <Header />)}
      {React.memo(() => <Main />)}
      {React.memo(() => <Footer />)}
    </div>
  );
});

// ✅ 合理使用
function App() {
  return (
    <div>
      <Header />  {/* 简单组件无需memo */}
      <MemoizedMain />  {/* 复杂组件使用memo */}
      <Footer />
    </div>
  );
}

const MemoizedMain = React.memo(Main);
```

### 4.2 配合性能分析

```javascript
// 使用React DevTools Profiler
import { Profiler } from 'react';

function App() {
  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    console.log({
      id,
      phase,
      actualDuration,
      baseDuration
    });
  };
  
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MemoizedComponent />
    </Profiler>
  );
}

// 条件性memo
function conditionalMemo(Component, shouldMemoize) {
  return shouldMemoize ? React.memo(Component) : Component;
}

const MyComponent = conditionalMemo(
  Component,
  process.env.NODE_ENV === 'production'
);
```

### 4.3 组合优化模式

```javascript
// useMemo + React.memo
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return heavyProcessing(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});

// useCallback + React.memo
const ChildComponent = React.memo(function ChildComponent({ onClick }) {
  return <button onClick={onClick}>Click</button>;
});

function ParentComponent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <ChildComponent onClick={handleClick} />;
}

// 完整优化示例
function OptimizedApp() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  
  // memo化过滤结果
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'all') return true;
      return item.status === filter;
    });
  }, [items, filter]);
  
  // memo化回调
  const handleItemClick = useCallback((id) => {
    setItems(prev => 
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);
  
  return (
    <div>
      <FilterBar value={filter} onChange={setFilter} />
      
      <MemoizedItemList 
        items={filteredItems}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

const MemoizedItemList = React.memo(ItemList);
```

## 注意事项

### 1. props稳定性

```javascript
// ❌ 不稳定的props
function Bad() {
  return <MemoComponent data={{ value: 1 }} />; // 每次新对象
}

// ✅ 稳定的props
const DATA = { value: 1 };
function Good() {
  return <MemoComponent data={DATA} />;
}
```

### 2. 子组件也需优化

```javascript
// React.memo只阻止自身重新渲染
// 子组件仍可能重新渲染
const Parent = React.memo(function Parent() {
  return <Child />;  // Child可能重新渲染
});

const Child = React.memo(function Child() {
  return <div>Child</div>;
});
```

### 3. 开发vs生产

```javascript
// 开发环境：严格模式会调用两次
// React.memo在开发环境可能看起来无效

// 生产环境：正常优化
```

## 常见问题

### Q1: React.memo和useMemo的区别？

**A:** React.memo用于组件，useMemo用于值。

### Q2: React.memo会影响性能吗？

**A:** 比较本身有开销，简单组件可能得不偿失。

### Q3: 默认的浅比较够用吗？

**A:** 大多数情况够用，复杂场景需自定义比较。

### Q4: memo的组件可以有state吗？

**A:** 可以，state变化仍会重新渲染。

### Q5: 如何调试memo是否生效？

**A:** 使用console.log或React DevTools Profiler。

### Q6: memo能阻止Context变化的重新渲染吗？

**A:** 不能，组件使用Context时仍会重新渲染。

### Q7: 所有组件都应该用memo吗？

**A:** 不应该，根据实际需求和性能分析决定。

### Q8: memo和PureComponent的区别？

**A:** memo用于函数组件，PureComponent用于类组件。

### Q9: memo的比较函数可以异步吗？

**A:** 不可以，必须同步返回结果。

### Q10: React 19对memo有什么改进？

**A:** 编译器可能自动优化，减少手动memo需求。

## 总结

### 核心要点

```
1. React.memo作用
   ✅ 避免不必要的重新渲染
   ✅ 浅比较props
   ✅ 自定义比较函数
   ✅ 性能优化

2. 使用场景
   ✅ 纯展示组件
   ✅ 列表项组件
   ✅ 昂贵渲染
   ✅ props稳定的组件

3. 注意事项
   ❌ 过度使用
   ❌ props不稳定
   ❌ 简单组件
   ❌ 频繁变化的props
```

### 最佳实践

```
1. 何时使用
   ✅ 性能分析后
   ✅ 确认有性能问题
   ✅ props相对稳定
   ✅ 渲染开销大

2. 如何使用
   ✅ 配合useCallback/useMemo
   ✅ 稳定props引用
   ✅ 合理的比较函数
   ✅ 测试验证效果

3. 性能优化
   ✅ 避免过度优化
   ✅ 测量实际收益
   ✅ 权衡复杂度
   ✅ 持续监控
```

React.memo是性能优化的重要工具,但需要在正确的场景下合理使用才能发挥最大效果。

## 第五部分：深入原理

### 5.1 React.memo源码解析

```javascript
// React.memo源码简化版本
function memo(type, compare) {
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  };

  return elementType;
}

// React内部的比较逻辑
function checkPropTypes(Component, element, fiber) {
  const prevProps = fiber.memoizedProps;
  const nextProps = element.props;

  // 获取比较函数
  const compare = fiber.type.compare;

  // 使用自定义比较或默认浅比较
  if (compare !== null) {
    return compare(prevProps, nextProps);
  }

  return shallowEqual(prevProps, nextProps);
}

// 默认的浅比较实现
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !hasOwnProperty.call(objB, currentKey) ||
      !is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}

// Object.is polyfill
function is(x, y) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
  );
}
```

### 5.2 Fiber架构中的memo

```javascript
// React Fiber中的memo节点处理
function updateMemoComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  if (current === null) {
    // 初次挂载
    const type = Component.type;
    const child = createFiberFromTypeAndProps(
      type,
      null,
      nextProps,
      workInProgress,
      workInProgress.mode,
      renderLanes
    );
    child.ref = workInProgress.ref;
    child.return = workInProgress;
    workInProgress.child = child;
    return child;
  }

  const currentChild = current.child;
  const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
    current,
    renderLanes
  );

  if (!hasScheduledUpdateOrContext) {
    // 没有待处理的更新，检查props
    const prevProps = currentChild.memoizedProps;
    let compare = Component.compare;
    compare = compare !== null ? compare : shallowEqual;

    if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
      // Props相同，复用子节点
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
  }

  // Props变化或有context更新，重新渲染
  const newChild = createWorkInProgress(currentChild, nextProps);
  newChild.ref = workInProgress.ref;
  newChild.return = workInProgress;
  workInProgress.child = newChild;
  return newChild;
}

// bailout机制
function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
  // 标记为不需要更新
  workInProgress.lanes = NoLanes;

  // 克隆子节点
  cloneChildFibers(current, workInProgress);

  return workInProgress.child;
}
```

### 5.3 memo与渲染优化

```javascript
// React.memo的渲染优化流程
class MemoOptimizationExample extends React.Component {
  render() {
    console.log('Parent rendering');

    return (
      <div>
        <MemoizedChild value={this.props.value} />
      </div>
    );
  }
}

const MemoizedChild = React.memo(function Child({ value }) {
  console.log('Child rendering');
  return <div>{value}</div>;
});

// Fiber树的更新流程：
// 1. Parent组件触发更新
// 2. 进入Parent的render方法
// 3. 遇到MemoizedChild，检查props
// 4. 如果props相同，跳过Child的render
// 5. 复用之前的Fiber节点
// 6. 继续处理其他子节点

// 性能对比
function PerformanceComparison() {
  const [count, setCount] = useState(0);
  const [value, setValue] = useState(0);

  // 未使用memo的组件
  function RegularChild({ value }) {
    console.log('Regular child rendered');
    // 模拟昂贵的计算
    const result = expensiveCalculation(value);
    return <div>{result}</div>;
  }

  // 使用memo的组件
  const MemoChild = React.memo(function MemoChild({ value }) {
    console.log('Memo child rendered');
    const result = expensiveCalculation(value);
    return <div>{result}</div>;
  });

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Increment Count: {count}
      </button>

      <h3>Regular (renders on every parent update):</h3>
      <RegularChild value={value} />

      <h3>Memoized (only renders when value changes):</h3>
      <MemoChild value={value} />

      <button onClick={() => setValue(v => v + 1)}>
        Change Value: {value}
      </button>
    </div>
  );
}
```

### 5.4 memo与并发特性

```javascript
// React 18+中的memo与并发渲染
import { memo, useState, useTransition, useDeferredValue } from 'react';

// memo与useTransition配合
function TransitionWithMemo() {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState('');
  const [items] = useState(generateItems(1000));

  const handleChange = (e) => {
    startTransition(() => {
      setFilter(e.target.value);
    });
  };

  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {isPending && <div>Loading...</div>}
      <FilteredList items={items} filter={filter} />
    </div>
  );
}

// memo组件接收transition状态
const FilteredList = memo(function FilteredList({ items, filter }) {
  console.log('FilteredList rendering');

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ul>
      {filtered.map(item => (
        <MemoizedListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}, (prevProps, nextProps) => {
  // 只在filter真正变化时更新
  return prevProps.filter === nextProps.filter;
});

// memo与useDeferredValue
function DeferredWithMemo() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Search..."
      />

      <MemoizedSearchResults query={deferredInput} />
    </div>
  );
}

const MemoizedSearchResults = memo(function SearchResults({ query }) {
  const results = useMemo(() => {
    return performExpensiveSearch(query);
  }, [query]);

  return (
    <ul>
      {results.map(result => (
        <li key={result.id}>{result.text}</li>
      ))}
    </ul>
  );
});

// memo与Suspense
function SuspenseWithMemo() {
  const [resource, setResource] = useState(null);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemoizedDataDisplay resource={resource} />
    </Suspense>
  );
}

const MemoizedDataDisplay = memo(function DataDisplay({ resource }) {
  const data = resource.read();

  return (
    <div>
      {data.map(item => (
        <MemoizedItem key={item.id} item={item} />
      ))}
    </div>
  );
});

const MemoizedItem = memo(function Item({ item }) {
  return <div>{item.name}</div>;
});
```

## 第六部分：高级模式

### 6.1 选择性memo

```javascript
// 智能memo：根据条件决定是否比较
function smartMemo(Component, shouldMemoize = () => true) {
  return function SmartMemoComponent(props) {
    const prevPropsRef = useRef(props);
    const resultRef = useRef(null);

    if (shouldMemoize(props)) {
      // 需要memo时进行比较
      if (prevPropsRef.current && shallowEqual(prevPropsRef.current, props)) {
        return resultRef.current;
      }
    }

    prevPropsRef.current = props;
    resultRef.current = <Component {...props} />;
    return resultRef.current;
  };
}

// 使用
const SmartComponent = smartMemo(
  ExpensiveComponent,
  (props) => {
    // 只在特定条件下启用memo
    return props.items.length > 100;
  }
);

// 环境特定的memo
const ConditionalMemo = process.env.NODE_ENV === 'production'
  ? memo(Component)
  : Component;

// 基于性能指标的动态memo
function useDynamicMemo(Component) {
  const [shouldMemo, setShouldMemo] = useState(false);
  const renderTimeRef = useRef([]);

  useEffect(() => {
    const avgRenderTime = renderTimeRef.current.reduce((a, b) => a + b, 0) / renderTimeRef.current.length;

    // 如果平均渲染时间>50ms，启用memo
    if (avgRenderTime > 50) {
      setShouldMemo(true);
    }
  }, []);

  const onRender = useCallback((id, phase, actualDuration) => {
    renderTimeRef.current.push(actualDuration);

    if (renderTimeRef.current.length > 10) {
      renderTimeRef.current.shift();
    }
  }, []);

  const MemoComponent = useMemo(() => {
    return shouldMemo ? memo(Component) : Component;
  }, [shouldMemo]);

  return { MemoComponent, onRender };
}
```

### 6.2 深度memo模式

```javascript
// 深度props比较的memo
function deepMemo(Component) {
  return memo(Component, (prevProps, nextProps) => {
    return deepEqual(prevProps, nextProps);
  });
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
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

// 使用deep memo
const DeepMemoComponent = deepMemo(function Component({ config, data }) {
  return (
    <div>
      <ConfigDisplay config={config} />
      <DataDisplay data={data} />
    </div>
  );
});

// 选择性深度比较
function selectiveDeepMemo(Component, deepKeys = []) {
  return memo(Component, (prevProps, nextProps) => {
    const allKeys = [...new Set([...Object.keys(prevProps), ...Object.keys(nextProps)])];

    for (const key of allKeys) {
      const shouldDeepCompare = deepKeys.includes(key);

      if (shouldDeepCompare) {
        if (!deepEqual(prevProps[key], nextProps[key])) {
          return false;
        }
      } else {
        if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      }
    }

    return true;
  });
}

// 使用
const SelectiveDeepComponent = selectiveDeepMemo(
  Component,
  ['config', 'settings']  // 只对这些prop进行深度比较
);
```

### 6.3 memo工厂模式

```javascript
// memo组件工厂
function createMemoizedComponent(renderFn, options = {}) {
  const {
    displayName,
    compare,
    propsWhitelist,
    propsBlacklist,
  } = options;

  let Component = function(props) {
    // 过滤props
    let filteredProps = { ...props };

    if (propsWhitelist) {
      filteredProps = {};
      propsWhitelist.forEach(key => {
        filteredProps[key] = props[key];
      });
    }

    if (propsBlacklist) {
      propsBlacklist.forEach(key => {
        delete filteredProps[key];
      });
    }

    return renderFn(filteredProps);
  };

  if (displayName) {
    Component.displayName = displayName;
  }

  if (compare) {
    Component = memo(Component, compare);
  } else {
    Component = memo(Component);
  }

  return Component;
}

// 使用工厂
const UserCard = createMemoizedComponent(
  ({ user, theme }) => (
    <div className={theme}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  ),
  {
    displayName: 'UserCard',
    propsWhitelist: ['user', 'theme'],
    compare: (prev, next) => prev.user.id === next.user.id
  }
);

// 批量创建memo组件
function createMemoComponents(components) {
  return Object.entries(components).reduce((acc, [name, config]) => {
    acc[name] = createMemoizedComponent(config.render, config.options);
    return acc;
  }, {});
}

const components = createMemoComponents({
  Header: {
    render: ({ title }) => <header><h1>{title}</h1></header>,
    options: { displayName: 'Header' }
  },
  Footer: {
    render: ({ text }) => <footer>{text}</footer>,
    options: { displayName: 'Footer' }
  }
});
```

### 6.4 memo与测试

```javascript
// 测试memo组件
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MemoizedComponent', () => {
  it('should not re-render when props are unchanged', () => {
    const renderSpy = jest.fn();

    const TestComponent = memo(function TestComponent({ value }) {
      renderSpy();
      return <div>{value}</div>;
    });

    const { rerender } = render(<TestComponent value="test" />);

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 相同props重新渲染
    rerender(<TestComponent value="test" />);

    // 应该仍然是1次
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 不同props重新渲染
    rerender(<TestComponent value="changed" />);

    // 现在应该是2次
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it('should use custom comparison function', () => {
    const renderSpy = jest.fn();

    const TestComponent = memo(
      function TestComponent({ user }) {
        renderSpy();
        return <div>{user.name}</div>;
      },
      (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
    );

    const user1 = { id: 1, name: 'John' };
    const user2 = { id: 1, name: 'John Doe' };
    const user3 = { id: 2, name: 'Jane' };

    const { rerender } = render(<TestComponent user={user1} />);

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 相同ID，不同name，不应重新渲染
    rerender(<TestComponent user={user2} />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 不同ID，应该重新渲染
    rerender(<TestComponent user={user3} />);
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle function props correctly', () => {
    const onClick = jest.fn();
    const renderSpy = jest.fn();

    const Button = memo(function Button({ onClick, label }) {
      renderSpy();
      return <button onClick={onClick}>{label}</button>;
    });

    const { rerender } = render(<Button onClick={onClick} label="Click" />);

    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 相同函数引用，不应重新渲染
    rerender(<Button onClick={onClick} label="Click" />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 新函数引用，应该重新渲染
    rerender(<Button onClick={() => {}} label="Click" />);
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});

// 性能测试
describe('MemoizedComponent Performance', () => {
  it('should improve performance for expensive renders', () => {
    const expensiveOperation = (items) => {
      return items.map(item => {
        // 模拟昂贵操作
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += i;
        }
        return { ...item, result };
      });
    };

    const RegularComponent = ({ items }) => {
      const processed = expensiveOperation(items);
      return <div>{processed.length}</div>;
    };

    const MemoComponent = memo(({ items }) => {
      const processed = expensiveOperation(items);
      return <div>{processed.length}</div>;
    });

    const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

    // 测试Regular组件
    const regularStart = performance.now();
    const { rerender: rerenderRegular } = render(<RegularComponent items={items} />);
    rerenderRegular(<RegularComponent items={items} />);
    const regularTime = performance.now() - regularStart;

    // 测试Memo组件
    const memoStart = performance.now();
    const { rerender: rerenderMemo } = render(<MemoComponent items={items} />);
    rerenderMemo(<MemoComponent items={items} />);
    const memoTime = performance.now() - memoStart;

    // Memo应该明显更快
    expect(memoTime).toBeLessThan(regularTime);
  });
});
```

## 第七部分：调试技巧

### 7.1 为什么重新渲染了

```javascript
// 调试工具：检测渲染原因
function useRenderReason(componentName, props) {
  const prevProps = useRef(props);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    if (prevProps.current) {
      const changedProps = Object.keys(props).reduce((acc, key) => {
        if (prevProps.current[key] !== props[key]) {
          acc[key] = {
            from: prevProps.current[key],
            to: props[key]
          };
        }
        return acc;
      }, {});

      if (Object.keys(changedProps).length > 0) {
        console.log(`[${componentName}] Render #${renderCount.current}:`);
        console.table(changedProps);
      } else {
        console.log(`[${componentName}] Render #${renderCount.current}: No prop changes detected`);
      }
    }

    prevProps.current = props;
  });
}

// 使用
const MemoComponent = memo(function Component(props) {
  useRenderReason('MemoComponent', props);

  return <div>{props.value}</div>;
});

// 可视化渲染工具
function RenderVisualizer({ children, label }) {
  const [renderCount, setRenderCount] = useState(0);
  const prevRenderTime = useRef(Date.now());

  useEffect(() => {
    setRenderCount(c => c + 1);
    const now = Date.now();
    const timeSinceLastRender = now - prevRenderTime.current;
    prevRenderTime.current = now;

    console.log(`[${label}] Rendered ${renderCount} times. Time since last render: ${timeSinceLastRender}ms`);
  });

  return (
    <div style={{ border: `2px solid ${renderCount % 2 === 0 ? 'blue' : 'red'}`, padding: '10px' }}>
      <div style={{ fontSize: '12px', color: 'gray' }}>
        {label}: {renderCount} renders
      </div>
      {children}
    </div>
  );
}

// 使用
function App() {
  return (
    <RenderVisualizer label="App">
      <MemoizedChild />
    </RenderVisualizer>
  );
}
```

### 7.2 Props比较调试

```javascript
// Props差异可视化
function usePropsComparison(componentName, props) {
  const prevPropsRef = useRef();

  useEffect(() => {
    if (prevPropsRef.current) {
      const changes = compareProps(prevPropsRef.current, props);

      if (changes.length > 0) {
        console.group(`%c[${componentName}] Props Changed`, 'color: orange; font-weight: bold');

        changes.forEach(({ key, prev, next, type }) => {
          console.log(
            `%c${key}%c changed`,
            'color: blue',
            'color: black',
            {
              type,
              from: prev,
              to: next
            }
          );
        });

        console.groupEnd();
      }
    }

    prevPropsRef.current = props;
  });
}

function compareProps(prev, next) {
  const changes = [];
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

  allKeys.forEach(key => {
    if (prev[key] !== next[key]) {
      changes.push({
        key,
        prev: prev[key],
        next: next[key],
        type: determineChangeType(prev[key], next[key])
      });
    }
  });

  return changes;
}

function determineChangeType(prev, next) {
  if (typeof prev !== typeof next) return 'type-change';
  if (typeof prev === 'object') return 'reference-change';
  if (typeof prev === 'function') return 'function-change';
  return 'value-change';
}

// DevTools集成
function useMemoDebugger(Component) {
  if (process.env.NODE_ENV !== 'development') {
    return Component;
  }

  return memo(function DebugWrapper(props) {
    usePropsComparison(Component.displayName || Component.name, props);

    return <Component {...props} />;
  });
}
```

### 7.3 性能基准测试

```javascript
// memo性能基准
function benchmarkMemo(Component, props, iterations = 1000) {
  const MemoComponent = memo(Component);

  // 测试普通组件
  const regularStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    renderToString(<Component {...props} />);
  }
  const regularTime = performance.now() - regularStart;

  // 测试memo组件
  const memoStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    renderToString(<MemoComponent {...props} />);
  }
  const memoTime = performance.now() - memoStart;

  return {
    regular: regularTime,
    memo: memoTime,
    improvement: ((regularTime - memoTime) / regularTime * 100).toFixed(2) + '%'
  };
}

// 自动化性能测试
function createPerformanceTest(Component, testCases) {
  return function runTests() {
    console.group('Performance Test Results');

    testCases.forEach(({ name, props, iterations }) => {
      const results = benchmarkMemo(Component, props, iterations);

      console.log(`Test: ${name}`);
      console.log(`Regular: ${results.regular.toFixed(2)}ms`);
      console.log(`Memo: ${results.memo.toFixed(2)}ms`);
      console.log(`Improvement: ${results.improvement}`);
      console.log('---');
    });

    console.groupEnd();
  };
}

// 使用
const perfTest = createPerformanceTest(ExpensiveComponent, [
  {
    name: 'Small dataset',
    props: { items: generateItems(10) },
    iterations: 1000
  },
  {
    name: 'Large dataset',
    props: { items: generateItems(1000) },
    iterations: 100
  }
]);

perfTest();
```

## 总结强化

### 核心知识点回顾

```
1. React.memo原理
   - 浅比较props
   - 自定义比较函数
   - Fiber架构集成
   - bailout机制

2. 优化策略
   - 稳定props引用
   - 配合useCallback/useMemo
   - 选择性memo
   - 性能监控

3. 高级用法
   - 深度比较
   - 条件memo
   - 工厂模式
   - 并发特性集成

4. 调试技巧
   - 渲染追踪
   - Props对比
   - 性能基准
   - 可视化工具
```

### 实战检查清单

```
开发阶段：
☐ 识别需要优化的组件
☐ 分析props变化频率
☐ 选择合适的比较策略
☐ 实施memo优化
☐ 验证优化效果

测试阶段：
☐ 单元测试memo行为
☐ 性能基准测试
☐ 边界情况测试
☐ 回归测试

生产环境：
☐ 监控渲染性能
☐ 收集用户反馈
☐ 持续优化迭代
☐ 文档更新维护
```

React.memo是性能优化的重要工具，掌握其原理和最佳实践能显著提升应用性能。

