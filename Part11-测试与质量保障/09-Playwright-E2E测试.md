# Playwright E2E测试

## 概述

Playwright是微软开发的现代化端到端测试框架,支持Chromium、Firefox和WebKit浏览器。它提供了强大的自动等待机制、网络拦截、多标签页支持等功能,是React应用E2E测试的理想选择。本文将全面介绍Playwright的使用方法、最佳实践以及实战案例。

## 核心特性

### 主要优势

- ✅ **跨浏览器支持**: Chromium、Firefox、WebKit
- ✅ **自动等待**: 智能等待元素就绪
- ✅ **网络控制**: 拦截和模拟网络请求
- ✅ **多标签页/多窗口**: 原生支持
- ✅ **移动设备模拟**: 完整的移动端测试
- ✅ **视频录制**: 自动录制测试过程
- ✅ **截图对比**: 可视化回归测试

## 安装与配置

### 安装

```bash
npm init playwright@latest

# 或手动安装
npm install --save-dev @playwright/test
npx playwright install
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './e2e',
  
  // 测试匹配模式
  testMatch: '**/*.spec.ts',
  
  // 超时设置
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  // 失败重试
  retries: process.env.CI ? 2 : 0,
  
  // 并行运行
  workers: process.env.CI ? 1 : undefined,
  
  // 报告器
  reporter: [
    ['html'],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  
  // 全局配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',
    
    // 截图
    screenshot: 'only-on-failure',
    
    // 视频
    video: 'retain-on-failure',
    
    // 追踪
    trace: 'retain-on-failure',
    
    // 浏览器选项
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // 导航超时
    navigationTimeout: 30000,
  },
  
  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // 本地服务器
  webServer: {
    command: 'npm run start',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## 基础测试

### 第一个测试

```typescript
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  
  await expect(page).toHaveTitle(/My App/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  await page.click('text=About');
  
  await expect(page).toHaveURL('/about');
  await expect(page.locator('h1')).toContainText('About');
});
```

### Page Object Model

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
  
  async getErrorMessage() {
    return await this.page.locator('.error-message').textContent();
  }
}

// login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login', () => {
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });
  
  test('successful login', async ({ page }) => {
    await loginPage.login('user@example.com', 'password');
    
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('failed login', async () => {
    await loginPage.login('wrong@example.com', 'wrong');
    
    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Invalid credentials');
  });
});
```

## 元素定位

### 定位器类型

```typescript
test('locators', async ({ page }) => {
  // 文本定位
  await page.locator('text=Click me').click();
  
  // CSS选择器
  await page.locator('.btn-primary').click();
  await page.locator('#submit-button').click();
  
  // XPath
  await page.locator('//button[@type="submit"]').click();
  
  // 角色定位(推荐)
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
  
  // 标签定位
  await page.getByLabel('Email').fill('test@example.com');
  
  // 占位符定位
  await page.getByPlaceholder('Enter your email').fill('test@example.com');
  
  // 测试ID定位
  await page.getByTestId('submit-button').click();
  
  // Alt文本(图片)
  await page.getByAltText('Profile picture').click();
  
  // Title定位
  await page.getByTitle('Close').click();
});
```

### 链式定位

```typescript
test('chaining locators', async ({ page }) => {
  // 父子关系
  const form = page.locator('form');
  await form.locator('input[name="email"]').fill('test@example.com');
  await form.locator('button[type="submit"]').click();
  
  // 多个条件
  await page.locator('button').filter({ hasText: 'Submit' }).click();
  
  // 第n个元素
  await page.locator('.item').nth(0).click(); // 第1个
  await page.locator('.item').first().click(); // 第1个
  await page.locator('.item').last().click();  // 最后1个
});
```

### 定位器断言

```typescript
test('locator assertions', async ({ page }) => {
  await page.goto('/');
  
  // 可见性
  await expect(page.locator('.header')).toBeVisible();
  await expect(page.locator('.hidden')).toBeHidden();
  
  // 启用/禁用
  await expect(page.locator('button')).toBeEnabled();
  await expect(page.locator('button')).toBeDisabled();
  
  // 文本
  await expect(page.locator('h1')).toHaveText('Welcome');
  await expect(page.locator('h1')).toContainText('Wel');
  
  // 属性
  await expect(page.locator('input')).toHaveAttribute('type', 'email');
  await expect(page.locator('a')).toHaveAttribute('href', /\/about$/);
  
  // 值
  await expect(page.locator('input')).toHaveValue('test@example.com');
  
  // 类名
  await expect(page.locator('button')).toHaveClass(/btn-primary/);
  
  // CSS
  await expect(page.locator('.box')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  
  // 数量
  await expect(page.locator('.item')).toHaveCount(5);
});
```

## 用户交互

