# React DevTools完全指南 - React调试利器

## 1. React DevTools概述

### 1.1 核心功能

```typescript
const devToolsFeatures = {
  Components面板: {
    功能: '查看和编辑组件树',
    特性: ['Props检查', 'State编辑', 'Hooks查看', '组件过滤']
  },
  
  Profiler面板: {
    功能: '性能分析',
    特性: ['渲染时间', '提交时长', '组件排名', '火焰图']
  },
  
  Settings: {
    功能: '配置选项',
    特性: ['主题设置', '组件过滤', '高级选项']
  },
  
  版本支持: {
    React16: '完整支持',
    React17: '完整支持',
    React18: '并发特性支持',
    React19: 'Server Components支持'
  }
};
```

### 1.2 安装方法

```typescript
const installation = {
  浏览器扩展: {
    Chrome: 'Chrome Web Store搜索React Developer Tools',
    Firefox: 'Firefox Add-ons搜索React DevTools',
    Edge: 'Edge Add-ons搜索React Developer Tools'
  },
  
  独立应用: `
    npm install -g react-devtools
    react-devtools
    
    // 在应用中连接
    <script src="http://localhost:8097"></script>
  `,
  
  React Native: `
    npm install --save-dev react-devtools
    
    // package.json
    "scripts": {
      "devtools": "react-devtools"
    }
    
    // 运行
    npm run devtools
  `
};
```

## 2. Components面板

### 2.1 组件树查看

```typescript
const componentsPanel = {
  功能: [
    '查看组件层级',
    '搜索组件',
    '过滤组件类型',
    '定位组件源码',
    '高亮DOM元素'
  ],
  
  快捷键: {
    搜索: 'Ctrl/Cmd + F',
    展开所有: 'Ctrl/Cmd + →',
    折叠所有: 'Ctrl/Cmd + ←',
    定位源码: 'Click on < > icon'
  },
  
  组件信息: {
    Props: '查看和编辑props',
    State: '查看和编辑state',
    Hooks: '查看hooks值和顺序',
    Rendered_by: '查看父组件',
    Source: '定位源代码位置'
  }
};
```

### 2.2 Props和State编辑

```typescript
const editingPropsState = {
  编辑Props: `
    1. 选择组件
    2. 在右侧面板找到props
    3. 双击值进行编辑
    4. 按Enter保存
    
    用途:
    - 测试不同props值
    - 调试边界情况
    - 快速验证UI
  `,
  
  编辑State: `
    1. 选择组件
    2. 在右侧面板找到state
    3. 双击值进行编辑
    4. 按Enter保存
    
    用途:
    - 测试不同状态
    - 快速重现bug
    - 验证状态逻辑
  `,
  
  示例场景: `
    // 测试用户登录状态
    组件: <UserProfile />
    
    编辑state:
    user: { id: 1, name: 'John', role: 'admin' }
    ↓ 改为
    user: { id: 1, name: 'John', role: 'guest' }
    
    立即看到UI变化，无需重新登录
  `
};
```

### 2.3 Hooks查看

```typescript
const hooksInspection = {
  显示内容: {
    State: 'useState值',
    Effect: 'useEffect依赖',
    Context: 'useContext值',
    Memo: 'useMemo缓存值',
    Callback: 'useCallback函数',
    Reducer: 'useReducer state'
  },
  
  查看方式: `
    1. 选择使用Hooks的组件
    2. 右侧面板显示hooks列表
    3. 展开查看详细信息
    4. 显示调用顺序
  `,
  
  调试技巧: `
    问题: useState值不是预期的
    
    检查:
    1. 查看当前state值
    2. 检查调用顺序
    3. 验证依赖数组
    4. 查看父组件props
  `
};
```

### 2.4 组件过滤

```typescript
const componentFiltering = {
  过滤器类型: {
    搜索: '按组件名搜索',
    类型: '只显示特定类型(函数/类/memo)',
    自定义: '使用正则表达式'
  },
  
  设置过滤: `
    1. 点击Settings图标
    2. Components标签
    3. Filter preferences
    4. 添加过滤规则
    
    示例:
    - 隐藏node_modules组件
    - 只显示自定义组件
    - 过滤特定路径
  `,
  
  正则过滤: `
    Filter: /^Button|^Input/
    
    只显示Button和Input开头的组件
  `
};
```

