# React Spring高级应用

## 概述

本文将深入探讨React Spring的高级特性和应用场景,包括复杂的动画编排、高性能优化技巧、与其他库的集成,以及生产环境的最佳实践。这些高级技术将帮助你构建更加复杂和精细的交互体验。

## 高级Hook使用

### useSpringRef

```tsx
import { useSpringRef, useSpring, animated } from '@react-spring/web';

function SpringRefExample() {
  const springRef = useSpringRef();
  
  const springs = useSpring({
    ref: springRef,
    from: { opacity: 0, scale: 0 },
    to: { opacity: 1, scale: 1 },
  });
  
  const handleStart = () => {
    springRef.start({
      to: { opacity: 0.5, scale: 1.2 },
      config: { tension: 300 },
    });
  };
  
  const handleReset = () => {
    springRef.start({
      to: { opacity: 1, scale: 1 },
      reset: true,
    });
  };
  
  return (
    <>
      <animated.div style={springs}>Controlled Spring</animated.div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleReset}>Reset</button>
    </>
  );
}
```

### useSpringValue深度应用

```tsx
import { useSpringValue, animated, to } from '@react-spring/web';

function AdvancedSpringValue() {
  const x = useSpringValue(0, {
    config: { mass: 1, tension: 170, friction: 26 },
  });
  
  const y = useSpringValue(0, {
    config: { mass: 1, tension: 170, friction: 26 },
  });
  
  // 组合多个SpringValue
  const transform = to([x, y], (x, y) => 
    `translate3d(${x}px, ${y}px, 0) rotate(${x * 0.1}deg)`
  );
  
  const handleDrag = (e: React.MouseEvent) => {
    x.start(e.clientX - 200);
    y.start(e.clientY - 200);
  };
  
  // 监听值变化
  useEffect(() => {
    const unsubscribe = x.onChange((value) => {
      console.log('X changed:', value);
    });
    
    return unsubscribe;
  }, [x]);
  
  return (
    <div onMouseMove={handleDrag}>
      <animated.div
        style={{
          transform,
          width: 100,
          height: 100,
          backgroundColor: '#3b82f6',
        }}
      />
    </div>
  );
}
```

### useChain高级编排

```tsx
function ComplexChain() {
  const containerRef = useSpringRef();
  const itemsRef = useSpringRef();
  const textRef = useSpringRef();
  
  const [open, setOpen] = useState(false);
  
  // 容器动画
  const containerSpring = useSpring({
    ref: containerRef,
    width: open ? 400 : 100,
    height: open ? 300 : 100,
    backgroundColor: open ? '#3b82f6' : '#8b5cf6',
  });
  
  // 列表项动画
  const itemSprings = useSprings(
    5,
    Array.from({ length: 5 }).map((_, i) => ({
      ref: itemsRef,
      opacity: open ? 1 : 0,
      transform: open
        ? `translate3d(0,0,0) scale(1)`
        : `translate3d(-50px,0,0) scale(0.8)`,
      delay: i * 50,
    }))
  );
  
  // 文字动画
  const textSpring = useSpring({
    ref: textRef,
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(-20px)',
  });
  
  // 链式执行:容器 -> 列表项 -> 文字
  useChain(
    open
      ? [containerRef, itemsRef, textRef]
      : [textRef, itemsRef, containerRef],
    open ? [0, 0.3, 0.6] : [0, 0.1, 0.4]
  );
  
  return (
    <>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      
      <animated.div style={containerSpring} className="container">
        {itemSprings.map((style, i) => (
          <animated.div key={i} style={style} className="item">
            Item {i + 1}
          </animated.div>
        ))}
        
        <animated.div style={textSpring} className="text">
          Chained Animation
        </animated.div>
      </animated.div>
    </>
  );
}
```

## 手势集成

### 与react-use-gesture集成

