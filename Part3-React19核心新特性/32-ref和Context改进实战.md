# ref和Context改进实战

## 学习目标

通过本章学习，你将掌握：

- ref和Context改进的综合应用
- 实际项目案例
- 组合使用技巧
- 性能优化策略
- 代码重构实践
- 迁移最佳实践
- 常见问题解决
- 企业级应用场景

## 第一部分：表单组件库

### 1.1 简化的Input组件

```jsx
// ✅ 使用ref作为prop的Input组件
function Input({ ref, label, error, helperText, ...props }) {
  return (
    <div className="input-field">
      {label && <label>{label}</label>}
      
      <input
        ref={ref}
        className={error ? 'input-error' : 'input-normal'}
        {...props}
      />
      
      {error && <span className="error-text">{error}</span>}
      {helperText && <span className="helper-text">{helperText}</span>}
    </div>
  );
}

// 使用
function LoginForm() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    
    // 验证
    if (!email) {
      emailRef.current.focus();
      return;
    }
    
    if (!password) {
      passwordRef.current.focus();
      return;
    }
    
    // 提交
    login({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        ref={emailRef}
        label="邮箱"
        type="email"
        placeholder="输入邮箱"
        helperText="我们不会分享您的邮箱"
      />
      
      <Input
        ref={passwordRef}
        label="密码"
        type="password"
        placeholder="输入密码"
      />
      
      <button type="submit">登录</button>
    </form>
  );
}
```

### 1.2 表单Context管理

```jsx
// ✅ 简化的表单Context
import { createContext, useContext, useState } from 'react';

const FormContext = createContext(null);

export function Form({ onSubmit, children, initialValues = {} }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };
  
  const setError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const setFieldTouched = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸
    const allFields = Object.keys(values);
    setTouched(
      allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );
    
    // 验证
    const hasErrors = Object.keys(errors).length > 0;
    if (!hasErrors) {
      onSubmit(values);
    }
  };
  
  const contextValue = {
    values,
    errors,
    touched,
    setValue,
    setError,
    setFieldTouched
  };
  
  return (
    <FormContext value={contextValue}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext>
  );
}

export function useFormField(name, validation) {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('useFormField must be used within Form');
  }
  
  const { values, errors, touched, setValue, setError, setFieldTouched } = context;
  
  const value = values[name] || '';
  const error = errors[name];
  const isTouched = touched[name];
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(name, newValue);
    
    // 验证
    if (validation) {
      const validationError = validation(newValue);
      if (validationError) {
        setError(name, validationError);
      }
    }
  };
  
  const handleBlur = () => {
    setFieldTouched(name);
  };
  
  return {
    value,
    error: isTouched ? error : undefined,
    onChange: handleChange,
    onBlur: handleBlur
  };
}

// 使用
function RegistrationForm() {
  const handleSubmit = (values) => {
    console.log('Form submitted:', values);
    api.register(values);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <EmailField />
      <PasswordField />
      <ConfirmPasswordField />
      <button type="submit">注册</button>
    </Form>
  );
}

function EmailField() {
  const field = useFormField('email', (value) => {
    if (!value) return '邮箱不能为空';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '请输入有效的邮箱地址';
    }
  });
  
  return (
    <Input
      label="邮箱"
      type="email"
      error={field.error}
      {...field}
    />
  );
}

function PasswordField() {
  const field = useFormField('password', (value) => {
    if (!value) return '密码不能为空';
    if (value.length < 8) return '密码至少8个字符';
  });
  
  return (
    <Input
      label="密码"
      type="password"
      error={field.error}
      {...field}
    />
  );
}
```

## 第二部分：主题系统

### 2.1 完整的主题管理

```jsx
// ✅ 使用简化Context的主题系统
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    error: '#ef4444'
  });
  
  useEffect(() => {
    // 保存到localStorage
    localStorage.setItem('theme', theme);
    
    // 更新CSS变量
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    // 更新自定义颜色
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [customColors]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const updateColor = (key, value) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
  };
  
  const value = {
    theme,
    customColors,
    toggleTheme,
    updateColor,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 使用
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function ColorPicker() {
  const { customColors, updateColor } = useTheme();
  
  return (
    <div className="color-picker">
      <h3>自定义颜色</h3>
      
      {Object.entries(customColors).map(([key, value]) => (
        <div key={key} className="color-input">
          <label>{key}</label>
          <input
            type="color"
            value={value}
            onChange={(e) => updateColor(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
```

## 第三部分：Modal系统

### 3.2 Modal管理器

