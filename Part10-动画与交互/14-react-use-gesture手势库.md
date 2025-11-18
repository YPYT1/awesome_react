# react-use-gesture手势库

## 概述

react-use-gesture是一个强大的手势库,为React应用提供了丰富的手势识别能力。它支持拖拽、捏合、滚轮、悬停、滑动等多种手势,并且可以与动画库(如React Spring)无缝集成。本文将全面介绍react-use-gesture的核心概念、使用方法以及实战应用。

## 安装与配置

### 安装

```bash
npm install @use-gesture/react

# 通常与React Spring配合使用
npm install @react-spring/web @use-gesture/react
```

### 基础导入

```tsx
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';
```

## 核心概念

### 手势类型

react-use-gesture支持以下手势类型:
- **drag**: 拖拽手势
- **pinch**: 捏合手势(触摸设备)
- **scroll**: 滚动手势
- **wheel**: 滚轮手势
- **hover**: 悬停手势
- **move**: 移动手势

### 手势状态

每个手势都包含丰富的状态信息:
- **offset**: 累积偏移量
- **delta**: 当前帧的变化量
- **velocity**: 速度
- **direction**: 方向
- **distance**: 距离
- **down**: 是否按下
- **first/last**: 是否是第一帧/最后一帧

## useDrag Hook

### 基础拖拽

```tsx
function BasicDrag() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  const bind = useDrag((state) => {
    api.start({
      x: state.offset[0],
      y: state.offset[1],
      immediate: state.down,
    });
  });
  
  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        width: 100,
        height: 100,
        backgroundColor: '#3b82f6',
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}
```

### 带边界限制的拖拽

```tsx
function BoundedDrag() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  const bind = useDrag(
    (state) => {
      const { offset: [ox, oy], down } = state;
      
      // 限制在容器内
      const bounds = {
        left: 0,
        right: window.innerWidth - 100,
        top: 0,
        bottom: window.innerHeight - 100,
      };
      
      api.start({
        x: Math.max(bounds.left, Math.min(ox, bounds.right)),
        y: Math.max(bounds.top, Math.min(oy, bounds.bottom)),
        immediate: down,
      });
    },
    {
      from: () => [x.get(), y.get()],
    }
  );
  
  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        width: 100,
        height: 100,
        backgroundColor: '#8b5cf6',
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}
```

### 拖拽惯性

```tsx
function DragWithInertia() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  const bind = useDrag(
    ({ down, offset: [ox, oy], velocity: [vx, vy] }) => {
      if (down) {
        api.start({
          x: ox,
          y: oy,
          immediate: true,
        });
      } else {
        // 使用速度计算惯性
        api.start({
          x: ox + vx * 200,
          y: oy + vy * 200,
          config: { friction: 30, tension: 200 },
        });
      }
    },
    {
      from: () => [x.get(), y.get()],
    }
  );
  
  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        width: 100,
        height: 100,
        backgroundColor: '#ec4899',
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );
}
```

## usePinch Hook

### 缩放手势

```tsx
function PinchZoom() {
  const [{ scale }, api] = useSpring(() => ({ scale: 1 }));
  
  const bind = usePinch(
    ({ offset: [s], down }) => {
      api.start({
        scale: s,
        immediate: down,
      });
    },
    {
      scaleBounds: { min: 0.5, max: 3 },
      rubberband: true,
    }
  );
  
  return (
    <animated.div
      {...bind()}
      style={{
        scale,
        width: 200,
        height: 200,
        backgroundColor: '#3b82f6',
        touchAction: 'none',
      }}
    >
      Pinch to zoom
    </animated.div>
  );
}
```

### 缩放与拖拽结合

```tsx
function PinchAndDrag() {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));
  
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], down }) => {
        api.start({
          x: ox,
          y: oy,
          immediate: down,
        });
      },
      onPinch: ({ offset: [s], down }) => {
        api.start({
          scale: s,
          immediate: down,
        });
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 3 },
        rubberband: true,
      },
    }
  );
  
  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        scale,
        width: 200,
        height: 200,
        backgroundColor: '#8b5cf6',
        touchAction: 'none',
      }}
    >
      Drag & Pinch
    </animated.div>
  );
}
```

## useWheel Hook

### 滚轮缩放

```tsx
function WheelZoom() {
  const [{ scale }, api] = useSpring(() => ({ scale: 1 }));
  
  const bind = useWheel(
    ({ delta: [, dy] }) => {
      const newScale = scale.get() - dy * 0.01;
      const clampedScale = Math.max(0.5, Math.min(3, newScale));
      
      api.start({ scale: clampedScale });
    }
  );
  
  return (
    <div {...bind()} style={{ overflow: 'hidden' }}>
      <animated.div
        style={{
          scale,
          width: 200,
          height: 200,
          backgroundColor: '#ec4899',
        }}
      >
        Scroll to zoom
      </animated.div>
    </div>
  );
}
```

