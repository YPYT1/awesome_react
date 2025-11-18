# React与CSS动画结合

## 概述

在React应用中优雅地集成CSS动画需要深入理解React的组件生命周期、状态管理以及DOM操作时机。本文将全面讲解如何在React中高效使用CSS动画,包括进入/退出动画、条件渲染动画、路由切换动画等实战场景,帮助你构建流畅的用户界面。

## React动画基础

### 组件挂载/卸载动画

#### 基础实现

```tsx
import { useState, useEffect } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);
  
  const handleAnimationEnd = () => {
    if (!isOpen) {
      setShouldRender(false);
    }
  };
  
  if (!shouldRender) return null;
  
  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : 'close'}`}
      onAnimationEnd={handleAnimationEnd}
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Modal Title</h2>
        <p>Modal content goes here...</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay.open {
  animation: fadeIn 0.3s ease-out;
}

.modal-overlay.close {
  animation: fadeOut 0.3s ease-out;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal-overlay.open .modal-content {
  animation: slideUp 0.3s ease-out;
}

.modal-overlay.close .modal-content {
  animation: slideDown 0.3s ease-out;
}
```

#### 自定义Hook封装

```tsx
function useAnimatedUnmount(visible: boolean, unmountDelay = 300) {
  const [shouldRender, setShouldRender] = useState(visible);
  
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, unmountDelay);
      
      return () => clearTimeout(timer);
    }
  }, [visible, unmountDelay]);
  
  return shouldRender;
}

// 使用
function AnimatedComponent({ isVisible }: { isVisible: boolean }) {
  const shouldRender = useAnimatedUnmount(isVisible, 300);
  
  if (!shouldRender) return null;
  
  return (
    <div className={`animated ${isVisible ? 'enter' : 'exit'}`}>
      Content
    </div>
  );
}
```

### 列表动画

#### 交错进入动画

```tsx
interface Item {
  id: number;
  text: string;
}

function StaggeredList({ items }: { items: Item[] }) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  
  useEffect(() => {
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, item.id]);
      }, index * 100);
    });
  }, [items]);
  
  return (
    <ul className="staggered-list">
      {items.map((item) => (
        <li
          key={item.id}
          className={`list-item ${visibleItems.includes(item.id) ? 'visible' : ''}`}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}
```

```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.list-item {
  opacity: 0;
  transform: translateX(-20px);
}

.list-item.visible {
  animation: slideInLeft 0.3s ease-out forwards;
}
```

#### 列表项删除动画

```tsx
function AnimatedList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  
  const removeItem = (id: number) => {
    setRemovingId(id);
    
    setTimeout(() => {
      setItems(items => items.filter(item => item.id !== id));
      setRemovingId(null);
    }, 300);
  };
  
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          className={`item ${removingId === item.id ? 'removing' : ''}`}
        >
          <span>{item.text}</span>
          <button onClick={() => removeItem(item.id)}>×</button>
        </li>
      ))}
    </ul>
  );
}
```

```css
@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.item {
  transition: margin 0.3s ease;
}

.item.removing {
  animation: slideOutRight 0.3s ease-out forwards;
  margin-bottom: 0 !important;
}
```

## React Transition Group

### CSSTransition组件

```tsx
import { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import './Transitions.css';

function AlertBox() {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>
        Toggle Alert
      </button>
      
      <CSSTransition
        in={show}
        timeout={300}
        classNames="alert"
        unmountOnExit
      >
        <div className="alert">
          <p>This is an alert message!</p>
          <button onClick={() => setShow(false)}>Dismiss</button>
        </div>
      </CSSTransition>
    </div>
  );
}
```

```css
/* 进入开始 */
.alert-enter {
  opacity: 0;
  transform: scale(0.9);
}

/* 进入活跃状态 */
.alert-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: opacity 300ms, transform 300ms;
}

/* 退出开始 */
.alert-exit {
  opacity: 1;
  transform: scale(1);
}

/* 退出活跃状态 */
.alert-exit-active {
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 300ms, transform 300ms;
}
```

### TransitionGroup列表动画

```tsx
import { TransitionGroup, CSSTransition } from 'react-transition-group';

