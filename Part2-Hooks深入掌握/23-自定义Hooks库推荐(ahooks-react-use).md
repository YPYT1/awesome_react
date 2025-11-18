# 自定义Hooks库推荐

## 学习目标

通过本章学习，你将全面了解：

- 主流Hooks库的特点和定位
- ahooks的核心功能和使用
- react-use的丰富功能集
- usehooks-ts的TypeScript支持
- 其他优秀Hooks库介绍
- 如何选择合适的Hooks库
- 与React 19的兼容性
- 实战应用案例

## 第一部分：主流Hooks库概览

### 1.1 Hooks库对比

| 库名 | Star数 | 特点 | 适用场景 |
|------|--------|------|----------|
| ahooks | 13k+ | 阿里开源，中文文档，企业级 | 中大型项目 |
| react-use | 40k+ | 功能最全，社区活跃 | 各类项目 |
| usehooks-ts | 5k+ | TypeScript优先，代码简洁 | TS项目 |
| beautiful-react-hooks | 7k+ | API设计优雅 | 注重UX |
| react-hookz | 2k+ | 性能优化，现代化 | 性能敏感 |

### 1.2 选择建议

```jsx
// 根据项目需求选择

// 1. 企业级中文项目 → ahooks
import { useRequest, useLocalStorageState } from 'ahooks';

// 2. 功能全面国际项目 → react-use
import { useAsync, useDebounce } from 'react-use';

// 3. TypeScript项目 → usehooks-ts
import { useLocalStorage, useDebounce } from 'usehooks-ts';

// 4. 注重体验 → beautiful-react-hooks
import { useMouseState, useGlobalEvent } from 'beautiful-react-hooks';

// 5. 性能优先 → react-hookz
import { useDebounced, useThrottled } from '@react-hookz/web';
```

## 第二部分：ahooks详解

### 2.1 ahooks简介

ahooks是阿里巴巴开源的React Hooks库，提供了大量高质量、可靠的Hooks。

**特点：**
- 中文文档，国内开发者友好
- 企业级质量保证
- 完善的TypeScript支持
- 丰富的实战案例

**安装：**
```bash
npm install ahooks
# 或
yarn add ahooks
# 或
pnpm add ahooks
```

### 2.2 状态管理Hooks

#### useLocalStorageState - 本地存储状态

```jsx
import { useLocalStorageState } from 'ahooks';

function ThemeManager() {
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: 'light'
  });
  
  return (
    <div>
      <p>当前主题: {theme}</p>
      <button onClick={() => setTheme('light')}>浅色</button>
      <button onClick={() => setTheme('dark')}>深色</button>
    </div>
  );
}
```

#### useSessionStorageState - 会话存储状态

```jsx
import { useSessionStorageState } from 'ahooks';

function FormDraft() {
  const [draft, setDraft] = useSessionStorageState('form-draft', {
    defaultValue: { title: '', content: '' }
  });
  
  return (
    <form>
      <input 
        value={draft.title}
        onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
        placeholder="标题"
      />
      <textarea
        value={draft.content}
        onChange={e => setDraft(prev => ({ ...prev, content: e.target.value }))}
        placeholder="内容"
      />
    </form>
  );
}
```

#### useToggle - 开关状态

```jsx
import { useToggle } from 'ahooks';

function Modal() {
  const [visible, { toggle, setLeft, setRight }] = useToggle();
  
  return (
    <>
      <button onClick={toggle}>切换</button>
      <button onClick={setLeft}>关闭</button>
      <button onClick={setRight}>打开</button>
      {visible && <div>模态框内容</div>}
    </>
  );
}
```

### 2.3 网络请求Hooks

#### useRequest - 强大的数据请求Hook

