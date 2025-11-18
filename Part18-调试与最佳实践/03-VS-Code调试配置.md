# VS Code调试配置 - React应用完全调试指南

## 1. VS Code调试基础

### 1.1 调试器简介

```typescript
const vsCodeDebugger = {
  优势: [
    '集成开发环境',
    '断点调试',
    '变量监视',
    '调用栈查看',
    '条件断点',
    '日志点'
  ],
  
  支持的调试类型: [
    'Node.js调试',
    '浏览器调试',
    'React应用调试',
    'TypeScript调试',
    '测试调试'
  ],
  
  核心功能: {
    断点: '代码暂停执行',
    单步执行: '逐行调试',
    变量查看: '实时查看变量值',
    调用栈: '查看函数调用链',
    监视表达式: '监视特定表达式的值'
  }
};
```

### 1.2 调试面板介绍

```typescript
const debugPanel = {
  变量面板: {
    局部变量: '当前作用域的变量',
    全局变量: '全局作用域的变量',
    闭包变量: '闭包中的变量'
  },
  
  监视面板: {
    添加表达式: '监视特定表达式',
    实时更新: '表达式值实时更新'
  },
  
  调用栈面板: {
    当前调用: '当前执行位置',
    调用链: '函数调用历史',
    跳转: '点击跳转到对应代码'
  },
  
  断点面板: {
    断点列表: '所有断点',
    启用/禁用: '控制断点状态',
    条件断点: '满足条件才暂停'
  }
};
```

## 2. 配置launch.json

### 2.1 基础配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

### 2.2 Vite项目配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Vite: Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "/*": "${webRoot}/*"
      }
    },
    {
      "type": "msedge",
      "request": "launch",
      "name": "Vite: Edge",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true
    }
  ]
}
```

### 2.3 Next.js项目配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### 2.4 TypeScript配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome with TypeScript",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///./*": "${webRoot}/*",
        "webpack:///src/*": "${webRoot}/src/*"
      },
      "preLaunchTask": "npm: build"
    }
  ]
}
```

## 3. 断点调试技巧

### 3.1 普通断点

```typescript
// 在代码行号左侧点击即可添加断点
function calculateTotal(items) {
  let total = 0;  // 在此行设置断点
  
  items.forEach(item => {
    total += item.price * item.quantity;  // 断点会在每次循环时暂停
  });
  
  return total;
}
```

### 3.2 条件断点

```typescript
// 右键断点 -> 编辑断点 -> 添加条件

function processItems(items) {
  items.forEach((item, index) => {
    // 条件: index === 5
    // 只有当index为5时才会暂停
    console.log(item);
  });
}

// 条件表达式示例
const conditions = {
  等式: 'item.id === 123',
  比较: 'count > 10',
  复杂条件: 'item.status === "active" && item.price > 100',
  函数调用: 'isValid(item)',
  布尔值: 'hasError'
};
```

### 3.3 日志点(Logpoint)

```typescript
// 右键 -> 添加日志点
// 不会暂停执行,只会输出日志

function fetchData(url) {
  // 日志点: "Fetching from {url}"
  return fetch(url)
    .then(response => {
      // 日志点: "Response status: {response.status}"
      return response.json();
    });
}

// 日志点语法
const logpointSyntax = {
  变量: '{variableName}',
  对象属性: '{object.property}',
  表达式: '{items.length} items',
  函数调用: '{JSON.stringify(data)}'
};
```

### 3.4 内联断点

```typescript
// Shift + F9 在当前行的表达式上设置断点

// 可以在一行的多个位置设置断点
const result = processA(data) + processB(data) + processC(data);
//               ↑断点1          ↑断点2          ↑断点3
```

## 4. React组件调试

### 4.1 调试组件渲染

