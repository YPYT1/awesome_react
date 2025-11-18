# 从React 18迁移到React 19

## 学习目标

通过本章学习，你将掌握：

- React 19迁移步骤
- 兼容性检查
- 常见迁移问题
- 代码升级策略
- 渐进式迁移方法
- 测试和验证
- 性能优化建议
- 回滚方案

## 第一部分：迁移准备

### 1.1 版本兼容性检查

```bash
# 检查当前React版本
npm list react react-dom

# 检查依赖包兼容性
npx react-codemod --help

# 检查项目配置
node --version  # 需要Node 18+
npm --version   # 需要npm 8+
```

### 1.2 项目评估

```javascript
// 评估清单
const migrationChecklist = {
  // 1. 基础要求
  basics: {
    nodeVersion: '>=18.0.0',
    npmVersion: '>=8.0.0',
    reactVersion: '18.x',
    typescript: '>=4.5.0'
  },
  
  // 2. 依赖检查
  dependencies: [
    'react-dom',
    'react-router',
    'redux',
    'react-query',
    // ... 其他依赖
  ],
  
  // 3. 代码模式
  codePatterns: {
    classComponents: 0,      // 统计数量
    functionalComponents: 0,
    contextUsage: 0,
    customHooks: 0
  },
  
  // 4. 构建工具
  buildTools: {
    webpack: '5.x',
    vite: '4.x',
    next: '14.x'
  }
};

// 运行评估
function assessProject() {
  console.log('=== React 19迁移评估 ===');
  
  // 检查Node版本
  const nodeVersion = process.version;
  console.log(`Node版本: ${nodeVersion}`);
  
  // 检查依赖
  const packageJson = require('./package.json');
  console.log('依赖检查:');
  console.log(`React: ${packageJson.dependencies.react}`);
  console.log(`React-DOM: ${packageJson.dependencies['react-dom']}`);
  
  // 检查文件统计
  // ... 统计代码
}
```

### 1.3 备份和分支策略

```bash
# 1. 创建备份分支
git checkout -b backup/pre-react-19
git push origin backup/pre-react-19

# 2. 创建迁移分支
git checkout -b feat/upgrade-react-19

# 3. 提交当前状态
git add .
git commit -m "chore: 准备React 19迁移"
```

## 第二部分：基础升级

### 2.1 升级核心包

```bash
# 方案1：使用npm
npm install react@19 react-dom@19

# 方案2：使用yarn
yarn add react@19 react-dom@19

# 方案3：使用pnpm
pnpm add react@19 react-dom@19

# 同时升级相关包
npm install @types/react@19 @types/react-dom@19
```

### 2.2 升级相关依赖

```bash
# React Router
npm install react-router-dom@latest

# Redux相关
npm install react-redux@latest
npm install @reduxjs/toolkit@latest

# React Query
npm install @tanstack/react-query@latest

# Testing Library
npm install @testing-library/react@latest
npm install @testing-library/react-hooks@latest

# Next.js (如果使用)
npm install next@latest

# 其他常用库
npm install react-hook-form@latest
npm install formik@latest
npm install react-spring@latest
```

### 2.3 更新构建配置

```javascript
// webpack.config.js
module.exports = {
  // ... 其他配置
  
  resolve: {
    alias: {
      // React 19使用新的导出
      'react/jsx-runtime': 'react/jsx-runtime',
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime'
    }
  },
  
  // 启用React 19编译器
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-react', {
                runtime: 'automatic',
                development: process.env.NODE_ENV === 'development'
              }]
            ],
            plugins: [
              // React 19编译器插件
              ['react-compiler', {
                enableOptimization: true
              }]
            ]
          }
        }
      }
    ]
  }
};

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // 启用React 19特性
      babel: {
        plugins: [
          ['react-compiler', {
            enableOptimization: true
          }]
        ]
      }
    })
  ]
});

// next.config.js
module.exports = {
  experimental: {
    // 启用React 19 Server Components
    serverComponents: true,
    
    // 启用编译器
    reactCompiler: true
  }
};
```

## 第三部分：代码迁移

### 3.1 移除手动优化

```jsx
// ❌ React 18：手动优化
import { useMemo, useCallback, memo } from 'react';

const List = memo(function List({ items, onItemClick }) {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  
  const handleClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

// ✅ React 19：编译器自动优化
function List({ items, onItemClick }) {
  // 不再需要useMemo、useCallback、memo
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  
  const handleClick = (id) => {
    onItemClick(id);
  };
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### 3.2 使用新的Hooks

```jsx
// ❌ React 18：复杂的数据获取
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => { cancelled = true };
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;
  
  return <div>{user.name}</div>;
}

// ✅ React 19：使用use()
import { use } from 'react';

function UserProfile({ userId }) {
  const userPromise = fetch(`/api/users/${userId}`).then(res => res.json());
  const user = use(userPromise);
  
  return <div>{user.name}</div>;
}

