# useRef保存可变值

## 学习目标

通过本章学习,你将全面掌握:

- useRef保存可变值的核心原理
- useRef与useState的本质区别
- useRef的多种应用场景
- 保存前一次值的技巧
- 定时器和间隔器的管理
- 避免闭包陷阱的方法
- ref的性能优化策略
- TypeScript中的useRef类型定义
- React 19中useRef的最佳实践
- useRef在复杂场景中的应用

## 第一部分:useRef核心概念

### 1.1 useRef的双重用途

```jsx
import { useRef, useEffect, useState } from 'react';

function UseRefDualPurpose() {
  // 用途1:保存DOM引用
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const divRef = useRef(null);
  
  // 用途2:保存可变值(不触发重新渲染)
  const countRef = useRef(0);
  const timerRef = useRef(null);
  const prevValueRef = useRef(null);
  const renderCountRef = useRef(0);
  
  renderCountRef.current++;
  
  const handleClick = () => {
    // 修改ref.current不会触发重新渲染
    countRef.current++;
    console.log('点击次数:', countRef.current);
    console.log('组件渲染次数:', renderCountRef.current);
    // 注意:点击次数会增加,但组件不会重新渲染
  };
  
  const focusInput = () => {
    // 使用ref访问DOM
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  useEffect(() => {
    // 保存定时器ID
    timerRef.current = setInterval(() => {
      console.log('定时器执行,当前渲染次数:', renderCountRef.current);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div ref={divRef}>
      <input ref={inputRef} placeholder="这个输入框可以被聚焦" />
      <button ref={buttonRef} onClick={handleClick}>
        点击 (已点击 {countRef.current} 次,但不会重新渲染)
      </button>
      <button onClick={focusInput}>聚焦输入框</button>
      <p>组件渲染次数: {renderCountRef.current}</p>
    </div>
  );
}
```

### 1.2 useRef vs useState深入对比

```jsx
function UseRefVsUseStateDeep() {
  // useState:值变化触发重新渲染
  const [stateCount, setStateCount] = useState(0);
  
  // useRef:值变化不触发重新渲染
  const refCount = useRef(0);
  
  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log('组件渲染,renderCount:', renderCount.current);
  
  const handleStateClick = () => {
    console.log('State点击前:', stateCount);
    setStateCount(stateCount + 1);
    console.log('State点击后:', stateCount);  // 不会立即变化,setState是异步的
  };
  
  const handleRefClick = () => {
    console.log('Ref点击前:', refCount.current);
    refCount.current++;
    console.log('Ref点击后:', refCount.current);  // 立即变化,ref修改是同步的
  };
  
  const handleBothClick = () => {
    refCount.current++;
    setStateCount(stateCount + 1);
    // ref立即变化,state会在下次渲染时变化
  };
  
  return (
    <div>
      <h3>State vs Ref对比</h3>
      
      <div className="comparison">
        <div>
          <h4>useState</h4>
          <p>当前值: {stateCount}</p>
          <p>特点: 值变化触发渲染</p>
          <button onClick={handleStateClick}>增加State</button>
        </div>
        
        <div>
          <h4>useRef</h4>
          <p>当前值: {refCount.current}</p>
          <p>特点: 值变化不触发渲染</p>
          <button onClick={handleRefClick}>增加Ref</button>
        </div>
      </div>
      
      <div>
        <p>组件渲染次数: {renderCount.current}</p>
        <button onClick={handleBothClick}>同时修改两者</button>
      </div>
      
      {/* 
        对比总结:
        1. 更新方式: setState是异步的,ref.current是同步的
        2. 渲染触发: setState触发渲染,ref不触发
        3. 更新模式: setState可以使用函数式更新,ref直接赋值
        4. 使用场景: state用于UI相关数据,ref用于不需要触发渲染的数据
      */}
    </div>
  );
}

// useState vs useRef的性能对比
function PerformanceComparison() {
  const [stateValue, setStateValue] = useState(0);
  const refValue = useRef(0);
  
  const stateStartTime = useRef(0);
  const refStartTime = useRef(0);
  
  const measureStateUpdate = () => {
    stateStartTime.current = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      setStateValue(prev => prev + 1);  // 会触发1000次渲染(批量处理后可能更少)
    }
  };
  
  const measureRefUpdate = () => {
    refStartTime.current = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      refValue.current++;  // 不触发渲染,非常快
    }
    
    const refEndTime = performance.now();
    console.log('Ref更新耗时:', refEndTime - refStartTime.current, 'ms');
  };
  
  useEffect(() => {
    if (stateStartTime.current > 0) {
      const endTime = performance.now();
      console.log('State更新耗时:', endTime - stateStartTime.current, 'ms');
      stateStartTime.current = 0;
    }
  }, [stateValue]);
  
  return (
    <div>
      <h3>性能对比</h3>
      <p>State值: {stateValue}</p>
      <p>Ref值: {refValue.current}</p>
      <button onClick={measureStateUpdate}>测试State更新(1000次)</button>
      <button onClick={measureRefUpdate}>测试Ref更新(1000次)</button>
      <p className="note">打开控制台查看性能差异</p>
    </div>
  );
}
```

### 1.3 useRef的特性详解

