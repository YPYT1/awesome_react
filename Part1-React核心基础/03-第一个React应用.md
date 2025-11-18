# 第一个React应用完全指南

## 第一章：Hello React

### 1.1 最简单的React应用

让我们从最简单的React应用开始，理解React的基本工作原理。

#### 纯HTML方式（学习用）

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hello React</title>
</head>
<body>
  <!-- React挂载点 -->
  <div id="root"></div>

  <!-- 引入React库 -->
  <script crossorigin src="https://unpkg.com/react@19/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>

  <!-- React代码 -->
  <script>
    // 创建React元素
    const element = React.createElement(
      'h1',
      { className: 'greeting' },
      'Hello, React!'
    );

    // 创建根节点并渲染
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(element);
  </script>
</body>
</html>
```

这个例子展示了：
1. React需要两个库：`react`和`react-dom`
2. 使用`React.createElement`创建元素
3. 使用`ReactDOM.createRoot`创建根节点
4. 使用`root.render`渲染到DOM

#### 使用Babel转换JSX

```html
<!DOCTYPE html>
<html>
<head>
  <title>Hello React with JSX</title>
</head>
<body>
  <div id="root"></div>

  <script crossorigin src="https://unpkg.com/react@19/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.development.js"></script>
  <!-- 引入Babel转换JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- 使用type="text/babel"标记需要转换的代码 -->
  <script type="text/babel">
    // 使用JSX语法（更直观）
    const element = <h1 className="greeting">Hello, React!</h1>;

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(element);
  </script>
</body>
</html>
```

JSX的优势：
- 更接近HTML，易于阅读
- 可以在JS中写标签
- 支持表达式嵌入

注意：
- 在线转换JSX仅用于学习
- 生产环境使用构建工具预编译

### 1.2 使用Vite创建React应用

#### 步骤1：创建项目

```bash
# 创建Vite + React项目
npm create vite@latest hello-react -- --template react

# 进入目录
cd hello-react

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 步骤2：理解项目结构

```
hello-react/
├── index.html          # HTML入口
├── package.json        # 项目配置
├── vite.config.js      # Vite配置
└── src/
    ├── main.jsx        # JavaScript入口
    ├── App.jsx         # 根组件
    ├── App.css         # 组件样式
    └── index.css       # 全局样式
```

#### 步骤3：查看main.jsx

```javascript
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 创建根节点并渲染App组件
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

关键概念：
- `import React from 'react'`：引入React库
- `import ReactDOM from 'react-dom/client'`：引入ReactDOM库
- `ReactDOM.createRoot`：React 18+的新API
- `<React.StrictMode>`：开发模式下的额外检查

#### 步骤4：查看App.jsx

```javascript
// src/App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Hello React!</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App
```

组件分析：
- `function App()`：定义函数组件
- `useState(0)`：使用Hook管理状态
- `return (...)`：返回JSX
- `export default App`：导出组件

### 1.3 修改为Hello World

让我们将默认应用改为简单的Hello World：

```javascript
// src/App.jsx
function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is my first React application.</p>
    </div>
  )
}

export default App
```

保存文件后，浏览器会自动刷新显示新内容。这就是Vite的热模块替换（HMR）功能。

## 第二章：创建计数器应用

### 2.1 需求分析

我们要创建一个简单的计数器应用，功能包括：
- 显示当前计数
- 增加按钮（+1）
- 减少按钮（-1）
- 重置按钮

### 2.2 基础版本

```javascript
// src/App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  // 定义状态：count表示当前计数，setCount是更新函数
  const [count, setCount] = useState(0)

  // 事件处理函数
  const increment = () => {
    setCount(count + 1)
  }

  const decrement = () => {
    setCount(count - 1)
  }

  const reset = () => {
    setCount(0)
  }

  return (
    <div className="App">
      <h1>计数器应用</h1>
      
      {/* 显示当前计数 */}
      <div className="counter-display">
        <h2>当前计数：{count}</h2>
      </div>

      {/* 操作按钮 */}
      <div className="counter-controls">
        <button onClick={decrement}>-1</button>
        <button onClick={reset}>重置</button>
        <button onClick={increment}>+1</button>
      </div>
    </div>
  )
}

export default App
```

### 2.3 添加样式

```css
/* src/App.css */
.App {
  text-align: center;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
}

.counter-display {
  margin: 40px 0;
  padding: 30px;
  background-color: #f0f0f0;
  border-radius: 10px;
}

.counter-display h2 {
  font-size: 48px;
  margin: 0;
  color: #333;
}

.counter-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.counter-controls button {
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  transition: background-color 0.3s;
}

.counter-controls button:hover {
  background-color: #0056b3;
}