// Suspense和ErrorBoundary处理loading和error
function App() {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <UserProfile userId={123} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.3 表单迁移

```jsx
// ❌ React 18：手动表单处理
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(email, password);
      // 处理成功
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={loading}
      />
      {error && <div>{error}</div>}
      <button disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}

// ✅ React 19：使用useActionState
import { useActionState } from 'react';

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  
  return (
    <form action={formAction}>
      <input name="email" disabled={isPending} />
      <input name="password" type="password" disabled={isPending} />
      {state?.error && <div>{state.error}</div>}
      <button disabled={isPending}>
        {isPending ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}

async function loginAction(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const result = await login(email, password);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
```

### 3.4 Context简化

```jsx
// ❌ React 18：需要Provider
import { createContext, useContext } from 'react';

const ThemeContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}

// ✅ React 19：Context即Provider
import { createContext, useContext } from 'react';

const ThemeContext = createContext();

function App() {
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}

function Page() {
  const theme = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}
```

### 3.5 ref简化

```jsx
// ❌ React 18：使用forwardRef
import { forwardRef } from 'react';

const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// ✅ React 19：ref作为普通prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

## 第四部分：渐进式迁移

### 4.1 分阶段迁移计划

```
阶段1：基础升级（1周）
✅ 升级React和相关依赖
✅ 更新构建配置
✅ 确保应用正常运行
✅ 运行现有测试

阶段2：启用编译器（1-2周）
✅ 配置编译器
✅ 移除简单的手动优化
✅ 测试性能改善
✅ 修复问题

阶段3：采用新API（2-4周）
✅ 迁移数据获取到use()
✅ 使用useActionState处理表单
✅ 简化Context和ref
✅ 测试新功能

阶段4：高级特性（可选）
✅ 采用Server Components
✅ 使用资源预加载API
✅ 优化性能
✅ 最终测试
```

### 4.2 逐个功能迁移

```javascript
// 1. 识别迁移候选
const migrationTargets = [
  {
    file: 'UserProfile.jsx',
    pattern: 'useEffect + fetch',
    priority: 'high',
    newAPI: 'use()'
  },
  {
    file: 'LoginForm.jsx',
    pattern: 'form handling',
    priority: 'high',
    newAPI: 'useActionState'
  },
  {
    file: 'ProductList.jsx',
    pattern: 'useMemo + useCallback',
    priority: 'medium',
    newAPI: '编译器自动优化'
  }
];

// 2. 逐个迁移
migrationTargets.forEach(target => {
  console.log(`迁移 ${target.file}`);
  
  // a. 创建新文件或分支
  // b. 实现新API
  // c. 测试功能
  // d. 对比性能
  // e. 合并或回滚
});
```

### 4.3 并行运行测试

```javascript
// 同时测试React 18和19版本
// package.json
{
  "scripts": {
    "test:react18": "REACT_VERSION=18 jest",
    "test:react19": "REACT_VERSION=19 jest",
    "test:both": "npm run test:react18 && npm run test:react19"
  }
}

// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^react$': process.env.REACT_VERSION === '18' 
      ? 'react-18' 
      : 'react',
    '^react-dom$': process.env.REACT_VERSION === '18'
      ? 'react-dom-18'
      : 'react-dom'
  }
};
```

## 第五部分：测试和验证

### 5.1 单元测试

```jsx
// 测试React 19新特性
import { render, screen, waitFor } from '@testing-library/react';
import { use } from 'react';

