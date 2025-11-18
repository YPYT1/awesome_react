# map方法渲染列表

## 学习目标

通过本章学习，你将全面掌握：

- 使用map方法渲染列表的完整技巧
- key属性的重要性和正确使用
- 列表渲染的各种高级场景
- 过滤、排序和搜索列表
- 嵌套列表的渲染
- 性能优化技巧
- 虚拟化长列表
- React 19中的列表渲染最佳实践

## 第一部分：map方法基础

### 1.1 基本列表渲染

```jsx
function BasicList() {
  const items = ['苹果', '香蕉', '橙子', '葡萄', '西瓜'];
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

// 对象数组
function ObjectList() {
  const users = [
    { id: 1, name: 'Alice', age: 25, role: 'Admin' },
    { id: 2, name: 'Bob', age: 30, role: 'User' },
    { id: 3, name: 'Charlie', age: 35, role: 'User' },
    { id: 4, name: 'David', age: 28, role: 'Manager' }
  ];
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}，{user.age}岁，{user.role}
        </li>
      ))}
    </ul>
  );
}

// 带样式的列表
function StyledList() {
  const products = [
    { id: 1, name: 'iPhone', price: 5999, inStock: true },
    { id: 2, name: 'MacBook', price: 12999, inStock: false },
    { id: 3, name: 'iPad', price: 4599, inStock: true }
  ];
  
  return (
    <div className="product-list">
      {products.map(product => (
        <div
          key={product.id}
          className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}
        >
          <h3>{product.name}</h3>
          <p className="price">¥{product.price}</p>
          <span className="stock-status">
            {product.inStock ? '有货' : '缺货'}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### 1.2 map方法详解

```jsx
// map方法的完整签名
// array.map((element, index, array) => transformedElement)

function MapParameters() {
  const items = ['A', 'B', 'C', 'D', 'E'];
  
  return (
    <ul>
      {items.map((item, index, array) => (
        <li key={index}>
          <span>项目：{item}</span>
          <span>索引：{index}</span>
          <span>总数：{array.length}</span>
          <span>位置：{index + 1}/{array.length}</span>
          <span>是否第一个：{index === 0 ? '是' : '否'}</span>
          <span>是否最后一个：{index === array.length - 1 ? '是' : '否'}</span>
        </li>
      ))}
    </ul>
  );
}

// 实际应用：带序号的列表
function NumberedList({ items }) {
  return (
    <ol>
      {items.map((item, index) => (
        <li key={item.id}>
          <span className="number">{index + 1}.</span>
          <span className="content">{item.text}</span>
        </li>
      ))}
    </ol>
  );
}

