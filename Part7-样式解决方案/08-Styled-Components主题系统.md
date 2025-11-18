# Styled-Components主题系统

## 概述

主题系统是Styled-Components最强大的特性之一，它允许你定义一套设计变量（如颜色、字体、间距等），并在整个应用中统一使用。通过主题系统，可以轻松实现主题切换、暗黑模式、品牌定制等功能。本文将深入探讨Styled-Components主题系统的使用方法和最佳实践。

## ThemeProvider基础

### 基础用法

```jsx
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

// 定义主题对象
const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, serif',
    mono: 'Menlo, Monaco, "Courier New", monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  radii: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px',
  },
};

// 使用ThemeProvider包裹应用
function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}

// 在组件中使用主题
const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.radii.md};
  font-family: ${props => props.theme.fonts.sans};
  font-size: ${props => props.theme.fontSizes.base};
  box-shadow: ${props => props.theme.shadows.md};
  border: none;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Card = styled.div`
  background: white;
  padding: ${props => props.theme.spacing.xl};
  border-radius: ${props => props.theme.radii.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing['2xl']};
  }
`;
```

### TypeScript类型定义

```typescript
// theme.ts
export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    // ...
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    // ...
  },
  // ...
} as const;

export type Theme = typeof theme;

// styled.d.ts
import 'styled-components';
import { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

// 使用时会有完整的类型提示
const Button = styled.button`
  color: ${props => props.theme.colors.primary}; // 有类型提示
`;
```

## 主题切换

### 动态主题切换

```jsx
import { ThemeProvider } from 'styled-components';
import { useState } from 'react';

// 定义多个主题
const lightTheme = {
  name: 'light',
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
  },
};

const darkTheme = {
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    background: '#1f2937',
    text: '#f3f4f6',
    border: '#374151',
  },
};

// 主题上下文
import { createContext, useContext } from 'react';

const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// 主题提供者组件
export function AppThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(lightTheme);
  
  const toggleTheme = () => {
    setCurrentTheme(prev => 
      prev.name === 'light' ? darkTheme : lightTheme
    );
  };
  
  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// 主题切换按钮
const ThemeToggle = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
`;

function ThemeToggleButton() {
  const { toggleTheme, theme } = useTheme();
  
  return (
    <ThemeToggle onClick={toggleTheme}>
      {theme.name === 'light' ? '🌙 Dark' : '☀️ Light'}
    </ThemeToggle>
  );
}

// 响应主题的组件
const Container = styled.div`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 2rem;
  transition: all 0.3s ease;
`;
```

### localStorage持久化

```jsx
function AppThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? darkTheme : lightTheme;
  });
  
  const toggleTheme = () => {
    setCurrentTheme(prev => {
      const newTheme = prev.name === 'light' ? darkTheme : lightTheme;
      localStorage.setItem('theme', newTheme.name);
      return newTheme;
    });
  };
  
  // 同步到document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme.name);
  }, [currentTheme]);
  
  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
```

### 系统主题检测

```jsx
function AppThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // 优先使用localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark' ? darkTheme : lightTheme;
    }
    
    // 检测系统主题偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return darkTheme;
    }
    
    return lightTheme;
  });
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setCurrentTheme(e.matches ? darkTheme : lightTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = () => {
    setCurrentTheme(prev => {
      const newTheme = prev.name === 'light' ? darkTheme : lightTheme;
      localStorage.setItem('theme', newTheme.name);
      return newTheme;
    });
  };
  
  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <ThemeProvider theme={currentTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
```

## 高级主题系统

### 多主题支持

```jsx
// 主题定义
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#60a5fa',
      background: '#1f2937',
      text: '#f3f4f6',
    },
  },
  blue: {
    name: 'blue',
    colors: {
      primary: '#0ea5e9',
      background: '#f0f9ff',
      text: '#0c4a6e',
    },
  },
  green: {
    name: 'green',
    colors: {
      primary: '#10b981',
      background: '#f0fdf4',
      text: '#064e3b',
    },
  },
};