describe('UserProfile with use()', () => {
  it('should fetch and display user', async () => {
    const userPromise = Promise.resolve({ name: 'Alice' });
    
    function UserProfile() {
      const user = use(userPromise);
      return <div>{user.name}</div>;
    }
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <UserProfile />
      </Suspense>
    );
    
    // 初始显示loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});
```

### 5.2 集成测试

```jsx
// 测试完整流程
describe('Login Flow', () => {
  it('should login with Server Action', async () => {
    const { user } = render(<LoginForm />);
    
    // 输入凭证
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // 提交表单
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    // 验证成功
    await waitFor(() => {
      expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
  });
});
```

### 5.3 性能测试

```javascript
// 对比性能
import { measurePerformance } from './test-utils';

describe('Performance Comparison', () => {
  it('React 19 should be faster', async () => {
    // React 18版本
    const react18Time = await measurePerformance(() => {
      render(<ProductListReact18 items={largeDataset} />);
    });
    
    // React 19版本
    const react19Time = await measurePerformance(() => {
      render(<ProductListReact19 items={largeDataset} />);
    });
    
    // React 19应该更快
    expect(react19Time).toBeLessThan(react18Time);
    console.log(`性能提升: ${((react18Time - react19Time) / react18Time * 100).toFixed(1)}%`);
  });
});
```

### 5.4 E2E测试

```javascript
// Playwright E2E测试
import { test, expect } from '@playwright/test';

test('Complete user flow', async ({ page }) => {
  // 访问应用
  await page.goto('https://app.example.com');
  
  // 测试关键功能
  await page.click('text=Products');
  await expect(page).toHaveURL('/products');
  
  // 测试搜索
  await page.fill('input[name=search]', 'laptop');
  await page.waitForLoadState('networkidle');
  
  // 验证结果
  const products = await page.locator('.product-card').count();
  expect(products).toBeGreaterThan(0);
  
  // 测试购物车
  await page.click('.product-card:first-child button');
  await expect(page.locator('.cart-badge')).toHaveText('1');
});
```

## 第六部分：常见迁移问题和解决方案

### 6.1 依赖兼容性问题

```javascript
// 问题：第三方库不兼容React 19
// 解决方案1：使用peerDependencies范围
{
  "dependencies": {
    "some-library": "^2.0.0"  // 检查是否支持React 19
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}

// 解决方案2：使用overrides强制版本
{
  "overrides": {
    "some-library": {
      "react": "19.0.0"
    }
  }
}

// 解决方案3：创建兼容层
// react-19-compat.js
export function wrapComponent(Component) {
  return function WrappedComponent(props) {
    // 处理React 18 → 19的prop变化
    const compatProps = transformProps(props);
    return <Component {...compatProps} />;
  };
}

function transformProps(props) {
  // 转换不兼容的props
  return {
    ...props,
    // 例如：ref转换
    ref: props.forwardedRef || props.ref
  };
}

// 使用示例
import ThirdPartyComponent from 'some-library';
import { wrapComponent } from './react-19-compat';

const CompatComponent = wrapComponent(ThirdPartyComponent);

function App() {
  return <CompatComponent />;
}
```

### 6.2 TypeScript类型错误

```typescript
// 问题：React 19的类型定义变化
// React 18
interface Props {
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}

// React 19 - ref现在是标准prop
interface Props {
  ref?: React.RefObject<HTMLDivElement>;  // 类型简化
  children: React.ReactNode;
}

// 解决方案：更新类型定义
// types.d.ts
declare module 'react' {
  interface FunctionComponent<P = {}> {
    (props: P & { ref?: React.Ref<any> }): React.ReactElement | null;
  }
}

// 或使用新的ComponentPropsWithRef
import { ComponentPropsWithRef } from 'react';

type Props = ComponentPropsWithRef<'div'> & {
  customProp: string;
};

function MyComponent({ customProp, ref, ...props }: Props) {
  return <div ref={ref} {...props}>{customProp}</div>;
}

// Context类型更新
// React 18
const ThemeContext = createContext<string | undefined>(undefined);

// React 19 - Provider内置
const ThemeContext = createContext<string>('light');

function App() {
  // React 18
  return (
    <ThemeContext.Provider value="dark">
      <Page />
    </ThemeContext.Provider>
  );
  
  // React 19
  return (
    <ThemeContext value="dark">
      <Page />
    </ThemeContext>
  );
}
```

### 6.3 Server Components迁移

```jsx
// 问题：从客户端组件迁移到Server Components
// 步骤1：识别可转换的组件
const serverComponentCandidates = [
  // 静态内容
  'Header.jsx',
  'Footer.jsx',
  'ProductInfo.jsx',
  
  // 数据获取组件
  'ProductList.jsx',
  'UserProfile.jsx',
  'BlogPost.jsx'
];

// 步骤2：分离客户端逻辑
// ❌ 原组件（客户端）
function ProductList() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts);
  }, []);
  
  const filteredProducts = products.filter(p => 
    filter === 'all' || p.category === filter
  );
  
  return (
    <div>
      <FilterButtons value={filter} onChange={setFilter} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}

// ✅ 拆分为Server + Client组件
// ProductList.server.jsx (Server Component)
async function ProductList() {
  const products = await db.products.findAll();
  
  return (
    <div>
      <ProductFilter products={products} />
    </div>
  );
}

// ProductFilter.client.jsx (Client Component)
'use client';
import { useState } from 'react';

function ProductFilter({ products }) {
  const [filter, setFilter] = useState('all');
  
  const filteredProducts = products.filter(p => 
    filter === 'all' || p.category === filter
  );
  
  return (
    <>
      <FilterButtons value={filter} onChange={setFilter} />
      <ProductGrid products={filteredProducts} />
    </>
  );
}

// 步骤3：处理数据传递
// Server Component可以传递序列化数据给Client Component
async function ServerPage() {
  const data = await fetchData();
  
  // ✅ 传递普通数据
  return <ClientComponent data={data} />;
  
  // ❌ 不能传递函数或复杂对象
  // return <ClientComponent onUpdate={handleUpdate} />;
}
```

### 6.4 测试迁移问题

```jsx
// 问题：测试工具不兼容
// 解决方案：更新测试配置

// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // React 19需要的配置
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic'  // React 19自动JSX
          }
        }
      }
    }]
  },
  
  // 处理use()等异步Hooks
  testTimeout: 10000
};

// jest.setup.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// 支持React 19的Suspense测试
configure({ asyncUtilTimeout: 5000 });

// 模拟Server Actions
global.FormData = FormData;

// 测试use() Hook
import { render, waitFor } from '@testing-library/react';
import { use, Suspense } from 'react';

test('use() Hook', async () => {
  const dataPromise = Promise.resolve({ name: 'Test' });
  
  function Component() {
    const data = use(dataPromise);
    return <div>{data.name}</div>;
  }
  
  const { getByText } = render(
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
  
  // 等待Suspense解析
  await waitFor(() => {
    expect(getByText('Test')).toBeInTheDocument();
  });
});

// 测试Server Actions
import { useActionState } from 'react';
import { render, screen, userEvent } from '@testing-library/react';

test('useActionState', async () => {
  async function submitAction(prevState, formData) {
    const value = formData.get('input');
    return { success: true, value };
  }
  
  function Form() {
    const [state, action, isPending] = useActionState(submitAction, null);
    
    return (
      <form action={action}>
        <input name="input" />
        <button disabled={isPending}>Submit</button>
        {state?.value && <div>Value: {state.value}</div>}
      </form>
    );
  }
  
  const user = userEvent.setup();
  render(<Form />);
  
  await user.type(screen.getByRole('textbox'), 'Test');
  await user.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Value: Test')).toBeInTheDocument();
  });
});
```

### 6.5 性能回退问题

```javascript
// 问题：迁移后性能反而下降
// 排查步骤：

