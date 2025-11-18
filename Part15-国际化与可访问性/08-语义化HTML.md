# 语义化HTML - 可访问性基石完整指南

## 1. 语义化HTML概述

### 1.1 什么是语义化HTML

语义化HTML是使用具有明确含义的HTML标签来构建网页结构,让标签本身就能表达内容的含义,而不仅仅是样式呈现。

**核心价值:**
- **可访问性**: 辅助技术能理解内容结构
- **SEO优化**: 搜索引擎更好地理解页面
- **可维护性**: 代码结构清晰易懂
- **跨设备兼容**: 适应不同的浏览环境

### 1.2 语义化vs非语义化

```html
<!-- ❌ 非语义化 - div汤 -->
<div class="header">
  <div class="nav">
    <div class="nav-item">首页</div>
    <div class="nav-item">关于</div>
  </div>
</div>
<div class="content">
  <div class="article">
    <div class="title">文章标题</div>
    <div class="text">文章内容...</div>
  </div>
</div>
<div class="footer">
  <div class="copyright">版权信息</div>
</div>

<!-- ✅ 语义化 -->
<header>
  <nav>
    <a href="/">首页</a>
    <a href="/about">关于</a>
  </nav>
</header>
<main>
  <article>
    <h1>文章标题</h1>
    <p>文章内容...</p>
  </article>
</main>
<footer>
  <p>版权信息</p>
</footer>
```

## 2. 文档结构标签

### 2.1 主要结构标签

```html
<!-- header: 页面或区域的头部 -->
<header>
  <h1>网站标题</h1>
  <nav>
    <ul>
      <li><a href="/">首页</a></li>
      <li><a href="/about">关于</a></li>
    </ul>
  </nav>
</header>

<!-- nav: 导航区域 -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/products">产品</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>

<!-- main: 主要内容(页面只能有一个) -->
<main>
  <h1>页面主标题</h1>
  <p>主要内容...</p>
</main>

<!-- article: 独立的内容单元 -->
<article>
  <header>
    <h2>文章标题</h2>
    <p>发布时间: <time datetime="2024-01-15">2024年1月15日</time></p>
  </header>
  <p>文章内容...</p>
  <footer>
    <p>作者: 张三</p>
  </footer>
</article>

<!-- section: 内容分区 -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">产品特性</h2>
  <p>特性介绍...</p>
</section>

<!-- aside: 侧边栏或相关内容 -->
<aside aria-label="相关文章">
  <h3>相关阅读</h3>
  <ul>
    <li><a href="/article1">文章1</a></li>
    <li><a href="/article2">文章2</a></li>
  </ul>
</aside>

<!-- footer: 页脚 -->
<footer>
  <p>&copy; 2024 公司名称</p>
  <nav aria-label="页脚导航">
    <a href="/privacy">隐私政策</a>
    <a href="/terms">服务条款</a>
  </nav>
</footer>
```

### 2.2 React组件中的语义化结构

```tsx
// PageLayout.tsx
export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}

// Header.tsx
export function Header() {
  return (
    <header className="site-header">
      <div className="logo">
        <h1>网站名称</h1>
      </div>
      <nav aria-label="主导航">
        <ul>
          <li><Link to="/">首页</Link></li>
          <li><Link to="/about">关于</Link></li>
          <li><Link to="/contact">联系</Link></li>
        </ul>
      </nav>
    </header>
  );
}

// Article.tsx
export function Article({ post }: { post: Post }) {
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <p>
          作者: <span>{post.author}</span>
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
        </p>
      </header>
      
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <footer>
        <p>标签: {post.tags.join(', ')}</p>
      </footer>
    </article>
  );
}
```

## 3. 标题层级

### 3.1 正确的标题结构

```html
<!-- ✅ 正确的层级结构 -->
<h1>页面主标题</h1>
  <h2>第一个主要章节</h2>
    <h3>子章节</h3>
    <h3>另一个子章节</h3>
  <h2>第二个主要章节</h2>
    <h3>子章节</h3>
      <h4>更深层级</h4>

<!-- ❌ 错误 - 跳级 -->
<h1>标题</h1>
<h3>跳过了h2</h3>

<!-- ❌ 错误 - 多个h1 -->
<h1>第一个h1</h1>
<h1>第二个h1</h1>

<!-- ❌ 错误 - 仅用于样式 -->
<h3 class="small-text">应该用p标签的内容</h3>
```

### 3.2 动态标题组件

