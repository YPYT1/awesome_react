# useEffectEvent非响应式事件（实验性）

## 学习目标

通过本章学习，你将掌握：

- useEffectEvent的设计动机和用途
- 响应式值和非响应式值的区分
- 解决Effect依赖问题的最佳方案
- useEffectEvent的使用场景
- 与useEffect、useCallback的对比
- 实战案例和最佳实践
- 常见问题和解决方案
- 迁移策略和注意事项

## 第一部分：问题背景

### 1.1 Effect依赖困境

在React中，useEffect的依赖数组经常导致困扰。

经典问题：
```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    
    return () => connection.disconnect();
  }, [roomId]); // 缺少theme依赖
  
  // 问题：theme变化时不会重新连接
  // 但连接成功的通知会显示旧的theme
}
```

ESLint警告：
```
React Hook useEffect has a missing dependency: 'theme'. 
Either include it or remove the dependency array.
```

添加theme到依赖的问题：
```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    
    return () => connection.disconnect();
  }, [roomId, theme]); // 添加了theme
  
  // 新问题：theme变化会导致重新连接
  // 但我们只想在roomId变化时重新连接
  // theme只用于显示通知，不应该触发重连
}
```

问题分析：
```
困境：
1. 不添加theme到依赖
   - ESLint警告
   - 可能使用过期值（闭包陷阱）
   - 难以维护

2. 添加theme到依赖
   - 不必要的重新连接
   - 性能问题
   - 用户体验差（频繁断开重连）

需要：一种方式让Effect访问最新值，但不成为响应式依赖
```

### 1.2 传统解决方案的局限

方案1：使用ref（不推荐）
```jsx
function ChatRoom({ roomId, theme }) {
  const themeRef = useRef(theme);
  
  // 每次渲染更新ref
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      // 从ref读取最新值
      showNotification('Connected!', themeRef.current);
    });
    
    return () => connection.disconnect();
  }, [roomId]); // 只依赖roomId
}

// 问题：
// 1. 需要额外的useEffect同步ref
// 2. 代码复杂，难以理解
// 3. 容易出错
// 4. 不符合React的声明式理念
```

方案2：使用useCallback（不推荐）
```jsx
function ChatRoom({ roomId, theme }) {
  const showConnectedNotification = useCallback(() => {
    showNotification('Connected!', theme);
  }, [theme]); // theme变化会创建新函数
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', showConnectedNotification);
    
    return () => connection.disconnect();
  }, [roomId, showConnectedNotification]); // 必须依赖函数
  
  // 问题：
  // theme变化 → 新函数 → Effect重新运行 → 重新连接
  // 还是没解决问题
}
```

方案3：忽略ESLint警告（非常不推荐）
```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    
    return () => connection.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // 忽略theme的警告
  
  // 问题：
  // 1. 可能使用过期的theme值
  // 2. 隐藏潜在bug
  // 3. 难以维护
  // 4. 团队协作问题
}
```

### 1.3 useEffectEvent的解决方案

React团队设计的优雅解决方案：
```jsx
import { useEffect, useEffectEvent } from 'react';

function ChatRoom({ roomId, theme }) {
  // 创建Effect Event
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      onConnected(); // 调用Effect Event
    });
    
    return () => connection.disconnect();
  }, [roomId]); // 只依赖roomId，不需要包含onConnected
  
  // 效果：
  // theme变化不会重新连接
  // 总是使用最新的theme值
  // 无ESLint警告
  // 代码清晰易懂
}
```

工作原理：
```
useEffectEvent创建的函数：
1. 总是访问最新的props/state
2. 不是响应式的（不触发Effect重新运行）
3. 只能在Effect内部调用
4. 类似于事件处理器，但在Effect中使用

对比：
- useCallback：响应式，依赖变化会创建新函数
- useEffectEvent：非响应式，总是最新但不触发更新
```

## 第二部分：基本用法

### 2.1 基础语法

useEffectEvent的基本使用模式：
```jsx
import { useEffect, useEffectEvent } from 'react';

function Component({ reactiveValue, nonReactiveValue }) {
  // 1. 使用useEffectEvent包装非响应式逻辑
  const handleEvent = useEffectEvent(() => {
    // 可以访问最新的nonReactiveValue
    console.log('Latest value:', nonReactiveValue);
  });
  
  // 2. 在useEffect中调用
  useEffect(() => {
    // 响应式逻辑
    const subscription = subscribe(reactiveValue);
    
    subscription.on('event', () => {
      handleEvent(); // 调用Effect Event
    });
    
    return () => subscription.unsubscribe();
  }, [reactiveValue]); // 只依赖响应式值
}
```

