# react-intersection-observer滚动监听

## 概述

react-intersection-observer是基于Intersection Observer API的React Hook库,用于检测元素何时进入或离开视口。它广泛应用于懒加载、无限滚动、动画触发、数据预加载等场景。本文将全面介绍react-intersection-observer的核心概念、使用方法以及实战应用。

## Intersection Observer API简介

### 核心概念

Intersection Observer API提供了一种异步观察目标元素与祖先元素或顶级文档视口交叉状态的方法。主要优势:
- **异步执行**: 不会阻塞主线程
- **高性能**: 相比scroll事件监听更高效
- **灵活配置**: 支持自定义阈值和根元素

### 原生API示例

```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('Element is visible');
      }
    });
  },
  {
    root: null, // 视口
    rootMargin: '0px',
    threshold: 0.5, // 50%可见时触发
  }
);

observer.observe(element);
```

## 安装与配置

### 安装

```bash
npm install react-intersection-observer

# 或
yarn add react-intersection-observer
pnpm add react-intersection-observer
```

### 基础导入

```tsx
import { useInView } from 'react-intersection-observer';
```

## useInView Hook

### 基础使用

```tsx
function BasicInView() {
  const { ref, inView, entry } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  
  return (
    <div ref={ref}>
      <h2>{inView ? 'In View' : 'Not in view'}</h2>
      {entry && <p>Intersection ratio: {entry.intersectionRatio}</p>}
    </div>
  );
}
```

### 配置选项

```tsx
function ConfiguredInView() {
  const { ref, inView } = useInView({
    /* 可选配置 */
    threshold: 0.5,           // 阈值: 0-1之间，默认0
    root: null,               // 根元素，默认视口
    rootMargin: '0px',        // 根元素边距
    triggerOnce: true,        // 只触发一次
    skip: false,              // 跳过观察
    initialInView: false,     // 初始状态
    trackVisibility: false,   // 跟踪可见性
    delay: 100,               // 延迟(ms)
    fallbackInView: true,     // 降级时的状态
  });
  
  return (
    <div ref={ref}>
      {inView ? 'Visible' : 'Hidden'}
    </div>
  );
}
```

## 懒加载实现

### 图片懒加载

```tsx
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px', // 提前50px加载
  });
  
  return (
    <div ref={ref} className="lazy-image-container">
      {inView ? (
        <img src={src} alt={alt} className="fade-in" />
      ) : (
        <div className="placeholder" />
      )}
    </div>
  );
}
```

### 组件懒加载

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function LazyComponent() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
  });
  
  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={<Skeleton />}>
          <HeavyComponent />
        </Suspense>
      ) : (
        <div style={{ height: '400px' }} />
      )}
    </div>
  );
}
```

### 列表懒加载

```tsx
function LazyList({ items }: { items: Array<{ id: string; content: string }> }) {
  return (
    <div className="lazy-list">
      {items.map((item) => (
        <LazyListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function LazyListItem({ item }: { item: { id: string; content: string } }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '100px',
  });
  
  return (
    <div ref={ref} className="list-item">
      {inView ? (
        <div className="item-content">
          <img src={`/api/image/${item.id}`} alt={item.content} />
          <p>{item.content}</p>
        </div>
      ) : (
        <div className="item-skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-text" />
        </div>
      )}
    </div>
  );
}
```

## 无限滚动

### 基础无限滚动

```tsx
function InfiniteScroll() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // 提前200px触发加载
  });
  
  useEffect(() => {
    if (inView && hasMore) {
      loadMoreItems(page).then((newItems) => {
        setItems((prev) => [...prev, ...newItems]);
        setPage((p) => p + 1);
        setHasMore(newItems.length > 0);
      });
    }
  }, [inView, hasMore, page]);
  
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.content}</div>
      ))}
      
      {hasMore && (
        <div ref={ref} className="loading-indicator">
          <Spinner />
        </div>
      )}
      
      {!hasMore && <div>No more items</div>}
    </div>
  );
}
```

### 双向无限滚动

```tsx
function BidirectionalInfiniteScroll() {
  const [items, setItems] = useState<Item[]>([]);
  const [topPage, setTopPage] = useState(0);
  const [bottomPage, setBottomPage] = useState(1);
  const [hasMoreTop, setHasMoreTop] = useState(false);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);
  
  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0,
  });
  
  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0,
  });
  
  // 向上加载
  useEffect(() => {
    if (topInView && hasMoreTop) {
      loadPreviousItems(topPage).then((newItems) => {
        setItems((prev) => [...newItems, ...prev]);
        setTopPage((p) => p - 1);
        setHasMoreTop(topPage > 0);
      });
    }
  }, [topInView, hasMoreTop, topPage]);
  
  // 向下加载
  useEffect(() => {
    if (bottomInView && hasMoreBottom) {
      loadMoreItems(bottomPage).then((newItems) => {
        setItems((prev) => [...prev, ...newItems]);
        setBottomPage((p) => p + 1);
        setHasMoreBottom(newItems.length > 0);
      });
    }
  }, [bottomInView, hasMoreBottom, bottomPage]);
  
  return (
    <div className="bidirectional-scroll">
      {hasMoreTop && (
        <div ref={topRef} className="loading-top">
          <Spinner />
        </div>
      )}
      
      {items.map((item) => (
        <div key={item.id}>{item.content}</div>
      ))}
      
      {hasMoreBottom && (
        <div ref={bottomRef} className="loading-bottom">
          <Spinner />
        </div>
      )}
    </div>
  );
}
```

### 优化的无限滚动

```tsx
function OptimizedInfiniteScroll() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });
  
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    try {
      const newItems = await fetchItems(page);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...newItems]);
        setPage((p) => p + 1);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);
  
  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);
  
  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
      
      <div ref={ref}>
        {isLoading && <Spinner />}
        {!hasMore && <div>All items loaded</div>}
      </div>
    </div>
  );
}
```

## 滚动动画

### 淡入动画

```tsx
function FadeInOnScroll({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <div
      ref={ref}
      className={`fade-in ${inView ? 'visible' : ''}`}
    >
      {children}
    </div>
  );
}