```tsx
// Heading.tsx
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  level: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ level, children, className }: HeadingProps) {
  const Tag = `h${level}` as const;
  
  return <Tag className={className}>{children}</Tag>;
}

// 使用
<Heading level={1}>主标题</Heading>
<Heading level={2}>副标题</Heading>

// Section组件自动管理层级
export function Section({ 
  title, 
  children, 
  level = 2 
}: { 
  title: string; 
  children: React.ReactNode;
  level?: HeadingLevel;
}) {
  return (
    <section>
      <Heading level={level}>{title}</Heading>
      {children}
    </section>
  );
}
```

### 3.3 标题大纲检测

```tsx
// 检测页面标题结构
function analyzeHeadingStructure() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const structure: Array<{ level: number; text: string }> = [];
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    structure.push({
      level,
      text: heading.textContent || ''
    });
  });
  
  // 检查问题
  const issues: string[] = [];
  
  // 检查是否有h1
  if (!structure.some(h => h.level === 1)) {
    issues.push('页面缺少h1标签');
  }
  
  // 检查是否有多个h1
  if (structure.filter(h => h.level === 1).length > 1) {
    issues.push('页面有多个h1标签');
  }
  
  // 检查是否跳级
  for (let i = 1; i < structure.length; i++) {
    const diff = structure[i].level - structure[i - 1].level;
    if (diff > 1) {
      issues.push(`标题跳级: ${structure[i - 1].text} (h${structure[i - 1].level}) -> ${structure[i].text} (h${structure[i].level})`);
    }
  }
  
  return { structure, issues };
}
```

## 4. 列表标签

### 4.1 有序列表和无序列表

```html
<!-- 无序列表 -->
<ul>
  <li>项目1</li>
  <li>项目2</li>
  <li>项目3</li>
</ul>

<!-- 有序列表 -->
<ol>
  <li>第一步</li>
  <li>第二步</li>
  <li>第三步</li>
</ol>

<!-- 嵌套列表 -->
<ul>
  <li>
    水果
    <ul>
      <li>苹果</li>
      <li>香蕉</li>
    </ul>
  </li>
  <li>
    蔬菜
    <ul>
      <li>胡萝卜</li>
      <li>西兰花</li>
    </ul>
  </li>
</ul>

<!-- 描述列表 -->
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
  
  <dt>JavaScript</dt>
  <dd>编程语言</dd>
</dl>
```

### 4.2 React列表组件

```tsx
// List.tsx
interface ListProps {
  items: string[];
  ordered?: boolean;
}

export function List({ items, ordered = false }: ListProps) {
  const Tag = ordered ? 'ol' : 'ul';
  
  return (
    <Tag>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
}

// DefinitionList.tsx
interface Definition {
  term: string;
  description: string;
}

export function DefinitionList({ items }: { items: Definition[] }) {
  return (
    <dl>
      {items.map((item, index) => (
        <div key={index}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}

// 使用
<List items={['项目1', '项目2', '项目3']} />
<List items={['步骤1', '步骤2', '步骤3']} ordered />
<DefinitionList items={[
  { term: 'HTML', description: '超文本标记语言' },
  { term: 'CSS', description: '层叠样式表' }
]} />
```

## 5. 表格标签

### 5.1 语义化表格

```html
<table>
  <caption>2024年销售数据</caption>
  
  <thead>
    <tr>
      <th scope="col">月份</th>
      <th scope="col">销售额</th>
      <th scope="col">增长率</th>
    </tr>
  </thead>
  
  <tbody>
    <tr>
      <th scope="row">1月</th>
      <td>100,000</td>
      <td>5%</td>
    </tr>
    <tr>
      <th scope="row">2月</th>
      <td>120,000</td>
      <td>20%</td>
    </tr>
  </tbody>
  
  <tfoot>
    <tr>
      <th scope="row">总计</th>
      <td>220,000</td>
      <td>12.5%</td>
    </tr>
  </tfoot>
</table>
```

### 5.2 复杂表格

```html
<!-- 合并单元格 -->
<table>
  <caption>课程表</caption>
  <thead>
    <tr>
      <th scope="col">时间</th>
      <th scope="col">周一</th>
      <th scope="col">周二</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">9:00-10:00</th>
      <td>数学</td>
      <td rowspan="2">物理实验</td>
    </tr>
    <tr>
      <th scope="row">10:00-11:00</th>
      <td>英语</td>
    </tr>
  </tbody>
</table>

<!-- 列组 -->
<table>
  <colgroup>
    <col style="width: 30%">
    <col style="width: 70%">
  </colgroup>
  <thead>
    <tr>
      <th>项目</th>
      <th>描述</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>项目1</td>
      <td>描述1</td>
    </tr>
  </tbody>
</table>
```

