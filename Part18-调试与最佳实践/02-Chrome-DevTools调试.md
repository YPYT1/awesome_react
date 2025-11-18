# Chrome DevTools调试 - 浏览器调试完全指南

## 1. Chrome DevTools概述

### 1.1 核心面板

```typescript
const devToolsPanels = {
  Elements: 'DOM结构和样式',
  Console: 'JavaScript控制台',
  Sources: '源代码调试',
  Network: '网络请求',
  Performance: '性能分析',
  Memory: '内存分析',
  Application: '应用数据',
  Lighthouse: '性能审计'
};
```

### 1.2 React调试相关

```typescript
const reactDebugging = {
  Elements: '查看React生成的DOM',
  Console: '查看日志和错误',
  Sources: '断点调试React代码',
  Network: '查看API请求',
  Performance: '分析React渲染性能',
  Memory: '检查内存泄漏'
};
```

## 2. Sources断点调试

### 2.1 设置断点

```typescript
const breakpoints = {
  普通断点: `
    1. 打开Sources面板
    2. 找到源文件
    3. 点击行号设置断点
    4. 刷新页面触发断点
  `,
  
  条件断点: `
    右键行号 -> Add conditional breakpoint
    
    条件示例:
    - count > 10
    - user.id === 123
    - items.length > 100
    
    只有条件满足时才暂停
  `,
  
  日志断点: `
    右键行号 -> Add logpoint
    
    日志内容:
    'Count is', count, 'User is', user
    
    不暂停执行，只输出日志
  `
};
```

### 2.2 调试控制

```typescript
const debugControls = {
  快捷键: {
    继续执行: 'F8 或 Ctrl+\\',
    单步跳过: 'F10',
    单步进入: 'F11',
    单步跳出: 'Shift+F11',
    禁用断点: 'Ctrl+F8'
  },
  
  Scope查看: `
    断点暂停时:
    - Local: 局部变量
    - Closure: 闭包变量
    - Global: 全局变量
    - this: 当前上下文
  `,
  
  Call Stack: `
    查看调用栈:
    - 当前函数
    - 调用者
    - 完整调用链
    
    点击可跳转到对应位置
  `
};
```

## 3. Console调试

### 3.1 console方法

```typescript
const consoleMethods = {
  log: 'console.log("message", value)',
  warn: 'console.warn("warning message")',
  error: 'console.error("error message")',
  table: 'console.table([{id:1}, {id:2}])',
  group: `
    console.group('Group');
    console.log('item 1');
    console.log('item 2');
    console.groupEnd();
  `,
  time: `
    console.time('operation');
    // 操作
    console.timeEnd('operation');
  `,
  trace: 'console.trace() // 打印调用栈',
  assert: 'console.assert(condition, "message")'
};
```

### 3.2 React调试技巧

```typescript
const reactConsoleTips = {
  查看组件实例: `
    // 选中元素后在Console中
    $r  // React组件实例
    
    $r.props  // 查看props
    $r.state  // 查看state (类组件)
  `,
  
  查看DOM元素: `
    $0  // 最近选择的元素
    $1  // 倒数第二个
    
    $0.innerText  // 文本内容
    $0.classList  // class列表
  `,
  
  测试函数: `
    // 在Console直接调用组件方法
    $r.handleClick()
    
    // 触发state更新
    $r.setState({ count: 10 })
  `
};
```

## 4. Network面板

### 4.1 请求分析

```typescript
const networkAnalysis = {
  过滤请求: {
    XHR: '只显示XHR请求',
    Fetch: '只显示Fetch请求',
    自定义: '使用过滤器'
  },
  
  查看详情: {
    Headers: '请求头和响应头',
    Preview: '格式化预览',
    Response: '原始响应',
    Timing: '请求时间分析'
  },
  
  性能分析: `
    Timing标签显示:
    - Queueing: 排队等待
    - DNS Lookup: DNS查询
    - Initial connection: 建立连接
    - Request sent: 发送请求
    - Waiting (TTFB): 等待首字节
    - Content Download: 下载内容
  `
};
```

## 5. Performance分析

### 5.1 录制性能

