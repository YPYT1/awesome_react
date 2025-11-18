# JSX语法规则完全指南

## 第一章：JSX基础概念

### 1.1 什么是JSX

JSX（JavaScript XML）是JavaScript的语法扩展，允许在JavaScript代码中编写类似HTML的标记。

#### JSX的本质

```javascript
// JSX代码
const element = <h1 className="greeting">Hello, world!</h1>

// 编译后的JavaScript（React 17之前）
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
)

// React 17+新的JSX转换
import { jsx as _jsx } from 'react/jsx-runtime'
const element = _jsx(
  'h1',
  { className: 'greeting', children: 'Hello, world!' }
)
```

JSX只是语法糖，最终会被编译成普通的JavaScript函数调用。

#### 为什么使用JSX

**1. 声明式UI**

```javascript
// 不使用JSX（命令式）
const container = document.createElement('div')
const title = document.createElement('h1')
title.textContent = 'Hello'
const paragraph = document.createElement('p')
paragraph.textContent = 'World'
container.appendChild(title)
container.appendChild(paragraph)

// 使用JSX（声明式）
const element = (
  <div>
    <h1>Hello</h1>
    <p>World</p>
  </div>
)
```

**2. 更好的可读性**

```javascript
// 复杂的UI结构用JSX更清晰
<div className="card">
  <div className="card-header">
    <h2>{title}</h2>
  </div>
  <div className="card-body">
    <p>{content}</p>
    <button onClick={handleClick}>Click</button>
  </div>
</div>
```

**3. 类型检查**

```typescript
// TypeScript可以对JSX进行类型检查
interface ButtonProps {
  text: string
  onClick: () => void
}

function Button({ text, onClick }: ButtonProps) {
  return <button onClick={onClick}>{text}</button>
}

// 编译时检查props类型
<Button text="Click" onClick={handleClick} /> // 正确
<Button text={123} onClick={handleClick} />   // 类型错误
```

### 1.2 JSX与HTML的区别

#### 区别1：属性名称

```javascript
// HTML使用kebab-case
<div class="container" tabindex="0"></div>

// JSX使用camelCase
<div className="container" tabIndex={0}></div>

// 常见的属性对照
HTML              JSX
class          → className
for            → htmlFor
tabindex       → tabIndex
readonly       → readOnly
maxlength      → maxLength
cellspacing    → cellSpacing
rowspan        → rowSpan
colspan        → colSpan
```

#### 区别2：样式属性

```javascript
// HTML使用字符串
<div style="background-color: blue; font-size: 16px;"></div>

// JSX使用对象，属性名camelCase
<div style={{
  backgroundColor: 'blue',
  fontSize: 16,        // 数字自动加px
  fontSize: '16px'     // 或明确指定单位
}}></div>

// 注意：双花括号
// 外层{}表示JavaScript表达式
// 内层{}表示对象字面量
```

#### 区别3：事件处理

```javascript
// HTML使用字符串
<button onclick="handleClick()">Click</button>

// JSX使用函数引用，camelCase命名
<button onClick={handleClick}>Click</button>

// 常见事件对照
HTML              JSX
onclick        → onClick
onchange       → onChange
onsubmit       → onSubmit
onmouseover    → onMouseOver
onkeypress     → onKeyPress
```

#### 区别4：自闭合标签

```javascript
// HTML中某些标签可以不闭合
<input type="text">
<img src="logo.png">
<br>

// JSX中所有标签必须闭合
<input type="text" />
<img src="logo.png" />
<br />

// 或使用完整闭合
<input type="text"></input>
```

## 第二章：JSX语法规则

### 2.1 基本规则

#### 规则1：必须有一个根元素

```javascript
// 错误：多个根元素
function App() {
  return (
    <h1>Title</h1>
    <p>Content</p>
  )
}

// 正确：使用div包裹
function App() {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  )
}

// 正确：使用Fragment
function App() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  )
}

// 或使用完整的Fragment
import { Fragment } from 'react'

function App() {
  return (
    <Fragment>
      <h1>Title</h1>
      <p>Content</p>
    </Fragment>
  )
}
```

