# useDeferredValue改进

## 学习目标

通过本章学习，你将掌握：

- React 19中useDeferredValue的改进
- 初始值参数
- 与React 18的对比
- 实际应用场景
- 性能优化技巧
- 与其他Hook配合
- 最佳实践
- 常见问题解决

## 第一部分：React 18的useDeferredValue

### 1.1 基础用法

```jsx
// React 18的useDeferredValue
import { useState, useDeferredValue } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      <Results query={deferredQuery} />
    </div>
  );
}

function Results({ query }) {
  // 使用deferredQuery进行搜索
  // 当query快速变化时，这个组件不会立即更新
  const results = searchData(query);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### 1.2 初始渲染问题

```jsx
// ❌ React 18：初始渲染时没有值
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  console.log('query:', query);
  console.log('deferredQuery:', deferredQuery);
  
  // 首次渲染：
  // query: ''
  // deferredQuery: ''
  
  // 问题：初始状态下，deferredQuery没有特殊处理
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Results query={deferredQuery} />
    </div>
  );
}
```

### 1.3 加载状态处理

```jsx
// ❌ React 18：需要手动处理加载状态
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // 手动检测是否正在defer
  const isPending = query !== deferredQuery;
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <Results query={deferredQuery} />
      </div>
      
      {isPending && <div>加载中...</div>}
    </div>
  );
}
```

## 第二部分：React 19的改进

### 2.1 初始值参数

```jsx
// ✅ React 19：可以指定初始值
import { useState, useDeferredValue } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  
  // 第二个参数是初始值
  const deferredQuery = useDeferredValue(query, '');
  
  console.log('首次渲染：');
  console.log('query:', query);
  console.log('deferredQuery:', deferredQuery);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      <Results query={deferredQuery} />
    </div>
  );
}
```

### 2.2 默认值的作用

```jsx
// ✅ 使用有意义的默认值
function ProductFilter() {
  const [category, setCategory] = useState('all');
  
  // 提供默认值'all'
  const deferredCategory = useDeferredValue(category, 'all');
  
  return (
    <div>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">全部</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
      </select>
      
      <ProductList category={deferredCategory} />
    </div>
  );
}

function ProductList({ category }) {
  const products = getProductsByCategory(category);
  
  // 首次渲染时，category已经是'all'，而不是undefined
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 2.3 避免初始闪烁

```jsx
// ✅ 防止初始加载状态闪烁
function DataTable() {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter, '');
  
  const isPending = filter !== deferredFilter;
  
  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="过滤数据..."
      />
      
      {/* 不会在首次渲染时显示加载状态 */}
      {isPending && <div>更新中...</div>}
      
      <Table filter={deferredFilter} />
    </div>
  );
}
```

## 第三部分：实际应用场景

### 3.1 搜索功能

```jsx
// ✅ 优化的搜索体验
function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm, '');
  
  const isPending = searchTerm !== deferredSearchTerm;
  
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索文章、用户、标签..."
        />
        {isPending && <Spinner className="input-spinner" />}
      </div>
      
      <div className={isPending ? 'results-pending' : ''}>
        <SearchResults query={deferredSearchTerm} />
      </div>
    </div>
  );
}

function SearchResults({ query }) {
  if (!query) {
    return <div className="empty-state">输入关键词开始搜索</div>;
  }
  
  const results = performSearch(query);
  
  return (
    <div className="results">
      {results.map(result => (
        <ResultCard key={result.id} result={result} />
      ))}
    </div>
  );
}
```

### 3.2 数据筛选

```jsx
// ✅ 大数据量筛选
function DataGrid() {
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    rating: 'all'
  });
  
  // 对每个filter使用deferredValue
  const deferredFilters = {
    category: useDeferredValue(filters.category, 'all'),
    priceRange: useDeferredValue(filters.priceRange, 'all'),
    rating: useDeferredValue(filters.rating, 'all')
  };
  
  const isPending = JSON.stringify(filters) !== JSON.stringify(deferredFilters);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div>
      <div className="filters">
        <FilterSelect
          label="分类"
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
          options={categoryOptions}
        />
        
        <FilterSelect
          label="价格"
          value={filters.priceRange}
          onChange={(value) => handleFilterChange('priceRange', value)}
          options={priceOptions}
        />
        
        <FilterSelect
          label="评分"
          value={filters.rating}
          onChange={(value) => handleFilterChange('rating', value)}
          options={ratingOptions}
        />
      </div>
      
      <div className={isPending ? 'grid-loading' : ''}>
        <ProductGrid filters={deferredFilters} />
      </div>
    </div>
  );
}
```

### 3.3 实时预览

```jsx
// ✅ Markdown编辑器实时预览
function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello\n\nStart typing...');
  const deferredMarkdown = useDeferredValue(markdown, '');
  
  const isPending = markdown !== deferredMarkdown;
  
  return (
    <div className="editor-container">
      <div className="editor-pane">
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="输入Markdown..."
        />
      </div>
      
      <div className="preview-pane">
        <div className="preview-header">
          预览
          {isPending && <span className="badge">更新中...</span>}
        </div>
        <div className={isPending ? 'preview-updating' : ''}>
          <MarkdownPreview content={deferredMarkdown} />
        </div>
      </div>
    </div>
  );
}

function MarkdownPreview({ content }) {
  // 渲染Markdown可能很慢
  const html = renderMarkdown(content);
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

## 第四部分：性能优化

### 4.1 与memo配合

```jsx
// ✅ 结合React.memo优化
import { memo } from 'react';

const ExpensiveList = memo(function ExpensiveList({ items }) {
  console.log('ExpensiveList渲染');
  
  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  );
});

