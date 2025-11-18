# Jotai Atoms组合

## 概述

Jotai的强大之处在于atoms的组合能力。通过组合基础atoms，可以创建复杂的状态逻辑而无需编写复杂的reducer。本文深入探讨atoms的各种组合模式和技巧。

## 基础组合模式

### 1. 读取组合

多个atoms组合成一个派生atom：

```jsx
import { atom, useAtomValue } from 'jotai';

const firstNameAtom = atom('John');
const lastNameAtom = atom('Doe');
const ageAtom = atom(30);

// 组合多个atoms
const userInfoAtom = atom((get) => {
  const firstName = get(firstNameAtom);
  const lastName = get(lastNameAtom);
  const age = get(ageAtom);

  return {
    fullName: `${firstName} ${lastName}`,
    age,
    isAdult: age >= 18
  };
});

// 使用
function UserInfo() {
  const userInfo = useAtomValue(userInfoAtom);

  return (
    <div>
      <p>Name: {userInfo.fullName}</p>
      <p>Age: {userInfo.age}</p>
      <p>Status: {userInfo.isAdult ? 'Adult' : 'Minor'}</p>
    </div>
  );
}
```

### 2. 写入组合

一个atom的写入影响多个atoms：

```jsx
const xAtom = atom(0);
const yAtom = atom(0);

// 写入时更新多个atoms
const moveAtom = atom(
  (get) => ({ x: get(xAtom), y: get(yAtom) }),
  (get, set, { dx, dy }) => {
    set(xAtom, get(xAtom) + dx);
    set(yAtom, get(yAtom) + dy);
  }
);

// 使用
function Position() {
  const [position, move] = useAtom(moveAtom);

  return (
    <div>
      <p>Position: ({position.x}, {position.y})</p>
      <button onClick={() => move({ dx: 10, dy: 0 })}>Move Right</button>
      <button onClick={() => move({ dx: 0, dy: 10 })}>Move Down</button>
    </div>
  );
}
```

### 3. 链式组合

atoms形成依赖链：

```jsx
const inputAtom = atom('');

// 第一级派生
const trimmedAtom = atom((get) => get(inputAtom).trim());

// 第二级派生
const lowercaseAtom = atom((get) => get(trimmedAtom).toLowerCase());

// 第三级派生
const wordsAtom = atom((get) => {
  const text = get(lowercaseAtom);
  return text ? text.split(/\s+/) : [];
});

// 第四级派生
const wordCountAtom = atom((get) => get(wordsAtom).length);

// 使用
function TextAnalysis() {
  const [input, setInput] = useAtom(inputAtom);
  const words = useAtomValue(wordsAtom);
  const wordCount = useAtomValue(wordCountAtom);

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <p>Word count: {wordCount}</p>
      <p>Words: {words.join(', ')}</p>
    </div>
  );
}
```

## 高级组合模式

### 1. 条件组合

根据条件使用不同的atoms：

```jsx
const modeAtom = atom('celsius'); // 'celsius' | 'fahrenheit'
const temperatureAtom = atom(0);

// 根据模式显示不同的温度
const displayTemperatureAtom = atom((get) => {
  const mode = get(modeAtom);
  const temp = get(temperatureAtom);

  if (mode === 'fahrenheit') {
    return (temp * 9/5) + 32;
  }
  return temp;
});

// 设置温度时自动转换
const setTemperatureAtom = atom(
  (get) => get(displayTemperatureAtom),
  (get, set, value) => {
    const mode = get(modeAtom);
    
    if (mode === 'fahrenheit') {
      set(temperatureAtom, (value - 32) * 5/9);
    } else {
      set(temperatureAtom, value);
    }
  }
);

function Temperature() {
  const [mode, setMode] = useAtom(modeAtom);
  const [temp, setTemp] = useAtom(setTemperatureAtom);

  return (
    <div>
      <input
        type="number"
        value={temp}
        onChange={(e) => setTemp(Number(e.target.value))}
      />
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="celsius">°C</option>
        <option value="fahrenheit">°F</option>
      </select>
    </div>
  );
}
```

### 2. 数组组合

组合atom数组：

```jsx
const todosAtom = atom([]);

// 为每个todo创建单独的atom
const todoAtomsAtom = atom((get) => {
  const todos = get(todosAtom);
  return todos.map((todo) =>
    atom(
      (get) => todo,
      (get, set, newTodo) => {
        set(
          todosAtom,
          get(todosAtom).map((t) => (t.id === todo.id ? newTodo : t))
        );
      }
    )
  );
});

// 统计atom
const todoStatsAtom = atom((get) => {
  const todoAtoms = get(todoAtomsAtom);
  const todos = todoAtoms.map((todoAtom) => get(todoAtom));

  return {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length
  };
});
```

