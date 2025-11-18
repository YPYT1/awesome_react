# Cypress E2E测试

## 概述

Cypress是专为现代Web应用设计的端到端测试框架,以其出色的开发体验和强大的调试能力而闻名。它在浏览器中运行测试,提供了实时重载、时间旅行调试、自动等待等特性,是React应用E2E测试的优秀选择。本文将全面介绍Cypress的使用方法、最佳实践以及实战案例。

## 核心特性

### 主要优势

- ✅ **实时重载**: 保存即刷新测试
- ✅ **时间旅行**: 快照每个测试步骤
- ✅ **自动等待**: 智能等待DOM元素
- ✅ **网络控制**: 拦截和模拟请求
- ✅ **调试友好**: 直接在浏览器DevTools调试
- ✅ **截图和视频**: 自动记录失败
- ✅ **并行执行**: Cypress Cloud支持

## 安装与配置

### 安装

```bash
npm install --save-dev cypress

# 打开Cypress
npx cypress open

# 运行测试
npx cypress run
```

### 目录结构

```
cypress/
├── e2e/                  # 测试文件
│   ├── login.cy.ts
│   ├── shopping-cart.cy.ts
│   └── user-profile.cy.ts
├── fixtures/             # 测试数据
│   ├── users.json
│   └── products.json
├── support/              # 支持文件
│   ├── commands.ts       # 自定义命令
│   ├── e2e.ts           # 全局配置
│   └── component.ts      # 组件测试配置
└── downloads/            # 下载文件
```

