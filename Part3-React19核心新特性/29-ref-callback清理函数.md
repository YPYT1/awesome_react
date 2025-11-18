# ref callback清理函数

## 学习目标

通过本章学习，你将掌握：

- ref callback的清理机制
- 返回清理函数
- 清理时机
- 资源管理
- 内存泄漏防止
- 事件监听器清理
- 定时器清理
- 最佳实践

## 第一部分：传统ref callback的问题

### 1.1 无法自动清理

```jsx
// ❌ React 18：需要手动管理清理
function VideoPlayer() {
  const [player, setPlayer] = useState(null);
  
  const videoRef = useCallback((element) => {
    if (element) {
      // 挂载时：创建播放器
      const newPlayer = new VideoPlayer(element);
      setPlayer(newPlayer);
    } else {
      // 卸载时：清理播放器
      if (player) {
        player.destroy();
        setPlayer(null);
      }
    }
  }, [player]);  // 依赖player导致复杂性
  
  return <video ref={videoRef} />;
}

// 问题：
// 1. 需要额外状态管理
// 2. 依赖关系复杂
// 3. 容易遗漏清理
// 4. 代码不够清晰
```

### 1.2 useEffect的替代方案

```jsx
// ❌ 使用useEffect模拟清理
function Component() {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // 设置
    const observer = new ResizeObserver(() => {
      console.log('Size changed');
    });
    observer.observe(element);
    
    // 清理
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return <div ref={elementRef}>Content</div>;
}

// 问题：
// 1. 需要额外的useEffect
// 2. ref和清理逻辑分离
// 3. 时机可能不精确
```

## 第二部分：React 19的清理函数

### 2.1 返回清理函数

```jsx
// ✅ React 19：ref callback可以返回清理函数
function VideoPlayer() {
  const videoRef = (element) => {
    if (!element) return;
    
    // 设置：创建播放器
    const player = new VideoPlayer(element);
    player.initialize();
    
    // 返回清理函数
    return () => {
      player.destroy();
      console.log('Player cleaned up');
    };
  };
  
  return <video ref={videoRef} />;
}

// 优势：
// ✅ 清理逻辑与设置逻辑在一起
// ✅ 自动执行清理
// ✅ 无需额外状态
// ✅ 代码更清晰
```

### 2.2 清理时机

```jsx
'use client';

import { useState } from 'react';

function CleanupDemo() {
  const [show, setShow] = useState(true);
  
  const ref = (element) => {
    if (!element) return;
    
    console.log('Element mounted:', element);
    
    return () => {
      console.log('Cleanup called for:', element);
    };
  };
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>
        {show ? '卸载' : '挂载'}
      </button>
      
      {show && <div ref={ref}>Watch the console</div>}
    </div>
  );
}

// 清理函数会在以下情况调用：
// 1. 组件卸载时
// 2. ref被设置为新元素时
// 3. ref被设置为null时
```

### 2.3 条件清理

```jsx
// ✅ 可以条件返回清理函数
function ConditionalCleanup({ enableTracking }) {
  const ref = (element) => {
    if (!element) return;
    
    if (enableTracking) {
      // 启用追踪时才设置清理
      const tracker = trackElement(element);
      
      return () => {
        tracker.stop();
      };
    }
    
    // 不启用追踪时不返回清理函数
    return undefined;
  };
  
  return <div ref={ref}>Content</div>;
}
```

## 第三部分：事件监听器清理

### 3.1 DOM事件清理

```jsx
function ClickOutside({ onClickOutside, children }) {
  const ref = (element) => {
    if (!element) return;
    
    const handleClickOutside = (event) => {
      if (!element.contains(event.target)) {
        onClickOutside();
      }
    };
    
    // 添加事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    
    // 返回清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  };
  
  return <div ref={ref}>{children}</div>;
}

// 使用
function Dropdown() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setOpen(true)}>打开</button>
      
      {open && (
        <ClickOutside onClickOutside={() => setOpen(false)}>
          <div className="dropdown-menu">
            <p>下拉菜单内容</p>
          </div>
        </ClickOutside>
      )}
    </div>
  );
}
```

### 3.2 多个事件监听器

```jsx
function InteractiveElement() {
  const ref = (element) => {
    if (!element) return;
    
    const handleMouseEnter = () => console.log('Mouse enter');
    const handleMouseLeave = () => console.log('Mouse leave');
    const handleClick = () => console.log('Click');
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('click', handleClick);
    
    // 清理所有监听器
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('click', handleClick);
    };
  };
  
  return <div ref={ref}>交互元素</div>;
}
```

### 3.3 委托事件处理

```jsx
function DelegatedEvents() {
  const ref = (container) => {
    if (!container) return;
    
    const handleClick = (event) => {
      const button = event.target.closest('button');
      if (button) {
        console.log('Button clicked:', button.dataset.action);
      }
    };
    
    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('click', handleClick);
    };
  };
  
  return (
    <div ref={ref}>
      <button data-action="save">保存</button>
      <button data-action="cancel">取消</button>
      <button data-action="delete">删除</button>
    </div>
  );
}
```

## 第四部分：观察器清理

### 4.1 IntersectionObserver

```jsx
function LazyImage({ src, alt }) {
  const imgRef = (img) => {
    if (!img) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(img);
    
    return () => {
      observer.disconnect();
    };
  };
  
  return (
    <img
      ref={imgRef}
      alt={alt}
      data-src={src}
      style={{ minHeight: '200px', background: '#eee' }}
    />
  );
}
```

### 4.2 MutationObserver

```jsx
function DOMWatcher({ onMutation }) {
  const ref = (element) => {
    if (!element) return;
    
    const observer = new MutationObserver((mutations) => {
      onMutation(mutations);
    });
    
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    
    return () => {
      observer.disconnect();
    };
  };
  
  return <div ref={ref}>观察这个元素的变化</div>;
}
```

### 4.3 ResizeObserver

```jsx
function ResponsiveComponent() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  const ref = (element) => {
    if (!element) return;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  };
  
  return (
    <div ref={ref} style={{ resize: 'both', overflow: 'auto', border: '1px solid' }}>
      <p>宽度: {Math.round(size.width)}px</p>
      <p>高度: {Math.round(size.height)}px</p>
    </div>
  );
}
```

