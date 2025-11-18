# use() Hook原理 - React 19统一异步处理

## 1. use() Hook概述

### 1.1 核心概念

```typescript
const useHookConcept = {
  定义: 'React 19新增的Hook,用于读取资源',
  
  支持类型: {
    Promise: '读取异步数据',
    Context: '读取Context值'
  },
  
  特殊性: [
    '可以在条件语句中调用',
    '可以在循环中调用',
    '不受Hooks规则限制',
    '必须在Suspense边界内'
  ],
  
  基本用法: `
    import { use } from 'react';
    
    function Component({ dataPromise }) {
      const data = use(dataPromise);
      return <div>{data.title}</div>;
    }
  `
};
```

### 1.2 与传统Hooks的区别

```typescript
const useVsTraditionalHooks = {
  调用位置: {
    传统Hooks: '只能在组件顶层',
    useHook: '可以在任何地方',
    示例: `
      function Component({ condition }) {
        // ❌ 传统Hook不能条件调用
        if (condition) {
          const value = useContext(MyContext);  // 错误
        }
        
        // ✓ use可以条件调用
        let value = null;
        if (condition) {
          value = use(MyContext);  // 正确
        }
      }
    `
  },
  
  循环中使用: {
    传统Hooks: '不能在循环中',
    useHook: '可以在循环中',
    示例: `
      function Component({ promises }) {
        // ❌ 传统Hook不能在循环中
        const results = promises.map(p => {
          const data = usePromise(p);  // 错误
          return data;
        });
        
        // ✓ use可以在循环中
        const results = promises.map(p => {
          const data = use(p);  // 正确
          return data;
        });
        
        return <div>{JSON.stringify(results)}</div>;
      }
    `
  }
};
```

## 2. 读取Promise

### 2.1 基本用法

```typescript
const readPromise = {
  基础示例: `
    function UserProfile({ userPromise }) {
      // use读取Promise
      const user = use(userPromise);
      
      return (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
      );
    }
    
    function App() {
      const userPromise = fetchUser(1);
      
      return (
        <Suspense fallback={<Loading />}>
          <UserProfile userPromise={userPromise} />
        </Suspense>
      );
    }
  `,
  
  工作流程: [
    '1. 组件接收Promise',
    '2. 调用use(promise)',
    '3. Promise pending时抛出Promise',
    '4. Suspense捕获并显示fallback',
    '5. Promise resolved后重新渲染',
    '6. use返回resolved值'
  ]
};
```

### 2.2 实现原理

```typescript
/**
 * use Hook简化实现
 */
function use<T>(resource: Promise<T> | Context<T>): T {
  // 检查资源类型
  if (
    resource !== null &&
    typeof resource === 'object' &&
    typeof resource.then === 'function'
  ) {
    // Promise
    return readPromise(resource);
  } else if (
    resource !== null &&
    typeof resource === 'object' &&
    '$$typeof' in resource &&
    resource.$$typeof === REACT_CONTEXT_TYPE
  ) {
    // Context
    return readContext(resource as Context<T>);
  } else {
    throw new Error('use() expects a Promise or Context');
  }
}

/**
 * 读取Promise
 */
function readPromise<T>(promise: Promise<T>): T {
  // 检查Promise状态
  const status = (promise as any).status;
  
  if (status === 'fulfilled') {
    // 已完成
    return (promise as any).value;
  } else if (status === 'rejected') {
    // 已拒绝
    throw (promise as any).reason;
  } else {
    // Pending - 包装Promise
    if (typeof status === 'undefined') {
      (promise as any).status = 'pending';
      
      promise.then(
        (value) => {
          (promise as any).status = 'fulfilled';
          (promise as any).value = value;
        },
        (reason) => {
          (promise as any).status = 'rejected';
          (promise as any).reason = reason;
        }
      );
    }
    
    // 抛出Promise让Suspense捕获
    throw promise;
  }
}
```

### 2.3 Promise缓存

