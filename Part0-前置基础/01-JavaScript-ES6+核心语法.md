# JavaScript ES6+核心语法完全指南

## 第一章：现代JavaScript概述

### 1.1 JavaScript发展史

JavaScript自1995年诞生以来，经历了翻天覆地的变化。从最初的浏览器脚本语言，发展成为能够运行在服务器、移动设备、桌面应用甚至物联网设备上的通用编程语言。

#### JavaScript版本演进

- 1995年：JavaScript诞生，最初名为LiveScript
- 1997年：ECMAScript 1发布，JavaScript标准化的开始
- 1999年：ECMAScript 3发布，奠定了现代JavaScript的基础
- 2009年：ECMAScript 5发布，引入严格模式、JSON等特性
- 2015年：ECMAScript 6 (ES2015)发布，这是JavaScript历史上最重要的更新
- 2016-2024年：每年发布一个新版本，持续引入新特性

#### ES6+的重要性

ES6（ECMAScript 2015）被认为是JavaScript的分水岭，它引入了大量现代编程语言特性：

- 块级作用域（let/const）
- 箭头函数
- 类和模块系统
- Promise异步处理
- 解构赋值
- 模板字符串
- 扩展运算符

ES6之后的每个版本（ES2016、ES2017...ES2024）都在持续改进JavaScript，使其更加强大和易用。学习这些现代语法对于React开发至关重要，因为React代码库和生态系统广泛使用了这些特性。

### 1.2 为什么要学习ES6+

在学习React之前，必须掌握ES6+的核心语法，原因如下：

1. React官方文档和社区代码完全基于ES6+语法
2. 现代前端工具链（Babel、Webpack等）默认支持ES6+
3. ES6+语法让代码更简洁、可读性更强
4. 理解ES6+是理解React Hooks的前提
5. 面试和实际工作中都要求掌握ES6+

## 第二章：变量声明 - let和const

### 2.1 var的问题

在ES6之前，JavaScript只有一种声明变量的方式：var。但var存在诸多问题：

#### 问题1：没有块级作用域

```javascript
// var没有块级作用域
if (true) {
  var message = "Hello";
}
console.log(message); // "Hello" - 变量泄露到外部

for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 输出3次"3"，而不是0,1,2
  }, 100);
}
```

#### 问题2：变量提升（Hoisting）

```javascript
console.log(name); // undefined，而不是报错
var name = "React";

// 实际执行顺序：
var name;
console.log(name); // undefined
name = "React";
```

#### 问题3：允许重复声明

```javascript
var user = "Alice";
var user = "Bob"; // 不会报错，直接覆盖
console.log(user); // "Bob"
```

#### 问题4：全局变量污染

```javascript
var globalVar = "I'm global";
console.log(window.globalVar); // "I'm global" - 污染全局对象
```

### 2.2 let - 块级作用域变量

let是ES6引入的新的变量声明方式，解决了var的大部分问题。

#### 基本语法

```javascript
let name = "React";
let age = 10;
let isActive = true;
```

#### 特性1：块级作用域

```javascript
// let有块级作用域
if (true) {
  let message = "Hello";
  console.log(message); // "Hello"
}
console.log(message); // ReferenceError: message is not defined

// 循环中的let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 正确输出 0, 1, 2
  }, 100);
}
```

为什么循环中的let能正常工作？因为每次迭代都会创建一个新的i变量：

```javascript
// let在循环中的实际行为
{
  let i = 0;
  setTimeout(function() { console.log(i); }, 100);
}
{
  let i = 1;
  setTimeout(function() { console.log(i); }, 100);
}
{
  let i = 2;
  setTimeout(function() { console.log(i); }, 100);
}
```

#### 特性2：暂时性死区（Temporal Dead Zone）

```javascript
// let没有变量提升
console.log(name); // ReferenceError: Cannot access 'name' before initialization
let name = "React";

// 暂时性死区示例
let x = "outer";
{
  // 进入块级作用域后，x进入暂时性死区
  console.log(x); // ReferenceError
  let x = "inner";
}
```

#### 特性3：不允许重复声明

```javascript
let user = "Alice";
let user = "Bob"; // SyntaxError: Identifier 'user' has already been declared

// 不同作用域可以同名
let name = "outer";
{
  let name = "inner"; // 这是新的变量
  console.log(name); // "inner"
}
console.log(name); // "outer"
```

