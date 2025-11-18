# useMemo计算缓存

## 学习目标

通过本章学习，你将全面掌握：

- useMemo的概念和工作原理
- useMemo的使用场景
- useMemo vs 重新计算的权衡
- useMemo的性能优化技巧
- 依赖数组的正确使用
- 常见错误和陷阱
- useMemo的实际应用案例
- React 19中的useMemo增强

## 第一部分：useMemo基础

### 1.1 什么是useMemo

useMemo是React提供的性能优化Hook，用于缓存计算结果，避免在每次渲染时都重新计算。

```jsx
import { useMemo } from 'react';

// 基本语法
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 示例
function ExpensiveCalculation({ items }) {
  // 没有useMemo：每次渲染都计算
  const total = items.reduce((sum, item) => sum + item.value, 0);
  
  // 使用useMemo：只在items变化时计算
  const totalMemo = useMemo(() => {
    console.log('计算总和');
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);
  
  return <div>总计：{totalMemo}</div>;
}
```

###  1.2 useMemo的工作原理

```jsx
// useMemo的简化实现
function useMemoSimplified(factory, deps) {
  // 获取当前Hook
  const hook = getCurrentHook();
  
  // 检查依赖是否变化
  const hasChanged = !hook || !areDepsEqual(hook.deps, deps);
  
  if (hasChanged) {
    // 依赖变化，重新计算
    hook.value = factory();
    hook.deps = deps;
  }
  
  // 返回缓存的值
  return hook.value;
}

// 依赖比较（浅比较）
function areDepsEqual(prevDeps, nextDeps) {
  if (prevDeps === null) return false;
  if (prevDeps.length !== nextDeps.length) return false;
  
  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(prevDeps[i], nextDeps[i])) {
      continue;
    }
    return false;
  }
  
  return true;
}
```

### 1.3 基本用法示例

```jsx
function BasicUseMemo() {
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [filter, setFilter] = useState('all');
  
  // 昂贵的过滤计算
  const filteredNumbers = useMemo(() => {
    console.log('执行过滤计算');
    
    if (filter === 'even') {
      return numbers.filter(n => n % 2 === 0);
    } else if (filter === 'odd') {
      return numbers.filter(n => n % 2 !== 0);
    }
    return numbers;
  }, [numbers, filter]);
  
  // 昂贵的求和计算
  const sum = useMemo(() => {
    console.log('执行求和计算');
    return filteredNumbers.reduce((a, b) => a + b, 0);
  }, [filteredNumbers]);
  
  return (
    <div>
      <div>
        <button onClick={() => setFilter('all')}>全部</button>
        <button onClick={() => setFilter('even')}>偶数</button>
        <button onClick={() => setFilter('odd')}>奇数</button>
      </div>
      
      <p>过滤后: {filteredNumbers.join(', ')}</p>
      <p>总和: {sum}</p>
      
      <button onClick={() => setNumbers([...numbers, numbers.length + 1])}>
        添加数字
      </button>
    </div>
  );
}
```

## 第二部分：useMemo的使用场景

### 2.1 场景1：昂贵的计算

```jsx
function ExpensiveComputation({ data }) {
  // 不使用useMemo：每次渲染都执行复杂计算
  const processedData = data.map(item => ({
    ...item,
    processed: complexCalculation(item)  // 假设这是昂贵的计算
  })).sort((a, b) => b.processed - a.processed);
  
  // 使用useMemo：只在data变化时计算
  const processedDataMemo = useMemo(() => {
    console.log('执行复杂计算');
    return data
      .map(item => ({
        ...item,
        processed: complexCalculation(item)
      }))
      .sort((a, b) => b.processed - a.processed);
  }, [data]);
  
  return (
    <div>
      {processedDataMemo.map(item => (
        <div key={item.id}>{item.processed}</div>
      ))}
    </div>
  );
}

// 模拟复杂计算
function complexCalculation(item) {
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += item.value * Math.random();
  }
  return result;
}
```

### 2.2 场景2：避免重新创建对象/数组

```jsx
function ObjectCreation({ userId }) {
  const [count, setCount] = useState(0);
  
  // 不使用useMemo：每次渲染创建新对象
  const userConfig = {
    id: userId,
    settings: {
      theme: 'dark',
      language: 'zh-CN'
    }
  };
  
  // 使用useMemo：只在userId变化时创建新对象
  const userConfigMemo = useMemo(() => ({
    id: userId,
    settings: {
      theme: 'dark',
      language: 'zh-CN'
    }
  }), [userId]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      {/* userConfig每次都是新对象，Child会重新渲染 */}
      <Child config={userConfig} />
      
      {/* userConfigMemo引用稳定，Child不会重新渲染 */}
      <MemoChild config={userConfigMemo} />
    </div>
  );
}

const Child = ({ config }) => {
  console.log('Child渲染');
  return <div>{config.id}</div>;
};

const MemoChild = React.memo(({ config }) => {
  console.log('MemoChild渲染');
  return <div>{config.id}</div>;
});
```