## 3. Profiler面板

### 3.1 性能分析

```typescript
const profilerPanel = {
  功能: '记录和分析组件渲染性能',
  
  指标: {
    Duration: '渲染持续时间',
    CommitDuration: '提交阶段时长',
    RenderCount: '渲染次数',
    Interactions: '交互追踪'
  },
  
  使用步骤: `
    1. 切换到Profiler标签
    2. 点击录制按钮(圆圈)
    3. 执行要分析的操作
    4. 点击停止
    5. 查看分析结果
  `,
  
  视图模式: {
    Flamegraph: '火焰图-查看渲染层级',
    Ranked: '排名-按渲染时间排序',
    Timeline: '时间线-查看渲染顺序'
  }
};
```

### 3.2 火焰图分析

```typescript
const flamegraphAnalysis = {
  解读: `
    颜色含义:
    - 灰色: 未渲染
    - 黄色到红色: 渲染时间(红色最慢)
    
    宽度: 组件渲染时间
    高度: 组件层级
  `,
  
  查找性能瓶颈: `
    1. 找到红色/橙色组件(渲染慢)
    2. 点击查看详情
    3. 查看"Why did this render?"
    4. 分析props/state变化
    5. 找出优化机会
  `,
  
  示例: `
    发现: <ProductList> 渲染8.3ms(红色)
    
    点击查看:
    - Props changed: filter
    - State changed: none
    - Parent rendered: App
    
    分析:
    filter变化导致重新过滤1000个商品
    
    优化:
    使用useMemo缓存过滤结果
  `
};
```

### 3.3 Ranked视图

```typescript
const rankedView = {
  用途: '快速找到最慢的组件',
  
  排序: '按渲染时间从高到低',
  
  使用: `
    1. 切换到Ranked标签
    2. 查看耗时最长的组件
    3. 点击组件查看详情
    4. 优化高耗时组件
  `,
  
  示例: `
    Ranked Chart:
    1. <DataTable> - 15.2ms
    2. <Chart> - 8.7ms
    3. <ProductList> - 6.5ms
    4. <Sidebar> - 3.2ms
    
    优先优化DataTable
  `
};
```

### 3.4 Why did this render

```typescript
const whyRender = {
  原因类型: {
    PropsChanged: 'props变化',
    StateChanged: 'state变化',
    HooksChanged: 'hooks值变化',
    ParentRendered: '父组件渲染',
    ContextChanged: 'context值变化'
  },
  
  详细信息: `
    点击组件后显示:
    
    Why did this render?
    - Props changed: value (1 -> 2)
    - Hooks changed: Hook 1 (0 -> 1)
    
    Parents:
    - <Parent> rendered
  `,
  
  优化建议: `
    根据原因优化:
    
    Props changed:
    - 使用React.memo
    - 稳定props引用
    - 避免内联对象
    
    Parent rendered:
    - 组件拆分
    - 状态下放
    - children prop
    
    Hooks changed:
    - 检查依赖
    - 使用useMemo
  `
};
```

## 4. 高级功能

### 4.1 Suspense和Concurrent

```typescript
const concurrentFeatures = {
  Suspense边界: `
    Components面板显示:
    - <Suspense> 组件
    - fallback状态
    - 挂起的组件
  `,
  
  Transitions: `
    Profiler显示:
    - Transition开始时间
    - Transition持续时间
    - 涉及的组件
  `,
  
  优先级: `
    显示组件更新的优先级:
    - Sync: 同步更新
    - Default: 默认优先级
    - Transition: 过渡优先级
  `
};
```

### 4.2 Context追踪

```typescript
const contextTracking = {
  查看Context: `
    1. 选择使用Context的组件
    2. 右侧面板显示context值
    3. 显示Provider位置
    4. 追踪值变化
  `,
  
  调试Context: `
    问题: Context值不是预期的
    
    检查:
    1. 查看Context当前值
    2. 找到Provider组件
    3. 检查Provider的value
    4. 验证是否在Provider内
  `
};
```

### 4.3 组件高亮

