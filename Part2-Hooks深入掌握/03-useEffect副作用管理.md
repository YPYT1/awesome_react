# useEffect副作用管理

## 学习目标

通过本章学习,你将全面掌握:

- useEffect的概念和作用机制
- 依赖数组的详细规则与最佳实践
- 清理函数的使用场景与模式
- 常见错误与解决方案详解
- 性能优化技巧与策略
- useEffect与React生命周期的对应关系
- React 19中useEffect的最新特性与最佳实践
- 复杂副作用管理的高级模式
- TypeScript中的useEffect类型定义
- 生产环境的调试与监控技巧

## 第一部分:useEffect核心概念

### 1.1 什么是副作用

在React中,副作用(Side Effect)是指与组件渲染输出无直接关系的操作。这些操作通常会与外部世界交互或产生可观察的效果。

```jsx
import { useState, useEffect } from 'react';

// 副作用示例:修改文档标题
function DocumentTitleExample() {
  const [count, setCount] = useState(0);
  
  // 副作用:修改document.title(浏览器API)
  useEffect(() => {
    document.title = `你点击了 ${count} 次`;
  });
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}

// 常见的副作用类型
function SideEffectTypes() {
  const [userId, setUserId] = useState(1);
  
  // 1. 数据获取
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => console.log(data));
  }, [userId]);
  
  // 2. 订阅
  useEffect(() => {
    const subscription = subscribeToUserStatus(userId);
    return () => subscription.unsubscribe();
  }, [userId]);
  
  // 3. 定时器
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('延迟执行');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // 4. 手动DOM操作
  useEffect(() => {
    const element = document.getElementById('target');
    element.style.color = 'red';
  }, []);
  
  // 5. 日志记录
  useEffect(() => {
    console.log('组件已挂载');
  }, []);
  
  // 6. 本地存储
  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);
  
  return <div>副作用示例</div>;
}
```

### 1.2 useEffect基本语法

```jsx
// useEffect完整语法
useEffect(
  () => {
    // 副作用代码(Effect函数)
    
    return () => {
      // 清理函数(Cleanup函数) - 可选
    };
  },
  [dependencies]  // 依赖数组 - 可选
);

// 基础示例
function BasicEffectExample() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // Effect 1:每次渲染后执行
  useEffect(() => {
    console.log('组件渲染了');
  });
  
  // Effect 2:只在挂载时执行
  useEffect(() => {
    console.log('组件挂载了');
  }, []);
  
  // Effect 3:count变化时执行
  useEffect(() => {
    console.log('count变化为:', count);
  }, [count]);
  
  // Effect 4:带清理函数
  useEffect(() => {
    console.log('Effect执行');
    
    return () => {
      console.log('清理函数执行');
    };
  }, [count]);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>计数: {count}</button>
      <input value={text} onChange={e => setText(e.target.value)} />
    </div>
  );
}
```

### 1.3 执行时机详解

```jsx
import { useEffect, useLayoutEffect } from 'react';

function ExecutionTimingDetail() {
  const [count, setCount] = useState(0);
  
  console.log('1. 组件渲染开始');
  
  useLayoutEffect(() => {
    console.log('3. useLayoutEffect执行(DOM更新后,浏览器绘制前)');
    // 同步执行,会阻塞浏览器绘制
    
    return () => {
      console.log('useLayoutEffect清理');
    };
  });
  
  useEffect(() => {
    console.log('4. useEffect执行(浏览器绘制后)');
    // 异步执行,不阻塞浏览器绘制
    
    return () => {
      console.log('useEffect清理');
    };
  });
  
  console.log('2. 组件渲染结束');
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 执行顺序总结
/*
首次渲染:
1. 组件渲染开始
2. 组件渲染结束
3. useLayoutEffect执行
4. 浏览器绘制
5. useEffect执行

更新渲染(count变化):
1. 组件渲染开始
2. 组件渲染结束
3. useLayoutEffect清理(旧的)
4. useLayoutEffect执行(新的)
5. 浏览器绘制
6. useEffect清理(旧的)
7. useEffect执行(新的)

组件卸载:
1. useLayoutEffect清理
2. useEffect清理
*/

// 时机对比示例
function TimingComparison() {
  const [show, setShow] = useState(true);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>切换</button>
      {show && <TimingChild />}
    </div>
  );
}

function TimingChild() {
  useEffect(() => {
    console.log('useEffect:挂载');
    
    return () => {
      console.log('useEffect:卸载');
    };
  }, []);
  
  useLayoutEffect(() => {
    console.log('useLayoutEffect:挂载');
    
    return () => {
      console.log('useLayoutEffect:卸载');
    };
  }, []);
  
  return <div>子组件</div>;
}
```

## 第二部分:依赖数组深度解析

### 2.1 依赖数组的三种形式