### 2.3 场景3：作为其他Hook的依赖

```jsx
function UseMemoAsDependency({ userId }) {
  const [data, setData] = useState(null);
  
  // 不使用useMemo：options每次都变，useEffect每次都执行
  const options = {
    userId,
    timestamp: Date.now()
  };
  
  // 使用useMemo：options只在userId变化时变化
  const optionsMemo = useMemo(() => ({
    userId,
    timestamp: Date.now()
  }), [userId]);
  
  // 不好的做法
  useEffect(() => {
    fetchData(options).then(setData);
  }, [options]);  // options每次都是新对象，Effect每次都执行
  
  // 好的做法
  useEffect(() => {
    fetchData(optionsMemo).then(setData);
  }, [optionsMemo]);  // optionsMemo只在userId变化时变化
  
  return <div>{data?.name}</div>;
}
```

### 2.4 场景4：大列表过滤和排序

```jsx
function FilteredList({ items, searchTerm, sortBy }) {
  // 过滤
  const filteredItems = useMemo(() => {
    console.log('过滤列表');
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);
  
  // 排序
  const sortedItems = useMemo(() => {
    console.log('排序列表');
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });
  }, [filteredItems, sortBy]);
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id}>
          {item.name} - ¥{item.price}
        </li>
      ))}
    </ul>
  );
}
```

### 2.5 场景5：复杂的派生状态

```jsx
function DerivedState({ users, orders }) {
  // 计算每个用户的订单统计
  const userOrderStats = useMemo(() => {
    console.log('计算用户订单统计');
    
    const stats = {};
    
    users.forEach(user => {
      stats[user.id] = {
        totalOrders: 0,
        totalAmount: 0,
        averageAmount: 0
      };
    });
    
    orders.forEach(order => {
      if (stats[order.userId]) {
        stats[order.userId].totalOrders++;
        stats[order.userId].totalAmount += order.amount;
      }
    });
    
    Object.keys(stats).forEach(userId => {
      const stat = stats[userId];
      stat.averageAmount = stat.totalOrders > 0
        ? stat.totalAmount / stat.totalOrders
        : 0;
    });
    
    return stats;
  }, [users, orders]);
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>订单数: {userOrderStats[user.id].totalOrders}</p>
          <p>总金额: ¥{userOrderStats[user.id].totalAmount}</p>
          <p>平均金额: ¥{userOrderStats[user.id].averageAmount.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

## 第三部分：useMemo vs 重新计算

### 3.1 性能权衡

```jsx
// 什么时候不需要useMemo
function SimpleCalculation({ a, b }) {
  // 简单计算，不需要useMemo
  const sum = a + b;  // 很快
  const product = a * b;  // 很快
  const isEven = a % 2 === 0;  // 很快
  
  return (
    <div>
      <p>和: {sum}</p>
      <p>积: {product}</p>
      <p>偶数: {isEven ? '是' : '否'}</p>
    </div>
  );
}

// 什么时候需要useMemo
function ComplexCalculation({ data }) {
  // 复杂计算，需要useMemo
  const result = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < 1000; j++) {
        sum += data[i] * Math.sqrt(j);
      }
    }
    return sum;
  }, [data]);
  
  return <div>{result}</div>;
}
```

### 3.2 过度使用useMemo的问题

```jsx
// 不好：过度使用useMemo
function OverUseMemo({ name, age }) {
  // 简单字符串拼接不需要memo
  const greeting = useMemo(() => `Hello, ${name}`, [name]);  // 不必要
  
  // 简单布尔运算不需要memo
  const isAdult = useMemo(() => age >= 18, [age]);  // 不必要
  
  // 简单对象，如果每次渲染都需要新的，也不需要memo
  const style = useMemo(() => ({ color: 'red' }), []);  // 不必要
  
  return (
    <div>
      <p>{greeting}</p>
      <p>{isAdult ? '成年' : '未成年'}</p>
    </div>
  );
}

