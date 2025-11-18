# Styled-Components基础

## 概述

Styled-Components是React中最流行的CSS-in-JS解决方案之一。它允许你使用JavaScript编写CSS,将样式与组件紧密结合,同时提供了动态样式、主题支持、自动厂商前缀等强大功能。本文将全面介绍Styled-Components的基础知识和核心特性。

## 安装和配置

### 基础安装

```bash
# 使用npm
npm install styled-components

# 使用yarn
yarn add styled-components

# 使用pnpm
pnpm add styled-components
```

### TypeScript支持

```bash
# 安装类型定义
npm install -D @types/styled-components

# 或者在TypeScript项目中使用官方类型
npm install styled-components
```

```typescript
// styled.d.ts - 扩展主题类型
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
    };
    breakpoints: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  }
}
```

### Babel插件（可选）

```bash
# 安装Babel插件
npm install -D babel-plugin-styled-components
```

```javascript
// .babelrc或babel.config.js
{
  "plugins": [
    [
      "babel-plugin-styled-components",
      {
        "displayName": true, // 显示组件名
        "fileName": true, // 显示文件名
        "ssr": true, // 支持SSR
        "minify": true, // 压缩样式
        "transpileTemplateLiterals": true, // 转译模板字符串
        "pure": true // 移除未使用的样式
      }
    ]
  ]
}
```

## 基础语法

### 创建样式组件

```jsx
import styled from 'styled-components';

// 基础样式组件
const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:active {
    background-color: #1d4ed8;
  }
`;

// 使用
function App() {
  return <Button>Click me</Button>;
}

// 扩展样式组件
const PrimaryButton = styled(Button)`
  background-color: #10b981;
  
  &:hover {
    background-color: #059669;
  }
`;

// 基于其他元素创建
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #6b7280;
`;
```

### Props传递

```jsx
// 基于Props的动态样式
const Button = styled.button`
  background-color: ${props => props.primary ? '#3b82f6' : '#6b7280'};
  color: white;
  padding: ${props => {
    switch(props.size) {
      case 'small': return '0.25rem 0.5rem';
      case 'large': return '0.75rem 1.5rem';
      default: return '0.5rem 1rem';
    }
  }};
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    background-color: ${props => props.primary ? '#2563eb' : '#4b5563'};
  }
`;

// 使用
function App() {
  return (
    <>
      <Button primary>Primary Button</Button>
      <Button>Secondary Button</Button>
      <Button primary size="small">Small</Button>
      <Button primary size="large">Large</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}

// TypeScript版本
interface ButtonProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const TypedButton = styled.button<ButtonProps>`
  background-color: ${props => props.primary ? '#3b82f6' : '#6b7280'};
  /* ... */
`;
```

### attrs方法

```jsx
// 使用attrs添加默认属性
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  size: props.size || 20
}))`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// 动态attrs
const PasswordInput = styled.input.attrs({
  type: 'password',
  autoComplete: 'current-password'
})`
  padding: 0.5rem;
  /* ... */
`;

// 函数式attrs
const DynamicInput = styled.input.attrs(props => ({
  placeholder: props.placeholder || 'Enter text...',
  'aria-label': props.label,
  className: props.className
}))`
  /* styles */
`;

// 使用
function Form() {
  return (
    <>
      <Input placeholder="Username" />
      <PasswordInput placeholder="Password" />
      <DynamicInput label="Email" placeholder="your@email.com" />
    </>
  );
}
```

## 样式化现有组件

### 包装第三方组件

```jsx
// 样式化React Router的Link
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }
`;

// 样式化自定义组件
function CustomButton({ className, children, ...props }) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}

const StyledCustomButton = styled(CustomButton)`
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
`;

// 使用as属性改变渲染元素
const Component = styled.div`
  color: red;
`;

function App() {
  return (
    <>
      <Component>Div element</Component>
      <Component as="span">Span element</Component>
      <Component as={Link} to="/">Link element</Component>
    </>
  );
}
```

### 样式继承

```jsx
// 基础组件
const BaseButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
`;

// 继承并扩展
const PrimaryButton = styled(BaseButton)`
  background-color: #3b82f6;
  color: white;
  
  &:hover {
    background-color: #2563eb;
  }
`;

const SecondaryButton = styled(BaseButton)`
  background-color: #6b7280;
  color: white;
  
  &:hover {
    background-color: #4b5563;
  }
`;

const OutlineButton = styled(BaseButton)`
  background-color: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  
  &:hover {
    background-color: #eff6ff;
  }
`;