### 表单操作

```typescript
test('form interactions', async ({ page }) => {
  await page.goto('/form');
  
  // 输入文本
  await page.fill('input[name="name"]', 'John Doe');
  
  // 逐字输入
  await page.type('input[name="email"]', 'john@example.com');
  
  // 清空输入
  await page.fill('input[name="name"]', '');
  
  // 选择下拉框
  await page.selectOption('select[name="country"]', 'US');
  await page.selectOption('select[name="country"]', { label: 'United States' });
  
  // 复选框
  await page.check('input[name="terms"]');
  await page.uncheck('input[name="newsletter"]');
  
  // 单选框
  await page.check('input[value="male"]');
  
  // 文件上传
  await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
  await page.setInputFiles('input[type="file"]', [
    'file1.pdf',
    'file2.pdf',
  ]);
  
  // 提交表单
  await page.click('button[type="submit"]');
});
```

### 鼠标操作

```typescript
test('mouse interactions', async ({ page }) => {
  // 点击
  await page.click('button');
  
  // 双击
  await page.dblclick('button');
  
  // 右键点击
  await page.click('button', { button: 'right' });
  
  // 悬停
  await page.hover('.dropdown-trigger');
  
  // 拖拽
  await page.dragAndDrop('.source', '.target');
  
  // 精确坐标点击
  await page.click('canvas', { position: { x: 100, y: 200 } });
  
  // 修饰键
  await page.click('a', { modifiers: ['Control'] });
  await page.click('a', { modifiers: ['Shift', 'Alt'] });
});
```

### 键盘操作

```typescript
test('keyboard interactions', async ({ page }) => {
  await page.goto('/');
  
  // 按键
  await page.press('input', 'Enter');
  await page.press('input', 'Tab');
  await page.press('input', 'Escape');
  
  // 组合键
  await page.press('input', 'Control+A');
  await page.press('input', 'Meta+V'); // Command+V on Mac
  
  // 多次按键
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  
  // 输入文本
  await page.keyboard.type('Hello World');
  
  // 按住键
  await page.keyboard.down('Shift');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.up('Shift');
});
```

## 等待和超时

### 自动等待

```typescript
test('auto-waiting', async ({ page }) => {
  // Playwright自动等待元素:
  // 1. 存在于DOM中
  // 2. 可见
  // 3. 稳定(不在动画中)
  // 4. 可接收事件
  // 5. 启用状态
  
  await page.click('button'); // 自动等待所有条件
  await page.fill('input', 'text'); // 自动等待所有条件
});
```

### 显式等待

```typescript
test('explicit waits', async ({ page }) => {
  // 等待元素出现
  await page.waitForSelector('.dynamic-content');
  
  // 等待元素消失
  await page.waitForSelector('.loading', { state: 'hidden' });
  
  // 等待导航
  await Promise.all([
    page.waitForNavigation(),
    page.click('a[href="/next-page"]'),
  ]);
  
  // 等待特定URL
  await page.waitForURL('/dashboard');
  await page.waitForURL(/\/user\/\d+/);
  
  // 等待响应
  const response = await page.waitForResponse('/api/users');
  const data = await response.json();
  
  // 等待请求
  await page.waitForRequest('/api/users');
  
  // 等待函数
  await page.waitForFunction(() => window.innerWidth < 768);
  
  // 等待加载状态
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // 自定义超时
  await page.waitForSelector('.element', { timeout: 10000 });
});
```

## 网络控制

### 请求拦截

```typescript
test('intercept requests', async ({ page }) => {
  // 拦截所有请求
  await page.route('**/*', route => {
    console.log(route.request().url());
    route.continue();
  });
  
  // 拦截特定API
  await page.route('/api/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ]),
    });
  });
  
  // 修改请求
  await page.route('/api/**', route => {
    const headers = route.request().headers();
    headers['Authorization'] = 'Bearer fake-token';
    route.continue({ headers });
  });
  
  // 阻止请求
  await page.route('**/*.{png,jpg,jpeg}', route => route.abort());
  
  await page.goto('/');
});
```

### 响应模拟

```typescript
test('mock responses', async ({ page }) => {
  // Mock API响应
  await page.route('/api/posts', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        posts: [
          { id: 1, title: 'Test Post 1' },
          { id: 2, title: 'Test Post 2' },
        ],
      }),
    });
  });
  
  // Mock错误响应
  await page.route('/api/error', (route) => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    });
  });
  
  await page.goto('/');
  
  const posts = await page.locator('.post').count();
  expect(posts).toBe(2);
});
```

## 测试隔离

### 测试存储状态

```typescript
// global-setup.ts
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('/dashboard');
  
  // 保存认证状态
  await page.context().storageState({ path: 'auth.json' });
  
  await browser.close();
}

export default globalSetup;

// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  use: {
    storageState: 'auth.json',
  },
});
```