```typescript
const performanceRecording = {
  步骤: `
    1. 打开Performance面板
    2. 点击录制(圆点)
    3. 执行操作
    4. 停止录制
    5. 分析结果
  `,
  
  分析指标: {
    FPS: '帧率图表',
    CPU: 'CPU使用',
    NET: '网络活动',
    Screenshots: '页面截图'
  },
  
  火焰图: `
    Main区域显示:
    - JavaScript执行
    - 渲染
    - 绘制
    - 其他
    
    找到长任务(红色三角)进行优化
  `
};
```

## 6. Memory分析

### 6.1 堆快照

```typescript
const heapSnapshot = {
  作用: '检查内存泄漏',
  
  步骤: `
    1. 打开Memory面板
    2. 选择Heap snapshot
    3. Take snapshot
    4. 执行操作(如导航)
    5. Take snapshot again
    6. 对比两个快照
  `,
  
  查找泄漏: `
    1. Comparison视图
    2. 按Delta排序
    3. 找到增长的对象
    4. 查看Retainers(保持引用的对象)
    5. 定位泄漏代码
  `
};
```

## 7. 实战调试案例

### 7.1 案例1: 断点调试状态更新

```typescript
// 场景: state更新不符合预期

// 问题代码
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    console.log('Before:', count);
    setCount(count + 1);
    console.log('After:', count);  // 仍然是旧值
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 调试步骤:
// 1. Sources面板找到handleClick函数
// 2. 在console.log('Before')处设置断点
// 3. 点击按钮触发断点
// 4. 查看Scope中的count值
// 5. 单步执行(F10)
// 6. 观察setCount调用
// 7. 发现setCount是异步的
// 8. count值在下次渲染才更新

// 解决方案:
const handleClick = () => {
  setCount(prevCount => {
    console.log('Prev:', prevCount);
    console.log('Next:', prevCount + 1);
    return prevCount + 1;
  });
};
```

### 7.2 案例2: 异步问题调试

```typescript
// 场景: 异步数据获取失败

function DataComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData()
      .then(result => setData(result))
      .catch(err => setError(err));
  }, []);
  
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;
  return <div>{data.title}</div>;
}

// 调试步骤:
// 1. Network面板查看请求
// 2. 检查请求状态码
// 3. 查看Response内容
// 4. 检查Headers
// 5. 查看Timing分析慢在哪

// 在Sources中设置XHR/Fetch断点:
// 1. Sources -> XHR/fetch Breakpoints
// 2. 添加URL模式
// 3. 刷新页面
// 4. 断点暂停在fetch调用
// 5. 单步调试Promise链
```

### 7.3 案例3: 内存泄漏定位

```typescript
// 场景: 页面使用时间越长越慢

// 问题代码
function Component() {
  useEffect(() => {
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    // ❌ 未清理
  }, []);
}

// 调试步骤:
// 1. Memory面板
// 2. 选择Heap snapshot
// 3. Take snapshot (快照1)
// 4. 进入/离开页面多次
// 5. Take snapshot (快照2)
// 6. 选择Comparison视图
// 7. 按Delta排序
// 8. 查找增长的对象

// 发现:
// - Detached DOM nodes增加
// - Event listeners增加
// - 定位到Component

// 修复:
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);
```

### 7.4 案例4: 网络请求优化

```typescript
// 场景: 页面加载慢

// 分析步骤:
// 1. Network面板
// 2. 勾选"Disable cache"
// 3. 刷新页面
// 4. 查看Waterfall图

// 发现问题:
// - 串行请求(waterfall瀑布式)
// - 未压缩资源
// - 未使用HTTP/2
// - 大量小文件请求

// 优化方案:
// 1. 并行请求
Promise.all([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
]);

// 2. 启用压缩
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
});

// 3. 使用HTTP/2
// nginx.conf
listen 443 ssl http2;

// 4. 代码分割
const Heavy = lazy(() => import('./Heavy'));
```

## 8. Performance面板详解

### 8.1 录制性能

