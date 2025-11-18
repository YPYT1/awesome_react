# React 19 TypeScript类型系统改进

## 学习目标

通过本章学习，你将掌握：

- React 19的TypeScript重大类型变更
- useRef类型改进和迁移
- useReducer类型推断增强
- ReactElement props类型变更
- ref callback返回值限制
- JSX命名空间更新
- 类型迁移工具使用
- 最佳实践和常见陷阱

## 第一部分：useRef类型改进

### 1.1 必需参数变更

React 19最重要的类型变更之一：useRef现在必须提供参数。

React 18的问题：
```typescript
// React 18：允许无参数调用
const ref1 = useRef(); // ✅ 编译通过，ref类型为 MutableRefObject<undefined>
const ref2 = useRef<number>(); // ✅ 编译通过，但ref.current不可变！
const ref3 = useRef<number>(null); // ref.current是只读的

// 问题1：类型不一致
const ref = useRef<number>();
// 类型：RefObject<number>
// ref.current = 1; // ❌ 错误：current是只读的

// 问题2：null初始化的混淆
const ref = useRef<HTMLDivElement>(null);
// 类型：RefObject<HTMLDivElement>
// ref.current = divElement; // ❌ 错误：不能赋值

// 问题3：可选参数导致的类型复杂性
```

React 19的改进：
```typescript
// React 19：必须提供参数
// @ts-expect-error: Expected 1 argument but saw none
const ref1 = useRef(); // ❌ 编译错误

// ✅ 正确：提供undefined
const ref2 = useRef(undefined); // 类型：MutableRefObject<undefined>

// ✅ 正确：提供初始值
const ref3 = useRef<number>(0); // 类型：MutableRefObject<number>
const ref4 = useRef<HTMLDivElement | null>(null); // 类型：MutableRefObject<HTMLDivElement | null>

// 统一的类型签名
interface MutableRefObject<T> {
  current: T; // 总是可变的
}

declare function useRef<T>(initialValue: T): MutableRefObject<T>;
```

类型改进的好处：
```typescript
// 1. 所有ref都是可变的
const countRef = useRef(0);
countRef.current = 10; // ✅ 总是可以赋值

const divRef = useRef<HTMLDivElement | null>(null);
divRef.current = document.querySelector('div'); // ✅ 总是可以赋值

// 2. 类型更简单
// 只有一种ref类型：MutableRefObject
// 不再有RefObject和MutableRefObject的区分

// 3. 与createContext一致
const ref = useRef(undefined); // 必须提供参数
const context = createContext(undefined); // 必须提供参数
```

### 1.2 迁移指南

从React 18迁移到React 19：
```typescript
// React 18代码
const ref1 = useRef(); 
const ref2 = useRef<number>();
const ref3 = useRef<HTMLDivElement>(null);

// React 19迁移

// 情况1：无参数 → 传入undefined
const ref1 = useRef(undefined);

// 情况2：只有类型参数 → 传入undefined
const ref2 = useRef<number>(undefined);
// 或提供初始值
const ref2 = useRef<number>(0);

// 情况3：null初始化 → 联合类型
const ref3 = useRef<HTMLDivElement | null>(null);
```

常见模式迁移：
```typescript
// 模式1：DOM ref
// 之前
const inputRef = useRef<HTMLInputElement>(null);
// 类型：RefObject<HTMLInputElement>
// inputRef.current = element; // ❌ 只读

// 之后
const inputRef = useRef<HTMLInputElement | null>(null);
// 类型：MutableRefObject<HTMLInputElement | null>
// inputRef.current = element; // ✅ 可写

// 模式2：计数器ref
// 之前
const countRef = useRef<number>(); // 类型复杂

// 之后
const countRef = useRef<number>(0); // 清晰明确

// 模式3：对象ref
// 之前
const dataRef = useRef<UserData>();

// 之后
const dataRef = useRef<UserData | undefined>(undefined);
// 或
const dataRef = useRef<UserData>({} as UserData);
```

### 1.3 实际应用示例

