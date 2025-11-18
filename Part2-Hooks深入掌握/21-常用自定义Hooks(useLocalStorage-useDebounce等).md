# 常用自定义Hooks详解

## 学习目标

本章将深入讲解30+个生产级自定义Hooks，涵盖以下类别：

- 状态管理类Hooks（useToggle, useCounter, useLocalStorage等）
- 副作用管理类Hooks（useDebounce, useThrottle, useInterval等）  
- DOM操作类Hooks（useEventListener, useClickOutside, useWindowSize等）
- 网络请求类Hooks（useAsync, useFetch, useAPI等）
- 性能优化类Hooks（useMemoizedCallback, useDeepCompareEffect等）
- 表单处理类Hooks（useForm, useInput, useValidation等）
- 浏览器API类Hooks（useMediaQuery, useIntersectionObserver等）
- 工具类Hooks（usePrevious, useMount, useUpdateEffect等）
- React 19特性集成

通过学习这些Hooks，你将能够：
- 理解每个Hook的实现原理和使用场景
- 掌握自定义Hooks的最佳实践
- 提升代码复用性和开发效率
- 构建自己的Hooks工具库

## 第一部分：状态管理类Hooks

### 1.1 useToggle - 布尔值切换

**实现原理：**
`useToggle` 是最简单但也是最常用的Hook之一，用于管理布尔状态。

```jsx
import { useState, useCallback } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  // 切换状态
  const toggle = useCallback(() => setValue(v => !v), []);
  
  // 强制设置为true
  const setTrue = useCallback(() => setValue(true), []);
  
  // 强制设置为false
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse, setValue }];
}

// 基础使用示例
function ModalExample() {
  const [isOpen, { toggle, setTrue, setFalse }] = useToggle();
  
  return (
    <div>
      <button onClick={toggle}>切换模态框</button>
      <button onClick={setTrue}>打开模态框</button>
      <button onClick={setFalse}>关闭模态框</button>
      
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>模态框标题</h2>
            <p>模态框内容</p>
            <button onClick={setFalse}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}

// 复杂示例：多个开关
function SettingsPanel() {
  const [notifications, notificationActions] = useToggle(true);
  const [darkMode, darkModeActions] = useToggle(false);
  const [autoSave, autoSaveActions] = useToggle(true);
  
  return (
    <div className="settings">
      <div className="setting-item">
        <label>
          <input 
            type="checkbox" 
            checked={notifications} 
            onChange={notificationActions.toggle} 
          />
          启用通知
        </label>
      </div>
      
      <div className="setting-item">
        <label>
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={darkModeActions.toggle} 
          />
          暗黑模式
        </label>
      </div>
      
      <div className="setting-item">
        <label>
          <input 
            type="checkbox" 
            checked={autoSave} 
            onChange={autoSaveActions.toggle} 
          />
          自动保存
        </label>
      </div>
      
      <button onClick={() => {
        notificationActions.setTrue();
        darkModeActions.setFalse();
        autoSaveActions.setTrue();
      }}>
        恢复默认设置
      </button>
    </div>
  );
}
```

**TypeScript版本：**

```tsx
function useToggle(
  initialValue: boolean = false
): [boolean, {
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: React.Dispatch<React.SetStateAction<boolean>>;
}] {
  const [value, setValue] = useState<boolean>(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse, setValue }];
}
```

### 1.2 useCounter - 计数器管理

**实现原理：**
封装常见的计数器操作，支持最小值、最大值和步长配置。

```jsx
import { useState, useCallback } from 'react';

function useCounter(
  initialValue = 0, 
  { min, max, step = 1 } = {}
) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(c => {
      const newValue = c + step;
      if (max !== undefined && newValue > max) return c;
      return newValue;
    });
  }, [step, max]);
  
  const decrement = useCallback(() => {
    setCount(c => {
      const newValue = c - step;
      if (min !== undefined && newValue < min) return c;
      return newValue;
    });
  }, [step, min]);
  
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  const set = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(count) : value;
    if (min !== undefined && newValue < min) return;
    if (max !== undefined && newValue > max) return;
    setCount(newValue);
  }, [count, min, max]);
  
  return {
    count,
    increment,
    decrement,
    reset,
    set
  };
}

// 基础使用
function CounterExample() {
  const counter = useCounter(0, { min: 0, max: 10, step: 1 });
  
  return (
    <div>
      <p>当前值: {counter.count}</p>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.reset}>重置</button>
      <button onClick={() => counter.set(5)}>设为5</button>
    </div>
  );
}

// 购物车数量控制
function CartItem({ product }) {
  const quantity = useCounter(1, { min: 1, max: product.stock, step: 1 });
  
  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} />
      <div className="details">
        <h3>{product.name}</h3>
        <p>价格: ¥{product.price}</p>
      </div>
      
      <div className="quantity-control">
        <button onClick={quantity.decrement} disabled={quantity.count === 1}>
          -
        </button>
        <span>{quantity.count}</span>
        <button onClick={quantity.increment} disabled={quantity.count === product.stock}>
          +
        </button>
      </div>
      
      <p className="total">小计: ¥{(product.price * quantity.count).toFixed(2)}</p>
    </div>
  );
}

// 分页控制
function PaginationExample({ totalPages }) {
  const page = useCounter(1, { min: 1, max: totalPages, step: 1 });
  
  return (
    <div className="pagination">
      <button onClick={() => page.set(1)} disabled={page.count === 1}>
        首页
      </button>
      <button onClick={page.decrement} disabled={page.count === 1}>
        上一页
      </button>
      
      <span>第 {page.count} / {totalPages} 页</span>
      
      <button onClick={page.increment} disabled={page.count === totalPages}>
        下一页
      </button>
      <button onClick={() => page.set(totalPages)} disabled={page.count === totalPages}>
        尾页
      </button>
    </div>
  );
}
```