function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');
  
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery]);
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveList items={filteredItems} />
    </div>
  );
}
```

### 4.2 与Suspense配合

```jsx
// ✅ 与Suspense配合使用
import { Suspense } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </div>
  );
}
```

### 4.3 与startTransition配合

```jsx
// ✅ 组合使用
import { useState, useDeferredValue, startTransition } from 'react';

function TabsWithSearch() {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  
  const deferredQuery = useDeferredValue(query, '');
  
  const handleTabChange = (newTab) => {
    startTransition(() => {
      setTab(newTab);
    });
  };
  
  return (
    <div>
      <Tabs activeTab={tab} onChange={handleTabChange} />
      
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      <Results tab={tab} query={deferredQuery} />
    </div>
  );
}
```

## 第五部分：与React 18对比

### 5.1 API对比

```jsx
// React 18
const deferred = useDeferredValue(value);

// React 19
const deferred = useDeferredValue(value, initialValue);
```

### 5.2 行为对比

```jsx
// React 18
function Component() {
  const [state, setState] = useState('hello');
  const deferred = useDeferredValue(state);
  
  // 首次渲染：state === deferred === 'hello'
  // 没有特殊的初始值处理
}

// React 19
function Component() {
  const [state, setState] = useState('hello');
  const deferred = useDeferredValue(state, 'default');
  
  // 首次渲染：可以指定初始值
  // 更灵活的控制
}
```

### 5.3 迁移指南

```jsx
// 检查是否需要迁移
function SearchComponent() {
  const [query, setQuery] = useState('');
  
  // React 18
  const deferredQuery = useDeferredValue(query);
  
  // React 19（可选）
  // 如果需要特殊的初始值
  const deferredQuery = useDeferredValue(query, '');
  
  // 如果不需要初始值，旧代码仍然有效
  return <Results query={deferredQuery} />;
}
```

## 第六部分：高级应用场景

### 6.1 复杂表单验证

```jsx
// ✅ 实时表单验证with防抖效果
function FormWithValidation() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // 使用deferred value延迟验证
  const deferredFormData = {
    username: useDeferredValue(formData.username, ''),
    email: useDeferredValue(formData.email, ''),
    password: useDeferredValue(formData.password, '')
  };
  
  const isPending = JSON.stringify(formData) !== JSON.stringify(deferredFormData);
  
  // 验证逻辑only在deferred value变化时执行
  const validationErrors = useMemo(() => {
    return validateForm(deferredFormData);
  }, [deferredFormData]);
  
  return (
    <form>
      <div>
        <input
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="用户名"
        />
        {!isPending && validationErrors.username && (
          <span className="error">{validationErrors.username}</span>
        )}
      </div>
      
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="邮箱"
        />
        {!isPending && validationErrors.email && (
          <span className="error">{validationErrors.email}</span>
        )}
      </div>
      
      <div>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          placeholder="密码"
        />
        {!isPending && validationErrors.password && (
          <span className="error">{validationErrors.password}</span>
        )}
        {isPending && <span className="validating">验证中...</span>}
      </div>
    </form>
  );
}
```

### 6.2 图表实时更新

```jsx
// ✅ 延迟图表数据更新
import { LineChart, Line, XAxis, YAxis } from 'recharts';