## 第五部分：定时器和动画清理

### 5.1 requestAnimationFrame

```jsx
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const spanRef = useRef(null);
  
  const ref = (element) => {
    if (!element) return;
    
    let animationId;
    let start = 0;
    const duration = 2000;
    
    const animate = (timestamp) => {
      if (start === 0) start = timestamp;
      const progress = timestamp - start;
      
      const current = Math.min(
        Math.floor((progress / duration) * target),
        target
      );
      
      setCount(current);
      
      if (current < target) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  };
  
  return <span ref={ref}>{count}</span>;
}
```

### 5.2 定时器清理

```jsx
function AutoRefresh({ interval = 5000, onRefresh }) {
  const ref = (element) => {
    if (!element) return;
    
    const timerId = setInterval(() => {
      onRefresh();
    }, interval);
    
    return () => {
      clearInterval(timerId);
    };
  };
  
  return (
    <div ref={ref}>
      自动刷新中...
    </div>
  );
}
```

### 5.3 防抖和节流

```jsx
function SearchInput({ onSearch }) {
  const ref = (input) => {
    if (!input) return;
    
    let timeoutId;
    
    const handleInput = (e) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onSearch(e.target.value);
      }, 300);
    };
    
    input.addEventListener('input', handleInput);
    
    return () => {
      clearTimeout(timeoutId);
      input.removeEventListener('input', handleInput);
    };
  };
  
  return <input ref={ref} type="search" placeholder="搜索..." />;
}
```

## 第六部分：第三方库集成

### 6.1 图表库

```jsx
function Chart({ data }) {
  const ref = (canvas) => {
    if (!canvas) return;
    
    // 创建Chart.js实例
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Dataset',
          data: data.values
        }]
      }
    });
    
    return () => {
      chart.destroy();
    };
  };
  
  return <canvas ref={ref} />;
}
```

### 6.2 编辑器

```jsx
function CodeEditor({ initialValue, onChange }) {
  const ref = (element) => {
    if (!element) return;
    
    // 创建Monaco Editor
    const editor = monaco.editor.create(element, {
      value: initialValue,
      language: 'javascript',
      theme: 'vs-dark'
    });
    
    // 监听变化
    const disposable = editor.onDidChangeModelContent(() => {
      onChange(editor.getValue());
    });
    
    return () => {
      disposable.dispose();
      editor.dispose();
    };
  };
  
  return <div ref={ref} style={{ height: '400px' }} />;
}
```

### 6.3 地图组件

```jsx
function Map({ center, zoom }) {
  const ref = (element) => {
    if (!element) return;
    
    // 创建Leaflet地图
    const map = L.map(element).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    return () => {
      map.remove();
    };
  };
  
  return <div ref={ref} style={{ height: '400px' }} />;
}
```

### 6.4 WebSocket连接

```jsx
function WebSocketComponent({ url }) {
  const [messages, setMessages] = useState([]);
  
  const ref = (element) => {
    if (!element) return;
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, event.data]);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      console.log('WebSocket disconnected');
    };
  };
  
  return (
    <div ref={ref}>
      <h3>Messages:</h3>
      {messages.map((msg, idx) => (
        <p key={idx}>{msg}</p>
      ))}
    </div>
  );
}
```

### 6.5 拖拽功能

```jsx
function DraggableElement() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const ref = (element) => {
    if (!element) return;
    
    let isDragging = false;
    let startX, startY;
    
    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.clientX - position.x;
      startY = e.clientY - position.y;
      element.style.cursor = 'grabbing';
    };
    
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      setPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      element.style.cursor = 'grab';
    };
    
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '100px',
        height: '100px',
        background: '#3b82f6',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        userSelect: 'none'
      }}
    >
      拖动我
    </div>
  );
}
```

### 6.6 滚动监听

```jsx
function ScrollSpy({ sections }) {
  const [activeSection, setActiveSection] = useState('');
  
  const ref = (container) => {
    if (!container) return;
    
    const handleScroll = () => {
      const scrollPosition = container.scrollTop + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    
    // 初始检查
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  };
  
  return (
    <div ref={ref} style={{ height: '400px', overflow: 'auto' }}>
      {sections.map(section => (
        <section
          key={section.id}
          id={section.id}
          style={{
            height: '300px',
            padding: '20px',
            background: activeSection === section.id ? '#e3f2fd' : '#f5f5f5',
            marginBottom: '10px'
          }}
        >
          <h2>{section.title}</h2>
          <p>{section.content}</p>
        </section>
      ))}
    </div>
  );
}
```

### 6.7 媒体查询监听

```jsx
function ResponsiveComponent() {
  const [isMobile, setIsMobile] = useState(false);
  
  const ref = (element) => {
    if (!element) return;
    
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleChange = (e) => {
      setIsMobile(e.matches);
    };
    
    // 初始检查
    setIsMobile(mediaQuery.matches);
    
    // 监听变化
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  };
  
  return (
    <div ref={ref}>
      <h2>当前设备: {isMobile ? '移动端' : '桌面端'}</h2>
    </div>
  );
}
```

### 6.8 焦点陷阱（Focus Trap）

```jsx
function FocusTrap({ children }) {
  const ref = (element) => {
    if (!element) return;
    
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // 初始聚焦
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  return (
    <div ref={ref} style={{ padding: '20px', border: '2px solid #333' }}>
      {children}
    </div>
  );
}

// 使用
function Modal({ onClose }) {
  return (
    <FocusTrap>
      <h2>模态对话框</h2>
      <input placeholder="姓名" />
      <input placeholder="邮箱" />
      <button onClick={onClose}>关闭</button>
    </FocusTrap>
  );
}
```

## 第七部分：高级模式

### 7.1 组合清理函数