### 1.3 useLocalStorage - 本地存储同步

**实现原理：**
将React状态与localStorage同步，支持序列化和反序列化。

```jsx
import { useState, useCallback, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 初始化状态
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // 设置值
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // 移除值
  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue, remove];
}

// 用户偏好设置
function UserPreferences() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh-CN');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);
  
  return (
    <div className="preferences">
      <div>
        <label>主题:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">自动</option>
        </select>
      </div>
      
      <div>
        <label>语言:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>
      
      <div>
        <label>字体大小: {fontSize}px</label>
        <input 
          type="range" 
          min="12" 
          max="24" 
          value={fontSize} 
          onChange={(e) => setFontSize(Number(e.target.value))} 
        />
      </div>
      
      <button onClick={removeTheme}>重置主题</button>
    </div>
  );
}

// 购物车持久化
function ShoppingCart() {
  const [cart, setCart, clearCart] = useLocalStorage('shopping-cart', []);
  
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };
  
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return (
    <div>
      <h2>购物车 ({cart.length})</h2>
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <span>{item.name}</span>
          <input 
            type="number" 
            value={item.quantity} 
            onChange={(e) => updateQuantity(item.id, Number(e.target.value))} 
          />
          <span>¥{(item.price * item.quantity).toFixed(2)}</span>
          <button onClick={() => removeFromCart(item.id)}>删除</button>
        </div>
      ))}
      <div className="cart-total">
        <strong>总计: ¥{total.toFixed(2)}</strong>
      </div>
      <button onClick={clearCart}>清空购物车</button>
    </div>
  );
}
```

### 1.4 useSessionStorage - 会话存储

**实现原理：**
与useLocalStorage类似，但使用sessionStorage，数据在会话结束后自动清除。

```jsx
function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}

// 使用示例：表单草稿保存
function FormWithDraft() {
  const [formData, setFormData] = useSessionStorage('form-draft', {
    name: '',
    email: '',
    message: ''
  });
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 提交表单...
    // 提交成功后清空草稿
    setFormData({ name: '', email: '', message: '' });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <textarea name="message" value={formData.message} onChange={handleChange} />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 1.5 useArray - 数组操作

**实现原理：**
封装常见的数组操作，保持不可变性原则。

```jsx
function useArray(initialValue = []) {
  const [array, setArray] = useState(initialValue);
  
  const push = useCallback((element) => {
    setArray(a => [...a, element]);
  }, []);
  
  const filter = useCallback((callback) => {
    setArray(a => a.filter(callback));
  }, []);
  
  const update = useCallback((index, newElement) => {
    setArray(a => [
      ...a.slice(0, index),
      newElement,
      ...a.slice(index + 1)
    ]);
  }, []);
  
  const remove = useCallback((index) => {
    setArray(a => a.filter((_, i) => i !== index));
  }, []);
  
  const clear = useCallback(() => {
    setArray([]);
  }, []);
  
  const sort = useCallback((compareFn) => {
    setArray(a => [...a].sort(compareFn));
  }, []);
  
  const reverse = useCallback(() => {
    setArray(a => [...a].reverse());
  }, []);
  
  const map = useCallback((callback) => {
    setArray(a => a.map(callback));
  }, []);
  
  return { 
    array, 
    set: setArray, 
    push, 
    filter, 
    update, 
    remove, 
    clear,
    sort,
    reverse,
    map
  };
}

