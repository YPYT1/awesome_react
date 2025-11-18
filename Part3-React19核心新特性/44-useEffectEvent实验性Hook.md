# useEffectEvent实验性Hook

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
   → ESLint警告
   → 可能使用过期值（闭包陷阱）
   → 难以维护

2. 添加theme到依赖
   → 不必要的重新连接
   → 性能问题
   → 用户体验差（频繁断开重连）

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
  // ✅ theme变化不会重新连接
  // ✅ 总是使用最新的theme值
  // ✅ 无ESLint警告
  // ✅ 代码清晰易懂
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

## 第三部分：典型使用场景

### 3.1 数据分析和日志

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

// 使用
function App() {
  const [pageViews, setPageViews] = useState(0);
  const [currentPage, setCurrentPage] = useState('/home');
  
  return (
    <>
      <AnalyticsTracker
        eventName="page_view"
        eventData={{ page: currentPage }}
        userId="user123"
        sessionId="session456"
        metadata={{ 
          pageViews, // 频繁变化，但不应触发重新记录
          timestamp: Date.now() 
        }}
      />
      
      <Navigation onNavigate={setCurrentPage} />
    </>
  );
}
```

### 3.2 动画和视觉效果

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

// 使用
function App() {
  const [duration, setDuration] = useState(1000);
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <label>
        Animation duration: {duration}ms
        <input 
          type="range" 
          min="100" 
          max="3000" 
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />
      </label>
      
      <button onClick={() => setShow(!show)}>
        Toggle
      </button>
      
      {show && (
        <FadeInComponent 
          content="Hello World"
          duration={duration}
          playSound={true}
        />
      )}
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

### 3.3 外部系统集成

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

// 使用
function Dashboard() {
  const [data, setData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  return (
    <RealtimeData
      endpoint="wss://api.example.com/data"
      reconnectInterval={3000}
      onDataReceived={(newData) => {
        // 这个函数每次渲染都不同（因为访问了state）
        setData(prev => [...prev, newData]);
        setNotifications(prev => [...prev, `Received: ${newData.type}`]);
      }}
    />
  );
}
```

定时器场景：
```jsx
function AutoSave({ data, saveInterval, onSave }) {
  // onSave可能包含最新的认证token等信息
  const performSave = useEffectEvent(async () => {
    try {
      await onSave(data);
      console.log('Auto-saved successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  });
  
  useEffect(() => {
    const id = setInterval(() => {
      performSave();
    }, saveInterval);
    
    return () => clearInterval(id);
  }, [saveInterval]); // 只在interval变化时重置定时器
  
  return null;
}
```

### 3.4 表单和用户输入

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

// 使用
function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'relevance',
    priceRange: [0, 1000]
  });
  const [results, setResults] = useState([]);
  
  const handleSearch = async (searchQuery, searchFilters) => {
    const data = await api.search(searchQuery, searchFilters);
    setResults(data);
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      
      <FilterPanel filters={filters} onChange={setFilters} />
      
      <SearchWithDebounce
        query={query}
        onSearch={handleSearch}
        debounceDelay={300}
        filters={filters}
      />
      
      <ResultsList results={results} />
    </div>
  );
}
```

## 第四部分：高级模式

### 4.1 结合自定义Hook

在自定义Hook中使用useEffectEvent：
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

// 使用
function Dashboard() {
  const [data, setData] = useState(null);
  const [errorLog, setErrorLog] = useState([]);
  
  useDataSync({
    source: '/api/dashboard',
    pollInterval: 5000,
    retryAttempts: 3,
    onUpdate: (newData) => {
      setData(newData);
      console.log('Data updated:', newData);
    },
    onError: (error, attempt) => {
      setErrorLog(prev => [...prev, { error, attempt, time: Date.now() }]);
      console.error(`Fetch failed (attempt ${attempt}):`, error);
    }
  });
  
  return (
    <div>
      {data ? <DataDisplay data={data} /> : <Loading />}
      {errorLog.length > 0 && <ErrorLog errors={errorLog} />}
    </div>
  );
}
```