```jsx
function DependencyArrayForms() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 形式1:无依赖数组 - 每次渲染后都执行
  useEffect(() => {
    console.log('每次渲染都执行,包括首次渲染和所有更新');
    // 用途:调试、性能追踪
  });
  
  // 形式2:空依赖数组 - 只在挂载时执行一次
  useEffect(() => {
    console.log('只在组件挂载时执行一次');
    // 用途:初始化、一次性订阅、获取初始数据
    
    return () => {
      console.log('只在组件卸载时执行一次');
    };
  }, []);
  
  // 形式3:有依赖数组 - 依赖变化时执行
  useEffect(() => {
    console.log('count或text变化时执行');
    // 用途:响应特定状态/props的变化
  }, [count, text]);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <input value={text} onChange={e => setText(e.target.value)} />
    </div>
  );
}

// 依赖数组的对比
function DependencyComparison() {
  const [count, setCount] = useState(0);
  
  // 无依赖数组:过度执行
  useEffect(() => {
    console.log('过度执行:每次渲染都获取数据');
    fetchData();
  });  // ❌ 每次渲染都执行,性能问题
  
  // 空依赖数组:只执行一次
  useEffect(() => {
    console.log('只执行一次:初始化获取数据');
    fetchData();
  }, []);  // ✅ 只在挂载时执行
  
  // 有依赖数组:按需执行
  useEffect(() => {
    console.log('按需执行:count变化时获取数据');
    fetchData(count);
  }, [count]);  // ✅ count变化时执行
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 2.2 依赖数组的规则

```jsx
import { useState, useEffect, useCallback, useMemo } from 'react';

function DependencyRules() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ id: 1, name: 'Alice' });
  
  // 规则1:必须列出Effect中使用的所有响应式值
  useEffect(() => {
    console.log('count:', count);
    console.log('user:', user.name);
  }, [count, user]);  // 必须包含count和user
  
  // 规则2:函数也是依赖
  const handleLog = () => {
    console.log('count:', count);
  };
  
  useEffect(() => {
    handleLog();
  }, [handleLog]);  // handleLog每次渲染都是新函数,导致Effect频繁执行
  
  // 规则3:对象和数组每次渲染都是新的引用
  const config = { threshold: count };
  
  useEffect(() => {
    processConfig(config);
  }, [config]);  // config每次都是新对象,导致Effect频繁执行
  
  return <div>{count}</div>;
}

// 依赖优化
function DependencyOptimization() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ id: 1, name: 'Alice' });
  
  // 优化1:使用useCallback稳定函数引用
  const handleLog = useCallback(() => {
    console.log('count:', count);
  }, [count]);  // 只在count变化时重新创建函数
  
  useEffect(() => {
    handleLog();
  }, [handleLog]);  // handleLog引用稳定
  
  // 优化2:使用useMemo稳定对象引用
  const config = useMemo(() => ({
    threshold: count,
    userId: user.id
  }), [count, user.id]);  // 只在count或user.id变化时重新创建对象
  
  useEffect(() => {
    processConfig(config);
  }, [config]);  // config引用稳定
  
  // 优化3:直接在Effect中创建对象
  useEffect(() => {
    const config = { threshold: count, userId: user.id };
    processConfig(config);
  }, [count, user.id]);  // 直接依赖原始值,无需useMemo
  
  return <div>{count}</div>;
}

// 依赖检查
function DependencyLinting() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // ❌ ESLint警告:React Hook useEffect has a missing dependency: 'text'
  useEffect(() => {
    console.log(count, text);
  }, [count]);  // 遗漏text依赖
  
  // ✅ 修复:添加所有依赖
  useEffect(() => {
    console.log(count, text);
  }, [count, text]);
  
  // ❌ ESLint警告:React Hook useEffect has a complex expression in the dependency array
  useEffect(() => {
    console.log(user.name);
  }, [user.name]);  // 应该依赖整个user对象
  
  // ✅ 修复:依赖整个对象或提取变量
  const userName = user.name;
  
  useEffect(() => {
    console.log(userName);
  }, [userName]);
  
  return <div>{count}</div>;
}
```

### 2.3 依赖数组的陷阱

```jsx
function DependencyTraps() {
  const [count, setCount] = useState(0);
  
  // 陷阱1:遗漏依赖导致闭包陷阱
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('count:', count);  // count永远是0
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // ❌ 遗漏count依赖
  
  // 解决:添加依赖或使用函数式更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        console.log('count:', prev);  // 总是最新值
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // ✅ 使用函数式更新,无需依赖count
  
  // 陷阱2:对象依赖导致无限循环
  const [data, setData] = useState({ items: [] });
  
  useEffect(() => {
    fetchData().then(result => {
      setData({ items: result });  // 创建新对象
    });
  }, [data]);  // ❌ data变化触发Effect,Effect更新data,无限循环
  
  // 解决:依赖对象的特定属性或使用其他状态触发
  useEffect(() => {
    fetchData().then(result => {
      setData({ items: result });
    });
  }, [data.items.length]);  // ✅ 只依赖长度
  
  // 或使用单独的触发器
  const [trigger, setTrigger] = useState(0);
  
  useEffect(() => {
    fetchData().then(result => {
      setData({ items: result });
    });
  }, [trigger]);  // ✅ 依赖触发器,手动控制
  
  return <div>{count}</div>;
}

