# Props默认值

## 学习目标

通过本章学习，你将掌握：

- Props默认值的概念和作用
- 设置默认值的多种方式
- ES6参数默认值与defaultProps的对比
- 空值合并运算符的使用
- 默认值的优先级规则
- TypeScript中的默认值处理
- React 19的最佳实践

## 第一部分：默认值基础

### 1.1 什么是Props默认值

Props默认值是指当父组件没有传递某个prop时，子组件使用的默认值。

#### 为什么需要默认值

```jsx
// 没有默认值的问题
function Button({ text, color, size }) {
  return (
    <button className={`btn-${color} btn-${size}`}>
      {text}
    </button>
  );
}

// 使用时必须传递所有props
<Button text="点击" color="primary" size="medium" />

// 如果不传，会出现undefined
<Button text="点击" />
// className变成 "btn-undefined btn-undefined"

// 有默认值的优势
function Button({ text, color = 'primary', size = 'medium' }) {
  return (
    <button className={`btn-${color} btn-${size}`}>
      {text}
    </button>
  );
}

// 可以只传必要的props
<Button text="点击" />
// className变成 "btn-primary btn-medium"

<Button text="点击" color="secondary" />
// className变成 "btn-secondary btn-medium"
```

### 1.2 默认值的应用场景

```jsx
// 场景1：可选的配置项
function Modal({ 
  title = '提示',
  closable = true,
  width = 500,
  height = 300,
  maskClosable = true
}) {
  return (
    <div className="modal" style={{ width, height }}>
      <div className="modal-header">
        {title}
        {closable && <button className="close">×</button>}
      </div>
      <div className="modal-body">{/* ... */}</div>
    </div>
  );
}

// 使用时只需传需要修改的配置
<Modal />  // 使用所有默认值
<Modal title="确认删除" />  // 只修改标题
<Modal width={800} height={600} />  // 只修改尺寸

// 场景2：回退值
function UserAvatar({ src = '/default-avatar.png', size = 48 }) {
  return <img src={src} width={size} height={size} alt="avatar" />;
}

// 没有传src时使用默认头像
<UserAvatar />
<UserAvatar src="/user-avatar.jpg" />

// 场景3：功能开关
function FeatureComponent({ 
  enableNewFeature = false,
  enableBeta = false 
}) {
  return (
    <div>
      {enableNewFeature && <NewFeature />}
      {enableBeta && <BetaFeature />}
      <MainContent />
    </div>
  );
}
```

## 第二部分：设置默认值的方法

### 2.1 ES6参数默认值（推荐）

```jsx
// 基本用法
function Greeting({ name = 'Guest', greeting = 'Hello' }) {
  return <h1>{greeting}, {name}!</h1>;
}

// 使用
<Greeting />                           // Hello, Guest!
<Greeting name="Alice" />              // Hello, Alice!
<Greeting greeting="Hi" />             // Hi, Guest!
<Greeting name="Bob" greeting="Hey" /> // Hey, Bob!

// 多个默认值
function Button({
  text = '按钮',
  color = 'primary',
  size = 'medium',
  disabled = false,
  loading = false
}) {
  return (
    <button 
      className={`btn btn-${color} btn-${size}`}
      disabled={disabled || loading}
    >
      {loading ? '加载中...' : text}
    </button>
  );
}
```

#### 对象默认值

```jsx
// 对象prop的默认值
function UserCard({ 
  user = { 
    name: '匿名用户', 
    avatar: '/default-avatar.png' 
  } 
}) {
  return (
    <div>
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
    </div>
  );
}

// 部分默认值（解构 + 默认值）
function UserCard({ user }) {
  const {
    name = '匿名用户',
    avatar = '/default-avatar.png',
    age,
    email = 'no-email@example.com'
  } = user || {};
  
  return (
    <div>
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
      {age && <span>年龄: {age}</span>}
    </div>
  );
}
```

#### 数组默认值

```jsx
// 数组prop的默认值
function List({ items = [], emptyText = '暂无数据' }) {
  if (items.length === 0) {
    return <div>{emptyText}</div>;
  }
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// 使用
<List />  // 显示"暂无数据"
<List items={[]} />  // 显示"暂无数据"
<List items={['A', 'B', 'C']} />  // 显示列表
<List items={[]} emptyText="列表为空" />  // 自定义空状态文本
```