#### 规则2：标签必须闭合

```javascript
// 错误：标签未闭合
<input type="text">
<img src="logo.png">

// 正确：自闭合
<input type="text" />
<img src="logo.png" />

// 正确：完整闭合
<div></div>
<span></span>
```

#### 规则3：className代替class

```javascript
// 错误：使用class
<div class="container"></div>

// 正确：使用className
<div className="container"></div>

// 动态className
const isActive = true
<div className={isActive ? 'active' : 'inactive'}></div>

// 多个className
<div className="btn btn-primary btn-lg"></div>

// 使用模板字符串
<div className={`btn ${isActive ? 'active' : ''}`}></div>

// 使用classnames库（推荐）
import classNames from 'classnames'
<div className={classNames('btn', {
  'active': isActive,
  'disabled': isDisabled
})}></div>
```

#### 规则4：htmlFor代替for

```javascript
// 错误：使用for
<label for="username">Username:</label>

// 正确：使用htmlFor
<label htmlFor="username">Username:</label>
<input id="username" type="text" />
```

### 2.2 JavaScript表达式

#### 嵌入表达式

```javascript
// 使用{}嵌入JavaScript表达式
const name = 'Alice'
const age = 25

<div>
  {/* 变量 */}
  <p>{name}</p>
  
  {/* 运算 */}
  <p>{age + 5}</p>
  <p>{age * 2}</p>
  
  {/* 字符串拼接 */}
  <p>{'Hello, ' + name}</p>
  
  {/* 模板字符串 */}
  <p>{`Hello, ${name}!`}</p>
  
  {/* 三元运算符 */}
  <p>{age >= 18 ? 'Adult' : 'Minor'}</p>
  
  {/* 函数调用 */}
  <p>{formatDate(new Date())}</p>
  <p>{name.toUpperCase()}</p>
  
  {/* 对象属性 */}
  <p>{user.name}</p>
  <p>{user.profile.email}</p>
  
  {/* 数组方法 */}
  <p>{items.length}</p>
  <p>{items.join(', ')}</p>
</div>
```

#### 不能使用的表达式

```javascript
// 错误：if语句
<div>
  {if (condition) { return <p>True</p> }}
</div>

// 正确：使用三元运算符
<div>
  {condition ? <p>True</p> : <p>False</p>}
</div>

// 错误：for循环
<div>
  {for (let i = 0; i < 10; i++) { <p>{i}</p> }}
</div>

// 正确：使用map
<div>
  {[...Array(10)].map((_, i) => <p key={i}>{i}</p>)}
</div>

// 错误：switch语句
<div>
  {switch(type) {
    case 'a': return <p>A</p>
    case 'b': return <p>B</p>
  }}
</div>

// 正确：使用对象映射或函数
<div>
  {(() => {
    switch(type) {
      case 'a': return <p>A</p>
      case 'b': return <p>B</p>
      default: return <p>Default</p>
    }
  })()}
</div>
```

### 2.3 属性规则

#### 字符串属性

```javascript
// 使用引号定义字符串属性
<img src="logo.png" alt="Logo" />
<input type="text" placeholder="Enter name" />

// 单引号或双引号都可以
<div className="container"></div>
<div className='container'></div>
```

#### 表达式属性

```javascript
// 使用{}定义表达式属性
const imageUrl = 'logo.png'
const inputType = 'text'

<img src={imageUrl} alt="Logo" />
<input type={inputType} />

// 数字属性
<input maxLength={10} />
<div tabIndex={0} />

// 布尔属性
<input disabled={true} />
<input required={false} />

// 简写：true可以省略
<input disabled />  // 等同于 disabled={true}
<input required />  // 等同于 required={true}
```

#### 展开属性

