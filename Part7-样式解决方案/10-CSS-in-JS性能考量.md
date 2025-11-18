# CSS-in-JS性能考量

## 概述

CSS-in-JS虽然提供了强大的样式管理能力,但也带来了一些性能挑战。运行时样式生成、动态样式注入、类名哈希计算等操作都可能影响应用性能。本文将深入探讨CSS-in-JS的性能问题,并提供优化策略和最佳实践。

## 性能问题分析

### 运行时开销

```jsx
// 问题：每次render都会重新计算样式
function UnoptimizedComponent({ color, size }) {
  return (
    <div css={css`
      color: ${color};
      font-size: ${size}px;
      padding: 1rem;
      /* 每次render都会重新解析这个模板字符串 */
    `}>
      Content
    </div>
  );
}

// 问题：在render中创建styled组件
function BadComponent() {
  const StyledDiv = styled.div`
    color: red;
  `;
  
  return <StyledDiv>每次render都创建新组件</StyledDiv>;
}

// 优化：将styled组件提取到外部
const StyledDiv = styled.div`
  color: red;
`;

function GoodComponent() {
  return <StyledDiv>组件只创建一次</StyledDiv>;
}

// 优化：使用useMemo缓存动态样式
function OptimizedComponent({ color, size }) {
  const dynamicStyles = useMemo(() => css`
    color: ${color};
    font-size: ${size}px;
  `, [color, size]);
  
  const staticStyles = css`
    padding: 1rem;
    border-radius: 0.5rem;
  `;
  
  return (
    <div css={[staticStyles, dynamicStyles]}>
      Content
    </div>
  );
}
```

### 样式注入成本

```jsx
// 问题：大量动态样式注入
function ManyDynamicStyles({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          css={css`
            color: ${item.color};
            background: ${item.background};
            /* 每个item都会注入新样式到DOM */
          `}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

// 优化：使用CSS变量减少样式注入
const DynamicItem = styled.div`
  color: var(--item-color);
  background: var(--item-bg);
`;

function OptimizedDynamicStyles({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <DynamicItem
          key={index}
          style={{
            '--item-color': item.color,
            '--item-bg': item.background,
          }}
        >
          {item.text}
        </DynamicItem>
      ))}
    </div>
  );
}

// 优化：预定义样式变体
const variantStyles = {
  primary: css`
    color: #3b82f6;
    background: #eff6ff;
  `,
  success: css`
    color: #10b981;
    background: #f0fdf4;
  `,
  danger: css`
    color: #ef4444;
    background: #fef2f2;
  `,
};

function VariantOptimized({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          css={variantStyles[item.variant]}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
```

### 类名生成开销

```jsx
// 问题：复杂的类名计算
function ComplexClassNames({ variant, size, active, disabled }) {
  const className = `
    ${baseClass}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${active ? activeClass : ''}
    ${disabled ? disabledClass : ''}
  `.trim();
  
  return <div className={className}>Content</div>;
}

// 优化：使用clsx/classnames库
import clsx from 'clsx';

function OptimizedClassNames({ variant, size, active, disabled }) {
  return (
    <div className={clsx(
      baseClass,
      variantClasses[variant],
      sizeClasses[size],
      active && activeClass,
      disabled && disabledClass
    )}>
      Content
    </div>
  );
}

// 优化：预计算常用组合
const precomputedClasses = {
  'primary-large': clsx(baseClass, variantClasses.primary, sizeClasses.large),
  'secondary-small': clsx(baseClass, variantClasses.secondary, sizeClasses.small),
};

function PrecomputedClassNames({ combination }) {
  return (
    <div className={precomputedClasses[combination]}>
      Content
    </div>
  );
}
```

## 性能优化策略

### 静态提取

```jsx
// Linaria - 零运行时CSS-in-JS
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

// 编译时提取为CSS文件
const title = css`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
`;

const Button = styled.button`
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
`;

function Component() {
  return (
    <>
      <h1 className={title}>Title</h1>
      <Button>Click me</Button>
    </>
  );
}

// Vanilla Extract - TypeScript类型安全的零运行时方案
import { style } from '@vanilla-extract/css';

export const button = style({
  backgroundColor: '#3b82f6',
  color: 'white',
  padding: '0.5rem 1rem',
  borderRadius: '0.25rem',
});

// 使用
function VanillaExtractComponent() {
  return <button className={button}>Click me</button>;
}
```

