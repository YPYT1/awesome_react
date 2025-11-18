# Jest测试框架

## 概述

Jest是Facebook开发的JavaScript测试框架,专为React应用设计,提供了零配置、快照测试、代码覆盖率等强大功能。它已成为React生态系统中最流行的测试框架。本文将全面介绍Jest的核心概念、配置方法以及最佳实践。

## Jest核心特性

### 主要优势
- **零配置**: 开箱即用,无需复杂配置
- **快速执行**: 并行运行测试,智能缓存
- **快照测试**: 轻松测试UI组件
- **代码覆盖率**: 内置覆盖率报告
- **Mocking支持**: 强大的模拟功能
- **实时监听**: 文件变化自动重跑测试

## 安装与配置

### 基础安装

```bash
# 安装Jest
npm install --save-dev jest

# TypeScript支持
npm install --save-dev @types/jest ts-jest

# React测试
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### package.json配置

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### jest.config.js详细配置

```javascript
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  
  // 模块路径别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // 安装文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/index.tsx',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // 测试超时
  testTimeout: 10000,
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
};
```

### jest.setup.js

```javascript
// 扩展Jest matchers
import '@testing-library/jest-dom';

// 全局模拟
global.matchMedia = global.matchMedia || function () {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

// 模拟IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// 模拟localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// 模拟fetch
global.fetch = jest.fn();

// 错误抑制(仅测试环境)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
});
```

## 基础测试编写

### 测试文件结构

```typescript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

// sum.test.ts
import { sum } from './sum';

describe('sum', () => {
  it('should add two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
  });
  
  it('should handle negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3);
  });
  
  it('should handle zero', () => {
    expect(sum(0, 5)).toBe(5);
  });
});
```

### Matchers(断言)

```typescript
describe('Jest Matchers', () => {
  // 相等性
  test('equality matchers', () => {
    expect(2 + 2).toBe(4);                    // 严格相等
    expect({ name: 'John' }).toEqual({ name: 'John' }); // 深度相等
    expect([1, 2, 3]).toStrictEqual([1, 2, 3]); // 严格深度相等
  });
  
  // 真值
  test('truthiness matchers', () => {
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect('hello').toBeDefined();
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });
  
  // 数字
  test('number matchers', () => {
    expect(4).toBeGreaterThan(3);
    expect(4).toBeGreaterThanOrEqual(4);
    expect(3).toBeLessThan(4);
    expect(3).toBeLessThanOrEqual(3);
    expect(0.1 + 0.2).toBeCloseTo(0.3);
  });
  
  // 字符串
  test('string matchers', () => {
    expect('team').not.toMatch(/I/);
    expect('Christoph').toMatch(/stop/);
  });
  
  // 数组和可迭代对象
  test('array matchers', () => {
    const shoppingList = ['milk', 'bread', 'eggs'];
    expect(shoppingList).toContain('milk');
    expect(shoppingList).toHaveLength(3);
    expect([1, 2, 3, 4]).toContainEqual(3);
  });
  
  // 对象
  test('object matchers', () => {
    const data = { one: 1, two: 2 };
    expect(data).toHaveProperty('one');
    expect(data).toHaveProperty('two', 2);
    expect(data).toMatchObject({ one: 1 });
  });
  
  // 异常
  test('exception matchers', () => {
    function compileCode() {
      throw new Error('Syntax error');
    }
    expect(() => compileCode()).toThrow();
    expect(() => compileCode()).toThrow(Error);
    expect(() => compileCode()).toThrow('Syntax error');
    expect(() => compileCode()).toThrow(/error/);
  });
});
```

## 异步测试

### Promise测试

```typescript
// api.ts
export async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// api.test.ts
describe('fetchUser', () => {
  it('should fetch user data', async () => {
    const user = await fetchUser(1);
    expect(user).toHaveProperty('id', 1);
    expect(user).toHaveProperty('name');
  });
  
  it('should handle errors', async () => {
    await expect(fetchUser(-1)).rejects.toThrow('User not found');
  });
  
  // 或者使用 .resolves
  it('should fetch user with resolves', () => {
    return expect(fetchUser(1)).resolves.toHaveProperty('id', 1);
  });
});
```

### Callback测试

```typescript
function fetchData(callback: (data: string) => void) {
  setTimeout(() => {
    callback('peanut butter');
  }, 1000);
}

