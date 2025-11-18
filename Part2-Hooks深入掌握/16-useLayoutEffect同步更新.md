# useLayoutEffect同步更新

## 学习目标

通过本章学习，你将全面掌握：

- useLayoutEffect的概念和原理
- useLayoutEffect vs useEffect的区别
- 执行时机的详细对比
- useLayoutEffect的使用场景
- DOM测量和同步更新
- 避免闪烁的技巧
- 性能考虑和最佳实践
- 动画和过渡效果
- 布局计算与响应式设计
- React 19中的最佳实践
- TypeScript集成
- 与第三方库的配合

## 第一部分：useLayoutEffect基础

### 1.1 什么是useLayoutEffect

useLayoutEffect与useEffect功能相同，但在所有DOM变更之后同步调用，在浏览器绘制之前执行。

```jsx
import { useEffect, useLayoutEffect, useState } from 'react';

function BasicComparison() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('3. useEffect执行（在浏览器绘制后）');
  });
  
  useLayoutEffect(() => {
    console.log('2. useLayoutEffect执行（在浏览器绘制前）');
  });
  
  console.log('1. 组件渲染');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
  
  // 执行顺序：
  // 1. 组件渲染（生成虚拟DOM）
  // 2. React更新真实DOM
  // 3. useLayoutEffect执行（同步，阻塞）
  // 4. 浏览器绘制到屏幕
  // 5. useEffect执行（异步，不阻塞）
}
```

### 1.2 useEffect vs useLayoutEffect

```jsx
function DetailedComparison() {
  const [value, setValue] = useState(0);
  
  // useEffect：异步执行（不阻塞绘制）
  useEffect(() => {
    // 在浏览器绘制后执行
    console.log('useEffect - 值:', value);
    
    // 适合：
    // - 数据获取
    // - 订阅事件
    // - 日志记录
    // - 不影响布局的操作
    // - 大多数副作用
  }, [value]);
  
  // useLayoutEffect：同步执行（阻塞绘制）
  useLayoutEffect(() => {
    // 在浏览器绘制前执行
    console.log('useLayoutEffect - 值:', value);
    
    // 适合：
    // - DOM测量
    // - 布局计算
    // - 避免闪烁
    // - 需要同步读取/修改DOM的操作
    // - 动画初始化
  }, [value]);
  
  return (
    <div>
      <p>Value: {value}</p>
      <button onClick={() => setValue(v => v + 1)}>增加</button>
    </div>
  );
}
```

### 1.3 生命周期对比图

```jsx
/**
 * React组件更新流程：
 * 
 * 1. 触发更新（setState、props变化等）
 *    ↓
 * 2. React调用组件函数，生成虚拟DOM
 *    ↓
 * 3. React比较虚拟DOM（Reconciliation）
 *    ↓
 * 4. React更新真实DOM（Commit Phase）
 *    ↓
 * 5. **useLayoutEffect执行**（同步，阻塞）
 *    ↓
 * 6. 浏览器绘制（Paint）
 *    ↓
 * 7. **useEffect执行**（异步，不阻塞）
 * 
 * 关键区别：
 * - useLayoutEffect在绘制前执行，可以同步修改DOM
 * - useEffect在绘制后执行，修改DOM会导致第二次绘制
 */

function LifecycleDemo() {
  const [step, setStep] = useState(0);
  
  useLayoutEffect(() => {
    console.log(`useLayoutEffect - step ${step}`);
    // 此时DOM已更新，但还未绘制
  }, [step]);
  
  useEffect(() => {
    console.log(`useEffect - step ${step}`);
    // 此时DOM已更新并已绘制
  }, [step]);
  
  return (
    <div>
      <p>Current step: {step}</p>
      <button onClick={() => setStep(s => s + 1)}>下一步</button>
    </div>
  );
}
```

### 1.4 闪烁问题详细演示

```jsx
// ❌ 使用useEffect：会闪烁
function FlickerWithUseEffect() {
  const [position, setPosition] = useState(0);
  const boxRef = useRef(null);
  
  useEffect(() => {
    // 1. 浏览器先绘制position=0的位置（左侧）
    // 2. 然后这里计算新位置
    const newPosition = calculatePosition(boxRef.current);
    // 3. 更新state
    setPosition(newPosition);
    // 4. 再次绘制新位置（右侧）
    // 用户会看到从左到右的闪烁
  }, []);
  
  return (
    <div
      ref={boxRef}
      style={{
        transform: `translateX(${position}px)`,
        background: '#e74c3c',
        padding: '20px'
      }}
    >
      使用useEffect（会闪烁）
    </div>
  );
}

// ✅ 使用useLayoutEffect：无闪烁
function NoFlickerWithLayoutEffect() {
  const [position, setPosition] = useState(0);
  const boxRef = useRef(null);
  
  useLayoutEffect(() => {
    // 1. DOM已更新，但还未绘制
    // 2. 计算新位置
    const newPosition = calculatePosition(boxRef.current);
    // 3. 更新state
    setPosition(newPosition);
    // 4. 浏览器直接绘制最终位置
    // 用户只看到最终结果，无闪烁
  }, []);
  
  return (
    <div
      ref={boxRef}
      style={{
        transform: `translateX(${position}px)`,
        background: '#2ecc71',
        padding: '20px'
      }}
    >
      使用useLayoutEffect（无闪烁）
    </div>
  );
}

function calculatePosition(element) {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  return window.innerWidth - rect.width - 20;
}

// 对比组件
function FlickerComparison() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>闪烁对比</h2>
      <p>刷新页面观察区别</p>
      
      <div style={{ marginBottom: '20px' }}>
        <FlickerWithUseEffect />
      </div>
      
      <div>
        <NoFlickerWithLayoutEffect />
      </div>
    </div>
  );
}
```