```jsx
// ✅ 使用ref callback清理的Modal
function Modal({ ref, isOpen, onClose, children }) {
  const modalRef = (element) => {
    if (!element || !isOpen) return;
    
    // 聚焦Modal
    element.focus();
    
    // Esc键关闭
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // 点击外部关闭
    const handleClickOutside = (e) => {
      if (e.target === element) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    element.addEventListener('click', handleClickOutside);
    
    // 锁定滚动
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  };
  
  if (!isOpen) return null;
  
  return (
    <div ref={modalRef} className="modal-overlay" tabIndex={-1}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}

// Modal Context
const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);
  
  const openModal = (id, content, options = {}) => {
    setModals(prev => [...prev, { id, content, options }]);
  };
  
  const closeModal = (id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };
  
  const closeAll = () => {
    setModals([]);
  };
  
  const value = {
    openModal,
    closeModal,
    closeAll
  };
  
  return (
    <ModalContext value={value}>
      {children}
      
      {modals.map(modal => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
        >
          {modal.content}
        </Modal>
      ))}
    </ModalContext>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

// 使用
function App() {
  return (
    <ModalProvider>
      <MainApp />
    </ModalProvider>
  );
}

function MainApp() {
  const { openModal, closeModal } = useModal();
  
  const handleOpenConfirm = () => {
    const modalId = 'confirm-delete';
    
    openModal(
      modalId,
      <div>
        <h2>确认删除</h2>
        <p>确定要删除这个项目吗？</p>
        <button onClick={() => {
          // 执行删除
          deleteItem();
          closeModal(modalId);
        }}>
          确认
        </button>
        <button onClick={() => closeModal(modalId)}>
          取消
        </button>
      </div>
    );
  };
  
  return (
    <div>
      <button onClick={handleOpenConfirm}>删除项目</button>
    </div>
  );
}
```

## 第四部分：可访问性增强

### 4.1 焦点管理

```jsx
// ✅ 使用ref管理焦点
function FocusTrap({ children }) {
  const containerRef = (element) => {
    if (!element) return;
    
    // 查找所有可聚焦元素
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // 聚焦第一个元素
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

// 使用在Dialog中
function Dialog({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="dialog-overlay">
      <FocusTrap>
        <div className="dialog" role="dialog" aria-modal="true">
          {children}
          <button onClick={onClose}>关闭</button>
        </div>
      </FocusTrap>
    </div>
  );
}
```

### 4.2 键盘导航

```jsx
// ✅ 可键盘导航的列表
function NavigableList({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  
  const listRef = (element) => {
    if (!element) return;
    
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => 
            Math.min(prev + 1, items.length - 1)
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => Math.max(prev - 1, 0));
          break;
          
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          break;
          
        case 'End':
          e.preventDefault();
          setActiveIndex(items.length - 1);
          break;
          
        case 'Enter':
          if (itemRefs.current[activeIndex]) {
            itemRefs.current[activeIndex].click();
          }
          break;
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  };
  
  useEffect(() => {
    // 滚动到激活项
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest'
    });
  }, [activeIndex]);
  
  return (
    <ul ref={listRef} role="listbox" tabIndex={0}>
      {items.map((item, index) => (
        <li
          key={item.id}
          ref={el => itemRefs.current[index] = el}
          role="option"
          aria-selected={index === activeIndex}
          className={index === activeIndex ? 'active' : ''}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

## 第五部分：性能监控

### 5.1 渲染性能追踪

```jsx
// ✅ 使用ref callback追踪渲染
function PerformanceMonitor({ children, componentName }) {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  const ref = (element) => {
    if (!element) return;
    
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;
    
    console.log(`[${componentName}] 渲染 #${renderCountRef.current}`, {
      timeSinceLastRender: `${timeSinceLastRender}ms`
    });
  };
  
  return <div ref={ref}>{children}</div>;
}

// 使用
function App() {
  return (
    <PerformanceMonitor componentName="App">
      <MainContent />
    </PerformanceMonitor>
  );
}
```

## 注意事项

### 1. 正确处理清理

```jsx
// ✅ 确保所有资源都被清理
const ref = (element) => {
  if (!element) return;
  
  const subscription = subscribe();
  const timer = setInterval(() => {}, 1000);
  
  element.addEventListener('click', handler);
  
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
    element.removeEventListener('click', handler);
  };
};
```

### 2. Context默认值

```jsx
// ✅ 提供有意义的默认值
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {
    console.warn('toggleTheme called outside ThemeProvider');
  }
});
```

### 3. 类型安全

```tsx
// ✅ TypeScript类型
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {}
});
```

## 第六部分：企业级应用案例

### 6.1 数据表格系统

```jsx
// ✅ 带排序、过滤、分页的数据表格
const TableContext = createContext(null);

export function DataTable({ data, columns, children }) {
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // 处理数据
  const processedData = useMemo(() => {
    let result = [...data];
    
    // 过滤
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    // 排序
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const order = sortOrder === 'asc' ? 1 : -1;
        return aVal > bVal ? order : -order;
      });
    }
    
    return result;
  }, [data, filters, sortBy, sortOrder]);
  
  // 分页数据
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize]);
  
  const value = {
    data: paginatedData,
    allData: processedData,
    columns,
    sortBy,
    sortOrder,
    filters,
    page,
    pageSize,
    totalPages: Math.ceil(processedData.length / pageSize),
    setSortBy,
    setSortOrder,
    setFilters,
    setPage,
    setPageSize,
    handleSort: (columnKey) => {
      if (sortBy === columnKey) {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
    }
  };
  
  return (
    <TableContext value={value}>
      {children}
    </TableContext>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within DataTable');
  }
  return context;
}