function RealTimeChart() {
  const [dataPoints, setDataPoints] = useState([]);
  const deferredData = useDeferredValue(dataPoints, []);
  
  const isPending = dataPoints.length !== deferredData.length;
  
  // 模拟实时数据流
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => [
        ...prev,
        { timestamp: Date.now(), value: Math.random() * 100 }
      ].slice(-50)); // 只保留最近50个点
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <div className="chart-header">
        实时数据
        {isPending && <span className="badge">更新中...</span>}
      </div>
      <LineChart width={600} height={300} data={deferredData}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
```

### 6.3 虚拟列表优化

```jsx
// ✅ 虚拟列表with延迟滚动
import { FixedSizeList } from 'react-window';

function VirtualizedList() {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter, '');
  
  const allItems = useMemo(() => {
    // 假设有10000个项目
    return Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`
    }));
  }, []);
  
  const filteredItems = useMemo(() => {
    if (!deferredFilter) return allItems;
    
    return allItems.filter(item =>
      item.name.toLowerCase().includes(deferredFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [deferredFilter, allItems]);
  
  const isPending = filter !== deferredFilter;
  
  const Row = ({ index, style }) => {
    const item = filteredItems[index];
    return (
      <div style={style} className="list-item">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    );
  };
  
  return (
    <div>
      <div className="filter-bar">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="过滤10000个项目..."
        />
        {isPending && <span className="loading">过滤中...</span>}
      </div>
      
      <div className="results-info">
        找到 {filteredItems.length} 个结果
      </div>
      
      <FixedSizeList
        height={600}
        itemCount={filteredItems.length}
        itemSize={80}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

### 6.4 代码编辑器语法高亮

```jsx
// ✅ 延迟语法高亮
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

function CodeEditor() {
  const [code, setCode] = useState('const hello = "world";');
  const deferredCode = useDeferredValue(code, '');
  
  const highlightedCode = useMemo(() => {
    // 语法高亮是昂贵的操作
    return Prism.highlight(deferredCode, Prism.languages.javascript, 'javascript');
  }, [deferredCode]);
  
  const isPending = code !== deferredCode;
  
  return (
    <div className="code-editor">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="code-input"
        spellCheck={false}
      />
      
      <div className="code-preview">
        <div className="preview-header">
          预览
          {isPending && <span className="badge">高亮中...</span>}
        </div>
        <pre className={isPending ? 'preview-updating' : ''}>
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
}
```

### 6.5 实时协作编辑

```jsx
// ✅ 多人协作编辑with冲突解决
function CollaborativeEditor() {
  const [localContent, setLocalContent] = useState('');
  const [remoteContent, setRemoteContent] = useState('');
  
  // 延迟本地内容的同步，减少网络请求
  const deferredLocalContent = useDeferredValue(localContent, '');
  
  const isSyncing = localContent !== deferredLocalContent;
  
  // 同步到服务器
  useEffect(() => {
    if (deferredLocalContent) {
      syncToServer(deferredLocalContent);
    }
  }, [deferredLocalContent]);
  
  // 接收远程更新
  useEffect(() => {
    const ws = new WebSocket('ws://example.com/collab');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setRemoteContent(update.content);
      
      // 合并远程更新（简化版）
      if (!isSyncing) {
        setLocalContent(update.content);
      }
    };
    
    return () => ws.close();
  }, [isSyncing]);
  
  return (
    <div className="collaborative-editor">
      <div className="editor-header">
        协作编辑器
        {isSyncing && <span className="badge">同步中...</span>}
      </div>
      
      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        placeholder="开始输入..."
      />
      
      <div className="collaborators">
        <div className="collaborator">用户A 正在编辑</div>
        <div className="collaborator">用户B 正在查看</div>
      </div>
    </div>
  );
}
```

### 6.6 地图搜索与标记

```jsx
// ✅ 地图搜索with延迟标记更新
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery, '');
  
  const markers = useMemo(() => {
    // 搜索和过滤标记点（可能很多）
    return searchLocations(deferredQuery);
  }, [deferredQuery]);
  
  const isSearching = searchQuery !== deferredQuery;
  
  return (
    <div className="map-search">
      <div className="search-bar">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索位置..."
        />
        {isSearching && <span className="searching">搜索中...</span>}
        <span className="results-count">
          找到 {markers.length} 个位置
        </span>
      </div>
      
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>{marker.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
```

## 第七部分：TypeScript支持

### 7.1 基本类型定义

```tsx
// ✅ TypeScript中的useDeferredValue
import { useState, useDeferredValue } from 'react';

function TypedComponent() {
  const [query, setQuery] = useState<string>('');
  
  // TypeScript会推断deferredQuery的类型为string
  const deferredQuery = useDeferredValue(query, '');
  
  return <Results query={deferredQuery} />;
}

// 复杂类型
interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
}

function ComplexTypedComponent() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    priceRange: [0, 1000]
  });
  
  // 初始值类型必须匹配
  const deferredFilters = useDeferredValue<SearchFilters>(filters, {
    query: '',
    category: 'all',
    priceRange: [0, 1000]
  });
  
  return <Products filters={deferredFilters} />;
}
```

### 7.2 泛型Hook

```tsx
// ✅ 创建泛型useDeferredValue wrapper
function useDeferredState<T>(initialValue: T): [T, T, (value: T) => void, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const deferredState = useDeferredValue(state, initialValue);
  const isPending = state !== deferredState;
  
  return [state, deferredState, setState, isPending];
}