完整示例：
```jsx
function PageView({ url, referrer }) {
  // referrer用于分析，但不应该触发重新记录
  const logVisit = useEffectEvent(() => {
    analytics.logVisit(url, referrer);
  });
  
  useEffect(() => {
    // url变化时记录访问
    logVisit();
  }, [url]); // 只依赖url
  
  return <Page url={url} />;
}

// 效果：
// - url变化：记录新的访问（使用最新的referrer）
// - referrer变化：不记录访问（因为url没变）
```

### 2.2 访问最新state

useEffectEvent总是访问最新的state值：
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [intervalDelay, setIntervalDelay] = useState(1000);
  
  // 增量逻辑访问最新count
  const onTick = useEffectEvent(() => {
    setCount(count + 1);
  });
  
  useEffect(() => {
    const id = setInterval(() => {
      onTick(); // 总是使用最新的count
    }, intervalDelay);
    
    return () => clearInterval(id);
  }, [intervalDelay]); // 只在delay变化时重置定时器
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(0)}>Reset</button>
      <select value={intervalDelay} onChange={e => setIntervalDelay(Number(e.target.value))}>
        <option value={100}>Fast (100ms)</option>
        <option value={1000}>Normal (1s)</option>
        <option value={5000}>Slow (5s)</option>
      </select>
    </div>
  );
}

// 对比useCallback的问题：
function CounterWithCallback() {
  const [count, setCount] = useState(0);
  const [intervalDelay, setIntervalDelay] = useState(1000);
  
  const onTick = useCallback(() => {
    setCount(count + 1); // 闭包陷阱！count永远是初始值
  }, []); // 空依赖导致闭包问题
  
  // 或者
  const onTick = useCallback(() => {
    setCount(count + 1);
  }, [count]); // count变化会创建新函数，导致重置定时器
  
  useEffect(() => {
    const id = setInterval(onTick, intervalDelay);
    return () => clearInterval(id);
  }, [intervalDelay, onTick]); // 必须依赖onTick
}
```

### 2.3 访问最新props

useEffectEvent访问最新props：
```jsx
function ChatRoom({ roomId, onReceiveMessage }) {
  // onReceiveMessage可能每次渲染都不同
  const onMessage = useEffectEvent((receivedMessage) => {
    onReceiveMessage(receivedMessage);
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('message', (msg) => {
      onMessage(msg); // 调用最新的onReceiveMessage
    });
    
    return () => connection.disconnect();
  }, [roomId]); // 不需要包含onReceiveMessage
  
  return <div>Chat Room: {roomId}</div>;
}

// 使用示例
function App() {
  const [notifications, setNotifications] = useState([]);
  
  return (
    <ChatRoom
      roomId="general"
      onReceiveMessage={(msg) => {
        // 这个函数每次渲染都不同
        setNotifications(prev => [...prev, msg]);
        showToast(msg);
      }}
    />
  );
}
```

## 第三部分：与其他Hooks对比

### 3.1 useEffectEvent vs useCallback

两者的本质区别：
```jsx
// useCallback：响应式函数
function WithUseCallback({ count, onUpdate }) {
  const handleClick = useCallback(() => {
    onUpdate(count);
  }, [count, onUpdate]); // 依赖变化会创建新函数
  
  useEffect(() => {
    button.addEventListener('click', handleClick);
    return () => button.removeEventListener('click', handleClick);
  }, [handleClick]); // 必须包含handleClick
  
  // 问题：count或onUpdate变化 → 新函数 → Effect重新运行
}

// useEffectEvent：非响应式函数
function WithUseEffectEvent({ count, onUpdate }) {
  const handleClick = useEffectEvent(() => {
    onUpdate(count); // 总是最新值
  });
  
  useEffect(() => {
    button.addEventListener('click', handleClick);
    return () => button.removeEventListener('click', handleClick);
  }, []); // 不需要依赖
  
  // 效果：count或onUpdate变化 → 不重新绑定事件
}
```

使用场景对比表：
```
useCallback适用于：
- 传递给子组件的回调（避免子组件重新渲染）
- 依赖于props/state的事件处理器
- 需要在多处使用的函数
- 需要响应式行为的回调