### 样式缓存

```jsx
// Styled-Components缓存优化
import styled from 'styled-components';
import { useMemo } from 'react';

// 方式1：使用attrs减少重新渲染
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  size: props.size || 20,
}))`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
`;

// 方式2：缓存动态props
const DynamicButton = styled.button`
  background: ${props => props.color};
  color: white;
`;

function CachedPropsComponent({ items }) {
  const memoizedButtons = useMemo(() => 
    items.map(item => ({
      id: item.id,
      color: item.color,
    })),
    [items]
  );
  
  return (
    <>
      {memoizedButtons.map(item => (
        <DynamicButton key={item.id} color={item.color}>
          Button
        </DynamicButton>
      ))}
    </>
  );
}

// Emotion缓存配置
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

const myCache = createCache({
  key: 'my-app',
  prepend: true,
  // 启用样式缓存
  container: document.querySelector('head'),
});

function App() {
  return (
    <CacheProvider value={myCache}>
      <YourApp />
    </CacheProvider>
  );
}
```

### 减少样式重计算

```jsx
// 使用CSS变量替代动态props
const Container = styled.div`
  background-color: var(--bg-color, #ffffff);
  color: var(--text-color, #000000);
  padding: var(--spacing, 1rem);
`;

function CSSVariableComponent({ bgColor, textColor, spacing }) {
  return (
    <Container
      style={{
        '--bg-color': bgColor,
        '--text-color': textColor,
        '--spacing': spacing,
      }}
    >
      Content
    </Container>
  );
}

// 预定义主题变体
const themes = {
  light: css`
    --bg-color: #ffffff;
    --text-color: #1f2937;
  `,
  dark: css`
    --bg-color: #1f2937;
    --text-color: #f3f4f6;
  `,
};

function ThemedComponent({ theme }) {
  return (
    <div css={themes[theme]}>
      <Container>Themed Content</Container>
    </div>
  );
}

// 使用shouldForwardProp避免无关props传递
const Button = styled('button', {
  shouldForwardProp: (prop) => 
    !['customColor', 'customSize'].includes(prop)
})`
  background: ${props => props.customColor || '#3b82f6'};
  padding: ${props => props.customSize === 'large' ? '1rem 2rem' : '0.5rem 1rem'};
`;
```

### 代码分割

```jsx
// 动态导入样式
function LazyStyledComponent() {
  const [styles, setStyles] = React.useState(null);
  
  React.useEffect(() => {
    import('./LazyStyles').then(module => {
      setStyles(module.default);
    });
  }, []);
  
  if (!styles) return <div>Loading...</div>;
  
  return <div css={styles.container}>Content</div>;
}

// 路由级样式分割
const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  );
}

// 条件样式加载
function ConditionalStyles({ showAdvanced }) {
  const advancedStyles = showAdvanced 
    ? useLazyStyles('./AdvancedStyles')
    : null;
  
  return (
    <div>
      <div css={baseStyles}>Basic Content</div>
      {showAdvanced && (
        <div css={advancedStyles}>Advanced Content</div>
      )}
    </div>
  );
}

// 自定义懒加载Hook
function useLazyStyles(path) {
  const [styles, setStyles] = React.useState(null);
  
  React.useEffect(() => {
    import(path).then(module => {
      setStyles(module.default);
    });
  }, [path]);
  
  return styles;
}
```

## 性能测量

### React DevTools Profiler

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
  });
}

function ProfiledComponent() {
  return (
    <Profiler id="StyledComponent" onRender={onRenderCallback}>
      <StyledComponent />
    </Profiler>
  );
}