```jsx
import { useRequest } from 'ahooks';

// 基础用法
function UserProfile({ userId }) {
  const { data, loading, error, run, refresh } = useRequest(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    {
      manual: false, // 自动执行
      onSuccess: (data) => {
        console.log('获取成功:', data);
      },
      onError: (error) => {
        console.error('获取失败:', error);
      }
    }
  );
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return (
    <div>
      <h1>{data?.name}</h1>
      <button onClick={refresh}>刷新</button>
    </div>
  );
}

// 手动触发
function SearchComponent() {
  const { data, loading, run } = useRequest(
    (keyword) => fetch(`/api/search?q=${keyword}`).then(res => res.json()),
    {
      manual: true // 手动触发
    }
  );
  
  const handleSearch = (keyword) => {
    run(keyword);
  };
  
  return (
    <div>
      <input 
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch(e.target.value);
          }
        }}
      />
      {loading && <div>搜索中...</div>}
      {data && <SearchResults results={data} />}
    </div>
  );
}

// 防抖
function SearchWithDebounce() {
  const [keyword, setKeyword] = useState('');
  
  const { data, loading } = useRequest(
    () => fetch(`/api/search?q=${keyword}`).then(res => res.json()),
    {
      debounceWait: 500, // 防抖500ms
      refreshDeps: [keyword]
    }
  );
  
  return (
    <div>
      <input value={keyword} onChange={e => setKeyword(e.target.value)} />
      {loading && <div>搜索中...</div>}
      {data && <SearchResults results={data} />}
    </div>
  );
}

// 轮询
function RealTimeData() {
  const { data } = useRequest(
    () => fetch('/api/dashboard').then(res => res.json()),
    {
      pollingInterval: 3000, // 每3秒轮询
      pollingWhenHidden: false // 页面隐藏时停止轮询
    }
  );
  
  return <Dashboard data={data} />;
}

// 依赖刷新
function UserDetails({ userId }) {
  const { data } = useRequest(
    () => fetch(`/api/users/${userId}`).then(res => res.json()),
    {
      refreshDeps: [userId], // userId变化时重新请求
      cacheKey: `user-${userId}`, // 缓存key
      staleTime: 60000 // 缓存60秒
    }
  );
  
  return <div>{data?.name}</div>;
}

// 并发请求控制
function ConcurrentRequests() {
  const { data, run, cancel, runAsync } = useRequest(
    (id) => fetch(`/api/items/${id}`).then(res => res.json()),
    {
      manual: true,
      ready: true, // 只有ready为true时才能执行
    }
  );
  
  const handleLoadMultiple = async () => {
    try {
      const results = await Promise.all([
        runAsync(1),
        runAsync(2),
        runAsync(3)
      ]);
      console.log('所有请求完成:', results);
    } catch (error) {
      console.error('有请求失败:', error);
    }
  };
  
  return (
    <div>
      <button onClick={handleLoadMultiple}>加载多个</button>
      <button onClick={cancel}>取消请求</button>
    </div>
  );
}
```

#### usePagination - 分页数据

```jsx
import { usePagination } from 'ahooks';

function UserList() {
  const {
    data,
    loading,
    pagination: { current, pageSize, total, onChange }
  } = usePagination(
    ({ current, pageSize }) => 
      fetch(`/api/users?page=${current}&size=${pageSize}`)
        .then(res => res.json()),
    {
      defaultPageSize: 10
    }
  );
  
  return (
    <div>
      {loading ? (
        <div>加载中...</div>
      ) : (
        <>
          <table>
            <tbody>
              {data?.list.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            onChange={onChange}
          />
        </>
      )}
    </div>
  );
}
```

### 2.4 副作用Hooks

#### useDebounce - 防抖

```jsx
import { useDebounce } from 'ahooks';

function SearchInput() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, { wait: 500 });
  
  useEffect(() => {
    if (debouncedValue) {
      // 执行搜索
      fetch(`/api/search?q=${debouncedValue}`);
    }
  }, [debouncedValue]);
  
  return (
    <input 
      value={value} 
      onChange={e => setValue(e.target.value)}
      placeholder="输入搜索..."
    />
  );
}
```

