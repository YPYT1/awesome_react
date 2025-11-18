# 算法题(React特色) - React相关算法面试题

## 1. Diff算法题

### 1.1 实现简单Diff

```typescript
// 题目: 实现Virtual DOM的Diff算法

function diff(oldVNode, newVNode) {
  // 新增节点
  if (!oldVNode) {
    return { type: 'CREATE', vnode: newVNode };
  }
  
  // 删除节点
  if (!newVNode) {
    return { type: 'REMOVE' };
  }
  
  // 替换节点
  if (oldVNode.type !== newVNode.type) {
    return { type: 'REPLACE', vnode: newVNode };
  }
  
  // 更新节点
  if (oldVNode.type === 'TEXT') {
    if (oldVNode.value !== newVNode.value) {
      return { type: 'TEXT', value: newVNode.value };
    }
    return null;
  }
  
  // 更新属性
  return { type: 'UPDATE', props: newVNode.props };
}

// 测试
const oldVNode = { type: 'div', props: { class: 'old' }, children: [] };
const newVNode = { type: 'div', props: { class: 'new' }, children: [] };

diff(oldVNode, newVNode);
// { type: 'UPDATE', props: { class: 'new' } }
```

### 1.2 列表Diff算法

```typescript
// 题目: 实现带key的列表Diff

function listDiff(oldList, newList) {
  const oldKeyMap = new Map();
  oldList.forEach((item, index) => {
    oldKeyMap.set(item.key, { item, index });
  });
  
  const operations = [];
  const newKeyMap = new Map();
  
  newList.forEach((newItem, newIndex) => {
    const old = oldKeyMap.get(newItem.key);
    
    if (old) {
      // 存在,检查是否移动
      if (old.index !== newIndex) {
        operations.push({
          type: 'MOVE',
          key: newItem.key,
          from: old.index,
          to: newIndex
        });
      }
      
      // 检查是否更新
      if (JSON.stringify(old.item) !== JSON.stringify(newItem)) {
        operations.push({
          type: 'UPDATE',
          key: newItem.key,
          data: newItem
        });
      }
      
      oldKeyMap.delete(newItem.key);
    } else {
      // 新增
      operations.push({
        type: 'CREATE',
        key: newItem.key,
        index: newIndex,
        data: newItem
      });
    }
    
    newKeyMap.set(newItem.key, newIndex);
  });
  
  // 删除剩余的
  oldKeyMap.forEach((old, key) => {
    operations.push({
      type: 'DELETE',
      key
    });
  });
  
  return operations;
}

// 测试
const oldList = [
  { key: 'a', value: 1 },
  { key: 'b', value: 2 },
  { key: 'c', value: 3 }
];

const newList = [
  { key: 'c', value: 3 },
  { key: 'a', value: 1 },
  { key: 'd', value: 4 }
];

listDiff(oldList, newList);
// [
//   { type: 'MOVE', key: 'c', from: 2, to: 0 },
//   { type: 'DELETE', key: 'b' },
//   { type: 'CREATE', key: 'd', index: 2, data: { key: 'd', value: 4 } }
// ]
```

## 2. 组件树算法

### 2.1 查找组件

```typescript
// 题目: 在组件树中查找特定组件

interface ComponentTree {
  type: string;
  props: any;
  children: ComponentTree[];
}

function findComponent(tree, type) {
  if (tree.type === type) {
    return tree;
  }
  
  for (const child of tree.children) {
    const found = findComponent(child, type);
    if (found) return found;
  }
  
  return null;
}

// DFS查找所有匹配组件
function findAllComponents(tree, type) {
  const results = [];
  
  function traverse(node) {
    if (node.type === type) {
      results.push(node);
    }
    
    node.children.forEach(traverse);
  }
  
  traverse(tree);
  return results;
}
```

### 2.2 组件树遍历

```typescript
// 题目: 实现组件树的BFS和DFS遍历

// 深度优先遍历
function dfs(tree, callback) {
  callback(tree);
  tree.children.forEach(child => dfs(child, callback));
}

// 广度优先遍历
function bfs(tree, callback) {
  const queue = [tree];
  
  while (queue.length > 0) {
    const node = queue.shift();
    callback(node);
    queue.push(...node.children);
  }
}

// 使用
const tree = {
  type: 'div',
  children: [
    {
      type: 'span',
      children: []
    },
    {
      type: 'p',
      children: []
    }
  ]
};

console.log('DFS:');
dfs(tree, node => console.log(node.type));
// div -> span -> p

console.log('BFS:');
bfs(tree, node => console.log(node.type));
// div -> span -> p
```

## 3. Hooks相关算法

### 3.1 实现useState

```typescript
// 题目: 手写useState

let state = [];
let setters = [];
let cursor = 0;

function useState(initialValue) {
  const currentCursor = cursor;
  
  state[currentCursor] = state[currentCursor] || initialValue;
  
  const setState = (newValue) => {
    state[currentCursor] = newValue;
    render();
  };
  
  setters[currentCursor] = setState;
  cursor++;
  
  return [state[currentCursor], setState];
}

function render() {
  cursor = 0;
  // 重新渲染组件
}
```

## 4. 性能优化算法

### 4.1 防抖节流