// 好：合理使用useMemo
function ProperUseMemo({ items }) {
  // 复杂计算才使用memo
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      // 假设这里有复杂的计算
      return sum + expensiveCalculation(item);
    }, 0);
  }, [items]);
  
  return <div>总计: {total}</div>;
}
```

### 3.3 性能测量

```jsx
function PerformanceComparison({ data }) {
  const [withMemo, setWithMemo] = useState(true);
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
  });
  
  // 不使用memo的版本
  const withoutMemoResult = (() => {
    const start = performance.now();
    const result = data.reduce((sum, item) => sum + item, 0);
    const end = performance.now();
    console.log('不使用memo:', end - start, 'ms');
    return result;
  })();
  
  // 使用memo的版本
  const withMemoResult = useMemo(() => {
    const start = performance.now();
    const result = data.reduce((sum, item) => sum + item, 0);
    const end = performance.now();
    console.log('使用memo:', end - start, 'ms');
    return result;
  }, [data]);
  
  return (
    <div>
      <p>渲染次数: {renderCount.current}</p>
      <p>不使用memo: {withoutMemoResult}</p>
      <p>使用memo: {withMemoResult}</p>
    </div>
  );
}
```

## 第四部分：依赖数组详解

### 4.1 正确的依赖数组

```jsx
function CorrectDependencies() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);
  
  // 正确：列出所有使用的值
  const result1 = useMemo(() => {
    return a + b;
  }, [a, b]);  // 正确
  
  // 错误：遗漏依赖
  const result2 = useMemo(() => {
    return a + b;
  }, [a]);  // 错误：缺少b
  
  // 正确：不使用的值不需要列入
  const result3 = useMemo(() => {
    return a + b;
  }, [a, b]);  // 正确：c没有使用，不需要列入
  
  return <div>{result1}</div>;
}
```

### 4.2 对象和数组依赖

```jsx
function ObjectDependencies({ user }) {
  // 错误：user是对象，每次都是新的引用
  const greeting = useMemo(() => {
    return `Hello, ${user.name}`;
  }, [user]);  // user每次都变，memo失效
  
  // 正确：只依赖使用的属性
  const greetingFixed = useMemo(() => {
    return `Hello, ${user.name}`;
  }, [user.name]);  // 只依赖name属性
  
  // 错误：依赖数组中的对象
  const config = { theme: 'dark' };
  const styled = useMemo(() => {
    return { ...config, color: 'red' };
  }, [config]);  // config每次都是新对象
  
  // 正确：使用稳定的值
  const theme = 'dark';
  const styledFixed = useMemo(() => {
    return { theme, color: 'red' };
  }, [theme]);
  
  return <div>{greetingFixed}</div>;
}
```

### 4.3 函数依赖

```jsx
function FunctionDependencies() {
  const [count, setCount] = useState(0);
  
  // 问题：函数每次都是新的
  const logger = () => {
    console.log('Count:', count);
  };
  
  const value = useMemo(() => {
    logger();
    return count * 2;
  }, [logger]);  // logger每次都变
  
  // 解决方案1：使用useCallback
  const loggerMemo = useCallback(() => {
    console.log('Count:', count);
  }, [count]);
  
  const valueMemo = useMemo(() => {
    loggerMemo();
    return count * 2;
  }, [count, loggerMemo]);
  
  // 解决方案2：在memo内部定义函数
  const valueBetter = useMemo(() => {
    const logger = () => {
      console.log('Count:', count);
    };
    logger();
    return count * 2;
  }, [count]);
  
  return <div>{valueBetter}</div>;
}
```

### 4.4 空依赖数组

```jsx
function EmptyDependencies() {
  const [count, setCount] = useState(0);
  
  // 空依赖：只计算一次
  const constantValue = useMemo(() => {
    console.log('只执行一次');
    return Math.random();
  }, []);
  
  // 警告：使用了count但没有列为依赖
  const staleValue = useMemo(() => {
    return count * 2;  // count变化时不会重新计算
  }, []);  // 错误：应该包含count
  
  return (
    <div>
      <p>常量: {constantValue}</p>
      <p>过期值: {staleValue}</p>
      <p>当前count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

## 第五部分：常见错误和陷阱

### 5.1 错误1：依赖项不稳定

```jsx
// 错误示例
function UnstableDependency() {
  const [count, setCount] = useState(0);
  
  // options每次渲染都是新对象
  const options = { multiplier: 2 };
  
  const result = useMemo(() => {
    return count * options.multiplier;
  }, [count, options]);  // options总是变化，memo失效
  
  return <div>{result}</div>;
}

// 正确示例
function StableDependency() {
  const [count, setCount] = useState(0);
  
  // 方案1：使用常量
  const OPTIONS = { multiplier: 2 };
  
  const result1 = useMemo(() => {
    return count * OPTIONS.multiplier;
  }, [count]);
  
  // 方案2：只依赖使用的值
  const multiplier = 2;
  
  const result2 = useMemo(() => {
    return count * multiplier;
  }, [count, multiplier]);
  
  return <div>{result2}</div>;
}
```

### 5.2 错误2：在memo内部修改外部状态

```jsx
// 错误示例
function SideEffectInMemo() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState([]);
  
  const result = useMemo(() => {
    // 错误：在memo中修改状态
    setLog([...log, count]);  // 副作用！
    return count * 2;
  }, [count, log, setLog]);
  
  return <div>{result}</div>;
}

// 正确示例
function NoSideEffectInMemo() {
  const [count, setCount] = useState(0);
  const [log, setLog] = useState([]);
  
  // memo只用于计算
  const result = useMemo(() => {
    return count * 2;
  }, [count]);
  
  // 副作用放在useEffect中
  useEffect(() => {
    setLog(prev => [...prev, count]);
  }, [count]);
  
  return <div>{result}</div>;
}
```

### 5.3 错误3：忘记返回值

```jsx
// 错误示例
function ForgotReturn({ items }) {
  const result = useMemo(() => {
    items.filter(item => item.active);  // 忘记return
  }, [items]);
  
  return <div>{result}</div>;  // result是undefined
}

// 正确示例
function WithReturn({ items }) {
  const result = useMemo(() => {
    return items.filter(item => item.active);  // 记得return
  }, [items]);
  
  // 或使用隐式返回
  const result2 = useMemo(() =>
    items.filter(item => item.active)
  , [items]);
  
  return <div>{result.length}</div>;
}
```

### 5.4 错误4：在条件语句中使用

```jsx
// 错误示例
function ConditionalMemo({ condition, data }) {
  let result;
  
  if (condition) {
    result = useMemo(() => {  // 错误：条件调用Hook
      return data.length;
    }, [data]);
  }
  
  return <div>{result}</div>;
}

// 正确示例
function ProperConditional({ condition, data }) {
  // 总是调用useMemo
  const result = useMemo(() => {
    if (condition) {
      return data.length;
    }
    return 0;
  }, [condition, data]);
  
  return <div>{result}</div>;
}
```

## 第六部分：实战案例

### 6.1 案例1：数据表格

```jsx
function DataTable({ data, sortColumn, sortDirection, filters }) {
  // 过滤数据
  const filteredData = useMemo(() => {
    console.log('执行过滤');
    return data.filter(row => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (!filterValue) return true;
        return String(row[key]).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters]);
  
  // 排序数据
  const sortedData = useMemo(() => {
    console.log('执行排序');
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);
  
  // 分页数据
  const [page, setPage] = useState(0);
  const pageSize = 10;
  
  const paginatedData = useMemo(() => {
    console.log('执行分页');
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, page, pageSize]);
  
  return (
    <div>
      <table>
        <tbody>
          {paginatedData.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div>
        <button onClick={() => setPage(p => Math.max(0, p - 1))}>
          上一页
        </button>
        <span>第 {page + 1} 页</span>
        <button onClick={() => setPage(p => p + 1)}>
          下一页
        </button>
      </div>
    </div>
  );
}
```

### 6.2 案例2：图表数据处理

```jsx
function ChartComponent({ rawData, dateRange, groupBy }) {
  // 过滤日期范围
  const dateFilteredData = useMemo(() => {
    if (!dateRange) return rawData;
    
    return rawData.filter(item => {
      const date = new Date(item.date);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [rawData, dateRange]);
  
  // 分组聚合
  const aggregatedData = useMemo(() => {
    const groups = {};
    
    dateFilteredData.forEach(item => {
      const key = groupBy === 'day'
        ? item.date.substring(0, 10)
        : groupBy === 'month'
        ? item.date.substring(0, 7)
        : item.date.substring(0, 4);
      
      if (!groups[key]) {
        groups[key] = { key, value: 0, count: 0 };
      }
      
      groups[key].value += item.value;
      groups[key].count++;
    });
    
    return Object.values(groups).map(group => ({
      ...group,
      average: group.value / group.count
    }));
  }, [dateFilteredData, groupBy]);
  
  // 计算统计信息
  const statistics = useMemo(() => {
    const values = aggregatedData.map(d => d.value);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((a, b) => a + b, 0) / values.length,
      total: values.reduce((a, b) => a + b, 0)
    };
  }, [aggregatedData]);
  
  return (
    <div>
      <div className="statistics">
        <p>最小值: {statistics.min}</p>
        <p>最大值: {statistics.max}</p>
        <p>平均值: {statistics.average.toFixed(2)}</p>
        <p>总计: {statistics.total}</p>
      </div>
      
      <Chart data={aggregatedData} />
    </div>
  );
}
```

### 6.3 案例3：搜索和高亮

```jsx
function SearchResults({ items, searchTerm }) {
  // 搜索匹配
  const searchResults = useMemo(() => {
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    ).map(item => ({
      ...item,
      score: calculateRelevance(item, term)
    })).sort((a, b) => b.score - a.score);
  }, [items, searchTerm]);
  
  // 高亮文本
  const highlightedResults = useMemo(() => {
    if (!searchTerm) return searchResults;
    
    return searchResults.map(item => ({
      ...item,
      highlightedTitle: highlightText(item.title, searchTerm),
      highlightedDescription: highlightText(item.description, searchTerm)
    }));
  }, [searchResults, searchTerm]);
  
  return (
    <div>
      <p>找到 {highlightedResults.length} 个结果</p>
      {highlightedResults.map(item => (
        <div key={item.id}>
          <h3 dangerouslySetInnerHTML={{ __html: item.highlightedTitle }} />
          <p dangerouslySetInnerHTML={{ __html: item.highlightedDescription }} />
        </div>
      ))}
    </div>
  );
}

function calculateRelevance(item, term) {
  let score = 0;
  if (item.title.toLowerCase().includes(term)) score += 2;
  if (item.description.toLowerCase().includes(term)) score += 1;
  return score;
}

function highlightText(text, searchTerm) {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

## 第七部分：性能优化技巧

### 7.1 组合useMemo和React.memo

```jsx
// 子组件
const ExpensiveChild = React.memo(({ data, config }) => {
  console.log('ExpensiveChild渲染');
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});

// 父组件
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  
  // 使用useMemo缓存数据
  const processedData = useMemo(() => {
    return items.map(item => ({
      ...item,
      processed: true
    }));
  }, [items]);
  
  // 使用useMemo缓存配置对象
  const config = useMemo(() => ({
    theme: 'dark',
    pageSize: 10
  }), []);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      {/* 由于data和config引用稳定，ExpensiveChild不会重新渲染 */}
      <ExpensiveChild data={processedData} config={config} />
    </div>
  );
}
```

### 7.2 避免过度优化

```jsx
// 不好：过度优化
function OverOptimized() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  
  // 简单拼接不需要memo
  const greeting = useMemo(() => `Hello, ${name}`, [name]);
  
  // 简单判断不需要memo
  const isAdult = useMemo(() => age >= 18, [age]);
  
  // 简单计算不需要memo
  const nextAge = useMemo(() => age + 1, [age]);
  
  return <div>{greeting}</div>;
}

