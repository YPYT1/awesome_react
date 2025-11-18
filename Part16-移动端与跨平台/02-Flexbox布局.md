# Flexbox布局 - 完整弹性盒子布局指南

## 1. Flexbox基础概念

### 1.1 什么是Flexbox

Flexbox(弹性盒子布局)是CSS3引入的一维布局模型,用于在容器中高效地排列、对齐和分配空间,即使元素大小未知或动态变化。

```typescript
const flexboxConcepts = {
  container: {
    name: 'Flex容器',
    property: 'display: flex | inline-flex',
    role: '包含flex项目的父元素'
  },
  
  items: {
    name: 'Flex项目',
    role: 'Flex容器的直接子元素',
    behavior: '按flex规则排列'
  },
  
  mainAxis: {
    name: '主轴',
    direction: 'row | row-reverse | column | column-reverse',
    property: 'flex-direction'
  },
  
  crossAxis: {
    name: '交叉轴',
    direction: '垂直于主轴',
    alignment: 'align-items, align-content'
  }
};
```

### 1.2 Flexbox术语

```css
/* 主轴和交叉轴 */
.container {
  display: flex;
  
  /* 主轴方向 */
  flex-direction: row;        /* 默认,水平从左到右 */
  flex-direction: row-reverse; /* 水平从右到左 */
  flex-direction: column;      /* 垂直从上到下 */
  flex-direction: column-reverse; /* 垂直从下到上 */
}

/* 主轴: main axis
   主轴起点: main start
   主轴终点: main end
   主轴尺寸: main size
   
   交叉轴: cross axis
   交叉轴起点: cross start
   交叉轴终点: cross end
   交叉轴尺寸: cross size */
```

## 2. 容器属性

### 2.1 display

```css
/* 块级flex容器 */
.flex-container {
  display: flex;
  width: 100%;
}

/* 行内flex容器 */
.inline-flex {
  display: inline-flex;
  /* 容器本身表现为行内元素 */
}
```

### 2.2 flex-direction

```css
/* 主轴方向 */
.row {
  display: flex;
  flex-direction: row; /* 默认 */
  /* 项目水平排列,从左到右 */
}

.row-reverse {
  display: flex;
  flex-direction: row-reverse;
  /* 项目水平排列,从右到左 */
}

.column {
  display: flex;
  flex-direction: column;
  /* 项目垂直排列,从上到下 */
}

.column-reverse {
  display: flex;
  flex-direction: column-reverse;
  /* 项目垂直排列,从下到上 */
}
```

### 2.3 flex-wrap

```css
/* 换行控制 */
.nowrap {
  display: flex;
  flex-wrap: nowrap; /* 默认,不换行 */
  /* 项目会缩小以适应容器 */
}

.wrap {
  display: flex;
  flex-wrap: wrap;
  /* 项目会换行,从上到下 */
}

.wrap-reverse {
  display: flex;
  flex-wrap: wrap-reverse;
  /* 项目会换行,从下到上 */
}

/* flex-flow: flex-direction和flex-wrap的简写 */
.container {
  display: flex;
  flex-flow: row wrap;
  /* 等同于:
     flex-direction: row;
     flex-wrap: wrap; */
}
```

### 2.4 justify-content

```css
/* 主轴对齐 */
.justify-start {
  display: flex;
  justify-content: flex-start; /* 默认,起点对齐 */
}

.justify-end {
  display: flex;
  justify-content: flex-end; /* 终点对齐 */
}

.justify-center {
  display: flex;
  justify-content: center; /* 居中对齐 */
}

.justify-between {
  display: flex;
  justify-content: space-between;
  /* 两端对齐,项目之间间隔相等 */
}

.justify-around {
  display: flex;
  justify-content: space-around;
  /* 每个项目两侧间隔相等 */
}

.justify-evenly {
  display: flex;
  justify-content: space-evenly;
  /* 项目和容器边缘间隔都相等 */
}
```

### 2.5 align-items