#### 特性4：不会绑定到全局对象

```javascript
let globalLet = "I'm let";
console.log(window.globalLet); // undefined - 不污染全局对象
```

#### React中的let使用场景

```javascript
// 场景1：循环渲染
function renderList(items) {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // 每个i都是独立的，适合在回调中使用
    button.onClick = () => console.log(i);
  }
}

// 场景2：临时变量
function processData(data) {
  let result = [];
  let tempValue = null;
  
  for (let item of data) {
    tempValue = transform(item);
    if (tempValue) {
      result.push(tempValue);
    }
  }
  
  return result;
}

// 场景3：块级作用域隔离
function handleClick() {
  if (condition) {
    let message = "Success";
    showNotification(message);
  } else {
    let message = "Failed"; // 不同的message
    showNotification(message);
  }
}
```

### 2.3 const - 常量声明

const用于声明常量，一旦赋值就不能改变。

#### 基本语法

```javascript
const API_KEY = "abc123";
const MAX_SIZE = 100;
const CONFIG = { timeout: 3000 };
```

#### 特性1：必须初始化

```javascript
const name; // SyntaxError: Missing initializer in const declaration
const name = "React"; // 正确
```

#### 特性2：不能重新赋值

```javascript
const PI = 3.14;
PI = 3.1415; // TypeError: Assignment to constant variable

const user = "Alice";
user = "Bob"; // TypeError: Assignment to constant variable
```

#### 特性3：对象和数组的内容可以修改

这是const最容易混淆的地方：

```javascript
// const只保证引用不变，内容可以变
const obj = { name: "React" };
obj.name = "Vue"; // 允许
obj.version = 19; // 允许
console.log(obj); // { name: "Vue", version: 19 }

obj = { name: "Angular" }; // TypeError: 不能重新赋值

const arr = [1, 2, 3];
arr.push(4); // 允许
arr[0] = 0; // 允许
console.log(arr); // [0, 2, 3, 4]

arr = [5, 6, 7]; // TypeError: 不能重新赋值
```

如何真正让对象不可变？使用Object.freeze()：

```javascript
const obj = Object.freeze({ name: "React" });
obj.name = "Vue"; // 静默失败（严格模式下报错）
obj.version = 19; // 静默失败
console.log(obj); // { name: "React" }

// 深度冻结需要递归
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  });
  return obj;
}
```

#### React中的const使用场景

```javascript
// 场景1：React组件（最常见）
const UserProfile = ({ user }) => {
  return <div>{user.name}</div>;
};

// 场景2：配置对象
const API_CONFIG = {
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json"
  }
};

// 场景3：Redux action types
const ADD_TODO = "ADD_TODO";
const DELETE_TODO = "DELETE_TODO";

// 场景4：静态数据
const COLORS = ["red", "green", "blue"];
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact"
};

// 场景5：函数声明
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// 场景6：React Hooks
const MyComponent = () => {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);
  
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return <button onClick={handleClick}>{count}</button>;
};
```

### 2.4 let vs const：如何选择

#### 推荐原则

1. 默认使用const
2. 只有在需要重新赋值时使用let
3. 永远不要使用var

#### 详细规则

```javascript
// 规则1：不会改变的值用const
const API_KEY = "abc123";
const MAX_RETRIES = 3;

// 规则2：会改变的值用let
let count = 0;
count++;

// 规则3：循环计数器用let
for (let i = 0; i < 10; i++) {
  // ...
}

// 规则4：函数声明用const
const greet = (name) => {
  return `Hello, ${name}!`;
};

// 规则5：React组件用const
const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};

// 规则6：对象和数组通常用const（除非要重新赋值）
const user = { name: "Alice" };
user.age = 25; // 可以修改属性

const numbers = [1, 2, 3];
numbers.push(4); // 可以修改数组

// 规则7：需要重新赋值的用let
let result = null;
if (condition) {
  result = "success";
} else {
  result = "failure";
}
```

#### React开发最佳实践

```javascript
// 好的实践
const MyComponent = () => {
  // State用const
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 引用用const
  const inputRef = useRef(null);
  
  // 回调函数用const
  const handleSubmit = useCallback(() => {
    // ...
  }, []);
  
  // 计算值用const
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);
  
  // 临时变量用let（少见）
  let tempResult = null;
  for (let item of data) {
    if (item.active) {
      tempResult = item;
      break;
    }
  }
  
  return <div>{total}</div>;
};

// 避免的实践
var count = 0; // 不要用var
let Component = () => {}; // 组件用const
const i = 0; i++; // 会报错，应该用let
```

