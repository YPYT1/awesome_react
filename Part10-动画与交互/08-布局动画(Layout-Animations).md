# 布局动画(Layout Animations)

## 概述

布局动画是Framer Motion最强大的功能之一,它可以自动在DOM元素的布局变化之间创建平滑的过渡效果。本文将深入讲解布局动画的原理、用法、高级技巧以及实战应用,帮助你创建专业级的布局过渡效果。

## 布局动画基础

### layout属性

```tsx
import { motion } from 'framer-motion';

function BasicLayoutAnimation() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 300 : 200,
        height: isExpanded ? 200 : 100,
        backgroundColor: '#3b82f6',
      }}
    >
      Click to expand
    </motion.div>
  );
}
```

### 自动动画化属性

```tsx
function AutoAnimate() {
  const [isLarge, setIsLarge] = useState(false);
  
  return (
    <motion.div
      layout
      onClick={() => setIsLarge(!isLarge)}
      className={isLarge ? 'large-box' : 'small-box'}
    >
      Auto Animate
    </motion.div>
  );
}
```

```css
.small-box {
  width: 100px;
  height: 100px;
  background-color: #3b82f6;
  border-radius: 4px;
}

.large-box {
  width: 200px;
  height: 200px;
  background-color: #8b5cf6;
  border-radius: 50%;
}
```

### layoutId共享

```tsx
function SharedLayoutId() {
  const [selected, setSelected] = useState<number | null>(null);
  
  return (
    <div className="container">
      <div className="grid">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`item-${item.id}`}
            onClick={() => setSelected(item.id)}
          >
            {item.title}
          </motion.div>
        ))}
      </div>
      
      {selected && (
        <motion.div
          layoutId={`item-${selected}`}
          onClick={() => setSelected(null)}
          className="expanded"
        >
          <h2>{items.find(i => i.id === selected)?.title}</h2>
          <p>Expanded content...</p>
        </motion.div>
      )}
    </div>
  );
}
```

## 布局组

### LayoutGroup组件

```tsx
import { LayoutGroup } from 'framer-motion';

function GroupedLayout() {
  const [selected, setSelected] = useState(0);
  
  return (
    <LayoutGroup>
      <div className="tabs">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setSelected(index)}
            className={selected === index ? 'active' : ''}
          >
            {tab.label}
            {selected === index && (
              <motion.div
                layoutId="underline"
                className="underline"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
      
      <motion.div layout className="content">
        {tabs[selected].content}
      </motion.div>
    </LayoutGroup>
  );
}
```

### 跨组件共享布局