```typescript
const performanceRecording = {
  完整录制: `
    1. 打开Performance面板
    2. 点击录制按钮(圆点)
    3. 执行要分析的操作
    4. 点击停止
    5. 分析结果
  `,
  
  重新加载录制: `
    1. 点击重新加载并录制按钮
    2. 自动刷新页面并录制
    3. 停止后分析首屏性能
  `,
  
  快照模式: `
    1. 点击截图按钮
    2. 执行操作
    3. 查看每帧截图
    4. 分析视觉变化
  `
};
```

### 8.2 性能指标分析

```typescript
const performanceMetrics = {
  FPS图表: `
    // 绿色条: 60fps流畅
    // 红色条: 低于60fps,有卡顿
    
    分析:
    - 找到红色区域
    - 对应的时间点
    - 查看Main区域的活动
  `,
  
  CPU使用: `
    // 不同颜色代表不同类型
    - 蓝色: Loading (HTML解析)
    - 黄色: Scripting (JavaScript执行)
    - 紫色: Rendering (样式计算)
    - 绿色: Painting (绘制)
    - 灰色: Idle (空闲)
    
    优化目标:
    - 减少黄色(优化JS)
    - 减少紫色(优化CSS)
    - 减少绿色(减少重绘)
  `,
  
  网络活动: `
    // 显示网络请求时间线
    - 请求开始时间
    - 请求持续时间
    - 并发请求数量
    
    优化:
    - 减少请求数量
    - 增加并发
    - 使用HTTP/2
  `
};
```

### 8.3 火焰图分析

```typescript
const flameChartAnalysis = {
  Main线程: `
    // 显示JavaScript执行
    - 函数调用栈
    - 执行时间
    - 长任务(红色三角)
    
    查看详情:
    1. 点击函数调用
    2. 查看执行时间
    3. 点击链接跳转到源码
    4. 分析性能瓶颈
  `,
  
  长任务优化: `
    // 长任务(>50ms)阻塞主线程
    
    识别:
    - 红色三角标记
    - 点击查看详情
    - 查看调用栈
    
    优化:
    - 代码分割
    - 使用Web Worker
    - 时间切片
    - 优化算法
  `,
  
  React渲染追踪: `
    // User Timing API标记
    - ⚛️ React组件渲染
    - commit阶段
    - passive effects
    
    分析:
    - 哪个组件渲染慢
    - commit阶段耗时
    - effect执行时间
  `
};
```

## 9. Memory面板详解

### 9.1 堆快照分析

```typescript
const heapSnapshotAnalysis = {
  拍摄快照: `
    1. Memory面板
    2. 选择Heap snapshot
    3. Take snapshot
    4. 等待完成
  `,
  
  对比快照: `
    // 查找内存泄漏
    1. 拍摄快照1
    2. 执行操作
    3. 拍摄快照2
    4. 选择Comparison视图
    5. 对比两个快照
    
    分析:
    - Delta: 对象数量变化
    - Size Delta: 内存大小变化
    - Alloc Size: 分配的内存
    
    查找:
    - Delta增长的对象
    - Detached DOM nodes
    - Event listeners
  `,
  
  Retainers追踪: `
    // 查找谁持有对象引用
    1. 选择可疑对象
    2. 查看Retainers部分
    3. 展开引用链
    4. 找到根源
    
    示例:
    Detached HTMLDivElement
    → closure in Component
    → event listener
    → window
  `
};
```

### 9.2 Allocation时间线

```typescript
const allocationTimeline = {
  录制分配: `
    1. Memory -> Allocation instrumentation on timeline
    2. Start
    3. 执行操作
    4. Stop
    
    显示:
    - 蓝色柱: 对象分配
    - 灰色柱: 对象释放
    
    分析:
    - 只有蓝色无灰色: 可能泄漏
    - 选择时间段查看分配的对象
  `,
  
  查找泄漏: `
    1. 选择蓝色柱多的区域
    2. 查看分配的对象
    3. 按Constructor分组
    4. 找到异常增长的类型
    5. 查看Retainers
    6. 定位泄漏代码
  `
};
```

### 9.3 常见内存问题

