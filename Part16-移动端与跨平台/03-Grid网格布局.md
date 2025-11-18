# Grid网格布局 - 完整CSS Grid布局指南

## 1. Grid布局基础

### 1.1 什么是CSS Grid

CSS Grid是二维布局系统,可以同时处理行和列,是构建复杂布局的强大工具。

```typescript
const gridConcepts = {
  container: {
    name: 'Grid容器',
    property: 'display: grid | inline-grid',
    role: '定义网格布局'
  },
  
  items: {
    name: 'Grid项目',
    role: '网格容器的直接子元素',
    placement: '自动或手动放置到网格单元'
  },
  
  lines: {
    name: '网格线',
    description: '定义网格的边界',
    numbering: '从1开始编号'
  },
  
  tracks: {
    name: '网格轨道',
    types: ['行轨道', '列轨道'],
    definition: '两条网格线之间的空间'
  },
  
  cells: {
    name: '网格单元',
    description: '最小单位',
    composition: '两条相邻行线和列线的交叉区域'
  },
  
  areas: {
    name: '网格区域',
    description: '由多个单元格组成',
    usage: '命名区域便于布局'
  }
};
```

### 1.2 Grid vs Flexbox

```css
/* Flexbox - 一维布局 */
.flex-container {
  display: flex;
  /* 主要处理单一方向(行或列) */
}

/* Grid - 二维布局 */
.grid-container {
  display: grid;
  /* 同时处理行和列 */
}

/* 何时使用Grid:
   - 复杂的二维布局
   - 精确的列对齐
   - 重叠元素
   - 非线性布局
   - 整体页面结构 */

/* 何时使用Flexbox:
   - 简单的一维排列
   - 内容驱动的布局
   - 组件内部布局
   - 动态内容对齐 */
```

## 2. Grid容器属性

### 2.1 display

```css
/* 块级网格 */
.grid {
  display: grid;
}

/* 行内网格 */
.inline-grid {
  display: inline-grid;
}
```

### 2.2 grid-template-columns 和 grid-template-rows

```css
/* 固定尺寸 */
.grid-fixed {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 100px 100px;
}

/* fr单位 - 剩余空间的份数 */
.grid-fr {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 1:2:1比例 */
}

/* 混合单位 */
.grid-mixed {
  display: grid;
  grid-template-columns: 200px 1fr 20%; /* 固定 + 自适应 + 百分比 */
}

/* repeat()函数 */
.grid-repeat {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3个等宽列 */
  grid-template-rows: repeat(2, 100px); /* 2个100px行 */
}

/* auto-fill - 自动填充 */
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  /* 自动计算列数,最小200px */
}

/* auto-fit - 自动适配 */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* 类似auto-fill,但会拉伸最后一行 */
}

/* minmax()函数 */
.grid-minmax {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) minmax(300px, 2fr);
  /* 最小值和最大值 */
}

/* fit-content() */
.grid-fit {
  display: grid;
  grid-template-columns: fit-content(200px) 1fr;
  /* 基于内容,最大200px */
}
```

### 2.3 gap (grid-gap)

```css
/* 所有间隙 */
.grid-gap {
  display: grid;
  gap: 20px; /* 行和列间隙都是20px */
}

/* 分别设置 */
.grid-gap-separate {
  display: grid;
  row-gap: 20px; /* 行间隙 */
  column-gap: 30px; /* 列间隙 */
}

/* 简写 */
.grid-gap-shorthand {
  display: grid;
  gap: 20px 30px; /* row-gap column-gap */
}
```

### 2.4 grid-template-areas

```css
/* 命名网格区域 */
.grid-areas {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* 空单元格用点表示 */
.grid-with-empty {
  grid-template-areas:
    "header header header"
    "sidebar main ."
    "footer footer footer";
}

/* 响应式区域 */
@media (max-width: 768px) {
  .grid-areas {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
  }
}
```

### 2.5 grid-auto-flow

```css
/* 自动放置算法 */
.grid-flow-row {
  display: grid;
  grid-auto-flow: row; /* 默认,按行填充 */
}

.grid-flow-column {
  display: grid;
  grid-auto-flow: column; /* 按列填充 */
}

.grid-flow-dense {
  display: grid;
  grid-auto-flow: row dense; /* 密集填充,尽量填满空隙 */
}
```

### 2.6 grid-auto-rows 和 grid-auto-columns

```css
/* 隐式网格轨道大小 */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px; /* 额外行高度 */
}

.grid-auto-multiple {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px 200px; /* 交替高度 */
}

/* 使用minmax */
.grid-auto-minmax {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto); /* 最小100px,内容自适应 */
}
```

### 2.7 justify-items 和 align-items

