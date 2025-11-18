# CSS Transitions过渡

## 概述

CSS Transitions为网页元素的状态变化提供平滑的过渡效果,是实现简单动画的首选方案。本文将深入讲解CSS过渡的原理、属性配置,以及在React应用中的最佳实践,帮助你创建流畅的用户交互体验。

## CSS Transitions基础

### 过渡原理

CSS Transitions通过在元素的初始状态和最终状态之间插值来创建动画效果。

```css
/* 基本语法 */
.element {
  transition: property duration timing-function delay;
}

/* 示例 */
.button {
  background-color: #3b82f6;
  transition: background-color 0.3s ease-in-out;
}

.button:hover {
  background-color: #2563eb;
}
```

### 核心属性详解

#### 1. transition-property

指定要过渡的CSS属性。

```css
/* 单个属性 */
.box {
  transition-property: width;
}

/* 多个属性 */
.card {
  transition-property: transform, opacity, box-shadow;
}

/* 所有属性 */
.element {
  transition-property: all;
}

/* 注意: all可能影响性能,建议明确指定属性 */
```

#### 2. transition-duration

设置过渡持续时间。

```css
/* 秒单位 */
.fast {
  transition-duration: 0.3s;
}

/* 毫秒单位 */
.slow {
  transition-duration: 500ms;
}

/* 多属性不同时长 */
.complex {
  transition-property: width, height, opacity;
  transition-duration: 0.3s, 0.5s, 0.2s;
}
```

#### 3. transition-timing-function

控制过渡速度曲线。

```css
/* 预定义函数 */
.linear { transition-timing-function: linear; }
.ease { transition-timing-function: ease; }  /* 默认 */
.ease-in { transition-timing-function: ease-in; }
.ease-out { transition-timing-function: ease-out; }
.ease-in-out { transition-timing-function: ease-in-out; }

/* 自定义贝塞尔曲线 */
.custom {
  transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 分段函数 */
.steps {
  transition-timing-function: steps(4, end);
}
```

#### 4. transition-delay

设置过渡延迟时间。

```css
/* 立即开始 */
.immediate {
  transition-delay: 0s;
}

/* 延迟开始 */
.delayed {
  transition-delay: 0.2s;
}

/* 负延迟(提前开始) */
.early {
  transition-delay: -0.1s;
}
```

### 简写语法

```css
/* 完整语法 */
.element {
  transition: property duration timing-function delay;
}

/* 示例 */
.card {
  transition: transform 0.3s ease-out 0.1s;
}

/* 多个过渡 */
.complex {
  transition: 
    transform 0.3s ease-out,
    opacity 0.2s linear,
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## React中使用CSS Transitions

### 基础实现

```tsx
import { useState } from 'react';
import './Button.css';

function AnimatedButton() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      className={`animated-button ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Hover Me
    </button>
  );
}
```

```css
/* Button.css */
.animated-button {
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  /* 过渡配置 */
  transition: 
    background-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.3s ease;
}

.animated-button.hovered {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
```

### 条件过渡

```tsx
interface CardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

function ExpandableCard({ isExpanded, onToggle }: CardProps) {
  return (
    <div className={`card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="card-header" onClick={onToggle}>
        <h3>Card Title</h3>
        <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
      </div>
      
      <div className="card-content">
        <p>Card content goes here...</p>
      </div>
    </div>
  );
}
```

```css
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 16px;
  background-color: #f9fafb;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.up {
  transform: rotate(180deg);
}

