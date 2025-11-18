# React.memo组件缓存

## 学习目标

通过本章学习，你将全面掌握：

- React.memo的概念和作用
- React.memo的工作原理
- 如何正确使用React.memo
- 自定义比较函数
- 与useMemo、useCallback的配合使用
- 性能优化最佳实践
- 常见错误和陷阱
- React 19中的memo增强

## 第一部分：React.memo基础

### 1.1 什么是React.memo

React.memo是一个高阶组件（HOC），用于缓存组件的渲染结果。当props没有变化时，跳过重新渲染。

```jsx
// 不使用React.memo
function RegularChild({ name }) {
  console.log('RegularChild渲染');
  return <div>Hello, {name}</div>;
}

function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* Parent更新时，RegularChild也会渲染（即使name没变） */}
      <RegularChild name="Alice" />
    </div>
  );
}

// 使用React.memo
const MemoChild = React.memo(function Child({ name }) {
  console.log('MemoChild渲染');
  return <div>Hello, {name}</div>;
});

function ParentOptimized() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* Parent更新时，MemoChild不会渲染（name没变） */}
      <MemoChild name="Alice" />
    </div>
  );
}
```

### 1.2 React.memo的工作原理

```jsx
// React.memo的简化实现
function memoSimplified(Component, arePropsEqual) {
  let prevProps = null;
  let prevResult = null;
  
  return function MemoizedComponent(nextProps) {
    // 第一次渲染
    if (prevProps === null) {
      prevProps = nextProps;
      prevResult = Component(nextProps);
      return prevResult;
    }
    
    // 比较props
    const propsAreEqual = arePropsEqual
      ? arePropsEqual(prevProps, nextProps)
      : shallowEqual(prevProps, nextProps);
    
    // Props相同，返回缓存的结果
    if (propsAreEqual) {
      return prevResult;
    }
    
    // Props不同，重新渲染
    prevProps = nextProps;
    prevResult = Component(nextProps);
    return prevResult;
  };
}

// 浅比较函数
function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!objB.hasOwnProperty(key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  
  return true;
}
```

### 1.3 基本使用方式

```jsx
// 方式1：包裹函数组件
const MemoComponent1 = React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});

// 方式2：包裹箭头函数
const MemoComponent2 = React.memo(({ name }) => {
  return <div>{name}</div>;
});

// 方式3：先定义再包裹
function MyComponent({ name }) {
  return <div>{name}</div>;
}
const MemoComponent3 = React.memo(MyComponent);

// 方式4：默认导出
export default React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});
```

## 第二部分：浅比较机制

### 2.1 基本类型比较

```jsx
const NumberComp = React.memo(({ value }) => {
  console.log('渲染');
  return <div>{value}</div>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      {/* value是数字，浅比较有效 */}
      <NumberComp value={10} />  {/* 不会重新渲染 */}
      <NumberComp value={count} />  {/* count变化时才渲染 */}
    </div>
  );
}
```

### 2.2 引用类型的问题

```jsx
// 问题：对象和数组每次都是新引用
function PropsReference() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      {/* 每次渲染都创建新对象，memo失效 */}
      <MemoComp config={{ theme: 'dark' }} />
      
      {/* 每次渲染都创建新数组，memo失效 */}
      <MemoComp items={[1, 2, 3]} />
      
      {/* 每次渲染都创建新函数，memo失效 */}
      <MemoComp onClick={() => console.log('click')} />
    </div>
  );
}

const MemoComp = React.memo(({ config, items, onClick }) => {
  console.log('MemoComp渲染（本不应该）');
  return <div>Component</div>;
});
```

### 2.3 解决引用类型问题

```jsx
function ReferenceFixed() {
  const [count, setCount] = useState(0);
  
  // 方案1：提取到组件外部
  const CONFIG = { theme: 'dark' };
  const ITEMS = [1, 2, 3];
  
  // 方案2：使用useMemo
  const configMemo = useMemo(() => ({ theme: 'dark' }), []);
  const itemsMemo = useMemo(() => [1, 2, 3], []);
  
  // 方案3：使用useCallback
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      {/* 现在引用稳定，memo生效 */}
      <MemoComp
        config={configMemo}
        items={itemsMemo}
        onClick={handleClick}
      />
    </div>
  );
}
```