// 使用示例：任务列表
function TaskList() {
  const tasks = useArray([
    { id: 1, text: '学习React', completed: false },
    { id: 2, text: '编写文档', completed: true }
  ]);
  
  const addTask = (text) => {
    tasks.push({
      id: Date.now(),
      text,
      completed: false
    });
  };
  
  const toggleTask = (id) => {
    const index = tasks.array.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.update(index, {
        ...tasks.array[index],
        completed: !tasks.array[index].completed
      });
    }
  };
  
  const deleteTask = (id) => {
    const index = tasks.array.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.remove(index);
    }
  };
  
  const sortByCompleted = () => {
    tasks.sort((a, b) => a.completed - b.completed);
  };
  
  return (
    <div>
      <button onClick={() => addTask('新任务')}>添加任务</button>
      <button onClick={sortByCompleted}>按完成状态排序</button>
      <button onClick={tasks.clear}>清空列表</button>
      
      <ul>
        {tasks.array.map(task => (
          <li key={task.id}>
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)} 
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.text}
            </span>
            <button onClick={() => deleteTask(task.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 1.6 useMap - Map数据结构管理

**实现原理：**
封装Map数据结构的常见操作。

```jsx
function useMap(initialValue = new Map()) {
  const [map, setMap] = useState(initialValue);
  
  const set = useCallback((key, value) => {
    setMap(prev => {
      const newMap = new Map(prev);
      newMap.set(key, value);
      return newMap;
    });
  }, []);
  
  const remove = useCallback((key) => {
    setMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);
  
  const clear = useCallback(() => {
    setMap(new Map());
  }, []);
  
  const reset = useCallback(() => {
    setMap(initialValue);
  }, [initialValue]);
  
  return {
    map,
    set,
    remove,
    clear,
    reset,
    get: (key) => map.get(key),
    has: (key) => map.has(key),
    size: map.size
  };
}

// 使用示例：表单验证错误管理
function FormWithValidation() {
  const errors = useMap();
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  const validateEmail = (email) => {
    if (!email) {
      errors.set('email', '邮箱不能为空');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.set('email', '邮箱格式不正确');
    } else {
      errors.remove('email');
    }
  };
  
  const validatePassword = (password) => {
    if (!password) {
      errors.set('password', '密码不能为空');
    } else if (password.length < 6) {
      errors.set('password', '密码至少6位');
    } else {
      errors.remove('password');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    validateEmail(formData.email);
    validatePassword(formData.password);
    
    if (errors.size === 0) {
      console.log('表单提交:', formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, email: e.target.value }));
            validateEmail(e.target.value);
          }}
        />
        {errors.has('email') && <span className="error">{errors.get('email')}</span>}
      </div>
      
      <div>
        <input 
          type="password" 
          value={formData.password}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, password: e.target.value }));
            validatePassword(e.target.value);
          }}
        />
        {errors.has('password') && <span className="error">{errors.get('password')}</span>}
      </div>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 第二部分：副作用管理类Hooks

### 2.1 useDebounce - 防抖值

**实现原理：**
延迟更新值，在指定时间内只保留最后一次变更。

```jsx
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 搜索建议示例
function SearchWithSuggestions() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      // 模拟API调用
      fetch(`/api/search?q=${debouncedSearchTerm}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
          setLoading(false);
        });
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div className="search">
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="搜索..."
      />
      
      {loading && <div>搜索中...</div>}
      
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 自动保存示例
function AutoSaveEditor() {
  const [content, setContent] = useState('');
  const debouncedContent = useDebounce(content, 2000);
  const [saveStatus, setSaveStatus] = useState('已保存');
  
  useEffect(() => {
    if (debouncedContent) {
      setSaveStatus('保存中...');
      // 模拟保存
      fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content: debouncedContent })
      }).then(() => {
        setSaveStatus('已保存');
      });
    }
  }, [debouncedContent]);
  
  return (
    <div>
      <div className="status">{saveStatus}</div>
      <textarea 
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setSaveStatus('未保存');
        }}
        rows={10}
        cols={50}
      />
    </div>
  );
}
```

### 2.2 useDebouncedCallback - 防抖回调

**实现原理：**
防抖函数调用，而不是值。

```jsx
import { useCallback, useRef, useEffect } from 'react';

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  useEffect(() => {
    return cancel;
  }, [cancel]);
  
  return [debouncedCallback, cancel];
}

// 使用示例
function ResizablePanel() {
  const [width, setWidth] = useState(300);
  
  const [handleResize] = useDebouncedCallback((newWidth) => {
    console.log('面板宽度已调整为:', newWidth);
    // 执行耗时操作，如重新计算布局
  }, 500);
  
  const onWidthChange = (e) => {
    const newWidth = Number(e.target.value);
    setWidth(newWidth);
    handleResize(newWidth);
  };
  
  return (
    <div>
      <input 
        type="range" 
        min="200" 
        max="800" 
        value={width} 
        onChange={onWidthChange} 
      />
      <div style={{ width: `${width}px`, border: '1px solid #ccc' }}>
        面板内容
      </div>
    </div>
  );
}
```

### 2.3 useThrottle - 节流值

**实现原理：**
限制更新频率，在指定时间内最多更新一次。

```jsx
function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));
    
    return () => clearTimeout(handler);
  }, [value, limit]);
  
  return throttledValue;
}

// 滚动位置监听
function ScrollProgress() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 100);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const progress = (throttledScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  
  return (
    <div className="scroll-progress" style={{ width: `${progress}%` }}>
      滚动进度: {progress.toFixed(0)}%
    </div>
  );
}
```

### 2.4 useInterval - 定时器

**实现原理：**
声明式的setInterval，支持动态延迟和暂停。

```jsx
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    
    return () => clearInterval(id);
  }, [delay]);
}

// 倒计时示例
function Countdown({ initialSeconds }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  
  useInterval(() => {
    setSeconds(s => {
      if (s <= 1) {
        setRunning(false);
        return 0;
      }
      return s - 1;
    });
  }, running ? 1000 : null);
  
  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setSeconds(initialSeconds);
  };
  
  return (
    <div>
      <h2>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</h2>
      <button onClick={start} disabled={running || seconds === 0}>开始</button>
      <button onClick={pause} disabled={!running}>暂停</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}

// 实时数据刷新
function LiveDataDashboard() {
  const [data, setData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  
  const fetchData = useCallback(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useInterval(fetchData, refreshInterval);
  
  return (
    <div>
      <div>
        <label>刷新间隔:</label>
        <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))}>
          <option value={1000}>1秒</option>
          <option value={5000}>5秒</option>
          <option value={10000}>10秒</option>
          <option value={null}>不刷新</option>
        </select>
      </div>
      
      {data && (
        <div className="dashboard">
          <div>用户数: {data.users}</div>
          <div>订单数: {data.orders}</div>
          <div>收入: ¥{data.revenue}</div>
        </div>
      )}
    </div>
  );
}
```

### 2.5 useTimeout - 延时执行

**实现原理：**
声明式的setTimeout。

```jsx
function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setTimeout(() => savedCallback.current(), delay);
    
    return () => clearTimeout(id);
  }, [delay]);
}

// 消息提示自动关闭
function Notification({ message, duration = 3000 }) {
  const [visible, setVisible] = useState(true);
  
  useTimeout(() => {
    setVisible(false);
  }, visible ? duration : null);
  
  if (!visible) return null;
  
  return (
    <div className="notification">
      {message}
      <button onClick={() => setVisible(false)}>×</button>
    </div>
  );
}
```

## 第三部分：DOM操作类Hooks

### 3.1 useEventListener - 事件监听器

**实现原理：**
封装addEventListener的注册和清理。

```jsx
function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// 键盘快捷键
function KeyboardShortcuts() {
  const [logs, setLogs] = useState([]);
  
  useEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      setLogs(prev => [...prev, '保存 (Ctrl+S)']);
    } else if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      setLogs(prev => [...prev, '打印 (Ctrl+P)']);
    } else if (e.key === 'Escape') {
      setLogs(prev => [...prev, '关闭 (ESC)']);
    }
  });
  
  return (
    <div>
      <h3>按下快捷键试试：</h3>
      <ul>
        <li>Ctrl+S - 保存</li>
        <li>Ctrl+P - 打印</li>
        <li>ESC - 关闭</li>
      </ul>
      
      <h4>操作日志：</h4>
      <ul>
        {logs.map((log, i) => <li key={i}>{log}</li>)}
      </ul>
    </div>
  );
}

// 鼠标位置追踪
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEventListener('mousemove', (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  });
  
  return (
    <div>
      鼠标位置: X={position.x}, Y={position.y}
    </div>
  );
}
```

### 3.2 useClickOutside - 点击外部检测

**实现原理：**
检测点击是否发生在元素外部。

```jsx
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 下拉菜单
function Dropdown({ options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, () => setIsOpen(false));
  
  return (
    <div className="dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {selected || '选择选项'} ▼
      </button>
      
      {isOpen && (
        <ul className="dropdown-menu">
          {options.map(option => (
            <li 
              key={option}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 模态框
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useClickOutside(modalRef, onClose);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
```

### 3.3 useWindowSize - 窗口尺寸

**实现原理：**
监听窗口大小变化。

```jsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// 响应式组件
function ResponsiveLayout() {
  const { width } = useWindowSize();
  
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  return (
    <div>
      <h2>当前设备: {isMobile ? '手机' : isTablet ? '平板' : '桌面'}</h2>
      <p>宽度: {width}px</p>
      
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

### 3.4 useMediaQuery - 媒体查询

**实现原理：**
JavaScript版本的CSS媒体查询。

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

// 使用示例
function ThemeSelector() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  
  return (
    <div>
      <p>系统主题偏好: {prefersDark ? '深色' : '浅色'}</p>
      <p>设备类型: {isMobile ? '移动设备' : '桌面设备'}</p>
      <p>屏幕方向: {isPortrait ? '竖屏' : '横屏'}</p>
    </div>
  );
}
```

### 3.5 useIntersectionObserver - 可见性检测

**实现原理：**
使用Intersection Observer API检测元素可见性。

```jsx
function useIntersectionObserver(
  ref,
  { threshold = 0, root = null, rootMargin = '0px' } = {}
) {
  const [entry, setEntry] = useState(null);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, [ref, threshold, root, rootMargin]);
  
  return entry;
}

// 懒加载图片
function LazyImage({ src, alt }) {
  const imgRef = useRef(null);
  const entry = useIntersectionObserver(imgRef, { threshold: 0.1 });
  const isVisible = entry?.isIntersecting;
  
  return (
    <div ref={imgRef} className="lazy-image-container">
      {isVisible ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="placeholder">加载中...</div>
      )}
    </div>
  );
}

// 无限滚动
function InfiniteScroll({ loadMore, hasMore }) {
  const loaderRef = useRef(null);
  const entry = useIntersectionObserver(loaderRef);
  
  useEffect(() => {
    if (entry?.isIntersecting && hasMore) {
      loadMore();
    }
  }, [entry, hasMore, loadMore]);
  
  return (
    <div ref={loaderRef} className="loader">
      {hasMore ? '加载更多...' : '没有更多了'}
    </div>
  );
}
```

## 第四部分：网络请求类Hooks

### 4.1 useAsync - 异步操作管理

**实现原理：**
封装异步操作的loading、success、error状态。

```jsx
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  
  const execute = useCallback((...args) => {
    setStatus('pending');
    setValue(null);
    setError(null);
    
    return asyncFunction(...args)
      .then(response => {
        setValue(response);
        setStatus('success');
        return response;
      })
      .catch(error => {
        setError(error);
        setStatus('error');
        throw error;
      });
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { 
    execute, 
    status, 
    value, 
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}

// 数据获取示例
function UserProfile({ userId }) {
  const fetchUser = useCallback(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    [userId]
  );
  
  const { value: user, isPending, isError, error } = useAsync(fetchUser);
  
  if (isPending) return <div>加载中...</div>;
  if (isError) return <div>错误: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div className="profile">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}
```

### 4.2 useFetch - HTTP请求

**实现原理：**
封装fetch API，支持自动重试、缓存等功能。

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    
    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url, options]);
  
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  return { data, loading, error, refetch };
}

// 使用示例
function ProductList() {
  const { data: products, loading, error, refetch } = useFetch('/api/products');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message} <button onClick={refetch}>重试</button></div>;
  
  return (
    <div>
      <button onClick={refetch}>刷新</button>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name} - ¥{product.price}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 第五部分：表单处理类Hooks

### 5.1 useForm - 表单管理

**实现原理：**
封装表单状态、验证和提交逻辑。

```jsx
function useForm(initialValues = {}, validate = () => ({})) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
  };
  
  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      Promise.resolve(onSubmit(values))
        .finally(() => setIsSubmitting(false));
    }
  };
  
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue: (name, value) => setValues(prev => ({ ...prev, [name]: value })),
    setFieldError: (name, error) => setErrors(prev => ({ ...prev, [name]: error }))
  };
}

// 使用示例
function RegistrationForm() {
  const validate = (values) => {
    const errors = {};
    
    if (!values.username) {
      errors.username = '用户名必填';
    } else if (values.username.length < 3) {
      errors.username = '用户名至少3个字符';
    }
    
    if (!values.email) {
      errors.email = '邮箱必填';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = '邮箱格式不正确';
    }
    
    if (!values.password) {
      errors.password = '密码必填';
    } else if (values.password.length < 6) {
      errors.password = '密码至少6个字符';
    }
    
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = '密码不一致';
    }
    
    return errors;
  };
  
  const form = useForm(
    { username: '', email: '', password: '', confirmPassword: '' },
    validate
  );
  
  const onSubmit = async (values) => {
    console.log('提交表单:', values);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('注册成功！');
    form.reset();
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <input 
          name="username"
          value={form.values.username}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="用户名"
        />
        {form.touched.username && form.errors.username && (
          <span className="error">{form.errors.username}</span>
        )}
      </div>
      
      <div>
        <input 
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="邮箱"
        />
        {form.touched.email && form.errors.email && (
          <span className="error">{form.errors.email}</span>
        )}
      </div>
      
      <div>
        <input 
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="密码"
        />
        {form.touched.password && form.errors.password && (
          <span className="error">{form.errors.password}</span>
        )}
      </div>
      
      <div>
        <input 
          name="confirmPassword"
          type="password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="确认密码"
        />
        {form.touched.confirmPassword && form.errors.confirmPassword && (
          <span className="error">{form.errors.confirmPassword}</span>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

### 5.2 useInput - 单个输入管理

**实现原理：**
简化单个输入框的状态管理。

```jsx
function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  
  const onChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  const clear = useCallback(() => {
    setValue('');
  }, []);
  
  return {
    value,
    setValue,
    onChange,
    reset,
    clear,
    bind: {
      value,
      onChange
    }
  };
}

