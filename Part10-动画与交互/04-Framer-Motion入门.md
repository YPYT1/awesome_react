# Framer Motion入门

## 概述

Framer Motion是React生态系统中最流行的动画库之一,提供了强大且易用的API来创建复杂的动画效果。本文将全面介绍Framer Motion的核心概念、基础用法、以及在实际项目中的应用,帮助你快速上手这个优秀的动画库。

## 安装与配置

### 安装

```bash
# npm
npm install framer-motion

# yarn
yarn add framer-motion

# pnpm
pnpm add framer-motion
```

### TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2015", "DOM"],
    "types": ["framer-motion"]
  }
}
```

### 基础导入

```tsx
import { motion } from 'framer-motion';
```

## 核心概念

### motion组件

motion组件是Framer Motion的核心,它是HTML和SVG元素的增强版本。

```tsx
import { motion } from 'framer-motion';

function BasicAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Hello Framer Motion
    </motion.div>
  );
}
```

### 支持的元素

```tsx
// HTML元素
<motion.div />
<motion.button />
<motion.span />
<motion.img />

// SVG元素
<motion.svg />
<motion.circle />
<motion.path />
<motion.rect />

// 自定义组件
const Component = motion(CustomComponent);
```

## 基础动画

### animate属性

```tsx
function AnimateExample() {
  return (
    <motion.div
      animate={{
        x: 100,           // translateX
        y: 50,            // translateY
        scale: 1.5,       // scale
        rotate: 180,      // rotate
        opacity: 0.5,     // opacity
      }}
    />
  );
}
```

### initial属性

```tsx
function InitialExample() {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      Slide In
    </motion.div>
  );
}
```

### transition属性

```tsx
function TransitionExample() {
  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{
        duration: 1,
        ease: "easeInOut",
        delay: 0.5,
      }}
    >
      Controlled Timing
    </motion.div>
  );
}
```

### 缓动函数

```tsx
function EasingExample() {
  return (
    <>
      <motion.div
        animate={{ x: 100 }}
        transition={{ ease: "linear" }}
      >
        Linear
      </motion.div>
      
      <motion.div
        animate={{ x: 100 }}
        transition={{ ease: "easeIn" }}
      >
        Ease In
      </motion.div>
      
      <motion.div
        animate={{ x: 100 }}
        transition={{ ease: "easeOut" }}
      >
        Ease Out
      </motion.div>
      
      <motion.div
        animate={{ x: 100 }}
        transition={{ ease: "easeInOut" }}
      >
        Ease In Out
      </motion.div>
      
      <motion.div
        animate={{ x: 100 }}
        transition={{ ease: [0.17, 0.67, 0.83, 0.67] }}
      >
        Custom Cubic Bezier
      </motion.div>
    </>
  );
}
```

## 交互动画

### hover动画

```tsx
function HoverAnimation() {
  return (
    <motion.button
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.9 }}
    >
      Hover Me
    </motion.button>
  );
}
```

### tap动画

```tsx
function TapAnimation() {
  return (
    <motion.div
      whileTap={{
        scale: 0.95,
        rotate: 5,
      }}
      className="interactive-box"
    >
      Tap Me
    </motion.div>
  );
}
```

### drag动画

```tsx
function DragAnimation() {
  return (
    <motion.div
      drag
      dragConstraints={{
        top: -50,
        left: -50,
        right: 50,
        bottom: 50,
      }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1 }}
    >
      Drag Me
    </motion.div>
  );
}
```

### focus动画

```tsx
function FocusAnimation() {
  return (
    <motion.input
      whileFocus={{
        scale: 1.05,
        borderColor: "#3b82f6",
      }}
      transition={{ duration: 0.2 }}
    />
  );
}
```

## 状态动画

### 条件动画

```tsx
function ConditionalAnimation() {
  const [isOn, setIsOn] = useState(false);
  
  return (
    <>
      <motion.div
        animate={isOn ? { x: 100 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        Toggle Element
      </motion.div>
      
      <button onClick={() => setIsOn(!isOn)}>
        Toggle
      </button>
    </>
  );
}
```

### 动态动画

```tsx
function DynamicAnimation() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleClick = (e: React.MouseEvent) => {
    setPosition({
      x: e.clientX - 50,
      y: e.clientY - 50,
    });
  };
  
  return (
    <div onClick={handleClick} className="click-area">
      <motion.div
        animate={position}
        transition={{ type: "spring", stiffness: 200 }}
        className="moving-box"
      />
    </div>
  );
}
```

## 进入/退出动画

### AnimatePresence组件

```tsx
import { AnimatePresence } from 'framer-motion';

function PresenceExample() {
  const [isVisible, setIsVisible] = useState(true);
  
  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>
        Toggle
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            I'm animated on mount and unmount
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 列表动画

```tsx
function ListAnimation() {
  const [items, setItems] = useState([1, 2, 3]);
  
  const removeItem = (id: number) => {
    setItems(items.filter(item => item !== id));
  };
  
  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          Item {item}
          <button onClick={() => removeItem(item)}>Remove</button>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

### mode配置

```tsx
function ModeExample() {
  const [current, setCurrent] = useState(0);
  const pages = ['Page 1', 'Page 2', 'Page 3'];
  
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          {pages[current]}
        </motion.div>
      </AnimatePresence>
      
      <button onClick={() => setCurrent((c) => (c + 1) % pages.length)}>
        Next
      </button>
    </>
  );
}
```

## 弹簧动画

### spring配置

```tsx
function SpringAnimation() {
  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{
        type: "spring",
        stiffness: 100,    // 刚度
        damping: 10,       // 阻尼
        mass: 1,           // 质量
      }}
    >
      Spring Animation
    </motion.div>
  );
}
```

### 不同弹簧效果

```tsx
function SpringVariants() {
  return (
    <div className="spring-examples">
      {/* 弹性 */}
      <motion.div
        animate={{ x: 100 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        Bouncy
      </motion.div>
      
      {/* 平滑 */}
      <motion.div
        animate={{ x: 100 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      >
        Smooth
      </motion.div>
      
      {/* 缓慢 */}
      <motion.div
        animate={{ x: 100 }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 10,
        }}
      >
        Slow
      </motion.div>
    </div>
  );
}
```

## useAnimation Hook

### 编程式动画控制

```tsx
import { useAnimation } from 'framer-motion';

function ProgrammaticAnimation() {
  const controls = useAnimation();
  
  const handlePlay = async () => {
    await controls.start({
      x: 100,
      transition: { duration: 1 },
    });
    
    await controls.start({
      x: 0,
      transition: { duration: 1 },
    });
  };
  
  return (
    <>
      <motion.div animate={controls}>
        Controlled Element
      </motion.div>
      
      <button onClick={handlePlay}>Play Animation</button>
    </>
  );
}
```

### 序列动画

```tsx
function SequenceAnimation() {
  const controls = useAnimation();
  
  const sequence = async () => {
    await controls.start({ x: 100, transition: { duration: 0.5 } });
    await controls.start({ y: 100, transition: { duration: 0.5 } });
    await controls.start({ x: 0, transition: { duration: 0.5 } });
    await controls.start({ y: 0, transition: { duration: 0.5 } });
  };
  
  return (
    <>
      <motion.div animate={controls} className="box" />
      <button onClick={sequence}>Run Sequence</button>
    </>
  );
}
```

### 条件动画控制

```tsx
function ConditionalControl() {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (isHovered) {
      controls.start({
        scale: 1.2,
        transition: { duration: 0.3 },
      });
    } else {
      controls.start({
        scale: 1,
        transition: { duration: 0.3 },
      });
    }
  }, [isHovered, controls]);
  
  return (
    <motion.div
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Hover Me
    </motion.div>
  );
}
```

## useMotionValue Hook

### 动画值追踪

```tsx
import { useMotionValue, useTransform } from 'framer-motion';

function MotionValueExample() {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
  
  return (
    <motion.div
      drag="x"
      style={{ x, opacity }}
      dragConstraints={{ left: -100, right: 100 }}
    >
      Drag Me Horizontally
    </motion.div>
  );
}
```

### 值转换

```tsx
function TransformExample() {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['#ff0000', '#ffffff', '#0000ff']
  );
  
  return (
    <motion.div
      drag="x"
      style={{ x, background }}
      dragConstraints={{ left: -100, right: 100 }}
    >
      Drag to Change Color
    </motion.div>
  );
}
```

### 监听值变化

```tsx
function ValueListener() {
  const x = useMotionValue(0);
  
  useEffect(() => {
    const unsubscribe = x.onChange((latest) => {
      console.log('x changed to:', latest);
    });
    
    return () => unsubscribe();
  }, [x]);
  
  return (
    <motion.div
      drag="x"
      style={{ x }}
      dragConstraints={{ left: -100, right: 100 }}
    >
      Drag Me
    </motion.div>
  );
}
```

## 实战案例

### 1. 卡片翻转

```tsx
function FlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div className="flip-card-container">
      <motion.div
        className="flip-card"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="card-front">
          <h3>Front</h3>
          <p>Click to flip</p>
        </div>
        
        <div className="card-back">
          <h3>Back</h3>
          <p>Click to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}