## 第三部分：自定义比较函数

### 3.1 基本用法

```jsx
// 默认的浅比较
const DefaultMemo = React.memo(Component);

// 自定义比较函数
const CustomMemo = React.memo(
  Component,
  (prevProps, nextProps) => {
    // 返回true: props相同，不重新渲染
    // 返回false: props不同，重新渲染
    return prevProps.id === nextProps.id;
  }
);
```

### 3.2 只比较特定属性

```jsx
const UserCard = React.memo(
  function UserCard({ user }) {
    console.log('UserCard渲染');
    
    return (
      <div>
        <h3>{user.name}</h3>
        <p>Age: {user.age}</p>
        <p>Email: {user.email}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 只比较user.id，忽略其他属性变化
    return prevProps.user.id === nextProps.user.id;
  }
);

function App() {
  const [user, setUser] = useState({
    id: 1,
    name: 'Alice',
    age: 25,
    email: 'alice@example.com'
  });
  
  const updateAge = () => {
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
  };
  
  return (
    <div>
      <button onClick={updateAge}>增加年龄</button>
      {/* age变化，但id相同，不会重新渲染 */}
      <UserCard user={user} />
    </div>
  );
}
```

### 3.3 深度比较

```jsx
// 深度比较函数
function deepEqual(objA, objB) {
  if (Object.is(objA, objB)) return true;
  
  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }
  
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(objA[key], objB[key])) return false;
  }
  
  return true;
}

// 使用深度比较
const DeepMemoComp = React.memo(
  function Component({ data }) {
    return <div>{JSON.stringify(data)}</div>;
  },
  (prevProps, nextProps) => {
    return deepEqual(prevProps.data, nextProps.data);
  }
);
```

### 3.4 比较数组

```jsx
const ListComponent = React.memo(
  function ListComponent({ items }) {
    return (
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  },
  (prevProps, nextProps) => {
    const prevItems = prevProps.items;
    const nextItems = nextProps.items;
    
    // 比较数组长度
    if (prevItems.length !== nextItems.length) {
      return false;
    }
    
    // 比较每个元素的id
    for (let i = 0; i < prevItems.length; i++) {
      if (prevItems[i].id !== nextItems[i].id) {
        return false;
      }
    }
    
    return true;
  }
);
```

## 第四部分：与其他Hook配合

### 4.1 配合useCallback

```jsx
function WithUseCallback() {
  const [items, setItems] = useState([]);
  
  // useCallback缓存函数
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  const handleUpdate = useCallback((id, newValue) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, value: newValue } : item
    ));
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <MemoListItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}

// React.memo缓存组件
const MemoListItem = React.memo(function ListItem({ item, onDelete, onUpdate }) {
  console.log('ListItem渲染:', item.id);
  
  return (
    <div>
      <span>{item.name}</span>
      <button onClick={() => onUpdate(item.id, Math.random())}>
        更新
      </button>
      <button onClick={() => onDelete(item.id)}>
        删除
      </button>
    </div>
  );
});
```

### 4.2 配合useMemo

```jsx
function WithUseMemo() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  
  // useMemo缓存过滤结果
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter === 'active') return !item.completed;
      if (filter === 'completed') return item.completed;
      return true;
    });
  }, [items, filter]);
  
  // useMemo缓存配置对象
  const listConfig = useMemo(() => ({
    sortable: true,
    editable: true
  }), []);
  
  return (
    <div>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      
      {/* filteredItems和listConfig引用稳定 */}
      <MemoList items={filteredItems} config={listConfig} />
    </div>
  );
}

const MemoList = React.memo(function List({ items, config }) {
  console.log('List渲染');
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
});
```

### 4.3 三者组合使用

