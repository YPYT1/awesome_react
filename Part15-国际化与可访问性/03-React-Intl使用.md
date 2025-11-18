# React-Intl使用 - FormatJS国际化完整指南

## 1. React-Intl概述

### 1.1 什么是React-Intl

React-Intl是FormatJS的一部分,提供了React组件和API用于国际化。它基于ECMAScript国际化API(Intl),提供强大的格式化能力。

**核心特性:**
- 基于标准的Intl API
- 声明式组件API
- 丰富的格式化功能
- TypeScript支持
- 消息提取工具

### 1.2 与react-i18next对比

```typescript
const comparison = {
  'react-intl': {
    pros: ['标准化API', 'ICU消息格式', '强大格式化', 'CLI工具'],
    cons: ['学习曲线陡峭', '包体积较大'],
    bestFor: ['企业应用', '复杂格式化需求']
  },
  'react-i18next': {
    pros: ['简单易用', '灵活配置', '丰富插件'],
    cons: ['格式化功能较弱'],
    bestFor: ['快速开发', '中小型应用']
  }
};
```

## 2. 安装与配置

### 2.1 安装依赖

```bash
# 核心库
npm install react-intl

# 消息提取工具
npm install --save-dev @formatjs/cli

# TypeScript类型
npm install --save-dev @types/react-intl
```

### 2.2 基础配置

```tsx
// App.tsx
import { IntlProvider } from 'react-intl';
import messages_en from './translations/en.json';
import messages_zh from './translations/zh.json';

const messages: Record<string, any> = {
  'en': messages_en,
  'zh': messages_zh
};

function App() {
  const [locale, setLocale] = useState('en');
  
  return (
    <IntlProvider
      locale={locale}
      messages={messages[locale]}
      defaultLocale="en"
    >
      <Main />
    </IntlProvider>
  );
}
```

### 2.3 翻译文件格式

```json
// translations/en.json
{
  "app.welcome": "Welcome",
  "app.greeting": "Hello, {name}!",
  "app.itemCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
  "app.date": "Today is {date, date, long}",
  "app.price": "Price: {amount, number, currency}"
}

// translations/zh.json
{
  "app.welcome": "欢迎",
  "app.greeting": "你好，{name}！",
  "app.itemCount": "{count}个项目",
  "app.date": "今天是{date, date, long}",
  "app.price": "价格：{amount, number, currency}"
}
```

## 3. 基础使用

### 3.1 FormattedMessage组件

```tsx
import { FormattedMessage } from 'react-intl';

// 简单消息
function Welcome() {
  return (
    <h1>
      <FormattedMessage id="app.welcome" />
    </h1>
  );
}

// 带变量
function Greeting() {
  return (
    <p>
      <FormattedMessage
        id="app.greeting"
        values={{ name: 'John' }}
      />
    </p>
  );
}

// 默认消息(翻译缺失时显示)
function WithDefault() {
  return (
    <FormattedMessage
      id="app.message"
      defaultMessage="Default message"
    />
  );
}

// 描述(帮助翻译人员理解上下文)
function WithDescription() {
  return (
    <FormattedMessage
      id="app.submit"
      defaultMessage="Submit"
      description="Button to submit the form"
    />
  );
}
```

### 3.2 useIntl Hook

```tsx
import { useIntl } from 'react-intl';

function Component() {
  const intl = useIntl();
  
  // 格式化消息
  const message = intl.formatMessage({ id: 'app.welcome' });
  
  // 带变量
  const greeting = intl.formatMessage(
    { id: 'app.greeting' },
    { name: 'John' }
  );
  
  // 用于属性
  return (
    <div>
      <input
        placeholder={intl.formatMessage({ id: 'app.search' })}
        aria-label={intl.formatMessage({ id: 'app.searchLabel' })}
      />
      <h1>{message}</h1>
      <p>{greeting}</p>
    </div>
  );
}
```

### 3.3 defineMessages

```tsx
import { defineMessages, useIntl } from 'react-intl';

// 定义消息
const messages = defineMessages({
  welcome: {
    id: 'app.welcome',
    defaultMessage: 'Welcome'
  },
  greeting: {
    id: 'app.greeting',
    defaultMessage: 'Hello, {name}!',
    description: 'Greeting message'
  },
  submit: {
    id: 'app.submit',
    defaultMessage: 'Submit'
  }
});

// 使用
function Component() {
  const intl = useIntl();
  
  return (
    <div>
      <h1>{intl.formatMessage(messages.welcome)}</h1>
      <p>{intl.formatMessage(messages.greeting, { name: 'John' })}</p>
      <button>{intl.formatMessage(messages.submit)}</button>
    </div>
  );
}
```

