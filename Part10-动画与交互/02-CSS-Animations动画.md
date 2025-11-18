# CSS Animations动画

## 概述

CSS Animations提供了比Transitions更强大的动画控制能力,可以创建复杂的多步骤动画效果。本文将全面讲解CSS动画的核心概念、@keyframes规则、动画属性配置,以及在React应用中的实战应用,帮助你掌握专业级的动画开发技能。

## CSS Animations基础

### @keyframes规则

@keyframes定义动画的关键帧序列。

```css
/* 从...到... */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 百分比关键帧 */
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    transform: translateX(0);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 多属性动画 */
@keyframes complexAnimation {
  0% {
    transform: translateY(0) rotate(0deg);
    background-color: #3b82f6;
    border-radius: 0%;
  }
  50% {
    transform: translateY(-50px) rotate(180deg);
    background-color: #8b5cf6;
    border-radius: 50%;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    background-color: #3b82f6;
    border-radius: 0%;
  }
}
```

### 动画属性

#### 1. animation-name

指定要使用的@keyframes名称。

```css
.element {
  animation-name: fadeIn;
}

/* 多个动画 */
.complex {
  animation-name: fadeIn, slideIn;
}
```

#### 2. animation-duration

设置动画持续时间。

```css
.fast {
  animation-name: fadeIn;
  animation-duration: 0.3s;
}

.slow {
  animation-name: fadeIn;
  animation-duration: 2s;
}

/* 多动画不同时长 */
.multi {
  animation-name: fadeIn, rotate;
  animation-duration: 1s, 2s;
}
```

#### 3. animation-timing-function

控制动画速度曲线。

```css
/* 预定义函数 */
.linear { animation-timing-function: linear; }
.ease { animation-timing-function: ease; }
.ease-in { animation-timing-function: ease-in; }
.ease-out { animation-timing-function: ease-out; }
.ease-in-out { animation-timing-function: ease-in-out; }

/* 自定义贝塞尔曲线 */
.bounce {
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 分段函数 */
.steps {
  animation-timing-function: steps(10, end);
}
```

#### 4. animation-delay

设置动画延迟。

```css
.immediate {
  animation-delay: 0s;
}

.delayed {
  animation-delay: 1s;
}

/* 负延迟(跳过开头) */
.skip-intro {
  animation-delay: -0.5s;
}
```

#### 5. animation-iteration-count

设置动画重复次数。

```css
.once {
  animation-iteration-count: 1;
}

.twice {
  animation-iteration-count: 2;
}

.infinite {
  animation-iteration-count: infinite;
}

/* 小数次数 */
.half {
  animation-iteration-count: 1.5;
}
```

#### 6. animation-direction

设置动画播放方向。

```css
.normal {
  animation-direction: normal;  /* 正向播放 */
}

.reverse {
  animation-direction: reverse;  /* 反向播放 */
}

.alternate {
  animation-direction: alternate;  /* 正反交替 */
}

.alternate-reverse {
  animation-direction: alternate-reverse;  /* 反正交替 */
}
```

#### 7. animation-fill-mode

设置动画结束后的状态。

```css
.none {
  animation-fill-mode: none;  /* 不保留任何状态 */
}

.forwards {
  animation-fill-mode: forwards;  /* 保持最后一帧 */
}

.backwards {
  animation-fill-mode: backwards;  /* 应用第一帧(在delay期间) */
}

.both {
  animation-fill-mode: both;  /* 同时应用forwards和backwards */
}
```

#### 8. animation-play-state

控制动画播放状态。

```css
.running {
  animation-play-state: running;  /* 播放中 */
}

.paused {
  animation-play-state: paused;  /* 暂停 */
}
```

### 简写语法

```css
/* 完整语法 */
.element {
  animation: name duration timing-function delay iteration-count direction fill-mode play-state;
}

/* 示例 */
.animated {
  animation: fadeIn 1s ease-in-out 0.5s infinite alternate both running;
}

/* 多个动画 */
.complex {
  animation:
    fadeIn 1s ease-in,
    slideIn 1.5s ease-out 0.5s,
    rotate 2s linear infinite;
}
```

## React中使用CSS Animations

### 基础实现

```tsx
import { useState } from 'react';
import './Animations.css';

function AnimatedBox() {
  const [isAnimating, setIsAnimating] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsAnimating(!isAnimating)}>
        Toggle Animation
      </button>
      
      <div className={`box ${isAnimating ? 'animated' : ''}`}>
        Animated Box
      </div>
    </div>
  );
}
```

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-30px);
  }
}

.box {
  width: 100px;
  height: 100px;
  background-color: #3b82f6;
  margin: 20px;
}

