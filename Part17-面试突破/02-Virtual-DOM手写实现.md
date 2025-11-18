# Virtual DOM手写实现 - 从零构建React核心

## 1. 项目结构设计

### 1.1 整体架构

```typescript
const architecture = {
  core: {
    createElement: '创建Virtual DOM',
    render: '渲染Virtual DOM到真实DOM',
    diff: '比较新旧Virtual DOM',
    patch: '更新真实DOM'
  },
  
  advanced: {
    component: '组件系统',
    hooks: 'Hooks实现',
    event: '事件系统',
    reconciliation: '协调算法'
  },
  
  fileStructure: `
    mini-react/
    ├── src/
    │   ├── createElement.ts    # 创建VDOM
    │   ├── render.ts           # 渲染
    │   ├── diff.ts             # Diff算法
    │   ├── patch.ts            # 打补丁
    │   ├── component.ts        # 组件
    │   ├── hooks.ts            # Hooks
    │   └── index.ts            # 导出
    ├── examples/               # 示例
    └── package.json
  `
};
```

### 1.2 类型定义

```typescript
// src/types.ts

// Virtual DOM节点类型
export type VNodeType = string | Function;

// Virtual DOM节点
export interface VNode {
  type: VNodeType;
  props: VNodeProps;
  key?: string | number;
  children: VNodeChild[];
}

// 节点属性
export interface VNodeProps {
  [key: string]: any;
  children?: VNodeChild[];
}

// 子节点类型
export type VNodeChild = VNode | string | number | boolean | null | undefined;

// 组件实例
export interface ComponentInstance {
  vnode: VNode;
  component: Function;
  props: any;
  state: any;
  hooks: Hook[];
  hookIndex: number;
}

// Hook
export interface Hook {
  state: any;
  queue: any[];
}

// Fiber节点
export interface Fiber {
  type: VNodeType;
  props: VNodeProps;
  dom: HTMLElement | Text | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION';
  hooks?: Hook[];
  hookIndex?: number;
}
```

## 2. createElement实现

### 2.1 基础版本

```typescript
// src/createElement.ts

/**
 * 创建Virtual DOM元素
 */
export function createElement(
  type: VNodeType,
  props: VNodeProps | null,
  ...children: VNodeChild[]
): VNode {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => 
        typeof child === 'object' ? child : createTextElement(child)
      )
    },
    key: props?.key
  };
}

/**
 * 创建文本节点
 */
function createTextElement(text: string | number): VNode {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

// 使用示例
const vnode = createElement(
  'div',
  { className: 'container' },
  createElement('h1', null, 'Hello'),
  createElement('p', null, 'World')
);

// 生成的VDOM结构
const result = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: {
          children: [
            { type: 'TEXT_ELEMENT', props: { nodeValue: 'Hello', children: [] } }
          ]
        }
      },
      {
        type: 'p',
        props: {
          children: [
            { type: 'TEXT_ELEMENT', props: { nodeValue: 'World', children: [] } }
          ]
        }
      }
    ]
  }
};
```

### 2.2 支持JSX

```typescript
// 配置Babel
// .babelrc
{
  "plugins": [
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "createElement",
      "pragmaFrag": "Fragment"
    }]
  ]
}

// JSX代码
const element = (
  <div className="container">
    <h1>Hello</h1>
    <p>World</p>
  </div>
);

// 编译后
const element = createElement(
  'div',
  { className: 'container' },
  createElement('h1', null, 'Hello'),
  createElement('p', null, 'World')
);
```

### 2.3 Fragment支持

```typescript
// Fragment组件
export const Fragment = Symbol.for('react.fragment');

export function createElement(
  type: VNodeType,
  props: VNodeProps | null,
  ...children: VNodeChild[]
): VNode {
  // Fragment特殊处理
  if (type === Fragment) {
    return {
      type: Fragment,
      props: {
        children: children.flat()
      }
    };
  }
  
  return {
    type,
    props: {
      ...props,
      children: children.flat().map(child => 
        typeof child === 'object' ? child : createTextElement(child)
      )
    },
    key: props?.key
  };
}

// 使用
const element = (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);
```