// 1. 检查编译器是否正确启用
console.log(window.__REACT_COMPILER__);  // 应该是true

// 2. 分析bundle大小
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html'
    })
  ]
};

// 3. 检查是否有未优化的代码
// 使用React DevTools Profiler
function PerformanceChecker() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 16) {  // 超过一帧
          console.warn('Slow render:', {
            name: entry.name,
            duration: entry.duration
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
}

// 4. 比对React 18 vs 19性能
async function comparePerformance() {
  const metrics = {
    react18: await measureReact18Performance(),
    react19: await measureReact19Performance()
  };
  
  console.table({
    'FCP': {
      'React 18': metrics.react18.fcp + 'ms',
      'React 19': metrics.react19.fcp + 'ms',
      'Change': ((metrics.react19.fcp - metrics.react18.fcp) / metrics.react18.fcp * 100).toFixed(1) + '%'
    },
    'LCP': {
      'React 18': metrics.react18.lcp + 'ms',
      'React 19': metrics.react19.lcp + 'ms',
      'Change': ((metrics.react19.lcp - metrics.react18.lcp) / metrics.react18.lcp * 100).toFixed(1) + '%'
    }
  });
}

// 5. 修复常见性能问题
// 问题：过度使用客户端组件
// ❌ 全部客户端组件
'use client';

async function Page() {
  const data = await fetchData();  // 浪费，应该在服务器端
  return <ClientContent data={data} />;
}

// ✅ 合理拆分
async function Page() {  // Server Component
  const data = await fetchData();
  return <ClientContent data={data} />;
}

'use client';
function ClientContent({ data }) {  // Client Component
  const [filter, setFilter] = useState('all');
  // 客户端交互逻辑
}
```

### 6.6 生产环境部署

```javascript
// 部署清单
const deploymentChecklist = {
  // 1. 构建优化
  build: {
    nodeVersion: 'v18+',
    reactVersion: '19.0.0',
    productionMode: true,
    sourceMaps: false,  // 生产环境关闭
    minification: true,
    treeshaking: true
  },
  
  // 2. 环境变量
  env: {
    NODE_ENV: 'production',
    REACT_APP_API_URL: process.env.API_URL,
    // React 19特性开关
    ENABLE_COMPILER: 'true',
    ENABLE_SERVER_COMPONENTS: 'true'
  },
  
  // 3. CDN配置
  cdn: {
    staticAssets: 'https://cdn.example.com/assets',
    images: 'https://cdn.example.com/images',
    fonts: 'https://cdn.example.com/fonts'
  },
  
  // 4. 缓存策略
  caching: {
    htmlFiles: 'no-cache',
    jsFiles: 'max-age=31536000, immutable',
    cssFiles: 'max-age=31536000, immutable',
    images: 'max-age=31536000',
    apiResponses: 'max-age=300'
  },
  
  // 5. 监控配置
  monitoring: {
    errorTracking: 'Sentry',
    performanceMonitoring: 'New Relic',
    analytics: 'Google Analytics',
    realUserMonitoring: true
  }
};

// Dockerfile示例
/*
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
*/

// nginx.conf
/*
server {
  listen 80;
  server_name example.com;
  
  root /usr/share/nginx/html;
  index index.html;
  
  # 启用gzip
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  
  # 缓存策略
  location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # SPA路由
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # API代理
  location /api {
    proxy_pass http://api-server:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
*/

// CI/CD Pipeline (GitHub Actions)
/*
name: Deploy React 19 App

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
          ENABLE_COMPILER: true
      
      - name: Run Lighthouse CI
        run: npm run lighthouse-ci
      
      - name: Deploy to Production
        if: success()
        run: |
          aws s3 sync build/ s3://my-react19-app
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
*/
```

## 第七部分：迁移工具和脚本

### 7.1 自动化迁移脚本

```javascript
// migrate-to-react19.js
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// 1. 移除useMemo/useCallback
function removeManualOptimizations(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  traverse(ast, {
    CallExpression(path) {
      const { callee } = path.node;
      
      // 移除useMemo
      if (callee.name === 'useMemo') {
        const callback = path.node.arguments[0];
        if (callback.type === 'ArrowFunctionExpression') {
          path.replaceWith(callback.body);
        }
      }
      
      // 移除useCallback
      if (callee.name === 'useCallback') {
        const callback = path.node.arguments[0];
        path.replaceWith(callback);
      }
    },
    
    // 移除React.memo
    CallExpression(path) {
      if (
        path.node.callee.type === 'MemberExpression' &&
        path.node.callee.object.name === 'React' &&
        path.node.callee.property.name === 'memo'
      ) {
        path.replaceWith(path.node.arguments[0]);
      }
    }
  });
  
  return generate(ast).code;
}

// 2. 转换forwardRef到普通prop
function convertForwardRef(code) {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  
  traverse(ast, {
    CallExpression(path) {
      if (path.node.callee.name === 'forwardRef') {
        const component = path.node.arguments[0];
        
        if (component.params.length === 2) {
          // 将ref参数移到props中
          const [propsParam, refParam] = component.params;
          component.params = [{
            type: 'ObjectPattern',
            properties: [
              {
                type: 'ObjectProperty',
                key: { type: 'Identifier', name: 'ref' },
                value: refParam
              },
              {
                type: 'RestElement',
                argument: propsParam
              }
            ]
          }];
        }
        
        path.replaceWith(component);
      }
    }
  });
  
  return generate(ast).code;
}

// 3. 批量迁移文件
async function migrateDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await migrateDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      console.log(`Migrating ${filePath}...`);
      
      let code = fs.readFileSync(filePath, 'utf-8');
      
      // 应用转换
      code = removeManualOptimizations(code);
      code = convertForwardRef(code);
      
      // 备份原文件
      fs.writeFileSync(filePath + '.backup', code);
      
      // 写入新代码
      fs.writeFileSync(filePath, code);
      
      console.log(`✓ Migrated ${filePath}`);
    }
  }
}