```css
/* 项目在单元格内的对齐 */
.grid-justify {
  display: grid;
  justify-items: start;    /* 起始对齐 */
  justify-items: end;      /* 结束对齐 */
  justify-items: center;   /* 居中对齐 */
  justify-items: stretch;  /* 拉伸(默认) */
}

.grid-align {
  display: grid;
  align-items: start;    /* 顶部对齐 */
  align-items: end;      /* 底部对齐 */
  align-items: center;   /* 垂直居中 */
  align-items: stretch;  /* 拉伸(默认) */
}

/* 简写 */
.grid-place {
  display: grid;
  place-items: center; /* align-items justify-items */
}
```

### 2.8 justify-content 和 align-content

```css
/* 整个网格在容器中的对齐 */
.grid-justify-content {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  justify-content: start;         /* 起始对齐 */
  justify-content: end;           /* 结束对齐 */
  justify-content: center;        /* 居中对齐 */
  justify-content: stretch;       /* 拉伸 */
  justify-content: space-around;  /* 周围分散 */
  justify-content: space-between; /* 两端对齐 */
  justify-content: space-evenly;  /* 均匀分散 */
}

.grid-align-content {
  display: grid;
  grid-template-rows: repeat(3, 100px);
  height: 500px;
  align-content: center; /* 垂直居中整个网格 */
}

/* 简写 */
.grid-place-content {
  display: grid;
  place-content: center; /* align-content justify-content */
}
```

## 3. Grid项目属性

### 3.1 grid-column 和 grid-row

```css
/* 指定项目位置 */
.item-1 {
  grid-column: 1 / 3; /* 从第1列线到第3列线 */
  grid-row: 1 / 2;    /* 从第1行线到第2行线 */
}

/* span关键字 */
.item-2 {
  grid-column: span 2; /* 跨越2列 */
  grid-row: span 1;    /* 跨越1行 */
}

/* 起始位置 + span */
.item-3 {
  grid-column: 2 / span 2; /* 从第2列开始,跨越2列 */
}

/* 负数表示从末尾计数 */
.item-4 {
  grid-column: 1 / -1; /* 从第1列到最后1列 */
}

/* 简写 */
.item-5 {
  grid-area: 1 / 1 / 3 / 3;
  /* grid-row-start / grid-column-start / grid-row-end / grid-column-end */
}
```

### 3.2 grid-area

```css
/* 方式1: 命名区域 */
.header {
  grid-area: header;
}

/* 方式2: 行列定位 */
.item {
  grid-area: 1 / 2 / 3 / 4;
  /* row-start / col-start / row-end / col-end */
}
```

### 3.3 justify-self 和 align-self

```css
/* 单个项目在单元格内的对齐 */
.item-justify {
  justify-self: start;   /* 左对齐 */
  justify-self: end;     /* 右对齐 */
  justify-self: center;  /* 居中 */
  justify-self: stretch; /* 拉伸 */
}

.item-align {
  align-self: start;   /* 顶部对齐 */
  align-self: end;     /* 底部对齐 */
  align-self: center;  /* 垂直居中 */
  align-self: stretch; /* 拉伸 */
}

/* 简写 */
.item-place {
  place-self: center; /* align-self justify-self */
}
```

### 3.4 order

```css
/* 改变视觉顺序 */
.item-1 { order: 2; }
.item-2 { order: 1; }
.item-3 { order: 3; }
/* 显示顺序: item-2, item-1, item-3 */
```

## 4. 常见布局模式

### 4.1 圣杯布局

```css
/* 经典圣杯布局 */
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 10px;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* 响应式 */
@media (max-width: 768px) {
  .holy-grail {
    grid-template-areas:
      "header"
      "main"
      "nav"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### 4.2 12列网格系统

```css
/* Bootstrap风格的12列网格 */
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

/* 列跨越 */
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-6  { grid-column: span 6; }
.col-8  { grid-column: span 8; }
.col-12 { grid-column: span 12; }

/* 偏移 */
.offset-1 { grid-column-start: 2; }
.offset-2 { grid-column-start: 3; }
.offset-3 { grid-column-start: 4; }
```

### 4.3 卡片网格

```css
/* 响应式卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 瀑布流效果 */
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px; /* 小行高 */
  gap: 10px;
}

.masonry-item {
  /* 根据内容高度跨越行数 */
  grid-row-end: span var(--row-span);
}
```

### 4.4 图片画廊

```css
/* 不规则图片网格 */
.gallery {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-auto-rows: 100px;
  gap: 10px;
}

.gallery-item:nth-child(1) {
  grid-column: 1 / 5;
  grid-row: 1 / 3;
}

.gallery-item:nth-child(2) {
  grid-column: 5 / 9;
  grid-row: 1 / 4;
}