// 多层继承
const LargeOutlineButton = styled(OutlineButton)`
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
`;
```

## 嵌套和伪类

### CSS嵌套

```jsx
const Card = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  /* 子元素选择器 */
  h2 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #1f2937;
  }
  
  p {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  /* 类选择器 */
  .card-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
  
  /* 嵌套样式组件 */
  ${Button} {
    margin-top: 1rem;
  }
`;

const Container = styled.div`
  /* 嵌套媒体查询 */
  @media (min-width: 768px) {
    max-width: 720px;
  }
  
  @media (min-width: 1024px) {
    max-width: 960px;
  }
  
  /* 嵌套伪类 */
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:first-child {
    margin-top: 0;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;
```

### 伪类和伪元素

```jsx
const FancyButton = styled.button`
  position: relative;
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  overflow: hidden;
  
  /* 伪类 */
  &:hover {
    background: #2563eb;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 伪元素 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:active::before {
    width: 300px;
    height: 300px;
  }
`;

const QuoteBlock = styled.blockquote`
  position: relative;
  padding-left: 2rem;
  font-style: italic;
  color: #4b5563;
  
  &::before {
    content: '"';
    position: absolute;
    left: 0;
    top: 0;
    font-size: 3rem;
    color: #3b82f6;
    line-height: 1;
  }
  
  &::after {
    content: '"';
    font-size: 3rem;
    color: #3b82f6;
  }
`;
```

## 全局样式

### createGlobalStyle

```jsx
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0.5rem;
    font-weight: 600;
    line-height: 1.2;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  button {
    font-family: inherit;
    cursor: pointer;
  }
  
  input, textarea, select {
    font-family: inherit;
  }
`;

// 在App中使用
function App() {
  return (
    <>
      <GlobalStyle />
      <YourComponents />
    </>
  );
}

// 带Props的全局样式
const DynamicGlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.darkMode ? '#1a1a1a' : '#ffffff'};
    color: ${props => props.darkMode ? '#f5f5f5' : '#1a1a1a'};
  }
`;

function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  
  return (
    <>
      <DynamicGlobalStyle darkMode={darkMode} />
      <YourComponents />
    </>
  );
}
```

## CSS辅助函数

### css helper

```jsx
import styled, { css } from 'styled-components';

// 复用CSS片段
const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  ${flexCenter}
  min-height: 100vh;
`;

// 条件样式
const buttonStyles = css`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  
  ${props => props.primary && css`
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  `}
  
  ${props => props.secondary && css`
    background-color: #6b7280;
    color: white;
    
    &:hover {
      background-color: #4b5563;
    }
  `}
  
  ${props => props.outline && css`
    background-color: transparent;
    border: 2px solid ${props.primary ? '#3b82f6' : '#6b7280'};
    color: ${props.primary ? '#3b82f6' : '#6b7280'};
  `}
`;

const Button = styled.button`
  ${buttonStyles}
`;

// 带参数的CSS函数
const truncate = (lines = 1) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Text = styled.p`
  ${truncate(3)}
`;

// 响应式CSS函数
const breakpoint = (size) => (strings, ...values) => css`
  @media (min-width: ${size}) {
    ${css(strings, ...values)}
  }
`;

const desktop = breakpoint('1024px');
const tablet = breakpoint('768px');
const mobile = breakpoint('480px');

const ResponsiveBox = styled.div`
  padding: 1rem;
  
  ${tablet`
    padding: 1.5rem;
  `}
  
  ${desktop`
    padding: 2rem;
  `}
`;
```

### keyframes动画

```jsx
import styled, { keyframes } from 'styled-components';

// 定义关键帧动画
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

// 使用动画
const FadeInBox = styled.div`
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
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

// 动态动画
const slideIn = (direction = 'left') => keyframes`
  from {
    transform: translateX(${direction === 'left' ? '-100%' : '100%'});
  }
  to {
    transform: translateX(0);
  }
`;

const SlideBox = styled.div`
  animation: ${props => slideIn(props.direction)} 0.3s ease-out;
`;

// 使用
function App() {
  return (
    <>
      <FadeInBox>Fade in content</FadeInBox>
      <Spinner />
      <SlideBox direction="right">Slide from right</SlideBox>
    </>
  );
}
```

## 实战案例

### 卡片组件

```jsx
import styled from 'styled-components';

const CardContainer = styled.div`
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
  color: #1f2937;
`;

const CardDescription = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const CardButton = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  
  &:hover {
    background-color: #2563eb;
  }
`;

function Card({ image, title, description, onAction }) {
  return (
    <CardContainer>
      {image && <CardImage src={image} alt={title} />}
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardFooter>
          <CardButton onClick={onAction}>Learn More</CardButton>
        </CardFooter>
      </CardContent>
    </CardContainer>
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

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.error ? '#ef4444' : '#d1d5db'};
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => 
      props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #9ca3af;
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
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Your name"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          placeholder="your@email.com"
        />
        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="message">Message</Label>
        <TextArea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Your message..."
        />
      </FormGroup>
      
      <SubmitButton type="submit">Send Message</SubmitButton>
    </FormContainer>
  );
}
```

## 最佳实践

### 1. 组件命名

```jsx
// 好的命名
const PrimaryButton = styled.button``;
const UserCard = styled.div``;
const NavigationBar = styled.nav``;

// 避免
const Btn = styled.button``;
const Box = styled.div``;
const Nav = styled.nav``;
```

### 2. 样式分离

```jsx
// 将样式定义在组件外部
const Button = styled.button`
  /* styles */
`;

const Container = styled.div`
  /* styles */
`;

function MyComponent() {
  return (
    <Container>
      <Button>Click me</Button>
    </Container>
  );
}
```

### 3. Props验证

```jsx
import PropTypes from 'prop-types';

const Button = styled.button`
  /* styles */
`;

Button.propTypes = {
  primary: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool
};

Button.defaultProps = {
  primary: false,
  size: 'medium',
  disabled: false
};
```

## 总结

Styled-Components基础要点：

1. **基础语法**：使用模板字符串定义样式
2. **动态样式**：通过Props控制样式
3. **样式继承**：扩展和复用样式组件
4. **嵌套语法**：支持CSS嵌套和伪类
5. **全局样式**：使用createGlobalStyle
6. **辅助函数**：css、keyframes等工具
7. **最佳实践**：命名规范、组件分离、类型检查

掌握这些基础知识，就能开始使用Styled-Components构建样式化的React应用。