// 运行迁移
migrateDirectory('./src');
```

### 7.2 依赖检查工具

```javascript
// check-dependencies.js
const { execSync } = require('child_process');
const semver = require('semver');

const requiredVersions = {
  'react': '^19.0.0',
  'react-dom': '^19.0.0',
  '@types/react': '^19.0.0',
  '@types/react-dom': '^19.0.0',
  'typescript': '>=4.5.0',
  'webpack': '>=5.0.0'
};

const knownCompatibleLibraries = {
  'react-router-dom': '^6.20.0',
  'react-redux': '^9.0.0',
  '@tanstack/react-query': '^5.0.0',
  'react-hook-form': '^7.48.0'
};

async function checkDependencies() {
  const packageJson = require('./package.json');
  const issues = [];
  
  // 检查必需版本
  for (const [pkg, version] of Object.entries(requiredVersions)) {
    const installed = packageJson.dependencies[pkg] || packageJson.devDependencies[pkg];
    
    if (!installed) {
      issues.push(`❌ ${pkg} not installed`);
    } else if (!semver.satisfies(installed.replace(/[\^~]/, ''), version.replace(/[\^~><=]/, ''))) {
      issues.push(`⚠️  ${pkg}: ${installed} (需要 ${version})`);
    } else {
      console.log(`✓ ${pkg}: ${installed}`);
    }
  }
  
  // 检查已知兼容库
  for (const [pkg, compatVersion] of Object.entries(knownCompatibleLibraries)) {
    const installed = packageJson.dependencies[pkg];
    
    if (installed && !semver.satisfies(installed.replace(/[\^~]/, ''), compatVersion.replace(/[\^~><=]/, ''))) {
      issues.push(`⚠️  ${pkg}: ${installed} 可能不兼容（建议 ${compatVersion}）`);
    }
  }
  
  // 输出结果
  if (issues.length > 0) {
    console.log('\n存在以下问题：');
    issues.forEach(issue => console.log(issue));
    console.log('\n建议运行: npm run upgrade-deps');
  } else {
    console.log('\n✅ 所有依赖都兼容React 19！');
  }
}

checkDependencies();
```

### 7.3 性能对比工具

```javascript
// compare-performance.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function comparePerformance() {
  // 测试React 18版本
  const react18Metrics = await runLighthouse('http://localhost:3000');
  
  // 切换到React 19
  console.log('Switching to React 19...');
  execSync('npm install react@19 react-dom@19');
  execSync('npm run build');
  
  // 测试React 19版本
  const react19Metrics = await runLighthouse('http://localhost:3000');
  
  // 对比结果
  console.log('\n=== Performance Comparison ===\n');
  
  console.table({
    'Performance Score': {
      'React 18': react18Metrics.performance,
      'React 19': react19Metrics.performance,
      'Change': getChange(react18Metrics.performance, react19Metrics.performance)
    },
    'FCP': {
      'React 18': react18Metrics.fcp + 'ms',
      'React 19': react19Metrics.fcp + 'ms',
      'Change': getChange(react18Metrics.fcp, react19Metrics.fcp)
    },
    'LCP': {
      'React 18': react18Metrics.lcp + 'ms',
      'React 19': react19Metrics.lcp + 'ms',
      'Change': getChange(react18Metrics.lcp, react19Metrics.lcp)
    },
    'TTI': {
      'React 18': react18Metrics.tti + 'ms',
      'React 19': react19Metrics.tti + 'ms',
      'Change': getChange(react18Metrics.tti, react19Metrics.tti)
    },
    'Bundle Size': {
      'React 18': react18Metrics.bundleSize + 'KB',
      'React 19': react19Metrics.bundleSize + 'KB',
      'Change': getChange(react18Metrics.bundleSize, react19Metrics.bundleSize)
    }
  });
}

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port
  };
  
  const runnerResult = await lighthouse(url, options);
  
  await chrome.kill();
  
  return {
    performance: runnerResult.lhr.categories.performance.score * 100,
    fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
    lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
    tti: runnerResult.lhr.audits['interactive'].numericValue,
    bundleSize: runnerResult.lhr.audits['total-byte-weight'].numericValue / 1024
  };
}

function getChange(before, after) {
  const change = ((after - before) / before * 100).toFixed(1);
  return change > 0 ? `+${change}%` : `${change}%`;
}

comparePerformance();
```

## 注意事项

### 1. Breaking Changes

```
需要注意的破坏性变更：

✅ 某些内部API可能变化
✅ 第三方库可能不兼容
✅ TypeScript类型定义更新
✅ 测试工具需要更新
✅ 构建配置需要调整
✅ 某些Hook的行为变化
```

### 2. 性能监控

```javascript
// 监控迁移后的性能
import { onCLS, onFID, onLCP } from 'web-vitals';