// Props作为依赖
function PropsAsDependency({ userId, onUserChange, config }) {
  const [user, setUser] = useState(null);
  
  // 问题:props每次可能都是新的
  useEffect(() => {
    fetchUser(userId).then(user => {
      setUser(user);
      onUserChange(user);  // 回调函数每次都是新的
    });
  }, [userId, onUserChange]);  // 如果onUserChange每次都是新的,Effect会频繁执行
  
  // 解决:父组件使用useCallback
  // 在Parent组件中:
  // const handleUserChange = useCallback((user) => {
  //   console.log(user);
  // }, []);
  
  return <div>{user?.name}</div>;
}
```

## 第三部分:清理函数详解

### 3.1 清理函数的作用

```jsx
function CleanupFunctionRole() {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    console.log('Effect执行,设置副作用');
    
    // 设置定时器
    const timer = setInterval(() => {
      console.log('定时器执行');
    }, 1000);
    
    // 清理函数:移除副作用
    return () => {
      clearInterval(timer);
      console.log('清理函数执行,移除定时器');
    };
  }, [count]);  // count变化时,先清理旧Effect,再执行新Effect
  
  // 生命周期说明:
  // 1. 组件挂载 → Effect执行
  // 2. count变化 → 清理函数执行(清理旧Effect) → Effect执行(设置新Effect)
  // 3. 组件卸载 → 清理函数执行(清理最后的Effect)
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>计数: {count}</button>
      <button onClick={() => setShow(false)}>卸载组件</button>
    </div>
  );
}

// 清理函数的必要性
function WhyCleanup() {
  const [subscribed, setSubscribed] = useState(true);
  
  // ❌ 没有清理函数
  useEffect(() => {
    const subscription = subscribeToUpdates();
    // 组件卸载时订阅未取消,导致内存泄漏
  }, []);
  
  // ✅ 有清理函数
  useEffect(() => {
    const subscription = subscribeToUpdates();
    
    return () => {
      subscription.unsubscribe();  // 清理订阅,防止内存泄漏
    };
  }, []);
  
  return <div>订阅状态: {subscribed ? '已订阅' : '未订阅'}</div>;
}
```

### 3.2 清理函数的场景

```jsx
function CleanupScenarios() {
  const [activeTab, setActiveTab] = useState('home');
  
  // 场景1:清理定时器
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('延迟执行');
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      console.log('清理定时器');
    };
  }, [activeTab]);
  
  // 场景2:清理间隔定时器
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('周期执行');
    }, 1000);
    
    return () => {
      clearInterval(interval);
      console.log('清理间隔定时器');
    };
  }, []);
  
  // 场景3:清理事件监听
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小:', window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      console.log('清理事件监听');
    };
  }, []);
  
  // 场景4:取消网络请求
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/data', {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      controller.abort();
      console.log('取消网络请求');
    };
  }, [activeTab]);
  
  // 场景5:清理订阅
  useEffect(() => {
    const subscription = subscribeToMessages((message) => {
      console.log('收到消息:', message);
    });
    
    return () => {
      subscription.unsubscribe();
      console.log('清理订阅');
    };
  }, []);
  
  // 场景6:清理DOM操作
  useEffect(() => {
    const element = document.getElementById('target');
    element.classList.add('active');
    
    return () => {
      element.classList.remove('active');
      console.log('清理DOM操作');
    };
  }, []);
  
  // 场景7:清理动画
  useEffect(() => {
    const element = document.getElementById('animated');
    const animation = element.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(100px)' }
    ], {
      duration: 1000,
      iterations: Infinity
    });
    
    return () => {
      animation.cancel();
      console.log('取消动画');
    };
  }, []);
  
  return (
    <div>
      <button onClick={() => setActiveTab('home')}>Home</button>
      <button onClick={() => setActiveTab('profile')}>Profile</button>
    </div>
  );
}