useEffectEvent适用于：
- Effect中调用的非响应式逻辑
- 日志和分析（不应触发Effect重新运行）
- 外部系统回调（WebSocket、定时器等）
- 访问最新值但不想触发Effect的场景
```

### 3.2 useEffectEvent vs useRef

对比ref模式：
```jsx
// 使用ref（旧方案）
function WithRef({ value, onUpdate }) {
  const onUpdateRef = useRef(onUpdate);
  
  // 同步ref
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      onUpdateRef.current(value);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [value]);
  
  // 问题：
  // 1. 需要额外的Effect同步ref
  // 2. 两个useEffect，逻辑分散
  // 3. 不够直观
}

// 使用useEffectEvent（新方案）
function WithEffectEvent({ value, onUpdate }) {
  const update = useEffectEvent(() => {
    onUpdate(value);
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      update();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [value]);
  
  // 优势：
  // 1. 一个Effect，逻辑集中
  // 2. 不需要同步ref
  // 3. 更清晰易懂
}
```

## 第四部分：典型使用场景

### 4.1 数据分析和日志

记录用户行为，但不想频繁触发Effect：
```jsx
function ProductPage({ productId, user, analytics }) {
  // analytics配置可能频繁变化，但不应触发重新记录
  const logView = useEffectEvent(() => {
    analytics.logProductView({
      productId,
      userId: user.id,
      timestamp: Date.now(),
      referrer: document.referrer
    });
  });
  
  useEffect(() => {
    // 只在productId变化时记录
    logView();
  }, [productId]);
  
  return <ProductDetails productId={productId} />;
}
```

复杂分析场景：
```jsx
function AnalyticsTracker({ 
  eventName, 
  eventData, 
  userId, 
  sessionId,
  metadata 
}) {
  // metadata可能包含频繁变化的数据（如timestamp）
  const trackEvent = useEffectEvent(() => {
    analytics.track(eventName, {
      ...eventData,
      userId,
      sessionId,
      metadata,
      clientTime: Date.now(),
      userAgent: navigator.userAgent
    });
  });
  
  useEffect(() => {
    // 只在事件名称或核心数据变化时记录
    trackEvent();
  }, [eventName, eventData]);
  
  return null;
}
```

### 4.2 动画和视觉效果

控制动画而不重新触发：
```jsx
function FadeInComponent({ content, duration, playSound }) {
  const ref = useRef(null);
  
  // duration用于动画，但不应该在duration变化时重新触发动画
  const onAppear = useEffectEvent((animation) => {
    animation.start(duration);
    if (playSound) {
      audio.play();
    }
  });
  
  useEffect(() => {
    const animation = new FadeInAnimation(ref.current);
    onAppear(animation);
    
    return () => animation.stop();
  }, []); // 只在mount时触发动画
  
  return (
    <div ref={ref}>
      {content}
    </div>
  );
}
```

滚动动画：
```jsx
function InfiniteScroll({ items, threshold, onLoadMore, pageSize }) {
  const containerRef = useRef(null);
  
  // pageSize变化不应重新绑定滚动监听
  const loadNext = useEffectEvent(() => {
    onLoadMore(pageSize);
  });
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadNext();
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [threshold]); // 只在threshold变化时重新绑定
  
  return (
    <div ref={containerRef} style={{ height: '400px', overflow: 'auto' }}>
      {items.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}
```

### 4.3 外部系统集成

集成WebSocket、定时器等外部系统：
```jsx
function RealtimeData({ endpoint, onDataReceived, reconnectInterval }) {
  // onDataReceived可能频繁变化（如包含state更新函数）
  const handleData = useEffectEvent((data) => {
    onDataReceived({
      ...data,
      receivedAt: Date.now()
    });
  });
  
  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    
    const connect = () => {
      ws = new WebSocket(endpoint);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleData(data); // 使用最新的处理函数
      };
      
      ws.onerror = () => {
        console.error('WebSocket error');
      };
      
      ws.onclose = () => {
        // 自动重连
        reconnectTimer = setTimeout(connect, reconnectInterval);
      };
    };
    
    connect();
    
    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [endpoint, reconnectInterval]); // 不包含onDataReceived
  
  return null;
}
```

### 4.4 表单和用户输入

处理表单状态，避免不必要的Effect触发：
```jsx
function SearchWithDebounce({ query, onSearch, debounceDelay, filters }) {
  // filters可能频繁变化，但不应影响debounce
  const performSearch = useEffectEvent(() => {
    onSearch(query, filters);
  });
  
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, debounceDelay);
    
    return () => clearTimeout(timer);
  }, [query, debounceDelay]); // 不包含filters
  
  return null;
}
```

## 第五部分：自定义Hooks集成

### 5.1 在自定义Hook中使用

构建可复用的自定义Hook：
```jsx
function useChatRoom({ serverUrl, roomId, onReceiveMessage }) {
  // onReceiveMessage是非响应式的
  const onMessage = useEffectEvent(onReceiveMessage);
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('message', (msg) => {
      onMessage(msg);
    });
    
    return () => connection.disconnect();
  }, [roomId, serverUrl]); // 不包含onReceiveMessage
}