```javascript
// 对象展开
const props = {
  type: 'text',
  placeholder: 'Enter name',
  maxLength: 10
}

<input {...props} />

// 等同于
<input
  type="text"
  placeholder="Enter name"
  maxLength={10}
/>

// 展开后可以覆盖
<input {...props} type="email" />
// type最终为"email"

// 部分展开
const { type, ...restProps } = props
<input type="password" {...restProps} />
```

### 2.4 子元素规则

#### 文本子元素

```javascript
// 直接文本
<p>Hello, world!</p>

// 表达式文本
<p>{message}</p>
<p>{`Hello, ${name}!`}</p>

// 混合文本
<p>
  Hello, <strong>{name}</strong>!
</p>

// 空格处理
<p>Hello     World</p>  // 多个空格变成一个
<p>Hello{' '}World</p>  // 显式空格
<p>{'Hello World'}</p>  // 字符串空格
```

#### 元素子元素

```javascript
// 嵌套元素
<div>
  <h1>Title</h1>
  <p>Content</p>
</div>

// 数组子元素
const items = ['A', 'B', 'C']
<ul>
  {items.map((item, index) => (
    <li key={index}>{item}</li>
  ))}
</ul>

// 条件子元素
<div>
  {isLoggedIn && <UserMenu />}
  {!isLoggedIn && <LoginButton />}
</div>
```

#### 函数子元素（Render Props）

```javascript
// 函数作为子元素
<DataProvider>
  {(data) => (
    <div>
      {data.map(item => (
        <p key={item.id}>{item.name}</p>
      ))}
    </div>
  )}
</DataProvider>

// 实现
function DataProvider({ children }) {
  const data = useFetchData()
  return children(data)
}
```

## 第三章：JSX高级用法

### 3.1 条件渲染

#### 三元运算符

```javascript
function Greeting({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? (
        <h1>Welcome back!</h1>
      ) : (
        <h1>Please sign in.</h1>
      )}
    </div>
  )
}
```

#### 逻辑与运算符

```javascript
function Mailbox({ unreadMessages }) {
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 && (
        <h2>You have {unreadMessages.length} unread messages.</h2>
      )}
    </div>
  )
}

// 注意：0会被渲染
{count && <p>{count}</p>}  // count为0时会显示"0"

// 正确做法
{count > 0 && <p>{count}</p>}
{!!count && <p>{count}</p>}
```

#### 立即执行函数

```javascript
function StatusMessage({ status }) {
  return (
    <div>
      {(() => {
        switch(status) {
          case 'loading':
            return <Loading />
          case 'success':
            return <Success />
          case 'error':
            return <Error />
          default:
            return null
        }
      })()}
    </div>
  )
}
```

#### 变量赋值

```javascript
function Greeting({ isLoggedIn, user }) {
  let message
  
  if (isLoggedIn) {
    message = <h1>Welcome back, {user.name}!</h1>
  } else {
    message = <h1>Please sign in.</h1>
  }
  
  return <div>{message}</div>
}
```

### 3.2 列表渲染

#### map方法

```javascript
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

#### key的重要性

```javascript
// 错误：使用索引作为key（列表会变化时）
{todos.map((todo, index) => (
  <li key={index}>{todo.text}</li>
))}

// 正确：使用唯一ID
{todos.map(todo => (
  <li key={todo.id}>{todo.text}</li>
))}