### 横向滚动

```tsx
function HorizontalScroll() {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  
  const bind = useWheel(
    ({ delta: [, dy] }) => {
      const newX = x.get() - dy;
      const maxX = -(scrollWidth - containerWidth);
      
      api.start({
        x: Math.max(maxX, Math.min(0, newX)),
      });
    },
    {
      axis: 'y',
    }
  );
  
  return (
    <div {...bind()} className="scroll-container">
      <animated.div
        style={{
          x,
          display: 'flex',
        }}
        className="scroll-content"
      >
        {items.map((item) => (
          <div key={item.id} className="scroll-item">
            {item.content}
          </div>
        ))}
      </animated.div>
    </div>
  );
}
```

## useHover Hook

### 悬停效果

```tsx
function HoverCard() {
  const [{ scale, shadow }, api] = useSpring(() => ({
    scale: 1,
    shadow: 0,
  }));
  
  const bind = useHover(
    ({ hovering }) => {
      api.start({
        scale: hovering ? 1.05 : 1,
        shadow: hovering ? 20 : 5,
      });
    }
  );
  
  return (
    <animated.div
      {...bind()}
      style={{
        scale,
        boxShadow: shadow.to(
          (s) => `0 ${s}px ${s * 2}px rgba(0, 0, 0, 0.1)`
        ),
        width: 200,
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 8,
      }}
    >
      Hover me
    </animated.div>
  );
}
```

### 磁性悬停

```tsx
function MagneticHover() {
  const [{ x, y, rotateX, rotateY }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  }));
  
  const bind = useHover(
    ({ hovering, xy }) => {
      if (hovering) {
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = (xy[0] - centerX) / rect.width;
          const deltaY = (xy[1] - centerY) / rect.height;
          
          api.start({
            x: deltaX * 20,
            y: deltaY * 20,
            rotateX: -deltaY * 10,
            rotateY: deltaX * 10,
          });
        }
      } else {
        api.start({
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
        });
      }
    }
  );
  
  const elementRef = useRef<HTMLDivElement>(null);
  
  return (
    <animated.div
      ref={elementRef}
      {...bind()}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        width: 200,
        height: 200,
        backgroundColor: '#3b82f6',
      }}
    >
      Magnetic Hover
    </animated.div>
  );
}
```

## useMove Hook

### 跟随鼠标

```tsx
function FollowCursor() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  const bind = useMove(
    ({ xy: [mx, my] }) => {
      api.start({
        x: mx,
        y: my,
        config: { mass: 1, tension: 280, friction: 60 },
      });
    }
  );
  
  return (
    <div {...bind()} style={{ height: '100vh', position: 'relative' }}>
      <animated.div
        style={{
          x,
          y,
          position: 'absolute',
          width: 50,
          height: 50,
          backgroundColor: '#ec4899',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
```

### 视差效果

```tsx
function ParallaxLayers() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  const bind = useMove(
    ({ xy: [mx, my] }) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      api.start({
        x: (mx - centerX) / 10,
        y: (my - centerY) / 10,
      });
    }
  );
  
  return (
    <div {...bind()} className="parallax-container">
      <animated.div
        className="layer layer-1"
        style={{
          transform: x.to((x) => `translateX(${x * 0.5}px)`),
        }}
      />
      <animated.div
        className="layer layer-2"
        style={{
          transform: y.to((y) => `translateY(${y * 0.8}px)`),
        }}
      />
      <animated.div
        className="layer layer-3"
        style={{
          transform: x
            .to((x, y) => `translate3d(${x * 1.2}px, ${y * 1.2}px, 0)`)
            .to(y),
        }}
      />
    </div>
  );
}
```

## useGesture组合

### 多手势组合

```tsx
function MultiGesture() {
  const [{ x, y, scale, rotateZ }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0,
  }));
  
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], down }) => {
        api.start({
          x: ox,
          y: oy,
          immediate: down,
        });
      },
      onPinch: ({ offset: [s], down }) => {
        api.start({
          scale: s,
          immediate: down,
        });
      },
      onWheel: ({ offset: [, wy] }) => {
        api.start({
          rotateZ: wy / 2,
        });
      },
      onHover: ({ hovering }) => {
        api.start({
          scale: hovering ? scale.get() * 1.1 : scale.get(),
        });
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 2 },
        rubberband: true,
      },
    }
  );
  
  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        scale,
        rotateZ,
        width: 200,
        height: 200,
        backgroundColor: '#3b82f6',
        touchAction: 'none',
      }}
    >
      Multi-Gesture
    </animated.div>
  );
}
```

