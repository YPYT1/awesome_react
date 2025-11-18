# JSX表达式与嵌入

## 学习目标

通过本章学习，你将掌握：

- JSX中表达式的使用方法
- 如何在JSX中嵌入JavaScript代码
- JSX中的各种数据类型渲染
- 表达式的执行时机与作用域
- JSX表达式的最佳实践
- React 19中表达式处理的新特性

## 第一部分：JSX表达式基础

### 1.1 什么是JSX表达式

JSX表达式是指在JSX中使用花括号 `{}` 包裹的JavaScript表达式。这些表达式会在组件渲染时被计算，并将结果嵌入到最终的HTML中。

#### 基本语法

```jsx
const element = <h1>Hello, {name}!</h1>;
```

在这个例子中：
- `{name}` 是一个JSX表达式
- `name` 是一个JavaScript变量
- 渲染时会将变量的值嵌入到HTML中

#### 表达式的本质

JSX表达式本质上是JavaScript表达式的一种特殊写法：

```jsx
// JSX写法
const greeting = <h1>Hello, {user.name}</h1>;

// 编译后的JavaScript（React 19新架构）
const greeting = jsx('h1', {
  children: ['Hello, ', user.name]
});
```

### 1.2 表达式与语句的区别

在JSX中只能使用**表达式**，不能使用**语句**。

#### 什么是表达式

表达式是能够产生值的代码：

```jsx
// 有效的表达式
{2 + 2}                    // 算术表达式
{user.name}                // 属性访问
{getName()}                // 函数调用
{user ? user.name : 'Guest'} // 三元运算符
{items.map(item => item.name)} // 数组方法
```

#### 什么是语句

语句是执行某些操作但不产生值的代码：

```jsx
// 无效的语句（会报错）
{if (user) { return user.name }}  // if语句
{for (let i = 0; i < 10; i++) {}} // for循环
{let x = 10}                       // 变量声明
{switch(type) { case 'a': break }} // switch语句
```

#### 解决方案

如果需要使用复杂逻辑，可以：

1. **使用表达式替代**

```jsx
// 使用三元运算符替代if语句
{user ? <UserProfile user={user} /> : <Login />}

// 使用立即执行函数
{(() => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  return 'C';
})()}
```

2. **在组件外部处理逻辑**

```jsx
function StudentGrade({ score }) {
  // 在渲染前处理逻辑
  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else grade = 'C';
  
  return <div>Grade: {grade}</div>;
}
```

### 1.3 花括号的使用规则

#### 单层花括号：用于嵌入表达式

```jsx
function Greeting() {
  const name = 'Alice';
  return <h1>Hello, {name}</h1>;
}
```

#### 双层花括号：用于传递对象

```jsx
function StyledBox() {
  // 外层花括号：表示这是JSX表达式
  // 内层花括号：JavaScript对象字面量
  return (
    <div style={{ 
      backgroundColor: 'blue',
      padding: '20px'
    }}>
      Styled Content
    </div>
  );
}
```

#### 在属性中使用表达式

```jsx
function Image() {
  const imageUrl = 'https://example.com/image.jpg';
  const altText = 'Description';
  
  return (
    <img 
      src={imageUrl}           // 字符串变量
      alt={altText}            // 字符串变量
      width={300}              // 数字
      className={`img-${altText.toLowerCase()}`} // 模板字符串
    />
  );
}
```

## 第二部分：各种类型的表达式

### 2.1 基本数据类型

#### 字符串

```jsx
function StringExample() {
  const greeting = 'Hello';
  const name = 'World';
  
  return (
    <div>
      {/* 直接显示字符串 */}
      <p>{greeting}</p>
      
      {/* 字符串拼接 */}
      <p>{greeting + ' ' + name}</p>
      
      {/* 模板字符串 */}
      <p>{`${greeting}, ${name}!`}</p>
      
      {/* 字符串方法 */}
      <p>{name.toUpperCase()}</p>
      <p>{name.slice(0, 3)}</p>
    </div>
  );
}
```

#### 数字

```jsx
function NumberExample() {
  const price = 99.99;
  const quantity = 3;
  
  return (
    <div>
      {/* 直接显示数字 */}
      <p>Price: ${price}</p>
      
      {/* 数学运算 */}
      <p>Total: ${price * quantity}</p>
      <p>Discount: ${(price * 0.9).toFixed(2)}</p>
      
      {/* 数字格式化 */}
      <p>{price.toLocaleString('zh-CN', {
        style: 'currency',
        currency: 'CNY'
      })}</p>
    </div>
  );
}
```

#### 布尔值

```jsx
function BooleanExample() {
  const isLoggedIn = true;
  const hasPermission = false;
  
  return (
    <div>
      {/* 布尔值不会被渲染 */}
      <p>IsLoggedIn: {isLoggedIn}</p>  {/* 不显示任何内容 */}
      
      {/* 转换为字符串显示 */}
      <p>IsLoggedIn: {String(isLoggedIn)}</p>  {/* 显示 "true" */}
      <p>IsLoggedIn: {isLoggedIn.toString()}</p>
      
      {/* 用于条件渲染 */}
      {isLoggedIn && <p>Welcome back!</p>}
      {!hasPermission && <p>Access denied</p>}
    </div>
  );
}
```

