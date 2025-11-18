# Children Props

## 学习目标

通过本章学习，你将掌握：

- Children Props的概念和作用
- Children的各种使用方式
- React.Children工具方法详解
- Render Props模式
- Compound Components（复合组件）模式
- Slot模式
- React 19中Children的新特性
- 高级组合模式

## 第一部分：Children基础

### 1.1 什么是Children

Children是一个特殊的prop，代表组件标签之间的内容。

#### 基本概念

```jsx
// children就是开始标签和结束标签之间的内容
<Card>
  这是children内容
</Card>

// 等价于传递children prop
<Card children="这是children内容" />

// 组件定义
function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

// children可以是任何类型
<Card>文本内容</Card>              // 字符串
<Card>{123}</Card>                  // 数字
<Card><p>JSX元素</p></Card>         // React元素
<Card>{[1, 2, 3]}</Card>            // 数组
<Card>{condition && <div/>}</Card>  // 条件渲染
```

### 1.2 Children的类型

```jsx
// 1. 字符串children
<Component>Hello World</Component>

function Component({ children }) {
  console.log(typeof children);  // "string"
  return <div>{children}</div>;
}

// 2. 数字children
<Component>{42}</Component>

function Component({ children }) {
  console.log(typeof children);  // "number"
  return <div>{children}</div>;
}

// 3. React元素children
<Component>
  <p>段落</p>
  <span>文本</span>
</Component>

function Component({ children }) {
  console.log(React.isValidElement(children));  // false（多个元素）
  // children是一个数组
  return <div>{children}</div>;
}

// 4. 函数children (Render Props)
<Component>
  {(data) => <div>{data}</div>}
</Component>

function Component({ children }) {
  const data = 'some data';
  return children(data);
}

// 5. 布尔值children（不渲染）
<Component>{true}</Component>
<Component>{false}</Component>

function Component({ children }) {
  return <div>{children}</div>;  // 不显示任何内容
}

// 6. null/undefined children（不渲染）
<Component>{null}</Component>
<Component>{undefined}</Component>

// 7. 数组children
<Component>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</Component>
```

### 1.3 Children的基本用法

#### 简单包装组件

```jsx
// 容器组件
function Container({ children }) {
  return (
    <div className="container">
      {children}
    </div>
  );
}

// 使用
<Container>
  <h1>标题</h1>
  <p>内容</p>
</Container>

// 布局组件
function Layout({ children }) {
  return (
    <div className="layout">
      <header>Header</header>
      <main>{children}</main>
      <footer>Footer</footer>
    </div>
  );
}

// 使用
<Layout>
  <h1>页面标题</h1>
  <p>页面内容</p>
</Layout>
```

#### 条件渲染children

```jsx
function ConditionalWrapper({ condition, wrapper, children }) {
  return condition ? wrapper(children) : children;
}

// 使用
<ConditionalWrapper
  condition={isHighlighted}
  wrapper={children => <mark>{children}</mark>}
>
  这段文本可能被高亮
</ConditionalWrapper>

// 另一个例子
function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// 使用
<ProtectedRoute isAuthenticated={user !== null}>
  <Dashboard />
</ProtectedRoute>
```

## 第二部分：React.Children工具方法

### 2.1 React.Children.map

```jsx
import { Children } from 'react';

function List({ children }) {
  // 遍历children并包装每个元素
  return (
    <ul>
      {Children.map(children, (child, index) => (
        <li key={index}>{child}</li>
      ))}
    </ul>
  );
}

// 使用
<List>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</List>

// 渲染结果
<ul>
  <li><span>Item 1</span></li>
  <li><span>Item 2</span></li>
  <li><span>Item 3</span></li>
</ul>

// 处理复杂children
function EnhancedList({ children }) {
  return (
    <div className="list">
      {Children.map(children, (child, index) => {
        // 为每个child添加额外的props
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            index,
            className: `list-item ${child.props.className || ''}`
          });
        }
        return child;
      })}
    </div>
  );
}
```

### 2.2 React.Children.forEach

```jsx
import { Children } from 'react';

function ComponentAnalyzer({ children }) {
  let textNodes = 0;
  let elementNodes = 0;
  
  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      textNodes++;
    } else if (React.isValidElement(child)) {
      elementNodes++;
    }
  });
  
  return (
    <div>
      <p>文本节点: {textNodes}</p>
      <p>元素节点: {elementNodes}</p>
      <div>{children}</div>
    </div>
  );
}

// 使用
<ComponentAnalyzer>
  Hello
  <span>World</span>
  123
  <div>React</div>
</ComponentAnalyzer>
// 输出：文本节点: 2, 元素节点: 2
```

