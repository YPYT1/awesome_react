# React与React Native代码复用 - 跨平台代码共享策略

## 1. 代码复用基础

### 1.1 可复用的代码类型

```typescript
const reusableCodeTypes = {
  businessLogic: {
    description: '业务逻辑层',
    examples: ['数据处理', '状态管理', '业务规则', 'API调用'],
    reusability: '100%',
    approach: '完全共享'
  },
  
  hooks: {
    description: '自定义Hooks',
    examples: ['useAuth', 'useData', 'useForm', 'useValidation'],
    reusability: '90%',
    approach: '平台特定部分抽离'
  },
  
  utilities: {
    description: '工具函数',
    examples: ['格式化', '验证', '计算', '转换'],
    reusability: '100%',
    approach: '完全共享'
  },
  
  components: {
    description: 'UI组件',
    examples: ['Button', 'Card', 'List', 'Form'],
    reusability: '30-50%',
    approach: '平台适配层'
  },
  
  styles: {
    description: '样式定义',
    examples: ['主题', '颜色', '间距', '字体'],
    reusability: '80%',
    approach: '样式变量共享'
  }
};
```

### 1.2 项目结构设计

```
monorepo/
├── packages/
│   ├── shared/                 # 共享代码包
│   │   ├── src/
│   │   │   ├── hooks/         # 共享Hooks
│   │   │   ├── utils/         # 工具函数
│   │   │   ├── services/      # API服务
│   │   │   ├── store/         # 状态管理
│   │   │   ├── types/         # TypeScript类型
│   │   │   └── constants/     # 常量定义
│   │   └── package.json
│   │
│   ├── web/                   # Web应用
│   │   ├── src/
│   │   │   ├── components/    # Web特定组件
│   │   │   ├── pages/         # 页面
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── mobile/                # React Native应用
│       ├── src/
│       │   ├── components/    # RN特定组件
│       │   ├── screens/       # 屏幕
│       │   └── App.tsx
│       └── package.json
│
├── pnpm-workspace.yaml
└── package.json
```

## 2. 业务逻辑复用

### 2.1 API服务层

```typescript
// packages/shared/src/services/api.ts
import axios, { AxiosInstance } from 'axios';

export class ApiService {
  private api: AxiosInstance;
  
  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // 请求拦截
    this.api.interceptors.request.use(
      config => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    
    // 响应拦截
    this.api.interceptors.response.use(
      response => response.data,
      error => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }
  
  // 平台特定方法需要注入
  private getToken: () => string | null = () => null;
  private handleUnauthorized: () => void = () => {};
  
  public setTokenGetter(getter: () => string | null) {
    this.getToken = getter;
  }
  
  public setUnauthorizedHandler(handler: () => void) {
    this.handleUnauthorized = handler;
  }
  
  // API方法
  async get<T>(url: string, params?: any): Promise<T> {
    return this.api.get(url, { params });
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    return this.api.post(url, data);
  }
  
  async put<T>(url: string, data?: any): Promise<T> {
    return this.api.put(url, data);
  }
  
  async delete<T>(url: string): Promise<T> {
    return this.api.delete(url);
  }
}

// packages/shared/src/services/user.service.ts
export class UserService {
  constructor(private api: ApiService) {}
  
  async login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password });
  }
  
  async getProfile() {
    return this.api.get('/user/profile');
  }
  
  async updateProfile(data: any) {
    return this.api.put('/user/profile', data);
  }
}
```

### 2.2 状态管理复用

```typescript
// packages/shared/src/store/userStore.ts
import { create } from 'zustand';
import { UserService } from '../services/user.service';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const createUserStore = (userService: UserService) => {
  return create<UserStore>((set) => ({
    user: null,
    loading: false,
    error: null,
    
    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await userService.login(email, password);
        set({ user: response.user, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
    
    logout: () => {
      set({ user: null });
    },
    
    fetchProfile: async () => {
      set({ loading: true });
      try {
        const user = await userService.getProfile();
        set({ user, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
    
    updateProfile: async (data) => {
      set({ loading: true });
      try {
        const user = await userService.updateProfile(data);
        set({ user, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    }
  }));
};
```

## 3. Hooks复用

### 3.1 完全共享的Hooks

```typescript
// packages/shared/src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// packages/shared/src/hooks/usePrevious.ts
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// packages/shared/src/hooks/useToggle.ts
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return { value, toggle, setTrue, setFalse };
}
```

### 3.2 平台适配的Hooks

