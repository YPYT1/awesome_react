# 移动端适配方案 - rem与vw完整指南

## 1. 移动端适配概述

### 1.1 为什么需要适配

移动端设备屏幕尺寸和分辨率差异巨大,需要统一的适配方案确保在不同设备上的一致体验。

```typescript
const adaptationChallenges = {
  screenSizes: {
    mobile: '320px - 428px',
    tablet: '768px - 1024px',
    desktop: '1280px+'
  },
  
  resolutions: {
    normal: '1x',
    retina: '2x',
    superRetina: '3x'
  },
  
  issues: [
    '1px边框问题',
    '图片模糊',
    '布局错乱',
    '字体大小不一致',
    '触摸目标过小'
  ],
  
  solutions: [
    'rem适配',
    'vw/vh适配',
    '百分比布局',
    'Flexbox/Grid',
    '媒体查询'
  ]
};
```

### 1.2 像素概念

```typescript
const pixelConcepts = {
  physicalPixel: {
    name: '物理像素',
    description: '设备屏幕实际的像素点',
    example: 'iPhone 14 Pro: 1179 x 2556'
  },
  
  logicalPixel: {
    name: '逻辑像素(CSS像素)',
    description: 'CSS中使用的抽象像素单位',
    example: 'iPhone 14 Pro: 393 x 852'
  },
  
  dpr: {
    name: '设备像素比',
    formula: 'DPR = 物理像素 / 逻辑像素',
    example: 'iPhone 14 Pro: 1179/393 = 3',
    values: ['1 (普通屏)', '2 (Retina)', '3 (Super Retina)']
  },
  
  ppi: {
    name: '像素密度',
    unit: 'pixels per inch',
    retina: '>= 300 PPI'
  }
};
```

## 2. rem适配方案

### 2.1 rem基础

```css
/* rem = root em,相对于根元素(html)的font-size */

html {
  font-size: 16px; /* 1rem = 16px */
}

.box {
  width: 10rem;    /* 160px */
  height: 5rem;    /* 80px */
  font-size: 1rem; /* 16px */
  padding: 0.5rem; /* 8px */
}

/* 子元素的rem始终相对于根元素 */
.parent {
  font-size: 20px;
}

.child {
  font-size: 1rem; /* 仍然是16px,不是20px */
}
```

### 2.2 动态rem适配

```javascript
// 方案1: 基于设计稿宽度
(function() {
  const designWidth = 750; // 设计稿宽度
  const rem = designWidth / 10; // 1rem = 75px
  
  function setRemUnit() {
    const clientWidth = document.documentElement.clientWidth;
    const ratio = clientWidth / designWidth;
    const fontSize = ratio * rem;
    
    document.documentElement.style.fontSize = fontSize + 'px';
  }
  
  setRemUnit();
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) setRemUnit();
  });
})();

// 设计稿750px,元素宽度200px
// 200px / 75 = 2.67rem

// 在375px设备上: 2.67rem * (375/750 * 75) = 100px
// 在750px设备上: 2.67rem * (750/750 * 75) = 200px
```

### 2.3 flexible方案(淘宝)

```javascript
// lib-flexible.js
(function flexible(window, document) {
  const docEl = document.documentElement;
  const dpr = window.devicePixelRatio || 1;
  
  // 设置body字体大小
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = 12 * dpr + 'px';
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }
  setBodyFontSize();
  
  // 设置rem基准值
  function setRemUnit() {
    const rem = docEl.clientWidth / 10;
    docEl.style.fontSize = rem + 'px';
  }
  
  setRemUnit();
  
  // 监听窗口变化
  window.addEventListener('resize', setRemUnit);
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      setRemUnit();
    }
  });
  
  // 检测0.5px支持
  if (dpr >= 2) {
    const fakeBody = document.createElement('body');
    const testElement = document.createElement('div');
    testElement.style.border = '.5px solid transparent';
    fakeBody.appendChild(testElement);
    docEl.appendChild(fakeBody);
    
    if (testElement.offsetHeight === 1) {
      docEl.classList.add('hairlines');
    }
    
    docEl.removeChild(fakeBody);
  }
}(window, document));
```

### 2.4 rem转换工具

```javascript
// px转rem函数
function px2rem(px, baseSize = 75) {
  return (px / baseSize) + 'rem';
}

// 使用
const width = px2rem(200);  // '2.67rem'
const height = px2rem(100); // '1.33rem'

// PostCSS插件配置
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 75,          // 根元素字体大小
      unitPrecision: 5,       // 保留小数位数
      propList: ['*'],        // 转换的属性
      selectorBlackList: [],  // 忽略的选择器
      replace: true,
      mediaQuery: false,      // 媒体查询中的px
      minPixelValue: 0        // 最小转换值
    }
  }
};

// 在Vite中配置
import postcsspxtorem from 'postcss-pxtorem';

export default {
  css: {
    postcss: {
      plugins: [
        postcsspxtorem({
          rootValue: 75,
          propList: ['*']
        })
      ]
    }
  }
};
```

