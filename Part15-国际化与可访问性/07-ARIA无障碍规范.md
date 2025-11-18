# ARIA无障碍规范 - WAI-ARIA完整实践指南

## 1. ARIA概述

### 1.1 什么是ARIA

ARIA(Accessible Rich Internet Applications)是WAI(Web Accessibility Initiative)制定的规范,通过添加HTML属性来增强Web应用的可访问性。

**核心作用:**
- 定义元素角色(role)
- 描述元素状态(state)
- 设置元素属性(property)
- 建立元素关系

### 1.2 ARIA的三大支柱

```typescript
const ariaFoundations = {
  roles: {
    purpose: '定义元素类型和用途',
    examples: ['button', 'dialog', 'navigation', 'tablist']
  },
  
  states: {
    purpose: '描述元素当前状态(可变)',
    examples: ['aria-expanded', 'aria-checked', 'aria-disabled']
  },
  
  properties: {
    purpose: '定义元素特征(通常不变)',
    examples: ['aria-label', 'aria-describedby', 'aria-required']
  }
};
```

### 1.3 ARIA使用原则

```typescript
const ariaRules = {
  rule1: '能用原生HTML就用原生,ARIA是补充不是替代',
  rule2: '不要改变原生语义',
  rule3: '所有交互元素必须可键盘访问',
  rule4: '不要使用role="presentation"或aria-hidden="true"在可获焦元素上',
  rule5: '交互元素必须有可访问的名称'
};

// ❌ 错误示例
<div role="button">Click me</div>

// ✅ 正确示例
<button>Click me</button>

// ❌ 不要这样
<button role="heading">Title</button>

// ✅ 这样才对
<h1>Title</h1>
```

## 2. ARIA Roles(角色)

### 2.1 Landmark Roles(地标角色)

```html
<!-- banner: 页面横幅 -->
<header role="banner">
  <h1>网站标题</h1>
</header>

<!-- navigation: 导航 -->
<nav role="navigation" aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<!-- main: 主要内容 -->
<main role="main">
  <h2>页面内容</h2>
</main>

<!-- complementary: 补充内容 -->
<aside role="complementary" aria-label="相关链接">
  <h3>相关文章</h3>
</aside>

<!-- contentinfo: 页面信息 -->
<footer role="contentinfo">
  <p>&copy; 2024 公司名称</p>
</footer>

<!-- search: 搜索区域 -->
<div role="search">
  <input type="search" aria-label="搜索网站" />
  <button>搜索</button>
</div>

<!-- region: 重要区域 -->
<section role="region" aria-label="用户评论">
  <h2>评论</h2>
</section>
```

### 2.2 Widget Roles(组件角色)

```html
<!-- button: 按钮 -->
<div role="button" tabindex="0" onclick="handleClick()">
  点击我
</div>

<!-- checkbox: 复选框 -->
<div
  role="checkbox"
  aria-checked="false"
  tabindex="0"
  onclick="toggleCheck()"
>
  接受条款
</div>

<!-- radio: 单选按钮 -->
<div role="radiogroup" aria-label="选择尺寸">
  <div role="radio" aria-checked="true" tabindex="0">小</div>
  <div role="radio" aria-checked="false" tabindex="-1">中</div>
  <div role="radio" aria-checked="false" tabindex="-1">大</div>
</div>

<!-- slider: 滑块 -->
<div
  role="slider"
  aria-valuenow="50"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="音量"
  tabindex="0"
>
  <div class="slider-thumb" style="left: 50%"></div>
</div>

<!-- tab: 标签页 -->
<div role="tablist" aria-label="内容标签">
  <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1">
    标签1
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2">
    标签2
  </button>
</div>

<div role="tabpanel" id="panel1" aria-labelledby="tab1">
  标签1的内容
</div>
<div role="tabpanel" id="panel2" aria-labelledby="tab2" hidden>
  标签2的内容
</div>
```

### 2.3 Document Structure Roles

```html
<!-- article: 文章 -->
<article role="article">
  <h2>文章标题</h2>
  <p>文章内容...</p>
</article>

<!-- list & listitem: 列表 -->
<ul role="list">
  <li role="listitem">项目1</li>
  <li role="listitem">项目2</li>
</ul>

<!-- table, row, cell: 表格 -->
<div role="table" aria-label="用户数据">
  <div role="row">
    <div role="columnheader">姓名</div>
    <div role="columnheader">年龄</div>
  </div>
  <div role="row">
    <div role="cell">张三</div>
    <div role="cell">25</div>
  </div>
</div>

<!-- heading: 标题 -->
<div role="heading" aria-level="1">一级标题</div>
<div role="heading" aria-level="2">二级标题</div>
```

## 3. ARIA States & Properties

### 3.1 Widget States

