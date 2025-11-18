# 虚拟列表(react-window-react-virtualized)

## 第一部分：虚拟列表概述

### 1.1 什么是虚拟列表

虚拟列表（Virtual List）是一种优化长列表渲染的技术。它只渲染可见区域的列表项，而不是渲染整个列表，从而大幅提升性能。

**核心原理：**

```javascript
// 传统列表：渲染所有10000项
function TraditionalList({ items }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.content}</div>
      ))}
    </div>
  );
  // 性能问题：
  // - DOM节点过多（10000个）
  // - 内存占用大
  // - 渲染时间长
  // - 滚动卡顿
}

// 虚拟列表：只渲染可见项
function VirtualList({ items, height, itemHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + height) / itemHeight);
  
  // 只渲染可见项
  const visibleItems = items.slice(startIndex, endIndex);
  
  return (
    <div 
      style={{ height, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map((item, i) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (startIndex + i) * itemHeight,
              height: itemHeight
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
  // 优势：
  // - DOM节点少（约20个）
  // - 内存占用小
  // - 渲染快速
  // - 滚动流畅
}
```

### 1.2 为什么需要虚拟列表

```javascript
// 性能对比
const ITEMS_COUNT = 10000;

// 场景1：渲染10000个简单列表项
function NonVirtualized() {
  const items = Array.from({ length: ITEMS_COUNT }, (_, i) => ({
    id: i,
    text: `Item ${i}`
  }));
  
  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {items.map(item => (
        <div key={item.id} style={{ height: '50px' }}>
          {item.text}
        </div>
      ))}
    </div>
  );
  
  // 性能指标：
  // - 首次渲染：~2000ms
  // - DOM节点：10000个
  // - 内存：~50MB
  // - 滚动FPS：~20fps（卡顿）
}

// 场景2：使用虚拟列表
import { FixedSizeList } from 'react-window';

function Virtualized() {
  const items = Array.from({ length: ITEMS_COUNT }, (_, i) => ({
    id: i,
    text: `Item ${i}`
  }));
  
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].text}</div>
  );
  
  return (
    <FixedSizeList
      height={500}
      itemCount={ITEMS_COUNT}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
  
  // 性能指标：
  // - 首次渲染：~50ms（40倍提升）
  // - DOM节点：~20个
  // - 内存：~2MB（25倍减少）
  // - 滚动FPS：~60fps（流畅）
}
```

### 1.3 主流虚拟列表库对比

```javascript
// 1. react-window（推荐）
// - 体积小（6KB）
// - 性能好
// - API简单
// - 维护活跃

// 2. react-virtualized
// - 功能丰富
// - 体积大（30KB）
// - API复杂
// - 成熟稳定

// 3. 选择建议
const recommendation = {
  'react-window': '新项目、简单场景',
  'react-virtualized': '复杂场景、需要高级功能'
};

// react-window示例
import { FixedSizeList } from 'react-window';

function SimpleList() {
  const Row = ({ index, style }) => (
    <div style={style}>Row {index}</div>
  );
  
  return (
    <FixedSizeList
      height={400}
      itemCount={1000}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// react-virtualized示例
import { List } from 'react-virtualized';

function SimpleListVirtualized() {
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      Row {index}
    </div>
  );
  
  return (
    <List
      width={300}
      height={400}
      rowCount={1000}
      rowHeight={35}
      rowRenderer={rowRenderer}
    />
  );
}
```

## 第二部分：react-window详解

### 2.1 FixedSizeList固定高度列表

