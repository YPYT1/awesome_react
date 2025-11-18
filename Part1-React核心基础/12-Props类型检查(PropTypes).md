# Props类型检查(PropTypes)

## 学习目标

通过本章学习，你将掌握：

- PropTypes的作用与重要性
- PropTypes的完整使用方法
- 各种PropTypes验证器详解
- 自定义验证器的编写
- TypeScript替代方案
- React 19中的类型检查最佳实践
- 常见问题与调试技巧

## 第一部分：PropTypes基础

### 1.1 为什么需要类型检查

#### 问题场景

```jsx
// 没有类型检查的组件
function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>年龄: {user.age}</span>
    </div>
  );
}

// 使用时传错了类型
<UserCard user="Alice" />  // 传的是字符串，不是对象
// 运行时错误：Cannot read property 'name' of undefined

<UserCard user={{ name: 'Alice' }} />  // 缺少email
// 显示：undefined

<UserCard user={{ name: 'Alice', email: 'alice@example.com', age: '25' }} />
// age是字符串而不是数字，可能导致计算错误
```

#### 类型检查的好处

```jsx
// 有类型检查的组件
import PropTypes from 'prop-types';

function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>年龄: {user.age}</span>
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    age: PropTypes.number
  }).isRequired
};

// 使用时传错类型会在控制台警告
<UserCard user="Alice" />
// Warning: Failed prop type: Invalid prop `user` of type `string` 
// supplied to `UserCard`, expected `object`.

// 好处：
// 1. 开发时即时发现错误
// 2. 作为组件文档
// 3. 提升代码可维护性
// 4. 防止运行时错误
```

### 1.2 安装和配置

#### 安装PropTypes

```bash
# npm
npm install prop-types

# yarn
yarn add prop-types

# pnpm
pnpm add prop-types
```

#### 导入使用

```jsx
// 导入PropTypes库
import PropTypes from 'prop-types';

function MyComponent({ name, age }) {
  return <div>{name}, {age}</div>;
}

// 添加类型检查
MyComponent.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number
};

// 也可以在类组件中使用
class MyComponent extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    age: PropTypes.number
  };
  
  render() {
    return <div>{this.props.name}, {this.props.age}</div>;
  }
}
```

### 1.3 基本使用

#### 简单验证

```jsx
import PropTypes from 'prop-types';

function Greeting({ name, age, isOnline }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>年龄: {age}</p>
      <p>状态: {isOnline ? '在线' : '离线'}</p>
    </div>
  );
}

Greeting.propTypes = {
  name: PropTypes.string,      // 字符串
  age: PropTypes.number,       // 数字
  isOnline: PropTypes.bool     // 布尔值
};

// 正确使用
<Greeting name="Alice" age={25} isOnline={true} />

// 错误使用（会有控制台警告）
<Greeting name={123} age="25" isOnline="yes" />
```

#### 必需的Props

```jsx
function UserProfile({ userId, username, email }) {
  return (
    <div>
      <p>ID: {userId}</p>
      <p>用户名: {username}</p>
      <p>邮箱: {email}</p>
    </div>
  );
}

UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,    // 必需的字符串
  username: PropTypes.string.isRequired,  // 必需的字符串
  email: PropTypes.string                 // 可选的字符串
};

// 正确
<UserProfile userId="123" username="Alice" email="alice@example.com" />
<UserProfile userId="123" username="Alice" />  // email可选

// 错误：缺少必需的props
<UserProfile username="Alice" />
// Warning: Failed prop type: The prop `userId` is marked as required 
// in `UserProfile`, but its value is `undefined`.
```

## 第二部分：PropTypes验证器详解

### 2.1 基本类型验证

