# Props类型定义

## 概述

Props是React组件间通信的主要方式。在TypeScript中,合理定义Props类型能够提供类型安全、自动补全和文档化的好处。本文将全面介绍React Props的各种类型定义方式和最佳实践。

## 基础Props类型

### 简单Props

```typescript
// 基本类型Props
interface GreetingProps {
  name: string;
  age: number;
  isActive: boolean;
}

const Greeting = ({ name, age, isActive }: GreetingProps) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
      <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
};

// 使用
<Greeting name="Alice" age={30} isActive={true} />
```

### 可选Props

```typescript
interface UserCardProps {
  name: string;
  email: string;
  phone?: string;        // 可选
  address?: string;      // 可选
  avatar?: string;       // 可选
}

const UserCard = ({
  name,
  email,
  phone,
  address,
  avatar = '/default-avatar.png', // 默认值
}: UserCardProps) => {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      {phone && <p>Phone: {phone}</p>}
      {address && <p>Address: {address}</p>}
    </div>
  );
};
```

### 只读Props

```typescript
interface ConfigProps {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly headers: Readonly<Record<string, string>>;
}

const ApiClient = ({ apiUrl, timeout, headers }: ConfigProps) => {
  // headers.Authorization = 'new-token'; // ❌ 错误: 不能修改
  return <div>API URL: {apiUrl}</div>;
};
```

## Children Props

### ReactNode类型

```typescript
// 最常用的Children类型
interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  return <div className="container">{children}</div>;
};

// 使用 - 可以传递任何可渲染的内容
<Container>
  <h1>Title</h1>
  <p>Content</p>
  {/* 字符串、数字、null、undefined、数组等 */}
</Container>
```

### 单个元素Children

```typescript
// ReactElement - 只接受单个React元素
interface WrapperProps {
  children: React.ReactElement;
}

const Wrapper = ({ children }: WrapperProps) => {
  return <div className="wrapper">{children}</div>;
};

// 使用
<Wrapper>
  <div>Single element</div>
</Wrapper>

// ❌ 错误 - 不能传递多个元素
<Wrapper>
  <div>Element 1</div>
  <div>Element 2</div>
</Wrapper>
```

### 特定类型Children

```typescript
// 只接受特定类型的元素
interface ListProps {
  children: React.ReactElement<ItemProps> | React.ReactElement<ItemProps>[];
}

interface ItemProps {
  value: string;
}

const Item = ({ value }: ItemProps) => <li>{value}</li>;

const List = ({ children }: ListProps) => {
  return <ul>{children}</ul>;
};

// 使用
<List>
  <Item value="Item 1" />
  <Item value="Item 2" />
</List>
```

### Render Props

```typescript
// 函数Children
interface DataProviderProps<T> {
  data: T;
  children: (data: T) => React.ReactNode;
}

function DataProvider<T>({ data, children }: DataProviderProps<T>) {
  return <>{children(data)}</>;
}

// 使用
interface User {
  name: string;
  email: string;
}

<DataProvider data={{ name: 'Alice', email: 'alice@example.com' }}>
  {(user) => (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )}
</DataProvider>
```

## 函数Props

### 事件处理器

```typescript
interface ButtonProps {
  // 基本事件处理器
  onClick: () => void;
  onHover?: () => void;
}

interface ButtonWithParamsProps {
  // 带参数的事件处理器
  onClick: (id: string) => void;
  onDoubleClick: (event: React.MouseEvent, id: string) => void;
}

interface AsyncButtonProps {
  // 异步事件处理器
  onClick: () => Promise<void>;
  onSubmit: (data: FormData) => Promise<boolean>;
}

const Button = ({ onClick, onHover }: ButtonProps) => {
  return (
    <button onClick={onClick} onMouseEnter={onHover}>
      Click me
    </button>
  );
};
```

### 回调Props

```typescript
interface FormProps {
  // 成功回调
  onSuccess: (data: FormData) => void;
  
  // 错误回调
  onError: (error: Error) => void;
  
  // 进度回调
  onProgress?: (progress: number) => void;
  
  // 取消回调
  onCancel?: () => void;
}

interface FormData {
  name: string;
  email: string;
}

const Form = ({ onSuccess, onError, onProgress, onCancel }: FormProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 模拟上传进度
      onProgress?.(50);
      
      const data: FormData = {
        name: 'Alice',
        email: 'alice@example.com',
      };
      
      onProgress?.(100);
      onSuccess(data);
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};
```