```typescript
const componentHighlight = {
  功能: '高亮渲染的组件',
  
  启用: `
    Settings -> General
    ✓ Highlight updates when components render
  `,
  
  颜色含义: {
    蓝色: '渲染一次',
    黄色: '渲染较多',
    红色: '渲染频繁'
  },
  
  用途: `
    可视化查看:
    - 哪些组件在渲染
    - 渲染频率
    - 不必要的渲染
  `
};
```

## 5. 调试技巧

### 5.1 定位问题组件

```typescript
const locateIssues = {
  步骤: [
    '1. Profiler录制渲染',
    '2. Ranked视图找耗时组件',
    '3. 查看Why did this render',
    '4. 检查props/state变化',
    '5. 定位到源码',
    '6. 添加优化'
  ],
  
  示例流程: `
    问题: 页面卡顿
    
    1. Profiler录制
    2. 发现<List>渲染15ms
    3. 查看原因: parent rendered
    4. 检查父组件<Page>
    5. 发现count state变化
    6. count与List无关
    
    解决:
    - List使用React.memo
    - 或将count状态下放
  `
};
```

### 5.2 Props Diff

```typescript
const propsDiff = {
  功能: '对比props变化',
  
  使用: `
    1. 选择组件
    2. 查看props
    3. 触发更新
    4. DevTools显示变化的props
  `,
  
  示例: `
    Before:
    props: { user: { id: 1, name: 'John' }, count: 0 }
    
    After:
    props: { user: { id: 1, name: 'John' }, count: 1 }
    
    Changed:
    ✓ count: 0 -> 1
    
    优化:
    如果组件不需要count,使用memo+自定义比较
  `
};
```

## 6. Profiler API

### 6.1 编程式性能监控

```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id,                   // Profiler组件的id
  phase,                // "mount" 或 "update"
  actualDuration,       // 本次更新花费的渲染时间
  baseDuration,         // 不使用memo的估计时间
  startTime,            // 开始渲染的时间
  commitTime,           // 提交时间
  interactions          // 属于这次更新的interactions集合
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
  
  // 发送到分析服务
  analytics.track('render', {
    component: id,
    phase,
    duration: actualDuration,
    timestamp: commitTime
  });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Navigation />
      <Profiler id="Main" onRender={onRenderCallback}>
        <Main />
      </Profiler>
      <Profiler id="Sidebar" onRender={onRenderCallback}>
        <Sidebar />
      </Profiler>
    </Profiler>
  );
}
```

### 6.2 性能数据收集

```typescript
const performanceData = {
  收集渲染数据: `
    const renderMetrics = [];
    
    function onRender(id, phase, actualDuration) {
      renderMetrics.push({
        component: id,
        phase,
        duration: actualDuration,
        timestamp: Date.now()
      });
    }
    
    // 分析
    function analyzeMetrics() {
      const avgDuration = renderMetrics.reduce((sum, m) => 
        sum + m.duration, 0
      ) / renderMetrics.length;
      
      const slowRenders = renderMetrics.filter(m => 
        m.duration > avgDuration * 2
      );
      
      console.log('Average:', avgDuration);
      console.log('Slow renders:', slowRenders);
    }
  `,
  
  性能阈值: `
    function onRender(id, phase, actualDuration) {
      // 渲染超过16ms(一帧)发出警告
      if (actualDuration > 16) {
        console.warn(\`\${id} render took \${actualDuration}ms\`);
        
        // 上报
        reportSlowRender(id, actualDuration);
      }
    }
  `
};
```

## 7. 最佳实践

```typescript
const bestPractices = {
  日常开发: [
    '保持DevTools打开',
    '关注Components变化',
    '定期Profiler检查',
    '优化红色组件',
    '验证memo效果'
  ],
  
  性能优化: [
    'Profiler录制操作',
    '分析Ranked图',
    '查看Why render',
    '针对性优化',
    '验证优化效果'
  ],
  
  问题排查: [
    '复现问题',
    '检查组件树',
    '查看props/state',
    '验证hooks值',
    '定位源码'
  ]
};
```

## 8. 实战调试案例

### 8.1 案例1: 性能问题排查

```typescript
// 场景: 用户反馈页面卡顿

// 步骤1: Profiler录制
// 1. 打开React DevTools Profiler
// 2. 点击录制
// 3. 重现卡顿操作(如滚动列表)
// 4. 停止录制

// 步骤2: 分析Ranked视图
// 发现:
// 1. <ProductList> - 45.2ms (红色)
// 2. <ProductCard> × 100 - 每个0.4ms
// 3. <FilterBar> - 2.1ms

// 步骤3: 点击ProductList查看详情
// Why did this render?
// - Parent rendered: App
// - Props changed: none
// - State changed: none

// 分析:
// ProductList因为父组件App重渲染而渲染
// 但props/state都没变，是不必要的渲染

// 步骤4: 查看App组件
// 发现App有count state，与ProductList无关

// 解决方案:
const ProductList = React.memo(function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});

// 步骤5: 验证优化效果
// 再次Profiler录制
// ProductList渲染时间: 45.2ms -> 0ms (未渲染)
// 页面流畅度明显提升
```

### 8.2 案例2: 内存泄漏检测

```typescript
// 场景: 应用运行一段时间后变慢

// 步骤1: 检查组件树
// 打开Components面板
// 查看是否有应该卸载但仍存在的组件

// 步骤2: 检查Hooks
// 选择疑似泄漏的组件
// 查看hooks列表
// 发现useEffect依赖数组有问题

// 问题代码:
function Component() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData().then(setData);
    }, 1000);
    
    // ❌ 忘记清理定时器
  }, []);
  
  return <div>{data.length}</div>;
}