// 使用示例
function SearchForm() {
  const searchInput = useInput('');
  const emailInput = useInput('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('搜索:', searchInput.value);
    console.log('邮箱:', emailInput.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input {...searchInput.bind} placeholder="搜索" />
      <button type="button" onClick={searchInput.clear}>清空</button>
      
      <input {...emailInput.bind} type="email" placeholder="邮箱" />
      <button type="button" onClick={emailInput.reset}>重置</button>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 第六部分：工具类Hooks

### 6.1 usePrevious - 获取上一次的值

**实现原理：**
使用useRef保存上一次的值。

```jsx
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一次的值: {prevCount}</p>
      <p>变化: {count - (prevCount || 0)}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  );
}
```

### 6.2 useMount - 组件挂载时执行

**实现原理：**
在组件挂载时执行一次回调。

```jsx
function useMount(callback) {
  useEffect(() => {
    callback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// 使用示例
function Analytics() {
  useMount(() => {
    console.log('页面访问统计');
    // 发送统计数据
  });
  
  return <div>Analytics Component</div>;
}
```

### 6.3 useUnmount - 组件卸载时执行

**实现原理：**
在组件卸载时执行清理回调。

```jsx
function useUnmount(callback) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    return () => callbackRef.current();
  }, []);
}

// 使用示例
function ChatRoom({ roomId }) {
  useUnmount(() => {
    console.log(`离开聊天室: ${roomId}`);
    // 发送离开通知
  });
  
  return <div>聊天室 {roomId}</div>;
}
```

### 6.4 useUpdateEffect - 跳过首次渲染的useEffect

**实现原理：**
使用useRef标记是否为首次渲染。

```jsx
function useUpdateEffect(effect, deps) {
  const isMounted = useRef(false);
  
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    return effect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// 使用示例
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  // 首次渲染时不搜索，只有query变化时才搜索
  useUpdateEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, [query]);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### 6.5 useIsMounted - 检查组件是否已挂载

**实现原理：**
使用useRef和useEffect跟踪挂载状态。

```jsx
function useIsMounted() {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return useCallback(() => isMounted.current, []);
}

// 使用示例
function AsyncComponent() {
  const [data, setData] = useState(null);
  const isMounted = useIsMounted();
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        // 只有组件还在时才更新状态
        if (isMounted()) {
          setData(data);
        }
      });
  }, [isMounted]);
  
  return <div>{data ? JSON.stringify(data) : '加载中...'}</div>;
}
```

### 6.6 useCopyToClipboard - 复制到剪贴板

**实现原理：**
使用Clipboard API复制文本。

```jsx
function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState(null);
  
  const copy = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API不可用');
      return false;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      setCopiedText(null);
      return false;
    }
  }, []);
  
  return [copiedText, copy];
}