```jsx
// ✅ 组合多个清理函数
function useComposedRef(...cleanupFns) {
  return (element) => {
    if (!element) return;
    
    // 收集所有清理函数
    const cleanups = cleanupFns.map(fn => {
      if (typeof fn === 'function') {
        return fn(element);
      }
      return null;
    }).filter(Boolean);
    
    // 返回组合的清理函数
    return () => {
      cleanups.forEach(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  };
}

// 使用
function Component() {
  const observerSetup = (element) => {
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    return () => observer.disconnect();
  };
  
  const listenerSetup = (element) => {
    const handler = () => {};
    element.addEventListener('click', handler);
    return () => element.removeEventListener('click', handler);
  };
  
  const ref = useComposedRef(observerSetup, listenerSetup);
  
  return <div ref={ref}>Content</div>;
}
```

### 7.2 条件清理模式

```jsx
// ✅ 根据条件返回不同的清理函数
function ConditionalCleanupPattern({ mode }) {
  const ref = (element) => {
    if (!element) return;
    
    if (mode === 'observe') {
      const observer = new ResizeObserver(() => {});
      observer.observe(element);
      return () => observer.disconnect();
    }
    
    if (mode === 'listen') {
      const handler = () => {};
      element.addEventListener('click', handler);
      return () => element.removeEventListener('click', handler);
    }
    
    // 默认模式：不需要清理
    return undefined;
  };
  
  return <div ref={ref}>Content</div>;
}
```

### 7.3 延迟清理

```jsx
// ✅ 延迟执行清理（用于动画完成等场景）
function DelayedCleanup() {
  const ref = (element) => {
    if (!element) return;
    
    // 添加淡入动画
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.3s';
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
    
    return () => {
      // 延迟清理，等待淡出动画完成
      element.style.opacity = '0';
      
      // 300ms后清理其他资源
      setTimeout(() => {
        console.log('Delayed cleanup executed');
      }, 300);
    };
  };
  
  return <div ref={ref}>淡入淡出</div>;
}
```

### 7.4 清理函数链

```jsx
// ✅ 创建清理函数链
function CleanupChain() {
  const ref = (element) => {
    if (!element) return;
    
    // 设置1：添加类名
    element.classList.add('active');
    
    // 设置2：添加监听器
    const handler = () => {};
    element.addEventListener('click', handler);
    
    // 设置3：创建观察器
    const observer = new MutationObserver(() => {});
    observer.observe(element, { attributes: true });
    
    // 返回清理函数链
    return () => {
      // 清理3：断开观察器
      observer.disconnect();
      console.log('Observer cleaned');
      
      // 清理2：移除监听器
      element.removeEventListener('click', handler);
      console.log('Listener cleaned');
      
      // 清理1：移除类名
      element.classList.remove('active');
      console.log('Class cleaned');
    };
  };
  
  return <div ref={ref}>清理链示例</div>;
}
```

### 7.5 错误处理

```jsx
// ✅ 在清理函数中处理错误
function SafeCleanup() {
  const ref = (element) => {
    if (!element) return;
    
    const resources = [];
    
    try {
      const observer = new ResizeObserver(() => {});
      observer.observe(element);
      resources.push(() => observer.disconnect());
    } catch (error) {
      console.error('Failed to create observer:', error);
    }
    
    try {
      const handler = () => {};
      element.addEventListener('click', handler);
      resources.push(() => element.removeEventListener('click', handler));
    } catch (error) {
      console.error('Failed to add listener:', error);
    }
    
    return () => {
      resources.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      });
    };
  };
  
  return <div ref={ref}>安全清理</div>;
}
```

### 7.6 性能监控

```jsx
// ✅ 监控清理函数的性能
function PerformanceMonitored() {
  const ref = (element) => {
    if (!element) return;
    
    const setupStart = performance.now();
    
    // 执行设置
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    const setupTime = performance.now() - setupStart;
    console.log(`Setup time: ${setupTime.toFixed(2)}ms`);
    
    return () => {
      const cleanupStart = performance.now();
      
      observer.disconnect();
      
      const cleanupTime = performance.now() - cleanupStart;
      console.log(`Cleanup time: ${cleanupTime.toFixed(2)}ms`);
    };
  };
  
  return <div ref={ref}>性能监控</div>;
}
```

## 注意事项

### 1. 避免在清理函数中使用闭包变量

```jsx
// ❌ 错误：使用了可能过时的闭包变量
function Bad({ onClose }) {
  const ref = (element) => {
    if (!element) return;
    
    const handleClick = () => {
      onClose();  // 可能是旧的onClose
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  };
  
  return <div ref={ref}>Content</div>;
}

// ✅ 正确：使用ref存储最新值
function Good({ onClose }) {
  const onCloseRef = useRef(onClose);
  
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  
  const ref = (element) => {
    if (!element) return;
    
    const handleClick = () => {
      onCloseRef.current();
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  };
  
  return <div ref={ref}>Content</div>;
}
```

### 2. 确保清理的完整性

```jsx
// ✅ 清理所有资源
const ref = (element) => {
  if (!element) return;
  
  const subscription = api.subscribe(element);
  const interval = setInterval(() => {}, 1000);
  const listener = () => {};
  
  element.addEventListener('click', listener);
  
  return () => {
    // 清理所有资源
    subscription.unsubscribe();
    clearInterval(interval);
    element.removeEventListener('click', listener);
  };
};
```

### 3. 处理异步清理

```jsx
// ✅ 处理异步操作的清理
const ref = (element) => {
  if (!element) return;
  
  let cancelled = false;
  
  async function fetchData() {
    const data = await api.get('/data');
    if (!cancelled) {
      element.textContent = data;
    }
  }
  
  fetchData();
  
  return () => {
    cancelled = true;
  };
};
```

### 4. 内存泄漏检测

```jsx
// ✅ 添加内存泄漏检测
function MemoryLeakDetection() {
  const activeRefs = useRef(new Set());
  
  const ref = (element) => {
    if (!element) return;
    
    // 记录ref
    activeRefs.current.add(element);
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
      
      // 移除记录
      activeRefs.current.delete(element);
      
      // 开发环境检查
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          if (activeRefs.current.has(element)) {
            console.warn('Potential memory leak: element still referenced', element);
          }
        }, 0);
      }
    };
  };
  
  return <div ref={ref}>Memory Leak Detection</div>;
}
```

### 5. 避免重复清理