```typescript
// 防抖
function debounce(func, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(func, delay) {
  let last = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - last >= delay) {
      func.apply(this, args);
      last = now;
    }
  };
}

// React中使用
function SearchInput() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      searchAPI(value);
    }, 300),
    []
  );
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return <input value={query} onChange={handleChange} />;
}
```

## 5. 面试总结

```typescript
const interviewTips = {
  算法题解题: [
    '1. 理解题意',
    '2. 分析复杂度',
    '3. 设计数据结构',
    '4. 编码实现',
    '5. 测试验证',
    '6. 优化改进'
  ],
  
  React特色: [
    'Virtual DOM操作',
    'Fiber树遍历',
    'Hooks实现',
    '性能优化算法'
  ]
};
```

## 6. Fiber调度算法

### 6.1 实现简单的时间切片

```typescript
// 题目: 实现React Fiber的时间切片机制

class TaskQueue {
  private tasks: Array<() => void> = [];
  private isPerformingWork = false;
  
  scheduleTask(task: () => void) {
    this.tasks.push(task);
    
    if (!this.isPerformingWork) {
      this.performWork();
    }
  }
  
  private performWork() {
    this.isPerformingWork = true;
    
    const deadline = Date.now() + 5; // 5ms时间片
    
    while (this.tasks.length > 0 && Date.now() < deadline) {
      const task = this.tasks.shift();
      task?.();
    }
    
    if (this.tasks.length > 0) {
      // 还有任务,让出控制权
      requestIdleCallback(() => this.performWork());
    } else {
      this.isPerformingWork = false;
    }
  }
}

// 使用示例
const taskQueue = new TaskQueue();

function heavyTask() {
  for (let i = 0; i < 1000; i++) {
    taskQueue.scheduleTask(() => {
      // 执行计算密集型任务
      console.log('Processing item', i);
    });
  }
}
```

### 6.2 优先级调度

```typescript
// 题目: 实现基于优先级的任务调度

enum Priority {
  Immediate = 1,
  UserBlocking = 2,
  Normal = 3,
  Low = 4,
  Idle = 5
}

interface Task {
  id: number;
  priority: Priority;
  callback: () => void;
  expirationTime: number;
}

class PriorityScheduler {
  private taskQueue: Task[] = [];
  private isScheduling = false;
  private currentTask: Task | null = null;
  
  scheduleTask(callback: () => void, priority: Priority = Priority.Normal) {
    const expirationTime = this.getExpirationTime(priority);
    
    const task: Task = {
      id: Date.now(),
      priority,
      callback,
      expirationTime
    };
    
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => a.expirationTime - b.expirationTime);
    
    if (!this.isScheduling) {
      this.schedule();
    }
  }
  
  private getExpirationTime(priority: Priority): number {
    const now = Date.now();
    
    switch (priority) {
      case Priority.Immediate:
        return now; // 立即执行
      case Priority.UserBlocking:
        return now + 250; // 250ms
      case Priority.Normal:
        return now + 5000; // 5s
      case Priority.Low:
        return now + 10000; // 10s
      case Priority.Idle:
        return now + Infinity; // 空闲时执行
    }
  }
  
  private schedule() {
    if (this.isScheduling) return;
    
    this.isScheduling = true;
    requestIdleCallback((deadline) => this.workLoop(deadline));
  }
  
  private workLoop(deadline: IdleDeadline) {
    while (
      this.taskQueue.length > 0 &&
      (deadline.timeRemaining() > 0 || this.shouldYield())
    ) {
      const task = this.taskQueue.shift()!;
      this.currentTask = task;
      
      task.callback();
      this.currentTask = null;
    }
    
    if (this.taskQueue.length > 0) {
      this.schedule();
    } else {
      this.isScheduling = false;
    }
  }
  
  private shouldYield(): boolean {
    if (!this.currentTask) return false;
    
    // 检查当前任务是否过期
    return Date.now() >= this.currentTask.expirationTime;
  }
  
  cancelTask(taskId: number) {
    this.taskQueue = this.taskQueue.filter(task => task.id !== taskId);
  }
}

// 使用
const scheduler = new PriorityScheduler();

scheduler.scheduleTask(() => console.log('High priority'), Priority.Immediate);
scheduler.scheduleTask(() => console.log('Normal priority'), Priority.Normal);
scheduler.scheduleTask(() => console.log('Low priority'), Priority.Low);
```

## 7. 并发模式算法

### 7.1 实现useTransition

```typescript
// 题目: 手写useTransition Hook

let isPending = false;
let startTransitionCallback: (() => void) | null = null;

function useTransition() {
  const [pending, setPending] = useState(false);
  
  const startTransition = useCallback((callback: () => void) => {
    setPending(true);
    isPending = true;
    
    // 低优先级调度
    setTimeout(() => {
      callback();
      setPending(false);
      isPending = false;
    }, 0);
  }, []);
  
  return [pending, startTransition] as const;
}

// 使用示例
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 高优先级: 立即更新输入框
    setQuery(value);
    
    // 低优先级: 延迟更新搜索结果
    startTransition(() => {
      const filtered = searchData(value);
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results data={results} />
    </div>
  );
}
```

### 7.2 实现useDeferredValue