// 使用示例
function CodeSnippet({ code }) {
  const [copiedText, copy] = useCopyToClipboard();
  const isCopied = copiedText === code;
  
  return (
    <div className="code-snippet">
      <pre>{code}</pre>
      <button onClick={() => copy(code)}>
        {isCopied ? '已复制!' : '复制'}
      </button>
    </div>
  );
}
```

### 6.7 useOnlineStatus - 网络状态检测

**实现原理：**
监听online和offline事件。

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// 使用示例
function NetworkIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '在线' : '离线'}
    </div>
  );
}
```

## 第七部分：性能优化类Hooks

### 7.1 useDeepCompareEffect - 深度比较依赖

**实现原理：**
使用深度比较替代浅比较。

```jsx
import { useEffect, useRef } from 'react';

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  if (obj1 === null || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

function useDeepCompareMemoize(value) {
  const ref = useRef();
  
  if (!deepEqual(value, ref.current)) {
    ref.current = value;
  }
  
  return ref.current;
}

function useDeepCompareEffect(effect, deps) {
  useEffect(effect, useDeepCompareMemoize(deps));
}

// 使用示例
function UserList({ filters }) {
  const [users, setUsers] = useState([]);
  
  // filters是对象，使用深度比较
  useDeepCompareEffect(() => {
    fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(filters)
    })
      .then(res => res.json())
      .then(setUsers);
  }, [filters]);
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### 7.2 useWhyDidYouUpdate - 调试重新渲染原因

**实现原理：**
比较props变化并记录日志。

```jsx
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// 使用示例
function ExpensiveComponent(props) {
  useWhyDidYouUpdate('ExpensiveComponent', props);
  
  return <div>{/* 复杂的渲染逻辑 */}</div>;
}
```

## React 19集成示例

### 使用新的Hooks特性

```jsx
import { use, useOptimistic, useActionState } from 'react';

