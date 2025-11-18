# useTransition过渡更新

## 第一部分：useTransition基础

### 1.1 什么是useTransition

useTransition是React 18引入的Hook，用于标记非紧急的状态更新。它允许你将某些更新标记为"过渡"，这些更新可以被更高优先级的更新打断。

**基本语法：**

```javascript
import { useTransition } from 'react';

function Component() {
  const [isPending, startTransition] = useTransition();
  
  // isPending: 布尔值，表示是否有pending的transition
  // startTransition: 函数，用于标记transition更新
  
  const handleUpdate = () => {
    startTransition(() => {
      // 这里的状态更新是低优先级的
      setState(newValue);
    });
  };
  
  return (
    <div>
      {isPending && <Spinner />}
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
```

### 1.2 为什么需要useTransition

**问题场景：**

```javascript
// 问题：所有更新同等优先级
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleInput = (e) => {
    const value = e.target.value;
    
    // 用户输入 - 应该立即响应
    setQuery(value);
    
    // 搜索结果 - 耗时操作
    setResults(performHeavySearch(value));
    
    // 问题：两个更新同时执行，导致输入框卡顿
  };
  
  return (
    <div>
      <input value={query} onChange={handleInput} />
      <SearchResults results={results} />
    </div>
  );
}
```

**useTransition的解决方案：**

```javascript
// 使用useTransition区分优先级
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleInput = (e) => {
    const value = e.target.value;
    
    // 高优先级：立即更新输入框
    setQuery(value);
    
    // 低优先级：可中断的搜索
    startTransition(() => {
      setResults(performHeavySearch(value));
    });
  };
  
  return (
    <div>
      <input value={query} onChange={handleInput} />
      {isPending && <SearchingIndicator />}
      <SearchResults results={results} />
    </div>
  );
}
```

### 1.3 useTransition的工作原理

```javascript
// useTransition内部机制（简化）
function useTransition() {
  const [isPending, setIsPending] = useState(false);
  
  const startTransition = useCallback((callback) => {
    setIsPending(true);
    
    // 1. 标记为低优先级更新
    scheduleTransitionUpdate(() => {
      callback();
      setIsPending(false);
    });
  }, []);
  
  return [isPending, startTransition];
}

// 调度transition更新
function scheduleTransitionUpdate(callback) {
  const previousPriority = getCurrentPriority();
  
  try {
    // 设置为transition优先级
    setCurrentPriority(TransitionPriority);
    callback();
  } finally {
    // 恢复之前的优先级
    setCurrentPriority(previousPriority);
  }
}
```

## 第二部分：startTransition API

### 2.1 基本用法

```javascript
// 1. 基本transition
function Component() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  
  const updateData = () => {
    startTransition(() => {
      setData(computeExpensiveData());
    });
  };
  
  return (
    <div>
      <button onClick={updateData} disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
      <DataList items={data} />
    </div>
  );
}

// 2. 多个状态更新
function MultiUpdate() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);
  const [list, setList] = useState([]);
  
  const handleUpdate = () => {
    startTransition(() => {
      // 多个更新都是transition
      setCount(c => c + 1);
      setList(generateLargeList());
    });
  };
  
  return (
    <div>
      <button onClick={handleUpdate}>Update</button>
      {isPending && <Loading />}
      <div>Count: {count}</div>
      <List items={list} />
    </div>
  );
}

// 3. 嵌套transition
function NestedTransition() {
  const [isPending, startTransition] = useTransition();
  
  const handleAction = () => {
    startTransition(() => {
      updateState1();
      
      // 嵌套的transition会合并
      startTransition(() => {
        updateState2();
      });
    });
  };
}

// 4. 条件transition
function ConditionalTransition() {
  const [isPending, startTransition] = useTransition();
  const [needsTransition, setNeedsTransition] = useState(false);
  
  const handleUpdate = (value) => {
    if (needsTransition) {
      startTransition(() => {
        setState(value);
      });
    } else {
      setState(value);
    }
  };
}
```

### 2.2 startTransition vs setTimeout