### 4.2 条件逻辑

useEffectEvent中的条件逻辑：
```jsx
function NotificationManager({ 
  message, 
  shouldNotify, 
  soundEnabled,
  vibrationEnabled 
}) {
  // 通知配置是非响应式的
  const notify = useEffectEvent(() => {
    if (shouldNotify) {
      showNotification(message);
      
      if (soundEnabled) {
        playNotificationSound();
      }
      
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  });
  
  useEffect(() => {
    // 只在message变化时通知
    notify();
  }, [message]);
  
  return null;
}
```

复杂条件：
```jsx
function ConditionalSync({ 
  userId, 
  syncEnabled,
  syncInterval,
  filters,
  onSyncSuccess,
  onSyncFailure 
}) {
  const performSync = useEffectEvent(async () => {
    if (!syncEnabled) {
      console.log('Sync disabled, skipping');
      return;
    }
    
    try {
      const data = await syncUserData(userId, filters);
      onSyncSuccess(data);
    } catch (error) {
      onSyncFailure(error);
    }
  });
  
  useEffect(() => {
    if (!syncEnabled) {
      return; // 完全跳过Effect
    }
    
    performSync(); // 立即同步一次
    
    const interval = setInterval(() => {
      performSync();
    }, syncInterval);
    
    return () => clearInterval(interval);
  }, [userId, syncEnabled, syncInterval]); // 不包含filters和回调
  
  return null;
}
```

### 4.3 错误处理

Effect中的错误处理：
```jsx
function DataFetcher({ url, onSuccess, onError, retryConfig }) {
  const handleSuccess = useEffectEvent(onSuccess);
  const handleError = useEffectEvent(onError);
  
  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    
    const fetchWithRetry = async () => {
      try {
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!cancelled) {
          handleSuccess(data);
        }
      } catch (error) {
        if (cancelled) return;
        
        if (retryCount < retryConfig.maxRetries) {
          retryCount++;
          const delay = retryConfig.baseDelay * Math.pow(2, retryCount - 1);
          
          console.log(`Retrying in ${delay}ms (attempt ${retryCount})`);
          setTimeout(fetchWithRetry, delay);
        } else {
          handleError({
            message: error.message,
            attempts: retryCount,
            url
          });
        }
      }
    };
    
    fetchWithRetry();
    
    return () => {
      cancelled = true;
    };
  }, [url]); // retryConfig是非响应式的
  
  return null;
}

// 使用
function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  return (
    <DataFetcher
      url="/api/data"
      retryConfig={{
        maxRetries: 3,
        baseDelay: 1000
      }}
      onSuccess={(data) => {
        setData(data);
        setError(null);
      }}
      onError={(errorInfo) => {
        setError(errorInfo);
        console.error('Failed after retries:', errorInfo);
      }}
    />
  );
}
```

## 第五部分：对比其他方案

### 5.1 useEffectEvent vs useCallback

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

使用场景对比：
```jsx
// useCallback适用于：
// 1. 传递给子组件的回调
function ParentWithCallback() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 避免子组件重新渲染
  
  return <ChildComponent onClick={handleClick} />;
}

// useEffectEvent适用于：
// 2. Effect中调用的非响应式逻辑
function ParentWithEffectEvent({ userId }) {
  const [count, setCount] = useState(0);
  
  const logActivity = useEffectEvent(() => {
    analytics.log('user_activity', { userId, count });
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      logActivity(); // 不想因为count变化而重置定时器
    }, 60000);
    
    return () => clearInterval(timer);
  }, [userId]); // 只依赖userId
}
```

### 5.2 useEffectEvent vs useRef

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

### 5.3 useEffectEvent vs 拆分Effect