// 表格组件
function TableHeader() {
  const { columns, sortBy, sortOrder, handleSort } = useTable();
  
  return (
    <thead>
      <tr>
        {columns.map(column => (
          <th key={column.key} onClick={() => handleSort(column.key)}>
            {column.label}
            {sortBy === column.key && (
              <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableBody() {
  const { data, columns } = useTable();
  
  return (
    <tbody>
      {data.map((row, index) => (
        <tr key={index}>
          {columns.map(column => (
            <td key={column.key}>
              {column.render ? column.render(row[column.key], row) : row[column.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function TablePagination() {
  const { page, totalPages, setPage, pageSize, setPageSize } = useTable();
  
  return (
    <div className="pagination">
      <button 
        onClick={() => setPage(1)} 
        disabled={page === 1}
      >
        首页
      </button>
      <button 
        onClick={() => setPage(prev => Math.max(1, prev - 1))} 
        disabled={page === 1}
      >
        上一页
      </button>
      
      <span>第 {page} / {totalPages} 页</span>
      
      <button 
        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} 
        disabled={page === totalPages}
      >
        下一页
      </button>
      <button 
        onClick={() => setPage(totalPages)} 
        disabled={page === totalPages}
      >
        末页
      </button>
      
      <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
        <option value={10}>10 条/页</option>
        <option value={25}>25 条/页</option>
        <option value={50}>50 条/页</option>
      </select>
    </div>
  );
}

// 使用示例
function UserManagement() {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
    // ... more users
  ];
  
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '姓名' },
    { key: 'email', label: '邮箱' },
    { 
      key: 'role', 
      label: '角色',
      render: (value) => (
        <span className={`role-badge ${value.toLowerCase()}`}>{value}</span>
      )
    }
  ];
  
  return (
    <DataTable data={users} columns={columns}>
      <div className="table-container">
        <table>
          <TableHeader />
          <TableBody />
        </table>
        <TablePagination />
      </div>
    </DataTable>
  );
}
```

### 6.2 通知系统

```jsx
// ✅ 全局通知管理
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      type: 'info',
      duration: 3000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 自动移除
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const success = useCallback((message, options) => {
    return addNotification({ type: 'success', message, ...options });
  }, [addNotification]);
  
  const error = useCallback((message, options) => {
    return addNotification({ type: 'error', message, ...options });
  }, [addNotification]);
  
  const warning = useCallback((message, options) => {
    return addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);
  
  const info = useCallback((message, options) => {
    return addNotification({ type: 'info', message, ...options });
  }, [addNotification]);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
  
  return (
    <NotificationContext value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// 通知容器
function NotificationContainer() {
  const { notifications } = useNotification();
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  );
}

// 单个通知
function Notification({ id, type, message, title }) {
  const { removeNotification } = useNotification();
  const [isExiting, setIsExiting] = useState(false);
  
  const notificationRef = (element) => {
    if (!element) return;
    
    // 入场动画
    element.classList.add('notification-enter');
    setTimeout(() => {
      element.classList.remove('notification-enter');
      element.classList.add('notification-enter-active');
    }, 10);
    
    return () => {
      // 退场清理
      element.classList.remove('notification-enter-active');
    };
  };
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(id);
    }, 300);
  };
  
  return (
    <div 
      ref={notificationRef}
      className={`notification notification-${type} ${isExiting ? 'notification-exit' : ''}`}
    >
      {title && <div className="notification-title">{title}</div>}
      <div className="notification-message">{message}</div>
      <button onClick={handleClose} className="notification-close">×</button>
    </div>
  );
}

// 使用示例
function UserActions() {
  const { success, error } = useNotification();
  
  const handleSave = async () => {
    try {
      await api.saveUser(userData);
      success('用户保存成功！');
    } catch (err) {
      error('保存失败：' + err.message);
    }
  };
  
  return <button onClick={handleSave}>保存用户</button>;
}
```

### 6.3 多步骤向导

```jsx
// ✅ 向导流程管理
const WizardContext = createContext(null);

export function Wizard({ children, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  const steps = React.Children.toArray(children).filter(
    child => child.type === WizardStep
  );
  
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  const goToStep = useCallback((step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);
  
  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep, currentStep]);
  
  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);
  
  const updateStepData = useCallback((data) => {
    setStepData(prev => ({ ...prev, ...data }));
  }, []);
  
  const handleComplete = useCallback(() => {
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    onComplete?.(stepData);
  }, [currentStep, stepData, onComplete]);
  
  const value = {
    currentStep,
    totalSteps,
    stepData,
    completedSteps,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    updateStepData,
    handleComplete
  };
  
  return (
    <WizardContext value={value}>
      <div className="wizard">
        <WizardProgress />
        <div className="wizard-content">
          {steps[currentStep]}
        </div>
        <WizardControls />
      </div>
    </WizardContext>
  );
}

export function WizardStep({ title, children }) {
  return <div className="wizard-step">{children}</div>;
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within Wizard');
  }
  return context;
}

// 进度指示器
function WizardProgress() {
  const { currentStep, totalSteps, completedSteps, goToStep } = useWizard();
  
  return (
    <div className="wizard-progress">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`progress-step ${
            index === currentStep ? 'active' : ''
          } ${
            completedSteps.has(index) ? 'completed' : ''
          }`}
          onClick={() => completedSteps.has(index) && goToStep(index)}
        >
          <div className="step-number">{index + 1}</div>
        </div>
      ))}
    </div>
  );
}

// 控制按钮
function WizardControls() {
  const { isFirstStep, isLastStep, prevStep, nextStep, handleComplete } = useWizard();
  
  return (
    <div className="wizard-controls">
      <button onClick={prevStep} disabled={isFirstStep}>
        上一步
      </button>
      
      {!isLastStep ? (
        <button onClick={nextStep}>下一步</button>
      ) : (
        <button onClick={handleComplete} className="primary">完成</button>
      )}
    </div>
  );
}

// 使用示例
function RegistrationWizard() {
  const handleComplete = (data) => {
    console.log('注册完成：', data);
    api.register(data);
  };
  
  return (
    <Wizard onComplete={handleComplete}>
      <WizardStep title="个人信息">
        <PersonalInfoForm />
      </WizardStep>
      
      <WizardStep title="账户设置">
        <AccountSettingsForm />
      </WizardStep>
      
      <WizardStep title="确认">
        <ConfirmationStep />
      </WizardStep>
    </Wizard>
  );
}

function PersonalInfoForm() {
  const { updateStepData, stepData } = useWizard();
  
  return (
    <div>
      <h2>个人信息</h2>
      <Input
        label="姓名"
        value={stepData.name || ''}
        onChange={(e) => updateStepData({ name: e.target.value })}
      />
      <Input
        label="邮箱"
        type="email"
        value={stepData.email || ''}
        onChange={(e) => updateStepData({ email: e.target.value })}
      />
    </div>
  );
}
```

### 6.4 拖拽排序系统

```jsx
// ✅ 拖拽Context管理
const DragDropContext = createContext(null);

export function DragDropProvider({ children }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  
  const value = {
    draggedItem,
    dragOverItem,
    setDraggedItem,
    setDragOverItem
  };
  
  return (
    <DragDropContext value={value}>
      {children}
    </DragDropContext>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}

// 可拖拽项
function DraggableItem({ id, index, children, onReorder }) {
  const { draggedItem, dragOverItem, setDraggedItem, setDragOverItem } = useDragDrop();
  
  const itemRef = (element) => {
    if (!element) return;
    
    const handleDragStart = (e) => {
      setDraggedItem({ id, index });
      e.dataTransfer.effectAllowed = 'move';
      element.classList.add('dragging');
    };
    
    const handleDragEnd = () => {
      setDraggedItem(null);
      setDragOverItem(null);
      element.classList.remove('dragging');
    };
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      if (draggedItem && draggedItem.index !== index) {
        setDragOverItem({ id, index });
      }
    };
    
    const handleDragLeave = () => {
      element.classList.remove('drag-over');
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      
      if (draggedItem && draggedItem.index !== index) {
        onReorder(draggedItem.index, index);
      }
    };
    
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
    
    return () => {
      element.removeEventListener('dragstart', handleDragStart);
      element.removeEventListener('dragend', handleDragEnd);
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
    };
  };
  
  return (
    <div
      ref={itemRef}
      draggable
      className={`draggable-item ${
        dragOverItem?.index === index ? 'drag-over' : ''
      }`}
    >
      {children}
    </div>
  );
}

// 使用示例
function SortableList() {
  const [items, setItems] = useState([
    { id: 1, text: '项目 1' },
    { id: 2, text: '项目 2' },
    { id: 3, text: '项目 3' },
    { id: 4, text: '项目 4' }
  ]);
  
  const handleReorder = (fromIndex, toIndex) => {
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setItems(newItems);
  };
  
  return (
    <DragDropProvider>
      <div className="sortable-list">
        {items.map((item, index) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            index={index}
            onReorder={handleReorder}
          >
            <span className="drag-handle">⋮⋮</span>
            {item.text}
          </DraggableItem>
        ))}
      </div>
    </DragDropProvider>
  );
}
```

## 常见问题

### Q1: 如何在现有项目中逐步采用这些改进？

**A:** 采用渐进式迁移策略，从新功能开始：

**步骤1：评估现状**
```jsx
// 识别需要改进的组件
// 1. 使用forwardRef的组件 -> 迁移到ref as prop
// 2. 使用Context.Provider的组件 -> 迁移到简化语法
// 3. 有复杂清理逻辑的组件 -> 使用ref callback
```

**步骤2：制定计划**
```
1. 新功能：直接使用新特性
2. 活跃维护的模块：逐步重构
3. 稳定模块：保持现状，等待重大重构时再迁移
4. 核心库组件：优先迁移，影响面大
```

**步骤3：实施迁移**
```jsx
// 示例：迁移forwardRef组件
// 旧代码
const OldInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 新代码（React 19）
function NewInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 两种方式可以并存，逐步替换
```

**步骤4：测试验证**
```jsx
// 确保迁移后功能正常
test('Input component works after migration', () => {
  const ref = React.createRef();
  render(<NewInput ref={ref} />);
  
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  ref.current.focus();
  expect(document.activeElement).toBe(ref.current);
});
```

**步骤5：文档更新**
- 更新组件文档
- 更新使用示例
- 添加迁移指南
- 培训团队成员

### Q2: 这些改进对性能有影响吗？

**A:** 没有负面影响，某些情况下还能提升性能：

**性能对比：**

```jsx
// ref callback清理 vs useEffect清理
// 旧方式：useEffect
function OldComponent() {
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, []);  // 需要依赖数组管理
  
  return <div ref={ref}>Content</div>;
}

// 新方式：ref callback
function NewComponent() {
  const ref = (element) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => observer.disconnect();
  };
  
  return <div ref={ref}>Content</div>;
  // 更少的代码，更早的清理时机
}
```

**性能优势：**
1. **ref callback清理**：清理时机更精确，避免不必要的延迟
2. **Context简化语法**：只是语法糖，运行时性能完全相同
3. **ref as prop**：减少了forwardRef的间接层，理论上略快

### Q3: 如何测试使用了这些特性的组件？

**A:** 使用React Testing Library，与普通组件测试相同：

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 测试ref as prop
test('Input ref works correctly', () => {
  const ref = React.createRef();
  
  render(<Input ref={ref} placeholder="Test" />);
  
  expect(ref.current).toBeInstanceOf(HTMLInputElement);
  expect(ref.current.placeholder).toBe('Test');
  
  // 测试ref方法
  ref.current.focus();
  expect(document.activeElement).toBe(ref.current);
});

// 测试Context简化语法
test('Theme context works', () => {
  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
  
  const button = screen.getByText(/切换主题/i);
  fireEvent.click(button);
  
  // 验证主题切换
  expect(screen.getByTestId('theme-indicator')).toHaveTextContent('dark');
});

// 测试ref callback清理
test('Cleanup is called on unmount', () => {
  const cleanup = jest.fn();
  
  function TestComponent() {
    const ref = (element) => {
      if (!element) return;
      return cleanup;
    };
    
    return <div ref={ref}>Test</div>;
  }
  
  const { unmount } = render(<TestComponent />);
  expect(cleanup).not.toHaveBeenCalled();
  
  unmount();
  expect(cleanup).toHaveBeenCalledTimes(1);
});

// 测试复杂交互
test('Modal opens and closes correctly', async () => {
  const user = userEvent.setup();
  
  render(
    <ModalProvider>
      <ModalTrigger />
    </ModalProvider>
  );
  
  // 打开Modal
  await user.click(screen.getByText('打开Modal'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // 按Esc关闭
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Q4: 如何处理TypeScript类型？

**A:** React 19的类型定义已经包含这些改进：

```tsx
// ref as prop的类型
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;  // ref自动包含在props中
  label?: string;
  error?: string;
}

function Input({ ref, label, error, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  );
}

// Context的类型
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {}
});