```tsx
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

function GestureIntegration() {
  const [{ x, y, rotateZ, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotateZ: 0,
    scale: 1,
  }));
  
  const bind = useGesture(
    {
      // 拖拽
      onDrag: ({ offset: [x, y] }) => {
        api.start({ x, y });
      },
      
      // 捏合缩放
      onPinch: ({ offset: [scale] }) => {
        api.start({ scale });
      },
      
      // 滚轮
      onWheel: ({ offset: [, y] }) => {
        api.start({ rotateZ: y });
      },
      
      // 悬停
      onHover: ({ hovering }) => {
        api.start({
          scale: hovering ? 1.1 : 1,
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
        touchAction: 'none',
      }}
      className="draggable-box"
    >
      Drag, Pinch & Scroll
    </animated.div>
  );
}
```

### 卡片滑动

```tsx
function SwipeCard() {
  const [gone, setGone] = useState(false);
  
  const [{ x, rotateZ }, api] = useSpring(() => ({
    x: 0,
    rotateZ: 0,
  }));
  
  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2; // 滑动速度阈值
      const dir = xDir < 0 ? -1 : 1;
      
      if (!down && trigger) {
        setGone(true);
        api.start({
          x: (200 + window.innerWidth) * dir,
          rotateZ: dir * 45,
        });
      } else {
        api.start({
          x: down ? mx : 0,
          rotateZ: down ? mx * 0.1 : 0,
        });
      }
    },
  });
  
  if (gone) {
    return <div>Card swiped away!</div>;
  }
  
  return (
    <animated.div
      {...bind()}
      style={{
        x,
        rotateZ,
        touchAction: 'none',
      }}
      className="swipe-card"
    >
      Swipe me left or right
    </animated.div>
  );
}
```

## 复杂交互场景

### 无限轮播

```tsx
function InfiniteCarousel() {
  const slides = [
    { id: 1, color: '#3b82f6', title: 'Slide 1' },
    { id: 2, color: '#8b5cf6', title: 'Slide 2' },
    { id: 3, color: '#ec4899', title: 'Slide 3' },
  ];
  
  const [index, setIndex] = useState(0);
  const width = window.innerWidth;
  
  const [{ x }, api] = useSpring(() => ({
    x: 0,
  }));
  
  const bind = useGesture({
    onDrag: ({ active, movement: [mx], direction: [xDir], cancel }) => {
      if (active && Math.abs(mx) > width / 2) {
        const newIndex = index + (xDir > 0 ? -1 : 1);
        setIndex(clamp(newIndex, 0, slides.length - 1));
        cancel();
      }
      
      api.start({
        x: active ? mx : -index * width,
        immediate: active,
      });
    },
  });
  
  // 自动播放
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    api.start({ x: -index * width });
  }, [index, width, api]);
  
  return (
    <div className="carousel" style={{ overflow: 'hidden', width }}>
      <animated.div
        {...bind()}
        style={{
          display: 'flex',
          width: slides.length * width,
          x,
          touchAction: 'pan-y',
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            style={{
              width,
              backgroundColor: slide.color,
            }}
          >
            <h2>{slide.title}</h2>
          </div>
        ))}
      </animated.div>
      
      <div className="dots">
        {slides.map((_, i) => (
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
```

### 视差滚动

```tsx
function ParallaxScroll() {
  const [{ scrollY }, api] = useSpring(() => ({
    scrollY: 0,
  }));
  
  useEffect(() => {
    const handleScroll = () => {
      api.start({ scrollY: window.scrollY });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [api]);
  
  return (
    <>
      <animated.div
        className="parallax-layer layer-1"
        style={{
          transform: scrollY.to(
            y => `translate3d(0, ${y * 0.3}px, 0)`
          ),
        }}
      >
        <h1>Layer 1 (Slow)</h1>
      </animated.div>
      
      <animated.div
        className="parallax-layer layer-2"
        style={{
          transform: scrollY.to(
            y => `translate3d(0, ${y * 0.6}px, 0)`
          ),
        }}
      >
        <h2>Layer 2 (Medium)</h2>
      </animated.div>
      
      <animated.div
        className="parallax-layer layer-3"
        style={{
          transform: scrollY.to(
            y => `translate3d(0, ${y * 0.9}px, 0)`
          ),
        }}
      >
        <h3>Layer 3 (Fast)</h3>
      </animated.div>
    </>
  );
}
```

