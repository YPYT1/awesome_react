# useMemo使用场景

## 第一部分：useMemo基础

### 1.1 什么是useMemo

`useMemo`是React Hook，用于缓存计算结果。它在依赖项不变时返回缓存值，避免重复计算，优化性能。

**基本语法：**

```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

**工作原理：**

```javascript
// useMemo的简化实现
function useMemo(factory, deps) {
  const hook = getCurrentHook();
  const prevDeps = hook.deps;
  const prevValue = hook.value;
  
  // 首次渲染或依赖变化
  if (!prevDeps || !depsEqual(prevDeps, deps)) {
    const value = factory();  // 执行计算
    hook.deps = deps;
    hook.value = value;
    return value;
  }
  
  // 依赖未变，返回缓存值
  return prevValue;
}

function depsEqual(prevDeps, nextDeps) {
  if (prevDeps.length !== nextDeps.length) return false;
  
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false;
    }
  }
  
  return true;
}
```

### 1.2 基础使用

```javascript
// 1. 简单计算缓存
function Component({ num }) {
  const doubled = useMemo(() => {
    console.log('Computing doubled...');
    return num * 2;
  }, [num]);
  
  return <div>{doubled}</div>;
}

// 2. 复杂计算
function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    console.log('Processing data...');
    
    return data
      .filter(item => item.active)
      .map(item => ({
        ...item,
        fullName: `${item.firstName} ${item.lastName}`
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [data]);
  
  return <List items={processedData} />;
}

// 3. 对象缓存
function Component() {
  const [count, setCount] = useState(0);
  
  const config = useMemo(() => ({
    theme: 'dark',
    size: 'large',
    count: count
  }), [count]);
  
  return <ChildComponent config={config} />;
}

// 4. 数组缓存
function Component({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.type === filter);
  }, [items, filter]);
  
  return <List items={filteredItems} />;
}
```

### 1.3 何时使用useMemo

```javascript
// ✅ 适合使用的场景

// 1. 昂贵的计算
function DataAnalysis({ data }) {
  const statistics = useMemo(() => {
    // 复杂的统计计算
    const sum = data.reduce((acc, val) => acc + val, 0);
    const avg = sum / data.length;
    const variance = data.reduce((acc, val) => 
      acc + Math.pow(val - avg, 2), 0
    ) / data.length;
    const stdDev = Math.sqrt(variance);
    
    return { sum, avg, variance, stdDev };
  }, [data]);
  
  return <StatsDisplay stats={statistics} />;
}

// 2. 避免子组件不必要的重新渲染
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  const childProps = useMemo(() => ({
    theme: 'dark',
    size: 'large'
  }), []);  // 稳定引用
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      <ChildComponent {...childProps} />
      {/* childProps引用不变，ChildComponent不重新渲染 */}
    </div>
  );
}

const ChildComponent = React.memo(function ChildComponent(props) {
  console.log('ChildComponent rendered');
  return <div>{props.theme}</div>;
});

// 3. 依赖于其他Hook的值
function Component({ userId }) {
  const user = useMemo(() => {
    return fetchUserFromCache(userId);
  }, [userId]);
  
  const userName = useMemo(() => {
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  }, [user]);
  
  return <div>{userName}</div>;
}

// ❌ 不适合使用的场景

// 1. 简单计算
function Bad1({ a, b }) {
  // 不需要useMemo
  const sum = useMemo(() => a + b, [a, b]);
  return <div>{sum}</div>;
}

// ✅ 直接计算更好
function Good1({ a, b }) {
  const sum = a + b;
  return <div>{sum}</div>;
}

// 2. 每次都变化的依赖
function Bad2() {
  const [data, setData] = useState([]);
  
  // data每次都是新数组，useMemo无效
  const processed = useMemo(() => {
    return processData(data);
  }, [data]);
}

// 3. 过度使用
function Bad3({ value }) {
  const doubled = useMemo(() => value * 2, [value]);
  const tripled = useMemo(() => value * 3, [value]);
  const squared = useMemo(() => value * value, [value]);
  
  // 简单计算不需要memo
  return <div>{doubled + tripled + squared}</div>;
}
```

## 第二部分：常见使用场景

### 2.1 数据过滤和排序

```javascript
// 场景1：搜索过滤
function SearchableList({ items, searchTerm }) {
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    
    if (!searchTerm) return items;
    
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerSearch) ||
      item.description.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm]);
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// 场景2：多条件过滤
function AdvancedFilter({ products, filters }) {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 分类过滤
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // 价格范围过滤
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      
      // 品牌过滤
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }
      
      return true;
    });
  }, [products, filters]);
  
  return <ProductList products={filteredProducts} />;
}