#### null和undefined

```jsx
function NullUndefinedExample() {
  const nullValue = null;
  const undefinedValue = undefined;
  const emptyValue = '';
  
  return (
    <div>
      {/* null和undefined不会被渲染 */}
      <p>Null: {nullValue}</p>          {/* 不显示 */}
      <p>Undefined: {undefinedValue}</p> {/* 不显示 */}
      
      {/* 空字符串会被渲染（但看不见） */}
      <p>Empty: {emptyValue}</p>         {/* 显示空白 */}
      
      {/* 使用默认值 */}
      <p>{nullValue || 'Default Value'}</p>
      <p>{undefinedValue ?? 'Fallback'}</p>
    </div>
  );
}
```

### 2.2 数组与对象

#### 数组渲染

```jsx
function ArrayExample() {
  const numbers = [1, 2, 3, 4, 5];
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ];
  
  return (
    <div>
      {/* 直接渲染数组（会自动拼接） */}
      <p>{numbers}</p>  {/* 显示: 12345 */}
      
      {/* 使用map渲染列表 */}
      <ul>
        {numbers.map(num => (
          <li key={num}>{num * 2}</li>
        ))}
      </ul>
      
      {/* 渲染对象数组 */}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      
      {/* 过滤和映射 */}
      <ul>
        {numbers
          .filter(num => num > 2)
          .map(num => <li key={num}>{num}</li>)
        }
      </ul>
    </div>
  );
}
```

#### 对象处理

