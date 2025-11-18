# Mock数据与函数

## 概述

Mock(模拟)是测试中的关键技术,用于隔离被测试单元,控制外部依赖的行为。本文将全面介绍Jest中的Mock功能,包括函数Mock、模块Mock、API Mock等,以及MSW(Mock Service Worker)的使用。

## Jest Mock基础

### jest.fn()

```typescript
describe('jest.fn() basics', () => {
  it('should create a mock function', () => {
    const mockFn = jest.fn();
    
    mockFn('arg1', 'arg2');
    mockFn('arg3');
    
    // 验证调用
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFn).toHaveBeenLastCalledWith('arg3');
  });
  
  it('should track call history', () => {
    const mockFn = jest.fn();
    
    mockFn('first');
    mockFn('second');
    
    expect(mockFn.mock.calls).toEqual([
      ['first'],
      ['second'],
    ]);
    
    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn.mock.calls[0][0]).toBe('first');
  });
});
```

### 返回值Mock

```typescript
describe('Mock return values', () => {
  it('should mock return value', () => {
    const mockFn = jest.fn();
    mockFn.mockReturnValue(42);
    
    expect(mockFn()).toBe(42);
    expect(mockFn()).toBe(42);
  });
  
  it('should mock return value once', () => {
    const mockFn = jest.fn();
    mockFn
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValue(3);
    
    expect(mockFn()).toBe(1);
    expect(mockFn()).toBe(2);
    expect(mockFn()).toBe(3);
    expect(mockFn()).toBe(3);
  });
  
  it('should mock resolved value', async () => {
    const mockFn = jest.fn();
    mockFn.mockResolvedValue('success');
    
    await expect(mockFn()).resolves.toBe('success');
  });
  
  it('should mock rejected value', async () => {
    const mockFn = jest.fn();
    mockFn.mockRejectedValue(new Error('failure'));
    
    await expect(mockFn()).rejects.toThrow('failure');
  });
});
```

### 实现Mock

```typescript
describe('Mock implementations', () => {
  it('should mock implementation', () => {
    const mockFn = jest.fn((x: number) => x * 2);
    
    expect(mockFn(2)).toBe(4);
    expect(mockFn(5)).toBe(10);
  });
  
  it('should mock implementation once', () => {
    const mockFn = jest.fn();
    
    mockFn
      .mockImplementationOnce((x: number) => x + 1)
      .mockImplementationOnce((x: number) => x + 2)
      .mockImplementation((x: number) => x + 3);
    
    expect(mockFn(10)).toBe(11);
    expect(mockFn(10)).toBe(12);
    expect(mockFn(10)).toBe(13);
  });
  
  it('should access this context', () => {
    const mockFn = jest.fn(function(this: any) {
      return this.value;
    });
    
    const context = { value: 42 };
    const result = mockFn.call(context);
    
    expect(result).toBe(42);
  });
});
```

## 模块Mock

### 自动Mock

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// math.test.ts
jest.mock('./math');

import * as math from './math';

test('auto mock module', () => {
  const mockedMath = math as jest.Mocked<typeof math>;
  
  mockedMath.add.mockReturnValue(100);
  
  expect(math.add(1, 2)).toBe(100);
  expect(math.multiply(2, 3)).toBeUndefined(); // 未mock的返回undefined
});
```

### 手动Mock

```typescript
// __mocks__/axios.ts
export default {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
};

// api.test.ts
jest.mock('axios');

import axios from 'axios';

test('manual mock', async () => {
  const mockData = { users: [{ id: 1, name: 'John' }] };
  (axios.get as jest.Mock).mockResolvedValue({ data: mockData });
  
  const result = await getUsers();
  
  expect(axios.get).toHaveBeenCalledWith('/api/users');
  expect(result).toEqual(mockData.users);
});
```

### 部分Mock

```typescript
// utils.ts
export const utils = {
  fetchData: async () => { /* ... */ },
  processData: (data: any) => { /* ... */ },
  formatData: (data: any) => { /* ... */ },
};