// 场景3：排序
function SortableList({ items, sortBy, sortOrder }) {
  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });
    
    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  }, [items, sortBy, sortOrder]);
  
  return <List items={sortedItems} />;
}

// 场景4：过滤+排序+分页
function ComplexList({ data, filters, sorting, pagination }) {
  const processedData = useMemo(() => {
    // 1. 过滤
    let result = data.filter(item => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.search && !item.name.includes(filters.search)) return false;
      return true;
    });
    
    // 2. 排序
    result.sort((a, b) => {
      const order = sorting.order === 'asc' ? 1 : -1;
      return order * (a[sorting.field] > b[sorting.field] ? 1 : -1);
    });
    
    // 3. 分页
    const start = pagination.page * pagination.pageSize;
    const end = start + pagination.pageSize;
    result = result.slice(start, end);
    
    return result;
  }, [data, filters, sorting, pagination]);
  
  return <Table data={processedData} />;
}
```

### 2.2 计算派生状态

```javascript
// 场景1：统计信息
function Statistics({ orders }) {
  const stats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + order.amount, 0);
    const count = orders.length;
    const average = count > 0 ? total / count : 0;
    
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    return { total, count, average, byStatus };
  }, [orders]);
  
  return (
    <div>
      <p>总计: ${stats.total}</p>
      <p>数量: {stats.count}</p>
      <p>平均: ${stats.average.toFixed(2)}</p>
      <p>待处理: {stats.byStatus.pending || 0}</p>
      <p>已完成: {stats.byStatus.completed || 0}</p>
    </div>
  );
}

// 场景2：数据聚合
function Dashboard({ transactions }) {
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    const byCategory = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      acc[t.category][t.type] += t.amount;
      return acc;
    }, {});
    
    return { income, expense, balance, byCategory };
  }, [transactions]);
  
  return <SummaryDisplay summary={summary} />;
}

// 场景3：表单验证
function Form({ formData }) {
  const validation = useMemo(() => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = '邮箱必填';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '邮箱格式不正确';
    }
    
    if (!formData.password) {
      errors.password = '密码必填';
    } else if (formData.password.length < 8) {
      errors.password = '密码至少8位';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次密码不一致';
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }, [formData]);
  
  return (
    <div>
      {validation.errors.email && <span>{validation.errors.email}</span>}
      {validation.errors.password && <span>{validation.errors.password}</span>}
      <button disabled={!validation.isValid}>提交</button>
    </div>
  );
}

// 场景4：图表数据处理
function Chart({ rawData }) {
  const chartData = useMemo(() => {
    // 数据分组
    const groupedByDate = rawData.reduce((acc, item) => {
      const date = item.date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
    
    // 计算每日总和
    const dailyTotals = Object.entries(groupedByDate).map(([date, items]) => ({
      date,
      total: items.reduce((sum, item) => sum + item.value, 0),
      count: items.length
    }));
    
    // 排序
    dailyTotals.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return dailyTotals;
  }, [rawData]);
  
  return <LineChart data={chartData} />;
}
```

### 2.3 优化引用稳定性

```javascript
// 场景1：对象props
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ 每次都是新对象
  const config = { theme: 'dark', size: 'large' };
  
  // ✅ 使用useMemo稳定引用
  const memoConfig = useMemo(() => ({
    theme: 'dark',
    size: 'large'
  }), []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ChildComponent config={memoConfig} />
    </div>
  );
}

const ChildComponent = React.memo(function ChildComponent({ config }) {
  console.log('Child rendered');
  return <div>{config.theme}</div>;
});

// 场景2：数组props
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const visibleTodos = useMemo(() => {
    if (filter === 'all') return todos;
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);
  
  return <TodoItems items={visibleTodos} />;
}

const TodoItems = React.memo(function TodoItems({ items }) {
  console.log('TodoItems rendered');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
});

// 场景3：函数依赖
function Component({ userId }) {
  const user = useMemo(() => getUserById(userId), [userId]);
  
  // 依赖于memo化的值
  const userPermissions = useMemo(() => {
    return calculatePermissions(user);
  }, [user]);
  
  const canEdit = useMemo(() => {
    return userPermissions.includes('edit');
  }, [userPermissions]);
  
  return <div>Can Edit: {canEdit ? 'Yes' : 'No'}</div>;
}

// 场景4：Context value
const UserContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({});
  
  const contextValue = useMemo(() => ({
    user,
    preferences,
    setUser,
    setPreferences
  }), [user, preferences]);
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
```

### 2.4 性能关键路径

```javascript
// 场景1：虚拟滚动
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      ...item,
      index: startIndex + i,
      top: (startIndex + i) * itemHeight
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: item.top,
              height: itemHeight
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// 场景2：实时搜索
function RealtimeSearch({ data }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  const searchResults = useMemo(() => {
    if (!debouncedQuery) return [];
    
    const lowerQuery = debouncedQuery.toLowerCase();
    return data
      .filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);  // 限制结果数量
  }, [data, debouncedQuery]);
  
  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      <SearchResults results={searchResults} />
    </div>
  );
}

