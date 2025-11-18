# Hooks调用顺序原理

## 学习目标

通过本章学习，你将深入理解：

- Hooks调用顺序的重要性
- React如何追踪Hook调用
- 违反规则会导致什么问题
- 编译时和运行时的检查机制
- ESLint规则的工作原理
- 条件渲染的正确处理方式
- 动态Hook数量的解决方案
- React 19的改进

## 第一部分：调用顺序的本质

### 1.1 Hook位置索引机制

React通过位置索引来追踪Hooks：

```javascript
//每个Hook在链表中有固定位置

function Component() {
  useState(0);     // 索引 0
  useState('');    // 索引 1
  useEffect(() => {}); // 索引 2
  useMemo(() => {}); // 索引 3
}

// React内部维护一个currentHookIndex
let currentHookIndex = 0;

function useState(initialState) {
  const index = currentHookIndex++;
  // 使用index获取对应的Hook
  const hook = getHookAtIndex(index);
  return [hook.state, hook.setState];
}
```

**完整流程：**

```javascript
// 首次渲染
function Component() {
  // currentHookIndex = 0
  const [count, setCount] = useState(0);     // 创建Hook0
  // currentHookIndex = 1
  const [name, setName] = useState('');      // 创建Hook1
  // currentHookIndex = 2
  useEffect(() => {}, []);                   // 创建Hook2
  
  return <div>{count} - {name}</div>;
}

// Hooks链表：
// 索引0: Hook(count)
// 索引1: Hook(name)
// 索引2: Hook(effect)

// 更新渲染
function Component() {
  // currentHookIndex = 0
  const [count, setCount] = useState(0);     // 获取Hook0
  // currentHookIndex = 1
  const [name, setName] = useState('');      // 获取Hook1
  // currentHookIndex = 2
  useEffect(() => {}, []);                   // 获取Hook2
  
  return <div>{count} - {name}</div>;
}

// React匹配：
// 索引0 → count
// 索引1 → name
// 索引2 → effect
```

### 1.2 顺序改变的后果

```javascript
// 初始渲染（条件为true）
function BadComponent({ condition }) {
  // 索引0
  const [count, setCount] = useState(0);
  
  if (condition) {
    // 索引1
    const [temp, setTemp] = useState('temp');
  }
  
  // 索引2（condition=true）或 索引1（condition=false）
  const [name, setName] = useState('Alice');
  
  return <div>{count} - {name}</div>;
}

// 第一次渲染（condition=true）：
// 索引0: count
// 索引1: temp  
// 索引2: name

// 第二次渲染（condition=false）：
// 索引0: count
// 索引1: name  ❌ 错误！React认为这是temp
// 索引2: ???   ❌ name去哪了？

// 结果：状态完全错乱！
```

### 1.3 正确的条件处理

```javascript
// ✅ 方案1：将条件放在Hook外部
function GoodComponent1({ condition }) {
  const [count, setCount] = useState(0);
  const [temp, setTemp] = useState('temp');
  const [name, setName] = useState('Alice');
  
  // 根据条件使用状态
  const displayTemp = condition ? temp : null;
  
  return (
    <div>
      {count}
      {displayTemp && <span>{displayTemp}</span>}
      {name}
    </div>
  );
}

// ✅ 方案2：将条件组件拆分
function GoodComponent2({ condition }) {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  
  return (
    <div>
      {count}
      {condition && <ConditionalPart />}
      {name}
    </div>
  );
}

function ConditionalPart() {
  const [temp, setTemp] = useState('temp');
  return <span>{temp}</span>;
}

// ✅ 方案3：使用多个组件
function GoodComponent3({ condition }) {
  return condition ? <ComponentA /> : <ComponentB />;
}

function ComponentA() {
  const [count, setCount] = useState(0);
  const [temp, setTemp] = useState('temp');
  return <div>{count} - {temp}</div>;
}

function ComponentB() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
```

## 第二部分：React的追踪机制

### 2.1 Hook调用追踪