// test.ts
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  fetchData: jest.fn(),
}));

import { utils } from './utils';

test('partial mock', async () => {
  (utils.fetchData as jest.Mock).mockResolvedValue({ id: 1 });
  
  const data = await utils.fetchData();
  const processed = utils.processData(data); // 使用真实实现
  const formatted = utils.formatData(processed); // 使用真实实现
  
  expect(utils.fetchData).toHaveBeenCalled();
});
```

### ES6模块Mock

```typescript
// userService.ts
import { api } from './api';

export class UserService {
  async getUser(id: number) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
}

// userService.test.ts
import { api } from './api';
import { UserService } from './userService';

jest.mock('./api');

const mockedApi = api as jest.Mocked<typeof api>;

test('UserService', async () => {
  mockedApi.get.mockResolvedValue({
    data: { id: 1, name: 'John' },
  });
  
  const service = new UserService();
  const user = await service.getUser(1);
  
  expect(user).toEqual({ id: 1, name: 'John' });
  expect(mockedApi.get).toHaveBeenCalledWith('/users/1');
});
```

## Mock类和构造函数

### Mock类

```typescript
// Database.ts
export class Database {
  connect() {
    // 真实连接逻辑
  }
  
  query(sql: string) {
    // 真实查询逻辑
  }
}

// Database.test.ts
jest.mock('./Database');

import { Database } from './Database';

test('mock class', () => {
  const MockedDatabase = Database as jest.MockedClass<typeof Database>;
  
  const mockConnect = jest.fn();
  const mockQuery = jest.fn().mockReturnValue([{ id: 1 }]);
  
  MockedDatabase.mockImplementation(() => ({
    connect: mockConnect,
    query: mockQuery,
  } as any));
  
  const db = new Database();
  db.connect();
  const results = db.query('SELECT * FROM users');
  
  expect(mockConnect).toHaveBeenCalled();
  expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users');
  expect(results).toEqual([{ id: 1 }]);
});
```

### 构造函数Mock

```typescript
// Logger.ts
export class Logger {
  constructor(private prefix: string) {}
  
  log(message: string) {
    console.log(`[${this.prefix}] ${message}`);
  }
}

// Logger.test.ts
jest.mock('./Logger');

import { Logger } from './Logger';