## 4. 格式化功能

### 4.1 日期时间格式化

```tsx
import { FormattedDate, FormattedTime, FormattedRelativeTime } from 'react-intl';

function DateFormatting() {
  const date = new Date();
  
  return (
    <div>
      {/* 日期格式 */}
      <FormattedDate value={date} />
      <FormattedDate value={date} year="numeric" month="long" day="2-digit" />
      <FormattedDate value={date} dateStyle="full" />
      
      {/* 时间格式 */}
      <FormattedTime value={date} />
      <FormattedTime value={date} hour="2-digit" minute="2-digit" second="2-digit" />
      
      {/* 相对时间 */}
      <FormattedRelativeTime value={-1} unit="hour" />
      <FormattedRelativeTime value={2} unit="day" />
      <FormattedRelativeTime value={-30} unit="minute" updateIntervalInSeconds={1} />
    </div>
  );
}

// Hook方式
function DateHook() {
  const intl = useIntl();
  const date = new Date();
  
  const formatted = intl.formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const time = intl.formatTime(date);
  
  const relative = intl.formatRelativeTime(-1, 'hour');
  
  return (
    <div>
      <p>{formatted}</p>
      <p>{time}</p>
      <p>{relative}</p>
    </div>
  );
}
```

### 4.2 数字格式化

```tsx
import { FormattedNumber } from 'react-intl';

function NumberFormatting() {
  return (
    <div>
      {/* 基础数字 */}
      <FormattedNumber value={1234567.89} />
      
      {/* 百分比 */}
      <FormattedNumber value={0.157} style="percent" />
      
      {/* 货币 */}
      <FormattedNumber
        value={99.99}
        style="currency"
        currency="USD"
      />
      
      {/* 紧凑格式 */}
      <FormattedNumber
        value={1234567}
        notation="compact"
        compactDisplay="short"
      />
      
      {/* 单位 */}
      <FormattedNumber
        value={100}
        style="unit"
        unit="kilometer"
      />
    </div>
  );
}

// Hook方式
function NumberHook() {
  const intl = useIntl();
  
  const number = intl.formatNumber(1234567.89);
  const percent = intl.formatNumber(0.157, { style: 'percent' });
  const currency = intl.formatNumber(99.99, {
    style: 'currency',
    currency: 'USD'
  });
  
  return (
    <div>
      <p>{number}</p>
      <p>{percent}</p>
      <p>{currency}</p>
    </div>
  );
}
```

### 4.3 复数规则