function monitorPerformance() {
  onCLS(metric => {
    sendToAnalytics('react19-cls', metric.value);
  });
  
  onFID(metric => {
    sendToAnalytics('react19-fid', metric.value);
  });
  
  onLCP(metric => {
    sendToAnalytics('react19-lcp', metric.value);
  });
}
```

### 3. 回滚计划

```bash
# 如果遇到问题，回滚到React 18
git checkout backup/pre-react-19

# 或者只回滚依赖
npm install react@18 react-dom@18

# 重新构建
npm run build
```

### 4. 团队培训

```
迁移前的准备工作：

✅ 学习React 19新特性
✅ 理解编译器工作原理
✅ 掌握Server Components
✅ 了解新的Hooks API
✅ 熟悉迁移工具
✅ 制定代码规范
```

### 5. 文档更新

```
需要更新的文档：

✅ 项目README
✅ 开发指南
✅ API文档
✅ 部署流程
✅ 故障排查指南
✅ 最佳实践
```

## 常见问题

### Q1: 迁移需要多长时间？

**A:** 小项目1-2周，中型项目4-6周，大型项目2-3个月。

**详细时间分配：**
```
小型项目（<100个组件）：
- 升级依赖：1天
- 配置构建：1天
- 代码迁移：3-5天
- 测试验证：2-3天
- 总计：1-2周

中型项目（100-500个组件）：
- 升级依赖：2天
- 配置构建：2-3天
- 代码迁移：10-15天
- 测试验证：5-7天
- 性能优化：3-5天
- 总计：4-6周

大型项目（500+个组件）：
- 准备评估：1周
- 升级依赖：3-5天
- 配置构建：5-7天
- 代码迁移：4-6周
- 测试验证：2-3周
- 性能优化：1-2周
- 团队培训：1周
- 总计：2-3个月
```

### Q2: 是否需要重写所有代码？

**A:** 不需要，React 19向后兼容，可以渐进式迁移。

**兼容性说明：**
```jsx
// ✅ 这些代码在React 19中仍然工作
function OldComponent() {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    // ...
  }, []);
  
  const memoValue = useMemo(() => {
    return expensiveCalculation();
  }, [deps]);
  
  return <div>{state}</div>;
}

// ✅ 类组件也兼容
class ClassComponent extends React.Component {
  render() {
    return <div>Still works!</div>;
  }
}

// ✅ forwardRef仍然支持
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 但推荐逐步迁移到新API
function NewComponent() {
  const [state, setState] = useState(0);
  
  // 编译器自动优化，不需要useMemo
  const memoValue = expensiveCalculation();
  
  return <div>{state}</div>;
}

// ref作为prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

### Q3: 第三方库不兼容怎么办？

**A:** 等待库更新，或寻找替代方案，或暂时保留React 18。

**处理策略：**
```jsx
// 策略1：检查库的兼容性
const libraryCompatibility = {
  'react-router-dom': {
    compatible: true,
    minVersion: '^6.20.0',
    migration: '直接升级'
  },
  'react-redux': {
    compatible: true,
    minVersion: '^9.0.0',
    migration: '升级到v9'
  },
  'old-library': {
    compatible: false,
    alternative: 'new-library',
    migration: '替换为new-library'
  }
};

// 策略2：使用版本锁定
{
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "incompatible-lib": "^2.0.0"
  },
  "resolutions": {
    "incompatible-lib/react": "18.0.0"  // 强制该库使用React 18
  }
}

// 策略3：创建兼容层
import OldLibraryComponent from 'old-library';

function CompatWrapper(props) {
  // 转换props以兼容React 19
  const compatProps = {
    ...props,
    ref: props.forwardedRef  // 处理ref变化
  };
  
  return <OldLibraryComponent {...compatProps} />;
}

// 策略4：条件渲染
function SmartComponent() {
  const reactVersion = React.version;
  
  if (reactVersion.startsWith('19')) {
    return <React19Component />;
  } else {
    return <React18Component />;
  }
}
```

### Q4: 如何验证迁移成功？

**A:** 运行全部测试，检查性能指标，进行用户测试。

**验证清单：**
```javascript
const verificationChecklist = {
  // 1. 功能验证
  functionality: {
    allTestsPassed: true,
    criticalPathsTested: true,
    edgeCasesCovered: true,
    crossBrowserTested: true
  },
  
  // 2. 性能验证
  performance: {
    lighthouseScore: '>= 90',
    fcpImprovement: '+20%',
    lcpImprovement: '+30%',
    ttiImprovement: '+40%'
  },
  
  // 3. 兼容性验证
  compatibility: {
    allDepsCompatible: true,
    noConsoleErrors: true,
    noTypeErrors: true,
    noRuntimeErrors: true
  },
  
  // 4. 用户验证
  userTesting: {
    betaTestingCompleted: true,
    feedbackPositive: true,
    noCriticalBugs: true
  }
};

// 自动验证脚本
async function verifyMigration() {
  console.log('开始验证迁移...\n');
  
  // 运行测试
  console.log('1. 运行测试套件...');
  const testResult = execSync('npm test').toString();
  console.log(testResult);
  
  // 检查性能
  console.log('2. 运行Lighthouse...');
  const perfResult = await runLighthouse('http://localhost:3000');
  console.log(`Performance Score: ${perfResult.score}`);
  
  // 检查类型
  console.log('3. 检查TypeScript类型...');
  const typeCheckResult = execSync('npm run type-check').toString();
  console.log(typeCheckResult);
  
  // 检查依赖
  console.log('4. 检查依赖兼容性...');
  const depsResult = execSync('npm run check-deps').toString();
  console.log(depsResult);
  
  console.log('\n验证完成！');
}
```