#### useThrottle - 节流

```jsx
import { useThrottle } from 'ahooks';

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, { wait: 200 });
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return <div>滚动位置: {throttledScrollY}px</div>;
}
```

#### useInterval - 定时器

```jsx
import { useInterval } from 'ahooks';

function Countdown({ initialTime }) {
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);
  
  useInterval(
    () => {
      setTime(t => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    },
    running ? 1000 : undefined // undefined停止定时器
  );
  
  return (
    <div>
      <h2>{time}秒</h2>
      <button onClick={() => setRunning(!running)}>
        {running ? '暂停' : '开始'}
      </button>
      <button onClick={() => { setTime(initialTime); setRunning(false); }}>
        重置
      </button>
    </div>
  );
}
```

### 2.5 DOM和浏览器Hooks

#### useEventListener - 事件监听

```jsx
import { useEventListener } from 'ahooks';

function KeyboardShortcuts() {
  const [logs, setLogs] = useState([]);
  
  useEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      setLogs(prev => [...prev, '保存 (Ctrl+S)']);
    }
  });
  
  return (
    <div>
      <h3>按Ctrl+S试试</h3>
      <ul>
        {logs.map((log, i) => <li key={i}>{log}</li>)}
      </ul>
    </div>
  );
}
```

#### useClickAway - 点击外部

```jsx
import { useClickAway } from 'ahooks';
import { useRef, useState } from 'react';

function Dropdown() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  
  useClickAway(() => {
    setVisible(false);
  }, ref);
  
  return (
    <div ref={ref}>
      <button onClick={() => setVisible(!visible)}>
        下拉菜单
      </button>
      {visible && (
        <ul>
          <li>选项1</li>
          <li>选项2</li>
          <li>选项3</li>
        </ul>
      )}
    </div>
  );
}
```

#### useSize - 元素尺寸监听

```jsx
import { useSize } from 'ahooks';
import { useRef } from 'react';

function ResizeObserver() {
  const ref = useRef(null);
  const size = useSize(ref);
  
  return (
    <div>
      <div
        ref={ref}
        style={{
          width: '50%',
          height: '200px',
          border: '1px solid #ccc',
          resize: 'both',
          overflow: 'auto'
        }}
      >
        调整我的大小
      </div>
      <p>宽度: {size?.width}px</p>
      <p>高度: {size?.height}px</p>
    </div>
  );
}
```

#### useInViewport - 元素可见性

```jsx
import { useInViewport } from 'ahooks';
import { useRef } from 'react';

function LazyLoadImage({ src }) {
  const ref = useRef(null);
  const [inViewport] = useInViewport(ref);
  
  return (
    <div ref={ref} style={{ minHeight: '200px' }}>
      {inViewport ? (
        <img src={src} alt="Lazy loaded" />
      ) : (
        <div>占位符...</div>
      )}
    </div>
  );
}
```

## 第三部分：react-use详解

### 3.1 react-use简介

react-use是社区最受欢迎的Hooks库，提供了超过100个Hooks。

**特点：**
- 功能最全面
- 社区活跃，更新快
- 文档详细

**安装：**
```bash
npm install react-use
```

### 3.2 常用Hooks

#### useAsync - 异步操作

```jsx
import { useAsync } from 'react-use';

function UserProfile({ userId }) {
  const state = useAsync(async () => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }, [userId]);
  
  if (state.loading) return <div>Loading...</div>;
  if (state.error) return <div>Error: {state.error.message}</div>;
  
  return <div>{state.value?.name}</div>;
}
```

#### useDebounce - 防抖值

```jsx
import { useDebounce } from 'react-use';

function SearchBox() {
  const [value, setValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  
  useDebounce(
    () => {
      setDebouncedValue(value);
    },
    500,
    [value]
  );
  
  return (
    <div>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <p>防抖后的值: {debouncedValue}</p>
    </div>
  );
}
```