```css
/* 交叉轴对齐(单行) */
.align-stretch {
  display: flex;
  align-items: stretch; /* 默认,拉伸填充容器 */
}

.align-start {
  display: flex;
  align-items: flex-start; /* 起点对齐 */
}

.align-end {
  display: flex;
  align-items: flex-end; /* 终点对齐 */
}

.align-center {
  display: flex;
  align-items: center; /* 居中对齐 */
}

.align-baseline {
  display: flex;
  align-items: baseline; /* 基线对齐 */
}
```

### 2.6 align-content

```css
/* 交叉轴对齐(多行) */
.content-stretch {
  display: flex;
  flex-wrap: wrap;
  align-content: stretch; /* 默认,行拉伸填充 */
}

.content-start {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start; /* 起点对齐 */
}

.content-end {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-end; /* 终点对齐 */
}

.content-center {
  display: flex;
  flex-wrap: wrap;
  align-content: center; /* 居中对齐 */
}

.content-between {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between; /* 两端对齐 */
}

.content-around {
  display: flex;
  flex-wrap: wrap;
  align-content: space-around; /* 周围对齐 */
}
```

### 2.7 gap

```css
/* 项目间隔 */
.gap {
  display: flex;
  gap: 1rem; /* 所有方向间隔 */
}

.row-gap {
  display: flex;
  flex-wrap: wrap;
  row-gap: 1rem; /* 行间隔 */
  column-gap: 2rem; /* 列间隔 */
}

/* 简写 */
.gap-both {
  display: flex;
  gap: 1rem 2rem; /* row-gap column-gap */
}
```

## 3. 项目属性

### 3.1 order

```css
/* 排序 */
.item {
  order: 0; /* 默认值 */
}

.item-first {
  order: -1; /* 排在前面 */
}

.item-last {
  order: 1; /* 排在后面 */
}

/* 示例 */
.container {
  display: flex;
}

.item:nth-child(1) { order: 3; }
.item:nth-child(2) { order: 1; }
.item:nth-child(3) { order: 2; }
/* 显示顺序: 2, 3, 1 */
```

### 3.2 flex-grow

```css
/* 放大比例 */
.item {
  flex-grow: 0; /* 默认,不放大 */
}

.grow-1 {
  flex-grow: 1; /* 占据剩余空间的1份 */
}

.grow-2 {
  flex-grow: 2; /* 占据剩余空间的2份 */
}

/* 示例 */
.container {
  display: flex;
  width: 600px;
}

.item-a {
  width: 100px;
  flex-grow: 1; /* 剩余空间的1/3 */
}

.item-b {
  width: 100px;
  flex-grow: 2; /* 剩余空间的2/3 */
}

/* item-a最终宽度: 100 + (600-200) * 1/3 = 233px
   item-b最终宽度: 100 + (600-200) * 2/3 = 367px */
```

### 3.3 flex-shrink

```css
/* 缩小比例 */
.item {
  flex-shrink: 1; /* 默认,等比缩小 */
}

.no-shrink {
  flex-shrink: 0; /* 不缩小 */
}

.shrink-more {
  flex-shrink: 2; /* 缩小更多 */
}

/* 示例 */
.container {
  display: flex;
  width: 400px;
}

.item-a {
  width: 300px;
  flex-shrink: 1;
}

.item-b {
  width: 300px;
  flex-shrink: 2;
}

/* 超出: 300 + 300 - 400 = 200px
   item-a缩小: 200 * (300*1)/(300*1 + 300*2) = 67px
   item-b缩小: 200 * (300*2)/(300*1 + 300*2) = 133px
   
   item-a最终: 300 - 67 = 233px
   item-b最终: 300 - 133 = 167px */
```

### 3.4 flex-basis

```css
/* 主轴初始大小 */
.item {
  flex-basis: auto; /* 默认,由内容决定 */
}

.fixed-basis {
  flex-basis: 200px; /* 固定基准值 */
}

.percentage-basis {
  flex-basis: 50%; /* 百分比 */
}

.content-basis {
  flex-basis: content; /* 基于内容 */
}

/* 与width/height的关系 */
.item {
  width: 100px;
  flex-basis: 200px; /* flex-basis优先级更高 */
}
```

### 3.5 flex简写