// 步骤3: 修复
function Component() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      fetchData().then(setData);
    }, 1000);
    
    // ✓ 清理定时器
    return () => clearInterval(timer);
  }, []);
  
  return <div>{data.length}</div>;
}
```

### 8.3 案例3: Props传递问题

```typescript
// 场景: 子组件没有接收到正确的props

// 步骤1: 选择子组件
// Components面板选中<Child>组件

// 步骤2: 查看props
// 右侧面板显示:
// Props:
//   value: undefined  // ❌ 应该有值

// 步骤3: 查看父组件
// 点击"rendered by"链接跳转到父组件
// 查看父组件props:
// Props:
//   data: { value: 123 }

// 步骤4: 检查父组件代码
function Parent({ data }) {
  // ❌ 错误: 传递了data而不是data.value
  return <Child data={data} />;
}

function Child({ value }) {
  // value是undefined
  return <div>{value}</div>;
}

// 步骤5: 修复
function Parent({ data }) {
  // ✓ 正确: 传递value
  return <Child value={data.value} />;
}
```

### 8.4 案例4: Context值不更新

```typescript
// 场景: Context值变化但组件不更新

// 步骤1: 检查Context值
// 选择使用Context的组件
// 右侧面板Context部分显示当前值

// 步骤2: 定位Provider
// 点击Context值旁的定位按钮
// 跳转到Provider组件

// 步骤3: 检查Provider value
// 发现问题:
const App = () => {
  const [theme, setTheme] = useState('light');
  
  // ❌ 每次渲染都创建新对象
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Page />
    </ThemeContext.Provider>
  );
};

// 步骤4: 修复
const App = () => {
  const [theme, setTheme] = useState('light');
  
  // ✓ 使用useMemo缓存value
  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme]
  );
  
  return (
    <ThemeContext.Provider value={value}>
      <Page />
    </ThemeContext.Provider>
  );
};
```

## 9. 高级调试技巧

### 9.1 自定义Hooks调试

```typescript
// 调试自定义Hook
function useCustomHook(initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    console.log('useCustomHook effect', { value, loading });
  }, [value, loading]);
  
  return { value, setValue, loading, setLoading };
}

// DevTools中查看:
// Hooks:
// State: value的值
// State: loading的值
// Effect: [value, loading]依赖