.gallery-item:nth-child(3) {
  grid-column: 1 / 3;
  grid-row: 3 / 5;
}
```

### 4.5 仪表盘布局

```css
/* 复杂仪表盘 */
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(6, 100px);
  gap: 15px;
}

.widget-header {
  grid-column: 1 / -1;
  grid-row: 1 / 2;
}

.widget-chart {
  grid-column: 1 / 9;
  grid-row: 2 / 5;
}

.widget-stats {
  grid-column: 9 / -1;
  grid-row: 2 / 3;
}

.widget-activity {
  grid-column: 9 / -1;
  grid-row: 3 / 5;
}

.widget-footer {
  grid-column: 1 / -1;
  grid-row: 5 / -1;
}
```

## 5. React Grid组件

### 5.1 Grid容器组件

```tsx
// Grid.tsx
interface GridProps {
  children: React.ReactNode;
  columns?: string | number;
  rows?: string | number;
  gap?: string | number;
  areas?: string[];
  autoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  className?: string;
}

export function Grid({
  children,
  columns,
  rows,
  gap,
  areas,
  autoFlow,
  className = ''
}: GridProps) {
  const styles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: typeof columns === 'number' 
      ? `repeat(${columns}, 1fr)` 
      : columns,
    gridTemplateRows: typeof rows === 'number'
      ? `repeat(${rows}, 1fr)`
      : rows,
    gap,
    gridTemplateAreas: areas?.map(row => `"${row}"`).join(' '),
    gridAutoFlow: autoFlow
  };
  
  return (
    <div style={styles} className={className}>
      {children}
    </div>
  );
}

// 使用
<Grid columns={3} gap="20px">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

<Grid
  columns="200px 1fr 200px"
  rows="auto 1fr auto"
  areas={[
    'header header header',
    'sidebar main aside',
    'footer footer footer'
  ]}
  gap="10px"
>
  <div style={{ gridArea: 'header' }}>Header</div>
  <div style={{ gridArea: 'sidebar' }}>Sidebar</div>
  <div style={{ gridArea: 'main' }}>Main</div>
  <div style={{ gridArea: 'aside' }}>Aside</div>
  <div style={{ gridArea: 'footer' }}>Footer</div>
</Grid>
```

### 5.2 响应式Grid组件

```tsx
// ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode;
  minWidth?: string;
  gap?: string;
}

export function ResponsiveGrid({
  children,
  minWidth = '280px',
  gap = '20px'
}: ResponsiveGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
        gap
      }}
    >
      {children}
    </div>
  );
}

// 使用
<ResponsiveGrid minWidth="300px" gap="24px">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</ResponsiveGrid>
```

### 5.3 Grid项目组件

```tsx
// GridItem.tsx
interface GridItemProps {
  children: React.ReactNode;
  column?: string;
  row?: string;
  area?: string;
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'start' | 'end' | 'center' | 'stretch';
  className?: string;
}

export function GridItem({
  children,
  column,
  row,
  area,
  justifySelf,
  alignSelf,
  className = ''
}: GridItemProps) {
  const styles: React.CSSProperties = {
    gridColumn: column,
    gridRow: row,
    gridArea: area,
    justifySelf,
    alignSelf
  };
  
  return (
    <div style={styles} className={className}>
      {children}
    </div>
  );
}

// 使用
<Grid columns="repeat(4, 1fr)" gap="20px">
  <GridItem column="1 / 3" row="1 / 2">Wide Item</GridItem>
  <GridItem column="3 / 5" row="1 / 3">Tall Item</GridItem>
  <GridItem column="1 / 2">Normal Item</GridItem>
</Grid>
```

### 5.4 布局组件库

```tsx
// Layout.tsx
export function PageLayout({
  header,
  sidebar,
  children,
  aside,
  footer
}: {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
  footer: React.ReactNode;
}) {
  const hasAside = Boolean(aside);
  const hasSidebar = Boolean(sidebar);
  
  const gridAreas = [
    'header header header',
    hasSidebar ? 'sidebar main' : 'main main',
    hasAside ? ' main aside' : 'main main',
    'footer footer footer'
  ].filter((_, i) => i === 0 || i === 3 || (i === 1 && hasSidebar) || (i === 2 && hasAside));
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateAreas: gridAreas.map(row => `"${row}"`).join(' '),
        gridTemplateColumns: '200px 1fr 200px',
        gridTemplateRows: 'auto 1fr auto',
        minHeight: '100vh',
        gap: '10px'
      }}
    >
      <header style={{ gridArea: 'header' }}>{header}</header>
      {sidebar && <aside style={{ gridArea: 'sidebar' }}>{sidebar}</aside>}
      <main style={{ gridArea: 'main' }}>{children}</main>
      {aside && <aside style={{ gridArea: 'aside' }}>{aside}</aside>}
      <footer style={{ gridArea: 'footer' }}>{footer}</footer>
    </div>
  );
}