```jsx
// ✅ 防止重复清理
const ref = (element) => {
  if (!element) return;
  
  let cleaned = false;
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    if (cleaned) {
      console.warn('Cleanup called multiple times');
      return;
    }
    
    cleaned = true;
    observer.disconnect();
  };
};
```

### 6. 清理顺序很重要

```jsx
// ✅ 按正确顺序清理
const ref = (element) => {
  if (!element) return;
  
  // 设置：从内到外
  element.classList.add('active');
  const handler = () => {};
  element.addEventListener('click', handler);
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    // 清理：从外到内（相反顺序）
    observer.disconnect();  // 最后设置的最先清理
    element.removeEventListener('click', handler);
    element.classList.remove('active');  // 最先设置的最后清理
  };
};
```

### 7. TypeScript类型支持

```tsx
// ✅ TypeScript类型定义
type CleanupFunction = () => void;
type RefCallback<T extends HTMLElement> = (element: T | null) => CleanupFunction | void;

const ref: RefCallback<HTMLDivElement> = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    observer.disconnect();
  };
};
```

### 8. 清理函数不应该有副作用

```jsx
// ❌ 错误：清理函数有副作用
const badRef = (element) => {
  if (!element) return;
  
  return () => {
    // 不要在清理时触发状态更新
    setCount(prev => prev + 1);  // ❌ 副作用
  };
};

// ✅ 正确：清理函数只负责清理
const goodRef = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    // 只执行清理操作
    observer.disconnect();  // ✅ 纯清理
  };
};
```

### 9. 调试清理时机

```jsx
// ✅ 调试清理时机
const ref = (element) => {
  if (!element) return;
  
  const id = Math.random().toString(36).substr(2, 9);
  console.log(`[${id}] Ref callback called for:`, element);
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    console.log(`[${id}] Cleanup called for:`, element);
    console.log(`[${id}] Cleanup stack:`, new Error().stack);
    observer.disconnect();
  };
};
```

### 10. 与useEffect的配合

```jsx
// ✅ ref callback和useEffect的配合使用
function CombinedApproach() {
  const elementRef = useRef(null);
  
  // ref callback处理DOM相关清理
  const ref = (element) => {
    elementRef.current = element;
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  };
  
  // useEffect处理数据相关清理
  useEffect(() => {
    const subscription = api.subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return <div ref={ref}>Combined Approach</div>;
}
```

## 常见问题

### Q1: 清理函数什么时候执行？

**A:** 清理函数在以下三种情况下执行：

1. **组件卸载时**：整个组件从DOM中移除
2. **ref变化时**：元素的key改变或条件渲染导致元素替换
3. **元素被替换时**：相同位置的不同元素

```jsx
function TimingDemo() {
  const [show, setShow] = useState(true);
  const [key, setKey] = useState(0);
  
  const ref = (element) => {
    if (!element) return;
    console.log('Ref callback executed');
    return () => console.log('Cleanup executed');
  };
  
  return (
    <div>
      {show && <div key={key} ref={ref}>Element</div>}
      <button onClick={() => setShow(!show)}>Toggle (卸载)</button>
      <button onClick={() => setKey(k => k + 1)}>Change Key (替换)</button>
    </div>
  );
}
```

### Q2: 可以在清理函数中使用async吗？

**A:** 不可以直接返回async函数，清理函数必须是同步的。但可以设置标志来取消异步操作：

```jsx
// ❌ 错误：返回async函数
const badRef = (element) => {
  if (!element) return;
  return async () => {
    await cleanup();  // 不允许
  };
};

// ✅ 正确：使用标志取消异步操作
const goodRef = (element) => {
  if (!element) return;
  
  let cancelled = false;
  
  async function fetchData() {
    const data = await api.get('/data');
    if (!cancelled) {
      element.textContent = data;
    }
  }
  
  fetchData();
  
  return () => {
    cancelled = true;  // 同步设置标志
  };
};
```

### Q3: 清理函数会在每次渲染时执行吗？

**A:** 不会。ref callback本身在每次渲染时可能会创建新函数，但清理函数只在以下情况执行：
- 元素被移除或替换
- 组件卸载

```jsx
function RerenderDemo() {
  const [count, setCount] = useState(0);
  
  const ref = (element) => {
    if (!element) return;
    console.log('Ref callback called');  // 可能每次渲染都输出
    return () => console.log('Cleanup');  // 只在卸载/替换时输出
  };
  
  return (
    <div>
      <div ref={ref}>Count: {count}</div>
      <button onClick={() => setCount(c => c + 1)}>
        Increment (不触发cleanup)
      </button>
    </div>
  );
}

// 优化版本：使用useCallback避免不必要的ref callback调用
function OptimizedDemo() {
  const [count, setCount] = useState(0);
  
  const ref = useCallback((element) => {
    if (!element) return;
    console.log('Ref callback called');  // 只调用一次
    return () => console.log('Cleanup');
  }, []);
  
  return <div ref={ref}>Count: {count}</div>;
}
```

### Q4: 如何调试清理函数？

**A:** 有多种调试方法：

```jsx
// 方法1：使用console.log
const debugRef = (element) => {
  if (!element) return;
  
  const id = Math.random().toString(36).substr(2, 9);
  console.log(`[${id}] Ref callback for:`, element);
  
  return () => {
    console.log(`[${id}] Cleanup for:`, element);
    console.log(`[${id}] Stack:`, new Error().stack);
  };
};

// 方法2：使用性能标记
const perfRef = (element) => {
  if (!element) return;
  
  const mark = `ref-${Date.now()}`;
  performance.mark(`${mark}-start`);
  
  return () => {
    performance.mark(`${mark}-end`);
    performance.measure(mark, `${mark}-start`, `${mark}-end`);
    console.log(performance.getEntriesByName(mark));
  };
};

// 方法3：使用React DevTools Profiler
function ProfiledComponent() {
  const ref = (element) => {
    if (!element) return;
    return () => {
      // 在React DevTools中可以看到清理时机
    };
  };
  
  return (
    <Profiler id="ref-cleanup" onRender={(id, phase) => {
      console.log(`${id} ${phase}`);
    }}>
      <div ref={ref}>Profiled</div>
    </Profiler>
  );
}
```