// 使用时自动推断类型
function Component() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  // theme的类型是 'light' | 'dark'
  // toggleTheme的类型是 () => void
}

// ref callback的类型
type RefCallback<T> = (element: T | null) => (() => void) | void;

const ref: RefCallback<HTMLDivElement> = (element) => {
  if (!element) return;
  
  const observer = new ResizeObserver(() => {});
  observer.observe(element);
  
  return () => {
    observer.disconnect();
  };
};
```

### Q5: 这些特性与React 18兼容吗？

**A:** 部分兼容：

| 特性 | React 18 | React 19 |
|------|----------|----------|
| ref as prop | ❌ 需要forwardRef | ✅ 直接支持 |
| Context简化 | ❌ 必须用.Provider | ✅ 可省略.Provider |
| ref callback清理 | ❌ 不支持返回清理函数 | ✅ 支持 |

**兼容性处理：**
```jsx
// 方法1：条件编译
import { version } from 'react';

const isReact19 = parseInt(version) >= 19;

function Input({ ref, ...props }) {
  if (isReact19) {
    return <input ref={ref} {...props} />;
  } else {
    // React 18降级方案
    return <InputWithForwardRef ref={ref} {...props} />;
  }
}

// 方法2：统一使用React 19语法，通过polyfill支持React 18
// （需要额外的构建配置）