```javascript
import { FixedSizeList } from 'react-window';

// 基础用法
function BasicFixedList() {
  const items = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
  
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  );
  
  return (
    <FixedSizeList
      height={400}          // 列表高度
      itemCount={1000}      // 总项数
      itemSize={35}         // 每项高度
      width="100%"          // 列表宽度
    >
      {Row}
    </FixedSizeList>
  );
}

// 带样式的列表
function StyledList() {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `Title ${i}`,
    subtitle: `Subtitle ${i}`
  }));
  
  const Row = ({ index, style }) => {
    const item = items[index];
    
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #eee'
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold' }}>{item.title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {item.subtitle}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={60}
      width={400}
    >
      {Row}
    </FixedSizeList>
  );
}

// 响应式列表
function ResponsiveList() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  const Row = ({ index, style }) => (
    <div style={style}>Item {index}</div>
  );
  
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 && (
        <FixedSizeList
          height={500}
          itemCount={1000}
          itemSize={35}
          width={width}
        >
          {Row}
        </FixedSizeList>
      )}
    </div>
  );
}

// 带交互的列表
function InteractiveList() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));
  
  const Row = ({ index, style }) => {
    const item = items[index];
    const isSelected = selectedIndex === index;
    
    return (
      <div
        style={{
          ...style,
          backgroundColor: isSelected ? '#e3f2fd' : 'white',
          cursor: 'pointer',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={() => setSelectedIndex(index)}
      >
        {item.name}
      </div>
    );
  };
  
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={40}
      width={300}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 2.2 VariableSizeList动态高度列表

```javascript
import { VariableSizeList } from 'react-window';

// 基础动态高度
function BasicVariableList() {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    content: `Item ${i}`,
    height: 40 + Math.floor(Math.random() * 60)  // 40-100px随机高度
  }));
  
  const listRef = useRef(null);
  
  const getItemSize = (index) => items[index].height;
  
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].content} (Height: {items[index].height}px)
    </div>
  );
  
  return (
    <VariableSizeList
      ref={listRef}
      height={400}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}

// 展开/折叠列表
function ExpandableList() {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    details: `Details for item ${i}...`.repeat(5)
  }));
  
  const listRef = useRef(null);
  
  const toggleExpand = (index) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
    
    // 重新计算尺寸
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  };
  
  const getItemSize = (index) => {
    return expandedItems.has(index) ? 150 : 50;
  };
  
  const Row = ({ index, style }) => {
    const item = items[index];
    const isExpanded = expandedItems.has(index);
    
    return (
      <div
        style={{
          ...style,
          borderBottom: '1px solid #ddd',
          padding: '8px'
        }}
      >
        <div
          onClick={() => toggleExpand(index)}
          style={{ cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isExpanded ? '▼' : '▶'} {item.title}
        </div>
        
        {isExpanded && (
          <div style={{ marginTop: '8px', color: '#666' }}>
            {item.details}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <VariableSizeList
      ref={listRef}
      height={500}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}

// 自动测量高度
function AutoSizedList() {
  const rowHeights = useRef({});
  const listRef = useRef(null);
  
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    content: `Content for item ${i}`.repeat(Math.floor(Math.random() * 5) + 1)
  }));
  
  const setRowHeight = (index, size) => {
    if (rowHeights.current[index] !== size) {
      rowHeights.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  };
  
  const getRowHeight = (index) => {
    return rowHeights.current[index] || 100;  // 默认高度
  };
  
  const Row = ({ index, style }) => {
    const rowRef = useRef(null);
    
    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight);
      }
    });
    
    return (
      <div style={style}>
        <div
          ref={rowRef}
          style={{ padding: '16px', borderBottom: '1px solid #eee' }}
        >
          {items[index].content}
        </div>
      </div>
    );
  };
  
  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={items.length}
      itemSize={getRowHeight}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

### 2.3 FixedSizeGrid固定网格