// 主题选择器
function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Select
      value={theme.name}
      onChange={(e) => setTheme(themes[e.target.value])}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="blue">Blue</option>
      <option value="green">Green</option>
    </Select>
  );
}

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.25rem;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;
```

### 主题变体

```jsx
// 基础主题
const baseTheme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  fontSizes: {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
  },
};

// 颜色变体
const colorVariants = {
  light: {
    primary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
  },
  dark: {
    primary: '#60a5fa',
    background: '#1f2937',
    text: '#f3f4f6',
  },
};

// 合并主题
const createTheme = (variant) => ({
  ...baseTheme,
  colors: colorVariants[variant],
});

const lightTheme = createTheme('light');
const darkTheme = createTheme('dark');
```

### 主题扩展

```jsx
// 扩展现有主题
const extendedTheme = {
  ...lightTheme,
  components: {
    button: {
      primary: {
        background: lightTheme.colors.primary,
        color: 'white',
        hoverBackground: '#2563eb',
      },
      secondary: {
        background: lightTheme.colors.gray[200],
        color: lightTheme.colors.gray[900],
        hoverBackground: lightTheme.colors.gray[300],
      },
    },
    card: {
      background: 'white',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: lightTheme.spacing.xl,
    },
  },
};

// 使用扩展的主题
const PrimaryButton = styled.button`
  background: ${props => props.theme.components.button.primary.background};
  color: ${props => props.theme.components.button.primary.color};
  
  &:hover {
    background: ${props => props.theme.components.button.primary.hoverBackground};
  }
`;

const Card = styled.div`
  background: ${props => props.theme.components.card.background};
  box-shadow: ${props => props.theme.components.card.shadow};
  padding: ${props => props.theme.components.card.padding};
`;
```

## 主题工具函数

### 颜色处理

```jsx
import { darken, lighten, rgba } from 'polished';

const theme = {
  colors: {
    primary: '#3b82f6',
  },
};

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  
  &:hover {
    background-color: ${props => darken(0.1, props.theme.colors.primary)};
  }
  
  &:active {
    background-color: ${props => darken(0.2, props.theme.colors.primary)};
  }
`;

const SoftButton = styled.button`
  background-color: ${props => rgba(props.theme.colors.primary, 0.1)};
  color: ${props => props.theme.colors.primary};
  
  &:hover {
    background-color: ${props => rgba(props.theme.colors.primary, 0.2)};
  }