### 3. 对象组合

组合对象形式的atoms：

```jsx
const userFieldsAtom = atom({
  firstName: '',
  lastName: '',
  email: '',
  age: 0
});

// 为每个字段创建单独的atom
const createFieldAtom = (field) =>
  atom(
    (get) => get(userFieldsAtom)[field],
    (get, set, value) => {
      set(userFieldsAtom, {
        ...get(userFieldsAtom),
        [field]: value
      });
    }
  );

const firstNameAtom = createFieldAtom('firstName');
const lastNameAtom = createFieldAtom('lastName');
const emailAtom = createFieldAtom('email');
const ageAtom = createFieldAtom('age');

// 验证atoms
const firstNameErrorAtom = atom((get) => {
  const value = get(firstNameAtom);
  return value ? null : 'First name is required';
});

const emailErrorAtom = atom((get) => {
  const value = get(emailAtom);
  if (!value) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email';
  return null;
});

// 表单有效性atom
const isFormValidAtom = atom((get) => {
  return !get(firstNameErrorAtom) && !get(emailErrorAtom);
});
```

### 4. 递归组合

atom引用自身或其他atom形成循环：

```jsx
// 计数器历史记录
const countAtom = atom(0);
const historyAtom = atom([]);

// 更新计数器同时记录历史
const updateCountAtom = atom(
  null,
  (get, set, newValue) => {
    const currentValue = get(countAtom);
    set(countAtom, newValue);
    set(historyAtom, [
      ...get(historyAtom),
      { from: currentValue, to: newValue, timestamp: Date.now() }
    ]);
  }
);

// 撤销atom
const undoAtom = atom(
  null,
  (get, set) => {
    const history = get(historyAtom);
    if (history.length === 0) return;

    const lastChange = history[history.length - 1];
    set(countAtom, lastChange.from);
    set(historyAtom, history.slice(0, -1));
  }
);
```

## 实用组合模式

### 1. 表单组合

```jsx
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 表单字段atoms
const emailAtom = atom('');
const passwordAtom = atom('');
const rememberMeAtom = atomWithStorage('rememberMe', false);

// 触摸状态atoms
const emailTouchedAtom = atom(false);
const passwordTouchedAtom = atom(false);

// 错误atoms
const emailErrorAtom = atom((get) => {
  if (!get(emailTouchedAtom)) return null;
  const email = get(emailAtom);
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email';
  return null;
});

const passwordErrorAtom = atom((get) => {
  if (!get(passwordTouchedAtom)) return null;
  const password = get(passwordAtom);
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
});

// 表单状态atom
const formStateAtom = atom((get) => ({
  values: {
    email: get(emailAtom),
    password: get(passwordAtom),
    rememberMe: get(rememberMeAtom)
  },
  errors: {
    email: get(emailErrorAtom),
    password: get(passwordErrorAtom)
  },
  touched: {
    email: get(emailTouchedAtom),
    password: get(passwordTouchedAtom)
  },
  isValid: !get(emailErrorAtom) && !get(passwordErrorAtom)
}));

// Action atoms
const submitFormAtom = atom(
  null,
  async (get, set) => {
    // 标记所有字段为已触摸
    set(emailTouchedAtom, true);
    set(passwordTouchedAtom, true);

    const formState = get(formStateAtom);
    
    if (!formState.isValid) {
      return { success: false, errors: formState.errors };
    }

    try {
      const response = await loginAPI(formState.values);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
);

const resetFormAtom = atom(
  null,
  (get, set) => {
    set(emailAtom, '');
    set(passwordAtom, '');
    set(emailTouchedAtom, false);
    set(passwordTouchedAtom, false);
  }
);

// 组件
function LoginForm() {
  const [email, setEmail] = useAtom(emailAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [rememberMe, setRememberMe] = useAtom(rememberMeAtom);
  
  const setEmailTouched = useSetAtom(emailTouchedAtom);
  const setPasswordTouched = useSetAtom(passwordTouchedAtom);
  
  const formState = useAtomValue(formStateAtom);
  const submitForm = useSetAtom(submitFormAtom);
  const resetForm = useSetAtom(resetFormAtom);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitForm();
    if (result.success) {
      console.log('Login successful');
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
        />
        {formState.errors.email && formState.touched.email && (
          <span>{formState.errors.email}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
        />
        {formState.errors.password && formState.touched.password && (
          <span>{formState.errors.password}</span>
        )}
      </div>

      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>

      <button type="submit" disabled={!formState.isValid}>
        Login
      </button>
    </form>
  );
}
```