### 磁性吸附

```tsx
function MagneticButton() {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    
    const maxDistance = 150;
    const magneticPower = 0.3;
    
    if (distance < maxDistance) {
      api.start({
        x: distanceX * magneticPower,
        y: distanceY * magneticPower,
        scale: 1.1,
      });
    } else {
      api.start({
        x: 0,
        y: 0,
        scale: 1,
      });
    }
  };
  
  return (
    <div
      className="magnetic-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => api.start({ x: 0, y: 0, scale: 1 })}
    >
      <animated.button
        ref={buttonRef}
        style={{
          x,
          y,
          scale,
        }}
        className="magnetic-button"
      >
        Magnetic Button
      </animated.button>
    </div>
  );
}
```

## 与Three.js集成

### 3D场景动画

```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';

function AnimatedBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const [active, setActive] = useState(false);
  
  const { scale, rotationY } = useSpring({
    scale: active ? 1.5 : 1,
    rotationY: active ? Math.PI : 0,
    config: { mass: 1, tension: 280, friction: 60 },
  });
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.5;
    }
  });
  
  return (
    <a.mesh
      ref={meshRef}
      scale={scale}
      rotation-y={rotationY}
      onClick={() => setActive(!active)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={active ? '#ec4899' : '#3b82f6'} />
    </a.mesh>
  );
}

function ThreeScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <AnimatedBox />
    </Canvas>
  );
}
```

## 性能优化深度

### 动画帧控制

```tsx
function FrameControl() {
  const [running, setRunning] = useState(true);
  const springRef = useSpringRef();
  
  const springs = useSpring({
    ref: springRef,
    from: { x: 0 },
    to: { x: 100 },
    loop: true,
    config: { duration: 2000 },
  });
  
  // 暂停/恢复动画
  const handleToggle = () => {
    if (running) {
      springRef.pause();
    } else {
      springRef.resume();
    }
    setRunning(!running);
  };
  
  // 停止并重置
  const handleStop = () => {
    springRef.stop();
    springRef.start({ x: 0, immediate: true });
    setRunning(false);
  };
  
  return (
    <>
      <animated.div
        style={{
          transform: springs.x.to(x => `translateX(${x}px)`),
        }}
      >
        Controlled Animation
      </animated.div>
      
      <button onClick={handleToggle}>
        {running ? 'Pause' : 'Resume'}
      </button>
      <button onClick={handleStop}>Stop</button>
    </>
  );
}
```

### 批量更新

```tsx
function BatchUpdate() {
  const [items] = useState(Array.from({ length: 100 }, (_, i) => i));
  
  const [springs, api] = useSprings(items.length, (index) => ({
    opacity: 1,
    transform: 'translateY(0px)',
  }));
  
  const handleBatchUpdate = () => {
    // 使用批量更新避免多次渲染
    api.start((index) => ({
      opacity: Math.random(),
      transform: `translateY(${Math.random() * 50}px)`,
      delay: index * 10,
    }));
  };
  
  return (
    <>
      <button onClick={handleBatchUpdate}>Batch Update</button>
      
      <div className="grid">
        {springs.map((style, index) => (
          <animated.div key={index} style={style} className="grid-item">
            {index}
          </animated.div>
        ))}
      </div>
    </>
  );
}
```

### 懒加载动画

```tsx
function LazyAnimation() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // 只在元素可见时创建动画
  const springs = useSpring({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(50px)',
    config: { mass: 1, tension: 280, friction: 60 },
  });
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref}>
      {visible && (
        <animated.div style={springs}>
          Lazy Loaded Animation
        </animated.div>
      )}
    </div>
  );
}
```

## 实战案例

### 1. 高级菜单