// 使用自定义Hook
function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useChatRoom({
    serverUrl: 'wss://chat.example.com',
    roomId: 'general',
    onReceiveMessage: (msg) => {
      // 这个函数每次渲染都不同
      setMessages(prev => [...prev, msg]);
      setUnreadCount(prev => prev + 1);
      document.title = `(${unreadCount + 1}) New Messages`;
    }
  });
  
  return (
    <div>
      <MessageList messages={messages} />
    </div>
  );
}
```

复杂自定义Hook：
```jsx
function useDataSync({ 
  source, 
  onUpdate, 
  onError,
  pollInterval,
  retryAttempts 
}) {
  // 回调函数都是非响应式的
  const handleUpdate = useEffectEvent(onUpdate);
  const handleError = useEffectEvent(onError);
  
  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    
    const fetchData = async () => {
      try {
        const data = await fetch(source).then(r => r.json());
        
        if (!cancelled) {
          handleUpdate(data);
          retries = 0; // 重置重试次数
        }
      } catch (error) {
        if (!cancelled && retries < retryAttempts) {
          retries++;
          handleError(error, retries);
          
          // 指数退避重试
          setTimeout(fetchData, Math.pow(2, retries) * 1000);
        }
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [source, pollInterval, retryAttempts]);
}
```

## 第六部分：实战案例

### 6.1 实时聊天应用

构建聊天室功能：
```jsx
function ChatRoom({ 
  roomId, 
  currentUser,
  theme,
  soundEnabled,
  onMessageReceived,
  onUserJoined,
  onUserLeft 
}) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // 所有回调都是非响应式的
  const handleMessage = useEffectEvent((msg) => {
    setMessages(prev => [...prev, msg]);
    onMessageReceived(msg);
    
    if (soundEnabled && msg.senderId !== currentUser.id) {
      playMessageSound();
    }
    
    if (theme === 'dark') {
      showDarkModeNotification(msg);
    } else {
      showLightModeNotification(msg);
    }
  });
  
  const handleUserJoined = useEffectEvent((user) => {
    setOnlineUsers(prev => [...prev, user]);
    onUserJoined(user);
    
    if (soundEnabled) {
      playJoinSound();
    }
  });
  
  const handleUserLeft = useEffectEvent((userId) => {
    setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    onUserLeft(userId);
  });
  
  useEffect(() => {
    const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);
    
    ws.onopen = () => {
      console.log(`Connected to room: ${roomId}`);
      ws.send(JSON.stringify({
        type: 'join',
        userId: currentUser.id,
        username: currentUser.name
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          handleMessage(data);
          break;
        case 'user_joined':
          handleUserJoined(data.user);
          break;
        case 'user_left':
          handleUserLeft(data.userId);
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log(`Disconnected from room: ${roomId}`);
    };
    
    return () => {
      ws.close();
    };
  }, [roomId, currentUser.id, currentUser.name]); // 只依赖连接相关的值
  
  return (
    <div className={`chat-room theme-${theme}`}>
      <UserList users={onlineUsers} />
      <MessageList messages={messages} />
      <MessageInput roomId={roomId} />
    </div>
  );
}
```

### 6.2 游戏逻辑

游戏中的事件处理：
```jsx
function Game({ difficulty, soundEnabled, onScoreUpdate, onGameOver }) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('playing');
  
  // 游戏事件是非响应式的
  const handleScoreChange = useEffectEvent((points) => {
    const newScore = score + points;
    setScore(newScore);
    onScoreUpdate(newScore);
    
    if (soundEnabled) {
      playScoreSound(points);
    }
    
    // 检查升级
    if (newScore >= level * 100) {
      setLevel(prev => prev + 1);
    }
  });
  
  const handleGameEnd = useEffectEvent((reason) => {
    setGameState('over');
    onGameOver({
      score,
      level,
      reason,
      difficulty
    });
    
    if (soundEnabled) {
      playGameOverSound();
    }
  });
  
  useEffect(() => {
    // 游戏循环
    const gameLoop = setInterval(() => {
      if (gameState !== 'playing') return;
      
      // 游戏逻辑
      const event = generateGameEvent();
      
      if (event.type === 'score') {
        handleScoreChange(event.points);
      } else if (event.type === 'game_over') {
        handleGameEnd(event.reason);
      }
    }, 1000 / (30 + difficulty * 10)); // FPS根据难度调整
    
    return () => clearInterval(gameLoop);
  }, [difficulty, gameState]); // 不包含score、soundEnabled等
  
  return (
    <div className="game">
      <div className="score">Score: {score}</div>
      <div className="level">Level: {level}</div>
      <GameCanvas />
    </div>
  );
}
```

## 第七部分：注意事项和限制

### 7.1 使用规则

useEffectEvent的使用规则：
```jsx
// 正确：在Effect内部调用
function Correct({ value }) {
  const handleEvent = useEffectEvent(() => {
    console.log(value);
  });
  
  useEffect(() => {
    handleEvent(); // 在Effect内调用
  }, []);
}

// 错误：在事件处理器中调用
function Wrong({ value }) {
  const handleEvent = useEffectEvent(() => {
    console.log(value);
  });
  
  return (
    <button onClick={() => handleEvent()}>
      {/* 不能在事件处理器中调用 */}
    </button>
  );
}

// 错误：作为依赖传递
function Wrong({ value }) {
  const handleEvent = useEffectEvent(() => {
    console.log(value);
  });
  
  useEffect(() => {
    // ...
  }, [handleEvent]); // 不能作为依赖
}

// 错误：传递给其他组件
function Wrong({ value }) {
  const handleEvent = useEffectEvent(() => {
    console.log(value);
  });
  
  return (
    <ChildComponent onEvent={handleEvent} />
    {/* 不能传递给其他组件 */}
  );
}
```

正确的调用位置：
```jsx
function CorrectUsage() {
  const event1 = useEffectEvent(() => {});
  const event2 = useEffectEvent(() => {});
  
  useEffect(() => {
    event1(); // 直接在Effect中调用
    
    const handler = () => {
      event2(); // 在Effect的回调中调用
    };
    
    element.addEventListener('click', handler);
    return () => element.removeEventListener('click', handler);
  }, []);
  
  useLayoutEffect(() => {
    event1(); // 在useLayoutEffect中调用
  }, []);
  
  useInsertionEffect(() => {
    event1(); // 在useInsertionEffect中调用
  }, []);
}
```

### 7.2 实验性状态

useEffectEvent目前是实验性API：
```
当前状态（2025）：
- 在React Canary版本中可用
- 在稳定版中需要手动polyfill
- API可能会变化
- 不建议在生产环境使用

未来计划：
- 预计在React 19正式版或后续版本中稳定
- API可能有微调
- 更多优化和改进

使用建议：
1. 实验性项目可以尝试
2. 生产环境谨慎使用
3. 关注React官方更新
4. 准备好适配API变化
```

Polyfill实现：
```jsx
// 简单的polyfill（仅用于理解，不要在生产环境使用）
function useEffectEvent(handler) {
  const handlerRef = useRef(null);
  
  // 同步最新handler到ref
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });
  
  // 返回稳定的函数引用
  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}