## 第三章：箭头函数

### 3.1 箭头函数基础

箭头函数是ES6引入的新的函数定义方式，提供了更简洁的语法。

#### 基本语法

```javascript
// 传统函数
function add(a, b) {
  return a + b;
}

// 箭头函数 - 完整形式
const add = (a, b) => {
  return a + b;
};

// 箭头函数 - 简写形式（单个表达式）
const add = (a, b) => a + b;

// 单个参数可以省略括号
const square = x => x * x;

// 无参数需要空括号
const greet = () => "Hello!";

// 返回对象需要加括号
const makeObject = (name, age) => ({ name, age });
```

#### 多种形式对比

```javascript
// 0个参数
const sayHi = () => console.log("Hi");
const sayHi = function() { console.log("Hi"); };

// 1个参数
const double = x => x * 2;
const double = function(x) { return x * 2; };

// 多个参数
const add = (a, b) => a + b;
const add = function(a, b) { return a + b; };

// 多行函数体
const process = (data) => {
  const result = data.filter(x => x > 0);
  const sum = result.reduce((a, b) => a + b, 0);
  return sum;
};

// 返回对象（注意括号）
const makePerson = (name, age) => ({ name, age });
const makePerson = (name, age) => {
  return { name, age };
};
```

### 3.2 this绑定的区别

这是箭头函数最重要的特性：箭头函数不绑定自己的this。

#### 传统函数的this问题

```javascript
// 问题1：方法中的this丢失
const person = {
  name: "Alice",
  greet: function() {
    console.log("Hello, " + this.name);
  }
};

person.greet(); // "Hello, Alice"
const greetFunc = person.greet;
greetFunc(); // "Hello, undefined" - this丢失

// 问题2：回调函数中的this
const counter = {
  count: 0,
  start: function() {
    setInterval(function() {
      this.count++; // this指向window，不是counter
      console.log(this.count);
    }, 1000);
  }
};

// 传统解决方案1：保存this
const counter = {
  count: 0,
  start: function() {
    const self = this; // 保存this引用
    setInterval(function() {
      self.count++;
      console.log(self.count);
    }, 1000);
  }
};

// 传统解决方案2：bind
const counter = {
  count: 0,
  start: function() {
    setInterval(function() {
      this.count++;
      console.log(this.count);
    }.bind(this), 1000);
  }
};
```

#### 箭头函数解决this问题

```javascript
// 箭头函数继承外层this
const counter = {
  count: 0,
  start: function() {
    setInterval(() => {
      this.count++; // this指向counter
      console.log(this.count);
    }, 1000);
  }
};

// 完整示例
const calculator = {
  value: 0,
  add: function(arr) {
    // 箭头函数没有自己的this，使用外层的this
    arr.forEach(num => {
      this.value += num; // this指向calculator
    });
  }
};

calculator.add([1, 2, 3]);
console.log(calculator.value); // 6
```

#### React中的应用

```javascript
// 场景1：Class组件中的事件处理
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  // 方式1：箭头函数自动绑定this
  handleClick = () => {
    this.setState({ count: this.state.count + 1 });
  }
  
  // 方式2：传统方法需要bind
  handleClick2() {
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>点击</button>
        <button onClick={this.handleClick2.bind(this)}>点击</button>
      </div>
    );
  }
}

// 场景2：函数组件中的回调
const UserList = ({ users }) => {
  const handleDelete = (id) => {
    // 使用箭头函数，可以访问外层的props
    console.log("Deleting user:", id);
    deleteUser(id);
  };
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
          <button onClick={() => handleDelete(user.id)}>删除</button>
        </li>
      ))}
    </ul>
  );
};

// 场景3：useEffect中的定时器
const Timer = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // 箭头函数可以访问外层的setCount
      setCount(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <div>{count}</div>;
};
```

### 3.3 箭头函数的限制

箭头函数虽然强大，但也有一些限制。

#### 限制1：不能用作构造函数

```javascript
const Person = (name) => {
  this.name = name;
};

const alice = new Person("Alice"); // TypeError: Person is not a constructor
```