### Q5: ref callback和useEffect的清理有什么区别？

**A:** 两者有不同的用途和执行时机：

| 特性 | ref callback | useEffect |
|------|--------------|-----------|
| 触发时机 | 元素挂载/替换/卸载 | 依赖变化/组件卸载 |
| 执行顺序 | 更早（DOM操作期间） | 更晚（DOM更新后） |
| 适用场景 | DOM相关资源 | 数据/逻辑相关 |
| 依赖追踪 | 无 | 有 |
| 访问DOM | 直接访问 | 需要ref |

```jsx
function ComparisonDemo() {
  const elementRef = useRef(null);
  
  // ref callback：处理DOM直接相关的清理
  const ref = (element) => {
    elementRef.current = element;
    if (!element) return;
    
    console.log('1. Ref callback');
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      console.log('3. Ref cleanup (元素移除时)');
      observer.disconnect();
    };
  };
  
  // useEffect：处理数据/逻辑相关的清理
  useEffect(() => {
    console.log('2. useEffect');
    const subscription = api.subscribe();
    
    return () => {
      console.log('4. useEffect cleanup');
      subscription.unsubscribe();
    };
  }, []);
  
  return <div ref={ref}>Comparison</div>;
}
```

### Q6: 清理函数中可以访问props和state吗？

**A:** 可以，但要注意闭包问题：

```jsx
function StateAccessDemo() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState('initial');
  
  const ref = (element) => {
    if (!element) return;
    
    // 捕获当前的count和data值
    const capturedCount = count;
    const capturedData = data;
    
    console.log('Setup with:', capturedCount, capturedData);
    
    return () => {
      // 清理时只能访问捕获的值，不是最新的
      console.log('Cleanup with:', capturedCount, capturedData);
      
      // ❌ 这个count可能已经过时
      console.log('Current count:', count);
    };
  };
  
  return (
    <div>
      <div ref={ref}>Count: {count}, Data: {data}</div>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setData('updated')}>Update Data</button>
    </div>
  );
}

// 解决方案：如果需要最新值，使用ref存储
function LatestValueDemo() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const ref = (element) => {
    if (!element) return;
    
    return () => {
      // 访问最新的count
      console.log('Cleanup with latest count:', countRef.current);
    };
  };
  
  return <div ref={ref}>Count: {count}</div>;
}
```

### Q7: 多个清理操作如何组合？

**A:** 只能返回一个清理函数，但可以在其中组合多个清理操作：

```jsx
// 方法1：在单个清理函数中执行多个操作
const ref1 = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  const handler = () => {};
  const timer = setInterval(() => {}, 1000);
  
  observer.observe(element);
  element.addEventListener('click', handler);
  
  return () => {
    observer.disconnect();
    element.removeEventListener('click', handler);
    clearInterval(timer);
  };
};

// 方法2：使用helper函数组合清理函数
function composeCleanup(...cleanups) {
  return () => {
    cleanups.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
  };
}

const ref2 = (element) => {
  if (!element) return;
  
  const cleanup1 = setupObserver(element);
  const cleanup2 = setupListener(element);
  const cleanup3 = setupTimer(element);
  
  return composeCleanup(cleanup1, cleanup2, cleanup3);
};

// 方法3：使用try-catch确保所有清理都执行
const ref3 = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  const handler = () => {};
  
  observer.observe(element);
  element.addEventListener('click', handler);
  
  return () => {
    // 确保一个失败不影响其他清理
    try {
      observer.disconnect();
    } catch (e) {
      console.error('Observer cleanup failed:', e);
    }
    
    try {
      element.removeEventListener('click', handler);
    } catch (e) {
      console.error('Listener cleanup failed:', e);
    }
  };
};
```

### Q8: ref callback在严格模式下会执行多次吗？

**A:** 是的，在React 18+的严格模式（开发环境）下，ref callback可能会执行两次：

```jsx
function StrictModeDemo() {
  const ref = (element) => {
    if (!element) return;
    
    console.log('Ref callback executed');  // 可能输出2次
    
    return () => {
      console.log('Cleanup executed');  // 可能输出2次
    };
  };
  
  return (
    <React.StrictMode>
      <div ref={ref}>Strict Mode</div>
    </React.StrictMode>
  );
}

// 开发环境下的输出：
// Ref callback executed
// Cleanup executed
// Ref callback executed

// 生产环境下的输出：
// Ref callback executed
```

**如何处理：**

```jsx
// 使用幂等操作（可以多次执行）
const idempotentRef = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    observer.disconnect();  // 多次调用也安全
  };
};

// 使用标志防止重复操作
const flaggedRef = (element) => {
  if (!element) return;
  
  let cleaned = false;
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    if (cleaned) return;
    cleaned = true;
    observer.disconnect();
  };
};
```

### Q9: 清理函数中抛出错误会怎样？

**A:** 清理函数中未捕获的错误会被React捕获，但可能影响其他清理：

```jsx
// ❌ 危险：未捕获的错误可能影响后续清理
const badRef = (element) => {
  if (!element) return;
  
  return () => {
    undefined.disconnect();  // 抛出TypeError
    // 如果有多个清理操作，后面的可能不会执行
  };
};

// ✅ 安全：捕获并处理错误
const goodRef = (element) => {
  if (!element) return;
  
  const observer1 = new ResizeObserver(() => {});
  const observer2 = new MutationObserver(() => {});
  
  observer1.observe(element);
  observer2.observe(element, { childList: true });
  
  return () => {
    try {
      observer1.disconnect();
    } catch (error) {
      console.error('Observer1 cleanup failed:', error);
      reportError(error);
    }
    
    try {
      observer2.disconnect();
    } catch (error) {
      console.error('Observer2 cleanup failed:', error);
      reportError(error);
    }
  };
};

// 使用helper函数统一处理
function safeCleanup(fn, name) {
  try {
    fn();
  } catch (error) {
    console.error(`${name} cleanup failed:`, error);
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }
}

const safeRef = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    safeCleanup(() => observer.disconnect(), 'ResizeObserver');
  };
};
```

### Q10: 如何在清理函数中区分卸载和更新？

