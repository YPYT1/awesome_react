# 动画变体(Variants)

## 概述

Variants是Framer Motion中最强大的功能之一,它允许你预定义动画状态并在组件间协调动画。本文将深入讲解Variants的概念、用法、高级技巧以及实战应用,帮助你创建复杂而优雅的动画效果。

## Variants基础

### 什么是Variants

Variants是预定义的动画状态对象,可以在父子组件之间传播,实现协调动画。

```tsx
import { motion } from 'framer-motion';

const boxVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

function BasicVariant() {
  return (
    <motion.div
      variants={boxVariants}
      initial="hidden"
      animate="visible"
    >
      Animated Box
    </motion.div>
  );
}
```

### 多状态Variants

```tsx
const cardVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
  tap: {
    scale: 0.95,
  },
  exit: {
    opacity: 0,
    y: -50,
  },
};

function MultiStateVariant() {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      exit="exit"
    >
      Interactive Card
    </motion.div>
  );
}
```

## 父子动画协调

### 基础传播

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

function PropagationExample() {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.li variants={itemVariants}>Item 1</motion.li>
      <motion.li variants={itemVariants}>Item 2</motion.li>
      <motion.li variants={itemVariants}>Item 3</motion.li>
    </motion.ul>
  );
}
```

### 交错动画

```tsx
const listVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