test('the data is peanut butter', (done) => {
  function callback(data: string) {
    try {
      expect(data).toBe('peanut butter');
      done();
    } catch (error) {
      done(error);
    }
  }
  
  fetchData(callback);
});
```

### async/await测试

```typescript
describe('async/await tests', () => {
  it('should work with async/await', async () => {
    const data = await fetchData();
    expect(data).toBe('peanut butter');
  });
  
  it('should handle async errors', async () => {
    expect.assertions(1);
    try {
      await fetchData();
    } catch (error) {
      expect(error).toMatch('error');
    }
  });
});
```

## Mock功能

### 函数Mock

```typescript
describe('Mock Functions', () => {
  it('should mock a function', () => {
    const mockFn = jest.fn();
    mockFn('hello');
    mockFn('world');
    
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('hello');
    expect(mockFn).toHaveBeenLastCalledWith('world');
  });
  
  it('should mock return values', () => {
    const mockFn = jest.fn();
    mockFn
      .mockReturnValue(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(3);
    
    expect(mockFn()).toBe(2);
    expect(mockFn()).toBe(3);
    expect(mockFn()).toBe(1);
    expect(mockFn()).toBe(1);
  });
  
  it('should mock implementations', () => {
    const mockFn = jest.fn((x) => x * 2);
    
    expect(mockFn(2)).toBe(4);
    expect(mockFn(3)).toBe(6);
  });
});
```

### 模块Mock

```typescript
// userService.ts
import axios from 'axios';

export async function getUsers() {
  const response = await axios.get('/api/users');
  return response.data;
}

// userService.test.ts
import axios from 'axios';
import { getUsers } from './userService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getUsers', () => {
  it('should fetch users', async () => {
    const users = [{ id: 1, name: 'John' }];
    mockedAxios.get.mockResolvedValue({ data: users });
    
    const result = await getUsers();
    
    expect(result).toEqual(users);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/users');
  });
});
```

### 部分Mock

```typescript
// utils.ts
export const utils = {
  add: (a: number, b: number) => a + b,
  multiply: (a: number, b: number) => a * b,
};

// test.ts
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  add: jest.fn((a, b) => a + b + 1), // 只mock add方法
}));

import { utils } from './utils';