```typescript
// 题目: 手写useDeferredValue Hook

function useDeferredValue<T>(value: T, timeoutMs = 0): T {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferredValue(value);
    }, timeoutMs);
    
    return () => clearTimeout(timer);
  }, [value, timeoutMs]);
  
  return deferredValue;
}

// 使用示例
function ExpensiveList({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  
  const filteredList = useMemo(() => {
    // 耗时的过滤操作
    return largeList.filter(item => 
      item.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [deferredQuery]);
  
  return (
    <div>
      {filteredList.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

## 8. 缓存算法

### 8.1 实现LRU缓存

```typescript
// 题目: 实现LRU缓存用于组件缓存

class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // 移动到最新位置
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }
  
  set(key: K, value: V): void {
    // 如果已存在,删除旧的
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // 如果超过容量,删除最旧的
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // 添加新项
    this.cache.set(key, value);
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// React中使用LRU缓存
function useComponentCache<T>(capacity: number) {
  const cacheRef = useRef(new LRUCache<string, T>(capacity));
  
  const getCached = useCallback((key: string): T | undefined => {
    return cacheRef.current.get(key);
  }, []);
  
  const setCached = useCallback((key: string, value: T) => {
    cacheRef.current.set(key, value);
  }, []);
  
  return { getCached, setCached };
}

// 使用示例
function CachedImageGallery() {
  const { getCached, setCached } = useComponentCache<string>(20);
  
  const loadImage = async (url: string) => {
    const cached = getCached(url);
    if (cached) return cached;
    
    const image = await fetchImage(url);
    setCached(url, image);
    return image;
  };
  
  return <div>{/* 渲染图片 */}</div>;
}
```

### 8.2 实现记忆化搜索

```typescript
// 题目: 实现带缓存的深度搜索

function memoizedSearch<T>(
  data: T[],
  predicate: (item: T) => boolean,
  cache: Map<string, T[]> = new Map()
): T[] {
  const cacheKey = JSON.stringify(predicate.toString());
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  const results = data.filter(predicate);
  cache.set(cacheKey, results);
  
  return results;
}

// React Hook封装
function useMemorizedSearch<T>(data: T[]) {
  const cacheRef = useRef(new Map<string, T[]>());
  
  const search = useCallback((predicate: (item: T) => boolean) => {
    return memoizedSearch(data, predicate, cacheRef.current);
  }, [data]);
  
  return search;
}
```

## 9. 事件处理算法

### 9.1 实现事件委托

```typescript
// 题目: 实现React的合成事件系统

class SyntheticEventSystem {
  private listenerMap = new Map<string, Set<Function>>();
  
  constructor(private rootElement: HTMLElement) {
    this.setupDelegation();
  }
  
  private setupDelegation() {
    const eventTypes = ['click', 'input', 'change', 'submit'];
    
    eventTypes.forEach(type => {
      this.rootElement.addEventListener(type, (e) => {
        this.dispatchEvent(type, e);
      });
    });
  }
  
  addEventListener(element: HTMLElement, type: string, handler: Function) {
    const key = this.getKey(element, type);
    
    if (!this.listenerMap.has(key)) {
      this.listenerMap.set(key, new Set());
    }
    
    this.listenerMap.get(key)!.add(handler);
  }
  
  removeEventListener(element: HTMLElement, type: string, handler: Function) {
    const key = this.getKey(element, type);
    this.listenerMap.get(key)?.delete(handler);
  }
  
  private dispatchEvent(type: string, nativeEvent: Event) {
    let target = nativeEvent.target as HTMLElement;
    
    // 事件冒泡
    while (target && target !== this.rootElement) {
      const key = this.getKey(target, type);
      const listeners = this.listenerMap.get(key);
      
      if (listeners) {
        listeners.forEach(listener => {
          listener(this.createSyntheticEvent(nativeEvent));
        });
      }
      
      target = target.parentElement!;
    }
  }
  
  private createSyntheticEvent(nativeEvent: Event) {
    return {
      nativeEvent,
      type: nativeEvent.type,
      target: nativeEvent.target,
      currentTarget: nativeEvent.currentTarget,
      preventDefault: () => nativeEvent.preventDefault(),
      stopPropagation: () => nativeEvent.stopPropagation()
    };
  }
  
  private getKey(element: HTMLElement, type: string): string {
    return `${element}_${type}`;
  }
}
```

### 9.2 实现事件队列

```typescript
// 题目: 实现事件批处理队列

class EventBatcher {
  private queue: Array<() => void> = [];
  private isFlushing = false;
  
  batch(callback: () => void) {
    this.queue.push(callback);
    
    if (!this.isFlushing) {
      this.scheduleFlush();
    }
  }
  
  private scheduleFlush() {
    Promise.resolve().then(() => this.flush());
  }
  
  private flush() {
    this.isFlushing = true;
    
    // 合并相同的更新
    const callbacks = [...this.queue];
    this.queue = [];
    
    callbacks.forEach(cb => cb());
    
    this.isFlushing = false;
  }
}

// React中使用
const batcher = new EventBatcher();

function batchedSetState(setState: Function, value: any) {
  batcher.batch(() => setState(value));
}
```

## 10. 组件渲染算法

### 10.1 实现简单的JSX转换

```typescript
// 题目: 手写JSX到JavaScript的转换

function jsx(type: string, props: any, ...children: any[]) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text: string | number) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