## 第二部分：DOM测量

### 2.1 测量元素尺寸

```jsx
function MeasureElement({ children }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    // 在绘制前测量并设置尺寸
    const updateDimensions = () => {
      if (elementRef.current) {
        const { width, height } = elementRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return (
    <div>
      <div
        ref={elementRef}
        style={{
          padding: '20px',
          background: '#f0f0f0',
          borderRadius: '8px'
        }}
      >
        {children}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        <p>宽度: {dimensions.width.toFixed(2)}px</p>
        <p>高度: {dimensions.height.toFixed(2)}px</p>
        <p>面积: {(dimensions.width * dimensions.height).toFixed(2)}px²</p>
      </div>
    </div>
  );
}

// 使用
function App() {
  return (
    <MeasureElement>
      <h3>标题</h3>
      <p>这是一段文本内容</p>
      <button>按钮</button>
    </MeasureElement>
  );
}
```

### 2.2 自适应Tooltip

```jsx
function SmartTooltip({ children, content, preferredPosition = 'top' }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(preferredPosition);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) {
      return;
    }
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let finalPosition = preferredPosition;
    let top = 0;
    let left = 0;
    
    // 尝试首选位置
    switch (preferredPosition) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 10;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        
        // 如果顶部空间不足，切换到底部
        if (top < 0) {
          finalPosition = 'bottom';
          top = triggerRect.bottom + 10;
        }
        break;
      
      case 'bottom':
        top = triggerRect.bottom + 10;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        
        // 如果底部空间不足，切换到顶部
        if (top + tooltipRect.height > viewportHeight) {
          finalPosition = 'top';
          top = triggerRect.top - tooltipRect.height - 10;
        }
        break;
      
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 10;
        
        // 如果左侧空间不足，切换到右侧
        if (left < 0) {
          finalPosition = 'right';
          left = triggerRect.right + 10;
        }
        break;
      
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 10;
        
        // 如果右侧空间不足，切换到左侧
        if (left + tooltipRect.width > viewportWidth) {
          finalPosition = 'left';
          left = triggerRect.left - tooltipRect.width - 10;
        }
        break;
    }
    
    // 确保不超出视口
    left = Math.max(10, Math.min(left, viewportWidth - tooltipRect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - tooltipRect.height - 10));
    
    setPosition({ top, left });
    setActualPosition(finalPosition);
  }, [visible, preferredPosition]);
  
  return (
    <div className="tooltip-container">
      <div
        ref={triggerRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="tooltip-trigger"
      >
        {children}
      </div>
      
      {visible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${actualPosition}`}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            background: '#333',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {content}
          <div className={`tooltip-arrow arrow-${actualPosition}`} />
        </div>
      )}
    </div>
  );
}