#### 限制2：没有arguments对象

```javascript
// 传统函数有arguments
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

// 箭头函数没有arguments
const sum = () => {
  console.log(arguments); // ReferenceError: arguments is not defined
};

// 解决方案：使用剩余参数
const sum = (...args) => {
  return args.reduce((a, b) => a + b, 0);
};
sum(1, 2, 3); // 6
```

#### 限制3：不能用作生成器函数

```javascript
// 传统函数可以是生成器
function* generator() {
  yield 1;
  yield 2;
}

// 箭头函数不能是生成器
const generator = *() => { // SyntaxError
  yield 1;
};
```

#### 限制4：不适合作为对象方法

```javascript
// 不推荐：箭头函数作为方法
const calculator = {
  value: 0,
  add: (num) => {
    this.value += num; // this不指向calculator
  }
};

// 推荐：传统函数或简写方法
const calculator = {
  value: 0,
  add(num) {
    this.value += num;
  },
  // 或者
  subtract: function(num) {
    this.value -= num;
  }
};
```

### 3.4 箭头函数最佳实践

#### 实践1：回调函数优先使用箭头函数

```javascript
// 好
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);

// 不好
const doubled = numbers.map(function(n) {
  return n * 2;
});

// 好
users.filter(user => user.active)
     .map(user => user.name)
     .forEach(name => console.log(name));
```

#### 实践2：React事件处理器

```javascript
// 好：使用箭头函数
const Button = ({ onClick, children }) => {
  const handleClick = () => {
    console.log("Clicked");
    onClick?.();
  };
  
  return <button onClick={handleClick}>{children}</button>;
};

// 好：内联箭头函数（简单逻辑）
const Button = ({ onClick }) => {
  return (
    <button onClick={() => console.log("Clicked")}>
      Click
    </button>
  );
};
```

#### 实践3：Hooks回调

```javascript
// useEffect
useEffect(() => {
  fetchData();
  return () => cleanup();
}, []);

// useMemo
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);

// useCallback
const handleSubmit = useCallback(() => {
  submitForm(data);
}, [data]);
```

#### 实践4：Promise链

```javascript
// 好：箭头函数
fetchUser(id)
  .then(user => user.profile)
  .then(profile => processProfile(profile))
  .catch(error => handleError(error));

// 更好：async/await
const loadUser = async (id) => {
  try {
    const user = await fetchUser(id);
    const profile = await processProfile(user.profile);
    return profile;
  } catch (error) {
    handleError(error);
  }
};
```

## 第四章：模板字符串

### 4.1 基本语法

模板字符串使用反引号（`）定义，可以包含变量和表达式。

```javascript
// 传统字符串拼接
const name = "Alice";
const greeting = "Hello, " + name + "!";

// 模板字符串
const greeting = `Hello, ${name}!`;

// 多行字符串
const multiline = `
  This is a
  multiline
  string
`;

// 表达式嵌入
const a = 5;
const b = 10;
console.log(`Sum: ${a + b}`); // "Sum: 15"
console.log(`Product: ${a * b}`); // "Product: 50"
```

### 4.2 高级用法

#### 嵌入复杂表达式

```javascript
const user = { name: "Alice", age: 25 };

// 对象属性
console.log(`User: ${user.name}`);

// 函数调用
const format = (str) => str.toUpperCase();
console.log(`Name: ${format(user.name)}`); // "Name: ALICE"

// 三元运算符
const status = user.age >= 18 ? "Adult" : "Minor";
console.log(`Status: ${status}`);

// 直接在模板中使用
console.log(`Status: ${user.age >= 18 ? "Adult" : "Minor"}`);
```

#### 嵌套模板字符串

```javascript
const items = ["apple", "banana", "orange"];

const html = `
  <ul>
    ${items.map(item => `
      <li>${item}</li>
    `).join('')}
  </ul>
`;
```

#### 标签模板

```javascript
// 自定义标签函数
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] ? `<mark>${values[i]}</mark>` : '');
  }, '');
}

const name = "Alice";
const age = 25;
const message = highlight`Name: ${name}, Age: ${age}`;
// "Name: <mark>Alice</mark>, Age: <mark>25</mark>"
```

### 4.3 React中的应用

```javascript
// JSX中的类名
const Button = ({ primary, disabled }) => {
  const className = `btn ${primary ? 'btn-primary' : 'btn-secondary'} ${disabled ? 'disabled' : ''}`;
  return <button className={className}>Click</button>;
};