```typescript
const promiseCaching = {
  问题: `
    function Component() {
      // ❌ 每次渲染创建新Promise
      const data = use(fetchData());
      return <div>{data}</div>;
    }
    
    // fetchData()每次都是新Promise
    // 导致无限重新获取
  `,
  
  解决方案1: `
    // 在父组件创建Promise
    function Parent() {
      const dataPromise = useMemo(() => fetchData(), []);
      
      return (
        <Suspense fallback={<Loading />}>
          <Child dataPromise={dataPromise} />
        </Suspense>
      );
    }
    
    function Child({ dataPromise }) {
      const data = use(dataPromise);
      return <div>{data}</div>;
    }
  `,
  
  解决方案2: `
    // 使用缓存库
    import { cache } from 'react';
    
    const fetchData = cache(async (id) => {
      return await db.data.findUnique({ where: { id } });
    });
    
    function Component({ id }) {
      const data = use(fetchData(id));
      return <div>{data}</div>;
    }
  `,
  
  解决方案3: `
    // 使用SWR或React Query
    import { useSWR } from 'swr';
    
    function Component() {
      const { data } = useSWR('/api/data', fetcher);
      return <div>{data}</div>;
    }
  `
};
```

## 3. 读取Context

### 3.1 基本用法

```typescript
const readContext = {
  示例: `
    const ThemeContext = createContext('light');
    
    function Component() {
      // 两种方式等价
      const theme1 = useContext(ThemeContext);
      const theme2 = use(ThemeContext);
      
      return <div className={theme2}>Content</div>;
    }
  `,
  
  优势: `
    function Component({ needsTheme }) {
      let theme = 'default';
      
      // ✓ 可以条件读取
      if (needsTheme) {
        theme = use(ThemeContext);
      }
      
      return <div className={theme}>Content</div>;
    }
  `
};
```

## 4. 条件和循环使用

### 4.1 条件使用

```typescript
const conditionalUse = {
  基本示例: `
    function Component({ shouldLoad, dataPromise }) {
      let data = null;
      
      if (shouldLoad) {
        data = use(dataPromise);
      }
      
      return <div>{data ? data.title : 'Not loaded'}</div>;
    }
  `,
  
  实际应用: `
    function UserDashboard({ user, showDetails }) {
      // 基础信息（总是显示）
      const basicInfo = <UserCard user={user} />;
      
      // 详细信息（条件加载）
      let details = null;
      if (showDetails) {
        const detailsData = use(fetchUserDetails(user.id));
        details = <UserDetails data={detailsData} />;
      }
      
      return (
        <div>
          {basicInfo}
          {details}
        </div>
      );
    }
  `
};
```

### 4.2 循环使用

```typescript
const loopUse = {
  基本示例: `
    function MultiData({ promises }) {
      const results = promises.map(promise => use(promise));
      
      return (
        <ul>
          {results.map((data, index) => (
            <li key={index}>{data.title}</li>
          ))}
        </ul>
      );
    }
  `,
  
  实际应用: `
    function ProductComparison({ productIds }) {
      // 并行获取多个产品数据
      const productPromises = productIds.map(id => 
        fetchProduct(id)
      );
      
      const products = productPromises.map(promise => use(promise));
      
      return (
        <div className="comparison">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }
  `
};
```

## 5. 错误处理

### 5.1 ErrorBoundary配合

```typescript
const errorHandling = {
  基本用法: `
    class ErrorBoundary extends React.Component {
      state = { hasError: false, error: null };
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      render() {
        if (this.state.hasError) {
          return <div>Error: {this.state.error.message}</div>;
        }
        return this.props.children;
      }
    }
    
    function App() {
      const dataPromise = fetchData();
      
      return (
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <DataComponent dataPromise={dataPromise} />
          </Suspense>
        </ErrorBoundary>
      );
    }
    
    function DataComponent({ dataPromise }) {
      const data = use(dataPromise);  // Promise rejected时抛出错误
      return <div>{data}</div>;
    }
  `,
  
  Promise错误: `
    const dataPromise = fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      });
    
    function Component() {
      try {
        const data = use(dataPromise);
        return <div>{data}</div>;
      } catch (error) {
        // ❌ 不会捕获（use会抛出到Suspense/ErrorBoundary）
        return <div>Error</div>;
      }
    }
    
    // ✓ 正确：用ErrorBoundary
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  `
};
```

## 6. 最佳实践