```javascript
import { FixedSizeGrid } from 'react-window';

// 基础网格
function BasicGrid() {
  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ddd'
      }}
    >
      {rowIndex},{columnIndex}
    </div>
  );
  
  return (
    <FixedSizeGrid
      columnCount={1000}
      columnWidth={100}
      height={600}
      rowCount={1000}
      rowHeight={35}
      width={800}
    >
      {Cell}
    </FixedSizeGrid>
  );
}

// 图片网格
function ImageGrid() {
  const images = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    url: `https://picsum.photos/200/200?random=${i}`,
    title: `Image ${i}`
  }));
  
  const COLUMN_COUNT = 4;
  
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    const image = images[index];
    
    if (!image) return null;
    
    return (
      <div
        style={{
          ...style,
          padding: '8px'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <img
            src={image.url}
            alt={image.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    );
  };
  
  return (
    <FixedSizeGrid
      columnCount={COLUMN_COUNT}
      columnWidth={200}
      height={600}
      rowCount={Math.ceil(images.length / COLUMN_COUNT)}
      rowHeight={200}
      width={800}
    >
      {Cell}
    </FixedSizeGrid>
  );
}

// 响应式网格
function ResponsiveGrid() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  const COLUMN_WIDTH = 150;
  const columnCount = Math.floor(dimensions.width / COLUMN_WIDTH);
  
  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={{ ...style, border: '1px solid #ddd' }}>
      Cell {rowIndex},{columnIndex}
    </div>
  );
  
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '600px' }}
    >
      {dimensions.width > 0 && (
        <FixedSizeGrid
          columnCount={columnCount}
          columnWidth={COLUMN_WIDTH}
          height={dimensions.height}
          rowCount={100}
          rowHeight={150}
          width={dimensions.width}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </div>
  );
}
```

### 2.4 高级特性

```javascript
// 1. 滚动到指定位置
function ScrollToItem() {
  const listRef = useRef(null);
  const [targetIndex, setTargetIndex] = useState('');
  
  const scrollToItem = () => {
    const index = parseInt(targetIndex);
    if (listRef.current && !isNaN(index)) {
      listRef.current.scrollToItem(index, 'center');
    }
  };
  
  const Row = ({ index, style }) => (
    <div style={style}>Item {index}</div>
  );
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type="number"
          value={targetIndex}
          onChange={e => setTargetIndex(e.target.value)}
          placeholder="输入索引"
        />
        <button onClick={scrollToItem}>滚动到</button>
      </div>
      
      <FixedSizeList
        ref={listRef}
        height={400}
        itemCount={1000}
        itemSize={35}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}

// 2. 监听滚动事件
function ScrollListener() {
  const [scrollInfo, setScrollInfo] = useState({
    scrollDirection: 'forward',
    scrollOffset: 0,
    scrollUpdateWasRequested: false
  });
  
  const handleScroll = ({
    scrollDirection,
    scrollOffset,
    scrollUpdateWasRequested
  }) => {
    setScrollInfo({
      scrollDirection,
      scrollOffset,
      scrollUpdateWasRequested
    });
  };
  
  const Row = ({ index, style }) => (
    <div style={style}>Item {index}</div>
  );
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <div>方向: {scrollInfo.scrollDirection}</div>
        <div>偏移: {scrollInfo.scrollOffset}px</div>
      </div>
      
      <FixedSizeList
        height={400}
        itemCount={1000}
        itemSize={35}
        width="100%"
        onScroll={handleScroll}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}

// 3. 动态加载数据
function InfiniteLoader() {
  const [items, setItems] = useState(
    Array.from({ length: 50 }, (_, i) => `Item ${i}`)
  );
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef(null);
  
  const loadMore = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setItems(prev => [
      ...prev,
      ...Array.from({ length: 50 }, (_, i) => 
        `Item ${prev.length + i}`
      )
    ]);
    
    setIsLoading(false);
  }, [isLoading]);
  
  const handleScroll = ({ scrollDirection, scrollOffset }) => {
    const listHeight = 400;
    const totalHeight = items.length * 35;
    
    // 接近底部时加载更多
    if (scrollDirection === 'forward' && 
        scrollOffset + listHeight > totalHeight - 200) {
      loadMore();
    }
  };
  
  const Row = ({ index, style }) => {
    if (index === items.length) {
      return (
        <div style={{ ...style, textAlign: 'center' }}>
          {isLoading ? 'Loading...' : 'End'}
        </div>
      );
    }
    
    return <div style={style}>{items[index]}</div>;
  };
  
  return (
    <FixedSizeList
      ref={listRef}
      height={400}
      itemCount={items.length + 1}
      itemSize={35}
      width="100%"
      onScroll={handleScroll}
    >
      {Row}
    </FixedSizeList>
  );
}

// 4. 缓存优化
import memoize from 'memoize-one';