// 样式对象
const Card = ({ width, height }) => {
  const style = {
    width: `${width}px`,
    height: `${height}px`
  };
  return <div style={style}>Card</div>;
};

// API调用
const fetchUser = (id) => {
  return fetch(`/api/users/${id}`)
    .then(res => res.json());
};

// 错误消息
const ErrorMessage = ({ field, error }) => {
  const message = `${field} ${error.type === 'required' ? 'is required' : 'is invalid'}`;
  return <div className="error">{message}</div>;
};
```

## 第五章：解构赋值

### 5.1 数组解构

```javascript
// 基本解构
const arr = [1, 2, 3];
const [a, b, c] = arr;
console.log(a, b, c); // 1 2 3

// 跳过元素
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1 3

// 默认值
const [x = 0, y = 0] = [1];
console.log(x, y); // 1 0

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

// 交换变量
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1
```

### 5.2 对象解构

```javascript
// 基本解构
const user = { name: "Alice", age: 25 };
const { name, age } = user;
console.log(name, age); // "Alice" 25

// 重命名
const { name: userName, age: userAge } = user;
console.log(userName, userAge); // "Alice" 25

// 默认值
const { name, age, country = "USA" } = user;
console.log(country); // "USA"

// 嵌套解构
const data = {
  user: {
    name: "Alice",
    profile: {
      avatar: "url"
    }
  }
};

const { user: { name, profile: { avatar } } } = data;
console.log(name, avatar); // "Alice" "url"

// 剩余属性
const { name, ...rest } = { name: "Alice", age: 25, city: "NY" };
console.log(rest); // { age: 25, city: "NY" }
```

### 5.3 函数参数解构

```javascript
// 对象参数解构
function greet({ name, age }) {
  console.log(`Hello ${name}, you are ${age}`);
}
greet({ name: "Alice", age: 25 });

// 默认值
function createUser({ name = "Guest", age = 18 } = {}) {
  return { name, age };
}
console.log(createUser()); // { name: "Guest", age: 18 }
console.log(createUser({ name: "Alice" })); // { name: "Alice", age: 18 }

// 数组参数解构
function sum([a, b]) {
  return a + b;
}
console.log(sum([1, 2])); // 3
```

### 5.4 React中的解构

```javascript
// Props解构
const UserCard = ({ name, age, avatar }) => {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{age} years old</p>
    </div>
  );
};

// State解构
const Counter = () => {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "", email: "" });
  
  return <div>{count}</div>;
};

// useContext解构
const { theme, setTheme } = useContext(ThemeContext);

// 事件对象解构
const handleSubmit = ({ target, preventDefault }) => {
  preventDefault();
  const formData = new FormData(target);
};

// 剩余props
const Button = ({ children, onClick, ...rest }) => {
  return (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  );
};
```

## 第六章：扩展运算符

### 6.1 数组扩展

```javascript
// 复制数组
const arr = [1, 2, 3];
const copy = [...arr];

// 合并数组
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4]

// 数组转参数
const numbers = [1, 2, 3];
console.log(Math.max(...numbers)); // 3

// 数组去重
const arr = [1, 2, 2, 3, 3];
const unique = [...new Set(arr)]; // [1, 2, 3]

// 字符串转数组
const str = "hello";
const chars = [...str]; // ['h', 'e', 'l', 'l', 'o']
```

### 6.2 对象扩展

```javascript
// 复制对象
const obj = { a: 1, b: 2 };
const copy = { ...obj };

// 合并对象
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3, d: 4 };
const merged = { ...obj1, ...obj2 };

// 属性覆盖
const obj = { a: 1, b: 2 };
const updated = { ...obj, b: 3 }; // { a: 1, b: 3 }

// 条件属性
const user = {
  name: "Alice",
  ...(includeAge && { age: 25 }),
  ...(includeEmail && { email: "alice@example.com" })
};
```

### 6.3 React中的应用

```javascript
// Props传递
const ParentComponent = () => {
  const props = { name: "Alice", age: 25 };
  return <ChildComponent {...props} />;
};

// State更新（不可变更新）
const [user, setUser] = useState({ name: "Alice", age: 25 });

// 添加属性
setUser({ ...user, email: "alice@example.com" });