function StaggeredList() {
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="staggered-list"
    >
      {items.map((item, index) => (
        <motion.li key={index} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### 嵌套Variants

```tsx
const menuVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const menuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

const submenuVariants = {
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

function NestedMenu() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
    >
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Menu</button>
      
      <motion.ul variants={menuVariants}>
        <motion.li variants={menuItemVariants}>
          Home
        </motion.li>
        
        <motion.li variants={menuItemVariants}>
          <span>Products</span>
          <motion.ul variants={submenuVariants}>
            <motion.li variants={menuItemVariants}>Product 1</motion.li>
            <motion.li variants={menuItemVariants}>Product 2</motion.li>
            <motion.li variants={menuItemVariants}>Product 3</motion.li>
          </motion.ul>
        </motion.li>
        
        <motion.li variants={menuItemVariants}>
          About
        </motion.li>
      </motion.ul>
    </motion.nav>
  );
}
```

## 动态Variants

### 函数式Variants

```tsx
const dynamicVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

function DynamicVariants() {
  const items = [1, 2, 3, 4, 5];
  
  return (
    <div>
      {items.map((item, index) => (
        <motion.div
          key={item}
          custom={index}
          variants={dynamicVariants}
          initial="hidden"
          animate="visible"
        >
          Item {item}
        </motion.div>
      ))}
    </div>
  );
}
```

### 条件Variants

```tsx
const conditionalVariants = {
  initial: { opacity: 0, x: -100 },
  animate: (direction: 'left' | 'right') => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: direction === 'right' ? 200 : 100
    }
  })
};

function ConditionalAnimation() {
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  
  return (
    <div>
      <motion.div
        custom={direction}
        variants={conditionalVariants}
        initial="initial"
        animate="animate"
      >
        Animated Element
      </motion.div>
      
      <button onClick={() => setDirection('left')}>Left</button>
      <button onClick={() => setDirection('right')}>Right</button>
    </div>
  );
}
```

### 响应式Variants

```tsx
function ResponsiveVariants() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 20 : 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: isMobile ? 200 : 100
      }
    }
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      Responsive Card
    </motion.div>
  );
}
```

## 高级Variants模式

### 序列动画

```tsx
const sequenceVariants = {
  initial: {
    opacity: 0,
    scale: 0
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 0.3 },
      scale: { 
        duration: 0.5, 
        delay: 0.3,
        type: "spring",
        stiffness: 200
      }
    }
  }
};

function SequenceAnimation() {
  return (
    <motion.div
      variants={sequenceVariants}
      initial="initial"
      animate="animate"
    >
      Sequential Animation
    </motion.div>
  );
}
```

### 编排复杂动画

```tsx
const complexVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
    fill: "rgba(255, 255, 255, 0)"
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    fill: "rgba(255, 255, 255, 1)",
    transition: {
      default: { duration: 2, ease: "easeInOut" },
      fill: { duration: 2, ease: [1, 0, 0.8, 1] }
    }
  }
};

function ComplexSVGAnimation() {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="100"
        cy="100"
        r="80"
        stroke="#00cc88"
        strokeWidth="3"
        variants={complexVariants}
      />
    </motion.svg>
  );
}
```

### 状态机集成

```tsx
type State = 'idle' | 'loading' | 'success' | 'error';

const stateVariants: Record<State, any> = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  loading: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.5, 1],
    transition: {
      repeat: Infinity,
      duration: 1
    }
  },
  success: {
    scale: 1,
    opacity: 1,
    backgroundColor: "#10b981"
  },
  error: {
    scale: [1, 1.1, 1, 1.1, 1],
    backgroundColor: "#ef4444",
    transition: {
      scale: {
        repeat: 2,
        duration: 0.2
      }
    }
  }
};

function StateMachineAnimation() {
  const [state, setState] = useState<State>('idle');
  
  const handleAction = async () => {
    setState('loading');
    
    try {
      await fetch('/api/data');
      setState('success');
    } catch {
      setState('error');
    }
    
    setTimeout(() => setState('idle'), 2000);
  };
  
  return (
    <motion.button
      variants={stateVariants}
      animate={state}
      onClick={handleAction}
    >
      {state === 'idle' && 'Click Me'}
      {state === 'loading' && 'Loading...'}
      {state === 'success' && 'Success!'}
      {state === 'error' && 'Error!'}
    </motion.button>
  );
}
```

## 实战案例

### 1. 卡片网格动画

```tsx
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const gridItemVariants = {
  hidden: { 
    y: 20, 
    opacity: 0,
    scale: 0.8
  },
  visible: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  }
};

function CardGrid() {
  const cards = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    title: `Card ${i + 1}`,
    content: `Content for card ${i + 1}`
  }));
  
  return (
    <motion.div
      className="grid"
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          className="card"
          variants={gridItemVariants}
          whileHover="hover"
        >
          <h3>{card.title}</h3>
          <p>{card.content}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 2. 展开式菜单

```tsx
const sidebarVariants = {
  open: {
    width: 250,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  },
  closed: {
    width: 80,
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  }
};

const menuItemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const iconVariants = {
  open: { rotate: 0 },
  closed: { rotate: 180 }
};

function ExpandableSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isOpen ? "open" : "closed"}
      className="sidebar"
    >
      <button onClick={() => setIsOpen(!isOpen)}>
        <motion.span variants={iconVariants}>→</motion.span>
      </button>
      
      <motion.ul variants={menuItemVariants}>
        {['Home', 'Profile', 'Settings', 'Logout'].map((item) => (
          <motion.li key={item} variants={menuItemVariants}>
            <span className="icon">📌</span>
            {isOpen && <span className="text">{item}</span>}
          </motion.li>
        ))}
      </motion.ul>
    </motion.aside>
  );
}
```

### 3. 时间轴动画

```tsx
const timelineVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.3,
    }
  }
};

const itemLeftVariants = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const itemRightVariants = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const dotVariants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