// 使用
function SearchComponent() {
  const [query, deferredQuery, setQuery, isPending] = useDeferredState('');
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {isPending && <Spinner />}
      <Results query={deferredQuery} />
    </div>
  );
}
```

### 7.3 类型安全的初始值

```tsx
// ✅ 确保初始值类型安全
interface User {
  id: number;
  name: string;
  email: string;
}

function UserSearch() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // TypeScript会检查初始值类型
  const deferredUser = useDeferredValue<User | null>(selectedUser, null);
  
  return (
    <div>
      <UserPicker onSelect={setSelectedUser} />
      {deferredUser && <UserProfile user={deferredUser} />}
    </div>
  );
}
```

## 注意事项

### 1. 初始值类型要匹配

```jsx
// ✅ 类型匹配
const [count, setCount] = useState(0);
const deferredCount = useDeferredValue(count, 0);

// ❌ 类型不匹配
const [count, setCount] = useState(0);
const deferredCount = useDeferredValue(count, '0');  // 错误！

// ✅ 复杂类型也要匹配
const [obj, setObj] = useState({ name: 'Alice', age: 30 });
const deferredObj = useDeferredValue(obj, { name: '', age: 0 });

// ❌ 结构不匹配
const deferredObj = useDeferredValue(obj, null);  // 可能引起错误
```

### 2. 不要过度使用

```jsx
// ❌ 不必要的defer
function SimpleComponent() {
  const [name, setName] = useState('');
  const deferredName = useDeferredValue(name, '');
  
  // 如果渲染不复杂，不需要defer
  return <div>{deferredName}</div>;
}

// ✅ 只在渲染开销大时使用
function ExpensiveComponent() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');
  
  // 复杂的列表渲染
  return <HugeList query={deferredQuery} />;
}

// ✅ 判断是否需要defer的标准
// 1. 渲染时间超过50ms
// 2. 有明显的UI卡顿
// 3. 用户输入时感到延迟
```

### 3. 注意初始值的选择

```jsx
// ✅ 合理的初始值
const deferredValue = useDeferredValue(value, defaultValue);

// ❌ 无意义的初始值
const deferredValue = useDeferredValue(value, null);  // 可能引起错误

// ✅ 根据场景选择初始值
// 搜索：空字符串
const deferredQuery = useDeferredValue(query, '');

// 列表过滤：空数组
const deferredFilters = useDeferredValue(filters, []);

// 用户选择：null或undefined
const deferredUser = useDeferredValue(user, null);

// 数值范围：最小值或0
const deferredValue = useDeferredValue(value, 0);
```

### 4. 注意pending状态的使用

```jsx
// ✅ 正确使用pending状态
function Component() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value, '');
  const isPending = value !== deferredValue;
  
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      
      {/* ✅ 显示pending状态 */}
      {isPending && <LoadingIndicator />}
      
      {/* ✅ 降低透明度 */}
      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        <Results data={deferredValue} />
      </div>
    </div>
  );
}