## 3. render初次渲染实现

### 3.1 创建DOM节点

```typescript
// src/render.ts

/**
 * 创建真实DOM节点
 */
function createDOM(vnode: VNode): HTMLElement | Text {
  // 文本节点
  if (vnode.type === 'TEXT_ELEMENT') {
    return document.createTextNode(vnode.props.nodeValue as string);
  }
  
  // 普通元素
  const dom = document.createElement(vnode.type as string);
  
  // 设置属性
  updateDOM(dom, {}, vnode.props);
  
  return dom;
}

/**
 * 更新DOM属性
 */
function updateDOM(
  dom: HTMLElement | Text,
  prevProps: VNodeProps,
  nextProps: VNodeProps
) {
  // 移除旧属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      (dom as any)[name] = '';
    });
  
  // 移除旧事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(isGone(prevProps, nextProps) || isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  
  // 添加新属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      (dom as any)[name] = nextProps[name];
    });
  
  // 添加新事件监听
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

// 辅助函数
const isEvent = (key: string) => key.startsWith('on');
const isProperty = (key: string) => key !== 'children' && !isEvent(key);
const isNew = (prev: VNodeProps, next: VNodeProps) => 
  (key: string) => prev[key] !== next[key];
const isGone = (prev: VNodeProps, next: VNodeProps) => 
  (key: string) => !(key in next);
```

### 3.2 递归渲染

```typescript
/**
 * 渲染Virtual DOM到容器
 */
export function render(vnode: VNode, container: HTMLElement) {
  // 创建DOM
  const dom = createDOM(vnode);
  
  // 递归渲染子节点
  vnode.props.children.forEach(child => {
    render(child, dom as HTMLElement);
  });
  
  // 添加到容器
  container.appendChild(dom);
}

// 使用
const vnode = createElement(
  'div',
  { className: 'app' },
  createElement('h1', null, 'Hello World')
);

render(vnode, document.getElementById('root')!);
```

## 4. Diff算法实现

### 4.1 Diff函数

```typescript
// src/diff.ts

export type PatchType = 
  | 'CREATE'    // 创建新节点
  | 'REMOVE'    // 删除节点
  | 'REPLACE'   // 替换节点
  | 'UPDATE'    // 更新属性
  | 'TEXT';     // 更新文本

export interface Patch {
  type: PatchType;
  vnode?: VNode;
  props?: VNodeProps;
  text?: string;
}

/**
 * 比较新旧Virtual DOM
 */
export function diff(
  oldVNode: VNode | null,
  newVNode: VNode | null
): Patch | null {
  // 新增节点
  if (!oldVNode) {
    return { type: 'CREATE', vnode: newVNode! };
  }
  
  // 删除节点
  if (!newVNode) {
    return { type: 'REMOVE' };
  }
  
  // 替换节点(类型不同)
  if (oldVNode.type !== newVNode.type) {
    return { type: 'REPLACE', vnode: newVNode };
  }
  
  // 文本节点更新
  if (newVNode.type === 'TEXT_ELEMENT') {
    if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
      return { 
        type: 'TEXT', 
        text: newVNode.props.nodeValue as string 
      };
    }
    return null;
  }
  
  // 属性更新
  if (propsChanged(oldVNode.props, newVNode.props)) {
    return { type: 'UPDATE', props: newVNode.props };
  }
  
  return null;
}

/**
 * 检查属性是否变化
 */
function propsChanged(
  oldProps: VNodeProps,
  newProps: VNodeProps
): boolean {
  const oldKeys = Object.keys(oldProps).filter(k => k !== 'children');
  const newKeys = Object.keys(newProps).filter(k => k !== 'children');
  
  // 属性数量不同
  if (oldKeys.length !== newKeys.length) {
    return true;
  }
  
  // 属性值不同
  return oldKeys.some(key => oldProps[key] !== newProps[key]);
}
```