对比拆分Effect的方案：
```jsx
// 拆分Effect（不推荐）
function WithSplitEffects({ roomId, theme, soundEnabled }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
  
  useEffect(() => {
    // 尝试在另一个Effect中处理通知
    // 但无法知道连接何时建立
    // 逻辑分离，难以维护
  }, [theme, soundEnabled]);
  
  // 问题：
  // 1. 无法协调两个Effect
  // 2. 逻辑分散
  // 3. 时序问题
}

// 使用useEffectEvent（推荐）
function WithEffectEvent({ roomId, theme, soundEnabled }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
    if (soundEnabled) {
      playSound();
    }
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      onConnected(); // 逻辑集中，时序明确
    });
    
    return () => connection.disconnect();
  }, [roomId]);
  
  // 优势：
  // 1. 逻辑在一个Effect中
  // 2. 时序清晰
  // 3. 易于理解和维护
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

### 6.3 数据可视化

图表更新和交互：
```jsx
function InteractiveChart({ 
  data, 
  options,
  onDataPointClick,
  onZoomChange,
  theme 
}) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  // 交互回调是非响应式的
  const handlePointClick = useEffectEvent((point) => {
    onDataPointClick({
      ...point,
      theme, // 使用当前theme
      timestamp: Date.now()
    });
  });
  
  const handleZoom = useEffectEvent((zoomLevel) => {
    onZoomChange(zoomLevel);
  });
  
  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = createChart(chartRef.current, {
      ...options,
      onClick: (point) => {
        handlePointClick(point);
      },
      onZoom: (level) => {
        handleZoom(level);
      }
    });
    
    chartInstanceRef.current = chart;
    
    return () => {
      chart.destroy();
    };
  }, [options]); // 不包含回调函数
  
  // 更新数据
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.updateData(data);
    }
  }, [data]);
  
  // 更新主题
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setTheme(theme);
    }
  }, [theme]);
  
  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
}
```

## 第七部分：注意事项和限制

### 7.1 使用规则

useEffectEvent的使用规则：
```jsx
// ✅ 正确：在Effect内部调用
function Correct({ value }) {
  const handleEvent = useEffectEvent(() => {
    console.log(value);
  });
  
  useEffect(() => {
    handleEvent(); // 在Effect内调用
  }, []);
}

// ❌ 错误：在事件处理器中调用
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

// ❌ 错误：作为依赖传递
function Wrong({ value }) {
  const handleEvent = useEffectEvent(() => {
    console.log(value);
  });
  
  useEffect(() => {
    // ...
  }, [handleEvent]); // 不能作为依赖
}