.counter-controls button:active {
  transform: scale(0.98);
}
```

### 2.4 改进版本

添加更多功能：
- 步长可调
- 显示历史记录
- 禁用按钮（当count为0时不能减少）

```javascript
// src/App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)
  const [history, setHistory] = useState([0])

  const updateCount = (newCount) => {
    setCount(newCount)
    setHistory([...history, newCount])
  }

  const increment = () => {
    updateCount(count + step)
  }

  const decrement = () => {
    updateCount(count - step)
  }

  const reset = () => {
    setCount(0)
    setHistory([0])
  }

  return (
    <div className="App">
      <h1>高级计数器</h1>
      
      <div className="counter-display">
        <h2>当前计数：{count}</h2>
      </div>

      <div className="step-control">
        <label>
          步长：
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <div className="counter-controls">
        <button onClick={decrement} disabled={count - step < 0}>
          -{step}
        </button>
        <button onClick={reset}>
          重置
        </button>
        <button onClick={increment}>
          +{step}
        </button>
      </div>

      <div className="history">
        <h3>历史记录：</h3>
        <p>{history.join(' → ')}</p>
      </div>
    </div>
  )
}

export default App
```

### 2.5 代码解析

#### useState Hook

```javascript
const [count, setCount] = useState(0)
```

这行代码做了什么：
1. `useState(0)`：创建一个状态，初始值为0
2. 返回数组：`[当前值, 更新函数]`
3. 解构赋值：`count`是当前值，`setCount`是更新函数

#### 事件处理

```javascript
<button onClick={increment}>+1</button>
```

- `onClick`：React的事件属性（驼峰命名）
- `{increment}`：传递函数引用（不是调用）
- 点击时React会调用`increment()`

#### 条件渲染

```javascript
<button disabled={count - step < 0}>
```

- `disabled={}`：JSX中的表达式
- 当`count - step < 0`时，按钮禁用

#### 数组展开

```javascript
setHistory([...history, newCount])
```

- `...history`：展开现有历史记录
- `, newCount`：添加新值
- 创建新数组（不修改原数组）

## 第三章：创建Todo List应用

### 3.1 需求分析

功能需求：
- 添加待办事项
- 显示待办列表
- 标记完成/未完成
- 删除待办事项
- 显示统计信息

### 3.2 基础版本

```javascript
// src/App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  // 状态管理
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')

  // 添加待办事项
  const addTodo = () => {
    if (inputValue.trim() === '') return

    const newTodo = {
      id: Date.now(),
      text: inputValue,
      completed: false
    }

    setTodos([...todos, newTodo])
    setInputValue('')
  }

  // 切换完成状态
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ))
  }

  // 删除待办事项
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // 回车添加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  return (
    <div className="App">
      <h1>Todo List</h1>

      {/* 输入区域 */}
      <div className="todo-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入待办事项..."
        />
        <button onClick={addTodo}>添加</button>
      </div>

      {/* 待办列表 */}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>

      {/* 统计信息 */}
      <div className="todo-stats">
        <p>总计：{todos.length} 项</p>
        <p>已完成：{todos.filter(t => t.completed).length} 项</p>
        <p>未完成：{todos.filter(t => !t.completed).length} 项</p>
      </div>
    </div>
  )
}

export default App
```

### 3.3 添加样式

```css
/* src/App.css */
.App {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

/* 输入区域 */
.todo-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-input input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 5px;
}

.todo-input input:focus {
  outline: none;
  border-color: #007bff;
}

.todo-input button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.todo-input button:hover {
  background-color: #0056b3;
}

/* 待办列表 */
.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.todo-list li:hover {
  background-color: #f0f0f0;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list li input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-list li span {
  flex: 1;
  font-size: 16px;
}

.todo-list li button {
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.todo-list li button:hover {
  background-color: #c82333;
}

/* 统计信息 */
.todo-stats {
  margin-top: 20px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 5px;
  text-align: center;
}

.todo-stats p {
  margin: 5px 0;
  color: #666;
}
```

### 3.4 组件拆分版本

将Todo List拆分为多个组件：

```javascript
// src/App.jsx
import { useState } from 'react'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import TodoStats from './components/TodoStats'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    }
    setTodos([...todos, newTodo])
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <div className="App">
      <h1>Todo List</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList 
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
      <TodoStats todos={todos} />
    </div>
  )
}

export default App
```

```javascript
// src/components/TodoInput.jsx
import { useState } from 'react'

function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) {
      onAdd(value)
      setValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="todo-input">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="输入待办事项..."
      />
      <button onClick={handleSubmit}>添加</button>
    </div>
  )
}

export default TodoInput
```

```javascript
// src/components/TodoList.jsx
import TodoItem from './TodoItem'

function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p className="empty-message">暂无待办事项</p>
  }

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TodoList
```

```javascript
// src/components/TodoItem.jsx
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.completed ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </li>
  )
}

export default TodoItem
```

```javascript
// src/components/TodoStats.jsx
function TodoStats({ todos }) {
  const total = todos.length
  const completed = todos.filter(t => t.completed).length
  const active = total - completed

  return (
    <div className="todo-stats">
      <p>总计：{total} 项</p>
      <p>已完成：{completed} 项</p>
      <p>未完成：{active} 项</p>
    </div>
  )
}

