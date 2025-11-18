# useInsertionEffect-CSS-in-JS优化

## 学习目标

通过本章学习，你将全面掌握：

- useInsertionEffect的概念和作用
- CSS-in-JS库的性能优化
- useInsertionEffect的执行时机和原理
- 与useEffect和useLayoutEffect的详细对比
- styled-components等库的集成
- 动态样式注入技术
- 主题系统实现
- 性能优化最佳实践
- TypeScript集成
- 样式管理库的构建
- SSR兼容性
- 生产环境优化策略

## 第一部分：useInsertionEffect基础

### 1.1 什么是useInsertionEffect

useInsertionEffect是React 18引入的Hook，专门用于CSS-in-JS库在DOM变更之前、但在React读取布局之前注入样式，避免样式闪烁和布局抖动。

```jsx
import { useInsertionEffect, useLayoutEffect, useEffect, useState } from 'react';

function BasicUseInsertionEffect() {
  const [count, setCount] = useState(0);
  
  useInsertionEffect(() => {
    console.log('1. useInsertionEffect执行 - 在DOM变更前注入样式');
    // 在这里注入样式
  }, [count]);
  
  useLayoutEffect(() => {
    console.log('2. useLayoutEffect执行 - DOM已更新但未绘制');
  }, [count]);
  
  useEffect(() => {
    console.log('3. useEffect执行 - 浏览器已绘制');
  }, [count]);
  
  console.log('0. 组件渲染');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
  
  /**
   * 完整执行顺序：
   * 0. 组件渲染（生成虚拟DOM）
   * 1. useInsertionEffect执行（注入样式，在DOM变更前）
   * 2. React更新真实DOM
   * 3. useLayoutEffect执行（同步，可以读取布局）
   * 4. 浏览器绘制到屏幕
   * 5. useEffect执行（异步）
   */
}
```

### 1.2 为什么需要useInsertionEffect

在没有useInsertionEffect之前，CSS-in-JS库使用useLayoutEffect注入样式，但这可能导致：

```jsx
// ❌ 问题：使用useLayoutEffect注入样式
function ProblemWithLayoutEffect() {
  const [color, setColor] = useState('red');
  
  useLayoutEffect(() => {
    // DOM已经更新，但样式还未注入
    // React可能已经读取了布局信息
    const styleElement = document.createElement('style');
    styleElement.textContent = `.box { color: ${color}; }`;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [color]);
  
  return <div className="box">文本</div>;
  
  /**
   * 问题：
   * 1. React更新DOM
   * 2. React可能读取布局（如果有其他useLayoutEffect）
   * 3. 样式才被注入
   * 4. 可能导致样式闪烁或布局抖动
   */
}

// ✅ 解决：使用useInsertionEffect
function SolutionWithInsertionEffect() {
  const [color, setColor] = useState('red');
  
  useInsertionEffect(() => {
    // 在DOM变更前注入样式
    // React还未读取布局信息
    const styleElement = document.createElement('style');
    styleElement.textContent = `.box { color: ${color}; }`;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [color]);
  
  return <div className="box">文本</div>;
  
  /**
   * 优势：
   * 1. 样式在DOM变更前注入
   * 2. React读取布局时样式已存在
   * 3. 无样式闪烁或布局抖动
   */
}
```

### 1.3 三种Effect的详细对比