// ❌ 不要阻止用户输入
function BadComponent() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value, '');
  const isPending = value !== deferredValue;
  
  return (
    <div>
      {/* ❌ 错误：禁用输入会影响用户体验 */}
      <input 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        disabled={isPending}  // 不要这样做！
      />
    </div>
  );
}
```

### 5. 与Server Components配合

```jsx
// ✅ 在Client Component中使用
'use client';

function ClientSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Results query={deferredQuery} />
    </div>
  );
}

// ❌ Server Component不能使用hooks
// 这不会工作
export default function ServerSearch() {
  const [query, setQuery] = useState('');  // 错误！
  const deferredQuery = useDeferredValue(query, '');  // 错误！
  
  return <div>{deferredQuery}</div>;
}
```

### 6. 性能监控

```jsx
// ✅ 监控defer的性能影响
function MonitoredComponent() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value, '');
  
  const isPending = value !== deferredValue;
  
  // 记录defer时间
  useEffect(() => {
    if (isPending) {
      const start = performance.now();
      
      return () => {
        const duration = performance.now() - start;
        console.log(`Defer duration: ${duration}ms`);
        
        // 发送到分析服务
        analytics.track('defer_duration', { duration });
      };
    }
  }, [isPending]);
  
  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <ExpensiveComponent data={deferredValue} />
    </div>
  );
}
```

### 7. 与并发特性配合

```jsx
// ✅ 与Suspense、startTransition等配合
import { Suspense, startTransition } from 'react';

function ConcurrentDemo() {
  const [tab, setTab] = useState('posts');
  const [query, setQuery] = useState('');
  
  const deferredQuery = useDeferredValue(query, '');
  
  const handleTabChange = (newTab) => {
    startTransition(() => {
      setTab(newTab);
    });
  };
  
  return (
    <div>
      <Tabs value={tab} onChange={handleTabChange} />
      
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      
      <Suspense fallback={<Skeleton />}>
        <TabContent tab={tab} query={deferredQuery} />
      </Suspense>
    </div>
  );
}
```

## 常见问题

### Q1: 什么时候应该使用useDeferredValue？

**A:** 当状态变化导致大量渲染开销时使用。判断标准：

**使用场景：**
- **实时搜索**：搜索结果列表很长
- **大列表过滤**：超过1000项的列表
- **实时预览**：Markdown、代码高亮等
- **复杂计算**：数据分析、图表渲染
- **表单验证**：复杂的实时验证逻辑

```jsx
// 示例：判断是否需要defer
function Component() {
  const [query, setQuery] = useState('');
  
  // 测量渲染时间
  const startTime = performance.now();
  const results = heavyComputation(query);
  const renderTime = performance.now() - startTime;
  
  // 如果渲染时间超过50ms，考虑使用defer
  console.log(`Render time: ${renderTime}ms`);
  
  // 如果renderTime > 50ms，应该使用：
  const deferredQuery = useDeferredValue(query, '');
  const results = heavyComputation(deferredQuery);
  
  return <ResultsList results={results} />;
}
```

**不需要使用的场景：**
- 简单的文本显示
- 少于100项的列表
- 渲染时间小于16ms（一帧的时间）

### Q2: useDeferredValue和useTransition有什么区别？

**A:** 两者都用于优化性能，但用途不同：

| 特性 | useDeferredValue | useTransition |
|------|------------------|---------------|
| **用途** | 延迟值的更新 | 标记更新为非紧急 |
| **控制对象** | 特定的值 | 状态更新函数 |
| **返回值** | 延迟的值 | [isPending, startTransition] |
| **使用场景** | 你有一个值需要延迟 | 你要执行非紧急更新 |

```jsx
// useDeferredValue：延迟值
function SearchWithDeferred() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');  // 延迟query的值
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Results query={deferredQuery} />  {/* 使用延迟的值 */}
    </div>
  );
}