## 3. vw/vh适配方案

### 3.1 vw/vh基础

```css
/* 视口单位 */
.box {
  width: 50vw;    /* 视口宽度的50% */
  height: 50vh;   /* 视口高度的50% */
  font-size: 5vw; /* 视口宽度的5% */
}

/* vmin和vmax */
.square {
  width: 50vmin;  /* 视口宽高中较小值的50% */
  height: 50vmin;
}

.cover {
  width: 100vmax;  /* 视口宽高中较大值的100% */
  height: 100vmax;
}

/* 计算 */
/* 设计稿750px,元素200px
   200 / 750 * 100 = 26.67vw */

.element {
  width: 26.67vw; /* 在任何宽度下都是26.67% */
}
```

### 3.2 vw方案优势

```typescript
const vwAdvantages = {
  pros: [
    '纯CSS解决方案,无需JavaScript',
    '真正的响应式',
    '计算简单',
    '兼容性好(现代浏览器)',
    '不受字体大小影响'
  ],
  
  cons: [
    '无法限制最大最小值(需配合calc)',
    '1px问题仍存在',
    '横竖屏切换需处理',
    '老旧浏览器兼容性'
  ]
};
```

### 3.3 vw限制方案

```css
/* 限制最大最小值 */
.container {
  /* 基于750px设计稿 */
  width: 100vw;
  max-width: 750px;
  min-width: 320px;
  margin: 0 auto;
}

/* 使用calc限制 */
.box {
  width: min(26.67vw, 200px); /* 不超过200px */
  width: max(26.67vw, 100px); /* 不小于100px */
  width: clamp(100px, 26.67vw, 200px); /* 100-200px之间 */
}

/* 响应式字体 */
.text {
  font-size: clamp(14px, 4vw, 20px);
  /* 最小14px,理想4vw,最大20px */
}
```

### 3.4 PostCSS px转vw

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 750,      // 设计稿宽度
      viewportHeight: 1334,    // 设计稿高度
      unitPrecision: 5,        // 转换精度
      viewportUnit: 'vw',      // 单位
      selectorBlackList: [],   // 不转换的类名
      minPixelValue: 1,        // 最小转换值
      mediaQuery: false,       // 媒体查询中的px
      exclude: [/node_modules/] // 排除文件
    }
  }
};

// CSS写法
.box {
  width: 200px;    /* 自动转换为 26.67vw */
  height: 100px;   /* 自动转换为 13.33vw */
}
```

## 4. React移动端适配

### 4.1 动态rem Hook

```tsx
// useRem.ts
import { useEffect } from 'react';

export function useRem(designWidth = 750, remBase = 75) {
  useEffect(() => {
    function setRemUnit() {
      const clientWidth = document.documentElement.clientWidth;
      const ratio = clientWidth / designWidth;
      const fontSize = ratio * remBase;
      
      document.documentElement.style.fontSize = fontSize + 'px';
    }
    
    setRemUnit();
    
    window.addEventListener('resize', setRemUnit);
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) setRemUnit();
    });
    
    return () => {
      window.removeEventListener('resize', setRemUnit);
    };
  }, [designWidth, remBase]);
}

// App.tsx
function App() {
  useRem(750, 75);
  
  return <div className="app">...</div>;
}
```

### 4.2 px转换工具

```tsx
// utils/px2rem.ts
const designWidth = 750;
const remBase = 75;

export function px2rem(px: number): string {
  return `${px / remBase}rem`;
}

export function px2vw(px: number): string {
  return `${(px / designWidth) * 100}vw`;
}

// 使用
import { px2rem, px2vw } from '@/utils/px2rem';

export function Component() {
  return (
    <div style={{
      width: px2rem(200),    // '2.67rem'
      height: px2vw(100),    // '13.33vw'
      padding: px2rem(20)
    }}>
      Content
    </div>
  );
}

// styled-components版本
import styled from 'styled-components';

const Container = styled.div`
  width: ${px2rem(750)};
  max-width: 750px;
  margin: 0 auto;
`;