```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 在此设置断点,查看userId变化
    async function fetchUser() {
      setLoading(true);
      // 断点: 查看请求发送
      const data = await api.getUser(userId);
      // 断点: 查看返回数据
      setUser(data);
      setLoading(false);
    }
    
    fetchUser();
  }, [userId]);  // 断点: 检查依赖项
  
  // 断点: 查看渲染时的状态
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 4.2 调试Hooks

```typescript
function useCustomHook(initialValue) {
  // 断点: 查看Hook初始化
  const [value, setValue] = useState(initialValue);
  const [history, setHistory] = useState([initialValue]);
  
  const updateValue = useCallback((newValue) => {
    // 断点: 查看更新逻辑
    setValue(newValue);
    setHistory(prev => [...prev, newValue]);
  }, []);
  
  const undo = useCallback(() => {
    // 断点: 查看撤销逻辑
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setValue(newHistory[newHistory.length - 1]);
    }
  }, [history]);
  
  // 断点: 查看返回值
  return { value, updateValue, undo, canUndo: history.length > 1 };
}
```

### 4.3 调试Context

```tsx
const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  // 断点: 查看主题初始化
  const [theme, setTheme] = useState('light');
  
  const value = useMemo(() => ({
    theme,
    setTheme
  }), [theme]);  // 断点: 检查memoization
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedComponent() {
  // 断点: 查看Context值
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## 5. 异步代码调试

### 5.1 Promise调试

```typescript
async function fetchUserData(userId) {
  try {
    // 断点: 开始请求
    const response = await fetch(`/api/users/${userId}`);
    // 断点: 请求完成
    
    if (!response.ok) {
      // 断点: 错误处理
      throw new Error('Failed to fetch user');
    }
    
    const data = await response.json();
    // 断点: 数据解析完成
    
    return data;
  } catch (error) {
    // 断点: 捕获错误
    console.error('Error fetching user:', error);
    throw error;
  }
}
```

### 5.2 调试Async/Await

```typescript
async function processData() {
  // 断点: 函数入口
  const data1 = await fetchData1();
  // 断点: data1获取完成
  
  const data2 = await fetchData2(data1);
  // 断点: data2获取完成
  
  const result = await processResult(data1, data2);
  // 断点: 处理完成
  
  return result;
}

// 调试技巧
const asyncDebugging = {
  步进: 'F11进入async函数',
  跳过: 'F10跳过await',
  查看Promise状态: '在变量面板查看',
  错误捕获: '在catch块设置断点'
};
```

### 5.3 调试回调函数

```typescript
function loadData(callback) {
  setTimeout(() => {
    // 断点: 异步回调执行
    const data = { id: 1, name: 'Test' };
    callback(data);
  }, 1000);
}

// 使用
loadData((data) => {
  // 断点: 回调函数执行
  console.log(data);
});
```

## 6. 调试Redux/状态管理

### 6.1 Redux调试配置

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer
  },
  // 开发环境启用调试
  devTools: process.env.NODE_ENV !== 'production'
});

// 在reducer中设置断点
function userReducer(state = initialState, action) {
  // 断点: 查看action
  switch (action.type) {
    case 'user/login':
      // 断点: 登录逻辑
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
    
    case 'user/logout':
      // 断点: 登出逻辑
      return initialState;
    
    default:
      return state;
  }
}
```

### 6.2 调试Zustand

```typescript
import create from 'zustand';

const useStore = create((set, get) => ({
  count: 0,
  
  increment: () => {
    // 断点: 查看当前状态
    const current = get().count;
    // 断点: 状态更新
    set({ count: current + 1 });
  },
  
  decrement: () => {
    // 断点: 递减逻辑
    set(state => ({ count: state.count - 1 }));
  }
}));

// 使用
function Counter() {
  // 断点: 查看订阅的状态
  const { count, increment } = useStore();
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## 7. 性能调试

### 7.1 识别渲染问题

```tsx
function ExpensiveComponent({ data }) {
  // 断点: 检查渲染次数
  console.log('Component rendered');
  
  // 使用useWhyDidYouUpdate查看原因
  useWhyDidYouUpdate('ExpensiveComponent', { data });
  
  const processedData = useMemo(() => {
    // 断点: 检查是否缓存命中
    console.log('Processing data');
    return data.map(item => ({
      ...item,
      processed: true
    }));
  }, [data]);
  
  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} {...item} />
      ))}
    </div>
  );
}

// useWhyDidYouUpdate实现
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
          // 断点: 查看变化的props
        }
      });
      
      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', name, changesObj);
      }
    }
    
    previousProps.current = props;
  });
}
```

### 7.2 内存泄漏调试

```typescript
function LeakyComponent() {
  useEffect(() => {
    // 断点: 检查订阅
    const subscription = eventEmitter.subscribe('event', handler);
    
    // 断点: 检查是否正确清理
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // 断点: 检查定时器
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);
    
    // 断点: 确保清理
    return () => {
      clearInterval(timer);
    };
  }, []);
}
```

## 8. 调试技巧集锦

### 8.1 快捷键

```typescript
const shortcuts = {
  启动调试: 'F5',
  停止调试: 'Shift + F5',
  继续执行: 'F5',
  单步跳过: 'F10',
  单步进入: 'F11',
  单步跳出: 'Shift + F11',
  重启调试: 'Ctrl + Shift + F5',
  切换断点: 'F9',
  条件断点: '右键断点',
  禁用所有断点: 'Ctrl + F9'
};
```

### 8.2 调试控制台技巧

```typescript
// 调试控制台可以执行代码
const consoleTricks = {
  查看变量: 'console.log(variable)',
  查看对象: 'console.dir(object)',
  查看表格: 'console.table(array)',
  计时: 'console.time("label") / console.timeEnd("label")',
  追踪: 'console.trace()',
  分组: 'console.group("label") / console.groupEnd()',
  条件日志: 'condition && console.log("message")'
};

// 在调试控制台执行
// $0 - 获取Elements面板选中的元素
// $_ - 获取上一个表达式的值
// copy() - 复制到剪贴板
```

### 8.3 Source Map配置

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true  // 生成source map
  }
};