```html
<!-- aria-expanded: 展开/折叠 -->
<button
  aria-expanded="false"
  aria-controls="dropdown-menu"
  onclick="toggleMenu()"
>
  菜单
</button>
<div id="dropdown-menu" hidden>菜单内容</div>

<!-- aria-selected: 选中状态 -->
<div role="listbox">
  <div role="option" aria-selected="true">选项1</div>
  <div role="option" aria-selected="false">选项2</div>
</div>

<!-- aria-checked: 勾选状态 -->
<div role="checkbox" aria-checked="true">已勾选</div>
<div role="checkbox" aria-checked="false">未勾选</div>
<div role="checkbox" aria-checked="mixed">部分勾选</div>

<!-- aria-pressed: 按下状态 -->
<button aria-pressed="false">切换</button>
<button aria-pressed="true">已激活</button>

<!-- aria-disabled: 禁用状态 -->
<button aria-disabled="true">禁用按钮</button>

<!-- aria-hidden: 隐藏 -->
<div aria-hidden="true">屏幕阅读器忽略此内容</div>

<!-- aria-invalid: 无效状态 -->
<input
  type="email"
  aria-invalid="true"
  aria-errormessage="email-error"
/>
<div id="email-error" role="alert">请输入有效的邮箱地址</div>

<!-- aria-busy: 忙碌状态 -->
<div aria-busy="true">加载中...</div>
```

### 3.2 Live Region States

```html
<!-- aria-live: 动态区域 -->
<div aria-live="polite">通知消息</div>
<div aria-live="assertive">紧急警告</div>

<!-- aria-atomic: 原子更新 -->
<div aria-live="polite" aria-atomic="true">
  <span>剩余时间:</span>
  <span id="timer">5:00</span>
</div>

<!-- aria-relevant: 相关更新 -->
<div
  aria-live="polite"
  aria-relevant="additions text"
>
  列表内容
</div>
```

### 3.3 Relationship Properties

```html
<!-- aria-labelledby: 标签引用 -->
<h2 id="dialog-title">确认删除</h2>
<div role="dialog" aria-labelledby="dialog-title">
  <p>确定要删除此项吗?</p>
</div>

<!-- aria-describedby: 描述引用 -->
<input
  type="password"
  aria-describedby="password-requirements"
/>
<div id="password-requirements">
  密码必须至少8个字符
</div>

<!-- aria-controls: 控制关系 -->
<button
  aria-controls="panel"
  aria-expanded="false"
>
  展开面板
</button>
<div id="panel" hidden>面板内容</div>

<!-- aria-owns: 所有权关系 -->
<div role="listbox" aria-owns="option1 option2">
  <div role="option" id="option1">选项1</div>
</div>
<div role="option" id="option2">选项2(在DOM其他位置)</div>

<!-- aria-activedescendant: 活动后代 -->
<div
  role="listbox"
  aria-activedescendant="option-1"
  tabindex="0"
>
  <div role="option" id="option-1">选项1</div>
  <div role="option" id="option-2">选项2</div>
</div>
```

### 3.4 Widget Properties

```html
<!-- aria-label: 标签 -->
<button aria-label="关闭对话框">
  <svg><!-- X图标 --></svg>
</button>

<!-- aria-placeholder: 占位符 -->
<div
  role="textbox"
  contenteditable="true"
  aria-placeholder="输入您的消息..."
></div>

<!-- aria-required: 必填 -->
<input type="text" aria-required="true" />

<!-- aria-readonly: 只读 -->
<input type="text" aria-readonly="true" />

<!-- aria-autocomplete: 自动完成 -->
<input
  type="text"
  role="combobox"
  aria-autocomplete="list"
  aria-controls="suggestions"
/>

<!-- aria-multiselectable: 多选 -->
<div role="listbox" aria-multiselectable="true">
  <div role="option">选项1</div>
  <div role="option">选项2</div>
</div>

<!-- aria-orientation: 方向 -->
<div role="slider" aria-orientation="vertical">垂直滑块</div>

<!-- aria-valuemin, aria-valuemax, aria-valuenow: 值范围 -->
<div
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow="45"
  aria-label="下载进度"
>
  45%
</div>
```

## 4. React中的ARIA实现

### 4.1 可访问的按钮

```tsx
// AccessibleButton.tsx
interface AccessibleButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  pressed?: boolean;
  disabled?: boolean;
}

export function AccessibleButton({
  onClick,
  label,
  icon,
  pressed,
  disabled = false
}: AccessibleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

// 使用
<AccessibleButton
  onClick={handleLike}
  label="点赞"
  icon={<HeartIcon />}
  pressed={isLiked}
/>
```

### 4.2 可访问的对话框

```tsx
// AccessibleDialog.tsx
import { useEffect, useRef } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  children
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  
  useEffect(() => {
    if (isOpen) {
      // 保存之前的焦点
      const previousFocus = document.activeElement as HTMLElement;
      
      // 聚焦到对话框
      dialogRef.current?.focus();
      
      // 关闭时恢复焦点
      return () => {
        previousFocus?.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={dialogRef}
      tabIndex={-1}
      className="dialog"
    >
      <div className="dialog-content">
        <h2 id={titleId}>{title}</h2>
        
        {children}
        
        <button onClick={onClose} aria-label="关闭对话框">
          ×
        </button>
      </div>
      
      <div
        className="dialog-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
}
```