interface Todo {
  id: number;
  text: string;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue }]);
      setInputValue('');
    }
  };
  
  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div>
      <div className="input-group">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <TransitionGroup className="todo-list">
        {todos.map((todo) => (
          <CSSTransition
            key={todo.id}
            timeout={500}
            classNames="todo"
          >
            <div className="todo-item">
              <span>{todo.text}</span>
              <button onClick={() => removeTodo(todo.id)}>×</button>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
}
```

```css
.todo-list {
  list-style: none;
  padding: 0;
}

.todo-enter {
  opacity: 0;
  transform: translateY(-10px);
}

.todo-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 500ms, transform 500ms;
}

.todo-exit {
  opacity: 1;
  transform: translateX(0);
}

.todo-exit-active {
  opacity: 0;
  transform: translateX(100%);
  transition: opacity 500ms, transform 500ms;
}

.todo-item {
  padding: 12px;
  margin-bottom: 8px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## 路由切换动画

### React Router动画

```tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="page"
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}
```

```css
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 300ms, transform 300ms;
}
```

### 方向感知切换

```tsx
function DirectionalRouteTransition() {
  const location = useLocation();
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const prevLocationRef = useRef(location);
  
  useEffect(() => {
    const routeOrder = ['/', '/page1', '/page2', '/page3'];
    const prevIndex = routeOrder.indexOf(prevLocationRef.current.pathname);
    const currentIndex = routeOrder.indexOf(location.pathname);
    
    setDirection(currentIndex > prevIndex ? 'forward' : 'backward');
    prevLocationRef.current = location;
  }, [location]);
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames={`page-${direction}`}
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="/page3" element={<Page3 />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}
```

```css
/* 前进动画 */
.page-forward-enter {
  transform: translateX(100%);
}

.page-forward-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

.page-forward-exit {
  transform: translateX(0);
}

.page-forward-exit-active {
  transform: translateX(-100%);
  transition: transform 300ms ease-out;
}

/* 后退动画 */
.page-backward-enter {
  transform: translateX(-100%);
}

.page-backward-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

.page-backward-exit {
  transform: translateX(0);
}

.page-backward-exit-active {
  transform: translateX(100%);
  transition: transform 300ms ease-out;
}
```

## 高级动画模式

### 共享元素过渡

```tsx
interface CardData {
  id: number;
  title: string;
  image: string;
}

function SharedElementTransition() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleCardClick = (card: CardData) => {
    setIsAnimating(true);
    setSelectedCard(card);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };
  
  const handleClose = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setSelectedCard(null);
      setIsAnimating(false);
    }, 300);
  };
  
  return (
    <div className="shared-transition-container">
      {!selectedCard && (
        <div className="card-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className="card"
              onClick={() => handleCardClick(card)}
            >
              <img src={card.image} alt={card.title} />
              <h3>{card.title}</h3>
            </div>
          ))}
        </div>
      )}
      
      {selectedCard && (
        <div
          className={`detail-view ${isAnimating ? 'animating' : ''}`}
          onClick={handleClose}
        >
          <div className="detail-content">
            <img src={selectedCard.image} alt={selectedCard.title} />
            <h2>{selectedCard.title}</h2>
            <p>Detailed content here...</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

```css
@keyframes expandCard {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.detail-view.animating {
  animation: expandCard 0.3s ease-out;
}

.detail-content img {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
}
```

### 序列化动画

```tsx
function SequentialAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4'];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((step) => (step + 1) % steps.length);
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="sequence-container">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step ${index === activeStep ? 'active' : ''} ${
            index < activeStep ? 'completed' : ''
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {step}
        </div>
      ))}
    </div>
  );
}
```

```css
@keyframes stepActivate {
  0% {
    transform: scale(1);
    background-color: #e5e7eb;
  }
  50% {
    transform: scale(1.1);
    background-color: #3b82f6;
  }
  100% {
    transform: scale(1);
    background-color: #3b82f6;
  }
}

.step {
  padding: 16px;
  border-radius: 8px;
  background-color: #e5e7eb;
  margin-bottom: 12px;
  transition: background-color 0.3s;
}

.step.active {
  animation: stepActivate 0.5s ease;
  color: white;
}

.step.completed {
  background-color: #10b981;
  color: white;
}
```

### 视差滚动动画

```tsx
function ParallaxScroll() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="parallax-container">
      <div
        className="parallax-bg"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />
      
      <div
        className="parallax-content"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <h1>Parallax Title</h1>
        <p>Scroll to see the effect</p>
      </div>
    </div>
  );
}
```

```css
.parallax-container {
  height: 200vh;
  position: relative;
  overflow: hidden;
}