// JSX编译示例
// <div className="container">
//   <h1>Hello</h1>
//   <p>World</p>
// </div>
//
// 编译为:
const element = jsx(
  'div',
  { className: 'container' },
  jsx('h1', null, 'Hello'),
  jsx('p', null, 'World')
);
```

### 10.2 实现Virtual DOM的创建

```typescript
// 题目: 创建Virtual DOM树

interface VNode {
  type: string;
  props: {
    [key: string]: any;
    children: VNode[];
  };
  key?: string | number;
}

function createElement(
  type: string,
  props: any = {},
  ...children: any[]
): VNode {
  return {
    type,
    props: {
      ...props,
      children: children.flat().map(child =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    },
    key: props?.key
  };
}

function createTextElement(text: string | number): VNode {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}
```

## 11. 状态更新算法

### 11.1 实现批量更新

```typescript
// 题目: 实现React的批量状态更新

class BatchedUpdates {
  private isBatching = false;
  private pendingUpdates: Set<() => void> = new Set();
  
  batchedUpdates(callback: () => void) {
    if (this.isBatching) {
      callback();
      return;
    }
    
    this.isBatching = true;
    
    try {
      callback();
    } finally {
      this.isBatching = false;
      this.flushUpdates();
    }
  }
  
  scheduleUpdate(update: () => void) {
    this.pendingUpdates.add(update);
    
    if (!this.isBatching) {
      this.flushUpdates();
    }
  }
  
  private flushUpdates() {
    const updates = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    
    updates.forEach(update => update());
  }
}

// React中的使用
const batcher = new BatchedUpdates();

function handleClick() {
  batcher.batchedUpdates(() => {
    setState1(value1);
    setState2(value2);
    setState3(value3);
  });
  // 只会触发一次重新渲染
}
```

### 11.2 实现状态队列

```typescript
// 题目: 实现useState的更新队列机制

interface Update<T> {
  action: T | ((prev: T) => T);
  next: Update<T> | null;
}

class UpdateQueue<T> {
  private pending: Update<T> | null = null;
  
  enqueueUpdate(action: T | ((prev: T) => T)) {
    const update: Update<T> = {
      action,
      next: null
    };
    
    if (this.pending === null) {
      // 第一个更新,指向自己形成环
      update.next = update;
      this.pending = update;
    } else {
      // 插入到环中
      update.next = this.pending.next;
      this.pending.next = update;
      this.pending = update;
    }
  }
  
  processUpdates(baseState: T): T {
    if (!this.pending) return baseState;
    
    let first = this.pending.next;
    let update = first;
    let newState = baseState;
    
    do {
      const action = update!.action;
      newState = typeof action === 'function'
        ? (action as Function)(newState)
        : action;
      
      update = update!.next;
    } while (update !== first);
    
    this.pending = null;
    return newState;
  }
}

// 使用示例
const queue = new UpdateQueue<number>();

queue.enqueueUpdate(1);
queue.enqueueUpdate(prev => prev + 1);
queue.enqueueUpdate(prev => prev * 2);

const result = queue.processUpdates(0);
console.log(result); // (0 + 1 + 1) * 2 = 4
```

## 12. 依赖追踪算法

### 12.1 实现响应式系统

```typescript
// 题目: 实现类似Vue的响应式系统

type Dep = Set<() => void>;
const targetMap = new WeakMap<any, Map<string, Dep>>();
let activeEffect: (() => void) | null = null;

function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key as string);
      return result;
    },
    
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key as string);
      return result;
    }
  });
}

function track(target: any, key: string) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  
  dep.add(activeEffect);
}

function trigger(target: any, key: string) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (!dep) return;
  
  dep.forEach(effect => effect());
}

function effect(fn: () => void) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 使用示例
const state = reactive({ count: 0 });

effect(() => {
  console.log('Count changed:', state.count);
});

state.count++; // 触发effect
```

### 12.2 实现依赖收集

```typescript
// 题目: 实现useMemo的依赖收集机制

class DependencyTracker {
  private dependencies = new Map<string, any[]>();
  
  track(key: string, deps: any[]) {
    this.dependencies.set(key, deps);
  }
  
  hasChanged(key: string, newDeps: any[]): boolean {
    const oldDeps = this.dependencies.get(key);
    
    if (!oldDeps) return true;
    if (oldDeps.length !== newDeps.length) return true;
    
    return newDeps.some((dep, i) => !Object.is(dep, oldDeps[i]));
  }
}

// 实现useMemo
const tracker = new DependencyTracker();
let memoIndex = 0;

function useMemo<T>(factory: () => T, deps: any[]): T {
  const key = `memo_${memoIndex++}`;
  
  if (tracker.hasChanged(key, deps)) {
    const value = factory();
    tracker.track(key, deps);
    return value;
  }
  
  // 返回缓存的值
  return factory();
}
```

## 13. 路由算法

### 13.1 实现简单路由匹配

```typescript
// 题目: 实现路由路径匹配算法

interface Route {
  path: string;
  component: any;
}