## 对象和数组Props

### 对象Props

```typescript
// 简单对象
interface UserProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// 使用接口定义对象
interface User {
  id: string;
  name: string;
  email: string;
  profile?: {
    avatar: string;
    bio: string;
  };
}

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {user.profile && (
        <div>
          <img src={user.profile.avatar} alt="Avatar" />
          <p>{user.profile.bio}</p>
        </div>
      )}
    </div>
  );
};
```

### 数组Props

```typescript
// 基本数组
interface ListProps {
  items: string[];
}

// 对象数组
interface User {
  id: string;
  name: string;
}

interface UserListProps {
  users: User[];
}

const UserList = ({ users }: UserListProps) => {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

// 只读数组
interface ReadonlyListProps {
  items: readonly string[];
  users: ReadonlyArray<User>;
}
```

### 复杂嵌套类型

```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  comments: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    replies: Array<{
      id: string;
      content: string;
      authorId: string;
    }>;
  }>;
  tags: string[];
  metadata: {
    views: number;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface PostDetailProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
}

const PostDetail = ({ post, onLike, onComment }: PostDetailProps) => {
  return (
    <article>
      <h1>{post.title}</h1>
      <div className="author">
        <img src={post.author.avatar} alt={post.author.name} />
        <span>{post.author.name}</span>
      </div>
      <p>{post.content}</p>
      <div className="tags">
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="metadata">
        <span>Views: {post.metadata.views}</span>
        <span>Likes: {post.metadata.likes}</span>
      </div>
      <button onClick={() => onLike(post.id)}>Like</button>
    </article>
  );
};
```

## 联合类型和字面量Props

### 字面量联合类型

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  size: 'small' | 'medium' | 'large';
  shape?: 'square' | 'rounded' | 'circle';
}

const Button = ({ variant, size, shape = 'rounded' }: ButtonProps) => {
  return (
    <button className={`btn-${variant} btn-${size} btn-${shape}`}>
      Button
    </button>
  );
};

// 使用
<Button variant="primary" size="medium" />
```

### 条件Props

```typescript
// 根据一个prop的值,其他props可能是必需的
type IconButtonProps =
  | {
      icon: React.ReactNode;
      label?: string;
      'aria-label': string; // 必须提供
    }
  | {
      icon?: never;
      label: string; // 必须提供
      'aria-label'?: string;
    };

const IconButton = (props: IconButtonProps) => {
  return (
    <button aria-label={props['aria-label']}>
      {props.icon}
      {props.label}
    </button>
  );
};

// 使用
<IconButton icon={<Icon />} aria-label="Close" /> // ✅
<IconButton label="Submit" /> // ✅
// <IconButton icon={<Icon />} /> // ❌ 错误: 缺少aria-label
```

### 互斥Props

```typescript
// 使用XOR模式
type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

// 应用
type LoadingProps = XOR<
  { isLoading: true; data?: never },
  { isLoading?: false; data: any }
>;

interface DataDisplayProps extends LoadingProps {
  title: string;
}

const DataDisplay = (props: DataDisplayProps) => {
  if (props.isLoading) {
    return <div>Loading...</div>;
  }
  return <div>{props.data}</div>;
};

// 使用
<DataDisplay title="Data" isLoading={true} /> // ✅
<DataDisplay title="Data" data={[1, 2, 3]} /> // ✅
// <DataDisplay title="Data" isLoading={true} data={[1, 2, 3]} /> // ❌ 错误
```

## 泛型Props

### 基本泛型Props

```typescript
// 泛型List组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

### 带约束的泛型Props

```typescript
// 泛型约束
interface WithId {
  id: string | number;
}

interface TableProps<T extends WithId> {
  data: T[];
  columns: Array<{
    key: keyof T;
    title: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
  }>;
  onRowClick?: (row: T) => void;
}

function Table<T extends WithId>({
  data,
  columns,
  onRowClick,
}: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} onClick={() => onRowClick?.(row)}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 使用
interface Product {
  id: number;
  name: string;
  price: number;
}

<Table
  data={products}
  columns={[
    { key: 'name', title: 'Name' },
    { key: 'price', title: 'Price', render: (value) => `$${value}` },
  ]}
  onRowClick={(product) => console.log(product)}
/>
```

## 组件Props继承

### 继承HTML元素Props