// 使用
function TooltipDemo() {
  return (
    <div style={{ padding: '100px' }}>
      <SmartTooltip content="这是一个智能Tooltip" preferredPosition="top">
        <button>悬停查看Tooltip</button>
      </SmartTooltip>
    </div>
  );
}
```

### 2.3 响应式网格布局

```jsx
function ResponsiveGrid({ items, minColumnWidth = 200 }) {
  const [columns, setColumns] = useState(1);
  const gridRef = useRef(null);
  
  useLayoutEffect(() => {
    const updateColumns = () => {
      if (gridRef.current) {
        const containerWidth = gridRef.current.offsetWidth;
        const newColumns = Math.max(1, Math.floor(containerWidth / minColumnWidth));
        setColumns(newColumns);
      }
    };
    
    updateColumns();
    
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [minColumnWidth]);
  
  return (
    <div
      ref={gridRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        padding: '16px'
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            background: '#f0f0f0',
            padding: '20px',
            borderRadius: '8px'
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

// 使用
function GridDemo() {
  const items = Array.from({ length: 20 }, (_, i) => `项目 ${i + 1}`);
  
  return (
    <div>
      <h2>响应式网格</h2>
      <ResponsiveGrid items={items} minColumnWidth={250} />
    </div>
  );
}
```

## 第三部分：避免闪烁

### 3.1 文本截断

```jsx
function TruncatedText({ text, maxLines = 2 }) {
  const [truncated, setTruncated] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const textRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!textRef.current) return;
    
    const element = textRef.current;
    const computedStyle = getComputedStyle(element);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const maxHeight = lineHeight * maxLines;
    
    setTruncated(element.scrollHeight > maxHeight);
  }, [text, maxLines]);
  
  return (
    <div className="truncated-text">
      <div
        ref={textRef}
        style={{
          maxHeight: showFull ? 'none' : `${maxLines * 1.5}em`,
          overflow: 'hidden',
          lineHeight: '1.5em'
        }}
      >
        {text}
      </div>
      
      {truncated && (
        <button
          onClick={() => setShowFull(!showFull)}
          style={{
            marginTop: '8px',
            color: '#007bff',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {showFull ? '收起' : '展开'}
        </button>
      )}
    </div>
  );
}

// 使用
function TextDemo() {
  const longText = `
    React是一个用于构建用户界面的JavaScript库。
    它由Facebook开发和维护，是目前最流行的前端框架之一。
    React采用声明式编程范式，使得创建交互式UI变得简单。
    通过组件化的思想，React让代码更易于维护和复用。
    虚拟DOM技术使得React性能出色，能够高效地更新用户界面。
  `;
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>文本截断示例</h2>
      <TruncatedText text={longText} maxLines={3} />
    </div>
  );
}
```

### 3.2 模态框居中定位

```jsx
function CenteredModal({ isOpen, onClose, children }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const modalRef = useRef(null);
  
  useLayoutEffect(() => {
    if (isOpen && modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      
      setPosition({
        top: (window.innerHeight - rect.height) / 2,
        left: (window.innerWidth - rect.width) / 2
      });
    }
  }, [isOpen, children]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000
      }}
    >
      <div
        ref={modalRef}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {children}
        
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '8px 16px'
          }}
        >
          关闭
        </button>
      </div>
    </div>
  );
}