### 2.3 React.Children.count

```jsx
import { Children } from 'react';

function ChildCounter({ children }) {
  const count = Children.count(children);
  
  return (
    <div>
      <p>子元素数量: {count}</p>
      <div>{children}</div>
    </div>
  );
}

// 使用
<ChildCounter>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</ChildCounter>
// 输出：子元素数量: 3

// 单个child
<ChildCounter>
  <div>Only one</div>
</ChildCounter>
// 输出：子元素数量: 1

// 数组children
<ChildCounter>
  {[1, 2, 3].map(n => <div key={n}>{n}</div>)}
</ChildCounter>
// 输出：子元素数量: 3
```

### 2.4 React.Children.only

```jsx
import { Children } from 'react';

function SingleChildWrapper({ children }) {
  // 确保只有一个child，否则抛出错误
  const child = Children.only(children);
  
  return (
    <div className="wrapper">
      {child}
    </div>
  );
}

// 正确使用
<SingleChildWrapper>
  <div>唯一的子元素</div>
</SingleChildWrapper>

// 错误使用（会抛出错误）
<SingleChildWrapper>
  <div>First</div>
  <div>Second</div>
</SingleChildWrapper>
// Error: React.Children.only expected to receive a single React element child.

// 实际应用：高阶组件
function withLogging(Component) {
  return function LoggingWrapper({ children, ...props }) {
    const child = Children.only(children);
    
    useEffect(() => {
      console.log('Component mounted');
    }, []);
    
    return <Component {...props}>{child}</Component>;
  };
}
```

### 2.5 React.Children.toArray

```jsx
import { Children } from 'react';

function SortableList({ children, sortBy }) {
  // 转换为数组以便排序
  const childArray = Children.toArray(children);
  
  const sorted = childArray.sort((a, b) => {
    if (sortBy === 'text') {
      const aText = a.props.children;
      const bText = b.props.children;
      return aText.localeCompare(bText);
    }
    return 0;
  });
  
  return <div>{sorted}</div>;
}

// 使用
<SortableList sortBy="text">
  <div>Banana</div>
  <div>Apple</div>
  <div>Cherry</div>
</SortableList>
// 渲染顺序：Apple, Banana, Cherry

// 过滤children
function FilteredList({ children, filter }) {
  const childArray = Children.toArray(children);
  
  const filtered = childArray.filter(child => {
    if (React.isValidElement(child)) {
      return child.props.type === filter;
    }
    return false;
  });
  
  return <div>{filtered}</div>;
}
```

## 第三部分：克隆和修改Children

### 3.1 React.cloneElement

```jsx
import { cloneElement } from 'react';

function EnhancedChildren({ children }) {
  return (
    <>
      {Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // 克隆child并添加props
          return cloneElement(child, {
            index,
            enhanced: true,
            onClick: () => console.log(`Clicked item ${index}`)
          });
        }
        return child;
      })}
    </>
  );
}

// 使用
<EnhancedChildren>
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</EnhancedChildren>

// 每个button都会获得index、enhanced和onClick props
```

#### 修改className

```jsx
function AddClassName({ className, children }) {
  return Children.map(children, child => {
    if (React.isValidElement(child)) {
      const existingClassName = child.props.className || '';
      return cloneElement(child, {
        className: `${existingClassName} ${className}`.trim()
      });
    }
    return child;
  });
}

// 使用
<AddClassName className="highlight">
  <div>Item 1</div>
  <div className="special">Item 2</div>
</AddClassName>

// 渲染结果
<div class="highlight">Item 1</div>
<div class="special highlight">Item 2</div>
```

#### 注入依赖

```jsx
function ThemeProvider({ theme, children }) {
  return Children.map(children, child => {
    if (React.isValidElement(child)) {
      // 注入theme prop
      return cloneElement(child, { theme });
    }
    return child;
  });
}

// 使用
<ThemeProvider theme="dark">
  <Header />
  <Content />
  <Footer />
</ThemeProvider>

// Header、Content、Footer都会收到theme="dark" prop
```

### 3.2 深度克隆children

```jsx
function deepCloneChildren(children, props) {
  return Children.map(children, child => {
    if (!React.isValidElement(child)) {
      return child;
    }
    
    // 克隆当前child
    const cloned = cloneElement(child, props);
    
    // 如果child有children，递归克隆
    if (child.props.children) {
      return cloneElement(cloned, {
        children: deepCloneChildren(child.props.children, props)
      });
    }
    
    return cloned;
  });
}

function DeepEnhancer({ className, children }) {
  return deepCloneChildren(children, { className });
}

// 使用
<DeepEnhancer className="enhanced">
  <div>
    <span>
      <p>深层嵌套</p>
    </span>
  </div>
</DeepEnhancer>

// 所有嵌套元素都会添加className="enhanced"
```