```jsx
function UseRefCharacteristics() {
  const ref = useRef({ value: 0, timestamp: Date.now() });
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    console.log('组件挂载');
    
    // 特性1:ref对象在整个生命周期中保持同一个引用
    console.log('ref对象:', ref);  // 总是同一个对象
    console.log('ref对象的引用是否相同:', ref === ref);  // true
    
    // 特性2:修改ref.current不触发渲染
    const oldValue = ref.current.value;
    ref.current.value++;
    console.log('修改后的值:', ref.current.value);
    console.log('值确实变了:', ref.current.value !== oldValue);
    
    // 特性3:ref的修改是同步的(不像setState是异步的)
    ref.current.value = 100;
    console.log('立即读取:', ref.current.value);  // 100,不需要等待
    
    // 特性4:ref可以保存任何类型的值
    ref.current = { value: 200, timestamp: Date.now() };
    console.log('完全替换ref.current:', ref.current);
  });
  
  const increment = () => {
    ref.current.value++;
    console.log('新值:', ref.current.value);
    // 不会触发重新渲染,所以UI不会更新
  };
  
  const incrementAndRender = () => {
    ref.current.value++;
    forceUpdate({});  // 强制重新渲染
  };
  
  const reset = () => {
    ref.current = { value: 0, timestamp: Date.now() };
    forceUpdate({});
  };
  
  return (
    <div>
      <h3>useRef特性演示</h3>
      <p>Ref值: {ref.current.value}</p>
      <p>时间戳: {new Date(ref.current.timestamp).toLocaleString()}</p>
      
      <button onClick={increment}>
        增加(不重新渲染)
      </button>
      <button onClick={incrementAndRender}>
        增加并重新渲染
      </button>
      <button onClick={reset}>
        重置
      </button>
    </div>
  );
}

// useRef的内部工作原理模拟
function useRefSimulation(initialValue) {
  // React内部大致实现
  const [ref] = useState(() => ({ current: initialValue }));
  // ref对象在组件生命周期中保持不变
  return ref;
}

// 使用模拟的useRef
function SimulatedRefExample() {
  const countRef = useRefSimulation(0);
  
  const increment = () => {
    countRef.current++;
    console.log('模拟的ref值:', countRef.current);
  };
  
  return (
    <div>
      <p>模拟ref值: {countRef.current}</p>
      <button onClick={increment}>增加(不触发渲染)</button>
    </div>
  );
}
```

### 1.4 何时使用useRef

```jsx
function WhenToUseRef() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // ✅ 使用useRef的场景
  
  // 场景1:访问和操作DOM元素
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  // 场景2:保存定时器/间隔器ID
  const timerRef = useRef(null);
  
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      console.log('定时器执行');
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  // 场景3:保存前一次的值
  const prevCountRef = useRef(count);
  
  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);
  
  // 场景4:保存不需要触发渲染的值
  const requestIdRef = useRef(null);
  
  const fetchData = () => {
    requestIdRef.current = fetch('/api/data')
      .then(r => r.json())
      .then(console.log);
  };
  
  // 场景5:统计渲染次数
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  
  // 场景6:保存最新的回调函数
  const callbackRef = useRef(() => {
    console.log('当前count:', count);
  });
  
  useEffect(() => {
    callbackRef.current = () => {
      console.log('当前count:', count);
    };
  }, [count]);
  
  // 场景7:保存动画帧ID
  const animationFrameRef = useRef(null);
  
  const startAnimation = () => {
    const animate = () => {
      // 动画逻辑
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };
  
  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  // ❌ 不要使用useRef的场景
  
  // 错误1:需要触发渲染的值(应该用useState)
  // const countRef = useRef(0);  // 错误!
  // const [count, setCount] = useState(0);  // 正确!
  
  // 错误2:派生状态(应该用useMemo)
  // const doubledRef = useRef(count * 2);  // 错误!
  // const doubled = useMemo(() => count * 2, [count]);  // 正确!
  
  // 错误3:需要在JSX中显示的值(应该用state)
  // return <div>{ref.current}</div>  // 错误!ref变化不会更新UI
  
  return (
    <div>
      <h3>useRef使用场景</h3>
      
      <div>
        <input ref={inputRef} value={name} onChange={e => setName(e.target.value)} />
        <button onClick={focusInput}>聚焦</button>
      </div>
      
      <div>
        <p>当前计数: {count}</p>
        <p>前一次计数: {prevCountRef.current}</p>
        <p>渲染次数: {renderCountRef.current}</p>
        <button onClick={() => setCount(c => c + 1)}>增加</button>
      </div>
      
      <div>
        <button onClick={startTimer}>启动定时器</button>
        <button onClick={stopTimer}>停止定时器</button>
      </div>
      
      <div>
        <button onClick={startAnimation}>启动动画</button>
        <button onClick={stopAnimation}>停止动画</button>
      </div>
    </div>
  );
}
```

## 第二部分:保存前一次的值

### 2.1 usePrevious Hook实现

```jsx
// 基础版本
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 增强版本:支持自定义比较函数
function usePreviousAdvanced(value, compare = (a, b) => a !== b) {
  const ref = useRef();
  const shouldUpdate = compare(value, ref.current);
  
  useEffect(() => {
    if (shouldUpdate) {
      ref.current = value;
    }
  }, [value, shouldUpdate]);
  
  return ref.current;
}

// 使用示例
function PreviousValueExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  const [user, setUser] = useState({ id: 1, name: 'Alice' });
  
  const prevCount = usePrevious(count);
  const prevName = usePrevious(name);
  const prevUser = usePreviousAdvanced(
    user,
    (a, b) => a?.id !== b?.id  // 只有id变化才更新
  );
  
  const countChange = count - (prevCount || 0);
  const nameChanged = name !== prevName;
  
  return (
    <div>
      <h3>前一次值追踪</h3>
      
      <div>
        <h4>计数追踪</h4>
        <p>当前: {count}</p>
        <p>之前: {prevCount ?? '无'}</p>
        <p>变化: {countChange > 0 ? `+${countChange}` : countChange}</p>
        <button onClick={() => setCount(c => c + 1)}>+1</button>
        <button onClick={() => setCount(c => c + 5)}>+5</button>
        <button onClick={() => setCount(c => c - 3)}>-3</button>
      </div>
      
      <div>
        <h4>名称追踪</h4>
        <p>当前: {name}</p>
        <p>之前: {prevName ?? '无'}</p>
        <p>{nameChanged ? '名称已变化' : '名称未变化'}</p>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      
      <div>
        <h4>用户追踪(按ID)</h4>
        <p>当前用户: {user.name} (ID: {user.id})</p>
        <p>前一个用户: {prevUser?.name ?? '无'} (ID: {prevUser?.id ?? '无'})</p>
        <button onClick={() => setUser({ id: user.id, name: user.name + '!' })}>
          修改名称(不触发)
        </button>
        <button onClick={() => setUser({ id: user.id + 1, name: 'Bob' })}>
          切换用户(触发)
        </button>
      </div>
    </div>
  );
}
```