// 使用
function ModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开模态框</button>
      
      <CenteredModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>模态框标题</h2>
        <p>这是模态框内容</p>
        <p>模态框会自动居中显示</p>
      </CenteredModal>
    </div>
  );
}
```

### 3.3 动态高度过渡

```jsx
function ExpandableSection({ title, children, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);
  
  useLayoutEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(expanded ? contentHeight : 0);
    }
  }, [expanded, children]);
  
  return (
    <div className="expandable-section">
      <button
        onClick={() => setExpanded(!expanded)}
        className="section-header"
        style={{
          width: '100%',
          padding: '12px',
          background: '#f5f5f5',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{title}</span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▼
        </span>
      </button>
      
      <div
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          transition: 'height 0.3s ease-in-out'
        }}
      >
        <div ref={contentRef} style={{ padding: '12px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// 使用
function AccordionDemo() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>手风琴组件</h2>
      
      <ExpandableSection title="什么是React？">
        <p>React是一个用于构建用户界面的JavaScript库。</p>
        <p>它由Facebook开发，采用组件化和声明式编程。</p>
      </ExpandableSection>
      
      <ExpandableSection title="为什么使用React？">
        <p>React有以下优势：</p>
        <ul>
          <li>组件化开发</li>
          <li>虚拟DOM提升性能</li>
          <li>丰富的生态系统</li>
          <li>强大的社区支持</li>
        </ul>
      </ExpandableSection>
      
      <ExpandableSection title="如何学习React？" defaultExpanded>
        <p>学习React的步骤：</p>
        <ol>
          <li>掌握JavaScript基础</li>
          <li>学习JSX语法</li>
          <li>理解组件和Props</li>
          <li>掌握Hooks</li>
          <li>实践项目</li>
        </ol>
      </ExpandableSection>
    </div>
  );
}
```

## 第四部分：动画和过渡

### 4.1 滚动动画

```jsx
function ScrollAnimation({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [offset, setOffset] = useState(50);
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.8) {
          setIsVisible(true);
          setOffset(0);
        } else {
          setIsVisible(false);
          setOffset(50);
        }
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div
      ref={elementRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${offset}px)`,
        transition: 'opacity 0.6s, transform 0.6s'
      }}
    >
      {children}
    </div>
  );
}

// 使用
function ScrollDemo() {
  return (
    <div>
      <div style={{ height: '100vh', padding: '20px' }}>
        <h1>向下滚动查看动画</h1>
      </div>
      
      <ScrollAnimation>
        <div style={{ padding: '40px', background: '#f0f0f0' }}>
          <h2>内容1</h2>
          <p>滚动到此处时会有淡入动画</p>
        </div>
      </ScrollAnimation>
      
      <ScrollAnimation>
        <div style={{ padding: '40px', background: '#e0e0e0' }}>
          <h2>内容2</h2>
          <p>每个元素独立动画</p>
        </div>
      </ScrollAnimation>
      
      <ScrollAnimation>
        <div style={{ padding: '40px', background: '#d0d0d0' }}>
          <h2>内容3</h2>
          <p>继续滚动查看更多</p>
        </div>
      </ScrollAnimation>
    </div>
  );
}
```

### 4.2 拖拽位置同步

```jsx
function DraggableElement() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setPosition({
        x: position.x + deltaX,
        y: position.y + deltaY
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        padding: '20px',
        background: '#007bff',
        color: 'white',
        borderRadius: '8px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      拖动我
    </div>
  );
}
```

## 第五部分：复杂布局计算

### 5.1 自适应下拉菜单

```jsx
function AdaptiveDropdown({ trigger, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [direction, setDirection] = useState('down');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current || !menuRef.current) {
      return;
    }
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // 判断下方是否有足够空间
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    
    let top;
    let newDirection;
    
    if (spaceBelow >= menuRect.height) {
      // 下方有空间，向下展开
      top = triggerRect.bottom;
      newDirection = 'down';
    } else if (spaceAbove >= menuRect.height) {
      // 上方有空间，向上展开
      top = triggerRect.top - menuRect.height;
      newDirection = 'up';
    } else {
      // 两边都不够，选择空间较大的一侧
      if (spaceBelow > spaceAbove) {
        top = triggerRect.bottom;
        newDirection = 'down';
      } else {
        top = triggerRect.top - menuRect.height;
        newDirection = 'up';
      }
    }
    
    setPosition({
      top,
      left: triggerRect.left
    });
    setDirection(newDirection);
  }, [isOpen]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(e.target) &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  return (
    <div className="dropdown">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={menuRef}
          className={`dropdown-menu direction-${direction}`}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '150px'
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 使用
function DropdownDemo() {
  return (
    <div style={{ padding: '100px' }}>
      <AdaptiveDropdown
        trigger={<button>打开菜单</button>}
        items={[
          { label: '选项1', onClick: () => console.log('选项1') },
          { label: '选项2', onClick: () => console.log('选项2') },
          { label: '选项3', onClick: () => console.log('选项3') }
        ]}
      />
    </div>
  );
}
```

### 5.2 虚拟滚动优化

```jsx
function VirtualList({ items, itemHeight = 50, containerHeight = 400 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );
    
    setVisibleRange({ start: startIndex, end: endIndex });
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return (
    <div
      ref={containerRef}
      className="virtual-list"
      onScroll={handleScroll}
      style={{
        height: `${containerHeight}px`,
        overflow: 'auto',
        border: '1px solid #ddd'
      }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: `${offsetY}px`,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{
                height: `${itemHeight}px`,
                padding: '10px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              项目 #{visibleRange.start + index + 1}: {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 使用
function VirtualListDemo() {
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>虚拟滚动列表（10,000项）</h2>
      <VirtualList items={items} itemHeight={50} containerHeight={400} />
    </div>
  );
}
```

## 第六部分：与第三方库集成

### 6.1 集成Canvas库

```jsx
import { useRef, useLayoutEffect, useState } from 'react';

function CanvasChart({ data }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // 设置canvas实际尺寸
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    setDimensions({ width: rect.width, height: rect.height });
  }, []);
  
  useLayoutEffect(() => {
    if (!canvasRef.current || !dimensions.width) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // 绘制图表
    drawChart(ctx, data, dimensions);
  }, [data, dimensions]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '300px',
        border: '1px solid #ddd'
      }}
    />
  );
}

function drawChart(ctx, data, dimensions) {
  const { width, height } = dimensions;
  const barWidth = width / data.length;
  const maxValue = Math.max(...data);
  
  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * height * 0.8;
    const x = index * barWidth;
    const y = height - barHeight;
    
    ctx.fillStyle = '#007bff';
    ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
    
    // 绘制数值
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(value, x + barWidth / 2, y - 5);
  });
}

// 使用
function ChartDemo() {
  const [data, setData] = useState([10, 25, 15, 30, 20, 35, 28]);
  
  const randomizeData = () => {
    setData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10));
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Canvas图表</h2>
      <CanvasChart data={data} />
      <button onClick={randomizeData} style={{ marginTop: '10px' }}>
        随机数据
      </button>
    </div>
  );
}
```

### 6.2 集成动画库（GSAP）

```jsx
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

function GSAPAnimation({ children }) {
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!elementRef.current) return;
    
    // 在DOM更新后、绘制前初始化动画
    gsap.fromTo(
      elementRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);
  
  return (
    <div ref={elementRef}>
      {children}
    </div>
  );
}

// 复杂的序列动画
function SequenceAnimation({ items }) {
  const containerRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const elements = containerRef.current.children;
    
    gsap.fromTo(
      elements,
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out'
      }
    );
  }, [items]);
  
  return (
    <div ref={containerRef}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            padding: '12px',
            background: '#f0f0f0',
            marginBottom: '8px',
            borderRadius: '4px'
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

## 第七部分：性能优化

### 7.1 节流DOM测量

```jsx
function ThrottledMeasurement() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null);
  const measureTimeoutRef = useRef(null);
  
  useLayoutEffect(() => {
    const measure = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }
    };
    
    // 初始测量
    measure();
    
    const handleResize = () => {
      // 节流：等待100ms后再测量
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      
      measureTimeoutRef.current = setTimeout(measure, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div>
      <div
        ref={elementRef}
        style={{
          padding: '20px',
          background: '#f0f0f0',
          resize: 'both',
          overflow: 'auto',
          minWidth: '200px',
          minHeight: '100px'
        }}
      >
        调整窗口大小查看测量
      </div>
      
      <p>宽度: {size.width.toFixed(0)}px</p>
      <p>高度: {size.height.toFixed(0)}px</p>
    </div>
  );
}
```

### 7.2 使用ResizeObserver替代

```jsx
function ModernResizeDetection() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!elementRef.current) return;
    
    // 使用ResizeObserver更高效
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    
    resizeObserver.observe(elementRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  return (
    <div>
      <div
        ref={elementRef}
        contentEditable
        style={{
          padding: '20px',
          background: '#f0f0f0',
          minHeight: '100px',
          border: '2px dashed #ccc'
        }}
      >
        编辑这段文本，观察尺寸变化
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <p>宽度: {size.width.toFixed(2)}px</p>
        <p>高度: {size.height.toFixed(2)}px</p>
      </div>
    </div>
  );
}
```

## 第八部分：TypeScript集成

### 8.1 类型安全的useLayoutEffect

```typescript
import { useLayoutEffect, useRef, useState, RefObject } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