// 调试技巧:
// 1. 查看hooks调用顺序
// 2. 验证每个hook的值
// 3. 检查依赖数组
// 4. 使用console.log配合DevTools
```

### 9.2 组件树导航技巧

```typescript
const navigationTips = {
  快捷导航: `
    // 快速定位组件
    1. Ctrl/Cmd + F 搜索组件名
    2. 点击组件高亮DOM元素
    3. 右键"Scroll into view"滚动到DOM位置
    4. 点击"< >"图标查看源码
  `,
  
  查看组件关系: `
    // 向上查看
    - "rendered by"查看父组件
    - 沿着树向上追溯
    
    // 向下查看
    - 展开子组件
    - 查看整个子树
  `,
  
  查找重渲染: `
    // 启用highlight updates
    Settings -> General -> Highlight updates
    
    // 操作页面
    // 观察哪些组件在闪烁
    // 蓝色: 渲染一次
    // 黄色: 渲染多次
    // 红色: 频繁渲染
  `
};
```

### 9.3 并发特性调试

```typescript
// React 18/19 并发特性调试
const concurrentDebugging = {
  Suspense调试: `
    // Components面板显示
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
    
    // DevTools显示:
    - Suspense边界
    - 当前状态(pending/resolved)
    - fallback组件
    - 挂起的组件
  `,
  
  Transition调试: `
    function Component() {
      const [isPending, startTransition] = useTransition();
      const [query, setQuery] = useState('');
      
      const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        
        startTransition(() => {
          // 低优先级更新
          filterData(value);
        });
      };
      
      return (
        <div>
          <input value={query} onChange={handleChange} />
          {isPending && <Spinner />}
        </div>
      );
    }
    
    // Profiler显示:
    - Transition开始/结束时间
    - isPending状态
    - 涉及的组件
    - 渲染优先级
  `,
  
  useDeferredValue调试: `
    function Component() {
      const [input, setInput] = useState('');
      const deferredInput = useDeferredValue(input);
      
      return (
        <div>
          <input value={input} onChange={e => setInput(e.target.value)} />
          <ExpensiveList query={deferredInput} />
        </div>
      );
    }
    
    // DevTools显示:
    - input的即时值
    - deferredInput的延迟值
    - ExpensiveList何时更新
  `
};
```

## 10. DevTools扩展插件

### 10.1 React Query DevTools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
      
      {/* React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// 功能:
// - 查看所有queries状态
// - 查看缓存数据
// - 手动触发refetch
// - 清除缓存
// - 查看query key
```

### 10.2 Redux DevTools

```typescript
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  
  // 启用Redux DevTools
  devTools: process.env.NODE_ENV !== 'production'
});

// 功能:
// - 查看所有dispatched actions
// - 查看每个action的state diff
// - 时间旅行调试
// - 导入/导出state
// - 手动dispatch action
// - 订阅state变化
```

### 10.3 Why Did You Render

```bash
npm install @welldone-software/why-did-you-render
```

```javascript
// wdyr.js
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    trackExtraHooks: [[require('react-redux/lib'), 'useSelector']],
    logOnDifferentValues: true,
  });
}

// 使用
Component.whyDidYouRender = true;

// Console输出:
// Why did Component re-render?
// - different objects (props.config)
// - different functions (props.onClick)
```

## 11. 性能优化工作流

### 11.1 系统化优化流程

```typescript
const optimizationWorkflow = {
  步骤1_建立基线: `
    1. Profiler录制初始性能
    2. 记录关键指标:
       - 首次渲染时间
       - 平均渲染时间
       - 最慢组件
       - 渲染次数
  `,
  
  步骤2_识别瓶颈: `
    1. Ranked视图找最慢组件
    2. 查看Why did this render
    3. 分析渲染原因
    4. 识别优化机会
  `,
  
  步骤3_应用优化: `
    1. React.memo包裹组件
    2. useMemo缓存计算
    3. useCallback缓存函数
    4. 状态下放或提升
    5. 组件拆分
  `,
  
  步骤4_验证效果: `
    1. 再次Profiler录制
    2. 对比优化前后
    3. 确认性能提升
    4. 检查是否有副作用
  `,
  
  步骤5_持续监控: `
    1. 集成Profiler API
    2. 收集生产环境数据
    3. 设置性能阈值告警
    4. 定期review性能
  `
};
```

### 11.2 性能优化检查清单

```typescript
const performanceChecklist = {
  组件层面: [
    '□ 大列表使用虚拟滚动',
    '□ 频繁更新的组件使用memo',
    '□ 昂贵计算使用useMemo',
    '□ 传递给子组件的函数使用useCallback',
    '□ 避免内联对象和数组',
    '□ 使用key优化列表',
    '□ 组件拆分合理',
    '□ 状态放置合理'
  ],
  
  渲染层面: [
    '□ 检查不必要的重渲染',
    '□ Props引用稳定',
    '□ Context优化',
    '□ 避免在render中创建函数/对象',
    '□ children prop模式使用',
    '□ 懒加载非关键组件',
    '□ 代码分割合理',
    '□ Suspense边界设置'
  ],
  
  数据层面: [
    '□ 状态结构扁平化',
    '□ 避免过深的对象嵌套',
    '□ 合理使用useReducer',
    '□ 状态派生使用selector',
    '□ 避免冗余状态',
    '□ 批量更新',
    '□ 防抖节流',
    '□ 数据缓存'
  ]
};
```