```typescript
// 方式1: 使用React.ComponentPropsWithoutRef
interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary';
}

const Button = ({ variant = 'primary', children, ...props }: ButtonProps) => {
  return (
    <button {...props} className={`btn-${variant}`}>
      {children}
    </button>
  );
};

// 使用 - 可以传递所有button的原生属性
<Button onClick={() => {}} disabled type="submit" aria-label="Submit">
  Click me
</Button>

// 方式2: 使用React.ComponentPropsWithRef(包含ref)
interface InputProps extends React.ComponentPropsWithRef<'input'> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
      </div>
    );
  }
);
```

### 继承其他组件Props

```typescript
// 定义基础组件
interface BaseButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'large';
}

const BaseButton = ({ variant, size, children }: BaseButtonProps & { children: React.ReactNode }) => {
  return <button className={`btn-${variant} btn-${size}`}>{children}</button>;
};

// 扩展基础组件Props
interface IconButtonProps extends BaseButtonProps {
  icon: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const IconButton = ({ icon, iconPosition = 'left', ...baseProps }: IconButtonProps) => {
  return (
    <BaseButton {...baseProps}>
      {iconPosition === 'left' && icon}
      {baseProps.children}
      {iconPosition === 'right' && icon}
    </BaseButton>
  );
};
```

### Omit和Pick

```typescript
// 使用Omit排除某些Props
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface PublicUserProps {
  user: Omit<User, 'password'>;
}

const PublicProfile = ({ user }: PublicUserProps) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      {/* user.password 不可访问 */}
    </div>
  );
};

// 使用Pick选择某些Props
interface UserFormProps {
  user: Pick<User, 'name' | 'email'>;
}

const UserForm = ({ user }: UserFormProps) => {
  return (
    <form>
      <input defaultValue={user.name} />
      <input defaultValue={user.email} />
    </form>
  );
};
```

## Props验证

### 运行时验证

```typescript
// 使用自定义验证函数
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface ValidatedInputProps {
  value: string;
  validate: (value: string) => ValidationResult;
  onValidationChange: (result: ValidationResult) => void;
}

const ValidatedInput = ({ value, validate, onValidationChange }: ValidatedInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = validate(e.target.value);
    onValidationChange(result);
  };

  return <input value={value} onChange={handleChange} />;
};

// 使用
<ValidatedInput
  value=""
  validate={(value) => ({
    isValid: value.length > 0,
    error: value.length === 0 ? 'Required' : undefined,
  })}
  onValidationChange={(result) => console.log(result)}
/>
```

### Zod集成

```typescript
import { z } from 'zod';

// 定义schema
const UserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

// 从schema推断类型
type User = z.infer<typeof UserSchema>;

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: User) => void;
}

const UserForm = ({ initialData, onSubmit }: UserFormProps) => {
  const handleSubmit = (data: unknown) => {
    try {
      const validated = UserSchema.parse(data);
      onSubmit(validated);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  return <form onSubmit={(e) => {/* ... */}}>Form</form>;
};
```

## 最佳实践

### Props命名规范

```typescript
// 1. 布尔值使用is/has/should前缀
interface ComponentProps {
  isLoading: boolean;
  hasError: boolean;
  shouldRender: boolean;
  disabled: boolean; // 或使用isDisabled
}

// 2. 事件处理器使用on前缀
interface EventProps {
  onClick: () => void;
  onSubmit: (data: any) => void;
  onError: (error: Error) => void;
}

// 3. Render props使用render前缀
interface RenderProps {
  renderHeader: () => React.ReactNode;
  renderFooter: (data: any) => React.ReactNode;
}
```

### Props接口组织

```typescript
// 按功能分组
interface ButtonProps {
  // 外观
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  
  // 内容
  children: React.ReactNode;
  icon?: React.ReactNode;
  
  // 交互
  onClick?: () => void;
  onHover?: () => void;
  disabled?: boolean;
  
  // 可访问性
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

### 文档化Props

```typescript
/**
 * Button组件
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="medium" onClick={() => alert('Clicked')}>
 *   Click me
 * </Button>
 * ```
 */
interface ButtonProps {
  /**
   * 按钮样式变体
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * 按钮大小
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 点击事件处理器
   */
  onClick?: () => void;
  
  /**
   * 按钮内容
   */
  children: React.ReactNode;
}
```

Props类型定义是React TypeScript开发的基础,合理的Props类型设计能够提升代码质量和开发体验。

