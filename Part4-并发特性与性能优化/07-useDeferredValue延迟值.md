# useDeferredValue延迟值

## 第一部分：useDeferredValue基础

### 1.1 什么是useDeferredValue

useDeferredValue是React 18引入的Hook，用于延迟更新非关键的UI部分。它接收一个值并返回该值的"延迟"版本，这个延迟版本在紧急更新完成后才会更新。

**基本语法：**

```javascript
import { useDeferredValue } from 'react';

function Component() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);
  
  // input: 立即更新的值
  // deferredInput: 延迟更新的值
  
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <ExpensiveComponent value={deferredInput} />
    </div>
  );
}
```

### 1.2 工作原理

```javascript
// useDeferredValue的内部机制（简化）
function useDeferredValue(value) {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    // 使用低优先级更新延迟值
    startTransition(() => {
      setDeferredValue(value);
    });
  }, [value]);
  
  return deferredValue;
}

// 实际执行流程
// 1. input改变 -> 立即更新
// 2. deferredInput保持旧值 -> UI先响应用户输入
// 3. 在空闲时 -> 更新deferredInput -> 重新渲染ExpensiveComponent
```

### 1.3 为什么需要useDeferredValue

**问题场景：**

```javascript
// 问题：耗时渲染阻塞用户输入
function SearchPage() {
  const [query, setQuery] = useState('');
  
  const handleInput = (e) => {
    setQuery(e.target.value);
  };
  
  return (
    <div>
      <input value={query} onChange={handleInput} />
      {/* 耗时组件直接使用query，导致输入卡顿 */}
      <ExpensiveSearchResults query={query} />
    </div>
  );
}

// ExpensiveSearchResults渲染耗时500ms
// 用户输入时，每次按键都要等待500ms
// 结果：输入框严重卡顿
```

**useDeferredValue的解决方案：**

```javascript
function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const handleInput = (e) => {
    setQuery(e.target.value);
  };
  
  return (
    <div>
      {/* input使用原始值，立即响应 */}
      <input value={query} onChange={handleInput} />
      
      {/* 耗时组件使用延迟值 */}
      <ExpensiveSearchResults query={deferredQuery} />
    </div>
  );
}

// 执行流程：
// 1. 用户输入 'a' -> query立即变为'a' -> input立即显示'a'
// 2. deferredQuery还是'' -> ExpensiveSearchResults暂不更新
// 3. 用户继续输入 'ab' -> query变'ab' -> input显示'ab'
// 4. 等输入停止 -> deferredQuery更新为'ab' -> ExpensiveSearchResults渲染
```

### 1.4 基本使用

```javascript
// 1. 基本延迟
function BasicDefer() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>当前输入: {text}</p>
      <p>延迟显示: {deferredText}</p>
      <HeavyComponent value={deferredText} />
    </div>
  );
}

// 2. 数字值延迟
function NumberDefer() {
  const [count, setCount] = useState(0);
  const deferredCount = useDeferredValue(count);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveChart value={deferredCount} />
    </div>
  );
}

// 3. 对象值延迟
function ObjectDefer() {
  const [filters, setFilters] = useState({ category: 'all', price: 100 });
  const deferredFilters = useDeferredValue(filters);
  
  return (
    <div>
      <FilterControls 
        filters={filters} 
        onChange={setFilters} 
      />
      <ProductList filters={deferredFilters} />
    </div>
  );
}

// 4. 数组值延迟
function ArrayDefer() {
  const [items, setItems] = useState([]);
  const deferredItems = useDeferredValue(items);
  
  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), name: 'New Item' }]);
  };
  
  return (
    <div>
      <button onClick={addItem}>Add Item ({items.length})</button>
      <LargeList items={deferredItems} />
    </div>
  );
}
```

## 第二部分：防抖效果对比

### 2.1 传统防抖