export default TodoStats
```

### 3.5 代码解析

#### 组件通信

```javascript
// 父组件
<TodoInput onAdd={addTodo} />

// 子组件
function TodoInput({ onAdd }) {
  const handleSubmit = () => {
    onAdd(value) // 调用父组件传递的函数
  }
}
```

数据流向：
- Props向下传递（父 → 子）
- 事件向上传递（子 → 父）

#### 列表渲染

```javascript
{todos.map(todo => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

关键点：
- `map()`遍历数组
- 每个元素需要唯一的`key`
- `key`帮助React识别哪些元素变化了

#### 条件渲染

```javascript
if (todos.length === 0) {
  return <p>暂无待办事项</p>
}
```

或使用三元运算符：

```javascript
{todos.length === 0 ? (
  <p>暂无待办事项</p>
) : (
  <TodoList todos={todos} />
)}
```

## 第四章：理解React核心概念

### 4.1 组件（Components）

组件是React的基本构建块。

```javascript
// 函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

// 使用组件
<Welcome name="Alice" />
```

组件特点：
- 可复用
- 独立性
- 组合性

### 4.2 JSX

JSX是JavaScript的语法扩展。

```javascript
// JSX
const element = <h1>Hello, world!</h1>

// 编译后（简化）
const element = React.createElement(
  'h1',
  null,
  'Hello, world!'
)
```

JSX规则：
- 必须有一个根元素
- 使用`className`而不是`class`
- 使用`htmlFor`而不是`for`
- 自闭合标签必须有`/`

### 4.3 Props

Props是组件的输入。

```javascript
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old.</p>
    </div>
  )
}

<Greeting name="Alice" age={25} />
```

Props特性：
- 只读（不可修改）
- 从父组件传递
- 可以是任何类型

### 4.4 State

State是组件的内部数据。

```javascript
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
```

State特性：
- 私有的（组件内部）
- 可变的（通过setState）
- 异步更新

### 4.5 事件处理

React事件使用驼峰命名。

```javascript
// HTML
<button onclick="handleClick()">Click</button>

// React
<button onClick={handleClick}>Click</button>
```

事件处理器：

```javascript
// 函数引用
<button onClick={handleClick}>Click</button>

// 箭头函数
<button onClick={() => handleClick(id)}>Click</button>

// 带参数
<button onClick={(e) => handleClick(id, e)}>Click</button>
```

## 第五章：调试技巧

### 5.1 React Developer Tools

安装Chrome扩展：React Developer Tools

功能：
- 查看组件树
- 检查Props和State
- 追踪组件更新
- 性能分析

### 5.2 Console调试

```javascript
function TodoItem({ todo }) {
  console.log('TodoItem rendered:', todo)
  
  return (
    <li>{todo.text}</li>
  )
}
```

### 5.3 常见错误

#### 错误1：key警告

```javascript
// 错误
{todos.map(todo => <li>{todo.text}</li>)}

// 正确
{todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
```

#### 错误2：直接修改state

```javascript
// 错误
todos.push(newTodo)
setTodos(todos)

// 正确
setTodos([...todos, newTodo])
```

#### 错误3：忘记绑定this（类组件）

```javascript
// 类组件中的常见错误
class Button extends React.Component {
  handleClick() {
    console.log(this) // undefined
  }
  
  render() {
    return <button onClick={this.handleClick}>Click</button>
  }
}

// 解决方案1：箭头函数
handleClick = () => {
  console.log(this) // Button实例
}

// 解决方案2：bind
<button onClick={this.handleClick.bind(this)}>Click</button>

// 最佳方案：使用函数组件
```

## 第六章：最佳实践

### 6.1 组件命名

```javascript
// 组件名使用帕斯卡命名法
function UserProfile() {}
function TodoList() {}
function AppHeader() {}

// 组件文件名与组件名一致
UserProfile.jsx
TodoList.jsx
AppHeader.jsx
```

### 6.2 文件组织

```
src/
  components/
    common/
      Button.jsx
      Input.jsx
    features/
      TodoList/
        TodoList.jsx
        TodoItem.jsx
        TodoStats.jsx
        TodoList.css
  App.jsx
  main.jsx
```

### 6.3 Props解构

```javascript
// 不推荐
function User(props) {
  return <div>{props.name}</div>
}

// 推荐
function User({ name, age, email }) {
  return <div>{name}</div>
}
```

### 6.4 默认Props

```javascript
function Button({ text = 'Click', type = 'button' }) {
  return <button type={type}>{text}</button>
}

// 或使用函数参数默认值
```

## 总结

本章创建了第一个React应用，学习了：

1. **Hello World**：最简单的React应用
2. **计数器**：状态管理和事件处理
3. **Todo List**：完整的CRUD应用
4. **组件拆分**：代码组织和组件通信
5. **核心概念**：组件、JSX、Props、State
6. **调试技巧**：工具和常见错误
7. **最佳实践**：命名、组织、编码规范

下一章我们将深入学习项目结构和代码组织。