#### useCopyToClipboard - 复制到剪贴板

```jsx
import { useCopyToClipboard } from 'react-use';

function CopyButton({ text }) {
  const [state, copyToClipboard] = useCopyToClipboard();
  
  return (
    <div>
      <button onClick={() => copyToClipboard(text)}>
        复制
      </button>
      {state.value && <span>已复制: {state.value}</span>}
      {state.error && <span>错误: {state.error.message}</span>}
    </div>
  );
}
```

#### useMedia - 媒体查询

```jsx
import { useMedia } from 'react-use';

function ResponsiveComponent() {
  const isMobile = useMedia('(max-width: 768px)');
  const isTablet = useMedia('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMedia('(min-width: 1025px)');
  
  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

#### useFavicon - 动态Favicon

```jsx
import { useFavicon } from 'react-use';

function FaviconController() {
  const [favicon, setFavicon] = useState('/favicon.ico');
  
  useFavicon(favicon);
  
  return (
    <div>
      <button onClick={() => setFavicon('/favicon-dark.ico')}>
        深色图标
      </button>
      <button onClick={() => setFavicon('/favicon-light.ico')}>
        浅色图标
      </button>
    </div>
  );
}
```

#### useTitle - 动态标题

```jsx
import { useTitle } from 'react-use';

function PageComponent({ pageName }) {
  useTitle(`${pageName} - My App`);
  
  return <div>{pageName}页面内容</div>;
}
```

#### useNetworkState - 网络状态

```jsx
import { useNetworkState } from 'react-use';

function NetworkIndicator() {
  const state = useNetworkState();
  
  return (
    <div>
      <p>在线: {state.online ? '是' : '否'}</p>
      <p>连接类型: {state.effectiveType}</p>
      <p>下行速度: {state.downlink}Mbps</p>
      <p>RTT: {state.rtt}ms</p>
    </div>
  );
}
```

#### useBattery - 电池状态

```jsx
import { useBattery } from 'react-use';

function BatteryStatus() {
  const batteryState = useBattery();
  
  if (!batteryState.isSupported) {
    return <div>不支持电池API</div>;
  }
  
  if (!batteryState.fetched) {
    return <div>获取中...</div>;
  }
  
  return (
    <div>
      <p>电量: {(batteryState.level * 100).toFixed(0)}%</p>
      <p>充电中: {batteryState.charging ? '是' : '否'}</p>
      <p>剩余充电时间: {batteryState.chargingTime}秒</p>
      <p>剩余使用时间: {batteryState.dischargingTime}秒</p>
    </div>
  );
}
```

#### useGeolocation - 地理位置

```jsx
import { useGeolocation } from 'react-use';

function LocationDisplay() {
  const state = useGeolocation();
  
  if (state.loading) return <div>获取位置中...</div>;
  if (state.error) return <div>错误: {state.error.message}</div>;
  
  return (
    <div>
      <p>纬度: {state.latitude}</p>
      <p>经度: {state.longitude}</p>
      <p>精度: {state.accuracy}米</p>
    </div>
  );
}
```

### 3.3 动画和过渡Hooks

#### useSpring - 弹簧动画

```jsx
import { useSpring } from 'react-use';

function SpringDemo() {
  const [target, setTarget] = useState(0);
  const value = useSpring(target);
  
  return (
    <div>
      <div style={{ width: `${value}%`, height: '20px', background: 'blue' }} />
      <button onClick={() => setTarget(100)}>展开</button>
      <button onClick={() => setTarget(0)}>收起</button>
    </div>
  );
}
```

#### useTween - 补间动画

```jsx
import { useTween } from 'react-use';