```javascript
// setTimeout的问题
function WithTimeout() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // 问题：固定延迟，不智能
    setTimeout(() => {
      setResults(search(value));
    }, 300);
  };
}

// startTransition的优势
function WithTransition() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // 优势：
    // 1. 智能调度，不是固定延迟
    // 2. 可以被打断
    // 3. 与React调度器集成
    startTransition(() => {
      setResults(search(value));
    });
  };
}

// 对比演示
function Comparison() {
  const [method, setMethod] = useState('transition');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (method === 'setTimeout') {
      setTimeout(() => {
        setResults(search(value));
      }, 300);
    } else {
      startTransition(() => {
        setResults(search(value));
      });
    }
  };
  
  return (
    <div>
      <select value={method} onChange={e => setMethod(e.target.value)}>
        <option value="setTimeout">setTimeout</option>
        <option value="transition">Transition</option>
      </select>
      
      <input value={query} onChange={handleInput} />
      {method === 'transition' && isPending && <Spinner />}
      <Results data={results} />
    </div>
  );
}
```

### 2.3 独立的startTransition

```javascript
// 不使用Hook的startTransition
import { startTransition } from 'react';

// 在事件处理器外使用
function Component() {
  useEffect(() => {
    startTransition(() => {
      // 可以在任何地方使用
      updateState();
    });
  }, []);
}

// 在类组件中使用
class ClassComponent extends React.Component {
  handleClick = () => {
    startTransition(() => {
      this.setState({ data: newData });
    });
  };
  
  render() {
    return <button onClick={this.handleClick}>Update</button>;
  }
}

// 在工具函数中使用
function updateGlobalState(value) {
  startTransition(() => {
    globalStore.setState(value);
  });
}

// 区别：没有isPending状态
// useTransition: 返回isPending状态
// startTransition: 仅执行transition，无状态
```

### 2.4 配置选项

```javascript
// timeoutMs选项（实验性）
function Component() {
  const [isPending, startTransition] = useTransition({
    timeoutMs: 3000
  });
  
  const handleAction = () => {
    startTransition(() => {
      // 如果3秒内未完成，强制提交
      performLongTask();
    });
  };
}

// 自定义超时处理
function CustomTimeout() {
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef(null);
  
  const handleAction = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    startTransition(() => {
      performTask();
    });
    
    // 自定义超时
    timeoutRef.current = setTimeout(() => {
      if (isPending) {
        console.warn('Transition timeout');
      }
    }, 5000);
  };
  
  useEffect(() => {
    if (!isPending && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isPending]);
}
```

## 第三部分：isPending状态

### 3.1 使用isPending

```javascript
// 1. 显示加载状态
function LoadingIndicator() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState([]);
  
  const loadData = () => {
    startTransition(() => {
      setData(fetchData());
    });
  };
  
  return (
    <div>
      <button onClick={loadData} disabled={isPending}>
        Load Data
      </button>
      
      {isPending && <Spinner />}
      
      <div className={isPending ? 'loading' : ''}>
        <DataList items={data} />
      </div>
    </div>
  );
}

// 2. 禁用UI
function DisableUI() {
  const [isPending, startTransition] = useTransition();
  
  return (
    <div>
      <button disabled={isPending}>
        {isPending ? 'Processing...' : 'Submit'}
      </button>
      
      <input disabled={isPending} />
      
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        Content
      </div>
    </div>
  );
}

// 3. 条件渲染
function ConditionalRender() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);
  
  return (
    <div>
      {isPending ? (
        <div>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <Results data={results} />
      )}
    </div>
  );
}

// 4. 动画效果
function AnimatedTransition() {
  const [isPending, startTransition] = useTransition();
  
  return (
    <div className={isPending ? 'fade-out' : 'fade-in'}>
      <Content />
    </div>
  );
}

// CSS
/*
.fade-out {
  opacity: 0.5;
  transition: opacity 0.3s;
}

.fade-in {
  opacity: 1;
  transition: opacity 0.3s;
}
*/
```

### 3.2 多个Transition的isPending

```javascript
// 同时有多个transition
function MultipleTransitions() {
  const [isPending1, startTransition1] = useTransition();
  const [isPending2, startTransition2] = useTransition();
  
  const action1 = () => {
    startTransition1(() => {
      updateState1();
    });
  };
  
  const action2 = () => {
    startTransition2(() => {
      updateState2();
    });
  };
  
  return (
    <div>
      <button onClick={action1} disabled={isPending1}>
        Action 1 {isPending1 && '...'}
      </button>
      
      <button onClick={action2} disabled={isPending2}>
        Action 2 {isPending2 && '...'}
      </button>
    </div>
  );
}

// 全局pending状态
function GlobalPending() {
  const [isPending1, startTransition1] = useTransition();
  const [isPending2, startTransition2] = useTransition();
  
  const isAnyPending = isPending1 || isPending2;
  
  return (
    <div>
      {isAnyPending && <GlobalSpinner />}
      
      <button onClick={() => startTransition1(() => action1())}>
        Action 1
      </button>
      
      <button onClick={() => startTransition2(() => action2())}>
        Action 2
      </button>
    </div>
  );
}
```