// useTransition：标记更新
function SearchWithTransition() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    const value = e.target.value;
    startTransition(() => {
      setQuery(value);  // 标记这个更新为非紧急
    });
  };
  
  return (
    <div>
      <input onChange={handleChange} />  {/* input不受影响 */}
      {isPending && <Spinner />}
      <Results query={query} />
    </div>
  );
}
```

**选择建议：**
- 如果你控制状态更新的代码：使用`useTransition`
- 如果你不控制状态（props传入）：使用`useDeferredValue`
- 两者可以组合使用

### Q3: 初始值是必须的吗？

**A:** 不是，React 19中初始值是可选的，为了向后兼容：

```jsx
// React 18和React 19都支持
const deferred = useDeferredValue(value);  // 没有初始值

// React 19新增
const deferred = useDeferredValue(value, initialValue);  // 有初始值

// 实际使用建议
function Component() {
  const [query, setQuery] = useState('');
  
  // 如果不需要特殊的初始值，可以不提供
  const deferred1 = useDeferredValue(query);
  
  // 如果想避免初始渲染的问题，提供初始值
  const deferred2 = useDeferredValue(query, '');
  
  // 两种方式都可以，根据具体需求选择
}
```

### Q4: 如何决定初始值？

**A:** 初始值应该与state的初始值或默认状态保持一致：

```jsx
// 原则：初始值应该是"安全"的值

// 字符串：空字符串
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query, '');

// 数字：0或最小值
const [count, setCount] = useState(0);
const deferredCount = useDeferredValue(count, 0);

// 布尔值：false或默认状态
const [enabled, setEnabled] = useState(false);
const deferredEnabled = useDeferredValue(enabled, false);

// 数组：空数组
const [items, setItems] = useState([]);
const deferredItems = useDeferredValue(items, []);

// 对象：空对象或默认对象
const [filters, setFilters] = useState({ category: 'all', price: [0, 1000] });
const deferredFilters = useDeferredValue(filters, { category: 'all', price: [0, 1000] });

// null/undefined：保持一致
const [user, setUser] = useState(null);
const deferredUser = useDeferredValue(user, null);
```

### Q5: useDeferredValue会影响首次渲染吗？

**A:** React 19中不会，如果提供了初始值：

```jsx
// React 18：可能有初始渲染问题
function Component() {
  const [value, setValue] = useState('hello');
  const deferred = useDeferredValue(value);  // 首次渲染：deferred === 'hello'
  
  // 首次渲染没有问题，因为value和deferred都是'hello'
}

// React 19：更明确的控制
function Component() {
  const [value, setValue] = useState('hello');
  const deferred = useDeferredValue(value, 'default');  // 首次渲染：deferred === 'default'
  
  // 如果需要，可以提供不同的初始值
}

// 实际场景
function SearchResults() {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query, '');
  
  // 首次渲染：query === '' && deferred === ''
  // 不会触发不必要的加载状态
  const isPending = query !== deferred;  // false
  
  return (
    <div>
      {isPending && <Loading />}  {/* 首次不显示 */}
      <Results query={deferred} />
    </div>
  );
}
```

### Q6: 如何测试使用useDeferredValue的组件？

**A:** 使用React Testing Library，注意异步行为：

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('defers value updates', async () => {
  const user = userEvent.setup();
  
  render(<SearchComponent />);
  
  const input = screen.getByPlaceholderText('搜索...');
  
  // 输入搜索词
  await user.type(input, 'react');
  
  // 立即检查：input值已更新
  expect(input).toHaveValue('react');
  
  // 但deferred值可能还没更新，需要等待
  await waitFor(() => {
    expect(screen.getByText(/找到.*结果/)).toBeInTheDocument();
  });
});

test('shows pending state', async () => {
  const user = userEvent.setup();
  
  render(<SearchComponent />);
  
  const input = screen.getByPlaceholderText('搜索...');
  
  await user.type(input, 'test');
  
  // 检查pending状态
  expect(screen.getByText('搜索中...')).toBeInTheDocument();
  
  // 等待pending结束
  await waitFor(() => {
    expect(screen.queryByText('搜索中...')).not.toBeInTheDocument();
  });
});
```

### Q7: useDeferredValue和防抖(debounce)有什么区别？

**A:** 两者目的不同：

| 特性 | useDeferredValue | 防抖(debounce) |
|------|------------------|----------------|
| **机制** | React调度系统 | 定时器 |
| **响应性** | 立即响应用户输入 | 延迟响应 |
| **取消** | 自动中断旧渲染 | 手动清除定时器 |
| **用户体验** | 更流畅 | 可能有延迟感 |
| **适用场景** | UI更新优化 | API请求节流 |