```jsx
function ObjectExample() {
  const user = {
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  };
  
  return (
    <div>
      {/* 访问对象属性 */}
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      
      {/* 对象不能直接渲染（会报错） */}
      {/* <p>{user}</p> */}  {/* 错误！ */}
      
      {/* 将对象转换为JSON字符串 */}
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      {/* 渲染对象的所有值 */}
      <ul>
        {Object.entries(user).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 2.3 函数调用表达式

#### 简单函数调用

```jsx
function FunctionCallExample() {
  // 定义函数
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }
  
  function formatDate(date) {
    return date.toLocaleDateString('zh-CN');
  }
  
  return (
    <div>
      <h1>{getGreeting()}</h1>
      <p>今天是：{formatDate(new Date())}</p>
    </div>
  );
}
```

#### 带参数的函数调用

```jsx
function CalculatorExample() {
  const add = (a, b) => a + b;
  const multiply = (a, b) => a * b;
  const calculate = (operation, a, b) => {
    switch(operation) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return a / b;
      default: return 0;
    }
  };
  
  return (
    <div>
      <p>2 + 3 = {add(2, 3)}</p>
      <p>4 × 5 = {multiply(4, 5)}</p>
      <p>10 ÷ 2 = {calculate('divide', 10, 2)}</p>
    </div>
  );
}
```

#### 箭头函数表达式

```jsx
function ArrowFunctionExample() {
  const items = ['Apple', 'Banana', 'Cherry'];
  
  return (
    <ul>
      {/* 直接使用箭头函数 */}
      {items.map((item, index) => (
        <li key={index}>
          {index + 1}. {item.toUpperCase()}
        </li>
      ))}
      
      {/* 复杂的箭头函数 */}
      {items.map(item => {
        const price = Math.random() * 10;
        return (
          <li key={item}>
            {item}: ${price.toFixed(2)}
          </li>
        );
      })}
    </ul>
  );
}
```

### 2.4 运算符表达式

#### 算术运算符

```jsx
function ArithmeticExample() {
  const a = 10;
  const b = 3;
  
  return (
    <div>
      <p>加法: {a + b}</p>
      <p>减法: {a - b}</p>
      <p>乘法: {a * b}</p>
      <p>除法: {a / b}</p>
      <p>取模: {a % b}</p>
      <p>幂运算: {a ** 2}</p>
      <p>递增: {a + 1}</p>
    </div>
  );
}
```

#### 比较运算符

```jsx
function ComparisonExample() {
  const score = 85;
  const passingScore = 60;
  
  return (
    <div>
      {/* 比较结果是布尔值，需要转换为字符串或用于条件渲染 */}
      <p>及格: {String(score >= passingScore)}</p>
      <p>优秀: {String(score >= 90)}</p>
      
      {/* 用于条件渲染 */}
      {score >= passingScore && <p>恭喜你通过了考试！</p>}
      {score >= 90 && <p>成绩优秀！</p>}
      {score < passingScore && <p>很遗憾，你没有通过考试。</p>}
    </div>
  );
}
```

#### 逻辑运算符

```jsx
function LogicalExample() {
  const isLoggedIn = true;
  const isAdmin = false;
  const notifications = 5;
  const username = '';
  
  return (
    <div>
      {/* 逻辑与 && */}
      {isLoggedIn && <p>欢迎回来！</p>}
      {isLoggedIn && isAdmin && <p>管理员面板</p>}
      {notifications > 0 && <span>您有 {notifications} 条新消息</span>}
      
      {/* 逻辑或 || */}
      <p>用户名: {username || '访客'}</p>
      <p>{isLoggedIn || '请先登录'}</p>
      
      {/* 空值合并运算符 ?? (React 19推荐) */}
      <p>用户名: {username ?? '未设置'}</p>
      <p>通知: {notifications ?? 0}</p>
      
      {/* 逻辑非 ! */}
      {!isLoggedIn && <button>登录</button>}
      {!isAdmin && <p>您没有管理员权限</p>}
    </div>
  );
}
```

#### 三元运算符

```jsx
function TernaryExample() {
  const age = 20;
  const isWeekend = true;
  const score = 75;
  
  return (
    <div>
      {/* 简单三元运算 */}
      <p>状态: {age >= 18 ? '成年' : '未成年'}</p>
      <p>{isWeekend ? '周末愉快！' : '工作日加油！'}</p>
      
      {/* 嵌套三元运算 */}
      <p>
        成绩等级: {
          score >= 90 ? 'A' :
          score >= 80 ? 'B' :
          score >= 70 ? 'C' :
          score >= 60 ? 'D' : 'F'
        }
      </p>
      
      {/* 三元运算符返回组件 */}
      {age >= 18 ? 
        <button>进入</button> : 
        <p>您未满18岁</p>
      }
    </div>
  );
}
```

#### 可选链运算符

```jsx
function OptionalChainingExample() {
  const user = {
    name: 'Alice',
    address: {
      city: 'Beijing',
      // street: undefined
    }
  };
  
  const emptyUser = null;
  
  return (
    <div>
      {/* 安全访问嵌套属性 */}
      <p>城市: {user?.address?.city}</p>
      <p>街道: {user?.address?.street ?? '未设置'}</p>
      
      {/* 访问可能为null的对象 */}
      <p>姓名: {emptyUser?.name ?? '匿名用户'}</p>
      
      {/* 可选方法调用 */}
      <p>大写: {user?.name?.toUpperCase?.()}</p>
    </div>
  );
}
```

## 第三部分：高级表达式技巧

### 3.1 立即执行函数表达式(IIFE)

```jsx
function IIFEExample() {
  const items = [1, 2, 3, 4, 5];
  
  return (
    <div>
      {/* 使用IIFE执行复杂逻辑 */}
      {(() => {
        const sum = items.reduce((a, b) => a + b, 0);
        const average = sum / items.length;
        return <p>平均值: {average.toFixed(2)}</p>;
      })()}
      
      {/* 条件逻辑 */}
      {(() => {
        const hour = new Date().getHours();
        if (hour < 6) return <p>凌晨时分</p>;
        if (hour < 12) return <p>上午好</p>;
        if (hour < 18) return <p>下午好</p>;
        return <p>晚上好</p>;
      })()}
      
      {/* 循环处理 */}
      {(() => {
        const result = [];
        for (let i = 0; i < 5; i++) {
          result.push(<div key={i}>第 {i + 1} 项</div>);
        }
        return result;
      })()}
    </div>
  );
}
```

### 3.2 解构赋值表达式

```jsx
function DestructuringExample() {
  const user = {
    name: 'Alice',
    age: 25,
    address: {
      city: 'Beijing',
      country: 'China'
    }
  };
  
  const numbers = [1, 2, 3, 4, 5];
  
  return (
    <div>
      {/* 对象解构 */}
      <p>用户: {(({ name, age }) => `${name}, ${age}岁`)(user)}</p>
      
      {/* 嵌套解构 */}
      <p>
        地址: {(({ address: { city, country } }) => 
          `${city}, ${country}`
        )(user)}
      </p>
      
      {/* 数组解构 */}
      <p>前三个数字: {(([a, b, c]) => `${a}, ${b}, ${c}`)(numbers)}</p>
      
      {/* 剩余参数 */}
      <p>
        其他数字: {(([, , , ...rest]) => rest.join(', '))(numbers)}
      </p>
    </div>
  );
}
```

### 3.3 模板字符串

```jsx
function TemplateStringExample() {
  const user = {
    firstName: 'Zhang',
    lastName: 'San',
    age: 28
  };
  
  const price = 99.99;
  const discount = 0.2;
  
  return (
    <div>
      {/* 基本模板字符串 */}
      <p>{`姓名: ${user.firstName} ${user.lastName}`}</p>
      <p>{`年龄: ${user.age}岁`}</p>
      
      {/* 表达式计算 */}
      <p>{`原价: ¥${price}`}</p>
      <p>{`折扣: ${discount * 100}%`}</p>
      <p>{`实付: ¥${(price * (1 - discount)).toFixed(2)}`}</p>
      
      {/* 多行模板字符串 */}
      <pre>{`
用户信息:
  姓名: ${user.firstName} ${user.lastName}
  年龄: ${user.age}
  状态: ${user.age >= 18 ? '成年' : '未成年'}
      `}</pre>
      
      {/* 条件表达式 */}
      <p>{`欢迎 ${user.age >= 18 ? '成年' : '未成年'}用户: ${user.firstName}`}</p>
    </div>
  );
}
```

### 3.4 扩展运算符

```jsx
function SpreadExample() {
  const numbers = [1, 2, 3];
  const moreNumbers = [4, 5, 6];
  
  const user = {
    name: 'Alice',
    age: 25
  };
  
  const extraInfo = {
    email: 'alice@example.com',
    city: 'Beijing'
  };
  
  return (
    <div>
      {/* 数组扩展 */}
      <p>合并数组: {[...numbers, ...moreNumbers].join(', ')}</p>
      <p>数组复制: {[...numbers].join(', ')}</p>
      <p>添加元素: {[0, ...numbers, 4].join(', ')}</p>
      
      {/* 对象扩展（显示为JSON） */}
      <pre>
        {JSON.stringify({ ...user, ...extraInfo }, null, 2)}
      </pre>
      
      {/* 在组件属性中使用 */}
      <div {...{ className: 'container', id: 'main' }}>
        内容
      </div>
    </div>
  );
}
```

### 3.5 短路求值

```jsx
function ShortCircuitExample() {
  const user = { name: 'Alice', premium: true };
  const messages = ['消息1', '消息2', '消息3'];
  const emptyMessages = [];
  const errorMessage = null;
  
  return (
    <div>
      {/* 逻辑与短路 */}
      {user && <p>用户: {user.name}</p>}
      {user.premium && <span>高级会员</span>}
      {messages.length > 0 && <p>您有 {messages.length} 条消息</p>}
      
      {/* 逻辑或短路 */}
      <p>姓名: {user.name || '匿名'}</p>
      <p>消息: {emptyMessages.length || '暂无消息'}</p>
      
      {/* 空值合并（React 19推荐） */}
      <p>错误: {errorMessage ?? '无错误'}</p>
      <p>数量: {0 ?? '默认值'}</p>  {/* 0不会被替换 */}
      <p>数量: {0 || '默认值'}</p>  {/* 0会被替换 */}
      
      {/* 复杂短路 */}
      {user && user.premium && messages.length > 0 && (
        <div>
          <h3>高级会员消息</h3>
          <ul>
            {messages.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## 第四部分：React 19表达式新特性

### 4.1 use() Hook在表达式中的应用

React 19引入的`use()` Hook可以在表达式中直接使用Promise和Context：

```jsx
import { use } from 'react';

// 创建Promise
const fetchUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

function UserProfile({ userId }) {
  // 直接在表达式中使用Promise
  const userData = use(fetchUserData(userId));
  
  return (
    <div>
      <h2>{userData.name}</h2>
      <p>邮箱: {userData.email}</p>
      <p>年龄: {userData.age}</p>
    </div>
  );
}

// Context示例
import { createContext } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  // 直接在表达式中使用Context
  const theme = use(ThemeContext);
  
  return (
    <button className={`btn-${theme}`}>
      当前主题: {theme}
    </button>
  );
}
```

### 4.2 条件use()调用

React 19允许在条件中使用`use()`：

```jsx
function ConditionalData({ shouldFetch, dataId }) {
  // React 19新特性：条件Hook调用
  const data = shouldFetch ? use(fetchData(dataId)) : null;
  
  return (
    <div>
      {data ? (
        <div>
          <h3>{data.title}</h3>
          <p>{data.content}</p>
        </div>
      ) : (
        <p>未加载数据</p>
      )}
    </div>
  );
}
```

### 4.3 useOptimistic的表达式应用

```jsx
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  async function handleSubmit(formData) {
    const newTodo = {
      id: Date.now(),
      text: formData.get('todo'),
      completed: false
    };
    
    // 乐观更新
    addOptimisticTodo(newTodo);
    
    // 实际提交
    await addTodo(newTodo);
  }
  
  return (
    <div>
      {/* 在表达式中使用乐观状态 */}
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            {/* 显示乐观更新的指示器 */}
            {!todos.find(t => t.id === todo.id) && (
              <span> (正在保存...)</span>
            )}
          </li>
        ))}
      </ul>
      
      <form action={handleSubmit}>
        <input name="todo" />
        <button>添加</button>
      </form>
    </div>
  );
}
```

### 4.4 Server Components中的异步表达式

React 19的Server Components支持异步操作：

```jsx
// Server Component
async function UserDashboard({ userId }) {
  // 直接await数据
  const user = await fetchUser(userId);
  const posts = await fetchUserPosts(userId);
  
  return (
    <div>
      {/* 在表达式中使用异步获取的数据 */}
      <h1>{user.name}的仪表板</h1>
      <p>总共 {posts.length} 篇文章</p>
      
      {/* 计算表达式 */}
      <p>平均点赞数: {
        (posts.reduce((sum, post) => sum + post.likes, 0) / posts.length).toFixed(1)
      }</p>
      
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            {post.title} - {post.likes} 个赞
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.5 新的资源预加载表达式

React 19提供了`preinit`和`preload`API：

```jsx
import { preinit, preload } from 'react-dom';

function ProductPage({ productId }) {
  // 预加载资源
  preload(`/api/products/${productId}`, { as: 'fetch' });
  preinit('/styles/product.css', { as: 'style' });
  
  const product = use(fetchProduct(productId));
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>价格: ¥{product.price.toFixed(2)}</p>
      
      {/* 条件预加载 */}
      {product.hasVideo && (
        <>
          {preload(product.videoUrl, { as: 'video' })}
          <video src={product.videoUrl} />
        </>
      )}
    </div>
  );
}
```

## 第五部分：表达式的最佳实践

### 5.1 保持表达式简洁

#### 不好的做法

```jsx
function BadExample() {
  const users = [...]; // 假设有用户数据
  
  return (
    <div>
      {/* 过于复杂的表达式 */}
      <p>
        {users
          .filter(user => user.age > 18 && user.isActive && !user.isBanned)
          .map(user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }))
          .sort((a, b) => a.fullName.localeCompare(b.fullName))
          .slice(0, 10)
          .map(user => user.fullName)
          .join(', ')
        }
      </p>
    </div>
  );
}
```

#### 好的做法

```jsx
function GoodExample() {
  const users = [...]; // 假设有用户数据
  
  // 将复杂逻辑提取到变量
  const activeAdults = users
    .filter(user => user.age > 18 && user.isActive && !user.isBanned);
  
  const usersWithFullNames = activeAdults
    .map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    }));
  
  const topTenUsers = usersWithFullNames
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .slice(0, 10);
  
  const userNames = topTenUsers.map(user => user.fullName).join(', ');
  
  return (
    <div>
      <p>{userNames}</p>
    </div>
  );
}
```

### 5.2 避免副作用

#### 不好的做法

```jsx
let counter = 0; // 外部变量