```

```css
.flip-card {
  width: 300px;
  height: 200px;
  position: relative;
  cursor: pointer;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 12px;
  padding: 20px;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-back {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  transform: rotateY(180deg);
}
```

### 2. 模态框

```tsx
function AnimatedModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2>Modal Title</h2>
              <p>Modal content goes here...</p>
              <button onClick={() => setIsOpen(false)}>Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 3. 通知Toast

```tsx
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            layout
          >
            {toast.message}
            <button onClick={() => removeToast(toast.id)}>×</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 4. 加载动画

```tsx
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

function PulseLoader() {
  return (
    <div className="pulse-container">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="pulse-dot"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-container">
      <motion.div
        className="progress-bar"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
```

### 5. 菜单动画

```tsx
function AnimatedMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };
  
  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      className="menu"
    >
      <button onClick={() => setIsOpen(!isOpen)}>
        Menu {isOpen ? '▲' : '▼'}
      </button>
      
      <motion.ul
        variants={{
          open: {
            clipPath: "inset(0% 0% 0% 0%)",
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.7,
              delayChildren: 0.3,
              staggerChildren: 0.05
            }
          },
          closed: {
            clipPath: "inset(10% 50% 90% 50%)",
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.3
            }
          }
        }}
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        <motion.li variants={itemVariants}>Item 1</motion.li>
        <motion.li variants={itemVariants}>Item 2</motion.li>
        <motion.li variants={itemVariants}>Item 3</motion.li>
        <motion.li variants={itemVariants}>Item 4</motion.li>
      </motion.ul>
    </motion.nav>
  );
}
```

## 性能优化

### 使用transform属性

```tsx
// ✅ 高性能 - 使用transform
function OptimizedAnimation() {
  return (
    <motion.div
      animate={{ x: 100, y: 50, scale: 1.2 }}
    >
      Optimized
    </motion.div>
  );
}