```jsx
// useDeferredValue：优化渲染
function WithDeferred() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');
  
  // 输入立即响应，但渲染可以延迟
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <HeavyList query={deferredQuery} />  {/* 延迟渲染 */}
    </div>
  );
}

// 防抖：延迟执行
function WithDebounce() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);  // 500ms后才更新
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  // 输入也会感到延迟
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Results query={debouncedQuery} />  {/* 延迟500ms */}
    </div>
  );
}

// 组合使用：最佳实践
function BestPractice() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // 防抖用于API请求
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  
  // useDeferredValue用于本地UI渲染
  const deferredQuery = useDeferredValue(query, '');
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      
      {/* 本地过滤：使用deferred */}
      <LocalResults query={deferredQuery} />
      
      {/* API搜索：使用debounced */}
      <APIResults query={debouncedQuery} />
    </div>
  );
}
```

### Q8: 多个useDeferredValue会互相影响吗？

**A:** 不会，每个useDeferredValue独立工作：

```jsx
function MultipleDeferred() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('name');
  
  // 三个独立的deferred值
  const deferredQuery = useDeferredValue(query, '');
  const deferredCategory = useDeferredValue(category, 'all');
  const deferredSort = useDeferredValue(sort, 'name');
  
  // 每个都可以独立延迟
  const queryPending = query !== deferredQuery;
  const categoryPending = category !== deferredCategory;
  const sortPending = sort !== deferredSort;
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {queryPending && <span>搜索中...</span>}
      
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">全部</option>
        <option value="tech">技术</option>
      </select>
      {categoryPending && <span>过滤中...</span>}
      
      <select value={sort} onChange={(e) => setSort(e.target.value)}>
        <option value="name">名称</option>
        <option value="date">日期</option>
      </select>
      {sortPending && <span>排序中...</span>}
      
      <Results 
        query={deferredQuery} 
        category={deferredCategory} 
        sort={deferredSort} 
      />
    </div>
  );
}
```

### Q9: 在Server Components中可以使用useDeferredValue吗？

**A:** 不可以，所有Hooks只能在Client Components中使用：

```jsx
// ❌ Server Component（不能使用hooks）
export default function ServerPage() {
  const data = await fetchData();
  const deferred = useDeferredValue(data);  // 错误！
  
  return <div>{deferred}</div>;
}

// ✅ Client Component
'use client';

export function ClientSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query, '');
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Results query={deferredQuery} />
    </div>
  );
}

// ✅ 组合使用
// app/page.tsx (Server Component)
export default function Page() {
  return (
    <div>
      <h1>搜索页面</h1>
      <ClientSearch />  {/* Client Component处理交互 */}
    </div>
  );
}
```

### Q10: useDeferredValue的性能开销大吗？

**A:** 开销很小，React高效处理：

```jsx
// 性能对比
function PerformanceComparison() {
  const [value, setValue] = useState('');
  
  // 不使用defer：每次都重渲染
  const withoutDefer = () => {
    return <HeavyComponent value={value} />;  // 可能卡顿
  };
  
  // 使用defer：React智能调度
  const deferredValue = useDeferredValue(value, '');
  const withDefer = () => {
    return <HeavyComponent value={deferredValue} />;  // 流畅
  };
  
  // defer的开销主要是：
  // 1. 一次额外的state比较
  // 2. React调度系统的开销
  // 这些开销远小于避免的重渲染开销
}

// 测量实际影响
function MeasuredComponent() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value, '');
  
  // 测量渲染时间
  useEffect(() => {
    console.log('Component rendered');
    performance.mark('render-end');
  });
  
  performance.mark('render-start');
  
  return <HeavyComponent value={deferredValue} />;
}
```

## 总结

### React 19改进要点

```
✅ 可选的初始值参数
✅ 更灵活的控制
✅ 避免初始闪烁
✅ 向后兼容
✅ 更好的TypeScript支持
```

### 使用场景

```
✅ 实时搜索
✅ 大数据筛选
✅ 实时预览
✅ 复杂列表
✅ 图表更新
✅ 文本格式化
```

### 最佳实践

```
✅ 只在必要时使用
✅ 提供合理的初始值
✅ 结合memo优化
✅ 显示pending状态
✅ 配合Suspense使用
✅ 测试性能改进
```

useDeferredValue的改进让性能优化更加灵活和强大！