DOM引用的正确类型：
```typescript
function FormComponent() {
  // ✅ 正确：联合类型
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 类型守卫
    if (nameInputRef.current && emailInputRef.current) {
      const formData = {
        name: nameInputRef.current.value,
        email: emailInputRef.current.value
      };
      
      console.log('Form data:', formData);
    }
  };
  
  const focusNameInput = () => {
    nameInputRef.current?.focus(); // 使用可选链
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input 
        ref={nameInputRef}
        type="text"
        placeholder="Name"
      />
      <input 
        ref={emailInputRef}
        type="email"
        placeholder="Email"
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={focusNameInput}>
        Focus Name
      </button>
    </form>
  );
}
```

存储值的ref：
```typescript
function Component() {
  // ✅ 正确：提供初始值
  const renderCountRef = useRef<number>(0);
  const previousValueRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`Rendered ${renderCountRef.current} times`);
  });
  
  useEffect(() => {
    timerRef.current = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return <div>Component</div>;
}
```

## 第二部分：useReducer类型改进

### 2.1 自动类型推断

React 19显著改进了useReducer的类型推断。

React 18的问题：
```typescript
// React 18：需要显式泛型
type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
  }
};

// 必须显式指定类型
const [state, dispatch] = useReducer<React.Reducer<State, Action>>(reducer);
// 类型太冗长
```

React 19的改进：
```typescript
// React 19：自动推断
type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
  }
};

// ✅ 无需泛型，自动推断
const [state, dispatch] = useReducer(reducer, { count: 0 });
// state类型：State
// dispatch类型：Dispatch<Action>
```

### 2.2 内联reducer的类型

内联reducer函数的类型注解：
```typescript
// React 18：需要完整泛型
const [state, dispatch] = useReducer<React.Reducer<State, Action>>(
  (state, action) => state // 参数类型不明确
);

// React 19方式1：推断类型
const reducer = (state: State, action: Action): State => {
  // reducer逻辑
  return state;
};
const [state, dispatch] = useReducer(reducer, initialState);

// React 19方式2：内联类型注解
const [state, dispatch] = useReducer(
  (state: State, action: Action): State => {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      default:
        return state;
    }
  },
  { count: 0 }
);

// React 19方式3：使用元组（特殊情况）
const [state, dispatch] = useReducer<State, [Action]>(reducer, initialState);
// 只在自动推断失败时使用
```

### 2.3 复杂reducer类型

处理复杂的state和action类型：
```typescript
// 复杂State类型
interface AppState {
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  theme: 'light' | 'dark';
  settings: {
    notifications: boolean;
    language: string;
  };
  data: {
    items: Array<{ id: string; value: number }>;
    loading: boolean;
    error: string | null;
  };
}

// 复杂Action类型
type AppAction =
  | { type: 'user/login'; payload: { id: number; name: string; email: string } }
  | { type: 'user/logout' }
  | { type: 'theme/toggle' }
  | { type: 'theme/set'; payload: 'light' | 'dark' }
  | { type: 'settings/update'; payload: Partial<AppState['settings']> }
  | { type: 'data/fetch/start' }
  | { type: 'data/fetch/success'; payload: Array<{ id: string; value: number }> }
  | { type: 'data/fetch/error'; payload: string };

// Reducer实现
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'user/login':
      return {
        ...state,
        user: action.payload
      };
    
    case 'user/logout':
      return {
        ...state,
        user: null
      };
    
    case 'theme/toggle':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    
    case 'theme/set':
      return {
        ...state,
        theme: action.payload
      };
    
    case 'settings/update':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    
    case 'data/fetch/start':
      return {
        ...state,
        data: {
          ...state.data,
          loading: true,
          error: null
        }
      };
    
    case 'data/fetch/success':
      return {
        ...state,
        data: {
          items: action.payload,
          loading: false,
          error: null
        }
      };
    
    case 'data/fetch/error':
      return {
        ...state,
        data: {
          ...state.data,
          loading: false,
          error: action.payload
        }
      };
    
    default:
      return state;
  }
};

// React 19：无需泛型，完美推断
function App() {
  const initialState: AppState = {
    user: null,
    theme: 'light',
    settings: {
      notifications: true,
      language: 'en'
    },
    data: {
      items: [],
      loading: false,
      error: null
    }
  };
  
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // dispatch完全类型安全
  dispatch({ type: 'user/login', payload: { id: 1, name: 'John', email: 'john@example.com' } }); // ✅
  dispatch({ type: 'user/logout' }); // ✅
  dispatch({ type: 'theme/set', payload: 'dark' }); // ✅
  
  // @ts-expect-error: Argument of type '"invalid"' is not assignable
  dispatch({ type: 'invalid' }); // ❌ 编译错误
  
  // @ts-expect-error: Property 'payload' is missing
  dispatch({ type: 'user/login' }); // ❌ 编译错误
  
  return <div>{state.user?.name}</div>;
}
```