```jsx
function EffectTimingDetailed() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  // 1. useInsertionEffect：最早执行
  useInsertionEffect(() => {
    console.log('📝 useInsertionEffect - count:', count);
    // 用途：注入CSS样式
    // 时机：DOM变更前
    // 不能：读取DOM布局
  }, [count]);
  
  // 2. useLayoutEffect：同步执行
  useLayoutEffect(() => {
    console.log('📐 useLayoutEffect - count:', count);
    // 用途：读取DOM布局、同步更新
    // 时机：DOM变更后，浏览器绘制前
    // 可以：读取DOM、同步修改DOM
  }, [count]);
  
  // 3. useEffect：异步执行
  useEffect(() => {
    console.log('⚡ useEffect - count:', count);
    // 用途：数据获取、订阅、日志等
    // 时机：浏览器绘制后
    // 推荐：大多数副作用
  }, [count]);
  
  console.log('🎨 组件渲染 - count:', count);
  
  return (
    <div>
      <h2>Effect执行顺序演示</h2>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      
      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Hook</th>
              <th>执行时机</th>
              <th>主要用途</th>
              <th>阻塞渲染</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>useInsertionEffect</td>
              <td>DOM变更前</td>
              <td>注入CSS</td>
              <td>是</td>
            </tr>
            <tr>
              <td>useLayoutEffect</td>
              <td>DOM变更后，绘制前</td>
              <td>DOM测量</td>
              <td>是</td>
            </tr>
            <tr>
              <td>useEffect</td>
              <td>浏览器绘制后</td>
              <td>副作用</td>
              <td>否</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 第二部分：CSS-in-JS基础应用

### 2.1 简单的样式注入

```jsx
function useDynamicStyle(className, styles) {
  useInsertionEffect(() => {
    // 检查样式是否已存在
    let styleElement = document.getElementById(`style-${className}`);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = `style-${className}`;
      document.head.appendChild(styleElement);
    }
    
    // 生成CSS文本
    const cssText = Object.entries(styles)
      .map(([property, value]) => {
        // 将camelCase转换为kebab-case
        const cssProperty = property.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
        return `${cssProperty}: ${value};`;
      })
      .join('\n  ');
    
    styleElement.textContent = `.${className} {\n  ${cssText}\n}`;
    
    // 清理函数
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [className, JSON.stringify(styles)]);
  
  return className;
}

// 使用
function DynamicStyledComponent() {
  const [color, setColor] = useState('#3498db');
  const [size, setSize] = useState(16);
  
  const className = useDynamicStyle('dynamic-box', {
    backgroundColor: color,
    padding: '20px',
    borderRadius: '8px',
    color: 'white',
    fontSize: `${size}px`,
    transition: 'all 0.3s ease'
  });
  
  return (
    <div>
      <div className={className}>
        这是一个动态样式的盒子
        <br />
        背景颜色: {color}
        <br />
        字体大小: {size}px
      </div>
      
      <div className="controls">
        <div>
          <label>背景颜色:</label>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>
        
        <div>
          <label>字体大小:</label>
          <input
            type="range"
            min="12"
            max="32"
            value={size}
            onChange={e => setSize(e.target.value)}
          />
          <span>{size}px</span>
        </div>
      </div>
    </div>
  );
}
```

### 2.2 支持伪类和媒体查询

```jsx
function useAdvancedStyle(className, config) {
  useInsertionEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = `style-${className}`;
    
    let cssText = '';
    
    // 基础样式
    if (config.base) {
      const baseStyles = Object.entries(config.base)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `  ${cssProp}: ${value};`;
        })
        .join('\n');
      
      cssText += `.${className} {\n${baseStyles}\n}\n\n`;
    }
    
    // 伪类样式
    if (config.hover) {
      const hoverStyles = Object.entries(config.hover)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `  ${cssProp}: ${value};`;
        })
        .join('\n');
      
      cssText += `.${className}:hover {\n${hoverStyles}\n}\n\n`;
    }
    
    if (config.active) {
      const activeStyles = Object.entries(config.active)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `  ${cssProp}: ${value};`;
        })
        .join('\n');
      
      cssText += `.${className}:active {\n${activeStyles}\n}\n\n`;
    }
    
    // 媒体查询
    if (config.media) {
      Object.entries(config.media).forEach(([query, styles]) => {
        const mediaStyles = Object.entries(styles)
          .map(([prop, value]) => {
            const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            return `    ${cssProp}: ${value};`;
          })
          .join('\n');
        
        cssText += `@media ${query} {\n  .${className} {\n${mediaStyles}\n  }\n}\n\n`;
      });
    }
    
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [className, JSON.stringify(config)]);
  
  return className;
}