## 实战案例

### 1. 图片查看器

```tsx
function ImageViewer({ src }: { src: string }) {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));
  
  const bind = useGesture(
    {
      onDrag: ({ offset: [ox, oy], down }) => {
        api.start({
          x: ox,
          y: oy,
          immediate: down,
        });
      },
      onPinch: ({ offset: [s], down }) => {
        api.start({
          scale: s,
          immediate: down,
        });
      },
      onWheel: ({ delta: [, dy] }) => {
        const newScale = scale.get() - dy * 0.001;
        api.start({
          scale: Math.max(0.5, Math.min(3, newScale)),
        });
      },
      onDoubleClick: () => {
        api.start({
          x: 0,
          y: 0,
          scale: scale.get() === 1 ? 2 : 1,
        });
      },
    },
    {
      drag: {
        from: () => [x.get(), y.get()],
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 3 },
        rubberband: true,
      },
    }
  );
  
  return (
    <div className="image-viewer">
      <animated.img
        {...bind()}
        src={src}
        style={{
          x,
          y,
          scale,
          touchAction: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  );
}
```

### 2. 滑动卡片堆栈

```tsx
function CardStack({ cards }: { cards: Array<{ id: string; content: string }> }) {
  const [gone, setGone] = useState(new Set<string>());
  
  const [springs, api] = useSprings(
    cards.length,
    (i) => ({
      x: 0,
      y: 0,
      scale: 1,
      rotateZ: 0,
      opacity: 1,
    })
  );
  
  const bind = useDrag(
    ({ args: [index], down, movement: [mx, my], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2;
      const dir = xDir < 0 ? -1 : 1;
      
      if (!down && trigger) {
        setGone((prev) => new Set([...prev, cards[index].id]));
      }
      
      api.start((i) => {
        if (index !== i) return;
        
        const isGone = gone.has(cards[index].id);
        const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
        const rotateZ = mx / 100 + (isGone ? dir * 10 : 0);
        const scale = down ? 1.1 : 1;
        
        return {
          x,
          rotateZ,
          scale,
          opacity: isGone ? 0 : 1,
        };
      });
    }
  );
  
  return (
    <div className="card-stack">
      {springs.map((spring, index) => {
        if (gone.has(cards[index].id)) return null;
        
        return (
          <animated.div
            key={cards[index].id}
            {...bind(index)}
            style={{
              ...spring,
              touchAction: 'none',
            }}
            className="stack-card"
          >
            {cards[index].content}
          </animated.div>
        );
      })}
    </div>
  );
}
```

### 3. 拖拽刷新

```tsx
function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [{ y }, api] = useSpring(() => ({ y: 0 }));
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const bind = useDrag(
    async ({ down, movement: [, my] }) => {
      if (my < 0) {
        api.start({ y: 0 });
        return;
      }
      
      if (down) {
        api.start({ y: Math.min(my, 100), immediate: true });
      } else {
        if (my > 80) {
          setIsRefreshing(true);
          api.start({ y: 60 });
          
          await onRefresh();
          
          setIsRefreshing(false);
          api.start({ y: 0 });
        } else {
          api.start({ y: 0 });
        }
      }
    },
    {
      axis: 'y',
      filterTaps: true,
    }
  );
  
  return (
    <div className="pull-to-refresh">
      <animated.div
        style={{
          y,
          height: y.to((y) => Math.max(0, y)),
        }}
        className="refresh-indicator"
      >
        {isRefreshing ? <Spinner /> : <Arrow />}
      </animated.div>
      
      <div {...bind()} className="content">
        {/* 内容 */}
      </div>
    </div>
  );
}
```

### 4. 轮播图

```tsx
function Carousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const width = window.innerWidth;
  
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  
  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], cancel }) => {
      if (down && Math.abs(mx) > width / 2) {
        const newIndex = index + (xDir > 0 ? -1 : 1);
        
        if (newIndex >= 0 && newIndex < images.length) {
          setIndex(newIndex);
          cancel();
        }
      }
      
      api.start({
        x: down ? mx : -index * width,
        immediate: down,
      });
    },
    {
      from: () => [x.get(), 0],
      axis: 'x',
    }
  );
  
  useEffect(() => {
    api.start({ x: -index * width });
  }, [index, width, api]);
  
  return (
    <div className="carousel" style={{ overflow: 'hidden', width }}>
      <animated.div
        {...bind()}
        style={{
          display: 'flex',
          width: images.length * width,
          x,
          touchAction: 'pan-y',
        }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            style={{ width, objectFit: 'cover' }}
            alt={`Slide ${i}`}
          />
        ))}
      </animated.div>
      
      <div className="carousel-indicators">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={i === index ? 'active' : ''}
          />
        ))}
      </div>
    </div>
  );
}
```