### 5.3 React表格组件

```tsx
// Table.tsx
interface Column {
  key: string;
  header: string;
  width?: string;
}

interface TableProps {
  caption?: string;
  columns: Column[];
  data: Record<string, any>[];
}

export function Table({ caption, columns, data }: TableProps) {
  return (
    <table>
      {caption && <caption>{caption}</caption>}
      
      <colgroup>
        {columns.map(col => (
          <col key={col.key} style={{ width: col.width }} />
        ))}
      </colgroup>
      
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} scope="col">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col, colIndex) => {
              const Cell = colIndex === 0 ? 'th' : 'td';
              const props = colIndex === 0 ? { scope: 'row' } : {};
              
              return (
                <Cell key={col.key} {...props}>
                  {row[col.key]}
                </Cell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 使用
<Table
  caption="用户列表"
  columns={[
    { key: 'name', header: '姓名', width: '30%' },
    { key: 'email', header: '邮箱', width: '40%' },
    { key: 'role', header: '角色', width: '30%' }
  ]}
  data={[
    { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
    { name: '李四', email: 'lisi@example.com', role: '用户' }
  ]}
/>
```

## 6. 表单标签

### 6.1 语义化表单

```html
<form>
  <!-- 使用fieldset和legend分组 -->
  <fieldset>
    <legend>个人信息</legend>
    
    <!-- label关联input -->
    <div>
      <label for="name">姓名</label>
      <input type="text" id="name" name="name" required>
    </div>
    
    <div>
      <label for="email">邮箱</label>
      <input type="email" id="email" name="email" required>
    </div>
  </fieldset>
  
  <fieldset>
    <legend>账号设置</legend>
    
    <div>
      <label for="password">密码</label>
      <input type="password" id="password" name="password" required>
      <small id="password-help">至少8个字符</small>
    </div>
  </fieldset>
  
  <!-- 单选按钮组 -->
  <fieldset>
    <legend>性别</legend>
    <label>
      <input type="radio" name="gender" value="male">
      男
    </label>
    <label>
      <input type="radio" name="gender" value="female">
      女
    </label>
  </fieldset>
  
  <!-- 复选框 -->
  <label>
    <input type="checkbox" name="terms" required>
    我同意服务条款
  </label>
  
  <!-- 下拉选择 -->
  <label for="country">国家</label>
  <select id="country" name="country">
    <optgroup label="亚洲">
      <option value="cn">中国</option>
      <option value="jp">日本</option>
    </optgroup>
    <optgroup label="欧洲">
      <option value="uk">英国</option>
      <option value="fr">法国</option>
    </optgroup>
  </select>
  
  <!-- 文本域 -->
  <label for="message">留言</label>
  <textarea id="message" name="message" rows="4"></textarea>
  
  <button type="submit">提交</button>
</form>
```

### 6.2 React表单组件

```tsx
// FormField.tsx
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  required = false,
  helpText,
  error
}: FormFieldProps) {
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-label="必填">*</span>}
      </label>
      
      <input
        type={type}
        id={inputId}
        name={name}
        required={required}
        aria-describedby={helpText ? helpId : undefined}
        aria-invalid={!!error}
        aria-errormessage={error ? errorId : undefined}
      />
      
      {helpText && (
        <small id={helpId}>{helpText}</small>
      )}
      
      {error && (
        <div id={errorId} role="alert" className="error">
          {error}
        </div>
      )}
    </div>
  );
}

// RadioGroup.tsx
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  legend: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
}

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange
}: RadioGroupProps) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {options.map(option => {
        const id = `${name}-${option.value}`;
        return (
          <label key={option.value} htmlFor={id}>
            <input
              type="radio"
              id={id}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </fieldset>
  );
}
```

## 7. 媒体标签

### 7.1 图片

```html
<!-- 基础图片 -->
<img src="photo.jpg" alt="海滩日落景色">

<!-- 装饰性图片 -->
<img src="decoration.png" alt="" role="presentation">

<!-- figure和figcaption -->
<figure>
  <img src="chart.png" alt="2024年销售趋势图">
  <figcaption>图1: 2024年销售趋势</figcaption>
</figure>

<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 1200px)" srcset="large.jpg">
  <source media="(min-width: 768px)" srcset="medium.jpg">
  <img src="small.jpg" alt="响应式图片">
</picture>

<!-- 带链接的图片 -->
<a href="/details">
  <img src="product.jpg" alt="产品名称 - 点击查看详情">
</a>
```

### 7.2 音频和视频