function useMeasure<T extends HTMLElement>(): [RefObject<T>, Dimensions] {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  
  useLayoutEffect(() => {
    if (!ref.current) return;
    
    const measure = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    measure();
    
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(ref.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  return [ref, dimensions];
}

// 使用
function TypedMeasureDemo() {
  const [ref, dimensions] = useMeasure<HTMLDivElement>();
  
  return (
    <div>
      <div
        ref={ref}
        style={{
          padding: '20px',
          background: '#f0f0f0',
          resize: 'both',
          overflow: 'auto'
        }}
      >
        调整大小
      </div>
      
      <p>尺寸: {dimensions.width}x{dimensions.height}</p>
    </div>
  );
}
```

### 8.2 类型化的Tooltip Hook

```typescript
interface Position {
  top: number;
  left: number;
}

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface UseTooltipOptions {
  preferredPlacement?: TooltipPlacement;
  offset?: number;
}

function useTooltip(options: UseTooltipOptions = {}) {
  const { preferredPlacement = 'top', offset = 10 } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>(preferredPlacement);
  
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) {
      return;
    }
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let placement = preferredPlacement;
    let pos: Position = { top: 0, left: 0 };
    
    // 计算位置逻辑...
    switch (preferredPlacement) {
      case 'top':
        pos.top = triggerRect.top - tooltipRect.height - offset;
        pos.left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        
        if (pos.top < 0) {
          placement = 'bottom';
          pos.top = triggerRect.bottom + offset;
        }
        break;
      
      // ... 其他方向
    }
    
    setPosition(pos);
    setActualPlacement(placement);
  }, [isVisible, preferredPlacement, offset]);
  
  return {
    triggerRef,
    tooltipRef,
    isVisible,
    position,
    actualPlacement,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(!isVisible)
  };
}
```

## 第九部分：高级应用

### 9.1 自适应表格列宽

```jsx
function AdaptiveTable({ columns, data }) {
  const [columnWidths, setColumnWidths] = useState([]);
  const tableRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!tableRef.current) return;
    
    const cells = tableRef.current.querySelectorAll('th');
    const widths = Array.from(cells).map(cell => cell.offsetWidth);
    
    setColumnWidths(widths);
  }, [columns, data]);
  
  return (
    <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th
              key={index}
              style={{
                width: columnWidths[index] || 'auto',
                padding: '12px',
                textAlign: 'left',
                borderBottom: '2px solid #ddd'
              }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col, colIndex) => (
              <td
                key={colIndex}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee'
                }}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 使用
function TableDemo() {
  const columns = [
    { key: 'name', header: '姓名' },
    { key: 'age', header: '年龄' },
    { key: 'email', header: '邮箱' }
  ];
  
  const data = [
    { name: '张三', age: 28, email: 'zhang@example.com' },
    { name: '李四', age: 32, email: 'li@example.com' },
    { name: '王五', age: 25, email: 'wang@example.com' }
  ];
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>自适应表格</h2>
      <AdaptiveTable columns={columns} data={data} />
    </div>
  );
}
```

### 9.2 粘性头部

```jsx
function StickyHeader({ children }) {
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const placeholderRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!headerRef.current) return;
    
    const height = headerRef.current.offsetHeight;
    setHeaderHeight(height);
  }, [children]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (placeholderRef.current) {
        const rect = placeholderRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <>
      <div ref={placeholderRef} style={{ height: isSticky ? `${headerHeight}px` : '0' }} />
      
      <div
        ref={headerRef}
        style={{
          position: isSticky ? 'fixed' : 'relative',
          top: isSticky ? '0' : 'auto',
          left: 0,
          right: 0,
          background: 'white',
          boxShadow: isSticky ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
          zIndex: 100,
          transition: 'box-shadow 0.3s'
        }}
      >
        {children}
      </div>
    </>
  );
}