```javascript
// 传统debounce实现
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 使用传统防抖
function TraditionalDebounce() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // 防抖搜索函数
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setResults(performSearch(value));
    }, 300),
    []
  );
  
  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <div>
      <input value={query} onChange={handleInput} />
      <SearchResults results={results} />
    </div>
  );
}

// 传统防抖的问题：
// 1. 固定延迟时间
// 2. 可能在用户停止输入前不显示任何结果
// 3. 不能被更高优先级的更新打断
```

### 2.2 useDeferredValue方式

```javascript
// 使用useDeferredValue
function DeferredValueApproach() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(
    () => performSearch(deferredQuery),
    [deferredQuery]
  );
  
  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
      />
      <SearchResults results={results} />
    </div>
  );
}

// useDeferredValue的优势：
// 1. 智能调度，无固定延迟
// 2. 立即显示旧结果，流畅更新到新结果
// 3. 可以被打断
// 4. 与React调度器深度集成
```

### 2.3 详细对比

```javascript
// 完整对比示例
function DebounceComparison() {
  const [method, setMethod] = useState('deferred');
  const [input, setInput] = useState('');
  
  // 方法1：传统防抖
  const [debouncedInput, setDebouncedInput] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [input]);
  
  // 方法2：useDeferredValue
  const deferredInput = useDeferredValue(input);
  
  const displayValue = method === 'debounce' ? debouncedInput : deferredInput;
  
  return (
    <div>
      <div>
        <label>
          <input
            type="radio"
            value="debounce"
            checked={method === 'debounce'}
            onChange={e => setMethod(e.target.value)}
          />
          传统防抖
        </label>
        
        <label>
          <input
            type="radio"
            value="deferred"
            checked={method === 'deferred'}
            onChange={e => setMethod(e.target.value)}
          />
          useDeferredValue
        </label>
      </div>
      
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="输入搜索..."
      />
      
      <div className="comparison">
        <div>
          <h3>原始值（立即）</h3>
          <p>{input}</p>
        </div>
        
        <div>
          <h3>延迟值</h3>
          <p>{displayValue}</p>
        </div>
      </div>
      
      <HeavyComponent value={displayValue} />
    </div>
  );
}
```

### 2.4 性能对比

```javascript
// 性能测试
function PerformanceComparison() {
  const [input, setInput] = useState('');
  const [metrics, setMetrics] = useState({
    debounce: [],
    deferred: []
  });
  
  // 传统防抖
  const [debouncedInput, setDebouncedInput] = useState('');
  useEffect(() => {
    const start = performance.now();
    const timer = setTimeout(() => {
      setDebouncedInput(input);
      const duration = performance.now() - start;
      setMetrics(m => ({
        ...m,
        debounce: [...m.debounce, duration].slice(-10)
      }));
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);
  
  // useDeferredValue
  const deferredInput = useDeferredValue(input);
  useEffect(() => {
    const start = performance.now();
    const duration = performance.now() - start;
    setMetrics(m => ({
      ...m,
      deferred: [...m.deferred, duration].slice(-10)
    }));
  }, [deferredInput]);
  
  const avgDebounce = metrics.debounce.length > 0
    ? metrics.debounce.reduce((a, b) => a + b, 0) / metrics.debounce.length
    : 0;
    
  const avgDeferred = metrics.deferred.length > 0
    ? metrics.deferred.reduce((a, b) => a + b, 0) / metrics.deferred.length
    : 0;
  
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      
      <div className="metrics">
        <div>
          <h3>传统防抖</h3>
          <p>平均延迟: {avgDebounce.toFixed(2)}ms</p>
          <p>固定等待: 300ms</p>
        </div>
        
        <div>
          <h3>useDeferredValue</h3>
          <p>平均延迟: {avgDeferred.toFixed(2)}ms</p>
          <p>智能调度</p>
        </div>
      </div>
    </div>
  );
}
```

### 2.5 何时使用哪种方式