**A:** 清理函数本身无法直接区分，但可以配合useEffect使用标志：

```jsx
function UnmountVsUpdateDemo() {
  const [count, setCount] = useState(0);
  const isUnmountingRef = useRef(false);
  
  useEffect(() => {
    return () => {
      // 组件卸载时设置标志
      isUnmountingRef.current = true;
    };
  }, []);
  
  const ref = (element) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
      
      if (isUnmountingRef.current) {
        console.log('Cleaning up due to unmount');
        // 执行卸载特定的清理
      } else {
        console.log('Cleaning up due to ref change');
        // 执行更新特定的清理
      }
    };
  };
  
  return (
    <div key={count} ref={ref}>
      <button onClick={() => setCount(c => c + 1)}>
        Change Key (触发ref change)
      </button>
    </div>
  );
}
```

### Q11: 清理函数可以修改DOM吗？

**A:** 技术上可以，但通常不推荐，因为元素可能即将被移除：

```jsx
// ⚠️ 不推荐：清理时修改DOM
const notRecommendedRef = (element) => {
  if (!element) return;
  
  element.style.opacity = '1';
  
  return () => {
    // 元素可能即将被移除，修改DOM没有意义
    element.style.opacity = '0';  // ⚠️
  };
};

// ✅ 推荐：只清理资源，不修改DOM
const recommendedRef = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    // 只清理资源
    observer.disconnect();
  };
};

// 特殊情况：如果确实需要卸载动画
function UnmountAnimationDemo() {
  const [show, setShow] = useState(true);
  
  const ref = (element) => {
    if (!element) return;
    
    return () => {
      // 执行卸载动画（但这应该在父组件中处理）
      element.style.transition = 'opacity 0.3s';
      element.style.opacity = '0';
      
      // 注意：这里的动画可能看不到，
      // 因为清理后元素立即被移除
    };
  };
  
  return show && <div ref={ref}>Animated</div>;
}

// 更好的做法：使用CSS transition或动画库
function BetterUnmountAnimation() {
  const [show, setShow] = useState(true);
  const [removing, setRemoving] = useState(false);
  
  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => {
      setShow(false);
      setRemoving(false);
    }, 300);
  };
  
  return show && (
    <div 
      style={{
        opacity: removing ? 0 : 1,
        transition: 'opacity 0.3s'
      }}
    >
      <button onClick={handleRemove}>Remove with Animation</button>
    </div>
  );
}
```

### Q12: 如何测试ref callback的清理函数？

**A:** 使用React Testing Library进行测试：

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Ref Callback Cleanup', () => {
  test('cleanup is called on unmount', () => {
    const cleanup = jest.fn();
    
    function TestComponent() {
      const ref = (element) => {
        if (!element) return;
        return cleanup;
      };
      
      return <div ref={ref}>Test</div>;
    }
    
    const { unmount } = render(<TestComponent />);
    expect(cleanup).not.toHaveBeenCalled();
    
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
  
  test('cleanup is called on ref change', () => {
    const cleanup = jest.fn();
    
    function TestComponent({ key }) {
      const ref = (element) => {
        if (!element) return;
        return cleanup;
      };
      
      return <div key={key} ref={ref}>Test</div>;
    }
    
    const { rerender } = render(<TestComponent key="a" />);
    expect(cleanup).not.toHaveBeenCalled();
    
    rerender(<TestComponent key="b" />);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
  
  test('cleanup is called with correct timing', async () => {
    const events = [];
    
    function TestComponent({ show }) {
      const ref = (element) => {
        if (!element) return;
        events.push('setup');
        return () => events.push('cleanup');
      };
      
      return show && <div ref={ref}>Test</div>;
    }
    
    const { rerender } = render(<TestComponent show={true} />);
    expect(events).toEqual(['setup']);
    
    rerender(<TestComponent show={false} />);
    expect(events).toEqual(['setup', 'cleanup']);
  });
  
  test('cleanup handles errors gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    function TestComponent() {
      const ref = (element) => {
        if (!element) return;
        return () => {
          throw new Error('Cleanup error');
        };
      };
      
      return <div ref={ref}>Test</div>;
    }
    
    const { unmount } = render(<TestComponent />);
    
    expect(() => unmount()).not.toThrow();
    
    consoleError.mockRestore();
  });
});
```

### Q13: 清理函数与第三方库的配合？

**A:** 确保调用第三方库的清理/销毁方法：

```jsx
// Chart.js
function ChartComponent({ data }) {
  const chartRef = (canvas) => {
    if (!canvas) return;
    
    const chart = new Chart(canvas, {
      type: 'line',
      data: data
    });
    
    return () => {
      chart.destroy();  // Chart.js的清理方法
    };
  };
  
  return <canvas ref={chartRef} />;
}

// Leaflet地图
function MapComponent() {
  const mapRef = (div) => {
    if (!div) return;
    
    const map = L.map(div).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    return () => {
      map.remove();  // Leaflet的清理方法
    };
  };
  
  return <div ref={mapRef} style={{ height: '400px' }} />;
}

// Monaco Editor
function EditorComponent() {
  const editorRef = (div) => {
    if (!div) return;
    
    const editor = monaco.editor.create(div, {
      value: 'console.log("Hello");',
      language: 'javascript'
    });
    
    return () => {
      editor.dispose();  // Monaco的清理方法
    };
  };
  
  return <div ref={editorRef} style={{ height: '600px' }} />;
}

// Video.js
function VideoPlayer({ src }) {
  const videoRef = (video) => {
    if (!video) return;
    
    const player = videojs(video, {
      controls: true,
      sources: [{ src, type: 'video/mp4' }]
    });
    
    return () => {
      player.dispose();  // Video.js的清理方法
    };
  };
  
  return (
    <video ref={videoRef} className="video-js">
      <source src={src} type="video/mp4" />
    </video>
  );
}
```

### Q14: 清理函数的执行顺序？

**A:** 当有多个嵌套元素时，清理顺序是从内到外（子到父）：

```jsx
function CleanupOrderDemo() {
  const parentRef = (element) => {
    if (!element) return;
    console.log('1. Parent ref callback');
    return () => console.log('4. Parent cleanup');
  };
  
  const childRef = (element) => {
    if (!element) return;
    console.log('2. Child ref callback');
    return () => console.log('3. Child cleanup');
  };
  
  const grandchildRef = (element) => {
    if (!element) return;
    console.log('3. Grandchild ref callback');
    return () => console.log('2. Grandchild cleanup');
  };
  
  return (
    <div ref={parentRef}>
      Parent
      <div ref={childRef}>
        Child
        <div ref={grandchildRef}>Grandchild</div>
      </div>
    </div>
  );
}