```jsx
import PropTypes from 'prop-types';

function AllTypes(props) {
  return <div>All types demo</div>;
}

AllTypes.propTypes = {
  // JavaScript基本类型
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,
  optionalBigInt: PropTypes.bigint,
  
  // 任何可渲染的内容：数字、字符串、元素、数组
  optionalNode: PropTypes.node,
  
  // React元素
  optionalElement: PropTypes.element,
  
  // React元素类型（即MyComponent）
  optionalElementType: PropTypes.elementType
};

// 使用示例
<AllTypes
  optionalArray={[1, 2, 3]}
  optionalBool={true}
  optionalFunc={() => {}}
  optionalNumber={42}
  optionalObject={{ key: 'value' }}
  optionalString="hello"
  optionalSymbol={Symbol('test')}
  optionalBigInt={9007199254740991n}
  optionalNode={<div>Node</div>}
  optionalElement={<Component />}
  optionalElementType={Component}
/>
```

### 2.2 高级类型验证

#### 枚举类型

```jsx
function StatusBadge({ status, priority }) {
  return <div className={status}>{priority}</div>;
}

StatusBadge.propTypes = {
  // 值必须是指定的几个之一
  status: PropTypes.oneOf(['pending', 'active', 'completed', 'cancelled']),
  
  // 也可以用于数字枚举
  priority: PropTypes.oneOf([1, 2, 3, 4, 5])
};

// 正确
<StatusBadge status="active" priority={3} />

// 错误
<StatusBadge status="unknown" priority={10} />
// Warning: Invalid prop `status` of value `unknown`
```

#### 多类型之一

```jsx
function FlexibleComponent({ value, id }) {
  return <div id={id}>{value}</div>;
}

FlexibleComponent.propTypes = {
  // value可以是字符串或数字
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  
  // id可以是字符串或数字
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

// 正确
<FlexibleComponent value="hello" id="123" />
<FlexibleComponent value={42} id={456} />

// 错误
<FlexibleComponent value={true} id="123" />
// Warning: Invalid prop `value` of type `boolean`
```

#### 数组类型验证

```jsx
function NumberList({ numbers, users }) {
  return (
    <div>
      {numbers.map(n => <span key={n}>{n}</span>)}
      {users.map(u => <div key={u.id}>{u.name}</div>)}
    </div>
  );
}

NumberList.propTypes = {
  // 数组的每个元素都必须是数字
  numbers: PropTypes.arrayOf(PropTypes.number),
  
  // 数组的每个元素都必须是特定形状的对象
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  )
};

// 正确
<NumberList 
  numbers={[1, 2, 3, 4, 5]}
  users={[
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]}
/>

// 错误
<NumberList numbers={[1, '2', 3]} />
// Warning: Invalid prop `numbers[1]` of type `string`
```

#### 对象类型验证

```jsx
function ConfigPanel({ config, userScores }) {
  return <div>{/* ... */}</div>;
}

ConfigPanel.propTypes = {
  // 对象的所有属性值必须是数字
  userScores: PropTypes.objectOf(PropTypes.number),
  
  // 对象必须有特定的形状
  config: PropTypes.shape({
    apiUrl: PropTypes.string.isRequired,
    timeout: PropTypes.number,
    retries: PropTypes.number,
    headers: PropTypes.object
  })
};

// 正确
<ConfigPanel
  userScores={{ alice: 95, bob: 87, charlie: 92 }}
  config={{
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  }}
/>

// 错误
<ConfigPanel
  userScores={{ alice: 95, bob: '87' }}  // bob的值是字符串
  config={{ timeout: 5000 }}  // 缺少必需的apiUrl
/>
```

#### 精确对象形状

```jsx
function StrictConfig({ settings }) {
  return <div>{/* ... */}</div>;
}

StrictConfig.propTypes = {
  // 使用exact：对象不能有额外的属性
  settings: PropTypes.exact({
    theme: PropTypes.string,
    language: PropTypes.string
  })
};

// 正确
<StrictConfig settings={{ theme: 'dark', language: 'en' }} />

// 错误：有额外的属性
<StrictConfig settings={{ theme: 'dark', language: 'en', extra: 'value' }} />
// Warning: Invalid prop `settings` supplied to `StrictConfig`. 
// Has extra properties: extra
```