function TweenDemo() {
  const t = useTween('inOutQuad', 2000); // 2秒动画
  
  return (
    <div>
      <div style={{
        width: '100px',
        height: '100px',
        background: 'red',
        transform: `translateX(${t * 200}px)`
      }} />
      <p>进度: {(t * 100).toFixed(0)}%</p>
    </div>
  );
}
```

## 第四部分：usehooks-ts详解

### 4.1 usehooks-ts简介

usehooks-ts是TypeScript优先的Hooks库，代码简洁易读。

**特点：**
- TypeScript原生支持
- 代码简洁，易于理解
- 适合学习和自定义

**安装：**
```bash
npm install usehooks-ts
```

### 4.2 常用Hooks

#### useLocalStorage - 类型安全的本地存储

```tsx
import { useLocalStorage } from 'usehooks-ts';

interface User {
  name: string;
  age: number;
}

function UserSettings() {
  const [user, setUser] = useLocalStorage<User>('user', {
    name: '',
    age: 0
  });
  
  return (
    <div>
      <input 
        value={user.name}
        onChange={e => setUser({ ...user, name: e.target.value })}
      />
      <input 
        type="number"
        value={user.age}
        onChange={e => setUser({ ...user, age: Number(e.target.value) })}
      />
    </div>
  );
}
```

#### useDebounce - 防抖

```tsx
import { useDebounce } from 'usehooks-ts';

function SearchComponent() {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce<string>(value, 500);
  
  useEffect(() => {
    // API调用
    if (debouncedValue) {
      fetch(`/api/search?q=${debouncedValue}`);
    }
  }, [debouncedValue]);
  
  return (
    <input value={value} onChange={e => setValue(e.target.value)} />
  );
}
```

#### useMediaQuery - 媒体查询

```tsx
import { useMediaQuery } from 'usehooks-ts';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

#### useOnClickOutside - 点击外部

```tsx
import { useOnClickOutside } from 'usehooks-ts';

function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(ref, () => setIsOpen(false));
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>打开</button>
      {isOpen && (
        <div ref={ref} className="modal">
          模态框内容
        </div>
      )}
    </>
  );
}
```

## 第五部分：其他优秀Hooks库

### 5.1 beautiful-react-hooks

注重API设计和用户体验的Hooks库。

```jsx
import { useMouseState, useGlobalEvent } from 'beautiful-react-hooks';

function MouseTracker() {
  const { clientX, clientY } = useMouseState();
  
  useGlobalEvent('beforeunload')((event) => {
    event.preventDefault();
    event.returnValue = '';
  });
  
  return (
    <div>
      鼠标位置: {clientX}, {clientY}
    </div>
  );
}
```

### 5.2 react-hookz

现代化、高性能的Hooks库。

```jsx
import { useDebouncedCallback, useThrottledCallback } from '@react-hookz/web';

function PerformanceOptimized() {
  const debouncedSave = useDebouncedCallback(
    (data) => {
      console.log('保存:', data);
    },
    [500]
  );
  
  const throttledScroll = useThrottledCallback(
    () => {
      console.log('滚动事件');
    },
    [200]
  );
  
  return (
    <div onScroll={throttledScroll}>
      <input onChange={(e) => debouncedSave(e.target.value)} />
    </div>
  );
}
```

### 5.3 @uidotdev/usehooks

简洁实用的Hooks集合。

```jsx
import { useWindowSize, useNetworkState } from '@uidotdev/usehooks';

function Utilities() {
  const { width, height } = useWindowSize();
  const network = useNetworkState();
  
  return (
    <div>
      <p>窗口: {width}x{height}</p>
      <p>网络: {network.online ? '在线' : '离线'}</p>
    </div>
  );
}
```

## 第六部分：实战应用案例

### 6.1 表单管理（ahooks）