// 挂载时输出：
// 1. Parent ref callback
// 2. Child ref callback
// 3. Grandchild ref callback

// 卸载时输出：
// 2. Grandchild cleanup
// 3. Child cleanup
// 4. Parent cleanup
```

### Q15: 清理函数中可以使用Promise吗？

**A:** 清理函数必须是同步的，但可以触发异步操作：

```jsx
// ❌ 错误：返回Promise
const badRef = (element) => {
  if (!element) return;
  
  return async () => {
    await someAsyncCleanup();  // 不允许
  };
};

// ✅ 正确：同步清理，异步操作不等待
const goodRef = (element) => {
  if (!element) return;
  
  return () => {
    // 触发异步操作但不等待
    someAsyncCleanup().catch(err => {
      console.error('Async cleanup failed:', err);
    });
    
    // 同步清理
    element.removeEventListener('click', handler);
  };
};

// ✅ 更好：分离同步和异步清理
const betterRef = (element) => {
  if (!element) return;
  
  const abortController = new AbortController();
  
  // 启动可能需要清理的异步操作
  fetchData(element, abortController.signal).catch(console.error);
  
  return () => {
    // 同步取消异步操作
    abortController.abort();
    
    // 同步清理DOM
    element.classList.remove('active');
  };
};
```

## 总结

### 核心价值

ref callback清理函数是React 19引入的重要特性，它提供了一种更简洁、更直观的资源管理方式。

**主要优势：**

1. **自动化**：React自动调用清理函数，无需手动管理
2. **逻辑聚合**：设置和清理代码放在一起，更易维护
3. **防止泄漏**：确保资源在适当时机被释放
4. **简化代码**：无需额外的useEffect或state
5. **类型安全**：TypeScript完美支持
6. **性能优化**：清理时机更精确，避免不必要的清理

### 清理函数 vs useEffect

| 特性 | ref callback清理函数 | useEffect清理函数 |
|------|---------------------|------------------|
| **触发时机** | DOM元素挂载/卸载/替换 | 依赖变化或组件卸载 |
| **执行时间** | DOM操作期间（更早） | DOM更新后（较晚） |
| **适用场景** | DOM直接相关的资源 | 数据/逻辑相关资源 |
| **依赖追踪** | 无（直接绑定元素） | 有（依赖数组） |
| **访问DOM** | 直接获取元素引用 | 需要通过ref.current |
| **代码位置** | 设置和清理在一起 | 分离在不同位置 |
| **性能** | 更高效（无依赖检查） | 需要依赖检查 |

**选择建议：**
- **使用ref callback清理函数**：DOM监听器、观察器、第三方DOM库
- **使用useEffect清理函数**：数据订阅、定时器、非DOM相关资源

### 常见应用场景

#### 1. DOM事件监听器
```jsx
const ref = (element) => {
  if (!element) return;
  const handler = () => {};
  element.addEventListener('click', handler);
  return () => element.removeEventListener('click', handler);
};
```

#### 2. 观察器API
```jsx
const ref = (element) => {
  if (!element) return;
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  return () => observer.disconnect();
};
```

#### 3. 第三方库集成
```jsx
const ref = (element) => {
  if (!element) return;
  const instance = new ThirdPartyLib(element);
  return () => instance.destroy();
};
```

#### 4. 动画和定时器
```jsx
const ref = (element) => {
  if (!element) return;
  let rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
};
```

#### 5. WebSocket和实时连接
```jsx
const ref = (element) => {
  if (!element) return;
  const ws = new WebSocket(url);
  return () => ws.close();
};
```

### 最佳实践总结

#### ✅ 推荐做法

```jsx
// 1. 总是检查element是否存在
const ref = (element) => {
  if (!element) return;
  // 设置代码
  return () => {
    // 清理代码
  };
};

// 2. 清理所有创建的资源
const ref = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  const handler = () => {};
  
  observer.observe(element);
  element.addEventListener('click', handler);
  
  return () => {
    observer.disconnect();
    element.removeEventListener('click', handler);
  };
};

// 3. 使用try-catch保护清理代码
const ref = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    try {
      observer.disconnect();
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };
};

// 4. 使用useCallback优化性能
const ref = useCallback((element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => observer.disconnect();
}, []);

// 5. 清理函数保持同步
const ref = (element) => {
  if (!element) return;
  
  let cancelled = false;
  
  async function fetchData() {
    const data = await api.get('/data');
    if (!cancelled) {
      // 使用数据
    }
  }
  
  fetchData();
  
  return () => {
    cancelled = true;  // 同步设置标志
  };
};
```

#### ❌ 避免的做法

```jsx
// 1. 不检查element
const bad1 = (element) => {
  element.addEventListener('click', handler);  // ❌ 可能为null
};

// 2. 忘记清理资源
const bad2 = (element) => {
  if (!element) return;
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  // ❌ 没有返回清理函数
};

// 3. 返回async函数
const bad3 = (element) => {
  if (!element) return;
  return async () => {  // ❌ 清理函数不能是async
    await cleanup();
  };
};

// 4. 在清理函数中修改state
const bad4 = (element) => {
  if (!element) return;
  return () => {
    setCount(prev => prev + 1);  // ❌ 不要在清理时更新状态
  };
};