```typescript
const useBestPractices = {
  Promise管理: [
    '在父组件或外部创建Promise',
    '使用useMemo缓存Promise',
    '避免在渲染中创建Promise',
    '使用cache()缓存函数'
  ],
  
  错误处理: [
    '使用ErrorBoundary',
    '提供有意义的错误信息',
    '实现重试机制',
    '优雅降级'
  ],
  
  性能优化: [
    'Promise去重',
    '并行请求',
    '预加载数据',
    '流式渲染'
  ],
  
  示例: `
    import { cache } from 'react';
    
    // 缓存获取函数
    const getUser = cache(async (id) => {
      return await db.user.findUnique({ where: { id } });
    });
    
    function UserProfile({ userId }) {
      // 自动去重和缓存
      const user = use(getUser(userId));
      return <div>{user.name}</div>;
    }
  `
};
```

## 7. 面试高频问题

```typescript
const interviewQA = {
  Q1: {
    question: 'use() Hook的作用?',
    answer: [
      '1. 读取Promise获取异步数据',
      '2. 读取Context值',
      '3. 可以在条件/循环中使用',
      '4. 统一的资源读取API',
      '5. 与Suspense集成'
    ]
  },
  
  Q2: {
    question: 'use()与useContext的区别?',
    answer: `
      相同点:
      - 都可以读取Context
      
      不同点:
      - use可以条件调用
      - use可以在循环中
      - use还能读取Promise
      - useContext只能读取Context
    `
  },
  
  Q3: {
    question: 'use()如何处理Promise?',
    answer: [
      '1. Promise pending时抛出Promise',
      '2. Suspense捕获并显示fallback',
      '3. Promise resolved后重新渲染',
      '4. use返回resolved值',
      '5. Promise rejected时抛出错误到ErrorBoundary'
    ]
  },
  
  Q4: {
    question: 'use()的限制?',
    answer: [
      '1. 必须在Suspense边界内',
      '2. Promise应该缓存',
      '3. 不能在try-catch中捕获错误',
      '4. 需要ErrorBoundary处理错误'
    ]
  }
};
```

## 8. 总结

## 11. use() Hook实战案例

### 11.1 数据预加载模式

```tsx
// 预加载数据的高级模式
const prefetchCache = new Map();

function prefetchData(key: string, fetcher: () => Promise<any>) {
  if (!prefetchCache.has(key)) {
    prefetchCache.set(key, fetcher());
  }
  return prefetchCache.get(key);
}

// 在路由层预加载
function Route() {
  // 预加载数据（不阻塞渲染）
  const userPromise = prefetchData('user', () => fetchUser());
  const postsPromise = prefetchData('posts', () => fetchPosts());
  
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userPromise={userPromise} />
      <PostsList postsPromise={postsPromise} />
    </Suspense>
  );
}

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

### 11.2 竞态条件处理

```tsx
// 处理搜索竞态条件
function SearchResults() {
  const [query, setQuery] = useState('');
  const [searchPromise, setSearchPromise] = useState<Promise<any> | null>(null);
  
  useEffect(() => {
    if (!query) {
      setSearchPromise(null);
      return;
    }
    
    // 每次查询创建新Promise
    const promise = fetch(`/api/search?q=${query}`)
      .then(res => res.json());
    
    setSearchPromise(promise);
  }, [query]);
  
  if (!searchPromise) {
    return <div>请输入搜索词</div>;
  }
  
  return (
    <Suspense fallback={<div>搜索中...</div>}>
      <Results promise={searchPromise} />
    </Suspense>
  );
}

function Results({ promise }: { promise: Promise<any> }) {
  const results = use(promise);
  return (
    <ul>
      {results.map((item: any) => (
        <li key={item.id}>{item.title}</li>
      ))}
    </ul>
  );
}
```

### 11.3 条件数据加载

```tsx
// 根据条件决定是否加载数据
function ConditionalData({ userId }: { userId: string | null }) {
  const [dataPromise, setDataPromise] = useState<Promise<any> | null>(null);
  
  useEffect(() => {
    if (userId) {
      setDataPromise(fetchUserData(userId));
    } else {
      setDataPromise(null);
    }
  }, [userId]);
  
  if (!dataPromise) {
    return <div>请选择用户</div>;
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <UserData promise={dataPromise} />
    </Suspense>
  );
}