## 第三部分：ReactElement类型变更

### 3.1 props类型默认值变更

React 19改变了ReactElement props的默认类型。

React 18行为：
```typescript
// React 18：props默认为any
type Example = ReactElement['props'];
// 类型：any（类型不安全！）

// 可以随意访问不存在的属性
const element: ReactElement = <div />;
element.props.nonExistent; // ✅ 编译通过（但运行时可能undefined）
```

React 19改进：
```typescript
// React 19：props默认为unknown
type Example = ReactElement['props'];
// 类型：unknown（类型安全！）

// 必须类型断言或类型守卫
const element: ReactElement = <div />;
element.props.nonExistent; // ❌ 编译错误

// ✅ 正确：提供类型参数
const element: ReactElement<{ id: string }> = <div id="123" />;
element.props.id; // ✅ 类型：string

// ✅ 正确：使用类型守卫
if ('id' in element.props) {
  console.log(element.props.id);
}
```

### 3.2 迁移策略

迁移ReactElement类型使用：
```typescript
// 之前：依赖any
function React18Code(element: ReactElement) {
  const id = element.props.id; // any类型
  const className = element.props.className; // any类型
  return { id, className };
}

// 之后方式1：显式类型
interface ExpectedProps {
  id: string;
  className?: string;
}

function React19Code1(element: ReactElement<ExpectedProps>) {
  const id = element.props.id; // string类型
  const className = element.props.className; // string | undefined类型
  return { id, className };
}

// 之后方式2：类型断言
function React19Code2(element: ReactElement) {
  const props = element.props as ExpectedProps;
  const id = props.id;
  const className = props.className;
  return { id, className };
}

// 之后方式3：类型守卫
function React19Code3(element: ReactElement) {
  const props = element.props;
  
  if (
    typeof props === 'object' &&
    props !== null &&
    'id' in props &&
    typeof props.id === 'string'
  ) {
    const id = props.id; // string类型
    return { id };
  }
  
  throw new Error('Invalid props');
}
```

自动化迁移工具：
```bash
# 使用codemod自动迁移
npx types-react-codemod@latest react-element-default-any-props ./src

# 该工具会：
# 1. 查找 ReactElement['props'] 的使用
# 2. 添加适当的类型断言
# 3. 或建议显式类型参数
```

### 3.3 泛型组件类型

定义泛型组件时的ReactElement类型：
```typescript
// 泛型List组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactElement;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => {
        const element = renderItem(item);
        
        // React 19：必须明确element的props类型
        return (
          <li key={index}>
            {element}
          </li>
        );
      })}
    </ul>
  );
}

// 使用
interface User {
  id: number;
  name: string;
}

function App() {
  const users: User[] = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
  
  return (
    <List<User>
      items={users}
      renderItem={(user) => <div>{user.name}</div>}
    />
  );
}
```

## 第四部分：ref callback类型限制

### 4.1 返回值限制

React 19限制ref callback的返回值。

React 18允许的（但不应该的）：
```typescript
// React 18：允许隐式返回
<div ref={current => (instance = current)} />
// 隐式返回赋值结果

<div ref={current => current ? current.focus() : null} />
// 隐式返回focus()的结果
```

React 19的严格要求：
```typescript
// React 19：必须显式返回void或cleanup函数

// ❌ 错误：隐式返回
<div ref={current => (instance = current)} />

// ✅ 正确：显式块
<div ref={current => { instance = current }} />

// ❌ 错误：返回非void/cleanup
<div ref={current => current?.focus()} />
// focus()返回undefined，但TypeScript检查更严格

// ✅ 正确：显式void
<div ref={current => { current?.focus(); }} />

// ✅ 正确：返回cleanup函数
<div ref={current => {
  if (current) {
    current.focus();
    return () => {
      current.blur();
    };
  }
}} />
```

