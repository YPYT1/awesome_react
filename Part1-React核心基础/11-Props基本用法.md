# Props基本用法

## 学习目标

通过本章学习，你将掌握：

- Props的概念与作用
- Props的传递与接收方式
- Props的各种数据类型
- Props的只读特性
- Props的默认值设置
- Props的高级用法
- React 19中的Props新特性

## 第一部分：Props基础概念

### 1.1 什么是Props

Props（Properties的缩写）是React组件之间传递数据的机制。它是从父组件传递给子组件的只读数据。

#### Props的本质

```jsx
// Props就是函数的参数
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 等价于
function welcome(props) {
  return createElement('h1', null, 'Hello, ' + props.name);
}

// Props是一个对象
<Welcome name="Alice" age={25} />

// 传递的props对象：
{
  name: "Alice",
  age: 25
}
```

#### Props的作用

```jsx
// 1. 数据传递
<UserCard user={userData} />

// 2. 行为传递
<Button onClick={handleClick} />

// 3. 配置组件
<Modal size="large" closable={true} />

// 4. 组件组合
<Card>
  <CardHeader>标题</CardHeader>
  <CardBody>内容</CardBody>
</Card>
```

### 1.2 Props的特点

#### 只读性

```jsx
// Props是只读的，不能修改
function Welcome(props) {
  // 错误！不能修改props
  // props.name = 'Bob';  // TypeError
  
  return <h1>Hello, {props.name}</h1>;
}

// 正确：如果需要修改，使用state
function Welcome(props) {
  const [name, setName] = useState(props.name);
  
  const handleChange = () => {
    setName('Bob');  // 修改本地state
  };
  
  return (
    <>
      <h1>Hello, {name}</h1>
      <button onClick={handleChange}>改名</button>
    </>
  );
}
```

#### 单向数据流

```jsx
// 数据只能从父组件流向子组件
function Parent() {
  const [data, setData] = useState('parent data');
  
  return (
    <Child data={data} />  // 父→子
  );
}

function Child({ data }) {
  // 子组件只能读取，不能直接修改父组件的data
  return <div>{data}</div>;
}

// 子组件要修改父组件数据，需要通过回调
function Parent() {
  const [data, setData] = useState('parent data');
  
  return (
    <Child 
      data={data} 
      onDataChange={setData}  // 传递修改函数
    />
  );
}

function Child({ data, onDataChange }) {
  return (
    <>
      <div>{data}</div>
      <button onClick={() => onDataChange('new data')}>
        修改数据
      </button>
    </>
  );
}
```

## 第二部分：Props的传递与接收

### 2.1 基本传递方式

#### 字符串Props

```jsx
// 字符串可以不用花括号
<Welcome name="Alice" />
<Welcome name={'Alice'} />  // 也可以用花括号

// 组件接收
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

#### 数字Props

```jsx
// 数字必须用花括号
<Counter initialCount={0} />
<Price value={99.99} />
<Paginator page={1} pageSize={10} />

// 组件接收
function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  return <div>{count}</div>;
}
```

#### 布尔Props

```jsx
// 布尔值的简写
<Button disabled />  // 等价于 disabled={true}
<Input required />   // 等价于 required={true}

// 显式传递false
<Button disabled={false} />
<Input required={!isOptional} />

// 组件接收
function Button({ disabled }) {
  return (
    <button disabled={disabled}>
      Click me
    </button>
  );
}
```

#### 数组Props

```jsx
// 传递数组
const items = ['Item 1', 'Item 2', 'Item 3'];
<List items={items} />

// 内联数组
<List items={['A', 'B', 'C']} />