// WebSocket清理示例
function WebSocketCleanup({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    // 创建WebSocket连接
    const ws = new WebSocket(`wss://example.com/rooms/${roomId}`);
    
    ws.onopen = () => {
      console.log('WebSocket连接已建立');
      setConnected(true);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      setConnected(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
      setConnected(false);
    };
    
    // 清理:关闭WebSocket连接
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log('清理:关闭WebSocket连接');
      }
    };
  }, [roomId]);  // roomId变化时,关闭旧连接,建立新连接
  
  return (
    <div>
      <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
        状态: {connected ? '已连接' : '未连接'}
      </div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>{msg.text}</div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 清理函数的时机

```jsx
function CleanupTiming() {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    console.log(`Effect执行: count = ${count}`);
    
    return () => {
      // 注意:这里的count是闭包中的值,是Effect执行时的count
      console.log(`清理函数执行: count = ${count}`);
    };
  }, [count]);
  
  // 执行顺序演示:
  // 初始渲染(count=0):
  //   → Effect执行: count = 0
  //
  // 点击按钮(count变为1):
  //   → 清理函数执行: count = 0 (旧的闭包值)
  //   → Effect执行: count = 1
  //
  // 再次点击(count变为2):
  //   → 清理函数执行: count = 1 (旧的闭包值)
  //   → Effect执行: count = 2
  //
  // 组件卸载:
  //   → 清理函数执行: count = 2 (最后的闭包值)
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>计数: {count}</button>
      <button onClick={() => setShow(false)}>卸载</button>
    </div>
  );
}

// 清理函数与异步操作
function CleanupWithAsync() {
  const [userId, setUserId] = useState(1);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    console.log('开始获取用户数据:', userId);
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {  // 检查是否已取消
          setUser(data);
          console.log('成功设置用户数据:', userId);
        } else {
          console.log('已取消,不设置用户数据:', userId);
        }
      });
    
    return () => {
      cancelled = true;  // 标记为已取消
      console.log('清理函数:标记请求已取消:', userId);
    };
  }, [userId]);
  
  // 快速切换userId时:
  // 1. userId=1 → 开始获取用户1
  // 2. userId=2 → 清理函数执行(cancelled=true for user1) → 开始获取用户2
  // 3. 用户1请求返回 → 由于cancelled=true,不设置状态
  // 4. 用户2请求返回 → cancelled=false,设置状态
  
  return (
    <div>
      <button onClick={() => setUserId(1)}>用户1</button>
      <button onClick={() => setUserId(2)}>用户2</button>
      <div>{user?.name}</div>
    </div>
  );
}
```

## 第四部分:常见错误与解决方案

### 4.1 闭包陷阱

```jsx
function ClosureTrap() {
  const [count, setCount] = useState(0);
  
  // ❌ 问题:闭包导致count永远是初始值
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', count);  // count永远是0
      setCount(count + 1);  // 基于0递增,count只能变成1
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 空依赖导致闭包
  
  return <div>{count}</div>;
}

// 解决方案汇总
function ClosureSolutions() {
  const [count, setCount] = useState(0);
  
  // 方案1:添加依赖(会导致定时器重建)
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', count);
      setCount(count + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [count]);  // 每次count变化都重建定时器
  
  // 方案2:使用函数式更新(推荐)
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        console.log('Count:', prev);
        return prev + 1;  // 基于最新值
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 空依赖即可
  
  // 方案3:使用useRef
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;  // 同步最新值到ref
  }, [count]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', countRef.current);
      setCount(countRef.current + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 方案4:使用useReducer
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      default:
        return state;
    }
  }, { count: 0 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'increment' });  // dispatch总是稳定的
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);  // 空依赖即可
  
  return <div>{count}</div>;
}
```

### 4.2 无限循环

```jsx
function InfiniteLoopErrors() {
  const [data, setData] = useState([]);
  
  // ❌ 错误1:依赖导致的无限循环
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);  // 更新data
  }, [data]);  // data变化触发Effect,Effect更新data,无限循环
  
  // ❌ 错误2:对象依赖导致的无限循环
  const [user, setUser] = useState({ id: 1 });
  
  useEffect(() => {
    setUser({ ...user, name: 'Alice' });  // 创建新对象
  }, [user]);  // user引用变化,无限循环
  
  // ❌ 错误3:Effect内部调用setState
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1);  // 每次渲染都执行,无限循环
  });
  
  return <div>{data.length}</div>;
}

// 解决方案
function InfiniteLoopFixes() {
  // 解决1:移除不必要的依赖
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);  // 只在挂载时执行
  
  // 解决2:依赖对象的特定属性
  const [user, setUser] = useState({ id: 1, name: '' });
  
  useEffect(() => {
    if (!user.name) {
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => setUser({ ...user, name: data.name }));
    }
  }, [user.id]);  // 只依赖id,不依赖整个user对象
  
  // 解决3:使用条件判断
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (count < 10) {  // 添加条件
      setCount(count + 1);
    }
  }, [count]);
  
  // 解决4:使用useMemo缓存对象
  const config = useMemo(() => ({
    threshold: 100,
    userId: user.id
  }), [user.id]);
  
  useEffect(() => {
    processConfig(config);
  }, [config]);  // config引用稳定
  
  return <div>{count}</div>;
}
```

### 4.3 竞态条件

```jsx
function RaceConditionError({ userId }) {
  const [user, setUser] = useState(null);
  
  // ❌ 问题:快速切换导致数据错乱
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
    
    // 问题场景:
    // 1. userId=1,发起请求A
    // 2. userId=2,发起请求B
    // 3. 请求B先返回,设置user=2
    // 4. 请求A后返回,设置user=1
    // 结果:userId=2,但显示的是user=1的数据
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// 解决方案
function RaceConditionFixes({ userId }) {
  const [user, setUser] = useState(null);
  
  // 方案1:使用ignore标记
  useEffect(() => {
    let ignore = false;
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {  // 检查是否已过期
          setUser(data);
        }
      });
    
    return () => {
      ignore = true;  // 清理时标记为已过期
    };
  }, [userId]);
  
  // 方案2:使用AbortController
  useEffect(() => {
    const controller = new AbortController();
    
    fetch(`/api/users/${userId}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(setUser)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      controller.abort();  // 取消请求
    };
  }, [userId]);
  
  // 方案3:使用版本号
  const versionRef = useRef(0);
  
  useEffect(() => {
    const currentVersion = ++versionRef.current;
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (versionRef.current === currentVersion) {  // 检查版本
          setUser(data);
        }
      });
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

### 4.4 内存泄漏