// 使用
function ResponsiveButton() {
  const buttonClass = useAdvancedStyle('responsive-btn', {
    base: {
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    hover: {
      backgroundColor: '#2980b9',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    },
    media: {
      '(max-width: 768px)': {
        padding: '10px 20px',
        fontSize: '14px'
      },
      '(max-width: 480px)': {
        padding: '8px 16px',
        fontSize: '12px',
        width: '100%'
      }
    }
  });
  
  return (
    <button className={buttonClass}>
      响应式按钮
    </button>
  );
}
```

### 2.3 样式组合和继承

```jsx
class StyleManager {
  constructor() {
    this.styles = new Map();
    this.counter = 0;
  }
  
  generateClassName(prefix = 'css') {
    return `${prefix}-${++this.counter}`;
  }
  
  insertStyle(className, cssText) {
    if (this.styles.has(className)) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = `style-${className}`;
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
    
    this.styles.set(className, styleElement);
  }
  
  removeStyle(className) {
    const styleElement = this.styles.get(className);
    if (styleElement && document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
      this.styles.delete(className);
    }
  }
  
  compose(...classNames) {
    return classNames.filter(Boolean).join(' ');
  }
}

const styleManager = new StyleManager();

function useComposedStyles(baseStyles, ...extendStyles) {
  const className = useMemo(() => styleManager.generateClassName(), []);
  
  useInsertionEffect(() => {
    // 合并所有样式
    const mergedStyles = Object.assign({}, baseStyles, ...extendStyles);
    
    const cssText = Object.entries(mergedStyles)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
        return `  ${cssProp}: ${value};`;
      })
      .join('\n');
    
    styleManager.insertStyle(className, `.${className} {\n${cssText}\n}`);
    
    return () => {
      styleManager.removeStyle(className);
    };
  }, [className, baseStyles, ...extendStyles]);
  
  return className;
}

// 使用
function ComposedStyleExample() {
  const baseButtonStyles = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  };
  
  const primaryStyles = {
    backgroundColor: '#3498db',
    color: 'white'
  };
  
  const dangerStyles = {
    backgroundColor: '#e74c3c',
    color: 'white'
  };
  
  const primaryBtn = useComposedStyles(baseButtonStyles, primaryStyles);
  const dangerBtn = useComposedStyles(baseButtonStyles, dangerStyles);
  
  return (
    <div>
      <button className={primaryBtn}>主要按钮</button>
      <button className={dangerBtn}>危险按钮</button>
    </div>
  );
}
```

## 第三部分：主题系统实现

### 3.1 基础主题系统

```jsx
// 主题定义
const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    primary: '#3498db',
    secondary: '#2ecc71',
    border: '#e1e8ed',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  dark: {
    background: '#1a1a1a',
    text: '#f5f5f5',
    primary: '#2980b9',
    secondary: '#27ae60',
    border: '#333333',
    shadow: 'rgba(255, 255, 255, 0.1)'
  }
};

function useTheme(themeName) {
  const theme = themes[themeName] || themes.light;
  
  useInsertionEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'theme-variables';
    
    // 生成CSS变量
    const cssVars = Object.entries(theme)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');
    
    styleElement.textContent = `:root {\n${cssVars}\n}`;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [themeName]);
  
  return theme;
}