```typescript
const memoryIssues = {
  DetachedDOMNodes: `
    // 问题: DOM节点删除后仍被引用
    
    原因:
    - 事件监听器未清理
    - 闭包持有引用
    - 全局变量引用
    
    修复:
    useEffect(() => {
      const node = ref.current;
      const handler = () => {};
      node.addEventListener('click', handler);
      
      return () => {
        node.removeEventListener('click', handler);
      };
    }, []);
  `,
  
  定时器泄漏: `
    // 问题: 定时器未清理
    
    修复:
    useEffect(() => {
      const timer = setInterval(() => {}, 1000);
      return () => clearInterval(timer);
    }, []);
  `,
  
  闭包泄漏: `
    // 问题: 闭包捕获大对象
    
    const BigData = new Array(1000000);
    
    function Component() {
      useEffect(() => {
        const handler = () => {
          // 闭包捕获BigData
          console.log(BigData.length);
        };
        
        window.addEventListener('click', handler);
        
        return () => {
          window.removeEventListener('click', handler);
        };
      }, []);
    }
    
    // 修复: 避免捕获大对象
    useEffect(() => {
      const length = BigData.length;
      const handler = () => {
        console.log(length);  // 只捕获length
      };
      
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }, []);
  `
};
```

## 10. Application面板

### 10.1 Storage查看

```typescript
const storageInspection = {
  LocalStorage: `
    // 查看所有localStorage数据
    Application -> Storage -> Local Storage
    
    操作:
    - 双击编辑值
    - 右键删除
    - Clear All清空
  `,
  
  SessionStorage: `
    Application -> Storage -> Session Storage
    
    // 与localStorage类似
    // 但会话结束后清除
  `,
  
  IndexedDB: `
    Application -> Storage -> IndexedDB
    
    // 查看数据库结构
    - 展开数据库
    - 查看对象存储
    - 查看索引
    - 查看数据
  `,
  
  Cookies: `
    Application -> Storage -> Cookies
    
    // 查看cookie详情
    - Name
    - Value
    - Domain
    - Path  
    - Expires
    - HttpOnly
    - Secure
    - SameSite
  `
};
```

### 10.2 Cache Storage

```typescript
const cacheStorage = {
  查看缓存: `
    Application -> Cache -> Cache Storage
    
    // PWA缓存
    - 查看缓存的资源
    - 删除缓存
    - 刷新缓存
  `,
  
  Service Workers: `
    Application -> Service Workers
    
    // Service Worker状态
    - 查看注册的SW
    - 停止/启动
    - 更新SW
    - Unregister
    - Skip waiting
  `
};
```

## 11. 高级调试技巧

### 11.1 条件断点

```typescript
const conditionalBreakpoints = {
  基本用法: `
    // 右键行号 -> Add conditional breakpoint
    
    条件示例:
    count > 10
    user.id === 123
    items.length > 100
    item.name === 'test'
  `,
  
  复杂条件: `
    // 组合条件
    count > 10 && user.role === 'admin'
    
    // 函数调用
    isValid(data) && data.length > 0
    
    // 正则匹配
    /error/i.test(message)
  `,
  
  实用技巧: `
    // 只在特定用户触发
    localStorage.getItem('debug') === 'true'
    
    // 特定时间段
    new Date().getHours() >= 9 && new Date().getHours() <= 17
    
    // 第N次调用时触发
    (window.callCount = (window.callCount || 0) + 1) === 10
  `
};
```

### 11.2 Logpoints

```typescript
const logpointsUsage = {
  基本语法: `
    // 右键行号 -> Add logpoint
    
    // 输出变量
    'count is', count
    
    // 输出表达式
    'User:', user.name, 'Age:', user.age
    
    // 输出复杂对象
    'Data:', JSON.stringify(data, null, 2)
  `,
  
  优势: `
    1. 不暂停执行
    2. 不需要修改源码
    3. 可以随时添加/删除
    4. 查看执行流程
  `,
  
  实际应用: `
    // 追踪函数调用
    'handleClick called with:', event.target
    
    // 追踪状态变化
    'State updated:', prevState, '->', nextState
    
    // 追踪性能
    'Execution time:', performance.now() - startTime
  `
};
```

### 11.3 黑盒脚本