// Dashboard布局
export function DashboardLayout({ widgets }: { widgets: Widget[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: '100px',
        gap: '15px'
      }}
    >
      {widgets.map(widget => (
        <div
          key={widget.id}
          style={{
            gridColumn: widget.column,
            gridRow: widget.row
          }}
        >
          <Widget {...widget} />
        </div>
      ))}
    </div>
  );
}
```

## 6. 高级技巧

### 6.1 子网格(Subgrid)

```css
/* 子网格继承父网格的轨道 */
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.child-grid {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid; /* 继承父网格列 */
  grid-template-rows: subgrid;    /* 继承父网格行 */
}
```

### 6.2 命名网格线

```css
/* 命名网格线 */
.named-lines {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 200px 
    [sidebar-end main-start] 1fr 
    [main-end aside-start] 200px 
    [aside-end];
  grid-template-rows: 
    [header-start] auto 
    [header-end content-start] 1fr 
    [content-end footer-start] auto 
    [footer-end];
}

.header {
  grid-column: sidebar-start / aside-end;
  grid-row: header-start / header-end;
}

.main {
  grid-column: main-start / main-end;
  grid-row: content-start / content-end;
}
```

### 6.3 重叠元素

```css
/* Grid允许元素重叠 */
.overlap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 100px);
}

.background {
  grid-area: 1 / 1 / 4 / 4;
  z-index: 1;
}

.content {
  grid-area: 2 / 2 / 3 / 3;
  z-index: 2;
}
```

## 7. 实战案例

### 7.1 响应式博客布局

```tsx
// BlogLayout.tsx
export function BlogLayout() {
  return (
    <div className="
      grid
      grid-cols-1
      md:grid-cols-[200px_1fr]
      lg:grid-cols-[200px_1fr_300px]
      gap-6
      min-h-screen
    ">
      {/* 侧边导航 - 移动端隐藏 */}
      <nav className="hidden md:block">
        <Navigation />
      </nav>
      
      {/* 主内容 */}
      <main>
        <Articles />
      </main>
      
      {/* 侧边栏 - 桌面端显示 */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>
    </div>
  );
}
```

### 7.2 产品展示网格

```tsx
// ProductGrid.tsx
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="
      grid
      grid-cols-[repeat(auto-fill,minmax(280px,1fr))]
      gap-6
    ">
      {products.map((product, index) => {
        // 每隔5个产品,有一个占2列
        const isWide = (index + 1) % 5 === 0;
        
        return (
          <div
            key={product.id}
            className={isWide ? 'col-span-2' : ''}
          >
            <ProductCard product={product} featured={isWide} />
          </div>
        );
      })}
    </div>
  );
}
```

## 8. 性能优化

```typescript
const gridPerformanceTips = {
  avoid: [
    '过多的网格项目(>1000)',
    '复杂的minmax计算',
    '频繁的grid重计算',
    '深层嵌套的Grid'
  ],
  
  optimize: [
    '使用will-change提示浏览器',
    '避免在动画中改变grid属性',
    '使用transform代替grid位置变化',
    '虚拟化长列表',
    '合理使用auto-fill/auto-fit'
  ]
};
```

## 9. 浏览器兼容

```css
/* 功能检测 */
@supports (display: grid) {
  .grid-layout {
    display: grid;
  }
}

/* 降级方案 */
@supports not (display: grid) {
  .grid-layout {
    display: flex;
    flex-wrap: wrap;
  }
}
```

## 10. 最佳实践

```typescript
const gridBestPractices = {
  structure: [
    '使用语义化的grid-area命名',
    '保持grid结构简单清晰',
    '合理使用隐式网格',
    '利用gap代替margin',
    '命名网格线提高可读性'
  ],
  
  responsive: [
    '移动端优先',
    '使用grid-template-areas响应式',
    'auto-fill/auto-fit自适应列数',
    '媒体查询调整布局',
    '考虑内容折叠顺序'
  ],
  
  accessibility: [
    '保持逻辑DOM顺序',
    '谨慎使用order',
    '确保键盘导航',
    '屏幕阅读器兼容',
    '充足的触摸目标'
  ]
};
```

## 11. 总结

CSS Grid布局的核心要点:

1. **二维布局**: 同时控制行和列
2. **灵活定位**: 精确控制项目位置
3. **命名区域**: grid-template-areas
4. **响应式**: auto-fill/auto-fit
5. **对齐**: justify/align系列属性
6. **间隙**: gap属性
7. **重叠**: 允许元素重叠

通过掌握Grid布局,可以轻松实现复杂的二维布局结构。