## 12. 调试常见问题

### 12.1 DevTools无法连接

```typescript
const connectionIssues = {
  问题1_DevTools不显示: `
    原因:
    - React未正确安装
    - 使用的是production build
    - 页面不是React应用
    
    解决:
    1. 检查React版本
       console.log(React.version)
    
    2. 确认是development build
       // package.json
       "dev": "vite"  // 而非 vite build
    
    3. 刷新DevTools
       右键扩展图标 -> Reload
  `,
  
  问题2_组件树为空: `
    原因:
    - React应用还未挂载
    - 使用了iframe
    - 多个React实例冲突
    
    解决:
    1. 等待应用加载
    2. iframe需要单独打开DevTools
    3. 确保只有一个React实例
  `,
  
  问题3_无法编辑props: `
    原因:
    - props是只读的
    - 组件类型不支持
    
    解决:
    - 只能编辑state
    - 或通过父组件修改props
  `
};
```

### 12.2 Profiler数据异常

```typescript
const profilerIssues = {
  问题1_渲染时间为0: `
    原因:
    - 组件被memo,未实际渲染
    - 使用Profiler录制太短
    
    解决:
    - 检查组件是否真的渲染
    - 录制更长时间的操作
  `,
  
  问题2_Why_render显示不准: `
    原因:
    - React DevTools版本过旧
    - 复杂的props比较
    
    解决:
    - 更新DevTools到最新版
    - 使用自定义memo比较函数
  `,
  
  问题3_Profiler无法录制: `
    原因:
    - 浏览器性能不足
    - 录制时间过长
    
    解决:
    - 关闭其他标签页
    - 录制更短的操作
    - 使用Profiler API代替
  `
};
```

## 13. DevTools配置优化

### 13.1 个性化配置

```typescript
const customSettings = {
  主题设置: `
    Settings -> General -> Theme
    - Light: 浅色主题
    - Dark: 深色主题  
    - Auto: 跟随系统
  `,
  
  组件过滤: `
    Settings -> Components
    - Hide components where...
    ✓ Hide components in node_modules
    ✓ Hide React internals
    
    - Custom filter
    /^_/  // 隐藏_开头的组件
  `,
  
  Profiler设置: `
    Settings -> Profiler
    ✓ Record why each component rendered
    ✓ Hide commits below X ms
    Threshold: 1  // 隐藏1ms以下的提交
  `,
  
  高级选项: `
    Settings -> Advanced
    ✓ Enable console logs
    ✓ Break on warnings
    ✓ Append component stack to warnings
  `
};
```

### 13.2 工作区配置

```typescript
// 保存DevTools配置
const workspaceConfig = {
  导出配置: `
    Settings -> Export/Import
    Export Settings
    
    // 保存为JSON文件
  `,
  
  导入配置: `
    Settings -> Export/Import
    Import Settings
    
    // 选择JSON文件
  `,
  
  团队共享: `
    // 将配置文件提交到代码仓库
    .devtools/
    └── settings.json
    
    // 团队成员导入相同配置
  `
};
```

## 14. 生产环境调试

### 14.1 Source Maps

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true,  // 生成source maps
  }
});