### Q5: 迁移后性能没有提升怎么办？

**A:** 检查编译器配置，确保启用了所有优化特性。

```javascript
// 问题排查步骤
const troubleshooting = {
  // 1. 检查编译器是否启用
  checkCompiler: () => {
    console.log('React Compiler:', window.__REACT_COMPILER__ ? '✅ 已启用' : '❌ 未启用');
  },
  
  // 2. 检查构建配置
  checkBuildConfig: () => {
    // babel.config.js
    const config = {
      plugins: [
        ['react-compiler', {
          enableOptimization: true  // 确保开启
        }]
      ]
    };
    console.log('Build Config:', config);
  },
  
  // 3. 分析bundle大小
  analyzeBundleSize: async () => {
    const analyzer = new BundleAnalyzerPlugin();
    // 查看是否有未tree-shake的代码
  },
  
  // 4. 检查是否有性能反模式
  checkAntiPatterns: () => {
    // 查找过度使用'use client'
    // 查找未优化的大型组件
    // 查找不必要的重新渲染
  }
};

// 优化建议
function optimizationSuggestions() {
  return [
    '✅ 启用React Compiler',
    '✅ 移除手动优化（useMemo/useCallback）',
    '✅ 采用Server Components',
    '✅ 使用新的Hooks（use, useActionState）',
    '✅ 配置资源预加载',
    '✅ 优化代码分割',
    '✅ 减少客户端JavaScript'
  ];
}
```

### Q6: 如何处理迁移中的TypeScript错误？

**A:** 更新@types包，调整类型定义，使用新的类型工具。

```typescript
// 常见TypeScript问题和解决方案

// 问题1：ref类型错误
// ❌ React 18
interface Props {
  ref?: React.Ref<HTMLDivElement>;
}

// ✅ React 19
interface Props {
  ref?: React.RefObject<HTMLDivElement> | null;
}

// 或使用ComponentPropsWithRef
type Props = React.ComponentPropsWithRef<'div'> & {
  customProp: string;
};

// 问题2：Context类型
// ❌ React 18
const Context = createContext<Theme | undefined>(undefined);

// ✅ React 19
const Context = createContext<Theme>({ mode: 'light' });

// 问题3：forwardRef类型
// ❌ React 18
const Component = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div ref={ref} {...props} />;
});

// ✅ React 19 - ref作为prop
function Component({ ref, ...props }: Props & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props} />;
}

// 问题4：use() Hook类型
// React 19新增
import { use } from 'react';

function Component({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise);  // TypeScript自动推断类型
  return <div>{data.name}</div>;
}

// 问题5：useActionState类型
import { useActionState } from 'react';

type State = { value: string; error?: string };
type FormAction = (prevState: State, formData: FormData) => Promise<State>;

function Form() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (prevState, formData) => {
      // TypeScript知道formData是FormData类型
      const value = formData.get('input') as string;
      return { value };
    },
    { value: '' }
  );
  
  return <form action={formAction}>...</form>;
}
```

### Q7: 是否需要迁移所有组件到Server Components？

**A:** 不需要，只迁移适合的组件，保持Server和Client组件的平衡。

```jsx
// 决策树：Server vs Client Component

// ✅ 适合Server Component：
// - 静态内容展示
// - 数据获取密集
// - SEO重要
// - 不需要交互

async function ProductPage({ id }) {
  const product = await db.products.findById(id);
  return (
    <div>
      <h1>{product.name}</h1>
      <ProductImages images={product.images} />  {/* Server */}
      <ProductDescription text={product.description} />  {/* Server */}
      <ProductReviews productId={id} />  {/* Server */}
      <AddToCartButton productId={id} />  {/* Client - 需要交互 */}
    </div>
  );
}

// ✅ 必须Client Component：
// - 需要状态管理
// - 需要事件处理
// - 使用浏览器API
// - 需要实时更新

'use client';
function AddToCartButton({ productId }) {
  const [adding, setAdding] = useState(false);
  
  const handleClick = async () => {
    setAdding(true);
    await addToCart(productId);
    setAdding(false);
  };
  
  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}

// 混合策略示例
// 1. 根组件（Server）
async function RootLayout({ children }) {
  const settings = await db.settings.get();
  return (
    <html>
      <body>
        <Header settings={settings} />  {/* Server */}
        <Navigation />  {/* Server */}
        {children}
        <Footer />  {/* Server */}
        <ClientAnalytics />  {/* Client - 浏览器API */}
      </body>
    </html>
  );
}

// 2. 页面组件（Server）
async function ProductsPage() {
  const products = await db.products.findAll();
  return (
    <div>
      <ProductFilters />  {/* Client - 状态管理 */}
      <ProductList products={products} />  {/* Server - 只展示 */}
    </div>
  );
}

// 3. 交互组件（Client）
'use client';
function ProductFilters() {
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  return (
    <div>
      <CategorySelect value={category} onChange={setCategory} />
      <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
    </div>
  );
}
```