// 测量样式注入性能
function measureStyleInjection() {
  const start = performance.now();
  
  // 触发样式注入
  const element = <StyledDiv>Content</StyledDiv>;
  
  const end = performance.now();
  console.log(`Style injection took ${end - start}ms`);
}
```

### Performance API

```jsx
// 测量样式计算时间
function measureStylePerformance() {
  performance.mark('style-start');
  
  const styles = css`
    color: red;
    padding: 1rem;
  `;
  
  performance.mark('style-end');
  performance.measure('style-calculation', 'style-start', 'style-end');
  
  const measures = performance.getEntriesByName('style-calculation');
  console.log(`Style calculation: ${measures[0].duration}ms`);
}

// 监控样式注入
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('style')) {
      console.log(`Style operation: ${entry.duration}ms`);
    }
  }
});

observer.observe({ entryTypes: ['measure'] });
```

### Bundle Size分析

```bash
# 使用webpack-bundle-analyzer
npm install -D webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
    })
  ]
};

# 使用source-map-explorer
npm install -D source-map-explorer
npx source-map-explorer build/static/js/*.js

# 分析CSS-in-JS库的大小影响
```

## 不同方案性能对比

### 运行时性能

```jsx
// Styled-Components (运行时)
const StyledButton = styled.button`
  background: #3b82f6;
  color: white;
`;
// Bundle: ~16KB (gzipped)
// 运行时: 样式注入到<style>标签

// Emotion (运行时，性能优化)
const EmotionButton = styled.button`
  background: #3b82f6;
  color: white;
`;
// Bundle: ~7KB (gzipped)
// 运行时: 优化的样式注入

// Linaria (零运行时)
const LinariaButton = styled.button`
  background: #3b82f6;
  color: white;
`;
// Bundle: ~0KB (编译为CSS文件)
// 运行时: 无，使用静态CSS

// Vanilla Extract (零运行时)
export const button = style({
  background: '#3b82f6',
  color: 'white',
});
// Bundle: ~0KB (编译为CSS文件)
// 运行时: 无，类型安全

// 性能对比
const PerformanceComparison = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>库</th>
          <th>Bundle大小</th>
          <th>运行时开销</th>
          <th>首次渲染</th>
          <th>重渲染</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Styled-Components</td>
          <td>16KB</td>
          <td>高</td>
          <td>慢</td>
          <td>中</td>
        </tr>
        <tr>
          <td>Emotion</td>
          <td>7KB</td>
          <td>中</td>
          <td>中</td>
          <td>快</td>
        </tr>
        <tr>
          <td>Linaria</td>
          <td>0KB</td>
          <td>无</td>
          <td>快</td>
          <td>快</td>
        </tr>
        <tr>
          <td>Vanilla Extract</td>
          <td>0KB</td>
          <td>无</td>
          <td>快</td>
          <td>快</td>
        </tr>
      </tbody>
    </table>
  );
};
```

### SSR性能

```jsx
// Styled-Components SSR
import { ServerStyleSheet } from 'styled-components';

function renderApp(req, res) {
  const sheet = new ServerStyleSheet();
  
  try {
    const html = renderToString(
      sheet.collectStyles(<App />)
    );
    
    const styleTags = sheet.getStyleTags();
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          ${styleTags}
        </head>
        <body>
          <div id="root">${html}</div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
  } finally {
    sheet.seal();
  }
}

// Emotion SSR
import createEmotionServer from '@emotion/server/create-instance';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

function renderAppEmotion(req, res) {
  const cache = createCache({ key: 'css' });
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = 
    createEmotionServer(cache);
  
  const html = renderToString(
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  );
  
  const chunks = extractCriticalToChunks(html);
  const styles = constructStyleTagsFromChunks(chunks);
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        ${styles}
      </head>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
  `);
}

// SSR性能优化
// 1. 使用流式渲染
import { renderToPipeableStream } from 'react-dom/server';

function streamRender(req, res) {
  const { pipe } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/main.js'],
      onShellReady() {
        res.setHeader('content-type', 'text/html');
        pipe(res);
      },
    }
  );
}

// 2. 缓存样式提取
const styleCache = new Map();

function cachedStyleExtraction(component) {
  const cacheKey = component.toString();
  
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }
  
  const styles = extractStyles(component);
  styleCache.set(cacheKey, styles);
  
  return styles;
}
```

## 最佳实践

### 1. 选择合适的方案

```jsx
// 高动态性需求 → 使用运行时方案
// - Styled-Components
// - Emotion

// 性能优先 → 使用零运行时方案
// - Linaria
// - Vanilla Extract
// - CSS Modules

// 混合方案
// 静态样式使用零运行时
import { button } from './styles.css.ts'; // Vanilla Extract

// 动态样式使用运行时
const DynamicComponent = styled.div`
  color: ${props => props.color};
`;

function HybridComponent({ color }) {
  return (
    <div>
      <button className={button}>Static</button>
      <DynamicComponent color={color}>Dynamic</DynamicComponent>
    </div>
  );
}
```

### 2. 优化模式

```jsx
// ✅ 静态样式提取到外部
const staticStyles = css`
  padding: 1rem;
  border-radius: 0.5rem;
`;

const Button = styled.button`
  ${staticStyles}
  background: ${props => props.color};
`;

// ✅ 使用主题而非直接props
const ThemedButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
`;

// ✅ 预计算样式变体
const variants = {
  primary: css`...`,
  secondary: css`...`,
};

// ❌ 避免过度嵌套
const OverNested = styled.div`
  .header {
    .title {
      .text {
        .icon {
          /* 避免这样 */
        }
      }
    }
  }