function Timeline() {
  const events = [
    { id: 1, date: '2024-01', title: 'Event 1', side: 'left' },
    { id: 2, date: '2024-02', title: 'Event 2', side: 'right' },
    { id: 3, date: '2024-03', title: 'Event 3', side: 'left' },
    { id: 4, date: '2024-04', title: 'Event 4', side: 'right' },
  ];
  
  return (
    <motion.div
      className="timeline"
      variants={timelineVariants}
      initial="hidden"
      animate="visible"
    >
      {events.map((event) => (
        <div key={event.id} className={`timeline-item ${event.side}`}>
          <motion.div
            className="timeline-content"
            variants={event.side === 'left' ? itemLeftVariants : itemRightVariants}
          >
            <span className="date">{event.date}</span>
            <h3>{event.title}</h3>
          </motion.div>
          
          <motion.div
            className="timeline-dot"
            variants={dotVariants}
          />
        </div>
      ))}
    </motion.div>
  );
}
```

### 4. 表单验证动画

```tsx
const formVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fieldVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  error: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  },
  success: {
    borderColor: "#10b981",
    transition: { duration: 0.3 }
  }
};

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  loading: {
    opacity: 0.7,
    transition: { duration: 0.2 }
  }
};

function AnimatedForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailState, setEmailState] = useState<'initial' | 'error' | 'success'>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateEmail = (value: string) => {
    if (!value) {
      setEmailState('initial');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailState('error');
    } else {
      setEmailState('success');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
  };
  
  return (
    <motion.form
      variants={formVariants}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
    >
      <motion.div
        className="form-field"
        variants={fieldVariants}
        animate={emailState}
      >
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
        />
        {emailState === 'error' && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error"
          >
            Invalid email
          </motion.span>
        )}
      </motion.div>
      
      <motion.div className="form-field" variants={fieldVariants}>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </motion.div>
      
      <motion.button
        type="submit"
        variants={buttonVariants}
        whileHover={!isSubmitting ? "hover" : undefined}
        whileTap={!isSubmitting ? "tap" : undefined}
        animate={isSubmitting ? "loading" : "animate"}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </motion.button>
    </motion.form>
  );
}
```

### 5. 数字滚动计数器

```tsx
const counterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 100
    }
  })
};

function AnimatedCounter({ value }: { value: number }) {
  const digits = value.toString().split('');
  
  return (
    <div className="counter">
      {digits.map((digit, index) => (
        <motion.span
          key={index}
          custom={index}
          variants={counterVariants}
          initial="hidden"
          animate="visible"
          className="digit"
        >
          {digit}
        </motion.span>
      ))}
    </div>
  );
}

function CounterDemo() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => (c + 1) % 100000);
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <AnimatedCounter value={count} />;
}
```

## Variants最佳实践

### 命名规范

```tsx
// ✅ 清晰的状态命名
const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  exit: { opacity: 0 }
};

// ❌ 模糊的命名
const variants = {
  state1: { opacity: 0 },
  state2: { opacity: 1 },
  state3: { scale: 1.05 }
};
```

### 复用Variants

```tsx
// 创建可复用的Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200
    }
  }
};

// 组合使用
function Component() {
  return (
    <>
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        Content 1
      </motion.div>
      
      <motion.div variants={scaleIn} initial="hidden" animate="visible">
        Content 2
      </motion.div>
    </>
  );
}
```

### 性能优化

```tsx
// ✅ 缓存Variants对象
const cardVariants = useMemo(() => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}), []);

// ✅ 使用transform属性
const optimizedVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

// ❌ 避免使用布局属性
const unoptimizedVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: { opacity: 1, width: 300 }
};
```

## 总结

### Variants核心优势

```
✅ 代码组织清晰
✅ 易于维护和复用
✅ 支持父子协调动画
✅ 强大的交错动画能力
✅ 支持动态和条件逻辑
✅ 便于状态管理集成
```

### 使用场景

```
✅ 列表和网格动画
✅ 菜单和导航动画
✅ 表单交互动画
✅ 页面切换动画
✅ 加载和状态动画
✅ 复杂的编排动画
```

### 性能考虑

```
✅ 缓存Variants对象
✅ 使用transform和opacity
✅ 合理使用staggerChildren
✅ 避免过度嵌套
✅ 测试不同设备性能
```

Variants是Framer Motion的精髓,掌握它可以让你的动画代码更加优雅和强大。通过合理使用Variants,你可以创建复杂而协调的动画效果,显著提升应用的交互体验。