const Box = styled.div`
  width: ${px2vw(200)};
  height: ${px2rem(100)};
`;
```

### 4.3 Tailwind CSS配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        // rem单位
        '1r': '0.13rem',  // 10px @ 75rem
        '2r': '0.27rem',  // 20px
        '4r': '0.53rem',  // 40px
        '8r': '1.07rem',  // 80px
      },
      fontSize: {
        // rem字体
        'xs-r': '0.16rem',   // 12px
        'sm-r': '0.19rem',   // 14px
        'base-r': '0.21rem', // 16px
        'lg-r': '0.24rem',   // 18px
        'xl-r': '0.27rem',   // 20px
      }
    }
  },
  plugins: [
    // 自定义rem插件
    function({ addUtilities }) {
      const remUtilities = {};
      for (let i = 1; i <= 100; i++) {
        remUtilities[`.w-${i}r`] = {
          width: `${i / 75}rem`
        };
        remUtilities[`.h-${i}r`] = {
          height: `${i / 75}rem`
        };
      }
      addUtilities(remUtilities);
    }
  ]
};

// 使用
<div className="w-200r h-100r p-4r">
  Content
</div>
```

## 5. 1px边框问题

### 5.1 问题分析

```typescript
const onePixelProblem = {
  issue: '在DPR为2或3的设备上,1px边框实际显示为2px或3px',
  
  causes: [
    'CSS的1px是逻辑像素',
    '物理像素 = 逻辑像素 * DPR',
    '设计稿要求真正的1物理像素'
  ],
  
  solutions: [
    'transform: scale()',
    'border-image',
    'box-shadow',
    'viewport + rem',
    '伪元素 + transform'
  ]
};
```

### 5.2 解决方案

```css
/* 方案1: transform scale */
.border-1px {
  position: relative;
}

.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #e5e5e5;
  transform: scale(0.5);
  transform-origin: left top;
  pointer-events: none;
}

/* DPR为3的设备 */
@media (-webkit-min-device-pixel-ratio: 3),
       (min-device-pixel-ratio: 3) {
  .border-1px::after {
    width: 300%;
    height: 300%;
    transform: scale(0.333);
  }
}

/* 方案2: border-image */
.border-1px-image {
  border: 1px solid transparent;
  border-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><line x1="0" y1="0" x2="0" y2="100%" stroke="%23e5e5e5" stroke-width="1"/></svg>') 1;
}

/* 方案3: box-shadow */
.border-1px-shadow {
  box-shadow: inset 0 -1px 0 0 #e5e5e5;
}

/* 方案4: viewport缩放 */
const scale = 1 / window.devicePixelRatio;
document.querySelector('meta[name="viewport"]')
  .setAttribute('content', 
    `width=device-width,initial-scale=${scale},maximum-scale=${scale},minimum-scale=${scale}`
  );
```

### 5.3 通用1px方案

```tsx
// Border1px.tsx
export function Border1px({
  color = '#e5e5e5',
  position = 'bottom'
}: {
  color?: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'all';
}) {
  const [dpr, setDpr] = useState(1);
  
  useEffect(() => {
    setDpr(window.devicePixelRatio || 1);
  }, []);
  
  const borderStyle: React.CSSProperties = {
    position: 'absolute',
    content: '""',
    pointerEvents: 'none',
    width: position === 'all' ? `${100 * dpr}%` : '100%',
    height: position === 'all' ? `${100 * dpr}%` : '100%',
    transform: `scale(${1 / dpr})`,
    transformOrigin: position === 'all' ? 'left top' : 'center',
    border: position === 'all' ? `1px solid ${color}` : 'none',
    ...(position === 'top' && { top: 0, left: 0, borderTop: `1px solid ${color}` }),
    ...(position === 'bottom' && { bottom: 0, left: 0, borderBottom: `1px solid ${color}` }),
    ...(position === 'left' && { left: 0, top: 0, borderLeft: `1px solid ${color}` }),
    ...(position === 'right' && { right: 0, top: 0, borderRight: `1px solid ${color}` })
  };
  
  return <div style={borderStyle} />;
}

// 使用
<div style={{ position: 'relative' }}>
  Content
  <Border1px position="bottom" color="#ddd" />
</div>
```

## 6. 图片适配

### 6.1 响应式图片

```html
<!-- 不同DPR的图片 -->
<img
  src="image.png"
  srcset="
    image.png 1x,
    image@2x.png 2x,
    image@3x.png 3x
  "
  alt="Responsive Image"
>

<!-- 不同尺寸的图片 -->
<img
  src="small.jpg"
  srcset="
    small.jpg 320w,
    medium.jpg 640w,
    large.jpg 1024w
  "
  sizes="(max-width: 640px) 100vw, 640px"
  alt="Different Sizes"
>
```

### 6.2 背景图片适配