function UserData({ promise }: { promise: Promise<any> }) {
  const data = use(promise);
  return <div>{JSON.stringify(data)}</div>;
}
```

## 12. use() Hook性能优化

### 12.1 Promise去重

```tsx
// 避免重复请求
class PromiseDeduplicator {
  private pending = new Map<string, Promise<any>>();
  
  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }
    
    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}

const deduplicator = new PromiseDeduplicator();

function useDeduplicatedFetch(url: string) {
  const [promise] = useState(() =>
    deduplicator.deduplicate(url, () => fetch(url).then(r => r.json()))
  );
  
  return use(promise);
}
```

### 12.2 批量请求优化

```tsx
// DataLoader模式批量请求
class DataLoader {
  private queue: Array<{ id: string; resolve: Function; reject: Function }> = [];
  private timer: NodeJS.Timeout | null = null;
  
  load(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ id, resolve, reject });
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 10);
      }
    });
  }
  
  private async flush() {
    const batch = this.queue.splice(0);
    this.timer = null;
    
    if (batch.length === 0) return;
    
    try {
      const ids = batch.map(item => item.id);
      const results = await fetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify({ ids })
      }).then(r => r.json());
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

const loader = new DataLoader();

function User({ id }: { id: string }) {
  const user = use(loader.load(id));
  return <div>{user.name}</div>;
}
```

### 12.3 预加载策略

```tsx
// 鼠标悬停预加载
function LinkWithPrefetch({ to, children }: Props) {
  const [promise, setPromise] = useState<Promise<any> | null>(null);
  
  const handleMouseEnter = () => {
    if (!promise) {
      const p = import(`./pages${to}`);
      setPromise(p);
      // 缓存到全局
      prefetchCache.set(to, p);
    }
  };
  
  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
}
```

## 13. use() Hook测试

### 13.1 测试Promise

```tsx
import { render, screen, waitFor } from '@testing-library/react';