// 注意：这只是简化版本
// 真实实现更复杂，包含：
// - 开发模式检查
// - 错误处理
// - 性能优化
// - 内存管理
```

## 第八部分：性能优化

### 8.1 减少Effect重新运行

性能对比：
```jsx
// 不使用useEffectEvent：频繁重连
function Inefficient({ roomId, notificationCount }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('message', (msg) => {
      // 使用notificationCount
      showBadge(notificationCount + 1);
    });
    
    return () => connection.disconnect();
  }, [roomId, notificationCount]); // notificationCount频繁变化
  
  // 性能问题：
  // - notificationCount每次消息都变化
  // - 导致频繁断开重连
  // - 用户体验差
}

// 使用useEffectEvent：稳定连接
function Efficient({ roomId, notificationCount }) {
  const updateBadge = useEffectEvent(() => {
    showBadge(notificationCount + 1);
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('message', (msg) => {
      updateBadge(); // 使用最新notificationCount，但不触发重连
    });
    
    return () => connection.disconnect();
  }, [roomId]); // 只在roomId变化时重连
  
  // 优化效果：
  // - 连接稳定
  // - 总是使用最新值
  // - 性能好
}
```

## 第九部分：迁移指南

### 9.1 从useRef迁移

迁移步骤：
```jsx
// 之前：使用ref
function Before({ callback }) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      callbackRef.current();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
}