```typescript
const blackboxing = {
  用途: '忽略第三方库代码,只调试自己的代码',
  
  设置: `
    // Sources面板
    1. 右键脚本文件
    2. Blackbox script
    
    // 或Settings配置
    Settings -> Blackboxing
    添加模式: node_modules/.*
  `,
  
  效果: `
    // 单步调试时
    - 自动跳过黑盒脚本
    - Call Stack隐藏黑盒函数
    - 只关注自己的代码
  `,
  
  示例: `
    // 黑盒node_modules
    /node_modules/
    
    // 黑盒polyfills
    /polyfills/
    
    // 黑盒webpack运行时
    /webpack/
  `
};
```

## 12. Console高级技巧

### 12.1 Console API大全

```typescript
const consoleAPI = {
  分组: `
    console.group('Group 1');
    console.log('Item 1');
    console.log('Item 2');
    console.groupEnd();
    
    console.groupCollapsed('Collapsed Group');
    console.log('Hidden by default');
    console.groupEnd();
  `,
  
  表格: `
    const users = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 }
    ];
    
    console.table(users);
    console.table(users, ['name', 'age']);  // 只显示特定列
  `,
  
  计时: `
    console.time('operation');
    // 执行耗时操作
    expensiveComputation();
    console.timeEnd('operation');
    // operation: 245.3ms
    
    // 多个计时器
    console.time('total');
    console.time('step1');
    doStep1();
    console.timeEnd('step1');
    console.time('step2');
    doStep2();
    console.timeEnd('step2');
    console.timeEnd('total');
  `,
  
  计数: `
    function handleClick() {
      console.count('Click count');
    }
    
    // 输出:
    // Click count: 1
    // Click count: 2
    // Click count: 3
    
    console.countReset('Click count');  // 重置计数
  `,
  
  断言: `
    console.assert(user !== null, 'User should not be null');
    console.assert(items.length > 0, 'Items array is empty');
    
    // 断言失败时输出错误
  `,
  
  堆栈追踪: `
    function a() { b(); }
    function b() { c(); }
    function c() { console.trace('Trace from c'); }
    
    a();
    
    // 输出完整调用栈:
    // c
    // b
    // a
  `
};
```

### 12.2 Console过滤

```typescript
const consoleFiltering = {
  级别过滤: `
    // Console工具栏
    - All: 所有消息
    - Errors: 只显示错误
    - Warnings: 只显示警告
    - Info: 信息消息
    - Verbose: 详细日志
  `,
  
  文本过滤: `
    // Filter输入框
    error          // 包含error的消息
    -node_modules  // 排除node_modules
    /^Warning/     // 正则匹配
  `,
  
  来源过滤: `
    // 按文件过滤
    file:Component.tsx
    
    // 按URL过滤
    url:localhost:3000
  `
};
```

### 12.3 Console Utilities

```typescript
const consoleUtilities = {
  $系列: `
    $0    // 最近选择的DOM元素
    $1    // 倒数第二个
    $2-$4 // 历史选择
    
    $('selector')     // document.querySelector
    $$('selector')    // document.querySelectorAll
    
    $x('//div')       // XPath查询
  `,
  
  查询函数: `
    // 查询元素
    $('button')           // 第一个button
    $$('button')          // 所有button
    $x('//button')        // XPath查询
    
    // 获取事件监听器
    getEventListeners($0)
    
    // 监控函数调用
    monitor(function)     // 函数被调用时log
    unmonitor(function)   // 停止监控
    
    // 检查元素
    inspect($0)           // 在Elements面板查看
  `,
  
  React专用: `
    // 选中React元素后
    $r              // React组件实例
    $r.props        // 组件props
    $r.state        // 组件state (类组件)
    
    // 调用组件方法
    $r.setState({ count: 10 })
    $r.forceUpdate()
  `,
  
  调试工具: `
    // 复制对象
    copy(object)    // 复制到剪贴板
    
    // 清空console
    clear()
    
    // 查看对象属性
    dir($0)         // 对象结构
    dirxml($0)      // XML/HTML结构
    
    // 性能测试
    console.profile('MyProfile');
    // 执行代码
    console.profileEnd('MyProfile');
  `
};
```

## 13. Network面板深度使用

### 13.1 请求详细分析