```typescript
// packages/shared/src/hooks/useStorage.ts
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function useStorage<T>(key: string, adapter: StorageAdapter) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await adapter.getItem(key);
        if (item) {
          setValue(JSON.parse(item));
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadValue();
  }, [key]);
  
  const saveValue = useCallback(async (newValue: T) => {
    setValue(newValue);
    await adapter.setItem(key, JSON.stringify(newValue));
  }, [key, adapter]);
  
  const removeValue = useCallback(async () => {
    setValue(null);
    await adapter.removeItem(key);
  }, [key, adapter]);
  
  return { value, saveValue, removeValue, loading };
}

// Web实现
// packages/web/src/adapters/storageAdapter.ts
export const webStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    return localStorage.getItem(key);
  },
  
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  
  async removeItem(key: string) {
    localStorage.removeItem(key);
  }
};

// React Native实现
// packages/mobile/src/adapters/storageAdapter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const mobileStorageAdapter: StorageAdapter = {
  async getItem(key: string) {
    return AsyncStorage.getItem(key);
  },
  
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  }
};
```

### 3.3 条件导出Hook

```typescript
// packages/shared/src/hooks/useOrientation.ts
import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

// 定义平台接口
export interface OrientationAdapter {
  getCurrentOrientation(): Orientation;
  subscribe(callback: (orientation: Orientation) => void): () => void;
}

export function useOrientation(adapter: OrientationAdapter) {
  const [orientation, setOrientation] = useState<Orientation>(
    adapter.getCurrentOrientation()
  );
  
  useEffect(() => {
    const unsubscribe = adapter.subscribe(setOrientation);
    return unsubscribe;
  }, [adapter]);
  
  return orientation;
}

// Web实现
export const webOrientationAdapter: OrientationAdapter = {
  getCurrentOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },
  
  subscribe(callback) {
    const handler = () => {
      const orientation = window.innerWidth > window.innerHeight 
        ? 'landscape' 
        : 'portrait';
      callback(orientation);
    };
    
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }
};

// React Native实现
import { Dimensions } from 'react-native';

export const mobileOrientationAdapter: OrientationAdapter = {
  getCurrentOrientation() {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  },
  
  subscribe(callback) {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const orientation = window.width > window.height 
        ? 'landscape' 
        : 'portrait';
      callback(orientation);
    });
    
    return () => subscription.remove();
  }
};
```

## 4. 工具函数复用

### 4.1 数据处理工具

```typescript
// packages/shared/src/utils/format.ts
export const formatUtils = {
  // 格式化货币
  currency(value: number, currency = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency
    }).format(value);
  },
  
  // 格式化日期
  date(date: Date | string, format = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  },
  
  // 格式化数字
  number(value: number, decimals = 2): string {
    return value.toFixed(decimals);
  },
  
  // 格式化文件大小
  fileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
};
```

### 4.2 验证工具

```typescript
// packages/shared/src/utils/validation.ts
export const validationUtils = {
  email(value: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },
  
  phone(value: string): boolean {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(value);
  },
  
  url(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  password(value: string): { valid: boolean; message?: string } {
    if (value.length < 8) {
      return { valid: false, message: '密码至少8位' };
    }
    if (!/[A-Z]/.test(value)) {
      return { valid: false, message: '密码需包含大写字母' };
    }
    if (!/[a-z]/.test(value)) {
      return { valid: false, message: '密码需包含小写字母' };
    }
    if (!/[0-9]/.test(value)) {
      return { valid: false, message: '密码需包含数字' };
    }
    return { valid: true };
  }
};
```

## 5. 组件复用策略

### 5.1 组件适配器模式

```typescript
// packages/shared/src/components/Button/types.ts
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

// Web实现
// packages/web/src/components/Button.tsx
import { ButtonProps } from '@shared/components/Button/types';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon
}: ButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size}`}
    >
      {loading && <span className="spinner" />}
      {icon && <i className={icon} />}
      {title}
    </button>
  );
}

// React Native实现
// packages/mobile/src/components/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { ButtonProps } from '@shared/components/Button/types';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, styles[variant], styles[size]]}
    >
      {loading && <ActivityIndicator color="#fff" />}
      {icon && <Icon name={icon} />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}
```

### 5.2 平台特定导出

```typescript
// packages/shared/src/components/Image/Image.web.tsx
export function Image({ source, style, ...props }) {
  return (
    <img 
      src={typeof source === 'string' ? source : source.uri}
      style={style}
      {...props}
    />
  );
}

// packages/shared/src/components/Image/Image.native.tsx
import { Image as RNImage } from 'react-native';

export function Image({ source, style, ...props }) {
  return (
    <RNImage 
      source={typeof source === 'string' ? { uri: source } : source}
      style={style}
      {...props}
    />
  );
}

// packages/shared/src/components/Image/index.ts
export { Image } from './Image';
```

### 5.3 复合组件拆分

```typescript
// packages/shared/src/components/Card/CardBase.tsx
export interface CardBaseProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function CardBase({ children, onPress }: CardBaseProps) {
  // 只包含逻辑，不包含UI
  const [isHovered, setIsHovered] = useState(false);
  
  return { children, onPress, isHovered, setIsHovered };
}

// packages/web/src/components/Card.tsx
export function Card({ children, onPress }: CardBaseProps) {
  const { isHovered, setIsHovered } = CardBase({ children, onPress });
  
  return (
    <div
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={isHovered ? 'card card-hover' : 'card'}
    >
      {children}
    </div>
  );
}

