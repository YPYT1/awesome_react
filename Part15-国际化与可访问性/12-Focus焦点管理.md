# Focus焦点管理 - 完整焦点控制指南

## 1. 焦点管理基础

### 1.1 什么是焦点

焦点(Focus)是指当前接受键盘输入的元素。良好的焦点管理对键盘用户和屏幕阅读器用户至关重要。

```typescript
// 可聚焦元素
const focusableElements = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details',
  'summary'
];

// 获取所有可聚焦元素
function getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableElements.join(','))
  );
}

// 检查元素是否可聚焦
function isFocusable(element: HTMLElement): boolean {
  return focusableElements.some(selector => element.matches(selector));
}
```

### 1.2 焦点状态

```typescript
// 焦点状态类型
type FocusState = {
  hasFocus: boolean;        // 是否有焦点
  isFocusVisible: boolean;  // 焦点是否可见
  focusedElement: HTMLElement | null; // 当前焦点元素
  previousFocus: HTMLElement | null;  // 之前的焦点元素
};

// 焦点状态管理
export function useFocusState() {
  const [state, setState] = useState<FocusState>({
    hasFocus: false,
    isFocusVisible: false,
    focusedElement: null,
    previousFocus: null
  });
  
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      setState(prev => ({
        hasFocus: true,
        isFocusVisible: true,
        focusedElement: e.target as HTMLElement,
        previousFocus: prev.focusedElement
      }));
    };
    
    const handleFocusOut = () => {
      setState(prev => ({
        ...prev,
        hasFocus: false
      }));
    };
    
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);
  
  return state;
}
```

## 2. 焦点样式

### 2.1 默认焦点样式

```css
/* 浏览器默认焦点样式 */
:focus {
  outline: auto; /* 各浏览器不同 */
}

/* ❌ 永远不要这样做 */
* {
  outline: none !important; /* 移除所有焦点指示器 */
}

/* ✅ 自定义焦点样式 */
:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* 圆角元素的焦点样式 */
button:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 使用box-shadow替代outline */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.3);
  border-color: #0066cc;
}
```

### 2.2 focus-visible伪类

```css
/* :focus-visible - 仅键盘聚焦时显示 */
button:focus {
  outline: none; /* 移除默认样式 */
}

button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* 鼠标点击不显示焦点,键盘导航显示 */
.interactive:focus {
  outline: none;
}

.interactive:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 3px;
}

/* 不同元素的焦点样式 */
a:focus-visible {
  outline: 2px dashed #0066cc;
  outline-offset: 4px;
  border-radius: 2px;
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 0;
  border-color: #0066cc;
}
```

### 2.3 React焦点样式组件

```tsx
// FocusRing.tsx
export function FocusRing({ children }: { children: React.ReactNode }) {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = () => setIsFocusVisible(true);
    const handleMouseDown = () => setIsFocusVisible(false);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  return (
    <div className={isFocusVisible ? 'focus-visible' : ''}>
      {children}
    </div>
  );
}

// CSS
.focus-visible *:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

## 3. 焦点控制API

### 3.1 基础焦点API

```typescript
// focus() - 设置焦点
const element = document.getElementById('myInput');
element?.focus();

// blur() - 移除焦点
element?.blur();

// hasFocus() - 检查文档是否有焦点
const documentHasFocus = document.hasFocus();

// activeElement - 获取当前焦点元素
const currentFocus = document.activeElement;

// focus选项
element?.focus({
  preventScroll: false, // 是否滚动到元素
  focusVisible: true    // 是否显示焦点指示器(实验性)
});
```

### 3.2 React焦点Hook

```tsx
// useFocus.ts
export function useFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  
  const focus = useCallback((options?: FocusOptions) => {
    ref.current?.focus(options);
  }, []);
  
  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);
  
  const isFocused = useCallback(() => {
    return document.activeElement === ref.current;
  }, []);
  
  return { ref, focus, blur, isFocused };
}