```tsx
function AdvancedMenu() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const menuItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '👤', label: 'Profile', path: '/profile' },
    { icon: '⚙️', label: 'Settings', path: '/settings' },
    { icon: '📧', label: 'Messages', path: '/messages' },
    { icon: '🚪', label: 'Logout', path: '/logout' },
  ];
  
  // 菜单容器动画
  const containerSpring = useSpring({
    width: open ? 200 : 60,
    config: { mass: 1, tension: 300, friction: 30 },
  });
  
  // 菜单项动画
  const itemSprings = useSprings(
    menuItems.length,
    menuItems.map((_, index) => ({
      opacity: open ? 1 : 0,
      transform: open
        ? 'translate3d(0,0,0)'
        : 'translate3d(-20px,0,0)',
      delay: open ? index * 50 : 0,
    }))
  );
  
  // 背景高亮动画
  const highlightSpring = useSpring({
    top: activeIndex !== null ? activeIndex * 50 : 0,
    opacity: activeIndex !== null ? 1 : 0,
  });
  
  return (
    <animated.nav style={containerSpring} className="advanced-menu">
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      
      <animated.div
        className="menu-highlight"
        style={highlightSpring}
      />
      
      {itemSprings.map((style, index) => (
        <animated.a
          key={index}
          href={menuItems[index].path}
          style={style}
          className="menu-item"
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <span className="menu-icon">{menuItems[index].icon}</span>
          {open && <span className="menu-label">{menuItems[index].label}</span>}
        </animated.a>
      ))}
    </animated.nav>
  );
}
```

### 2. 数据可视化动画

```tsx
function AnimatedChart({ data }: { data: number[] }) {
  const maxValue = Math.max(...data);
  
  const springs = useSprings(
    data.length,
    data.map((value, index) => ({
      height: (value / maxValue) * 200,
      opacity: 1,
      from: { height: 0, opacity: 0 },
      delay: index * 100,
      config: { mass: 1, tension: 280, friction: 60 },
    }))
  );
  
  return (
    <div className="chart">
      {springs.map((style, index) => (
        <animated.div
          key={index}
          style={style}
          className="bar"
        >
          <span className="value">{data[index]}</span>
        </animated.div>
      ))}
    </div>
  );
}

function DataVisualization() {
  const [data, setData] = useState([30, 50, 70, 40, 90, 60]);
  
  const handleRefresh = () => {
    setData(Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)));
  };
  
  return (
    <>
      <button onClick={handleRefresh}>Refresh Data</button>
      <AnimatedChart data={data} />
    </>
  );
}
```

### 3. 加载动画组件

```tsx
function LoadingSpinner() {
  const dots = Array.from({ length: 3 });
  
  const springs = useSprings(
    dots.length,
    dots.map((_, index) => ({
      from: { y: 0 },
      to: async (next) => {
        while (true) {
          await next({ y: -20 });
          await next({ y: 0 });
        }
      },
      delay: index * 150,
      config: { tension: 300, friction: 10 },
    }))
  );
  
  return (
    <div className="loading-spinner">
      {springs.map((style, index) => (
        <animated.div
          key={index}
          className="dot"
          style={{
            transform: style.y.to(y => `translateY(${y}px)`),
          }}
        />
      ))}
    </div>
  );
}
```

### 4. 表单验证动画

```tsx
function AnimatedFormField({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorSpring = useSpring({
    height: error ? 24 : 0,
    opacity: error ? 1 : 0,
    transform: error ? 'translateY(0)' : 'translateY(-10px)',
  });
  
  const shakeSpring = useSpring({
    from: { x: 0 },
    to: error ? [
      { x: -10 },
      { x: 10 },
      { x: -10 },
      { x: 10 },
      { x: 0 },
    ] : { x: 0 },
    config: { duration: 100 },
  });
  
  return (
    <div className="form-field">
      <label>{label}</label>
      <animated.div style={shakeSpring}>
        <input
          {...props}
          className={error ? 'error' : ''}
        />
      </animated.div>
      <animated.div style={errorSpring} className="error-message">
        {error}
      </animated.div>
    </div>
  );
}
```

### 5. 图片画廊