## 第四部分：高级Children模式

### 4.1 Render Props模式

```jsx
// 基本Render Props
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return render(position);
}

// 使用
<Mouse render={({ x, y }) => (
  <div>鼠标位置: {x}, {y}</div>
)} />

// Children as Function模式
function DataProvider({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);
  
  return children({ data, loading });
}

// 使用
<DataProvider url="/api/users">
  {({ data, loading }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
</DataProvider>
```

#### 高级Render Props

```jsx
function FormField({ name, validate, children }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (touched) {
      const err = validate(newValue);
      setError(err);
    }
  };
  
  const handleBlur = () => {
    setTouched(true);
    const err = validate(value);
    setError(err);
  };
  
  return children({
    value,
    error,
    touched,
    onChange: handleChange,
    onBlur: handleBlur
  });
}

// 使用
<FormField
  name="email"
  validate={value => {
    if (!value) return '邮箱不能为空';
    if (!/\S+@\S+/.test(value)) return '邮箱格式错误';
    return null;
  }}
>
  {({ value, error, touched, onChange, onBlur }) => (
    <div>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder="请输入邮箱"
      />
      {touched && error && <span className="error">{error}</span>}
    </div>
  )}
</FormField>
```

### 4.2 Compound Components（复合组件）模式

```jsx
// 复合组件：Tab组件族
const TabsContext = createContext();

function Tabs({ defaultIndex = 0, children }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  const isActive = activeIndex === index;
  
  return (
    <button
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  const { activeIndex } = useContext(TabsContext);
  const panels = Children.toArray(children);
  
  return <div className="tab-panels">{panels[activeIndex]}</div>;
}

function TabPanel({ children }) {
  return <div className="tab-panel">{children}</div>;
}

// 导出复合组件
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// 使用
<Tabs defaultIndex={0}>
  <Tabs.List>
    <Tabs.Tab index={0}>标签1</Tabs.Tab>
    <Tabs.Tab index={1}>标签2</Tabs.Tab>
    <Tabs.Tab index={2}>标签3</Tabs.Tab>
  </Tabs.List>
  
  <Tabs.Panels>
    <Tabs.Panel>内容1</Tabs.Panel>
    <Tabs.Panel>内容2</Tabs.Panel>
    <Tabs.Panel>内容3</Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

#### Accordion复合组件

```jsx
const AccordionContext = createContext();

function Accordion({ allowMultiple = false, children }) {
  const [openItems, setOpenItems] = useState([]);
  
  const toggleItem = (index) => {
    setOpenItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      if (allowMultiple) {
        return [...prev, index];
      }
      return [index];
    });
  };
  
  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ index, children }) {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const isOpen = openItems.includes(index);
  
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      {Children.map(children, child => {
        if (React.isValidElement(child)) {
          return cloneElement(child, { index, isOpen, toggleItem });
        }
        return child;
      })}
    </div>
  );
}

function AccordionHeader({ index, isOpen, toggleItem, children }) {
  return (
    <div className="accordion-header" onClick={() => toggleItem(index)}>
      {children}
      <span>{isOpen ? '▼' : '▶'}</span>
    </div>
  );
}

function AccordionPanel({ isOpen, children }) {
  return isOpen ? <div className="accordion-panel">{children}</div> : null;
}

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;

// 使用
<Accordion allowMultiple>
  <Accordion.Item index={0}>
    <Accordion.Header>问题1</Accordion.Header>
    <Accordion.Panel>答案1</Accordion.Panel>
  </Accordion.Item>
  
  <Accordion.Item index={1}>
    <Accordion.Header>问题2</Accordion.Header>
    <Accordion.Panel>答案2</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

### 4.3 Slot模式

```jsx
// Slot模式：命名插槽
function Card({ header, footer, children }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// 使用
<Card
  header={<h2>卡片标题</h2>}
  footer={<button>确定</button>}
>
  <p>卡片内容</p>
</Card>

// 基于children的Slot模式
function Layout({ children }) {
  const childArray = Children.toArray(children);
  
  const header = childArray.find(
    child => child.props?.slot === 'header'
  );
  
  const sidebar = childArray.find(
    child => child.props?.slot === 'sidebar'
  );
  
  const main = childArray.filter(
    child => !child.props?.slot
  );
  
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  );
}

// 使用
<Layout>
  <div slot="header">
    <h1>页面标题</h1>
  </div>
  
  <div slot="sidebar">
    <nav>导航</nav>
  </div>
  
  <div>
    <p>主要内容</p>
  </div>
</Layout>
```