// 使用
function ThemedApp() {
  const [themeName, setThemeName] = useState('light');
  const theme = useTheme(themeName);
  
  const containerStyle = useDynamicStyle('themed-container', {
    minHeight: '100vh',
    backgroundColor: theme.background,
    color: theme.text,
    transition: 'all 0.3s ease'
  });
  
  return (
    <div className={containerStyle}>
      <header style={{
        padding: '20px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>主题系统演示</h1>
        
        <button
          onClick={() => setThemeName(t => t === 'light' ? 'dark' : 'light')}
          style={{
            padding: '8px 16px',
            backgroundColor: theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          切换到{themeName === 'light' ? '深色' : '浅色'}模式
        </button>
      </header>
      
      <main style={{ padding: '20px' }}>
        <div style={{
          padding: '20px',
          backgroundColor: theme.primary,
          color: 'white',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          这是主色调区域
        </div>
        
        <div style={{
          padding: '20px',
          backgroundColor: theme.secondary,
          color: 'white',
          borderRadius: '8px'
        }}>
          这是次要色调区域
        </div>
      </main>
    </div>
  );
}
```

### 3.2 Context主题系统

```jsx
const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('light');
  const theme = themes[themeName];
  
  useInsertionEffect(() => {
    // 注入全局主题变量
    const styleElement = document.createElement('style');
    styleElement.id = 'global-theme';
    
    const cssVars = Object.entries(theme)
      .map(([key, value]) => `  --theme-${key}: ${value};`)
      .join('\n');
    
    const globalStyles = `
:root {
${cssVars}
}

body {
  background-color: var(--theme-background);
  color: var(--theme-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}
`;
    
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [theme]);
  
  const value = useMemo(() => ({
    theme,
    themeName,
    setThemeName,
    toggleTheme: () => setThemeName(t => t === 'light' ? 'dark' : 'light')
  }), [theme, themeName]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}

// 使用
function App() {
  return (
    <ThemeProvider>
      <ThemedApplication />
    </ThemeProvider>
  );
}

function ThemedApplication() {
  const { theme, themeName, toggleTheme } = useThemeContext();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>当前主题: {themeName}</h1>
      <button onClick={toggleTheme}>切换主题</button>
      
      <Card title="主题色卡" />
    </div>
  );
}

function Card({ title }) {
  const { theme } = useThemeContext();
  
  const cardStyle = useDynamicStyle('theme-card', {
    padding: '20px',
    margin: '20px 0',
    backgroundColor: theme.background,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    boxShadow: `0 2px 4px ${theme.shadow}`
  });
  
  return (
    <div className={cardStyle}>
      <h2 style={{ color: theme.primary }}>{title}</h2>
      <p style={{ color: theme.text }}>这是一个使用主题的卡片组件</p>
    </div>
  );
}
```

## 第四部分：性能优化

### 4.1 样式缓存

```jsx
class OptimizedStyleManager {
  constructor() {
    this.cache = new Map();
    this.styleElements = new Map();
  }
  
  hashObject(obj) {
    return JSON.stringify(obj);
  }
  
  insertStyle(styles) {
    const hash = this.hashObject(styles);
    
    // 检查缓存
    if (this.cache.has(hash)) {
      return this.cache.get(hash);
    }
    
    // 生成新的className
    const className = `css-${this.cache.size}`;
    
    // 创建样式
    const cssText = Object.entries(styles)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
        return `  ${cssProp}: ${value};`;
      })
      .join('\n');
    
    const styleElement = document.createElement('style');
    styleElement.id = `style-${className}`;
    styleElement.textContent = `.${className} {\n${cssText}\n}`;
    
    document.head.appendChild(styleElement);
    
    // 缓存
    this.cache.set(hash, className);
    this.styleElements.set(className, {
      element: styleElement,
      refCount: 0
    });
    
    return className;
  }
  
  useStyle(className) {
    const styleData = this.styleElements.get(className);
    if (styleData) {
      styleData.refCount++;
    }
  }
  
  releaseStyle(className) {
    const styleData = this.styleElements.get(className);
    if (styleData) {
      styleData.refCount--;
      
      // 引用计数为0时清理
      if (styleData.refCount <= 0) {
        if (document.head.contains(styleData.element)) {
          document.head.removeChild(styleData.element);
        }
        
        // 从缓存中移除
        for (const [hash, cachedClassName] of this.cache.entries()) {
          if (cachedClassName === className) {
            this.cache.delete(hash);
            break;
          }
        }
        
        this.styleElements.delete(className);
      }
    }
  }
}

const optimizedStyleManager = new OptimizedStyleManager();

function useOptimizedStyle(styles) {
  const className = useMemo(() => {
    return optimizedStyleManager.insertStyle(styles);
  }, [JSON.stringify(styles)]);
  
  useInsertionEffect(() => {
    optimizedStyleManager.useStyle(className);
    
    return () => {
      optimizedStyleManager.releaseStyle(className);
    };
  }, [className]);
  
  return className;
}

// 使用
function OptimizedComponent({ color, size }) {
  const className = useOptimizedStyle({
    backgroundColor: color,
    padding: `${size}px`,
    borderRadius: '8px'
  });
  
  return <div className={className}>优化的组件</div>;
}

// 多个相同样式的组件会共享同一个style元素
function MultipleComponents() {
  return (
    <div>
      <OptimizedComponent color="#3498db" size={20} />
      <OptimizedComponent color="#3498db" size={20} />
      <OptimizedComponent color="#3498db" size={20} />
      {/* 这三个组件会共享同一个style元素 */}
    </div>
  );
}
```

### 4.2 批量样式更新

```jsx
class BatchedStyleManager {
  constructor() {
    this.pendingStyles = new Map();
    this.rafId = null;
  }
  
  scheduleUpdate(className, styles) {
    this.pendingStyles.set(className, styles);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
      });
    }
  }
  
  flush() {
    const fragment = document.createDocumentFragment();
    
    for (const [className, styles] of this.pendingStyles.entries()) {
      let styleElement = document.getElementById(`style-${className}`);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = `style-${className}`;
        fragment.appendChild(styleElement);
      }
      
      const cssText = Object.entries(styles)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `  ${cssProp}: ${value};`;
        })
        .join('\n');
      
      styleElement.textContent = `.${className} {\n${cssText}\n}`;
    }
    
    if (fragment.hasChildNodes()) {
      document.head.appendChild(fragment);
    }
    
    this.pendingStyles.clear();
    this.rafId = null;
  }
}