// webpack.config.js
module.exports = {
  devtool: 'source-map'  // 最详细的source map
  // 其他选项:
  // 'eval' - 最快,但难以调试
  // 'cheap-source-map' - 较快,行级映射
  // 'inline-source-map' - 内联到bundle
};

// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

## 9. 远程调试

### 9.1 移动设备调试

```typescript
// Android调试(Chrome DevTools)
const androidDebug = {
  步骤1: '手机开启USB调试',
  步骤2: '连接电脑',
  步骤3: 'Chrome访问chrome://inspect',
  步骤4: '发现设备并开始调试'
};

// iOS调试(Safari)
const iosDebug = {
  步骤1: 'iPhone开启Web检查器',
  步骤2: '连接Mac',
  步骤3: 'Safari->开发->选择设备',
  步骤4: '开始调试'
};
```

### 9.2 远程服务器调试

```json
// launch.json - 远程调试配置
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Remote",
      "address": "your-server.com",
      "port": 9229,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app"
    }
  ]
}
```

## 10. 调试React Native

### 10.1 React Native调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    },
    {
      "name": "Debug iOS",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "launch",
      "platform": "ios"
    },
    {
      "name": "Attach to packager",
      "cwd": "${workspaceFolder}",
      "type": "reactnative",
      "request": "attach"
    }
  ]
}
```

### 10.2 React Native调试技巧

```typescript
// 使用Flipper调试
const flipperDebug = {
  安装: 'brew install --cask flipper',
  功能: [
    '查看布局',
    '网络请求',
    'Redux状态',
    '性能分析',
    '日志查看'
  ]
};

// React Native Debugger
const rnDebugger = {
  下载: 'https://github.com/jhen0409/react-native-debugger',
  功能: [
    'Chrome DevTools',
    'Redux DevTools',
    'React DevTools',
    '断点调试'
  ]
};
```

## 11. 测试调试

### 11.1 Jest测试调试

```json
// launch.json - Jest调试
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-coverage",
        "${file}"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug All",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-coverage"
      ],
      "console": "integratedTerminal"
    }
  ]
}
```

### 11.2 调试测试用例

```typescript
// UserComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserComponent from './UserComponent';