.card-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.card.expanded .card-content {
  max-height: 500px;
  padding: 16px;
}
```

### 性能优化

#### 1. 使用transform和opacity

```tsx
// ✅ 高性能 - 使用transform和opacity
function OptimizedModal({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  
  return (
    <div className={`modal-overlay ${isOpen ? 'visible' : ''}`}>
      <div className={`modal-content ${isOpen ? 'visible' : ''}`}>
        <h2>Modal Title</h2>
        <p>Modal content...</p>
      </div>
    </div>
  );
}
```

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  
  /* 高性能属性 */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-overlay.visible {
  opacity: 1;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  border-radius: 8px;
  padding: 24px;
  
  /* 使用transform替代top/left过渡 */
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-content.visible {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
```

#### 2. 避免布局抖动

```css
/* ❌ 会触发布局重排 */
.bad {
  transition: width 0.3s ease;
}

.bad:hover {
  width: 300px;  /* 影响布局 */
}

/* ✅ 使用transform */
.good {
  transition: transform 0.3s ease;
}

.good:hover {
  transform: scaleX(1.2);  /* 不影响布局 */
}
```

#### 3. will-change提示

```css
.optimized {
  /* 提示浏览器即将变化的属性 */
  will-change: transform, opacity;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 注意: 不要过度使用will-change */
.overused {
  /* ❌ 不要对所有元素使用 */
  will-change: transform, opacity, width, height, left, top;
}
```

## 高级过渡技巧

### 链式过渡

```tsx
function ChainedTransition() {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((s) => (s + 1) % 3);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [step]);
  
  return (
    <div className={`chained step-${step}`}>
      <div className="box">Animated Box</div>
    </div>
  );
}
```

```css
.chained .box {
  width: 100px;
  height: 100px;
  background-color: #3b82f6;
  
  transition: 
    transform 0.5s ease,
    background-color 0.5s ease 0.5s,  /* 延迟0.5s */
    border-radius 0.5s ease 1s;       /* 延迟1s */
}

.chained.step-1 .box {
  transform: translateX(100px);
}

.chained.step-2 .box {
  transform: translateX(100px) rotate(45deg);
  background-color: #10b981;
}

.chained.step-3 .box {
  transform: translateX(100px) rotate(45deg);
  background-color: #10b981;
  border-radius: 50%;
}
```

### 交错动画

```tsx
function StaggeredList({ items }: { items: string[] }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return (
    <ul className={`staggered-list ${isVisible ? 'visible' : ''}`}>
      {items.map((item, index) => (
        <li
          key={index}
          className="list-item"
          style={{ transitionDelay: `${index * 0.1}s` }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

```css
.list-item {
  padding: 12px;
  background-color: white;
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
  
  opacity: 0;
  transform: translateX(-20px);
  transition: 
    opacity 0.3s ease,
    transform 0.3s ease;
}

.staggered-list.visible .list-item {
  opacity: 1;
  transform: translateX(0);
}
```

### 响应式过渡

```tsx
function ResponsiveCard() {
  return (
    <div className="responsive-card">
      <div className="card-image">
        <img src="/image.jpg" alt="Card" />
      </div>
      <div className="card-body">
        <h3>Card Title</h3>
        <p>Card description...</p>
      </div>
    </div>
  );
}
```

```css
.responsive-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.responsive-card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.responsive-card:hover .card-image img {
  transform: scale(1.1);
}

/* 移动端禁用悬停效果 */
@media (hover: none) {
  .responsive-card:hover {
    transform: none;
  }
  
  .responsive-card:hover .card-image img {
    transform: none;
  }
}
```

## 实战案例

### 1. 加载按钮

```tsx
function LoadingButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/data');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      className={`loading-button ${isLoading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      <span className="button-text">Submit</span>
      <span className="spinner"></span>
    </button>
  );
}
```

```css
.loading-button {
  position: relative;
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  
  transition: background-color 0.3s ease;
}

.loading-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.loading-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.button-text {
  display: inline-block;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.loading-button.loading .button-text {
  opacity: 0;
  transform: translateY(-10px);
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.loading-button.loading .spinner {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
}
```

### 2. 通知Toast

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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          {toast.message}
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
```

```css
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  min-width: 300px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* 入场动画 */
  animation: slideIn 0.3s ease;
  
  /* 退场过渡 */
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast.removing {
  opacity: 0;
  transform: translateX(100%);
}

.toast-success { border-left: 4px solid #10b981; }
.toast-error { border-left: 4px solid #ef4444; }
.toast-info { border-left: 4px solid #3b82f6; }

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 0 4px;
  
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #111827;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 3. 图片画廊

```tsx
function ImageGallery({ images }: { images: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => setSelectedIndex(index)}
          >
            <img src={image} alt={`Image ${index + 1}`} />
            <div className="gallery-overlay">
              <span>View</span>
            </div>
          </div>
        ))}
      </div>
      
      {selectedIndex !== null && (
        <div
          className="lightbox"
          onClick={() => setSelectedIndex(null)}
        >
          <img
            src={images[selectedIndex]}
            alt={`Image ${selectedIndex + 1}`}
          />
        </div>
      )}
    </>
  );
}
```

```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.lightbox {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  animation: fadeIn 0.3s ease;
}

.lightbox img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  
  animation: scaleIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### 4. 进度指示器