```jsx
import { useRequest, useDebounce } from 'ahooks';

function UserForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // 防抖的用户名验证
  const debouncedUsername = useDebounce(formData.username, { wait: 500 });
  
  const { data: usernameAvailable, loading: checkingUsername } = useRequest(
    () => fetch(`/api/check-username?name=${debouncedUsername}`)
      .then(res => res.json()),
    {
      ready: !!debouncedUsername,
      refreshDeps: [debouncedUsername]
    }
  );
  
  // 提交表单
  const { loading: submitting, run: submitForm } = useRequest(
    () => fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }),
    {
      manual: true,
      onSuccess: () => {
        alert('注册成功！');
      },
      onError: (error) => {
        alert(`注册失败: ${error.message}`);
      }
    }
  );
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <div>
        <input
          value={formData.username}
          onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="用户名"
        />
        {checkingUsername && <span>检查中...</span>}
        {usernameAvailable === false && <span>用户名已存在</span>}
        {usernameAvailable === true && <span>用户名可用</span>}
      </div>
      
      <input
        type="email"
        value={formData.email}
        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="邮箱"
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
        placeholder="密码"
      />
      
      <button type="submit" disabled={submitting}>
        {submitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

### 6.2 实时数据展示（react-use）

```jsx
import { useInterval, useToggle, useNetworkState } from 'react-use';

function LiveDashboard() {
  const [data, setData] = useState(null);
  const [isPaused, togglePause] = useToggle(false);
  const network = useNetworkState();
  
  useInterval(
    async () => {
      const response = await fetch('/api/dashboard');
      const newData = await response.json();
      setData(newData);
    },
    isPaused || !network.online ? null : 3000
  );
  
  return (
    <div>
      {!network.online && <div className="warning">网络已断开</div>}
      
      <button onClick={togglePause}>
        {isPaused ? '恢复' : '暂停'}刷新
      </button>
      
      {data && (
        <div>
          <p>用户数: {data.users}</p>
          <p>订单数: {data.orders}</p>
          <p>收入: ¥{data.revenue}</p>
        </div>
      )}
    </div>
  );
}
```

### 6.3 响应式布局（usehooks-ts）

```tsx
import { useMediaQuery, useLocalStorage } from 'usehooks-ts';

function ResponsiveApp() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebar-open', true);
  
  return (
    <div className="app">
      {isMobile ? (
        // 移动端布局
        <MobileLayout 
          menuOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      ) : (
        // 桌面端布局
        <DesktopLayout
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}
    </div>
  );
}
```

## 注意事项

### 1. 避免过度依赖

```jsx
// ❌ 不好：所有功能都依赖库
import { useToggle, useCounter, useBoolean } from 'ahooks';

// ✅ 好：简单功能自己实现
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(!isOpen);
```

### 2. 注意包大小

```jsx
// ❌ 全量导入
import ahooks from 'ahooks';

// ✅ 按需导入
import { useRequest, useDebounce } from 'ahooks';
```

### 3. 版本兼容性

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "ahooks": "^3.7.0",
    "react-use": "^17.4.0",
    "usehooks-ts": "^2.9.0"
  }
}
```

### 4. TypeScript支持

```tsx
// 使用TypeScript时选择类型定义完善的库
import { useRequest } from 'ahooks'; // ✅ 类型完善
import { useAsync } from 'react-use'; // ✅ 类型完善
import { useLocalStorage } from 'usehooks-ts'; // ✅ TS优先
```

### 5. 性能考虑

```jsx
// 根据场景选择合适的Hook
// 频繁更新 → 使用防抖/节流
const debouncedValue = useDebounce(value, { wait: 300 });

// 大量数据 → 使用虚拟化
import { useVirtualList } from 'ahooks';

// 复杂计算 → 使用缓存
const memoizedValue = useMemo(() => heavyComputation(), [deps]);
```

## 常见问题

### Q1: 如何选择合适的Hooks库？

**A:** 根据项目特点选择：