function matchPath(pathname: string, pattern: string): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathnameParts = pathname.split('/').filter(Boolean);
  
  if (patternParts.length !== pathnameParts.length) {
    return { match: false, params: {} };
  }
  
  const params: Record<string, string> = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathnamePart = pathnameParts[i];
    
    if (patternPart.startsWith(':')) {
      // 动态路由参数
      const paramName = patternPart.slice(1);
      params[paramName] = pathnamePart;
    } else if (patternPart !== pathnamePart) {
      return { match: false, params: {} };
    }
  }
  
  return { match: true, params };
}

// 测试
console.log(matchPath('/users/123', '/users/:id'));
// { match: true, params: { id: '123' } }

console.log(matchPath('/posts/abc/edit', '/posts/:id/edit'));
// { match: true, params: { id: 'abc' } }
```

### 13.2 实现嵌套路由

```typescript
// 题目: 实现嵌套路由解析

interface RouteConfig {
  path: string;
  component: any;
  children?: RouteConfig[];
}

function resolveNestedRoutes(routes: RouteConfig[], pathname: string): RouteConfig[] {
  const matched: RouteConfig[] = [];
  
  function traverse(routes: RouteConfig[], remainingPath: string) {
    for (const route of routes) {
      const { match, params } = matchPath(remainingPath, route.path);
      
      if (match) {
        matched.push({ ...route, params });
        
        if (route.children) {
          const consumedPath = route.path.split('/').filter(Boolean).length;
          const remaining = remainingPath.split('/').filter(Boolean).slice(consumedPath).join('/');
          
          if (remaining) {
            traverse(route.children, '/' + remaining);
          }
        }
        
        break;
      }
    }
  }
  
  traverse(routes, pathname);
  return matched;
}
```

## 14. 表单验证算法

### 14.1 实现表单验证规则引擎

```typescript
// 题目: 实现通用的表单验证系统

type ValidationRule<T> = (value: T) => string | null;

class FormValidator<T extends Record<string, any>> {
  private rules: Partial<Record<keyof T, ValidationRule<any>[]>> = {};
  
  addRule<K extends keyof T>(field: K, rule: ValidationRule<T[K]>) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field]!.push(rule);
  }
  
  validate(values: T): Record<keyof T, string | null> {
    const errors = {} as Record<keyof T, string | null>;
    
    for (const field in this.rules) {
      const fieldRules = this.rules[field]!;
      const value = values[field];
      
      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }
    
    return errors;
  }
}

// 预定义验证规则
const required = <T>(message = 'This field is required'): ValidationRule<T> => {
  return (value) => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  };
};

const minLength = (min: number, message?: string): ValidationRule<string> => {
  return (value) => {
    if (value.length < min) {
      return message || `Minimum length is ${min}`;
    }
    return null;
  };
};

const email = (message = 'Invalid email'): ValidationRule<string> => {
  return (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  };
};

// 使用
interface LoginForm {
  email: string;
  password: string;
}

const validator = new FormValidator<LoginForm>();
validator.addRule('email', required());
validator.addRule('email', email());
validator.addRule('password', required());
validator.addRule('password', minLength(6));

const errors = validator.validate({
  email: 'test@example.com',
  password: '123'
});
```

### 14.2 实现异步验证

```typescript
// 题目: 实现异步表单验证(如用户名唯一性检查)

type AsyncValidationRule<T> = (value: T) => Promise<string | null>;

class AsyncFormValidator<T extends Record<string, any>> {
  private rules: Partial<Record<keyof T, AsyncValidationRule<any>[]>> = {};
  
  addAsyncRule<K extends keyof T>(field: K, rule: AsyncValidationRule<T[K]>) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field]!.push(rule);
  }
  
  async validateAsync(values: T): Promise<Record<keyof T, string | null>> {
    const errors = {} as Record<keyof T, string | null>;
    
    const validationPromises = Object.keys(this.rules).map(async (field) => {
      const fieldRules = this.rules[field as keyof T]!;
      const value = values[field as keyof T];
      
      for (const rule of fieldRules) {
        const error = await rule(value);
        if (error) {
          errors[field as keyof T] = error;
          break;
        }
      }
    });
    
    await Promise.all(validationPromises);
    return errors;
  }
}

// 异步验证规则示例
const checkUsernameUnique = (): AsyncValidationRule<string> => {
  return async (username) => {
    // 模拟API调用
    const exists = await fetch(`/api/check-username?username=${username}`)
      .then(r => r.json());
    
    if (exists) {
      return 'Username already taken';
    }
    return null;
  };
};

// 使用
const asyncValidator = new AsyncFormValidator<{ username: string }>();
asyncValidator.addAsyncRule('username', checkUsernameUnique());
```

## 15. 虚拟滚动算法

### 15.1 实现固定高度虚拟滚动

```typescript
// 题目: 实现虚拟滚动列表

interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

class VirtualScroller {
  private scrollTop = 0;
  private config: VirtualScrollConfig;
  
  constructor(config: VirtualScrollConfig) {
    this.config = config;
  }
  