// 好：合理优化
function WellOptimized({ items }) {
  // 只对真正昂贵的计算使用memo
  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      // 假设这里有复杂计算
      return sum + complexCalculation(item);
    }, 0);
  }, [items]);
  
  return <div>总计: {total}</div>;
}
```

### 7.3 使用Profiler测量

```jsx
import { Profiler } from 'react';

function ProfiledComponent() {
  const [data, setData] = useState([]);
  
  const expensiveValue = useMemo(() => {
    const start = performance.now();
    const result = data.reduce((sum, item) => sum + item, 0);
    const end = performance.now();
    console.log('计算耗时:', end - start, 'ms');
    return result;
  }, [data]);
  
  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration
  ) => {
    console.log(`${id} ${phase}阶段耗时: ${actualDuration}ms`);
  };
  
  return (
    <Profiler id="ExpensiveComponent" onRender={onRenderCallback}>
      <div>
        <p>结果: {expensiveValue}</p>
      </div>
    </Profiler>
  );
}
```

## 第八部分：React 19增强

### 8.1 React 19编译器自动优化

```jsx
// React 19的编译器可能自动添加memo
function AutoOptimized({ items }) {
  // 编译器会识别这种模式并自动优化
  const filtered = items.filter(item => item.active);
  
  const sorted = filtered.sort((a, b) => a.value - b.value);
  
  // 编译器可能会自动转换为：
  // const filtered = useMemo(() => 
  //   items.filter(item => item.active), 
  //   [items]
  // );
  // const sorted = useMemo(() => 
  //   filtered.sort((a, b) => a.value - b.value),
  //   [filtered]
  // );
  
  return <List items={sorted} />;
}
```

### 8.2 使用use() Hook

```jsx
import { use, useMemo, Suspense } from 'react';