// 场景3：复杂表格
function DataTable({ data, columns, sorting }) {
  const tableData = useMemo(() => {
    // 1. 排序
    let sorted = [...data];
    if (sorting.column) {
      sorted.sort((a, b) => {
        const aVal = a[sorting.column];
        const bVal = b[sorting.column];
        const order = sorting.direction === 'asc' ? 1 : -1;
        
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }
    
    // 2. 格式化
    return sorted.map(row => {
      const formatted = {};
      columns.forEach(col => {
        formatted[col.key] = col.format 
          ? col.format(row[col.key]) 
          : row[col.key];
      });
      return formatted;
    });
  }, [data, columns, sorting]);
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 场景4：动画计算
function AnimatedComponent({ data }) {
  const animationData = useMemo(() => {
    return data.map(item => ({
      ...item,
      delay: item.index * 0.1,
      duration: 0.5 + (item.priority * 0.2),
      easing: item.type === 'primary' ? 'ease-out' : 'ease-in-out'
    }));
  }, [data]);
  
  return (
    <div>
      {animationData.map(item => (
        <AnimatedItem key={item.id} {...item} />
      ))}
    </div>
  );
}
```

## 第三部分：进阶技巧

### 3.1 条件性memo

```javascript
// 根据条件决定是否memo
function SmartMemo({ items, enableOptimization }) {
  const processedItems = enableOptimization
    ? useMemo(() => expensiveProcess(items), [items])
    : expensiveProcess(items);
  
  return <List items={processedItems} />;
}

// 根据数据量决定
function DataSizeMemo({ data }) {
  const shouldMemo = data.length > 1000;
  
  const processed = shouldMemo
    ? useMemo(() => processData(data), [data])
    : processData(data);
  
  return <Display data={processed} />;
}
```

### 3.2 嵌套memo

```javascript
// 多层依赖的memo
function NestedMemo({ rawData, filters, sorting }) {
  // 第一层：过滤
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.category && item.category !== filters.category) return false;
      return true;
    });
  }, [rawData, filters]);
  
  // 第二层：排序（依赖filteredData）
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const field = sorting.field;
      const order = sorting.order === 'asc' ? 1 : -1;
      return order * (a[field] > b[field] ? 1 : -1);
    });
  }, [filteredData, sorting]);
  
  // 第三层：分组（依赖sortedData）
  const groupedData = useMemo(() => {
    return sortedData.reduce((acc, item) => {
      const key = item.group;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [sortedData]);
  
  return <GroupedList data={groupedData} />;
}
```

### 3.3 配合其他Hook

```javascript
// 配合useCallback
function Component({ onUpdate }) {
  const [items, setItems] = useState([]);
  
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      formatted: formatItem(item)
    }));
  }, [items]);
  
  const handleUpdate = useCallback((id, changes) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...changes } : item
      )
    );
    onUpdate?.();
  }, [onUpdate]);
  
  return <List items={processedItems} onUpdate={handleUpdate} />;
}

// 配合useEffect
function Component({ data }) {
  const processedData = useMemo(() => {
    return heavyProcess(data);
  }, [data]);
  
  useEffect(() => {
    // 使用memo化的值
    console.log('Processed data changed:', processedData);
  }, [processedData]);
  
  return <Display data={processedData} />;
}

// 配合useRef
function Component({ items }) {
  const prevItemsRef = useRef();
  
  const itemsChanged = useMemo(() => {
    const changed = prevItemsRef.current !== items;
    prevItemsRef.current = items;
    return changed;
  }, [items]);
  
  if (itemsChanged) {
    console.log('Items changed');
  }
  
  return <div>{items.length}</div>;
}
```

### 3.4 性能监控

```javascript
// 监控memo效果
function MonitoredMemo({ data }) {
  const startTime = useRef(Date.now());
  
  const processed = useMemo(() => {
    const computeStart = performance.now();
    const result = expensiveComputation(data);
    const computeEnd = performance.now();
    
    console.log('Computation time:', computeEnd - computeStart, 'ms');
    console.log('Time since mount:', Date.now() - startTime.current, 'ms');
    
    return result;
  }, [data]);
  
  return <Display data={processed} />;
}