### 3.3 isPending的时序

```javascript
// isPending的变化时序
function PendingTiming() {
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    console.log('isPending changed:', isPending);
  }, [isPending]);
  
  const handleAction = () => {
    console.log('Before transition, isPending:', isPending);  // false
    
    startTransition(() => {
      console.log('Inside transition, isPending:', isPending);  // false (还没更新)
      performAction();
    });
    
    console.log('After startTransition, isPending:', isPending);  // false (同步代码中还是false)
    
    // 下一个tick，isPending变为true
    setTimeout(() => {
      console.log('Next tick, isPending:', isPending);  // true
    }, 0);
  };
  
  // 执行顺序：
  // 1. "Before transition, isPending: false"
  // 2. "After startTransition, isPending: false"
  // 3. "isPending changed: true"
  // 4. "Inside transition, isPending: false"
  // 5. "Next tick, isPending: true"
  // 6. "isPending changed: false"
}
```

## 第四部分：实战案例

### 4.1 搜索功能

```javascript
// 完整的搜索实现
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    // 立即更新输入框
    setQuery(value);
    
    // 延迟更新搜索结果
    startTransition(() => {
      if (value.trim() === '') {
        setResults([]);
        return;
      }
      
      // 模拟耗时搜索
      const filtered = largeDataset.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase())
      );
      
      setResults(filtered);
    });
  };
  
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="搜索..."
          className="search-input"
        />
        
        {isPending && (
          <div className="search-spinner">
            <Spinner size="small" />
          </div>
        )}
      </div>
      
      <div className={`results ${isPending ? 'results-pending' : ''}`}>
        {results.length === 0 && query ? (
          <div className="no-results">未找到结果</div>
        ) : (
          <SearchResults items={results} />
        )}
      </div>
    </div>
  );
}

// 高级搜索：带历史记录
function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    setQuery(value);
    
    startTransition(() => {
      const searchResults = performSearch(value);
      setResults(searchResults);
      
      // 更新历史记录
      if (value && searchResults.length > 0) {
        setHistory(prev => {
          const newHistory = [value, ...prev.filter(q => q !== value)];
          return newHistory.slice(0, 10);  // 保留最近10条
        });
      }
    });
  };
  
  const selectFromHistory = (historicalQuery) => {
    handleSearch(historicalQuery);
  };
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      {query === '' && history.length > 0 && (
        <div className="search-history">
          <h3>搜索历史</h3>
          {history.map(q => (
            <div key={q} onClick={() => selectFromHistory(q)}>
              {q}
            </div>
          ))}
        </div>
      )}
      
      {isPending && <Loading />}
      <Results data={results} />
    </div>
  );
}
```

### 4.2 Tab切换

```javascript
// Tab切换优化
function TabContainer() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isPending, startTransition] = useTransition();
  
  const switchTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };
  
  return (
    <div className="tabs">
      <div className="tab-header">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => switchTab('overview')}
        >
          概览
        </TabButton>
        
        <TabButton
          active={activeTab === 'details'}
          onClick={() => switchTab('details')}
        >
          详情
        </TabButton>
        
        <TabButton
          active={activeTab === 'settings'}
          onClick={() => switchTab('settings')}
        >
          设置
        </TabButton>
      </div>
      
      {isPending && <TabLoadingBar />}
      
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'details' && <DetailsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// 带预加载的Tab
function PreloadingTabs() {
  const [activeTab, setActiveTab] = useState('home');
  const [preloadedTabs, setPreloadedTabs] = useState(new Set(['home']));
  const [isPending, startTransition] = useTransition();
  
  const handleTabHover = (tab) => {
    if (!preloadedTabs.has(tab)) {
      startTransition(() => {
        preloadTabData(tab);
        setPreloadedTabs(prev => new Set([...prev, tab]));
      });
    }
  };
  
  const handleTabClick = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };
  
  return (
    <div>
      <Tabs
        active={activeTab}
        onHover={handleTabHover}
        onClick={handleTabClick}
      />
      
      {isPending && <ProgressIndicator />}
      
      <TabContent tab={activeTab} />
    </div>
  );
}
```