```typescript
const networkDetailedAnalysis = {
  Timing分析: `
    // 请求时间分解
    Queueing: 0.5ms           // 排队等待
    Stalled: 2.3ms            // 停滞
    DNS Lookup: 15ms          // DNS查询
    Initial connection: 45ms  // 建立连接
    SSL: 80ms                 // SSL握手
    Request sent: 0.2ms       // 发送请求
    Waiting (TTFB): 250ms     // 等待首字节
    Content Download: 50ms    // 下载内容
    
    Total: 443ms
    
    优化点:
    - DNS: 使用DNS预解析
    - Connection: HTTP/2, Keep-Alive
    - SSL: 证书优化
    - TTFB: 服务器优化
    - Download: CDN, 压缩
  `,
  
  Headers分析: `
    // Request Headers
    - User-Agent
    - Accept
    - Accept-Encoding: gzip, deflate, br
    - Cache-Control
    - Authorization
    
    // Response Headers
    - Content-Type
    - Content-Length
    - Content-Encoding: gzip
    - Cache-Control: max-age=31536000
    - ETag
    - Last-Modified
  `,
  
  Preview响应: `
    // 格式化预览
    - JSON: 树形展示
    - HTML: 渲染预览
    - Image: 图片预览
    - Font: 字体预览
  `
};
```

### 13.2 网络限流

```typescript
const networkThrottling = {
  预设配置: `
    // Network面板 -> Throttling
    - No throttling: 无限流
    - Fast 3G: 快速3G
    - Slow 3G: 慢速3G
    - Offline: 离线
  `,
  
  自定义限流: `
    // Settings -> Throttling
    添加自定义配置:
    
    Name: 4G
    Download: 4 Mbps
    Upload: 3 Mbps
    Latency: 20ms
  `,
  
  测试场景: `
    // 测试弱网环境
    1. 选择Slow 3G
    2. 刷新页面
    3. 观察加载体验
    4. 优化关键资源加载
  `
};
```

### 13.3 请求阻止

