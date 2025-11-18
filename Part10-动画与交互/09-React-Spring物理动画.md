# React Spring物理动画

## 概述

React Spring是一个基于物理的动画库,通过模拟现实世界的物理运动创建自然流畅的动画效果。与传统的基于时间的动画不同,React Spring使用弹簧物理学来驱动动画,让界面交互更加真实和吸引人。本文将全面讲解React Spring的核心概念、使用方法以及实战应用。

## 安装与配置

### 安装

```bash
# npm
npm install @react-spring/web

# yarn
yarn add @react-spring/web

# pnpm
pnpm add @react-spring/web
```

### 基础导入

```tsx
import { useSpring, animated } from '@react-spring/web';
```

## 核心概念

### 弹簧物理

React Spring不使用持续时间和缓动曲线,而是使用物理属性:
- **mass(质量)**: 元素的质量,影响惯性
- **tension(张力)**: 弹簧的张力,影响速度
- **friction(摩擦力)**: 阻力,影响减速
- **clamp**: 是否限制过冲

### animated组件

```tsx
// 基础使用
import { animated } from '@react-spring/web';

function BasicAnimation() {
  return (
    <animated.div
      style={{
        opacity: 1,
        transform: 'translateX(0px)',
      }}
    >
      Animated Content
    </animated.div>
  );
}
```

## useSpring Hook

### 基础用法

```tsx
function SimpleSpring() {
  const springs = useSpring({
    from: { opacity: 0, transform: 'translateY(-40px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
  });
  
  return (
    <animated.div style={springs}>
      Fade In & Slide Down
    </animated.div>
  );
}
```

### 交互式弹簧

```tsx
function InteractiveSpring() {
  const [flipped, setFlipped] = useState(false);
  
  const springs = useSpring({
    transform: flipped
      ? 'translate3d(0,0,0) rotateY(180deg)'
      : 'translate3d(0,0,0) rotateY(0deg)',
    config: { mass: 5, tension: 500, friction: 80 },
  });
  
  return (
    <animated.div
      style={springs}
      onClick={() => setFlipped(!flipped)}
    >
      Click to Flip
    </animated.div>
  );
}
```

### 多个属性动画

```tsx
function MultiProperty() {
  const springs = useSpring({
    from: {
      opacity: 0,
      scale: 0.5,
      rotate: -45,
    },
    to: {
      opacity: 1,
      scale: 1,
      rotate: 0,
    },
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    },
  });
  
  return (
    <animated.div
      style={{
        opacity: springs.opacity,
        transform: springs.rotate.to(r => `rotate(${r}deg) scale(${springs.scale})`),
      }}
    >
      Multi-Property Animation
    </animated.div>
  );
}
```

## useSprings Hook

### 数组动画

```tsx
function SpringsArray() {
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
  
  const springs = useSprings(
    items.length,
    items.map((_, index) => ({
      from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
      to: { opacity: 1, transform: 'translate3d(0,0px,0)' },
      delay: index * 100,
    }))
  );
  
  return (
    <div>
      {springs.map((props, index) => (
        <animated.div key={index} style={props}>
          {items[index]}
        </animated.div>
      ))}
    </div>
  );
}
```

### 交错动画

```tsx
function StaggeredSprings() {
  const [toggle, setToggle] = useState(false);
  
  const springs = useSprings(
    5,
    Array.from({ length: 5 }).map((_, index) => ({
      opacity: toggle ? 1 : 0,
      transform: toggle
        ? `translate3d(0,0px,0) scale(1)`
        : `translate3d(0,-40px,0) scale(0.8)`,
      delay: index * 50,
      config: { mass: 1, tension: 280, friction: 60 },
    }))
  );
  
  return (
    <>
      <button onClick={() => setToggle(!toggle)}>Toggle</button>
      
      <div className="staggered-list">
        {springs.map((props, index) => (
          <animated.div key={index} style={props} className="item">
            Item {index + 1}
          </animated.div>
        ))}
      </div>
    </>
  );
}
```

## useTrail Hook

### 追踪动画

```tsx
function TrailAnimation() {
  const [open, setOpen] = useState(false);
  const items = ['Hello', 'World', 'From', 'React', 'Spring'];
  
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: open ? 1 : 0,
    x: open ? 0 : 20,
    height: open ? 80 : 0,
  });
  
  return (
    <>
      <button onClick={() => setOpen(!open)}>Toggle</button>
      
      <div className="trails-main">
        {trail.map((style, index) => (
          <animated.div
            key={index}
            style={{
              ...style,
              transform: style.x.to(x => `translate3d(${x}px,0,0)`),
            }}
            className="trails-text"
          >
            {items[index]}
          </animated.div>
        ))}
      </div>
    </>
  );
}
```

## useChain Hook