### 4.4 Controlled Children模式

```jsx
// 受控的children
function RadioGroup({ value, onChange, children }) {
  return (
    <div className="radio-group">
      {Children.map(children, child => {
        if (React.isValidElement(child) && child.type === Radio) {
          return cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onChange(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
}

function Radio({ value, checked, onChange, children }) {
  return (
    <label>
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {children}
    </label>
  );
}

// 使用
function Form() {
  const [gender, setGender] = useState('male');
  
  return (
    <RadioGroup value={gender} onChange={setGender}>
      <Radio value="male">男</Radio>
      <Radio value="female">女</Radio>
      <Radio value="other">其他</Radio>
    </RadioGroup>
  );
}
```

## 第五部分：React 19的Children新特性

### 5.1 Server Components中的Children

```jsx
// Server Component接收children
async function ServerLayout({ children }) {
  const data = await fetchData();
  
  return (
    <div className="layout">
      <header>
        <h1>{data.title}</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}

// 使用（children可以是Client Component）
<ServerLayout>
  <ClientCounter />
</ServerLayout>
```

### 5.2 use() Hook与Children

```jsx
import { use } from 'react';

// Children可以传递Promise
function AsyncWrapper({ childrenPromise }) {
  const children = use(childrenPromise);
  return <div>{children}</div>;
}

// 使用
const contentPromise = fetchContent().then(data => (
  <div>{data.content}</div>
));

<Suspense fallback={<Loading />}>
  <AsyncWrapper childrenPromise={contentPromise} />
</Suspense>
```

### 5.3 优化的Children处理

```jsx
// React 19自动优化children渲染
function OptimizedList({ children }) {
  // React 19会自动优化children的diff
  return (
    <ul>
      {Children.map(children, (child, index) => (
        <li key={index}>{child}</li>
      ))}
    </ul>
  );
}

// 即使children频繁变化，React 19也能高效处理
<OptimizedList>
  {items.map(item => <Item key={item.id} data={item} />)}
</OptimizedList>
```

## 第六部分：Children最佳实践

### 6.1 类型检查

```tsx
// TypeScript中的Children类型
import { ReactNode, ReactElement } from 'react';

// 任何可渲染的内容
interface Props1 {
  children: ReactNode;
}

// 只接受单个React元素
interface Props2 {
  children: ReactElement;
}

// 只接受字符串
interface Props3 {
  children: string;
}

// 函数children
interface Props4 {
  children: (data: any) => ReactNode;
}

// 使用
function Container({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function SingleChild({ children }: { children: ReactElement }) {
  return Children.only(children);
}

function RenderProp({ children }: { children: (data: string) => ReactNode }) {
  return children('data');
}
```

#### PropTypes验证

```jsx
import PropTypes from 'prop-types';

Container.propTypes = {
  // 任何可渲染的内容
  children: PropTypes.node,
  
  // 单个React元素
  // children: PropTypes.element,
  
  // 特定类型的元素
  // children: PropTypes.elementType,
  
  // 函数
  // children: PropTypes.func,
  
  // 必需的children
  // children: PropTypes.node.isRequired
};
```

### 6.2 性能优化

```jsx
// 避免不必要的children重新渲染
function OptimizedContainer({ className, children }) {
  // 使用useMemo缓存处理后的children
  const processedChildren = useMemo(() => {
    return Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return cloneElement(child, { index });
      }
      return child;
    });
  }, [children]);
  
  return <div className={className}>{processedChildren}</div>;
}

// 使用React.memo避免不必要的渲染
const MemoizedChild = React.memo(function Child({ data }) {
  return <div>{data}</div>;
});

function Parent({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

// 使用
<Parent>
  <MemoizedChild data="static" />
</Parent>
```

### 6.3 错误处理

```jsx
// 安全的children处理
function SafeContainer({ children }) {
  try {
    const count = Children.count(children);
    
    if (count === 0) {
      return <div>没有内容</div>;
    }
    
    return (
      <div>
        {Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) {
            console.warn('Invalid child at index', index);
            return null;
          }
          return child;
        })}
      </div>
    );
  } catch (error) {
    console.error('Error processing children:', error);
    return <div>渲染出错</div>;
  }
}
```

### 6.4 文档化Children要求