```jsx
function CombinedOptimization() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // useMemo: 缓存过滤后的数据
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);
  
  // useCallback: 缓存事件处理函数
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  const handleUpdate = useCallback((id, newName) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, name: newName } : item
    ));
  }, []);
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="搜索..."
      />
      
      {/* React.memo: 缓存组件渲染 */}
      <MemoItemList
        items={filteredItems}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

const MemoItemList = React.memo(function ItemList({ items, onDelete, onUpdate }) {
  console.log('ItemList渲染');
  
  return (
    <ul>
      {items.map(item => (
        <MemoItem
          key={item.id}
          item={item}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
});

const MemoItem = React.memo(function Item({ item, onDelete, onUpdate }) {
  console.log('Item渲染:', item.id);
  
  return (
    <li>
      <span>{item.name}</span>
      <button onClick={() => onUpdate(item.id, prompt('新名称'))}>
        编辑
      </button>
      <button onClick={() => onDelete(item.id)}>
        删除
      </button>
    </li>
  );
});
```

## 第五部分：性能优化实践

### 5.1 大列表优化

```jsx
function LargeListOptimization() {
  const [items, setItems] = useState(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
  );
  
  // 缓存删除函数
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  const handleUpdate = useCallback((id) => {
    setItems(items => items.map(item =>
      item.id === id ? { ...item, value: Math.random() } : item
    ));
  }, []);
  
  return (
    <div>
      <p>共 {items.length} 项</p>
      <div style={{ height: '600px', overflow: 'auto' }}>
        {items.map(item => (
          <OptimizedRow
            key={item.id}
            item={item}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}

// 使用React.memo优化行组件
const OptimizedRow = React.memo(function Row({ item, onDelete, onUpdate }) {
  // 只有item变化时才重新渲染
  console.log('Row渲染:', item.id);
  
  return (
    <div style={{
      padding: '10px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <span>{item.name}: {item.value.toFixed(3)}</span>
      <div>
        <button onClick={() => onUpdate(item.id)}>更新</button>
        <button onClick={() => onDelete(item.id)}>删除</button>
      </div>
    </div>
  );
});
```

### 5.2 表单优化

```jsx
function FormOptimization() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  // 为每个字段缓存处理函数
  const handleNameChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);
  
  const handleEmailChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  }, []);
  
  const handlePhoneChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, phone: e.target.value }));
  }, []);
  
  const handleAddressChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, address: e.target.value }));
  }, []);
  
  return (
    <form>
      <MemoFormField
        label="姓名"
        value={formData.name}
        onChange={handleNameChange}
      />
      <MemoFormField
        label="邮箱"
        value={formData.email}
        onChange={handleEmailChange}
      />
      <MemoFormField
        label="电话"
        value={formData.phone}
        onChange={handlePhoneChange}
      />
      <MemoFormField
        label="地址"
        value={formData.address}
        onChange={handleAddressChange}
      />
    </form>
  );
}

// memo的表单字段
const MemoFormField = React.memo(function FormField({ label, value, onChange }) {
  console.log('FormField渲染:', label);
  
  return (
    <div>
      <label>{label}</label>
      <input value={value} onChange={onChange} />
    </div>
  );
});
```

### 5.3 虚拟滚动优化

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const handleDelete = useCallback((id) => {
    console.log('删除:', id);
  }, []);
  
  // Row组件
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    
    return (
      <MemoRowItem
        style={style}
        item={item}
        onDelete={handleDelete}
      />
    );
  }, [items, handleDelete]);
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

const MemoRowItem = React.memo(function RowItem({ style, item, onDelete }) {
  console.log('RowItem渲染:', item.id);
  
  return (
    <div style={style}>
      <span>{item.name}</span>
      <button onClick={() => onDelete(item.id)}>删除</button>
    </div>
  );
});
```

## 第六部分：常见错误

### 6.1 错误1：memo组件仍然接收新引用

```jsx
// 错误示例
function MistakeExample() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      {/* 内联对象，每次都是新引用 */}
      <MemoChild config={{ theme: 'dark' }} />
      
      {/* 内联函数，每次都是新引用 */}
      <MemoChild onClick={() => console.log('click')} />
    </div>
  );
}

