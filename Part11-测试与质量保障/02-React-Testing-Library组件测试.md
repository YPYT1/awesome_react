# React Testing Library组件测试

## 概述

React Testing Library (RTL)是React官方推荐的测试库,它鼓励编写更接近用户实际使用方式的测试。RTL专注于测试组件的行为而非实现细节,使测试更加健壮和可维护。本文将全面介绍RTL的核心概念、查询方法以及最佳实践。

## 核心理念

### 测试原则

React Testing Library基于以下原则:
- **测试用户行为**: 关注用户如何与应用交互
- **避免实现细节**: 不测试组件内部状态和方法
- **可访问性优先**: 鼓励使用可访问的查询方式
- **简单明了**: API设计简洁易懂

### 与Enzyme的对比

```typescript
// ❌ Enzyme - 测试实现细节
wrapper.find('button').simulate('click');
expect(wrapper.state('count')).toBe(1);

// ✅ React Testing Library - 测试用户行为
const button = screen.getByRole('button');
userEvent.click(button);
expect(screen.getByText('1')).toBeInTheDocument();
```

## 安装与配置

### 安装依赖

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### jest.setup.js

```javascript
import '@testing-library/jest-dom';
```

## 查询方法

### 查询类型

RTL提供三种查询类型:
- **getBy**: 查询存在的元素,不存在则抛出错误
- **queryBy**: 查询可能不存在的元素,返回null
- **findBy**: 异步查询,返回Promise

### getBy查询

```typescript
import { render, screen } from '@testing-library/react';

function App() {
  return (
    <div>
      <h1>Welcome</h1>
      <button>Click me</button>
      <label htmlFor="name">Name</label>
      <input id="name" />
    </div>
  );
}

test('getBy queries', () => {
  render(<App />);
  
  // 按角色查询(最推荐)
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  
  // 按文本查询
  const heading = screen.getByText('Welcome');
  expect(heading).toBeInTheDocument();
  
  // 按标签文本查询
  const input = screen.getByLabelText('Name');
  expect(input).toBeInTheDocument();
  
  // 按占位符查询
  const search = screen.getByPlaceholderText('Search...');
  
  // 按测试ID查询(最后选择)
  const element = screen.getByTestId('custom-element');
});
```

### queryBy查询

```typescript
test('queryBy queries', () => {
  render(<App />);
  
  // 元素不存在时不抛错
  const nonExistent = screen.queryByText('Does not exist');
  expect(nonExistent).not.toBeInTheDocument();
  
  // 条件渲染测试
  const conditionalElement = screen.queryByRole('alert');
  expect(conditionalElement).toBeNull();
});
```

### findBy查询

```typescript
test('findBy queries', async () => {
  render(<AsyncComponent />);
  
  // 等待元素出现
  const asyncElement = await screen.findByText('Loaded');
  expect(asyncElement).toBeInTheDocument();
  
  // 自定义超时
  const slowElement = await screen.findByRole('button', {
    timeout: 5000,
  });
});
```

### 查询变体

```typescript
test('query variants', () => {
  render(<List />);
  
  // 单个元素
  const button = screen.getByRole('button');
  
  // 多个元素
  const buttons = screen.getAllByRole('button');
  expect(buttons).toHaveLength(3);
  
  // 查询可能不存在的多个元素
  const items = screen.queryAllByRole('listitem');
  
  // 异步查询多个元素
  const asyncItems = await screen.findAllByText(/item/i);
});
```

## 优先级查询

### 推荐查询顺序

```typescript
// 1. getByRole (最优先)
screen.getByRole('button', { name: /submit/i });

// 2. getByLabelText (表单元素)
screen.getByLabelText('Username');

// 3. getByPlaceholderText
screen.getByPlaceholderText('Enter your name');

// 4. getByText
screen.getByText('Welcome');

// 5. getByDisplayValue (表单当前值)
screen.getByDisplayValue('John');

// 6. getByAltText (图片)
screen.getByAltText('Profile picture');

// 7. getByTitle
screen.getByTitle('Close');

// 8. getByTestId (最后选择)
screen.getByTestId('custom-element');
```

### 最佳查询示例

```typescript
function LoginForm() {
  return (
    <form>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" />
      
      <label htmlFor="password">Password</label>
      <input id="password" type="password" />
      
      <button type="submit">Log in</button>
    </form>
  );
}

test('login form', () => {
  render(<LoginForm />);
  
  // ✅ 使用getByRole
  const emailInput = screen.getByRole('textbox', { name: /email/i });
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /log in/i });
  
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});
```