### 2.2 深度比较与变化检测

```jsx
function ValueChangeDetection() {
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25,
    email: 'alice@example.com',
    address: {
      city: 'Beijing',
      country: 'China'
    }
  });
  
  const prevUser = usePrevious(user);
  
  // 计算变化的字段
  const changes = useMemo(() => {
    if (!prevUser) return [];
    
    const changedFields = [];
    
    // 浅层比较
    Object.keys(user).forEach(key => {
      if (typeof user[key] === 'object') {
        // 对象类型,深度比较
        if (JSON.stringify(user[key]) !== JSON.stringify(prevUser[key])) {
          changedFields.push({
            field: key,
            from: prevUser[key],
            to: user[key],
            type: 'object'
          });
        }
      } else {
        // 原始类型,直接比较
        if (user[key] !== prevUser[key]) {
          changedFields.push({
            field: key,
            from: prevUser[key],
            to: user[key],
            type: 'primitive'
          });
        }
      }
    });
    
    return changedFields;
  }, [user, prevUser]);
  
  // 变化历史
  const [changeHistory, setChangeHistory] = useState([]);
  
  useEffect(() => {
    if (changes.length > 0) {
      setChangeHistory(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        changes
      }]);
    }
  }, [changes]);
  
  return (
    <div>
      <h3>用户信息变化检测</h3>
      
      <div className="user-form">
        <div>
          <label>Name:</label>
          <input
            value={user.name}
            onChange={e => setUser({ ...user, name: e.target.value })}
          />
        </div>
        
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={user.age}
            onChange={e => setUser({ ...user, age: Number(e.target.value) })}
          />
        </div>
        
        <div>
          <label>Email:</label>
          <input
            value={user.email}
            onChange={e => setUser({ ...user, email: e.target.value })}
          />
        </div>
        
        <div>
          <label>City:</label>
          <input
            value={user.address.city}
            onChange={e => setUser({
              ...user,
              address: { ...user.address, city: e.target.value }
            })}
          />
        </div>
      </div>
      
      {changes.length > 0 && (
        <div className="current-changes">
          <h4>当前变化:</h4>
          <ul>
            {changes.map((change, i) => (
              <li key={i}>
                <strong>{change.field}</strong>: 
                {change.type === 'object' 
                  ? ` ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`
                  : ` ${change.from} → ${change.to}`
                }
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {changeHistory.length > 0 && (
        <div className="change-history">
          <h4>变化历史:</h4>
          <div className="history-list">
            {changeHistory.map((entry, i) => (
              <div key={i} className="history-entry">
                <strong>{entry.timestamp}</strong>
                <ul>
                  {entry.changes.map((change, j) => (
                    <li key={j}>
                      {change.field}: {change.from} → {change.to}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 自定义Hook:useChanges
function useChanges(value, compare) {
  const prevValue = usePrevious(value);
  const [changes, setChanges] = useState([]);
  
  useEffect(() => {
    if (prevValue !== undefined) {
      const newChanges = compare(value, prevValue);
      if (newChanges.length > 0) {
        setChanges(newChanges);
      }
    }
  }, [value, prevValue, compare]);
  
  return changes;
}

// 使用useChanges
function UserFormWithChanges() {
  const [user, setUser] = useState({ name: '', age: 0 });
  
  const changes = useChanges(user, (current, previous) => {
    const changes = [];
    Object.keys(current).forEach(key => {
      if (current[key] !== previous[key]) {
        changes.push({ field: key, from: previous[key], to: current[key] });
      }
    });
    return changes;
  });
  
  return (
    <div>
      <input
        value={user.name}
        onChange={e => setUser({ ...user, name: e.target.value })}
        placeholder="Name"
      />
      <input
        type="number"
        value={user.age}
        onChange={e => setUser({ ...user, age: Number(e.target.value) })}
        placeholder="Age"
      />
      
      {changes.length > 0 && (
        <div>
          <h4>检测到的变化:</h4>
          <ul>
            {changes.map((change, i) => (
              <li key={i}>
                {change.field}: {change.from} → {change.to}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### 2.3 追踪Props变化

```jsx
// 自定义Hook:usePropsChanged
function usePropsChanged(props) {
  const prevProps = usePrevious(props);
  const changedProps = useRef({});
  
  useEffect(() => {
    if (prevProps) {
      const changes = {};
      Object.keys(props).forEach(key => {
        if (props[key] !== prevProps[key]) {
          changes[key] = {
            from: prevProps[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changes).length > 0) {
        console.log('Props变化:', changes);
        changedProps.current = changes;
      }
    }
  }, [props, prevProps]);
  
  return changedProps.current;
}

// 使用示例
function ChildComponent({ userId, theme, language }) {
  const changedProps = usePropsChanged({ userId, theme, language });
  
  useEffect(() => {
    if (changedProps.userId) {
      console.log('userId从', changedProps.userId.from, '变为', changedProps.userId.to);
      // 重新获取用户数据
      fetchUser(userId);
    }
  }, [userId, changedProps]);
  
  useEffect(() => {
    if (changedProps.theme) {
      console.log('theme从', changedProps.theme.from, '变为', changedProps.theme.to);
      // 应用新主题
      applyTheme(theme);
    }
  }, [theme, changedProps]);
  
  return (
    <div>
      <p>用户ID: {userId}</p>
      <p>主题: {theme}</p>
      <p>语言: {language}</p>
      
      {Object.keys(changedProps).length > 0 && (
        <div className="props-changes">
          <h4>Props变化:</h4>
          <ul>
            {Object.entries(changedProps).map(([key, change]) => (
              <li key={key}>
                {key}: {JSON.stringify(change.from)} → {JSON.stringify(change.to)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ParentComponent() {
  const [userId, setUserId] = useState(1);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  
  return (
    <div>
      <div>
        <button onClick={() => setUserId(id => id + 1)}>切换用户</button>
        <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          切换主题
        </button>
        <button onClick={() => setLanguage(l => l === 'en' ? 'zh-CN' : 'en')}>
          切换语言
        </button>
      </div>
      
      <ChildComponent userId={userId} theme={theme} language={language} />
    </div>
  );
}
```

## 第三部分:定时器管理

### 3.1 保存定时器ID

```jsx
function TimerManagement() {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  
  // 启动定时器
  const start = () => {
    if (!running) {
      setRunning(true);
      timerRef.current = setInterval(() => {
        setCount(c => c + 1);
      }, 1000);
    }
  };
  
  // 暂停定时器
  const pause = () => {
    if (running && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRunning(false);
    }
  };
  
  // 重置定时器
  const reset = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setCount(0);
  };
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div>
      <h2>计时器: {count}秒</h2>
      <div>
        <button onClick={start} disabled={running}>
          开始
        </button>
        <button onClick={pause} disabled={!running}>
          暂停
        </button>
        <button onClick={reset}>
          重置
        </button>
      </div>
      <p>状态: {running ? '运行中' : '已暂停'}</p>
    </div>
  );
}

// 自定义Hook:useInterval
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef(null);
  
  // 保存最新的回调
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // 设置interval
  useEffect(() => {
    if (delay !== null) {
      intervalRef.current = setInterval(() => {
        savedCallback.current();
      }, delay);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);
  
  return intervalRef;
}

// 使用useInterval
function IntervalExample() {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  const [running, setRunning] = useState(true);
  
  useInterval(() => {
    setCount(c => c + 1);
  }, running ? delay : null);
  
  return (
    <div>
      <h2>计数: {count}</h2>
      <div>
        <label>
          间隔(毫秒):
          <input
            type="number"
            value={delay}
            onChange={e => setDelay(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={() => setRunning(!running)}>
        {running ? '暂停' : '开始'}
      </button>
      <button onClick={() => setCount(0)}>
        重置
      </button>
    </div>
  );
}
```

### 3.2 倒计时器

```jsx
function CountdownTimer({ initialSeconds }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setIsActive(false);
            // 倒计时结束,可以触发回调
            console.log('倒计时结束!');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds]);
  
  const start = () => {
    if (seconds > 0) {
      setIsActive(true);
    }
  };
  
  const pause = () => {
    setIsActive(false);
  };
  
  const reset = () => {
    setIsActive(false);
    setSeconds(initialSeconds);
  };
  
  const addTime = (amount) => {
    setSeconds(s => Math.max(0, s + amount));
  };
  
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 计算进度百分比
  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;
  
  return (
    <div className="countdown">
      <h2 className="time-display">{formatTime(seconds)}</h2>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="controls">
        {!isActive ? (
          <button onClick={start} disabled={seconds === 0}>
            开始
          </button>
        ) : (
          <button onClick={pause}>
            暂停
          </button>
        )}
        <button onClick={reset}>重置</button>
      </div>
      
      <div className="time-controls">
        <button onClick={() => addTime(-60)} disabled={isActive}>
          -1分钟
        </button>
        <button onClick={() => addTime(60)} disabled={isActive}>
          +1分钟
        </button>
      </div>
      
      <p className="status">
        {seconds === 0 ? '时间到!' : isActive ? '倒计时中...' : '已暂停'}
      </p>
    </div>
  );
}

// 多定时器管理
function MultiTimerManager() {
  const [timers, setTimers] = useState([
    { id: 1, name: '工作', seconds: 1500, active: false },
    { id: 2, name: '休息', seconds: 300, active: false },
    { id: 3, name: '长休息', seconds: 900, active: false }
  ]);
  
  const timerRefs = useRef({});
  
  const startTimer = (id) => {
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, active: true } : t
    ));
    
    timerRefs.current[id] = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (t.id === id && t.active) {
          if (t.seconds <= 1) {
            stopTimer(id);
            return { ...t, seconds: 0, active: false };
          }
          return { ...t, seconds: t.seconds - 1 };
        }
        return t;
      }));
    }, 1000);
  };
  
  const stopTimer = (id) => {
    if (timerRefs.current[id]) {
      clearInterval(timerRefs.current[id]);
      delete timerRefs.current[id];
    }
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, active: false } : t
    ));
  };
  
  const resetTimer = (id, initialSeconds) => {
    stopTimer(id);
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, seconds: initialSeconds, active: false } : t
    ));
  };
  
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, []);
  
  return (
    <div>
      <h2>番茄钟管理器</h2>
      <div className="timer-grid">
        {timers.map(timer => (
          <div key={timer.id} className="timer-card">
            <h3>{timer.name}</h3>
            <p className="time">{Math.floor(timer.seconds / 60)}:{(timer.seconds % 60).toString().padStart(2, '0')}</p>
            <div>
              {!timer.active ? (
                <button onClick={() => startTimer(timer.id)}>
                  开始
                </button>
              ) : (
                <button onClick={() => stopTimer(timer.id)}>
                  暂停
                </button>
              )}
              <button onClick={() => resetTimer(timer.id, timer.id === 1 ? 1500 : timer.id === 2 ? 300 : 900)}>
                重置
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 延迟执行(setTimeout)

```jsx
// 自定义Hook:useTimeout
function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay !== null) {
      timeoutRef.current = setTimeout(() => {
        savedCallback.current();
      }, delay);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [delay]);
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return clear;
}

// 使用useTimeout
function TimeoutExample() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  
  // 3秒后显示消息
  useTimeout(() => {
    setShow(true);
    setMessage('3秒后显示的消息');
  }, show ? null : 3000);
  
  return (
    <div>
      <h3>延迟显示示例</h3>
      {!show ? (
        <p>等待3秒...</p>
      ) : (
        <div>
          <p>{message}</p>
          <button onClick={() => setShow(false)}>重新开始</button>
        </div>
      )}
    </div>
  );
}

// 防抖函数
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    // 清除旧的timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 设置新的timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用防抖
function DebounceSearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      console.log('搜索:', debouncedSearchTerm);
      fetch(`/api/search?q=${debouncedSearchTerm}`)
        .then(r => r.json())
        .then(setResults)
        .catch(console.error);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div>
      <h3>防抖搜索</h3>
      <input
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="输入搜索内容..."
      />
      <p>即时值: {searchTerm}</p>
      <p>防抖值: {debouncedSearchTerm}</p>
      
      <ul>
        {results.map((result, i) => (
          <li key={i}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 第四部分:避免闭包陷阱

### 4.1 闭包问题深入分析

```jsx
// 问题演示:闭包陷阱
function ClosureTrapDemonstration() {
  const [count, setCount] = useState(0);
  
  // ❌ 错误:闭包陷阱
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('闭包中的count:', count);  // 永远是0
      setCount(count + 1);  // 永远是0+1=1
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);  // 空依赖,count被闭包捕获为初始值0
  
  // count永远不会超过1,因为每次都是基于0递增
  
  return (
    <div>
      <p>Count: {count}</p>
      <p className="warning">这个计数器有闭包陷阱,不会正确递增</p>
    </div>
  );
}

// 解决方案对比
function ClosureSolutions() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  
  // 方案1:使用函数式更新(推荐)
  useEffect(() => {
    const interval = setInterval(() => {
      setCount1(c => {
        console.log('方案1 - 函数式更新,当前值:', c);
        return c + 1;  // 总是基于最新值
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 方案2:使用useRef保存最新值
  const count2Ref = useRef(count2);
  
  useEffect(() => {
    count2Ref.current = count2;  // 同步最新值到ref
  }, [count2]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('方案2 - useRef,当前值:', count2Ref.current);
      setCount2(count2Ref.current + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 方案3:将count添加到依赖数组(会重建interval)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('方案3 - 依赖count,当前值:', count3);
      setCount3(count3 + 1);
    }, 1000);
    
    return () => {
      console.log('方案3 - 清理旧的interval');
      clearInterval(interval);
    };
  }, [count3]);  // 每次count3变化都会重建interval
  
  return (
    <div>
      <h3>闭包陷阱解决方案对比</h3>
      
      <div>
        <p>方案1(函数式更新): {count1}</p>
        <p className="note">推荐,性能最好,不重建interval</p>
      </div>
      
      <div>
        <p>方案2(useRef): {count2}</p>
        <p className="note">可行,需要额外的effect同步ref</p>
      </div>
      
      <div>
        <p>方案3(添加依赖): {count3}</p>
        <p className="note">可行,但每次都重建interval,性能较差</p>
      </div>
    </div>
  );
}
```

### 4.2 保存最新的回调函数

```jsx
// 自定义Hook:useLatestCallback
function useLatestCallback(callback) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
}

// 使用示例
function LatestCallbackExample() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  
  // 这个回调依赖count和multiplier
  const expensiveCallback = () => {
    console.log('执行昂贵操作:', count * multiplier);
    return count * multiplier;
  };
  
  // ❌ 问题:直接使用会导致频繁重建interval
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     expensiveCallback();
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [expensiveCallback]);  // expensiveCallback每次渲染都是新函数
  
  // ✅ 解决:使用useLatestCallback
  const latestCallback = useLatestCallback(expensiveCallback);
  
  useEffect(() => {
    const interval = setInterval(() => {
      latestCallback();  // 总是调用最新的回调
    }, 1000);
    
    return () => clearInterval(interval);
  }, [latestCallback]);  // latestCallback引用稳定
  
  return (
    <div>
      <h3>最新回调保存示例</h3>
      <p>Count: {count}</p>
      <p>Multiplier: {multiplier}</p>
      <p>Result: {count * multiplier}</p>
      
      <button onClick={() => setCount(c => c + 1)}>增加Count</button>
      <button onClick={() => setMultiplier(m => m + 1)}>增加Multiplier</button>
    </div>
  );
}

// useLatest Hook(更通用)
function useLatest(value) {
  const ref = useRef(value);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref;
}

// 使用useLatest
function UseLatestExample() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hello');
  
  const handleLog = () => {
    console.log('Count:', count, 'Message:', message);
  };
  
  const latestHandleLog = useLatest(handleLog);
  
  useEffect(() => {
    const interval = setInterval(() => {
      latestHandleLog.current();  // 总是最新的函数
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);  // 空依赖,但总是调用最新的handleLog
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Message: {message}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <p className="note">查看控制台,每2秒打印最新的count和message</p>
    </div>
  );
}
```

### 4.3 事件处理中的闭包

```jsx
function EventHandlerClosure() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    // ❌ 问题:直接在事件处理中使用count
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        console.log('按Enter时的count(闭包):', count);  // 永远是初始值
      }
    };
    
    // ✅ 解决:使用ref访问最新值
    const handleKeyPressFixed = (e) => {
      if (e.key === 'Enter') {
        console.log('按Enter时的count(ref):', countRef.current);  // 总是最新值
      }
    };
    
    window.addEventListener('keypress', handleKeyPressFixed);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPressFixed);
    };
  }, []);  // 空依赖,但通过ref访问最新值
  
  return (
    <div>
      <h3>事件处理闭包示例</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
      <p className="note">按Enter键查看控制台输出</p>
    </div>
  );
}
```

## 第五部分:渲染追踪与性能监控

### 5.1 渲染计数器

```jsx
function RenderCounter() {
  const renderCount = useRef(0);
  
  // 每次渲染时递增
  renderCount.current++;
  
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  console.log('组件渲染,渲染次数:', renderCount.current);
  
  return (
    <div>
      <h3>渲染计数器</h3>
      <p className="highlight">组件已渲染 {renderCount.current} 次</p>
      
      <div>
        <p>Count: {count}</p>
        <button onClick={() => setCount(c => c + 1)}>增加Count</button>
      </div>
      
      <div>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入文本..."
        />
      </div>
      
      <p className="note">
        每次State变化都会导致重新渲染,观察渲染次数的变化
      </p>
    </div>
  );
}