// 使用use Hook从Promise读取数据
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// 使用useOptimistic实现乐观更新
function TodoList({ todos, addTodo }) {
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );
  
  const handleAdd = async (text) => {
    const newTodo = { id: Date.now(), text, completed: false };
    setOptimisticTodos(newTodo);
    await addTodo(newTodo);
  };
  
  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id} className={todo.pending ? 'pending' : ''}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// 使用useActionState管理表单状态
function ContactForm() {
  const [state, formAction] = useActionState(async (prevState, formData) => {
    const name = formData.get('name');
    const email = formData.get('email');
    
    try {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email })
      });
      return { success: true, message: '提交成功!' };
    } catch (error) {
      return { success: false, message: '提交失败' };
    }
  }, { success: false, message: '' });
  
  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">提交</button>
      {state.message && (
        <p className={state.success ? 'success' : 'error'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

## 注意事项

### 1. Hook命名规范

所有自定义Hook必须以"use"开头：

```jsx
// ✅ 正确
function useCustomHook() { }

// ❌ 错误
function customHook() { }
function getCustomHook() { }
```

### 2. 依赖数组管理

正确声明依赖项，避免遗漏或过度依赖：

```jsx
// ❌ 错误：缺少依赖
function useExample(value) {
  useEffect(() => {
    console.log(value);
  }, []); // 缺少value依赖
}

// ✅ 正确
function useExample(value) {
  useEffect(() => {
    console.log(value);
  }, [value]);
}

// ✅ 使用useCallback稳定函数引用
function useExample(callback) {
  const stableCallback = useCallback(callback, []);
  
  useEffect(() => {
    stableCallback();
  }, [stableCallback]);
}
```

### 3. 避免在循环、条件或嵌套函数中调用Hooks

```jsx
// ❌ 错误
function Component({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 条件调用
  }
}

// ✅ 正确
function Component({ condition }) {
  const [state, setState] = useState(0);
  
  if (condition) {
    // 使用state
  }
}
```

### 4. 清理副作用

所有订阅、定时器、事件监听器都应该在cleanup函数中清理：

```jsx
// ✅ 正确的cleanup
function useWebSocket(url) {
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      console.log(event.data);
    };
    
    // cleanup函数
    return () => {
      ws.close();
    };
  }, [url]);
}
```

### 5. useCallback和useMemo的使用时机

不要过度使用，只在必要时优化：

```jsx
// ❌ 过度优化：简单值不需要useMemo
const doubled = useMemo(() => count * 2, [count]);

// ✅ 正确：复杂计算才使用
const expensiveResult = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// ❌ 不必要的useCallback：没有作为依赖传递
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);

// ✅ 正确：传递给优化的子组件
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

return <MemoizedChild onClick={handleClick} />;
```

### 6. 避免在useEffect中直接使用async

```jsx
// ❌ 错误
useEffect(async () => {
  const data = await fetchData();
}, []);

// ✅ 正确
useEffect(() => {
  const fetchDataAsync = async () => {
    const data = await fetchData();
  };
  
  fetchDataAsync();
}, []);

// ✅ 或使用IIFE
useEffect(() => {
  (async () => {
    const data = await fetchData();
  })();
}, []);
```

### 7. useState的函数式更新

当新状态依赖旧状态时，使用函数式更新：

```jsx
// ❌ 可能出错
setCount(count + 1);

// ✅ 安全
setCount(prevCount => prevCount + 1);
```

### 8. 避免状态过度细分

```jsx
// ❌ 过度细分
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');

// ✅ 合理分组
const [user, setUser] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});
```

## 常见问题

### Q1: 为什么我的自定义Hook在每次渲染时都创建新实例？

**A:** 确保使用useCallback或useMemo缓存函数和对象：

```jsx
// ❌ 问题代码
function useCustomHook() {
  const config = { option: 'value' }; // 每次都是新对象
  
  useEffect(() => {
    doSomething(config);
  }, [config]); // 导致无限循环
}

// ✅ 解决方案
function useCustomHook() {
  const config = useMemo(() => ({ option: 'value' }), []);
  
  useEffect(() => {
    doSomething(config);
  }, [config]);
}
```

### Q2: useEffect的依赖数组应该包含什么？

**A:** 所有在effect中使用的外部变量：

- 组件props
- 组件state
- 组件内定义的变量和函数
- 不包括：setState函数、useRef返回的ref对象

```jsx
function Component({ externalValue }) {
  const [state, setState] = useState(0);
  const ref = useRef();
  
  useEffect(() => {
    console.log(externalValue, state);
    ref.current = 'value'; // ref不需要作为依赖
  }, [externalValue, state]); // setState不需要
}
```

### Q3: 如何在自定义Hook中共享状态？

**A:** 使用Context或状态管理库：

```jsx
// 使用Context共享状态
const CountContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

function useCount() {
  const context = useContext(CountContext);
  if (!context) {
    throw new Error('useCount必须在CountProvider内使用');
  }
  return context;
}

// 使用
function ComponentA() {
  const { count, setCount } = useCount();
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

function ComponentB() {
  const { count } = useCount();
  return <span>计数: {count}</span>;
}
```

### Q4: useCallback和useMemo有什么区别？

**A:**
- `useCallback`：缓存**函数引用**
- `useMemo`：缓存**计算结果**

```jsx
// useCallback
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
// 等价于
const memoizedCallback = useMemo(() => {
  return () => {
    doSomething(a, b);
  };
}, [a, b]);

// useMemo
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

### Q5: 如何处理useEffect中的竞态条件？

**A:** 使用cleanup函数或AbortController：

```jsx
// 方法1：使用标志位
function useData(id) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    fetch(`/api/data/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [id]);
  
  return data;
}

// 方法2：使用AbortController
function useData(id) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const abortController = new AbortController();
    
    fetch(`/api/data/${id}`, {
      signal: abortController.signal
    })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      abortController.abort();
    };
  }, [id]);
  
  return data;
}
```

### Q6: 为什么useState的更新不立即生效？

**A:** setState是异步的，使用函数式更新或useEffect处理：

```jsx
function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // 仍然是旧值！
    
    // 解决方案1：函数式更新
    setCount(prevCount => {
      console.log(prevCount); // 正确的值
      return prevCount + 1;
    });
  };
  
  // 解决方案2：使用useEffect监听变化
  useEffect(() => {
    console.log('count已更新为:', count);
  }, [count]);
  
  return <button onClick={handleClick}>{count}</button>;
}
```

### Q7: 如何在自定义Hook中使用TypeScript？

**A:** 明确定义参数和返回值的类型：

```tsx
// 泛型自定义Hook
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用
const [user, setUser] = useLocalStorage<{ name: string; age: number }>('user', {
  name: '',
  age: 0
});
```

### Q8: 多个useState还是单个useReducer？

**A:** 根据复杂度选择：

- **简单独立状态**：多个useState
- **相关联的复杂状态**：useReducer

```jsx
// ✅ 简单独立状态使用useState
function SimpleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // ...
}

// ✅ 复杂相关状态使用useReducer
function ComplexForm() {
  const [state, dispatch] = useReducer(reducer, {
    values: { name: '', email: '' },
    errors: {},
    touched: {},
    isSubmitting: false
  });
  // ...
}
```

## 总结

### 核心要点回顾

1. **自定义Hooks的价值**
   - 复用有状态的逻辑
   - 提高代码可读性和可维护性
   - 符合关注点分离原则

2. **常用Hook分类**
   - **状态管理**：useToggle, useCounter, useLocalStorage, useArray, useMap
   - **副作用管理**：useDebounce, useThrottle, useInterval, useTimeout
   - **DOM操作**：useEventListener, useClickOutside, useWindowSize, useMediaQuery, useIntersectionObserver
   - **网络请求**：useAsync, useFetch
   - **表单处理**：useForm, useInput
   - **工具类**：usePrevious, useMount, useUnmount, useUpdateEffect, useCopyToClipboard

3. **最佳实践**
   - 遵循Hook命名规范（use开头）
   - 正确管理依赖数组
   - 及时清理副作用
   - 适度使用性能优化
   - 保持Hook的单一职责

4. **性能优化**
   - 使用useCallback缓存函数
   - 使用useMemo缓存计算结果
   - 避免不必要的重渲染
   - 合理拆分状态

5. **常见陷阱**
   - 在条件语句中调用Hook
   - 遗漏依赖项
   - 忘记清理副作用
   - 过度优化
   - 闭包陷阱

### 学习路径建议

1. **初级阶段**
   - 掌握基础的状态管理Hooks（useToggle, useCounter）
   - 理解useLocalStorage的实现原理
   - 学习基础的副作用管理（useDebounce, useInterval）

2. **中级阶段**
   - 实现复杂的表单处理Hook
   - 掌握DOM操作类Hooks
   - 学习网络请求封装
   - 理解性能优化技巧

3. **高级阶段**
   - 设计可复用的Hook库
   - 集成TypeScript类型定义
   - 优化Hook性能
   - 编写单元测试

### 推荐的Hook库

1. **react-use** - 最全面的Hook集合
2. **ahooks** - 阿里开源的高质量Hook库
3. **react-hook-form** - 专注于表单处理
4. **swr** / **react-query** - 数据获取和缓存
5. **zustand** / **jotai** - 状态管理

### 下一步学习

- 深入学习Hook实现原理（Fiber架构）
- 探索React 19的新特性（use, useOptimistic, useActionState）
- 学习测试驱动开发（TDD）编写Hook
- 研究开源Hook库的源码
- 构建自己的Hook工具库

通过本章的学习，你已经掌握了30+个生产级自定义Hooks，这些Hooks可以直接应用于实际项目，大大提升开发效率。继续实践和探索，你将能够设计出更加优雅和高效的自定义Hooks！