describe('UserComponent', () => {
  it('should render user name', () => {
    // 断点: 测试开始
    const user = { id: 1, name: 'John' };
    
    // 断点: 渲染组件
    render(<UserComponent user={user} />);
    
    // 断点: 查询元素
    const nameElement = screen.getByText('John');
    
    // 断点: 断言
    expect(nameElement).toBeInTheDocument();
  });
  
  it('should handle click event', () => {
    // 断点: 准备mock
    const handleClick = jest.fn();
    
    render(<UserComponent onClick={handleClick} />);
    
    // 断点: 触发事件
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // 断点: 验证调用
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 12. 常见问题调试

### 12.1 状态不更新

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    // 断点: 检查是否执行
    setCount(count + 1);
    // 断点: 查看count值(仍是旧值,因为闭包)
    console.log(count);  // 仍然是旧值
  };
  
  // 正确做法
  const handleClickCorrect = () => {
    setCount(prevCount => {
      // 断点: 查看prevCount
      return prevCount + 1;
    });
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### 12.2 无限循环

```typescript
function InfiniteLoop() {
  const [data, setData] = useState([]);
  
  // 错误: 依赖数组缺失,每次渲染都执行
  useEffect(() => {
    // 断点: 检查执行次数
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);  // 触发重新渲染
      });
  });  // 缺少依赖数组
  
  // 正确
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);  // 空依赖数组,只执行一次
}
```

### 12.3 内存泄漏

```typescript
function MemoryLeak() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    // 断点: 开始异步操作
    fetchData().then(result => {
      // 断点: 检查是否已取消
      if (!cancelled) {
        setData(result);
      }
    });
    
    return () => {
      // 断点: 组件卸载时执行
      cancelled = true;
    };
  }, []);
}
```

## 13. 高级调试技巧

### 13.1 动态断点

```typescript
// 使用debugger语句
function complexFunction(data) {
  if (data.length > 100) {
    debugger;  // 只在数据量大时暂停
  }
  
  return processData(data);
}

// 条件断点表达式
const advancedConditions = {
  性能监控: 'performance.now() - startTime > 1000',
  特定用户: 'user.id === "admin"',
  错误情况: 'error !== null',
  复杂逻辑: 'items.filter(i => i.active).length > 10'
};
```

### 13.2 监视点(Watch)

```typescript
function useComplexState() {
  const [state, setState] = useState({
    user: null,
    posts: [],
    loading: false
  });
  
  // 在监视面板添加:
  // state.user
  // state.posts.length
  // state.loading
  // JSON.stringify(state)
  
  return [state, setState];
}
```

### 13.3 调用栈分析

```typescript
function deepFunction() {
  function level1() {
    function level2() {
      function level3() {
        // 断点: 查看完整调用栈
        console.trace();
        debugger;
      }
      level3();
    }
    level2();
  }
  level1();
}

// 调用栈显示:
// level3
// level2
// level1
// deepFunction
// (anonymous)
```

## 14. 插件推荐

### 14.1 必备插件

```typescript
const essentialExtensions = {
  调试相关: [
    'Debugger for Chrome',
    'JavaScript Debugger (Nightly)',
    'React Developer Tools'
  ],
  
  辅助工具: [
    'Error Lens - 行内显示错误',
    'Better Comments - 注释高亮',
    'Code Spell Checker - 拼写检查'
  ],
  
  React相关: [
    'ES7+ React/Redux/React-Native snippets',
    'React PropTypes Intellisense',
    'VSCode React Refactor'
  ]
};
```

### 14.2 插件配置

```json
// settings.json
{
  "debug.console.fontSize": 14,
  "debug.console.lineHeight": 20,
  "debug.inlineValues": true,
  "debug.openDebug": "openOnDebugBreak",
  "debug.showBreakpointsInOverviewRuler": true,
  "debug.toolBarLocation": "docked"
}
```

## 15. 调试最佳实践

### 15.1 调试策略

```typescript
const debuggingStrategy = {
  重现问题: {
    最小化复现: '找到最小复现步骤',
    隔离问题: '排除无关因素',
    记录步骤: '详细记录操作步骤'
  },
  
  定位问题: {
    二分法: '逐步缩小范围',
    日志输出: '关键位置输出日志',
    断点调试: '可疑位置设置断点',
    调用栈: '查看函数调用链'
  },
  
  解决问题: {
    理解原因: '搞清楚为什么出错',
    修复验证: '确保修复有效',
    回归测试: '确保没有引入新问题',
    文档记录: '记录问题和解决方案'
  }
};
```

### 15.2 调试清单

```typescript
const debuggingChecklist = [
  '是否启用了source map?',
  '断点是否设置在正确位置?',
  '变量值是否符合预期?',
  '是否检查了调用栈?',
  '是否查看了网络请求?',
  '是否检查了控制台错误?',
  '是否测试了边界情况?',
  '是否清理了副作用?',
  '是否检查了性能影响?',
  '是否编写了测试用例?'
];
```

## 16. 总结

VS Code调试React应用的核心要点:

1. **配置正确的launch.json**: 根据项目类型配置
2. **掌握断点技巧**: 普通、条件、日志点
3. **利用调试面板**: 变量、监视、调用栈
4. **理解异步调试**: Promise、async/await
5. **性能调试**: 识别渲染问题、内存泄漏
6. **测试调试**: Jest测试断点调试
7. **善用快捷键**: 提高调试效率
8. **Source Map**: 确保正确映射源码

调试是开发的重要技能,熟练掌握VS Code调试工具可以大大提升开发效率和代码质量。