// 更新属性
setUser({ ...user, age: 26 });

// 删除属性
const { age, ...rest } = user;
setUser(rest);

// 数组State更新
const [items, setItems] = useState([1, 2, 3]);

// 添加元素
setItems([...items, 4]);

// 移除元素
setItems(items.filter(item => item !== 2));

// 更新元素
setItems(items.map(item => item === 2 ? 20 : item));
```

## 第七章：Promise和异步编程

### 7.1 Promise基础

```javascript
// 创建Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 1000);
});

// 使用Promise
promise
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Promise链
fetch("/api/user")
  .then(response => response.json())
  .then(data => data.profile)
  .then(profile => console.log(profile))
  .catch(error => console.error(error));
```

### 7.2 async/await

```javascript
// async函数
async function fetchUser() {
  const response = await fetch("/api/user");
  const data = await response.json();
  return data;
}

// 错误处理
async function loadUser() {
  try {
    const user = await fetchUser();
    console.log(user);
  } catch (error) {
    console.error(error);
  }
}

// 并行执行
async function loadData() {
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts()
  ]);
  return { users, posts };
}
```

### 7.3 React中的异步处理

```javascript
// useEffect中的异步
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
};

// React 19的use() Hook
const UserProfile = ({ userId }) => {
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
};
```

## 第八章：模块化（import/export）

### 8.1 导出

```javascript
// 命名导出
export const name = "Alice";
export function greet() {
  console.log("Hello");
}

// 默认导出
export default function Component() {
  return <div>Component</div>;
}

// 批量导出
const a = 1;
const b = 2;
export { a, b };
```

### 8.2 导入

```javascript
// 命名导入
import { name, greet } from './module';

// 默认导入
import Component from './Component';

// 全部导入
import * as utils from './utils';

// 重命名导入
import { name as userName } from './module';

// 混合导入
import React, { useState, useEffect } from 'react';
```

### 8.3 React中的模块化

```javascript
// 组件导出
// Button.jsx
export const Button = ({ children }) => {
  return <button>{children}</button>;
};

// 导入使用
import { Button } from './Button';

// 工具函数模块
// utils.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// 导入使用
import { formatDate, capitalize } from './utils';
```

## 第九章：数组方法

### 9.1 map

```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2); // [2, 4, 6]

// React中的列表渲染
const UserList = ({ users }) => {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### 9.2 filter

```javascript
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// React中的条件渲染
const ActiveUsers = ({ users }) => {
  const activeUsers = users.filter(user => user.active);
  return (
    <ul>
      {activeUsers.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### 9.3 reduce

```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, n) => acc + n, 0); // 10

// React中计算总和
const CartTotal = ({ items }) => {
  const total = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  
  return <div>Total: ${total}</div>;
};
```

### 9.4 其他常用方法

```javascript
// find
const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
const user = users.find(u => u.id === 2); // { id: 2, name: "Bob" }

// findIndex
const index = users.findIndex(u => u.id === 2); // 1

// some
const hasAdmin = users.some(u => u.role === "admin");

// every
const allActive = users.every(u => u.active);

// includes
const arr = [1, 2, 3];
arr.includes(2); // true
```

## 第十章：ES6+综合应用

### 10.1 React组件完整示例

```javascript
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 使用所有ES6+特性的React组件
const UserManagement = ({ initialUsers = [] }) => {
  // 解构和默认参数
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // async/await
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // 数组方法和模板字符串
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);
  
  // 箭头函数和解构
  const handleDelete = useCallback((id) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  }, []);
  
  // 扩展运算符
  const handleUpdate = useCallback((id, updates) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === id ? { ...user, ...updates } : user
      )
    );
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  // JSX和模板字符串
  return (
    <div className="user-management">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search users..."
      />
      
      <div className={`user-count ${filteredUsers.length === 0 ? 'empty' : ''}`}>
        {`Found ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
      </div>
      
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>
            <span>{user.name}</span>
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
```

## 总结

掌握ES6+语法是学习React的基础，本章详细介绍了：

1. let/const变量声明
2. 箭头函数和this绑定
3. 模板字符串
4. 解构赋值
5. 扩展运算符
6. Promise和async/await
7. 模块化import/export
8. 数组方法

这些特性在React开发中无处不在，熟练掌握它们将大大提升开发效率。在接下来的章节中，我们将正式进入React的学习。