```tsx
function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        >
          <span className="progress-text">{percentage.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, max = 100 }: { value: number; max?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;
  
  return (
    <svg className="circular-progress" width="120" height="120">
      <circle
        className="progress-bg"
        cx="60"
        cy="60"
        r={radius}
      />
      <circle
        className="progress-ring"
        cx="60"
        cy="60"
        r={radius}
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
        }}
      />
      <text x="60" y="60" className="progress-percentage">
        {((value / max) * 100).toFixed(0)}%
      </text>
    </svg>
  );
}
```

```css
/* 线性进度条 */
.progress-container {
  width: 100%;
  padding: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 10px;
  color: white;
  font-weight: bold;
}

/* 环形进度条 */
.circular-progress {
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 10;
}

.progress-ring {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 10;
  stroke-linecap: round;
  
  transition: stroke-dashoffset 0.5s ease;
}

.progress-percentage {
  transform: rotate(90deg);
  transform-origin: center;
  text-anchor: middle;
  dominant-baseline: central;
  font-size: 18px;
  font-weight: bold;
  fill: #3b82f6;
}
```

## 过渡事件监听

### transitionend事件

```tsx
function TransitionListener() {
  const [isExpanded, setIsExpanded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'max-height') {
        console.log('Height transition completed');
        
        // 过渡完成后的操作
        if (isExpanded) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };
    
    element.addEventListener('transitionend', handleTransitionEnd);
    
    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [isExpanded]);
  
  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        Toggle
      </button>
      
      <div
        ref={elementRef}
        className={`expandable ${isExpanded ? 'expanded' : ''}`}
      >
        Content here...
      </div>
    </div>
  );
}
```

### 自定义Hook封装

```tsx
function useTransition(
  ref: RefObject<HTMLElement>,
  onTransitionEnd?: (propertyName: string) => void
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleTransitionEnd = (e: TransitionEvent) => {
      onTransitionEnd?.(e.propertyName);
    };
    
    element.addEventListener('transitionend', handleTransitionEnd);
    
    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [ref, onTransitionEnd]);
}

// 使用
function Component() {
  const ref = useRef<HTMLDivElement>(null);
  
  useTransition(ref, (property) => {
    console.log(`${property} transition completed`);
  });
  
  return <div ref={ref} className="animated">...</div>;
}
```

## 调试与优化

### 性能分析

```tsx
function PerformanceMonitor() {
  const startTime = useRef(0);
  
  const handleTransitionStart = () => {
    startTime.current = performance.now();
  };
  
  const handleTransitionEnd = (e: TransitionEvent) => {
    const duration = performance.now() - startTime.current;
    console.log(`${e.propertyName} took ${duration}ms`);
  };
  
  return (
    <div
      className="monitored"
      onTransitionStart={handleTransitionStart}
      onTransitionEnd={handleTransitionEnd}
    >
      Monitored Element
    </div>
  );
}
```

### 降级方案

```css
/* 检测是否支持transition */
@supports (transition: transform 0.3s ease) {
  .modern {
    transition: transform 0.3s ease;
  }
  
  .modern:hover {
    transform: scale(1.1);
  }
}

/* 不支持时的降级方案 */
@supports not (transition: transform 0.3s ease) {
  .modern:hover {
    /* 立即变化或使用其他效果 */
    opacity: 0.8;
  }
}
```

### 减弱动画偏好

```css
/* 尊重用户的动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 为重视可访问性的用户提供选项 */
@media (prefers-reduced-motion: reduce) {
  .animated {
    transition: none;
  }
}
```

## 最佳实践总结

### 性能优化清单

```
✅ 优先使用transform和opacity
✅ 避免过渡width、height等布局属性
✅ 合理使用will-change提示
✅ 限制同时过渡的元素数量
✅ 使用CSS containment隔离影响范围
✅ 避免过度使用all属性
✅ 为长列表使用虚拟滚动
✅ 测试不同设备的性能表现
```

### 可访问性要求

```
✅ 提供prefers-reduced-motion支持
✅ 确保过渡不影响键盘导航
✅ 保持足够的颜色对比度
✅ 避免仅依赖颜色传达信息
✅ 提供可跳过动画的选项
✅ 测试屏幕阅读器兼容性
```

### 用户体验准则

```
✅ 保持过渡时长在150-300ms之间
✅ 使用合适的缓动函数
✅ 为不同交互使用不同时长
✅ 确保过渡有明确的开始和结束
✅ 避免过度复杂的过渡效果
✅ 提供即时反馈
```

CSS Transitions为React应用提供了简单高效的动画解决方案。通过合理配置过渡属性,结合React的状态管理,可以创建流畅自然的用户交互体验。掌握这些技巧后,你将能够为应用添加恰到好处的动画效果,提升整体用户体验。