## 用户交互

### user-event vs fireEvent

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';

// ✅ 推荐: userEvent (更接近真实用户行为)
test('with userEvent', async () => {
  const user = userEvent.setup();
  render(<Button />);
  
  const button = screen.getByRole('button');
  await user.click(button);
});

// ⚠️ fireEvent (低级API)
test('with fireEvent', () => {
  render(<Button />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
});
```

### 点击交互

```typescript
test('click interactions', async () => {
  const user = userEvent.setup();
  const handleClick = jest.fn();
  
  render(<button onClick={handleClick}>Click me</button>);
  
  const button = screen.getByRole('button');
  
  // 单击
  await user.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
  
  // 双击
  await user.dblClick(button);
  expect(handleClick).toHaveBeenCalledTimes(3);
  
  // 右键点击
  await user.pointer({ keys: '[MouseRight]', target: button });
});
```

### 输入交互

```typescript
test('input interactions', async () => {
  const user = userEvent.setup();
  const handleChange = jest.fn();
  
  render(<input onChange={handleChange} />);
  
  const input = screen.getByRole('textbox');
  
  // 输入文本
  await user.type(input, 'Hello World');
  expect(input).toHaveValue('Hello World');
  
  // 清空输入
  await user.clear(input);
  expect(input).toHaveValue('');
  
  // 粘贴文本
  await user.paste('Pasted text');
  expect(input).toHaveValue('Pasted text');
});
```

### 键盘交互

```typescript
test('keyboard interactions', async () => {
  const user = userEvent.setup();
  const handleKeyDown = jest.fn();
  
  render(<input onKeyDown={handleKeyDown} />);
  
  const input = screen.getByRole('textbox');
  
  // 按键
  await user.keyboard('Hello');
  
  // 特殊键
  await user.keyboard('{Enter}');
  await user.keyboard('{Escape}');
  await user.keyboard('{Tab}');
  
  // 组合键
  await user.keyboard('{Control>}a{/Control}'); // Ctrl+A
  await user.keyboard('{Shift>}Tab{/Shift}'); // Shift+Tab
});
```

### 选择交互

```typescript
test('select interactions', async () => {
  const user = userEvent.setup();
  
  render(
    <select>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="orange">Orange</option>
    </select>
  );
  
  const select = screen.getByRole('combobox');
  
  // 选择选项
  await user.selectOptions(select, 'banana');
  expect(select).toHaveValue('banana');
  
  // 选择多个选项
  await user.selectOptions(select, ['apple', 'orange']);
});
```

### 复选框和单选框

```typescript
test('checkbox interactions', async () => {
  const user = userEvent.setup();
  
  render(
    <>
      <input type="checkbox" id="terms" />
      <label htmlFor="terms">Agree to terms</label>
    </>
  );
  
  const checkbox = screen.getByRole('checkbox');
  
  // 勾选
  await user.click(checkbox);
  expect(checkbox).toBeChecked();
  
  // 取消勾选
  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
});

test('radio interactions', async () => {
  const user = userEvent.setup();
  
  render(
    <>
      <input type="radio" id="option1" name="choice" value="1" />
      <label htmlFor="option1">Option 1</label>
      
      <input type="radio" id="option2" name="choice" value="2" />
      <label htmlFor="option2">Option 2</label>
    </>
  );
  
  const option1 = screen.getByLabelText('Option 1');
  const option2 = screen.getByLabelText('Option 2');
  
  await user.click(option1);
  expect(option1).toBeChecked();
  expect(option2).not.toBeChecked();
  
  await user.click(option2);
  expect(option1).not.toBeChecked();
  expect(option2).toBeChecked();
});
```

## 异步测试

### waitFor

```typescript
import { render, screen, waitFor } from '@testing-library/react';

test('async data loading', async () => {
  render(<AsyncComponent />);
  
  // 等待条件满足
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
  
  // 自定义超时和间隔
  await waitFor(
    () => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    },
    { timeout: 3000, interval: 100 }
  );
});
```

### waitForElementToBeRemoved

```typescript
test('element removal', async () => {
  render(<LoadingComponent />);
  
  const loader = screen.getByText('Loading...');
  
  // 等待元素被移除
  await waitForElementToBeRemoved(loader);
  
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

### findBy查询

```typescript
test('async rendering', async () => {
  render(<AsyncList />);
  
  // findBy会自动等待
  const items = await screen.findAllByRole('listitem');
  expect(items).toHaveLength(5);
});
```

## 组件测试实例

### 计数器组件

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

describe('Counter', () => {
  it('should display initial count', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
  
  it('should increment count', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    await user.click(incrementButton);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
  
  it('should decrement count', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    
    const decrementButton = screen.getByRole('button', { name: /decrement/i });
    await user.click(decrementButton);
    
    expect(screen.getByText('Count: -1')).toBeInTheDocument();
  });
  
  it('should reset count', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    
    // 先增加计数
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    await user.click(incrementButton);
    await user.click(incrementButton);
    
    // 然后重置
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});
```

### 表单组件

```typescript
function ContactForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(Object.fromEntries(formData));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" required />
      
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />
      
      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" required />
      
      <button type="submit">Submit</button>
    </form>
  );
}

describe('ContactForm', () => {
  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    
    render(<ContactForm onSubmit={handleSubmit} />);
    
    // 填写表单
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Hello World');
    
    // 提交表单
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // 验证提交
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello World',
    });
  });
  
  it('should display validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={jest.fn()} />);
    
    // 尝试提交空表单
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // 验证错误消息
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
```

### 列表组件

```typescript
function TodoList() {
  const [todos, setTodos] = useState<string[]>([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input]);
      setInput('');
    }
  };
  
  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add todo"
      />
      <button onClick={addTodo}>Add</button>
      
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('TodoList', () => {
  it('should add new todo', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    const input = screen.getByPlaceholderText(/add todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await user.type(input, 'Buy milk');
    await user.click(addButton);
    
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });
  
  it('should remove todo', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    
    // 添加todo
    await user.type(screen.getByPlaceholderText(/add todo/i), 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add/i }));
    
    // 删除todo
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
  });
});
```

## 测试React Hooks

### useState Hook

```typescript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