// 使用
function StickyHeaderDemo() {
  return (
    <div>
      <div style={{ height: '100vh', background: '#f0f0f0', padding: '20px' }}>
        <h1>向下滚动</h1>
      </div>
      
      <StickyHeader>
        <div style={{ padding: '16px', background: '#007bff', color: 'white' }}>
          <h2>粘性头部</h2>
          <nav>
            <a href="#section1" style={{ color: 'white', marginRight: '16px' }}>Section 1</a>
            <a href="#section2" style={{ color: 'white', marginRight: '16px' }}>Section 2</a>
            <a href="#section3" style={{ color: 'white' }}>Section 3</a>
          </nav>
        </div>
      </StickyHeader>
      
      <div style={{ height: '200vh', padding: '20px' }}>
        <h2>内容区域</h2>
        <p>继续滚动，头部会保持固定</p>
      </div>
    </div>
  );
}
```

## 第十部分：React 19最佳实践

### 10.1 与Concurrent Features配合

```jsx
import { useLayoutEffect, useRef, useState, useTransition } from 'react';

function ConcurrentLayout() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isPending, startTransition] = useTransition();
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    if (!elementRef.current) return;
    
    const measure = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        
        // 使用transition标记非紧急更新
        startTransition(() => {
          setDimensions({
            width: rect.width,
            height: rect.height
          });
        });
      }
    };
    
    measure();
    
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  
  return (
    <div>
      <div
        ref={elementRef}
        style={{
          padding: '20px',
          background: isPending ? '#f0f0f0' : '#e0e0e0',
          transition: 'background 0.3s'
        }}
      >
        内容区域
      </div>
      
      <p>尺寸: {dimensions.width.toFixed(0)}x{dimensions.height.toFixed(0)}</p>
    </div>
  );
}
```

### 10.2 与Server Components配合

```jsx
// app/components/ClientMeasure.tsx
'use client';

import { useLayoutEffect, useRef, useState } from 'react';

export function ClientMeasure({ children }) {
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);
  
  useLayoutEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);
  
  return (
    <div>
      <div ref={contentRef}>
        {children}
      </div>
      <p className="meta">内容高度: {height}px</p>
    </div>
  );
}

// app/page.tsx
// Server Component
export default function Page() {
  return (
    <ClientMeasure>
      <h1>服务器渲染的内容</h1>
      <p>这些内容在服务器端生成</p>
      <p>但测量在客户端进行</p>
    </ClientMeasure>
  );
}
```

## 注意事项

### 1. 何时使用useLayoutEffect

```jsx
// ✅ 正确使用场景

// 1. DOM测量
function MeasureCase() {
  const ref = useRef(null);
  const [size, setSize] = useState(0);
  
  useLayoutEffect(() => {
    setSize(ref.current.offsetWidth);
  }, []);
  
  return <div ref={ref}>测量宽度</div>;
}

// 2. 避免视觉闪烁
function NoFlickerCase() {
  const [position, setPosition] = useState(0);
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    setPosition(calculatePosition(ref.current));
  }, []);
  
  return <div ref={ref} style={{ left: position }}>定位元素</div>;
}

// 3. 同步DOM操作
function SyncDOMCase() {
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    ref.current.scrollTop = 0; // 需要立即生效
  }, []);
  
  return <div ref={ref}>内容</div>;
}

// ❌ 不应该使用useLayoutEffect

// 1. 数据获取（会阻塞渲染）
function BadFetchCase() {
  useLayoutEffect(() => {
    fetch('/api/data'); // ❌ 使用useEffect
  }, []);
  
  return <div>Data</div>;
}

// 2. 订阅（不需要同步）
function BadSubscribeCase() {
  useLayoutEffect(() => {
    const subscription = subscribe(); // ❌ 使用useEffect
    return () => subscription.unsubscribe();
  }, []);
  
  return <div>Subscribed</div>;
}

// 3. 日志记录（不需要同步）
function BadLogCase() {
  useLayoutEffect(() => {
    console.log('Component mounted'); // ❌ 使用useEffect
  }, []);
  
  return <div>Component</div>;
}
```

### 2. 性能影响

```jsx
// ⚠️ useLayoutEffect是同步的，会阻塞渲染