// 奇偶行样式
function StripedTable({ data }) {
  return (
    <table>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={row.id}
            className={index % 2 === 0 ? 'even-row' : 'odd-row'}
          >
            <td>{row.name}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 1.3 key属性的重要性

```jsx
// ❌ 没有key的问题
function WithoutKey() {
  const [items, setItems] = useState(['A', 'B', 'C']);
  
  const addToStart = () => {
    setItems(['New', ...items]);
  };
  
  return (
    <div>
      <button onClick={addToStart}>添加到开头</button>
      <ul>
        {items.map(item => (
          <li>
            <input type="checkbox" />
            {item}
          </li>  
          // ⚠️ Warning: Each child should have a unique "key" prop
        ))}
      </ul>
      {/* 问题：添加新项后，checkbox状态会错位 */}
    </div>
  );
}

// ✅ 使用key解决
function WithKey() {
  const [items, setItems] = useState([
    { id: 1, text: 'A' },
    { id: 2, text: 'B' },
    { id: 3, text: 'C' }
  ]);
  
  const addToStart = () => {
    setItems([
      { id: Date.now(), text: 'New' },
      ...items
    ]);
  };
  
  return (
    <div>
      <button onClick={addToStart}>添加到开头</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <input type="checkbox" />
            {item.text}
          </li>
        ))}
      </ul>
      {/* 有key后，React知道哪个是新元素，正确保持状态 */}
    </div>
  );
}
```

## 第二部分：复杂列表渲染

### 2.1 多列数据表格

```jsx
function DataTable() {
  const users = [
    { 
      id: 1, 
      name: 'Alice', 
      email: 'alice@example.com', 
      age: 25, 
      role: 'Admin',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Bob', 
      email: 'bob@example.com', 
      age: 30, 
      role: 'User',
      status: 'active'
    },
    { 
      id: 3, 
      name: 'Charlie', 
      email: 'charlie@example.com', 
      age: 35, 
      role: 'Manager',
      status: 'inactive'
    }
  ];
  
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>邮箱</th>
          <th>年龄</th>
          <th>角色</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr
            key={user.id}
            className={user.status === 'inactive' ? 'inactive-row' : ''}
          >
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.age}</td>
            <td>
              <span className={`role-badge role-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </td>
            <td>
              <span className={`status-badge status-${user.status}`}>
                {user.status === 'active' ? '活跃' : '非活跃'}
              </span>
            </td>
            <td>
              <button>编辑</button>
              <button>删除</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 2.2 嵌套列表

```jsx
function NestedList() {
  const categories = [
    {
      id: 1,
      name: '水果',
      items: [
        { id: 101, name: '苹果', price: 5 },
        { id: 102, name: '香蕉', price: 3 },
        { id: 103, name: '橙子', price: 4 }
      ]
    },
    {
      id: 2,
      name: '蔬菜',
      items: [
        { id: 201, name: '白菜', price: 2 },
        { id: 202, name: '萝卜', price: 3 },
        { id: 203, name: '土豆', price: 2.5 }
      ]
    },
    {
      id: 3,
      name: '肉类',
      items: [
        { id: 301, name: '猪肉', price: 25 },
        { id: 302, name: '牛肉', price: 45 },
        { id: 303, name: '鸡肉', price: 18 }
      ]
    }
  ];
  
  return (
    <div className="nested-list">
      {categories.map(category => (
        <div key={category.id} className="category">
          <h3>{category.name}</h3>
          <ul className="item-list">
            {category.items.map(item => (
              <li key={item.id} className="item">
                <span className="name">{item.name}</span>
                <span className="price">¥{item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// 深层嵌套（树形结构）
function TreeView({ tree }) {
  const renderNode = (node) => (
    <li key={node.id}>
      <div className="node-content">
        {node.name}
      </div>
      
      {node.children && node.children.length > 0 && (
        <ul className="children">
          {node.children.map(child => renderNode(child))}
        </ul>
      )}
    </li>
  );
  
  return (
    <ul className="tree-root">
      {tree.map(node => renderNode(node))}
    </ul>
  );
}
```

### 2.3 条件列表渲染

```jsx
function ConditionalListRendering() {
  const items = [
    { id: 1, name: '项目1', visible: true, featured: true },
    { id: 2, name: '项目2', visible: false, featured: false },
    { id: 3, name: '项目3', visible: true, featured: false },
    { id: 4, name: '项目4', visible: true, featured: true }
  ];
  
  return (
    <div>
      {/* 方法1：条件渲染每一项 */}
      <ul>
        {items.map(item => (
          item.visible && (
            <li key={item.id}>{item.name}</li>
          )
        ))}
      </ul>
      
      {/* 方法2：使用filter（更清晰） */}
      <ul>
        {items
          .filter(item => item.visible)
          .map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
      </ul>
      
      {/* 方法3：filter + 条件样式 */}
      <ul>
        {items
          .filter(item => item.visible)
          .map(item => (
            <li
              key={item.id}
              className={item.featured ? 'featured' : ''}
            >
              {item.featured && '⭐ '}
              {item.name}
            </li>
          ))}
      </ul>
    </div>
  );
}
```

## 第三部分：列表操作

### 3.1 过滤列表

```jsx
function FilteredList() {
  const [items] = useState([
    { id: 1, name: 'iPhone 15', category: '手机', price: 5999, brand: 'Apple' },
    { id: 2, name: 'MacBook Pro', category: '电脑', price: 12999, brand: 'Apple' },
    { id: 3, name: 'iPad Air', category: '平板', price: 4599, brand: 'Apple' },
    { id: 4, name: 'Samsung S24', category: '手机', price: 4999, brand: 'Samsung' },
    { id: 5, name: 'Surface Pro', category: '电脑', price: 8999, brand: 'Microsoft' }
  ]);
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  
  // 应用所有过滤条件
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 分类过滤
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      // 品牌过滤
      const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;
      
      // 价格过滤
      const matchesPrice = item.price >= priceRange.min && 
                          item.price <= priceRange.max;
      
      return matchesCategory && matchesBrand && matchesPrice;
    });
  }, [items, categoryFilter, brandFilter, priceRange]);
  
  return (
    <div>
      {/* 过滤器 */}
      <div className="filters">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">全部分类</option>
          <option value="手机">手机</option>
          <option value="电脑">电脑</option>
          <option value="平板">平板</option>
        </select>
        
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          <option value="all">全部品牌</option>
          <option value="Apple">Apple</option>
          <option value="Samsung">Samsung</option>
          <option value="Microsoft">Microsoft</option>
        </select>
        
        <div className="price-range">
          <input
            type="number"
            value={priceRange.min}
            onChange={e => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
            placeholder="最低价"
          />
          <span>-</span>
          <input
            type="number"
            value={priceRange.max === Infinity ? '' : priceRange.max}
            onChange={e => setPriceRange(prev => ({ 
              ...prev, 
              max: e.target.value ? Number(e.target.value) : Infinity 
            }))}
            placeholder="最高价"
          />
        </div>
      </div>
      
      <p>找到 {filteredItems.length} 个商品</p>
      
      <ul className="product-grid">
        {filteredItems.map(item => (
          <li key={item.id} className="product-card">
            <h4>{item.name}</h4>
            <p>{item.category} - {item.brand}</p>
            <p className="price">¥{item.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.2 排序列表

```jsx
function SortableList() {
  const [items, setItems] = useState([
    { id: 1, name: 'Charlie', score: 85, date: '2024-01-15' },
    { id: 2, name: 'Alice', score: 95, date: '2024-01-10' },
    { id: 3, name: 'Bob', score: 90, date: '2024-01-20' },
    { id: 4, name: 'David', score: 88, date: '2024-01-12' }
  ]);
  
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // 排序逻辑
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortBy === 'score') {
        compareValue = a.score - b.score;
      } else if (sortBy === 'date') {
        compareValue = new Date(a.date) - new Date(b.date);
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  }, [items, sortBy, sortOrder]);
  
  // 切换排序方向
  const toggleSortOrder = () => {
    setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
  };
  
  // 设置排序字段
  const handleSort = (field) => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  return (
    <div>
      <div className="sort-controls">
        <button onClick={() => handleSort('name')}>
          按名称排序 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => handleSort('score')}>
          按分数排序 {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => handleSort('date')}>
          按日期排序 {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
              姓名 {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('score')} style={{ cursor: 'pointer' }}>
              分数 {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
              日期 {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.score}分</td>
              <td>{new Date(item.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 3.3 搜索列表

```jsx
function SearchableList() {
  const [items] = useState([
    { id: 1, name: 'Apple iPhone 15', brand: 'Apple', price: 5999, tags: ['手机', '5G'] },
    { id: 2, name: 'Samsung Galaxy S24', brand: 'Samsung', price: 4999, tags: ['手机', '5G'] },
    { id: 3, name: 'Huawei Mate 60', brand: 'Huawei', price: 5999, tags: ['手机', '5G'] },
    { id: 4, name: 'Xiaomi 14 Pro', brand: 'Xiaomi', price: 3999, tags: ['手机', '5G'] }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState(['name', 'brand']);
  
  // 搜索逻辑
  const searchedItems = useMemo(() => {
    if (!searchTerm) return items;
    
    const term = searchTerm.toLowerCase();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (Array.isArray(value)) {
          return value.some(v => v.toLowerCase().includes(term));
        }
        return false;
      });
    });
  }, [items, searchTerm, searchFields]);
  
  // 高亮搜索词
  const highlightText = (text) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i}>{part}</mark>
      ) : (
        part
      )
    );
  };
  
  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="搜索产品、品牌或标签..."
        />
        
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>
            清除
          </button>
        )}
      </div>
      
      <div className="search-options">
        <label>
          <input
            type="checkbox"
            checked={searchFields.includes('name')}
            onChange={e => {
              setSearchFields(prev =>
                e.target.checked
                  ? [...prev, 'name']
                  : prev.filter(f => f !== 'name')
              );
            }}
          />
          搜索名称
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={searchFields.includes('brand')}
            onChange={e => {
              setSearchFields(prev =>
                e.target.checked
                  ? [...prev, 'brand']
                  : prev.filter(f => f !== 'brand')
              );
            }}
          />
          搜索品牌
        </label>
      </div>
      
      <p className="search-result">
        找到 {searchedItems.length} 个结果
        {searchTerm && ` (关键词: "${searchTerm}")`}
      </p>
      
      <ul className="product-list">
        {searchedItems.map(item => (
          <li key={item.id} className="product-item">
            <h4>{highlightText(item.name)}</h4>
            <p>品牌: {highlightText(item.brand)}</p>
            <p>价格: ¥{item.price}</p>
            <div className="tags">
              {item.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.4 分组列表

```jsx
function GroupedList({ items }) {
  // 按类别分组
  const groupedByCategory = useMemo(() => {
    const groups = {};
    
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    
    return groups;
  }, [items]);
  
  return (
    <div>
      {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
        <div key={category} className="category-group">
          <h3>{category} ({categoryItems.length})</h3>
          <ul>
            {categoryItems.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## 第四部分：性能优化

### 4.1 使用React.memo优化列表项

```jsx
// 列表项组件
const ListItem = React.memo(function ListItem({ item, onEdit, onDelete }) {
  console.log('ListItem渲染:', item.id);
  
  return (
    <li className="list-item">
      <span>{item.name}</span>
      <button onClick={() => onEdit(item.id)}>编辑</button>
      <button onClick={() => onDelete(item.id)}>删除</button>
    </li>
  );
});

// 父组件
function OptimizedList() {
  const [items, setItems] = useState([]);
  
  // 使用useCallback缓存函数
  const handleEdit = useCallback((id) => {
    console.log('编辑:', id);
  }, []);
  
  const handleDelete = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  return (
    <ul>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
```

### 4.2 虚拟滚动

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  // Row组件
  const Row = ({ index, style }) => {
    const item = items[index];
    
    return (
      <div style={style} className="virtual-row">
        <span>{item.name}</span>
        <span>¥{item.price}</span>
      </div>
    );
  };
  
  return (
    <FixedSizeList
      height={600}      // 可见区域高度
      itemCount={items.length}  // 总项目数
      itemSize={50}     // 每项高度
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// 可变高度的虚拟列表
import { VariableSizeList } from 'react-window';

function VariableHeightList({ items }) {
  const listRef = useRef(null);
  
  // 获取每项的高度
  const getItemSize = (index) => {
    const item = items[index];
    // 根据内容计算高度
    return item.description ? 100 : 50;
  };
  
  const Row = ({ index, style }) => {
    const item = items[index];
    
    return (
      <div style={style} className="variable-row">
        <h4>{item.name}</h4>
        {item.description && <p>{item.description}</p>}
      </div>
    );
  };
  
  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

### 4.3 分页渲染

```jsx
function PaginatedList({ items, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // 计算分页
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);
  
  // 生成页码
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  return (
    <div>
      <ul className="item-list">
        {currentItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          首页
        </button>
        
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          上一页
        </button>
        
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={currentPage === page ? 'active' : ''}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          下一页
        </button>
        
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          末页
        </button>
        
        <span className="page-info">
          第 {currentPage} / {totalPages} 页，共 {items.length} 项
        </span>
      </div>
    </div>
  );
}
```

### 4.4 懒加载/无限滚动

```jsx
function InfiniteScrollList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  
  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/items?page=${page}&limit=20`);
      const newItems = await response.json();
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(p => p + 1);
      }
    } catch (error) {
      console.error('加载失败', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);
  
  // 使用Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loadMore]);
  
  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      {hasMore && (
        <div ref={observerRef} className="loading-trigger">
          {loading && <p>加载中...</p>}
        </div>
      )}
      
      {!hasMore && (
        <p className="end-message">没有更多数据了</p>
      )}
    </div>
  );
}
```

## 第五部分：实战案例

### 5.1 完整的商品列表

```jsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');  // grid or list
  
  // 组合过滤和排序
  const processedProducts = useMemo(() => {
    let result = [...products];
    
    // 搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    
    // 过滤分类
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    // 排序
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    return result;
  }, [products, searchTerm, categoryFilter, sortBy]);
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  return (
    <div className="product-list-container">
      {/* 工具栏 */}
      <div className="toolbar">
        <input
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="搜索商品..."
        />
        
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">全部分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="books">图书</option>
        </select>
        
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="default">默认排序</option>
          <option value="price-asc">价格升序</option>
          <option value="price-desc">价格降序</option>
          <option value="name">名称排序</option>
          <option value="rating">评分排序</option>
        </select>
        
        <div className="view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            网格
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            列表
          </button>
        </div>
      </div>
      
      <p className="result-count">
        找到 {processedProducts.length} 个商品
      </p>
      
      {/* 商品展示 */}
      <div className={viewMode === 'grid' ? 'product-grid' : 'product-list'}>
        {processedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
          />
        ))}
      </div>
      
      {processedProducts.length === 0 && (
        <div className="empty-state">
          <p>没有找到匹配的商品</p>
          <button onClick={() => {
            setSearchTerm('');
            setCategoryFilter('all');
          }}>
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}

const ProductCard = React.memo(function ProductCard({ product, viewMode }) {
  return (
    <div className={`product-card ${viewMode}`}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="description">{product.description}</p>
      <div className="product-footer">
        <span className="price">¥{product.price}</span>
        <span className="rating">⭐ {product.rating}</span>
        <button>加入购物车</button>
      </div>
    </div>
  );
});
```

## 练习题

### 基础练习

1. 使用map渲染一个简单列表
2. 渲染一个对象数组为表格
3. 实现嵌套列表渲染
4. 正确使用key属性

### 进阶练习

1. 实现列表的过滤和排序功能
2. 创建一个可搜索的商品列表
3. 实现分页列表
4. 创建分组列表展示

### 高级练习

1. 实现虚拟滚动优化大列表
2. 创建一个复杂的数据表格（支持排序、过滤、分页）
3. 实现无限滚动加载
4. 优化列表渲染性能

通过本章学习，你已经掌握了使用map方法渲染列表的完整技巧。列表渲染是React应用中最常用的功能之一，熟练掌握它对开发各种应用都至关重要。继续学习，深入探索列表优化和高级用法！