#### 函数默认值

```jsx
// 函数prop的默认值
function SearchBox({ 
  onSearch = () => console.log('搜索'),
  onClear = () => console.log('清空'),
  placeholder = '请输入关键词'
}) {
  const [value, setValue] = useState('');
  
  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <button onClick={() => onSearch(value)}>搜索</button>
      <button onClick={() => {
        setValue('');
        onClear();
      }}>
        清空
      </button>
    </div>
  );
}

// 使用
<SearchBox />  // 使用默认处理函数
<SearchBox onSearch={handleSearch} />  // 自定义搜索处理
```

### 2.2 defaultProps（传统方式）

```jsx
// 函数组件使用defaultProps
function Button({ text, color, size }) {
  return (
    <button className={`btn-${color} btn-${size}`}>
      {text}
    </button>
  );
}

Button.defaultProps = {
  text: '按钮',
  color: 'primary',
  size: 'medium'
};

// 类组件使用defaultProps
class Button extends Component {
  static defaultProps = {
    text: '按钮',
    color: 'primary',
    size: 'medium'
  };
  
  render() {
    const { text, color, size } = this.props;
    return (
      <button className={`btn-${color} btn-${size}`}>
        {text}
      </button>
    );
  }
}

// 或在类外部定义
class Button extends Component {
  render() {
    const { text, color, size } = this.props;
    return (
      <button className={`btn-${color} btn-${size}`}>
        {text}
      </button>
    );
  }
}

Button.defaultProps = {
  text: '按钮',
  color: 'primary',
  size: 'medium'
};
```

#### defaultProps的特点

```jsx
function Component({ a, b, c }) {
  console.log('a:', a);  // 'default-a'
  console.log('b:', b);  // undefined
  console.log('c:', c);  // null
  return null;
}

Component.defaultProps = {
  a: 'default-a',
  b: 'default-b',
  c: 'default-c'
};

// 使用
<Component b={undefined} c={null} />

// 说明：
// - a没有传递，使用默认值 'default-a'
// - b传递了undefined，使用默认值 'default-b'
// - c传递了null，不使用默认值，保持为 null

// 重要：null不会触发默认值！
```

### 2.3 ES6参数默认值 vs defaultProps

```jsx
// 方式1：ES6参数默认值
function Component1({ a = 'default', b = 'default' }) {
  console.log(a, b);
}

<Component1 b={undefined} />
// 输出: 'default', 'default'
// undefined会触发默认值

<Component1 b={null} />
// 输出: 'default', null
// null不会触发默认值

// 方式2：defaultProps
function Component2({ a, b }) {
  console.log(a, b);
}

Component2.defaultProps = {
  a: 'default',
  b: 'default'
};

<Component2 b={undefined} />
// 输出: 'default', 'default'

<Component2 b={null} />
// 输出: 'default', null

// 对比总结：
// 1. 行为相同：undefined触发默认值，null不触发
// 2. ES6更简洁，推荐使用
// 3. defaultProps适合类组件
// 4. React 19推荐ES6参数默认值
```

### 2.4 运行时默认值处理

```jsx
// 使用逻辑或运算符 ||
function Component1({ value }) {
  const displayValue = value || 'default';
  return <div>{displayValue}</div>;
}

<Component1 value="" />        // 'default'（空字符串被替换）
<Component1 value={0} />       // 'default'（0被替换）
<Component1 value={false} />   // 'default'（false被替换）
<Component1 value="hello" />   // 'hello'

// 使用空值合并运算符 ??（React 19推荐）
function Component2({ value }) {
  const displayValue = value ?? 'default';
  return <div>{displayValue}</div>;
}

<Component2 value="" />        // ''（空字符串不被替换）
<Component2 value={0} />       // 0（0不被替换）
<Component2 value={false} />   // false（false不被替换）
<Component2 value={null} />    // 'default'（null被替换）
<Component2 value={undefined} /> // 'default'（undefined被替换）
<Component2 value="hello" />   // 'hello'

// 对比
const value = 0;
value || 10    // 10（0是falsy值）
value ?? 10    // 0（0不是null/undefined）

const value = '';
value || 'default'    // 'default'（空字符串是falsy值）
value ?? 'default'    // ''（空字符串不是null/undefined）
```