function PerformanceWarning() {
  const [data, setData] = useState([]);
  
  useLayoutEffect(() => {
    // 这段代码会阻塞浏览器绘制
    // 如果计算很慢，用户会感到卡顿
    const processedData = expensiveCalculation(data);
    setData(processedData);
  }, [data]);
  
  return <div>{/* ... */}</div>;
}

// ✅ 如果不需要同步，使用useEffect
function BetterPerformance() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // 异步执行，不阻塞渲染
    const processedData = expensiveCalculation(data);
    setData(processedData);
  }, [data]);
  
  return <div>{/* ... */}</div>;
}

function expensiveCalculation(data) {
  // 耗时计算
  return data;
}
```

### 3. 服务器端渲染注意

```jsx
// useLayoutEffect在服务器端不执行
// 如果依赖useLayoutEffect设置关键状态，可能导致问题

// ❌ 潜在问题
function ServerIssue() {
  const [criticalValue, setCriticalValue] = useState(null);
  
  useLayoutEffect(() => {
    setCriticalValue(calculateValue());
  }, []);
  
  if (!criticalValue) {
    return <div>Loading...</div>;
  }
  
  return <div>{criticalValue}</div>;
  // 服务器端会渲染"Loading..."
  // 客户端hydrate后才显示实际值
  // 可能导致hydration mismatch
}

// ✅ 解决方案
function ServerSafe() {
  const [criticalValue, setCriticalValue] = useState(() => calculateValue());
  
  useLayoutEffect(() => {
    // 只在客户端调整
    const adjustedValue = adjustForClient(criticalValue);
    setCriticalValue(adjustedValue);
  }, []);
  
  return <div>{criticalValue}</div>;
}

function calculateValue() {
  return 'default value';
}

function adjustForClient(value) {
  return value;
}
```

### 4. 避免无限循环

```jsx
// ❌ 错误：导致无限循环
function InfiniteLoop() {
  const [count, setCount] = useState(0);
  
  useLayoutEffect(() => {
    setCount(count + 1); // 每次渲染都更新，导致无限循环
  });
  
  return <div>{count}</div>;
}

// ✅ 正确：提供依赖数组
function CorrectDependency() {
  const [count, setCount] = useState(0);
  
  useLayoutEffect(() => {
    // 只在mount时执行一次
    console.log('Mounted');
  }, []);
  
  return <div>{count}</div>;
}