### 4.2 cleanup函数类型

ref callback可以返回cleanup函数：
```typescript
function Component() {
  return (
    <div 
      ref={(element) => {
        if (element) {
          console.log('Element mounted:', element);
          
          // ✅ 返回cleanup函数
          return () => {
            console.log('Element unmounting:', element);
          };
        }
      }}
    >
      Content
    </div>
  );
}

// cleanup函数类型
type RefCallback<T> = (instance: T | null) => void | (() => void);

// 类型安全的ref callback
const createRefCallback = <T extends HTMLElement>(
  onMount?: (element: T) => void,
  onUnmount?: (element: T) => void
): RefCallback<T> => {
  return (element) => {
    if (element) {
      onMount?.(element);
      
      return () => {
        onUnmount?.(element);
      };
    }
  };
};

// 使用
function App() {
  const refCallback = createRefCallback<HTMLDivElement>(
    (element) => {
      console.log('Mounted:', element);
      element.classList.add('mounted');
    },
    (element) => {
      console.log('Unmounting:', element);
      element.classList.remove('mounted');
    }
  );
  
  return <div ref={refCallback}>Content</div>;
}
```

## 第五部分：JSX命名空间更新

### 5.1 模块化JSX命名空间

React 19废弃全局JSX命名空间，改用模块化声明。

React 18方式（已废弃）：
```typescript
// global.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        value?: string;
      };
    }
  }
}
```

React 19方式（推荐）：
```typescript
// types/jsx.d.ts
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        value?: string;
      };
    }
  }
}

// 或根据jsx配置选择模块
// 如果tsconfig.json中 "jsx": "react-jsx"
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        value?: string;
      };
    }
  }
}

// 如果 "jsx": "react-jsxdev"
declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'my-element': {
        value?: string;
      };
    }
  }
}
```

### 5.2 选择正确的模块

根据tsconfig选择：
```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx" // 或 "react-jsxdev" 或 "react"
  }
}
```

对应的类型声明：
```typescript
// jsx: "react-jsx" → 使用 "react/jsx-runtime"
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'custom-element': CustomElementProps;
    }
  }
}

// jsx: "react-jsxdev" → 使用 "react/jsx-dev-runtime"
declare module 'react/jsx-dev-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'custom-element': CustomElementProps;
    }
  }
}

// jsx: "react" → 使用 "react"
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'custom-element': CustomElementProps;
    }
  }
}
```

## 第六部分：其他类型改进

### 6.1 Context类型改进

createContext现在也需要参数：
```typescript
// React 18
const Context1 = createContext(); // ✅ 允许
const Context2 = createContext<string>(); // ✅ 允许

// React 19
// @ts-expect-error: Expected 1 argument
const Context1 = createContext(); // ❌ 错误

// ✅ 正确
const Context2 = createContext<string>(undefined);
const Context3 = createContext<string>('default value');
const Context4 = createContext<string | undefined>(undefined);
```

完整Context类型示例：
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// 提供默认值
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {}
});

// 或使用undefined（需要运行时检查）
const ThemeContext2 = createContext<ThemeContextType | undefined>(undefined);

function useTheme() {
  const context = useContext(ThemeContext2);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
}
```

### 6.2 children prop类型

React 19改进了children的类型处理：
```typescript
// React 18：children隐式包含
interface React18Props {
  title: string;
  // children自动可用
}

function React18Component(props: React18Props) {
  return <div>{props.children}</div>; // ✅ 可以访问
}

// React 19：必须显式声明children
interface React19Props {
  title: string;
  children?: React.ReactNode; // 必须显式声明
}

function React19Component(props: React19Props) {
  return <div>{props.children}</div>; // ✅ 类型安全
}

// 或使用PropsWithChildren
import { PropsWithChildren } from 'react';

interface Props {
  title: string;
}

function Component(props: PropsWithChildren<Props>) {
  return <div>{props.children}</div>;
}
```

### 6.3 事件处理器类型

改进的事件类型推断：
```typescript
// 通用事件处理器类型
type EventHandler<T = Element, E = Event> = (event: E & { currentTarget: T }) => void;