### 4.3 数据过滤

```javascript
// 复杂数据过滤
function DataFilter() {
  const [items] = useState(generateLargeDataset(10000));
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: [0, 1000],
    search: ''
  });
  const [filteredItems, setFilteredItems] = useState(items);
  const [isPending, startTransition] = useTransition();
  
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    
    startTransition(() => {
      const filtered = items.filter(item => {
        // 分类过滤
        if (newFilters.category !== 'all' && 
            item.category !== newFilters.category) {
          return false;
        }
        
        // 价格过滤
        if (item.price < newFilters.priceRange[0] || 
            item.price > newFilters.priceRange[1]) {
          return false;
        }
        
        // 搜索过滤
        if (newFilters.search && 
            !item.name.toLowerCase().includes(newFilters.search.toLowerCase())) {
          return false;
        }
        
        return true;
      });
      
      setFilteredItems(filtered);
    });
  };
  
  return (
    <div className="filter-container">
      <div className="filters">
        <select
          value={filters.category}
          onChange={(e) => applyFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="books">图书</option>
        </select>
        
        <PriceRangeSlider
          value={filters.priceRange}
          onChange={(range) => applyFilters({ ...filters, priceRange: range })}
        />
        
        <input
          type="text"
          value={filters.search}
          onChange={(e) => applyFilters({ ...filters, search: e.target.value })}
          placeholder="搜索商品..."
        />
      </div>
      
      {isPending && (
        <div className="filter-loading">
          <Spinner />
          <span>正在过滤 {items.length} 个项目...</span>
        </div>
      )}
      
      <div className={isPending ? 'items-loading' : 'items'}>
        <div className="results-count">
          找到 {filteredItems.length} 个结果
        </div>
        
        <ItemList items={filteredItems} />
      </div>
    </div>
  );
}
```

### 4.4 分页加载

```javascript
// 分页组件
function PaginatedList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 50;
  
  useEffect(() => {
    // 初始加载
    setItems(fetchItems(1, itemsPerPage));
  }, []);
  
  const goToPage = (newPage) => {
    startTransition(() => {
      setPage(newPage);
      const newItems = fetchItems(newPage, itemsPerPage);
      setItems(newItems);
    });
  };
  
  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);
  
  return (
    <div>
      {isPending && <LoadingOverlay />}
      
      <div className={isPending ? 'content-loading' : 'content'}>
        <ItemList items={items} />
      </div>
      
      <div className="pagination">
        <button
          onClick={prevPage}
          disabled={page === 1 || isPending}
        >
          上一页
        </button>
        
        <span>第 {page} 页</span>
        
        <button
          onClick={nextPage}
          disabled={isPending}
        >
          下一页
        </button>
      </div>
    </div>
  );
}

// 无限滚动
function InfiniteScroll() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();
  const observerRef = useRef();
  
  const loadMore = useCallback(() => {
    if (!hasMore || isPending) return;
    
    startTransition(() => {
      const newItems = fetchItems(page + 1);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(p => p + 1);
      }
    });
  }, [page, hasMore, isPending]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [loadMore]);
  
  return (
    <div>
      <ItemList items={items} />
      
      <div ref={observerRef} className="load-more-trigger">
        {isPending && <Spinner />}
        {!hasMore && <div>没有更多了</div>}
      </div>
    </div>
  );
}
```

### 4.5 表单优化

```javascript
// 表单实时验证
function SmartForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (field, value) => {
    // 立即更新表单值
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 延迟验证
    startTransition(() => {
      const fieldErrors = validateField(field, value, formData);
      setErrors(prev => ({ ...prev, [field]: fieldErrors }));
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    startTransition(() => {
      const allErrors = validateForm(formData);
      setErrors(allErrors);
      
      if (Object.keys(allErrors).length === 0) {
        submitForm(formData);
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="用户名"
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="邮箱"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="密码"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

## 第五部分：性能优化

### 5.1 优化Transition边界

```javascript
// ✅ 正确：只包裹耗时操作
function Good() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    setQuery(value);  // 立即执行，不在transition中
    
    startTransition(() => {
      setResults(heavySearch(value));  // 耗时操作
    });
  };
}