### 2.3 实例和类型验证

```jsx
class Message {
  constructor(text) {
    this.text = text;
  }
}

function MessageDisplay({ message, date }) {
  return (
    <div>
      <p>{message.text}</p>
      <time>{date.toLocaleString()}</time>
    </div>
  );
}

MessageDisplay.propTypes = {
  // 必须是Message类的实例
  message: PropTypes.instanceOf(Message),
  
  // 必须是Date类的实例
  date: PropTypes.instanceOf(Date)
};

// 正确
<MessageDisplay 
  message={new Message('Hello')}
  date={new Date()}
/>

// 错误
<MessageDisplay 
  message={{ text: 'Hello' }}  // 不是Message实例
  date="2025-01-01"  // 不是Date实例
/>
```

### 2.4 可渲染内容验证

```jsx
function Container({ children, header, icon }) {
  return (
    <div>
      <div className="header">{header}</div>
      {icon}
      <div className="content">{children}</div>
    </div>
  );
}

Container.propTypes = {
  // node：任何可渲染的内容（数字、字符串、元素、数组等）
  children: PropTypes.node,
  
  // element：必须是单个React元素
  header: PropTypes.element,
  
  // elementType：React组件类型
  icon: PropTypes.elementType
};

// 正确
<Container 
  header={<h1>Title</h1>}
  icon={IconComponent}
>
  <p>Content</p>
  <p>More content</p>
</Container>

// 错误
<Container 
  header="Title"  // 应该是元素，不是字符串
  icon={<IconComponent />}  // 应该是类型，不是实例
>
  Content
</Container>
```

## 第三部分：自定义验证器

### 3.1 基本自定义验证器

```jsx
function EmailInput({ email }) {
  return <input type="email" value={email} />;
}

EmailInput.propTypes = {
  email: function(props, propName, componentName) {
    const email = props[propName];
    
    // 检查是否为字符串
    if (typeof email !== 'string') {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof email}\` ` +
        `supplied to \`${componentName}\`, expected \`string\`.`
      );
    }
    
    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
        `\`${email}\` is not a valid email address.`
      );
    }
    
    // 验证通过，返回null
    return null;
  }
};

// 正确
<EmailInput email="alice@example.com" />

// 错误
<EmailInput email="invalid-email" />
// Error: Invalid prop `email` supplied to `EmailInput`. 
// `invalid-email` is not a valid email address.
```

### 3.2 可复用的自定义验证器

```jsx
// 创建可复用的验证器工厂函数
function createRangeValidator(min, max) {
  return function(props, propName, componentName) {
    const value = props[propName];
    
    if (value == null) {
      return null;  // 允许undefined/null
    }
    
    if (typeof value !== 'number') {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof value}\` ` +
        `supplied to \`${componentName}\`, expected \`number\`.`
      );
    }
    
    if (value < min || value > max) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
        `Value ${value} is out of range [${min}, ${max}].`
      );
    }
    
    return null;
  };
}

// 使用自定义验证器
function AgeInput({ age }) {
  return <input type="number" value={age} />;
}

AgeInput.propTypes = {
  age: createRangeValidator(0, 150)
};

function ScoreInput({ score }) {
  return <input type="number" value={score} />;
}

ScoreInput.propTypes = {
  score: createRangeValidator(0, 100)
};
```

### 3.3 数组元素验证器

```jsx
// 自定义数组验证器
function createArrayValidator(elementValidator) {
  return function(props, propName, componentName) {
    const arr = props[propName];
    
    if (!Array.isArray(arr)) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`, ` +
        `expected an array.`
      );
    }
    
    for (let i = 0; i < arr.length; i++) {
      const error = elementValidator(
        { [propName]: arr[i] },
        propName,
        componentName,
        'prop',
        `${propName}[${i}]`
      );
      
      if (error) {
        return error;
      }
    }
    
    return null;
  };
}