```javascript
// 选择指南
const chooseApproach = (scenario) => {
  const guidelines = {
    // 使用传统防抖的场景
    useDebounce: [
      '需要精确控制延迟时间',
      'API请求限流',
      '输入验证（如用户名检查）',
      '自动保存功能',
      '窗口resize/scroll事件'
    ],
    
    // 使用useDeferredValue的场景
    useDeferredValue: [
      '优化UI渲染性能',
      '搜索结果显示',
      '实时过滤/排序',
      '数据可视化更新',
      '复杂列表渲染'
    ]
  };
  
  return guidelines;
};

// 场景1：API请求 -> 使用防抖
function APIRequest() {
  const [query, setQuery] = useState('');
  
  const debouncedFetch = useMemo(
    () => debounce((q) => {
      fetch(`/api/search?q=${q}`);
    }, 500),
    []
  );
  
  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetch(value);  // 防抖请求
  };
}

// 场景2：UI渲染 -> 使用useDeferredValue
function UIRendering() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(
    () => filterLocalData(deferredQuery),
    [deferredQuery]
  );
  
  return <ResultsList results={results} />;
}

// 场景3：混合使用
function HybridApproach() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);  // UI延迟
  
  // API请求防抖
  const debouncedAPI = useMemo(
    () => debounce((value) => {
      fetch(`/api/search?q=${value}`);
    }, 500),
    []
  );
  
  useEffect(() => {
    if (deferredInput) {
      debouncedAPI(deferredInput);
    }
  }, [deferredInput, debouncedAPI]);
  
  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <LocalResults query={deferredInput} />
    </div>
  );
}
```

## 第三部分：实战案例

### 3.1 搜索功能

```javascript
// 基础搜索
function SearchComponent() {
  const [searchText, setSearchText] = useState('');
  const deferredSearchText = useDeferredValue(searchText);
  
  const searchResults = useMemo(() => {
    if (!deferredSearchText) return [];
    
    return largeDataset.filter(item =>
      item.title.toLowerCase().includes(deferredSearchText.toLowerCase()) ||
      item.description.toLowerCase().includes(deferredSearchText.toLowerCase())
    );
  }, [deferredSearchText]);
  
  const isStale = searchText !== deferredSearchText;
  
  return (
    <div className="search-container">
      <input
        type="text"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="搜索..."
        className="search-input"
      />
      
      <div className={isStale ? 'results-stale' : 'results'}>
        {searchResults.map(item => (
          <SearchResultItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// 高级搜索：带高亮
function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(() => {
    return searchWithHighlight(data, deferredQuery);
  }, [deferredQuery]);
  
  const isSearching = query !== deferredQuery;
  
  return (
    <div>
      <div className="search-bar">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {isSearching && <SearchingIndicator />}
      </div>
      
      <div className="results">
        {results.map(result => (
          <div key={result.id}>
            <h3 dangerouslySetInnerHTML={{ __html: result.titleHTML }} />
            <p dangerouslySetInnerHTML={{ __html: result.descHTML }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// 搜索工具函数
function searchWithHighlight(data, query) {
  if (!query) return data.map(item => ({
    ...item,
    titleHTML: item.title,
    descHTML: item.description
  }));
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  
  return data
    .filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    )
    .map(item => ({
      ...item,
      titleHTML: item.title.replace(regex, '<mark>$1</mark>'),
      descHTML: item.description.replace(regex, '<mark>$1</mark>')
    }));
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

### 3.2 数据过滤

```javascript
// 复杂过滤器
function DataFilter() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    priceRange: [0, 1000],
    inStock: false
  });
  
  const deferredFilters = useDeferredValue(filters);
  
  const filteredData = useMemo(() => {
    let result = allProducts;
    
    if (deferredFilters.search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(deferredFilters.search.toLowerCase())
      );
    }
    
    if (deferredFilters.category !== 'all') {
      result = result.filter(p => p.category === deferredFilters.category);
    }
    
    result = result.filter(p =>
      p.price >= deferredFilters.priceRange[0] &&
      p.price <= deferredFilters.priceRange[1]
    );
    
    if (deferredFilters.inStock) {
      result = result.filter(p => p.stock > 0);
    }
    
    return result;
  }, [deferredFilters]);
  
  const isFiltering = filters !== deferredFilters;
  
  return (
    <div className="filter-page">
      <aside className="filters">
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="搜索产品..."
        />
        
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
        >
          <option value="all">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="books">图书</option>
        </select>
        
        <PriceRangeSlider
          value={filters.priceRange}
          onChange={range => setFilters(f => ({ ...f, priceRange: range }))}
        />
        
        <label>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked }))}
          />
          仅显示有货
        </label>
      </aside>
      
      <main className="products">
        {isFiltering && <FilteringOverlay />}
        
        <div className="product-count">
          共 {filteredData.length} 个产品
        </div>
        
        <ProductGrid products={filteredData} />
      </main>
    </div>
  );
}
```

### 3.3 实时图表

```javascript
// 实时更新的图表
function LiveChart() {
  const [dataPoints, setDataPoints] = useState([]);
  const [updateInterval, setUpdateInterval] = useState(100);
  const deferredDataPoints = useDeferredValue(dataPoints);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => [
        ...prev.slice(-99),
        {
          time: Date.now(),
          value: Math.random() * 100
        }
      ]);
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);
  
  const isUpdating = dataPoints !== deferredDataPoints;
  
  return (
    <div>
      <div className="controls">
        <label>
          更新频率: {updateInterval}ms
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={updateInterval}
            onChange={e => setUpdateInterval(Number(e.target.value))}
          />
        </label>
        
        {isUpdating && <span className="updating">更新中...</span>}
      </div>
      
      <LineChart data={deferredDataPoints} />
    </div>
  );
}