```jsx
function MemoryLeakErrors() {
  const [count, setCount] = useState(0);
  
  // ❌ 错误1:未清理定时器
  useEffect(() => {
    setInterval(() => {
      console.log('定时器执行');
    }, 1000);
    // 组件卸载后定时器仍在运行,内存泄漏
  }, []);
  
  // ❌ 错误2:未取消订阅
  useEffect(() => {
    const subscription = subscribeToUpdates();
    // 组件卸载后订阅仍然存在,内存泄漏
  }, []);
  
  // ❌ 错误3:未移除事件监听
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // 组件卸载后监听器仍然存在,内存泄漏
  }, []);
  
  // ❌ 错误4:异步操作后设置状态
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
    // 组件卸载后请求返回,尝试设置已卸载组件的状态,内存泄漏
  }, []);
  
  return <div>{count}</div>;
}

// 解决方案
function MemoryLeakFixes() {
  // 解决1:清理定时器
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('定时器执行');
    }, 1000);
    
    return () => clearInterval(timer);  // ✅ 清理定时器
  }, []);
  
  // 解决2:取消订阅
  useEffect(() => {
    const subscription = subscribeToUpdates();
    
    return () => subscription.unsubscribe();  // ✅ 取消订阅
  }, []);
  
  // 解决3:移除事件监听
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小变化');
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);  // ✅ 移除监听
    };
  }, []);
  
  // 解决4:检查组件是否已卸载
  useEffect(() => {
    let cancelled = false;
    
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {  // ✅ 检查是否已卸载
          setData(data);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, []);
  
  return <div>内容</div>;
}
```

## 第五部分:实战案例

### 5.1 完整的数据获取

```jsx
function DataFetchingComplete({ url, options = {} }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, loading, error } = DataFetchingComplete({
    url: `/api/users/${userId}`
  });
  
  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;
  if (!user) return null;
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### 5.2 窗口事件监听

```jsx
function WindowEventListeners() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const [scrollPosition, setScrollPosition] = useState({
    x: window.scrollX,
    y: window.scrollY
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 监听滚动位置
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div className="window-info">
      <div>窗口大小: {windowSize.width} x {windowSize.height}</div>
      <div>滚动位置: X={scrollPosition.x}, Y={scrollPosition.y}</div>
      <div>网络状态: {isOnline ? '在线' : '离线'}</div>
    </div>
  );
}

// 防抖版本(性能优化)
function WindowEventListenersDebounced() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    let timeoutId;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 200);  // 200ms防抖
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div>窗口大小: {windowSize.width} x {windowSize.height}</div>
  );
}
```

### 5.3 LocalStorage同步

```jsx
function LocalStorageSync({ storageKey, initialValue }) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('读取localStorage失败:', error);
      return initialValue;
    }
  });
  
  // 同步到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error('写入localStorage失败:', error);
    }
  }, [storageKey, value]);
  
  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('解析localStorage变化失败:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey]);
  
  return [value, setValue];
}

// 使用示例
function ThemeSwitcher() {
  const [theme, setTheme] = LocalStorageSync('theme', 'light');
  
  useEffect(() => {
    document.body.className = theme;
    
    return () => {
      document.body.className = '';
    };
  }, [theme]);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      切换主题: {theme}
    </button>
  );
}
```

### 5.4 Intersection Observer

```jsx
function LazyLoadImage({ src, alt, placeholder }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isLoaded) {
            setImageSrc(src);
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, isLoaded]);
  
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={isLoaded ? 'loaded' : 'loading'}
    />
  );
}

// 无限滚动
function InfiniteScroll({ loadMore, hasMore }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true);
          
          try {
            const newItems = await loadMore();
            setItems(prev => [...prev, ...newItems]);
          } catch (error) {
            console.error('加载更多失败:', error);
          } finally {
            setLoading(false);
          }
        }
      },
      {
        threshold: 1.0
      }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadMore]);
  
  return (
    <div className="infinite-scroll">
      {items.map(item => (
        <div key={item.id} className="item">{item.text}</div>
      ))}
      
      {hasMore && (
        <div ref={loadMoreRef} className="load-more">
          {loading ? '加载中...' : '加载更多'}
        </div>
      )}
      
      {!hasMore && <div className="no-more">没有更多了</div>}
    </div>
  );
}
```

## 第六部分:性能优化

### 6.1 减少Effect执行频率

```jsx
// 防抖Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 节流Hook
function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}

// 使用示例
function SearchWithDebounce() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // 只在防抖值变化时搜索
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetch(`/api/search?q=${debouncedSearchTerm}`)
        .then(res => res.json())
        .then(setResults);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="搜索..."
      />
      <ul>
        {results.map(r => <li key={r.id}>{r.title}</li>)}
      </ul>
    </div>
  );
}