// 方法3：保持双版本支持
export const InputV18 = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

export const InputV19 = ({ ref, ...props }) => {
  return <input ref={ref} {...props} />;
};

export const Input = isReact19 ? InputV19 : InputV18;
```

### Q6: 如何调试使用这些特性的组件？

**A:** 使用React DevTools和标准调试技巧：

```jsx
// 1. 添加displayName
ThemeContext.displayName = 'ThemeContext';
Input.displayName = 'Input';

// 2. 使用React DevTools
// - 查看Context当前值
// - 检查组件树结构
// - 追踪props和state变化

// 3. 添加调试日志
const ref = (element) => {
  if (!element) {
    console.log('Element unmounted');
    return;
  }
  
  console.log('Element mounted:', element);
  
  return () => {
    console.log('Cleanup called for:', element);
  };
};

// 4. 使用性能分析
import { Profiler } from 'react';

function App() {
  return (
    <Profiler 
      id="app"
      onRender={(id, phase, actualDuration) => {
        console.log(`${id} ${phase}: ${actualDuration}ms`);
      }}
    >
      <YourComponent />
    </Profiler>
  );
}

// 5. 错误边界
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error('Error in ref/context:', error, info);
  }
  
  render() {
    return this.props.children;
  }
}
```

### Q7: 如何优化包含这些特性的大型应用？

**A:** 采用多种优化策略：

```jsx
// 1. Context分离 - 避免不必要的重渲染
// ❌ 不好：所有值在一个Context
const AppContext = createContext({ theme, user, settings, cart });