// 交互式数据可视化
function InteractiveVisualization() {
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [dateRange, setDateRange] = useState({ start: '2024-01', end: '2024-12' });
  const deferredMetric = useDeferredValue(selectedMetric);
  const deferredDateRange = useDeferredValue(dateRange);
  
  const chartData = useMemo(() => {
    return computeChartData(deferredMetric, deferredDateRange);
  }, [deferredMetric, deferredDateRange]);
  
  const isComputing = 
    selectedMetric !== deferredMetric ||
    dateRange !== deferredDateRange;
  
  return (
    <div>
      <div className="viz-controls">
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
        >
          <option value="revenue">收入</option>
          <option value="users">用户数</option>
          <option value="engagement">参与度</option>
        </select>
        
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      
      {isComputing && <ComputingIndicator />}
      
      <Chart data={chartData} />
    </div>
  );
}
```

### 3.4 大列表优化

```javascript
// 大列表渲染优化
function LargeList() {
  const [sortBy, setSortBy] = useState('name');
  const [filterText, setFilterText] = useState('');
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredFilterText = useDeferredValue(filterText);
  
  const processedItems = useMemo(() => {
    let items = [...largeDataset];
    
    // 过滤
    if (deferredFilterText) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(deferredFilterText.toLowerCase())
      );
    }
    
    // 排序
    items.sort((a, b) => {
      if (deferredSortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (deferredSortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (deferredSortBy === 'price') {
        return b.price - a.price;
      }
      return 0;
    });
    
    return items;
  }, [deferredSortBy, deferredFilterText]);
  
  const isProcessing = 
    sortBy !== deferredSortBy ||
    filterText !== deferredFilterText;
  
  return (
    <div className="list-container">
      <div className="list-controls">
        <input
          type="text"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="过滤..."
        />
        
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">按名称</option>
          <option value="date">按日期</option>
          <option value="price">按价格</option>
        </select>
      </div>
      
      {isProcessing && <ProcessingBadge />}
      
      <div className={isProcessing ? 'list-updating' : 'list'}>
        {processedItems.map(item => (
          <ListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

// 虚拟滚动 + useDeferredValue
function VirtualizedList() {
  const [filterQuery, setFilterQuery] = useState('');
  const deferredQuery = useDeferredValue(filterQuery);
  
  const filteredItems = useMemo(() => {
    if (!deferredQuery) return allItems;
    return allItems.filter(item =>
      item.content.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery]);
  
  return (
    <div>
      <input
        value={filterQuery}
        onChange={e => setFilterQuery(e.target.value)}
      />
      
      <VirtualList
        items={filteredItems}
        height={600}
        itemHeight={50}
        renderItem={(item) => <ListItem item={item} />}
      />
    </div>
  );
}
```

### 3.5 Tab切换

```javascript
// Tab内容延迟加载
function TabsWithDeferred() {
  const [activeTab, setActiveTab] = useState('overview');
  const deferredActiveTab = useDeferredValue(activeTab);
  
  const tabContent = useMemo(() => {
    switch (deferredActiveTab) {
      case 'overview':
        return <OverviewContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return null;
    }
  }, [deferredActiveTab]);
  
  const isLoading = activeTab !== deferredActiveTab;
  
  return (
    <div className="tabs">
      <div className="tab-buttons">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          概览
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          分析
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          设置
        </button>
      </div>
      
      {isLoading && <TabLoadingBar />}
      
      <div className="tab-content">
        {tabContent}
      </div>
    </div>
  );
}
```

### 3.6 表单自动保存

```javascript
// 表单自动保存优化
function AutoSaveForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: []
  });
  
  const deferredFormData = useDeferredValue(formData);
  
  // 延迟保存
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveToLocalStorage(deferredFormData);
    }, 500);
    
    return () => clearTimeout(saveTimer);
  }, [deferredFormData]);
  
  const isSaving = formData !== deferredFormData;
  
  return (
    <form className="auto-save-form">
      <div className="save-status">
        {isSaving ? '保存中...' : '已保存'}
      </div>
      
      <input
        type="text"
        value={formData.title}
        onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
        placeholder="标题"
      />
      
      <textarea
        value={formData.content}
        onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
        placeholder="内容"
        rows={10}
      />
      
      <TagInput
        value={formData.tags}
        onChange={tags => setFormData(f => ({ ...f, tags }))}
      />
    </form>
  );
}
```

## 第四部分：高级技巧

### 4.1 配合Suspense使用

```javascript
// useDeferredValue + Suspense
function DeferredWithSuspense() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </div>
  );
}