function OptimizedList() {
  const [items] = useState(
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }))
  );
  
  // 缓存行数据创建
  const createItemData = memoize((items) => ({ items }));
  const itemData = createItemData(items);
  
  const Row = memo(({ index, style, data }) => {
    const item = data.items[index];
    
    return (
      <div style={style}>
        {item.name}: {item.value.toFixed(2)}
      </div>
    );
  });
  
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
      width="100%"
      itemData={itemData}
    >
      {Row}
    </FixedSizeList>
  );
}
```

## 第三部分：react-virtualized详解

### 3.1 List组件

```javascript
import { List, AutoSizer } from 'react-virtualized';

// 基础List
function BasicListVirtualized() {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));
  
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      {items[index].name}
    </div>
  );
  
  return (
    <List
      width={300}
      height={400}
      rowCount={items.length}
      rowHeight={35}
      rowRenderer={rowRenderer}
    />
  );
}

// AutoSizer自动尺寸
function AutoSizedList() {
  const rowRenderer = ({ index, key, style }) => (
    <div key={key} style={style}>
      Row {index}
    </div>
  );
  
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            rowCount={1000}
            rowHeight={35}
            rowRenderer={rowRenderer}
          />
        )}
      </AutoSizer>
    </div>
  );
}

// CellMeasurer动态高度
import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

function DynamicHeightList() {
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100
    })
  );
  
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    content: `Content ${i}`.repeat(Math.floor(Math.random() * 10) + 1)
  }));
  
  const rowRenderer = ({ index, key, parent, style }) => (
    <CellMeasurer
      cache={cache.current}
      columnIndex={0}
      key={key}
      parent={parent}
      rowIndex={index}
    >
      <div style={style}>
        <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
          {items[index].content}
        </div>
      </div>
    </CellMeasurer>
  );
  
  return (
    <List
      width={400}
      height={600}
      rowCount={items.length}
      deferredMeasurementCache={cache.current}
      rowHeight={cache.current.rowHeight}
      rowRenderer={rowRenderer}
    />
  );
}
```

### 3.2 Grid和Table

```javascript
import { Grid, Table, Column } from 'react-virtualized';

// Grid网格
function VirtualizedGrid() {
  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => (
    <div
      key={key}
      style={{
        ...style,
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {rowIndex},{columnIndex}
    </div>
  );
  
  return (
    <Grid
      cellRenderer={cellRenderer}
      columnCount={50}
      columnWidth={100}
      height={600}
      rowCount={50}
      rowHeight={100}
      width={800}
    />
  );
}

// Table表格
function VirtualizedTable() {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Name ${i}`,
    email: `email${i}@example.com`,
    age: 20 + (i % 50)
  }));
  
  return (
    <Table
      width={800}
      height={600}
      headerHeight={40}
      rowHeight={50}
      rowCount={data.length}
      rowGetter={({ index }) => data[index]}
    >
      <Column
        label="ID"
        dataKey="id"
        width={100}
      />
      
      <Column
        label="Name"
        dataKey="name"
        width={200}
      />
      
      <Column
        label="Email"
        dataKey="email"
        width={300}
      />
      
      <Column
        label="Age"
        dataKey="age"
        width={100}
      />
    </Table>
  );
}

// 自定义单元格渲染
function CustomTable() {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    status: i % 3 === 0 ? 'active' : 'inactive',
    avatar: `https://i.pravatar.cc/150?img=${i}`
  }));
  
  const statusRenderer = ({ cellData }) => (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: cellData === 'active' ? '#4caf50' : '#f44336',
        color: 'white'
      }}
    >
      {cellData}
    </span>
  );
  
  const avatarRenderer = ({ cellData }) => (
    <img
      src={cellData}
      alt="avatar"
      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
    />
  );
  
  return (
    <Table
      width={800}
      height={600}
      headerHeight={50}
      rowHeight={60}
      rowCount={data.length}
      rowGetter={({ index }) => data[index]}
    >
      <Column
        label="Avatar"
        dataKey="avatar"
        width={80}
        cellRenderer={avatarRenderer}
      />
      
      <Column
        label="Name"
        dataKey="name"
        width={200}
      />
      
      <Column
        label="Status"
        dataKey="status"
        width={150}
        cellRenderer={statusRenderer}
      />
    </Table>
  );
}
```

## 第四部分：实战应用

### 4.1 聊天消息列表

```javascript
import { VariableSizeList } from 'react-window';