const batchedStyleManager = new BatchedStyleManager();

function useBatchedStyle(className, styles) {
  useInsertionEffect(() => {
    batchedStyleManager.scheduleUpdate(className, styles);
  }, [className, JSON.stringify(styles)]);
  
  return className;
}
```

## 第五部分：与流行库集成

### 5.1 简化的styled-components实现

```jsx
function createStyledComponent(tag, styles) {
  return function StyledComponent({ children, ...props }) {
    const className = useMemo(() => `styled-${Math.random().toString(36).substr(2, 9)}`, []);
    
    useInsertionEffect(() => {
      const styleElement = document.createElement('style');
      styleElement.id = `style-${className}`;
      
      // 处理模板字符串
      const cssText = typeof styles === 'function' ? styles(props) : styles;
      
      styleElement.textContent = `.${className} {\n${cssText}\n}`;
      document.head.appendChild(styleElement);
      
      return () => {
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      };
    }, [className, JSON.stringify(props)]);
    
    return React.createElement(tag, { ...props, className }, children);
  };
}

// 使用
const StyledButton = createStyledComponent('button', (props) => `
  padding: 12px 24px;
  background-color: ${props.primary ? '#3498db' : '#95a5a6'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props.primary ? '#2980b9' : '#7f8c8d'};
    transform: translateY(-2px);
  }
`);