// 详细的渲染追踪
function DetailedRenderTracker({ componentName }) {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());
  
  renderCount.current++;
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    const timeSinceMount = now - mountTime.current;
    
    const renderInfo = {
      count: renderCount.current,
      timestamp: now,
      timeSinceLast: timeSinceLastRender,
      timeSinceMount
    };
    
    renderTimes.current.push(renderInfo);
    lastRenderTime.current = now;
    
    // 计算统计数据
    const avgInterval = renderTimes.current.length > 1
      ? renderTimes.current
          .slice(1)
          .reduce((sum, r) => sum + r.timeSinceLast, 0) / (renderTimes.current.length - 1)
      : 0;
    
    console.log(`[${componentName}] 渲染信息:`, {
      renderCount: renderCount.current,
      timeSinceLastRender: `${timeSinceLastRender}ms`,
      averageInterval: `${avgInterval.toFixed(2)}ms`,
      totalTime: `${timeSinceMount}ms`
    });
  });
  
  return (
    <div className="render-stats">
      <p>渲染次数: {renderCount.current}</p>
      <p>总时间: {Date.now() - mountTime.current}ms</p>
      <p>平均间隔: {
        renderTimes.current.length > 1
          ? `${(renderTimes.current.slice(1).reduce((sum, r) => sum + r.timeSinceLast, 0) / (renderTimes.current.length - 1)).toFixed(2)}ms`
          : 'N/A'
      }</p>
    </div>
  );
}
```

### 5.2 性能监控Hook

```jsx
// 自定义Hook:useRenderPerformance
function useRenderPerformance(componentName) {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const slowRenders = useRef([]);
  const startTime = useRef(performance.now());
  
  renderCount.current++;
  
  useEffect(() => {
    const endTime = performance.now();
    const renderDuration = endTime - startTime.current;
    
    renderTimes.current.push(renderDuration);
    
    // 记录慢渲染(超过16ms)
    if (renderDuration > 16) {
      slowRenders.current.push({
        count: renderCount.current,
        duration: renderDuration,
        timestamp: Date.now()
      });
      
      console.warn(`[${componentName}] 慢渲染检测:`, {
        renderCount: renderCount.current,
        duration: `${renderDuration.toFixed(2)}ms`,
        threshold: '16ms'
      });
    }
    
    startTime.current = performance.now();
  });
  
  const getStats = useCallback(() => {
    const total = renderTimes.current.reduce((sum, t) => sum + t, 0);
    const avg = total / renderTimes.current.length;
    const max = Math.max(...renderTimes.current);
    const min = Math.min(...renderTimes.current);
    
    return {
      renderCount: renderCount.current,
      totalTime: total,
      averageTime: avg,
      maxTime: max,
      minTime: min,
      slowRenderCount: slowRenders.current.length,
      slowRenders: slowRenders.current
    };
  }, []);
  
  return {
    renderCount: renderCount.current,
    getStats
  };
}