## 第三部分：复杂默认值

### 3.1 嵌套对象默认值

```jsx
// 方式1：完整默认对象
function UserProfile({ 
  user = {
    name: '匿名',
    age: 0,
    address: {
      city: '未知',
      country: '未知'
    }
  }
}) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.address.city}, {user.address.country}</p>
    </div>
  );
}

// 方式2：分层默认值
function UserProfile({ user }) {
  const {
    name = '匿名',
    age = 0,
    address = {}
  } = user || {};
  
  const {
    city = '未知',
    country = '未知'
  } = address;
  
  return (
    <div>
      <h2>{name}</h2>
      <p>{city}, {country}</p>
    </div>
  );
}

// 方式3：使用空值合并
function UserProfile({ user }) {
  const name = user?.name ?? '匿名';
  const city = user?.address?.city ?? '未知';
  const country = user?.address?.country ?? '未知';
  
  return (
    <div>
      <h2>{name}</h2>
      <p>{city}, {country}</p>
    </div>
  );
}
```

### 3.2 数组默认值的高级用法

```jsx
function DataTable({ 
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名称' }
  ],
  data = [],
  pageSize = 10,
  sortBy = 'id',
  sortOrder = 'asc'
}) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.slice(0, pageSize).map((row, index) => (
          <tr key={index}>
            {columns.map(col => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 使用默认配置
<DataTable data={myData} />

// 自定义列
<DataTable
  data={myData}
  columns={[
    { key: 'id', label: '编号' },
    { key: 'name', label: '姓名' },
    { key: 'email', label: '邮箱' }
  ]}
  pageSize={20}
/>
```

### 3.3 函数默认值

```jsx
// 默认空函数
function Form({ 
  onSubmit = () => console.log('默认提交'),
  onCancel = () => console.log('默认取消'),
  onValidate = (data) => true  // 默认验证总是通过
}) {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (onValidate(formData)) {
      onSubmit(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">提交</button>
      <button type="button" onClick={onCancel}>取消</button>
    </form>
  );
}

// 不传任何处理函数也能正常工作
<Form />

// 自定义处理函数
<Form
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  onValidate={customValidator}
/>
```

### 3.4 复杂计算的默认值

```jsx
// 使用函数计算默认值
function DatePicker({
  minDate = new Date(1900, 0, 1),
  maxDate = new Date(2100, 11, 31),
  defaultDate = new Date(),  // 当前日期
  locale = navigator.language || 'zh-CN'
}) {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  
  return (
    <input
      type="date"
      value={selectedDate.toISOString().split('T')[0]}
      min={minDate.toISOString().split('T')[0]}
      max={maxDate.toISOString().split('T')[0]}
      onChange={e => setSelectedDate(new Date(e.target.value))}
    />
  );
}

// 注意：不要在默认值中使用副作用
// 不好
function Component({ 
  data = fetch('/api/data')  // 错误：每次渲染都会fetch
}) {
  return <div>{/* ... */}</div>;
}

// 好：使用useEffect
function Component({ initialData = null }) {
  const [data, setData] = useState(initialData);
  
  useEffect(() => {
    if (!initialData) {
      fetch('/api/data').then(r => r.json()).then(setData);
    }
  }, [initialData]);
  
  return <div>{/* ... */}</div>;
}
```

## 第四部分：默认值优先级

### 4.1 多层默认值

```jsx
// 1. 组件定义的默认值
function Button({ 
  color = 'primary',  // 第一优先级：参数默认值
  size = 'medium'
}) {
  return <button className={`btn-${color} btn-${size}`}>Click</button>;
}

// 2. defaultProps
Button.defaultProps = {
  color: 'secondary',  // 第二优先级：会被参数默认值覆盖
  variant: 'solid'     // 新的prop默认值
};

// 3. 使用时传递的值
<Button color="danger" />  // 最高优先级：覆盖所有默认值

// 优先级：传递的props > 参数默认值 > defaultProps
```