### 4.2 Diff子节点

```typescript
/**
 * Diff子节点列表
 */
export function diffChildren(
  oldChildren: VNode[],
  newChildren: VNode[]
): Map<number, Patch> {
  const patches = new Map<number, Patch>();
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  
  for (let i = 0; i < maxLength; i++) {
    const patch = diff(oldChildren[i], newChildren[i]);
    if (patch) {
      patches.set(i, patch);
    }
  }
  
  return patches;
}
```

### 4.3 带Key的Diff

```typescript
/**
 * 使用key进行Diff
 */
export function diffWithKeys(
  oldChildren: VNode[],
  newChildren: VNode[]
): Patch[] {
  const patches: Patch[] = [];
  
  // 构建旧节点的key映射
  const oldKeyMap = new Map<string | number, VNode>();
  oldChildren.forEach(child => {
    if (child.key != null) {
      oldKeyMap.set(child.key, child);
    }
  });
  
  // 遍历新节点
  newChildren.forEach((newChild, index) => {
    if (newChild.key != null) {
      const oldChild = oldKeyMap.get(newChild.key);
      
      if (oldChild) {
        // 找到相同key的节点,比较
        const patch = diff(oldChild, newChild);
        if (patch) {
          patches.push({ ...patch, index });
        }
        oldKeyMap.delete(newChild.key);
      } else {
        // 新节点
        patches.push({ 
          type: 'CREATE', 
          vnode: newChild,
          index 
        });
      }
    }
  });
  
  // 删除剩余的旧节点
  oldKeyMap.forEach(oldChild => {
    patches.push({ type: 'REMOVE', vnode: oldChild });
  });
  
  return patches;
}
```

## 5. Patch更新DOM实现

### 5.1 应用补丁

```typescript
// src/patch.ts

/**
 * 应用补丁更新DOM
 */
export function patch(
  parent: HTMLElement,
  dom: HTMLElement | Text | null,
  patches: Patch,
  index: number = 0
): HTMLElement | Text | null {
  switch (patches.type) {
    case 'CREATE':
      const newDom = createDOM(patches.vnode!);
      parent.appendChild(newDom);
      return newDom;
    
    case 'REMOVE':
      if (dom) {
        parent.removeChild(dom);
      }
      return null;
    
    case 'REPLACE':
      const replaceDom = createDOM(patches.vnode!);
      if (dom) {
        parent.replaceChild(replaceDom, dom);
      }
      return replaceDom;
    
    case 'UPDATE':
      if (dom) {
        updateDOM(
          dom,
          (dom as any)._vnode?.props || {},
          patches.props!
        );
        (dom as any)._vnode = patches.vnode;
      }
      return dom;
    
    case 'TEXT':
      if (dom && dom.nodeType === Node.TEXT_NODE) {
        dom.textContent = patches.text!;
      }
      return dom;
    
    default:
      return dom;
  }
}
```

### 5.2 批量更新

```typescript
/**
 * 批量应用补丁
 */
export function patchAll(
  parent: HTMLElement,
  oldVNode: VNode,
  newVNode: VNode
) {
  // Diff根节点
  const rootPatch = diff(oldVNode, newVNode);
  const dom = parent.firstChild as HTMLElement;
  
  if (rootPatch) {
    patch(parent, dom, rootPatch);
  }
  
  // Diff子节点
  const oldChildren = oldVNode.props.children || [];
  const newChildren = newVNode.props.children || [];
  const childPatches = diffChildren(oldChildren, newChildren);
  
  // 应用子节点补丁
  childPatches.forEach((childPatch, index) => {
    const childDom = dom?.childNodes[index] as HTMLElement;
    patch(dom, childDom, childPatch, index);
  });
}
```