  getVisibleRange(totalItems: number): { start: number; end: number } {
    const { itemHeight, containerHeight, overscan } = this.config;
    
    const visibleStart = Math.floor(this.scrollTop / itemHeight);
    const visibleEnd = Math.ceil((this.scrollTop + containerHeight) / itemHeight);
    
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(totalItems, visibleEnd + overscan);
    
    return { start, end };
  }
  
  getOffsetForIndex(index: number): number {
    return index * this.config.itemHeight;
  }
  
  getTotalHeight(totalItems: number): number {
    return totalItems * this.config.itemHeight;
  }
  
  handleScroll(scrollTop: number) {
    this.scrollTop = scrollTop;
  }
}

// React Hook封装
function useVirtualScroll<T>(items: T[], config: VirtualScrollConfig) {
  const [scrollTop, setScrollTop] = useState(0);
  const scroller = useRef(new VirtualScroller(config));
  
  const { start, end } = scroller.current.getVisibleRange(items.length);
  const visibleItems = items.slice(start, end);
  
  const totalHeight = scroller.current.getTotalHeight(items.length);
  const offsetY = scroller.current.getOffsetForIndex(start);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    scroller.current.handleScroll(scrollTop);
    setScrollTop(scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    start,
    end
  };
}
```

### 15.2 实现动态高度虚拟滚动

```typescript
// 题目: 实现支持动态高度的虚拟滚动

class DynamicVirtualScroller {
  private itemHeights: Map<number, number> = new Map();
  private estimatedItemHeight: number;
  private containerHeight: number;
  
  constructor(estimatedItemHeight: number, containerHeight: number) {
    this.estimatedItemHeight = estimatedItemHeight;
    this.containerHeight = containerHeight;
  }
  
  setItemHeight(index: number, height: number) {
    this.itemHeights.set(index, height);
  }
  
  getItemHeight(index: number): number {
    return this.itemHeights.get(index) || this.estimatedItemHeight;
  }
  
  getOffsetForIndex(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += this.getItemHeight(i);
    }
    return offset;
  }
  
  getTotalHeight(totalItems: number): number {
    let height = 0;
    for (let i = 0; i < totalItems; i++) {
      height += this.getItemHeight(i);
    }
    return height;
  }
  
  getVisibleRange(scrollTop: number, totalItems: number): { start: number; end: number } {
    let start = 0;
    let end = 0;
    let currentOffset = 0;
    
    // 找到起始索引
    for (let i = 0; i < totalItems; i++) {
      const height = this.getItemHeight(i);
      if (currentOffset + height > scrollTop) {
        start = i;
        break;
      }
      currentOffset += height;
    }
    
    // 找到结束索引
    currentOffset = this.getOffsetForIndex(start);
    for (let i = start; i < totalItems; i++) {
      currentOffset += this.getItemHeight(i);
      if (currentOffset > scrollTop + this.containerHeight) {
        end = i + 1;
        break;
      }
    }
    
    if (end === 0) end = totalItems;
    
    return { start, end };
  }
}
```

## 16. 拖拽算法

### 16.1 实现拖拽排序

```typescript
// 题目: 实现列表拖拽排序算法

interface DragItem {
  id: string;
  index: number;
}

class DragSortManager {
  private items: any[];
  private draggedItem: DragItem | null = null;
  
  constructor(items: any[]) {
    this.items = items;
  }
  
  handleDragStart(index: number) {
    this.draggedItem = {
      id: this.items[index].id,
      index
    };
  }
  
  handleDragOver(hoverIndex: number): any[] {
    if (!this.draggedItem || this.draggedItem.index === hoverIndex) {
      return this.items;
    }
    
    const newItems = [...this.items];
    const draggedIndex = this.draggedItem.index;
    
    // 移除拖拽项
    const [removed] = newItems.splice(draggedIndex, 1);
    
    // 插入到新位置
    newItems.splice(hoverIndex, 0, removed);
    
    // 更新拖拽项索引
    this.draggedItem.index = hoverIndex;
    this.items = newItems;
    
    return newItems;
  }
  
  handleDragEnd(): any[] {
    this.draggedItem = null;
    return this.items;
  }
}

// React Hook封装
function useDragSort<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState(initialItems);
  const managerRef = useRef(new DragSortManager(items));
  
  const handleDragStart = useCallback((index: number) => {
    managerRef.current.handleDragStart(index);
  }, []);
  
  const handleDragOver = useCallback((index: number) => {
    const newItems = managerRef.current.handleDragOver(index);
    setItems(newItems);
  }, []);
  
  const handleDragEnd = useCallback(() => {
    const finalItems = managerRef.current.handleDragEnd();
    setItems(finalItems);
  }, []);
  
  return {
    items,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
}
```

## 17. 搜索算法

### 17.1 实现模糊搜索

```typescript
// 题目: 实现高效的模糊搜索算法