// 使用
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
    </ul>
  );
}

const todoValidator = PropTypes.shape({
  id: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  completed: PropTypes.bool
});

TodoList.propTypes = {
  todos: createArrayValidator(todoValidator)
};
```

### 3.4 条件验证器

```jsx
function ConditionalComponent({ type, value, options }) {
  return <div>{/* ... */}</div>;
}

ConditionalComponent.propTypes = {
  type: PropTypes.oneOf(['text', 'number', 'select']).isRequired,
  
  // 根据type的值验证value
  value: function(props, propName, componentName) {
    const { type, value } = props;
    
    if (type === 'number' && typeof value !== 'number') {
      return new Error(
        `When \`type\` is "number", \`${propName}\` must be a number. ` +
        `Got ${typeof value} instead.`
      );
    }
    
    if (type === 'text' && typeof value !== 'string') {
      return new Error(
        `When \`type\` is "text", \`${propName}\` must be a string. ` +
        `Got ${typeof value} instead.`
      );
    }
    
    return null;
  },
  
  // 当type为'select'时，options是必需的
  options: function(props, propName, componentName) {
    const { type, options } = props;
    
    if (type === 'select') {
      if (!options) {
        return new Error(
          `The prop \`${propName}\` is marked as required in ` +
          `\`${componentName}\` when \`type\` is "select", ` +
          `but its value is \`undefined\`.`
        );
      }
      
      if (!Array.isArray(options)) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`, ` +
          `expected an array.`
        );
      }
    }
    
    return null;
  }
};

// 正确
<ConditionalComponent type="number" value={42} />
<ConditionalComponent type="text" value="hello" />
<ConditionalComponent type="select" value="a" options={['a', 'b', 'c']} />

// 错误
<ConditionalComponent type="number" value="42" />
// Error: When `type` is "number", `value` must be a number.

<ConditionalComponent type="select" value="a" />
// Error: The prop `options` is marked as required when `type` is "select"
```

## 第四部分：复杂场景的PropTypes

### 4.1 嵌套对象验证

```jsx
function UserProfile({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.address.city}, {user.address.country}</p>
      <p>{user.contacts.email}</p>
    </div>
  );
}

UserProfile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    
    // 嵌套对象
    address: PropTypes.shape({
      city: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
      zipCode: PropTypes.string
    }).isRequired,
    
    // 另一个嵌套对象
    contacts: PropTypes.shape({
      email: PropTypes.string.isRequired,
      phone: PropTypes.string,
      social: PropTypes.shape({
        twitter: PropTypes.string,
        github: PropTypes.string
      })
    })
  }).isRequired
};
```

### 4.2 联合类型验证

```jsx
function DataDisplay({ data }) {
  if (Array.isArray(data)) {
    return <ul>{data.map((item, i) => <li key={i}>{item}</li>)}</ul>;
  }
  
  if (typeof data === 'object') {
    return (
      <dl>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  
  return <div>{data}</div>;
}

DataDisplay.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.number
    })
  ]).isRequired
};

// 正确
<DataDisplay data="hello" />
<DataDisplay data={42} />
<DataDisplay data={['a', 'b', 'c']} />
<DataDisplay data={{ title: 'Score', value: 95 }} />
```

### 4.3 函数签名验证

```jsx
function Button({ onClick, onHover, validator }) {
  return <button onClick={onClick} onMouseEnter={onHover}>Click</button>;
}

// 自定义函数验证器
function createFunctionValidator(argCount) {
  return function(props, propName, componentName) {
    const fn = props[propName];
    
    if (fn == null) {
      return null;  // 允许undefined
    }
    
    if (typeof fn !== 'function') {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof fn}\` ` +
        `supplied to \`${componentName}\`, expected \`function\`.`
      );
    }
    
    if (fn.length !== argCount) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
        `Expected function with ${argCount} argument(s), ` +
        `but got function with ${fn.length} argument(s).`
      );
    }
    
    return null;
  };
}