test('partial mock', () => {
  expect(utils.add(1, 2)).toBe(4); // 使用mock
  expect(utils.multiply(2, 3)).toBe(6); // 使用真实实现
});
```

### Timer Mock

```typescript
describe('Timer Mocks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should execute callback after timeout', () => {
    const callback = jest.fn();
    
    setTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
  
  it('should execute all timers', () => {
    const callback = jest.fn();
    
    setTimeout(callback, 1000);
    setTimeout(callback, 2000);
    
    jest.runAllTimers();
    
    expect(callback).toHaveBeenCalledTimes(2);
  });
  
  it('should execute only pending timers', () => {
    const callback = jest.fn();
    
    setTimeout(() => {
      callback();
      setTimeout(callback, 1000);
    }, 1000);
    
    jest.runOnlyPendingTimers();
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
```

## Setup和Teardown

### 基础用法

```typescript
describe('Setup and Teardown', () => {
  let db: Database;
  
  // 每个测试前执行
  beforeEach(() => {
    db = initializeDatabase();
  });
  
  // 每个测试后执行
  afterEach(() => {
    db.close();
  });
  
  // 所有测试前执行一次
  beforeAll(() => {
    console.log('Starting tests...');
  });
  
  // 所有测试后执行一次
  afterAll(() => {
    console.log('Tests completed');
  });
  
  test('test 1', () => {
    expect(db.isConnected()).toBe(true);
  });
  
  test('test 2', () => {
    expect(db.isConnected()).toBe(true);
  });
});
```

### 作用域

```typescript
describe('outer', () => {
  beforeAll(() => console.log('outer beforeAll'));
  beforeEach(() => console.log('outer beforeEach'));
  afterEach(() => console.log('outer afterEach'));
  afterAll(() => console.log('outer afterAll'));
  
  test('outer test', () => console.log('outer test'));
  
  describe('inner', () => {
    beforeAll(() => console.log('inner beforeAll'));
    beforeEach(() => console.log('inner beforeEach'));
    afterEach(() => console.log('inner afterEach'));
    afterAll(() => console.log('inner afterAll'));
    
    test('inner test', () => console.log('inner test'));
  });
});

// 输出顺序:
// outer beforeAll
// outer beforeEach
// outer test
// outer afterEach
// inner beforeAll
// outer beforeEach
// inner beforeEach
// inner test
// inner afterEach
// outer afterEach
// inner afterAll
// outer afterAll
```

## 快照测试

### UI快照

```typescript
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button Snapshot', () => {
  it('should match snapshot', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });
  
  it('should match inline snapshot', () => {
    const { container } = render(<Button variant="primary">Submit</Button>);
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="btn btn-primary"
      >
        Submit
      </button>
    `);
  });
});
```

### 数据快照

```typescript
describe('Data Snapshot', () => {
  it('should match data structure', () => {
    const data = {
      user: {
        id: 1,
        name: 'John',
        createdAt: new Date('2024-01-01'),
      },
    };
    
    expect(data).toMatchSnapshot({
      user: {
        id: expect.any(Number),
        name: expect.any(String),
        createdAt: expect.any(Date),
      },
    });
  });
});
```

## 测试覆盖率

### 收集覆盖率

```bash
# 生成覆盖率报告
npm test -- --coverage

# 指定文件
npm test -- --coverage --collectCoverageFrom='src/**/*.{ts,tsx}'

# HTML报告
npm test -- --coverage --coverageReporters=html
```

### 覆盖率配置

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

## 最佳实践

### 测试组织

```typescript
// ✅ 好的测试组织
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when found', async () => {
      // ...
    });
    
    it('should throw error when not found', async () => {
      // ...
    });
  });
  
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // ...
    });
    
    it('should validate email format', async () => {
      // ...
    });
  });
});
```

### AAA模式

```typescript
// Arrange-Act-Assert模式
test('should calculate total price', () => {
  // Arrange: 准备测试数据
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];
  
  // Act: 执行被测试的行为
  const total = calculateTotal(items);
  
  // Assert: 断言结果
  expect(total).toBe(35);
});
```

### 测试隔离

```typescript
// ✅ 每个测试独立
describe('Counter', () => {
  let counter: Counter;
  
  beforeEach(() => {
    counter = new Counter();
  });
  
  it('should increment', () => {
    counter.increment();
    expect(counter.value).toBe(1);
  });
  
  it('should decrement', () => {
    counter.decrement();
    expect(counter.value).toBe(-1);
  });
});

// ❌ 测试相互依赖
describe('Counter', () => {
  const counter = new Counter();
  
  it('should increment', () => {
    counter.increment();
    expect(counter.value).toBe(1);
  });
  
  it('should decrement', () => {
    // 依赖上一个测试的状态
    counter.decrement();
    expect(counter.value).toBe(0);
  });
});
```

### 描述性命名

```typescript
// ✅ 描述性的测试名称
describe('LoginForm', () => {
  it('should display error message when email is invalid', () => {
    // ...
  });
  
  it('should call onSubmit with credentials when form is valid', () => {
    // ...
  });
});

// ❌ 模糊的测试名称
describe('LoginForm', () => {
  it('test 1', () => {
    // ...
  });
  
  it('works', () => {
    // ...
  });
});
```

## 调试测试

### VSCode调试配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-cache",
        "--watchAll=false",
        "${file}"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 使用debug函数

```typescript
import { render, screen } from '@testing-library/react';
import { debug } from '@testing-library/react';

test('debug example', () => {
  const { debug } = render(<MyComponent />);
  
  // 打印整个DOM
  debug();
  
  // 打印特定元素
  debug(screen.getByRole('button'));
});
```

## 性能优化

### 并行执行

```bash
# 使用所有CPU核心
jest --maxWorkers=100%

# 指定worker数量
jest --maxWorkers=4

# 串行执行(调试时)
jest --runInBand
```

### 测试超时

```typescript
// 全局超时
jest.setTimeout(10000);

// 单个测试超时
test('long running test', async () => {
  // ...
}, 15000);
```

### 选择性运行

```bash
# 只运行修改的文件
jest --onlyChanged

# 只运行失败的测试
jest --onlyFailures

# 根据模式运行
jest Button
jest --testPathPattern=components
```

Jest为React应用提供了强大的测试能力。通过掌握Jest的核心功能和最佳实践,你可以编写高质量、可维护的测试代码,确保应用的稳定性和可靠性。