// 具体事件类型
function FormComponent() {
  // ✅ 类型自动推断
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // event.currentTarget类型：HTMLFormElement
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    // value类型：string
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // event.key类型：string
    }
  };
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(event.clientX, event.clientY);
    // clientX, clientY类型：number
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

## 第七部分：类型迁移工具

### 7.1 自动化codemod

使用官方codemod工具迁移：
```bash
# 安装工具
npm install -g types-react-codemod

# 运行preset-19（推荐）
npx types-react-codemod@latest preset-19 ./src

# 该preset包含所有React 19类型迁移：
# - useRef参数要求
# - useReducer类型简化
# - ReactElement props类型
# - ref callback返回值
# - JSX命名空间
```

单独运行特定迁移：
```bash
# 只迁移ReactElement props
npx types-react-codemod@latest react-element-default-any-props ./src

# 只迁移useRef
npx types-react-codemod@latest use-ref-required-initial ./src

# 只迁移ref callbacks
npx types-react-codemod@latest ref-callback-return ./src
```

### 7.2 手动迁移清单

逐步手动迁移：
```typescript
// 步骤1：更新useRef
// 查找所有 useRef() 和 useRef<T>()
// 替换为 useRef(undefined) 或 useRef<T | null>(null)

// 步骤2：更新useReducer
// 删除 useReducer<React.Reducer<S, A>>
// 改为 useReducer(reducer, initialState)

// 步骤3：更新ReactElement
// 查找 ReactElement['props']
// 添加泛型或类型断言

// 步骤4：更新ref callbacks
// 查找箭头函数隐式返回
// 改为显式块语法

// 步骤5：更新JSX命名空间
// 将global JSX移到模块声明中
```

### 7.3 类型检查

验证迁移后的代码：
```bash
# 运行TypeScript编译检查
npx tsc --noEmit

# 使用strict模式
# tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}

# 检查特定文件
npx tsc --noEmit src/components/MyComponent.tsx
```

## 第八部分：最佳实践

### 8.1 类型安全的组件

编写完全类型安全的组件：
```typescript
interface UserProfileProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onUpdate?: (user: UserProfileProps['user']) => void;
  editable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function UserProfile({
  user,
  onUpdate,
  editable = false,
  className,
  children
}: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  
  const handleEdit = () => {
    setIsEditing(true);
    // 下一个tick聚焦
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  };
  
  const handleSave = () => {
    if (nameInputRef.current && onUpdate) {
      onUpdate({
        ...user,
        name: nameInputRef.current.value
      });
    }
    setIsEditing(false);
  };
  
  return (
    <div className={className}>
      {isEditing ? (
        <>
          <input 
            ref={nameInputRef}
            defaultValue={user.name}
          />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <h2>{user.name}</h2>
          {editable && (
            <button onClick={handleEdit}>Edit</button>
          )}
        </>
      )}
      
      <p>{user.email}</p>
      {user.avatar && <img src={user.avatar} alt={user.name} />}
      {children}
    </div>
  );
}
```

### 8.2 泛型Hooks

编写类型安全的自定义Hooks：
```typescript
// 泛型useLocalStorage
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用
function App() {
  const [user, setUser] = useLocalStorage<User>('user', {
    id: 0,
    name: '',
    email: ''
  });
  
  const [settings, setSettings] = useLocalStorage<Settings>('settings', {
    theme: 'light',
    language: 'en'
  });
  
  // 完全类型安全
  setUser({ id: 1, name: 'John', email: 'john@example.com' }); // ✅
  // @ts-expect-error
  setUser({ invalid: 'data' }); // ❌
}
```

### 8.3 严格的null检查

启用strictNullChecks的影响：
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

处理null和undefined：
```typescript
function StrictNullComponent() {
  const divRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<Data | null>(null);
  
  useEffect(() => {
    // ❌ 错误：可能为null
    divRef.current.style.color = 'red';
    
    // ✅ 正确：使用可选链
    divRef.current?.style.setProperty('color', 'red');
    
    // ✅ 正确：类型守卫
    if (divRef.current) {
      divRef.current.style.color = 'red';
    }
  }, []);
  
  // ❌ 错误：data可能为null
  const name = data.name;
  
  // ✅ 正确：可选链
  const name = data?.name;
  
  // ✅ 正确：空值合并
  const name = data?.name ?? 'Unknown';
  
  // ✅ 正确：类型守卫
  if (data) {
    const name = data.name;
  }
  
  return (
    <div ref={divRef}>
      {data ? <UserInfo user={data} /> : <Loading />}
    </div>
  );
}
```