### cypress.config.ts

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // 基础URL
    baseUrl: 'http://localhost:3000',
    
    // 视口大小
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 测试文件
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // 支持文件
    supportFile: 'cypress/support/e2e.ts',
    
    // 超时设置
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    
    // 重试
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // 视频录制
    video: true,
    videoCompression: 32,
    
    // 截图
    screenshotOnRunFailure: true,
    
    // 环境变量
    env: {
      apiUrl: 'http://localhost:3001',
      coverage: false,
    },
    
    setupNodeEvents(on, config) {
      // 插件配置
      return config;
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

## 基础测试

### 第一个测试

```typescript
describe('Homepage', () => {
  it('displays the page title', () => {
    cy.visit('/');
    cy.get('h1').should('contain', 'Welcome');
  });
  
  it('navigates to about page', () => {
    cy.visit('/');
    cy.get('a').contains('About').click();
    cy.url().should('include', '/about');
    cy.get('h1').should('contain', 'About Us');
  });
});
```

### Hooks使用

```typescript
describe('User Management', () => {
  before(() => {
    // 所有测试前执行一次
    cy.task('db:seed');
  });
  
  beforeEach(() => {
    // 每个测试前执行
    cy.visit('/users');
    cy.login('admin@example.com', 'password');
  });
  
  afterEach(() => {
    // 每个测试后执行
    cy.clearCookies();
    cy.clearLocalStorage();
  });
  
  after(() => {
    // 所有测试后执行一次
    cy.task('db:clean');
  });
  
  it('creates a new user', () => {
    // 测试逻辑
  });
});
```

## 元素选择器

### 推荐的选择器

```typescript
describe('Selectors', () => {
  it('uses recommended selectors', () => {
    // ✅ data-cy属性(最推荐)
    cy.get('[data-cy=submit-button]').click();
    
    // ✅ data-test属性
    cy.get('[data-test=login-form]').should('be.visible');
    
    // ✅ data-testid属性(兼容RTL)
    cy.get('[data-testid=user-name]').should('contain', 'John');
    
    // ⚠️ ID选择器(可用但不推荐)
    cy.get('#submit').click();
    
    // ❌ Class选择器(容易变化)
    cy.get('.btn-primary').click();
    
    // ❌ 文本内容(翻译后会失效)
    cy.contains('Submit').click();
  });
});
```

### 链式查询

```typescript
describe('Chaining', () => {
  it('chains queries', () => {
    // 父子关系
    cy.get('.form')
      .find('input[name="email"]')
      .type('test@example.com');
    
    // 过滤
    cy.get('.item')
      .filter('.active')
      .should('have.length', 1);
    
    // 相邻元素
    cy.get('label').contains('Email').next().type('test@example.com');
    
    // 父元素
    cy.get('input[name="email"]').parent('.form-group').should('be.visible');
    
    // 最近的祖先
    cy.get('button').closest('form').submit();
  });
});
```

### 多个元素

```typescript
describe('Multiple elements', () => {
  it('interacts with multiple elements', () => {
    // 第一个
    cy.get('.item').first().click();
    
    // 最后一个
    cy.get('.item').last().click();
    
    // 第n个
    cy.get('.item').eq(2).click();
    
    // 遍历
    cy.get('.item').each(($el, index) => {
      cy.wrap($el).should('contain', `Item ${index + 1}`);
    });
    
    // 断言数量
    cy.get('.item').should('have.length', 5);
  });
});
```

## 交互操作

### 表单操作

```typescript
describe('Form interactions', () => {
  beforeEach(() => {
    cy.visit('/form');
  });
  
  it('fills out text inputs', () => {
    // 输入文本
    cy.get('[data-cy=name]').type('John Doe');
    
    // 清空后输入
    cy.get('[data-cy=email]')
      .clear()
      .type('john@example.com');
    
    // 特殊键
    cy.get('[data-cy=search]')
      .type('cypress{enter}');
    
    // 组合键
    cy.get('[data-cy=input]')
      .type('{ctrl}a')
      .type('{backspace}');
  });
  
  it('selects options', () => {
    // 下拉框
    cy.get('select[name="country"]').select('USA');
    cy.get('select[name="country"]').select('us'); // by value
    cy.get('select[name="country"]').select(0); // by index
    
    // 多选
    cy.get('select[multiple]').select(['option1', 'option2']);
  });
  
  it('checks and unchecks', () => {
    // 复选框
    cy.get('[type="checkbox"]').check();
    cy.get('[type="checkbox"]').uncheck();
    cy.get('[type="checkbox"]').check({ force: true }); // 强制选中
    
    // 单选框
    cy.get('[type="radio"][value="male"]').check();
  });
  
  it('uploads files', () => {
    // 文件上传
    cy.get('input[type="file"]')
      .selectFile('cypress/fixtures/test-file.pdf');
    
    // 多文件上传
    cy.get('input[type="file"]')
      .selectFile(['file1.pdf', 'file2.pdf']);
    
    // 拖拽上传
    cy.get('.dropzone')
      .selectFile('test-file.pdf', { action: 'drag-drop' });
  });
});
```

### 点击操作

```typescript
describe('Click operations', () => {
  it('performs various clicks', () => {
    // 普通点击
    cy.get('button').click();
    
    // 双击
    cy.get('button').dblclick();
    
    // 右键点击
    cy.get('button').rightclick();
    
    // 强制点击(即使被遮挡)
    cy.get('button').click({ force: true });
    
    // 多次点击
    cy.get('button').click({ multiple: true });
    
    // 坐标点击
    cy.get('canvas').click(100, 200);
    
    // 位置点击
    cy.get('button').click('topLeft');
    cy.get('button').click('bottomRight');
  });
});
```

## 断言

### 基础断言

```typescript
describe('Assertions', () => {
  it('uses should assertions', () => {
    // 存在
    cy.get('.header').should('exist');
    cy.get('.modal').should('not.exist');
    
    // 可见性
    cy.get('.header').should('be.visible');
    cy.get('.loading').should('not.be.visible');
    
    // 文本
    cy.get('h1').should('have.text', 'Welcome');
    cy.get('h1').should('contain', 'Wel');
    cy.get('h1').should('include.text', 'come');
    
    // 值
    cy.get('input').should('have.value', 'test');
    cy.get('input').should('be.empty');
    
    // 属性
    cy.get('a').should('have.attr', 'href', '/about');
    cy.get('input').should('have.attr', 'type', 'email');
    
    // 类名
    cy.get('button').should('have.class', 'btn-primary');
    
    // CSS
    cy.get('.box').should('have.css', 'background-color', 'rgb(255, 0, 0)');
    
    // 状态
    cy.get('button').should('be.disabled');
    cy.get('button').should('be.enabled');
    cy.get('input').should('be.checked');
    cy.get('input').should('be.focused');
    
    // 数量
    cy.get('.item').should('have.length', 5);
    cy.get('.item').should('have.length.gt', 3); // greater than
    cy.get('.item').should('have.length.gte', 5); // greater than or equal
  });
  
  it('uses expect assertions', () => {
    cy.get('h1').then(($h1) => {
      expect($h1).to.have.text('Welcome');
      expect($h1).to.be.visible;
    });
    
    cy.wrap({ name: 'John' }).should('deep.equal', { name: 'John' });
  });
});
```

### 链式断言

```typescript
describe('Chained assertions', () => {
  it('chains multiple assertions', () => {
    cy.get('button')
      .should('be.visible')
      .and('be.enabled')
      .and('have.class', 'btn-primary')
      .and('contain', 'Submit');
  });
});
```

## 网络请求

### 拦截请求

```typescript
describe('Network interception', () => {
  beforeEach(() => {
    // 拦截GET请求
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
    }).as('getUsers');
    
    cy.visit('/users');
  });
  
  it('mocks API response', () => {
    cy.wait('@getUsers');
    
    cy.get('.user').should('have.length', 2);
    cy.get('.user').first().should('contain', 'John');
  });
  
  it('mocks API error', () => {
    cy.intercept('GET', '/api/users', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getUsersError');
    
    cy.visit('/users');
    cy.wait('@getUsersError');
    
    cy.get('.error-message').should('be.visible');
  });
});
```

### 等待请求

```typescript
describe('Waiting for requests', () => {
  it('waits for multiple requests', () => {
    cy.intercept('GET', '/api/users').as('users');
    cy.intercept('GET', '/api/posts').as('posts');
    
    cy.visit('/dashboard');
    
    cy.wait(['@users', '@posts']);
    
    cy.get('.dashboard').should('be.visible');
  });
  
  it('inspects request/response', () => {
    cy.intercept('POST', '/api/users').as('createUser');
    
    cy.visit('/users/new');
    cy.get('[data-cy=name]').type('John');
    cy.get('[data-cy=submit]').click();
    
    cy.wait('@createUser').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        name: 'John',
      });
      expect(interception.response.statusCode).to.equal(201);
    });
  });
});
```

### 动态响应

```typescript
describe('Dynamic responses', () => {
  it('modifies response', () => {
    cy.intercept('GET', '/api/users', (req) => {
      req.reply((res) => {
        res.body = res.body.map(user => ({
          ...user,
          modified: true,
        }));
      });
    });
    
    cy.visit('/users');
  });
  
  it('delays response', () => {
    cy.intercept('GET', '/api/users', (req) => {
      req.reply({
        delay: 2000,
        body: [{ id: 1, name: 'John' }],
      });
    });
    
    cy.visit('/users');
    cy.get('.loading').should('be.visible');
    cy.get('.user', { timeout: 3000 }).should('exist');
  });
});
```

## 等待机制

### 隐式等待

```typescript
describe('Implicit waiting', () => {
  it('automatically waits', () => {
    cy.visit('/');
    
    // Cypress自动等待元素出现、可见、可操作
    cy.get('button').click();
    cy.get('input').type('text');
    
    // 自动重试直到断言通过
    cy.get('.notification').should('be.visible');
  });
});
```

### 显式等待

```typescript
describe('Explicit waiting', () => {
  it('waits for conditions', () => {
    cy.visit('/');
    
    // 等待元素存在
    cy.get('.modal', { timeout: 10000 }).should('exist');
    
    // 等待网络请求
    cy.intercept('GET', '/api/data').as('getData');
    cy.wait('@getData');
    
    // 等待函数返回true
    cy.window().its('appReady').should('equal', true);
    
    // 等待特定时间
    cy.wait(1000);
  });
});
```

## 自定义命令

### 创建自定义命令

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      getByDataCy(value: string): Chainable<JQuery<HTMLElement>>;
      selectProduct(productName: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type(email);
    cy.get('[data-cy=password]').type(password);
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu]').click();
  cy.get('[data-cy=logout]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('getByDataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('selectProduct', (productName) => {
  cy.get('.product').contains(productName).click();
  cy.get('[data-cy=add-to-cart]').click();
});

// 使用自定义命令
describe('Using custom commands', () => {
  it('logs in', () => {
    cy.login('user@example.com', 'password');
    cy.getByDataCy('welcome-message').should('be.visible');
  });
  
  it('adds product to cart', () => {
    cy.login('user@example.com', 'password');
    cy.visit('/products');
    cy.selectProduct('iPhone 15');
    cy.getByDataCy('cart-count').should('have.text', '1');
  });
});
```

## Fixtures数据

### 使用Fixtures

```typescript
// cypress/fixtures/users.json
{
  "admin": {
    "email": "admin@example.com",
    "password": "admin123",
    "name": "Admin User"
  },
  "user": {
    "email": "user@example.com",
    "password": "user123",
    "name": "Regular User"
  }
}

// 测试中使用
describe('Using fixtures', () => {
  beforeEach(() => {
    cy.fixture('users').as('users');
  });
  
  it('logs in with fixture data', function() {
    const { admin } = this.users;
    
    cy.visit('/login');
    cy.get('[data-cy=email]').type(admin.email);
    cy.get('[data-cy=password]').type(admin.password);
    cy.get('[data-cy=submit]').click();
    
    cy.get('[data-cy=user-name]').should('contain', admin.name);
  });
  
  it('uses fixture in intercept', () => {
    cy.intercept('GET', '/api/products', {
      fixture: 'products.json',
    });
    
    cy.visit('/products');
    cy.get('.product').should('have.length', 10);
  });
});
```

## 实战案例

### 1. 完整登录流程

```typescript
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  
  it('successfully logs in', () => {
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=submit]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=welcome]').should('contain', 'Welcome back');
    
    // 验证cookie
    cy.getCookie('auth_token').should('exist');
  });
  
  it('shows error for invalid credentials', () => {
    cy.get('[data-cy=email]').type('wrong@example.com');
    cy.get('[data-cy=password]').type('wrongpassword');
    cy.get('[data-cy=submit]').click();
    
    cy.get('[data-cy=error]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
    
    cy.url().should('include', '/login');
  });
  
  it('validates required fields', () => {
    cy.get('[data-cy=submit]').click();
    
    cy.get('[data-cy=email-error]').should('contain', 'Email is required');
    cy.get('[data-cy=password-error]').should('contain', 'Password is required');
  });
  
  it('remembers user', () => {
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=remember]').check();
    cy.get('[data-cy=submit]').click();
    
    cy.wait(1000);
    
    // 验证localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('rememberMe')).to.equal('true');
    });
  });
});
```

### 2. 电商购物流程

```typescript
describe('E-commerce Flow', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password');
  });
  
  it('completes purchase', () => {
    // 1. 浏览商品
    cy.visit('/products');
    cy.get('.product').should('have.length.gt', 0);
    
    // 2. 添加到购物车
    cy.get('.product').first().within(() => {
      cy.get('[data-cy=product-name]').invoke('text').as('productName');
      cy.get('[data-cy=add-to-cart]').click();
    });
    
    cy.get('[data-cy=cart-notification]')
      .should('be.visible')
      .and('contain', 'Added to cart');
    
    // 3. 查看购物车
    cy.get('[data-cy=cart-icon]').click();
    cy.url().should('include', '/cart');
    
    cy.get('@productName').then((name) => {
      cy.get('.cart-item').should('contain', name);
    });
    
    // 4. 更新数量
    cy.get('[data-cy=quantity]').clear().type('2');
    cy.get('[data-cy=update]').click();
    
    // 5. 结账
    cy.get('[data-cy=checkout]').click();
    cy.url().should('include', '/checkout');
    
    // 6. 填写信息
    cy.get('[data-cy=address]').type('123 Main St');
    cy.get('[data-cy=city]').type('New York');
    cy.get('[data-cy=zip]').type('10001');
    cy.get('[data-cy=card-number]').type('4111111111111111');
    cy.get('[data-cy=expiry]').type('12/25');
    cy.get('[data-cy=cvv]').type('123');
    
    // 7. 提交订单
    cy.intercept('POST', '/api/orders').as('createOrder');
    cy.get('[data-cy=place-order]').click();
    
    cy.wait('@createOrder').its('response.statusCode').should('eq', 201);
    
    // 8. 验证确认页
    cy.url().should('match', /\/order\/\d+/);
    cy.get('[data-cy=success]')
      .should('be.visible')
      .and('contain', 'Order placed successfully');
  });
});
```

### 3. 表单验证

```typescript
describe('Form Validation', () => {
  beforeEach(() => {
    cy.visit('/contact');
  });
  
  it('validates email format', () => {
    cy.get('[data-cy=email]').type('invalid-email');
    cy.get('[data-cy=submit]').click();
    
    cy.get('[data-cy=email-error]')
      .should('be.visible')
      .and('contain', 'Invalid email format');
  });
  
  it('validates required fields', () => {
    cy.get('[data-cy=submit]').click();
    
    cy.get('[data-cy=name-error]').should('contain', 'Name is required');
    cy.get('[data-cy=email-error]').should('contain', 'Email is required');
    cy.get('[data-cy=message-error]').should('contain', 'Message is required');
  });
  
  it('submits valid form', () => {
    cy.intercept('POST', '/api/contact').as('submitForm');
    
    cy.get('[data-cy=name]').type('John Doe');
    cy.get('[data-cy=email]').type('john@example.com');
    cy.get('[data-cy=message]').type('Test message');
    cy.get('[data-cy=submit]').click();
    
    cy.wait('@submitForm');
    
    cy.get('[data-cy=success]')
      .should('be.visible')
      .and('contain', 'Message sent successfully');
  });
});
```

### 4. 搜索功能

```typescript
describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('searches products', () => {
    cy.intercept('GET', '/api/search?q=*').as('search');
    
    cy.get('[data-cy=search-input]').type('laptop');
    
    cy.wait('@search');
    
    cy.get('.search-result')
      .should('have.length.gt', 0)
      .each(($result) => {
        cy.wrap($result).should('contain.text', 'laptop');
      });
  });
  
  it('shows no results message', () => {
    cy.intercept('GET', '/api/search?q=*', {
      body: { results: [] },
    }).as('searchEmpty');
    
    cy.get('[data-cy=search-input]').type('nonexistent');
    
    cy.wait('@searchEmpty');
    
    cy.get('[data-cy=no-results]')
      .should('be.visible')
      .and('contain', 'No results found');
  });
  
  it('filters search results', () => {
    cy.get('[data-cy=search-input]').type('phone');
    cy.get('[data-cy=category-filter]').select('Electronics');
    cy.get('[data-cy=price-range]').invoke('val', 500).trigger('change');
    
    cy.get('.search-result').each(($result) => {
      cy.wrap($result).find('[data-cy=category]').should('contain', 'Electronics');
      cy.wrap($result).find('[data-cy=price]').invoke('text').then((price) => {
        const numPrice = parseFloat(price.replace('$', ''));
        expect(numPrice).to.be.lte(500);
      });
    });
  });
});
```

## 最佳实践

### 使用data-cy属性

```typescript
// ✅ 好的实践
<button data-cy="submit-button">Submit</button>
cy.get('[data-cy=submit-button]').click();