// 使用性能监控
function PerformanceMonitoredComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  
  const { renderCount, getStats } = useRenderPerformance('MonitoredComponent');
  
  const addItems = () => {
    const newItems = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      text: `Item ${i}`
    }));
    setItems(newItems);
  };
  
  const showStats = () => {
    const stats = getStats();
    console.log('性能统计:', stats);
    alert(`
      渲染次数: ${stats.renderCount}
      平均耗时: ${stats.averageTime.toFixed(2)}ms
      最大耗时: ${stats.maxTime.toFixed(2)}ms
      最小耗时: ${stats.minTime.toFixed(2)}ms
      慢渲染次数: ${stats.slowRenderCount}
    `);
  };
  
  return (
    <div>
      <h3>性能监控组件</h3>
      <p>渲染次数: {renderCount}</p>
      
      <div>
        <button onClick={() => setCount(c => c + 1)}>增加Count ({count})</button>
        <button onClick={addItems}>添加1000个项目</button>
        <button onClick={showStats}>查看性能统计</button>
      </div>
      
      <div>
        <p>项目数量: {items.length}</p>
        <ul>
          {items.slice(0, 10).map(item => (
            <li key={item.id}>{item.text}</li>
          ))}
          {items.length > 10 && <li>... 还有 {items.length - 10} 个项目</li>}
        </ul>
      </div>
    </div>
  );
}
```

### 5.3 Why Did You Render调试

```jsx
// 自定义Hook:useWhyDidYouUpdate
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[Why Did You Update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// 使用示例
function OptimizedChild({ count, text, config }) {
  useWhyDidYouUpdate('OptimizedChild', { count, text, config });
  
  const renderCount = useRef(0);
  renderCount.current++;
  
  return (
    <div>
      <p>子组件渲染次数: {renderCount.current}</p>
      <p>Count: {count}</p>
      <p>Text: {text}</p>
      <p>Config: {JSON.stringify(config)}</p>
    </div>
  );
}

function ParentWithOptimization() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [unrelatedState, setUnrelatedState] = useState(0);
  
  // ❌ 问题:config每次都是新对象
  // const config = { theme: 'dark' };
  
  // ✅ 解决:使用useMemo
  const config = useMemo(() => ({ theme: 'dark' }), []);
  
  return (
    <div>
      <h3>Props变化追踪</h3>
      
      <div>
        <button onClick={() => setCount(c => c + 1)}>增加Count</button>
        <input value={text} onChange={e => setText(e.target.value)} />
        <button onClick={() => setUnrelatedState(s => s + 1)}>
          修改无关状态 ({unrelatedState})
        </button>
      </div>
      
      <OptimizedChild count={count} text={text} config={config} />
      
      <p className="note">
        打开控制台查看哪些props变化导致了子组件重新渲染
      </p>
    </div>
  );
}
```

## 第六部分:复杂应用场景

### 6.1 保存WebSocket连接

```jsx
function WebSocketManager() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  
  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8080');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket已连接');
        setConnected(true);
        reconnectAttempts.current = 0;
      };
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket错误:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket已关闭');
        setConnected(false);
        
        // 自动重连
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          console.log(`尝试重连... (第${reconnectAttempts.current}次,延迟${delay}ms)`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('连接失败:', error);
    }
  }, []);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  const sendMessage = useCallback((text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        text,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      };
      
      wsRef.current.send(JSON.stringify(message));
      setInputValue('');
    } else {
      console.error('WebSocket未连接');
    }
  }, []);
  
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };
  
  return (
    <div className="websocket-manager">
      <div className="connection-status">
        状态: {connected ? '已连接' : '未连接'}
        {!connected && reconnectAttempts.current > 0 && (
          <span> (重连尝试: {reconnectAttempts.current}/5)</span>
        )}
      </div>
      
      <div className="messages">
        <h4>消息列表:</h4>
        {messages.length === 0 ? (
          <p>暂无消息</p>
        ) : (
          <ul>
            {messages.map((msg, i) => (
              <li key={i}>
                <strong>{new Date(msg.timestamp).toLocaleTimeString()}</strong>: {msg.text}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="输入消息..."
          disabled={!connected}
        />
        <button type="submit" disabled={!connected || !inputValue.trim()}>
          发送
        </button>
      </form>
      
      <div className="controls">
        <button onClick={connect} disabled={connected}>
          连接
        </button>
        <button onClick={disconnect} disabled={!connected}>
          断开
        </button>
        <button onClick={() => setMessages([])}>
          清空消息
        </button>
      </div>
    </div>
  );
}
```

### 6.2 保存动画帧ID

```jsx
function SmoothAnimation() {
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [animating, setAnimating] = useState(false);
  
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastTimeRef = useRef(null);
  
  useEffect(() => {
    if (!animating) return;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        lastTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // 使用缓动函数
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const progress = Math.min(elapsed / 2000, 1);
      const easedProgress = easeOutCubic(progress);
      
      const newPosition = easedProgress * 100;
      const newVelocity = (newPosition - position) / (deltaTime / 1000);
      
      setPosition(newPosition);
      setVelocity(newVelocity);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setAnimating(false);
        startTimeRef.current = null;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animating]);
  
  const start = () => {
    setPosition(0);
    setVelocity(0);
    startTimeRef.current = null;
    setAnimating(true);
  };
  
  const stop = () => {
    setAnimating(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
  
  return (
    <div className="animation-demo">
      <div className="animation-container">
        <div
          className="animated-box"
          style={{
            transform: `translateX(${position * 3}px)`,
            transition: 'none'
          }}
        >
          Box
        </div>
      </div>
      
      <div className="animation-info">
        <p>位置: {position.toFixed(2)}%</p>
        <p>速度: {velocity.toFixed(2)} px/s</p>
        <p>状态: {animating ? '动画中' : '已停止'}</p>
      </div>
      
      <div className="controls">
        <button onClick={start} disabled={animating}>
          开始动画
        </button>
        <button onClick={stop} disabled={!animating}>
          停止动画
        </button>
      </div>
    </div>
  );
}
```

### 6.3 保存Canvas引用并绘制

```jsx
function CanvasDrawing() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 初始化画布
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const startDrawing = (e) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      lastPosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    const draw = (e) => {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      lastPosRef.current = { x, y };
    };
    
    const stopDrawing = () => {
      setIsDrawing(false);
    };
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [isDrawing, color, lineWidth]);
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  return (
    <div className="canvas-drawing">
      <h3>画布绘制</h3>
      
      <div className="controls">
        <label>
          颜色:
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </label>
        
        <label>
          线宽:
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
          />
          {lineWidth}px
        </label>
        
        <button onClick={clearCanvas}>清空画布</button>
      </div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: '1px solid #ccc',
          cursor: 'crosshair'
        }}
      />
    </div>
  );
}
```

## 第七部分:TypeScript支持

### 7.1 useRef的类型定义

```typescript
import { useRef, useEffect } from 'react';

// 基本类型
function BasicRefTypes() {
  // 原始类型
  const countRef = useRef<number>(0);
  const nameRef = useRef<string>('');
  const flagRef = useRef<boolean>(false);
  
  // 对象类型
  const userRef = useRef<{ id: number; name: string }>({
    id: 1,
    name: 'Alice'
  });
  
  // 数组类型
  const itemsRef = useRef<string[]>([]);
  
  // null类型(常用于DOM引用)
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // 访问ref值需要检查null
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  return (
    <div ref={divRef}>
      <input ref={inputRef} />
    </div>
  );
}

// DOM元素类型
function DOMRefTypes() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const focusButton = () => {
    buttonRef.current?.focus();
  };
  
  const submitForm = () => {
    formRef.current?.submit();
  };
  
  return (
    <div>
      <button ref={buttonRef} onClick={focusButton}>
        按钮
      </button>
      <select ref={selectRef}>
        <option>选项1</option>
      </select>
      <textarea ref={textareaRef} />
      <form ref={formRef}>
        <input type="submit" />
      </form>
      <canvas ref={canvasRef} />
      <video ref={videoRef} />
    </div>
  );
}

// 函数类型
function FunctionRefTypes() {
  const callbackRef = useRef<() => void>(() => {
    console.log('默认回调');
  });
  
  const asyncCallbackRef = useRef<(id: number) => Promise<void>>(
    async (id) => {
      console.log('异步操作:', id);
    }
  );
  
  useEffect(() => {
    callbackRef.current();
    asyncCallbackRef.current(123);
  }, []);
  
  return <div>函数Ref示例</div>;
}

// 定时器类型
function TimerRefTypes() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {}, 1000);
    intervalRef.current = setInterval(() => {}, 1000);
    animationFrameRef.current = requestAnimationFrame(() => {});
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  return <div>定时器Ref示例</div>;
}
```

### 7.2 自定义Hook的类型

```typescript
// usePrevious的类型定义
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// useLatest的类型定义
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef<T>(value);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref;
}