// ✅ 好：按变化频率分离
const ThemeContext = createContext(theme);    // 很少变化
const UserContext = createContext(user);      // 偶尔变化
const CartContext = createContext(cart);      // 频繁变化

// 2. 使用React.memo
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* 复杂渲染 */}</div>;
});

// 3. 懒加载Context Provider
const ThemeProvider = lazy(() => import('./ThemeProvider'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ThemeProvider>
        <Content />
      </ThemeProvider>
    </Suspense>
  );
}

// 4. ref callback优化 - 使用useCallback
function Component() {
  const ref = useCallback((element) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {});
    observer.observe(element);
    
    return () => observer.disconnect();
  }, []); // 空依赖确保ref callback稳定
  
  return <div ref={ref}>Content</div>;
}

// 5. Context选择器模式
function useThemeColor() {
  const theme = useContext(ThemeContext);
  return theme.colors.primary; // 只返回需要的部分
}
```

## 总结

### 综合使用要点

React 19的ref和Context改进大大提升了代码的可读性、可维护性和开发效率：

#### 1. ref作为prop的优势
- **更简洁的API**：不再需要`forwardRef`包装
- **更直观的代码**：ref就像普通prop一样使用
- **更好的类型支持**：TypeScript类型更自然
- **更少的样板代码**：减少间接层和嵌套

#### 2. ref callback清理的优势
- **更精确的清理时机**：比useEffect更早触发
- **更简洁的代码**：不需要useEffect包装
- **自动清理管理**：返回函数即可
- **更少的bug**：避免依赖数组问题

#### 3. Context简化语法的优势
- **减少嵌套层级**：直接使用Context作为Provider
- **更清晰的代码**：少了`.Provider`后缀
- **完全向后兼容**：与旧语法可以共存
- **零性能开销**：只是语法糖，运行时相同

### 最佳实践总结

#### 什么时候使用ref as prop
```jsx
// ✅ 需要从父组件访问DOM元素
function ParentComponent() {
  const inputRef = useRef(null);
  return <CustomInput ref={inputRef} />;
}

// ✅ 构建可复用的表单组件库
function Input({ ref, label, ...props }) {
  return (
    <div>
      <label>{label}</label>
      <input ref={ref} {...props} />
    </div>
  );
}

// ✅ 实现复杂的用户交互（焦点管理、滚动控制等）
function SearchComponent({ ref }) {
  return <input ref={ref} placeholder="搜索..." />;
}
```

#### 什么时候使用ref callback清理
```jsx
// ✅ 需要清理DOM事件监听器
const ref = (element) => {
  if (!element) return;
  
  const handler = () => console.log('click');
  element.addEventListener('click', handler);
  
  return () => element.removeEventListener('click', handler);
};

// ✅ 需要清理浏览器API（Observer、定时器等）
const ref = (element) => {
  if (!element) return;
  
  const observer = new IntersectionObserver(() => {});
  observer.observe(element);
  
  return () => observer.disconnect();
};

// ✅ 需要清理第三方库实例
const ref = (element) => {
  if (!element) return;
  
  const chart = new Chart(element, config);
  
  return () => chart.destroy();
};
```

#### 什么时候使用Context简化语法
```jsx
// ✅ 新项目，React 19环境
function App() {
  return (
    <ThemeContext value={theme}>
      <UserContext value={user}>
        <Content />
      </UserContext>
    </ThemeContext>
  );
}

// ✅ 重构现有代码，逐步迁移
// 逐步将 <Context.Provider> 改为 <Context>
function NewFeature() {
  return (
    <NewContext value={value}>
      <Content />
    </NewContext>
  );
}

// ⚠️ 需要兼容React 18
// 继续使用 <Context.Provider> 或提供兼容层
```

### 架构设计建议

#### 1. 组件库设计
```jsx
// 所有可交互组件都支持ref
export function Button({ ref, children, ...props }) {
  return <button ref={ref} {...props}>{children}</button>;
}

export function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

export function TextArea({ ref, ...props }) {
  return <textarea ref={ref} {...props} />;
}