// ❌ 低性能 - 使用left/top
function UnoptimizedAnimation() {
  return (
    <motion.div
      animate={{ left: 100, top: 50 }}
    >
      Unoptimized
    </motion.div>
  );
}
```

### layoutId优化

```tsx
function LayoutIdExample() {
  const [selected, setSelected] = useState<number | null>(null);
  
  return (
    <div className="grid">
      {items.map((item) => (
        <motion.div
          key={item.id}
          layoutId={`item-${item.id}`}
          onClick={() => setSelected(item.id)}
        >
          {item.content}
        </motion.div>
      ))}
      
      <AnimatePresence>
        {selected && (
          <motion.div
            layoutId={`item-${selected}`}
            onClick={() => setSelected(null)}
            className="expanded"
          >
            Expanded content
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 减少重渲染

```tsx
// 使用useMemo缓存动画配置
function MemoizedAnimation() {
  const animationConfig = useMemo(() => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  }), []);
  
  return <motion.div {...animationConfig}>Content</motion.div>;
}
```

## 调试技巧

### 可视化调试

```tsx
function DebugAnimation() {
  return (
    <motion.div
      animate={{ x: 100 }}
      onUpdate={(latest) => console.log('Current values:', latest)}
      onAnimationStart={() => console.log('Animation started')}
      onAnimationComplete={() => console.log('Animation completed')}
    >
      Debug Me
    </motion.div>
  );
}
```

### 开发工具

```tsx
import { MotionConfig } from 'framer-motion';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <YourApp />
    </MotionConfig>
  );
}
```

## 最佳实践总结

### 性能优化清单

```
✅ 优先使用transform和opacity
✅ 使用layoutId优化共享元素动画
✅ 避免在动画中修改布局属性
✅ 合理使用AnimatePresence
✅ 为长列表使用虚拟滚动
✅ 缓存动画配置对象
✅ 使用will-change提示
✅ 测试低端设备性能
```

### 开发建议

```
✅ 使用variants组织复杂动画
✅ 为动画添加适当的transition
✅ 合理使用spring物理动画
✅ 提供降级方案(reducedMotion)
✅ 编写可复用的动画组件
✅ 文档化自定义动画效果
```

### 可访问性

```
✅ 尊重prefers-reduced-motion
✅ 提供跳过动画选项
✅ 确保键盘导航正常
✅ 避免仅依赖动画传达信息
✅ 测试屏幕阅读器兼容性
```

Framer Motion为React应用提供了强大而优雅的动画解决方案。通过掌握核心概念和最佳实践,你可以创建流畅自然的用户界面动画,大幅提升应用的交互体验。