function ScrollWithThrottle() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 200);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // 只在节流值变化时执行昂贵操作
  useEffect(() => {
    console.log('执行昂贵操作:', throttledScrollY);
  }, [throttledScrollY]);
  
  return <div>滚动位置: {throttledScrollY}</div>;
}
```

### 6.2 条件执行Effect

```jsx
function ConditionalEffect({ shouldFetch, userId }) {
  const [data, setData] = useState(null);
  
  // ✅ 好:条件判断在Effect内部
  useEffect(() => {
    if (!shouldFetch) return;
    
    let cancelled = false;
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [shouldFetch, userId]);
  
  return <div>{data?.name}</div>;
}

// 延迟执行Effect
function DelayedEffect() {
  const [show, setShow] = useState(false);
  
  // 挂载后延迟执行
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 只在show为true时执行
  useEffect(() => {
    if (!show) return;
    
    console.log('延迟执行的Effect');
    loadHeavyResource();
  }, [show]);
  
  return <div>{show && '内容已显示'}</div>;
}
```

### 6.3 Effect拆分策略

```jsx
// ❌ 不好:一个大Effect,任何依赖变化都重新执行所有逻辑
function BadSingleEffect({ userId, theme, language }) {
  useEffect(() => {
    // 获取用户数据
    fetchUser(userId);
    
    // 订阅更新
    const unsubscribe = subscribeToUpdates(userId);
    
    // 应用主题
    document.body.className = theme;
    
    // 加载翻译
    loadTranslations(language);
    
    return () => {
      unsubscribe();
      document.body.className = '';
    };
  }, [userId, theme, language]);  // 任何变化都重新执行所有逻辑
  
  return <div>内容</div>;
}

// ✅ 好:按功能拆分为多个Effect
function GoodMultipleEffects({ userId, theme, language }) {
  // Effect 1:获取用户数据和订阅(依赖userId)
  useEffect(() => {
    fetchUser(userId);
    
    const unsubscribe = subscribeToUpdates(userId);
    
    return () => {
      unsubscribe();
    };
  }, [userId]);
  
  // Effect 2:应用主题(依赖theme)
  useEffect(() => {
    document.body.className = theme;
    
    return () => {
      document.body.className = '';
    };
  }, [theme]);
  
  // Effect 3:加载翻译(依赖language)
  useEffect(() => {
    loadTranslations(language);
  }, [language]);
  
  return <div>内容</div>;
}

// 按职责拆分为自定义Hooks
function WithCustomHooks({ userId, theme, language }) {
  useUserData(userId);
  useTheme(theme);
  useTranslation(language);
  
  return <div>内容</div>;
}

function useUserData(userId) {
  useEffect(() => {
    fetchUser(userId);
    
    const unsubscribe = subscribeToUpdates(userId);
    
    return () => {
      unsubscribe();
    };
  }, [userId]);
}

function useTheme(theme) {
  useEffect(() => {
    document.body.className = theme;
    
    return () => {
      document.body.className = '';
    };
  }, [theme]);
}

function useTranslation(language) {
  useEffect(() => {
    loadTranslations(language);
  }, [language]);
}
```

## 第七部分:React 19最佳实践

### 7.1 使用use()替代useEffect

```jsx
import { use, Suspense } from 'react';

// 旧方式:useEffect + useState
function OldWay({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(user => {
        setUser(user);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [userId]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return <div>{user?.name}</div>;
}

// 新方式:use() (React 19)
function fetchUser(userId) {
  return fetch(`/api/users/${userId}`)
    .then(res => res.json());
}

function NewWay({ userId }) {
  const user = use(fetchUser(userId));
  
  return <div>{user.name}</div>;
}

// 包裹在Suspense中
function App() {
  const [userId, setUserId] = useState(1);
  
  return (
    <div>
      <button onClick={() => setUserId(1)}>用户1</button>
      <button onClick={() => setUserId(2)}>用户2</button>
      
      <Suspense fallback={<div>加载中...</div>}>
        <ErrorBoundary fallback={<div>加载失败</div>}>
          <NewWay userId={userId} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
```

### 7.2 Server Actions集成

```jsx
'use client';

import { useActionState, useOptimistic } from 'react';

// Server Action
async function createTodo(prevState, formData) {
  'use server';
  
  const text = formData.get('text');
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newTodo = {
    id: Date.now(),
    text,
    completed: false
  };
  
  return { success: true, todo: newTodo };
}

// 使用useActionState
function TodoForm() {
  const [state, formAction, isPending] = useActionState(createTodo, null);
  
  return (
    <form action={formAction}>
      <input name="text" required />
      <button disabled={isPending}>
        {isPending ? '添加中...' : '添加'}
      </button>
      
      {state?.success && (
        <div className="success">添加成功: {state.todo.text}</div>
      )}
    </form>
  );
}

// 使用useOptimistic实现乐观更新
function TodoListOptimistic() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  const handleSubmit = async (formData) => {
    const text = formData.get('text');
    const optimisticTodo = {
      id: Date.now(),
      text,
      completed: false,
      pending: true
    };
    
    // 立即显示乐观更新
    addOptimisticTodo(optimisticTodo);
    
    // 实际创建
    const result = await createTodo(null, formData);
    
    if (result.success) {
      setTodos([...todos, result.todo]);
    }
  };
  
  return (
    <div>
      <form action={handleSubmit}>
        <input name="text" required />
        <button>添加</button>
      </form>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} className={todo.pending ? 'pending' : ''}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 7.3 Transition集成

```jsx
import { useTransition, useDeferredValue } from 'react';

function SearchWithTransition() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  // 不使用useEffect,而是在事件处理中使用transition
  const handleSearch = (value) => {
    setSearchTerm(value);
    
    startTransition(() => {
      // 这是一个低优先级更新
      fetch(`/api/search?q=${value}`)
        .then(res => res.json())
        .then(setResults);
    });
  };
  
  return (
    <div>
      <input
        value={searchTerm}
        onChange={e => handleSearch(e.target.value)}
      />
      
      {isPending && <div>搜索中...</div>}
      
      <ul>
        {results.map(r => <li key={r.id}>{r.title}</li>)}
      </ul>
    </div>
  );
}

function FilteredListWithDeferred({ items, filter }) {
  const deferredFilter = useDeferredValue(filter);
  
  // 使用延迟值过滤,不会阻塞输入
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.text.toLowerCase().includes(deferredFilter.toLowerCase())
    );
  }, [items, deferredFilter]);
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

## 第八部分:调试与监控

### 8.1 Effect执行追踪

```jsx
function useEffectDebugger(effect, dependencies, debugName = 'Effect') {
  const previousDeps = useRef(dependencies);
  const renderCount = useRef(0);
  
  renderCount.current++;
  
  useEffect(() => {
    const changedDeps = dependencies.reduce((acc, dep, index) => {
      if (dep !== previousDeps.current[index]) {
        acc.push({
          index,
          previous: previousDeps.current[index],
          current: dep
        });
      }
      return acc;
    }, []);
    
    if (changedDeps.length > 0) {
      console.group(`[${debugName}] Effect执行 (渲染 #${renderCount.current})`);
      console.log('变化的依赖:', changedDeps);
      console.log('所有依赖:', dependencies);
      console.groupEnd();
    }
    
    previousDeps.current = dependencies;
    
    const cleanup = effect();
    
    return () => {
      console.log(`[${debugName}] 清理函数执行`);
      if (cleanup) cleanup();
    };
  }, dependencies);
}

// 使用
function DebugComponent({ userId }) {
  const [count, setCount] = useState(0);
  
  useEffectDebugger(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(console.log);
  }, [userId, count], '用户数据获取');
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>计数: {count}</button>
    </div>
  );
}
```

### 8.2 性能监控

```jsx
function useEffectPerformance(effect, dependencies, name = 'Effect') {
  const executionCount = useRef(0);
  const totalDuration = useRef(0);
  const lastExecutionTime = useRef(0);
  
  useEffect(() => {
    const startTime = performance.now();
    
    const cleanup = effect();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    executionCount.current++;
    totalDuration.current += duration;
    lastExecutionTime.current = duration;
    
    console.log(`[${name}] 性能分析:`, {
      '本次耗时': `${duration.toFixed(2)}ms`,
      '执行次数': executionCount.current,
      '平均耗时': `${(totalDuration.current / executionCount.current).toFixed(2)}ms`,
      '总耗时': `${totalDuration.current.toFixed(2)}ms`
    });
    
    // 性能警告
    if (duration > 100) {
      console.warn(`[${name}] 性能警告: Effect执行时间过长 (${duration.toFixed(2)}ms)`);
    }
    
    return cleanup;
  }, dependencies);
  
  // 返回性能指标
  return {
    executionCount: executionCount.current,
    averageDuration: totalDuration.current / executionCount.current,
    lastDuration: lastExecutionTime.current
  };
}

// 使用
function PerformanceMonitoring() {
  const [data, setData] = useState([]);
  
  const metrics = useEffectPerformance(() => {
    const processed = expensiveOperation(data);
    console.log('处理结果:', processed);
  }, [data], '数据处理');
  
  return (
    <div>
      <div>执行次数: {metrics.executionCount}</div>
      <div>平均耗时: {metrics.averageDuration?.toFixed(2)}ms</div>
      <div>上次耗时: {metrics.lastDuration?.toFixed(2)}ms</div>
    </div>
  );
}
```

### 8.3 Effect可视化

```jsx
function useEffectLogger(name) {
  const renderCount = useRef(0);
  const effectCount = useRef(0);
  
  renderCount.current++;
  
  console.log(`[${name}] 渲染 #${renderCount.current}`);
  
  useEffect(() => {
    effectCount.current++;
    console.log(`[${name}] Effect执行 #${effectCount.current}`);
    
    return () => {
      console.log(`[${name}] 清理 #${effectCount.current}`);
    };
  });
}

function LoggedComponent({ userId }) {
  useEffectLogger('LoggedComponent');
  
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('userId Effect:', userId);
  }, [userId]);
  
  useEffect(() => {
    console.log('count Effect:', count);
  }, [count]);
  
  return (
    <div>
      <div>userId: {userId}</div>
      <button onClick={() => setCount(c => c + 1)}>count: {count}</button>
    </div>
  );
}
```

## 第九部分:TypeScript支持

### 9.1 Effect的类型定义

```typescript
import { useEffect, DependencyList, EffectCallback } from 'react';

// 基本类型
function TypedEffect() {
  const [count, setCount] = useState<number>(0);
  
  // Effect函数类型: EffectCallback = () => void | Destructor
  useEffect(() => {
    console.log(count);
    
    // 返回清理函数: Destructor = () => void
    return () => {
      console.log('清理');
    };
  }, [count]);  // 依赖数组类型: DependencyList = ReadonlyArray<any>
}

// 自定义Effect Hook
function useCustomEffect(
  effect: EffectCallback,
  deps: DependencyList,
  debugName: string = 'Effect'
) {
  useEffect(() => {
    console.log(`[${debugName}] 执行`);
    
    const cleanup = effect();
    
    return () => {
      console.log(`[${debugName}] 清理`);
      if (cleanup) cleanup();
    };
  }, deps);
}

// 异步Effect的类型
function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps: DependencyList
) {
  useEffect(() => {
    let cleanup: (() => void) | void;
    
    effect().then(result => {
      cleanup = result;
    });
    
    return () => {
      if (cleanup) cleanup();
    };
  }, deps);
}

// 使用
function AsyncComponent() {
  useAsyncEffect(async () => {
    const data = await fetchData();
    console.log(data);
    
    return () => {
      console.log('清理');
    };
  }, []);
}
```

### 9.2 数据获取的类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const data: T = await response.json();
        
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error as Error
          });
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [url]);
  
  return state;
}

// 使用
function UserProfile({ userId }: { userId: number }) {
  const { data: user, loading, error } = useFetch<User>(
    `/api/users/${userId}`
  );
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) return null;
  
  return <div>{user.name}</div>;
}
```

### 9.3 事件监听的类型

```typescript
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (event: WindowEventMap[K]) => {
      savedHandler.current(event);
    };
    
    window.addEventListener(eventName, eventListener, options);
    
    return () => {
      window.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, options]);
}

// 使用
function KeyboardListener() {
  useEventListener('keydown', (event) => {
    console.log('按键:', event.key);
  });
  
  useEventListener('resize', (event) => {
    console.log('窗口大小:', window.innerWidth, window.innerHeight);
  });
  
  return <div>监听键盘和窗口事件</div>;
}
```

## 第十部分:最佳实践总结

### 10.1 Effect使用原则

```jsx
/*
Effect使用的黄金法则:

1. 依赖数组规则
   - 列出所有使用的响应式值
   - 不要省略依赖
   - 不要使用对象字面量作为依赖
   - 使用ESLint的exhaustive-deps规则

2. 清理函数规则
   - 总是清理副作用
   - 定时器必须清除
   - 事件监听必须移除
   - 订阅必须取消
   - 异步操作必须取消

3. 性能优化规则
   - 拆分独立的Effect
   - 使用防抖/节流
   - 避免在Effect中创建对象/数组
   - 使用useCallback/useMemo稳定依赖

4. 代码组织规则
   - 按功能拆分Effect
   - 提取为自定义Hook
   - 使用清晰的注释说明用途
   - 保持Effect简单明了
*/

// 完整示例:遵循所有最佳实践
function BestPracticeExample({ userId, config }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  
  // 1. 拆分独立的Effect
  // Effect 1: 获取用户数据
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        const data = await response.json();
        
        if (!cancelled) {
          setUser(data);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && !cancelled) {
          console.error(error);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [userId]);  // 只依赖userId
  
  // Effect 2: 订阅更新
  useEffect(() => {
    if (!user) return;
    
    const sub = subscribeToUserUpdates(user.id);
    setSubscription(sub);
    
    return () => {
      sub.unsubscribe();
    };
  }, [user?.id]);  // 只依赖user.id
  
  // Effect 3: 应用配置
  useEffect(() => {
    applyConfig(config);
  }, [config]);  // 父组件应该使用useMemo稳定config
  
  return <div>{user?.name}</div>;
}
```

### 10.2 常见模式

```jsx
// 模式1: 数据获取
function useFetchPattern(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    let cancelled = false;
    
    setState({ data: null, loading: true, error: null });
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [url]);
  
  return state;
}

// 模式2: 订阅
function useSubscriptionPattern(source) {
  const [value, setValue] = useState(null);
  
  useEffect(() => {
    const subscription = source.subscribe(setValue);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [source]);
  
  return value;
}

// 模式3: 定时器
function useIntervalPattern(callback, delay) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);
    
    return () => clearInterval(interval);
  }, [delay]);
}

// 模式4: 事件监听
function useEventListenerPattern(event, handler, element = window) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    
    element.addEventListener(event, eventListener);
    
    return () => {
      element.removeEventListener(event, eventListener);
    };
  }, [event, element]);
}
```

## 练习题

### 基础练习

1. 实现document.title动态更新
2. 创建窗口大小监听器
3. 实现定时器组件(开始/暂停/重置)
4. 实现键盘快捷键监听

### 进阶练习

1. 完整的数据获取(loading/error/success状态)
2. 实现防抖搜索功能
3. 解决竞态条件问题
4. 实现WebSocket聊天组件
5. 创建无限滚动列表

### 高级练习

1. 实现复杂的副作用管理
2. 优化Effect性能
3. 使用React 19新特性
4. 实现Effect调试工具
5. 创建类型安全的自定义Effect Hooks

通过本章学习,你已经全面掌握了useEffect的使用,从基础概念到高级模式,从常见错误到性能优化,从调试技巧到TypeScript支持。useEffect是React中最重要的Hook之一,掌握它将使你能够构建健壮、高效的React应用。