### 5. 3D旋转卡片

```tsx
function RotatingCard() {
  const [{ rotateX, rotateY }, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
  }));
  
  const bind = useMove(
    ({ xy: [x, y] }) => {
      const rect = cardRef.current?.getBoundingClientRect();
      
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const rotateY = ((x - centerX) / rect.width) * 30;
        const rotateX = -((y - centerY) / rect.height) * 30;
        
        api.start({ rotateX, rotateY });
      }
    }
  );
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <div {...bind()} className="card-container">
      <animated.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="rotating-card"
        onMouseLeave={() => api.start({ rotateX: 0, rotateY: 0 })}
      >
        <div className="card-front">Front</div>
        <div className="card-back">Back</div>
      </animated.div>
    </div>
  );
}
```

### 6. 滑动菜单

```tsx
function SwipeMenu() {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));
  const [menuOpen, setMenuOpen] = useState(false);
  
  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [xDir] }) => {
      if (!down) {
        const shouldOpen = mx > 100 || (vx > 0.5 && xDir > 0);
        const shouldClose = mx < -100 || (vx > 0.5 && xDir < 0);
        
        if (shouldOpen && !menuOpen) {
          setMenuOpen(true);
          api.start({ x: 200 });
        } else if (shouldClose && menuOpen) {
          setMenuOpen(false);
          api.start({ x: 0 });
        } else {
          api.start({ x: menuOpen ? 200 : 0 });
        }
      } else {
        api.start({
          x: menuOpen ? 200 + mx : mx,
          immediate: true,
        });
      }
    },
    {
      axis: 'x',
      bounds: { left: 0, right: 200 },
      rubberband: true,
    }
  );
  
  return (
    <div className="swipe-menu-container">
      <div className="menu">
        <button>Option 1</button>
        <button>Option 2</button>
        <button>Option 3</button>
      </div>
      
      <animated.div
        {...bind()}
        style={{
          x,
          touchAction: 'pan-y',
        }}
        className="main-content"
      >
        Main Content
      </animated.div>
    </div>
  );
}
```

## 高级配置

### 自定义阈值

```tsx
function ThresholdDrag() {
  const bind = useDrag(
    ({ offset: [ox, oy] }) => {
      // 处理拖拽
    },
    {
      threshold: [10, 10], // x和y方向需要移动10px才激活
      filterTaps: true, // 过滤点击事件
    }
  );
  
  return <div {...bind()}>Drag with threshold</div>;
}
```

### 延迟激活

```tsx
function DelayedDrag() {
  const bind = useDrag(
    ({ offset }) => {
      // 处理拖拽
    },
    {
      delay: 200, // 延迟200ms激活
    }
  );
  
  return <div {...bind()}>Long press to drag</div>;
}
```

### 橡皮筋效果

```tsx
function RubberbandDrag() {
  const bind = useDrag(
    ({ offset: [ox, oy] }) => {
      // 处理拖拽
    },
    {
      bounds: { left: 0, right: 500, top: 0, bottom: 500 },
      rubberband: 0.2, // 橡皮筋强度
    }
  );
  
  return <div {...bind()}>Rubberband drag</div>;
}
```

## 性能优化

### 使用immediate标志

```tsx
function OptimizedDrag() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  const bind = useDrag(
    ({ offset: [ox, oy], down }) => {
      api.start({
        x: ox,
        y: oy,
        immediate: down, // 拖拽时立即更新，释放时动画
      });
    }
  );
  
  return <animated.div {...bind()} style={{ x, y }} />;
}
```

### 使用transform代替位置

```tsx
// ✅ 使用transform性能更好
function GoodPerformance() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  return (
    <animated.div
      style={{
        transform: x.to((x, y) => `translate3d(${x}px, ${y}px, 0)`).to(y),
      }}
    />
  );
}

// ❌ 使用left/top性能较差
function BadPerformance() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  
  return (
    <animated.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
      }}
    />
  );
}
```

## 最佳实践总结

### 性能优化

```
✅ 使用transform代替position
✅ 合理使用immediate标志
✅ 使用touchAction避免默认行为
✅ 设置合适的阈值避免误触
✅ 使用useCallback缓存回调
```

### 用户体验

```
✅ 提供视觉反馈
✅ 设置合理的边界
✅ 使用橡皮筋效果
✅ 支持惯性滚动
✅ 响应式设计
```

### 可访问性

```
✅ 提供键盘替代方案
✅ 支持触摸和鼠标
✅ 提供操作提示
✅ 避免纯手势交互
```

react-use-gesture为React应用提供了强大的手势识别能力。通过合理使用这些手势,可以创建更加自然和直观的用户交互体验。