`;

// 自定义颜色工具
const getContrastColor = (bgColor) => {
  // 简单的对比度计算
  const color = bgColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

const AutoContrastButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => getContrastColor(props.theme.colors.primary)};
`;
```

### 响应式主题

```jsx
const theme = {
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

// 创建响应式工具
const media = Object.keys(theme.breakpoints).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (min-width: ${theme.breakpoints[label]}) {
      ${css(...args)}
    }
  `;
  return acc;
}, {});

// 使用
const Container = styled.div`
  padding: 1rem;
  
  ${media.tablet`
    padding: 1.5rem;
  `}
  
  ${media.desktop`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  `}
`;

// 另一种方式
const breakpoint = (size) => `@media (min-width: ${theme.breakpoints[size]})`;

const Box = styled.div`
  width: 100%;
  
  ${breakpoint('tablet')} {
    width: 50%;
  }
  
  ${breakpoint('desktop')} {
    width: 33.333%;
  }
`;
```

### 主题getter函数

```jsx
// 创建主题getter
const getThemeValue = (path) => (props) => {
  const keys = path.split('.');
  let value = props.theme;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return undefined;
  }
  
  return value;
};

// 使用
const Button = styled.button`
  color: ${getThemeValue('colors.primary')};
  padding: ${getThemeValue('spacing.md')};
  font-size: ${getThemeValue('fontSizes.base')};
`;

// 带默认值的getter
const getThemeValueOr = (path, defaultValue) => (props) => {
  const value = getThemeValue(path)(props);
  return value !== undefined ? value : defaultValue;
};

const SafeButton = styled.button`
  color: ${getThemeValueOr('colors.primary', '#000')};
`;
```

## 实战案例

### 完整的主题系统

```typescript
// theme/index.ts
export const lightTheme = {
  name: 'light',
  colors: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrast: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrast: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrast: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrast: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrast: '#000000',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrast: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9fafb',
      elevated: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#9ca3af',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, serif',
      mono: 'Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: (factor: number) => `${factor * 0.25}rem`,
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '1rem',
    full: '9999px',
  },
  transitions: {
    duration: {
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
    },
    timing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export const darkTheme: typeof lightTheme = {
  ...lightTheme,
  name: 'dark',
  colors: {
    ...lightTheme.colors,
    primary: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
      contrast: '#000000',
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
      elevated: '#374151',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      disabled: '#6b7280',
    },
    divider: '#374151',
  },
};

// 使用完整主题的组件
const ThemedButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
  background-color: ${props => 
    props.theme.colors[props.variant || 'primary'].main
  };
  color: ${props => 
    props.theme.colors[props.variant || 'primary'].contrast
  };
  padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(4)};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.duration.base} 
              ${props => props.theme.transitions.timing.easeOut};
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => 
      props.theme.colors[props.variant || 'primary'].dark
    };
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
```

### 主题预览器

```jsx
function ThemePreview() {
  const { theme } = useTheme();
  
  return (
    <PreviewContainer>
      <Section>
        <SectionTitle>Colors</SectionTitle>
        <ColorGrid>
          {Object.entries(theme.colors).map(([name, value]) => (
            <ColorItem key={name}>
              <ColorSwatch style={{ backgroundColor: value.main || value }} />
              <ColorName>{name}</ColorName>
              <ColorValue>{value.main || value}</ColorValue>
            </ColorItem>
          ))}
        </ColorGrid>
      </Section>
      
      <Section>
        <SectionTitle>Typography</SectionTitle>
        <div>
          {Object.entries(theme.typography.fontSize).map(([name, value]) => (
            <TypeItem key={name} style={{ fontSize: value }}>
              {name}: {value}
            </TypeItem>
          ))}
        </div>
      </Section>
      
      <Section>
        <SectionTitle>Shadows</SectionTitle>
        <div>
          {Object.entries(theme.shadows).map(([name, value]) => (
            <ShadowItem key={name} style={{ boxShadow: value }}>
              {name}
            </ShadowItem>
          ))}
        </div>
      </Section>
    </PreviewContainer>
  );
}

const PreviewContainer = styled.div`
  padding: ${props => props.theme.spacing(6)};
  background: ${props => props.theme.colors.background.default};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing(8)};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing(4)};
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing(4)};
`;

const ColorItem = styled.div`
  text-align: center;
`;

const ColorSwatch = styled.div`
  width: 100%;
  height: 80px;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing(2)};
`;

const ColorName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const ColorValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;
```

## 最佳实践

### 1. 主题结构设计

```typescript
// 良好的主题结构
const theme = {
  // 设计令牌
  palette: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
  },
  
  // 语义化颜色
  semantic: {
    success: '#10b981',
    error: '#ef4444',
  },
  
  // 组件特定样式
  components: {
    button: {
      // ...
    },
  },
};
```

### 2. 主题版本管理

```typescript
// 版本化主题
export const themes = {
  v1: {
    version: 1,
    // v1 theme
  },
  v2: {
    version: 2,
    // v2 theme with migration
  },
};

// 主题迁移
const migrateTheme = (oldTheme, targetVersion) => {
  // Migration logic
};
```

### 3. 性能优化

```jsx
// 避免在render中创建主题对象
// ❌ 不好
function App() {
  const theme = { colors: { primary: '#3b82f6' } };
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}

// ✅ 好
const theme = { colors: { primary: '#3b82f6' } };
function App() {
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}

// ✅ 动态主题使用useMemo
function App() {
  const [isDark, setIsDark] = useState(false);
  
  const theme = useMemo(() => 
    isDark ? darkTheme : lightTheme,
    [isDark]
  );
  
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}
```

## 总结

Styled-Components主题系统要点：

1. **ThemeProvider**：提供主题上下文
2. **主题切换**：支持多主题和暗黑模式
3. **持久化**：localStorage和系统主题检测
4. **高级特性**：主题扩展、变体、工具函数
5. **TypeScript**：完整的类型定义
6. **最佳实践**：结构设计、版本管理、性能优化

掌握主题系统能够构建灵活、可定制的React应用。