## 第九部分：常见类型错误

### 9.1 useRef错误

常见错误和解决方案：
```typescript
// 错误1：忘记提供参数
const ref = useRef(); 
// ❌ Expected 1 argument but saw none

// 解决
const ref = useRef(undefined);
const ref = useRef<T>(initialValue);

// 错误2：null初始化但期望可变
const ref = useRef<HTMLDivElement>(null);
ref.current = element; 
// ❌ Cannot assign to 'current' because it is read-only

// 解决
const ref = useRef<HTMLDivElement | null>(null);

// 错误3：类型不匹配
const ref = useRef<number>(null);
// ❌ Type 'null' is not assignable to type 'number'

// 解决
const ref = useRef<number | null>(null);
const ref = useRef<number>(0);
```

### 9.2 useReducer错误

常见问题：
```typescript
// 错误1：action类型不完整
type Action = { type: 'increment' };

const reducer = (state: number, action: Action) => {
  if (action.type === 'increment') {
    return state + 1;
  }
  return state;
};

// 添加新action时忘记更新类型
// 解决：使用联合类型
type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'set'; payload: number };

// 错误2：reducer返回类型不一致
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }; // ✅ 返回State
    case 'reset':
      return null; // ❌ 返回null，类型不匹配
  }
};

// 解决：保持返回类型一致
const reducer = (state: State, action: Action): State => {
  // 总是返回State类型
};
```

### 9.3 Props类型错误

组件props的常见错误：
```typescript
// 错误1：children类型
interface Props {
  title: string;
}

function Component({ title, children }: Props) {
  // ❌ Property 'children' does not exist on type 'Props'
  return <div>{children}</div>;
}

// 解决
interface Props {
  title: string;
  children?: React.ReactNode;
}

// 或
function Component({ title, children }: PropsWithChildren<{ title: string }>) {
  return <div>{children}</div>;
}

// 错误2：事件处理器类型
interface Props {
  onClick: Function; // ❌ 太宽泛
}

// 解决
interface Props {
  onClick: () => void; // ✅ 明确的函数签名
  onChange: (value: string) => void;
  onSubmit: (data: FormData) => Promise<void>;
}
```

## 常见问题

### Q1: 为什么useRef必须提供参数？

A: 统一API设计，与createContext保持一致，简化类型系统。

```typescript
// React 19设计目标：API一致性
useRef(initialValue);    // 必需参数
createContext(defaultValue); // 必需参数
useState(initialState);  // 可选参数（但推荐提供）

// 类型系统简化：
// 之前：RefObject vs MutableRefObject
// 之后：只有MutableRefObject
```

### Q2: 如何处理现有的useRef<T>()调用？

A: 使用codemod或手动添加undefined。

```bash
# 自动迁移
npx types-react-codemod@latest preset-19 ./src
```

```typescript
// 手动迁移
// 之前
const ref = useRef<number>();

// 之后选项1
const ref = useRef<number>(undefined);

// 之后选项2
const ref = useRef<number>(0);

// 选择标准：
// - 如果有明确初始值：使用具体值
// - 如果初始值不重要：使用undefined
// - 如果需要null语义：使用null并调整类型为T | null
```

### Q3: ReactElement props类型变更影响大吗？

A: 只影响直接访问element.props的代码，大多数应用不受影响。

```typescript
// 受影响的代码模式：
function affectedPattern(element: ReactElement) {
  const props = element.props; // 类型从any变为unknown
  return props.id; // ❌ 错误
}

// 大多数应用不受影响：
function normalPattern(props: { id: string }) {
  return <div id={props.id} />; // ✅ 不受影响
}
```

### Q4: 如何选择JSX模块声明？

A: 根据tsconfig.json的jsx选项。

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

对应声明：
```typescript
declare module 'react/jsx-runtime' {
  namespace JSX {
    // ...
  }
}
```