.box.animated {
  animation: bounce 1s ease-in-out infinite;
}
```

### 动态控制

```tsx
interface AnimationConfig {
  duration: number;
  iterationCount: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

function DynamicAnimation() {
  const [config, setConfig] = useState<AnimationConfig>({
    duration: 1,
    iterationCount: 'infinite',
    direction: 'normal',
  });
  
  const animationStyle = {
    animationDuration: `${config.duration}s`,
    animationIterationCount: config.iterationCount,
    animationDirection: config.direction,
  };
  
  return (
    <div>
      <div className="controls">
        <label>
          Duration (s):
          <input
            type="number"
            value={config.duration}
            onChange={(e) => setConfig({
              ...config,
              duration: parseFloat(e.target.value) || 1
            })}
            min="0.1"
            step="0.1"
          />
        </label>
        
        <label>
          Iteration:
          <select
            value={config.iterationCount}
            onChange={(e) => setConfig({
              ...config,
              iterationCount: e.target.value === 'infinite'
                ? 'infinite'
                : parseInt(e.target.value)
            })}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="infinite">Infinite</option>
          </select>
        </label>
        
        <label>
          Direction:
          <select
            value={config.direction}
            onChange={(e) => setConfig({
              ...config,
              direction: e.target.value as AnimationConfig['direction']
            })}
          >
            <option value="normal">Normal</option>
            <option value="reverse">Reverse</option>
            <option value="alternate">Alternate</option>
            <option value="alternate-reverse">Alternate Reverse</option>
          </select>
        </label>
      </div>
      
      <div className="animated-box" style={animationStyle}></div>
    </div>
  );
}
```

```css
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(200px); }
}

.animated-box {
  width: 50px;
  height: 50px;
  background-color: #3b82f6;
  animation-name: slide;
  animation-timing-function: ease-in-out;
}
```

### 播放控制

```tsx
function PlaybackControl() {
  const [playState, setPlayState] = useState<'running' | 'paused'>('running');
  
  return (
    <div>
      <button onClick={() => setPlayState(playState === 'running' ? 'paused' : 'running')}>
        {playState === 'running' ? 'Pause' : 'Play'}
      </button>
      
      <div
        className="controlled-animation"
        style={{ animationPlayState: playState }}
      >
        Controlled Animation
      </div>
    </div>
  );
}
```

```css
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.controlled-animation {
  width: 100px;
  height: 100px;
  background-color: #8b5cf6;
  animation: rotate 2s linear infinite;
}
```

## 常用动画效果

### 1. 脉冲动画

```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### 2. 摇晃动画

```css
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}
```

### 3. 闪烁动画

```css
@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0;
  }
}

.blink {
  animation: blink 1s step-end infinite;
}
```

### 4. 翻转动画

```css
@keyframes flip {
  0% {
    transform: perspective(400px) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateY(360deg);
  }
}

.flip {
  animation: flip 1s ease-in-out;
}
```

### 5. 缩放进入

```css
@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.zoom-in {
  animation: zoomIn 0.5s ease-out;
}
```

### 6. 旋转加载

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

## 高级动画技巧

### 链式动画