function CounterWithHook() {
  const { count, increment, decrement, reset } = useCounter(5);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

test('useCounter hook', async () => {
  const user = userEvent.setup();
  render(<CounterWithHook />);
  
  expect(screen.getByText('Count: 5')).toBeInTheDocument();
  
  await user.click(screen.getByText('+'));
  expect(screen.getByText('Count: 6')).toBeInTheDocument();
  
  await user.click(screen.getByText('Reset'));
  expect(screen.getByText('Count: 5')).toBeInTheDocument();
});
```

### useEffect Hook

```typescript
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;
  
  return <div>{user.name}</div>;
}

test('UserProfile loading and data', async () => {
  render(<UserProfile userId={1} />);
  
  // 验证加载状态
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // 等待数据加载
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

## 测试Context

```typescript
const ThemeContext = createContext<'light' | 'dark'>('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button className={`btn-${theme}`}>
      {theme === 'light' ? 'Light' : 'Dark'} Theme
    </button>
  );
}

test('themed button', () => {
  render(
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
  
  const button = screen.getByRole('button');
  expect(button).toHaveClass('btn-dark');
  expect(button).toHaveTextContent('Dark Theme');
});
```

## 最佳实践

### 使用测试辅助函数

```typescript
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark';
}

function customRender(
  ui: ReactElement,
  { theme = 'light', ...options }: CustomRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </QueryClientProvider>,
    options
  );
}

export * from '@testing-library/react';
export { customRender as render };
```

### 测试可访问性

```typescript
test('accessibility', () => {
  render(<MyForm />);
  
  // 确保表单元素有正确的标签
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  
  // 确保按钮有可访问的名称
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  
  // 确保错误消息关联到输入框
  const input = screen.getByLabelText('Email');
  expect(input).toHaveAttribute('aria-describedby');
});
```

### 避免实现细节

```typescript
// ❌ 测试实现细节
test('bad test', () => {
  const { container } = render(<MyComponent />);
  const button = container.querySelector('.my-button-class');
  expect(button).toHaveTextContent('Click me');
});

// ✅ 测试用户行为
test('good test', () => {
  render(<MyComponent />);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});
```

React Testing Library通过鼓励测试用户行为而非实现细节,帮助我们编写更加健壮和可维护的测试。掌握RTL的核心概念和最佳实践,可以显著提升测试质量和开发效率。