// useInterval的类型定义
function useInterval(
  callback: () => void,
  delay: number | null
): React.MutableRefObject<NodeJS.Timeout | null> {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay !== null) {
      intervalRef.current = setInterval(() => {
        savedCallback.current();
      }, delay);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);
  
  return intervalRef;
}

// 使用带类型的Hook
function TypedHookUsage() {
  const [count, setCount] = useState<number>(0);
  const prevCount = usePrevious<number>(count);
  
  const latestCallback = useLatest<() => void>(() => {
    console.log('Count:', count);
  });
  
  const intervalRef = useInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return (
    <div>
      <p>当前: {count}</p>
      <p>之前: {prevCount}</p>
    </div>
  );
}
```

## 第八部分:最佳实践

### 8.1 何时使用useRef

```jsx
// ✅ 使用useRef的正确场景

// 场景1:访问DOM元素
function DOMAccess() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return <input ref={inputRef} />;
}

// 场景2:保存可变值(不触发渲染)
function MutableValue() {
  const requestIdRef = useRef(null);
  
  const fetchData = () => {
    requestIdRef.current = fetch('/api/data');
  };
  
  return <button onClick={fetchData}>获取数据</button>;
}

// 场景3:保存前一次的值
function PreviousValue() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return <div>{count} (之前: {prevCount})</div>;
}