function fuzzySearch(query: string, items: string[]): string[] {
  if (!query) return items;
  
  const queryLower = query.toLowerCase();
  
  return items
    .map(item => ({
      item,
      score: calculateScore(queryLower, item.toLowerCase())
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item);
}

function calculateScore(query: string, target: string): number {
  if (target.includes(query)) {
    // 完全匹配得分最高
    return 100;
  }
  
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < target.length; i++) {
    if (queryIndex < query.length && target[i] === query[queryIndex]) {
      score += 10 + consecutiveMatches * 5;
      queryIndex++;
      consecutiveMatches++;
    } else {
      consecutiveMatches = 0;
    }
  }
  
  // 所有字符都匹配
  if (queryIndex === query.length) {
    return score;
  }
  
  return 0;
}

// React Hook封装
function useFuzzySearch<T>(items: T[], getSearchText: (item: T) => string) {
  const [query, setQuery] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!query) return items;
    
    const searchTexts = items.map(getSearchText);
    const indices = fuzzySearch(query, searchTexts);
    
    return indices
      .map(text => items[searchTexts.indexOf(text)])
      .filter(Boolean);
  }, [items, query, getSearchText]);
  
  return { query, setQuery, filteredItems };
}
```

### 17.2 实现高亮匹配

```typescript
// 题目: 实现搜索结果高亮

function highlightMatches(text: string, query: string): React.ReactNode[] {
  if (!query) return [text];
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  let index = textLower.indexOf(queryLower);
  
  while (index !== -1) {
    // 添加匹配前的文本
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    
    // 添加高亮的匹配文本
    parts.push(
      <mark key={index}>{text.slice(index, index + query.length)}</mark>
    );
    
    lastIndex = index + query.length;
    index = textLower.indexOf(queryLower, lastIndex);
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}
```

## 18. 图算法应用

### 18.1 实现组件依赖图

```typescript
// 题目: 分析React组件的依赖关系

interface ComponentNode {
  name: string;
  dependencies: string[];
}

class DependencyGraph {
  private graph = new Map<string, Set<string>>();
  
  addNode(name: string) {
    if (!this.graph.has(name)) {
      this.graph.set(name, new Set());
    }
  }
  
  addEdge(from: string, to: string) {
    this.addNode(from);
    this.addNode(to);
    this.graph.get(from)!.add(to);
  }
  
  // 检测循环依赖
  hasCycle(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      
      const neighbors = this.graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true; // 发现循环
        }
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const node of this.graph.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return true;
      }
    }
    
    return false;
  }
  
  // 拓扑排序(组件加载顺序)
  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const result: string[] = [];
    
    // 初始化入度
    for (const node of this.graph.keys()) {
      inDegree.set(node, 0);
    }
    
    for (const neighbors of this.graph.values()) {
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
      }
    }
    
    // 找到所有入度为0的节点
    const queue: string[] = [];
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }
    
    // BFS
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      
      const neighbors = this.graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1;
        inDegree.set(neighbor, degree);
        
        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }
    
    return result;
  }
}

// 使用示例
const graph = new DependencyGraph();
graph.addEdge('App', 'Header');
graph.addEdge('App', 'Content');
graph.addEdge('Header', 'Logo');
graph.addEdge('Content', 'Sidebar');

console.log('Has cycle:', graph.hasCycle());
console.log('Load order:', graph.topologicalSort());
```

## 19. 动态规划应用

### 19.1 实现记忆化递归

```typescript
// 题目: 使用记忆化优化React组件渲染

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// 应用: 计算斐波那契数列(组件渲染次数优化的类比)
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

### 19.2 实现最优子结构

```typescript
// 题目: 优化组件树的渲染路径

function findOptimalRenderPath(
  components: string[],
  costs: number[][],
  target: string
): string[] {
  const n = components.length;
  const dp: number[] = new Array(n).fill(Infinity);
  const path: number[] = new Array(n).fill(-1);
  
  dp[0] = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const cost = dp[i] + costs[i][j];
      if (cost < dp[j]) {
        dp[j] = cost;
        path[j] = i;
      }
    }
  }
  
  // 重建路径
  const result: string[] = [];
  let current = components.indexOf(target);
  
  while (current !== -1) {
    result.unshift(components[current]);
    current = path[current];
  }
  
  return result;
}
```

## 20. 总结与面试技巧

### 20.1 算法题解题框架

```typescript
const algorithmApproach = {
  步骤1_理解题意: {
    要点: ['明确输入输出', '理解约束条件', '找出边界情况'],
    示例: '实现虚拟滚动 -> 输入: 大量数据 输出: 可见项 约束: 性能'
  },
  
  步骤2_分析复杂度: {
    时间复杂度: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
    空间复杂度: ['考虑缓存占用', '内存泄漏风险'],
    示例: '虚拟滚动 时间O(1) 空间O(可见项数)'
  },
  
  步骤3_选择数据结构: {
    常用: ['数组', 'Map', 'Set', '链表', '树', '图'],
    React相关: ['Fiber链表', 'Hook链表', '更新队列'],
    示例: '虚拟滚动使用数组切片'
  },
  
  步骤4_编码实现: {
    原则: ['从简单开始', '逐步完善', '保持清晰'],
    技巧: ['变量命名', '函数拆分', '添加注释']
  },
  
  步骤5_测试验证: {
    用例: ['正常情况', '边界情况', '异常情况'],
    示例: ['空数组', '单项', '大量数据']
  },
  
  步骤6_优化改进: {
    方向: ['时间优化', '空间优化', '代码优化'],
    技巧: ['缓存', '剪枝', '提前返回']
  }
};
```

### 20.2 React特色算法汇总