// 比较memo前后性能
function PerformanceCompare({ data, useMemoization }) {
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(c => c + 1);
  });
  
  const processed = useMemoization
    ? useMemo(() => {
        console.log('Computing with memo');
        return processData(data);
      }, [data])
    : (() => {
        console.log('Computing without memo');
        return processData(data);
      })();
  
  return (
    <div>
      <p>Render count: {renderCount}</p>
      <Display data={processed} />
    </div>
  );
}
```

## 注意事项

### 1. 依赖数组

```javascript
// ❌ 错误：缺少依赖
function Bad({ userId }) {
  const user = useMemo(() => {
    return getUserById(userId);
  }, []);  // 缺少userId
}

// ✅ 正确：完整依赖
function Good({ userId }) {
  const user = useMemo(() => {
    return getUserById(userId);
  }, [userId]);
}

// ❌ 错误：过多依赖
function Bad2({ count }) {
  const obj = useMemo(() => {
    return { value: count };
  }, [count, obj]);  // obj作为依赖会导致无限循环
}

// ✅ 正确：只依赖必要的值
function Good2({ count }) {
  const obj = useMemo(() => {
    return { value: count };
  }, [count]);
}
```

### 2. 避免过度使用

```javascript
// ❌ 过度memo
function OverMemo({ a, b, c }) {
  const sum = useMemo(() => a + b, [a, b]);
  const product = useMemo(() => a * b, [a, b]);
  const diff = useMemo(() => a - b, [a, b]);
  const quotient = useMemo(() => a / b, [a, b]);
  
  return <div>{sum + product + diff + quotient}</div>;
}

// ✅ 合理使用
function Reasonable({ a, b, c }) {
  const sum = a + b;  // 简单计算不需要memo
  const product = a * b;
  const diff = a - b;
  const quotient = a / b;
  
  return <div>{sum + product + diff + quotient}</div>;
}
```

### 3. memo开销

```javascript
// useMemo本身有开销
// 只有计算成本 > memo成本时才值得使用

// ❌ 不值得：简单操作
const doubled = useMemo(() => value * 2, [value]);

// ✅ 值得：复杂操作
const processed = useMemo(() => {
  return items
    .filter(item => item.active)
    .map(item => complexTransform(item))
    .sort((a, b) => expensiveCompare(a, b));
}, [items]);
```

## 常见问题

### Q1: useMemo和useCallback的区别？

**A:** useMemo缓存值，useCallback缓存函数。

### Q2: 什么时候应该使用useMemo？

**A:** 昂贵计算、稳定引用、优化子组件渲染。

### Q3: useMemo会影响首次渲染性能吗？

**A:** 会有轻微影响，首次需要执行计算并存储。

### Q4: 依赖数组为空数组可以吗？

**A:** 可以，表示只在首次渲染时计算。

### Q5: useMemo可以在条件语句中使用吗？

**A:** 不可以，Hook必须在组件顶层调用。

### Q6: 如何判断是否需要useMemo？

**A:** 使用React DevTools Profiler测量性能。

### Q7: useMemo可以缓存函数吗？

**A:** 可以，但通常使用useCallback更合适。

### Q8: 依赖项如何确定？

**A:** 包含所有在回调中使用的外部变量。

### Q9: useMemo会导致内存泄漏吗？

**A:** 不会，React会自动管理缓存。

### Q10: React 19对useMemo有什么改进？

**A:** 编译器可能自动优化，减少手动memo需求。

## 总结

### 核心要点

```
1. useMemo作用
   ✅ 缓存计算结果
   ✅ 避免重复计算
   ✅ 优化性能
   ✅ 稳定引用

2. 适用场景
   ✅ 昂贵计算
   ✅ 数据处理
   ✅ 派生状态
   ✅ 引用稳定性

3. 注意事项
   ❌ 简单计算
   ❌ 过度使用
   ❌ 错误依赖
   ❌ 忽略开销
```

### 最佳实践

```
1. 使用原则
   ✅ 先测量再优化
   ✅ 计算成本 > memo成本
   ✅ 正确的依赖数组
   ✅ 配合React.memo

2. 性能优化
   ✅ 合理的粒度
   ✅ 避免嵌套过深
   ✅ 监控效果
   ✅ 持续优化

3. 代码质量
   ✅ 清晰的意图
   ✅ 适当的注释
   ✅ 易于维护
   ✅ 可测试性
```

useMemo是React性能优化的重要工具，合理使用能显著提升应用性能。

## 第五部分：复杂场景实战

### 5.1 大数据集处理

```javascript
// 场景：处理超大数据集
function LargeDatasetProcessor({ data }) {
  // 分阶段处理
  const chunked = useMemo(() => {
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }, [data]);

  const processedChunks = useMemo(() => {
    return chunked.map(chunk =>
      chunk.map(item => heavyProcessing(item))
    );
  }, [chunked]);

  const flattened = useMemo(() => {
    return processedChunks.flat();
  }, [processedChunks]);

  return <DataDisplay data={flattened} />;
}

