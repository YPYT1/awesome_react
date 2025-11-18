# Emotion库使用

## 概述

Emotion是一个高性能的CSS-in-JS库,设计用于用JavaScript编写CSS样式。与Styled-Components类似,但提供了更灵活的API和更好的性能。Emotion支持多种样式编写方式,包括styled API、css prop和对象样式,是React生态中另一个强大的样式解决方案。

## 安装和配置

### 基础安装

```bash
# 核心包
npm install @emotion/react

# styled API
npm install @emotion/styled

# 或同时安装
npm install @emotion/react @emotion/styled
```

### Babel配置（可选）

```bash
# 安装Babel插件
npm install -D @emotion/babel-plugin
```

```javascript
// .babelrc
{
  "plugins": ["@emotion/babel-plugin"]
}

// 或babel.config.js
module.exports = {
  plugins: ['@emotion/babel-plugin']
}
```

### TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@emotion/react"
  }
}
```

```typescript
// 声明文件
/// <reference types="@emotion/react/types/css-prop" />
```

## 核心API

### css prop

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

// 模板字符串方式
function Component() {
  return (
    <div css={css`
      color: #3b82f6;
      padding: 1rem;
      background: white;
      border-radius: 0.5rem;
      
      &:hover {
        background: #f3f4f6;
      }
    `}>
      Content
    </div>
  );
}

// 对象样式方式
function ObjectStyleComponent() {
  return (
    <div css={{
      color: '#3b82f6',
      padding: '1rem',
      background: 'white',
      borderRadius: '0.5rem',
      '&:hover': {
        background: '#f3f4f6',
      }
    }}>
      Content
    </div>
  );
}

// 组合样式
const baseStyles = css`
  padding: 1rem;
  border-radius: 0.5rem;
`;

const primaryStyles = css`
  ${baseStyles}
  background: #3b82f6;
  color: white;
`;

const secondaryStyles = css({
  ...baseStyles,
  background: '#6b7280',
  color: 'white',
});

function ComposedComponent() {
  return (
    <>
      <div css={primaryStyles}>Primary</div>
      <div css={secondaryStyles}>Secondary</div>
    </>
  );
}
```

### styled API

```jsx
import styled from '@emotion/styled';

// 基础使用
const Button = styled.button`
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
  }
`;

// Props传递
const DynamicButton = styled.button`
  background: ${props => props.primary ? '#3b82f6' : '#6b7280'};
  color: white;
  padding: ${props => {
    switch(props.size) {
      case 'small': return '0.25rem 0.5rem';
      case 'large': return '0.75rem 1.5rem';
      default: return '0.5rem 1rem';
    }
  }};
  opacity: ${props => props.disabled ? 0.5 : 1};
`;

// TypeScript支持
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const TypedButton = styled.button<ButtonProps>`
  padding: ${props => props.size === 'large' ? '1rem 2rem' : '0.5rem 1rem'};
  background: ${props => props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
  color: white;
`;

// 对象样式
const ObjectButton = styled.button(props => ({
  background: props.primary ? '#3b82f6' : '#6b7280',
  color: 'white',
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '0.25rem',
  '&:hover': {
    opacity: 0.9,
  },
}));

// 样式继承
const BaseButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
`;

const PrimaryButton = styled(BaseButton)`
  background: #3b82f6;
  color: white;
`;

const OutlineButton = styled(BaseButton)`
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
`;
```

### Global Styles

```jsx
import { Global, css } from '@emotion/react';

// 全局样式组件
function GlobalStyles() {
  return (
    <Global
      styles={css`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
        }
        
        h1, h2, h3, h4, h5, h6 {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        
        a {
          color: #3b82f6;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      `}
    />
  );
}

// 在App中使用
function App() {
  return (
    <>
      <GlobalStyles />
      <YourComponents />
    </>
  );
}

// 对象样式
function GlobalObjectStyles() {
  return (
    <Global
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        body: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: 1.6,
          color: '#1f2937',
        },
      }}
    />
  );
}

// 动态全局样式
function DynamicGlobalStyles({ darkMode }) {
  return (
    <Global
      styles={css`
        body {
          background: ${darkMode ? '#1f2937' : '#ffffff'};
          color: ${darkMode ? '#f3f4f6' : '#1f2937'};
        }
      `}
    />
  );
}
```

## 主题系统

### ThemeProvider

```jsx
import { ThemeProvider } from '@emotion/react';

const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
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
  },
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Menlo, Monaco, "Courier New", monospace',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}