// 之后：使用useEffectEvent
function After({ callback }) {
  const handleTick = useEffectEvent(() => {
    callback();
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      handleTick();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
}

// 改进：
// - 删除同步ref的useEffect
// - 代码更简洁
// - 语义更清晰
```

## 第十部分：测试策略

### 10.1 单元测试

测试使用useEffectEvent的组件：
```jsx
import { renderHook, waitFor } from '@testing-library/react';

describe('useEffectEvent', () => {
  test('calls handler with latest props', async () => {
    const onUpdate = jest.fn();
    let count = 0;
    
    const { rerender } = renderHook(
      ({ value }) => {
        const update = useEffectEvent(() => {
          onUpdate(value);
        });
        
        useEffect(() => {
          const timer = setTimeout(update, 100);
          return () => clearTimeout(timer);
        }, []);
      },
      { initialProps: { value: count } }
    );
    
    // 等待Effect执行
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(0);
    });
    
    // 更新props
    count = 1;
    rerender({ value: count });
    
    // Effect不会重新运行，但会使用新值
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 应该还是只调用一次（Effect没重新运行）
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
```

## 常见问题

### Q1: useEffectEvent什么时候稳定？

A: 目前是实验性API，预计在未来版本中稳定。

当前状态：
```
- React 18.x：不可用
- React 19 Canary：可用（实验性）
- React 19 Stable：待定

建议：
1. 学习概念和用法
2. 在实验项目中尝试
3. 关注React官方博客
4. 生产环境使用ref方案
```

### Q2: useEffectEvent能否在普通函数中调用？

A: 不能，只能在Effect中调用。

### Q3: useEffectEvent和闭包陷阱

A: useEffectEvent专门用来避免闭包陷阱。

```jsx
// 闭包陷阱示例
function ClosureProblem() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 永远是0（闭包）
      setCount(count + 1); // 永远设置为1
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 空依赖导致闭包
}

// useEffectEvent解决方案
function NoClosureProblem() {
  const [count, setCount] = useState(0);
  
  const increment = useEffectEvent(() => {
    console.log(count); // 总是最新值
    setCount(count + 1); // 正确递增
  });
  
  useEffect(() => {
    const timer = setInterval(increment, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖，但无闭包问题
}
```

### Q4: useEffectEvent能否替代所有useCallback？

A: 不能，它们的用途不同。

对比和选择：
```jsx
// useCallback：用于组件间传递
function UseCallbackScenario() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return (
    <ExpensiveChild onClick={handleClick} />
  );
}

// useEffectEvent：用于Effect内部
function UseEffectEventScenario({ value }) {
  const logValue = useEffectEvent(() => {
    console.log('value:', value);
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      logValue(); // 在Effect中调用
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
}

// 选择指南：
// - 传递给子组件：useCallback
// - 在Effect中调用：useEffectEvent
// - 既传递又在Effect用：两者都需要
```

## 总结

useEffectEvent实验性Hook的核心价值：

设计目标：
```
解决的问题：
1. Effect依赖困境
   - 添加依赖：不必要的重新运行
   - 不添加依赖：闭包陷阱
   
2. 非响应式值访问
   - 需要最新值
   - 但不想触发Effect
   
3. 代码可读性
   - 清晰表达意图
   - 减少hack和workaround
```

核心特性：
```
1. 非响应式
- 不在依赖数组中
- 不触发Effect重新运行
- 总是访问最新值

2. 作用域限制
- 只能在Effect中调用
- 不能传递给其他组件
- 不能作为依赖

3. 性能优化
- 减少Effect运行
- 避免不必要的订阅/取消
- 更好的用户体验
```

使用场景：
```
适合使用：
1. 日志和分析
2. 外部系统集成（WebSocket、定时器）
3. 动画和视觉效果
4. 性能监控
5. 非关键的回调

不适合使用：
1. 传递给子组件的回调（用useCallback）
2. 事件处理器（直接定义）
3. 需要响应式的逻辑
```

最佳实践：
```
1. 明确区分响应式和非响应式值
2. 只在Effect中调用
3. 合理命名（表达非响应式意图）
4. 谨慎使用（实验性API）
5. 做好迁移准备
6. 完善的测试覆盖
7. 性能监控
8. 文档记录使用原因
```

useEffectEvent是React团队对Effect依赖问题的优雅解决方案，虽然目前是实验性的，但展示了React未来的发展方向！