// 使用
function MyComponent() {
  const { ref, focus } = useFocus<HTMLInputElement>();
  
  return (
    <>
      <button onClick={() => focus()}>聚焦输入框</button>
      <input ref={ref} />
    </>
  );
}

// useAutoFocus - 自动聚焦
export function useAutoFocus<T extends HTMLElement>(
  shouldFocus: boolean = true
) {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    if (shouldFocus) {
      ref.current?.focus();
    }
  }, [shouldFocus]);
  
  return ref;
}

// 使用
function Modal({ isOpen }: { isOpen: boolean }) {
  const inputRef = useAutoFocus<HTMLInputElement>(isOpen);
  
  return isOpen ? (
    <dialog>
      <input ref={inputRef} placeholder="自动聚焦" />
    </dialog>
  ) : null;
}
```

## 4. 焦点陷阱(Focus Trap)

### 4.1 手动实现焦点陷阱

```tsx
// FocusTrap.tsx
export function FocusTrap({
  children,
  active = true,
  initialFocus
}: {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: HTMLElement;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // 获取可聚焦元素
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // 初始聚焦
    if (initialFocus) {
      initialFocus.focus();
    } else {
      firstElement?.focus();
    }
    
    // Tab键处理
    const handleKeyDown = (e: KeyboardEvent) => {
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
    
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active, initialFocus]);
  
  return <div ref={containerRef}>{children}</div>;
}
```

### 4.2 焦点恢复

```tsx
// useFocusRestore.ts
export function useFocusRestore() {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);
  
  const restoreFocus = useCallback(() => {
    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, []);
  
  return { saveFocus, restoreFocus };
}