```html
<!-- 音频 -->
<figure>
  <figcaption>收听播客第1集</figcaption>
  <audio controls>
    <source src="podcast.mp3" type="audio/mpeg">
    <source src="podcast.ogg" type="audio/ogg">
    <track kind="captions" src="captions.vtt" srclang="zh" label="中文字幕">
    您的浏览器不支持音频播放。
  </audio>
</figure>

<!-- 视频 -->
<figure>
  <figcaption>产品演示视频</figcaption>
  <video controls width="640" height="360">
    <source src="demo.mp4" type="video/mp4">
    <source src="demo.webm" type="video/webm">
    <track kind="captions" src="captions-zh.vtt" srclang="zh" label="中文字幕">
    <track kind="captions" src="captions-en.vtt" srclang="en" label="English">
    您的浏览器不支持视频播放。
  </video>
</figure>
```

### 7.3 React媒体组件

```tsx
// Image.tsx
interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  decorative?: boolean;
}

export function Image({ src, alt, caption, decorative = false }: ImageProps) {
  const img = (
    <img
      src={src}
      alt={decorative ? '' : alt}
      role={decorative ? 'presentation' : undefined}
    />
  );
  
  if (caption) {
    return (
      <figure>
        {img}
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }
  
  return img;
}

// Video.tsx
interface VideoProps {
  src: string;
  captions?: Array<{
    src: string;
    lang: string;
    label: string;
  }>;
  title?: string;
}

export function Video({ src, captions = [], title }: VideoProps) {
  return (
    <figure>
      {title && <figcaption>{title}</figcaption>}
      <video controls>
        <source src={src} type="video/mp4" />
        {captions.map(caption => (
          <track
            key={caption.lang}
            kind="captions"
            src={caption.src}
            srcLang={caption.lang}
            label={caption.label}
          />
        ))}
        您的浏览器不支持视频播放。
      </video>
    </figure>
  );
}
```

## 8. 文本语义标签

### 8.1 内联语义标签

```html
<!-- 强调 -->
<p>这是<em>强调</em>的文本</p>
<p>这是<strong>重要</strong>的文本</p>

<!-- 引用 -->
<p>正如<cite>乔布斯</cite>所说: <q>Stay hungry, stay foolish.</q></p>
<blockquote cite="https://example.com">
  <p>长篇引用内容...</p>
  <footer>— <cite>作者名</cite></footer>
</blockquote>

<!-- 缩写 -->
<p><abbr title="HyperText Markup Language">HTML</abbr>是标记语言</p>

<!-- 代码 -->
<p>使用<code>console.log()</code>输出日志</p>
<pre><code>
function hello() {
  console.log('Hello World');
}
</code></pre>

<!-- 键盘输入 -->
<p>按<kbd>Ctrl</kbd> + <kbd>C</kbd>复制</p>

<!-- 示例输出 -->
<p>命令执行结果: <samp>File not found</samp></p>

<!-- 变量 -->
<p>方程式: <var>x</var> + <var>y</var> = <var>z</var></p>

<!-- 时间 -->
<p>发布于<time datetime="2024-01-15T10:00:00">2024年1月15日</time></p>

<!-- 标记文本 -->
<p>搜索结果中的<mark>关键词</mark>会高亮显示</p>

<!-- 删除和插入 -->
<p>价格: <del>¥100</del> <ins>¥80</ins></p>

<!-- 上标和下标 -->
<p>E = mc<sup>2</sup></p>
<p>H<sub>2</sub>O是水的化学式</p>

<!-- 定义 -->
<p><dfn>HTML</dfn>是一种标记语言</p>
```

### 8.2 React语义组件

```tsx
// Quote.tsx
interface QuoteProps {
  children: React.ReactNode;
  cite?: string;
  author?: string;
}

export function Quote({ children, cite, author }: QuoteProps) {
  return (
    <blockquote cite={cite}>
      {children}
      {author && (
        <footer>
          — <cite>{author}</cite>
        </footer>
      )}
    </blockquote>
  );
}

// CodeBlock.tsx
interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <pre>
      <code className={language ? `language-${language}` : undefined}>
        {code}
      </code>
    </pre>
  );
}

// Abbreviation.tsx
export function Abbreviation({
  children,
  title
}: {
  children: string;
  title: string;
}) {
  return <abbr title={title}>{children}</abbr>;
}

// 使用
<Quote author="史蒂夫·乔布斯" cite="https://example.com">
  Stay hungry, stay foolish.
</Quote>

<CodeBlock
  language="javascript"
  code="console.log('Hello World');"
/>

<Abbreviation title="HyperText Markup Language">
  HTML
</Abbreviation>
```