// 组件接收
function List({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

#### 对象Props

```jsx
// 传递对象
const user = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
};
<UserCard user={user} />

// 内联对象（注意双花括号）
<UserCard user={{ name: 'Alice', age: 25 }} />

// 组件接收
function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>年龄: {user.age}</span>
    </div>
  );
}
```

#### 函数Props

```jsx
// 传递函数
function Parent() {
  const handleClick = () => {
    console.log('Button clicked');
  };
  
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
  };
  
  return (
    <>
      <Button onClick={handleClick} />
      <Form onSubmit={handleSubmit} />
    </>
  );
}

// 组件接收
function Button({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}

function Form({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(Object.fromEntries(formData));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="username" />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 2.2 Props解构

#### 基本解构

```jsx
// 不使用解构
function UserCard(props) {
  return (
    <div>
      <h3>{props.name}</h3>
      <p>{props.email}</p>
    </div>
  );
}

// 使用解构（推荐）
function UserCard({ name, email }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}
```

#### 嵌套解构

```jsx
// 传递嵌套对象
const user = {
  name: 'Alice',
  address: {
    city: 'Beijing',
    country: 'China'
  }
};

<UserCard user={user} />

// 嵌套解构
function UserCard({ user: { name, address: { city, country } } }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{city}, {country}</p>
    </div>
  );
}

// 或者分步解构（更清晰）
function UserCard({ user }) {
  const { name, address } = user;
  const { city, country } = address;
  
  return (
    <div>
      <h3>{name}</h3>
      <p>{city}, {country}</p>
    </div>
  );
}
```

#### 重命名解构

```jsx
// 避免命名冲突
function UserCard({ name: userName, email: userEmail }) {
  const name = 'Component Name';  // 不冲突
  
  return (
    <div>
      <h3>{userName}</h3>
      <p>{userEmail}</p>
    </div>
  );
}
```

#### 剩余参数解构

```jsx
// 提取部分props，其余用...rest收集
function Button({ type, className, ...rest }) {
  return (
    <button
      type={type || 'button'}
      className={`btn ${className || ''}`}
      {...rest}  // 传递所有其他props
    >
      Click
    </button>
  );
}

// 使用
<Button 
  type="submit" 
  className="primary"
  disabled={true}
  onClick={handleClick}
  data-test="my-button"
/>

// Button会处理type和className
// 其他props（disabled, onClick, data-test）会通过...rest传递给<button>
```

### 2.3 Props展开

#### 展开对象Props

```jsx
// 定义props对象
const buttonProps = {
  type: 'submit',
  className: 'primary',
  disabled: false,
  onClick: handleClick
};

// 展开传递
<Button {...buttonProps} />

// 等价于
<Button
  type="submit"
  className="primary"
  disabled={false}
  onClick={handleClick}
/>
```

#### 覆盖展开的Props

```jsx
const props = {
  color: 'blue',
  size: 'large'
};

// 先展开再覆盖
<Button {...props} color="red" />
// 结果：color='red', size='large'

// 先覆盖再展开
<Button color="red" {...props} />
// 结果：color='blue', size='large'
```

#### 条件展开

```jsx
function Form({ requiresAuth }) {
  const authProps = requiresAuth ? {
    onAuth: handleAuth,
    authToken: token
  } : {};
  
  return (
    <FormComponent
      {...authProps}
      onSubmit={handleSubmit}
    />
  );
}

// 或使用&&运算符
<FormComponent
  {...(requiresAuth && { onAuth: handleAuth, authToken: token })}
  onSubmit={handleSubmit}
/>
```

## 第三部分：Props的默认值

### 3.1 函数参数默认值

```jsx
// ES6参数默认值
function Greeting({ name = 'Guest', greeting = 'Hello' }) {
  return <h1>{greeting}, {name}!</h1>;
}

// 使用
<Greeting />  // Hello, Guest!
<Greeting name="Alice" />  // Hello, Alice!
<Greeting name="Bob" greeting="Hi" />  // Hi, Bob!
```

### 3.2 defaultProps（传统方式）

```jsx
// 函数组件
function Greeting({ name, greeting }) {
  return <h1>{greeting}, {name}!</h1>;
}

Greeting.defaultProps = {
  name: 'Guest',
  greeting: 'Hello'
};

// 类组件
class Greeting extends Component {
  static defaultProps = {
    name: 'Guest',
    greeting: 'Hello'
  };
  
  render() {
    const { name, greeting } = this.props;
    return <h1>{greeting}, {name}!</h1>;
  }
}
```

### 3.3 空值合并运算符

```jsx
// 使用 ?? 运算符（React 19推荐）
function Greeting({ name, greeting }) {
  const displayName = name ?? 'Guest';
  const displayGreeting = greeting ?? 'Hello';
  
  return <h1>{displayGreeting}, {displayName}!</h1>;
}

// 与 || 的区别
function Component({ count, text }) {
  // 使用 ||：0 和 '' 会被替换
  const count1 = count || 10;  // count=0时，显示10
  const text1 = text || 'default';  // text=''时，显示'default'
  
  // 使用 ??：只有null和undefined会被替换
  const count2 = count ?? 10;  // count=0时，显示0
  const text2 = text ?? 'default';  // text=''时，显示''
  
  return <div>{count2}, {text2}</div>;
}
```

### 3.4 对象默认值

```jsx
// 对象props的默认值
function UserCard({ 
  user = { 
    name: 'Anonymous', 
    email: 'no-email@example.com' 
  } 
}) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// 部分默认值
function UserCard({ user }) {
  const {
    name = 'Anonymous',
    email = 'no-email@example.com',
    age
  } = user || {};
  
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      {age && <span>年龄: {age}</span>}
    </div>
  );
}
```

## 第四部分：特殊Props

### 4.1 children Props

```jsx
// children是特殊的prop，表示组件的子元素
function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