```css
/* 普通屏幕 */
.bg {
  background-image: url('bg.png');
  background-size: cover;
}

/* Retina屏幕 */
@media (-webkit-min-device-pixel-ratio: 2),
       (min-resolution: 2dppx) {
  .bg {
    background-image: url('bg@2x.png');
  }
}

/* 3x屏幕 */
@media (-webkit-min-device-pixel-ratio: 3),
       (min-resolution: 3dppx) {
  .bg {
    background-image: url('bg@3x.png');
  }
}

/* image-set */
.bg-modern {
  background-image: image-set(
    url('bg.png') 1x,
    url('bg@2x.png') 2x,
    url('bg@3x.png') 3x
  );
}
```

### 6.3 React图片组件

```tsx
// ResponsiveImage.tsx
export function ResponsiveImage({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const dpr = window.devicePixelRatio || 1;
  
  const getSrc = (base: string, dpr: number) => {
    const ext = base.split('.').pop();
    const name = base.replace(`.${ext}`, '');
    
    if (dpr >= 3) return `${name}@3x.${ext}`;
    if (dpr >= 2) return `${name}@2x.${ext}`;
    return base;
  };
  
  return (
    <img
      src={getSrc(src, dpr)}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
```

## 7. 完整适配方案

### 7.1 综合方案

```typescript
// adapt.ts
class MobileAdapter {
  private designWidth: number;
  private remBase: number;
  private dpr: number;
  
  constructor(designWidth = 750, remBase = 75) {
    this.designWidth = designWidth;
    this.remBase = remBase;
    this.dpr = window.devicePixelRatio || 1;
    
    this.init();
  }
  
  init() {
    this.setViewport();
    this.setRem();
    this.handleResize();
    this.handleOrientation();
  }
  
  setViewport() {
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    
    // 不缩放方案
    viewport.setAttribute('content', 
      'width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no'
    );
    
    // 或缩放方案
    // const scale = 1 / this.dpr;
    // viewport.setAttribute('content', 
    //   `width=device-width,initial-scale=${scale},maximum-scale=${scale},minimum-scale=${scale}`
    // );
  }
  
  setRem() {
    const clientWidth = document.documentElement.clientWidth;
    const ratio = clientWidth / this.designWidth;
    const fontSize = ratio * this.remBase;
    
    document.documentElement.style.fontSize = fontSize + 'px';
    document.body.style.fontSize = 12 * this.dpr + 'px';
  }
  
  handleResize() {
    window.addEventListener('resize', () => {
      this.setRem();
    });
    
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        this.setRem();
      }
    });
  }
  
  handleOrientation() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.setRem();
      }, 300);
    });
  }
  
  px2rem(px: number): string {
    return `${px / this.remBase}rem`;
  }
  
  px2vw(px: number): string {
    return `${(px / this.designWidth) * 100}vw`;
  }
}

// 使用
const adapter = new MobileAdapter(750, 75);
export default adapter;
```

### 7.2 React集成

```tsx
// App.tsx
import { useEffect } from 'react';
import adapter from './utils/adapter';

function App() {
  useEffect(() => {
    // 已在adapter.ts中自动初始化
  }, []);
  
  return (
    <div className="app">
      <MobileLayout />
    </div>
  );
}

// index.html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
  <title>移动端应用</title>
  <script>
    // 防止页面闪烁
    (function() {
      const width = document.documentElement.clientWidth;
      const fontSize = (width / 750) * 75;
      document.documentElement.style.fontSize = fontSize + 'px';
    })();
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

## 8. 最佳实践

```typescript
const mobileBestPractices = {
  general: [
    '选择合适的适配方案',
    '设置viewport',
    '使用相对单位',
    '处理1px问题',
    '图片DPR适配'
  ],
  
  rem: [
    '设置合理的remBase',
    '限制最大最小值',
    '使用PostCSS自动转换',
    '处理字体大小',
    '考虑横竖屏切换'
  ],
  
  vw: [
    '使用clamp限制',
    '配合max-width',
    '响应式字体',
    'PostCSS自动转换',
    '兼容性检测'
  ],
  
  performance: [
    '减少计算开销',
    '防抖resize事件',
    '缓存计算结果',
    '使用CSS变量',
    '优化图片加载'
  ]
};
```

## 9. 总结

移动端适配方案的核心要点:

1. **rem方案**: JavaScript动态设置,灵活但依赖JS
2. **vw方案**: 纯CSS,真正响应式
3. **1px问题**: transform scale或viewport缩放
4. **图片适配**: srcset或DPR判断
5. **PostCSS**: 自动px转换
6. **viewport**: 正确设置meta标签
7. **限制范围**: max-width/clamp

选择合适的方案并正确实施,可以实现完美的移动端适配。