`;

// ✅ 扁平化选择器
const Header = styled.div`...`;
const Title = styled.h1`...`;
const Icon = styled.span`...`;
```

### 3. 监控和分析

```jsx
// 创建性能监控组件
function StylePerformanceMonitor({ children }) {
  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 16) {
          console.warn(`Slow style operation: ${entry.name} (${entry.duration}ms)`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
  
  return children;
}

// 使用
function App() {
  return (
    <StylePerformanceMonitor>
      <YourApp />
    </StylePerformanceMonitor>
  );
}

// Bundle大小监控
// package.json
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "size": "size-limit"
  }
}

// .size-limit.json
[
  {
    "path": "build/static/js/*.js",
    "limit": "100 KB"
  }
]
```

## 实战优化案例

### 大型列表优化

```jsx
// 问题：1000个动态样式项
function SlowList({ items }) {
  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          css={css`
            color: ${item.color};
            background: ${item.background};
          `}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

// 优化：使用虚拟滚动 + CSS变量
import { FixedSizeList } from 'react-window';

const ListItem = styled.div`
  color: var(--item-color);
  background: var(--item-bg);
  padding: 1rem;
`;

function OptimizedList({ items }) {
  const Row = ({ index, style }) => (
    <ListItem
      style={{
        ...style,
        '--item-color': items[index].color,
        '--item-bg': items[index].background,
      }}
    >
      {items[index].text}
    </ListItem>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 主题切换优化

```jsx
// 问题：主题切换导致所有组件重渲染
function SlowThemeSwitch() {
  const [theme, setTheme] = useState('light');
  
  const themeObject = {
    colors: theme === 'light' ? lightColors : darkColors,
  };
  
  return (
    <ThemeProvider theme={themeObject}>
      <App />
    </ThemeProvider>
  );
}

// 优化：使用CSS变量 + 类名切换
function FastThemeSwitch() {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return <App />;
}

// 全局样式
const GlobalStyles = createGlobalStyle`
  [data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
  }
  
  [data-theme="dark"] {
    --bg-color: #1f2937;
    --text-color: #f3f4f6;
  }
`;

const ThemedComponent = styled.div`
  background: var(--bg-color);
  color: var(--text-color);
`;
```

## 总结

CSS-in-JS性能优化要点：

1. **问题识别**：运行时开销、样式注入、类名生成
2. **优化策略**：静态提取、样式缓存、减少重计算
3. **代码分割**：动态导入、路由级分割
4. **性能测量**：Profiler、Performance API、Bundle分析
5. **方案对比**：运行时vs零运行时
6. **SSR优化**：流式渲染、样式缓存
7. **最佳实践**：方案选择、优化模式、监控分析

选择合适的CSS-in-JS方案并应用优化策略,可以显著提升应用性能。