// SearchResults组件
function SearchResults({ query }) {
  // 使用Suspense数据获取
  const results = use(fetchSearchResults(query));
  
  return (
    <div className="results">
      {results.map(result => (
        <ResultCard key={result.id} data={result} />
      ))}
    </div>
  );
}
```

### 4.2 多个延迟值

```javascript
// 管理多个延迟值
function MultipleDeferred() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  const deferredSearch = useDeferredValue(search);
  const deferredCategory = useDeferredValue(category);
  const deferredPriceRange = useDeferredValue(priceRange);
  
  const results = useMemo(() => {
    return filterProducts({
      search: deferredSearch,
      category: deferredCategory,
      priceRange: deferredPriceRange
    });
  }, [deferredSearch, deferredCategory, deferredPriceRange]);
  
  const isAnyStale =
    search !== deferredSearch ||
    category !== deferredCategory ||
    priceRange !== deferredPriceRange;
  
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <CategorySelect value={category} onChange={setCategory} />
      <PriceSlider value={priceRange} onChange={setPriceRange} />
      
      {isAnyStale && <Updating />}
      <Results data={results} />
    </div>
  );
}
```

### 4.3 条件延迟

```javascript
// 条件性使用延迟值
function ConditionalDeferred() {
  const [value, setValue] = useState('');
  const [shouldDefer, setShouldDefer] = useState(true);
  
  // 条件性延迟
  const deferredValue = useDeferredValue(value);
  const displayValue = shouldDefer ? deferredValue : value;
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={shouldDefer}
          onChange={e => setShouldDefer(e.target.checked)}
        />
        启用延迟渲染
      </label>
      
      <input value={value} onChange={e => setValue(e.target.value)} />
      
      <HeavyComponent value={displayValue} />
    </div>
  );
}