### 4.3 可访问的标签页

```tsx
// AccessibleTabs.tsx
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function AccessibleTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    switch (e.key) {
      case 'ArrowLeft':
        newIndex = index === 0 ? tabs.length - 1 : index - 1;
        break;
      case 'ArrowRight':
        newIndex = index === tabs.length - 1 ? 0 : index + 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    setActiveTab(newIndex);
  };
  
  return (
    <div>
      <div role="tablist" aria-label="内容标签">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeTab}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === activeTab ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeTab}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### 4.4 可访问的下拉菜单

```tsx
// AccessibleDropdown.tsx
import { useState, useRef, useEffect } from 'react';

export function AccessibleDropdown({
  label,
  options
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
        
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
        
      case 'Enter':
      case ' ':
        if (activeIndex >= 0) {
          handleSelect(options[activeIndex].value);
        }
        break;
    }
  };
  
  const handleSelect = (value: string) => {
    console.log('Selected:', value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };
  
  return (
    <div className="dropdown">
      <button
        ref={buttonRef}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </button>
      
      {isOpen && (
        <ul
          role="listbox"
          aria-label={label}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(option.value)}
              className={index === activeIndex ? 'active' : ''}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 5. 实时区域(Live Regions)

### 5.1 通知消息

```tsx
// Notification.tsx
export function Notification({
  message,
  type = 'polite'
}: {
  message: string;
  type?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="notification"
    >
      {message}
    </div>
  );
}

// 使用
<Notification message="保存成功!" type="polite" />
<Notification message="错误:请立即处理!" type="assertive" />
```

### 5.2 加载状态

```tsx
// LoadingIndicator.tsx
export function LoadingIndicator({ message = '加载中...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
```

### 5.3 表单验证反馈

```tsx
// FormField.tsx
export function FormField({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
  [key: string]: any;
}) {
  const inputId = useId();
  const errorId = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="error-message"
        >
          {error}
        </div>
      )}
    </div>
  );
}
```

## 6. ARIA最佳实践

### 6.1 命名与描述

```tsx
// 优先级: aria-labelledby > aria-label > label元素 > title属性

// ✅ 使用aria-labelledby
<h2 id="section-title">用户设置</h2>
<div role="region" aria-labelledby="section-title">
  设置内容
</div>

// ✅ 使用aria-label
<button aria-label="关闭">
  <X />
</button>

// ✅ 使用label元素
<label htmlFor="email">邮箱</label>
<input id="email" type="email" />

// ❌ 不要重复
<button aria-label="提交">提交</button>  // 冗余

// ✅ 简洁明了
<button>提交</button>  // 已经有文本
```

### 6.2 键盘交互

```tsx
// 所有交互元素必须可键盘访问
export function KeyboardAccessibleWidget() {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleActivate();
        break;
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      点击或按Enter
    </div>
  );
}
```

### 6.3 焦点管理

```tsx
// 模态框焦点陷阱
export function FocusTrap({ children }: { children: React.ReactNode }) {
  const trapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const trap = trapRef.current;
    if (!trap) return;
    
    const focusableElements = trap.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    
    trap.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      trap.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return <div ref={trapRef}>{children}</div>;
}
```

## 7. 常见ARIA模式

### 7.1 手风琴(Accordion)

```tsx
// Accordion.tsx
export function Accordion({ items }: { items: Array<{ title: string; content: React.ReactNode }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  return (
    <div className="accordion">
      {items.map((item, index) => {
        const headingId = `accordion-heading-${index}`;
        const panelId = `accordion-panel-${index}`;
        const isOpen = openIndex === index;
        
        return (
          <div key={index} className="accordion-item">
            <h3>
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {item.title}
              </button>
            </h3>
            
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 7.2 工具提示(Tooltip)

```tsx
// Tooltip.tsx
export function Tooltip({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();
  
  return (
    <div className="tooltip-container">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
```

## 8. ARIA测试

### 8.1 自动化测试

```typescript
// aria.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('ARIA Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have correct ARIA attributes', () => {
    const { getByRole } = render(<AccessibleButton />);
    const button = getByRole('button');
    
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-pressed');
  });
});
```

## 9. 总结

ARIA无障碍规范的关键要点:

1. **优先使用原生HTML**: ARIA是补充而非替代
2. **三大要素**: 角色、状态、属性
3. **键盘可访问**: 所有交互必须支持键盘
4. **语义明确**: 提供清晰的标签和描述
5. **实时反馈**: 使用Live Regions通知用户
6. **焦点管理**: 正确处理焦点流转
7. **持续测试**: 使用工具验证可访问性

通过正确使用ARIA,可以让所有用户都能无障碍地使用Web应用。