## 6. Fiber架构实现

### 6.1 Fiber数据结构

```typescript
// src/fiber.ts

/**
 * 创建Fiber节点
 */
function createFiber(vnode: VNode, parent: Fiber | null): Fiber {
  return {
    type: vnode.type,
    props: vnode.props,
    dom: null,
    parent,
    child: null,
    sibling: null,
    alternate: null,
    effectTag: undefined,
    hooks: [],
    hookIndex: 0
  };
}
```

### 6.2 工作循环

```typescript
// 当前工作单元
let workInProgressRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let nextUnitOfWork: Fiber | null = null;
let deletions: Fiber[] = [];

/**
 * 调度工作
 */
export function scheduleWork(fiber: Fiber) {
  workInProgressRoot = {
    dom: currentRoot?.dom || null,
    props: fiber.props,
    alternate: currentRoot,
    type: fiber.type,
    parent: null,
    child: null,
    sibling: null
  };
  
  deletions = [];
  nextUnitOfWork = workInProgressRoot;
}

/**
 * 工作循环
 */
function workLoop(deadline: IdleDeadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  // 所有工作完成,提交
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }
  
  requestIdleCallback(workLoop);
}

// 启动工作循环
requestIdleCallback(workLoop);
```

### 6.3 执行工作单元

```typescript
/**
 * 执行一个工作单元
 */
function performUnitOfWork(fiber: Fiber): Fiber | null {
  // 1. 创建/更新DOM
  if (!fiber.dom) {
    fiber.dom = createDOM({
      type: fiber.type,
      props: fiber.props,
      key: fiber.props.key
    } as VNode);
  }
  
  // 2. 协调子节点
  reconcileChildren(fiber, fiber.props.children || []);
  
  // 3. 返回下一个工作单元
  // 优先级: child > sibling > uncle
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  
  return null;
}
```

### 6.4 协调子节点

```typescript
/**
 * 协调子节点
 */
function reconcileChildren(fiber: Fiber, children: VNodeChild[]) {
  let index = 0;
  let oldFiber = fiber.alternate?.child || null;
  let prevSibling: Fiber | null = null;
  
  while (index < children.length || oldFiber != null) {
    const child = children[index];
    let newFiber: Fiber | null = null;
    
    // 比较新旧fiber
    const sameType = oldFiber && child && oldFiber.type === (child as VNode).type;
    
    if (sameType) {
      // 更新
      newFiber = {
        type: oldFiber!.type,
        props: (child as VNode).props,
        dom: oldFiber!.dom,
        parent: fiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        child: null,
        sibling: null
      };
    }
    
    if (child && !sameType) {
      // 新增
      newFiber = {
        type: (child as VNode).type,
        props: (child as VNode).props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: 'PLACEMENT',
        child: null,
        sibling: null
      };
    }
    
    if (oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }
    
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    // 构建fiber树
    if (index === 0) {
      fiber.child = newFiber;
    } else if (child && prevSibling) {
      prevSibling.sibling = newFiber;
    }
    
    prevSibling = newFiber;
    index++;
  }
}
```

### 6.5 提交阶段

```typescript
/**
 * 提交更新
 */
function commitRoot() {
  // 删除节点
  deletions.forEach(commitWork);
  
  // 更新/新增节点
  commitWork(workInProgressRoot!.child);
  
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}

/**
 * 提交工作
 */
function commitWork(fiber: Fiber | null) {
  if (!fiber) {
    return;
  }
  
  // 找到有DOM的父节点
  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber!.parent;
  }
  const domParent = domParentFiber.dom;
  
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDOM(
      fiber.dom,
      fiber.alternate?.props || {},
      fiber.props
    );
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }
  
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * 提交删除
 */
function commitDeletion(fiber: Fiber, domParent: HTMLElement | Text) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child!, domParent);
  }
}
```