// 正确示例
function CorrectExample() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({ theme: 'dark' }), []);
  const handleClick = useCallback(() => console.log('click'), []);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      <MemoChild config={config} onClick={handleClick} />
    </div>
  );
}
```

### 6.2 错误2：过度使用memo

```jsx
// 不好：对简单组件使用memo
const SimpleMemo = React.memo(function Simple({ text }) {
  return <div>{text}</div>;  // 渲染成本很低
});

// 不好：对总是变化的组件使用memo
const AlwaysChanging = React.memo(function Clock() {
  const [time, setTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return <div>{new Date(time).toLocaleTimeString()}</div>;
  // 每秒都更新，memo没有意义
});

// 好：对渲染成本高的组件使用memo
const ExpensiveChartMemo = React.memo(function ExpensiveChart({ data }) {
  // 复杂的图表渲染
  const chartData = processChartData(data);  // 昂贵的计算
  
  return <Canvas>{renderChart(chartData)}</Canvas>;
});
```

### 6.3 错误3：忘记缓存回调函数

```jsx
// 错误示例
function ForgotCallback() {
  const [items, setItems] = useState([]);
  
  // 没有useCallback，函数每次都变
  const handleDelete = (id) => {
    setItems(items => items.filter(item => item.id !== id));
  };
  
  return (
    <ul>
      {items.map(item => (
        <MemoItem
          key={item.id}
          item={item}
          onDelete={handleDelete}  {/* 函数每次都变，memo失效 */}
        />
      ))}
    </ul>
  );
}

// 正确示例
function WithCallback() {
  const [items, setItems] = useState([]);
  
  // 使用useCallback缓存函数
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  return (
    <ul>
      {items.map(item => (
        <MemoItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
```

## 第七部分：实战案例

### 7.1 案例1：评论列表

```jsx
function CommentSection() {
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  
  // 排序评论
  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      return 0;
    });
  }, [comments, sortBy]);
  
  // 点赞
  const handleLike = useCallback((id) => {
    setComments(prev => prev.map(comment =>
      comment.id === id
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  }, []);
  
  // 回复
  const handleReply = useCallback((id, replyText) => {
    setComments(prev => prev.map(comment =>
      comment.id === id
        ? { ...comment, replies: [...comment.replies, replyText] }
        : comment
    ));
  }, []);
  
  // 删除
  const handleDelete = useCallback((id) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
  }, []);
  
  return (
    <div>
      <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
        <option value="date">按日期排序</option>
        <option value="likes">按点赞排序</option>
      </select>
      
      <CommentList
        comments={sortedComments}
        onLike={handleLike}
        onReply={handleReply}
        onDelete={handleDelete}
      />
    </div>
  );
}

const CommentList = React.memo(function CommentList({ 
  comments, 
  onLike, 
  onReply, 
  onDelete 
}) {
  console.log('CommentList渲染');
  
  return (
    <div>
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onLike={onLike}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

const CommentItem = React.memo(function CommentItem({ 
  comment, 
  onLike, 
  onReply, 
  onDelete 
}) {
  console.log('CommentItem渲染:', comment.id);
  
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const submitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyInput(false);
    }
  };
  
  return (
    <div className="comment">
      <div className="comment-header">
        <strong>{comment.author}</strong>
        <span>{new Date(comment.date).toLocaleDateString()}</span>
      </div>
      
      <p>{comment.text}</p>
      
      <div className="comment-actions">
        <button onClick={() => onLike(comment.id)}>
          👍 {comment.likes}
        </button>
        <button onClick={() => setShowReplyInput(!showReplyInput)}>
          回复
        </button>
        <button onClick={() => onDelete(comment.id)}>
          删除
        </button>
      </div>
      
      {showReplyInput && (
        <div className="reply-input">
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="输入回复..."
          />
          <button onClick={submitReply}>发送</button>
        </div>
      )}
      
      {comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map((reply, i) => (
            <div key={i} className="reply">{reply}</div>
          ))}
        </div>
      )}
    </div>
  );
});
```

### 7.2 案例2：数据表格

```jsx
function DataTable({ initialData }) {
  const [data, setData] = useState(initialData);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);
  
  // 处理排序点击
  const handleSort = useCallback((column) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);
  
  // 更新行
  const handleUpdateRow = useCallback((id, updates) => {
    setData(prev => prev.map(row =>
      row.id === id ? { ...row, ...updates } : row
    ));
  }, []);
  
  // 删除行
  const handleDeleteRow = useCallback((id) => {
    setData(prev => prev.filter(row => row.id !== id));
  }, []);
  
  return (
    <table>
      <TableHeader
        columns={['name', 'age', 'email']}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      <TableBody
        data={sortedData}
        onUpdate={handleUpdateRow}
        onDelete={handleDeleteRow}
      />
    </table>
  );
}

const TableHeader = React.memo(function TableHeader({ 
  columns, 
  sortColumn, 
  sortDirection, 
  onSort 
}) {
  console.log('TableHeader渲染');
  
  return (
    <thead>
      <tr>
        {columns.map(column => (
          <th key={column} onClick={() => onSort(column)}>
            {column}
            {sortColumn === column && (
              <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
            )}
          </th>
        ))}
        <th>操作</th>
      </tr>
    </thead>
  );
});

const TableBody = React.memo(function TableBody({ data, onUpdate, onDelete }) {
  console.log('TableBody渲染');
  
  return (
    <tbody>
      {data.map(row => (
        <TableRow
          key={row.id}
          row={row}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </tbody>
  );
});

const TableRow = React.memo(function TableRow({ row, onUpdate, onDelete }) {
  console.log('TableRow渲染:', row.id);
  
  return (
    <tr>
      <td>{row.name}</td>
      <td>{row.age}</td>
      <td>{row.email}</td>
      <td>
        <button onClick={() => onUpdate(row.id, { age: row.age + 1 })}>
          +年龄
        </button>
        <button onClick={() => onDelete(row.id)}>
          删除
        </button>
      </td>
    </tr>
  );
});
```

## 第八部分：性能对比

### 8.1 测量渲染时间

```jsx
import { Profiler } from 'react';

function PerformanceComparison() {
  const [count, setCount] = useState(0);
  const [items] = useState(Array(1000).fill(0).map((_, i) => ({
    id: i,
    name: `Item ${i}`
  })));
  
  const onRenderCallback = (id, phase, actualDuration) => {
    console.log(`${id} 渲染耗时: ${actualDuration.toFixed(2)}ms`);
  };
  
  const handleClick = useCallback(() => {
    console.log('点击');
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        更新Count: {count}
      </button>
      
      <Profiler id="不使用memo" onRender={onRenderCallback}>
        <RegularList items={items} onClick={handleClick} />
      </Profiler>
      
      <Profiler id="使用memo" onRender={onRenderCallback}>
        <MemoList items={items} onClick={handleClick} />
      </Profiler>
    </div>
  );
}

// 不使用memo
function RegularList({ items, onClick }) {
  console.log('RegularList渲染');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={onClick}>{item.name}</li>
      ))}
    </ul>
  );
}

// 使用memo
const MemoList = React.memo(function MemoList({ items, onClick }) {
  console.log('MemoList渲染');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={onClick}>{item.name}</li>
      ))}
    </ul>
  );
});
```

### 8.2 渲染次数对比

```jsx
function RenderCountComparison() {
  const [count, setCount] = useState(0);
  const regularRenderCount = useRef(0);
  const memoRenderCount = useRef(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        更新Parent: {count}
      </button>
      
      <RegularChild ref={regularRenderCount} />
      <MemoChild ref={memoRenderCount} />
      
      <div>
        <p>普通组件渲染次数: {regularRenderCount.current}</p>
        <p>Memo组件渲染次数: {memoRenderCount.current}</p>
      </div>
    </div>
  );
}