// ✅ 正确：条件更新
function ConditionalUpdate() {
  const [count, setCount] = useState(0);
  const [size, setSize] = useState(0);
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    const newSize = ref.current.offsetWidth;
    
    // 只在值确实变化时更新
    if (newSize !== size) {
      setSize(newSize);
    }
  }, [count]); // 依赖count，不依赖size
  
  return (
    <div ref={ref}>
      <p>Count: {count}</p>
      <p>Size: {size}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

### 5. 清理函数

```jsx
function ProperCleanup() {
  const elementRef = useRef(null);
  
  useLayoutEffect(() => {
    const element = elementRef.current;
    
    // 设置样式
    element.style.opacity = '1';
    
    // 清理函数
    return () => {
      element.style.opacity = '0';
    };
  }, []);
  
  return <div ref={elementRef}>内容</div>;
}

// 监听器清理
function ListenerCleanup() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    // 必须清理监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <div>窗口: {size.width}x{size.height}</div>;
}
```

## 常见问题

### 1. useLayoutEffect会阻塞渲染吗？

会。useLayoutEffect是同步执行的，会阻塞浏览器绘制。

```jsx
function BlockingExample() {
  useLayoutEffect(() => {
    // 这段代码会阻塞浏览器绘制
    const start = Date.now();
    while (Date.now() - start < 1000) {
      // 模拟耗时操作，阻塞1秒
    }
    console.log('完成');
  }, []);
  
  return <div>内容要等1秒后才显示</div>;
}

// 对比：useEffect不会阻塞
function NonBlockingExample() {
  useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 1000) {
      // 耗时操作
    }
    console.log('完成');
  }, []);
  
  return <div>内容立即显示，计算在后台进行</div>;
}
```

### 2. 什么时候该用useLayoutEffect而不是useEffect？

当你需要在浏览器绘制前同步读取或修改DOM时。

```jsx
// 场景1：测量DOM后立即使用
function NeedLayoutEffect() {
  const [height, setHeight] = useState(0);
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    // 必须在绘制前获取高度
    setHeight(ref.current.offsetHeight);
  }, []);
  
  return (
    <div>
      <div ref={ref}>内容</div>
      <div style={{ height }}>匹配高度的元素</div>
    </div>
  );
}

// 场景2：避免闪烁
function AvoidFlicker() {
  const [position, setPosition] = useState(0);
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    // 必须在绘制前设置位置
    setPosition(calculatePosition(ref.current));
  }, []);
  
  return <div ref={ref} style={{ left: position }}>元素</div>;
}
```

### 3. useLayoutEffect在SSR中的行为？

useLayoutEffect在服务器端不执行，只在客户端执行。

```jsx
function SSRBehavior() {
  const [clientOnly, setClientOnly] = useState(false);
  
  useLayoutEffect(() => {
    // 服务器端不执行
    // 只在客户端执行
    setClientOnly(true);
    console.log('这只在客户端打印');
  }, []);
  
  return (
    <div>
      <p>服务器端: clientOnly = false</p>
      <p>客户端: clientOnly = {clientOnly.toString()}</p>
    </div>
  );
}

// ⚠️ 可能导致hydration警告
function HydrationWarning() {
  const [value, setValue] = useState('server');
  
  useLayoutEffect(() => {
    setValue('client'); // 改变初始值
  }, []);
  
  return <div>{value}</div>;
  // 服务器: "server"
  // 客户端第一次渲染: "server"
  // useLayoutEffect后: "client"
  // 可能有hydration警告
}
```

### 4. 如何调试useLayoutEffect？

```jsx
function DebugLayoutEffect() {
  const [count, setCount] = useState(0);
  
  useLayoutEffect(() => {
    console.log('[useLayoutEffect] 开始');
    console.log('[useLayoutEffect] count:', count);
    
    const start = performance.now();
    
    // 你的代码
    
    const end = performance.now();
    console.log('[useLayoutEffect] 耗时:', end - start, 'ms');
    
    return () => {
      console.log('[useLayoutEffect] 清理');
    };
  }, [count]);
  
  console.log('[Render] count:', count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

### 5. useLayoutEffect vs useEffect性能对比

```jsx
function PerformanceComparison() {
  const [useLayout, setUseLayout] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  
  // 根据选择使用不同的hook
  const effectHook = useLayout ? useLayoutEffect : useEffect;
  
  effectHook(() => {
    const start = performance.now();
    
    // 模拟DOM操作
    if (ref.current) {
      ref.current.style.background = count % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
    }
    
    const end = performance.now();
    console.log(`${useLayout ? 'useLayoutEffect' : 'useEffect'} 耗时:`, end - start);
  }, [count]);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>性能对比</h2>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={useLayout}
            onChange={(e) => setUseLayout(e.target.checked)}
          />
          使用 useLayoutEffect（否则使用useEffect）
        </label>
      </div>
      
      <div ref={ref} style={{ padding: '20px', marginTop: '10px' }}>
        Count: {count}
      </div>
      
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        打开控制台查看性能数据
      </div>
    </div>
  );
}
```

### 6. 在严格模式下的行为

```jsx
// React 18严格模式会double-invoke effects
function StrictModeWarning() {
  const [count, setCount] = useState(0);
  
  useLayoutEffect(() => {
    console.log('useLayoutEffect执行');
    
    // 在严格模式下，这会执行两次：
    // 1. 第一次执行
    // 2. 清理
    // 3. 第二次执行
    
    return () => {
      console.log('useLayoutEffect清理');
    };
  }, []);
  
  return <div>Count: {count}</div>;
}

// 确保代码能处理多次执行
function StrictModeSafe() {
  const ref = useRef(null);
  const initialized = useRef(false);
  
  useLayoutEffect(() => {
    if (initialized.current) return;
    
    // 只初始化一次
    initialized.current = true;
    setupDOM(ref.current);
    
    return () => {
      initialized.current = false;
    };
  }, []);
  
  return <div ref={ref}>Content</div>;
}

function setupDOM(element) {
  // DOM初始化逻辑
}
```

## 总结

### useLayoutEffect核心要点

1. **执行时机**
   - DOM更新后、浏览器绘制前
   - 同步执行，阻塞绘制
   - 在useEffect之前执行

2. **主要用途**
   - DOM测量（getBoundingClientRect等）
   - 避免视觉闪烁
   - 布局计算
   - 同步DOM操作
   - 动画初始化

3. **与useEffect对比**
   - useLayoutEffect: 同步、阻塞、绘制前
   - useEffect: 异步、不阻塞、绘制后
   - 默认使用useEffect
   - 只在必要时使用useLayoutEffect

4. **性能考虑**
   - 会阻塞渲染
   - 避免耗时操作
   - 使用节流优化
   - 考虑使用ResizeObserver

5. **最佳实践**
   - 只在需要同步DOM操作时使用
   - 避免在其中进行数据获取
   - 提供正确的依赖数组
   - 及时清理副作用
   - 注意SSR兼容性

6. **常见场景**
   - Tooltip位置计算
   - 模态框居中
   - 文本截断检测
   - 响应式布局
   - 虚拟滚动
   - 拖拽位置同步

7. **注意事项**
   - 不在服务器端执行
   - 严格模式下双重调用
   - 避免无限循环
   - 性能影响
   - Hydration一致性

通过本章学习，你已经全面掌握了useLayoutEffect的使用。记住核心原则：默认使用useEffect，只在需要同步DOM操作、避免闪烁时才使用useLayoutEffect。合理使用能让你的应用更流畅、用户体验更好！