// ❌ 错误：包裹了所有更新
function Bad() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    startTransition(() => {
      setQuery(value);  // 不应该在这里
      setResults(heavySearch(value));
    });
  };
}

// 复杂场景的优化
function Optimized() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value) => {
    setSearchQuery(value);  // 立即
    
    startTransition(() => {
      const filtered = items
        .filter(item => item.name.includes(value))
        .filter(item => filterQuery ? item.category === filterQuery : true);
      
      setResults(filtered);
    });
  };
  
  const handleFilter = (value) => {
    setFilterQuery(value);  // 立即
    
    startTransition(() => {
      const filtered = items
        .filter(item => searchQuery ? item.name.includes(searchQuery) : true)
        .filter(item => item.category === value);
      
      setResults(filtered);
    });
  };
}
```

### 5.2 配合useMemo使用

```javascript
// 结合useMemo优化
function OptimizedComponent() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [isPending, startTransition] = useTransition();
  
  // 使用useMemo缓存计算
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    if (category !== 'all') {
      items = items.filter(item => item.category === category);
    }
    
    if (query) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return items;
  }, [query, category]);
  
  const handleSearch = (value) => {
    startTransition(() => {
      setQuery(value);
    });
  };
  
  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      <CategoryFilter value={category} onChange={setCategory} />
      
      {isPending && <Loading />}
      <ItemList items={filteredItems} />
    </div>
  );
}
```

### 5.3 避免过度使用

```javascript
// ❌ 不必要的transition
function Unnecessary() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  const increment = () => {
    // 简单计数不需要transition
    startTransition(() => {
      setCount(c => c + 1);
    });
  };
}

// ✅ 只在必要时使用
function Necessary() {
  const [count, setCount] = useState(0);
  const [heavyData, setHeavyData] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const increment = () => {
    setCount(c => c + 1);  // 简单操作，不用transition
  };
  
  const updateData = () => {
    startTransition(() => {
      setHeavyData(computeHeavyData());  // 耗时操作用transition
    });
  };
}

// 判断是否需要transition
function shouldUseTransition(operation) {
  // 规则：
  // 1. 操作耗时 > 100ms
  // 2. 不是用户直接交互的结果
  // 3. UI可以延迟显示
  
  const estimatedTime = measureOperationTime(operation);
  return estimatedTime > 100;
}
```

## 第六部分：常见模式

### 6.1 乐观更新

```javascript
// 乐观更新模式
function OptimisticUpdate() {
  const [items, setItems] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const addItem = async (newItem) => {
    // 立即显示
    const optimisticItem = { ...newItem, id: Date.now(), pending: true };
    setItems(prev => [...prev, optimisticItem]);
    
    try {
      // 后台保存
      startTransition(async () => {
        const savedItem = await saveItem(newItem);
        
        // 更新为真实数据
        setItems(prev =>
          prev.map(item =>
            item.id === optimisticItem.id ? savedItem : item
          )
        );
      });
    } catch (error) {
      // 失败时回滚
      setItems(prev =>
        prev.filter(item => item.id !== optimisticItem.id)
      );
      
      showError('保存失败');
    }
  };
  
  return (
    <div>
      <ItemList items={items} />
      <AddItemForm onAdd={addItem} />
      {isPending && <SavingIndicator />}
    </div>
  );
}
```

### 6.2 竞态条件处理

```javascript
// 处理竞态条件
function RaceConditionHandling() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  const latestQueryRef = useRef('');
  
  const handleSearch = (value) => {
    setQuery(value);
    latestQueryRef.current = value;
    
    startTransition(async () => {
      const searchResults = await performSearch(value);
      
      // 只使用最新查询的结果
      if (value === latestQueryRef.current) {
        setResults(searchResults);
      }
    });
  };
  
  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      {isPending && <Searching />}
      <Results data={results} />
    </div>
  );
}