```typescript
const reactAlgorithms = {
  核心算法: {
    Diff算法: '比较Virtual DOM,最小化DOM操作',
    Fiber调度: '时间切片,优先级调度,可中断渲染',
    Hooks实现: '链表存储,闭包保持状态',
    事件系统: '事件委托,合成事件,批处理'
  },
  
  性能优化算法: {
    记忆化: 'useMemo缓存计算结果',
    防抖节流: '优化高频事件',
    虚拟滚动: '只渲染可见项',
    懒加载: '代码分割,按需加载'
  },
  
  状态管理算法: {
    更新队列: '批量更新,合并操作',
    依赖追踪: '响应式系统',
    选择器: '精确订阅,避免重渲染'
  },
  
  实用算法: {
    路由匹配: '动态路由,嵌套路由',
    表单验证: '规则引擎,异步验证',
    搜索: '模糊匹配,高亮显示',
    拖拽: '排序算法,位置计算'
  }
};
```

### 20.3 常见面试场景

```typescript
const interviewScenarios = [
  {
    场景: '手写Virtual DOM Diff',
    考点: ['算法理解', 'key的作用', '优化策略'],
    准备: '理解三种Diff策略,练习编码实现'
  },
  {
    场景: '实现自定义Hook',
    考点: ['Hooks规则', '闭包理解', '副作用处理'],
    准备: '常用Hook实现,useDebounce/useThrottle等'
  },
  {
    场景: '优化列表性能',
    考点: ['虚拟滚动', 'React.memo', 'key优化'],
    准备: '虚拟滚动原理,性能分析工具'
  },
  {
    场景: '实现状态管理',
    考点: ['发布订阅', '不可变数据', '性能优化'],
    准备: '手写简易Redux/Zustand'
  },
  {
    场景: '实现路由系统',
    考点: ['路由匹配', 'History API', '嵌套路由'],
    准备: '路由算法,浏览器API'
  }
];
```

### 20.4 面试答题模板

```typescript
const answerTemplate = {
  第一步_复述题目: '我理解的题目是..., 需要实现..., 有以下约束...',
  
  第二步_分析思路: `
    这个问题可以分解为几个部分:
    1. 数据结构选择: 使用X因为...
    2. 算法选择: 采用Y因为...
    3. 复杂度分析: 时间O(n), 空间O(1)
  `,
  
  第三步_编码实现: `
    function solution() {
      // 1. 初始化
      // 2. 处理逻辑
      // 3. 返回结果
    }
  `,
  
  第四步_测试用例: `
    测试正常情况: ...
    测试边界: ...
    测试异常: ...
  `,
  
  第五步_优化讨论: `
    当前方案的优点: ...
    可以改进的地方: ...
    其他可选方案: ...
  `
};
```

## 21. 面试真题精选

### 21.1 字节跳动真题

```typescript
/*
 * 题目: 实现一个高性能的无限滚动列表
 * 要求:
 * 1. 支持10w+数据
 * 2. 滚动流畅60fps
 * 3. 支持动态高度
 * 4. 支持数据更新
 */

class InfiniteScrollList {
  private items: any[];
  private itemHeights: number[];
  private scrollTop = 0;
  private containerHeight: number;
  private estimatedHeight: number;
  
  constructor(items: any[], containerHeight: number, estimatedHeight = 50) {
    this.items = items;
    this.containerHeight = containerHeight;
    this.estimatedHeight = estimatedHeight;
    this.itemHeights = new Array(items.length).fill(estimatedHeight);
  }
  
  // ... 实现细节
}
```

### 21.2 腾讯真题

```typescript
/*
 * 题目: 实现React Fiber的简化版调度器
 * 要求:
 * 1. 支持时间切片
 * 2. 支持优先级
 * 3. 支持中断和恢复
 */

// 答案见前面Fiber调度算法部分
```

### 21.3 阿里真题

```typescript
/*
 * 题目: 设计一个表单验证系统
 * 要求:
 * 1. 支持同步/异步验证
 * 2. 支持字段依赖
 * 3. 性能优化(防抖)
 * 4. 良好的API设计
 */

// 答案见前面表单验证算法部分
```

## 22. 总结

React算法题的核心要点:

1. **Diff算法**: Virtual DOM比较,列表diff,key的作用
2. **树遍历**: DFS/BFS,组件树遍历,依赖图
3. **Hooks**: 手写实现useState/useEffect/useMemo等
4. **Fiber**: 时间切片,优先级调度,可中断渲染
5. **并发**: useTransition,useDeferredValue实现
6. **性能**: 防抖节流,虚拟滚动,缓存算法
7. **状态管理**: 更新队列,批量更新,依赖追踪
8. **事件系统**: 事件委托,合成事件,批处理
9. **路由**: 路径匹配,嵌套路由解析
10. **表单**: 验证引擎,异步验证,依赖验证
11. **搜索**: 模糊匹配,高亮显示,性能优化
12. **拖拽**: 排序算法,位置计算,碰撞检测
13. **图算法**: 依赖分析,循环检测,拓扑排序
14. **动态规划**: 记忆化,最优子结构
15. **数据结构**: 链表(Fiber/Hooks),队列(更新),树(组件)

掌握这些算法有助于深入理解React原理,在面试中脱颖而出。