// 组合组件提供统一的ref接口
export function FormField({ ref, label, error, ...props }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input ref={ref} {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}
```

#### 2. Context架构
```jsx
// 按功能域分离Context
// ✅ 好的架构
const UIContext = createContext(uiState);          // UI状态
const DataContext = createContext(data);          // 数据
const AuthContext = createContext(auth);          // 认证
const I18nContext = createContext(i18n);          // 国际化

// ❌ 避免单一大Context
const AppContext = createContext({
  ui, data, auth, i18n, settings, theme, ...
});

// 提供便捷的hooks
export function useUI() {
  return useContext(UIContext);
}

export function useData() {
  return useContext(DataContext);
}
```

#### 3. 清理逻辑模式
```jsx
// 创建可复用的ref callback工厂函数
function useEventListener(eventName, handler) {
  return useCallback((element) => {
    if (!element) return;
    
    element.addEventListener(eventName, handler);
    return () => element.removeEventListener(eventName, handler);
  }, [eventName, handler]);
}

// 使用
function Component() {
  const handleClick = () => console.log('clicked');
  const ref = useEventListener('click', handleClick);
  
  return <div ref={ref}>Click me</div>;
}

// 组合多个清理逻辑
function useComposedRef(...refs) {
  return useCallback((element) => {
    if (!element) return;
    
    const cleanups = refs.map(ref => {
      if (typeof ref === 'function') {
        return ref(element);
      } else if (ref) {
        ref.current = element;
      }
    }).filter(Boolean);
    
    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, refs);
}
```

### 性能优化指南

#### 1. 避免不必要的Context更新
```jsx
// ❌ 每次渲染都创建新对象
function Provider({ children }) {
  const [state, setState] = useState(initial);
  
  return (
    <Context value={{ state, setState }}>
      {children}
    </Context>
  );
}

// ✅ 使用useMemo缓存value
function Provider({ children }) {
  const [state, setState] = useState(initial);
  
  const value = useMemo(
    () => ({ state, setState }),
    [state]
  );
  
  return (
    <Context value={value}>
      {children}
    </Context>
  );
}
```

#### 2. 稳定ref callback
```jsx
// ❌ 每次渲染创建新函数
function Component({ data }) {
  const ref = (element) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {
      console.log(data); // 依赖外部变量
    });
    observer.observe(element);
    
    return () => observer.disconnect();
  };
  
  return <div ref={ref}>Content</div>;
}