// 根据数据量决定是否延迟
function SmartDeferred() {
  const [items, setItems] = useState([]);
  
  // 只有数据量大时才延迟
  const shouldDefer = items.length > 1000;
  const deferredItems = useDeferredValue(items);
  const displayItems = shouldDefer ? deferredItems : items;
  
  return (
    <div>
      <AddItemButton onClick={newItem => setItems(i => [...i, newItem])} />
      
      {shouldDefer && items !== deferredItems && <Updating />}
      
      <ItemList items={displayItems} />
    </div>
  );
}
```

### 4.4 性能监控

```javascript
// 监控延迟性能
function MonitoredDeferred() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value);
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    if (value !== deferredValue) {
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        setMetrics(m => [...m.slice(-19), duration]);
        
        if (duration > 100) {
          console.warn('Slow deferred update:', duration);
        }
      };
    }
  }, [value, deferredValue]);
  
  const avgDelay = metrics.length > 0
    ? metrics.reduce((a, b) => a + b, 0) / metrics.length
    : 0;
  
  return (
    <div>
      <div>平均延迟: {avgDelay.toFixed(2)}ms</div>
      
      <input value={value} onChange={e => setValue(e.target.value)} />
      
      <HeavyComponent value={deferredValue} />
    </div>
  );
}
```

## 第五部分：常见模式

### 5.1 搜索建议

```javascript
// 搜索建议（不卡顿）
function SearchSuggestions() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);
  
  const suggestions = useMemo(() => {
    if (!deferredInput) return [];
    
    return allSuggestions
      .filter(s => s.toLowerCase().startsWith(deferredInput.toLowerCase()))
      .slice(0, 10);
  }, [deferredInput]);
  
  return (
    <div className="search-box">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="搜索..."
      />
      
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map(suggestion => (
            <li key={suggestion} onClick={() => setInput(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5.2 实时预览

```javascript
// Markdown实时预览
function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('');
  const deferredMarkdown = useDeferredValue(markdown);
  
  const html = useMemo(() => {
    return renderMarkdown(deferredMarkdown);
  }, [deferredMarkdown]);
  
  const isRendering = markdown !== deferredMarkdown;
  
  return (
    <div className="editor-container">
      <div className="editor-pane">
        <textarea
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          placeholder="输入Markdown..."
        />
      </div>
      
      <div className="preview-pane">
        {isRendering && <RenderingIndicator />}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
```

### 5.3 拖拽排序

```javascript
// 拖拽排序优化
function DraggableSortList() {
  const [items, setItems] = useState(initialItems);
  const deferredItems = useDeferredValue(items);
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    
    setItems(newItems);
  };
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {deferredItems.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ListItem item={item} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

## 注意事项

### 1. 使用限制

```javascript
// ❌ 不要延迟关键交互
function Bad() {
  const [isOpen, setIsOpen] = useState(false);
  const deferredIsOpen = useDeferredValue(isOpen);  // 错误！
  
  return (
    <Modal isOpen={deferredIsOpen}>  {/* 模态框会延迟打开 */}
      Content
    </Modal>
  );
}

// ✅ 只延迟非关键部分
function Good() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const deferredContent = useDeferredValue(content);
  
  return (
    <Modal isOpen={isOpen}>  {/* 立即打开 */}
      <HeavyContent data={deferredContent} />  {/* 内容延迟 */}
    </Modal>
  );
}
```

### 2. 值比较

```javascript
// 对象引用问题
function ReferenceIssue() {
  const [filters, setFilters] = useState({ search: '' });
  const deferredFilters = useDeferredValue(filters);
  
  // 问题：每次都是新对象，总是不相等
  useEffect(() => {
    console.log('Filters changed');
  }, [deferredFilters]);  // 频繁触发
}

// 解决方案1：使用基本类型
function Solution1() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  
  useEffect(() => {
    console.log('Search changed');
  }, [deferredSearch]);  // 正确比较
}

// 解决方案2：使用useMemo稳定引用
function Solution2() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  const filters = useMemo(
    () => ({ search, category }),
    [search, category]
  );
  
  const deferredFilters = useDeferredValue(filters);
}
```

### 3. 性能考虑

```javascript
// 避免过度延迟
function OverDeferred() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  
  const deferredA = useDeferredValue(a);
  const deferredB = useDeferredValue(b);
  const deferredC = useDeferredValue(c);
  
  // 问题：三层延迟，过度复杂
  const result = useMemo(() => {
    return compute(deferredA, deferredB, deferredC);
  }, [deferredA, deferredB, deferredC]);
}

// 优化：合并延迟
function Optimized() {
  const [state, setState] = useState({ a: '', b: '', c: '' });
  const deferredState = useDeferredValue(state);
  
  const result = useMemo(() => {
    return compute(deferredState.a, deferredState.b, deferredState.c);
  }, [deferredState]);
}
```

## 常见问题

### Q1: useDeferredValue和useTransition的区别？

**A:** useDeferredValue是被动延迟值；useTransition是主动标记更新。前者适合外部props，后者适合内部state。

### Q2: 延迟值何时更新？

**A:** 在所有紧急更新完成后，React空闲时更新。

### Q3: 可以延迟函数吗？

**A:** 不推荐，因为函数引用变化会导致频繁"延迟"。

### Q4: 如何检测值是否stale？

**A:** 比较原始值和延迟值：`const isStale = value !== deferredValue`

### Q5: 能否取消延迟更新？

**A:** 不能直接取消，但可以触发新的更新覆盖。

### Q6: 对SEO有影响吗？

**A:** 无影响，SSR时会同步渲染最终状态。

### Q7: 是否需要清理？

**A:** 不需要，React自动管理。

### Q8: 可以嵌套使用吗？

**A:** 可以，但通常不必要且可能降低性能。

### Q9: 与setTimeout的区别？

**A:** useDeferredValue由React调度，更智能；setTimeout是固定延迟。

### Q10: 如何测试？

**A:** 使用waitFor等待延迟值更新，或使用act包裹。

## 总结

### 核心概念

```
1. useDeferredValue用途
   ✅ 延迟非关键UI更新
   ✅ 保持输入响应性
   ✅ 优化渲染性能
   ✅ 智能调度更新

2. 适用场景
   ✅ 搜索/过滤
   ✅ 实时预览
   ✅ 图表更新
   ✅ 大列表渲染

3. 与防抖对比
   ✅ 智能调度 vs 固定延迟
   ✅ 可中断 vs 不可中断
   ✅ React集成 vs 独立工具
   ✅ UI优化 vs 逻辑控制
```

### 最佳实践

```
1. 选择合适的延迟对象
   ✅ 延迟耗时渲染的值
   ✅ 不延迟关键交互
   ✅ 优先使用基本类型
   ✅ 稳定对象引用

2. 性能优化
   ✅ 配合useMemo使用
   ✅ 避免过度延迟
   ✅ 监控延迟时长
   ✅ 提供视觉反馈

3. 用户体验
   ✅ 显示stale状态
   ✅ 保持交互响应
   ✅ 平滑过渡动画
   ✅ 合理的加载提示
```

useDeferredValue是React并发模式的重要组成部分，正确使用能显著提升应用的响应性和用户体验。