// CSS
/*
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
*/
```

### 交错动画

```tsx
function StaggeredAnimation({ items }: { items: string[] }) {
  return (
    <div className="staggered-container">
      {items.map((item, index) => (
        <StaggeredItem key={index} delay={index * 100}>
          {item}
        </StaggeredItem>
      ))}
    </div>
  );
}

function StaggeredItem({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  
  return (
    <div
      ref={ref}
      className="staggered-item"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

### 视差滚动

```tsx
function ParallaxSection() {
  const { ref, entry } = useInView({
    threshold: 0,
  });
  
  const translateY = entry
    ? (entry.boundingClientRect.top / window.innerHeight) * 50
    : 0;
  
  return (
    <div ref={ref} className="parallax-section">
      <div
        className="parallax-background"
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      />
      <div className="parallax-content">
        Content
      </div>
    </div>
  );
}
```

## 数据预加载

### 预加载下一页

```tsx
function PrefetchNext() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const prefetchedRef = useRef(new Set<number>());
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '300px', // 提前300px开始预加载
  });
  
  useEffect(() => {
    if (inView && !prefetchedRef.current.has(page + 1)) {
      prefetchedRef.current.add(page + 1);
      
      // 预加载下一页
      prefetchItems(page + 1);
    }
  }, [inView, page]);
  
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.content}</div>
      ))}
      <div ref={ref} />
    </div>
  );
}
```

### 图片预加载

```tsx
function PrefetchImage({ src }: { src: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '500px', // 提前500px预加载
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    if (inView) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
    }
  }, [inView, src]);
  
  return (
    <div ref={ref}>
      {isLoaded ? (
        <img src={src} alt="" />
      ) : (
        <div className="image-placeholder" />
      )}
    </div>
  );
}
```

## 实战案例

### 1. 进度指示器

```tsx
function ScrollProgress() {
  const sections = ['Intro', 'Features', 'Pricing', 'Contact'];
  const [activeSection, setActiveSection] = useState(0);
  
  return (
    <div>
      <div className="progress-indicator">
        {sections.map((section, index) => (
          <div
            key={section}
            className={`indicator-dot ${index === activeSection ? 'active' : ''}`}
          />
        ))}
      </div>
      
      {sections.map((section, index) => (
        <ScrollSection
          key={section}
          title={section}
          onInView={() => setActiveSection(index)}
        />
      ))}
    </div>
  );
}

function ScrollSection({
  title,
  onInView,
}: {
  title: string;
  onInView: () => void;
}) {
  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView) onInView();
    },
  });
  
  return (
    <section ref={ref} className="scroll-section">
      <h2>{title}</h2>
    </section>
  );
}
```

### 2. 视频自动播放

```tsx
function AutoplayVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { ref, inView } = useInView({
    threshold: 0.5,
  });
  
  useEffect(() => {
    if (videoRef.current) {
      if (inView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView]);
  
  return (
    <div ref={ref}>
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
      />
    </div>
  );
}
```

### 3. 数字计数动画

```tsx
function CountUp({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });
  
  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [inView, end]);
  
  return (
    <div ref={ref} className="count-up">
      {count}
    </div>
  );
}

function Stats() {
  return (
    <div className="stats">
      <div className="stat">
        <CountUp end={1000} />
        <span>Users</span>
      </div>
      <div className="stat">
        <CountUp end={500} />
        <span>Projects</span>
      </div>
      <div className="stat">
        <CountUp end={50} />
        <span>Countries</span>
      </div>
    </div>
  );
}
```

### 4. 骨架屏

```tsx
function SkeletonLoader() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (inView && !data && !isLoading) {
      setIsLoading(true);
      
      fetchData().then((result) => {
        setData(result);
        setIsLoading(false);
      });
    }
  }, [inView, data, isLoading]);
  
  return (
    <div ref={ref}>
      {isLoading || !data ? (
        <div className="skeleton">
          <div className="skeleton-image" />
          <div className="skeleton-title" />
          <div className="skeleton-text" />
          <div className="skeleton-text" />
        </div>
      ) : (
        <div className="content">
          <img src={data.image} alt={data.title} />
          <h3>{data.title}</h3>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
}
```

### 5. 导航栏高亮

```tsx
function NavigationHighlight() {
  const [activeId, setActiveId] = useState('');
  
  const sections = [
    { id: 'section1', title: 'Section 1' },
    { id: 'section2', title: 'Section 2' },
    { id: 'section3', title: 'Section 3' },
  ];
  
  return (
    <>
      <nav className="sticky-nav">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={activeId === section.id ? 'active' : ''}
          >
            {section.title}
          </a>
        ))}
      </nav>
      
      {sections.map((section) => (
        <NavSection
          key={section.id}
          id={section.id}
          title={section.title}
          onInView={setActiveId}
        />
      ))}
    </>
  );
}

function NavSection({
  id,
  title,
  onInView,
}: {
  id: string;
  title: string;
  onInView: (id: string) => void;
}) {
  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView) onInView(id);
    },
  });
  
  return (
    <section ref={ref} id={id}>
      <h2>{title}</h2>
    </section>
  );
}
```

### 6. 轮播图自动播放

```tsx
function InViewCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.5,
  });
  
  useEffect(() => {
    if (!inView) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [inView, images.length]);
  
  return (
    <div ref={ref} className="carousel">
      <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} />
      
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={index === currentIndex ? 'active' : ''}
          />
        ))}
      </div>
    </div>
  );
}
```

## 性能优化

### 使用triggerOnce

```tsx
// ✅ 一次性动画使用triggerOnce
function OptimizedAnimation() {
  const { ref, inView } = useInView({
    triggerOnce: true, // 只触发一次
    threshold: 0.1,
  });
  
  return (
    <div ref={ref} className={inView ? 'animate' : ''}>
      Content
    </div>
  );
}
```

### 合理设置rootMargin

```tsx
// ✅ 提前加载但不要过早
function OptimizedLazyLoad() {
  const { ref, inView } = useInView({
    rootMargin: '200px', // 提前200px开始加载
    triggerOnce: true,
  });
  
  return (
    <div ref={ref}>
      {inView && <HeavyComponent />}
    </div>
  );
}

// ❌ rootMargin过大会导致过早加载
function UnoptimizedLazyLoad() {
  const { ref, inView } = useInView({
    rootMargin: '2000px', // 太大了
    triggerOnce: true,
  });
  
  return (
    <div ref={ref}>
      {inView && <HeavyComponent />}
    </div>
  );
}
```

### 虚拟化长列表

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedIntersection() {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <VirtualItem
            key={virtualRow.index}
            index={virtualRow.index}
            start={virtualRow.start}
          />
        ))}
      </div>
    </div>
  );
}