// 场景4:避免闭包陷阱
function AvoidClosure() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(countRef.current);  // 总是最新值
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <div>{count}</div>;
}

// 场景5:保存定时器ID
function TimerID() {
  const timerRef = useRef(null);
  
  const start = () => {
    timerRef.current = setInterval(() => {}, 1000);
  };
  
  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  return (
    <div>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}

// ❌ 不要使用useRef的场景

// 错误1:需要触发渲染的值
function WrongRenderValue() {
  // ❌ 错误
  const countRef = useRef(0);
  
  const increment = () => {
    countRef.current++;  // 不会触发渲染,UI不会更新
  };
  
  // ✅ 正确
  const [count, setCount] = useState(0);
  
  const incrementCorrect = () => {
    setCount(c => c + 1);  // 触发渲染,UI更新
  };
  
  return <div>{count}</div>;
}

// 错误2:派生状态
function WrongDerivedState() {
  const [count, setCount] = useState(0);
  
  // ❌ 错误
  const doubledRef = useRef(count * 2);
  
  // ✅ 正确
  const doubled = useMemo(() => count * 2, [count]);
  
  return <div>{doubled}</div>;
}
```

### 8.2 ref初始化最佳实践

```jsx
function RefInitializationBest() {
  // ✅ 简单值初始化
  const countRef = useRef(0);
  
  // ✅ null初始化(DOM ref)
  const elementRef = useRef(null);
  
  // ✅ 对象初始化
  const dataRef = useRef({
    value: 0,
    timestamp: Date.now()
  });
  
  // ✅ 惰性初始化(昂贵计算)
  const expensiveRef = useRef(null);
  
  if (expensiveRef.current === null) {
    expensiveRef.current = expensiveCalculation();
  }
  
  // ✅ 使用函数初始化(只执行一次)
  const lazyRef = useRef(() => {
    console.log('只执行一次');
    return { initialized: true };
  });
  
  if (typeof lazyRef.current === 'function') {
    lazyRef.current = lazyRef.current();
  }
  
  // ❌ 避免:在渲染中修改ref
  // countRef.current++;  // 不好,可能导致不一致
  
  // ✅ 在Effect中修改ref
  useEffect(() => {
    countRef.current++;
  });
  
  return <div>Ref初始化最佳实践</div>;
}
```

### 8.3 ref命名规范

```jsx
function RefNamingConventions() {
  // ✅ 好的命名
  const inputRef = useRef(null);          // DOM元素
  const timerRef = useRef(null);          // 定时器ID
  const prevValueRef = useRef(0);         // 前一次的值
  const callbackRef = useRef(() => {});   // 回调函数
  const renderCountRef = useRef(0);       // 渲染计数
  
  // ❌ 不好的命名
  const ref1 = useRef(null);              // 不清楚用途
  const temp = useRef(0);                 // 太模糊
  const x = useRef(null);                 // 无意义
  
  return <div>命名规范</div>;
}
```

## 练习题

### 基础练习

1. 使用useRef保存一个计数器,点击按钮时增加但不触发渲染
2. 实现usePrevious Hook保存前一次的状态值
3. 使用ref保存定时器ID,实现秒表功能
4. 统计组件的渲染次数并显示

### 进阶练习

1. 实现防抖和节流的自定义Hook
2. 创建useLatest Hook保存最新的回调函数
3. 使用ref解决闭包陷阱问题
4. 实现一个倒计时组件,支持暂停和重置

### 高级练习

1. 使用ref保存WebSocket连接并管理消息
2. 实现一个Canvas绘图组件
3. 创建性能监控Hook追踪渲染性能
4. 实现一个状态历史记录系统(undo/redo)
5. 使用TypeScript定义完整的ref类型系统

### 实战项目

1. 实现一个音乐播放器,使用ref管理音频元素
2. 创建一个游戏,使用ref管理游戏状态和动画
3. 实现一个聊天应用,使用ref管理WebSocket
4. 创建一个性能分析工具,追踪组件渲染

通过本章学习,你已经全面掌握了useRef保存可变值的所有技巧。useRef不仅可以访问DOM,更是保存不触发渲染的可变值的最佳选择,是解决闭包陷阱、性能优化的重要工具。继续学习,探索更多Hook的强大功能!