describe('use() Hook with Promise', () => {
  it('should render data from promise', async () => {
    const promise = Promise.resolve({ name: 'John' });
    
    function Component() {
      const data = use(promise);
      return <div>{data.name}</div>;
    }
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });
  });
  
  it('should handle rejected promise', async () => {
    const promise = Promise.reject(new Error('Failed'));
    
    function Component() {
      const data = use(promise);
      return <div>{data.name}</div>;
    }
    
    const { container } = render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <Component />
        </Suspense>
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });
});
```

### 13.2 测试Context

```tsx
describe('use() Hook with Context', () => {
  it('should read context value', () => {
    const ThemeContext = createContext('light');
    
    function Component() {
      const theme = use(ThemeContext);
      return <div>{theme}</div>;
    }
    
    render(
      <ThemeContext.Provider value="dark">
        <Component />
      </ThemeContext.Provider>
    );
    
    expect(screen.getByText('dark')).toBeInTheDocument();
  });
  
  it('should work in conditional rendering', () => {
    const Context = createContext('default');
    
    function Component({ show }: { show: boolean }) {
      if (!show) return null;
      
      const value = use(Context);
      return <div>{value}</div>;
    }
    
    const { rerender } = render(
      <Context.Provider value="test">
        <Component show={false} />
      </Context.Provider>
    );
    
    expect(screen.queryByText('test')).not.toBeInTheDocument();
    
    rerender(
      <Context.Provider value="test">
        <Component show={true} />
      </Context.Provider>
    );
    
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

## 14. 常见问题与解决方案

### 14.1 Promise未缓存导致重新请求

```tsx
// ❌ 错误：每次渲染创建新Promise
function Bad() {
  const data = use(fetch('/api/data').then(r => r.json()));
  return <div>{data}</div>;
}

// ✅ 正确：缓存Promise
const dataPromise = fetch('/api/data').then(r => r.json());

function Good() {
  const data = use(dataPromise);
  return <div>{data}</div>;
}
```

### 14.2 在循环中使用

```tsx
// ❌ 错误：在循环中直接use
function Bad({ ids }: { ids: string[] }) {
  return (
    <div>
      {ids.map(id => {
        const data = use(fetchData(id)); // 错误！
        return <div key={id}>{data}</div>;
      })}
    </div>
  );
}

// ✅ 正确：将use移到单独组件
function Item({ id }: { id: string }) {
  const data = use(fetchData(id));
  return <div>{data}</div>;
}

function Good({ ids }: { ids: string[] }) {
  return (
    <div>
      {ids.map(id => (
        <Suspense key={id} fallback={<Loading />}>
          <Item id={id} />
        </Suspense>
      ))}
    </div>
  );
}
```

### 14.3 错误处理不当

```tsx
// ❌ 错误：没有ErrorBoundary
function Bad() {
  const data = use(fetchData()); // 可能抛出错误
  return <div>{data}</div>;
}

// ✅ 正确：使用ErrorBoundary
function Good() {
  return (
    <ErrorBoundary fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

function DataComponent() {
  const data = use(fetchData());
  return <div>{data}</div>;
}
```

## 15. use() Hook最佳实践

### 15.1 实践清单

```typescript
const useBestPractices = {
  '✅ Promise使用': [
    '始终缓存Promise，避免重复创建',
    '使用专门的缓存层管理Promise',
    '考虑使用SWR或React Query等库',
    '实现Promise去重机制'
  ],
  
  '✅ Suspense配置': [
    '合理设置fallback边界',
    '避免过深的Suspense嵌套',
    '考虑使用SuspenseList优化',
    '提供有意义的loading状态'
  ],
  
  '✅ 错误处理': [
    '始终包裹ErrorBoundary',
    '提供用户友好的错误信息',
    '实现重试机制',
    '记录错误日志'
  ],
  
  '✅ 性能优化': [
    '实现请求去重',
    '使用DataLoader批量请求',
    '预加载关键数据',
    '避免瀑布式请求'
  ],
  
  '✅ 类型安全': [
    '使用TypeScript定义Promise类型',
    '提供完整的类型推导',
    '处理边界情况的类型',
    '避免any类型'
  ]
};
```

### 15.2 架构建议

```typescript
// 推荐的数据获取架构
interface DataFetchingArchitecture {
  // 1. 数据层
  dataLayer: {
    cache: 'Map<string, Promise<any>>',
    deduplication: 'PromiseDeduplicator',
    prefetch: 'PrefetchManager'
  };
  
  // 2. Hook层
  hookLayer: {
    useData: 'Custom hook with use()',
    useCache: 'Cache management',
    usePrefetch: 'Prefetch utilities'
  };
  
  // 3. 组件层
  componentLayer: {
    suspenseBoundaries: 'Strategic placement',
    errorBoundaries: 'Error handling',
    loadingStates: 'User feedback'
  };
  
  // 4. 路由层
  routeLayer: {
    prefetching: 'Route-level prefetch',
    codesplitting: 'Lazy loading',
    dataLoading: 'Parallel data loading'
  };
}
```

## 总结

use() Hook的核心要点:

1. **双重功能**: Promise + Context
2. **灵活调用**: 不受Hooks规则限制
3. **Suspense集成**: 自动loading状态
4. **错误处理**: ErrorBoundary捕获
5. **Promise缓存**: 需要外部缓存机制
6. **性能**: 支持并发和流式渲染
7. **实战应用**: 数据预加载、竞态处理
8. **优化策略**: 去重、批量、预加载
9. **测试**: Promise和Context的完整测试
10. **最佳实践**: 架构设计和性能优化

use() Hook是React 19最重要的新特性之一，掌握它对于构建高性能React应用至关重要。

## 面试要点

### 高频面试题

1. **use()与传统Hooks的区别？**
   - 可以在条件语句中使用
   - 可以读取Promise和Context
   - 与Suspense深度集成

2. **use()的实现原理？**
   - 检查参数类型（Promise/Context）
   - Promise时throw promise触发Suspense
   - Context时从Fiber读取值

3. **如何避免重复请求？**
   - Promise缓存
   - 请求去重
   - 使用DataLoader

4. **use()的性能优化策略？**
   - 预加载
   - 批量请求
   - 并行数据获取

5. **use()与React Query的关系？**
   - use()是底层原语
   - React Query提供更高级抽象
   - 可以结合使用

## 扩展阅读

- [React RFC: First-class Support for Promises](https://github.com/reactjs/rfcs/pull/229)
- [React 19 use() Hook文档](https://react.dev/reference/react/use)
- [Suspense for Data Fetching](https://react.dev/reference/react/Suspense)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