```javascript
// React内部的Hook调用追踪（简化版）

// 全局变量
let currentlyRenderingFiber = null;  // 当前渲染的Fiber
let currentHook = null;              // 当前Hook（更新时）
let workInProgressHook = null;       // 工作中的Hook

// 组件渲染入口
function renderWithHooks(fiber, Component, props) {
  // 1. 设置当前渲染的Fiber
  currentlyRenderingFiber = fiber;
  
  // 2. 重置Hook指针
  currentHook = fiber.alternate?.memoizedState || null;
  workInProgressHook = null;
  
  // 3. 执行组件函数
  const children = Component(props);
  
  // 4. 清理
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
  
  return children;
}

// useState实现
function useState(initialState) {
  // 判断是mount还是update
  if (currentlyRenderingFiber.alternate === null) {
    // Mount阶段
    return mountState(initialState);
  } else {
    // Update阶段
    return updateState(initialState);
  }
}

// Mount阶段
function mountState(initialState) {
  // 创建新Hook
  const hook = {
    memoizedState: initialState,
    next: null,
    queue: { /* ... */ }
  };
  
  // 添加到链表
  if (workInProgressHook === null) {
    // 第一个Hook
    currentlyRenderingFiber.memoizedState = hook;
    workInProgressHook = hook;
  } else {
    // 后续Hook
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }
  
  return [hook.memoizedState, dispatchAction];
}

// Update阶段
function updateState(initialState) {
  // 获取对应的Hook
  const hook = updateWorkInProgressHook();
  
  // 处理更新...
  
  return [hook.memoizedState, hook.queue.dispatch];
}

function updateWorkInProgressHook() {
  // 从current树获取Hook
  let nextCurrentHook;
  if (currentHook === null) {
    // 第一个Hook
    nextCurrentHook = currentlyRenderingFiber.alternate.memoizedState;
  } else {
    // 后续Hook
    nextCurrentHook = currentHook.next;
  }
  
  // 移动指针
  currentHook = nextCurrentHook;
  
  // 创建workInProgress Hook
  const newHook = {
    memoizedState: nextCurrentHook.memoizedState,
    next: null,
    queue: nextCurrentHook.queue
  };
  
  // 添加到workInProgress链表
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = newHook;
    workInProgressHook = newHook;
  } else {
    workInProgressHook.next = newHook;
    workInProgressHook = newHook;
  }
  
  return workInProgressHook;
}
```

### 2.2 Hook数量检测

```javascript
// React如何检测Hook数量变化

// Mount阶段记录Hook数量
function renderWithHooks(fiber, Component, props) {
  let hookCount = 0;
  
  // 包装useState以计数
  const originalUseState = React.useState;
  React.useState = function(initialState) {
    hookCount++;
    return originalUseState(initialState);
  };
  
  // 执行组件
  Component(props);
  
  // 保存Hook数量
  fiber.hookCount = hookCount;
  
  // 恢复原始函数
  React.useState = originalUseState;
}

// Update阶段检查Hook数量
function checkHookCount(fiber, newHookCount) {
  const prevHookCount = fiber.alternate?.hookCount;
  
  if (prevHookCount !== undefined && prevHookCount !== newHookCount) {
    console.error(
      'React detected a change in the order of Hooks called by Component. ' +
      'This will lead to bugs and errors if not fixed.'
    );
  }
}
```

## 第三部分：违反规则的场景

### 3.1 条件调用Hook

```javascript
// ❌ 场景1：if语句中调用Hook
function BadComponent1({ isLoggedIn }) {
  const [user, setUser] = useState(null);
  
  if (isLoggedIn) {
    // ❌ 条件Hook
    const [profile, setProfile] = useState(null);
  }
  
  return <div>{user?.name}</div>;
}

// 问题：
// isLoggedIn=true时：  Hook0(user), Hook1(profile)
// isLoggedIn=false时： Hook0(user)
// Hook数量不一致！

// ✅ 解决方案：提升Hook到顶层
function GoodComponent1({ isLoggedIn }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);  // 始终调用
  
  return (
    <div>
      {user?.name}
      {isLoggedIn && profile && <Profile data={profile} />}
    </div>
  );
}
```

```javascript
// ❌ 场景2：三元运算符中调用Hook
function BadComponent2({ type }) {
  const data = type === 'user' 
    ? useState(null)    // ❌ 条件Hook
    : useReducer(reducer, initialState);  // ❌ 条件Hook
  
  return <div>{/* ... */}</div>;
}

// ✅ 解决方案：拆分组件
function GoodComponent2({ type }) {
  return type === 'user' 
    ? <UserComponent /> 
    : <AdminComponent />;
}

function UserComponent() {
  const [data, setData] = useState(null);
  return <div>{/* ... */}</div>;
}

function AdminComponent() {
  const [data, dispatch] = useReducer(reducer, initialState);
  return <div>{/* ... */}</div>;
}
```