// DevTools中:
// 1. Sources面板可以看到原始源码
// 2. Components面板可以定位到源码位置
// 3. 断点调试更准确
```

### 14.2 生产环境优化

```typescript
const productionDebugging = {
  条件启用: `
    // 只为特定用户启用DevTools提示
    if (localStorage.getItem('enable-devtools') === 'true') {
      // 加载development版本React
      import('react/dev');
    }
  `,
  
  性能监控: `
    // 使用Profiler API收集数据
    import { Profiler } from 'react';
    
    function onRenderCallback(id, phase, actualDuration) {
      // 只记录慢渲染
      if (actualDuration > 16) {
        analytics.track('slow_render', {
          component: id,
          duration: actualDuration,
          phase
        });
      }
    }
    
    <Profiler id="App" onRender={onRenderCallback}>
      <App />
    </Profiler>
  `,
  
  错误追踪: `
    // 集成Sentry等错误追踪
    import * as Sentry from '@sentry/react';
    
    Sentry.init({
      dsn: 'your-dsn',
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay()
      ],
      tracesSampleRate: 1.0,
    });
  `
};
```

## 15. 团队协作最佳实践

### 15.1 性能标准

```typescript
const performanceStandards = {
  渲染性能: {
    首次渲染: '< 100ms',
    更新渲染: '< 16ms (60fps)',
    列表项: '< 1ms per item',
    交互响应: '< 100ms'
  },
  
  组件标准: {
    最大嵌套层级: '< 10层',
    单组件行数: '< 300行',
    Props数量: '< 10个',
    Hooks数量: '< 15个'
  },
  
  监控指标: {
    慢渲染比例: '< 5%',
    平均渲染时间: '< 10ms',
    内存增长: '< 10MB/hour',
    重渲染率: '< 30%'
  }
};
```

### 15.2 Code Review清单

```typescript
const codeReviewChecklist = {
  性能审查: [
    '□ 大列表是否使用虚拟滚动',
    '□ 昂贵计算是否使用useMemo',
    '□ 事件处理器是否使用useCallback',
    '□ 组件是否需要React.memo',
    '□ Props是否过多',
    '□ 是否有不必要的state',
    '□ useEffect依赖是否正确',
    '□ 是否有内存泄漏风险'
  ],
  
  DevTools检查: `
    1. 使用Profiler录制关键操作
    2. 检查是否有红色组件
    3. 验证Why did this render合理
    4. 确认没有频繁重渲染
    5. 检查内存使用正常
  `
};
```

## 16. 调试工具对比

### 16.1 React DevTools vs Chrome DevTools

```typescript
const toolsComparison = {
  ReactDevTools: {
    优势: [
      'React专用',
      '组件树可视化',
      'Props/State编辑',
      'Hooks详细信息',
      'Why render分析'
    ],
    适用: 'React特定问题'
  },
  
  ChromeDevTools: {
    优势: [
      '通用工具',
      '断点调试',
      '网络分析',
      'Performance分析',
      'Memory分析'
    ],
    适用: '通用问题和底层问题'
  },
  
  配合使用: `
    React问题 -> React DevTools
    性能问题 -> React DevTools Profiler + Chrome Performance
    内存问题 -> Chrome Memory
    网络问题 -> Chrome Network
    断点调试 -> Chrome Sources
  `
};
```

## 17. 实用技巧汇总

### 17.1 快捷操作

```typescript
const shortcuts = {
  组件定位: `
    // 从DOM定位到组件
    1. 右键DOM元素
    2. Inspect
    3. 点击React图标
    4. 跳转到Components面板对应组件
  `,
  
  源码定位: `
    // 从组件定位到源码
    1. 选择组件
    2. 点击"<>"图标
    3. 跳转到Sources面板
    4. 查看源代码
  `,
  
  快速编辑: `
    // 快速测试不同值
    1. 双击state/props值
    2. 输入新值
    3. Enter确认
    4. 立即看到UI变化
  `,
  
  批量操作: `
    // 批量展开/折叠
    Ctrl/Cmd + →  展开所有子组件
    Ctrl/Cmd + ←  折叠所有子组件
  `
};
```

### 17.2 调试模式

```typescript
const debugModes = {
  开发模式: `
    // 完整的DevTools功能
    npm run dev
    
    特点:
    - 完整错误信息
    - 组件名称清晰
    - Source maps可用
    - 所有调试功能
  `,
  
  生产模式: `
    // 受限的DevTools
    npm run build
    npm run preview
    
    特点:
    - 组件名称可能被混淆
    - 错误信息简化
    - 需要Source maps
    - 性能更接近真实环境
  `,
  
  Profiling构建: `
    // 生产模式 + Profiling
    // vite.config.ts
    export default defineConfig({
      build: {
        minify: false,  // 不压缩，便于调试
        sourcemap: true,
      }
    });
  `
};
```

## 18. 移动端调试

### 18.1 移动端DevTools

```typescript
const mobileDebugging = {
  Android调试: `
    1. 启用USB调试
    2. 连接电脑
    3. Chrome访问chrome://inspect
    4. 选择设备和页面
    5. 打开DevTools
  `,
  
  iOS调试: `
    1. 启用Web检查器
       设置 -> Safari -> 高级 -> Web检查器
    2. 连接电脑
    3. Mac Safari -> 开发 -> 设备
    4. 选择页面
    5. 打开Web检查器
  `,
  
  模拟器调试: `
    // Chrome Device Mode
    1. F12打开DevTools
    2. Ctrl/Cmd + Shift + M
    3. 选择设备
    4. 模拟触摸事件
  `
};
```

### 18.2 React Native调试

```bash
# 启动React DevTools
npx react-devtools