```typescript
const requestBlocking = {
  用途: '测试资源加载失败场景',
  
  设置: `
    1. Network -> Request blocking
    2. Enable request blocking
    3. Add pattern
    
    模式示例:
    *.jpg          // 阻止所有jpg
    *analytics*    // 阻止analytics请求
    */api/logs/*   // 阻止日志API
  `,
  
  测试场景: `
    // 测试图片加载失败
    阻止: *.jpg
    结果: 查看fallback处理
    
    // 测试API失败
    阻止: */api/*
    结果: 查看错误处理
  `
};
```

## 14. Lighthouse审计

### 14.1 性能审计

```typescript
const lighthouseAudit = {
  运行审计: `
    1. Lighthouse面板
    2. 选择类别:
       ✓ Performance
       ✓ Accessibility
       ✓ Best Practices
       ✓ SEO
       ✓ PWA
    3. 选择设备: Mobile/Desktop
    4. Generate report
  `,
  
  性能指标: {
    FCP: 'First Contentful Paint - < 1.8s',
    LCP: 'Largest Contentful Paint - < 2.5s',
    TBT: 'Total Blocking Time - < 200ms',
    CLS: 'Cumulative Layout Shift - < 0.1',
    SI: 'Speed Index - < 3.4s'
  },
  
  优化建议: `
    // Lighthouse提供具体建议
    - Eliminate render-blocking resources
    - Properly size images
    - Defer offscreen images
    - Minify CSS/JS
    - Enable text compression
    - Use video formats for animated content
  `
};
```

### 14.2 React特定优化

```typescript
const reactOptimizations = {
  代码分割: `
    // Lighthouse建议
    Reduce JavaScript execution time
    
    // 实施
    const Heavy = lazy(() => import('./Heavy'));
    
    <Suspense fallback={<Loading />}>
      <Heavy />
    </Suspense>
  `,
  
  预加载: `
    // Lighthouse建议
    Preload key requests
    
    // 实施
    <link rel="preload" href="/critical.js" as="script">
    <link rel="preload" href="/hero.jpg" as="image">
  `,
  
  优化图片: `
    // Lighthouse建议
    Serve images in next-gen formats
    
    // 实施
    <picture>
      <source srcSet="image.webp" type="image/webp">
      <img src="image.jpg" alt="Fallback">
    </picture>
  `
};
```

## 15. Coverage代码覆盖率

### 15.1 查看未使用代码

```typescript
const coverageAnalysis = {
  开启Coverage: `
    1. Ctrl/Cmd + Shift + P
    2. 输入"coverage"
    3. Show Coverage
    4. 点击录制
    5. 操作页面
    6. 停止录制
  `,
  
  分析结果: `
    // 显示每个文件的覆盖率
    File          | Unused Bytes | Coverage
    main.js       | 150 KB       | 45%
    vendor.js     | 300 KB       | 30%
    component.js  | 20 KB        | 80%
    
    // 红色: 未使用
    // 蓝色: 已使用
  `,
  
  优化策略: `
    // 移除未使用代码
    1. 删除未使用的依赖
    2. 代码分割
    3. 按需导入
    4. Tree shaking
    
    // 示例
    // ❌ 导入整个库
    import _ from 'lodash';
    
    // ✓ 按需导入
    import debounce from 'lodash/debounce';
  `
};
```

## 16. Rendering面板

### 16.1 Paint Flashing

```typescript
const paintFlashing = {
  启用: `
    1. Ctrl/Cmd + Shift + P
    2. 输入"rendering"
    3. Show Rendering
    4. ✓ Paint flashing
  `,
  
  用途: '显示重绘区域',
  
  分析: `
    // 绿色高亮: 正在重绘的区域
    
    问题:
    - 大面积频繁闪烁
    - 无关区域闪烁
    
    优化:
    - 减少DOM操作
    - 使用CSS transforms (不触发重绘)
    - 使用will-change提示
    - 避免强制同步布局
  `
};
```

### 16.2 Layout Shift Regions

```typescript
const layoutShiftRegions = {
  启用: `
    Rendering -> Layout Shift Regions
  `,
  
  显示: '布局偏移区域用蓝色高亮',
  
  常见原因: `
    1. 图片未设置尺寸
    2. 动态插入内容
    3. 字体加载
    4. 广告加载
  `,
  
  修复: `
    // 图片设置宽高
    <img src="image.jpg" width="400" height="300" alt="" />
    
    // 字体加载优化
    @font-face {
      font-display: swap;
    }
    
    // 预留空间
    .ad-container {
      min-height: 250px;
    }
  `
};
```

### 16.3 FPS Meter

```typescript
const fpsMeter = {
  启用: `
    Rendering -> Frame Rendering Stats
  `,
  
  显示: `
    // 屏幕左上角显示
    - FPS: 当前帧率
    - GPU: GPU内存使用
  `,
  
  分析: `
    60 FPS: 流畅
    30-60 FPS: 轻微卡顿
    < 30 FPS: 明显卡顿
    
    优化:
    - 减少重绘重排
    - 优化动画
    - 使用CSS动画
    - 使用transform
  `
};
```

## 17. 远程调试

### 17.1 远程设备调试

```typescript
const remoteDebugging = {
  Android: `
    1. 启用USB调试
    2. 连接电脑
    3. Chrome访问chrome://inspect
    4. Discover USB devices
    5. 点击inspect打开DevTools
  `,
  
  iOS: `
    1. 设置 -> Safari -> 高级 -> Web检查器
    2. 连接Mac
    3. Safari -> 开发 -> [设备名]
    4. 选择页面
    5. 打开Web Inspector
  `,
  
  无线调试: `
    // Android 11+
    1. 开发者选项 -> 无线调试
    2. 配对设备
    3. chrome://inspect
    4. Configure -> Add [IP]:[Port]
  `
};
```

### 17.2 Network代理

```typescript
const networkProxy = {
  Charles代理: `
    1. 安装Charles
    2. 配置代理: Proxy -> Proxy Settings
    3. 手机配置代理指向电脑IP
    4. 查看所有HTTP/HTTPS请求
    5. 断点修改请求/响应
  `,
  
  Whistle代理: `
    npm install -g whistle
    w2 start
    
    // 配置规则
    example.com/api/user file:///local/user.json
    
    // Mock API响应
  `
};
```

## 18. 性能优化实战

### 18.1 首屏性能优化

```typescript
const firstScreenOptimization = {
  分析: `
    // Performance录制首屏加载
    1. 清除缓存
    2. Ctrl/Cmd + Shift + E (清空并硬性重新加载)
    3. 录制完整加载过程
    
    关键指标:
    - FCP: 首次内容绘制
    - LCP: 最大内容绘制  
    - TTI: 可交互时间
  `,
  
  优化策略: `
    1. 关键资源内联
       - 首屏CSS内联到HTML
       - 关键JS内联
    
    2. 预加载关键资源
       <link rel="preload" href="/critical.css" as="style">
    
    3. 延迟非关键资源
       <script defer src="/non-critical.js"></script>
    
    4. 代码分割
       const NonCritical = lazy(() => import('./NonCritical'));
    
    5. 优化图片
       - WebP格式
       - 响应式图片
       - 懒加载
  `,
  
  验证: `
    再次录制Performance
    对比优化前后:
    - FCP: 3.2s -> 1.5s
    - LCP: 4.5s -> 2.1s
    - TTI: 5.8s -> 2.8s
  `
};
```

### 18.2 运行时性能优化

```typescript
const runtimeOptimization = {
  JavaScript优化: `
    // Performance录制用户操作
    
    问题:
    - 长任务阻塞主线程
    - JavaScript执行时间过长
    
    优化:
    1. 代码分割
    2. 懒加载
    3. Web Worker
    4. 优化算法
    5. 防抖节流
  `,
  
  渲染优化: `
    问题:
    - 频繁重排重绘
    - 强制同步布局
    
    优化:
    1. 批量DOM操作
    2. 使用DocumentFragment
    3. 使用CSS transform
    4. 避免读写混合
    5. 使用虚拟滚动
  `,
  
  内存优化: `
    问题:
    - 内存持续增长
    - 频繁GC
    
    优化:
    1. 及时清理引用
    2. 使用对象池
    3. 避免闭包捕获大对象
    4. 及时移除事件监听
  `
};
```

## 19. 调试最佳实践

### 19.1 调试工作流

```typescript
const debuggingWorkflow = {
  问题定位: `
    1. 复现问题
    2. 确定范围(渲染/逻辑/网络)
    3. 选择合适工具
    4. 收集信息
    5. 分析原因
  `,
  
  工具选择: `
    React问题 -> React DevTools
    JavaScript问题 -> Sources断点
    性能问题 -> Performance + Profiler
    网络问题 -> Network
    内存问题 -> Memory
  `,
  
  修复验证: `
    1. 修改代码
    2. 重现操作
    3. 验证修复
    4. 性能测试
    5. 提交代码
  `
};
```

### 19.2 生产问题排查

```typescript
const productionTroubleshooting = {
  日志收集: `
    // 集成日志系统
    import { captureException } from '@sentry/react';
    
    try {
      // 操作
    } catch (error) {
      captureException(error);
      console.error(error);
    }
  `,
  
  Source Maps: `
    // 上传source maps到错误追踪
    // sentry-cli
    sentry-cli releases files VERSION upload-sourcemaps ./dist
  `,
  
  用户会话重放: `
    // Sentry Session Replay
    Sentry.init({
      integrations: [
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false
        })
      ]
    });
  `
};
```

## 20. 总结

Chrome DevTools调试的核心要点:

1. **Sources**: 断点调试代码、条件断点、Logpoints
2. **Console**: 日志输出、交互测试、Console Utilities
3. **Network**: 请求分析、Timing分析、限流测试
4. **Performance**: 性能录制、火焰图分析、长任务优化
5. **Memory**: 堆快照、内存泄漏检测、Retainers追踪
6. **Application**: Storage查看、Cache管理、SW调试
7. **Lighthouse**: 性能审计、优化建议、最佳实践
8. **Coverage**: 代码覆盖率、未使用代码识别
9. **Rendering**: 重绘检测、布局偏移、FPS监控
10. **远程调试**: 移动设备调试、网络代理

掌握Chrome DevTools是高效调试的关键，结合React DevTools可以解决几乎所有React开发问题。