### 链式动画

```tsx
function ChainedAnimation() {
  const springRef = useRef<any>();
  const trailRef = useRef<any>();
  
  const springs = useSpring({
    ref: springRef,
    from: { opacity: 0, transform: 'scale(0)' },
    to: { opacity: 1, transform: 'scale(1)' },
  });
  
  const trail = useTrail(3, {
    ref: trailRef,
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
  });
  
  useChain([springRef, trailRef], [0, 0.5]);  // 第一个动画后0.5秒开始第二个
  
  return (
    <>
      <animated.div style={springs} className="container">
        Container
      </animated.div>
      
      {trail.map((style, index) => (
        <animated.div key={index} style={style} className="item">
          Item {index + 1}
        </animated.div>
      ))}
    </>
  );
}
```

## useTransition Hook

### 列表过渡

```tsx
function ListTransition() {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
  ]);
  
  const transitions = useTransition(items, {
    from: { opacity: 0, transform: 'translate3d(-40px,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(40px,0,0)' },
    keys: item => item.id,
  });
  
  return (
    <>
      <button onClick={() => setItems([...items, {
        id: Date.now(),
        text: `Item ${items.length + 1}`
      }])}>
        Add Item
      </button>
      
      <div>
        {transitions((style, item) => (
          <animated.div style={style}>
            <span>{item.text}</span>
            <button onClick={() => setItems(items.filter(i => i.id !== item.id))}>
              Remove
            </button>
          </animated.div>
        ))}
      </div>
    </>
  );
}
```

### 路由过渡

```tsx
import { useLocation } from 'react-router-dom';

function RouteTransition() {
  const location = useLocation();
  
  const transitions = useTransition(location, {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
  });
  
  return transitions((style, item) => (
    <animated.div style={style}>
      <Routes location={item}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </animated.div>
  ));
}
```

## 实战案例

### 1. 悬浮卡片

```tsx
function HoverCard() {
  const [props, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { mass: 5, tension: 350, friction: 40 },
  }));
  
  const calc = (x: number, y: number, rect: DOMRect) => {
    const xPct = (x - rect.left) / rect.width - 0.5;
    const yPct = (y - rect.top) / rect.height - 0.5;
    
    return [
      -(yPct * 20),  // rotateX
      xPct * 20,     // rotateY
      1.1,           // scale
    ];
  };
  
  return (
    <animated.div
      className="card-3d"
      style={{
        transform: props.rotateX.to(
          (x, y, s) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`
        ),
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const [rotateX, rotateY, scale] = calc(e.clientX, e.clientY, rect);
        api.start({ rotateX, rotateY, scale });
      }}
      onMouseLeave={() => api.start({ rotateX: 0, rotateY: 0, scale: 1 })}
    >
      Hover Me
    </animated.div>
  );
}
```

### 2. 抽屉菜单

```tsx
function DrawerMenu() {
  const [open, setOpen] = useState(false);
  
  const { x } = useSpring({
    x: open ? 0 : -300,
    config: { mass: 1, tension: 280, friction: 60 },
  });
  
  const overlaySpring = useSpring({
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
  });
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Menu</button>
      
      <animated.div
        className="overlay"
        style={overlaySpring}
        onClick={() => setOpen(false)}
      />
      
      <animated.div
        className="drawer"
        style={{
          transform: x.to(x => `translate3d(${x}px,0,0)`),
        }}
      >
        <button onClick={() => setOpen(false)}>Close</button>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </animated.div>
    </>
  );
}
```

### 3. 数字滚动

```tsx
function AnimatedNumber({ value }: { value: number }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });
  
  return <animated.span>{number.to(n => n.toFixed(0))}</animated.span>;
}

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <AnimatedNumber value={count} />
      <button onClick={() => setCount(count + 10)}>+10</button>
    </div>
  );
}
```

### 4. 进度条

```tsx
function ProgressBar({ progress }: { progress: number }) {
  const springs = useSpring({
    width: `${progress}%`,
    backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
    config: { tension: 280, friction: 60 },
  });
  
  return (
    <div className="progress-container">
      <animated.div
        className="progress-bar"
        style={springs}
      />
      <span className="progress-text">{progress}%</span>
    </div>
  );
}