function StyledComponentExample() {
  return (
    <div>
      <StyledButton primary>主要按钮</StyledButton>
      <StyledButton>普通按钮</StyledButton>
    </div>
  );
}
```

### 5.2 Emotion风格的css函数

```jsx
function css(styles) {
  const className = `css-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    className,
    styles
  };
}

function useCss(cssObject) {
  const { className, styles } = cssObject;
  
  useInsertionEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = `style-${className}`;
    
    let cssText = '';
    
    if (typeof styles === 'object') {
      cssText = Object.entries(styles)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `  ${cssProp}: ${value};`;
        })
        .join('\n');
    } else {
      cssText = styles;
    }
    
    styleElement.textContent = `.${className} {\n${cssText}\n}`;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [className]);
  
  return className;
}

// 使用
function EmotionStyleExample() {
  const buttonStyles = css({
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  });
  
  const className = useCss(buttonStyles);
  
  return (
    <button className={className}>
      Emotion风格按钮
    </button>
  );
}
```

## 第六部分：TypeScript集成

### 6.1 类型安全的样式系统

```typescript
import { CSSProperties, useInsertionEffect, useMemo } from 'react';

type StyleObject = CSSProperties;

interface StyledConfig {
  base?: StyleObject;
  hover?: StyleObject;
  active?: StyleObject;
  focus?: StyleObject;
  media?: Record<string, StyleObject>;
}

class TypedStyleManager {
  private cache = new Map<string, string>();
  private counter = 0;
  
  generateClassName(prefix: string = 'css'): string {
    return `${prefix}-${++this.counter}`;
  }
  
  insertStyle(className: string, config: StyledConfig): void {
    const styleElement = document.createElement('style');
    styleElement.id = `style-${className}`;
    
    let cssText = '';
    
    // 基础样式
    if (config.base) {
      cssText += this.objectToCSS(className, config.base);
    }
    
    // 伪类样式
    if (config.hover) {
      cssText += this.objectToCSS(`${className}:hover`, config.hover);
    }
    
    if (config.active) {
      cssText += this.objectToCSS(`${className}:active`, config.active);
    }
    
    if (config.focus) {
      cssText += this.objectToCSS(`${className}:focus`, config.focus);
    }
    
    // 媒体查询
    if (config.media) {
      for (const [query, styles] of Object.entries(config.media)) {
        cssText += `@media ${query} {\n${this.objectToCSS(className, styles)}}\n\n`;
      }
    }
    
    styleElement.textContent = cssText;
    document.head.appendChild(styleElement);
  }
  
  private objectToCSS(selector: string, styles: StyleObject): string {
    const cssProps = Object.entries(styles)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
        return `  ${cssProp}: ${value};`;
      })
      .join('\n');
    
    return `.${selector} {\n${cssProps}\n}\n\n`;
  }
  
  removeStyle(className: string): void {
    const styleElement = document.getElementById(`style-${className}`);
    if (styleElement && document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
    }
  }
}

const typedStyleManager = new TypedStyleManager();

function useTypedStyle(config: StyledConfig): string {
  const className = useMemo(() => typedStyleManager.generateClassName(), []);
  
  useInsertionEffect(() => {
    typedStyleManager.insertStyle(className, config);
    
    return () => {
      typedStyleManager.removeStyle(className);
    };
  }, [className, config]);
  
  return className;
}

// 使用
function TypedButton() {
  const className = useTypedStyle({
    base: {
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    hover: {
      backgroundColor: '#2980b9'
    },
    active: {
      transform: 'scale(0.98)'
    },
    media: {
      '(max-width: 768px)': {
        padding: '10px 20px',
        fontSize: '14px'
      }
    }
  });
  
  return <button className={className}>类型安全按钮</button>;
}
```

### 6.2 泛型样式组件

```typescript
interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
}

interface Theme {
  colors: ThemeColors;
  spacing: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

type ThemedStyleFactory<P = {}> = (theme: Theme, props: P) => StyleObject;

function createThemedComponent<P = {}>(
  tag: keyof JSX.IntrinsicElements,
  styleFactory: ThemedStyleFactory<P>
) {
  return function ThemedComponent(props: P & { theme: Theme; children?: React.ReactNode }) {
    const { theme, children, ...restProps } = props;
    
    const className = useMemo(() => `themed-${Math.random().toString(36).substr(2, 9)}`, []);
    
    useInsertionEffect(() => {
      const styles = styleFactory(theme, restProps as P);
      
      const cssText = Object.entries(styles)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          return `  ${cssProp}: ${value};`;
        })
        .join('\n');
      
      const styleElement = document.createElement('style');
      styleElement.id = `style-${className}`;
      styleElement.textContent = `.${className} {\n${cssText}\n}`;
      
      document.head.appendChild(styleElement);
      
      return () => {
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      };
    }, [className, theme, restProps]);
    
    return React.createElement(tag, { ...restProps, className }, children);
  };
}

// 使用
interface ButtonProps {
  variant?: keyof ThemeColors;
  size?: 'sm' | 'md' | 'lg';
}

const ThemedButton = createThemedComponent<ButtonProps>(
  'button',
  (theme, props) => ({
    padding: theme.spacing[props.size || 'md'],
    backgroundColor: theme.colors[props.variant || 'primary'],
    color: 'white',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer'
  })
);

const myTheme: Theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    success: '#27ae60',
    danger: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db'
  },
  spacing: {
    sm: '8px 16px',
    md: '12px 24px',
    lg: '16px 32px',
    xl: '20px 40px'
  },
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px'
  }
};

function ThemeExample() {
  return (
    <div>
      <ThemedButton theme={myTheme} variant="primary" size="md">
        主要按钮
      </ThemedButton>
      <ThemedButton theme={myTheme} variant="danger" size="lg">
        危险按钮
      </ThemedButton>
    </div>
  );
}
```

## 注意事项

### 1. 只用于CSS注入

```jsx
// ✅ 正确：注入CSS
function GoodUsage() {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = '.my-class { color: red; }';
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);
  
  return <div className="my-class">文本</div>;
}

// ❌ 错误：用于其他副作用
function BadUsage() {
  useInsertionEffect(() => {
    // 不要用于数据获取
    fetch('/api/data');
    
    // 不要用于订阅
    const subscription = subscribe();
    
    // 不要用于日志
    console.log('Component mounted');
  }, []);
  
  return <div>Component</div>;
}
```

### 2. 不能读取DOM

```jsx
// ❌ 错误：在useInsertionEffect中读取DOM
function WrongDOMRead() {
  const ref = useRef(null);
  
  useInsertionEffect(() => {
    // DOM还未更新，无法读取
    const width = ref.current?.offsetWidth; // undefined
  }, []);
  
  return <div ref={ref}>Content</div>;
}

// ✅ 正确：使用useLayoutEffect读取DOM
function CorrectDOMRead() {
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    // DOM已更新，可以读取
    const width = ref.current?.offsetWidth;
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

### 3. 避免性能问题

```jsx
// ❌ 不好：每次都创建新style
function IneffectiveStyle() {
  const [color, setColor] = useState('red');
  
  useInsertionEffect(() => {
    // 每次都创建新的style元素
    const style = document.createElement('style');
    style.textContent = `.box { color: ${color}; }`;
    document.head.appendChild(style);
    
    // 没有清理，会累积style元素
  }, [color]);
  
  return <div className="box">Text</div>;
}

// ✅ 好：复用或清理style
function EfficientStyle() {
  const [color, setColor] = useState('red');
  
  useInsertionEffect(() => {
    let style = document.getElementById('box-style');
    
    if (!style) {
      style = document.createElement('style');
      style.id = 'box-style';
      document.head.appendChild(style);
    }
    
    style.textContent = `.box { color: ${color}; }`;
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [color]);
  
  return <div className="box">Text</div>;
}
```

### 4. SSR兼容性

```jsx
// ⚠️ useInsertionEffect在服务器端不执行
function SSRComponent() {
  useInsertionEffect(() => {
    // 这段代码在服务器端不会执行
    const style = document.createElement('style');
    style.textContent = '.my-class { color: red; }';
    document.head.appendChild(style);
  }, []);
  
  return <div className="my-class">Text</div>;
  // 服务器端渲染时没有样式
  // 客户端hydrate后样式才注入
}

// ✅ 对于SSR，考虑预先生成样式
function SSRSafeComponent() {
  // 在构建时生成CSS文件
  // 或使用SSR友好的CSS-in-JS库
  
  return <div className="my-class">Text</div>;
}
```

### 5. 与其他Effect配合

```jsx
function CombinedEffects() {
  const [count, setCount] = useState(0);
  
  // 1. 注入样式（最早）
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.id = 'counter-style';
    style.textContent = `.counter { font-size: ${20 + count}px; }`;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [count]);
  
  // 2. DOM测量（在样式注入后）
  useLayoutEffect(() => {
    // 此时样式已注入，可以测量
    const element = document.querySelector('.counter');
    const size = element?.getBoundingClientRect();
    console.log('Size:', size);
  }, [count]);
  
  // 3. 其他副作用（最后）
  useEffect(() => {
    console.log('Count changed to:', count);
  }, [count]);
  
  return (
    <div>
      <div className="counter">{count}</div>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}
```

## 常见问题

### 1. useInsertionEffect vs useLayoutEffect？

选择标准：

```jsx
// useInsertionEffect：只用于CSS注入
function StyleInjection() {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = '.my-class { color: red; }';
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);
  
  return <div className="my-class">Text</div>;
}

// useLayoutEffect：用于DOM测量和同步更新
function DOMManipulation() {
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    const width = ref.current.offsetWidth;
    console.log('Width:', width);
  }, []);
  
  return <div ref={ref}>Content</div>;
}
```

### 2. 如何避免样式累积？

使用ID或清理函数：

```jsx
function AvoidStyleAccumulation() {
  const [color, setColor] = useState('red');
  
  useInsertionEffect(() => {
    // 方案1：使用固定ID
    let style = document.getElementById('my-style');
    
    if (!style) {
      style = document.createElement('style');
      style.id = 'my-style';
      document.head.appendChild(style);
    }
    
    style.textContent = `.my-class { color: ${color}; }`;
    
    // 方案2：清理函数
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [color]);
  
  return <div className="my-class">Text</div>;
}
```

### 3. 如何优化大量组件的样式？

使用样式缓存：

```jsx
// 参考前面的OptimizedStyleManager示例
// 相同样式的组件会共享同一个style元素
```

### 4. 可以在useInsertionEffect中使用state吗？

可以读取，但要小心：

```jsx
function StateInInsertion() {
  const [color, setColor] = useState('red');
  
  useInsertionEffect(() => {
    // ✅ 可以读取state
    const style = document.createElement('style');
    style.textContent = `.box { color: ${color}; }`;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, [color]); // 依赖state
  
  return (
    <div>
      <div className="box">Text</div>
      <button onClick={() => setColor('blue')}>Change Color</button>
    </div>
  );
}
```

## 总结

### useInsertionEffect核心要点

1. **主要用途**
   - CSS-in-JS库的样式注入
   - 避免样式闪烁和布局抖动
   - 在DOM变更前注入样式

2. **执行时机**
   - 在所有DOM变更之前
   - 在useLayoutEffect之前
   - 在React读取布局之前

3. **使用限制**
   - 只用于CSS注入
   - 不能读取DOM布局
   - 不能用于其他副作用

4. **最佳实践**
   - 使用style元素ID避免重复
   - 提供清理函数
   - 缓存相同样式
   - 批量更新样式

5. **性能优化**
   - 样式缓存和复用
   - 引用计数管理
   - 批量DOM操作
   - 避免不必要的重渲染

6. **与其他Effect对比**
   - useInsertionEffect: CSS注入（最早）
   - useLayoutEffect: DOM测量（中间）
   - useEffect: 副作用（最晚）

7. **适用场景**
   - CSS-in-JS库开发
   - 动态主题系统
   - 运行时样式生成
   - 样式隔离

通过本章学习，你已经全面掌握了useInsertionEffect的使用。这是一个专门为CSS-in-JS库设计的Hook，在一般应用开发中很少直接使用，但对于构建样式库和主题系统非常有用。记住：只在需要动态注入CSS时使用useInsertionEffect，其他情况使用useLayoutEffect或useEffect！