```tsx
function ImageGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const overlaySpring = useSpring({
    opacity: selectedIndex !== null ? 1 : 0,
    pointerEvents: selectedIndex !== null ? 'auto' : 'none',
  });
  
  const modalSpring = useSpring({
    transform: selectedIndex !== null
      ? 'translate(-50%, -50%) scale(1)'
      : 'translate(-50%, -50%) scale(0.8)',
    opacity: selectedIndex !== null ? 1 : 0,
  });
  
  const transitions = useTransition(
    images.map((img, i) => ({ img, key: i })),
    {
      from: { opacity: 0, transform: 'scale(0.8)' },
      enter: { opacity: 1, transform: 'scale(1)' },
      leave: { opacity: 0, transform: 'scale(0.8)' },
      trail: 50,
      keys: item => item.key,
    }
  );
  
  return (
    <>
      <div className="gallery-grid">
        {transitions((style, { img, key }) => (
          <animated.div
            style={style}
            className="gallery-item"
            onClick={() => setSelectedIndex(key)}
          >
            <img src={img} alt={`Gallery ${key}`} />
          </animated.div>
        ))}
      </div>
      
      <animated.div
        style={overlaySpring}
        className="gallery-overlay"
        onClick={() => setSelectedIndex(null)}
      />
      
      <animated.div
        style={{
          ...modalSpring,
          position: 'fixed',
          top: '50%',
          left: '50%',
        }}
        className="gallery-modal"
      >
        {selectedIndex !== null && (
          <img src={images[selectedIndex]} alt="Selected" />
        )}
      </animated.div>
    </>
  );
}
```

## 调试与测试

### 动画调试

```tsx
function AnimationDebugger() {
  const [debug, setDebug] = useState(false);
  
  const springs = useSpring({
    x: 100,
    config: { mass: 1, tension: 170, friction: 26 },
    onChange: (result) => {
      if (debug) {
        console.log('Animation values:', result.value);
      }
    },
    onStart: () => {
      if (debug) console.log('Animation started');
    },
    onRest: () => {
      if (debug) console.log('Animation finished');
    },
  });
  
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={debug}
          onChange={(e) => setDebug(e.target.checked)}
        />
        Enable Debug
      </label>
      
      <animated.div style={{ transform: springs.x.to(x => `translateX(${x}px)`) }}>
        Debug Animation
      </animated.div>
    </>
  );
}
```

### 测试动画组件

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('Spring Animation', () => {
  it('animates on mount', async () => {
    const { container } = render(<FadeIn>Test</FadeIn>);
    
    const element = container.firstChild as HTMLElement;
    
    // 初始状态
    expect(element).toHaveStyle({ opacity: '0' });
    
    // 等待动画完成
    await waitFor(() => {
      expect(element).toHaveStyle({ opacity: '1' });
    }, { timeout: 1000 });
  });
  
  it('responds to state changes', async () => {
    const { rerender } = render(<SpringButton active={false} />);
    
    rerender(<SpringButton active={true} />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ transform: 'scale(1.2)' });
    });
  });
});
```

## 最佳实践总结

### 性能优化清单

```
✅ 使用useSpringValue避免不必要的重渲染
✅ 合理使用useSpringRef控制动画
✅ 批量更新多个动画状态
✅ 使用Intersection Observer懒加载动画
✅ 避免在动画循环中执行昂贵操作
✅ 使用transform和opacity实现GPU加速
✅ 合理配置物理参数避免过度计算
```

### 用户体验优化

```
✅ 使用自然的物理参数
✅ 提供即时的视觉反馈
✅ 避免过度使用动画
✅ 保持动画的一致性
✅ 支持减少动画偏好设置
✅ 在低端设备降级动画
```

### 开发流程

```
✅ 使用调试工具监控动画性能
✅ 编写动画组件的单元测试
✅ 在多种设备测试动画效果
✅ 使用TypeScript确保类型安全
✅ 文档化自定义动画配置
```

React Spring的高级特性为复杂交互提供了强大支持。掌握这些技术,你可以创建出色的用户体验,同时保持代码的可维护性和性能。