### 2. 数据流组合

```jsx
// 数据源atoms
const rawDataAtom = atom([]);
const searchQueryAtom = atom('');
const sortConfigAtom = atom({ key: 'name', direction: 'asc' });
const filterConfigAtom = atom({});

// 搜索atom
const searchedDataAtom = atom((get) => {
  const data = get(rawDataAtom);
  const query = get(searchQueryAtom).toLowerCase();
  
  if (!query) return data;
  
  return data.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
});

// 过滤atom
const filteredDataAtom = atom((get) => {
  const data = get(searchedDataAtom);
  const filters = get(filterConfigAtom);

  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key] === value;
    });
  });
});

// 排序atom
const sortedDataAtom = atom((get) => {
  const data = get(filteredDataAtom);
  const { key, direction } = get(sortConfigAtom);

  const sorted = [...data].sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0;
  });

  return direction === 'desc' ? sorted.reverse() : sorted;
});

// 分页atoms
const pageAtom = atom(1);
const pageSizeAtom = atom(10);

const paginatedDataAtom = atom((get) => {
  const data = get(sortedDataAtom);
  const page = get(pageAtom);
  const pageSize = get(pageSizeAtom);

  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
});

const totalPagesAtom = atom((get) => {
  const dataLength = get(sortedDataAtom).length;
  const pageSize = get(pageSizeAtom);
  return Math.ceil(dataLength / pageSize);
});

// 统计atoms
const dataStatsAtom = atom((get) => ({
  total: get(rawDataAtom).length,
  filtered: get(filteredDataAtom).length,
  displayed: get(paginatedDataAtom).length,
  pages: get(totalPagesAtom)
}));
```

### 3. 异步组合

```jsx
import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

// 用户ID atom
const userIdAtom = atom(1);

// 异步用户数据atom
const userAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// 包装为loadable
const userLoadableAtom = loadable(userAtom);

// 用户的帖子atom（依赖用户数据）
const userPostsAtom = atom(async (get) => {
  const userId = get(userIdAtom);
  const response = await fetch(`/api/users/${userId}/posts`);
  return response.json();
});

const userPostsLoadableAtom = loadable(userPostsAtom);

// 组合用户和帖子数据
const userWithPostsAtom = atom((get) => {
  const userLoadable = get(userLoadableAtom);
  const postsLoadable = get(userPostsLoadableAtom);

  if (userLoadable.state === 'loading' || postsLoadable.state === 'loading') {
    return { state: 'loading' };
  }

  if (userLoadable.state === 'hasError' || postsLoadable.state === 'hasError') {
    return {
      state: 'hasError',
      error: userLoadable.error || postsLoadable.error
    };
  }

  return {
    state: 'hasData',
    data: {
      user: userLoadable.data,
      posts: postsLoadable.data,
      postCount: postsLoadable.data.length
    }
  };
});

// 使用
function UserProfile() {
  const userWithPosts = useAtomValue(userWithPostsAtom);

  if (userWithPosts.state === 'loading') {
    return <div>Loading...</div>;
  }

  if (userWithPosts.state === 'hasError') {
    return <div>Error: {userWithPosts.error.message}</div>;
  }

  const { user, posts, postCount } = userWithPosts.data;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <h2>Posts ({postCount})</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Atoms工具函数

### 1. Atom工厂函数

```jsx
// 创建计数器atom
function createCounterAtoms(initialValue = 0) {
  const countAtom = atom(initialValue);

  const incrementAtom = atom(
    null,
    (get, set) => set(countAtom, get(countAtom) + 1)
  );

  const decrementAtom = atom(
    null,
    (get, set) => set(countAtom, get(countAtom) - 1)
  );

  const resetAtom = atom(
    null,
    (get, set) => set(countAtom, initialValue)
  );

  return {
    countAtom,
    incrementAtom,
    decrementAtom,
    resetAtom
  };
}

// 使用
const counter1 = createCounterAtoms(0);
const counter2 = createCounterAtoms(100);

function TwoCounters() {
  const [count1, setCount1] = useAtom(counter1.countAtom);
  const increment1 = useSetAtom(counter1.incrementAtom);

  const [count2, setCount2] = useAtom(counter2.countAtom);
  const increment2 = useSetAtom(counter2.incrementAtom);

  return (
    <div>
      <div>
        <p>Counter 1: {count1}</p>
        <button onClick={increment1}>+</button>
      </div>
      <div>
        <p>Counter 2: {count2}</p>
        <button onClick={increment2}>+</button>
      </div>
    </div>
  );
}
```

### 2. Atom组合工具

```jsx
// 组合多个atoms为一个对象
function combineAtoms(atoms) {
  return atom((get) => {
    const result = {};
    Object.entries(atoms).forEach(([key, atom]) => {
      result[key] = get(atom);
    });
    return result;
  });
}