// Dialog示例
export function Dialog({ isOpen, onClose }: DialogProps) {
  const { saveFocus, restoreFocus } = useFocusRestore();
  
  useEffect(() => {
    if (isOpen) {
      saveFocus();
    } else {
      restoreFocus();
    }
  }, [isOpen, saveFocus, restoreFocus]);
  
  if (!isOpen) return null;
  
  return (
    <FocusTrap active={isOpen}>
      <div role="dialog" aria-modal="true">
        <h2>对话框</h2>
        <button onClick={onClose}>关闭</button>
      </div>
    </FocusTrap>
  );
}
```

## 5. 焦点导航

### 5.1 Skip Links

```tsx
// SkipLinks.tsx
export function SkipLinks() {
  const links = [
    { href: '#main-content', label: '跳转到主内容' },
    { href: '#navigation', label: '跳转到导航' },
    { href: '#footer', label: '跳转到页脚' }
  ];
  
  return (
    <nav aria-label="快速导航" className="skip-links">
      {links.map(link => (
        <a
          key={link.href}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target instanceof HTMLElement) {
              target.tabIndex = -1;
              target.focus();
              target.scrollIntoView();
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

// CSS
.skip-links {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  text-decoration: none;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

### 5.2 焦点导航Hook

```tsx
// useFocusNavigation.ts
export function useFocusNavigation(
  direction: 'horizontal' | 'vertical' = 'horizontal'
) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isNext = direction === 'horizontal' 
      ? e.key === 'ArrowRight' 
      : e.key === 'ArrowDown';
    const isPrev = direction === 'horizontal' 
      ? e.key === 'ArrowLeft' 
      : e.key === 'ArrowUp';
    
    if (!isNext && !isPrev) return;
    
    e.preventDefault();
    
    const currentElement = e.currentTarget;
    const focusables = getFocusableElements(currentElement as HTMLElement);
    const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
    
    let nextIndex;
    if (isNext) {
      nextIndex = (currentIndex + 1) % focusables.length;
    } else {
      nextIndex = (currentIndex - 1 + focusables.length) % focusables.length;
    }
    
    focusables[nextIndex]?.focus();
  }, [direction]);
  
  return { handleKeyDown };
}

// Toolbar示例
export function Toolbar({ items }: { items: ToolbarItem[] }) {
  const { handleKeyDown } = useFocusNavigation('horizontal');
  
  return (
    <div
      role="toolbar"
      aria-label="工具栏"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          tabIndex={index === 0 ? 0 : -1}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

## 6. 模态框焦点管理

### 6.1 模态框最佳实践

```tsx
// Modal.tsx
export function Modal({
  isOpen,
  onClose,
  title,
  children
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { saveFocus, restoreFocus } = useFocusRestore();
  
  // 禁用背景内容
  useEffect(() => {
    if (!isOpen) return;
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('inert', 'true');
      mainContent.setAttribute('aria-hidden', 'true');
    }
    
    return () => {
      mainContent?.removeAttribute('inert');
      mainContent?.removeAttribute('aria-hidden');
    };
  }, [isOpen]);
  
  // 焦点管理
  useEffect(() => {
    if (isOpen) {
      saveFocus();
      closeButtonRef.current?.focus();
    } else {
      restoreFocus();
    }
  }, [isOpen, saveFocus, restoreFocus]);
  
  // Escape键关闭
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 id="modal-title">{title}</h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="关闭对话框"
            >
              ✕
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </FocusTrap>
    </div>
  );
}
```

### 6.2 嵌套模态框

```tsx
// ModalStack.tsx
const ModalStackContext = createContext<{
  openModals: string[];
  pushModal: (id: string) => void;
  popModal: (id: string) => void;
}>({
  openModals: [],
  pushModal: () => {},
  popModal: () => {}
});

export function ModalStackProvider({ children }: { children: React.ReactNode }) {
  const [openModals, setOpenModals] = useState<string[]>([]);
  
  const pushModal = useCallback((id: string) => {
    setOpenModals(prev => [...prev, id]);
  }, []);
  
  const popModal = useCallback((id: string) => {
    setOpenModals(prev => prev.filter(modalId => modalId !== id));
  }, []);
  
  return (
    <ModalStackContext.Provider value={{ openModals, pushModal, popModal }}>
      {children}
    </ModalStackContext.Provider>
  );
}

// 支持嵌套的Modal
export function StackedModal({ id, ...props }: ModalProps & { id: string }) {
  const { openModals, pushModal, popModal } = useContext(ModalStackContext);
  const isTopModal = openModals[openModals.length - 1] === id;
  
  useEffect(() => {
    if (props.isOpen) {
      pushModal(id);
    } else {
      popModal(id);
    }
  }, [props.isOpen, id, pushModal, popModal]);
  
  return (
    <FocusTrap active={props.isOpen && isTopModal}>
      <Modal {...props} />
    </FocusTrap>
  );
}
```

## 7. 焦点指示器

### 7.1 自定义焦点指示器

```tsx
// FocusIndicator.tsx
export function FocusIndicator({
  children,
  color = '#0066cc',
  width = 2,
  offset = 2,
  style = 'solid'
}: {
  children: React.ReactNode;
  color?: string;
  width?: number;
  offset?: number;
  style?: 'solid' | 'dashed' | 'dotted';
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >
      {children}
      {isFocused && (
        <div
          className="focus-indicator"
          style={{
            position: 'absolute',
            top: -offset,
            left: -offset,
            right: -offset,
            bottom: -offset,
            border: `${width}px ${style} ${color}`,
            borderRadius: 4,
            pointerEvents: 'none'
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
```

### 7.2 动画焦点指示器

```tsx
// AnimatedFocusRing.tsx
export function AnimatedFocusRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="focus-ring-container">
      {children}
    </div>
  );
}

// CSS
.focus-ring-container *:focus {
  outline: none;
  position: relative;
}

.focus-ring-container *:focus::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid #0066cc;
  border-radius: 6px;
  animation: focus-ring-appear 0.2s ease-out;
}

@keyframes focus-ring-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## 8. 焦点调试

### 8.1 焦点可视化

```tsx
// FocusDebugger.tsx
export function FocusDebugger() {
  const [focusPath, setFocusPath] = useState<string[]>([]);
  
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const element = e.target as HTMLElement;
      const path = getElementPath(element);
      setFocusPath(prev => [...prev, path].slice(-10));
    };
    
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="focus-debugger">
      <h3>焦点历史:</h3>
      <ul>
        {focusPath.map((path, index) => (
          <li key={index}>{path}</li>
        ))}
      </ul>
      <p>
        当前焦点: <code>{document.activeElement?.tagName}</code>
      </p>
    </div>
  );
}

function getElementPath(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body) {
    let part = current.tagName.toLowerCase();
    if (current.id) part += `#${current.id}`;
    if (current.className) part += `.${current.className.split(' ')[0]}`;
    parts.unshift(part);
    current = current.parentElement;
  }
  
  return parts.join(' > ');
}
```

### 8.2 焦点测试

```typescript
// focus.test.tsx
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Focus Management', () => {
  it('should trap focus in modal', async () => {
    const { getByRole } = render(<Modal isOpen={true} />);
    const user = userEvent.setup();
    
    const firstButton = getByRole('button', { name: 'First' });
    const lastButton = getByRole('button', { name: 'Last' });
    
    firstButton.focus();
    expect(firstButton).toHaveFocus();
    
    // Tab循环
    await user.tab();
    await user.tab();
    expect(lastButton).toHaveFocus();
    
    await user.tab();
    expect(firstButton).toHaveFocus();
  });
  
  it('should restore focus after modal closes', () => {
    const { getByRole, rerender } = render(
      <>
        <button id="trigger">Open</button>
        <Modal isOpen={false} />
      </>
    );
    
    const trigger = getByRole('button', { name: 'Open' });
    trigger.focus();
    expect(trigger).toHaveFocus();
    
    // 打开模态框
    rerender(
      <>
        <button id="trigger">Open</button>
        <Modal isOpen={true} />
      </>
    );
    
    expect(trigger).not.toHaveFocus();
    
    // 关闭模态框
    rerender(
      <>
        <button id="trigger">Open</button>
        <Modal isOpen={false} />
      </>
    );
    
    expect(trigger).toHaveFocus();
  });
});
```

## 9. 最佳实践

```typescript
const focusBestPractices = {
  visual: [
    '始终提供清晰的焦点指示器',
    '不要移除焦点样式',
    '使用:focus-visible区分鼠标和键盘',
    '确保焦点指示器对比度足够',
    '避免使用难以看见的焦点样式'
  ],
  
  navigation: [
    '保持逻辑的Tab顺序',
    '提供Skip Links',
    '模态框使用焦点陷阱',
    '关闭对话框恢复焦点',
    '动态内容适当管理焦点'
  ],
  
  implementation: [
    '使用原生可聚焦元素',
    '必要时使用tabindex="0"',
    '避免tabindex正值',
    '禁用元素不可聚焦',
    '隐藏元素移除焦点'
  ],
  
  testing: [
    '拔掉鼠标测试',
    '验证焦点顺序',
    '测试焦点陷阱',
    '检查焦点恢复',
    '自动化焦点测试'
  ]
};
```

## 10. 总结

焦点管理的关键要点:

1. **焦点指示器**: 清晰可见的焦点样式
2. **焦点顺序**: 逻辑合理的Tab顺序
3. **焦点陷阱**: 模态框正确限制焦点
4. **焦点恢复**: 关闭对话框恢复焦点
5. **Skip Links**: 提供快速导航
6. **自定义组件**: 确保可聚焦和键盘操作
7. **持续测试**: 仅用键盘测试所有功能

通过正确管理焦点,可以让键盘用户和辅助技术用户高效地使用应用。