// 5. 清理不完整
const bad5 = (element) => {
  if (!element) return;
  
  const observer1 = new ResizeObserver(() => {});
  const observer2 = new MutationObserver(() => {});
  
  observer1.observe(element);
  observer2.observe(element, { childList: true });
  
  return () => {
    observer1.disconnect();  // ❌ 忘记清理observer2
  };
};
```

### 性能优化建议

#### 1. 使用useCallback避免重复调用
```jsx
const ref = useCallback((element) => {
  if (!element) return;
  // 设置逻辑
  return () => {
    // 清理逻辑
  };
}, []); // 空依赖数组确保ref callback只创建一次
```

#### 2. 延迟资源初始化
```jsx
const ref = (element) => {
  if (!element) return;
  
  // 延迟初始化昂贵的资源
  const timer = setTimeout(() => {
    const expensiveResource = createResource(element);
  }, 100);
  
  return () => {
    clearTimeout(timer);
    // 清理资源
  };
};
```

#### 3. 避免不必要的清理操作
```jsx
const ref = (element) => {
  if (!element) return;
  
  let resource = null;
  
  // 按需创建资源
  if (someCondition) {
    resource = createResource(element);
  }
  
  return () => {
    // 只清理实际创建的资源
    if (resource) {
      resource.cleanup();
    }
  };
};
```

#### 4. 批量清理
```jsx
const ref = (element) => {
  if (!element) return;
  
  const cleanups = [];
  
  // 收集所有清理函数
  cleanups.push(setupObserver(element));
  cleanups.push(setupListener(element));
  cleanups.push(setupAnimation(element));
  
  return () => {
    // 批量执行清理
    cleanups.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
  };
};
```

### 调试技巧

#### 1. 添加日志
```jsx
const ref = (element) => {
  if (!element) return;
  
  const id = Math.random().toString(36).substr(2, 9);
  console.log(`[${id}] Setup at ${Date.now()}`);
  
  return () => {
    console.log(`[${id}] Cleanup at ${Date.now()}`);
    console.log(`[${id}] Stack:`, new Error().stack);
  };
};
```

#### 2. 性能监控
```jsx
const ref = (element) => {
  if (!element) return;
  
  const startMark = `ref-setup-${Date.now()}`;
  performance.mark(startMark);
  
  // 设置资源
  const resource = createResource(element);
  
  performance.measure('ref-setup', startMark);
  
  return () => {
    const cleanupMark = `ref-cleanup-${Date.now()}`;
    performance.mark(cleanupMark);
    
    resource.destroy();
    
    performance.measure('ref-cleanup', cleanupMark);
  };
};
```

#### 3. 内存泄漏检测
```jsx
const activeRefs = new Set();

const ref = (element) => {
  if (!element) return;
  
  activeRefs.add(element);
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    observer.disconnect();
    activeRefs.delete(element);
    
    // 检查是否还有活跃的refs
    if (process.env.NODE_ENV === 'development') {
      console.log('Active refs count:', activeRefs.size);
    }
  };
};
```

### TypeScript支持

```tsx
// 基本类型定义
type CleanupFunction = () => void;
type RefCallback<T = HTMLElement> = (element: T | null) => CleanupFunction | void;

// 泛型ref callback
function useTypedRef<T extends HTMLElement>(): RefCallback<T> {
  return useCallback((element: T | null) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, []);
}

// 使用示例
const Component = () => {
  const divRef = useTypedRef<HTMLDivElement>();
  const canvasRef = useTypedRef<HTMLCanvasElement>();
  
  return (
    <>
      <div ref={divRef}>Div</div>
      <canvas ref={canvasRef} />
    </>
  );
};
```

### 与其他React 19特性的配合

#### 1. 与Server Components配合
```jsx
// Server Component不能使用ref callback
// Client Component中正常使用
'use client';

function ClientComponent() {
  const ref = (element) => {
    if (!element) return;
    // 客户端专属逻辑
    return () => {
      // 清理逻辑
    };
  };
  
  return <div ref={ref}>Client Only</div>;
}
```

#### 2. 与use hook配合
```jsx
'use client';

function ComponentWithUse() {
  const data = use(dataPromise);
  
  const ref = (element) => {
    if (!element) return;
    
    // 使用use获取的数据
    const observer = new ResizeObserver(() => {
      updateWithData(data);
    });
    observer.observe(element);
    
    return () => observer.disconnect();
  };
  
  return <div ref={ref}>{data}</div>;
}
```

#### 3. 与useOptimistic配合
```jsx
function OptimisticComponent() {
  const [items, setItems] = useState([]);
  const [optimisticItems, addOptimistic] = useOptimistic(items);
  
  const ref = (element) => {
    if (!element) return;
    
    // 使用乐观更新的数据
    element.dataset.count = optimisticItems.length;
    
    return () => {
      delete element.dataset.count;
    };
  };
  
  return <div ref={ref}>Count: {optimisticItems.length}</div>;
}
```

### 迁移指南

#### 从useEffect迁移到ref callback

```jsx
// 旧代码：使用useEffect
function OldComponent() {
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return <div ref={ref}>Old</div>;
}

// 新代码：使用ref callback清理函数
function NewComponent() {
  const ref = (element) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  };
  
  return <div ref={ref}>New</div>;
}
```

**迁移收益：**
- 代码更简洁（减少6行）
- 无需额外的useRef
- 无需useEffect依赖管理
- 清理时机更精确
- 更容易理解和维护

### 总结要点

**核心概念：**
1. ref callback可以返回一个清理函数
2. 清理函数在元素卸载/替换时自动执行
3. 清理函数必须是同步的
4. 适用于DOM相关的资源管理

**使用场景：**
1. 事件监听器
2. DOM观察器（Resize、Intersection、Mutation）
3. 第三方DOM库（Chart、Map、Editor等）
4. 动画和定时器
5. WebSocket和实时连接

**最佳实践：**
1. 总是检查element是否为null
2. 清理所有创建的资源
3. 使用try-catch保护清理代码
4. 使用useCallback优化性能
5. 保持清理函数同步

**注意事项：**
1. 不要在清理函数中修改状态
2. 不要返回async函数
3. 确保清理的完整性
4. 注意闭包捕获的值
5. 处理严格模式下的重复调用

ref callback清理函数是React 19中非常实用的特性，它让DOM资源管理变得更加简洁和安全。通过返回清理函数，我们可以确保所有资源在适当的时机被正确释放，避免内存泄漏，提升应用性能和稳定性！