### Test Fixtures

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});

// 使用fixture
test('use custom fixture', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.locator('h1')).toHaveText('Dashboard');
});
```

## 截图和视频

### 截图

```typescript
test('screenshots', async ({ page }) => {
  await page.goto('/');
  
  // 整页截图
  await page.screenshot({ path: 'screenshot.png' });
  
  // 全页截图
  await page.screenshot({ path: 'full-page.png', fullPage: true });
  
  // 元素截图
  await page.locator('.hero').screenshot({ path: 'hero.png' });
  
  // 失败时自动截图(配置)
  // use: { screenshot: 'only-on-failure' }
});
```

### 视频录制

```typescript
// 配置中启用
export default defineConfig({
  use: {
    video: 'on',              // 总是录制
    // video: 'off',          // 不录制
    // video: 'retain-on-failure', // 失败时保留
    // video: 'on-first-retry',    // 重试时录制
  },
});

test('recorded test', async ({ page }) => {
  await page.goto('/');
  // 测试逻辑
  // 视频会自动保存到 test-results/
});
```

## 实战案例

### 1. 登录流程

```typescript
test.describe('Login Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toHaveText('Welcome back!');
  });
  
  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toContainText('Invalid credentials');
  });
  
  test('remember me persists session', async ({ page, context }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.check('[name="remember"]');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
    
    // 验证cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 86400);
  });
});
```

### 2. 购物车流程

```typescript
test.describe('Shopping Cart', () => {
  test('complete purchase flow', async ({ page }) => {
    // 1. 浏览商品
    await page.goto('/products');
    await expect(page.locator('.product')).toHaveCount(10);
    
    // 2. 添加到购物车
    await page.locator('.product').first().click();
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('.cart-badge')).toHaveText('1');
    
    // 3. 查看购物车
    await page.click('.cart-icon');
    await expect(page).toHaveURL('/cart');
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // 4. 更新数量
    await page.fill('input[type="number"]', '2');
    await expect(page.locator('.total-price')).toContainText('$40.00');
    
    // 5. 结账
    await page.click('button:has-text("Checkout")');
    await expect(page).toHaveURL('/checkout');
    
    // 6. 填写配送信息
    await page.fill('[name="fullName"]', 'John Doe');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.selectOption('[name="state"]', 'NY');
    await page.fill('[name="zip"]', '10001');
    
    // 7. 填写支付信息
    await page.fill('[name="cardNumber"]', '4111111111111111');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvv"]', '123');
    
    // 8. 提交订单
    await page.click('button:has-text("Place Order")');
    
    // 9. 验证成功
    await expect(page).toHaveURL(/\/order\/\d+/);
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### 3. 表单验证

```typescript
test.describe('Form Validation', () => {
  test('validates required fields', async ({ page }) => {
    await page.goto('/contact');
    
    // 提交空表单
    await page.click('button[type="submit"]');
    
    // 验证错误消息
    await expect(page.locator('[name="name"]:invalid')).toBeVisible();
    await expect(page.locator('[name="email"]:invalid')).toBeVisible();
    await expect(page.locator('[name="message"]:invalid')).toBeVisible();
  });
  
  test('validates email format', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.email-error')).toHaveText('Invalid email format');
  });
  
  test('successful submission', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="message"]', 'Test message');
    
    await Promise.all([
      page.waitForResponse('/api/contact'),
      page.click('button[type="submit"]'),
    ]);
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

## 最佳实践

### 使用Page Object模式

```typescript
// ✅ 好的实践
class ProductPage {
  constructor(private page: Page) {}
  
  async addToCart(productName: string) {
    await this.page.locator(`text=${productName}`).click();
    await this.page.click('button:has-text("Add to Cart")');
  }
  
  async getCartCount() {
    return await this.page.locator('.cart-badge').textContent();
  }
}

// ❌ 差的实践
test('add to cart', async ({ page }) => {
  await page.click('.product:first-child');
  await page.click('button:has-text("Add to Cart")');
  // 重复的定位逻辑
});
```

### 使用有意义的测试数据

```typescript
// ✅ 好的实践
const testUser = {
  email: 'e2e-test-user@example.com',
  password: 'E2E_Test_Password_123',
  name: 'E2E Test User',
};

// ❌ 差的实践
const user = {
  email: 'test@test.com',
  password: '123',
};
```

### 清理测试数据

```typescript
test.afterEach(async ({ request }) => {
  // 清理创建的数据
  await request.delete('/api/test-data');
});
```

Playwright提供了强大的E2E测试能力,通过合理的配置和最佳实践,可以构建稳定可靠的端到端测试套件,确保应用在真实环境中的正确性。