function VirtualItem({ index, start }: { index: number; start: number }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${start}px)`,
      }}
    >
      {inView ? <ItemContent index={index} /> : <ItemPlaceholder />}
    </div>
  );
}
```

## 调试技巧

### 可视化调试

```tsx
function DebugIntersection() {
  const { ref, inView, entry } = useInView({
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });
  
  return (
    <>
      <div ref={ref} className="debug-element">
        <div className="debug-info">
          <p>In View: {inView ? 'Yes' : 'No'}</p>
          <p>Ratio: {entry?.intersectionRatio.toFixed(2)}</p>
          <p>
            Bounds: {entry?.boundingClientRect.top.toFixed(0)}px,{' '}
            {entry?.boundingClientRect.left.toFixed(0)}px
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .debug-element {
          border: 2px solid ${inView ? 'green' : 'red'};
          background: ${inView ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)'};
        }
      `}</style>
    </>
  );
}
```

## 浏览器兼容性

### Polyfill

```tsx
// 检测支持性并加载polyfill
useEffect(() => {
  if (!('IntersectionObserver' in window)) {
    import('intersection-observer').then(() => {
      console.log('Intersection Observer polyfill loaded');
    });
  }
}, []);
```

### 降级方案

```tsx
function FallbackInView({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({
    fallbackInView: true, // 不支持时默认为true
  });
  
  return (
    <div ref={ref}>
      {inView ? children : <Placeholder />}
    </div>
  );
}
```

## 最佳实践总结

### 性能优化

```
✅ 使用triggerOnce避免重复触发
✅ 合理设置rootMargin预加载
✅ 使用threshold控制精确度
✅ 虚拟化长列表
✅ 避免在回调中执行昂贵操作
```

### 用户体验

```
✅ 提供加载状态反馈
✅ 平滑的动画过渡
✅ 合理的预加载距离
✅ 骨架屏占位
✅ 错误状态处理
```

### 可访问性

```
✅ 确保内容最终可访问
✅ 提供替代加载方式
✅ 避免纯视觉交互
✅ 支持键盘导航
```

react-intersection-observer提供了强大而灵活的视口检测能力。通过合理使用这个库,可以实现高性能的懒加载、无限滚动和滚动动画,显著提升用户体验和应用性能。