### 3.2 循环中调用Hook

```javascript
// ❌ 场景1：map中调用Hook
function BadComponent3({ items }) {
  return items.map(item => {
    // ❌ 循环Hook
    const [selected, setSelected] = useState(false);
    return <div onClick={() => setSelected(!selected)}>{item}</div>;
  });
}

// 问题：
// items=[1,2,3]时：Hook0, Hook1, Hook2
// items=[1,2]时：  Hook0, Hook1
// Hook数量动态变化！

// ✅ 解决方案1：提升状态
function GoodComponent3({ items }) {
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  const toggleItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  return items.map(item => (
    <div 
      key={item.id}
      onClick={() => toggleItem(item.id)}
      className={selectedItems.has(item.id) ? 'selected' : ''}
    >
      {item.name}
    </div>
  ));
}

// ✅ 解决方案2：拆分组件
function GoodComponent3B({ items }) {
  return items.map(item => (
    <ItemComponent key={item.id} item={item} />
  ));
}

function ItemComponent({ item }) {
  const [selected, setSelected] = useState(false);
  return (
    <div onClick={() => setSelected(!selected)}>
      {item.name}
    </div>
  );
}
```

```javascript
// ❌ 场景2：for循环中调用Hook
function BadComponent4({ count }) {
  const states = [];
  for (let i = 0; i < count; i++) {
    // ❌ 循环Hook
    const [state, setState] = useState(i);
    states.push([state, setState]);
  }
  
  return <div>{/* ... */}</div>;
}

// ✅ 解决方案：使用单个状态数组
function GoodComponent4({ count }) {
  const [states, setStates] = useState(
    () => Array.from({ length: count }, (_, i) => i)
  );
  
  const updateState = (index, value) => {
    setStates(prev => {
      const newStates = [...prev];
      newStates[index] = value;
      return newStates;
    });
  };
  
  return (
    <div>
      {states.map((state, index) => (
        <div key={index}>
          {state}
          <button onClick={() => updateState(index, state + 1)}>+</button>
        </div>
      ))}
    </div>
  );
}
```

### 3.3 嵌套函数中调用Hook

```javascript
// ❌ 场景：回调函数中调用Hook
function BadComponent5() {
  const handleClick = () => {
    // ❌ 在普通函数中调用Hook
    const [state, setState] = useState(0);
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// 问题：Hook不在组件顶层调用

// ✅ 解决方案：在顶层调用Hook
function GoodComponent5() {
  const [state, setState] = useState(0);
  
  const handleClick = () => {
    // 使用state
    setState(state + 1);
  };
  
  return <button onClick={handleClick}>Click {state}</button>;
}
```

### 3.4 提前返回后的Hook

```javascript
// ❌ 场景：return之后调用Hook
function BadComponent6({ loading }) {
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // ❌ 可能不会执行的Hook
  const [data, setData] = useState(null);
  
  return <div>{data}</div>;
}

// 问题：
// loading=true时： 0个Hook
// loading=false时：1个Hook

// ✅ 解决方案：Hook在return之前
function GoodComponent6({ loading }) {
  const [data, setData] = useState(null);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return <div>{data}</div>;
}
```

## 第四部分：ESLint规则详解

### 4.1 eslint-plugin-react-hooks

```javascript
// 安装
npm install eslint-plugin-react-hooks --save-dev

// .eslintrc.js配置
module.exports = {
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',  // 检查Hook规则
    'react-hooks/exhaustive-deps': 'warn'   // 检查依赖数组
  }
};
```

### 4.2 规则检测示例

```javascript
// ✅ 通过检测
function Component1() {
  const [state, setState] = useState(0);
  useEffect(() => {}, []);
  return <div>{state}</div>;
}

// ❌ 违反rules-of-hooks
function Component2({ condition }) {
  if (condition) {
    const [state, setState] = useState(0);  // ESLint Error
  }
}

// ❌ 违反exhaustive-deps
function Component3() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log(count);
  }, []);  // ESLint Warning: count未在依赖数组中
}

// ✅ 修复exhaustive-deps
function Component4() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log(count);
  }, [count]);  // ✅ 正确
}
```