function BadSideEffect() {
  return (
    <div>
      {/* 表达式中修改外部状态（副作用） */}
      <p>Count: {counter++}</p>
      <p>Count: {counter++}</p>  {/* 不可预测的结果 */}
    </div>
  );
}
```

#### 好的做法

```jsx
function GoodNoSideEffect() {
  const [counter, setCounter] = useState(0);
  
  return (
    <div>
      <p>Count: {counter}</p>
      <button onClick={() => setCounter(c => c + 1)}>
        增加
      </button>
    </div>
  );
}
```

### 5.3 合理使用条件渲染

#### 多种条件渲染方式对比

```jsx
function ConditionalRenderingComparison({ status }) {
  return (
    <div>
      {/* 方式1: 逻辑与 - 适合单一条件 */}
      {status === 'loading' && <Spinner />}
      
      {/* 方式2: 三元运算符 - 适合二选一 */}
      {status === 'error' ? <Error /> : <Success />}
      
      {/* 方式3: 多重三元 - 适合多个条件（但可读性差） */}
      {status === 'loading' ? <Spinner /> :
       status === 'error' ? <Error /> :
       status === 'success' ? <Success /> : null}
      
      {/* 方式4: IIFE - 适合复杂逻辑 */}
      {(() => {
        switch(status) {
          case 'loading': return <Spinner />;
          case 'error': return <Error />;
          case 'success': return <Success />;
          default: return <Default />;
        }
      })()}
      
      {/* 方式5: 提取为函数 - 最佳实践 */}
      {renderStatus(status)}
    </div>
  );
  
  function renderStatus(status) {
    switch(status) {
      case 'loading': return <Spinner />;
      case 'error': return <Error />;
      case 'success': return <Success />;
      default: return <Default />;
    }
  }
}
```

### 5.4 性能优化

#### 避免在表达式中创建新对象/数组

```jsx
// 不好 - 每次渲染都创建新对象
function BadPerformance() {
  return (
    <div style={{ padding: '20px', margin: '10px' }}>
      内容
    </div>
  );
}