// 使用主题 - css prop
function ThemedComponent() {
  return (
    <div css={(theme) => css`
      color: ${theme.colors.primary};
      padding: ${theme.spacing.md};
      font-family: ${theme.fonts.sans};
    `}>
      Themed Content
    </div>
  );
}

// 使用主题 - styled
const ThemedButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.md};
  font-family: ${props => props.theme.fonts.sans};
`;

// 使用主题 - 对象样式
function ObjectThemedComponent() {
  return (
    <div css={(theme) => ({
      color: theme.colors.primary,
      padding: theme.spacing.md,
    })}>
      Content
    </div>
  );
}
```

### useTheme Hook

```jsx
import { useTheme } from '@emotion/react';

function Component() {
  const theme = useTheme();
  
  return (
    <div css={{
      color: theme.colors.primary,
      padding: theme.spacing.md,
    }}>
      {/* 在JS中使用主题 */}
      <span style={{ color: theme.colors.secondary }}>
        Secondary Color
      </span>
    </div>
  );
}

// 主题切换
function ThemeToggleExample() {
  const [isDark, setIsDark] = React.useState(false);
  
  const lightTheme = {
    colors: {
      background: '#ffffff',
      text: '#1f2937',
    },
  };
  
  const darkTheme = {
    colors: {
      background: '#1f2937',
      text: '#f3f4f6',
    },
  };
  
  const currentTheme = isDark ? darkTheme : lightTheme;
  
  return (
    <ThemeProvider theme={currentTheme}>
      <div css={(theme) => ({
        background: theme.colors.background,
        color: theme.colors.text,
        padding: '2rem',
      })}>
        <button onClick={() => setIsDark(!isDark)}>
          Toggle Theme
        </button>
      </div>
    </ThemeProvider>
  );
}
```

## 动画和关键帧

### keyframes

```jsx
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// 定义动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// 使用动画 - styled
const FadeInDiv = styled.div`
  animation: ${fadeIn} 0.5s ease-in;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const PulseButton = styled.button`
  animation: ${pulse} 2s ease-in-out infinite;
`;

// 使用动画 - css prop
function AnimatedComponent() {
  return (
    <div css={css`
      animation: ${fadeIn} 0.5s ease-in;
    `}>
      Animated Content
    </div>
  );
}

// 条件动画
const ConditionalAnimation = styled.div`
  ${props => props.animate && css`
    animation: ${fadeIn} 0.5s ease-in;
  `}
`;

// 动态动画参数
const slideIn = (direction) => keyframes`
  from {
    transform: translateX(${direction === 'left' ? '-100%' : '100%'});
  }
  to {
    transform: translateX(0);
  }
`;

const SlideInDiv = styled.div`
  animation: ${props => slideIn(props.direction)} 0.3s ease-out;
`;
```

## 性能优化

### cx函数

```jsx
import { cx } from '@emotion/css';

// 组合类名
function Component() {
  const baseClass = css`
    padding: 1rem;
    border-radius: 0.5rem;
  `;
  
  const activeClass = css`
    background: #3b82f6;
    color: white;
  `;
  
  const isActive = true;
  
  return (
    <div className={cx(baseClass, isActive && activeClass)}>
      Content
    </div>
  );
}

// 条件类名
function ConditionalClassName({ variant }) {
  const variants = {
    primary: css`
      background: #3b82f6;
      color: white;
    `,
    secondary: css`
      background: #6b7280;
      color: white;
    `,
  };
  
  return (
    <div className={cx(variants[variant])}>
      Content
    </div>
  );
}
```

### 样式缓存

```jsx
import { cache } from '@emotion/css';
import { CacheProvider } from '@emotion/react';

// 自定义缓存
const myCache = cache({
  key: 'my-app',
  prepend: true, // 在head开始插入样式
});

function App() {
  return (
    <CacheProvider value={myCache}>
      <YourApp />
    </CacheProvider>
  );
}

// 服务端渲染缓存
import createCache from '@emotion/cache';

const serverCache = createCache({ key: 'ssr' });
```

## 媒体查询

### 响应式样式

```jsx
// 基础媒体查询
const ResponsiveDiv = styled.div`
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

// 断点工具
const breakpoints = {
  mobile: '@media (min-width: 480px)',
  tablet: '@media (min-width: 768px)',
  desktop: '@media (min-width: 1024px)',
};

const Container = styled.div`
  width: 100%;
  
  ${breakpoints.tablet} {
    width: 750px;
  }
  
  ${breakpoints.desktop} {
    width: 970px;
  }
`;

// 媒体查询函数
const mq = (breakpoint) => `@media (min-width: ${breakpoint})`;

const FlexibleBox = styled.div`
  display: flex;
  flex-direction: column;
  
  ${mq('768px')} {
    flex-direction: row;
  }