// 使用
<Card>
  <h2>标题</h2>
  <p>内容</p>
</Card>

// children可以是任何类型
<Card>Hello World</Card>  // 字符串
<Card>{123}</Card>  // 数字
<Card><Component /></Card>  // JSX
<Card>{items.map(...)}</Card>  // 数组
<Card>{condition && <div>...</div>}</Card>  // 条件渲染
```

#### 处理children

```jsx
import { Children } from 'react';

function List({ children }) {
  // 获取children数量
  const count = Children.count(children);
  
  // 遍历children
  const items = Children.map(children, (child, index) => {
    return <li key={index}>{child}</li>;
  });
  
  // 转换为数组
  const childArray = Children.toArray(children);
  
  // 检查是否只有一个child
  const onlyChild = Children.only(children);  // 如果有多个会报错
  
  return (
    <ul>
      <li>共 {count} 项</li>
      {items}
    </ul>
  );
}
```

#### 克隆children并添加props

```jsx
import { cloneElement, Children } from 'react';

function Tabs({ children, activeIndex }) {
  return (
    <div className="tabs">
      {Children.map(children, (child, index) => {
        // 克隆child并添加props
        return cloneElement(child, {
          isActive: index === activeIndex,
          index: index
        });
      })}
    </div>
  );
}

function Tab({ label, isActive, index }) {
  return (
    <div className={isActive ? 'active' : ''}>
      Tab {index}: {label}
    </div>
  );
}

// 使用
<Tabs activeIndex={1}>
  <Tab label="首页" />
  <Tab label="关于" />
  <Tab label="联系" />
</Tabs>
```

### 4.2 key Props

```jsx
// key用于帮助React识别列表项的变化
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}  // key应该是稳定且唯一的
          todo={todo}
        />
      ))}
    </ul>
  );
}

// key的选择
// 好：使用唯一ID
{items.map(item => <Item key={item.id} {...item} />)}

// 可以：使用业务唯一标识
{items.map(item => <Item key={item.slug} {...item} />)}

// 不好：使用index（仅当列表不会重排序时）
{items.map((item, index) => <Item key={index} {...item} />)}