function DataComponent({ dataPromise }) {
  // React 19: use() Hook可以在条件语句中使用
  const data = use(dataPromise);
  
  // 结合useMemo处理数据
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);
  
  return <div>{processedData.length}</div>;
}

// 使用
<Suspense fallback={<div>加载中...</div>}>
  <DataComponent dataPromise={fetchData()} />
</Suspense>
```

## 第九部分：最佳实践

### 9.1 何时使用useMemo

```jsx
// ✅ 使用useMemo的场景：
// 1. 昂贵的计算
const result = useMemo(() => expensiveCalculation(data), [data]);

// 2. 引用相等性很重要（传给React.memo的组件）
const config = useMemo(() => ({ theme: 'dark' }), []);

// 3. 作为其他Hook的依赖
const options = useMemo(() => ({ filter: 'active' }), []);
useEffect(() => {
  fetchData(options);
}, [options]);

// ❌ 不需要使用useMemo的场景：
// 1. 简单计算
const sum = a + b;  // 不需要useMemo

// 2. 组件内的临时变量
const isEven = count % 2 === 0;  // 不需要useMemo

// 3. 每次都需要新值的情况
const timestamp = Date.now();  // 不需要useMemo
```

### 9.2 正确使用依赖数组

```jsx
// ✅ 好的做法
function GoodPractice() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  // 只依赖使用的属性
  const greeting = useMemo(() => {
    return `Hello, ${user.name}`;
  }, [user.name]);  // 只依赖name
  
  return <div>{greeting}</div>;
}