Button.propTypes = {
  onClick: createFunctionValidator(1),  // 期望1个参数（event）
  onHover: createFunctionValidator(1),
  validator: createFunctionValidator(2)  // 期望2个参数
};
```

### 4.4 递归结构验证

```jsx
// 树形结构的验证
function TreeNode({ node }) {
  return (
    <div>
      <div>{node.label}</div>
      {node.children && (
        <div style={{ marginLeft: 20 }}>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

// 定义递归的PropType
const nodePropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
      // 注意：这里不能再添加children，否则会无限递归
      // 需要使用自定义验证器来实现真正的递归验证
    })
  )
});

TreeNode.propTypes = {
  node: nodePropType
};

// 如果需要真正的递归验证，使用自定义验证器
function createTreeNodeValidator() {
  function validateNode(props, propName, componentName, location, propFullName) {
    const node = props[propName];
    
    if (node == null) {
      return null;
    }
    
    if (typeof node !== 'object') {
      return new Error(`Invalid ${location} \`${propFullName}\``);
    }
    
    if (!node.id || !node.label) {
      return new Error(
        `Invalid ${location} \`${propFullName}\`. ` +
        `Missing required properties: id and label.`
      );
    }
    
    if (node.children) {
      if (!Array.isArray(node.children)) {
        return new Error(
          `Invalid ${location} \`${propFullName}.children\`. ` +
          `Expected array.`
        );
      }
      
      // 递归验证子节点
      for (let i = 0; i < node.children.length; i++) {
        const error = validateNode(
          { [propName]: node.children[i] },
          propName,
          componentName,
          location,
          `${propFullName}.children[${i}]`
        );
        
        if (error) {
          return error;
        }
      }
    }
    
    return null;
  }
  
  return validateNode;
}

TreeNode.propTypes = {
  node: createTreeNodeValidator()
};
```

## 第五部分：PropTypes的调试和开发工具

### 5.1 开发环境vs生产环境

```jsx
// PropTypes只在开发环境中运行
// 生产环境会被自动移除（使用webpack等打包工具）

function MyComponent({ name }) {
  return <div>{name}</div>;
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired
};

// 开发环境（NODE_ENV=development）
// - PropTypes会检查并在控制台显示警告

// 生产环境（NODE_ENV=production）
// - PropTypes代码会被完全移除，不影响性能
```

### 5.2 禁用PropTypes警告

```jsx
// 临时禁用某个组件的PropTypes（不推荐）
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Failed prop type')) {
    return;
  }
  originalConsoleError(...args);
};

// 在特定环境禁用PropTypes
if (process.env.DISABLE_PROPTYPES === 'true') {
  // 不定义propTypes
} else {
  MyComponent.propTypes = {
    // ...
  };
}
```

### 5.3 自定义警告处理

```jsx
// 自定义PropTypes错误处理
function createWarningLogger(componentName) {
  return function(props, propName, componentNameFromValidator) {
    const validator = PropTypes.string.isRequired;
    const error = validator(props, propName, componentNameFromValidator);
    
    if (error) {
      // 自定义日志记录
      console.error(`[${componentName}] PropTypes Error:`, error.message);
      
      // 发送到错误跟踪服务
      if (typeof window !== 'undefined' && window.errorTracker) {
        window.errorTracker.log({
          type: 'proptype_error',
          component: componentName,
          prop: propName,
          message: error.message
        });
      }
      
      return error;
    }
    
    return null;
  };
}

MyComponent.propTypes = {
  name: createWarningLogger('MyComponent')
};
```

## 第六部分：TypeScript替代方案

### 6.1 TypeScript基础

```tsx
// 使用TypeScript接口定义Props
interface UserCardProps {
  user: {
    name: string;
    age?: number;  // 可选
    email: string;
  };
  onEdit?: (userId: string) => void;
}