const RegularChild = forwardRef((props, renderCountRef) => {
  renderCountRef.current++;
  return <div>Regular: {renderCountRef.current}</div>;
});

const MemoChild = React.memo(forwardRef((props, renderCountRef) => {
  renderCountRef.current++;
  return <div>Memo: {renderCountRef.current}</div>;
}));
```

## 第九部分：React 19增强

### 9.1 自动memo

```jsx
// React 19编译器可能自动应用memo
function AutoMemoized({ data }) {
  // 编译器识别这个组件可以优化
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

// 可能被编译为：
// export default React.memo(AutoMemoized);
```

### 9.2 更智能的比较

```jsx
// React 19可能提供更智能的props比较
const SmartMemo = React.memo(function Component({ data }) {
  return <div>{data.value}</div>;
});

// React 19可能自动识别只使用了data.value
// 即使data对象引用变化，只要value相同就不重新渲染
```

## 第十部分：最佳实践

### 10.1 何时使用React.memo

```jsx
// ✅ 使用React.memo的场景：
// 1. 组件渲染成本高
const ExpensiveComponent = React.memo(function Expensive({ data }) {
  // 复杂的渲染逻辑
  return <ComplexChart data={data} />;
});

// 2. 组件接收相同props频繁
const ListItem = React.memo(function ListItem({ item }) {
  return <div>{item.name}</div>;
});

// 3. 组件在大列表中使用
const Row = React.memo(function Row({ data }) {
  return <div>{data}</div>;
});

// ❌ 不需要React.memo的场景：
// 1. 简单组件
function Simple({ text }) {
  return <div>{text}</div>;  // 渲染很快，不需要memo
}

// 2. Props总是变化
function AlwaysChanging({ timestamp }) {
  return <div>{timestamp}</div>;  // timestamp每次都变
}

// 3. 没有props或只有children
function Container({ children }) {
  return <div>{children}</div>;  // children经常变化
}
```

### 10.2 与Hooks配合的最佳实践

```jsx
function BestPractice() {
  const [items, setItems] = useState([]);
  
  // ✅ 好的做法：
  // 1. 用useMemo缓存数据
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      processed: true
    }));
  }, [items]);
  
  // 2. 用useCallback缓存函数
  const handleDelete = useCallback((id) => {
    setItems(items => items.filter(item => item.id !== id));
  }, []);
  
  // 3. 用React.memo包裹组件
  return (
    <MemoList items={processedItems} onDelete={handleDelete} />
  );
}