// packages/mobile/src/components/Card.tsx
export function Card({ children, onPress }: CardBaseProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {children}
    </TouchableOpacity>
  );
}
```

## 6. 样式复用

### 6.1 设计Token

```typescript
// packages/shared/src/styles/tokens.ts
export const tokens = {
  colors: {
    primary: '#2196F3',
    secondary: '#FF5722',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD'
    },
    
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
      dark: '#121212'
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  typography: {
    fontFamily: {
      primary: 'System',
      mono: 'Monospace'
    },
    
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24
    },
    
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700'
    },
    
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    }
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)'
  }
};
```

### 6.2 平台样式适配

```typescript
// Web CSS-in-JS
// packages/web/src/styles/createStyles.ts
import { tokens } from '@shared/styles/tokens';

export function createStyles<T>(styles: T): T {
  return styles;
}

export const commonStyles = createStyles({
  container: {
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.default
  },
  
  text: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.fontSize.md,
    lineHeight: tokens.typography.lineHeight.normal
  }
});

// React Native StyleSheet
// packages/mobile/src/styles/createStyles.ts
import { StyleSheet } from 'react-native';
import { tokens } from '@shared/styles/tokens';

export function createStyles<T>(styles: T): T {
  return StyleSheet.create(styles as any) as T;
}

export const commonStyles = createStyles({
  container: {
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.default
  },
  
  text: {
    color: tokens.colors.text.primary,
    fontSize: tokens.typography.fontSize.md,
    lineHeight: tokens.typography.lineHeight.normal * tokens.typography.fontSize.md
  }
});
```

## 7. TypeScript类型复用

### 7.1 共享类型定义

```typescript
// packages/shared/src/types/models.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}
```

### 7.2 API类型定义

```typescript
// packages/shared/src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
```

## 8. 配置文件复用

### 8.1 环境配置

```typescript
// packages/shared/src/config/env.ts
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableLogging: boolean;
}

export function createConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    environment: (process.env.NODE_ENV as any) || 'development',
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true',
    ...overrides
  };
}

// Web使用
const config = createConfig({
  apiUrl: import.meta.env.VITE_API_URL
});

// React Native使用
import Config from 'react-native-config';

const config = createConfig({
  apiUrl: Config.API_URL
});
```

## 9. 测试复用

### 9.1 测试工具函数

```typescript
// packages/shared/src/test-utils/setup.ts
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    ...overrides
  };
}

export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    title: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    image: 'https://example.com/image.jpg',
    category: 'test',
    stock: 10,
    ...overrides
  };
}
```

### 9.2 Mock服务

```typescript
// packages/shared/src/test-utils/mockApi.ts
export class MockApiService extends ApiService {
  private mockData: Map<string, any> = new Map();
  
  setMockData(key: string, data: any) {
    this.mockData.set(key, data);
  }
  
  async get<T>(url: string): Promise<T> {
    return this.mockData.get(url) || null;
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    return data;
  }
}
```

## 10. Monorepo配置

### 10.1 pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

### 10.2 根package.json

```json
{
  "name": "my-app",
  "private": true,
  "scripts": {
    "dev:web": "pnpm --filter web dev",
    "dev:mobile": "pnpm --filter mobile start",
    "build:web": "pnpm --filter web build",
    "build:mobile": "pnpm --filter mobile build:android",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "type-check": "pnpm -r type-check"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 10.3 共享包配置

```json
// packages/shared/package.json
{
  "name": "@myapp/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./utils": "./src/utils/index.ts",
    "./types": "./src/types/index.ts"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "zustand": "^4.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

## 11. 最佳实践

```typescript
const codeReuseBestPractices = {
  architecture: [
    '清晰的层次划分',
    '业务逻辑与UI分离',
    '使用适配器模式处理平台差异',
    '定义清晰的接口',
    'TypeScript类型共享'
  ],
  
  组织结构: [
    'Monorepo管理多包',
    '共享包独立维护',
    '平台特定代码隔离',
    '合理的目录结构',
    '统一的命名规范'
  ],
  
  components: [
    '提取可复用的组件逻辑',
    '使用平台特定的UI实现',
    '共享设计Token',
    '组件接口一致',
    '支持主题定制'
  ],
  
  state: [
    '状态管理逻辑共享',
    '使用平台无关的状态库',
    '统一的数据模型',
    '共享API层',
    '类型安全的状态'
  ],
  
  testing: [
    '共享测试工具',
    '复用Mock数据',
    '统一的测试策略',
    '跨平台测试覆盖',
    'E2E测试复用'
  ]
};
```

## 12. 总结

React与React Native代码复用的核心要点:

1. **业务逻辑**: 100%复用
2. **状态管理**: 完全共享
3. **Hooks**: 大部分可复用
4. **组件**: 适配器模式
5. **样式**: Token系统
6. **类型**: TypeScript共享
7. **工具函数**: 完全复用
8. **配置**: 环境适配

通过合理的架构设计,可以实现70-80%的代码复用率。