.parallax-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.parallax-content {
  position: relative;
  padding: 100px 20px;
  color: white;
  text-align: center;
}
```

## 实战案例

### 1. 抽屉菜单

```tsx
function Drawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  return (
    <>
      {isOpen && (
        <div className="drawer-overlay" onClick={onClose}>
          <div
            ref={drawerRef}
            className={`drawer ${isOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h2>Menu</h2>
              <button onClick={onClose}>×</button>
            </div>
            
            <div className="drawer-content">
              <nav>
                <a href="/">Home</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  animation: slideInLeft 0.3s ease-out;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.drawer-content nav {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.drawer-content nav a {
  padding: 12px;
  text-decoration: none;
  color: #374151;
  transition: background-color 0.2s;
}

.drawer-content nav a:hover {
  background-color: #f3f4f6;
}
```

### 2. 折叠面板

```tsx
interface AccordionItem {
  id: number;
  title: string;
  content: string;
}

function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  
  const toggleItem = (id: number) => {
    setOpenId(openId === id ? null : id);
  };
  
  return (
    <div className="accordion">
      {items.map((item) => (
        <div key={item.id} className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => toggleItem(item.id)}
          >
            <span>{item.title}</span>
            <span className={`arrow ${openId === item.id ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          
          <div
            className={`accordion-content ${openId === item.id ? 'open' : ''}`}
          >
            <div className="accordion-body">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

```css
.accordion-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  padding: 16px;
  background-color: #f9fafb;
  border: none;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background-color: #f3f4f6;
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.accordion-content.open {
  max-height: 500px;
}

.accordion-body {
  padding: 16px;
}
```

### 3. 图片轮播

```tsx
function Carousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  const goToNext = () => {
    setDirection('next');
    setCurrentIndex((index) => (index + 1) % images.length);
  };
  
  const goToPrev = () => {
    setDirection('prev');
    setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  };
  
  useEffect(() => {
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="carousel">
      <button className="carousel-button prev" onClick={goToPrev}>
        ‹
      </button>
      
      <div className="carousel-track">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`carousel-image ${
              index === currentIndex
                ? `active ${direction}`
                : index === (currentIndex - 1 + images.length) % images.length
                ? 'prev'
                : 'next'
            }`}
          />
        ))}
      </div>
      
      <button className="carousel-button next" onClick={goToNext}>
        ›
      </button>
      
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => {
              setDirection(index > currentIndex ? 'next' : 'prev');
              setCurrentIndex(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

```css
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.carousel {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
}

.carousel-track {
  position: relative;
  height: 400px;
}

.carousel-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
}

.carousel-image.active.next {
  animation: slideInFromRight 0.5s ease forwards;
  opacity: 1;
}

.carousel-image.active.prev {
  animation: slideInFromLeft 0.5s ease forwards;
  opacity: 1;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;
}

.carousel-button:hover {
  background-color: white;
}

.carousel-button.prev { left: 20px; }
.carousel-button.next { right: 20px; }

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
}

.dot.active {
  background-color: white;
  transform: scale(1.2);
}
```

### 4. 下拉菜单

```tsx
function Dropdown({ trigger, items }: {
  trigger: React.ReactNode;
  items: Array<{ label: string; onClick: () => void }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="dropdown" ref={dropdownRef}>
      <button className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {items.map((item, index) => (
            <button
              key={index}
              className="dropdown-item"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

```css
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dropdownItemSlide {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-trigger:hover {
  background-color: #2563eb;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
  animation: dropdownFadeIn 0.2s ease-out;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  animation: dropdownItemSlide 0.3s ease-out backwards;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}
```

## 性能优化

### 动画性能监控

```tsx
function AnimationPerformanceMonitor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          console.log(`Animation ${entry.name}: ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
  
  return <>{children}</>;
}
```

### 使用requestAnimationFrame

```tsx
function useRAF(callback: () => void, deps: any[]) {
  const requestRef = useRef<number>();
  
  useEffect(() => {
    const animate = () => {
      callback();
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, deps);
}

// 使用
function SmoothCounter() {
  const [target, setTarget] = useState(100);
  const [current, setCurrent] = useState(0);
  
  useRAF(() => {
    setCurrent((prev) => {
      const diff = target - prev;
      if (Math.abs(diff) < 0.1) return target;
      return prev + diff * 0.1;
    });
  }, [target]);
  
  return (
    <div>
      <div>Count: {Math.round(current)}</div>
      <button onClick={() => setTarget(Math.random() * 1000)}>
        Random Target
      </button>
    </div>
  );
}
```

## 最佳实践总结

### 开发清单

```
✅ 使用CSS动画代替JavaScript动画
✅ 优先使用transform和opacity
✅ 合理使用React Transition Group
✅ 为列表项添加唯一key
✅ 使用will-change提示优化
✅ 避免在渲染时创建动画
✅ 清理定时器和事件监听器
✅ 测试动画在不同设备的表现
```

### 性能优化

```
✅ 使用requestAnimationFrame同步动画
✅ 避免强制同步布局
✅ 使用CSS containment隔离
✅ 限制同时动画的元素数量
✅ 为长列表使用虚拟滚动
✅ 延迟加载非关键动画
✅ 监控动画性能指标
```

### 可访问性

```
✅ 支持prefers-reduced-motion
✅ 提供跳过动画选项
✅ 确保键盘导航正常
✅ 为屏幕阅读器提供适当提示
✅ 测试高对比度模式
```

React与CSS动画的结合为构建流畅、响应式的用户界面提供了强大工具。通过掌握组件生命周期、合理使用动画库、优化性能,可以创建出色的动画体验。