### Q5: 类型迁移后性能会下降吗？

A: 不会，类型检查在编译时，不影响运行时性能。

```
类型系统：
- 编译时检查
- 运行时擦除
- 零性能开销

迁移后：
- 编译时间可能略增（类型检查更严格）
- 运行时性能完全相同
- 反而可能发现潜在bug，提升质量
```

### Q6: 是否必须升级TypeScript版本？

A: 推荐使用TypeScript 5.0+以获得最佳体验。

```json
// package.json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

版本兼容性：
```
React 19类型支持：
- TypeScript 4.5+：基本支持
- TypeScript 4.9+：推荐
- TypeScript 5.0+：最佳（完整的新特性支持）
```

### Q7: 如何处理第三方库的类型不兼容？

A: 使用类型补丁或等待库更新。

```typescript
// 临时类型补丁
// types/library-patch.d.ts
declare module 'some-library' {
  import { ReactElement } from 'react';
  
  export function someFunction(
    element: ReactElement<any> // 显式any绕过unknown
  ): void;
}

// 或创建wrapper
function safeWrapper(element: ReactElement) {
  // 类型安全的包装
  const props = element.props as Record<string, unknown>;
  return originalFunction(element);
}
```

### Q8: 类型迁移会破坏现有代码吗？

A: 可能会发现隐藏的类型错误。

```typescript
// 迁移前（React 18）：编译通过但不安全
const ref = useRef<number>();
ref.current = 10; // 运行时错误（ref.current是readonly）

// 迁移后（React 19）：编译时捕获错误
const ref = useRef<number>(); // ❌ 编译错误
// 被迫修复：
const ref = useRef<number>(0); // ✅ 正确
ref.current = 10; // ✅ 现在可以赋值
```

### Q9: 如何测试类型定义？

A: 使用tsd或类似工具。

```typescript
// __tests__/types.test.ts
import { expectType, expectError } from 'tsd';
import { useRef, useReducer } from 'react';

// 测试useRef必需参数
expectError(useRef()); // 应该报错
expectType<{ current: number }>(useRef(0)); // 应该通过

// 测试useReducer推断
type State = { count: number };
type Action = { type: 'increment' };

const reducer = (state: State, action: Action): State => state;
const [state, dispatch] = useReducer(reducer, { count: 0 });

expectType<State>(state);
expectType<(action: Action) => void>(dispatch);
```

### Q10: 迁移priority如何确定？

A: 根据影响范围和修复难度。

```
优先级1（立即修复）：
- useRef无参数调用
- 会导致编译失败

优先级2（尽快修复）：
- useReducer冗余泛型
- ref callback隐式返回
- 影响代码质量

优先级3（逐步优化）：
- ReactElement props访问
- JSX命名空间迁移
- 不立即影响编译
```

## 总结

React 19 TypeScript类型系统改进：

核心变更：
```
1. useRef
✅ 必需参数
✅ 统一为MutableRefObject
✅ 与createContext一致
✅ 类型更简单

2. useReducer
✅ 自动类型推断
✅ 无需冗余泛型
✅ 更好的开发体验

3. ReactElement
✅ props默认unknown
✅ 类型更安全
✅ 减少any

4. ref callback
✅ 返回值类型检查
✅ 支持cleanup函数
✅ 更严格的约束

5. JSX命名空间
✅ 模块化声明
✅ 避免全局污染
✅ 更好的类型隔离
```

迁移策略：
```
1. 评估影响
- 运行TypeScript编译
- 识别错误类型和数量
- 评估修复工作量

2. 使用工具
- npx types-react-codemod
- 自动化大部分迁移
- 手动修复特殊情况

3. 分步迁移
- 先修复编译错误
- 再优化类型定义
- 最后提升类型安全

4. 测试验证
- 类型测试
- 单元测试
- 集成测试
- 确保功能不变
```

最佳实践：
```
1. 总是提供useRef参数
2. 让useReducer自动推断
3. ReactElement使用泛型
4. ref callback使用显式块
5. 使用模块化JSX声明
6. 启用strict模式
7. 完善的类型测试
8. 持续关注类型更新
```

React 19的TypeScript改进让类型系统更简单、更安全、更一致！