### Q8: 迁移过程中如何维护旧版本？

**A:** 使用功能分支，并行维护，逐步合并。

```bash
# Git分支策略
main              # 生产分支（React 18）
├── develop       # 开发分支（React 18）
├── feat/react-19 # React 19迁移分支
└── hotfix/*      # 紧急修复（同时应用到两个版本）

# 工作流程
# 1. 创建迁移分支
git checkout -b feat/react-19 develop

# 2. 在迁移分支上工作
git commit -m "upgrade to React 19"

# 3. 定期同步主分支的修复
git checkout feat/react-19
git merge develop

# 4. 测试通过后合并
git checkout develop
git merge feat/react-19

# package.json脚本
{
  "scripts": {
    "start:18": "REACT_VERSION=18 npm start",
    "start:19": "REACT_VERSION=19 npm start",
    "build:18": "REACT_VERSION=18 npm run build",
    "build:19": "REACT_VERSION=19 npm run build",
    "deploy:18": "npm run build:18 && deploy",
    "deploy:19": "npm run build:19 && deploy-beta"
  }
}

# 部署策略
1. React 18部署到生产环境
2. React 19部署到beta环境
3. 逐步迁移用户到React 19
4. 完全迁移后下线React 18
```

### Q9: 如何确保迁移不影响用户体验？

**A:** 使用金丝雀发布、A/B测试、实时监控。

```javascript
// 金丝雀发布配置
const canaryConfig = {
  // 阶段1：内部用户（5%）
  stage1: {
    percentage: 5,
    users: ['internal'],
    duration: '3 days',
    rollbackCondition: 'errorRate > 1%'
  },
  
  // 阶段2：早期采用者（20%）
  stage2: {
    percentage: 20,
    users: ['beta', 'early-adopters'],
    duration: '1 week',
    rollbackCondition: 'errorRate > 0.5%'
  },
  
  // 阶段3：所有用户（100%）
  stage3: {
    percentage: 100,
    users: ['all'],
    duration: 'permanent',
    rollbackCondition: 'errorRate > 0.1%'
  }
};

// A/B测试实现
function ABTestReact19() {
  const [variant, setVariant] = useState(null);
  
  useEffect(() => {
    const userId = getUserId();
    const group = getUserGroup(userId);  // 'react18' or 'react19'
    
    setVariant(group);
    
    // 记录实验组
    trackExperiment('react-19-migration', group);
  }, []);
  
  if (variant === 'react19') {
    return <React19App />;
  } else {
    return <React18App />;
  }
}

// 实时监控
function setupMonitoring() {
  // 错误监控
  window.onerror = (msg, source, lineno, colno, error) => {
    sendToSentry({
      message: msg,
      source,
      lineno,
      colno,
      error,
      reactVersion: React.version
    });
  };
  
  // 性能监控
  onLCP((metric) => {
    if (metric.value > 2500) {  // LCP超过2.5s
      alert('Performance degraded');
      rollbackToReact18();
    }
  });
  
  // 用户体验监控
  trackUserSatisfaction((score) => {
    if (score < 4.0) {  // 满意度低于4.0
      investigateIssues();
    }
  });
}
```

### Q10: 迁移完成后如何清理旧代码？

**A:** 逐步移除过时的代码，更新文档，进行代码审查。

```javascript
// 清理清单
const cleanupChecklist = {
  // 1. 移除过时的优化代码
  removeOptimizations: [
    'useMemo',
    'useCallback',
    'React.memo',
    'PureComponent'
  ],
  
  // 2. 移除兼容层
  removeCompatLayers: [
    'react-19-compat.js',
    'forwardRef wrappers',
    'Context.Provider wrappers'
  ],
  
  // 3. 更新依赖
  updateDependencies: [
    'react@19',
    'react-dom@19',
    '@types/react@19'
  ],
  
  // 4. 清理构建配置
  cleanupConfig: [
    '移除React 18特定配置',
    '更新babel配置',
    '更新webpack配置'
  ]
};

// 自动清理脚本
async function cleanupOldCode() {
  // 查找并移除useMemo
  const files = await glob('src/**/*.{js,jsx,ts,tsx}');
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf-8');
    
    // 移除useMemo
    content = content.replace(/const \w+ = useMemo\(\(\) => ([^,]+), \[[^\]]*\]\);?/g, 'const $1 = $2;');
    
    // 移除useCallback
    content = content.replace(/const \w+ = useCallback\(([^,]+), \[[^\]]*\]\);?/g, 'const $1 = $2;');
    
    // 移除React.memo
    content = content.replace(/export default React\.memo\((\w+)\);?/g, 'export default $1;');
    
    await fs.writeFile(file, content);
    console.log(`✓ Cleaned ${file}`);
  }
  
  console.log('Cleanup complete!');
}
```

## 总结

### 迁移步骤

```
1. 准备和评估
2. 升级核心依赖
3. 更新构建配置
4. 代码迁移
5. 测试验证
6. 性能优化
7. 生产部署
```

### 成功要素

```
✅ 充分准备
✅ 渐进式迁移
✅ 持续测试
✅ 性能监控
✅ 团队培训
✅ 文档更新
```

### 收益

```
✅ 更好的性能
✅ 更简洁的代码
✅ 新的功能
✅ 未来的支持
```

React 19的迁移是值得的投资！