# React Native应用会自动连接
```

```typescript
// 在应用中手动连接
import { connectToDevTools } from 'react-devtools-core';

if (__DEV__) {
  connectToDevTools({
    host: 'localhost',
    port: 8097,
  });
}

// 功能:
// - 查看组件树
// - 编辑Props/State
// - Profiler性能分析
// - 与web版本相同的功能
```

## 19. 高级Profiler技巧

### 19.1 Interactions追踪

```typescript
import { unstable_trace as trace } from 'scheduler/tracing';

function handleClick() {
  trace('button click', performance.now(), () => {
    // 被追踪的操作
    setState(newValue);
  });
}

// Profiler中显示:
// - Interaction名称
// - 触发时间
// - 涉及的组件
// - 总耗时
```

### 19.2 自定义性能指标

```typescript
function CustomProfiler({ children }) {
  const metricsRef = useRef({
    renders: 0,
    totalDuration: 0,
    maxDuration: 0,
    minDuration: Infinity
  });
  
  const onRender = (id, phase, actualDuration) => {
    const metrics = metricsRef.current;
    metrics.renders++;
    metrics.totalDuration += actualDuration;
    metrics.maxDuration = Math.max(metrics.maxDuration, actualDuration);
    metrics.minDuration = Math.min(metrics.minDuration, actualDuration);
    
    // 每10次渲染报告一次
    if (metrics.renders % 10 === 0) {
      console.log('Performance Metrics:', {
        renders: metrics.renders,
        average: (metrics.totalDuration / metrics.renders).toFixed(2),
        max: metrics.maxDuration.toFixed(2),
        min: metrics.minDuration.toFixed(2)
      });
    }
  };
  
  return (
    <Profiler id="custom" onRender={onRender}>
      {children}
    </Profiler>
  );
}
```

### 19.3 性能回归测试

```typescript
const performanceRegression = {
  建立基线: `
    // 记录性能基线
    const baseline = {
      'ProductList': { average: 8.5, max: 15 },
      'Cart': { average: 3.2, max: 6 },
      'Checkout': { average: 5.1, max: 10 }
    };
  `,
  
  自动检测: `
    function onRender(id, phase, actualDuration) {
      const baselineMetric = baseline[id];
      
      if (baselineMetric && actualDuration > baselineMetric.max) {
        console.error(
          \`Performance regression in \${id}: \` +
          \`\${actualDuration}ms > \${baselineMetric.max}ms\`
        );
        
        // 上报到监控系统
        reportRegression(id, actualDuration, baselineMetric.max);
      }
    }
  `,
  
  持续监控: `
    // CI/CD集成
    // 在测试环境运行性能测试
    // 对比每次构建的性能指标
    // 性能下降时告警
  `
};
```

## 20. 总结

React DevTools完全指南的核心要点:

1. **Components面板**: 查看组件树、props、state、hooks
2. **Profiler面板**: 性能分析、火焰图、排名
3. **编辑功能**: 实时编辑props/state测试
4. **Why render**: 分析渲染原因
5. **Profiler API**: 编程式性能监控
6. **调试技巧**: 系统化问题定位
7. **实战案例**: 真实问题排查流程
8. **高级功能**: Concurrent特性、Interactions
9. **团队协作**: 性能标准、Code Review
10. **生产调试**: Source Maps、监控集成

React DevTools是React开发必备工具，掌握它能大幅提升开发效率和应用质量。