// 好 - 使用常量
const containerStyle = { padding: '20px', margin: '10px' };

function GoodPerformance() {
  return (
    <div style={containerStyle}>
      内容
    </div>
  );
}

// 或使用useMemo
function OptimizedPerformance({ color }) {
  const style = useMemo(() => ({
    padding: '20px',
    margin: '10px',
    backgroundColor: color
  }), [color]);
  
  return <div style={style}>内容</div>;
}
```

#### 避免在表达式中进行昂贵的计算

```jsx
function ExpensiveCalculation({ items }) {
  // 不好 - 每次渲染都计算
  return (
    <div>
      <p>总和: {items.reduce((sum, item) => sum + item.value, 0)}</p>
    </div>
  );
}

function OptimizedCalculation({ items }) {
  // 好 - 使用useMemo缓存计算结果
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return (
    <div>
      <p>总和: {total}</p>
    </div>
  );
}
```

### 5.5 类型安全

使用TypeScript确保表达式类型安全：

```tsx
interface User {
  id: number;
  name: string;
  email?: string;
}

function TypeSafeExample({ user }: { user: User }) {
  return (
    <div>
      {/* TypeScript会检查类型 */}
      <p>ID: {user.id}</p>
      <p>姓名: {user.name}</p>
      
      {/* 可选链确保安全访问 */}
      <p>邮箱: {user.email?.toLowerCase() ?? '未设置'}</p>
      
      {/* 类型断言（谨慎使用） */}
      <p>大写姓名: {(user.name as string).toUpperCase()}</p>
    </div>
  );
}
```

## 第六部分：常见问题与解决方案

### 6.1 对象不能直接渲染

#### 问题

```jsx
function ObjectRenderError() {
  const user = { name: 'Alice', age: 25 };
  
  // 错误：Objects are not valid as a React child
  return <div>{user}</div>;
}
```

#### 解决方案

```jsx
function ObjectRenderSolution() {
  const user = { name: 'Alice', age: 25 };
  
  return (
    <div>
      {/* 方案1: 访问具体属性 */}
      <p>{user.name}</p>
      
      {/* 方案2: 转换为JSON字符串 */}
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      {/* 方案3: 遍历对象 */}
      <ul>
        {Object.entries(user).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 6.2 布尔值渲染问题

#### 问题

```jsx
function BooleanRenderIssue() {
  const count = 0;
  
  // count为0时，会显示0而不是隐藏
  return <div>{count && <p>有内容</p>}</div>;
}
```

#### 解决方案

```jsx
function BooleanRenderSolution() {
  const count = 0;
  
  return (
    <div>
      {/* 方案1: 显式布尔转换 */}
      {Boolean(count) && <p>有内容</p>}
      
      {/* 方案2: 使用比较运算符 */}
      {count > 0 && <p>有内容</p>}
      
      {/* 方案3: 使用三元运算符 */}
      {count ? <p>有内容</p> : null}
    </div>
  );
}
```

### 6.3 数组key警告

#### 问题

```jsx
function MissingKeyWarning() {
  const items = ['A', 'B', 'C'];
  
  // 警告：Each child should have a unique "key" prop
  return (
    <ul>
      {items.map(item => <li>{item}</li>)}
    </ul>
  );
}
```

#### 解决方案

```jsx
function KeySolution() {
  const items = ['A', 'B', 'C'];
  
  return (
    <ul>
      {/* 使用index作为key（仅在列表不会重排序时） */}
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
      
      {/* 更好：使用唯一标识符 */}
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

### 6.4 表达式中的异步操作

#### 问题

```jsx
// 错误：不能在表达式中使用async/await
function AsyncExpressionError() {
  return (
    <div>
      {/* 错误！ */}
      {await fetchData()}
    </div>
  );
}
```

#### 解决方案

```jsx
// 方案1: 使用useEffect
function AsyncSolution1() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  
  return <div>{data?.name}</div>;
}

// 方案2: React 19的use() Hook
import { use } from 'react';

function AsyncSolution2() {
  const data = use(fetchData());
  return <div>{data.name}</div>;
}

// 方案3: Server Component
async function AsyncSolution3() {
  const data = await fetchData();
  return <div>{data.name}</div>;
}
```

### 6.5 表达式作用域问题

#### 问题

```jsx
function ScopeIssue() {
  const items = ['A', 'B', 'C'];
  
  return (
    <div>
      {items.map((item, index) => {
        // 变量在块作用域内
        const displayText = `${index + 1}. ${item}`;
        return <div key={index}>{displayText}</div>;
      })}
      
      {/* 错误：displayText未定义 */}
      {/* <p>{displayText}</p> */}
    </div>
  );
}
```

#### 解决方案

```jsx
function ScopeSolution() {
  const items = ['A', 'B', 'C'];
  
  // 提升变量到组件作用域
  const formattedItems = items.map((item, index) => 
    `${index + 1}. ${item}`
  );
  
  return (
    <div>
      {formattedItems.map((text, index) => (
        <div key={index}>{text}</div>
      ))}
      
      <p>总共 {formattedItems.length} 项</p>
    </div>
  );
}
```

## 第七部分：实战案例

### 7.1 动态表单验证

```jsx
function DynamicFormValidation() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 验证规则
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  
  return (
    <form>
      <div>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="邮箱"
        />
        {/* 实时验证反馈 */}
        {email && (
          emailValid ? 
          <span style={{ color: 'green' }}>✓ 邮箱格式正确</span> :
          <span style={{ color: 'red' }}>✗ 邮箱格式错误</span>
        )}
      </div>
      
      <div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="密码"
        />
        {password && (
          <span style={{ color: passwordValid ? 'green' : 'red' }}>
            {passwordValid ? '✓' : '✗'} 至少8个字符
          </span>
        )}
      </div>
      
      <div>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="确认密码"
        />
        {confirmPassword && (
          <span style={{ color: passwordsMatch ? 'green' : 'red' }}>
            {passwordsMatch ? '✓ 密码匹配' : '✗ 密码不匹配'}
          </span>
        )}
      </div>
      
      <button
        type="submit"
        disabled={!emailValid || !passwordValid || !passwordsMatch}
      >
        {/* 动态按钮文本 */}
        {!emailValid || !passwordValid || !passwordsMatch ? 
          '请完成表单' : '提交注册'}
      </button>
    </form>
  );
}
```

### 7.2 购物车计算

```jsx
function ShoppingCart() {
  const [items, setItems] = useState([
    { id: 1, name: '商品A', price: 99.99, quantity: 2 },
    { id: 2, name: '商品B', price: 149.99, quantity: 1 },
    { id: 3, name: '商品C', price: 79.99, quantity: 3 }
  ]);
  
  const [couponCode, setCouponCode] = useState('');
  
  // 计算小计
  const subtotal = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  
  // 运费计算
  const shipping = subtotal > 200 ? 0 : 15;
  
  // 优惠券折扣
  const discount = (() => {
    switch(couponCode.toUpperCase()) {
      case 'SAVE10': return subtotal * 0.1;
      case 'SAVE20': return subtotal * 0.2;
      default: return 0;
    }
  })();
  
  // 总计
  const total = subtotal + shipping - discount;
  
  return (
    <div>
      <h2>购物车</h2>
      
      {/* 商品列表 */}
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>¥{item.price} × {item.quantity}</span>
          <span>= ¥{(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
      
      {/* 价格汇总 */}
      <div>
        <p>小计: ¥{subtotal.toFixed(2)}</p>
        
        <p>
          运费: {shipping === 0 ? 
            <span style={{ color: 'green' }}>免运费</span> :
            `¥${shipping.toFixed(2)}`
          }
        </p>
        
        {discount > 0 && (
          <p style={{ color: 'green' }}>
            优惠: -¥{discount.toFixed(2)}
          </p>
        )}
        
        <p>
          <strong>总计: ¥{total.toFixed(2)}</strong>
        </p>
        
        {/* 优惠券提示 */}
        {subtotal < 200 && (
          <p style={{ color: 'orange' }}>
            再购买 ¥{(200 - subtotal).toFixed(2)} 即可免运费
          </p>
        )}
      </div>
      
      {/* 优惠券输入 */}
      <div>
        <input
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          placeholder="输入优惠券代码"
        />
        {couponCode && discount === 0 && (
          <span style={{ color: 'red' }}>无效的优惠券</span>
        )}
      </div>
    </div>
  );
}
```

### 7.3 数据过滤与排序

```jsx
function ProductList() {
  const [products] = useState([
    { id: 1, name: 'iPhone 15', category: '手机', price: 5999, rating: 4.8 },
    { id: 2, name: 'MacBook Pro', category: '电脑', price: 12999, rating: 4.9 },
    { id: 3, name: 'iPad Air', category: '平板', price: 4599, rating: 4.7 },
    { id: 4, name: 'AirPods Pro', category: '耳机', price: 1899, rating: 4.6 },
    { id: 5, name: 'Apple Watch', category: '手表', price: 2999, rating: 4.5 }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 20000]);
  
  // 获取所有分类
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  // 应用所有过滤和排序
  const filteredProducts = (() => {
    let result = products;
    
    // 搜索过滤
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 分类过滤
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    // 价格范围过滤
    result = result.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    // 排序
    result = [...result].sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    return result;
  })();
  
  return (
    <div>
      <h2>产品列表</h2>
      
      {/* 过滤控件 */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="搜索产品..."
        />
        
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '所有分类' : cat}
            </option>
          ))}
        </select>
        
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">按名称</option>
          <option value="price-asc">价格从低到高</option>
          <option value="price-desc">价格从高到低</option>
          <option value="rating">按评分</option>
        </select>
      </div>
      
      {/* 结果统计 */}
      <p>
        {filteredProducts.length === 0 ? 
          '未找到匹配的产品' :
          `找到 ${filteredProducts.length} 个产品 (共 ${products.length} 个)`
        }
      </p>
      
      {/* 产品列表 */}
      <div>
        {filteredProducts.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>分类: {product.category}</p>
            <p>价格: ¥{product.price.toLocaleString()}</p>
            <p>
              评分: {product.rating} 
              {'⭐'.repeat(Math.round(product.rating))}
            </p>
          </div>
        ))}
      </div>
      
      {/* 价格统计 */}
      {filteredProducts.length > 0 && (
        <div>
          <p>
            平均价格: ¥{(
              filteredProducts.reduce((sum, p) => sum + p.price, 0) / 
              filteredProducts.length
            ).toFixed(2)}
          </p>
          <p>
            价格区间: ¥{Math.min(...filteredProducts.map(p => p.price))} - 
            ¥{Math.max(...filteredProducts.map(p => p.price))}
          </p>
        </div>
      )}
    </div>
  );
}
```

### 7.4 时间格式化与倒计时

```jsx
function TimeFormatting() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [targetDate] = useState(new Date('2025-12-31T23:59:59'));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 计算时间差
  const timeDiff = targetDate - currentTime;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return (
    <div>
      <h2>时间显示</h2>
      
      {/* 当前时间 - 多种格式 */}
      <div>
        <p>完整时间: {currentTime.toLocaleString('zh-CN')}</p>
        <p>日期: {currentTime.toLocaleDateString('zh-CN')}</p>
        <p>时间: {currentTime.toLocaleTimeString('zh-CN')}</p>
        <p>
          自定义格式: {
            `${currentTime.getFullYear()}年` +
            `${String(currentTime.getMonth() + 1).padStart(2, '0')}月` +
            `${String(currentTime.getDate()).padStart(2, '0')}日 ` +
            `${String(currentTime.getHours()).padStart(2, '0')}:` +
            `${String(currentTime.getMinutes()).padStart(2, '0')}:` +
            `${String(currentTime.getSeconds()).padStart(2, '0')}`
          }
        </p>
      </div>
      
      {/* 倒计时 */}
      <div>
        <h3>距离2025年结束还有:</h3>
        {timeDiff > 0 ? (
          <p>
            {days > 0 && `${days}天 `}
            {`${String(hours).padStart(2, '0')}:`}
            {`${String(minutes).padStart(2, '0')}:`}
            {`${String(seconds).padStart(2, '0')}`}
          </p>
        ) : (
          <p>已结束</p>
        )}
      </div>
      
      {/* 相对时间 */}
      <div>
        <p>
          问候语: {(() => {
            const hour = currentTime.getHours();
            if (hour < 6) return '凌晨好';
            if (hour < 9) return '早上好';
            if (hour < 12) return '上午好';
            if (hour < 14) return '中午好';
            if (hour < 18) return '下午好';
            return '晚上好';
          })()}
        </p>
        
        <p>
          星期: {['日', '一', '二', '三', '四', '五', '六'][currentTime.getDay()]}
        </p>
      </div>
    </div>
  );
}
```

### 7.5 React 19 Server Actions表单

```jsx
// Server Action
async function submitForm(formData) {
  'use server';
  
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  };
  
  // 验证
  if (!data.email.includes('@')) {
    return { error: '邮箱格式无效' };
  }
  
  // 保存数据
  await saveToDatabase(data);
  
  return { success: true };
}