// 错误：使用随机数
{items.map(item => <Item key={Math.random()} {...item} />)}
```

### 4.3 ref Props

```jsx
import { forwardRef, useRef } from 'react';

// 转发ref到DOM元素
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 使用
function Form() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <Input ref={inputRef} />
      <button onClick={focusInput}>聚焦输入框</button>
    </>
  );
}
```

## 第五部分：Props验证

### 5.1 PropTypes（运行时验证）

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, email, isActive }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      <span>年龄: {age}</span>
      <span>状态: {isActive ? '活跃' : '非活跃'}</span>
    </div>
  );
}

// 定义PropTypes
UserCard.propTypes = {
  name: PropTypes.string.isRequired,  // 必需的字符串
  age: PropTypes.number,               // 可选的数字
  email: PropTypes.string.isRequired,  // 必需的字符串
  isActive: PropTypes.bool             // 可选的布尔值
};

// 默认值
UserCard.defaultProps = {
  isActive: false
};
```

#### PropTypes的类型

```jsx
import PropTypes from 'prop-types';

ComponentName.propTypes = {
  // 基本类型
  str: PropTypes.string,
  num: PropTypes.number,
  bool: PropTypes.bool,
  func: PropTypes.func,
  arr: PropTypes.array,
  obj: PropTypes.object,
  sym: PropTypes.symbol,
  
  // 任何可渲染的内容
  node: PropTypes.node,
  
  // React元素
  element: PropTypes.element,
  
  // React元素类型
  elementType: PropTypes.elementType,
  
  // 特定类的实例
  message: PropTypes.instanceOf(Message),
  
  // 枚举
  status: PropTypes.oneOf(['pending', 'success', 'error']),
  
  // 多种类型之一
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  
  // 特定类型的数组
  numbers: PropTypes.arrayOf(PropTypes.number),
  
  // 特定形状的对象
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  }),
  
  // 精确形状的对象
  config: PropTypes.exact({
    timeout: PropTypes.number,
    retries: PropTypes.number
  }),
  
  // 对象的值必须是特定类型
  scores: PropTypes.objectOf(PropTypes.number),
  
  // 自定义验证器
  customProp: function(props, propName, componentName) {
    if (!/^[A-Z]/.test(props[propName])) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. ` +
        `Must start with uppercase letter.`
      );
    }
  },
  
  // 必需的prop
  requiredProp: PropTypes.string.isRequired
};
```

### 5.2 TypeScript类型检查（编译时验证）

```tsx
// 定义Props接口
interface UserCardProps {
  name: string;
  age?: number;  // 可选
  email: string;
  isActive?: boolean;
  onEdit?: (id: string) => void;
}

// 函数组件使用类型
function UserCard({ name, age, email, isActive = false, onEdit }: UserCardProps) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      {age && <span>年龄: {age}</span>}
      {onEdit && <button onClick={() => onEdit('123')}>编辑</button>}
    </div>
  );
}

// 或使用React.FC
const UserCard: React.FC<UserCardProps> = ({ name, age, email, isActive = false }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
      {age && <span>年龄: {age}</span>}
    </div>
  );
};
```

#### 高级TypeScript Props类型

```tsx
// 联合类型
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'small' | 'medium' | 'large';
}

// 泛型Props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
<List
  items={[1, 2, 3]}
  renderItem={(num) => <span>{num}</span>}
/>

// 继承HTML元素的props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