// ❌ 差的实践
<button className="btn btn-primary">Submit</button>
cy.get('.btn-primary').click();
```

### 避免硬编码等待

```typescript
// ❌ 差的实践
cy.wait(5000);
cy.get('.element').should('be.visible');

// ✅ 好的实践
cy.get('.element', { timeout: 10000 }).should('be.visible');
```

### 使用别名

```typescript
// ✅ 好的实践
cy.intercept('GET', '/api/users').as('getUsers');
cy.get('[data-cy=users-table]').as('usersTable');

cy.wait('@getUsers');
cy.get('@usersTable').should('be.visible');
```

### 组织测试代码

```typescript
// ✅ 好的实践 - 使用Page Object
class LoginPage {
  visit() {
    cy.visit('/login');
  }
  
  fillEmail(email: string) {
    cy.get('[data-cy=email]').type(email);
    return this;
  }
  
  fillPassword(password: string) {
    cy.get('[data-cy=password]').type(password);
    return this;
  }
  
  submit() {
    cy.get('[data-cy=submit]').click();
  }
}

const loginPage = new LoginPage();

it('logs in', () => {
  loginPage
    .visit()
    .fillEmail('user@example.com')
    .fillPassword('password')
    .submit();
});
```

## 调试技巧

### 使用调试命令

```typescript
describe('Debugging', () => {
  it('debugs test', () => {
    cy.visit('/');
    
    // 暂停执行
    cy.pause();
    
    // 调试
    cy.get('button').debug();
    
    // 打印日志
    cy.log('Testing button click');
    
    // 截图
    cy.screenshot('before-click');
    
    cy.get('button').click();
    
    cy.screenshot('after-click');
  });
});
```

### 时间旅行

Cypress Test Runner中每个命令都会创建快照,点击命令可以查看当时的DOM状态。

## CI/CD集成

### GitHub Actions

```yaml
name: Cypress Tests

on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
          browser: chrome
          record: true
          parallel: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Cypress提供了出色的开发体验和强大的测试能力。通过合理的测试策略和最佳实践,可以构建稳定可靠的端到端测试套件,确保应用在真实场景下的正确性。

## 组件测试

### 单个组件测试

```typescript
// Button.cy.tsx
import Button from './Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    cy.mount(<Button>Click me</Button>);
    cy.get('button').should('have.text', 'Click me');
  });
  
  it('handles click', () => {
    const onClickSpy = cy.spy().as('onClickSpy');
    cy.mount(<Button onClick={onClickSpy}>Click me</Button>);
    
    cy.get('button').click();
    cy.get('@onClickSpy').should('have.been.calledOnce');
  });
  
  it('supports variants', () => {
    cy.mount(<Button variant="primary">Primary</Button>);
    cy.get('button').should('have.class', 'btn-primary');
    
    cy.mount(<Button variant="secondary">Secondary</Button>);
    cy.get('button').should('have.class', 'btn-secondary');
  });
});
```

Cypress为React应用提供了完整的测试解决方案,无论是E2E测试还是组件测试,都能提供出色的开发体验和可靠的测试结果。