// Client Component
'use client';
import { useActionState } from 'react';

function ContactForm() {
  const [state, formAction] = useActionState(submitForm, null);
  
  return (
    <form action={formAction}>
      <div>
        <input name="name" required placeholder="姓名" />
      </div>
      
      <div>
        <input name="email" type="email" required placeholder="邮箱" />
        {/* 显示验证错误 */}
        {state?.error && (
          <span style={{ color: 'red' }}>{state.error}</span>
        )}
      </div>
      
      <div>
        <textarea name="message" required placeholder="留言" />
      </div>
      
      <button type="submit">
        {/* 根据状态显示不同文本 */}
        {state === null ? '提交' :
         state.success ? '提交成功！' :
         '重新提交'}
      </button>
      
      {/* 成功消息 */}
      {state?.success && (
        <p style={{ color: 'green' }}>感谢您的留言！</p>
      )}
    </form>
  );
}
```

## 第八部分：总结与展望

### 8.1 核心要点回顾

1. **JSX表达式基础**
   - 使用花括号 `{}` 嵌入JavaScript表达式
   - 只能使用表达式，不能使用语句
   - 表达式会在渲染时被计算

2. **数据类型处理**
   - 字符串和数字直接显示
   - 布尔值、null和undefined不显示
   - 数组会自动拼接
   - 对象不能直接渲染

3. **高级技巧**
   - IIFE处理复杂逻辑
   - 解构赋值简化代码
   - 模板字符串格式化输出
   - 短路求值优化渲染

4. **React 19新特性**
   - `use()` Hook在表达式中使用Promise和Context
   - 条件Hook调用
   - Server Components中的异步表达式
   - 资源预加载API

5. **最佳实践**
   - 保持表达式简洁
   - 避免副作用
   - 合理使用条件渲染
   - 注意性能优化
   - 类型安全

### 8.2 学习建议

1. **多练习**：通过实际项目练习各种表达式用法
2. **阅读源码**：学习优秀开源项目的表达式写法
3. **性能意识**：始终考虑表达式的性能影响
4. **代码审查**：通过代码审查学习最佳实践
5. **保持更新**：关注React新版本的特性

### 8.3 进阶方向

- 深入学习React编译器优化
- 掌握TypeScript类型推断
- 学习函数式编程范式
- 研究性能优化技巧
- 探索Server Components架构

### 8.4 常用资源

- React官方文档：https://react.dev
- TypeScript手册：https://www.typescriptlang.org/docs
- MDN JavaScript参考：https://developer.mozilla.org
- React GitHub仓库：https://github.com/facebook/react

## 练习题

### 基础练习

1. 创建一个组件，显示当前日期和时间，每秒更新一次
2. 实现一个温度转换器（摄氏度和华氏度互转）
3. 创建一个简单的计算器，支持加减乘除运算

### 进阶练习

1. 实现一个表单验证系统，实时显示验证结果
2. 创建一个产品列表，支持搜索、过滤和排序
3. 实现一个购物车，计算小计、运费和总价

### 高级练习

1. 使用React 19的`use()` Hook实现数据获取和显示
2. 创建一个支持乐观更新的Todo应用
3. 实现一个Server Component，展示异步数据处理

通过本章的学习，你已经全面掌握了JSX表达式与嵌入的各种用法。在实际开发中，合理运用这些技巧，能够让你的代码更加简洁、高效和易于维护。继续练习，不断提升你的React开发技能！