function UploadProgress() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 10;
      });
    }, 500);
    
    return () => clearInterval(timer);
  }, []);
  
  return <ProgressBar progress={progress} />;
}
```

### 5. 模态框

```tsx
function SpringModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const overlaySpring = useSpring({
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  });
  
  const modalSpring = useSpring({
    transform: isOpen
      ? 'translate3d(-50%,-50%,0) scale(1)'
      : 'translate3d(-50%,-50%,0) scale(0.9)',
    opacity: isOpen ? 1 : 0,
    config: { mass: 1, tension: 300, friction: 30 },
  });
  
  return (
    <>
      <animated.div
        className="modal-overlay"
        style={overlaySpring}
        onClick={onClose}
      />
      
      <animated.div
        className="modal"
        style={{
          ...modalSpring,
          position: 'fixed',
          top: '50%',
          left: '50%',
        }}
      >
        <h2>Modal Title</h2>
        <p>Modal content goes here...</p>
        <button onClick={onClose}>Close</button>
      </animated.div>
    </>
  );
}
```

### 6. 通知Toast

```tsx
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const springs = useSpring({
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    to: { opacity: 1, transform: 'translate3d(0,0,0)' },
    config: { mass: 1, tension: 280, friction: 60 },
  });
  
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <animated.div className="toast" style={springs}>
      {message}
      <button onClick={onClose}>×</button>
    </animated.div>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);
  
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const transitions = useTransition(toasts, {
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    keys: item => item.id,
  });
  
  return (
    <div className="toast-container">
      {transitions((style, item) => (
        <animated.div style={style}>
          <Toast
            message={item.message}
            onClose={() => removeToast(item.id)}
          />
        </animated.div>
      ))}
    </div>
  );
}
```

## 高级技巧

### 插值函数

```tsx
function Interpolation() {
  const [flip, setFlip] = useState(false);
  
  const { x } = useSpring({
    x: flip ? 1 : 0,
    config: { duration: 1000 },
  });
  
  return (
    <animated.div
      onClick={() => setFlip(!flip)}
      style={{
        background: x.to({
          range: [0, 0.5, 1],
          output: ['#3b82f6', '#8b5cf6', '#ec4899'],
        }),
        transform: x
          .to({
            range: [0, 0.25, 0.5, 0.75, 1],
            output: [0, -25, 0, 25, 0],
          })
          .to(x => `translateY(${x}px) rotate(${x * 2}deg)`),
      }}
    >
      Interpolated Animation
    </animated.div>
  );
}
```

### 物理预设

```tsx
import { config } from '@react-spring/web';

function PhysicsPresets() {
  const [preset, setPreset] = useState<keyof typeof config>('default');
  
  const springs = useSpring({
    from: { transform: 'translateX(-100px)' },
    to: { transform: 'translateX(100px)' },
    reset: true,
    config: config[preset],
  });
  
  return (
    <>
      <select value={preset} onChange={(e) => setPreset(e.target.value as any)}>
        <option value="default">Default</option>
        <option value="gentle">Gentle</option>
        <option value="wobbly">Wobbly</option>
        <option value="stiff">Stiff</option>
        <option value="slow">Slow</option>
        <option value="molasses">Molasses</option>
      </select>
      
      <animated.div style={springs} className="box" />
    </>
  );
}
```

## 性能优化

### 使用useSpringValue

```tsx
import { useSpringValue } from '@react-spring/web';

function OptimizedSpring() {
  const x = useSpringValue(0);
  
  // 不会触发重渲染
  useEffect(() => {
    const interval = setInterval(() => {
      x.start(x.get() + 10);
    }, 100);
    
    return () => clearInterval(interval);
  }, [x]);
  
  return (
    <animated.div
      style={{ transform: x.to(x => `translateX(${x}px)`) }}
    >
      Optimized
    </animated.div>
  );
}
```

### 减少重渲染

```tsx
// ✅ 使用useSpring不会在每次动画帧重渲染
function Optimized() {
  const springs = useSpring({
    from: { x: 0 },
    to: { x: 100 },
  });
  
  return <animated.div style={{ transform: springs.x.to(x => `translateX(${x}px)`) }} />;
}

// ❌ 使用state会在每次更新重渲染
function Unoptimized() {
  const [x, setX] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => setX(x => x + 1), 16);
    return () => clearInterval(timer);
  }, []);
  
  return <div style={{ transform: `translateX(${x}px)` }} />;
}
```

## 最佳实践总结

### 性能优化

```
✅ 使用useSpringValue避免重渲染
✅ 合理配置物理参数
✅ 使用useSpring代替CSS transitions
✅ 避免在动画中执行昂贵操作
✅ 测试低端设备性能
```

### 用户体验

```
✅ 使用自然的物理参数
✅ 为不同交互使用不同配置
✅ 提供即时的视觉反馈
✅ 避免过度使用动画
✅ 测试不同设备体验
```

### 可访问性

```
✅ 支持prefers-reduced-motion
✅ 提供跳过动画选项
✅ 确保动画不影响可用性
✅ 测试辅助技术兼容性
```

React Spring通过基于物理的动画为React应用带来了自然流畅的交互体验。掌握其核心概念和最佳实践,你可以创建出色的用户界面动画,显著提升应用的专业度和吸引力。