## 7. 组件系统实现

### 7.1 函数组件

```typescript
// src/component.ts

/**
 * 处理函数组件
 */
function updateFunctionComponent(fiber: Fiber) {
  // 保存当前fiber用于hooks
  currentFunctionFiber = fiber;
  currentFunctionFiber.hooks = [];
  currentFunctionFiber.hookIndex = 0;
  
  // 执行函数组件获取children
  const children = [(fiber.type as Function)(fiber.props)];
  
  reconcileChildren(fiber, children);
}

// 修改performUnitOfWork
function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = typeof fiber.type === 'function';
  
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  
  // ... 返回下一个工作单元
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDOM({
      type: fiber.type,
      props: fiber.props
    } as VNode);
  }
  reconcileChildren(fiber, fiber.props.children || []);
}
```

### 7.2 类组件

```typescript
/**
 * 基础组件类
 */
export class Component {
  props: any;
  state: any;
  
  constructor(props: any) {
    this.props = props;
    this.state = {};
  }
  
  setState(partialState: any) {
    this.state = { ...this.state, ...partialState };
    // 触发重新渲染
    scheduleUpdate(this);
  }
  
  render(): VNode {
    throw new Error('Component must implement render method');
  }
}

/**
 * 处理类组件
 */
function updateClassComponent(fiber: Fiber) {
  let instance = fiber.alternate?.instance;
  
  if (!instance) {
    // 创建实例
    instance = new (fiber.type as any)(fiber.props);
    fiber.instance = instance;
  } else {
    // 更新props
    instance.props = fiber.props;
  }
  
  // 获取children
  const children = [instance.render()];
  reconcileChildren(fiber, children);
}
```

## 8. Hooks实现

### 8.1 useState

```typescript
// src/hooks.ts

let currentFunctionFiber: Fiber | null = null;

/**
 * useState实现
 */
export function useState<T>(initial: T): [T, (value: T) => void] {
  const oldHook = currentFunctionFiber?.alternate?.hooks?.[
    currentFunctionFiber.hookIndex!
  ];
  
  const hook: Hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };
  
  // 执行队列中的更新
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = action(hook.state);
  });
  
  const setState = (value: T) => {
    hook.queue.push((state: T) => value);
    
    // 触发重新渲染
    scheduleWork({
      ...currentFunctionFiber!,
      alternate: currentFunctionFiber!
    });
  };
  
  currentFunctionFiber!.hooks!.push(hook);
  currentFunctionFiber!.hookIndex!++;
  
  return [hook.state, setState];
}
```

### 8.2 useEffect

```typescript
interface EffectHook extends Hook {
  deps?: any[];
  cleanup?: () => void;
}

/**
 * useEffect实现
 */
export function useEffect(
  callback: () => void | (() => void),
  deps?: any[]
) {
  const oldHook = currentFunctionFiber?.alternate?.hooks?.[
    currentFunctionFiber.hookIndex!
  ] as EffectHook | undefined;
  
  const hasChanged = !oldHook || !deps || deps.some((dep, i) => 
    dep !== oldHook.deps?.[i]
  );
  
  const hook: EffectHook = {
    state: null,
    queue: [],
    deps,
    cleanup: oldHook?.cleanup
  };
  
  if (hasChanged) {
    // 在提交阶段执行effect
    Promise.resolve().then(() => {
      // 执行清理函数
      if (hook.cleanup) {
        hook.cleanup();
      }
      
      // 执行effect
      const cleanup = callback();
      if (typeof cleanup === 'function') {
        hook.cleanup = cleanup;
      }
    });
  }
  
  currentFunctionFiber!.hooks!.push(hook);
  currentFunctionFiber!.hookIndex!++;
}
```

### 8.3 useReducer