// 使用AbortController
function AbortableTransition() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  const controllerRef = useRef(null);
  
  const handleSearch = (value) => {
    setQuery(value);
    
    // 取消之前的请求
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    controllerRef.current = new AbortController();
    
    startTransition(async () => {
      try {
        const results = await fetch(`/api/search?q=${value}`, {
          signal: controllerRef.current.signal
        }).then(r => r.json());
        
        setResults(results);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search error:', error);
        }
      }
    });
  };
  
  useEffect(() => {
    return () => {
      // 清理
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);
}
```

### 6.3 错误处理

```javascript
// Transition中的错误处理
function ErrorHandling() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    setError(null);
    
    startTransition(async () => {
      try {
        const result = await loadData();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    });
  };
  
  if (error) {
    return (
      <div className="error">
        <p>错误: {error}</p>
        <button onClick={fetchData}>重试</button>
      </div>
    );
  }
  
  return (
    <div>
      <button onClick={fetchData} disabled={isPending}>
        {isPending ? '加载中...' : '加载数据'}
      </button>
      
      {data && <DataDisplay data={data} />}
    </div>
  );
}

// 使用ErrorBoundary
function WithErrorBoundary() {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(null);
  
  const loadData = () => {
    startTransition(() => {
      const result = fetchDataThatMightThrow();
      setData(result);
    });
  };
  
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <button onClick={loadData} disabled={isPending}>
        Load
      </button>
      
      {data && <DataDisplay data={data} />}
    </ErrorBoundary>
  );
}
```

## 注意事项

### 1. 使用场景

```
✅ 适合使用transition的场景：
- 搜索/过滤（耗时 > 100ms）
- Tab切换
- 数据可视化更新
- 复杂列表渲染
- 路由导航

❌ 不适合的场景：
- 简单的计数器
- 用户输入反馈
- 表单提交按钮状态
- 关键用户交互
```

### 2. 常见错误

```javascript
// ❌ 在transition中读取最新state
function Wrong() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  const update = () => {
    startTransition(() => {
      // 错误：这里的count可能不是最新的
      setOther(count + 1);
    });
  };
}

// ✅ 正确的做法
function Correct() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  const update = () => {
    const currentCount = count;  // 外面读取
    
    startTransition(() => {
      setOther(currentCount + 1);
    });
  };
}
```

### 3. 性能提示

```javascript
// 监控transition性能
function MonitorPerformance() {
  const [isPending, startTransition] = useTransition();
  const startTimeRef = useRef(null);
  
  useEffect(() => {
    if (isPending) {
      startTimeRef.current = performance.now();
    } else if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      console.log('Transition duration:', duration);
      
      if (duration > 1000) {
        console.warn('Slow transition detected');
      }
    }
  }, [isPending]);
}
```

## 常见问题

### Q1: useTransition和useDeferredValue的区别？

**A:** useTransition主动标记更新为低优先级；useDeferredValue被动延迟值的更新。

### Q2: transition会延迟多久？

**A:** 不固定，由React调度器智能决定，通常在用户感知不到的情况下尽快完成。

### Q3: isPending为true时可以触发新的transition吗？

**A:** 可以，新transition会取消旧的。

### Q4: transition中的错误如何处理？

**A:** 使用try-catch或ErrorBoundary捕获。

### Q5: 所有耗时操作都应该用transition吗？

**A:** 不是，只有非紧急的UI更新才适合。

### Q6: transition和Suspense的关系？

**A:** 可以配合使用，transition可以避免Suspense闪烁。

### Q7: 如何测试使用了transition的组件？

**A:** 使用waitFor等待transition完成。

### Q8: transition会影响SEO吗？

**A:** 不会，SSR时仍然同步渲染。

### Q9: 能否配置transition的优先级？

**A:** 不能直接配置，但可以通过嵌套控制。

### Q10: React 19对useTransition有什么改进？

**A:** 更稳定的API、更好的性能、更准确的isPending。

## 总结

### 核心要点

```
1. useTransition用途
   ✅ 标记非紧急更新
   ✅ 保持UI响应
   ✅ 提供pending状态
   ✅ 可中断渲染

2. 最佳实践
   ✅ 只包裹耗时操作
   ✅ 配合memo优化
   ✅ 处理竞态条件
   ✅ 正确的错误处理

3. 常见场景
   ✅ 搜索/过滤
   ✅ Tab切换
   ✅ 数据可视化
   ✅ 分页/无限滚动
```

### 实践建议

```
1. 判断是否需要transition
2. 优化transition边界
3. 监控性能指标
4. 处理边缘情况
5. 充分测试
```

useTransition是React并发特性的核心，合理使用能显著提升用户体验。