// ❌ 避免
function BadPractice() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  // 依赖整个对象
  const greeting = useMemo(() => {
    return `Hello, ${user.name}`;
  }, [user]);  // user每次都变
  
  return <div>{greeting}</div>;
}
```

### 9.3 避免副作用

```jsx
// ✅ 正确：useMemo只用于计算
function Correct() {
  const value = useMemo(() => {
    return expensiveCalculation();
  }, []);
  
  useEffect(() => {
    // 副作用放在useEffect中
    updateCache(value);
  }, [value]);
  
  return <div>{value}</div>;
}

// ❌ 错误：在useMemo中执行副作用
function Wrong() {
  const value = useMemo(() => {
    const result = expensiveCalculation();
    updateCache(result);  // 副作用！
    return result;
  }, []);
  
  return <div>{value}</div>;
}
```

## 注意事项

### 1. 不要过度使用useMemo

```jsx
// ❌ 过度优化：简单计算不需要useMemo
function OverOptimized({ a, b }) {
  const sum = useMemo(() => a + b, [a, b]); // 不必要
  const doubled = useMemo(() => a * 2, [a]); // 不必要
  
  return <div>{sum} - {doubled}</div>;
}

// ✅ 正确：简单计算直接执行
function Correct({ a, b }) {
  const sum = a + b;
  const doubled = a * 2;
  
  return <div>{sum} - {doubled}</div>;
}

// ✅ 只有复杂计算才使用useMemo
function Correct({ data }) {
  const processedData = useMemo(() => {
    // 复杂的数据处理逻辑
    return data
      .filter(item => item.active)
      .map(item => ({ ...item, computed: heavyComputation(item) }))
      .sort((a, b) => b.priority - a.priority);
  }, [data]);
  
  return <DataList data={processedData} />;
}
```

### 2. useMemo不保证一定缓存

React可能会在某些情况下清除缓存，例如内存压力大时：

```jsx
function Component() {
  const expensiveValue = useMemo(() => {
    console.log('计算中...');
    return heavyComputation();
  }, []);
  
  // React可能会清除缓存，导致重新计算
  // 不要依赖useMemo来保存必须持久化的数据
  
  return <div>{expensiveValue}</div>;
}

// ✅ 如果需要持久化，使用useRef
function ComponentWithRef() {
  const valueRef = useRef();
  
  if (!valueRef.current) {
    valueRef.current = heavyComputation();
  }
  
  return <div>{valueRef.current}</div>;
}
```

### 3. 依赖数组必须完整

```jsx
// ❌ 错误：缺少依赖
function Wrong({ userId, companyId }) {
  const userData = useMemo(() => {
    return fetchUserData(userId, companyId);
  }, [userId]); // 缺少companyId
  
  return <div>{userData.name}</div>;
}

// ✅ 正确：包含所有依赖
function Correct({ userId, companyId }) {
  const userData = useMemo(() => {
    return fetchUserData(userId, companyId);
  }, [userId, companyId]);
  
  return <div>{userData.name}</div>;
}
```

### 4. 避免在useMemo中执行副作用

```jsx
// ❌ 错误：副作用应该在useEffect中
function Wrong({ data }) {
  const processed = useMemo(() => {
    const result = processData(data);
    // 副作用！
    localStorage.setItem('cache', JSON.stringify(result));
    sendAnalytics('data_processed');
    return result;
  }, [data]);
  
  return <div>{processed}</div>;
}