```css
/* flex: flex-grow flex-shrink flex-basis */

.item {
  flex: 0 1 auto; /* 默认值 */
}

.flex-1 {
  flex: 1;
  /* 等同于: flex: 1 1 0% */
  /* 平分剩余空间 */
}

.flex-auto {
  flex: auto;
  /* 等同于: flex: 1 1 auto */
  /* 基于内容大小,占据剩余空间 */
}

.flex-none {
  flex: none;
  /* 等同于: flex: 0 0 auto */
  /* 不伸缩 */
}

.flex-initial {
  flex: initial;
  /* 等同于: flex: 0 1 auto */
  /* 默认值 */
}

/* 常用值 */
.equal-width {
  flex: 1; /* 等宽 */
}

.twice-width {
  flex: 2; /* 两倍宽 */
}

.fixed-width {
  flex: 0 0 200px; /* 固定200px */
}
```

### 3.6 align-self

```css
/* 单个项目的交叉轴对齐 */
.item {
  align-self: auto; /* 默认,继承容器的align-items */
}

.self-start {
  align-self: flex-start;
}

.self-end {
  align-self: flex-end;
}

.self-center {
  align-self: center;
}

.self-stretch {
  align-self: stretch;
}

.self-baseline {
  align-self: baseline;
}
```

## 4. 常见布局模式

### 4.1 水平垂直居中

```css
/* 方法1: justify + align */
.center-1 {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 方法2: margin auto */
.center-2 {
  display: flex;
}

.center-2 > * {
  margin: auto;
}

/* 方法3: 项目设置 */
.center-3 {
  display: flex;
}

.centered-item {
  margin: auto;
}
```

### 4.2 等宽布局

```css
/* 等宽列 */
.equal-columns {
  display: flex;
}

.equal-columns > * {
  flex: 1;
  /* 或 flex: 1 1 0% */
}

/* 带间隔的等宽 */
.equal-with-gap {
  display: flex;
  gap: 1rem;
}

.equal-with-gap > * {
  flex: 1;
}
```

### 4.3 固定+自适应

```css
/* 固定侧边栏 + 自适应内容 */
.layout {
  display: flex;
}

.sidebar {
  flex: 0 0 250px; /* 固定250px */
}

.main {
  flex: 1; /* 自适应剩余空间 */
}

/* 响应式 */
@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  
  .sidebar {
    flex: 0 0 auto;
  }
}
```

### 4.4 圣杯布局

```css
/* 页眉+内容+页脚 */
.holy-grail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header,
.footer {
  flex: 0 0 auto; /* 固定高度 */
}

.content {
  display: flex;
  flex: 1; /* 占据剩余空间 */
}

.nav {
  flex: 0 0 200px; /* 固定侧边栏 */
  order: -1; /* 移到左侧 */
}

.main {
  flex: 1; /* 主内容自适应 */
}

.aside {
  flex: 0 0 200px; /* 固定侧边栏 */
}
```

### 4.5 卡片网格

```css
/* 自适应卡片网格 */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 300px; /* 最小300px,自动换行 */
  max-width: 100%;
}

/* 或使用calc */
.card-fixed {
  flex: 0 0 calc(33.333% - 1rem);
}

@media (max-width: 768px) {
  .card-fixed {
    flex: 0 0 calc(50% - 1rem);
  }
}

@media (max-width: 480px) {
  .card-fixed {
    flex: 0 0 100%;
  }
}
```

## 5. React Flexbox组件

### 5.1 Flex容器组件

```tsx
// Flex.tsx
interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  gap?: string | number;
  className?: string;
}

export function Flex({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'flex-start',
  align = 'stretch',
  alignContent,
  gap,
  className = ''
}: FlexProps) {
  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent: justify,
    alignItems: align,
    alignContent,
    gap
  };
  
  return (
    <div style={styles} className={className}>
      {children}
    </div>
  );
}

// 使用
<Flex direction="row" justify="space-between" align="center" gap="1rem">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Flex>
```

### 5.2 Flex项目组件