```tsx
// ICU消息格式
const messages = {
  items: '{count, plural, =0 {No items} one {# item} other {# items}}'
};

function PluralExample() {
  return (
    <div>
      <FormattedMessage id="items" values={{ count: 0 }} />
      {/* 输出: No items */}
      
      <FormattedMessage id="items" values={{ count: 1 }} />
      {/* 输出: 1 item */}
      
      <FormattedMessage id="items" values={{ count: 5 }} />
      {/* 输出: 5 items */}
    </div>
  );
}

// 复杂复数
const complexMessages = {
  cart: `You have {itemCount, plural,
    =0 {no items}
    one {# item}
    other {# items}
  } and {productCount, plural,
    =0 {no products}
    one {# product}
    other {# products}
  } in your cart.`
};
```

### 4.4 选择格式

```tsx
// select格式
const messages = {
  gender: '{gender, select, male {He} female {She} other {They}} invited you',
  status: '{status, select, pending {⏳ Pending} approved {✅ Approved} rejected {❌ Rejected} other {Unknown}}'
};

function SelectExample() {
  return (
    <div>
      <FormattedMessage
        id="gender"
        values={{ gender: 'female' }}
      />
      {/* 输出: She invited you */}
      
      <FormattedMessage
        id="status"
        values={{ status: 'approved' }}
      />
      {/* 输出: ✅ Approved */}
    </div>
  );
}
```

## 5. 高级功能

### 5.1 富文本消息

```tsx
// 使用标签
const messages = {
  terms: 'I agree to the <link>terms and conditions</link>',
  bold: 'This is <b>bold</b> text',
  multiple: 'Click <link1>here</link1> or <link2>there</link2>'
};

function RichText() {
  return (
    <FormattedMessage
      id="terms"
      values={{
        link: (chunks) => <a href="/terms">{chunks}</a>
      }}
    />
  );
}

// 多个标签
function MultipleRichText() {
  return (
    <FormattedMessage
      id="multiple"
      values={{
        link1: (chunks) => <a href="/page1">{chunks}</a>,
        link2: (chunks) => <a href="/page2">{chunks}</a>
      }}
    />
  );
}

// 嵌套标签
function NestedRichText() {
  return (
    <FormattedMessage
      id="nested"
      defaultMessage="<p>This is <b>bold and <i>italic</i></b> text</p>"
      values={{
        p: (chunks) => <p>{chunks}</p>,
        b: (chunks) => <strong>{chunks}</strong>,
        i: (chunks) => <em>{chunks}</em>
      }}
    />
  );
}
```

### 5.2 自定义格式化

```tsx
// 配置自定义格式
<IntlProvider
  locale={locale}
  messages={messages}
  formats={{
    number: {
      USD: {
        style: 'currency',
        currency: 'USD'
      },
      EUR: {
        style: 'currency',
        currency: 'EUR'
      }
    },
    date: {
      short: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      },
      long: {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      }
    }
  }}
>
  <App />
</IntlProvider>

// 使用自定义格式
function CustomFormats() {
  return (
    <div>
      <FormattedNumber value={99.99} format="USD" />
      <FormattedDate value={new Date()} format="long" />
    </div>
  );
}
```

### 5.3 消息描述符

```tsx
// 类型安全的消息
interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
  description?: string;
}

const messages: Record<string, MessageDescriptor> = {
  welcome: {
    id: 'app.welcome',
    defaultMessage: 'Welcome to our app',
    description: 'Welcome message on homepage'
  },
  submit: {
    id: 'form.submit',
    defaultMessage: 'Submit',
    description: 'Submit button label'
  }
};

// 使用
function Component() {
  const intl = useIntl();
  
  return (
    <div>
      <h1>{intl.formatMessage(messages.welcome)}</h1>
      <button>{intl.formatMessage(messages.submit)}</button>
    </div>
  );
}
```

## 6. 消息提取

### 6.1 CLI工具

```bash
# 提取消息
npx formatjs extract 'src/**/*.{ts,tsx}' --out-file lang/en.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'

# 编译消息(优化)
npx formatjs compile lang/en.json --out-file compiled-lang/en.json

# 批处理
npm run extract:messages
```

```json
// package.json
{
  "scripts": {
    "extract:messages": "formatjs extract 'src/**/*.{ts,tsx}' --out-file lang/en.json",
    "compile:messages": "formatjs compile-folder lang compiled-lang"
  }
}
```

### 6.2 Babel插件

```bash
npm install --save-dev babel-plugin-formatjs
```

```javascript
// .babelrc
{
  "plugins": [
    ["formatjs", {
      "idInterpolationPattern": "[sha512:contenthash:base64:6]",
      "ast": true
    }]
  ]
}
```

### 6.3 自动生成ID

```tsx
// 使用默认消息自动生成ID
<FormattedMessage
  defaultMessage="Welcome to our app"
  description="Welcome message"
/>

// 提取后生成:
{
  "hak27d": {
    "defaultMessage": "Welcome to our app",
    "description": "Welcome message"
  }
}
```

## 7. TypeScript集成

### 7.1 类型定义

```typescript
// types/intl.d.ts
import { MessageDescriptor } from 'react-intl';
import en from '../translations/en.json';

type MessageKeys = keyof typeof en;

declare global {
  namespace FormatjsIntl {
    interface Message {
      ids: MessageKeys;
    }
  }
}
```

### 7.2 类型安全Hook

```typescript
// hooks/useTypedIntl.ts
import { useIntl } from 'react-intl';
import messages from '../translations/en.json';

type MessageId = keyof typeof messages;

export function useTypedIntl() {
  const intl = useIntl();
  
  return {
    t: (id: MessageId, values?: Record<string, any>) => 
      intl.formatMessage({ id }, values),
    formatDate: intl.formatDate,
    formatNumber: intl.formatNumber
  };
}

// 使用
function Component() {
  const { t } = useTypedIntl();
  
  // 类型检查和自动完成
  const text = t('app.welcome');
  
  return <div>{text}</div>;
}
```

## 8. 性能优化

### 8.1 消息编译

```bash
# 编译消息为AST格式
npx formatjs compile lang/en.json --out-file compiled-lang/en.json --ast
```

```tsx
// 使用编译后的消息
import compiledMessages from './compiled-lang/en.json';

<IntlProvider
  locale="en"
  messages={compiledMessages}
>
  <App />
</IntlProvider>
```

### 8.2 代码分割

```tsx
// 动态加载翻译
const loadMessages = async (locale: string) => {
  const messages = await import(`./translations/${locale}.json`);
  return messages.default;
};

function App() {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState({});
  
  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);
  
  if (!Object.keys(messages).length) {
    return <div>Loading...</div>;
  }
  
  return (
    <IntlProvider locale={locale} messages={messages}>
      <Main />
    </IntlProvider>
  );
}
```

### 8.3 缓存策略

```tsx
// 缓存翻译消息
const messagesCache = new Map<string, any>();

async function getCachedMessages(locale: string) {
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale);
  }
  
  const messages = await import(`./translations/${locale}.json`);
  messagesCache.set(locale, messages.default);
  
  return messages.default;
}
```

## 9. 测试

### 9.1 测试设置

```tsx
// test-utils.tsx
import { IntlProvider } from 'react-intl';
import { render, RenderOptions } from '@testing-library/react';
import messages from './translations/en.json';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <IntlProvider locale="en" messages={messages}>
      {children}
    </IntlProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### 9.2 组件测试

```tsx
// Component.test.tsx
import { render, screen } from './test-utils';
import Welcome from './Welcome';

describe('Welcome', () => {
  it('should render welcome message', () => {
    render(<Welcome />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
  
  it('should format number correctly', () => {
    render(<Welcome count={1234} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });
});
```

### 9.3 消息验证测试

```typescript
// messages.test.ts
import en from './translations/en.json';
import zh from './translations/zh.json';

describe('Translation messages', () => {
  it('should have same keys in all languages', () => {
    const enKeys = Object.keys(en).sort();
    const zhKeys = Object.keys(zh).sort();
    
    expect(enKeys).toEqual(zhKeys);
  });
  
  it('should have no empty values', () => {
    Object.values(en).forEach(value => {
      expect(value).toBeTruthy();
    });
  });
});
```

## 10. 实战示例

### 10.1 完整的表单组件

```tsx
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  nameLabel: {
    id: 'form.name.label',
    defaultMessage: 'Name'
  },
  namePlaceholder: {
    id: 'form.name.placeholder',
    defaultMessage: 'Enter your name'
  },
  nameRequired: {
    id: 'form.name.required',
    defaultMessage: 'Name is required'
  },
  emailLabel: {
    id: 'form.email.label',
    defaultMessage: 'Email'
  },
  submit: {
    id: 'form.submit',
    defaultMessage: 'Submit'
  },
  success: {
    id: 'form.success',
    defaultMessage: 'Form submitted successfully!'
  }
});

function ContactForm() {
  const intl = useIntl();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (values: any) => {
    const errors: Record<string, string> = {};
    
    if (!values.name) {
      errors.name = intl.formatMessage(messages.nameRequired);
    }
    
    return errors;
  };
  
  return (
    <form>
      <div>
        <label>{intl.formatMessage(messages.nameLabel)}</label>
        <input
          placeholder={intl.formatMessage(messages.namePlaceholder)}
          aria-label={intl.formatMessage(messages.nameLabel)}
        />
        {errors.name && <span>{errors.name}</span>}
      </div>
      
      <button type="submit">
        {intl.formatMessage(messages.submit)}
      </button>
    </form>
  );
}
```

### 10.2 语言切换器

```tsx
function LanguageSwitcher() {
  const intl = useIntl();
  const [locale, setLocaleState] = useState(intl.locale);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ];
  
  const changeLanguage = (newLocale: string) => {
    setLocaleState(newLocale);
    // 重新加载页面或更新IntlProvider
    window.location.reload();
  };
  
  return (
    <select value={locale} onChange={(e) => changeLanguage(e.target.value)}>
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

## 11. 最佳实践

```typescript
const bestPractices = {
  messages: [
    '使用有意义的ID命名',
    '提供defaultMessage和description',
    '使用defineMessages组织消息',
    '避免在消息中硬编码样式'
  ],
  
  formatting: [
    '使用ICU消息语法',
    '正确处理复数和性别',
    '使用标准日期时间格式',
    '货币格式包含货币代码'
  ],
  
  development: [
    '使用消息提取工具',
    '启用TypeScript类型检查',
    '测试所有语言',
    '监控缺失的翻译'
  ],
  
  performance: [
    '编译消息为AST',
    '按需加载翻译',
    '缓存翻译资源',
    '代码分割'
  ]
};
```

## 13. 高级ICU消息格式

### 13.1 复杂嵌套格式

```tsx
// 嵌套选择器
const messages = {
  'complex.message': '{gender, select, male {{count, plural, one {He has one item} other {He has {count} items}}} female {{count, plural, one {She has one item} other {She has {count} items}}} other {{count, plural, one {They have one item} other {They have {count} items}}}}'
};

// 使用
<FormattedMessage
  id="complex.message"
  values={{ gender: 'female', count: 5 }}
/>
// 输出: She has 5 items
```

### 13.2 ordinal选择器

```tsx
const messages = {
  'place': 'You finished {place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
};

<FormattedMessage id="place" values={{ place: 1 }} />
// 输出: You finished 1st

<FormattedMessage id="place" values={{ place: 2 }} />
// 输出: You finished 2nd
```

### 13.3 offset参数

```tsx
const messages = {
  'likes': '{count, plural, offset:1 =0 {No one likes this} =1 {You like this} one {You and one other person like this} other {You and # others like this}}'
};

<FormattedMessage id="likes" values={{ count: 0 }} />
// 输出: No one likes this

<FormattedMessage id="likes" values={{ count: 3 }} />
// 输出: You and 2 others like this
```

## 14. 性能优化深度实践

### 14.1 消息预编译

```bash
# 编译消息文件为AST
formatjs compile 'src/locales/en.json' --out-file 'src/locales/en.json.ast'
```

```tsx
// 加载预编译消息
import enAST from './locales/en.json.ast';

<IntlProvider messages={enAST} locale="en">
  <App />
</IntlProvider>
```

### 14.2 消息分包加载

```tsx
// 动态导入翻译
async function loadMessages(locale: string) {
  const messages = await import(`./locales/${locale}.json`);
  return messages.default;
}

function App() {
  const [messages, setMessages] = useState(null);
  const [locale, setLocale] = useState('en');
  
  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);
  
  if (!messages) return <Loading />;
  
  return (
    <IntlProvider messages={messages} locale={locale}>
      <MainApp />
    </IntlProvider>
  );
}
```

### 14.3 消息缓存策略

```tsx
const messageCache = new Map<string, Record<string, string>>();

async function getCachedMessages(locale: string) {
  if (messageCache.has(locale)) {
    return messageCache.get(locale)!;
  }
  
  const messages = await loadMessages(locale);
  messageCache.set(locale, messages);
  return messages;
}
```

## 15. 实战最佳实践

### 15.1 大型项目消息组织

```
locales/
├── en/
│   ├── common.json
│   ├── dashboard.json
│   ├── products.json
│   ├── users.json
│   └── settings.json
├── zh/
│   ├── common.json
│   ├── dashboard.json
│   ├── products.json
│   ├── users.json
│   └── settings.json
└── index.ts
```

```typescript
// locales/index.ts
export async function loadLocaleData(locale: string, module: string) {
  const messages = await import(`./${locale}/${module}.json`);
  return messages.default;
}

// 使用
const dashboardMessages = await loadLocaleData('en', 'dashboard');
```

### 15.2 翻译管理工作流

```typescript
// scripts/extract-messages.ts
import { extract } from '@formatjs/cli';
import glob from 'glob';
import fs from 'fs';

async function extractMessages() {
  const files = glob.sync('src/**/*.{ts,tsx}');
  
  const extracted = await extract(files, {
    idInterpolationPattern: '[sha512:contenthash:base64:6]'
  });
  
  const messages = JSON.parse(extracted);
  
  // 输出到待翻译文件
  fs.writeFileSync(
    'locales/messages.json',
    JSON.stringify(messages, null, 2)
  );
  
  console.log(`提取了 ${Object.keys(messages).length} 条消息`);
}

extractMessages();
```

### 15.3 翻译完整性检查

```typescript
// scripts/check-translations.ts
import en from '../locales/en.json';
import zh from '../locales/zh.json';
import fr from '../locales/fr.json';

function checkTranslations() {
  const locales = { en, zh, fr };
  const baseKeys = new Set(Object.keys(en));
  
  const report: Record<string, string[]> = {};
  
  Object.entries(locales).forEach(([locale, messages]) => {
    const currentKeys = new Set(Object.keys(messages));
    const missing = [...baseKeys].filter(key => !currentKeys.has(key));
    const extra = [...currentKeys].filter(key => !baseKeys.has(key));
    
    if (missing.length > 0 || extra.length > 0) {
      report[locale] = [
        ...missing.map(k => `缺少: ${k}`),
        ...extra.map(k => `多余: ${k}`)
      ];
    }
  });
  
  if (Object.keys(report).length > 0) {
    console.error('翻译完整性检查失败:', report);
    process.exit(1);
  }
  
  console.log('✓ 所有翻译完整');
}

checkTranslations();
```

## 16. 常见问题与解决方案

### 16.1 消息未定义

```tsx
// 问题: 消息ID不存在
<FormattedMessage id="non.existent.key" />

// 解决: 提供默认消息
<FormattedMessage
  id="non.existent.key"
  defaultMessage="Default text"
/>

// 或全局处理
<IntlProvider
  messages={messages}
  locale={locale}
  onError={(err) => {
    if (err.code === 'MISSING_TRANSLATION') {
      console.warn('Missing translation:', err.descriptor.id);
      return; // 不抛出错误
    }
    throw err;
  }}
>
  <App />
</IntlProvider>
```

### 16.2 格式化性能问题

```tsx
// 问题: 重复格式化
function BadComponent() {
  return (
    <div>
      {items.map(item => (
        <FormattedNumber value={item.price} style="currency" currency="USD" />
      ))}
    </div>
  );
}

// 解决: 使用formatNumber
function GoodComponent() {
  const intl = useIntl();
  
  return (
    <div>
      {items.map(item => (
        <span>{intl.formatNumber(item.price, { style: 'currency', currency: 'USD' })}</span>
      ))}
    </div>
  );
}
```

### 16.3 富文本嵌入

```tsx
// 嵌入React组件
const messages = {
  'agreement': 'By signing up, you agree to our <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>'
};

<FormattedMessage
  id="agreement"
  values={{
    terms: (chunks) => <Link to="/terms">{chunks}</Link>,
    privacy: (chunks) => <Link to="/privacy">{chunks}</Link>
  }}
/>
```

## 17. 与其他库集成

### 17.1 与React Router集成

```tsx
// 多语言路由
import { useParams, Navigate } from 'react-router-dom';

function LocaleRoute() {
  const { locale } = useParams<{ locale: string }>();
  const supportedLocales = ['en', 'zh', 'fr'];
  
  if (!supportedLocales.includes(locale!)) {
    return <Navigate to="/en" replace />;
  }
  
  return (
    <IntlProvider messages={messages[locale]} locale={locale}>
      <App />
    </IntlProvider>
  );
}

// 路由配置
<Routes>
  <Route path="/:locale/*" element={<LocaleRoute />} />
  <Route path="*" element={<Navigate to="/en" replace />} />
</Routes>
```

### 17.2 与Form库集成

```tsx
// 表单验证消息国际化
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

function SignupForm() {
  const intl = useIntl();
  const { register, formState: { errors } } = useForm();
  
  return (
    <form>
      <input
        {...register('email', {
          required: intl.formatMessage({ id: 'validation.email.required' }),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: intl.formatMessage({ id: 'validation.email.invalid' })
          }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

### 17.3 与状态管理集成

```tsx
// Redux集成
import { createSlice } from '@reduxjs/toolkit';

const i18nSlice = createSlice({
  name: 'i18n',
  initialState: {
    locale: 'en',
    messages: {}
  },
  reducers: {
    setLocale: (state, action) => {
      state.locale = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    }
  }
});

// 使用
function App() {
  const { locale, messages } = useSelector((state) => state.i18n);
  
  return (
    <IntlProvider messages={messages} locale={locale}>
      <MainApp />
    </IntlProvider>
  );
}
```

## 12. 总结

React-Intl的关键要点:

1. **标准化**: 基于ECMAScript Intl API
2. **ICU格式**: 强大的消息格式化语法
3. **类型安全**: 完整的TypeScript支持
4. **工具链**: 消息提取和编译工具
5. **性能**: AST编译和按需加载
6. **测试**: 完善的测试工具支持
7. **高级特性**: 复杂嵌套、消息分包
8. **最佳实践**: 消息组织、翻译管理
9. **问题解决**: 常见问题及解决方案
10. **集成**: 与主流库无缝集成

通过正确使用React-Intl,可以构建专业级的国际化React应用。

## 扩展阅读

- [React-Intl官方文档](https://formatjs.io/docs/react-intl/)
- [ICU消息格式](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [FormatJS CLI](https://formatjs.io/docs/tooling/cli/)
- [国际化最佳实践](https://developers.google.com/international)