function ChatMessageList() {
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const messageHeights = useRef({});
  
  // 添加新消息
  const addMessage = useCallback((text) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        timestamp: new Date(),
        user: 'me'
      }
    ]);
    
    // 滚动到底部
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollToItem(messages.length, 'end');
      }
    }, 0);
  }, [messages.length]);
  
  const setMessageHeight = (index, height) => {
    if (messageHeights.current[index] !== height) {
      messageHeights.current[index] = height;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  };
  
  const getMessageHeight = (index) => {
    return messageHeights.current[index] || 80;
  };
  
  const Message = ({ index, style }) => {
    const message = messages[index];
    const messageRef = useRef(null);
    
    useEffect(() => {
      if (messageRef.current) {
        setMessageHeight(index, messageRef.current.clientHeight);
      }
    });
    
    return (
      <div style={style}>
        <div
          ref={messageRef}
          style={{
            padding: '8px 16px',
            margin: '8px',
            backgroundColor: message.user === 'me' ? '#e3f2fd' : '#f5f5f5',
            borderRadius: '8px',
            maxWidth: '70%',
            marginLeft: message.user === 'me' ? 'auto' : '0'
          }}
        >
          <div>{message.text}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <VariableSizeList
        ref={listRef}
        height={500}
        itemCount={messages.length}
        itemSize={getMessageHeight}
        width="100%"
      >
        {Message}
      </VariableSizeList>
      
      <input
        type="text"
        onKeyPress={e => {
          if (e.key === 'Enter' && e.target.value) {
            addMessage(e.target.value);
            e.target.value = '';
          }
        }}
        placeholder="输入消息..."
        style={{ width: '100%', padding: '12px' }}
      />
    </div>
  );
}
```

### 4.2 电商商品列表

```javascript
import { FixedSizeGrid } from 'react-window';

function ProductGrid() {
  const [products] = useState(
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Product ${i}`,
      price: (Math.random() * 100).toFixed(2),
      image: `https://picsum.photos/200/200?random=${i}`,
      rating: (Math.random() * 5).toFixed(1)
    }))
  );
  
  const COLUMN_COUNT = 4;
  const COLUMN_WIDTH = 250;
  const ROW_HEIGHT = 320;
  
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    const product = products[index];
    
    if (!product) return null;
    
    return (
      <div style={{ ...style, padding: '8px' }}>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
          
          <div style={{ padding: '12px', flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{product.name}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#f44336' }}>
                ${product.price}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ff9800' }}>★</span>
                <span>{product.rating}</span>
              </div>
            </div>
            
            <button
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <AutoSizer>
        {({ width, height }) => {
          const columnCount = Math.floor(width / COLUMN_WIDTH);
          
          return (
            <FixedSizeGrid
              columnCount={columnCount}
              columnWidth={COLUMN_WIDTH}
              height={height}
              rowCount={Math.ceil(products.length / columnCount)}
              rowHeight={ROW_HEIGHT}
              width={width}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
}
```

### 4.3 日志查看器

```javascript
function LogViewer() {
  const [logs] = useState(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - (10000 - i) * 1000).toISOString(),
      level: ['INFO', 'WARNING', 'ERROR'][Math.floor(Math.random() * 3)],
      message: `Log message ${i}: ${Math.random().toString(36).substring(7)}`
    }))
  );
  
  const [filter, setFilter] = useState('ALL');
  
  const filteredLogs = useMemo(() => {
    if (filter === 'ALL') return logs;
    return logs.filter(log => log.level === filter);
  }, [logs, filter]);
  
  const getLevelColor = (level) => {
    switch (level) {
      case 'INFO': return '#2196f3';
      case 'WARNING': return '#ff9800';
      case 'ERROR': return '#f44336';
      default: return '#666';
    }
  };
  
  const Row = ({ index, style }) => {
    const log = filteredLogs[index];
    
    return (
      <div
        style={{
          ...style,
          fontFamily: 'monospace',
          fontSize: '12px',
          padding: '4px 8px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <span style={{ color: '#999', marginRight: '8px' }}>
          {log.timestamp}
        </span>
        
        <span
          style={{
            color: getLevelColor(log.level),
            fontWeight: 'bold',
            marginRight: '8px',
            minWidth: '80px'
          }}
        >
          [{log.level}]
        </span>
        
        <span>{log.message}</span>
      </div>
    );
  };
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setFilter('ALL')}>All</button>
        <button onClick={() => setFilter('INFO')}>Info</button>
        <button onClick={() => setFilter('WARNING')}>Warning</button>
        <button onClick={() => setFilter('ERROR')}>Error</button>
        <span style={{ marginLeft: '16px' }}>
          Total: {filteredLogs.length}
        </span>
      </div>
      
      <FixedSizeList
        height={600}
        itemCount={filteredLogs.length}
        itemSize={30}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

## 注意事项

### 1. 性能优化

```javascript
// ✅ 优化：使用memo
const Row = memo(({ index, style, data }) => {
  const item = data[index];
  return <div style={style}>{item.name}</div>;
});

// ✅ 优化：缓存itemData
const itemData = useMemo(() => ({ items }), [items]);

// ❌ 避免：在render中创建函数
function Bad() {
  return (
    <FixedSizeList
      itemData={items}  // ❌ 每次都是新对象
    />
  );
}
```

### 2. 滚动优化

```javascript
// overscan提前渲染
<FixedSizeList
  overscanCount={5}  // 额外渲染5项
/>

// 平滑滚动
<FixedSizeList
  useIsScrolling  // 滚动时优化渲染
/>
```

### 3. 内存管理

```javascript
// 及时清理
useEffect(() => {
  return () => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  };
}, []);
```

## 常见问题

### Q1: react-window和react-virtualized选哪个？

**A:** 新项目优先react-window，复杂场景用react-virtualized。

### Q2: 如何处理动态高度？

**A:** 使用VariableSizeList和CellMeasurer。

### Q3: 虚拟列表支持横向滚动吗？

**A:** 支持，使用direction="horizontal"。

### Q4: 如何优化首屏渲染？

**A:** 设置合理的overscanCount，预渲染部分内容。

### Q5: 虚拟列表影响SEO吗？

**A:** 会影响，需要SSR配合或其他SEO策略。

### Q6: 如何实现sticky header？

**A:** 使用react-virtualized的MultiGrid或自定义实现。

### Q7: 虚拟列表支持拖拽吗？

**A:** 支持，但需要额外处理滚动和重新计算位置。

### Q8: 如何调试虚拟列表？

**A:** 使用React DevTools和浏览器Performance工具。

### Q9: 虚拟列表会导致内存泄漏吗？

**A:** 正确使用不会，注意清理ref和事件监听。

### Q10: 如何测试虚拟列表组件？

**A:** 使用@testing-library/react模拟滚动事件。

## 总结

### 核心要点

```
1. 虚拟列表优势
   ✅ DOM节点少
   ✅ 内存占用小
   ✅ 渲染性能好
   ✅ 滚动流畅

2. 选择建议
   ✅ react-window: 简单场景
   ✅ react-virtualized: 复杂场景
   ✅ 自定义: 特殊需求

3. 最佳实践
   ✅ 合理的overscan
   ✅ memo优化渲染
   ✅ 缓存itemData
   ✅ 正确处理动态高度
```

### 应用场景

```
1. 大数据列表
   ✅ 聊天记录
   ✅ 日志查看
   ✅ 商品列表
   ✅ 数据表格

2. 图片网格
   ✅ 相册
   ✅ 商品展示
   ✅ 瀑布流

3. 复杂数据
   ✅ 动态高度
   ✅ 嵌套列表
   ✅ 可展开项
```

虚拟列表是处理大数据列表的最佳方案，合理使用能显著提升应用性能。