```tsx
function CrossComponentLayout() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  return (
    <LayoutGroup>
      <div className="controls">
        <button onClick={() => setView('grid')}>Grid</button>
        <button onClick={() => setView('list')}>List</button>
      </div>
      
      {view === 'grid' ? <GridView /> : <ListView />}
    </LayoutGroup>
  );
}

function GridView() {
  return (
    <div className="grid">
      {items.map((item) => (
        <motion.div key={item.id} layoutId={`item-${item.id}`} layout>
          <img src={item.image} />
          <h3>{item.title}</h3>
        </motion.div>
      ))}
    </div>
  );
}

function ListView() {
  return (
    <div className="list">
      {items.map((item) => (
        <motion.div key={item.id} layoutId={`item-${item.id}`} layout>
          <img src={item.image} />
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

## 高级布局技巧

### layout="position"

```tsx
function PositionLayout() {
  const [items, setItems] = useState([1, 2, 3, 4]);
  
  const shuffle = () => {
    setItems([...items].sort(() => Math.random() - 0.5));
  };
  
  return (
    <>
      <button onClick={shuffle}>Shuffle</button>
      
      <div className="grid">
        {items.map((item) => (
          <motion.div
            key={item}
            layout="position"  // 只动画化位置变化
          >
            Item {item}
          </motion.div>
        ))}
      </div>
    </>
  );
}
```

### layout="size"

```tsx
function SizeLayout() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout="size"  // 只动画化尺寸变化
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 300 : 200,
        height: isExpanded ? 200 : 100,
      }}
    >
      Size Animation Only
    </motion.div>
  );
}
```

### layout="preserve-aspect"

```tsx
function PreserveAspectLayout() {
  const [size, setSize] = useState(100);
  
  return (
    <motion.div
      layout="preserve-aspect"
      style={{
        width: size,
        height: size,
        aspectRatio: '1',
      }}
    >
      <img src="/image.jpg" alt="Preserved aspect" />
    </motion.div>
  );
}
```

## 布局动画配置

### transition配置

```tsx
function LayoutTransition() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 300 : 200,
        height: isExpanded ? 200 : 100,
      }}
    >
      Custom Layout Transition
    </motion.div>
  );
}
```

### layoutDependency

```tsx
function LayoutDependency() {
  const [items, setItems] = useState([1, 2, 3]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const sortedItems = items.sort((a, b) =>
    sortOrder === 'asc' ? a - b : b - a
  );
  
  return (
    <>
      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
        Toggle Sort
      </button>
      
      <div className="list">
        {sortedItems.map((item) => (
          <motion.div
            key={item}
            layout
            layoutDependency={sortOrder}  // 重新触发布局动画
          >
            Item {item}
          </motion.div>
        ))}
      </div>
    </>
  );
}
```

## 实战案例

### 1. 图片网格

```tsx
interface Image {
  id: number;
  url: string;
  title: string;
}

function ImageGrid() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [images] = useState<Image[]>([
    { id: 1, url: '/img1.jpg', title: 'Image 1' },
    { id: 2, url: '/img2.jpg', title: 'Image 2' },
    // ...
  ]);
  
  return (
    <LayoutGroup>
      <div className="image-grid">
        {images.map((image) => (
          <motion.div
            key={image.id}
            layoutId={`image-${image.id}`}
            onClick={() => setSelectedId(image.id)}
            className="grid-item"
          >
            <motion.img
              src={image.url}
              alt={image.title}
              layoutId={`image-img-${image.id}`}
            />
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {selectedId && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`image-${selectedId}`}
              className="lightbox"
            >
              <motion.img
                src={images.find(i => i.id === selectedId)?.url}
                layoutId={`image-img-${selectedId}`}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="lightbox-info"
              >
                <h2>{images.find(i => i.id === selectedId)?.title}</h2>
                <p>Click anywhere to close</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
```

### 2. 可展开卡片

```tsx
interface Card {
  id: number;
  title: string;
  summary: string;
  content: string;
}

function ExpandableCards() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const cards: Card[] = [
    { id: 1, title: 'Card 1', summary: 'Summary 1', content: 'Full content 1' },
    { id: 2, title: 'Card 2', summary: 'Summary 2', content: 'Full content 2' },
    { id: 3, title: 'Card 3', summary: 'Summary 3', content: 'Full content 3' },
  ];
  
  return (
    <div className="cards-container">
      {cards.map((card) => (
        <motion.div
          key={card.id}
          layout
          onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}
          className={`card ${expandedId === card.id ? 'expanded' : ''}`}
          transition={{
            layout: {
              type: "spring",
              stiffness: 400,
              damping: 30,
            },
          }}
        >
          <motion.h2 layout="position">{card.title}</motion.h2>
          
          <motion.p layout="position" className="summary">
            {card.summary}
          </motion.p>
          
          {expandedId === card.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="content"
            >
              <p>{card.content}</p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
```

### 3. 动态表单

```tsx
function DynamicForm() {
  const [fields, setFields] = useState([
    { id: 1, type: 'text', label: 'Name' },
  ]);
  
  const addField = (type: string) => {
    const newField = {
      id: Date.now(),
      type,
      label: `New ${type} field`,
    };
    setFields([...fields, newField]);
  };
  
  const removeField = (id: number) => {
    setFields(fields.filter(f => f.id !== id));
  };
  
  return (
    <div className="dynamic-form">
      <div className="add-buttons">
        <button onClick={() => addField('text')}>Add Text</button>
        <button onClick={() => addField('email')}>Add Email</button>
        <button onClick={() => addField('textarea')}>Add Textarea</button>
      </div>
      
      <LayoutGroup>
        <motion.form layout>
          <AnimatePresence>
            {fields.map((field) => (
              <motion.div
                key={field.id}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{
                  layout: { type: "spring", stiffness: 400, damping: 30 },
                }}
                className="form-field"
              >
                <motion.label layout="position">
                  {field.label}
                </motion.label>
                
                {field.type === 'textarea' ? (
                  <motion.textarea layout />
                ) : (
                  <motion.input layout type={field.type} />
                )}
                
                <motion.button
                  layout="position"
                  onClick={() => removeField(field.id)}
                  type="button"
                >
                  Remove
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.form>
      </LayoutGroup>
    </div>
  );
}
```

### 4. 拖拽排序列表

```tsx
function DragReorderList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
    { id: 4, text: 'Item 4' },
  ]);
  
  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
  };
  
  return (
    <div className="reorder-list">
      {items.map((item, index) => (
        <DraggableListItem
          key={item.id}
          item={item}
          index={index}
          moveItem={moveItem}
        />
      ))}
    </div>
  );
}

function DraggableListItem({ item, index, moveItem }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  
  return (
    <motion.div
      layout
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      style={{ y }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        
        const offset = Math.round(info.offset.y / 60);
        if (offset !== 0) {
          moveItem(index, Math.max(0, index + offset));
        }
      }}
      whileDrag={{ scale: 1.05, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
      className={`list-item ${isDragging ? 'dragging' : ''}`}
    >
      <span className="drag-handle">☰</span>
      <span>{item.text}</span>
    </motion.div>
  );
}
```

### 5. 响应式网格

```tsx
function ResponsiveGrid() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [itemsPerRow, setItemsPerRow] = useState(3);
  
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }));
  
  return (
    <div className="responsive-grid-container">
      <div className="controls">
        <button onClick={() => setView('grid')}>Grid</button>
        <button onClick={() => setView('list')}>List</button>
        
        {view === 'grid' && (
          <select
            value={itemsPerRow}
            onChange={(e) => setItemsPerRow(Number(e.target.value))}
          >
            <option value={2}>2 per row</option>
            <option value={3}>3 per row</option>
            <option value={4}>4 per row</option>
          </select>
        )}
      </div>
      
      <LayoutGroup>
        <motion.div
          layout
          className={view}
          style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid'
              ? `repeat(${itemsPerRow}, 1fr)`
              : '1fr',
            gap: '16px',
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              layoutId={`item-${item.id}`}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                },
              }}
              className="grid-item"
            >
              <motion.h3 layout="position">{item.title}</motion.h3>
              
              {view === 'list' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout="position"
                >
                  {item.description}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
```

### 6. 搜索结果过滤

```tsx
function FilteredResults() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const allItems = [
    { id: 1, title: 'Apple', category: 'fruit' },
    { id: 2, title: 'Banana', category: 'fruit' },
    { id: 3, title: 'Carrot', category: 'vegetable' },
    { id: 4, title: 'Broccoli', category: 'vegetable' },
  ];
  
  const filteredItems = allItems.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  return (
    <div className="filtered-results">
      <div className="filters">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="fruit">Fruits</option>
          <option value="vegetable">Vegetables</option>
        </select>
      </div>
      
      <LayoutGroup>
        <motion.div layout className="results">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                layoutId={`item-${item.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  },
                }}
                className="result-item"
              >
                <h3>{item.title}</h3>
                <span className="category">{item.category}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
```

## 性能优化

### 避免布局抖动

```tsx
// ✅ 使用layout动画
function OptimizedLayout() {
  return (
    <motion.div layout>
      Content
    </motion.div>
  );
}

// ❌ 手动动画化位置
function UnoptimizedLayout() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  return (
    <motion.div animate={position}>
      Content
    </motion.div>
  );
}
```

### 限制布局范围

```tsx
function LimitedLayoutScope() {
  return (
    <div className="container">
      <LayoutGroup>
        <motion.div layout>
          Only this section animates layout changes
        </motion.div>
      </LayoutGroup>
      
      <div>
        This section is not affected
      </div>
    </div>
  );
}
```

### 使用layoutDependency优化

```tsx
function OptimizedLayoutDependency() {
  const [items, setItems] = useState([1, 2, 3]);
  const [sortKey, setSortKey] = useState('id');
  
  return (
    <motion.div layout layoutDependency={sortKey}>
      {items.map(item => (
        <motion.div key={item} layout>
          Item {item}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## 调试技巧

### 可视化布局变化

```tsx
function DebugLayout() {
  return (
    <motion.div
      layout
      onLayoutAnimationStart={() => console.log('Layout animation started')}
      onLayoutAnimationComplete={() => console.log('Layout animation completed')}
      style={{ outline: '2px solid red' }}  // 可视化边界
    >
      Debug Element
    </motion.div>
  );
}
```

### 测量布局性能

```tsx
function MeasureLayoutPerformance() {
  const startTime = useRef(0);
  
  return (
    <motion.div
      layout
      onLayoutAnimationStart={() => {
        startTime.current = performance.now();
      }}
      onLayoutAnimationComplete={() => {
        const duration = performance.now() - startTime.current;
        console.log(`Layout animation took ${duration}ms`);
      }}
    >
      Measured Element
    </motion.div>
  );
}
```

## 最佳实践总结

### 性能优化清单

```
✅ 使用layout属性而非手动动画
✅ 使用LayoutGroup限制范围
✅ 合理使用layoutId避免冲突
✅ 为大列表使用虚拟滚动
✅ 避免嵌套过多layout元素
✅ 测试不同设备性能
```

### 用户体验准则

```
✅ 保持布局动画流畅自然
✅ 使用适当的spring配置
✅ 为重要变化提供视觉反馈
✅ 避免过度使用布局动画
✅ 测试不同屏幕尺寸
```

### 可访问性要求

```
✅ 支持prefers-reduced-motion
✅ 确保布局变化不影响可读性
✅ 提供跳过动画选项
✅ 测试屏幕阅读器兼容性
✅ 确保键盘导航正常
```

布局动画是Framer Motion的杀手锏功能。通过掌握layout属性和相关技巧,你可以创建令人惊叹的界面过渡效果,大幅提升应用的专业度和用户体验。