// ✅ 使用useCallback稳定函数
function Component({ data }) {
  const ref = useCallback((element) => {
    if (!element) return;
    
    const observer = new ResizeObserver(() => {
      console.log(data);
    });
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [data]); // 明确依赖
  
  return <div ref={ref}>Content</div>;
}
```

#### 3. Context分离与懒加载
```jsx
// 按更新频率分离
const StaticContext = createContext(staticData);    // 不变
const SlowContext = createContext(slowData);       // 很少变
const FastContext = createContext(fastData);       // 频繁变

// 懒加载不常用的Provider
const AdminContext = lazy(() => import('./AdminContext'));

function App() {
  return (
    <StaticContext value={staticData}>
      <SlowContext value={slowData}>
        <FastContext value={fastData}>
          <Suspense fallback={<Loading />}>
            {isAdmin && (
              <AdminContext value={adminData}>
                <AdminPanel />
              </AdminContext>
            )}
          </Suspense>
          <RegularContent />
        </FastContext>
      </SlowContext>
    </StaticContext>
  );
}
```

### 迁移路线图

#### 阶段1：准备期（1-2周）
1. **环境准备**
   - 升级React到19+
   - 更新TypeScript类型
   - 更新构建工具配置

2. **团队培训**
   - 学习新特性
   - 理解迁移策略
   - 建立代码规范

3. **评估现有代码**
   - 识别使用forwardRef的组件
   - 识别使用useEffect做清理的地方
   - 识别Context使用情况

#### 阶段2：试点期（2-4周）
1. **选择试点模块**
   - 新功能模块优先
   - 影响面小的模块
   - 非核心业务模块

2. **迁移试点**
   - 应用新特性
   - 编写测试
   - 收集反馈

3. **建立最佳实践**
   - 记录成功案例
   - 识别常见问题
   - 更新代码规范

#### 阶段3：推广期（1-3个月）
1. **核心组件库迁移**
   - 迁移所有基础组件
   - 更新文档和示例
   - 发布新版本

2. **业务代码迁移**
   - 按模块逐步迁移
   - 保持旧代码兼容
   - 持续测试验证

3. **优化与完善**
   - 性能优化
   - 代码清理
   - 文档完善

#### 阶段4：完成期（持续）
1. **完全迁移**
   - 移除所有旧代码
   - 统一使用新特性
   - 清理兼容层

2. **持续改进**
   - 优化性能
   - 改进开发体验
   - 跟进React新版本

### 工具与资源

#### 1. 开发工具
- **React DevTools**：查看Context值和组件树
- **TypeScript**：提供类型安全
- **ESLint插件**：强制最佳实践
- **Prettier**：统一代码风格

#### 2. 测试工具
- **React Testing Library**：组件测试
- **Jest**：单元测试
- **Playwright/Cypress**：E2E测试
- **React Profiler**：性能分析

#### 3. 学习资源
- **React官方文档**：最权威的学习资料
- **React 19发布说明**：了解新特性和Breaking Changes
- **社区博客**：学习实践经验
- **开源项目**：参考优秀实现

### 常见反模式

#### 反模式1：过度使用ref
```jsx
// ❌ 不应该用ref来做这些
function BadComponent() {
  const countRef = useRef(0);
  const dataRef = useRef([]);
  
  // 应该用state
  countRef.current++;
  
  // 应该用state
  dataRef.current.push(newItem);
  
  return <div>Count: {countRef.current}</div>; // 不会重新渲染
}

// ✅ 正确使用ref
function GoodComponent() {
  const [count, setCount] = useState(0);  // 用state
  const [data, setData] = useState([]);   // 用state
  const domRef = useRef(null);            // ref用于DOM
  
  useEffect(() => {
    // 使用DOM ref
    domRef.current.focus();
  }, []);
  
  return <input ref={domRef} />;
}
```

#### 反模式2：Context地狱
```jsx
// ❌ 过度嵌套
function App() {
  return (
    <ThemeContext value={theme}>
      <UserContext value={user}>
        <SettingsContext value={settings}>
          <I18nContext value={i18n}>
            <RouterContext value={router}>
              <DataContext value={data}>
                <UIContext value={ui}>
                  <Content />
                </UIContext>
              </DataContext>
            </RouterContext>
          </I18nContext>
        </SettingsContext>
      </UserContext>
    </ThemeContext>
  );
}

// ✅ 提取Provider组合
function AppProviders({ children }) {
  return (
    <ThemeContext value={theme}>
      <UserContext value={user}>
        <SettingsContext value={settings}>
          <I18nContext value={i18n}>
            {children}
          </I18nContext>
        </SettingsContext>
      </UserContext>
    </ThemeContext>
  );
}

function App() {
  return (
    <AppProviders>
      <Content />
    </AppProviders>
  );
}
```

#### 反模式3：忘记清理
```jsx
// ❌ 没有清理
function BadComponent() {
  const ref = (element) => {
    if (!element) return;
    
    const observer = new MutationObserver(() => {});
    observer.observe(element, { childList: true });
    
    // 忘记返回清理函数！
  };
  
  return <div ref={ref}>Content</div>;
}

// ✅ 正确清理
function GoodComponent() {
  const ref = (element) => {
    if (!element) return;
    
    const observer = new MutationObserver(() => {});
    observer.observe(element, { childList: true });
    
    return () => observer.disconnect();
  };
  
  return <div ref={ref}>Content</div>;
}
```

### 结语

React 19的ref和Context改进标志着React框架的持续进化，这些改进不仅让代码更简洁，也让开发者的体验更好。通过本文的深入学习和实战案例，我们可以：

1. **理解新特性的核心价值**
   - ref as prop简化了组件API
   - ref callback清理提供了更好的资源管理
   - Context简化语法减少了代码嵌套

2. **掌握实际应用技巧**
   - 从简单案例到复杂系统
   - 从单一特性到组合使用
   - 从基础用法到高级模式

3. **建立最佳实践**
   - 何时使用哪种特性
   - 如何优化性能
   - 如何避免常见错误

4. **规划迁移策略**
   - 渐进式迁移
   - 兼容性处理
   - 团队协作

在实际项目中应用这些新特性时，要记住：
- 新特性是工具，不是目标
- 代码可读性和可维护性优先
- 性能优化要基于实际数据
- 团队协作和代码规范很重要

随着React生态的不断发展，保持学习和实践是每个React开发者的必修课。希望本文能够帮助你更好地理解和使用React 19的ref和Context改进，在实际项目中写出更优雅、更高效的代码。

## 注意事项

### 1. ref callback的执行时机
- ref callback在DOM挂载和卸载时执行
- 清理函数在元素卸载或ref改变时执行
- 避免在ref callback中直接更新state，可能导致循环渲染

### 2. Context值的稳定性
- Context value变化会导致所有消费者重新渲染
- 使用useMemo缓存Context value对象
- 将频繁变化的值和不变的值分离到不同的Context

### 3. ref as prop的限制
- ref在React 18中需要forwardRef
- 确保项目使用React 19+才能直接使用
- 库开发者需要考虑向后兼容性

### 4. 性能考虑
- ref callback每次重新创建会导致清理和重新初始化
- 使用useCallback稳定ref callback
- 避免在ref callback中执行耗时操作

### 5. 内存泄漏预防
- 确保所有监听器和订阅都有清理函数
- 清理函数中要释放所有资源引用
- 使用React DevTools Profiler检查内存使用

```
✅ ref作为prop简化组件API
✅ Context简化Provider语法，减少嵌套
✅ ref callback清理资源更精确
✅ 组合使用构建企业级应用
```

### 最佳实践

```
✅ 渐进式迁移
✅ 保持代码一致性
✅ 充分的文档
✅ 全面的测试
✅ 性能优化
✅ 错误边界
```

ref和Context改进让React 19代码更加简洁和强大！