### 4.3 自定义Hook的检测

```javascript
// ✅ 正确的自定义Hook
function useCustomHook() {
  const [state, setState] = useState(0);
  useEffect(() => {}, []);
  return [state, setState];
}

// ❌ 错误：不以use开头
function customHook() {  // ESLint Error
  const [state, setState] = useState(0);  // Hook不能在这里调用
  return [state, setState];
}

// ✅ 正确使用自定义Hook
function Component() {
  const [value, setValue] = useCustomHook();  // ✅ 
  return <div>{value}</div>;
}

// ❌ 错误：在条件中调用
function BadComponent({ condition }) {
  if (condition) {
    const [value, setValue] = useCustomHook();  // ESLint Error
  }
}
```

## 第五部分：运行时检测

### 5.1 开发模式的警告

```javascript
// React在开发模式下会检测Hook调用

// 示例：Hook数量变化
function Component({ showExtra }) {
  const [count, setCount] = useState(0);
  
  if (showExtra) {
    const [extra, setExtra] = useState('');
  }
  
  return <div>{count}</div>;
}

// 控制台警告：
// Warning: React has detected a change in the order of Hooks 
// called by Component. This will lead to bugs and errors if 
// not fixed. For more information, read the Rules of Hooks: 
// https://reactjs.org/link/rules-of-hooks

//   Previous render    Next render
//   ------------------------------
// 1. useState           useState
// 2. useState           undefined
//    ^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

### 5.2 Hook调用栈追踪

```javascript
// React追踪Hook调用栈

// 开发模式下，React会记录Hook调用的组件和位置
function Component() {
  const [state1, setState1] = useState(0);  // Component:3
  const [state2, setState2] = useState(''); // Component:4
  useEffect(() => {}, []);                  // Component:5
}

// 如果出错，React可以定位到具体位置
// Error: Rendered more hooks than during the previous render.
//   at Component (Component.js:3)
```

## 注意事项

### 1. 始终在顶层调用Hook

```javascript
// ❌ 错误
function Component({ condition }) {
  if (condition) {
    const [state] = useState(0);
  }
}

// ✅ 正确
function Component({ condition }) {
  const [state] = useState(0);
  // 条件使用
  const value = condition ? state : 0;
}
```

### 2. 不要在循环中调用Hook

```javascript
// ❌ 错误
function Component({ items }) {
  items.forEach(item => {
    const [state] = useState(item);
  });
}

// ✅ 正确
function Component({ items }) {
  const [states] = useState(items);
}
```

### 3. 只在React函数中调用Hook

```javascript
// ❌ 错误
function helper() {
  const [state] = useState(0);
}

// ✅ 正确
function useHelper() {  // 自定义Hook
  const [state] = useState(0);
  return state;
}
```

### 4. 启用ESLint检查

```javascript
// .eslintrc.js
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 常见问题

### Q1: 为什么不能在条件语句中调用Hook？

**A:** Hook依赖调用顺序：

```javascript
// 条件会改变Hook的调用顺序和数量
// 导致React无法正确匹配状态
```

### Q2: 如何处理条件性的Hook逻辑？

**A:** 三种方案：

```javascript
// 1. Hook在条件外，逻辑在条件内
const [state, setState] = useState(0);
if (condition) {
  // 使用state
}

// 2. 拆分组件
{condition ? <ComponentA /> : <ComponentB />}

// 3. 使用多个组件实例
```

### Q3: 动态数量的状态如何管理？

**A:** 使用状态数组或对象：

```javascript
// 使用数组
const [items, setItems] = useState([]);

// 使用对象
const [itemsMap, setItemsMap] = useState({});

// 使用Map
const [itemsMap, setItemsMap] = useState(new Map());
```

## 总结

### 核心原则

1. **顺序不变**：Hook调用顺序必须保持一致
2. **数量固定**：Hook数量不能动态变化
3. **顶层调用**：Hook必须在组件或自定义Hook顶层调用
4. **函数限制**：Hook只能在React函数中调用

### 检测机制

```
编译时检测 (ESLint)
    ↓
开发时警告 (React DevTools)
    ↓
运行时错误 (生产环境)
```

### 最佳实践

- 启用ESLint规则
- 理解Hook调用原理
- 合理拆分组件
- 使用状态数组/对象管理动态数据

理解Hooks调用顺序原理是编写可靠React代码的基础！