// ✅ 正确：分离计算和副作用
function Correct({ data }) {
  const processed = useMemo(() => {
    return processData(data);
  }, [data]);
  
  useEffect(() => {
    localStorage.setItem('cache', JSON.stringify(processed));
    sendAnalytics('data_processed');
  }, [processed]);
  
  return <div>{processed}</div>;
}
```

### 5. 对象和数组依赖需要特别注意

```jsx
// ❌ 问题：对象每次都是新的
function Parent() {
  const config = { theme: 'dark', lang: 'zh' }; // 每次渲染都是新对象
  
  return <Child config={config} />;
}

function Child({ config }) {
  const settings = useMemo(() => {
    return processConfig(config);
  }, [config]); // config每次都变，useMemo失效
  
  return <div>{settings.display}</div>;
}

// ✅ 解决方案1：提取到组件外
const CONFIG = { theme: 'dark', lang: 'zh' };

function Parent() {
  return <Child config={CONFIG} />;
}

// ✅ 解决方案2：在父组件中useMemo
function Parent() {
  const config = useMemo(() => ({ theme: 'dark', lang: 'zh' }), []);
  return <Child config={config} />;
}

// ✅ 解决方案3：只依赖具体的值
function Child({ config }) {
  const settings = useMemo(() => {
    return processConfig(config);
  }, [config.theme, config.lang]); // 依赖具体属性
  
  return <div>{settings.display}</div>;
}
```

## 常见问题

### Q1: useMemo和useCallback有什么区别？

**A:** 
- `useMemo` 缓存**计算结果**（值）
- `useCallback` 缓存**函数引用**

```jsx
// useMemo返回计算结果
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback返回函数本身
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// useCallback等价于：
const memoizedCallback = useMemo(() => () => doSomething(a, b), [a, b]);
```

### Q2: 什么时候应该使用useMemo？

**A:** 在以下情况下使用useMemo：

1. **计算开销大**：复杂的数据转换、排序、过滤等
2. **引用相等性重要**：作为其他Hook的依赖，或传给React.memo包裹的组件
3. **频繁重新渲染**：父组件频繁更新，但计算依赖很少变化

```jsx
// ✅ 适合使用useMemo的场景
function DataTable({ data, filters }) {
  // 场景1：复杂计算
  const processedData = useMemo(() => {
    return data
      .filter(item => matchesFilters(item, filters))
      .map(item => enrichData(item))
      .sort((a, b) => a.priority - b.priority);
  }, [data, filters]);
  
  // 场景2：作为依赖传递
  const config = useMemo(() => ({ sort: 'asc', limit: 10 }), []);
  
  useEffect(() => {
    fetchData(config);
  }, [config]); // config引用稳定
  
  // 场景3：传给React.memo组件
  return <MemoizedChild data={processedData} />;
}
```

### Q3: useMemo的依赖数组应该包含什么？

**A:** 包含useMemo回调函数中使用的所有**外部变量**：

```jsx
function Component() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const c = 3;
  
  // ✅ 正确：包含所有使用的变量
  const result = useMemo(() => {
    return a + b + c;
  }, [a, b, c]);
  
  // ❌ 错误：缺少依赖
  const wrong = useMemo(() => {
    return a + b + c;
  }, [a]); // 缺少b和c
  
  // ✅ 函数也需要作为依赖
  const multiply = (x, y) => x * y;
  const product = useMemo(() => {
    return multiply(a, b);
  }, [a, b, multiply]);
  
  return <div>{result}</div>;
}
```

### Q4: useMemo可以用来做数据缓存吗？

**A:** 不建议。useMemo是**性能优化工具**，不是**数据缓存方案**。React可能会清除缓存。

```jsx
// ❌ 不可靠的缓存
function Wrong({ userId }) {
  const userData = useMemo(() => {
    return fetchUserData(userId); // React可能清除缓存
  }, [userId]);
  
  return <div>{userData.name}</div>;
}

// ✅ 使用专门的缓存方案
import { useQuery } from 'react-query';

function Correct({ userId }) {
  const { data: userData } = useQuery(['user', userId], () => fetchUserData(userId));
  
  return <div>{userData?.name}</div>;
}

// ✅ 或使用状态管理
function AlsoCorrect({ userId }) {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    fetchUserData(userId).then(setUserData);
  }, [userId]);
  
  return <div>{userData?.name}</div>;
}
```

### Q5: 为什么useMemo有时候好像没起作用？

**A:** 常见原因：

1. **依赖项总是变化**
```jsx
// ❌ 问题：items每次都是新数组
function Parent() {
  return <Child items={[1, 2, 3]} />;
}

function Child({ items }) {
  const sum = useMemo(() => {
    return items.reduce((a, b) => a + b, 0);
  }, [items]); // items每次都不同
}