// 函数组件
function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {user.age && <span>年龄: {user.age}</span>}
      {onEdit && <button onClick={() => onEdit('123')}>编辑</button>}
    </div>
  );
}

// 使用时有完整的类型检查和自动补全
<UserCard
  user={{ name: 'Alice', email: 'alice@example.com' }}
  onEdit={(id) => console.log(id)}
/>
```

### 6.2 TypeScript高级类型

```tsx
// 联合类型
type Status = 'pending' | 'active' | 'completed';

interface StatusBadgeProps {
  status: Status;
  priority: 1 | 2 | 3 | 4 | 5;
}

// 泛型
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]}
  renderItem={user => <span>{user.name}</span>}
  keyExtractor={user => user.id}
/>

// 交叉类型
interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
}

interface ButtonProps extends BaseProps {
  onClick: () => void;
  disabled?: boolean;
}

// 条件类型
type ConditionalProps<T extends 'text' | 'number'> = {
  type: T;
  value: T extends 'text' ? string : number;
};

function Input<T extends 'text' | 'number'>({ type, value }: ConditionalProps<T>) {
  return <input type={type} value={value} />;
}
```

### 6.3 PropTypes vs TypeScript对比

```jsx
// PropTypes版本
import PropTypes from 'prop-types';

function Button({ variant, size, onClick, children }) {
  return (
    <button className={`btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

Button.defaultProps = {
  size: 'medium'
};

// TypeScript版本
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ 
  variant, 
  size = 'medium', 
  onClick, 
  children 
}: ButtonProps) {
  return (
    <button className={`btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}

// 对比
// PropTypes:
// - 运行时检查
// - 需要额外安装包
// - 开发环境警告
// - 生产环境移除

// TypeScript:
// - 编译时检查
// - 内置支持
// - IDE自动补全
// - 更强大的类型系统
```

## 第七部分：React 19中的最佳实践

### 7.1 优先使用TypeScript

```tsx
// React 19推荐使用TypeScript而不是PropTypes

// Server Component
interface UserListProps {
  searchQuery?: string;
  limit?: number;
}

async function UserList({ searchQuery = '', limit = 10 }: UserListProps) {
  const users = await db.users.search(searchQuery, limit);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Client Component
'use client';

interface CounterProps {
  initialCount?: number;
  step?: number;
}

function Counter({ initialCount = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState(initialCount);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + step)}>+{step}</button>
    </div>
  );
}
```

### 7.2 Server Actions的类型

```tsx
// Server Action
'use server';

interface FormData {
  username: string;
  email: string;
}

interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    const user = await db.users.create(formData);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Client Component使用
'use client';

import { useActionState } from 'react';

function UserForm() {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    createUser,
    { success: false }
  );
  
  return (
    <form action={formAction}>
      <input name="username" required />
      <input name="email" type="email" required />
      <button disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

### 7.3 组合PropTypes和TypeScript

```tsx
// 在迁移期间可以同时使用
import PropTypes from 'prop-types';

interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// 为JavaScript用户保留PropTypes
Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary']).isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default Button;
```

## 第八部分：常见问题与解决方案

### 8.1 PropTypes不生效

```jsx
// 问题：PropTypes没有显示警告

// 原因1：在生产环境
console.log(process.env.NODE_ENV);  // 'production'
// 解决：切换到开发环境

// 原因2：PropTypes拼写错误
MyComponent.proptypes = {  // 错误：小写的p
  name: PropTypes.string
};

// 解决：使用正确的拼写
MyComponent.propTypes = {  // 正确：大写的P
  name: PropTypes.string
};

// 原因3：没有导入PropTypes
// 解决：确保导入
import PropTypes from 'prop-types';
```

### 8.2 isRequired不工作

```jsx
// 问题：标记为isRequired但传undefined不报错

function MyComponent({ name }) {
  return <div>{name}</div>;
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired
};

// 传undefined
<MyComponent name={undefined} />  // 会警告

// 但是完全不传这个prop
<MyComponent />  // 也会警告！

// 注意：null会触发警告，但不报错
<MyComponent name={null} />  // 警告但不会报错
```

### 8.3 复杂对象验证失败

```jsx
// 问题：嵌套对象验证不准确

const user = {
  name: 'Alice',
  age: 25,
  address: {
    city: 'Beijing'
  }
};

MyComponent.propTypes = {
  user: PropTypes.object.isRequired  // 太宽松
};

// 解决：使用shape进行精确验证
MyComponent.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    age: PropTypes.number,
    address: PropTypes.shape({
      city: PropTypes.string.isRequired,
      country: PropTypes.string
    })
  }).isRequired
};
```

### 8.4 数组验证问题

```jsx
// 问题：数组验证不够精确

MyComponent.propTypes = {
  items: PropTypes.array  // 太宽松，不知道元素类型
};

// 解决1：指定元素类型
MyComponent.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string)
};

// 解决2：指定对象数组的形状
MyComponent.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  )
};
```

### 8.5 性能问题

```jsx
// 问题：自定义验证器性能差

// 不好：每次验证都进行昂贵的计算
MyComponent.propTypes = {
  data: function(props, propName, componentName) {
    const data = props[propName];
    
    // 昂贵的验证逻辑
    for (let i = 0; i < data.length; i++) {
      // 复杂计算...
    }
    
    return null;
  }
};

// 解决：记住PropTypes只在开发环境运行
// 如果验证逻辑确实很昂贵，可以添加缓存或简化

// 或使用TypeScript（编译时检查，无运行时开销）
```

## 第九部分：最佳实践总结

### 9.1 使用建议

```jsx
// 1. 为所有公共组件添加PropTypes或TypeScript类型
// 2. 必需的props使用isRequired
// 3. 使用具体的类型而不是泛化类型
// 4. 为复杂对象使用shape
// 5. 提供defaultProps或参数默认值

// 好的示例
function UserCard({ user, onEdit, showActions = true }) {
  return <div>{/* ... */}</div>;
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  showActions: PropTypes.bool
};

// TypeScript版本（推荐）
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserCardProps {
  user: User;
  onEdit?: (userId: string) => void;
  showActions?: boolean;
}

function UserCard({ user, onEdit, showActions = true }: UserCardProps) {
  return <div>{/* ... */}</div>;
}
```

### 9.2 迁移策略

```jsx
// 从PropTypes迁移到TypeScript

// 步骤1：添加TypeScript配置
// tsconfig.json

// 步骤2：逐步迁移文件
// 保留.jsx扩展名，添加类型注释

// 步骤3：重命名为.tsx
// 移除PropTypes定义

// 步骤4：验证类型
// 使用tsc --noEmit检查类型错误

// 迁移期间可以共存
import PropTypes from 'prop-types';

interface Props {
  name: string;
}

function MyComponent({ name }: Props) {
  return <div>{name}</div>;
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired
};
```

## 练习题

### 基础练习

1. 为一个简单组件添加PropTypes验证
2. 创建一个使用shape的复杂对象验证
3. 实现一个带isRequired的组件

### 进阶练习

1. 编写自定义验证器验证邮箱格式
2. 创建一个条件验证器
3. 使用TypeScript重写PropTypes组件

### 高级练习

1. 实现递归树形结构的验证器
2. 创建可复用的验证器工厂函数
3. 对比PropTypes和TypeScript的性能差异

通过本章学习，你已经全面掌握了PropTypes的使用方法。虽然React 19推荐使用TypeScript，但理解PropTypes仍然很重要，特别是在维护旧代码或与JavaScript项目协作时。继续学习，提升React开发技能！