```jsx
// 企业级中文项目
import { useRequest } from 'ahooks';

// 国际化全功能项目
import { useAsync } from 'react-use';

// TypeScript项目
import { useLocalStorage } from 'usehooks-ts';

// 综合考虑：
// 1. 团队技术栈
// 2. 文档语言偏好
// 3. 社区活跃度
// 4. 包大小
// 5. TypeScript支持
```

### Q2: 可以混用多个Hooks库吗？

**A:** 可以，但要注意：

```jsx
// ✅ 可以混用
import { useRequest } from 'ahooks'; // 数据请求
import { useMedia } from 'react-use'; // 媒体查询
import { useLocalStorage } from 'usehooks-ts'; // 本地存储

// ❌ 避免功能重复
import { useDebounce as useDebounce1 } from 'ahooks';
import { useDebounce as useDebounce2 } from 'react-use'; // 冗余
```

### Q3: Hooks库对性能有影响吗？

**A:** 影响很小，但要注意：

```jsx
// 1. 按需导入
import { useRequest } from 'ahooks'; // ✅ 按需
import ahooks from 'ahooks'; // ❌ 全量

// 2. 合理使用
const debouncedValue = useDebounce(value, { wait: 300 }); // ✅ 需要时使用
const unnecessary = useDebounce(simpleValue, { wait: 0 }); // ❌ 不必要

// 3. 关注bundle大小
// ahooks: ~50KB
// react-use: ~80KB  
// usehooks-ts: ~20KB
```

### Q4: 如何处理Hooks库的版本升级？

**A:** 遵循最佳实践：

```bash
# 1. 查看更新日志
npm view ahooks versions
npm show ahooks@latest

# 2. 小版本升级（推荐）
npm update ahooks

# 3. 大版本升级（谨慎）
npm install ahooks@latest

# 4. 锁定版本（稳定）
# package.json
{
  "dependencies": {
    "ahooks": "3.7.8" // 不使用^或~
  }
}
```

### Q5: 自定义Hook还是使用库？

**A:** 根据情况判断：

```jsx
// 使用库的场景：
// 1. 通用功能（防抖、节流、网络请求）
import { useDebounce, useRequest } from 'ahooks';

// 2. 复杂逻辑（虚拟列表、拖拽）
import { useVirtualList } from 'ahooks';

// 自定义Hook的场景：
// 1. 业务特定逻辑
function useUserPermissions() {
  // 项目特定的权限逻辑
}

// 2. 简单工具函数
function useToggle(initial) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}

// 3. 组合多个Hooks
function useAuthenticatedRequest() {
  const { token } = useAuth();
  const { run } = useRequest();
  // 组合逻辑
}
```

## 总结

### 库选择指南

```
场景 → 推荐库
├─ 企业级中文项目 → ahooks
├─ 全功能国际项目 → react-use
├─ TypeScript项目 → usehooks-ts
├─ 注重体验 → beautiful-react-hooks
└─ 性能优先 → react-hookz
```

### 学习路径

1. **入门阶段**：熟悉一个主库（推荐ahooks或react-use）
2. **进阶阶段**：了解其他库的特色功能
3. **高级阶段**：根据场景灵活选择和组合
4. **专家阶段**：参考库的实现，创建自己的Hooks

### 最佳实践

```jsx
// 1. 按需导入
import { useRequest } from 'ahooks';

// 2. 合理组合
function useAuthRequest() {
  const { token } = useAuth();
  const request = useRequest();
  // 组合使用
}

// 3. 封装业务Hook
function useUserProfile(userId) {
  return useRequest(() => fetchUser(userId), {
    cacheKey: `user-${userId}`,
    staleTime: 60000
  });
}

// 4. 类型安全
const [data, setData] = useLocalStorage<UserData>('user', defaultUser);

// 5. 性能优化
const debouncedSearch = useDebounce(searchTerm, { wait: 300 });
```

通过学习和使用这些优秀的Hooks库，你可以大大提升开发效率，编写更优雅、更可维护的React代码！