```tsx
// FlexItem.tsx
interface FlexItemProps {
  children: React.ReactNode;
  grow?: number;
  shrink?: number;
  basis?: string | number;
  order?: number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  className?: string;
}

export function FlexItem({
  children,
  grow = 0,
  shrink = 1,
  basis = 'auto',
  order,
  alignSelf,
  className = ''
}: FlexItemProps) {
  const styles: React.CSSProperties = {
    flexGrow: grow,
    flexShrink: shrink,
    flexBasis: basis,
    order,
    alignSelf
  };
  
  return (
    <div style={styles} className={className}>
      {children}
    </div>
  );
}

// 使用
<Flex>
  <FlexItem grow={1} basis="200px">Flexible</FlexItem>
  <FlexItem grow={0} shrink={0} basis="300px">Fixed</FlexItem>
  <FlexItem grow={2}>Double width</FlexItem>
</Flex>
```

### 5.3 布局组件库

```tsx
// Layout.tsx - 常用布局组件

// 水平垂直居中
export function Center({ children }: { children: React.ReactNode }) {
  return (
    <Flex justify="center" align="center" className="h-full">
      {children}
    </Flex>
  );
}

// 页面布局
export function PageLayout({
  header,
  children,
  footer
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Flex direction="column" className="min-h-screen">
      <header className="flex-none">{header}</header>
      <main className="flex-1">{children}</main>
      <footer className="flex-none">{footer}</footer>
    </Flex>
  );
}

// 侧边栏布局
export function SidebarLayout({
  sidebar,
  children
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Flex className="h-full">
      <aside className="flex-none w-64">{sidebar}</aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </Flex>
  );
}

// 响应式卡片网格
export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <Flex wrap="wrap" gap="1rem">
      {Children.map(children, child => (
        <div className="flex-grow-0 flex-shrink-0 basis-[300px] max-w-full">
          {child}
        </div>
      ))}
    </Flex>
  );
}

// Stack组件
export function Stack({
  children,
  spacing = '1rem',
  direction = 'column'
}: {
  children: React.ReactNode;
  spacing?: string;
  direction?: 'row' | 'column';
}) {
  return (
    <Flex direction={direction} gap={spacing}>
      {children}
    </Flex>
  );
}
```

## 6. Flexbox与其他布局对比

### 6.1 Flexbox vs Grid

```css
/* Flexbox - 一维布局 */
.flex-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-layout > * {
  flex: 1 1 300px;
}

/* Grid - 二维布局 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* 何时使用Flexbox:
   - 一维排列(行或列)
   - 内容驱动的布局
   - 动态数量的项目
   - 简单的对齐需求 */

/* 何时使用Grid:
   - 二维布局(行和列)
   - 精确的布局控制
   - 复杂的网格系统
   - 固定的布局结构 */
```

### 6.2 Flexbox vs Float

```css
/* Float - 传统布局 */
.float-layout::after {
  content: '';
  display: table;
  clear: both;
}

.float-layout > * {
  float: left;
  width: 33.333%;
}

/* Flexbox - 现代布局 */
.flex-layout {
  display: flex;
}

.flex-layout > * {
  flex: 1;
}

/* Flexbox优势:
   - 不需要清除浮动
   - 更好的垂直对齐
   - 等高列
   - 更灵活的排序
   - 响应式更简单 */
```

## 7. 实战案例

### 7.1 导航栏

```tsx
// Navbar.tsx
export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      {/* Logo */}
      <div className="flex-none">
        <img src="/logo.svg" alt="Logo" className="h-8" />
      </div>
      
      {/* 导航链接 */}
      <ul className="flex gap-6 flex-1 justify-center">
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
      
      {/* 操作按钮 */}
      <div className="flex gap-3 flex-none">
        <button className="btn-secondary">登录</button>
        <button className="btn-primary">注册</button>
      </div>
    </nav>
  );
}

// 响应式导航
export function ResponsiveNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <nav className="flex flex-wrap items-center justify-between p-4">
      <div className="flex items-center justify-between w-full md:w-auto">
        <img src="/logo.svg" alt="Logo" className="h-8" />
        
        {isMobile && (
          <button onClick={() => setIsOpen(!isOpen)}>
            菜单
          </button>
        )}
      </div>
      
      <ul className={`
        flex flex-col md:flex-row gap-4
        w-full md:w-auto md:flex-1 md:justify-center
        ${isMobile && !isOpen ? 'hidden' : 'flex'}
      `}>
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
      
      <div className="flex gap-3">
        <button>登录</button>
        <button>注册</button>
      </div>
    </nav>
  );
}
```