test('mock constructor', () => {
  const mockLog = jest.fn();
  
  (Logger as jest.Mock).mockImplementation((prefix: string) => {
    return {
      log: mockLog,
      prefix,
    };
  });
  
  const logger = new Logger('APP');
  logger.log('Hello');
  
  expect(Logger).toHaveBeenCalledWith('APP');
  expect(mockLog).toHaveBeenCalledWith('Hello');
});
```

## Mock异步代码

### Promise Mock

```typescript
describe('Promise mocks', () => {
  it('should mock resolved promise', async () => {
    const fetchUser = jest.fn();
    fetchUser.mockResolvedValue({ id: 1, name: 'John' });
    
    const user = await fetchUser();
    
    expect(user).toEqual({ id: 1, name: 'John' });
  });
  
  it('should mock rejected promise', async () => {
    const fetchUser = jest.fn();
    fetchUser.mockRejectedValue(new Error('Not found'));
    
    await expect(fetchUser()).rejects.toThrow('Not found');
  });
  
  it('should mock promise chain', async () => {
    const mockFn = jest.fn();
    
    mockFn
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValue('default');
    
    expect(await mockFn()).toBe('first');
    expect(await mockFn()).toBe('second');
    await expect(mockFn()).rejects.toThrow('error');
    expect(await mockFn()).toBe('default');
  });
});
```

### async/await Mock

```typescript
describe('async/await mocks', () => {
  it('should mock async function', async () => {
    const asyncFn = jest.fn(async (x: number) => {
      return x * 2;
    });
    
    const result = await asyncFn(5);
    
    expect(result).toBe(10);
    expect(asyncFn).toHaveBeenCalledWith(5);
  });
  
  it('should mock delayed async function', async () => {
    jest.useFakeTimers();
    
    const asyncFn = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'done';
    });
    
    const promise = asyncFn();
    
    jest.advanceTimersByTime(1000);
    
    await expect(promise).resolves.toBe('done');
    
    jest.useRealTimers();
  });
});
```

## Mock定时器

### setTimeout/setInterval

```typescript
describe('Timer mocks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should execute setTimeout callback', () => {
    const callback = jest.fn();
    
    setTimeout(callback, 1000);
    
    expect(callback).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
  
  it('should execute setInterval callback', () => {
    const callback = jest.fn();
    
    setInterval(callback, 1000);
    
    jest.advanceTimersByTime(3000);
    
    expect(callback).toHaveBeenCalledTimes(3);
  });
  
  it('should run all timers', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    setTimeout(callback1, 1000);
    setTimeout(callback2, 2000);
    
    jest.runAllTimers();
    
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });
});
```

### Date Mock

```typescript
describe('Date mocks', () => {
  it('should mock Date.now()', () => {
    const mockDate = new Date('2024-01-01');
    jest.spyOn(global.Date, 'now').mockReturnValue(mockDate.getTime());
    
    expect(Date.now()).toBe(mockDate.getTime());
    
    jest.restoreAllMocks();
  });
  
  it('should mock new Date()', () => {
    const mockDate = new Date('2024-01-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
    expect(new Date()).toEqual(mockDate);
    
    jest.restoreAllMocks();
  });
});
```

## Mock全局对象

### window对象

```typescript
describe('Window mocks', () => {
  it('should mock window.location', () => {
    delete (window as any).location;
    window.location = {
      href: 'http://localhost',
      pathname: '/test',
    } as any;
    
    expect(window.location.href).toBe('http://localhost');
  });
  
  it('should mock window.matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    
    expect(window.matchMedia('(min-width: 768px)').matches).toBe(true);
  });
});
```

### localStorage/sessionStorage

```typescript
describe('Storage mocks', () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });
  
  it('should mock localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('value');
    
    expect(localStorage.getItem('key')).toBe('value');
    
    localStorage.setItem('key', 'newValue');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('key', 'newValue');
  });
});
```

### fetch Mock

```typescript
describe('Fetch mocks', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  
  it('should mock fetch', async () => {
    const mockResponse = { data: { id: 1 } };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    
    const response = await fetch('/api/data');
    const data = await response.json();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/data');
    expect(data).toEqual(mockResponse);
  });
  
  it('should mock fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    await expect(fetch('/api/data')).rejects.toThrow('Network error');
  });
});
```

## Spy功能

### jest.spyOn

```typescript
describe('Spy functionality', () => {
  it('should spy on method', () => {
    const obj = {
      getValue: () => 'original',
    };
    
    const spy = jest.spyOn(obj, 'getValue');
    spy.mockReturnValue('mocked');
    
    expect(obj.getValue()).toBe('mocked');
    expect(spy).toHaveBeenCalled();
    
    spy.mockRestore();
    expect(obj.getValue()).toBe('original');
  });
  
  it('should spy on console methods', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    console.log('test message');
    
    expect(consoleSpy).toHaveBeenCalledWith('test message');
    
    consoleSpy.mockRestore();
  });
});
```

### 监听而不修改

```typescript
describe('Spy without mocking', () => {
  it('should track calls without changing behavior', () => {
    const math = {
      add: (a: number, b: number) => a + b,
    };
    
    const spy = jest.spyOn(math, 'add');
    
    const result = math.add(1, 2);
    
    expect(result).toBe(3); // 保持原有行为
    expect(spy).toHaveBeenCalledWith(1, 2);
  });
});
```

## Mock实战案例

### API调用Mock

```typescript
// api.ts
import axios from 'axios';

export async function fetchUsers() {
  const response = await axios.get('/api/users');
  return response.data;
}

export async function createUser(user: User) {
  const response = await axios.post('/api/users', user);
  return response.data;
}