```tsx
function ChainedAnimations() {
  return (
    <div className="chain-container">
      <div className="chain-item" style={{ animationDelay: '0s' }}>1</div>
      <div className="chain-item" style={{ animationDelay: '0.2s' }}>2</div>
      <div className="chain-item" style={{ animationDelay: '0.4s' }}>3</div>
      <div className="chain-item" style={{ animationDelay: '0.6s' }}>4</div>
      <div className="chain-item" style={{ animationDelay: '0.8s' }}>5</div>
    </div>
  );
}
```

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chain-item {
  animation: fadeInUp 0.5s ease-out both;
}
```

### 序列动画

```tsx
function SequentialAnimation() {
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s % 3) + 1);
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className={`sequence step-${step}`}>
      <div className="box">Step {step}</div>
    </div>
  );
}
```

```css
@keyframes step1 {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

@keyframes step2 {
  from { transform: translateX(100px) rotate(0deg); }
  to { transform: translateX(100px) rotate(180deg); }
}

@keyframes step3 {
  from { transform: translateX(100px) rotate(180deg); }
  to { transform: translateX(0) rotate(360deg); }
}

.sequence .box {
  width: 50px;
  height: 50px;
  background-color: #3b82f6;
}

.sequence.step-1 .box {
  animation: step1 1s ease-in-out forwards;
}

.sequence.step-2 .box {
  animation: step2 1s ease-in-out forwards;
}

.sequence.step-3 .box {
  animation: step3 1s ease-in-out forwards;
}
```

### 无限循环变体

```css
/* 呼吸效果 */
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 彩虹循环 */
@keyframes rainbow {
  0% { background-color: #ff0000; }
  14% { background-color: #ff7f00; }
  28% { background-color: #ffff00; }
  42% { background-color: #00ff00; }
  57% { background-color: #0000ff; }
  71% { background-color: #4b0082; }
  85% { background-color: #8b00ff; }
  100% { background-color: #ff0000; }
}

/* 波浪效果 */
@keyframes wave {
  0% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(10px); }
  100% { transform: translateY(0); }
}

.breathe { animation: breathe 3s ease-in-out infinite; }
.rainbow { animation: rainbow 5s linear infinite; }
.wave { animation: wave 1s ease-in-out infinite; }
```

## 实战案例

### 1. 加载动画集合

```tsx
function LoadingSpinners() {
  return (
    <div className="spinner-grid">
      <div className="spinner-1"></div>
      <div className="spinner-2"></div>
      <div className="spinner-3"></div>
      <div className="spinner-4">
        <div></div><div></div><div></div><div></div>
      </div>
    </div>
  );
}
```

```css
/* Spinner 1: 旋转圆环 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-1 {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Spinner 2: 脉冲点 */
@keyframes pulsate {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.spinner-2 {
  width: 40px;
  height: 40px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: pulsate 1s ease-in-out infinite;
}

/* Spinner 3: 跳动条 */
@keyframes bounce-bars {
  0%, 100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}

.spinner-3 {
  width: 40px;
  height: 40px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.spinner-3::before,
.spinner-3::after {
  content: '';
  flex: 1;
  height: 100%;
  background-color: #3b82f6;
  animation: bounce-bars 1s ease-in-out infinite;
}

.spinner-3::after {
  animation-delay: 0.2s;
}

/* Spinner 4: 追逐圆点 */
@keyframes chase {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes chase-dot {
  0%, 100% { transform: rotate(0deg); }
  80%, 100% { transform: rotate(360deg); }
}

.spinner-4 {
  width: 40px;
  height: 40px;
  position: relative;
  animation: chase 2s linear infinite;
}

.spinner-4 div {
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
  position: absolute;
  animation: chase-dot 2s ease-in-out infinite;
}

.spinner-4 div:nth-child(1) { top: 0; left: 16px; animation-delay: -1.1s; }
.spinner-4 div:nth-child(2) { top: 16px; right: 0; animation-delay: -1s; }
.spinner-4 div:nth-child(3) { bottom: 0; left: 16px; animation-delay: -0.9s; }
.spinner-4 div:nth-child(4) { top: 16px; left: 0; animation-delay: -0.8s; }
```

### 2. 骨架屏

```tsx
function SkeletonLoader() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
    </div>
  );
}
```

```css
@keyframes skeleton-loading {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  max-width: 400px;
}

.skeleton-image,
.skeleton-title,
.skeleton-text {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #f8f8f8 40px,
    #f0f0f0 80px
  );
  background-size: 200px 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-image {
  height: 200px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-title {
  height: 20px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 16px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 60%;
}
```

### 3. 通知动画

```tsx
interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const addNotification = (message: string, type: Notification['type']) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };
  
  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <span>{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
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
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  min-width: 300px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  animation: slideInRight 0.3s ease-out;
}

.notification.removing {
  animation: slideOutRight 0.3s ease-out forwards;
}

.notification-success { border-left: 4px solid #10b981; }
.notification-error { border-left: 4px solid #ef4444; }
.notification-info { border-left: 4px solid #3b82f6; }

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 0 4px;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #111827;
}
```

### 4. 打字机效果

```tsx
function TypewriterEffect({ text }: { text: string }) {
  return (
    <div className="typewriter">
      <span>{text}</span>
    </div>
  );
}
```

```css
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: #3b82f6;
  }
}

.typewriter {
  overflow: hidden;
  border-right: 3px solid #3b82f6;
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: 0.15em;
  
  animation:
    typing 3.5s steps(40, end),
    blink-caret 0.75s step-end infinite;
}
```

### 5. 浮动按钮

```tsx
function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`fab-container ${isOpen ? 'open' : ''}`}>
      <button
        className="fab-main"
        onClick={() => setIsOpen(!isOpen)}
      >
        +
      </button>
      
      <button className="fab-action fab-action-1">📝</button>
      <button className="fab-action fab-action-2">📷</button>
      <button className="fab-action fab-action-3">📎</button>
    </div>
  );
}
```

```css
@keyframes fab-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(135deg); }
}

@keyframes fab-slide-in {
  from {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  to {
    transform: translateY(var(--translate-y)) scale(1);
    opacity: 1;
  }
}

.fab-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  transition: transform 0.3s ease;
}

.fab-container.open .fab-main {
  animation: fab-rotate 0.3s ease forwards;
}

.fab-action {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  opacity: 0;
  transform: scale(0);
}

.fab-container.open .fab-action-1 {
  --translate-y: -70px;
  animation: fab-slide-in 0.3s ease 0.05s forwards;
}

.fab-container.open .fab-action-2 {
  --translate-y: -140px;
  animation: fab-slide-in 0.3s ease 0.1s forwards;
}

.fab-container.open .fab-action-3 {
  --translate-y: -210px;
  animation: fab-slide-in 0.3s ease 0.15s forwards;
}
```

## 动画事件监听

### animationstart/end/iteration事件

```tsx
function AnimationEventListener() {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const handleAnimationStart = (e: AnimationEvent) => {
      setEventLog(prev => [...prev, `Started: ${e.animationName}`]);
    };
    
    const handleAnimationIteration = (e: AnimationEvent) => {
      setEventLog(prev => [...prev, `Iteration: ${e.animationName}`]);
    };
    
    const handleAnimationEnd = (e: AnimationEvent) => {
      setEventLog(prev => [...prev, `Ended: ${e.animationName}`]);
    };
    
    element.addEventListener('animationstart', handleAnimationStart);
    element.addEventListener('animationiteration', handleAnimationIteration);
    element.addEventListener('animationend', handleAnimationEnd);
    
    return () => {
      element.removeEventListener('animationstart', handleAnimationStart);
      element.removeEventListener('animationiteration', handleAnimationIteration);
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, []);
  
  return (
    <div>
      <div ref={elementRef} className="monitored-animation">
        Animated Element
      </div>
      
      <div className="event-log">
        {eventLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
```

### 自定义Hook封装

```tsx
function useAnimationEvent(
  ref: RefObject<HTMLElement>,
  callbacks: {
    onStart?: (animationName: string) => void;
    onIteration?: (animationName: string) => void;
    onEnd?: (animationName: string) => void;
  }
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleStart = (e: AnimationEvent) => {
      callbacks.onStart?.(e.animationName);
    };
    
    const handleIteration = (e: AnimationEvent) => {
      callbacks.onIteration?.(e.animationName);
    };
    
    const handleEnd = (e: AnimationEvent) => {
      callbacks.onEnd?.(e.animationName);
    };
    
    element.addEventListener('animationstart', handleStart);
    element.addEventListener('animationiteration', handleIteration);
    element.addEventListener('animationend', handleEnd);
    
    return () => {
      element.removeEventListener('animationstart', handleStart);
      element.removeEventListener('animationiteration', handleIteration);
      element.removeEventListener('animationend', handleEnd);
    };
  }, [ref, callbacks]);
}

// 使用
function Component() {
  const ref = useRef<HTMLDivElement>(null);
  
  useAnimationEvent(ref, {
    onStart: (name) => console.log(`Animation ${name} started`),
    onEnd: (name) => console.log(`Animation ${name} ended`),
  });
  
  return <div ref={ref} className="animated">...</div>;
}
```

## 性能优化

### 使用GPU加速

```css
/* ✅ 触发GPU加速 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
  animation: slideIn 1s ease-out;
}

/* ✅ 使用transform代替position */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* ❌ 避免 */
@keyframes bad-slideIn {
  from { left: -100%; }
  to { left: 0; }
}
```

### 减少重绘和回流

```css
/* ✅ 只影响合成层 */
.optimized {
  animation: fade-scale 1s ease;
}

@keyframes fade-scale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ❌ 会触发布局 */
.unoptimized {
  animation: bad-animation 1s ease;
}

@keyframes bad-animation {
  from {
    width: 100px;
    height: 100px;
  }
  to {
    width: 200px;
    height: 200px;
  }
}
```

### containment隔离

```css
.container {
  contain: layout style paint;
}

.animated-item {
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

## 最佳实践总结

### 性能优化清单

```
✅ 优先使用transform和opacity动画
✅ 使用will-change提示即将变化的属性
✅ 避免同时动画过多元素
✅ 使用CSS containment隔离影响
✅ 合理设置animation-fill-mode
✅ 避免在关键帧中改变布局属性
✅ 使用requestAnimationFrame同步JS动画
✅ 测试低端设备性能
```

### 可访问性要求

```
✅ 支持prefers-reduced-motion
✅ 提供暂停/停止动画选项
✅ 避免闪烁频率过高(防止光敏性癫痫)
✅ 确保动画不影响内容可读性
✅ 为关键信息提供非动画替代
```

### 开发建议

```
✅ 使用CSS变量管理动画参数
✅ 为复杂动画创建@keyframes库
✅ 使用开发工具调试动画性能
✅ 编写可复用的动画组件
✅ 文档化自定义动画效果
```

CSS Animations为React应用提供了强大的动画能力。通过合理使用@keyframes和动画属性,结合React的组件化思想,可以创建流畅自然、性能优异的动画效果,大幅提升用户体验。