// ✅ 解决：稳定引用
const ITEMS = [1, 2, 3];
function Parent() {
  return <Child items={ITEMS} />;
}
```

2. **计算本身不昂贵**
```jsx
// useMemo本身也有开销，简单计算反而更慢
const doubled = useMemo(() => count * 2, [count]); // 不必要
```

3. **忘记配合React.memo**
```jsx
// ❌ 子组件没有memo，useMemo无效
const data = useMemo(() => processData(raw), [raw]);
return <Child data={data} />; // Child每次都重新渲染

// ✅ 配合React.memo
const MemoChild = React.memo(Child);
return <MemoChild data={data} />;
```

### Q6: useMemo和计算属性（如Vue的computed）有什么区别？

**A:** 主要区别：

1. **缓存策略**：
   - Vue computed：依赖变化时重新计算
   - useMemo：依赖变化时重新计算，但React可能清除缓存

2. **使用方式**：
   - Vue computed：响应式自动追踪依赖
   - useMemo：手动声明依赖数组

```jsx
// React useMemo
function Component({ data }) {
  const filtered = useMemo(() => {
    return data.filter(item => item.active);
  }, [data]); // 手动声明依赖
  
  return <div>{filtered.length}</div>;
}
```

```js
// Vue computed
export default {
  data() {
    return { data: [] }
  },
  computed: {
    filtered() {
      return this.data.filter(item => item.active);
      // 自动追踪依赖
    }
  }
}
```

### Q7: React 19的编译器会自动添加useMemo吗？

**A:** 是的，React 19编译器（React Compiler）会自动优化：

```jsx
// 你写的代码
function Component({ items }) {
  const filtered = items.filter(item => item.active);
  return <div>{filtered.length}</div>;
}

// 编译器自动转换为类似这样的代码
function Component({ items }) {
  const filtered = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  return <div>{filtered.length}</div>;
}
```

**但是**：
- 编译器还在实验阶段
- 不能处理所有场景
- 明确的性能瓶颈仍需手动优化

## 总结

### 核心要点

1. **useMemo的作用**
   - 缓存计算结果，避免重复计算
   - 保持引用相等性，减少不必要的渲染
   - 是性能优化工具，不是数据缓存方案

2. **使用场景**
   - ✅ 复杂计算：数据转换、排序、过滤、聚合
   - ✅ 引用相等：作为Hook依赖或传给memo组件
   - ✅ 频繁渲染：父组件频繁更新，但依赖很少变
   - ❌ 简单计算：基本算术、字符串拼接
   - ❌ 首次渲染优化：useMemo不能加速首次渲染

3. **性能权衡**
   ```jsx
   // useMemo本身有成本
   - 创建函数闭包
   - 维护依赖数组
   - 比较依赖是否变化
   
   // 只有当计算成本 > useMemo成本时才值得使用
   ```

4. **依赖数组规则**
   - 包含所有外部变量
   - 使用ESLint插件检查
   - 对象/数组依赖需要稳定引用

5. **常见陷阱**
   - 过度优化导致代码复杂
   - 依赖项不稳定导致失效
   - 在useMemo中执行副作用
   - 依赖useMemo做持久化缓存

### 最佳实践清单

```jsx
// ✅ DO - 推荐做法
1. 只优化明确的性能瓶颈
2. 使用Profiler测量优化效果
3. 配合React.memo和useCallback使用
4. 保持依赖数组的稳定性
5. 先写可读的代码，再优化性能

// ❌ DON'T - 避免做法
1. 不要对所有计算都使用useMemo
2. 不要在useMemo中执行副作用
3. 不要依赖useMemo做数据持久化
4. 不要忽略ESLint的依赖警告
5. 不要过早优化
```

### 性能优化金字塔

```
          少数关键性能瓶颈
              (手动优化)
                  ↑
         React.memo + useMemo
           (选择性优化)
                  ↑
          合理的组件设计
         (避免不必要的渲染)
                  ↑
      ===========================
         React 19编译器
          (自动优化)
```

### 学习建议

1. **理论基础**：深入理解React的渲染机制
2. **性能测量**：掌握React DevTools Profiler
3. **实践经验**：在真实项目中应用和调优
4. **持续学习**：关注React 19编译器的发展

### 下一步学习

- 学习 `useCallback` - 函数缓存
- 学习 `React.memo` - 组件缓存
- 掌握性能优化的完整策略
- 了解React 19的自动优化特性

通过本章学习，你已经全面掌握了useMemo的使用。记住：**先写可读的代码，然后根据实际性能问题进行针对性优化**。useMemo是强大的工具，但不是银弹，合理使用才能发挥最大价值！