### 7.2 表单布局

```tsx
// Form.tsx
export function FlexForm() {
  return (
    <form className="flex flex-col gap-6 max-w-2xl mx-auto p-6">
      {/* 单行字段 */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name">姓名</label>
        <input type="text" id="name" className="input" />
      </div>
      
      {/* 并排字段 */}
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="email">邮箱</label>
          <input type="email" id="email" className="input" />
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="phone">电话</label>
          <input type="tel" id="phone" className="input" />
        </div>
      </div>
      
      {/* 按钮组 */}
      <div className="flex gap-3 justify-end">
        <button type="button" className="btn-secondary">取消</button>
        <button type="submit" className="btn-primary">提交</button>
      </div>
    </form>
  );
}
```

### 7.3 卡片列表

```tsx
// CardList.tsx
export function CardList({ items }: { items: Item[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {items.map(item => (
        <div
          key={item.id}
          className="flex-grow-0 flex-shrink-0 basis-[calc(33.333%-1rem)] max-w-full"
        >
          <Card item={item} />
        </div>
      ))}
    </div>
  );
}

// Card组件
function Card({ item }: { item: Item }) {
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <img src={item.image} alt={item.title} className="flex-none h-48 object-cover" />
      
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <p className="flex-1 text-gray-600 mb-4">{item.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${item.price}</span>
          <button className="btn-primary">加入购物车</button>
        </div>
      </div>
    </div>
  );
}
```

## 8. 性能优化

### 8.1 避免布局抖动

```typescript
// 避免频繁的flex计算
// 使用固定值或缓存计算结果

// ❌ 不好 - 每次渲染都计算
function BadComponent() {
  return (
    <div style={{ flex: calculateFlex() }}>
      Content
    </div>
  );
}

// ✅ 好 - 缓存计算结果
function GoodComponent() {
  const flexValue = useMemo(() => calculateFlex(), []);
  
  return (
    <div style={{ flex: flexValue }}>
      Content
    </div>
  );
}
```

### 8.2 使用will-change

```css
/* 优化flex动画 */
.animated-flex {
  will-change: flex-basis;
  transition: flex-basis 0.3s;
}

.animated-flex:hover {
  flex-basis: 300px;
}
```

## 9. 最佳实践

```typescript
const flexboxBestPractices = {
  container: [
    '明确设置display: flex',
    '合理使用flex-wrap处理溢出',
    '使用gap代替margin',
    '注意主轴和交叉轴方向',
    '为多行布局设置align-content'
  ],
  
  items: [
    '优先使用flex简写',
    '理解flex-grow的计算方式',
    '设置flex-shrink防止意外缩小',
    '使用flex-basis代替width/height',
    '谨慎使用order改变顺序'
  ],
  
  responsive: [
    '移动端优先使用column',
    '桌面端切换到row',
    '使用媒体查询调整flex值',
    '考虑换行策略',
    '测试不同内容长度'
  ],
  
  accessibility: [
    '保持逻辑DOM顺序',
    '谨慎使用order',
    '确保键盘导航顺序',
    '屏幕阅读器兼容',
    '足够的触摸目标'
  ]
};
```

## 10. 总结

Flexbox布局的核心要点:

1. **容器属性**: display, flex-direction, flex-wrap, justify-content, align-items
2. **项目属性**: flex-grow, flex-shrink, flex-basis, order, align-self
3. **简写属性**: flex, flex-flow
4. **间隔**: gap替代margin
5. **响应式**: 配合媒体查询
6. **性能**: 避免频繁计算
7. **可访问性**: 保持DOM顺序

通过掌握Flexbox,可以轻松实现各种复杂的响应式布局。