function Button({ variant = 'primary', children, ...rest }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

// 使用时可以传递所有button的原生属性
<Button 
  variant="primary"
  onClick={handleClick}
  disabled={false}
  type="submit"
/>
```

## 第六部分：React 19的Props新特性

### 6.1 Server Components的Props

```jsx
// Server Component接收props
async function UserProfile({ userId }) {
  // 可以直接await数据
  const user = await db.users.findById(userId);
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 使用
<UserProfile userId="123" />
```

### 6.2 Actions作为Props

```jsx
// Server Action
'use server';

async function updateUser(userId, data) {
  await db.users.update(userId, data);
  revalidatePath(`/users/${userId}`);
}

// Client Component接收action作为prop
'use client';

function UserForm({ userId, updateAction }) {
  return (
    <form action={updateAction}>
      <input name="name" />
      <input name="email" />
      <button type="submit">更新</button>
    </form>
  );
}

// 使用
<UserForm 
  userId="123" 
  updateAction={updateUser.bind(null, '123')}
/>
```

### 6.3 use() Hook与Props

```jsx
import { use } from 'react';

// 组件接收Promise作为prop
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 使用
const userPromise = fetchUser('123');

<Suspense fallback={<Loading />}>
  <UserProfile userPromise={userPromise} />
</Suspense>
```

## 第七部分：Props最佳实践

### 7.1 命名规范

```jsx
// 好的命名
<Button onClick={handleClick} />
<Input value={text} onChange={handleChange} />
<UserCard user={userData} />

// 不好的命名
<Button click={handleClick} />  // 应该是onClick
<Input val={text} change={handleChange} />  // 不清晰
<UserCard data={userData} />  // 太泛化
```

### 7.2 Props数量控制

```jsx
// 不好：props太多
<Component
  prop1={value1}
  prop2={value2}
  prop3={value3}
  prop4={value4}
  prop5={value5}
  prop6={value6}
  prop7={value7}
/>

// 好：合并相关props为对象
<Component
  config={{
    prop1: value1,
    prop2: value2,
    prop3: value3
  }}
  handlers={{
    prop4: value4,
    prop5: value5
  }}
  meta={{
    prop6: value6,
    prop7: value7
  }}
/>

// 或拆分组件
<ComponentA config={config} />
<ComponentB handlers={handlers} />
<ComponentC meta={meta} />
```

### 7.3 Props传递优化

```jsx
// 避免每次渲染创建新对象
// 不好
function Parent() {
  return <Child style={{ margin: 10 }} />;
}

// 好
const style = { margin: 10 };
function Parent() {
  return <Child style={style} />;
}

// 或使用useMemo
function Parent() {
  const style = useMemo(() => ({ margin: 10 }), []);
  return <Child style={style} />;
}

// 避免每次渲染创建新函数
// 不好
function Parent() {
  return <Child onClick={() => console.log('clicked')} />;
}

// 好
function Parent() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
}
```

### 7.4 Props的文档化

```jsx
/**
 * 用户卡片组件
 * 
 * @param {Object} props - 组件props
 * @param {Object} props.user - 用户对象
 * @param {string} props.user.name - 用户名
 * @param {string} props.user.email - 邮箱
 * @param {number} [props.user.age] - 年龄（可选）
 * @param {Function} [props.onEdit] - 编辑回调
 * @param {boolean} [props.showActions=true] - 是否显示操作按钮
 */
function UserCard({ 
  user, 
  onEdit, 
  showActions = true 
}) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {user.age && <span>年龄: {user.age}</span>}
      {showActions && onEdit && (
        <button onClick={() => onEdit(user.id)}>编辑</button>
      )}
    </div>
  );
}
```

## 练习题

### 基础练习

1. 创建一个组件，接收name和age两个props并显示
2. 实现一个Button组件，接收onClick、disabled和children props
3. 创建一个Card组件，使用children prop

### 进阶练习

1. 实现一个Form组件，接收配置对象props和提交回调
2. 创建一个List组件，接收泛型数组props和renderItem函数prop
3. 使用PropTypes或TypeScript为组件添加类型检查

### 高级练习

1. 实现一个复合组件（Tabs/Tab），通过props控制激活状态
2. 创建一个HOC，为组件注入额外的props
3. 使用React 19的Server Components和Actions实现表单提交

通过本章学习，你已经全面掌握了React Props的基本用法。Props是React组件通信的基础，熟练使用Props能让你构建出更加灵活和可复用的组件。继续学习，探索更多React特性！