## 9. 交互元素

### 9.1 details和summary

```html
<!-- 折叠面板 -->
<details>
  <summary>什么是HTML?</summary>
  <p>HTML是超文本标记语言,用于创建网页结构。</p>
</details>

<details open>
  <summary>常见问题</summary>
  <dl>
    <dt>如何学习HTML?</dt>
    <dd>通过实践和阅读文档</dd>
    
    <dt>HTML5有什么新特性?</dt>
    <dd>新增了语义化标签、多媒体支持等</dd>
  </dl>
</details>
```

### 9.2 dialog元素

```html
<dialog id="myDialog">
  <h2>对话框标题</h2>
  <p>对话框内容</p>
  <form method="dialog">
    <button value="cancel">取消</button>
    <button value="confirm">确认</button>
  </form>
</dialog>

<button onclick="document.getElementById('myDialog').showModal()">
  打开对话框
</button>
```

### 9.3 React交互组件

```tsx
// Accordion.tsx
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false
}: AccordionItemProps) {
  return (
    <details open={defaultOpen}>
      <summary>{title}</summary>
      <div className="accordion-content">{children}</div>
    </details>
  );
}

// Dialog.tsx
export function Dialog({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);
  
  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <h2>{title}</h2>
      {children}
      <form method="dialog">
        <button onClick={onClose}>关闭</button>
      </form>
    </dialog>
  );
}
```

## 10. 语义化检查工具

### 10.1 HTML验证

```typescript
// 检查常见语义化问题
function validateSemantics() {
  const issues: string[] = [];
  
  // 检查是否有main元素
  const mains = document.querySelectorAll('main');
  if (mains.length === 0) {
    issues.push('缺少<main>元素');
  } else if (mains.length > 1) {
    issues.push('页面有多个<main>元素');
  }
  
  // 检查标题层级
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) {
    issues.push('缺少<h1>标题');
  } else if (h1s.length > 1) {
    issues.push('页面有多个<h1>标题');
  }
  
  // 检查图片alt属性
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      issues.push(`图片${index + 1}缺少alt属性`);
    }
  });
  
  // 检查表单label
  const inputs = document.querySelectorAll('input:not([type="hidden"])');
  inputs.forEach((input, index) => {
    const id = input.id;
    if (!id || !document.querySelector(`label[for="${id}"]`)) {
      issues.push(`输入框${index + 1}缺少关联的label`);
    }
  });
  
  // 检查链接文本
  const links = document.querySelectorAll('a');
  links.forEach((link, index) => {
    const text = link.textContent?.trim();
    if (!text || text === 'click here' || text === '点击这里') {
      issues.push(`链接${index + 1}缺少描述性文本`);
    }
  });
  
  return issues;
}
```

### 10.2 React组件验证

```tsx
// 开发环境语义检查Hook
export function useSemanticValidation() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const issues = validateSemantics();
      
      if (issues.length > 0) {
        console.warn('语义化问题:', issues);
      }
    }
  }, []);
}

// 在根组件使用
function App() {
  useSemanticValidation();
  
  return <div>...</div>;
}
```

## 11. 最佳实践

```typescript
const semanticBestPractices = {
  structure: [
    '使用header, main, footer构建页面结构',
    '每个页面只有一个main元素',
    '使用nav包裹导航区域',
    '使用article表示独立内容',
    '使用section划分内容区域'
  ],
  
  headings: [
    '每页只有一个h1',
    '不要跳级使用标题',
    '标题要描述内容而非样式',
    '使用标题建立文档大纲'
  ],
  
  forms: [
    '使用label关联表单控件',
    '使用fieldset和legend分组',
    '提供清晰的错误提示',
    '标记必填字段'
  ],
  
  media: [
    '所有图片提供alt文本',
    '装饰性图片使用空alt',
    '使用figure和figcaption',
    '视频提供字幕'
  ],
  
  links: [
    '使用描述性链接文本',
    '避免"点击这里"等无意义文本',
    '外部链接标明',
    '下载链接标明文件类型和大小'
  ]
};
```

## 12. 总结

语义化HTML的关键要点:

1. **结构清晰**: 使用语义标签构建文档结构
2. **标题层级**: 正确的h1-h6层级关系
3. **表单可访问**: label、fieldset、legend的正确使用
4. **媒体元素**: 图片alt、视频字幕
5. **文本语义**: strong、em、time等内联标签
6. **避免div汤**: 优先使用语义标签而非div
7. **持续验证**: 使用工具检查语义问题

通过正确使用语义化HTML,可以提升可访问性、SEO和代码可维护性。