```jsx
/**
 * Card组件
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - 卡片内容，可以是任何可渲染的内容
 * @param {string} [props.className] - 额外的CSS类名
 * 
 * @example
 * <Card>
 *   <h2>标题</h2>
 *   <p>内容</p>
 * </Card>
 */
function Card({ children, className }) {
  return (
    <div className={`card ${className || ''}`}>
      {children}
    </div>
  );
}

/**
 * TabList组件
 * 
 * @param {Object} props
 * @param {ReactElement<typeof Tab>[]} props.children - 必须是Tab组件的数组
 * 
 * @example
 * <TabList>
 *   <Tab>标签1</Tab>
 *   <Tab>标签2</Tab>
 * </TabList>
 */
function TabList({ children }) {
  // 验证children都是Tab组件
  Children.forEach(children, child => {
    if (child.type !== Tab) {
      console.warn('TabList only accepts Tab components as children');
    }
  });
  
  return <div className="tab-list">{children}</div>;
}
```

## 第七部分：实战案例

### 7.1 响应式网格布局

```jsx
function Grid({ columns = { xs: 1, sm: 2, md: 3, lg: 4 }, gap = 16, children }) {
  const [currentColumns, setCurrentColumns] = useState(columns.md);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 576) setCurrentColumns(columns.xs);
      else if (width < 768) setCurrentColumns(columns.sm);
      else if (width < 992) setCurrentColumns(columns.md);
      else setCurrentColumns(columns.lg);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {children}
    </div>
  );
}

// 使用
<Grid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={20}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
  <div>Item 5</div>
  <div>Item 6</div>
</Grid>
```

### 7.2 动画包装器

```jsx
import { motion } from 'framer-motion';

function AnimatedList({ children, stagger = 0.1 }) {
  return (
    <motion.div>
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * stagger }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// 使用
<AnimatedList stagger={0.15}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</AnimatedList>
```

### 7.3 表单构建器

```jsx
function Form({ onSubmit, children }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 收集所有字段的验证结果
    const newErrors = {};
    Children.forEach(children, child => {
      if (React.isValidElement(child) && child.props.name) {
        const { name, validate } = child.props;
        const error = validate?.(values[name]);
        if (error) {
          newErrors[name] = error;
        }
      }
    });
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    } else {
      setErrors(newErrors);
    }
  };
  
  // 为每个input添加value和onChange
  const enhancedChildren = Children.map(children, child => {
    if (React.isValidElement(child) && child.props.name) {
      const { name } = child.props;
      return cloneElement(child, {
        value: values[name] || '',
        error: errors[name],
        onChange: (e) => {
          setValues(prev => ({ ...prev, [name]: e.target.value }));
          setErrors(prev => ({ ...prev, [name]: null }));
        }
      });
    }
    return child;
  });
  
  return <form onSubmit={handleSubmit}>{enhancedChildren}</form>;
}

function Input({ name, label, value, error, onChange, validate }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input value={value} onChange={onChange} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// 使用
<Form onSubmit={handleFormSubmit}>
  <Input
    name="username"
    label="用户名"
    validate={v => !v ? '用户名不能为空' : null}
  />
  <Input
    name="email"
    label="邮箱"
    validate={v => !/\S+@\S+/.test(v) ? '邮箱格式错误' : null}
  />
  <button type="submit">提交</button>
</Form>
```

### 7.4 权限控制组件

```jsx
function PermissionGate({ permissions, fallback = null, children }) {
  const userPermissions = useUserPermissions();
  
  // 检查用户是否有所需权限
  const hasPermission = permissions.every(p => 
    userPermissions.includes(p)
  );
  
  if (!hasPermission) {
    return fallback;
  }
  
  // 为children注入权限信息
  return Children.map(children, child => {
    if (React.isValidElement(child)) {
      return cloneElement(child, { hasPermission: true });
    }
    return child;
  });
}

// 使用
<PermissionGate 
  permissions={['admin', 'write']}
  fallback={<div>您没有权限访问此内容</div>}
>
  <AdminPanel />
  <EditButton />
</PermissionGate>
```

## 练习题

### 基础练习

1. 创建一个Container组件，使用children渲染内容
2. 使用React.Children.map为每个child添加className
3. 实现一个只接受单个child的组件

### 进阶练习

1. 实现一个Tabs复合组件系统
2. 创建一个Render Props模式的数据获取组件
3. 实现一个Slot模式的布局组件

### 高级练习

1. 创建一个表单构建器，自动收集和验证字段
2. 实现一个支持动画的列表组件
3. 创建一个基于children的路由系统

通过本章学习，你已经全面掌握了Children Props的使用方法和高级模式。Children是React组件组合的核心，熟练运用Children能让你构建出更加灵活和可复用的组件。继续学习，成为React组合大师！