`;

// 对象样式媒体查询
function ObjectMediaQuery() {
  return (
    <div css={{
      padding: '1rem',
      '@media (min-width: 768px)': {
        padding: '1.5rem',
      },
      '@media (min-width: 1024px)': {
        padding: '2rem',
      },
    }}>
      Responsive Content
    </div>
  );
}

// Facepaint库集成
import facepaint from 'facepaint';

const mq = facepaint([
  '@media(min-width: 420px)',
  '@media(min-width: 920px)',
  '@media(min-width: 1120px)',
]);

function FacepaintExample() {
  return (
    <div
      css={mq({
        color: ['red', 'green', 'blue', 'darkorange'],
        fontSize: [12, 16, 20, 24],
      })}
    >
      Facepaint Media Queries
    </div>
  );
}
```

## 实战案例

### 卡片组件

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const Card = styled.div`
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

function ProductCard({ image, title, description, price }) {
  return (
    <Card>
      <CardImage src={image} alt={title} />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div css={(theme) => ({
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: theme.colors.primary,
        })}>
          ${price}
        </div>
        <CardActions>
          <button css={css`
            background: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
            
            &:hover {
              background: #2563eb;
            }
          `}>
            Add to Cart
          </button>
        </CardActions>
      </CardContent>
    </Card>
  );
}
```

### 表单组件

```jsx
const FormContainer = styled.form`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
`;

const inputStyles = (error) => css`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${error ? '#ef4444' : '#d1d5db'};
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${error ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = React.useState({});
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="name">Name</Label>
        <input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          css={inputStyles(errors.name)}
          placeholder="Your name"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          css={inputStyles(errors.email)}
          placeholder="your@email.com"
        />
        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
      </FormGroup>
      
      <SubmitButton type="submit">Send Message</SubmitButton>
    </FormContainer>
  );
}
```

## Emotion vs Styled-Components

### 对比

```jsx
// Emotion的优势
// 1. 更小的包体积
// 2. 更好的性能
// 3. 支持css prop
// 4. 对象样式语法
// 5. 更灵活的API

// Emotion css prop
function EmotionExample() {
  return (
    <div css={{ color: 'red', padding: '1rem' }}>
      CSS Prop
    </div>
  );
}

// Styled-Components需要创建组件
const StyledDiv = styled.div`
  color: red;
  padding: 1rem;
`;

function StyledComponentsExample() {
  return <StyledDiv>Styled Component</StyledDiv>;
}

// 性能对比
// Emotion支持组件样式提取
// 更好的代码分割
// 更小的运行时开销
```

## 最佳实践

### 1. 组件样式组织

```jsx
// 推荐：将样式定义在组件外部
const Button = styled.button`
  /* styles */
`;

function Component() {
  return <Button>Click me</Button>;
}

// 避免：在render中定义样式
function Component() {
  // ❌ 每次render都会创建新样式
  const Button = styled.button`
    /* styles */
  `;
  return <Button>Click me</Button>;
}
```

### 2. CSS Prop vs Styled

```jsx
// 使用css prop：一次性样式
function OneTimeStyle() {
  return (
    <div css={{ padding: '1rem', color: 'blue' }}>
      One-time styled
    </div>
  );
}

// 使用styled：可复用组件
const ReusableButton = styled.button`
  padding: 1rem;
  color: blue;
`;

function MultipleUses() {
  return (
    <>
      <ReusableButton>Button 1</ReusableButton>
      <ReusableButton>Button 2</ReusableButton>
    </>
  );
}
```

### 3. 性能优化

```jsx
// ✅ 使用useMemo缓存样式
function OptimizedComponent({ color }) {
  const styles = useMemo(() => css`
    color: ${color};
    padding: 1rem;
  `, [color]);
  
  return <div css={styles}>Content</div>;
}

// ❌ 避免在render中创建样式
function UnoptimizedComponent({ color }) {
  return (
    <div css={css`
      color: ${color};
      padding: 1rem;
    `}>
      Content
    </div>
  );
}
```

## 总结

Emotion库使用要点：

1. **多种API**：css prop、styled、对象样式
2. **主题系统**：ThemeProvider和useTheme
3. **动画支持**：keyframes和动态动画
4. **性能优化**：样式缓存、cx函数
5. **响应式**：媒体查询和断点工具
6. **对比优势**：更灵活、性能更好
7. **最佳实践**：组件组织、API选择、性能优化

Emotion提供了比Styled-Components更灵活的样式解决方案,适合追求性能和灵活性的项目。