// 分页数据处理
function PaginatedData({ items, page, pageSize }) {
  const totalPages = useMemo(() => {
    return Math.ceil(items.length / pageSize);
  }, [items.length, pageSize]);

  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  const processedData = useMemo(() => {
    return currentPageData.map(item => ({
      ...item,
      formatted: formatItem(item)
    }));
  }, [currentPageData]);

  return (
    <div>
      <List items={processedData} />
      <Pagination current={page} total={totalPages} />
    </div>
  );
}

// 增量更新处理
function IncrementalProcessor({ items }) {
  const processedMapRef = useRef(new Map());

  const processed = useMemo(() => {
    items.forEach(item => {
      if (!processedMapRef.current.has(item.id)) {
        processedMapRef.current.set(item.id, processItem(item));
      }
    });

    // 清理不存在的项
    const currentIds = new Set(items.map(i => i.id));
    for (const id of processedMapRef.current.keys()) {
      if (!currentIds.has(id)) {
        processedMapRef.current.delete(id);
      }
    }

    return Array.from(processedMapRef.current.values());
  }, [items]);

  return <Display data={processed} />;
}

// Web Worker处理大数据
function WebWorkerProcessor({ data }) {
  const [processed, setProcessed] = useState([]);

  const worker = useMemo(() => {
    const w = new Worker('processor.worker.js');
    w.onmessage = (e) => setProcessed(e.data);
    return w;
  }, []);

  useEffect(() => {
    worker.postMessage(data);

    return () => worker.terminate();
  }, [data, worker]);

  return <Display data={processed} />;
}
```

### 5.2 复杂计算链

```javascript
// 多步骤数据转换
function DataPipeline({ rawData, config }) {
  // 步骤1：过滤
  const filtered = useMemo(() => {
    return rawData.filter(item => {
      return config.filters.every(filter =>
        filter.fn(item)
      );
    });
  }, [rawData, config.filters]);

  // 步骤2：转换
  const transformed = useMemo(() => {
    return filtered.map(item => {
      return config.transformers.reduce(
        (acc, transformer) => transformer(acc),
        item
      );
    });
  }, [filtered, config.transformers]);

  // 步骤3：聚合
  const aggregated = useMemo(() => {
    return transformed.reduce((acc, item) => {
      const key = config.groupBy(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [transformed, config.groupBy]);

  // 步骤4：排序
  const sorted = useMemo(() => {
    return Object.entries(aggregated)
      .sort(([keyA], [keyB]) =>
        config.sortFn(keyA, keyB)
      )
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }, [aggregated, config.sortFn]);

  return <GroupedDisplay data={sorted} />;
}

// 依赖链优化
function DependencyChain({ input }) {
  const step1 = useMemo(() => compute1(input), [input]);
  const step2 = useMemo(() => compute2(step1), [step1]);
  const step3 = useMemo(() => compute3(step2), [step2]);
  const step4 = useMemo(() => compute4(step3), [step3]);

  const result = useMemo(() => {
    return combineResults(step1, step2, step3, step4);
  }, [step1, step2, step3, step4]);

  return <Result data={result} />;
}

// 条件计算链
function ConditionalPipeline({ data, mode }) {
  const baseProcessed = useMemo(() => {
    return data.map(processBase);
  }, [data]);

  const modeSpecific = useMemo(() => {
    switch (mode) {
      case 'advanced':
        return baseProcessed.map(advancedProcess);
      case 'simple':
        return baseProcessed.map(simpleProcess);
      default:
        return baseProcessed;
    }
  }, [baseProcessed, mode]);

  const finalResult = useMemo(() => {
    return modeSpecific.map(item => ({
      ...item,
      metadata: generateMetadata(item, mode)
    }));
  }, [modeSpecific, mode]);

  return <Display data={finalResult} />;
}
```

### 5.3 缓存策略

```javascript
// LRU缓存实现
function useMemoWithLRU(fn, deps, maxSize = 100) {
  const cacheRef = useRef(new Map());

  return useMemo(() => {
    const key = JSON.stringify(deps);

    if (cacheRef.current.has(key)) {
      const value = cacheRef.current.get(key);
      // 移到最前面（最近使用）
      cacheRef.current.delete(key);
      cacheRef.current.set(key, value);
      return value;
    }

    const result = fn();

    // 添加到缓存
    cacheRef.current.set(key, result);

    // 超出大小限制，删除最久未使用的
    if (cacheRef.current.size > maxSize) {
      const firstKey = cacheRef.current.keys().next().value;
      cacheRef.current.delete(firstKey);
    }

    return result;
  }, deps);
}

// 使用
function Component({ data }) {
  const processed = useMemoWithLRU(
    () => expensiveProcess(data),
    [data],
    50
  );

  return <Display data={processed} />;
}

// 带过期时间的缓存
function useMemoWithExpiry(fn, deps, ttl = 60000) {
  const cacheRef = useRef({
    value: null,
    timestamp: 0,
    deps: null
  });

  return useMemo(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    // 检查是否过期
    const isExpired = now - cache.timestamp > ttl;
    const depsChanged = !shallowEqual(cache.deps, deps);

    if (!isExpired && !depsChanged && cache.value !== null) {
      return cache.value;
    }

    const result = fn();
    cacheRef.current = {
      value: result,
      timestamp: now,
      deps: [...deps]
    };

    return result;
  }, deps);
}

// 多级缓存
function useMultiLevelCache(fn, deps) {
  const l1Cache = useRef(null);  // 内存缓存
  const l2Cache = useRef(new Map());  // Map缓存

  return useMemo(() => {
    const key = JSON.stringify(deps);

    // L1缓存
    if (l1Cache.current?.key === key) {
      return l1Cache.current.value;
    }

    // L2缓存
    if (l2Cache.current.has(key)) {
      const value = l2Cache.current.get(key);
      l1Cache.current = { key, value };
      return value;
    }

    // 计算并缓存
    const result = fn();
    l1Cache.current = { key, value: result };
    l2Cache.current.set(key, result);

    return result;
  }, deps);
}

// SessionStorage缓存
function useMemoWithSessionStorage(key, fn, deps) {
  return useMemo(() => {
    const cacheKey = `${key}_${JSON.stringify(deps)}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        sessionStorage.removeItem(cacheKey);
      }
    }

    const result = fn();
    sessionStorage.setItem(cacheKey, JSON.stringify(result));

    return result;
  }, deps);
}
```

### 5.4 动态优化

```javascript
// 自适应memo
function useAdaptiveMemo(fn, deps) {
  const timingsRef = useRef([]);
  const [useMemoization, setUseMemoization] = useState(true);

  const result = useMemoization
    ? useMemo(() => {
        const start = performance.now();
        const res = fn();
        const duration = performance.now() - start;

        timingsRef.current.push(duration);
        if (timingsRef.current.length > 10) {
          timingsRef.current.shift();
        }

        // 如果平均耗时<1ms，禁用memo
        const avg = timingsRef.current.reduce((a, b) => a + b, 0) / timingsRef.current.length;
        if (avg < 1) {
          setUseMemoization(false);
        }

        return res;
      }, deps)
    : fn();

  return result;
}

// 分时处理
function useTimeSlicedMemo(fn, deps, timeSlice = 16) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const deadline = Date.now() + timeSlice;

    function process() {
      if (cancelled) return;

      if (Date.now() < deadline) {
        const res = fn();
        setResult(res);
      } else {
        requestIdleCallback(process);
      }
    }

    process();

    return () => {
      cancelled = true;
    };
  }, deps);

  return result;
}

// 渐进式计算
function useProgressiveMemo(fn, deps, steps = 10) {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let currentStep = 0;
    let partialResults = [];

    function processStep() {
      if (currentStep >= steps) {
        setResult(partialResults.flat());
        return;
      }

      const chunkSize = Math.ceil(deps[0].length / steps);
      const start = currentStep * chunkSize;
      const end = start + chunkSize;
      const chunk = deps[0].slice(start, end);

      partialResults.push(fn(chunk));
      currentStep++;
      setProgress((currentStep / steps) * 100);

      requestAnimationFrame(processStep);
    }

    processStep();
  }, deps);

  return { result, progress };
}

// 智能批处理
function useBatchedMemo(fn, deps, batchSize = 100) {
  return useMemo(() => {
    const data = deps[0];
    if (!Array.isArray(data)) return fn(data);

    const results = [];
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      results.push(...fn(batch));
    }

    return results;
  }, deps);
}
```

## 第六部分：性能模式

### 6.1 计算优先级

```javascript
// 优先级计算
function usePrioritizedMemo(computations) {
  const [results, setResults] = useState({});

  useEffect(() => {
    const sorted = [...computations].sort((a, b) =>
      b.priority - a.priority
    );

    const newResults = {};

    sorted.forEach(({ key, fn, deps, priority }) => {
      if (priority === 'high') {
        newResults[key] = fn(...deps);
      } else {
        requestIdleCallback(() => {
          setResults(prev => ({
            ...prev,
            [key]: fn(...deps)
          }));
        });
      }
    });

    setResults(prev => ({ ...prev, ...newResults }));
  }, [computations]);

  return results;
}

// 使用
function App({ data }) {
  const results = usePrioritizedMemo([
    {
      key: 'critical',
      fn: criticalCompute,
      deps: [data],
      priority: 'high'
    },
    {
      key: 'secondary',
      fn: secondaryCompute,
      deps: [data],
      priority: 'low'
    }
  ]);

  return (
    <div>
      <CriticalView data={results.critical} />
      <SecondaryView data={results.secondary} />
    </div>
  );
}

// 延迟计算
function useDeferredMemo(fn, deps, delay = 0) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (delay === 0) {
      setResult(fn());
      return;
    }

    const timer = setTimeout(() => {
      setResult(fn());
    }, delay);

    return () => clearTimeout(timer);
  }, deps);

  return result;
}

// 条件计算
function useConditionalMemo(fn, deps, condition) {
  const previousResultRef = useRef(null);

  return useMemo(() => {
    if (condition()) {
      const result = fn();
      previousResultRef.current = result;
      return result;
    }

    return previousResultRef.current;
  }, [...deps, condition]);
}
```

### 6.2 内存管理

```javascript
// 内存限制的memo
function useMemoryConstrainedMemo(fn, deps, maxMemoryMB = 10) {
  const cacheRef = useRef(new Map());
  const sizeRef = useRef(0);

  return useMemo(() => {
    const key = JSON.stringify(deps);

    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key);
    }

    const result = fn();
    const size = roughSizeOfObject(result);

    // 检查内存限制
    if (sizeRef.current + size > maxMemoryMB * 1024 * 1024) {
      // 清理最旧的条目
      const firstKey = cacheRef.current.keys().next().value;
      const firstValue = cacheRef.current.get(firstKey);
      sizeRef.current -= roughSizeOfObject(firstValue);
      cacheRef.current.delete(firstKey);
    }

    cacheRef.current.set(key, result);
    sizeRef.current += size;

    return result;
  }, deps);
}

function roughSizeOfObject(object) {
  const objectList = [];
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
      objectList.push(value);

      for (const key in value) {
        stack.push(value[key]);
      }
    }
  }

  return bytes;
}

// 弱引用缓存
function useWeakMemo(fn, deps) {
  const cacheRef = useRef(new WeakMap());

  return useMemo(() => {
    const key = deps[0];  // 假设第一个依赖是对象

    if (typeof key === 'object' && key !== null) {
      if (cacheRef.current.has(key)) {
        return cacheRef.current.get(key);
      }

      const result = fn();
      cacheRef.current.set(key, result);
      return result;
    }

    return fn();
  }, deps);
}

// 自动清理
function useSelfCleaningMemo(fn, deps, cleanupInterval = 60000) {
  const cacheRef = useRef(new Map());
  const timestampsRef = useRef(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      for (const [key, timestamp] of timestampsRef.current.entries()) {
        if (now - timestamp > cleanupInterval) {
          cacheRef.current.delete(key);
          timestampsRef.current.delete(key);
        }
      }
    }, cleanupInterval);

    return () => clearInterval(interval);
  }, [cleanupInterval]);

  return useMemo(() => {
    const key = JSON.stringify(deps);

    if (cacheRef.current.has(key)) {
      timestampsRef.current.set(key, Date.now());
      return cacheRef.current.get(key);
    }

    const result = fn();
    cacheRef.current.set(key, result);
    timestampsRef.current.set(key, Date.now());

    return result;
  }, deps);
}
```

### 6.3 并发处理

```javascript
// 并行计算多个memo
function useParallelMemo(computations) {
  const [results, setResults] = useState({});

  useEffect(() => {
    const promises = computations.map(async ({ key, fn, deps }) => {
      const result = await fn(...deps);
      return { key, result };
    });

    Promise.all(promises).then(results => {
      const newResults = results.reduce((acc, { key, result }) => {
        acc[key] = result;
        return acc;
      }, {});

      setResults(newResults);
    });
  }, [computations]);

  return results;
}

// Web Worker并行处理
function useWorkerMemo(fn, deps, workerCount = 4) {
  const [result, setResult] = useState(null);
  const workersRef = useRef([]);

  useEffect(() => {
    // 初始化workers
    if (workersRef.current.length === 0) {
      for (let i = 0; i < workerCount; i++) {
        workersRef.current.push(new Worker('compute.worker.js'));
      }
    }

    const data = deps[0];
    if (!Array.isArray(data)) return;

    const chunkSize = Math.ceil(data.length / workerCount);
    const promises = workersRef.current.map((worker, i) => {
      return new Promise(resolve => {
        const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
        worker.onmessage = (e) => resolve(e.data);
        worker.postMessage({ fn: fn.toString(), data: chunk });
      });
    });

    Promise.all(promises).then(results => {
      setResult(results.flat());
    });

    return () => {
      workersRef.current.forEach(w => w.terminate());
      workersRef.current = [];
    };
  }, deps);

  return result;
}

// 流式处理
function useStreamMemo(fn, deps) {
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setResults([]);
    setDone(false);

    const data = deps[0];
    let index = 0;

    function processNext() {
      if (index >= data.length) {
        setDone(true);
        return;
      }

      const item = data[index];
      const result = fn(item);

      setResults(prev => [...prev, result]);
      index++;

      requestAnimationFrame(processNext);
    }

    processNext();
  }, deps);

  return { results, done };
}
```

### 6.4 调试和监控

```javascript
// 性能监控hook
function useMonitoredMemo(name, fn, deps) {
  const renderCountRef = useRef(0);
  const computeTimeRef = useRef([]);

  const result = useMemo(() => {
    const start = performance.now();
    const res = fn();
    const duration = performance.now() - start;

    renderCountRef.current++;
    computeTimeRef.current.push(duration);

    if (computeTimeRef.current.length > 10) {
      computeTimeRef.current.shift();
    }

    const avg = computeTimeRef.current.reduce((a, b) => a + b, 0) / computeTimeRef.current.length;

    console.log(`[${name}] Compute #${renderCountRef.current}:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);

    if (duration > 16) {
      console.warn(`  ⚠️ Slow computation detected!`);
    }

    return res;
  }, deps);

  return result;
}

// 依赖变化追踪
function useTrackedMemo(name, fn, deps) {
  const prevDepsRef = useRef(deps);

  const result = useMemo(() => {
    if (prevDepsRef.current) {
      const changes = deps.map((dep, i) => {
        if (prevDepsRef.current[i] !== dep) {
          return {
            index: i,
            from: prevDepsRef.current[i],
            to: dep
          };
        }
        return null;
      }).filter(Boolean);

      if (changes.length > 0) {
        console.log(`[${name}] Dependencies changed:`);
        console.table(changes);
      }
    }

    prevDepsRef.current = deps;
    return fn();
  }, deps);

  return result;
}

// 内存使用追踪
function useMemoryTrackedMemo(name, fn, deps) {
  return useMemo(() => {
    const beforeMemory = performance.memory?.usedJSHeapSize || 0;

    const result = fn();

    const afterMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryUsed = afterMemory - beforeMemory;

    if (memoryUsed > 1024 * 1024) {  // > 1MB
      console.warn(
        `[${name}] High memory usage:`,
        (memoryUsed / 1024 / 1024).toFixed(2),
        'MB'
      );
    }

    return result;
  }, deps);
}

// 可视化调试
function MemoDebugger({ children }) {
  const [memos, setMemos] = useState([]);

  const registerMemo = useCallback((name, info) => {
    setMemos(prev => {
      const existing = prev.find(m => m.name === name);
      if (existing) {
        return prev.map(m =>
          m.name === name
            ? { ...m, ...info, count: m.count + 1 }
            : m
        );
      }
      return [...prev, { name, ...info, count: 1 }];
    });
  }, []);

  return (
    <MemoContext.Provider value={{ registerMemo }}>
      {children}
      <MemoStats memos={memos} />
    </MemoContext.Provider>
  );
}

function MemoStats({ memos }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'white', border: '1px solid black', padding: '10px' }}>
      <h4>Memo Statistics</h4>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Computes</th>
            <th>Avg Time</th>
            <th>Total Time</th>
          </tr>
        </thead>
        <tbody>
          {memos.map(memo => (
            <tr key={memo.name}>
              <td>{memo.name}</td>
              <td>{memo.count}</td>
              <td>{memo.avgTime?.toFixed(2)}ms</td>
              <td>{memo.totalTime?.toFixed(2)}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 总结升级

### 高级技巧总结

```
1. 数据处理
   - 分chunk处理大数据
   - 增量更新
   - Web Worker并行
   - 流式处理

2. 缓存策略
   - LRU缓存
   - 过期缓存
   - 多级缓存
   - 持久化缓存

3. 性能优化
   - 自适应memo
   - 分时处理
   - 渐进计算
   - 智能批处理

4. 监控调试
   - 性能监控
   - 依赖追踪
   - 内存分析
   - 可视化调试
```

### 最佳实践增强

```
复杂场景处理：
☐ 评估数据规模
☐ 选择合适策略
☐ 实施分阶段处理
☐ 监控性能指标

缓存管理：
☐ 确定缓存范围
☐ 设置过期策略
☐ 控制内存使用
☐ 实现清理机制

性能调优：
☐ 识别瓶颈
☐ 应用优化模式
☐ 测试验证
☐ 持续监控
```

useMemo是React性能优化的核心工具，掌握高级用法能够应对各种复杂场景。