// 使用
const userAtom = atom({ name: 'Alice', age: 30 });
const settingsAtom = atom({ theme: 'dark', language: 'en' });

const combinedAtom = combineAtoms({
  user: userAtom,
  settings: settingsAtom
});

function Combined() {
  const combined = useAtomValue(combinedAtom);
  return (
    <div>
      <p>{combined.user.name}</p>
      <p>{combined.settings.theme}</p>
    </div>
  );
}
```

### 3. 条件Atom选择器

```jsx
function selectAtom(conditionAtom, trueAtom, falseAtom) {
  return atom((get) => {
    const condition = get(conditionAtom);
    return condition ? get(trueAtom) : get(falseAtom);
  });
}

// 使用
const isDarkModeAtom = atom(false);
const darkThemeAtom = atom({ bg: 'black', text: 'white' });
const lightThemeAtom = atom({ bg: 'white', text: 'black' });

const currentThemeAtom = selectAtom(
  isDarkModeAtom,
  darkThemeAtom,
  lightThemeAtom
);

function ThemeDisplay() {
  const theme = useAtomValue(currentThemeAtom);
  return (
    <div style={{ background: theme.bg, color: theme.text }}>
      Theme colors
    </div>
  );
}
```

## 性能优化

### 1. 避免不必要的计算

```jsx
// 不好：每次都重新计算
const expensiveAtom = atom((get) => {
  const data = get(dataAtom);
  return expensiveComputation(data); // 每次都计算
});

// 好：使用缓存
const cachedExpensiveAtom = atom((get) => {
  const data = get(dataAtom);
  // Jotai自动缓存，只在data变化时重新计算
  return expensiveComputation(data);
});
```

### 2. 分离关注点

```jsx
// 不好：一个大atom
const appStateAtom = atom({
  user: null,
  cart: [],
  products: [],
  ui: { theme: 'light', sidebarOpen: false }
});

// 好：拆分为多个atoms
const userAtom = atom(null);
const cartAtom = atom([]);
const productsAtom = atom([]);
const themeAtom = atom('light');
const sidebarOpenAtom = atom(false);
```

### 3. 使用只写Atoms

```jsx
// 不触发渲染的操作
const logAtom = atom(
  null,
  (get, set, message) => {
    console.log(message, get(dataAtom));
  }
);

// analytics atom
const trackEventAtom = atom(
  null,
  (get, set, event) => {
    analytics.track(event.name, event.properties);
  }
);
```

## 最佳实践

### 1. Atom命名规范

```jsx
// 数据atoms
const userAtom = atom(null);
const productsAtom = atom([]);

// 派生atoms
const filteredProductsAtom = atom((get) => {/*...*/});
const sortedProductsAtom = atom((get) => {/*...*/});

// Action atoms
const addProductAtom = atom(null, (get, set, product) => {/*...*/});
const removeProductAtom = atom(null, (get, set, id) => {/*...*/});
```

### 2. 组织Atoms

```jsx
// atoms/user.js
export const userAtom = atom(null);
export const isLoggedInAtom = atom((get) => !!get(userAtom));
export const loginAtom = atom(null, async (get, set, credentials) => {
  const user = await loginAPI(credentials);
  set(userAtom, user);
});

// atoms/cart.js
export const cartItemsAtom = atom([]);
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});
```

### 3. 类型安全

```typescript
import { atom } from 'jotai';

interface User {
  id: number;
  name: string;
}

const userAtom = atom<User | null>(null);

const userNameAtom = atom(
  (get) => get(userAtom)?.name ?? 'Guest'
);

const updateUserAtom = atom(
  null,
  (get, set, updates: Partial<User>) => {
    const currentUser = get(userAtom);
    if (currentUser) {
      set(userAtom, { ...currentUser, ...updates });
    }
  }
);
```

## 总结

Jotai的atoms组合模式强大而灵活，关键要点：

1. **基础组合**：读取、写入、链式组合
2. **高级模式**：条件、数组、对象、递归组合
3. **实用场景**：表单、数据流、异步操作
4. **工具函数**：atom工厂、组合工具、选择器
5. **性能优化**：避免重复计算、分离关注点
6. **最佳实践**：规范命名、合理组织、类型安全

通过合理组合atoms，可以构建复杂而高效的状态管理系统。