### 4.2 undefined vs null

```jsx
function Component({ 
  a = 'default-a',
  b = 'default-b',
  c = 'default-c'
}) {
  return <div>{a}, {b}, {c}</div>;
}

// 测试不同的值
<Component a={undefined} b={null} c="" />

// 输出：
// a: 'default-a'  // undefined触发默认值
// b: null         // null不触发默认值
// c: ''           // 空字符串不触发默认值

// 建议：显式传递null表示"无值"，undefined或不传表示"使用默认值"
```

### 4.3 复杂场景的优先级

```jsx
function ComplexComponent(props) {
  // 多层默认值处理
  const {
    theme = 'light',
    config = {},
    handlers = {}
  } = props;
  
  // config的默认值
  const {
    apiUrl = '/api',
    timeout = 5000,
    retries = 3
  } = config;
  
  // handlers的默认值
  const {
    onSuccess = (data) => console.log('Success:', data),
    onError = (error) => console.error('Error:', error)
  } = handlers;
  
  return <div>{/* ... */}</div>;
}

// 使用
<ComplexComponent
  theme="dark"
  config={{ apiUrl: '/v2/api', timeout: 10000 }}
  // retries使用默认值3
  handlers={{ onSuccess: customHandler }}
  // onError使用默认处理函数
/>
```

## 第五部分：默认值模式

### 5.1 配置对象模式

```jsx
// 使用配置对象集中管理默认值
const DEFAULT_CONFIG = {
  theme: 'light',
  language: 'zh-CN',
  pageSize: 10,
  enableCache: true,
  cacheTimeout: 3600000
};

function App({ config = {} }) {
  // 合并用户配置和默认配置
  const finalConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  return (
    <div data-theme={finalConfig.theme}>
      {/* 使用finalConfig */}
    </div>
  );
}

// 使用
<App />  // 使用所有默认配置
<App config={{ theme: 'dark', language: 'en' }} />  // 部分覆盖
```

### 5.2 工厂函数模式

```jsx
// 使用工厂函数生成默认值
function createDefaultUser() {
  return {
    id: `user_${Date.now()}`,
    name: '新用户',
    createdAt: new Date(),
    settings: {
      theme: 'light',
      notifications: true
    }
  };
}

function UserForm({ user = createDefaultUser() }) {
  return (
    <form>
      <input defaultValue={user.name} />
      <input defaultValue={user.email} />
    </form>
  );
}

// 注意：这种方式每次渲染都会调用createDefaultUser
// 更好的做法：
function UserForm({ user }) {
  const defaultUser = useMemo(() => createDefaultUser(), []);
  const finalUser = user ?? defaultUser;
  
  return (
    <form>
      <input defaultValue={finalUser.name} />
    </form>
  );
}
```

### 5.3 继承默认值模式

```jsx
// 基础组件的默认值
function BaseButton({ 
  className = 'btn',
  type = 'button',
  ...rest 
}) {
  return <button className={className} type={type} {...rest} />;
}

// 派生组件继承并扩展默认值
function PrimaryButton(props) {
  return (
    <BaseButton
      className="btn btn-primary"  // 覆盖默认className
      {...props}
    />
  );
}

// 使用
<PrimaryButton />  // className='btn btn-primary', type='button'
<PrimaryButton type="submit" />  // 覆盖type
<PrimaryButton className="custom" />  // 覆盖className
```

### 5.4 Context提供默认值

```jsx
import { createContext, useContext } from 'react';

// 创建Context时提供默认值
const ThemeContext = createContext('light');  // 默认主题

const ConfigContext = createContext({
  apiUrl: '/api',
  timeout: 5000
});

// 使用Context
function ThemedComponent() {
  const theme = useContext(ThemeContext);  // 如果没有Provider，使用'light'
  return <div className={theme}>Content</div>;
}

function ApiComponent() {
  const config = useContext(ConfigContext);
  // 如果没有Provider，使用默认配置
  
  return <div>{config.apiUrl}</div>;
}

// 提供自定义值
<ThemeContext.Provider value="dark">
  <ThemedComponent />  {/* 使用 'dark' */}
</ThemeContext.Provider>

// 不提供Provider
<ThemedComponent />  {/* 使用默认值 'light' */}
```