const MemoList = React.memo(function List({ items, onDelete }) {
  return (
    <ul>
      {items.map(item => (
        <MemoListItem
          key={item.id}
          item={item}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
});

const MemoListItem = React.memo(function ListItem({ item, onDelete }) {
  return (
    <li>
      {item.name}
      <button onClick={() => onDelete(item.id)}>删除</button>
    </li>
  );
});
```

### 10.3 避免过度优化

```jsx
// ❌ 不好：过度优化
function OverOptimized() {
  const [name] = useState('Alice');
  
  // 简单的问候语不需要memo
  return <MemoGreeting name={name} />;
}

const MemoGreeting = React.memo(({ name }) => {
  return <div>Hello, {name}</div>;
});

// ✅ 好：简单组件直接使用
function Reasonable() {
  const [name] = useState('Alice');
  
  return <Greeting name={name} />;
}

function Greeting({ name }) {
  return <div>Hello, {name}</div>;
}
```

## 练习题

### 基础练习

1. 使用React.memo优化一个简单的展示组件
2. 对比使用和不使用memo的渲染次数
3. 实现一个自定义的比较函数

### 进阶练习

1. 优化一个包含100个项目的列表组件
2. 创建一个复杂的表单，使用memo优化字段组件
3. 实现一个评论系统，合理使用memo

### 高级练习

1. 对比memo、useMemo、useCallback的性能影响
2. 实现一个大型数据表格，全面使用React性能优化技术
3. 分析React 19编译器对memo的自动优化

通过本章学习，你已经全面掌握了React.memo的使用。React.memo是组件级别的性能优化工具，配合useMemo和useCallback可以构建高性能的React应用。继续学习，成为React性能优化专家！