// key必须唯一且稳定
// 不要使用：
// - 数组索引（列表会重排序时）
// - 随机数（每次渲染都变）
// - 时间戳（不稳定）
```

#### 复杂列表

```javascript
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <div key={user.id} className="user-card">
          <img src={user.avatar} alt={user.name} />
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <ul>
            {user.tags.map(tag => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
```

### 3.3 Fragment详解

#### 基本用法

```javascript
// 短语法
function Columns() {
  return (
    <>
      <td>Column 1</td>
      <td>Column 2</td>
    </>
  )
}

// 完整语法
import { Fragment } from 'react'

function Columns() {
  return (
    <Fragment>
      <td>Column 1</td>
      <td>Column 2</td>
    </Fragment>
  )
}
```

#### 带key的Fragment

```javascript
// 短语法不支持key
function Glossary({ items }) {
  return (
    <dl>
      {items.map(item => (
        // Fragment需要key时必须使用完整语法
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.definition}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
```

### 3.4 注释

```javascript
function App() {
  return (
    <div>
      {/* 单行注释 */}
      <h1>Title</h1>
      
      {/* 
        多行注释
        可以写多行
      */}
      <p>Content</p>
      
      {/* 不要这样注释 */}
      // 这样的注释会被渲染出来
      
      <div>
        {/* 属性中的注释 */}
        <input
          type="text"
          {/* placeholder="Enter name" */}
        />
      </div>
    </div>
  )
}
```

## 第四章：JSX陷阱与技巧

### 4.1 常见陷阱

#### 陷阱1：返回值必须是单个元素

```javascript
// 错误
function App() {
  return (
    <h1>Title</h1>
    <p>Content</p>
  )
}

// 正确
function App() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  )
}
```

#### 陷阱2：属性名大小写

```javascript
// 错误
<div classname="container"></div>  // 应该是className
<input tabindex="0" />             // 应该是tabIndex
<div onclick={handler}></div>      // 应该是onClick

// 正确
<div className="container"></div>
<input tabIndex={0} />
<div onClick={handler}></div>
```

#### 陷阱3：布尔属性

```javascript
// 错误：字符串true
<input disabled="true" />   // 始终禁用
<input disabled="false" />  // 也是禁用！

// 正确：布尔值
<input disabled={true} />
<input disabled={false} />

// 简写
<input disabled />          // 等于disabled={true}
```

#### 陷阱4：style属性

```javascript
// 错误：字符串样式
<div style="color: red; font-size: 16px;"></div>

// 正确：对象样式
<div style={{
  color: 'red',
  fontSize: 16,      // 数字自动加px
  fontSize: '16px'   // 或明确单位
}}></div>

// 注意：双花括号
```

#### 陷阱5：dangerouslySetInnerHTML

```javascript
// 危险：直接插入HTML
const htmlString = '<p>Hello <strong>World</strong></p>'

// 不推荐：可能XSS攻击
<div dangerouslySetInnerHTML={{ __html: htmlString }}></div>

// 推荐：使用库处理
import DOMPurify from 'dompurify'
const cleanHTML = DOMPurify.sanitize(htmlString)
<div dangerouslySetInnerHTML={{ __html: cleanHTML }}></div>
```

### 4.2 性能优化技巧

#### 技巧1：避免在render中创建函数

```javascript
// 不好：每次渲染创建新函数
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}

// 好：使用useCallback
function List({ items }) {
  const handleClick = useCallback((id) => {
    console.log(id)
  }, [])
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

#### 技巧2：避免在render中创建对象

```javascript
// 不好：每次渲染创建新对象
function Button({ text }) {
  return (
    <button style={{ padding: 10, margin: 5 }}>
      {text}
    </button>
  )
}

// 好：提取到组件外部
const buttonStyle = { padding: 10, margin: 5 }

function Button({ text }) {
  return <button style={buttonStyle}>{text}</button>
}

// 或使用useMemo
function Button({ text }) {
  const buttonStyle = useMemo(() => ({
    padding: 10,
    margin: 5
  }), [])
  
  return <button style={buttonStyle}>{text}</button>
}
```

#### 技巧3：使用key优化列表

```javascript
// 好的key
<ul>
  {users.map(user => (
    <li key={user.id}>{user.name}</li>
  ))}
</ul>

// 不好的key（列表会重排时）
<ul>
  {users.map((user, index) => (
    <li key={index}>{user.name}</li>
  ))}
</ul>
```

### 4.3 实用技巧

#### 技巧1：条件className

```javascript
// 使用模板字符串
<div className={`btn ${isActive ? 'active' : ''} ${size}`}>

// 使用数组join
<div className={['btn', isActive && 'active', size].filter(Boolean).join(' ')}>

// 使用classnames库
import classNames from 'classnames'
<div className={classNames('btn', {
  active: isActive,
  disabled: isDisabled
}, size)}>
```

#### 技巧2：展开props

```javascript
function Input(props) {
  // 提取特定props
  const { label, error, ...inputProps } = props
  
  return (
    <div>
      <label>{label}</label>
      <input {...inputProps} />
      {error && <span>{error}</span>}
    </div>
  )
}

// 使用
<Input
  label="Username"
  type="text"
  placeholder="Enter username"
  error="Required"
/>
```

#### 技巧3：动态标签名

```javascript
function Heading({ level, children }) {
  const Tag = `h${level}`
  return <Tag>{children}</Tag>
}

// 使用
<Heading level={1}>Title</Heading>  // 渲染<h1>
<Heading level={2}>Subtitle</Heading>  // 渲染<h2>
```

#### 技巧4：条件属性

```javascript
function Button({ primary, disabled, onClick }) {
  return (
    <button
      className={primary ? 'btn-primary' : 'btn-default'}
      {...(disabled && { disabled: true })}
      {...(onClick && { onClick })}
    >
      Click
    </button>
  )
}
```

## 第五章：JSX最佳实践

### 5.1 代码风格

#### 缩进和换行

```javascript
// 单行JSX
const element = <div>Hello</div>

// 多行JSX用括号包裹
const element = (
  <div>
    <h1>Hello</h1>
    <p>World</p>
  </div>
)

// 属性过多时换行
<button
  type="submit"
  className="btn btn-primary"
  onClick={handleClick}
  disabled={isDisabled}
>
  Submit
</button>

// 子元素换行
<Parent>
  <ChildA />
  <ChildB />
  <ChildC />
</Parent>
```

#### 组件拆分

```javascript
// 不好：JSX太长
function UserCard({ user }) {
  return (
    <div className="card">
      <div className="card-header">
        <img src={user.avatar} alt={user.name} />
        <h3>{user.name}</h3>
        <span>{user.role}</span>
      </div>
      <div className="card-body">
        <p>{user.bio}</p>
        <div className="stats">
          <span>{user.followers} followers</span>
          <span>{user.following} following</span>
        </div>
      </div>
      <div className="card-footer">
        <button onClick={() => follow(user.id)}>Follow</button>
        <button onClick={() => message(user.id)}>Message</button>
      </div>
    </div>
  )
}

// 好：拆分子组件
function UserCard({ user }) {
  return (
    <div className="card">
      <UserCardHeader user={user} />
      <UserCardBody user={user} />
      <UserCardFooter user={user} />
    </div>
  )
}
```

### 5.2 命名规范

```javascript
// 组件名：PascalCase
function UserProfile() {}
function TodoList() {}

// 事件处理：handle前缀
const handleClick = () => {}
const handleSubmit = () => {}
const handleChange = () => {}

// 布尔变量：is/has/should前缀
const isActive = true
const hasError = false
const shouldRender = true

// 常量：UPPER_CASE
const API_URL = 'https://api.example.com'
const MAX_ITEMS = 100
```

### 5.3 安全实践

#### XSS防护

```javascript
// 危险：用户输入直接渲染
const userInput = '<script>alert("XSS")</script>'
<div dangerouslySetInnerHTML={{ __html: userInput }}></div>

// 安全：使用文本节点
<div>{userInput}</div>  // 自动转义

// 安全：使用库清理
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
<div dangerouslySetInnerHTML={{ __html: clean }}></div>
```

## 总结

本章详细介绍了JSX语法规则：

1. **JSX基础**：本质、优势、与HTML的区别
2. **基本规则**：根元素、闭合、className、htmlFor
3. **JavaScript表达式**：嵌入规则、限制
4. **属性规则**：字符串、表达式、展开
5. **子元素规则**：文本、元素、函数
6. **高级用法**：条件渲染、列表、Fragment
7. **陷阱技巧**：常见错误、性能优化
8. **最佳实践**：代码风格、命名规范、安全

掌握JSX是React开发的基础，下一章我们将学习JSX表达式与嵌入。