// ❌ 错误：传递给其他组件
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
    event1(); // ✅ 直接在Effect中调用
    
    const handler = () => {
      event2(); // ✅ 在Effect的回调中调用
    };
    
    element.addEventListener('click', handler);
    return () => element.removeEventListener('click', handler);
  }, []);
  
  useLayoutEffect(() => {
    event1(); // ✅ 在useLayoutEffect中调用
  }, []);
  
  useInsertionEffect(() => {
    event1(); // ✅ 在useInsertionEffect中调用
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

### 7.3 调试技巧

调试useEffectEvent：
```jsx
function DebuggableComponent({ value, onChange }) {
  const handleChange = useEffectEvent((newValue) => {
    console.log('useEffectEvent called:', {
      oldValue: value,
      newValue,
      timestamp: Date.now()
    });
    onChange(newValue);
  });
  
  useEffect(() => {
    console.log('Effect running with value:', value);
    
    const subscription = subscribe((data) => {
      console.log('Subscription callback with data:', data);
      handleChange(data);
    });
    
    return () => {
      console.log('Effect cleanup');
      subscription.unsubscribe();
    };
  }, [value]);
  
  return <div>Value: {value}</div>;
}

// 输出分析：
// 1. value变化时：
//    - "Effect cleanup"
//    - "Effect running with value: new value"
//
// 2. onChange变化时：
//    - 无输出（不触发Effect）
//    - 但handleChange会使用新的onChange
```

性能分析：
```jsx
import { Profiler } from 'react';

function ProfiledComponent() {
  const onRender = (id, phase, actualDuration) => {
    console.log(`${id} ${phase}:`, actualDuration);
  };
  
  return (
    <Profiler id="EffectEventTest" onRender={onRender}>
      <ComponentWithEffectEvent />
    </Profiler>
  );
}
```

## 第八部分：迁移指南

### 8.1 从useRef迁移

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

批量迁移：
```jsx
// 迁移前
function OldComponent({ value1, value2, callback1, callback2 }) {
  const callback1Ref = useRef(callback1);
  const callback2Ref = useRef(callback2);
  
  useEffect(() => {
    callback1Ref.current = callback1;
  }, [callback1]);
  
  useEffect(() => {
    callback2Ref.current = callback2;
  }, [callback2]);
  
  useEffect(() => {
    const sub = subscribe(value1, value2, {
      onUpdate: (data) => callback1Ref.current(data),
      onError: (error) => callback2Ref.current(error)
    });
    
    return () => sub.unsubscribe();
  }, [value1, value2]);
}

// 迁移后
function NewComponent({ value1, value2, callback1, callback2 }) {
  const handleUpdate = useEffectEvent((data) => {
    callback1(data);
  });
  
  const handleError = useEffectEvent((error) => {
    callback2(error);
  });
  
  useEffect(() => {
    const sub = subscribe(value1, value2, {
      onUpdate: handleUpdate,
      onError: handleError
    });
    
    return () => sub.unsubscribe();
  }, [value1, value2]);
}

// 改进：
// - 从5个Hook减少到3个
// - 逻辑更集中
// - 性能更好
```

### 8.2 从useCallback迁移

识别可以迁移的场景：
```jsx
// 场景1：回调只在Effect中使用
// 之前
function Before({ value, onUpdate }) {
  const handleUpdate = useCallback(() => {
    onUpdate(value);
  }, [value, onUpdate]);
  
  useEffect(() => {
    const timer = setInterval(handleUpdate, 1000);
    return () => clearInterval(timer);
  }, [handleUpdate]);
}

// 之后
function After({ value, onUpdate }) {
  const handleUpdate = useEffectEvent(() => {
    onUpdate(value);
  });
  
  useEffect(() => {
    const timer = setInterval(handleUpdate, 1000);
    return () => clearInterval(timer);
  }, []);
}

// 场景2：回调传递给子组件（保持useCallback）
function KeepCallback({ onUpdate }) {
  const handleUpdate = useCallback(() => {
    onUpdate();
  }, [onUpdate]); // 保持useCallback
  
  return <ChildComponent onUpdate={handleUpdate} />;
}
```

### 8.3 重构复杂Effect

逐步重构策略：
```jsx
// 步骤1：识别非响应式逻辑
function Step1({ roomId, theme, soundEnabled, onMessage }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      showNotification('Connected!', theme); // 非响应式
    });
    
    connection.on('message', (msg) => {
      onMessage(msg); // 非响应式
      if (soundEnabled) { // 非响应式
        playSound();
      }
    });
    
    return () => connection.disconnect();
  }, [roomId, theme, soundEnabled, onMessage]); // 依赖太多
}

// 步骤2：提取Effect Events
function Step2({ roomId, theme, soundEnabled, onMessage }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });
  
  const onMessageReceived = useEffectEvent((msg) => {
    onMessage(msg);
    if (soundEnabled) {
      playSound();
    }
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    
    connection.on('connected', () => {
      onConnected();
    });
    
    connection.on('message', (msg) => {
      onMessageReceived(msg);
    });
    
    return () => connection.disconnect();
  }, [roomId]); // 依赖大幅减少
}

// 步骤3：进一步优化（可选）
function Step3({ roomId, theme, soundEnabled, onMessage }) {
  const handleConnectionEvents = useEffectEvent((connection) => {
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    
    connection.on('message', (msg) => {
      onMessage(msg);
      if (soundEnabled) {
        playSound();
      }
    });
  });
  
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    handleConnectionEvents(connection);
    
    return () => connection.disconnect();
  }, [roomId]);
}
```

## 第九部分：性能优化

### 9.1 减少Effect重新运行

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

性能测量：
```jsx
function PerformanceComparison() {
  const [reconnectCount, setReconnectCount] = useState(0);
  const reconnectCountRef = useRef(0);
  
  const trackReconnect = useEffectEvent(() => {
    reconnectCountRef.current++;
    setReconnectCount(reconnectCountRef.current);
  });
  
  useEffect(() => {
    trackReconnect(); // 记录每次Effect运行
    
    const connection = createConnection();
    connection.connect();
    
    return () => connection.disconnect();
  }, [/* 依赖 */]);
  
  return <div>Reconnections: {reconnectCount}</div>;
}
```

### 9.2 内存优化

避免内存泄漏：
```jsx
function MemoryEfficient({ items, onProcess }) {
  const processItems = useEffectEvent((itemList) => {
    // 处理大量数据
    const processed = itemList.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
    
    onProcess(processed);
  });
  
  useEffect(() => {
    // 防抖处理
    const timer = setTimeout(() => {
      processItems(items);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [items]); // items变化时重新处理
  
  // 优势：
  // - onProcess不在依赖中，避免闭包捕获大对象
  // - 定时器正确清理
  // - 内存使用优化
}
```

### 9.3 批量操作

批量更新优化：
```jsx
function BatchOperations({ operations, onComplete, onProgress }) {
  const reportProgress = useEffectEvent((completed, total) => {
    onProgress({
      completed,
      total,
      percentage: (completed / total * 100).toFixed(1)
    });
  });
  
  const reportComplete = useEffectEvent((results) => {
    onComplete({
      results,
      duration: Date.now() - startTime,
      successCount: results.filter(r => r.success).length
    });
  });
  
  useEffect(() => {
    let completed = 0;
    const total = operations.length;
    const results = [];
    const startTime = Date.now();
    
    const processNext = async () => {
      if (completed >= total) {
        reportComplete(results);
        return;
      }
      
      const operation = operations[completed];
      
      try {
        const result = await executeOperation(operation);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error });
      }
      
      completed++;
      reportProgress(completed, total);
      
      // 继续下一个
      processNext();
    };
    
    processNext();
  }, [operations]); // 只在operations变化时重新开始
  
  return null;
}
```

## 第十部分：常见模式

### 10.1 日志和监控

统一的日志模式：
```jsx
function useLogger(componentName) {
  const log = useEffectEvent((level, message, data) => {
    const logEntry = {
      component: componentName,
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // 发送到日志服务
    sendToLoggingService(logEntry);
    
    // 本地控制台
    console[level](
      `[${componentName}] ${message}`,
      data
    );
  });
  
  return log;
}

// 使用
function DataProcessor({ sourceId, processingConfig }) {
  const log = useLogger('DataProcessor');
  
  useEffect(() => {
    log('info', 'Starting data processing', { sourceId });
    
    const process = async () => {
      try {
        const data = await fetchData(sourceId);
        log('info', 'Data fetched', { count: data.length });
        
        const processed = processData(data, processingConfig);
        log('info', 'Processing complete', { 
          inputCount: data.length,
          outputCount: processed.length 
        });
      } catch (error) {
        log('error', 'Processing failed', { 
          error: error.message,
          stack: error.stack 
        });
      }
    };
    
    process();
  }, [sourceId]); // processingConfig不触发重新处理
  
  return <div>Processing...</div>;
}
```

### 10.2 A/B测试

实验特性控制：
```jsx
function useExperiment(experimentKey, variant, onExposure) {
  const recordExposure = useEffectEvent(() => {
    onExposure({
      experimentKey,
      variant,
      userId: getCurrentUser().id,
      timestamp: Date.now()
    });
  });
  
  useEffect(() => {
    // 只在实验variant变化时记录曝光
    recordExposure();
  }, [experimentKey, variant]);
}

// 使用
function FeatureComponent() {
  const variant = useExperimentVariant('new-ui-test');
  const [interactions, setInteractions] = useState(0);
  
  useExperiment(
    'new-ui-test',
    variant,
    (exposure) => {
      // 回调可能包含频繁变化的state
      analytics.recordExposure({
        ...exposure,
        interactions, // 当前交互次数
        sessionDuration: getSessionDuration()
      });
    }
  );
  
  return variant === 'control' ? <OldUI /> : <NewUI />;
}
```

### 10.3 性能监控

监控Effect性能：
```jsx
function usePerformanceMonitor(effectName, dependencies) {
  const recordMetrics = useEffectEvent((duration, phase) => {
    const metrics = {
      effectName,
      duration,
      phase,
      dependencies: JSON.stringify(dependencies),
      timestamp: Date.now()
    };
    
    sendToMonitoring(metrics);
    
    if (duration > 100) {
      console.warn(`Slow Effect detected: ${effectName} took ${duration}ms`);
    }
  });
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      recordMetrics(duration, 'cleanup');
    };
  }, dependencies);
  
  useEffect(() => {
    const startTime = performance.now();
    
    // Effect逻辑
    
    const duration = performance.now() - startTime;
    recordMetrics(duration, 'setup');
  }, dependencies);
}

// 使用
function MonitoredComponent({ data }) {
  usePerformanceMonitor('DataProcessing', [data]);
  
  useEffect(() => {
    // 被监控的Effect逻辑
    processData(data);
  }, [data]);
}
```

## 第十一部分：测试策略

### 11.1 单元测试

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
  
  test('does not trigger effect re-run on handler change', () => {
    const effectFn = jest.fn();
    let handler = jest.fn();
    
    const { rerender } = renderHook(
      ({ callback }) => {
        const event = useEffectEvent(callback);
        
        useEffect(() => {
          effectFn();
          return () => {};
        }, []);
      },
      { initialProps: { callback: handler } }
    );
    
    expect(effectFn).toHaveBeenCalledTimes(1);
    
    // 更改handler
    handler = jest.fn();
    rerender({ callback: handler });
    
    // Effect不应该重新运行
    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});
```

### 11.2 集成测试

测试完整流程：
```jsx
import { render, screen, act } from '@testing-library/react';

test('chat room with useEffectEvent', async () => {
  const mockConnection = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  };
  
  jest.spyOn(global, 'createConnection').mockReturnValue(mockConnection);
  
  const onMessage = jest.fn();
  
  const { rerender } = render(
    <ChatRoom roomId="room1" theme="light" onMessage={onMessage} />
  );
  
  // 验证连接建立
  expect(mockConnection.connect).toHaveBeenCalledTimes(1);
  
  // 模拟接收消息
  const messageHandler = mockConnection.on.mock.calls.find(
    call => call[0] === 'message'
  )[1];
  
  act(() => {
    messageHandler({ text: 'Hello', id: 1 });
  });
  
  expect(onMessage).toHaveBeenCalledWith({ text: 'Hello', id: 1 });
  
  // 更改theme（不应重连）
  rerender(<ChatRoom roomId="room1" theme="dark" onMessage={onMessage} />);
  
  expect(mockConnection.disconnect).not.toHaveBeenCalled();
  expect(mockConnection.connect).toHaveBeenCalledTimes(1); // 仍然是1次
  
  // 更改roomId（应该重连）
  rerender(<ChatRoom roomId="room2" theme="dark" onMessage={onMessage} />);
  
  expect(mockConnection.disconnect).toHaveBeenCalledTimes(1);
  expect(mockConnection.connect).toHaveBeenCalledTimes(2);
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

```jsx
// ❌ 错误用法
function Wrong() {
  const event = useEffectEvent(() => {});
  
  const handleClick = () => {
    event(); // 错误：不在Effect中
  };
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确用法
function Correct() {
  const event = useEffectEvent(() => {});
  
  useEffect(() => {
    const handleClick = () => {
      event(); // 正确：在Effect内部
    };
    
    button.addEventListener('click', handleClick);
    return () => button.removeEventListener('click', handleClick);
  }, []);
}
```

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

### Q4: 能否嵌套使用useEffectEvent？

A: 可以，但要注意调用规则。

```jsx
function Nested() {
  const inner = useEffectEvent(() => {
    console.log('Inner');
  });
  
  const outer = useEffectEvent(() => {
    console.log('Outer');
    inner(); // ✅ 可以调用另一个Effect Event
  });
  
  useEffect(() => {
    outer();
  }, []);
}
```

### Q5: useEffectEvent性能开销如何？

A: 非常小，几乎可以忽略。

性能分析：
```jsx
// 性能测试
function PerformanceTest() {
  const iterations = 10000;
  
  // 测试useEffectEvent
  const startEvent = performance.now();
  for (let i = 0; i < iterations; i++) {
    const event = useEffectEvent(() => {});
  }
  const eventTime = performance.now() - startEvent;
  
  // 测试useCallback
  const startCallback = performance.now();
  for (let i = 0; i < iterations; i++) {
    const callback = useCallback(() => {}, []);
  }
  const callbackTime = performance.now() - startCallback;
  
  console.log('useEffectEvent:', eventTime, 'ms');
  console.log('useCallback:', callbackTime, 'ms');
  
  // 结果：性能相似，差异可忽略
}
```

### Q6: 如何调试useEffectEvent？

A: 使用console.log和React DevTools。

调试技巧：
```jsx
function DebuggableEffect({ value }) {
  const debugEvent = useEffectEvent((action) => {
    console.group(`Effect Event: ${action}`);
    console.log('Value:', value);
    console.log('Stack:', new Error().stack);
    console.groupEnd();
  });
  
  useEffect(() => {
    console.log('Effect running');
    
    debugEvent('setup');
    
    return () => {
      debugEvent('cleanup');
    };
  }, []);
}
```

### Q7: useEffectEvent能否替代所有useCallback？

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
    {/* 避免子组件重新渲染 */}
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

### Q8: useEffectEvent与StrictMode

A: StrictMode会双重调用，需要注意。

```jsx
function StrictModeExample() {
  const [count, setCount] = useState(0);
  
  const increment = useEffectEvent(() => {
    setCount(c => c + 1);
  });
  
  useEffect(() => {
    console.log('Effect running');
    increment();
    
    return () => {
      console.log('Effect cleanup');
    };
  }, []);
  
  // StrictMode下输出：
  // Effect running
  // Effect cleanup
  // Effect running
  
  // count变化：
  // 0 -> 1 -> 2 (因为Effect运行两次)
  
  // 解决：使用函数式更新
  const safeIncrement = useEffectEvent(() => {
    setCount(c => c + 1); // ✅ 函数式更新，安全
  });
}
```

### Q9: 如何处理异步Effect Event？

A: 可以是异步的，但要处理好清理。

```jsx
function AsyncEffectEvent({ userId }) {
  const [data, setData] = useState(null);
  
  const fetchAndUpdate = useEffectEvent(async () => {
    try {
      const result = await fetchUserData(userId);
      setData(result);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  });
  
  useEffect(() => {
    let cancelled = false;
    
    const fetch = async () => {
      if (cancelled) return;
      await fetchAndUpdate();
    };
    
    fetch();
    
    return () => {
      cancelled = true;
    };
  }, [userId]);
}
```

### Q10: useEffectEvent能否访问DOM？

A: 可以，通过ref。

```jsx
function DOMAccess() {
  const ref = useRef(null);
  
  const updateDOM = useEffectEvent(() => {
    if (ref.current) {
      ref.current.style.backgroundColor = getRandomColor();
    }
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      updateDOM();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <div ref={ref}>Color changes every second</div>;
}
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
✅ 不在依赖数组中
✅ 不触发Effect重新运行
✅ 总是访问最新值

2. 作用域限制
✅ 只能在Effect中调用
✅ 不能传递给其他组件
✅ 不能作为依赖

3. 性能优化
✅ 减少Effect运行
✅ 避免不必要的订阅/取消
✅ 更好的用户体验
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