// api.test.ts
jest.mock('axios');

import axios from 'axios';
import { fetchUsers, createUser } from './api';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API functions', () => {
  it('should fetch users', async () => {
    const users = [{ id: 1, name: 'John' }];
    mockedAxios.get.mockResolvedValue({ data: users });
    
    const result = await fetchUsers();
    
    expect(result).toEqual(users);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/users');
  });
  
  it('should create user', async () => {
    const newUser = { name: 'Jane', email: 'jane@example.com' };
    const createdUser = { id: 2, ...newUser };
    
    mockedAxios.post.mockResolvedValue({ data: createdUser });
    
    const result = await createUser(newUser);
    
    expect(result).toEqual(createdUser);
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/users', newUser);
  });
});
```

### React组件Mock

```typescript
// UserList.tsx
import { useEffect, useState } from 'react';
import { fetchUsers } from './api';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// UserList.test.tsx
jest.mock('./api');

import { render, screen, waitFor } from '@testing-library/react';
import { fetchUsers } from './api';
import { UserList } from './UserList';

const mockedFetchUsers = fetchUsers as jest.MockedFunction<typeof fetchUsers>;

test('UserList', async () => {
  mockedFetchUsers.mockResolvedValue([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
  ]);
  
  render(<UserList />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });
});
```

### Redux Mock

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// Component.test.tsx
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

function createMockStore(initialState = {}) {
  return configureStore({
    reducer: {
      user: (state = initialState.user) => state,
    },
  });
}

test('component with Redux', () => {
  const mockStore = createMockStore({
    user: { id: 1, name: 'John' },
  });
  
  render(
    <Provider store={mockStore}>
      <UserProfile />
    </Provider>
  );
  
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

## MSW (Mock Service Worker)

### 基础配置

```bash
npm install --save-dev msw
```

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ])
    );
  }),
  
  rest.post('/api/users', async (req, res, ctx) => {
    const newUser = await req.json();
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        ...newUser,
      })
    );
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// jest.setup.js
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### MSW测试

```typescript
import { server } from './mocks/server';
import { rest } from 'msw';

test('fetch users with MSW', async () => {
  render(<UserList />);
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });
});

test('handle error with MSW', async () => {
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({ message: 'Server error' })
      );
    })
  );
  
  render(<UserList />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Mock最佳实践

### 清理Mock

```typescript
describe('Mock cleanup', () => {
  afterEach(() => {
    jest.clearAllMocks(); // 清除调用记录
    jest.resetAllMocks(); // 重置实现
    jest.restoreAllMocks(); // 恢复原始实现
  });
  
  it('test 1', () => {
    const mockFn = jest.fn();
    mockFn();
    expect(mockFn).toHaveBeenCalled();
  });
  
  it('test 2', () => {
    const mockFn = jest.fn();
    expect(mockFn).not.toHaveBeenCalled(); // 已清理
  });
});
```

### Mock工厂

```typescript
// mockFactory.ts
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  };
}

export function createMockApiResponse<T>(data: T) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

// test.ts
import { createMockUser, createMockApiResponse } from './mockFactory';

test('with mock factory', async () => {
  const user = createMockUser({ role: 'admin' });
  const response = createMockApiResponse(user);
  
  (global.fetch as jest.Mock).mockResolvedValue(response);
  
  const result = await fetchUser(1);
  expect(result.role).toBe('admin');
});
```

### TypeScript类型安全

```typescript
// types.ts
export interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

// test.ts
const mockApiClient: jest.Mocked<ApiClient> = {
  get: jest.fn(),
  post: jest.fn(),
};

test('type-safe mocks', async () => {
  mockApiClient.get.mockResolvedValue({ id: 1, name: 'John' });
  
  const user = await mockApiClient.get<User>('/api/users/1');
  
  expect(user.name).toBe('John');
});
```

通过掌握各种Mock技术,你可以有效隔离测试单元,控制外部依赖,编写更加可靠和可维护的测试代码。合理使用Mock是编写高质量测试的关键。