## 第六部分：TypeScript中的默认值

### 6.1 TypeScript接口默认值

```tsx
// 定义Props接口
interface ButtonProps {
  text?: string;
  color?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

// 方式1：参数默认值
function Button({
  text = '按钮',
  color = 'primary',
  size = 'medium',
  disabled = false
}: ButtonProps) {
  return (
    <button 
      className={`btn-${color} btn-${size}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

// 方式2：解构默认值
function Button(props: ButtonProps) {
  const {
    text = '按钮',
    color = 'primary',
    size = 'medium',
    disabled = false
  } = props;
  
  return (
    <button 
      className={`btn-${color} btn-${size}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
```

### 6.2 Partial类型工具

```tsx
// 完整的配置接口
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// 默认配置
const DEFAULT_CONFIG: Config = {
  apiUrl: '/api',
  timeout: 5000,
  retries: 3,
  headers: {}
};

// 组件接收部分配置
interface AppProps {
  config?: Partial<Config>;  // 所有属性都是可选的
}

function App({ config }: AppProps) {
  // 合并默认配置
  const finalConfig: Config = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  return <div>{finalConfig.apiUrl}</div>;
}

// 使用
<App />  // 使用完整默认配置
<App config={{ timeout: 10000 }} />  // 只覆盖timeout
```

### 6.3 Required类型工具

```tsx
// 可选的Props接口
interface OptionalProps {
  name?: string;
  age?: number;
  email?: string;
}

// 使用Required使所有属性必需
type RequiredProps = Required<OptionalProps>;
// 等价于：
// {
//   name: string;
//   age: number;
//   email: string;
// }

// 实际应用
interface ComponentProps {
  required: string;
  optional?: string;
}

function Component(props: Required<ComponentProps>) {
  // 现在optional也是必需的
  return <div>{props.optional}</div>;
}
```

### 6.4 Pick和Omit

```tsx
// 原始接口
interface FullProps {
  id: string;
  name: string;
  email: string;
  age: number;
  address: string;
}

// 只选择部分属性
type BasicProps = Pick<FullProps, 'id' | 'name' | 'email'>;
// 等价于：
// {
//   id: string;
//   name: string;
//   email: string;
// }

// 排除某些属性
type PublicProps = Omit<FullProps, 'id' | 'address'>;
// 等价于：
// {
//   name: string;
//   email: string;
//   age: number;
// }

// 使用
function BasicComponent(props: BasicProps & { role?: string }) {
  // props有id, name, email和可选的role
  return <div>{props.name}</div>;
}
```

## 第七部分：React 19的默认值最佳实践

### 7.1 Server Components中的默认值

```tsx
// Server Component
interface UserListProps {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

async function UserList({
  searchQuery = '',
  page = 1,
  pageSize = 10
}: UserListProps) {
  // 直接使用默认值进行数据库查询
  const users = await db.users.findMany({
    where: { name: { contains: searchQuery } },
    skip: (page - 1) * pageSize,
    take: pageSize
  });
  
  return (
    <div>
      <p>第 {page} 页，每页 {pageSize} 条</p>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// 使用
<UserList />  // 使用所有默认值
<UserList searchQuery="Alice" />  // 只传搜索词
<UserList page={2} pageSize={20} />  // 自定义分页
```

### 7.2 Client Components中的默认值

```tsx
'use client';

interface CounterProps {
  initialCount?: number;
  step?: number;
  min?: number;
  max?: number;
}

function Counter({
  initialCount = 0,
  step = 1,
  min = -Infinity,
  max = Infinity
}: CounterProps) {
  const [count, setCount] = useState(initialCount);
  
  const increment = () => {
    setCount(c => Math.min(c + step, max));
  };
  
  const decrement = () => {
    setCount(c => Math.max(c - step, min));
  };
  
  return (
    <div>
      <button onClick={decrement} disabled={count <= min}>-</button>
      <span>{count}</span>
      <button onClick={increment} disabled={count >= max}>+</button>
    </div>
  );
}

// 使用
<Counter />  // 0, 步长1, 无限制
<Counter initialCount={10} step={5} />  // 10, 步长5
<Counter min={0} max={100} />  // 限制范围0-100
```

### 7.3 Actions的默认处理

```tsx
'use server';

interface UpdateUserActionProps {
  userId: string;
  data: Partial<User>;
  notify?: boolean;  // 默认false
  revalidate?: boolean;  // 默认true
}

async function updateUserAction({
  userId,
  data,
  notify = false,
  revalidate = true
}: UpdateUserActionProps) {
  const user = await db.users.update(userId, data);
  
  if (notify) {
    await sendNotification(userId, 'Your profile has been updated');
  }
  
  if (revalidate) {
    revalidatePath(`/users/${userId}`);
  }
  
  return { success: true, user };
}

// 使用
updateUserAction({
  userId: '123',
  data: { name: 'New Name' }
  // notify和revalidate使用默认值
});

updateUserAction({
  userId: '123',
  data: { email: 'new@example.com' },
  notify: true  // 覆盖默认值
});
```

## 第八部分：常见模式和技巧

### 8.1 组件变体模式

```jsx
// 预定义的组件变体
const BUTTON_VARIANTS = {
  primary: {
    color: 'primary',
    size: 'medium',
    variant: 'solid'
  },
  secondary: {
    color: 'secondary',
    size: 'medium',
    variant: 'outline'
  },
  danger: {
    color: 'danger',
    size: 'medium',
    variant: 'solid'
  }
};

function Button({ 
  preset = 'primary',
  color,
  size,
  variant,
  ...rest
}) {
  // 从预设获取默认值
  const defaults = BUTTON_VARIANTS[preset];
  
  // 合并预设和自定义值
  const finalColor = color ?? defaults.color;
  const finalSize = size ?? defaults.size;
  const finalVariant = variant ?? defaults.variant;
  
  return (
    <button 
      className={`btn-${finalColor} btn-${finalSize} btn-${finalVariant}`}
      {...rest}
    />
  );
}

// 使用
<Button preset="primary" />  // 使用primary预设
<Button preset="secondary" />  // 使用secondary预设
<Button preset="primary" size="large" />  // 预设+自定义
<Button color="custom" size="small" />  // 完全自定义
```

### 8.2 响应式默认值

```jsx
import { useMediaQuery } from './hooks/useMediaQuery';

function ResponsiveComponent({
  mobileColumns,
  desktopColumns
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // 根据屏幕大小使用不同的默认值
  const columns = isMobile 
    ? (mobileColumns ?? 1)  // 移动端默认1列
    : (desktopColumns ?? 3);  // 桌面端默认3列
  
  return (
    <div style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {/* content */}
    </div>
  );
}

// 使用
<ResponsiveComponent />  // 移动1列，桌面3列
<ResponsiveComponent mobileColumns={2} />  // 移动2列，桌面3列
<ResponsiveComponent desktopColumns={4} />  // 移动1列，桌面4列
```

### 8.3 环境相关默认值

```jsx
// 根据环境设置默认值
const isDevelopment = process.env.NODE_ENV === 'development';

function ApiClient({
  baseUrl = isDevelopment ? 'http://localhost:3000' : 'https://api.production.com',
  timeout = isDevelopment ? 30000 : 5000,
  debug = isDevelopment,
  retries = isDevelopment ? 0 : 3
}) {
  return <div>{/* ... */}</div>;
}

// 或使用环境变量
function ApiClient({
  baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000',
  apiKey = process.env.REACT_APP_API_KEY || 'dev-key'
}) {
  return <div>{/* ... */}</div>;
}
```

### 8.4 深度合并默认值

```jsx
// 深度合并对象
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

const DEFAULT_CONFIG = {
  api: {
    baseUrl: '/api',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  ui: {
    theme: 'light',
    language: 'zh-CN'
  }
};

function App({ config = {} }) {
  // 深度合并
  const finalConfig = deepMerge(DEFAULT_CONFIG, config);
  
  return <div>{/* ... */}</div>;
}

// 使用
<App config={{
  api: {
    timeout: 10000  // 只覆盖timeout，保留baseUrl和headers
  }
}} />
```

## 第九部分：常见问题与解决

### 9.1 默认值不生效

```jsx
// 问题1：传递了undefined但没有触发默认值
function Component({ value = 'default' }) {
  return <div>{value}</div>;
}

const props = { value: undefined };
<Component {...props} />  // 显示 'default'（正确）

// 但如果是这样：
<Component value={undefined} />  // 显示 'default'（正确）

// 问题：某些情况下默认值没生效
// 原因：检查是否传了null
<Component value={null} />  // 显示 null（不触发默认值）

// 解决：使用??运算符
function Component({ value }) {
  const displayValue = value ?? 'default';
  return <div>{displayValue}</div>;
}
```

### 9.2 对象默认值陷阱

```jsx
// 问题：部分属性覆盖导致默认值丢失
function Component({ 
  config = { 
    a: 1, 
    b: 2, 
    c: 3 
  } 
}) {
  return <div>{config.a}, {config.b}, {config.c}</div>;
}

<Component config={{ a: 10 }} />
// 期望：{ a: 10, b: 2, c: 3 }
// 实际：{ a: 10 }
// 原因：整个config对象被替换了

// 解决方案1：深度合并
function Component({ config }) {
  const defaultConfig = { a: 1, b: 2, c: 3 };
  const finalConfig = { ...defaultConfig, ...config };
  
  return <div>{finalConfig.a}, {finalConfig.b}, {finalConfig.c}</div>;
}

// 解决方案2：分别设置每个属性的默认值
function Component({ config = {} }) {
  const {
    a = 1,
    b = 2,
    c = 3
  } = config;
  
  return <div>{a}, {b}, {c}</div>;
}
```

### 9.3 函数默认值问题

```jsx
// 问题：默认函数被多次创建
function Component({ 
  onClick = () => console.log('clicked')  // 每次渲染创建新函数
}) {
  return <ExpensiveChild onClick={onClick} />;
}

// 问题：ExpensiveChild会因为onClick变化而重新渲染

// 解决方案1：将默认函数提取到组件外部
const defaultOnClick = () => console.log('clicked');

function Component({ onClick = defaultOnClick }) {
  return <ExpensiveChild onClick={onClick} />;
}

// 解决方案2：使用useCallback
function Component({ onClick }) {
  const handleClick = useCallback(
    onClick || (() => console.log('clicked')),
    [onClick]
  );
  
  return <ExpensiveChild onClick={handleClick} />;
}

// 解决方案3：检查是否传递
function Component({ onClick }) {
  const handleClick = onClick || defaultOnClick;
  return <ExpensiveChild onClick={handleClick} />;
}
```

### 9.4 计算默认值的性能

```jsx
// 问题：昂贵的默认值计算
function Component({
  data = expensiveCalculation()  // 每次渲染都计算
}) {
  return <div>{/* ... */}</div>;
}

// 解决方案1：使用useMemo
function Component({ data }) {
  const defaultData = useMemo(() => expensiveCalculation(), []);
  const finalData = data ?? defaultData;
  
  return <div>{/* ... */}</div>;
}

// 解决方案2：懒初始化
function Component({ data }) {
  const [defaultData] = useState(() => expensiveCalculation());
  const finalData = data ?? defaultData;
  
  return <div>{/* ... */}</div>;
}

// 解决方案3：提取到组件外部
const DEFAULT_DATA = expensiveCalculation();

function Component({ data = DEFAULT_DATA }) {
  return <div>{/* ... */}</div>;
}
```

## 第十部分：实战案例

### 10.1 完整的表单组件

```tsx
interface FormProps {
  initialValues?: Record<string, any>;
  validationRules?: Record<string, (value: any) => string | null>;
  onSubmit?: (data: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
}

function Form({
  initialValues = {},
  validationRules = {},
  onSubmit = (data) => console.log('Form submitted:', data),
  onCancel = () => console.log('Form cancelled'),
  submitText = '提交',
  cancelText = '取消',
  showCancelButton = true
}: FormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    const newErrors: Record<string, string> = {};
    for (const [field, rule] of Object.entries(validationRules)) {
      const error = rule(values[field]);
      if (error) {
        newErrors[field] = error;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 提交
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '提交中...' : submitText}
        </button>
        {showCancelButton && (
          <button type="button" onClick={onCancel}>
            {cancelText}
          </button>
        )}
      </div>
    </form>
  );
}

// 使用默认配置
<Form />

// 自定义配置
<Form
  initialValues={{ username: '', email: '' }}
  validationRules={{
    username: (v) => !v ? '用户名不能为空' : null,
    email: (v) => !/\S+@\S+/.test(v) ? '邮箱格式错误' : null
  }}
  onSubmit={handleSubmit}
  submitText="注册"
  showCancelButton={false}
/>
```

### 10.2 配置化的数据表格

```tsx
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: number;
}

interface TableProps<T> {
  data?: T[];
  columns?: Column<T>[];
  pageSize?: number;
  showPagination?: boolean;
  emptyText?: string;
  loading?: boolean;
  onRowClick?: (record: T) => void;
}

function Table<T extends Record<string, any>>({
  data = [],
  columns = [],
  pageSize = 10,
  showPagination = true,
  emptyText = '暂无数据',
  loading = false,
  onRowClick
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const displayData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  if (loading) {
    return <div className="table-loading">加载中...</div>;
  }
  
  if (data.length === 0) {
    return <div className="table-empty">{emptyText}</div>;
  }
  
  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((record, index) => (
            <tr 
              key={index}
              onClick={() => onRowClick?.(record)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render 
                    ? col.render(record[col.key], record)
                    : record[col.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {showPagination && data.length > pageSize && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          <span>第 {currentPage} 页</span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage * pageSize >= data.length}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

// 使用默认配置（最小化配置）
<Table data={users} />

// 自定义配置
<Table
  data={users}
  columns={[
    { key: 'id', label: 'ID' },
    { key: 'name', label: '姓名' },
    { key: 'email', label: '邮箱' }
  ]}
  pageSize={20}
  emptyText="没有找到用户"
  onRowClick={(user) => navigate(`/users/${user.id}`)}
/>
```

### 10.3 主题配置组件

```tsx
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  typography: {
    fontSize: number;
    fontFamily: string;
  };
}

const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    danger: '#dc3545'
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  },
  typography: {
    fontSize: 14,
    fontFamily: 'Arial, sans-serif'
  }
};

interface ThemeProviderProps {
  theme?: Partial<ThemeConfig>;
  children: React.ReactNode;
}

function ThemeProvider({ 
  theme = {}, 
  children 
}: ThemeProviderProps) {
  // 深度合并默认主题和自定义主题
  const finalTheme: ThemeConfig = {
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
    spacing: { ...DEFAULT_THEME.spacing, ...theme.spacing },
    typography: { ...DEFAULT_THEME.typography, ...theme.typography }
  };
  
  return (
    <ThemeContext.Provider value={finalTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用默认主题
<ThemeProvider>
  <App />
</ThemeProvider>

// 部分自定义主题
<ThemeProvider theme={{
  colors: { primary: '#ff0000' },
  spacing: { large: 32 }
}}>
  <App />
</ThemeProvider>
```

## 练习题

### 基础练习

1. 创建一个Button组件，为text、color、size设置默认值
2. 实现一个UserCard组件，为缺失的用户信息设置默认值
3. 对比ES6参数默认值和defaultProps的行为差异

### 进阶练习

1. 实现深度合并的配置对象默认值
2. 创建响应式组件，根据屏幕大小使用不同默认值
3. 实现一个支持预设和自定义的组件变体系统

### 高级练习

1. 使用TypeScript实现类型安全的默认值系统
2. 创建一个性能优化的默认值处理策略
3. 实现一个支持环境变量的配置系统

通过本章学习，你已经全面掌握了Props默认值的各种设置方式和最佳实践。合理使用默认值能让组件更加灵活和易用。继续学习，成为React专家！