```typescript
/**
 * useReducer实现
 */
export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, (action: A) => void] {
  const oldHook = currentFunctionFiber?.alternate?.hooks?.[
    currentFunctionFiber.hookIndex!
  ];
  
  const hook: Hook = {
    state: oldHook ? oldHook.state : initialState,
    queue: []
  };
  
  // 执行队列中的action
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = reducer(hook.state, action);
  });
  
  const dispatch = (action: A) => {
    hook.queue.push(action);
    
    scheduleWork({
      ...currentFunctionFiber!,
      alternate: currentFunctionFiber!
    });
  };
  
  currentFunctionFiber!.hooks!.push(hook);
  currentFunctionFiber!.hookIndex!++;
  
  return [hook.state, dispatch];
}
```

## 9. 完整示例

### 9.1 使用示例

```tsx
// examples/counter.tsx
import { createElement, render, useState } from '../src';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');
  
  return (
    <div className="counter">
      <h1>{name} Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <input
        value={name}
        onInput={(e) => setName(e.target.value)}
      />
    </div>
  );
}

const root = document.getElementById('root');
render(<Counter />, root);
```

### 9.2 TodoList示例

```tsx
// examples/todolist.tsx
import { createElement, render, useState } from '../src';

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build App', done: false }
  ]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: input, done: false }
      ]);
      setInput('');
    }
  };
  
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };
  
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div className="todo-app">
      <h1>Todo List</h1>
      
      <div className="input-group">
        <input
          value={input}
          onInput={(e) => setInput(e.target.value)}
          placeholder="Enter todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

render(<TodoList />, document.getElementById('root'));
```

## 10. 性能优化

### 10.1 批量更新

```typescript
// 批量更新队列
let updateQueue: Fiber[] = [];
let isUpdating = false;

function scheduleUpdate(fiber: Fiber) {
  updateQueue.push(fiber);
  
  if (!isUpdating) {
    isUpdating = true;
    Promise.resolve().then(flushUpdates);
  }
}

function flushUpdates() {
  const updates = [...updateQueue];
  updateQueue = [];
  
  updates.forEach(fiber => {
    scheduleWork(fiber);
  });
  
  isUpdating = false;
}
```

### 10.2 优先级调度

```typescript
// 优先级常量
const ImmediatePriority = 1;
const UserBlockingPriority = 2;
const NormalPriority = 3;
const LowPriority = 4;
const IdlePriority = 5;

function scheduleCallback(priority: number, callback: Function) {
  const currentTime = performance.now();
  
  const task = {
    callback,
    priority,
    startTime: currentTime,
    expirationTime: currentTime + priorityToTimeout(priority)
  };
  
  // 插入任务队列
  taskQueue.push(task);
  taskQueue.sort((a, b) => a.expirationTime - b.expirationTime);
  
  requestIdleCallback(flushWork);
}
```

## 11. 面试要点总结

```typescript
const interviewPoints = {
  核心概念: [
    'Virtual DOM是JS对象',
    'createElement创建VDOM',
    'Diff算法比较新旧VDOM',
    'Patch更新真实DOM'
  ],
  
  Diff策略: [
    '同层比较',
    '类型判断',
    'key优化'
  ],
  
  Fiber架构: [
    '可中断的渲染',
    '链表结构',
    '双缓冲技术',
    '优先级调度'
  ],
  
  Hooks原理: [
    'fiber.hooks数组',
    'hookIndex索引',
    '闭包保存状态',
    '队列更新'
  ],
  
  性能优化: [
    '批量更新',
    '时间切片',
    '优先级调度',
    'shouldComponentUpdate'
  ]
};
```

## 12. 总结

手写Virtual DOM的核心要点:

1. **createElement**: 创建VDOM树
2. **render**: 首次渲染到DOM
3. **diff**: 比较新旧VDOM
4. **patch**: 应用补丁更新DOM
5. **Fiber**: 可中断渲染架构
6. **Hooks**: 状态管理机制
7. **批量更新**: 性能优化

通过手写实现深入理解React核心原理。

